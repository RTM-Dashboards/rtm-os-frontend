// RTM OS — Pending Sales Tasks API Route
//
// Persistence layer: reads/writes data/pending-sales-tasks.json (project root).
//
// This is the file-backed persistence layer for the cross-workspace
// Billing → Sales task signal, replacing the unreliable in-memory module
// singleton that caused cross-route-group desync between the Billing Invoices
// page ((billing) route group) and the Sales Tasks page ((sales) route group).
//
// GET  /api/pending-sales-tasks       → { tasks: WorkspaceTask[] }
// POST /api/pending-sales-tasks       → body: WorkspaceTask  → { task: WorkspaceTask }
//                                       (id must be present; dedup by id on read)

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ── Types (inline — mirrors WorkspaceTask in components/workspace/WorkspaceTaskPage.tsx) ──

type WorkspaceTaskStatus   = "Pending" | "In Progress" | "In Review" | "Blocked" | "Done";
type WorkspaceTaskPriority = "Low" | "Medium" | "High" | "Critical";
type WorkspaceTaskSource   = "Task Blueprint" | "Workflow Automation" | "Manual Task";

export interface WorkspaceTask {
  id: string;
  title: string;
  client: string;
  project: string;
  department: string;
  service: string;
  source: WorkspaceTaskSource;
  blueprintSource?: string;
  workflowSource?: string;
  assignee: string;
  priority: WorkspaceTaskPriority;
  dueDate: string;
  status: WorkspaceTaskStatus;
  blocker?: string | null;
  owner?: string;
  due?: string;
}

interface TaskFile {
  tasks: WorkspaceTask[];
}

// ── File path ──────────────────────────────────────────────────────────────────

const DATA_FILE = path.join(process.cwd(), "data", "pending-sales-tasks.json");

// ── File I/O ───────────────────────────────────────────────────────────────────

function readTasks(): WorkspaceTask[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as TaskFile;
    if (!Array.isArray(parsed.tasks)) throw new Error("bad shape");
    return parsed.tasks;
  } catch {
    return [];
  }
}

function writeTasks(tasks: WorkspaceTask[]): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify({ tasks }, null, 2), "utf-8");
}

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  const tasks = readTasks();
  return NextResponse.json({ tasks });
}

// ── POST ───────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const task = body as WorkspaceTask;
  if (!task || typeof task.id !== "string" || typeof task.title !== "string") {
    return NextResponse.json(
      { error: "Body must be a WorkspaceTask with id and title" },
      { status: 400 }
    );
  }

  const tasks = readTasks();
  // Dedup: skip if a task with this id already exists.
  if (!tasks.find((t) => t.id === task.id)) {
    tasks.push(task);
    try {
      writeTasks(tasks);
    } catch (err) {
      return NextResponse.json({ error: String(err) }, { status: 500 });
    }
  }

  return NextResponse.json({ task });
}
