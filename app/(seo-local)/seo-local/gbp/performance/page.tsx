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

// ── Mock Data ────────────────────────────────────────────────────────────────

interface GbpLocationRow extends Record<string, unknown> {
  client: string;
  location: string;
  calls: number;
  formSubmissions: number;
  websiteClicks: number;
  directionRequests: number;
  gbpLeads: number;
  bookedLeads: number;
  localVisibilityScore: number;
  reviewGrowth: number;
  reviewRating: number;
  status: string;
}

const allLocations: GbpLocationRow[] = [
  {
    client: "Apex Roofing Co.",
    location: "Denver, CO",
    calls: 84,
    formSubmissions: 31,
    websiteClicks: 412,
    directionRequests: 67,
    gbpLeads: 115,
    bookedLeads: 22,
    localVisibilityScore: 88,
    reviewGrowth: 14,
    reviewRating: 4.8,
    status: "top-performer",
  },
  {
    client: "Pacific Dental",
    location: "San Diego, CA",
    calls: 127,
    formSubmissions: 58,
    websiteClicks: 694,
    directionRequests: 112,
    gbpLeads: 185,
    bookedLeads: 41,
    localVisibilityScore: 96,
    reviewGrowth: 21,
    reviewRating: 4.9,
    status: "top-performer",
  },
  {
    client: "Harbor Auto Group",
    location: "Phoenix, AZ",
    calls: 53,
    formSubmissions: 18,
    websiteClicks: 287,
    directionRequests: 44,
    gbpLeads: 71,
    bookedLeads: 12,
    localVisibilityScore: 64,
    reviewGrowth: 6,
    reviewRating: 4.3,
    status: "needs-work",
  },
  {
    client: "Summit Landscaping",
    location: "Denver, CO",
    calls: 38,
    formSubmissions: 11,
    websiteClicks: 182,
    directionRequests: 29,
    gbpLeads: 49,
    bookedLeads: 9,
    localVisibilityScore: 74,
    reviewGrowth: 8,
    reviewRating: 4.7,
    status: "on-track",
  },
  {
    client: "Metro Dental",
    location: "Denver, CO",
    calls: 22,
    formSubmissions: 7,
    websiteClicks: 94,
    directionRequests: 16,
    gbpLeads: 29,
    bookedLeads: 4,
    localVisibilityScore: 48,
    reviewGrowth: 3,
    reviewRating: 4.1,
    status: "needs-work",
  },
  {
    client: "Blue Ridge Plumbing",
    location: "Asheville, NC",
    calls: 9,
    formSubmissions: 2,
    websiteClicks: 38,
    directionRequests: 7,
    gbpLeads: 11,
    bookedLeads: 1,
    localVisibilityScore: 24,
    reviewGrowth: 1,
    reviewRating: 0,
    status: "setting-up",
  },
];

// ── Profile Views Mock Data ──────────────────────────────────────────────────

interface ProfileViewsRow extends Record<string, unknown> {
  client: string;
  location: string;
  profileViews: number;
  searchViews: number;
  mapsViews: number;
  websiteClicks: number;
  calls: number;
  directionRequests: number;
  formSubmissions: number;
  bookedLeads: number;
  visibilityScore: number;
  changeVsPrev: number;
}

const allProfileViews: ProfileViewsRow[] = [
  {
    client: "Apex Roofing Co.",
    location: "Denver, CO",
    profileViews: 3840,
    searchViews: 2210,
    mapsViews: 1630,
    websiteClicks: 412,
    calls: 84,
    directionRequests: 67,
    formSubmissions: 31,
    bookedLeads: 22,
    visibilityScore: 88,
    changeVsPrev: 14,
  },
  {
    client: "Pacific Dental",
    location: "San Diego, CA",
    profileViews: 6720,
    searchViews: 4100,
    mapsViews: 2620,
    websiteClicks: 694,
    calls: 127,
    directionRequests: 112,
    formSubmissions: 58,
    bookedLeads: 41,
    visibilityScore: 96,
    changeVsPrev: 21,
  },
  {
    client: "Harbor Auto Group",
    location: "Phoenix, AZ",
    profileViews: 2180,
    searchViews: 1240,
    mapsViews: 940,
    websiteClicks: 287,
    calls: 53,
    directionRequests: 44,
    formSubmissions: 18,
    bookedLeads: 12,
    visibilityScore: 64,
    changeVsPrev: -3,
  },
  {
    client: "Summit Landscaping",
    location: "Denver, CO",
    profileViews: 1560,
    searchViews: 910,
    mapsViews: 650,
    websiteClicks: 182,
    calls: 38,
    directionRequests: 29,
    formSubmissions: 11,
    bookedLeads: 9,
    visibilityScore: 74,
    changeVsPrev: 8,
  },
  {
    client: "Metro Dental",
    location: "Denver, CO",
    profileViews: 870,
    searchViews: 490,
    mapsViews: 380,
    websiteClicks: 94,
    calls: 22,
    directionRequests: 16,
    formSubmissions: 7,
    bookedLeads: 4,
    visibilityScore: 48,
    changeVsPrev: -5,
  },
  {
    client: "Blue Ridge Plumbing",
    location: "Asheville, NC",
    profileViews: 280,
    searchViews: 160,
    mapsViews: 120,
    websiteClicks: 38,
    calls: 9,
    directionRequests: 7,
    formSubmissions: 2,
    bookedLeads: 1,
    visibilityScore: 24,
    changeVsPrev: 2,
  },
];

const profileViewsTrend = [11200, 11800, 12100, 12600, 13000, 13500, 13200, 14100, 14600, 15000, 15450, 15900];

// ── Google Posts Mock Data ───────────────────────────────────────────────────
// Future feature: users will upload/schedule Google Posts and Images per GBP

interface GooglePostRow extends Record<string, unknown> {
  client: string;
  location: string;
  postTitle: string;
  postType: string;
  publishDate: string;
  postStatus: string;
  views: number;
  clicks: number;
  engagementRate: number;
  cta: string;
  imageAttached: boolean;
  approvalStatus: string;
}

const allGooglePosts: GooglePostRow[] = [
  {
    client: "Apex Roofing Co.",
    location: "Denver, CO",
    postTitle: "Spring Roof Inspection Special — 20% Off",
    postType: "Offer",
    publishDate: "2025-05-10",
    postStatus: "published",
    views: 1420,
    clicks: 87,
    engagementRate: 6.1,
    cta: "Book Now",
    imageAttached: true,
    approvalStatus: "approved",
  },
  {
    client: "Pacific Dental",
    location: "San Diego, CA",
    postTitle: "New Patient Special: Free Consultation",
    postType: "Offer",
    publishDate: "2025-05-14",
    postStatus: "published",
    views: 2840,
    clicks: 194,
    engagementRate: 6.8,
    cta: "Book Appointment",
    imageAttached: true,
    approvalStatus: "approved",
  },
  {
    client: "Harbor Auto Group",
    location: "Phoenix, AZ",
    postTitle: "Memorial Day Weekend Sales Event",
    postType: "Event",
    publishDate: "2025-05-24",
    postStatus: "scheduled",
    views: 0,
    clicks: 0,
    engagementRate: 0,
    cta: "Learn More",
    imageAttached: true,
    approvalStatus: "approved",
  },
  {
    client: "Summit Landscaping",
    location: "Denver, CO",
    postTitle: "Summer Lawn Care Package — Limited Spots",
    postType: "Offer",
    publishDate: "2025-05-08",
    postStatus: "published",
    views: 760,
    clicks: 42,
    engagementRate: 5.5,
    cta: "Call Now",
    imageAttached: false,
    approvalStatus: "approved",
  },
  {
    client: "Metro Dental",
    location: "Denver, CO",
    postTitle: "Invisalign Consultation — No Cost",
    postType: "Offer",
    publishDate: "",
    postStatus: "needs-approval",
    views: 0,
    clicks: 0,
    engagementRate: 0,
    cta: "Book Now",
    imageAttached: true,
    approvalStatus: "pending",
  },
  {
    client: "Blue Ridge Plumbing",
    location: "Asheville, NC",
    postTitle: "What to Do When a Pipe Bursts",
    postType: "Update",
    publishDate: "2025-04-15",
    postStatus: "expired",
    views: 220,
    clicks: 11,
    engagementRate: 5.0,
    cta: "Learn More",
    imageAttached: false,
    approvalStatus: "approved",
  },
  {
    client: "Pacific Dental",
    location: "San Diego, CA",
    postTitle: "5-Star Review Spotlight — May",
    postType: "Update",
    publishDate: "",
    postStatus: "draft",
    views: 0,
    clicks: 0,
    engagementRate: 0,
    cta: "None",
    imageAttached: false,
    approvalStatus: "not-submitted",
  },
];

const visibilityTrend    = [52, 55, 57, 59, 62, 63, 66, 68, 70, 72, 74, 76];
const reviewGrowthTrend  = [12, 14, 17, 16, 18, 21, 24, 22, 26, 28, 30, 53];
const postViewsTrend     = [820, 980, 1120, 1340, 1580, 1720, 1900, 2100, 2280, 2460, 2640, 2840];

const quickActions: QuickAction[] = [
  { label: "Optimize GBP Profile", description: "Fill missing fields",   icon: "📍", color: "bg-blue-100 text-blue-600" },
  { label: "Review Request",        description: "Send review links",     icon: "⭐", color: "bg-amber-100 text-amber-600" },
  { label: "Q&A Sweep",             description: "Answer open questions", color: "bg-purple-100 text-purple-600" },
  { label: "Photo Upload",          description: "Add fresh photos",      icon: "📸", color: "bg-emerald-100 text-emerald-600" },
  { label: "Post Content",          description: "GBP weekly post",       icon: "📝", color: "bg-slate-100 text-slate-600" },
  { label: "Visibility Report",     description: "Client-ready PDF",      icon: "📊", color: "bg-red-100 text-red-600" },
];

// ── Columns ──────────────────────────────────────────────────────────────────

const locationColumns: Column<GbpLocationRow>[] = [
  { key: "client",   header: "Client" },
  { key: "location", header: "Location", width: "140px" },
  { key: "calls",    header: "Calls",    width: "80px",
    render: (v) => <span className="font-semibold">{String(v)}</span> },
  { key: "formSubmissions", header: "Forms", width: "75px" },
  { key: "websiteClicks",   header: "Site Clicks", width: "100px" },
  { key: "directionRequests", header: "Directions", width: "100px" },
  { key: "gbpLeads",  header: "GBP Leads", width: "95px",
    render: (v) => <span className="font-bold">{String(v)}</span> },
  { key: "bookedLeads", header: "Booked", width: "80px",
    render: (v) => <span className="font-bold text-emerald-600">{String(v)}</span> },
  { key: "localVisibilityScore", header: "Visibility", width: "140px",
    render: (v) => {
      const n = Number(v);
      const color = n >= 80 ? "bg-emerald-500" : n >= 60 ? "bg-amber-500" : "bg-red-400";
      return <ProgressBar value={n} max={100} height={5} color={color} showLabel />;
    } },
  { key: "reviewGrowth", header: "New Reviews", width: "105px",
    render: (v) => <span className="text-amber-600 font-semibold">+{String(v)}</span> },
  { key: "reviewRating", header: "Rating", width: "80px",
    render: (v) => {
      const n = Number(v);
      return n > 0 ? <span className="font-bold text-amber-500">★ {n}</span> : <span style={{ color: "var(--rtm-text-muted)" }}>—</span>;
    } },
  { key: "status", header: "Status", width: "130px",
    render: (v) => {
      const map: Record<string, { variant: "success" | "warning" | "info"; label: string }> = {
        "top-performer": { variant: "success", label: "Top Performer" },
        "on-track":      { variant: "success", label: "On Track" },
        "needs-work":    { variant: "warning", label: "Needs Work" },
        "setting-up":    { variant: "info",    label: "Setting Up" },
      };
      const c = map[String(v)] ?? { variant: "warning" as const, label: String(v) };
      return <StatusBadge variant={c.variant} label={c.label} size="sm" />;
    } },
];

const profileViewsColumns: Column<ProfileViewsRow>[] = [
  { key: "client",   header: "Client" },
  { key: "location", header: "Location", width: "130px",
    render: (v) => <span className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{String(v)}</span> },
  { key: "profileViews", header: "Profile Views", width: "110px",
    render: (v) => <span className="font-bold">{Number(v).toLocaleString()}</span> },
  { key: "searchViews", header: "Search Views", width: "105px",
    render: (v) => <span className="font-semibold">{Number(v).toLocaleString()}</span> },
  { key: "mapsViews", header: "Maps Views", width: "95px",
    render: (v) => <span className="font-semibold">{Number(v).toLocaleString()}</span> },
  { key: "websiteClicks", header: "Site Clicks", width: "95px",
    render: (v) => <span className="text-blue-600 font-semibold">{Number(v).toLocaleString()}</span> },
  { key: "calls", header: "Calls", width: "70px",
    render: (v) => <span className="font-semibold">{String(v)}</span> },
  { key: "directionRequests", header: "Directions", width: "90px" },
  { key: "formSubmissions", header: "Forms", width: "70px" },
  { key: "bookedLeads", header: "Booked", width: "75px",
    render: (v) => <span className="font-bold text-emerald-600">{String(v)}</span> },
  { key: "visibilityScore", header: "Visibility", width: "130px",
    render: (v) => {
      const n = Number(v);
      const color = n >= 80 ? "bg-emerald-500" : n >= 60 ? "bg-amber-500" : "bg-red-400";
      return <ProgressBar value={n} max={100} height={5} color={color} showLabel />;
    } },
  { key: "changeVsPrev", header: "vs Prev Period", width: "110px",
    render: (v) => {
      const n = Number(v);
      const color = n > 0 ? "text-emerald-600" : n < 0 ? "text-red-500" : "text-slate-400";
      const label = n > 0 ? `+${n}%` : n < 0 ? `${n}%` : "—";
      return <span className={`font-semibold text-sm ${color}`}>{label}</span>;
    } },
];

const googlePostsColumns: Column<GooglePostRow>[] = [
  { key: "client", header: "Client" },
  { key: "location", header: "Location", width: "125px",
    render: (v) => <span className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{String(v)}</span> },
  { key: "postTitle", header: "Post Title",
    render: (v) => <span className="font-medium text-sm line-clamp-1" title={String(v)}>{String(v)}</span> },
  { key: "postType", header: "Type", width: "90px",
    render: (v) => {
      const map: Record<string, string> = {
        Offer: "bg-emerald-100 text-emerald-700",
        Event: "bg-purple-100 text-purple-700",
        Update: "bg-blue-100 text-blue-700",
      };
      const cls = map[String(v)] ?? "bg-slate-100 text-slate-600";
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${cls}`}>
          {String(v)}
        </span>
      );
    } },
  { key: "publishDate", header: "Publish Date", width: "115px",
    render: (v) => {
      const s = String(v);
      return s
        ? <span className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{s}</span>
        : <span className="text-xs text-slate-400">—</span>;
    } },
  { key: "postStatus", header: "Status", width: "120px",
    render: (v) => {
      const map: Record<string, { variant: "success" | "warning" | "info" | "error"; label: string }> = {
        published:       { variant: "success", label: "Published" },
        scheduled:       { variant: "info",    label: "Scheduled" },
        draft:           { variant: "info",    label: "Draft" },
        "needs-approval":{ variant: "warning", label: "Needs Approval" },
        expired:         { variant: "error",   label: "Expired" },
      };
      const c = map[String(v)] ?? { variant: "info" as const, label: String(v) };
      return <StatusBadge variant={c.variant} label={c.label} size="sm" />;
    } },
  { key: "views", header: "Views", width: "70px",
    render: (v) => <span className="font-semibold">{Number(v).toLocaleString()}</span> },
  { key: "clicks", header: "Clicks", width: "65px",
    render: (v) => <span className="font-semibold text-blue-600">{Number(v).toLocaleString()}</span> },
  { key: "engagementRate", header: "Eng. Rate", width: "90px",
    render: (v) => {
      const n = Number(v);
      if (n === 0) return <span className="text-slate-400 text-xs">—</span>;
      const color = n >= 6 ? "text-emerald-600" : n >= 4 ? "text-amber-600" : "text-slate-500";
      return <span className={`font-semibold text-sm ${color}`}>{n.toFixed(1)}%</span>;
    } },
  { key: "cta", header: "CTA", width: "100px",
    render: (v) => {
      const s = String(v);
      if (s === "None") return <span className="text-slate-400 text-xs">—</span>;
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
          {s}
        </span>
      );
    } },
  { key: "imageAttached", header: "Image", width: "70px",
    render: (v) =>
      v ? <span className="text-emerald-500 text-sm">✓</span> : <span className="text-slate-300 text-sm">—</span> },
  { key: "approvalStatus", header: "Approval", width: "110px",
    render: (v) => {
      const map: Record<string, { variant: "success" | "warning" | "info"; label: string }> = {
        approved:      { variant: "success", label: "Approved" },
        pending:       { variant: "warning", label: "Pending" },
        "not-submitted":{ variant: "info",   label: "Not Submitted" },
      };
      const c = map[String(v)] ?? { variant: "info" as const, label: String(v) };
      return <StatusBadge variant={c.variant} label={c.label} size="sm" />;
    } },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function GbpPerformancePage() {
  const [filters, setFilters] = useState<PerformanceFilterState>(DEFAULT_FILTERS);

  const filteredLocations = useMemo(() => {
    let rows = allLocations;
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

  const filteredProfileViews = useMemo(() => {
    let rows = allProfileViews;
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
    calls: filteredLocations.reduce((s, r) => s + r.calls, 0),
    forms: filteredLocations.reduce((s, r) => s + r.formSubmissions, 0),
    clicks: filteredLocations.reduce((s, r) => s + r.websiteClicks, 0),
    directions: filteredLocations.reduce((s, r) => s + r.directionRequests, 0),
    leads: filteredLocations.reduce((s, r) => s + r.gbpLeads, 0),
    booked: filteredLocations.reduce((s, r) => s + r.bookedLeads, 0),
    reviewGrowth: filteredLocations.reduce((s, r) => s + r.reviewGrowth, 0),
    avgVisibility: Math.round(
      filteredLocations.reduce((s, r) => s + r.localVisibilityScore, 0) / (filteredLocations.length || 1)
    ),
  }), [filteredLocations]);

  const profileViewsTotals = useMemo(() => ({
    totalViews:   filteredProfileViews.reduce((s, r) => s + r.profileViews, 0),
    searchViews:  filteredProfileViews.reduce((s, r) => s + r.searchViews, 0),
    mapsViews:    filteredProfileViews.reduce((s, r) => s + r.mapsViews, 0),
    websiteClicks: filteredProfileViews.reduce((s, r) => s + r.websiteClicks, 0),
    calls:         filteredProfileViews.reduce((s, r) => s + r.calls, 0),
    directions:    filteredProfileViews.reduce((s, r) => s + r.directionRequests, 0),
    forms:         filteredProfileViews.reduce((s, r) => s + r.formSubmissions, 0),
    booked:        filteredProfileViews.reduce((s, r) => s + r.bookedLeads, 0),
  }), [filteredProfileViews]);

  const postKpis = useMemo(() => {
    const published      = allGooglePosts.filter((p) => p.postStatus === "published").length;
    const scheduled      = allGooglePosts.filter((p) => p.postStatus === "scheduled").length;
    const needsApproval  = allGooglePosts.filter((p) => p.postStatus === "needs-approval").length;
    const totalViews     = allGooglePosts.reduce((s, p) => s + p.views, 0);
    const totalClicks    = allGooglePosts.reduce((s, p) => s + p.clicks, 0);
    const expired        = allGooglePosts.filter((p) => p.postStatus === "expired").length;
    const liveEngRates   = allGooglePosts.filter((p) => p.engagementRate > 0);
    const avgEngRate     = liveEngRates.length
      ? liveEngRates.reduce((s, p) => s + p.engagementRate, 0) / liveEngRates.length
      : 0;
    const topPost = [...allGooglePosts].sort((a, b) => b.views - a.views)[0];
    return { published, scheduled, needsApproval, totalViews, totalClicks, expired, avgEngRate, topPost };
  }, []);

  const compLabel = filters.comparison !== "none"
    ? filters.comparison === "previousYear" ? "vs Previous Year"
      : `vs Previous ${DATE_RANGE_LABELS[filters.dateRange]}`
    : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>
            SEO & Local
          </p>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
            GBP Performance
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
          <Link href="/seo-local/gbp" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">
            ← GBP Dashboard
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
          title="Calls"
          value={totals.calls.toString()}
          trend="up"
          trendValue="+14%"
          trendLabel={compLabel ?? "vs last period"}
          iconBg="#ECFDF5"
          iconColor="#059669"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
        />
        <KpiCard
          title="Form Submissions"
          value={totals.forms.toString()}
          trend="up"
          trendValue="+9%"
          trendLabel={compLabel ?? "vs last period"}
          iconBg="var(--rtm-blue-light)"
          iconColor="var(--rtm-blue)"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
        <KpiCard
          title="Website Clicks"
          value={totals.clicks.toLocaleString()}
          trend="up"
          trendValue="+21%"
          trendLabel={compLabel ?? "vs last period"}
          iconBg="#F5F3FF"
          iconColor="#7C3AED"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>}
        />
        <KpiCard
          title="Direction Requests"
          value={totals.directions.toString()}
          trend="up"
          trendValue="+7%"
          trendLabel={compLabel ?? "vs last period"}
          iconBg="#FFFBEB"
          iconColor="#D97706"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
      </div>

      {/* KPI Cards – Row 2 */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="GBP Leads"
          value={totals.leads.toString()}
          trend="up"
          trendValue="+16%"
          trendLabel={compLabel ?? "vs last period"}
          iconBg="#ECFDF5"
          iconColor="#059669"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
        />
        <KpiCard
          title="Booked Leads"
          value={totals.booked.toString()}
          trend="up"
          trendValue="+19%"
          trendLabel={compLabel ?? "vs last period"}
          iconBg="#ECFDF5"
          iconColor="#059669"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
        />
        <KpiCard
          title="Avg Local Visibility Score"
          value={`${totals.avgVisibility}/100`}
          trend={totals.avgVisibility >= 70 ? "up" : "down"}
          trendValue={totals.avgVisibility >= 70 ? "+4 pts" : "-2 pts"}
          trendLabel={compLabel ?? "vs last period"}
          iconBg="var(--rtm-blue-light)"
          iconColor="var(--rtm-blue)"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
        />
        <KpiCard
          title="Review Growth (Total)"
          value={`+${totals.reviewGrowth}`}
          trend="up"
          trendValue="+11 MoM"
          trendLabel={compLabel ?? "vs last period"}
          iconBg="#FFFBEB"
          iconColor="#D97706"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionWrapper title="Local Visibility Trend" description="Average visibility score — last 12 months">
          <MiniSparkline data={visibilityTrend} color="#2563EB" height={80} width={500} />
          <div className="mt-3 flex gap-2 text-xs" style={{ color: "var(--rtm-text-muted)" }}>
            {["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"].map((m) => (
              <span key={m} className="flex-1 text-center">{m}</span>
            ))}
          </div>
        </SectionWrapper>

        <SectionWrapper title="Review Growth Trend" description="New reviews per month — last 12 months">
          <MiniSparkline data={reviewGrowthTrend} color="#D97706" height={80} width={500} />
          <div className="mt-3 flex gap-2 text-xs" style={{ color: "var(--rtm-text-muted)" }}>
            {["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"].map((m) => (
              <span key={m} className="flex-1 text-center">{m}</span>
            ))}
          </div>
        </SectionWrapper>
      </div>

      {/* Location Performance Table */}
      <SectionWrapper
        title="Location GBP Performance"
        description={`${filteredLocations.length} location${filteredLocations.length !== 1 ? "s" : ""} — ${DATE_RANGE_LABELS[filters.dateRange]}`}
        noPadding
        actions={
          <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>Mock data</span>
        }
      >
        <DataTable columns={locationColumns} data={filteredLocations} />
      </SectionWrapper>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1: PROFILE VIEWS PERFORMANCE
      ════════════════════════════════════════════════════════════════ */}
      <div className="pt-2">
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-lg font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            Profile Views Performance
          </h2>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-100">
            Mock Data
          </span>
        </div>
        <p className="text-sm mb-5" style={{ color: "var(--rtm-text-muted)" }}>
          How customers are finding and interacting with Google Business Profiles across all locations.
        </p>

        {/* Profile View KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <KpiCard
            title="Total Profile Views"
            value={profileViewsTotals.totalViews.toLocaleString()}
            trend="up"
            trendValue="+18%"
            trendLabel={compLabel ?? "vs last period"}
            iconBg="var(--rtm-blue-light)"
            iconColor="var(--rtm-blue)"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
          />
          <KpiCard
            title="Search Views"
            value={profileViewsTotals.searchViews.toLocaleString()}
            trend="up"
            trendValue="+15%"
            trendLabel={compLabel ?? "vs last period"}
            iconBg="#F5F3FF"
            iconColor="#7C3AED"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
          />
          <KpiCard
            title="Maps Views"
            value={profileViewsTotals.mapsViews.toLocaleString()}
            trend="up"
            trendValue="+22%"
            trendLabel={compLabel ?? "vs last period"}
            iconBg="#FFFBEB"
            iconColor="#D97706"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>}
          />
          <KpiCard
            title="Website Clicks"
            value={profileViewsTotals.websiteClicks.toLocaleString()}
            trend="up"
            trendValue="+21%"
            trendLabel={compLabel ?? "vs last period"}
            iconBg="#ECFDF5"
            iconColor="#059669"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <KpiCard
            title="Calls"
            value={profileViewsTotals.calls.toString()}
            trend="up"
            trendValue="+14%"
            trendLabel={compLabel ?? "vs last period"}
            iconBg="#ECFDF5"
            iconColor="#059669"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
          />
          <KpiCard
            title="Direction Requests"
            value={profileViewsTotals.directions.toString()}
            trend="up"
            trendValue="+7%"
            trendLabel={compLabel ?? "vs last period"}
            iconBg="#FFFBEB"
            iconColor="#D97706"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          />
          <KpiCard
            title="Form Submissions"
            value={profileViewsTotals.forms.toString()}
            trend="up"
            trendValue="+9%"
            trendLabel={compLabel ?? "vs last period"}
            iconBg="var(--rtm-blue-light)"
            iconColor="var(--rtm-blue)"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          />
          <KpiCard
            title="Booked Leads"
            value={profileViewsTotals.booked.toString()}
            trend="up"
            trendValue="+19%"
            trendLabel={compLabel ?? "vs last period"}
            iconBg="#ECFDF5"
            iconColor="#059669"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          />
        </div>

        {/* Profile View Trend */}
        <div className="mb-5">
          <SectionWrapper title="Profile View Trend" description="Total profile views across all locations — last 12 months">
            <MiniSparkline data={profileViewsTrend} color="#7C3AED" height={80} width={700} />
            <div className="mt-3 flex gap-2 text-xs" style={{ color: "var(--rtm-text-muted)" }}>
              {["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"].map((m) => (
                <span key={m} className="flex-1 text-center">{m}</span>
              ))}
            </div>
          </SectionWrapper>
        </div>

        {/* Profile Views Table */}
        <SectionWrapper
          title="Profile Views by Location"
          description={`${filteredProfileViews.length} location${filteredProfileViews.length !== 1 ? "s" : ""} — ${DATE_RANGE_LABELS[filters.dateRange]}`}
          noPadding
          actions={
            <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>Mock data</span>
          }
        >
          <DataTable columns={profileViewsColumns} data={filteredProfileViews} />
        </SectionWrapper>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2: GOOGLE POSTS PERFORMANCE
          Future feature: users will upload/schedule Google Posts and
          Images per GBP location. Mock data only for now.
      ════════════════════════════════════════════════════════════════ */}
      <div className="pt-2">
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-lg font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            Google Posts Performance
          </h2>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
            Mock Data
          </span>
        </div>
        <p className="text-sm mb-5" style={{ color: "var(--rtm-text-muted)" }}>
          Track Google Post engagement across all client profiles. Future feature: direct post creation &amp; scheduling from this dashboard.
        </p>

        {/* Posts KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <KpiCard
            title="Posts Published"
            value={postKpis.published.toString()}
            trend="up"
            trendValue="+2"
            trendLabel={compLabel ?? "vs last period"}
            iconBg="#ECFDF5"
            iconColor="#059669"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <KpiCard
            title="Scheduled Posts"
            value={postKpis.scheduled.toString()}
            trend="up"
            trendValue="+1"
            trendLabel={compLabel ?? "vs last period"}
            iconBg="var(--rtm-blue-light)"
            iconColor="var(--rtm-blue)"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <KpiCard
            title="Needs Approval"
            value={postKpis.needsApproval.toString()}
            trend={postKpis.needsApproval > 0 ? "down" : "neutral"}
            trendValue={postKpis.needsApproval > 0 ? "Action needed" : "All clear"}
            trendLabel=""
            iconBg="#FFFBEB"
            iconColor="#D97706"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
          />
          <KpiCard
            title="Expired Posts"
            value={postKpis.expired.toString()}
            trend="down"
            trendValue="Needs refresh"
            trendLabel=""
            iconBg="#FEF2F2"
            iconColor="#DC2626"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <KpiCard
            title="Total Post Views"
            value={postKpis.totalViews.toLocaleString()}
            trend="up"
            trendValue="+24%"
            trendLabel={compLabel ?? "vs last period"}
            iconBg="var(--rtm-blue-light)"
            iconColor="var(--rtm-blue)"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
          />
          <KpiCard
            title="Total Post Clicks"
            value={postKpis.totalClicks.toLocaleString()}
            trend="up"
            trendValue="+18%"
            trendLabel={compLabel ?? "vs last period"}
            iconBg="#ECFDF5"
            iconColor="#059669"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" /></svg>}
          />
          <KpiCard
            title="Avg Engagement Rate"
            value={`${postKpis.avgEngRate.toFixed(1)}%`}
            trend="up"
            trendValue="+0.8%"
            trendLabel={compLabel ?? "vs last period"}
            iconBg="#F5F3FF"
            iconColor="#7C3AED"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
          />
          <div
            className="rounded-xl border p-4 flex flex-col gap-1"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
          >
            <span className="text-xs font-medium" style={{ color: "var(--rtm-text-muted)" }}>Top Performing Post</span>
            <span className="text-sm font-bold leading-tight mt-1" style={{ color: "var(--rtm-text-primary)" }}>
              {postKpis.topPost?.postTitle ?? "—"}
            </span>
            <span className="text-xs mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
              {postKpis.topPost?.views.toLocaleString()} views · {postKpis.topPost?.client}
            </span>
          </div>
        </div>

        {/* Post Views Trend */}
        <div className="mb-5">
          <SectionWrapper title="Post Views Trend" description="Monthly post views — last 12 months">
            <MiniSparkline data={postViewsTrend} color="#059669" height={70} width={700} />
            <div className="mt-3 flex gap-2 text-xs" style={{ color: "var(--rtm-text-muted)" }}>
              {["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"].map((m) => (
                <span key={m} className="flex-1 text-center">{m}</span>
              ))}
            </div>
          </SectionWrapper>
        </div>

        {/* Google Posts Table */}
        <SectionWrapper
          title="Google Posts by Location"
          description={`${allGooglePosts.length} posts — ${DATE_RANGE_LABELS[filters.dateRange]}`}
          noPadding
          actions={
            <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>Mock data · Future GBP integration</span>
          }
        >
          <DataTable columns={googlePostsColumns} data={allGooglePosts} />
        </SectionWrapper>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3: GOOGLE POSTS & IMAGES UPLOAD (Coming Soon)
          Frontend-only placeholder for future GBP integration.
      ════════════════════════════════════════════════════════════════ */}
      <div
        className="rounded-2xl border-2 border-dashed p-6"
        style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-surface-subtle, var(--rtm-surface))" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">📸</span>
              <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                Google Posts &amp; Images Upload
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                Coming Soon
              </span>
            </div>
            <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
              Future feature: create, schedule, and submit Google Posts and Images directly per Google Business Profile location.
              This is a <strong>mock UI placeholder</strong> — buttons are non-functional.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Create Google Post", icon: "✏️", color: "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100" },
            { label: "Upload Image",       icon: "🖼️", color: "bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100" },
            { label: "Schedule Post",      icon: "📅", color: "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100" },
            { label: "Submit for Approval",icon: "✅", color: "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100" },
          ].map((action) => (
            <button
              key={action.label}
              disabled
              title="Coming Soon — Mock UI"
              className={`flex flex-col items-center justify-center gap-2 rounded-xl border px-3 py-4 text-sm font-semibold cursor-not-allowed opacity-70 transition-colors ${action.color}`}
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-center leading-tight">{action.label}</span>
              <span className="text-[10px] font-normal opacity-60">Mock UI</span>
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs text-center" style={{ color: "var(--rtm-text-muted)" }}>
          🔒 These controls are non-functional frontend placeholders. Real Google Business Profile API integration is planned for a future release.
        </p>
      </div>

      {/* Quick Actions */}
      <SectionWrapper title="Quick Actions">
        <QuickActions actions={quickActions} cols={3} />
      </SectionWrapper>
    </div>
  );
}
