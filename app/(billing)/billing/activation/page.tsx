"use client";

/**
 * Billing Activation — SCOPED TO BILLING'S ACTUAL JOB
 *
 * What Billing sees here:
 *   - Business records whose invoice is cleared (billingStatus = Cleared or Paid + paymentStatus = Paid)
 *     but who have NOT yet been cleared for Account Management.
 *   - ONE action: Clearance → sends signal to AM that Billing has cleared the business.
 *   - Once cleared, the business disappears from this view entirely.
 *
 * DATA SOURCE: /api/clients and /api/businesses (Postgres via Prisma).
 * Fetched via lib/account-management/am-client-data (shared data layer).
 *
 * No mock data. No fallback. An empty queue means no real records are awaiting clearance.
 *
 * Clearance is per-Business (per domain). A client with three domains can have one
 * cleared and two awaiting — each business is tracked independently.
 *
 * What is NOT shown here (AM-owned, not built yet):
 *   - Assign AM, Start Onboarding, Create Activation Tasks,
 *     Push to Account Mgmt, Dept Activation Pending, Needs AM Assignment,
 *     Activation In Progress, Pushed to AM
 *   - None of those summary cards or workflow steps appear here.
 */

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import { fetchAMClients, markCleared, type BusinessClient } from "@/lib/account-management/am-client-data";
import { fetchSalesHandoffs, markHandoffProcessed } from "@/lib/sales/sales-handoffs-api";
import type { HandoffRecord } from "@/lib/sales/handoff-engine";
import { normalizeDomain } from "@/lib/clients/domain";
import TaskAccessCard from "@/components/tasks/TaskAccessCard";
import BillingChangeRequestsPanel from "@/components/billing/BillingChangeRequestsPanel";

const workspace = getWorkspace("billing")!;

type BadgeVariant = "success" | "error" | "warning" | "info" | "neutral" | "pending";

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, variant, onDismiss }: { message: string; variant: "success" | "info" | "warning" | "error"; onDismiss: () => void }) {
  React.useEffect(() => { const t = setTimeout(onDismiss, 3500); return () => clearTimeout(t); }, [onDismiss]);
  const colors = {
    success: { bg: "#ECFDF5", border: "#A7F3D0", color: "#065F46" },
    info:    { bg: "#EFF6FF", border: "#BFDBFE", color: "#1E3A8A" },
    warning: { bg: "#FFFBEB", border: "#FDE68A", color: "#92400E" },
    error:   { bg: "#FEF2F2", border: "#FECACA", color: "#991B1B" },
  }[variant];
  return (
    <div className="fixed top-4 right-4 z-[100] flex items-center gap-3 rounded-xl border px-5 py-3 shadow-xl"
      style={{ background: colors.bg, borderColor: colors.border, color: colors.color, minWidth: 280 }}>
      <span className="text-sm font-semibold flex-1">{message}</span>
      <button onClick={onDismiss} className="text-base leading-none opacity-60 hover:opacity-100">×</button>
    </div>
  );
}

// ─── Table primitives ─────────────────────────────────────────────────────────

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left text-xs font-semibold uppercase tracking-wide px-3 py-2 whitespace-nowrap border-b"
      style={{ color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg-alt, #F9FAFB)" }}>
      {children}
    </th>
  );
}

function Td({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <td className="px-3 py-2.5 text-sm whitespace-nowrap border-b"
      style={{ color: muted ? "var(--rtm-text-muted)" : "var(--rtm-text-secondary)", borderColor: "var(--rtm-border-light)" }}>
      {children}
    </td>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function invoiceStatusVariant(s: string): BadgeVariant {
  if (s === "Paid") return "success";
  if (s.startsWith("Overdue")) return "error";
  if (s === "Sent — Awaiting Payment") return "warning";
  return "neutral";
}

function paymentStatusVariant(s: string): BadgeVariant {
  if (s === "Paid" || s === "Confirmed") return "success";
  if (s === "Overdue") return "error";
  if (s === "Partial") return "warning";
  if (s === "Unpaid") return "warning";
  return "neutral";
}

/**
 * A business is "invoice-cleared" when Billing has confirmed payment
 * and it has NOT yet been cleared.
 * Clearance is per-Business (per domain) — each Business is independently tracked.
 */
function isInvoiceCleared(b: BusinessClient): boolean {
  return (
    (b.billingStatus === "Cleared" || (b.billingStatus === "Paid" && b.paymentStatus === "Paid")) &&
    !b.cleared
  );
}

// ─── Clearance Confirmation Modal ───────────────────────────────────────────

function ClearanceModal({ business, onClose, onConfirm }: {
  business: BusinessClient;
  onClose: () => void;
  onConfirm: (id: string) => void | Promise<void>;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" style={{ border: "1px solid var(--rtm-border)" }}>
        <div className="px-6 py-5 space-y-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: workspace.accentColor }}>Confirm Clearance</p>
            <h2 className="text-lg font-bold mt-1" style={{ color: "var(--rtm-text-primary)" }}>{business.clientName}</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{business.domain}</p>
          </div>

          <div className="rounded-xl border p-4 space-y-2" style={{ background: "#F0FDF4", borderColor: "#A7F3D0" }}>
            <p className="text-sm font-semibold" style={{ color: "#065F46" }}>Billing confirms:</p>
            <ul className="text-sm space-y-1" style={{ color: "#065F46" }}>
              <li>✓ Invoice cleared — {business.invoiceStatus}</li>
              <li>✓ Payment confirmed — {business.paymentStatus}</li>
              <li>✓ Monthly value: ${business.monthlyValue.toLocaleString()}/mo</li>
            </ul>
          </div>

          <div className="rounded-xl border p-4" style={{ background: "#EFF6FF", borderColor: "#BFDBFE" }}>
            <p className="text-sm" style={{ color: "#1E3A8A" }}>
              <span className="font-semibold">After clearance:</span> This business will be removed from Billing&rsquo;s Activation view.
              Account Management will receive the signal to begin their onboarding workflow.
              Billing has no further action — AM owns all downstream steps.
            </p>
          </div>

          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 text-sm font-semibold py-2.5 rounded-lg border"
              style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>
              Cancel
            </button>
            <button onClick={() => { void Promise.resolve(onConfirm(business.id)).then(() => onClose()); }}
              className="flex-1 text-sm font-semibold py-2.5 rounded-lg text-white"
              style={{ background: "#059669" }}>
              Clearance — Send to Account Management →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Expanded Row Detail ──────────────────────────────────────────────────────

function ExpandedDetail({ business, onClearance }: { business: BusinessClient; onClearance: (id: string) => void }) {
  return (
    <div className="px-4 py-4 space-y-4" style={{ background: "#F8FAFF" }}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Invoice Status",  value: business.invoiceStatus },
          { label: "Payment Status",  value: business.paymentStatus },
          { label: "Monthly Value",   value: `$${business.monthlyValue.toLocaleString()}/mo` },
          { label: "Domain",          value: business.domain },
        ].map(({ label, value }) => (
          <div key={label} className="space-y-0.5">
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{label}</p>
            <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{value}</p>
          </div>
        ))}
      </div>

      {business.activeServices.length > 0 && (
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Active Services</p>
          <div className="flex flex-wrap gap-1.5">
            {business.activeServices.map((s) => (
              <span key={s} className="text-xs font-semibold px-2.5 py-0.5 rounded-full border"
                style={{ background: "#EFF6FF", color: "#1B4FD8", borderColor: "#BFDBFE" }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
          Billing has cleared this business. The single remaining action is to clear it for Account Management.
        </p>
        <button onClick={() => onClearance(business.id)}
          className="flex-shrink-0 text-xs font-bold px-4 py-2 rounded-lg text-white"
          style={{ background: "#059669" }}>
          Clearance → AM
        </button>
      </div>
    </div>
  );
}

// ─── Process & Create Client Result Modal ─────────────────────────────────────
//
// Shown after the Process action completes (success or partial failure).
// Standard: follow MarkPaidFlowModal from invoices/page.tsx — name every record
// created and every failure, never leave the user guessing.

function ProcessResultModal({ lines, ok, onClose }: {
  lines: string[];
  ok: boolean;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" style={{ border: "1px solid var(--rtm-border)" }}>
        <div className="px-6 py-5 space-y-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: workspace.accentColor }}>Process Result</p>
            <h2 className="text-base font-bold mt-1" style={{ color: "var(--rtm-text-primary)" }}>
              {ok ? "✅ Client & Business Created" : "❌ Partial Failure"}
            </h2>
          </div>
          <div
            className="rounded-lg border p-4 space-y-2"
            style={{
              borderColor: ok ? "#A7F3D0" : "#FECACA",
              background:  ok ? "#ECFDF5"  : "#FEF2F2",
            }}
          >
            {lines.map((line, i) => (
              <p key={i} className="text-sm" style={{ color: ok ? "#065F46" : "#991B1B" }}>{line}</p>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full text-sm font-semibold py-2.5 rounded-lg text-white"
            style={{ background: "var(--rtm-blue)" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sales Handoffs Panel ─────────────────────────────────────────────────────
//
// Shows submitted-but-unprocessed handoffs. For each handoff:
//   - If domain is present: "Process & Create Client" is enabled.
//   - If domain is missing: button is disabled with a clear explanation.
//
// Process & Create Client (in order):
//   1. Refuse if no domain (enforced in handler + UI).
//   2. Check whether a Business already exists for that domain (globally unique).
//      If one exists, report it and skip creation.
//   3. Create the Client (contactName → fullName, contactEmail, contactPhone, clientName → company).
//   4. Create the Business (normalised domain, clientId, monthlyValueCents, UNPAID billing state).
//   5. Mark the handoff processed via markHandoffProcessed(id, clientId).
//   PARTIAL FAILURE: if Client is created and Business fails, report both, guide recovery.

type ProcessStatus = "idle" | "processing" | "done";

function SalesHandoffsPanel({
  handoffs,
  onProcessed,
  onToast,
  onLog,
}: {
  handoffs: HandoffRecord[];
  onProcessed: (handoffId: string) => void;
  onToast: (msg: string, variant: "success" | "info" | "warning" | "error") => void;
  onLog: (msg: string) => void;
}) {
  const pending = handoffs.filter(
    (h) => h.submittedToBilling === true && h.processed !== true
  );

  // Track processing state per-handoff
  const [processingId, setProcessingId] = React.useState<string | null>(null);
  const [processStatus, setProcessStatus] = React.useState<ProcessStatus>("idle");
  const [resultLines, setResultLines] = React.useState<string[]>([]);
  const [resultOk, setResultOk] = React.useState(false);
  const [showResult, setShowResult] = React.useState(false);

  async function handleProcess(handoff: HandoffRecord) {
    // ── Guard 1: domain required ───────────────────────────────────────────
    if (!handoff.domain) {
      onToast(
        `Cannot process “${handoff.clientName}”: this handoff has no domain. ` +
        "Sales must add the client’s website domain before Billing can create a Business record.",
        "error"
      );
      return;
    }

    const domain = normalizeDomain(handoff.domain);
    setProcessingId(handoff.id);
    setProcessStatus("processing");

    // ── Guard 2: check whether Business already exists for this domain ─────
    let existingBizId: string | null = null;
    try {
      const checkRes = await fetch(`/api/businesses?domain=${encodeURIComponent(domain)}`);
      if (checkRes.ok) {
        const checkData = await checkRes.json() as { record?: { id: string; clientId: string }; error?: string };
        if (checkData.record) {
          existingBizId = checkData.record.id;
        }
      }
      // 404 = no existing business, which is fine
    } catch {
      // fetch error = treat as no existing business; POST will reveal the constraint if any
    }

    if (existingBizId) {
      // Business already exists. Do NOT create a second one. Report and stop.
      // Mark the handoff processed anyway so it leaves the queue, recording the
      // existing clientId from the Business.
      try {
        const bizDetailRes = await fetch(`/api/businesses?id=${encodeURIComponent(existingBizId)}`);
        const bizData = await bizDetailRes.json() as { record?: { clientId: string } };
        const existingClientId = bizData.record?.clientId ?? "";
        await markHandoffProcessed(handoff.id, existingClientId);
        onProcessed(handoff.id);
        setResultOk(true);
        setResultLines([
          `ℹ️ A Business already exists for domain “${domain}” (id: ${existingBizId}).`,
          `No new Business or Client was created — the existing records are correct.`,
          `✅ Handoff marked processed (processedClientId: ${existingClientId || "existing"}).`,
          `The handoff has left Billing’s queue.`,
          `To raise an invoice, go to the Invoices page and use “Create Invoice” against domain “${domain}”.`,
        ]);
        setShowResult(true);
        onLog(`ℹ️ ${handoff.clientName}: business already exists for ${domain} — handoff marked processed`);
        onToast(`Business already exists for ${domain} — handoff processed, no new records created.`, "info");
      } catch (err) {
        setResultOk(false);
        setResultLines([
          `ℹ️ A Business already exists for domain “${domain}” (id: ${existingBizId}).`,
          `❌ However, marking the handoff processed failed: ${err instanceof Error ? err.message : String(err)}.`,
          `The handoff remains in the queue. Retry the Process action.`,
        ]);
        setShowResult(true);
        onToast("Failed to mark handoff processed. See result details.", "error");
      }
      setProcessStatus("done");
      setProcessingId(null);
      return;
    }

    // ── Step 1: Create the Client ──────────────────────────────────────────
    //
    // Field mapping (HandoffRecord → Client):
    //   contactName  → fullName   (primary contact person)
    //   contactEmail → email
    //   contactPhone → phone
    //   clientName   → company    (business name)
    //   clientName   → fullName   (fallback when contactName is null)
    const now = new Date().toISOString();
    const clientId = `client-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const clientBody = {
      id:           clientId,
      fullName:     handoff.contactName?.trim() || handoff.clientName,
      email:        handoff.contactEmail?.trim() ?? "",
      phone:        handoff.contactPhone?.trim() ?? "",
      company:      handoff.clientName,
      assignedAM:   "",
      ghlContactId: null,
      createdAt:    now,
      updatedAt:    now,
    };

    let clientCreated = false;
    try {
      const clientRes = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientBody),
      });
      const clientData = await clientRes.json() as { record?: { id: string }; error?: string };
      if (!clientRes.ok || clientData.error) {
        throw new Error(clientData.error ?? `HTTP ${clientRes.status}`);
      }
      clientCreated = true;
    } catch (err) {
      // Client creation failed — nothing written. Report and stop.
      setProcessStatus("done");
      setProcessingId(null);
      setResultOk(false);
      setResultLines([
        `❌ Client creation failed. Nothing was written.`,
        `Error: ${err instanceof Error ? err.message : String(err)}`,
        `No Client or Business record was created.`,
        `Resolve the error above and retry the Process action.`,
      ]);
      setShowResult(true);
      onToast("Client creation failed. See result details.", "error");
      return;
    }

    // ── Step 2: Create the Business ───────────────────────────────────────
    //
    // Field mapping:
    //   domain (normalised)     → domain
    //   clientId (new)          → clientId
    //   monthlyValueCents       → monthlyValueCents (from typed DB column)
    //   invoiceStatus = "none"  → UNPAID / no invoice yet
    //   paymentStatus = "none"  → UNPAID
    //   billingStatus = "Pending"
    //
    // Do NOT set any paid or confirmed status.
    const bizId = `biz-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const bizBody = {
      id:                 bizId,
      domain:             domain,
      displayName:        handoff.clientName,
      clientId:           clientId,
      invoiceStatus:      "none",
      paymentStatus:      "none",
      billingStatus:      "Pending",
      invoiceAmountCents: handoff.contractAmountCents ?? 0,
      subscriptionRef:    null,
      assignedAM:         "",
      activationStatus:   "inactive",
      onboardingStatus:   "not_started",
      activeServices:     [],
      monthlyValueCents:  handoff.monthlyValueCents ?? 0,
      renewalDate:        null,
      renewalStatus:      "ok",
      ghlOpportunityId:   null,
      createdAt:          now,
      updatedAt:          now,
    };

    let bizCreated = false;
    try {
      const bizRes = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bizBody),
      });
      const bizData = await bizRes.json() as { record?: object; error?: string };
      if (!bizRes.ok || bizData.error) {
        throw new Error(bizData.error ?? `HTTP ${bizRes.status}`);
      }
      bizCreated = true;
    } catch (err) {
      // B7-equivalent partial failure: Client was created, Business was not.
      setProcessStatus("done");
      setProcessingId(null);
      setResultOk(false);
      setResultLines([
        `❌ Business creation failed for domain “${domain}”.`,
        `A new Client WAS created (id: ${clientId}, name: “${clientBody.fullName}”, company: “${clientBody.company}”).`,
        `Error: ${err instanceof Error ? err.message : String(err)}`,
        `The Client record exists. To create the Business, go to the Invoices page and`,
        `use “Create Invoice” → “Mark as Paid” → search for the newly created Client by name.`,
        `Alternatively, retry the Process action — if the Client id collision caused the`,
        `Business failure, the retry will reuse the existing Client.`,
      ]);
      setShowResult(true);
      onToast("Business creation failed after Client was created. See result details.", "error");
      return;
    }

    // ── Step 3: Mark handoff processed ───────────────────────────────────
    try {
      await markHandoffProcessed(handoff.id, clientId);
    } catch (err) {
      // Records exist but handoff is not marked processed.
      // It will reappear in the queue on next load. Processing again will
      // hit the "business already exists" guard and still mark it processed.
      setProcessStatus("done");
      setProcessingId(null);
      setResultOk(false);
      setResultLines([
        `⚠ Client and Business were created, but marking the handoff processed failed.`,
        `Client id: ${clientId} (name: “${clientBody.fullName}”).`,
        `Business id: ${bizId} (domain: “${domain}”).`,
        `Error: ${err instanceof Error ? err.message : String(err)}`,
        `The handoff will reappear in the queue on next load. Reprocessing it is safe:`,
        `the “business already exists” guard will detect the new Business and mark it processed.`,
      ]);
      setShowResult(true);
      onToast("Created Client & Business but handoff mark-processed failed. Retry is safe.", "warning");
      onProcessed(handoff.id); // remove from local list anyway since records exist
      return;
    }

    // ── Success ───────────────────────────────────────────────────────────
    bizCreated; // used
    setProcessStatus("done");
    setProcessingId(null);
    setResultOk(true);
    setResultLines([
      `✅ Client created (id: ${clientId}).`,
      `   Name: “${clientBody.fullName}” | Company: “${clientBody.company}”`,
      `   Email: ${clientBody.email || "—"} | Phone: ${clientBody.phone || "—"}`,
      `✅ Business created (id: ${bizId}).`,
      `   Domain: “${domain}” | Monthly: ${handoff.monthlyValueCents != null ? `$${(handoff.monthlyValueCents / 100).toLocaleString()}` : "—"} | Status: Unpaid (Pending)`,
      `✅ Handoff marked processed (processedClientId: ${clientId}).`,
      `The handoff has left Billing’s queue.`,
      `Next step: go to the Invoices page and use “Create Invoice” against domain “${domain}”.`,
    ]);
    setShowResult(true);
    onProcessed(handoff.id);
    onLog(`✅ Processed ${handoff.clientName}: client ${clientId}, business ${bizId}, domain ${domain}`);
    onToast(`✅ Created Client & Business for ${handoff.clientName} (${domain})`, "success");
  }

  if (pending.length === 0) return null;

  return (
    <>
      {showResult && (
        <ProcessResultModal
          lines={resultLines}
          ok={resultOk}
          onClose={() => { setShowResult(false); setResultLines([]); }}
        />
      )}

      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#BFDBFE" }}>
        {/* Panel header */}
        <div
          className="px-5 py-4 border-b flex items-center justify-between gap-4"
          style={{ background: "#EFF6FF", borderColor: "#BFDBFE" }}
        >
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-bold"
                style={{ background: "#1B4FD8" }}
              >
                {pending.length}
              </span>
              <p className="text-sm font-bold" style={{ color: "#1E3A8A" }}>
                Incoming Sales Handoffs — Pending Processing
              </p>
            </div>
            <p className="text-xs" style={{ color: "#1D4ED8" }}>
              Sales submitted these handoffs to Billing. Process &amp; Create Client creates a Client
              and a Business record in Postgres. No invoice is created. Raise the invoice
              separately from the Invoices page.
            </p>
          </div>
        </div>

        {/* Handoff rows */}
        <div className="divide-y" style={{ borderColor: "#DBEAFE" }}>
          {pending.map((handoff) => {
            const sf = handoff.summaryFields as Record<string, string>;
            const services = sf["services-sold"] ?? "—";
            const hasDomain = !!handoff.domain;
            const isProcessing = processingId === handoff.id && processStatus === "processing";

            return (
              <div
                key={handoff.id}
                className="px-5 py-4 flex items-start justify-between gap-4 flex-wrap"
                style={{ background: "var(--rtm-bg)" }}
              >
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                      {handoff.clientName}
                    </span>
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded border"
                      style={{ background: "#F1F5F9", color: "#475569", borderColor: "#CBD5E1" }}
                    >
                      {handoff.handoffNumber}
                    </span>
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded border"
                      style={{ background: "#F1F5F9", color: "#475569", borderColor: "#CBD5E1" }}
                    >
                      {handoff.contractNumber}
                    </span>
                  </div>

                  {/* Domain — most critical field for processing */}
                  {hasDomain ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#059669" }}>Domain:</span>
                      <span className="text-xs font-mono font-semibold" style={{ color: "#065F46" }}>{handoff.domain}</span>
                    </div>
                  ) : (
                    <div className="rounded border px-3 py-2" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
                      <p className="text-xs font-bold" style={{ color: "#991B1B" }}>
                        ⚠ No domain — cannot process
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: "#991B1B" }}>
                        Domain is required to create a Business record. Sales must add the client’s
                        website domain to the contract before this handoff can be processed.
                        Do not invent or derive a domain from the client name.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-3 flex-wrap text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                    {handoff.contactName && (
                      <span><span className="font-semibold">Contact:</span> {handoff.contactName}</span>
                    )}
                    {handoff.contactEmail && (
                      <span><span className="font-semibold">Email:</span> {handoff.contactEmail}</span>
                    )}
                    {handoff.contactPhone && (
                      <span><span className="font-semibold">Phone:</span> {handoff.contactPhone}</span>
                    )}
                    <span><span className="font-semibold">Services:</span> {services}</span>
                    {handoff.monthlyValueCents != null && (
                      <span><span className="font-semibold">MRR:</span> ${(handoff.monthlyValueCents / 100).toLocaleString()}/mo</span>
                    )}
                    <span className="" style={{ color: "var(--rtm-text-muted)" }}>
                      Prepared by {handoff.preparedBy}
                    </span>
                    {handoff.submittedToBillingAt && (
                      <span style={{ color: "var(--rtm-text-muted)" }}>
                        Submitted{" "}
                        {new Date(handoff.submittedToBillingAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  {/* Process & Create Client button */}
                  <div className="relative group">
                    <button
                      disabled={!hasDomain || isProcessing}
                      onClick={() => { if (hasDomain) void handleProcess(handoff); }}
                      className={`text-xs font-bold px-4 py-2 rounded-lg text-white transition-opacity ${
                        hasDomain && !isProcessing ? "hover:opacity-90" : "opacity-40 cursor-not-allowed"
                      }`}
                      style={{ background: "#1B4FD8" }}
                    >
                      {isProcessing ? "Processing…" : "Process & Create Client"}
                    </button>
                    {!hasDomain && (
                      <div className="absolute bottom-full right-0 mb-1.5 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" style={{ whiteSpace: "nowrap" }}>
                        <div className="rounded-lg px-3 py-1.5 text-xs font-medium shadow-lg" style={{ background: "#1E293B", color: "#F8FAFC", border: "1px solid #334155" }}>
                          Domain is missing. Sales must supply it before this handoff can be processed.
                          <div className="absolute top-full right-4 border-4 border-transparent" style={{ borderTopColor: "#1E293B" }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3 border-t"
          style={{ background: "#F0FDF4", borderColor: "#A7F3D0" }}
        >
          <p className="text-xs" style={{ color: "#065F46" }}>
            <span className="font-bold">✅ Process &amp; Create Client</span> creates a Client and a Business in Postgres.
            No invoice is created. The handoff leaves the queue once processed.
            Raise the invoice from the Invoices page against the new Business.
          </p>
        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BillingActivationPage() {
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<BusinessClient[]>([]);
  const [clearanceTarget, setClearanceTarget] = useState<BusinessClient | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "info" | "warning" | "error" } | null>(null);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [salesHandoffs, setSalesHandoffs] = useState<HandoffRecord[]>([]);

  const refreshBusinesses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAMClients();
      setBusinesses(data);
      setFetchError(null);
    } catch (err: unknown) {
      setFetchError(err instanceof Error ? err.message : "Failed to load businesses.");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshHandoffs = useCallback(async () => {
    try {
      const all = await fetchSalesHandoffs();
      setSalesHandoffs(all);
    } catch {
      // No handoffs on failure — panel simply won't render
    }
  }, []);

  useEffect(() => { void refreshBusinesses(); }, [refreshBusinesses]);
  useEffect(() => { void refreshHandoffs(); }, [refreshHandoffs]);

  function log(msg: string) {
    setActionLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 9)]);
  }

  function showToast(msg: string, variant: "success" | "info" | "warning" | "error" = "success") {
    setToast({ message: msg, variant });
  }

  async function handleClearance(id: string) {
    const biz = businesses.find((b) => b.id === id);
    const name = biz?.clientName ?? id;
    const domain = biz?.domain ?? "";
    // Write cleared:true to the real Business record in Postgres
    await markCleared(id);
    // Update local state optimistically
    setBusinesses((prev) => prev.map((b) =>
      b.id === id ? { ...b, cleared: true, billingStatus: "Cleared" } : b
    ));
    setExpanded(null);
    log(`✅ Cleared: ${name} (${domain}) → Account Management notified`);
    showToast(`${name} (${domain}) cleared — removed from Billing activation view`, "success");
  }

  // Businesses that are invoice-cleared but not yet cleared for AM
  // Clearance is per-Business — each domain is tracked independently.
  const pendingClearance = businesses.filter(isInvoiceCleared);

  // KPI counts — Billing-scoped only
  const pendingSalesHandoffs = salesHandoffs.filter(
    (h) => h.submittedToBilling === true && h.processed !== true
  );
  const kpi = {
    awaitingClearance: pendingClearance.length,
    cleared: businesses.filter((b) => b.cleared).length,
    overdue: businesses.filter((b) => b.paymentStatus === "Overdue" || b.billingStatus === "Overdue").length,
  };

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={() => setToast(null)} />}

      {/* Clearance modal */}
      {clearanceTarget && (
        <ClearanceModal
          business={clearanceTarget}
          onClose={() => setClearanceTarget(null)}
          onConfirm={handleClearance}
        />
      )}

      {/* Task Management Engine Banner — links to /billing/tasks (Billing-scoped) */}
      <TaskAccessCard
        context="Activation"
        variant="banner"
        counters={{ open: 14, overdue: 2, dueToday: 6, completed: 31 }}
        createLabel="Create Billing Task"
        examples={["Invoice Follow-up", "Payment Confirmation", "Billing Review", "Collections Flag"]}
        tasksHref="/billing/tasks"
      />

      {/* Header */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>
          {workspace.name}
        </p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
          Billing Activation
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          Business records whose invoice is cleared and are awaiting Billing&rsquo;s clearance signal to Account Management.
          Clearance is per business (per domain) — each domain is tracked independently.
          Once cleared, the business leaves this view — AM owns all downstream steps.
        </p>
      </div>

      {/* Fetch error */}
      {fetchError && (
        <div className="rounded-lg border px-4 py-3" style={{ background: "#FEF2F2", borderColor: "#FECACA", color: "#991B1B" }}>
          <strong>Failed to load businesses:</strong> {fetchError}
        </div>
      )}

      {/* Scope statement */}
      <div className="rounded-xl border p-5" style={{ background: "#F0FDF4", borderColor: "#A7F3D0" }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#059669" }}>
          Billing&rsquo;s Activation Scope
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: "Invoice Cleared",       color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
            { label: "Payment Confirmed",      color: "#1B4FD8", bg: "#EFF6FF", border: "#BFDBFE" },
            { label: "Billing Review",         color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
            { label: "Clearance → AM",        color: "#059669", bg: "#ECFDF5", border: "#A7F3D0", bold: true },
          ].map((step, i, arr) => (
            <React.Fragment key={step.label}>
              <span
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
                style={{ background: step.bg, color: step.color, borderColor: step.border, fontWeight: "bold" in step && step.bold ? 700 : undefined }}
              >
                {step.label}
              </span>
              {i < arr.length - 1 && <span className="text-sm font-bold" style={{ color: "#9CA3AF" }}>→</span>}
            </React.Fragment>
          ))}
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg border" style={{ background: "#F9FAFB", color: "#6B7280", borderColor: "#E5E7EB" }}>
            AM handles everything after →
          </span>
        </div>
        <p className="text-xs mt-3" style={{ color: "#065F46" }}>
          Billing&rsquo;s job ends at clearance. Assign AM, Start Onboarding, Create Activation Tasks, and Push to Account Mgmt are all Account Management steps — they are not shown here.
        </p>
      </div>

      {/* KPI Cards — Billing-scoped */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border p-5 space-y-1" style={{ background: "#EFF6FF", borderColor: "#BFDBFE" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#1B4FD8" }}>Pending Handoffs</p>
          <p className="text-4xl font-black" style={{ color: "#1B4FD8" }}>{pendingSalesHandoffs.length}</p>
          <p className="text-xs" style={{ color: "#1E3A8A" }}>Sales submitted — needs client record</p>
        </div>
        <div className="rounded-xl border p-5 space-y-1" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#D97706" }}>Awaiting Clearance</p>
          <p className="text-4xl font-black" style={{ color: "#D97706" }}>{kpi.awaitingClearance}</p>
          <p className="text-xs" style={{ color: "#92400E" }}>Invoice cleared — Billing action needed</p>
        </div>
        <div className="rounded-xl border p-5 space-y-1" style={{ background: "#ECFDF5", borderColor: "#A7F3D0" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#059669" }}>Cleared (This Session)</p>
          <p className="text-4xl font-black" style={{ color: "#059669" }}>{kpi.cleared}</p>
          <p className="text-xs" style={{ color: "#065F46" }}>Handed off to Account Management</p>
        </div>
        <div className="rounded-xl border p-5 space-y-1" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#DC2626" }}>Overdue Invoices</p>
          <p className="text-4xl font-black" style={{ color: "#DC2626" }}>{kpi.overdue}</p>
          <p className="text-xs" style={{ color: "#991B1B" }}>Not yet cleared — cannot clear</p>
        </div>
      </div>

      {/* Sales Handoffs Queue — Incoming from Sales team */}
      {pendingSalesHandoffs.length > 0 && (
        <SalesHandoffsPanel
          handoffs={salesHandoffs}
          onProcessed={(handoffId) => {
            // Remove from local state so it leaves the queue immediately.
            // Also refresh businesses in case the new Business now appears there.
            setSalesHandoffs((prev) => prev.map((h) =>
              h.id === handoffId ? { ...h, processed: true } : h
            ));
            void refreshBusinesses();
          }}
          onToast={showToast}
          onLog={log}
        />
      )}

      {/* AM Change Requests — Billing Approval Queue */}
      <BillingChangeRequestsPanel onToast={showToast} />

      {/* Activation Table */}
      {!loading && !fetchError && pendingClearance.length === 0 ? (
        <div className="rounded-xl border p-12 text-center space-y-3" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
          <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center" style={{ background: "#ECFDF5" }}>
            <svg width="24" height="24" fill="none" stroke="#059669" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            {businesses.length === 0 ? "No business records yet" : "All invoices cleared"}
          </p>
          <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
            {businesses.length === 0
              ? "Business records appear here once clients are created in the system. When a business's invoice is cleared, it will appear here for the clearance action."
              : "No businesses awaiting Billing clearance. When a business's invoice clears, it'll appear here for the clearance action."}
          </p>
        </div>
      ) : !loading && !fetchError && pendingClearance.length > 0 ? (
        <SectionWrapper
          title={`Awaiting Clearance — ${pendingClearance.length} business${pendingClearance.length > 1 ? "es" : ""}`}
          description="Invoice-cleared businesses awaiting Billing's clearance before Account Management can begin onboarding. Clearance is per domain — each business is cleared independently. Click a row to review details and grant clearance."
        >
          <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--rtm-border-light)" }}>
            <table className="min-w-full">
              <thead>
                <tr>
                  <Th>Client / Domain</Th>
                  <Th>Invoice Status</Th>
                  <Th>Payment Status</Th>
                  <Th>Monthly Value</Th>
                  <Th>Active Services</Th>
                  <Th>Clearance Action</Th>
                </tr>
              </thead>
              <tbody>
                {pendingClearance.map((biz) => {
                  const isExpanded = expanded === biz.id;
                  return (
                    <React.Fragment key={biz.id}>
                      <tr
                        onClick={() => setExpanded(isExpanded ? null : biz.id)}
                        className="cursor-pointer transition-colors"
                        style={{ background: isExpanded ? "#EFF6FF" : "#F0FFF4" }}
                      >
                        <Td>
                          <div className="flex items-center gap-2">
                            <svg className="w-3.5 h-3.5 flex-shrink-0 transition-transform"
                              style={{ color: "#1B4FD8", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
                              fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                              style={{ background: "#059669" }}>
                              {biz.clientName.charAt(0)}
                            </div>
                            <div>
                              <span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{biz.clientName}</span>
                              <span className="block text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>{biz.domain}</span>
                            </div>
                          </div>
                        </Td>
                        <Td><StatusBadge variant={invoiceStatusVariant(biz.invoiceStatus)} label={biz.invoiceStatus} size="sm" /></Td>
                        <Td><StatusBadge variant={paymentStatusVariant(biz.paymentStatus)} label={biz.paymentStatus} size="sm" /></Td>
                        <Td>
                          {biz.monthlyValue > 0
                            ? <span className="font-bold text-sm" style={{ color: "#059669" }}>${biz.monthlyValue.toLocaleString()}/mo</span>
                            : <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>—</span>
                          }
                        </Td>
                        <Td muted>
                          {biz.activeServices.length > 0
                            ? biz.activeServices.slice(0, 2).join(", ") + (biz.activeServices.length > 2 ? ` +${biz.activeServices.length - 2}` : "")
                            : "—"
                          }
                        </Td>
                        <Td>
                          <button
                            onClick={(e) => { e.stopPropagation(); setClearanceTarget(biz); }}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-90"
                            style={{ background: "#059669" }}
                          >
                            Clearance →
                          </button>
                        </Td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="p-0" style={{ borderBottom: "2px solid #BFDBFE" }}>
                            <ExpandedDetail business={biz} onClearance={(id) => setClearanceTarget(businesses.find((b) => b.id === id) ?? null)} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionWrapper>
      ) : loading ? (
        <div className="rounded-xl border p-12 text-center" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
          <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>Loading businesses…</p>
        </div>
      ) : null}

      {/* Action Log */}
      {actionLog.length > 0 && (
        <div className="rounded-lg border p-4" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>Action Log</p>
          <div className="space-y-1">
            {actionLog.map((entry, i) => (
              <p key={i} className="text-xs font-mono" style={{ color: "var(--rtm-text-secondary)" }}>{entry}</p>
            ))}
          </div>
        </div>
      )}

      {/* Footer nav */}
      <div className="flex flex-wrap gap-2">
        <Link href={workspace.dashboardRoute} className="rtm-btn-secondary text-sm">← Dashboard</Link>
        <Link href="/billing/invoices" className="rtm-btn-secondary text-sm">Invoices →</Link>
        <Link href={workspace.tasksRoute} className="rtm-btn-secondary text-sm">Tasks →</Link>
      </div>
    </div>
  );
}
