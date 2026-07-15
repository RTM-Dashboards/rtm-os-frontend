"use client";

import { useState, useTransition } from "react";
import type { InternalNote, InternalNotePriority } from "@/lib/collaboration/types";
import { Avatar, PriorityDot, formatDateTime, EmptyTab } from "../CollabUtils";

// ─────────────────────────────────────────────────────────────────────────────
// Current-user stub
// ─────────────────────────────────────────────────────────────────────────────
const CURRENT_USER = {
  id:         "current-user",
  name:       "You",
  initials:   "YO",
  color:      "#1d709f",
  department: "Account Management",
};

const PRIORITIES: InternalNotePriority[] = ["Low", "Medium", "High", "Urgent"];

interface Props {
  taskId: string;
  notes: InternalNote[];
  onNotesChange: (notes: InternalNote[]) => void;
}

export default function InternalNotesTab({ taskId, notes, onNotesChange }: Props) {
  const [body,       setBody]       = useState("");
  const [priority,   setPriority]   = useState<InternalNotePriority>("Medium");
  const [department, setDepartment] = useState(CURRENT_USER.department);
  const [pending,    startSave]     = useTransition();
  const [err,        setErr]        = useState("");

  function handleSave() {
    const trimmed = body.trim();
    if (!trimmed) return;
    setErr("");
    startSave(async () => {
      try {
        const res = await fetch(
          `/api/collaboration?taskId=${encodeURIComponent(taskId)}&resource=internalNotes`,
          {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({
              body:           trimmed,
              priority,
              department,
              authorId:       CURRENT_USER.id,
              authorName:     CURRENT_USER.name,
              authorInitials: CURRENT_USER.initials,
              authorColor:    CURRENT_USER.color,
            }),
          }
        );
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as { note: InternalNote };
        onNotesChange([...notes, data.note]);
        setBody("");
        setPriority("Medium");
      } catch {
        setErr("Failed to save note. Try again.");
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Internal-only banner */}
      <div
        className="flex items-center gap-2 p-3 rounded-lg text-xs font-medium"
        style={{ background: "#FEF9C3", border: "1px solid #FDE68A", color: "#92400E" }}
      >
        🔒
        <span>Internal notes are visible to team members only. Not shared with clients.</span>
      </div>

      {/* Empty state */}
      {notes.length === 0 && (
        <EmptyTab message="No internal notes. Add a note visible only to the team." />
      )}

      {/* Note list */}
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

      {/* Add note form */}
      <div
        className="p-4 rounded-xl"
        style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)" }}
      >
        <p className="text-xs font-semibold mb-2" style={{ color: "var(--rtm-text-primary)" }}>Add Internal Note</p>

        {/* Department input */}
        <input
          type="text"
          placeholder="Department (e.g. Account Management)"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="w-full rounded-lg px-3 py-2 text-xs outline-none mb-2"
          style={{
            background: "var(--rtm-surface)",
            border: "1px solid var(--rtm-border)",
            color: "var(--rtm-text-primary)",
          }}
        />

        <textarea
          rows={3}
          placeholder="Write an internal note…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full resize-none rounded-lg px-3 py-2 text-sm outline-none"
          style={{
            background: "var(--rtm-surface)",
            border: "1px solid var(--rtm-border)",
            color: "var(--rtm-text-primary)",
          }}
        />

        {err && <p className="text-[10px] text-red-500 mt-1">{err}</p>}

        <div className="flex items-center justify-between mt-2">
          {/* Priority selector */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as InternalNotePriority)}
            className="text-xs px-2 py-1 rounded outline-none"
            style={{
              background: "var(--rtm-blue-light)",
              color: "var(--rtm-blue)",
              border: "none",
              cursor: "pointer",
            }}
          >
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>

          <button
            onClick={handleSave}
            disabled={pending || !body.trim()}
            className="text-xs px-4 py-1.5 rounded-lg font-semibold text-white transition-opacity"
            style={{
              background: "#92400E",
              opacity: pending || !body.trim() ? 0.5 : 1,
              cursor: pending || !body.trim() ? "not-allowed" : "pointer",
            }}
          >
            {pending ? "Saving…" : "Add Note"}
          </button>
        </div>
      </div>
    </div>
  );
}
