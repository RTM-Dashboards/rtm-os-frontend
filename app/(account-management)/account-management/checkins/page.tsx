"use client";

import Link from "next/link";
import { SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("account-management")!;

const checkins = [
  { client: "Apex Roofing",        manager: "Jordan M.", date: "Jun 5",  type: "Monthly Call",    status: "warning" as const, label: "Today"     },
  { client: "Pacific Dental",      manager: "Jordan M.", date: "Jun 6",  type: "Quarterly Review", status: "warning" as const, label: "Tomorrow"  },
  { client: "Sunbelt HVAC",        manager: "Sarah K.",  date: "Jun 7",  type: "At-Risk Call",    status: "warning" as const, label: "Upcoming"  },
  { client: "Harbor Auto Group",   manager: "Mike T.",   date: "Jun 9",  type: "Monthly Call",    status: "info"    as const, label: "Scheduled" },
  { client: "Metro Dental",        manager: "Sarah K.",  date: "Jun 10", type: "Onboarding Call", status: "info"    as const, label: "Scheduled" },
];

export default function AccountCheckinsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>{workspace.name}</p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Check-ins</h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>Scheduled client calls and touchpoints.</p>
      </div>
      <SectionWrapper title="Scheduled Check-ins" description={`${checkins.length} upcoming`}>
        <div className="space-y-2">
          {checkins.map((c) => (
            <div key={c.client} className="flex items-center justify-between p-3 rounded-lg border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{c.client}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{c.type} · {c.manager}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium" style={{ color: "var(--rtm-text-secondary)" }}>{c.date}</span>
                <StatusBadge variant={c.status} label={c.label} size="sm" />
              </div>
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
