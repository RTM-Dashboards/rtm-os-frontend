"use client";

/**
 * Billing Activation — SCOPED TO BILLING'S ACTUAL JOB
 *
 * What Billing sees here:
 *   - Clients whose invoice is cleared (billingStatus = Cleared or Paid + paymentStatus = Paid)
 *     but who have NOT yet been cleared for Account Management.
 *   - ONE action: Clearance → sends signal to AM that Billing has cleared the client.
 *   - Once cleared, the client disappears from this view entirely.
 *
 * What is NOT shown here (AM-owned, not built yet):
 *   - Assign AM, Start Onboarding, Create Activation Tasks,
 *     Push to Account Mgmt, Dept Activation Pending, Needs AM Assignment,
 *     Activation In Progress, Pushed to AM
 *   - None of those summary cards or workflow steps appear here.
 *
 * Data source: same master client list (MASTER_CLIENTS) used by Admin › Clients
 * and Billing Client Portfolio — session-state mirrors the shared store.
 */

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import { MASTER_CLIENTS } from "@/lib/mock/master-clients";
import type { MasterClient } from "@/lib/mock/master-clients";
import { apiMarkCleared, fetchMasterClients, upsertMasterClient } from "@/lib/mock/master-clients-api";
import { fetchSalesHandoffs, markHandoffProcessed } from "@/lib/sales/sales-handoffs-api";
import type { HandoffRecord } from "@/lib/sales/handoff-engine";
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
 * A client is "invoice-cleared" when Billing has confirmed payment
 * and they have NOT yet been cleared.
 */
function isInvoiceCleared(c: MasterClient): boolean {
  return (
    (c.billingStatus === "Cleared" || (c.billingStatus === "Paid" && c.paymentStatus === "Paid")) &&
    !c.cleared &&
    c.currentStatus !== "Lead" &&
    c.currentStatus !== "Proposal Sent"
  );
}

// ─── Clearance Confirmation Modal ───────────────────────────────────────────

function ClearanceModal({ client, onClose, onConfirm }: {
  client: MasterClient;
  onClose: () => void;
  onConfirm: (id: string) => void | Promise<void>;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" style={{ border: "1px solid var(--rtm-border)" }}>
        <div className="px-6 py-5 space-y-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: workspace.accentColor }}>Confirm Clearance</p>
            <h2 className="text-lg font-bold mt-1" style={{ color: "var(--rtm-text-primary)" }}>{client.clientName}</h2>
          </div>

          <div className="rounded-xl border p-4 space-y-2" style={{ background: "#F0FDF4", borderColor: "#A7F3D0" }}>
            <p className="text-sm font-semibold" style={{ color: "#065F46" }}>Billing confirms:</p>
            <ul className="text-sm space-y-1" style={{ color: "#065F46" }}>
              <li>✓ Invoice cleared — {client.invoiceStatus}</li>
              <li>✓ Payment confirmed — {client.paymentStatus}</li>
              <li>✓ Monthly value: ${client.monthlyValue.toLocaleString()}/mo</li>
            </ul>
          </div>

          <div className="rounded-xl border p-4" style={{ background: "#EFF6FF", borderColor: "#BFDBFE" }}>
            <p className="text-sm" style={{ color: "#1E3A8A" }}>
              <span className="font-semibold">After clearance:</span> This client will be removed from Billing&rsquo;s Activation view.
              Account Management will receive the signal to begin their onboarding workflow.
              Billing has no further action — AM owns all downstream steps.
            </p>
          </div>

          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 text-sm font-semibold py-2.5 rounded-lg border"
              style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>
              Cancel
            </button>
            <button onClick={() => { void Promise.resolve(onConfirm(client.id)).then(() => onClose()); }}
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

function ExpandedDetail({ client, onClearance }: { client: MasterClient; onClearance: (id: string) => void }) {
  return (
    <div className="px-4 py-4 space-y-4" style={{ background: "#F8FAFF" }}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Invoice Status",  value: client.invoiceStatus },
          { label: "Payment Status",  value: client.paymentStatus },
          { label: "Monthly Value",   value: `$${client.monthlyValue.toLocaleString()}/mo` },
          { label: "Billing Owner",   value: client.billingOwner },
        ].map(({ label, value }) => (
          <div key={label} className="space-y-0.5">
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{label}</p>
            <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{value}</p>
          </div>
        ))}
      </div>

      {client.activeServices.length > 0 && (
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Active Services</p>
          <div className="flex flex-wrap gap-1.5">
            {client.activeServices.map((s) => (
              <span key={s} className="text-xs font-semibold px-2.5 py-0.5 rounded-full border"
                style={{ background: "#EFF6FF", color: "#1B4FD8", borderColor: "#BFDBFE" }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {client.notes && (
        <div className="rounded-lg border p-3" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
          <p className="text-xs font-semibold mb-1" style={{ color: "#92400E" }}>Notes</p>
          <p className="text-sm" style={{ color: "#78350F" }}>{client.notes}</p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
          Billing has cleared this client. The single remaining action is to clear them for Account Management.
        </p>
        <button onClick={() => onClearance(client.id)}
          className="flex-shrink-0 text-xs font-bold px-4 py-2 rounded-lg text-white"
          style={{ background: "#059669" }}>
          Clearance → AM
        </button>
      </div>
    </div>
  );
}

// ─── Sales Handoffs Panel ─────────────────────────────────────────────────────

function buildClientFromHandoff(handoff: HandoffRecord): MasterClient {
  const sf = handoff.summaryFields;
  const clientName = sf["client-name"] ?? handoff.clientName;
  const slug = clientName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const mrrStr = sf["monthly-recurring-revenue"] ?? "";
  const monthlyValue = parseInt(mrrStr.replace(/[^0-9]/g, ""), 10) || 0;
  const services = sf["services-sold"]
    ? sf["services-sold"].split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const assignedAM = sf["assigned-am"] ?? "Unassigned";

  return {
    id: `mc-hof-${handoff.id}`,
    slug,
    clientName,
    email: sf["email"] ?? "",
    industry: sf["industry"] ?? "Unknown",
    avatarColor: "#6366f1",
    // Sales-owned
    salesStatus: "Closed Won",
    salesOwner: handoff.preparedBy,
    // Billing-owned — new client starts pending; Billing still owns invoice/payment gatekeeping
    billingStatus: "Pending",
    invoiceStatus: "Draft",
    paymentStatus: "Unpaid",
    cancellationStatus: "None",
    upgradeDowngradeStatus: "None",
    // MUST be false — Billing must complete invoice/payment gatekeeping before AM's wizard
    cleared: false,
    activeServices: services,
    monthlyValue,
    billingOwner: "Lisa P.",
    // AM-owned (future)
    assignedAM,
    activationStatus: "Not Started",
    onboardingStatus: "Not Started",
    renewalDate: "—",
    renewalStatus: "N/A",
    // Computed defaults
    clientHealth: "Good",
    priority: "Medium",
    currentStatus: "Invoice Sent",
    workflowStatus: "Not Started",
    lastActivity: new Date().toISOString().slice(0, 10),
    nextRequiredAction: "Generate and send invoice",
    notes: `Created from Sales handoff ${handoff.handoffNumber} (${handoff.contractNumber})`,
    activationChecklist: {
      invoicePaid: false,
      billingCleared: false,
      contractConfirmed: true,
      servicesConfirmed: services.length > 0,
      clientContactVerified: true,
      amAssigned: assignedAM !== "Unassigned",
      onboardingRecordCreated: false,
      activationTasksCreated: false,
      kickoffNeeded: true,
      kickoffCallCompleted: false,
    },
    recentEvents: [
      {
        date: new Date().toISOString().slice(0, 10),
        actor: "Billing",
        action: `Client record created from Sales handoff ${handoff.handoffNumber}`,
      },
    ],
    // ── Stripe groundwork (schema only — live wiring deferred to launch) ──────
    // FUTURE LIVE INTEGRATION HOOK: when Stripe goes live, create Stripe Customer here:
    //   const customer = await stripe.customers.create({ email, name: clientName });
    //   stripeCustomerId = customer.id; stripeSyncStatus = "Connected";
    stripeCustomerId: null,
    stripeInvoiceId: null,
    stripeSubscriptionId: null,
    stripeSyncStatus: "Not Connected" as const,
  };
}

function SalesHandoffsPanel({
  handoffs,
  onProcessed,
  onLog,
  onToast,
}: {
  handoffs: HandoffRecord[];
  onProcessed: (handoffId: string, clientId: string) => void;
  onLog: (msg: string) => void;
  onToast: (msg: string, variant: "success" | "info" | "warning" | "error") => void;
}) {
  const [processing, setProcessing] = useState<string | null>(null);

  const pending = handoffs.filter(
    (h) => h.submittedToBilling === true && h.processed !== true
  );

  if (pending.length === 0) return null;

  async function handleProcess(handoff: HandoffRecord) {
    if (processing) return;
    setProcessing(handoff.id);
    try {
      // Reuse Billing's existing exact write path (same as AddClientModal)
      const newClient = buildClientFromHandoff(handoff);
      await upsertMasterClient(newClient);
      // Mark handoff as processed with the resulting clientId
      await markHandoffProcessed(handoff.id, newClient.id);
      onProcessed(handoff.id, newClient.id);
      onLog(`✅ Processed handoff ${handoff.handoffNumber} → client record created (${newClient.id}, cleared: false)`);
      onToast(
        `${handoff.clientName} — client record created. Billing must still issue invoice and clear payment before AM activation.`,
        "success"
      );
    } catch (err) {
      onToast(`Error processing ${handoff.clientName}: ${String(err)}`, "error");
    } finally {
      setProcessing(null);
    }
  }

  return (
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
            Sales submitted these handoffs to Billing. Process each one to create the client
            record. Created records start with <code className="bg-blue-100 px-1 rounded">cleared: false</code> — Billing must still
            issue the invoice and confirm payment before the client becomes eligible for AM
            activation.
          </p>
        </div>
      </div>

      {/* Handoff rows */}
      <div className="divide-y" style={{ borderColor: "#DBEAFE" }}>
        {pending.map((handoff) => {
          const sf = handoff.summaryFields;
          const mrr = sf["monthly-recurring-revenue"] ?? "—";
          const services = sf["services-sold"] ?? "—";
          const isProcessing = processing === handoff.id;

          return (
            <div
              key={handoff.id}
              className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap"
              style={{ background: "var(--rtm-bg)" }}
            >
              <div className="space-y-1 min-w-0">
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
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                    <span className="font-semibold">Services:</span> {services}
                  </span>
                  <span className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                    <span className="font-semibold">MRR:</span> {mrr}
                  </span>
                  <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                    Prepared by {handoff.preparedBy}
                  </span>
                  {handoff.submittedToBillingAt && (
                    <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                      Submitted{" "}
                      {new Date(handoff.submittedToBillingAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => void handleProcess(handoff)}
                disabled={!!processing}
                className="flex-shrink-0 text-xs font-bold px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: "#1B4FD8" }}
              >
                {isProcessing ? "Creating…" : "Process & Create Client"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer notice */}
      <div
        className="px-5 py-3 border-t"
        style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}
      >
        <p className="text-xs" style={{ color: "#92400E" }}>
          <span className="font-bold">⚠ Clearance gatekeeping preserved:</span> Created client records
          start with <code className="bg-yellow-100 px-1 rounded">cleared: false</code>. They will appear in
          Client Portfolio under Billing Status = Pending. Billing must issue the invoice, confirm
          payment, and then grant Clearance before this client appears in AM&rsquo;s Activation Engine.
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BillingActivationPage() {
  // State initialized from seed data, hydrated from file-backed API on mount
  const [clients, setClients] = useState<MasterClient[]>(MASTER_CLIENTS);
  const [clearanceTarget, setClearanceTarget] = useState<MasterClient | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "info" | "warning" | "error" } | null>(null);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [salesHandoffs, setSalesHandoffs] = useState<HandoffRecord[]>([]);

  const refreshClients = useCallback(async () => {
    try {
      const live = await fetchMasterClients();
      setClients(live);
    } catch {
      // Keep seed data on failure
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

  useEffect(() => { void refreshClients(); }, [refreshClients]);
  useEffect(() => { void refreshHandoffs(); }, [refreshHandoffs]);

  function log(msg: string) {
    setActionLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 9)]);
  }

  function showToast(msg: string, variant: "success" | "info" | "warning" | "error" = "success") {
    setToast({ message: msg, variant });
  }

  async function handleClearance(id: string) {
    const name = clients.find((c) => c.id === id)?.clientName ?? id;
    // Persist to file-backed API (cross-route-group reliable)
    await apiMarkCleared(id);
    // Update local state optimistically
    setClients((prev) => prev.map((c) =>
      c.id === id ? { ...c, cleared: true, billingStatus: "Cleared" as const } : c
    ));
    setExpanded(null);
    log(`✅ Cleared: ${name} → Account Management notified`);
    showToast(`${name} cleared — removed from Billing activation view`, "success");
  }

  function handleHandoffProcessed(handoffId: string, clientId: string) {
    // Mark handoff as processed in local state so it leaves the pending queue immediately
    setSalesHandoffs((prev) =>
      prev.map((h) =>
        h.id === handoffId
          ? { ...h, processed: true, processedClientId: clientId, processedAt: new Date().toISOString() }
          : h
      )
    );
    // Refresh clients so the new record appears in Client Portfolio
    void refreshClients();
  }

  // Clients that are invoice-cleared but not yet cleared
  const pendingClearance = clients.filter(isInvoiceCleared);

  // KPI counts — Billing-scoped only
  const pendingSalesHandoffs = salesHandoffs.filter(
    (h) => h.submittedToBilling === true && h.processed !== true
  );
  const kpi = {
    awaitingClearance: pendingClearance.length,
    cleared: clients.filter((c) => c.cleared).length,
    overdue: clients.filter((c) => c.paymentStatus === "Overdue" || c.billingStatus === "Overdue").length,
  };

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={() => setToast(null)} />}

      {/* Clearance modal */}
      {clearanceTarget && (
        <ClearanceModal
          client={clearanceTarget}
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
          Clients whose invoice is cleared and are awaiting Billing&rsquo;s clearance signal to Account Management.
          Once cleared, the client leaves this view — AM owns all downstream steps.
        </p>
      </div>

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
          onProcessed={handleHandoffProcessed}
          onLog={log}
          onToast={showToast}
        />
      )}

      {/* AM Change Requests — Billing Approval Queue */}
      <BillingChangeRequestsPanel onToast={showToast} />

      {/* Activation Table */}
      {pendingClearance.length === 0 ? (
        <div className="rounded-xl border p-12 text-center space-y-3" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
          <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center" style={{ background: "#ECFDF5" }}>
            <svg width="24" height="24" fill="none" stroke="#059669" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>All invoices cleared</p>
          <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
            No clients awaiting Billing clearance. When a client&rsquo;s invoice clears, they&rsquo;ll appear here for the clearance action.
          </p>
        </div>
      ) : (
        <SectionWrapper
          title={`Awaiting Clearance — ${pendingClearance.length} client${pendingClearance.length > 1 ? "s" : ""}`}
          description="Invoice cleared clients awaiting Billing's clearance before Account Management can begin onboarding. Click a row to review details and grant clearance."
        >
          <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--rtm-border-light)" }}>
            <table className="min-w-full">
              <thead>
                <tr>
                  <Th>Client</Th>
                  <Th>Invoice Status</Th>
                  <Th>Payment Status</Th>
                  <Th>Monthly Value</Th>
                  <Th>Active Services</Th>
                  <Th>Billing Owner</Th>
                  <Th>Clearance Action</Th>
                </tr>
              </thead>
              <tbody>
                {pendingClearance.map((client) => {
                  const isExpanded = expanded === client.id;
                  return (
                    <React.Fragment key={client.id}>
                      <tr
                        onClick={() => setExpanded(isExpanded ? null : client.id)}
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
                              style={{ background: client.avatarColor }}>
                              {client.clientName.charAt(0)}
                            </div>
                            <span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{client.clientName}</span>
                          </div>
                        </Td>
                        <Td><StatusBadge variant={invoiceStatusVariant(client.invoiceStatus)} label={client.invoiceStatus} size="sm" /></Td>
                        <Td><StatusBadge variant={paymentStatusVariant(client.paymentStatus)} label={client.paymentStatus} size="sm" /></Td>
                        <Td>
                          {client.monthlyValue > 0
                            ? <span className="font-bold text-sm" style={{ color: "#059669" }}>${client.monthlyValue.toLocaleString()}/mo</span>
                            : <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>—</span>
                          }
                        </Td>
                        <Td muted>
                          {client.activeServices.length > 0
                            ? client.activeServices.slice(0, 2).join(", ") + (client.activeServices.length > 2 ? ` +${client.activeServices.length - 2}` : "")
                            : "—"
                          }
                        </Td>
                        <Td muted>{client.billingOwner}</Td>
                        <Td>
                          <button
                            onClick={(e) => { e.stopPropagation(); setClearanceTarget(client); }}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-90"
                            style={{ background: "#059669" }}
                          >
                            Clearance →
                          </button>
                        </Td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} className="p-0" style={{ borderBottom: "2px solid #BFDBFE" }}>
                            <ExpandedDetail client={client} onClearance={(id) => setClearanceTarget(clients.find((c) => c.id === id) ?? null)} />
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
      )}

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
