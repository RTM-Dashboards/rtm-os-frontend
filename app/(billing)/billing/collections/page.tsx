"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import { collections as collectionsData, invoices } from "@/lib/billing/action-center-data";
import type { CollectionStatus } from "@/lib/billing/action-center-data";

const workspace = getWorkspace("billing")!;

function PreviewBadge() {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border"
      style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#92400E" }}
    >
      Preview — Target State
    </span>
  );
}

type BadgeVariant = "success"| "error"| "warning"| "info"| "neutral"| "pending";

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

function ActionBtn({ label, onClick, variant = "secondary", disabled: isDisabled}: { label: string; onClick: () => void; variant?: "primary"| "secondary"| "danger"; disabled?: boolean}) {
  const base = "text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors";
  const disabledClass = isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer";
  const styles: Record<string, string> = {
    primary:   "bg-[#1B4FD8] text-white border-transparent hover:opacity-90",
    secondary: "bg-white text-[var(--rtm-text-primary)] border-[var(--rtm-border)] hover:bg-[var(--rtm-bg)]",
    danger:    "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] hover:bg-[#FEE2E2]",
  };
  return <button disabled={isDisabled} title={isDisabled ? "Not yet available" : undefined} className={`${base} ${disabledClass} ${styles[variant]}`} onClick={isDisabled ? undefined : onClick}>{label}</button>;
}

// KPI computations (derived from seed data; updated reactively from local state)
const initialTotalOutstanding = collectionsData.reduce((s, c) => s + c.outstandingAmount, 0);
const overdue = invoices.filter((i) => i.status === "Overdue");
const initialHighRiskCount = collectionsData.filter((c) => c.daysOverdue >= 30).length;
const initialEscalatedCount = collectionsData.filter((c) => c.collectionStatus === "Escalated").length;

const allStatuses: CollectionStatus[] = ["Pending", "Reminder Sent", "Contacted", "Payment Arrangement", "Escalated", "Resolved"];

export default function CollectionsPage() {
  const [items, setItems] = useState(collectionsData);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<CollectionStatus | "All">("All");
  const [notes, setNotes] = useState<Record<string, string>>({});

  // Derived KPIs from live local state
  const totalOutstanding = items.reduce((s, c) => s + c.outstandingAmount, 0);
  const highRisk = items.filter((c) => c.daysOverdue >= 30);
  const escalated = items.filter((c) => c.collectionStatus === "Escalated");

  function log(msg: string) {
    setActionLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 14)]);
  }

  function markResolved(id: string, client: string, amount: number) {
    setItems((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, collectionStatus: "Resolved" as CollectionStatus } : c
      )
    );
    log(`Resolved: ${client} $${amount.toLocaleString()}`);
  }

  const filtered = selectedFilter === "All" ? items : items.filter((c) => c.collectionStatus === selectedFilter);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: workspace.accentColor }}>
          {workspace.name} / Collections
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>
            Collections Dashboard
          </h1>
          <PreviewBadge />
        </div>
        <p className="text-sm mt-1"style={{ color: "var(--rtm-text-secondary)"}}>
          Overdue accounts, collection statuses, assigned follow-ups, and resolution actions.
        </p>
      </div>

      {/* KPIs — derived from live local state so they update when Mark Resolved is clicked */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Total Outstanding"value={`$${totalOutstanding.toLocaleString()}`}
          trend="down"trendValue="$1,400"iconBg="#FEF2F2"iconColor="#DC2626"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        />
        <KpiCard
          title="Overdue Accounts"value={String(overdue.length)}
          trend="up"trendValue="1"iconBg="#FFFBEB"iconColor="#D97706"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>}
        />
        <KpiCard
          title="High Risk"value={String(highRisk.length)}
          trend="neutral"trendValue="unchanged"iconBg="#FEF2F2"iconColor="#DC2626"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>}
        />
        <KpiCard
          title="Escalated"value={String(escalated.length)}
          trend="up"trendValue="1"iconBg="#FDF4FF"iconColor="#9333EA"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>}
        />
      </div>

      {/* Collections Table */}
      <SectionWrapper
        title="Collections Queue"description="All overdue and outstanding accounts with collection statuses"actions={
          <div className="flex flex-wrap gap-2">
            {(["All", ...allStatuses] as (CollectionStatus | "All")[]).map((s) => (
              <button
                key={s}
                onClick={() => setSelectedFilter(s)}
                className="text-xs font-semibold px-3 py-1 rounded-full border transition-colors"style={
                  selectedFilter === s
                    ? { background: "#1B4FD8", color: "#fff", borderColor: "#1B4FD8"}
                    : { background: "#fff", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)"}
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
                <Th>Invoice</Th>
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
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-[#FFFBEB] transition-colors"style={{ background: c.daysOverdue >= 30 ? "#FFF7F7": "var(--rtm-bg)"}}
                >
                  <Td><span className="font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{c.client}</span></Td>
                  <Td muted>{c.invoiceNumber}</Td>
                  <Td>
                    <span
                      className="font-bold"style={{ color: c.outstandingAmount >= 2000 ? "#DC2626": c.outstandingAmount >= 1000 ? "#D97706": "var(--rtm-text-primary)"}}
                    >
                      ${c.outstandingAmount.toLocaleString()}
                    </span>
                  </Td>
                  <Td>
                    <span
                      className="font-semibold"style={{ color: c.daysOverdue >= 30 ? "#DC2626": c.daysOverdue >= 10 ? "#D97706": "#059669"}}
                    >
                      {c.daysOverdue > 0 ? `${c.daysOverdue}d` : "—"}
                    </span>
                  </Td>
                  <Td><StatusBadge variant={collectionStatusVariant(c.collectionStatus)} label={c.collectionStatus} size="sm"/></Td>
                  <Td muted>{c.assignedTo}</Td>
                  <Td muted>{c.lastContactDate}</Td>
                  <Td muted>{c.nextFollowUp}</Td>
                  <Td>
                    <div className="flex gap-1.5 flex-wrap">
                      <ActionBtn label="Send Reminder" disabled onClick={() => log(`Reminder sent to ${c.client}`)} />
                      <ActionBtn label="Log Contact" disabled onClick={() => log(`Contact logged: ${c.client}`)} />
                      <ActionBtn label="Payment Plan" disabled onClick={() => log(`Payment plan created: ${c.client}`)} />
                      <ActionBtn label="Escalate" variant="danger" disabled onClick={() => log(`Escalated: ${c.client}`)} />
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

      {/* Collection Cards Detail */}
      <SectionWrapper title="Collection Detail Cards"description="Per-account collection details with notes">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border p-5 space-y-4"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)"}}
            >
              <div className="flex items-start justify-between">
                <span className="font-bold text-sm"style={{ color: "var(--rtm-text-primary)"}}>{c.client}</span>
                <StatusBadge variant={collectionStatusVariant(c.collectionStatus)} label={c.collectionStatus} size="sm"/>
              </div>
              <div className="space-y-1 text-xs"style={{ color: "var(--rtm-text-muted)"}}>
                <div className="flex justify-between"><span>Invoice</span><span className="font-semibold"style={{ color: "var(--rtm-text-secondary)"}}>{c.invoiceNumber}</span></div>
                <div className="flex justify-between"><span>Outstanding</span><span className="font-bold text-[#DC2626]">${c.outstandingAmount.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Days Overdue</span><span className="font-semibold"style={{ color: c.daysOverdue >= 30 ? "#DC2626": c.daysOverdue > 0 ? "#D97706": "#059669"}}>{c.daysOverdue > 0 ? `${c.daysOverdue} days` : "Not overdue"}</span></div>
                <div className="flex justify-between"><span>Assigned To</span><span className="font-semibold"style={{ color: "var(--rtm-text-secondary)"}}>{c.assignedTo}</span></div>
                <div className="flex justify-between"><span>Last Contact</span><span>{c.lastContactDate}</span></div>
                <div className="flex justify-between"><span>Follow-Up</span><span>{c.nextFollowUp}</span></div>
              </div>
              <p className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{c.notes}</p>
              <textarea
                rows={2}
                placeholder="Add a collection note…"value={notes[c.id] ?? ""}
                onChange={(e) => setNotes((prev) => ({ ...prev, [c.id]: e.target.value }))}
                className="w-full text-xs px-2.5 py-2 rounded-lg border resize-none"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)"}}
              />
              <div className="flex flex-wrap gap-1.5">
                <ActionBtn label="Send Reminder" disabled onClick={() => log(`Reminder sent: ${c.client}`)} />
                <ActionBtn
                  label="Mark Resolved"
                  variant="primary"
                  onClick={() => markResolved(c.id, c.client, c.outstandingAmount)}
                />
                <ActionBtn label="Escalate" variant="danger" disabled onClick={() => log(`Escalated: ${c.client}`)} />
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Action Log */}
      {actionLog.length > 0 && (
        <SectionWrapper title="Action Log"description="Recent collections actions">
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {actionLog.map((entry, i) => (
              <p key={i} className="text-xs font-mono"style={{ color: "var(--rtm-text-secondary)"}}>{entry}</p>
            ))}
          </div>
        </SectionWrapper>
      )}

      {/* Footer */}
      <div className="flex gap-2">
        <Link href="/billing" className="rtm-btn-secondary text-sm">← Dashboard</Link>
        <Link href="/billing/invoices" className="rtm-btn-secondary text-sm">Invoices →</Link>
        <Link href="/billing/activation-queue" className="rtm-btn-primary text-sm">Activation Queue →</Link>
      </div>
    </div>
  );
}
