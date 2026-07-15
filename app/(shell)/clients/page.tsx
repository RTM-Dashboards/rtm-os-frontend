"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import TaskAccessCard from "@/components/tasks/TaskAccessCard";
import { NOTIFICATIONS } from "@/lib/notifications";
import { MASTER_CLIENTS } from "@/lib/mock/master-clients";
import { upsertMasterClient, fetchMasterClients } from "@/lib/mock/master-clients-api";
import type {
  MasterClient,
  BillingStatus,
  ActivationStatus,
  HealthStatus,
} from "@/lib/mock/master-clients";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES  (local-only display aliases — sourced from master-clients)
// ─────────────────────────────────────────────────────────────────────────────

type ClientStatus = MasterClient["currentStatus"];
type WorkflowStatus = MasterClient["workflowStatus"];
type Priority = MasterClient["priority"];

// ─────────────────────────────────────────────────────────────────────────────
// BADGE CONFIGS
// ─────────────────────────────────────────────────────────────────────────────

type PillStyles = { bg?: string; text: string; dot?: string; border: string };

const CLIENT_STATUS_STYLES: Record<string, PillStyles> = {
  "Lead":                          { bg: "#f8fafc", text: "#64748b", dot: "#94a3b8", border: "#e2e8f0"},
  "Proposal Sent":                 { bg: "#eff6ff", text: "#1d4ed8", dot: "#3b82f6", border: "#bfdbfe"},
  "Invoice Sent":                  { bg: "#fefce8", text: "#a16207", dot: "#eab308", border: "#fef08a"},
  "Invoice Paid":                  { bg: "#f0fdf4", text: "#166534", dot: "#22c55e", border: "#bbf7d0"},
  "Ready for Onboarding":          { bg: "#f0fdf4", text: "#15803d", dot: "#16a34a", border: "#86efac"},
  "AM Assignment Needed":          { bg: "#fff7ed", text: "#c2410c", dot: "#f97316", border: "#fed7aa"},
  "Onboarding Pending":            { bg: "#eff6ff", text: "#1e40af", dot: "#6366f1", border: "#c7d2fe"},
  "Department Activation Pending": { bg: "#fdf4ff", text: "#7e22ce", dot: "#a855f7", border: "#e9d5ff"},
  "Active":                        { bg: "#ecfdf5", text: "#059669", dot: "#10b981", border: "#a7f3d0"},
  "Renewal Due":                   { bg: "#fffbeb", text: "#b45309", dot: "#f59e0b", border: "#fde68a"},
  "Cancellation Requested":        { bg: "#fef2f2", text: "#b91c1c", dot: "#ef4444", border: "#fecaca"},
  "Offboarding":                   { bg: "#f8fafc", text: "#475569", dot: "#64748b", border: "#cbd5e1"},
};

const WORKFLOW_STATUS_STYLES: Record<string, PillStyles> = {
  "Not Started":    { bg: "#f8fafc", text: "#64748b", dot: "#94a3b8", border: "#e2e8f0"},
  "Pending Review": { bg: "#fefce8", text: "#a16207", dot: "#eab308", border: "#fef08a"},
  "In Progress":    { bg: "#eff6ff", text: "#1d4ed8", dot: "#3b82f6", border: "#bfdbfe"},
  "Awaiting Client":{ bg: "#fff7ed", text: "#c2410c", dot: "#f97316", border: "#fed7aa"},
  "Escalated":      { bg: "#fef2f2", text: "#b91c1c", dot: "#ef4444", border: "#fecaca"},
  "Complete":       { bg: "#ecfdf5", text: "#059669", dot: "#10b981", border: "#a7f3d0"},
};

const BILLING_STATUS_STYLES: Record<string, PillStyles> = {
  "Pending": { bg: "#fefce8", text: "#a16207", dot: "#eab308", border: "#fef08a"},
  "Paid":    { bg: "#ecfdf5", text: "#059669", dot: "#10b981", border: "#a7f3d0"},
  "Overdue": { bg: "#fef2f2", text: "#b91c1c", dot: "#ef4444", border: "#fecaca"},
  "Cleared": { bg: "#f0fdf4", text: "#166534", dot: "#22c55e", border: "#bbf7d0"},
  "Closed":  { bg: "#f8fafc", text: "#475569", dot: "#64748b", border: "#cbd5e1"},
};

const ACTIVATION_STATUS_STYLES: Record<string, PillStyles> = {
  "Not Started":                   { bg: "#f8fafc", text: "#64748b", dot: "#94a3b8", border: "#e2e8f0"},
  "Ready for Onboarding":          { bg: "#f0fdf4", text: "#15803d", dot: "#16a34a", border: "#86efac"},
  "AM Assignment Needed":          { bg: "#fff7ed", text: "#c2410c", dot: "#f97316", border: "#fed7aa"},
  "Onboarding Pending":            { bg: "#eff6ff", text: "#1e40af", dot: "#6366f1", border: "#c7d2fe"},
  "Department Activation Pending": { bg: "#fdf4ff", text: "#7e22ce", dot: "#a855f7", border: "#e9d5ff"},
  "Active":                        { bg: "#ecfdf5", text: "#059669", dot: "#10b981", border: "#a7f3d0"},
};

const HEALTH_STATUS_STYLES: Record<string, PillStyles> = {
  "Excellent": { bg: "#ecfdf5", text: "#059669", dot: "#10b981", border: "#a7f3d0"},
  "Good":      { bg: "#eff6ff", text: "#1d4ed8", dot: "#3b82f6", border: "#bfdbfe"},
  "At Risk":   { bg: "#fffbeb", text: "#b45309", dot: "#f59e0b", border: "#fde68a"},
  "Critical":  { bg: "#fef2f2", text: "#b91c1c", dot: "#ef4444", border: "#fecaca"},
};

const PRIORITY_STYLES: Record<string, { bg?: string; text: string; border: string }> = {
  "High":   { bg: "#fef2f2", text: "#b91c1c", border: "#fecaca"},
  "Medium": { bg: "#fffbeb", text: "#b45309", border: "#fde68a"},
  "Low":    { bg: "#f8fafc", text: "#64748b", border: "#e2e8f0"},
};

// ─────────────────────────────────────────────────────────────────────────────
// STATUS PILL
// ─────────────────────────────────────────────────────────────────────────────

function StatusPill({
  label,
  styles,
  size = "sm",
}: {
  label: string;
  styles: PillStyles;
  size?: "xs" | "sm";
}) {
  const padding = size === "xs" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border whitespace-nowrap ${padding}`}
      style={{ background: styles.bg, color: styles.text, borderColor: styles.border }}
    >
      {styles.dot && (
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: styles.dot }} />
      )}
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI CARD
// ─────────────────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  color,
  bg,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  bg?: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-1">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-tight">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>
        {value}
      </p>
      {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
      <div className="mt-1 h-1 rounded-full w-8" style={{ background: bg }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECKLIST ROW
// ─────────────────────────────────────────────────────────────────────────────

function CheckRow({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span
        className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
          done ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}
      >
        {done ? "✓" : ""}
      </span>
      <span className={done ? "text-slate-700 dark:text-slate-300" : "text-slate-400"}>{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CLIENT PROFILE DRAWER
// ─────────────────────────────────────────────────────────────────────────────

function ClientDrawer({
  client,
  onClose,
}: {
  client: MasterClient;
  onClose: () => void;
}) {
  const cl = client.activationChecklist;
  const checklistTotal = Object.values(cl).length;
  const checklistDone = Object.values(cl).filter(Boolean).length;
  const checklistPct = Math.round((checklistDone / checklistTotal) * 100);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 z-50 overflow-y-auto shadow-2xl flex flex-col">
        {/* Drawer header */}
        <div className="sticky top-0 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-start justify-between gap-4 z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0"
              style={{ background: client.avatarColor }}
            >
              {client.clientName.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">{client.clientName}</p>
              <p className="text-xs text-slate-500">{client.industry}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors text-xl leading-none mt-0.5">
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick actions */}
          <div className="flex flex-wrap gap-2">
            <Link href={`/clients/${client.slug}`} className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium">
              Full Profile →
            </Link>
            <Link href="/admin/workflows" className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium">
              Workflow Queue
            </Link>
            <Link href="/billing/invoices" className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium">
              Billing
            </Link>
            <Link href="/tasks" className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium">
              Tasks
            </Link>
          </div>

          {/* Status grid */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Client Overview</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Status</p>
                <StatusPill label={client.currentStatus} styles={CLIENT_STATUS_STYLES[client.currentStatus] ?? { text: "#64748b", border: "#e2e8f0" }} />
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Health</p>
                <StatusPill label={client.clientHealth} styles={HEALTH_STATUS_STYLES[client.clientHealth] ?? { text: "#64748b", border: "#e2e8f0" }} />
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Assigned AM</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{client.assignedAM}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Monthly Value</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {client.monthlyValue > 0 ? `$${client.monthlyValue.toLocaleString()}` : "—"}
                </p>
              </div>
            </div>
          </section>

          {/* Workflow */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Workflow Status</h3>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 flex items-center justify-between">
              <StatusPill label={client.workflowStatus} styles={WORKFLOW_STATUS_STYLES[client.workflowStatus] ?? { text: "#64748b", border: "#e2e8f0" }} />
              <Link href="/admin/workflows" className="text-xs text-blue-600 hover:underline font-medium">
                Open Queue →
              </Link>
            </div>
          </section>

          {/* Billing summary */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Billing Summary</h3>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Billing Status</span>
                <StatusPill label={client.billingStatus} styles={BILLING_STATUS_STYLES[client.billingStatus] ?? { text: "#64748b", border: "#e2e8f0" }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Invoice Status</span>
                <span className="text-sm font-medium text-slate-800 dark:text-white">{client.invoiceStatus}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Renewal Date</span>
                <span className="text-sm font-medium text-slate-800 dark:text-white">{client.renewalDate}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Link href="/billing/invoices" className="text-xs text-blue-600 hover:underline font-medium">View Invoices →</Link>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <Link href="/renewals" className="text-xs text-blue-600 hover:underline font-medium">Renewal →</Link>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <Link href="/billing/cancellations" className="text-xs text-blue-600 hover:underline font-medium">Cancellations →</Link>
            </div>
          </section>

          {/* Affiliate Attribution */}
          {(client.referralSource && client.referralSource !== "Direct") && (
            <section>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Affiliate Attribution</h3>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Referral Source</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#ECFDF5", color: "#059669"}}>{client.referralSource}</span>
                </div>
                {client.affiliateName && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Affiliate</span>
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{client.affiliateName}</span>
                  </div>
                )}
                {client.referralRevenue && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Referral Revenue</span>
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{client.referralRevenue}</span>
                  </div>
                )}
                {client.commissionStatus && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Commission Status</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{
                      background: client.commissionStatus === "Paid" ? "#ECFDF5" : client.commissionStatus === "Pending" ? "#FFFBEB" : "#EFF6FF",
                      color:      client.commissionStatus === "Paid" ? "#059669" : client.commissionStatus === "Pending" ? "#D97706" : "#2563EB",
                    }}>
                      {client.commissionStatus}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-2">
                <Link href="/sales/affiliates" className="text-xs text-emerald-600 hover:underline font-medium">Open Affiliate Record →</Link>
              </div>
            </section>
          )}

          {/* Activation readiness */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Activation Readiness</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${checklistPct}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                {checklistDone}/{checklistTotal}
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-2">
              <CheckRow label="Invoice paid"               done={cl.invoicePaid} />
              <CheckRow label="Billing cleared"            done={cl.billingCleared} />
              <CheckRow label="Contract confirmed"         done={cl.contractConfirmed} />
              <CheckRow label="Services confirmed"         done={cl.servicesConfirmed} />
              <CheckRow label="Client contact verified"    done={cl.clientContactVerified} />
              <CheckRow label="AM assigned"                done={cl.amAssigned} />
              <CheckRow label="Onboarding record created"  done={cl.onboardingRecordCreated} />
              <CheckRow label="Activation tasks created"   done={cl.activationTasksCreated} />
              <CheckRow label="Kickoff needed"             done={!cl.kickoffNeeded} />
            </div>
            <div className="mt-2 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-0.5">Next Required Action</p>
              <p className="text-sm text-amber-700 dark:text-amber-400">{client.nextRequiredAction}</p>
            </div>
          </section>

          {/* Active services */}
          {client.activeServices.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Active Departments / Services</h3>
              <div className="flex flex-wrap gap-2">
                {client.activeServices.map((s) => (
                  <span
                    key={s}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Cancellation / Offboarding */}
          {(client.currentStatus === "Cancellation Requested" || client.currentStatus === "Offboarding") && (
            <section>
              <h3 className="text-xs font-semibold text-red-500 uppercase tracking-widest mb-3">Cancellation / Offboarding</h3>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center justify-between">
                <StatusPill label={client.currentStatus} styles={CLIENT_STATUS_STYLES[client.currentStatus] ?? { text: "#b91c1c", border: "#fecaca" }} />
                <div className="flex gap-2">
                  <Link href="/billing/cancellations" className="text-xs text-red-600 hover:underline font-medium">
                    Cancellations →
                  </Link>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <Link href="/cancellations/offboarding" className="text-xs text-red-600 hover:underline font-medium">
                    Offboarding →
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* Client Tasks Summary */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Client Tasks Summary</h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { label: "Open Tasks",   value: 5,  color: "#1D4ED8", bg: "#EFF6FF"},
                { label: "Overdue",      value: 2,  color: "#DC2626", bg: "#FEF2F2"},
                { label: "Upcoming",     value: 3,  color: "#D97706", bg: "#FFFBEB"},
                { label: "Completed",    value: 12, color: "#059669", bg: "#ECFDF5"},
              ].map(({ label, value, color, bg }) => (
                <div key={label} className="rounded-lg p-2.5 text-center" style={{ background: bg }}>
                  <div className="text-xl font-black" style={{ color }}>{value}</div>
                  <div className="text-[10px] font-semibold mt-0.5" style={{ color }}>{label}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Link href="/tasks" className="flex-1 text-center text-xs px-3 py-2 rounded-lg font-bold text-white transition-opacity hover:opacity-90" style={{ background: "#1B4FD8" }}>
                Open Task Queue
              </Link>
              <Link href="/tasks" className="flex-1 text-center text-xs px-3 py-2 rounded-lg font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors">
                Create Task
              </Link>
            </div>
          </section>

          {/* Recent notes */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Recent Notes</h3>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
              <p className="text-sm text-slate-700 dark:text-slate-300">{client.notes}</p>
            </div>
          </section>

          {/* Timeline */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Recent Timeline</h3>
            <div className="space-y-3">
              {client.recentEvents.map((ev, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 mt-1 flex-shrink-0"/>
                    {i < client.recentEvents.length - 1 && (
                      <div className="w-px flex-1 bg-slate-200 dark:bg-slate-800 mt-1"/>
                    )}
                  </div>
                  <div className="pb-3">
                    <p className="text-sm text-slate-700 dark:text-slate-300">{ev.action}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {ev.date} · {ev.actor}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADD CLIENT MODAL
// Reuses the same upsertMasterClient() + MasterClient schema established by
// Billing's AddClientModal. No second creation mechanism — same API, same
// data store, same pattern.
// ─────────────────────────────────────────────────────────────────────────────

function AddClientModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (client: MasterClient) => void;
}) {
  const [form, setForm] = useState({
    clientName: "",
    email: "",
    industry: "",
    monthlyValue: "",
    assignedAM: "Unassigned",
    activeServices: "",
  });
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.clientName.trim()) { setError("Client name is required."); return; }
    const slug = form.clientName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const services = form.activeServices
      ? form.activeServices.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    const mv = parseInt(form.monthlyValue) || 0;

    const newClient: MasterClient = {
      id: `mc-new-${Date.now()}`,
      slug,
      clientName: form.clientName.trim(),
      email: form.email.trim(),
      industry: form.industry.trim() || "Unknown",
      avatarColor: "#6366f1",
      salesStatus: "Closed Won",
      salesOwner: "",
      billingStatus: "Pending" as BillingStatus,
      invoiceStatus: "Draft",
      paymentStatus: "Unpaid",
      cancellationStatus: "None",
      upgradeDowngradeStatus: "None",
      cleared: false,
      activeServices: services,
      monthlyValue: mv,
      billingOwner: "",
      assignedAM: form.assignedAM,
      activationStatus: "Not Started" as ActivationStatus,
      onboardingStatus: "Not Started",
      renewalDate: "—",
      renewalStatus: "N/A",
      clientHealth: "Good" as HealthStatus,
      priority: "Medium",
      currentStatus: "Invoice Sent",
      workflowStatus: "Not Started",
      lastActivity: new Date().toISOString().slice(0, 10),
      nextRequiredAction: "Generate and send invoice",
      notes: "",
      activationChecklist: {
        invoicePaid: false,
        billingCleared: false,
        contractConfirmed: false,
        servicesConfirmed: services.length > 0,
        clientContactVerified: !!form.email.trim(),
        amAssigned: form.assignedAM !== "Unassigned",
        onboardingRecordCreated: false,
        activationTasksCreated: false,
        kickoffNeeded: true,
        kickoffCallCompleted: false,
      },
      recentEvents: [{
        date: new Date().toISOString().slice(0, 10),
        actor: "Admin",
        action: "Client record created by Admin",
      }],
      stripeCustomerId: null,
      stripeInvoiceId: null,
      stripeSubscriptionId: null,
      stripeSyncStatus: "Not Connected",
    };

    onAdd(newClient);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
        style={{ border: "1px solid var(--rtm-border)" }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "var(--rtm-border-light)" }}
        >
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: "var(--rtm-blue)" }}
            >
              Admin
            </p>
            <h2
              className="text-base font-bold"
              style={{ color: "var(--rtm-text-primary)" }}
            >
              Add Client — Manual Entry
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-xl leading-none"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          {[
            { label: "Client Name *",                       key: "clientName",    placeholder: "Acme Corp",              type: "text"   },
            { label: "Email",                               key: "email",         placeholder: "contact@client.com",     type: "email"  },
            { label: "Industry",                            key: "industry",      placeholder: "Home Services – HVAC",   type: "text"   },
            { label: "Monthly Value ($)",                   key: "monthlyValue",  placeholder: "2400",                   type: "number" },
            { label: "Active Services (comma-separated)",   key: "activeServices",placeholder: "SEO / GBP, Google Ads",  type: "text"   },
          ].map(({ label, key, placeholder, type }) => (
            <div key={key} className="space-y-1">
              <label
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: "var(--rtm-text-muted)" }}
              >
                {label}
              </label>
              <input
                type={type}
                placeholder={placeholder}
                value={(form as Record<string, string>)[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full text-sm px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                style={{
                  borderColor: "var(--rtm-border)",
                  background: "var(--rtm-bg)",
                  color: "var(--rtm-text-primary)",
                }}
              />
            </div>
          ))}

          <div className="space-y-1">
            <label
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Assigned AM
            </label>
            <select
              value={form.assignedAM}
              onChange={(e) => setForm((f) => ({ ...f, assignedAM: e.target.value }))}
              className="w-full text-sm px-3 py-2 rounded-lg border focus:outline-none"
              style={{
                borderColor: "var(--rtm-border)",
                background: "var(--rtm-bg)",
                color: "var(--rtm-text-primary)",
              }}
            >
              <option value="Unassigned">Unassigned</option>
              <option>Jordan M.</option>
              <option>Sarah K.</option>
              <option>Alex R.</option>
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 text-sm font-semibold py-2 rounded-lg border"
              style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 text-sm font-semibold py-2 rounded-lg text-white"
              style={{ background: "var(--rtm-blue)" }}
            >
              Add Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROW ACTION DROPDOWN
// ─────────────────────────────────────────────────────────────────────────────

function RowActions({
  client,
  onViewClient,
}: {
  client: MasterClient;
  onViewClient: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
        title="Actions"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="10" cy="4"  r="1.5"/>
          <circle cx="10" cy="10" r="1.5"/>
          <circle cx="10" cy="16" r="1.5"/>
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
            <button
              onClick={() => { onViewClient(); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
              <span>👤</span> View Client
            </button>
            <Link
              href="/admin/workflows"
              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 block"
              onClick={() => setOpen(false)}>
              <span>⚙️</span> Open Workflow
            </Link>
            <Link
              href="/billing/invoices"
              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 block"
              onClick={() => setOpen(false)}>
              <span>💳</span> View Billing
            </Link>
            <Link
              href="/billing/activation"
              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 block"
              onClick={() => setOpen(false)}>
              <span>🚀</span> View Activation
            </Link>
            <Link
              href="/tasks"
              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 block"
              onClick={() => setOpen(false)}>
              <span>✅</span> View Tasks
            </Link>
            <Link
              href="/renewals"
              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 block"
              onClick={() => setOpen(false)}>
              <span>🔄</span> View Renewal
            </Link>
            <Link
              href="/billing/cancellations"
              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 block"
              onClick={() => setOpen(false)}>
              <span>❌</span> View Cancellation
            </Link>
            <Link
              href="/cancellations/offboarding"
              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 block"
              onClick={() => setOpen(false)}>
              <span>📦</span> Offboarding
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function ClientsPage() {
  // Data: seed from MASTER_CLIENTS singleton, hydrate from file-backed API on mount
  const [clients, setClients] = useState<MasterClient[]>(MASTER_CLIENTS);
  const [showAddModal, setShowAddModal] = useState(false);

  const [searchQuery,       setSearchQuery]       = useState("");
  const [filterStatus,      setFilterStatus]      = useState<string>("all");
  const [filterWorkflow,    setFilterWorkflow]     = useState<string>("all");
  const [filterBilling,     setFilterBilling]      = useState<string>("all");
  const [filterActivation,  setFilterActivation]   = useState<string>("all");
  const [filterAM,          setFilterAM]           = useState<string>("all");
  const [filterHealth,      setFilterHealth]       = useState<string>("all");
  const [filterPriority,    setFilterPriority]     = useState<string>("all");
  const [activeDrawer,      setActiveDrawer]       = useState<MasterClient | null>(null);

  // Hydrate from file-backed API (picks up Billing / AM mutations made in other route groups)
  useEffect(() => {
    fetchMasterClients()
      .then((data) => setClients(data))
      .catch(() => { /* keep MASTER_CLIENTS seed */ });
  }, []);

  const handleAdd = useCallback((newClient: MasterClient) => {
    setClients((prev) => [newClient, ...prev]);
    void upsertMasterClient(newClient).catch(() => {});
  }, []);

  // ── Computed KPIs ──────────────────────────────────────────────────────────
  const totalClients          = clients.length;
  const activeClients         = clients.filter((c) => c.currentStatus === "Active").length;
  const readyForOnboarding    = clients.filter((c) => c.currentStatus === "Ready for Onboarding").length;
  const inDeptActivation      = clients.filter((c) => c.currentStatus === "Department Activation Pending").length;
  const renewalDue            = clients.filter((c) => c.currentStatus === "Renewal Due").length;
  const cancellationRequested = clients.filter((c) => c.currentStatus === "Cancellation Requested").length;
  const offboarding           = clients.filter((c) => c.currentStatus === "Offboarding").length;
  const totalMRR              = clients.reduce((s, c) => s + c.monthlyValue, 0);

  // ── Unique AM filter options ───────────────────────────────────────────────
  const allAMs = Array.from(new Set(clients.map((c) => c.assignedAM))).sort();

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        c.clientName.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.assignedAM.toLowerCase().includes(q) ||
        c.activeServices.some((s) => s.toLowerCase().includes(q));

      const matchStatus     = filterStatus     === "all" || c.currentStatus    === filterStatus;
      const matchWorkflow   = filterWorkflow   === "all" || c.workflowStatus   === filterWorkflow;
      const matchBilling    = filterBilling    === "all" || c.billingStatus    === filterBilling;
      const matchActivation = filterActivation === "all" || c.activationStatus === filterActivation;
      const matchAM         = filterAM         === "all" || c.assignedAM       === filterAM;
      const matchHealth     = filterHealth     === "all" || c.clientHealth     === filterHealth;
      const matchPriority   = filterPriority   === "all" || c.priority         === filterPriority;

      return matchSearch && matchStatus && matchWorkflow && matchBilling &&
             matchActivation && matchAM && matchHealth && matchPriority;
    });
  }, [clients, searchQuery, filterStatus, filterWorkflow, filterBilling,
      filterActivation, filterAM, filterHealth, filterPriority]);

  const selectClass =
    "text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer";

  return (
    <div className="space-y-6">
      {/* Task Management Engine Banner */}
      <TaskAccessCard
        context="Client Portfolio"
        variant="banner"
        counters={{ open: 47, overdue: 8, dueToday: 12, completed: 67 }}
        createLabel="Create Client Task"
      />

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[var(--rtm-blue)] uppercase tracking-widest mb-1">
            Master Records
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Clients
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Master client records connected to workflow, billing, onboarding, departments, renewals,
            cancellations, and offboarding.
          </p>
        </div>

        {/*
          Action bar:
          - "+ New Client": opens AddClientModal → upsertMasterClient() → shared master data store
          - "Import / Export": stubs for future bulk operations
          - "Workflow Queue": links to /admin/workflows — directly relevant here because every client
            row has a workflowStatus field and the drawer exposes workflow state. This is the
            top-level Admin clients register; the workflow queue is the natural companion action.
            "Create Note" was a dead button with no handler — removed (per-client notes live in
            the row-action drawer's "Add Note" option).
        */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--rtm-blue)] hover:bg-[var(--rtm-blue-dark)] text-white text-xs font-semibold transition-colors shadow-sm"
          >
            <span>+</span> New Client
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors">
            ↑ Import
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors">
            ↓ Export
          </button>
          {/* Workflow Queue: legitimate companion action — every client has a workflowStatus
              and the admin manages workflow states across all clients from here */}
          <Link
            href="/admin/workflows"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
          >
            ⚙️ Workflow Queue
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
        <KpiCard label="Total Clients"              value={totalClients}          bg="#bfdbfe"/>
        <KpiCard label="Active Clients"             value={activeClients}         bg="#a7f3d0"/>
        <KpiCard label="Ready for Onboarding"       value={readyForOnboarding}    bg="#86efac"/>
        <KpiCard label="Dept Activation"            value={inDeptActivation}      bg="#e9d5ff"/>
        <KpiCard label="Renewal Due"                value={renewalDue}            bg="#fde68a"/>
        <KpiCard label="Cancellation Requested"     value={cancellationRequested} bg="#fecaca"/>
        <KpiCard label="Offboarding"                value={offboarding}           bg="#cbd5e1"/>
        <KpiCard
          label="Monthly Recurring Revenue"
          value={`$${(totalMRR / 1000).toFixed(0)}k`}
          sub={`$${totalMRR.toLocaleString()}/mo`}
          bg="#bfdbfe"
        />
      </div>

      {/* Search + Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            placeholder="Search by client name, email, AM, or service…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={selectClass}>
            <option value="all">All Statuses</option>
            {(["Lead","Proposal Sent","Invoice Sent","Invoice Paid","Ready for Onboarding",
               "AM Assignment Needed","Onboarding Pending","Department Activation Pending",
               "Active","Renewal Due","Cancellation Requested","Offboarding"] as ClientStatus[])
              .map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select value={filterWorkflow} onChange={(e) => setFilterWorkflow(e.target.value)} className={selectClass}>
            <option value="all">All Workflow</option>
            {(["Not Started","Pending Review","In Progress","Awaiting Client","Escalated","Complete"] as WorkflowStatus[])
              .map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select value={filterBilling} onChange={(e) => setFilterBilling(e.target.value)} className={selectClass}>
            <option value="all">All Billing</option>
            {(["Pending","Paid","Overdue","Cleared","Closed"] as BillingStatus[])
              .map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select value={filterActivation} onChange={(e) => setFilterActivation(e.target.value)} className={selectClass}>
            <option value="all">All Activation</option>
            {(["Not Started","Ready for Onboarding","AM Assignment Needed","Onboarding Pending",
               "Department Activation Pending","Active"] as ActivationStatus[])
              .map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select value={filterAM} onChange={(e) => setFilterAM(e.target.value)} className={selectClass}>
            <option value="all">All AMs</option>
            {allAMs.map((am) => <option key={am} value={am}>{am}</option>)}
          </select>

          <select value={filterHealth} onChange={(e) => setFilterHealth(e.target.value)} className={selectClass}>
            <option value="all">All Health</option>
            {(["Excellent","Good","At Risk","Critical"] as HealthStatus[])
              .map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className={selectClass}>
            <option value="all">All Priority</option>
            {(["High","Medium","Low"] as Priority[])
              .map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          {(searchQuery || filterStatus !== "all" || filterWorkflow !== "all" || filterBilling !== "all" ||
            filterActivation !== "all" || filterAM !== "all" || filterHealth !== "all" || filterPriority !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("all");
                setFilterWorkflow("all");
                setFilterBilling("all");
                setFilterActivation("all");
                setFilterAM("all");
                setFilterHealth("all");
                setFilterPriority("all");
              }}
              className="text-xs px-3 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors"
            >
              ✕ Clear Filters
            </button>
          )}
        </div>

        <div className="text-xs text-slate-400">
          Showing {filtered.length} of {clients.length} clients
        </div>
      </div>

      {/*
        Client table — scroll UX fix:
        The outer wrapper uses overflow-x-scroll (always-visible horizontal scrollbar)
        rather than overflow-x-auto (only shows scrollbar at bottom when overflowing,
        requiring scroll to page bottom first). The thead uses sticky top-0 so column
        headers remain visible as the user scrolls down through many rows. Together
        these mean: the user can scroll horizontally from wherever they are vertically
        in the table, and always knows which column they're looking at.
      */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-scroll">
          <table className="w-full text-sm min-w-[1400px]">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                {[
                  "Client Name",
                  "Industry",
                  "Assigned AM",
                  "Referral Source",
                  "Affiliate",
                  "Current Status",
                  "Workflow Status",
                  "Billing Status",
                  "Activation Status",
                  "Active Services",
                  "Monthly Value",
                  "Renewal Date",
                  "Client Health",
                  "Priority",
                  "Last Activity",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap bg-slate-50 dark:bg-slate-950"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={16} className="px-6 py-16 text-center text-slate-400 text-sm">
                    No clients match your current filters.
                  </td>
                </tr>
              )}
              {filtered.map((client, idx) => (
                <tr
                  key={client.id}
                  className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors ${
                    idx % 2 === 0 ? "" : "bg-slate-50/30 dark:bg-slate-950/30"}`}
                >
                  {/* Client Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: client.avatarColor }}
                      >
                        {client.clientName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setActiveDrawer(client)}
                            className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left leading-tight">
                            {client.clientName}
                          </button>
                          {/* Notification alert badge */}
                          {(() => {
                            const alertCount = NOTIFICATIONS.filter(
                              (n) => n.clientSlug === client.slug &&
                                (n.status === "Unread" || n.status === "Escalated")
                            ).length;
                            const hasCritical = NOTIFICATIONS.some(
                              (n) => n.clientSlug === client.slug &&
                                (n.status === "Unread" || n.status === "Escalated") &&
                                (n.priority === "Critical" || n.priority === "Urgent")
                            );
                            if (alertCount === 0) return null;
                            return (
                              <span
                                className="text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1"
                                style={{
                                  background: hasCritical ? "#DC2626" : "#F97316",
                                  color: "#ffffff",
                                }}
                                title={`${alertCount} active alert${alertCount !== 1 ? "s" : ""}`}
                              >
                                {alertCount}
                              </span>
                            );
                          })()}
                        </div>
                        <p className="text-[10px] text-slate-400">{client.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Industry */}
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">{client.industry}</span>
                  </td>

                  {/* AM */}
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">{client.assignedAM}</span>
                  </td>

                  {/* Referral Source */}
                  <td className="px-4 py-3">
                    {client.referralSource ? (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                        style={{
                          background: client.referralSource === "Affiliate" ? "#ECFDF5" : "#EFF6FF",
                          color:      client.referralSource === "Affiliate" ? "#059669" : "#2563EB",
                        }}
                      >
                        {client.referralSource}
                      </span>
                    ) : <span className="text-xs text-slate-400">—</span>}
                  </td>

                  {/* Affiliate */}
                  <td className="px-4 py-3">
                    {client.affiliateName ? (
                      <a href="/sales/affiliates" className="text-xs font-semibold whitespace-nowrap" style={{ color: "#059669" }}>
                        {client.affiliateName}
                      </a>
                    ) : <span className="text-xs text-slate-400">—</span>}
                  </td>

                  {/* Current Status */}
                  <td className="px-4 py-3">
                    <StatusPill
                      label={client.currentStatus}
                      styles={CLIENT_STATUS_STYLES[client.currentStatus] ?? { text: "#64748b", border: "#e2e8f0" }}
                      size="xs"
                    />
                  </td>

                  {/* Workflow Status */}
                  <td className="px-4 py-3">
                    <StatusPill
                      label={client.workflowStatus}
                      styles={WORKFLOW_STATUS_STYLES[client.workflowStatus] ?? { text: "#64748b", border: "#e2e8f0" }}
                      size="xs"
                    />
                  </td>

                  {/* Billing Status */}
                  <td className="px-4 py-3">
                    <StatusPill
                      label={client.billingStatus}
                      styles={BILLING_STATUS_STYLES[client.billingStatus] ?? { text: "#64748b", border: "#e2e8f0" }}
                      size="xs"
                    />
                  </td>

                  {/* Activation Status */}
                  <td className="px-4 py-3">
                    <StatusPill
                      label={client.activationStatus}
                      styles={ACTIVATION_STATUS_STYLES[client.activationStatus] ?? { text: "#64748b", border: "#e2e8f0" }}
                      size="xs"
                    />
                  </td>

                  {/* Active Services */}
                  <td className="px-4 py-3">
                    {client.activeServices.length === 0 ? (
                      <span className="text-xs text-slate-400">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {client.activeServices.slice(0, 2).map((s) => (
                          <span
                            key={s}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                            {s}
                          </span>
                        ))}
                        {client.activeServices.length > 2 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 font-medium">
                            +{client.activeServices.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Monthly Value */}
                  <td className="px-4 py-3">
                    <span className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {client.monthlyValue > 0 ? `$${client.monthlyValue.toLocaleString()}` : "—"}
                    </span>
                  </td>

                  {/* Renewal Date */}
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">{client.renewalDate}</span>
                  </td>

                  {/* Client Health */}
                  <td className="px-4 py-3">
                    <StatusPill
                      label={client.clientHealth}
                      styles={HEALTH_STATUS_STYLES[client.clientHealth] ?? { text: "#64748b", border: "#e2e8f0" }}
                      size="xs"
                    />
                  </td>

                  {/* Priority */}
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap"
                      style={{
                        background:  PRIORITY_STYLES[client.priority]?.bg,
                        color:       PRIORITY_STYLES[client.priority]?.text ?? "#64748b",
                        borderColor: PRIORITY_STYLES[client.priority]?.border ?? "#e2e8f0",
                      }}
                    >
                      {client.priority}
                    </span>
                  </td>

                  {/* Last Activity */}
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-500 whitespace-nowrap">{client.lastActivity}</span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <RowActions client={client} onViewClient={() => setActiveDrawer(client)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {filtered.length} client{filtered.length !== 1 ? "s" : ""} shown
          </span>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>
              Total MRR:{" "}
              <span className="font-bold text-slate-700 dark:text-slate-300">
                ${filtered.reduce((s, c) => s + c.monthlyValue, 0).toLocaleString()}
              </span>
            </span>
            <span>
              Active:{" "}
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {filtered.filter((c) => c.currentStatus === "Active").length}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Client profile drawer */}
      {activeDrawer && (
        <ClientDrawer client={activeDrawer} onClose={() => setActiveDrawer(null)} />
      )}

      {/* Add client modal */}
      {showAddModal && (
        <AddClientModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAdd}
        />
      )}
    </div>
  );
}
