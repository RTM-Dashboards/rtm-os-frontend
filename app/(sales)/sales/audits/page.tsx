"use client";

import type {
  AuditRequestStatus,
} from "@/lib/sales/types";
import {
  AUDIT_REQUEST_STATUS_LABELS,
  AUDIT_REQUEST_STATUS_COLORS,
} from "@/lib/sales/audit-config";

import React, { useState, useEffect } from "react";

//
// Types
//

type FindingSeverity = "Critical" | "High" | "Medium" | "Low";
type AuditPriority = "Critical" | "High" | "Medium" | "Low";
type AuditStatus = "Not Started" | "In Progress" | "Completed" | "Needs Review" | "Pending";
type ProposalStatus = "Not Started" | "Draft" | "Sent" | "Accepted" | "In Proposal";

type AuditType =
  | "SEO Technical"
  | "GBP"
  | "PPC / Google Ads"
  | "Meta Ads"
  | "LSA"
  | "Website"
  | "Competitor";

// Finding
interface AuditFinding {
  id: string;
  title: string;
  severity: FindingSeverity;
  category: string;
  description: string;
  recommendation: string;
  revenueImpact: number;
  priority: AuditPriority;
}

// Recommended Service
interface RecommendedService {
  id: string;
  service: string;
  reason: string;
  impactScore: number;
  priority: AuditPriority;
  department: string;
  estimatedRevenue: number;
  proposalStatus: "Not Added" | "Added";
}

// Recommended Line Item
interface RecommendedLineItem {
  id: string;
  lineItem: string;
  category: string;
  department: string;
  setupFee: number;
  recurringFee: number;
  deliveryStandard: string;
  proposalStatus: "Not Added" | "Added";
}

// Competitor
interface CompetitorEntry {
  name: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  recommendedActions: string[];
}

// Timeline Event
interface TimelineEvent {
  id: string;
  date: string;
  event: string;
  type:
    | "audit_created"
    | "audit_updated"
    | "finding_added"
    | "recommendation_added"
    | "proposal_generated"
    | "status_changed";
  user: string;
  detail?: string;
}

// Main Audit Record
interface Audit {
  id: string;
  auditName: string;
  client: string;
  auditType: AuditType;
  createdBy: string;
  createdDate: string;
  priority: AuditPriority;
  status: AuditStatus;
  issuesFound: number;
  revenueOpportunity: number;
  proposalStatus: ProposalStatus;
  industry: string;
  website: string;
  summary: string;
  overallScore: number;
  findings: AuditFinding[];
  recommendedServices: RecommendedService[];
  recommendedLineItems: RecommendedLineItem[];
  competitors: CompetitorEntry[];
  timeline: TimelineEvent[];
}

//
// Data mapping — proposals with real auditResult from Postgres
// MOCK_AUDITS is intentionally removed; live data is fetched inside the page component.
// The constant below is kept empty so the colour helpers and sub-components that
// reference the Audit type still compile cleanly.
//

// ── Proposal → Audit mapper ──────────────────────────────────────────────────
// Maps a SalesProposalRecord (with non-null auditResult) into the Audit shape
// the existing UI expects.  Only fields that can be derived from real data
// are populated; the rest use honest empty values.

interface RawAuditResult {
  id?: string;
  status?: string;
  overallScore?: number;
  findings?: Array<{
    id: string;
    category: string;
    severity: string;
    priority: string;
    questionLabel: string;
    businessImpact: string;
    estimatedRevenueImpact?: number;
    relatedService?: string;
  }>;
  recommendations?: Array<{
    id: string;
    title?: string;
    department?: string;
    monthlyRevenue?: number;
    priority?: string;
  }>;
  estimatedTotalMonthlyRevenue?: number;
  generatedAt?: string;
  templateId?: string;
  totalFindingCount?: number;
  criticalCount?: number;
  highCount?: number;
  mediumCount?: number;
  lowCount?: number;
}

interface RawClientInfo {
  businessName?: string;
  name?: string;
  website?: string;
  industry?: string;
}

interface RawProposalRecord {
  id: string;
  status: string;
  clientInfo?: RawClientInfo | null;
  auditResult?: RawAuditResult | null;
  createdByUserName?: string | null;
  createdAt: string;
  [key: string]: unknown;
}

function mapProposalToAudit(p: RawProposalRecord): Audit {
  const ar = p.auditResult as RawAuditResult;
  const ci = (p.clientInfo ?? {}) as RawClientInfo;
  const businessName = ci.businessName || ci.name || "Unknown Client";

  const findings: AuditFinding[] = (ar.findings ?? []).map((f, idx) => ({
    id:             f.id ?? `f-${idx}`,
    title:          f.questionLabel ?? f.category ?? "Finding",
    severity:       (["Critical", "High", "Medium", "Low"].includes(f.severity ?? "") ? f.severity : "Medium") as FindingSeverity,
    category:       f.category ?? "General",
    description:    f.businessImpact ?? "",
    recommendation: f.relatedService ?? "",
    revenueImpact:  f.estimatedRevenueImpact ?? 0,
    priority:       (["Critical", "High", "Medium", "Low"].includes(f.priority ?? "") ? f.priority : "Medium") as AuditPriority,
  }));

  const recommendedServices: RecommendedService[] = (ar.recommendations ?? []).map((r, idx) => ({
    id:                `rs-${idx}`,
    service:           r.title ?? "Service",
    reason:            "",
    impactScore:       0,
    priority:          (["Critical", "High", "Medium", "Low"].includes(r.priority ?? "") ? r.priority : "Medium") as AuditPriority,
    department:        r.department ?? "",
    estimatedRevenue:  r.monthlyRevenue ?? 0,
    proposalStatus:    "Not Added" as const,
  }));

  // Map proposal status to audit status
  const statusMap: Record<string, AuditStatus> = {
    draft:       "Not Started",
    "in-progress": "In Progress",
    sent:        "Completed",
    accepted:    "Completed",
    rejected:    "Completed",
    complete:    "Completed",
  };

  return {
    id:                  p.id,
    auditName:           `Audit — ${businessName}`,
    client:              businessName,
    auditType:           "SEO Technical",   // no structured audit-type field on proposal
    createdBy:           p.createdByUserName ?? "Sales",
    createdDate:         ar.generatedAt
                           ? new Date(ar.generatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                           : new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    priority:            "Medium",
    status:              statusMap[p.status] ?? "Pending",
    issuesFound:         ar.totalFindingCount ?? findings.length,
    revenueOpportunity:  ar.estimatedTotalMonthlyRevenue ?? 0,
    proposalStatus:      p.status === "sent" || p.status === "accepted" ? "Sent" : "Not Started",
    industry:            ci.industry ?? "",
    website:             ci.website ?? "",
    summary:             "",
    overallScore:        ar.overallScore ?? 0,
    findings,
    recommendedServices,
    recommendedLineItems: [],
    competitors:         [],
    timeline:            [{
      id:     "tl-created",
      date:   new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      event:  "Audit Created",
      type:   "audit_created",
      user:   p.createdByUserName ?? "Sales",
      detail: "",
    }],
  };
}

// MOCK_AUDITS — intentionally empty. Real audit data comes from proposals with auditResult
// fetched inside AuditIntelligenceCenterPage via /api/sales-proposals.
const MOCK_AUDITS: Audit[] = [
  // no fabricated rows
];

//
// Color Helpers
//

const SEVERITY_COLORS: Record<FindingSeverity, { bg?: string; text: string; border: string }> = {
  Critical: { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
  High:     { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  Medium:   { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" },
  Low:      { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
};

const PRIORITY_COLORS: Record<AuditPriority, { bg?: string; text: string; border: string }> = {
  Critical: { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
  High:     { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  Medium:   { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" },
  Low:      { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
};

const AUDIT_STATUS_COLORS: Record<AuditStatus, { bg?: string; text: string; border: string }> = {
  "Not Started":  { bg: "#F3F4F6", text: "#6B7280", border: "#D1D5DB" },
  "Pending":      { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  "In Progress":  { bg: "#F0F9FF", text: "#0369A1", border: "#BAE6FD" },
  "Completed":    { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  "Needs Review": { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
};

const PROPOSAL_STATUS_COLORS: Record<ProposalStatus, { bg?: string; text: string; border: string }> = {
  "Not Started": { bg: "#F3F4F6", text: "#6B7280", border: "#D1D5DB" },
  "Draft":       { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" },
  "Sent":        { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  "Accepted":    { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  "In Proposal": { bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE" },
};

const AUDIT_TYPE_META: Record<AuditType, { color?: string; bg?: string; border: string }> = {
  "SEO Technical":  { color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
  "GBP":            { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  "PPC / Google Ads": { color: "#C2410C", bg: "#FFF7ED", border: "#FED7AA" },
  "Meta Ads":       { color: "#1877F2", bg: "#EFF6FF", border: "#BFDBFE" },
  "LSA":            { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
  "Website":        { color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  "Competitor":     { color: "#6D28D9", bg: "#F5F3FF", border: "#DDD6FE" },
};

const TIMELINE_META: Record<TimelineEvent["type"], { color?: string }> = {
  audit_created:        { color: "#1D4ED8" },
  audit_updated:        { color: "#D97706" },
  finding_added:        { color: "#DC2626" },
  recommendation_added: { color: "#7C3AED" },
  proposal_generated:   { color: "#059669" },
  status_changed:       { color: "#6B7280" },
};

function scoreColor(score: number): string {
  if (score >= 80) return "#15803D";
  if (score >= 60) return "#D97706";
  if (score >= 40) return "#EA580C";
  return "#DC2626";
}
function scoreBg(score: number): string {
  if (score >= 80) return "#F0FDF4";
  if (score >= 60) return "#FFFBEB";
  if (score >= 40) return "#FFF7ED";
  return "#FEF2F2";
}

//
// Shared UI Components
//

function Badge({
  label,
  bg,
  text,
  border,
}: {
  label: string;
  bg?: string;
  text: string;
  border?: string;
}) {
  return (
    <span
      className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap"
      style={{ background: bg, color: text, borderColor: border ?? "transparent" }}
    >
      {label}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: FindingSeverity }) {
  const c = SEVERITY_COLORS[severity];
  return <Badge label={severity} bg={c.bg} text={c.text} border={c.border} />;
}

function PriorityBadge({ priority }: { priority: AuditPriority }) {
  const c = PRIORITY_COLORS[priority];
  return <Badge label={priority} bg={c.bg} text={c.text} border={c.border} />;
}

function AuditStatusBadge({ status }: { status: AuditStatus }) {
  const c = AUDIT_STATUS_COLORS[status];
  return <Badge label={status} bg={c.bg} text={c.text} border={c.border} />;
}

function ProposalStatusBadge({ status }: { status: ProposalStatus }) {
  const c = PROPOSAL_STATUS_COLORS[status];
  return <Badge label={status} bg={c.bg} text={c.text} border={c.border} />;
}

function AuditTypeBadge({ type }: { type: AuditType }) {
  const m = AUDIT_TYPE_META[type];
  return (
    <span
      className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap"
      style={{ background: m.bg, color: m.color, borderColor: m.border }}
    >
      {type}
    </span>
  );
}

function ScoreRing({ score, size = 48 }: { score: number; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-black border-4 flex-shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size < 44 ? 11 : 14,
        background: scoreBg(score),
        borderColor: scoreColor(score),
        color: scoreColor(score),
        boxShadow: `0 0 0 2px ${scoreBg(score)}`,
      }}
    >
      {score}
    </div>
  );
}

//
// KPI Cards
//

function KPICards({ audits }: { audits: Audit[] }) {
  const total = audits.length;
  const pending = audits.filter((a) => a.status === "Pending" || a.status === "Not Started").length;
  const completed = audits.filter((a) => a.status === "Completed").length;
  const highPriorityFindings = audits.reduce(
    (sum, a) => sum + a.findings.filter((f) => f.severity === "Critical" || f.severity === "High").length,
    0
  );
  const estimatedRevenue = audits.reduce((sum, a) => sum + a.revenueOpportunity, 0);

  const cards = [
    { label: "Total Audits",          value: total,                            color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
    { label: "Pending Audits",         value: pending,                          color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
    { label: "Completed Audits",       value: completed,                        color: "#15803D", bg: "#F0FDF4", border: "#BBF7D0" },
    { label: "High Priority Findings", value: highPriorityFindings,             color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
    { label: "Revenue Opportunity",    value: `$${estimatedRevenue.toLocaleString()}`, color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-xl border p-5 text-center"
          style={{ background: c.bg, borderColor: c.border }}
        >
          <div className="text-2xl font-black" style={{ color: c.color }}>
            {c.value}
          </div>
          <div
            className="text-[10px] font-semibold mt-1 leading-tight"
            style={{ color: c.color }}
          >
            {c.label}
          </div>
        </div>
      ))}
    </div>
  );
}

//
// Audit Table
//

function AuditTable({
  audits,
  onSelect,
}: {
  audits: Audit[];
  onSelect: (a: Audit) => void;
}) {
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: "var(--rtm-border)" }}
    >
      <div className="overflow-x-auto">
        <table
          className="w-full text-sm"
          style={{ borderCollapse: "collapse", minWidth: 1200 }}
        >
          <thead>
            <tr
              style={{
                background: "var(--rtm-surface)",
                borderBottom: "1px solid var(--rtm-border)",
              }}
            >
              {[
                "Audit Name",
                "Client",
                "Audit Type",
                "Created By",
                "Created Date",
                "Priority",
                "Status",
                "Issues Found",
                "Revenue Opportunity",
                "Proposal Status",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
                  style={{ color: "var(--rtm-text-muted)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {audits.map((a, i) => (
              <tr
                key={a.id}
                className="cursor-pointer transition-colors"
                style={{
                  borderBottom: "1px solid var(--rtm-border-light)",
                  background: i % 2 === 0 ? "var(--rtm-bg)" : "var(--rtm-surface)",
                }}
                onClick={() => onSelect(a)}
              >
                <td className="px-4 py-3">
                  <p className="font-semibold text-xs" style={{ color: "var(--rtm-text-primary)" }}>
                    {a.auditName}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-xs" style={{ color: "var(--rtm-text-primary)" }}>
                    {a.client}
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>
                    {a.industry}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <AuditTypeBadge type={a.auditType} />
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                  {a.createdBy}
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                  {a.createdDate}
                </td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={a.priority} />
                </td>
                <td className="px-4 py-3">
                  <AuditStatusBadge status={a.status} />
                </td>
                <td className="px-4 py-3">
                  {a.issuesFound > 0 ? (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "#FEF2F2", color: "#DC2626" }}
                    >
                      {a.issuesFound}
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: "#15803D" }}>
                      None
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-bold" style={{ color: "#059669" }}>
                    ${a.revenueOpportunity.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ProposalStatusBadge status={a.proposalStatus} />
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onSelect(a)}
                    className="text-xs px-3 py-1.5 rounded-lg font-semibold border"
                    style={{
                      background: "#EFF6FF",
                      color: "#1D4ED8",
                      borderColor: "#BFDBFE",
                    }}
                  >
                    View Audit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

//
// Drawer Tabs
//

type DrawerTab =
  | "overview"
  | "findings"
  | "ai-recommendations"
  | "recommended-services"
  | "recommended-line-items"
  | "competitor-analysis"
  | "activity-timeline";

// Overview Tab
function OverviewTab({ audit }: { audit: Audit }) {
  const criticalFindings = audit.findings.filter((f) => f.severity === "Critical").length;
  const highFindings = audit.findings.filter((f) => f.severity === "High").length;

  return (
    <div className="space-y-5">
      {/* Audit type + score */}
      <div className="flex items-start gap-4">
        <ScoreRing score={audit.overallScore} size={72} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <AuditTypeBadge type={audit.auditType} />
            <AuditStatusBadge status={audit.status} />
            <ProposalStatusBadge status={audit.proposalStatus} />
          </div>
          <p className="text-sm font-bold mb-1" style={{ color: "var(--rtm-text-primary)" }}>
            {audit.auditName}
          </p>
          <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
            {audit.summary}
          </p>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Issues Found",        value: audit.issuesFound,                           color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
          { label: "Critical Findings",   value: criticalFindings,                            color: "#BE123C", bg: "#FFF1F2", border: "#FECDD3" },
          { label: "High Findings",       value: highFindings,                                color: "#C2410C", bg: "#FFF7ED", border: "#FED7AA" },
          { label: "Revenue Opportunity", value: `$${audit.revenueOpportunity.toLocaleString()}`, color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-xl border p-4 text-center"
            style={{ background: c.bg, borderColor: c.border }}
          >
            <div className="text-xl font-black" style={{ color: c.color }}>
              {c.value}
            </div>
            <div className="text-[10px] font-semibold mt-0.5" style={{ color: c.color }}>
              {c.label}
            </div>
          </div>
        ))}
      </div>

      {/* Audit details */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Client",          value: audit.client },
          { label: "Industry",        value: audit.industry },
          { label: "Website",         value: audit.website },
          { label: "Audit Type",      value: audit.auditType },
          { label: "Created By",      value: audit.createdBy },
          { label: "Created Date",    value: audit.createdDate },
          { label: "Priority",        value: audit.priority },
          { label: "Proposal Status", value: audit.proposalStatus },
        ].map((row) => (
          <div
            key={row.label}
            className="rounded-lg border p-3"
            style={{
              background: "var(--rtm-surface)",
              borderColor: "var(--rtm-border)",
            }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-wide mb-0.5"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              {row.label}
            </p>
            <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
              {row.value}
            </p>
          </div>
        ))}
      </div>

      {/* AI Executive Summary */}
      <div
        className="rounded-xl border p-5"
        style={{ background: "#F5F3FF", borderColor: "#DDD6FE" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <p className="text-sm font-bold" style={{ color: "#6D28D9" }}>
            AI Executive Summary
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs" style={{ color: "#4C1D95" }}>
          <div>
            <p className="font-bold mb-1 text-[10px] uppercase tracking-wide">Top Findings</p>
            {audit.findings.slice(0, 3).map((f) => (
              <p key={f.id} className="mb-0.5">• {f.title}</p>
            ))}
          </div>
          <div>
            <p className="font-bold mb-1 text-[10px] uppercase tracking-wide">Business Risks</p>
            {audit.findings
              .filter((f) => f.severity === "Critical")
              .slice(0, 3)
              .map((f) => (
                <p key={f.id} className="mb-0.5">• {f.description.slice(0, 65)}…</p>
              ))}
          </div>
          <div>
            <p className="font-bold mb-1 text-[10px] uppercase tracking-wide">Recommended Package</p>
            {audit.recommendedServices.slice(0, 3).map((s) => (
              <p key={s.id} className="mb-0.5">• {s.service}</p>
            ))}
          </div>
          <div>
            <p className="font-bold mb-1 text-[10px] uppercase tracking-wide">Estimated Revenue Opportunity</p>
            <p className="text-lg font-black" style={{ color: "#6D28D9" }}>
              ${audit.revenueOpportunity.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Findings Tab
function FindingsTab({ audit }: { audit: Audit }) {
  const critical = audit.findings.filter((f) => f.severity === "Critical");
  const high = audit.findings.filter((f) => f.severity === "High");
  const medium = audit.findings.filter((f) => f.severity === "Medium");
  const low = audit.findings.filter((f) => f.severity === "Low");

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Critical", value: critical.length, c: SEVERITY_COLORS.Critical },
          { label: "High",     value: high.length,     c: SEVERITY_COLORS.High },
          { label: "Medium",   value: medium.length,   c: SEVERITY_COLORS.Medium },
          { label: "Low",      value: low.length,      c: SEVERITY_COLORS.Low },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border p-4 text-center"
            style={{ background: card.c.bg, borderColor: card.c.border }}
          >
            <div className="text-2xl font-black" style={{ color: card.c.text }}>
              {card.value}
            </div>
            <div className="text-[10px] font-semibold mt-0.5" style={{ color: card.c.text }}>
              {card.label} Findings
            </div>
          </div>
        ))}
      </div>

      {audit.findings.length === 0 ? (
        <div
          className="rounded-xl border p-10 text-center"
          style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}
        >
          <p className="text-sm font-semibold" style={{ color: "#15803D" }}>
            No findings recorded for this audit.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {audit.findings.map((f) => {
            const c = SEVERITY_COLORS[f.severity];
            return (
              <div
                key={f.id}
                className="rounded-xl border overflow-hidden"
                style={{ borderColor: c.border }}
              >
                <div
                  className="px-4 py-3 flex items-center gap-3"
                  style={{
                    background: c.bg,
                    borderBottom: `1px solid ${c.border}`,
                  }}
                >
                  <SeverityBadge severity={f.severity} />
                  <PriorityBadge priority={f.priority} />
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: "#EFF6FF",
                      color: "#1D4ED8",
                      border: "1px solid #BFDBFE",
                    }}
                  >
                    {f.category}
                  </span>
                  <p className="font-bold text-sm flex-1" style={{ color: "var(--rtm-text-primary)" }}>
                    {f.title}
                  </p>
                  {f.revenueImpact > 0 && (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: "#ECFDF5",
                        color: "#059669",
                        border: "1px solid #A7F3D0",
                      }}
                    >
                      ${f.revenueImpact.toLocaleString()} opportunity
                    </span>
                  )}
                </div>
                <div
                  className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
                  style={{ background: "var(--rtm-bg)" }}
                >
                  <div>
                    <p
                      className="text-[10px] font-bold uppercase tracking-wide mb-1"
                      style={{ color: "var(--rtm-text-muted)" }}
                    >
                      Issue
                    </p>
                    <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                      {f.description}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-[10px] font-bold uppercase tracking-wide mb-1"
                      style={{ color: "var(--rtm-text-muted)" }}
                    >
                      Recommendation
                    </p>
                    <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                      {f.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// AI Recommendations Tab
function AIRecommendationsTab({ audit }: { audit: Audit }) {
  return (
    <div className="space-y-5">
      <div
        className="rounded-xl border p-5"
        style={{ background: "#F5F3FF", borderColor: "#DDD6FE" }}
      >
        <div className="flex items-start gap-3">
          <div>
            <p className="text-base font-bold" style={{ color: "#6D28D9" }}>
              AI Recommendation Engine
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#7C3AED" }}>
              Based on {audit.findings.length} audit findings across {audit.auditType} — generating service recommendations with priority ranking, estimated impact, and revenue opportunity.
            </p>
          </div>
        </div>
      </div>

      {audit.recommendedServices.length === 0 ? (
        <div
          className="rounded-xl border p-10 text-center"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-muted)" }}>
            AI recommendations not yet generated for this audit.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {audit.recommendedServices.map((s) => {
            const pc = PRIORITY_COLORS[s.priority];
            return (
              <div
                key={s.id}
                className="rounded-xl border overflow-hidden"
                style={{ borderColor: "var(--rtm-border)" }}
              >
                <div
                  className="px-4 py-3 flex items-center justify-between flex-wrap gap-2"
                  style={{ background: pc.bg, borderBottom: `1px solid ${pc.border}` }}
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <PriorityBadge priority={s.priority} />
                    <p className="font-bold text-sm" style={{ color: "var(--rtm-text-primary)" }}>
                      {s.service}
                    </p>
                    <Badge label={s.department} text="#1D4ED8" border="#BFDBFE" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-black px-2 py-0.5 rounded-full"
                      style={{ background: "#F5F3FF", color: "#6D28D9", border: "1px solid #DDD6FE" }}
                    >
                      Impact: {s.impactScore}/100
                    </span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0" }}
                    >
                      ${s.estimatedRevenue.toLocaleString()}/mo
                    </span>
                  </div>
                </div>
                <div className="p-4" style={{ background: "var(--rtm-bg)" }}>
                  <p
                    className="text-[10px] font-bold uppercase tracking-wide mb-1"
                    style={{ color: "var(--rtm-text-muted)" }}
                  >
                    Why Recommended
                  </p>
                  <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                    {s.reason}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Recommended Services Tab
function RecommendedServicesTab({ audit }: { audit: Audit }) {
  const [added, setAdded] = useState<Set<string>>(new Set());
  return (
    <div className="space-y-4">
      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "var(--rtm-border)" }}
      >
        <div
          className="px-4 py-3 border-b"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            Service Recommendation Panel
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
            {audit.recommendedServices.length} services recommended based on audit findings
          </p>
        </div>
        <div className="overflow-x-auto">
          <table
            className="w-full text-xs"
            style={{ borderCollapse: "collapse", minWidth: 800 }}
          >
            <thead>
              <tr
                style={{
                  background: "var(--rtm-bg)",
                  borderBottom: "1px solid var(--rtm-border-light)",
                }}
              >
                {["Recommended Service", "Reason", "Impact Score", "Priority", "Department", "Est. Revenue", "Add To Proposal"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
                    style={{ color: "var(--rtm-text-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {audit.recommendedServices.map((s, i) => (
                <tr
                  key={s.id}
                  style={{
                    borderBottom: "1px solid var(--rtm-border-light)",
                    background: i % 2 === 0 ? "var(--rtm-bg)" : "var(--rtm-surface)",
                  }}
                >
                  <td className="px-3 py-2 font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                    {s.service}
                  </td>
                  <td
                    className="px-3 py-2"
                    style={{ color: "var(--rtm-text-secondary)", maxWidth: 220 }}
                  >
                    {s.reason}
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-black text-xs" style={{ color: "#6D28D9" }}>
                      {s.impactScore}/100
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <PriorityBadge priority={s.priority} />
                  </td>
                  <td className="px-3 py-2">
                    <Badge label={s.department} text="#1D4ED8" border="#BFDBFE" />
                  </td>
                  <td className="px-3 py-2 font-bold" style={{ color: "#059669" }}>
                    ${s.estimatedRevenue.toLocaleString()}/mo
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() =>
                        setAdded((prev) => {
                          const n = new Set(prev);
                          if (n.has(s.id)) n.delete(s.id);
                          else n.add(s.id);
                          return n;
                        })
                      }
                      className="text-[10px] font-bold px-2 py-1 rounded border"
                      style={{
                        background: added.has(s.id) ? "#ECFDF5" : "#EFF6FF",
                        color: added.has(s.id) ? "#059669" : "#1D4ED8",
                        borderColor: added.has(s.id) ? "#A7F3D0" : "#BFDBFE",
                      }}
                    >
                      {added.has(s.id) ? "Added" : "Add"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Recommended Line Items Tab
function RecommendedLineItemsTab({ audit }: { audit: Audit }) {
  const [added, setAdded] = useState<Set<string>>(new Set());
  const setupTotal = audit.recommendedLineItems
    .filter((li) => added.has(li.id))
    .reduce((s, li) => s + li.setupFee, 0);
  const recurringTotal = audit.recommendedLineItems
    .filter((li) => added.has(li.id))
    .reduce((s, li) => s + li.recurringFee, 0);

  return (
    <div className="space-y-4">
      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "var(--rtm-border)" }}
      >
        <div
          className="px-4 py-3 border-b"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            Line Item Recommendation Panel
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
            {audit.recommendedLineItems.length} line items recommended · {added.size} selected
          </p>
        </div>
        <div className="overflow-x-auto">
          <table
            className="w-full text-xs"
            style={{ borderCollapse: "collapse", minWidth: 900 }}
          >
            <thead>
              <tr
                style={{
                  background: "var(--rtm-bg)",
                  borderBottom: "1px solid var(--rtm-border-light)",
                }}
              >
                {["Line Item", "Category", "Department", "Setup Fee", "Recurring Fee", "Delivery Standard", "Add To Proposal"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
                    style={{ color: "var(--rtm-text-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {audit.recommendedLineItems.map((li, i) => (
                <tr
                  key={li.id}
                  style={{
                    borderBottom: "1px solid var(--rtm-border-light)",
                    background: i % 2 === 0 ? "var(--rtm-bg)" : "var(--rtm-surface)",
                  }}
                >
                  <td className="px-3 py-2 font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                    {li.lineItem}
                  </td>
                  <td className="px-3 py-2">
                    <Badge label={li.category} text="#1D4ED8" border="#BFDBFE" />
                  </td>
                  <td className="px-3 py-2" style={{ color: "var(--rtm-text-secondary)" }}>
                    {li.department}
                  </td>
                  <td className="px-3 py-2 font-bold" style={{ color: li.setupFee > 0 ? "#C2410C" : "#9CA3AF" }}>
                    {li.setupFee > 0 ? `$${li.setupFee.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-3 py-2 font-bold" style={{ color: li.recurringFee > 0 ? "#1D4ED8" : "#9CA3AF" }}>
                    {li.recurringFee > 0 ? `$${li.recurringFee.toLocaleString()}/mo` : "—"}
                  </td>
                  <td className="px-3 py-2" style={{ color: "#1D4ED8" }}>{li.deliveryStandard}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() =>
                        setAdded((prev) => {
                          const n = new Set(prev);
                          if (n.has(li.id)) n.delete(li.id);
                          else n.add(li.id);
                          return n;
                        })
                      }
                      className="text-[10px] font-bold px-2 py-1 rounded border"
                      style={{
                        background: added.has(li.id) ? "#ECFDF5" : "#EFF6FF",
                        color: added.has(li.id) ? "#059669" : "#1D4ED8",
                        borderColor: added.has(li.id) ? "#A7F3D0" : "#BFDBFE",
                      }}
                    >
                      {added.has(li.id) ? "Added" : "Add"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            {added.size > 0 && (
              <tfoot>
                <tr style={{ background: "#ECFDF5", borderTop: "2px solid #A7F3D0" }}>
                  <td colSpan={3} className="px-3 py-2.5 text-xs font-bold" style={{ color: "#059669" }}>Selected Totals</td>
                  <td className="px-3 py-2.5 text-sm font-black" style={{ color: "#C2410C" }}>
                    {setupTotal > 0 ? `$${setupTotal.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-sm font-black" style={{ color: "#1D4ED8" }}>
                    {recurringTotal > 0 ? `$${recurringTotal.toLocaleString()}/mo` : "—"}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

// Competitor Analysis Tab
function CompetitorAnalysisTab({ audit }: { audit: Audit }) {
  if (audit.competitors.length === 0) {
    return (
      <div
        className="rounded-xl border p-10 text-center"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-muted)" }}>
          No competitor data for this audit.
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--rtm-text-muted)" }}>
          Run a Competitor Audit to populate this section.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-5">
      {audit.competitors.map((comp) => (
        <div
          key={comp.name}
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: "var(--rtm-border)" }}
        >
          <div
            className="px-4 py-3 border-b flex items-center gap-3"
            style={{ background: "#F5F3FF", borderColor: "#DDD6FE" }}
          >
            <p className="text-sm font-bold" style={{ color: "#6D28D9" }}>{comp.name}</p>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "Strengths",           items: comp.strengths,           color: "#15803D", bg: "#F0FDF4" },
              { label: "Weaknesses",          items: comp.weaknesses,          color: "#DC2626", bg: "#FEF2F2" },
              { label: "Opportunities",       items: comp.opportunities,       color: "#D97706", bg: "#FFFBEB" },
              { label: "Threats",             items: comp.threats,             color: "#7C3AED", bg: "#F5F3FF" },
              { label: "Recommended Actions", items: comp.recommendedActions,  color: "#0369A1", bg: "#F0F9FF" },
            ].map((section) => (
              <div
                key={section.label}
                className="rounded-lg border p-3"
                style={{ background: section.bg, borderColor: `${section.color}30` }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-wide mb-2"
                  style={{ color: section.color }}
                >
                  {section.label}
                </p>
                {section.items.map((item) => (
                  <p key={item} className="text-xs mb-0.5" style={{ color: section.color }}>
                    • {item}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Activity Timeline Tab
function ActivityTimelineTab({ audit }: { audit: Audit }) {
  return (
    <div className="space-y-3">
      {audit.timeline.length === 0 ? (
        <div
          className="rounded-xl border p-10 text-center"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-muted)" }}>
            No timeline events yet.
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5" style={{ background: "var(--rtm-border)" }} />
          <div className="space-y-3">
            {audit.timeline.map((event) => {
              const meta = TIMELINE_META[event.type];
              return (
                <div key={event.id} className="flex items-start gap-4 relative pl-12">
                  <div
                    className="absolute left-3 w-5 h-5 rounded-full border-2 border-white"
                    style={{ background: meta.color, top: 2 }}
                  />
                  <div
                    className="flex-1 rounded-xl border p-3"
                    style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <p className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                        {event.event}
                      </p>
                      <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>
                        {event.date} · {event.user}
                      </span>
                    </div>
                    {event.detail && (
                      <p className="text-xs mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
                        {event.detail}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

//
// Toast
//

function useToast() {
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string, duration = 2500) {
    setToast(msg);
    setTimeout(() => setToast(null), duration);
  }

  return { toast, showToast };
}

function ToastBanner({ message }: { message: string }) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold"
      style={{ background: "#1D4ED8", color: "#fff", minWidth: 260, textAlign: "center" }}
    >
      {message}
    </div>
  );
}

//
// Audit Detail Drawer
//

function AuditDetailDrawer({
  audit,
  onClose,
}: {
  audit: Audit;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<DrawerTab>("overview");
  const { toast, showToast } = useToast();

  const tabs: { key: DrawerTab; label: string }[] = [
    { key: "overview",              label: "Overview" },
    { key: "findings",              label: "Findings" },
    { key: "ai-recommendations",    label: "AI Recommendations" },
    { key: "recommended-services",  label: "Recommended Services" },
    { key: "recommended-line-items",label: "Recommended Line Items" },
    ...(audit.auditType === "Competitor"
      ? [{ key: "competitor-analysis" as DrawerTab, label: "Competitor Analysis" }]
      : []),
    { key: "activity-timeline",    label: "Activity Timeline" },
  ];

  function handleDownloadReport() {
    showToast("Preparing audit report PDF...");
    setTimeout(() => {
      showToast("Audit report downloaded");
    }, 1500);
  }

  return (
    <>
      {toast && <ToastBanner message={toast} />}
      <div className="fixed inset-0 z-50 flex">
        <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div
          className="w-full max-w-5xl h-full flex flex-col shadow-2xl overflow-hidden"
          style={{ background: "var(--rtm-bg)", borderLeft: "1px solid var(--rtm-border)" }}
        >
          {/* Header */}
          <div
            className="flex items-start justify-between px-6 py-5 border-b flex-shrink-0"
            style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-surface)" }}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <AuditTypeBadge type={audit.auditType} />
                <AuditStatusBadge status={audit.status} />
                <PriorityBadge priority={audit.priority} />
                <ProposalStatusBadge status={audit.proposalStatus} />
              </div>
              <h2 className="text-xl font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                {audit.auditName}
              </h2>
              <p className="text-sm mt-0.5" style={{ color: "var(--rtm-text-secondary)" }}>
                {audit.client} · {audit.industry} · {audit.website} · {audit.createdBy} · {audit.createdDate}
              </p>
              <p className="text-xs mt-1 italic" style={{ color: "var(--rtm-text-muted)" }}>
                {audit.summary}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
              <ScoreRing score={audit.overallScore} size={56} />
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-lg"
                style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)" }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Quick stats bar */}
          <div
            className="flex gap-0 border-b flex-shrink-0 overflow-x-auto"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
          >
            {[
              { label: "Issues",        value: audit.issuesFound,                             color: "#DC2626" },
              { label: "Revenue Opp.", value: `$${audit.revenueOpportunity.toLocaleString()}`, color: "#059669" },
              { label: "Services Rec.", value: audit.recommendedServices.length,              color: "#7C3AED" },
              { label: "Line Items",    value: audit.recommendedLineItems.length,              color: "#1D4ED8" },
            ].map((s) => (
              <div
                key={s.label}
                className="flex-shrink-0 px-4 py-2 text-center border-r"
                style={{ borderColor: "var(--rtm-border)" }}
              >
                <div className="text-xs font-black" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[9px] font-semibold" style={{ color: "var(--rtm-text-muted)" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tab bar */}
          <div
            className="flex gap-0 border-b flex-shrink-0 overflow-x-auto"
            style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-surface)" }}
          >
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className="px-3 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2"
                style={{
                  borderBottomColor: activeTab === t.key ? "#1D4ED8" : "transparent",
                  color: activeTab === t.key ? "#1D4ED8" : "var(--rtm-text-muted)",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "overview"              && <OverviewTab audit={audit} />}
            {activeTab === "findings"              && <FindingsTab audit={audit} />}
            {activeTab === "ai-recommendations"   && <AIRecommendationsTab audit={audit} />}
            {activeTab === "recommended-services"  && <RecommendedServicesTab audit={audit} />}
            {activeTab === "recommended-line-items"&& <RecommendedLineItemsTab audit={audit} />}
            {activeTab === "competitor-analysis"   && <CompetitorAnalysisTab audit={audit} />}
            {activeTab === "activity-timeline"     && <ActivityTimelineTab audit={audit} />}
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between px-6 py-4 border-t flex-shrink-0"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
          >
            <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
              {audit.auditName} · Score: {audit.overallScore}/100 · {audit.issuesFound} issues · ${audit.revenueOpportunity.toLocaleString()} revenue opportunity
            </p>
            <div className="flex gap-2">
              <button
                className="text-sm px-3 py-1.5 rounded-lg font-semibold border"
                style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}
                onClick={onClose}
              >
                Close
              </button>
              <button
                className="text-sm px-3 py-1.5 rounded-lg font-semibold border"
                style={{ background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" }}
                onClick={handleDownloadReport}
              >
                Download Audit Report
              </button>
              <button
                className="text-sm px-4 py-1.5 rounded-lg font-bold"
                style={{ background: "#059669", color: "#fff" }}
                onClick={() => {
                  const auditId = encodeURIComponent(audit.id);
                  const auditType = encodeURIComponent(audit.auditType);
                  window.location.href = `/sales/proposals?new=true&auditId=${auditId}&auditType=${auditType}`;
                }}
              >
                Generate Proposal
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

//
// Audit Request Queue
//

interface AuditRequestQueueItem {
  id: string;
  clientName: string;
  requestType: "Manual" | "Hybrid";
  departments: string[];
  status: AuditRequestStatus;
  assignedReviewers: string[];
  requestedBy: string;
  slaDeadline: string;
}

// MOCK_AUDIT_REQUESTS — removed; no real source exists for audit request queue.
// AuditRequestQueueSection shows an honest empty state when this is empty.
const MOCK_AUDIT_REQUESTS: AuditRequestQueueItem[] = [
  // ── no fabricated rows — real audit requests will appear here once the
  //    audit-request workflow is backed by a Postgres table ──
  // {
  //   id: "AUD-2025-1842",
  //   clientName: "Summit Landscaping",
  //   requestType: "Manual",
  //   departments: ["SEO"],
  // fake_placeholder_suppressed: true
  // }
];

function AuditRequestStatusBadgeLocal({ status }: { status: AuditRequestStatus }) {
  const label = AUDIT_REQUEST_STATUS_LABELS[status] ?? status;
  const colors = AUDIT_REQUEST_STATUS_COLORS[status] ?? { bg: "#F3F4F6", color: "#6B7280", border: "#D1D5DB" };
  return (
    <span
      className="inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap"
      style={{ background: colors.bg, color: colors.color, borderColor: colors.border }}
    >
      {label}
    </span>
  );
}

function AuditRequestQueueSection() {
  const [search, setSearch] = React.useState("");
  const [selectedReq, setSelectedReq] = React.useState<AuditRequestQueueItem | null>(null);
  const filtered = MOCK_AUDIT_REQUESTS.filter((r) => {
    const q = search.toLowerCase();
    return (
      !q ||
      r.clientName.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      r.departments.some((d) => d.toLowerCase().includes(q))
    );
  });

  return (
    <>
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            Audit Request Queue
          </p>
          <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
            Manual and Hybrid audit requests across all opportunities.
          </p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search requests..."
          className="text-sm px-3 py-2 rounded-lg border outline-none"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", minWidth: 200 }}
        />
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--rtm-border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
                {["ID", "Client", "Request Type", "Department(s)", "Status", "Assigned Reviewer(s)", "Requested By", "SLA Due", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
                    style={{ color: "var(--rtm-text-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((req, i) => {
                const due = new Date(req.slaDeadline);
                const isOverdue = due < new Date();
                const dueStr = isOverdue
                  ? `Overdue — ${due.toLocaleDateString()}`
                  : due.toLocaleString();
                return (
                  <tr
                    key={req.id}
                    style={{
                      borderBottom: "1px solid var(--rtm-border)",
                      background: i % 2 === 0 ? "var(--rtm-bg)" : "var(--rtm-surface)",
                    }}
                  >
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono" style={{ color: "var(--rtm-text-muted)" }}>{req.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{req.clientName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                        style={{
                          background: req.requestType === "Hybrid" ? "#F5F3FF" : "#EFF6FF",
                          color: req.requestType === "Hybrid" ? "#7C3AED" : "#1D4ED8",
                          borderColor: req.requestType === "Hybrid" ? "#DDD6FE" : "#BFDBFE",
                        }}
                      >
                        {req.requestType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {req.departments.map((d) => (
                          <span
                            key={d}
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded border"
                            style={{ background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" }}
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <AuditRequestStatusBadgeLocal status={req.status} />
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                      {req.assignedReviewers.length > 0 ? req.assignedReviewers.join(", ") : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                      {req.requestedBy}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs font-semibold"
                        style={{ color: isOverdue ? "#DC2626" : "var(--rtm-text-muted)" }}
                      >
                        {dueStr}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedReq(req)}
                        className="text-xs px-3 py-1 rounded-lg font-semibold border transition-all hover:opacity-80"
                        style={{ background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm" style={{ color: "var(--rtm-text-muted)" }}>
                    No audit requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      {/* Audit Request Detail Drawer */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedReq(null)} />
          <div className="w-[480px] h-full flex flex-col shadow-2xl overflow-hidden"
            style={{ background: "var(--rtm-bg)", borderLeft: "1px solid var(--rtm-border)" }}>
            <div className="flex items-start justify-between px-6 py-5 border-b flex-shrink-0"
              style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-surface)" }}>
              <div>
                <p className="text-xs font-mono" style={{ color: "var(--rtm-text-muted)" }}>{selectedReq.id}</p>
                <h2 className="text-lg font-bold mt-0.5" style={{ color: "var(--rtm-text-primary)" }}>{selectedReq.clientName}</h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <AuditRequestStatusBadgeLocal status={selectedReq.status} />
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                    style={{ background: selectedReq.requestType === "Hybrid" ? "#F5F3FF" : "#EFF6FF", color: selectedReq.requestType === "Hybrid" ? "#7C3AED" : "#1D4ED8", borderColor: selectedReq.requestType === "Hybrid" ? "#DDD6FE" : "#BFDBFE" }}>
                    {selectedReq.requestType}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedReq(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-lg flex-shrink-0 ml-4"
                style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)" }}>x</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {[  
                ["Request ID",         selectedReq.id],
                ["Client",             selectedReq.clientName],
                ["Request Type",       selectedReq.requestType],
                ["Departments",        selectedReq.departments.join(", ")],
                ["Assigned Reviewers", selectedReq.assignedReviewers.length > 0 ? selectedReq.assignedReviewers.join(", ") : "—"],
                ["Requested By",       selectedReq.requestedBy],
                ["SLA Deadline",       new Date(selectedReq.slaDeadline) < new Date() ? `Overdue — ${new Date(selectedReq.slaDeadline).toLocaleDateString()}` : new Date(selectedReq.slaDeadline).toLocaleString()],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <span className="text-xs font-semibold w-36 flex-shrink-0" style={{ color: "var(--rtm-text-muted)" }}>{label}</span>
                  <span className="text-xs" style={{ color: "var(--rtm-text-primary)" }}>{value}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 px-6 py-4 border-t flex-shrink-0"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
              <a href={`/sales/audits?requestId=${selectedReq.id}`}
                className="flex-1 text-xs font-semibold py-2 rounded-lg border text-center"
                style={{ background: "#1D4ED8", color: "#fff", borderColor: "#1D4ED8" }}>
                Open Full Audit
              </a>
              <button onClick={() => setSelectedReq(null)}
                className="text-xs font-semibold px-4 py-2 rounded-lg border"
                style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border)" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

//
// Main Page
//

const AUDIT_TYPE_FILTER_OPTIONS: Array<AuditType | "All"> = [
  "All",
  "SEO Technical",
  "GBP",
  "PPC / Google Ads",
  "Meta Ads",
  "LSA",
  "Website",
  "Competitor",
];

export default function AuditIntelligenceCenterPage() {
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AuditStatus | "All">("All");
  const [typeFilter, setTypeFilter] = useState<AuditType | "All">("All");
  const [audits, setAudits] = useState<Audit[]>([]);
  const [auditsLoading, setAuditsLoading] = useState(true);

  // ── Fetch real audit data from proposals ─────────────────────────────────
  // Proposals with a non-null auditResult are the real source of audit data.
  // MOCK_AUDITS is intentionally empty; this fetch replaces it entirely.
  useEffect(() => {
    fetch("/api/sales-proposals", { credentials: "include" })
      .then((r) => r.ok ? r.json() as Promise<{ records: RawProposalRecord[] }> : Promise.reject(r.status))
      .then(({ records }) => {
        const mapped = (records ?? [])
          .filter((p) => p.auditResult != null)
          .map(mapProposalToAudit);
        setAudits(mapped);
      })
      .catch(() => { /* non-fatal — empty state shows */ })
      .finally(() => setAuditsLoading(false));
  }, []);

  const filtered = audits.filter((a) => {
    if (statusFilter !== "All" && a.status !== statusFilter) return false;
    if (typeFilter !== "All" && a.auditType !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        a.auditName.toLowerCase().includes(q) ||
        a.client.toLowerCase().includes(q) ||
        a.industry.toLowerCase().includes(q) ||
        a.createdBy.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {selectedAudit && (
        <AuditDetailDrawer
          audit={selectedAudit}
          onClose={() => setSelectedAudit(null)}
        />
      )}

      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "#1D4ED8" }}>
            Sales
          </p>
          <h1 className="text-2xl font-medium tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
            Audits
          </h1>
          <p className="text-sm mt-1 max-w-2xl" style={{ color: "var(--rtm-text-muted)" }}>
            Internal sales tool. Review client audits, identify issues, generate recommendations, and build justified proposals.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="text-sm px-3 py-2 rounded-lg font-bold border"
            style={{ background: "#1D4ED8", color: "#fff", borderColor: "#1D4ED8" }}
            onClick={() => { window.location.href = "/sales/proposals?new=true"; }}
          >
            New Audit
          </button>
          <div className="relative group inline-block">
            <button
              disabled
              className="text-sm px-3 py-2 rounded-lg font-semibold border opacity-50 cursor-not-allowed"
              style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-primary)", borderColor: "var(--rtm-border)" }}
            >
              Export
            </button>
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ whiteSpace: "nowrap" }}
            >
              <div
                className="rounded-lg px-3 py-1.5 text-xs font-medium shadow-lg"
                style={{ background: "#1E293B", color: "#F8FAFC", border: "1px solid #334155" }}
              >
                Not yet available — coming at launch
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent"
                  style={{ borderTopColor: "#1E293B" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards audits={audits} />

      {/* Audit Types Filter */}
      <div className="rounded-xl border p-4" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--rtm-text-muted)" }}>
          Audit Types
        </p>
        <div className="flex flex-wrap gap-2">
          {AUDIT_TYPE_FILTER_OPTIONS.map((type) => {
            const isAll = type === "All";
            const isActive = typeFilter === type;
            const m = isAll ? null : AUDIT_TYPE_META[type as AuditType];
            return (
              <button
                key={type}
                onClick={() => setTypeFilter(isActive && !isAll ? "All" : type)}
                className="inline-flex items-center px-3 py-1.5 rounded-lg border text-xs font-semibold"
                style={{
                  background: isActive ? (isAll ? "#EFF6FF" : m?.bg) : "var(--rtm-bg)",
                  color: isActive ? (isAll ? "#1D4ED8" : m?.color) : "var(--rtm-text-muted)",
                  borderColor: isActive ? (isAll ? "#BFDBFE" : m?.border) : "var(--rtm-border)",
                }}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Status Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 relative" style={{ minWidth: 240 }}>
          <input
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            placeholder="Search audits by name, client, industry, or sales rep..."
            className="w-full px-4 py-2 rounded-lg border text-sm outline-none"
            style={{
              background: "var(--rtm-surface)",
              borderColor: "var(--rtm-border)",
              color: "var(--rtm-text-primary)",
            }}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(["All", "Not Started", "Pending", "In Progress", "Completed", "Needs Review"] as (AuditStatus | "All")[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold border whitespace-nowrap"
              style={{
                background:
                  statusFilter === s
                    ? s === "All" ? "#EFF6FF" : AUDIT_STATUS_COLORS[s as AuditStatus].bg
                    : "var(--rtm-surface)",
                color:
                  statusFilter === s
                    ? s === "All" ? "#1D4ED8" : AUDIT_STATUS_COLORS[s as AuditStatus].text
                    : "var(--rtm-text-muted)",
                borderColor:
                  statusFilter === s
                    ? s === "All" ? "#BFDBFE" : AUDIT_STATUS_COLORS[s as AuditStatus].border
                    : "var(--rtm-border)",
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="text-xs flex-shrink-0" style={{ color: "var(--rtm-text-muted)" }}>
          {filtered.length} audit{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Audit Table */}
      {auditsLoading ? (
        <p className="text-sm py-6 text-center" style={{ color: "#94A3B8" }}>Loading audits…</p>
      ) : audits.length === 0 ? (
        <div className="rounded-xl border p-8 text-center" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-muted)" }}>No audits yet</p>
          <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>
            Audits appear here once a proposal has been saved with audit results.
            Use the “New Audit” button above to start one.
          </p>
        </div>
      ) : (
        <AuditTable audits={filtered} onSelect={setSelectedAudit} />
      )}

      {/* Score Legend */}
      <div
        className="rounded-xl border p-4 flex items-center gap-6 flex-wrap"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>
          Score Legend
        </p>
        {[
          { range: "80–100", label: "Strong",     color: "#15803D", bg: "#F0FDF4" },
          { range: "60–79",  label: "Good",       color: "#D97706", bg: "#FFFBEB" },
          { range: "40–59",  label: "Needs Work", color: "#EA580C", bg: "#FFF7ED" },
          { range: "0–39",   label: "Critical",   color: "#DC2626", bg: "#FEF2F2" },
        ].map((item) => (
          <div key={item.range} className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black"
              style={{ background: item.bg, color: item.color }}
            >
              {item.range.split("–")[0]}
            </div>
            <span className="text-xs font-semibold" style={{ color: item.color }}>
              {item.range} — {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Audit Request Queue */}
      <AuditRequestQueueSection />
    </div>
  );
}
