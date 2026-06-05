"use client";

import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { WorkspaceHeader } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("reporting")!;

// ── Mock KPI data ─────────────────────────────────────────────────────────────
const kpiData = {
  totalReportsDue:        18,
  reportsInProgress:      11,
  reportsReadyForQA:       5,
  reportsSent:            42,
  overdueReports:          3,
  clientReportsThisMonth: 47,
};

// ── Department health mock ─────────────────────────────────────────────────────
const deptHealth = [
  { dept: "SEO",              reports: 12, onTime: 10, late: 2,  status: "warning" as const,  label: "2 Late"   },
  { dept: "Paid Advertising", reports: 9,  onTime: 9,  late: 0,  status: "success" as const,  label: "On Track" },
  { dept: "LSA",              reports: 7,  onTime: 6,  late: 1,  status: "warning" as const,  label: "1 Late"   },
  { dept: "GBP",              reports: 8,  onTime: 8,  late: 0,  status: "success" as const,  label: "On Track" },
  { dept: "Yelp",             reports: 5,  onTime: 4,  late: 1,  status: "warning" as const,  label: "1 Late"   },
];

// ── Recent report activity ─────────────────────────────────────────────────────
const recentActivity = [
  { client: "Apex Roofing",       dept: "SEO",         type: "Monthly SEO",        status: "success" as const, label: "Sent",        due: "Jun 1" },
  { client: "Pacific Dental",     dept: "Paid Ads",    type: "Monthly Paid Ads",   status: "info"    as const, label: "QA In Progress", due: "Jun 5" },
  { client: "Harbor Auto",        dept: "SEO",         type: "Monthly SEO",        status: "pending" as const, label: "In Progress", due: "Jun 7" },
  { client: "Summit Landscaping", dept: "GBP",         type: "Monthly GBP",        status: "warning" as const, label: "Overdue",     due: "May 28" },
  { client: "Metro Dental",       dept: "LSA",         type: "Monthly LSA",        status: "pending" as const, label: "Draft",       due: "Jun 10" },
  { client: "Coastal Plumbing",   dept: "Yelp",        type: "Monthly Yelp",       status: "success" as const, label: "Sent",        due: "Jun 1" },
];

// ── Dept report sections ───────────────────────────────────────────────────────
const reportSections = [
  { label: "All Client Reports",      href: "/reporting/reports",            icon: "📋", description: "Complete client report table",        accent: "#0F766E" },
  { label: "SEO Reports",             href: "/reporting/seo",                icon: "🔍", description: "SEO department report source",        accent: "#2563EB" },
  { label: "Paid Advertising Reports",href: "/reporting/paid-advertising",   icon: "🎯", description: "Paid Ads report source",             accent: "#DC2626" },
  { label: "LSA Reports",             href: "/reporting/lsa",                icon: "⭐", description: "Local Service Ads report source",    accent: "#B45309" },
  { label: "GBP Reports",             href: "/reporting/gbp",                icon: "📍", description: "Google Business Profile report source",accent: "#059669" },
  { label: "Yelp Reports",            href: "/reporting/yelp",               icon: "⭐", description: "Yelp department report source",      accent: "#D97706" },
];

export default function ReportingDashboard() {
  return (
    <div className="space-y-6">
      <WorkspaceHeader
        workspace={workspace}
        subtitle="Central report management — department sources → QA → client-ready delivery."
      />

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <KpiCard
          title="Total Reports Due"
          value={String(kpiData.totalReportsDue)}
          trend="down"
          trendValue="2"
          iconBg="#FFFBEB"
          iconColor="#D97706"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <KpiCard
          title="Reports In Progress"
          value={String(kpiData.reportsInProgress)}
          trend="up"
          trendValue="3"
          iconBg="var(--rtm-blue-light)"
          iconColor="var(--rtm-blue)"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
        />
        <KpiCard
          title="Ready for QA"
          value={String(kpiData.reportsReadyForQA)}
          trend="up"
          trendValue="1"
          iconBg="#F0FDF4"
          iconColor="#16A34A"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <KpiCard
          title="Reports Sent"
          value={String(kpiData.reportsSent)}
          trend="up"
          trendValue="11"
          iconBg="#ECFDF5"
          iconColor="#059669"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
        />
        <KpiCard
          title="Overdue Reports"
          value={String(kpiData.overdueReports)}
          trend="up"
          trendValue="1"
          iconBg="#FEF2F2"
          iconColor="#DC2626"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
        />
        <KpiCard
          title="Client Reports This Month"
          value={String(kpiData.clientReportsThisMonth)}
          trend="up"
          trendValue="8%"
          iconBg="#F5F3FF"
          iconColor="#7C3AED"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
        />
      </div>

      {/* ── Dept Report Sections ── */}
      <SectionWrapper title="Report Sections" description="Navigate to department-specific report management">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {reportSections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="flex items-start gap-3 p-4 rounded-xl border transition-all hover:shadow-md"
              style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = s.accent;
                (e.currentTarget as HTMLAnchorElement).style.background = `${s.accent}08`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--rtm-border-light)";
                (e.currentTarget as HTMLAnchorElement).style.background = "var(--rtm-bg)";
              }}
            >
              <span className="text-2xl">{s.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{s.label}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{s.description}</p>
              </div>
              <span className="text-sm flex-shrink-0" style={{ color: s.accent }}>→</span>
            </Link>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Department Report Health ── */}
      <SectionWrapper title="Department Report Health" description="On-time status by department">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                {["Department", "Total Reports", "On Time", "Late", "Status"].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--rtm-border-light)" }}>
              {deptHealth.map((d) => (
                <tr key={d.dept} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-2.5 px-3 font-medium" style={{ color: "var(--rtm-text-primary)" }}>{d.dept}</td>
                  <td className="py-2.5 px-3" style={{ color: "var(--rtm-text-secondary)" }}>{d.reports}</td>
                  <td className="py-2.5 px-3 text-green-600 font-medium">{d.onTime}</td>
                  <td className="py-2.5 px-3 text-red-500 font-medium">{d.late}</td>
                  <td className="py-2.5 px-3">
                    <StatusBadge variant={d.status} label={d.label} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

      {/* ── Recent Activity ── */}
      <SectionWrapper title="Recent Report Activity" description="Latest client report updates">
        <div className="space-y-2">
          {recentActivity.map((r, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{r.client}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{r.dept} · {r.type} · Due {r.due}</p>
              </div>
              <StatusBadge variant={r.status} label={r.label} size="sm" />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Link href="/reporting/reports" className="rtm-btn-primary text-sm inline-flex items-center gap-1">
            View All Reports →
          </Link>
        </div>
      </SectionWrapper>

      {/* ── Workflow Architecture Note ── */}
      <SectionWrapper title="Report Workflow Architecture" description="How reports flow from department to client delivery">
        <div className="space-y-3">
          {[
            { from: "SEO Department", fromHref: "/seo-local/seo/reports",               to: "SEO Reports",            toHref: "/reporting/seo",              color: "#2563EB" },
            { from: "GBP Department", fromHref: "/seo-local/gbp/reports",               to: "GBP Reports",            toHref: "/reporting/gbp",              color: "#059669" },
            { from: "Yelp Department",fromHref: "/seo-local/yelp/reports",              to: "Yelp Reports",           toHref: "/reporting/yelp",             color: "#D97706" },
            { from: "Paid Ads Dept.", fromHref: "/paid-advertising/reports",            to: "Paid Ads Reports",       toHref: "/reporting/paid-advertising", color: "#DC2626" },
            { from: "LSA Department", fromHref: "/local-service-ads/reports",           to: "LSA Reports",            toHref: "/reporting/lsa",              color: "#B45309" },
          ].map((flow) => (
            <div key={flow.from} className="flex items-center gap-2 p-3 rounded-lg border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
              <Link href={flow.fromHref} className="text-xs font-semibold px-2.5 py-1 rounded-md transition-colors hover:opacity-80" style={{ background: `${flow.color}15`, color: flow.color, border: `1px solid ${flow.color}30` }}>
                {flow.from}
              </Link>
              <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>→ feeds into →</span>
              <Link href={flow.toHref} className="text-xs font-semibold px-2.5 py-1 rounded-md transition-colors hover:opacity-80" style={{ background: `${flow.color}15`, color: flow.color, border: `1px solid ${flow.color}30` }}>
                {flow.to}
              </Link>
              <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>→ generates →</span>
              <Link href="/reporting/reports" className="text-xs font-semibold px-2.5 py-1 rounded-md transition-colors hover:opacity-80" style={{ background: "#0F766E15", color: "#0F766E", border: "1px solid #0F766E30" }}>
                Client-Ready Report
              </Link>
            </div>
          ))}
        </div>
      </SectionWrapper>
    </div>
  );
}
