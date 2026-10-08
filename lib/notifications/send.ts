// RTM OS — Notification sender
//
// Every notification insert goes through createNotification().
// If the insert fails it logs the error and returns null — it never throws.
// Callers that fire notifications as a side-effect of another action must
// wrap the send in try/catch if they need silence, but the sender itself
// already swallows errors so a broken notification never breaks the
// triggering action.
//
// Escalation helpers sit here too so all notification logic is in one place.

import { prisma } from "@/lib/db/prisma";

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeId(): string {
  return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Core sender ────────────────────────────────────────────────────────────────

export interface NotificationInput {
  recipientId:  string;
  type:         string;
  message:      string;
  link:         string;
  // Escalation fields — omit for plain notifications
  concernAboutType?:   "project" | "task" | "client";
  concernAboutId?:     string;
  raisedById?:         string;
  escalationLevel?:    1 | 2;
  escalationParentId?: string;
}

/**
 * Insert one notification row. Never throws.
 * Returns the created id on success, null on failure.
 */
export async function createNotification(
  input: NotificationInput,
): Promise<string | null> {
  try {
    const id = makeId();
    await prisma.notification.create({
      data: {
        id,
        recipientId:         input.recipientId,
        type:                input.type,
        message:             input.message,
        link:                input.link,
        concernAboutType:    input.concernAboutType   ?? null,
        concernAboutId:      input.concernAboutId     ?? null,
        raisedById:          input.raisedById         ?? null,
        escalationLevel:     input.escalationLevel    ?? null,
        escalationParentId:  input.escalationParentId ?? null,
      },
    });
    return id;
  } catch (err) {
    console.error("[notifications] createNotification failed:", err);
    return null;
  }
}

// ── Task-assignment sender ─────────────────────────────────────────────────────

/**
 * Notify a user that a task has been assigned to them.
 * Called from launchProject after each task insert.
 * No-ops if ownerId is null (unassigned task — no notification).
 */
export async function notifyTaskAssigned(opts: {
  ownerId:  string | null;
  taskId:   string;
  taskLabel: string;
  projectId: string;
  projectName: string;
}): Promise<void> {
  if (!opts.ownerId) return;
  await createNotification({
    recipientId: opts.ownerId,
    type:        "task_assigned",
    message:     `You have been assigned a new task: "${opts.taskLabel}" on project ${opts.projectName}.`,
    link:        `/tasks`,
  });
}

// ── Escalation sender ──────────────────────────────────────────────────────────

/**
 * Raise a concern about a project, task, or client.
 *
 * Department routing: we use the RAISER's department to find the manager.
 * Reasoning: the concern is raised by someone who works in a department.
 * If a Billing member flags a billing problem, the Billing manager must
 * see it. If they flag someone else's department, the Billing manager
 * is still the first responsible manager — cross-department escalation
 * (to the thing's owning department) is not built in this run.
 *
 * No-manager fallback: if the raiser's department has no manager, the
 * notification is sent to every Executive (role = "Executive"). If there
 * are no Executives either, we log the failure and return an error string.
 * The concern is never silently swallowed.
 *
 * Returns: { notifId, recipientId, recipientName, level: 1 } on success,
 *          or { error: string } on failure.
 */
export async function raiseEscalation(opts: {
  raisedById:        string;
  concernAboutType:  "project" | "task" | "client";
  concernAboutId:    string;
  message:           string;
  link:              string;
}): Promise<
  | { notifId: string; recipientId: string; recipientName: string; level: 1 }
  | { error: string }
> {
  // 1. Find the raiser to determine their department.
  const raiser = await prisma.user.findUnique({
    where:  { id: opts.raisedById },
    select: { id: true, name: true, department: true },
  });
  if (!raiser) return { error: "Raiser not found." };

  let recipient: { id: string; name: string } | null = null;

  if (raiser.department) {
    // 2a. Look for the manager of the raiser's department.
    const manager = await prisma.user.findFirst({
      where:  { department: raiser.department, role: "Manager", status: "active" },
      select: { id: true, name: true },
    });
    if (manager) recipient = manager;
  }

  if (!recipient) {
    // 2b. No manager found (empty department or no department on raiser).
    //     Escalate directly to an Executive.
    const exec = await prisma.user.findFirst({
      where:  { role: "Executive", status: "active" },
      select: { id: true, name: true },
    });
    if (exec) {
      recipient = exec;
    } else {
      // No executive either. Try SystemAdmin as last resort.
      const sa = await prisma.user.findFirst({
        where:  { role: "SystemAdmin", status: "active" },
        select: { id: true, name: true },
      });
      if (sa) {
        recipient = sa;
      } else {
        return { error: "No manager, Executive, or SystemAdmin found to receive this escalation." };
      }
    }
  }

  const notifId = await createNotification({
    recipientId:       recipient.id,
    type:              "concern_raised",
    message:           opts.message,
    link:              opts.link,
    concernAboutType:  opts.concernAboutType,
    concernAboutId:    opts.concernAboutId,
    raisedById:        opts.raisedById,
    escalationLevel:   1,
  });

  if (!notifId) return { error: "Notification insert failed." };

  return {
    notifId,
    recipientId:   recipient.id,
    recipientName: recipient.name,
    level: 1,
  };
}

/**
 * Escalate an existing level-1 concern to an Executive.
 *
 * How it is triggered (no scheduler): the raiser or the manager who received
 * the original notification decides to escalate further. They press "Escalate
 * to Executive" on the notification detail view. That calls this function
 * with the original notification id. There is no time-based trigger.
 *
 * We chose manual escalation because:
 *   - There is no scheduler in the system.
 *   - A cron job is explicitly ruled out.
 *   - The person closest to the situation knows when it needs to go up.
 *
 * Returns: { notifId, recipientId, recipientName, level: 2 } on success,
 *          or { error: string }.
 */
export async function escalateToExecutive(opts: {
  parentNotifId: string;
  escalatedById: string;
}): Promise<
  | { notifId: string; recipientId: string; recipientName: string; level: 2 }
  | { error: string }
> {
  const parent = await prisma.notification.findUnique({
    where:  { id: opts.parentNotifId },
    select: {
      id: true, type: true, concernAboutType: true, concernAboutId: true,
      raisedById: true, escalationLevel: true, message: true, link: true,
    },
  });
  if (!parent)                      return { error: "Parent notification not found." };
  if (parent.escalationLevel !== 1) return { error: "Can only escalate a level-1 concern." };

  // Check that a level-2 row doesn't already exist for this parent.
  const existing = await prisma.notification.findFirst({
    where: { escalationParentId: opts.parentNotifId, escalationLevel: 2 },
  });
  if (existing) return { error: "This concern has already been escalated to an Executive." };

  // Find an Executive.
  const exec = await prisma.user.findFirst({
    where:  { role: "Executive", status: "active" },
    select: { id: true, name: true },
  });
  if (!exec) return { error: "No active Executive found." };

  const notifId = await createNotification({
    recipientId:         exec.id,
    type:                "concern_escalated",
    message:             `[Escalated] ${parent.message}`,
    link:                parent.link,
    concernAboutType:    (parent.concernAboutType as "project" | "task" | "client") ?? undefined,
    concernAboutId:      parent.concernAboutId ?? undefined,
    raisedById:          parent.raisedById ?? undefined,
    escalationLevel:     2,
    escalationParentId:  parent.id,
  });

  if (!notifId) return { error: "Notification insert failed." };

  return {
    notifId,
    recipientId:   exec.id,
    recipientName: exec.name,
    level: 2,
  };
}

/**
 * Resolve an escalation chain.
 *
 * Who can resolve: the recipient of the notification (the manager or executive
 * who received it) or a SystemAdmin.
 *
 * What happens: resolved_at and resolved_by_id are set on the notification row
 * (and on its child level-2 row if one exists). A final "concern_resolved"
 * notification is sent to the original raiser so they know.
 */
export async function resolveEscalation(opts: {
  notifId:     string;
  resolvedById: string;
}): Promise<{ ok: true } | { error: string }> {
  const notif = await prisma.notification.findUnique({
    where:  { id: opts.notifId },
    select: {
      id: true, recipientId: true, raisedById: true,
      escalationLevel: true, escalationParentId: true,
      concernAboutType: true, concernAboutId: true, link: true,
      resolvedAt: true,
    },
  });
  if (!notif) return { error: "Notification not found." };
  if (notif.resolvedAt) return { error: "Already resolved." };

  // Permission: recipient or SystemAdmin.
  const resolver = await prisma.user.findUnique({
    where:  { id: opts.resolvedById },
    select: { id: true, name: true, role: true },
  });
  if (!resolver) return { error: "Resolver not found." };

  const canResolve =
    resolver.id === notif.recipientId ||
    resolver.role === "SystemAdmin";
  if (!canResolve) return { error: "You are not authorised to resolve this escalation." };

  const now = new Date();

  // Resolve this row.
  await prisma.notification.update({
    where: { id: notif.id },
    data:  { resolvedAt: now, resolvedById: resolver.id },
  });

  // Also resolve the parent if this is a level-2 row (keeping the chain in sync).
  if (notif.escalationLevel === 2 && notif.escalationParentId) {
    await prisma.notification.update({
      where: { id: notif.escalationParentId },
      data:  { resolvedAt: now, resolvedById: resolver.id },
    }).catch(() => { /* non-fatal if parent already resolved */ });
  }
  // Also resolve the child level-2 if this is a level-1 row.
  if (notif.escalationLevel === 1) {
    const child = await prisma.notification.findFirst({
      where: { escalationParentId: notif.id, escalationLevel: 2 },
    });
    if (child && !child.resolvedAt) {
      await prisma.notification.update({
        where: { id: child.id },
        data:  { resolvedAt: now, resolvedById: resolver.id },
      }).catch(() => { /* non-fatal */ });
    }
  }

  // Notify the original raiser.
  if (notif.raisedById) {
    await createNotification({
      recipientId: notif.raisedById,
      type:        "concern_resolved",
      message:     `Your concern has been resolved by ${resolver.name}.`,
      link:        notif.link,
    });
  }

  return { ok: true };
}
