"use client";

import React from "react";
import {
  computeHybridReadiness,
  applyReviewerAction,
  addCustomFinding,
  finalizeDepartmentReview,
} from "@/lib/sales/audit-engine";
import type {
  HybridAuditRequest,
  DepartmentReview,
  ReviewerFindingActionType,
} from "@/lib/sales/types";
import type { IntakeFinding } from "@/lib/sales/types";
import { DepartmentReviewCard } from "./DepartmentReviewCard";

interface HybridReviewPanelProps {
  request: HybridAuditRequest;
  currentUserDepartment?: string;
  onUpdateReview: (department: string, updatedReview: DepartmentReview) => void;
}

export function HybridReviewPanel({
  request,
  currentUserDepartment,
  onUpdateReview,
}: HybridReviewPanelProps) {
  const readiness = computeHybridReadiness(request);

  const progressPct =
    readiness.totalDepartments > 0
      ? Math.round((readiness.finalizedCount / readiness.totalDepartments) * 100)
      : 0;

  const progressColor = readiness.isFullyReviewed
    ? "#15803D"
    : readiness.finalizedCount > 0
    ? "#D97706"
    : "#1D4ED8";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="rounded-xl border p-5 space-y-4"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>
              Hybrid Audit Review
            </p>
            <p className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>
              {request.clientName}
            </p>
            <p className="text-sm mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
              Requested by {request.requestedBy} on {new Date(request.requestedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p
              className="text-sm font-bold"
              style={{ color: progressColor }}
            >
              {readiness.statusLabel}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
              {readiness.finalizedCount} of {readiness.totalDepartments} departments finalized
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>
              Review Progress
            </span>
            <span className="text-[10px] font-bold" style={{ color: progressColor }}>
              {progressPct}%
            </span>
          </div>
          <div
            className="rounded-full h-2 overflow-hidden"
            style={{ background: "var(--rtm-border)" }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progressPct}%`, background: progressColor }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Departments", value: readiness.totalDepartments, color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
            { label: "Finalized", value: readiness.finalizedCount, color: "#15803D", bg: "#F0FDF4", border: "#BBF7D0" },
            { label: "Pending", value: readiness.pendingCount, color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border px-3 py-2 text-center"
              style={{ background: stat.bg, borderColor: stat.border }}
            >
              <p className="text-xl font-black" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-[10px] font-semibold" style={{ color: stat.color }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {readiness.overdueCount > 0 && (
          <div
            className="rounded-lg border px-4 py-2"
            style={{ background: "#FEF2F2", borderColor: "#FECACA" }}
          >
            <p className="text-xs font-semibold" style={{ color: "#DC2626" }}>
              {readiness.overdueCount} department review{readiness.overdueCount !== 1 ? "s are" : " is"} past the 24-hour SLA deadline.
            </p>
          </div>
        )}
      </div>

      {/* Department review cards */}
      {request.departmentReviews.map((review) => {
        const isEditable =
          !!currentUserDepartment &&
          currentUserDepartment === review.department &&
          review.status !== "finalized";

        function handleApplyAction(
          findingId: string,
          actionType: ReviewerFindingActionType,
          note: string,
          updates?: { severity?: string; description?: string; recommendation?: string }
        ) {
          const updated = applyReviewerAction(
            review,
            findingId,
            actionType,
            note,
            currentUserDepartment ?? "Reviewer",
            updates
          );
          onUpdateReview(review.department, updated);
        }

        function handleAddFinding(finding: IntakeFinding) {
          const updated = addCustomFinding(
            review,
            finding,
            currentUserDepartment ?? "Reviewer"
          );
          onUpdateReview(review.department, updated);
        }

        function handleFinalize() {
          const updated = finalizeDepartmentReview(
            review,
            currentUserDepartment ?? "Reviewer"
          );
          onUpdateReview(review.department, updated);
        }

        return (
          <DepartmentReviewCard
            key={review.department}
            review={review}
            editable={isEditable}
            onApplyAction={handleApplyAction}
            onAddFinding={handleAddFinding}
            onFinalize={handleFinalize}
          />
        );
      })}
    </div>
  );
}
