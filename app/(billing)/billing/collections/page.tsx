"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

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

interface MasterClient {
  id: string;
  clientName: string;
  billingStatus: string;
  invoiceStatus: string;
  paymentStatus: string;
  monthlyValue: number;
  billingOwner: string;
  assignedAM: string;
  notes: string;
  lastActivity: string;
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

// ── Derived types for the merged view ────────────────────────────────────────

interface CollectionRow {
  clientId: string;
  clientName: string;
  outstandingAmount: number;
  daysOverdue: number;
  collectionStatus: CollectionStatus;
  assignedTo: string;
  notes: string;
  contactLog: ContactLogEntry[];
  paymentPlanDetails: string;
  lastContactDate: string;
  nextFollowUp: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Parse daysOverdue from invoiceStatus strings like "Overdue 30d" or "Overdue 15d". */
function parseDaysOverdue(invoiceStatus: string): number {
  const m = invoiceStatus.match(/Overdue\s+(\d+)d/i);
  if (m) return parseInt(m[1], 10);
  // billingStatus is "Overdue" but no day count in invoiceStatus — default 1
  return 1;
}

function collectionStatusVariant(s: CollectionStatus): BadgeVariant {
  switch (s) {
    case "Resolved":
      return "success";
    case "Escalated":
      return "error";
    case "Payment Arrangement":
      return "warning";
    case "Contacted":
      return "info";
    case "Reminder Sent":
      return "pending";
    default:
      return "neutral";
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
}: {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
}) {
  const base =
    "text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors";
  const disabledClass = loading
    ? "opacity-40 cursor-not-allowed"
    : "cursor-pointer";
  const styles: Record<string, string> = {
    primary: "bg-[#1B4FD8] text-white border-transparent hover:opacity-90",
    secondary:
      "bg-white text-[var(--rtm-text-primary)] border-[var(--rtm-border)] hover:bg-[var(--rtm-bg)]",
    danger:
      "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] hover:bg-[#FEE2E2]",
  };
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
  // ── Fetch state ─────────────────────────────────────────────────────────────
  const [rows, setRows] = useState<CollectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [selectedFilter, setSelectedFilter] = useState<
    CollectionStatus | "All"
  >("All");
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [cardNotes, setCardNotes] = useState<Record<string, string>>({});
  const [actingOn, setActingOn] = useState<string | null>(null); // clientId being acted on

  // ── Build merged rows from API data ──────────────────────────────────────────
  const buildRows = useCallback(
    (
      clients: MasterClient[],
      overlayRecords: CollectionsStatusRecord[]
    ): CollectionRow[] => {
      const overlayMap = new Map(overlayRecords.map((r) => [r.clientId, r]));

      // Filter to overdue clients: paymentStatus === "Overdue"
      const overdueClients = clients.filter(
        (c) => c.paymentStatus === "Overdue"
      );

      return overdueClients.map((c) => {
        const overlay = overlayMap.get(c.id);
        const daysOverdue = parseDaysOverdue(c.invoiceStatus);
        return {
          clientId: c.id,
          clientName: c.clientName,
          outstandingAmount: c.monthlyValue,
          daysOverdue,
          collectionStatus: overlay?.collectionStatus ?? "Pending",
          assignedTo: c.billingOwner || c.assignedAM || "—",
          notes: overlay?.notes || c.notes || "",
          contactLog: overlay?.contactLog ?? [],
          paymentPlanDetails: overlay?.paymentPlanDetails ?? "",
          lastContactDate:
            overlay?.lastContactDate || c.lastActivity || "—",
          nextFollowUp: overlay?.nextFollowUp || "—",
        };
      });
    },
    []
  );

  // ── Load data ─────────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      const [clientsRes, overlayRes] = await Promise.all([
        fetch("/api/master-clients"),
        fetch("/api/collections-status"),
      ]);
      if (!clientsRes.ok) throw new Error("Failed to load clients");
      if (!overlayRes.ok) throw new Error("Failed to load collections status");

      const clientsData = (await clientsRes.json()) as {
        clients: MasterClient[];
      };
      const overlayData = (await overlayRes.json()) as {
        records: CollectionsStatusRecord[];
      };

      setRows(buildRows(clientsData.clients, overlayData.records));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [buildRows]);

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

  // ── POST action to overlay API then refresh ──────────────────────────────────
  async function doAction(
    clientId: string,
    clientName: string,
    action: string,
    extra?: Record<string, string>
  ) {
    setActingOn(clientId);
    try {
      const res = await fetch("/api/collections-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, action, ...extra }),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "API error");
      }
      // Refresh rows from server to reflect persisted state
      await loadData();
      const actionLabel: Record<string, string> = {
        "send-reminder": "Reminder sent",
        "log-contact": "Contact logged",
        "payment-plan": "Payment plan created",
        escalate: "Escalated",
        resolve: "Resolved",
      };
      log(`${actionLabel[action] ?? action}: ${clientName}`);
    } catch (e) {
      log(`Error — ${clientName}: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setActingOn(null);
    }
  }

  // ── Derived KPIs ──────────────────────────────────────────────────────────────
  const activeRows = rows.filter((r) => r.collectionStatus !== "Resolved");
  const totalOutstanding = activeRows.reduce(
    (s, r) => s + r.outstandingAmount,
    0
  );
  const highRiskRows = activeRows.filter((r) => r.daysOverdue >= 30);
  const escalatedRows = rows.filter((r) => r.collectionStatus === "Escalated");

  const filtered =
    selectedFilter === "All"
      ? rows
      : rows.filter((r) => r.collectionStatus === selectedFilter);

  // ── Render ────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
          Loading collections…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <p className="text-sm text-[#DC2626]">Error: {error}</p>
      </div>
    );
  }

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
          Live overdue accounts from client records. All actions persist across
          page refreshes.
        </p>
      </div>

      {/* KPIs — recomputed from real + overlay data */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Total Outstanding"
          value={`$${totalOutstanding.toLocaleString()}`}
          trend="down"
          trendValue="Active accounts only"
          iconBg="#FEF2F2"
          iconColor="#DC2626"
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <KpiCard
          title="Overdue Accounts"
          value={String(rows.length)}
          trend="neutral"
          trendValue="From MASTER_CLIENTS"
          iconBg="#FFFBEB"
          iconColor="#D97706"
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          }
        />
        <KpiCard
          title="High Risk (≥30d)"
          value={String(highRiskRows.length)}
          trend="neutral"
          trendValue="30+ days overdue"
          iconBg="#FEF2F2"
          iconColor="#DC2626"
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
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
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          }
        />
      </div>

      {/* Collections Table */}
      <SectionWrapper
        title="Collections Queue"
        description={`${rows.length} overdue account${rows.length !== 1 ? "s" : ""} from MASTER_CLIENTS — all actions persist via overlay`}
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
                      ? {
                          background: "#1B4FD8",
                          color: "#fff",
                          borderColor: "#1B4FD8",
                        }
                      : {
                          background: "#fff",
                          color: "var(--rtm-text-secondary)",
                          borderColor: "var(--rtm-border)",
                        }
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
                  <Th>Outstanding</Th>
                  <Th>Days Overdue</Th>
                  <Th>Collection Status</Th>
                  <Th>Assigned To</Th>
                  <Th>Last Contact</Th>
                  <Th>Next Follow-Up</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const isActing = actingOn === r.clientId;
                  return (
                    <tr
                      key={r.clientId}
                      className="hover:bg-[#FFFBEB] transition-colors"
                      style={{
                        background:
                          r.daysOverdue >= 30
                            ? "#FFF7F7"
                            : "var(--rtm-bg)",
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
                      <Td>
                        <span
                          className="font-bold"
                          style={{
                            color:
                              r.outstandingAmount >= 2000
                                ? "#DC2626"
                                : r.outstandingAmount >= 1000
                                ? "#D97706"
                                : "var(--rtm-text-primary)",
                          }}
                        >
                          ${r.outstandingAmount.toLocaleString()}
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
                          variant={collectionStatusVariant(r.collectionStatus)}
                          label={r.collectionStatus}
                          size="sm"
                        />
                      </Td>
                      <Td muted>{r.assignedTo}</Td>
                      <Td muted>
                        {r.lastContactDate || "—"}
                      </Td>
                      <Td muted>
                        {r.nextFollowUp || "—"}
                      </Td>
                      <Td>
                        <div className="flex gap-1.5 flex-wrap">
                          <ActionBtn
                            label="Send Reminder"
                            loading={isActing}
                            onClick={() =>
                              void doAction(
                                r.clientId,
                                r.clientName,
                                "send-reminder"
                              )
                            }
                          />
                          <ActionBtn
                            label="Log Contact"
                            loading={isActing}
                            onClick={() =>
                              void doAction(
                                r.clientId,
                                r.clientName,
                                "log-contact",
                                { note: "Contact logged from table." }
                              )
                            }
                          />
                          <ActionBtn
                            label="Payment Plan"
                            loading={isActing}
                            onClick={() =>
                              void doAction(
                                r.clientId,
                                r.clientName,
                                "payment-plan",
                                {
                                  paymentPlanDetails:
                                    "Payment arrangement initiated.",
                                }
                              )
                            }
                          />
                          <ActionBtn
                            label="Escalate"
                            variant="danger"
                            loading={isActing}
                            onClick={() =>
                              void doAction(
                                r.clientId,
                                r.clientName,
                                "escalate"
                              )
                            }
                          />
                        </div>
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
        description="Per-account collection details with notes and full action set"
      >
        {rows.length === 0 ? (
          <p
            className="text-sm px-3 py-6 text-center"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            No overdue accounts at this time.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rows.map((r) => {
              const isActing = actingOn === r.clientId;
              const noteVal = cardNotes[r.clientId] ?? "";
              return (
                <div
                  key={r.clientId}
                  className="rounded-xl border p-5 space-y-4"
                  style={{
                    background: "var(--rtm-bg)",
                    borderColor: "var(--rtm-border-light)",
                  }}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className="font-bold text-sm"
                      style={{ color: "var(--rtm-text-primary)" }}
                    >
                      {r.clientName}
                    </span>
                    <StatusBadge
                      variant={collectionStatusVariant(r.collectionStatus)}
                      label={r.collectionStatus}
                      size="sm"
                    />
                  </div>
                  <div
                    className="space-y-1 text-xs"
                    style={{ color: "var(--rtm-text-muted)" }}
                  >
                    <div className="flex justify-between">
                      <span>Outstanding</span>
                      <span className="font-bold text-[#DC2626]">
                        ${r.outstandingAmount.toLocaleString()}
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
                        {r.daysOverdue > 0
                          ? `${r.daysOverdue} days`
                          : "Not overdue"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Assigned To</span>
                      <span
                        className="font-semibold"
                        style={{ color: "var(--rtm-text-secondary)" }}
                      >
                        {r.assignedTo}
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
                        [r.clientId]: e.target.value,
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
                    <ActionBtn
                      label="Send Reminder"
                      loading={isActing}
                      onClick={() =>
                        void doAction(
                          r.clientId,
                          r.clientName,
                          "send-reminder"
                        )
                      }
                    />
                    <ActionBtn
                      label="Log Contact"
                      loading={isActing}
                      onClick={() => {
                        void doAction(
                          r.clientId,
                          r.clientName,
                          "log-contact",
                          {
                            note: noteVal.trim() || "Contact logged.",
                          }
                        );
                        setCardNotes((prev) => ({
                          ...prev,
                          [r.clientId]: "",
                        }));
                      }}
                    />
                    <ActionBtn
                      label="Payment Plan"
                      loading={isActing}
                      onClick={() =>
                        void doAction(
                          r.clientId,
                          r.clientName,
                          "payment-plan",
                          {
                            paymentPlanDetails:
                              noteVal.trim() || "Payment arrangement initiated.",
                          }
                        )
                      }
                    />
                    <ActionBtn
                      label="Escalate"
                      variant="danger"
                      loading={isActing}
                      onClick={() =>
                        void doAction(
                          r.clientId,
                          r.clientName,
                          "escalate",
                          { note: noteVal.trim() }
                        )
                      }
                    />
                    <ActionBtn
                      label="Mark Resolved"
                      variant="primary"
                      loading={isActing}
                      onClick={() =>
                        void doAction(
                          r.clientId,
                          r.clientName,
                          "resolve",
                          { note: noteVal.trim() }
                        )
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
        <Link
          href="/billing/activation-queue"
          className="rtm-btn-primary text-sm"
        >
          Activation Queue →
        </Link>
      </div>
    </div>
  );
}
