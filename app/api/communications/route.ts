// RTM OS — Communications Aggregation API Route
//
// Aggregates ClientNotes from the Collaboration Hub persistence layer
// (data/collaboration-store.json) across all real engine tasks belonging
// to a given client — or across ALL clients when no clientId is provided.
//
// The chain: master-clients → engine projects (by clientId) → taskIds
//             → collaboration-store.json[taskId].clientNotes
//
// GET  /api/communications
//       → { entries: AggregatedClientNote[] }  (all clients, all notes)
//
// GET  /api/communications?clientId=<mc-id>
//       → { entries: AggregatedClientNote[], clientName: string }
//
// GET  /api/communications?clientId=<mc-id>&taskIds=true
//       → { taskMap: TaskOption[] }  (list of tasks for task picker in Log modal)
//
// POST /api/communications  is NOT implemented here — writes go directly to
//      POST /api/collaboration?taskId=<id>&resource=clientNotes
//      (the Communications page calls that endpoint directly)

import { NextRequest, NextResponse } from "next/server";
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

interface EngineProject {
  id: string;
  name: string;
  clientId?: string;
  clientSlug?: string;
  client?: string;
  taskIds: string[];
}

interface EngineTask {
  id: string;
  projectId: string;
  title: string;
  clientName?: string;
  department?: string;
  status?: string;
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
const ENGINE_FILE  = path.join(process.cwd(), "data", "engine-store.json");
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

function readEngine(): { projects: EngineProject[]; tasks: EngineTask[] } {
  try {
    const raw = fs.readFileSync(ENGINE_FILE, "utf-8");
    const parsed = JSON.parse(raw) as {
      projects?: EngineProject[];
      tasks?: EngineTask[];
    };
    return {
      projects: parsed.projects ?? [],
      tasks:    parsed.tasks    ?? [],
    };
  } catch {
    return { projects: [], tasks: [] };
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
  const clientId    = req.nextUrl.searchParams.get("clientId");
  const taskIdsOnly = req.nextUrl.searchParams.get("taskIds") === "true";

  const { projects, tasks } = readEngine();
  const clients             = readClients();
  const collab              = readCollab();

  // Build lookup maps
  const clientMap  = new Map<string, MasterClient>(clients.map((c) => [c.id, c]));
  const taskMap    = new Map<string, EngineTask>(tasks.map((t) => [t.id, t]));

  // Build: clientId → projects
  const projsByClient = new Map<string, EngineProject[]>();
  for (const proj of projects) {
    const cid = proj.clientId ?? "";
    if (!cid) continue;
    if (!projsByClient.has(cid)) projsByClient.set(cid, []);
    projsByClient.get(cid)!.push(proj);
  }

  // Determine which clientIds to aggregate
  const targetClientIds: string[] = clientId
    ? [clientId]
    : Array.from(projsByClient.keys());

  // ── Task picker mode ──────────────────────────────────────────────────────
  if (taskIdsOnly && clientId) {
    const clientProjects = projsByClient.get(clientId) ?? [];
    const taskOptions: TaskOption[] = [];
    for (const proj of clientProjects) {
      for (const tid of proj.taskIds ?? []) {
        const task = taskMap.get(tid);
        if (!task) continue;
        taskOptions.push({
          taskId:      tid,
          taskTitle:   task.title,
          projectId:   proj.id,
          projectName: proj.name,
          department:  task.department ?? "General",
          status:      task.status    ?? "Unknown",
        });
      }
    }
    return NextResponse.json({ taskOptions });
  }

  // ── Full aggregation ──────────────────────────────────────────────────────
  const entries: AggregatedClientNote[] = [];

  for (const cid of targetClientIds) {
    const client = clientMap.get(cid);
    const clientName = client?.clientName ?? cid;
    const assignedAM = client?.assignedAM ?? "";
    const avatarColor = client?.avatarColor ?? "#6366f1";

    const clientProjects = projsByClient.get(cid) ?? [];

    for (const proj of clientProjects) {
      for (const tid of proj.taskIds ?? []) {
        const task     = taskMap.get(tid);
        const taskTitle = task?.title ?? tid;
        const entry    = collab.tasks[tid];
        if (!entry || !entry.clientNotes || entry.clientNotes.length === 0) continue;

        for (const note of entry.clientNotes) {
          entries.push({
            ...note,
            taskId:      tid,
            taskTitle,
            projectId:   proj.id,
            projectName: proj.name,
            clientId:    cid,
            clientName,
            assignedAM,
            avatarColor,
          });
        }
      }
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
