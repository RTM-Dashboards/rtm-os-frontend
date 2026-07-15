"use client";

import React, { useState } from "react";
import {
  TRADE_TYPES,
  BUSINESS_STRUCTURES,
  WEBSITE_PLATFORMS,
  HOME_SERVICE_GOALS,
  BUDGET_RANGES,
  TIMELINE_OPTIONS,
  SEASONAL_OPTIONS,
  CUSTOMER_TYPES,
  JOB_VALUE_RANGES,
  CONTACT_ROLES,
  PREFERRED_CONTACT_METHODS,
  PRIMARY_LEAD_SOURCES,
  INTAKE_SOURCE_OPTIONS,
  LISTING_PLATFORM_DEFINITIONS,
  WEBSITE_STATUS_OPTIONS,
  WEBSITE_LAST_UPDATED_OPTIONS,
  WEBSITE_BUILDER_OPTIONS,
  HOSTING_SITUATION_OPTIONS,
  ACCESS_STATUS_OPTIONS,
  REDESIGN_INTEREST_OPTIONS,
  NEW_BUILD_INTEREST_OPTIONS,
  MANAGED_HOSTING_INTEREST_OPTIONS,
} from "@/lib/sales/intake-config";
import type { ProposalWizardState } from "../ProposalWizard";
import type {
  HomeServicesIntakeRecord,
  CompetitorEntry,
  MasterAddress,
  ListingPlatformData,
  WebsiteData,
  HostingData,
  SectionNote,
} from "@/lib/sales/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Step1ClientGoalsProps {
  state: ProposalWizardState;
  onUpdate: (updates: Partial<ProposalWizardState>) => void;
}

// ─── Sample Intake Data ───────────────────────────────────────────────────────────────────
// All categorical values come from the existing intake-config option lists.
// This profile has enough listing platform data to produce real citation audit
// results and enough marketing data to exercise the marketing assessment.

function buildSampleIntakeRecord(): HomeServicesIntakeRecord {
  return {
    // ─ Section 1: Business ────────────────────────────────────────────
    businessName: "Sample Home Services Co.",
    tradeType: "Plumbing",
    businessStructure: "Small Team (2-10 employees)",
    locationCount: 1,
    serviceArea: ["Austin", "Round Rock"],
    yearsInBusiness: 8,
    licensed: true,
    bonded: true,
    phone: "(512) 555-0192",
    email: "info@samplehomeservices.com",
    website: "https://www.samplehomeservices.com",
    masterAddress: {
      street: "4210 Burnet Road",
      suite: "Suite 12",
      city: "Austin",
      state: "TX",
      zip: "78756",
      country: "United States",
    },
    additionalLocations: [],
    // ─ Section 2: Contact ────────────────────────────────────────────
    contactName: "Marcus Webb",
    contactRole: "Owner",
    contactPhone: "(512) 555-0192",
    contactEmail: "marcus@samplehomeservices.com",
    preferredContact: "Phone Call",
    bestTimeToReach: "Weekdays 9am–5pm",
    // ─ Section 3: Online Presence ─────────────────────────────────────
    gbpListings: [
      { url: "https://maps.google.com/?cid=sample-gbp-001", rating: 4.3, reviewCount: 87 },
    ],
    gbpListingCount: 1,
    listingPlatforms: [
      {
        platformId: "gbp",
        url: "https://maps.google.com/?cid=sample-gbp-001",
        nameAsListed: "Sample Home Services Co.",
        addressAsListed: "4210 Burnet Rd Suite 12, Austin, TX 78756",
        phoneAsListed: "(512) 555-0192",
        rating: 4.3,
        reviewCount: 87,
        notes: "",
      },
      {
        platformId: "yelp",
        url: "https://www.yelp.com/biz/sample-home-services-austin",
        nameAsListed: "Sample Home Services",
        addressAsListed: "4210 Burnet Road, Austin, TX 78756",
        phoneAsListed: "512-555-0192",
        rating: 4.1,
        reviewCount: 34,
        notes: "",
      },
      {
        platformId: "facebook",
        url: "https://www.facebook.com/samplehomeservicesatx",
        nameAsListed: "Sample Home Services Co.",
        addressAsListed: "4210 Burnet Road Suite 12, Austin TX 78756",
        phoneAsListed: "(512) 555-0192",
        rating: 4.2,
        reviewCount: 19,
        notes: "",
      },
    ],
    website2: {
      hasWebsite: "yes",
      url: "https://www.samplehomeservices.com",
      platform: "WordPress",
      hostingProvider: "WP Engine",
      domainRegistrar: "GoDaddy",
      hasHostingAccess: "yes",
      hasDomainAccess: "yes",
      interestedInRedesign: "maybe",
      lastUpdated: "1 to 2 years",
      interestedInNewBuild: "no",
      hasDomain: true,
      domainName: "samplehomeservices.com",
      preferredPlatform: "WordPress",
      inProgressDomain: "",
      inProgressBuilder: "us",
      inProgressETA: "",
    },
    hosting: {
      currentSituation: "self-managed",
      providerName: "WP Engine",
      monthlyCost: 30,
      interestedInManagedHosting: "maybe",
    },
    currentlyMarketing: true,
    currentProvider: "Self-managed",
    monthlyMarketingSpend: 1200,
    googleAdsActive: true,
    googleAdsSpend: 1000,
    lsaActive: false,
    lsaSpend: 0,
    lsaCostPerLead: 0,
    metaAdsActive: false,
    metaAdsSpend: 0,
    monthlyLeads: 22,
    primaryLeadSource: "Google Ads",
    // ─ Section 4: Goals ──────────────────────────────────────────────
    primaryGoals: ["More inbound calls", "Rank higher on Google Maps"],
    targetBudget: "$1,500 - $2,000",
    timeline: "Within 30 days",
    seasonalConsiderations: "Business is year-round",
    targetCustomerType: "Residential only",
    averageJobValue: "$500 - $2,000",
    competitors: [
      { name: "Austin Pro Plumbers", city: "Austin", website: "https://www.austinproplumbers.com" },
      { name: "Capitol City Plumbing", city: "Round Rock", website: "" },
    ],
    // ─ Section 5: Sales Context ──────────────────────────────────────
    leadSource: "Google Ads",
    assignedRep: "Jordan M.",
    referralSource: "",
    affiliatePartner: "",
    howHeardAboutUs: "Google search",
    discoveryNotes: "Sample prospect for demo and testing purposes.",
    painPoints: "Not ranking well on Google Maps. Too dependent on Google Ads spend.",
    objections: "Budget concerns for long-term contracts.",
    specialRequirements: "",
    internalNotes: "Sample data — use for testing intake audit and hybrid audit modes.",
    ghlContactId: "",
    sectionNotes: [],
    globalCustomNote: "",
    flaggedForFollowUp: false,
  };
}

// ─── Default sub-objects ──────────────────────────────────────────────────

function defaultMasterAddress(): MasterAddress {
  return {
    street: "",
    suite: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
  };
}

function defaultWebsiteData(): WebsiteData {
  return {
    hasWebsite: "no",
    url: "",
    platform: "",
    hostingProvider: "",
    domainRegistrar: "",
    hasHostingAccess: "not-sure",
    hasDomainAccess: "not-sure",
    interestedInRedesign: "maybe",
    lastUpdated: "",
    interestedInNewBuild: "maybe",
    hasDomain: false,
    domainName: "",
    preferredPlatform: "",
    inProgressDomain: "",
    inProgressBuilder: "us",
    inProgressETA: "",
  };
}

function defaultHostingData(): HostingData {
  return {
    currentSituation: "no-hosting",
    providerName: "",
    monthlyCost: null,
    interestedInManagedHosting: "maybe",
  };
}

// ─── Default intake ───────────────────────────────────────────────────────────

function defaultIntake(): HomeServicesIntakeRecord {
  return {
    businessName: "",
    tradeType: "",
    businessStructure: "",
    locationCount: 1,
    serviceArea: [],
    yearsInBusiness: 0,
    licensed: false,
    bonded: false,
    phone: "",
    email: "",
    website: "",
    masterAddress: defaultMasterAddress(),
    additionalLocations: [],
    contactName: "",
    contactRole: "",
    contactPhone: "",
    contactEmail: "",
    preferredContact: "",
    bestTimeToReach: "",
    gbpListings: [],
    gbpListingCount: 0,
    listingPlatforms: [],
    website2: defaultWebsiteData(),
    hosting: defaultHostingData(),
    currentlyMarketing: false,
    currentProvider: "",
    monthlyMarketingSpend: 0,
    googleAdsActive: false,
    googleAdsSpend: 0,
    lsaActive: false,
    lsaSpend: 0,
    lsaCostPerLead: 0,
    metaAdsActive: false,
    metaAdsSpend: 0,
    monthlyLeads: 0,
    primaryLeadSource: "",
    primaryGoals: [],
    targetBudget: "",
    timeline: "",
    seasonalConsiderations: "",
    targetCustomerType: "",
    averageJobValue: "",
    competitors: [],
    leadSource: "",
    assignedRep: "",
    referralSource: "",
    affiliatePartner: "",
    howHeardAboutUs: "",
    discoveryNotes: "",
    painPoints: "",
    objections: "",
    specialRequirements: "",
    internalNotes: "",
    ghlContactId: "",
    sectionNotes: [],
    globalCustomNote: "",
    flaggedForFollowUp: false,
  };
}

// ─── Shared field primitives ──────────────────────────────────────────────────

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label
      className="block text-[11px] font-bold uppercase tracking-wide mb-1"
      style={{ color: "var(--rtm-text-muted)" }}
    >
      {children}
      {required && (
        <span className="ml-1" style={{ color: "#DC2626" }}>
          *
        </span>
      )}
    </label>
  );
}

function HelpText({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
      {children}
    </p>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
  helpText,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  helpText?: string;
}) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
        style={{
          background: "var(--rtm-bg)",
          borderColor: "var(--rtm-border)",
          color: "var(--rtm-text-primary)",
        }}
      />
      {helpText && <HelpText>{helpText}</HelpText>}
    </div>
  );
}

function SelectInput({
  label,
  value,
  onChange,
  options,
  required,
  placeholder = "Select...",
  helpText,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  required?: boolean;
  placeholder?: string;
  helpText?: string;
}) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
        style={{
          background: "var(--rtm-bg)",
          borderColor: "var(--rtm-border)",
          color: "var(--rtm-text-primary)",
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {helpText && <HelpText>{helpText}</HelpText>}
    </div>
  );
}

function TextareaInput({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  internal,
  helpText,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  internal?: boolean;
  helpText?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <FieldLabel>{label}</FieldLabel>
        {internal && (
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: "#FEF9C3", color: "#92400E", border: "1px solid #FDE68A" }}
          >
            Internal Only
          </span>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
        style={{
          background: "var(--rtm-bg)",
          borderColor: "var(--rtm-border)",
          color: "var(--rtm-text-primary)",
        }}
      />
      {helpText && <HelpText>{helpText}</HelpText>}
    </div>
  );
}

function YesNoToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm font-medium" style={{ color: "var(--rtm-text-secondary)" }}>
        {label}
      </span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className="relative w-10 h-6 rounded-full transition-colors flex-shrink-0"
        style={{ background: value ? "#2563EB" : "#CBD5E1" }}
      >
        <div
          className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform"
          style={{ left: value ? "1.25rem" : "0.25rem" }}
        />
      </button>
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  placeholder,
  prefix,
  helpText,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  placeholder?: string;
  prefix?: string;
  helpText?: string;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        {prefix && (
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            {prefix}
          </span>
        )}
        <input
          type="number"
          min="0"
          value={value ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v === "" ? null : parseFloat(v));
          }}
          placeholder={placeholder}
          className="w-full text-sm rounded-lg border py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          style={{
            background: "var(--rtm-bg)",
            borderColor: "var(--rtm-border)",
            color: "var(--rtm-text-primary)",
            paddingLeft: prefix ? "1.75rem" : "0.75rem",
            paddingRight: "0.75rem",
          }}
        />
      </div>
      {helpText && <HelpText>{helpText}</HelpText>}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({
  number,
  title,
  completedCount,
  totalCount,
  isOpen,
  onToggle,
  warning,
}: {
  number: number;
  title: string;
  completedCount: number;
  totalCount: number;
  isOpen: boolean;
  onToggle: () => void;
  warning?: boolean;
}) {
  const allDone = completedCount === totalCount && totalCount > 0;
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between px-5 py-4 rounded-t-xl border-b"
      style={{
        background: "var(--rtm-surface)",
        borderColor: "var(--rtm-border)",
        textAlign: "left",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{
            background: allDone ? "#059669" : "#EFF6FF",
            color: allDone ? "#fff" : "#2563EB",
          }}
        >
          {allDone ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 6L5 9L10 3"
                stroke="#fff"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            number
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
              {title}
            </p>
            {warning && (
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A" }}
              >
                Follow-Up Required
              </span>
            )}
          </div>
          <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>
            {completedCount} of {totalCount} fields complete
          </p>
        </div>
      </div>
      <span
        className="text-lg font-bold flex-shrink-0"
        style={{
          color: "var(--rtm-text-muted)",
          transform: isOpen ? "rotate(180deg)" : "none",
          display: "inline-block",
        }}
      >
        ›
      </span>
    </button>
  );
}

function SectionCard({
  number,
  title,
  completedCount,
  totalCount,
  children,
  defaultOpen = false,
  warning,
}: {
  number: number;
  title: string;
  completedCount: number;
  totalCount: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
  warning?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: "var(--rtm-border)" }}
    >
      <SectionHeader
        number={number}
        title={title}
        completedCount={completedCount}
        totalCount={totalCount}
        isOpen={isOpen}
        onToggle={() => setIsOpen((v) => !v)}
        warning={warning}
      />
      {isOpen && (
        <div className="p-6" style={{ background: "var(--rtm-surface)" }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Sub-section label ────────────────────────────────────────────────────────

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[10px] font-bold uppercase tracking-widest mb-3 mt-5 first:mt-0"
      style={{ color: "var(--rtm-text-muted)" }}
    >
      {children}
    </p>
  );
}

function SectionDivider() {
  return (
    <hr
      className="my-6"
      style={{ borderColor: "var(--rtm-border)" }}
    />
  );
}

// ─── Section Note ─────────────────────────────────────────────────────────────

function SectionNoteField({
  sectionId,
  sectionNotes,
  onChange,
}: {
  sectionId: string;
  sectionNotes: SectionNote[];
  onChange: (notes: SectionNote[]) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const existing = sectionNotes.find((n) => n.sectionId === sectionId);
  const noteValue = existing?.note ?? "";

  function handleChange(value: string) {
    const updated = sectionNotes.filter((n) => n.sectionId !== sectionId);
    if (value.trim()) {
      updated.push({ sectionId, note: value, flagForFollowUp: false });
    }
    onChange(updated);
  }

  return (
    <div className="mt-5 pt-4 border-t" style={{ borderColor: "var(--rtm-border)" }}>
      {!expanded && !noteValue ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-xs font-semibold"
          style={{ color: "#2563EB" }}
        >
          + Add Section Note
        </button>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FieldLabel>Sales Rep Note</FieldLabel>
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: "#FEF9C3", color: "#92400E", border: "1px solid #FDE68A" }}
            >
              Internal Only
            </span>
          </div>
          <textarea
            value={noteValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Any additional context for this section..."
            rows={2}
            className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            style={{
              background: "var(--rtm-bg)",
              borderColor: "var(--rtm-border)",
              color: "var(--rtm-text-primary)",
            }}
          />
          <HelpText>This note is for internal use only and will not be shared with the client.</HelpText>
        </div>
      )}
    </div>
  );
}

// ─── Tag Input (service area) ─────────────────────────────────────────────────

function TagInput({
  label,
  tags,
  onAdd,
  onRemove,
}: {
  label: string;
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}) {
  const [input, setInput] = useState("");

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      onAdd(input.trim());
      setInput("");
    }
  }

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div
        className="flex flex-wrap gap-1.5 min-h-[2.5rem] w-full rounded-lg border px-3 py-2 focus-within:ring-1 focus-within:ring-blue-500"
        style={{
          background: "var(--rtm-bg)",
          borderColor: "var(--rtm-border)",
        }}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{ background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE" }}
          >
            {tag}
            <button
              type="button"
              onClick={() => onRemove(tag)}
              className="text-xs font-bold leading-none"
              style={{ color: "#2563EB" }}
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? "Type city and press Enter" : "Add more..."}
          className="flex-1 min-w-[120px] text-sm bg-transparent focus:outline-none"
          style={{ color: "var(--rtm-text-primary)" }}
        />
      </div>
      <HelpText>Type a city or area and press Enter to add.</HelpText>
    </div>
  );
}

// ─── Competitor Field Group ───────────────────────────────────────────────────

function CompetitorFields({
  competitors,
  onChange,
}: {
  competitors: CompetitorEntry[];
  onChange: (c: CompetitorEntry[]) => void;
}) {
  function updateCompetitor(index: number, field: keyof CompetitorEntry, value: string) {
    const updated = competitors.map((c, i) =>
      i === index ? { ...c, [field]: value } : c
    );
    onChange(updated);
  }

  function addCompetitor() {
    if (competitors.length < 3) {
      onChange([...competitors, { name: "", city: "", website: "" }]);
    }
  }

  function removeCompetitor(index: number) {
    onChange(competitors.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <FieldLabel>Competitors (max 3)</FieldLabel>
      {competitors.map((comp, index) => (
        <div
          key={`competitor-${index}-${comp.name || index}`}
          className="rounded-lg border p-3 space-y-2"
          style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}
        >
          <div className="flex items-center justify-between mb-1">
            <p
              className="text-[10px] font-bold uppercase tracking-wide"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Competitor {index + 1}
            </p>
            <button
              type="button"
              onClick={() => removeCompetitor(index)}
              className="text-[10px] font-semibold px-2 py-0.5 rounded"
              style={{ background: "#FEF2F2", color: "#DC2626" }}
            >
              Remove
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <input
              value={comp.name}
              onChange={(e) => updateCompetitor(index, "name", e.target.value)}
              placeholder="Competitor name"
              className="text-sm rounded-lg border px-2 py-1.5 focus:outline-none"
              style={{
                background: "var(--rtm-surface)",
                borderColor: "var(--rtm-border)",
                color: "var(--rtm-text-primary)",
              }}
            />
            <input
              value={comp.city}
              onChange={(e) => updateCompetitor(index, "city", e.target.value)}
              placeholder="City"
              className="text-sm rounded-lg border px-2 py-1.5 focus:outline-none"
              style={{
                background: "var(--rtm-surface)",
                borderColor: "var(--rtm-border)",
                color: "var(--rtm-text-primary)",
              }}
            />
            <input
              value={comp.website ?? ""}
              onChange={(e) => updateCompetitor(index, "website", e.target.value)}
              placeholder="Website (optional)"
              className="text-sm rounded-lg border px-2 py-1.5 focus:outline-none"
              style={{
                background: "var(--rtm-surface)",
                borderColor: "var(--rtm-border)",
                color: "var(--rtm-text-primary)",
              }}
            />
          </div>
        </div>
      ))}
      {competitors.length < 3 && (
        <button
          type="button"
          onClick={addCompetitor}
          className="text-xs px-3 py-1.5 rounded-lg font-semibold border"
          style={{
            background: "var(--rtm-bg)",
            color: "#2563EB",
            borderColor: "#BFDBFE",
          }}
        >
          Add Competitor
        </button>
      )}
    </div>
  );
}

// ─── Goal Chips ───────────────────────────────────────────────────────────────

function GoalChips({
  goals,
  selected,
  onToggle,
}: {
  goals: string[];
  selected: string[];
  onToggle: (g: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {goals.map((goal) => {
        const active = selected.includes(goal);
        return (
          <button
            key={goal}
            type="button"
            onClick={() => onToggle(goal)}
            className="text-xs px-3 py-1.5 rounded-full border font-semibold transition-colors"
            style={{
              background: active ? "#EFF6FF" : "var(--rtm-bg)",
              color: active ? "#2563EB" : "var(--rtm-text-secondary)",
              borderColor: active ? "#2563EB" : "var(--rtm-border)",
            }}
          >
            {goal}
          </button>
        );
      })}
    </div>
  );
}

// ─── Platform Block ───────────────────────────────────────────────────────────

function PlatformBlock({
  platformDef,
  platformData,
  onChange,
}: {
  platformDef: (typeof LISTING_PLATFORM_DEFINITIONS)[number];
  platformData: ListingPlatformData | undefined;
  onChange: (data: ListingPlatformData) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const data: ListingPlatformData = platformData ?? {
    platformId: platformDef.id,
    url: "",
    nameAsListed: "",
    addressAsListed: "",
    phoneAsListed: "",
    rating: null,
    reviewCount: null,
    notes: "",
  };

  // Determine if there is any URL-type field with a value
  const hasInfo = platformDef.fields.some(
    (f) => f.fieldType === "url" && getFieldValue(data, f.id) !== ""
  );

  function getFieldValue(d: ListingPlatformData, fieldId: string): string {
    // Map field IDs to ListingPlatformData keys
    const urlFields = [
      `${platformDef.id}-url`,
      "gbp-url",
      "yelp-url",
      "apple-url",
      "bing-url",
      "angi-url",
      "thumbtack-url",
      "facebook-url",
      "instagram-url",
      "bbb-url",
      "nextdoor-url",
    ];
    if (urlFields.includes(fieldId)) return d.url;
    if (fieldId.endsWith("-name")) return d.nameAsListed;
    if (fieldId.endsWith("-address")) return d.addressAsListed;
    if (fieldId.endsWith("-phone")) return d.phoneAsListed;
    if (fieldId.endsWith("-rating")) return d.rating !== null ? String(d.rating) : "";
    if (
      fieldId.endsWith("-reviews") ||
      fieldId.endsWith("-followers") ||
      fieldId === "angi-spend"
    )
      return d.reviewCount !== null ? String(d.reviewCount) : "";
    if (fieldId.endsWith("-notes")) return d.notes;
    // For platform-specific fields (services, handle, etc.) use notes as fallback bucket
    return "";
  }

  function setFieldValue(fieldId: string, value: string) {
    const updated = { ...data };
    const urlFields = [
      `${platformDef.id}-url`,
      "gbp-url",
      "yelp-url",
      "apple-url",
      "bing-url",
      "angi-url",
      "thumbtack-url",
      "facebook-url",
      "instagram-url",
      "bbb-url",
      "nextdoor-url",
    ];
    if (urlFields.includes(fieldId)) {
      updated.url = value;
    } else if (fieldId.endsWith("-name")) {
      updated.nameAsListed = value;
    } else if (fieldId.endsWith("-address")) {
      updated.addressAsListed = value;
    } else if (fieldId.endsWith("-phone")) {
      updated.phoneAsListed = value;
    } else if (fieldId.endsWith("-rating") || fieldId === "bbb-rating") {
      updated.rating = value === "" ? null : parseFloat(value);
    } else if (
      fieldId.endsWith("-reviews") ||
      fieldId.endsWith("-followers") ||
      fieldId === "angi-spend"
    ) {
      updated.reviewCount = value === "" ? null : parseFloat(value);
    } else if (fieldId.endsWith("-notes")) {
      updated.notes = value;
    }
    onChange(updated);
  }

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ borderColor: "var(--rtm-border)" }}
    >
      {/* Platform header row */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3"
        style={{ background: "var(--rtm-bg)", textAlign: "left" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
            {platformDef.label}
          </span>
          {hasInfo && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: "#F0FDF4", color: "#15803D", border: "1px solid #BBF7D0" }}
            >
              Has Info
            </span>
          )}
        </div>
        <span
          className="text-sm font-bold flex-shrink-0"
          style={{
            color: "var(--rtm-text-muted)",
            transform: expanded ? "rotate(180deg)" : "none",
            display: "inline-block",
          }}
        >
          ›
        </span>
      </button>

      {expanded && (
        <div
          className="px-4 pb-4 pt-3 space-y-3 border-t"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          {platformDef.fields.map((field) => {
            const val = getFieldValue(data, field.id);

            if (field.fieldType === "url") {
              return (
                <div key={field.id}>
                  <FieldLabel>{field.label}</FieldLabel>
                  <div className="relative">
                    <span
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--rtm-text-muted)" }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                    </span>
                    <input
                      type="url"
                      value={val}
                      onChange={(e) => setFieldValue(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full text-sm rounded-lg border py-2 pr-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      style={{
                        background: "var(--rtm-bg)",
                        borderColor: "var(--rtm-border)",
                        color: "var(--rtm-text-primary)",
                        paddingLeft: "2rem",
                      }}
                    />
                  </div>
                  {field.helpText && <HelpText>{field.helpText}</HelpText>}
                </div>
              );
            }

            if (field.fieldType === "text") {
              return (
                <div key={field.id}>
                  <FieldLabel>{field.label}</FieldLabel>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => setFieldValue(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    style={{
                      background: "var(--rtm-bg)",
                      borderColor: "var(--rtm-border)",
                      color: "var(--rtm-text-primary)",
                    }}
                  />
                  {field.helpText && <HelpText>{field.helpText}</HelpText>}
                </div>
              );
            }

            if (field.fieldType === "number") {
              return (
                <div key={field.id}>
                  <FieldLabel>{field.label}</FieldLabel>
                  <input
                    type="number"
                    min="0"
                    value={val}
                    onChange={(e) => setFieldValue(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    style={{
                      background: "var(--rtm-bg)",
                      borderColor: "var(--rtm-border)",
                      color: "var(--rtm-text-primary)",
                    }}
                  />
                  {field.helpText && <HelpText>{field.helpText}</HelpText>}
                </div>
              );
            }

            if (field.fieldType === "select") {
              return (
                <div key={field.id}>
                  <FieldLabel>{field.label}</FieldLabel>
                  <select
                    value={val}
                    onChange={(e) => setFieldValue(field.id, e.target.value)}
                    className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    style={{
                      background: "var(--rtm-bg)",
                      borderColor: "var(--rtm-border)",
                      color: "var(--rtm-text-primary)",
                    }}
                  >
                    <option value="">{field.placeholder || "Select..."}</option>
                    {(field.options ?? []).map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                  {field.helpText && <HelpText>{field.helpText}</HelpText>}
                </div>
              );
            }

            if (field.fieldType === "textarea") {
              return (
                <div key={field.id}>
                  <FieldLabel>{field.label}</FieldLabel>
                  <textarea
                    value={val}
                    onChange={(e) => setFieldValue(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    rows={2}
                    className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                    style={{
                      background: "var(--rtm-bg)",
                      borderColor: "var(--rtm-border)",
                      color: "var(--rtm-text-primary)",
                    }}
                  />
                  {field.helpText && <HelpText>{field.helpText}</HelpText>}
                </div>
              );
            }

            return null;
          })}
        </div>
      )}
    </div>
  );
}

// ─── Count helpers ────────────────────────────────────────────────────────────

function countSection1(intake: HomeServicesIntakeRecord): [number, number] {
  const total = 9;
  let done = 0;
  if (intake.businessName) done++;
  if (intake.tradeType) done++;
  if (intake.businessStructure) done++;
  if (intake.serviceArea.length > 0) done++;
  if (intake.phone) done++;
  if (intake.email) done++;
  if (intake.website) done++;
  if (intake.locationCount > 0) done++;
  if (intake.masterAddress.street) done++;
  return [done, total];
}

function countSection2(intake: HomeServicesIntakeRecord): [number, number] {
  const total = 4;
  let done = 0;
  if (intake.contactName) done++;
  if (intake.contactRole) done++;
  if (intake.contactPhone) done++;
  if (intake.contactEmail) done++;
  return [done, total];
}

function countSection3(intake: HomeServicesIntakeRecord): [number, number] {
  const total = 4;
  let done = 0;
  const listedCount = intake.listingPlatforms.filter((p) => p.url).length;
  if (listedCount > 0) done++;
  if (intake.website2.hasWebsite) done++;
  if (intake.hosting.currentSituation) done++;
  if (intake.primaryLeadSource) done++;
  return [Math.min(done, total), total];
}

function countSection4(intake: HomeServicesIntakeRecord): [number, number] {
  const total = 5;
  let done = 0;
  if (intake.primaryGoals.length > 0) done++;
  if (intake.targetBudget) done++;
  if (intake.timeline) done++;
  if (intake.targetCustomerType) done++;
  if (intake.averageJobValue) done++;
  return [done, total];
}

function countSection5(intake: HomeServicesIntakeRecord): [number, number] {
  const total = 4;
  let done = 0;
  if (intake.leadSource) done++;
  if (intake.assignedRep) done++;
  if (intake.discoveryNotes) done++;
  if (intake.howHeardAboutUs) done++;
  return [done, total];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Step1ClientGoals({ state, onUpdate }: Step1ClientGoalsProps) {
  const existingIntake = (state.intakeRecord as HomeServicesIntakeRecord | null) ?? null;
  const [intake, setIntake] = useState<HomeServicesIntakeRecord>(() => ({
    ...defaultIntake(),
    ...existingIntake,
    businessName: existingIntake?.businessName || state.clientInfo.businessName || "",
    contactName:
      existingIntake?.contactName ||
      state.clientInfo.contactName ||
      state.clientInfo.name ||
      "",
    contactEmail: existingIntake?.contactEmail || state.clientInfo.contactEmail || "",
    contactPhone: existingIntake?.contactPhone || state.clientInfo.contactPhone || "",
    website: existingIntake?.website || state.clientInfo.website || "",
    masterAddress: existingIntake?.masterAddress ?? defaultMasterAddress(),
    listingPlatforms: existingIntake?.listingPlatforms ?? [],
    website2: existingIntake?.website2 ?? defaultWebsiteData(),
    hosting: existingIntake?.hosting ?? defaultHostingData(),
    sectionNotes: existingIntake?.sectionNotes ?? [],
    globalCustomNote: existingIntake?.globalCustomNote ?? "",
    flaggedForFollowUp: existingIntake?.flaggedForFollowUp ?? false,
  }));

  function setField<K extends keyof HomeServicesIntakeRecord>(
    key: K,
    value: HomeServicesIntakeRecord[K]
  ) {
    const updated = { ...intake, [key]: value };
    setIntake(updated);
    onUpdate({
      intakeRecord: updated,
      clientInfo: {
        ...state.clientInfo,
        businessName: updated.businessName || state.clientInfo.businessName,
        name: updated.contactName || state.clientInfo.name,
        contactName: updated.contactName || state.clientInfo.contactName,
        contactEmail: updated.contactEmail || state.clientInfo.contactEmail,
        contactPhone: updated.contactPhone || state.clientInfo.contactPhone,
        website: updated.website || state.clientInfo.website,
      },
      selectedGoals:
        updated.primaryGoals.length > 0 ? updated.primaryGoals : state.selectedGoals,
    });
  }

  // ── Listing platform helpers ───────────────────────────────────────────────

  function getPlatformData(platformId: string): ListingPlatformData | undefined {
    return intake.listingPlatforms.find((p) => p.platformId === platformId);
  }

  function setPlatformData(data: ListingPlatformData) {
    const updated = intake.listingPlatforms.filter(
      (p) => p.platformId !== data.platformId
    );
    updated.push(data);
    setField("listingPlatforms", updated);

    // Sync gbpListingCount from GBP entry
    if (data.platformId === "gbp") {
      setField(
        "gbpListingCount",
        data.url ? 1 : 0
      );
    }
  }

  // ── WebsiteData helpers ────────────────────────────────────────────────────

  function setWebsiteField<K extends keyof WebsiteData>(key: K, value: WebsiteData[K]) {
    setField("website2", { ...intake.website2, [key]: value });
  }

  // ── HostingData helpers ────────────────────────────────────────────────────

  function setHostingField<K extends keyof HostingData>(key: K, value: HostingData[K]) {
    setField("hosting", { ...intake.hosting, [key]: value });
  }

  // ── MasterAddress helpers ──────────────────────────────────────────────────

  function setAddressField<K extends keyof MasterAddress>(key: K, value: MasterAddress[K]) {
    setField("masterAddress", { ...intake.masterAddress, [key]: value });
  }

  const [s1, t1] = countSection1(intake);
  const [s2, t2] = countSection2(intake);
  const [s3, t3] = countSection3(intake);
  const [s4, t4] = countSection4(intake);
  const [s5, t5] = countSection5(intake);

  const sourceOptions = INTAKE_SOURCE_OPTIONS.map((s) => s.label);

  const websiteStatus = intake.website2.hasWebsite;
  const hostingSituation = intake.hosting.currentSituation;
  const showProviderName =
    hostingSituation !== "no-hosting" && hostingSituation !== "part-of-package";
  const showHostingCost =
    hostingSituation === "self-managed" || hostingSituation === "other-agency";

  function applySampleData() {
    const sample = buildSampleIntakeRecord();
    setIntake(sample);
    onUpdate({
      intakeRecord: sample,
      clientInfo: {
        ...state.clientInfo,
        businessName: sample.businessName,
        name: sample.contactName,
        contactName: sample.contactName,
        contactEmail: sample.contactEmail,
        contactPhone: sample.contactPhone,
        website: sample.website,
      },
      selectedGoals: sample.primaryGoals,
    });
  }

  return (
    <div className="space-y-4">

      {/* ── Sample data utility bar ───────────────────────────── */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl border"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <button
          type="button"
          onClick={applySampleData}
          className="text-xs font-bold px-3 py-1.5 rounded-lg border transition-all hover:opacity-80"
          style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}
        >
          Use Sample Data
        </button>
        <p className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>
          Quickly fill this form with example data for testing.
        </p>
      </div>


      {/* ── Flagged follow-up warning banner ─────────────────────────────── */}
      {intake.flaggedForFollowUp && (
        <div
          className="rounded-xl border px-5 py-4 flex items-start gap-3"
          style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#D97706"
            strokeWidth="2"
            className="flex-shrink-0 mt-0.5"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div>
            <p className="text-sm font-bold" style={{ color: "#92400E" }}>
              This intake is flagged for follow-up.
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#B45309" }}>
              Complete additional information before proceeding to audit.
            </p>
          </div>
        </div>
      )}

      {/* ── Section 1: Business Information ──────────────────────────────── */}
      <SectionCard
        number={1}
        title="Business Information"
        completedCount={s1}
        totalCount={t1}
        defaultOpen={true}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput
            label="Business Name"
            value={intake.businessName}
            onChange={(v) => setField("businessName", v)}
            placeholder="e.g. Summit Landscaping"
            required
          />
          <SelectInput
            label="Trade / Service Type"
            value={intake.tradeType}
            onChange={(v) => setField("tradeType", v)}
            options={TRADE_TYPES}
            required
          />
          <SelectInput
            label="Business Structure"
            value={intake.businessStructure}
            onChange={(v) => setField("businessStructure", v)}
            options={BUSINESS_STRUCTURES}
          />
          <NumberInput
            label="Number of Locations"
            value={intake.locationCount}
            onChange={(v) => setField("locationCount", v ?? 1)}
            placeholder="1"
          />
        </div>

        <div className="mt-4">
          <TagInput
            label="Service Area (cities)"
            tags={intake.serviceArea}
            onAdd={(tag) => setField("serviceArea", [...intake.serviceArea, tag])}
            onRemove={(tag) =>
              setField(
                "serviceArea",
                intake.serviceArea.filter((t) => t !== tag)
              )
            }
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <NumberInput
            label="Years in Business"
            value={intake.yearsInBusiness}
            onChange={(v) => setField("yearsInBusiness", v ?? 0)}
            placeholder="0"
          />
          <TextInput
            label="Primary Phone"
            value={intake.phone}
            onChange={(v) => setField("phone", v)}
            placeholder="(555) 555-5555"
          />
          <TextInput
            label="Business Email"
            value={intake.email}
            onChange={(v) => setField("email", v)}
            placeholder="info@business.com"
            type="email"
          />
          <TextInput
            label="Website URL"
            value={intake.website}
            onChange={(v) => setField("website", v)}
            placeholder="https://www.example.com"
            type="url"
          />
        </div>

        {/* Master Business Address */}
        <div className="mt-5 pt-4 border-t" style={{ borderColor: "var(--rtm-border)" }}>
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-3"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            Master Business Address
          </p>
          <p className="text-xs mb-3" style={{ color: "var(--rtm-text-muted)" }}>
            This address is the citation audit baseline. All listing platforms will be compared against it for NAP consistency.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <TextInput
                label="Street Address"
                value={intake.masterAddress.street}
                onChange={(v) => setAddressField("street", v)}
                placeholder="123 Main Street"
              />
            </div>
            <TextInput
              label="Suite / Unit"
              value={intake.masterAddress.suite}
              onChange={(v) => setAddressField("suite", v)}
              placeholder="Suite 100 (optional)"
            />
            <TextInput
              label="City"
              value={intake.masterAddress.city}
              onChange={(v) => setAddressField("city", v)}
              placeholder="e.g. Chicago"
            />
            <TextInput
              label="State"
              value={intake.masterAddress.state}
              onChange={(v) => setAddressField("state", v)}
              placeholder="e.g. IL"
            />
            <TextInput
              label="ZIP Code"
              value={intake.masterAddress.zip}
              onChange={(v) => setAddressField("zip", v)}
              placeholder="e.g. 60601"
            />
            <TextInput
              label="Country"
              value={intake.masterAddress.country}
              onChange={(v) => setAddressField("country", v)}
              placeholder="United States"
            />
          </div>
        </div>

        <div className="mt-4 space-y-1">
          <YesNoToggle
            label="Licensed and Insured"
            value={intake.licensed}
            onChange={(v) => setField("licensed", v)}
          />
          <YesNoToggle
            label="Bonded"
            value={intake.bonded}
            onChange={(v) => setField("bonded", v)}
          />
        </div>

        <SectionNoteField
          sectionId="section-1"
          sectionNotes={intake.sectionNotes}
          onChange={(notes) => setField("sectionNotes", notes)}
        />
      </SectionCard>

      {/* ── Section 2: Contact Information ───────────────────────────────── */}
      <SectionCard
        number={2}
        title="Contact Information"
        completedCount={s2}
        totalCount={t2}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput
            label="Contact Name"
            value={intake.contactName}
            onChange={(v) => setField("contactName", v)}
            placeholder="e.g. Marcus Webb"
            required
          />
          <SelectInput
            label="Role"
            value={intake.contactRole}
            onChange={(v) => setField("contactRole", v)}
            options={CONTACT_ROLES}
          />
          <TextInput
            label="Contact Phone"
            value={intake.contactPhone}
            onChange={(v) => setField("contactPhone", v)}
            placeholder="(555) 555-5555"
          />
          <TextInput
            label="Contact Email"
            value={intake.contactEmail}
            onChange={(v) => setField("contactEmail", v)}
            placeholder="contact@business.com"
            type="email"
          />
          <SelectInput
            label="Preferred Contact Method"
            value={intake.preferredContact}
            onChange={(v) => setField("preferredContact", v)}
            options={PREFERRED_CONTACT_METHODS}
          />
          <TextInput
            label="Best Time to Reach"
            value={intake.bestTimeToReach}
            onChange={(v) => setField("bestTimeToReach", v)}
            placeholder="e.g. Weekdays 9am–5pm"
          />
        </div>

        <SectionNoteField
          sectionId="section-2"
          sectionNotes={intake.sectionNotes}
          onChange={(notes) => setField("sectionNotes", notes)}
        />
      </SectionCard>

      {/* ── Section 3: Current Online Presence ───────────────────────────── */}
      <SectionCard
        number={3}
        title="Current Online Presence"
        completedCount={s3}
        totalCount={t3}
      >

        {/* 3A — Listings and Reviews */}
        <SubLabel>Listings and Reviews</SubLabel>
        <p className="text-xs mb-4" style={{ color: "var(--rtm-text-muted)" }}>
          Expand each platform to enter listing details. URL, NAP data, ratings, and review counts help the citation audit identify inconsistencies.
        </p>
        <div className="space-y-2">
          {LISTING_PLATFORM_DEFINITIONS.map((platformDef) => (
            <PlatformBlock
              key={platformDef.id}
              platformDef={platformDef}
              platformData={getPlatformData(platformDef.id)}
              onChange={setPlatformData}
            />
          ))}
        </div>

        {/* 3B — Website */}
        <SubLabel>Website</SubLabel>
        <div className="space-y-4">
          <SelectInput
            label="Do you have a website?"
            value={
              websiteStatus === "yes"
                ? "Yes"
                : websiteStatus === "no"
                ? "No"
                : websiteStatus === "in-progress"
                ? "In Progress"
                : ""
            }
            onChange={(v) => {
              const mapped =
                v === "Yes" ? "yes" : v === "No" ? "no" : v === "In Progress" ? "in-progress" : "no";
              setWebsiteField("hasWebsite", mapped as WebsiteData["hasWebsite"]);
            }}
            options={WEBSITE_STATUS_OPTIONS}
            placeholder="Select status"
          />

          {websiteStatus === "yes" && (
            <>
              <TextInput
                label="Website URL"
                value={intake.website2.url}
                onChange={(v) => setWebsiteField("url", v)}
                placeholder="https://www.yourbusiness.com"
                type="url"
                helpText="The main domain name for your website"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectInput
                  label="Website Platform"
                  value={intake.website2.platform}
                  onChange={(v) => setWebsiteField("platform", v)}
                  options={WEBSITE_PLATFORMS}
                  placeholder="Select platform"
                />
                <TextInput
                  label="Hosting Provider"
                  value={intake.website2.hostingProvider}
                  onChange={(v) => setWebsiteField("hostingProvider", v)}
                  placeholder="e.g. GoDaddy, Bluehost, WP Engine"
                  helpText="Who hosts your website (optional)"
                />
                <TextInput
                  label="Domain Registrar"
                  value={intake.website2.domainRegistrar}
                  onChange={(v) => setWebsiteField("domainRegistrar", v)}
                  placeholder="e.g. GoDaddy, Namecheap"
                  helpText="Where your domain name is registered (optional)"
                />
                <SelectInput
                  label="Do you have access to your hosting account?"
                  value={
                    intake.website2.hasHostingAccess === "yes"
                      ? "Yes"
                      : intake.website2.hasHostingAccess === "no"
                      ? "No"
                      : intake.website2.hasHostingAccess === "not-sure"
                      ? "Not Sure"
                      : ""
                  }
                  onChange={(v) => {
                    const mapped =
                      v === "Yes" ? "yes" : v === "No" ? "no" : "not-sure";
                    setWebsiteField("hasHostingAccess", mapped as WebsiteData["hasHostingAccess"]);
                  }}
                  options={ACCESS_STATUS_OPTIONS}
                />
                <SelectInput
                  label="Do you have access to your domain account?"
                  value={
                    intake.website2.hasDomainAccess === "yes"
                      ? "Yes"
                      : intake.website2.hasDomainAccess === "no"
                      ? "No"
                      : intake.website2.hasDomainAccess === "not-sure"
                      ? "Not Sure"
                      : ""
                  }
                  onChange={(v) => {
                    const mapped =
                      v === "Yes" ? "yes" : v === "No" ? "no" : "not-sure";
                    setWebsiteField("hasDomainAccess", mapped as WebsiteData["hasDomainAccess"]);
                  }}
                  options={ACCESS_STATUS_OPTIONS}
                />
                <SelectInput
                  label="Are you interested in a website redesign?"
                  value={
                    intake.website2.interestedInRedesign === "yes"
                      ? REDESIGN_INTEREST_OPTIONS[0]
                      : intake.website2.interestedInRedesign === "maybe"
                      ? REDESIGN_INTEREST_OPTIONS[1]
                      : intake.website2.interestedInRedesign === "no"
                      ? REDESIGN_INTEREST_OPTIONS[2]
                      : ""
                  }
                  onChange={(v) => {
                    const mapped =
                      v === REDESIGN_INTEREST_OPTIONS[0]
                        ? "yes"
                        : v === REDESIGN_INTEREST_OPTIONS[2]
                        ? "no"
                        : "maybe";
                    setWebsiteField("interestedInRedesign", mapped as WebsiteData["interestedInRedesign"]);
                  }}
                  options={REDESIGN_INTEREST_OPTIONS}
                />
                <SelectInput
                  label="When was the website last updated?"
                  value={intake.website2.lastUpdated}
                  onChange={(v) => setWebsiteField("lastUpdated", v)}
                  options={WEBSITE_LAST_UPDATED_OPTIONS}
                />
              </div>
            </>
          )}

          {websiteStatus === "no" && (
            <>
              <SelectInput
                label="Are you interested in building a new website?"
                value={
                  intake.website2.interestedInNewBuild === "yes"
                    ? NEW_BUILD_INTEREST_OPTIONS[0]
                    : intake.website2.interestedInNewBuild === "maybe"
                    ? NEW_BUILD_INTEREST_OPTIONS[1]
                    : intake.website2.interestedInNewBuild === "no"
                    ? NEW_BUILD_INTEREST_OPTIONS[2]
                    : ""
                }
                onChange={(v) => {
                  const mapped =
                    v === NEW_BUILD_INTEREST_OPTIONS[0]
                      ? "yes"
                      : v === NEW_BUILD_INTEREST_OPTIONS[2]
                      ? "no"
                      : "maybe";
                  setWebsiteField("interestedInNewBuild", mapped as WebsiteData["interestedInNewBuild"]);
                }}
                options={NEW_BUILD_INTEREST_OPTIONS}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectInput
                  label="Do you already have a domain name?"
                  value={intake.website2.hasDomain ? "Yes" : intake.website2.hasDomain === false && intake.website2.domainName === "" ? "No" : ""}
                  onChange={(v) => setWebsiteField("hasDomain", v === "Yes")}
                  options={["Yes", "No"]}
                />
                {intake.website2.hasDomain && (
                  <TextInput
                    label="What is the domain name?"
                    value={intake.website2.domainName}
                    onChange={(v) => setWebsiteField("domainName", v)}
                    placeholder="e.g. yourbusiness.com"
                  />
                )}
                <SelectInput
                  label="Preferred platform if known"
                  value={intake.website2.preferredPlatform}
                  onChange={(v) => setWebsiteField("preferredPlatform", v)}
                  options={[...WEBSITE_PLATFORMS, "Not sure"]}
                />
              </div>
            </>
          )}

          {websiteStatus === "in-progress" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextInput
                  label="What is the domain name?"
                  value={intake.website2.inProgressDomain}
                  onChange={(v) => setWebsiteField("inProgressDomain", v)}
                  placeholder="e.g. yourbusiness.com"
                />
                <SelectInput
                  label="Who is building the website?"
                  value={
                    intake.website2.inProgressBuilder === "us"
                      ? WEBSITE_BUILDER_OPTIONS[0]
                      : intake.website2.inProgressBuilder === "other-agency"
                      ? WEBSITE_BUILDER_OPTIONS[1]
                      : intake.website2.inProgressBuilder === "diy"
                      ? WEBSITE_BUILDER_OPTIONS[2]
                      : ""
                  }
                  onChange={(v) => {
                    const mapped =
                      v === WEBSITE_BUILDER_OPTIONS[0]
                        ? "us"
                        : v === WEBSITE_BUILDER_OPTIONS[1]
                        ? "other-agency"
                        : "diy";
                    setWebsiteField("inProgressBuilder", mapped as WebsiteData["inProgressBuilder"]);
                  }}
                  options={WEBSITE_BUILDER_OPTIONS}
                />
                <div>
                  <FieldLabel>Expected Completion Date</FieldLabel>
                  <input
                    type="date"
                    value={intake.website2.inProgressETA}
                    onChange={(e) => setWebsiteField("inProgressETA", e.target.value)}
                    className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    style={{
                      background: "var(--rtm-bg)",
                      borderColor: "var(--rtm-border)",
                      color: "var(--rtm-text-primary)",
                    }}
                  />
                  <HelpText>Optional</HelpText>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 3C — Web Hosting */}
        <SubLabel>Web Hosting</SubLabel>
        <div className="space-y-4">
          <SelectInput
            label="Current Hosting Situation"
            value={
              hostingSituation === "managed-by-us"
                ? HOSTING_SITUATION_OPTIONS[0]
                : hostingSituation === "self-managed"
                ? HOSTING_SITUATION_OPTIONS[1]
                : hostingSituation === "other-agency"
                ? HOSTING_SITUATION_OPTIONS[2]
                : hostingSituation === "no-hosting"
                ? HOSTING_SITUATION_OPTIONS[3]
                : hostingSituation === "part-of-package"
                ? HOSTING_SITUATION_OPTIONS[4]
                : ""
            }
            onChange={(v) => {
              const mapped =
                v === HOSTING_SITUATION_OPTIONS[0]
                  ? "managed-by-us"
                  : v === HOSTING_SITUATION_OPTIONS[1]
                  ? "self-managed"
                  : v === HOSTING_SITUATION_OPTIONS[2]
                  ? "other-agency"
                  : v === HOSTING_SITUATION_OPTIONS[3]
                  ? "no-hosting"
                  : "part-of-package";
              setHostingField("currentSituation", mapped as HostingData["currentSituation"]);
            }}
            options={HOSTING_SITUATION_OPTIONS}
            placeholder="Select current situation"
          />

          {showProviderName && (
            <TextInput
              label="Hosting Account or Provider Name"
              value={intake.hosting.providerName}
              onChange={(v) => setHostingField("providerName", v)}
              placeholder="e.g. WP Engine, GoDaddy cPanel"
            />
          )}

          {showHostingCost && (
            <NumberInput
              label="Monthly Hosting Cost (approximate)"
              value={intake.hosting.monthlyCost}
              onChange={(v) => setHostingField("monthlyCost", v)}
              placeholder="e.g. 25"
              prefix="$"
            />
          )}

          <SelectInput
            label="Are you interested in managed hosting?"
            value={
              intake.hosting.interestedInManagedHosting === "yes"
                ? MANAGED_HOSTING_INTEREST_OPTIONS[0]
                : intake.hosting.interestedInManagedHosting === "maybe"
                ? MANAGED_HOSTING_INTEREST_OPTIONS[1]
                : intake.hosting.interestedInManagedHosting === "no"
                ? MANAGED_HOSTING_INTEREST_OPTIONS[2]
                : ""
            }
            onChange={(v) => {
              const mapped =
                v === MANAGED_HOSTING_INTEREST_OPTIONS[0]
                  ? "yes"
                  : v === MANAGED_HOSTING_INTEREST_OPTIONS[2]
                  ? "no"
                  : "maybe";
              setHostingField("interestedInManagedHosting", mapped as HostingData["interestedInManagedHosting"]);
            }}
            options={MANAGED_HOSTING_INTEREST_OPTIONS}
          />
        </div>

        {/* 3D — Current Marketing */}
        <SubLabel>Current Marketing</SubLabel>
        <div className="space-y-2">
          <YesNoToggle
            label="Currently Running Digital Marketing"
            value={intake.currentlyMarketing}
            onChange={(v) => setField("currentlyMarketing", v)}
          />
          {intake.currentlyMarketing && (
            <div className="pl-4 space-y-3 mt-2">
              <TextInput
                label="Current Provider"
                value={intake.currentProvider}
                onChange={(v) => setField("currentProvider", v)}
                placeholder="Agency or platform name"
              />
              <NumberInput
                label="Monthly Marketing Spend"
                value={intake.monthlyMarketingSpend}
                onChange={(v) => setField("monthlyMarketingSpend", v ?? 0)}
                prefix="$"
              />
            </div>
          )}
          <YesNoToggle
            label="Google Ads Active"
            value={intake.googleAdsActive}
            onChange={(v) => setField("googleAdsActive", v)}
          />
          {intake.googleAdsActive && (
            <div className="pl-4 mt-2">
              <NumberInput
                label="Google Ads Monthly Spend"
                value={intake.googleAdsSpend}
                onChange={(v) => setField("googleAdsSpend", v ?? 0)}
                prefix="$"
              />
            </div>
          )}
          <YesNoToggle
            label="LSA (Local Service Ads) Active"
            value={intake.lsaActive}
            onChange={(v) => setField("lsaActive", v)}
          />
          {intake.lsaActive && (
            <div className="pl-4 grid grid-cols-2 gap-3 mt-2">
              <NumberInput
                label="LSA Monthly Spend"
                value={intake.lsaSpend}
                onChange={(v) => setField("lsaSpend", v ?? 0)}
                prefix="$"
              />
              <NumberInput
                label="LSA Cost Per Lead"
                value={intake.lsaCostPerLead}
                onChange={(v) => setField("lsaCostPerLead", v ?? 0)}
                prefix="$"
              />
            </div>
          )}
          <YesNoToggle
            label="Meta Ads Active"
            value={intake.metaAdsActive}
            onChange={(v) => setField("metaAdsActive", v)}
          />
          {intake.metaAdsActive && (
            <div className="pl-4 mt-2">
              <NumberInput
                label="Meta Ads Monthly Spend"
                value={intake.metaAdsSpend}
                onChange={(v) => setField("metaAdsSpend", v ?? 0)}
                prefix="$"
              />
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <NumberInput
              label="Approximate Monthly Leads"
              value={intake.monthlyLeads}
              onChange={(v) => setField("monthlyLeads", v ?? 0)}
            />
            <SelectInput
              label="Primary Lead Source"
              value={intake.primaryLeadSource}
              onChange={(v) => setField("primaryLeadSource", v)}
              options={PRIMARY_LEAD_SOURCES}
            />
          </div>
        </div>

        <SectionNoteField
          sectionId="section-3"
          sectionNotes={intake.sectionNotes}
          onChange={(notes) => setField("sectionNotes", notes)}
        />
      </SectionCard>

      {/* ── Section 4: Goals and Budget ──────────────────────────────────── */}
      <SectionCard
        number={4}
        title="Goals and Budget"
        completedCount={s4}
        totalCount={t4}
      >
        <div className="mb-4">
          <FieldLabel required>Primary Goals</FieldLabel>
          <p className="text-xs mb-2" style={{ color: "var(--rtm-text-muted)" }}>
            Select at least one goal. At least one goal is required to proceed.
          </p>
          <GoalChips
            goals={HOME_SERVICE_GOALS}
            selected={intake.primaryGoals}
            onToggle={(g) => {
              const updated = intake.primaryGoals.includes(g)
                ? intake.primaryGoals.filter((x) => x !== g)
                : [...intake.primaryGoals, g];
              setField("primaryGoals", updated);
            }}
          />
          {intake.primaryGoals.length === 0 && (
            <p className="mt-2 text-xs" style={{ color: "#DC2626" }}>
              At least one goal must be selected to continue.
            </p>
          )}
          {intake.primaryGoals.length > 0 && (
            <div
              className="mt-3 rounded-lg border px-4 py-2"
              style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}
            >
              <p className="text-xs font-semibold" style={{ color: "#15803D" }}>
                {intake.primaryGoals.length} goal
                {intake.primaryGoals.length !== 1 ? "s" : ""} selected
              </p>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectInput
            label="Target Monthly Budget"
            value={intake.targetBudget}
            onChange={(v) => setField("targetBudget", v)}
            options={BUDGET_RANGES}
          />
          <SelectInput
            label="Timeline"
            value={intake.timeline}
            onChange={(v) => setField("timeline", v)}
            options={TIMELINE_OPTIONS}
          />
          <SelectInput
            label="Seasonal Considerations"
            value={intake.seasonalConsiderations}
            onChange={(v) => setField("seasonalConsiderations", v)}
            options={SEASONAL_OPTIONS}
          />
          <SelectInput
            label="Target Customer Type"
            value={intake.targetCustomerType}
            onChange={(v) => setField("targetCustomerType", v)}
            options={CUSTOMER_TYPES}
          />
          <SelectInput
            label="Average Job Value"
            value={intake.averageJobValue}
            onChange={(v) => setField("averageJobValue", v)}
            options={JOB_VALUE_RANGES}
          />
        </div>
        <div className="mt-4">
          <CompetitorFields
            competitors={intake.competitors}
            onChange={(c) => setField("competitors", c)}
          />
        </div>

        <SectionNoteField
          sectionId="section-4"
          sectionNotes={intake.sectionNotes}
          onChange={(notes) => setField("sectionNotes", notes)}
        />
      </SectionCard>

      {/* ── Section 5: Sales Context ─────────────────────────────────────── */}
      <SectionCard
        number={5}
        title="Sales Context"
        completedCount={s5}
        totalCount={t5}
        warning={intake.flaggedForFollowUp}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectInput
            label="Lead Source"
            value={intake.leadSource}
            onChange={(v) => setField("leadSource", v)}
            options={sourceOptions}
          />
          <SelectInput
            label="Assigned Rep"
            value={intake.assignedRep}
            onChange={(v) => setField("assignedRep", v)}
            options={["Jordan M.", "Sarah K.", "Mike T.", "Alex R."]}
          />
          {intake.leadSource === "Referral" && (
            <TextInput
              label="Referral Source"
              value={intake.referralSource}
              onChange={(v) => setField("referralSource", v)}
              placeholder="Name or business"
            />
          )}
          {intake.leadSource === "Affiliate" && (
            <TextInput
              label="Affiliate Partner"
              value={intake.affiliatePartner}
              onChange={(v) => setField("affiliatePartner", v)}
              placeholder="Affiliate name"
            />
          )}
          <div className="sm:col-span-2">
            <TextInput
              label="How Did They Hear About Us"
              value={intake.howHeardAboutUs}
              onChange={(v) => setField("howHeardAboutUs", v)}
              placeholder="e.g. Google search, friend recommendation..."
            />
          </div>
        </div>
        <div className="mt-4 space-y-4">
          <TextareaInput
            label="Discovery Notes"
            value={intake.discoveryNotes}
            onChange={(v) => setField("discoveryNotes", v)}
            placeholder="Key points from discovery call..."
            rows={3}
          />
          <TextareaInput
            label="Pain Points Mentioned"
            value={intake.painPoints}
            onChange={(v) => setField("painPoints", v)}
            placeholder="What pain points did they express?"
            rows={2}
          />
          <TextareaInput
            label="Objections Raised"
            value={intake.objections}
            onChange={(v) => setField("objections", v)}
            placeholder="Any objections to address?"
            rows={2}
          />
          <TextareaInput
            label="Special Requirements"
            value={intake.specialRequirements}
            onChange={(v) => setField("specialRequirements", v)}
            placeholder="Any special requests or requirements?"
            rows={2}
          />
          <TextareaInput
            label="Internal Notes"
            value={intake.internalNotes}
            onChange={(v) => setField("internalNotes", v)}
            placeholder="Internal team notes — not visible to client"
            rows={2}
            internal
          />
        </div>

        <SectionNoteField
          sectionId="section-5"
          sectionNotes={intake.sectionNotes}
          onChange={(notes) => setField("sectionNotes", notes)}
        />

        {/* Global Custom Note + Follow-Up Flag */}
        <SectionDivider />

        <div className="space-y-4">
          <TextareaInput
            label="Additional Information"
            value={intake.globalCustomNote}
            onChange={(v) => setField("globalCustomNote", v)}
            placeholder="Any information not captured above that is relevant to this prospect..."
            rows={3}
            internal
            helpText="Internal use only. Not shared with client."
          />

          <div
            className="flex items-start gap-3 p-4 rounded-lg border"
            style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}
          >
            <input
              id="flagFollowUp"
              type="checkbox"
              checked={intake.flaggedForFollowUp}
              onChange={(e) => setField("flaggedForFollowUp", e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded accent-amber-500 flex-shrink-0"
            />
            <div>
              <label
                htmlFor="flagFollowUp"
                className="text-sm font-semibold cursor-pointer"
                style={{ color: "var(--rtm-text-primary)" }}
              >
                Flag this intake for follow-up before proceeding to audit
              </label>
              <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                Check this if you need to gather more information before running the audit.
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Validation summary */}
      {(intake.primaryGoals.length === 0 ||
        !intake.businessName ||
        !intake.tradeType ||
        !intake.contactName ||
        intake.flaggedForFollowUp) && (
        <div
          className="rounded-xl border px-5 py-4"
          style={{
            background: intake.flaggedForFollowUp ? "#FFFBEB" : "#FFF7ED",
            borderColor: intake.flaggedForFollowUp ? "#FDE68A" : "#FDBA74",
          }}
        >
          <p
            className="text-sm font-bold mb-1"
            style={{ color: intake.flaggedForFollowUp ? "#92400E" : "#C2410C" }}
          >
            {intake.flaggedForFollowUp
              ? "Intake flagged for follow-up"
              : "Required fields incomplete"}
          </p>
          <ul
            className="text-xs space-y-0.5"
            style={{ color: intake.flaggedForFollowUp ? "#B45309" : "#EA580C" }}
          >
            {intake.flaggedForFollowUp && (
              <li>
                This intake is flagged for follow-up. Complete additional information before
                proceeding.
              </li>
            )}
            {!intake.businessName && <li>Business Name is required (Section 1)</li>}
            {!intake.tradeType && <li>Trade / Service Type is required (Section 1)</li>}
            {!intake.contactName && <li>Contact Name is required (Section 2)</li>}
            {intake.primaryGoals.length === 0 && (
              <li>At least one goal is required (Section 4)</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
