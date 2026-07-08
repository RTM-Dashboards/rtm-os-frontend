// ─────────────────────────────────────────────────────────────────────────────
// lib/mock/am-onboarding-field-schema.ts
//
// CONFIG-READY FIELD SCHEMA for the AM Onboarding Intake Form.
//
// WHY THIS FILE EXISTS
// ─────────────────────
// The AM Onboarding form is a COLLABORATIVE form: for each field, the AM either
// fills it in directly or marks it "Send to Client." To make this work without
// hardcoding field-by-field JSX, every field is defined here as a typed schema
// entry. The form renders FROM this array — it never has hardcoded fields.
//
// FUTURE ADMIN CONFIGURABILITY
// ──────────────────────────────
// This array is the SINGLE PLACE to add, remove, reorder, or change fields.
// When a real admin configuration UI exists (see /settings/form-builder and
// /settings/client-intake-forms — currently "planned" stubs), replace the
// static export below with a live fetch from that system. The form's rendering
// logic in page.tsx does NOT need to change — it reads this schema.
//
// HOW TO WIRE TO A REAL CONFIG SYSTEM (future step):
//   1. Create an async loader: `async function loadOnboardingFieldSchema()`
//   2. Replace the static ONBOARDING_FIELD_SCHEMA export with that loader's output
//   3. No other file needs to change
//
// ─────────────────────────────────────────────────────────────────────────────

// ── Field Types ───────────────────────────────────────────────────────────────

export type OnboardingFieldType =
  | "text"
  | "email"
  | "phone"
  | "url"
  | "date"
  | "select"
  | "multiselect"
  | "textarea"
  | "checkbox"
  | "number";

/**
 * Who "owns" this field by default when the record is first created.
 * - "am":     AM is expected to fill this in (they likely know the answer from
 *             Sales handoff data or their own knowledge).
 * - "client": AM likely does NOT know the answer — the default suggestion is to
 *             send it to the client for completion.
 *
 * This is only a DEFAULT. AM can override on a per-field basis for any record.
 */
export type FieldDefaultAssignee = "am" | "client";

/**
 * Which Sales prefill key (on SalesPrefillData) contains a starting value for
 * this field, if any. When set, the form pre-populates the field value with
 * that data as a suggestion AM can confirm, edit, or override.
 *
 * Keyed on SalesPrefillData property names.
 */
export type SalesPrefillKey =
  | "clientName"
  | "email"
  | "industry"
  | "salesOwner"
  | "referralSource"
  | "affiliateName"
  | "monthlyValue"
  | "primaryContact"
  | "phone"
  | "website"
  | "location"
  | "businessSize"
  | "intakeSource"
  | "selectedGoals"
  | "discoveryNotes";

// ── Field Definition ──────────────────────────────────────────────────────────

export interface AMOnboardingFieldDef {
  /** Stable unique id for this field — used as key in FieldAssignment map */
  id: string;

  /** Human-readable label shown in the form */
  label: string;

  /** Longer helper text shown below the field */
  description?: string;

  /** Input type that drives how the field renders */
  type: OnboardingFieldType;

  /** Whether a value is required before the form can be marked Complete */
  required: boolean;

  /**
   * Which SalesPrefillData key can seed this field's initial value.
   * If set and the Sales prefill has a non-empty value, it will appear as a
   * pre-populated suggestion when the AM opens the form.
   */
  salesPrefillKey?: SalesPrefillKey;

  /**
   * Default assignee when the record is first created.
   * "am"     → pre-fill this field's assignment as "am-filling"
   * "client" → pre-fill this field's assignment as "pending-client"
   *
   * AM can always flip either direction on a per-field basis.
   */
  defaultAssignee: FieldDefaultAssignee;

  /** For select / multiselect fields: the list of allowed options */
  options?: string[];

  /** Input placeholder text */
  placeholder?: string;

  /**
   * Logical section grouping for display purposes.
   * The form renders fields grouped by section.
   */
  section:
    | "client-basics"
    | "engagement-setup"
    | "service-delivery"
    | "client-assets"
    | "am-internal";
}

// ── Section Metadata ──────────────────────────────────────────────────────────

export interface AMOnboardingSection {
  id: AMOnboardingFieldDef["section"];
  label: string;
  description: string;
}

export const ONBOARDING_SECTIONS: AMOnboardingSection[] = [
  {
    id: "client-basics",
    label: "Client Basics",
    description:
      "Core contact and identity information. Many values are pre-filled from Sales — AM confirms or supplements.",
  },
  {
    id: "engagement-setup",
    label: "Engagement Setup",
    description:
      "Scheduling, contract terms, and communication preferences. AM fills most of these from the Sales handoff.",
  },
  {
    id: "service-delivery",
    label: "Service Delivery",
    description:
      "Details needed to kick off and deliver contracted services.",
  },
  {
    id: "client-assets",
    label: "Client Assets & Access",
    description:
      "Assets and credentials that only the client can provide. Default assignee is 'Send to Client' for all fields here.",
  },
  {
    id: "am-internal",
    label: "AM Internal Notes",
    description:
      "Internal-only context for the account team. Not visible to the client.",
  },
];

// ── Field Schema ──────────────────────────────────────────────────────────────
//
// CHANGE LOG:
//   - Initial schema: covers all fields from the prior hardcoded Layer 2 (AM)
//     and Layer 3 (Client Pending) sections, plus key Sales prefill fields that
//     AM should confirm.
//   - To add a field: append a new entry to this array. The form renders from it.
//   - To reorder: change the order in the array — sections are rendered in the
//     order fields appear (grouped by `section`).
//   - To remove a field: remove the entry. Any stored FieldAssignment for that
//     fieldId becomes orphaned (safe — it's just not rendered).
//   - To change a field type: update `type` here. If stored values exist, they
//     will be treated as strings (safe for display, may need migration for strict
//     validation).

export const ONBOARDING_FIELD_SCHEMA: AMOnboardingFieldDef[] = [
  // ── CLIENT BASICS ─────────────────────────────────────────────────────────

  {
    id: "clientName",
    label: "Client / Business Name",
    type: "text",
    required: true,
    salesPrefillKey: "clientName",
    defaultAssignee: "am",
    section: "client-basics",
    placeholder: "Business name",
  },
  {
    id: "primaryContact",
    label: "Primary Contact Name",
    type: "text",
    required: true,
    salesPrefillKey: "primaryContact",
    defaultAssignee: "am",
    section: "client-basics",
    placeholder: "e.g. Jane Smith",
    description: "The main point of contact AM will work with day-to-day.",
  },
  {
    id: "email",
    label: "Email Address",
    type: "email",
    required: true,
    salesPrefillKey: "email",
    defaultAssignee: "am",
    section: "client-basics",
    placeholder: "client@example.com",
  },
  {
    id: "phone",
    label: "Phone Number",
    type: "phone",
    required: false,
    salesPrefillKey: "phone",
    defaultAssignee: "am",
    section: "client-basics",
    placeholder: "(555) 555-5555",
  },
  {
    id: "website",
    label: "Website URL",
    type: "url",
    required: false,
    salesPrefillKey: "website",
    defaultAssignee: "am",
    section: "client-basics",
    placeholder: "https://www.example.com",
  },
  {
    id: "industry",
    label: "Industry",
    type: "select",
    required: true,
    salesPrefillKey: "industry",
    defaultAssignee: "am",
    section: "client-basics",
    options: [
      "Dental", "Medical / Healthcare", "Legal", "Home Services", "Automotive",
      "Real Estate", "Fitness / Wellness", "Restaurant / Food", "E-Commerce",
      "Financial Services", "Education", "Roofing / Exterior",
      "HVAC / Plumbing / Electrical", "Cleaning Services", "Veterinary",
      "Landscaping", "Construction", "Retail", "Technology / SaaS", "Other",
    ],
    description: "Industry category from the Sales intake.",
  },
  {
    id: "location",
    label: "Business Location",
    type: "text",
    required: false,
    salesPrefillKey: "location",
    defaultAssignee: "am",
    section: "client-basics",
    placeholder: "City, State",
  },
  {
    id: "businessSize",
    label: "Business Size",
    type: "select",
    required: false,
    salesPrefillKey: "businessSize",
    defaultAssignee: "am",
    section: "client-basics",
    options: [
      "Solo / 1 person", "2–5 employees", "6–15 employees",
      "16–50 employees", "51–150 employees", "150+ employees",
    ],
  },

  // ── ENGAGEMENT SETUP ──────────────────────────────────────────────────────

  {
    id: "assignedAM",
    label: "Assigned Account Manager",
    type: "text",
    required: true,
    defaultAssignee: "am",
    section: "engagement-setup",
    placeholder: "Account Manager name",
    description: "The AM responsible for this client relationship.",
  },
  {
    id: "kickoffCallDate",
    label: "Kickoff Call Date",
    type: "date",
    required: false,
    defaultAssignee: "am",
    section: "engagement-setup",
    description: "Scheduled date for the onboarding kickoff call.",
  },
  {
    id: "serviceStartTargetDate",
    label: "Target Service Start Date",
    type: "date",
    required: false,
    defaultAssignee: "am",
    section: "engagement-setup",
    description: "When delivery is expected to begin.",
  },
  {
    id: "contractTermMonths",
    label: "Contract Term",
    type: "select",
    required: false,
    defaultAssignee: "am",
    section: "engagement-setup",
    options: ["1", "3", "6", "12", "24"],
    description: "Contract length in months.",
  },
  {
    id: "preferredContactMethod",
    label: "Preferred Contact Method",
    type: "select",
    required: false,
    defaultAssignee: "am",
    section: "engagement-setup",
    options: ["Email", "Phone Call", "Text Message", "Slack", "Zoom"],
    description:
      "How the client prefers to communicate. AM can confirm from Sales notes or send to client.",
  },
  {
    id: "internalPriority",
    label: "Internal Priority",
    type: "select",
    required: false,
    defaultAssignee: "am",
    section: "engagement-setup",
    options: ["High", "Medium", "Low"],
    description: "AM-assigned priority for internal resource planning.",
  },

  // ── SERVICE DELIVERY ──────────────────────────────────────────────────────

  {
    id: "accessCredentialsReceived",
    label: "Access Credentials Received",
    type: "checkbox",
    required: false,
    defaultAssignee: "am",
    section: "service-delivery",
    description:
      "Check once the client has provided login access to all required platforms.",
  },
  {
    id: "targetAudience",
    label: "Target Audience Description",
    type: "textarea",
    required: false,
    defaultAssignee: "client",
    section: "service-delivery",
    placeholder: "Describe the ideal customer: demographics, geography, services sought…",
    description:
      "Who is the ideal customer? Only the client can fully answer this — send to client unless AM knows from discovery.",
  },
  {
    id: "uniqueSellingPoints",
    label: "Unique Selling Points / Differentiators",
    type: "textarea",
    required: false,
    defaultAssignee: "client",
    section: "service-delivery",
    placeholder: "What sets this business apart? Awards, certifications, guarantees, specialties…",
    description:
      "What makes the client stand out from competitors. Typically requires client input.",
  },
  {
    id: "competitorNames",
    label: "Top Competitors",
    type: "textarea",
    required: false,
    defaultAssignee: "client",
    section: "service-delivery",
    placeholder: "2–4 competitor names or websites…",
    description:
      "Direct local competitors AM should be aware of. Client usually knows these best.",
  },
  {
    id: "reviewProfiles",
    label: "Review Profile Links",
    type: "textarea",
    required: false,
    defaultAssignee: "client",
    section: "service-delivery",
    placeholder: "Google, Yelp, Facebook, or other review profile URLs…",
    description:
      "Links to review profiles — client needs to confirm ownership and provide links.",
  },
  {
    id: "preferredKickoffTime",
    label: "Preferred Kickoff Call Availability",
    type: "textarea",
    required: false,
    defaultAssignee: "client",
    section: "service-delivery",
    placeholder: "3–5 available time slots with timezone…",
    description:
      "Client's available time slots for the kickoff call. Send to client unless already scheduled.",
  },

  // ── CLIENT ASSETS ─────────────────────────────────────────────────────────

  {
    id: "accountsAndLogins",
    label: "Accounts & Login Access",
    type: "textarea",
    required: false,
    defaultAssignee: "client",
    section: "client-assets",
    placeholder:
      "Access credentials or invitations to: Google Business Profile, ad accounts, website CMS, analytics…",
    description:
      "Platform credentials only the client can provide. This field should almost always be sent to the client.",
  },
  {
    id: "brandKit",
    label: "Brand Kit",
    type: "textarea",
    required: false,
    defaultAssignee: "client",
    section: "client-assets",
    placeholder: "Logo files (SVG/PNG), hex colors, fonts, brand guidelines…",
    description:
      "Logo, brand colors, fonts, and usage guidelines. Client asset — send to client.",
  },

  // ── AM INTERNAL ───────────────────────────────────────────────────────────

  {
    id: "onboardingNotes",
    label: "Onboarding Notes",
    type: "textarea",
    required: false,
    defaultAssignee: "am",
    section: "am-internal",
    placeholder:
      "Notes from kickoff call, initial observations, client preferences…",
    description: "Internal AM notes — not visible to the client.",
  },
  {
    id: "specialInstructions",
    label: "Special Instructions",
    type: "textarea",
    required: false,
    defaultAssignee: "am",
    section: "am-internal",
    placeholder:
      "Flags, constraints, sensitivities, or delivery notes for the team…",
    description:
      "Flags or constraints for the delivery team. Internal only.",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns field defs for a given section, in schema order. */
export function getFieldsBySection(
  section: AMOnboardingFieldDef["section"]
): AMOnboardingFieldDef[] {
  return ONBOARDING_FIELD_SCHEMA.filter((f) => f.section === section);
}

/** Lookup a single field def by id. */
export function getFieldDef(id: string): AMOnboardingFieldDef | undefined {
  return ONBOARDING_FIELD_SCHEMA.find((f) => f.id === id);
}
