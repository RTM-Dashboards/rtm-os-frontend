"use client";

import Link from "next/link";
import { SectionWrapper } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("content")!;

export default function ContentPerformancePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>{workspace.name}</p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Performance</h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>Content output metrics and delivery rates.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "On-Time Rate",        value: "94%", bg: "#ECFDF5", color: "#059669" },
          { label: "Pieces Delivered",    value: "184", bg: "#EFF6FF", color: "#2563EB" },
          { label: "Client Satisfaction", value: "4.8", bg: "#F5F3FF", color: "#7C3AED" },
          { label: "Avg. Turnaround",     value: "3.2d",bg: "#FFFBEB", color: "#D97706" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border p-4" style={{ background: s.bg, borderColor: `${s.color}20` }}>
            <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs font-semibold mt-1" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>

      <SectionWrapper title="Performance Trends" description="Chart coming soon">
        <div className="rounded-xl border flex items-center justify-center h-48" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)", borderStyle: "dashed" }}>
          <div className="text-center">
            <span className="text-4xl">📊</span>
            <p className="text-sm mt-2 font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>Performance Chart Placeholder</p>
            <p className="text-xs mt-1" style={{ color: "var(--rtm-text-muted)" }}>Connect analytics to display content trend data.</p>
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
