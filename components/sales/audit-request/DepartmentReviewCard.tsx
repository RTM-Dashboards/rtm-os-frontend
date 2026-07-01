"use client";

import React, { useState } from "react";
import { AUDIT_REQUEST_STATUS_COLORS } from "@/lib/sales/audit-config";
import type {
  DepartmentReview,
  ReviewerFindingActionType,
} from "@/lib/sales/types";
import type { IntakeFinding } from "@/lib/sales/types";
import { AuditRequestStatusBadge } from "./AuditRequestStatusBadge";

interface DepartmentReviewCardProps {
  review: DepartmentReview;
  editable: boolean;
  onApplyAction: (
    findingId: string,
    actionType: ReviewerFindingActionType,
    note: string,
    updates?: { severity?: string; description?: string; recommendation?: string }
  ) => void;
  onAddFinding: (finding: IntakeFinding) => void;
  onFinalize: () => void;
}

const SEVERITY_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  critical: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  high:     { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" },
  medium:   { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
  low:      { bg: "#F0FDF4", color: "#15803D", border: "#BBF7D0" },
};

function formatSla(iso: string): { label: string; overdue: boolean } {
  const now = Date.now();
  const due = new Date(iso).getTime();
  const diff = due - now;
  const overdue = diff < 0;
  const abs = Math.abs(diff);
  const hours = Math.floor(abs / 3600000);
  const minutes = Math.floor((abs % 3600000) / 60000);
  const label = overdue
    ? `Overdue by ${hours}h ${minutes}m`
    : `Due in ${hours}h ${minutes}m`;
  return { label, overdue };
}

type ActionPanelMode = "accept" | "modify" | "override" | null;

interface FindingActionPanelProps {
  finding: IntakeFinding;
  existingAction?: { actionType: ReviewerFindingActionType; actionedBy: string } | null;
  onApply: (
    actionType: ReviewerFindingActionType,
    note: string,
    updates?: { severity?: string; description?: string; recommendation?: string }
  ) => void;
}

function FindingActionPanel({ finding, existingAction, onApply }: FindingActionPanelProps) {
  const [mode, setMode] = useState<ActionPanelMode>(null);
  const [note, setNote] = useState("");
  const [severity, setSeverity] = useState(finding.severity);
  const [description, setDescription] = useState(finding.description);
  const [recommendation, setRecommendation] = useState(finding.recommendation);

  const sev = SEVERITY_COLORS[finding.severity] ?? SEVERITY_COLORS.medium;

  function handleApply(actionType: ReviewerFindingActionType) {
    const updates =
      actionType === "accepted"
        ? undefined
        : { severity, description, recommendation };
    onApply(actionType, note, updates);
    setMode(null);
    setNote("");
  }

  if (existingAction) {
    const actionColors: Record<ReviewerFindingActionType, string> = {
      accepted: "#15803D",
      modified: "#D97706",
      overridden: "#DC2626",
      added: "#1D4ED8",
    };
    return (
      <span
        className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border"
        style={{
          background: "#F0FDF4",
          color: actionColors[existingAction.actionType] ?? "#6B7280",
          borderColor: "#BBF7D0",
        }}
      >
        {existingAction.actionType.charAt(0).toUpperCase() + existingAction.actionType.slice(1)} by {existingAction.actionedBy}
      </span>
    );
  }

  return (
    <div className="space-y-2">
      {mode === null && (
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => { setMode("accept"); handleApply("accepted"); }}
            className="text-[11px] font-bold px-3 py-1 rounded-lg border transition-all hover:opacity-80"
            style={{ background: "#F0FDF4", color: "#15803D", borderColor: "#BBF7D0" }}
          >
            Accept
          </button>
          <button
            type="button"
            onClick={() => setMode("modify")}
            className="text-[11px] font-bold px-3 py-1 rounded-lg border transition-all hover:opacity-80"
            style={{ background: "#FFFBEB", color: "#D97706", borderColor: "#FDE68A" }}
          >
            Modify
          </button>
          <button
            type="button"
            onClick={() => setMode("override")}
            className="text-[11px] font-bold px-3 py-1 rounded-lg border transition-all hover:opacity-80"
            style={{ background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" }}
          >
            Override
          </button>
        </div>
      )}

      {(mode === "modify" || mode === "override") && (
        <div
          className="rounded-lg border p-3 space-y-3"
          style={{ background: "var(--rtm-bg)", borderColor: sev.border }}
        >
          <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>
            {mode === "modify" ? "Modify Finding" : "Override Finding"}
          </p>
          <div>
            <label className="block text-[10px] font-semibold mb-1" style={{ color: "var(--rtm-text-muted)" }}>Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as IntakeFinding["severity"])}
              className="text-xs rounded border px-2 py-1 focus:outline-none"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
            >
              {["critical", "high", "medium", "low"].map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold mb-1" style={{ color: "var(--rtm-text-muted)" }}>Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs rounded border px-2 py-1 resize-none focus:outline-none"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold mb-1" style={{ color: "var(--rtm-text-muted)" }}>Recommendation</label>
            <textarea
              rows={2}
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              className="w-full text-xs rounded border px-2 py-1 resize-none focus:outline-none"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold mb-1" style={{ color: "var(--rtm-text-muted)" }}>Reviewer Note</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note..."
              className="w-full text-xs rounded border px-2 py-1 focus:outline-none"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleApply(mode === "modify" ? "modified" : "overridden")}
              className="text-[11px] font-bold px-3 py-1 rounded-lg border"
              style={{ background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" }}
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => setMode(null)}
              className="text-[11px] font-bold px-3 py-1 rounded-lg border"
              style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function DepartmentReviewCard({
  review,
  editable,
  onApplyAction,
  onAddFinding,
  onFinalize,
}: DepartmentReviewCardProps) {
  const { label: slaLabel, overdue } = formatSla(review.slaDeadline);
  const [showAddFinding, setShowAddFinding] = useState(false);
  const [newFindingTitle, setNewFindingTitle] = useState("");
  const [newFindingDescription, setNewFindingDescription] = useState("");
  const [newFindingRecommendation, setNewFindingRecommendation] = useState("");
  const [newFindingSeverity, setNewFindingSeverity] = useState<IntakeFinding["severity"]>("medium");

  const actedFindingIds = new Set(review.reviewerActions.map((a) => a.findingId));
  const hasAnyAction =
    review.reviewerActions.length > 0 || review.addedFindings.length > 0;

  const deptColors = AUDIT_REQUEST_STATUS_COLORS[review.status] ?? {
    bg: "var(--rtm-surface)",
    color: "var(--rtm-text-primary)",
    border: "var(--rtm-border)",
  };

  function handleAddFinding() {
    if (!newFindingTitle.trim()) return;
    const finding: IntakeFinding = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      category: review.department,
      severity: newFindingSeverity,
      title: newFindingTitle.trim(),
      description: newFindingDescription.trim() || `Custom finding added by reviewer.`,
      recommendation: newFindingRecommendation.trim() || `Address ${newFindingTitle.trim()}.`,
      source: "manual",
    };
    onAddFinding(finding);
    setNewFindingTitle("");
    setNewFindingDescription("");
    setNewFindingRecommendation("");
    setNewFindingSeverity("medium");
    setShowAddFinding(false);
  }

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: deptColors.border }}
    >
      {/* Card header */}
      <div
        className="px-5 py-4 flex items-start justify-between gap-3 flex-wrap"
        style={{ background: deptColors.bg, borderBottom: `1px solid ${deptColors.border}` }}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
              {review.department}
            </p>
            <AuditRequestStatusBadge status={review.status} />
          </div>
          {review.assignedReviewer && (
            <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
              Assigned to: <span className="font-semibold">{review.assignedReviewer}</span>
            </p>
          )}
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
            style={{
              background: overdue ? "#FEF2F2" : "#EFF6FF",
              color: overdue ? "#DC2626" : "#1D4ED8",
              borderColor: overdue ? "#FECACA" : "#BFDBFE",
            }}
          >
            SLA: {slaLabel}
          </span>
        </div>
        {!editable && review.assignedReviewer && (
          <p className="text-xs italic" style={{ color: "var(--rtm-text-muted)" }}>
            Assigned to {review.assignedReviewer} — awaiting their review
          </p>
        )}
      </div>

      {/* Findings list */}
      <div className="p-5 space-y-4">
        {review.aiFindings.length === 0 && (
          <p className="text-xs text-center py-4" style={{ color: "var(--rtm-text-muted)" }}>
            No AI findings for this department.
          </p>
        )}

        {review.aiFindings.map((finding) => {
          const sev = SEVERITY_COLORS[finding.severity] ?? SEVERITY_COLORS.medium;
          const existingAction = review.reviewerActions.find((a) => a.findingId === finding.id);

          return (
            <div
              key={finding.id}
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: sev.border }}
            >
              <div
                className="px-4 py-3 flex items-center gap-2 flex-wrap"
                style={{ background: sev.bg, borderBottom: `1px solid ${sev.border}` }}
              >
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize"
                  style={{ background: sev.bg, color: sev.color, borderColor: sev.border }}
                >
                  {finding.severity}
                </span>
                <p className="text-sm font-semibold flex-1" style={{ color: "var(--rtm-text-primary)" }}>
                  {finding.title}
                </p>
                {actedFindingIds.has(finding.id) && existingAction && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                    style={{ background: "#F0FDF4", color: "#15803D", borderColor: "#BBF7D0" }}
                  >
                    {existingAction.actionType} by {existingAction.actionedBy}
                  </span>
                )}
              </div>
              <div
                className="p-4 space-y-3"
                style={{ background: "var(--rtm-bg)" }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>
                      Description
                    </p>
                    <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                      {finding.description}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>
                      Recommendation
                    </p>
                    <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                      {finding.recommendation}
                    </p>
                  </div>
                </div>

                {editable && !actedFindingIds.has(finding.id) && (
                  <FindingActionPanel
                    finding={finding}
                    existingAction={null}
                    onApply={(actionType, note, updates) =>
                      onApplyAction(finding.id, actionType, note, updates)
                    }
                  />
                )}
              </div>
            </div>
          );
        })}

        {/* Added findings */}
        {review.addedFindings.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: "#1D4ED8" }}>
              Added by Reviewer ({review.addedFindings.length})
            </p>
            {review.addedFindings.map((f) => {
              const sev = SEVERITY_COLORS[f.severity] ?? SEVERITY_COLORS.medium;
              return (
                <div
                  key={f.id}
                  className="rounded-xl border p-3 mb-2"
                  style={{ borderColor: sev.border, background: sev.bg }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize"
                      style={{ background: sev.bg, color: sev.color, borderColor: sev.border }}
                    >
                      {f.severity}
                    </span>
                    <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{f.title}</p>
                    <span className="text-[10px] ml-auto" style={{ color: "#1D4ED8" }}>Reviewer Added</span>
                  </div>
                  <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{f.description}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Add finding form */}
        {editable && (
          <div>
            {!showAddFinding ? (
              <button
                type="button"
                onClick={() => setShowAddFinding(true)}
                className="text-xs font-bold px-3 py-2 rounded-lg border transition-all hover:opacity-80"
                style={{ background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" }}
              >
                Add Custom Finding
              </button>
            ) : (
              <div
                className="rounded-xl border p-4 space-y-3"
                style={{ background: "var(--rtm-surface)", borderColor: "#BFDBFE" }}
              >
                <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#1D4ED8" }}>
                  Add Custom Finding
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-semibold mb-1" style={{ color: "var(--rtm-text-muted)" }}>Title</label>
                    <input
                      type="text"
                      value={newFindingTitle}
                      onChange={(e) => setNewFindingTitle(e.target.value)}
                      placeholder="Finding title..."
                      className="w-full text-xs rounded border px-2 py-1 focus:outline-none"
                      style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold mb-1" style={{ color: "var(--rtm-text-muted)" }}>Severity</label>
                    <select
                      value={newFindingSeverity}
                      onChange={(e) => setNewFindingSeverity(e.target.value as IntakeFinding["severity"])}
                      className="text-xs rounded border px-2 py-1 focus:outline-none"
                      style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
                    >
                      {["critical", "high", "medium", "low"].map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-semibold mb-1" style={{ color: "var(--rtm-text-muted)" }}>Description</label>
                    <textarea
                      rows={2}
                      value={newFindingDescription}
                      onChange={(e) => setNewFindingDescription(e.target.value)}
                      className="w-full text-xs rounded border px-2 py-1 resize-none focus:outline-none"
                      style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-semibold mb-1" style={{ color: "var(--rtm-text-muted)" }}>Recommendation</label>
                    <textarea
                      rows={2}
                      value={newFindingRecommendation}
                      onChange={(e) => setNewFindingRecommendation(e.target.value)}
                      className="w-full text-xs rounded border px-2 py-1 resize-none focus:outline-none"
                      style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddFinding}
                    disabled={!newFindingTitle.trim()}
                    className="text-[11px] font-bold px-3 py-1 rounded-lg border disabled:opacity-40"
                    style={{ background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" }}
                  >
                    Add Finding
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddFinding(false)}
                    className="text-[11px] font-bold px-3 py-1 rounded-lg border"
                    style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border)" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Finalize button */}
        {editable && review.status !== "finalized" && (
          <div className="pt-2 border-t" style={{ borderColor: "var(--rtm-border)" }}>
            <button
              type="button"
              onClick={onFinalize}
              disabled={!hasAnyAction}
              className="px-5 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "#059669" }}
            >
              Finalize Review
            </button>
            {!hasAnyAction && (
              <p className="text-[10px] mt-1" style={{ color: "var(--rtm-text-muted)" }}>
                Accept, modify, override, or add at least one finding to finalize.
              </p>
            )}
          </div>
        )}

        {review.status === "finalized" && (
          <div
            className="rounded-xl border px-4 py-3"
            style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}
          >
            <p className="text-xs font-bold" style={{ color: "#15803D" }}>
              Review finalized by {review.finalizedBy} on {new Date(review.finalizedAt!).toLocaleDateString()}.
              {review.finalizedFindings && ` ${review.finalizedFindings.length} finding${review.finalizedFindings.length !== 1 ? "s" : ""} in final report.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
