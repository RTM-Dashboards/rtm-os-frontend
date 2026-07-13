"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RoleToggle } from "@/components/am-role-toggle";
import { AM_NAMES, SARAH, type AMRole } from "@/lib/account-management/role-data";
import { needsAssignment } from "@/lib/account-management/needs-assignment";
import {
  fetchMasterClients,
  patchMasterClient,
  fetchReassignmentEvents,
  postReassignmentEvent,
  type ReassignmentEvent,
} from "@/lib/mock/master-clients-api";
import type { MasterClient } from "@/lib/mock/master-clients";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function healthBadgeStyle(h: string): React.CSSProperties {
  switch (h) {
    case "Excellent": return { background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" };
    case "Good":      return { background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" };
    case "At Risk":   return { background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" };
    case "Critical":  return { background: "#FEF2F2", color: "#991B1B", borderColor: "#FECACA" };
    default:          return { background: "#F8FAFC", color: "#64748B", borderColor: "#E2E8F0" };
  }
}

function priorityBadgeStyle(p: string): React.CSSProperties {
  switch (p) {
    case "High":   return { background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" };
    case "Medium": return { background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" };
    case "Low":    return { background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" };
    default:       return { background: "#F8FAFC", color: "#64748B", borderColor: "#E2E8F0" };
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch {
    return iso;
  }
}

// Derive per-AM workload from live MASTER_CLIENTS
function buildWorkload(clients: MasterClient[]) {
  return AM_NAMES.map((am) => {
    const assigned = clients.filter((c) => c.assignedAM === am);
    const atRisk = assigned.filter(
      (c) => c.clientHealth === "At Risk" || c.clientHealth === "Critical"
    ).length;
    return { am, total: assigned.length, atRisk, clients: assigned };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Reassign Modal
// ─────────────────────────────────────────────────────────────────────────────

interface ReassignModalProps {
  client: MasterClient;
  onClose: () => void;
  onDone: () => void;
}

function ReassignModal({ client, onClose, onDone }: ReassignModalProps) {
  const [selectedAM, setSelectedAM] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [handoffNote, setHandoffNote] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Only allow reassignment to a different AM (or from Unassigned is initial assignment — handled by Client Portfolio)
  const eligibleAMs = AM_NAMES.filter((am) => am !== client.assignedAM);

  const handleReassign = useCallback(async () => {
    if (!selectedAM) return;
    setSaving(true);
    setError(null);
    try {
      const now = new Date().toISOString();

      // 1. Patch the client record
      await patchMasterClient(client.id, {
        assignedAM: selectedAM,
        assignedAt: now,
        handoffNote: handoffNote.trim() || undefined,
      });

      // 2. Record the reassignment event
      await postReassignmentEvent({
        clientId: client.id,
        clientName: client.clientName,
        from: client.assignedAM,
        to: selectedAM,
        date: now,
        reason: reason.trim(),
        handoffNote: handoffNote.trim() || undefined,
      });

      setSuccess(true);
      setTimeout(onDone, 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reassignment failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [client, selectedAM, reason, handoffNote, onDone]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1">
              Reassign Client
            </p>
            <h2 className="text-lg font-bold text-slate-900">{client.clientName}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Currently assigned to{" "}
              <span className="font-semibold text-slate-700">{client.assignedAM}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl font-bold leading-none mt-1"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {success ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center">
            <p className="text-sm font-bold text-emerald-800">✓ Reassignment Saved</p>
            <p className="text-xs text-emerald-700 mt-1">
              {client.clientName} has been reassigned to <strong>{selectedAM}</strong>.
              The event has been logged to Assignment History.
            </p>
          </div>
        ) : (
          <>
            {/* New AM select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Reassign To
              </label>
              <select
                value={selectedAM}
                onChange={(e) => setSelectedAM(e.target.value)}
                disabled={saving}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="">Select Account Manager…</option>
                {eligibleAMs.map((am) => (
                  <option key={am} value={am}>{am}</option>
                ))}
              </select>
              {eligibleAMs.length === 0 && (
                <p className="text-xs text-slate-400">No other AMs available.</p>
              )}
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Reason for Reassignment
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={saving}
                placeholder="e.g. Load rebalancing, AM departure, industry fit…"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            {/* Handoff note */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Handoff Note <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <textarea
                value={handoffNote}
                onChange={(e) => setHandoffNote(e.target.value)}
                disabled={saving}
                rows={3}
                placeholder="Context for the incoming AM — ongoing issues, key contacts, next action…"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 font-medium">{error}</p>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={onClose}
                disabled={saving}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReassign}
                disabled={!selectedAM || saving}
                className="rounded-lg px-4 py-2 text-sm font-bold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "var(--rtm-blue)" }}
              >
                {saving ? "Saving…" : "Confirm Reassignment"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Head View
// ─────────────────────────────────────────────────────────────────────────────

function HeadView() {
  const [liveClients, setLiveClients] = useState<MasterClient[]>([]);
  const [history, setHistory] = useState<ReassignmentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAM, setFilterAM] = useState("All");
  const [filterHealth, setFilterHealth] = useState("All");
  const [reassignTarget, setReassignTarget] = useState<MasterClient | null>(null);
  // Client-picker for the header "Reassign Client" button
  const [pickingClient, setPickingClient] = useState(false);
  const [pickedClientId, setPickedClientId] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [clients, events] = await Promise.all([
        fetchMasterClients(),
        fetchReassignmentEvents(),
      ]);
      setLiveClients(clients);
      setHistory(events);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  // Only show assigned clients in the reassignment queue (unassigned belong in Client Portfolio)
  const assignedClients = liveClients.filter(
    (c) => c.assignedAM !== "Unassigned" && c.assignedAM !== ""
  );
  // Shared predicate — same condition used by Client Portfolio's KPI so counts always match.
  const unassignedCount = liveClients.filter(needsAssignment).length;

  const workload = buildWorkload(liveClients);
  const overloadedCount = workload.filter((w) => w.total > 5).length;
  const avgAccounts =
    assignedClients.length > 0
      ? Math.round(assignedClients.length / AM_NAMES.length)
      : 0;

  // Filtered queue
  const filteredQueue = assignedClients.filter((c) => {
    if (filterAM !== "All" && c.assignedAM !== filterAM) return false;
    if (filterHealth !== "All" && c.clientHealth !== filterHealth) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Account Managers", value: AM_NAMES.length },
          {
            label: "Overloaded AMs",
            value: overloadedCount,
            warn: overloadedCount > 0,
          },
          { label: "Avg Accounts / AM", value: avgAccounts },
          {
            label: "Needs Assignment",
            value: unassignedCount,
            sub: "→ Client Portfolio",
            href: "/account-management/client-portfolio",
          },
        ].map(({ label, value, warn, sub, href }) => (
          <div
            key={label}
            className="rounded-xl border p-4"
            style={{
              background: "var(--rtm-surface)",
              borderColor: warn ? "#FECACA" : "var(--rtm-border)",
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: warn ? "#DC2626" : "var(--rtm-text-muted)" }}
            >
              {label}
            </p>
            <p
              className="mt-1.5 text-2xl font-bold"
              style={{ color: warn ? "#DC2626" : "var(--rtm-text-primary)" }}
            >
              {loading ? "—" : value}
            </p>
            {sub && href && (
              <a
                href={href}
                className="text-xs font-semibold underline mt-1 block"
                style={{ color: "var(--rtm-blue)" }}
              >
                {sub}
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Head Actions — reassignment-scoped only */}
      <section
        className="rounded-xl border px-6 py-5"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
          Head Management Actions
        </p>
        <div className="flex flex-wrap gap-2">
          {/* "Reassign Client" opens the client-picker then the real ReassignModal */}
          <button
            onClick={() => { setPickingClient(true); setPickedClientId(""); }}
            className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
            style={{ background: "var(--rtm-blue)", color: "#fff" }}
          >
            Reassign Client
          </button>
          {["Review Overloaded AMs", "Balance Assignments", "Create Manager Note", "Export View"].map((label) => (
            <button
              key={label}
              className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
              style={{
                background: "var(--rtm-surface)",
                color: "var(--rtm-text-primary)",
                border: "1px solid var(--rtm-border)",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Client picker — shown when header "Reassign Client" is clicked */}
        {pickingClient && (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-xs font-bold text-blue-800 mr-2">Select client to reassign:</p>
            <select
              value={pickedClientId}
              onChange={(e) => setPickedClientId(e.target.value)}
              className="rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">Choose a client…</option>
              {assignedClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.clientName} — {c.assignedAM}
                </option>
              ))}
            </select>
            <button
              disabled={!pickedClientId}
              onClick={() => {
                const target = assignedClients.find((c) => c.id === pickedClientId);
                if (target) {
                  setReassignTarget(target);
                  setPickingClient(false);
                  setPickedClientId("");
                }
              }}
              className="rounded-lg px-4 py-2 text-sm font-bold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "var(--rtm-blue)" }}
            >
              Open Reassign Modal
            </button>
            <button
              onClick={() => { setPickingClient(false); setPickedClientId(""); }}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
        <p className="mt-3 text-xs text-slate-400">
          Initial assignment of unassigned clients is handled in{" "}
          <a
            href="/account-management/client-portfolio"
            className="font-semibold underline"
            style={{ color: "var(--rtm-blue)" }}
          >
            Client Portfolio
          </a>
          . This page owns reassignment and capacity oversight only.
        </p>
      </section>

      {/* Full Assignment Queue — live from MASTER_CLIENTS */}
      <section
        className="rounded-xl border"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <div
          className="px-6 py-4 flex flex-wrap items-center justify-between gap-3"
          style={{ borderBottom: "1px solid var(--rtm-border)" }}
        >
          <div>
            <h2
              className="text-base font-bold"
              style={{ color: "var(--rtm-text-primary)" }}
            >
              Full Assignment Queue
            </h2>
            <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
              All assigned clients across all Account Managers — live from MASTER_CLIENTS.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={filterAM}
              onChange={(e) => setFilterAM(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5"
            >
              <option value="All">All AMs</option>
              {AM_NAMES.map((am) => (
                <option key={am}>{am}</option>
              ))}
            </select>
            <select
              value={filterHealth}
              onChange={(e) => setFilterHealth(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5"
            >
              <option value="All">All Health</option>
              {["Excellent", "Good", "At Risk", "Critical"].map((h) => (
                <option key={h}>{h}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-center text-slate-400 text-sm">
            Loading client data…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: "var(--rtm-bg)" }}>
                <tr>
                  {[
                    "Client",
                    "Assigned AM",
                    "Industry",
                    "MRR",
                    "Services",
                    "Health",
                    "Priority",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                      style={{ color: "var(--rtm-text-muted)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredQueue.map((c) => (
                  <tr
                    key={c.id}
                    className="border-t transition-colors"
                    style={{ borderColor: "var(--rtm-border-light)" }}
                  >
                    <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">
                      {c.clientName}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {c.assignedAM}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                      {c.industry}
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium whitespace-nowrap">
                      {c.monthlyValue > 0 ? `$${c.monthlyValue.toLocaleString()}/mo` : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs max-w-[180px] truncate">
                      {c.activeServices.length > 0 ? c.activeServices.join(", ") : "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold"
                        style={healthBadgeStyle(c.clientHealth)}
                      >
                        {c.clientHealth}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold"
                        style={priorityBadgeStyle(c.priority)}
                      >
                        {c.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                      {c.currentStatus}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => setReassignTarget(c)}
                        className="text-xs font-semibold hover:underline"
                        style={{ color: "var(--rtm-blue)" }}
                      >
                        Reassign
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredQueue.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-8 text-center text-slate-400"
                    >
                      No clients match the filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* AM Load Balancing — real client counts from MASTER_CLIENTS */}
      <section
        className="rounded-xl border"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <div
          className="px-6 py-4"
          style={{ borderBottom: "1px solid var(--rtm-border)" }}
        >
          <h2
            className="text-base font-bold"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            AM Load Balancing
          </h2>
          <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
            Current client load per Account Manager — derived from live MASTER_CLIENTS data.
          </p>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-center text-slate-400 text-sm">
            Loading workload data…
          </div>
        ) : (
          <>
            {/* Unassigned callout */}
            {unassignedCount > 0 && (
              <div className="mx-5 mt-5 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-1">
                      🔔 {unassignedCount} Client{unassignedCount !== 1 ? "s" : ""} Need
                      {unassignedCount === 1 ? "s" : ""} Assignment
                    </p>
                    <p className="text-xs text-amber-700">
                      Initial assignment is handled in Client Portfolio, where Billing-cleared
                      clients can be assigned to an AM directly from their record drawer.
                    </p>
                  </div>
                  <a
                    href="/account-management/client-portfolio"
                    className="inline-flex rounded-lg px-4 py-2 text-xs font-bold text-white whitespace-nowrap"
                    style={{ background: "#D97706" }}
                  >
                    Go to Client Portfolio →
                  </a>
                </div>
              </div>
            )}

            <div className="grid gap-4 p-5 sm:grid-cols-3">
              {workload.map(({ am, total, atRisk }) => {
                // Target capacity is 7 for load bar reference
                const TARGET = 7;
                const pct = Math.round((total / TARGET) * 100);
                const overloaded = total > 5;
                return (
                  <div
                    key={am}
                    className="rounded-xl border p-4"
                    style={{
                      background: "var(--rtm-surface)",
                      borderColor: overloaded ? "#FECACA" : "var(--rtm-border)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <p className="text-sm font-bold text-slate-800">{am}</p>
                      {overloaded && (
                        <span
                          className="text-xs font-bold rounded-full px-2 py-0.5"
                          style={{
                            background: "#FEF2F2",
                            color: "#DC2626",
                            border: "1px solid #FECACA",
                          }}
                        >
                          Overloaded
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Assigned Clients</span>
                        <span className="font-bold text-slate-800">{total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">At Risk / Critical</span>
                        <span
                          className="font-bold"
                          style={{ color: atRisk > 0 ? "#DC2626" : "#059669" }}
                        >
                          {atRisk}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            background: overloaded ? "#EF4444" : "#3B82F6",
                          }}
                        />
                      </div>
                      <p
                        className="font-semibold text-xs"
                        style={{
                          color: overloaded ? "#DC2626" : "var(--rtm-text-secondary)",
                        }}
                      >
                        {pct}% of target capacity ({TARGET} clients)
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* Assignment / Reassignment History — live from reassignment-events */}
      <section
        className="rounded-xl border"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <div
          className="px-6 py-4"
          style={{ borderBottom: "1px solid var(--rtm-border)" }}
        >
          <h2
            className="text-base font-bold"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            Reassignment History
          </h2>
          <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
            Live log of all AM reassignment events recorded on this page.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: "var(--rtm-bg)" }}>
              <tr>
                {["Client", "From", "To", "Date", "Reason", "Handoff Note"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                    style={{ color: "var(--rtm-text-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!loading && history.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-slate-400 text-sm"
                  >
                    No reassignment events yet. Use the Reassign action above to record one.
                  </td>
                </tr>
              ) : (
                history.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t transition-colors"
                    style={{ borderColor: "var(--rtm-border-light)" }}
                  >
                    <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">
                      {row.clientName}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {row.from}
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-semibold whitespace-nowrap">
                      {row.to}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                      {formatDate(row.date)}
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-[200px] text-xs">
                      {row.reason || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-400 max-w-[200px] text-xs italic">
                      {row.handoffNote || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Reassign Modal */}
      {reassignTarget && (
        <ReassignModal
          client={reassignTarget}
          onClose={() => setReassignTarget(null)}
          onDone={() => {
            setReassignTarget(null);
            void loadData();
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AM View
// ─────────────────────────────────────────────────────────────────────────────

function AMView() {
  const [liveClients, setLiveClients] = useState<MasterClient[]>([]);
  const [history, setHistory] = useState<ReassignmentEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [clients, events] = await Promise.all([
        fetchMasterClients(),
        fetchReassignmentEvents(),
      ]);
      setLiveClients(clients);
      setHistory(events);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  const myClients = liveClients.filter((c) => c.assignedAM === SARAH);
  const myHistory = history.filter((e) => e.to === SARAH || e.from === SARAH);

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "My Assigned Clients", value: myClients.length },
          {
            label: "At Risk / Critical",
            value: myClients.filter(
              (c) => c.clientHealth === "At Risk" || c.clientHealth === "Critical"
            ).length,
          },
          {
            label: "Renewal Due ≤30 days",
            value: myClients.filter((c) => {
              if (!c.renewalDate || c.renewalDate === "—") return false;
              const days = Math.round(
                (new Date(c.renewalDate).getTime() - Date.now()) / 86_400_000
              );
              return days >= 0 && days <= 30;
            }).length,
          },
          { label: "My Reassignments (Total)", value: myHistory.length },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl border p-4"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              {label}
            </p>
            <p
              className="mt-1.5 text-2xl font-bold"
              style={{ color: "var(--rtm-text-primary)" }}
            >
              {loading ? "—" : value}
            </p>
          </div>
        ))}
      </div>

      {/* My Client List — read-only */}
      <section
        className="rounded-xl border"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--rtm-border)" }}>
          <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            My Assigned Clients
          </h2>
          <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
            Live view of clients assigned to {SARAH}. Reassignment is a Head-only action.
          </p>
        </div>
        {loading ? (
          <div className="px-6 py-8 text-center text-slate-400 text-sm">
            Loading your clients…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: "var(--rtm-bg)" }}>
                <tr>
                  {["Client", "Industry", "MRR", "Services", "Health", "Priority", "Status"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                        style={{ color: "var(--rtm-text-muted)" }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {myClients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      No clients assigned to {SARAH}.
                    </td>
                  </tr>
                ) : (
                  myClients.map((c) => (
                    <tr
                      key={c.id}
                      className="border-t"
                      style={{ borderColor: "var(--rtm-border-light)" }}
                    >
                      <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">
                        {c.clientName}
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                        {c.industry}
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium whitespace-nowrap">
                        {c.monthlyValue > 0 ? `$${c.monthlyValue.toLocaleString()}/mo` : "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs max-w-[180px] truncate">
                        {c.activeServices.length > 0 ? c.activeServices.join(", ") : "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className="inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold"
                          style={healthBadgeStyle(c.clientHealth)}
                        >
                          {c.clientHealth}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className="inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold"
                          style={priorityBadgeStyle(c.priority)}
                        >
                          {c.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {c.currentStatus}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-6 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-400 italic">
            Reassignment requests must be submitted to your manager. This page is read-only
            in AM view.
          </p>
        </div>
      </section>

      {/* My Reassignment History */}
      {myHistory.length > 0 && (
        <section
          className="rounded-xl border"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <div
            className="px-6 py-4"
            style={{ borderBottom: "1px solid var(--rtm-border)" }}
          >
            <h2
              className="text-base font-bold"
              style={{ color: "var(--rtm-text-primary)" }}
            >
              My Reassignment History
            </h2>
            <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
              Reassignment events involving your clients.
            </p>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {myHistory.map((e) => (
              <div
                key={e.id}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <p className="text-sm font-bold text-slate-800 mb-2">{e.clientName}</p>
                <div className="space-y-1 text-xs">
                  <div className="flex gap-2">
                    <span className="text-slate-400">From:</span>
                    <span className="text-slate-700">{e.from}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-400">To:</span>
                    <span className="font-semibold text-blue-700">{e.to}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-400">Date:</span>
                    <span className="text-slate-600">{formatDate(e.date)}</span>
                  </div>
                  {e.reason && (
                    <p className="text-slate-500 mt-1 pt-1 border-t border-slate-100">
                      {e.reason}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function AssignmentsPage() {
  const [role, setRole] = useState<AMRole>("head");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
          Account Management
        </p>
        <h1 className="text-2xl font-bold text-slate-900">Account Assignments</h1>
        <p className="text-sm text-slate-500 mt-1">
          AM capacity overview and client reassignment workflows. Initial assignment of
          unassigned clients is handled in{" "}
          <a
            href="/account-management/client-portfolio"
            className="font-semibold underline text-blue-600"
          >
            Client Portfolio
          </a>
          .
        </p>
      </div>

      {/* Client Lifecycle Status */}
      <div
        className="rounded-2xl border p-5 space-y-3"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500">
            Client Lifecycle Status — Assignments
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {[
            {
              stage: "Ready For Assignment",
              active: true,
              color: "#10B981",
              textC: "#fff",
            },
            {
              stage: "Assigned",
              active: true,
              color: "#3B82F6",
              textC: "#fff",
            },
            {
              stage: "Onboarding",
              active: false,
              color: "#ECFDF5",
              textC: "#065F46",
            },
            {
              stage: "Service Activation",
              active: false,
              color: "#ECFDF5",
              textC: "#065F46",
            },
            {
              stage: "Department Launch",
              active: false,
              color: "#ECFDF5",
              textC: "#065F46",
            },
            {
              stage: "Active",
              active: false,
              color: "#ECFDF5",
              textC: "#065F46",
            },
          ].map((s, i, arr) => (
            <React.Fragment key={s.stage}>
              <div
                className="px-2.5 py-1 rounded-lg text-xs font-bold border"
                style={{
                  background: s.active ? s.color : "#fff",
                  color: s.active ? s.textC : "#94A3B8",
                  borderColor: s.active ? s.color : "#E2E8F0",
                }}
              >
                {s.stage}
              </div>
              {i < arr.length - 1 && (
                <span className="text-slate-300">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
        <p className="text-xs font-semibold text-indigo-700">
          Reassignment can happen at any active stage. Initial assignment happens in{" "}
          <strong>Client Portfolio</strong> for clients with{" "}
          <strong>Ready For Assignment</strong> status.
        </p>
      </div>

      {/* Role Toggle */}
      <RoleToggle role={role} onRoleChange={setRole} />

      {/* Role content */}
      {role === "head" ? <HeadView /> : <AMView />}
    </div>
  );
}
