"use client";

import type { TaskDependencyItem } from "@/lib/collaboration/types";
import type { TaskDependency } from "@/lib/engine/types";
import { DepStatusBadge, formatDate, EmptyTab } from "../CollabUtils";

// ── Preview — Target State badge (reused from Admin Overview / Executive Command Center pattern) ──
function PreviewBadge() {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border"
      style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#92400E" }}
    >
      Preview — Target State
    </span>
  );
}

interface Props {
  /** Collab-sidecar dependency items (illustrative detail — context, notes, blockerReason) */
  dependencies: TaskDependencyItem[];
  /** Real engine Task.dependencies[] — authoritative blocked-by/blocking relationships */
  engineDependencies: TaskDependency[];
}

const SCOPE_LABELS: Record<string, string> = {
  Task:      "TSK",
  Milestone: "MS",
  Project:   "PRJ",
};

const ENGINE_DEP_STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Blocked:     { bg: "#FEE2E2", color: "#991B1B" },
  "In Progress": { bg: "#DBEAFE", color: "#1E40AF" },
  Waiting:     { bg: "#FEF3C7", color: "#92400E" },
  Open:        { bg: "#F3F4F6", color: "#374151" },
  Completed:   { bg: "#D1FAE5", color: "#065F46" },
  Cancelled:   { bg: "#F3F4F6", color: "#6B7280" },
};

export default function DependenciesTab({ dependencies, engineDependencies }: Props) {
  const blocked = dependencies.filter((d) => d.status === "Blocked" || d.status === "Escalated");
  const pending = dependencies.filter((d) => d.status === "Pending");
  const satisfied = dependencies.filter((d) => d.status === "Satisfied");
  const hasCollabDeps = dependencies.length > 0;
  const hasEngineDeps = engineDependencies.length > 0;

  if (!hasCollabDeps && !hasEngineDeps) {
    return <EmptyTab message="No dependencies tracked for this task." />;
  }

  return (
    <div className="space-y-6">
      {/* ── Real Engine Dependencies (authoritative) ── */}
      {hasEngineDeps && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--rtm-text-muted)" }}>
            Engine Task Dependencies ({engineDependencies.length})
          </p>
          <div className="space-y-2">
            {engineDependencies.map((dep) => {
              const isBlocked = dep.status === "Blocked";
              const statusStyle = ENGINE_DEP_STATUS_COLORS[dep.status] ?? ENGINE_DEP_STATUS_COLORS["Open"];
              return (
                <div
                  key={dep.id}
                  className="rounded-xl p-4"
                  style={{
                    background: "var(--rtm-surface)",
                    border: `1px solid ${isBlocked ? "#FECACA" : "var(--rtm-border)"}`,
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                        {dep.dependsOnTaskName}
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>
                        {dep.type} · {dep.direction === "blocked-by" ? "This task is blocked by" : "This task is blocking"} → {dep.dependsOnTaskId}
                      </p>
                    </div>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex-shrink-0"
                      style={{ background: statusStyle.bg, color: statusStyle.color }}
                    >
                      {dep.status}
                    </span>
                  </div>
                  {dep.blockerReason && (
                    <div
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium mt-1"
                      style={{ background: "#FEE2E2", color: "#991B1B" }}
                    >
                      🚫 {dep.blockerReason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Collab Sidecar Dependencies (detail context — blockerReason, notes, owner) ── */}
      {hasCollabDeps && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--rtm-text-muted)" }}>
              Collaboration Context Dependencies ({dependencies.length})
            </p>
            <PreviewBadge />
          </div>
          {/* Blocked */}
          {blocked.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: "#DC2626" }}>
                Blocking ({blocked.length})
              </p>
              <div className="space-y-2">
                {blocked.map((d) => <DepCard key={d.id} dep={d} />)}
              </div>
            </div>
          )}
          {/* Pending */}
          {pending.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: "#D97706" }}>
                <span>⏳</span> Pending ({pending.length})
              </p>
              <div className="space-y-2">
                {pending.map((d) => <DepCard key={d.id} dep={d} />)}
              </div>
            </div>
          )}
          {/* Satisfied */}
          {satisfied.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: "#059669" }}>
                Satisfied ({satisfied.length})
              </p>
              <div className="space-y-2 opacity-70">
                {satisfied.map((d) => <DepCard key={d.id} dep={d} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* About section */}
      <div
        className="p-4 rounded-xl text-xs leading-relaxed"
        style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-secondary)" }}
      >
        <p className="font-semibold mb-1" style={{ color: "var(--rtm-text-primary)" }}>About Dependencies</p>
        <p>
          Engine task dependencies show authoritative blocked-by/blocking relationships from the task engine.
          Collaboration context dependencies add owner, notes, and blocker reason context from the collab sidecar.
          When a dependency is Blocked or Escalated, the team can act without searching for context.
        </p>
      </div>
    </div>
  );
}

function DepCard({ dep }: { dep: TaskDependencyItem }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: "var(--rtm-surface)",
        border: `1px solid ${dep.status === "Blocked" ? "#FECACA" : dep.status === "Escalated" ? "#E9D5FF" : "var(--rtm-border)"}`,
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[9px] font-bold"
            style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)" }}
          >
            {SCOPE_LABELS[dep.scope] ?? dep.scope.slice(0, 3).toUpperCase()}
          </span>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{dep.name}</p>
            <p className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>
              {dep.scope} · Owner: {dep.owner}
              {dep.dueDate && ` · Due: ${formatDate(dep.dueDate)}`}
            </p>
          </div>
        </div>
        <DepStatusBadge status={dep.status} />
      </div>

      {dep.blockerReason && (
        <div
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium mb-2"
          style={{ background: "#FEE2E2", color: "#991B1B" }}
        >
          {dep.blockerReason}
        </div>
      )}

      {dep.notes && (
        <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{dep.notes}</p>
      )}
    </div>
  );
}
