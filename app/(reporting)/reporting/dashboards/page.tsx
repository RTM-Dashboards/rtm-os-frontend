"use client";

import { useState } from "react";

type DashboardType = "Client" | "Department" | "Executive" | "Project" | "Custom";
type DashboardStatus = "Published" | "Draft" | "Archived";

interface Dashboard {
  id: string;
  name: string;
  type: DashboardType;
  status: DashboardStatus;
  client?: string;
  department?: string;
  widgets: number;
  dataConnections: string[];
  owner: string;
  lastModified: string;
  views: number;
  description: string;
}

const TYPE_CFG: Record<DashboardType, { bg: string; color: string }> = {
  Client:     { bg: "#EFF6FF", color: "#1D4ED8" },
  Department: { bg: "#FAF5FF", color: "#7C3AED" },
  Executive:  { bg: "#FEF3C7", color: "#D97706" },
  Project:    { bg: "#ECFDF5", color: "#059669" },
  Custom:     { bg: "#F8FAFC", color: "#64748B" },
};

const STATUS_CFG: Record<DashboardStatus, { bg: string; color: string; border: string }> = {
  Published: { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" },
  Draft:     { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" },
  Archived:  { bg: "#FEF2F2", color: "#9CA3AF", border: "#FECACA" },
};

const DASHBOARDS: Dashboard[] = [
  {
    id: "dash-001",
    name: "Monthly SEO Performance — Client View",
    type: "Client",
    status: "Published",
    client: "All SEO Clients",
    widgets: 12,
    dataConnections: ["GA4", "GSC", "AgencyAnalytics"],
    owner: "Lily Chen",
    lastModified: "2025-07-15",
    views: 342,
    description: "Live SEO KPIs: rankings, organic traffic, impressions, conversions, and competitor comparison.",
  },
  {
    id: "dash-002",
    name: "PPC Performance — Google Ads View",
    type: "Client",
    status: "Published",
    client: "All Google Ads Clients",
    widgets: 10,
    dataConnections: ["Google Ads API", "GA4"],
    owner: "Lily Chen",
    lastModified: "2025-07-10",
    views: 218,
    description: "Cost, impressions, CTR, conversions, CPL, and ROAS metrics for all Google Ads clients.",
  },
  {
    id: "dash-003",
    name: "Executive Portfolio Dashboard",
    type: "Executive",
    status: "Published",
    widgets: 20,
    dataConnections: ["Internal DB", "AgencyAnalytics", "GA4", "Google Ads API"],
    owner: "Marcus Webb",
    lastModified: "2025-07-20",
    views: 87,
    description: "Agency-wide view: total MRR, client health, project status, department throughput, and escalation count.",
  },
  {
    id: "dash-004",
    name: "SEO Department Workload",
    type: "Department",
    status: "Published",
    department: "SEO",
    widgets: 8,
    dataConnections: ["Internal DB"],
    owner: "Aaron Park",
    lastModified: "2025-07-18",
    views: 56,
    description: "Open tasks, overdue items, task list completion rate, and team workload distribution for SEO.",
  },
  {
    id: "dash-005",
    name: "Project Delivery Engine — PM View",
    type: "Project",
    status: "Published",
    widgets: 15,
    dataConnections: ["Internal DB"],
    owner: "Priya Nair",
    lastModified: "2025-07-22",
    views: 134,
    description: "Project health, milestones, open blockers, at-risk projects, and department delivery status.",
  },
  {
    id: "dash-006",
    name: "Meta Ads Performance — Client View",
    type: "Client",
    status: "Draft",
    client: "All Meta Ads Clients",
    widgets: 9,
    dataConnections: ["Meta Business API", "GA4"],
    owner: "Lily Chen",
    lastModified: "2025-07-19",
    views: 0,
    description: "Reach, impressions, click-through, ROAS, and campaign performance for Meta Ads clients.",
  },
  {
    id: "dash-007",
    name: "Client Health Score Dashboard",
    type: "Client",
    status: "Published",
    widgets: 14,
    dataConnections: ["Internal DB", "AgencyAnalytics"],
    owner: "Priya Nair",
    lastModified: "2025-07-12",
    views: 201,
    description: "Retention risk, engagement scores, NPS, and contract renewal dates for all active clients.",
  },
  {
    id: "dash-008",
    name: "Legacy Reporting View Q1 2025",
    type: "Custom",
    status: "Archived",
    widgets: 6,
    dataConnections: ["GA4"],
    owner: "Lily Chen",
    lastModified: "2025-04-01",
    views: 22,
    description: "Archived Q1 2025 reporting view. No longer maintained.",
  },
];

function KpiCard({ label, value, icon, color }: { label: string; value: number | string; icon: string; color: string }) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-2" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-secondary)" }}>{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="text-3xl font-black" style={{ color }}>{value}</div>
    </div>
  );
}

export default function DashboardBuilderPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<DashboardType | "All">("All");
  const [statusFilter, setStatusFilter] = useState<DashboardStatus | "All">("All");

  const filtered = DASHBOARDS.filter(d => {
    if (typeFilter !== "All" && d.type !== typeFilter) return false;
    if (statusFilter !== "All" && d.status !== statusFilter) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const kpis = {
    total: DASHBOARDS.length,
    published: DASHBOARDS.filter(d => d.status === "Published").length,
    draft: DASHBOARDS.filter(d => d.status === "Draft").length,
    totalViews: DASHBOARDS.reduce((s, d) => s + d.views, 0),
    totalWidgets: DASHBOARDS.reduce((s, d) => s + d.widgets, 0),
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--rtm-bg)" }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4" style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">🏗️</span>
                <h1 className="text-2xl font-black" style={{ color: "var(--rtm-text-primary)" }}>Dashboard Builder</h1>
              </div>
              <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
                Build, manage, and publish client-facing and internal performance dashboards.
              </p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white shadow-sm" style={{ background: "var(--rtm-blue)" }}>
                + New Dashboard
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}>
                Import Template
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-5 max-w-[1400px] mx-auto w-full">
        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <KpiCard label="Total Dashboards" value={kpis.total} icon="📊" color="var(--rtm-blue)" />
          <KpiCard label="Published" value={kpis.published} icon="✅" color="#059669" />
          <KpiCard label="Draft" value={kpis.draft} icon="📝" color="#D97706" />
          <KpiCard label="Total Views" value={kpis.totalViews} icon="👁" color="#7C3AED" />
          <KpiCard label="Total Widgets" value={kpis.totalWidgets} icon="🔲" color="var(--rtm-blue)" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center p-4 rounded-xl mb-4" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
          <div className="flex-1 min-w-[200px] relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--rtm-text-muted)" }}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search dashboards..." className="w-full pl-9 pr-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }} />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as DashboardType | "All")} className="rounded-lg px-2 py-1.5 text-xs border outline-none" style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}>
            {(["All", "Client", "Department", "Executive", "Project", "Custom"] as (DashboardType | "All")[]).map(t => <option key={t}>{t}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as DashboardStatus | "All")} className="rounded-lg px-2 py-1.5 text-xs border outline-none" style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}>
            {(["All", "Published", "Draft", "Archived"] as (DashboardStatus | "All")[]).map(s => <option key={s}>{s}</option>)}
          </select>
          <span className="text-xs font-semibold ml-auto" style={{ color: "var(--rtm-text-muted)" }}>{filtered.length} dashboards</span>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(dash => {
            const typeCfg = TYPE_CFG[dash.type];
            const statusCfg = STATUS_CFG[dash.status];
            return (
              <div key={dash.id} className="rounded-xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-bold" style={{ background: typeCfg.bg, color: typeCfg.color }}>{dash.type}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold border" style={{ background: statusCfg.bg, color: statusCfg.color, borderColor: statusCfg.border }}>{dash.status}</span>
                    </div>
                    <h3 className="text-sm font-bold leading-snug" style={{ color: "var(--rtm-text-primary)" }}>{dash.name}</h3>
                  </div>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--rtm-text-secondary)" }}>{dash.description}</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: "Widgets", value: dash.widgets, color: "var(--rtm-blue)" },
                    { label: "Views", value: dash.views, color: "#7C3AED" },
                    { label: "Connections", value: dash.dataConnections.length, color: "#059669" },
                  ].map(m => (
                    <div key={m.label} className="rounded-lg py-2" style={{ background: "var(--rtm-bg)" }}>
                      <div className="text-base font-black" style={{ color: m.color }}>{m.value}</div>
                      <div className="text-[10px] font-semibold" style={{ color: "var(--rtm-text-muted)" }}>{m.label}</div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {dash.dataConnections.map(c => (
                    <span key={c} className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: "#ECFEFF", color: "#0E7490" }}>{c}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>Owner: <b>{dash.owner}</b> · Modified {dash.lastModified}</span>
                  <div className="flex gap-1">
                    <button className="px-2.5 py-1 rounded text-[11px] font-semibold text-white" style={{ background: "var(--rtm-blue)" }}>Edit</button>
                    <button className="px-2.5 py-1 rounded text-[11px] font-semibold border" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>View</button>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-16" style={{ color: "var(--rtm-text-muted)" }}>
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-sm font-medium">No dashboards match your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
