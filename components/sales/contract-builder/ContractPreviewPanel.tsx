"use client";

import React from "react";
import type { ContractDocument } from "@/lib/sales/contract-engine";
import {
  CONTRACT_STATUS_LABELS,
  CONTRACT_STATUS_COLORS,
  PAYMENT_TERM_OPTIONS,
  CONTRACT_TERM_LENGTHS,
} from "@/lib/sales/contract-config";

interface ContractPreviewPanelProps {
  contract: ContractDocument;
}

export default function ContractPreviewPanel({ contract }: ContractPreviewPanelProps) {
  const createdDate = new Date(contract.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const statusLabel = CONTRACT_STATUS_LABELS[contract.status];
  const statusColor = CONTRACT_STATUS_COLORS[contract.status];

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-surface)" }}
    >
      {/* Preview header bar */}
      <div
        className="flex items-center justify-between px-6 py-3 border-b"
        style={{ background: "#F8FAFF", borderColor: "var(--rtm-border)" }}
      >
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>
          Contract Preview — Client View
        </p>
        <span
          className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
          style={{ background: "#F3F4F6", color: statusColor, border: `1px solid ${statusColor}` }}
        >
          {statusLabel}
        </span>
      </div>

      <div className="p-8 space-y-8 max-w-3xl mx-auto">
        {/* Cover block */}
        <div className="text-center space-y-2 pb-8 border-b" style={{ borderColor: "var(--rtm-border)" }}>
          <p
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            Service Agreement
          </p>
          <h1
            className="text-2xl font-black tracking-tight"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            {contract.clientName || "Client Name"}
          </h1>
          <div
            className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full border"
            style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}
          >
            <span>Contract No. {contract.contractNumber}</span>
            <span style={{ color: "var(--rtm-border)" }}>|</span>
            <span>Prepared {createdDate}</span>
            <span style={{ color: "var(--rtm-border)" }}>|</span>
            <span>Prepared by {contract.preparedBy || "—"}</span>
          </div>
          <div className="flex items-center justify-center gap-4 pt-1">
            <span className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
              Payment: <strong>{PAYMENT_TERM_OPTIONS[contract.paymentTerm].split(" — ")[0]}</strong>
            </span>
            <span style={{ color: "var(--rtm-border)" }}>|</span>
            <span className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
              Term: <strong>{CONTRACT_TERM_LENGTHS[contract.termLength]}</strong>
            </span>
          </div>
        </div>

        {/* Clauses */}
        {contract.clauses.map((clause) => (
          <div key={clause.id} className="space-y-3">
            {/* Clause title row */}
            <div className="flex items-center gap-3">
              <h2
                className="text-sm font-bold uppercase tracking-wide"
                style={{ color: "var(--rtm-text-primary)" }}
              >
                {clause.order}. {clause.label}
              </h2>
              {clause.legalLock && (
                <span
                  className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border"
                  style={{ background: "#EFF6FF", color: "#2563EB", borderColor: "#BFDBFE" }}
                >
                  Standard Legal Language
                </span>
              )}
              {!clause.editable && !clause.legalLock && (
                <span
                  className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border"
                  style={{ background: "#FAF5FF", color: "#7C3AED", borderColor: "#DDD6FE" }}
                >
                  Auto-Populated
                </span>
              )}
            </div>

            {/* Clause content */}
            <div
              className="text-sm leading-relaxed rounded-lg p-4 border"
              style={{
                background: clause.legalLock
                  ? "#F8FAFF"
                  : !clause.editable && !clause.legalLock
                  ? "#FAFBFF"
                  : "var(--rtm-bg)",
                borderColor: clause.legalLock
                  ? "#BFDBFE"
                  : !clause.editable && !clause.legalLock
                  ? "#DDD6FE"
                  : "var(--rtm-border)",
                color:
                  clause.content.trim().length > 0
                    ? "var(--rtm-text-primary)"
                    : "var(--rtm-text-muted)",
                whiteSpace: "pre-wrap",
              }}
            >
              {clause.content.trim().length > 0
                ? clause.content
                : "[This section has not been completed yet.]"}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div
          className="pt-6 border-t text-center"
          style={{ borderColor: "var(--rtm-border)" }}
        >
          <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>
            {contract.contractNumber} · Confidential and Proprietary · Not for Distribution
          </p>
        </div>
      </div>
    </div>
  );
}
