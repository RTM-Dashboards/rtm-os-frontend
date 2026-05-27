"use client";

import Link from "next/link";
import { SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("it-security")!;

const systems = [
  { name: "Client CMS Platform",        type: "WordPress Multisite", health: 98,  status: "success" as const, label: "Healthy"  },
  { name: "Agency Email",               type: "Google Workspace",    health: 100, status: "success" as const, label: "Healthy"  },
  { name: "VPN & Remote Access",        type: "Security Gateway",    health: 94,  status: "success" as const, label: "Healthy"  },
  { name: "Client Hosting — Apex",      type: "Web Hosting",         health: 82,  status: "warning" as const, label: "Watch"    },
  { name: "Backup Systems",             type: "Cloud Storage",       health: 96,  status: "success" as const, label: "Healthy"  },
  { name: "Monitoring & Alerting",      type: "DevOps",              health: 99,  status: "success" as const, label: "Healthy"  },
];

export default function ItSystemsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>{workspace.name}</p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Systems</h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>Infrastructure and system health monitoring.</p>
      </div>
      <SectionWrapper title="System Status" description={`${systems.length} systems monitored`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {systems.map((s) => (
            <div key={s.name} className="p-4 rounded-lg border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-semibold leading-tight" style={{ color: "var(--rtm-text-primary)" }}>{s.name}</p>
                <StatusBadge variant={s.status} label={s.label} size="sm" />
              </div>
              <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{s.type}</p>
              <p className="text-lg font-bold mt-2" style={{ color: s.health >= 95 ? "#059669" : "#D97706" }}>
                {s.health}%<span className="text-xs font-normal ml-1" style={{ color: "var(--rtm-text-muted)" }}>health</span>
              </p>
            </div>
          ))}
        </div>
      </SectionWrapper>
      <div className="flex gap-2">
        <Link href={workspace.dashboardRoute}          className="rtm-btn-secondary text-sm inline-flex items-center gap-1">← Dashboard</Link>
        <Link href="/it-security/security"  className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Security →</Link>
        <Link href={workspace.tasksRoute}              className="rtm-btn-primary  text-sm inline-flex items-center gap-1">Tasks →</Link>
      </div>
    </div>
  );
}
