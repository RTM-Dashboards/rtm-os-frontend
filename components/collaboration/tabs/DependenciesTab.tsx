"use client";

import type { TaskDependencyItem } from "@/lib/collaboration/types";
import { DepStatusBadge, formatDate, EmptyTab } from "../CollabUtils";

interface Props {
  dependencies: TaskDependencyItem[];
}

const SCOPE_LABELS: Record<string, string> = {
  Task:      "TSK",
  Milestone: "MS",
  Project:   "PRJ",
};

export default function DependenciesTab({ dependencies }: Props) {
  if (!dependencies.length) return <EmptyTab message="No dependencies tracked for this task."/>;

  const blocked = dependencies.filter((d) => d.status === "Blocked"|| d.status === "Escalated");
  const pending = dependencies.filter((d) => d.status === "Pending");
  const satisfied = dependencies.filter((d) => d.status === "Satisfied");

  return (
    <div className="space-y-6">
      {/* Blocked */}
      {blocked.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2"style={{ color: "#DC2626"}}>
            Blocking Dependencies ({blocked.length})
          </p>
          <div className="space-y-2">
            {blocked.map((d) => <DepCard key={d.id} dep={d} />)}
          </div>
        </div>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2"style={{ color: "#D97706"}}>
            <span>⏳</span> Pending Dependencies ({pending.length})
          </p>
          <div className="space-y-2">
            {pending.map((d) => <DepCard key={d.id} dep={d} />)}
          </div>
        </div>
      )}

      {/* Satisfied */}
      {satisfied.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2"style={{ color: "#059669"}}>
            Satisfied Dependencies ({satisfied.length})
          </p>
          <div className="space-y-2 opacity-70">
            {satisfied.map((d) => <DepCard key={d.id} dep={d} />)}
          </div>
        </div>
      )}

      {/* How blockers are used */}
      <div
        className="p-4 rounded-xl text-xs leading-relaxed"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-secondary)"}}
      >
        <p className="font-semibold mb-1"style={{ color: "var(--rtm-text-primary)"}}>About Dependencies</p>
        <p>
          Dependencies track what this task is waiting on — whether that&apos;s another task, a milestone, billing
          confirmation, client access, or a department action. When a dependency is Blocked or Escalated, the team can
          act without searching for context.
        </p>
      </div>
    </div>
  );
}

function DepCard({ dep }: { dep: TaskDependencyItem }) {
  return (
    <div
      className="rounded-xl p-4"style={{
        background: "var(--rtm-surface)",
        border: `1px solid ${dep.status === "Blocked"? "#FECACA": dep.status === "Escalated"? "#E9D5FF": "var(--rtm-border)"}`,
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[9px] font-bold"style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)"}}
          >
            {SCOPE_LABELS[dep.scope] ?? dep.scope.slice(0, 3).toUpperCase()}
          </span>
          <div>
            <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{dep.name}</p>
            <p className="text-[11px]"style={{ color: "var(--rtm-text-muted)"}}>
              {dep.scope} · Owner: {dep.owner}
              {dep.dueDate && ` · Due: ${formatDate(dep.dueDate)}`}
            </p>
          </div>
        </div>
        <DepStatusBadge status={dep.status} />
      </div>

      {dep.blockerReason && (
        <div
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium mb-2"style={{ background: "#FEE2E2", color: "#991B1B"}}
        >
          {dep.blockerReason}
        </div>
      )}

      {dep.notes && (
        <p className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{dep.notes}</p>
      )}
    </div>
  );
}
