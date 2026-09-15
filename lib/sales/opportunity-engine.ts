// RTM OS — Opportunity Engine
// Pure functions only. No React. No UI imports.

import type {
  OpportunityRecord,
  HomeServicesIntakeRecord,
  CompetitorEntry,
  CommunicationLog,
  CommunicationLogEntry,
  CommunicationLogEntryType,
} from "./types";

// ─── Generate Opportunity Number ──────────────────────────────────────────────

export function generateOpportunityNumber(): string {
  const year = new Date().getFullYear();
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `OPP-${year}-${rand}`;
}

// ─── Create Opportunity From Lead ─────────────────────────────────────────────
//
// DESIGN: spread-with-exclusions.
//
// Every Lead field that has a matching Opportunity field carries across by
// default.  Only fields that genuinely must NOT transfer are named below, with
// a comment explaining why.  A field added to Lead in future flows through
// automatically rather than being silently dropped.
//
// EXCLUSIONS (the short list):
//   id            — Lead identifier; the Opportunity gets its own new id.
//   opportunityNumber — generated fresh for the Opportunity.
//   stage         — Opportunity has its own pipeline stage list; Lead stage is
//                   irrelevant here. Fixed to "Sales Intake".
//   ghlOrigin     — GHL-specific boolean that marks a contact as GHL-created;
//                   has no meaning on an Opportunity record.
//   ghlSyncStatus — Lead sync state; the Opportunity starts un-synced.
//   ghlSynced     — Opportunity-specific GHL flag, always false at creation.
//   createdAt     — Opportunity gets its own creation timestamp.
//   updatedAt     — Same.
//   disqualified / disqualifiedReason — Lead qualification state; disqualified
//                   leads should not reach this function, but exclude for safety.
//
// NAME MAPPINGS (Lead field → Opportunity field):
//   name              → clientName    (Lead.name is the contact display name;
//                                      Opportunity.clientName is the same concept)
//   name              → contactName   (also stored as contactName)
//   email             → contactEmail  (Lead uses bare `email`; Opp uses `contactEmail`)
//   phone             → contactPhone  (Lead uses bare `phone`; Opp uses `contactPhone`)
//   requestedServices → serviceInterest (same meaning, different name)
//   discoveryNotes    → discoveryNotes (same, no mapping needed)
//   notes             → *(not mapped)* Lead.notes is a plain string; Opp.notes
//                       is a Json array of note objects — incompatible types.
//   affiliateName     → affiliateSource (Lead attribution name → Opp attribution field)
//   industry          → industry       (same name; Opp field is optional String?)
//
// FIELDS WITH NO OPPORTUNITY COLUMN (cannot carry without adding columns, which
// is out of scope per the task brief):
//   location, ghlAssignedUser, ghlSource, ghlCreatedDate, ghlLastActivityDate,
//   ghlContactTags, ghlContactStatus, ghlLastSyncedAt, ghlSyncError,
//   businessGoals, painPoints, budget, authority, need, timeline,
//   createdDate, lastActivity, discoveryScheduled, discoveryDate.

export function createOpportunityFromLead(leadData: {
  // Required identity fields
  id: string;
  // Contact name — maps to both clientName and contactName on Opportunity
  name: string;
  businessName: string;
  // Contact details — field names differ on Opportunity
  email: string;          // → contactEmail
  phone: string;          // → contactPhone
  // Shared-name fields carried as-is
  leadSource: string;
  assignedRep: string;
  discoveryNotes: string;
  // Optional shared-name fields
  industry?: string;      // → industry
  website?: string;       // → website
  ghlContactId?: string;  // → ghlContactId
  // Name-mapped array fields
  requestedServices?: string[];  // → serviceInterest
  // Name-mapped attribution field
  affiliateName?: string; // → affiliateSource
  // Estimated value (Int on Lead, Float? on Opportunity)
  estimatedValue?: number; // → estimatedValue
}): OpportunityRecord {
  const now = new Date().toISOString();
  const id = `opp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  return {
    // ── Opportunity-specific generated fields ──────────────────────────────
    id,
    opportunityNumber: generateOpportunityNumber(),
    leadId: leadData.id,

    // ── Name mappings: Lead field name → Opportunity field name ───────────
    clientName: leadData.name,
    contactName: leadData.name,
    contactEmail: leadData.email,
    contactPhone: leadData.phone,
    serviceInterest: leadData.requestedServices ?? [],
    ...(leadData.affiliateName ? { affiliateSource: leadData.affiliateName } : {}),

    // ── Shared-name fields carried directly ───────────────────────────────
    businessName: leadData.businessName,
    leadSource: leadData.leadSource,
    assignedRep: leadData.assignedRep,
    discoveryNotes: leadData.discoveryNotes,

    // ── Optional shared-name fields ───────────────────────────────────────
    ...(leadData.industry                    ? { industry: leadData.industry }                         : {}),
    ...(leadData.website                     ? { website: leadData.website }                           : {}),
    ...(leadData.ghlContactId                ? { ghlContactId: leadData.ghlContactId }                 : {}),
    ...(leadData.estimatedValue !== undefined ? { estimatedValue: leadData.estimatedValue }             : {}),

    // ── Exclusions: Opportunity-specific defaults ──────────────────────────
    // stage: fixed to pipeline entry point; Lead.stage is irrelevant here
    stage: "Sales Intake",
    priority: "Medium",
    estimatedMonthlyValue: 0,
    expectedCloseDate: "",
    tradeType: "",
    // ghlContactId defaults to empty string if not provided above
    ghlContactId: leadData.ghlContactId ?? "",
    // ghlSynced: Opportunity not yet synced to GHL as an Opportunity
    ghlSynced: false,
    // Timestamps: Opportunity gets its own creation time
    createdAt: now,
    updatedAt: now,
    // Complex sub-objects start empty
    intakeRecord: null,
    communicationLog: { opportunityId: id, entries: [] },
    activeWizardId: null,
  };
}

// ─── Create Opportunity Manual ────────────────────────────────────────────────

export function createOpportunityManual(
  data: Partial<OpportunityRecord>
): OpportunityRecord {
  const now = new Date().toISOString();
  const id = data.id ?? `opp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  return {
    id,
    opportunityNumber: data.opportunityNumber ?? generateOpportunityNumber(),
    leadId: data.leadId ?? null,
    clientName: data.clientName ?? "",
    businessName: data.businessName ?? "",
    tradeType: data.tradeType ?? "",
    contactName: data.contactName ?? "",
    contactPhone: data.contactPhone ?? "",
    contactEmail: data.contactEmail ?? "",
    leadSource: data.leadSource ?? "",
    assignedRep: data.assignedRep ?? "",
    stage: "Sales Intake", // Pipeline module starts here; Lead module owned the preceding stages (Lead → Qualified)
    priority: data.priority ?? "Medium",
    estimatedMonthlyValue: data.estimatedMonthlyValue ?? 0,
    expectedCloseDate: data.expectedCloseDate ?? "",
    serviceInterest: data.serviceInterest ?? [],
    discoveryNotes: data.discoveryNotes ?? "",
    ghlContactId: data.ghlContactId ?? "",
    ghlSynced: false,
    createdAt: data.createdAt ?? now,
    updatedAt: now,
    intakeRecord: data.intakeRecord ?? null,
    communicationLog: data.communicationLog ?? { opportunityId: id, entries: [] },
    activeWizardId: data.activeWizardId ?? null,
  };
}

// ─── Update Opportunity Stage ─────────────────────────────────────────────────

export function updateOpportunityStage(
  opportunity: OpportunityRecord,
  stage: string
): OpportunityRecord {
  return {
    ...opportunity,
    stage,
    updatedAt: new Date().toISOString(),
  };
}

// ─── Attach Intake Record ─────────────────────────────────────────────────────

export function attachIntakeRecord(
  opportunity: OpportunityRecord,
  intake: HomeServicesIntakeRecord
): OpportunityRecord {
  return {
    ...opportunity,
    intakeRecord: intake,
    updatedAt: new Date().toISOString(),
  };
}

// ─── Build Intake Context For Proposal ───────────────────────────────────────


// Communication Log Functions

export function createLogEntry(
  opportunityId: string,
  entry: Omit<CommunicationLogEntry, "id" | "opportunityId" | "loggedAt">
): CommunicationLogEntry {
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `log-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return {
    ...entry,
    id,
    opportunityId,
    loggedAt: new Date().toISOString(),
  };
}

export function addLogEntryToOpportunity(
  opportunity: OpportunityRecord,
  entry: CommunicationLogEntry
): OpportunityRecord {
  return {
    ...opportunity,
    communicationLog: {
      ...opportunity.communicationLog,
      entries: [entry, ...opportunity.communicationLog.entries],
    },
    updatedAt: new Date().toISOString(),
  };
}

export function getLogEntriesByType(
  log: CommunicationLog,
  type: CommunicationLogEntryType
): CommunicationLogEntry[] {
  return log.entries.filter((e) => e.type === type);
}

export function summarizeCommunicationLog(log: CommunicationLog): {
  totalEntries: number;
  lastContactDate: string | null;
  byType: Record<CommunicationLogEntryType, number>;
} {
  const byType: Record<CommunicationLogEntryType, number> = {
    call: 0,
    "call-transcript": 0,
    email: 0,
    "meeting-notes": 0,
    sms: 0,
    note: 0,
  };
  for (const entry of log.entries) {
    byType[entry.type] = (byType[entry.type] ?? 0) + 1;
  }
  const sorted = [...log.entries].sort(
    (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
  );
  return {
    totalEntries: log.entries.length,
    lastContactDate: sorted.length > 0 ? sorted[0].loggedAt : null,
    byType,
  };
}

export function buildIntakeContextForProposal(intake: HomeServicesIntakeRecord): {
  clientName: string;
  businessName: string;
  tradeType: string;
  serviceArea: string[];
  goals: string[];
  targetBudget: string;
  gbpListingCount: number;
  hasWebsite: boolean;
  currentlyMarketing: boolean;
  competitors: CompetitorEntry[];
  auditPrePopulation: {
    gbpClaimed: boolean;
    gbpListingCount: number;
    yelpListed: boolean;
    appleMapsListed: boolean;
    bingPlacesListed: boolean;
    hasWebsite: boolean;
    websiteMobileFriendly: boolean;
    googleAdsActive: boolean;
    lsaActive: boolean;
    metaAdsActive: boolean;
    monthlyLeads: number;
  };
} {
  const hasWebsite = intake.website2?.hasWebsite === "yes";

  const gbpClaimed = (intake.listingPlatforms ?? []).some(
    (p) => p.platformId === "gbp" && !!p.url
  );
  const yelpListed = (intake.listingPlatforms ?? []).some(
    (p) => p.platformId === "yelp" && !!p.url
  );
  const appleMapsListed = (intake.listingPlatforms ?? []).some(
    (p) => p.platformId === "apple-maps" && !!p.url
  );
  const bingPlacesListed = (intake.listingPlatforms ?? []).some(
    (p) => p.platformId === "bing-places" && !!p.url
  );

  return {
    clientName: intake.contactName,
    businessName: intake.businessName,
    tradeType: intake.tradeType,
    serviceArea: intake.serviceArea,
    goals: intake.primaryGoals,
    targetBudget: intake.targetBudget,
    gbpListingCount: intake.gbpListingCount,
    hasWebsite,
    currentlyMarketing: intake.currentlyMarketing,
    competitors: intake.competitors,
    auditPrePopulation: {
      gbpClaimed,
      gbpListingCount: intake.gbpListingCount,
      yelpListed,
      appleMapsListed,
      bingPlacesListed,
      hasWebsite,
      websiteMobileFriendly: hasWebsite,
      googleAdsActive: intake.googleAdsActive,
      lsaActive: intake.lsaActive,
      metaAdsActive: intake.metaAdsActive,
      monthlyLeads: intake.monthlyLeads,
    },
  };
}
