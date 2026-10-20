// RTM OS — Proposal Wizard Required Fields Configuration
// ─────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for which wizard fields are required before advancing.
//
// A field is required if something downstream reads it and breaks or produces
// a bad record without it. Each entry names:
//   - stateKey: the key(s) on ProposalWizardState (or nested path) that carry
//               the value being checked
//   - label: the human-readable label shown in the blocking message
//   - check: a function that returns true when the field is SATISFIED (not empty)
//   - consumer: why it is required (for documentation)
//
// To change what is required, edit THIS file only. Do not touch form code.
// ─────────────────────────────────────────────────────────────────────────────

import type { ProposalWizardState } from "@/components/sales/proposal-wizard/ProposalWizard";
import type { HomeServicesIntakeRecord } from "@/lib/sales/types";

export interface RequiredFieldDef {
  /** Human-readable label shown in the blocking message */
  label: string;
  /** Short key for reference (not used in UI) */
  stateKey: string;
  /**
   * Returns true when the field is satisfied (non-empty / valid).
   * The check receives the full wizard state.
   */
  check: (state: ProposalWizardState) => boolean;
  /**
   * Which downstream consumer makes this required, and what concretely
   * breaks without it. Documentation only — not rendered in UI.
   */
  consumer: string;
}

// ─── Step 1: Client & Goals ───────────────────────────────────────────────────
//
// Consumers:
//   buildContractFromProposal → reads clientInfo.businessName for clientName / businessName.
//     Empty → contract has clientName "Unknown Client", Billing cannot identify client.
//   buildContractFromProposal → reads clientInfo.contactName for the contact clause.
//     Empty → contract contact clause is blank, cannot send to client.
//   validateStep(1) already checks businessName, contactName, and selectedGoals;
//   those three are therefore already functional gates. We formalise them here
//   and add tradeType, which the intake audit engine reads to generate
//   keyword suggestions and citations — without it the audit produces generic
//   (wrong) results that flow through to recommendations and the contract.

export const STEP_1_REQUIRED: RequiredFieldDef[] = [
  {
    label: "Business Name",
    stateKey: "intakeRecord.businessName",
    check: (s) => {
      const ir = s.intakeRecord as HomeServicesIntakeRecord | null;
      return Boolean(
        (ir?.businessName ?? "").trim() ||
        s.clientInfo.businessName.trim()
      );
    },
    consumer:
      "buildContractFromProposal reads clientInfo.businessName. " +
      "Empty → contract clientName becomes 'Unknown Client'.",
  },
  {
    label: "Trade / Service Type",
    stateKey: "intakeRecord.tradeType",
    check: (s) => {
      const ir = s.intakeRecord as HomeServicesIntakeRecord | null;
      return Boolean((ir?.tradeType ?? "").trim());
    },
    consumer:
      "runIntakeAudit reads tradeType to generate keyword suggestions " +
      "and citation targets. Empty → audit produces trade-agnostic results " +
      "that make recommendations wrong.",
  },
  {
    label: "Contact Name",
    stateKey: "intakeRecord.contactName",
    check: (s) => {
      const ir = s.intakeRecord as HomeServicesIntakeRecord | null;
      return Boolean(
        (ir?.contactName ?? "").trim() ||
        s.clientInfo.contactName.trim() ||
        s.clientInfo.name.trim()
      );
    },
    consumer:
      "buildContractFromProposal reads clientInfo.contactName for the " +
      "cover and signatures clauses. Empty → contract contact is blank.",
  },
  {
    label: "Primary Goals",
    stateKey: "selectedGoals",
    check: (s) => {
      const ir = s.intakeRecord as HomeServicesIntakeRecord | null;
      return (
        s.selectedGoals.length > 0 ||
        (ir?.primaryGoals?.length ?? 0) > 0
      );
    },
    consumer:
      "getSectionsForGoals in the audit engine filters which sections to " +
      "run. Empty goals → audit runs no sections → zero findings → " +
      "recommendation engine returns nothing → Step 3 shows 'no recs'.",
  },
];

// ─── Step 2: Audit ─────────────────────────────────────────────────────────────
//
// Consumer: validateStep(2) already requires state.auditResult !== null.
// No additional fields are required here beyond what the step produces.
// The audit result itself is the gate; the form fields that feed into it
// (audit mode selection, existing audit selection) are enforced by the step
// not producing an auditResult until they are complete.

export const STEP_2_REQUIRED: RequiredFieldDef[] = [
  {
    label: "Audit Result",
    stateKey: "auditResult",
    check: (s) => s.auditResult !== null,
    consumer:
      "generateRecommendationsFromAudit in Step 3 requires a non-null " +
      "AuditResult. Without it Step 3 shows an empty state and no " +
      "recommendations are produced.",
  },
];

// ─── Step 3: Recommendations ──────────────────────────────────────────────────
//
// Consumer: validateStep(3) already requires approvedRecommendations.length > 0.
// Step 4 gates on this too (shows 'return to Step 3' message when empty).

export const STEP_3_REQUIRED: RequiredFieldDef[] = [
  {
    label: "Approved Recommendations",
    stateKey: "approvedRecommendations",
    check: (s) => s.approvedRecommendations.length > 0,
    consumer:
      "buildLineItemFromService is called for each approved recommendation " +
      "in Step 4. Empty → no line items → budgetResult is null → " +
      "Step 5 shows 'Complete Step 4 before building proposal draft'.",
  },
];

// ─── Step 4: Budget ───────────────────────────────────────────────────────────
//
// Consumers:
//   buildContractFromProposal reads budgetResult.totalMonthly for monthlyValue.
//     Empty → monthlyValue is "TBD", services clause has no dollar figure.
//   buildContractFromProposal reads lineItems for the line-items table in the
//     contract and the handoff. Empty → contract and handoff show no line items.
//   buildHandoffRecord copies lineItems into handoff.lineItems.
//     Billing reads these to verify services. Empty → Billing cannot verify.
//   termLengthMonths is derived from proposal.contract.term by
//     buildContractFromProposal and stored in the contract row. Null when
//     month-to-month, but that is a valid value, not a missing one.
//   The budget step's own computeBudget produces budgetResult; validateStep(4)
//   already requires budgetResult !== null && lineItems.length > 0.

export const STEP_4_REQUIRED: RequiredFieldDef[] = [
  {
    label: "Budget Result",
    stateKey: "budgetResult",
    check: (s) => s.budgetResult !== null && s.lineItems.length > 0,
    consumer:
      "buildContractFromProposal reads budgetResult.totalMonthly for " +
      "monthlyValue and investmentSummary. Null → contract shows 'TBD' " +
      "with no dollar figure. lineItems empty → contract and handoff " +
      "line-item tables are blank; Billing cannot verify services.",
  },
];

// ─── Step 5: Proposal Draft ───────────────────────────────────────────────────
//
// Consumer: validateStep(5) requires proposalDocument !== null &&
//   completionPercentage >= 80. That is the gate; no additional fields here.

export const STEP_5_REQUIRED: RequiredFieldDef[] = [
  {
    label: "Proposal Document",
    stateKey: "proposalDocument",
    check: (s) =>
      s.proposalDocument !== null &&
      s.proposalDocument.completionPercentage >= 80,
    consumer:
      "handleComplete in ProposalWizard calls onComplete with the final " +
      "state. A proposal with completionPercentage < 80 has incomplete " +
      "sections that the proposal builder marks as empty — the client " +
      "receives a partially-blank document.",
  },
];

// ─── Master lookup by step ────────────────────────────────────────────────────

export const REQUIRED_BY_STEP: Record<number, RequiredFieldDef[]> = {
  1: STEP_1_REQUIRED,
  2: STEP_2_REQUIRED,
  3: STEP_3_REQUIRED,
  4: STEP_4_REQUIRED,
  5: STEP_5_REQUIRED,
};

// ─── Validation helper ─────────────────────────────────────────────────────────

/**
 * Returns the labels of all required fields on the given step that are not
 * satisfied by the current wizard state.
 *
 * Returns an empty array when all required fields are satisfied (step is clear).
 */
export function getMissingRequiredFields(
  step: number,
  state: ProposalWizardState
): string[] {
  const defs = REQUIRED_BY_STEP[step] ?? [];
  return defs
    .filter((def) => !def.check(state))
    .map((def) => def.label);
}
