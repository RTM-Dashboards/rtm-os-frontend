// RTM OS — Onboarding Field Schema API Route
//
// Persistence layer: reads/writes data/onboarding-field-schema.json.
//
// This is the file-backed persistence layer for the AM onboarding intake form
// field schema.  The Form Builder admin UI (Settings > Forms & Templates >
// Form Builder) writes to this endpoint; the AM onboarding wizard reads from
// it so field changes made by an admin are reflected without a code deploy.
//
// GET  /api/onboarding-field-schema  → { sections: AMOnboardingSection[], fields: AMOnboardingFieldDef[] }
// PUT  /api/onboarding-field-schema  → full replace; body: { sections, fields }
//                                      → { sections, fields }
//
// On first GET, if the data file does not exist, it is seeded from the static
// values in lib/mock/am-onboarding-field-schema.ts so existing records are
// never impacted by the migration.

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ── Inline types (mirror lib/mock/am-onboarding-field-schema.ts) ─────────────
// We inline rather than import the client module to keep the API route
// server-safe (no client-only imports, no bundler confusion).

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

export type FieldDefaultAssignee = "am" | "client";

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

export type OnboardingSectionId =
  | "client-basics"
  | "engagement-setup"
  | "service-delivery"
  | "client-assets"
  | "am-internal";

export interface AMOnboardingFieldDef {
  id: string;
  label: string;
  description?: string;
  type: OnboardingFieldType;
  required: boolean;
  salesPrefillKey?: SalesPrefillKey;
  defaultAssignee: FieldDefaultAssignee;
  options?: string[];
  placeholder?: string;
  section: OnboardingSectionId;
}

export interface AMOnboardingSection {
  id: OnboardingSectionId;
  label: string;
  description: string;
}

interface SchemaFile {
  sections: AMOnboardingSection[];
  fields: AMOnboardingFieldDef[];
}

// ── Static seed (matches lib/mock/am-onboarding-field-schema.ts exactly) ──────
// Inlined here so the API route has no dependency on client-side modules.

const SEED_SECTIONS: AMOnboardingSection[] = [
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

const SEED_FIELDS: AMOnboardingFieldDef[] = [
  // ── CLIENT BASICS ──────────────────────────────────────────────────────────
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
      "Dental",
      "Medical / Healthcare",
      "Legal",
      "Home Services",
      "Automotive",
      "Real Estate",
      "Fitness / Wellness",
      "Restaurant / Food",
      "E-Commerce",
      "Financial Services",
      "Education",
      "Roofing / Exterior",
      "HVAC / Plumbing / Electrical",
      "Cleaning Services",
      "Veterinary",
      "Landscaping",
      "Construction",
      "Retail",
      "Technology / SaaS",
      "Other",
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
      "Solo / 1 person",
      "2–5 employees",
      "6–15 employees",
      "16–50 employees",
      "51–150 employees",
      "150+ employees",
    ],
  },
  // ── ENGAGEMENT SETUP ───────────────────────────────────────────────────────
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
  // ── SERVICE DELIVERY ───────────────────────────────────────────────────────
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
    placeholder:
      "Describe the ideal customer: demographics, geography, services sought…",
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
    placeholder:
      "What sets this business apart? Awards, certifications, guarantees, specialties…",
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
  // ── CLIENT ASSETS ──────────────────────────────────────────────────────────
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
    placeholder:
      "Logo files (SVG/PNG), hex colors, fonts, brand guidelines…",
    description:
      "Logo, brand colors, fonts, and usage guidelines. Client asset — send to client.",
  },
  // ── AM INTERNAL ────────────────────────────────────────────────────────────
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
    description: "Flags or constraints for the delivery team. Internal only.",
  },
];

// ── File path ──────────────────────────────────────────────────────────────────

const DATA_FILE = path.join(
  process.cwd(),
  "data",
  "onboarding-field-schema.json"
);

// ── File I/O ───────────────────────────────────────────────────────────────────

function readSchema(): SchemaFile {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as SchemaFile;
    if (!Array.isArray(parsed.sections) || !Array.isArray(parsed.fields)) {
      throw new Error("bad shape");
    }
    return parsed;
  } catch {
    // File missing or corrupt — return the seed so first GET auto-provisions.
    return { sections: SEED_SECTIONS, fields: SEED_FIELDS };
  }
}

function writeSchema(schema: SchemaFile): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(schema, null, 2), "utf-8");
}

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  const schema = readSchema();
  // Seed the file on first access so future reads are from disk.
  if (!fs.existsSync(DATA_FILE)) {
    writeSchema(schema);
  }
  return NextResponse.json(schema);
}

// ── PUT ────────────────────────────────────────────────────────────────────────

export async function PUT(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = body as Partial<SchemaFile>;
  if (
    !payload ||
    !Array.isArray(payload.sections) ||
    !Array.isArray(payload.fields)
  ) {
    return NextResponse.json(
      { error: "Body must include sections (array) and fields (array)" },
      { status: 400 }
    );
  }

  // Basic validation: every field must have id, label, type, section.
  for (const f of payload.fields) {
    const field = f as AMOnboardingFieldDef;
    if (
      !field.id ||
      !field.label ||
      !field.type ||
      !field.section
    ) {
      return NextResponse.json(
        { error: `Field is missing required properties: id, label, type, section` },
        { status: 400 }
      );
    }
  }

  const schema: SchemaFile = {
    sections: payload.sections as AMOnboardingSection[],
    fields: payload.fields as AMOnboardingFieldDef[],
  };

  try {
    writeSchema(schema);
    return NextResponse.json(schema);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
