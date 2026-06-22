"use client";

import type { ClientNote, ClientCommSource } from "@/lib/collaboration/types";
import { Avatar, formatDateTime, EmptyTab } from "../CollabUtils";

interface Props {
  notes: ClientNote[];
}

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

export default function ClientNotesTab({ notes }: Props) {
  if (!notes.length) return <EmptyTab message="No client notes. Record client communication here." />;

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div
        className="flex items-center gap-2 p-3 rounded-lg text-xs font-medium"
        style={{ background: "#DBEAFE", border: "1px solid #BFDBFE", color: "#1E40AF" }}
      >
        
        <span>Client notes capture AM-facing communications. Track decisions, requests, and approvals here.</span>
      </div>

      {notes.map((note) => {
        const iconStyle = SOURCE_COLORS[note.source];
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
                  <span className="font-bold opacity-60">{SOURCE_ABBREV[note.source]}</span> {note.source}
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

      {/* Add Note */}
      <div
        className="p-4 rounded-xl"
        style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)" }}
      >
        <p className="text-xs font-semibold mb-2" style={{ color: "var(--rtm-text-muted)" }}>Add Client Note</p>
        <textarea
          rows={3}
          placeholder="e.g. Client requested launch delay. Client approved strategy. Client requested revisions."
          className="w-full resize-none rounded-lg px-3 py-2 text-sm outline-none"
          style={{
            background: "var(--rtm-surface)",
            border: "1px solid var(--rtm-border)",
            color: "var(--rtm-text-primary)",
          }}
        />
        <div className="flex items-center justify-between mt-2">
          <select
            className="text-xs px-2 py-1 rounded outline-none"
            style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)", border: "none" }}
          >
            {(["Email", "Phone Call", "Meeting", "Slack", "Text Message", "Portal"] as ClientCommSource[]).map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <button
            className="text-xs px-4 py-1.5 rounded-lg font-semibold text-white"
            style={{ background: "#1E40AF" }}
          >
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
}
