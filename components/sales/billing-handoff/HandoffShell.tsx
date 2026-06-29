"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import HandoffChecklist from "./HandoffChecklist";
import HandoffSummaryPanel from "./HandoffSummaryPanel";
import HandoffStatusBar from "./HandoffStatusBar";
import {
  buildHandoffRecord,
  updateChecklistItem,
  updateSummaryField,
} from "@/lib/sales/handoff-engine";
import type { HandoffRecord } from "@/lib/sales/handoff-engine";
import type {
  HandoffChecklistItemId,
  HandoffChecklistItemStatus,
} from "@/lib/sales/handoff-config";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HandoffShellProps {
  clientName?: string;
  contractNumber?: string;
  contractId?: string;
  preparedBy?: string;
  initialSummaryFields?: Record<string, string>;
  /** Optional callback fired when the handoff is successfully submitted. */
  onSubmitted?: () => void;
}

type ActiveTab = "checklist" | "summary";

// ─── Component ────────────────────────────────────────────────────────────────

export default function HandoffShell({
  clientName = "Unknown Client",
  contractNumber = "—",
  contractId = "",
  preparedBy = "Sales Representative",
  initialSummaryFields,
  onSubmitted,
}: HandoffShellProps) {
  const [record, setRecord] = useState<HandoffRecord | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("checklist");
  const [submitted, setSubmitted] = useState(false);

  // Initialize on mount
  useEffect(() => {
    const initial = buildHandoffRecord(
      clientName,
      contractNumber,
      contractId,
      preparedBy,
      initialSummaryFields
    );
    setRecord(initial);
  }, [clientName, contractNumber, contractId, preparedBy, initialSummaryFields]);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  function handleChecklistUpdate(
    itemId: HandoffChecklistItemId,
    status: HandoffChecklistItemStatus,
    completedBy?: string
  ) {
    if (!record) return;
    const updated = updateChecklistItem(record, itemId, status, completedBy ?? preparedBy);
    setRecord(updated);
  }

  function handleSummaryFieldUpdate(fieldId: string, value: string) {
    if (!record) return;
    const updated = updateSummaryField(record, fieldId, value);
    setRecord(updated);
  }

  function handleTabChange(tab: ActiveTab) {
    setActiveTab(tab);
  }

  function handleSubmit() {
    if (!record || !record.readyToSubmit) return;
    console.log("[HandoffShell] Submitting handoff:", record.handoffNumber, record);
    setRecord((prev) =>
      prev
        ? {
            ...prev,
            status: "submitted",
            submittedAt: new Date().toISOString(),
          }
        : prev
    );
    setSubmitted(true);
    onSubmitted?.();
  }

  if (!record) {
    return (
      <div
        className="flex items-center justify-center h-48"
        style={{ color: "var(--rtm-text-muted)" }}
      >
        <p className="text-xs">Initializing handoff record…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--rtm-bg)" }}>
      <div className="max-w-screen-xl mx-auto px-6 py-6 space-y-6">

        {/* Workflow Breadcrumb */}
        <nav className="flex items-center gap-1.5 flex-wrap text-[11px]">
          {[
            { label: "Sales Intake", href: "/sales/intake" },
            { label: "Goal Audit", href: "/sales/audit" },
            { label: "Recommendations", href: "/sales/recommendations" },
            { label: "Budget Optimizer", href: "/sales/budget" },
            { label: "Proposal Builder", href: "/sales/proposals" },
            { label: "Contract Builder", href: "/sales/contracts" },
            { label: "Billing Handoff", href: "/sales/handoffs", active: true },
          ].map((step, idx, arr) => (
            <React.Fragment key={step.label}>
              {step.active ? (
                <span
                  className="font-bold px-2 py-0.5 rounded"
                  style={{ background: "var(--rtm-blue)", color: "#fff" }}
                >
                  {step.label}
                </span>
              ) : (
                <Link
                  href={step.href}
                  className="font-medium transition-opacity hover:opacity-80"
                  style={{ color: "var(--rtm-text-muted)" }}
                >
                  {step.label}
                </Link>
              )}
              {idx < arr.length - 1 && (
                <span style={{ color: "var(--rtm-text-muted)" }}>›</span>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Page Header */}
        <div
          className="flex items-start justify-between gap-4 pb-4 border-b"
          style={{ borderColor: "var(--rtm-border)" }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[11px] font-bold uppercase tracking-widest"
                style={{ color: "var(--rtm-text-muted)" }}
              >
                Billing Handoff
              </span>
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded"
                style={{ background: "#EFF6FF", color: "var(--rtm-blue)" }}
              >
                {record.handoffNumber}
              </span>
            </div>
            <h1 className="text-xl font-bold" style={{ color: "var(--rtm-text-primary)" }}>
              {record.clientName}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-secondary)" }}>
              Contract {record.contractNumber} · Prepared by {record.preparedBy}
            </p>
          </div>
        </div>

        {/* Submitted confirmation */}
        {submitted && (
          <div
            className="flex items-center gap-3 rounded-lg px-4 py-3 border"
            style={{ background: "#ECFDF5", borderColor: "#A7F3D0" }}
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#059669" }} />
            <p className="text-xs font-semibold" style={{ color: "#065F46" }}>
              Handoff {record.handoffNumber} submitted to the Billing team successfully.
            </p>
          </div>
        )}

        {/* Two-panel layout */}
        <div className="flex items-start gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Tab Bar */}
            <div
              className="flex rounded-lg border overflow-hidden"
              style={{ borderColor: "var(--rtm-border)", display: "inline-flex" }}
            >
              {(["checklist", "summary"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className="px-5 py-2.5 text-xs font-semibold capitalize transition-colors"
                  style={{
                    background: activeTab === tab ? "var(--rtm-blue)" : "var(--rtm-surface)",
                    color: activeTab === tab ? "#fff" : "var(--rtm-text-secondary)",
                  }}
                >
                  {tab === "checklist" ? "Checklist" : "Summary"}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div
              className="rounded-xl border p-5"
              style={{
                background: "var(--rtm-surface)",
                borderColor: "var(--rtm-border)",
              }}
            >
              {activeTab === "checklist" && (
                <HandoffChecklist
                  checklist={record.checklist}
                  onUpdate={handleChecklistUpdate}
                />
              )}
              {activeTab === "summary" && (
                <HandoffSummaryPanel
                  summaryFields={record.summaryFields}
                  onUpdate={handleSummaryFieldUpdate}
                />
              )}
            </div>
          </div>

          {/* Right Panel — Status Bar */}
          <div className="flex-shrink-0" style={{ width: 280 }}>
            <HandoffStatusBar record={record} onSubmit={handleSubmit} />
          </div>
        </div>

        {/* Workflow CTA */}
        <div
          className="flex items-center justify-between rounded-xl border px-5 py-4"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <div>
            <p className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>
              Handoff complete — client moves to Billing Activation
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
              Once the handoff is submitted, the Billing team will begin the invoice and
              activation process.
            </p>
          </div>
          <Link
            href="/billing/activation-queue"
            className="flex-shrink-0 text-xs font-bold px-4 py-2 rounded-lg border transition-opacity hover:opacity-80"
            style={{
              background: "var(--rtm-blue)",
              color: "#fff",
              borderColor: "var(--rtm-blue)",
            }}
          >
            Billing Activation Queue
          </Link>
        </div>

      </div>
    </div>
  );
}
