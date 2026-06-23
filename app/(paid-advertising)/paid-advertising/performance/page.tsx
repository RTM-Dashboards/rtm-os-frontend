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

//  Mock Data 

interface ChannelRow extends Record<string, unknown> {
  channel: string;
  spend: number;
  leads: number;
  qualifiedLeads: number;
  calls: number;
  formSubmissions: number;
  bookedLeads: number;
  cpl: number;
  costPerQualified: number;
  campaignHealth: string;
}

const allChannels: ChannelRow[] = [
  {
    channel: "Meta Ads",
    spend: 7750,
    leads: 308,
    qualifiedLeads: 181,
    calls: 124,
    formSubmissions: 184,
    bookedLeads: 48,
    cpl: 25.16,
    costPerQualified: 42.82,
    campaignHealth: "excellent",
  },
  {
    channel: "Google Ads",
    spend: 7000,
    leads: 209,
    qualifiedLeads: 131,
    calls: 116,
    formSubmissions: 93,
    bookedLeads: 40,
    cpl: 33.49,
    costPerQualified: 53.44,
    campaignHealth: "good",
  },
];

interface TrendRow extends Record<string, unknown> {
  month: string;
  metaSpend: number;
  googleSpend: number;
  metaLeads: number;
  googleLeads: number;
}

const trendData: TrendRow[] = [
  { month: "Jun", metaSpend: 5800, googleSpend: 5200, metaLeads: 248, googleLeads: 172 },
  { month: "Jul", metaSpend: 6200, googleSpend: 5800, metaLeads: 271, googleLeads: 188 },
  { month: "Aug", metaSpend: 5900, googleSpend: 5600, metaLeads: 258, googleLeads: 182 },
  { month: "Sep", metaSpend: 6400, googleSpend: 6100, metaLeads: 284, googleLeads: 198 },
  { month: "Oct", metaSpend: 6800, googleSpend: 6400, metaLeads: 301, googleLeads: 212 },
  { month: "Nov", metaSpend: 7200, googleSpend: 6900, metaLeads: 318, googleLeads: 226 },
  { month: "Dec", metaSpend: 7100, googleSpend: 6700, metaLeads: 312, googleLeads: 220 },
  { month: "Jan", metaSpend: 7400, googleSpend: 7200, metaLeads: 334, googleLeads: 241 },
  { month: "Feb", metaSpend: 7600, googleSpend: 7400, metaLeads: 348, googleLeads: 252 },
  { month: "Mar", metaSpend: 7200, googleSpend: 7000, metaLeads: 328, googleLeads: 238 },
  { month: "Apr", metaSpend: 7500, googleSpend: 7300, metaLeads: 351, googleLeads: 248 },
  { month: "May", metaSpend: 7750, googleSpend: 7000, metaLeads: 308, googleLeads: 209 },
];

const combinedSpendTrend = trendData.map((d) => d.metaSpend + d.googleSpend);
const combinedLeadsTrend = trendData.map((d) => d.metaLeads + d.googleLeads);

const quickActions: QuickAction[] = [
  { label: "Budget Overview",     description: "Rebalance Meta vs Google", icon: "",  color: "bg-blue-100 text-blue-600"},
  { label: "Cross-Channel Report",description: "Combined performance PDF",  icon: "", color: "bg-purple-100 text-purple-600"},
  { label: "Lead Quality Sweep",  description: "Review lead quality score", color: "bg-emerald-100 text-emerald-600"},
  { label: "Creative Audit",      description: "Check fatigue across ads",  icon: "", color: "bg-amber-100 text-amber-600"},
  { label: "Audience Analysis",   description: "Overlap and reach check",   icon: "", color: "bg-red-100 text-red-600"},
  { label: "Client Report Pack",  description: "All-channel report",        icon: "", color: "bg-slate-100 text-slate-600"},
];

//  Columns 

const channelColumns: Column<ChannelRow>[] = [
  { key: "channel", header: "Channel",
    render: (v) => <span className="font-bold">{String(v)}</span> },
  { key: "spend", header: "Spend",
    render: (v) => <span className="font-semibold">${Number(v).toLocaleString()}</span> },
  { key: "leads", header: "Leads",
    render: (v) => <span className="font-bold">{String(v)}</span> },
  { key: "qualifiedLeads", header: "Qualified Leads",
    render: (v) => <span className="font-semibold text-blue-600">{String(v)}</span> },
  { key: "calls", header: "Calls"},
  { key: "formSubmissions", header: "Forms"},
  { key: "bookedLeads", header: "Booked",
    render: (v) => <span className="font-bold text-emerald-600">{String(v)}</span> },
  { key: "cpl", header: "CPL",
    render: (v) => {
      const n = Number(v);
      const color = n <= 30 ? "text-emerald-600": n <= 40 ? "text-amber-600": "text-red-500";
      return <span className={`font-semibold ${color}`}>${n.toFixed(2)}</span>;
    } },
  { key: "costPerQualified", header: "$/Qual. Lead",
    render: (v) => <span className="font-semibold">${Number(v).toFixed(2)}</span> },
  { key: "campaignHealth", header: "Campaign Health",
    render: (v) => {
      const map: Record<string, { variant: "success"| "warning"| "info"; label: string }> = {
        excellent: { variant: "success", label: "Excellent"},
        good:      { variant: "success", label: "Good"},
        warning:   { variant: "warning", label: "Needs Attention"},
      };
      const c = map[String(v)] ?? { variant: "warning"as const, label: String(v) };
      return <StatusBadge variant={c.variant} label={c.label} size="sm"/>;
    } },
];

//  Page 

export default function PaidAdPerformancePage() {
  const [filters, setFilters] = useState<PerformanceFilterState>(DEFAULT_FILTERS);

  const filteredChannels = useMemo(() => {
    if (filters.service === "all") return allChannels;
    if (filters.service === "meta-ads") return allChannels.filter((r) => r.channel === "Meta Ads");
    if (filters.service === "google-ads") return allChannels.filter((r) => r.channel === "Google Ads");
    return allChannels;
  }, [filters.service]);

  const totals = useMemo(() => {
    const t = {
      spend: filteredChannels.reduce((s, r) => s + r.spend, 0),
      leads: filteredChannels.reduce((s, r) => s + r.leads, 0),
      qualified: filteredChannels.reduce((s, r) => s + r.qualifiedLeads, 0),
      calls: filteredChannels.reduce((s, r) => s + r.calls, 0),
      forms: filteredChannels.reduce((s, r) => s + r.formSubmissions, 0),
      booked: filteredChannels.reduce((s, r) => s + r.bookedLeads, 0),
    };
    return {
      ...t,
      cpl: t.leads > 0 ? t.spend / t.leads : 0,
      costPerQual: t.qualified > 0 ? t.spend / t.qualified : 0,
    };
  }, [filteredChannels]);

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
            Paid Advertising Overview
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
        <div className="flex items-center gap-2 self-start flex-wrap">
          <Link href="/paid-advertising" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">
            ← Ad Overview
          </Link>
          <Link href="/paid-advertising/meta-ads/performance" className="rtm-btn-primary text-sm inline-flex items-center gap-1">
            Meta Performance →
          </Link>
          <Link href="/paid-advertising/google-ads/performance" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">
            Google Performance →
          </Link>
        </div>
      </div>

      {/* Filters */}
      <PerformanceFilters
        value={filters}
        onChange={setFilters}
      />

      {/* KPI Row 1: Spend + Leads */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <KpiCard
          title="Total Spend"value={`$${totals.spend.toLocaleString()}`}
          trend="up"trendValue="+7%"trendLabel={compLabel ?? "vs last period"}
          iconBg="#FEF2F2"iconColor="#DC2626"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        />
        <KpiCard
          title="Total Leads"value={totals.leads.toString()}
          trend="up"trendValue="+14%"trendLabel={compLabel ?? "vs last period"}
          iconBg="#ECFDF5"iconColor="#059669"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>}
        />
        <KpiCard
          title="Qualified Leads"value={totals.qualified.toString()}
          trend="up"trendValue="+10%"trendLabel={compLabel ?? "vs last period"}
          iconBg="var(--rtm-blue-light)"iconColor="var(--rtm-blue)"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        />
      </div>

      {/* KPI Row 2: Conversions */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <KpiCard
          title="Calls"value={totals.calls.toString()}
          trend="up"trendValue="+11%"trendLabel={compLabel ?? "vs last period"}
          iconBg="#ECFDF5"iconColor="#059669"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>}
        />
        <KpiCard
          title="Form Submissions"value={totals.forms.toString()}
          trend="up"trendValue="+16%"trendLabel={compLabel ?? "vs last period"}
          iconBg="var(--rtm-blue-light)"iconColor="var(--rtm-blue)"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>}
        />
        <KpiCard
          title="Booked Leads"value={totals.booked.toString()}
          trend="up"trendValue="+19%"trendLabel={compLabel ?? "vs last period"}
          iconBg="#ECFDF5"iconColor="#059669"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>}
        />
      </div>

      {/* KPI Row 3: Efficiency */}
      <div className="grid grid-cols-2 xl:grid-cols-2 gap-4">
        <KpiCard
          title="Combined Cost Per Lead (CPL)"value={`$${totals.cpl.toFixed(2)}`}
          trend="down"trendValue="-$2.90"trendLabel={compLabel ?? "vs last period"}
          iconBg="#FFFBEB"iconColor="#D97706"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>}
        />
        <KpiCard
          title="Combined Cost Per Qualified Lead"value={`$${totals.costPerQual.toFixed(2)}`}
          trend="down"trendValue="-$4.80"trendLabel={compLabel ?? "vs last period"}
          iconBg="#FFFBEB"iconColor="#D97706"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>}
        />
      </div>

      {/* Combined Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionWrapper title="Combined Spend Trend"description="Meta + Google — last 12 months">
          <MiniSparkline data={combinedSpendTrend} color="#DC2626"height={80} width={500} />
          <div className="mt-3 flex gap-2 text-xs"style={{ color: "var(--rtm-text-muted)"}}>
            {trendData.map((d) => (
              <span key={d.month} className="flex-1 text-center">{d.month}</span>
            ))}
          </div>
        </SectionWrapper>

        <SectionWrapper title="Combined Leads Trend"description="Meta + Google — last 12 months">
          <MiniSparkline data={combinedLeadsTrend} color="#059669"height={80} width={500} />
          <div className="mt-3 flex gap-2 text-xs"style={{ color: "var(--rtm-text-muted)"}}>
            {trendData.map((d) => (
              <span key={d.month} className="flex-1 text-center">{d.month}</span>
            ))}
          </div>
        </SectionWrapper>
      </div>

      {/* Channel Comparison Table */}
      <SectionWrapper
        title="Channel Comparison"description="Meta Ads vs Google Ads"noPadding
        actions={
          <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>Mock data</span>
        }
      >
        <DataTable columns={channelColumns} data={filteredChannels} />
      </SectionWrapper>

      {/* Meta vs Google visual comparison */}
      <SectionWrapper title="Meta vs Google — Side by Side"description="Key metrics comparison">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Meta */}
          <div className="space-y-3">
            <p className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}> Meta Ads</p>
            {[
              { label: "Spend",     value: "$7,750"},
              { label: "Leads",     value: "308"},
              { label: "CPL",       value: "$25.16"},
              { label: "Booked",    value: "48"},
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center py-1.5 border-b"style={{ borderColor: "var(--rtm-border-light)"}}>
                <span className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{item.label}</span>
                <span className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>{item.value}</span>
              </div>
            ))}
          </div>
          {/* Google */}
          <div className="space-y-3">
            <p className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}> Google Ads</p>
            {[
              { label: "Spend",     value: "$7,000"},
              { label: "Leads",     value: "209"},
              { label: "CPL",       value: "$33.49"},
              { label: "Booked",    value: "40"},
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center py-1.5 border-b"style={{ borderColor: "var(--rtm-border-light)"}}>
                <span className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{item.label}</span>
                <span className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Funnel Summary */}
      <SectionWrapper title="Combined Lead Funnel"description={`${DATE_RANGE_LABELS[filters.dateRange]} — all channels`}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Leads",            value: totals.leads,   color: "bg-blue-500"},
            { label: "Calls",            value: totals.calls,   color: "bg-emerald-500"},
            { label: "Form Submissions", value: totals.forms,   color: "bg-purple-500"},
            { label: "Booked Leads",     value: totals.booked,  color: "bg-amber-500"},
          ].map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-medium"style={{ color: "var(--rtm-text-primary)"}}>{item.label}</span>
                <span className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>{item.value.toLocaleString()}</span>
              </div>
              <ProgressBar value={item.value} max={totals.leads} height={6} color={item.color} />
              <p className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>
                {Math.round((item.value / (totals.leads || 1)) * 100)}% of total leads
              </p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Quick Actions */}
      <SectionWrapper title="Quick Actions">
        <QuickActions actions={quickActions} cols={3} />
      </SectionWrapper>
    </div>
  );
}
