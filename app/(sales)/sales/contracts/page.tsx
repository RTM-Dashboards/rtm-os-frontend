import React from "react";
import Link from "next/link";
import { getWorkspace } from "@/lib/workspaces";
import ContractBuilderShell from "@/components/sales/contract-builder/ContractBuilderShell";

const workspace = getWorkspace("sales")!;

export default function SalesContractsPage() {
  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 px-1">
        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-1"
            style={{ color: workspace.accentColor }}
          >
            Sales
          </p>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            Contract Builder
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
            Configuration-driven service agreement builder. Consumes proposal output and
            generates structured contracts with editable clauses and e-signature readiness.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap flex-shrink-0">
          <Link
            href="/settings/contract-templates"
            className="px-4 py-2 rounded-lg font-semibold text-sm border"
            style={{
              background: "var(--rtm-surface)",
              color: "var(--rtm-text-secondary)",
              borderColor: "var(--rtm-border)",
            }}
          >
            Contract Templates
          </Link>
          <Link
            href="/sales/handoffs"
            className="px-4 py-2 rounded-lg font-bold text-sm border"
            style={{
              background: "#FFFBEB",
              color: "#D97706",
              borderColor: "#FDE68A",
            }}
          >
            Billing Handoff
          </Link>
        </div>
      </div>

      {/* Workflow breadcrumb */}
      <div
        className="rounded-xl border p-3 mx-1"
        style={{ background: "#F0FDF4", borderColor: "#A7F3D0" }}
      >
        <p
          className="text-[10px] font-bold uppercase tracking-widest mb-2"
          style={{ color: "#059669" }}
        >
          Sales Workflow
        </p>
        <div className="flex items-center gap-1 flex-wrap">
          {[
            "Sales Intake",
            "Goal Selection",
            "Audit Report",
            "Recommendations",
            "Budget Optimizer",
            "Proposal Builder",
            "Contract Builder",
            "Billing Handoff",
          ].map((step, i, arr) => (
            <React.Fragment key={step}>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded"
                style={{
                  background:
                    step === "Contract Builder"
                      ? "#059669"
                      : [
                          "Sales Intake",
                          "Goal Selection",
                          "Audit Report",
                          "Recommendations",
                          "Budget Optimizer",
                          "Proposal Builder",
                        ].includes(step)
                      ? "#DCFCE7"
                      : "#F1F5F9",
                  color:
                    step === "Contract Builder"
                      ? "#fff"
                      : [
                          "Sales Intake",
                          "Goal Selection",
                          "Audit Report",
                          "Recommendations",
                          "Budget Optimizer",
                          "Proposal Builder",
                        ].includes(step)
                      ? "#15803D"
                      : "#64748B",
                }}
              >
                {step}
              </span>
              {i < arr.length - 1 && (
                <span className="text-slate-300 text-xs">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Contract Builder */}
      <div
        className="rounded-xl border overflow-hidden flex-1"
        style={{
          borderColor: "var(--rtm-border)",
          background: "var(--rtm-surface)",
          minHeight: 700,
        }}
      >
        <ContractBuilderShell
          clientName="New Client"
          preparedBy="Sales Representative"
          templateId="standard"
        />
      </div>

      {/* Billing Handoff CTA */}
      <div
        className="rounded-xl border p-4 mx-1"
        style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold" style={{ color: "#D97706" }}>
              Next Step: Billing Handoff
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#92400E" }}>
              Once the contract is signed, send it to billing to initiate invoicing and account
              activation.
            </p>
          </div>
          <Link
            href="/sales/handoffs"
            className="px-4 py-2 rounded-lg font-bold text-sm flex-shrink-0 border"
            style={{
              background: "#D97706",
              color: "#fff",
              borderColor: "#B45309",
            }}
          >
            Continue to Billing Handoff
          </Link>
        </div>
      </div>
    </div>
  );
}
