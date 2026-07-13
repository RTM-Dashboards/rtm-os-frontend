// RTM OS — Engine Store API Route
//
// Persistence layer: reads/writes data/engine-store.json (project root).
//
// Replaces unreliable in-memory ENGINE_STORE module singleton. All cross-route-
// group reads and writes go through this single file-backed API so that
// (account-management), (shell), and every other route group always sees the
// same live data, regardless of Next.js / Turbopack module-chunking in dev mode.
//
// GET  /api/engine                           → { projects, milestones, tasks, blueprints, users }
// GET  /api/engine?resource=projects         → { projects: Project[] }
// GET  /api/engine?resource=tasks            → { tasks: Task[] }
// GET  /api/engine?resource=milestones       → { milestones: Milestone[] }
// GET  /api/engine?resource=blueprints       → { blueprints: TaskBlueprint[] }
// GET  /api/engine?resource=users            → { users: AssignedUser[] }
// POST /api/engine                           → body: { projects?, milestones?, tasks? }
//                                              (appends each array to the store)
// PATCH /api/engine?resource=tasks&id=<id>  → body: Partial<Task> — updates a single task
// PATCH /api/engine?resource=projects&id=<id> → body: Partial<Project> — updates a single project
// DELETE /api/engine?resource=projects&id=<id>  → deletes project + its milestones + its tasks
// DELETE /api/engine?resource=tasks&id=<id>     → deletes a single task
// DELETE /api/engine?resource=milestones&id=<id> → deletes a single milestone

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ── File path ──────────────────────────────────────────────────────────────────

const DATA_FILE = path.join(process.cwd(), "data", "engine-store.json");

// ── File I/O ──────────────────────────────────────────────────────────────────

interface EngineStoreFile {
  projects:   Record<string, unknown>[];
  milestones: Record<string, unknown>[];
  tasks:      Record<string, unknown>[];
  blueprints: Record<string, unknown>[];
  users:      Record<string, unknown>[];
}

function readStore(): EngineStoreFile {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<EngineStoreFile>;
    return {
      projects:   parsed.projects   ?? [],
      milestones: parsed.milestones ?? [],
      tasks:      parsed.tasks      ?? [],
      blueprints: parsed.blueprints ?? [],
      users:      parsed.users      ?? [],
    };
  } catch {
    return { projects: [], milestones: [], tasks: [], blueprints: [], users: [] };
  }
}

function writeStore(store: EngineStoreFile): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
}

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const store = readStore();
  const resource = req.nextUrl.searchParams.get("resource");

  if (resource === "projects")   return NextResponse.json({ projects:   store.projects });
  if (resource === "tasks")      return NextResponse.json({ tasks:      store.tasks });
  if (resource === "milestones") return NextResponse.json({ milestones: store.milestones });
  if (resource === "blueprints") return NextResponse.json({ blueprints: store.blueprints });
  if (resource === "users")      return NextResponse.json({ users:      store.users });

  // Full store
  return NextResponse.json(store);
}

// ── POST — append new records ─────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    projects?:   Record<string, unknown>[];
    milestones?: Record<string, unknown>[];
    tasks?:      Record<string, unknown>[];
  };

  const store = readStore();

  if (Array.isArray(body.projects)) {
    // Dedup by id — do not push duplicates
    const existingIds = new Set(store.projects.map((p) => p.id as string));
    for (const p of body.projects) {
      if (!existingIds.has(p.id as string)) {
        store.projects.push(p);
        existingIds.add(p.id as string);
      }
    }
  }

  if (Array.isArray(body.milestones)) {
    const existingIds = new Set(store.milestones.map((m) => m.id as string));
    for (const m of body.milestones) {
      if (!existingIds.has(m.id as string)) {
        store.milestones.push(m);
        existingIds.add(m.id as string);
      }
    }
  }

  if (Array.isArray(body.tasks)) {
    const existingIds = new Set(store.tasks.map((t) => t.id as string));
    for (const t of body.tasks) {
      if (!existingIds.has(t.id as string)) {
        store.tasks.push(t);
        existingIds.add(t.id as string);
      }
    }
  }

  writeStore(store);

  return NextResponse.json({
    ok:        true,
    projectCount:   store.projects.length,
    milestoneCount: store.milestones.length,
    taskCount:      store.tasks.length,
  });
}

// ── PATCH — update a single record ────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  const resource = req.nextUrl.searchParams.get("resource");
  const id       = req.nextUrl.searchParams.get("id");

  if (!resource || !id) {
    return NextResponse.json({ error: "resource and id query params required" }, { status: 400 });
  }

  const patch = (await req.json()) as Record<string, unknown>;
  const store = readStore();

  if (resource === "tasks") {
    const idx = store.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return NextResponse.json({ error: "task not found" }, { status: 404 });
    store.tasks[idx] = { ...store.tasks[idx], ...patch, updatedAt: new Date().toISOString() };
    writeStore(store);
    return NextResponse.json({ task: store.tasks[idx] });
  }

  if (resource === "projects") {
    const idx = store.projects.findIndex((p) => p.id === id);
    if (idx === -1) return NextResponse.json({ error: "project not found" }, { status: 404 });
    store.projects[idx] = { ...store.projects[idx], ...patch, updatedAt: new Date().toISOString() };
    writeStore(store);
    return NextResponse.json({ project: store.projects[idx] });
  }

  return NextResponse.json({ error: "unsupported resource" }, { status: 400 });
}

// ── DELETE — remove records ─────────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const resource = req.nextUrl.searchParams.get("resource");
  const id       = req.nextUrl.searchParams.get("id");

  if (!resource || !id) {
    return NextResponse.json({ error: "resource and id query params required" }, { status: 400 });
  }

  const store = readStore();

  if (resource === "projects") {
    const projectExists = store.projects.some((p) => p.id === id);
    if (!projectExists) return NextResponse.json({ error: "project not found" }, { status: 404 });
    // Remove project + all its milestones + all its tasks
    store.projects   = store.projects.filter((p) => p.id !== id);
    store.milestones = store.milestones.filter((m) => m.projectId !== id);
    store.tasks      = store.tasks.filter((t) => t.projectId !== id);
    writeStore(store);
    return NextResponse.json({ ok: true, deleted: { projectId: id } });
  }

  if (resource === "tasks") {
    const exists = store.tasks.some((t) => t.id === id);
    if (!exists) return NextResponse.json({ error: "task not found" }, { status: 404 });
    store.tasks = store.tasks.filter((t) => t.id !== id);
    writeStore(store);
    return NextResponse.json({ ok: true, deleted: { taskId: id } });
  }

  if (resource === "milestones") {
    const exists = store.milestones.some((m) => m.id === id);
    if (!exists) return NextResponse.json({ error: "milestone not found" }, { status: 404 });
    store.milestones = store.milestones.filter((m) => m.id !== id);
    writeStore(store);
    return NextResponse.json({ ok: true, deleted: { milestoneId: id } });
  }

  return NextResponse.json({ error: "unsupported resource" }, { status: 400 });
}
