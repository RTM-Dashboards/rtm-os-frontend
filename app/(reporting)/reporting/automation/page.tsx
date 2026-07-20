"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/ui";
import {
  useReportAutomationRules,
  ruleStatusVariant,
  type AutomationRule,
  type AutomationRuleFormData,
  type AutomationRuleStatus,
  type AutomationRuleCategory,
} from "@/lib/reporting/useReportAutomationRules";
import { useDateRangeFilter } from "@/lib/reporting/useDateRangeFilter";
import { DateRangeFilter } from "@/components/reporting/DateRangeFilter";

// ── Default empty form ────────────────────────────────────────────────────────

const emptyForm: AutomationRuleFormData = {
  name: "",
  category: "Workflow",
  reportType: "All",
  trigger: "",
  action: "",
  schedule: "",
  recipients: [],
  clients: [],
  status: "Draft",
  template: "N/A",
  notes: "",
};

// ── KPI summary card ──────────────────────────────────────────────────────────

function KpiCard({ label, value, color, bg }: { label: string; value: string | number; color: string; bg: string }) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-2" style={{ background: bg, border: `1px solid ${color}30` }}>
      <div className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>{label}</div>
      <div className="text-3xl font-black" style={{ color }}>{value}</div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ReportAutomationPage() {
  const {
    rules,
    loading,
    createRule,
    updateRule,
    toggleStatus,
    deleteRule,
    runNow,
  } = useReportAutomationRules();

  // ── Filter/search state ─────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AutomationRuleStatus | "All">("All");
  const [categoryFilter, setCategoryFilter] = useState<AutomationRuleCategory | "All">("All");

  // Date-range filter (filters by createdAt on automation rule records)
  const dateFilter = useDateRangeFilter();

  // ── Modal state ─────────────────────────────────────────────────────────────
  type Modal =
    | { mode: "none" }
    | { mode: "create" }
    | { mode: "edit"; rule: AutomationRule }
    | { mode: "delete"; rule: AutomationRule }
    | { mode: "runConfirm"; rule: AutomationRule };

  const [modal, setModal] = useState<Modal>({ mode: "none" });
  const [form, setForm] = useState<AutomationRuleFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [runMessage, setRunMessage] = useState<string | null>(null);

  // ── Filter derived data ─────────────────────────────────────────────────────
  const filtered = rules.filter((r) => {
    if (statusFilter !== "All" && r.status !== statusFilter) return false;
    if (categoryFilter !== "All" && r.category !== categoryFilter) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (!dateFilter.filterByDate(r.createdAt)) return false;
    return true;
  });

  const kpis = {
    total: rules.length,
    active: rules.filter((r) => r.status === "Active").length,
    paused: rules.filter((r) => r.status === "Paused").length,
    errors: rules.filter((r) => r.status === "Error").length,
    workflow: rules.filter((r) => r.category === "Workflow").length,
    scheduled: rules.filter((r) => r.category === "Scheduled").length,
  };

  // ── Open/close helpers ──────────────────────────────────────────────────────
  function openCreate() {
    setForm(emptyForm);
    setModal({ mode: "create" });
  }
  function openEdit(rule: AutomationRule) {
    setForm({
      name: rule.name,
      category: rule.category,
      reportType: rule.reportType,
      trigger: rule.trigger,
      action: rule.action,
      schedule: rule.schedule,
      recipients: [...rule.recipients],
      clients: [...rule.clients],
      status: rule.status,
      template: rule.template,
      notes: rule.notes,
    });
    setModal({ mode: "edit", rule });
  }
  function closeModal() {
    setModal({ mode: "none" });
    setForm(emptyForm);
  }

  // ── Save (create / edit) ────────────────────────────────────────────────────
  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (modal.mode === "create") {
        await createRule(form);
      } else if (modal.mode === "edit") {
        await updateRule(modal.rule.ruleId, form);
      }
      closeModal();
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  async function handleDelete(rule: AutomationRule) {
    await deleteRule(rule.ruleId);
    setModal({ mode: "none" });
  }

  // ── Run Now ─────────────────────────────────────────────────────────────────
  async function handleRunNow(rule: AutomationRule) {
    setModal({ mode: "none" });
    const msg = await runNow(rule.ruleId);
    setRunMessage(msg);
    setTimeout(() => setRunMessage(null), 6000);
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--rtm-bg)" }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="px-6 pt-6 pb-4" style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <a
                  href="/reporting"
                  className="text-xs font-semibold"
                  style={{ color: "var(--rtm-blue)", textDecoration: "none" }}
                >
                  ← Reporting Dashboard
                </a>
              </div>
              <h1 className="text-2xl font-black" style={{ color: "var(--rtm-text-primary)" }}>Report Automation Rules</h1>
              <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
                Configure automation rules that define workflow triggers and scheduled report generation.
              </p>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white shadow-sm"
              style={{ background: "var(--rtm-blue)" }}
            >
              + New Rule
            </button>
          </div>

          {/* ── Honest deferral notice ──────────────────────────────────────── */}
          <div
            className="flex items-start gap-3 rounded-xl border px-4 py-3"
            style={{ background: "#FFFBEB", borderColor: "#D9770640" }}
          >
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#D97706" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <div>
              <span className="text-xs font-bold" style={{ color: "#92400E" }}>Rule Definitions Only — Automatic Event-Driven Execution Not Yet Implemented</span>
              <p className="text-xs mt-0.5" style={{ color: "#92400E" }}>
                Rules configured here are real and persisted. However, <strong>automatic triggering</strong> — rules
                firing on their own when a real event occurs — is <strong>not yet implemented</strong>. That requires
                an event-bus or background execution engine (planned for a future phase). &ldquo;Run Now&rdquo; is a
                manual test action: it records a run timestamp and is user-initiated, not automatic.
                Scheduled report rules must still be manually generated for now, same as Scheduled Reporting.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="flex-1 px-6 py-5 max-w-[1400px] mx-auto w-full space-y-5">

        {/* Run-now feedback banner */}
        {runMessage && (
          <div
            className="flex items-center gap-3 rounded-xl border px-4 py-3"
            style={{ background: "#ECFDF5", borderColor: "#05966940" }}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#059669" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-semibold" style={{ color: "#065F46" }}>Run Recorded — {runMessage}</span>
            <button onClick={() => setRunMessage(null)} className="ml-auto text-xs" style={{ color: "#065F46" }}>×</button>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          <KpiCard label="Total Rules"   value={kpis.total}     color="var(--rtm-text-primary)" bg="var(--rtm-surface)" />
          <KpiCard label="Active"        value={kpis.active}    color="#059669" bg="#ECFDF5" />
          <KpiCard label="Paused"        value={kpis.paused}    color="#D97706" bg="#FFFBEB" />
          <KpiCard label="Errors"        value={kpis.errors}    color="#DC2626" bg="#FEF2F2" />
          <KpiCard label="Workflow Rules"   value={kpis.workflow}  color="#7C3AED" bg="#F5F3FF" />
          <KpiCard label="Scheduled Rules"  value={kpis.scheduled} color="#2563EB" bg="#EFF6FF" />
        </div>

        {/* Date range filter — applies to automation rules by createdAt */}
        <DateRangeFilter
          dateRange={dateFilter.dateRange}
          setDateRange={dateFilter.setDateRange}
          customStart={dateFilter.customStart}
          setCustomStart={dateFilter.setCustomStart}
          customEnd={dateFilter.customEnd}
          setCustomEnd={dateFilter.setCustomEnd}
          resultCount={loading ? undefined : filtered.length}
          totalCount={loading ? undefined : rules.length}
        />

        {/* Search / Status / Category filters */}
        <div
          className="flex flex-wrap gap-3 items-center p-4 rounded-xl"
          style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
        >
          <div className="flex-1 min-w-[200px] relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--rtm-text-muted)" }}>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search rules…"
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm border outline-none"
              style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold" style={{ color: "var(--rtm-text-secondary)" }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AutomationRuleStatus | "All")}
              className="rounded-lg px-2 py-1.5 text-xs border outline-none"
              style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}
            >
              {(["All", "Active", "Paused", "Draft", "Error"] as (AutomationRuleStatus | "All")[]).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold" style={{ color: "var(--rtm-text-secondary)" }}>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as AutomationRuleCategory | "All")}
              className="rounded-lg px-2 py-1.5 text-xs border outline-none"
              style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}
            >
              {(["All", "Workflow", "Scheduled"] as (AutomationRuleCategory | "All")[]).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <span className="text-xs font-semibold ml-auto" style={{ color: "var(--rtm-text-muted)" }}>
            {filtered.length} of {rules.length} rules
          </span>
        </div>

        {/* Table */}
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
          {loading ? (
            <div className="py-16 text-center text-sm" style={{ color: "var(--rtm-text-muted)" }}>Loading rules…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[1100px]">
                <thead>
                  <tr style={{ background: "var(--rtm-bg)", borderBottom: "2px solid var(--rtm-border)" }}>
                    {["Rule Name", "Category", "Trigger", "Action / Schedule", "Status", "Last Run", "Runs", "Failures", "Actions"].map((col) => (
                      <th
                        key={col}
                        className="px-3 py-3 text-left text-[11px] font-black uppercase tracking-wider"
                        style={{ color: "var(--rtm-text-secondary)" }}
                      >{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((rule, i) => (
                    <tr
                      key={rule.ruleId}
                      className="hover:bg-blue-50/30 transition-colors"
                      style={{
                        borderBottom: i < filtered.length - 1 ? "1px solid var(--rtm-border-light)" : "none",
                        opacity: rule.status === "Paused" ? 0.7 : 1,
                      }}
                    >
                      {/* Rule Name */}
                      <td className="px-3 py-3 max-w-[220px]">
                        <div className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{rule.name}</div>
                        {rule.notes && (
                          <div className="text-[11px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{rule.notes}</div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            background: rule.category === "Workflow" ? "#F5F3FF" : "#EFF6FF",
                            color: rule.category === "Workflow" ? "#7C3AED" : "#1D4ED8",
                          }}
                        >
                          {rule.category}
                        </span>
                      </td>

                      {/* Trigger */}
                      <td className="px-3 py-3 text-xs max-w-[180px]" style={{ color: "var(--rtm-text-secondary)" }}>
                        {rule.trigger}
                      </td>

                      {/* Action / Schedule */}
                      <td className="px-3 py-3 max-w-[220px]">
                        <div className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{rule.action}</div>
                        {rule.schedule && (
                          <div className="text-[11px] font-semibold mt-0.5" style={{ color: "#0891B2" }}>
                            🕐 {rule.schedule}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <StatusBadge variant={ruleStatusVariant[rule.status] ?? "neutral"} label={rule.status} size="sm" />
                      </td>

                      {/* Last Run */}
                      <td className="px-3 py-3 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                        {rule.lastRun || "—"}
                      </td>

                      {/* Runs */}
                      <td className="px-3 py-3 text-center">
                        <span className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>{rule.runsTotal}</span>
                      </td>

                      {/* Failures */}
                      <td className="px-3 py-3 text-center">
                        <span className="text-sm font-bold" style={{ color: rule.runsFailed > 0 ? "#DC2626" : "#059669" }}>
                          {rule.runsFailed}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex gap-1.5 flex-wrap">
                          <button
                            onClick={() => openEdit(rule)}
                            className="px-2 py-1 rounded text-[11px] font-semibold border transition-all hover:opacity-90"
                            style={{ color: "var(--rtm-blue)", background: "var(--rtm-blue-light)", borderColor: "var(--rtm-blue)40" }}
                          >Edit</button>

                          <button
                            onClick={() => void toggleStatus(rule.ruleId)}
                            className="px-2 py-1 rounded text-[11px] font-semibold border transition-all hover:opacity-90"
                            style={{
                              color: rule.status === "Active" ? "#D97706" : "#059669",
                              background: rule.status === "Active" ? "#D9770615" : "#05966915",
                              borderColor: rule.status === "Active" ? "#D9770640" : "#05966940",
                            }}
                          >
                            {rule.status === "Active" ? "Pause" : "Resume"}
                          </button>

                          <button
                            onClick={() => setModal({ mode: "runConfirm", rule })}
                            className="px-2 py-1 rounded text-[11px] font-semibold border transition-all hover:opacity-90"
                            style={{ color: "#0891B2", background: "#0891B215", borderColor: "#0891B240" }}
                            title="Run Now — records a manual test run (not real automatic execution)"
                          >Run Now</button>

                          <button
                            onClick={() => setModal({ mode: "delete", rule })}
                            className="px-2 py-1 rounded text-[11px] font-semibold border transition-all hover:opacity-90"
                            style={{ color: "#DC2626", background: "#DC262615", borderColor: "#DC262640" }}
                          >Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && !loading && (
                <div className="text-center py-16" style={{ color: "var(--rtm-text-muted)" }}>
                  <p className="text-sm font-medium">No rules match your filters.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Create / Edit Modal ─────────────────────────────────────────────── */}
      {(modal.mode === "create" || modal.mode === "edit") && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div
            className="rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-6 space-y-4 overflow-y-auto max-h-[90vh]"
            style={{ background: "var(--rtm-bg-secondary)", border: "1px solid var(--rtm-border-light)" }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                {modal.mode === "create" ? "Create Automation Rule" : "Edit Automation Rule"}
              </h2>
              <button onClick={closeModal} className="text-xl leading-none" style={{ color: "var(--rtm-text-muted)" }}>×</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Name */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Rule Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly SEO Report — All Clients"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg-secondary)" }}
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as AutomationRuleCategory }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg-secondary)" }}
                >
                  <option value="Workflow">Workflow — event-driven trigger</option>
                  <option value="Scheduled">Scheduled — timed report generation</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as AutomationRuleStatus }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg-secondary)" }}
                >
                  {(["Draft", "Active", "Paused", "Error"] as AutomationRuleStatus[]).map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Report Type */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Report Type</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly SEO, QBR, All"
                  value={form.reportType}
                  onChange={(e) => setForm((f) => ({ ...f, reportType: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg-secondary)" }}
                />
              </div>

              {/* Template */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Template</label>
                <input
                  type="text"
                  placeholder="e.g. RTM Monthly SEO Template v3"
                  value={form.template}
                  onChange={(e) => setForm((f) => ({ ...f, template: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg-secondary)" }}
                />
              </div>

              {/* Trigger */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Trigger *</label>
                <input
                  type="text"
                  placeholder="e.g. QA status set to Approved / 1st of every month at 8:00 AM"
                  value={form.trigger}
                  onChange={(e) => setForm((f) => ({ ...f, trigger: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg-secondary)" }}
                />
              </div>

              {/* Action */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Action *</label>
                <input
                  type="text"
                  placeholder="e.g. Send AM notification — report ready for review"
                  value={form.action}
                  onChange={(e) => setForm((f) => ({ ...f, action: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg-secondary)" }}
                />
              </div>

              {/* Schedule (only for Scheduled category) */}
              {form.category === "Scheduled" && (
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Schedule</label>
                  <input
                    type="text"
                    placeholder="e.g. 1st of every month at 8:00 AM"
                    value={form.schedule}
                    onChange={(e) => setForm((f) => ({ ...f, schedule: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg-secondary)" }}
                  />
                </div>
              )}

              {/* Recipients */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Recipients (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Account Manager, Client"
                  value={form.recipients.join(", ")}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      recipients: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg-secondary)" }}
                />
              </div>

              {/* Clients */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Clients (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. All SEO clients"
                  value={form.clients.join(", ")}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      clients: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg-secondary)" }}
                />
              </div>

              {/* Notes */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Notes (optional)</label>
                <input
                  type="text"
                  placeholder="Any notes about this rule…"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)", background: "var(--rtm-bg-secondary)" }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={closeModal}
                className="text-xs font-semibold px-4 py-2 rounded-lg border"
                style={{ color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border-light)", background: "transparent" }}
              >Cancel</button>
              <button
                onClick={() => void handleSave()}
                disabled={saving || !form.name.trim()}
                className="text-xs font-semibold px-4 py-2 rounded-lg border transition-all hover:opacity-90 disabled:opacity-50"
                style={{ color: "#059669", background: "#05966915", borderColor: "#05966940" }}
              >
                {saving ? "Saving…" : modal.mode === "create" ? "Create Rule" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ───────────────────────────────────────── */}
      {modal.mode === "delete" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setModal({ mode: "none" }); }}
        >
          <div
            className="rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4"
            style={{ background: "var(--rtm-bg-secondary)", border: "1px solid var(--rtm-border-light)" }}
          >
            <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>Delete Rule?</h2>
            <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
              &ldquo;{modal.rule.name}&rdquo; will be permanently deleted.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModal({ mode: "none" })}
                className="text-xs font-semibold px-4 py-2 rounded-lg border"
                style={{ color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border-light)", background: "transparent" }}
              >Cancel</button>
              <button
                onClick={() => void handleDelete(modal.rule)}
                className="text-xs font-semibold px-4 py-2 rounded-lg border transition-all hover:opacity-90"
                style={{ color: "#DC2626", background: "#DC262615", borderColor: "#DC262640" }}
              >Delete Rule</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Run Now Confirmation Modal ──────────────────────────────────────── */}
      {modal.mode === "runConfirm" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setModal({ mode: "none" }); }}
        >
          <div
            className="rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4"
            style={{ background: "var(--rtm-bg-secondary)", border: "1px solid var(--rtm-border-light)" }}
          >
            <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>Run Now — Manual Test</h2>
            <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
              This records a manual test run for &ldquo;<strong>{modal.rule.name}</strong>&rdquo; — it updates the Last Run timestamp and increments the run counter. This is <strong>not</strong> real automatic execution; automatic event-driven triggering is not yet implemented.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModal({ mode: "none" })}
                className="text-xs font-semibold px-4 py-2 rounded-lg border"
                style={{ color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border-light)", background: "transparent" }}
              >Cancel</button>
              <button
                onClick={() => void handleRunNow(modal.rule)}
                className="text-xs font-semibold px-4 py-2 rounded-lg border transition-all hover:opacity-90"
                style={{ color: "#0891B2", background: "#0891B215", borderColor: "#0891B240" }}
              >Record Test Run</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
