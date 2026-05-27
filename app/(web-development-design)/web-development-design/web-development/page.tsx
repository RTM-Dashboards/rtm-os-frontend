"use client";

import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("web-development-design")!;

const projects = [
  { name: "Homepage Redesign — Summit Landscaping", status: "info" as const, label: "In Progress", due: "Jun 10", assignee: "Mike T."   },
  { name: "CRO Audit — Apex Roofing",               status: "pending" as const, label: "Open",        due: "Jun 8",  assignee: "Jordan M."  },
  { name: "Site Speed Audit — Pacific Dental",      status: "pending" as const, label: "Open",        due: "Jun 9",  assignee: "Alex R."    },
  { name: "New Service Page — Metro Dental",        status: "info" as const, label: "In Progress", due: "Jun 8",  assignee: "Sarah K."   },
  { name: "WordPress Migration — Blue Ridge",       status: "warning" as const, label: "Blocked",     due: "Jun 6",  assignee: "Alex R."    },
];

const variantMap: Record<string, "info"|"pending"|"warning"|"success"> = {
  "in-progress": "info", open: "pending", blocked: "warning", done: "success",
};

export default function WebDevelopmentPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>Web Dev & Design</p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Web Development</h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>Website builds, CRO, migrations and audits.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard title="Active Projects" value="6" trend="up" trendValue="1" iconBg="var(--rtm-blue-light)" iconColor="var(--rtm-blue)" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>} />
        <KpiCard title="Open Tasks"      value="11" trend="down" trendValue="2" iconBg="#FFFBEB" iconColor="#D97706" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>} />
        <KpiCard title="Completed (MTD)" value="4"  trend="up" trendValue="1"   iconBg="#ECFDF5" iconColor="#059669" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <KpiCard title="Blocked"         value="1"  trend="up" trendValue="1"   iconBg="#FEF2F2" iconColor="#DC2626" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
      </div>

      <SectionWrapper title="Web Development Projects" description="Active project queue">
        <div className="space-y-2">
          {projects.map((p) => (
            <div key={p.name} className="flex items-center justify-between p-3 rounded-lg border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{p.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{p.assignee} · Due {p.due}</p>
              </div>
              <StatusBadge variant={variantMap[p.status] ?? "pending"} label={p.label} size="sm" />
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Link href="/web-development-design/web-development/tasks" className="rtm-btn-primary text-sm inline-flex items-center gap-1">WD Tasks →</Link>
          <Link href="/web-development-design"                        className="rtm-btn-secondary text-sm inline-flex items-center gap-1">← Overview</Link>
        </div>
      </SectionWrapper>
    </div>
  );
}
