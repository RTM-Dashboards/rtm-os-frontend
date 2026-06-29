"use client";

import React from "react";
import type { HandoffChecklistEntry } from "@/lib/sales/handoff-engine";
import type { HandoffChecklistItemId, HandoffChecklistItemStatus } from "@/lib/sales/handoff-config";
import { HANDOFF_CHECKLIST, HANDOFF_STATUS_COLORS } from "@/lib/sales/handoff-config";
import { isItemBlocked } from "@/lib/sales/handoff-engine";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HandoffChecklistProps {
  checklist: HandoffChecklistEntry[];
  onUpdate: (
    itemId: HandoffChecklistItemId,
    status: HandoffChecklistItemStatus,
    completedBy?: string
  ) => void;
}

// ─── Status Indicator ─────────────────────────────────────────────────────────

function StatusIndicator({ status }: { status: HandoffChecklistItemStatus }) {
  const styles: Record<HandoffChecklistItemStatus, { bg: string; color: string; border: string; label: string }> = {
    pending: {
      bg: "#F8FAFC",
      color: "#64748B",
      border: "#E2E8F0",
      label: "Pending",
    },
    complete: {
      bg: "#ECFDF5",
      color: "#059669",
      border: "#A7F3D0",
      label: "Complete",
    },
    blocked: {
      bg: "#FEF2F2",
      color: "#DC2626",
      border: "#FECACA",
      label: "Blocked",
    },
    "not-applicable": {
      bg: "#F8FAFC",
      color: "#94A3B8",
      border: "#E2E8F0",
      label: "N/A",
    },
  };

  const s = styles[status];
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: s.color }}
      />
      {s.label}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HandoffChecklist({ checklist, onUpdate }: HandoffChecklistProps) {
  const requiredCount = HANDOFF_CHECKLIST.filter((d) => d.required).length;
  const completedCount = checklist.filter((e) => e.status === "complete").length;

  return (
    <div className="space-y-3">
      {/* Header Summary */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-lg border"
        style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}
      >
        <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>
          Checklist Progress
        </p>
        <span className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>
          {completedCount} of {requiredCount} required items complete
        </span>
      </div>

      {/* Checklist Items */}
      <div className="space-y-2">
        {checklist.map((entry) => {
          const defItem = HANDOFF_CHECKLIST.find((d) => d.id === entry.id);
          const blocked = isItemBlocked(entry, checklist);
          const isComplete = entry.status === "complete";
          const isPending = entry.status === "pending";
          const canComplete = isPending && !blocked;

          return (
            <div
              key={entry.id}
              className="rounded-lg border transition-colors"
              style={{
                background: isComplete
                  ? "#F0FDF4"
                  : blocked
                  ? "#FEF9F9"
                  : "var(--rtm-surface)",
                borderColor: isComplete
                  ? "#A7F3D0"
                  : blocked
                  ? "#FECACA"
                  : "var(--rtm-border)",
              }}
            >
              <div className="flex items-start gap-3 px-4 py-3">
                {/* Order Badge */}
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
                  style={{
                    background: isComplete
                      ? "#059669"
                      : blocked
                      ? "#FEE2E2"
                      : "var(--rtm-bg)",
                    color: isComplete ? "#fff" : blocked ? "#DC2626" : "var(--rtm-text-muted)",
                    border: `1.5px solid ${
                      isComplete ? "#059669" : blocked ? "#FECACA" : "var(--rtm-border)"
                    }`,
                  }}
                >
                  {defItem?.order ?? ""}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p
                      className="text-xs font-semibold"
                      style={{ color: "var(--rtm-text-primary)" }}
                    >
                      {entry.label}
                    </p>
                    {defItem?.required && (
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                        style={{ background: "#EFF6FF", color: "var(--rtm-blue)" }}
                      >
                        Required
                      </span>
                    )}
                    <StatusIndicator status={blocked ? "blocked" : entry.status} />
                  </div>

                  <p className="text-[11px] mb-1" style={{ color: "var(--rtm-text-muted)" }}>
                    {defItem?.description}
                  </p>

                  {/* Blocked by indicator */}
                  {blocked && entry.blockedBy && entry.blockedBy.length > 0 && (
                    <div
                      className="flex items-start gap-1.5 mt-1.5 rounded px-2.5 py-1.5"
                      style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}
                    >
                      <span
                        className="text-[10px] font-bold flex-shrink-0"
                        style={{ color: "#DC2626" }}
                      >
                        Blocked by:
                      </span>
                      <span className="text-[10px]" style={{ color: "#991B1B" }}>
                        {entry.blockedBy
                          .map((depId) => {
                            const dep = checklist.find((e) => e.id === depId);
                            return dep ? dep.label : depId;
                          })
                          .join(", ")}
                      </span>
                    </div>
                  )}

                  {/* Completion metadata */}
                  {isComplete && (entry.completedBy || entry.completedAt) && (
                    <div className="flex items-center gap-3 mt-1.5">
                      {entry.completedBy && (
                        <span
                          className="text-[10px] font-semibold"
                          style={{ color: "#059669" }}
                        >
                          Completed by {entry.completedBy}
                        </span>
                      )}
                      {entry.completedAt && (
                        <span className="text-[10px]" style={{ color: "#6B7280" }}>
                          {new Date(entry.completedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}{" "}
                          {new Date(entry.completedAt).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Action */}
                <div className="flex-shrink-0 mt-0.5">
                  {canComplete && (
                    <button
                      onClick={() => onUpdate(entry.id, "complete")}
                      className="text-[11px] font-semibold px-3 py-1.5 rounded-lg border transition-opacity hover:opacity-80"
                      style={{
                        background: "var(--rtm-blue)",
                        color: "#fff",
                        borderColor: "var(--rtm-blue)",
                      }}
                    >
                      Mark Complete
                    </button>
                  )}
                  {blocked && (
                    <span
                      className="text-[10px] font-semibold px-2.5 py-1.5 rounded-lg"
                      style={{ background: "#FEE2E2", color: "#DC2626" }}
                    >
                      Blocked
                    </span>
                  )}
                  {isComplete && (
                    <span
                      className="text-[10px] font-semibold px-2.5 py-1.5 rounded-lg"
                      style={{ background: "#D1FAE5", color: "#065F46" }}
                    >
                      Done
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
