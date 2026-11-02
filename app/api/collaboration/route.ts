// RTM OS — Collaboration Store API Route
//
// Persistence layer: Postgres tables collab_comments, collab_replies,
// collab_internal_notes, collab_client_notes, collab_watchers.
// Migrated from data/collaboration-store.json (fs.writeFileSync) which was
// silently discarded on every Vercel deploy.
//
// External shape is unchanged:
//   GET  /api/collaboration?taskId=<id>
//          → { taskId, comments, internalNotes, clientNotes, watchers }
//   POST /api/collaboration?taskId=<id>&resource=comments      → { comment }
//   POST /api/collaboration?taskId=<id>&resource=replies       → { reply }
//   POST /api/collaboration?taskId=<id>&resource=internalNotes → { note }
//   POST /api/collaboration?taskId=<id>&resource=clientNotes   → { note }
//   POST /api/collaboration?taskId=<id>&resource=watchers      → { watcher }
//   PATCH /api/collaboration?taskId=<id>&resource=comments&id=<id>  → { comment }
//   PATCH /api/collaboration?taskId=<id>&resource=watchers&id=<id>  → { watcher }
//   DELETE /api/collaboration?taskId=<id>&resource=comments&id=<id> → { ok: true }
//
// Auth guard: getSessionUser — matches the original file-backed route.
//
// task_id existence: collab tables have REFERENCES tasks(id) ON DELETE CASCADE.
// Inserting a collaboration row for a task_id that does not exist in tasks will
// be rejected by Postgres with a FK violation; the route returns 400 in that case.

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

// ── Inline types (mirror lib/collaboration/types.ts) ──────────────────────────

interface Mention { id: string; kind: string; label: string }
interface CommentAttachment { id: string; fileName: string; fileType: string; url: string }
interface CommentReply {
  id: string; authorId: string; authorName: string; authorInitials: string;
  authorColor: string; body: string; mentions: Mention[]; createdAt: string;
}
interface TaskComment {
  id: string; authorId: string; authorName: string; authorInitials: string;
  authorColor: string; body: string; mentions: Mention[]; attachments: CommentAttachment[];
  status: string; createdAt: string; editedAt?: string; replies: CommentReply[];
  pinned: boolean; resolved: boolean;
}
interface InternalNote {
  id: string; authorId: string; authorName: string; authorInitials: string;
  authorColor: string; department: string; priority: string; body: string; createdAt: string;
}
interface ClientNote {
  id: string; authorId: string; authorName: string; authorInitials: string;
  authorColor: string; source: string; body: string; createdAt: string;
}
interface TaskWatcher {
  id: string; name: string; initials: string; avatarColor: string;
  role: string; department: string; watching: boolean;
}

// ── DB row types ──────────────────────────────────────────────────────────────

interface CommentRow {
  id: string; task_id: string; authorId: string; authorName: string;
  authorInitials: string; authorColor: string; body: string;
  mentions: unknown; attachments: unknown; status: string;
  pinned: boolean; resolved: boolean; createdAt: string; editedAt: string | null;
}
interface ReplyRow {
  id: string; comment_id: string; authorId: string; authorName: string;
  authorInitials: string; authorColor: string; body: string;
  mentions: unknown; createdAt: string;
}
interface InternalNoteRow {
  id: string; task_id: string; authorId: string; authorName: string;
  authorInitials: string; authorColor: string; department: string;
  priority: string; body: string; createdAt: string;
}
interface ClientNoteRow {
  id: string; task_id: string; authorId: string; authorName: string;
  authorInitials: string; authorColor: string; source: string;
  body: string; createdAt: string;
}
interface WatcherRow {
  id: string; task_id: string; name: string; initials: string;
  avatarColor: string; role: string; department: string; watching: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function rowToComment(row: CommentRow, replies: CommentReply[]): TaskComment {
  return {
    id:             row.id,
    authorId:       row.authorId,
    authorName:     row.authorName,
    authorInitials: row.authorInitials,
    authorColor:    row.authorColor,
    body:           row.body,
    mentions:       (row.mentions as Mention[]) ?? [],
    attachments:    (row.attachments as CommentAttachment[]) ?? [],
    status:         row.status,
    createdAt:      row.createdAt,
    editedAt:       row.editedAt ?? undefined,
    replies,
    pinned:         row.pinned,
    resolved:       row.resolved,
  };
}

function rowToReply(row: ReplyRow): CommentReply {
  return {
    id:             row.id,
    authorId:       row.authorId,
    authorName:     row.authorName,
    authorInitials: row.authorInitials,
    authorColor:    row.authorColor,
    body:           row.body,
    mentions:       (row.mentions as Mention[]) ?? [],
    createdAt:      row.createdAt,
  };
}

function rowToNote(row: InternalNoteRow): InternalNote {
  return {
    id: row.id, authorId: row.authorId, authorName: row.authorName,
    authorInitials: row.authorInitials, authorColor: row.authorColor,
    department: row.department, priority: row.priority, body: row.body, createdAt: row.createdAt,
  };
}

function rowToClientNote(row: ClientNoteRow): ClientNote {
  return {
    id: row.id, authorId: row.authorId, authorName: row.authorName,
    authorInitials: row.authorInitials, authorColor: row.authorColor,
    source: row.source, body: row.body, createdAt: row.createdAt,
  };
}

function rowToWatcher(row: WatcherRow): TaskWatcher {
  return {
    id: row.id, name: row.name, initials: row.initials, avatarColor: row.avatarColor,
    role: row.role, department: row.department, watching: row.watching,
  };
}

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status! });
  void user;

  const taskId = req.nextUrl.searchParams.get("taskId");
  if (!taskId) return NextResponse.json({ error: "taskId query param required" }, { status: 400 });

  const [commentRows, replyRows, noteRows, clientNoteRows, watcherRows] = await Promise.all([
    prisma.$queryRawUnsafe<CommentRow[]>(
      `SELECT * FROM collab_comments WHERE task_id = $1 ORDER BY "createdAt" ASC`, taskId
    ),
    prisma.$queryRawUnsafe<ReplyRow[]>(
      `SELECT r.* FROM collab_replies r
       JOIN collab_comments c ON r.comment_id = c.id
       WHERE c.task_id = $1
       ORDER BY r."createdAt" ASC`, taskId
    ),
    prisma.$queryRawUnsafe<InternalNoteRow[]>(
      `SELECT * FROM collab_internal_notes WHERE task_id = $1 ORDER BY "createdAt" ASC`, taskId
    ),
    prisma.$queryRawUnsafe<ClientNoteRow[]>(
      `SELECT * FROM collab_client_notes WHERE task_id = $1 ORDER BY "createdAt" ASC`, taskId
    ),
    prisma.$queryRawUnsafe<WatcherRow[]>(
      `SELECT * FROM collab_watchers WHERE task_id = $1 ORDER BY name ASC`, taskId
    ),
  ]);

  // Group replies by comment_id
  const replyMap = new Map<string, CommentReply[]>();
  for (const r of replyRows) {
    const arr = replyMap.get(r.comment_id) ?? [];
    arr.push(rowToReply(r));
    replyMap.set(r.comment_id, arr);
  }

  const comments      = commentRows.map((c) => rowToComment(c, replyMap.get(c.id) ?? []));
  const internalNotes = noteRows.map(rowToNote);
  const clientNotes   = clientNoteRows.map(rowToClientNote);
  const watchers      = watcherRows.map(rowToWatcher);

  return NextResponse.json({ taskId, comments, internalNotes, clientNotes, watchers });
}

// ── POST ───────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status! });
  void user;

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

  const now = new Date().toISOString();

  // ── comments ────────────────────────────────────────────────────────────────
  if (resource === "comments") {
    if (!body.body || typeof body.body !== "string" || !body.body.trim())
      return NextResponse.json({ error: "body required" }, { status: 400 });

    const id = generateId("c");
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO collab_comments
           (id, task_id, "authorId", "authorName", "authorInitials", "authorColor",
            body, mentions, attachments, status, pinned, resolved, "createdAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10,$11,$12,$13)`,
        id, taskId,
        String(body.authorId ?? "current-user"),
        String(body.authorName ?? "You"),
        String(body.authorInitials ?? "YO"),
        String(body.authorColor ?? "#1B4FD8"),
        body.body as string,
        JSON.stringify(body.mentions ?? []),
        JSON.stringify([]),
        "Active", false, false, now
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("foreign key")) return NextResponse.json({ error: "task not found" }, { status: 400 });
      throw e;
    }

    const comment: TaskComment = {
      id, authorId: String(body.authorId ?? "current-user"),
      authorName: String(body.authorName ?? "You"),
      authorInitials: String(body.authorInitials ?? "YO"),
      authorColor: String(body.authorColor ?? "#1B4FD8"),
      body: body.body as string, mentions: (body.mentions as Mention[]) ?? [],
      attachments: [], status: "Active", createdAt: now, replies: [],
      pinned: false, resolved: false,
    };
    return NextResponse.json({ comment });
  }

  // ── replies ─────────────────────────────────────────────────────────────────
  if (resource === "replies") {
    const parentId = body.parentId as string;
    if (!parentId) return NextResponse.json({ error: "parentId required" }, { status: 400 });
    if (!body.body || typeof body.body !== "string" || !body.body.trim())
      return NextResponse.json({ error: "body required" }, { status: 400 });

    const parentRows = await prisma.$queryRawUnsafe<{ id: string }[]>(
      `SELECT id FROM collab_comments WHERE id = $1 AND task_id = $2 LIMIT 1`,
      parentId, taskId
    );
    if (parentRows.length === 0)
      return NextResponse.json({ error: "parent comment not found" }, { status: 404 });

    const id = generateId("r");
    await prisma.$executeRawUnsafe(
      `INSERT INTO collab_replies
         (id, comment_id, "authorId", "authorName", "authorInitials", "authorColor",
          body, mentions, "createdAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9)`,
      id, parentId,
      String(body.authorId ?? "current-user"),
      String(body.authorName ?? "You"),
      String(body.authorInitials ?? "YO"),
      String(body.authorColor ?? "#1B4FD8"),
      body.body as string,
      JSON.stringify(body.mentions ?? []),
      now
    );

    const reply: CommentReply = {
      id, authorId: String(body.authorId ?? "current-user"),
      authorName: String(body.authorName ?? "You"),
      authorInitials: String(body.authorInitials ?? "YO"),
      authorColor: String(body.authorColor ?? "#1B4FD8"),
      body: body.body as string, mentions: (body.mentions as Mention[]) ?? [],
      createdAt: now,
    };
    return NextResponse.json({ reply });
  }

  // ── internalNotes ───────────────────────────────────────────────────────────
  if (resource === "internalNotes") {
    if (!body.body || typeof body.body !== "string" || !body.body.trim())
      return NextResponse.json({ error: "body required" }, { status: 400 });

    const id = generateId("in");
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO collab_internal_notes
           (id, task_id, "authorId", "authorName", "authorInitials", "authorColor",
            department, priority, body, "createdAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        id, taskId,
        String(body.authorId ?? "current-user"),
        String(body.authorName ?? "You"),
        String(body.authorInitials ?? "YO"),
        String(body.authorColor ?? "#1B4FD8"),
        String(body.department ?? "General"),
        String(body.priority ?? "Medium"),
        body.body as string, now
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("foreign key")) return NextResponse.json({ error: "task not found" }, { status: 400 });
      throw e;
    }

    const note: InternalNote = {
      id, authorId: String(body.authorId ?? "current-user"),
      authorName: String(body.authorName ?? "You"),
      authorInitials: String(body.authorInitials ?? "YO"),
      authorColor: String(body.authorColor ?? "#1B4FD8"),
      department: String(body.department ?? "General"),
      priority: String(body.priority ?? "Medium"),
      body: body.body as string, createdAt: now,
    };
    return NextResponse.json({ note });
  }

  // ── clientNotes ─────────────────────────────────────────────────────────────
  if (resource === "clientNotes") {
    if (!body.body || typeof body.body !== "string" || !body.body.trim())
      return NextResponse.json({ error: "body required" }, { status: 400 });

    const id = generateId("cn");
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO collab_client_notes
           (id, task_id, "authorId", "authorName", "authorInitials", "authorColor",
            source, body, "createdAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        id, taskId,
        String(body.authorId ?? "current-user"),
        String(body.authorName ?? "You"),
        String(body.authorInitials ?? "YO"),
        String(body.authorColor ?? "#1B4FD8"),
        String(body.source ?? "Email"),
        body.body as string, now
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("foreign key")) return NextResponse.json({ error: "task not found" }, { status: 400 });
      throw e;
    }

    const note: ClientNote = {
      id, authorId: String(body.authorId ?? "current-user"),
      authorName: String(body.authorName ?? "You"),
      authorInitials: String(body.authorInitials ?? "YO"),
      authorColor: String(body.authorColor ?? "#1B4FD8"),
      source: String(body.source ?? "Email"),
      body: body.body as string, createdAt: now,
    };
    return NextResponse.json({ note });
  }

  // ── watchers (upsert by name) ─────────────────────────────────────────────
  if (resource === "watchers") {
    if (!body.name || typeof body.name !== "string")
      return NextResponse.json({ error: "name required" }, { status: 400 });

    // Upsert: ON CONFLICT (task_id, name) DO NOTHING
    const id = generateId("w");
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO collab_watchers
           (id, task_id, name, initials, "avatarColor", role, department, watching)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (task_id, name) DO NOTHING`,
        id, taskId,
        body.name as string,
        String(body.initials ?? "YO"),
        String(body.avatarColor ?? "#1B4FD8"),
        String(body.role ?? "Team Member"),
        String(body.department ?? "General"),
        true
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("foreign key")) return NextResponse.json({ error: "task not found" }, { status: 400 });
      throw e;
    }

    // Return the existing-or-inserted watcher
    const rows = await prisma.$queryRawUnsafe<WatcherRow[]>(
      `SELECT * FROM collab_watchers WHERE task_id = $1 AND name = $2 LIMIT 1`,
      taskId, body.name as string
    );
    return NextResponse.json({ watcher: rowToWatcher(rows[0]) });
  }

  return NextResponse.json({ error: "unsupported resource" }, { status: 400 });
}

// ── PATCH ──────────────────────────────────────────────────────────────────────

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status! });
  void user;

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

  // ── patch comment ──────────────────────────────────────────────────────────
  if (resource === "comments") {
    const rows = await prisma.$queryRawUnsafe<CommentRow[]>(
      `SELECT * FROM collab_comments WHERE id = $1 AND task_id = $2 LIMIT 1`, id, taskId
    );
    if (rows.length === 0) return NextResponse.json({ error: "comment not found" }, { status: 404 });

    const allowed = ["body", "pinned", "resolved", "editedAt"] as const;
    const setClauses: string[] = [];
    const params: unknown[] = [];
    let pi = 1;
    for (const key of allowed) {
      if (key in patch) {
        setClauses.push(`"${key}" = $${pi}`);
        params.push(patch[key] === null ? null : typeof patch[key] === "boolean" ? patch[key] : String(patch[key]));
        pi++;
      }
    }
    if (setClauses.length === 0) return NextResponse.json({ error: "no patchable fields" }, { status: 400 });
    params.push(id, taskId);
    await prisma.$executeRawUnsafe(
      `UPDATE collab_comments SET ${setClauses.join(", ")} WHERE id = $${pi} AND task_id = $${pi + 1}`,
      ...params
    );

    const updated = await prisma.$queryRawUnsafe<CommentRow[]>(
      `SELECT * FROM collab_comments WHERE id = $1 AND task_id = $2 LIMIT 1`, id, taskId
    );
    const replyRows = await prisma.$queryRawUnsafe<ReplyRow[]>(
      `SELECT * FROM collab_replies WHERE comment_id = $1 ORDER BY "createdAt" ASC`, id
    );
    return NextResponse.json({ comment: rowToComment(updated[0], replyRows.map(rowToReply)) });
  }

  // ── patch watcher ──────────────────────────────────────────────────────────
  if (resource === "watchers") {
    const rows = await prisma.$queryRawUnsafe<WatcherRow[]>(
      `SELECT * FROM collab_watchers WHERE id = $1 AND task_id = $2 LIMIT 1`, id, taskId
    );
    if (rows.length === 0) return NextResponse.json({ error: "watcher not found" }, { status: 404 });

    if ("watching" in patch) {
      await prisma.$executeRawUnsafe(
        `UPDATE collab_watchers SET watching = $1 WHERE id = $2 AND task_id = $3`,
        Boolean(patch.watching), id, taskId
      );
    }
    const updated = await prisma.$queryRawUnsafe<WatcherRow[]>(
      `SELECT * FROM collab_watchers WHERE id = $1 AND task_id = $2 LIMIT 1`, id, taskId
    );
    return NextResponse.json({ watcher: rowToWatcher(updated[0]) });
  }

  return NextResponse.json({ error: "unsupported resource for PATCH" }, { status: 400 });
}

// ── DELETE ─────────────────────────────────────────────────────────────────────

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status! });
  void user;

  const taskId   = req.nextUrl.searchParams.get("taskId");
  const resource = req.nextUrl.searchParams.get("resource");
  const id       = req.nextUrl.searchParams.get("id");

  if (!taskId)   return NextResponse.json({ error: "taskId required" }, { status: 400 });
  if (!resource) return NextResponse.json({ error: "resource required" }, { status: 400 });
  if (!id)       return NextResponse.json({ error: "id required" }, { status: 400 });

  if (resource === "comments") {
    const rows = await prisma.$queryRawUnsafe<{ id: string }[]>(
      `SELECT id FROM collab_comments WHERE id = $1 AND task_id = $2 LIMIT 1`, id, taskId
    );
    if (rows.length === 0) return NextResponse.json({ error: "comment not found" }, { status: 404 });
    // ON DELETE CASCADE removes replies automatically
    await prisma.$executeRawUnsafe(
      `DELETE FROM collab_comments WHERE id = $1 AND task_id = $2`, id, taskId
    );
    return NextResponse.json({ ok: true, deleted: { commentId: id } });
  }

  return NextResponse.json({ error: "unsupported resource for DELETE" }, { status: 400 });
}
