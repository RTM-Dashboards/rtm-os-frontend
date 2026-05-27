"use client";

import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { WorkspaceHeader, WorkspaceQuickLinks } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("reporting")!;

const recentReports = [
  { title: "May Report — Apex Roofing",         client: "Apex Roofing",    type: "Monthly",    status: "success" as const, label: "Delivered" },
  { title: "Q2 Summary — Pacific Dental",       client: "Pacific Dental",  type: "Quarterly",  status: "pending" as const, label: "In Progress" },
  { title: "SEO Report — Harbor Auto",          client: "Harbor Auto",     type: "Monthly",    status: "pending" as const, label: "In Progress" },
  { title: "KPI Dashboard — Summit Landscaping",client: "Summit",          type: "Monthly",    status: "warning" as const, label: "Overdue"   },
  { title: "Annual Preview — Metro Dental",     client: "Metro Dental",    type: "Quarterly",  status: "info"    as const, label: "Drafting"  },
];

const quickLinks = [
  { label: "Reporting Dashboard", href: "/reporting",             icon: "📊", description: "Reporting overview",    accent: "#0F766E" },
  { label: "Tasks",               href: "/reporting/tasks",        icon: "✅", description: "Report task queue",     accent: "#1B4FD8" },
  { label: "Work Queue",          href: "/reporting/queue",        icon: "📂", description: "Reports in progress",   accent: "#059669" },
  { label: "Clients",             href: "/reporting/clients",      icon: "👥", description: "Reporting clients",     accent: "#7C3AED" },
  { label: "Performance",         href: "/reporting/performance",  icon: "📈", description: "Delivery metrics",      accent: "#D97706" },
];

export default function ReportingDashboard() {
  return (
    <div className="space-y-6">
      <WorkspaceHeader workspace={workspace} subtitle="Client reports, analytics and agency-wide insights." />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Reports Due"      value="12" trend="down" trendValue="2"   iconBg="#FFFBEB"              iconColor="#D97706"         icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <KpiCard title="Completed (MTD)"  value="47" trend="up"   trendValue="11"  iconBg="#ECFDF5"              iconColor="#059669"         icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <KpiCard title="Overdue"          value="3"  trend="up"   trendValue="1"   iconBg="#FEF2F2"              iconColor="#DC2626"         icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
        <KpiCard title="On-Time Rate"     value="96%" trend="up"  trendValue="1%"  iconBg="var(--rtm-blue-light)" iconColor="var(--rtm-blue)" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} />
      </div>

      <WorkspaceQuickLinks links={quickLinks} title="Reporting Workspace — Navigation" />

      <SectionWrapper title="Recent Reports" description="Latest activity">
        <div className="space-y-2">
          {recentReports.map((r) => (
            <div key={r.title} className="flex items-center justify-between p-3 rounded-lg border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{r.title}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{r.client} · {r.type}</p>
              </div>
              <StatusBadge variant={r.status} label={r.label} size="sm" />
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Link href="/reporting/tasks" className="rtm-btn-primary text-sm inline-flex items-center gap-1">View Tasks →</Link>
          <Link href="/reporting/queue" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Report Queue →</Link>
        </div>
      </SectionWrapper>
    </div>
  );
}
