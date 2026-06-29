"use client";

import React, { useState, useEffect, useRef } from "react";
import { generateRecommendationsFromAudit } from "@/lib/sales/recommendation-engine";
import { RECOMMENDATION_GROUP_CONFIG } from "@/lib/sales/recommendation-config";
import type { RecommendationItem, RecommendationResult } from "@/lib/sales/recommendation-engine";
import type { ProposalWizardState } from "../ProposalWizard";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Step3RecommendationsProps {
  state: ProposalWizardState;
  onUpdate: (updates: Partial<ProposalWizardState>) => void;
}

// ─── Recommendation status for the wizard ─────────────────────────────────────

type WizardRecStatus = "pending" | "approved" | "future-phase" | "optional" | "removed";

// ─── Priority badge ───────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, { bg: string; color: string; border: string }> = {
    Critical: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
    High: { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" },
    Medium: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
    Low: { bg: "#F0FDF4", color: "#15803D", border: "#BBF7D0" },
  };
  const s = styles[priority] ?? styles.Low;
  return (
    <span
      className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
    >
      {priority}
    </span>
  );
}

// ─── Recommendation card ──────────────────────────────────────────────────────

function RecommendationCard({
  rec,
  status,
  onApprove,
  onFuturePhase,
  onOptional,
  onRemove,
}: {
  rec: RecommendationItem;
  status: WizardRecStatus;
  onApprove: () => void;
  onFuturePhase: () => void;
  onOptional: () => void;
  onRemove: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isApproved = status === "approved";
  const isRemoved = status === "removed";

  const statusStyles: Record<WizardRecStatus, { bg: string; color: string; border: string }> = {
    approved: { bg: "#F0FDF4", color: "#15803D", border: "#BBF7D0" },
    "future-phase": { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
    optional: { bg: "#F5F3FF", color: "#6D28D9", border: "#DDD6FE" },
    removed: { bg: "#F9FAFB", color: "#9CA3AF", border: "#E5E7EB" },
    pending: { bg: "var(--rtm-surface)", color: "var(--rtm-text-primary)", border: "var(--rtm-border)" },
  };

  const ss = statusStyles[status];

  return (
    <div
      className="rounded-xl border transition-all"
      style={{
        background: ss.bg,
        borderColor: ss.border,
        opacity: isRemoved ? 0.5 : 1,
      }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-2 mb-2">
              <p
                className="text-sm font-bold"
                style={{ color: isRemoved ? "#9CA3AF" : ss.color }}
              >
                {rec.serviceName}
              </p>
              <PriorityBadge priority={rec.priority} />
              {isApproved && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                  style={{ background: "#F0FDF4", color: "#15803D", borderColor: "#BBF7D0" }}
                >
                  Approved
                </span>
              )}
              {status === "future-phase" && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                  style={{ background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" }}
                >
                  Future Phase
                </span>
              )}
              {status === "optional" && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                  style={{ background: "#F5F3FF", color: "#6D28D9", borderColor: "#DDD6FE" }}
                >
                  Optional
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              <div>
                <p className="text-[10px] font-bold" style={{ color: "var(--rtm-text-muted)" }}>
                  DEPARTMENT
                </p>
                <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>
                  {rec.department}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold" style={{ color: "var(--rtm-text-muted)" }}>
                  MONTHLY FEE
                </p>
                <p className="text-sm font-bold" style={{ color: "#1D4ED8" }}>
                  {rec.estimatedMonthlyFee > 0
                    ? `$${rec.estimatedMonthlyFee.toLocaleString()}/mo`
                    : "Included"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold" style={{ color: "var(--rtm-text-muted)" }}>
                  SETUP FEE
                </p>
                <p className="text-sm font-bold" style={{ color: "#C2410C" }}>
                  {rec.estimatedSetupFee > 0
                    ? `$${rec.estimatedSetupFee.toLocaleString()}`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold" style={{ color: "var(--rtm-text-muted)" }}>
                  CONFIDENCE
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div
                    className="flex-1 rounded-full h-1.5"
                    style={{ background: "#E5E7EB" }}
                  >
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${rec.confidenceScore}%`,
                        background:
                          rec.confidenceScore >= 90
                            ? "#059669"
                            : rec.confidenceScore >= 75
                            ? "#D97706"
                            : "#DC2626",
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: "var(--rtm-text-muted)" }}>
                    {rec.confidenceScore}%
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
              {rec.businessImpact}
            </p>
          </div>

          {/* Action menu */}
          <div className="relative flex-shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((p) => !p)}
              className="px-2 py-1 rounded-lg border text-xs font-bold transition-all hover:opacity-80"
              style={{
                background: "var(--rtm-surface)",
                borderColor: "var(--rtm-border)",
                color: "var(--rtm-text-secondary)",
              }}
            >
              Actions
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-1 rounded-xl border shadow-lg z-20 overflow-hidden min-w-[180px]"
                style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
              >
                {[
                  { label: "Approve for Proposal", action: onApprove, color: "#15803D" },
                  { label: "Mark as Future Phase", action: onFuturePhase, color: "#1D4ED8" },
                  { label: "Mark as Optional", action: onOptional, color: "#6D28D9" },
                  { label: "Remove", action: onRemove, color: "#DC2626" },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      item.action();
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors hover:bg-gray-50"
                    style={{ color: item.color }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Step3Recommendations({ state, onUpdate }: Step3RecommendationsProps) {
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [recStatuses, setRecStatuses] = useState<Record<string, WizardRecStatus>>({});
  const generated = useRef(false);

  // Generate recommendations when audit result is available
  useEffect(() => {
    if (state.auditResult && !generated.current) {
      generated.current = true;
      setLoading(true);
      // Slight delay for UX
      setTimeout(() => {
        const r = generateRecommendationsFromAudit(state.auditResult!);
        setResult(r);

        // Initialize statuses: pre-approve "Ready for Proposal" items
        const statuses: Record<string, WizardRecStatus> = {};
        r.recommendations.forEach((rec) => {
          statuses[rec.id] =
            rec.proposalReadiness === "Ready for Proposal" ? "approved" : "pending";
        });
        setRecStatuses(statuses);

        // Sync approved recommendations to wizard state
        const approved = r.recommendations
          .filter((rec) => statuses[rec.id] === "approved")
          .map((rec) => rec.id);
        onUpdate({ approvedRecommendations: approved });

        setLoading(false);
      }, 600);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.auditResult]);

  function setRecStatus(recId: string, status: WizardRecStatus) {
    const updated = { ...recStatuses, [recId]: status };
    setRecStatuses(updated);

    if (!result) return;
    const approved = result.recommendations
      .filter((r) => updated[r.id] === "approved")
      .map((r) => r.id);
    onUpdate({ approvedRecommendations: approved });
  }

  if (!state.auditResult) {
    return (
      <div
        className="rounded-xl border px-6 py-12 text-center"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-muted)" }}>
          Complete Step 2 (Audit) to generate recommendations.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className="rounded-xl border px-6 py-12 text-center"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-muted)" }}>
          Generating recommendations from audit results…
        </p>
      </div>
    );
  }

  if (!result || result.recommendations.length === 0) {
    return (
      <div
        className="rounded-xl border px-6 py-12 text-center"
        style={{ background: "#FFF7ED", borderColor: "#FED7AA" }}
      >
        <p className="text-sm font-semibold" style={{ color: "#C2410C" }}>
          No recommendations generated. The audit may not have enough findings to trigger recommendation rules.
        </p>
      </div>
    );
  }

  const approvedIds = state.approvedRecommendations;
  const approvedRecs = result.recommendations.filter((r) => approvedIds.includes(r.id));
  const totalMonthly = approvedRecs.reduce((s, r) => s + r.estimatedMonthlyFee, 0);
  const totalSetup = approvedRecs.reduce((s, r) => s + r.estimatedSetupFee, 0);

  // Group recommendations
  const activeGroups = RECOMMENDATION_GROUP_CONFIG
    .sort((a, b) => a.order - b.order)
    .map((gc) => ({
      ...gc,
      items: result.recommendations.filter((r) => r.group === gc.key),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      {/* Audit context bar */}
      <div
        className="rounded-xl border p-4 flex flex-wrap items-center gap-4"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>
            Based on Audit
          </p>
          <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
            Score: {result.auditScore} ({result.auditScoringLabel}) · {result.totalAuditFindings} findings · {result.criticalAuditFindings} critical
          </p>
        </div>
        <div className="ml-auto">
          <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>
            Total Recommendations
          </p>
          <p className="text-sm font-semibold" style={{ color: "#1D4ED8" }}>
            {result.recommendations.length} services identified
          </p>
        </div>
      </div>

      {/* Grouped recommendations */}
      {activeGroups.map((group) => (
        <div
          key={group.key}
          className="rounded-xl border"
          style={{ background: "var(--rtm-surface)", borderColor: group.border }}
        >
          <div
            className="px-5 py-3 border-b flex items-center gap-3"
            style={{ background: group.bg, borderColor: group.border }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: group.color }}
            />
            <div>
              <p className="text-sm font-bold" style={{ color: group.color }}>
                {group.label}
              </p>
              <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                {group.description}
              </p>
            </div>
            <span
              className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border"
              style={{ background: group.bg, color: group.color, borderColor: group.border }}
            >
              {group.items.length}
            </span>
          </div>
          <div className="p-4 space-y-3">
            {group.items.map((rec) => (
              <RecommendationCard
                key={rec.id}
                rec={rec}
                status={recStatuses[rec.id] ?? "pending"}
                onApprove={() => setRecStatus(rec.id, "approved")}
                onFuturePhase={() => setRecStatus(rec.id, "future-phase")}
                onOptional={() => setRecStatus(rec.id, "optional")}
                onRemove={() => setRecStatus(rec.id, "removed")}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Summary bar */}
      <div
        className="rounded-xl border p-4 sticky bottom-4"
        style={{
          background: approvedIds.length > 0 ? "#F0FDF4" : "#FFF7ED",
          borderColor: approvedIds.length > 0 ? "#BBF7D0" : "#FED7AA",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-[10px] font-bold" style={{ color: "var(--rtm-text-muted)" }}>
                APPROVED
              </p>
              <p
                className="text-lg font-black"
                style={{ color: approvedIds.length > 0 ? "#15803D" : "#C2410C" }}
              >
                {approvedIds.length} service{approvedIds.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold" style={{ color: "var(--rtm-text-muted)" }}>
                MONTHLY REVENUE
              </p>
              <p className="text-lg font-black" style={{ color: "#1D4ED8" }}>
                ${totalMonthly.toLocaleString()}/mo
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold" style={{ color: "var(--rtm-text-muted)" }}>
                SETUP FEES
              </p>
              <p className="text-lg font-black" style={{ color: "#C2410C" }}>
                ${totalSetup.toLocaleString()}
              </p>
            </div>
          </div>
          {approvedIds.length === 0 && (
            <p className="text-xs font-semibold" style={{ color: "#C2410C" }}>
              At least one approved recommendation is required to continue.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
