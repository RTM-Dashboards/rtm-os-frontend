"use client";

import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge, DataTable, ProgressBar, ActivityFeed } from "@/components/ui";
import type { Column, ActivityItem } from "@/components/ui";
import { WorkspaceHeader, WorkspaceQuickLinks } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("sales")!;

interface Lead extends Record<string, unknown> {
  name: string; source: string; value: string; stage: string; owner: string; probability: number;
}

const leads: Lead[] = [
  { name: "Summit Landscaping", source: "Referral",      value: "$2,400/mo", stage: "proposal",    owner: "Jordan M.", probability: 75 },
  { name: "Blue Ridge Plumbing",source: "Website",       value: "$1,800/mo", stage: "discovery",   owner: "Sarah K.",  probability: 40 },
  { name: "Harbor Auto Group",  source: "Cold Outreach", value: "$5,000/mo", stage: "negotiation", owner: "Mike T.",   probability: 85 },
  { name: "Metro Dental Group", source: "Referral",      value: "$4,500/mo", stage: "proposal",    owner: "Jordan M.", probability: 65 },
  { name: "Sunstate Solar",     source: "Google Ads",    value: "$6,000/mo", stage: "closed-won",  owner: "Sarah K.",  probability: 100 },
];

const columns: Column<Lead>[] = [
  { key: "name",  header: "Company" },
  { key: "source",header: "Source",   width: "130px" },
  { key: "value", header: "MRR",      width: "110px" },
  { key: "owner", header: "Owner",    width: "120px" },
  {
    key: "probability", header: "Win %", width: "130px",
    render: (v) => {
      const n = Number(v);
      return (
        <div className="flex items-center gap-2">
          <ProgressBar value={n} color={n >= 70 ? "bg-emerald-500" : n >= 40 ? "bg-amber-500" : "bg-red-400"} height={5} />
          <span className="text-xs font-semibold text-slate-600 w-8 flex-shrink-0">{n}%</span>
        </div>
      );
    },
  },
  {
    key: "stage", header: "Stage", width: "130px",
    render: (v) => {
      const map: Record<string, { variant: "info"|"pending"|"warning"|"success"; label: string }> = {
        discovery:    { variant: "info",    label: "Discovery"    },
        proposal:     { variant: "pending", label: "Proposal"     },
        negotiation:  { variant: "warning", label: "Negotiation"  },
        "closed-won": { variant: "success", label: "Closed Won"   },
      };
      const c = map[String(v)] ?? { variant: "info" as const, label: String(v) };
      return <StatusBadge variant={c.variant} label={c.label} size="sm" />;
    },
  },
];

const activity: ActivityItem[] = [
  { id: "1", actor: "Jordan M.", action: "sent proposal to",           target: "Summit Landscaping", timestamp: "30 min ago", type: "task",     avatarColor: "#1B4FD8" },
  { id: "2", actor: "Mike T.",   action: "moved lead to negotiation",  target: "Harbor Auto Group",  timestamp: "1h ago",     type: "campaign", avatarColor: "#7C3AED" },
  { id: "3", actor: "Sarah K.",  action: "closed-won deal with",       target: "Sunstate Solar",     timestamp: "2h ago",     type: "client",   avatarColor: "#059669" },
  { id: "4", actor: "Jordan M.", action: "scheduled follow-up with",   target: "Metro Dental",       timestamp: "3h ago",     type: "task",     avatarColor: "#1B4FD8" },
];

const quickLinks = [
  { label: "Sales Dashboard",    href: "/sales",           icon: "📊", description: "Overview & KPIs",         accent: "#059669" },
  { label: "Leads",              href: "/sales/leads",     icon: "🎯", description: "Active lead pipeline",    accent: "#1B4FD8" },
  { label: "Tasks",              href: "/sales/tasks",     icon: "✅", description: "Sales task queue",        accent: "#059669" },
  { label: "Proposal Generator", href: "/sales/proposals", icon: "📝", description: "Create proposals",        accent: "#7C3AED" },
  { label: "Pipeline",           href: "/sales/pipeline",  icon: "🔄", description: "Deal flow tracker",       accent: "#0891B2" },
  { label: "Follow-ups",         href: "/sales/followups", icon: "📅", description: "Scheduled touchpoints",   accent: "#D97706" },
  { label: "Performance",        href: "/sales/performance",icon: "📈",description: "Sales metrics",          accent: "#059669" },
];

export default function SalesDashboard() {
  return (
    <div className="space-y-6">
      <WorkspaceHeader workspace={workspace} subtitle="Leads, proposals, pipeline and revenue forecasting." />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="New Leads (MTD)"   value="24"   trend="up"   trendValue="8"     iconBg="#ECFDF5" iconColor="#059669" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
        <KpiCard title="Pipeline Value"    value="$87k" trend="up"   trendValue="12%"   iconBg="#EFF6FF" iconColor="#2563EB" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <KpiCard title="Proposals Sent"   value="9"    trend="up"   trendValue="3"     iconBg="#F5F3FF" iconColor="#7C3AED" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
        <KpiCard title="Close Rate"        value="34%"  trend="up"   trendValue="4%"    iconBg="#FFFBEB" iconColor="#D97706" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} />
      </div>

      <WorkspaceQuickLinks links={quickLinks} title="Sales Workspace — Navigation" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionWrapper title="Active Leads" description="Current pipeline" className="lg:col-span-2">
          <DataTable columns={columns} data={leads} />
          <div className="mt-4 flex gap-2">
            <Link href="/sales/leads"    className="rtm-btn-primary text-sm inline-flex items-center gap-1">View All Leads →</Link>
            <Link href="/sales/tasks"    className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Tasks →</Link>
            <Link href="/sales/pipeline" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Pipeline →</Link>
          </div>
        </SectionWrapper>

        <SectionWrapper title="Recent Activity" description="Latest sales actions">
          <ActivityFeed items={activity} />
        </SectionWrapper>
      </div>
    </div>
  );
}
