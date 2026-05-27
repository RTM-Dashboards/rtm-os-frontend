"use client";

import Link from "next/link";
import { SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("account-management")!;

const clients = [
  { name: "Apex Roofing",        manager: "Jordan M.", score: 92, status: "success" as const, label: "Healthy"    },
  { name: "Sunbelt HVAC",        manager: "Sarah K.",  score: 54, status: "error"   as const, label: "At Risk"    },
  { name: "Pacific Dental",      manager: "Jordan M.", score: 88, status: "success" as const, label: "Healthy"    },
  { name: "Harbor Auto Group",   manager: "Mike T.",   score: 71, status: "warning" as const, label: "Watch"      },
  { name: "Blue Ridge Plumbing", manager: "Alex R.",   score: 65, status: "info"    as const, label: "Onboarding" },
  { name: "Metro Dental",        manager: "Sarah K.",  score: 94, status: "success" as const, label: "Healthy"    },
  { name: "Summit Landscaping",  manager: "Jordan M.", score: 82, status: "success" as const, label: "Healthy"    },
  { name: "Green Valley Pools",  manager: "Alex R.",   score: 77, status: "success" as const, label: "Good"       },
];

export default function AccountClientsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>{workspace.name}</p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Clients</h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>All clients and their health scores.</p>
      </div>
      <SectionWrapper title="Client Directory" description={`${clients.length} clients`}>
        <div className="space-y-2">
          {clients.map((c) => (
            <div key={c.name} className="flex items-center justify-between p-3 rounded-lg border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{c.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>AM: {c.manager}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold" style={{ color: "var(--rtm-text-secondary)" }}>{c.score}</span>
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
