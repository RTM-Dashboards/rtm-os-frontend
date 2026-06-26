"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import {
  invoices,
  recurringContracts,
  activationQueue,
  collections,
  revenueSummary,
  aiBillingSummary,
  activityTimeline,
} from "@/lib/billing-mock-data";
import type { InvoiceStatus, ActivationStatus, CollectionStatus } from "@/lib/billing-mock-data";

const workspace = getWorkspace("billing")!;

//  Badge helpers 

type BadgeVariant = "success"| "error"| "warning"| "info"| "neutral"| "pending";

function invoiceStatusVariant(s: InvoiceStatus): BadgeVariant {
  switch (s) {
    case "Paid": return "success";
    case "Overdue": return "error";
    case "Cancelled": case "Refunded": return "error";
    case "Partially Paid": return "warning";
    case "Sent": return "info";
    case "Pending Approval": return "pending";
    default: return "neutral";
  }
}

function activationStatusVariant(s: ActivationStatus): BadgeVariant {
  switch (s) {
    case "Activated": return "success";
    case "Ready For Activation": return "info";
    case "Pending Payment": return "warning";
    case "On Hold": return "error";
    default: return "neutral";
  }
}

function collectionStatusVariant(s: CollectionStatus): BadgeVariant {
  switch (s) {
    case "Resolved": return "success";
    case "Escalated": return "error";
    case "Payment Arrangement": return "warning";
    case "Contacted": return "info";
    case "Reminder Sent": return "pending";
    default: return "neutral";
  }
}

//  Sub-components 

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="text-left text-xs font-semibold uppercase tracking-wide px-3 py-2.5 whitespace-nowrap border-b"style={{ color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border-light)", background: "#F9FAFB"}}
    >
      {children}
    </th>
  );
}

function Td({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <td
      className="px-3 py-2.5 text-sm whitespace-nowrap border-b"style={{ color: muted ? "var(--rtm-text-muted)": "var(--rtm-text-secondary)", borderColor: "var(--rtm-border-light)"}}
    >
      {children}
    </td>
  );
}

function KpiPill({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div
      className="flex flex-col gap-1 px-4 py-3 rounded-xl border min-w-[120px]"style={{ background: `${color}12`, borderColor: `${color}30` }}
    >
      <span className="text-xs font-medium"style={{ color: "var(--rtm-text-muted)"}}>{label}</span>
      <span className="text-xl font-bold"style={{ color }}>{value}</span>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-xs font-bold uppercase tracking-widest mb-4"style={{ color: "var(--rtm-text-muted)"}}
    >
      {children}
    </h2>
  );
}

//  KPI computations 

const outstanding = invoices.filter((i) => i.status !== "Paid"&& i.status !== "Cancelled"&& i.status !== "Refunded");
const overdue = invoices.filter((i) => i.status === "Overdue");
const pendingCollection = collections.filter((c) => c.collectionStatus !== "Resolved");
const activationReady = activationQueue.filter((a) => a.activationStatus === "Ready For Activation");
const collectedThisMonth = invoices.filter((i) => i.status === "Paid").reduce((sum, i) => sum + i.amount, 0);
const outstandingBalance = outstanding.reduce((sum, i) => sum + i.amount, 0);

const navCards = [
  { title: "Invoices",           description: "Create, send, and record payments for all invoices.",             href: "/billing/invoices",          icon: "", accent: "#1B4FD8", bg: "#EFF6FF", border: "#BFDBFE"},
  { title: "Recurring Revenue",  description: "MRR, ARR, active contracts, renewals, and at-risk revenue.",      href: "/billing/recurring-revenue",  icon: "", accent: "#059669", bg: "#ECFDF5", border: "#A7F3D0"},
  { title: "Collections",        description: "Overdue accounts, collection statuses, and follow-up actions.",    href: "/billing/collections",        icon: "", accent: "#DC2626", bg: "#FEF2F2", border: "#FECACA"},
  { title: "Activation Queue",   description: "Clients ready for activation after payment confirmation.",         href: "/billing/activation-queue",   icon: "", accent: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE"},
  { title: "Revenue Dashboard",  description: "Monthly, quarterly, annual revenue by department and service.",    href: "/billing/revenue",            icon: "", accent: "#D97706", bg: "#FFFBEB", border: "#FDE68A"},
  { title: "Settings",           description: "Billing configuration, payment methods, and preferences.",         href: "/billing/settings",           icon: "", accent: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB"},
];

//  Page 

export default function BillingDashboard() {
  const [aiExpanded, setAiExpanded] = useState(false);

  return (
    <div className="space-y-8">

      {/*  Header  */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: workspace.accentColor }}>
          {workspace.name}
        </p>
        <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>
          Billing Dashboard
        </h1>
        <p className="text-sm mt-1"style={{ color: "var(--rtm-text-secondary)"}}>
          Billing action layer — invoice management, recurring revenue, collections, activation readiness, and revenue tracking.
        </p>
      </div>

      {/*  KPI Cards  */}
      <section>
        <SectionHeading>Key Billing Metrics</SectionHeading>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard
            title="Outstanding Invoices"value={`$${outstandingBalance.toLocaleString()}`}
            trend="down"trendValue="$4,200"iconBg="#FEF2F2"iconColor="#DC2626"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>}
          />
          <KpiCard
            title="Collected Revenue"value={`$${collectedThisMonth.toLocaleString()}`}
            trend="up"trendValue="9.3%"iconBg="#ECFDF5"iconColor="#059669"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
          />
          <KpiCard
            title="MRR"value={`$${revenueSummary.mrr.toLocaleString()}`}
            trend="up"trendValue="11.2%"iconBg="#EFF6FF"iconColor="#1B4FD8"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>}
          />
          <KpiCard
            title="ARR"value={`$${(revenueSummary.arr / 1000).toFixed(0)}k`}
            trend="up"trendValue="11.2%"iconBg="#F5F3FF"iconColor="#7C3AED"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>}
          />
          <KpiCard
            title="Activation Ready"value={String(activationReady.length)}
            trend="up"trendValue="3"iconBg="#F0F9FF"iconColor="#0891B2"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M5 13l4 4L19 7"/></svg>}
          />
          <KpiCard
            title="Overdue Invoices"value={String(overdue.length)}
            trend="up"trendValue="1"iconBg="#FEF2F2"iconColor="#DC2626"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>}
          />
          <KpiCard
            title="Pending Collections"value={String(pendingCollection.length)}
            trend="up"trendValue="1"iconBg="#FFFBEB"iconColor="#D97706"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
          />
          <KpiCard
            title="Revenue Forecast"value={`$${revenueSummary.projectedRevenue.toLocaleString()}`}
            trend="up"trendValue="8.0%"iconBg="#ECFDF5"iconColor="#059669"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>}
          />
        </div>
      </section>

      {/*  Payment Summary  */}
      <SectionWrapper title="Payment Summary"description="Overview of payment states and revenue breakdown">
        <div className="flex flex-wrap gap-3">
          <KpiPill label="Setup Fees Collected"value="$8,200"color="#1B4FD8"/>
          <KpiPill label="Recurring Revenue"value="$68,400"color="#059669"/>
          <KpiPill label="Discounts Applied"value="-$1,200"color="#D97706"/>
          <KpiPill label="Promo Codes"value="-$400"color="#D97706"/>
          <KpiPill label="Outstanding Balance"value={`$${outstandingBalance.toLocaleString()}`}/>
          <KpiPill label="Collected Revenue"value={`$${collectedThisMonth.toLocaleString()}`}/>
          <KpiPill label="Projected Revenue"value={`$${revenueSummary.projectedRevenue.toLocaleString()}`}/>
        </div>
      </SectionWrapper>

      {/*  Invoice Table  */}
      <SectionWrapper
        title="Invoice Overview"description="30 invoices — all types and statuses"actions={
          <Link href="/billing/invoices" className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:opacity-80" style={{ color: "#1B4FD8", borderColor: "#BFDBFE", background: "#EFF6FF" }}>
            Manage Invoices →
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <Th>Invoice #</Th>
                <Th>Client</Th>
                <Th>Contract</Th>
                <Th>Type</Th>
                <Th>Amount</Th>
                <Th>Due Date</Th>
                <Th>Status</Th>
                <Th>Activation</Th>
                <Th>Assigned</Th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#F9FAFB] transition-colors"style={{ background: "var(--rtm-bg)"}}>
                  <Td muted>{inv.invoiceNumber}</Td>
                  <Td><span className="font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{inv.client}</span></Td>
                  <Td muted>{inv.contract}</Td>
                  <Td muted>{inv.invoiceType}</Td>
                  <Td><span className="font-semibold">${inv.amount.toLocaleString()}</span></Td>
                  <Td muted>{inv.dueDate}</Td>
                  <Td><StatusBadge variant={invoiceStatusVariant(inv.status)} label={inv.status} size="sm"/></Td>
                  <Td><StatusBadge variant={activationStatusVariant(inv.activationStatus)} label={inv.activationStatus} size="sm"/></Td>
                  <Td muted>{inv.assignedTo}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

      {/*  Collections Snapshot  */}
      <SectionWrapper
        title="Collections"description="Outstanding overdue accounts requiring follow-up"actions={
          <Link href="/billing/collections" className="text-xs font-semibold px-3 py-1.5 rounded-lg border hover:opacity-80" style={{ color: "#DC2626", borderColor: "#FECACA", background: "#FEF2F2" }}>
            Collections Dashboard →
          </Link>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border p-4 space-y-3"style={{ background: c.daysOverdue >= 30 ? "#FEF2F2": "var(--rtm-bg)", borderColor: c.daysOverdue >= 30 ? "#FECACA": "var(--rtm-border-light)"}}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-sm"style={{ color: "var(--rtm-text-primary)"}}>{c.client}</span>
                <StatusBadge variant={collectionStatusVariant(c.collectionStatus)} label={c.collectionStatus} size="sm"/>
              </div>
              <div className="flex flex-wrap gap-3 text-xs"style={{ color: "var(--rtm-text-muted)"}}>
                <span>{c.invoiceNumber}</span>
                <span className="font-bold text-[#DC2626]">${c.outstandingAmount.toLocaleString()}</span>
                <span>{c.daysOverdue > 0 ? `${c.daysOverdue}d overdue` : "Not yet due"}</span>
              </div>
              <p className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{c.notes}</p>
              <div className="flex gap-3 text-xs"style={{ color: "var(--rtm-text-muted)"}}>
                <span>Assigned: {c.assignedTo}</span>
                <span>Follow-up: {c.nextFollowUp}</span>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/*  Activation Readiness  */}
      <SectionWrapper
        title="Activation Readiness"description="Billing controls project activation — payment required before activation"actions={
          <Link href="/billing/activation-queue" className="text-xs font-semibold px-3 py-1.5 rounded-lg border hover:opacity-80" style={{ color: "#7C3AED", borderColor: "#DDD6FE", background: "#F5F3FF" }}>
            Activation Queue →
          </Link>
        }
      >
        {/* Activation flow */}
        <div className="flex flex-wrap items-center gap-2 mb-5 pb-4"style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
          {[
            { label: "Proposal Accepted", color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB"},
            { label: "Contract Signed", color: "#1B4FD8", bg: "#EFF6FF", border: "#BFDBFE"},
            { label: "Invoice Created", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A"},
            { label: "Invoice Paid", color: "#059669", bg: "#ECFDF5", border: "#A7F3D0"},
            { label: "Activation Ready", color: "#0891B2", bg: "#F0F9FF", border: "#BAE6FD"},
            { label: "Create Project", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE"},
            { label: "Assign AM", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE"},
            { label: "Task Blueprints", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE"},
            { label: "Assign Departments", color: "#059669", bg: "#ECFDF5", border: "#A7F3D0"},
          ].map((step, i, arr) => (
            <React.Fragment key={step.label}>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg border"style={{ background: step.bg, color: step.color, borderColor: step.border }}>
                {step.label}
              </span>
              {i < arr.length - 1 && <span className="text-xs font-bold"style={{ color: "#9CA3AF"}}>→</span>}
            </React.Fragment>
          ))}
        </div>
        {/* Activation table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <Th>Client</Th>
                <Th>Contract</Th>
                <Th>Contract Status</Th>
                <Th>Invoice Status</Th>
                <Th>Payment Status</Th>
                <Th>Activation Status</Th>
                <Th>Ready Date</Th>
              </tr>
            </thead>
            <tbody>
              {activationQueue.map((a) => {
                const psVariant: BadgeVariant = a.paymentStatus === "Paid"? "success": a.paymentStatus === "Overdue"? "error": a.paymentStatus === "Partial"? "warning": "pending";
                const csVariant: BadgeVariant = a.contractStatus === "Signed"? "success": a.contractStatus === "In Review"? "warning": "neutral";
                return (
                  <tr key={a.id} className="hover:bg-[#F9FAFB] transition-colors"style={{ background: "var(--rtm-bg)"}}>
                    <Td><span className="font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{a.client}</span></Td>
                    <Td muted>{a.contract}</Td>
                    <Td><StatusBadge variant={csVariant} label={a.contractStatus} size="sm"/></Td>
                    <Td><StatusBadge variant={invoiceStatusVariant(a.invoiceStatus)} label={a.invoiceStatus} size="sm"/></Td>
                    <Td><StatusBadge variant={psVariant} label={a.paymentStatus} size="sm"/></Td>
                    <Td><StatusBadge variant={activationStatusVariant(a.activationStatus)} label={a.activationStatus} size="sm"/></Td>
                    <Td muted>{a.readyDate}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

      {/*  Recurring Revenue Snapshot  */}
      <SectionWrapper
        title="Recurring Revenue"description="MRR, ARR, active contracts, upcoming renewals"actions={
          <Link href="/billing/recurring-revenue" className="text-xs font-semibold px-3 py-1.5 rounded-lg border hover:opacity-80" style={{ color: "#059669", borderColor: "#A7F3D0", background: "#ECFDF5" }}>
            Full Revenue View →
          </Link>
        }
      >
        <div className="flex flex-wrap gap-3 mb-5">
          <KpiPill label="MRR"value={`$${revenueSummary.mrr.toLocaleString()}`}/>
          <KpiPill label="ARR"value={`$${(revenueSummary.arr / 1000).toFixed(0)}k`}/>
          <KpiPill label="Active Contracts"value={String(recurringContracts.filter((c) => c.status === "Active").length)}/>
          <KpiPill label="Upcoming Renewals"value={String(recurringContracts.filter((c) => c.status === "Pending Renewal").length)}/>
          <KpiPill label="Revenue At Risk"value={`$${revenueSummary.revenueAtRisk.toLocaleString()}`}/>
          <KpiPill label="Projected Revenue"value={`$${revenueSummary.projectedRevenue.toLocaleString()}`}/>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <Th>Client</Th>
                <Th>Contract</Th>
                <Th>Term</Th>
                <Th>Monthly Revenue</Th>
                <Th>Annual Value</Th>
                <Th>End Date</Th>
                <Th>Auto-Renew</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {recurringContracts.map((c) => {
                const sv: BadgeVariant = c.status === "Active"? "success": c.status === "At Risk"? "error": c.status === "Pending Renewal"? "warning": c.status === "Paused"? "neutral": "neutral";
                return (
                  <tr key={c.id} className="hover:bg-[#F9FAFB] transition-colors"style={{ background: "var(--rtm-bg)"}}>
                    <Td><span className="font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{c.client}</span></Td>
                    <Td muted>{c.contractName}</Td>
                    <Td muted>{c.contractTerm}</Td>
                    <Td><span className="font-semibold text-[#059669]">${c.monthlyRevenue.toLocaleString()}</span></Td>
                    <Td muted>${c.annualValue.toLocaleString()}</Td>
                    <Td muted>{c.contractEnd}</Td>
                    <Td muted>{c.autoRenew ? "Yes": "—"}</Td>
                    <Td><StatusBadge variant={sv} label={c.status} size="sm"/></Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

      {/*  AI Billing Summary  */}
      <section>
        <SectionHeading>AI Billing Summary</SectionHeading>
        <div
          className="rounded-xl border p-6 space-y-5"style={{ background: "linear-gradient(135deg, #F5F3FF 0%, #EFF6FF 100%)", borderColor: "#DDD6FE"}}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"style={{ background: "#7C3AED"}}>
                <svg className="w-5 h-5 text-white"fill="none"stroke="currentColor"viewBox="0 0 24 24">
                  <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-bold"style={{ color: "#4C1D95"}}>AI Billing Summary</h2>
                <p className="text-xs"style={{ color: "#6D28D9"}}>Revenue risks, opportunities, and recommended actions</p>
              </div>
            </div>
            <button
              onClick={() => setAiExpanded((v) => !v)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border"style={{ color: "#7C3AED", borderColor: "#DDD6FE", background: "#fff"}}
            >
              {aiExpanded ? "Collapse": "Expand"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "Revenue Risks",            items: aiBillingSummary.revenueRisks,            color: "#DC2626", bg: "#FEF2F2", border: "#FECACA"},
              { label: "Outstanding Collections",  items: aiBillingSummary.outstandingCollections,  color: "#D97706", bg: "#FFFBEB", border: "#FDE68A"},
              { label: "Upcoming Renewals",        items: aiBillingSummary.upcomingRenewals,        color: "#0891B2", bg: "#F0F9FF", border: "#BAE6FD"},
              { label: "Revenue Opportunities",    items: aiBillingSummary.revenueOpportunities,    color: "#059669", bg: "#ECFDF5", border: "#A7F3D0"},
              { label: "Activation Bottlenecks",   items: aiBillingSummary.activationBottlenecks,   color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE"},
              { label: "Recommended Actions",      items: aiBillingSummary.recommendedActions,      color: "#1B4FD8", bg: "#EFF6FF", border: "#BFDBFE"},
            ].map((section) => (
              <div
                key={section.label}
                className="rounded-xl border p-4 space-y-2"style={{ background: section.bg, borderColor: section.border }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold"style={{ background: section.color + "20", color: section.color }}
                  >
                    {section.label.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wide"style={{ color: section.color }}>{section.label}</span>
                </div>
                {(aiExpanded ? section.items : section.items.slice(0, 2)).map((item, i) => (
                  <p key={i} className="text-xs leading-relaxed"style={{ color: "var(--rtm-text-secondary)"}}>
                    • {item}
                  </p>
                ))}
                {!aiExpanded && section.items.length > 2 && (
                  <p className="text-xs font-semibold"style={{ color: section.color }}>+{section.items.length - 2} more</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*  Activity Timeline  */}
      <SectionWrapper title="Activity Timeline"description="Recent billing events and actions">
        <div className="space-y-3">
          {activityTimeline.map((evt) => {
            const colors: Record<string, { color?: string; bg?: string }> = {
              "Invoice Created":     { color: "#1B4FD8", bg: "#EFF6FF"},
              "Invoice Sent":        { color: "#0891B2", bg: "#F0F9FF"},
              "Invoice Paid":        { color: "#059669", bg: "#ECFDF5"},
              "Invoice Overdue":     { color: "#DC2626", bg: "#FEF2F2"},
              "Collection Updated":  { color: "#D97706", bg: "#FFFBEB"},
              "Activation Approved": { color: "#7C3AED", bg: "#F5F3FF"},
              "Project Activated":   { color: "#059669", bg: "#ECFDF5"},
            };
            const c = colors[evt.type] ?? { color: "#6B7280", bg: "#F9FAFB"};
            const typeAbbr = evt.type.split("").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
            return (
              <div
                key={evt.id}
                className="flex items-start gap-4 rounded-xl border p-4"style={{ background: c.bg, borderColor: `${c.color}30` }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"style={{ background: c.color + "20", color: c.color }}
                >
                  {typeAbbr}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold"style={{ color: c.color }}>{evt.type}</span>
                    <span className="text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{evt.client}</span>
                    {evt.invoiceNumber && <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>{evt.invoiceNumber}</span>}
                    {evt.amount && <span className="text-xs font-semibold"style={{ color: c.color }}>${evt.amount.toLocaleString()}</span>}
                  </div>
                  <p className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{evt.description}</p>
                  <div className="flex gap-3 mt-1 text-[11px]"style={{ color: "var(--rtm-text-muted)"}}>
                    <span>{evt.timestamp}</span>
                    <span>by {evt.actor}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SectionWrapper>

      {/*  Navigation Cards  */}
      <section>
        <SectionHeading>Billing Operations</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {navCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="rounded-xl border p-5 flex flex-col gap-2 transition-all hover:shadow-sm hover:-translate-y-0.5"style={{ background: card.bg, borderColor: card.border, textDecoration: "none"}}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{card.icon}</span>
                <span className="text-sm font-bold"style={{ color: card.accent }}>{card.title}</span>
              </div>
              <p className="text-xs leading-relaxed"style={{ color: "var(--rtm-text-secondary)"}}>
                {card.description}
              </p>
              <span className="text-xs font-semibold mt-auto"style={{ color: card.accent }}>Open →</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
