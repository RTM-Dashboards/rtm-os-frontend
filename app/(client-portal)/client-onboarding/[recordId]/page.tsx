"use client";

/**
 * Client-Facing Onboarding Form — Multi-Step Wizard Redesign
 *
 * Route: /client-onboarding/[recordId]
 *
 * Layout: RTM navy sidebar (section nav + per-section progress), top step-circle
 * indicator, section-grouped card, Previous / Next navigation.
 * Submit All Answers appears on the final step.
 *
 * ALL EXISTING FUNCTIONALITY PRESERVED:
 * - Autosave drafts (800 ms debounce, "pending-client" status, value updates)
 * - Resume-on-reload from file-backed API
 * - Per-field SaveIndicator (saving / saved / error)
 * - Required-field validation on Submit All + scroll-to-first-error
 * - All-done state (every field already client-responded)
 * - Nothing-to-fill state (no fields assigned)
 * - The Sales Prefill data is surfaced in the record header (as before)
 *
 * VISUAL CHANGES:
 * - Generic violet palette → RTM brand colors (--rtm-blue, --rtm-sidebar-bg, etc.)
 * - Flat scroll → sidebar + step-circle + grouped card + Prev/Next
 */

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  use,
  useMemo,
} from "react";
import {
  getOnboardingRecordById,
  setFieldAssignment,
  simulateClientResponse,
} from "@/lib/mock/am-onboarding-store";
import type { AMOnboardingRecord, FieldAssignment } from "@/lib/mock/am-onboarding-store";
import { ONBOARDING_FIELD_SCHEMA, ONBOARDING_SECTIONS } from "@/lib/mock/am-onboarding-field-schema";
import type { AMOnboardingFieldDef } from "@/lib/mock/am-onboarding-field-schema";

// ─── Constants ─────────────────────────────────────────────────────────────────

/** Client-visible sections (am-internal excluded) */
const CLIENT_SECTIONS = ONBOARDING_SECTIONS.filter((s) => s.id !== "am-internal");

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Fields the client should see: pending-client OR already client-responded */
function getClientVisibleFields(record: AMOnboardingRecord): AMOnboardingFieldDef[] {
  return ONBOARDING_FIELD_SCHEMA.filter((f) => {
    if (f.section === "am-internal") return false;
    const assignment = record.fieldAssignments[f.id];
    return (
      assignment?.status === "pending-client" ||
      assignment?.status === "client-responded"
    );
  });
}

/** Client-visible fields for a specific section */
function getClientFieldsForSection(
  record: AMOnboardingRecord,
  sectionId: string
): AMOnboardingFieldDef[] {
  return getClientVisibleFields(record).filter((f) => f.section === sectionId);
}

// ─── Field input ───────────────────────────────────────────────────────────────

function ClientFieldInput({
  field,
  value,
  onChange,
  disabled,
}: {
  field: AMOnboardingFieldDef;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const baseClass =
    "w-full rounded-xl border px-4 py-3 text-sm text-[#0F1C38] focus:outline-none focus:ring-2 placeholder:text-[#9AAABB] transition-shadow disabled:opacity-60 disabled:cursor-not-allowed"
    + " border-[#E4E8F0] bg-white focus:ring-[#1B4FD8]/30 focus:border-[#1B4FD8]";

  if (field.type === "textarea") {
    return (
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        disabled={disabled}
        className={baseClass}
      />
    );
  }
  if (field.type === "select" && field.options) {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={baseClass}
      >
        <option value="">— Select one —</option>
        {field.options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }
  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={value === "true"}
          onChange={(e) => onChange(e.target.checked ? "true" : "false")}
          disabled={disabled}
          className="w-5 h-5 rounded border-[#E4E8F0] text-[#1B4FD8] focus:ring-[#1B4FD8]/30"
        />
        <span className="text-sm text-[#0F1C38]">{field.label}</span>
      </label>
    );
  }
  if (field.type === "date") {
    return (
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={baseClass}
      />
    );
  }
  if (field.type === "number") {
    return (
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        disabled={disabled}
        className={baseClass}
      />
    );
  }
  return (
    <input
      type={field.type === "phone" ? "tel" : field.type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      disabled={disabled}
      className={baseClass}
    />
  );
}

// ─── Save status indicator ────────────────────────────────────────────────────

type SaveState = "idle" | "saving" | "saved" | "error";

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "idle") return null;
  if (state === "saving") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-[#9AAABB] font-medium">
        <span className="inline-block w-2.5 h-2.5 border-2 border-[#E4E8F0] border-t-[#1B4FD8] rounded-full animate-spin" />
        Saving…
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
  return (
    <span className="text-[11px] text-[#DC2626] font-medium">Save failed — try again</span>
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
    // upcoming
    circleContent = <span className="text-sm font-medium text-[#9AAABB]">{num}</span>;
    circleClass = "w-8 h-8 rounded-full flex items-center justify-center bg-white border-2 border-[#E4E8F0] cursor-pointer hover:border-[#1B4FD8]/40 transition-colors";
    textClass = "text-xs text-[#9AAABB] mt-1 text-center max-w-[72px] truncate";
  }

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-0"
      title={label}
      type="button"
    >
      <div className={circleClass}>{circleContent}</div>
      <span className={textClass}>{label}</span>
    </button>
  );
}

// ─── Connector line between steps ─────────────────────────────────────────────

function StepConnector({ complete }: { complete: boolean }) {
  return (
    <div
      className="flex-1 h-0.5 mt-4 rounded-full transition-colors duration-300"
      style={{ background: complete ? "#059669" : "#E4E8F0" }}
    />
  );
}

// ─── Single field card ────────────────────────────────────────────────────────

function ClientFieldCard({
  record,
  field,
  value,
  onChange,
  saveState,
  hasError,
  fieldRef,
}: {
  record: AMOnboardingRecord;
  field: AMOnboardingFieldDef;
  value: string;
  onChange: (v: string) => void;
  saveState: SaveState;
  hasError: boolean;
  fieldRef: React.RefObject<HTMLDivElement | null>;
}) {
  const assignment: FieldAssignment | undefined = record.fieldAssignments[field.id];
  const isResponded = assignment?.status === "client-responded";

  // Already finalized — show locked read-only card
  if (isResponded) {
    return (
      <div
        ref={fieldRef}
        className="rounded-xl border border-[#059669]/30 bg-[#059669]/5 p-5"
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-[#059669] flex items-center justify-center text-white text-[11px] font-bold">
            ✓
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#059669]">{field.label}</p>
            {value ? (
              <p className="text-sm text-[#0F1C38] mt-1 whitespace-pre-wrap">{value}</p>
            ) : (
              <p className="text-sm italic text-[#9AAABB] mt-1">Response submitted</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const isEmpty = field.type !== "checkbox" && !value.trim();

  return (
    <div
      ref={fieldRef}
      className={`rounded-xl border p-5 shadow-sm transition-colors ${
        hasError
          ? "border-[#DC2626]/40 bg-[#DC2626]/5 ring-2 ring-[#DC2626]/20"
          : "border-[#E4E8F0] bg-white"
      }`}
    >
      {/* Field header */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <p className="text-sm font-semibold text-[#0F1C38]">{field.label}</p>
          {field.required && (
            <span className="text-[10px] font-bold text-[#DC2626] uppercase tracking-wide">
              Required
            </span>
          )}
          <span className="ml-auto">
            <SaveIndicator state={saveState} />
          </span>
        </div>
        {field.description && (
          <p className="text-xs text-[#5A6A85]">{field.description}</p>
        )}
      </div>

      {/* Input */}
      <ClientFieldInput field={field} value={value} onChange={onChange} />

      {/* Validation error */}
      {hasError && (
        <p className="mt-2 text-xs font-semibold text-[#DC2626]">
          This field is required — please fill it in before submitting.
        </p>
      )}

      {/* Optional hint */}
      {!hasError && isEmpty && !field.required && (
        <p className="mt-2 text-[11px] text-[#9AAABB]">
          Optional — leave blank or type to autosave a draft.
        </p>
      )}
    </div>
  );
}

// ─── Sidebar section item ─────────────────────────────────────────────────────

function SidebarSectionItem({
  label,
  description,
  stepIndex,
  isActive,
  isComplete,
  isEmpty,
  filledCount,
  totalCount,
  onClick,
}: {
  label: string;
  description: string;
  stepIndex: number;
  isActive: boolean;
  isComplete: boolean;
  /** True when this section has no fields currently assigned to the client */
  isEmpty: boolean;
  filledCount: number;
  totalCount: number;
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
          : isEmpty
          ? "opacity-60 hover:opacity-80 border border-transparent"
          : "hover:bg-white/7 border border-transparent"
      }`}
    >
      <div className="flex items-center gap-3 mb-1">
        {/* Step number / check */}
        <div
          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
            isComplete
              ? "bg-[#059669] text-white"
              : isActive
              ? "bg-[#1B4FD8] text-white"
              : isEmpty
              ? "bg-white/5 text-[#C8D5EE]/40"
              : "bg-white/10 text-[#C8D5EE]"
          }`}
        >
          {isComplete ? "✓" : stepIndex + 1}
        </div>
        <span
          className={`text-sm font-semibold leading-tight ${
            isActive
              ? "text-white"
              : isEmpty
              ? "text-[#C8D5EE]/50"
              : "text-[#C8D5EE] group-hover:text-white"
          } transition-colors`}
        >
          {label}
        </span>
        {totalCount > 0 && (
          <span className="ml-auto text-[10px] font-medium text-[#C8D5EE]/60 whitespace-nowrap">
            {filledCount}/{totalCount}
          </span>
        )}
      </div>

      {/* "Nothing needed" hint for empty sections */}
      {isEmpty && (
        <p className="ml-9 text-[10px] text-[#C8D5EE]/40 leading-tight">
          Nothing needed from you here
        </p>
      )}

      {/* Progress bar (only when section has fields) */}
      {!isEmpty && totalCount > 0 && (
        <div className="ml-9">
          <div className="h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: isComplete ? "#059669" : "#3B6EF5",
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

// ─── Main client view ─────────────────────────────────────────────────────────

function ClientOnboardingView({ recordId }: { recordId: string }) {
  // ── Record state ────────────────────────────────────────────────────────────
  const [record, setRecord] = useState<AMOnboardingRecord | null | undefined>(undefined);

  const loadRecord = useCallback(async () => {
    const r = await getOnboardingRecordById(recordId);
    setRecord(r ?? null);
  }, [recordId]);

  useEffect(() => {
    void loadRecord();
  }, [loadRecord]);

  // ── Per-field draft values ──────────────────────────────────────────────────
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (record && !initialized) {
      const initial: Record<string, string> = {};
      for (const field of ONBOARDING_FIELD_SCHEMA) {
        const assignment = record.fieldAssignments[field.id];
        if (
          assignment?.status === "pending-client" ||
          assignment?.status === "client-responded"
        ) {
          initial[field.id] = assignment.value ?? "";
        }
      }
      setDraftValues(initial);
      setInitialized(true);
    }
  }, [record, initialized]);

  // ── Step state ──────────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(0);

  // ── Per-field save state ────────────────────────────────────────────────────
  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({});

  // ── Validation error fields ─────────────────────────────────────────────────
  const [errorFields, setErrorFields] = useState<Set<string>>(new Set());

  // ── Refs for scroll-to on validation failure ───────────────────────────────
  const fieldRefs = useRef<Record<string, React.RefObject<HTMLDivElement | null>>>({});

  function getFieldRef(fieldId: string): React.RefObject<HTMLDivElement | null> {
    if (!fieldRefs.current[fieldId]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fieldRefs.current[fieldId] = React.createRef<HTMLDivElement>() as any;
    }
    return fieldRefs.current[fieldId];
  }

  // ── Debounced autosave ─────────────────────────────────────────────────────
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const autosaveDraft = useCallback(
    (fieldId: string, value: string) => {
      if (debounceTimers.current[fieldId]) {
        clearTimeout(debounceTimers.current[fieldId]);
      }
      if (!record) return;
      const assignment = record.fieldAssignments[fieldId];
      if (assignment?.status === "client-responded") return;

      setSaveStates((prev) => ({ ...prev, [fieldId]: "saving" }));

      debounceTimers.current[fieldId] = setTimeout(async () => {
        try {
          await setFieldAssignment(record.id, fieldId, { value });
          setSaveStates((prev) => ({ ...prev, [fieldId]: "saved" }));
          setTimeout(() => {
            setSaveStates((prev) => ({ ...prev, [fieldId]: "idle" }));
          }, 2500);
        } catch {
          setSaveStates((prev) => ({ ...prev, [fieldId]: "error" }));
        }
      }, 800);
    },
    [record]
  );

  // Clean up timers on unmount
  useEffect(() => {
    const timers = debounceTimers.current;
    return () => {
      for (const id of Object.keys(timers)) {
        clearTimeout(timers[id]);
      }
    };
  }, []);

  // ── Field change handler ───────────────────────────────────────────────────
  const handleFieldChange = useCallback(
    (fieldId: string, value: string) => {
      setDraftValues((prev) => ({ ...prev, [fieldId]: value }));
      setErrorFields((prev) => {
        if (!prev.has(fieldId)) return prev;
        const next = new Set(prev);
        next.delete(fieldId);
        return next;
      });
      autosaveDraft(fieldId, value);
    },
    [autosaveDraft]
  );

  // ── Submit All state ───────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // ── Submit All handler ─────────────────────────────────────────────────────
  const handleSubmitAll = useCallback(async () => {
    if (!record) return;
    const clientFields = getClientVisibleFields(record);
    const pendingFields = clientFields.filter(
      (f) => record.fieldAssignments[f.id]?.status === "pending-client"
    );

    const missing = pendingFields.filter((f) => {
      if (!f.required) return false;
      const val = draftValues[f.id] ?? "";
      return val.trim() === "" && f.type !== "checkbox";
    });

    if (missing.length > 0) {
      const missingIds = new Set(missing.map((f) => f.id));
      setErrorFields(missingIds);

      // Navigate to the step containing the first missing field
      const firstMissing = missing[0];
      const sectionIdx = CLIENT_SECTIONS.findIndex((s) => s.id === firstMissing.section);
      if (sectionIdx !== -1) setCurrentStep(sectionIdx);

      setTimeout(() => {
        const firstRef = fieldRefs.current[missing[0].id];
        if (firstRef?.current) {
          firstRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
      return;
    }

    setSubmitting(true);

    for (const id of Object.keys(debounceTimers.current)) {
      clearTimeout(debounceTimers.current[id]);
    }
    debounceTimers.current = {};

    try {
      await Promise.all(
        pendingFields
          .filter((f) => {
            const val = draftValues[f.id] ?? "";
            return val.trim() !== "" || f.type === "checkbox";
          })
          .map((f) =>
            simulateClientResponse(record.id, f.id, draftValues[f.id] ?? "")
          )
      );
      await loadRecord();
      setSubmitSuccess(true);
    } catch {
      // let user retry
    } finally {
      setSubmitting(false);
    }
  }, [record, draftValues, loadRecord]);

  // ── Per-section computed data ──────────────────────────────────────────────
  const sectionData = useMemo(() => {
    if (!record) return [];
    return CLIENT_SECTIONS.map((sec) => {
      const fields = getClientFieldsForSection(record, sec.id);
      const respondedCount = fields.filter(
        (f) => record.fieldAssignments[f.id]?.status === "client-responded"
      ).length;
      const pendingCount = fields.filter(
        (f) => record.fieldAssignments[f.id]?.status === "pending-client"
      ).length;
      const draftFilledCount = fields
        .filter((f) => record.fieldAssignments[f.id]?.status === "pending-client")
        .filter((f) => {
          const val = draftValues[f.id] ?? "";
          return val.trim() !== "" || f.type === "checkbox";
        }).length;
      const filledCount = respondedCount + draftFilledCount;
      const isComplete = fields.length > 0 && filledCount === fields.length && pendingCount === 0;
      const hasErrors = fields.some((f) => errorFields.has(f.id));
      /** True when no fields are currently assigned to the client in this section */
      const isEmpty = fields.length === 0;
      return {
        sec,
        fields,
        filledCount,
        totalCount: fields.length,
        isComplete,
        hasErrors,
        isEmpty,
      };
    });
  }, [record, draftValues, errorFields]);

  // ── Scroll top on step change ──────────────────────────────────────────────
  const mainContentRef = useRef<HTMLDivElement>(null);
  const prevStep = useRef(currentStep);
  useEffect(() => {
    if (prevStep.current !== currentStep) {
      prevStep.current = currentStep;
      mainContentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Render: loading
  if (record === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F7F9FC" }}>
        <p className="text-sm text-[#9AAABB]">Loading onboarding form…</p>
      </div>
    );
  }

  // Render: not found
  if (record === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#F7F9FC" }}>
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#E4E8F0] shadow-sm p-8 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-lg font-bold text-[#0F1C38] mb-2">Form not found</h1>
          <p className="text-sm text-[#5A6A85] mb-1">
            This onboarding form link may be expired or invalid. Please contact
            your account manager for a fresh link.
          </p>
          <p className="text-[11px] text-[#9AAABB] mt-3 font-mono">{recordId}</p>
        </div>
      </div>
    );
  }

  const clientFields = getClientVisibleFields(record);
  const respondedCount = clientFields.filter(
    (f) => record.fieldAssignments[f.id]?.status === "client-responded"
  ).length;
  const pendingFields = clientFields.filter(
    (f) => record.fieldAssignments[f.id]?.status === "pending-client"
  );
  const draftFilledCount = pendingFields.filter((f) => {
    const val = draftValues[f.id] ?? "";
    return val.trim() !== "" || f.type === "checkbox";
  }).length;
  const total = clientFields.length;
  const progressCount = respondedCount + draftFilledCount;
  const allAlreadyResponded = total > 0 && respondedCount === total;

  // ── All-done state ─────────────────────────────────────────────────────────
  if (allAlreadyResponded) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#F7F9FC" }}>
        <div className="max-w-xl w-full">
          <div className="text-center py-10">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-[#0F1C38] mb-2">All done!</h2>
            <p className="text-[#5A6A85] max-w-sm mx-auto">
              Thank you! Your account manager will review your responses and be
              in touch shortly.
            </p>
            <div className="mt-6 rounded-2xl border border-[#059669]/30 bg-[#059669]/5 px-6 py-4 inline-block">
              <p className="text-sm font-semibold text-[#059669]">
                {record.salesPrefill.clientName} — Onboarding responses submitted ✓
              </p>
            </div>
            {clientFields.length > 0 && (
              <div className="mt-8 space-y-4 text-left">
                <h3 className="text-sm font-bold text-[#5A6A85] uppercase tracking-wide">
                  Your Submitted Answers
                </h3>
                {clientFields.map((field) => {
                  const val = draftValues[field.id] ?? "";
                  return (
                    <div
                      key={field.id}
                      className="rounded-xl border border-[#059669]/25 bg-[#059669]/5 p-5"
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-[#059669] flex items-center justify-center text-white text-[11px] font-bold">
                          ✓
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#059669]">{field.label}</p>
                          {val ? (
                            <p className="text-sm text-[#0F1C38] mt-1 whitespace-pre-wrap">{val}</p>
                          ) : (
                            <p className="text-sm italic text-[#9AAABB] mt-1">Response submitted</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Nothing assigned ───────────────────────────────────────────────────────
  if (total === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#F7F9FC" }}>
        <div className="text-center py-12">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-[#0F1C38] mb-2">Nothing to fill in right now</h2>
          <p className="text-sm text-[#9AAABB] max-w-sm mx-auto">
            Your account manager hasn&apos;t assigned any fields for you to
            complete yet. Check back later or reach out to them directly.
          </p>
        </div>
      </div>
    );
  }

  // ── All client sections are always shown; "empty" ones get a placeholder ──
  // This keeps the step structure consistent with the AM view (4 sections,
  // am-internal excluded). Sections with nothing currently pending for this
  // client show a "Nothing needed from you here" state rather than being hidden.
  const totalSteps = sectionData.length; // always CLIENT_SECTIONS.length (4)
  const activeStepIndex = Math.min(currentStep, totalSteps - 1);
  const currentSecData = sectionData[activeStepIndex];
  const isLastStep = activeStepIndex === totalSteps - 1;
  const isFirstStep = activeStepIndex === 0;

  // ── Overall progress ───────────────────────────────────────────────────────
  const overallPct = total > 0 ? Math.round((progressCount / total) * 100) : 0;

  // Current section fields with errors on this step
  const currentStepErrors = currentSecData
    ? Array.from(errorFields).filter((id) =>
        currentSecData.fields.some((f) => f.id === id)
      )
    : [];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F7F9FC" }}>
      {/* ── Top header ─────────────────────────────────────────────────────── */}
      <header
        className="px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-20 border-b"
        style={{ background: "#0E2055", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm"
            style={{ background: "#1B4FD8" }}
          >
            R
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#C8D5EE]/70">
              Onboarding
            </p>
            <h1 className="text-sm font-bold text-white leading-tight">
              {record.salesPrefill.clientName}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] text-[#C8D5EE]/70">{overallPct}% complete</p>
            <div className="mt-1 w-28 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.12)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${overallPct}%`, background: "#3B6EF5" }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* ── Step circle indicator ───────────────────────────────────────────── */}
      <div
        className="px-6 py-4 border-b"
        style={{ background: "white", borderColor: "#E4E8F0" }}
      >
        <div className="max-w-5xl mx-auto flex items-start gap-2">
          {sectionData.map((sd, i) => {
            let state: StepCircleState;
            if (i === activeStepIndex) state = "current";
            else if (sd.isComplete) state = "complete";
            else if (sd.hasErrors) state = "needs-attention";
            else state = "upcoming";

            return (
              <React.Fragment key={sd.sec.id}>
                <StepCircle
                  index={i}
                  state={state}
                  label={sd.sec.label}
                  onClick={() => setCurrentStep(CLIENT_SECTIONS.findIndex((s) => s.id === sd.sec.id))}
                />
                {i < sectionData.length - 1 && (
                  <StepConnector complete={sd.isComplete} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── Main layout: sidebar + content ─────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside
          className="hidden lg:flex flex-col w-72 flex-shrink-0 sticky top-[121px] self-start max-h-[calc(100vh-121px)] overflow-y-auto"
          style={{ background: "#0E2055" }}
        >
          <div className="p-4 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#C8D5EE]/50 mb-3 px-2">
              Sections
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
                  isEmpty={sd.isEmpty}
                  filledCount={sd.filledCount}
                  totalCount={sd.totalCount}
                  onClick={() => setCurrentStep(CLIENT_SECTIONS.findIndex((s) => s.id === sd.sec.id))}
                />
              ))}
            </div>
          </div>

          {/* Sidebar bottom: overall progress */}
          <div
            className="p-4 border-t"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            <p className="text-[10px] font-semibold text-[#C8D5EE]/60 mb-2">Overall Progress</p>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.12)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${overallPct}%`, background: "#3B6EF5" }}
              />
            </div>
            <p className="text-[10px] text-[#C8D5EE]/60 mt-1.5">
              {progressCount} of {total} fields filled
            </p>
          </div>
        </aside>

        {/* Main content — fills available width; no dead whitespace */}
        <main
          ref={mainContentRef}
          className="flex-1 overflow-y-auto px-4 sm:px-8 py-8"
        >
          <div className="max-w-2xl mx-auto space-y-6">

            {/* Section card header */}
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
                  {currentSecData.isEmpty && (
                    <span className="text-xs font-semibold text-[#9AAABB] bg-[#F7F9FC] border border-[#E4E8F0] rounded-full px-2 py-0.5">
                      No action needed
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-[#0F1C38]">{currentSecData.sec.label}</h2>
                <p className="text-sm text-[#5A6A85] mt-1">{currentSecData.sec.description}</p>
              </div>
            )}

            {/* Intro text (first step only) */}
            {activeStepIndex === 0 && (
              <div
                className="rounded-xl border px-5 py-4"
                style={{ background: "#EBF0FD", borderColor: "#1B4FD8/20" }}
              >
                <p className="text-sm text-[#1340B0]">
                  Your answers save automatically as you type — come back any time and
                  your progress will still be here. Navigate sections using the sidebar or
                  the Previous / Next buttons below. When you&apos;re ready, click{" "}
                  <span className="font-semibold">Submit All Answers</span> on the last step.
                </p>
              </div>
            )}

            {/* Error banner (only shows errors for fields on this step) */}
            {currentStepErrors.length > 0 && (
              <div className="rounded-xl border border-[#DC2626]/30 bg-[#DC2626]/5 px-5 py-4">
                <div className="flex items-start gap-3">
                  <span className="text-[#DC2626] text-lg mt-0.5">⚠️</span>
                  <div>
                    <p className="text-sm font-bold text-[#DC2626]">
                      Some required fields are still blank
                    </p>
                    <ul className="mt-2 space-y-0.5">
                      {currentStepErrors.map((fieldId) => {
                        const def = ONBOARDING_FIELD_SCHEMA.find((f) => f.id === fieldId);
                        return (
                          <li key={fieldId}>
                            <button
                              onClick={() => {
                                const ref = fieldRefs.current[fieldId];
                                ref?.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                              }}
                              className="text-xs font-semibold text-[#DC2626] underline underline-offset-2 hover:text-red-800"
                            >
                              {def?.label ?? fieldId}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Global error banner (after submit attempt — shows all sections) */}
            {errorFields.size > 0 && currentStepErrors.length === 0 && (
              <div className="rounded-xl border border-[#D97706]/30 bg-[#D97706]/5 px-5 py-4">
                <div className="flex items-start gap-3">
                  <span className="text-[#D97706] text-lg mt-0.5">⚠️</span>
                  <div>
                    <p className="text-sm font-bold text-[#D97706]">
                      Some required fields in other sections still need values
                    </p>
                    <p className="text-xs text-[#D97706] mt-0.5">
                      Use the sidebar to navigate to those sections.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit success banner */}
            {submitSuccess && !allAlreadyResponded && (
              <div className="rounded-xl border border-[#059669]/30 bg-[#059669]/5 px-5 py-4 flex items-center gap-3">
                <span className="text-[#059669] text-lg">✅</span>
                <p className="text-sm font-semibold text-[#059669]">
                  Answers submitted! Your account manager will be in touch shortly.
                </p>
              </div>
            )}

            {/* Section grouped card */}
            {currentSecData && (
              <div className="rounded-2xl border border-[#E4E8F0] bg-white shadow-sm overflow-hidden">
                {/* Card header */}
                <div
                  className="px-6 py-4 border-b flex items-center justify-between"
                  style={{
                    background: currentSecData.isEmpty ? "#F7F9FC" : "#F4F7FF",
                    borderColor: "#E4E8F0",
                  }}
                >
                  <div>
                    <h3 className="text-sm font-bold text-[#0F1C38]">{currentSecData.sec.label}</h3>
                    <p className="text-xs text-[#5A6A85] mt-0.5">{currentSecData.sec.description}</p>
                  </div>
                  {!currentSecData.isEmpty && (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#5A6A85]">
                        {currentSecData.filledCount}/{currentSecData.totalCount}
                      </span>
                      {/* Mini progress pill */}
                      <div className="w-20 h-1.5 rounded-full overflow-hidden bg-[#E4E8F0]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: currentSecData.totalCount > 0
                              ? `${Math.round((currentSecData.filledCount / currentSecData.totalCount) * 100)}%`
                              : "0%",
                            background: currentSecData.isComplete ? "#059669" : "#1B4FD8",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Fields — or "nothing needed" placeholder */}
                <div className="px-6 py-5 space-y-4">
                  {currentSecData.isEmpty ? (
                    <div className="flex flex-col items-center gap-3 py-8 text-center">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ background: "#F0F4FF" }}
                      >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#9AAABB" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#5A6A85]">
                          Nothing needed from you in this section
                        </p>
                        <p className="text-xs text-[#9AAABB] mt-1 max-w-xs">
                          Your account manager has this covered — you can move to the next step.
                        </p>
                      </div>
                    </div>
                  ) : (
                    currentSecData.fields.map((field) => (
                      <ClientFieldCard
                        key={field.id}
                        record={record}
                        field={field}
                        value={draftValues[field.id] ?? ""}
                        onChange={(v) => handleFieldChange(field.id, v)}
                        saveState={saveStates[field.id] ?? "idle"}
                        hasError={errorFields.has(field.id)}
                        fieldRef={getFieldRef(field.id)}
                      />
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ── Navigation: Previous / Next / Submit ──────────────────── */}
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

              {/* Step dots (mobile-friendly mini indicator) */}
              <div className="hidden sm:flex items-center gap-1.5">
                {sectionData.map((sd, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentStep(CLIENT_SECTIONS.findIndex((s) => s.id === sd.sec.id))}
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
                          : sd.isEmpty
                          ? "#C8D5EE"
                          : "#E4E8F0",
                      }}
                    />
                  </button>
                ))}
              </div>

              <div className="flex-1" />

              {/* Next or Submit */}
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
                <button
                  type="button"
                  onClick={() => void handleSubmitAll()}
                  disabled={submitting || pendingFields.length === 0}
                  className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                  style={{
                    background: pendingFields.length === 0
                      ? "#059669"
                      : "linear-gradient(135deg, #1B4FD8 0%, #3B6EF5 100%)",
                    boxShadow: "0 4px 12px rgba(27,79,216,0.3)",
                  }}
                >
                  {submitting
                    ? "Submitting…"
                    : pendingFields.length === 0
                    ? "All answers submitted ✓"
                    : "Submit All Answers"}
                </button>
              )}
            </div>

            {/* Required field status footer */}
            {(() => {
              const requiredPending = pendingFields.filter((f) => f.required);
              const requiredFilled = requiredPending.filter((f) => {
                const val = draftValues[f.id] ?? "";
                return val.trim() !== "" || f.type === "checkbox";
              });
              const requiredMissing = requiredPending.length - requiredFilled.length;
              if (requiredPending.length === 0) return null;
              return (
                <p className="text-xs text-center text-[#9AAABB] -mt-4 pb-2">
                  {requiredMissing === 0 ? (
                    <span className="text-[#059669] font-semibold">✓ All required fields filled</span>
                  ) : (
                    <span className="text-[#D97706] font-semibold">
                      {requiredMissing} required field{requiredMissing !== 1 ? "s" : ""} still need{requiredMissing === 1 ? "s" : ""} a value
                    </span>
                  )}
                </p>
              );
            })()}

            <p className="text-center text-xs text-[#9AAABB] pb-8">
              Secure link provided by your account manager · {record.salesPrefill.clientName}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Page entry point ──────────────────────────────────────────────────────────

export default function ClientOnboardingPage({
  params,
}: {
  params: Promise<{ recordId: string }>;
}) {
  const { recordId } = use(params);
  return <ClientOnboardingView recordId={recordId} />;
}
