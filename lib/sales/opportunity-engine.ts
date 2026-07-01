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

export function createOpportunityFromLead(leadData: {
  id: string;
  clientName: string;
  businessName: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  leadSource: string;
  assignedRep: string;
  notes: string;
}): OpportunityRecord {
  const now = new Date().toISOString();
  const id = `opp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  return {
    id,
    opportunityNumber: generateOpportunityNumber(),
    leadId: leadData.id,
    clientName: leadData.clientName,
    businessName: leadData.businessName,
    tradeType: "",
    contactName: leadData.contactName,
    contactPhone: leadData.contactPhone,
    contactEmail: leadData.contactEmail,
    leadSource: leadData.leadSource,
    assignedRep: leadData.assignedRep,
    stage: "New Opportunity",
    priority: "Medium",
    estimatedMonthlyValue: 0,
    expectedCloseDate: "",
    serviceInterest: [],
    discoveryNotes: leadData.notes,
    ghlContactId: "",
    ghlSynced: false,
    createdAt: now,
    updatedAt: now,
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
    stage: "New Opportunity",
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
