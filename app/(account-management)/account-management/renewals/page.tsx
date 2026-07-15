"use client";

/**
 * RTM OS — Renewals
 * Route: /account-management/renewals
 *
 * DATA SOURCES (Phase 1 — real):
 *   MASTER_CLIENTS (lib/mock/master-clients.ts)
 *     → renewalDate, renewalStatus, monthlyValue (MRR), clientName, assignedAM,
 *       activeServices, billingStatus, paymentStatus, cancellationStatus,
 *       activationStatus — single source of truth for all renewal candidates.
 *   /api/renewal-status  (data/renewal-status.json)
 *     → lightweight overlay: decision (Renew / Renew with Changes / Decline /
 *       Pending) + notes, keyed by clientId — persists across refreshes.
 *   computeClientHealthScore() / computeHealth() from lib/mock/master-clients.ts
 *     → shared with Client Health page — no parallel formula.
 *
 * REAL ACTIONS:
 *   Renew      → PATCH /api/renewal-status { clientId, decision: "Renew" }
 *   Renew with Changes → opens SubmitChangeRequestModal (POSTs real change
 *                        request to /api/pending-change-requests) + marks
 *                        decision "Renew with Changes" in overlay
 *   Decline    → PATCH /api/renewal-status { clientId, decision: "Decline" }
 *
 * DEFERRED / BADGED "Preview — Target State":
 *   Executive Dashboard tab
 *   Score Model, Strategy, Timeline, Review Center, AI Insights, Proposal
 *   detail sub-tabs
 *   Auto-creation of renewal projects 90 days out
 *   QBR scheduling integration
 *   Sales / Billing handoff automation
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  MASTER_CLIENTS,
  computeHealth,
  computeClientHealthScore,
  RENEWAL_URGENT_DAYS,
  type MasterClient,
  type HealthStatus,
} from "@/lib/mock/master-clients";
import SubmitChangeRequestModal, {
  type PendingChangeRequest,
  type SubmitChangeRequestPrefill,
} from "@/components/account-management/SubmitChangeRequestModal";

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

export type RenewalDecision =
  | "Pending"
  | "Renew"
  | "Renew with Changes"
  | "Decline";

interface RenewalStatusRecord {
  clientId: string;
  decision: RenewalDecision;
  notes: string;
  updatedAt: string;
}

/** View-model: one row in the renewals list. */
interface RenewalVM {
  id: string;
  clientName: string;
  assignedAM: string;
  industry: string;
  avatarColor: string;
  mrr: number;
  activeServices: string[];
  renewalDate: string;
  renewalStatus: string;          // from MASTER_CLIENTS
  daysToRenewal: number | null;   // computed
  health: HealthStatus;           // from computeHealth()
  healthScore: number;            // from computeClientHealthScore()
  billingStatus: MasterClient["billingStatus"];
  paymentStatus: MasterClient["paymentStatus"];
  cancellationStatus: MasterClient["cancellationStatus"];
  activationStatus: MasterClient["activationStatus"];
  // overlay
  decision: RenewalDecision;
  notes: string;
  overlayUpdatedAt: string | null;
}

// ══════════════════════════════════════════════════════════════════════════════
// DATA HELPERS
// ══════════════════════════════════════════════════════════════════════════════

function daysUntil(isoDate: string): number | null {
  const target = new Date(isoDate);
  if (isNaN(target.getTime())) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86_400_000);
}

function fmt$(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(Math.abs(n) / 1_000).toFixed(0)}K`;
  return `$${Math.abs(n)}`;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/**
 * Build view-model list from MASTER_CLIENTS.
 * Only includes clients with a real renewalDate (not "—") and
 * activationStatus === "Active" — these are the genuine renewal candidates.
 * No clients are fabricated; no parallel data model is used.
 */
function buildRenewalVMs(
  overlayMap: Map<string, RenewalStatusRecord>
): RenewalVM[] {
  return MASTER_CLIENTS.filter(
    (c) =>
      c.renewalDate !== "—" &&
      c.renewalDate !== "" &&
      c.activationStatus === "Active"
  ).map((c) => {
    const health = computeHealth(c);
    const healthScore = computeClientHealthScore(c);
    const days = daysUntil(c.renewalDate);
    const overlay = overlayMap.get(c.id);
    return {
      id: c.id,
      clientName: c.clientName,
      assignedAM: c.assignedAM,
      industry: c.industry,
      avatarColor: c.avatarColor,
      mrr: c.monthlyValue,
      activeServices: c.activeServices,
      renewalDate: c.renewalDate,
      renewalStatus: c.renewalStatus,
      daysToRenewal: days,
      health,
      healthScore,
      billingStatus: c.billingStatus,
      paymentStatus: c.paymentStatus,
      cancellationStatus: c.cancellationStatus,
      activationStatus: c.activationStatus,
      decision: overlay?.decision ?? "Pending",
      notes: overlay?.notes ?? "",
      overlayUpdatedAt: overlay?.updatedAt ?? null,
    };
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// STYLING HELPERS
// ══════════════════════════════════════════════════════════════════════════════

function healthColor(h: HealthStatus): string {
  switch (h) {
    case "Excellent": return "#059669";
    case "Good":      return "#2563EB";
    case "At Risk":   return "#D97706";
    case "Critical":  return "#DC2626";
  }
}

function scoreColor(n: number): string {
  if (n >= 80) return "#059669";
  if (n >= 60) return "#D97706";
  if (n >= 40) return "#EA580C";
  return "#DC2626";
}

function daysColor(days: number | null): string {
  if (days === null) return "#64748B";
  if (days <= 0)  return "#DC2626";
  if (days <= 14) return "#DC2626";
  if (days <= 30) return "#EA580C";
  if (days <= 60) return "#D97706";
  return "#64748B";
}

function decisionStyle(d: RenewalDecision): { bg: string; color: string; border: string } {
  switch (d) {
    case "Renew":              return { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" };
    case "Renew with Changes": return { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" };
    case "Decline":            return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
    case "Pending":            return { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" };
  }
}

function healthBg(h: HealthStatus): { bg: string; border: string } {
  switch (h) {
    case "Excellent": return { bg: "#ECFDF5", border: "#A7F3D0" };
    case "Good":      return { bg: "#EFF6FF", border: "#BFDBFE" };
    case "At Risk":   return { bg: "#FFFBEB", border: "#FDE68A" };
    case "Critical":  return { bg: "#FEF2F2", border: "#FECACA" };
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// SHARED ATOMS
// ══════════════════════════════════════════════════════════════════════════════

function PreviewBadge({ label = "Preview — Target State" }: { label?: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border"
      style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#92400E" }}
    >
      {label}
    </span>
  );
}

function Badge({
  label,
  bg,
  color,
  border,
  dot,
}: {
  label: string;
  bg?: string;
  color?: string;
  border: string;
  dot?: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border whitespace-nowrap"
      style={{ background: bg, color, borderColor: border }}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: dot }}
        />
      )}
      {label}
    </span>
  );
}

function HealthBadge({ health }: { health: HealthStatus }) {
  const c = healthColor(health);
  const { bg, border } = healthBg(health);
  const dot =
    health === "Critical"
      ? "#DC2626"
      : health === "At Risk"
      ? "#D97706"
      : health === "Good"
      ? "#2563EB"
      : "#059669";
  return <Badge label={health} bg={bg} color={c} border={border} dot={dot} />;
}

function DecisionBadge({ decision }: { decision: RenewalDecision }) {
  const s = decisionStyle(decision);
  return <Badge label={decision} bg={s.bg} color={s.color} border={s.border} />;
}

function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1.5 text-2xl font-bold" style={{ color: accent ?? "#0F172A" }}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  desc,
  accentColor = "#1B4FD8",
  badge,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
  accentColor?: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--rtm-border)" }}>
      {eyebrow && (
        <p
          className="text-xs font-bold uppercase tracking-widest mb-0.5"
          style={{ color: accentColor }}
        >
          {eyebrow}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>
          {title}
        </h2>
        {badge}
      </div>
      {desc && <p className="text-sm text-slate-500 mt-0.5">{desc}</p>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DECISION ACTIONS PANEL
// ══════════════════════════════════════════════════════════════════════════════

interface DecisionActionsProps {
  vm: RenewalVM;
  onDecisionSaved: (record: RenewalStatusRecord) => void;
  onRenewWithChanges: (vm: RenewalVM) => void;
}

function DecisionActionsPanel({
  vm,
  onDecisionSaved,
  onRenewWithChanges,
}: DecisionActionsProps) {
  const [saving, setSaving] = useState<RenewalDecision | null>(null);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState(vm.notes);

  // Keep notes in sync if the parent vm changes
  useEffect(() => {
    setNotes(vm.notes);
  }, [vm.id, vm.notes]);

  async function saveDecision(decision: RenewalDecision) {
    if (decision === "Renew with Changes") {
      // Open modal instead — handled by parent
      onRenewWithChanges(vm);
      return;
    }
    setSaving(decision);
    setError("");
    try {
      const res = await fetch("/api/renewal-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: vm.id, decision, notes }),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        setError(d.error ?? "Failed to save decision.");
        return;
      }
      const d = (await res.json()) as { record: RenewalStatusRecord };
      onDecisionSaved(d.record);
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(null);
    }
  }

  async function saveNotesOnly() {
    setSaving("Pending");
    setError("");
    try {
      const res = await fetch("/api/renewal-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: vm.id, decision: vm.decision, notes }),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        setError(d.error ?? "Failed to save notes.");
        return;
      }
      const d = (await res.json()) as { record: RenewalStatusRecord };
      onDecisionSaved(d.record);
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(null);
    }
  }

  const currentDecision = vm.decision;
  const isBusy = saving !== null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader
        eyebrow="Decision Center"
        title="Renewal Decision"
        desc="Record the outcome for this renewal. Actions persist immediately."
        accentColor="#059669"
      />
      <div className="p-6 space-y-5">
        {/* Current decision */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">Current Decision:</span>
          <DecisionBadge decision={currentDecision} />
          {vm.overlayUpdatedAt && (
            <span className="text-[10px] text-slate-400">
              Updated {fmtDate(vm.overlayUpdatedAt)}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            disabled={isBusy || currentDecision === "Renew"}
            onClick={() => saveDecision("Renew")}
            className="rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-50 transition-opacity"
            style={{ background: "#059669" }}
          >
            {saving === "Renew" ? "Saving…" : "✓ Renew"}
          </button>

          <button
            disabled={isBusy}
            onClick={() => saveDecision("Renew with Changes")}
            className="rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-50 transition-opacity"
            style={{ background: "#1D4ED8" }}
          >
            {saving === "Renew with Changes"
              ? "Opening…"
              : "⟳ Renew with Changes"}
          </button>

          <button
            disabled={isBusy || currentDecision === "Decline"}
            onClick={() => saveDecision("Decline")}
            className="rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-50 transition-opacity"
            style={{ background: "#DC2626" }}
          >
            {saving === "Decline" ? "Saving…" : "✕ Decline"}
          </button>

          {currentDecision !== "Pending" && (
            <button
              disabled={isBusy}
              onClick={() => saveDecision("Pending")}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
            >
              Reset to Pending
            </button>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Strategy / Notes
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add renewal strategy notes, client concerns, or AM follow-up context…"
            className="w-full text-sm px-3 py-2 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-blue-100"
            style={{ background: "var(--rtm-bg, #F9FAFB)", borderColor: "#E2E8F0", color: "#0F172A" }}
          />
          <button
            disabled={isBusy || notes === vm.notes}
            onClick={saveNotesOnly}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-40"
          >
            {saving === "Pending" && vm.decision !== "Pending" ? "Saving…" : "Save Notes"}
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Decision guidance */}
        <div className="grid sm:grid-cols-3 gap-3 pt-1">
          {(
            [
              {
                decision: "Renew" as RenewalDecision,
                desc: "Client renewed as-is or with minor terms. AM confirms; Billing updates contract.",
              },
              {
                decision: "Renew with Changes" as RenewalDecision,
                desc: "Service or scope changes needed. Opens a real Change Request (POSTs to Billing queue).",
              },
              {
                decision: "Decline" as RenewalDecision,
                desc: "Client decided not to renew. AM leads retention or offboarding handoff.",
              },
            ] as { decision: RenewalDecision; desc: string }[]
          ).map(({ decision, desc }) => {
            const s = decisionStyle(decision);
            const isActive = currentDecision === decision;
            return (
              <div
                key={decision}
                className="rounded-xl border p-3 transition-all"
                style={{
                  background: isActive ? s.bg : "#F8FAFC",
                  borderColor: isActive ? s.border : "#E2E8F0",
                }}
              >
                <DecisionBadge decision={decision} />
                <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">{desc}</p>
                {isActive && (
                  <p className="mt-1 text-[10px] font-bold" style={{ color: s.color }}>
                    ← Current
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CLIENT PROFILE PANEL (real data)
// ══════════════════════════════════════════════════════════════════════════════

function ClientProfilePanel({ vm }: { vm: RenewalVM }) {
  const days = vm.daysToRenewal;
  const urgency =
    days === null
      ? "—"
      : days <= 0
      ? "Overdue"
      : `${days} days`;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader eyebrow="Client Profile" title="Renewal Profile" />
      <div className="p-6 space-y-5">
        {/* Health + decision summary */}
        <div className="flex flex-wrap gap-2">
          <HealthBadge health={vm.health} />
          <DecisionBadge decision={vm.decision} />
          <Badge
            label={vm.renewalStatus}
            bg="#F8FAFC"
            color="#475569"
            border="#E2E8F0"
          />
        </div>

        {/* Health score gauge */}
        <div className="flex items-center gap-4">
          <div
            className="flex flex-col items-center justify-center rounded-2xl border p-4 min-w-[100px]"
            style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}
          >
            <span
              className="text-4xl font-extrabold"
              style={{ color: scoreColor(vm.healthScore) }}
            >
              {vm.healthScore}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mt-1">
              Health Score
            </span>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Health Tier</span>
              <span className="font-bold" style={{ color: healthColor(vm.health) }}>
                {vm.health}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Renewal Date</span>
              <span
                className="font-bold"
                style={{ color: daysColor(vm.daysToRenewal) }}
              >
                {vm.renewalDate}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Days Until Renewal</span>
              <span
                className="font-bold"
                style={{ color: daysColor(vm.daysToRenewal) }}
              >
                {urgency}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">MRR</span>
              <span className="font-bold text-slate-800">
                ${vm.mrr.toLocaleString()}/mo
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">ARR</span>
              <span className="font-bold text-slate-800">
                ${(vm.mrr * 12).toLocaleString()}/yr
              </span>
            </div>
          </div>
        </div>

        {/* Data grid */}
        {(
          [
            { label: "Client", value: vm.clientName },
            { label: "Account Manager", value: vm.assignedAM },
            { label: "Industry", value: vm.industry },
            { label: "Billing Status", value: vm.billingStatus },
            { label: "Payment Status", value: vm.paymentStatus },
            { label: "Cancellation Status", value: vm.cancellationStatus },
          ] as { label: string; value: string }[]
        ).map(({ label, value }) => (
          <div
            key={label}
            className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0"
          >
            <span className="text-xs text-slate-500">{label}</span>
            <span className="text-xs font-semibold text-slate-800">{value}</span>
          </div>
        ))}

        {/* ── Stripe Subscription (groundwork — not yet live) ──────────────────────
             FUTURE LIVE INTEGRATION HOOK (Renewals / ClientProfilePanel):
             When Stripe is connected at launch:
               - Display stripeSubscriptionId from the matching MASTER_CLIENTS record
               - Status = current subscription status fetched from Stripe
                 (stripe.subscriptions.retrieve(stripeSubscriptionId))
               - "Sync Renewal to Stripe" should update subscription billing period:
                 stripe.subscriptions.update(id, { billing_cycle_anchor: renewalDate })
               - This is where AM confirms that a renewed subscription is active in Stripe
             ────────────────────────────────────────────────────────────────────── */}
        <div className="rounded-xl border p-4 space-y-2" style={{ borderColor: "#E2E8F0", background: "#F8FAFC" }}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748B" }}>Stripe Subscription</p>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border" style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#92400E" }}>
              Coming at launch
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs" style={{ color: "#94A3B8" }}>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#CBD5E1" }} />
              Not Connected — Stripe Subscription ID: —
            </div>
            <div className="relative group">
              <button
                disabled
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md border cursor-not-allowed opacity-60"
                style={{ background: "#F8FAFC", borderColor: "#CBD5E1", color: "#64748B" }}
              >
                Sync to Stripe
              </button>
              <div
                className="absolute bottom-full right-0 mb-1.5 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ whiteSpace: "nowrap" }}
              >
                <div className="rounded-lg px-3 py-1.5 text-[11px] font-medium shadow-lg"
                  style={{ background: "#1E293B", color: "#F8FAFC", border: "1px solid #334155" }}>
                  Not yet available — coming at launch
                  <div className="absolute top-full right-3 border-4 border-transparent"
                    style={{ borderTopColor: "#1E293B" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
            Active Services
          </p>
          <div className="flex flex-wrap gap-2">
            {vm.activeServices.map((s) => (
              <span
                key={s}
                className="rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-xs font-semibold text-blue-700"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Notes display */}
        {vm.notes && (
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              AM Strategy Notes
            </p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{vm.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CLIENT DETAIL PANEL (tabs)
// ══════════════════════════════════════════════════════════════════════════════

type DetailTab =
  | "profile"
  | "decision"
  | "score"
  | "strategy"
  | "timeline"
  | "review"
  | "ai"
  | "proposal";

const DETAIL_TABS: { id: DetailTab; label: string; deferred?: boolean }[] = [
  { id: "profile",  label: "Profile" },
  { id: "decision", label: "Decision" },
  { id: "score",    label: "Score Model",    deferred: true },
  { id: "strategy", label: "Strategy",       deferred: true },
  { id: "timeline", label: "Timeline",       deferred: true },
  { id: "review",   label: "Review Center",  deferred: true },
  { id: "ai",       label: "AI Insights",    deferred: true },
  { id: "proposal", label: "Proposal",       deferred: true },
];

interface ClientDetailPanelProps {
  vm: RenewalVM;
  onClose: () => void;
  onDecisionSaved: (record: RenewalStatusRecord) => void;
  onRenewWithChanges: (vm: RenewalVM) => void;
}

function ClientDetailPanel({
  vm,
  onClose,
  onDecisionSaved,
  onRenewWithChanges,
}: ClientDetailPanelProps) {
  const [tab, setTab] = useState<DetailTab>("profile");

  return (
    <div className="space-y-4">
      {/* Panel header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Client Detail
          </p>
          <h2 className="text-xl font-bold text-slate-900">{vm.clientName}</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            <HealthBadge health={vm.health} />
            <DecisionBadge decision={vm.decision} />
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-500 hover:bg-slate-50"
        >
          ← Back to Table
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {DETAIL_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-t-lg border border-b-0 px-4 py-2 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              tab === t.id
                ? "border-slate-200 bg-white text-blue-700 -mb-px z-10"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
            {t.deferred && (
              <span
                className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold border"
                style={{
                  background: "#FFFBEB",
                  borderColor: "#FDE68A",
                  color: "#92400E",
                }}
              >
                Preview
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {tab === "profile" && <ClientProfilePanel vm={vm} />}
        {tab === "decision" && (
          <DecisionActionsPanel
            vm={vm}
            onDecisionSaved={onDecisionSaved}
            onRenewWithChanges={onRenewWithChanges}
          />
        )}
        {(tab === "score" ||
          tab === "strategy" ||
          tab === "timeline" ||
          tab === "review" ||
          tab === "ai" ||
          tab === "proposal") && (
          <DeferredTab
            tabLabel={
              DETAIL_TABS.find((t) => t.id === tab)?.label ?? tab
            }
          />
        )}
      </div>
    </div>
  );
}

function DeferredTab({ tabLabel }: { tabLabel: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="p-10 flex flex-col items-center justify-center text-center space-y-3">
        <PreviewBadge label="Preview — Target State" />
        <h3 className="text-base font-bold text-slate-700">{tabLabel}</h3>
        <p className="text-sm text-slate-400 max-w-md">
          This view is part of the full Renewals engine target state and is
          deferred to a later phase. Real decision actions are available on the{" "}
          <strong>Decision</strong> tab.
        </p>
        <p className="text-xs text-slate-300">
          Deferred: multi-signal score model, strategy matrix, milestone
          timeline, cross-department review center, AI insights, and proposal
          preview.
        </p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// RENEWALS DASHBOARD (real data)
// ══════════════════════════════════════════════════════════════════════════════

function RenewalsDashboard({ vms }: { vms: RenewalVM[] }) {
  const total = vms.length;
  const due30 = vms.filter(
    (v) => v.daysToRenewal !== null && v.daysToRenewal >= 0 && v.daysToRenewal <= 30
  ).length;
  const due60 = vms.filter(
    (v) => v.daysToRenewal !== null && v.daysToRenewal >= 0 && v.daysToRenewal <= 60
  ).length;
  const due90 = vms.filter(
    (v) => v.daysToRenewal !== null && v.daysToRenewal >= 0 && v.daysToRenewal <= 90
  ).length;

  const atRisk = vms.filter(
    (v) => v.health === "At Risk" || v.health === "Critical"
  );
  const atRiskArr = atRisk.reduce((s, v) => s + v.mrr * 12, 0);
  const totalArr = vms.reduce((s, v) => s + v.mrr * 12, 0);

  const renewed = vms.filter((v) => v.decision === "Renew").length;
  const declined = vms.filter((v) => v.decision === "Decline").length;
  const withChanges = vms.filter(
    (v) => v.decision === "Renew with Changes"
  ).length;
  const pending = vms.filter((v) => v.decision === "Pending").length;

  const avgScore =
    total > 0
      ? Math.round(vms.reduce((s, v) => s + v.healthScore, 0) / total)
      : 0;

  return (
    <div className="space-y-5">
      {/* Upcoming Renewals */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
          Upcoming Renewals
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <KpiCard
            label="Renewals Due — 90 Days"
            value={due90}
            sub="contracts expiring within 90 days"
            accent="#1D4ED8"
          />
          <KpiCard
            label="Renewals Due — 60 Days"
            value={due60}
            sub="contracts expiring within 60 days"
            accent="#D97706"
          />
          <KpiCard
            label="Renewals Due — 30 Days"
            value={due30}
            sub={`${due30 > 0 ? "⚠ " : ""}contracts expiring within ${RENEWAL_URGENT_DAYS} days`}
            accent="#DC2626"
          />
        </div>
      </div>

      {/* Revenue */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
          Revenue
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <KpiCard
            label="Total Portfolio ARR"
            value={fmt$(totalArr)}
            sub="all active renewal candidates"
            accent="#059669"
          />
          <KpiCard
            label="Revenue At Risk"
            value={fmt$(atRiskArr)}
            sub="At Risk + Critical health clients"
            accent="#DC2626"
          />
          <KpiCard
            label="Avg Health Score"
            value={avgScore}
            sub="portfolio average (0–100)"
            accent={scoreColor(avgScore)}
          />
        </div>
      </div>

      {/* Decision Status */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
          Decision Status
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard
            label="Renewed"
            value={renewed}
            sub="confirmed renewals"
            accent="#059669"
          />
          <KpiCard
            label="Renew with Changes"
            value={withChanges}
            sub="change request submitted"
            accent="#1D4ED8"
          />
          <KpiCard
            label="Declined"
            value={declined}
            sub="client declined to renew"
            accent="#DC2626"
          />
          <KpiCard
            label="Pending Decision"
            value={pending}
            sub="awaiting AM action"
            accent="#64748B"
          />
        </div>
      </div>

      {/* At-Risk Summary */}
      {atRisk.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
            At-Risk Clients
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {atRisk
              .sort((a, b) => a.healthScore - b.healthScore)
              .slice(0, 6)
              .map((v) => {
                const { bg, border } = healthBg(v.health);
                return (
                  <div
                    key={v.id}
                    className="rounded-xl border p-4 flex items-center justify-between gap-4"
                    style={{ background: bg, borderColor: border }}
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {v.clientName}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {v.assignedAM} · Renewal {v.renewalDate}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 space-y-1">
                      <HealthBadge health={v.health} />
                      <p
                        className="text-sm font-bold"
                        style={{ color: "#DC2626" }}
                      >
                        {fmt$(v.mrr * 12)}/yr
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// RENEWAL TABLE (real data)
// ══════════════════════════════════════════════════════════════════════════════

type HealthFilter = HealthStatus | "All";
type DecisionFilter = RenewalDecision | "All";

const ALL_HEALTH_FILTERS: HealthFilter[] = [
  "All",
  "Excellent",
  "Good",
  "At Risk",
  "Critical",
];
const ALL_DECISION_FILTERS: DecisionFilter[] = [
  "All",
  "Pending",
  "Renew",
  "Renew with Changes",
  "Decline",
];

function RenewalTable({
  vms,
  onSelect,
}: {
  vms: RenewalVM[];
  onSelect: (vm: RenewalVM) => void;
}) {
  const [healthFilter, setHealthFilter] = useState<HealthFilter>("All");
  const [decisionFilter, setDecisionFilter] = useState<DecisionFilter>("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      vms.filter((v) => {
        if (healthFilter !== "All" && v.health !== healthFilter) return false;
        if (decisionFilter !== "All" && v.decision !== decisionFilter)
          return false;
        if (
          search &&
          !v.clientName.toLowerCase().includes(search.toLowerCase()) &&
          !v.assignedAM.toLowerCase().includes(search.toLowerCase())
        )
          return false;
        return true;
      }),
    [vms, healthFilter, decisionFilter, search]
  );

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader
        eyebrow="Renewal Portfolio"
        title="Renewal Table"
        desc="All active clients with real renewal dates — health score, MRR, and decision status."
      />

      <div className="px-6 py-3 border-b border-slate-100 flex flex-wrap items-center gap-3">
        <input
          placeholder="Search client or AM…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 w-52 outline-none focus:ring-2 focus:ring-blue-100"
        />
        <select
          value={healthFilter}
          onChange={(e) =>
            setHealthFilter(e.target.value as HealthFilter)
          }
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none"
        >
          {ALL_HEALTH_FILTERS.map((h) => (
            <option key={h} value={h}>
              {h === "All" ? "All Health Tiers" : h}
            </option>
          ))}
        </select>
        <select
          value={decisionFilter}
          onChange={(e) =>
            setDecisionFilter(e.target.value as DecisionFilter)
          }
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none"
        >
          {ALL_DECISION_FILTERS.map((d) => (
            <option key={d} value={d}>
              {d === "All" ? "All Decisions" : d}
            </option>
          ))}
        </select>
        <span className="ml-auto text-xs text-slate-400">
          {filtered.length} of {vms.length} clients
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ background: "var(--rtm-bg)" }}>
            <tr>
              {[
                "Client",
                "Account Manager",
                "MRR",
                "ARR",
                "Renewal Date",
                "Days",
                "Health Score",
                "Health",
                "Decision",
                "",
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
            {filtered.map((v) => (
              <tr
                key={v.id}
                className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer"
                onClick={() => onSelect(v)}
              >
                <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                  {v.clientName}
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                  {v.assignedAM}
                </td>
                <td className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">
                  ${v.mrr.toLocaleString()}
                </td>
                <td className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">
                  ${(v.mrr * 12).toLocaleString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: daysColor(v.daysToRenewal) }}
                  >
                    {v.renewalDate}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className="text-xs font-bold"
                    style={{ color: daysColor(v.daysToRenewal) }}
                  >
                    {v.daysToRenewal === null
                      ? "—"
                      : v.daysToRenewal <= 0
                      ? "Overdue"
                      : `${v.daysToRenewal}d`}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-1.5 rounded-full bg-slate-100">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${v.healthScore}%`,
                          background: scoreColor(v.healthScore),
                        }}
                      />
                    </div>
                    <span
                      className="text-xs font-bold"
                      style={{ color: scoreColor(v.healthScore) }}
                    >
                      {v.healthScore}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <HealthBadge health={v.health} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <DecisionBadge decision={v.decision} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(v);
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-10 text-center text-slate-400"
                >
                  No renewals match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// AT-RISK ACCOUNTS (real data)
// ══════════════════════════════════════════════════════════════════════════════

function AtRiskAccounts({
  vms,
  onSelect,
}: {
  vms: RenewalVM[];
  onSelect: (vm: RenewalVM) => void;
}) {
  const atRisk = vms
    .filter((v) => v.health === "At Risk" || v.health === "Critical")
    .sort((a, b) => a.healthScore - b.healthScore);

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader
        eyebrow="At-Risk Accounts"
        title="At-Risk Accounts"
        desc="Clients with At Risk or Critical health requiring immediate attention."
        accentColor="#DC2626"
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ background: "var(--rtm-bg)" }}>
            <tr>
              {[
                "Client",
                "Account Manager",
                "Health",
                "Health Score",
                "MRR",
                "Renewal Date",
                "Days",
                "Decision",
                "",
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
            {atRisk.map((v) => (
              <tr
                key={v.id}
                className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer"
                onClick={() => onSelect(v)}
              >
                <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                  {v.clientName}
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                  {v.assignedAM}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <HealthBadge health={v.health} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className="text-xs font-bold"
                    style={{ color: scoreColor(v.healthScore) }}
                  >
                    {v.healthScore}
                  </span>
                </td>
                <td
                  className="px-4 py-3 font-semibold whitespace-nowrap"
                  style={{ color: "#DC2626" }}
                >
                  ${v.mrr.toLocaleString()}/mo
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: daysColor(v.daysToRenewal) }}
                  >
                    {v.renewalDate}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className="text-xs font-bold"
                    style={{ color: daysColor(v.daysToRenewal) }}
                  >
                    {v.daysToRenewal === null
                      ? "—"
                      : v.daysToRenewal <= 0
                      ? "Overdue"
                      : `${v.daysToRenewal}d`}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <DecisionBadge decision={v.decision} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(v);
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
            {atRisk.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-10 text-center text-slate-400"
                >
                  No at-risk accounts in the current renewal portfolio.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          {atRisk.length} at-risk renewal
          {atRisk.length !== 1 ? "s" : ""}
        </p>
        <p className="text-xs font-semibold" style={{ color: "#DC2626" }}>
          Revenue At Risk:{" "}
          {fmt$(atRisk.reduce((s, v) => s + v.mrr * 12, 0))}/yr
        </p>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// EXECUTIVE DASHBOARD — deferred
// ══════════════════════════════════════════════════════════════════════════════

function ExecutiveDashboardDeferred() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader
        eyebrow="Executive Dashboard"
        title="Executive Renewals Dashboard"
        badge={<PreviewBadge label="Preview — Target State" />}
        accentColor="#1D4ED8"
        desc="Portfolio-level executive view with cross-department signals."
      />
      <div className="p-10 flex flex-col items-center justify-center text-center space-y-3">
        <PreviewBadge label="Preview — Target State" />
        <p className="text-sm text-slate-400 max-w-md">
          The Executive Dashboard view is deferred to a later phase. It will
          include portfolio-level revenue KPIs, at-risk summaries, retention
          opportunity forecasts, and cross-department issue signals.
        </p>
        <p className="text-xs text-slate-300">
          Deferred: QBR scheduling integration, Sales / Billing handoff
          automation, auto-creation of renewal projects 90 days out.
        </p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TOP-LEVEL TABS
// ══════════════════════════════════════════════════════════════════════════════

type MainTab = "dashboard" | "table" | "at-risk" | "executive";

const MAIN_TABS: { id: MainTab; label: string; deferred?: boolean }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "table",     label: "Renewal Table" },
  { id: "at-risk",   label: "At-Risk Accounts" },
  { id: "executive", label: "Executive Dashboard", deferred: true },
];

// ══════════════════════════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════════════════════════

export default function RenewalsPage() {
  const [mainTab, setMainTab] = useState<MainTab>("dashboard");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ── Overlay state (from /api/renewal-status) ─────────────────────────────
  const [overlayRecords, setOverlayRecords] = useState<RenewalStatusRecord[]>(
    []
  );
  const [overlayLoading, setOverlayLoading] = useState(true);

  useEffect(() => {
    setOverlayLoading(true);
    fetch("/api/renewal-status")
      .then((r) => r.json())
      .then((d: { records: RenewalStatusRecord[] }) => {
        setOverlayRecords(d.records ?? []);
      })
      .catch(() => {
        setOverlayRecords([]);
      })
      .finally(() => setOverlayLoading(false));
  }, []);

  const overlayMap = useMemo(() => {
    const m = new Map<string, RenewalStatusRecord>();
    for (const r of overlayRecords) m.set(r.clientId, r);
    return m;
  }, [overlayRecords]);

  // ── View models (always real MASTER_CLIENTS + overlay) ───────────────────
  const vms = useMemo(
    () => buildRenewalVMs(overlayMap),
    [overlayMap]
  );

  const selectedVM = useMemo(
    () => vms.find((v) => v.id === selectedId) ?? null,
    [vms, selectedId]
  );

  // ── Overlay update callback ───────────────────────────────────────────────
  function handleDecisionSaved(record: RenewalStatusRecord) {
    setOverlayRecords((prev) => {
      const idx = prev.findIndex((r) => r.clientId === record.clientId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = record;
        return next;
      }
      return [...prev, record];
    });
  }

  // ── "Renew with Changes" modal state ─────────────────────────────────────
  const [changeModalVM, setChangeModalVM] = useState<RenewalVM | null>(null);

  function handleRenewWithChanges(vm: RenewalVM) {
    setChangeModalVM(vm);
  }

  async function handleChangeRequestSubmitted(record: PendingChangeRequest) {
    if (!changeModalVM) return;
    // Also persist the decision overlay as "Renew with Changes"
    try {
      const res = await fetch("/api/renewal-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: changeModalVM.id,
          decision: "Renew with Changes",
          notes: `Change Request submitted: ${record.id} — ${record.description}`,
        }),
      });
      if (res.ok) {
        const d = (await res.json()) as { record: RenewalStatusRecord };
        handleDecisionSaved(d.record);
      }
    } catch {
      // non-fatal — CR was already submitted
    }
    setChangeModalVM(null);
  }

  // ── Summary numbers for header ────────────────────────────────────────────
  const totalArr = vms.reduce((s, v) => s + v.mrr * 12, 0);
  const atRiskArr = vms
    .filter((v) => v.health === "At Risk" || v.health === "Critical")
    .reduce((s, v) => s + v.mrr * 12, 0);
  const due30Count = vms.filter(
    (v) =>
      v.daysToRenewal !== null &&
      v.daysToRenewal >= 0 &&
      v.daysToRenewal <= RENEWAL_URGENT_DAYS
  ).length;

  // ── If detail panel is open, render it ───────────────────────────────────
  if (selectedVM) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Account Management
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Renewals</h1>
        </div>

        <ClientDetailPanel
          vm={selectedVM}
          onClose={() => setSelectedId(null)}
          onDecisionSaved={handleDecisionSaved}
          onRenewWithChanges={handleRenewWithChanges}
        />

        {changeModalVM && (
          <SubmitChangeRequestModal
            onClose={() => setChangeModalVM(null)}
            onSubmitted={handleChangeRequestSubmitted}
            prefill={
              {
                client: changeModalVM.clientName,
                requestType: "Contract Amendment",
                description: `Renewal with service or scope changes for ${changeModalVM.clientName}. Review current active services and amend contract terms accordingly.`,
                project: changeModalVM.activeServices.join(", ") || "General",
                revenueImpact: 0,
              } satisfies SubmitChangeRequestPrefill
            }
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Account Management
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Renewals</h1>
          <p className="text-sm text-slate-500 mt-1">
            Revenue retention engine — real renewal tracking synced with Client
            Health.
          </p>
          {overlayLoading && (
            <p className="text-xs text-slate-400 mt-1">Loading decisions…</p>
          )}
        </div>
        <div className="flex gap-3 text-sm">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-center shadow-sm">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
              Portfolio ARR
            </p>
            <p className="text-lg font-extrabold text-slate-900 mt-0.5">
              {fmt$(totalArr)}
            </p>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-center shadow-sm">
            <p
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: "#DC2626" }}
            >
              At Risk
            </p>
            <p
              className="text-lg font-extrabold mt-0.5"
              style={{ color: "#DC2626" }}
            >
              {fmt$(atRiskArr)}
            </p>
          </div>
          {due30Count > 0 && (
            <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-center shadow-sm">
              <p
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: "#EA580C" }}
              >
                Due ≤ 30d
              </p>
              <p
                className="text-lg font-extrabold mt-0.5"
                style={{ color: "#EA580C" }}
              >
                {due30Count}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {MAIN_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setMainTab(t.id)}
            className={`rounded-t-lg border border-b-0 px-4 py-2.5 text-sm font-semibold transition-colors flex items-center gap-1.5 ${
              mainTab === t.id
                ? "border-slate-200 bg-white text-blue-700 -mb-px z-10"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
            {t.deferred && (
              <span
                className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold border"
                style={{
                  background: "#FFFBEB",
                  borderColor: "#FDE68A",
                  color: "#92400E",
                }}
              >
                Preview
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[400px]">
        {mainTab === "dashboard" && <RenewalsDashboard vms={vms} />}
        {mainTab === "table" && (
          <RenewalTable vms={vms} onSelect={(v) => setSelectedId(v.id)} />
        )}
        {mainTab === "at-risk" && (
          <AtRiskAccounts vms={vms} onSelect={(v) => setSelectedId(v.id)} />
        )}
        {mainTab === "executive" && <ExecutiveDashboardDeferred />}
      </div>

      {/* "Renew with Changes" modal (can also be triggered from list-level quick action) */}
      {changeModalVM && (
        <SubmitChangeRequestModal
          onClose={() => setChangeModalVM(null)}
          onSubmitted={handleChangeRequestSubmitted}
          prefill={
            {
              client: changeModalVM.clientName,
              requestType: "Contract Amendment",
              description: `Renewal with service or scope changes for ${changeModalVM.clientName}. Review current active services and amend contract terms accordingly.`,
              project: changeModalVM.activeServices.join(", ") || "General",
              revenueImpact: 0,
            } satisfies SubmitChangeRequestPrefill
          }
        />
      )}
    </div>
  );
}
