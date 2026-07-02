"use client";

import React, { useState, useEffect } from "react";
import { DEFAULT_AUDIT_TEMPLATE, getSectionsForGoals } from "@/lib/sales/audit-config";
import {
  runAuditEngine,
  runIntakeAudit,
  submitManualAuditScorecard,
  reopenManualAuditRequest,
  getEffectiveFindingsForProposal,
  type AuditResult,
} from "@/lib/sales/audit-engine";
import type {
  IntakeAuditResult,
  CitationAuditResult,
  NAPComparison,
  KeywordSuggestion,
  CurrentMarketingAssessment,
  WebsiteAssessment,
  IntakeFinding,
  ManualAuditRequest,
  HybridAuditRequest,
  DepartmentReview,
} from "@/lib/sales/types";
import type { ProposalWizardState } from "../ProposalWizard";
import type { HomeServicesIntakeRecord } from "@/lib/sales/types";
import { RequestAuditModal } from "@/components/sales/audit-request/RequestAuditModal";
import { ManualAuditScorecard } from "@/components/sales/audit-request/ManualAuditScorecard";
import { HybridReviewPanel } from "@/components/sales/audit-request/HybridReviewPanel";
import { AuditRequestStatusBadge } from "@/components/sales/audit-request/AuditRequestStatusBadge";
import { AiAuditPanel } from "@/components/sales/audit/AiAuditPanel";
import type { AiAuditResult } from "@/lib/sales/types";

// ─── Mock existing audits ─────────────────────────────────────────────────────

interface MockAudit {
  id: string;
  name: string;
  client: string;
  date: string;
  score: number;
  findingsCount: number;
  criticalCount: number;
  goalLabels: string[];
}

const MOCK_EXISTING_AUDITS: MockAudit[] = [
  {
    id: "audit-001",
    name: "Summit Landscaping — Full Audit",
    client: "Summit Landscaping",
    date: "2025-06-01",
    score: 42,
    findingsCount: 14,
    criticalCount: 3,
    goalLabels: ["Generate More Leads", "Improve SEO", "Improve Google Business Profile"],
  },
  {
    id: "audit-002",
    name: "Metro Dental Group — Digital Presence",
    client: "Metro Dental Group",
    date: "2025-05-30",
    score: 38,
    findingsCount: 18,
    criticalCount: 5,
    goalLabels: ["Improve SEO", "Improve Google Business Profile", "Generate More Leads", "Improve Website Conversion"],
  },
  {
    id: "audit-003",
    name: "Blue Ridge Plumbing — Quick Audit",
    client: "Blue Ridge Plumbing",
    date: "2025-06-02",
    score: 55,
    findingsCount: 9,
    criticalCount: 2,
    goalLabels: ["Increase Phone Calls", "Improve PPC"],
  },
  {
    id: "audit-004",
    name: "Harbor Auto Group — Website Review",
    client: "Harbor Auto Group",
    date: "2025-06-03",
    score: 31,
    findingsCount: 22,
    criticalCount: 6,
    goalLabels: ["Improve SEO", "Improve PPC", "Website Redesign"],
  },
  {
    id: "audit-005",
    name: "Coastal Wellness Spa — Local SEO",
    client: "Coastal Wellness Spa",
    date: "2025-05-28",
    score: 63,
    findingsCount: 7,
    criticalCount: 1,
    goalLabels: ["Improve Meta Ads", "Improve Google Business Profile", "Improve SEO"],
  },
  // Audits from the Audit Intelligence Center (audits/page.tsx)
  {
    id: "aud-001",
    name: "SEO Technical Audit — Summit Landscaping",
    client: "Summit Landscaping",
    date: "2025-06-05",
    score: 74,
    findingsCount: 7,
    criticalCount: 1,
    goalLabels: ["Improve SEO", "Improve Google Business Profile"],
  },
  {
    id: "aud-002",
    name: "GBP Audit — Blue Ridge Plumbing",
    client: "Blue Ridge Plumbing",
    date: "2025-06-07",
    score: 31,
    findingsCount: 11,
    criticalCount: 3,
    goalLabels: ["Improve Google Business Profile", "Generate More Leads"],
  },
  {
    id: "aud-003",
    name: "PPC Audit — Apex Roofing",
    client: "Apex Roofing",
    date: "2025-05-30",
    score: 28,
    findingsCount: 9,
    criticalCount: 2,
    goalLabels: ["Improve PPC", "Generate More Leads"],
  },
  {
    id: "aud-004",
    name: "Meta Ads Audit — Pinnacle HVAC",
    client: "Pinnacle HVAC",
    date: "2025-06-01",
    score: 42,
    findingsCount: 6,
    criticalCount: 1,
    goalLabels: ["Improve Meta Ads", "Generate More Leads"],
  },
  {
    id: "aud-005",
    name: "Website Audit — Morrison HVAC and Cooling",
    client: "Morrison HVAC and Cooling",
    date: "2025-05-18",
    score: 19,
    findingsCount: 14,
    criticalCount: 4,
    goalLabels: ["Website Redesign", "Improve SEO"],
  },
  {
    id: "aud-006",
    name: "LSA Audit — Coastal Plumbing Co.",
    client: "Coastal Plumbing Co.",
    date: "2025-06-03",
    score: 38,
    findingsCount: 5,
    criticalCount: 1,
    goalLabels: ["Increase Phone Calls", "Generate More Leads"],
  },
  {
    id: "aud-007",
    name: "GBP Audit — GreenWave Lawn Care",
    client: "GreenWave Lawn Care",
    date: "2025-06-08",
    score: 41,
    findingsCount: 8,
    criticalCount: 0,
    goalLabels: ["Improve Google Business Profile", "Generate More Leads"],
  },
  {
    id: "aud-008",
    name: "Competitor Audit — Summit Landscaping",
    client: "Summit Landscaping",
    date: "2025-05-24",
    score: 58,
    findingsCount: 4,
    criticalCount: 0,
    goalLabels: ["Generate More Leads", "Improve SEO"],
  },
  {
    id: "aud-009",
    name: "SEO Technical Audit — Morrison HVAC and Cooling",
    client: "Morrison HVAC and Cooling",
    date: "2025-06-02",
    score: 44,
    findingsCount: 6,
    criticalCount: 1,
    goalLabels: ["Improve SEO", "Generate More Leads"],
  },
  {
    id: "aud-010",
    name: "PPC Audit — Apex Roofing (Storm Campaign)",
    client: "Apex Roofing",
    date: "2025-06-05",
    score: 47,
    findingsCount: 5,
    criticalCount: 1,
    goalLabels: ["Improve PPC", "Generate More Leads"],
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface Step2AuditProps {
  state: ProposalWizardState;
  onUpdate: (updates: Partial<ProposalWizardState>) => void;
}

type AuditMode = "ai" | "intake" | "existing" | "quick" | "manual" | "hybrid";

// ─── Helpers: Score Badge ─────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 85 ? "#15803D" : score >= 65 ? "#D97706" : score >= 40 ? "#EA580C" : "#DC2626";
  const bg =
    score >= 85 ? "#F0FDF4" : score >= 65 ? "#FFFBEB" : score >= 40 ? "#FFF7ED" : "#FEF2F2";
  const border =
    score >= 85 ? "#BBF7D0" : score >= 65 ? "#FDE68A" : score >= 40 ? "#FED7AA" : "#FECACA";
  const label =
    score >= 85 ? "Excellent" : score >= 65 ? "Good" : score >= 40 ? "Needs Improvement" : "Critical";

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border"
      style={{ background: bg, color, borderColor: border }}
    >
      <span className="text-sm font-black">{score}</span>
      <span>{label}</span>
    </span>
  );
}

// ─── Helpers: Status Badge ────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    consistent:          { bg: "#F0FDF4", color: "#15803D", border: "#BBF7D0" },
    inconsistent:        { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
    "not-listed":        { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" },
    "needs-verification":{ bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
    high:                { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" },
    medium:              { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
    low:                 { bg: "#F0FDF4", color: "#15803D", border: "#BBF7D0" },
    critical:            { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
    primary:             { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
    local:               { bg: "#F0FDFA", color: "#0F766E", border: "#99F6E4" },
    seasonal:            { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" },
    competitor:          { bg: "#F5F3FF", color: "#6D28D9", border: "#DDD6FE" },
    "long-tail":         { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" },
    active:              { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" },
    inactive:            { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" },
  };
  const s = map[status] ?? { bg: "#F3F4F6", color: "#374151", border: "#D1D5DB" };
  return (
    <span
      className="inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full border capitalize"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
    >
      {status.replace(/-/g, " ")}
    </span>
  );
}

// ─── Helpers: NAP status color ────────────────────────────────────────────────

function napStatusColor(status: NAPComparison["status"]): string {
  if (status === "exact") return "#15803D";
  if (status === "minor-variation") return "#D97706";
  if (status === "major-mismatch") return "#DC2626";
  return "#64748B";
}

// ─── Audit summary card ────────────────────────────────────────────────────────

function AuditSummaryCard({ auditResult }: { auditResult: AuditResult }) {
  return (
    <div
      className="rounded-xl border p-5"
      style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-2 h-2 rounded-full" style={{ background: "#059669" }} />
        <p className="text-sm font-bold" style={{ color: "#15803D" }}>
          Audit result ready — recommendations will be generated in the next step.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Overall Score", value: <ScoreBadge score={auditResult.overallScore} /> },
          {
            label: "Total Findings",
            value: (
              <span className="text-xl font-black" style={{ color: "var(--rtm-text-primary)" }}>
                {auditResult.totalFindingCount}
              </span>
            ),
          },
          {
            label: "Critical Findings",
            value: (
              <span className="text-xl font-black" style={{ color: "#DC2626" }}>
                {auditResult.criticalCount}
              </span>
            ),
          },
          {
            label: "Sections Audited",
            value: (
              <span className="text-xl font-black" style={{ color: "#1D4ED8" }}>
                {auditResult.activeSections.length}
              </span>
            ),
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-lg border px-4 py-3 text-center"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
          >
            <p className="text-[10px] font-bold mb-2" style={{ color: "var(--rtm-text-muted)" }}>
              {item.label.toUpperCase()}
            </p>
            {item.value}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section 1: Citation Audit ────────────────────────────────────────────────

function CitationAuditSection({ citationAudit, citationScore }: {
  citationAudit: CitationAuditResult[];
  citationScore: number;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const scoreColor =
    citationScore >= 75 ? "#15803D" :
    citationScore >= 50 ? "#D97706" : "#DC2626";
  const scoreBg =
    citationScore >= 75 ? "#F0FDF4" :
    citationScore >= 50 ? "#FFFBEB" : "#FEF2F2";
  const scoreBorder =
    citationScore >= 75 ? "#BBF7D0" :
    citationScore >= 50 ? "#FDE68A" : "#FECACA";

  return (
    <div
      className="rounded-xl border"
      style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
    >
      <div className="px-6 py-4 border-b" style={{ borderColor: "var(--rtm-border)" }}>
        <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
          Citation Audit Results
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
          NAP consistency check across {citationAudit.length} listing platforms from intake data.
        </p>
      </div>
      <div className="p-6 space-y-3">
        {citationAudit.map((platform) => (
          <div
            key={platform.platformId}
            className="rounded-lg border"
            style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}
          >
            <div
              className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer"
              onClick={() =>
                setExpanded(expanded === platform.platformId ? null : platform.platformId)
              }
            >
              <div className="flex items-center gap-3 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--rtm-text-primary)" }}>
                  {platform.platformLabel}
                </p>
                <StatusBadge status={platform.overallStatus} />
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div
                    className="rounded-full h-1.5 overflow-hidden"
                    style={{ background: "var(--rtm-border)", width: 64 }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${platform.score}%`,
                        background:
                          platform.score >= 75 ? "#15803D" :
                          platform.score >= 50 ? "#D97706" : "#DC2626",
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold w-8 text-right" style={{ color: "var(--rtm-text-muted)" }}>
                    {platform.score}
                  </span>
                </div>
                <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                  {expanded === platform.platformId ? "▲" : "▼"}
                </span>
              </div>
            </div>

            {expanded === platform.platformId && platform.isListed && platform.napComparisons.length > 0 && (
              <div className="px-4 pb-4 pt-0 space-y-3">
                <div className="rounded-lg overflow-hidden border" style={{ borderColor: "var(--rtm-border)" }}>
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background: "var(--rtm-surface)" }}>
                        {["Field", "Master Value", "Listed Value", "Status"].map((h) => (
                          <th
                            key={h}
                            className="text-left px-3 py-2 font-bold"
                            style={{ color: "var(--rtm-text-muted)" }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {platform.napComparisons.map((comp) => (
                        <tr
                          key={comp.field}
                          className="border-t"
                          style={{ borderColor: "var(--rtm-border)" }}
                        >
                          <td className="px-3 py-2 font-semibold capitalize" style={{ color: "var(--rtm-text-secondary)" }}>
                            {comp.field}
                          </td>
                          <td className="px-3 py-2" style={{ color: "var(--rtm-text-primary)" }}>
                            {comp.masterValue || "—"}
                          </td>
                          <td className="px-3 py-2" style={{ color: "var(--rtm-text-primary)" }}>
                            {comp.listedValue || "—"}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className="font-semibold text-[11px]"
                              style={{ color: napStatusColor(comp.status) }}
                            >
                              {comp.status.replace(/-/g, " ")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {platform.recommendations.length > 0 && (
                  <ul className="space-y-1">
                    {platform.recommendations.map((rec, i) => (
                      <li key={i} className="text-xs flex gap-2" style={{ color: "var(--rtm-text-secondary)" }}>
                        <span style={{ color: "#D97706" }}>-</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {expanded === platform.platformId && !platform.isListed && (
              <div className="px-4 pb-4 pt-0">
                <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                  Not currently listed on this platform. Adding a listing will improve citation coverage and local search visibility.
                </p>
              </div>
            )}
          </div>
        ))}

        {/* Overall citation score */}
        <div
          className="rounded-xl border px-5 py-4 flex items-center justify-between gap-4"
          style={{ background: scoreBg, borderColor: scoreBorder }}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: scoreColor }}>
              Overall Citation Score
            </p>
            <p className="text-xs mt-0.5" style={{ color: scoreColor, opacity: 0.8 }}>
              Weighted across all platforms
            </p>
          </div>
          <span
            className="text-3xl font-black"
            style={{ color: scoreColor }}
          >
            {citationScore}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Section 2: Keyword Suggestions ──────────────────────────────────────────

function KeywordSuggestionsSection({
  keywordSuggestions,
  approvedKeywords,
  onApprove,
  onRemove,
  onAddCustom,
}: {
  keywordSuggestions: KeywordSuggestion[];
  approvedKeywords: string[];
  onApprove: (kw: string) => void;
  onRemove: (kw: string) => void;
  onAddCustom: (kw: string) => void;
}) {
  const [customInput, setCustomInput] = useState("");

  const grouped: Record<KeywordSuggestion["type"], KeywordSuggestion[]> = {
    primary: [],
    local: [],
    "long-tail": [],
    seasonal: [],
    competitor: [],
  };
  keywordSuggestions.forEach((k) => grouped[k.type].push(k));

  const typeLabels: Record<KeywordSuggestion["type"], string> = {
    primary: "Primary Keywords",
    local: "Local Keywords",
    "long-tail": "Long-Tail Keywords",
    seasonal: "Seasonal Keywords",
    competitor: "Competitor Keywords",
  };

  function handleAdd() {
    const trimmed = customInput.trim();
    if (trimmed) {
      onAddCustom(trimmed);
      setCustomInput("");
    }
  }

  return (
    <div
      className="rounded-xl border"
      style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
    >
      <div className="px-6 py-4 border-b" style={{ borderColor: "var(--rtm-border)" }}>
        <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
          Suggested Keywords
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
          Based on trade type and service area. Approve keywords to include in proposals and SEO recommendations.
        </p>
      </div>
      <div className="p-6 space-y-5">
        {(Object.entries(grouped) as [KeywordSuggestion["type"], KeywordSuggestion[]][])
          .filter(([, items]) => items.length > 0)
          .map(([type, items]) => (
            <div key={type}>
              <p
                className="text-[11px] font-bold uppercase tracking-wide mb-2"
                style={{ color: "var(--rtm-text-muted)" }}
              >
                {typeLabels[type]}
              </p>
              <div className="space-y-1.5">
                {items.map((kw) => {
                  const isApproved = approvedKeywords.includes(kw.keyword);
                  return (
                    <div
                      key={kw.keyword}
                      className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                      style={{
                        borderColor: isApproved ? "#BBF7D0" : "var(--rtm-border)",
                        background: isApproved ? "#F0FDF4" : "var(--rtm-bg)",
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm truncate" style={{ color: "var(--rtm-text-primary)" }}>
                          {kw.keyword}
                        </span>
                        <StatusBadge status={kw.type} />
                        <StatusBadge status={kw.priority} />
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!isApproved ? (
                          <button
                            type="button"
                            onClick={() => onApprove(kw.keyword)}
                            className="text-[11px] font-bold px-3 py-1 rounded-lg border transition-all hover:opacity-80"
                            style={{ background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" }}
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onRemove(kw.keyword)}
                            className="text-[11px] font-bold px-3 py-1 rounded-lg border transition-all hover:opacity-80"
                            style={{ background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

        {/* Custom keyword input */}
        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-wide mb-2"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            Add Custom Keyword
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="e.g. best plumber Austin"
              className="flex-1 text-sm rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              style={{
                background: "var(--rtm-bg)",
                borderColor: "var(--rtm-border)",
                color: "var(--rtm-text-primary)",
              }}
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!customInput.trim()}
              className="px-4 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: "#1D4ED8" }}
            >
              Add
            </button>
          </div>
        </div>

        {/* Approved keywords summary */}
        {approvedKeywords.length > 0 && (
          <div
            className="rounded-lg border px-4 py-3"
            style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}
          >
            <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: "#15803D" }}>
              Approved Keywords ({approvedKeywords.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {approvedKeywords.map((kw) => (
                <span
                  key={kw}
                  className="text-xs px-2.5 py-1 rounded-full border flex items-center gap-1.5"
                  style={{ background: "#DCFCE7", color: "#15803D", borderColor: "#BBF7D0" }}
                >
                  {kw}
                  <button
                    type="button"
                    onClick={() => onRemove(kw)}
                    className="hover:opacity-70"
                    aria-label={`Remove ${kw}`}
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Section 3: Marketing Assessment ─────────────────────────────────────────

function MarketingAssessmentSection({
  assessments,
}: {
  assessments: CurrentMarketingAssessment[];
}) {
  return (
    <div
      className="rounded-xl border"
      style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
    >
      <div className="px-6 py-4 border-b" style={{ borderColor: "var(--rtm-border)" }}>
        <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
          Current Marketing Assessment
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
          Based on marketing data from intake.
        </p>
      </div>
      <div className="p-6 space-y-4">
        {assessments.map((ch) => (
          <div
            key={ch.channelId}
            className="rounded-xl border p-4 space-y-3"
            style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                {ch.channelLabel}
              </p>
              <div className="flex items-center gap-2">
                <StatusBadge status={ch.isActive ? "active" : "inactive"} />
                <StatusBadge status={ch.priority} />
              </div>
            </div>
            {ch.isActive && ch.currentSpend > 0 && (
              <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                Current spend: <span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>${ch.currentSpend.toLocaleString()}/mo</span>
              </p>
            )}
            <div
              className="rounded-lg border px-3 py-2.5 space-y-1"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
            >
              <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>
                Assessment
              </p>
              <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                {ch.assessment}
              </p>
            </div>
            <div
              className="rounded-lg border px-3 py-2.5 space-y-1"
              style={{ background: "#F0F9FF", borderColor: "#BAE6FD" }}
            >
              <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#0369A1" }}>
                Recommendation
              </p>
              <p className="text-xs" style={{ color: "#0369A1" }}>
                {ch.recommendation}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section 4: Website Assessment ───────────────────────────────────────────

function WebsiteAssessmentSection({ assessment }: { assessment: WebsiteAssessment }) {
  const priorityColors: Record<WebsiteAssessment["priority"], { color: string; bg: string; border: string }> = {
    critical: { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
    high:     { color: "#C2410C", bg: "#FFF7ED", border: "#FED7AA" },
    medium:   { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
    low:      { color: "#15803D", bg: "#F0FDF4", border: "#BBF7D0" },
  };
  const pc = priorityColors[assessment.priority];

  const infoItems: { label: string; value: string }[] = [
    { label: "Has Website", value: assessment.hasWebsite ? "Yes" : "No" },
    ...(assessment.url ? [{ label: "URL", value: assessment.url }] : []),
    ...(assessment.platform ? [{ label: "Platform", value: assessment.platform }] : []),
    ...(assessment.lastUpdated ? [{ label: "Last Updated", value: assessment.lastUpdated }] : []),
    { label: "Hosting Access", value: assessment.hasHostingAccess ? "Yes" : "No" },
    { label: "Domain Access", value: assessment.hasDomainAccess ? "Yes" : "No" },
    { label: "Interested in Redesign", value: assessment.interestedInRedesign ? "Yes" : "No" },
    { label: "Interested in New Build", value: assessment.interestedInNewBuild ? "Yes" : "No" },
  ];

  return (
    <div
      className="rounded-xl border"
      style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
    >
      <div className="px-6 py-4 border-b" style={{ borderColor: "var(--rtm-border)" }}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            Website Assessment
          </p>
          <StatusBadge status={assessment.priority} />
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {infoItems.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border px-3 py-2.5"
              style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}
            >
              <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>
                {item.label}
              </p>
              <p className="text-xs font-semibold truncate" style={{ color: "var(--rtm-text-primary)" }}>
                {item.value || "—"}
              </p>
            </div>
          ))}
        </div>

        {assessment.recommendations.length > 0 && (
          <div className="space-y-2">
            <p
              className="text-[11px] font-bold uppercase tracking-wide"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Recommendations
            </p>
            {assessment.recommendations.map((rec, i) => (
              <div
                key={i}
                className="rounded-lg border px-4 py-3 flex items-start gap-3"
                style={{ background: pc.bg, borderColor: pc.border }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0"
                  style={{ background: pc.color }}
                />
                <p className="text-xs" style={{ color: pc.color }}>
                  {rec}
                </p>
              </div>
            ))}
          </div>
        )}

        {assessment.recommendations.length === 0 && (
          <div
            className="rounded-lg border px-4 py-3"
            style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}
          >
            <p className="text-xs font-semibold" style={{ color: "#15803D" }}>
              No immediate website concerns identified from intake data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Section: Intake Audit Summary Banner ─────────────────────────────────────

function IntakeAuditBanner({ result }: { result: IntakeAuditResult }) {
  const citationColor =
    result.citationScore >= 75 ? "#15803D" :
    result.citationScore >= 50 ? "#D97706" : "#DC2626";

  return (
    <div
      className="rounded-xl border p-5"
      style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-2 h-2 rounded-full" style={{ background: "#059669" }} />
        <p className="text-sm font-bold" style={{ color: "#15803D" }}>
          Intake audit complete — {result.overallFindings.length} citation finding{result.overallFindings.length !== 1 ? "s" : ""} identified.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Citation Score",
            value: (
              <span className="text-xl font-black" style={{ color: citationColor }}>
                {result.citationScore}
              </span>
            ),
          },
          {
            label: "Keywords",
            value: (
              <span className="text-xl font-black" style={{ color: "#1D4ED8" }}>
                {result.keywordSuggestions.length}
              </span>
            ),
          },
          {
            label: "Competitors",
            value: (
              <span className="text-xl font-black" style={{ color: "#7C3AED" }}>
                {result.competitorAnalysis.length}
              </span>
            ),
          },
          {
            label: "Platforms Checked",
            value: (
              <span className="text-xl font-black" style={{ color: "var(--rtm-text-primary)" }}>
                {result.citationAudit.length}
              </span>
            ),
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-lg border px-4 py-3 text-center"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
          >
            <p className="text-[10px] font-bold mb-2" style={{ color: "var(--rtm-text-muted)" }}>
              {item.label.toUpperCase()}
            </p>
            {item.value}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Step2Audit({ state, onUpdate }: Step2AuditProps) {
  const intakeRecord = state.intakeRecord as HomeServicesIntakeRecord | null;
  const hasIntakeData = Boolean(intakeRecord?.masterAddress?.city);

  const websiteUrl = (intakeRecord?.website2 as { url?: string } | undefined)?.url ||
    intakeRecord?.website ||
    "";
  const hasWebsiteUrl = Boolean(websiteUrl && websiteUrl.trim().length > 0);

  // Detect pre-selected audit coming in from the Audit Intelligence Center
  // via URL param ?auditId= forwarded through wizard initialState.
  const preselectedAuditId: string | null = (state as ProposalWizardState & { preselectedAuditId?: string }).preselectedAuditId ?? null;

  const [mode, setMode] = useState<AuditMode>(() => {
    // If a pre-selected audit id is provided, jump straight to existing mode.
    if (preselectedAuditId) return "existing";
    if (state.auditMode === "ai") return "ai";
    if (state.auditMode === "quick") return "quick";
    if (state.auditMode === "existing") return "existing";
    // AI Audit is first default if website URL exists
    if (hasWebsiteUrl) return "ai";
    return hasIntakeData ? "intake" : "existing";
  });

  const [selectedAuditId, setSelectedAuditId] = useState<string>(
    state.selectedAuditId ?? preselectedAuditId ?? ""
  );

  // Intake audit state
  const [intakeAuditResult, setIntakeAuditResult] = useState<IntakeAuditResult | null>(null);
  const [approvedKeywords, setApprovedKeywords] = useState<string[]>([]);

  // Quick audit state: per-section scores (0–100)
  const activeSections = getSectionsForGoals(
    DEFAULT_AUDIT_TEMPLATE,
    state.selectedGoals.length > 0 ? state.selectedGoals : []
  );
  const [sectionScores, setSectionScores] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    activeSections.forEach((s) => { init[s.key] = 50; });
    return init;
  });

  // Manual audit state
  const [manualRequests, setManualRequests] = useState<ManualAuditRequest[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestModalMode, setRequestModalMode] = useState<"manual" | "hybrid">("manual");
  const [scorecardTarget, setScorecardTarget] = useState<ManualAuditRequest | null>(null);
  // readOnlyScorecardTarget: finalized request shown in read-only view with reopen capability
  const [readOnlyScorecardTarget, setReadOnlyScorecardTarget] = useState<ManualAuditRequest | null>(null);

  // Hybrid audit state
  const [hybridRequest, setHybridRequest] = useState<HybridAuditRequest | null>(null);
  const [viewingAsDept, setViewingAsDept] = useState<string>("Sales rep (read-only)");

  // Auto-select audit on mount when arriving from Audit Intelligence Center
  // via ?auditId= URL param (forwarded as preselectedAuditId in wizard state).
  useEffect(() => {
    if (preselectedAuditId && !state.auditResult) {
      handleSelectExistingAudit(preselectedAuditId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedAuditId]);

  // Run intake audit on mount if intake data is available
  useEffect(() => {
    if (hasIntakeData && intakeRecord && !intakeAuditResult) {
      const clientName =
        intakeRecord.businessName ||
        state.clientInfo?.businessName ||
        state.clientInfo?.name ||
        "Unknown Client";
      const result = runIntakeAudit(intakeRecord, clientName);
      setIntakeAuditResult(result);

      // Convert to AuditResult for the wizard and store
      if (mode === "intake") {
        commitIntakeAuditToWizard(result);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasIntakeData]);

  function commitIntakeAuditToWizard(result: IntakeAuditResult) {
    // Build a synthetic AuditResult from the intake audit result.
    const goalIds = state.selectedGoals.length > 0 ? state.selectedGoals : ["goal-leads"];
    const sections = getSectionsForGoals(DEFAULT_AUDIT_TEMPLATE, goalIds);
    // Use citation score to seed answers for the goal-based scoring pass.
    const passRate = result.citationScore / 100;
    const answers: Record<string, boolean> = {};
    sections.forEach((sec) => {
      sec.questions.forEach((q) => {
        const seed = q.key.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const rand = ((seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
        answers[q.key] = rand < passRate;
      });
    });

    const baseAuditResult = runAuditEngine(
      goalIds,
      goalIds,
      answers,
      DEFAULT_AUDIT_TEMPLATE,
      undefined
    );

    // Convert IntakeFinding[] from overallFindings into AuditFinding[] so the
    // recommendation engine can match them against RECOMMENDATION_RULES.
    // IntakeFinding uses lowercase severity; AuditFinding requires capitalized.
    function capitalize<T extends string>(s: string): T {
      return (s.charAt(0).toUpperCase() + s.slice(1)) as T;
    }

    type AuditFindingSeverity = "Critical" | "High" | "Medium" | "Low";

    const intakeDerivedFindings = result.overallFindings.map(
      (f: IntakeFinding, i: number) => {
        const severity = capitalize<AuditFindingSeverity>(f.severity);
        return {
          id: f.id ?? `intake-finding-${i}`,
          sectionId: "intake",
          sectionLabel: "Intake Assessment",
          category: f.category,
          questionId: f.id ?? `intake-q-${i}`,
          questionLabel: f.title,
          severity,
          priority: severity,
          businessImpact: f.description,
          relatedService: "",
          department: "",
          estimatedEffort: "Medium" as const,
          isQuickWin: severity === "Critical" || severity === "High",
          isRevenueOpportunity: severity === "Critical" || severity === "High",
          estimatedRevenueImpact: severity === "Critical" ? 2000 : severity === "High" ? 1000 : 300,
        };
      }
    );

    // Merge: goal-based findings first, then intake-derived findings.
    const mergedFindings = [
      ...baseAuditResult.findings,
      ...intakeDerivedFindings,
    ];

    const auditResult = {
      ...baseAuditResult,
      findings: mergedFindings,
      totalFindingCount: mergedFindings.length,
      criticalCount: mergedFindings.filter((f) => f.severity === "Critical").length,
      highCount: mergedFindings.filter((f) => f.severity === "High").length,
      mediumCount: mergedFindings.filter((f) => f.severity === "Medium").length,
      lowCount: mergedFindings.filter((f) => f.severity === "Low").length,
    };

    onUpdate({
      auditMode: "existing",
      selectedAuditId: null,
      auditResult,
    });
  }

  function handleModeSwitch(newMode: AuditMode) {
    setMode(newMode);
    if (newMode === "intake" && intakeAuditResult) {
      commitIntakeAuditToWizard(intakeAuditResult);
    }
    // When switching away from AI mode, the wizard state auditResult is already set
    // from onAuditComplete — no additional action needed
  }

  function commitAiAuditToWizard(aiResult: AiAuditResult) {
    // Convert AiAuditResult.allFindings (IntakeFinding[]) into the engine AuditFinding shape
    // using the same pattern as commitIntakeAuditToWizard.
    const goalIds = state.selectedGoals.length > 0 ? state.selectedGoals : ["goal-leads"];
    const sections = getSectionsForGoals(DEFAULT_AUDIT_TEMPLATE, goalIds);
    const passRate = aiResult.overallScore / 100;
    const answers: Record<string, boolean> = {};
    sections.forEach((sec) => {
      sec.questions.forEach((q) => {
        const seed = q.key.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const rand = ((seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
        answers[q.key] = rand < passRate;
      });
    });

    const baseAuditResult = runAuditEngine(
      goalIds,
      goalIds,
      answers,
      DEFAULT_AUDIT_TEMPLATE,
      undefined
    );

    function capitalize<T extends string>(s: string): T {
      return (s.charAt(0).toUpperCase() + s.slice(1)) as T;
    }

    type AuditFindingSeverity = "Critical" | "High" | "Medium" | "Low";

    const aiDerivedFindings = aiResult.allFindings.map(
      (f, i) => {
        const severity = capitalize<AuditFindingSeverity>(f.severity);
        return {
          id: f.id ?? `ai-finding-${i}`,
          sectionId: "ai-audit",
          sectionLabel: "AI Audit",
          category: f.category,
          questionId: f.id ?? `ai-q-${i}`,
          questionLabel: f.title,
          severity,
          priority: severity,
          businessImpact: f.description,
          relatedService: "",
          department: "",
          estimatedEffort: "Medium" as const,
          isQuickWin: severity === "Critical" || severity === "High",
          isRevenueOpportunity: severity === "Critical" || severity === "High",
          estimatedRevenueImpact:
            severity === "Critical" ? 2000 : severity === "High" ? 1000 : 300,
        };
      }
    );

    const mergedFindings = [
      ...baseAuditResult.findings,
      ...aiDerivedFindings,
    ];

    const auditResult = {
      ...baseAuditResult,
      findings: mergedFindings,
      totalFindingCount: mergedFindings.length,
      criticalCount: mergedFindings.filter((f) => f.severity === "Critical").length,
      highCount: mergedFindings.filter((f) => f.severity === "High").length,
      mediumCount: mergedFindings.filter((f) => f.severity === "Medium").length,
      lowCount: mergedFindings.filter((f) => f.severity === "Low").length,
    };

    onUpdate({
      auditMode: "ai",
      selectedAuditId: null,
      auditResult,
      aiAuditResult: aiResult,
    });
  }

  function handleApproveKeyword(kw: string) {
    setApprovedKeywords((prev) => (prev.includes(kw) ? prev : [...prev, kw]));
  }

  function handleRemoveKeyword(kw: string) {
    setApprovedKeywords((prev) => prev.filter((k) => k !== kw));
  }

  function handleAddCustomKeyword(kw: string) {
    setApprovedKeywords((prev) => (prev.includes(kw) ? prev : [...prev, kw]));
  }

  // ── Mode A: select existing audit ──────────────────────────────────────────

  function handleSelectExistingAudit(auditId: string) {
    setSelectedAuditId(auditId);
    const mock = MOCK_EXISTING_AUDITS.find((a) => a.id === auditId);
    if (!mock) return;

    const goalIds = state.selectedGoals;
    const goalLabels = mock.goalLabels;
    const answers: Record<string, boolean> = {};
    const sections = getSectionsForGoals(DEFAULT_AUDIT_TEMPLATE, goalIds);
    sections.forEach((sec) => {
      sec.questions.forEach((q) => {
        const seed = q.key.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const rand = ((seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
        answers[q.key] = rand < mock.score / 100;
      });
    });

    const result = runAuditEngine(
      goalIds.length > 0 ? goalIds : ["goal-leads"],
      goalLabels,
      answers,
      DEFAULT_AUDIT_TEMPLATE,
      auditId
    );

    onUpdate({
      auditMode: "existing",
      selectedAuditId: auditId,
      auditResult: result,
    });
  }

  // ── Mode B: quick audit ────────────────────────────────────────────────────

  function handleScoreChange(sectionKey: string, score: number) {
    setSectionScores((prev) => ({ ...prev, [sectionKey]: score }));
  }

  function handleRunQuickAudit() {
    if (state.selectedGoals.length === 0) return;

    const answers: Record<string, boolean> = {};
    activeSections.forEach((sec) => {
      const score = sectionScores[sec.key] ?? 50;
      const passRate = score / 100;
      sec.questions.forEach((q) => {
        const seed = q.key.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const rand = ((seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
        answers[q.key] = rand < passRate;
      });
    });

    const result = runAuditEngine(
      state.selectedGoals,
      state.selectedGoals,
      answers,
      DEFAULT_AUDIT_TEMPLATE,
      undefined
    );

    onUpdate({
      auditMode: "quick",
      selectedAuditId: null,
      auditResult: result,
    });
  }

  // ── Manual/Hybrid audit handlers ──────────────────────────────────────────

  function handleRequestCreated(result: ManualAuditRequest[] | HybridAuditRequest) {
    if (Array.isArray(result)) {
      setManualRequests(result);
    } else {
      setHybridRequest(result);
      const goalIds = state.selectedGoals.length > 0 ? state.selectedGoals : ["goal-leads"];
      const answers: Record<string, boolean> = {};
      activeSections.forEach((sec) => {
        sec.questions.forEach((q) => { answers[q.key] = true; });
      });
      const auditResult = runAuditEngine(goalIds, goalIds, answers, DEFAULT_AUDIT_TEMPLATE, undefined);
      onUpdate({ auditMode: "existing", auditResult, selectedAuditId: null });
    }
    setShowRequestModal(false);
  }

  function handleManualScorecardSubmit(
    request: ManualAuditRequest,
    scorecard: Record<string, number>,
    notes: Record<string, string>
  ) {
    const updated = submitManualAuditScorecard(request, scorecard, notes, "Reviewer");
    const nextRequests = manualRequests.map((r) => r.id === updated.id ? updated : r);
    setManualRequests(nextRequests);
    setScorecardTarget(null);
    const allFinalized = nextRequests.every((r) => r.status === "finalized");
    if (allFinalized) {
      const goalIds = state.selectedGoals.length > 0 ? state.selectedGoals : ["goal-leads"];
      const answers: Record<string, boolean> = {};
      activeSections.forEach((sec) => {
        sec.questions.forEach((q) => { answers[q.key] = true; });
      });
      const auditResult = runAuditEngine(goalIds, goalIds, answers, DEFAULT_AUDIT_TEMPLATE, undefined);
      onUpdate({ auditMode: "existing", auditResult, selectedAuditId: null });
    }
  }

  function handleReopenRequest(request: ManualAuditRequest) {
    const reopened = reopenManualAuditRequest(request, state.clientInfo?.name ?? "Sales Rep");
    const nextRequests = manualRequests.map((r) => r.id === reopened.id ? reopened : r);
    setManualRequests(nextRequests);
    // Close the read-only view and open the editable scorecard for this request
    setReadOnlyScorecardTarget(null);
    setScorecardTarget(reopened);
  }

  function handleUpdateReview(department: string, updatedReview: DepartmentReview) {
    if (!hybridRequest) return;
    const updatedRequest: HybridAuditRequest = {
      ...hybridRequest,
      departmentReviews: hybridRequest.departmentReviews.map((r) =>
        r.department === department ? updatedReview : r
      ),
    };
    setHybridRequest(updatedRequest);
  }

  const hybridDepartments = hybridRequest
    ? ["Sales rep (read-only)", ...hybridRequest.departmentReviews.map((r) => r.department)]
    : ["Sales rep (read-only)"];

  // ── Render ─────────────────────────────────────────────────────────────────

  const modeOptions: { id: AuditMode; label: string; disabled?: boolean; disabledTooltip?: string }[] = [
    {
      id: "ai",
      label: "AI Audit",
      disabled: !hasWebsiteUrl,
      disabledTooltip: "Enter the client website URL in Step 1 to enable AI Audit",
    },
    { id: "intake",   label: "Intake Audit",          disabled: !hasIntakeData },
    { id: "existing", label: "Use Existing Audit" },
    { id: "quick",    label: "Run Quick Audit" },
    { id: "manual",   label: "Request Manual Audit" },
    { id: "hybrid",   label: "Request Hybrid Audit" },
  ];

  return (
    <div className="space-y-6">
      {/* Mode selector */}
      <div
        className="rounded-xl border p-5"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <p
          className="text-[11px] font-bold uppercase tracking-wide mb-3"
          style={{ color: "var(--rtm-text-muted)" }}
        >
          Audit Mode
        </p>
        <div className="flex gap-3 flex-wrap">
          {modeOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => !opt.disabled && handleModeSwitch(opt.id)}
              disabled={opt.disabled}
              title={opt.disabled && opt.disabledTooltip ? opt.disabledTooltip : undefined}
              className="px-5 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: mode === opt.id ? "#EFF6FF" : "var(--rtm-bg)",
                borderColor: mode === opt.id ? "#1D4ED8" : "var(--rtm-border)",
                color: mode === opt.id ? "#1D4ED8" : "var(--rtm-text-secondary)",
              }}
            >
              {opt.label}
              {opt.id === "intake" && !hasIntakeData && (
                <span className="ml-1 text-[10px]">(no intake data)</span>
              )}
              {opt.id === "ai" && !hasWebsiteUrl && (
                <span className="ml-1 text-[10px]">(no website URL)</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Mode AI — AI Audit */}
      {mode === "ai" && (
        <AiAuditPanel
          intake={state.intakeRecord ?? {}}
          existingResult={state.aiAuditResult ?? null}
          onAuditComplete={(aiResult) => commitAiAuditToWizard(aiResult)}
        />
      )}

      {/* Mode C — Intake Audit */}
      {mode === "intake" && (
        <div className="space-y-6">
          {!intakeAuditResult && (
            <div
              className="rounded-xl border p-6 text-center"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
            >
              <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
                Generating intake audit...
              </p>
            </div>
          )}

          {intakeAuditResult && (
            <>
              <IntakeAuditBanner result={intakeAuditResult} />

              <CitationAuditSection
                citationAudit={intakeAuditResult.citationAudit}
                citationScore={intakeAuditResult.citationScore}
              />

              <KeywordSuggestionsSection
                keywordSuggestions={intakeAuditResult.keywordSuggestions}
                approvedKeywords={approvedKeywords}
                onApprove={handleApproveKeyword}
                onRemove={handleRemoveKeyword}
                onAddCustom={handleAddCustomKeyword}
              />

              <MarketingAssessmentSection
                assessments={intakeAuditResult.currentMarketingAssessment}
              />

              <WebsiteAssessmentSection
                assessment={intakeAuditResult.websiteAssessment}
              />
            </>
          )}
        </div>
      )}

      {/* Mode A — Use Existing Audit */}
      {mode === "existing" && (
        <div
          className="rounded-xl border"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <div className="px-6 py-4 border-b" style={{ borderColor: "var(--rtm-border)" }}>
            <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
              Select an Existing Audit
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
              Choose a completed audit to use as the basis for recommendations.
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label
                className="block text-[11px] font-bold uppercase tracking-wide mb-1"
                style={{ color: "var(--rtm-text-muted)" }}
              >
                Completed Audits
              </label>
              <select
                value={selectedAuditId}
                onChange={(e) => handleSelectExistingAudit(e.target.value)}
                className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                style={{
                  background: "var(--rtm-bg)",
                  borderColor: "var(--rtm-border)",
                  color: "var(--rtm-text-primary)",
                }}
              >
                <option value="">Select an audit…</option>
                {MOCK_EXISTING_AUDITS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} — Score: {a.score} — {a.date}
                  </option>
                ))}
              </select>
            </div>

            {selectedAuditId && (() => {
              const audit = MOCK_EXISTING_AUDITS.find((a) => a.id === selectedAuditId);
              if (!audit) return null;
              return (
                <div
                  className="rounded-xl border p-5 space-y-3"
                  style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}
                >
                  <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                    {audit.name}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Score", value: <ScoreBadge score={audit.score} /> },
                      {
                        label: "Findings",
                        value: (
                          <span className="text-xl font-black" style={{ color: "var(--rtm-text-primary)" }}>
                            {audit.findingsCount}
                          </span>
                        ),
                      },
                      {
                        label: "Critical",
                        value: (
                          <span className="text-xl font-black" style={{ color: "#DC2626" }}>
                            {audit.criticalCount}
                          </span>
                        ),
                      },
                      {
                        label: "Audit Date",
                        value: (
                          <span className="text-sm font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>
                            {audit.date}
                          </span>
                        ),
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-lg border px-4 py-3 text-center"
                        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
                      >
                        <p className="text-[10px] font-bold mb-2" style={{ color: "var(--rtm-text-muted)" }}>
                          {item.label.toUpperCase()}
                        </p>
                        {item.value}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold mb-1" style={{ color: "var(--rtm-text-muted)" }}>
                      GOALS AUDITED
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {audit.goalLabels.map((g) => (
                        <span
                          key={g}
                          className="text-xs px-2.5 py-1 rounded-full border"
                          style={{ background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" }}
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Mode B — Quick Audit */}
      {mode === "quick" && (
        <div
          className="rounded-xl border"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <div className="px-6 py-4 border-b" style={{ borderColor: "var(--rtm-border)" }}>
            <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
              Quick Audit
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
              Score each audit category based on your initial assessment. The engine will compute the overall result.
            </p>
          </div>
          <div className="p-6 space-y-4">
            {state.selectedGoals.length === 0 && (
              <div
                className="rounded-lg border px-4 py-3"
                style={{ background: "#FFF7ED", borderColor: "#FED7AA" }}
              >
                <p className="text-xs font-semibold" style={{ color: "#C2410C" }}>
                  Return to Step 1 and select at least one goal to enable the quick audit.
                </p>
              </div>
            )}

            {activeSections.length > 0 && (
              <div className="space-y-4">
                {activeSections.map((section) => (
                  <div
                    key={section.key}
                    className="rounded-xl border p-4"
                    style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                          {section.label}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                          {section.description}
                        </p>
                      </div>
                      <ScoreBadge score={sectionScores[section.key] ?? 50} />
                    </div>
                    <div className="flex items-center gap-4">
                      <label
                        className="text-[10px] font-bold uppercase tracking-wide flex-shrink-0"
                        style={{ color: "var(--rtm-text-muted)" }}
                      >
                        Score
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={sectionScores[section.key] ?? 50}
                        onChange={(e) => handleScoreChange(section.key, parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span
                        className="text-sm font-bold w-10 text-right flex-shrink-0"
                        style={{ color: "var(--rtm-text-primary)" }}
                      >
                        {sectionScores[section.key] ?? 50}
                      </span>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleRunQuickAudit}
                  className="px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ background: "#1D4ED8" }}
                >
                  Compute Audit Result
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Audit result confirmation (existing/quick modes) */}
      {(mode === "existing" || mode === "quick") && state.auditResult && (
        <AuditSummaryCard auditResult={state.auditResult} />
      )}

      {/* Mode D — Request Manual Audit */}
      {mode === "manual" && (
        <div className="space-y-5">
          <div
            className="rounded-xl border p-5"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
          >
            <p className="text-sm font-bold mb-1" style={{ color: "var(--rtm-text-primary)" }}>
              Manual Audit Requests
            </p>
            <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
              A team member will be assigned to fill out the scorecard manually for each service department.
            </p>
          </div>

          {manualRequests.length === 0 ? (
            <button
              type="button"
              onClick={() => { setRequestModalMode("manual"); setShowRequestModal(true); }}
              className="px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: "#1D4ED8" }}
            >
              Request Audit
            </button>
          ) : (
            <div className="space-y-4">
              {manualRequests.map((req) => (
                <div
                  key={req.id}
                  className="rounded-xl border p-4 space-y-3"
                  style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                        {req.department} Manual Audit
                      </p>
                      <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                        Assigned to: {req.assignedReviewer ?? "Unassigned"} · Due: {new Date(req.dueAt).toLocaleString()}
                      </p>
                    </div>
                    <AuditRequestStatusBadge status={req.status} />
                  </div>

                  {req.status !== "finalized" && (
                    <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                      Awaiting submission from {req.department} team.
                    </p>
                  )}

                  {req.status === "finalized" && req.submittedFindings && (
                    <div className="space-y-2">
                      <div
                        className="rounded-lg border px-3 py-2"
                        style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}
                      >
                        <p className="text-xs font-semibold" style={{ color: "#15803D" }}>
                          {req.submittedFindings.length} finding{req.submittedFindings.length !== 1 ? "s" : ""} submitted.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setReadOnlyScorecardTarget(req)}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg border transition-all hover:opacity-80"
                          style={{ background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" }}
                        >
                          View Scorecard
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReopenRequest(req)}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg border transition-all hover:opacity-80"
                          style={{ background: "#FFF7ED", color: "#C2410C", borderColor: "#FED7AA" }}
                        >
                          Reopen for Revision
                        </button>
                      </div>
                    </div>
                  )}

                  {req.status !== "finalized" && (
                    <button
                      type="button"
                      onClick={() => setScorecardTarget(req)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg border transition-all hover:opacity-80"
                      style={{ background: "#FFFBEB", color: "#D97706", borderColor: "#FDE68A" }}
                    >
                      Simulate Reviewer Submission
                    </button>
                  )}
                </div>
              ))}

              {manualRequests.every((r) => r.status === "finalized") && (
                <div
                  className="rounded-xl border px-4 py-3"
                  style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}
                >
                  <p className="text-sm font-bold" style={{ color: "#15803D" }}>
                    All manual audits finalized. Proceed to Step 3 to generate recommendations.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mode E — Request Hybrid Audit */}
      {mode === "hybrid" && (
        <div className="space-y-5">
          {!intakeAuditResult && (
            <div
              className="rounded-xl border p-5 text-center space-y-3"
              style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}
            >
              <p className="text-sm font-semibold" style={{ color: "#D97706" }}>
                Run the Intake Audit first to enable Hybrid mode.
              </p>
              <p className="text-xs" style={{ color: "#92400E" }}>
                Hybrid mode uses the AI intake audit as a baseline. Switch to the Intake Audit tab to run it.
              </p>
              <button
                type="button"
                onClick={() => handleModeSwitch("intake")}
                className="text-xs font-bold px-4 py-2 rounded-lg border"
                style={{ background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" }}
              >
                Go to Intake Audit
              </button>
            </div>
          )}

          {intakeAuditResult && !hybridRequest && (
            <button
              type="button"
              onClick={() => { setRequestModalMode("hybrid"); setShowRequestModal(true); }}
              className="px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: "#1D4ED8" }}
            >
              Request Hybrid Review
            </button>
          )}

          {hybridRequest && (
            <div className="space-y-4">
              {/* Reviewer view switcher */}
              <div
                className="rounded-xl border p-4 flex items-center gap-3 flex-wrap"
                style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
              >
                <label className="text-xs font-semibold" style={{ color: "var(--rtm-text-muted)" }}>
                  Viewing as:
                </label>
                <select
                  value={viewingAsDept}
                  onChange={(e) => setViewingAsDept(e.target.value)}
                  className="text-sm rounded-lg border px-3 py-1.5 focus:outline-none"
                  style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
                >
                  {hybridDepartments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>
                  Change this to simulate reviewing as a different department member.
                </p>
              </div>

              <HybridReviewPanel
                request={hybridRequest}
                currentUserDepartment={
                  viewingAsDept === "Sales rep (read-only)" ? undefined : viewingAsDept
                }
                onUpdateReview={handleUpdateReview}
              />

              <div
                className="rounded-xl border px-4 py-3"
                style={{ background: "#EFF6FF", borderColor: "#BFDBFE" }}
              >
                <p className="text-xs font-semibold" style={{ color: "#1D4ED8" }}>
                  You can proceed to Step 3 at any time. Pending department findings will appear as AI baseline until finalized.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Read-only Scorecard Modal (finalized — with Reopen capability) */}
      {readOnlyScorecardTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setReadOnlyScorecardTarget(null)}
          />
          <div
            className="relative w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col"
            style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", maxHeight: "90vh" }}
          >
            <div
              className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
            >
              <p className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                Finalized Scorecard
              </p>
              <button
                type="button"
                onClick={() => setReadOnlyScorecardTarget(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg"
                style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)" }}
              >
                x
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <ManualAuditScorecard
                request={readOnlyScorecardTarget}
                onSubmit={() => {}}
                readOnly={true}
                onReopen={() => handleReopenRequest(readOnlyScorecardTarget)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Request Audit Modal */}
      {showRequestModal && (
        <RequestAuditModal
          opportunityId={state.opportunityId ?? state.wizardId}
          clientName={state.clientInfo.businessName || state.clientInfo.name || "Client"}
          requestedServices={state.selectedGoals}
          requestedBy={state.clientInfo.name || "Sales Rep"}
          intakeAuditResult={intakeAuditResult}
          initialMode={requestModalMode}
          onRequestCreated={handleRequestCreated}
          onClose={() => setShowRequestModal(false)}
        />
      )}

      {/* Scorecard Modal */}
      {scorecardTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setScorecardTarget(null)}
          />
          <div
            className="relative w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col"
            style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", maxHeight: "90vh" }}
          >
            <div
              className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
            >
              <p className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                Reviewer Scorecard Simulation
              </p>
              <button
                type="button"
                onClick={() => setScorecardTarget(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg"
                style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)" }}
              >
                x
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <ManualAuditScorecard
                request={scorecardTarget}
                onSubmit={(scorecard, notes) =>
                  handleManualScorecardSubmit(scorecardTarget, scorecard, notes)
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
