"use client";

import Link from "next/link";
import { SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("reporting")!;

const queue = [
  { title: "May Report — Apex Roofing",         client: "Apex Roofing",    type: "Monthly",    assignee: "Jordan M.", due: "Jun 7",  status: "info"as const, label: "In Progress"},
  { title: "Q2 Summary — Pacific Dental",       client: "Pacific Dental",  type: "Quarterly",  assignee: "Sarah K.",  due: "Jun 8",  status: "pending"as const, label: "Queued"},
  { title: "SEO Report — Harbor Auto",          client: "Harbor Auto",     type: "Monthly",    assignee: "Alex R.",   due: "Jun 9",  status: "pending"as const, label: "Queued"},
  { title: "KPI Dashboard — Summit Landscaping",client: "Summit",          type: "Monthly",    assignee: "Jordan M.", due: "Jun 6",  status: "warning"as const, label: "Overdue"},
  { title: "Annual Preview — Metro Dental",     client: "Metro Dental",    type: "Quarterly",  assignee: "Sarah K.",  due: "Jun 12", status: "info"as const, label: "Drafting"},
  { title: "SEO Audit — Blue Ridge",            client: "Blue Ridge",      type: "Monthly",    assignee: "Alex R.",   due: "Jun 10", status: "pending"as const, label: "Queued"},
];

export default function ReportingQueuePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: workspace.accentColor }}>{workspace.name}</p>
        <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>Report Queue</h1>
        <p className="text-sm mt-1"style={{ color: "var(--rtm-text-secondary)"}}>Reports currently in production.</p>
      </div>
      <SectionWrapper title="Report Queue"description={`${queue.length} reports`}>
        <div className="space-y-2">
          {queue.map((r) => (
            <div key={r.title} className="flex items-center justify-between p-3 rounded-lg border"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)"}}>
              <div>
                <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{r.title}</p>
                <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{r.type} · {r.assignee} · Due {r.due}</p>
              </div>
              <StatusBadge variant={r.status} label={r.label} size="sm"/>
            </div>
          ))}
        </div>
      </SectionWrapper>
      <div className="flex gap-2">
        <Link href={workspace.dashboardRoute} className="rtm-btn-secondary text-sm inline-flex items-center gap-1">← Dashboard</Link>
        <Link href={workspace.tasksRoute}     className="rtm-btn-primary  text-sm inline-flex items-center gap-1">Tasks →</Link>
      </div>
    </div>
  );
}
