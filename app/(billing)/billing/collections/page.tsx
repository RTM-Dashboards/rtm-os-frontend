"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import { resolveRep, useDepartmentUsers } from "@/lib/users/users-api";

const workspace = getWorkspace("billing")!;

// ── Types ─────────────────────────────────────────────────────────────────────

type CollectionStatus =
  | "Pending"
  | "Reminder Sent"
  | "Contacted"
  | "Payment Arrangement"
  | "Escalated"
  | "Resolved";

type BadgeVariant =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "neutral"
  | "pending";

// Invoice record as returned by GET /api/invoices?overdue=true
interface OverdueInvoice {
  id: string;
  invoiceNumber: string;
  businessId: string;
  clientId: string;
  contractAmountCents: number;
  monthlyValueCents: number;
  invoiceStatus: string;
  paymentStatus: string;
  dueDate: string;
  billingOwner: string;
}

interface ContactLogEntry {
  timestamp: string;
  note: string;
}

interface CollectionsStatusRecord {
  clientId: string;
  collectionStatus: CollectionStatus;
  notes: string;
  contactLog: ContactLogEntry[];
  paymentPlanDetails: string;
  lastContactDate: string;
  nextFollowUp: string;
  updatedAt: string;
}

// ── Derived type for the merged view ─────────────────────────────────────────
//
// invoiceId is the Postgres Invoice id; the overlay is keyed by invoiceId.
// (Overlay was previously keyed by master-clients id; we now use invoice id.)

interface CollectionRow {
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;    // from Client.fullName or Client.company
  domain: string;        // from Business.domain
  outstandingAmountCents: number;
  daysOverdue: number;   // Math.floor((now - dueDate) / 86_400_000)
  invoiceStatus: string;
  billingOwner: string;  // User id — resolved for display
  // Overlay fields (file-backed, keyed by invoiceId)
  collectionStatus: CollectionStatus;
  notes: string;
  contactLog: ContactLogEntry[];
  paymentPlanDetails: string;
  lastContactDate: string;
  nextFollowUp: string;
  // Row-level write failure (set when overlay POST returns non-ok)
  writeError?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function collectionStatusVariant(s: CollectionStatus): BadgeVariant {
  switch (s) {
    case "Resolved":            return "success";
    case "Escalated":           return "error";
    case "Payment Arrangement": return "warning";
    case "Contacted":           return "info";
    case "Reminder Sent":       return "pending";
    default:                    return "neutral";
  }
}

const ALL_STATUSES: CollectionStatus[] = [
  "Pending",
  "Reminder Sent",
  "Contacted",
  "Payment Arrangement",
  "Escalated",
  "Resolved",
];

function daysOverdueFromISO(dueDateISO: string): number {
  const due = new Date(dueDateISO).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - due) / 86_400_000));
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="text-left text-xs font-semibold uppercase tracking-wide px-3 py-2.5 whitespace-nowrap border-b"
      style={{
        color: "var(--rtm-text-muted)",
        borderColor: "var(--rtm-border-light)",
        background: "#F9FAFB",
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  muted,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <td
      className="px-3 py-2.5 text-sm whitespace-nowrap border-b"
      style={{
        color: muted ? "var(--rtm-text-muted)" : "var(--rtm-text-secondary)",
        borderColor: "var(--rtm-border-light)",
      }}
    >
      {children}
    </td>
  );
}

function ActionBtn({
  label,
  onClick,
  variant = "secondary",
  loading = false,
  writeError,
}: {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
  writeError?: string;
}) {
  const base =
    "text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors";
  const disabledClass = loading
    ? "opacity-40 cursor-not-allowed"
    : "cursor-pointer";
  const styles: Record<string, string> = {
    primary:   "bg-[#1B4FD8] text-white border-transparent hover:opacity-90",
    secondary: "bg-white text-[var(--rtm-text-primary)] border-[var(--rtm-border)] hover:bg-[var(--rtm-bg)]",
    danger:    "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] hover:bg-[#FEE2E2]",
  };

  if (writeError) {
    // Row had a write failure — show an error pill instead of the normal button.
    return (
      <span
        className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
        style={{
          background: "#FEF2F2",
          borderColor: "#FECACA",
          color: "#991B1B",
        }}
        title={writeError}
      >
        Write failed — {writeError.length > 40 ? writeError.slice(0, 40) + "…" : writeError}
      </span>
    );
  }

  return (
    <button
      disabled={loading}
      className={`${base} ${disabledClass} ${styles[variant]}`}
      onClick={loading ? undefined : onClick}
    >
      {loading ? "…" : label}
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CollectionsPage() {
  // Billing users for resolveRep display
  const { users: billingUsers } = useDepartmentUsers("Billing");

  // ── Fetch state ──────────────────────────────────────────────────────────────
  const [rows, setRows] = useState<CollectionRow[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "empty" | "loaded" | "error">("loading");
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [selectedFilter, setSelectedFilter] = useState<CollectionStatus | "All">("All");
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [cardNotes, setCardNotes] = useState<Record<string, string>>({});
  const [actingOn, setActingOn] = useState<string | null>(null); // invoiceId being acted on

  // ── Load data ─────────────────────────────────────────────────────────────────
  //
  // 1. GET /api/invoices?overdue=true — real overdue invoices from Postgres.
  //    Overdue rule: dueDate < now AND invoiceStatus IN [Sent, Viewed,
  //    Partially Paid, Overdue, Escalated]. Draft and Cancelled are excluded.
  //    C3: Escalated is included — an escalated invoice must stay visible here.
  //
  // 2. For each invoice, we need clientName (from Client) and domain (from
  //    Business). To avoid N+1 fetches, we collect unique clientIds and
  //    businessIds and fetch each set in parallel with Promise.all.
  //    This is one round-trip per unique client id and per unique business id,
  //    not one per row.
  //
  // 3. GET /api/collections-status — Postgres-backed (collection_states + collection_logs).
  //    Provides collectionStatus, contactLog, paymentPlanDetails, etc.

  const loadData = useCallback(async () => {
    setLoadState("loading");
    setLoadError(null);

    try {
      // ── Fetch overdue invoices ───────────────────────────────────────────────
      const invoicesRes = await fetch("/api/invoices?overdue=true");
      if (!invoicesRes.ok) {
        const err = (await invoicesRes.json()) as { error?: string };
        throw new Error(err.error ?? `HTTP ${invoicesRes.status}`);
      }
      const invoicesData = (await invoicesRes.json()) as {
        invoices: OverdueInvoice[];
      };
      const invoices = invoicesData.invoices ?? [];

      if (invoices.length === 0) {
        setRows([]);
        setLoadState("empty");
        return;
      }

      // ── Batch-resolve client names (unique clientIds) ───────────────────────
      const uniqueClientIds = [...new Set(invoices.map((i) => i.clientId).filter(Boolean))];
      const clientNameMap: Record<string, string> = {};
      await Promise.all(
        uniqueClientIds.map(async (cid) => {
          try {
            const res = await fetch(`/api/clients?id=${encodeURIComponent(cid)}`);
            if (res.ok) {
              const d = (await res.json()) as {
                record?: { fullName?: string; company?: string };
              };
              const name = d.record?.fullName || d.record?.company || "";
              if (name) clientNameMap[cid] = name;
            }
          } catch { /* best-effort */ }
        })
      );

      // ── Batch-resolve domains (unique businessIds) ──────────────────────────
      const uniqueBizIds = [...new Set(invoices.map((i) => i.businessId).filter(Boolean))];
      const bizDomainMap: Record<string, string> = {};
      await Promise.all(
        uniqueBizIds.map(async (bid) => {
          try {
            const res = await fetch(`/api/businesses?id=${encodeURIComponent(bid)}`);
            if (res.ok) {
              const d = (await res.json()) as {
                record?: { domain?: string };
              };
              if (d.record?.domain) bizDomainMap[bid] = d.record.domain;
            }
          } catch { /* best-effort */ }
        })
      );

      // ── Fetch overlay records ───────────────────────────────────────────────
      const overlayRes = await fetch("/api/collections-status");
      const overlayData = overlayRes.ok
        ? ((await overlayRes.json()) as { records: CollectionsStatusRecord[] })
        : { records: [] as CollectionsStatusRecord[] };
      // Overlay is keyed by clientId in the existing file format.
      // We key it by invoiceId going forward; fall back to clientId match for
      // any legacy records that pre-date this change.
      const overlayByInvoiceId = new Map(
        overlayData.records.map((r) => [r.clientId, r])
      );

      const now = Date.now();

      const built: CollectionRow[] = invoices.map((inv) => {
        const overlay = overlayByInvoiceId.get(inv.id);
        const daysOverdue = daysOverdueFromISO(inv.dueDate);
        return {
          invoiceId:              inv.id,
          invoiceNumber:          inv.invoiceNumber,
          clientName:             clientNameMap[inv.clientId] || inv.invoiceNumber,
          domain:                 bizDomainMap[inv.businessId] || "—",
          outstandingAmountCents: inv.contractAmountCents,
          daysOverdue,
          invoiceStatus:          inv.invoiceStatus,
          billingOwner:           inv.billingOwner,
          collectionStatus:       overlay?.collectionStatus ?? "Pending",
          notes:                  overlay?.notes ?? "",
          contactLog:             overlay?.contactLog ?? [],
          paymentPlanDetails:     overlay?.paymentPlanDetails ?? "",
          lastContactDate:        overlay?.lastContactDate ?? "",
          nextFollowUp:           overlay?.nextFollowUp ?? "",
        };
      });

      void now; // used only inside daysOverdueFromISO above
      setRows(built);
      setLoadState("loaded");
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Unknown error");
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // ── Log helper ────────────────────────────────────────────────────────────────
  function log(msg: string) {
    setActionLog((prev) => [
      `[${new Date().toLocaleTimeString()}] ${msg}`,
      ...prev.slice(0, 14),
    ]);
  }

  // ── POST action to API then refresh ───────────────────────────────────────────
  //
  // The overlay is now Postgres-backed (collection_states + collection_logs tables).
  // The action AWAITS the response before updating UI or logging success.
  // If the write fails, the row shows the error inline — no false success is shown.

  async function doAction(
    invoiceId: string,
    clientName: string,
    action: string,
    extra?: Record<string, string>
  ) {
    setActingOn(invoiceId);
    // Clear any previous write error for this row
    setRows((prev) =>
      prev.map((r) =>
        r.invoiceId === invoiceId ? { ...r, writeError: undefined } : r
      )
    );

    try {
      const res = await fetch("/api/collections-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: invoiceId, action, ...extra }),
      });

      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        const msg = err.error ?? `HTTP ${res.status}`;
        // Show error inline on the row — do not claim success
        setRows((prev) =>
          prev.map((r) =>
            r.invoiceId === invoiceId ? { ...r, writeError: msg } : r
          )
        );
        log(`Write failed — ${clientName}: ${msg}`);
        return;
      }

      // Write succeeded — refresh from server to reflect persisted state
      await loadData();
      const actionLabel: Record<string, string> = {
        // C4: "Reminder sent" → "Reminder logged" — the system sends nothing;
        // this records that the collector sent a reminder outside the system.
        "send-reminder": "Reminder logged (sent by collector outside system)",
        "log-contact":   "Contact logged",
        "payment-plan":  "Payment plan created",
        escalate:        "Escalated",
        resolve:         "Resolved",
      };
      log(`${actionLabel[action] ?? action}: ${clientName}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setRows((prev) =>
        prev.map((r) =>
          r.invoiceId === invoiceId ? { ...r, writeError: msg } : r
        )
      );
      log(`Error — ${clientName}: ${msg}`);
    } finally {
      setActingOn(null);
    }
  }

  // ── Derived KPIs from real invoice data ───────────────────────────────────────
  //
  // Total Outstanding: sum of contractAmountCents across all active (non-Resolved) rows.
  // Overdue Accounts: total row count (every row is an overdue invoice by definition).
  // High Risk (≥30d): rows where daysOverdue ≥ 30.
  // Escalated: rows where collectionStatus is "Escalated".
  // All four are derived from real invoice data returned by /api/invoices?overdue=true.

  const activeRows = rows.filter((r) => r.collectionStatus !== "Resolved");
  const totalOutstandingCents = activeRows.reduce(
    (s, r) => s + r.outstandingAmountCents,
    0
  );
  const highRiskRows = activeRows.filter((r) => r.daysOverdue >= 30);
  const escalatedRows = rows.filter((r) => r.collectionStatus === "Escalated");

  // F1: The default "All" view excludes Resolved so a resolved row leaves the
  // collector's queue automatically. Resolved rows remain findable by selecting
  // the "Resolved" filter button (already present in ALL_STATUSES).
  const filtered =
    selectedFilter === "All"
      ? rows.filter((r) => r.collectionStatus !== "Resolved")
      : rows.filter((r) => r.collectionStatus === selectedFilter);

  // ── Loading state ─────────────────────────────────────────────────────────────
  if (loadState === "loading") {
    return (
      <div className="flex items-center justify-center min-h-64">
        <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
          Loading overdue invoices…
        </p>
      </div>
    );
  }

  // ── Fetch failure ─────────────────────────────────────────────────────────────
  if (loadState === "error") {
    return (
      <div className="space-y-4 p-6">
        <div
          className="rounded-xl border px-5 py-4"
          style={{ background: "#FEF2F2", borderColor: "#FECACA" }}
        >
          <p className="text-sm font-bold" style={{ color: "#991B1B" }}>
            Failed to load overdue invoices
          </p>
          <p className="text-xs mt-1" style={{ color: "#991B1B" }}>
            {loadError}
          </p>
          <button
            className="mt-3 text-xs font-semibold px-3 py-1.5 rounded-lg border"
            style={{
              borderColor: "#FECACA",
              color: "#991B1B",
              background: "#FFF",
            }}
            onClick={() => void loadData()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Loaded-and-empty state ────────────────────────────────────────────────────
  //
  // With zero invoices today this is the expected result, not a broken page.
  // The overdue rule excludes Draft and Cancelled; if no Sent/Viewed/Partially
  // Paid/Overdue invoice has a past dueDate, this queue is correctly empty.

  if (loadState === "empty") {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-1"
            style={{ color: workspace.accentColor }}
          >
            {workspace.name} / Collections
          </p>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            Collections Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
            Overdue invoices from Postgres — dueDate past and status Sent, Viewed,
            Partially Paid, Overdue, or Escalated. Draft and Cancelled excluded.
          </p>
        </div>

        <div
          className="rounded-xl border px-6 py-10 text-center"
          style={{
            background: "var(--rtm-bg)",
            borderColor: "var(--rtm-border-light)",
          }}
        >
          <p
            className="text-base font-semibold"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            No overdue invoices
          </p>
          <p
            className="text-sm mt-2 max-w-md mx-auto"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            There are no invoices that are both past their due date and in a
            chasing status. An invoice must have been sent to the client (status
            Sent, Viewed, Partially Paid, Overdue, or Escalated) before it
            appears here. Draft and Cancelled invoices are never shown.
          </p>
          <p
            className="text-xs mt-3"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            This is the correct result. When overdue invoices exist they will
            appear here automatically.
          </p>
        </div>

        <div className="flex gap-2">
          <Link href="/billing" className="rtm-btn-secondary text-sm">
            ← Dashboard
          </Link>
          <Link href="/billing/invoices" className="rtm-btn-secondary text-sm">
            Invoices →
          </Link>
        </div>
      </div>
    );
  }

  // ── Render (loaded with rows) ─────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p
          className="text-[11px] font-bold uppercase tracking-widest mb-1"
          style={{ color: workspace.accentColor }}
        >
          {workspace.name} / Collections
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            Collections Dashboard
          </h1>
        </div>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          Overdue invoices from Postgres — dueDate past and status Sent, Viewed,
          Partially Paid, Overdue, or Escalated. Collection actions persist to
          Postgres (collection_states + collection_logs tables).
        </p>
      </div>

      {/* KPIs — recomputed from real invoice data */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Total Outstanding"
          value={`$${(totalOutstandingCents / 100).toLocaleString()}`}
          trend="down"
          trendValue="Active accounts only"
          iconBg="#FEF2F2"
          iconColor="#DC2626"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <KpiCard
          title="Overdue Invoices"
          value={String(rows.length)}
          trend="neutral"
          trendValue="Past due date, sent status"
          iconBg="#FFFBEB"
          iconColor="#D97706"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          }
        />
        <KpiCard
          title="High Risk (≥30d)"
          value={String(highRiskRows.length)}
          trend="neutral"
          trendValue="30+ days past due date"
          iconBg="#FEF2F2"
          iconColor="#DC2626"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          }
        />
        <KpiCard
          title="Escalated"
          value={String(escalatedRows.length)}
          trend="neutral"
          trendValue="Requires attention"
          iconBg="#FDF4FF"
          iconColor="#9333EA"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          }
        />
      </div>

      {/* Collections Table */}
      <SectionWrapper
        title="Collections Queue"
        description={`${rows.length} overdue invoice${rows.length !== 1 ? "s" : ""} — dueDate past, status Sent / Viewed / Partially Paid / Overdue / Escalated`}
        actions={
          <div className="flex flex-wrap gap-2">
            {(["All", ...ALL_STATUSES] as (CollectionStatus | "All")[]).map(
              (s) => (
                <button
                  key={s}
                  onClick={() => setSelectedFilter(s)}
                  className="text-xs font-semibold px-3 py-1 rounded-full border transition-colors"
                  style={
                    selectedFilter === s
                      ? { background: "#1B4FD8", color: "#fff", borderColor: "#1B4FD8" }
                      : { background: "#fff", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }
                  }
                >
                  {s}
                </button>
              )
            )}
          </div>
        }
      >
        {filtered.length === 0 ? (
          <p
            className="text-sm px-3 py-6 text-center"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            No accounts match the selected filter.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <Th>Client</Th>
                  <Th>Domain</Th>
                  <Th>Invoice #</Th>
                  <Th>Outstanding</Th>
                  <Th>Days Overdue</Th>
                  <Th>Invoice Status</Th>
                  <Th>Collection Status</Th>
                  <Th>Billing Owner</Th>
                  <Th>Last Contact</Th>
                  <Th>Next Follow-Up</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const isActing = actingOn === r.invoiceId;
                  return (
                    <tr
                      key={r.invoiceId}
                      className="hover:bg-[#FFFBEB] transition-colors"
                      style={{
                        background:
                          r.daysOverdue >= 30 ? "#FFF7F7" : "var(--rtm-bg)",
                      }}
                    >
                      <Td>
                        <span
                          className="font-semibold"
                          style={{ color: "var(--rtm-text-primary)" }}
                        >
                          {r.clientName}
                        </span>
                      </Td>
                      <Td muted>
                        <span className="font-mono text-xs">{r.domain}</span>
                      </Td>
                      <Td muted>
                        <span className="font-mono text-xs">{r.invoiceNumber}</span>
                      </Td>
                      <Td>
                        <span
                          className="font-bold"
                          style={{
                            color:
                              r.outstandingAmountCents >= 200_000
                                ? "#DC2626"
                                : r.outstandingAmountCents >= 100_000
                                ? "#D97706"
                                : "var(--rtm-text-primary)",
                          }}
                        >
                          ${(r.outstandingAmountCents / 100).toLocaleString()}
                        </span>
                      </Td>
                      <Td>
                        <span
                          className="font-semibold"
                          style={{
                            color:
                              r.daysOverdue >= 30
                                ? "#DC2626"
                                : r.daysOverdue >= 10
                                ? "#D97706"
                                : "#059669",
                          }}
                        >
                          {r.daysOverdue > 0 ? `${r.daysOverdue}d` : "—"}
                        </span>
                      </Td>
                      <Td>
                        <StatusBadge
                          variant={
                            r.invoiceStatus === "Overdue"
                              ? "error"
                              : r.invoiceStatus === "Partially Paid"
                              ? "warning"
                              : "info"
                          }
                          label={r.invoiceStatus}
                          size="sm"
                        />
                      </Td>
                      <Td>
                        <StatusBadge
                          variant={collectionStatusVariant(r.collectionStatus)}
                          label={r.collectionStatus}
                          size="sm"
                        />
                      </Td>
                      <Td muted>
                        {resolveRep(r.billingOwner, billingUsers)}
                      </Td>
                      <Td muted>{r.lastContactDate || "—"}</Td>
                      <Td muted>{r.nextFollowUp || "—"}</Td>
                      <Td>
                        {r.writeError ? (
                          <span
                            className="text-xs font-semibold px-2 py-1 rounded-lg border"
                            style={{
                              background: "#FEF2F2",
                              borderColor: "#FECACA",
                              color: "#991B1B",
                            }}
                            title={r.writeError}
                          >
                            Write failed — check action log
                          </span>
                        ) : (
                          <div className="flex gap-1.5 flex-wrap">
                            {/* C4: "Send Reminder" renamed — the system sends nothing;
                                this records that the collector sent a reminder outside the system. */}
                            <ActionBtn
                              label="Log Reminder Sent"
                              loading={isActing}
                              onClick={() =>
                                void doAction(r.invoiceId, r.clientName, "send-reminder")
                              }
                            />
                            <ActionBtn
                              label="Log Contact"
                              loading={isActing}
                              onClick={() =>
                                void doAction(r.invoiceId, r.clientName, "log-contact", {
                                  note: "Contact logged from table.",
                                })
                              }
                            />
                            <ActionBtn
                              label="Payment Plan"
                              loading={isActing}
                              onClick={() =>
                                void doAction(r.invoiceId, r.clientName, "payment-plan", {
                                  paymentPlanDetails: "Payment arrangement initiated.",
                                })
                              }
                            />
                            <ActionBtn
                              label="Escalate"
                              variant="danger"
                              loading={isActing}
                              onClick={() =>
                                void doAction(r.invoiceId, r.clientName, "escalate")
                              }
                            />
                          </div>
                        )}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionWrapper>

      {/* Collection Cards Detail */}
      <SectionWrapper
        title="Collection Detail Cards"
        description="Per-invoice collection details with notes and full action set. Collection status and contact log persist to Postgres."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((r) => {
            const isActing = actingOn === r.invoiceId;
            const noteVal = cardNotes[r.invoiceId] ?? "";
            return (
              <div
                key={r.invoiceId}
                className="rounded-xl border p-5 space-y-4"
                style={{
                  background: "var(--rtm-bg)",
                  borderColor: "var(--rtm-border-light)",
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className="font-bold text-sm"
                      style={{ color: "var(--rtm-text-primary)" }}
                    >
                      {r.clientName}
                    </span>
                    {r.domain !== "—" && (
                      <p
                        className="text-[11px] font-mono mt-0.5"
                        style={{ color: "var(--rtm-text-muted)" }}
                      >
                        {r.domain}
                      </p>
                    )}
                  </div>
                  <StatusBadge
                    variant={collectionStatusVariant(r.collectionStatus)}
                    label={r.collectionStatus}
                    size="sm"
                  />
                </div>

                {/* Row-level write error banner */}
                {r.writeError && (
                  <div
                    className="rounded-lg border px-3 py-2 text-xs font-semibold"
                    style={{
                      background: "#FEF2F2",
                      borderColor: "#FECACA",
                      color: "#991B1B",
                    }}
                  >
                    Last write failed: {r.writeError}
                  </div>
                )}

                <div
                  className="space-y-1 text-xs"
                  style={{ color: "var(--rtm-text-muted)" }}
                >
                  <div className="flex justify-between">
                    <span>Invoice</span>
                    <span className="font-mono">{r.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Outstanding</span>
                    <span className="font-bold text-[#DC2626]">
                      ${(r.outstandingAmountCents / 100).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Days Overdue</span>
                    <span
                      className="font-semibold"
                      style={{
                        color:
                          r.daysOverdue >= 30
                            ? "#DC2626"
                            : r.daysOverdue > 0
                            ? "#D97706"
                            : "#059669",
                      }}
                    >
                      {r.daysOverdue > 0 ? `${r.daysOverdue} days` : "Not overdue"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Invoice Status</span>
                    <span className="font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>
                      {r.invoiceStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Billing Owner</span>
                    <span className="font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>
                      {resolveRep(r.billingOwner, billingUsers)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Contact</span>
                    <span>{r.lastContactDate || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Follow-Up</span>
                    <span>{r.nextFollowUp || "—"}</span>
                  </div>
                  {r.paymentPlanDetails && (
                    <div className="flex justify-between">
                      <span>Payment Plan</span>
                      <span
                        className="font-semibold text-right max-w-[140px] break-words"
                        style={{ color: "var(--rtm-text-secondary)" }}
                      >
                        {r.paymentPlanDetails}
                      </span>
                    </div>
                  )}
                </div>

                {r.notes && (
                  <p
                    className="text-xs"
                    style={{ color: "var(--rtm-text-secondary)" }}
                  >
                    {r.notes}
                  </p>
                )}

                {r.contactLog.length > 0 && (
                  <div className="space-y-1">
                    <p
                      className="text-[10px] font-semibold uppercase tracking-wide"
                      style={{ color: "var(--rtm-text-muted)" }}
                    >
                      Contact Log
                    </p>
                    {r.contactLog.slice(-3).map((entry, i) => (
                      <p
                        key={i}
                        className="text-xs"
                        style={{ color: "var(--rtm-text-muted)" }}
                      >
                        <span className="font-medium">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </span>{" "}
                        — {entry.note}
                      </p>
                    ))}
                  </div>
                )}

                <textarea
                  rows={2}
                  placeholder="Add a note for Log Contact or Escalate…"
                  value={noteVal}
                  onChange={(e) =>
                    setCardNotes((prev) => ({
                      ...prev,
                      [r.invoiceId]: e.target.value,
                    }))
                  }
                  className="w-full text-xs px-2.5 py-2 rounded-lg border resize-none"
                  style={{
                    background: "var(--rtm-surface)",
                    borderColor: "var(--rtm-border)",
                    color: "var(--rtm-text-primary)",
                  }}
                />

                <div className="flex flex-wrap gap-1.5">
                  {/* C4: "Send Reminder" renamed — the system sends nothing;
                      this records that the collector sent a reminder outside the system. */}
                  <ActionBtn
                    label="Log Reminder Sent"
                    loading={isActing}
                    onClick={() =>
                      void doAction(r.invoiceId, r.clientName, "send-reminder")
                    }
                  />
                  <ActionBtn
                    label="Log Contact"
                    loading={isActing}
                    onClick={() => {
                      void doAction(r.invoiceId, r.clientName, "log-contact", {
                        note: noteVal.trim() || "Contact logged.",
                      });
                      setCardNotes((prev) => ({ ...prev, [r.invoiceId]: "" }));
                    }}
                  />
                  <ActionBtn
                    label="Payment Plan"
                    loading={isActing}
                    onClick={() =>
                      void doAction(r.invoiceId, r.clientName, "payment-plan", {
                        paymentPlanDetails:
                          noteVal.trim() || "Payment arrangement initiated.",
                      })
                    }
                  />
                  <ActionBtn
                    label="Escalate"
                    variant="danger"
                    loading={isActing}
                    onClick={() =>
                      void doAction(r.invoiceId, r.clientName, "escalate", {
                        note: noteVal.trim(),
                      })
                    }
                  />
                  <ActionBtn
                    label="Mark Resolved"
                    variant="primary"
                    loading={isActing}
                    onClick={() =>
                      void doAction(r.invoiceId, r.clientName, "resolve", {
                        note: noteVal.trim(),
                      })
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      </SectionWrapper>

      {/* Action Log */}
      {actionLog.length > 0 && (
        <SectionWrapper
          title="Action Log"
          description="Recent collections actions this session"
        >
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {actionLog.map((entry, i) => (
              <p
                key={i}
                className="text-xs font-mono"
                style={{ color: "var(--rtm-text-secondary)" }}
              >
                {entry}
              </p>
            ))}
          </div>
        </SectionWrapper>
      )}

      {/* Footer */}
      <div className="flex gap-2">
        <Link href="/billing" className="rtm-btn-secondary text-sm">
          ← Dashboard
        </Link>
        <Link href="/billing/invoices" className="rtm-btn-secondary text-sm">
          Invoices →
        </Link>
        <Link href="/billing/activation-queue" className="rtm-btn-primary text-sm">
          Activation Queue →
        </Link>
      </div>
    </div>
  );
}
