"use client";

import React, { useState } from "react";
import { MANUAL_SCORECARD_CATEGORIES } from "@/lib/sales/audit-config";
import type { ManualAuditRequest } from "@/lib/sales/types";

interface ManualAuditScorecardProps {
  request: ManualAuditRequest;
  onSubmit: (scorecard: Record<string, number>, notes: Record<string, string>) => void;
  readOnly?: boolean;
  onReopen?: () => void;
}

function formatDue(iso: string): { label: string; overdue: boolean } {
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

export function ManualAuditScorecard({
  request,
  onSubmit,
  readOnly = false,
  onReopen,
}: ManualAuditScorecardProps) {
  const categories = MANUAL_SCORECARD_CATEGORIES[request.department] ?? [];
  const [scorecard, setScorecard] = useState<Record<string, number>>(
    () => ({ ...request.scorecard })
  );
  const [notes, setNotes] = useState<Record<string, string>>(
    () => ({ ...request.scorecardNotes })
  );

  // Sync local form state when the request prop is replaced (e.g. after reopen).
  // This ensures previously submitted values pre-fill the editable form correctly.
  React.useEffect(() => {
    setScorecard({ ...request.scorecard });
    setNotes({ ...request.scorecardNotes });
  }, [request.id, request.status]);

  const { label: dueLabel, overdue } = formatDue(request.dueAt);

  function handleScore(catId: string, value: number) {
    setScorecard((prev) => ({ ...prev, [catId]: Math.max(0, Math.min(100, value)) }));
  }

  function handleNote(catId: string, value: string) {
    setNotes((prev) => ({ ...prev, [catId]: value }));
  }

  function handleSubmit() {
    onSubmit(scorecard, notes);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div
        className="rounded-xl border p-5"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>
          Manual Audit Scorecard
        </p>
        <p className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>
          {request.department}
        </p>
        <p className="text-sm mt-0.5" style={{ color: "var(--rtm-text-secondary)" }}>
          Client: {request.clientName}
        </p>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full border"
            style={{
              background: overdue ? "#FEF2F2" : "#EFF6FF",
              color: overdue ? "#DC2626" : "#1D4ED8",
              borderColor: overdue ? "#FECACA" : "#BFDBFE",
            }}
          >
            {dueLabel}
          </span>
          {request.assignedReviewer && (
            <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
              Assigned to: <span className="font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>{request.assignedReviewer}</span>
            </span>
          )}
          {readOnly && request.status === "finalized" && onReopen && (
            <button
              type="button"
              onClick={onReopen}
              className="text-xs font-bold px-3 py-1 rounded-lg border transition-all hover:opacity-80"
              style={{ background: "#FFF7ED", color: "#C2410C", borderColor: "#FED7AA" }}
            >
              Reopen for Revision
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {categories.map((cat) => {
          const score = scorecard[cat.id] ?? 0;
          const scoreColor =
            score >= 80 ? "#15803D" : score >= 60 ? "#D97706" : "#DC2626";
          const scoreBg =
            score >= 80 ? "#F0FDF4" : score >= 60 ? "#FFFBEB" : "#FEF2F2";

          return (
            <div
              key={cat.id}
              className="rounded-xl border p-4 space-y-3"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                    {cat.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                    {cat.description}
                  </p>
                </div>
                <div
                  className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center border-4 font-black text-sm"
                  style={{ borderColor: scoreColor, color: scoreColor, background: scoreBg }}
                >
                  {score}
                </div>
              </div>

              {readOnly ? (
                <div
                  className="rounded-lg border px-3 py-2"
                  style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>
                    Score
                  </p>
                  <p className="text-sm font-bold" style={{ color: scoreColor }}>
                    {score} / {cat.maxScore}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <label
                      className="text-[10px] font-bold uppercase tracking-wide flex-shrink-0"
                      style={{ color: "var(--rtm-text-muted)" }}
                    >
                      Score (0–{cat.maxScore})
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={cat.maxScore}
                      step={5}
                      value={score}
                      onChange={(e) => handleScore(cat.id, parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      min={0}
                      max={cat.maxScore}
                      value={score}
                      onChange={(e) => handleScore(cat.id, parseInt(e.target.value) || 0)}
                      className="w-16 text-sm font-bold rounded-lg border px-2 py-1 text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                      style={{
                        background: "var(--rtm-bg)",
                        borderColor: "var(--rtm-border)",
                        color: scoreColor,
                      }}
                    />
                  </div>
                </div>
              )}

              {readOnly ? (
                notes[cat.id] ? (
                  <div
                    className="rounded-lg border px-3 py-2"
                    style={{ background: "#F0F9FF", borderColor: "#BAE6FD" }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "#0369A1" }}>
                      Reviewer Notes
                    </p>
                    <p className="text-xs" style={{ color: "#0369A1" }}>
                      {notes[cat.id]}
                    </p>
                  </div>
                ) : null
              ) : (
                <div>
                  <label
                    className="block text-[10px] font-bold uppercase tracking-wide mb-1"
                    style={{ color: "var(--rtm-text-muted)" }}
                  >
                    Notes (optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes[cat.id] ?? ""}
                    onChange={(e) => handleNote(cat.id, e.target.value)}
                    placeholder={`Observations about ${cat.label.toLowerCase()}...`}
                    className="w-full text-xs rounded-lg border px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                    style={{
                      background: "var(--rtm-bg)",
                      borderColor: "var(--rtm-border)",
                      color: "var(--rtm-text-primary)",
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit */}
      {!readOnly && (
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
          style={{ background: "#059669" }}
        >
          Submit Scorecard
        </button>
      )}

      {readOnly && request.completedAt && (
        <div
          className="rounded-xl border px-4 py-3 text-center"
          style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}
        >
          <p className="text-xs font-semibold" style={{ color: "#15803D" }}>
            Scorecard submitted on {new Date(request.completedAt).toLocaleDateString()}.
          </p>
        </div>
      )}
    </div>
  );
}
