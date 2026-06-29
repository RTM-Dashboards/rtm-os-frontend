"use client";

import React, { useState } from "react";
import { DEFAULT_AUDIT_TEMPLATE, getSectionsForGoals } from "@/lib/sales/audit-config";
import { runAuditEngine, type AuditResult } from "@/lib/sales/audit-engine";
import type { ProposalWizardState } from "../ProposalWizard";

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
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface Step2AuditProps {
  state: ProposalWizardState;
  onUpdate: (updates: Partial<ProposalWizardState>) => void;
}

type AuditMode = "existing" | "quick";

// ─── Score badge ──────────────────────────────────────────────────────────────

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

// ─── Audit summary card ────────────────────────────────────────────────────────

function AuditSummaryCard({ auditResult }: { auditResult: AuditResult }) {
  return (
    <div
      className="rounded-xl border p-5"
      style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: "#059669" }}
        />
        <p className="text-sm font-bold" style={{ color: "#15803D" }}>
          Audit result ready — recommendations will be generated in the next step.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Overall Score",
            value: <ScoreBadge score={auditResult.overallScore} />,
          },
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

// ─── Component ────────────────────────────────────────────────────────────────

export function Step2Audit({ state, onUpdate }: Step2AuditProps) {
  const [mode, setMode] = useState<AuditMode>(
    state.auditMode === "quick" ? "quick" : "existing"
  );
  const [selectedAuditId, setSelectedAuditId] = useState<string>(
    state.selectedAuditId ?? ""
  );

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

  // ── Mode A: select existing audit ──────────────────────────────────────────

  function handleSelectExistingAudit(auditId: string) {
    setSelectedAuditId(auditId);
    const mock = MOCK_EXISTING_AUDITS.find((a) => a.id === auditId);
    if (!mock) return;

    // Build a synthetic AuditResult from the mock data
    // Use goals from the wizard state
    const goalIds = state.selectedGoals;
    const goalLabels = mock.goalLabels;

    // Run engine with mock "average" answers seeded from mock score
    const answers: Record<string, boolean> = {};
    const sections = getSectionsForGoals(DEFAULT_AUDIT_TEMPLATE, goalIds);
    sections.forEach((sec) => {
      sec.questions.forEach((q) => {
        // Seed pass/fail based on mock score
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

    // Convert section scores to per-question answers
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

    const goalLabels = state.selectedGoals.map((gId) => {
      const found = DEFAULT_AUDIT_TEMPLATE.sections
        .flatMap((s) => s.goalIds)
        .includes(gId)
        ? gId
        : gId;
      return found;
    });

    const result = runAuditEngine(
      state.selectedGoals,
      goalLabels,
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
        <div className="flex gap-3">
          {(["existing", "quick"] as AuditMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className="px-5 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all"
              style={{
                background: mode === m ? "#EFF6FF" : "var(--rtm-bg)",
                borderColor: mode === m ? "#1D4ED8" : "var(--rtm-border)",
                color: mode === m ? "#1D4ED8" : "var(--rtm-text-secondary)",
              }}
            >
              {m === "existing" ? "Use Existing Audit" : "Run Quick Audit"}
            </button>
          ))}
        </div>
      </div>

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

            {/* Selected audit details */}
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
                        style={{
                          background: "var(--rtm-surface)",
                          borderColor: "var(--rtm-border)",
                        }}
                      >
                        <p
                          className="text-[10px] font-bold mb-2"
                          style={{ color: "var(--rtm-text-muted)" }}
                        >
                          {item.label.toUpperCase()}
                        </p>
                        {item.value}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p
                      className="text-[10px] font-bold mb-1"
                      style={{ color: "var(--rtm-text-muted)" }}
                    >
                      GOALS AUDITED
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {audit.goalLabels.map((g) => (
                        <span
                          key={g}
                          className="text-xs px-2.5 py-1 rounded-full border"
                          style={{
                            background: "#EFF6FF",
                            color: "#1D4ED8",
                            borderColor: "#BFDBFE",
                          }}
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
                        <p
                          className="text-sm font-semibold"
                          style={{ color: "var(--rtm-text-primary)" }}
                        >
                          {section.label}
                        </p>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "var(--rtm-text-muted)" }}
                        >
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
                        onChange={(e) =>
                          handleScoreChange(section.key, parseInt(e.target.value))
                        }
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

      {/* Audit result confirmation */}
      {state.auditResult && <AuditSummaryCard auditResult={state.auditResult} />}
    </div>
  );
}
