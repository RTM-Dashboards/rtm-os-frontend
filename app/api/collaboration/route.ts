// RTM OS — Collaboration Store API Route
//
// Persistence layer: reads/writes data/collaboration-store.json (project root).
//
// Stores comments, internalNotes, clientNotes, and watchers per taskId.
// The taskId is the collab sidecar key (e.g. "t-001-2-1") — same key used
// throughout lib/collaboration/mock-data.ts.
//
// GET  /api/collaboration?taskId=<id>
//        → { taskId, comments, internalNotes, clientNotes, watchers }
//          Falls back to empty arrays when the task has no persisted data yet.
//
// POST /api/collaboration?taskId=<id>&resource=comments
//        body: Omit<TaskComment, "id"|"createdAt"|"replies"> (server fills id/createdAt/replies)
//        → { comment: TaskComment }
//
// POST /api/collaboration?taskId=<id>&resource=replies
//        body: { parentId: string } & Omit<CommentReply, "id"|"createdAt">
//        → { reply: CommentReply }
//
// POST /api/collaboration?taskId=<id>&resource=internalNotes
//        body: Omit<InternalNote, "id"|"createdAt">
//        → { note: InternalNote }
//
// POST /api/collaboration?taskId=<id>&resource=clientNotes
//        body: Omit<ClientNote, "id"|"createdAt">
//        → { note: ClientNote }
//
// POST /api/collaboration?taskId=<id>&resource=watchers
//        body: Omit<TaskWatcher, "id">  (upserts by name — adds if new, does nothing if exists)
//        → { watcher: TaskWatcher }
//
// PATCH /api/collaboration?taskId=<id>&resource=comments&id=<commentId>
//        body: Partial<{ body: string; pinned: boolean; resolved: boolean; editedAt: string }>
//        → { comment: TaskComment }
//
// PATCH /api/collaboration?taskId=<id>&resource=watchers&id=<watcherId>
//        body: { watching: boolean }
//        → { watcher: TaskWatcher }
//
// DELETE /api/collaboration?taskId=<id>&resource=comments&id=<commentId>
//        → { ok: true }

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ── Inline types (mirror lib/collaboration/types.ts — no client imports in route) ──

interface Mention {
  id: string;
  kind: string;
  label: string;
}

interface CommentAttachment {
  id: string;
  fileName: string;
  fileType: string;
  url: string;
}

interface CommentReply {
  id: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  authorColor: string;
  body: string;
  mentions: Mention[];
  createdAt: string;
}

interface TaskComment {
  id: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  authorColor: string;
  body: string;
  mentions: Mention[];
  attachments: CommentAttachment[];
  status: string;
  createdAt: string;
  editedAt?: string;
  replies: CommentReply[];
  pinned: boolean;
  resolved: boolean;
}

interface InternalNote {
  id: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  authorColor: string;
  department: string;
  priority: string;
  body: string;
  createdAt: string;
}

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

interface TaskWatcher {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  role: string;
  department: string;
  watching: boolean;
}

interface TaskCollabEntry {
  comments:      TaskComment[];
  internalNotes: InternalNote[];
  clientNotes:   ClientNote[];
  watchers:      TaskWatcher[];
}

interface CollabStoreFile {
  tasks: Record<string, TaskCollabEntry>;
}

// ── File path ──────────────────────────────────────────────────────────────────

const DATA_FILE = path.join(process.cwd(), "data", "collaboration-store.json");

// ── File I/O ──────────────────────────────────────────────────────────────────

function readStore(): CollabStoreFile {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<CollabStoreFile>;
    return {
      tasks: parsed.tasks ?? {},
    };
  } catch {
    return { tasks: {} };
  }
}

function writeStore(store: CollabStoreFile): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
}

function getOrCreateEntry(store: CollabStoreFile, taskId: string): TaskCollabEntry {
  if (!store.tasks[taskId]) {
    store.tasks[taskId] = {
      comments:      [],
      internalNotes: [],
      clientNotes:   [],
      watchers:      [],
    };
  }
  return store.tasks[taskId];
}

// ── ID generation ─────────────────────────────────────────────────────────────

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const taskId = req.nextUrl.searchParams.get("taskId");
  if (!taskId) {
    return NextResponse.json({ error: "taskId query param required" }, { status: 400 });
  }

  const store = readStore();
  const entry = store.tasks[taskId] ?? {
    comments:      [],
    internalNotes: [],
    clientNotes:   [],
    watchers:      [],
  };

  return NextResponse.json({ taskId, ...entry });
}

// ── POST ───────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  const taskId   = req.nextUrl.searchParams.get("taskId");
  const resource = req.nextUrl.searchParams.get("resource");

  if (!taskId)   return NextResponse.json({ error: "taskId required" }, { status: 400 });
  if (!resource) return NextResponse.json({ error: "resource required" }, { status: 400 });

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const store = readStore();
  const entry = getOrCreateEntry(store, taskId);
  const now   = new Date().toISOString();

  // ── comments ────────────────────────────────────────────────────────────────
  if (resource === "comments") {
    if (!body.body || typeof body.body !== "string" || !body.body.trim()) {
      return NextResponse.json({ error: "body required" }, { status: 400 });
    }
    const comment: TaskComment = {
      id:             generateId("c"),
      authorId:       (body.authorId as string)       || "current-user",
      authorName:     (body.authorName as string)     || "You",
      authorInitials: (body.authorInitials as string) || "YO",
      authorColor:    (body.authorColor as string)    || "#1B4FD8",
      body:           body.body as string,
      mentions:       (body.mentions as Mention[])    || [],
      attachments:    [],
      status:         "Active",
      createdAt:      now,
      replies:        [],
      pinned:         false,
      resolved:       false,
    };
    entry.comments.push(comment);
    writeStore(store);
    return NextResponse.json({ comment });
  }

  // ── replies ─────────────────────────────────────────────────────────────────
  if (resource === "replies") {
    const parentId = body.parentId as string;
    if (!parentId) return NextResponse.json({ error: "parentId required" }, { status: 400 });
    if (!body.body || typeof body.body !== "string" || !body.body.trim()) {
      return NextResponse.json({ error: "body required" }, { status: 400 });
    }
    const parent = entry.comments.find((c) => c.id === parentId);
    if (!parent) return NextResponse.json({ error: "parent comment not found" }, { status: 404 });

    const reply: CommentReply = {
      id:             generateId("r"),
      authorId:       (body.authorId as string)       || "current-user",
      authorName:     (body.authorName as string)     || "You",
      authorInitials: (body.authorInitials as string) || "YO",
      authorColor:    (body.authorColor as string)    || "#1B4FD8",
      body:           body.body as string,
      mentions:       (body.mentions as Mention[])    || [],
      createdAt:      now,
    };
    parent.replies.push(reply);
    writeStore(store);
    return NextResponse.json({ reply });
  }

  // ── internalNotes ───────────────────────────────────────────────────────────
  if (resource === "internalNotes") {
    if (!body.body || typeof body.body !== "string" || !body.body.trim()) {
      return NextResponse.json({ error: "body required" }, { status: 400 });
    }
    const note: InternalNote = {
      id:             generateId("in"),
      authorId:       (body.authorId as string)       || "current-user",
      authorName:     (body.authorName as string)     || "You",
      authorInitials: (body.authorInitials as string) || "YO",
      authorColor:    (body.authorColor as string)    || "#1B4FD8",
      department:     (body.department as string)     || "General",
      priority:       (body.priority as string)       || "Medium",
      body:           body.body as string,
      createdAt:      now,
    };
    entry.internalNotes.push(note);
    writeStore(store);
    return NextResponse.json({ note });
  }

  // ── clientNotes ─────────────────────────────────────────────────────────────
  if (resource === "clientNotes") {
    if (!body.body || typeof body.body !== "string" || !body.body.trim()) {
      return NextResponse.json({ error: "body required" }, { status: 400 });
    }
    const note: ClientNote = {
      id:             generateId("cn"),
      authorId:       (body.authorId as string)       || "current-user",
      authorName:     (body.authorName as string)     || "You",
      authorInitials: (body.authorInitials as string) || "YO",
      authorColor:    (body.authorColor as string)    || "#1B4FD8",
      source:         (body.source as string)         || "Email",
      body:           body.body as string,
      createdAt:      now,
    };
    entry.clientNotes.push(note);
    writeStore(store);
    return NextResponse.json({ note });
  }

  // ── watchers (upsert) ────────────────────────────────────────────────────────
  if (resource === "watchers") {
    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json({ error: "name required" }, { status: 400 });
    }
    const existing = entry.watchers.find((w) => w.name === (body.name as string));
    if (existing) {
      // Already in list; return as-is
      return NextResponse.json({ watcher: existing });
    }
    const watcher: TaskWatcher = {
      id:          generateId("w"),
      name:        body.name as string,
      initials:    (body.initials as string)    || "YO",
      avatarColor: (body.avatarColor as string) || "#1B4FD8",
      role:        (body.role as string)        || "Team Member",
      department:  (body.department as string)  || "General",
      watching:    true,
    };
    entry.watchers.push(watcher);
    writeStore(store);
    return NextResponse.json({ watcher });
  }

  return NextResponse.json({ error: "unsupported resource" }, { status: 400 });
}

// ── PATCH ──────────────────────────────────────────────────────────────────────

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const taskId   = req.nextUrl.searchParams.get("taskId");
  const resource = req.nextUrl.searchParams.get("resource");
  const id       = req.nextUrl.searchParams.get("id");

  if (!taskId)   return NextResponse.json({ error: "taskId required" }, { status: 400 });
  if (!resource) return NextResponse.json({ error: "resource required" }, { status: 400 });
  if (!id)       return NextResponse.json({ error: "id required" }, { status: 400 });

  let patch: Record<string, unknown>;
  try {
    patch = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const store = readStore();
  const entry = store.tasks[taskId];
  if (!entry) return NextResponse.json({ error: "task not found in store" }, { status: 404 });

  // ── patch comment ──────────────────────────────────────────────────────────
  if (resource === "comments") {
    const idx = entry.comments.findIndex((c) => c.id === id);
    if (idx === -1) return NextResponse.json({ error: "comment not found" }, { status: 404 });
    entry.comments[idx] = { ...entry.comments[idx], ...patch };
    writeStore(store);
    return NextResponse.json({ comment: entry.comments[idx] });
  }

  // ── patch watcher ──────────────────────────────────────────────────────────
  if (resource === "watchers") {
    const idx = entry.watchers.findIndex((w) => w.id === id);
    if (idx === -1) return NextResponse.json({ error: "watcher not found" }, { status: 404 });
    entry.watchers[idx] = { ...entry.watchers[idx], ...patch };
    writeStore(store);
    return NextResponse.json({ watcher: entry.watchers[idx] });
  }

  return NextResponse.json({ error: "unsupported resource for PATCH" }, { status: 400 });
}

// ── DELETE ─────────────────────────────────────────────────────────────────────

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const taskId   = req.nextUrl.searchParams.get("taskId");
  const resource = req.nextUrl.searchParams.get("resource");
  const id       = req.nextUrl.searchParams.get("id");

  if (!taskId)   return NextResponse.json({ error: "taskId required" }, { status: 400 });
  if (!resource) return NextResponse.json({ error: "resource required" }, { status: 400 });
  if (!id)       return NextResponse.json({ error: "id required" }, { status: 400 });

  const store = readStore();
  const entry = store.tasks[taskId];
  if (!entry) return NextResponse.json({ error: "task not found in store" }, { status: 404 });

  if (resource === "comments") {
    const exists = entry.comments.some((c) => c.id === id);
    if (!exists) return NextResponse.json({ error: "comment not found" }, { status: 404 });
    entry.comments = entry.comments.filter((c) => c.id !== id);
    writeStore(store);
    return NextResponse.json({ ok: true, deleted: { commentId: id } });
  }

  return NextResponse.json({ error: "unsupported resource for DELETE" }, { status: 400 });
}
