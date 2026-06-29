// RTM OS — Sales Proposal Engine
// ─────────────────────────────────────────────────────────────────────────────
// Pure functions only. No React. No UI imports.
// Consumes proposal-config.ts to assemble and mutate ProposalDocument objects.
// ─────────────────────────────────────────────────────────────────────────────

import {
  PROPOSAL_SECTIONS,
  PROPOSAL_TEMPLATES,
  ProposalSectionId,
  ProposalBuilderStatus,
  ProposalSectionStatus,
} from "./proposal-config";

// ─── Proposal Section ─────────────────────────────────────────────────────────

export interface ProposalSection {
  id: ProposalSectionId;
  label: string;
  content: string;
  status: ProposalSectionStatus;
  editable: boolean;
  order: number;
}

// ─── Proposal Document ────────────────────────────────────────────────────────

export interface ProposalDocument {
  id: string;
  clientName: string;
  preparedBy: string;
  createdAt: string;
  status: ProposalBuilderStatus;
  templateId: string;
  sections: ProposalSection[];
  completionPercentage: number;
  readyForSend: boolean;
}

// ─── Context passed in from upstream workflow stages ─────────────────────────

export interface ProposalBuildContext {
  goals?: string[];
  auditSummary?: string;
  recommendedServices?: string[];
  budgetSummary?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return `prop-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isoNow(): string {
  return new Date().toISOString();
}

/**
 * Compute what content an auto-populated section should receive from context.
 * Returns undefined when no context value is available for the section.
 */
function contextContentFor(
  sectionId: ProposalSectionId,
  context: ProposalBuildContext
): string | undefined {
  switch (sectionId) {
    case "goals":
      if (context.goals && context.goals.length > 0) {
        return context.goals
          .map((g, i) => `${i + 1}. ${g}`)
          .join("\n");
      }
      return undefined;

    case "audit-findings":
      return context.auditSummary ?? undefined;

    case "recommended-services":
      if (context.recommendedServices && context.recommendedServices.length > 0) {
        return context.recommendedServices
          .map((s, i) => `${i + 1}. ${s}`)
          .join("\n");
      }
      return undefined;

    case "investment":
      return context.budgetSummary ?? undefined;

    default:
      return undefined;
  }
}

// ─── Build from Template ──────────────────────────────────────────────────────

/**
 * Builds a blank ProposalDocument from a named template.
 * All sections are set to "empty" status.
 */
export function buildProposalFromTemplate(
  templateId: string,
  clientName: string,
  preparedBy: string
): ProposalDocument {
  const template =
    PROPOSAL_TEMPLATES.find((t) => t.id === templateId) ??
    PROPOSAL_TEMPLATES.find((t) => t.id === "standard")!;

  const sections: ProposalSection[] = template.sections
    .map((sectionId) => {
      const def = PROPOSAL_SECTIONS.find((s) => s.id === sectionId);
      if (!def) return null;
      return {
        id: def.id,
        label: def.label,
        content: def.defaultContent,
        status: "empty" as ProposalSectionStatus,
        editable: def.editable,
        order: def.order,
      };
    })
    .filter((s): s is ProposalSection => s !== null)
    .sort((a, b) => a.order - b.order);

  const doc: ProposalDocument = {
    id: generateId(),
    clientName,
    preparedBy,
    createdAt: isoNow(),
    status: "draft",
    templateId: template.id,
    sections,
    completionPercentage: 0,
    readyForSend: false,
  };

  return doc;
}

// ─── Build with Upstream Context ─────────────────────────────────────────────

/**
 * Builds a ProposalDocument pre-populated from upstream workflow data.
 * Auto-populated non-editable sections are set to "complete".
 * Editable sections with default content are set to "draft".
 */
export function buildProposalWithContext(
  templateId: string,
  clientName: string,
  preparedBy: string,
  context: ProposalBuildContext
): ProposalDocument {
  const base = buildProposalFromTemplate(templateId, clientName, preparedBy);

  const sections = base.sections.map((section): ProposalSection => {
    if (!section.editable) {
      // Non-editable section — attempt to populate from context
      const contextContent = contextContentFor(section.id, context);
      if (contextContent) {
        return {
          ...section,
          content: contextContent,
          status: "complete",
        };
      }
      // No context available — leave as empty, show placeholder
      return {
        ...section,
        status: "empty",
      };
    }

    // Editable section — mark as draft if it has any content
    return {
      ...section,
      status: section.content.length > 0 ? "draft" : "empty",
    };
  });

  const completionPercentage = computeProposalCompletion(sections);
  const readyForSend = computeReadyForSend(sections);

  return {
    ...base,
    sections,
    completionPercentage,
    readyForSend,
  };
}

// ─── Update Section ───────────────────────────────────────────────────────────

/**
 * Returns a new ProposalDocument with the target section updated.
 * Recomputes completion and readiness. Never mutates input.
 */
export function updateProposalSection(
  proposal: ProposalDocument,
  sectionId: ProposalSectionId,
  content: string
): ProposalDocument {
  const sections = proposal.sections.map((section): ProposalSection => {
    if (section.id !== sectionId) return section;

    const status: ProposalSectionStatus =
      content.trim().length === 0 ? "empty" : "complete";

    return { ...section, content, status };
  });

  const completionPercentage = computeProposalCompletion(sections);
  const readyForSend = computeReadyForSend(sections);

  return {
    ...proposal,
    sections,
    completionPercentage,
    readyForSend,
  };
}

// ─── Completion ───────────────────────────────────────────────────────────────

/**
 * Returns the percentage of required sections that are complete.
 */
export function computeProposalCompletion(sections: ProposalSection[]): number {
  const requiredDefs = PROPOSAL_SECTIONS.filter((d) => d.required);
  const requiredIds = new Set(requiredDefs.map((d) => d.id));

  const requiredSections = sections.filter((s) => requiredIds.has(s.id));
  if (requiredSections.length === 0) return 0;

  const completeSections = requiredSections.filter(
    (s) => s.status === "complete" || s.status === "locked"
  );

  return Math.round((completeSections.length / requiredSections.length) * 100);
}

// ─── Ready For Send ───────────────────────────────────────────────────────────

/**
 * Returns true only when all required sections present in the proposal are complete.
 */
export function computeReadyForSend(sections: ProposalSection[]): boolean {
  const requiredDefs = PROPOSAL_SECTIONS.filter((d) => d.required);
  const requiredIds = new Set(requiredDefs.map((d) => d.id));

  const requiredSections = sections.filter((s) => requiredIds.has(s.id));
  if (requiredSections.length === 0) return false;

  return requiredSections.every(
    (s) => s.status === "complete" || s.status === "locked"
  );
}

// ─── Reorder Section ──────────────────────────────────────────────────────────

/**
 * Moves an editable section up or down relative to its neighbors.
 * Returns a new ProposalDocument without mutating the input.
 */
export function reorderSection(
  proposal: ProposalDocument,
  sectionId: ProposalSectionId,
  direction: string
): ProposalDocument {
  const sorted = [...proposal.sections].sort((a, b) => a.order - b.order);
  const index = sorted.findIndex((s) => s.id === sectionId);

  if (index === -1) return proposal;

  const section = sorted[index];
  if (!section.editable) return proposal;

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= sorted.length) return proposal;

  // Swap order values
  const updatedSections = sorted.map((s, i): ProposalSection => {
    if (i === index) {
      return { ...s, order: sorted[targetIndex].order };
    }
    if (i === targetIndex) {
      return { ...s, order: sorted[index].order };
    }
    return s;
  });

  return {
    ...proposal,
    sections: updatedSections.sort((a, b) => a.order - b.order),
  };
}
