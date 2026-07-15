"use client";

import React, { useState, useEffect, useRef } from "react";
import type { HomeServicesIntakeRecord, AiAuditResult, AiAuditStatus } from "@/lib/sales/types";
import { runAiAudit } from "@/lib/sales/ai-audit-engine";
import { AI_AUDIT_SCORE_THRESHOLDS } from "@/lib/sales/audit-config";
import { AiAuditServiceSection } from "./AiAuditServiceSection";

// ─── Score style ──────────────────────────────────────────────────────────────

function scoreStyle(score: number): { bg: string; color: string; border: string } {
  for (const threshold of Object.values(AI_AUDIT_SCORE_THRESHOLDS)) {
    if (score >= threshold.min && score <= threshold.max) {
      if (threshold.min === 0) return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
      if (threshold.min === 31) return { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" };
      if (threshold.min === 51) return { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" };
      if (threshold.min === 71) return { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" };
      return { bg: "#F0FDF4", color: "#15803D", border: "#BBF7D0" };
    }
  }
  return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
}

function pageSpeedColor(score: number): string {
  if (score >= 90) return "#15803D";
  if (score >= 50) return "#D97706";
  return "#DC2626";
}

// ─── Progress steps ───────────────────────────────────────────────────────────

const PROGRESS_STEPS: { percent: number; label: string }[] = [
  { percent: 0,  label: "Connecting to website..." },
  { percent: 20, label: "Fetching website content..." },
  { percent: 40, label: "Running PageSpeed analysis..." },
  { percent: 60, label: "Analyzing with AI..." },
  { percent: 80, label: "Generating findings..." },
  { percent: 95, label: "Finalizing report..." },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface AiAuditPanelProps {
  intake: Partial<HomeServicesIntakeRecord>;
  existingResult?: AiAuditResult | null;
  onAuditComplete: (result: AiAuditResult) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AiAuditPanel({
  intake,
  existingResult,
  onAuditComplete,
}: AiAuditPanelProps) {
  const websiteUrl = (intake as HomeServicesIntakeRecord).website2?.url ||
    (intake as HomeServicesIntakeRecord).website || "";

  const [status, setStatus] = useState<AiAuditStatus>(() =>
    existingResult ? "complete" : "idle"
  );
  const [result, setResult] = useState<AiAuditResult | null>(existingResult ?? null);
  const [dismissedFindingIds, setDismissedFindingIds] = useState<string[]>([]);
  const [progressStep, setProgressStep] = useState<string>("");
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepIndexRef = useRef(0);

  // If existingResult is provided on initial mount, show complete immediately
  useEffect(() => {
    if (existingResult) {
      setResult(existingResult);
      setStatus("complete");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startProgressSimulation() {
    stepIndexRef.current = 0;
    setProgressPercent(0);
    setProgressStep(PROGRESS_STEPS[0].label);

    const interval = setInterval(() => {
      const nextIdx = stepIndexRef.current + 1;
      if (nextIdx < PROGRESS_STEPS.length) {
        stepIndexRef.current = nextIdx;
        setProgressPercent(PROGRESS_STEPS[nextIdx].percent);
        setProgressStep(PROGRESS_STEPS[nextIdx].label);
      }
      // Hold at 95% until the async call completes
    }, 2500);

    progressIntervalRef.current = interval;
  }

  function stopProgressSimulation() {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }

  async function handleRunAudit() {
    if (!websiteUrl) return;

    setStatus("running");
    setErrorMessage("");
    setResult(null);
    startProgressSimulation();

    try {
      const auditResult = await runAiAudit(intake as HomeServicesIntakeRecord);
      stopProgressSimulation();
      setProgressPercent(100);
      setProgressStep("Complete");
      setResult(auditResult);
      setStatus("complete");
      onAuditComplete(auditResult);
    } catch (err) {
      stopProgressSimulation();
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Unknown error occurred.");
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => stopProgressSimulation();
  }, []);

  function handleDismissFinding(id: string) {
    setDismissedFindingIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  function handleRerun() {
    setResult(null);
    setDismissedFindingIds([]);
    setStatus("idle");
  }

  // ── No website URL ──────────────────────────────────────────────────────────

  if (!websiteUrl) {
    return (
      <div
        className="rounded-xl border p-8 text-center space-y-2"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>
          Enter the client website URL in Step 1 to enable AI Audit.
        </p>
        <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
          The AI Audit fetches the website, runs a PageSpeed analysis, and uses AI to generate findings automatically.
        </p>
      </div>
    );
  }

  // ── Idle ────────────────────────────────────────────────────────────────────

  if (status === "idle") {
    return (
      <div
        className="rounded-xl border p-8 text-center space-y-4"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <div>
          <p className="text-sm font-bold mb-1" style={{ color: "var(--rtm-text-primary)" }}>
            AI Audit Ready
          </p>
          <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
            Website to analyze:{" "}
            <span className="font-semibold" style={{ color: "#1D4ED8" }}>
              {websiteUrl}
            </span>
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--rtm-text-muted)" }}>
            The AI will fetch the site, run PageSpeed Insights, and generate findings automatically.
            Usually takes 15-30 seconds.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRunAudit}
          className="px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90"
          style={{ background: "#1D4ED8" }}
        >
          Run AI Audit
        </button>
      </div>
    );
  }

  // ── Running ─────────────────────────────────────────────────────────────────

  if (status === "running") {
    return (
      <div
        className="rounded-xl border p-8 space-y-5"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <div>
          <p className="text-sm font-bold mb-0.5" style={{ color: "var(--rtm-text-primary)" }}>
            Running AI Audit
          </p>
          <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
            Analyzing:{" "}
            <span className="font-semibold" style={{ color: "#1D4ED8" }}>
              {websiteUrl}
            </span>
          </p>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>
              {progressStep}
            </p>
            <p className="text-xs font-bold" style={{ color: "var(--rtm-text-muted)" }}>
              {progressPercent}%
            </p>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: "var(--rtm-border)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progressPercent}%`,
                background: "#1D4ED8",
              }}
            />
          </div>
        </div>

        <p className="text-xs text-center" style={{ color: "var(--rtm-text-muted)" }}>
          Usually takes 15-30 seconds
        </p>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────

  if (status === "error") {
    return (
      <div
        className="rounded-xl border p-8 text-center space-y-4"
        style={{ background: "#FEF2F2", borderColor: "#FECACA" }}
      >
        <p className="text-sm font-bold" style={{ color: "#DC2626" }}>
          AI Audit Failed
        </p>
        {errorMessage && (
          <p className="text-xs" style={{ color: "#DC2626" }}>
            {errorMessage}
          </p>
        )}
        <button
          type="button"
          onClick={handleRunAudit}
          className="px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90"
          style={{ background: "#DC2626" }}
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Complete ─────────────────────────────────────────────────────────────────

  if (status === "complete" && result) {
    const sty = scoreStyle(result.overallScore);
    const scoreThreshold = Object.values(AI_AUDIT_SCORE_THRESHOLDS).find(
      (t) => result.overallScore >= t.min && result.overallScore <= t.max
    );
    const scoreLabel = scoreThreshold?.label ?? "";

    const activeDismissed = dismissedFindingIds.length;
    const totalFindings = result.allFindings.length;
    const activeFindings = totalFindings - activeDismissed;

    const servicesWithFindings = result.serviceResults.filter(
      (sr) => sr.findings.length > 0
    );

    const allServicesAllDismissed =
      servicesWithFindings.length > 0 &&
      servicesWithFindings.every((sr) =>
        sr.findings.every((f) => dismissedFindingIds.includes(f.id))
      );

    return (
      <div className="space-y-5">
        {/* Header */}
        <div
          className="rounded-xl border p-5"
          style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full border"
                  style={{ background: "#DCFCE7", color: "#15803D", borderColor: "#BBF7D0" }}
                >
                  AI Audit Complete
                </span>
              </div>
              <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                Analyzed:{" "}
                <span className="font-semibold" style={{ color: "#1D4ED8" }}>
                  {result.websiteUrl}
                </span>
              </p>
              <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                Generated:{" "}
                {new Date(result.generatedAt).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <button
              type="button"
              onClick={handleRerun}
              className="px-4 py-2 rounded-lg border text-xs font-semibold transition-all hover:opacity-80"
              style={{
                background: "var(--rtm-surface)",
                borderColor: "var(--rtm-border)",
                color: "var(--rtm-text-secondary)",
              }}
            >
              Re-run Audit
            </button>
          </div>
        </div>

        {/* Summary bar */}
        <div
          className="rounded-xl border p-4"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              className="rounded-lg border px-4 py-3 text-center"
              style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}
            >
              <p className="text-[10px] font-bold mb-1" style={{ color: "var(--rtm-text-muted)" }}>
                OVERALL SCORE
              </p>
              <span
                className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border"
                style={{ background: sty.bg, color: sty.color, borderColor: sty.border }}
              >
                <span className="text-xl font-black">{result.overallScore}</span>
              </span>
              <p className="text-[10px] mt-1" style={{ color: sty.color }}>
                {scoreLabel}
              </p>
            </div>

            <div
              className="rounded-lg border px-4 py-3 text-center"
              style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}
            >
              <p className="text-[10px] font-bold mb-1" style={{ color: "var(--rtm-text-muted)" }}>
                ACTIVE FINDINGS
              </p>
              <span className="text-xl font-black" style={{ color: "var(--rtm-text-primary)" }}>
                {activeFindings}
              </span>
            </div>

            <div
              className="rounded-lg border px-4 py-3 text-center"
              style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}
            >
              <p className="text-[10px] font-bold mb-1" style={{ color: "var(--rtm-text-muted)" }}>
                DISMISSED
              </p>
              <span className="text-xl font-black" style={{ color: "#64748B" }}>
                {activeDismissed}
              </span>
            </div>

            {result.pageSpeed && (
              <div
                className="rounded-lg border px-4 py-3 text-center"
                style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}
              >
                <p className="text-[10px] font-bold mb-1" style={{ color: "var(--rtm-text-muted)" }}>
                  MOBILE SPEED
                </p>
                <span
                  className="text-xl font-black"
                  style={{ color: pageSpeedColor(result.pageSpeed.mobileScore) }}
                >
                  {result.pageSpeed.mobileScore}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Core Web Vitals */}
        {result.pageSpeed && (
          <div
            className="rounded-xl border p-4"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
          >
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <p className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                Core Web Vitals
              </p>
              <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>
                via Google PageSpeed Insights
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                {
                  label: "Mobile Score",
                  value: String(result.pageSpeed.mobileScore),
                  color: pageSpeedColor(result.pageSpeed.mobileScore),
                },
                {
                  label: "Desktop Score",
                  value: String(result.pageSpeed.desktopScore),
                  color: pageSpeedColor(result.pageSpeed.desktopScore),
                },
                { label: "LCP", value: result.pageSpeed.lcp, color: "var(--rtm-text-primary)" },
                { label: "CLS", value: result.pageSpeed.cls, color: "var(--rtm-text-primary)" },
                { label: "TBT", value: result.pageSpeed.fid, color: "var(--rtm-text-primary)" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border px-3 py-2.5 text-center"
                  style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}
                >
                  <p
                    className="text-[10px] font-bold mb-1"
                    style={{ color: "var(--rtm-text-muted)" }}
                  >
                    {item.label.toUpperCase()}
                  </p>
                  <p
                    className="text-sm font-black"
                    style={{ color: item.color }}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Service sections */}
        {servicesWithFindings.length > 0 && !allServicesAllDismissed && (
          <div className="space-y-4">
            {servicesWithFindings.map((sr) => (
              <AiAuditServiceSection
                key={sr.serviceId}
                serviceResult={sr}
                dismissedFindingIds={dismissedFindingIds}
                onDismissFinding={handleDismissFinding}
              />
            ))}
          </div>
        )}

        {/* PageSpeed-only or standalone findings (not attached to a serviceResult) */}
        {(() => {
          const serviceResultFindingIds = new Set(
            result.serviceResults.flatMap((sr) => sr.findings.map((f) => f.id))
          );
          const standaloneFindingsVisible = result.allFindings
            .filter(
              (f) =>
                !serviceResultFindingIds.has(f.id) &&
                !dismissedFindingIds.includes(f.id)
            );
          if (standaloneFindingsVisible.length === 0) return null;
          return (
            <div
              className="rounded-xl border"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
            >
              <div className="px-6 py-4 border-b" style={{ borderColor: "var(--rtm-border)" }}>
                <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                  Additional Findings
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                  PageSpeed and performance findings outside the service categories above.
                </p>
              </div>
              <div className="p-5 space-y-3">
                {standaloneFindingsVisible.map((f) => {
                  const severityColors: Record<string, { bg: string; color: string; border: string }> = {
                    critical: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
                    high:     { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" },
                    medium:   { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
                    low:      { bg: "#F0FDF4", color: "#15803D", border: "#BBF7D0" },
                  };
                  const sc = severityColors[f.severity] ?? severityColors.medium;
                  return (
                    <div
                      key={f.id}
                      className="rounded-lg border p-4 space-y-2"
                      style={{ background: sc.bg, borderColor: sc.border }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold" style={{ color: sc.color }}>
                          {f.title}
                        </p>
                        <span
                          className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize"
                          style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}
                        >
                          {f.severity}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: sc.color, opacity: 0.85 }}>
                        {f.description}
                      </p>
                      {f.recommendation && (
                        <p className="text-xs font-semibold" style={{ color: sc.color }}>
                          → {f.recommendation}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDismissFinding(f.id)}
                        className="text-[11px] font-bold px-3 py-1 rounded-lg border transition-all hover:opacity-80"
                        style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border)" }}
                      >
                        Dismiss
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* "No issues" message — only shown when score is genuinely good AND all findings dismissed/absent */}
        {(servicesWithFindings.length === 0 || allServicesAllDismissed) && (() => {
          // Only show the optimized message when score is actually good (≥71).
          // Score=0 means parse failure or error — show an honest status instead.
          if (result.overallScore === 0) {
            return (
              <div
                className="rounded-xl border p-6 text-center space-y-2"
                style={{ background: "#FFF7ED", borderColor: "#FED7AA" }}
              >
                <p className="text-sm font-semibold" style={{ color: "#C2410C" }}>
                  AI analysis returned no scored service results.
                </p>
                <p className="text-xs" style={{ color: "#92400E" }}>
                  The AI response may be incomplete. Check PageSpeed findings above, or use
                  Intake Audit for findings derived from intake data.
                </p>
              </div>
            );
          }
          if (result.overallScore < 71) {
            // Score is poor/fair but no service-level findings — still findings exist from PageSpeed etc.
            // Show a neutral note rather than "well optimized"
            return (
              <div
                className="rounded-xl border p-6 text-center space-y-2"
                style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}
              >
                <p className="text-sm font-semibold" style={{ color: "#D97706" }}>
                  AI found a score of {result.overallScore} — review findings above for details.
                </p>
                <p className="text-xs" style={{ color: "#92400E" }}>
                  Proceed to recommendations to see service options based on this audit.
                </p>
              </div>
            );
          }
          return (
            <div
              className="rounded-xl border p-6 text-center space-y-2"
              style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}
            >
              <p className="text-sm font-semibold" style={{ color: "#15803D" }}>
                No significant issues found for this website. The site appears well-optimized.
              </p>
              <p className="text-xs" style={{ color: "#15803D", opacity: 0.8 }}>
                Proceed to recommendations to see available services based on intake data.
              </p>
            </div>
          );
        })()}
      </div>
    );
  }

  return null;
}
