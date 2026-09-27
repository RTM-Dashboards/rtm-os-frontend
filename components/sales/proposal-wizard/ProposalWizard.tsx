"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import type { AuditResult } from "@/lib/sales/audit-engine";
import type { BudgetLineItem, BudgetResult } from "@/lib/sales/budget-engine";
import type { ProposalDocument } from "@/lib/sales/proposal-engine";
import type { HomeServicesIntakeRecord, AiAuditResult, ProposalDiscount } from "@/lib/sales/types";
import { WizardStepIndicator } from "./WizardStepIndicator";
import { Step1ClientGoals } from "./steps/Step1ClientGoals";
import { Step2Audit } from "./steps/Step2Audit";
import { Step3Recommendations } from "./steps/Step3Recommendations";
import { Step4Budget } from "./steps/Step4Budget";
import { Step5ProposalDraft } from "./steps/Step5ProposalDraft";

// ─── Wizard State ─────────────────────────────────────────────────────────────

export interface ProposalWizardState {
  wizardId: string;
  status: "draft" | "in-progress" | "complete";
  currentStep: 1 | 2 | 3 | 4 | 5;
  completedSteps: number[];
  clientInfo: {
    name: string;
    businessName: string;
    industry: string;
    location: string;
    website: string;
    leadSource: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    notes: string;
  };
  selectedGoals: string[];
  auditMode: "existing" | "quick" | "ai" | null;
  selectedAuditId: string | null;
  auditResult: AuditResult | null;
  approvedRecommendations: string[];
  approvedRecommendationServiceNames: string[];
  lineItems: BudgetLineItem[];
  discountPercentage: number;
  discount: ProposalDiscount;
  budgetResult: BudgetResult | null;
  proposalDocument: ProposalDocument | null;
  lastSavedAt: string | null;
  // Home Services intake
  intakeRecord: Partial<HomeServicesIntakeRecord> | null;
  opportunityId: string | null;
  // AI Audit result (persisted in wizard state so revisiting Step 2 shows completed audit)
  aiAuditResult: AiAuditResult | null;
  // Pre-selected audit id passed from the Audit detail drawer via URL param ?auditId=
  // Step2Audit reads this on mount to auto-select the audit in "Use Existing Audit" mode.
  preselectedAuditId: string | null;
  // Audit type label for display in Step 2 pre-select summary
  preselectedAuditType: string | null;
  // True when clientInfo was prefilled from the linked Opportunity on first open.
  // Used to show a non-blocking "Pre-filled from opportunity" banner in Step 1.
  opportunityPrefilled?: boolean;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProposalWizardProps {
  initialState?: Partial<ProposalWizardState>;
  onComplete?: (state: ProposalWizardState) => void;
  onSaveDraft?: (state: ProposalWizardState) => void;
  onExit?: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_PREFIX = "rtm-proposal-draft-";

// ─── API persistence helpers ──────────────────────────────────────────────────

/**
 * Persist the proposal to the API.  Returns true on success, false on failure.
 * Throws nothing: callers decide whether to surface the failure.
 */
async function saveProposalToApi(state: ProposalWizardState): Promise<boolean> {
  try {
    const res = await fetch("/api/sales-proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: state.wizardId,
        ...state,
        updatedAt: new Date().toISOString(),
      }),
    });
    return res.ok;
  } catch {
    // Network error — localStorage copy remains as fallback
    return false;
  }
}

async function loadProposalFromApi(wizardId: string): Promise<ProposalWizardState | null> {
  try {
    const res = await fetch("/api/sales-proposals");
    if (!res.ok) return null;
    const data = (await res.json()) as { records: (ProposalWizardState & { id: string })[] };
    const record = data.records.find((r) => r.id === wizardId);
    return record ?? null;
  } catch {
    return null;
  }
}

const WIZARD_STEPS = [
  { number: 1, label: "Client & Goals" },
  { number: 2, label: "Audit" },
  { number: 3, label: "Recommendations" },
  { number: 4, label: "Budget" },
  { number: 5, label: "Proposal Draft" },
];

// ─── Generate wizard ID ────────────────────────────────────────────────────────

function generateWizardId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `wizard-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Default state factory ────────────────────────────────────────────────────

function createDefaultState(wizardId: string): ProposalWizardState {
  return {
    wizardId,
    status: "draft",
    currentStep: 1,
    completedSteps: [],
    clientInfo: {
      name: "",
      businessName: "",
      industry: "",
      location: "",
      website: "",
      leadSource: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      notes: "",
    },
    selectedGoals: [],
    auditMode: null,
    selectedAuditId: null,
    auditResult: null,
    approvedRecommendations: [],
    approvedRecommendationServiceNames: [],
    lineItems: [],
    discountPercentage: 0,
    discount: {
      type: "none",
      value: 0,
      label: "",
      authorizationNote: "",
    },
    budgetResult: null,
    proposalDocument: null,
    lastSavedAt: null,
    intakeRecord: null,
    opportunityId: null,
    aiAuditResult: null,
    preselectedAuditId: null,
    preselectedAuditType: null,
    opportunityPrefilled: false,
  };
}

// ─── Step validation ──────────────────────────────────────────────────────────

function validateStep(step: number, state: ProposalWizardState): boolean {
  switch (step) {
    case 1: {
      const intakeRecord = state.intakeRecord as HomeServicesIntakeRecord | null;
      const flagged = intakeRecord?.flaggedForFollowUp === true;
      return (
        !flagged &&
        state.clientInfo.name.trim().length > 0 &&
        state.clientInfo.businessName.trim().length > 0 &&
        state.selectedGoals.length > 0
      );
    }
    case 2:
      return state.auditResult !== null;
    case 3:
      return state.approvedRecommendations.length > 0;
    case 4:
      return state.budgetResult !== null && state.lineItems.length > 0;
    case 5:
      return (
        state.proposalDocument !== null &&
        state.proposalDocument.completionPercentage >= 80
      );
    default:
      return false;
  }
}

// ─── Format timestamp ─────────────────────────────────────────────────────────

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProposalWizard({
  initialState,
  onComplete,
  onSaveDraft,
  onExit,
}: ProposalWizardProps) {
  // "save-failed" | "save-ok" | null — drives the non-blocking save-status banner
  const [saveAlert, setSaveAlert] = useState<"save-failed" | "save-ok" | null>(null);
  const saveAlertTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [state, setState] = useState<ProposalWizardState>(() => {
    const id = initialState?.wizardId ?? generateWizardId();

    // Read opportunityId from URL if present
    let urlOpportunityId: string | null = null;
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        urlOpportunityId = params.get("opportunityId");
      } catch {
        // Ignore
      }
    }

    // Attempt to load from localStorage
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(`${STORAGE_PREFIX}${id}`);
        if (saved) {
          const parsed = JSON.parse(saved) as ProposalWizardState;
          return {
            ...createDefaultState(id),
            ...parsed,
            opportunityId: urlOpportunityId ?? parsed.opportunityId ?? null,
          };
        }
      } catch {
        // Ignore parse errors
      }
    }

    return {
      ...createDefaultState(id),
      ...initialState,
      opportunityId: urlOpportunityId ?? initialState?.opportunityId ?? null,
    };
  });

  // Track whether the initial API hydration has run
  const apiHydrated = useRef(false);
  // Track whether the opportunity prefill has been attempted (run once only)
  const opportunityPrefillAttempted = useRef(false);
  // Resolved once the API hydration attempt completes (success or failure).
  // The prefill effect awaits this so it always runs AFTER hydration, making
  // the ordering deterministic: hydrate first, then fill any fields still empty.
  const hydrationDone = useRef<Promise<void>>(Promise.resolve());
  const resolveHydration = useRef<() => void>(() => { /* noop until effect sets real resolver */ });

  // On mount: attempt to load state from API (handles server-persisted drafts
  // and cross-device recovery). Merges API record over localStorage snapshot
  // so the newer record wins.
  //
  // ORDERING CONTRACT: hydrationDone resolves after this effect finishes
  // (whether the API call succeeded, returned nothing, or threw). The prefill
  // effect awaits hydrationDone so it always reads the post-hydration state.
  useEffect(() => {
    if (apiHydrated.current) return;
    apiHydrated.current = true;
    // Create the promise that the prefill effect will await.
    hydrationDone.current = new Promise<void>((resolve) => {
      resolveHydration.current = resolve;
    });
    void loadProposalFromApi(state.wizardId).then((apiRecord) => {
      if (!apiRecord) {
        resolveHydration.current();
        return;
      }
      const apiTime =
        apiRecord.lastSavedAt ??
        ((apiRecord as unknown as Record<string, string>).updatedAt ?? null);
      const localTime = state.lastSavedAt;
      if (apiTime && (!localTime || new Date(apiTime) > new Date(localTime))) {
        // Merge the API record, but preserve any opportunityId so the prefill
        // effect can still identify which opportunity to fetch.
        setState((prev) => ({
          ...prev,
          ...apiRecord,
          // Keep the opportunityId that was resolved at init time so the
          // prefill effect (which runs next) can still use it.
          opportunityId: prev.opportunityId ?? apiRecord.opportunityId ?? null,
        }));
      }
      resolveHydration.current();
    }).catch(() => {
      // Network error — still resolve so the prefill effect is not blocked.
      resolveHydration.current();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On mount: if opportunityId is set, fetch that opportunity and prefill any
  // clientInfo fields that are still empty.  Empty = the field is "".  Fields
  // that already have a value (from localStorage or from API hydration) are
  // NEVER overwritten — a rep returning to a draft keeps their edits.
  //
  // ORDERING CONTRACT: this effect awaits hydrationDone before touching state
  // so hydration always runs first.  Because we use functional setState the
  // comparison reads the post-hydration state, not the mount-time snapshot.
  //
  // Failure modes are all silent: no opportunityId, fetch error, 404, or any
  // thrown exception → the wizard opens exactly as it would without this effect.
  useEffect(() => {
    if (opportunityPrefillAttempted.current) return;
    opportunityPrefillAttempted.current = true;
    const oppId = state.opportunityId;
    if (!oppId) return;
    void (async () => {
      try {
        // Wait for API hydration to finish so we see the real saved state
        // before deciding which fields are empty.
        await hydrationDone.current;

        const res = await fetch("/api/sales-opportunities");
        if (!res.ok) return;
        const data = (await res.json()) as {
          records: {
            id: string;
            businessName?: string;
            contactName?: string;
            contactEmail?: string;
            contactPhone?: string;
            tradeType?: string;
            industry?: string;
            leadSource?: string;
            discoveryNotes?: string;
            website?: string;
            serviceInterest?: string[];
          }[];
        };
        const opp = data.records.find((r) => r.id === oppId);
        if (!opp) return;

        setState((prev) => {
          // Read clientInfo from the CURRENT state (post-hydration) so we
          // never overwrite a rep's real saved values.
          const ci = prev.clientInfo;
          const contactName = opp.contactName ?? "";
          const updated = {
            name:         ci.name         || contactName,
            businessName: ci.businessName || (opp.businessName ?? ""),
            industry:     ci.industry     || (opp.industry ?? opp.tradeType ?? ""),
            location:     ci.location,   // no Opportunity column — leave as-is
            website:      ci.website      || (opp.website ?? ""),
            leadSource:   ci.leadSource   || (opp.leadSource ?? ""),
            contactName:  ci.contactName  || contactName,
            contactEmail: ci.contactEmail || (opp.contactEmail ?? ""),
            contactPhone: ci.contactPhone || (opp.contactPhone ?? ""),
            notes:        ci.notes        || [
              (opp.discoveryNotes ?? ""),
              `Linked from opportunity ${oppId}`,
            ].filter(Boolean).join("\n"),
          };

          // Prefill serviceInterest into intakeRecord when the opportunity has it
          // and the saved intake does not already have a selection.
          const oppServices = opp.serviceInterest ?? [];
          const existingIntake = prev.intakeRecord as Record<string, unknown> | null;
          const existingServices = (existingIntake?.serviceInterest as string[] | undefined) ?? [];
          const updatedIntake =
            oppServices.length > 0 && existingServices.length === 0
              ? { ...(prev.intakeRecord ?? {}), serviceInterest: oppServices }
              : prev.intakeRecord;

          // If nothing actually changed, return prev to avoid a spurious re-render
          // and keep the banner hidden (nothing was prefilled).
          const anyChange = (Object.keys(updated) as (keyof typeof updated)[]).some(
            (k) => updated[k] !== ci[k as keyof typeof ci]
          ) || updatedIntake !== prev.intakeRecord;
          if (!anyChange) return prev;
          return {
            ...prev,
            clientInfo: updated,
            intakeRecord: updatedIntake,
            opportunityPrefilled: true,
          };
        });
      } catch {
        // Ignore all errors — wizard must open regardless
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Draft persistence ────────────────────────────────────────────

  const saveToDraft = useCallback((s: ProposalWizardState) => {
    if (typeof window === "undefined") return;
    const toSave: ProposalWizardState = {
      ...s,
      lastSavedAt: new Date().toISOString(),
    };
    // 1. localStorage (fast, synchronous, survives refresh without network)
    try {
      localStorage.setItem(
        `${STORAGE_PREFIX}${s.wizardId}`,
        JSON.stringify(toSave)
      );
    } catch {
      // Ignore storage quota errors
    }
    // 2. API (async, non-blocking, persists to server store).
    // On failure show a non-modal banner so the rep knows the cloud copy did
    // not save.  The local copy in localStorage remains as a fallback.
    void saveProposalToApi(toSave).then((ok) => {
      // Clear any previous auto-dismiss timer
      if (saveAlertTimer.current) clearTimeout(saveAlertTimer.current);
      if (ok) {
        setSaveAlert("save-ok");
      } else {
        setSaveAlert("save-failed");
      }
      // Auto-dismiss success after 3 s; keep failure visible until dismissed
      if (ok) {
        saveAlertTimer.current = setTimeout(() => setSaveAlert(null), 3000);
      }
    });
    return toSave;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (state.status !== "complete") {
        saveToDraft(state);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // ── State update ───────────────────────────────────────────────────────────

  function updateState(updates: Partial<ProposalWizardState>) {
    setState((prev) => ({ ...prev, ...updates, status: "in-progress" }));
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  function handleNext() {
    const currentValid = validateStep(state.currentStep, state);
    if (!currentValid) return;

    const nextStep = Math.min(state.currentStep + 1, 5) as 1 | 2 | 3 | 4 | 5;
    const completedSteps = Array.from(
      new Set([...state.completedSteps, state.currentStep])
    );

    const updated: ProposalWizardState = {
      ...state,
      currentStep: nextStep,
      completedSteps,
      status: "in-progress",
    };

    setState(updated);
    saveToDraft(updated);
  }

  function handleBack() {
    if (state.currentStep <= 1) return;
    const prevStep = (state.currentStep - 1) as 1 | 2 | 3 | 4 | 5;
    const updated: ProposalWizardState = { ...state, currentStep: prevStep };
    setState(updated);
    saveToDraft(updated);
  }

  function handleStepClick(step: number) {
    if (!state.completedSteps.includes(step)) return;
    const updated: ProposalWizardState = {
      ...state,
      currentStep: step as 1 | 2 | 3 | 4 | 5,
    };
    setState(updated);
    saveToDraft(updated);
  }

  function handleSaveDraft() {
    const saved = saveToDraft({ ...state, lastSavedAt: new Date().toISOString() });
    if (saved) {
      setState(saved);
      onSaveDraft?.(saved);
    }
  }

  function handleComplete() {
    const finalState: ProposalWizardState = {
      ...state,
      status: "complete",
      completedSteps: [1, 2, 3, 4, 5],
      lastSavedAt: new Date().toISOString(),
    };
    // Persist completed proposal to API store
    void saveProposalToApi(finalState);
    // Clear draft from localStorage (server record remains)
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(`${STORAGE_PREFIX}${state.wizardId}`);
      } catch {
        // Ignore
      }
    }
    setState(finalState);
    onComplete?.(finalState);
  }

  function handleExit() {
    saveToDraft(state);
    onExit?.();
  }

  // ── Step validity ──────────────────────────────────────────────────────────

  const currentStepValid = validateStep(state.currentStep, state);
  const isLastStep = state.currentStep === 5;
  const isFinalStepValid = validateStep(5, state);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: "var(--rtm-bg)" }}
    >
      {/* ── Sticky Header ────────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-30 border-b"
        style={{
          background: "var(--rtm-surface)",
          borderColor: "var(--rtm-border)",
        }}
      >
        {/* Top bar */}
        <div className="px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: "#059669" }}
            >
              Sales
            </p>
            <h1
              className="text-base font-bold"
              style={{ color: "var(--rtm-text-primary)" }}
            >
              New Proposal — Step {state.currentStep} of 5
              {state.clientInfo.businessName && (
                <span
                  className="ml-2 text-sm font-medium"
                  style={{ color: "var(--rtm-text-muted)" }}
                >
                  — {state.clientInfo.businessName}
                </span>
              )}
            </h1>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Draft status */}
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold px-2 py-1 rounded-full border"
                style={{
                  background:
                    state.status === "complete"
                      ? "#F0FDF4"
                      : state.status === "in-progress"
                      ? "#EFF6FF"
                      : "#F3F4F6",
                  color:
                    state.status === "complete"
                      ? "#15803D"
                      : state.status === "in-progress"
                      ? "#1D4ED8"
                      : "#6B7280",
                  borderColor:
                    state.status === "complete"
                      ? "#BBF7D0"
                      : state.status === "in-progress"
                      ? "#BFDBFE"
                      : "#D1D5DB",
                }}
              >
                {state.status === "complete"
                  ? "Complete"
                  : state.status === "in-progress"
                  ? "In Progress"
                  : "Draft"}
              </span>
              {state.lastSavedAt && (
                <span
                  className="text-[10px]"
                  style={{ color: "var(--rtm-text-muted)" }}
                >
                  Saved at {formatTimestamp(state.lastSavedAt)}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all hover:opacity-90"
              style={{
                background: "var(--rtm-surface)",
                borderColor: "var(--rtm-border)",
                color: "var(--rtm-text-secondary)",
              }}
            >
              Save Draft
            </button>

            <button
              type="button"
              onClick={handleExit}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all hover:opacity-90"
              style={{
                background: "#FFF1F2",
                borderColor: "#FECDD3",
                color: "#BE123C",
              }}
            >
              Exit
            </button>
          </div>
        </div>

        {/* Save-failure banner — non-modal, dismissible */}
        {saveAlert === "save-failed" && (
          <div
            className="mx-6 mb-2 px-4 py-2.5 rounded-lg border flex items-center justify-between gap-3"
            style={{ background: "#FFF1F2", borderColor: "#FECDD3" }}
          >
            <div className="flex items-center gap-2">
              <span
                className="text-sm font-black"
                style={{ color: "#BE123C" }}
              >
                ⚠️
              </span>
              <p className="text-xs font-semibold" style={{ color: "#BE123C" }}>
                Cloud save failed. Your work is saved locally in this browser. Log back in or check your connection and save again.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSaveAlert(null)}
              className="text-xs font-bold flex-shrink-0"
              style={{ color: "#BE123C" }}
              aria-label="Dismiss save error"
            >
              ×
            </button>
          </div>
        )}
        {saveAlert === "save-ok" && (
          <div
            className="mx-6 mb-2 px-4 py-2 rounded-lg border flex items-center gap-2"
            style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}
          >
            <span className="text-xs font-bold" style={{ color: "#15803D" }}>
              ✓ Saved
            </span>
          </div>
        )}

        {/* Step indicator */}
        <div className="px-6 pb-4">
          <WizardStepIndicator
            currentStep={state.currentStep}
            completedSteps={state.completedSteps}
            steps={WIZARD_STEPS}
            onStepClick={handleStepClick}
          />
        </div>
      </div>

      {/* ── Scrollable Step Content ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {state.currentStep === 1 && (
            <Step1ClientGoals state={state} onUpdate={updateState} />
          )}
          {state.currentStep === 2 && (
            <Step2Audit state={state} onUpdate={updateState} />
          )}
          {state.currentStep === 3 && (
            <Step3Recommendations state={state} onUpdate={updateState} />
          )}
          {state.currentStep === 4 && (
            <Step4Budget
              state={state}
              onUpdate={updateState}
              approvedServiceNames={state.approvedRecommendationServiceNames}
            />
          )}
          {state.currentStep === 5 && (
            <Step5ProposalDraft
              state={state}
              onUpdate={updateState}
              onSaveDraft={handleSaveDraft}
              onComplete={handleComplete}
            />
          )}
        </div>
      </div>

      {/* ── Sticky Footer ─────────────────────────────────────────────────── */}
      <div
        className="sticky bottom-0 z-30 border-t"
        style={{
          background: "var(--rtm-surface)",
          borderColor: "var(--rtm-border)",
        }}
      >
        <div className="px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={state.currentStep === 1}
              className="px-5 py-2.5 rounded-lg border text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "var(--rtm-surface)",
                borderColor: "var(--rtm-border)",
                color: "var(--rtm-text-secondary)",
              }}
            >
              Back
            </button>

            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-4 py-2.5 rounded-lg border text-sm font-semibold transition-all hover:opacity-90"
              style={{
                background: "var(--rtm-surface)",
                borderColor: "var(--rtm-border)",
                color: "var(--rtm-text-muted)",
              }}
            >
              Save Draft
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Validation hint */}
            {!currentStepValid && state.currentStep < 5 && (
              <p className="text-xs" style={{ color: "#C2410C" }}>
                {state.currentStep === 1
                  ? (state.intakeRecord as HomeServicesIntakeRecord | null)?.flaggedForFollowUp
                    ? "This intake is flagged for follow-up. Complete additional information before proceeding."
                    : "Complete client info and select at least one goal."
                  : state.currentStep === 2
                  ? "Complete the audit to continue."
                  : state.currentStep === 3
                  ? "Approve at least one recommendation."
                  : "Configure budget to continue."}
              </p>
            )}

            {isLastStep ? (
              <button
                type="button"
                onClick={handleComplete}
                disabled={!isFinalStepValid}
                className="px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "#059669" }}
              >
                Complete Proposal
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                disabled={!currentStepValid}
                className="px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "#1D4ED8" }}
              >
                Next: {WIZARD_STEPS[state.currentStep]?.label ?? "Continue"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
