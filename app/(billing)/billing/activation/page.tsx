"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("billing")!;

// ── Types ─────────────────────────────────────────────────────────────────────

type ActivationStatus =
  | "Awaiting Payment"
  | "Payment Confirmed"
  | "Ready For Onboarding"
  | "Onboarding"
  | "Department Activation Pending"
  | "Sent To AM"
  | "AM Accepted"
  | "Activated";

type BadgeVariant = "success" | "error" | "warning" | "info" | "neutral" | "pending";

interface ActivationQueueRow {
  id: string;
  client: string;
  invoiceStatus: string;
  invoiceVariant: BadgeVariant;
  paymentStatus: string;
  paymentVariant: BadgeVariant;
  servicesPurchased: string;
  activationStatus: ActivationStatus;
  deptActivationStatus: string;
  deptVariant: BadgeVariant;
  readyForAM: boolean;
  assignedAM: string;
  nextAction: string;
}

interface ServiceActivationRow {
  id: string;
  client: string;
  service: string;
  purchased: boolean;
  billingApproved: boolean;
  deptActivationStatus: string;
  deptVariant: BadgeVariant;
  amLaunchStatus: string;
  amVariant: BadgeVariant;
  department: string;
  nextAction: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

// Activation Queue
const activationQueue: ActivationQueueRow[] = [
  {
    id: "a1",
    client: "Apex Roofing",
    invoiceStatus: "Sent",                invoiceVariant: "info",
    paymentStatus: "Awaiting Payment",    paymentVariant: "warning",
    servicesPurchased: "SEO, GBP, Reporting",
    activationStatus: "Awaiting Payment",
    deptActivationStatus: "On Hold",      deptVariant: "neutral",
    readyForAM: false,
    assignedAM: "Unassigned",
    nextAction: "Follow up on payment",
  },
  {
    id: "a2",
    client: "Pacific Dental",
    invoiceStatus: "Paid",                invoiceVariant: "success",
    paymentStatus: "Confirmed",           paymentVariant: "success",
    servicesPurchased: "Meta Ads, Google Ads, LSA",
    activationStatus: "Sent To AM",
    deptActivationStatus: "Onboarding",   deptVariant: "info",
    readyForAM: true,
    assignedAM: "Carlos M.",
    nextAction: "None — active",
  },
  {
    id: "a3",
    client: "Sunbelt HVAC",
    invoiceStatus: "Partially Paid",      invoiceVariant: "warning",
    paymentStatus: "Partial",             paymentVariant: "warning",
    servicesPurchased: "Content, Reporting",
    activationStatus: "Awaiting Payment",
    deptActivationStatus: "On Hold",      deptVariant: "neutral",
    readyForAM: false,
    assignedAM: "Unassigned",
    nextAction: "Collect remaining balance",
  },
  {
    id: "a4",
    client: "Harbor Auto Group",
    invoiceStatus: "Paid",                invoiceVariant: "success",
    paymentStatus: "Confirmed",           paymentVariant: "success",
    servicesPurchased: "Full Bundle",
    activationStatus: "Activated",
    deptActivationStatus: "Active",       deptVariant: "success",
    readyForAM: true,
    assignedAM: "Maria L.",
    nextAction: "Monitor renewal",
  },
  {
    id: "a5",
    client: "Metro Dental",
    invoiceStatus: "Draft",               invoiceVariant: "neutral",
    paymentStatus: "Not Sent",            paymentVariant: "neutral",
    servicesPurchased: "SEO, GBP, Call Tracking",
    activationStatus: "Awaiting Payment",
    deptActivationStatus: "On Hold",      deptVariant: "neutral",
    readyForAM: false,
    assignedAM: "Unassigned",
    nextAction: "Generate and send invoice",
  },
  {
    id: "a6",
    client: "Blue Ridge Plumbing",
    invoiceStatus: "Paid",                invoiceVariant: "success",
    paymentStatus: "Confirmed",           paymentVariant: "success",
    servicesPurchased: "SEO, GBP, Reporting",
    activationStatus: "Ready For Onboarding",
    deptActivationStatus: "Department Activation Pending", deptVariant: "warning",
    readyForAM: false,
    assignedAM: "Unassigned",
    nextAction: "Approve GBP billing, push to AM",
  },
  {
    id: "a7",
    client: "Skyline Landscaping",
    invoiceStatus: "Paid",                invoiceVariant: "success",
    paymentStatus: "Confirmed",           paymentVariant: "success",
    servicesPurchased: "GBP, Yelp, Reporting",
    activationStatus: "Activated",
    deptActivationStatus: "Active",       deptVariant: "success",
    readyForAM: true,
    assignedAM: "Sarah K.",
    nextAction: "None",
  },
  {
    id: "a8",
    client: "Ironclad Fitness",
    invoiceStatus: "Ready To Send",       invoiceVariant: "warning",
    paymentStatus: "Not Sent",            paymentVariant: "neutral",
    servicesPurchased: "SEO, PPC, Social",
    activationStatus: "Awaiting Payment",
    deptActivationStatus: "On Hold",      deptVariant: "neutral",
    readyForAM: false,
    assignedAM: "Unassigned",
    nextAction: "Send invoice",
  },
];

// Service Activation Table
const serviceActivationTable: ServiceActivationRow[] = [
  { id: "sa1",  client: "Pacific Dental",      service: "Meta Ads",     purchased: true, billingApproved: true,  deptActivationStatus: "Active",            deptVariant: "success", amLaunchStatus: "Launched",  amVariant: "success", department: "Paid Media",  nextAction: "None" },
  { id: "sa2",  client: "Pacific Dental",      service: "Google Ads",   purchased: true, billingApproved: true,  deptActivationStatus: "Active",            deptVariant: "success", amLaunchStatus: "Launched",  amVariant: "success", department: "Paid Media",  nextAction: "None" },
  { id: "sa3",  client: "Pacific Dental",      service: "LSA",          purchased: true, billingApproved: false, deptActivationStatus: "Pending Approval",  deptVariant: "warning", amLaunchStatus: "Pending",   amVariant: "warning", department: "Paid Media",  nextAction: "Approve LSA billing" },
  { id: "sa4",  client: "Blue Ridge Plumbing", service: "SEO",          purchased: true, billingApproved: true,  deptActivationStatus: "Active",            deptVariant: "success", amLaunchStatus: "Launched",  amVariant: "success", department: "SEO",         nextAction: "None" },
  { id: "sa5",  client: "Blue Ridge Plumbing", service: "GBP",          purchased: true, billingApproved: false, deptActivationStatus: "Pending Approval",  deptVariant: "warning", amLaunchStatus: "Pending",   amVariant: "warning", department: "SEO",         nextAction: "Approve GBP billing" },
  { id: "sa6",  client: "Blue Ridge Plumbing", service: "Reporting",    purchased: true, billingApproved: false, deptActivationStatus: "Pending Approval",  deptVariant: "warning", amLaunchStatus: "Pending",   amVariant: "warning", department: "Operations",  nextAction: "Approve Reporting billing" },
  { id: "sa7",  client: "Harbor Auto Group",   service: "Full Bundle",  purchased: true, billingApproved: true,  deptActivationStatus: "Active",            deptVariant: "success", amLaunchStatus: "Launched",  amVariant: "success", department: "All Depts",   nextAction: "None" },
  { id: "sa8",  client: "Skyline Landscaping", service: "GBP",          purchased: true, billingApproved: true,  deptActivationStatus: "Active",            deptVariant: "success", amLaunchStatus: "Launched",  amVariant: "success", department: "SEO",         nextAction: "None" },
  { id: "sa9",  client: "Skyline Landscaping", service: "Yelp",         purchased: true, billingApproved: true,  deptActivationStatus: "Active",            deptVariant: "success", amLaunchStatus: "Launched",  amVariant: "success", department: "SEO",         nextAction: "None" },
  { id: "sa10", client: "Skyline Landscaping", service: "Reporting",    purchased: true, billingApproved: true,  deptActivationStatus: "Active",            deptVariant: "success", amLaunchStatus: "Launched",  amVariant: "success", department: "Operations",  nextAction: "None" },
  { id: "sa11", client: "Apex Roofing",        service: "SEO",          purchased: true, billingApproved: false, deptActivationStatus: "Awaiting Payment",  deptVariant: "neutral", amLaunchStatus: "On Hold",   amVariant: "neutral", department: "SEO",         nextAction: "Await payment, then approve" },
  { id: "sa12", client: "Apex Roofing",        service: "GBP",          purchased: true, billingApproved: false, deptActivationStatus: "Awaiting Payment",  deptVariant: "neutral", amLaunchStatus: "On Hold",   amVariant: "neutral", department: "SEO",         nextAction: "Await payment, then approve" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function activationStatusVariant(s: ActivationStatus): BadgeVariant {
  switch (s) {
    case "Activated":                    return "success";
    case "AM Accepted":                  return "success";
    case "Sent To AM":                   return "info";
    case "Department Activation Pending":return "warning";
    case "Onboarding":                   return "info";
    case "Ready For Onboarding":         return "info";
    case "Payment Confirmed":            return "info";
    case "Awaiting Payment":             return "warning";
    default:                             return "neutral";
  }
}

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

// ── Activation Pipeline Flow ──────────────────────────────────────────────────

function ActivationPipelineFlow() {
  const steps = [
    { label: "Invoice Paid",              color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
    { label: "Payment Confirmed",         color: "#1B4FD8", bg: "#EFF6FF", border: "#BFDBFE" },
    { label: "Ready For Onboarding",      color: "#0891B2", bg: "#F0F9FF", border: "#BAE6FD" },
    { label: "Dept Activation = Onboarding", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
    { label: "Push To Account Management",color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
  ];
  return (
    <div className="rounded-xl border p-4" style={{ background: "#F5F3FF", borderColor: "#DDD6FE" }}>
      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#7C3AED" }}>
        Activation Pipeline Flow
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
      <p className="text-xs mt-3" style={{ color: "#5B21B6" }}>
        After invoice is paid and payment is confirmed, Billing approves activation, sets dept status to Onboarding,
        and pushes the client to Account Management for assignment.
      </p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const ACTIVATION_STATUSES: ActivationStatus[] = [
  "Awaiting Payment",
  "Payment Confirmed",
  "Ready For Onboarding",
  "Onboarding",
  "Department Activation Pending",
  "Sent To AM",
  "AM Accepted",
  "Activated",
];

export default function BillingActivationPage() {
  const [selected, setSelected] = useState<ActivationQueueRow | null>(null);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [noteText, setNoteText] = useState("");

  function log(msg: string) {
    setActionLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 9)]);
  }

  // Summary counts
  const awaitingPayment = activationQueue.filter((r) => r.activationStatus === "Awaiting Payment").length;
  const paymentConfirmed = activationQueue.filter((r) => r.paymentVariant === "success").length;
  const readyForOnboarding = activationQueue.filter((r) => r.activationStatus === "Ready For Onboarding").length;
  const activated = activationQueue.filter((r) => r.activationStatus === "Activated").length;
  const sentToAM = activationQueue.filter((r) => r.activationStatus === "Sent To AM" || r.readyForAM).length;

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>
          {workspace.name}
        </p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
          Activation / Department Activation
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          Paid clients ready for onboarding and department activation. Manage the full activation pipeline from payment confirmation to AM handoff.
        </p>
      </div>

      {/* ── Summary ── */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Awaiting Payment",   value: awaitingPayment,  color: "#D97706" },
          { label: "Payment Confirmed",  value: paymentConfirmed, color: "#1B4FD8" },
          { label: "Ready For Onboarding", value: readyForOnboarding, color: "#0891B2" },
          { label: "Sent To AM",         value: sentToAM,         color: "#7C3AED" },
          { label: "Activated",          value: activated,        color: "#059669" },
          { label: "Total",              value: activationQueue.length, color: "#6B7280" },
        ].map((s) => (
          <div key={s.label} className="flex flex-col px-4 py-3 rounded-lg border min-w-[120px]"
            style={{ background: `${s.color}12`, borderColor: `${s.color}40` }}>
            <span className="text-xs font-medium" style={{ color: "var(--rtm-text-muted)" }}>{s.label}</span>
            <span className="text-xl font-bold mt-0.5" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* ── Activation status legend ── */}
      <div className="flex flex-wrap gap-2">
        {ACTIVATION_STATUSES.map((s) => {
          const v = activationStatusVariant(s);
          const colors: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
            success: { bg: "#ECFDF5", color: "#065F46", border: "#A7F3D0" },
            error:   { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
            warning: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
            info:    { bg: "#EFF6FF", color: "#1B4FD8", border: "#BFDBFE" },
            neutral: { bg: "#F9FAFB", color: "#6B7280", border: "#E5E7EB" },
            pending: { bg: "#FFF7ED", color: "#D97706", border: "#FDE68A" },
          };
          const c = colors[v];
          return (
            <span key={s} className="text-xs font-semibold px-2.5 py-1 rounded-full border"
              style={{ background: c.bg, color: c.color, borderColor: c.border }}>
              {s}
            </span>
          );
        })}
      </div>

      {/* ── Activation Pipeline Flow ── */}
      <ActivationPipelineFlow />

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── Activation Queue ─────────────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <SectionWrapper
        title="Activation Queue"
        description="Clients in the activation pipeline — click a row to open activation actions"
      >
        {/* Global activation actions */}
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--rtm-text-muted)" }}>Activation Actions</p>
          <div className="flex flex-wrap gap-2">
            <ActionBtn variant="primary"   label="Confirm Payment"                 onClick={() => log("Confirm Payment triggered")} />
            <ActionBtn variant="primary"   label="Approve Activation"              onClick={() => log("Approve Activation triggered")} />
            <ActionBtn variant="secondary" label="Set Dept Status To Onboarding"   onClick={() => log("Dept Activation set to Onboarding")} />
            <ActionBtn variant="secondary" label="Push To Account Management"      onClick={() => log("Pushed to Account Management")} />
            <ActionBtn variant="secondary" label="Create Assignment Request"       onClick={() => log("Assignment Request created")} />
            <ActionBtn variant="secondary" label="Add Activation Note"             onClick={() => log("Activation Note added")} />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--rtm-border-light)" }}>
          <table className="min-w-full">
            <thead>
              <tr>
                <Th>Client</Th>
                <Th>Invoice Status</Th>
                <Th>Payment Status</Th>
                <Th>Services Purchased</Th>
                <Th>Activation Status</Th>
                <Th>Dept Activation Status</Th>
                <Th>Ready For AM</Th>
                <Th>Assigned AM</Th>
                <Th>Next Action</Th>
              </tr>
            </thead>
            <tbody>
              {activationQueue.map((row) => {
                const isSelected = selected?.id === row.id;
                return (
                  <tr
                    key={row.id}
                    onClick={() => { setSelected(isSelected ? null : row); setNoteText(""); }}
                    className="cursor-pointer transition-colors"
                    style={{ background: isSelected ? "#EFF6FF" : "var(--rtm-bg)" }}
                  >
                    <Td>
                      <span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{row.client}</span>
                    </Td>
                    <Td>
                      <StatusBadge variant={row.invoiceVariant} label={row.invoiceStatus} size="sm" />
                    </Td>
                    <Td>
                      <StatusBadge variant={row.paymentVariant} label={row.paymentStatus} size="sm" />
                    </Td>
                    <Td muted>
                      <span className="block max-w-[160px] whitespace-normal leading-tight text-xs">{row.servicesPurchased}</span>
                    </Td>
                    <Td>
                      <StatusBadge variant={activationStatusVariant(row.activationStatus)} label={row.activationStatus} size="sm" />
                    </Td>
                    <Td>
                      <StatusBadge variant={row.deptVariant} label={row.deptActivationStatus} size="sm" />
                    </Td>
                    <Td><CheckIcon on={row.readyForAM} /></Td>
                    <Td muted>{row.assignedAM}</Td>
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

      {/* ── Activation Action Panel ── */}
      {selected && (
        <div className="rounded-xl border p-6 space-y-5" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                Activation Actions — {selected.client}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                {selected.activationStatus} · Dept: {selected.deptActivationStatus} · AM: {selected.assignedAM}
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

          {/* Activation pipeline stages for this client */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "Invoice Paid",          done: selected.invoiceVariant === "success" },
              { label: "Payment Confirmed",      done: selected.paymentVariant === "success" },
              { label: "Ready For Onboarding",   done: selected.activationStatus === "Ready For Onboarding" || selected.activationStatus === "Onboarding" || selected.activationStatus === "Sent To AM" || selected.activationStatus === "AM Accepted" || selected.activationStatus === "Activated" },
              { label: "Activated",              done: selected.activationStatus === "Activated" },
            ].map((stage) => (
              <div key={stage.label} className="rounded-lg border p-3 text-center text-xs font-semibold"
                style={{
                  borderColor: stage.done ? "#A7F3D0" : "var(--rtm-border-light)",
                  background: stage.done ? "#ECFDF5" : "var(--rtm-bg)",
                  color: stage.done ? "#059669" : "var(--rtm-text-muted)",
                }}>
                {stage.done ? "✓ " : "○ "}{stage.label}
              </div>
            ))}
          </div>

          {/* Activation action buttons */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>Actions</p>
            <div className="flex flex-wrap gap-2">
              <ActionBtn variant="primary"   label="Confirm Payment"               onClick={() => log(`Payment confirmed: ${selected.client}`)} />
              <ActionBtn variant="primary"   label="Approve Activation"            onClick={() => log(`Activation approved: ${selected.client}`)} />
              <ActionBtn variant="secondary" label="Set Dept Status To Onboarding" onClick={() => log(`Dept status set to Onboarding: ${selected.client}`)} />
              <ActionBtn variant="secondary" label="Push To Account Management"    onClick={() => log(`Pushed to AM: ${selected.client}`)} />
              <ActionBtn variant="secondary" label="Create Assignment Request"     onClick={() => log(`Assignment request created: ${selected.client}`)} />
            </div>
          </div>

          {/* Add activation note */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Add Activation Note</p>
            <textarea
              rows={2}
              placeholder="Add an activation note…"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border resize-none"
              style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
            />
            <ActionBtn variant="primary" label="Save Note" onClick={() => { log(`Activation note saved: "${noteText}"`); setNoteText(""); }} />
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

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── Service Activation Table ─────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <SectionWrapper
        title="Service Activation Table"
        description="Per-service billing approval, department activation status, and AM launch status"
      >
        <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--rtm-border-light)" }}>
          <table className="min-w-full">
            <thead>
              <tr>
                <Th>Client</Th>
                <Th>Service</Th>
                <Th>Purchased</Th>
                <Th>Billing Approved</Th>
                <Th>Dept Activation Status</Th>
                <Th>AM Launch Status</Th>
                <Th>Department</Th>
                <Th>Next Action</Th>
              </tr>
            </thead>
            <tbody>
              {serviceActivationTable.map((row) => (
                <tr key={row.id} style={{ background: "var(--rtm-bg)" }}>
                  <Td>
                    <span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{row.client}</span>
                  </Td>
                  <Td muted>{row.service}</Td>
                  <Td><CheckIcon on={row.purchased} /></Td>
                  <Td><CheckIcon on={row.billingApproved} /></Td>
                  <Td>
                    <StatusBadge variant={row.deptVariant} label={row.deptActivationStatus} size="sm" />
                  </Td>
                  <Td>
                    <StatusBadge variant={row.amVariant} label={row.amLaunchStatus} size="sm" />
                  </Td>
                  <Td muted>{row.department}</Td>
                  <Td muted>{row.nextAction}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

      {/* ── Footer nav ── */}
      <div className="flex gap-2">
        <Link href={workspace.dashboardRoute} className="rtm-btn-secondary text-sm inline-flex items-center gap-1">← Dashboard</Link>
        <Link href="/billing/invoices"        className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Invoices →</Link>
        <Link href={workspace.tasksRoute}     className="rtm-btn-primary  text-sm inline-flex items-center gap-1">Tasks →</Link>
      </div>
    </div>
  );
}
