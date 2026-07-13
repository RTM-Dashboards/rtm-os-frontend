"use client";

import { useState, useTransition } from "react";
import type { ClientNote, ClientCommSource } from "@/lib/collaboration/types";
import { Avatar, formatDateTime, EmptyTab } from "../CollabUtils";

// ─────────────────────────────────────────────────────────────────────────────
// Current-user stub
// ─────────────────────────────────────────────────────────────────────────────
const CURRENT_USER = {
  id:       "current-user",
  name:     "You",
  initials: "YO",
  color:    "#1B4FD8",
};

// ── Source display helpers ────────────────────────────────────────────────────

const SOURCE_ABBREV: Record<ClientCommSource, string> = {
  Email:          "EM",
  "Phone Call":   "PH",
  Meeting:        "MT",
  Slack:          "SL",
  "Text Message": "TM",
  Portal:         "PT",
};

const SOURCE_COLORS: Record<ClientCommSource, { bg: string; color: string }> = {
  Email:          { bg: "#DBEAFE", color: "#1E40AF" },
  "Phone Call":   { bg: "#D1FAE5", color: "#065F46" },
  Meeting:        { bg: "#F3E8FF", color: "#6B21A8" },
  Slack:          { bg: "#FEF3C7", color: "#92400E" },
  "Text Message": { bg: "#FCE7F3", color: "#9D174D" },
  Portal:         { bg: "#E0F2FE", color: "#0369A1" },
};

const SOURCES: ClientCommSource[] = [
  "Email", "Phone Call", "Meeting", "Slack", "Text Message", "Portal",
];

interface Props {
  taskId: string;
  notes: ClientNote[];
  onNotesChange: (notes: ClientNote[]) => void;
}

export default function ClientNotesTab({ taskId, notes, onNotesChange }: Props) {
  const [body,    setBody]    = useState("");
  const [source,  setSource]  = useState<ClientCommSource>("Email");
  const [pending, startSave]  = useTransition();
  const [err,     setErr]     = useState("");

  function handleSave() {
    const trimmed = body.trim();
    if (!trimmed) return;
    setErr("");
    startSave(async () => {
      try {
        const res = await fetch(
          `/api/collaboration?taskId=${encodeURIComponent(taskId)}&resource=clientNotes`,
          {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({
              body:           trimmed,
              source,
              authorId:       CURRENT_USER.id,
              authorName:     CURRENT_USER.name,
              authorInitials: CURRENT_USER.initials,
              authorColor:    CURRENT_USER.color,
            }),
          }
        );
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as { note: ClientNote };
        onNotesChange([...notes, data.note]);
        setBody("");
      } catch {
        setErr("Failed to save note. Try again.");
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div
        className="flex items-center gap-2 p-3 rounded-lg text-xs font-medium"
        style={{ background: "#DBEAFE", border: "1px solid #BFDBFE", color: "#1E40AF" }}
      >
        📞
        <span>Client notes capture AM-facing communications. Track decisions, requests, and approvals here.</span>
      </div>

      {/* Empty state */}
      {notes.length === 0 && (
        <EmptyTab message="No client notes. Record client communication here." />
      )}

      {/* Note list */}
      {notes.map((note) => {
        const iconStyle = SOURCE_COLORS[note.source as ClientCommSource] ?? SOURCE_COLORS["Email"];
        return (
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
                  <p className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>Account Manager</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                  style={{ background: iconStyle.bg, color: iconStyle.color }}
                >
                  <span className="font-bold opacity-60">
                    {SOURCE_ABBREV[note.source as ClientCommSource] ?? "??"}
                  </span>{" "}
                  {note.source}
                </span>
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
        );
      })}

      {/* Save note form */}
      <div
        className="p-4 rounded-xl"
        style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)" }}
      >
        <p className="text-xs font-semibold mb-2" style={{ color: "var(--rtm-text-primary)" }}>Add Client Note</p>

        <textarea
          rows={3}
          placeholder="Record client communication, decision, or request…"
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
          {/* Source selector */}
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as ClientCommSource)}
            className="text-xs px-2 py-1 rounded outline-none"
            style={{
              background: "var(--rtm-blue-light)",
              color: "var(--rtm-blue)",
              border: "none",
              cursor: "pointer",
            }}
          >
            {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <button
            onClick={handleSave}
            disabled={pending || !body.trim()}
            className="text-xs px-4 py-1.5 rounded-lg font-semibold text-white transition-opacity"
            style={{
              background: "#1E40AF",
              opacity: pending || !body.trim() ? 0.5 : 1,
              cursor: pending || !body.trim() ? "not-allowed" : "pointer",
            }}
          >
            {pending ? "Saving…" : "Save Note"}
          </button>
        </div>
      </div>
    </div>
  );
}
