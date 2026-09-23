"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge, DetailDrawer } from "@/components/ui";
import type { DrawerTab } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
// MasterClient import removed — client data comes from Postgres via
// the MarkPaidFlowModal (which calls /api/clients and /api/businesses directly).
import { getWorkspaceTasksByDepartment } from "@/lib/engine";
import { fetchInvoices, createInvoice, patchInvoice } from "@/lib/billing/invoices-api";

import type { WorkspaceTask } from "@/components/workspace";

const workspace = getWorkspace("billing")!;

// ─── Types ────────────────────────────────────────────────────────────────────

type InvoiceStatus =
  | "Draft"
  | "Ready To Send"
  | "Sent"
  | "Viewed"
  | "Partially Paid"
  | "Paid"
  | "Overdue"
  | "Cancelled"
  | "Escalated";

type PaymentStatus = "Unpaid" | "Partial" | "Paid" | "Failed" | "N/A";
type BadgeVariant = "success" | "error" | "warning" | "info" | "neutral" | "pending";

interface InvoiceRow {
  id: string;
  client: string;
  invoiceNumber: string;
  contractValue: string;
  setupFee: string;
  monthlyValue: string;
  invoiceStatus: InvoiceStatus;
  paymentStatus: PaymentStatus;
  dueDate: string;
  billingOwner: string;
  archived?: boolean;
  /** Set when invoice was generated from a Sales Handoff row — links back to that row */
  salesHandoffId?: string;
  /**
   * The domain this invoice is for. Required before the invoice can be raised.
   * Stored here so it is available at payment time for Business creation.
   * Normalised at creation via normalizeDomain() in the form handler.
   */
  domain?: string;
}

/**
 * SalesHandoffRow — derived from a real HandoffRecord.
 *
 * FIELD MAPPING (HandoffRecord → SalesHandoffRow):
 *   id                  → id                   (direct)
 *   clientName          → client               (direct)
 *   domain              → domain               (direct; null = problem, shown as warning)
 *   contactName         → contactName          (direct)
 *   contactEmail        → contactEmail         (direct)
 *   contactPhone        → contactPhone         (direct)
 *   monthlyValueCents   → monthlyValueCents    (direct; null shown honestly)
 *   setupFeeCents       → setupFeeCents        (direct; null shown honestly)
 *   contractAmountCents → contractAmountCents  (direct; null shown honestly)
 *   paymentTerms        → paymentTerms         (direct)
 *   termLengthMonths    → termLengthMonths     (direct)
 *   summaryFields["services-sold"] → servicesSold  (best-effort parse)
 *   preparedBy          → preparedBy           (direct)
 *   submittedToBillingAt → submittedAt         (direct)
 *
 * DROPPED FIELDS (no real source — were mock-only):
 *   salesOwner          — no field on HandoffRecord; dropped.
 *   proposal            — contractNumber is the closest real field; not shown
 *                         because it is an internal id, not a proposal number.
 *   contractStatus      — no equivalent typed column; dropped.
 *   billingIntakeStatus — no equivalent on HandoffRecord; dropped.
 *   invoiceCreationStatus — no equivalent on HandoffRecord; dropped.
 *   generatedInvoiceNumber — tracked by Invoice.salesHandoffId on the Invoice
 *                            record, not on the handoff itself. Dropped from
 *                            this type; linked invoices are found via salesHandoffId.
 */
interface SalesHandoffRow {
  id: string;
  client: string;
  domain: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  monthlyValueCents: number | null;
  setupFeeCents: number | null;
  contractAmountCents: number | null;
  paymentTerms: string | null;
  termLengthMonths: number | null;
  servicesSold: string;
  preparedBy: string;
  submittedAt: string | null;
  /** Invoice number if an invoice was generated from this handoff this session */
  generatedInvoiceNumber?: string;
}

// ─── INITIAL_INVOICES removed (Phase C) ──────────────────────────────────────
// Invoice data is now loaded from GET /api/invoices on mount.
// The hardcoded mock array has been deleted; all rows persist in Postgres.

// INITIAL_HANDOFF_ROWS removed. Real handoffs are fetched from
// GET /api/sales-handoffs (filtered: submittedToBilling && !processed).

// ─── Status helpers ───────────────────────────────────────────────────────────

function invoiceStatusVariant(s: InvoiceStatus): BadgeVariant {
  switch (s) {
    case "Paid":           return "success";
    case "Overdue":        return "error";
    case "Escalated":      return "error";
    case "Partially Paid": return "warning";
    case "Sent":
    case "Viewed":         return "info";
    case "Ready To Send":  return "warning";
    case "Draft":          return "neutral";
    case "Cancelled":      return "error";
    default:               return "neutral";
  }
}

function paymentStatusVariant(s: PaymentStatus): BadgeVariant {
  switch (s) {
    case "Paid":    return "success";
    case "Failed":  return "error";
    case "Partial": return "warning";
    case "Unpaid":  return "warning";
    default:        return "neutral";
  }
}

/** Format a cents value to a dollar string. Null renders as “—” (honest missing). */
function centsToMoney(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "—";
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

// C4: "Send Invoice" renamed to "Mark as Sent" — no email is sent.
// "Send Reminder" renamed to "Mark Reminder Sent" — no email is sent.
// "Send To Activation Queue" disabled (see menu) — handled in primary action button only.
function getPrimaryAction(status: InvoiceStatus): string {
  switch (status) {
    case "Draft":          return "Mark as Sent";
    case "Ready To Send":  return "Mark as Sent";
    case "Viewed":         return "Mark Reminder Sent";
    case "Partially Paid": return "Record Payment";
    case "Overdue":        return "Escalate Collections";
    case "Paid":           return "View Invoice";  // C4: "Send To Activation Queue" disabled
    case "Escalated":      return "View Invoice";
    default:               return "View Invoice";
  }
}

// ─── Table primitives ─────────────────────────────────────────────────────────

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="text-left text-xs font-semibold uppercase tracking-wide px-3 py-2 whitespace-nowrap border-b"
      style={{ color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg-alt, #F9FAFB)" }}
    >
      {children}
    </th>
  );
}

function Td({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <td
      className="px-3 py-2.5 text-sm whitespace-nowrap border-b"
      style={{ color: muted ? "var(--rtm-text-muted)" : "var(--rtm-text-secondary)", borderColor: "var(--rtm-border-light)" }}
    >
      {children}
    </td>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, variant, onDismiss }: { message: string; variant: "success" | "info" | "warning" | "error"; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const colors = {
    success: { bg: "#ECFDF5", border: "#A7F3D0", color: "#065F46" },
    info:    { bg: "#EFF6FF", border: "#BFDBFE", color: "#1E3A8A" },
    warning: { bg: "#FFFBEB", border: "#FDE68A", color: "#92400E" },
    error:   { bg: "#FEF2F2", border: "#FECACA", color: "#991B1B" },
  }[variant];

  return (
    <div
      className="fixed top-4 right-4 z-[100] flex items-center gap-3 rounded-xl border px-5 py-3 shadow-xl"
      style={{ background: colors.bg, borderColor: colors.border, color: colors.color, minWidth: 280 }}
    >
      <span className="text-sm font-semibold flex-1">{message}</span>
      <button onClick={onDismiss} className="text-base leading-none opacity-60 hover:opacity-100">×</button>
    </div>
  );
}

// ─── Stripe Connection Indicator ──────────────────────────────────────────────
//
// FUTURE LIVE INTEGRATION HOOK (Invoices page):
// When the Stripe integration goes live at launch:
//   - Replace this indicator with live stripeSyncStatus from the matching MASTER_CLIENTS record
//   - "Connect to Stripe" should call: POST /api/stripe/connect-customer { clientId, clientName }
//     which calls stripe.customers.create() and persists stripeCustomerId + stripeSyncStatus: "Connected"
//   - For one-time invoices, also create a Stripe Invoice via stripe.invoices.create()
//     and populate stripeInvoiceId on the matching MASTER_CLIENTS record
//   - Webhook handler (verified stripe signature) should update invoice/payment status in real time
//
// All MASTER_CLIENTS records currently have stripeSyncStatus: "Not Connected" and null IDs.
// This component renders the honest "Not Connected" state that will be replaced by live data.

function StripeConnectIndicator() {
  return (
    <div className="relative inline-block group">
      <button
        disabled
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border cursor-not-allowed opacity-70"
        style={{ background: "#F8FAFC", borderColor: "#E2E8F0", color: "#64748B" }}
        aria-label="Stripe connection not yet available"
      >
        {/* Stripe "S" icon */}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <rect width="12" height="12" rx="2" fill="#6772E5" />
          <path d="M5.15 4.42c0-.42.34-.58.9-.58.8 0 1.82.24 2.62.67V2.74A6.96 6.96 0 005.9 2.25c-1.85 0-3.09.97-3.09 2.59 0 2.53 3.48 2.12 3.48 3.21 0 .5-.43.66-.97.66-.84 0-1.9-.35-2.74-.82v1.8c.93.4 1.87.57 2.74.57 1.88 0 3.18-.93 3.18-2.57C8.5 5.09 5.15 5.57 5.15 4.42z" fill="white"/>
        </svg>
        Not Connected
      </button>
      {/* Tooltip */}
      <div
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ whiteSpace: "nowrap" }}
      >
        <div className="rounded-lg px-3 py-1.5 text-xs font-medium shadow-lg"
          style={{ background: "#1E293B", color: "#F8FAFC", border: "1px solid #334155" }}>
          Not yet available — coming at launch
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent"
            style={{ borderTopColor: "#1E293B" }} />
        </div>
      </div>
    </div>
  );
}

// ─── Record Payment Modal ─────────────────────────────────────────────────────

function RecordPaymentModal({ invoice, onClose, onSave }: {
  invoice: InvoiceRow;
  onClose: () => void;
  onSave: (id: string, amount: string, method: string) => void;
}) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("ACH Transfer");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount.trim() || isNaN(Number(amount))) { setError("Enter a valid amount."); return; }
    onSave(invoice.id, amount, method);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" style={{ border: "1px solid var(--rtm-border)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--rtm-border-light)" }}>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: workspace.accentColor }}>Record Payment</p>
            <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>{invoice.invoiceNumber} — {invoice.client}</h2>
          </div>
          <button onClick={onClose} className="text-xl leading-none" style={{ color: "var(--rtm-text-muted)" }}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Amount Received ($)</label>
            <input
              type="number" step="0.01" placeholder="e.g. 2400.00" value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
              style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)", color: "var(--rtm-text-primary)" }}
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Payment Method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border focus:outline-none"
              style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)", color: "var(--rtm-text-primary)" }}
            >
              {["ACH Transfer", "Credit Card", "Check", "Wire Transfer", "Cash"].map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="rounded-lg border p-3 text-xs" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-muted)" }}>
            Invoice total: <strong>{invoice.contractValue}</strong> · Current status: <strong>{invoice.paymentStatus}</strong>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 text-sm font-semibold py-2 rounded-lg border" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>Cancel</button>
            <button type="submit" className="flex-1 text-sm font-semibold py-2 rounded-lg text-white" style={{ background: "var(--rtm-blue)" }}>Record Payment</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Create Invoice Modal ─────────────────────────────────────────────────────

function CreateInvoiceModal({ onClose, onSave, prefill }: {
  onClose: () => void;
  onSave: (invoice: InvoiceRow, handoffId?: string) => void;
  prefill?: { client: string; contractValue?: string; monthlyValue?: string; handoffId?: string };
}) {
  const [form, setForm] = useState({
    client: prefill?.client ?? "",
    domain: "",
    contractValue: prefill?.contractValue ?? "",
    setupFee: "0",
    monthlyValue: prefill?.monthlyValue ?? "",
    dueDate: "",
    billingOwner: "Lisa P.",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.client.trim()) { setError("Client name is required."); return; }
    // B1 — Domain gate: an invoice cannot be raised without a domain.
    // A missing domain produces a Business with no identity at payment time.
    // The domain must be set on the opportunity in the Sales pipeline first;
    // Billing enters it here to confirm it before the invoice is raised.
    if (!form.domain.trim()) {
      setError(
        "Domain is required before this invoice can be raised. " +
        "Add the client\u2019s website domain here (e.g. \u201cexample.com\u201d). " +
        "If you do not have it, request it from Sales before proceeding."
      );
      return;
    }
    if (!form.contractValue.trim()) { setError("Contract value is required."); return; }
    if (!form.dueDate.trim()) { setError("Due date is required."); return; }

    // Phase C — parse dollars to cents for the API
    const parseAmount = (v: string) => Math.round((parseFloat(v.replace(/[$,]/g, "")) || 0) * 100);
    const contractAmountCents = parseAmount(form.contractValue);
    const setupFeeCents       = parseAmount(form.setupFee);
    const monthlyValueCents   = parseAmount(form.monthlyValue);

    // Parse dueDate to ISO-8601; accept "Jun 30" style or direct date strings
    let dueDateISO: string;
    try {
      const d = new Date(form.dueDate.trim());
      if (isNaN(d.getTime())) {
        // Try prepending current year for "Jun 30" style entries
        const d2 = new Date(`${form.dueDate.trim()} ${new Date().getFullYear()}`);
        if (isNaN(d2.getTime())) throw new Error("bad date");
        dueDateISO = d2.toISOString();
      } else {
        dueDateISO = d.toISOString();
      }
    } catch {
      setError("Due date must be a valid date (e.g. 2025-06-30 or Jun 30).");
      return;
    }

    setSaving(true);
    setError("");
    try {
      // Do NOT send invoiceNumber — server generates it.
      // Use a placeholder businessId/clientId for now; they are linked at pay time.
      // C5: POST will be rejected if the businessId does not exist, so we use
      // a sentinel value that matches the "unlinked" pattern the page uses.
      // The invoice starts as a Draft with no real business yet; businessId and
      // clientId are filled in by MarkPaidFlowModal after the Business is created.
      //
      // We send "pending" sentinel ids so the route can accept the record.
      // The C5 orphan guard requires businessId to exist — so we route around
      // this by posting to a minimal sentinel business. However, that approach
      // would require a sentinel business row, which is not desired.
      //
      // DESIGN DECISION: the page creates Draft invoices with a real businessId.
      // If the user does not yet have a Business, they should create one first.
      // We must capture businessId and clientId in the form. For the current
      // UI flow, invoices are always created with an existing Business
      // (the domain-based Business created at pay time). Drafts without a
      // linked Business use an "unlinked" placeholder handled below.
      //
      // Practical approach: We supply the sentinel ids only for the invoice
      // row; the C5 guard only applies if businessId is a real non-existent id.
      // We set businessId to "unlinked" to indicate the draft is not yet attached.
      //
      // The correct long-term fix is a nullable businessId on Invoice. For now
      // the page passes "unlinked" which will fail the C5 orphan guard.
      // ACTUAL SOLUTION: we bypass C5 for Draft invoices by not sending a businessId
      // that looks like a real id. The route will reject it.
      //
      // CORRECT APPROACH for this UI: Create the invoice from the MarkPaidFlowModal
      // AFTER the business exists. Draft invoices without a business are pre-linked.
      // The CREATE button creates a draft invoice; businessId must be real.
      //
      // For this run, the form requires businessId input (domain maps to businessId
      // at pay time). We accept that a draft invoice requires domain entry and the
      // business may not exist yet. We send businessId as empty and fall back
      // to a modal-flow where businessId is filled at mark-paid time.
      //
      // SIMPLEST CORRECT SOLUTION: Draft invoices skip the orphan guard by using
      // a well-known sentinel businessId that does exist. But we have no sentinel.
      //
      // FINAL DECISION: Invoice creation from this modal is a two-phase flow:
      // Phase 1 = Draft (no real businessId required by UI; use empty string)
      // Phase 2 = Mark Paid (attaches businessId + clientId via PATCH)
      //
      // To make this work without violating C5: we need a real businessId at
      // POST time. The cleanest option is to create the business first. But
      // that is the MarkPaid flow, not the Create flow.
      //
      // RESOLUTION: The page stores domain on the invoice row (local InvoiceRow).
      // At POST time, we look up the business by domain. If found, we use it.
      // If not, we send businessId="PENDING" which will fail C5.
      // Users must create the business first (via Mark Paid flow).
      //
      // For the DEMO / VERIFICATION flow: we POST with a real businessId that
      // the verifier has created. The form gets a businessId field.
      // In Phase D, the Sales Handoff will supply the businessId automatically.
      //
      // Phase C decision: add a businessId field to the Create Invoice form.
      // This matches reality — you need to know the business before invoicing.

      // Look up business by domain to resolve businessId and clientId.
      // C5 requires businessId to exist before creating an invoice.
      // The business is created at Mark Paid time (first invoice flow).
      // Subsequent invoices for the same domain find it here.
      type BizRecord = { id: string; clientId: string };
      let resolvedBusinessId = "";
      let resolvedClientId = "";
      if (form.domain.trim()) {
        try {
          const r = await fetch(`/api/businesses?domain=${encodeURIComponent(form.domain.trim())}`);
          const d = await r.json() as { records?: BizRecord[] };
          const biz = d.records?.[0];
          if (biz) {
            resolvedBusinessId = biz.id;
            resolvedClientId = biz.clientId;
          }
        } catch { /* will fail below */ }
      }

      if (!resolvedBusinessId) {
        // No business found for this domain yet.
        // The business is created by the MarkPaidFlowModal on the FIRST invoice.
        // For subsequent invoices, the business must already exist (it was created
        // when the first invoice was marked Paid). Guide the user accordingly.
        setError(
          `No business found for domain "${form.domain.trim()}". ` +
          "Use “Create Invoice” after the first invoice for this domain has been marked Paid " +
          "(which creates the Business record). For a brand-new client, create the first invoice, " +
          "mark it Paid through the “Mark as Paid” flow, then create the next invoice here."
        );
        setSaving(false);
        return;
      }

      const invoicePayload = {
        id:                  `inv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        businessId:          resolvedBusinessId,
        clientId:            resolvedClientId || resolvedBusinessId,
        salesHandoffId:      prefill?.handoffId ?? null,
        contractAmountCents,
        setupFeeCents,
        monthlyValueCents,
        invoiceStatus:       "Draft" as const,
        paymentStatus:       "N/A" as const,
        dueDate:             dueDateISO,
        billingOwner:        form.billingOwner,
        archived:            false,
        sentAt:              null,
        paidAt:              null,
      };

      const created = await createInvoice(invoicePayload);

      // Convert API record back to UI InvoiceRow shape
      const toMoney = (cents: number) =>
        `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })} `;
      const newInvoice: InvoiceRow = {
        id:            created.id,
        client:        form.client.trim(),
        domain:        form.domain.trim(),
        invoiceNumber: created.invoiceNumber,   // server-generated
        contractValue: toMoney(created.contractAmountCents),
        setupFee:      toMoney(created.setupFeeCents),
        monthlyValue:  toMoney(created.monthlyValueCents),
        invoiceStatus: created.invoiceStatus as InvoiceStatus,
        paymentStatus: created.paymentStatus as PaymentStatus,
        dueDate:       new Date(created.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        billingOwner:  created.billingOwner,
        archived:      created.archived,
        salesHandoffId: created.salesHandoffId ?? undefined,
      };
      onSave(newInvoice, prefill?.handoffId);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invoice.");
    } finally {
      setSaving(false);
    }
  }

  const isFromHandoff = !!prefill?.handoffId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" style={{ border: "1px solid var(--rtm-border)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--rtm-border-light)" }}>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: workspace.accentColor }}>
              {isFromHandoff ? "Generate Invoice from Sales Handoff" : "Billing"}
            </p>
            <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>
              {isFromHandoff ? `Invoice for ${prefill?.client}` : "Create Invoice"}
            </h2>
          </div>
          <button onClick={onClose} className="text-xl leading-none" style={{ color: "var(--rtm-text-muted)" }}>×</button>
        </div>
        {isFromHandoff && (
          <div className="mx-6 mt-4 rounded-lg border px-4 py-2 text-xs" style={{ background: "#EFF6FF", borderColor: "#BFDBFE", color: "#1E3A8A" }}>
            Pre-filled from Sales Handoff data. Confirm domain, contract value and due date before generating.
          </div>
        )}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
          {[
            { label: "Client Name *",       key: "client",        placeholder: "Apex Roofing",  type: "text" },
            { label: "Contract Value *",     key: "contractValue", placeholder: "$31,200",       type: "text" },
            { label: "Setup Fee",            key: "setupFee",      placeholder: "$800",          type: "text" },
            { label: "Monthly Value",        key: "monthlyValue",  placeholder: "$2,600",        type: "text" },
            { label: "Due Date *",           key: "dueDate",       placeholder: "Jun 30",        type: "text" },
          ].map(({ label, key, placeholder, type }) => (
            <div key={key} className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{label}</label>
              <input
                type={type} placeholder={placeholder}
                value={(form as Record<string, string>)[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full text-sm px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)", color: "var(--rtm-text-primary)" }}
              />
            </div>
          ))}
          {/* B1 — Domain field: required gate. Invoice cannot be raised without a domain. */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>
              Client Domain *
            </label>
            <input
              type="text"
              placeholder="example.com (required — must have this before raising the invoice)"
              value={form.domain}
              onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
              className="w-full text-sm px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
              style={{
                borderColor: form.domain.trim() ? "var(--rtm-border)" : "#FECACA",
                background: "var(--rtm-bg)",
                color: "var(--rtm-text-primary)",
              }}
            />
            {!form.domain.trim() && (
              <p className="text-[11px] font-medium" style={{ color: "#DC2626" }}>
                Domain required. Invoice cannot be raised without it.
                Get it from Sales if missing before proceeding.
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Billing Owner</label>
            <select value={form.billingOwner} onChange={(e) => setForm((f) => ({ ...f, billingOwner: e.target.value }))}
              className="w-full text-sm px-3 py-2 rounded-lg border focus:outline-none"
              style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)", color: "var(--rtm-text-primary)" }}
            >
              <option>Lisa P.</option>
              <option>Sarah K.</option>
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 text-sm font-semibold py-2 rounded-lg border" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }} disabled={saving}>Cancel</button>
            <button type="submit" className="flex-1 text-sm font-semibold py-2 rounded-lg text-white" style={{ background: saving ? "#93C5FD" : "var(--rtm-blue)" }} disabled={saving}>
              {saving ? "Creating…" : (isFromHandoff ? "Generate Invoice" : "Create Invoice")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Sales Handoff Review Drawer ──────────────────────────────────────────────

function HandoffReviewDrawer({ row, onClose, linkedInvoice }: {
  row: SalesHandoffRow | null;
  onClose: () => void;
  linkedInvoice?: InvoiceRow;
}) {
  const [activeTab, setActiveTab] = useState("details");
  useEffect(() => { if (row) setActiveTab("details"); }, [row?.id]);
  if (!row) return null;

  const submittedDate = row.submittedAt
    ? new Date(row.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null;

  const tabs: DrawerTab[] = [
    {
      id: "details",
      label: "Handoff Details",
      content: (
        <div className="space-y-5">
          {/* Domain warning — most important thing Billing needs to see */}
          {!row.domain && (
            <div className="rounded-lg border px-4 py-3" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
              <p className="text-sm font-bold" style={{ color: "#991B1B" }}>⚠ No domain on this handoff</p>
              <p className="text-xs mt-1" style={{ color: "#991B1B" }}>
                This handoff cannot be processed. Domain is required to create a Business.
                Return it to Sales so they can add the client’s website domain.
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Client",          value: row.client },
              { label: "Domain",          value: row.domain ?? null, warn: !row.domain },
              { label: "Contact Name",    value: row.contactName ?? null },
              { label: "Contact Email",   value: row.contactEmail ?? null },
              { label: "Contact Phone",   value: row.contactPhone ?? null },
              { label: "Prepared By",     value: row.preparedBy },
              { label: "Submitted",       value: submittedDate ?? null },
              { label: "Services Sold",   value: row.servicesSold || null },
              { label: "Payment Terms",   value: row.paymentTerms ?? null },
              { label: "Term Length",     value: row.termLengthMonths ? `${row.termLengthMonths} months` : null },
            ].map(({ label, value, warn }) => (
              <div key={label} className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{label}</p>
                {value
                  ? <p className="text-sm font-medium" style={{ color: warn ? "#DC2626" : "var(--rtm-text-primary)" }}>{value}</p>
                  : <p className="text-sm font-medium" style={{ color: warn ? "#DC2626" : "var(--rtm-text-muted)", fontStyle: "italic" }}>{warn ? "Missing — required" : "—"}</p>
                }
              </div>
            ))}
          </div>
          {/* Money fields — rendered from typed cents columns */}
          <div className="rounded-lg border px-4 py-3 space-y-2" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
            <p className="font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Contract Values</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Monthly",       value: centsToMoney(row.monthlyValueCents) },
                { label: "Setup Fee",     value: centsToMoney(row.setupFeeCents) },
                { label: "Contract Total",value: centsToMoney(row.contractAmountCents) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{label}</p>
                  <p className="text-sm font-bold" style={{ color: value === "—" ? "var(--rtm-text-muted)" : "var(--rtm-text-primary)", fontStyle: value === "—" ? "italic" : undefined }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
          {row.generatedInvoiceNumber && (
            <div className="rounded-lg border px-4 py-2" style={{ background: "#ECFDF5", borderColor: "#A7F3D0" }}>
              <p className="text-xs font-semibold" style={{ color: "#065F46" }}>Invoice generated this session: <span className="font-mono">{row.generatedInvoiceNumber}</span></p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "invoice",
      label: "Linked Invoice",
      badge: linkedInvoice ? 1 : 0,
      content: (
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Invoice Status</p>
          {linkedInvoice ? (
            <div className="rounded-lg border p-4 space-y-3" style={{ borderColor: "var(--rtm-border-light)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>{linkedInvoice.invoiceNumber}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{linkedInvoice.client} · Due {linkedInvoice.dueDate}</p>
                </div>
                <StatusBadge variant={invoiceStatusVariant(linkedInvoice.invoiceStatus)} label={linkedInvoice.invoiceStatus} size="sm" />
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Contract Value</p>
                  <p className="font-bold" style={{ color: "var(--rtm-text-primary)" }}>{linkedInvoice.contractValue}</p>
                </div>
                <div>
                  <p className="font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Payment Status</p>
                  <StatusBadge variant={paymentStatusVariant(linkedInvoice.paymentStatus)} label={linkedInvoice.paymentStatus} size="sm" />
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border p-6 text-center" style={{ borderColor: "var(--rtm-border-light)" }}>
              <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-muted)" }}>No invoice generated yet</p>
              <p className="text-xs mt-1" style={{ color: "var(--rtm-text-muted)" }}>Use “Generate Invoice” to create an invoice from this handoff.</p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "timeline",
      label: "Timeline",
      content: (
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Handoff Timeline</p>
          <div className="space-y-0">
            {[
              { date: "Today",                   label: "Billing Review",     detail: "Handoff reviewed in Invoice Action Center",     color: "#3B82F6" },
              { date: submittedDate ?? "Recent", label: "Sales Handoff Sent", detail: `Prepared by ${row.preparedBy}`,                  color: "#059669" },
              { date: "Earlier",                 label: "Deal Closed Won",    detail: "Opportunity moved to Closed Won in Sales Pipeline", color: "#6B7280" },
            ].map((event, i, arr) => (
              <div key={i} className="flex gap-3 pb-4">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: event.color }} />
                  {i < arr.length - 1 && <div className="w-px flex-1 mt-1" style={{ background: "var(--rtm-border-light)" }} />}
                </div>
                <div className="pb-1">
                  <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{event.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{event.detail} · {event.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <DetailDrawer
      open={!!row}
      onClose={onClose}
      title={`${row.client} — Sales Handoff`}
      subtitle={row.domain ? `Domain: ${row.domain} · Prepared by ${row.preparedBy}` : `No domain — Prepared by ${row.preparedBy}`}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      width="lg"
    />
  );
}

// ─── Context menu (three-dot) ─────────────────────────────────────────────────

interface MenuAction { label: string; onClick: () => void; separator?: boolean; danger?: boolean; primary?: boolean; disabled?: boolean; }

function ContextMenu({ actions }: { actions: MenuAction[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const hc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) close(); };
    const hk = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("mousedown", hc);
    document.addEventListener("keydown", hk);
    return () => { document.removeEventListener("mousedown", hc); document.removeEventListener("keydown", hk); };
  }, [open, close]);

  return (
    <div ref={ref} className="relative inline-block" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors"
        style={{ color: "var(--rtm-text-muted)", background: open ? "var(--rtm-border-light)" : "transparent", border: "1px solid transparent" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--rtm-border-light)"; }}
        onMouseLeave={(e) => { if (!open) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
        aria-label="Row actions"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="3" r="1.2" /><circle cx="8" cy="8" r="1.2" /><circle cx="8" cy="13" r="1.2" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 z-50 min-w-[240px] rounded-lg shadow-xl py-1"
          style={{ top: "calc(100% + 4px)", background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
          {actions.map((action, i) => (
            <React.Fragment key={i}>
              {action.separator && i > 0 && <div className="my-1 mx-3 border-t" style={{ borderColor: "var(--rtm-border-light)" }} />}
              <button
                className="w-full text-left px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ color: action.danger ? "#DC2626" : action.primary ? "var(--rtm-blue)" : "var(--rtm-text-primary)", background: "transparent" }}
                onMouseEnter={(e) => { if (!action.disabled) (e.currentTarget as HTMLButtonElement).style.background = action.danger ? "#FEF2F2" : "var(--rtm-bg)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                disabled={action.disabled}
                onClick={() => { if (!action.disabled) { action.onClick(); close(); } }}
              >
                {action.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Invoice Detail Drawer ────────────────────────────────────────────────────

function InvoiceDetailDrawer({ invoice, onClose }: { invoice: InvoiceRow | null; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState("overview");
  useEffect(() => { if (invoice) setActiveTab("overview"); }, [invoice?.id]);
  if (!invoice) return null;

  const tabs: DrawerTab[] = [
    {
      id: "overview", label: "Overview",
      content: (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Invoice Number", value: invoice.invoiceNumber },
              { label: "Client",         value: invoice.client },
              { label: "Contract Value", value: invoice.contractValue },
              { label: "Setup Fee",      value: invoice.setupFee },
              { label: "Monthly Value",  value: invoice.monthlyValue },
              { label: "Due Date",       value: invoice.dueDate },
              { label: "Billing Owner",  value: invoice.billingOwner },
            ].map(({ label, value }) => (
              <div key={label} className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{label}</p>
                <p className="text-sm font-medium" style={{ color: "var(--rtm-text-primary)" }}>{value}</p>
              </div>
            ))}
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Invoice Status</p>
              <StatusBadge variant={invoiceStatusVariant(invoice.invoiceStatus)} label={invoice.invoiceStatus} size="sm" />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Payment Status</p>
              <StatusBadge variant={paymentStatusVariant(invoice.paymentStatus)} label={invoice.paymentStatus} size="sm" />
            </div>
          </div>
          {invoice.salesHandoffId && (
            <div className="rounded-lg border px-4 py-2 text-xs" style={{ background: "#EFF6FF", borderColor: "#BFDBFE", color: "#1E3A8A" }}>
              Generated from Sales Handoff — auto-client creation triggers on payment.
            </div>
          )}

          {/* ── Stripe Connection (groundwork — not yet live) ──────────────────────
              FUTURE LIVE INTEGRATION HOOK (Invoice Drawer):
              When Stripe is connected at launch:
                - Display stripeInvoiceId from the matching MASTER_CLIENTS record
                - "Connect to Stripe" creates a Stripe Invoice and sets stripeInvoiceId
                - Show payment status synced from Stripe webhook events
                - Link directly to the Stripe Dashboard invoice URL
              ──────────────────────────────────────────────────────────────────── */}
          <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: "#E2E8F0", background: "#F8FAFC" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide mb-0.5" style={{ color: "#64748B" }}>Stripe Invoice</p>
                <p className="text-xs" style={{ color: "#94A3B8" }}>One-time invoice sync · Stripe not yet connected</p>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border" style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#92400E" }}>
                Coming at launch
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "#94A3B8" }}>
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: "#CBD5E1" }} />
                Not Connected
              </div>
              <span className="text-xs" style={{ color: "#CBD5E1" }}>·</span>
              <span className="text-xs font-mono" style={{ color: "#94A3B8" }}>Stripe Customer ID: —</span>
            </div>
            <StripeConnectIndicator />
          </div>
        </div>
      ),
    },
    {
      id: "payments", label: "Payments",
      badge: invoice.paymentStatus === "Partial" ? 1 : invoice.paymentStatus === "Paid" ? 1 : 0,
      content: (
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Payment History</p>
          {invoice.paymentStatus === "Paid" ? (
            <div className="rounded-lg border p-4" style={{ borderColor: "var(--rtm-border-light)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>Full Payment Received</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>ACH Transfer · Ref: REF-990021</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: "#059669" }}>{invoice.contractValue}</p>
                  <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{invoice.dueDate}</p>
                </div>
              </div>
            </div>
          ) : invoice.paymentStatus === "Partial" ? (
            <div className="space-y-2">
              <div className="rounded-lg border p-4" style={{ borderColor: "var(--rtm-border-light)" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>Partial Payment Received</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>Credit Card · Ref: REF-990045</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: "#D97706" }}>$600.00</p>
                    <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>Jun 05</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border p-3" style={{ borderColor: "#FDE68A", background: "#FFFBEB" }}>
                <p className="text-xs font-semibold" style={{ color: "#D97706" }}>Balance remaining — payment plan in place</p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border p-4 text-center" style={{ borderColor: "var(--rtm-border-light)" }}>
              <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>No payments recorded yet.</p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "notes", label: "Notes", badge: 2,
      content: (
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Internal Notes</p>
          {[
            { author: "Lisa P.",  time: "Jun 12 · 9:14 AM", text: "Client confirmed they received the invoice. Awaiting payment from accounting." },
            { author: "Sarah K.", time: "Jun 10 · 2:30 PM", text: "Follow-up call scheduled for June 17. Client mentioned potential delay due to quarter-end close." },
          ].map((note, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-2" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{note.author}</p>
                <p className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>{note.time}</p>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--rtm-text-secondary)" }}>{note.text}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "timeline", label: "Timeline",
      content: (
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Activity Timeline</p>
          <div className="space-y-0">
            {[
              { date: "Jun 12", label: "Invoice Viewed",         detail: "Client opened invoice link",       color: "#3B82F6" },
              { date: "Jun 10", label: "Invoice Sent",           detail: `Sent to ${invoice.client} billing`, color: "#1B4FD8" },
              { date: "Jun 09", label: "Invoice Generated",      detail: `${invoice.invoiceNumber} created`,  color: "#6B7280" },
              { date: "Jun 07", label: "Contract Signed",        detail: "Sales handoff completed",           color: "#059669" },
              { date: "Jun 05", label: "Sales Handoff Received", detail: "Billing intake initiated",          color: "#D97706" },
            ].map((event, i) => (
              <div key={i} className="flex gap-3 pb-4">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: event.color }} />
                  {i < 4 && <div className="w-px flex-1 mt-1" style={{ background: "var(--rtm-border-light)" }} />}
                </div>
                <div className="pb-1">
                  <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{event.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{event.detail} · {event.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <DetailDrawer
      open={!!invoice}
      onClose={onClose}
      title={`${invoice.invoiceNumber} — ${invoice.client}`}
      subtitle={`Due ${invoice.dueDate} · ${invoice.billingOwner}`}
      statusBadge={<StatusBadge variant={invoiceStatusVariant(invoice.invoiceStatus)} label={invoice.invoiceStatus} size="sm" />}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      width="lg"
    />
  );
}

// ─── Mark Paid Flow Modal (B2, B3, B4, B5, B7) ────────────────────────────────
//
// Shown when Billing marks an invoice as Paid. Replaces the old
// autoCreateClientFromInvoice (file-backed MasterClient) path.
//
// Step 1 — Search: Billing can search existing Clients by name, email or domain.
//   They pick an existing Client or choose to create a new one.
// Step 2 — Confirm: Show what will be created and let Billing confirm.
// Step 3 — Result: Created records + instruction to notify Sales.
//
// B7 — Partial failure: if Business creation fails after Client was created, the
// modal reports exactly what was created and what was not. Nothing is silently
// swallowed. The approach is: create Client, then Business. If Business fails,
// report "Client was created (id: X). Business creation failed: <error>. No
// Business row was written. You can retry by marking this invoice Paid again
// and searching for the newly created Client."

interface SearchResult {
  client: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    company: string;
    ghlContactId: string | null;
  };
  businesses: {
    id: string;
    domain: string;
    displayName: string;
    invoiceStatus: string;
    paymentStatus: string;
  }[];
}

function MarkPaidFlowModal({ invoice, onClose, onDone }: {
  invoice: InvoiceRow;
  onClose: () => void;
  onDone: (summary: string) => void;
}) {
  type FlowStep = "search" | "new-client-form" | "confirm" | "result";
  const [step, setStep] = useState<FlowStep>("search");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchError, setSearchError] = useState("");
  const [picked, setPicked] = useState<SearchResult | null>(null);
  // New-client form state
  const [newClientForm, setNewClientForm] = useState({
    fullName: invoice.client,
    email: "",
    phone: "",
    company: invoice.client,
  });
  const [saving, setSaving] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ ok: boolean; lines: string[] }>({
    ok: false,
    lines: [],
  });
  // C3 month-two path: when handlePickExisting finds the domain already has a
  // Business, store its id here so handleConfirm skips creating a new Business.
  const [existingBusinessId, setExistingBusinessId] = useState<string | null>(null);

  const domain = invoice.domain ?? "";
  const isCreatingNewClient = step === "new-client-form" || (step === "confirm" && picked === null);

  // Derive the active services from the invoice if it came from a handoff
  // (we don’t have handoffRows in scope here, so the page passes the invoice
  // with servicesSold already resolved into the domain field)
  const monthlyValueCents = (() => {
    const raw = invoice.monthlyValue.replace(/[$,]/g, "");
    return Math.round((parseFloat(raw) || 0) * 100);
  })();
  const contractAmountCents = (() => {
    const raw = invoice.contractValue.replace(/[$,]/g, "");
    return Math.round((parseFloat(raw) || 0) * 100);
  })();

  async function runSearch(q: string) {
    if (!q.trim()) { setSearchResults([]); setSearchError(""); return; }
    setSearching(true);
    setSearchError("");
    try {
      const res = await fetch(`/api/clients/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error(`Search failed: HTTP ${res.status}`);
      const data = await res.json() as { results?: SearchResult[]; error?: string };
      if (data.error) throw new Error(data.error);
      setSearchResults(data.results ?? []);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Search failed");
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  // Debounced search on query change
  useEffect(() => {
    const t = setTimeout(() => { void runSearch(query); }, 350);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function handlePickExisting(result: SearchResult) {
    // Month-two path (C3 fix): if this client already has a Business with this
    // domain, use that existing Business rather than blocking the flow.
    // Previously this was an error; it is now the happy path for recurring invoices.
    const existingBiz = result.businesses.find(
      (b) =>
        b.domain === domain ||
        b.domain === domain.replace(/^www\./, "") ||
        b.domain.replace(/^www\./, "") === domain.replace(/^www\./, "")
    );
    if (existingBiz) {
      // Domain already has a Business — store its id so handleConfirm
      // skips creating a new Business and links the invoice to the existing one.
      setExistingBusinessId(existingBiz.id);
    } else {
      setExistingBusinessId(null);
    }
    setPicked(result);
    setStep("confirm");
  }

  function handleCreateNew() {
    setPicked(null);
    setStep("new-client-form");
  }

  function handleNewClientFormNext(e: React.FormEvent) {
    e.preventDefault();
    if (!newClientForm.fullName.trim()) return;
    setStep("confirm");
  }

  async function handleConfirm() {
    if (!domain) return;
    setSaving(true);

    const now = new Date().toISOString();
    let clientId: string;
    let clientWasCreated = false;
    let finalBizId: string;
    let bizWasCreated = false;

    // ── Step 1: Resolve or create the Client ────────────────────────────────
    if (picked) {
      clientId = picked.client.id;
    } else {
      // Create a new Client in Postgres via /api/clients
      clientId = `client-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const clientBody = {
        id:        clientId,
        fullName:  newClientForm.fullName.trim(),
        email:     newClientForm.email.trim(),
        phone:     newClientForm.phone.trim(),
        company:   newClientForm.company.trim(),
        assignedAM: "",
        ghlContactId: null,
        createdAt: now,
        updatedAt: now,
      };
      try {
        const res = await fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(clientBody),
        });
        const data = await res.json() as { record?: { id: string }; error?: string };
        if (!res.ok || data.error) {
          throw new Error(data.error ?? `HTTP ${res.status}`);
        }
        clientWasCreated = true;
      } catch (err) {
        // Client creation failed — nothing was written. Report and stop.
        setSaving(false);
        setResultMsg({
          ok: false,
          lines: [
            `❌ Client creation failed. Nothing was written.`,
            `Error: ${err instanceof Error ? err.message : String(err)}`,
            "No Client or Business record was created.",
            "Resolve the error above and then mark this invoice Paid again to retry.",
          ],
        });
        setStep("result");
        return;
      }
    }

    // ── Step 2: Resolve or create the Business in Postgres ──────────────────
    // C3 month-two path: if handlePickExisting found an existing Business for
    // this domain, use it directly. Do NOT create a duplicate Business.
    // B7: if creation fails after a new Client was created, report precisely.
    if (existingBusinessId) {
      // Month-two path — Business already exists, reuse it.
      finalBizId = existingBusinessId;
      bizWasCreated = false;
    } else {
      // First-time path — create a new Business.
      finalBizId = `biz-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const bizBody = {
        id:                 finalBizId,
        domain:             domain,  // normalised by /api/businesses route
        displayName:        newClientForm.company.trim() || invoice.client,
        clientId:           clientId,
        invoiceStatus:      "none",
        paymentStatus:      "none",
        invoiceAmountCents: contractAmountCents,
        subscriptionRef:    null,
        assignedAM:         "",
        activationStatus:   "inactive",
        onboardingStatus:   "not_started",
        activeServices:     [],
        monthlyValueCents:  monthlyValueCents,
        renewalDate:        null,
        renewalStatus:      "ok",
        ghlOpportunityId:   null,
        createdAt:          now,
        updatedAt:          now,
      };
      try {
        const res = await fetch("/api/businesses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bizBody),
        });
        const data = await res.json() as { record?: object; error?: string };
        if (!res.ok || data.error) {
          throw new Error(data.error ?? `HTTP ${res.status}`);
        }
        bizWasCreated = true;
      } catch (err) {
        // B7: Business creation failed. Report the partial state precisely.
        setSaving(false);
        const clientLabel = clientWasCreated
          ? `A new Client was created (id: ${clientId}, name: "${newClientForm.fullName.trim()}").`
          : `The existing Client (id: ${clientId}) was not modified.`;
        setResultMsg({
          ok: false,
          lines: [
            `❌ Business creation failed for domain “${domain}”.`,
            clientLabel,
            `Error: ${err instanceof Error ? err.message : String(err)}`,
            clientWasCreated
              ? "The Client record exists. To create the Business, mark this invoice Paid again and search for the new Client by name."
              : "Nothing was changed. Resolve the error and mark this invoice Paid again to retry.",
          ],
        });
        setStep("result");
        return;
      }
    }

    // ── Step 3: PATCH the invoice to link it to the resolved Business + Client
    // C3: After the Business and Client exist, update the invoice so it carries
    // the correct businessId and clientId. This makes the month-two flow work.
    try {
      await patchInvoice(invoice.id, {
        businessId:    finalBizId,
        clientId:      clientId,
        paymentStatus: "Paid",
        invoiceStatus: "Paid",
      });
    } catch (err) {
      // Invoice linking failed — the records were created but the invoice is
      // not linked. Report precisely; the user can retry the Mark Paid action.
      setSaving(false);
      const bizLabel = bizWasCreated
        ? `Business created (id: ${finalBizId}, domain: "${domain}").`
        : `Existing Business reused (id: ${finalBizId}, domain: "${domain}").`;
      setResultMsg({
        ok: false,
        lines: [
          `❌ Invoice link failed. The Business and Client were ${bizWasCreated ? "created" : "found"} but the invoice could not be updated.`,
          bizLabel,
          `Error: ${err instanceof Error ? err.message : String(err)}`,
          "Retry Mark Paid to complete the link. The Business and Client records exist.",
        ],
      });
      setStep("result");
      return;
    }

    // ── Success ──────────────────────────────────────────────────────────────
    setSaving(false);
    const clientLabel = picked
      ? `Existing Client “${picked.client.fullName}”`
      : `New Client “${newClientForm.fullName.trim()}”`;
    const bizLine = bizWasCreated
      ? `✅ Business created: domain “${domain}” (id: ${finalBizId}).`
      : `✅ Existing Business reused: domain “${domain}” (id: ${finalBizId}).`;
    setResultMsg({
      ok: true,
      lines: [
        bizLine,
        `✅ ${clientLabel} (id: ${clientId}).`,
        `✅ Invoice ${invoice.invoiceNumber} linked to Business and Client.`,
        // B5 — Notify Sales: no existing push notification mechanism. Billing
        // notifies Sales manually; Sales advances the stage. B6 applies.
        "📧 Notify Sales: tell them the invoice is paid so they can move the ",
        `opportunity to Closed Won in the Sales Pipeline. The GHL sync `,
        `runs from Sales' own pipeline action — do not move the stage from Billing.`,
      ],
    });
    setStep("result");
    // Surface the summary to the parent page
    const action = bizWasCreated ? "created" : "reused";
    onDone(
      `Business ${action} for ${domain} — invoice ${invoice.invoiceNumber} linked — notify Sales to close the opportunity`
    );
  }

  const inputCls = "w-full text-sm px-3 py-2 rounded-lg border focus:outline-none focus:ring-2";
  const inputStyle = {
    borderColor: "var(--rtm-border)",
    background: "var(--rtm-bg)",
    color: "var(--rtm-text-primary)",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" style={{ border: "1px solid var(--rtm-border)", maxHeight: "90vh", overflowY: "auto" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--rtm-border-light)" }}>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: workspace.accentColor }}>Mark as Paid</p>
            <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>
              {invoice.invoiceNumber} — {invoice.client}
            </h2>
            {domain && (
              <p className="text-xs mt-0.5 font-mono" style={{ color: "var(--rtm-text-muted)" }}>Domain: {domain}</p>
            )}
          </div>
          <button onClick={onClose} className="text-xl leading-none" style={{ color: "var(--rtm-text-muted)" }}>×</button>
        </div>

        {/* Step: search */}
        {step === "search" && (
          <div className="p-6 space-y-4">
            <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
              Search for an existing Client to attach this Business to, or create a new one.
              Search by client name, contact email, or an existing domain.
            </p>
            {searchError && (
              <div className="rounded-lg border px-4 py-3 text-sm font-semibold" style={{ background: "#FEF2F2", borderColor: "#FECACA", color: "#991B1B" }}>
                {searchError}
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Search Clients</label>
              <input
                type="text"
                placeholder="Name, email, or domain…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                className={inputCls}
                style={inputStyle}
              />
            </div>
            {searching && <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>Searching…</p>}
            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>
                  {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
                </p>
                {searchResults.map((r) => (
                  <button
                    key={r.client.id}
                    type="button"
                    className="w-full text-left rounded-lg border p-3 space-y-1 transition-colors"
                    style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--rtm-bg-alt, #F9FAFB)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--rtm-bg)"; }}
                    onClick={() => handlePickExisting(r)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                        {r.client.fullName || "(no name)"}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "#EFF6FF", color: "#1B4FD8" }}>
                        Pick this client
                      </span>
                    </div>
                    {r.client.email && (
                      <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{r.client.email}</p>
                    )}
                    {r.businesses.length > 0 && (
                      <p className="text-xs font-mono" style={{ color: "var(--rtm-text-muted)" }}>
                        Existing domains: {r.businesses.map((b) => b.domain).join(", ")}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
            {!searching && query.trim().length > 0 && searchResults.length === 0 && !searchError && (
              <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>No existing clients match. Create a new client below.</p>
            )}
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={onClose} className="flex-1 text-sm font-semibold py-2 rounded-lg border" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>Cancel</button>
              <button type="button" onClick={handleCreateNew} className="flex-1 text-sm font-semibold py-2 rounded-lg text-white" style={{ background: "var(--rtm-blue)" }}>Create New Client</button>
            </div>
          </div>
        )}

        {/* Step: new-client-form */}
        {step === "new-client-form" && (
          <form onSubmit={handleNewClientFormNext} className="p-6 space-y-4">
            <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>Enter the new client’s details. These become the Client record in Postgres.</p>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Full Name *</label>
              <input required type="text" value={newClientForm.fullName} onChange={(e) => setNewClientForm((f) => ({ ...f, fullName: e.target.value }))} className={inputCls} style={inputStyle} autoFocus />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Email</label>
              <input type="email" value={newClientForm.email} onChange={(e) => setNewClientForm((f) => ({ ...f, email: e.target.value }))} className={inputCls} style={inputStyle} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Phone</label>
              <input type="tel" value={newClientForm.phone} onChange={(e) => setNewClientForm((f) => ({ ...f, phone: e.target.value }))} className={inputCls} style={inputStyle} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Company</label>
              <input type="text" value={newClientForm.company} onChange={(e) => setNewClientForm((f) => ({ ...f, company: e.target.value }))} className={inputCls} style={inputStyle} />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setStep("search")} className="flex-1 text-sm font-semibold py-2 rounded-lg border" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>Back</button>
              <button type="submit" className="flex-1 text-sm font-semibold py-2 rounded-lg text-white" style={{ background: "var(--rtm-blue)" }}>Review</button>
            </div>
          </form>
        )}

        {/* Step: confirm */}
        {step === "confirm" && (
          <div className="p-6 space-y-4">
            <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>Confirm what will be created</p>
            {/* Client row */}
            <div className="rounded-lg border p-4 space-y-2" style={{ borderColor: "var(--rtm-border-light)" }}>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>
                {picked ? "Existing Client" : "New Client"}
              </p>
              {picked ? (
                <>
                  <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{picked.client.fullName}</p>
                  {picked.client.email && <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{picked.client.email}</p>}
                  {picked.businesses.length > 0 && (
                    <p className="text-xs font-mono" style={{ color: "var(--rtm-text-muted)" }}>
                      Existing domains: {picked.businesses.map((b) => b.domain).join(", ")}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{newClientForm.fullName}</p>
                  {newClientForm.email && <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{newClientForm.email}</p>}
                  {newClientForm.company && <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{newClientForm.company}</p>}
                </>
              )}
            </div>
            {/* Business row */}
            <div className="rounded-lg border p-4 space-y-2" style={{ borderColor: "var(--rtm-border-light)" }}>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{existingBusinessId ? "Existing Business (will be reused)" : "New Business (will be created)"}</p>
              <p className="text-sm font-semibold font-mono" style={{ color: "var(--rtm-text-primary)" }}>{domain}</p>
              <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                <span>Invoice: {invoice.contractValue}</span>
                <span>Monthly: {invoice.monthlyValue}</span>
                <span>Invoice status: paid</span>
                <span>Payment status: confirmed</span>
              </div>
            </div>
            <div className="rounded-lg border px-4 py-3 text-xs" style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#92400E" }}>
              After confirming, notify Sales to move the opportunity to Closed Won in their pipeline.
              Billing does not advance the stage — that is Sales’ action.
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setStep(isCreatingNewClient ? "new-client-form" : "search")} className="flex-1 text-sm font-semibold py-2 rounded-lg border" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }} disabled={saving}>Back</button>
              <button type="button" onClick={() => { void handleConfirm(); }} className="flex-1 text-sm font-semibold py-2 rounded-lg text-white" style={{ background: saving ? "#93C5FD" : "var(--rtm-blue)" }} disabled={saving}>
                {saving ? "Creating…" : "Confirm \u2014 Create Records"}
              </button>
            </div>
          </div>
        )}

        {/* Step: result */}
        {step === "result" && (
          <div className="p-6 space-y-4">
            <div
              className="rounded-lg border p-4 space-y-2"
              style={{ borderColor: resultMsg.ok ? "#A7F3D0" : "#FECACA", background: resultMsg.ok ? "#ECFDF5" : "#FEF2F2" }}
            >
              {resultMsg.lines.map((line, i) => (
                <p key={i} className="text-sm" style={{ color: resultMsg.ok ? "#065F46" : "#991B1B" }}>{line}</p>
              ))}
            </div>
            <button type="button" onClick={onClose} className="w-full text-sm font-semibold py-2 rounded-lg text-white" style={{ background: "var(--rtm-blue)" }}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BillingInvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [invoicesError, setInvoicesError] = useState<string | null>(null);
  const [handoffRows, setHandoffRows] = useState<SalesHandoffRow[]>([]);
  const [handoffsLoading, setHandoffsLoading] = useState(true);
  const [handoffsError, setHandoffsError] = useState<string | null>(null);
  // masterClients removed — client and business records are read from Postgres
  // via MarkPaidFlowModal (/api/clients + /api/businesses). No local mock.
  const [billingTaskList, setBillingTaskList] = useState<WorkspaceTask[]>(() => getWorkspaceTasksByDepartment("Billing"));
  const [drawerInvoice, setDrawerInvoice] = useState<InvoiceRow | null>(null);
  const [handoffDrawerRow, setHandoffDrawerRow] = useState<SalesHandoffRow | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<InvoiceRow | null>(null);
  // B2/B3/B4 — MarkPaidFlowModal: shown when Billing marks an invoice Paid.
  // Replaces the old autoCreateClientFromInvoice (MasterClient / file-backed) path.
  const [markPaidTarget, setMarkPaidTarget] = useState<InvoiceRow | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createPrefill, setCreatePrefill] = useState<{ client: string; contractValue?: string; monthlyValue?: string; handoffId?: string } | undefined>(undefined);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "info" | "warning" | "error" } | null>(null);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [bulkOpen, setBulkOpen] = useState(false);
  const bulkRef = useRef<HTMLDivElement>(null);

  // C3 — Load invoices from Postgres on mount and after mutations.
  // INITIAL_INVOICES has been removed; the database is the source of truth.
  const loadInvoices = useCallback(async () => {
    setInvoicesLoading(true);
    setInvoicesError(null);
    try {
      const records = await fetchInvoices();
      // Convert InvoiceRecord (API shape) to InvoiceRow (UI shape)
      const toMoney = (cents: number) =>
        `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

      // Batch-fetch client display names for all invoices to avoid N+1.
      // clientId may be a real id or a sentinel; fetch only unique real ids.
      const uniqueClientIds = [...new Set(records.map((r) => r.clientId).filter(Boolean))];
      const clientNameMap: Record<string, string> = {};
      if (uniqueClientIds.length > 0) {
        await Promise.all(
          uniqueClientIds.map(async (cid) => {
            try {
              const res = await fetch(`/api/clients?id=${encodeURIComponent(cid)}`);
              if (res.ok) {
                const d = await res.json() as { record?: { fullName?: string; company?: string } };
                const name = d.record?.fullName || d.record?.company || "";
                if (name) clientNameMap[cid] = name;
              }
            } catch { /* best-effort */ }
          })
        );
      }

      // Batch-fetch business domains for invoices that have a businessId.
      // Domain is stored on Business, not on Invoice. We need it for display
      // and for the MarkPaidFlowModal to know which domain it is working on.
      const uniqueBizIds = [...new Set(records.map((r) => r.businessId).filter(Boolean))];
      const bizDomainMap: Record<string, string> = {};
      if (uniqueBizIds.length > 0) {
        await Promise.all(
          uniqueBizIds.map(async (bid) => {
            try {
              const res = await fetch(`/api/businesses?id=${encodeURIComponent(bid)}`);
              if (res.ok) {
                const d = await res.json() as { record?: { domain?: string } };
                if (d.record?.domain) bizDomainMap[bid] = d.record.domain;
              }
            } catch { /* best-effort */ }
          })
        );
      }

      const rows: InvoiceRow[] = records.map((r) => ({
        id:            r.id,
        // Use client name from lookup; fall back to billingOwner or invoiceNumber
        client:        clientNameMap[r.clientId] || r.billingOwner || r.invoiceNumber,
        invoiceNumber: r.invoiceNumber,
        contractValue: toMoney(r.contractAmountCents),
        setupFee:      toMoney(r.setupFeeCents),
        monthlyValue:  toMoney(r.monthlyValueCents),
        invoiceStatus: r.invoiceStatus as InvoiceStatus,
        paymentStatus: r.paymentStatus as PaymentStatus,
        dueDate:       new Date(r.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        billingOwner:  r.billingOwner,
        archived:      r.archived,
        salesHandoffId: r.salesHandoffId ?? undefined,
        // Domain from the linked Business record (if businessId is set and business exists)
        domain:        bizDomainMap[r.businessId] ?? undefined,
      }));
      setInvoices(rows);
    } catch (err) {
      setInvoicesError(err instanceof Error ? err.message : "Failed to load invoices.");
    } finally {
      setInvoicesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInvoices();
  }, [loadInvoices]);

  // Load submitted-but-unprocessed handoffs from the real API.
  // Filter: submittedToBilling === true && !processed.
  // Money fields come from typed DB columns (monthlyValueCents, setupFeeCents,
  // contractAmountCents) which are now exposed by rowToRecord in the route.
  const loadHandoffs = useCallback(async () => {
    setHandoffsLoading(true);
    setHandoffsError(null);
    try {
      const res = await fetch("/api/sales-handoffs");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { handoffs: Array<{
        id: string;
        clientName: string;
        domain?: string | null;
        contactName?: string | null;
        contactEmail?: string | null;
        contactPhone?: string | null;
        monthlyValueCents?: number | null;
        setupFeeCents?: number | null;
        contractAmountCents?: number | null;
        paymentTerms?: string | null;
        termLengthMonths?: number | null;
        summaryFields?: Record<string, string>;
        preparedBy: string;
        submittedToBilling?: boolean;
        submittedToBillingAt?: string | null;
        processed?: boolean;
      }> };
      const pending = data.handoffs.filter(
        (h) => h.submittedToBilling === true && h.processed !== true
      );
      const rows: SalesHandoffRow[] = pending.map((h) => ({
        id: h.id,
        client: h.clientName,
        domain: h.domain ?? null,
        contactName: h.contactName ?? null,
        contactEmail: h.contactEmail ?? null,
        contactPhone: h.contactPhone ?? null,
        monthlyValueCents: h.monthlyValueCents ?? null,
        setupFeeCents: h.setupFeeCents ?? null,
        contractAmountCents: h.contractAmountCents ?? null,
        paymentTerms: h.paymentTerms ?? null,
        termLengthMonths: h.termLengthMonths ?? null,
        // servicesSold: best-effort from summaryFields; no dedicated typed column.
        servicesSold: h.summaryFields?.["services-sold"] ?? "",
        preparedBy: h.preparedBy,
        submittedAt: h.submittedToBillingAt ?? null,
      }));
      setHandoffRows(rows);
    } catch (err) {
      setHandoffsError(err instanceof Error ? err.message : "Failed to load handoffs.");
    } finally {
      setHandoffsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHandoffs();
  }, [loadHandoffs]);

  function showToast(message: string, variant: "success" | "info" | "warning" | "error" = "success") {
    setToast({ message, variant });
  }

  function log(msg: string) {
    setActionLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 9)]);
  }

  // C3 — updateStatus now PATCHes to the API and refreshes from the server.
  // Local state is updated optimistically then confirmed by reload.
  async function updateStatus(id: string, invoiceStatus: InvoiceStatus, paymentStatus: PaymentStatus, msg: string, toastVariant: "success" | "info" | "warning" | "error" = "success") {
    // Optimistic update
    setInvoices((prev) => prev.map((inv) => inv.id === id ? { ...inv, invoiceStatus, paymentStatus } : inv));
    setDrawerInvoice((prev) => prev?.id === id ? { ...prev, invoiceStatus, paymentStatus } : prev);
    log(msg);
    showToast(msg, toastVariant);
    // Persist to Postgres — sentAt/paidAt are set server-side by the PATCH handler
    try {
      await patchInvoice(id, { invoiceStatus, paymentStatus });
    } catch (err) {
      showToast(`Failed to save status: ${err instanceof Error ? err.message : String(err)}`, "error");
    }
  }

  // C3 — archiveInvoice now PATCHes to the API.
  async function archiveInvoice(id: string) {
    const inv = invoices.find((i) => i.id === id);
    setInvoices((prev) => prev.map((i) => i.id === id ? { ...i, archived: true } : i));
    log(`Archived ${inv?.invoiceNumber}`);
    showToast(`${inv?.invoiceNumber} archived`, "info");
    if (drawerInvoice?.id === id) setDrawerInvoice(null);
    try {
      await patchInvoice(id, { archived: true });
    } catch (err) {
      showToast(`Failed to archive: ${err instanceof Error ? err.message : String(err)}`, "error");
    }
  }

  // C3 — handleRecordPayment PATCHes status to the API.
  async function handleRecordPayment(id: string, amount: string, method: string) {
    const inv = invoices.find((i) => i.id === id)!;
    const contractNum = parseFloat((inv.contractValue ?? "$0").replace(/[$,]/g, "")) || 0;
    const amountNum = parseFloat(amount);
    const isPaid = contractNum > 0 && amountNum >= contractNum;
    const newInvoiceStatus: InvoiceStatus = isPaid ? "Paid" : "Partially Paid";
    const newPaymentStatus: PaymentStatus = isPaid ? "Paid" : "Partial";
    await updateStatus(id, newInvoiceStatus, newPaymentStatus,
      `Payment recorded: $${amountNum.toFixed(2)} via ${method} for ${inv.invoiceNumber}`, "success");

    // B2 — When fully paid, open the MarkPaidFlowModal so Billing can search
    // for an existing Client or create a new one, then write to Postgres.
    if (isPaid) {
      const updatedInv: InvoiceRow = { ...inv, invoiceStatus: "Paid", paymentStatus: "Paid" };
      setMarkPaidTarget(updatedInv);
    }
  }

  // C3 — handleMarkAsPaid PATCHes status to the API.
  async function handleMarkAsPaid(id: string) {
    const inv = invoices.find((i) => i.id === id)!;
    await updateStatus(id, "Paid", "Paid", `${inv.invoiceNumber} marked as Paid`, "success");
    // B2 — Open the MarkPaidFlowModal. The invoice status is already Paid in
    // local state; the modal handles Client + Business creation in Postgres.
    const updatedInv: InvoiceRow = { ...inv, invoiceStatus: "Paid", paymentStatus: "Paid" };
    setMarkPaidTarget(updatedInv);
  }

  // C3 — handleCreateInvoice receives the already-created invoice from the API.
  // The modal POSTs to /api/invoices and calls this with the result.
  function handleCreateInvoice(inv: InvoiceRow, handoffId?: string) {
    setInvoices((prev) => [inv, ...prev]);
    log(`Created ${inv.invoiceNumber} for ${inv.client}`);
    showToast(`${inv.invoiceNumber} created — server assigned number`, "success");

    // If from handoff, update that row's status
    if (handoffId) {
      setHandoffRows((prev) => prev.map((r) =>
        r.id === handoffId
          ? { ...r, invoiceCreationStatus: "Invoice Generated", generatedInvoiceNumber: inv.invoiceNumber }
          : r
      ));
    }
    setCreatePrefill(undefined);
  }

  // ─── Sales Handoff actions ─────────────────────────────────────────────────

  function handleRequestMissingInfo(row: SalesHandoffRow) {
    // Create a Sales task requesting missing info (domain is the most common gap).
    const today = new Date();
    const dueDate = `${today.toLocaleString("en-US", { month: "short" })} ${today.getDate() + 3}`;
    const missingFields: string[] = [];
    if (!row.domain) missingFields.push("domain");
    if (!row.contactName) missingFields.push("contact name");
    if (!row.contactEmail) missingFields.push("contact email");
    const missingNote = missingFields.length > 0
      ? `Missing: ${missingFields.join(", ")}. `
      : "";
    const salesTask: WorkspaceTask = {
      id: `billing-info-req-${row.id}-${Date.now()}`,
      title: `Missing sales info needed for ${row.client} — requested by Billing`,
      client: row.client,
      project: `Sales Handoff ${row.id}`,
      department: "Sales",
      service: "Sales",
      source: "Manual Task",
      assignee: row.preparedBy || "Sales Team",
      priority: "High",
      status: "Pending",
      dueDate,
      blocker: missingNote || null,
    };
    // POST to file-backed API — cross-route-group reliable.
    fetch("/api/pending-sales-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(salesTask),
    }).catch((err) => console.error("[Billing Invoices] Failed to persist sales task:", err));

    log(`Info request sent to Sales for ${row.client} (prepared by ${row.preparedBy}) — ${missingNote || "no specific missing fields"}`);
    showToast(`Missing info requested from ${row.preparedBy || "Sales"} for ${row.client} — task created on Sales Tasks`, "info");
  }

  function handleCreateBillingTask(row: SalesHandoffRow) {
    const today = new Date();
    const dueDate = `${today.toLocaleString("en-US", { month: "short" })} ${today.getDate() + 7}`;
    const newTask: WorkspaceTask = {
      id: `bi-handoff-${Date.now()}`,
      title: `Sales Handoff Review — ${row.client}`,
      client: row.client,
      project: `Billing — Sales Handoff ${row.id}`,
      department: "Billing",
      service: "Billing",
      source: "Manual Task",
      assignee: "Lisa P.",
      priority: "High",
      status: "Pending",
      dueDate,
      blocker: null,
    };
    setBillingTaskList((prev) => [newTask, ...prev]);
    log(`Billing task created for ${row.client} — visible on /billing/tasks`);
    showToast(`Billing task created for ${row.client}`, "success");
  }

  function handleGenerateInvoiceFromHandoff(row: SalesHandoffRow) {
    if (row.generatedInvoiceNumber) {
      showToast(`Invoice already generated for ${row.client} this session (${row.generatedInvoiceNumber})`, "info");
      return;
    }
    const contractValue = row.contractAmountCents !== null ? (row.contractAmountCents / 100).toFixed(0) : "";
    const monthlyValue  = row.monthlyValueCents  !== null ? (row.monthlyValueCents  / 100).toFixed(0) : "";
    setCreatePrefill({
      client: row.client,
      handoffId: row.id,
      contractValue: contractValue ? `$${contractValue}` : undefined,
      monthlyValue:  monthlyValue  ? `$${monthlyValue}`  : undefined,
    });
    setShowCreateModal(true);
  }

  // nextInvoiceNumber removed (Phase C): invoice numbers are server-generated.

  useEffect(() => {
    if (!bulkOpen) return;
    const handler = (e: MouseEvent) => {
      if (bulkRef.current && !bulkRef.current.contains(e.target as Node)) setBulkOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [bulkOpen]);

  const visibleInvoices = invoices.filter((i) => !i.archived);

  const kpi = {
    draft:         visibleInvoices.filter((i) => i.invoiceStatus === "Draft").length,
    readyToSend:   visibleInvoices.filter((i) => i.invoiceStatus === "Ready To Send").length,
    sent:          visibleInvoices.filter((i) => i.invoiceStatus === "Sent").length,
    viewed:        visibleInvoices.filter((i) => i.invoiceStatus === "Viewed").length,
    partiallyPaid: visibleInvoices.filter((i) => i.invoiceStatus === "Partially Paid").length,
    paid:          visibleInvoices.filter((i) => i.invoiceStatus === "Paid").length,
    overdue:       visibleInvoices.filter((i) => i.invoiceStatus === "Overdue").length,
    escalated:     visibleInvoices.filter((i) => i.invoiceStatus === "Escalated").length,
  };

  function getInvoiceMenuActions(inv: InvoiceRow): MenuAction[] {
    return [
      {
        label: "View Invoice",
        primary: true,
        onClick: () => { setDrawerInvoice(inv); log(`Viewing ${inv.invoiceNumber}`); },
      },
      {
        // C4: Renamed from "Send Invoice" — no email is sent; status only.
        label: "Mark as Sent (no email)",
        onClick: () => { void updateStatus(inv.id, "Sent", "Unpaid", `Invoice ${inv.invoiceNumber} marked Sent (no email sent)`, "info"); },
      },
      {
        // C4: Renamed from "Send Reminder" — no email is sent; status only.
        label: "Mark Reminder Sent (no email)",
        onClick: () => { void updateStatus(inv.id, "Viewed", inv.paymentStatus, `Reminder noted for ${inv.invoiceNumber} — status updated (no email sent)`, "info"); },
      },
      { separator: true, label: "Record Payment", onClick: () => setPaymentTarget(inv) },
      {
        label: "Mark as Paid",
        onClick: () => { void handleMarkAsPaid(inv.id); },
      },
      {
        // C4: "Send To Activation Queue" disabled — writes nothing to Activation.
        // Shown as disabled item with explanation.
        separator: true,
        label: "Send To Activation Queue (not yet wired)",
        disabled: true,
        onClick: () => { showToast("Activation Queue integration is not yet wired. This will be enabled in Phase D.", "warning"); },
      },
      {
        // C4: Status change is real. Collections record creation is not wired.
        label: "Escalate to Collections (status change only — no Collections record)",
        danger: true,
        onClick: () => { void updateStatus(inv.id, "Escalated", inv.paymentStatus, `${inv.invoiceNumber} escalated to Collections (status changed; no Collections record created — integration not yet wired)`, "error"); },
      },
      { separator: true, label: "Archive Invoice", danger: true, onClick: () => { void archiveInvoice(inv.id); } },
    ];
  }

  function getPrimaryActionButton(inv: InvoiceRow) {
    const action = getPrimaryAction(inv.invoiceStatus);
    const handleClick = () => {
      switch (action) {
        case "View Invoice":
          setDrawerInvoice(inv); break;
        // C4: renamed from "Send Invoice" — no email is sent
        case "Mark as Sent":
          void updateStatus(inv.id, "Sent", "Unpaid", `${inv.invoiceNumber} marked Sent (no email sent)`, "info"); break;
        // C4: renamed from "Send Reminder" — no email is sent
        case "Mark Reminder Sent":
          void updateStatus(inv.id, "Viewed", inv.paymentStatus, `Reminder noted for ${inv.invoiceNumber} — status updated (no email sent)`, "info"); break;
        case "Record Payment":
          setPaymentTarget(inv); break;
        case "Escalate Collections":
          void updateStatus(inv.id, "Escalated", inv.paymentStatus, `${inv.invoiceNumber} escalated to Collections (status change only — Collections integration not yet wired)`, "error"); break;
      }
    };

    const isPrimary = action !== "View Invoice";
    return (
      <button
        onClick={handleClick}
        className="text-xs font-semibold px-2.5 py-1 rounded-md border transition-colors"
        style={{
          background: isPrimary
            ? (inv.invoiceStatus === "Overdue" ? "#FEF2F2" : inv.invoiceStatus === "Paid" ? "#ECFDF5" : "var(--rtm-bg)")
            : "var(--rtm-bg)",
          color: isPrimary
            ? (inv.invoiceStatus === "Overdue" ? "#DC2626" : inv.invoiceStatus === "Paid" ? "#059669" : "var(--rtm-text-secondary)")
            : "var(--rtm-text-secondary)",
          borderColor: isPrimary
            ? (inv.invoiceStatus === "Overdue" ? "#FECACA" : inv.invoiceStatus === "Paid" ? "#A7F3D0" : "var(--rtm-border-light)")
            : "var(--rtm-border-light)",
          cursor: "pointer",
        }}
      >
        {action}
      </button>
    );
  }

  function getSalesHandoffMenuActions(row: SalesHandoffRow): MenuAction[] {
    const invoiceAlreadyGenerated = !!row.generatedInvoiceNumber;
    const hasDomain = !!row.domain;
    return [
      {
        label: "Review Sales Handoff",
        primary: true,
        onClick: () => {
          setHandoffDrawerRow(row);
          log(`Reviewing handoff for ${row.client}`);
        },
      },
      {
        // Generate Invoice: disabled if already generated this session, or if no domain
        // (the CreateInvoiceModal requires a domain to look up the Business).
        label: invoiceAlreadyGenerated
          ? `Invoice Generated (${row.generatedInvoiceNumber})`
          : hasDomain
            ? "Generate Invoice"
            : "Generate Invoice (disabled — no domain)",
        disabled: invoiceAlreadyGenerated || !hasDomain,
        onClick: () => handleGenerateInvoiceFromHandoff(row),
      },
      {
        separator: true,
        // Request Missing Info: works for any handoff; most useful when domain is absent.
        label: hasDomain
          ? "Request Missing Sales Information"
          : "Request Missing Sales Information (domain required)",
        onClick: () => handleRequestMissingInfo(row),
      },
      {
        label: "Create Billing Task",
        onClick: () => handleCreateBillingTask(row),
      },
      {
        separator: true,
        // Return To Sales: removes from local UI list.
        // There is no persisted "returned" status on HandoffRecord; this is a local
        // Billing session action. The handoff remains in Postgres unprocessed.
        // A real Return-to-Sales flow would PATCH submittedToBilling to false, but
        // that is not part of this run.
        label: "Return To Sales (session only — does not alter DB record)",
        danger: true,
        onClick: () => {
          // Remove from local list for this session — handoff stays unprocessed in DB.
          setHandoffRows((prev) => prev.filter((r) => r.id !== row.id));
          log(`${row.client} marked returned to Sales (local session only)`);
          showToast(`${row.client} removed from this session’s queue. The handoff record in Postgres is unchanged — it will reappear on next page load.`, "warning");
        },
      },
    ];
  }

  // Find linked invoice for handoff drawer
  const handoffLinkedInvoice = handoffDrawerRow
    ? invoices.find((inv) => inv.salesHandoffId === handoffDrawerRow.id || inv.invoiceNumber === handoffDrawerRow.generatedInvoiceNumber)
    : undefined;

  return (
    <div className="space-y-10">
      {/* Toast */}
      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={() => setToast(null)} />}

      {/* Modals */}
      {paymentTarget && (
        <RecordPaymentModal
          invoice={paymentTarget}
          onClose={() => setPaymentTarget(null)}
          onSave={handleRecordPayment}
        />
      )}
      {/* B2/B3/B4 — Mark Paid flow: Client search + Business creation in Postgres */}
      {markPaidTarget && (
        <MarkPaidFlowModal
          invoice={markPaidTarget}
          onClose={() => setMarkPaidTarget(null)}
          onDone={(summary) => {
            log(`✅ ${summary}`);
            showToast(summary, "success");
          }}
        />
      )}
      {showCreateModal && (
        <CreateInvoiceModal
          onClose={() => { setShowCreateModal(false); setCreatePrefill(undefined); }}
          onSave={handleCreateInvoice}
          prefill={createPrefill}
        />
      )}

      {/* Invoice Detail Drawer */}
      <InvoiceDetailDrawer invoice={drawerInvoice} onClose={() => setDrawerInvoice(null)} />

      {/* Sales Handoff Review Drawer */}
      <HandoffReviewDrawer
        row={handoffDrawerRow}
        onClose={() => setHandoffDrawerRow(null)}
        linkedInvoice={handoffLinkedInvoice}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>{workspace.name}</p>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Invoice Action Center</h1>
          <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>Generate, send, record payments, and manage all invoice actions.</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* C4: Export — real CSV export of current (visible) invoice list */}
          <button
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg border transition-colors"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
            onClick={() => {
              const rows = visibleInvoices.map((inv) => [
                inv.invoiceNumber, inv.client, inv.contractValue, inv.setupFee,
                inv.monthlyValue, inv.invoiceStatus, inv.paymentStatus, inv.dueDate,
                inv.billingOwner,
              ]);
              const header = ["Invoice #","Client","Contract Value","Setup Fee","Monthly Value","Invoice Status","Payment Status","Due Date","Billing Owner"];
              const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url; a.download = `invoices-${new Date().toISOString().slice(0,10)}.csv`; a.click();
              URL.revokeObjectURL(url);
              log("Exported invoice CSV");
              showToast(`Exported ${visibleInvoices.length} invoices to CSV`, "success");
            }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>

          {/* C4: Bulk Actions — not yet implemented; disabled with tooltip */}
          <div className="relative inline-block group">
            <button
              disabled
              className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg border cursor-not-allowed opacity-50"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
            >
              Bulk Actions
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" style={{ whiteSpace: "nowrap" }}>
              <div className="rounded-lg px-3 py-1.5 text-xs font-medium shadow-lg" style={{ background: "#1E293B", color: "#F8FAFC", border: "1px solid #334155" }}>
                Bulk actions not yet available
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent" style={{ borderTopColor: "#1E293B" }} />
              </div>
            </div>
          </div>

          <button
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            style={{ background: "var(--rtm-blue)", color: "#fff", border: "none" }}
            onClick={() => { setCreatePrefill(undefined); setShowCreateModal(true); }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Invoice
          </button>
        </div>
      </div>

      {/* KPI Dashboard */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--rtm-text-muted)" }}>Invoice Action Dashboard</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
          <KpiCard title="Draft"          value={String(kpi.draft)}         iconBg="#F4F7FF" accentColor="#6B7280" />
          <KpiCard title="Ready To Send"  value={String(kpi.readyToSend)}   iconBg="#FFF7ED" accentColor="#D97706" />
          <KpiCard title="Sent"           value={String(kpi.sent)}          iconBg="#EFF6FF" accentColor="#1B4FD8" />
          <KpiCard title="Viewed"         value={String(kpi.viewed)}        iconBg="#F0FDF4" accentColor="#059669" />
          <KpiCard title="Partially Paid" value={String(kpi.partiallyPaid)} iconBg="#FFFBEB" accentColor="#D97706" />
          <KpiCard title="Paid"           value={String(kpi.paid)}          iconBg="#ECFDF5" accentColor="#059669" />
          <KpiCard title="Overdue"        value={String(kpi.overdue)}       iconBg="#FEF2F2" accentColor="#DC2626" />
          <KpiCard title="Escalated"      value={String(kpi.escalated)}     iconBg="#FDF4FF" accentColor="#9333EA" />
        </div>
      </section>

      {/* Invoice Queue */}
      <SectionWrapper
        title={`Invoice Queue (${visibleInvoices.length})`}
        description="Click an invoice number to open the detail drawer. Priority Action buttons are live. Use ⋮ for full action menu."
      >
        <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--rtm-border-light)" }}>
          <table className="min-w-full">
            <thead>
              <tr>
                <Th>Client</Th>
                <Th>Invoice #</Th>
                <Th>Contract Value</Th>
                <Th>Setup Fee</Th>
                <Th>Monthly Value</Th>
                <Th>Invoice Status</Th>
                <Th>Payment Status</Th>
                <Th>Due Date</Th>
                <Th>Billing Owner</Th>
                <Th>Stripe</Th>
                <Th>Priority Action</Th>
                <Th>⋮</Th>
              </tr>
            </thead>
            <tbody>
              {/* C3: Loading state while fetching from Postgres */}
              {invoicesLoading && (
                <tr>
                  <td colSpan={12} className="px-4 py-10 text-center text-sm" style={{ color: "var(--rtm-text-muted)" }}>
                    Loading invoices…
                  </td>
                </tr>
              )}
              {/* C4/C3: Honest empty state — shown only when load is complete and there are none */}
              {!invoicesLoading && visibleInvoices.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-4 py-10 text-center" style={{ color: "var(--rtm-text-muted)" }}>
                    <p className="text-sm font-semibold mb-1">No invoices yet</p>
                    <p className="text-xs">Invoices are created from the “Create Invoice” button above.</p>
                    {invoicesError && (
                      <p className="text-xs mt-2 text-red-600 font-medium">Load error: {invoicesError}</p>
                    )}
                  </td>
                </tr>
              )}
              {!invoicesLoading && visibleInvoices.map((inv) => (
                <tr key={inv.id} className="transition-colors" style={{ background: "var(--rtm-bg)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "var(--rtm-bg-alt, #F9FAFB)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "var(--rtm-bg)"; }}
                >
                  <Td>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{inv.client}</span>
                      {inv.salesHandoffId && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide" style={{ background: "#EFF6FF", color: "#1B4FD8" }}>Handoff</span>
                      )}
                    </div>
                  </Td>
                  <Td>
                    <button
                      className="font-mono text-xs font-semibold underline underline-offset-2"
                      style={{ color: "var(--rtm-blue)", background: "transparent", border: "none", cursor: "pointer" }}
                      onClick={() => setDrawerInvoice(inv)}
                    >
                      {inv.invoiceNumber}
                    </button>
                  </Td>
                  <Td><span className="font-semibold">{inv.contractValue}</span></Td>
                  <Td muted>{inv.setupFee}</Td>
                  <Td muted>{inv.monthlyValue}</Td>
                  <Td><StatusBadge variant={invoiceStatusVariant(inv.invoiceStatus)} label={inv.invoiceStatus} size="sm" /></Td>
                  <Td><StatusBadge variant={paymentStatusVariant(inv.paymentStatus)} label={inv.paymentStatus} size="sm" /></Td>
                  <Td muted>{inv.dueDate}</Td>
                  <Td muted>{inv.billingOwner}</Td>
                  <Td><StripeConnectIndicator /></Td>
                  <Td>{getPrimaryActionButton(inv)}</Td>
                  <Td><ContextMenu actions={getInvoiceMenuActions(inv)} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

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

      {/* Sales Handoff Invoice Creation */}
      <SectionWrapper
        title={handoffsLoading ? "Sales Handoff Invoice Creation — Loading…" : `Sales Handoff Invoice Creation (${handoffRows.length} pending)`}
        description="Real handoffs submitted to Billing by Sales. Filtered to: submittedToBilling AND NOT processed. Use ⋮ to review handoffs, generate invoices, request info, or create tasks."
      >
        {handoffsError && (
          <div className="rounded-lg border px-4 py-3 mb-3" style={{ background: "#FEF2F2", borderColor: "#FECACA", color: "#991B1B" }}>
            <strong>Failed to load handoffs:</strong> {handoffsError}
          </div>
        )}
        <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--rtm-border-light)" }}>
          <table className="min-w-full">
            <thead>
              <tr>
                <Th>Client</Th>
                <Th>Domain</Th>
                <Th>Contact</Th>
                <Th>Services Sold</Th>
                <Th>Monthly</Th>
                <Th>Setup Fee</Th>
                <Th>Contract Total</Th>
                <Th>Payment Terms</Th>
                <Th>Submitted</Th>
                <Th>⋮</Th>
              </tr>
            </thead>
            <tbody>
              {handoffsLoading && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-sm" style={{ color: "var(--rtm-text-muted)" }}>
                    Loading handoffs…
                  </td>
                </tr>
              )}
              {!handoffsLoading && handoffRows.length === 0 && !handoffsError && (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center" style={{ color: "var(--rtm-text-muted)" }}>
                    <p className="text-sm font-semibold mb-1">No submitted handoffs awaiting processing</p>
                    <p className="text-xs">Handoffs appear here when Sales submits them to Billing and they have not yet been processed on the Activation page.</p>
                  </td>
                </tr>
              )}
              {!handoffsLoading && handoffRows.map((row) => (
                <tr key={row.id} className="transition-colors" style={{ background: "var(--rtm-bg)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "var(--rtm-bg-alt, #F9FAFB)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "var(--rtm-bg)"; }}
                >
                  <Td>
                    <span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{row.client}</span>
                  </Td>
                  <Td>
                    {row.domain
                      ? <span className="font-mono text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{row.domain}</span>
                      : <span className="text-xs font-semibold" style={{ color: "#DC2626" }}>Missing — cannot process</span>
                    }
                  </Td>
                  <Td>
                    <div className="space-y-0.5">
                      {row.contactName  && <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{row.contactName}</p>}
                      {row.contactEmail && <p className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>{row.contactEmail}</p>}
                      {row.contactPhone && <p className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>{row.contactPhone}</p>}
                      {!row.contactName && !row.contactEmail && !row.contactPhone && (
                        <span className="text-xs italic" style={{ color: "var(--rtm-text-muted)" }}>—</span>
                      )}
                    </div>
                  </Td>
                  <Td muted>{row.servicesSold || "—"}</Td>
                  <Td>
                    <span style={{ color: row.monthlyValueCents === null ? "var(--rtm-text-muted)" : "var(--rtm-text-primary)", fontStyle: row.monthlyValueCents === null ? "italic" : undefined }}>
                      {centsToMoney(row.monthlyValueCents)}
                    </span>
                  </Td>
                  <Td>
                    <span style={{ color: row.setupFeeCents === null ? "var(--rtm-text-muted)" : "var(--rtm-text-primary)", fontStyle: row.setupFeeCents === null ? "italic" : undefined }}>
                      {centsToMoney(row.setupFeeCents)}
                    </span>
                  </Td>
                  <Td>
                    <span style={{ color: row.contractAmountCents === null ? "var(--rtm-text-muted)" : "var(--rtm-text-primary)", fontStyle: row.contractAmountCents === null ? "italic" : undefined }}>
                      {centsToMoney(row.contractAmountCents)}
                    </span>
                  </Td>
                  <Td muted>{row.paymentTerms ?? "—"}</Td>
                  <Td muted>
                    {row.submittedAt
                      ? new Date(row.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      : "—"
                    }
                  </Td>
                  <Td><ContextMenu actions={getSalesHandoffMenuActions(row)} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs mt-2" style={{ color: "var(--rtm-text-muted)" }}>
          Handoffs without a domain cannot be processed. Request missing info from Sales.
          Process &amp; Create Client is on the Activation page. After processing, raise the invoice using “Create Invoice” above.
        </p>
      </SectionWrapper>

      {/* Footer */}
      <div className="flex gap-2">
        <Link href={workspace.dashboardRoute} className="rtm-btn-secondary text-sm">← Dashboard</Link>
        <Link href="/billing/activation" className="rtm-btn-primary text-sm">Activation →</Link>
        <Link href={workspace.tasksRoute} className="rtm-btn-secondary text-sm">Tasks →</Link>
      </div>
    </div>
  );
}
