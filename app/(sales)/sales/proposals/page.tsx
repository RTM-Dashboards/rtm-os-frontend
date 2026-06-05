"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SectionWrapper, StatusBadge, DataTable } from "@/components/ui";
import type { Column } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("sales")!;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type AuditType =
  | "SEO Audit"
  | "Google Ads Audit"
  | "Meta Ads Audit"
  | "Website Design Audit"
  | "Local Service Ads Audit"
  | "GBP Audit"
  | "Yelp Audit";

type ExecutionMode = "AI Generated Audit" | "Department Audit" | "Hybrid Audit";

type AIAuditStatus =
  | "Draft"
  | "Gathering Data"
  | "Running Audit Tools"
  | "AI Analysis"
  | "Report Generated"
  | "Sales Review"
  | "Ready To Send"
  | "Sent";

type DeptAuditStatus =
  | "Assigned"
  | "In Progress"
  | "Waiting For Review"
  | "Completed"
  | "Returned For Revision"
  | "Ready For Sales";

type HybridAuditStatus =
  | "AI Audit Running"
  | "AI Report Generated"
  | "Department Review"
  | "Department Revision"
  | "Approved"
  | "Ready For Sales";

type AuditStatus = AIAuditStatus | DeptAuditStatus | HybridAuditStatus;

interface ProspectInfo {
  name: string;
  company: string;
  website: string;
  industry: string;
  location: string;
  email: string;
  phone: string;
  salesOwner: string;
  dealStage: string;
}

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

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────

const AUDIT_TYPE_META: Record<AuditType, { icon: string; dept: string; description: string; time: string }> = {
  "SEO Audit":               { icon: "🔍", dept: "SEO & Local",            description: "Technical SEO, rankings, content gaps, local visibility.",   time: "2–3 days" },
  "Google Ads Audit":        { icon: "🎯", dept: "Paid Advertising / Google Ads", description: "Conversion tracking, search issues, wasted spend, CPL.",  time: "1–2 days" },
  "Meta Ads Audit":          { icon: "📱", dept: "Paid Advertising / Meta Ads",   description: "Creative fatigue, audience quality, CPL trends.",          time: "1–2 days" },
  "Website Design Audit":    { icon: "🖥️", dept: "Web Development & Design",      description: "UX issues, mobile, conversion problems, CTAs.",             time: "2–3 days" },
  "Local Service Ads Audit": { icon: "⭐", dept: "Local Service Ads",             description: "Lead quality, budget pacing, service area.",                time: "1 day" },
  "GBP Audit":               { icon: "📍", dept: "SEO & Local / GBP",             description: "Profile completeness, reviews, post consistency.",          time: "1 day" },
  "Yelp Audit":              { icon: "⭐", dept: "SEO & Local / Yelp",            description: "Listing health, review visibility, profile completeness.",  time: "1 day" },
};

const DEPT_ASSIGNMENTS: Record<AuditType, string> = {
  "SEO Audit":               "SEO & Local",
  "GBP Audit":               "SEO & Local / GBP",
  "Yelp Audit":              "SEO & Local / Yelp",
  "Google Ads Audit":        "Paid Advertising / Google Ads",
  "Meta Ads Audit":          "Paid Advertising / Meta Ads",
  "Website Design Audit":    "Web Development & Design",
  "Local Service Ads Audit": "Local Service Ads",
};

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
    status: "Running Audit Tools",
    created: "May 24",
    lastUpdated: "May 25",
    nextAction: "Wait for AI to complete",
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
    nextAction: "Attach to proposal",
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
    nextAction: "Department to begin",
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
    status: "Ready For Sales",
    created: "May 8",
    lastUpdated: "May 20",
    nextAction: "Ready to send to prospect",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Proposal Templates
// ─────────────────────────────────────────────────────────────────────────────

const templates = [
  { name: "Full-Service SEO Package",   desc: "On-page, off-page, GBP and monthly reporting.",           tier: "Standard"   },
  { name: "Paid Advertising Bundle",    desc: "Meta + Google Ads management with monthly review.",        tier: "Premium"    },
  { name: "Website Redesign",           desc: "Custom WordPress build, mobile-first, 30-day support.",   tier: "Project"    },
  { name: "Local Visibility Package",   desc: "GBP, Yelp, LSA and citation management.",                 tier: "Standard"   },
  { name: "Content Marketing Retainer", desc: "4 blogs/mo, social calendar, email newsletter.",          tier: "Standard"   },
  { name: "Enterprise Agency Bundle",   desc: "All services with a dedicated account manager.",          tier: "Enterprise" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function auditStatusBadge(s: AuditStatus) {
  const ok: AuditStatus[] = ["Report Generated", "Ready To Send", "Completed", "Ready For Sales", "Approved"];
  const warn: AuditStatus[] = ["Waiting For Review", "Department Review", "Sales Review", "Department Revision"];
  const err: AuditStatus[] = ["Returned For Revision"];
  if (ok.includes(s)) return <StatusBadge variant="success" label={s} size="sm" />;
  if (warn.includes(s)) return <StatusBadge variant="warning" label={s} size="sm" />;
  if (err.includes(s)) return <StatusBadge variant="error" label={s} size="sm" />;
  if (s === "Sent") return <StatusBadge variant="success" label={s} size="sm" />;
  if (["Gathering Data", "Running Audit Tools", "AI Analysis", "AI Audit Running", "AI Report Generated"].includes(s))
    return <StatusBadge variant="info" label={s} size="sm" />;
  return <StatusBadge variant="neutral" label={s} size="sm" />;
}

function modeChip(mode: ExecutionMode) {
  const colorMap: Record<ExecutionMode, string> = {
    "AI Generated Audit": "#7C3AED",
    "Department Audit":   "#059669",
    "Hybrid Audit":       "#D97706",
  };
  const c = colorMap[mode];
  return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${c}15`, color: c }}>{mode}</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Audit Table Columns
// ─────────────────────────────────────────────────────────────────────────────

const auditTableColumns: Column<AuditRecord>[] = [
  { key: "prospect",    header: "Prospect",     width: "150px", render: (v) => <span className="font-semibold text-xs" style={{ color: "var(--rtm-text-primary)" }}>{String(v)}</span> },
  { key: "website",     header: "Website",      width: "170px", render: (v) => <a href={`https://${v}`} target="_blank" rel="noopener noreferrer" className="text-xs underline" style={{ color: "var(--rtm-blue)" }}>{String(v)}</a> },
  {
    key: "audits", header: "Selected Audits", width: "240px",
    render: (v) => (
      <div className="flex flex-wrap gap-1">
        {(v as AuditType[]).map((a) => (
          <span key={a} className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full border" style={{ background: "#EFF6FF", color: "#2563EB", borderColor: "#BFDBFE" }}>{a}</span>
        ))}
      </div>
    ),
  },
  { key: "mode",        header: "Exec. Mode",   width: "150px", render: (v) => modeChip(v as ExecutionMode) },
  { key: "department",  header: "Department",   width: "130px" },
  { key: "assignedUser",header: "Assigned",     width: "100px" },
  { key: "salesOwner",  header: "Sales Owner",  width: "100px" },
  { key: "status",      header: "Status",       width: "170px", render: (v) => auditStatusBadge(v as AuditStatus) },
  { key: "created",     header: "Created",      width: "80px" },
  { key: "lastUpdated", header: "Updated",      width: "90px" },
  { key: "nextAction",  header: "Next Action",  width: "200px", render: (v) => <span className="text-xs italic" style={{ color: "var(--rtm-text-muted)" }}>{String(v)}</span> },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

// Prospect Info Form
function ProspectInfoForm({
  info,
  onChange,
}: {
  info: ProspectInfo;
  onChange: (next: ProspectInfo) => void;
}) {
  const field = (label: string, key: keyof ProspectInfo, placeholder = "") => (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{label}</label>
      <input
        type="text"
        value={info[key]}
        placeholder={placeholder}
        onChange={(e) => onChange({ ...info, [key]: e.target.value })}
        className="text-xs rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
      />
    </div>
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {field("Prospect Name",  "name",       "e.g. John Smith")}
      {field("Company",        "company",    "e.g. Apex Roofing Co.")}
      {field("Website",        "website",    "e.g. apexroofing.com")}
      {field("Industry",       "industry",   "e.g. Home Services")}
      {field("Location",       "location",   "e.g. Denver, CO")}
      {field("Contact Email",  "email",      "e.g. john@company.com")}
      {field("Contact Phone",  "phone",      "e.g. (720) 555-0100")}
      {field("Sales Owner",    "salesOwner", "e.g. Jordan M.")}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Deal Stage</label>
        <select
          value={info.dealStage}
          onChange={(e) => onChange({ ...info, dealStage: e.target.value })}
          className="text-xs rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
        >
          <option value="">Select Stage</option>
          <option value="discovery">Discovery</option>
          <option value="proposal">Proposal</option>
          <option value="negotiation">Negotiation</option>
          <option value="closed-won">Closed Won</option>
          <option value="closed-lost">Closed Lost</option>
        </select>
      </div>
    </div>
  );
}

// Audit Type Selector
function AuditTypeSelector({
  selected,
  onToggle,
}: {
  selected: AuditType[];
  onToggle: (t: AuditType) => void;
}) {
  const types = Object.entries(AUDIT_TYPE_META) as [AuditType, typeof AUDIT_TYPE_META[AuditType]][];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {types.map(([type, meta]) => {
        const active = selected.includes(type);
        return (
          <div
            key={type}
            className="rounded-lg border p-4 cursor-pointer transition-all"
            style={{
              background: active ? "#EFF6FF" : "var(--rtm-bg)",
              borderColor: active ? "#2563EB" : "var(--rtm-border-light)",
              boxShadow: active ? "0 0 0 2px #2563EB30" : "none",
            }}
            onClick={() => onToggle(type)}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{meta.icon}</span>
                <p className="text-sm font-semibold" style={{ color: active ? "#2563EB" : "var(--rtm-text-primary)" }}>{type}</p>
              </div>
              <div
                className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border text-xs font-bold"
                style={{ background: active ? "#2563EB" : "transparent", borderColor: active ? "#2563EB" : "var(--rtm-border)", color: active ? "#fff" : "transparent" }}
              >
                ✓
              </div>
            </div>
            <p className="text-xs mb-2" style={{ color: "var(--rtm-text-muted)" }}>{meta.description}</p>
            <div className="flex items-center justify-between text-[10px] font-semibold" style={{ color: "var(--rtm-text-muted)" }}>
              <span>⏱ {meta.time}</span>
              <span style={{ color: "#7C3AED" }}>{meta.dept}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Execution Mode Selector
function ExecutionModeSelector({
  mode,
  onChange,
}: {
  mode: ExecutionMode | null;
  onChange: (m: ExecutionMode) => void;
}) {
  const options: { mode: ExecutionMode; icon: string; description: string; turnaround: string; resources: string; color: string }[] = [
    {
      mode: "AI Generated Audit",
      icon: "🤖",
      description: "RTM OS automatically gathers data, runs audit tools, runs AI analysis, generates findings, executive summary, recommendations and full report.",
      turnaround: "Minutes to hours",
      resources: "OpenAI / Claude · Data connectors",
      color: "#7C3AED",
    },
    {
      mode: "Department Audit",
      icon: "👥",
      description: "A department expert is assigned to perform the full audit manually. Receives audit task, due date, priority, prospect info and deliverables.",
      turnaround: "1–5 business days",
      resources: "Assigned department team member",
      color: "#059669",
    },
    {
      mode: "Hybrid Audit",
      icon: "🔀",
      description: "AI generates the initial audit. A department expert then reviews findings, recommendations and opportunities, and approves the final report.",
      turnaround: "Same day AI + 1–2 day review",
      resources: "AI + Department reviewer",
      color: "#D97706",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {options.map((opt) => (
        <div
          key={opt.mode}
          className="rounded-xl border p-5 cursor-pointer transition-all"
          style={{
            background: mode === opt.mode ? `${opt.color}08` : "var(--rtm-surface)",
            borderColor: mode === opt.mode ? opt.color : "var(--rtm-border)",
            boxShadow: mode === opt.mode ? `0 0 0 2px ${opt.color}30` : "none",
          }}
          onClick={() => onChange(opt.mode)}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{opt.icon}</span>
              <p className="text-sm font-bold" style={{ color: mode === opt.mode ? opt.color : "var(--rtm-text-primary)" }}>{opt.mode}</p>
            </div>
            <div
              className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
              style={{ borderColor: mode === opt.mode ? opt.color : "var(--rtm-border)" }}
            >
              {mode === opt.mode && <div className="w-2.5 h-2.5 rounded-full" style={{ background: opt.color }} />}
            </div>
          </div>
          <p className="text-xs mb-3" style={{ color: "var(--rtm-text-secondary)" }}>{opt.description}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]">⏱</span>
              <span className="text-[10px] font-semibold" style={{ color: opt.color }}>{opt.turnaround}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]">🔧</span>
              <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{opt.resources}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Assignment Panel
function AssignmentPanel({
  mode,
  selectedAudits,
}: {
  mode: ExecutionMode | null;
  selectedAudits: AuditType[];
}) {
  const [assignedUser, setAssignedUser] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [approvalRequired, setApprovalRequired] = useState(true);
  const [aiOwner, setAiOwner] = useState("OpenAI");

  if (!mode) return null;

  const inputCls = "text-xs rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full";
  const inputStyle = { background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" } as React.CSSProperties;
  const labelCls = "text-[10px] font-semibold uppercase tracking-wide block mb-1";
  const labelStyle = { color: "var(--rtm-text-muted)" };

  const depts = [...new Set(selectedAudits.map((a) => DEPT_ASSIGNMENTS[a]))].join(", ") || "—";

  return (
    <div className="rounded-xl border p-5 space-y-4" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
      <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>Audit Assignment</p>

      {mode === "AI Generated Audit" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls} style={labelStyle}>AI Provider</label>
            <select className={inputCls} style={inputStyle} value={aiOwner} onChange={(e) => setAiOwner(e.target.value)}>
              <option value="OpenAI">OpenAI (GPT-4)</option>
              <option value="Claude">Claude (Anthropic)</option>
            </select>
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Sales Reviewer</label>
            <select className={inputCls} style={inputStyle} value={assignedUser} onChange={(e) => setAssignedUser(e.target.value)}>
              <option value="">Select reviewer…</option>
              <option value="Jordan M.">Jordan M.</option>
              <option value="Mike T.">Mike T.</option>
              <option value="Sarah K.">Sarah K.</option>
            </select>
          </div>
        </div>
      )}

      {mode === "Department Audit" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} style={labelStyle}>Assigned Department</label>
              <input type="text" readOnly value={depts} className={`${inputCls} bg-gray-50`} style={{ ...inputStyle, opacity: 0.7 }} />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Assigned User</label>
              <select className={inputCls} style={inputStyle} value={assignedUser} onChange={(e) => setAssignedUser(e.target.value)}>
                <option value="">Select user…</option>
                <option value="Jamie T.">Jamie T. (SEO & Local)</option>
                <option value="Riley D.">Riley D. (SEO & Local)</option>
                <option value="Chris B.">Chris B. (Paid Advertising)</option>
                <option value="Pat M.">Pat M. (LSA)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} style={labelStyle}>Due Date</label>
              <input type="date" className={inputCls} style={inputStyle} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Priority</label>
              <select className={inputCls} style={inputStyle} value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {mode === "Hybrid Audit" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls} style={labelStyle}>AI Audit Owner</label>
              <select className={inputCls} style={inputStyle} value={aiOwner} onChange={(e) => setAiOwner(e.target.value)}>
                <option value="OpenAI">OpenAI (GPT-4)</option>
                <option value="Claude">Claude (Anthropic)</option>
              </select>
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Department Reviewer</label>
              <select className={inputCls} style={inputStyle} value={assignedUser} onChange={(e) => setAssignedUser(e.target.value)}>
                <option value="">Select reviewer…</option>
                <option value="Jamie T.">Jamie T. (SEO & Local)</option>
                <option value="Riley D.">Riley D. (SEO & Local)</option>
                <option value="Chris B.">Chris B. (Paid Ads)</option>
                <option value="Pat M.">Pat M. (LSA)</option>
              </select>
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Approval Required</label>
              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={approvalRequired} onChange={() => setApprovalRequired(true)} className="accent-purple-600" />
                  <span className="text-xs" style={{ color: "var(--rtm-text-primary)" }}>Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={!approvalRequired} onChange={() => setApprovalRequired(false)} className="accent-purple-600" />
                  <span className="text-xs" style={{ color: "var(--rtm-text-primary)" }}>No</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Audit Summary Preview
function AuditSummaryPreview({ selectedAudits }: { selectedAudits: AuditType[] }) {
  type FindingSection = { audit: AuditType; findings: { label: string; value: string; status: "issue" | "opportunity" | "ok" }[] };

  const findingsMap: Partial<Record<AuditType, FindingSection["findings"]>> = {
    "SEO Audit": [
      { label: "Technical SEO Issues",       value: "14 issues found",          status: "issue"       },
      { label: "Ranking Gaps",               value: "32 keyword opportunities",  status: "opportunity" },
      { label: "Missing Content",            value: "8 content gaps identified", status: "opportunity" },
      { label: "Local SEO Opportunities",    value: "3 citation issues",         status: "issue"       },
    ],
    "Google Ads Audit": [
      { label: "Conversion Tracking",        value: "Not properly configured",   status: "issue"       },
      { label: "Search Issues",              value: "Broad match over-spending",  status: "issue"       },
      { label: "Wasted Spend",               value: "$1,240/mo estimated waste",  status: "issue"       },
      { label: "CPL Opportunities",          value: "34% reduction possible",    status: "opportunity" },
    ],
    "Meta Ads Audit": [
      { label: "Creative Fatigue",           value: "3 ad sets with >6wk age",   status: "issue"       },
      { label: "Audience Quality",           value: "Broad audiences 82% spend", status: "issue"       },
      { label: "CPL Trends",                 value: "$48 CPL (+22% vs last mo)", status: "issue"       },
      { label: "Lead Quality",               value: "Lead form vs landing page", status: "opportunity" },
    ],
    "Website Design Audit": [
      { label: "UX Issues",                  value: "Confusing navigation",       status: "issue"       },
      { label: "Mobile Issues",              value: "CLS score 0.38 (poor)",     status: "issue"       },
      { label: "Conversion Issues",          value: "No above-fold CTA",         status: "issue"       },
      { label: "CTA Issues",                 value: "4 pages missing CTAs",      status: "opportunity" },
    ],
    "Local Service Ads Audit": [
      { label: "Lead Quality",               value: "38% unqualified leads",     status: "issue"       },
      { label: "Budget Pacing",              value: "Under-spending 40%",        status: "opportunity" },
      { label: "Service Area",               value: "3 adjacent cities missed",  status: "opportunity" },
    ],
    "GBP Audit": [
      { label: "Profile Completeness",       value: "72% complete",              status: "issue"       },
      { label: "Review Visibility",          value: "12 unanswered reviews",     status: "issue"       },
      { label: "Posting Consistency",        value: "No posts in 45 days",       status: "issue"       },
    ],
    "Yelp Audit": [
      { label: "Listing Health",             value: "Incomplete hours + photos",  status: "issue"       },
      { label: "Review Visibility",          value: "6 filtered reviews",        status: "issue"       },
      { label: "Profile Completeness",       value: "No service list added",     status: "opportunity" },
    ],
  };

  const relevantFindings = selectedAudits
    .map((a) => ({ audit: a, findings: findingsMap[a] ?? [] }))
    .filter((f) => f.findings.length > 0);

  if (relevantFindings.length === 0) return null;

  return (
    <div className="space-y-4">
      {relevantFindings.map(({ audit, findings }) => (
        <div key={audit} className="rounded-lg border p-4" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{AUDIT_TYPE_META[audit].icon}</span>
            <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>{audit}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {findings.map((f) => (
              <div
                key={f.label}
                className="rounded p-2 border"
                style={{
                  background: f.status === "issue" ? "#FEF2F2" : f.status === "opportunity" ? "#FFFBEB" : "#ECFDF5",
                  borderColor: f.status === "issue" ? "#FECACA" : f.status === "opportunity" ? "#FDE68A" : "#A7F3D0",
                }}
              >
                <p className="text-[10px] font-bold mb-0.5" style={{ color: f.status === "issue" ? "#DC2626" : f.status === "opportunity" ? "#92400E" : "#059669" }}>
                  {f.status === "issue" ? "⚠️" : f.status === "opportunity" ? "💡" : "✅"} {f.label}
                </p>
                <p className="text-[10px]" style={{ color: "var(--rtm-text-secondary)" }}>{f.value}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// AI Scorecards
function AIScorecards({ selectedAudits }: { selectedAudits: AuditType[] }) {
  const scoreMap: Partial<Record<AuditType, { label: string; score: number; color: string }>> = {
    "SEO Audit":               { label: "SEO Score",            score: 42, color: "#DC2626" },
    "Google Ads Audit":        { label: "Google Ads Health",    score: 58, color: "#D97706" },
    "Meta Ads Audit":          { label: "Meta Ads Health",      score: 61, color: "#D97706" },
    "Website Design Audit":    { label: "Website Performance",  score: 49, color: "#DC2626" },
    "Local Service Ads Audit": { label: "LSA Health Score",     score: 71, color: "#059669" },
    "GBP Audit":               { label: "GBP Health Score",     score: 55, color: "#D97706" },
    "Yelp Audit":              { label: "Yelp Health Score",    score: 48, color: "#DC2626" },
  };

  const relevant = selectedAudits.map((a) => scoreMap[a]).filter(Boolean) as { label: string; score: number; color: string }[];
  if (relevant.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {relevant.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border p-4 text-center"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <p
            className="text-3xl font-black"
            style={{ color: s.score >= 70 ? "#059669" : s.score >= 50 ? "#D97706" : "#DC2626" }}
          >
            {s.score}
          </p>
          <div
            className="w-full h-1.5 rounded-full mt-2 mb-2"
            style={{ background: "var(--rtm-border-light)" }}
          >
            <div
              className="h-1.5 rounded-full"
              style={{ width: `${s.score}%`, background: s.score >= 70 ? "#059669" : s.score >= 50 ? "#D97706" : "#DC2626" }}
            />
          </div>
          <p className="text-[11px] font-semibold" style={{ color: "var(--rtm-text-muted)" }}>{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// Report Generator Section
function ReportGeneratorSection({
  mode,
  selectedAudits,
  prospectName,
}: {
  mode: ExecutionMode | null;
  selectedAudits: AuditType[];
  prospectName: string;
}) {
  const [status, setStatus] = useState<"idle" | "running" | "complete">("idle");

  const handleRun = () => {
    setStatus("running");
    setTimeout(() => setStatus("complete"), 1500);
  };

  const reportSections = [
    { num: 1, label: "Executive Summary",          desc: "High-level overview of audit findings and key opportunities" },
    { num: 2, label: "Overall Audit Score",         desc: "Composite health score across all selected audits" },
    { num: 3, label: "Service Findings",            desc: "Detailed findings per selected audit type" },
    { num: 4, label: "High Priority Issues",        desc: "Critical items requiring immediate attention" },
    { num: 5, label: "Opportunities",               desc: "Growth and optimization opportunities identified" },
    { num: 6, label: "Recommended Services",        desc: "Services recommended based on audit findings" },
    { num: 7, label: "Expected Outcomes",           desc: "Projected improvements from recommended services" },
    { num: 8, label: "Proposal Recommendations",   desc: "Service package and pricing recommendations" },
  ];

  if (!mode || selectedAudits.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Status bar */}
      {status === "running" && (
        <div className="rounded-lg p-3 flex items-center gap-3" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-blue-700">
            {mode === "AI Generated Audit" ? "AI is running audit tools and analyzing data…" : "Initializing audit workflow…"}
          </p>
        </div>
      )}
      {status === "complete" && (
        <div className="rounded-lg p-3 flex items-center gap-3" style={{ background: "#ECFDF5", border: "1px solid #A7F3D0" }}>
          <span className="text-lg">✅</span>
          <p className="text-sm font-semibold text-emerald-700">Audit report generated successfully for <strong>{prospectName || "prospect"}</strong>.</p>
        </div>
      )}

      {/* Report Sections */}
      <div className="rounded-xl border p-4 space-y-2" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
        <p className="text-xs font-bold mb-3" style={{ color: "var(--rtm-text-secondary)" }}>Generated Report Sections</p>
        {reportSections.map((s) => (
          <div key={s.num} className="flex items-start gap-3 py-2" style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
            <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: "#EFF6FF", color: "#2563EB" }}>{s.num}</div>
            <div>
              <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{s.label}</p>
              <p className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleRun}
          className="rtm-btn-primary text-sm inline-flex items-center gap-1.5"
          disabled={status === "running"}
        >
          {status === "running" ? "⏳ Running…" : status === "complete" ? "🔄 Re-Run Audit" : "▶ Run Audit"}
        </button>
        <button className="rtm-btn-secondary text-sm" onClick={() => alert("[Mock] Generate AI Summary")}>✨ AI Summary</button>
        <button className="rtm-btn-secondary text-sm" onClick={() => alert("[Mock] Generate Executive Summary")}>📄 Executive Summary</button>
        <button className="rtm-btn-secondary text-sm" onClick={() => alert("[Mock] Generate Proposal Recommendations")}>💡 Proposal Recs</button>
        <button className="rtm-btn-secondary text-sm" onClick={() => alert("[Mock] Preview Report")}>👁 Preview Report</button>
        <button className="rtm-btn-secondary text-sm" onClick={() => alert("[Mock] Generate Audit Report")}>📋 Generate Report</button>
        <button className="rtm-btn-secondary text-sm" onClick={() => alert("[Mock] Download PDF")}>⬇ Download PDF</button>
        <button className="rtm-btn-secondary text-sm" onClick={() => alert("[Mock] Send To Prospect")}>📤 Send To Prospect</button>
        <button className="rtm-btn-primary text-sm" onClick={() => alert("[Mock] Attach To Proposal")}>📎 Attach To Proposal</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_PROSPECT: ProspectInfo = {
  name: "", company: "", website: "", industry: "", location: "",
  email: "", phone: "", salesOwner: "", dealStage: "",
};

const ALL_AUDIT_TYPES: AuditType[] = [
  "SEO Audit", "Google Ads Audit", "Meta Ads Audit",
  "Website Design Audit", "Local Service Ads Audit", "GBP Audit", "Yelp Audit",
];

type WizardStep = "prospect" | "audits" | "mode" | "assignment" | "preview" | "report";

const WIZARD_STEPS: { key: WizardStep; label: string; icon: string }[] = [
  { key: "prospect",   label: "Prospect Info",    icon: "👤" },
  { key: "audits",     label: "Select Audits",    icon: "✅" },
  { key: "mode",       label: "Execution Mode",   icon: "⚙️" },
  { key: "assignment", label: "Assignment",       icon: "👥" },
  { key: "preview",    label: "Audit Preview",    icon: "🔍" },
  { key: "report",     label: "Report Generator", icon: "📋" },
];

export default function SalesProposalsPage() {
  const [activeTab, setActiveTab] = useState<"proposals" | "audits">("proposals");
  const [wizardStep, setWizardStep] = useState<WizardStep>("prospect");
  const [prospect, setProspect] = useState<ProspectInfo>(DEFAULT_PROSPECT);
  const [selectedAudits, setSelectedAudits] = useState<AuditType[]>([]);
  const [execMode, setExecMode] = useState<ExecutionMode | null>(null);

  const toggleAudit = (t: AuditType) =>
    setSelectedAudits((prev) => prev.includes(t) ? prev.filter((a) => a !== t) : [...prev, t]);

  const stepIndex = WIZARD_STEPS.findIndex((s) => s.key === wizardStep);
  const canNext = wizardStep !== "report";
  const canBack = stepIndex > 0;

  const goNext = () => {
    if (canNext) setWizardStep(WIZARD_STEPS[stepIndex + 1].key);
  };
  const goBack = () => {
    if (canBack) setWizardStep(WIZARD_STEPS[stepIndex - 1].key);
  };

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>Sales</p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Proposal Generator &amp; Audit Reports</h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          Build proposals and generate AI, department, or hybrid prospect audits.
        </p>
      </div>

      {/* ── Main Tab Bar ── */}
      <div className="flex gap-1 rounded-xl border p-1 w-fit" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
        {([["proposals", "📝 Proposals"], ["audits", "🔎 Audit Reports"]] as const).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 text-sm font-semibold rounded-lg transition-all"
            style={activeTab === tab ? { background: workspace.accentColor, color: "#fff" } : { color: "var(--rtm-text-secondary)" }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ───────────────────────── PROPOSALS TAB ───────────────────────── */}
      {activeTab === "proposals" && (
        <div className="space-y-6">
          <div
            className="rounded-xl border p-8 flex flex-col items-center gap-3 text-center"
            style={{ background: "var(--rtm-blue-xlight)", borderColor: "#1B4FD820" }}
          >
            <span className="text-5xl">📝</span>
            <h2 className="text-lg font-bold" style={{ color: "var(--rtm-text-primary)" }}>Proposal Builder</h2>
            <p className="text-sm max-w-md" style={{ color: "var(--rtm-text-secondary)" }}>
              Choose a package template below and customize for your prospect. Attach an audit report to strengthen the proposal.
            </p>
            <div className="flex gap-2 mt-2">
              <button className="rtm-btn-primary" onClick={() => alert("[Mock] New Proposal")}>+ New Proposal</button>
              <button className="rtm-btn-secondary" onClick={() => setActiveTab("audits")}>+ Attach Audit Report</button>
            </div>
          </div>

          <SectionWrapper title="Proposal Templates" description="Pre-built packages — click to customize">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {templates.map((t) => (
                <div
                  key={t.name}
                  className="p-4 rounded-lg border cursor-pointer transition-all"
                  style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#1B4FD8"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--rtm-border-light)"; }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{t.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)" }}>{t.tier}</span>
                  </div>
                  <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{t.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/sales/tasks" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Sales Tasks →</Link>
            </div>
          </SectionWrapper>
        </div>
      )}

      {/* ────────────────────────── AUDIT TAB ─────────────────────────── */}
      {activeTab === "audits" && (
        <div className="space-y-6">

          {/* Wizard Progress */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {WIZARD_STEPS.map((s, i) => (
              <React.Fragment key={s.key}>
                <button
                  onClick={() => setWizardStep(s.key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0"
                  style={
                    wizardStep === s.key
                      ? { background: "#7C3AED", color: "#fff" }
                      : i < stepIndex
                      ? { background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0" }
                      : { background: "var(--rtm-bg)", color: "var(--rtm-text-muted)", border: "1px solid var(--rtm-border-light)" }
                  }
                >
                  <span>{i < stepIndex ? "✓" : s.icon}</span>
                  <span>{s.label}</span>
                </button>
                {i < WIZARD_STEPS.length - 1 && (
                  <span className="text-xs flex-shrink-0" style={{ color: "var(--rtm-border)" }}>→</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step: Prospect Info */}
          {wizardStep === "prospect" && (
            <SectionWrapper title="👤 Prospect Information" description="Enter the prospect details for this audit">
              <ProspectInfoForm info={prospect} onChange={setProspect} />
            </SectionWrapper>
          )}

          {/* Step: Select Audits */}
          {wizardStep === "audits" && (
            <SectionWrapper
              title="✅ Select Audits"
              description="Choose which audits to run for this prospect"
              actions={
                <div className="flex gap-2">
                  <button onClick={() => setSelectedAudits([...ALL_AUDIT_TYPES])} className="rtm-btn-secondary text-xs">Select All</button>
                  <button onClick={() => setSelectedAudits([])} className="rtm-btn-secondary text-xs">Clear</button>
                </div>
              }
            >
              <AuditTypeSelector selected={selectedAudits} onToggle={toggleAudit} />
              {selectedAudits.length > 0 && (
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-muted)" }}>Selected:</p>
                  {selectedAudits.map((a) => (
                    <span key={a} className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE" }}>{a}</span>
                  ))}
                </div>
              )}
            </SectionWrapper>
          )}

          {/* Step: Execution Mode */}
          {wizardStep === "mode" && (
            <SectionWrapper title="⚙️ Execution Mode" description="How should this audit be generated?">
              <ExecutionModeSelector mode={execMode} onChange={setExecMode} />
            </SectionWrapper>
          )}

          {/* Step: Assignment */}
          {wizardStep === "assignment" && (
            <SectionWrapper title="👥 Audit Assignment" description="Configure assignment details for this audit">
              {execMode ? (
                <AssignmentPanel mode={execMode} selectedAudits={selectedAudits} />
              ) : (
                <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>Please select an execution mode first.</p>
              )}
            </SectionWrapper>
          )}

          {/* Step: Audit Preview */}
          {wizardStep === "preview" && (
            <div className="space-y-5">
              {/* AI Scorecards */}
              {selectedAudits.length > 0 && (
                <SectionWrapper title="📊 AI Audit Scorecards" description="Sample health scores — final scores generated after full audit">
                  <AIScorecards selectedAudits={selectedAudits} />
                </SectionWrapper>
              )}

              {/* Sample Findings */}
              {selectedAudits.length > 0 && (
                <SectionWrapper title="🔍 Sample Audit Findings" description="Preview of expected findings — final results generated by full audit">
                  <AuditSummaryPreview selectedAudits={selectedAudits} />
                </SectionWrapper>
              )}

              {selectedAudits.length === 0 && (
                <div className="rounded-xl border p-8 text-center" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)", borderStyle: "dashed" }}>
                  <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>No audits selected. Go back and select audit types.</p>
                </div>
              )}
            </div>
          )}

          {/* Step: Report Generator */}
          {wizardStep === "report" && (
            <SectionWrapper title="📋 Audit Report Generator" description="Generate, review and send the final audit report">
              <ReportGeneratorSection
                mode={execMode}
                selectedAudits={selectedAudits}
                prospectName={prospect.company || prospect.name}
              />
              {(!execMode || selectedAudits.length === 0) && (
                <div className="mt-4 p-4 rounded-lg" style={{ background: "#FFF7ED", border: "1px solid #FDE68A" }}>
                  <p className="text-sm font-semibold text-amber-700">Complete the previous steps before generating a report.</p>
                  <p className="text-xs text-amber-600 mt-1">You need at least one audit selected and an execution mode chosen.</p>
                </div>
              )}
            </SectionWrapper>
          )}

          {/* Wizard Navigation */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={goBack}
              disabled={!canBack}
              className="rtm-btn-secondary text-sm inline-flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Back
            </button>
            <div className="flex items-center gap-1">
              {WIZARD_STEPS.map((s, i) => (
                <div
                  key={s.key}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{ background: i === stepIndex ? "#7C3AED" : i < stepIndex ? "#059669" : "var(--rtm-border)" }}
                />
              ))}
            </div>
            <button
              onClick={goNext}
              disabled={!canNext}
              className="rtm-btn-primary text-sm inline-flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>

          {/* ── Audit Status Table ── */}
          <SectionWrapper
            title="All Audit Reports"
            description="Track all prospect audits across execution modes and departments"
            actions={
              <button className="rtm-btn-primary text-sm" onClick={() => setWizardStep("prospect")}>+ New Audit</button>
            }
          >
            <DataTable columns={auditTableColumns} data={auditRecords} />
          </SectionWrapper>

          {/* ── Future Automation Architecture (commented scaffold) ── */}
          {/* FUTURE: OpenAI integration — GPT-4 audit analysis & report generation */}
          {/* FUTURE: Claude integration — Anthropic audit analysis */}
          {/* FUTURE: Google Search Console — organic ranking data for SEO audit */}
          {/* FUTURE: Google Analytics — traffic & conversion data */}
          {/* FUTURE: Google Business Profile API — GBP health data */}
          {/* FUTURE: Meta Ads API — campaign & creative performance */}
          {/* FUTURE: Google Ads API — spend, conversions, search terms */}
          {/* FUTURE: Local Service Ads API — lead quality, budget, disputes */}
          {/* FUTURE: PageSpeed Insights — website performance scores */}
          {/* FUTURE: Website Crawler — technical SEO issues */}
          {/* FUTURE: Task Management — department audit task creation */}
          {/* FUTURE: Department Assignment — notify and assign dept members */}
          {/* FUTURE: Internal Review Workflow — review queue, comments, approval */}
          {/* FUTURE: Audit Approval Workflow — hybrid approval step */}
        </div>
      )}

      {/* ── Footer ── */}
      <div className="flex gap-2 flex-wrap">
        <Link href="/sales" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">← Sales Dashboard</Link>
        <Link href="/sales/tasks" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Tasks →</Link>
        <Link href="/sales/leads" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Leads →</Link>
      </div>
    </div>
  );
}
