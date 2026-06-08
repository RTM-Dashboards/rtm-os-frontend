"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("billing")!;

// ── Types ─────────────────────────────────────────────────────────────────────

type BadgeVariant = "success" | "error" | "warning" | "info" | "neutral" | "pending";

interface ClientPortfolioRow {
  id: string;
  client: string;
  salesStatus: string;
  salesVariant: BadgeVariant;
  invoiceStatus: string;
  invoiceVariant: BadgeVariant;
  paymentStatus: string;
  paymentVariant: BadgeVariant;
  activationStatus: string;
  activationVariant: BadgeVariant;
  servicesPurchased: string;
  accountManagementStatus: string;
  amVariant: BadgeVariant;
  onboardingStatus: string;
  onboardingVariant: BadgeVariant;
  cancellationStatus: string;
  cancellationVariant: BadgeVariant;
  renewalBillingStatus: string;
  renewalVariant: BadgeVariant;
  billingOwner: string;
  nextAction: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

// Client Portfolio Table
const clientPortfolioRows: ClientPortfolioRow[] = [
  {
    id: "1",
    client: "Apex Roofing",
    salesStatus: "Closed Won",             salesVariant: "success",
    invoiceStatus: "Sent",                 invoiceVariant: "info",
    paymentStatus: "Awaiting Payment",     paymentVariant: "warning",
    activationStatus: "Awaiting Invoice",  activationVariant: "neutral",
    servicesPurchased: "SEO, GBP, Reporting",
    accountManagementStatus: "Pending",    amVariant: "neutral",
    onboardingStatus: "Not Started",       onboardingVariant: "neutral",
    cancellationStatus: "None",            cancellationVariant: "neutral",
    renewalBillingStatus: "Active",        renewalVariant: "success",
    billingOwner: "Lisa P.",
    nextAction: "Follow up on payment",
  },
  {
    id: "2",
    client: "Pacific Dental",
    salesStatus: "Closed Won",             salesVariant: "success",
    invoiceStatus: "Paid",                 invoiceVariant: "success",
    paymentStatus: "Confirmed",            paymentVariant: "success",
    activationStatus: "Ready For Activation", activationVariant: "info",
    servicesPurchased: "Meta Ads, Google Ads, LSA",
    accountManagementStatus: "Assigned",   amVariant: "success",
    onboardingStatus: "In Progress",       onboardingVariant: "info",
    cancellationStatus: "None",            cancellationVariant: "neutral",
    renewalBillingStatus: "Schedule Pending Update", renewalVariant: "warning",
    billingOwner: "Sarah K.",
    nextAction: "Update billing schedule",
  },
  {
    id: "3",
    client: "Sunbelt HVAC",
    salesStatus: "Closed Won",             salesVariant: "success",
    invoiceStatus: "Partially Paid",       invoiceVariant: "warning",
    paymentStatus: "Partial",              paymentVariant: "warning",
    activationStatus: "Awaiting Payment",  activationVariant: "warning",
    servicesPurchased: "Content, Reporting",
    accountManagementStatus: "On Hold",    amVariant: "warning",
    onboardingStatus: "Paused",            onboardingVariant: "warning",
    cancellationStatus: "Pause Request",   cancellationVariant: "warning",
    renewalBillingStatus: "Retention Plan", renewalVariant: "warning",
    billingOwner: "Lisa P.",
    nextAction: "Collect remaining balance",
  },
  {
    id: "4",
    client: "Harbor Auto Group",
    salesStatus: "Closed Won",             salesVariant: "success",
    invoiceStatus: "Paid",                 invoiceVariant: "success",
    paymentStatus: "Confirmed",            paymentVariant: "success",
    activationStatus: "Activated",         activationVariant: "success",
    servicesPurchased: "Full Bundle",
    accountManagementStatus: "Active",     amVariant: "success",
    onboardingStatus: "Completed",         onboardingVariant: "success",
    cancellationStatus: "None",            cancellationVariant: "neutral",
    renewalBillingStatus: "Renewed",       renewalVariant: "success",
    billingOwner: "Sarah K.",
    nextAction: "Monitor renewal",
  },
  {
    id: "5",
    client: "Metro Dental",
    salesStatus: "Closed Won",             salesVariant: "success",
    invoiceStatus: "Draft",                invoiceVariant: "neutral",
    paymentStatus: "Not Sent",             paymentVariant: "neutral",
    activationStatus: "Awaiting Invoice",  activationVariant: "neutral",
    servicesPurchased: "SEO, GBP, Call Tracking",
    accountManagementStatus: "Pending",    amVariant: "neutral",
    onboardingStatus: "Not Started",       onboardingVariant: "neutral",
    cancellationStatus: "Termination",     cancellationVariant: "error",
    renewalBillingStatus: "Cancelled",     renewalVariant: "error",
    billingOwner: "Lisa P.",
    nextAction: "Generate invoice, final billing review",
  },
  {
    id: "6",
    client: "Blue Ridge Plumbing",
    salesStatus: "Closed Won",             salesVariant: "success",
    invoiceStatus: "Paid",                 invoiceVariant: "success",
    paymentStatus: "Confirmed",            paymentVariant: "success",
    activationStatus: "Ready For Activation", activationVariant: "info",
    servicesPurchased: "Starter SEO",
    accountManagementStatus: "Assignment Pending", amVariant: "warning",
    onboardingStatus: "Not Started",       onboardingVariant: "neutral",
    cancellationStatus: "None",            cancellationVariant: "neutral",
    renewalBillingStatus: "Billing Updated", renewalVariant: "success",
    billingOwner: "Sarah K.",
    nextAction: "Approve GBP billing, send to AM",
  },
  {
    id: "7",
    client: "Green Valley Pools",
    salesStatus: "Closed Won",             salesVariant: "success",
    invoiceStatus: "Overdue",              invoiceVariant: "error",
    paymentStatus: "Overdue",              paymentVariant: "error",
    activationStatus: "Hold — Overdue",   activationVariant: "error",
    servicesPurchased: "SEO, Meta Ads",
    accountManagementStatus: "Blocked",    amVariant: "error",
    onboardingStatus: "Blocked",           onboardingVariant: "error",
    cancellationStatus: "Declined Renewal",cancellationVariant: "error",
    renewalBillingStatus: "Cancelled",     renewalVariant: "error",
    billingOwner: "Lisa P.",
    nextAction: "Escalate collections, close account",
  },
  {
    id: "8",
    client: "Skyline Landscaping",
    salesStatus: "Closed Won",             salesVariant: "success",
    invoiceStatus: "Paid",                 invoiceVariant: "success",
    paymentStatus: "Confirmed",            paymentVariant: "success",
    activationStatus: "Activated",         activationVariant: "success",
    servicesPurchased: "GBP, Yelp, Reporting",
    accountManagementStatus: "Active",     amVariant: "success",
    onboardingStatus: "Completed",         onboardingVariant: "success",
    cancellationStatus: "None",            cancellationVariant: "neutral",
    renewalBillingStatus: "Renewed",       renewalVariant: "success",
    billingOwner: "Sarah K.",
    nextAction: "None",
  },
  {
    id: "9",
    client: "Cornerstone Flooring",
    salesStatus: "Closed Won",             salesVariant: "success",
    invoiceStatus: "Overdue",              invoiceVariant: "error",
    paymentStatus: "Overdue 60 Days",      paymentVariant: "error",
    activationStatus: "Services On Hold",  activationVariant: "error",
    servicesPurchased: "SEO, Reporting",
    accountManagementStatus: "Blocked",    amVariant: "error",
    onboardingStatus: "Blocked",           onboardingVariant: "error",
    cancellationStatus: "Services On Hold",cancellationVariant: "error",
    renewalBillingStatus: "At Risk",       renewalVariant: "error",
    billingOwner: "Lisa P.",
    nextAction: "Collections agency follow-up",
  },
  {
    id: "10",
    client: "Summit Pest Control",
    salesStatus: "Closed Won",             salesVariant: "success",
    invoiceStatus: "Partially Paid",       invoiceVariant: "warning",
    paymentStatus: "Payment Plan",         paymentVariant: "info",
    activationStatus: "Active",            activationVariant: "success",
    servicesPurchased: "Local SEO",
    accountManagementStatus: "Active",     amVariant: "success",
    onboardingStatus: "Completed",         onboardingVariant: "success",
    cancellationStatus: "None",            cancellationVariant: "neutral",
    renewalBillingStatus: "Active",        renewalVariant: "success",
    billingOwner: "Sarah K.",
    nextAction: "Confirm next payment plan installment",
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
    <td className="px-3 py-2.5 text-sm whitespace-nowrap border-b"
      style={{ color: muted ? "var(--rtm-text-muted)" : "var(--rtm-text-secondary)", borderColor: "var(--rtm-border-light)" }}>
      {children}
    </td>
  );
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BillingClientPortfolioPage() {
  const [selected, setSelected] = useState<ClientPortfolioRow | null>(null);
  const [actionLog, setActionLog] = useState<string[]>([]);

  function log(msg: string) {
    setActionLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 9)]);
  }

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>
          {workspace.name}
        </p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
          Client Portfolio Table
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          All clients with their billing status and action items connected to Sales, Invoices, Payments, Activation, AM, Onboarding, Cancellations, and Renewals.
        </p>
      </div>

      {/* ── Summary row ── */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Total Clients",    value: clientPortfolioRows.length, color: "#1B4FD8" },
          { label: "Payment Confirmed",value: clientPortfolioRows.filter((c) => c.paymentStatus === "Confirmed").length, color: "#059669" },
          { label: "Awaiting Payment", value: clientPortfolioRows.filter((c) => c.paymentVariant === "warning").length, color: "#D97706" },
          { label: "Overdue",          value: clientPortfolioRows.filter((c) => c.paymentVariant === "error").length, color: "#DC2626" },
          { label: "Activated",        value: clientPortfolioRows.filter((c) => c.activationStatus === "Activated").length, color: "#059669" },
          { label: "Cancellations",    value: clientPortfolioRows.filter((c) => c.cancellationVariant === "error" || c.cancellationVariant === "warning").length, color: "#DC2626" },
        ].map((s) => (
          <div key={s.label} className="flex flex-col px-4 py-3 rounded-lg border min-w-[110px]"
            style={{ background: `${s.color}12`, borderColor: `${s.color}40` }}>
            <span className="text-xs font-medium" style={{ color: "var(--rtm-text-muted)" }}>{s.label}</span>
            <span className="text-xl font-bold mt-0.5" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── Client Portfolio Table ───────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <SectionWrapper
        title="Client Portfolio Table"
        description="Click a client row to open action items"
      >
        <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--rtm-border-light)" }}>
          <table className="min-w-full">
            <thead>
              <tr>
                <Th>Client</Th>
                <Th>Sales Status</Th>
                <Th>Invoice Status</Th>
                <Th>Payment Status</Th>
                <Th>Activation Status</Th>
                <Th>Services Purchased</Th>
                <Th>AM Status</Th>
                <Th>Onboarding</Th>
                <Th>Cancellation</Th>
                <Th>Renewal Billing</Th>
                <Th>Billing Owner</Th>
                <Th>Next Action</Th>
              </tr>
            </thead>
            <tbody>
              {clientPortfolioRows.map((row) => {
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
                    <Td>
                      <StatusBadge variant={row.salesVariant} label={row.salesStatus} size="sm" />
                    </Td>
                    <Td>
                      <StatusBadge variant={row.invoiceVariant} label={row.invoiceStatus} size="sm" />
                    </Td>
                    <Td>
                      <StatusBadge variant={row.paymentVariant} label={row.paymentStatus} size="sm" />
                    </Td>
                    <Td>
                      <StatusBadge variant={row.activationVariant} label={row.activationStatus} size="sm" />
                    </Td>
                    <Td muted>
                      <span className="block max-w-[160px] whitespace-normal leading-tight text-xs">{row.servicesPurchased}</span>
                    </Td>
                    <Td>
                      <StatusBadge variant={row.amVariant} label={row.accountManagementStatus} size="sm" />
                    </Td>
                    <Td>
                      <StatusBadge variant={row.onboardingVariant} label={row.onboardingStatus} size="sm" />
                    </Td>
                    <Td>
                      <StatusBadge variant={row.cancellationVariant} label={row.cancellationStatus} size="sm" />
                    </Td>
                    <Td>
                      <StatusBadge variant={row.renewalVariant} label={row.renewalBillingStatus} size="sm" />
                    </Td>
                    <Td muted>{row.billingOwner}</Td>
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

      {/* ── Client Action Panel ── */}
      {selected && (
        <div className="rounded-xl border p-6 space-y-5" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                Client Actions — {selected.client}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                Billing Owner: {selected.billingOwner} · Next: {selected.nextAction}
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

          {/* Status summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: "Invoice",    variant: selected.invoiceVariant,    value: selected.invoiceStatus },
              { label: "Payment",    variant: selected.paymentVariant,    value: selected.paymentStatus },
              { label: "Activation", variant: selected.activationVariant, value: selected.activationStatus },
              { label: "AM",         variant: selected.amVariant,         value: selected.accountManagementStatus },
              { label: "Onboarding", variant: selected.onboardingVariant, value: selected.onboardingStatus },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border p-3 flex flex-col gap-1"
                style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
                <span className="text-xs font-medium" style={{ color: "var(--rtm-text-muted)" }}>{s.label}</span>
                <StatusBadge variant={s.variant} label={s.value} size="sm" />
              </div>
            ))}
          </div>

          {/* Action items */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>Action Items</p>
            <div className="flex flex-wrap gap-2">
              <ActionBtn variant="primary"   label="Open Invoice"          onClick={() => log(`Opening invoice for ${selected.client}`)} />
              <ActionBtn variant="secondary" label="Confirm Payment"       onClick={() => log(`Confirming payment for ${selected.client}`)} />
              <ActionBtn variant="primary"   label="Send To Activation"    onClick={() => log(`Sending ${selected.client} to Activation`)} />
              <ActionBtn variant="secondary" label="Send To AM"            onClick={() => log(`Sending ${selected.client} to Account Management`)} />
              <ActionBtn variant="secondary" label="Create Billing Task"   onClick={() => log(`Billing task created for ${selected.client}`)} />
              <ActionBtn variant="secondary" label="Flag Billing Issue"    onClick={() => log(`Billing issue flagged for ${selected.client}`)} />
              <ActionBtn variant="danger"    label="Start Cancellation"    onClick={() => log(`Cancellation started for ${selected.client}`)} />
              <ActionBtn variant="secondary" label="View Client Lifecycle" onClick={() => log(`Viewing lifecycle for ${selected.client}`)} />
            </div>
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
        <Link href="/billing/invoices"        className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Invoices →</Link>
        <Link href={workspace.tasksRoute}     className="rtm-btn-primary  text-sm inline-flex items-center gap-1">Tasks →</Link>
      </div>
    </div>
  );
}
