// RTM OS — Sales Proposal Builder Configuration
// ─────────────────────────────────────────────────────────────────────────────
// All proposal section definitions, status values, default content, template
// structure, and status display labels/colors live here exclusively.
//
// Source of truth: Settings → Proposal Templates → Proposal Rules → Service Catalog
// Zero business literals belong in any .tsx file.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Section Identity ─────────────────────────────────────────────────────────

export type ProposalSectionId =
  | "cover"
  | "executive-summary"
  | "goals"
  | "audit-findings"
  | "recommended-services"
  | "investment"
  | "timeline"
  | "terms"
  | "next-steps";

// ─── Proposal Status ──────────────────────────────────────────────────────────

export type ProposalBuilderStatus =
  | "draft"
  | "in-review"
  | "needs-pricing"
  | "needs-approval"
  | "ready"
  | "sent"
  | "accepted"
  | "declined";

// ─── Section Status ───────────────────────────────────────────────────────────

export type ProposalSectionStatus =
  | "empty"
  | "draft"
  | "complete"
  | "locked";

// ─── Section Definition ───────────────────────────────────────────────────────

export interface ProposalSectionDefinition {
  id: ProposalSectionId;
  label: string;
  description: string;
  required: boolean;
  defaultContent: string;
  editable: boolean;
  order: number;
}

// ─── Section Catalog ─────────────────────────────────────────────────────────

export const PROPOSAL_SECTIONS: ProposalSectionDefinition[] = [
  {
    id: "cover",
    label: "Cover Page",
    description:
      "Client-facing cover page including client name, prepared by, and proposal date.",
    required: true,
    defaultContent: "",
    editable: true,
    order: 1,
  },
  {
    id: "executive-summary",
    label: "Executive Summary",
    description:
      "High-level overview of the engagement, value proposition, and expected outcomes.",
    required: true,
    defaultContent:
      "This proposal outlines a tailored digital marketing strategy designed to address your business goals and drive measurable results. Our team has analyzed your current position and identified key opportunities to accelerate growth, improve visibility, and maximize your return on investment.",
    editable: true,
    order: 2,
  },
  {
    id: "goals",
    label: "Client Goals",
    description:
      "Auto-populated from the audit goal selection. Reflects the client's stated primary business objectives.",
    required: true,
    defaultContent:
      "This section is auto-populated from the goal selection completed during the sales intake and audit workflow.",
    editable: false,
    order: 3,
  },
  {
    id: "audit-findings",
    label: "Audit Findings",
    description:
      "Auto-populated from the audit engine output. Summarizes critical and high-priority findings.",
    required: true,
    defaultContent:
      "This section is auto-populated from the audit results generated during the diagnostic workflow.",
    editable: false,
    order: 4,
  },
  {
    id: "recommended-services",
    label: "Recommended Services",
    description:
      "Auto-populated from the recommendation engine output. Lists services matched to audit findings and client goals.",
    required: true,
    defaultContent:
      "This section is auto-populated from the recommendation engine based on audit findings and client goals.",
    editable: false,
    order: 5,
  },
  {
    id: "investment",
    label: "Investment Summary",
    description:
      "Auto-populated from the budget optimizer output. Includes monthly fees, setup fees, and total contract value.",
    required: true,
    defaultContent:
      "This section is auto-populated from the budget optimizer output.",
    editable: false,
    order: 6,
  },
  {
    id: "timeline",
    label: "Proposed Timeline",
    description:
      "Outlines the onboarding phases and key milestones for the engagement.",
    required: true,
    defaultContent:
      "Days 1–30: Onboarding, access provisioning, account setup, and initial audits.\n\nDays 31–60: Campaign launch, baseline reporting established, initial optimizations.\n\nDays 61–90: Performance review, strategy refinement, expansion of active workstreams.",
    editable: true,
    order: 7,
  },
  {
    id: "terms",
    label: "Terms and Conditions",
    description:
      "Standard terms and conditions governing this engagement. Locked — not editable by sales representatives.",
    required: true,
    defaultContent:
      "Standard terms and conditions apply. This proposal is subject to the master service agreement on file. Pricing is valid for 30 days from the proposal date. Services begin upon receipt of a signed contract and initial payment. All fees are non-refundable after campaign launch unless otherwise specified in the contract.",
    editable: false,
    order: 8,
  },
  {
    id: "next-steps",
    label: "Next Steps",
    description:
      "Defines the immediate actions required to move the engagement forward.",
    required: true,
    defaultContent:
      "1. Review this proposal and confirm service selection.\n2. Sign the contract and return to your account representative.\n3. Complete the onboarding intake form.\n4. Provide access credentials as outlined in the access checklist.\n5. Schedule your kickoff call with the team.",
    editable: true,
    order: 9,
  },
];

// ─── Status Labels ────────────────────────────────────────────────────────────

export const PROPOSAL_STATUS_LABELS: Record<ProposalBuilderStatus, string> = {
  "draft": "Draft",
  "in-review": "In Review",
  "needs-pricing": "Needs Pricing",
  "needs-approval": "Needs Approval",
  "ready": "Ready to Send",
  "sent": "Sent",
  "accepted": "Accepted",
  "declined": "Declined",
};

// ─── Status Colors (semantic tokens only) ────────────────────────────────────

export const PROPOSAL_STATUS_COLORS: Record<
  ProposalBuilderStatus,
  { bg: string; text: string; border: string }
> = {
  "draft":          { bg: "#F3F4F6", text: "#6B7280",  border: "#D1D5DB" },
  "in-review":      { bg: "#FFF7ED", text: "#C2410C",  border: "#FED7AA" },
  "needs-pricing":  { bg: "#FFFBEB", text: "#92400E",  border: "#FDE68A" },
  "needs-approval": { bg: "#FFFBEB", text: "#92400E",  border: "#FDE68A" },
  "ready":          { bg: "#F0FDF4", text: "#15803D",  border: "#BBF7D0" },
  "sent":           { bg: "#EFF6FF", text: "#1D4ED8",  border: "#BFDBFE" },
  "accepted":       { bg: "#F0FDF4", text: "#047857",  border: "#A7F3D0" },
  "declined":       { bg: "#FFF1F2", text: "#BE123C",  border: "#FECDD3" },
};

// ─── Template Definition ──────────────────────────────────────────────────────

export interface ProposalTemplateDefinition {
  id: string;
  label: string;
  description: string;
  sections: ProposalSectionId[];
}

// ─── Template Catalog ─────────────────────────────────────────────────────────

export const PROPOSAL_TEMPLATES: ProposalTemplateDefinition[] = [
  {
    id: "standard",
    label: "Standard Proposal",
    description:
      "Full proposal with all nine sections. Suitable for new client engagements and comprehensive service packages.",
    sections: [
      "cover",
      "executive-summary",
      "goals",
      "audit-findings",
      "recommended-services",
      "investment",
      "timeline",
      "terms",
      "next-steps",
    ],
  },
  {
    id: "quick",
    label: "Quick Proposal",
    description:
      "Condensed proposal for existing clients or straightforward upsell engagements.",
    sections: [
      "cover",
      "recommended-services",
      "investment",
      "next-steps",
    ],
  },
];
