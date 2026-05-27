"use client";

import Link from "next/link";
import { SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("billing")!;

const cancellations = [
  { client: "Harbor Auto Group", reason: "Budget cuts",       date: "Jun 5", stage: "In Review",   status: "warning" as const, label: "In Review"   },
  { client: "Sunbelt HVAC",      reason: "Pausing services",  date: "Jun 4", stage: "Offboarding", status: "warning" as const, label: "Offboarding" },
  { client: "Cascade Flooring",  reason: "Switching provider",date: "Jun 2", stage: "Closed",      status: "info"    as const, label: "Closed"      },
];

export default function BillingCancellationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>{workspace.name}</p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Cancellations</h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>Active and recent cancellation pipeline.</p>
      </div>
      <SectionWrapper title="Cancellation Pipeline" description={`${cancellations.length} cancellations`}>
        <div className="space-y-3">
          {cancellations.map((c) => (
            <div key={c.client} className="p-4 rounded-lg border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{c.client}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--rtm-text-muted)" }}>Reason: {c.reason}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>Requested: {c.date}</p>
                </div>
                <StatusBadge variant={c.status} label={c.label} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>
      <div className="flex gap-2">
        <Link href={workspace.dashboardRoute}  className="rtm-btn-secondary text-sm inline-flex items-center gap-1">← Dashboard</Link>
        <Link href="/billing/offboarding"      className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Offboarding →</Link>
        <Link href={workspace.tasksRoute}      className="rtm-btn-primary  text-sm inline-flex items-center gap-1">Tasks →</Link>
      </div>
    </div>
  );
}
