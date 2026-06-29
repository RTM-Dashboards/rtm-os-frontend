"use client";

import React, { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  generateAuditForIntake,
  getScoringThreshold,
  getSeverityConfig,
  AuditResult,
  AuditSectionResult,
  AuditFinding,
  RecommendationReady,
  DepartmentSummary,
  SCORING_THRESHOLDS,
} from "@/lib/sales/audit-engine";
import { AUDIT_GOAL_CONFIG, AuditGoalConfig } from "@/lib/sales/intake-config";

// ─────────────────────────────────────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────────────────────────────────────

function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared Badge Component
// ─────────────────────────────────────────────────────────────────────────────

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
  size?: "xs" | "sm";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-bold rounded-full border whitespace-nowrap",
        size === "xs" ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-0.5"
      )}
      style={{ background: bg, color, borderColor: border ?? "transparent" }}
    >
      {label}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: AuditFinding["severity"] }) {
  const cfg = getSeverityConfig(severity);
  return <Badge label={severity} bg={cfg.bg} color={cfg.color} border={cfg.border} />;
}

function PriorityBadge({ priority }: { priority: AuditFinding["priority"] }) {
  const cfg = getSeverityConfig(priority as AuditFinding["severity"]);
  return <Badge label={priority} bg={cfg.bg} color={cfg.color} border={cfg.border} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Score Ring Component
// ─────────────────────────────────────────────────────────────────────────────

function ScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const t = getScoringThreshold(score);
  const radius = (size - 8) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={t.border} strokeWidth={5}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={t.color} strokeWidth={5}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-black leading-none" style={{ fontSize: size * 0.22, color: t.color }}>
          {score}
        </div>
        <div className="font-bold leading-tight" style={{ fontSize: size * 0.1, color: t.color }}>
          /100
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Workflow Banner
// ─────────────────────────────────────────────────────────────────────────────

function WorkflowBanner({ active }: { active: string }) {
  const steps = ["Lead", "Sales Intake", "Goal Selection", "Dynamic Audit", "Ready For Recommendations"];
  return (
    <div className="rounded-xl border p-3 overflow-x-auto" style={{ background: "#F0FDF4", borderColor: "#A7F3D0" }}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#059669" }}>
        RTM OS Sales Workflow
      </p>
      <div className="flex items-center gap-1 flex-wrap">
        {steps.map((step, i, arr) => (
          <React.Fragment key={step}>
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
              style={{
                background:
                  step === active ? "#059669" :
                  steps.indexOf(step) < steps.indexOf(active) ? "#DCFCE7" : "#F1F5F9",
                color:
                  step === active ? "#fff" :
                  steps.indexOf(step) < steps.indexOf(active) ? "#15803D" : "#64748B",
              }}
            >
              {step}
            </span>
            {i < arr.length - 1 && <span className="text-slate-300 text-xs">›</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Goal Selector Panel
// ─────────────────────────────────────────────────────────────────────────────

function GoalSelectorPanel({
  selectedGoalIds,
  onToggleGoal,
  onRunAudit,
}: {
  selectedGoalIds: string[];
  onToggleGoal: (id: string) => void;
  onRunAudit: () => void;
}) {
  const allGoals = AUDIT_GOAL_CONFIG.filter((g: AuditGoalConfig) => g.active);

  return (
    <div className="rounded-2xl border-2 p-6" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            Goal-Based Audit Generator
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-secondary)" }}>
            Select one or more client goals — the audit engine generates different sections based on your selection.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
            {selectedGoalIds.length} goal{selectedGoalIds.length !== 1 ? "s" : ""} selected
          </span>
          <button
            onClick={onRunAudit}
            disabled={selectedGoalIds.length === 0}
            className="px-4 py-2 rounded-xl font-bold text-sm disabled:opacity-40"
            style={{ background: "#059669", color: "#fff" }}
          >
            Generate Audit →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {allGoals.map((goal: AuditGoalConfig) => {
          const isSelected = selectedGoalIds.includes(goal.id);
          return (
            <button
              key={goal.id}
              onClick={() => onToggleGoal(goal.id)}
              className="rounded-xl border p-4 text-left transition-all hover:shadow-md"
              style={{
                background: isSelected ? goal.bg : "var(--rtm-bg)",
                borderColor: isSelected ? goal.color : "var(--rtm-border)",
                boxShadow: isSelected ? `0 0 0 2px ${goal.color}20` : undefined,
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                  style={{ background: `${goal.color}18`, color: goal.color }}
                >
                  {goal.category}
                </span>
                <div
                  className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={{ background: isSelected ? goal.color : "transparent", borderColor: isSelected ? goal.color : "var(--rtm-border)" }}
                >
                  {isSelected && (
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <p className="text-xs font-bold mb-0.5" style={{ color: isSelected ? goal.color : "var(--rtm-text-primary)" }}>
                {goal.label}
              </p>
              <p className="text-[10px] leading-tight" style={{ color: "var(--rtm-text-muted)" }}>
                {goal.auditSections.slice(0, 2).join(" · ")}{goal.auditSections.length > 2 ? ` +${goal.auditSections.length - 2}` : ""}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sticky Score Summary Bar
// ─────────────────────────────────────────────────────────────────────────────

function StickySummaryBar({ result, onRegenerate }: { result: AuditResult; onRegenerate: () => void }) {
  const t = getScoringThreshold(result.overallScore);
  return (
    <div
      className="sticky top-0 z-40 rounded-xl border px-4 py-3 flex items-center gap-4 shadow-sm flex-wrap"
      style={{ background: t.bg, borderColor: t.border }}
    >
      <div className="flex items-center gap-3">
        <ScoreRing score={result.overallScore} size={48} />
        <div>
          <p className="text-xs font-black" style={{ color: t.color }}>{t.label}</p>
          <p className="text-[10px]" style={{ color: t.color }}>{result.goalLabels.join(" · ")}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-wrap flex-1">
        {[
          { label: "Critical", value: result.criticalCount, color: "#DC2626", bg: "#FEF2F2" },
          { label: "High", value: result.highCount, color: "#C2410C", bg: "#FFF7ED" },
          { label: "Quick Wins", value: result.quickWins.length, color: "#059669", bg: "#ECFDF5" },
          { label: "Sections", value: result.activeSections.length, color: "#1D4ED8", bg: "#EFF6FF" },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: stat.bg }}>
            <span className="text-sm font-black" style={{ color: stat.color }}>{stat.value}</span>
            <span className="text-[10px] font-semibold" style={{ color: stat.color }}>{stat.label}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span
          className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg"
          style={{
            background: result.isReadyForRecommendations ? "#059669" : "#94A3B8",
            color: "#fff"
          }}
        >
          {result.isReadyForRecommendations ? "✓ Ready For Recommendations" : "Draft"}
        </span>
        <button
          onClick={onRegenerate}
          className="text-xs px-3 py-1.5 rounded-lg font-semibold border"
          style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}
        >
          ↺ Regenerate
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Progress Sidebar
// ─────────────────────────────────────────────────────────────────────────────

function ProgressSidebar({
  result,
  activeSection,
  onSectionClick,
}: {
  result: AuditResult;
  activeSection: string;
  onSectionClick: (key: string) => void;
}) {
  return (
    <div className="w-52 flex-shrink-0">
      <div
        className="rounded-xl border overflow-hidden sticky top-16"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <div className="px-3 py-2.5 border-b" style={{ borderColor: "var(--rtm-border-light)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>
            Audit Sections
          </p>
        </div>
        <div className="py-1">
          {result.sectionResults.map((sr) => {
            const isActive = activeSection === sr.section.key;
            const t = getScoringThreshold(sr.rawScore);
            return (
              <button
                key={sr.section.key}
                onClick={() => onSectionClick(sr.section.key)}
                className="w-full text-left px-3 py-2.5 flex items-center gap-2 transition-colors"
                style={{ background: isActive ? "#EFF6FF" : "transparent" }}
              >
                <span className="text-sm flex-shrink-0">{sr.section.icon}</span>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[11px] font-semibold leading-tight truncate"
                    style={{ color: isActive ? "#1D4ED8" : "var(--rtm-text-primary)" }}
                  >
                    {sr.section.label}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="flex-1 h-1 rounded-full" style={{ background: "var(--rtm-border)" }}>
                      <div
                        className="h-1 rounded-full transition-all"
                        style={{ width: `${sr.rawScore}%`, background: t.color }}
                      />
                    </div>
                    <span className="text-[9px] font-bold flex-shrink-0" style={{ color: t.color }}>
                      {sr.rawScore}
                    </span>
                  </div>
                </div>
                {sr.criticalCount > 0 && (
                  <span
                    className="text-[9px] font-black px-1 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: "#FEF2F2", color: "#DC2626" }}
                  >
                    {sr.criticalCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {/* Overall score footer */}
        <div className="px-3 py-3 border-t" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase" style={{ color: "var(--rtm-text-muted)" }}>Overall</span>
            <span className="text-sm font-black" style={{ color: getScoringThreshold(result.overallScore).color }}>
              {result.overallScore}/100
            </span>
          </div>
          <div className="h-2 rounded-full" style={{ background: "var(--rtm-border)" }}>
            <div
              className="h-2 rounded-full transition-all"
              style={{ width: `${result.overallScore}%`, background: getScoringThreshold(result.overallScore).color }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Overall Score Panel
// ─────────────────────────────────────────────────────────────────────────────

function OverallScorePanel({ result }: { result: AuditResult }) {
  const t = getScoringThreshold(result.overallScore);
  return (
    <div className="rounded-2xl border-2 p-6" style={{ background: t.bg, borderColor: t.border }}>
      <div className="flex items-start gap-5 flex-wrap">
        <ScoreRing score={result.overallScore} size={96} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-black px-3 py-1 rounded-full" style={{ background: t.color, color: "#fff" }}>
              {t.label}
            </span>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{
                background: result.isReadyForRecommendations ? "#059669" : "#94A3B8",
                color: "#fff"
              }}
            >
              {result.status}
            </span>
          </div>
          <h2 className="text-xl font-black mt-1" style={{ color: t.color }}>
            {result.overallScore >= 85 ? "Strong digital foundation — polish time." :
             result.overallScore >= 65 ? "Good progress — meaningful opportunities remain." :
             result.overallScore >= 40 ? "Needs structured improvement plan." :
             "Significant gaps — immediate action recommended."}
          </h2>
          <p className="text-sm mt-1" style={{ color: t.color }}>
            {t.description} · {result.activeSections.length} section{result.activeSections.length !== 1 ? "s" : ""} audited · {result.totalFindingCount} finding{result.totalFindingCount !== 1 ? "s" : ""} identified
          </p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {result.goalLabels.map((label) => (
              <span
                key={label}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: t.color + "20", color: t.color, border: `1px solid ${t.border}` }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Score breakdown */}
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Critical", value: result.criticalCount, color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
            { label: "High", value: result.highCount, color: "#C2410C", bg: "#FFF7ED", border: "#FED7AA" },
            { label: "Medium", value: result.mediumCount, color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
            { label: "Low", value: result.lowCount, color: "#15803D", bg: "#F0FDF4", border: "#BBF7D0" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border p-3 text-center min-w-[64px]" style={{ background: stat.bg, borderColor: stat.border }}>
              <div className="text-xl font-black" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-[9px] font-bold mt-0.5" style={{ color: stat.color }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scoring legend */}
      <div className="mt-4 pt-4 border-t flex flex-wrap gap-3" style={{ borderColor: t.border }}>
        <p className="text-[10px] font-bold uppercase tracking-wide self-center" style={{ color: t.color }}>
          Score Legend:
        </p>
        {SCORING_THRESHOLDS.map((threshold) => (
          <div key={threshold.key} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: threshold.color }} />
            <span className="text-[10px] font-semibold" style={{ color: threshold.color }}>
              {threshold.minScore}–{threshold.maxScore} {threshold.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI Cards Row
// ─────────────────────────────────────────────────────────────────────────────

function KPIRow({ result }: { result: AuditResult }) {
  const cards = [
    { label: "Sections Audited",    value: result.activeSections.length, color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
    { label: "Total Findings",      value: result.totalFindingCount,     color: "#C2410C", bg: "#FFF7ED", border: "#FED7AA" },
    { label: "Quick Wins",          value: result.quickWins.length,      color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
    { label: "Services Needed",     value: result.recommendations.length, color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
    { label: "Departments Impacted", value: result.departmentSummary.length, color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
    { label: "Est. Monthly Value",  value: `$${result.estimatedTotalMonthlyRevenue.toLocaleString()}`, color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border p-4 text-center" style={{ background: c.bg, borderColor: c.border }}>
          <div className="text-2xl font-black" style={{ color: c.color }}>{c.value}</div>
          <div className="text-[9px] font-bold mt-0.5 leading-tight" style={{ color: c.color }}>{c.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Critical Findings Panel
// ─────────────────────────────────────────────────────────────────────────────

function CriticalFindingsPanel({ findings }: { findings: AuditFinding[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  if (findings.length === 0) return null;

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#FECACA" }}>
      <div className="px-5 py-4 flex items-center gap-3 border-b" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
        <span className="text-base">🚨</span>
        <div>
          <h3 className="text-sm font-bold" style={{ color: "#DC2626" }}>Critical Findings ({findings.length})</h3>
          <p className="text-[10px]" style={{ color: "#B91C1C" }}>Require immediate attention — blocking revenue and performance.</p>
        </div>
      </div>
      <div className="divide-y" style={{ borderColor: "#FEE2E2" }}>
        {findings.map((f) => (
          <div key={f.id} style={{ background: "#FFFAFA" }}>
            <button
              className="w-full text-left px-5 py-3 flex items-center justify-between gap-3"
              onClick={() => setExpanded(expanded === f.id ? null : f.id)}
            >
              <div className="flex items-center gap-3 flex-wrap">
                <SeverityBadge severity={f.severity} />
                <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                  {f.questionLabel}
                </span>
                <Badge label={f.sectionLabel} color="#6B7280" bg="#F3F4F6" />
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {f.isQuickWin && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#ECFDF5", color: "#059669" }}>
                    Quick Win
                  </span>
                )}
                <span style={{ color: "var(--rtm-text-muted)", fontSize: 12 }}>{expanded === f.id ? "▲" : "▼"}</span>
              </div>
            </button>
            {expanded === f.id && (
              <div className="px-5 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg p-3" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
                  <p className="text-[10px] font-bold uppercase mb-1" style={{ color: "#DC2626" }}>Business Impact</p>
                  <p className="text-xs" style={{ color: "#7F1D1D" }}>{f.businessImpact}</p>
                </div>
                <div className="rounded-lg p-3" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                  <p className="text-[10px] font-bold uppercase mb-1" style={{ color: "#15803D" }}>Recommended Service</p>
                  <p className="text-xs font-semibold" style={{ color: "#14532D" }}>{f.relatedService}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Badge label={f.department} color="#1D4ED8" bg="#EFF6FF" border="#BFDBFE" />
                    <Badge label={`${f.estimatedEffort} Effort`} color="#D97706" bg="#FFFBEB" border="#FDE68A" />
                    <Badge label={`$${f.estimatedRevenueImpact.toLocaleString()} opportunity`} color="#059669" bg="#ECFDF5" border="#A7F3D0" />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Quick Wins Panel
// ─────────────────────────────────────────────────────────────────────────────

function QuickWinsPanel({ findings }: { findings: AuditFinding[] }) {
  if (findings.length === 0) return null;
  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#A7F3D0" }}>
      <div className="px-5 py-4 flex items-center gap-3 border-b" style={{ background: "#ECFDF5", borderColor: "#A7F3D0" }}>
        <span className="text-base">⚡</span>
        <div>
          <h3 className="text-sm font-bold" style={{ color: "#059669" }}>Quick Wins ({findings.length})</h3>
          <p className="text-[10px]" style={{ color: "#047857" }}>High-impact, low-effort — start here for fastest results.</p>
        </div>
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {findings.map((f) => (
          <div key={f.id} className="rounded-xl border p-4" style={{ background: "#ECFDF5", borderColor: "#A7F3D0" }}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <SeverityBadge severity={f.severity} />
              <Badge label={`${f.estimatedEffort} Effort`} color="#059669" bg="#D1FAE5" border="#6EE7B7" />
            </div>
            <p className="text-xs font-bold mb-1" style={{ color: "#065F46" }}>{f.questionLabel}</p>
            <p className="text-[10px] mb-2" style={{ color: "#047857" }}>{f.businessImpact.slice(0, 100)}{f.businessImpact.length > 100 ? "…" : ""}</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge label={f.department} color="#1D4ED8" bg="#EFF6FF" border="#BFDBFE" size="xs" />
              <Badge label={f.relatedService} color="#059669" bg="#D1FAE5" border="#6EE7B7" size="xs" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Revenue Opportunities Panel
// ─────────────────────────────────────────────────────────────────────────────

function RevenueOpportunitiesPanel({ findings }: { findings: AuditFinding[] }) {
  if (findings.length === 0) return null;
  const totalEstimated = findings.reduce((sum, f) => sum + f.estimatedRevenueImpact, 0);

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#DDD6FE" }}>
      <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3 border-b" style={{ background: "#F5F3FF", borderColor: "#DDD6FE" }}>
        <div className="flex items-center gap-3">
          <span className="text-base">💎</span>
          <div>
            <h3 className="text-sm font-bold" style={{ color: "#6D28D9" }}>Revenue Opportunities ({findings.length})</h3>
            <p className="text-[10px]" style={{ color: "#7C3AED" }}>Estimated combined opportunity based on unresolved findings.</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black" style={{ color: "#6D28D9" }}>${totalEstimated.toLocaleString()}</p>
          <p className="text-[10px]" style={{ color: "#7C3AED" }}>estimated total opportunity</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs" style={{ borderCollapse: "collapse", minWidth: 700 }}>
          <thead>
            <tr style={{ background: "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border-light)" }}>
              {["Finding", "Section", "Severity", "Department", "Service", "Est. Impact"].map((h) => (
                <th key={h} className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {findings.map((f, i) => (
              <tr key={f.id} style={{ borderBottom: "1px solid var(--rtm-border-light)", background: i % 2 === 0 ? "var(--rtm-bg)" : "var(--rtm-surface)" }}>
                <td className="px-4 py-2.5 font-semibold max-w-xs" style={{ color: "var(--rtm-text-primary)" }}>
                  <span className="line-clamp-2">{f.questionLabel}</span>
                </td>
                <td className="px-4 py-2.5"><Badge label={f.sectionLabel} color="#6B7280" bg="#F3F4F6" /></td>
                <td className="px-4 py-2.5"><SeverityBadge severity={f.severity} /></td>
                <td className="px-4 py-2.5"><Badge label={f.department} color="#1D4ED8" bg="#EFF6FF" border="#BFDBFE" /></td>
                <td className="px-4 py-2.5 font-semibold" style={{ color: "#7C3AED" }}>{f.relatedService}</td>
                <td className="px-4 py-2.5 font-black text-sm" style={{ color: "#6D28D9" }}>${f.estimatedRevenueImpact.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: "#F5F3FF", borderTop: "2px solid #DDD6FE" }}>
              <td colSpan={5} className="px-4 py-2.5 text-xs font-bold" style={{ color: "#6D28D9" }}>Estimated Total Opportunity</td>
              <td className="px-4 py-2.5 text-sm font-black" style={{ color: "#6D28D9" }}>${totalEstimated.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section Detail Card (expandable)
// ─────────────────────────────────────────────────────────────────────────────

function SectionDetailCard({
  sectionResult,
  isActive,
  sectionRef,
}: {
  sectionResult: AuditSectionResult;
  isActive: boolean;
  sectionRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const { section, questionResults, rawScore, findingCount, criticalCount, highCount } = sectionResult;
  const t = getScoringThreshold(rawScore);

  return (
    <div
      ref={sectionRef}
      id={`section-${section.key}`}
      className="rounded-xl border overflow-hidden scroll-mt-16"
      style={{ borderColor: isActive ? "#1D4ED8" : "var(--rtm-border)", boxShadow: isActive ? "0 0 0 2px #BFDBFE" : undefined }}
    >
      {/* Section Header */}
      <button
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
        style={{ background: "var(--rtm-surface)", borderBottom: isOpen ? "1px solid var(--rtm-border-light)" : undefined }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-xl flex-shrink-0">{section.icon}</span>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>{section.label}</p>
              <Badge label={section.category} color="#6B7280" bg="#F3F4F6" />
              <Badge label={section.department} color="#1D4ED8" bg="#EFF6FF" border="#BFDBFE" />
            </div>
            <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{section.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full" style={{ background: "#FEF2F2", color: "#DC2626" }}>
                {criticalCount} critical
              </span>
            )}
            {highCount > 0 && (
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full" style={{ background: "#FFF7ED", color: "#C2410C" }}>
                {highCount} high
              </span>
            )}
            {findingCount === 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#ECFDF5", color: "#059669" }}>
                No issues
              </span>
            )}
          </div>
          <div className="text-center min-w-[48px]">
            <p className="text-base font-black leading-none" style={{ color: t.color }}>{rawScore}</p>
            <p className="text-[9px] font-bold" style={{ color: t.color }}>{t.label}</p>
          </div>
          {/* Mini score bar */}
          <div className="w-16 h-2 rounded-full" style={{ background: "var(--rtm-border)" }}>
            <div className="h-2 rounded-full transition-all" style={{ width: `${rawScore}%`, background: t.color }} />
          </div>
          <span style={{ color: "var(--rtm-text-muted)", fontSize: 12 }}>{isOpen ? "▲" : "▼"}</span>
        </div>
      </button>

      {/* Section Questions */}
      {isOpen && (
        <div style={{ background: "var(--rtm-bg)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ borderCollapse: "collapse", minWidth: 750 }}>
              <thead>
                <tr style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border-light)" }}>
                  {["Checkpoint", "Status", "Severity If Fails", "Effort", "Department", "Business Impact", "Service"].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {questionResults.map((qr, i) => {
                  const sc = getSeverityConfig(qr.question.severityIfFailed);
                  return (
                    <tr
                      key={qr.question.id}
                      style={{
                        borderBottom: "1px solid var(--rtm-border-light)",
                        background: !qr.passed && !qr.skipped ? sc.bg + "50" : (i % 2 === 0 ? "var(--rtm-bg)" : "var(--rtm-surface)"),
                      }}
                    >
                      <td className="px-4 py-2.5 font-medium" style={{ color: "var(--rtm-text-primary)", maxWidth: 280 }}>
                        {qr.question.label}
                      </td>
                      <td className="px-4 py-2.5">
                        {qr.skipped ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#F3F4F6", color: "#9CA3AF" }}>
                            Skipped
                          </span>
                        ) : qr.passed ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0" }}>
                            ✓ Pass
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                            ✗ Fail
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge label={qr.question.severityIfFailed} bg={sc.bg} color={sc.color} border={sc.border} />
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                          style={{
                            background: qr.question.estimatedEffort === "Low" ? "#F0FDF4" : qr.question.estimatedEffort === "Medium" ? "#FFFBEB" : "#FFF7ED",
                            color: qr.question.estimatedEffort === "Low" ? "#15803D" : qr.question.estimatedEffort === "Medium" ? "#D97706" : "#C2410C",
                          }}
                        >
                          {qr.question.estimatedEffort}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge label={qr.question.department} color="#1D4ED8" bg="#EFF6FF" border="#BFDBFE" />
                      </td>
                      <td className="px-4 py-2.5 text-[10px]" style={{ color: "var(--rtm-text-secondary)", maxWidth: 260 }}>
                        {!qr.passed && !qr.skipped ? qr.question.businessImpact : "—"}
                      </td>
                      <td className="px-4 py-2.5">
                        {qr.question.relatedService ? (
                          <span className="text-[10px] font-semibold" style={{ color: "#7C3AED" }}>
                            {qr.question.relatedService}
                          </span>
                        ) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Section footer */}
          <div className="px-5 py-3 flex items-center justify-between flex-wrap gap-2 border-t" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-surface)" }}>
            <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>
              {section.questions.length} checkpoints · {findingCount} finding{findingCount !== 1 ? "s" : ""} · weight {section.weight}% of overall score
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold" style={{ color: t.color }}>Section Score: {rawScore}/100 — {t.label}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Department Summary Panel
// ─────────────────────────────────────────────────────────────────────────────

function DepartmentSummaryPanel({ summary }: { summary: DepartmentSummary[] }) {
  if (summary.length === 0) return null;
  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--rtm-border)" }}>
      <div className="px-5 py-4 border-b" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
        <h3 className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>Department Summary</h3>
        <p className="text-[10px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
          Findings and work ownership by department — used to route recommendations.
        </p>
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {summary.map((dept) => (
          <div key={dept.departmentKey} className="rounded-xl border p-4" style={{ background: dept.bg, borderColor: dept.border }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold" style={{ color: dept.color }}>{dept.departmentLabel}</p>
              <div className="flex items-center gap-1">
                {dept.criticalCount > 0 && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ background: "#FEF2F2", color: "#DC2626" }}>
                    {dept.criticalCount} critical
                  </span>
                )}
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: dept.color + "20", color: dept.color }}>
                  {dept.findingCount} finding{dept.findingCount !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
            {dept.recommendedServices.length > 0 && (
              <div>
                <p className="text-[9px] font-bold uppercase mb-1" style={{ color: dept.color }}>Services Recommended</p>
                {dept.recommendedServices.map((svc) => (
                  <p key={svc} className="text-[10px] mb-0.5 font-medium" style={{ color: dept.color }}>• {svc}</p>
                ))}
              </div>
            )}
            {dept.estimatedMonthlyRevenue > 0 && (
              <p className="text-xs font-black mt-2" style={{ color: dept.color }}>
                ${dept.estimatedMonthlyRevenue.toLocaleString()}/mo estimated
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Recommendation Readiness Panel
// ─────────────────────────────────────────────────────────────────────────────

function RecommendationReadinessPanel({ result }: { result: AuditResult }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const priorityColors: Record<string, { color: string; bg: string; border: string }> = {
    Critical: { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
    High:     { color: "#C2410C", bg: "#FFF7ED", border: "#FED7AA" },
    Medium:   { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
    Low:      { color: "#15803D", bg: "#F0FDF4", border: "#BBF7D0" },
  };

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: result.isReadyForRecommendations ? "#A7F3D0" : "var(--rtm-border)" }}>
      <div className="px-5 py-4 border-b" style={{ background: result.isReadyForRecommendations ? "#ECFDF5" : "var(--rtm-surface)", borderColor: result.isReadyForRecommendations ? "#A7F3D0" : "var(--rtm-border)" }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-bold" style={{ color: result.isReadyForRecommendations ? "#059669" : "var(--rtm-text-primary)" }}>
              {result.isReadyForRecommendations ? "✓ Ready For Recommendations" : "Recommendation Readiness"}
            </h3>
            <p className="text-[10px] mt-0.5" style={{ color: result.isReadyForRecommendations ? "#047857" : "var(--rtm-text-muted)" }}>
              {result.recommendations.length} service recommendation{result.recommendations.length !== 1 ? "s" : ""} prepared from audit findings. Est. ${result.estimatedTotalMonthlyRevenue.toLocaleString()}/mo.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black" style={{ color: result.isReadyForRecommendations ? "#059669" : "#94A3B8" }}>
              ${result.estimatedTotalMonthlyRevenue.toLocaleString()}/mo
            </span>
            <Link
              href="/sales/recommendations"
              className="px-4 py-2 rounded-xl font-bold text-sm"
              style={{ background: result.isReadyForRecommendations ? "#059669" : "#94A3B8", color: "#fff" }}
            >
              Open Recommendations →
            </Link>
          </div>
        </div>
      </div>
      <div className="divide-y" style={{ borderColor: "var(--rtm-border-light)" }}>
        {result.recommendations.map((rec) => {
          const pc = priorityColors[rec.priority] ?? priorityColors.Medium;
          const isOpen = expanded === rec.mappingId;
          return (
            <div key={rec.mappingId}>
              <button
                className="w-full text-left px-5 py-3.5 flex items-center justify-between gap-3"
                style={{ background: "var(--rtm-bg)" }}
                onClick={() => setExpanded(isOpen ? null : rec.mappingId)}
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge label={rec.priority} bg={pc.bg} color={pc.color} border={pc.border} />
                  <p className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>{rec.service}</p>
                  <Badge label={rec.department} color="#1D4ED8" bg="#EFF6FF" border="#BFDBFE" />
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs font-bold" style={{ color: "#059669" }}>
                    ${rec.estimatedMonthlyFee.toLocaleString()}/mo
                  </span>
                  <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{rec.estimatedTimeline}</span>
                  <span style={{ color: "var(--rtm-text-muted)", fontSize: 12 }}>{isOpen ? "▲" : "▼"}</span>
                </div>
              </button>
              {isOpen && (
                <div className="px-5 pb-4 pt-1" style={{ background: "var(--rtm-surface)" }}>
                  <p className="text-xs mb-2" style={{ color: "var(--rtm-text-secondary)" }}>{rec.reasoning}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    {[
                      { label: "Est. Monthly Fee", value: `$${rec.estimatedMonthlyFee.toLocaleString()}` },
                      { label: "Timeline", value: rec.estimatedTimeline },
                      { label: "Revenue Impact", value: `$${rec.totalEstimatedRevenueImpact.toLocaleString()}` },
                      { label: "Trigger Findings", value: rec.triggerFindings.length },
                    ].map((m) => (
                      <div key={m.label} className="rounded-lg p-2 text-center" style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)" }}>
                        <p className="text-[10px] font-bold uppercase" style={{ color: "var(--rtm-text-muted)" }}>{m.label}</p>
                        <p className="text-sm font-black mt-0.5" style={{ color: pc.color }}>{m.value}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase mb-1.5" style={{ color: "var(--rtm-text-muted)" }}>Trigger Findings</p>
                    <div className="space-y-1">
                      {rec.triggerFindings.slice(0, 3).map((f) => (
                        <div key={f.id} className="flex items-center gap-2">
                          <SeverityBadge severity={f.severity} />
                          <span className="text-[10px]" style={{ color: "var(--rtm-text-secondary)" }}>{f.questionLabel}</span>
                        </div>
                      ))}
                      {rec.triggerFindings.length > 3 && (
                        <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>+{rec.triggerFindings.length - 3} more findings</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// All Findings Table (collapsible)
// ─────────────────────────────────────────────────────────────────────────────

function AllFindingsTable({ findings }: { findings: AuditFinding[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (findings.length === 0) return null;

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--rtm-border)" }}>
      <button
        className="w-full text-left px-5 py-4 flex items-center justify-between"
        style={{ background: "var(--rtm-surface)", borderBottom: isOpen ? "1px solid var(--rtm-border-light)" : undefined }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          <h3 className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>All Findings ({findings.length})</h3>
          <p className="text-[10px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>Complete list of all audit findings sorted by severity.</p>
        </div>
        <span style={{ color: "var(--rtm-text-muted)", fontSize: 12 }}>{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr style={{ background: "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border-light)" }}>
                {["Finding", "Section", "Severity", "Priority", "Dept", "Effort", "Quick Win", "Est. Impact"].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {findings.map((f, i) => (
                <React.Fragment key={f.id}>
                  <tr
                    className="cursor-pointer"
                    style={{ borderBottom: "1px solid var(--rtm-border-light)", background: i % 2 === 0 ? "var(--rtm-bg)" : "var(--rtm-surface)" }}
                    onClick={() => setExpandedId(expandedId === f.id ? null : f.id)}
                  >
                    <td className="px-4 py-2.5 font-semibold" style={{ color: "var(--rtm-text-primary)", maxWidth: 260 }}>
                      <span className="line-clamp-2">{f.questionLabel}</span>
                    </td>
                    <td className="px-4 py-2.5"><Badge label={f.sectionLabel} color="#6B7280" bg="#F3F4F6" /></td>
                    <td className="px-4 py-2.5"><SeverityBadge severity={f.severity} /></td>
                    <td className="px-4 py-2.5"><PriorityBadge priority={f.priority} /></td>
                    <td className="px-4 py-2.5"><Badge label={f.department} color="#1D4ED8" bg="#EFF6FF" border="#BFDBFE" /></td>
                    <td className="px-4 py-2.5">
                      <span className="text-[10px] font-semibold" style={{ color: f.estimatedEffort === "Low" ? "#15803D" : f.estimatedEffort === "Medium" ? "#D97706" : "#C2410C" }}>
                        {f.estimatedEffort}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      {f.isQuickWin ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#ECFDF5", color: "#059669" }}>⚡ Yes</span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-2.5 font-bold" style={{ color: "#6D28D9" }}>${f.estimatedRevenueImpact.toLocaleString()}</td>
                  </tr>
                  {expandedId === f.id && (
                    <tr style={{ background: "#F8F9FF" }}>
                      <td colSpan={8} className="px-4 py-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="rounded-lg p-3" style={{ background: "#FEF9E7", border: "1px solid #FDE68A" }}>
                            <p className="text-[10px] font-bold uppercase mb-1" style={{ color: "#92400E" }}>Business Impact</p>
                            <p className="text-xs" style={{ color: "#78350F" }}>{f.businessImpact}</p>
                          </div>
                          <div className="rounded-lg p-3" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                            <p className="text-[10px] font-bold uppercase mb-1" style={{ color: "#15803D" }}>Recommended Service</p>
                            <p className="text-xs font-semibold" style={{ color: "#14532D" }}>{f.relatedService}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function AuditReportPage() {
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>(["goal-leads", "goal-seo", "goal-gbp"]);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [activeSection, setActiveSection] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Ref map for section scrolling
  const sectionRefs = useMemo(() => {
    const map = new Map<string, React.RefObject<HTMLDivElement | null>>();
    if (auditResult) {
      for (const sec of auditResult.activeSections) {
        map.set(sec.key, React.createRef<HTMLDivElement>());
      }
    }
    return map;
  }, [auditResult?.activeSections.map((s) => s.key).join(",")]);

  const goalLabels = useMemo(
    () => AUDIT_GOAL_CONFIG.filter((g: AuditGoalConfig) => selectedGoalIds.includes(g.id)).map((g: AuditGoalConfig) => g.label),
    [selectedGoalIds]
  );

  const handleToggleGoal = useCallback((id: string) => {
    setSelectedGoalIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }, []);

  const handleRunAudit = useCallback(() => {
    if (selectedGoalIds.length === 0) return;
    setIsGenerating(true);
    // Simulate async generation (would be API call in production)
    setTimeout(() => {
      const result = generateAuditForIntake(selectedGoalIds, goalLabels, undefined, "intake-demo-001");
      setAuditResult(result);
      setActiveSection(result.activeSections[0]?.key ?? "");
      setIsGenerating(false);
    }, 400);
  }, [selectedGoalIds, goalLabels]);

  const handleSectionClick = useCallback((key: string) => {
    setActiveSection(key);
    const ref = sectionRefs.get(key);
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [sectionRefs]);

  const handleRegenerate = useCallback(() => {
    setAuditResult(null);
  }, []);

  return (
    <div className="space-y-5">

      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "#059669" }}>Sales</p>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
            Goal-Based Audit Engine
          </h1>
          <p className="text-sm mt-1 max-w-2xl" style={{ color: "var(--rtm-text-secondary)" }}>
            Select client goals to generate a dynamic audit. Each goal activates different audit sections, scoring rules, and recommendation mappings — entirely configuration-driven.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/sales/audits"
            className="text-sm px-3 py-2 rounded-lg font-semibold border"
            style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}
          >
            Audit Intelligence Center
          </Link>
          <Link
            href="/settings/audit-goal-config"
            className="text-sm px-3 py-2 rounded-lg font-semibold border"
            style={{ background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" }}
          >
            Configure Goals
          </Link>
          <Link
            href="/settings/audit-templates"
            className="text-sm px-3 py-2 rounded-lg font-semibold border"
            style={{ background: "#F5F3FF", color: "#7C3AED", borderColor: "#DDD6FE" }}
          >
            Audit Templates
          </Link>
        </div>
      </div>

      {/* Workflow Banner */}
      <WorkflowBanner active={auditResult ? "Dynamic Audit" : "Goal Selection"} />

      {/* Goal Selector (shown when no audit generated) */}
      {!auditResult && (
        <>
          <GoalSelectorPanel
            selectedGoalIds={selectedGoalIds}
            onToggleGoal={handleToggleGoal}
            onRunAudit={handleRunAudit}
          />

          {/* Architecture note */}
          <div className="rounded-xl border p-4" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
            <p className="text-xs font-bold mb-1" style={{ color: "#D97706" }}>Configuration Architecture</p>
            <p className="text-xs" style={{ color: "#92400E" }}>
              Audit goals, templates, sections, questions, scoring thresholds, priority rules, department mappings, and recommendation mappings are all defined in{" "}
              <Link href="/settings/audit-goal-config" className="underline font-bold">Settings → Audit Goal Configuration</Link>
              {" "}and{" "}
              <Link href="/settings/audit-templates" className="underline font-bold">Settings → Audit Templates</Link>.
              No business rules are hardcoded in this page.
            </p>
          </div>

          {isGenerating && (
            <div className="rounded-xl border p-8 text-center" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
              <div className="text-3xl mb-2">⚙️</div>
              <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>Generating audit…</p>
              <p className="text-xs mt-1" style={{ color: "var(--rtm-text-muted)" }}>
                Loading template → building sections → calculating scores → preparing findings
              </p>
            </div>
          )}
        </>
      )}

      {/* Audit Results */}
      {auditResult && (
        <>
          {/* Sticky summary bar */}
          <StickySummaryBar result={auditResult} onRegenerate={handleRegenerate} />

          {/* Overall Score Panel */}
          <OverallScorePanel result={auditResult} />

          {/* KPI Row */}
          <KPIRow result={auditResult} />

          {/* Goal selector inline (collapsed state) */}
          <div className="rounded-xl border p-4 flex items-center justify-between flex-wrap gap-3" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
            <div>
              <p className="text-xs font-bold mb-1.5" style={{ color: "var(--rtm-text-primary)" }}>Active Goals</p>
              <div className="flex flex-wrap gap-1.5">
                {AUDIT_GOAL_CONFIG.filter((g: AuditGoalConfig) => auditResult.goalIds.includes(g.id)).map((g: AuditGoalConfig) => (
                  <span key={g.id} className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: g.bg, color: g.color, border: `1px solid ${g.border}` }}>
                    {g.label}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={handleRegenerate}
              className="text-xs px-3 py-2 rounded-lg font-semibold border"
              style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}
            >
              ← Change Goals
            </button>
          </div>

          {/* Critical Findings */}
          <CriticalFindingsPanel findings={auditResult.criticalFindings} />

          {/* Quick Wins */}
          <QuickWinsPanel findings={auditResult.quickWins} />

          {/* Revenue Opportunities */}
          <RevenueOpportunitiesPanel findings={auditResult.revenueOpportunities} />

          {/* Main content: sidebar + sections */}
          <div className="flex gap-5 items-start">

            {/* Progress Sidebar */}
            <ProgressSidebar
              result={auditResult}
              activeSection={activeSection}
              onSectionClick={handleSectionClick}
            />

            {/* Section Detail Cards */}
            <div className="flex-1 min-w-0 space-y-4">
              {auditResult.sectionResults.map((sr) => (
                <SectionDetailCard
                  key={sr.section.key}
                  sectionResult={sr}
                  isActive={activeSection === sr.section.key}
                  sectionRef={sectionRefs.get(sr.section.key) ?? React.createRef()}
                />
              ))}
            </div>
          </div>

          {/* Department Summary */}
          <DepartmentSummaryPanel summary={auditResult.departmentSummary} />

          {/* Recommendation Readiness */}
          <RecommendationReadinessPanel result={auditResult} />

          {/* All Findings Table */}
          <AllFindingsTable findings={auditResult.findings} />

          {/* Engine Info Panel */}
          <div className="rounded-xl border p-4" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
            <p className="text-xs font-bold mb-1" style={{ color: "#D97706" }}>Audit Engine — Configuration Sources</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                { label: "Audit Goal Config", href: "/settings/audit-goal-config" },
                { label: "Audit Templates", href: "/settings/audit-templates" },
                { label: "Audit Conditions", href: "/settings/audit-conditions" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="text-[10px] font-semibold px-2 py-1 rounded-lg border underline" style={{ background: "#FFFBEB", color: "#D97706", borderColor: "#FDE68A" }}>
                  {l.label}
                </Link>
              ))}
            </div>
            <p className="text-[10px] mt-2" style={{ color: "#92400E" }}>
              Template: {auditResult.templateId} · Generated: {new Date(auditResult.generatedAt).toLocaleString()} · 
              Sections: {auditResult.activeSections.length} active of {AUDIT_GOAL_CONFIG.length} goals configured
            </p>
          </div>

          {/* CTA: Next Step */}
          {auditResult.isReadyForRecommendations && (
            <div className="rounded-2xl border-2 p-6" style={{ background: "#ECFDF5", borderColor: "#059669" }}>
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#059669" }}>Workflow: Next Step</p>
                  <h3 className="text-lg font-bold" style={{ color: "#059669" }}>Audit Complete — Ready For Recommendations</h3>
                  <p className="text-sm mt-1" style={{ color: "#047857" }}>
                    {auditResult.recommendations.length} service recommendations generated from {auditResult.totalFindingCount} findings.{" "}
                    Estimated monthly value: ${auditResult.estimatedTotalMonthlyRevenue.toLocaleString()}/mo.
                  </p>
                </div>
                <Link
                  href="/sales/recommendations"
                  className="px-6 py-3 rounded-xl font-bold text-sm flex-shrink-0"
                  style={{ background: "#059669", color: "#fff" }}
                >
                  Open Recommendation Engine →
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
