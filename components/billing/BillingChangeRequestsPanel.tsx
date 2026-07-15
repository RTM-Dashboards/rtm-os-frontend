"use client";

// BillingChangeRequestsPanel
//
// Displays all submitted Change Requests from the AM side (Expansion
// Opportunities / Renewals / AM Change Requests page) and lets Billing
// Approve or Reject each one by PATCHing billingApprovalStatus.
//
// Data source: /api/pending-change-requests (GET to fetch, PATCH to update).
// Does NOT create a second data store — extends the existing real API.

import React, { useState, useEffect, useCallback } from "react";

// ── Inline types (mirrors route types; no server-only imports) ─────────────

type ChangeRequestType =
  | "Budget Reallocation"
  | "Service Upgrade"
  | "Service Downgrade"
  | "Service Addition"
  | "Service Removal"
  | "Pause"
  | "Reactivation"
  | "Contract Amendment"
  | "Custom Scope Change";

type PendingChangeRequestStatus =
  | "Submitted"
  | "Under Review"
  | "Pending Approval"
  | "Approved"
  | "Rejected"
  | "Implemented"
  | "Cancelled";

interface PendingChangeRequest {
  id: string;
  client: string;
  requestType: ChangeRequestType;
  description: string;
  project: string;
  requestedBy: string;
  revenueImpact: number;
  departmentsImpacted: string[];
  submittedDate: string;
  status: PendingChangeRequestStatus;
  submittedByRole: "AM";
  billingApprovalStatus: "Pending" | "Approved" | "Rejected";
  notes?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function billingStatusVariant(s: "Pending" | "Approved" | "Rejected"): {
  bg: string;
  color: string;
  border: string;
} {
  if (s === "Approved")
    return { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" };
  if (s === "Rejected")
    return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
  return { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" };
}

function requestTypeVariant(t: ChangeRequestType): {
  bg: string;
  color: string;
  border: string;
} {
  if (t === "Service Upgrade" || t === "Service Addition" || t === "Reactivation")
    return { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" };
  if (t === "Service Downgrade" || t === "Service Removal" || t === "Pause")
    return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
  if (t === "Budget Reallocation")
    return { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" };
  return { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" };
}

function fmt(n: number): string {
  if (n === 0) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}$${Math.abs(n).toLocaleString()}/mo`;
}

function revenueColor(n: number): string {
  if (n > 0) return "#059669";
  if (n < 0) return "#DC2626";
  return "#64748B";
}

// ── Sub-components ─────────────────────────────────────────────────────────

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="text-left text-xs font-semibold uppercase tracking-wide px-3 py-2 whitespace-nowrap border-b"
      style={{
        color: "var(--rtm-text-muted)",
        borderColor: "var(--rtm-border-light)",
        background: "var(--rtm-bg-alt, #F9FAFB)",
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
      className="px-3 py-2.5 text-sm border-b"
      style={{
        color: muted
          ? "var(--rtm-text-muted)"
          : "var(--rtm-text-secondary)",
        borderColor: "var(--rtm-border-light)",
      }}
    >
      {children}
    </td>
  );
}

function StatusPill({
  label,
  style,
}: {
  label: string;
  style: { bg: string; color: string; border: string };
}) {
  return (
    <span
      className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border whitespace-nowrap"
      style={{
        background: style.bg,
        color: style.color,
        borderColor: style.border,
      }}
    >
      {label}
    </span>
  );
}

// Expanded detail row shown when a CR row is clicked
function ExpandedRow({
  cr,
  acting,
  onApprove,
  onReject,
}: {
  cr: PendingChangeRequest;
  acting: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const isSettled =
    cr.billingApprovalStatus === "Approved" ||
    cr.billingApprovalStatus === "Rejected";

  return (
    <div className="px-5 py-4 space-y-4" style={{ background: "#F8FAFF" }}>
      {/* Detail grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Client", value: cr.client },
          { label: "Project / Account", value: cr.project || "—" },
          { label: "Requested By", value: cr.requestedBy },
          {
            label: "Revenue Impact",
            value: fmt(cr.revenueImpact),
            color: revenueColor(cr.revenueImpact),
          },
          {
            label: "Departments Impacted",
            value: cr.departmentsImpacted.length
              ? cr.departmentsImpacted.join(", ")
              : "—",
          },
          { label: "Submitted", value: cr.submittedDate },
        ].map(({ label, value, color }) => (
          <div key={label} className="space-y-0.5">
            <p
              className="text-[11px] font-bold uppercase tracking-wide"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              {label}
            </p>
            <p
              className="text-sm font-semibold"
              style={{ color: color ?? "var(--rtm-text-primary)" }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Description */}
      <div
        className="rounded-lg border p-3"
        style={{ background: "#F1F5F9", borderColor: "#E2E8F0" }}
      >
        <p
          className="text-[11px] font-bold uppercase tracking-wide mb-1"
          style={{ color: "var(--rtm-text-muted)" }}
        >
          Description
        </p>
        <p className="text-sm" style={{ color: "var(--rtm-text-primary)" }}>
          {cr.description}
        </p>
      </div>

      {/* Notes (if any) */}
      {cr.notes && (
        <div
          className="rounded-lg border p-3"
          style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}
        >
          <p
            className="text-xs font-semibold mb-1"
            style={{ color: "#92400E" }}
          >
            AM Notes
          </p>
          <p className="text-sm" style={{ color: "#78350F" }}>
            {cr.notes}
          </p>
        </div>
      )}

      {/* Billing actions */}
      {isSettled ? (
        <div
          className="rounded-lg border p-3 flex items-center gap-2"
          style={{
            background:
              cr.billingApprovalStatus === "Approved" ? "#ECFDF5" : "#FEF2F2",
            borderColor:
              cr.billingApprovalStatus === "Approved" ? "#A7F3D0" : "#FECACA",
          }}
        >
          <span
            className="text-sm font-semibold"
            style={{
              color:
                cr.billingApprovalStatus === "Approved"
                  ? "#059669"
                  : "#DC2626",
            }}
          >
            {cr.billingApprovalStatus === "Approved"
              ? "✓ Billing Approved this Change Request."
              : "✗ Billing Rejected this Change Request."}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <p
            className="text-xs flex-1"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            Billing action required — Approve to proceed or Reject to return to
            AM.
          </p>
          <button
            onClick={onReject}
            disabled={acting}
            className="text-xs font-bold px-4 py-2 rounded-lg border transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{
              background: "#FEF2F2",
              borderColor: "#FECACA",
              color: "#DC2626",
            }}
          >
            {acting ? "…" : "Reject"}
          </button>
          <button
            onClick={onApprove}
            disabled={acting}
            className="text-xs font-bold px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ background: "#059669" }}
          >
            {acting ? "…" : "Approve"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Panel ──────────────────────────────────────────────────────────────────

interface Props {
  onToast: (
    message: string,
    variant: "success" | "info" | "warning" | "error"
  ) => void;
}

export default function BillingChangeRequestsPanel({ onToast }: Props) {
  const [records, setRecords] = useState<PendingChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  // Filter tabs
  type FilterTab = "pending" | "all";
  const [tab, setTab] = useState<FilterTab>("pending");

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/pending-change-requests", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { records: PendingChangeRequest[] };
      setRecords(data.records);
    } catch (err) {
      onToast(`Failed to load Change Requests: ${String(err)}`, "error");
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function patch(
    id: string,
    billingApprovalStatus: "Approved" | "Rejected"
  ) {
    if (acting) return;
    setActing(id);
    try {
      const res = await fetch("/api/pending-change-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          billingApprovalStatus,
          // Mirror status to Approved/Rejected on the workflow status as well
          status: billingApprovalStatus === "Approved" ? "Approved" : "Rejected",
        }),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { record: PendingChangeRequest };
      setRecords((prev) =>
        prev.map((r) => (r.id === data.record.id ? data.record : r))
      );
      onToast(
        `Change Request ${data.record.id} — ${billingApprovalStatus} by Billing.`,
        billingApprovalStatus === "Approved" ? "success" : "info"
      );
    } catch (err) {
      onToast(`Action failed: ${String(err)}`, "error");
    } finally {
      setActing(null);
    }
  }

  const pendingCount = records.filter(
    (r) => r.billingApprovalStatus === "Pending"
  ).length;

  const displayed =
    tab === "pending"
      ? records.filter((r) => r.billingApprovalStatus === "Pending")
      : records;

  // Don't render the panel at all when there are no records
  if (!loading && records.length === 0) return null;

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: "#DDD6FE" }}
    >
      {/* Panel header */}
      <div
        className="px-5 py-4 border-b flex items-center justify-between gap-4 flex-wrap"
        style={{ background: "#FAF5FF", borderColor: "#DDD6FE" }}
      >
        <div>
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            {pendingCount > 0 && (
              <span
                className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-bold"
                style={{ background: "#7C3AED" }}
              >
                {pendingCount}
              </span>
            )}
            <p
              className="text-sm font-bold"
              style={{ color: "#4C1D95" }}
            >
              AM Change Requests — Billing Approval Queue
            </p>
          </div>
          <p className="text-xs" style={{ color: "#6D28D9" }}>
            Submitted by Account Management from Expansion Opportunities or
            Renewals. Billing must Approve or Reject each request.
          </p>
        </div>

        {/* Filter tabs */}
        <div
          className="flex items-center gap-1 rounded-lg p-1"
          style={{ background: "#EDE9FE" }}
        >
          {(["pending", "all"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="text-xs font-semibold px-3 py-1 rounded-md transition-colors"
              style={
                tab === t
                  ? { background: "white", color: "#4C1D95" }
                  : { color: "#6D28D9" }
              }
            >
              {t === "pending"
                ? `Pending (${pendingCount})`
                : `All (${records.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div
          className="px-5 py-8 text-center text-sm"
          style={{ color: "var(--rtm-text-muted)" }}
        >
          Loading change requests…
        </div>
      ) : displayed.length === 0 ? (
        <div
          className="px-5 py-8 text-center space-y-1"
          style={{ background: "var(--rtm-bg)" }}
        >
          <p className="text-sm font-semibold" style={{ color: "#4C1D95" }}>
            {tab === "pending"
              ? "No pending Change Requests"
              : "No Change Requests submitted yet"}
          </p>
          <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
            {tab === "pending"
              ? "All submitted requests have been reviewed by Billing."
              : "When AMs submit Change Requests they will appear here."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto" style={{ background: "var(--rtm-bg)" }}>
          <table className="min-w-full">
            <thead>
              <tr>
                <Th>Client</Th>
                <Th>Type</Th>
                <Th>Description</Th>
                <Th>Revenue Impact</Th>
                <Th>Departments</Th>
                <Th>Submitted</Th>
                <Th>Billing Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((cr) => {
                const isExpanded = expanded === cr.id;
                const isActing = acting === cr.id;
                const isSettled =
                  cr.billingApprovalStatus === "Approved" ||
                  cr.billingApprovalStatus === "Rejected";
                const bStyle = billingStatusVariant(cr.billingApprovalStatus);
                const tStyle = requestTypeVariant(cr.requestType);

                return (
                  <React.Fragment key={cr.id}>
                    <tr
                      onClick={() =>
                        setExpanded(isExpanded ? null : cr.id)
                      }
                      className="cursor-pointer transition-colors hover:bg-purple-50"
                      style={{
                        background: isExpanded
                          ? "#F5F3FF"
                          : "var(--rtm-bg)",
                      }}
                    >
                      {/* Client */}
                      <Td>
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <svg
                            className="w-3.5 h-3.5 flex-shrink-0 transition-transform"
                            style={{
                              color: "#7C3AED",
                              transform: isExpanded
                                ? "rotate(90deg)"
                                : "rotate(0deg)",
                            }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                          <span
                            className="font-semibold whitespace-nowrap"
                            style={{ color: "var(--rtm-text-primary)" }}
                          >
                            {cr.client}
                          </span>
                        </div>
                      </Td>

                      {/* Request type */}
                      <Td>
                        <StatusPill label={cr.requestType} style={tStyle} />
                      </Td>

                      {/* Description — truncated */}
                      <Td>
                        <span
                          className="block max-w-[240px] truncate"
                          title={cr.description}
                        >
                          {cr.description}
                        </span>
                      </Td>

                      {/* Revenue impact */}
                      <Td>
                        <span
                          className="font-semibold whitespace-nowrap"
                          style={{ color: revenueColor(cr.revenueImpact) }}
                        >
                          {fmt(cr.revenueImpact)}
                        </span>
                      </Td>

                      {/* Departments */}
                      <Td muted>
                        <span className="whitespace-nowrap">
                          {cr.departmentsImpacted.length > 0
                            ? cr.departmentsImpacted.slice(0, 2).join(", ") +
                              (cr.departmentsImpacted.length > 2
                                ? ` +${cr.departmentsImpacted.length - 2}`
                                : "")
                            : "—"}
                        </span>
                      </Td>

                      {/* Submitted date */}
                      <Td muted>
                        <span className="whitespace-nowrap">
                          {cr.submittedDate}
                        </span>
                      </Td>

                      {/* Billing approval status */}
                      <Td>
                        <StatusPill
                          label={cr.billingApprovalStatus}
                          style={bStyle}
                        />
                      </Td>

                      {/* Inline quick-actions (only for pending) */}
                      <Td>
                        {!isSettled ? (
                          <div
                            className="flex items-center gap-1.5 whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => void patch(cr.id, "Rejected")}
                              disabled={!!acting}
                              className="text-xs font-bold px-2.5 py-1 rounded border transition-opacity hover:opacity-80 disabled:opacity-40"
                              style={{
                                background: "#FEF2F2",
                                borderColor: "#FECACA",
                                color: "#DC2626",
                              }}
                            >
                              {isActing ? "…" : "Reject"}
                            </button>
                            <button
                              onClick={() => void patch(cr.id, "Approved")}
                              disabled={!!acting}
                              className="text-xs font-bold px-2.5 py-1 rounded text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                              style={{ background: "#059669" }}
                            >
                              {isActing ? "…" : "Approve"}
                            </button>
                          </div>
                        ) : (
                          <span
                            className="text-xs"
                            style={{ color: "var(--rtm-text-muted)" }}
                          >
                            Reviewed
                          </span>
                        )}
                      </Td>
                    </tr>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <tr>
                        <td
                          colSpan={8}
                          className="p-0"
                          style={{ borderBottom: "2px solid #DDD6FE" }}
                        >
                          <ExpandedRow
                            cr={cr}
                            acting={isActing}
                            onApprove={() => void patch(cr.id, "Approved")}
                            onReject={() => void patch(cr.id, "Rejected")}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer notice */}
      <div
        className="px-5 py-3 border-t"
        style={{ background: "#FAF5FF", borderColor: "#DDD6FE" }}
      >
        <p className="text-xs" style={{ color: "#6D28D9" }}>
          <span className="font-bold">Billing scope:</span> Approve to
          authorize the requested change for implementation by Account
          Management. Reject to return it for revision. Approved/Rejected status
          persists on refresh.
        </p>
      </div>
    </div>
  );
}
