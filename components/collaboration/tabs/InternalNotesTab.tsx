"use client";

import type { InternalNote } from "@/lib/collaboration/types";
import { Avatar, PriorityDot, formatDateTime, EmptyTab } from "../CollabUtils";

interface Props {
  notes: InternalNote[];
}

export default function InternalNotesTab({ notes }: Props) {
  if (!notes.length) return <EmptyTab message="No internal notes. Add a note visible only to the team." />;

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div
        className="flex items-center gap-2 p-3 rounded-lg text-xs font-medium"
        style={{ background: "#FEF9C3", border: "1px solid #FDE68A", color: "#92400E" }}
      >
        
        <span>Internal notes are visible to team members only. Not shared with clients.</span>
      </div>

      {notes.map((note) => (
        <div
          key={note.id}
          className="rounded-xl p-4"
          style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Avatar initials={note.authorInitials} color={note.authorColor} size="sm" />
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>{note.authorName}</p>
                <p className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>{note.department}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <PriorityDot priority={note.priority} />
              <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>
                {formatDateTime(note.createdAt)}
              </span>
            </div>
          </div>

          {/* Body */}
          <p className="text-sm leading-relaxed" style={{ color: "var(--rtm-text-secondary)" }}>
            {note.body}
          </p>
        </div>
      ))}

      {/* Add Note */}
      <div
        className="p-4 rounded-xl"
        style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)" }}
      >
        <p className="text-xs font-semibold mb-2" style={{ color: "var(--rtm-text-muted)" }}>Add Internal Note</p>
        <textarea
          rows={3}
          placeholder="e.g. Waiting for payment. Waiting for client approval. Need manager review."
          className="w-full resize-none rounded-lg px-3 py-2 text-sm outline-none"
          style={{
            background: "var(--rtm-surface)",
            border: "1px solid var(--rtm-border)",
            color: "var(--rtm-text-primary)",
          }}
        />
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <select
              className="text-xs px-2 py-1 rounded outline-none"
              style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)", border: "none" }}
            >
              {["Low", "Medium", "High", "Urgent"].map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <button
            className="text-xs px-4 py-1.5 rounded-lg font-semibold text-white"
            style={{ background: "#92400E" }}
          >
            Add Note
          </button>
        </div>
      </div>
    </div>
  );
}
