"use client";

import type { ActivationRecord } from "@/types/activation";

interface Props {
  record: ActivationRecord;
  onClose: () => void;
}

export default function ChecklistPanel({ record, onClose }: Props) {
  const completed = record.checklist.filter((c) => c.completed).length;
  const total = record.checklist.length;
  const pct = Math.round((completed / total) * 100);

  return (
    <div
      className="rounded-xl border p-5"
      style={{
        background: "var(--rtm-surface)",
        borderColor: "var(--rtm-border)",
        boxShadow: "0 1px 3px rgba(15,28,56,0.05)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-0.5"
            style={{ color: "var(--rtm-blue)" }}
          >
            Client Launch Checklist
          </p>
          <h3 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            {record.client}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
            {record.id} &mdash; {record.contractNumber}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
          style={{ color: "var(--rtm-text-muted)" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>
            Completion Progress
          </p>
          <p className="text-xs font-bold" style={{ color: "var(--rtm-blue)" }}>
            {completed} / {total} &mdash; {pct}%
          </p>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: "var(--rtm-border)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background:
                pct === 100
                  ? "#10B981"
                  : pct >= 60
                  ? "var(--rtm-blue)"
                  : "#F59E0B",
            }}
          />
        </div>
      </div>

      {/* Checklist items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {record.checklist.map((item) => (
          <div
            key={item.key}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border"
            style={{
              background: item.completed ? "#F0FDF4" : "var(--rtm-bg)",
              borderColor: item.completed ? "#BBF7D0" : "var(--rtm-border)",
            }}
          >
            <div
              className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{
                background: item.completed ? "#10B981" : "var(--rtm-border)",
              }}
            >
              {item.completed ? (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <div className="w-2 h-2 rounded-full" style={{ background: "#CBD5E1" }} />
              )}
            </div>
            <span
              className="text-xs font-medium"
              style={{ color: item.completed ? "#065F46" : "var(--rtm-text-secondary)" }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
