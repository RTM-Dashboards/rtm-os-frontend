// RTM OS — Communications Aggregation API Route
//
// Aggregates ClientNotes from collab_client_notes (Postgres) across all
// Postgres tasks belonging to a given client — or across ALL clients when
// no clientId is provided.
//
// Migrated from:
//   data/collaboration-store.json  — client notes (now in collab_client_notes)
//   data/master-clients.json       — client name, assignedAM, avatarColor
//                                    (now read from businesses + clients)
//
// The chain (Postgres): businesses.clientId → clients.id
//                       Business.id → Project.businessId
//                       → ProjectCategory.projectId → Task.categoryId
//
// GET  /api/communications
//       → { entries: AggregatedClientNote[] }  (all clients, all notes)
//
// GET  /api/communications?clientId=<biz-client-id>
//       → { entries: AggregatedClientNote[], clientName: string }
//
// GET  /api/communications?clientId=<biz-client-id>&taskIds=true
//       → { taskOptions: TaskOption[] }  (list of tasks for task picker in Log modal)
//
// POST /api/communications  is NOT implemented here — writes go directly to
//      POST /api/collaboration?taskId=<id>&resource=clientNotes
//      (the Communications page calls that endpoint directly)
//
// Auth gate: getSessionUser — fails closed with 401 if no session.

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

// ── Inline types ───────────────────────────────────────────────────────────────

export interface AggregatedClientNote {
  // Original ClientNote fields (from collab_client_notes)
  id: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  authorColor: string;
  source: string;
  body: string;
  createdAt: string;
  // Enrichment
  taskId: string;
  taskTitle: string;
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  assignedAM: string;
  avatarColor: string;
}

export interface TaskOption {
  taskId: string;
  taskTitle: string;
  projectId: string;
  projectName: string;
  department: string;
  status: string;
}

// ── DB row types ───────────────────────────────────────────────────────────────

interface ClientNoteRow {
  id: string;
  task_id: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  authorColor: string;
  source: string;
  body: string;
  createdAt: string;
}

// ── Deterministic avatar colour ───────────────────────────────────────────────
//
// Same 8-colour palette and polynomial hash used by the master-clients adapter
// (app/api/master-clients/route.ts) and the billing client-portfolio page.
// Stable across reloads; no column; no migration required.

const AVATAR_COLORS = [
  "#6366f1", "#0ea5e9", "#10b981", "#f59e0b",
  "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6",
];

function deriveAvatarColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status! });
  void user;

  const clientId    = req.nextUrl.searchParams.get("clientId");
  const taskIdsOnly = req.nextUrl.searchParams.get("taskIds") === "true";

  // ── Resolve Postgres: clientId → businessIds → projectIds → taskIds ────────
  //
  // Business.clientId links to clients.id (a real DB foreign key string).
  // Project.businessId links to Business.id.
  // ProjectCategory.projectId links to Project.id.
  // Task.categoryId links to ProjectCategory.id.
  //
  // We use Prisma ORM (findMany) for the structural queries and
  // $queryRawUnsafe for the collab_client_notes read, matching the
  // pattern used by app/api/collaboration/route.ts.

  // 1. Find businesses by clientId (one or all)
  const businesses = await prisma.business.findMany(
    clientId ? { where: { clientId } } : undefined
  );

  if (businesses.length === 0) {
    if (taskIdsOnly) return NextResponse.json({ taskOptions: [] });
    if (clientId) return NextResponse.json({ entries: [], clientName: clientId });
    return NextResponse.json({ entries: [] });
  }

  const bizIds          = businesses.map((b) => b.id);
  const bizToClientId   = new Map<string, string>(businesses.map((b) => [b.id, b.clientId]));

  // 2. Build client name/AM lookup from businesses + clients tables.
  //    businesses.clientId → clients.id
  //
  //    clientName source priority (business name, never a contact person):
  //      1. businesses.displayName  — authoritative business identity; always
  //         populated at business creation; never a person's name.
  //      2. clients.company         — business name carried on the client record;
  //         fallback if displayName is somehow blank.
  //      3. biz.clientId            — last resort; never a person's name.
  //
  //    clients.fullName is intentionally excluded: it holds the contact person's
  //    name (e.g. "Sarah K."), not the business name. Using it here would
  //    reproduce the bug this route was written to fix.
  //
  //    assignedAM: read from businesses.assignedAM (AM assigned to this
  //    specific business domain). clients.assignedAM is not used because
  //    the Business is the billing/delivery unit the AM manages.
  const clientIds = [...new Set(businesses.map((b) => b.clientId).filter(Boolean))];
  const clientRows = clientIds.length > 0
    ? await prisma.$queryRawUnsafe<{ id: string; company: string }[]>(
        `SELECT id, company FROM clients WHERE id IN (${
          clientIds.map((_, i) => `$${i + 1}`).join(", ")
        })`,
        ...clientIds
      )
    : [];

  interface ClientLookup { clientName: string; assignedAM: string; avatarColor: string }
  const clientLookupMap = new Map<string, ClientLookup>();

  for (const biz of businesses) {
    const clientRow = clientRows.find((c) => c.id === biz.clientId);
    const clientName =
      biz.displayName.trim() ||
      clientRow?.company?.trim() ||
      biz.clientId;
    clientLookupMap.set(biz.clientId, {
      clientName,
      assignedAM:  biz.assignedAM ?? "",
      avatarColor: deriveAvatarColor(biz.id),
    });
  }

  // 3. Find projects belonging to those businesses
  const projects = await prisma.project.findMany({
    where: { businessId: { in: bizIds } },
    select: { id: true, name: true, businessId: true },
  });

  if (projects.length === 0) {
    if (taskIdsOnly) return NextResponse.json({ taskOptions: [] });
    if (clientId) {
      const lookup = clientLookupMap.get(clientId);
      return NextResponse.json({ entries: [], clientName: lookup?.clientName ?? clientId });
    }
    return NextResponse.json({ entries: [] });
  }

  const projIds  = projects.map((p) => p.id);
  const projMap  = new Map(projects.map((p) => [p.id, p]));

  // 4. Find all categories for those projects
  const categories = await prisma.projectCategory.findMany({
    where: { projectId: { in: projIds } },
    select: { id: true, projectId: true },
  });

  if (categories.length === 0) {
    if (taskIdsOnly) return NextResponse.json({ taskOptions: [] });
    if (clientId) {
      const lookup = clientLookupMap.get(clientId);
      return NextResponse.json({ entries: [], clientName: lookup?.clientName ?? clientId });
    }
    return NextResponse.json({ entries: [] });
  }

  const catIds      = categories.map((c) => c.id);
  const catToProjId = new Map<string, string>(categories.map((c) => [c.id, c.projectId]));

  // 5. Find all tasks for those categories
  const tasks = await prisma.task.findMany({
    where: { categoryId: { in: catIds } },
    select: { id: true, label: true, categoryId: true, department: true, status: true },
  });

  interface TaskRow {
    id: string;
    label: string;
    categoryId: string;
    department: string | null;
    status: string;
    projectId: string;
    clientId: string;
  }

  const taskRows: TaskRow[] = tasks.map((t) => {
    const projId = catToProjId.get(t.categoryId) ?? "";
    const proj   = projMap.get(projId);
    const bizId  = proj?.businessId ?? "";
    const cid    = bizToClientId.get(bizId) ?? "";
    return {
      id:         t.id,
      label:      t.label,
      categoryId: t.categoryId,
      department: t.department,
      status:     t.status,
      projectId:  projId,
      clientId:   cid,
    };
  });

  // ── Task picker mode ──────────────────────────────────────────────────────
  if (taskIdsOnly && clientId) {
    const taskOptions: TaskOption[] = taskRows
      .filter((t) => t.clientId === clientId)
      .map((t) => {
        const proj = projMap.get(t.projectId);
        return {
          taskId:      t.id,
          taskTitle:   t.label,
          projectId:   t.projectId,
          projectName: proj?.name ?? t.projectId,
          department:  t.department ?? "General",
          status:      t.status,
        };
      });
    return NextResponse.json({ taskOptions });
  }

  // ── Full aggregation ──────────────────────────────────────────────────────
  const targetTaskRows = clientId
    ? taskRows.filter((t) => t.clientId === clientId)
    : taskRows;

  if (targetTaskRows.length === 0) {
    if (clientId) {
      const lookup = clientLookupMap.get(clientId);
      return NextResponse.json({ entries: [], clientName: lookup?.clientName ?? clientId });
    }
    return NextResponse.json({ entries: [] });
  }

  // 6. Fetch all client notes from collab_client_notes for those tasks,
  //    following the $queryRawUnsafe pattern from app/api/collaboration/route.ts.
  const taskIds = targetTaskRows.map((t) => t.id);
  const placeholders = taskIds.map((_, i) => `$${i + 1}`).join(", ");
  const noteRows = await prisma.$queryRawUnsafe<ClientNoteRow[]>(
    `SELECT * FROM collab_client_notes WHERE task_id IN (${placeholders}) ORDER BY "createdAt" ASC`,
    ...taskIds
  );

  // Build note lookup: taskId → ClientNoteRow[]
  const notesByTask = new Map<string, ClientNoteRow[]>();
  for (const note of noteRows) {
    const arr = notesByTask.get(note.task_id) ?? [];
    arr.push(note);
    notesByTask.set(note.task_id, arr);
  }

  const entries: AggregatedClientNote[] = [];

  for (const task of targetTaskRows) {
    const taskNotes = notesByTask.get(task.id);
    if (!taskNotes || taskNotes.length === 0) continue;

    const lookup      = clientLookupMap.get(task.clientId);
    const clientName  = lookup?.clientName  ?? task.clientId;
    const assignedAM  = lookup?.assignedAM  ?? "";
    const avatarColor = lookup?.avatarColor ?? "#6366f1";
    const proj        = projMap.get(task.projectId);
    const projectName = proj?.name ?? task.projectId;

    for (const note of taskNotes) {
      entries.push({
        id:             note.id,
        authorId:       note.authorId,
        authorName:     note.authorName,
        authorInitials: note.authorInitials,
        authorColor:    note.authorColor,
        source:         note.source,
        body:           note.body,
        createdAt:      note.createdAt,
        taskId:         task.id,
        taskTitle:      task.label,
        projectId:      task.projectId,
        projectName,
        clientId:       task.clientId,
        clientName,
        assignedAM,
        avatarColor,
      });
    }
  }

  // Sort newest first
  entries.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (clientId) {
    const lookup = clientLookupMap.get(clientId);
    return NextResponse.json({
      entries,
      clientName: lookup?.clientName ?? clientId,
    });
  }

  return NextResponse.json({ entries });
}
