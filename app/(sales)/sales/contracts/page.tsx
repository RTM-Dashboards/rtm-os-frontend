"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getWorkspace } from "@/lib/workspaces";
import ContractBuilderShell from "@/components/sales/contract-builder/ContractBuilderShell";
import { getOrCreateHandoffForContract } from "@/lib/sales/handoff-store";
import {
  fetchAllContracts,
  hydrateContracts,
  type SalesContractRecord,
  type SalesContractStatus,
} from "@/lib/sales/contracts-store";

const workspace = getWorkspace("sales")!;

// ── Status display helpers ─────────────────────────────────────────────────────

const STATUS_STYLES: Record<
  SalesContractStatus,
  { bg: string; text: string; border: string; label: string }
> = {
  draft:     { bg: "#F3F4F6", text: "#6B7280", border: "#D1D5DB", label: "Draft" },
  sent:      { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE", label: "Sent" },
  signed:    { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0", label: "Signed" },
  expired:   { bg: "#F3F4F6", text: "#9CA3AF", border: "#D1D5DB", label: "Expired" },
  cancelled: { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3", label: "Cancelled" },
};

// ── Request Invoice Button ─────────────────────────────────────────────────────
// Preserved exactly from the original implementation — uses the existing
// real file-backed handoff-store integration unchanged.

function RequestInvoiceButton({
  contractId,
  contract,
}: {
  contractId: string;
  contract: SalesContractRecord;
}) {
  const router = useRouter();
  const [creating, setCreating] = React.useState(false);

  async function handleClick() {
    if (creating) return;
    setCreating(true);
    // Build summary fields from real contract data
    const summaryFields: Record<string, string> = {
      "client-name": contract.clientName,
      "contract-number": contract.contractNumber,
      "services-sold": contract.services.join(", "),
      "monthly-recurring-revenue": contract.monthlyValue,
      "payment-terms": contract.paymentTerm === "net-15"
        ? "Net 15"
        : contract.paymentTerm === "net-45"
        ? "Net 45"
        : contract.paymentTerm === "upon-receipt"
        ? "Due Upon Receipt"
        : "Net 30",
      "term-length": contract.termLength,
      "setup-fees": "$0",
    };
    try {
      const handoff = await getOrCreateHandoffForContract(
        contractId,
        contract.clientName,
        contract.contractNumber,
        contract.assignedRep,
        summaryFields
      );
      router.push(`/sales/handoffs?handoffId=${handoff.id}&action=request-invoice`);
    } finally {
      setCreating(false);
    }
  }

  return (
    <button
      onClick={() => void handleClick()}
      disabled={creating}
      className="text-xs font-bold px-3 py-1.5 rounded-lg border transition-all hover:opacity-90 disabled:opacity-60"
      style={{ background: "#059669", color: "#fff", borderColor: "#047857" }}
    >
      {creating ? "Creating…" : "Request Invoice"}
    </button>
  );
}

// ── Contract Detail Panel ──────────────────────────────────────────────────────
// Shown when the user clicks "View" on a row. Renders the selected contract's
// real content above the ContractBuilderShell, which is also seeded with the
// same real data.

function ContractDetailPanel({
  contract,
  onClose,
}: {
  contract: SalesContractRecord;
  onClose: () => void;
}) {
  const s = STATUS_STYLES[contract.status];

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-surface)" }}
    >
      {/* Detail header */}
      <div
        className="px-5 py-4 border-b flex items-start justify-between gap-4"
        style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className="font-mono text-sm font-bold"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            {contract.contractNumber}
          </span>
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
            style={{ background: s.bg, color: s.text, borderColor: s.border }}
          >
            {s.label}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
          style={{
            background: "var(--rtm-surface)",
            color: "var(--rtm-text-muted)",
            borderColor: "var(--rtm-border)",
          }}
        >
          ✕ Close
        </button>
      </div>

      {/* Contract summary */}
      <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 border-b" style={{ borderColor: "var(--rtm-border)" }}>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--rtm-text-muted)" }}>
            Client
          </p>
          <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            {contract.clientName}
          </p>
          {contract.contactName && contract.contactName !== contract.clientName && (
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-secondary)" }}>
              {contract.contactName}
            </p>
          )}
          {contract.contactEmail && (
            <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
              {contract.contactEmail}
            </p>
          )}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--rtm-text-muted)" }}>
            Services
          </p>
          <div className="flex flex-col gap-0.5">
            {contract.services.length > 0 ? (
              contract.services.map((s) => (
                <p key={s} className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                  • {s}
                </p>
              ))
            ) : (
              <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>—</p>
            )}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--rtm-text-muted)" }}>
            Monthly Value
          </p>
          <p className="text-sm font-bold" style={{ color: "#059669" }}>
            {contract.monthlyValue}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--rtm-text-muted)" }}>
            Term / Payment
          </p>
          <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>
            {contract.termLength}
          </p>
          <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
            {contract.paymentTerm === "net-15"
              ? "Net 15"
              : contract.paymentTerm === "net-45"
              ? "Net 45"
              : contract.paymentTerm === "upon-receipt"
              ? "Upon receipt"
              : "Net 30"}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--rtm-text-muted)" }}>
            Assigned Rep
          </p>
          <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>
            {contract.assignedRep || "—"}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--rtm-text-muted)" }}>
            Signed Date
          </p>
          <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
            {contract.signedDate
              ? new Date(contract.signedDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "—"}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--rtm-text-muted)" }}>
            Created
          </p>
          <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
            {new Date(contract.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--rtm-text-muted)" }}>
            Originating Proposal
          </p>
          <p className="text-xs font-mono" style={{ color: "var(--rtm-text-muted)" }}>
            {contract.proposalId.slice(0, 18)}…
          </p>
        </div>
      </div>

      {/* Investment summary */}
      {contract.investmentSummary && (
        <div className="px-5 py-3 border-b" style={{ borderColor: "var(--rtm-border)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--rtm-text-muted)" }}>
            Investment Summary
          </p>
          <pre
            className="text-xs whitespace-pre-wrap"
            style={{ color: "var(--rtm-text-secondary)", fontFamily: "inherit" }}
          >
            {contract.investmentSummary}
          </pre>
        </div>
      )}

      {/* Contract Builder seeded with real data */}
      <div style={{ minHeight: 700 }}>
        <ContractBuilderShell
          clientName={contract.clientName}
          preparedBy={contract.assignedRep || "Sales Representative"}
          templateId="standard"
          context={{
            services: contract.services,
            investmentSummary: contract.investmentSummary,
            proposalId: contract.proposalId,
          }}
        />
      </div>
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyContractsState() {
  return (
    <div className="rounded-xl border overflow-hidden mx-1" style={{ borderColor: "var(--rtm-border)" }}>
      <div
        className="px-5 py-4 border-b"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>Contracts</p>
        <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
          No contracts yet. Generate a contract from an accepted proposal.
        </p>
      </div>
      <div className="px-5 py-10 text-center">
        <p className="text-sm font-semibold mb-2" style={{ color: "var(--rtm-text-secondary)" }}>
          No contracts found
        </p>
        <p className="text-xs mb-4" style={{ color: "var(--rtm-text-muted)" }}>
          Open an Accepted proposal on the Proposals page and click <strong>Contract</strong> to generate the first record.
        </p>
        <Link
          href="/sales/proposals"
          className="inline-flex px-4 py-2 rounded-lg font-bold text-sm border"
          style={{ background: "#059669", color: "#fff", borderColor: "#047857" }}
        >
          Go to Proposals →
        </Link>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function SalesContractsPage() {
  const [contracts, setContracts] = React.useState<SalesContractRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedContract, setSelectedContract] = React.useState<SalesContractRecord | null>(null);

  // Load real contract records on mount
  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const records = await fetchAllContracts();
        hydrateContracts(records);
        if (!cancelled) setContracts(records);
      } catch {
        // Store unavailable — show empty state
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

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
          <div className="flex items-center gap-2 flex-wrap">
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: "var(--rtm-text-primary)" }}
            >
              Contract Builder
            </h1>
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border"
              style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#92400E" }}
            >
              Preview — Target State
            </span>
          </div>
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

      {/* Contracts table — real records */}
      {loading ? (
        <div className="px-2 py-4 text-xs" style={{ color: "var(--rtm-text-muted)" }}>
          Loading contracts…
        </div>
      ) : contracts.length === 0 ? (
        <EmptyContractsState />
      ) : (
        <div className="rounded-xl border overflow-hidden mx-1" style={{ borderColor: "var(--rtm-border)" }}>
          <div
            className="px-5 py-4 border-b flex items-center justify-between"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
          >
            <div>
              <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                Contracts
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                Signed contracts are eligible for Request Invoice. Click View to open a
                contract in the builder below.
              </p>
            </div>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
              style={{ background: "#F0FDF4", color: "#15803D", borderColor: "#BBF7D0" }}
            >
              {contracts.length} record{contracts.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table
              className="w-full text-xs"
              style={{ borderCollapse: "collapse", minWidth: "800px" }}
            >
              <thead>
                <tr
                  style={{
                    background: "var(--rtm-bg)",
                    borderBottom: "1px solid var(--rtm-border)",
                  }}
                >
                  {[
                    "Contract #",
                    "Client",
                    "Services",
                    "Monthly Value",
                    "Term",
                    "Signed Date",
                    "Rep",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
                      style={{ color: "var(--rtm-text-muted)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract, i) => {
                  const st = STATUS_STYLES[contract.status];
                  const isSelected = selectedContract?.id === contract.id;
                  return (
                    <tr
                      key={contract.id}
                      style={{
                        borderBottom: "1px solid var(--rtm-border-light)",
                        background: isSelected
                          ? "#F0FDF4"
                          : i % 2 === 0
                          ? "transparent"
                          : "var(--rtm-surface)",
                      }}
                    >
                      <td
                        className="px-4 py-3 font-mono font-semibold"
                        style={{ color: "var(--rtm-text-primary)" }}
                      >
                        {contract.contractNumber}
                      </td>
                      <td
                        className="px-4 py-3 font-semibold"
                        style={{ color: "var(--rtm-text-primary)" }}
                      >
                        {contract.clientName}
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{ color: "var(--rtm-text-secondary)" }}
                      >
                        {contract.services.slice(0, 3).join(", ")}
                        {contract.services.length > 3
                          ? ` +${contract.services.length - 3}`
                          : ""}
                      </td>
                      <td
                        className="px-4 py-3 font-bold"
                        style={{ color: "#059669" }}
                      >
                        {contract.monthlyValue}
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap"
                        style={{ color: "var(--rtm-text-muted)" }}
                      >
                        {contract.termLength}
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap"
                        style={{ color: "var(--rtm-text-muted)" }}
                      >
                        {contract.signedDate
                          ? new Date(contract.signedDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{ color: "var(--rtm-text-secondary)" }}
                      >
                        {contract.assignedRep}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                          style={{
                            background: st.bg,
                            color: st.text,
                            borderColor: st.border,
                          }}
                        >
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          {contract.status === "signed" && (
                            <RequestInvoiceButton
                              contractId={contract.id}
                              contract={contract}
                            />
                          )}
                          <button
                            onClick={() =>
                              setSelectedContract(
                                isSelected ? null : contract
                              )
                            }
                            className="text-xs font-semibold px-2 py-1 rounded-lg border transition-all hover:opacity-80"
                            style={{
                              background: isSelected ? "#2563EB" : "var(--rtm-bg)",
                              color: isSelected ? "#fff" : "var(--rtm-text-secondary)",
                              borderColor: isSelected ? "#1D4ED8" : "var(--rtm-border)",
                            }}
                          >
                            {isSelected ? "Close" : "View"}
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
      )}

      {/* Contract detail + builder — shown when a row is selected */}
      {selectedContract && (
        <div className="mx-1">
          <ContractDetailPanel
            contract={selectedContract}
            onClose={() => setSelectedContract(null)}
          />
        </div>
      )}

      {/* Default Contract Builder — shown when no row is selected and there are contracts */}
      {!selectedContract && contracts.length > 0 && (
        <div
          className="rounded-xl border overflow-hidden flex-1 mx-1"
          style={{
            borderColor: "var(--rtm-border)",
            background: "var(--rtm-surface)",
            minHeight: 700,
          }}
        >
          <div
            className="px-5 py-3 border-b"
            style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}
          >
            <p className="text-xs font-bold" style={{ color: "var(--rtm-text-muted)" }}>
              Select a row above to open a contract in the builder, or use the builder below for a new draft.
            </p>
          </div>
          <ContractBuilderShell
            clientName="New Client"
            preparedBy="Sales Representative"
            templateId="standard"
          />
        </div>
      )}

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
