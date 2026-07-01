"use client";

import React, { useState } from "react";
import type { CommunicationLog, CommunicationLogEntry, CommunicationLogEntryType } from "@/lib/sales/types";
import { createLogEntry } from "@/lib/sales/opportunity-engine";
import { LogEntryCard } from "./LogEntryCard";
import { AddLogEntryModal } from "./AddLogEntryModal";

// ─── Filter chips ─────────────────────────────────────────────────────────────

type FilterType = "all" | CommunicationLogEntryType;

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "call", label: "Call" },
  { value: "call-transcript", label: "Transcript" },
  { value: "email", label: "Email" },
  { value: "meeting-notes", label: "Meeting Notes" },
  { value: "sms", label: "SMS" },
  { value: "note", label: "Note" },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface CommunicationLogPanelProps {
  opportunityId: string;
  log: CommunicationLog;
  onAddEntry: (entry: CommunicationLogEntry) => void;
  compact?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CommunicationLogPanel({
  opportunityId,
  log,
  onAddEntry,
  compact = false,
}: CommunicationLogPanelProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [showModal, setShowModal] = useState(false);
  const [compactExpanded, setCompactExpanded] = useState(false);

  const allEntries = log.entries;
  const filtered =
    activeFilter === "all"
      ? allEntries
      : allEntries.filter((e) => e.type === activeFilter);

  const displayEntries =
    compact && !compactExpanded ? filtered.slice(0, 3) : filtered;
  const hasMore = compact && !compactExpanded && filtered.length > 3;

  function handleModalSubmit(
    partial: Omit<CommunicationLogEntry, "id" | "opportunityId" | "loggedAt">
  ) {
    const entry = createLogEntry(opportunityId, partial);
    onAddEntry(entry);
    setShowModal(false);
  }

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}
      >
        <div className="flex items-center gap-2">
          <p
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            Communication Log
          </p>
          {allEntries.length > 0 && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: "#EFF6FF", color: "#1D4ED8" }}
            >
              {allEntries.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-opacity hover:opacity-90"
          style={{ background: "#059669", color: "#fff", borderColor: "#047857" }}
        >
          Add Entry
        </button>
      </div>

      {/* Filter chips */}
      {allEntries.length > 0 && (
        <div
          className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto border-b flex-shrink-0"
          style={{ borderColor: "var(--rtm-border)" }}
        >
          {FILTER_OPTIONS.map((opt) => {
            const active = activeFilter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setActiveFilter(opt.value)}
                className="flex-shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all"
                style={{
                  background: active ? "#059669" : "var(--rtm-bg)",
                  color: active ? "#fff" : "var(--rtm-text-muted)",
                  borderColor: active ? "#047857" : "var(--rtm-border)",
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Entries */}
      <div className="p-4">
        {displayEntries.length === 0 ? (
          <div className="text-center py-8">
            <p
              className="text-xs"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              {allEntries.length === 0
                ? "No communication logged yet for this opportunity."
                : "No entries match this filter."}
            </p>
            {allEntries.length === 0 && (
              <button
                onClick={() => setShowModal(true)}
                className="mt-3 text-xs font-bold px-4 py-2 rounded-lg border transition-opacity hover:opacity-90"
                style={{ background: "#059669", color: "#fff", borderColor: "#047857" }}
              >
                Log First Entry
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {displayEntries.map((entry) => (
              <LogEntryCard key={entry.id} entry={entry} />
            ))}

            {hasMore && (
              <button
                onClick={() => setCompactExpanded(true)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-lg border mt-1 transition-colors hover:bg-gray-50"
                style={{
                  background: "var(--rtm-bg)",
                  color: "var(--rtm-text-muted)",
                  borderColor: "var(--rtm-border)",
                }}
              >
                View all {filtered.length} entries
              </button>
            )}

            {compact && compactExpanded && filtered.length > 3 && (
              <button
                onClick={() => setCompactExpanded(false)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-lg border mt-1 transition-colors hover:bg-gray-50"
                style={{
                  background: "var(--rtm-bg)",
                  color: "var(--rtm-text-muted)",
                  borderColor: "var(--rtm-border)",
                }}
              >
                Show fewer
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Entry Modal */}
      {showModal && (
        <AddLogEntryModal
          opportunityId={opportunityId}
          onSubmit={handleModalSubmit}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
