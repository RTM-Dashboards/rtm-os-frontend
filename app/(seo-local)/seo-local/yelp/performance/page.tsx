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

interface YelpListingRow extends Record<string, unknown> {
  client: string;
  location: string;
  calls: number;
  formSubmissions: number;
  leads: number;
  bookedLeads: number;
  profileViews: number;
  clicks: number;
  listingHealthScore: number;
  reviewVisibility: number;
  rating: number;
  status: string;
}

const allListings: YelpListingRow[] = [
  {
    client: "Apex Roofing Co.",
    location: "Denver, CO",
    calls: 38,
    formSubmissions: 14,
    leads: 52,
    bookedLeads: 11,
    profileViews: 1840,
    clicks: 312,
    listingHealthScore: 88,
    reviewVisibility: 82,
    rating: 4.7,
    status: "active",
  },
  {
    client: "Pacific Dental",
    location: "San Diego, CA",
    calls: 61,
    formSubmissions: 27,
    leads: 88,
    bookedLeads: 24,
    profileViews: 3210,
    clicks: 584,
    listingHealthScore: 96,
    reviewVisibility: 94,
    rating: 4.8,
    status: "claimed",
  },
  {
    client: "Harbor Auto Group",
    location: "Phoenix, AZ",
    calls: 22,
    formSubmissions: 8,
    leads: 30,
    bookedLeads: 5,
    profileViews: 980,
    clicks: 147,
    listingHealthScore: 72,
    reviewVisibility: 68,
    rating: 4.2,
    status: "active",
  },
  {
    client: "Summit Landscaping",
    location: "Denver, CO",
    calls: 14,
    formSubmissions: 4,
    leads: 18,
    bookedLeads: 3,
    profileViews: 620,
    clicks: 91,
    listingHealthScore: 66,
    reviewVisibility: 58,
    rating: 4.5,
    status: "active",
  },
  {
    client: "Metro Dental",
    location: "Denver, CO",
    calls: 8,
    formSubmissions: 2,
    leads: 10,
    bookedLeads: 1,
    profileViews: 340,
    clicks: 44,
    listingHealthScore: 52,
    reviewVisibility: 44,
    rating: 3.8,
    status: "active",
  },
  {
    client: "Blue Ridge Plumbing",
    location: "Asheville, NC",
    calls: 0,
    formSubmissions: 0,
    leads: 0,
    bookedLeads: 0,
    profileViews: 42,
    clicks: 6,
    listingHealthScore: 18,
    reviewVisibility: 12,
    rating: 0,
    status: "pending",
  },
];

const profileViewsTrend = [1200, 1340, 1280, 1520, 1640, 1780, 1690, 1920, 2040, 1980, 2180, 7032];
const leadsTrend = [88, 94, 91, 102, 108, 118, 112, 126, 133, 129, 142, 198];

const quickActions: QuickAction[] = [
  { label: "Optimize Listing",   description: "Fill missing sections",    icon: "", color: "bg-red-100 text-red-600"},
  { label: "Review Response",    description: "Reply to open reviews",    icon: "", color: "bg-amber-100 text-amber-600"},
  { label: "Photo Refresh",      description: "Update business photos",   icon: "", color: "bg-blue-100 text-blue-600"},
  { label: "Category Audit",     description: "Check Yelp categories",    icon: "", color: "bg-purple-100 text-purple-600"},
  { label: "Visibility Check",   description: "Rank in Yelp search",      icon: "", color: "bg-emerald-100 text-emerald-600"},
  { label: "Yelp Performance",   description: "Export client report",     icon: "", color: "bg-slate-100 text-slate-600"},
];

//  Columns 

const columns: Column<YelpListingRow>[] = [
  { key: "client",   header: "Client"},
  { key: "location", header: "Location", width: "140px"},
  { key: "calls",    header: "Calls",  width: "70px",
    render: (v) => <span className="font-semibold">{String(v)}</span> },
  { key: "formSubmissions", header: "Forms", width: "70px"},
  { key: "leads",    header: "Leads",  width: "70px",
    render: (v) => <span className="font-bold">{String(v)}</span> },
  { key: "bookedLeads", header: "Booked", width: "75px",
    render: (v) => <span className="font-bold text-emerald-600">{String(v)}</span> },
  { key: "profileViews", header: "Profile Views", width: "115px",
    render: (v) => <span className="font-semibold">{Number(v).toLocaleString()}</span> },
  { key: "clicks",   header: "Clicks", width: "75px"},
  { key: "listingHealthScore", header: "Health Score", width: "140px",
    render: (v) => {
      const n = Number(v);
      const color = n >= 85 ? "bg-emerald-500": n >= 65 ? "bg-amber-500": "bg-red-400";
      return <ProgressBar value={n} max={100} height={5} color={color} showLabel />;
    } },
  { key: "reviewVisibility", header: "Review Visibility", width: "150px",
    render: (v) => {
      const n = Number(v);
      const color = n >= 80 ? "bg-emerald-500": n >= 55 ? "bg-amber-500": "bg-red-400";
      return <ProgressBar value={n} max={100} height={5} color={color} showLabel />;
    } },
  { key: "rating", header: "Rating", width: "80px",
    render: (v) => {
      const n = Number(v);
      return n > 0 ? <span className="font-bold text-amber-500"> {n}</span> : <span style={{ color: "var(--rtm-text-muted)"}}>—</span>;
    } },
  { key: "status", header: "Status", width: "110px",
    render: (v) => {
      const map: Record<string, { variant: "success"| "info"| "warning"| "pending"; label: string }> = {
        active:  { variant: "success", label: "Active"},
        claimed: { variant: "success", label: "Claimed"},
        pending: { variant: "warning", label: "Pending"},
      };
      const c = map[String(v)] ?? { variant: "warning"as const, label: String(v) };
      return <StatusBadge variant={c.variant as "success"| "warning"| "info"} label={c.label} size="sm"/>;
    } },
];

//  Page 

export default function YelpPerformancePage() {
  const [filters, setFilters] = useState<PerformanceFilterState>(DEFAULT_FILTERS);

  const filteredListings = useMemo(() => {
    let rows = allListings;
    if (filters.client !== "all") {
      const map: Record<string, string> = {
        "apex-roofing": "Apex Roofing Co.",
        "pacific-dental": "Pacific Dental",
        "harbor-auto": "Harbor Auto Group",
        "summit-landscaping": "Summit Landscaping",
        "metro-dental": "Metro Dental",
        "blue-ridge-plumbing": "Blue Ridge Plumbing",
      };
      const name = map[filters.client];
      if (name) rows = rows.filter((r) => r.client === name);
    }
    if (filters.location !== "all") {
      const locMap: Record<string, string> = {
        denver: "Denver, CO",
        phoenix: "Phoenix, AZ",
        "san-diego": "San Diego, CA",
        asheville: "Asheville, NC",
      };
      const loc = locMap[filters.location];
      if (loc) rows = rows.filter((r) => r.location === loc);
    }
    return rows;
  }, [filters.client, filters.location]);

  const totals = useMemo(() => ({
    calls: filteredListings.reduce((s, r) => s + r.calls, 0),
    forms: filteredListings.reduce((s, r) => s + r.formSubmissions, 0),
    leads: filteredListings.reduce((s, r) => s + r.leads, 0),
    booked: filteredListings.reduce((s, r) => s + r.bookedLeads, 0),
    views: filteredListings.reduce((s, r) => s + r.profileViews, 0),
    clicks: filteredListings.reduce((s, r) => s + r.clicks, 0),
    avgHealth: Math.round(
      filteredListings.reduce((s, r) => s + r.listingHealthScore, 0) / (filteredListings.length || 1)
    ),
    avgReviewVisibility: Math.round(
      filteredListings.reduce((s, r) => s + r.reviewVisibility, 0) / (filteredListings.length || 1)
    ),
  }), [filteredListings]);

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
            Yelp Performance
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
          <Link href="/seo-local/yelp" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">
            ← Yelp Dashboard
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

      {/* KPI Cards – Row 1 */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Calls"value={totals.calls.toString()}
          trend="up"trendValue="+11%"trendLabel={compLabel ?? "vs last period"}
          iconBg="#ECFDF5"iconColor="#059669"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>}
        />
        <KpiCard
          title="Form Submissions"value={totals.forms.toString()}
          trend="up"trendValue="+8%"trendLabel={compLabel ?? "vs last period"}
          iconBg="var(--rtm-blue-light)"iconColor="var(--rtm-blue)"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>}
        />
        <KpiCard
          title="Leads"value={totals.leads.toString()}
          trend="up"trendValue="+13%"trendLabel={compLabel ?? "vs last period"}
          iconBg="#F5F3FF"iconColor="#7C3AED"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>}
        />
        <KpiCard
          title="Booked Leads"value={totals.booked.toString()}
          trend="up"trendValue="+17%"trendLabel={compLabel ?? "vs last period"}
          iconBg="#ECFDF5"iconColor="#059669"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>}
        />
      </div>

      {/* KPI Cards – Row 2 */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Profile Views"value={totals.views.toLocaleString()}
          trend="up"trendValue="+24%"trendLabel={compLabel ?? "vs last period"}
          iconBg="#FFFBEB"iconColor="#D97706"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>}
        />
        <KpiCard
          title="Clicks"value={totals.clicks.toLocaleString()}
          trend="up"trendValue="+19%"trendLabel={compLabel ?? "vs last period"}
          iconBg="var(--rtm-blue-light)"iconColor="var(--rtm-blue)"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"/></svg>}
        />
        <KpiCard
          title="Avg Listing Health Score"value={`${totals.avgHealth}/100`}
          trend={totals.avgHealth >= 70 ? "up": "down"}
          trendValue={totals.avgHealth >= 70 ? "+5 pts": "-3 pts"}
          trendLabel={compLabel ?? "vs last period"}
          iconBg="#ECFDF5"iconColor="#059669"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        />
        <KpiCard
          title="Avg Review Visibility"value={`${totals.avgReviewVisibility}/100`}
          trend={totals.avgReviewVisibility >= 65 ? "up": "down"}
          trendValue={totals.avgReviewVisibility >= 65 ? "+6 pts": "-4 pts"}
          trendLabel={compLabel ?? "vs last period"}
          iconBg="#FEF2F2"iconColor="#DC2626"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionWrapper title="Profile Views Trend"description="Total Yelp profile views — last 12 months">
          <MiniSparkline data={profileViewsTrend}height={80} width={500} />
          <div className="mt-3 flex gap-2 text-xs"style={{ color: "var(--rtm-text-muted)"}}>
            {["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"].map((m) => (
              <span key={m} className="flex-1 text-center">{m}</span>
            ))}
          </div>
        </SectionWrapper>

        <SectionWrapper title="Leads Trend"description="Total Yelp leads — last 12 months">
          <MiniSparkline data={leadsTrend}height={80} width={500} />
          <div className="mt-3 flex gap-2 text-xs"style={{ color: "var(--rtm-text-muted)"}}>
            {["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"].map((m) => (
              <span key={m} className="flex-1 text-center">{m}</span>
            ))}
          </div>
        </SectionWrapper>
      </div>

      {/* Listing Performance Table */}
      <SectionWrapper
        title="Listing Performance"description={`${filteredListings.length} listing${filteredListings.length !== 1 ? "s": ""} — ${DATE_RANGE_LABELS[filters.dateRange]}`}
        noPadding
        actions={
          <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>Mock data</span>
        }
      >
        <DataTable columns={columns} data={filteredListings} />
      </SectionWrapper>

      {/* Quick Actions */}
      <SectionWrapper title="Quick Actions">
        <QuickActions actions={quickActions} cols={3} />
      </SectionWrapper>
    </div>
  );
}
