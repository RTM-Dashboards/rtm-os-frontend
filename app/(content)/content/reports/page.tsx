"use client";

import Link from "next/link";
import { SectionWrapper } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("content")!;

export default function ContentReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>{workspace.name}</p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)"}}>Reports</h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)"}}>Client content performance reports.</p>
      </div>
      <SectionWrapper title="Content Reports" description="No reports connected yet">
        <div
          className="rounded-xl border px-4 py-10 text-center"
          style={{ borderColor: "var(--rtm-border-light)", borderStyle: "dashed", background: "var(--rtm-bg)" }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--rtm-text-secondary)" }}>
            No reports yet
          </p>
          <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
            Content reports will appear here once a report source is connected.
            Controls and layout are ready.
          </p>
        </div>
      </SectionWrapper>
      <div className="flex gap-2">
        <Link href={workspace.dashboardRoute} className="rtm-btn-secondary text-sm inline-flex items-center gap-1">← Dashboard</Link>
        <Link href={workspace.tasksRoute} className="rtm-btn-primary text-sm inline-flex items-center gap-1">Tasks →</Link>
      </div>
    </div>
  );
}
