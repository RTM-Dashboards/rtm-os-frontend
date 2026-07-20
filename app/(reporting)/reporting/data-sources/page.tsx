"use client";

import { useState } from "react";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { WorkspaceHeader } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("reporting")!;

//  Types 
type ConnectorCategory =
  | "Analytics"| "Advertising"| "CRM"| "Call Tracking"| "Communication"| "AI"| "Custom API";

type ConnectorStatus = "Connected"| "Disconnected"| "Error"| "Syncing"| "Pending Setup";

interface DataConnector {
  id: string;
  name: string;
  category: ConnectorCategory;
  status: ConnectorStatus;
  lastSync: string;
  owner: string;
  clientsUsing: number;
  servicesUsing: string[];
  description: string;
  syncFrequency: string;
  dataTypes: string[];
}

//  Connector Catalogue — honest state: all "Not Connected"
// Real OAuth credentials are required to activate each connector.
// Status is "Not Connected" for all until OAuth is configured.
const connectors: DataConnector[] = [
  {
    id: "c-001",
    name: "Google Analytics 4",
    category: "Analytics",
    status: "Disconnected",
    lastSync: "—",
    owner: "Unassigned",
    clientsUsing: 0,
    servicesUsing: ["SEO", "Website", "PPC"],
    description: "Website traffic, sessions, conversions, and user behavior data.",
    syncFrequency: "Daily (when connected)",
    dataTypes: ["Sessions", "Conversions", "Traffic Sources", "Goal Completions"],
  },
  {
    id: "c-002",
    name: "Google Ads",
    category: "Advertising",
    status: "Disconnected",
    lastSync: "—",
    owner: "Unassigned",
    clientsUsing: 0,
    servicesUsing: ["PPC"],
    description: "Google Ads campaign performance, spend, ROAS, and conversion data.",
    syncFrequency: "Daily (when connected)",
    dataTypes: ["Impressions", "Clicks", "Spend", "Conversions", "ROAS", "Quality Score"],
  },
  {
    id: "c-003",
    name: "Meta Ads",
    category: "Advertising",
    status: "Disconnected",
    lastSync: "—",
    owner: "Unassigned",
    clientsUsing: 0,
    servicesUsing: ["Meta Ads"],
    description: "Facebook and Instagram campaign metrics, audience data, and creative performance.",
    syncFrequency: "Daily (when connected)",
    dataTypes: ["Impressions", "Reach", "CTR", "CPC", "Conversions", "Ad Sets"],
  },
  {
    id: "c-004",
    name: "Google Search Console",
    category: "Analytics",
    status: "Disconnected",
    lastSync: "—",
    owner: "Unassigned",
    clientsUsing: 0,
    servicesUsing: ["SEO"],
    description: "Organic search performance, keyword impressions, CTR, and indexing status.",
    syncFrequency: "Daily (when connected)",
    dataTypes: ["Queries", "Impressions", "CTR", "Average Position", "Index Coverage"],
  },
  {
    id: "c-005",
    name: "Google Business Profile",
    category: "Analytics",
    status: "Disconnected",
    lastSync: "—",
    owner: "Unassigned",
    clientsUsing: 0,
    servicesUsing: ["GBP"],
    description: "GBP listing performance, review data, search impressions, and call tracking.",
    syncFrequency: "Daily (when connected)",
    dataTypes: ["Views", "Searches", "Direction Requests", "Calls", "Reviews"],
  },
  {
    id: "c-006",
    name: "Local Services Ads",
    category: "Advertising",
    status: "Disconnected",
    lastSync: "—",
    owner: "Unassigned",
    clientsUsing: 0,
    servicesUsing: ["LSA"],
    description: "LSA lead volume, cost per lead, lead quality scores, and dispute data.",
    syncFrequency: "Daily (when connected)",
    dataTypes: ["Leads", "Cost Per Lead", "Lead Status", "Disputes", "Budget Utilization"],
  },
  {
    id: "c-007",
    name: "Call Tracking Provider",
    category: "Call Tracking",
    status: "Disconnected",
    lastSync: "—",
    owner: "Unassigned",
    clientsUsing: 0,
    servicesUsing: ["SEO", "PPC", "GBP", "LSA", "Meta Ads"],
    description: "Dynamic call tracking, recording, transcription, and attribution data.",
    syncFrequency: "Hourly (when connected)",
    dataTypes: ["Call Volume", "Duration", "Source", "Campaign", "Recording URL", "Transcript"],
  },
  {
    id: "c-008",
    name: "CRM Provider",
    category: "CRM",
    status: "Disconnected",
    lastSync: "—",
    owner: "Unassigned",
    clientsUsing: 0,
    servicesUsing: ["AI Automation", "Account Management"],
    description: "Lead pipeline, contact records, deal stages, and client account data.",
    syncFrequency: "Daily (when connected)",
    dataTypes: ["Contacts", "Deals", "Pipeline Stages", "Activities", "Revenue"],
  },
  {
    id: "c-009",
    name: "Google Sheets",
    category: "Custom API",
    status: "Disconnected",
    lastSync: "—",
    owner: "Unassigned",
    clientsUsing: 0,
    servicesUsing: ["SEO", "GBP", "PPC", "Meta Ads", "LSA", "Yelp"],
    description: "Manual data entry bridge for departments that export data to shared sheets.",
    syncFrequency: "On demand (when connected)",
    dataTypes: ["Custom Metrics", "Manual Inputs", "Department Exports"],
  },
  {
    id: "c-010",
    name: "OpenAI",
    category: "AI",
    status: "Disconnected",
    lastSync: "—",
    owner: "Unassigned",
    clientsUsing: 0,
    servicesUsing: ["AI Automation", "Call Intelligence", "Report Generation"],
    description: "AI classification, call analysis, report drafting, and insights generation. Requires API key configuration.",
    syncFrequency: "On demand (when connected)",
    dataTypes: ["Call Classifications", "Summaries", "Sentiment Scores", "Draft Reports"],
  },
  {
    id: "c-011",
    name: "Custom API Connector",
    category: "Custom API",
    status: "Pending Setup",
    lastSync: "—",
    owner: "Unassigned",
    clientsUsing: 0,
    servicesUsing: [],
    description: "Generic REST API connector for custom data source integration.",
    syncFrequency: "Configurable",
    dataTypes: ["Custom"],
  },
  {
    id: "c-012",
    name: "Yelp Ads",
    category: "Advertising",
    status: "Disconnected",
    lastSync: "—",
    owner: "Unassigned",
    clientsUsing: 0,
    servicesUsing: ["Yelp"],
    description: "Yelp advertising performance, review metrics, and profile impressions.",
    syncFrequency: "Daily (when connected)",
    dataTypes: ["Impressions", "Clicks", "Reviews", "Rating Trends"],
  },
];

const categoryColors: Record<ConnectorCategory, { bg?: string; color?: string }> = {
  Analytics:     { bg: "#EFF6FF", color: "#1D4ED8"},
  Advertising:   { bg: "#FFF7ED", color: "#C2410C"},
  CRM:           { bg: "#F5F3FF", color: "#6D28D9"},
  "Call Tracking": { bg: "#ECFDF5", color: "#065F46"},
  Communication: { bg: "#F0F9FF", color: "#0369A1"},
  AI:            { bg: "#FDF4FF", color: "#7E22CE"},
  "Custom API":  { bg: "#F8FAFC", color: "#475569"},
};

const statusVariant: Record<ConnectorStatus, "success"| "warning"| "error"| "info"| "pending"| "neutral"> = {
  Connected:       "success",
  Disconnected:    "neutral",
  Error:           "error",
  Syncing:         "info",
  "Pending Setup": "pending",
};

const ALL_CATEGORIES: Array<ConnectorCategory | "All"> = [
  "All",
  "Analytics",
  "Advertising",
  "CRM",
  "Call Tracking",
  "Communication",
  "AI",
  "Custom API",
];

export default function DataSourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState<ConnectorCategory | "All">("All");
  const [selectedConnector, setSelectedConnector] = useState<DataConnector | null>(null);
  const [search, setSearch] = useState("");

  const filtered = connectors.filter((c) => {
    if (selectedCategory !== "All"&& c.category !== selectedCategory) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const connected = connectors.filter((c) => c.status === "Connected").length;
  const pending = connectors.filter((c) => c.status === "Pending Setup").length;
  const notConnected = connectors.filter((c) => c.status === "Disconnected").length;

  return (
    <div className="space-y-6">
      <WorkspaceHeader
        workspace={workspace}
        subtitle="Manage all data source connectors powering automated report generation and call intelligence."/>

      {/* OAuth Groundwork Banner */}
      <div
        className="flex items-start gap-3 rounded-xl border px-4 py-3"
        style={{ background: "#FFFBEB", borderColor: "#D9770640" }}
      >
        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#D97706" }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <div>
          <span className="text-xs font-bold" style={{ color: "#92400E" }}>Connectors Require OAuth Configuration — Not Yet Active</span>
          <p className="text-xs mt-0.5" style={{ color: "#92400E" }}>
            Each connector requires OAuth app credentials and authorization from the respective platform (Google, Meta, Yelp, etc.).
            All connectors show their honest <strong>Not Connected</strong> status. Sync, Configure, and Troubleshoot actions are available
            once OAuth credentials are configured. The connector catalogue and data type schema are real groundwork ready for integration.
          </p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Total Connectors" value={String(connectors.length)}
          subtitle="Across all categories" iconBg="#EFF6FF" iconColor="#1D4ED8" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>}
        />
        <KpiCard
          title="Not Connected" value={String(notConnected)}
          subtitle="OAuth required" iconBg="#F9FAFB" iconColor="#6B7280" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M18.364 5.636a9 9 0 010 12.728M5.636 5.636a9 9 0 000 12.728M9 12h.01M15 12h.01"/></svg>}
        />
        <KpiCard
          title="Active" value={String(connected)}
          subtitle="Live data feeds" iconBg="#ECFDF5" iconColor="#059669" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        />
        <KpiCard
          title="Pending Setup" value={String(pending)}
          subtitle="Not yet configured" iconBg="#FFFBEB" iconColor="#D97706" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"fill="none"stroke="currentColor"viewBox="0 0 24 24"style={{ color: "var(--rtm-text-muted)"}}><circle cx="11"cy="11"r="8"/><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M21 21l-4.35-4.35"/></svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search connectors..."className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm outline-none"style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg-secondary)"}}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all"style={{
                borderColor: selectedCategory === cat ? "var(--rtm-blue)": "var(--rtm-border-light)",
                background: selectedCategory === cat ? "var(--rtm-blue-light)": "transparent",
                color: selectedCategory === cat ? "var(--rtm-blue)": "var(--rtm-text-secondary)",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
        <button
          disabled
          className="ml-auto text-xs font-semibold px-4 py-2 rounded-lg border opacity-40 cursor-not-allowed"
          style={{ color: "#0F766E", background: "#0F766E15", borderColor: "#0F766E40" }}
          title="Coming when OAuth credentials are configured"
        >
          Add Connector
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Connector Table */}
        <div className="xl:col-span-2">
          <SectionWrapper
            title="Data Connectors"description={`${filtered.length} connector${filtered.length !== 1 ? "s": ""} — ${selectedCategory === "All"? "all categories": selectedCategory}`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[760px]">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
                    {["Connector", "Category", "Status", "Last Sync", "Owner", "Clients", "Services"].map((h) => (
                      <th
                        key={h}
                        className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap"style={{ color: "var(--rtm-text-muted)"}}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => {
                    const catStyle = categoryColors[row.category];
                    return (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedConnector(row)}
                        className="hover:bg-slate-50/50 transition-colors cursor-pointer"style={{
                          borderBottom: "1px solid var(--rtm-border-light)",
                          background: selectedConnector?.id === row.id ? "var(--rtm-blue-light)": undefined,
                        }}
                      >
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-sm"style={{ color: "var(--rtm-text-primary)"}}>{row.name}</div>
                          <div className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{row.syncFrequency}</div>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full"style={{ background: catStyle.bg, color: catStyle.color }}
                          >
                            {row.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <StatusBadge variant={statusVariant[row.status]} label={row.status} size="sm"/>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{row.lastSync}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{row.owner}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>{row.clientsUsing}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex flex-wrap gap-1">
                            {row.servicesUsing.slice(0, 3).map((s) => (
                              <span key={s} className="text-xs px-1.5 py-0.5 rounded"style={{ background: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)"}}>{s}</span>
                            ))}
                            {row.servicesUsing.length > 3 && (
                              <span className="text-xs px-1.5 py-0.5 rounded"style={{ background: "var(--rtm-border-light)", color: "var(--rtm-text-muted)"}}>+{row.servicesUsing.length - 3}</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionWrapper>
        </div>

        {/* Detail Panel */}
        <div className="space-y-4">
          {selectedConnector ? (
            <>
              <SectionWrapper title="Connector Detail"description={selectedConnector.name}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-base"style={{ color: "var(--rtm-text-primary)"}}>{selectedConnector.name}</div>
                      <div className="text-xs mt-1"style={{ color: "var(--rtm-text-muted)"}}>{selectedConnector.description}</div>
                    </div>
                    <button
                      onClick={() => setSelectedConnector(null)}
                      className="text-sm px-1.5 py-0.5 rounded"style={{ color: "var(--rtm-text-muted)"}}
                    >
                      
                    </button>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <StatusBadge variant={statusVariant[selectedConnector.status]} label={selectedConnector.status} size="sm"/>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"style={{ background: categoryColors[selectedConnector.category].bg, color: categoryColors[selectedConnector.category].color }}
                    >
                      {selectedConnector.category}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Owner", value: selectedConnector.owner },
                      { label: "Sync Frequency", value: selectedConnector.syncFrequency },
                      { label: "Last Sync", value: selectedConnector.lastSync },
                      { label: "Clients Using", value: String(selectedConnector.clientsUsing) },
                    ].map((item) => (
                      <div key={item.label} className="rounded-lg p-3"style={{ background: "var(--rtm-bg-secondary)", border: "1px solid var(--rtm-border-light)"}}>
                        <div className="text-xs font-semibold uppercase tracking-wide mb-0.5"style={{ color: "var(--rtm-text-muted)"}}>{item.label}</div>
                        <div className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide mb-2"style={{ color: "var(--rtm-text-muted)"}}>Services Using This Connector</div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedConnector.servicesUsing.length > 0 ? selectedConnector.servicesUsing.map((s) => (
                        <span key={s} className="text-xs font-semibold px-2 py-0.5 rounded-full"style={{ background: "#EFF6FF", color: "#1D4ED8"}}>{s}</span>
                      )) : <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>None configured</span>}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide mb-2"style={{ color: "var(--rtm-text-muted)"}}>Data Types Collected</div>
                    <div className="space-y-1">
                      {selectedConnector.dataTypes.map((d) => (
                        <div key={d} className="flex items-center gap-2 text-xs"style={{ color: "var(--rtm-text-secondary)"}}>
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"style={{ background: "#059669"}} />
                          {d}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap pt-2">
                    <button
                      disabled
                      className="text-xs font-semibold px-3 py-2 rounded-lg border opacity-40 cursor-not-allowed"
                      style={{ color: "#0F766E", background: "#0F766E15", borderColor: "#0F766E40" }}
                      title="Coming when OAuth is configured"
                    >Sync Now</button>
                    <button
                      disabled
                      className="text-xs font-semibold px-3 py-2 rounded-lg border opacity-40 cursor-not-allowed"
                      style={{ color: "#2563EB", background: "#2563EB15", borderColor: "#2563EB40" }}
                      title="Coming when OAuth is configured"
                    >Configure</button>
                    {selectedConnector.status === "Error" && (
                      <button
                        disabled
                        className="text-xs font-semibold px-3 py-2 rounded-lg border opacity-40 cursor-not-allowed"
                        style={{ color: "#DC2626", background: "#DC262615", borderColor: "#DC262640" }}
                        title="Coming when OAuth is configured"
                      >Troubleshoot</button>
                    )}
                  </div>
                </div>
              </SectionWrapper>
            </>
          ) : (
            <SectionWrapper title="Connector Summary"description="Overview by category">
              <div className="space-y-3">
                {(["Analytics", "Advertising", "CRM", "Call Tracking", "AI", "Custom API"] as ConnectorCategory[]).map((cat) => {
                  const catConnectors = connectors.filter((c) => c.category === cat);
                  const catConnected = catConnectors.filter((c) => c.status === "Connected").length;
                  const catStyle = categoryColors[cat];
                  return (
                    <div
                      key={cat}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"style={{ borderColor: "var(--rtm-border-light)", background: catStyle.bg }}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      <div>
                        <div className="text-sm font-semibold"style={{ color: catStyle.color }}>{cat}</div>
                        <div className="text-xs mt-0.5"style={{ color: catStyle.color }}>{catConnectors.length} connector{catConnectors.length !== 1 ? "s": ""}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold"style={{ color: catStyle.color }}>{catConnected}/{catConnectors.length}</div>
                        <div className="text-xs"style={{ color: catStyle.color }}>connected</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4"style={{ borderTop: "1px solid var(--rtm-border-light)"}}>
                <p className="text-xs text-center"style={{ color: "var(--rtm-text-muted)"}}>Select a connector to view details</p>
              </div>
            </SectionWrapper>
          )}

          {/* Workflow Impact Panel */}
          <SectionWrapper title="Workflow Integration"description="How connectors feed into reporting operations">
            <div className="space-y-2">
              {[
                { step: "Data Collection", sources: "GA4, Ads, GSC, GBP, Call Tracking", color: "#2563EB"},
                { step: "Call Intelligence", sources: "Call Tracking, AI (OpenAI)", color: "#7C3AED"},
                { step: "AI Classification", sources: "OpenAI, Call Tracking", color: "#0F766E"},
                { step: "Report Generation", sources: "All Connected Sources", color: "#D97706"},
                { step: "Client Delivery", sources: "CRM, Communication", color: "#059669"},
              ].map((item, i) => (
                <div key={item.step} className="flex items-start gap-3 py-2">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"style={{ background: item.color }}>{i + 1}</div>
                    {i < 4 && <div className="w-px h-4 mt-1"style={{ background: "var(--rtm-border-light)"}} />}
                  </div>
                  <div className="pt-0.5">
                    <div className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{item.step}</div>
                    <div className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{item.sources}</div>
                  </div>
                </div>
              ))}
            </div>
          </SectionWrapper>
        </div>
      </div>
    </div>
  );
}
