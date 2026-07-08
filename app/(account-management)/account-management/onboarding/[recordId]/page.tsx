"use client";

/**
 * AM Onboarding — Per-record detail page
 *
 * Route: /account-management/onboarding/[recordId]
 *
 * Gives AMs a real, bookmarkable URL for each onboarding record.
 * Renders the same OnboardingDetail view as the client-state-driven
 * version on the Queue page, but loaded directly by recordId from the
 * URL param so it survives refresh, bookmark, and direct navigation.
 *
 * Known limitation: the data store is module-level in-memory mock state.
 * Records created in the same browser session are available here, but a
 * hard reload of this URL will only find seed records (onb-seed-*). This
 * is consistent with all other mock-data patterns in this app and is noted
 * as an interim limitation pending a real persistence layer.
 */

import React, { useState, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getOnboardingRecordById,
  setFieldAssignment,
  saveFieldValue,
  markFieldPendingClient,
  setFieldAmFilling,
  getOnboardingStatusMeta,
  getFieldStatusMeta,
  getPendingClientFields,
  getFieldAssignmentSummary,
} from "@/lib/mock/am-onboarding-store";
import type {
  AMOnboardingRecord,
  OnboardingIntakeStatus,
  FieldStatus,
} from "@/lib/mock/am-onboarding-store";
import {
  ONBOARDING_FIELD_SCHEMA,
  ONBOARDING_SECTIONS,
  getFieldsBySection,
} from "@/lib/mock/am-onboarding-field-schema";
import type { AMOnboardingFieldDef } from "@/lib/mock/am-onboarding-field-schema";
import { getAllProjects, getProjectByClientId } from "@/lib/mock/am-projects-store";
import { MASTER_CLIENTS, markKickoffComplete } from "@/lib/mock/master-clients";

// ─── Formatting helpers ────────────────────────────────────────────────────────

function fmt(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso.length === 10 ? iso + "T00:00:00" : iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Badge helpers ─────────────────────────────────────────────────────────────

function OnboardingStatusBadge({ status }: { status: OnboardingIntakeStatus }) {
  const meta = getOnboardingStatusMeta(status);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border whitespace-nowrap"
      style={{ background: meta.bg, color: meta.color, borderColor: meta.border }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: meta.dot }} />
      {status}
    </span>
  );
}

function FieldStatusChip({ status }: { status: FieldStatus }) {
  const meta = getFieldStatusMeta(status);
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border whitespace-nowrap"
      style={{ background: meta.bg, color: meta.color, borderColor: meta.border }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: meta.dot }} />
      {meta.label}
    </span>
  );
}

// ─── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

// ─── Section header ────────────────────────────────────────────────────────────

function SectionHeader({
  title,
  description,
  badge,
  badgeVariant,
  filledCount,
  totalCount,
}: {
  title: string;
  description?: string;
  badge?: string;
  badgeVariant?: "blue" | "amber" | "green" | "default";
  filledCount?: number;
  totalCount?: number;
}) {
  const badgeStyle =
    badgeVariant === "blue"
      ? { background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" }
      : badgeVariant === "amber"
      ? { background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" }
      : badgeVariant === "green"
      ? { background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" }
      : { background: "#F8FAFC", color: "#64748B", borderColor: "#E2E8F0" };
  return (
    <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
      <div>
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {filledCount !== undefined && totalCount !== undefined && (
          <span className="text-[11px] text-slate-400 font-medium">{filledCount}/{totalCount}</span>
        )}
        {badge && (
          <span
            className="text-[11px] font-semibold rounded-full px-2.5 py-0.5 border"
            style={badgeStyle}
          >
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Pending fields summary ────────────────────────────────────────────────────

function PendingFieldsSummary({ record }: { record: AMOnboardingRecord }) {
  const pending = getPendingClientFields(record);
  if (pending.length === 0) return null;
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-amber-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-amber-800">Awaiting Client Input</h3>
          <p className="text-xs text-amber-600 mt-0.5">
            {pending.length} field{pending.length !== 1 ? "s" : ""} assigned to the client.
            Use &quot;Copy Client Link&quot; below to share the fillable form with the client.
          </p>
        </div>
        <span
          className="text-[11px] font-semibold rounded-full px-2.5 py-0.5 border"
          style={{ background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" }}
        >
          {pending.length} pending
        </span>
      </div>
      <div className="px-5 py-3 space-y-2">
        {pending.map((a) => {
          const fieldDef = ONBOARDING_FIELD_SCHEMA.find((f) => f.id === a.fieldId);
          return (
            <div
              key={a.fieldId}
              className="flex items-center gap-2.5 rounded-lg border border-amber-100 bg-white px-3 py-2"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">
                  {fieldDef?.label ?? a.fieldId}
                </p>
                {fieldDef?.description && (
                  <p className="text-[11px] text-slate-400 truncate">{fieldDef.description}</p>
                )}
              </div>
              {a.sentToClientAt && (
                <span className="text-[10px] text-amber-600 whitespace-nowrap shrink-0">
                  Since {fmt(a.sentToClientAt)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Sales prefill reference ───────────────────────────────────────────────────

function SalesPrefillPanel({ record }: { record: AMOnboardingRecord }) {
  const [expanded, setExpanded] = useState(false);
  const sp = record.salesPrefill;
  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-5 py-3.5 flex items-center justify-between text-left"
      >
        <div>
          <h3 className="text-sm font-bold text-blue-800">Sales Prefill Reference (Read-only)</h3>
          <p className="text-xs text-blue-500 mt-0.5">
            Data from MASTER_CLIENTS / Sales intake — owned by Sales &amp; Billing.
          </p>
        </div>
        <span className="text-xs font-semibold text-blue-600 ml-4 shrink-0">
          {expanded ? "Hide ▲" : "Show ▼"}
        </span>
      </button>
      {expanded && (
        <div className="px-5 pb-4 border-t border-blue-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 mt-3">
            {[
              ["Client Name", sp.clientName],
              ["Email", sp.email],
              ["Industry", sp.industry],
              ["Sales Owner", sp.salesOwner],
              ["Referral Source", sp.referralSource],
              ["Affiliate", sp.affiliateName],
              ["MRR", sp.monthlyValue > 0 ? `$${sp.monthlyValue.toLocaleString()}/mo` : ""],
              ["Primary Contact", sp.primaryContact],
              ["Phone", sp.phone],
              ["Website", sp.website],
              ["Location", sp.location],
              ["Business Size", sp.businessSize],
            ]
              .filter(([, v]) => !!v)
              .map(([label, value]) => (
                <div key={label as string}>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-400 mb-0.5">{label}</p>
                  <p className="text-sm text-blue-800">{value}</p>
                </div>
              ))}
          </div>
          {sp.activeServices.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-400 mb-1">Contracted Services</p>
              <div className="flex flex-wrap gap-1.5">
                {sp.activeServices.map((s) => (
                  <span key={s} className="inline-block rounded-md border border-blue-200 bg-white px-2.5 py-0.5 text-xs font-medium text-blue-700">{s}</span>
                ))}
              </div>
            </div>
          )}
          {sp.selectedGoals && sp.selectedGoals.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-400 mb-1">Goals (from Sales)</p>
              <div className="flex flex-wrap gap-1.5">
                {sp.selectedGoals.map((g) => (
                  <span key={g} className="inline-block rounded-md border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">{g}</span>
                ))}
              </div>
            </div>
          )}
          {sp.discoveryNotes && (
            <div className="mt-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-400 mb-1">Discovery Notes</p>
              <p className="text-sm text-blue-800 bg-white rounded-lg border border-blue-100 px-3 py-2">{sp.discoveryNotes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Field input ───────────────────────────────────────────────────────────────

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: AMOnboardingFieldDef;
  value: string;
  onChange: (v: string) => void;
}) {
  const baseInputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder:text-slate-400";

  if (field.type === "textarea") {
    return <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} className={baseInputClass} />;
  }
  if (field.type === "select" && field.options) {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} className={baseInputClass}>
        <option value="">— Select —</option>
        {field.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    );
  }
  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input type="checkbox" checked={value === "true"} onChange={(e) => onChange(e.target.checked ? "true" : "false")} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-200" />
        <span className="text-sm text-slate-700">{field.label}</span>
      </label>
    );
  }
  if (field.type === "date") {
    return <input type="date" value={value} onChange={(e) => onChange(e.target.value)} className={baseInputClass} />;
  }
  if (field.type === "number") {
    return <input type="number" value={value} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} className={baseInputClass} />;
  }
  return (
    <input
      type={field.type === "phone" ? "tel" : field.type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      className={baseInputClass}
    />
  );
}

// ─── Collaborative field row ───────────────────────────────────────────────────

function CollaborativeFieldRow({
  record,
  field,
  onChanged,
}: {
  record: AMOnboardingRecord;
  field: AMOnboardingFieldDef;
  onChanged: () => void;
}) {
  const assignment = record.fieldAssignments[field.id];
  const status: FieldStatus = assignment?.status ?? "unset";
  const storedValue = assignment?.value ?? "";

  const [draft, setDraft] = useState(storedValue);
  const [isEditing, setIsEditing] = useState(status === "am-filling");
  const [prevStored, setPrevStored] = useState(storedValue);
  if (storedValue !== prevStored) {
    setPrevStored(storedValue);
    setDraft(storedValue);
  }

  function startFilling() {
    setDraft(storedValue);
    setIsEditing(true);
    setFieldAmFilling(record.id, field.id);
    onChanged();
  }
  function handleSave() {
    saveFieldValue(record.id, field.id, draft);
    setIsEditing(false);
    onChanged();
  }
  function handleCancelEdit() {
    setDraft(storedValue);
    setIsEditing(false);
    if (!storedValue) {
      setFieldAssignment(record.id, field.id, { status: "unset" });
      onChanged();
    }
  }
  function handleSendToClient() {
    setIsEditing(false);
    markFieldPendingClient(record.id, field.id);
    onChanged();
  }
  function handleAmFillInstead() {
    startFilling();
  }

  if (status === "pending-client") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <p className="text-sm font-semibold text-slate-700">{field.label}</p>
              <FieldStatusChip status="pending-client" />
              {field.required && (
                <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wide">Required</span>
              )}
            </div>
            {field.description && <p className="text-xs text-slate-500 mt-0.5">{field.description}</p>}
            {assignment?.sentToClientAt && (
              <p className="text-[11px] text-amber-600 mt-1">Marked for client since {fmt(assignment.sentToClientAt)}</p>
            )}
          </div>
          <button
            onClick={handleAmFillInstead}
            className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            AM will fill instead
          </button>
        </div>
      </div>
    );
  }

  if (status === "client-responded") {
    return (
      <div className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <p className="text-sm font-semibold text-slate-700">{field.label}</p>
              <FieldStatusChip status="client-responded" />
            </div>
            {storedValue ? (
              <p className="text-sm text-slate-800 mt-1 whitespace-pre-wrap">{storedValue}</p>
            ) : (
              <p className="text-sm italic text-slate-400 mt-1">Client responded — no value recorded</p>
            )}
            {assignment?.clientRespondedAt && (
              <p className="text-[11px] text-cyan-600 mt-1">Received {fmt(assignment.clientRespondedAt)}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isEditing || status === "am-filling") {
    return (
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <p className="text-sm font-semibold text-slate-700">{field.label}</p>
          {field.required && (
            <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wide">Required</span>
          )}
        </div>
        {field.description && <p className="text-xs text-slate-500 mb-2">{field.description}</p>}
        <FieldInput field={field} value={draft} onChange={setDraft} />
        <div className="mt-2.5 flex items-center gap-2 flex-wrap">
          <button onClick={handleSave} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">Save</button>
          <button onClick={handleCancelEdit} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={handleSendToClient} className="ml-auto rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors">→ Send to Client instead</button>
        </div>
      </div>
    );
  }

  if (status === "am-filled") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <p className="text-sm font-semibold text-slate-700">{field.label}</p>
              <FieldStatusChip status="am-filled" />
              {field.required && (
                <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wide">Required</span>
              )}
            </div>
            {storedValue ? (
              <p className="text-sm text-slate-800 mt-0.5 whitespace-pre-wrap">{storedValue}</p>
            ) : (
              <p className="text-sm italic text-slate-400 mt-0.5">—</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={startFilling} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Edit</button>
            <button onClick={handleSendToClient} className="rounded-lg border border-amber-200 bg-white px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-50 transition-colors">→ Client</button>
          </div>
        </div>
      </div>
    );
  }

  // Unset
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <p className="text-sm font-semibold text-slate-700">{field.label}</p>
            {field.required && (
              <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wide">Required</span>
            )}
          </div>
          {field.description && <p className="text-xs text-slate-400 mt-0.5">{field.description}</p>}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={startFilling} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors">Fill it in</button>
          <button onClick={handleSendToClient} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors">Send to Client</button>
        </div>
      </div>
    </div>
  );
}

// ─── Kickoff Call widget ───────────────────────────────────────────────────────

function KickoffCallWidget({
  record,
  onRefresh,
}: {
  record: AMOnboardingRecord;
  onRefresh: () => void;
}) {
  const client = MASTER_CLIENTS.find((c) => c.id === record.clientId);
  const [kickoffDate, setKickoffDate] = useState(
    record.fieldAssignments["kickoffCallDate"]?.value ?? ""
  );
  const [completing, setCompleting] = useState(false);

  if (!client) return null;

  const kickoffNeeded = client.activationChecklist.kickoffNeeded;
  const kickoffCompleted = client.activationChecklist.kickoffCallCompleted;
  const storedDate = record.fieldAssignments["kickoffCallDate"]?.value ?? "";

  if (!kickoffNeeded) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <SectionHeader title="Kickoff Call" badge="Not Required" badgeVariant="default" />
        <div className="px-5 py-4">
          <p className="text-sm text-slate-400 italic">No kickoff call required for this client.</p>
        </div>
      </div>
    );
  }

  function handleMarkComplete() {
    setCompleting(true);
    if (kickoffDate) {
      saveFieldValue(record.id, "kickoffCallDate", kickoffDate);
    }
    markKickoffComplete(record.clientId, kickoffDate || undefined);
    setTimeout(() => {
      setCompleting(false);
      onRefresh();
    }, 200);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <SectionHeader
        title="Kickoff Call"
        description="Required — schedule and complete the kickoff call with the client."
        badge={kickoffCompleted ? "Completed" : "Pending"}
        badgeVariant={kickoffCompleted ? "green" : "amber"}
      />
      <div className="px-5 py-4">
        {kickoffCompleted ? (
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 flex items-center gap-3">
            <span className="text-emerald-500 text-lg">✓</span>
            <div>
              <p className="text-sm font-semibold text-emerald-800">Kickoff call completed</p>
              {storedDate && <p className="text-xs text-emerald-600 mt-0.5">Date: {fmt(storedDate)}</p>}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Record the kickoff call date and mark it complete once the call has been held.
            </p>
            <div className="flex items-end gap-3 flex-wrap">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Kickoff Call Date</label>
                <input
                  type="date"
                  value={kickoffDate}
                  onChange={(e) => setKickoffDate(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <button
                onClick={handleMarkComplete}
                disabled={completing}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {completing ? "Saving…" : "Mark Kickoff Complete"}
              </button>
            </div>
            {storedDate && (
              <p className="text-xs text-slate-400">Previously scheduled: {fmt(storedDate)}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Copy Client Link button ───────────────────────────────────────────────────

function CopyClientLinkButton({ recordId }: { recordId: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const url = `${window.location.origin}/client-onboarding/${recordId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
        copied
          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
          : "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100"
      }`}
    >
      {copied ? "✓ Link copied!" : "🔗 Copy Client Link"}
    </button>
  );
}

// ─── Main detail view ──────────────────────────────────────────────────────────

function OnboardingDetailView({ recordId }: { recordId: string }) {
  const router = useRouter();
  const [, forceUpdate] = useState(0);
  const refresh = useCallback(() => forceUpdate((n) => n + 1), []);

  const [sectionFilter, setSectionFilter] = useState<
    AMOnboardingFieldDef["section"] | "all" | "pending-client" | "unset"
  >("all");

  const freshRecord = getOnboardingRecordById(recordId);

  if (!freshRecord) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm px-6 py-16 text-center">
        <div className="text-slate-300 text-5xl mb-4">🔍</div>
        <h2 className="text-lg font-bold text-slate-700 mb-1">Record not found</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-4">
          Onboarding record <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">{recordId}</span> could not be found.
          This can happen after a page reload if the record was created in a previous session (in-memory mock data only).
        </p>
        <button
          onClick={() => router.push("/account-management/onboarding")}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          ← Back to Onboarding Queue
        </button>
      </div>
    );
  }

  const summary = getFieldAssignmentSummary(freshRecord);
  const freshProject = freshRecord.projectId
    ? getAllProjects().find((p) => p.id === freshRecord.projectId)
    : getProjectByClientId(freshRecord.clientId);

  function getFieldsToShow(): AMOnboardingFieldDef[] {
    if (sectionFilter === "pending-client") {
      return ONBOARDING_FIELD_SCHEMA.filter(
        (f) => (freshRecord!.fieldAssignments[f.id]?.status ?? "unset") === "pending-client"
      );
    }
    if (sectionFilter === "unset") {
      return ONBOARDING_FIELD_SCHEMA.filter(
        (f) => (freshRecord!.fieldAssignments[f.id]?.status ?? "unset") === "unset"
      );
    }
    if (sectionFilter !== "all") {
      return ONBOARDING_FIELD_SCHEMA.filter((f) => f.section === sectionFilter);
    }
    return ONBOARDING_FIELD_SCHEMA;
  }

  const fieldsToShow = getFieldsToShow();
  const grouped =
    sectionFilter === "pending-client" || sectionFilter === "unset"
      ? null
      : ONBOARDING_SECTIONS.filter((sec) =>
          (sectionFilter === "all" || sec.id === sectionFilter) &&
          fieldsToShow.some((f) => f.section === sec.id)
        );

  return (
    <div className="space-y-5">
      {/* Breadcrumb / back */}
      <button
        onClick={() => router.push("/account-management/onboarding")}
        className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        ← Back to Onboarding Queue
      </button>

      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Account Management — Onboarding Queue
          </p>
          <h1 className="text-2xl font-bold text-slate-900">
            {freshRecord.salesPrefill.clientName}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Created: {fmt(freshRecord.createdAt)} · Record ID:{" "}
            <span className="font-mono text-xs text-slate-400">{freshRecord.id}</span>
          </p>
          {freshProject && (
            <div className="mt-1.5">
              <Link
                href={`/account-management/projects?project=${freshProject.id}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
              >
                View Project →
              </Link>
              <span className="ml-2 text-xs text-emerald-700 font-medium">{freshProject.name}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <CopyClientLinkButton recordId={freshRecord.id} />
          <OnboardingStatusBadge status={freshRecord.status} />
        </div>
      </div>

      {/* Progress summary */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-slate-700">Form Progress</p>
          <span className="text-xs text-slate-500">
            {summary.amFilled + summary.clientResponded} of {summary.totalFields} fields resolved
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          {[
            { label: "AM Filled", count: summary.amFilled, color: "#10B981" },
            { label: "Awaiting Client", count: summary.pendingClient, color: "#F59E0B" },
            { label: "Client Responded", count: summary.clientResponded, color: "#06B6D4" },
            { label: "Not Set", count: summary.unset, color: "#94A3B8" },
          ].map(({ label, count, color }) => (
            <div key={label} className="text-center">
              <p className="text-xl font-bold" style={{ color }}>{count}</p>
              <p className="text-[11px] text-slate-500">{label}</p>
            </div>
          ))}
        </div>
        <ProgressBar
          value={summary.amFilled + summary.clientResponded}
          max={summary.totalFields}
          color="#10B981"
        />
      </div>

      {/* Sales prefill reference (AM-only) */}
      <SalesPrefillPanel record={freshRecord} />

      {/* Pending client fields summary */}
      {summary.pendingClient > 0 && <PendingFieldsSummary record={freshRecord} />}

      {/* Kickoff Call widget */}
      <KickoffCallWidget record={freshRecord} onRefresh={refresh} />

      {/* Section / view filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mr-1">Show:</span>
        {(
          [
            { value: "all", label: "All Fields" },
            ...ONBOARDING_SECTIONS.map((s) => ({ value: s.id, label: s.label })),
            { value: "pending-client", label: `Awaiting Client (${summary.pendingClient})` },
            { value: "unset", label: `Not Set (${summary.unset})` },
          ] as { value: string; label: string }[]
        ).map(({ value, label }) => (
          <button
            key={value}
            onClick={() =>
              setSectionFilter(value as AMOnboardingFieldDef["section"] | "all" | "pending-client" | "unset")
            }
            className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
              sectionFilter === value
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-blue-200 hover:text-blue-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Flat list for pending-client / unset */}
      {(sectionFilter === "pending-client" || sectionFilter === "unset") && (
        <div className="space-y-2.5">
          {fieldsToShow.length === 0 ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-5 py-8 text-center">
              <p className="text-sm text-slate-400">
                {sectionFilter === "pending-client"
                  ? "No fields currently awaiting client input."
                  : "All fields have been assigned — none are unset."}
              </p>
            </div>
          ) : (
            fieldsToShow.map((field) => (
              <CollaborativeFieldRow
                key={field.id}
                record={freshRecord}
                field={field}
                onChanged={refresh}
              />
            ))
          )}
        </div>
      )}

      {/* Grouped by section */}
      {grouped && (
        <div className="space-y-5">
          {grouped.map((sec) => {
            const secFields = getFieldsBySection(sec.id).filter((f) =>
              fieldsToShow.some((ff) => ff.id === f.id)
            );
            const secFilled = secFields.filter(
              (f) =>
                (freshRecord.fieldAssignments[f.id]?.status ?? "unset") === "am-filled" ||
                (freshRecord.fieldAssignments[f.id]?.status ?? "unset") === "client-responded"
            ).length;
            return (
              <div key={sec.id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <SectionHeader
                  title={sec.label}
                  description={sec.description}
                  filledCount={secFilled}
                  totalCount={secFields.length}
                />
                <div className="px-4 py-4 space-y-2.5">
                  {secFields.map((field) => (
                    <CollaborativeFieldRow
                      key={field.id}
                      record={freshRecord}
                      field={field}
                      onChanged={refresh}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Page entry point ──────────────────────────────────────────────────────────

export default function OnboardingRecordPage({
  params,
}: {
  params: Promise<{ recordId: string }>;
}) {
  const { recordId } = use(params);
  return <OnboardingDetailView recordId={recordId} />;
}
