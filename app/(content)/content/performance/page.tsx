"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge, DataTable, QuickActions } from "@/components/ui";
import type { Column, QuickAction } from "@/components/ui";
import PerformanceFilters, {
  DEFAULT_FILTERS,
  type PerformanceFilterState,
} from "@/components/performance/PerformanceFilters";
import { getWorkspace } from "@/lib/workspaces";
import { useEnabledKpis } from "@/lib/hooks/useEnabledKpis";
import { useDepartmentUsers } from "@/lib/users/users-api";

const workspace = getWorkspace("content")!;

//  Types 

type PublishStatus = "Published"| "Draft"| "Scheduled"| "Unpublished";
type UploadStatus =
  | "Drafting"| "SEO Review"| "Client Approval"| "Ready To Upload"| "Uploaded"| "Indexed"| "Needs Revision"| "Blocked";
type PerformanceStatus = "Top Performer"| "Average"| "Low Performer"| "New";

interface ContentItem extends Record<string, unknown> {
  id: string;
  client: string;
  title: string;
  type: "Blog"| "Page"| "Landing Page"| "Service Page"| "Location Page";
  keyword: string;
  seoTask: string;
  publishStatus: PublishStatus;
  uploadStatus: UploadStatus;
  publishedUrl: string;
  pageViews: number;
  engagementTime: string;
  formSubmissions: number;
  calls: number;
  bookedLeads: number;
  performanceStatus: PerformanceStatus;
}

interface UploadItem extends Record<string, unknown> {
  id: string;
  client: string;
  seoTask: string;
  title: string;
  writer: string;
  seoOwner: string;
  uploadOwner: string;
  status: UploadStatus;
  cms: string;
  dueDate: string;
  uploadDate: string;
  blocker: string;
}

//  Data — not yet connected to a real source
//  When a CMS / analytics integration is available, populate these from the API.
//  All arrays are empty until then; the tables and filters are ready.

const contentItems: ContentItem[] = [];

/* placeholder — remove when real data lands
const _unusedContentItemShape: ContentItem = {
    id: "c1",
    client: "[example]",
    title: "[example title]",
    type: "Blog",
    keyword: "[example keyword]",
    seoTask: "SEO-0000",
    publishStatus: "Published",
    uploadStatus: "Indexed",
    publishedUrl: "",
    pageViews: 0,
    engagementTime: "—",
    formSubmissions: 0,
    calls: 0,
    bookedLeads: 0,
    performanceStatus: "New",
  },
*/


// Upload items not yet connected to a real source.
const uploadItems: UploadItem[] = [];

//  Status Maps 

function publishBadge(s: PublishStatus) {
  const map: Record<PublishStatus, { variant: "success"| "warning"| "info"| "neutral"; label: string }> = {
    Published:   { variant: "success", label: "Published"},
    Scheduled:   { variant: "info",    label: "Scheduled"},
    Draft:       { variant: "neutral", label: "Draft"},
    Unpublished: { variant: "warning", label: "Unpublished"},
  };
  const c = map[s];
  return <StatusBadge variant={c.variant} label={c.label} size="sm"/>;
}

function uploadBadge(s: UploadStatus) {
  const map: Record<UploadStatus, { variant: "success"| "warning"| "info"| "neutral"| "error"| "pending"; label: string }> = {
    Drafting:         { variant: "neutral", label: "Drafting"},
    "SEO Review":     { variant: "info",    label: "SEO Review"},
    "Client Approval":{ variant: "pending", label: "Client Approval"},
    "Ready To Upload":{ variant: "warning", label: "Ready To Upload"},
    Uploaded:         { variant: "info",    label: "Uploaded"},
    Indexed:          { variant: "success", label: "Indexed"},
    "Needs Revision": { variant: "error",   label: "Needs Revision"},
    Blocked:          { variant: "error",   label: "Blocked"},
  };
  const c = map[s];
  return <StatusBadge variant={c.variant} label={c.label} size="sm"/>;
}

function perfBadge(s: PerformanceStatus) {
  const map: Record<PerformanceStatus, { variant: "success"| "warning"| "info"| "neutral"; label: string }> = {
    "Top Performer": { variant: "success", label: "Top Performer"},
    Average:         { variant: "info",    label: "Average"},
    "Low Performer": { variant: "warning", label: "Low Performer"},
    New:             { variant: "neutral", label: "New"},
  };
  const c = map[s];
  return <StatusBadge variant={c.variant} label={c.label} size="sm"/>;
}

//  Columns 

const contentColumns: Column<ContentItem>[] = [
  { key: "client",         header: "Client",           width: "140px"},
  { key: "title",          header: "Content Title",    width: "240px", render: (v) => <span className="font-medium text-xs"style={{ color: "var(--rtm-text-primary)"}}>{String(v)}</span> },
  { key: "type",           header: "Type",             width: "110px"},
  { key: "keyword",        header: "Target Keyword",   width: "180px", render: (v) => <span className="text-xs font-mono px-1.5 py-0.5 rounded"style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)"}}>{String(v)}</span> },
  { key: "seoTask",        header: "SEO Task",         width: "90px",  render: (v) => <span className="text-xs font-semibold"style={{ color: "var(--rtm-blue)"}}>{String(v)}</span> },
  { key: "publishStatus",  header: "Publish Status",   width: "120px", render: (v) => publishBadge(v as PublishStatus) },
  { key: "uploadStatus",   header: "Upload Status",    width: "130px", render: (v) => uploadBadge(v as UploadStatus) },
  { key: "publishedUrl",   header: "Published URL",    width: "200px", render: (v) => v ? <a href={`https://${String(v)}`} target="_blank" rel="noopener noreferrer" className="text-xs underline truncate block max-w-[190px]" style={{ color: "var(--rtm-blue)" }}>{String(v)}</a> : <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>—</span> },
  { key: "pageViews",      header: "Page Views",       width: "90px",  render: (v) => <span className="text-xs font-semibold">{v ? Number(v).toLocaleString() : "—"}</span> },
  { key: "engagementTime", header: "Eng. Time",        width: "80px"},
  { key: "formSubmissions",header: "Forms",            width: "70px",  render: (v) => <span className="text-xs font-semibold">{String(v)}</span> },
  { key: "calls",          header: "Calls",            width: "60px",  render: (v) => <span className="text-xs font-semibold">{String(v)}</span> },
  { key: "bookedLeads",    header: "Booked",           width: "70px",  render: (v) => <span className="text-xs font-semibold"style={{ color: Number(v) > 0 ? "#059669": "var(--rtm-text-muted)"}}>{String(v)}</span> },
  { key: "performanceStatus", header: "Performance",   width: "130px", render: (v) => perfBadge(v as PerformanceStatus) },
];

const uploadColumns: Column<UploadItem>[] = [
  { key: "client",      header: "Client",         width: "140px"},
  { key: "seoTask",     header: "SEO Task",        width: "90px",  render: (v) => <span className="text-xs font-semibold"style={{ color: "var(--rtm-blue)"}}>{String(v)}</span> },
  { key: "title",       header: "Content Title",   width: "220px", render: (v) => <span className="font-medium text-xs"style={{ color: "var(--rtm-text-primary)"}}>{String(v)}</span> },
  { key: "writer",      header: "Writer",          width: "100px"},
  { key: "seoOwner",    header: "SEO Owner",       width: "100px"},
  { key: "uploadOwner", header: "Upload Owner",    width: "110px"},
  { key: "status",      header: "Status",          width: "140px", render: (v) => uploadBadge(v as UploadStatus) },
  { key: "cms",         header: "CMS / Platform",  width: "110px"},
  { key: "dueDate",     header: "Due Date",        width: "90px"},
  { key: "uploadDate",  header: "Upload Date",     width: "100px", render: (v) => <span className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{String(v) || "—"}</span> },
  { key: "blocker",     header: "Blocker",         width: "200px", render: (v) => v ? <span className="text-xs text-red-600">{String(v)}</span> : <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>—</span> },
];

//  Quick Actions 

const quickActions: QuickAction[] = [
  { label: "Add Content Item",        description: "Create a new content task",         icon: "", color: "bg-blue-50 text-blue-600",   disabled: true, disabledReason: "Not yet available — coming at launch" },
  { label: "Mark Uploaded",           description: "Update upload status to Uploaded",  icon: "", color: "bg-green-50 text-green-600", disabled: true, disabledReason: "Not yet available — coming at launch" },
  { label: "Request SEO Review",      description: "Send content to SEO team",          icon: "", color: "bg-purple-50 text-purple-600", disabled: true, disabledReason: "Not yet available — coming at launch" },
  { label: "Request Client Approval", description: "Send to client for sign-off",       icon: "", color: "bg-amber-50 text-amber-600",  disabled: true, disabledReason: "Not yet available — coming at launch" },
  { label: "Open SEO Task",           description: "Navigate to linked SEO task",       icon: "", color: "bg-sky-50 text-sky-600",     disabled: true, disabledReason: "Not yet available — coming at launch" },
  { label: "View Published URL",      description: "Open live page in browser",         icon: "", color: "bg-indigo-50 text-indigo-600", disabled: true, disabledReason: "Not yet available — coming at launch" },
];

//  KPI Data — not yet connected; arrays are empty.
//  When a CMS/analytics integration lands, populate these from the API.

type KpiItem = { kpiId: string; title: string; value: string; trend: "up"|"down"|"neutral"; trendValue: string; iconBg: string; iconColor: string };
const kpiData: KpiItem[] = [];

const engagementMetrics: { label: string; value: string; sub: string }[] = [];

const uploadStatusSummary: { label: string; value: string; color: string }[] = [];

//  Top / Low Performing 

const topContent = contentItems.filter((c) => c.performanceStatus === "Top Performer");
const lowContent = contentItems.filter((c) => c.performanceStatus === "Low Performer");

//  Extra content filter state 

type ExtraFilterState = {
  contentType: string;
  uploadStatus: string;
  seoOwner: string;
  writer: string;
};

const DEFAULT_EXTRA: ExtraFilterState = {
  contentType: "all",
  uploadStatus: "all",
  seoOwner: "all",
  writer: "all",
};

//  Component 

export default function ContentPerformancePage() {
  const [filters, setFilters] = useState<PerformanceFilterState>(DEFAULT_FILTERS);
  const [extra, setExtra] = useState<ExtraFilterState>(DEFAULT_EXTRA);
  const [activeTab, setActiveTab] = useState<"engagement"| "upload">("engagement");
  const { isEnabled } = useEnabledKpis("content");
  const { users: contentUsers, loading: contentLoading, error: contentError } =
    useDepartmentUsers("Content");

  const enabledKpiData = kpiData.filter((k) => isEnabled(k.kpiId));

  const setExtra_ = <K extends keyof ExtraFilterState>(k: K, v: ExtraFilterState[K]) =>
    setExtra((prev) => ({ ...prev, [k]: v }));

  const selectCls =
    "text-xs font-medium rounded-lg border px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const selectStyle = {
    background: "var(--rtm-surface)",
    borderColor: "var(--rtm-border)",
    color: "var(--rtm-text-primary)",
    minWidth: 120,
  } as React.CSSProperties;

  return (
    <div className="space-y-6">

      {/*  Header  */}
      <div>
        <p
          className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: workspace.accentColor }}
        >
          {workspace.name}
        </p>
        <h1
          className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}
        >
          Content Performance
        </h1>
        <p className="text-sm mt-1"style={{ color: "var(--rtm-text-secondary)"}}>
          Track content production, publishing, engagement, SEO coordination and upload lifecycle.
        </p>
      </div>

      {/*  Filters  */}
      <div className="space-y-2">
        <PerformanceFilters
          value={filters}
          onChange={setFilters}
          hideServiceFilter
          hideCampaignFilter
        />
        {/* Extra content-specific filters */}
        <div
          className="rounded-xl border p-3 flex flex-wrap items-center gap-3"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}
        >
          <span
            className="text-[10px] font-semibold uppercase tracking-wide"style={{ color: "var(--rtm-text-muted)"}}
          >
            Content Filters
          </span>
          {/* Content Type */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide"style={{ color: "var(--rtm-text-muted)"}}>Type</span>
            <select className={selectCls} style={selectStyle} value={extra.contentType} onChange={(e) => setExtra_("contentType", e.target.value)}>
              <option value="all">All Types</option>
              <option value="Blog">Blog</option>
              <option value="Page">Page</option>
              <option value="Landing Page">Landing Page</option>
              <option value="Service Page">Service Page</option>
              <option value="Location Page">Location Page</option>
            </select>
          </div>
          {/* Upload Status */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide"style={{ color: "var(--rtm-text-muted)"}}>Upload Status</span>
            <select className={selectCls} style={selectStyle} value={extra.uploadStatus} onChange={(e) => setExtra_("uploadStatus", e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="Drafting">Drafting</option>
              <option value="SEO Review">SEO Review</option>
              <option value="Client Approval">Client Approval</option>
              <option value="Ready To Upload">Ready To Upload</option>
              <option value="Uploaded">Uploaded</option>
              <option value="Indexed">Indexed</option>
              <option value="Needs Revision">Needs Revision</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>
          {/* SEO Owner */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide"style={{ color: "var(--rtm-text-muted)"}}>SEO Owner</span>
            {contentLoading && (
              <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>Loading…</span>
            )}
            {!contentLoading && contentError && (
              <span className="text-[10px] text-red-500">Failed to load.</span>
            )}
            {!contentLoading && !contentError && (
              <select className={selectCls} style={selectStyle} value={extra.seoOwner} onChange={(e) => setExtra_("seoOwner", e.target.value)}>
                <option value="all">All Owners</option>
                {contentUsers.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            )}
          </div>
          {/* Writer */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide"style={{ color: "var(--rtm-text-muted)"}}>Writer</span>
            {contentLoading && (
              <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>Loading…</span>
            )}
            {!contentLoading && contentError && (
              <span className="text-[10px] text-red-500">Failed to load.</span>
            )}
            {!contentLoading && !contentError && (
              <select className={selectCls} style={selectStyle} value={extra.writer} onChange={(e) => setExtra_("writer", e.target.value)}>
                <option value="all">All Writers</option>
                {contentUsers.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/*  KPI Cards  */}
      {enabledKpiData.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
            {enabledKpiData.slice(0, 5).map((k) => (
              <KpiCard key={k.kpiId} title={k.title} value={k.value} trend={k.trend} trendValue={k.trendValue} iconBg={k.iconBg} iconColor={k.iconColor} trendLabel="vs prev period"/>
            ))}
          </div>
          {enabledKpiData.length > 5 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {enabledKpiData.slice(5).map((k) => (
                <KpiCard key={k.kpiId} title={k.title} value={k.value} trend={k.trend} trendValue={k.trendValue || undefined} iconBg={k.iconBg} iconColor={k.iconColor} trendLabel="vs prev period"/>
              ))}
            </div>
          )}
        </>
      )}

      {/*  Quick Actions  */}
      <SectionWrapper title="Quick Actions"description="Common content workflow operations">
        <QuickActions actions={quickActions} cols={3} />
      </SectionWrapper>

      {/*  Tab Strip  */}
      <div className="flex gap-1 rounded-xl border p-1 w-fit"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
        {(["engagement", "upload"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 text-sm font-semibold rounded-lg transition-all"style={
              activeTab === tab
                ? { background: workspace.accentColor, color: "#fff"}
                : { color: "var(--rtm-text-secondary)"}
            }
          >
            {tab === "engagement"? "Page & Blog Engagement": "Content Upload Status"}
          </button>
        ))}
      </div>

      {/*  Engagement Tab  */}
      {activeTab === "engagement"&& (
        <div className="space-y-5">
          {/* Engagement Metric Summary */}
          <SectionWrapper title="Engagement Summary"description="Aggregated metrics across all published content">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {engagementMetrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-lg border p-3"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)"}}
                >
                  <p className="text-xs font-semibold"style={{ color: "var(--rtm-text-muted)"}}>{m.label}</p>
                  <p className="text-xl font-bold mt-1"style={{ color: "var(--rtm-text-primary)"}}>{m.value}</p>
                  <p className="text-[11px] mt-0.5"style={{ color: "#059669"}}>{m.sub}</p>
                </div>
              ))}
            </div>
          </SectionWrapper>

          {/* Top Performers */}
          <SectionWrapper
            title="Top Performing Content"description="Highest engagement and lead generation"actions={<span className="text-xs font-semibold"style={{ color: "#059669"}}>{topContent.length} items</span>}
          >
            <DataTable columns={contentColumns} data={topContent} />
          </SectionWrapper>

          {/* Low Performers */}
          <SectionWrapper
            title="Low Performing Content"description="Needs optimization or review"actions={<span className="text-xs font-semibold text-amber-600">{lowContent.length} items</span>}
          >
            <DataTable columns={contentColumns} data={lowContent} />
          </SectionWrapper>

          {/* Full Content Table */}
          <SectionWrapper
            title="All Content"description="Full content inventory with performance data"actions={<span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>{contentItems.length} items</span>}
          >
            <DataTable columns={contentColumns} data={contentItems} />
          </SectionWrapper>
        </div>
      )}

      {/*  Upload Status Tab  */}
      {activeTab === "upload"&& (
        <div className="space-y-5">
          {/* Upload Summary */}
          <SectionWrapper title="Upload Status Summary"description="Content pipeline at a glance">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {uploadStatusSummary.map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg border p-3 flex flex-col gap-1"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)"}}
                >
                  <div className="w-2 h-2 rounded-full"style={{ background: s.color }} />
                  <p className="text-2xl font-bold"style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[11px] font-semibold"style={{ color: "var(--rtm-text-muted)"}}>{s.label}</p>
                </div>
              ))}
            </div>
          </SectionWrapper>

          {/* Upload Table */}
          <SectionWrapper
            title="Content Upload Tracker"description="Full upload pipeline — SEO tasks to live content"actions={<span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>{uploadItems.length} items</span>}
          >
            <DataTable columns={uploadColumns} data={uploadItems} />
          </SectionWrapper>
        </div>
      )}

      {/*  Future Integration Architecture (commented scaffold)  */}
      {/* FUTURE: SEO Tasks integration — link seoTask IDs to live task records */}
      {/* FUTURE: Google Analytics integration — pull pageViews, engagementTime, scrollDepth */}
      {/* FUTURE: Google Search Console — organic clicks, impressions, CTR, position */}
      {/* FUTURE: WordPress / CMS integration — sync upload status on publish events */}
      {/* FUTURE: Reporting Workspace — push content report snapshots */}
      {/* FUTURE: Client Profile — surface content performance per client */}

      {/*  Footer Nav  */}
      <div className="flex gap-2 flex-wrap">
        <Link href={workspace.dashboardRoute} className="rtm-btn-secondary text-sm inline-flex items-center gap-1">← Dashboard</Link>
        <Link href="/content/tasks" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Tasks →</Link>

      </div>
    </div>
  );
}
