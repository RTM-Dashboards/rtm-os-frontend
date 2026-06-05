"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge, DataTable, ProgressBar, ActivityFeed } from "@/components/ui";
import type { Column, ActivityItem } from "@/components/ui";
import { WorkspaceHeader, WorkspaceQuickLinks } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("sales")!;

// ── Types ─────────────────────────────────────────────────────────────────────

interface Lead extends Record<string, unknown> {
  name: string; source: string; value: string; stage: string; owner: string; probability: number;
}

type AuditType =
  | "SEO Audit"
  | "Google Ads Audit"
  | "Meta Ads Audit"
  | "Website Design Audit"
  | "Local Service Ads Audit"
  | "GBP Audit"
  | "Yelp Audit";

type ExecutionMode = "AI Generated Audit" | "Department Audit" | "Hybrid Audit";

type AuditStatus =
  | "Draft"
  | "Assigned"
  | "AI Started"
  | "Running Audit"
  | "AI Report Generated"
  | "Department Review"
  | "Department Revision"
  | "Completed"
  | "Approved"
  | "Ready To Send"
  | "Sent"
  | "Attached To Proposal";

interface AuditRecord extends Record<string, unknown> {
  id: string;
  prospect: string;
  website: string;
  audits: AuditType[];
  mode: ExecutionMode;
  department: string;
  assignedUser: string;
  salesOwner: string;
  status: AuditStatus;
  created: string;
  lastUpdated: string;
  nextAction: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const leads: Lead[] = [
  { name: "Summit Landscaping",  source: "Referral",      value: "$2,400/mo", stage: "proposal",    owner: "Jordan M.", probability: 75 },
  { name: "Blue Ridge Plumbing", source: "Website",       value: "$1,800/mo", stage: "discovery",   owner: "Sarah K.",  probability: 40 },
  { name: "Harbor Auto Group",   source: "Cold Outreach", value: "$5,000/mo", stage: "negotiation", owner: "Mike T.",   probability: 85 },
  { name: "Metro Dental Group",  source: "Referral",      value: "$4,500/mo", stage: "proposal",    owner: "Jordan M.", probability: 65 },
  { name: "Sunstate Solar",      source: "Google Ads",    value: "$6,000/mo", stage: "closed-won",  owner: "Sarah K.",  probability: 100 },
];

const auditRecords: AuditRecord[] = [
  {
    id: "aud-1",
    prospect: "Summit Landscaping",
    website: "summitlandscaping.com",
    audits: ["SEO Audit", "GBP Audit"],
    mode: "Hybrid Audit",
    department: "SEO & Local",
    assignedUser: "Jamie T.",
    salesOwner: "Jordan M.",
    status: "Department Review",
    created: "May 22",
    lastUpdated: "May 25",
    nextAction: "Department approval pending",
  },
  {
    id: "aud-2",
    prospect: "Harbor Auto Group",
    website: "harborautogroup.com",
    audits: ["SEO Audit", "Google Ads Audit", "Website Design Audit"],
    mode: "AI Generated Audit",
    department: "—",
    assignedUser: "—",
    salesOwner: "Mike T.",
    status: "Running Audit",
    created: "May 24",
    lastUpdated: "May 25",
    nextAction: "Wait for AI audit to complete",
  },
  {
    id: "aud-3",
    prospect: "Metro Dental Group",
    website: "metrodentalgroup.com",
    audits: ["SEO Audit", "GBP Audit", "Yelp Audit"],
    mode: "Department Audit",
    department: "SEO & Local",
    assignedUser: "Riley D.",
    salesOwner: "Jordan M.",
    status: "Completed",
    created: "May 15",
    lastUpdated: "May 23",
    nextAction: "Ready to attach to proposal",
  },
  {
    id: "aud-4",
    prospect: "Blue Ridge Plumbing",
    website: "blueridgeplumbing.com",
    audits: ["Local Service Ads Audit", "GBP Audit"],
    mode: "Department Audit",
    department: "LSA / SEO & Local",
    assignedUser: "Pat M.",
    salesOwner: "Sarah K.",
    status: "Assigned",
    created: "May 26",
    lastUpdated: "May 26",
    nextAction: "Department to begin audit",
  },
  {
    id: "aud-5",
    prospect: "Sunstate Solar",
    website: "sunstatesolar.com",
    audits: ["Google Ads Audit", "Meta Ads Audit", "Website Design Audit"],
    mode: "Hybrid Audit",
    department: "Paid Advertising",
    assignedUser: "Chris B.",
    salesOwner: "Sarah K.",
    status: "Attached To Proposal",
    created: "May 8",
    lastUpdated: "May 20",
    nextAction: "Proposal sent to prospect",
  },
];

const activity: ActivityItem[] = [
  { id: "1", actor: "Jordan M.", action: "sent proposal to",          target: "Summit Landscaping", timestamp: "30 min ago", type: "task",     avatarColor: "#1B4FD8" },
  { id: "2", actor: "Mike T.",   action: "moved lead to negotiation", target: "Harbor Auto Group",  timestamp: "1h ago",     type: "campaign", avatarColor: "#7C3AED" },
  { id: "3", actor: "Sarah K.",  action: "closed-won deal with",      target: "Sunstate Solar",     timestamp: "2h ago",     type: "client",   avatarColor: "#059669" },
  { id: "4", actor: "Jordan M.", action: "requested audit for",       target: "Metro Dental",       timestamp: "3h ago",     type: "task",     avatarColor: "#1B4FD8" },
];

const quickLinks = [
  { label: "Sales Dashboard",    href: "/sales",            icon: "📊", description: "Overview & KPIs",       accent: "#059669" },
  { label: "Leads",              href: "/sales/leads",      icon: "🎯", description: "Active lead pipeline",  accent: "#1B4FD8" },
  { label: "Tasks",              href: "/sales/tasks",      icon: "✅", description: "Sales task queue",      accent: "#059669" },
  { label: "Proposal Generator", href: "/sales/proposals",  icon: "📝", description: "Create proposals",      accent: "#7C3AED" },
  { label: "Pipeline",           href: "/sales/pipeline",   icon: "🔄", description: "Deal flow tracker",     accent: "#0891B2" },
  { label: "Follow-ups",         href: "/sales/followups",  icon: "📅", description: "Scheduled touchpoints", accent: "#D97706" },
  { label: "Performance",        href: "/sales/performance",icon: "📈", description: "Sales metrics",         accent: "#059669" },
];

// ── Lead Columns ──────────────────────────────────────────────────────────────

const leadColumns: Column<Lead>[] = [
  { key: "name",  header: "Company" },
  { key: "source",header: "Source",   width: "130px" },
  { key: "value", header: "MRR",      width: "110px" },
  { key: "owner", header: "Owner",    width: "120px" },
  {
    key: "probability", header: "Win %", width: "130px",
    render: (v) => {
      const n = Number(v);
      return (
        <div className="flex items-center gap-2">
          <ProgressBar value={n} color={n >= 70 ? "bg-emerald-500" : n >= 40 ? "bg-amber-500" : "bg-red-400"} height={5} />
          <span className="text-xs font-semibold text-slate-600 w-8 flex-shrink-0">{n}%</span>
        </div>
      );
    },
  },
  {
    key: "stage", header: "Stage", width: "130px",
    render: (v) => {
      const map: Record<string, { variant: "info" | "pending" | "warning" | "success"; label: string }> = {
        discovery:    { variant: "info",    label: "Discovery"   },
        proposal:     { variant: "pending", label: "Proposal"    },
        negotiation:  { variant: "warning", label: "Negotiation" },
        "closed-won": { variant: "success", label: "Closed Won"  },
      };
      const c = map[String(v)] ?? { variant: "info" as const, label: String(v) };
      return <StatusBadge variant={c.variant} label={c.label} size="sm" />;
    },
  },
];

// ── Audit Status Badge ────────────────────────────────────────────────────────

function auditStatusBadge(s: AuditStatus) {
  const map: Record<AuditStatus, { variant: "success" | "warning" | "info" | "neutral" | "error" | "pending"; label: string }> = {
    Draft:                 { variant: "neutral", label: "Draft" },
    Assigned:              { variant: "info",    label: "Assigned" },
    "AI Started":          { variant: "info",    label: "AI Started" },
    "Running Audit":       { variant: "pending", label: "Running Audit" },
    "AI Report Generated": { variant: "info",    label: "AI Report Generated" },
    "Department Review":   { variant: "warning", label: "Department Review" },
    "Department Revision": { variant: "warning", label: "Dept. Revision" },
    Completed:             { variant: "success", label: "Completed" },
    Approved:              { variant: "success", label: "Approved" },
    "Ready To Send":       { variant: "success", label: "Ready To Send" },
    Sent:                  { variant: "success", label: "Sent" },
    "Attached To Proposal":{ variant: "success", label: "Attached To Proposal" },
  };
  const c = map[s];
  return <StatusBadge variant={c.variant} label={c.label} size="sm" />;
}

// ── Audit Table Columns ───────────────────────────────────────────────────────

const auditColumns: Column<AuditRecord>[] = [
  { key: "prospect",    header: "Prospect",          width: "150px", render: (v) => <span className="font-semibold text-xs" style={{ color: "var(--rtm-text-primary)" }}>{String(v)}</span> },
  { key: "website",     header: "Website",           width: "170px", render: (v) => <a href={`https://${String(v)}`} target="_blank" rel="noopener noreferrer" className="text-xs underline" style={{ color: "var(--rtm-blue)" }}>{String(v)}</a> },
  {
    key: "audits", header: "Selected Audits", width: "220px",
    render: (v) => (
      <div className="flex flex-wrap gap-1">
        {(v as AuditType[]).map((a) => (
          <span key={a} className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full border" style={{ background: "#EFF6FF", color: "#2563EB", borderColor: "#BFDBFE" }}>{a}</span>
        ))}
      </div>
    ),
  },
  {
    key: "mode", header: "Exec. Mode", width: "140px",
    render: (v) => {
      const modeColor: Record<ExecutionMode, string> = {
        "AI Generated Audit": "#7C3AED",
        "Department Audit":   "#059669",
        "Hybrid Audit":       "#D97706",
      };
      const s = String(v) as ExecutionMode;
      return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${modeColor[s]}15`, color: modeColor[s] }}>{s}</span>;
    },
  },
  { key: "department",  header: "Department",        width: "130px" },
  { key: "assignedUser",header: "Assigned User",     width: "110px" },
  { key: "salesOwner",  header: "Sales Owner",       width: "100px" },
  { key: "status",      header: "Status",            width: "160px", render: (v) => auditStatusBadge(v as AuditStatus) },
  { key: "created",     header: "Created",           width: "80px" },
  { key: "lastUpdated", header: "Last Updated",      width: "100px" },
  { key: "nextAction",  header: "Next Action",       width: "200px", render: (v) => <span className="text-xs italic" style={{ color: "var(--rtm-text-muted)" }}>{String(v)}</span> },
];

// ── Audit Pipeline ────────────────────────────────────────────────────────────

const PIPELINE_STAGES = [
  { label: "Draft",             count: 1, color: "#94A3B8" },
  { label: "Assigned / Started",count: 2, color: "#2563EB" },
  { label: "Running Audit",     count: 1, color: "#7C3AED" },
  { label: "Review",            count: 1, color: "#D97706" },
  { label: "Completed",         count: 1, color: "#059669" },
  { label: "Ready To Send",     count: 0, color: "#0891B2" },
  { label: "Sent",              count: 0, color: "#16A34A" },
  { label: "Attached To Proposal", count: 1, color: "#0F766E" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function SalesDashboard() {
  const [showAuditSection, setShowAuditSection] = useState(false);

  return (
    <div className="space-y-6">
      <WorkspaceHeader workspace={workspace} subtitle="Leads, proposals, pipeline and revenue forecasting." />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="New Leads (MTD)" value="24" trend="up" trendValue="8"
          iconBg="#ECFDF5" iconColor="#059669"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <KpiCard
          title="Pipeline Value" value="$87k" trend="up" trendValue="12%"
          iconBg="#EFF6FF" iconColor="#2563EB"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <KpiCard
          title="Proposals Sent" value="9" trend="up" trendValue="3"
          iconBg="#F5F3FF" iconColor="#7C3AED"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        />
        <KpiCard
          title="Close Rate" value="34%" trend="up" trendValue="4%"
          iconBg="#FFFBEB" iconColor="#D97706"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
        />
      </div>

      <WorkspaceQuickLinks links={quickLinks} title="Sales Workspace — Navigation" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionWrapper title="Active Leads" description="Current pipeline" className="lg:col-span-2">
          <DataTable columns={leadColumns} data={leads} />
          <div className="mt-4 flex gap-2 flex-wrap">
            <Link href="/sales/leads"    className="rtm-btn-primary text-sm inline-flex items-center gap-1">View All Leads →</Link>
            <Link href="/sales/tasks"    className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Tasks →</Link>
            <Link href="/sales/pipeline" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Pipeline →</Link>
          </div>
        </SectionWrapper>

        <SectionWrapper title="Recent Activity" description="Latest sales actions">
          <ActivityFeed items={activity} />
        </SectionWrapper>
      </div>

      {/* ── Audit Section Toggle ── */}
      <div
        className="rounded-xl border p-4 flex items-center justify-between cursor-pointer transition-all"
        style={{ background: "var(--rtm-surface)", borderColor: showAuditSection ? "#7C3AED" : "var(--rtm-border)", boxShadow: showAuditSection ? "0 0 0 2px #7C3AED20" : "none" }}
        onClick={() => setShowAuditSection((p) => !p)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ background: "#F5F3FF" }}>🔎</div>
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>Prospect Audit Reports</p>
            <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>Generate AI, Department, or Hybrid audits for prospects · {auditRecords.length} active audits</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/sales/proposals" onClick={(e) => e.stopPropagation()} className="rtm-btn-secondary text-sm">Open Full Audit Tool →</Link>
          <span className="text-sm font-semibold" style={{ color: "var(--rtm-text-muted)" }}>{showAuditSection ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* ── Audit Section (Collapsible) ── */}
      {showAuditSection && (
        <div className="space-y-5">

          {/* Audit KPI Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { title: "Active Audits",     value: String(auditRecords.filter((a) => !["Attached To Proposal", "Sent"].includes(a.status)).length), iconBg: "#EFF6FF", iconColor: "#2563EB" },
              { title: "AI Audits Running", value: String(auditRecords.filter((a) => a.mode === "AI Generated Audit" && a.status === "Running Audit").length), iconBg: "#F5F3FF", iconColor: "#7C3AED" },
              { title: "Awaiting Review",   value: String(auditRecords.filter((a) => a.status === "Department Review").length), iconBg: "#FFFBEB", iconColor: "#D97706" },
              { title: "Ready To Send",     value: String(auditRecords.filter((a) => ["Ready To Send", "Completed", "Approved"].includes(a.status)).length), iconBg: "#ECFDF5", iconColor: "#059669" },
            ].map((k) => (
              <KpiCard key={k.title} title={k.title} value={k.value} iconBg={k.iconBg} iconColor={k.iconColor} />
            ))}
          </div>

          {/* Audit Pipeline */}
          <SectionWrapper title="Audit Pipeline" description="Current audit stage distribution">
            <div className="flex flex-wrap gap-2">
              {PIPELINE_STAGES.map((stage, i) => (
                <React.Fragment key={stage.label}>
                  <div className="flex flex-col items-center gap-1">
                    <div className="rounded-lg px-3 py-2 text-center min-w-[90px]" style={{ background: `${stage.color}15`, border: `1px solid ${stage.color}30` }}>
                      <p className="text-xl font-bold" style={{ color: stage.color }}>{stage.count}</p>
                      <p className="text-[10px] font-semibold" style={{ color: stage.color }}>{stage.label}</p>
                    </div>
                  </div>
                  {i < PIPELINE_STAGES.length - 1 && (
                    <div className="flex items-center text-lg" style={{ color: "var(--rtm-border)" }}>→</div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </SectionWrapper>

          {/* Audit Status Table */}
          <SectionWrapper
            title="Audit Status Table"
            description="All prospect audits with execution mode and assignment"
            actions={
              <button className="rtm-btn-primary text-sm" onClick={() => alert("[Mock] Open New Audit Wizard")}>+ New Audit</button>
            }
          >
            <DataTable columns={auditColumns} data={auditRecords} />
          </SectionWrapper>

          <div className="flex gap-2">
            <Link href="/sales/proposals" className="rtm-btn-primary text-sm inline-flex items-center gap-1">Open Audit &amp; Proposal Tool →</Link>
          </div>
        </div>
      )}
    </div>
  );
}
