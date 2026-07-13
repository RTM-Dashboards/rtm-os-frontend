"use client";

/**
 * AM Onboarding - Per-record detail page - Multi-Step Wizard Redesign
 *
 * Route: /account-management/onboarding/[recordId]
 *
 * Layout: RTM navy sidebar (section nav + per-section progress), top step-circle
 * indicator, section-grouped collaborative field cards, Previous / Next navigation.
 * Persistent top panel houses Status Override, Copy Client Link, Sales Prefill,
 * Pending Fields Summary, Kickoff Call widget, and Progress Summary - always visible
 * above the stepped section content.
 *
 * ALL EXISTING FUNCTIONALITY PRESERVED:
 * - Collaborative per-field fill/send-to-client interaction
 * - Autosave via saveFieldValue (800 ms debounce, SaveIndicator)
 * - Status override control (StatusOverrideControl)
 * - Sales Prefill Reference panel (collapsible)
 * - Kickoff Call widget
 * - PendingFieldsSummary
 * - CopyClientLink button
 * - Project ↔ Onboarding cross-links
 * - Section filter view (replaced by sidebar + Prev/Next)
 *
 * VISUAL CHANGES:
 * - Generic blue palette → RTM brand colors (--rtm-blue, --rtm-sidebar-bg, etc.)
 * - Flat scroll with filter pills → sidebar wizard + step-circle + grouped cards
 *
 * AM Internal Notes is Step 5 in the wizard (not a separate area).
 */

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  use,
  useMemo,
} from "react";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getOnboardingRecordById,
  setFieldAssignment,
  saveFieldValue,
  markFieldPendingClient,
  setFieldAmFilling,
  setStatusOverride,
  getOnboardingStatusMeta,
  getFieldStatusMeta,
  getPendingClientFields,
  getFieldAssignmentSummary,
  bulkMarkUnsetPendingClient,
  completeOnboardingRecord,
} from "@/lib/mock/am-onboarding-store";
import type {
  AMOnboardingRecord,
  OnboardingIntakeStatus,
  FieldStatus,
} from "@/lib/mock/am-onboarding-store";
import {
  ONBOARDING_FIELD_SCHEMA,
  ONBOARDING_SECTIONS,
} from "@/lib/mock/am-onboarding-field-schema";
import type {
  AMOnboardingFieldDef,
  AMOnboardingSection,
} from "@/lib/mock/am-onboarding-field-schema";
import { getAllProjects, getProjectByClientId } from "@/lib/mock/am-projects-store";
import { MASTER_CLIENTS, markKickoffComplete } from "@/lib/mock/master-clients";
import { apiMarkKickoffComplete, apiMarkOnboardingComplete } from "@/lib/mock/master-clients-api";
import { updateTaskStatus } from "@/lib/engine/api";

// ─── Formatting helpers ────────────────────────────────────────────────────────

function fmt(iso: string | null | undefined): string {
  if (!iso) return "-";
  const d = new Date(iso.length === 10 ? iso + "T00:00:00" : iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Save state indicator ──────────────────────────────────────────────────────

type SaveState = "idle" | "saving" | "saved" | "error";

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "idle") return null;
  if (state === "saving") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-[#9AAABB] font-medium">
        <span className="inline-block w-2.5 h-2.5 border-2 border-[#E4E8F0] border-t-[#1B4FD8] rounded-full animate-spin" />
        Saving...
      </span>
    );
  }
  if (state === "saved") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-[#059669] font-semibold">
        ✓ Saved
      </span>
    );
  }
  return <span className="text-[11px] text-[#DC2626] font-medium">Save failed - try again</span>;
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

// ─── Status override control ───────────────────────────────────────────────────

const ALL_STATUSES: OnboardingIntakeStatus[] = [
  "Draft", "AM In Progress", "Sent to Client", "Client Responded", "Ready for Kickoff", "Complete",
];

function StatusOverrideControl({
  record,
  onChanged,
}: {
  record: AMOnboardingRecord;
  onChanged: () => void;
}) {
  const isOverridden = record.statusOverride != null;
  const [saving, setSaving] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value as OnboardingIntakeStatus;
    setSaving(true);
    try {
      await setStatusOverride(record.id, value);
      onChanged();
    } finally {
      setSaving(false);
    }
  }

  async function handleRevert() {
    setSaving(true);
    try {
      await setStatusOverride(record.id, null);
      onChanged();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2 flex-wrap justify-end">
        <OnboardingStatusBadge status={record.status} />
        <select
          value={record.status}
          onChange={(e) => void handleChange(e)}
          disabled={saving}
          title="Manually set record status"
          className="rounded-lg border border-[#E4E8F0] bg-white px-2.5 py-1 text-xs font-semibold text-[#5A6A85] focus:outline-none focus:ring-2 focus:ring-[#1B4FD8]/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:border-[#1B4FD8]/40 transition-colors"
        >
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      {isOverridden ? (
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-[#D97706] uppercase tracking-wide">⚙ Manually set</span>
          <button
            onClick={() => void handleRevert()}
            disabled={saving}
            className="text-[10px] font-semibold text-[#1B4FD8] underline underline-offset-2 hover:text-[#1340B0] disabled:opacity-50 transition-colors"
          >
            Revert to auto
          </button>
        </div>
      ) : (
        <span className="text-[10px] text-[#9AAABB] font-medium">
          Auto-derived · use dropdown to override
        </span>
      )}
    </div>
  );
}

// ─── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#E4E8F0" }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

// ─── Section header (inside cards) ────────────────────────────────────────────

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
      ? { background: "#EBF0FD", color: "#1B4FD8", borderColor: "#1B4FD8/30" }
      : badgeVariant === "amber"
      ? { background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" }
      : badgeVariant === "green"
      ? { background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" }
      : { background: "#F7F9FC", color: "#5A6A85", borderColor: "#E4E8F0" };
  return (
    <div className="px-5 py-3.5 border-b border-[#E4E8F0] bg-[#F4F7FF] flex items-center justify-between">
      <div>
        <h3 className="text-sm font-bold text-[#0F1C38]">{title}</h3>
        {description && <p className="text-xs text-[#9AAABB] mt-0.5">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {filledCount !== undefined && totalCount !== undefined && (
          <span className="text-[11px] text-[#9AAABB] font-medium">{filledCount}/{totalCount}</span>
        )}
        {badge && (
          <span className="text-[11px] font-semibold rounded-full px-2.5 py-0.5 border" style={badgeStyle}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Pending fields summary ────────────────────────────────────────────────────

function PendingFieldsSummary({
  record,
  schema,
}: {
  record: AMOnboardingRecord;
  schema: AMOnboardingFieldDef[];
}) {
  const pending = getPendingClientFields(record);
  if (pending.length === 0) return null;
  return (
    <div className="rounded-xl border border-[#D97706]/30 bg-[#D97706]/5 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#D97706]/20 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#92400E]">Awaiting Client Input</h3>
          <p className="text-xs text-[#B45309] mt-0.5">
            {pending.length} field{pending.length !== 1 ? "s" : ""} assigned to the client.
            Use &quot;Copy Client Link&quot; below to share the fillable form.
          </p>
        </div>
        <span className="text-[11px] font-semibold rounded-full px-2.5 py-0.5 border"
          style={{ background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" }}>
          {pending.length} pending
        </span>
      </div>
      <div className="px-5 py-3 space-y-2">
        {pending.map((a) => {
          const fieldDef = schema.find((f) => f.id === a.fieldId);
          return (
            <div key={a.fieldId} className="flex items-center gap-2.5 rounded-lg border border-[#D97706]/20 bg-white px-3 py-2">
              <span className="w-2 h-2 rounded-full bg-[#D97706] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#0F1C38] truncate">{fieldDef?.label ?? a.fieldId}</p>
                {fieldDef?.description && (
                  <p className="text-[11px] text-[#9AAABB] truncate">{fieldDef.description}</p>
                )}
              </div>
              {a.sentToClientAt && (
                <span className="text-[10px] text-[#B45309] whitespace-nowrap shrink-0">
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
    <div className="rounded-xl border border-[#1B4FD8]/20 bg-[#EBF0FD] shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-5 py-3.5 flex items-center justify-between text-left"
      >
        <div>
          <h3 className="text-sm font-bold text-[#1340B0]">Sales Prefill Reference (Read-only)</h3>
          <p className="text-xs text-[#3B6EF5] mt-0.5">
            Data from MASTER_CLIENTS / Sales intake - owned by Sales &amp; Billing.
          </p>
        </div>
        <span className="text-xs font-semibold text-[#1B4FD8] ml-4 shrink-0">
          {expanded ? "Hide ▲" : "Show ▼"}
        </span>
      </button>
      {expanded && (
        <div className="px-5 pb-4 border-t border-[#1B4FD8]/15">
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
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[#3B6EF5] mb-0.5">{label}</p>
                  <p className="text-sm text-[#1340B0]">{value}</p>
                </div>
              ))}
          </div>
          {sp.activeServices.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#3B6EF5] mb-1">Contracted Services</p>
              <div className="flex flex-wrap gap-1.5">
                {sp.activeServices.map((s) => (
                  <span key={s} className="inline-block rounded-md border border-[#1B4FD8]/20 bg-white px-2.5 py-0.5 text-xs font-medium text-[#1B4FD8]">{s}</span>
                ))}
              </div>
            </div>
          )}
          {sp.selectedGoals && sp.selectedGoals.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#3B6EF5] mb-1">Goals (from Sales)</p>
              <div className="flex flex-wrap gap-1.5">
                {sp.selectedGoals.map((g) => (
                  <span key={g} className="inline-block rounded-md border border-[#059669]/20 bg-[#059669]/5 px-2.5 py-0.5 text-xs font-medium text-[#059669]">{g}</span>
                ))}
              </div>
            </div>
          )}
          {sp.discoveryNotes && (
            <div className="mt-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#3B6EF5] mb-1">Discovery Notes</p>
              <p className="text-sm text-[#1340B0] bg-white rounded-lg border border-[#1B4FD8]/15 px-3 py-2">{sp.discoveryNotes}</p>
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
    "w-full rounded-lg border border-[#E4E8F0] bg-white px-3 py-2 text-sm text-[#0F1C38] focus:outline-none focus:ring-2 focus:ring-[#1B4FD8]/30 focus:border-[#1B4FD8] placeholder:text-[#9AAABB]";

  if (field.type === "textarea") {
    return <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} className={baseInputClass} />;
  }
  if (field.type === "select" && field.options) {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} className={baseInputClass}>
        <option value="">- Select -</option>
        {field.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    );
  }
  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input type="checkbox" checked={value === "true"} onChange={(e) => onChange(e.target.checked ? "true" : "false")} className="w-4 h-4 rounded border-[#E4E8F0] text-[#1B4FD8] focus:ring-[#1B4FD8]/30" />
        <span className="text-sm text-[#0F1C38]">{field.label}</span>
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

// ─── Collaborative field row (autosave) ───────────────────────────────────────

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
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const [prevStored, setPrevStored] = useState(storedValue);
  if (storedValue !== prevStored) {
    setPrevStored(storedValue);
    if (!isEditing) setDraft(storedValue);
  }

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const autosave = useCallback(
    (value: string) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      setSaveState("saving");
      debounceTimer.current = setTimeout(async () => {
        try {
          await saveFieldValue(record.id, field.id, value);
          setSaveState("saved");
          setTimeout(() => setSaveState("idle"), 2500);
          onChanged();
        } catch {
          setSaveState("error");
        }
      }, 800);
    },
    [record.id, field.id, onChanged]
  );

  function handleDraftChange(value: string) {
    setDraft(value);
    autosave(value);
  }

  async function startFilling() {
    setDraft(storedValue);
    setSaveState("idle");
    setIsEditing(true);
    await setFieldAmFilling(record.id, field.id);
    onChanged();
  }

  async function handleCancelEdit() {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    setSaveState("idle");
    setDraft(storedValue);
    setIsEditing(false);
    if (!storedValue) {
      await setFieldAssignment(record.id, field.id, { status: "unset" });
      onChanged();
    }
  }

  async function handleSendToClient() {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    setIsEditing(false);
    setSaveState("idle");
    await markFieldPendingClient(record.id, field.id);
    onChanged();
  }

  function handleAmFillInstead() {
    void startFilling();
  }

  // ── pending-client ────────────────────────────────────────────────────────
  if (status === "pending-client") {
    return (
      <div className="rounded-xl border border-[#D97706]/30 bg-[#D97706]/5 px-4 py-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <p className="text-sm font-semibold text-[#0F1C38]">{field.label}</p>
              <FieldStatusChip status="pending-client" />
              {field.required && <span className="text-[10px] font-semibold text-[#DC2626] uppercase tracking-wide">Required</span>}
            </div>
            {field.description && <p className="text-xs text-[#5A6A85] mt-0.5">{field.description}</p>}
            {assignment?.sentToClientAt && (
              <p className="text-[11px] text-[#B45309] mt-1">Marked for client since {fmt(assignment.sentToClientAt)}</p>
            )}
          </div>
          <button
            onClick={handleAmFillInstead}
            className="shrink-0 rounded-lg border border-[#E4E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#5A6A85] hover:bg-[#F7F9FC] hover:border-[#1B4FD8]/40 transition-colors"
          >
            AM will fill instead
          </button>
        </div>
      </div>
    );
  }

  // ── client-responded ──────────────────────────────────────────────────────
  if (status === "client-responded") {
    return (
      <div className="rounded-xl border border-[#0891B2]/25 bg-[#ECFEFF] px-4 py-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <p className="text-sm font-semibold text-[#0F1C38]">{field.label}</p>
              <FieldStatusChip status="client-responded" />
            </div>
            {storedValue ? (
              <p className="text-sm text-[#0F1C38] mt-1 whitespace-pre-wrap">{storedValue}</p>
            ) : (
              <p className="text-sm italic text-[#9AAABB] mt-1">Client responded - no value recorded</p>
            )}
            {assignment?.clientRespondedAt && (
              <p className="text-[11px] text-[#0891B2] mt-1">Received {fmt(assignment.clientRespondedAt)}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── editing (am-filling) ──────────────────────────────────────────────────
  if (isEditing || status === "am-filling") {
    return (
      <div className="rounded-xl border border-[#1B4FD8]/25 bg-[#EBF0FD] px-4 py-3">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <p className="text-sm font-semibold text-[#0F1C38]">{field.label}</p>
          {field.required && <span className="text-[10px] font-semibold text-[#DC2626] uppercase tracking-wide">Required</span>}
          <span className="ml-auto"><SaveIndicator state={saveState} /></span>
        </div>
        {field.description && <p className="text-xs text-[#5A6A85] mb-2">{field.description}</p>}
        <FieldInput field={field} value={draft} onChange={handleDraftChange} />
        <div className="mt-2.5 flex items-center gap-2 flex-wrap">
          <button
            onClick={() => void handleCancelEdit()}
            className="rounded-lg border border-[#E4E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#5A6A85] hover:bg-[#F7F9FC] transition-colors"
          >
            Done
          </button>
          <button
            onClick={() => void handleSendToClient()}
            className="ml-auto rounded-lg border border-[#D97706]/30 bg-[#D97706]/5 px-3 py-1.5 text-xs font-semibold text-[#B45309] hover:bg-[#D97706]/10 transition-colors"
          >
            → Send to Client instead
          </button>
        </div>
        <p className="mt-2 text-[10px] text-[#9AAABB]">Autosaving as you type - no Save button needed.</p>
      </div>
    );
  }

  // ── am-filled ─────────────────────────────────────────────────────────────
  if (status === "am-filled") {
    return (
      <div className="rounded-xl border border-[#059669]/25 bg-[#059669]/5 px-4 py-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <p className="text-sm font-semibold text-[#0F1C38]">{field.label}</p>
              <FieldStatusChip status="am-filled" />
              {field.required && <span className="text-[10px] font-semibold text-[#DC2626] uppercase tracking-wide">Required</span>}
            </div>
            {storedValue ? (
              <p className="text-sm text-[#0F1C38] mt-0.5 whitespace-pre-wrap">{storedValue}</p>
            ) : (
              <p className="text-sm italic text-[#9AAABB] mt-0.5">-</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={() => void startFilling()} className="rounded-lg border border-[#E4E8F0] bg-white px-2.5 py-1 text-xs font-semibold text-[#5A6A85] hover:bg-[#F7F9FC] transition-colors">Edit</button>
            <button onClick={() => void handleSendToClient()} className="rounded-lg border border-[#D97706]/30 bg-white px-2.5 py-1 text-xs font-semibold text-[#B45309] hover:bg-[#D97706]/5 transition-colors">→ Client</button>
          </div>
        </div>
      </div>
    );
  }

  // ── unset ─────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-xl border border-[#E4E8F0] bg-white px-4 py-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <p className="text-sm font-semibold text-[#0F1C38]">{field.label}</p>
            {field.required && <span className="text-[10px] font-semibold text-[#DC2626] uppercase tracking-wide">Required</span>}
          </div>
          {field.description && <p className="text-xs text-[#9AAABB] mt-0.5">{field.description}</p>}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={() => void startFilling()} className="rounded-lg border border-[#1B4FD8]/30 bg-[#EBF0FD] px-3 py-1.5 text-xs font-semibold text-[#1B4FD8] hover:bg-[#EBF0FD]/70 transition-colors">Fill it in</button>
          <button onClick={() => void handleSendToClient()} className="rounded-lg border border-[#D97706]/30 bg-[#D97706]/5 px-3 py-1.5 text-xs font-semibold text-[#B45309] hover:bg-[#D97706]/10 transition-colors">Send to Client</button>
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
      <div className="rounded-xl border border-[#E4E8F0] bg-white shadow-sm overflow-hidden">
        <SectionHeader title="Kickoff Call" badge="Not Required" badgeVariant="default" />
        <div className="px-5 py-4">
          <p className="text-sm text-[#9AAABB] italic">No kickoff call required for this client.</p>
        </div>
      </div>
    );
  }

  async function handleMarkComplete() {
    setCompleting(true);
    if (kickoffDate) {
      await saveFieldValue(record.id, "kickoffCallDate", kickoffDate);
    }
    await apiMarkKickoffComplete(record.clientId, kickoffDate || undefined).catch(() => {});
    markKickoffComplete(record.clientId, kickoffDate || undefined);
    setTimeout(() => {
      setCompleting(false);
      onRefresh();
    }, 200);
  }

  return (
    <div className="rounded-xl border border-[#E4E8F0] bg-white shadow-sm overflow-hidden">
      <SectionHeader
        title="Kickoff Call"
        description="Required - schedule and complete the kickoff call with the client."
        badge={kickoffCompleted ? "Completed" : "Pending"}
        badgeVariant={kickoffCompleted ? "green" : "amber"}
      />
      <div className="px-5 py-4">
        {kickoffCompleted ? (
          <div className="rounded-lg border border-[#059669]/20 bg-[#059669]/5 px-4 py-3 flex items-center gap-3">
            <span className="text-[#059669] text-lg">✓</span>
            <div>
              <p className="text-sm font-semibold text-[#059669]">Kickoff call completed</p>
              {storedDate && <p className="text-xs text-[#059669] mt-0.5">Date: {fmt(storedDate)}</p>}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-[#5A6A85]">
              Record the kickoff call date and mark it complete once the call has been held.
            </p>
            <div className="flex items-end gap-3 flex-wrap">
              <div>
                <label className="block text-xs font-semibold text-[#5A6A85] mb-1">Kickoff Call Date</label>
                <input
                  type="date"
                  value={kickoffDate}
                  onChange={(e) => setKickoffDate(e.target.value)}
                  className="rounded-lg border border-[#E4E8F0] bg-white px-3 py-2 text-sm text-[#0F1C38] focus:outline-none focus:ring-2 focus:ring-[#1B4FD8]/30"
                />
              </div>
              <button
                onClick={() => void handleMarkComplete()}
                disabled={completing}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-50"
                style={{ background: "#059669" }}
              >
                {completing ? "Saving..." : "Mark Kickoff Complete"}
              </button>
            </div>
            {storedDate && <p className="text-xs text-[#9AAABB]">Previously scheduled: {fmt(storedDate)}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Copy client link ──────────────────────────────────────────────────────────

/** Builds the shareable client-facing onboarding URL for a given record. */
function buildClientLink(recordId: string): string {
  return `${window.location.origin}/client-onboarding/${recordId}`;
}

function CopyClientLinkButton({ recordId }: { recordId: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    const url = buildClientLink(recordId);
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
          ? "border-[#059669]/30 bg-[#059669]/5 text-[#059669]"
          : "border-[#1d709f]/40 bg-[#1d709f]/5 text-[#1d709f] hover:bg-[#1d709f]/10"
      }`}
    >
      {copied ? "Link copied!" : "Copy Client Link"}
    </button>
  );
}

// ─── Toast notification ────────────────────────────────────────────────────────

type ToastState = { visible: boolean; message: string };

function Toast({ toast }: { toast: ToastState }) {
  if (!toast.visible) return null;
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-xl border border-[#059669]/30 bg-[#0F1C38] px-5 py-3 shadow-xl animate-fade-in"
      role="status"
      aria-live="polite"
    >
      <span className="text-[#34D399] text-base">✓</span>
      <p className="text-sm font-semibold text-white">{toast.message}</p>
    </div>
  );
}

// ─── Finish & Prepare for Client button ───────────────────────────────────────

function FinishAndPrepareButton({
  recordId,
  unsetCount,
  onDone,
  size = "sm",
}: {
  recordId: string;
  unsetCount: number;
  onDone: (toastMessage: string) => void;
  size?: "sm" | "lg";
}) {
  const [busy, setBusy] = useState(false);

  async function handleFinish() {
    if (busy) return;
    setBusy(true);
    try {
      const { transitionedCount } = await bulkMarkUnsetPendingClient(recordId);
      // Copy client link - reuse exact same logic as CopyClientLinkButton
      const url = buildClientLink(recordId);
      await navigator.clipboard.writeText(url);
      const fieldWord = transitionedCount === 1 ? "field" : "fields";
      const msg =
        transitionedCount > 0
          ? `${transitionedCount} ${fieldWord} marked for client · link copied!`
          : "No unset fields - link copied!";
      onDone(msg);
    } catch {
      onDone("Done - link copied (clipboard may be unavailable).");
    } finally {
      setBusy(false);
    }
  }

  if (size === "lg") {
    return (
      <button
        type="button"
        onClick={() => void handleFinish()}
        disabled={busy}
        className={`${montserrat.className} inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
        style={{ background: "#1d709f" }}
      >
        {busy ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Preparing...
          </>
        ) : (
          <>
            Finish &amp; Prepare for Client
            {unsetCount > 0 && (
              <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">
                {unsetCount} unset
              </span>
            )}
          </>
        )}
      </button>
    );
  }

  // size === "sm" - compact header variant
  return (
    <button
      type="button"
      onClick={() => void handleFinish()}
      disabled={busy}
      className={`${montserrat.className} inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
      style={{
        borderColor: "#1d709f",
        background: "#1d709f",
        color: "white",
      }}
    >
      {busy ? (
        <>
          <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Preparing...
        </>
      ) : (
        <>
          Finish &amp; Prepare for Client
          {unsetCount > 0 && (
            <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold">
              {unsetCount}
            </span>
          )}
        </>
      )}
    </button>
  );
}

// ─── Save All & Complete Onboarding button + confirmation dialog ─────────────

type CompleteDialogState =
  | { open: false }
  | { open: true; unsetCount: number; pendingClientCount: number };

function CompleteOnboardingDialog({
  state,
  onConfirm,
  onCancel,
  busy,
}: {
  state: CompleteDialogState;
  onConfirm: () => void;
  onCancel: () => void;
  busy: boolean;
}) {
  if (!state.open) return null;

  const { unsetCount, pendingClientCount } = state;
  const hasWarnings = unsetCount > 0 || pendingClientCount > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,28,56,0.55)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="complete-dialog-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div
          className="px-6 py-5 border-b"
          style={{ background: "#231f20", borderColor: "rgba(255,255,255,0.12)" }}
        >
          <h2
            id="complete-dialog-title"
            className={`${montserrat.className} text-lg font-bold text-white`}
          >
            Complete Onboarding Record?
          </h2>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
            This permanently closes the onboarding workflow for this client.
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Field state summary */}
          <div className="rounded-xl border border-[#E4E8F0] bg-[#F7F9FC] px-5 py-4 space-y-3">
            <p className="text-sm font-bold text-[#231f20]">Current field state:</p>
            <div className="grid grid-cols-2 gap-3">
              <div
                className="rounded-lg border px-4 py-3 text-center"
                style={{
                  background: unsetCount > 0 ? "#FFF7ED" : "#F8FAFC",
                  borderColor: unsetCount > 0 ? "#FED7AA" : "#E2E8F0",
                }}
              >
                <p
                  className="text-2xl font-bold"
                  style={{ color: unsetCount > 0 ? "#C2410C" : "#64748B" }}
                >
                  {unsetCount}
                </p>
                <p
                  className="text-xs font-semibold mt-0.5"
                  style={{ color: unsetCount > 0 ? "#C2410C" : "#94A3B8" }}
                >
                  Unset fields
                </p>
              </div>
              <div
                className="rounded-lg border px-4 py-3 text-center"
                style={{
                  background: pendingClientCount > 0 ? "#FFFBEB" : "#F8FAFC",
                  borderColor: pendingClientCount > 0 ? "#FDE68A" : "#E2E8F0",
                }}
              >
                <p
                  className="text-2xl font-bold"
                  style={{ color: pendingClientCount > 0 ? "#B45309" : "#64748B" }}
                >
                  {pendingClientCount}
                </p>
                <p
                  className="text-xs font-semibold mt-0.5"
                  style={{ color: pendingClientCount > 0 ? "#B45309" : "#94A3B8" }}
                >
                  Awaiting client
                </p>
              </div>
            </div>
          </div>

          {/* Warning or all-clear */}
          {hasWarnings ? (
            <div className="rounded-xl border border-[#fdb713]/50 bg-[#fdb713]/8 px-4 py-3">
              <p className="text-sm font-semibold text-[#231f20]">
                Some fields are incomplete
              </p>
              <p className="text-xs text-[#5A6A85] mt-1">
                Completing now will preserve these fields exactly as they are - no
                transitions will be forced. This is intentional for clients where
                not every field applies.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-[#059669]/25 bg-[#059669]/5 px-4 py-3">
              <p className="text-sm font-semibold text-[#065F46]">
                All fields are filled or responded to
              </p>
              <p className="text-xs text-[#059669] mt-1">
                This onboarding record is fully resolved - safe to complete.
              </p>
            </div>
          )}

          {/* What this does */}
          <div className="rounded-xl border border-[#E4E8F0] bg-[#F7F9FC] px-4 py-3 space-y-1.5">
            <p className="text-xs font-bold text-[#231f20] uppercase tracking-wide">
              What happens on confirm:
            </p>
            <ul className="space-y-1">
              {[
                "Onboarding record marked Complete (no field changes)",
                "Task #1 (Onboarding) marked Complete in the engine",
                "Client activationStatus advanced to Active",
                "Client removed from the Onboarding Queue",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[#1d709f] mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-xs text-[#5A6A85]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t flex items-center justify-end gap-3"
          style={{ background: "#FAFAFA", borderColor: "#E2E8F0" }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-xl border border-[#E4E8F0] bg-white px-5 py-2.5 text-sm font-semibold text-[#5A6A85] hover:bg-[#F7F9FC] disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`${montserrat.className} inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
            style={{ background: "#231f20" }}
          >
            {busy ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Completing...
              </>
            ) : (
              "Complete anyway"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function CompleteOnboardingButton({
  record,
  onDone,
  liveProjects,
  size = "sm",
}: {
  record: AMOnboardingRecord;
  onDone: (toastMessage: string) => void;
  liveProjects: import("@/lib/engine/types").Project[];
  size?: "sm" | "lg";
}) {
  const [dialogState, setDialogState] = useState<CompleteDialogState>({ open: false });
  const [busy, setBusy] = useState(false);

  // Already complete - show a disabled completed badge instead of the button
  if (record.status === "Complete") {
    if (size === "lg") {
      return (
        <span className={`${montserrat.className} inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold border-2 border-[#231f20]/25 bg-[#231f20]/5 text-[#231f20]`}>
          Onboarding Completed
        </span>
      );
    }
    return (
      <span className={`${montserrat.className} inline-flex items-center gap-1.5 rounded-lg border border-[#231f20]/25 bg-[#231f20]/5 px-3 py-1.5 text-xs font-semibold text-[#231f20]`}>
        Completed
      </span>
    );
  }

  function handleOpen() {
    const assignments = Object.values(record.fieldAssignments);
    const unsetCount = assignments.filter((a) => a.status === "unset").length;
    const pendingClientCount = assignments.filter((a) => a.status === "pending-client").length;
    setDialogState({ open: true, unsetCount, pendingClientCount });
  }

  async function handleConfirm() {
    if (busy) return;
    setBusy(true);
    try {
      // 1. Persist record as Complete (no field mutations)
      await completeOnboardingRecord(record.id);

      // 2. Mark the engine Task #1 (Onboarding task) as Completed
      const project = liveProjects.find((p) => p.clientId === record.clientId);
      if (project) {
        const tasksRes = await fetch(`/api/engine?resource=tasks`);
        if (tasksRes.ok) {
          const tasksData = (await tasksRes.json()) as { tasks: import("@/lib/engine/types").Task[] };
          const onboardingTask = tasksData.tasks.find(
            (t) => t.projectId === project.id && !!t.linkedOnboardingId
          );
          if (onboardingTask && onboardingTask.status !== "Completed") {
            const now = new Date().toISOString();
            await updateTaskStatus(onboardingTask.id, {
              status: "Completed",
              completionDate: now.slice(0, 10),
              updatedAt: now,
            });
          }
        }
      }

      // 3. Advance MASTER_CLIENTS activationStatus → Active
      await apiMarkOnboardingComplete(record.clientId);

      setDialogState({ open: false });
      onDone("✓ Onboarding completed - client is now Active and removed from the queue.");
    } catch (err) {
      console.error("Complete onboarding failed:", err);
      onDone("Completion encountered an error - please check the record.");
    } finally {
      setBusy(false);
    }
  }

  function handleCancel() {
    if (!busy) setDialogState({ open: false });
  }

  if (size === "lg") {
    return (
      <>
        <button
          type="button"
          onClick={handleOpen}
          className={`${montserrat.className} inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:opacity-90`}
          style={{ background: "#231f20" }}
        >
          Save All &amp; Complete Onboarding
        </button>
        <CompleteOnboardingDialog
          state={dialogState}
          onConfirm={() => void handleConfirm()}
          onCancel={handleCancel}
          busy={busy}
        />
      </>
    );
  }

  // size === "sm"
  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={`${montserrat.className} inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-90`}
        style={{
          borderColor: "#231f20",
          background: "#231f20",
          color: "white",
        }}
      >
        Save All &amp; Complete Onboarding
      </button>
      <CompleteOnboardingDialog
        state={dialogState}
        onConfirm={() => void handleConfirm()}
        onCancel={handleCancel}
        busy={busy}
      />
    </>
  );
}

// ─── Completed record banner ───────────────────────────────────────────────────

function CompletedBanner({ clientName }: { clientName: string }) {
  return (
    <div
      className="rounded-2xl border border-[#231f20]/20 bg-white px-6 py-4 flex items-center gap-4"
      style={{ borderLeft: "4px solid #231f20" }}
      role="status"
      aria-live="polite"
    >
      <div className="flex-1 min-w-0">
        <p className={`${montserrat.className} text-sm font-bold text-[#231f20]`}>
          Onboarding Complete - {clientName} is now Active
        </p>
        <p className="text-xs text-[#5A6A85] mt-0.5">
          This record is closed. Field state is preserved as-is. The Onboarding task has been
          marked Complete in the engine and the client has left the Onboarding Queue.
          To make changes, use the Status Override dropdown to revert the record status.
        </p>
      </div>
    </div>
  );
}

// ─── Step circle ──────────────────────────────────────────────────────────────

type StepCircleState = "current" | "complete" | "needs-attention" | "upcoming";

function StepCircle({
  index,
  state,
  label,
  onClick,
}: {
  index: number;
  state: StepCircleState;
  label: string;
  onClick: () => void;
}) {
  const num = index + 1;
  let circleContent: React.ReactNode;
  let circleClass: string;
  let textClass: string;

  if (state === "complete") {
    circleContent = (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
        <path d="M3 8l3.5 3.5L13 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
    circleClass = "w-8 h-8 rounded-full flex items-center justify-center bg-[#059669] border-2 border-[#059669] cursor-pointer hover:opacity-90 transition-opacity";
    textClass = "text-xs font-semibold text-[#059669] mt-1 text-center max-w-[72px] truncate";
  } else if (state === "current") {
    circleContent = <span className="text-sm font-bold text-[#1B4FD8]">{num}</span>;
    circleClass = "w-8 h-8 rounded-full flex items-center justify-center bg-white border-2 border-[#1B4FD8] cursor-pointer shadow-sm";
    textClass = "text-xs font-bold text-[#1B4FD8] mt-1 text-center max-w-[72px] truncate";
  } else if (state === "needs-attention") {
    circleContent = <span className="text-sm font-bold text-white">!</span>;
    circleClass = "w-8 h-8 rounded-full flex items-center justify-center bg-[#D97706] border-2 border-[#D97706] cursor-pointer hover:opacity-90 transition-opacity";
    textClass = "text-xs font-semibold text-[#D97706] mt-1 text-center max-w-[72px] truncate";
  } else {
    circleContent = <span className="text-sm font-medium text-[#9AAABB]">{num}</span>;
    circleClass = "w-8 h-8 rounded-full flex items-center justify-center bg-white border-2 border-[#E4E8F0] cursor-pointer hover:border-[#1B4FD8]/40 transition-colors";
    textClass = "text-xs text-[#9AAABB] mt-1 text-center max-w-[72px] truncate";
  }

  return (
    <button onClick={onClick} className="flex flex-col items-center gap-0" title={label} type="button">
      <div className={circleClass}>{circleContent}</div>
      <span className={textClass}>{label}</span>
    </button>
  );
}

function StepConnector({ complete }: { complete: boolean }) {
  return (
    <div
      className="flex-1 h-0.5 mt-4 rounded-full transition-colors duration-300"
      style={{ background: complete ? "#059669" : "#E4E8F0" }}
    />
  );
}

// ─── Sidebar section item ─────────────────────────────────────────────────────

function SidebarSectionItem({
  label,
  description,
  stepIndex,
  isActive,
  isComplete,
  filledCount,
  totalCount,
  isInternal,
  onClick,
}: {
  label: string;
  description: string;
  stepIndex: number;
  isActive: boolean;
  isComplete: boolean;
  filledCount: number;
  totalCount: number;
  isInternal?: boolean;
  onClick: () => void;
}) {
  const pct = totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0;

  return (
    <button
      onClick={onClick}
      type="button"
      className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-150 group ${
        isActive
          ? "bg-white/10 border border-white/20"
          : "hover:bg-white/7 border border-transparent"
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
            isComplete
              ? "bg-[#059669] text-white"
              : isActive
              ? "bg-[#1B4FD8] text-white"
              : isInternal
              ? "bg-[#D97706]/30 text-[#D97706]"
              : "bg-white/10 text-[#C8D5EE]"
          }`}
        >
          {isComplete ? "✓" : stepIndex + 1}
        </div>
        <span
          className={`text-sm font-semibold leading-tight flex-1 ${
            isActive ? "text-white" : "text-[#C8D5EE] group-hover:text-white"
          } transition-colors`}
        >
          {label}
          {isInternal && (
            <span className="ml-1.5 text-[9px] font-bold uppercase tracking-wide text-[#D97706]/70">Internal</span>
          )}
        </span>
        {totalCount > 0 && (
          <span className="text-[10px] font-medium text-[#C8D5EE]/60 whitespace-nowrap">
            {filledCount}/{totalCount}
          </span>
        )}
      </div>
      {totalCount > 0 && (
        <div className="ml-9">
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: isComplete ? "#059669" : isInternal ? "#D97706" : "#3B6EF5",
              }}
            />
          </div>
          {isActive && (
            <p className="text-[10px] text-[#C8D5EE]/60 mt-1 truncate">{description}</p>
          )}
        </div>
      )}
    </button>
  );
}

// ─── Main detail view ──────────────────────────────────────────────────────────

function OnboardingDetailView({ recordId }: { recordId: string }) {
  const router = useRouter();

  // ── Live schema state ─────────────────────────────────────────────────────
  // Seeded from the static values for first-paint (no flash / no loading state
  // needed). Hydrated from the API in the same useEffect that loads the record,
  // so any admin changes in Form Builder are reflected on next page load.
  const [liveSchema, setLiveSchema] = useState<AMOnboardingFieldDef[]>(
    ONBOARDING_FIELD_SCHEMA
  );
  const [liveSections, setLiveSections] = useState<AMOnboardingSection[]>(
    ONBOARDING_SECTIONS
  );

  const [record, setRecord] = useState<AMOnboardingRecord | null | undefined>(undefined);
  const [liveProjects, setLiveProjects] = useState<import("@/lib/engine/types").Project[]>([]);
  const [toast, setToast] = useState<ToastState>({ visible: false, message: "" });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ visible: true, message });
    toastTimer.current = setTimeout(() => setToast({ visible: false, message: "" }), 4000);
  }, []);

  const loadRecord = useCallback(async () => {
    const r = await getOnboardingRecordById(recordId);
    setRecord(r ?? null);
  }, [recordId]);

  useEffect(() => {
    void loadRecord();
    // Hydrate field schema from the live API store (Form Builder writes here).
    fetch("/api/onboarding-field-schema")
      .then((r) => r.ok ? r.json() : null)
      .then((d: { sections: AMOnboardingSection[]; fields: AMOnboardingFieldDef[] } | null) => {
        if (d?.fields) setLiveSchema(d.fields);
        if (d?.sections) setLiveSections(d.sections);
      })
      .catch(() => {
        // Silent fail — static seed remains in use, no regression.
      });
    fetch("/api/engine?resource=projects")
      .then((r) => r.ok ? r.json() : null)
      .then((d: { projects: import("@/lib/engine/types").Project[] } | null) => {
        if (d?.projects) setLiveProjects(d.projects);
      })
      .catch(() => {});
  }, [loadRecord]);

  const refresh = useCallback(() => {
    void loadRecord();
  }, [loadRecord]);

  // Cleanup toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  // Current wizard step (index into ONBOARDING_SECTIONS)
  const [currentStep, setCurrentStep] = useState(0);

  // Scroll content top on step change
  const mainContentRef = useRef<HTMLDivElement>(null);
  const prevStep = useRef(currentStep);
  useEffect(() => {
    if (prevStep.current !== currentStep) {
      prevStep.current = currentStep;
      mainContentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep]);

  // Loading
  if (record === undefined) {
    return (
      <div className="rounded-xl border border-[#E4E8F0] bg-white shadow-sm px-6 py-16 text-center">
        <p className="text-sm text-[#9AAABB]">Loading onboarding record...</p>
      </div>
    );
  }

  // Not found
  if (record === null) {
    return (
      <div className="rounded-xl border border-[#E4E8F0] bg-white shadow-sm px-6 py-16 text-center">
        <h2 className={`${montserrat.className} text-lg font-bold text-[#0F1C38] mb-1`}>Record not found</h2>
        <p className="text-sm text-[#9AAABB] max-w-md mx-auto mb-4">
          Onboarding record{" "}
          <span className="font-mono text-xs bg-[#F7F9FC] px-1.5 py-0.5 rounded">{recordId}</span>{" "}
          could not be found.
        </p>
        <button
          onClick={() => router.push("/account-management/onboarding")}
          className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
          style={{ background: "#1B4FD8" }}
        >
          ← Back to Onboarding Queue
        </button>
      </div>
    );
  }

  const summary = getFieldAssignmentSummary(record);
  const freshProject = record.projectId
    ? (liveProjects.find((p) => p.id === record.projectId) ?? getAllProjects().find((p) => p.id === record.projectId))
    : (liveProjects.find((p) => p.clientId === record.clientId) ?? getProjectByClientId(record.clientId));

  // Per-section data — uses live schema (hydrated from API; seeded from static on first paint)
  const sectionData = liveSections.map((sec) => {
    const fields = liveSchema.filter((f) => f.section === sec.id);
    const filledCount = fields.filter(
      (f) =>
        record.fieldAssignments[f.id]?.status === "am-filled" ||
        record.fieldAssignments[f.id]?.status === "client-responded"
    ).length;
    const isComplete = fields.length > 0 && filledCount === fields.length;
    const isInternal = sec.id === "am-internal";
    return { sec, fields, filledCount, totalCount: fields.length, isComplete, isInternal };
  });

  const totalSteps = sectionData.length;
  const activeStepIndex = Math.min(currentStep, totalSteps - 1);
  const currentSecData = sectionData[activeStepIndex];
  const isLastStep = activeStepIndex === totalSteps - 1;
  const isFirstStep = activeStepIndex === 0;

  // Overall fill pct
  const overallFilled = summary.amFilled + summary.clientResponded;
  const overallPct = summary.totalFields > 0 ? Math.round((overallFilled / summary.totalFields) * 100) : 0;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#F7F9FC" }}>
      {/* ── Breadcrumb ────────────────────────────────────────────────────── */}
      <div className="px-6 pt-6 pb-0 max-w-full">
        <button
          onClick={() => router.push("/account-management/onboarding")}
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          style={{ color: "#1B4FD8" }}
        >
          ← Back to Onboarding Queue
        </button>
      </div>

      {/* ── Record header ─────────────────────────────────────────────────── */}
      <div className="px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#1B4FD8]">
              Account Management - Onboarding Queue
            </p>
            <h1 className={`${montserrat.className} text-2xl font-bold text-[#0F1C38] mt-0.5`}>
              {record.salesPrefill.clientName}
            </h1>
            <p className="text-sm text-[#5A6A85] mt-1">
              Created: {fmt(record.createdAt)} · Record ID:{" "}
              <span className="font-mono text-xs text-[#9AAABB]">{record.id}</span>
            </p>
            {freshProject && (
              <div className="mt-1.5">
                <Link
                  href={`/account-management/projects?project=${freshProject.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white"
                  style={{ background: "#059669" }}
                >
                  View Project →
                </Link>
                <span className="ml-2 text-xs font-medium" style={{ color: "#059669" }}>{freshProject.name}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <CopyClientLinkButton recordId={record.id} />
              {record.status !== "Complete" && (
                <FinishAndPrepareButton
                  recordId={record.id}
                  unsetCount={summary.unset}
                  onDone={(msg) => { showToast(msg); refresh(); }}
                  size="sm"
                />
              )}
              <CompleteOnboardingButton
                record={record}
                onDone={(msg) => { showToast(msg); refresh(); }}
                liveProjects={liveProjects}
                size="sm"
              />
            </div>
            <StatusOverrideControl record={record} onChanged={refresh} />
          </div>
        </div>
      </div>

      {/* ── Persistent top panel ──────────────────────────────────────────── */}
      <div className="px-6 pb-5 space-y-4">
        {/* Completed banner - shown prominently at top when record is Complete */}
        {record.status === "Complete" && (
          <CompletedBanner clientName={record.salesPrefill.clientName} />
        )}

        {/* Progress summary */}
        <div className="rounded-xl border border-[#E4E8F0] bg-white shadow-sm px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-[#0F1C38]">Form Progress</p>
            <span className="text-xs text-[#5A6A85]">
              {overallFilled} of {summary.totalFields} fields resolved
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            {[
              { label: "AM Filled", count: summary.amFilled, color: "#059669" },
              { label: "Awaiting Client", count: summary.pendingClient, color: "#D97706" },
              { label: "Client Responded", count: summary.clientResponded, color: "#0891B2" },
              { label: "Not Set", count: summary.unset, color: "#9AAABB" },
            ].map(({ label, count, color }) => (
              <div key={label} className="text-center">
                <p className="text-xl font-bold" style={{ color }}>{count}</p>
                <p className="text-[11px] text-[#9AAABB]">{label}</p>
              </div>
            ))}
          </div>
          <ProgressBar value={overallFilled} max={summary.totalFields} color="#059669" />
        </div>

        {/* Sales prefill reference */}
        <SalesPrefillPanel record={record} />

        {/* Pending client fields summary */}
        {summary.pendingClient > 0 && <PendingFieldsSummary record={record} schema={liveSchema} />}

        {/* Kickoff Call widget */}
        <KickoffCallWidget record={record} onRefresh={refresh} />
      </div>

      {/* ── Step circle indicator ─────────────────────────────────────────── */}
      <div
        className="px-6 py-4 border-y sticky top-0 z-20"
        style={{ background: "white", borderColor: "#E4E8F0" }}
      >
        <div className="max-w-3xl mx-auto flex items-start gap-2">
          {sectionData.map((sd, i) => {
            let state: StepCircleState;
            if (i === activeStepIndex) state = "current";
            else if (sd.isComplete) state = "complete";
            else state = "upcoming";

            return (
              <React.Fragment key={sd.sec.id}>
                <StepCircle
                  index={i}
                  state={state}
                  label={sd.sec.id === "am-internal" ? "AM Notes" : sd.sec.label.split(" ")[0]}
                  onClick={() => setCurrentStep(i)}
                />
                {i < sectionData.length - 1 && (
                  <StepConnector complete={sd.isComplete} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── Main layout: sidebar + content ──────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside
          className="hidden lg:flex flex-col w-72 flex-shrink-0 sticky top-[73px] self-start max-h-[calc(100vh-73px)] overflow-y-auto"
          style={{ background: "#0E2055" }}
        >
          <div className="p-4 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#C8D5EE]/50 mb-3 px-2">
              Form Sections
            </p>
            <div className="space-y-1">
              {sectionData.map((sd, i) => (
                <SidebarSectionItem
                  key={sd.sec.id}
                  label={sd.sec.label}
                  description={sd.sec.description}
                  stepIndex={i}
                  isActive={i === activeStepIndex}
                  isComplete={sd.isComplete}
                  filledCount={sd.filledCount}
                  totalCount={sd.totalCount}
                  isInternal={sd.isInternal}
                  onClick={() => setCurrentStep(i)}
                />
              ))}
            </div>
          </div>

          {/* Sidebar bottom: overall progress */}
          <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <p className="text-[10px] font-semibold text-[#C8D5EE]/60 mb-2">Overall Progress</p>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.12)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${overallPct}%`, background: "#3B6EF5" }}
              />
            </div>
            <p className="text-[10px] text-[#C8D5EE]/60 mt-1.5">
              {overallFilled} of {summary.totalFields} fields filled
            </p>
          </div>
        </aside>

        {/* Main content area */}
        <main ref={mainContentRef} className="flex-1 overflow-y-auto px-4 sm:px-8 py-8">
          <div className="max-w-2xl mx-auto space-y-6">

            {/* Section heading */}
            {currentSecData && (
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#1B4FD8]">
                    Step {activeStepIndex + 1} of {totalSteps}
                  </span>
                  {currentSecData.isComplete && (
                    <span className="text-xs font-semibold text-[#059669] bg-[#059669]/10 rounded-full px-2 py-0.5">
                      ✓ Complete
                    </span>
                  )}
                  {currentSecData.isInternal && (
                    <span className="text-xs font-semibold text-[#D97706] bg-[#D97706]/10 rounded-full px-2 py-0.5">
                      Internal Only
                    </span>
                  )}
                </div>
                <h2 className={`${montserrat.className} text-xl font-bold text-[#0F1C38]`}>{currentSecData.sec.label}</h2>
                <p className="text-sm text-[#5A6A85] mt-1">{currentSecData.sec.description}</p>
              </div>
            )}

            {/* Section grouped card */}
            {currentSecData && (
              <div className="rounded-2xl border border-[#E4E8F0] bg-white shadow-sm overflow-hidden">
                {/* Card header */}
                <div
                  className="px-6 py-4 border-b flex items-center justify-between"
                  style={{ background: currentSecData.isInternal ? "#FFFBEB" : "#F4F7FF", borderColor: "#E4E8F0" }}
                >
                  <div>
                    <h3 className="text-sm font-bold text-[#0F1C38]">{currentSecData.sec.label}</h3>
                    <p className="text-xs text-[#5A6A85] mt-0.5">{currentSecData.sec.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#5A6A85]">
                      {currentSecData.filledCount}/{currentSecData.totalCount}
                    </span>
                    <div className="w-20 h-1.5 rounded-full overflow-hidden bg-[#E4E8F0]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: currentSecData.totalCount > 0
                            ? `${Math.round((currentSecData.filledCount / currentSecData.totalCount) * 100)}%`
                            : "0%",
                          background: currentSecData.isComplete
                            ? "#059669"
                            : currentSecData.isInternal
                            ? "#D97706"
                            : "#1B4FD8",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Fields */}
                <div className="relative px-5 py-4 space-y-2.5">
                  {record.status === "Complete" && (
                    <div
                      className="absolute inset-0 z-10 rounded-b-2xl flex flex-col items-center justify-center gap-2"
                      style={{ background: "rgba(247,249,252,0.88)", backdropFilter: "blur(2px)" }}
                    >
                      <p className={`${montserrat.className} text-sm font-bold text-[#231f20]`}>Onboarding Complete</p>
                      <p className="text-xs text-[#5A6A85] text-center max-w-xs">
                        This record is closed. Use the Status Override dropdown to revert and unlock editing.
                      </p>
                    </div>
                  )}
                  {currentSecData.fields.map((field) => (
                    <CollaborativeFieldRow
                      key={field.id}
                      record={record}
                      field={field}
                      onChanged={refresh}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 5 action CTAs (last step only) ──────────────────────── */}
            {isLastStep && (
              <div className="space-y-3">
                {/* Finish & Prepare for Client — hidden when already Complete */}
                {record.status !== "Complete" && (
                  <div
                    className="rounded-2xl border bg-white px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                    style={{ borderColor: "#1d709f", borderLeft: "4px solid #1d709f" }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`${montserrat.className} text-sm font-bold text-[#231f20]`}>Ready to hand off to the client?</p>
                      <p className="text-xs text-[#5A6A85] mt-0.5">
                        This will mark all remaining unfilled fields as &ldquo;Awaiting Client&rdquo; and copy the client link — ready to paste.
                        {summary.unset > 0
                          ? ` (${summary.unset} unset field${summary.unset === 1 ? "" : "s"} will be sent to client.)`
                          : " All fields are already filled or assigned."}
                      </p>
                    </div>
                    <FinishAndPrepareButton
                      recordId={record.id}
                      unsetCount={summary.unset}
                      onDone={(msg) => { showToast(msg); refresh(); }}
                      size="lg"
                    />
                  </div>
                )}

                {/* Save All & Complete Onboarding — closing action, charcoal accent */}
                <div
                  className="rounded-2xl border bg-white px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                  style={{ borderColor: "#231f20", borderLeft: "4px solid #231f20" }}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`${montserrat.className} text-sm font-bold text-[#231f20]`}>
                      {record.status === "Complete"
                        ? "Onboarding record is Complete"
                        : "Done with this client's onboarding?"}
                    </p>
                    <p className="text-xs text-[#5A6A85] mt-0.5">
                      {record.status === "Complete"
                        ? "This record is closed. The Onboarding task is Complete and the client is Active."
                        : "Saves all field state as-is (no forced transitions), closes the record, marks Task #1 Complete in the engine, and advances the client to Active."}
                    </p>
                  </div>
                  <CompleteOnboardingButton
                    record={record}
                    onDone={(msg) => { showToast(msg); refresh(); }}
                    liveProjects={liveProjects}
                    size="lg"
                  />
                </div>
              </div>
            )}

            {/* ── Navigation: Previous / Next ─────────────────────────────── */}
            <div className="flex items-center gap-3 pt-2 pb-8">
              {/* Previous */}
              <button
                type="button"
                onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                disabled={isFirstStep}
                className="flex items-center gap-2 rounded-xl border border-[#E4E8F0] bg-white px-5 py-2.5 text-sm font-semibold text-[#5A6A85] hover:border-[#1B4FD8]/40 hover:text-[#1B4FD8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>

              <div className="flex-1" />

              {/* Step dots */}
              <div className="hidden sm:flex items-center gap-1.5">
                {sectionData.map((sd, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentStep(i)}
                    className="transition-all duration-200"
                  >
                    <div
                      className="rounded-full transition-all duration-200"
                      style={{
                        width: i === activeStepIndex ? 24 : 8,
                        height: 8,
                        background: i === activeStepIndex
                          ? "#1B4FD8"
                          : sd.isComplete
                          ? "#059669"
                          : "#E4E8F0",
                      }}
                    />
                  </button>
                ))}
              </div>

              <div className="flex-1" />

              {/* Next */}
              {!isLastStep ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((s) => Math.min(totalSteps - 1, s + 1))}
                  className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #1B4FD8 0%, #3B6EF5 100%)" }}
                >
                  Next →
                </button>
              ) : (
                <span className="text-xs font-semibold text-[#059669] bg-[#059669]/10 rounded-xl px-5 py-2.5">
                  ✓ Last section
                </span>
              )}
            </div>

            <p className="text-center text-xs text-[#9AAABB] pb-8">
              Account Management · Onboarding Record · {record.salesPrefill.clientName}
            </p>
          </div>
        </main>
      </div>
      <Toast toast={toast} />
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
