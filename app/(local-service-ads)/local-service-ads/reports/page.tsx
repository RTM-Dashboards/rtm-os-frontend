"use client";

import Link from "next/link";
import { SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("local-service-ads")!;

const reports = [
  { title: "May LSA Report — Apex Roofing",    client: "Apex Roofing",  date: "Jun 5",  status: "success" as const, label: "Delivered"   },
  { title: "Q2 LSA Review — Pacific Dental",   client: "Pacific Dental",date: "Jun 8",  status: "pending" as const, label: "Pending"     },
  { title: "LSA Performance — Harbor Auto",    client: "Harbor Auto",   date: "Jun 9",  status: "pending" as const, label: "Pending"     },
  { title: "Monthly Summary — Summit",         client: "Summit",        date: "Jun 7",  status: "warning" as const, label: "Overdue"     },
];

export default function LsaReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>{workspace.name}</p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>LSA Reports</h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>LSA performance and lead quality reports.</p>
      </div>
      <SectionWrapper title="LSA Reports" description={`${reports.length} reports`}>
        <div className="space-y-2">
          {reports.map((r) => (
            <div key={r.title} className="flex items-center justify-between p-3 rounded-lg border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{r.title}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{r.client} · Due {r.date}</p>
              </div>
              <StatusBadge variant={r.status} label={r.label} size="sm" />
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
