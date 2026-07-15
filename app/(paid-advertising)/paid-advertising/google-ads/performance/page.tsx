"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  KpiCard,
  SectionWrapper,
  StatusBadge,
  DataTable,
  QuickActions,
  ProgressBar,
  MiniSparkline,
} from "@/components/ui";
import type { Column, QuickAction } from "@/components/ui";
import PerformanceFilters, {
  DEFAULT_FILTERS,
  DATE_RANGE_LABELS,
} from "@/components/performance/PerformanceFilters";
import type { PerformanceFilterState } from "@/components/performance/PerformanceFilters";
import { getWorkspace } from "@/lib/workspaces";
import { useEnabledKpis } from "@/lib/hooks/useEnabledKpis";

const workspace = getWorkspace("paid-advertising")!;

//  Mock Data 

interface GoogleCampaignRow extends Record<string, unknown> {
  client: string;
  campaign: string;
  spend: number;
  leads: number;
  qualifiedLeads: number;
  calls: number;
  formSubmissions: number;
  bookedLeads: number;
  cpl: number;
  costPerQualified: number;
  ctr: number;
  cpc: number;
  searchImpressionShare: number;
  avgQualityScore: number;
  conversionTrackingHealth: string;
  status: string;
}

const allCampaigns: GoogleCampaignRow[] = [
  {
    client: "Apex Roofing Co.",
    campaign: "Storm Season — Search",
    spend: 1800,
    leads: 62,
    qualifiedLeads: 41,
    calls: 34,
    formSubmissions: 28,
    bookedLeads: 14,
    cpl: 29.03,
    costPerQualified: 43.90,
    ctr: 8.4,
    cpc: 3.46,
    searchImpressionShare: 72,
    avgQualityScore: 8,
    conversionTrackingHealth: "healthy",
    status: "active",
  },
  {
    client: "Harbor Auto Group",
    campaign: "Brand Search — Auto",
    spend: 2800,
    leads: 71,
    qualifiedLeads: 44,
    calls: 38,
    formSubmissions: 33,
    bookedLeads: 11,
    cpl: 39.44,
    costPerQualified: 63.64,
    ctr: 7.2,
    cpc: 4.82,
    searchImpressionShare: 58,
    avgQualityScore: 7,
    conversionTrackingHealth: "healthy",
    status: "active",
  },
  {
    client: "Pacific Dental",
    campaign: "New Patient — Search",
    spend: 1000,
    leads: 38,
    qualifiedLeads: 24,
    calls: 22,
    formSubmissions: 16,
    bookedLeads: 9,
    cpl: 26.32,
    costPerQualified: 41.67,
    ctr: 9.1,
    cpc: 3.18,
    searchImpressionShare: 81,
    avgQualityScore: 9,
    conversionTrackingHealth: "healthy",
    status: "active",
  },
  {
    client: "Summit Landscaping",
    campaign: "Landscaping Services",
    spend: 800,
    leads: 24,
    qualifiedLeads: 14,
    calls: 14,
    formSubmissions: 10,
    bookedLeads: 4,
    cpl: 33.33,
    costPerQualified: 57.14,
    ctr: 6.8,
    cpc: 3.94,
    searchImpressionShare: 44,
    avgQualityScore: 7,
    conversionTrackingHealth: "warning",
    status: "active",
  },
  {
    client: "Metro Dental",
    campaign: "Dental Implants Search",
    spend: 600,
    leads: 14,
    qualifiedLeads: 8,
    calls: 8,
    formSubmissions: 6,
    bookedLeads: 2,
    cpl: 42.86,
    costPerQualified: 75.00,
    ctr: 5.1,
    cpc: 5.62,
    searchImpressionShare: 31,
    avgQualityScore: 5,
    conversionTrackingHealth: "issue",
    status: "warning",
  },
];

const spendTrend = [5200, 5800, 5600, 6100, 6400, 6900, 6700, 7200, 7400, 7000, 7300, 7000];
const leadsTrend = [172, 188, 182, 198, 212, 226, 220, 241, 252, 238, 248, 209];

const quickActions: QuickAction[] = [
  { label: "Quality Score Audit",  description: "Improve Ad Rank",         icon: "", color: "bg-blue-100 text-blue-600"},
  { label: "Negative Keywords",    description: "Add negative keywords",    icon: "", color: "bg-red-100 text-red-600"},
  { label: "Bid Strategy Review",  description: "Smart bidding check",      icon: "", color: "bg-emerald-100 text-emerald-600"},
  { label: "Search Terms Report",  description: "Find new keywords",        icon: "", color: "bg-purple-100 text-purple-600"},
  { label: "Ad Copy Refresh",      description: "Update headlines/desc",    icon: "", color: "bg-amber-100 text-amber-600"},
  { label: "Google Report",        description: "Export client report",     icon: "", color: "bg-slate-100 text-slate-600"},
];

//  Columns 

const columns: Column<GoogleCampaignRow>[] = [
  { key: "client",   header: "Client"},
  { key: "campaign", header: "Campaign"},
  { key: "spend",    header: "Spend", width: "90px",
    render: (v) => <span className="font-semibold">${Number(v).toLocaleString()}</span> },
  { key: "leads",    header: "Leads", width: "70px",
    render: (v) => <span className="font-bold">{String(v)}</span> },
  { key: "qualifiedLeads", header: "Qualified", width: "90px",
    render: (v) => <span className="font-semibold text-blue-600">{String(v)}</span> },
  { key: "calls",    header: "Calls",  width: "65px"},
  { key: "formSubmissions", header: "Forms", width: "70px"},
  { key: "bookedLeads", header: "Booked", width: "75px",
    render: (v) => <span className="font-bold text-emerald-600">{String(v)}</span> },
  { key: "cpl",      header: "CPL",   width: "75px",
    render: (v) => {
      const n = Number(v);
      const color = n <= 32 ? "text-emerald-600": n <= 45 ? "text-amber-600": "text-red-500";
      return <span className={`font-semibold ${color}`}>${n.toFixed(2)}</span>;
    } },
  { key: "costPerQualified", header: "$/Qual. Lead", width: "100px",
    render: (v) => <span className="font-semibold">${Number(v).toFixed(2)}</span> },
  { key: "ctr", header: "CTR", width: "65px",
    render: (v) => <span>{Number(v).toFixed(1)}%</span> },
  { key: "cpc", header: "CPC", width: "65px",
    render: (v) => <span>${Number(v).toFixed(2)}</span> },
  { key: "searchImpressionShare", header: "Imp. Share", width: "100px",
    render: (v) => {
      const n = Number(v);
      const color = n >= 70 ? "bg-emerald-500": n >= 50 ? "bg-amber-500": "bg-red-400";
      return <ProgressBar value={n} max={100} height={5} color={color} showLabel />;
    } },
  { key: "avgQualityScore", header: "Qual. Score", width: "110px",
    render: (v) => {
      const n = Number(v);
      const color = n >= 8 ? "text-emerald-600": n >= 6 ? "text-amber-600": "text-red-500";
      return <span className={`font-bold text-sm ${color}`}>{n}/10</span>;
    } },
  { key: "conversionTrackingHealth", header: "Conv. Tracking", width: "130px",
    render: (v) => {
      const map: Record<string, { variant: "success"| "warning"| "info"; label: string }> = {
        healthy: { variant: "success", label: "Healthy"},
        warning: { variant: "warning", label: "Warning"},
        issue:   { variant: "warning", label: "Issue"},
      };
      const c = map[String(v)] ?? { variant: "warning"as const, label: String(v) };
      return <StatusBadge variant={c.variant} label={c.label} size="sm"/>;
    } },
  { key: "status", header: "Status", width: "90px",
    render: (v) => {
      const map: Record<string, { variant: "success"| "warning"| "info"; label: string }> = {
        active:  { variant: "success", label: "Active"},
        warning: { variant: "warning", label: "Warning"},
        paused:  { variant: "warning", label: "Paused"},
      };
      const c = map[String(v)] ?? { variant: "warning"as const, label: String(v) };
      return <StatusBadge variant={c.variant} label={c.label} size="sm"/>;
    } },
];

//  Funnel bar 

function FunnelBar({ label, value, max, color }: { label: string; value: number; max: number; color?: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline">
        <span className="text-xs font-medium"style={{ color: "var(--rtm-text-primary)"}}>{label}</span>
        <span className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>{value.toLocaleString()}</span>
      </div>
      <ProgressBar value={value} max={max} height={6} color={color} />
      <p className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>{pct}% of total leads</p>
    </div>
  );
}

//  Page 

export default function GoogleAdsPerformancePage() {
  const { isEnabled } = useEnabledKpis("paid-advertising");
  const [filters, setFilters] = useState<PerformanceFilterState>(DEFAULT_FILTERS);

  const filteredCampaigns = useMemo(() => {
    let rows = allCampaigns;
    if (filters.client !== "all") {
      const map: Record<string, string> = {
        "apex-roofing": "Apex Roofing Co.",
        "harbor-auto": "Harbor Auto Group",
        "pacific-dental": "Pacific Dental",
        "summit-landscaping": "Summit Landscaping",
        "metro-dental": "Metro Dental",
      };
      const name = map[filters.client];
      if (name) rows = rows.filter((r) => r.client === name);
    }
    if (filters.campaign !== "all") {
      const cmap: Record<string, string> = {
        "storm-season": "Storm Season — Search",
        "brand-search": "Brand Search — Auto",
        "new-patient": "New Patient — Search",
        "spring-services": "Landscaping Services",
      };
      const camp = cmap[filters.campaign];
      if (camp) rows = rows.filter((r) => r.campaign === camp);
    }
    return rows;
  }, [filters.client, filters.campaign]);

  const totals = useMemo(() => {
    const t = {
      spend: filteredCampaigns.reduce((s, r) => s + r.spend, 0),
      leads: filteredCampaigns.reduce((s, r) => s + r.leads, 0),
      qualified: filteredCampaigns.reduce((s, r) => s + r.qualifiedLeads, 0),
      calls: filteredCampaigns.reduce((s, r) => s + r.calls, 0),
      forms: filteredCampaigns.reduce((s, r) => s + r.formSubmissions, 0),
      booked: filteredCampaigns.reduce((s, r) => s + r.bookedLeads, 0),
    };
    return {
      ...t,
      cpl: t.leads > 0 ? t.spend / t.leads : 0,
      costPerQual: t.qualified > 0 ? t.spend / t.qualified : 0,
      avgCtr: filteredCampaigns.reduce((s, r) => s + r.ctr, 0) / (filteredCampaigns.length || 1),
      avgCpc: filteredCampaigns.reduce((s, r) => s + r.cpc, 0) / (filteredCampaigns.length || 1),
      avgImpShare: Math.round(
        filteredCampaigns.reduce((s, r) => s + r.searchImpressionShare, 0) / (filteredCampaigns.length || 1)
      ),
      avgQs: (
        filteredCampaigns.reduce((s, r) => s + r.avgQualityScore, 0) / (filteredCampaigns.length || 1)
      ).toFixed(1),
    };
  }, [filteredCampaigns]);

  // Conversion tracking health
  const convHealth = useMemo(() => ({
    healthy: filteredCampaigns.filter((c) => c.conversionTrackingHealth === "healthy").length,
    warning: filteredCampaigns.filter((c) => c.conversionTrackingHealth === "warning").length,
    issue: filteredCampaigns.filter((c) => c.conversionTrackingHealth === "issue").length,
  }), [filteredCampaigns]);

  const compLabel = filters.comparison !== "none"? filters.comparison === "previousYear"? "vs Previous Year": `vs Previous ${DATE_RANGE_LABELS[filters.dateRange]}`
    : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: workspace.accentColor }}>
            Paid Advertising
          </p>
          <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>
            Google Ads Performance
          </h1>
          <p className="text-sm mt-0.5 font-medium"style={{ color: "var(--rtm-text-secondary)"}}>
            {DATE_RANGE_LABELS[filters.dateRange]}
            {compLabel && (
              <span className="ml-2 text-xs font-normal"style={{ color: "var(--rtm-text-muted)"}}>
                {compLabel}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <Link href="/paid-advertising/google-ads" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">
            ← Google Dashboard
          </Link>
        </div>
      </div>

      {/* Filters */}
      <PerformanceFilters
        value={filters}
        onChange={setFilters}
        hideServiceFilter
      />

      {/* KPI Row 1: Spend + Leads */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {isEnabled("paid-total-spend") && <KpiCard
          title="Total Spend"value={`$${totals.spend.toLocaleString()}`}
          trend="up"trendValue="+6%"trendLabel={compLabel ?? "vs last period"}
          iconBg="#FEF2F2"iconColor="#DC2626"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        />}
        {isEnabled("paid-total-leads") && <KpiCard
          title="Leads"value={totals.leads.toString()}
          trend="up"trendValue="+13%"trendLabel={compLabel ?? "vs last period"}
          iconBg="#ECFDF5"iconColor="#059669"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>}
        />}
        {isEnabled("paid-qualified-leads") && <KpiCard
          title="Qualified Leads"value={totals.qualified.toString()}
          trend="up"trendValue="+10%"trendLabel={compLabel ?? "vs last period"}
          iconBg="var(--rtm-blue-light)"iconColor="var(--rtm-blue)"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        />}
      </div>

      {/* KPI Row 2: Conversions */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {isEnabled("paid-calls") && <KpiCard
          title="Calls"value={totals.calls.toString()}
          trend="up"trendValue="+9%"trendLabel={compLabel ?? "vs last period"}
          iconBg="#ECFDF5"iconColor="#059669"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>}
        />}
        {isEnabled("paid-form-submissions") && <KpiCard
          title="Form Submissions"value={totals.forms.toString()}
          trend="up"trendValue="+14%"trendLabel={compLabel ?? "vs last period"}
          iconBg="var(--rtm-blue-light)"iconColor="var(--rtm-blue)"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>}
        />}
        {isEnabled("paid-booked-leads") && <KpiCard
          title="Booked Leads"value={totals.booked.toString()}
          trend="up"trendValue="+18%"trendLabel={compLabel ?? "vs last period"}
          iconBg="#ECFDF5"iconColor="#059669"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>}
        />}
      </div>

      {/* KPI Row 3: Efficiency */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {isEnabled("paid-cpl") && <KpiCard
          title="Cost Per Lead (CPL)"value={`$${totals.cpl.toFixed(2)}`}
          trend={totals.cpl <= 35 ? "down": "up"}
          trendValue={totals.cpl <= 35 ? "-$2.80": "+$1.50"}
          trendLabel={compLabel ?? "vs last period"}
          iconBg="#FFFBEB"iconColor="#D97706"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>}
        />}
        {isEnabled("paid-cost-per-qualified") && <KpiCard
          title="Cost Per Qualified Lead"value={`$${totals.costPerQual.toFixed(2)}`}
          trend="down"trendValue="-$4.60"trendLabel={compLabel ?? "vs last period"}
          iconBg="#FFFBEB"iconColor="#D97706"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>}
        />}
        {isEnabled("paid-google-ctr") && <KpiCard
          title="Avg CTR"value={`${totals.avgCtr.toFixed(1)}%`}
          trend="up"trendValue="+0.6%"trendLabel={compLabel ?? "vs last period"}
          iconBg="var(--rtm-blue-light)"iconColor="var(--rtm-blue)"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"/></svg>}
        />}
      </div>

      {/* KPI Row 4: Search-specific */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {isEnabled("paid-google-cpc") && <KpiCard
          title="Avg CPC"value={`$${totals.avgCpc.toFixed(2)}`}
          trend="down"trendValue="-$0.38"trendLabel={compLabel ?? "vs last period"}
          iconBg="#F5F3FF"iconColor="#7C3AED"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>}
        />}
        {isEnabled("paid-google-impression-share") && <KpiCard
          title="Avg Search Impression Share"value={`${totals.avgImpShare}%`}
          trend={totals.avgImpShare >= 60 ? "up": "down"}
          trendValue={totals.avgImpShare >= 60 ? "+4%": "-3%"}
          trendLabel={compLabel ?? "vs last period"}
          iconBg="var(--rtm-blue-light)"iconColor="var(--rtm-blue)"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>}
        />}
        {isEnabled("paid-google-quality-score") && <KpiCard
          title="Avg Quality Score"value={`${totals.avgQs}/10`}
          trend={Number(totals.avgQs) >= 7 ? "up": "down"}
          trendValue={Number(totals.avgQs) >= 7 ? "+0.3 pts": "-0.4 pts"}
          trendLabel={compLabel ?? "vs last period"}
          iconBg="#ECFDF5"iconColor="#059669"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>}
        />}
      </div>

      {/* Charts + Conv Tracking Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionWrapper title="Spend Trend"description="Total Google Ads spend — last 12 months"className="lg:col-span-2">
          <MiniSparkline data={spendTrend}height={80} width={500} />
          <div className="mt-3 flex gap-2 text-xs"style={{ color: "var(--rtm-text-muted)"}}>
            {["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"].map((m) => (
              <span key={m} className="flex-1 text-center">{m}</span>
            ))}
          </div>
        </SectionWrapper>

        <SectionWrapper title="Conversion Tracking Health"description="Across all campaigns">
          <div className="space-y-4 py-1">
            <div className="flex items-center justify-between p-3 rounded-lg"style={{ background: "#ECFDF5", border: "1px solid #A7F3D0"}}>
              <div>
                <p className="text-sm font-bold text-emerald-700">Healthy</p>
                <p className="text-xs text-emerald-600">Tracking firing correctly</p>
              </div>
              <span className="text-2xl font-bold text-emerald-700">{convHealth.healthy}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg"style={{ background: "#FFFBEB", border: "1px solid #FDE68A"}}>
              <div>
                <p className="text-sm font-bold text-amber-700">Warning</p>
                <p className="text-xs text-amber-600">Partial tracking detected</p>
              </div>
              <span className="text-2xl font-bold text-amber-700">{convHealth.warning}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg"style={{ background: "#FEF2F2", border: "1px solid #FECACA"}}>
              <div>
                <p className="text-sm font-bold text-red-700">Issue</p>
                <p className="text-xs text-red-600">Tracking not recording</p>
              </div>
              <span className="text-2xl font-bold text-red-700">{convHealth.issue}</span>
            </div>
          </div>
        </SectionWrapper>
      </div>

      {/* Lead Funnel Summary */}
      <SectionWrapper title="Lead Funnel Summary"description={`${DATE_RANGE_LABELS[filters.dateRange]} — all filtered campaigns`}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <FunnelBar label="Leads"value={totals.leads}   max={totals.leads}/>
          <FunnelBar label="Calls"value={totals.calls}   max={totals.leads}/>
          <FunnelBar label="Form Submissions"value={totals.forms}   max={totals.leads}/>
          <FunnelBar label="Booked Leads"value={totals.booked}  max={totals.leads}/>
        </div>
      </SectionWrapper>

      {/* Search Performance + Lead Quality */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionWrapper title="Search Performance"description="Impression share and quality scores">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium"style={{ color: "var(--rtm-text-primary)"}}>Avg Search Impression Share</span>
                <span className="text-sm font-bold">{totals.avgImpShare}%</span>
              </div>
              <ProgressBar
                value={totals.avgImpShare}
                max={100}
                height={8}
                color={totals.avgImpShare >= 60 ? "bg-emerald-500": "bg-amber-500"}
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium"style={{ color: "var(--rtm-text-primary)"}}>Quality Score Distribution (Avg)</span>
                <span className="text-sm font-bold">{totals.avgQs}/10</span>
              </div>
              <ProgressBar
                value={Number(totals.avgQs) * 10}
                max={100}
                height={8}
                color={Number(totals.avgQs) >= 7 ? "bg-emerald-500": Number(totals.avgQs) >= 5 ? "bg-amber-500": "bg-red-400"}
              />
            </div>
          </div>
        </SectionWrapper>

        <SectionWrapper title="Lead Quality"description="Conversion rates through the funnel">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium"style={{ color: "var(--rtm-text-primary)"}}>Lead → Qualified Rate</span>
                <span className="text-sm font-bold">
                  {totals.leads > 0 ? Math.round((totals.qualified / totals.leads) * 100) : 0}%
                </span>
              </div>
              <ProgressBar
                value={totals.leads > 0 ? Math.round((totals.qualified / totals.leads) * 100) : 0}
                max={100}
                height={8}/>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium"style={{ color: "var(--rtm-text-primary)"}}>Qualified → Booked Rate</span>
                <span className="text-sm font-bold">
                  {totals.qualified > 0 ? Math.round((totals.booked / totals.qualified) * 100) : 0}%
                </span>
              </div>
              <ProgressBar
                value={totals.qualified > 0 ? Math.round((totals.booked / totals.qualified) * 100) : 0}
                max={100}
                height={8}/>
            </div>
          </div>
        </SectionWrapper>
      </div>

      {/* Leads Trend */}
      <SectionWrapper title="Leads Trend"description="Total Google Ads leads — last 12 months">
        <MiniSparkline data={leadsTrend}height={80} width={800} />
        <div className="mt-3 flex gap-2 text-xs"style={{ color: "var(--rtm-text-muted)"}}>
          {["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"].map((m) => (
            <span key={m} className="flex-1 text-center">{m}</span>
          ))}
        </div>
      </SectionWrapper>

      {/* Campaign Performance Table */}
      <SectionWrapper
        title="Campaign Performance"description={`${filteredCampaigns.length} campaign${filteredCampaigns.length !== 1 ? "s": ""} — ${DATE_RANGE_LABELS[filters.dateRange]}`}
        noPadding
        actions={
          <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>Mock data</span>
        }
      >
        <DataTable columns={columns} data={filteredCampaigns} />
      </SectionWrapper>

      {/* Quick Actions */}
      <SectionWrapper title="Quick Actions">
        <QuickActions actions={quickActions} cols={3} />
      </SectionWrapper>
    </div>
  );
}
