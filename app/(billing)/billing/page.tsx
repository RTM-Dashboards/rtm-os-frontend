"use client";

// Billing dashboard should be overview only.
// Operational actions live inside subpages: Invoices, Tasks, Client Portfolio, Cancellations, Activation.

import React from "react";
import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { WorkspaceHeader } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("billing")!;

// ── KPI Data ─────────────────────────────────────────────────────────────────

const kpis = [
  { title: "Active Clients",               value: "62",      trend: "up"   as const, trendValue: "4",     iconBg: "#ECFDF5", iconColor: "#059669" },
  { title: "Awaiting Payment",             value: "11",      trend: "down" as const, trendValue: "2",     iconBg: "#FFFBEB", iconColor: "#D97706" },
  { title: "Payments Received",            value: "$87,400", trend: "up"   as const, trendValue: "9.3%",  iconBg: "#ECFDF5", iconColor: "#059669" },
  { title: "Recurring Clients",            value: "54",      trend: "up"   as const, trendValue: "3",     iconBg: "#EFF6FF", iconColor: "#1B4FD8" },
  { title: "Failed Payments",              value: "3",       trend: "up"   as const, trendValue: "1",     iconBg: "#FEF2F2", iconColor: "#DC2626" },
  { title: "Collections Required",         value: "5",       trend: "up"   as const, trendValue: "1",     iconBg: "#FEF2F2", iconColor: "#DC2626" },
  { title: "Clients Ready For Activation", value: "8",       trend: "up"   as const, trendValue: "3",     iconBg: "#F0F9FF", iconColor: "#0891B2" },
  { title: "Revenue This Month",           value: "$94,800", trend: "up"   as const, trendValue: "11.2%", iconBg: "#ECFDF5", iconColor: "#059669" },
];

// ── Revenue Summary ───────────────────────────────────────────────────────────

const revenueSummary = [
  { label: "MRR",              value: "$94,800", color: "#059669" },
  { label: "ARR",              value: "$1,137,600", color: "#1B4FD8" },
  { label: "New Revenue",      value: "$12,600",  color: "#0891B2" },
  { label: "Revenue At Risk",  value: "$18,200",  color: "#DC2626" },
  { label: "Expansion Revenue",value: "$26,100",  color: "#059669" },
];

// ── Invoice Summary ───────────────────────────────────────────────────────────

const invoiceSummary = [
  { label: "Draft",          count: 2,  color: "#6B7280" },
  { label: "Sent",           count: 7,  color: "#1B4FD8" },
  { label: "Partially Paid", count: 3,  color: "#D97706" },
  { label: "Paid",           count: 31, color: "#059669" },
  { label: "Overdue",        count: 5,  color: "#DC2626" },
  { label: "Cancelled",      count: 1,  color: "#6B7280" },
];

// ── Payment Summary ───────────────────────────────────────────────────────────

const paymentSummary = [
  { label: "Confirmed",        count: 31, color: "#059669" },
  { label: "Awaiting",         count: 11, color: "#D97706" },
  { label: "Partial",          count: 3,  color: "#D97706" },
  { label: "Failed",           count: 3,  color: "#DC2626" },
  { label: "Collections",      count: 5,  color: "#DC2626" },
];

// ── Activation Summary ────────────────────────────────────────────────────────

const activationSummary = [
  { label: "Awaiting Payment",           count: 6, color: "#D97706" },
  { label: "Payment Confirmed",          count: 8, color: "#0891B2" },
  { label: "Ready For Onboarding",       count: 5, color: "#1B4FD8" },
  { label: "Department Activation Pending", count: 3, color: "#7C3AED" },
  { label: "Sent To AM",                 count: 4, color: "#059669" },
  { label: "Activated",                  count: 36, color: "#059669" },
];

// ── Cancellation Summary ──────────────────────────────────────────────────────

const cancellationSummary = [
  { label: "In Review",        count: 2, color: "#D97706" },
  { label: "Offboarding",      count: 3, color: "#DC2626" },
  { label: "Campaign Pending", count: 2, color: "#7C3AED" },
  { label: "Closed",           count: 8, color: "#6B7280" },
];

// ── Collections Summary ───────────────────────────────────────────────────────

const collectionsSummary = [
  { label: "Outstanding Balance", value: "$13,500",  color: "#DC2626" },
  { label: "Overdue Accounts",    value: "5",        color: "#D97706" },
  { label: "High Risk",           value: "2",        color: "#DC2626" },
  { label: "Payment Plans",       value: "1",        color: "#0891B2" },
];

// ── Renewal Billing Summary ────────────────────────────────────────────────────

const renewalSummary = [
  { label: "Upcoming Renewals",   count: 8, color: "#0891B2" },
  { label: "Renewed",             count: 4, color: "#059669" },
  { label: "In Negotiation",      count: 2, color: "#D97706" },
  { label: "At Risk",             count: 2, color: "#DC2626" },
  { label: "Declined",            count: 1, color: "#6B7280" },
];

// ── Navigation Cards ──────────────────────────────────────────────────────────

const navCards = [
  {
    title: "Invoices",
    description: "Generate, send, record payments, and manage invoice actions.",
    href: "/billing/invoices",
    icon: "🧾",
    accent: "#1B4FD8",
    bg: "#EFF6FF",
    border: "#BFDBFE",
  },
  {
    title: "Tasks",
    description: "Billing task queue — assign, escalate, and manage billing work.",
    href: "/billing/tasks",
    icon: "✅",
    accent: "#059669",
    bg: "#ECFDF5",
    border: "#A7F3D0",
  },
  {
    title: "Client Portfolio",
    description: "All clients with billing status, invoice, payment, and activation state.",
    href: "/billing/client-portfolio",
    icon: "📋",
    accent: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
  },
  {
    title: "Cancellations",
    description: "Cancellation queue — trigger offboarding and campaign cancellations.",
    href: "/billing/cancellations",
    icon: "🚫",
    accent: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
  },
  {
    title: "Activation",
    description: "Paid clients ready for onboarding and department activation.",
    href: "/billing/activation",
    icon: "🚀",
    accent: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
  },
  {
    title: "Active Services",
    description: "View all active service contracts and billing schedules.",
    href: "/billing/invoices",
    icon: "⚙️",
    accent: "#0891B2",
    bg: "#F0F9FF",
    border: "#BAE6FD",
  },
  {
    title: "Offboarding",
    description: "Clients in the offboarding pipeline after cancellation.",
    href: "/billing/cancellations",
    icon: "📤",
    accent: "#6B7280",
    bg: "#F9FAFB",
    border: "#E5E7EB",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function SummaryPill({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div
      className="flex flex-col gap-1 px-4 py-3 rounded-lg border min-w-[110px]"
      style={{ background: `${color}12`, borderColor: `${color}40` }}
    >
      <span className="text-xs font-medium" style={{ color: "var(--rtm-text-muted)" }}>{label}</span>
      <span className="text-xl font-bold" style={{ color }}>{value}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BillingDashboard() {
  return (
    <div className="space-y-8">
      <WorkspaceHeader
        workspace={workspace}
        subtitle="Billing overview — payments, invoices, activations, cancellations, and renewals."
      />

      {/* ── Billing KPI Cards ───────────────────────────────────────────────── */}
      <SectionWrapper title="Billing KPIs" description="Key billing performance indicators">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <KpiCard
              key={k.title}
              title={k.title}
              value={k.value}
              trend={k.trend}
              trendValue={k.trendValue}
              iconBg={k.iconBg}
              iconColor={k.iconColor}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          ))}
        </div>
      </SectionWrapper>

      {/* ── Revenue Summary ─────────────────────────────────────────────────── */}
      <SectionWrapper title="Revenue Summary" description="Monthly, annual, and at-risk revenue overview">
        <div className="flex flex-wrap gap-3">
          {revenueSummary.map((r) => (
            <SummaryPill key={r.label} label={r.label} value={r.value} color={r.color} />
          ))}
        </div>
      </SectionWrapper>

      {/* ── Invoice Summary ─────────────────────────────────────────────────── */}
      <SectionWrapper title="Invoice Summary" description="Invoice status counts across all clients">
        <div className="flex flex-wrap gap-3">
          {invoiceSummary.map((r) => (
            <SummaryPill key={r.label} label={r.label} value={r.count} color={r.color} />
          ))}
        </div>
        <div className="mt-3">
          <Link href="/billing/invoices" className="text-xs font-semibold hover:underline" style={{ color: "#1B4FD8" }}>
            → Manage Invoices
          </Link>
        </div>
      </SectionWrapper>

      {/* ── Payment Summary ─────────────────────────────────────────────────── */}
      <SectionWrapper title="Payment Summary" description="Payment confirmation and collections overview">
        <div className="flex flex-wrap gap-3">
          {paymentSummary.map((r) => (
            <SummaryPill key={r.label} label={r.label} value={r.count} color={r.color} />
          ))}
        </div>
        <div className="mt-3">
          <Link href="/billing/invoices" className="text-xs font-semibold hover:underline" style={{ color: "#1B4FD8" }}>
            → Record Payments
          </Link>
        </div>
      </SectionWrapper>

      {/* ── Activation Summary ──────────────────────────────────────────────── */}
      <SectionWrapper title="Activation Summary" description="Clients in the activation pipeline after payment">
        <div className="flex flex-wrap gap-3">
          {activationSummary.map((r) => (
            <SummaryPill key={r.label} label={r.label} value={r.count} color={r.color} />
          ))}
        </div>
        <div className="mt-3">
          <Link href="/billing/activation" className="text-xs font-semibold hover:underline" style={{ color: "#7C3AED" }}>
            → Manage Activation
          </Link>
        </div>
      </SectionWrapper>

      {/* ── Cancellation Summary ────────────────────────────────────────────── */}
      <SectionWrapper title="Cancellation Summary" description="Cancellation pipeline and offboarding status">
        <div className="flex flex-wrap gap-3">
          {cancellationSummary.map((r) => (
            <SummaryPill key={r.label} label={r.label} value={r.count} color={r.color} />
          ))}
        </div>
        <div className="mt-3">
          <Link href="/billing/cancellations" className="text-xs font-semibold hover:underline" style={{ color: "#DC2626" }}>
            → Manage Cancellations
          </Link>
        </div>
      </SectionWrapper>

      {/* ── Collections Summary ─────────────────────────────────────────────── */}
      <SectionWrapper title="Collections Summary" description="Outstanding balances and overdue accounts">
        <div className="flex flex-wrap gap-3">
          {collectionsSummary.map((r) => (
            <SummaryPill key={r.label} label={r.label} value={r.value} color={r.color} />
          ))}
        </div>
        <div className="mt-3">
          <Link href="/billing/invoices" className="text-xs font-semibold hover:underline" style={{ color: "#DC2626" }}>
            → Review Overdue Invoices
          </Link>
        </div>
      </SectionWrapper>

      {/* ── Renewal Billing Summary ─────────────────────────────────────────── */}
      <SectionWrapper title="Renewal Billing Summary" description="Upcoming renewals and billing update pipeline">
        <div className="flex flex-wrap gap-3">
          {renewalSummary.map((r) => (
            <SummaryPill key={r.label} label={r.label} value={r.count} color={r.color} />
          ))}
        </div>
      </SectionWrapper>

      {/* ── Navigation Cards ─────────────────────────────────────────────────── */}
      <SectionWrapper title="Billing Operations" description="Navigate to operational billing subpages">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {navCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="rounded-xl border p-5 flex flex-col gap-2 transition-all hover:shadow-sm hover:-translate-y-0.5"
              style={{ background: card.bg, borderColor: card.border, textDecoration: "none" }}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{card.icon}</span>
                <span className="text-sm font-bold" style={{ color: card.accent }}>{card.title}</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--rtm-text-secondary)" }}>
                {card.description}
              </p>
              <span className="text-xs font-semibold mt-auto" style={{ color: card.accent }}>
                Open →
              </span>
            </Link>
          ))}
        </div>
      </SectionWrapper>
    </div>
  );
}
