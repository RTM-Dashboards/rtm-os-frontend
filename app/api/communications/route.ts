// RTM OS — Communications Aggregation API Route
//
// Aggregates ClientNotes from the Collaboration Hub persistence layer
// (data/collaboration-store.json) across all Postgres tasks belonging
// to a given client — or across ALL clients when no clientId is provided.
//
// The chain (Postgres): Business.clientId → Project.businessId
//                       → ProjectCategory.projectId → Task.categoryId
//
// GET  /api/communications
//       → { entries: AggregatedClientNote[] }  (all clients, all notes)
//
// GET  /api/communications?clientId=<mc-id>
//       → { entries: AggregatedClientNote[], clientName: string }
//
// GET  /api/communications?clientId=<mc-id>&taskIds=true
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
import fs from "fs";
import path from "path";

// ── Inline types ───────────────────────────────────────────────────────────────

interface ClientNote {
  id: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  authorColor: string;
  source: string;
  body: string;
  createdAt: string;
}

interface TaskCollabEntry {
  comments:      unknown[];
  internalNotes: unknown[];
  clientNotes:   ClientNote[];
  watchers:      unknown[];
}

interface CollabStoreFile {
  tasks: Record<string, TaskCollabEntry>;
}

interface MasterClient {
  id: string;
  clientName: string;
  assignedAM?: string;
  avatarColor?: string;
}

export interface AggregatedClientNote {
  // Original ClientNote fields
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

// ── File paths ─────────────────────────────────────────────────────────────────

const COLLAB_FILE  = path.join(process.cwd(), "data", "collaboration-store.json");
// master-clients.json is a real operator-managed file (AM metadata: assignedAM, avatarColor).
// It is separate from engine-store.json and is NOT retired here.
const CLIENTS_FILE = path.join(process.cwd(), "data", "master-clients.json");

// ── File readers ───────────────────────────────────────────────────────────────

function readCollab(): CollabStoreFile {
  try {
    const raw = fs.readFileSync(COLLAB_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<CollabStoreFile>;
    return { tasks: parsed.tasks ?? {} };
  } catch {
    return { tasks: {} };
  }
}

function readClients(): MasterClient[] {
  try {
    const raw = fs.readFileSync(CLIENTS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as { clients?: MasterClient[] };
    return parsed.clients ?? [];
  } catch {
    return [];
  }
}

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status! });
  void user;

  const clientId    = req.nextUrl.searchParams.get("clientId");
  const taskIdsOnly = req.nextUrl.searchParams.get("taskIds") === "true";

  const clients  = readClients();
  const collab   = readCollab();

  // Build master-clients lookup
  const clientMap = new Map<string, MasterClient>(clients.map((c) => [c.id, c]));

  // ── Resolve Postgres: clientId → businessIds → projectIds → taskIds ────────
  //
  // Business.clientId is the master-clients id (string).
  // Project.businessId links to Business.id.
  // ProjectCategory.projectId links to Project.id.
  // Task.categoryId links to ProjectCategory.id.
  //
  // We do this in three Prisma queries, using IN clauses to keep it efficient.

  // 1. Find businesses by clientId (one or all)
  const businesses = await prisma.business.findMany(
    clientId ? { where: { clientId } } : undefined
  );

  if (businesses.length === 0) {
    // No Postgres businesses for this client — return empty result
    if (clientId) {
      const client = clientMap.get(clientId);
      if (taskIdsOnly) return NextResponse.json({ taskOptions: [] });
      return NextResponse.json({ entries: [], clientName: client?.clientName ?? clientId });
    }
    return NextResponse.json({ entries: [] });
  }

  const bizIds   = businesses.map((b) => b.id);
  const bizToClientId = new Map<string, string>(businesses.map((b) => [b.id, b.clientId]));

  // 2. Find projects belonging to those businesses
  const projects = await prisma.project.findMany({
    where: { businessId: { in: bizIds } },
    select: { id: true, name: true, businessId: true },
  });

  if (projects.length === 0) {
    if (clientId) {
      const client = clientMap.get(clientId);
      if (taskIdsOnly) return NextResponse.json({ taskOptions: [] });
      return NextResponse.json({ entries: [], clientName: client?.clientName ?? clientId });
    }
    return NextResponse.json({ entries: [] });
  }

  const projIds  = projects.map((p) => p.id);
  const projMap  = new Map(projects.map((p) => [p.id, p]));

  // 3. Find all categories for those projects
  const categories = await prisma.projectCategory.findMany({
    where: { projectId: { in: projIds } },
    select: { id: true, projectId: true },
  });

  if (categories.length === 0) {
    if (clientId) {
      const client = clientMap.get(clientId);
      if (taskIdsOnly) return NextResponse.json({ taskOptions: [] });
      return NextResponse.json({ entries: [], clientName: client?.clientName ?? clientId });
    }
    return NextResponse.json({ entries: [] });
  }

  const catIds   = categories.map((c) => c.id);
  const catToProjId = new Map<string, string>(categories.map((c) => [c.id, c.projectId]));

  // 4. Find all tasks for those categories
  const tasks = await prisma.task.findMany({
    where: { categoryId: { in: catIds } },
    select: { id: true, label: true, categoryId: true, department: true, status: true },
  });

  // Build task map and task → project + client maps
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
    const projId   = catToProjId.get(t.categoryId) ?? "";
    const proj     = projMap.get(projId);
    const bizId    = proj?.businessId ?? "";
    const cid      = bizToClientId.get(bizId) ?? "";
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

  const entries: AggregatedClientNote[] = [];

  for (const task of targetTaskRows) {
    const entry = collab.tasks[task.id];
    if (!entry || !entry.clientNotes || entry.clientNotes.length === 0) continue;

    const mc          = clientMap.get(task.clientId);
    const clientName  = mc?.clientName ?? task.clientId;
    const assignedAM  = mc?.assignedAM ?? "";
    const avatarColor = mc?.avatarColor ?? "#6366f1";
    const proj        = projMap.get(task.projectId);
    const projectName = proj?.name ?? task.projectId;

    for (const note of entry.clientNotes) {
      entries.push({
        ...note,
        taskId:      task.id,
        taskTitle:   task.label,
        projectId:   task.projectId,
        projectName,
        clientId:    task.clientId,
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
    const client = clientMap.get(clientId);
    return NextResponse.json({
      entries,
      clientName: client?.clientName ?? clientId,
    });
  }

  return NextResponse.json({ entries });
}
