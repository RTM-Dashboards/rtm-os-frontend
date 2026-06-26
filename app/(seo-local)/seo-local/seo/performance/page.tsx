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

const workspace = getWorkspace("seo-local")!;

//  Mock Data 

interface SeoClientRow extends Record<string, unknown> {
  client: string;
  organicTraffic: number;
  organicLeads: number;
  qualifiedLeads: number;
  bookedLeads: number;
  topKeywordRank: number;
  rankingMovement: string;
  techSeoScore: number;
  indexedPages: number;
  clientHealth: number;
  status: string;
}

const allClients: SeoClientRow[] = [
  {
    client: "Apex Roofing Co.",
    organicTraffic: 4820,
    organicLeads: 62,
    qualifiedLeads: 41,
    bookedLeads: 18,
    topKeywordRank: 3,
    rankingMovement: "+4",
    techSeoScore: 91,
    indexedPages: 84,
    clientHealth: 94,
    status: "on-track",
  },
  {
    client: "Sunbelt HVAC",
    organicTraffic: 2140,
    organicLeads: 28,
    qualifiedLeads: 16,
    bookedLeads: 7,
    topKeywordRank: 7,
    rankingMovement: "-2",
    techSeoScore: 74,
    indexedPages: 52,
    clientHealth: 68,
    status: "needs-work",
  },
  {
    client: "Pacific Dental",
    organicTraffic: 7310,
    organicLeads: 94,
    qualifiedLeads: 61,
    bookedLeads: 29,
    topKeywordRank: 2,
    rankingMovement: "+6",
    techSeoScore: 97,
    indexedPages: 138,
    clientHealth: 98,
    status: "on-track",
  },
  {
    client: "Summit Landscaping",
    organicTraffic: 1980,
    organicLeads: 24,
    qualifiedLeads: 14,
    bookedLeads: 6,
    topKeywordRank: 5,
    rankingMovement: "+1",
    techSeoScore: 82,
    indexedPages: 41,
    clientHealth: 79,
    status: "on-track",
  },
  {
    client: "Blue Ridge Plumbing",
    organicTraffic: 940,
    organicLeads: 11,
    qualifiedLeads: 7,
    bookedLeads: 3,
    topKeywordRank: 4,
    rankingMovement: "-1",
    techSeoScore: 68,
    indexedPages: 28,
    clientHealth: 62,
    status: "needs-work",
  },
  {
    client: "Harbor Auto Group",
    organicTraffic: 3670,
    organicLeads: 44,
    qualifiedLeads: 27,
    bookedLeads: 11,
    topKeywordRank: 6,
    rankingMovement: "+2",
    techSeoScore: 85,
    indexedPages: 77,
    clientHealth: 83,
    status: "on-track",
  },
];

const rankingTrendData = [38.2, 40.1, 39.8, 41.5, 42.3, 44.1, 43.7, 45.2, 46.8, 45.9, 47.4, 49.7];

const techAuditItems = [
  { label: "Core Web Vitals", score: 88, color: "bg-emerald-500"},
  { label: "Mobile Usability", score: 94, color: "bg-blue-500"},
  { label: "Structured Data", score: 72, color: "bg-amber-500"},
  { label: "Site Speed", score: 81, color: "bg-blue-500"},
  { label: "Crawlability", score: 96, color: "bg-emerald-500"},
  { label: "HTTPS / Security", score: 100, color: "bg-emerald-500"},
];

const quickActions: QuickAction[] = [
  { label: "Run SEO Audit",    description: "Full site crawl",         icon: "", color: "bg-blue-100 text-blue-600"},
  { label: "Keyword Research", description: "Find new opportunities",   icon: "", color: "bg-purple-100 text-purple-600"},
  { label: "Content Brief",    description: "Generate page brief",      icon: "", color: "bg-emerald-100 text-emerald-600"},
  { label: "Backlink Report",  description: "Domain authority check",   icon: "", color: "bg-amber-100 text-amber-600"},
  { label: "Tech Fix Queue",   description: "Priority issues list",     icon: "", color: "bg-red-100 text-red-600"},
  { label: "Ranking Report",   description: "Client-ready PDF",         icon: "", color: "bg-slate-100 text-slate-600"},
];

//  Keyword Ranking Mock Data 
// Future data source: Google Search Console (query, clicks, impressions, ctr,
// average_position, landing_page, date) + SEO rank tracking providers

interface KeywordRow extends Record<string, unknown> {
  keyword: string;
  searchIntent: string;
  location: string;
  currentPosition: number;
  previousPosition: number;
  positionChange: number;
  searchVolume: number;
  clicks: number;
  impressions: number;
  ctr: number;
  landingPage: string;
  rankingTrend: number[];
  keywordStatus: string;
}

const allKeywords: KeywordRow[] = [
  {
    keyword: "roofing company denver",
    searchIntent: "Commercial",
    location: "Denver, CO",
    currentPosition: 2,
    previousPosition: 6,
    positionChange: 4,
    searchVolume: 2400,
    clicks: 187,
    impressions: 3200,
    ctr: 5.8,
    landingPage: "/roofing-denver",
    rankingTrend: [8, 7, 6, 5, 4, 3, 2, 2],
    keywordStatus: "improved",
  },
  {
    keyword: "emergency roof repair",
    searchIntent: "Transactional",
    location: "Denver, CO",
    currentPosition: 1,
    previousPosition: 1,
    positionChange: 0,
    searchVolume: 1800,
    clicks: 214,
    impressions: 2900,
    ctr: 7.4,
    landingPage: "/emergency-roof-repair",
    rankingTrend: [1, 1, 1, 1, 1, 1, 1, 1],
    keywordStatus: "unchanged",
  },
  {
    keyword: "dental implants san diego",
    searchIntent: "Commercial",
    location: "San Diego, CA",
    currentPosition: 3,
    previousPosition: 9,
    positionChange: 6,
    searchVolume: 5400,
    clicks: 312,
    impressions: 6100,
    ctr: 5.1,
    landingPage: "/dental-implants",
    rankingTrend: [14, 12, 10, 8, 7, 5, 4, 3],
    keywordStatus: "improved",
  },
  {
    keyword: "family dentist near me",
    searchIntent: "Navigational",
    location: "San Diego, CA",
    currentPosition: 5,
    previousPosition: 4,
    positionChange: -1,
    searchVolume: 8100,
    clicks: 198,
    impressions: 5400,
    ctr: 3.7,
    landingPage: "/family-dentistry",
    rankingTrend: [3, 3, 4, 4, 4, 5, 5, 5],
    keywordStatus: "declined",
  },
  {
    keyword: "hvac repair phoenix",
    searchIntent: "Transactional",
    location: "Phoenix, AZ",
    currentPosition: 7,
    previousPosition: 9,
    positionChange: 2,
    searchVolume: 3200,
    clicks: 88,
    impressions: 2800,
    ctr: 3.1,
    landingPage: "/hvac-repair",
    rankingTrend: [11, 10, 9, 9, 8, 7, 7, 7],
    keywordStatus: "improved",
  },
  {
    keyword: "ac installation cost",
    searchIntent: "Informational",
    location: "Phoenix, AZ",
    currentPosition: 12,
    previousPosition: 18,
    positionChange: 6,
    searchVolume: 4400,
    clicks: 54,
    impressions: 3700,
    ctr: 1.5,
    landingPage: "/ac-installation",
    rankingTrend: [22, 20, 18, 17, 15, 14, 13, 12],
    keywordStatus: "improved",
  },
  {
    keyword: "landscaping company denver co",
    searchIntent: "Commercial",
    location: "Denver, CO",
    currentPosition: 4,
    previousPosition: 5,
    positionChange: 1,
    searchVolume: 1600,
    clicks: 73,
    impressions: 1900,
    ctr: 3.8,
    landingPage: "/landscaping-denver",
    rankingTrend: [6, 6, 5, 5, 5, 4, 4, 4],
    keywordStatus: "improved",
  },
  {
    keyword: "auto dealership phoenix arizona",
    searchIntent: "Commercial",
    location: "Phoenix, AZ",
    currentPosition: 8,
    previousPosition: 7,
    positionChange: -1,
    searchVolume: 2200,
    clicks: 61,
    impressions: 2100,
    ctr: 2.9,
    landingPage: "/",
    rankingTrend: [6, 6, 7, 7, 7, 7, 8, 8],
    keywordStatus: "declined",
  },
  {
    keyword: "plumber asheville nc 24 hour",
    searchIntent: "Transactional",
    location: "Asheville, NC",
    currentPosition: 3,
    previousPosition: 0,
    positionChange: 0,
    searchVolume: 720,
    clicks: 42,
    impressions: 890,
    ctr: 4.7,
    landingPage: "/emergency-plumbing",
    rankingTrend: [0, 0, 0, 0, 12, 7, 5, 3],
    keywordStatus: "new",
  },
  {
    keyword: "roof replacement cost estimate",
    searchIntent: "Informational",
    location: "Denver, CO",
    currentPosition: 6,
    previousPosition: 11,
    positionChange: 5,
    searchVolume: 3100,
    clicks: 128,
    impressions: 4200,
    ctr: 3.0,
    landingPage: "/roof-replacement",
    rankingTrend: [15, 13, 12, 10, 9, 8, 7, 6],
    keywordStatus: "improved",
  },
];

// Keyword trend chart data
const avgPositionTrend = [12.4, 11.8, 11.2, 10.6, 9.9, 9.3, 8.8, 8.1, 7.6, 7.2, 6.8, 6.3];
const top10GrowthTrend  = [68, 71, 74, 78, 82, 87, 91, 96, 101, 108, 114, 121];
const top3GrowthTrend   = [18, 19, 20, 22, 24, 26, 27, 29, 31, 33, 35, 38];

const KEYWORD_FILTERS = [
  { value: "all",       label: "All Keywords"},
  { value: "top3",      label: "Top 3"},
  { value: "top10",     label: "Top 10"},
  { value: "top20",     label: "Top 20"},
  { value: "top50",     label: "Top 50"},
  { value: "improved",  label: "Improved"},
  { value: "declined",  label: "Declined"},
  { value: "new",       label: "New Keywords"},
] as const;

type KeywordFilter = (typeof KEYWORD_FILTERS)[number]["value"];

const LOCATION_OPTIONS = [
  { value: "all",          label: "All Locations"},
  { value: "Denver, CO",   label: "Denver, CO"},
  { value: "San Diego, CA",label: "San Diego, CA"},
  { value: "Phoenix, AZ",  label: "Phoenix, AZ"},
  { value: "Asheville, NC",label: "Asheville, NC"},
];

//  Column defs 

const columns: Column<SeoClientRow>[] = [
  { key: "client", header: "Client"},
  { key: "organicTraffic", header: "Organic Traffic", width: "130px",
    render: (v) => <span className="font-semibold">{Number(v).toLocaleString()}</span> },
  { key: "organicLeads", header: "Org. Leads", width: "100px"},
  { key: "qualifiedLeads", header: "Qualified", width: "90px"},
  { key: "bookedLeads", header: "Booked", width: "80px",
    render: (v) => <span className="font-bold text-emerald-600">{String(v)}</span> },
  { key: "topKeywordRank", header: "Top Rank", width: "90px",
    render: (v) => {
      const n = Number(v);
      const color = n <= 3 ? "text-emerald-600": n <= 7 ? "text-amber-600": "text-slate-500";
      return <span className={`font-bold ${color}`}>#{n}</span>;
    } },
  { key: "rankingMovement", header: "Movement", width: "100px",
    render: (v) => {
      const s = String(v);
      const color = s.startsWith("+") ? "text-emerald-600": s.startsWith("-") ? "text-red-500": "text-slate-500";
      return <span className={`font-semibold ${color}`}>{s}</span>;
    } },
  { key: "techSeoScore", header: "Tech Score", width: "150px",
    render: (v) => {
      const n = Number(v);
      const color = n >= 90 ? "bg-emerald-500": n >= 75 ? "bg-amber-500": "bg-red-500";
      return <ProgressBar value={n} max={100} height={5} color={color} showLabel />;
    } },
  { key: "indexedPages", header: "Indexed", width: "80px"},
  { key: "clientHealth", header: "Health", width: "150px",
    render: (v) => {
      const n = Number(v);
      const color = n >= 90 ? "bg-emerald-500": n >= 70 ? "bg-blue-500": "bg-amber-500";
      return <ProgressBar value={n} max={100} height={5} color={color} showLabel />;
    } },
  { key: "status", header: "Status", width: "130px",
    render: (v) => {
      const map: Record<string, { variant: "success"| "warning"; label: string }> = {
        "on-track":   { variant: "success", label: "On Track"},
        "needs-work": { variant: "warning", label: "Needs Work"},
      };
      const c = map[String(v)] ?? { variant: "warning"as const, label: String(v) };
      return <StatusBadge variant={c.variant} label={c.label} size="sm"/>;
    } },
];

// Keyword table columns
const keywordColumns: Column<KeywordRow>[] = [
  { key: "keyword", header: "Keyword",
    render: (v) => <span className="font-medium text-sm">{String(v)}</span> },
  { key: "searchIntent", header: "Search Intent", width: "120px",
    render: (v) => {
      const map: Record<string, string> = {
        "Commercial": "bg-blue-100 text-blue-700",
        "Transactional": "bg-purple-100 text-purple-700",
        "Informational": "bg-amber-100 text-amber-700",
        "Navigational": "bg-slate-100 text-slate-600",
      };
      const cls = map[String(v)] ?? "bg-slate-100 text-slate-600";
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${cls}`}>
          {String(v)}
        </span>
      );
    } },
  { key: "location", header: "Location", width: "130px",
    render: (v) => <span className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{String(v)}</span> },
  { key: "currentPosition", header: "Position", width: "80px",
    render: (v) => {
      const n = Number(v);
      const color = n <= 3 ? "text-emerald-600": n <= 10 ? "text-blue-600": n <= 20 ? "text-amber-600": "text-slate-500";
      return <span className={`font-bold text-base ${color}`}>#{n}</span>;
    } },
  { key: "previousPosition", header: "Prev. Pos.", width: "85px",
    render: (v) => {
      const n = Number(v);
      return n === 0
        ? <span className="text-xs text-slate-400">New</span>
        : <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>#{n}</span>;
    } },
  { key: "positionChange", header: "Change", width: "80px",
    render: (v, row) => {
      const n = Number(v);
      const status = String((row as KeywordRow).keywordStatus);
      if (status === "new") return <span className="text-xs font-semibold text-blue-600">New</span>;
      if (n === 0) return <span className="text-xs text-slate-400">—</span>;
      const color = n > 0 ? "text-emerald-600": "text-red-500";
      return <span className={`font-semibold text-sm ${color}`}>{n > 0 ? `+${n}` : n}</span>;
    } },
  { key: "searchVolume", header: "Volume", width: "80px",
    render: (v) => <span className="text-sm">{Number(v).toLocaleString()}</span> },
  { key: "clicks", header: "Clicks", width: "70px",
    render: (v) => <span className="font-semibold text-sm">{Number(v).toLocaleString()}</span> },
  { key: "impressions", header: "Impressions", width: "100px",
    render: (v) => <span className="text-sm">{Number(v).toLocaleString()}</span> },
  { key: "ctr", header: "CTR", width: "70px",
    render: (v) => {
      const n = Number(v);
      const color = n >= 5 ? "text-emerald-600": n >= 3 ? "text-amber-600": "text-slate-500";
      return <span className={`font-semibold text-sm ${color}`}>{n.toFixed(1)}%</span>;
    } },
  { key: "landingPage", header: "Landing Page", width: "160px",
    render: (v) => (
      <span className="text-xs font-mono text-blue-600 truncate block max-w-[150px]"title={String(v)}>
        {String(v)}
      </span>
    ) },
  { key: "rankingTrend", header: "Trend", width: "90px",
    render: (v) => {
      const data = Array.isArray(v) ? (v as number[]) : [];
      if (data.length < 2) return <span className="text-xs text-slate-400">—</span>;
      const last = data[data.length - 1];
      const first = data[0];
      const improved = first === 0 ? true : last < first;
      return (
        <div className="flex items-center gap-1">
          <MiniSparkline
            data={data}
            color={improved ? "#059669": "#EF4444"}
            height={24}
            width={72}
          />
        </div>
      );
    } },
  { key: "keywordStatus", header: "Status", width: "120px",
    render: (v) => {
      const map: Record<string, { variant: "success"| "warning"| "info"| "error"; label: string }> = {
        improved:  { variant: "success", label: "Improved"},
        declined:  { variant: "warning", label: "Declined"},
        unchanged: { variant: "info",    label: "Unchanged"},
        new:       { variant: "info",    label: "New Keyword"},
      };
      const c = map[String(v)] ?? { variant: "info"as const, label: String(v) };
      return <StatusBadge variant={c.variant} label={c.label} size="sm"/>;
    } },
];

//  Page 

export default function SeoPerformancePage() {
  const [filters, setFilters] = useState<PerformanceFilterState>(DEFAULT_FILTERS);
  const [keywordFilter, setKeywordFilter] = useState<KeywordFilter>("all");
  const [keywordSearch, setKeywordSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");

  // Mock filter effect — filter by client if selected
  const filteredClients = useMemo(() => {
    if (filters.client === "all") return allClients;
    const map: Record<string, string> = {
      "apex-roofing": "Apex Roofing Co.",
      "sunbelt-hvac": "Sunbelt HVAC",
      "pacific-dental": "Pacific Dental",
      "summit-landscaping": "Summit Landscaping",
      "blue-ridge-plumbing": "Blue Ridge Plumbing",
      "harbor-auto": "Harbor Auto Group",
    };
    const name = map[filters.client];
    return name ? allClients.filter((c) => c.client === name) : allClients;
  }, [filters.client]);

  const filteredKeywords = useMemo(() => {
    let rows = allKeywords;

    // Search filter
    if (keywordSearch.trim()) {
      const q = keywordSearch.trim().toLowerCase();
      rows = rows.filter((r) => r.keyword.toLowerCase().includes(q));
    }

    // Location filter
    if (locationFilter !== "all") {
      rows = rows.filter((r) => r.location === locationFilter);
    }

    // Keyword position/status filter
    switch (keywordFilter) {
      case "top3":     rows = rows.filter((r) => r.currentPosition <= 3); break;
      case "top10":    rows = rows.filter((r) => r.currentPosition <= 10); break;
      case "top20":    rows = rows.filter((r) => r.currentPosition <= 20); break;
      case "top50":    rows = rows.filter((r) => r.currentPosition <= 50); break;
      case "improved": rows = rows.filter((r) => r.keywordStatus === "improved"); break;
      case "declined": rows = rows.filter((r) => r.keywordStatus === "declined"); break;
      case "new":      rows = rows.filter((r) => r.keywordStatus === "new"); break;
    }

    return rows;
  }, [keywordSearch, locationFilter, keywordFilter]);

  const keywordKpis = useMemo(() => {
    const total   = allKeywords.length;
    const top3    = allKeywords.filter((k) => k.currentPosition <= 3).length;
    const top10   = allKeywords.filter((k) => k.currentPosition <= 10).length;
    const top20   = allKeywords.filter((k) => k.currentPosition <= 20).length;
    const improved = allKeywords.filter((k) => k.keywordStatus === "improved").length;
    const declined = allKeywords.filter((k) => k.keywordStatus === "declined").length;
    const avgPos  = Math.round(
      allKeywords.reduce((s, k) => s + (k.currentPosition > 0 ? k.currentPosition : 0), 0) /
      (allKeywords.filter((k) => k.currentPosition > 0).length || 1)
    );
    return { total, top3, top10, top20, improved, declined, avgPos };
  }, []);

  const totals = useMemo(() => ({
    traffic: filteredClients.reduce((s, c) => s + c.organicTraffic, 0),
    leads: filteredClients.reduce((s, c) => s + c.organicLeads, 0),
    qualified: filteredClients.reduce((s, c) => s + c.qualifiedLeads, 0),
    booked: filteredClients.reduce((s, c) => s + c.bookedLeads, 0),
    avgTechScore: Math.round(
      filteredClients.reduce((s, c) => s + c.techSeoScore, 0) / (filteredClients.length || 1)
    ),
    avgHealth: Math.round(
      filteredClients.reduce((s, c) => s + c.clientHealth, 0) / (filteredClients.length || 1)
    ),
  }), [filteredClients]);

  const compLabel = filters.comparison !== "none"? filters.comparison === "previousYear"? "vs Previous Year": `vs Previous ${DATE_RANGE_LABELS[filters.dateRange]}`
    : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: workspace.accentColor }}>
            SEO & Local
          </p>
          <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>
            SEO Performance
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
          <Link href="/seo-local/seo" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">
            ← SEO Dashboard
          </Link>
        </div>
      </div>

      {/* Filters */}
      <PerformanceFilters
        value={filters}
        onChange={setFilters}
        hideServiceFilter
        hideCampaignFilter
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <KpiCard
          title="Organic Traffic"value={totals.traffic.toLocaleString()}
          trend="up"trendValue="+12%"trendLabel={compLabel ?? "vs last period"}
          iconBg="var(--rtm-blue-light)"iconColor="var(--rtm-blue)"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>}
        />
        <KpiCard
          title="Organic Leads"value={totals.leads.toString()}
          trend="up"trendValue="+18%"trendLabel={compLabel ?? "vs last period"}
          iconBg="#ECFDF5"iconColor="#059669"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>}
        />
        <KpiCard
          title="Qualified Organic Leads"value={totals.qualified.toString()}
          trend="up"trendValue="+9%"trendLabel={compLabel ?? "vs last period"}
          iconBg="#F5F3FF"iconColor="#7C3AED"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        />
        <KpiCard
          title="Booked Leads"value={totals.booked.toString()}
          trend="up"trendValue="+22%"trendLabel={compLabel ?? "vs last period"}
          iconBg="#ECFDF5"iconColor="#059669"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>}
        />
        <KpiCard
          title="Avg Technical SEO Score"value={`${totals.avgTechScore}/100`}
          trend={totals.avgTechScore >= 85 ? "up": "down"}
          trendValue={totals.avgTechScore >= 85 ? "+3 pts": "-2 pts"}
          trendLabel={compLabel ?? "vs last period"}
          iconBg="#FFF7ED"iconColor="#EA580C"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
        />
        <KpiCard
          title="Avg Client Health Score"value={`${totals.avgHealth}/100`}
          trend={totals.avgHealth >= 80 ? "up": "down"}
          trendValue={totals.avgHealth >= 80 ? "+5 pts": "-3 pts"}
          trendLabel={compLabel ?? "vs last period"}
          iconBg="#ECFDF5"iconColor="#059669"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>}
        />
      </div>

      {/* Additional KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <KpiCard
          title="Keyword Rankings (Top 10)"value="142"trend="up"trendValue="+19"trendLabel={compLabel ?? "vs last period"}
          iconBg="var(--rtm-blue-light)"iconColor="var(--rtm-blue)"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/></svg>}
        />
        <KpiCard
          title="Ranking Movement (Avg)"value="+2.1 pos"trend="up"trendValue="+0.4"trendLabel={compLabel ?? "vs last period"}
          iconBg="#FFFBEB"iconColor="#D97706"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>}
        />
        <KpiCard
          title="Indexed Pages (Total)"value="420"trend="up"trendValue="+34"trendLabel={compLabel ?? "vs last period"}
          iconBg="#F5F3FF"iconColor="#7C3AED"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionWrapper
          title="Ranking Trend"description="Organic keywords in top 10 — last 12 months"className="lg:col-span-2">
          <MiniSparkline data={rankingTrendData}height={80} width={600} />
          <div className="mt-3 flex gap-2 text-xs"style={{ color: "var(--rtm-text-muted)"}}>
            {["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"].map((m) => (
              <span key={m} className="flex-1 text-center">{m}</span>
            ))}
          </div>
        </SectionWrapper>

        <SectionWrapper title="Technical Audit Summary"description="Average scores across all clients">
          <div className="space-y-3">
            {techAuditItems.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-medium"style={{ color: "var(--rtm-text-primary)"}}>{item.label}</span>
                  <span className="text-xs font-bold"style={{ color: "var(--rtm-text-secondary)"}}>{item.score}</span>
                </div>
                <ProgressBar value={item.score} max={100} height={5} color={item.color} />
              </div>
            ))}
          </div>
        </SectionWrapper>
      </div>

      {/* Client Performance Table */}
      <SectionWrapper
        title="Client SEO Performance"description={`${filteredClients.length} client${filteredClients.length !== 1 ? "s": ""} — ${DATE_RANGE_LABELS[filters.dateRange]}`}
        noPadding
        actions={
          <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>
            {filters.client !== "all"&& (
              <button
                className="text-blue-600 hover:underline mr-3"onClick={() => setFilters((f) => ({ ...f, client: "all"}))}
              >
                Clear filter
              </button>
            )}
            Mock data
          </span>
        }
      >
        <DataTable columns={columns} data={filteredClients} />
      </SectionWrapper>

      {/* 
          KEYWORD RANKING PERFORMANCE SECTION
          Future data source: Google Search Console + SEO rank tracking providers
          GSC fields: query, clicks, impressions, ctr, average_position,
                       landing_page, date
       */}
      <div className="pt-2">
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-lg font-bold"style={{ color: "var(--rtm-text-primary)"}}>
            Keyword Ranking Performance
          </h2>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-100">
            <svg className="w-3 h-3"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            GSC-ready · Mock Data
          </span>
        </div>
        <p className="text-sm mb-5"style={{ color: "var(--rtm-text-muted)"}}>
          Keyword position tracking across all clients. Future integration: Google Search Console &amp; rank tracking providers.
        </p>

        {/* Keyword KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 mb-5">
          {[
            { label: "Total Tracked",    value: keywordKpis.total,    color: "var(--rtm-blue)"},
            { label: "Top 3",            value: keywordKpis.top3,     color: "#059669"},
            { label: "Top 10",           value: keywordKpis.top10,    color: "#2563EB"},
            { label: "Top 20",           value: keywordKpis.top20,    color: "#7C3AED"},
            { label: "Improved",         value: keywordKpis.improved, color: "#059669"},
            { label: "Declined",         value: keywordKpis.declined, color: "#DC2626"},
            { label: "Avg Position",     value: `#${keywordKpis.avgPos}`, color: "#D97706"},
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-xl border p-3 flex flex-col gap-1"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}
            >
              <span className="text-[11px] font-medium"style={{ color: "var(--rtm-text-muted)"}}>
                {kpi.label}
              </span>
              <span className="text-xl font-bold"style={{ color: kpi.color }}>
                {kpi.value}
              </span>
            </div>
          ))}
        </div>

        {/* Keyword Trend Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
          <SectionWrapper title="Avg Position Trend"description="Lower is better — last 12 months">
            <MiniSparkline data={avgPositionTrend}height={60} width={300} />
            <div className="mt-2 flex gap-1 text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>
              {["J","J","A","S","O","N","D","J","F","M","A","M"].map((m, i) => (
                <span key={i} className="flex-1 text-center">{m}</span>
              ))}
            </div>
          </SectionWrapper>
          <SectionWrapper title="Top 10 Keyword Growth"description="Keywords entering top 10 — last 12 months">
            <MiniSparkline data={top10GrowthTrend}height={60} width={300} />
            <div className="mt-2 flex gap-1 text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>
              {["J","J","A","S","O","N","D","J","F","M","A","M"].map((m, i) => (
                <span key={i} className="flex-1 text-center">{m}</span>
              ))}
            </div>
          </SectionWrapper>
          <SectionWrapper title="Top 3 Keyword Growth"description="Keywords entering top 3 — last 12 months">
            <MiniSparkline data={top3GrowthTrend}height={60} width={300} />
            <div className="mt-2 flex gap-1 text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>
              {["J","J","A","S","O","N","D","J","F","M","A","M"].map((m, i) => (
                <span key={i} className="flex-1 text-center">{m}</span>
              ))}
            </div>
          </SectionWrapper>
        </div>

        {/* Keyword Filters + Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {/* Search box */}
          <div className="relative flex-1 max-w-xs">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"style={{ color: "var(--rtm-text-muted)"}}
              fill="none"stroke="currentColor"viewBox="0 0 24 24">
              <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"placeholder="Search keywords…"value={keywordSearch}
              onChange={(e) => setKeywordSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border outline-none"style={{
                background: "var(--rtm-surface)",
                borderColor: "var(--rtm-border)",
                color: "var(--rtm-text-primary)",
              }}
            />
          </div>

          {/* Location filter */}
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="text-sm rounded-lg border px-3 py-1.5 outline-none"style={{
              background: "var(--rtm-surface)",
              borderColor: "var(--rtm-border)",
              color: "var(--rtm-text-primary)",
            }}
          >
            {LOCATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Keyword position/status filter pills */}
          <div className="flex flex-wrap gap-1.5">
            {KEYWORD_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setKeywordFilter(f.value as KeywordFilter)}
                className="px-3 py-1 rounded-full text-xs font-semibold border transition-colors"style={
                  keywordFilter === f.value
                    ? { background: "var(--rtm-blue)", color: "#fff", borderColor: "var(--rtm-blue)"}
                    : { background: "var(--rtm-surface)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)"}
                }
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Keyword Ranking Table */}
        <SectionWrapper
          title="Keyword Rankings"description={`${filteredKeywords.length} keyword${filteredKeywords.length !== 1 ? "s": ""} — ${DATE_RANGE_LABELS[filters.dateRange]}`}
          noPadding
          actions={
            <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>
              Mock data · GSC-ready schema
            </span>
          }
        >
          <DataTable columns={keywordColumns} data={filteredKeywords} />
        </SectionWrapper>
      </div>

      {/* Quick Actions */}
      <SectionWrapper title="Quick Actions">
        <QuickActions actions={quickActions} cols={3} />
      </SectionWrapper>
    </div>
  );
}
