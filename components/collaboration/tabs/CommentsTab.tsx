"use client";

import { useState, useTransition } from "react";
import type { TaskComment, CommentReply } from "@/lib/collaboration/types";
import { Avatar, MentionBadge, relativeTime, FileIcon, EmptyTab } from "../CollabUtils";

// ─────────────────────────────────────────────────────────────────────────────
// Current-user stub — in a real auth layer this would come from session context.
// Centralised here so every action in this tab uses the same author identity.
// ─────────────────────────────────────────────────────────────────────────────
const CURRENT_USER = {
  id:       "current-user",
  name:     "You",
  initials: "YO",
  color:    "#1B4FD8",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function CommentStatusBadge({ pinned, resolved }: { pinned: boolean; resolved: boolean }) {
  if (pinned)   return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "#FEF3C7", color: "#92400E" }}>📌 Pinned</span>;
  if (resolved) return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "#D1FAE5", color: "#065F46" }}>✓ Resolved</span>;
  return null;
}

function renderBody(body: string) {
  const parts = body.split(/(@\S[^@]*?)(?=\s@|\s|$)/g);
  return parts.map((part, i) =>
    part.startsWith("@") ? (
      <span key={i} className="font-semibold rounded px-0.5" style={{ color: "#1B4FD8", background: "#EBF0FD" }}>
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

// ── API helpers ───────────────────────────────────────────────────────────────

async function apiPost(taskId: string, resource: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/collaboration?taskId=${encodeURIComponent(taskId)}&resource=${resource}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<Record<string, unknown>>;
}

async function apiPatch(taskId: string, resource: string, id: string, body: Record<string, unknown>) {
  const res = await fetch(
    `/api/collaboration?taskId=${encodeURIComponent(taskId)}&resource=${resource}&id=${encodeURIComponent(id)}`,
    { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<Record<string, unknown>>;
}

async function apiDelete(taskId: string, resource: string, id: string) {
  const res = await fetch(
    `/api/collaboration?taskId=${encodeURIComponent(taskId)}&resource=${resource}&id=${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<Record<string, unknown>>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Reply compose row (shown inline under a comment when Reply is clicked)
// ─────────────────────────────────────────────────────────────────────────────

function ReplyCompose({
  taskId,
  parentId,
  onSaved,
  onCancel,
}: {
  taskId: string;
  parentId: string;
  onSaved: (reply: CommentReply) => void;
  onCancel: () => void;
}) {
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState("");

  function submit() {
    const trimmed = body.trim();
    if (!trimmed) return;
    setErr("");
    startTransition(async () => {
      try {
        const data = await apiPost(taskId, "replies", {
          parentId,
          body: trimmed,
          authorId:       CURRENT_USER.id,
          authorName:     CURRENT_USER.name,
          authorInitials: CURRENT_USER.initials,
          authorColor:    CURRENT_USER.color,
        });
        onSaved(data.reply as CommentReply);
        setBody("");
      } catch {
        setErr("Failed to save reply. Try again.");
      }
    });
  }

  return (
    <div className="mt-2 pl-4" style={{ borderLeft: "2px solid var(--rtm-border)" }}>
      <textarea
        rows={2}
        autoFocus
        placeholder="Write a reply…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full resize-none rounded-lg px-3 py-2 text-xs outline-none"
        style={{
          background: "var(--rtm-surface)",
          border: "1px solid var(--rtm-border)",
          color: "var(--rtm-text-primary)",
        }}
      />
      {err && <p className="text-[10px] text-red-500 mt-0.5">{err}</p>}
      <div className="flex items-center gap-2 mt-1.5">
        <button
          onClick={submit}
          disabled={pending || !body.trim()}
          className="text-[11px] px-3 py-1 rounded-lg font-semibold text-white transition-opacity"
          style={{ background: "var(--rtm-blue)", opacity: pending || !body.trim() ? 0.5 : 1 }}
        >
          {pending ? "Posting…" : "Post Reply"}
        </button>
        <button
          onClick={onCancel}
          className="text-[11px] px-2 py-1 rounded"
          style={{ color: "var(--rtm-text-muted)" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Edit compose row (shown inline when Edit is clicked)
// ─────────────────────────────────────────────────────────────────────────────

function EditCompose({
  taskId,
  comment,
  onSaved,
  onCancel,
}: {
  taskId: string;
  comment: TaskComment;
  onSaved: (updated: TaskComment) => void;
  onCancel: () => void;
}) {
  const [body, setBody] = useState(comment.body);
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState("");

  function submit() {
    const trimmed = body.trim();
    if (!trimmed || trimmed === comment.body) { onCancel(); return; }
    setErr("");
    startTransition(async () => {
      try {
        const data = await apiPatch(taskId, "comments", comment.id, {
          body: trimmed,
          editedAt: new Date().toISOString(),
        });
        onSaved(data.comment as TaskComment);
      } catch {
        setErr("Failed to save edit. Try again.");
      }
    });
  }

  return (
    <div className="mt-2">
      <textarea
        rows={3}
        autoFocus
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full resize-none rounded-lg px-3 py-2 text-sm outline-none"
        style={{
          background: "var(--rtm-bg)",
          border: "1px solid var(--rtm-blue)",
          color: "var(--rtm-text-primary)",
        }}
      />
      {err && <p className="text-[10px] text-red-500 mt-0.5">{err}</p>}
      <div className="flex items-center gap-2 mt-1.5">
        <button
          onClick={submit}
          disabled={pending || !body.trim()}
          className="text-[11px] px-3 py-1 rounded-lg font-semibold text-white"
          style={{ background: "var(--rtm-blue)", opacity: pending || !body.trim() ? 0.5 : 1 }}
        >
          {pending ? "Saving…" : "Save Edit"}
        </button>
        <button
          onClick={onCancel}
          className="text-[11px] px-2 py-1 rounded"
          style={{ color: "var(--rtm-text-muted)" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Single comment card
// ─────────────────────────────────────────────────────────────────────────────

function CommentCard({
  comment,
  taskId,
  onUpdate,
  onDelete,
  onReplyAdded,
}: {
  comment: TaskComment;
  taskId: string;
  onUpdate: (updated: TaskComment) => void;
  onDelete: (id: string) => void;
  onReplyAdded: (commentId: string, reply: CommentReply) => void;
}) {
  const [showReply,  setShowReply]  = useState(false);
  const [showEdit,   setShowEdit]   = useState(false);
  const [actPending, startAct]      = useTransition();

  function handlePin() {
    startAct(async () => {
      try {
        const data = await apiPatch(taskId, "comments", comment.id, { pinned: !comment.pinned });
        onUpdate(data.comment as TaskComment);
      } catch { /* silent */ }
    });
  }

  function handleResolve() {
    startAct(async () => {
      try {
        const data = await apiPatch(taskId, "comments", comment.id, { resolved: !comment.resolved });
        onUpdate(data.comment as TaskComment);
      } catch { /* silent */ }
    });
  }

  function handleDelete() {
    if (!confirm("Delete this comment?")) return;
    startAct(async () => {
      try {
        await apiDelete(taskId, "comments", comment.id);
        onDelete(comment.id);
      } catch { /* silent */ }
    });
  }

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: comment.pinned ? "#FFFBEB" : comment.resolved ? "#F0FDF4" : "var(--rtm-surface)",
        border: `1px solid ${comment.pinned ? "#FDE68A" : comment.resolved ? "#BBF7D0" : "var(--rtm-border)"}`,
        opacity: actPending ? 0.7 : 1,
        transition: "opacity 0.15s",
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <Avatar initials={comment.authorInitials} color={comment.authorColor} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
              {comment.authorName}
            </span>
            <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>
              {relativeTime(comment.createdAt)}
            </span>
            {comment.editedAt && (
              <span className="text-[10px] italic" style={{ color: "var(--rtm-text-muted)" }}>(edited)</span>
            )}
            <CommentStatusBadge pinned={comment.pinned} resolved={comment.resolved} />
          </div>

          {/* Body or edit form */}
          {showEdit ? (
            <EditCompose
              taskId={taskId}
              comment={comment}
              onSaved={(updated) => { onUpdate(updated); setShowEdit(false); }}
              onCancel={() => setShowEdit(false)}
            />
          ) : (
            <p className="text-sm leading-relaxed" style={{ color: "var(--rtm-text-secondary)" }}>
              {renderBody(comment.body)}
            </p>
          )}

          {/* Mentions */}
          {comment.mentions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {comment.mentions.map((m) => (
                <MentionBadge key={m.id} label={m.label} kind={m.kind} />
              ))}
            </div>
          )}

          {/* Attachments */}
          {comment.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {comment.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)" }}
                >
                  <FileIcon type={att.fileType} />
                  <span>{att.fileName}</span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          {!showEdit && (
            <div className="flex items-center gap-4 mt-2">
              <ActionBtn onClick={() => setShowReply((v) => !v)} disabled={actPending}>
                {showReply ? "Cancel Reply" : "Reply"}
              </ActionBtn>
              <ActionBtn onClick={() => setShowEdit(true)} disabled={actPending}>
                Edit
              </ActionBtn>
              <ActionBtn onClick={handlePin} disabled={actPending}>
                {comment.pinned ? "Unpin" : "Pin"}
              </ActionBtn>
              <ActionBtn onClick={handleResolve} disabled={actPending}>
                {comment.resolved ? "Unresolve" : "Resolve"}
              </ActionBtn>
              <ActionBtn onClick={handleDelete} disabled={actPending} danger>
                Delete
              </ActionBtn>
            </div>
          )}

          {/* Reply compose */}
          {showReply && !showEdit && (
            <ReplyCompose
              taskId={taskId}
              parentId={comment.id}
              onSaved={(reply) => {
                onReplyAdded(comment.id, reply);
                setShowReply(false);
              }}
              onCancel={() => setShowReply(false)}
            />
          )}

          {/* Existing replies */}
          {comment.replies.length > 0 && (
            <div className="mt-3 space-y-2 pl-4" style={{ borderLeft: "2px solid var(--rtm-border)" }}>
              {comment.replies.map((reply) => (
                <div key={reply.id} className="flex items-start gap-2">
                  <Avatar initials={reply.authorInitials} color={reply.authorColor} size="xs" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>{reply.authorName}</span>
                      <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{relativeTime(reply.createdAt)}</span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--rtm-text-secondary)" }}>
                      {renderBody(reply.body)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionBtn({
  children,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="text-[11px] font-medium transition-colors"
      style={{
        color: danger ? "#DC2626" : "var(--rtm-text-muted)",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      onMouseEnter={(e) => { if (!disabled) (e.currentTarget as HTMLElement).style.color = danger ? "#991B1B" : "var(--rtm-blue)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = danger ? "#DC2626" : "var(--rtm-text-muted)"; }}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main tab
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  taskId: string;
  comments: TaskComment[];
  onCommentsChange: (comments: TaskComment[]) => void;
}

export default function CommentsTab({ taskId, comments, onCommentsChange }: Props) {
  const [newBody,   setNewBody]   = useState("");
  const [pending,   startPost]    = useTransition();
  const [postErr,   setPostErr]   = useState("");

  const pinned  = comments.filter((c) => c.pinned);
  const rest    = comments.filter((c) => !c.pinned);
  const ordered = [...pinned, ...rest];

  // ── post new comment ────────────────────────────────────────────────────────
  function handlePost() {
    const trimmed = newBody.trim();
    if (!trimmed) return;
    setPostErr("");
    startPost(async () => {
      try {
        const data = await apiPost(taskId, "comments", {
          body:           trimmed,
          authorId:       CURRENT_USER.id,
          authorName:     CURRENT_USER.name,
          authorInitials: CURRENT_USER.initials,
          authorColor:    CURRENT_USER.color,
        });
        onCommentsChange([...comments, data.comment as TaskComment]);
        setNewBody("");
      } catch {
        setPostErr("Failed to post comment. Try again.");
      }
    });
  }

  // ── update one comment in list ──────────────────────────────────────────────
  function handleUpdate(updated: TaskComment) {
    onCommentsChange(comments.map((c) => (c.id === updated.id ? updated : c)));
  }

  // ── delete one comment ──────────────────────────────────────────────────────
  function handleDelete(id: string) {
    onCommentsChange(comments.filter((c) => c.id !== id));
  }

  // ── append reply to parent ──────────────────────────────────────────────────
  function handleReplyAdded(commentId: string, reply: CommentReply) {
    onCommentsChange(
      comments.map((c) =>
        c.id === commentId ? { ...c, replies: [...c.replies, reply] } : c
      )
    );
  }

  return (
    <div className="space-y-5">
      {/* Empty state */}
      {comments.length === 0 && (
        <EmptyTab message="No comments yet. Be the first to add one." />
      )}

      {/* Comment list */}
      {ordered.map((comment) => (
        <CommentCard
          key={comment.id}
          comment={comment}
          taskId={taskId}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onReplyAdded={handleReplyAdded}
        />
      ))}

      {/* Post new comment */}
      <div
        className="flex items-start gap-3 p-4 rounded-xl"
        style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)" }}
      >
        <div
          className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
          style={{ background: CURRENT_USER.color }}
        >
          {CURRENT_USER.initials}
        </div>
        <div className="flex-1">
          <textarea
            rows={2}
            placeholder="Add a comment… (use @name for mentions)"
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            className="w-full resize-none rounded-lg px-3 py-2 text-sm outline-none"
            style={{
              background: "var(--rtm-surface)",
              border: "1px solid var(--rtm-border)",
              color: "var(--rtm-text-primary)",
            }}
          />
          {postErr && <p className="text-[10px] text-red-500 mt-0.5">{postErr}</p>}
          <div className="flex items-center justify-end mt-2">
            <button
              onClick={handlePost}
              disabled={pending || !newBody.trim()}
              className="text-xs px-4 py-1.5 rounded-lg font-semibold text-white transition-opacity"
              style={{
                background: "var(--rtm-blue)",
                opacity: pending || !newBody.trim() ? 0.5 : 1,
                cursor: pending || !newBody.trim() ? "not-allowed" : "pointer",
              }}
            >
              {pending ? "Posting…" : "Post Comment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
