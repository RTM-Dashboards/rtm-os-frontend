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

const workspace = getWorkspace("paid-advertising")!;

// ── Mock Data ────────────────────────────────────────────────────────────────

interface MetaCampaignRow extends Record<string, unknown> {
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
  cpm: number;
  frequency: number;
  creativeFatigue: string;
  campaignHealth: string;
  status: string;
}

const allCampaigns: MetaCampaignRow[] = [
  {
    client: "Harbor Auto Group",
    campaign: "Summer Sale — Traffic",
    spend: 3200,
    leads: 124,
    qualifiedLeads: 72,
    calls: 48,
    formSubmissions: 76,
    bookedLeads: 19,
    cpl: 25.81,
    costPerQualified: 44.44,
    ctr: 3.8,
    cpm: 14.20,
    frequency: 2.1,
    creativeFatigue: "low",
    campaignHealth: "excellent",
    status: "active",
  },
  {
    client: "Apex Roofing Co.",
    campaign: "Storm Season Lead Gen",
    spend: 1800,
    leads: 89,
    qualifiedLeads: 54,
    calls: 37,
    formSubmissions: 52,
    bookedLeads: 14,
    cpl: 20.22,
    costPerQualified: 33.33,
    ctr: 4.2,
    cpm: 11.80,
    frequency: 1.8,
    creativeFatigue: "low",
    campaignHealth: "excellent",
    status: "active",
  },
  {
    client: "Sunbelt HVAC",
    campaign: "Brand Awareness Q2",
    spend: 900,
    leads: 31,
    qualifiedLeads: 16,
    calls: 12,
    formSubmissions: 19,
    bookedLeads: 4,
    cpl: 29.03,
    costPerQualified: 56.25,
    ctr: 1.9,
    cpm: 18.40,
    frequency: 3.4,
    creativeFatigue: "high",
    campaignHealth: "needs-attention",
    status: "paused",
  },
  {
    client: "Metro Dental",
    campaign: "New Patient Promo (Meta)",
    spend: 1200,
    leads: 42,
    qualifiedLeads: 26,
    calls: 18,
    formSubmissions: 24,
    bookedLeads: 8,
    cpl: 28.57,
    costPerQualified: 46.15,
    ctr: 3.1,
    cpm: 16.80,
    frequency: 2.6,
    creativeFatigue: "medium",
    campaignHealth: "good",
    status: "active",
  },
  {
    client: "Summit Landscaping",
    campaign: "Spring Services",
    spend: 650,
    leads: 22,
    qualifiedLeads: 13,
    calls: 9,
    formSubmissions: 13,
    bookedLeads: 3,
    cpl: 29.55,
    costPerQualified: 50.00,
    ctr: 2.7,
    cpm: 17.20,
    frequency: 2.2,
    creativeFatigue: "medium",
    campaignHealth: "good",
    status: "active",
  },
];

const spendTrend = [5800, 6200, 5900, 6400, 6800, 7200, 7100, 7400, 7600, 7200, 7500, 7750];
const leadsTrend = [248, 271, 258, 284, 301, 318, 312, 334, 348, 328, 351, 308];

const quickActions: QuickAction[] = [
  { label: "Creative Refresh",  description: "Update fatigued ads",      icon: "🎨", color: "bg-purple-100 text-purple-600" },
  { label: "Audience Review",   description: "Check targeting overlap",   icon: "🎯", color: "bg-blue-100 text-blue-600" },
  { label: "Budget Realloc.",   description: "Shift to top campaigns",    icon: "💰", color: "bg-emerald-100 text-emerald-600" },
  { label: "A/B Test Launch",   description: "Test new creative angle",   icon: "🧪", color: "bg-amber-100 text-amber-600" },
  { label: "Lead Quality Audit",description: "Review lead form quality",  icon: "✅", color: "bg-red-100 text-red-600" },
  { label: "Meta Report",       description: "Export client report",      icon: "📊", color: "bg-slate-100 text-slate-600" },
];

// ── Columns ──────────────────────────────────────────────────────────────────

const columns: Column<MetaCampaignRow>[] = [
  { key: "client",   header: "Client" },
  { key: "campaign", header: "Campaign" },
  { key: "spend",    header: "Spend", width: "90px",
    render: (v) => <span className="font-semibold">${Number(v).toLocaleString()}</span> },
  { key: "leads",    header: "Leads", width: "70px",
    render: (v) => <span className="font-bold">{String(v)}</span> },
  { key: "qualifiedLeads", header: "Qualified", width: "90px",
    render: (v) => <span className="font-semibold text-blue-600">{String(v)}</span> },
  { key: "calls",    header: "Calls",  width: "65px" },
  { key: "formSubmissions", header: "Forms", width: "70px" },
  { key: "bookedLeads", header: "Booked", width: "75px",
    render: (v) => <span className="font-bold text-emerald-600">{String(v)}</span> },
  { key: "cpl",      header: "CPL",   width: "75px",
    render: (v) => {
      const n = Number(v);
      const color = n <= 25 ? "text-emerald-600" : n <= 35 ? "text-amber-600" : "text-red-500";
      return <span className={`font-semibold ${color}`}>${n.toFixed(2)}</span>;
    } },
  { key: "costPerQualified", header: "$/Qual. Lead", width: "100px",
    render: (v) => <span className="font-semibold">${Number(v).toFixed(2)}</span> },
  { key: "ctr", header: "CTR", width: "65px",
    render: (v) => <span>{Number(v).toFixed(1)}%</span> },
  { key: "cpm", header: "CPM", width: "65px",
    render: (v) => <span>${Number(v).toFixed(2)}</span> },
  { key: "frequency", header: "Freq.", width: "70px",
    render: (v) => {
      const n = Number(v);
      const color = n >= 3.5 ? "text-red-500" : n >= 2.5 ? "text-amber-600" : "text-slate-600";
      return <span className={`font-semibold ${color}`}>{n.toFixed(1)}</span>;
    } },
  { key: "creativeFatigue", header: "Creative Fatigue", width: "130px",
    render: (v) => {
      const map: Record<string, { variant: "success" | "warning" | "error"; label: string }> = {
        low:    { variant: "success", label: "Low" },
        medium: { variant: "warning", label: "Medium" },
        high:   { variant: "error",   label: "High" },
      };
      const c = map[String(v)] ?? { variant: "warning" as const, label: String(v) };
      return <StatusBadge variant={c.variant as "success" | "warning"} label={c.label} size="sm" />;
    } },
  { key: "campaignHealth", header: "Health", width: "130px",
    render: (v) => {
      const map: Record<string, { variant: "success" | "warning" | "info"; label: string }> = {
        excellent:       { variant: "success", label: "Excellent" },
        good:            { variant: "success", label: "Good" },
        "needs-attention": { variant: "warning", label: "Needs Attention" },
      };
      const c = map[String(v)] ?? { variant: "warning" as const, label: String(v) };
      return <StatusBadge variant={c.variant} label={c.label} size="sm" />;
    } },
  { key: "status", header: "Status", width: "90px",
    render: (v) => {
      const map: Record<string, { variant: "success" | "warning" | "info"; label: string }> = {
        active: { variant: "success", label: "Active" },
        paused: { variant: "warning", label: "Paused" },
      };
      const c = map[String(v)] ?? { variant: "warning" as const, label: String(v) };
      return <StatusBadge variant={c.variant} label={c.label} size="sm" />;
    } },
];

// ── Funnel row component ─────────────────────────────────────────────────────

function FunnelBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline">
        <span className="text-xs font-medium" style={{ color: "var(--rtm-text-primary)" }}>{label}</span>
        <span className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>{value.toLocaleString()}</span>
      </div>
      <ProgressBar value={value} max={max} height={6} color={color} />
      <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{pct}% of total leads</p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function MetaAdsPerformancePage() {
  const [filters, setFilters] = useState<PerformanceFilterState>(DEFAULT_FILTERS);

  const filteredCampaigns = useMemo(() => {
    let rows = allCampaigns;
    if (filters.client !== "all") {
      const map: Record<string, string> = {
        "apex-roofing": "Apex Roofing Co.",
        "sunbelt-hvac": "Sunbelt HVAC",
        "harbor-auto": "Harbor Auto Group",
        "summit-landscaping": "Summit Landscaping",
        "metro-dental": "Metro Dental",
      };
      const name = map[filters.client];
      if (name) rows = rows.filter((r) => r.client === name);
    }
    if (filters.campaign !== "all") {
      const cmap: Record<string, string> = {
        "storm-season": "Storm Season Lead Gen",
        "summer-sale": "Summer Sale — Traffic",
        "brand-search": "Brand Awareness Q2",
        "new-patient": "New Patient Promo (Meta)",
        "spring-services": "Spring Services",
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
      avgCpm: filteredCampaigns.reduce((s, r) => s + r.cpm, 0) / (filteredCampaigns.length || 1),
      avgFreq: filteredCampaigns.reduce((s, r) => s + r.frequency, 0) / (filteredCampaigns.length || 1),
    };
  }, [filteredCampaigns]);

  const compLabel = filters.comparison !== "none"
    ? filters.comparison === "previousYear" ? "vs Previous Year"
      : `vs Previous ${DATE_RANGE_LABELS[filters.dateRange]}`
    : undefined;

  // Creative fatigue summary
  const fatigueCounts = useMemo(() => ({
    low: filteredCampaigns.filter((c) => c.creativeFatigue === "low").length,
    medium: filteredCampaigns.filter((c) => c.creativeFatigue === "medium").length,
    high: filteredCampaigns.filter((c) => c.creativeFatigue === "high").length,
  }), [filteredCampaigns]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>
            Paid Advertising
          </p>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
            Meta Ads Performance
          </h1>
          <p className="text-sm mt-0.5 font-medium" style={{ color: "var(--rtm-text-secondary)" }}>
            {DATE_RANGE_LABELS[filters.dateRange]}
            {compLabel && (
              <span className="ml-2 text-xs font-normal" style={{ color: "var(--rtm-text-muted)" }}>
                {compLabel}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <Link href="/paid-advertising/meta-ads" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">
            ← Meta Dashboard
          </Link>
        </div>
      </div>

      {/* Filters */}
      <PerformanceFilters
        value={filters}
        onChange={setFilters}
        hideServiceFilter
      />

      {/* KPI Cards – Row 1: Spend + Leads */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <KpiCard
          title="Total Spend"
          value={`$${totals.spend.toLocaleString()}`}
          trend="up"
          trendValue="+8%"
          trendLabel={compLabel ?? "vs last period"}
          iconBg="#FEF2F2"
          iconColor="#DC2626"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <KpiCard
          title="Leads"
          value={totals.leads.toString()}
          trend="up"
          trendValue="+15%"
          trendLabel={compLabel ?? "vs last period"}
          iconBg="#ECFDF5"
          iconColor="#059669"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
        />
        <KpiCard
          title="Qualified Leads"
          value={totals.qualified.toString()}
          trend="up"
          trendValue="+11%"
          trendLabel={compLabel ?? "vs last period"}
          iconBg="var(--rtm-blue-light)"
          iconColor="var(--rtm-blue)"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* KPI Cards – Row 2: Conversions */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <KpiCard
          title="Calls"
          value={totals.calls.toString()}
          trend="up"
          trendValue="+12%"
          trendLabel={compLabel ?? "vs last period"}
          iconBg="#ECFDF5"
          iconColor="#059669"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
        />
        <KpiCard
          title="Form Submissions"
          value={totals.forms.toString()}
          trend="up"
          trendValue="+17%"
          trendLabel={compLabel ?? "vs last period"}
          iconBg="var(--rtm-blue-light)"
          iconColor="var(--rtm-blue)"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
        <KpiCard
          title="Booked Leads"
          value={totals.booked.toString()}
          trend="up"
          trendValue="+21%"
          trendLabel={compLabel ?? "vs last period"}
          iconBg="#ECFDF5"
          iconColor="#059669"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
        />
      </div>

      {/* KPI Cards – Row 3: Efficiency */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <KpiCard
          title="Cost Per Lead (CPL)"
          value={`$${totals.cpl.toFixed(2)}`}
          trend={totals.cpl <= 28 ? "down" : "up"}
          trendValue={totals.cpl <= 28 ? "-$3.40" : "+$2.10"}
          trendLabel={compLabel ?? "vs last period"}
          iconBg="#FFFBEB"
          iconColor="#D97706"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
        />
        <KpiCard
          title="Cost Per Qualified Lead"
          value={`$${totals.costPerQual.toFixed(2)}`}
          trend="down"
          trendValue="-$5.20"
          trendLabel={compLabel ?? "vs last period"}
          iconBg="#FFFBEB"
          iconColor="#D97706"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
        />
        <KpiCard
          title="Avg CTR"
          value={`${totals.avgCtr.toFixed(1)}%`}
          trend="up"
          trendValue="+0.4%"
          trendLabel={compLabel ?? "vs last period"}
          iconBg="var(--rtm-blue-light)"
          iconColor="var(--rtm-blue)"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" /></svg>}
        />
      </div>

      {/* Row 4: CPM, Frequency, Creative Fatigue */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <KpiCard
          title="Avg CPM"
          value={`$${totals.avgCpm.toFixed(2)}`}
          trend="down"
          trendValue="-$1.20"
          trendLabel={compLabel ?? "vs last period"}
          iconBg="#F5F3FF"
          iconColor="#7C3AED"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
        />
        <KpiCard
          title="Avg Ad Frequency"
          value={totals.avgFreq.toFixed(1)}
          trend={totals.avgFreq >= 3 ? "up" : "neutral"}
          trendValue={totals.avgFreq >= 3 ? "⚠ High" : "Normal"}
          trendLabel="fatigue risk"
          iconBg={totals.avgFreq >= 3 ? "#FEF2F2" : "#FFFBEB"}
          iconColor={totals.avgFreq >= 3 ? "#DC2626" : "#D97706"}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
        />
        <KpiCard
          title="Campaign Health"
          value={`${filteredCampaigns.filter(c => c.campaignHealth === "excellent" || c.campaignHealth === "good").length} / ${filteredCampaigns.length} Healthy`}
          trend={fatigueCounts.high === 0 ? "up" : "down"}
          trendValue={fatigueCounts.high > 0 ? `${fatigueCounts.high} need refresh` : "All good"}
          trendLabel="creative status"
          iconBg="#ECFDF5"
          iconColor="#059669"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* Charts + Creative Fatigue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionWrapper title="Spend Trend" description="Total Meta Ads spend — last 12 months" className="lg:col-span-2">
          <MiniSparkline data={spendTrend} color="#DC2626" height={80} width={500} />
          <div className="mt-3 flex gap-2 text-xs" style={{ color: "var(--rtm-text-muted)" }}>
            {["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"].map((m) => (
              <span key={m} className="flex-1 text-center">{m}</span>
            ))}
          </div>
        </SectionWrapper>

        <SectionWrapper title="Creative Fatigue Status" description="Across all active campaigns">
          <div className="space-y-4 py-1">
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "#ECFDF5", border: "1px solid #A7F3D0" }}>
              <div>
                <p className="text-sm font-bold text-emerald-700">Low Fatigue</p>
                <p className="text-xs text-emerald-600">Healthy reach & frequency</p>
              </div>
              <span className="text-2xl font-bold text-emerald-700">{fatigueCounts.low}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
              <div>
                <p className="text-sm font-bold text-amber-700">Medium Fatigue</p>
                <p className="text-xs text-amber-600">Refresh soon recommended</p>
              </div>
              <span className="text-2xl font-bold text-amber-700">{fatigueCounts.medium}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
              <div>
                <p className="text-sm font-bold text-red-700">High Fatigue</p>
                <p className="text-xs text-red-600">Creative refresh needed</p>
              </div>
              <span className="text-2xl font-bold text-red-700">{fatigueCounts.high}</span>
            </div>
          </div>
        </SectionWrapper>
      </div>

      {/* Lead Funnel Summary */}
      <SectionWrapper title="Lead Funnel Summary" description={`${DATE_RANGE_LABELS[filters.dateRange]} — all filtered campaigns`}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <FunnelBar label="Leads"             value={totals.leads}     max={totals.leads} color="bg-blue-500" />
          <FunnelBar label="Calls"             value={totals.calls}     max={totals.leads} color="bg-emerald-500" />
          <FunnelBar label="Form Submissions"  value={totals.forms}     max={totals.leads} color="bg-purple-500" />
          <FunnelBar label="Booked Leads"      value={totals.booked}    max={totals.leads} color="bg-amber-500" />
        </div>
      </SectionWrapper>

      {/* Lead Quality Section */}
      <SectionWrapper title="Lead Quality" description="Lead-to-qualified and qualified-to-booked rates">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs font-medium" style={{ color: "var(--rtm-text-primary)" }}>Lead → Qualified Rate</span>
              <span className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                {totals.leads > 0 ? Math.round((totals.qualified / totals.leads) * 100) : 0}%
              </span>
            </div>
            <ProgressBar
              value={totals.leads > 0 ? Math.round((totals.qualified / totals.leads) * 100) : 0}
              max={100}
              height={8}
              color="bg-blue-500"
            />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs font-medium" style={{ color: "var(--rtm-text-primary)" }}>Qualified → Booked Rate</span>
              <span className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                {totals.qualified > 0 ? Math.round((totals.booked / totals.qualified) * 100) : 0}%
              </span>
            </div>
            <ProgressBar
              value={totals.qualified > 0 ? Math.round((totals.booked / totals.qualified) * 100) : 0}
              max={100}
              height={8}
              color="bg-emerald-500"
            />
          </div>
        </div>
      </SectionWrapper>

      {/* Leads Trend */}
      <SectionWrapper title="Leads Trend" description="Total Meta leads — last 12 months">
        <MiniSparkline data={leadsTrend} color="#059669" height={80} width={800} />
        <div className="mt-3 flex gap-2 text-xs" style={{ color: "var(--rtm-text-muted)" }}>
          {["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"].map((m) => (
            <span key={m} className="flex-1 text-center">{m}</span>
          ))}
        </div>
      </SectionWrapper>

      {/* Campaign Performance Table */}
      <SectionWrapper
        title="Campaign Performance"
        description={`${filteredCampaigns.length} campaign${filteredCampaigns.length !== 1 ? "s" : ""} — ${DATE_RANGE_LABELS[filters.dateRange]}`}
        noPadding
        actions={
          <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>Mock data</span>
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
