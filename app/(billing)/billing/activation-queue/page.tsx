"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import { activationQueue } from "@/lib/billing-mock-data";
import type { ActivationStatus, InvoiceStatus } from "@/lib/billing-mock-data";

const workspace = getWorkspace("billing")!;

type BadgeVariant = "success" | "error" | "warning" | "info" | "neutral" | "pending";

function activationStatusVariant(s: ActivationStatus): BadgeVariant {
  switch (s) {
    case "Activated": return "success";
    case "Ready For Activation": return "info";
    case "Pending Payment": return "warning";
    case "On Hold": return "error";
    default: return "neutral";
  }
}

function invoiceStatusVariant(s: InvoiceStatus): BadgeVariant {
  switch (s) {
    case "Paid": return "success";
    case "Overdue": return "error";
    case "Partially Paid": return "warning";
    case "Sent": return "info";
    case "Pending Approval": return "pending";
    default: return "neutral";
  }
}

function paymentStatusVariant(s: string): BadgeVariant {
  if (s === "Paid") return "success";
  if (s === "Overdue") return "error";
  if (s === "Partial") return "warning";
  return "pending";
}

function contractStatusVariant(s: string): BadgeVariant {
  if (s === "Signed") return "success";
  if (s === "In Review") return "warning";
  return "neutral";
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="text-left text-xs font-semibold uppercase tracking-wide px-3 py-2.5 whitespace-nowrap border-b"
      style={{ color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border-light)", background: "#F9FAFB" }}
    >
      {children}
    </th>
  );
}

function Td({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <td
      className="px-3 py-2.5 text-sm whitespace-nowrap border-b"
      style={{ color: muted ? "var(--rtm-text-muted)" : "var(--rtm-text-secondary)", borderColor: "var(--rtm-border-light)" }}
    >
      {children}
    </td>
  );
}

function ActionBtn({ label, onClick, variant = "secondary" }: { label: string; onClick: () => void; variant?: "primary" | "secondary" | "danger" }) {
  const base = "text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer";
  const styles: Record<string, string> = {
    primary:   "bg-[#7C3AED] text-white border-transparent hover:opacity-90",
    secondary: "bg-white text-[var(--rtm-text-primary)] border-[var(--rtm-border)] hover:bg-[var(--rtm-bg)]",
    danger:    "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] hover:bg-[#FEE2E2]",
  };
  return <button className={`${base} ${styles[variant]}`} onClick={onClick}>{label}</button>;
}

// KPIs
const ready = activationQueue.filter((a) => a.activationStatus === "Ready For Activation");
const pendingPayment = activationQueue.filter((a) => a.activationStatus === "Pending Payment");
const onHold = activationQueue.filter((a) => a.activationStatus === "On Hold");
const notReady = activationQueue.filter((a) => a.activationStatus === "Not Ready");
const totalRevenue = activationQueue.reduce((s, a) => s + a.revenue, 0);

// All activation statuses for filter
const allActivationStatuses: (ActivationStatus | "All")[] = ["All", "Ready For Activation", "Pending Payment", "Not Ready", "On Hold", "Activated"];

export default function ActivationQueuePage() {
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [filter, setFilter] = useState<ActivationStatus | "All">("All");
  const [notes, setNotes] = useState<Record<string, string>>({});

  function log(msg: string) {
    setActionLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 14)]);
  }

  const filtered = filter === "All" ? activationQueue : activationQueue.filter((a) => a.activationStatus === filter);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>
          {workspace.name} / Activation Queue
        </p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
          Activation Queue
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          Billing controls project activation. Clients move from payment confirmation to project creation, AM assignment, task blueprints, and department activation.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        <KpiCard
          title="Ready For Activation"
          value={String(ready.length)}
          trend="up"
          trendValue="2"
          iconBg="#F0F9FF"
          iconColor="#0891B2"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 13l4 4L19 7" /></svg>}
        />
        <KpiCard
          title="Pending Payment"
          value={String(pendingPayment.length)}
          trend="neutral"
          trendValue="unchanged"
          iconBg="#FFFBEB"
          iconColor="#D97706"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <KpiCard
          title="On Hold"
          value={String(onHold.length)}
          trend="neutral"
          trendValue="unchanged"
          iconBg="#FEF2F2"
          iconColor="#DC2626"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <KpiCard
          title="Not Ready"
          value={String(notReady.length)}
          trend="neutral"
          trendValue="unchanged"
          iconBg="#F9FAFB"
          iconColor="#6B7280"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <KpiCard
          title="Pipeline Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          trend="up"
          trendValue="$3,500"
          iconBg="#F5F3FF"
          iconColor="#7C3AED"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
        />
      </div>

      {/* Activation Flow */}
      <div
        className="rounded-xl border p-5"
        style={{ background: "linear-gradient(135deg, #F5F3FF 0%, #EFF6FF 100%)", borderColor: "#DDD6FE" }}
      >
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#7C3AED" }}>
          Project Activation Flow
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: "Proposal Accepted",      color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB" },
            { label: "Contract Signed",         color: "#1B4FD8", bg: "#EFF6FF", border: "#BFDBFE" },
            { label: "Invoice Created",         color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
            { label: "Invoice Paid",            color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
            { label: "Activation Ready",        color: "#0891B2", bg: "#F0F9FF", border: "#BAE6FD" },
            { label: "Create Project",          color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
            { label: "Assign Account Manager",  color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
            { label: "Generate Task Blueprints",color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
            { label: "Assign Departments",      color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
          ].map((step, i, arr) => (
            <React.Fragment key={step.label}>
              <span className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border" style={{ background: step.bg, color: step.color, borderColor: step.border }}>
                {step.label}
              </span>
              {i < arr.length - 1 && <span className="text-xs font-bold" style={{ color: "#9CA3AF" }}>→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Activation Queue Table */}
      <SectionWrapper
        title="Activation Queue"
        description="All clients in the activation pipeline"
        actions={
          <div className="flex flex-wrap gap-1.5">
            {allActivationStatuses.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className="text-xs font-semibold px-3 py-1 rounded-full border transition-colors"
                style={
                  filter === s
                    ? { background: "#7C3AED", color: "#fff", borderColor: "#7C3AED" }
                    : { background: "#fff", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }
                }
              >
                {s}
              </button>
            ))}
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <Th>Client</Th>
                <Th>Contract</Th>
                <Th>Revenue</Th>
                <Th>Assigned AM</Th>
                <Th>Departments</Th>
                <Th>Contract Status</Th>
                <Th>Invoice Status</Th>
                <Th>Payment Status</Th>
                <Th>Activation Status</Th>
                <Th>Ready Date</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr
                  key={a.id}
                  className="hover:bg-[#F9FAFB] transition-colors"
                  style={{
                    background: a.activationStatus === "Ready For Activation"
                      ? "#F0FFF4"
                      : a.activationStatus === "On Hold"
                      ? "#FFF7F7"
                      : "var(--rtm-bg)",
                  }}
                >
                  <Td><span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{a.client}</span></Td>
                  <Td muted>{a.contract}</Td>
                  <Td><span className="font-semibold text-[#059669]">${a.revenue.toLocaleString()}</span></Td>
                  <Td muted>{a.assignedAM}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      {a.departments.map((d) => (
                        <span key={d} className="text-[11px] font-semibold px-2 py-0.5 rounded-full border" style={{ background: "#EFF6FF", color: "#1B4FD8", borderColor: "#BFDBFE" }}>
                          {d}
                        </span>
                      ))}
                    </div>
                  </Td>
                  <Td><StatusBadge variant={contractStatusVariant(a.contractStatus)} label={a.contractStatus} size="sm" /></Td>
                  <Td><StatusBadge variant={invoiceStatusVariant(a.invoiceStatus)} label={a.invoiceStatus} size="sm" /></Td>
                  <Td><StatusBadge variant={paymentStatusVariant(a.paymentStatus)} label={a.paymentStatus} size="sm" /></Td>
                  <Td><StatusBadge variant={activationStatusVariant(a.activationStatus)} label={a.activationStatus} size="sm" /></Td>
                  <Td muted>{a.readyDate}</Td>
                  <Td>
                    <div className="flex gap-1.5 flex-wrap">
                      <ActionBtn
                        label="Approve Activation"
                        variant={a.activationStatus === "Ready For Activation" ? "primary" : "secondary"}
                        onClick={() => log(`Activation approved: ${a.client}`)}
                      />
                      <ActionBtn label="Create Project"     onClick={() => log(`Project created: ${a.client}`)} />
                      <ActionBtn label="Assign AM"          onClick={() => log(`AM assigned: ${a.client} → ${a.assignedAM}`)} />
                      <ActionBtn label="Generate Blueprints" onClick={() => log(`Task blueprints generated: ${a.client}`)} />
                      <ActionBtn label="Put On Hold" variant="danger" onClick={() => log(`On hold: ${a.client}`)} />
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

      {/* Activation Cards */}
      <SectionWrapper title="Activation Cards" description="Per-client activation readiness detail">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activationQueue.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border p-5 space-y-4"
              style={{
                background: a.activationStatus === "Ready For Activation" ? "#F0FFF4" : a.activationStatus === "On Hold" ? "#FFF7F7" : "var(--rtm-bg)",
                borderColor: a.activationStatus === "Ready For Activation" ? "#A7F3D0" : a.activationStatus === "On Hold" ? "#FECACA" : "var(--rtm-border-light)",
              }}
            >
              <div className="flex items-start justify-between">
                <span className="font-bold text-sm" style={{ color: "var(--rtm-text-primary)" }}>{a.client}</span>
                <StatusBadge variant={activationStatusVariant(a.activationStatus)} label={a.activationStatus} size="sm" />
              </div>
              <div className="space-y-1 text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                <div className="flex justify-between"><span>Contract</span><span className="font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>{a.contract}</span></div>
                <div className="flex justify-between"><span>Revenue</span><span className="font-bold text-[#059669]">${a.revenue.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Contract Status</span><StatusBadge variant={contractStatusVariant(a.contractStatus)} label={a.contractStatus} size="sm" /></div>
                <div className="flex justify-between"><span>Invoice Status</span><StatusBadge variant={invoiceStatusVariant(a.invoiceStatus)} label={a.invoiceStatus} size="sm" /></div>
                <div className="flex justify-between"><span>Payment</span><StatusBadge variant={paymentStatusVariant(a.paymentStatus)} label={a.paymentStatus} size="sm" /></div>
                <div className="flex justify-between"><span>Assigned AM</span><span className="font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>{a.assignedAM}</span></div>
                <div className="flex justify-between"><span>Ready Date</span><span>{a.readyDate}</span></div>
              </div>
              <div className="flex flex-wrap gap-1">
                {a.departments.map((d) => (
                  <span key={d} className="text-[11px] font-semibold px-2 py-0.5 rounded-full border" style={{ background: "#EFF6FF", color: "#1B4FD8", borderColor: "#BFDBFE" }}>
                    {d}
                  </span>
                ))}
              </div>
              <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{a.notes}</p>
              <textarea
                rows={2}
                placeholder="Add activation note…"
                value={notes[a.id] ?? ""}
                onChange={(e) => setNotes((prev) => ({ ...prev, [a.id]: e.target.value }))}
                className="w-full text-xs px-2.5 py-2 rounded-lg border resize-none"
                style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
              />
              <div className="flex flex-wrap gap-1.5">
                <ActionBtn
                  label={a.activationStatus === "Ready For Activation" ? "✅ Approve" : "Approve Activation"}
                  variant={a.activationStatus === "Ready For Activation" ? "primary" : "secondary"}
                  onClick={() => log(`Approved: ${a.client}`)}
                />
                <ActionBtn label="Create Project"  onClick={() => log(`Project created: ${a.client}`)} />
                <ActionBtn label="Put On Hold" variant="danger" onClick={() => log(`On hold: ${a.client}`)} />
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Action Log */}
      {actionLog.length > 0 && (
        <SectionWrapper title="Action Log" description="Recent activation actions">
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {actionLog.map((entry, i) => (
              <p key={i} className="text-xs font-mono" style={{ color: "var(--rtm-text-secondary)" }}>{entry}</p>
            ))}
          </div>
        </SectionWrapper>
      )}

      {/* Footer */}
      <div className="flex gap-2">
        <Link href="/billing" className="rtm-btn-secondary text-sm">← Dashboard</Link>
        <Link href="/billing/collections" className="rtm-btn-secondary text-sm">Collections →</Link>
        <Link href="/billing/recurring-revenue" className="rtm-btn-primary text-sm">Recurring Revenue →</Link>
      </div>
    </div>
  );
}
