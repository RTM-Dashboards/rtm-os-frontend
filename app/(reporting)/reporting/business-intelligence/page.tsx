"use client";

import { useState } from "react";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { WorkspaceHeader } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("reporting")!;

// ── Types ─────────────────────────────────────────────────────────────────────
type InsightCategory = "Performance" | "Growth" | "Risk" | "Upsell" | "Renewal" | "Operational";

interface AIInsight {
  id: string;
  category: InsightCategory;
  title: string;
  summary: string;
  clients: string[];
  severity: "Critical" | "High" | "Medium" | "Low";
  recommendedAction: string;
  generatedDate: string;
}

interface ClientPerformanceTrend {
  client: string;
  am: string;
  health: "Healthy" | "Watch" | "At Risk";
  mrr: string;
  callQualityScore: number;
  reportDeliveryScore: number;
  renewalDate: string;
  renewalRisk: "Low" | "Medium" | "High";
  upsellOpportunity: string;
  trend: "up" | "down" | "neutral";
}

interface DeptPerformanceTrend {
  department: string;
  onTimeRate: string;
  inputCompletionRate: string;
  avgDelay: string;
  reportQuality: string;
  callVolume: number;
  trend: "up" | "down" | "neutral";
}

// ── Mock Intelligence Data ────────────────────────────────────────────────────
const aiInsights: AIInsight[] = [
  {
    id: "ins-001",
    category: "Risk",
    title: "Metro Dental at Renewal Risk",
    summary: "Metro Dental's contract renews in June 2025. Missed opportunity calls are up 32% this month, and the client has expressed frustration in two recent calls. Immediate intervention recommended before renewal window opens.",
    clients: ["Metro Dental"],
    severity: "Critical",
    recommendedAction: "Schedule AM escalation call with Metro Dental before Jun 15. Prepare renewal report and recovery plan.",
    generatedDate: "Jun 7, 2025",
  },
  {
    id: "ins-002",
    category: "Upsell",
    title: "BlueSky HVAC — LSA Expansion Opportunity",
    summary: "LSA call volume for BlueSky HVAC increased 41% month over month. Booking rate is 83%, above the portfolio average. Lead quality score is 92. This client is positioned for LSA budget expansion and additional service line activation.",
    clients: ["BlueSky HVAC"],
    severity: "High",
    recommendedAction: "Present LSA budget increase proposal and GBP activation package in next AM review call.",
    generatedDate: "Jun 7, 2025",
  },
  {
    id: "ins-003",
    category: "Growth",
    title: "LSA Outperforming All Service Lines",
    summary: "LSA is delivering the highest booking rate (80%), highest lead quality (89), and $261,000 in revenue opportunity across all service types. Clients on LSA are converting at 15% higher than PPC clients.",
    clients: ["Apex Roofing", "BlueSky HVAC", "Metro Dental"],
    severity: "Medium",
    recommendedAction: "Identify PPC-only clients who qualify for LSA and schedule upsell conversations.",
    generatedDate: "Jun 7, 2025",
  },
  {
    id: "ins-004",
    category: "Performance",
    title: "GBP and LSA Input Delays Impacting Report Delivery",
    summary: "GBP and LSA departments have the two lowest input completion rates (80% and 72%) and longest average report delays. These bottlenecks are directly impacting on-time delivery for 8 clients this cycle.",
    clients: ["Harbor Auto", "Metro Dental", "Summit Landscaping"],
    severity: "High",
    recommendedAction: "Establish automated data export reminders for GBP and LSA teams. Set escalation threshold at 24h past due.",
    generatedDate: "Jun 6, 2025",
  },
  {
    id: "ins-005",
    category: "Risk",
    title: "Summit Landscaping — Overdue Reporting Pattern",
    summary: "Summit Landscaping reporting has been overdue for 2 consecutive months. SEO department input delays are the primary cause. Client health is degrading due to reduced reporting visibility.",
    clients: ["Summit Landscaping"],
    severity: "High",
    recommendedAction: "Assign dedicated reporting owner for Summit Landscaping. Investigate SEO data export bottleneck.",
    generatedDate: "Jun 6, 2025",
  },
  {
    id: "ins-006",
    category: "Upsell",
    title: "Pacific Dental — Yelp Activation Signal",
    summary: "AI call analysis detected 6 incoming calls to Pacific Dental over the past 30 days where callers mentioned checking Yelp reviews before calling. Client is not on Yelp services. High conversion likelihood for Yelp activation.",
    clients: ["Pacific Dental"],
    severity: "Medium",
    recommendedAction: "Brief AM Chris L. on Yelp activation opportunity. Include Yelp ROI case study in QBR deck.",
    generatedDate: "Jun 5, 2025",
  },
  {
    id: "ins-007",
    category: "Growth",
    title: "Booking Rate Improving Across PPC Clients",
    summary: "PPC clients saw a collective 3% increase in booking rate month over month. Google Ads and Meta Ads campaigns are producing higher-intent leads. Call quality scores up 4 points average.",
    clients: ["Pacific Dental", "Prestige Auto", "Metro Dental"],
    severity: "Low",
    recommendedAction: "Highlight PPC booking rate improvement in monthly client reports and executive summary.",
    generatedDate: "Jun 5, 2025",
  },
  {
    id: "ins-008",
    category: "Renewal",
    title: "Prestige Auto Renewal Signal Detected",
    summary: "AI detected 3 incoming calls in the last 30 days where the Prestige Auto team asked about expanding services. Combined with strong Google Ads ROAS and a renewal date of Dec 2025, this account has a high probability of renewal and expansion.",
    clients: ["Prestige Auto"],
    severity: "Medium",
    recommendedAction: "AM Dana W. to initiate proactive renewal conversation and present GBP + LSA expansion proposal.",
    generatedDate: "Jun 4, 2025",
  },
  {
    id: "ins-009",
    category: "Operational",
    title: "AM Review Bottleneck — 3 Reports Waiting Over 48 Hours",
    summary: "Three reports have been waiting for AM review for over 48 hours. Client delivery dates are at risk for Pacific Dental, Apex Roofing, and Harbor Auto. AM workload may need redistribution.",
    clients: ["Pacific Dental", "Apex Roofing", "Harbor Auto"],
    severity: "High",
    recommendedAction: "Send priority AM reminder. Consider redistributing review load if unresolved in 24 hours.",
    generatedDate: "Jun 7, 2025",
  },
];

const clientTrends: ClientPerformanceTrend[] = [
  { client: "Apex Roofing",       am: "Sarah M.", health: "Healthy",  mrr: "$4,200",  callQualityScore: 88, reportDeliveryScore: 85, renewalDate: "Sep 2025", renewalRisk: "Low",    upsellOpportunity: "LSA Budget Increase", trend: "up" },
  { client: "Pacific Dental",     am: "Chris L.", health: "Watch",    mrr: "$6,800",  callQualityScore: 79, reportDeliveryScore: 80, renewalDate: "Jul 2025", renewalRisk: "Medium", upsellOpportunity: "Yelp Activation",     trend: "neutral" },
  { client: "Harbor Auto",        am: "Tom R.",   health: "Healthy",  mrr: "$3,500",  callQualityScore: 74, reportDeliveryScore: 72, renewalDate: "Oct 2025", renewalRisk: "Low",    upsellOpportunity: "None",                trend: "down" },
  { client: "BlueSky HVAC",       am: "Tom R.",   health: "Healthy",  mrr: "$4,600",  callQualityScore: 92, reportDeliveryScore: 91, renewalDate: "Nov 2025", renewalRisk: "Low",    upsellOpportunity: "GBP Activation",      trend: "up" },
  { client: "Metro Dental",       am: "Sarah M.", health: "At Risk",  mrr: "$5,100",  callQualityScore: 68, reportDeliveryScore: 65, renewalDate: "Jun 2025", renewalRisk: "High",   upsellOpportunity: "None",                trend: "down" },
  { client: "Summit Landscaping", am: "Dana W.",  health: "Watch",    mrr: "$2,800",  callQualityScore: 71, reportDeliveryScore: 60, renewalDate: "Aug 2025", renewalRisk: "Medium", upsellOpportunity: "Annual Plan",         trend: "down" },
  { client: "Prestige Auto",      am: "Dana W.",  health: "Healthy",  mrr: "$7,200",  callQualityScore: 83, reportDeliveryScore: 88, renewalDate: "Dec 2025", renewalRisk: "Low",    upsellOpportunity: "GBP + LSA Bundle",    trend: "up" },
  { client: "Skyline Roofing",    am: "Chris L.", health: "Healthy",  mrr: "$3,800",  callQualityScore: 91, reportDeliveryScore: 95, renewalDate: "Aug 2025", renewalRisk: "Low",    upsellOpportunity: "None",                trend: "up" },
  { client: "Urban Dental",       am: "Sarah M.", health: "Watch",    mrr: "$4,400",  callQualityScore: 75, reportDeliveryScore: 70, renewalDate: "Oct 2025", renewalRisk: "Medium", upsellOpportunity: "Smile Makeover Promo", trend: "neutral" },
  { client: "Coastal Plumbing",   am: "Chris L.", health: "Healthy",  mrr: "$3,200",  callQualityScore: 80, reportDeliveryScore: 90, renewalDate: "Jan 2026", renewalRisk: "Low",    upsellOpportunity: "None",                trend: "up" },
];

const deptTrends: DeptPerformanceTrend[] = [
  { department: "SEO",              onTimeRate: "92%", inputCompletionRate: "95%", avgDelay: "0.8d", reportQuality: "A", callVolume: 142, trend: "up" },
  { department: "Paid Advertising", onTimeRate: "90%", inputCompletionRate: "90%", avgDelay: "1.1d", reportQuality: "A", callVolume: 195, trend: "up" },
  { department: "GBP",              onTimeRate: "78%", inputCompletionRate: "80%", avgDelay: "2.1d", reportQuality: "B", callVolume: 88,  trend: "down" },
  { department: "Meta Ads",         onTimeRate: "88%", inputCompletionRate: "88%", avgDelay: "1.3d", reportQuality: "A", callVolume: 118, trend: "up" },
  { department: "Google Ads",       onTimeRate: "87%", inputCompletionRate: "85%", avgDelay: "1.4d", reportQuality: "A", callVolume: 195, trend: "neutral" },
  { department: "LSA",              onTimeRate: "71%", inputCompletionRate: "72%", avgDelay: "2.8d", reportQuality: "B", callVolume: 167, trend: "down" },
  { department: "Yelp",             onTimeRate: "83%", inputCompletionRate: "83%", avgDelay: "1.7d", reportQuality: "B", callVolume: 0,   trend: "neutral" },
  { department: "Content",          onTimeRate: "89%", inputCompletionRate: "87%", avgDelay: "1.2d", reportQuality: "A", callVolume: 0,   trend: "up" },
  { department: "Web Development",  onTimeRate: "94%", inputCompletionRate: "96%", avgDelay: "0.6d", reportQuality: "A+", callVolume: 42, trend: "up" },
];

const insightCategoryConfig: Record<InsightCategory, { bg: string; color: string }> = {
  Performance: { bg: "#EFF6FF", color: "#1D4ED8" },
  Growth:      { bg: "#ECFDF5", color: "#065F46" },
  Risk:        { bg: "#FEF2F2", color: "#B91C1C" },
  Upsell:      { bg: "#F5F3FF", color: "#6D28D9" },
  Renewal:     { bg: "#FFF7ED", color: "#C2410C" },
  Operational: { bg: "#F0F9FF", color: "#0369A1" },
};

const severityVariant: Record<string, "success" | "warning" | "error" | "info" | "pending" | "neutral"> = {
  Critical: "error",
  High:     "warning",
  Medium:   "info",
  Low:      "neutral",
};

const healthVariant: Record<string, "success" | "warning" | "error" | "info" | "pending" | "neutral"> = {
  Healthy:  "success",
  Watch:    "warning",
  "At Risk":"error",
};

const renewalRiskColor: Record<string, string> = {
  Low:    "#059669",
  Medium: "#D97706",
  High:   "#DC2626",
};

type ActiveSection = "insights" | "clients" | "departments" | "callTrends" | "revenue";

export default function BusinessIntelligencePage() {
  const [activeSection, setActiveSection] = useState<ActiveSection>("insights");
  const [filterCategory, setFilterCategory] = useState<InsightCategory | "All">("All");
  const [filterSeverity, setFilterSeverity] = useState<string>("All");
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);

  const filteredInsights = aiInsights.filter((i) => {
    if (filterCategory !== "All" && i.category !== filterCategory) return false;
    if (filterSeverity !== "All" && i.severity !== filterSeverity) return false;
    return true;
  });

  const kpis = {
    criticalInsights: aiInsights.filter((i) => i.severity === "Critical").length,
    renewalRisk: clientTrends.filter((c) => c.renewalRisk === "High" || c.renewalRisk === "Medium").length,
    upsellOpportunities: clientTrends.filter((c) => c.upsellOpportunity !== "None").length,
    atRiskClients: clientTrends.filter((c) => c.health === "At Risk").length,
    totalMRR: "$45,600",
    avgCallQuality: Math.round(clientTrends.reduce((s, c) => s + c.callQualityScore, 0) / clientTrends.length),
  };

  const tabs: { id: ActiveSection; label: string }[] = [
    { id: "insights", label: "AI Insights" },
    { id: "clients", label: "Client Performance" },
    { id: "departments", label: "Department Performance" },
    { id: "callTrends", label: "Call Trends" },
    { id: "revenue", label: "Revenue & Renewals" },
  ];

  return (
    <div className="space-y-6">
      <WorkspaceHeader
        workspace={workspace}
        subtitle="Agency-wide intelligence — AI-generated insights, client performance trends, renewal signals, upsell opportunities, and risk indicators."
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 xl:grid-cols-6 gap-4">
        <KpiCard title="Critical Insights" value={String(kpis.criticalInsights)} subtitle="Require immediate action" iconBg="#FEF2F2" iconColor="#DC2626" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
        <KpiCard title="Renewal Risk" value={String(kpis.renewalRisk)} subtitle="Medium + high risk" iconBg="#FFFBEB" iconColor="#D97706" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
        <KpiCard title="At Risk Clients" value={String(kpis.atRiskClients)} subtitle="Need immediate attention" iconBg="#FEF2F2" iconColor="#B91C1C" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
        <KpiCard title="Upsell Opportunities" value={String(kpis.upsellOpportunities)} subtitle="AI identified" iconBg="#F5F3FF" iconColor="#6D28D9" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
        <KpiCard title="Total MRR" value={kpis.totalMRR} subtitle="Active portfolio" iconBg="#ECFDF5" iconColor="#059669" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <KpiCard title="Avg Call Quality" value={`${kpis.avgCallQuality}/100`} subtitle="Portfolio average" iconBg="#EFF6FF" iconColor="#2563EB" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>} />
      </div>

      {/* Section Tabs */}
      <div className="border-b" style={{ borderColor: "var(--rtm-border-light)" }}>
        <nav className="-mb-px flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className="whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors"
              style={{
                borderColor: activeSection === tab.id ? "#0F766E" : "transparent",
                color: activeSection === tab.id ? "#0F766E" : "var(--rtm-text-muted)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── AI Insights ── */}
      {activeSection === "insights" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            {(["All", "Performance", "Growth", "Risk", "Upsell", "Renewal", "Operational"] as Array<InsightCategory | "All">).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all"
                style={{
                  borderColor: filterCategory === cat ? "#0F766E" : "var(--rtm-border-light)",
                  background: filterCategory === cat ? "#0F766E15" : "transparent",
                  color: filterCategory === cat ? "#0F766E" : "var(--rtm-text-secondary)",
                }}
              >
                {cat}
              </button>
            ))}
            <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} className="ml-auto rounded-lg px-2 py-1.5 text-xs border outline-none" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg-secondary)" }}>
              {["All", "Critical", "High", "Medium", "Low"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Insights List */}
            <div className="xl:col-span-2 space-y-3">
              {filteredInsights.map((insight) => {
                const catStyle = insightCategoryConfig[insight.category];
                return (
                  <div
                    key={insight.id}
                    onClick={() => setSelectedInsight(insight)}
                    className="rounded-xl border p-4 cursor-pointer hover:shadow-sm transition-all"
                    style={{
                      borderColor: selectedInsight?.id === insight.id ? "#0F766E" : "var(--rtm-border-light)",
                      background: selectedInsight?.id === insight.id ? "#0F766E08" : "var(--rtm-surface)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: catStyle.bg, color: catStyle.color }}>{insight.category}</span>
                          <StatusBadge variant={severityVariant[insight.severity]} label={insight.severity} size="sm" />
                          <span className="text-xs ml-auto" style={{ color: "var(--rtm-text-muted)" }}>{insight.generatedDate}</span>
                        </div>
                        <div className="font-bold text-sm mb-1" style={{ color: "var(--rtm-text-primary)" }}>{insight.title}</div>
                        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--rtm-text-secondary)" }}>{insight.summary}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {insight.clients.map((c) => (
                            <span key={c} className="text-xs px-1.5 py-0.5 rounded" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>{c}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Insight Detail */}
            <div>
              {selectedInsight ? (
                <SectionWrapper title="Insight Detail" description={selectedInsight.category}>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-sm" style={{ color: "var(--rtm-text-primary)" }}>{selectedInsight.title}</div>
                        <div className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{selectedInsight.generatedDate}</div>
                      </div>
                      <button onClick={() => setSelectedInsight(null)} className="text-sm px-1.5" style={{ color: "var(--rtm-text-muted)" }}>✕</button>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: insightCategoryConfig[selectedInsight.category].bg, color: insightCategoryConfig[selectedInsight.category].color }}>{selectedInsight.category}</span>
                      <StatusBadge variant={severityVariant[selectedInsight.severity]} label={selectedInsight.severity} size="sm" />
                    </div>

                    <div className="rounded-lg p-3" style={{ background: "#ECFEFF", border: "1px solid #A5F3FC" }}>
                      <div className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "#0E7490" }}>AI Analysis</div>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--rtm-text-primary)" }}>{selectedInsight.summary}</p>
                    </div>

                    <div className="rounded-lg p-3" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                      <div className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "#065F46" }}>Recommended Action</div>
                      <p className="text-xs leading-relaxed" style={{ color: "#064E3B" }}>{selectedInsight.recommendedAction}</p>
                    </div>

                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--rtm-text-muted)" }}>Affected Clients</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedInsight.clients.map((c) => (
                          <span key={c} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>{c}</span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <button className="text-xs font-semibold px-3 py-2 rounded-lg border" style={{ color: "#0F766E", background: "#0F766E15", borderColor: "#0F766E40" }}>Take Action</button>
                      <button className="text-xs font-semibold px-3 py-2 rounded-lg border" style={{ color: "#7C3AED", background: "#7C3AED15", borderColor: "#7C3AED40" }}>Add to Report</button>
                    </div>
                  </div>
                </SectionWrapper>
              ) : (
                <SectionWrapper title="Insight Detail" description="Select an insight for full analysis">
                  <div className="py-8 text-center">
                    <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>Select an insight to view full AI analysis and recommended actions.</p>
                  </div>
                </SectionWrapper>
              )}

              {/* Insight Summary */}
              <div className="mt-4">
                <SectionWrapper title="Insight Summary" description="By category">
                  <div className="space-y-2">
                    {(["Risk", "Growth", "Upsell", "Renewal", "Performance", "Operational"] as InsightCategory[]).map((cat) => {
                      const count = aiInsights.filter((i) => i.category === cat).length;
                      const catStyle = insightCategoryConfig[cat];
                      return (
                        <div key={cat} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: catStyle.bg }}>
                          <span className="text-xs font-semibold" style={{ color: catStyle.color }}>{cat}</span>
                          <span className="text-sm font-bold" style={{ color: catStyle.color }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </SectionWrapper>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Client Performance ── */}
      {activeSection === "clients" && (
        <SectionWrapper title="Client Performance Trends" description="Health, call quality, report delivery, renewal risk, and upsell opportunities per client">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1100px]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                  {["Client", "AM", "Health", "MRR", "Call Quality", "Report Delivery", "Renewal Date", "Renewal Risk", "Upsell Opportunity", "Trend"].map((h) => (
                    <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clientTrends.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors" style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                    <td className="py-2.5 px-3 font-semibold whitespace-nowrap" style={{ color: "var(--rtm-text-primary)" }}>{row.client}</td>
                    <td className="py-2.5 px-3 text-xs whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{row.am}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap"><StatusBadge variant={healthVariant[row.health]} label={row.health} size="sm" /></td>
                    <td className="py-2.5 px-3 font-bold whitespace-nowrap" style={{ color: "#059669" }}>{row.mrr}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 rounded-full flex-1 max-w-[48px]" style={{ background: "var(--rtm-border-light)" }}>
                          <div className="h-full rounded-full" style={{ width: `${row.callQualityScore}%`, background: row.callQualityScore >= 80 ? "#059669" : row.callQualityScore >= 65 ? "#D97706" : "#DC2626" }} />
                        </div>
                        <span className="text-xs font-bold" style={{ color: row.callQualityScore >= 80 ? "#059669" : row.callQualityScore >= 65 ? "#D97706" : "#DC2626" }}>{row.callQualityScore}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 rounded-full flex-1 max-w-[48px]" style={{ background: "var(--rtm-border-light)" }}>
                          <div className="h-full rounded-full" style={{ width: `${row.reportDeliveryScore}%`, background: row.reportDeliveryScore >= 80 ? "#059669" : row.reportDeliveryScore >= 65 ? "#D97706" : "#DC2626" }} />
                        </div>
                        <span className="text-xs font-bold" style={{ color: row.reportDeliveryScore >= 80 ? "#059669" : row.reportDeliveryScore >= 65 ? "#D97706" : "#DC2626" }}>{row.reportDeliveryScore}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-xs whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{row.renewalDate}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-xs font-bold" style={{ color: renewalRiskColor[row.renewalRisk] }}>{row.renewalRisk}</span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {row.upsellOpportunity !== "None" ? (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#F5F3FF", color: "#6D28D9" }}>{row.upsellOpportunity}</span>
                      ) : (
                        <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-base font-bold" style={{ color: row.trend === "up" ? "#059669" : row.trend === "down" ? "#DC2626" : "#D97706" }}>
                        {row.trend === "up" ? "↑" : row.trend === "down" ? "↓" : "→"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionWrapper>
      )}

      {/* ── Department Performance ── */}
      {activeSection === "departments" && (
        <SectionWrapper title="Department Performance Trends" description="On-time delivery, input completion, delays, and report quality by department">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                  {["Department", "On-Time Rate", "Input Completion", "Avg Delay", "Report Quality", "Call Volume", "Trend"].map((h) => (
                    <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deptTrends.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors" style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                    <td className="py-2.5 px-3 font-semibold whitespace-nowrap" style={{ color: "var(--rtm-text-primary)" }}>{row.department}</td>
                    <td className="py-2.5 px-3 font-bold" style={{ color: parseInt(row.onTimeRate) >= 90 ? "#059669" : parseInt(row.onTimeRate) >= 80 ? "#D97706" : "#DC2626" }}>{row.onTimeRate}</td>
                    <td className="py-2.5 px-3 font-bold" style={{ color: parseInt(row.inputCompletionRate) >= 90 ? "#059669" : parseInt(row.inputCompletionRate) >= 80 ? "#D97706" : "#DC2626" }}>{row.inputCompletionRate}</td>
                    <td className="py-2.5 px-3" style={{ color: parseFloat(row.avgDelay) <= 1 ? "#059669" : parseFloat(row.avgDelay) <= 2 ? "#D97706" : "#DC2626" }}>{row.avgDelay}</td>
                    <td className="py-2.5 px-3 font-bold text-center">
                      <span className="px-2 py-0.5 rounded text-xs" style={{ background: row.reportQuality === "A+" || row.reportQuality === "A" ? "#ECFDF5" : "#FFFBEB", color: row.reportQuality === "A+" || row.reportQuality === "A" ? "#059669" : "#D97706" }}>
                        {row.reportQuality}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center" style={{ color: "var(--rtm-text-secondary)" }}>{row.callVolume > 0 ? row.callVolume : "—"}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-base font-bold" style={{ color: row.trend === "up" ? "#059669" : row.trend === "down" ? "#DC2626" : "#D97706" }}>
                        {row.trend === "up" ? "↑" : row.trend === "down" ? "↓" : "→"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionWrapper>
      )}

      {/* ── Call Trends ── */}
      {activeSection === "callTrends" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label: "Total Calls This Month",     value: "839",   trend: "+12%",  color: "#1D4ED8", bg: "#EFF6FF" },
              { label: "Booked Leads",               value: "242",   trend: "+8%",   color: "#065F46", bg: "#D1FAE5" },
              { label: "Overall Booking Rate",       value: "29%",   trend: "+2%",   color: "#059669", bg: "#ECFDF5" },
              { label: "Missed Opportunities",       value: "47",    trend: "-3%",   color: "#DC2626", bg: "#FEF2F2" },
              { label: "Avg Lead Quality Score",     value: "81/100",trend: "+4pts", color: "#7C3AED", bg: "#F5F3FF" },
              { label: "Spam / Wrong Number Rate",   value: "11%",   trend: "-1%",   color: "#64748B", bg: "#F8FAFC" },
              { label: "Follow-Up Required",         value: "38",    trend: "-5",    color: "#D97706", bg: "#FFFBEB" },
              { label: "Upsell Signals Detected",    value: "22",    trend: "+7",    color: "#6D28D9", bg: "#F5F3FF" },
            ].map((card) => (
              <div key={card.label} className="rounded-xl border p-4" style={{ background: card.bg, borderColor: `${card.color}30` }}>
                <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: card.color }}>{card.label}</div>
                <div className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</div>
                <div className="text-xs mt-0.5 font-semibold" style={{ color: card.color }}>{card.trend} MoM</div>
              </div>
            ))}
          </div>

          <SectionWrapper title="Call Performance by Lead Source" description="Volume, qualification, and booking rates across all lead sources">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                    {["Lead Source", "Total Calls", "Qualified Leads", "Booked Leads", "Booking %", "Avg Quality Score", "Top Issue"].map((h) => (
                      <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { source: "Google LSA",            total: 167, qualified: 130, booked: 104, pct: 80, quality: 89, issue: "None" },
                    { source: "Google Ads",            total: 195, qualified: 141, booked: 98,  pct: 69, quality: 82, issue: "None" },
                    { source: "Meta Ads",              total: 118, qualified: 79,  booked: 51,  pct: 65, quality: 77, issue: "Follow-up failures" },
                    { source: "Organic Search (SEO)",  total: 142, qualified: 98,  booked: 67,  pct: 68, quality: 80, issue: "None" },
                    { source: "Google Business Profile",total: 88, qualified: 55,  booked: 38,  pct: 69, quality: 74, issue: "Input delays" },
                    { source: "Direct",                total: 89,  qualified: 51,  booked: 32,  pct: 63, quality: 71, issue: "High spam rate" },
                    { source: "Yelp Ads",              total: 40,  qualified: 26,  booked: 16,  pct: 62, quality: 70, issue: "Low volume" },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors" style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                      <td className="py-2.5 px-3 font-semibold whitespace-nowrap" style={{ color: "var(--rtm-text-primary)" }}>{row.source}</td>
                      <td className="py-2.5 px-3 text-center" style={{ color: "var(--rtm-text-secondary)" }}>{row.total}</td>
                      <td className="py-2.5 px-3 text-center font-semibold" style={{ color: "#059669" }}>{row.qualified}</td>
                      <td className="py-2.5 px-3 text-center font-bold" style={{ color: "#065F46" }}>{row.booked}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="font-bold" style={{ color: row.pct >= 75 ? "#059669" : row.pct >= 65 ? "#D97706" : "#DC2626" }}>{row.pct}%</span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="font-bold" style={{ color: row.quality >= 80 ? "#059669" : row.quality >= 70 ? "#D97706" : "#DC2626" }}>{row.quality}</span>
                      </td>
                      <td className="py-2.5 px-3 text-xs" style={{ color: row.issue !== "None" ? "#DC2626" : "var(--rtm-text-muted)" }}>{row.issue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionWrapper>
        </div>
      )}

      {/* ── Revenue & Renewals ── */}
      {activeSection === "revenue" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label: "Total MRR",                  value: "$45,600", trend: "+$2,100 MoM", color: "#059669", bg: "#ECFDF5" },
              { label: "Clients Renewing This Month", value: "1",      trend: "Jun 2025",    color: "#DC2626", bg: "#FEF2F2" },
              { label: "Renewals Next 90 Days",       value: "4",      trend: "Jul–Sep 2025",color: "#D97706", bg: "#FFFBEB" },
              { label: "Total Upsell Pipeline",       value: "$18,200", trend: "AI estimated",color: "#6D28D9", bg: "#F5F3FF" },
            ].map((card) => (
              <div key={card.label} className="rounded-xl border p-4" style={{ background: card.bg, borderColor: `${card.color}30` }}>
                <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: card.color }}>{card.label}</div>
                <div className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</div>
                <div className="text-xs mt-0.5 font-semibold" style={{ color: card.color }}>{card.trend}</div>
              </div>
            ))}
          </div>

          <SectionWrapper title="Renewal Pipeline" description="Upcoming renewals with risk level and recommended actions">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                    {["Client", "AM", "Renewal Date", "MRR", "Health", "Renewal Risk", "Upsell Opportunity", "Recommended Action"].map((h) => (
                      <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clientTrends.sort((a, b) => {
                    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    return months.indexOf(a.renewalDate.split(" ")[0]) - months.indexOf(b.renewalDate.split(" ")[0]);
                  }).map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors" style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                      <td className="py-2.5 px-3 font-semibold whitespace-nowrap" style={{ color: "var(--rtm-text-primary)" }}>{row.client}</td>
                      <td className="py-2.5 px-3 text-xs whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{row.am}</td>
                      <td className="py-2.5 px-3 font-medium whitespace-nowrap" style={{ color: row.renewalRisk === "High" ? "#DC2626" : "var(--rtm-text-secondary)" }}>{row.renewalDate}</td>
                      <td className="py-2.5 px-3 font-bold" style={{ color: "#059669" }}>{row.mrr}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap"><StatusBadge variant={healthVariant[row.health]} label={row.health} size="sm" /></td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="text-xs font-bold" style={{ color: renewalRiskColor[row.renewalRisk] }}>{row.renewalRisk} Risk</span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {row.upsellOpportunity !== "None" ? (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#F5F3FF", color: "#6D28D9" }}>{row.upsellOpportunity}</span>
                        ) : <span style={{ color: "var(--rtm-text-muted)" }}>—</span>}
                      </td>
                      <td className="py-2.5 px-3 text-xs font-medium" style={{ color: "var(--rtm-blue)" }}>
                        {row.renewalRisk === "High" ? "Immediate AM escalation" : row.renewalRisk === "Medium" ? "Proactive renewal call" : "Renewal confirmation"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionWrapper>
        </div>
      )}
    </div>
  );
}
