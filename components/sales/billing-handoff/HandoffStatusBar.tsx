"use client";

import React from "react";
import Link from "next/link";
import ProgressBar from "@/components/ui/ProgressBar";
import type { HandoffRecord } from "@/lib/sales/handoff-engine";
import {
  HANDOFF_STATUS_LABELS,
  HANDOFF_STATUS_COLORS,
  HANDOFF_CHECKLIST,
} from "@/lib/sales/handoff-config";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HandoffStatusBarProps {
  record: HandoffRecord;
  onSubmit: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HandoffStatusBar({ record, onSubmit }: HandoffStatusBarProps) {
  const statusLabel = HANDOFF_STATUS_LABELS[record.status];
  const statusColor = HANDOFF_STATUS_COLORS[record.status];

  const totalRequired = HANDOFF_CHECKLIST.filter((d) => d.required).length;
  const completedRequired = record.checklist.filter(
    (e) => e.status === "complete" && HANDOFF_CHECKLIST.find((d) => d.id === e.id)?.required
  ).length;

  const progressColor =
    record.completionPercentage === 100
      ? "#059669"
      : record.completionPercentage >= 50
      ? "var(--rtm-blue)"
      : "#F59E0B";

  return (
    <div
      className="rounded-xl border overflow-hidden sticky top-4"
      style={{
        background: "var(--rtm-surface)",
        borderColor: "var(--rtm-border)",
        minWidth: 260,
        maxWidth: 300,
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b"
        style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}
      >
        <p
          className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
          style={{ color: "var(--rtm-text-muted)" }}
        >
          Handoff Status
        </p>
        <p className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>
          {record.handoffNumber}
        </p>
      </div>

      <div className="p-4 space-y-5">
        {/* Status Badge */}
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-wide mb-1.5"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            Current Status
          </p>
          <span
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border"
            style={{
              background: statusColor.bg,
              color: statusColor.color,
              borderColor: statusColor.border,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: statusColor.color }}
            />
            {statusLabel}
          </span>
        </div>

        {/* Completion Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p
              className="text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Completion
            </p>
            <span className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>
              {record.completionPercentage}%
            </span>
          </div>
          <ProgressBar value={record.completionPercentage} color={progressColor} height={8} />
        </div>

        {/* Item Count */}
        <div
          className="flex items-center justify-between rounded-lg px-3 py-2.5 border"
          style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}
        >
          <p className="text-[11px] font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>
            Checklist Items
          </p>
          <span className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            {completedRequired} / {totalRequired}
          </span>
        </div>

        {/* Ready Indicator */}
        <div
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 border"
          style={{
            background: record.readyToSubmit ? "#F0FDF4" : "#F8FAFC",
            borderColor: record.readyToSubmit ? "#A7F3D0" : "#E2E8F0",
          }}
        >
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: record.readyToSubmit ? "#059669" : "#94A3B8" }}
          />
          <p
            className="text-[11px] font-semibold"
            style={{ color: record.readyToSubmit ? "#065F46" : "#64748B" }}
          >
            {record.readyToSubmit ? "Ready to submit" : "Not ready to submit"}
          </p>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid var(--rtm-border)" }} />

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={() => {
              console.log("[HandoffStatusBar] Save Draft:", record.handoffNumber);
            }}
            className="w-full text-xs font-semibold px-3 py-2 rounded-lg border transition-opacity hover:opacity-80"
            style={{
              background: "var(--rtm-surface)",
              color: "var(--rtm-text-primary)",
              borderColor: "var(--rtm-border)",
            }}
          >
            Save Draft
          </button>

          <button
            onClick={onSubmit}
            disabled={!record.readyToSubmit}
            className="w-full text-xs font-bold px-3 py-2 rounded-lg border transition-opacity"
            style={{
              background: record.readyToSubmit ? "var(--rtm-blue)" : "#E2E8F0",
              color: record.readyToSubmit ? "#fff" : "#94A3B8",
              borderColor: record.readyToSubmit ? "var(--rtm-blue)" : "#E2E8F0",
              cursor: record.readyToSubmit ? "pointer" : "not-allowed",
              opacity: record.readyToSubmit ? 1 : 0.7,
            }}
          >
            Request Invoice — Submit to Billing Team
          </button>

          <Link
            href="/billing/activation-queue"
            className="w-full block text-center text-xs font-semibold px-3 py-2 rounded-lg border transition-opacity hover:opacity-80"
            style={{
              background: "#EFF6FF",
              color: "var(--rtm-blue)",
              borderColor: "#BFDBFE",
            }}
          >
            View in Billing Workspace
          </Link>
        </div>

        {/* Metadata */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between">
            <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>
              Prepared by
            </span>
            <span className="text-[10px] font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
              {record.preparedBy || "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>
              Created
            </span>
            <span className="text-[10px] font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
              {new Date(record.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          {record.submittedAt && (
            <div className="flex justify-between">
              <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>
                Submitted
              </span>
              <span className="text-[10px] font-semibold" style={{ color: "#059669" }}>
                {new Date(record.submittedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
