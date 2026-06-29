"use client";

import React from "react";
import Link from "next/link";
import type { ContractDocument } from "@/lib/sales/contract-engine";
import {
  CONTRACT_STATUS_LABELS,
  CONTRACT_STATUS_COLORS,
  PAYMENT_TERM_OPTIONS,
  CONTRACT_TERM_LENGTHS,
  CONTRACT_CLAUSES,
} from "@/lib/sales/contract-config";

interface ContractStatusBarProps {
  contract: ContractDocument;
  onTogglePreview: () => void;
  previewMode: boolean;
}

export default function ContractStatusBar({
  contract,
  onTogglePreview,
  previewMode,
}: ContractStatusBarProps) {
  const statusLabel = CONTRACT_STATUS_LABELS[contract.status];
  const statusColor = CONTRACT_STATUS_COLORS[contract.status];

  const requiredClauses = CONTRACT_CLAUSES.filter((d) => d.required);

  const clauseStatusColor: Record<string, { color: string; bg: string }> = {
    empty: { color: "#9CA3AF", bg: "#F3F4F6" },
    draft: { color: "#D97706", bg: "#FFFBEB" },
    complete: { color: "#059669", bg: "#ECFDF5" },
    locked: { color: "#2563EB", bg: "#EFF6FF" },
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Contract identity */}
      <div
        className="rounded-xl border p-4"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <p
          className="text-[10px] font-bold uppercase tracking-widest mb-1"
          style={{ color: "var(--rtm-text-muted)" }}
        >
          Contract Number
        </p>
        <p className="text-base font-black tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
          {contract.contractNumber}
        </p>

        <div className="mt-3 flex items-center gap-2">
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border"
            style={{
              background: "#F9FAFB",
              color: statusColor,
              borderColor: statusColor,
            }}
          >
            {statusLabel}
          </span>
        </div>

        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>Payment Term</span>
            <span className="text-[10px] font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>
              {PAYMENT_TERM_OPTIONS[contract.paymentTerm].split(" — ")[0]}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>Term Length</span>
            <span className="text-[10px] font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>
              {CONTRACT_TERM_LENGTHS[contract.termLength]}
            </span>
          </div>
        </div>
      </div>

      {/* Completion progress */}
      <div
        className="rounded-xl border p-4"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <p
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            Completion
          </p>
          <p className="text-sm font-black" style={{ color: "#059669" }}>
            {contract.completionPercentage}%
          </p>
        </div>
        <div
          className="w-full rounded-full overflow-hidden"
          style={{ background: "#E5E7EB", height: 8 }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${contract.completionPercentage}%`,
              background:
                contract.completionPercentage === 100
                  ? "#059669"
                  : contract.completionPercentage >= 60
                  ? "#D97706"
                  : "#DC2626",
            }}
          />
        </div>

        {/* Ready for send */}
        <div
          className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2 border"
          style={{
            background: contract.readyForSend ? "#ECFDF5" : "#FEF2F2",
            borderColor: contract.readyForSend ? "#A7F3D0" : "#FECACA",
          }}
        >
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: contract.readyForSend ? "#059669" : "#DC2626" }}
          />
          <p
            className="text-[10px] font-bold"
            style={{ color: contract.readyForSend ? "#059669" : "#DC2626" }}
          >
            {contract.readyForSend
              ? "Ready for Send"
              : "Not ready — complete all required clauses"}
          </p>
        </div>
      </div>

      {/* Clause checklist */}
      <div
        className="rounded-xl border p-4"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <p
          className="text-[10px] font-bold uppercase tracking-widest mb-3"
          style={{ color: "var(--rtm-text-muted)" }}
        >
          Clause Checklist
        </p>
        <div className="space-y-1.5">
          {requiredClauses.map((def) => {
            const clause = contract.clauses.find((c) => c.id === def.id);
            const status = clause?.status ?? "empty";
            const sc = clauseStatusColor[status] ?? clauseStatusColor.empty;

            return (
              <div
                key={def.id}
                className="flex items-center justify-between gap-2 py-1"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{
                      background:
                        status === "complete" || status === "locked" ? "#059669" : "#D1D5DB",
                    }}
                  />
                  <span
                    className="text-[11px] truncate"
                    style={{ color: "var(--rtm-text-secondary)" }}
                    title={def.label}
                  >
                    {def.label}
                  </span>
                </div>
                <span
                  className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: sc.bg, color: sc.color }}
                >
                  {status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div
        className="rounded-xl border p-4 space-y-2"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <p
          className="text-[10px] font-bold uppercase tracking-widest mb-1"
          style={{ color: "var(--rtm-text-muted)" }}
        >
          Actions
        </p>

        <button
          onClick={onTogglePreview}
          className="w-full px-3 py-2 rounded-lg border text-xs font-bold text-left transition-all"
          style={{
            background: previewMode ? "#EFF6FF" : "var(--rtm-surface)",
            color: previewMode ? "#2563EB" : "var(--rtm-text-secondary)",
            borderColor: previewMode ? "#BFDBFE" : "var(--rtm-border)",
          }}
        >
          {previewMode ? "Exit Preview" : "Preview Contract"}
        </button>

        <button
          className="w-full px-3 py-2 rounded-lg border text-xs font-semibold text-left"
          style={{
            background: "var(--rtm-surface)",
            color: "var(--rtm-text-secondary)",
            borderColor: "var(--rtm-border)",
          }}
          onClick={() => alert("[Mock] Contract saved as draft.")}
        >
          Save Draft
        </button>

        <button
          className="w-full px-3 py-2 rounded-lg border text-xs font-semibold text-left"
          style={{
            background: "#FFFBEB",
            color: "#D97706",
            borderColor: "#FDE68A",
          }}
          onClick={() => alert("[Mock] Contract sent for internal review.")}
        >
          Send for Internal Review
        </button>

        <button
          className="w-full px-3 py-2 rounded-lg border text-xs font-bold text-left"
          style={{
            background: contract.readyForSend ? "#ECFDF5" : "#F3F4F6",
            color: contract.readyForSend ? "#059669" : "#9CA3AF",
            borderColor: contract.readyForSend ? "#A7F3D0" : "#D1D5DB",
            cursor: contract.readyForSend ? "pointer" : "not-allowed",
          }}
          disabled={!contract.readyForSend}
          onClick={() => {
            if (contract.readyForSend) alert("[Mock] Contract sent to client for signature.");
          }}
        >
          Send to Client for Signature
        </button>

        <Link
          href="/sales/handoffs"
          className="w-full px-3 py-2 rounded-lg border text-xs font-bold text-left block"
          style={{
            background: "#FFFBEB",
            color: "#D97706",
            borderColor: "#FDE68A",
          }}
        >
          Continue to Billing Handoff
        </Link>
      </div>
    </div>
  );
}
