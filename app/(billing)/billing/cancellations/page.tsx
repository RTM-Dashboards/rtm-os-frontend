"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("billing")!;

// ── Types ─────────────────────────────────────────────────────────────────────

type BadgeVariant = "success" | "error" | "warning" | "info" | "neutral" | "pending";

interface CancellationQueueRow {
  id: string;
  client: string;
  service: string;
  cancellationReason: string;
  requestedBy: string;
  effectiveDate: string;
  billingImpact: string;
  campaignCancellationStatus: string;
  campaignVariant: BadgeVariant;
  departmentNotified: boolean;
  amNotified: boolean;
  offboardingTrigger: boolean;
  status: string;
  statusVariant: BadgeVariant;
  nextAction: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

// Cancellation Queue
const cancellationQueue: CancellationQueueRow[] = [
  {
    id: "c1",
    client: "Green Valley Pools",
    service: "SEO",
    cancellationReason: "Client declined renewal",
    requestedBy: "Client",
    effectiveDate: "Nov 01",
    billingImpact: "-$2,200/mo",
    campaignCancellationStatus: "Pending",
    campaignVariant: "warning",
    departmentNotified: false,
    amNotified: true,
    offboardingTrigger: false,
    status: "Pending Billing Action",
    statusVariant: "warning",
    nextAction: "Notify SEO dept, stop billing",
  },
  {
    id: "c2",
    client: "Green Valley Pools",
    service: "Meta Ads",
    cancellationReason: "Client declined renewal",
    requestedBy: "Client",
    effectiveDate: "Nov 01",
    billingImpact: "-$2,200/mo",
    campaignCancellationStatus: "Pending",
    campaignVariant: "warning",
    departmentNotified: false,
    amNotified: true,
    offboardingTrigger: false,
    status: "Pending Billing Action",
    statusVariant: "warning",
    nextAction: "Notify Paid Media dept",
  },
  {
    id: "c3",
    client: "Sunbelt HVAC",
    service: "Reporting",
    cancellationReason: "Service removed at renewal",
    requestedBy: "AM",
    effectiveDate: "Oct 01",
    billingImpact: "-$300/mo",
    campaignCancellationStatus: "Not Applicable",
    campaignVariant: "neutral",
    departmentNotified: false,
    amNotified: true,
    offboardingTrigger: false,
    status: "Billing Update Needed",
    statusVariant: "warning",
    nextAction: "Notify Operations of removal",
  },
  {
    id: "c4",
    client: "Sunbelt HVAC",
    service: "Content",
    cancellationReason: "Client requested pause",
    requestedBy: "Client",
    effectiveDate: "Jun 01",
    billingImpact: "$0 (paused)",
    campaignCancellationStatus: "Paused",
    campaignVariant: "neutral",
    departmentNotified: true,
    amNotified: true,
    offboardingTrigger: false,
    status: "Paused",
    statusVariant: "neutral",
    nextAction: "Monitor — resume or cancel",
  },
  {
    id: "c5",
    client: "Metro Dental",
    service: "All Services",
    cancellationReason: "Contract terminated early — client moved to competitor",
    requestedBy: "Client",
    effectiveDate: "Jun 01",
    billingImpact: "-$1,800/mo",
    campaignCancellationStatus: "All Campaigns Cancelled",
    campaignVariant: "error",
    departmentNotified: true,
    amNotified: true,
    offboardingTrigger: true,
    status: "Final Invoice Pending",
    statusVariant: "warning",
    nextAction: "Issue final invoice",
  },
  {
    id: "c6",
    client: "Harbor Auto Group",
    service: "LSA",
    cancellationReason: "Service not performing",
    requestedBy: "AM",
    effectiveDate: "Jul 01",
    billingImpact: "-$400/mo",
    campaignCancellationStatus: "Pending",
    campaignVariant: "warning",
    departmentNotified: false,
    amNotified: true,
    offboardingTrigger: false,
    status: "In Review",
    statusVariant: "info",
    nextAction: "Approve cancellation, notify dept",
  },
  {
    id: "c7",
    client: "Cornerstone Flooring",
    service: "All Services",
    cancellationReason: "Failed payment — services on hold",
    requestedBy: "Billing",
    effectiveDate: "Jun 15",
    billingImpact: "-$3,200/mo",
    campaignCancellationStatus: "On Hold",
    campaignVariant: "error",
    departmentNotified: true,
    amNotified: true,
    offboardingTrigger: false,
    status: "Services On Hold",
    statusVariant: "error",
    nextAction: "Collections agency follow-up",
  },
  {
    id: "c8",
    client: "Pacific Dental",
    service: "LSA",
    cancellationReason: "Service add at renewal — approved",
    requestedBy: "AM",
    effectiveDate: "Jan 01",
    billingImpact: "+$400/mo",
    campaignCancellationStatus: "Active",
    campaignVariant: "success",
    departmentNotified: false,
    amNotified: true,
    offboardingTrigger: false,
    status: "Billing Approval Needed",
    statusVariant: "warning",
    nextAction: "Approve LSA billing add",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

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
    <td className="px-3 py-2.5 text-sm border-b"
      style={{ color: muted ? "var(--rtm-text-muted)" : "var(--rtm-text-secondary)", borderColor: "var(--rtm-border-light)" }}>
      {children}
    </td>
  );
}

function CheckIcon({ on }: { on: boolean }) {
  return on ? <span className="text-base">✅</span> : <span className="text-base text-gray-300">⬜</span>;
}

function ActionBtn({ label, onClick, variant = "secondary" }: {
  label: string; onClick: () => void; variant?: "primary" | "secondary" | "danger";
}) {
  const base = "text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer whitespace-nowrap";
  const styles: Record<string, string> = {
    primary:   "bg-[var(--rtm-blue,#1B4FD8)] text-white border-transparent hover:opacity-90",
    secondary: "bg-[var(--rtm-surface,#fff)] text-[var(--rtm-text-primary)] border-[var(--rtm-border)] hover:bg-[var(--rtm-bg)]",
    danger:    "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] hover:bg-[#FEE2E2]",
  };
  return <button className={`${base} ${styles[variant]}`} onClick={onClick}>{label}</button>;
}

// ── Campaign Cancellation Trigger Flow ────────────────────────────────────────

function CampaignCancellationTrigger() {
  const steps = [
    { label: "Cancellation Approved",    color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
    { label: "Notify Department",        color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
    { label: "Cancel Campaign / Service",color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
    { label: "Update Billing",           color: "#1B4FD8", bg: "#EFF6FF", border: "#BFDBFE" },
    { label: "Trigger Offboarding",      color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  ];
  return (
    <div className="rounded-xl border p-4" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#DC2626" }}>
        Campaign Cancellation Trigger Flow
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {steps.map((s, i) => (
          <React.Fragment key={s.label}>
            <span className="text-xs font-semibold px-3 py-1 rounded-lg border"
              style={{ background: s.bg, color: s.color, borderColor: s.border }}>
              {s.label}
            </span>
            {i < steps.length - 1 && <span className="text-sm" style={{ color: "var(--rtm-border)" }}>→</span>}
          </React.Fragment>
        ))}
      </div>
      <p className="text-xs mt-3" style={{ color: "#9F1239" }}>
        When a cancellation is approved, Billing notifies the relevant department, stops the campaign, updates the
        billing schedule, and triggers offboarding if the client is fully cancelling.
      </p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BillingCancellationsPage() {
  const [selected, setSelected] = useState<CancellationQueueRow | null>(null);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [noteText, setNoteText] = useState("");

  function log(msg: string) {
    setActionLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 9)]);
  }

  // Summary counts
  const pending   = cancellationQueue.filter((c) => c.statusVariant === "warning").length;
  const blocked   = cancellationQueue.filter((c) => c.statusVariant === "error").length;
  const completed = cancellationQueue.filter((c) => c.statusVariant === "success").length;
  const offboarding = cancellationQueue.filter((c) => c.offboardingTrigger).length;

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>
          {workspace.name}
        </p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
          Cancellations
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          Cancellation queue — trigger campaign cancellations, notify departments, and initiate offboarding.
        </p>
      </div>

      {/* ── Summary ── */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Pending Action",  value: pending,    color: "#D97706" },
          { label: "Blocked / Hold",  value: blocked,    color: "#DC2626" },
          { label: "Completed",       value: completed,  color: "#059669" },
          { label: "Offboarding Triggered", value: offboarding, color: "#7C3AED" },
          { label: "Total",           value: cancellationQueue.length, color: "#1B4FD8" },
        ].map((s) => (
          <div key={s.label} className="flex flex-col px-4 py-3 rounded-lg border min-w-[110px]"
            style={{ background: `${s.color}12`, borderColor: `${s.color}40` }}>
            <span className="text-xs font-medium" style={{ color: "var(--rtm-text-muted)" }}>{s.label}</span>
            <span className="text-xl font-bold mt-0.5" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* ── Campaign Cancellation Trigger ── */}
      <CampaignCancellationTrigger />

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── Cancellation Queue ───────────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <SectionWrapper
        title="Cancellation Queue"
        description="All active cancellation and service change records. Click a row to open actions."
      >
        {/* Global actions */}
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--rtm-text-muted)" }}>Cancellation Actions</p>
          <div className="flex flex-wrap gap-2">
            <ActionBtn variant="primary"   label="Start Cancellation"       onClick={() => log("Start Cancellation triggered")} />
            <ActionBtn variant="danger"    label="Cancel Service"            onClick={() => log("Cancel Service triggered")} />
            <ActionBtn variant="secondary" label="Pause Billing"             onClick={() => log("Pause Billing triggered")} />
            <ActionBtn variant="secondary" label="Notify Department"         onClick={() => log("Notify Department triggered")} />
            <ActionBtn variant="secondary" label="Notify AM"                 onClick={() => log("Notify AM triggered")} />
            <ActionBtn variant="secondary" label="Trigger Campaign Cancellation" onClick={() => log("Campaign Cancellation triggered")} />
            <ActionBtn variant="secondary" label="Trigger Offboarding"      onClick={() => log("Offboarding triggered")} />
            <ActionBtn variant="secondary" label="Add Cancellation Note"    onClick={() => log("Cancellation Note added")} />
            <ActionBtn variant="secondary" label="Mark Cancelled"           onClick={() => log("Marked Cancelled")} />
          </div>
        </div>

        {/* Cancellation status legend */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { label: "In Review",            bg: "#EFF6FF", color: "#1B4FD8", border: "#BFDBFE" },
            { label: "Pending Billing Action",bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
            { label: "Billing Update Needed", bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
            { label: "Paused",               bg: "#F9FAFB", color: "#6B7280", border: "#E5E7EB" },
            { label: "Final Invoice Pending", bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
            { label: "Services On Hold",     bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
            { label: "Cancelled",            bg: "#ECFDF5", color: "#065F46", border: "#A7F3D0" },
          ].map((s) => (
            <span key={s.label} className="text-xs font-semibold px-2.5 py-1 rounded-full border"
              style={{ background: s.bg, color: s.color, borderColor: s.border }}>
              {s.label}
            </span>
          ))}
        </div>

        <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--rtm-border-light)" }}>
          <table className="min-w-full">
            <thead>
              <tr>
                <Th>Client</Th>
                <Th>Service</Th>
                <Th>Cancellation Reason</Th>
                <Th>Requested By</Th>
                <Th>Effective Date</Th>
                <Th>Billing Impact</Th>
                <Th>Campaign Status</Th>
                <Th>Dept Notified</Th>
                <Th>AM Notified</Th>
                <Th>Offboarding</Th>
                <Th>Status</Th>
                <Th>Next Action</Th>
              </tr>
            </thead>
            <tbody>
              {cancellationQueue.map((row) => {
                const isSelected = selected?.id === row.id;
                return (
                  <tr
                    key={row.id}
                    onClick={() => setSelected(isSelected ? null : row)}
                    className="cursor-pointer transition-colors"
                    style={{ background: isSelected ? "#EFF6FF" : "var(--rtm-bg)" }}
                  >
                    <Td>
                      <span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{row.client}</span>
                    </Td>
                    <Td muted>{row.service}</Td>
                    <Td muted>
                      <span className="block max-w-[180px] whitespace-normal leading-tight text-xs">{row.cancellationReason}</span>
                    </Td>
                    <Td muted>{row.requestedBy}</Td>
                    <Td muted>{row.effectiveDate}</Td>
                    <Td>
                      <span style={{
                        color: row.billingImpact.startsWith("-") ? "#DC2626" : row.billingImpact.startsWith("+") ? "#059669" : "var(--rtm-text-muted)",
                        fontWeight: 600
                      }}>
                        {row.billingImpact}
                      </span>
                    </Td>
                    <Td>
                      <StatusBadge variant={row.campaignVariant} label={row.campaignCancellationStatus} size="sm" />
                    </Td>
                    <Td><CheckIcon on={row.departmentNotified} /></Td>
                    <Td><CheckIcon on={row.amNotified} /></Td>
                    <Td><CheckIcon on={row.offboardingTrigger} /></Td>
                    <Td>
                      <StatusBadge variant={row.statusVariant} label={row.status} size="sm" />
                    </Td>
                    <Td muted>
                      <span className="block max-w-[160px] whitespace-normal leading-tight text-xs">{row.nextAction}</span>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

      {/* ── Cancellation Action Panel ── */}
      {selected && (
        <div className="rounded-xl border p-6 space-y-5" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                Cancellation Actions — {selected.client} / {selected.service}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                Effective: {selected.effectiveDate} · Impact: {selected.billingImpact} · Requested by: {selected.requestedBy}
              </p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
              style={{ color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border)" }}
            >
              ✕ Close
            </button>
          </div>

          {/* Status indicators */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs"
              style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
              <span style={{ color: "var(--rtm-text-muted)" }}>Dept Notified:</span>
              <CheckIcon on={selected.departmentNotified} />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs"
              style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
              <span style={{ color: "var(--rtm-text-muted)" }}>AM Notified:</span>
              <CheckIcon on={selected.amNotified} />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs"
              style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
              <span style={{ color: "var(--rtm-text-muted)" }}>Offboarding:</span>
              <CheckIcon on={selected.offboardingTrigger} />
            </div>
          </div>

          {/* Cancellation action buttons */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>Actions</p>
            <div className="flex flex-wrap gap-2">
              <ActionBtn variant="primary"   label="Start Cancellation"        onClick={() => log(`Cancellation started: ${selected.client} — ${selected.service}`)} />
              <ActionBtn variant="danger"    label="Cancel Service"             onClick={() => log(`Service cancelled: ${selected.client} — ${selected.service}`)} />
              <ActionBtn variant="secondary" label="Pause Billing"              onClick={() => log(`Billing paused: ${selected.client} — ${selected.service}`)} />
              <ActionBtn variant="secondary" label="Notify Department"          onClick={() => log(`Department notified: ${selected.client}`)} />
              <ActionBtn variant="secondary" label="Notify AM"                  onClick={() => log(`AM notified: ${selected.client}`)} />
              <ActionBtn variant="secondary" label="Trigger Campaign Cancellation" onClick={() => log(`Campaign cancellation triggered: ${selected.client} — ${selected.service}`)} />
              <ActionBtn variant="secondary" label="Trigger Offboarding"        onClick={() => log(`Offboarding triggered: ${selected.client}`)} />
              <ActionBtn variant="secondary" label="Mark Cancelled"             onClick={() => log(`Marked Cancelled: ${selected.client} — ${selected.service}`)} />
            </div>
          </div>

          {/* Add cancellation note */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Add Cancellation Note</p>
            <textarea
              rows={2}
              placeholder="Add a note about this cancellation…"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border resize-none"
              style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
            />
            <ActionBtn variant="primary" label="Save Note" onClick={() => { log(`Cancellation note saved: "${noteText}"`); setNoteText(""); }} />
          </div>

          {/* Action log */}
          {actionLog.length > 0 && (
            <div className="rounded-lg border p-3" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
              <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>Action Log</p>
              <div className="space-y-1">
                {actionLog.map((entry, i) => (
                  <p key={i} className="text-xs font-mono" style={{ color: "var(--rtm-text-secondary)" }}>{entry}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Footer nav ── */}
      <div className="flex gap-2">
        <Link href={workspace.dashboardRoute} className="rtm-btn-secondary text-sm inline-flex items-center gap-1">← Dashboard</Link>
        <Link href="/billing/offboarding"     className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Offboarding →</Link>
        <Link href={workspace.tasksRoute}     className="rtm-btn-primary  text-sm inline-flex items-center gap-1">Tasks →</Link>
      </div>
    </div>
  );
}
