"use client";

import Link from "next/link";
import { SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("it-security")!;

const reports = [
  { title: "May Security Report",            scope: "Agency-wide",  date: "Jun 5",  status: "success" as const, label: "Delivered" },
  { title: "System Health Audit — June",     scope: "Agency-wide",  date: "Jun 8",  status: "pending" as const, label: "Pending"   },
  { title: "SSL Certificate Status Report",  scope: "Client sites", date: "Jun 7",  status: "info"    as const, label: "Drafting"  },
  { title: "Vulnerability Assessment Q2",    scope: "Agency-wide",  date: "Jun 10", status: "pending" as const, label: "Pending"   },
];

export default function ItReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>{workspace.name}</p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>IT Reports</h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>IT infrastructure and security reports.</p>
      </div>
      <SectionWrapper title="IT Reports" description={`${reports.length} reports`}>
        <div className="space-y-2">
          {reports.map((r) => (
            <div key={r.title} className="flex items-center justify-between p-3 rounded-lg border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{r.title}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{r.scope} · Due {r.date}</p>
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
