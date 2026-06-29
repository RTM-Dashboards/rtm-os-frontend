"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";

// Engine & config imports
import {
  generateAuditForIntake,
  generateMockAnswers,
  getSectionsForGoals,
  DEFAULT_AUDIT_TEMPLATE,
} from "@/lib/sales/audit-engine";
import type { AuditResult, AuditFinding } from "@/lib/sales/audit-engine";
import {
  generateRecommendationsFromAudit,
  getGroupConfig,
  getProposalReadinessConfig,
  getPriorityConfig,
  RECOMMENDATION_GROUP_CONFIG,
  PROPOSAL_READINESS_CONFIG,
} from "@/lib/sales/recommendation-engine";
import type {
  RecommendationResult,
  RecommendationItem,
  RecommendationGroup_Result,
  DepartmentImpact,
  ProposalReadinessQueue,
  PriorityMatrixItem,
  RecommendationStatus,
} from "@/lib/sales/recommendation-engine";
import type {
  RecommendationPriority,
  ProposalReadiness,
  RecommendationGroup,
} from "@/lib/sales/recommendation-config";
import { AUDIT_GOAL_CONFIG } from "@/lib/sales/intake-config";

// ─── Demo Audit + Recommendation Generation ───────────────────────────────────
// In production this would come from saved audit state / API.
// For demo: generate a realistic audit and feed it to the recommendation engine.

const DEMO_GOAL_IDS = ["goal-leads", "goal-seo", "goal-gbp", "goal-ppc", "goal-meta", "goal-ai-search"];
const DEMO_GOAL_LABELS = ["Lead Generation", "SEO Ranking", "Google Business Profile", "PPC / Google Ads", "Meta Ads", "AI Search Visibility"];

function buildDemoResult(): RecommendationResult {
  const sections = getSectionsForGoals(DEFAULT_AUDIT_TEMPLATE, DEMO_GOAL_IDS);
  const answers = generateMockAnswers(sections, "average");
  const auditResult = generateAuditForIntake(DEMO_GOAL_IDS, DEMO_GOAL_LABELS, answers);
  return generateRecommendationsFromAudit(auditResult, 12);
}

const DEMO_RESULT = buildDemoResult();

// ─── Shared Utilities ─────────────────────────────────────────────────────────

function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

function fmt(n: number): string {
  return n.toLocaleString();
}

// ─── Badge Components ──────────────────────────────────────────────────────────

function Badge({
  label,
  bg,
  color,
  border,
  size = "sm",
}: {
  label: string;
  bg?: string;
  color: string;
  border?: string;
  size?: "xs" | "sm" | "md";
}) {
  const sizeClass =
    size === "xs" ? "text-[9px] px-1.5 py-0.5" :
    size === "md" ? "text-xs px-3 py-1" :
    "text-[10px] px-2 py-0.5";
  return (
    <span
      className={cn("inline-flex items-center font-bold rounded-full border whitespace-nowrap", sizeClass)}
      style={{ background: bg, color, borderColor: border ?? "transparent" }}
    >
      {label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: RecommendationPriority }) {
  const cfg = getPriorityConfig(priority);
  return <Badge label={priority} bg={cfg.bg} color={cfg.color} border={cfg.border} />;
}

function ProposalReadinessBadge({ readiness }: { readiness: ProposalReadiness }) {
  const cfg = getProposalReadinessConfig(readiness);
  return <Badge label={cfg.label} bg={cfg.bg} color={cfg.color} border={cfg.border} size="xs" />;
}

function GroupBadge({ group }: { group: RecommendationGroup }) {
  const cfg = getGroupConfig(group);
  return <Badge label={cfg.label} bg={cfg.bg} color={cfg.color} border={cfg.border} size="xs" />;
}

function StatusBadge({ status }: { status: RecommendationStatus }) {
  const COLORS: Record<RecommendationStatus, { bg: string; color: string; border: string }> = {
    "Pending":                   { bg: "#F9FAFB", color: "#6B7280", border: "#E5E7EB" },
    "Approved for Proposal":     { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" },
    "Future Phase":              { bg: "#F5F3FF", color: "#7C3AED", border: "#DDD6FE" },
    "Optional":                  { bg: "#F0F9FF", color: "#0369A1", border: "#BAE6FD" },
    "Needs Pricing Review":      { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
    "Sent to Proposal Builder":  { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
  };
  const c = COLORS[status];
  return <Badge label={status} bg={c.bg} color={c.color} border={c.border} size="xs" />;
}

// ─── Three-Dot Action Menu ─────────────────────────────────────────────────────

const ACTION_MENU_OPTIONS: { label: string; status?: RecommendationStatus }[] = [
  { label: "View Recommendation" },
  { label: "Approve for Proposal", status: "Approved for Proposal" },
  { label: "Move to Future Phase", status: "Future Phase" },
  { label: "Mark as Optional", status: "Optional" },
  { label: "Request Pricing Review", status: "Needs Pricing Review" },
  { label: "Add Sales Note" },
  { label: "Send to Proposal Builder", status: "Sent to Proposal Builder" },
];

function ActionMenu({
  rec,
  onSelect,
  onStatusChange,
}: {
  rec: RecommendationItem;
  onSelect: (rec: RecommendationItem) => void;
  onStatusChange: (id: string, status: RecommendationStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="w-7 h-7 rounded-md flex items-center justify-center border text-sm font-bold"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-muted)" }}
      >
        ···
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-8 z-50 rounded-xl border shadow-lg overflow-hidden min-w-[200px]"
            style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}
          >
            {ACTION_MENU_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-gray-50 border-b last:border-0"
                style={{ color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border-light)" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  if (opt.label === "View Recommendation") {
                    onSelect(rec);
                  } else if (opt.status) {
                    onStatusChange(rec.id, opt.status);
                  }
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Audit Source Summary ──────────────────────────────────────────────────────

function AuditSourceSummary({ result }: { result: RecommendationResult }) {
  const severityItems = [
    { label: "Critical", count: result.criticalAuditFindings, color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
    { label: "Total Findings", count: result.totalAuditFindings, color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB" },
  ];

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: "var(--rtm-border)" }}
    >
      <div
        className="px-5 py-4 border-b flex items-center justify-between"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <div>
          <p className="text-sm font-black" style={{ color: "var(--rtm-text-primary)" }}>
            Audit Source
          </p>
          <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
            Audit ID: {result.sourceAuditId} — Generated {new Date(result.generatedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold px-3 py-1 rounded-full border"
            style={{ background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" }}
          >
            {result.status}
          </span>
          <Link
            href="/sales/audit-report"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
            style={{ background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" }}
          >
            View Audit Report
          </Link>
        </div>
      </div>
      <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>
            Audit Score
          </p>
          <p className="text-2xl font-black" style={{ color: result.auditScore < 40 ? "#DC2626" : result.auditScore < 65 ? "#EA580C" : "#15803D" }}>
            {result.auditScore}/100
          </p>
          <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{result.auditScoringLabel}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>
            Total Findings
          </p>
          <p className="text-2xl font-black" style={{ color: "var(--rtm-text-primary)" }}>{result.totalAuditFindings}</p>
          <p className="text-[10px]" style={{ color: "#DC2626" }}>{result.criticalAuditFindings} Critical</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>
            Goals Audited
          </p>
          <p className="text-2xl font-black" style={{ color: "var(--rtm-text-primary)" }}>{result.goalIds.length}</p>
          <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{result.goalLabels.slice(0, 2).join(", ")}{result.goalLabels.length > 2 ? ` +${result.goalLabels.length - 2}` : ""}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>
            Recommendations
          </p>
          <p className="text-2xl font-black" style={{ color: "#7C3AED" }}>{result.summary.totalRecommendations}</p>
          <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{result.summary.readyForProposalCount} Ready for Proposal</p>
        </div>
      </div>
      {/* Goal pills */}
      <div className="px-5 pb-4 flex flex-wrap gap-2">
        {result.goalLabels.map((label) => (
          <span
            key={label}
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
            style={{ background: "#F5F3FF", color: "#7C3AED", borderColor: "#DDD6FE" }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Summary KPI Cards ────────────────────────────────────────────────────────

function SummaryCards({ result }: { result: RecommendationResult }) {
  const cards = [
    {
      label: "Total Monthly Revenue",
      value: `$${fmt(result.summary.totalMonthlyRevenue)}/mo`,
      sub: `$${fmt(result.summary.totalAnnualRevenue)} annual`,
      color: "#059669",
      bg: "#ECFDF5",
      border: "#A7F3D0",
    },
    {
      label: "Setup Revenue",
      value: `$${fmt(result.summary.totalSetupRevenue)}`,
      sub: "one-time fees",
      color: "#1D4ED8",
      bg: "#EFF6FF",
      border: "#BFDBFE",
    },
    {
      label: "Critical Priority",
      value: result.summary.criticalCount,
      sub: `+ ${result.summary.highCount} High`,
      color: "#DC2626",
      bg: "#FEF2F2",
      border: "#FECACA",
    },
    {
      label: "Ready for Proposal",
      value: result.summary.readyForProposalCount,
      sub: `${result.summary.needsReviewCount} Needs Review`,
      color: "#7C3AED",
      bg: "#F5F3FF",
      border: "#DDD6FE",
    },
    {
      label: "Quick Wins",
      value: result.summary.quickWinCount,
      sub: "fast-impact actions",
      color: "#C2410C",
      bg: "#FFF7ED",
      border: "#FED7AA",
    },
    {
      label: "Avg Confidence Score",
      value: `${result.summary.avgConfidenceScore}%`,
      sub: `${result.summary.totalRecommendations} recommendations`,
      color: "#0369A1",
      bg: "#F0F9FF",
      border: "#BAE6FD",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-xl border p-4 text-center"
          style={{ background: c.bg, borderColor: c.border }}
        >
          <p className="text-xl font-black" style={{ color: c.color }}>{c.value}</p>
          <p className="text-[10px] font-bold mt-1 leading-tight" style={{ color: c.color }}>{c.label}</p>
          <p className="text-[9px] mt-0.5" style={{ color: c.color, opacity: 0.7 }}>{c.sub}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Recommendation Groups Panel ──────────────────────────────────────────────

function RecommendationGroupsPanel({
  groups,
  onSelect,
  statusMap,
  onStatusChange,
}: {
  groups: RecommendationGroup_Result[];
  onSelect: (rec: RecommendationItem) => void;
  statusMap: Record<string, RecommendationStatus>;
  onStatusChange: (id: string, status: RecommendationStatus) => void;
}) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(groups.map((g) => g.group))
  );

  function toggleGroup(group: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const isExpanded = expandedGroups.has(group.group);
        return (
          <div
            key={group.group}
            className="rounded-xl border overflow-hidden"
            style={{ borderColor: group.border }}
          >
            {/* Group header */}
            <button
              className="w-full flex items-center justify-between px-5 py-4 text-left border-b"
              style={{ background: group.bg, borderColor: group.border }}
              onClick={() => toggleGroup(group.group)}
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: group.color }}
                />
                <div>
                  <p className="text-sm font-black" style={{ color: group.color }}>
                    {group.label}
                  </p>
                  <p className="text-[10px]" style={{ color: group.color, opacity: 0.8 }}>
                    {group.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-bold" style={{ color: group.color }}>
                    ${fmt(group.totalMonthlyFee)}/mo + ${fmt(group.totalSetupFee)} setup
                  </p>
                  <p className="text-[10px]" style={{ color: group.color, opacity: 0.7 }}>
                    ${fmt(group.totalRevenueImpact)} est. impact
                  </p>
                </div>
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black border"
                  style={{ background: "white", color: group.color, borderColor: group.border }}
                >
                  {group.items.length}
                </span>
                <span className="text-sm" style={{ color: group.color }}>
                  {isExpanded ? "▲" : "▼"}
                </span>
              </div>
            </button>

            {/* Group items */}
            {isExpanded && (
              <div style={{ background: "var(--rtm-bg)" }}>
                {group.items.map((rec, idx) => {
                  const currentStatus = statusMap[rec.id] ?? rec.status;
                  return (
                    <div
                      key={rec.id}
                      className="border-b last:border-0 px-5 py-4 hover:bg-gray-50 cursor-pointer"
                      style={{ borderColor: "var(--rtm-border-light)" }}
                      onClick={() => onSelect(rec)}
                    >
                      <div className="flex items-start gap-4">
                        {/* Priority indicator */}
                        <div
                          className="w-1 self-stretch rounded-full flex-shrink-0"
                          style={{ background: getPriorityConfig(rec.priority).color }}
                        />
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                                  {rec.serviceName}
                                </p>
                                <PriorityBadge priority={rec.priority} />
                                <ProposalReadinessBadge readiness={rec.proposalReadiness} />
                                <StatusBadge status={currentStatus} />
                              </div>
                              <p className="text-xs mb-2" style={{ color: "var(--rtm-text-secondary)" }}>
                                {rec.businessImpact}
                              </p>
                              <div className="flex flex-wrap gap-3 text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>
                                <span>
                                  Dept: <strong style={{ color: rec.departmentColor }}>{rec.department}</strong>
                                </span>
                                <span>
                                  Timeline: <strong>{rec.estimatedTimeline}</strong>
                                </span>
                                {rec.estimatedMonthlyFee > 0 && (
                                  <span>
                                    Monthly: <strong style={{ color: "#059669" }}>${fmt(rec.estimatedMonthlyFee)}/mo</strong>
                                  </span>
                                )}
                                {rec.estimatedSetupFee > 0 && (
                                  <span>
                                    Setup: <strong style={{ color: "#1D4ED8" }}>${fmt(rec.estimatedSetupFee)}</strong>
                                  </span>
                                )}
                                <span>
                                  Confidence: <strong style={{ color: rec.confidenceScore >= 90 ? "#059669" : rec.confidenceScore >= 70 ? "#D97706" : "#DC2626" }}>
                                    {rec.confidenceScore}%
                                  </strong>
                                </span>
                                <span>
                                  Findings: <strong>{rec.triggerFindingCount}</strong>
                                </span>
                              </div>
                            </div>
                            {/* Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                              <ActionMenu
                                rec={rec}
                                onSelect={onSelect}
                                onStatusChange={onStatusChange}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Priority Matrix ───────────────────────────────────────────────────────────

function PriorityMatrixView({ items }: { items: PriorityMatrixItem[] }) {
  const EFFORT_LABELS = ["Low", "Medium", "High"] as const;
  const IMPACT_LABELS = ["Low", "Medium", "High"] as const;

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: "var(--rtm-border)" }}
    >
      <div
        className="px-5 py-4 border-b"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <p className="text-sm font-black" style={{ color: "var(--rtm-text-primary)" }}>Priority Matrix</p>
        <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>Effort vs. Impact — configuration-driven priority scoring</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
              {["Service", "Priority", "Effort", "Impact", "Revenue Opportunity", "Group"].map((h) => (
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
            {items.map((item, i) => {
              const groupCfg = getGroupConfig(item.group);
              const priorityCfg = getPriorityConfig(item.priority);
              const effortColor = item.effort === "Low" ? "#15803D" : item.effort === "Medium" ? "#D97706" : "#DC2626";
              const impactColor = item.impact === "High" ? "#059669" : item.impact === "Medium" ? "#D97706" : "#6B7280";
              return (
                <tr
                  key={item.recommendationId}
                  style={{
                    borderBottom: "1px solid var(--rtm-border-light)",
                    background: i % 2 === 0 ? "var(--rtm-bg)" : "var(--rtm-surface)",
                  }}
                >
                  <td className="px-4 py-3 font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                    {item.serviceName}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                      style={{ background: priorityCfg.bg, color: priorityCfg.color, borderColor: priorityCfg.border }}
                    >
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold" style={{ color: effortColor }}>{item.effort}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold" style={{ color: impactColor }}>{item.impact}</span>
                  </td>
                  <td className="px-4 py-3 font-bold" style={{ color: "#059669" }}>
                    ${fmt(item.revenueImpact)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full border"
                      style={{ background: groupCfg.bg, color: groupCfg.color, borderColor: groupCfg.border }}
                    >
                      {item.group}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Revenue Opportunity Table ─────────────────────────────────────────────────

function RevenueOpportunityTable({ recs }: { recs: RecommendationItem[] }) {
  const sorted = [...recs].sort((a, b) => b.revenueImpactEstimate - a.revenueImpactEstimate);
  const totalMonthly = recs.reduce((s, r) => s + r.estimatedMonthlyFee, 0);
  const totalSetup = recs.reduce((s, r) => s + r.estimatedSetupFee, 0);

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: "var(--rtm-border)" }}
    >
      <div
        className="px-5 py-4 border-b flex items-center justify-between"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <div>
          <p className="text-sm font-black" style={{ color: "var(--rtm-text-primary)" }}>Revenue Opportunity Table</p>
          <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>Sorted by estimated revenue impact</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-bold" style={{ color: "#059669" }}>${fmt(totalMonthly)}/mo</p>
            <p className="text-[9px]" style={{ color: "var(--rtm-text-muted)" }}>+ ${fmt(totalSetup)} setup</p>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs" style={{ borderCollapse: "collapse", minWidth: 900 }}>
          <thead>
            <tr style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
              {["Service", "Department", "Monthly Fee", "Setup Fee", "Est. Revenue Impact", "Timeline", "Priority", "Readiness"].map((h) => (
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
            {sorted.map((rec, i) => (
              <tr
                key={rec.id}
                style={{
                  borderBottom: "1px solid var(--rtm-border-light)",
                  background: i % 2 === 0 ? "var(--rtm-bg)" : "var(--rtm-surface)",
                }}
              >
                <td className="px-4 py-3 font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{rec.serviceName}</td>
                <td className="px-4 py-3">
                  <span className="text-[10px] font-semibold" style={{ color: rec.departmentColor }}>{rec.department}</span>
                </td>
                <td className="px-4 py-3 font-bold" style={{ color: rec.estimatedMonthlyFee > 0 ? "#059669" : "#9CA3AF" }}>
                  {rec.estimatedMonthlyFee > 0 ? `$${fmt(rec.estimatedMonthlyFee)}/mo` : "—"}
                </td>
                <td className="px-4 py-3 font-bold" style={{ color: rec.estimatedSetupFee > 0 ? "#1D4ED8" : "#9CA3AF" }}>
                  {rec.estimatedSetupFee > 0 ? `$${fmt(rec.estimatedSetupFee)}` : "—"}
                </td>
                <td className="px-4 py-3 font-bold" style={{ color: "#059669" }}>${fmt(rec.revenueImpactEstimate)}</td>
                <td className="px-4 py-3" style={{ color: "var(--rtm-text-secondary)" }}>{rec.estimatedTimeline}</td>
                <td className="px-4 py-3"><PriorityBadge priority={rec.priority} /></td>
                <td className="px-4 py-3"><ProposalReadinessBadge readiness={rec.proposalReadiness} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Department Impact ─────────────────────────────────────────────────────────

function DepartmentImpactPanel({ departments }: { departments: DepartmentImpact[] }) {
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: "var(--rtm-border)" }}
    >
      <div
        className="px-5 py-4 border-b"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <p className="text-sm font-black" style={{ color: "var(--rtm-text-primary)" }}>Department Impact</p>
        <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>Recommendations and revenue by department</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
        {departments.map((dept) => (
          <div key={dept.department} className="p-5 border-b last:border-b-0" style={{ borderColor: "var(--rtm-border)" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: dept.color }} />
              <p className="text-sm font-black" style={{ color: dept.color }}>{dept.department}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>
                  Recommendations
                </p>
                <p className="text-xl font-black" style={{ color: dept.color }}>{dept.recommendationCount}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>
                  Findings
                </p>
                <p className="text-xl font-black" style={{ color: "var(--rtm-text-primary)" }}>{dept.findingCount}</p>
                {dept.criticalCount > 0 && (
                  <p className="text-[9px]" style={{ color: "#DC2626" }}>{dept.criticalCount} Critical</p>
                )}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>
                  Monthly Rev
                </p>
                <p className="text-sm font-black" style={{ color: "#059669" }}>
                  {dept.totalMonthlyFee > 0 ? `$${fmt(dept.totalMonthlyFee)}/mo` : "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>
                  Setup Fees
                </p>
                <p className="text-sm font-black" style={{ color: "#1D4ED8" }}>
                  {dept.totalSetupFee > 0 ? `$${fmt(dept.totalSetupFee)}` : "—"}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              {dept.services.map((svc) => (
                <p key={svc} className="text-[10px]" style={{ color: "var(--rtm-text-secondary)" }}>
                  • {svc}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Proposal Readiness Queue ──────────────────────────────────────────────────

function ProposalReadinessQueuePanel({
  queue,
  onSelect,
}: {
  queue: ProposalReadinessQueue[];
  onSelect: (rec: RecommendationItem) => void;
}) {
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: "var(--rtm-border)" }}
    >
      <div
        className="px-5 py-4 border-b"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <p className="text-sm font-black" style={{ color: "var(--rtm-text-primary)" }}>Proposal Readiness Queue</p>
        <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>Grouped by proposal readiness status</p>
      </div>
      <div className="divide-y" style={{ borderColor: "var(--rtm-border)" }}>
        {queue.map((q) => (
          <div key={q.readiness}>
            <div
              className="px-5 py-3 flex items-center justify-between"
              style={{ background: q.bg, borderBottom: `1px solid ${q.border}` }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: q.color }} />
                <p className="text-xs font-bold" style={{ color: q.color }}>{q.label}</p>
              </div>
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black border"
                style={{ background: "white", color: q.color, borderColor: q.border }}
              >
                {q.count}
              </span>
            </div>
            <div style={{ background: "var(--rtm-bg)" }}>
              {q.items.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center justify-between px-5 py-3 border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                  style={{ borderColor: "var(--rtm-border-light)" }}
                  onClick={() => onSelect(rec)}
                >
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                      {rec.serviceName}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>
                      {rec.department} · {rec.estimatedTimeline}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {rec.estimatedMonthlyFee > 0 && (
                      <span className="text-[10px] font-bold" style={{ color: "#059669" }}>
                        ${fmt(rec.estimatedMonthlyFee)}/mo
                      </span>
                    )}
                    <PriorityBadge priority={rec.priority} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Recommendation Detail Drawer ─────────────────────────────────────────────

type DrawerTab =
  | "overview"
  | "source-findings"
  | "deliverables"
  | "pricing"
  | "timeline"
  | "dependencies"
  | "proposal-readiness"
  | "activity";

const DRAWER_TABS: { id: DrawerTab; label: string }[] = [
  { id: "overview",           label: "Overview" },
  { id: "source-findings",    label: "Source Findings" },
  { id: "deliverables",       label: "Deliverables" },
  { id: "pricing",            label: "Pricing" },
  { id: "timeline",           label: "Timeline" },
  { id: "dependencies",       label: "Dependencies" },
  { id: "proposal-readiness", label: "Proposal Readiness" },
  { id: "activity",           label: "Activity" },
];

// -- Overview Tab
function DrawerOverview({ rec, currentStatus }: { rec: RecommendationItem; currentStatus: RecommendationStatus }) {
  const priorityCfg = getPriorityConfig(rec.priority);
  const groupCfg = getGroupConfig(rec.group);

  return (
    <div className="space-y-5">
      {/* Business Impact */}
      <div className="rounded-xl border p-4" style={{ background: "#EFF6FF", borderColor: "#BFDBFE" }}>
        <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "#1D4ED8" }}>
          Business Impact
        </p>
        <p className="text-sm" style={{ color: "#1E3A8A" }}>{rec.businessImpact}</p>
      </div>

      {/* Expected Outcome */}
      <div className="rounded-xl border p-4" style={{ background: "#ECFDF5", borderColor: "#A7F3D0" }}>
        <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "#059669" }}>
          Expected Outcome
        </p>
        <p className="text-sm" style={{ color: "#065F46" }}>{rec.expectedOutcome}</p>
      </div>

      {/* Metadata grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Service", value: rec.serviceName },
          { label: "Department", value: rec.department },
          { label: "Priority", value: rec.priority },
          { label: "Group", value: rec.group },
          { label: "Severity", value: rec.severity },
          { label: "Status", value: currentStatus },
          { label: "Monthly Fee", value: rec.estimatedMonthlyFee > 0 ? `$${fmt(rec.estimatedMonthlyFee)}/mo` : "—" },
          { label: "Setup Fee", value: rec.estimatedSetupFee > 0 ? `$${fmt(rec.estimatedSetupFee)}` : "—" },
          { label: "Est. Timeline", value: rec.estimatedTimeline },
          { label: "Hours/Month", value: rec.estimatedHoursPerMonth > 0 ? `${rec.estimatedHoursPerMonth} hrs` : "One-time" },
          { label: "Confidence", value: `${rec.confidenceScore}%` },
          { label: "Revenue Opportunity", value: `$${fmt(rec.revenueImpactEstimate)}` },
        ].map((row) => (
          <div
            key={row.label}
            className="rounded-lg border p-3"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
          >
            <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: "var(--rtm-text-muted)" }}>
              {row.label}
            </p>
            <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{row.value}</p>
          </div>
        ))}
      </div>

      {/* Source info */}
      <div
        className="rounded-xl border p-4"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>
          Source References
        </p>
        <p className="text-xs mb-1" style={{ color: "var(--rtm-text-secondary)" }}>
          Audit ID: <span className="font-mono" style={{ color: "var(--rtm-text-primary)" }}>{rec.sourceAuditId}</span>
        </p>
        <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
          Trigger Findings: <strong>{rec.triggerFindingCount}</strong>
        </p>
      </div>
    </div>
  );
}

// -- Source Findings Tab
function DrawerSourceFindings({ rec }: { rec: RecommendationItem }) {
  if (rec.triggerFindings.length === 0) {
    return (
      <div
        className="rounded-xl border p-10 text-center"
        style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}
      >
        <p className="text-sm font-semibold" style={{ color: "#15803D" }}>No source findings linked.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
        {rec.triggerFindings.length} finding(s) triggered this recommendation
      </p>
      {rec.triggerFindings.map((f) => {
        const severityColors: Record<string, { bg: string; color: string; border: string }> = {
          Critical: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
          High:     { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" },
          Medium:   { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
          Low:      { bg: "#F0FDF4", color: "#15803D", border: "#BBF7D0" },
        };
        const sc = severityColors[f.severity] ?? severityColors.Low;
        return (
          <div
            key={f.id}
            className="rounded-xl border p-4"
            style={{ background: sc.bg, borderColor: sc.border }}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-xs font-bold" style={{ color: sc.color }}>{f.questionLabel}</p>
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap"
                style={{ background: "white", color: sc.color, borderColor: sc.border }}
              >
                {f.severity}
              </span>
            </div>
            <p className="text-[10px] mb-1" style={{ color: "var(--rtm-text-secondary)" }}>
              Section: {f.sectionLabel} · Department: {f.department}
            </p>
            <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{f.businessImpact}</p>
            <div className="mt-2 flex gap-2 flex-wrap">
              <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full border"
                style={{ background: "white", color: "#6B7280", borderColor: "#E5E7EB" }}>
                Effort: {f.estimatedEffort}
              </span>
              {f.isQuickWin && (
                <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full border"
                  style={{ background: "#FFF7ED", color: "#C2410C", borderColor: "#FED7AA" }}>
                  Quick Win
                </span>
              )}
              {f.isRevenueOpportunity && (
                <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full border"
                  style={{ background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" }}>
                  Revenue Opportunity
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// -- Deliverables Tab
function DrawerDeliverables({ rec }: { rec: RecommendationItem }) {
  return (
    <div className="space-y-4">
      <div
        className="rounded-xl border p-4"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            {rec.serviceName} — Deliverables
          </p>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
            style={{ background: rec.departmentBg, color: rec.departmentColor, borderColor: rec.departmentBorder }}
          >
            {rec.department}
          </span>
        </div>
        <div className="space-y-2">
          {rec.deliverables.map((d, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-lg border p-3"
              style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0 mt-0.5"
                style={{ background: rec.departmentBg, color: rec.departmentColor, border: `1px solid ${rec.departmentBorder}` }}
              >
                {i + 1}
              </span>
              <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{d}</p>
            </div>
          ))}
        </div>
      </div>
      <div
        className="rounded-xl border p-4"
        style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}
      >
        <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: "#D97706" }}>
          Note
        </p>
        <p className="text-xs" style={{ color: "#92400E" }}>
          Deliverables are driven by the Settings &rarr; Service Catalog configuration and may be adjusted by
          the account team during proposal review.
        </p>
      </div>
    </div>
  );
}

// -- Pricing Tab
function DrawerPricing({ rec }: { rec: RecommendationItem }) {
  const annual = rec.estimatedMonthlyFee * 12 + rec.estimatedSetupFee;
  const items = [
    { label: "Monthly Management Fee", value: rec.estimatedMonthlyFee, cycle: "/mo", color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
    { label: "One-Time Setup Fee", value: rec.estimatedSetupFee, cycle: "", color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
    { label: "Annual Contract Value", value: annual, cycle: "/yr", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
    { label: "Estimated Revenue Opportunity", value: rec.revenueImpactEstimate, cycle: "", color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border p-4 text-center"
            style={{ background: item.bg, borderColor: item.border }}
          >
            <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: item.color }}>
              {item.label}
            </p>
            <p className="text-xl font-black" style={{ color: item.color }}>
              {item.value > 0 ? `$${fmt(item.value)}${item.cycle}` : "—"}
            </p>
          </div>
        ))}
      </div>
      <div
        className="rounded-xl border p-4"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>
          Pricing Source
        </p>
        <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
          Pricing is sourced from Settings &rarr; Service Catalog &rarr; Line Items &rarr; Pricing Rules.
          Custom pricing can be set during proposal review.
        </p>
      </div>
    </div>
  );
}

// -- Timeline Tab
function DrawerTimeline({ rec }: { rec: RecommendationItem }) {
  const phases = [
    { phase: "Discovery & Kickoff", duration: "Day 1–3", description: "Internal kickoff, access setup, and baseline review." },
    { phase: "Implementation", duration: rec.estimatedTimeline === "Ongoing" ? "Weeks 1–4" : `Weeks 1–${rec.estimatedHoursPerMonth > 20 ? "8" : "4"}`, description: "Core deliverable execution begins." },
    { phase: "Review & QA", duration: "1 week", description: "Internal review, client walkthrough, and approval." },
    { phase: "Launch / Activation", duration: rec.estimatedTimeline, description: "Service goes live and reporting begins." },
    ...(rec.estimatedMonthlyFee > 0
      ? [{ phase: "Ongoing Management", duration: "Monthly", description: "Continuous optimization, reporting, and performance review." }]
      : []),
  ];

  return (
    <div className="space-y-4">
      <div
        className="rounded-xl border p-4"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>
          Estimated Timeline
        </p>
        <p className="text-2xl font-black" style={{ color: "var(--rtm-text-primary)" }}>
          {rec.estimatedTimelineWeeks}
        </p>
        <p className="text-[10px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
          {rec.estimatedHoursPerMonth > 0 ? `${rec.estimatedHoursPerMonth} hours/month ongoing` : "One-time project"}
        </p>
      </div>

      <div className="space-y-2">
        {phases.map((phase, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border"
                style={{ background: rec.departmentBg, color: rec.departmentColor, borderColor: rec.departmentBorder }}
              >
                {i + 1}
              </div>
              {i < phases.length - 1 && (
                <div className="w-0.5 h-6" style={{ background: rec.departmentBorder }} />
              )}
            </div>
            <div
              className="flex-1 rounded-lg border p-3 mb-2"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>{phase.phase}</p>
                <span
                  className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: rec.departmentBg, color: rec.departmentColor }}
                >
                  {phase.duration}
                </span>
              </div>
              <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{phase.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -- Dependencies Tab
function DrawerDependencies({ rec, allRecs }: { rec: RecommendationItem; allRecs: RecommendationItem[] }) {
  const depServices = rec.dependencyServiceNames;
  const depRecs = allRecs.filter((r) => rec.dependencies.includes(r.ruleId));

  return (
    <div className="space-y-4">
      {depServices.length === 0 ? (
        <div
          className="rounded-xl border p-8 text-center"
          style={{ background: "#ECFDF5", borderColor: "#A7F3D0" }}
        >
          <p className="text-sm font-semibold" style={{ color: "#15803D" }}>
            No dependencies — this service can be started independently.
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
            This recommendation requires the following services to be in place first:
          </p>
          {depRecs.map((dep) => (
            <div
              key={dep.id}
              className="rounded-xl border p-4 flex items-start justify-between gap-3"
              style={{ background: dep.departmentBg, borderColor: dep.departmentBorder }}
            >
              <div>
                <p className="text-sm font-bold" style={{ color: dep.departmentColor }}>{dep.serviceName}</p>
                <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>
                  {dep.department} · {dep.estimatedTimeline}
                </p>
              </div>
              <PriorityBadge priority={dep.priority} />
            </div>
          ))}
          {depServices.filter((s) => !depRecs.some((r) => r.serviceName === s)).map((svcName) => (
            <div
              key={svcName}
              className="rounded-xl border p-4"
              style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}
            >
              <p className="text-xs font-bold" style={{ color: "#D97706" }}>{svcName}</p>
              <p className="text-[10px]" style={{ color: "#92400E" }}>Required — not yet in current recommendation set.</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// -- Proposal Readiness Tab
function DrawerProposalReadiness({
  rec,
  currentStatus,
  onStatusChange,
}: {
  rec: RecommendationItem;
  currentStatus: RecommendationStatus;
  onStatusChange: (id: string, status: RecommendationStatus) => void;
}) {
  const readinessCfg = getProposalReadinessConfig(rec.proposalReadiness);

  return (
    <div className="space-y-5">
      <div
        className="rounded-xl border p-4"
        style={{ background: readinessCfg.bg, borderColor: readinessCfg.border }}
      >
        <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: readinessCfg.color }}>
          Proposal Readiness Status
        </p>
        <p className="text-lg font-black" style={{ color: readinessCfg.color }}>{readinessCfg.label}</p>
        <p className="text-xs mt-1" style={{ color: readinessCfg.color, opacity: 0.8 }}>
          {readinessCfg.description}
        </p>
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "var(--rtm-border)" }}
      >
        <div
          className="px-4 py-3 border-b"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <p className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>Change Recommendation Status</p>
        </div>
        <div className="p-3 space-y-2">
          {ACTION_MENU_OPTIONS.filter((a) => a.status).map((opt) => (
            <button
              key={opt.label}
              className="w-full text-left px-4 py-3 rounded-lg border text-xs font-semibold"
              style={{
                background: currentStatus === opt.status ? "#ECFDF5" : "var(--rtm-surface)",
                color: currentStatus === opt.status ? "#059669" : "var(--rtm-text-secondary)",
                borderColor: currentStatus === opt.status ? "#A7F3D0" : "var(--rtm-border)",
              }}
              onClick={() => opt.status && onStatusChange(rec.id, opt.status)}
            >
              {opt.label}
              {currentStatus === opt.status && " — Current"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// -- Activity Tab
function DrawerActivity({ rec }: { rec: RecommendationItem }) {
  const events = [
    {
      date: new Date().toLocaleDateString(),
      event: "Recommendation generated by Recommendation Engine",
      color: "#7C3AED",
    },
    {
      date: new Date().toLocaleDateString(),
      event: `${rec.triggerFindingCount} audit finding(s) triggered rule: ${rec.ruleId}`,
      color: "#1D4ED8",
    },
    {
      date: new Date().toLocaleDateString(),
      event: `Priority assigned: ${rec.priority} — Group: ${rec.group}`,
      color: getPriorityConfig(rec.priority).color,
    },
    {
      date: new Date().toLocaleDateString(),
      event: `Proposal readiness: ${rec.proposalReadiness}`,
      color: getProposalReadinessConfig(rec.proposalReadiness).color,
    },
    {
      date: new Date().toLocaleDateString(),
      event: `Confidence score calculated: ${rec.confidenceScore}%`,
      color: "#0369A1",
    },
  ];

  return (
    <div className="space-y-3">
      {events.map((e, i) => (
        <div key={i} className="flex items-start gap-3">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0 border"
            style={{ background: "#F5F3FF", borderColor: "#DDD6FE", color: "#7C3AED" }}
          >
            {i + 1}
          </div>
          <div>
            <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{e.event}</p>
            <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{e.date}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// -- Drawer Shell
function RecommendationDrawer({
  rec,
  allRecs,
  statusMap,
  onClose,
  onStatusChange,
}: {
  rec: RecommendationItem;
  allRecs: RecommendationItem[];
  statusMap: Record<string, RecommendationStatus>;
  onClose: () => void;
  onStatusChange: (id: string, status: RecommendationStatus) => void;
}) {
  const [activeTab, setActiveTab] = useState<DrawerTab>("overview");
  const currentStatus = statusMap[rec.id] ?? rec.status;

  return (
    <div
      className="fixed inset-0 z-50 flex"
      style={{ background: "rgba(0,0,0,0.35)" }}
      onClick={onClose}
    >
      <div
        className="ml-auto h-full w-full max-w-2xl flex flex-col"
        style={{ background: "var(--rtm-bg)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          className="flex items-start justify-between px-6 py-5 border-b flex-shrink-0"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <PriorityBadge priority={rec.priority} />
              <ProposalReadinessBadge readiness={rec.proposalReadiness} />
              <StatusBadge status={currentStatus} />
            </div>
            <p className="text-base font-black" style={{ color: "var(--rtm-text-primary)" }}>
              {rec.serviceName}
            </p>
            <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
              {rec.department} · {rec.estimatedTimeline} · {rec.triggerFindingCount} finding(s)
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 border font-bold"
            style={{ background: "var(--rtm-border)", color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border)" }}
          >
            ×
          </button>
        </div>

        {/* Drawer Tabs */}
        <div
          className="flex overflow-x-auto border-b flex-shrink-0"
          style={{ borderColor: "var(--rtm-border)" }}
        >
          {DRAWER_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="flex-shrink-0 px-4 py-3 text-[10px] font-bold uppercase tracking-wide border-b-2 whitespace-nowrap"
              style={{
                borderColor: activeTab === t.id ? "#7C3AED" : "transparent",
                color: activeTab === t.id ? "#7C3AED" : "var(--rtm-text-muted)",
                background: "transparent",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "overview" && (
            <DrawerOverview rec={rec} currentStatus={currentStatus} />
          )}
          {activeTab === "source-findings" && (
            <DrawerSourceFindings rec={rec} />
          )}
          {activeTab === "deliverables" && (
            <DrawerDeliverables rec={rec} />
          )}
          {activeTab === "pricing" && (
            <DrawerPricing rec={rec} />
          )}
          {activeTab === "timeline" && (
            <DrawerTimeline rec={rec} />
          )}
          {activeTab === "dependencies" && (
            <DrawerDependencies rec={rec} allRecs={allRecs} />
          )}
          {activeTab === "proposal-readiness" && (
            <DrawerProposalReadiness
              rec={rec}
              currentStatus={currentStatus}
              onStatusChange={onStatusChange}
            />
          )}
          {activeTab === "activity" && (
            <DrawerActivity rec={rec} />
          )}
        </div>

        {/* Drawer Footer */}
        <div
          className="px-6 py-4 border-t flex items-center gap-3 flex-shrink-0"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <button
            className="flex-1 py-2.5 rounded-xl font-black text-sm text-white"
            style={{ background: "#059669" }}
            onClick={() => onStatusChange(rec.id, "Approved for Proposal")}
          >
            Approve for Proposal
          </button>
          <button
            className="flex-1 py-2.5 rounded-xl font-black text-sm border"
            style={{ background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" }}
            onClick={() => onStatusChange(rec.id, "Sent to Proposal Builder")}
          >
            Send to Proposal Builder
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CTA: Continue to Budget Optimizer ────────────────────────────────────────

function BudgetOptimizerCTA({ result }: { result: RecommendationResult }) {
  return (
    <div
      className="rounded-xl border p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      style={{ background: "#EFF6FF", borderColor: "#BFDBFE" }}
    >
      <div>
        <p className="text-base font-black mb-1" style={{ color: "#1D4ED8" }}>
          Continue to Budget Optimizer
        </p>
        <p className="text-sm" style={{ color: "#1E3A8A" }}>
          {result.summary.readyForProposalCount} service(s) ready for proposal ·{" "}
          ${fmt(result.summary.totalMonthlyRevenue)}/mo · ${fmt(result.summary.totalSetupRevenue)} setup
        </p>
        <p className="text-xs mt-1" style={{ color: "#3B82F6" }}>
          Sales Intake &rarr; Goal-Based Audit &rarr; Recommendation Engine &rarr;{" "}
          <strong>Budget Optimizer</strong> &rarr; Proposal Builder
        </p>
      </div>
      <Link
        href="/sales/budget-optimizer"
        className="flex-shrink-0 px-6 py-3 rounded-xl font-black text-sm text-white whitespace-nowrap"
        style={{ background: "#1D4ED8" }}
      >
        Continue to Budget Optimizer
      </Link>
    </div>
  );
}

// ─── Filter Bar ────────────────────────────────────────────────────────────────

function FilterBar({
  search,
  setSearch,
  priorityFilter,
  setPriorityFilter,
  groupFilter,
  setGroupFilter,
  readinessFilter,
  setReadinessFilter,
  total,
  filtered,
}: {
  search: string;
  setSearch: (v: string) => void;
  priorityFilter: string;
  setPriorityFilter: (v: string) => void;
  groupFilter: string;
  setGroupFilter: (v: string) => void;
  readinessFilter: string;
  setReadinessFilter: (v: string) => void;
  total: number;
  filtered: number;
}) {
  const selectStyle = {
    background: "var(--rtm-surface)",
    color: "var(--rtm-text-primary)",
    borderColor: "var(--rtm-border)",
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid",
    outline: "none",
  };

  return (
    <div
      className="rounded-xl border p-4 flex flex-wrap items-center gap-3"
      style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
    >
      <input
        type="text"
        placeholder="Search services, departments, groups…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 min-w-48 rounded-lg border px-3 py-2 text-xs"
        style={{
          background: "var(--rtm-bg)",
          borderColor: "var(--rtm-border)",
          color: "var(--rtm-text-primary)",
          outline: "none",
        }}
      />
      <select style={selectStyle} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
        <option value="">All Priorities</option>
        {["Critical", "High", "Medium", "Low"].map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
      <select style={selectStyle} value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)}>
        <option value="">All Groups</option>
        {RECOMMENDATION_GROUP_CONFIG.map((g) => (
          <option key={g.key} value={g.key}>{g.label}</option>
        ))}
      </select>
      <select style={selectStyle} value={readinessFilter} onChange={(e) => setReadinessFilter(e.target.value)}>
        <option value="">All Readiness</option>
        {PROPOSAL_READINESS_CONFIG.map((r) => (
          <option key={r.key} value={r.key}>{r.label}</option>
        ))}
      </select>
      <span className="text-[10px] font-semibold" style={{ color: "var(--rtm-text-muted)" }}>
        {filtered} of {total}
      </span>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function RecommendationsPage() {
  const result = DEMO_RESULT;

  const [activeSection, setActiveSection] = useState<
    "overview" | "groups" | "matrix" | "revenue" | "departments" | "readiness"
  >("overview");

  const [selectedRec, setSelectedRec] = useState<RecommendationItem | null>(null);
  const [statusMap, setStatusMap] = useState<Record<string, RecommendationStatus>>({});

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [readinessFilter, setReadinessFilter] = useState("");

  const handleStatusChange = useCallback((id: string, status: RecommendationStatus) => {
    setStatusMap((prev) => ({ ...prev, [id]: status }));
  }, []);

  const filteredRecs = useMemo(() => {
    const q = search.toLowerCase();
    return result.recommendations.filter((r) => {
      const matchSearch =
        !q ||
        r.serviceName.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        r.group.toLowerCase().includes(q) ||
        r.businessImpact.toLowerCase().includes(q);
      const matchPriority = !priorityFilter || r.priority === priorityFilter;
      const matchGroup = !groupFilter || r.group === groupFilter;
      const matchReadiness = !readinessFilter || r.proposalReadiness === readinessFilter;
      return matchSearch && matchPriority && matchGroup && matchReadiness;
    });
  }, [result.recommendations, search, priorityFilter, groupFilter, readinessFilter]);

  const filteredGroups = useMemo(() => {
    if (!search && !priorityFilter && !groupFilter && !readinessFilter) return result.groups;
    const filteredIds = new Set(filteredRecs.map((r) => r.id));
    return result.groups
      .map((g) => ({ ...g, items: g.items.filter((item) => filteredIds.has(item.id)) }))
      .filter((g) => g.items.length > 0);
  }, [filteredRecs, result.groups, search, priorityFilter, groupFilter, readinessFilter]);

  const navTabs = [
    { id: "overview" as const, label: "Overview" },
    { id: "groups" as const, label: "Service Recommendations" },
    { id: "matrix" as const, label: "Priority Matrix" },
    { id: "revenue" as const, label: "Revenue Opportunities" },
    { id: "departments" as const, label: "Department Impact" },
    { id: "readiness" as const, label: "Proposal Readiness Queue" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--rtm-bg)" }}>
      <div className="max-w-screen-2xl mx-auto px-6 py-8 space-y-8">

        {/* Page Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1 text-[10px] flex-wrap" style={{ color: "var(--rtm-text-muted)" }}>
                {[
                  { label: "Sales Intake",    href: "/sales/intake",          active: false },
                  { label: "Goal Audit",       href: "/sales/audits",          active: false },
                  { label: "Recommendations", href: "/sales/recommendations", active: true  },
                  { label: "Budget Optimizer",href: "/sales/budget-optimizer",active: false },
                  { label: "Proposal Builder",href: "/sales/proposals",       active: false },
                  { label: "Contract Builder",href: "/sales/contracts",       active: false },
                  { label: "Billing Handoff", href: "/sales/handoffs",        active: false },
                ].map((step, i, arr) => (
                  <React.Fragment key={step.label}>
                    <Link href={step.href}
                      className="px-2 py-0.5 rounded border text-[10px] font-semibold"
                      style={{
                        background: step.active ? "#7C3AED" : "var(--rtm-bg)",
                        color: step.active ? "#fff" : "var(--rtm-text-muted)",
                        borderColor: step.active ? "#7C3AED" : "var(--rtm-border)",
                      }}>
                      {step.label}
                    </Link>
                    {i < arr.length - 1 && <span style={{ color: "var(--rtm-border)" }}>→</span>}
                  </React.Fragment>
                ))}
              </nav>
            </div>
            <h1 className="text-2xl font-black" style={{ color: "var(--rtm-text-primary)" }}>
              Sales Recommendation Engine
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--rtm-text-muted)" }}>
              Configuration-driven recommendations generated from Goal-Based Audit output.
              Services, rules, pricing, and priorities are sourced from Settings.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className="text-xs font-bold px-3 py-1.5 rounded-full border"
              style={{ background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" }}
            >
              {result.status}
            </span>
          </div>
        </div>

        {/* Audit Source Summary */}
        <AuditSourceSummary result={result} />

        {/* Summary KPI Cards */}
        <SummaryCards result={result} />

        {/* Section Nav */}
        <div className="flex gap-1 flex-wrap">
          {navTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveSection(t.id)}
              className="px-4 py-2 rounded-xl text-xs font-bold border"
              style={{
                background: activeSection === t.id ? "#7C3AED" : "var(--rtm-surface)",
                color: activeSection === t.id ? "white" : "var(--rtm-text-secondary)",
                borderColor: activeSection === t.id ? "#7C3AED" : "var(--rtm-border)",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeSection === "overview" && (
          <div className="space-y-8">
            {/* Recommendation Summary by Group */}
            <div
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: "var(--rtm-border)" }}
            >
              <div
                className="px-5 py-4 border-b"
                style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
              >
                <p className="text-sm font-black" style={{ color: "var(--rtm-text-primary)" }}>
                  Recommendation Summary
                </p>
                <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                  {result.summary.totalRecommendations} services recommended across{" "}
                  {result.groups.length} groups
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 divide-y divide-x" style={{ borderColor: "var(--rtm-border)" }}>
                {result.groups.map((g) => (
                  <div key={g.group} className="p-5 border-b" style={{ borderColor: "var(--rtm-border)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-black" style={{ color: g.color }}>{g.label}</p>
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black border"
                        style={{ background: g.bg, color: g.color, borderColor: g.border }}
                      >
                        {g.items.length}
                      </span>
                    </div>
                    <p className="text-[9px] mb-2" style={{ color: "var(--rtm-text-muted)" }}>{g.description}</p>
                    {g.totalMonthlyFee > 0 && (
                      <p className="text-xs font-bold" style={{ color: "#059669" }}>
                        ${fmt(g.totalMonthlyFee)}/mo
                      </p>
                    )}
                    {g.totalSetupFee > 0 && (
                      <p className="text-[10px]" style={{ color: "#1D4ED8" }}>
                        + ${fmt(g.totalSetupFee)} setup
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Proposal Readiness Quick View */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {result.proposalReadinessQueue.map((q) => (
                <div
                  key={q.readiness}
                  className="rounded-xl border p-4 text-center"
                  style={{ background: q.bg, borderColor: q.border }}
                >
                  <p className="text-xl font-black" style={{ color: q.color }}>{q.count}</p>
                  <p className="text-[9px] font-bold mt-1 leading-tight" style={{ color: q.color }}>
                    {q.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Department impact quick view */}
            <DepartmentImpactPanel departments={result.departmentImpact} />
          </div>
        )}

        {/* Service Recommendations (Groups) */}
        {activeSection === "groups" && (
          <div className="space-y-4">
            <FilterBar
              search={search}
              setSearch={setSearch}
              priorityFilter={priorityFilter}
              setPriorityFilter={setPriorityFilter}
              groupFilter={groupFilter}
              setGroupFilter={setGroupFilter}
              readinessFilter={readinessFilter}
              setReadinessFilter={setReadinessFilter}
              total={result.recommendations.length}
              filtered={filteredRecs.length}
            />
            <RecommendationGroupsPanel
              groups={filteredGroups}
              onSelect={setSelectedRec}
              statusMap={statusMap}
              onStatusChange={handleStatusChange}
            />
          </div>
        )}

        {/* Priority Matrix */}
        {activeSection === "matrix" && (
          <PriorityMatrixView items={result.priorityMatrix} />
        )}

        {/* Revenue Opportunities */}
        {activeSection === "revenue" && (
          <RevenueOpportunityTable recs={result.recommendations} />
        )}

        {/* Department Impact */}
        {activeSection === "departments" && (
          <DepartmentImpactPanel departments={result.departmentImpact} />
        )}

        {/* Proposal Readiness Queue */}
        {activeSection === "readiness" && (
          <ProposalReadinessQueuePanel
            queue={result.proposalReadinessQueue}
            onSelect={setSelectedRec}
          />
        )}

        {/* Budget Optimizer CTA */}
        <BudgetOptimizerCTA result={result} />

      </div>

      {/* Recommendation Detail Drawer */}
      {selectedRec && (
        <RecommendationDrawer
          rec={selectedRec}
          allRecs={result.recommendations}
          statusMap={statusMap}
          onClose={() => setSelectedRec(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
