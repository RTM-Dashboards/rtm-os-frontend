"use client";

import React, { useState } from "react";
import {
  SERVICE_TO_DEPARTMENT_MAP,
} from "@/lib/sales/audit-config";
import {
  createManualAuditRequest,
  createHybridAuditRequest,
} from "@/lib/sales/audit-engine";
import type {
  ManualAuditRequest,
  HybridAuditRequest,
} from "@/lib/sales/types";
import type { IntakeAuditResult } from "@/lib/sales/types";

interface RequestAuditModalProps {
  opportunityId: string;
  clientName: string;
  requestedServices: string[];
  requestedBy: string;
  intakeAuditResult: IntakeAuditResult | null;
  initialMode?: "manual" | "hybrid";
  onRequestCreated: (request: ManualAuditRequest[] | HybridAuditRequest) => void;
  onClose: () => void;
}

function getUniqueDepartments(services: string[]): string[] {
  const depts = services.map((s) => SERVICE_TO_DEPARTMENT_MAP[s] ?? "SEO");
  return Array.from(new Set(depts));
}

export function RequestAuditModal({
  opportunityId,
  clientName,
  requestedServices,
  requestedBy,
  intakeAuditResult,
  initialMode = "manual",
  onRequestCreated,
  onClose,
}: RequestAuditModalProps) {
  const [mode, setMode] = useState<"manual" | "hybrid">(
    initialMode === "hybrid" && intakeAuditResult ? "hybrid" : "manual"
  );

  const departments = getUniqueDepartments(
    requestedServices.length > 0 ? requestedServices : ["Website"]
  );

  function handleSubmit() {
    if (mode === "manual") {
      // One ManualAuditRequest per unique department
      const requests: ManualAuditRequest[] = departments.map((dept) => {
        const servicesForDept = requestedServices.filter(
          (s) => (SERVICE_TO_DEPARTMENT_MAP[s] ?? "SEO") === dept
        );
        return createManualAuditRequest(
          opportunityId,
          clientName,
          servicesForDept.length > 0 ? servicesForDept : [dept],
          requestedBy
        );
      });
      onRequestCreated(requests);
    } else {
      if (!intakeAuditResult) return;
      const request = createHybridAuditRequest(
        opportunityId,
        clientName,
        requestedServices.length > 0 ? requestedServices : ["Website"],
        requestedBy,
        intakeAuditResult
      );
      onRequestCreated(request);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden"
        style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 border-b"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <h2 className="text-lg font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            Request Audit
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
            {clientName}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Mode selector */}
          <div className="space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>
              Audit Mode
            </p>
            <div className="space-y-2">
              <label
                className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                  mode === "manual" ? "ring-2 ring-blue-500" : ""
                }`}
                style={{
                  background: mode === "manual" ? "#EFF6FF" : "var(--rtm-surface)",
                  borderColor: mode === "manual" ? "#1D4ED8" : "var(--rtm-border)",
                }}
              >
                <input
                  type="radio"
                  name="audit-mode"
                  value="manual"
                  checked={mode === "manual"}
                  onChange={() => setMode("manual")}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                    Manual Audit
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                    A fully manual audit request. No AI involvement. The assigned team member fills out the audit scorecard manually and submits findings.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                  !intakeAuditResult ? "opacity-50 cursor-not-allowed" : ""
                } ${mode === "hybrid" ? "ring-2 ring-blue-500" : ""}`}
                style={{
                  background: mode === "hybrid" ? "#EFF6FF" : "var(--rtm-surface)",
                  borderColor: mode === "hybrid" ? "#1D4ED8" : "var(--rtm-border)",
                }}
              >
                <input
                  type="radio"
                  name="audit-mode"
                  value="hybrid"
                  checked={mode === "hybrid"}
                  onChange={() => intakeAuditResult && setMode("hybrid")}
                  disabled={!intakeAuditResult}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                    Hybrid Audit
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                    AI runs the intake-based audit first as a baseline. Each relevant department then reviews, accepts, modifies, or overrides AI findings independently within a 24-hour SLA.
                  </p>
                  {!intakeAuditResult && (
                    <p className="text-xs mt-1 font-semibold" style={{ color: "#D97706" }}>
                      Run the Intake Audit first to enable Hybrid mode.
                    </p>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Departments preview */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>
              Implicated Departments
            </p>
            <div className="flex flex-wrap gap-2">
              {departments.map((dept) => (
                <span
                  key={dept}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border"
                  style={{ background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" }}
                >
                  {dept}
                </span>
              ))}
            </div>
            <p className="text-[10px] mt-1.5" style={{ color: "var(--rtm-text-muted)" }}>
              {mode === "manual"
                ? `${departments.length} separate manual audit request${departments.length !== 1 ? "s" : ""} will be created, one per department.`
                : "One hybrid audit request will be created covering all departments above."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t flex items-center justify-end gap-3"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg border text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={mode === "hybrid" && !intakeAuditResult}
            className="px-5 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "#1D4ED8" }}
          >
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
}
