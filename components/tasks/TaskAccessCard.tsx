"use client";

import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// TaskAccessCard
// A reusable "quick-access" card that appears on any module page to surface
// the Global Task Management Engine. Accepts optional mock counters and a
// context label (e.g. "Billing", "Account Management") to customise copy.
// ─────────────────────────────────────────────────────────────────────────────

interface TaskCounters {
  open?: number;
  overdue?: number;
  completed?: number;
  upcoming?: number;
  dueToday?: number;
}

interface TaskAccessCardProps {
  context?: string;           // e.g. "Billing", "Offboarding" — shown in badge
  counters?: TaskCounters;
  createLabel?: string;       // override create button label
  /** Additional quick-action examples shown as pills */
  examples?: string[];
  variant?: "card" | "banner";
  className?: string;
}

export default function TaskAccessCard({
  context,
  counters = { open: 12, overdue: 3, completed: 47, upcoming: 8, dueToday: 5 },
  createLabel = "Create Task",
  examples,
  variant = "card",
  className = "",
}: TaskAccessCardProps) {
  const taskUrl = "/tasks";

  if (variant === "banner") {
    return (
      <div
        className={`rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 ${className}`}
        style={{ background: "var(--rtm-blue-xlight)", border: "1px solid #BFDBFE" }}
      >
        <div className="flex items-center gap-3">
          
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold" style={{ color: "var(--rtm-text-primary)" }}>
                Task Management Engine
              </span>
              {context && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ background: "var(--rtm-blue)" }}
                >
                  {context}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              {counters.open !== undefined && (
                <span className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                  <strong style={{ color: "var(--rtm-blue)" }}>{counters.open}</strong> Open
                </span>
              )}
              {counters.overdue !== undefined && (
                <span className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                  <strong style={{ color: "#DC2626" }}>{counters.overdue}</strong> Overdue
                </span>
              )}
              {counters.dueToday !== undefined && (
                <span className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                  <strong style={{ color: "#D97706" }}>{counters.dueToday}</strong> Due Today
                </span>
              )}
              {counters.completed !== undefined && (
                <span className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                  <strong style={{ color: "#059669" }}>{counters.completed}</strong> Completed
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href={taskUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--rtm-blue)" }}
          >
            Open Tasks
          </Link>
          <Link
            href={taskUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors hover:opacity-80"
            style={{ borderColor: "#BFDBFE", color: "var(--rtm-blue)", background: "#fff" }}
          >
            {createLabel}
          </Link>
        </div>
      </div>
    );
  }

  // Card variant (default)
  return (
    <div
      className={`rounded-xl overflow-hidden ${className}`}
      style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between gap-3"
        style={{ background: "var(--rtm-blue-xlight)", borderBottom: "1px solid #BFDBFE" }}
      >
        <div className="flex items-center gap-2">
          
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-extrabold" style={{ color: "var(--rtm-text-primary)" }}>
                Task Management Engine
              </span>
              {context && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ background: "var(--rtm-blue)" }}
                >
                  {context}
                </span>
              )}
            </div>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-secondary)" }}>
              Centralized task management for workflow actions, client delivery, onboarding, renewals, and offboarding.
            </p>
          </div>
        </div>
      </div>

      {/* Counters */}
      <div className="px-5 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Open Tasks",   value: counters.open ?? 0,      color: "var(--rtm-blue)", bg: "var(--rtm-blue-light)" },
          { label: "Overdue",      value: counters.overdue ?? 0,   color: "#DC2626",           bg: "#FEF2F2" },
          { label: "Due Today",    value: counters.dueToday ?? 0,  color: "#D97706",           bg: "#FFFBEB" },
          { label: "Completed",    value: counters.completed ?? 0, color: "#059669",           bg: "#ECFDF5" },
        ].map(({ label, value, color, bg }) => (
          <div
            key={label}
            className="rounded-lg p-3 text-center"
            style={{ background: bg }}
          >
            <div className="text-2xl font-black" style={{ color }}>{value}</div>
            <div className="text-[11px] font-semibold mt-0.5" style={{ color }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Examples */}
      {examples && examples.length > 0 && (
        <div className="px-5 pb-3">
          <div className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--rtm-text-muted)" }}>
            Example Tasks
          </div>
          <div className="flex flex-wrap gap-1.5">
            {examples.map((ex) => (
              <span
                key={ex}
                className="text-[11px] px-2 py-1 rounded-lg font-medium"
                style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", border: "1px solid var(--rtm-border)" }}
              >
                {ex}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div
        className="px-5 py-3 flex flex-wrap gap-2"
        style={{ borderTop: "1px solid var(--rtm-border-light)" }}
      >
        <Link
          href={taskUrl}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: "var(--rtm-blue)" }}
        >
          Open Tasks
        </Link>
        <Link
          href={taskUrl}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors hover:opacity-80"
          style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
        >
          {createLabel}
        </Link>
        <Link
          href={taskUrl}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors hover:opacity-80"
          style={{ borderColor: "#BFDBFE", color: "var(--rtm-blue)", background: "var(--rtm-blue-light)" }}
        >
          Open Task Queue
        </Link>
      </div>
    </div>
  );
}
