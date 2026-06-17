"use client";

import { useState } from "react";

type TemplateCategory = "SEO" | "PPC" | "Meta Ads" | "LSA" | "GBP" | "Yelp" | "Full Service" | "Executive" | "Project" | "QBR";
type TemplateStatus = "Active" | "Deprecated" | "Draft";

interface ReportTemplate {
  id: string;
  name: string;
  version: string;
  category: TemplateCategory;
  status: TemplateStatus;
  sections: string[];
  dataConnections: string[];
  owner: string;
  lastUpdated: string;
  usageCount: number;
  description: string;
}

const CAT_CFG: Record<TemplateCategory, { bg: string; color: string }> = {
  SEO:          { bg: "#EFF6FF", color: "#1D4ED8" },
  PPC:          { bg: "#FEF3C7", color: "#D97706" },
  "Meta Ads":   { bg: "#FEF2F2", color: "#DC2626" },
  LSA:          { bg: "#FAF5FF", color: "#7C3AED" },
  GBP:          { bg: "#ECFDF5", color: "#059669" },
  Yelp:         { bg: "#FFF7ED", color: "#C2410C" },
  "Full Service": { bg: "#ECFEFF", color: "#0E7490" },
  Executive:    { bg: "#F0FDF4", color: "#166534" },
  Project:      { bg: "#F8FAFC", color: "#475569" },
  QBR:          { bg: "#FDF4FF", color: "#7E22CE" },
};

const STATUS_CFG: Record<TemplateStatus, { bg: string; color: string; border: string }> = {
  Active:     { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" },
  Deprecated: { bg: "#FEF2F2", color: "#9CA3AF", border: "#FECACA" },
  Draft:      { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" },
};

const TEMPLATES: ReportTemplate[] = [
  {
    id: "tmpl-001",
    name: "RTM Monthly SEO Report",
    version: "v3.2",
    category: "SEO",
    status: "Active",
    sections: ["Executive Summary", "Organic Traffic", "Keyword Rankings", "Technical Audit Snapshot", "Backlinks", "Local SEO", "Next Month Actions"],
    dataConnections: ["GA4", "GSC", "AgencyAnalytics", "SEMrush"],
    owner: "Aaron Park",
    lastUpdated: "2025-07-01",
    usageCount: 48,
    description: "Standard monthly SEO performance report delivered to all SEO retainer clients.",
  },
  {
    id: "tmpl-002",
    name: "RTM Monthly PPC Report — Google Ads",
    version: "v2.1",
    category: "PPC",
    status: "Active",
    sections: ["Executive Summary", "Campaign Performance", "Ad Group Breakdown", "Keyword Performance", "Quality Score", "Budget Utilization", "Next Month Strategy"],
    dataConnections: ["Google Ads API", "GA4", "AgencyAnalytics"],
    owner: "Ryan Torres",
    lastUpdated: "2025-06-15",
    usageCount: 32,
    description: "Monthly Google Ads performance report covering all active campaigns and spend.",
  },
  {
    id: "tmpl-003",
    name: "RTM Monthly Meta Ads Report",
    version: "v1.4",
    category: "Meta Ads",
    status: "Active",
    sections: ["Executive Summary", "Campaign Overview", "Audience Insights", "Creative Performance", "ROAS Analysis", "Budget & Spend", "Recommendations"],
    dataConnections: ["Meta Business API", "GA4"],
    owner: "Lily Chen",
    lastUpdated: "2025-07-05",
    usageCount: 22,
    description: "Monthly Meta Ads performance report for Facebook and Instagram campaigns.",
  },
  {
    id: "tmpl-004",
    name: "RTM Quarterly Business Review (QBR)",
    version: "v5.0",
    category: "QBR",
    status: "Active",
    sections: ["Quarter Recap", "KPI Achievement", "Revenue Impact", "Project Status", "Upcoming Goals", "Upsell Opportunities", "Client Health Score"],
    dataConnections: ["Internal DB", "AgencyAnalytics", "GA4", "Google Ads API"],
    owner: "Priya Nair",
    lastUpdated: "2025-07-01",
    usageCount: 18,
    description: "Comprehensive quarterly review for all retained clients covering performance and strategy.",
  },
  {
    id: "tmpl-005",
    name: "RTM Monthly GBP Report",
    version: "v2.0",
    category: "GBP",
    status: "Active",
    sections: ["Profile Performance", "Review Summary", "Post Engagement", "Direction Requests", "Call Tracking", "Competitor Analysis"],
    dataConnections: ["GBP API", "AgencyAnalytics"],
    owner: "Daniel Okonkwo",
    lastUpdated: "2025-06-20",
    usageCount: 24,
    description: "Monthly Google Business Profile performance report for local clients.",
  },
  {
    id: "tmpl-006",
    name: "RTM Executive Portfolio Summary",
    version: "v3.0",
    category: "Executive",
    status: "Active",
    sections: ["Portfolio Health", "Revenue Snapshot", "Client Risk Overview", "Department Performance", "Open Blockers", "Next Week Actions"],
    dataConnections: ["Internal DB"],
    owner: "Marcus Webb",
    lastUpdated: "2025-07-15",
    usageCount: 52,
    description: "Weekly executive summary report for agency leadership covering portfolio health and risk.",
  },
  {
    id: "tmpl-007",
    name: "RTM Project Completion Summary",
    version: "v1.1",
    category: "Project",
    status: "Active",
    sections: ["Project Overview", "Milestones Achieved", "Deliverables Completed", "Client Feedback", "Lessons Learned", "Next Project Recommendation"],
    dataConnections: ["Internal DB"],
    owner: "Priya Nair",
    lastUpdated: "2025-07-10",
    usageCount: 14,
    description: "End-of-project summary report delivered to client upon project completion.",
  },
  {
    id: "tmpl-008",
    name: "RTM Legacy SEO Report v1",
    version: "v1.0",
    category: "SEO",
    status: "Deprecated",
    sections: ["Traffic Summary", "Rankings"],
    dataConnections: ["GA4"],
    owner: "Aaron Park",
    lastUpdated: "2024-01-01",
    usageCount: 120,
    description: "Legacy SEO report format. Deprecated in favor of v3.2.",
  },
  {
    id: "tmpl-009",
    name: "RTM Full-Service Monthly Report",
    version: "v1.0",
    category: "Full Service",
    status: "Draft",
    sections: ["Executive Summary", "SEO Section", "PPC Section", "Meta Ads Section", "LSA Section", "GBP Section", "Overall Health", "Next Month Plan"],
    dataConnections: ["GA4", "Google Ads API", "Meta Business API", "GBP API"],
    owner: "Lily Chen",
    lastUpdated: "2025-07-20",
    usageCount: 0,
    description: "Consolidated monthly report for full-service clients covering all service lines.",
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

export default function ReportTemplatesPage() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<TemplateCategory | "All">("All");
  const [statusFilter, setStatusFilter] = useState<TemplateStatus | "All">("All");

  const filtered = TEMPLATES.filter(t => {
    if (catFilter !== "All" && t.category !== catFilter) return false;
    if (statusFilter !== "All" && t.status !== statusFilter) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const kpis = {
    total: TEMPLATES.length,
    active: TEMPLATES.filter(t => t.status === "Active").length,
    draft: TEMPLATES.filter(t => t.status === "Draft").length,
    totalUses: TEMPLATES.reduce((s, t) => s + t.usageCount, 0),
  };

  const CATEGORIES: (TemplateCategory | "All")[] = ["All", "SEO", "PPC", "Meta Ads", "LSA", "GBP", "Yelp", "Full Service", "Executive", "Project", "QBR"];

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--rtm-bg)" }}>
      <div className="px-6 pt-6 pb-4" style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">📋</span>
                <h1 className="text-2xl font-black" style={{ color: "var(--rtm-text-primary)" }}>Report Templates</h1>
              </div>
              <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
                Manage and version all report templates used across clients, departments, and services.
              </p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white shadow-sm" style={{ background: "var(--rtm-blue)" }}>
                + New Template
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-5 max-w-[1400px] mx-auto w-full">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Templates" value={kpis.total} icon="📋" color="var(--rtm-blue)" />
          <KpiCard label="Active" value={kpis.active} icon="✅" color="#059669" />
          <KpiCard label="Draft" value={kpis.draft} icon="📝" color="#D97706" />
          <KpiCard label="Total Uses" value={kpis.totalUses} icon="🔢" color="#7C3AED" />
        </div>

        <div className="flex flex-wrap gap-3 items-center p-4 rounded-xl mb-4" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
          <div className="flex-1 min-w-[200px] relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--rtm-text-muted)" }}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates..." className="w-full pl-9 pr-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }} />
          </div>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value as TemplateCategory | "All")} className="rounded-lg px-2 py-1.5 text-xs border outline-none" style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as TemplateStatus | "All")} className="rounded-lg px-2 py-1.5 text-xs border outline-none" style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}>
            {(["All", "Active", "Draft", "Deprecated"] as (TemplateStatus | "All")[]).map(s => <option key={s}>{s}</option>)}
          </select>
          <span className="text-xs font-semibold ml-auto" style={{ color: "var(--rtm-text-muted)" }}>{filtered.length} templates</span>
        </div>

        <div className="flex flex-col gap-3">
          {filtered.map(tmpl => {
            const catCfg = CAT_CFG[tmpl.category];
            const statusCfg = STATUS_CFG[tmpl.status];
            return (
              <div key={tmpl.id} className="rounded-xl p-5" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-bold" style={{ background: catCfg.bg, color: catCfg.color }}>{tmpl.category}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold border" style={{ background: statusCfg.bg, color: statusCfg.color, borderColor: statusCfg.border }}>{tmpl.status}</span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded font-mono font-semibold" style={{ background: "#F8FAFC", color: "#64748B" }}>{tmpl.version}</span>
                    </div>
                    <h3 className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>{tmpl.name}</h3>
                    <p className="text-xs mt-1" style={{ color: "var(--rtm-text-secondary)" }}>{tmpl.description}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: "var(--rtm-blue)" }}>Edit</button>
                    <button className="px-3 py-1.5 rounded-lg text-xs font-semibold border" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>Preview</button>
                    <button className="px-3 py-1.5 rounded-lg text-xs font-semibold border" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>Duplicate</button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--rtm-text-muted)" }}>Sections ({tmpl.sections.length})</div>
                    <div className="flex flex-wrap gap-1">
                      {tmpl.sections.map(s => (
                        <span key={s} className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: "#F8FAFC", color: "#475569", border: "1px solid #E2E8F0" }}>{s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--rtm-text-muted)" }}>Data Connections</div>
                    <div className="flex flex-wrap gap-1">
                      {tmpl.dataConnections.map(c => (
                        <span key={c} className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: "#ECFEFF", color: "#0E7490" }}>{c}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                  <span>Owner: <b>{tmpl.owner}</b></span>
                  <span>Last updated: <b>{tmpl.lastUpdated}</b></span>
                  <span>Used <b>{tmpl.usageCount}</b> times</span>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-16" style={{ color: "var(--rtm-text-muted)" }}>
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-sm font-medium">No templates match your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
