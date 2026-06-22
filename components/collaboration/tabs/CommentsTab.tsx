"use client";

import type { TaskComment } from "@/lib/collaboration/types";
import { Avatar, MentionBadge, relativeTime, FileIcon, EmptyTab } from "../CollabUtils";

interface Props {
  comments: TaskComment[];
}

function CommentStatusBadge({ pinned, resolved }: { pinned: boolean; resolved: boolean }) {
  // pinned
  if (pinned) return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "#FEF3C7", color: "#92400E" }}> Pinned</span>;
  if (resolved) return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "#D1FAE5", color: "#065F46" }}> Resolved</span>;
  return null;
}

function renderBody(body: string) {
  // Highlight @mentions inline
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

export default function CommentsTab({ comments }: Props) {
  if (!comments.length) return <EmptyTab message="No comments yet. Be the first to add one." />;

  const pinned = comments.filter((c) => c.pinned);
  const rest = comments.filter((c) => !c.pinned);
  const ordered = [...pinned, ...rest];

  return (
    <div className="space-y-5">
      {ordered.map((comment) => (
        <div
          key={comment.id}
          className="rounded-xl p-4"
          style={{
            background: comment.pinned ? "#FFFBEB" : comment.resolved ? "#F0FDF4" : "var(--rtm-surface)",
            border: `1px solid ${comment.pinned ? "#FDE68A" : comment.resolved ? "#BBF7D0" : "var(--rtm-border)"}`,
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
                  <span className="text-[10px] italic" style={{ color: "var(--rtm-text-muted)" }}>
                    (edited)
                  </span>
                )}
                <CommentStatusBadge pinned={comment.pinned} resolved={comment.resolved} />
              </div>

              {/* Body */}
              <p className="text-sm leading-relaxed" style={{ color: "var(--rtm-text-secondary)" }}>
                {renderBody(comment.body)}
              </p>

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
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                      style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)" }}
                    >
                      <FileIcon type={att.fileType} />
                      <span>{att.fileName}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 mt-2">
                {(["Reply", "Edit", "Pin", "Resolve", "Delete"] as const).map((action) => (
                  <button
                    key={action}
                    className="text-[11px] font-medium transition-colors"
                    style={{ color: "var(--rtm-text-muted)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--rtm-blue)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--rtm-text-muted)")}
                  >
                    {action}
                  </button>
                ))}
              </div>

              {/* Replies */}
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
      ))}

      {/* Compose */}
      <div
        className="flex items-start gap-3 p-4 rounded-xl"
        style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)" }}
      >
        <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ background: "#1B4FD8" }} />
        <div className="flex-1">
          <textarea
            rows={2}
            placeholder="Add a comment… use @name to mention someone"
            className="w-full resize-none rounded-lg px-3 py-2 text-sm outline-none"
            style={{
              background: "var(--rtm-surface)",
              border: "1px solid var(--rtm-border)",
              color: "var(--rtm-text-primary)",
            }}
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <button className="text-xs px-2 py-1 rounded" style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)" }}>
                 Attach
              </button>
              <button className="text-xs px-2 py-1 rounded" style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)" }}>
                @ Mention
              </button>
            </div>
            <button
              className="text-xs px-4 py-1.5 rounded-lg font-semibold text-white"
              style={{ background: "var(--rtm-blue)" }}
            >
              Post Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
