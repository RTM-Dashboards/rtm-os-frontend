"use client";

import Link from "next/link";
import { SectionWrapper } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

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

const workspace = getWorkspace("account-management")!;

export default function AccountPerformancePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: workspace.accentColor }}>{workspace.name}</p>
        <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>AM Performance Analytics</h1>
        <div className="mt-2"><PreviewBadge /></div>
        <p className="text-sm text-slate-500 mt-1">
          Account-manager-level performance benchmarking across your full client book — retention trends, health score trends over time, and check-in completion rates. Distinct from per-client scoring (see Client Health) and your operational client list (see Client Portfolio).
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Avg. Health Score",  value: "8.7", bg: "#ECFDF5", color: "#059669"},
          { label: "Retention Rate",     value: "96%", bg: "#EFF6FF", color: "#2563EB"},
          { label: "At-Risk Clients",    value: "7",   bg: "#FEF2F2", color: "#DC2626"},
          { label: "Check-in Rate",      value: "91%", bg: "#F5F3FF", color: "#7C3AED"},
        ].map((s) => (
          <div key={s.label} className="rounded-xl border p-4"style={{ background: s.bg, borderColor: `${s.color}20` }}>
            <p className="text-3xl font-bold"style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs font-semibold mt-1"style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>

      <SectionWrapper title="Health Trend"description="Chart coming soon">
        <div className="rounded-xl border flex items-center justify-center h-48"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)", borderStyle: "dashed"}}>
          <div className="text-center">
            
            <p className="text-sm mt-2 font-semibold"style={{ color: "var(--rtm-text-secondary)"}}>Performance Chart Placeholder</p>
            <p className="text-xs mt-1"style={{ color: "var(--rtm-text-muted)"}}>Connect client data to display trend charts.</p>
          </div>
        </div>
      </SectionWrapper>

      <div className="flex gap-2">
        <Link href={workspace.dashboardRoute} className="rtm-btn-secondary text-sm inline-flex items-center gap-1">← Dashboard</Link>
        <Link href={workspace.tasksRoute}     className="rtm-btn-primary  text-sm inline-flex items-center gap-1">Tasks →</Link>
      </div>
    </div>
  );
}
