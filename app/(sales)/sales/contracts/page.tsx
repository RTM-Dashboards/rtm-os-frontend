"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getWorkspace } from "@/lib/workspaces";
import ContractBuilderShell from "@/components/sales/contract-builder/ContractBuilderShell";
import { getOrCreateHandoffForContract } from "@/lib/sales/handoff-store";

const workspace = getWorkspace("sales")!;

// ── Mock signed contracts ──────────────────────────────────────────────────────
// These are contracts in Signed status that are eligible for Request Invoice.

type ContractStatus = "Draft" | "Sent" | "Signed" | "Expired" | "Cancelled";

interface ContractRecord {
  id: string;
  client: string;
  services: string;
  monthlyValue: string;
  termLength: string;
  signedDate: string;
  assignedRep: string;
  status: ContractStatus;
}

const MOCK_CONTRACTS: ContractRecord[] = [
  {
    id: "CTR-2025-0041",
    client: "Summit Landscaping",
    services: "SEO, GBP, Reporting",
    monthlyValue: "$2,400/mo",
    termLength: "12 months",
    signedDate: "Jun 1, 2025",
    assignedRep: "Jordan M.",
    status: "Signed",
  },
  {
    id: "CTR-2025-0042",
    client: "Metro Dental Group",
    services: "SEO, GBP, PPC, Reporting",
    monthlyValue: "$4,500/mo",
    termLength: "12 months",
    signedDate: "Jun 5, 2025",
    assignedRep: "Jordan M.",
    status: "Signed",
  },
  {
    id: "CTR-2025-0043",
    client: "Coastal Wellness Spa",
    services: "Meta Ads, SEO, Creative",
    monthlyValue: "$3,800/mo",
    termLength: "12 months",
    signedDate: "Jun 8, 2025",
    assignedRep: "Sarah K.",
    status: "Signed",
  },
  {
    id: "CTR-2025-0038",
    client: "Harbor Auto Group",
    services: "PPC, Meta Ads, Reporting",
    monthlyValue: "$5,000/mo",
    termLength: "24 months",
    signedDate: "May 28, 2025",
    assignedRep: "Mike T.",
    status: "Draft",
  },
  {
    id: "CTR-2025-0039",
    client: "Blue Ridge Plumbing",
    services: "GBP, LSA",
    monthlyValue: "$1,300/mo",
    termLength: "Month-to-Month",
    signedDate: "—",
    assignedRep: "Sarah K.",
    status: "Sent",
  },
];

const STATUS_STYLES: Record<ContractStatus, { bg: string; text: string; border: string }> = {
  Draft:     { bg: "#F3F4F6", text: "#6B7280", border: "#D1D5DB" },
  Sent:      { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  Signed:    { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  Expired:   { bg: "#F3F4F6", text: "#9CA3AF", border: "#D1D5DB" },
  Cancelled: { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
};

function RequestInvoiceButton({ contractId, contract }: { contractId: string; contract: ContractRecord }) {
  const router = useRouter();

  function handleClick() {
    // Build summary fields from contract data
    const summaryFields: Record<string, string> = {
      "client-name": contract.client,
      "contract-number": contract.id,
      "services-sold": contract.services,
      "monthly-recurring-revenue": contract.monthlyValue,
      "payment-terms": "Net 15",
      "term-length": contract.termLength,
      "setup-fees": "$0",
    };
    // Get or create the handoff record for this contract
    const handoff = getOrCreateHandoffForContract(
      contractId,
      contract.client,
      contract.id,
      contract.assignedRep,
      summaryFields
    );
    // Route to the specific handoff detail view
    router.push(`/sales/handoffs?handoffId=${handoff.id}&action=request-invoice`);
  }

  return (
    <button
      onClick={handleClick}
      className="text-xs font-bold px-3 py-1.5 rounded-lg border transition-all hover:opacity-90"
      style={{ background: "#059669", color: "#fff", borderColor: "#047857" }}
    >
      Request Invoice
    </button>
  );
}

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

      {/* Signed Contracts — Request Invoice */}
      <div className="rounded-xl border overflow-hidden mx-1" style={{ borderColor: "var(--rtm-border)" }}>
        <div
          className="px-5 py-4 border-b flex items-center justify-between"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>Contracts</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
              Signed contracts are eligible for Request Invoice. Click to submit to Billing.
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ borderCollapse: "collapse", minWidth: "800px" }}>
            <thead>
              <tr style={{ background: "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border)" }}>
                {["Contract #", "Client", "Services", "Monthly Value", "Term", "Signed Date", "Rep", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_CONTRACTS.map((contract, i) => {
                const s = STATUS_STYLES[contract.status];
                return (
                  <tr key={contract.id} style={{ borderBottom: "1px solid var(--rtm-border-light)", background: i % 2 === 0 ? "transparent" : "var(--rtm-surface)" }}>
                    <td className="px-4 py-3 font-mono font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{contract.id}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{contract.client}</td>
                    <td className="px-4 py-3" style={{ color: "var(--rtm-text-secondary)" }}>{contract.services}</td>
                    <td className="px-4 py-3 font-bold" style={{ color: "#059669" }}>{contract.monthlyValue}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{contract.termLength}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{contract.signedDate}</td>
                    <td className="px-4 py-3" style={{ color: "var(--rtm-text-secondary)" }}>{contract.assignedRep}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border" style={{ background: s.bg, color: s.text, borderColor: s.border }}>
                        {contract.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {contract.status === "Signed" && (
                          <RequestInvoiceButton contractId={contract.id} contract={contract} />
                        )}
                        <button
                          className="text-xs font-semibold px-2 py-1 rounded-lg border"
                          style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border)" }}
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contract Builder */}
      <div
        className="rounded-xl border overflow-hidden flex-1 mx-1"
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
              Next Step: Request Invoice
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#92400E" }}>
              Once the contract is signed, use Request Invoice to submit it to Billing for
              invoice generation and account activation.
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
            Go to Handoffs
          </Link>
        </div>
      </div>
    </div>
  );
}
