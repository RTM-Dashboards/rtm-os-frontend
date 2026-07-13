"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { use } from "react";
import {
  getProject,
  getMilestonesForProject,
  getTasksForProject,
  BLUEPRINTS,
  type Project as EngineProject,
  type Milestone,
  type Task,
  type TaskBlueprint,
  type DepartmentName,
  getBlueprint,
  type ProjectStatus,
  type ProjectHealth,
  type MilestoneStatus,
  type TaskStatus,
  type TaskPriority,
  type TaskSource,
  type TaskType,
  type ActivityEntry,
  USERS,
} from "@/lib/engine";
import { appendToEngineStore, updateProject } from "@/lib/engine/api";
import { fetchMasterClient } from "@/lib/mock/master-clients-api";
import type { MasterClient, BillingStatus, PaymentStatus } from "@/lib/mock/master-clients";
import type { ProjectDepartment } from "@/lib/engine/types";
import type { AMOnboardingRecord } from "@/lib/mock/am-onboarding-store";
import { OnboardingSummaryPanel } from "@/components/account-management/OnboardingSummaryPanel";

// =============================================================================
// RTM OS — Project Detail Page
// Route: /projects/[id]
// =============================================================================

type Tab =
  | "overview"
  | "milestones"
  | "departments"
  | "tasks"
  | "dependencies"
  | "timeline"
  | "health";

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const STATUS_CFG: Record<ProjectStatus, { bg: string; color: string; border: string; dot: string }> = {
  "Draft":              { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0", dot: "#CBD5E1" },
  "Ready to Launch":    { bg: "#ECFEFF", color: "#0E7490", border: "#A5F3FC", dot: "#06B6D4" },
  "Launched":           { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE", dot: "#3B82F6" },
  "In Progress":        { bg: "#FEF9C3", color: "#A16207", border: "#FDE68A", dot: "#EAB308" },
  "Blocked":            { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", dot: "#EF4444" },
  "Pending Client":     { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA", dot: "#F97316" },
  "Pending Department": { bg: "#FAF5FF", color: "#6D28D9", border: "#DDD6FE", dot: "#8B5CF6" },
  "Completed":          { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0", dot: "#10B981" },
  "Cancelled":          { bg: "#F8FAFC", color: "#94A3B8", border: "#E4E8F0", dot: "#CBD5E1" },
};

const HEALTH_CFG: Record<ProjectHealth, { bg: string; color: string }> = {
  "Green":  { bg: "#ECFDF5", color: "#059669" },
  "Yellow": { bg: "#FFFBEB", color: "#D97706" },
  "Red":    { bg: "#FEF2F2", color: "#DC2626" },
};

const MS_CFG: Record<MilestoneStatus, { bg: string; color: string; border: string }> = {
  "Not Started": { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" },
  "In Progress": { bg: "#FEF9C3", color: "#A16207", border: "#FDE68A" },
  "Blocked":     { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  "Completed":   { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" },
};

const TS_CFG: Record<TaskStatus, { bg: string; color: string; dot: string }> = {
  "Open":       { bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6" },
  "In Progress":{ bg: "#FEF9C3", color: "#A16207", dot: "#EAB308" },
  "Waiting":    { bg: "#F8FAFC", color: "#64748B", dot: "#94A3B8" },
  "Review":     { bg: "#FAF5FF", color: "#6D28D9", dot: "#8B5CF6" },
  "Blocked":    { bg: "#FEF2F2", color: "#DC2626", dot: "#EF4444" },
  "Completed":  { bg: "#ECFDF5", color: "#059669", dot: "#10B981" },
  "Cancelled":  { bg: "#F8FAFC", color: "#94A3B8", dot: "#CBD5E1" },
};

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  Low: "#64748B", Medium: "#D97706", High: "#DC2626", Urgent: "#7C3AED",
};

// ---------------------------------------------------------------------------
// Small components
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: ProjectStatus }) {
  const c = STATUS_CFG[status];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap"
      style={{ background: c.bg, color: c.color, borderColor: c.border }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
      {status}
    </span>
  );
}

function MsBadge({ status }: { status: MilestoneStatus }) {
  const c = MS_CFG[status];
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap"
      style={{ background: c.bg, color: c.color, borderColor: c.border }}>
      {status}
    </span>
  );
}

function TsBadge({ status }: { status: TaskStatus }) {
  const c = TS_CFG[status];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap"
      style={{ background: c.bg, color: c.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
      {status}
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["#1B4FD8","#059669","#7C3AED","#D97706","#DC2626","#0891B2","#BE185D"];
  const bg = colors[name.charCodeAt(0) % colors.length];
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-[10px] font-bold flex-shrink-0"
      style={{ background: bg }}>{initials}</span>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg p-3" style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)" }}>
      <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--rtm-text-muted)" }}>{label}</div>
      <div className="text-sm font-medium" style={{ color: "var(--rtm-text-primary)" }}>{value}</div>
    </div>
  );
}

function ActivityIcon({ type }: { type: ActivityEntry["eventType"] }) {
  const MAP: Partial<Record<ActivityEntry["eventType"], string>> = {
    "Project Created":    "#1D4ED8",
    "Task Generated":     "#7C3AED",
    "Task Assigned":      "#0891B2",
    "Task Completed":     "#059669",
    "Milestone Reached":  "#059669",
    "Blueprint Applied":  "#7C3AED",
    "Invoice Paid":       "#059669",
    "Blocker Added":      "#DC2626",
    "Blocker Resolved":   "#059669",
    "Status Changed":     "#D97706",
    "Department Activated":"#0891B2",
  };
  const color = MAP[type] ?? "#64748B";
  return <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: color }} />;
}

// ---------------------------------------------------------------------------
// BillingStatusBadge — shows the client's real billing/payment status
// ---------------------------------------------------------------------------

interface BillingStatusBadgeProps {
  billingStatus: BillingStatus;
  paymentStatus: PaymentStatus;
  compact?: boolean;
}

function BillingStatusBadge({ billingStatus, paymentStatus, compact }: BillingStatusBadgeProps) {
  // Determine dominant display status and styling
  type Variant = "paid" | "pending" | "overdue" | "cleared" | "closed" | "unpaid";
  let variant: Variant = "pending";
  let label: string = billingStatus;

  if (billingStatus === "Paid" || billingStatus === "Cleared") {
    variant = billingStatus === "Cleared" ? "cleared" : "paid";
  } else if (billingStatus === "Overdue" || paymentStatus === "Overdue") {
    variant = "overdue";
  } else if (billingStatus === "Closed") {
    variant = "closed";
  } else if (paymentStatus === "Unpaid") {
    variant = "unpaid";
    label = "Unpaid";
  } else {
    variant = "pending";
  }

  const CFG: Record<Variant, { bg: string; color: string; border: string; dot: string; icon: string }> = {
    paid:    { bg: "#ECFDF5", color: "#065F46", border: "#6EE7B7", dot: "#10B981", icon: "✓" },
    cleared: { bg: "#F0FDF4", color: "#166534", border: "#86EFAC", dot: "#22C55E", icon: "✓" },
    pending: { bg: "#FFFBEB", color: "#92400E", border: "#FDE68A", dot: "#F59E0B", icon: "◐" },
    unpaid:  { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A", dot: "#F59E0B", icon: "◐" },
    overdue: { bg: "#FEF2F2", color: "#991B1B", border: "#FECACA", dot: "#EF4444", icon: "⚠" },
    closed:  { bg: "#F8FAFC", color: "#475569", border: "#E2E8F0", dot: "#94A3B8", icon: "—" },
  };

  const c = CFG[variant];

  if (compact) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap"
        style={{ background: c.bg, color: c.color, borderColor: c.border }}
      >
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.dot }} />
        Billing: {label}
      </span>
    );
  }

  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3 border"
      style={{ background: c.bg, borderColor: c.border }}
    >
      <span className="text-lg font-black" style={{ color: c.color }}>{c.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: c.color }}>Billing Status</div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold" style={{ color: c.color }}>{label}</span>
          {paymentStatus !== "N/A" && paymentStatus !== billingStatus && (
            <span className="text-xs" style={{ color: c.color }}>· Payment: {paymentStatus}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// OnboardingSummaryPanel is now a shared component imported above.


// ---------------------------------------------------------------------------
// Task generation helper (Part 3B — shared with wizard logic)
// ---------------------------------------------------------------------------

// ID helpers — timestamp-based so they survive server restarts without collisions.
function genBpId(prefix: string): string {
  const ts  = Date.now().toString(16);
  const rnd = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, "0");
  return `${prefix}-${ts}-${rnd}`;
}

function generateTasksForBlueprint(
  blueprint:   TaskBlueprint,
  projectId:   string,
  milestoneId: string,
  clientName:  string,
  projectName: string,
  assignedAM:  string
): Task[] {
  const now = new Date().toISOString();
  return blueprint.tasks.map((bpt) => {
    const tid = genBpId("tsk-addbp");
    return {
      id:               tid,
      projectId,
      milestoneId,
      blueprintId:      blueprint.id,
      title:            bpt.name,
      type:             "One-Time" as const,
      source:           "Task Blueprint" as const,
      department:       bpt.department as DepartmentName,
      service:          blueprint.mappedLineItem,
      assignedUserName: assignedAM || "Unassigned",
      createdById:      "u3",
      createdByName:    "Add Blueprint Action",
      status:           "Open" as const,
      priority:         bpt.priority,
      dueDate:          new Date(Date.now() + bpt.dueDaysOffset * 86400000).toISOString().split("T")[0],
      estimatedHours:   bpt.estimatedHours,
      dependencies:     [],
      notes:            [],
      files:            [],
      automationHistory: [],
      createdAt:        now,
      updatedAt:        now,
      clientName,
      projectName,
      description:      bpt.description,
    };
  });
}

// ---------------------------------------------------------------------------
// AddBlueprintModal (Part 3B)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Contracted-service check helper (Fix 4)
// ---------------------------------------------------------------------------

/**
 * Returns true when the blueprint's mappedLineItem or department name has a
 * case-insensitive substring overlap with any of the client's activeServices.
 * Both directions are checked: service ⊆ lineItem and lineItem ⊆ service.
 */
function isBlueprintContracted(bp: TaskBlueprint, client: MasterClient | null): boolean {
  if (!client || client.activeServices.length === 0) return false;
  const needle = bp.mappedLineItem.toLowerCase();
  const dept   = bp.department.toLowerCase();
  return client.activeServices.some((svc) => {
    const s = svc.toLowerCase();
    return s.includes(needle) || needle.includes(s) || s.includes(dept) || dept.includes(s);
  });
}

// ---------------------------------------------------------------------------
// AddBlueprintModal
// ---------------------------------------------------------------------------

interface AddBlueprintModalProps {
  project:     EngineProject;
  liveTasks:   Task[];
  liveMilestones: Milestone[];
  onClose:     () => void;
  onAdded:     (newTasks: Task[], milestone: Milestone | null) => void;
}

function AddBlueprintModal({ project, liveTasks, liveMilestones, onClose, onAdded }: AddBlueprintModalProps) {
  const [selectedBpId, setSelectedBpId] = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [success,      setSuccess]      = useState(false);

  // Fix 4 — load client record to check contracted services
  const [clientRecord, setClientRecord] = useState<MasterClient | null>(null);
  useEffect(() => {
    if (project.clientId) {
      fetchMasterClient(project.clientId)
        .then((c) => setClientRecord(c))
        .catch(() => setClientRecord(null));
    }
  }, [project.clientId]);

  // Blueprints already applied to this project (by checking existing task blueprintIds)
  const appliedBpIds = useMemo(
    () => new Set(liveTasks.map((t) => t.blueprintId).filter(Boolean) as string[]),
    [liveTasks]
  );

  const availableBlueprints = useMemo(
    () => BLUEPRINTS.filter((bp) => !appliedBpIds.has(bp.id)),
    [appliedBpIds]
  );

  const selectedBp = useMemo(
    () => BLUEPRINTS.find((bp) => bp.id === selectedBpId) ?? null,
    [selectedBpId]
  );

  // Fix 4 — is the currently selected blueprint contracted?
  const selectedIsContracted = useMemo(
    () => selectedBp ? isBlueprintContracted(selectedBp, clientRecord) : false,
    [selectedBp, clientRecord]
  );

  const handleAdd = useCallback(async () => {
    if (!selectedBp) return;
    setSubmitting(true);
    setError(null);

    try {
      // Use existing milestone if one exists, otherwise create a new one
      const existingMs = liveMilestones[0] ?? null;
      let targetMilestone: Milestone;
      let newMilestoneToWrite: Milestone | null = null;

      if (existingMs) {
        targetMilestone = existingMs;
      } else {
        const now = new Date().toISOString();
        targetMilestone = {
          id:         genBpId("ms-addbp"),
          projectId:  project.id,
          name:       "Service Launch",
          owner:      project.accountManager,
          status:     "In Progress",
          startDate:  now.split("T")[0],
          dueDate:    new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
          progress:   0,
          taskIds:    [],
          blueprintId: selectedBp.id,
        };
        newMilestoneToWrite = targetMilestone;
      }

      const newTasks = generateTasksForBlueprint(
        selectedBp,
        project.id,
        targetMilestone.id,
        project.client,
        project.name,
        project.accountManager
      );

      if (newTasks.length === 0) {
        setError("Selected blueprint has no tasks defined.");
        setSubmitting(false);
        return;
      }

      // Append to file-backed store
      await appendToEngineStore({
        tasks:      newTasks,
        milestones: newMilestoneToWrite ? [newMilestoneToWrite] : [],
      });

      const now        = new Date().toISOString();
      const newTaskIds = newTasks.map((t) => t.id);

      // ── Fix 1: Build updated departments[] ─────────────────────────────────
      // Collect the unique department names touched by the new tasks.
      const newDeptNames = Array.from(new Set(newTasks.map((t) => t.department)));

      // Clone existing departments so we can mutate safely.
      const updatedDepartments: ProjectDepartment[] = (project.departments ?? []).map((d) => ({ ...d }));

      for (const deptName of newDeptNames) {
        const existingIdx = updatedDepartments.findIndex((d) => d.department === deptName);
        const deptTaskIds  = newTasks.filter((t) => t.department === deptName).map((t) => t.id);

        if (existingIdx >= 0) {
          // Department already exists — merge taskIds, ensure Active, preserve activatedAt
          const existing = updatedDepartments[existingIdx];
          updatedDepartments[existingIdx] = {
            ...existing,
            taskIds:          [...existing.taskIds, ...deptTaskIds],
            activationStatus: "Active",
            // Keep the original activatedAt if the dept was already activated;
            // set it now only if it was never set before.
            activatedAt: existing.activatedAt ?? now,
          };
        } else {
          // New department — create a complete ProjectDepartment entry
          updatedDepartments.push({
            department:       deptName,
            owner:            project.accountManager || "Unassigned",
            taskIds:          deptTaskIds,
            escalationStatus: "None",
            activationStatus: "Active",
            activatedAt:      now,
          });
        }
      }
      // ── End Fix 1 ───────────────────────────────────────────────────────────

      // Update project: taskIds, departments, activity log
      const updatedTaskIds  = [...(project.taskIds ?? []), ...newTaskIds];
      const bpActivityEntry = {
        id:          genBpId("act-addbp"),
        projectId:   project.id,
        eventType:   "Blueprint Applied" as const,
        description: `Blueprint "${selectedBp.name}" applied. ${newTasks.length} new tasks generated.`,
        actorName:   project.accountManager || "Account Manager",
        timestamp:   now,
      };
      const deptActivityEntries = newDeptNames.map((deptName) => ({
        id:          genBpId("act-deptact"),
        projectId:   project.id,
        eventType:   "Department Activated" as const,
        description: `${deptName} activated via Add Blueprint (${selectedBp.name}).`,
        actorName:   project.accountManager || "Account Manager",
        timestamp:   now,
      }));

      await updateProject(project.id, {
        taskIds:     updatedTaskIds,
        departments: updatedDepartments,
        activityLog: [
          ...(project.activityLog ?? []),
          bpActivityEntry,
          ...deptActivityEntries,
        ],
        updatedAt:   now,
      });

      setSuccess(true);
      onAdded(newTasks, newMilestoneToWrite);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }, [selectedBp, project, liveTasks, liveMilestones, onAdded]);

  if (success && selectedBp) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="rounded-2xl border border-emerald-200 bg-white shadow-xl p-8 max-w-md w-full mx-4 space-y-4">
          <div className="text-center space-y-2">
            <div className="text-4xl">✅</div>
            <h2 className="text-lg font-bold" style={{ color: "var(--rtm-text-primary)" }}>Blueprint Added</h2>
            <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
              <strong>{selectedBp.name}</strong> has been applied to this project.
              Refresh to see the new tasks in the Tasks tab.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full rounded-lg px-4 py-2.5 text-sm font-bold text-white"
            style={{ background: "#059669" }}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="rounded-2xl border bg-white shadow-xl p-6 max-w-lg w-full mx-4 space-y-5"
           style={{ borderColor: "var(--rtm-border)" }}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>
              Add Blueprint
            </h2>
            <p className="text-sm mt-0.5" style={{ color: "var(--rtm-text-secondary)" }}>
              Project: <span className="font-semibold">{project.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-xl font-bold leading-none"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            ×
          </button>
        </div>

        {/* Blueprint selector */}
        {availableBlueprints.length === 0 ? (
          <div className="rounded-lg px-4 py-3 text-sm font-semibold"
               style={{ background: "#FFFBEB", color: "#B45309", border: "1px solid #FDE68A" }}>
            All available blueprints have already been applied to this project.
          </div>
        ) : (
          <>
            {/* Fix 4 — Blueprint picker with Contracted ✓ annotations */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wide"
                       style={{ color: "var(--rtm-text-secondary)" }}>
                  Select Blueprint
                </label>
                {clientRecord && (
                  <span className="text-[10px] font-semibold" style={{ color: "var(--rtm-text-muted)" }}>
                    ✓ = in client contract
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1 max-h-48 overflow-y-auto rounded-lg border"
                   style={{ borderColor: "var(--rtm-border)" }}>
                {availableBlueprints.map((bp) => {
                  const contracted = isBlueprintContracted(bp, clientRecord);
                  const isSelected = bp.id === selectedBpId;
                  return (
                    <button
                      key={bp.id}
                      type="button"
                      onClick={() => setSelectedBpId(bp.id)}
                      className="flex items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition-colors"
                      style={{
                        background: isSelected ? "#F5F3FF" : "white",
                        borderBottom: "1px solid var(--rtm-border-light)",
                        color: "var(--rtm-text-primary)",
                      }}
                    >
                      <span className="flex items-center gap-2 flex-1 min-w-0">
                        {isSelected && (
                          <span className="text-purple-600 flex-shrink-0">●</span>
                        )}
                        <span className="font-medium truncate">{bp.name}</span>
                        <span className="text-[11px] flex-shrink-0" style={{ color: "var(--rtm-text-muted)" }}>
                          {bp.tasks.length} tasks
                        </span>
                      </span>
                      {clientRecord && contracted && (
                        <span
                          className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{ background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0" }}
                        >
                          Contracted ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fix 4 — Non-contracted warning (non-blocking) */}
            {selectedBp && clientRecord && !selectedIsContracted && (
              <div
                className="rounded-lg px-4 py-3 text-sm"
                style={{ background: "#FFFBEB", color: "#B45309", border: "1px solid #FDE68A" }}
              >
                <span className="font-bold">⚠ Not in current contract — </span>
                this service isn&apos;t listed in the client&apos;s active services. You can still
                apply this blueprint, but confirm with the client or billing before proceeding.
              </div>
            )}

            {/* Blueprint preview */}
            {selectedBp && (
              <div className="rounded-xl p-4 space-y-2"
                   style={{ background: "#F5F3FF", border: "1px solid #DDD6FE" }}>
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "#6D28D9" }}>
                  {selectedBp.name}
                </p>
                <p className="text-xs" style={{ color: "#7C3AED" }}>{selectedBp.description}</p>
                <p className="text-xs font-semibold" style={{ color: "#6D28D9" }}>
                  {selectedBp.tasks.length} tasks will be appended to this project
                </p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedBp.tasks.map((t) => (
                    <span
                      key={t.id}
                      className="inline-block rounded px-2 py-0.5 text-[11px] font-medium"
                      style={{ background: "white", border: "1px solid #DDD6FE", color: "#6D28D9" }}
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg px-4 py-3 text-sm"
                   style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => void handleAdd()}
                disabled={!selectedBpId || submitting}
                className="flex-1 rounded-lg px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "#7C3AED" }}
              >
                {submitting ? "Applying…" : "Apply Blueprint →"}
              </button>
              <button
                onClick={onClose}
                className="rounded-lg px-4 py-2.5 text-sm font-semibold"
                style={{ border: "1px solid var(--rtm-border)", color: "var(--rtm-text-secondary)" }}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AddTaskModal
// ---------------------------------------------------------------------------

const DEPARTMENT_OPTIONS: DepartmentName[] = [
  "Account Management",
  "SEO",
  "GBP",
  "PPC",
  "Meta Ads",
  "Reporting",
  "Web Development",
  "Design",
  "Content",
  "Billing",
  "AI Automation",
  "IT & Security",
];

const PRIORITY_OPTIONS: TaskPriority[] = ["Low", "Medium", "High", "Urgent"];

interface AddTaskModalProps {
  project:  EngineProject;
  onClose:  () => void;
  onAdded:  (newTask: Task) => void;
}

function AddTaskModal({ project, onClose, onAdded }: AddTaskModalProps) {
  const [title,      setTitle]      = useState("");
  const [department, setDepartment] = useState<DepartmentName>("Account Management");
  const [assignee,   setAssignee]   = useState("");
  const [dueDate,    setDueDate]    = useState(() => new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]);
  const [priority,   setPriority]   = useState<TaskPriority>("Medium");
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const handleCreate = useCallback(async () => {
    const trimmed = title.trim();
    if (!trimmed) { setError("Title is required."); return; }
    setSubmitting(true);
    setError(null);

    try {
      const now = new Date().toISOString();
      const tid = `tsk-manual-${Date.now().toString(16)}-${Math.floor(Math.random() * 0xffff).toString(16).padStart(4, "0")}`;

      const newTask: Task = {
        id:               tid,
        projectId:        project.id,
        title:            trimmed,
        type:             "One-Time" as TaskType,
        source:           "Manual" as TaskSource,
        department,
        service:          department,
        assignedUserName: assignee.trim() || undefined,
        createdById:      "u-manual",
        createdByName:    "Project Detail — Add Task",
        status:           "Open",
        priority,
        dueDate,
        estimatedHours:   1,
        dependencies:     [],
        notes:            [],
        files:            [],
        automationHistory: [],
        createdAt:        now,
        updatedAt:        now,
        clientName:       project.client,
        projectName:      project.name,
      };

      // Persist via proven appendToEngineStore path
      await appendToEngineStore({ tasks: [newTask] });

      // Update project: add taskId + activity log entry
      const actEntry = {
        id:          `act-addtask-${Date.now().toString(16)}`,
        projectId:   project.id,
        eventType:   "Task Generated" as const,
        description: `Manual task "${trimmed}" created for ${department}.`,
        actorName:   assignee.trim() || project.accountManager,
        timestamp:   now,
        relatedTaskId: tid,
      };
      await updateProject(project.id, {
        taskIds:     [...(project.taskIds ?? []), tid],
        activityLog: [...(project.activityLog ?? []), actEntry],
        updatedAt:   now,
      });

      onAdded(newTask);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }, [title, department, assignee, dueDate, priority, project, onAdded]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div
        className="rounded-2xl border bg-white shadow-xl p-6 max-w-lg w-full mx-4 space-y-5"
        style={{ borderColor: "var(--rtm-border)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>Add Task</h2>
            <p className="text-sm mt-0.5" style={{ color: "var(--rtm-text-secondary)" }}>
              Project: <span className="font-semibold">{project.name}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-xl font-bold leading-none" style={{ color: "var(--rtm-text-muted)" }}>×</button>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-secondary)" }}>Task Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Keyword research and on-page audit"
            className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            style={{ border: "1px solid var(--rtm-border)", color: "var(--rtm-text-primary)", background: "white" }}
          />
        </div>

        {/* Department */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-secondary)" }}>Department</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value as DepartmentName)}
            className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            style={{ border: "1px solid var(--rtm-border)", color: "var(--rtm-text-primary)", background: "white" }}
          >
            {DEPARTMENT_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Assignee */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-secondary)" }}>Assignee / Owner</label>
          <select
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            style={{ border: "1px solid var(--rtm-border)", color: "var(--rtm-text-primary)", background: "white" }}
          >
            <option value="">Unassigned</option>
            {USERS.map((u) => <option key={u.id} value={u.name}>{u.name} ({u.role ?? "Team Member"})</option>)}
          </select>
        </div>

        {/* Due Date + Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-secondary)" }}>Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              style={{ border: "1px solid var(--rtm-border)", color: "var(--rtm-text-primary)", background: "white" }}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-secondary)" }}>Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              style={{ border: "1px solid var(--rtm-border)", color: "var(--rtm-text-primary)", background: "white" }}
            >
              {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {error && (
          <div className="rounded-lg px-4 py-3 text-sm" style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => void handleCreate()}
            disabled={!title.trim() || submitting}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "var(--rtm-blue)" }}
          >
            {submitting ? "Creating…" : "Create Task →"}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2.5 text-sm font-semibold"
            style={{ border: "1px solid var(--rtm-border)", color: "var(--rtm-text-secondary)" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const [liveProject, setLiveProject] = useState<EngineProject | null | undefined>(
    undefined // undefined = loading, null = not found
  );
  const [liveMilestones, setLiveMilestones] = useState<Milestone[]>([]);
  const [liveTasks, setLiveTasks] = useState<Task[]>([]);

  // Billing + onboarding context (fetched live, never stored on the Project object)
  const [clientRecord, setClientRecord] = useState<MasterClient | null>(null);
  const [onboardingRecord, setOnboardingRecord] = useState<AMOnboardingRecord | null | "loading">("loading");

  // Part 3B: Add Blueprint modal
  const [showAddBlueprintModal, setShowAddBlueprintModal] = useState(false);
  // Add Task modal
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // Load all project data in one coordinated fetch so every piece of state is
  // set atomically from the same authoritative API response.  Three fire-and-
  // forget fetches overwriting the same state slices independently caused a
  // race where milestone / task IDs appeared twice in the rendered list.
  const loadProjectData = useCallback(async () => {
    try {
      const [projRes, msRes, taskRes] = await Promise.all([
        fetch("/api/engine?resource=projects"),
        fetch("/api/engine?resource=milestones"),
        fetch("/api/engine?resource=tasks"),
      ]);

      const projData  = projRes.ok  ? (await projRes.json()  as { projects:   EngineProject[] }) : null;
      const msData    = msRes.ok    ? (await msRes.json()    as { milestones: Milestone[] })     : null;
      const taskData  = taskRes.ok  ? (await taskRes.json()  as { tasks:      Task[] })          : null;

      if (projData?.projects) {
        setLiveProject(projData.projects.find((p) => p.id === id) ?? null);
      } else {
        setLiveProject(getProject(id) ?? null);
      }

      if (msData?.milestones) {
        setLiveMilestones(msData.milestones.filter((m) => m.projectId === id));
      } else {
        setLiveMilestones(getMilestonesForProject(id));
      }

      if (taskData?.tasks) {
        setLiveTasks(taskData.tasks.filter((t) => t.projectId === id));
      } else {
        setLiveTasks(getTasksForProject(id));
      }
    } catch {
      // Full fallback to in-memory seed on any network error
      setLiveProject(getProject(id) ?? null);
      setLiveMilestones(getMilestonesForProject(id));
      setLiveTasks(getTasksForProject(id));
    }
  }, [id]);

  useEffect(() => {
    void loadProjectData();
  }, [loadProjectData]);

  // Refresh all live data (used after blueprint add)
  const refreshAll = useCallback(() => {
    void loadProjectData();
  }, [loadProjectData]);

  // Fetch billing (MasterClient) and onboarding record once we know the project's clientId.
  // Both are fetched live from their respective API routes — nothing is stored on Project.
  useEffect(() => {
    if (!liveProject || !liveProject.clientId) {
      setClientRecord(null);
      setOnboardingRecord(null);
      return;
    }
    const cid = liveProject.clientId;

    // Parallel fetch: MasterClient for billing status + onboarding record for context
    Promise.all([
      fetchMasterClient(cid),
      fetch(`/api/onboarding-records?clientId=${encodeURIComponent(cid)}`, { cache: "no-store" })
        .then((r) => r.ok ? r.json() as Promise<{ record: AMOnboardingRecord | null }> : null)
        .catch(() => null),
    ]).then(([mc, onbData]) => {
      setClientRecord(mc);
      setOnboardingRecord(onbData?.record ?? null);
    }).catch(() => {
      setClientRecord(null);
      setOnboardingRecord(null);
    });
  }, [liveProject]);

  // Still loading
  if (liveProject === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--rtm-bg)" }}>
        <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>Loading...</p>
      </div>
    );
  }

  const project = liveProject;
  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--rtm-bg)" }}>
        <div className="text-center">
          <p className="text-sm font-semibold mb-4" style={{ color: "var(--rtm-text-secondary)" }}>
            Project not found.
          </p>
          <Link href="/projects" className="text-sm hover:underline" style={{ color: "var(--rtm-blue)" }}>
            Back to Global Projects
          </Link>
        </div>
      </div>
    );
  }

  const milestones = liveMilestones;
  const tasks = liveTasks;
  const health = HEALTH_CFG[project.health];
  const allDeps = tasks.flatMap((t) => t.dependencies);

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview",     label: "Overview" },
    { id: "milestones",   label: `Milestones (${milestones.length})` },
    { id: "departments",  label: `Departments (${project.departments.length})` },
    { id: "tasks",        label: `Tasks (${tasks.length})` },
    { id: "dependencies", label: `Dependencies (${allDeps.length})` },
    { id: "timeline",     label: "Activity Timeline" },
    { id: "health",       label: "Project Health" },
  ];

  // Group tasks by department for the tasks tab
  const tasksByDept = tasks.reduce<Record<string, Task[]>>((acc, t) => {
    acc[t.department] = acc[t.department] ?? [];
    acc[t.department].push(t);
    return acc;
  }, {});

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--rtm-bg)" }}>

      {/* ── Add Task Modal ── */}
      {showAddTaskModal && liveProject && (
        <AddTaskModal
          project={liveProject}
          onClose={() => setShowAddTaskModal(false)}
          onAdded={(newTask) => {
            // Immediately append to local state — no manual refresh needed
            setLiveTasks((prev) => [...prev, newTask]);
            setShowAddTaskModal(false);
          }}
        />
      )}

      {/* ── Add Blueprint Modal (Part 3B) ── */}
      {showAddBlueprintModal && liveProject && (
        <AddBlueprintModal
          project={liveProject}
          liveTasks={liveTasks}
          liveMilestones={liveMilestones}
          onClose={() => setShowAddBlueprintModal(false)}
          onAdded={(_newTasks, _newMs) => {
            setShowAddBlueprintModal(false);
            refreshAll();
          }}
        />
      )}

      {/* ── HEADER ── */}
      <div className="px-6 pt-6 pb-4" style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
        <div className="max-w-[1200px] mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs mb-3" style={{ color: "var(--rtm-text-muted)" }}>
            <Link href="/projects" className="hover:underline" style={{ color: "var(--rtm-blue)" }}>Global Projects</Link>
            <span>/</span>
            <span>{project.name}</span>
          </div>

          {/* Title */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--rtm-blue)" }}>{project.id}</span>
                <StatusBadge status={project.status} />
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold"
                  style={{ background: health.bg, color: health.color }}>
                  {project.health} Health
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded font-bold"
                  style={{ background: "#FAF5FF", color: "#7C3AED" }}>
                  {project.priority} Priority
                </span>
              </div>
              <h1 className="text-xl font-black mb-1" style={{ color: "var(--rtm-text-primary)" }}>{project.name}</h1>
              <div className="flex items-center gap-4 text-xs flex-wrap" style={{ color: "var(--rtm-text-secondary)" }}>
                <span>Client: <b>{project.client}</b></span>
                <span>AM: <b>{project.accountManager}</b></span>
                <span>Owner: <b>{project.owner}</b></span>
                <span>Launch: <b>{project.launchDate}</b></span>
                <span>Package: <b>{project.servicePackage}</b></span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link href="/projects" className="px-3 py-1.5 rounded-lg text-xs font-semibold border hover:bg-gray-50"
                style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>
                Back
              </Link>
              <Link href={`/projects/tasks?project=${id}`} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                style={{ background: "var(--rtm-blue)" }}>
                All Tasks
              </Link>
              <button
                onClick={() => setShowAddTaskModal(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                style={{ background: "#059669" }}
              >
                + Add Task
              </button>
              <button
                onClick={() => setShowAddBlueprintModal(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                style={{ background: "#7C3AED" }}
              >
                Add Blueprint →
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto gap-0">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className="px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0"
                style={{
                  color: activeTab === t.id ? "var(--rtm-blue)" : "var(--rtm-text-secondary)",
                  borderBottom: activeTab === t.id ? "2px solid var(--rtm-blue)" : "2px solid transparent",
                  background: "transparent",
                }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="flex-1 px-6 py-6 max-w-[1200px] mx-auto w-full">

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-5">

            {/* —— Billing Status —— fetched live from MASTER_CLIENTS, never stored on Project */}
            {clientRecord && (
              <BillingStatusBadge
                billingStatus={clientRecord.billingStatus}
                paymentStatus={clientRecord.paymentStatus}
              />
            )}
            {!clientRecord && project.clientId && (
              <div className="rounded-xl px-4 py-3 text-xs" style={{ background: "#F8FAFC", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-muted)" }}>
                Loading billing status…
              </div>
            )}
            {!project.clientId && (
              <div className="rounded-xl px-4 py-3 text-xs" style={{ background: "#F8FAFC", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-muted)" }}>
                No MASTER_CLIENTS record linked — billing status unavailable.
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Field label="Client"          value={project.client} />
              <Field label="Service Package" value={project.servicePackage} />
              <Field label="Account Manager" value={project.accountManager} />
              <Field label="Project Owner"   value={project.owner} />
              <Field label="Launch Date"     value={project.launchDate} />
              <Field label="Status"          value={project.status} />
              <Field label="Milestones"      value={String(milestones.length)} />
              <Field label="Tasks Generated" value={String(tasks.length)} />
              <Field label="Departments"     value={String(project.departments.length)} />
            </div>

            <div className="rounded-xl p-5" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
              <p className="text-xs font-black uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-secondary)" }}>
                Contract Summary
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--rtm-text-primary)" }}>{project.contractSummary}</p>
            </div>

            {project.notes && (
              <div className="rounded-xl p-4" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
                <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: "#D97706" }}>Notes</p>
                <p className="text-sm" style={{ color: "var(--rtm-text-primary)" }}>{project.notes}</p>
              </div>
            )}

            {/* —— Onboarding Record —— fetched live, never duplicated into Project */}
            {project.clientId && (
              <div>
                {onboardingRecord === "loading" && (
                  <div className="rounded-xl px-5 py-4 text-sm" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-muted)" }}>
                    Loading onboarding record…
                  </div>
                )}
                {onboardingRecord === null && (
                  <div className="rounded-xl px-5 py-4" style={{ background: "#F8FAFC", border: "1px solid var(--rtm-border)" }}>
                    <p className="text-xs font-black uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-secondary)" }}>Client Onboarding Record</p>
                    <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>No onboarding record found for this client. The record is created when the AM completes the onboarding wizard.</p>
                    <Link
                      href="/account-management/onboarding"
                      className="inline-block mt-2 text-xs font-semibold hover:underline"
                      style={{ color: "var(--rtm-blue)" }}
                    >
                      Go to Onboarding →
                    </Link>
                  </div>
                )}
                {onboardingRecord && onboardingRecord !== "loading" && (
                  <OnboardingSummaryPanel record={onboardingRecord} recordId={onboardingRecord.id} />
                )}
              </div>
            )}

            {/* Milestone progress strip */}
            <div className="rounded-xl p-5" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
              <p className="text-xs font-black uppercase tracking-wide mb-4" style={{ color: "var(--rtm-text-secondary)" }}>Milestone Progress</p>
              <div className="flex flex-col gap-3">
                {milestones.map((ms) => (
                  <div key={ms.id} className="flex items-center gap-3">
                    <div className="w-36 flex-shrink-0 text-xs font-semibold truncate" style={{ color: "var(--rtm-text-primary)" }}>{ms.name}</div>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--rtm-border)" }}>
                      <div className="h-full rounded-full"
                        style={{
                          width: `${ms.progress}%`,
                          background: ms.status === "Completed" ? "#10B981" : ms.status === "Blocked" ? "#EF4444" : "#3B82F6",
                        }} />
                    </div>
                    <span className="text-xs font-bold w-9 text-right" style={{ color: "var(--rtm-text-secondary)" }}>{ms.progress}%</span>
                    <MsBadge status={ms.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── MILESTONES ── */}
        {activeTab === "milestones" && (
          <div className="flex flex-col gap-4">
            {milestones.length === 0 && (
              <div className="text-center py-16 text-sm" style={{ color: "var(--rtm-text-muted)" }}>No milestones defined.</div>
            )}
            {milestones.map((ms) => {
              const msTasks = tasks.filter((t) => ms.taskIds.includes(t.id));
              const blueprint = ms.blueprintId ? getBlueprint(ms.blueprintId) : undefined;
              return (
                <div key={ms.id} className="rounded-xl p-5" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
                  <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                    <div>
                      <h3 className="font-bold text-base" style={{ color: "var(--rtm-text-primary)" }}>{ms.name}</h3>
                      {blueprint && (
                        <Link href={`/projects/blueprints#${blueprint.id}`}
                          className="text-xs hover:underline" style={{ color: "#7C3AED" }}>
                          Blueprint: {blueprint.name}
                        </Link>
                      )}
                    </div>
                    <MsBadge status={ms.status} />
                  </div>

                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3 text-xs mb-4">
                    <div><span style={{ color: "var(--rtm-text-muted)" }}>Owner: </span><b>{ms.owner}</b></div>
                    <div><span style={{ color: "var(--rtm-text-muted)" }}>Start: </span><b>{ms.startDate}</b></div>
                    <div><span style={{ color: "var(--rtm-text-muted)" }}>Due: </span><b>{ms.dueDate}</b></div>
                    {ms.completionDate && <div><span style={{ color: "var(--rtm-text-muted)" }}>Completed: </span><b style={{ color: "#059669" }}>{ms.completionDate}</b></div>}
                    <div><span style={{ color: "var(--rtm-text-muted)" }}>Tasks: </span><b>{msTasks.length}</b></div>
                  </div>

                  {ms.blockedReason && (
                    <div className="text-xs p-2 rounded-lg mb-3" style={{ background: "#FEF2F2", color: "#DC2626" }}>
                      {ms.blockedReason}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--rtm-border)" }}>
                      <div className="h-full rounded-full"
                        style={{
                          width: `${ms.progress}%`,
                          background: ms.status === "Completed" ? "#10B981" : ms.status === "Blocked" ? "#EF4444" : "#3B82F6",
                        }} />
                    </div>
                    <span className="text-xs font-bold" style={{ color: "var(--rtm-text-secondary)" }}>{ms.progress}%</span>
                  </div>

                  {/* Mini task list */}
                  {msTasks.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>Generated Tasks</p>
                      {msTasks.map((t) => (
                        <div key={t.id} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg"
                          style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)" }}>
                          <Link href={`/projects/tasks/${t.id}`}
                            className="text-xs font-semibold hover:underline flex-1"
                            style={{ color: "var(--rtm-blue)" }}>
                            {t.title}
                          </Link>
                          <span className="text-[11px] px-1.5 py-0.5 rounded font-semibold" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>{t.department}</span>
                          <TsBadge status={t.status} />
                          {t.assignedUserName && <Avatar name={t.assignedUserName} />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── DEPARTMENTS ── */}
        {activeTab === "departments" && (
          <div className="flex flex-col gap-4">
            <div
              className="px-4 py-3 rounded-xl text-xs font-semibold"
              style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}
            >
              Department pages are FILTER views only. Tasks are owned by this engine and filtered by Department field.
            </div>
            {project.departments.map((dept) => {
              const deptTasks = tasks.filter((t) => dept.taskIds.includes(t.id));
              const open      = deptTasks.filter((t) => t.status !== "Completed" && t.status !== "Cancelled").length;
              const blocked   = deptTasks.filter((t) => t.status === "Blocked").length;
              const completed = deptTasks.filter((t) => t.status === "Completed").length;
              const escCfg = dept.escalationStatus === "Critical"
                ? { bg: "#FEF2F2", color: "#DC2626" }
                : dept.escalationStatus === "Escalated"
                ? { bg: "#FFFBEB", color: "#D97706" }
                : { bg: "#ECFDF5", color: "#059669" };
              return (
                <div key={dept.department} className="rounded-xl p-5" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
                  <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                    <h3 className="font-bold text-base" style={{ color: "var(--rtm-text-primary)" }}>{dept.department}</h3>
                    <span className="text-[11px] px-2.5 py-1 rounded-full font-bold" style={escCfg}>
                      {dept.escalationStatus === "None" ? "On Track" : dept.escalationStatus}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-center mb-3">
                    {[
                      { label: "Total",     value: deptTasks.length, color: "#1D4ED8" },
                      { label: "Open",      value: open,      color: "#D97706" },
                      { label: "Blocked",   value: blocked,   color: "#DC2626" },
                      { label: "Completed", value: completed, color: "#059669" },
                    ].map((m) => (
                      <div key={m.label} className="rounded-lg p-2" style={{ background: "var(--rtm-bg)" }}>
                        <div className="text-xl font-black" style={{ color: m.color }}>{m.value}</div>
                        <div className="text-[10px] font-semibold" style={{ color: "var(--rtm-text-muted)" }}>{m.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs mb-2" style={{ color: "var(--rtm-text-secondary)" }}>Owner: <b>{dept.owner}</b></div>
                  {dept.delayReason && (
                    <div className="text-xs p-2 rounded-lg" style={{ background: "#FFFBEB", color: "#D97706" }}>{dept.delayReason}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── TASKS ── */}
        {activeTab === "tasks" && (
          <div className="flex flex-col gap-4">
            <div
              className="flex items-center justify-between px-4 py-3 rounded-xl text-xs"
              style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
            >
              <span className="font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>
                {tasks.length} tasks across {Object.keys(tasksByDept).length} departments
              </span>
              <Link href={`/projects/tasks?project=${id}`} className="font-semibold hover:underline" style={{ color: "var(--rtm-blue)" }}>
                Open Global Task View
              </Link>
            </div>

            {Object.entries(tasksByDept).map(([dept, deptTasks]) => (
              <div key={dept}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-black uppercase tracking-wide" style={{ color: "var(--rtm-blue)" }}>{dept}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: "#EFF6FF", color: "var(--rtm-blue)" }}>{deptTasks.length}</span>
                </div>
                <div className="flex flex-col gap-2 mb-4">
                  {deptTasks.map((t) => (
                    <div key={t.id} className="rounded-lg p-3" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                        <Link href={`/projects/tasks/${t.id}`}
                          className="font-semibold text-sm hover:underline"
                          style={{ color: "var(--rtm-blue)" }}>
                          {t.title}
                        </Link>
                        <div className="flex items-center gap-2">
                          <TsBadge status={t.status} />
                          <span className="text-[11px] font-bold" style={{ color: PRIORITY_COLOR[t.priority] }}>{t.priority}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                        <span>Due: <b style={{ color: "var(--rtm-text-secondary)" }}>{t.dueDate}</b></span>
                        {t.assignedUserName && <span>Assignee: <b style={{ color: "var(--rtm-text-secondary)" }}>{t.assignedUserName}</b></span>}
                        <span>Source: <b style={{ color: "#7C3AED" }}>{t.source}</b></span>
                        {t.dependencies.length > 0 && (
                          <span style={{ color: "#DC2626" }}>{t.dependencies.length} dep{t.dependencies.length > 1 ? "s" : ""}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── DEPENDENCIES ── */}
        {activeTab === "dependencies" && (
          <div className="flex flex-col gap-4">
            {allDeps.length === 0 && (
              <div className="text-center py-16 text-sm" style={{ color: "var(--rtm-text-muted)" }}>No dependencies defined on this project.</div>
            )}

            <div
              className="px-4 py-3 rounded-xl text-xs font-semibold"
              style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}
            >
              Finish-To-Start: Task B cannot start until Task A completes. Tasks with blocked-by dependencies are shown below.
            </div>

            {tasks
              .filter((t) => t.dependencies.length > 0)
              .map((t) => (
                <div key={t.id} className="rounded-xl p-4" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
                  <Link href={`/projects/tasks/${t.id}`}
                    className="font-bold text-sm hover:underline block mb-3"
                    style={{ color: "var(--rtm-blue)" }}>
                    {t.title}
                  </Link>
                  <div className="flex flex-col gap-2">
                    {t.dependencies.map((dep) => (
                      <div key={dep.id}
                        className="flex items-center gap-3 p-3 rounded-lg"
                        style={{ background: dep.status === "Completed" ? "#ECFDF5" : dep.status === "Blocked" ? "#FEF2F2" : "#FFFBEB", border: `1px solid ${dep.status === "Completed" ? "#A7F3D0" : dep.status === "Blocked" ? "#FECACA" : "#FDE68A"}` }}>
                        <div className="flex-1">
                          <div className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                            {dep.direction === "blocked-by" ? "Blocked by:" : "Blocking:"} {dep.dependsOnTaskName}
                          </div>
                          <div className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{dep.type}</div>
                        </div>
                        <TsBadge status={dep.status} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* ── TIMELINE ── */}
        {activeTab === "timeline" && (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl p-5" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
              <p className="text-xs font-black uppercase tracking-wide mb-4" style={{ color: "var(--rtm-text-secondary)" }}>Activity Timeline</p>
              <div className="flex flex-col gap-4">
                {[...project.activityLog].reverse().map((entry) => (
                  <div key={entry.id} className="flex gap-3">
                    <ActivityIcon type={entry.eventType} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>{entry.eventType}</span>
                        <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>by {entry.actorName}</span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-secondary)" }}>{entry.description}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {project.activityLog.length === 0 && (
                  <div className="text-center py-8 text-sm" style={{ color: "var(--rtm-text-muted)" }}>No activity yet.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── HEALTH ── */}
        {activeTab === "health" && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Project Health",      value: project.health,   cfgBg: health.bg,   cfgColor: health.color },
                { label: "Active Departments",   value: String(project.departments.filter((d) => d.escalationStatus !== "Critical").length), cfgBg: "#ECFDF5", cfgColor: "#059669" },
                { label: "Blocked Tasks",        value: String(tasks.filter((t) => t.status === "Blocked").length), cfgBg: "#FEF2F2", cfgColor: "#DC2626" },
              ].map((m) => (
                <div key={m.label} className="rounded-xl p-5 flex flex-col gap-2" style={{ background: m.cfgBg, border: "1px solid var(--rtm-border)" }}>
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: m.cfgColor }}>{m.label}</p>
                  <p className="text-4xl font-black" style={{ color: m.cfgColor }}>{m.value}</p>
                </div>
              ))}
            </div>

            {/* Escalation statuses */}
            <div className="rounded-xl p-5" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
              <p className="text-xs font-black uppercase tracking-wide mb-4" style={{ color: "var(--rtm-text-secondary)" }}>Department Escalation Status</p>
              <div className="flex flex-col gap-2">
                {project.departments.map((d) => {
                  const escCfg = d.escalationStatus === "Critical"
                    ? { bg: "#FEF2F2", color: "#DC2626" }
                    : d.escalationStatus === "Escalated"
                    ? { bg: "#FFFBEB", color: "#D97706" }
                    : { bg: "#ECFDF5", color: "#059669" };
                  return (
                    <div key={d.department} className="flex items-center justify-between p-3 rounded-lg"
                      style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)" }}>
                      <span className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{d.department}</span>
                      <div className="flex items-center gap-2">
                        {d.delayReason && (
                          <span className="text-[10px]" style={{ color: "#D97706" }}>{d.delayReason}</span>
                        )}
                        <span className="text-[11px] px-2.5 py-1 rounded-full font-bold" style={escCfg}>
                          {d.escalationStatus === "None" ? "On Track" : d.escalationStatus}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
