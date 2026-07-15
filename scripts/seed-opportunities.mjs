/**
 * RTM OS — Seed data/sales-opportunities.json
 *
 * Converts the 6 MOCK_OPPORTUNITY_RECORDS that previously lived inside
 * app/(sales)/sales/pipeline/page.tsx into real OpportunityRecord shape
 * and writes them to data/sales-opportunities.json so the real store
 * becomes the primary source of truth for the Opportunities sub-tab.
 *
 * Run: node scripts/seed-opportunities.mjs
 *
 * Safe to re-run — it MERGES by id (last-write-wins on duplicate id).
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "..", "data", "sales-opportunities.json");

// ── Seed records (converted from MOCK_OPPORTUNITY_RECORDS) ───────────────────

const SEED_RECORDS = [
  {
    id: "opp-mock-001",
    opportunityNumber: "OPP-2025-1001",
    leadId: "L001",
    clientName: "Marcus Webb",
    businessName: "Summit Landscaping",
    tradeType: "Landscaping / Lawn Care",
    contactName: "Marcus Webb",
    contactPhone: "(512) 555-0101",
    contactEmail: "marcus@summitlandscaping.com",
    leadSource: "Affiliate",
    assignedRep: "Jordan M.",
    stage: "Discovery Complete",
    priority: "High",
    estimatedMonthlyValue: 2400,
    expectedCloseDate: "2025-02-14",
    serviceInterest: ["SEO", "GBP"],
    discoveryNotes: "Owner is motivated, has budget, wants full SEO + GBP package.",
    ghlContactId: "GHL-CON-0001",
    ghlSynced: true,
    createdAt: "2025-01-10T09:00:00Z",
    updatedAt: "2025-01-10T09:00:00Z",
    intakeRecord: null,
    communicationLog: {
      opportunityId: "opp-mock-001",
      entries: [
        {
          id: "log-001-a",
          opportunityId: "opp-mock-001",
          type: "call",
          title: "Initial discovery call — Jan 10",
          summary:
            "Spoke with Marcus Webb about SEO and GBP goals. He wants to rank top 3 for landscaping in his area. Budget confirmed at $2,400/mo. Very motivated.",
          fullContent: "",
          loggedBy: "Jordan M.",
          loggedAt: "2025-01-10T09:30:00Z",
          participants: ["Marcus Webb", "Jordan M."],
          durationMinutes: 38,
          attachmentNote: "",
        },
        {
          id: "log-001-b",
          opportunityId: "opp-mock-001",
          type: "call-transcript",
          title: "Follow-up call transcript — Jan 14",
          summary:
            "Reviewed proposal pricing. Marcus asked about setup fees. Agreed to waive if contract signed by Jan 20.",
          fullContent:
            "Jordan M.: Hey Marcus, thanks for jumping on a call today.\nMarcus Webb: Of course, I looked over the proposal — looks solid.\nJordan M.: Great. Did you have any questions on the pricing?\nMarcus Webb: Yeah, the setup fee. Is that negotiable?\nJordan M.: For a 12-month commitment we can waive it if you sign by Jan 20.\nMarcus Webb: That works for me. Let me review with my wife and I'll get back to you.\nJordan M.: Sounds great. I'll follow up Friday.",
          loggedBy: "Jordan M.",
          loggedAt: "2025-01-14T14:00:00Z",
          participants: ["Marcus Webb", "Jordan M."],
          durationMinutes: 22,
          attachmentNote: "Zoom recording: zoom.us/rec/summit-jan14",
        },
      ],
    },
    activeWizardId: null,
  },
  {
    id: "opp-mock-002",
    opportunityNumber: "OPP-2025-1002",
    leadId: "L002",
    clientName: "Priya Sharma",
    businessName: "Blue Ridge Plumbing",
    tradeType: "Plumbing",
    contactName: "Priya Sharma",
    contactPhone: "(303) 555-0202",
    contactEmail: "priya@blueridgeplumbing.com",
    leadSource: "Website",
    assignedRep: "Sarah K.",
    stage: "New Opportunity",
    priority: "Medium",
    estimatedMonthlyValue: 1800,
    expectedCloseDate: "2025-02-28",
    serviceInterest: ["SEO", "PPC", "GBP"],
    discoveryNotes: "Wants to rank #1 for Denver plumber.",
    ghlContactId: "GHL-CON-0002",
    ghlSynced: true,
    createdAt: "2025-01-11T10:00:00Z",
    updatedAt: "2025-01-11T10:00:00Z",
    intakeRecord: null,
    communicationLog: {
      opportunityId: "opp-mock-002",
      entries: [
        {
          id: "log-002-a",
          opportunityId: "opp-mock-002",
          type: "email",
          title: "Intro email sent — Jan 11",
          summary:
            "Sent intro email introducing RTM OS services, included case study PDF for home services SEO.",
          fullContent: "",
          loggedBy: "Sarah K.",
          loggedAt: "2025-01-11T11:00:00Z",
          participants: ["Priya Sharma"],
          durationMinutes: null,
          attachmentNote: "Case study PDF: rtm-home-services-case-study.pdf",
        },
      ],
    },
    activeWizardId: null,
  },
  {
    id: "opp-mock-003",
    opportunityNumber: "OPP-2025-1003",
    leadId: "L014",
    clientName: "Rachel Torres",
    businessName: "Horizon Roofing Solutions",
    tradeType: "Roofing",
    contactName: "Rachel Torres",
    contactPhone: "(214) 555-1414",
    contactEmail: "rtorres@horizonroofing.com",
    leadSource: "Google Ads",
    assignedRep: "Sarah K.",
    stage: "Audit Requested",
    priority: "High",
    estimatedMonthlyValue: 3600,
    expectedCloseDate: "2025-02-07",
    serviceInterest: ["LSA", "PPC", "GBP", "SEO"],
    discoveryNotes: "Storm damage roofing. Seasonal spikes.",
    ghlContactId: "GHL-CON-0014",
    ghlSynced: false,
    createdAt: "2025-01-09T11:00:00Z",
    updatedAt: "2025-01-09T11:00:00Z",
    intakeRecord: null,
    communicationLog: {
      opportunityId: "opp-mock-003",
      entries: [],
    },
    activeWizardId: null,
  },
  {
    id: "opp-mock-004",
    opportunityNumber: "OPP-2025-1004",
    leadId: "L015",
    clientName: "Jake Morrison",
    businessName: "Morrison HVAC & Cooling",
    tradeType: "HVAC",
    contactName: "Jake Morrison",
    contactPhone: "(602) 555-1515",
    contactEmail: "jake@morrisonhvac.com",
    leadSource: "Referral",
    assignedRep: "Alex R.",
    stage: "Proposal Sent",
    priority: "Medium",
    estimatedMonthlyValue: 2800,
    expectedCloseDate: "2025-01-31",
    serviceInterest: ["SEO", "GBP", "PPC"],
    discoveryNotes: "Family-owned HVAC. Ready to scale.",
    ghlContactId: "GHL-CON-0015",
    ghlSynced: true,
    createdAt: "2025-01-08T14:00:00Z",
    updatedAt: "2025-01-08T14:00:00Z",
    intakeRecord: null,
    communicationLog: {
      opportunityId: "opp-mock-004",
      entries: [],
    },
    activeWizardId: null,
  },
  {
    id: "opp-mock-005",
    opportunityNumber: "OPP-2025-1005",
    leadId: "L023",
    clientName: "Bradley Scott",
    businessName: "Atlas Electrical Services",
    tradeType: "Electrical",
    contactName: "Bradley Scott",
    contactPhone: "(801) 555-2323",
    contactEmail: "brad@atlaselectric.com",
    leadSource: "LSA",
    assignedRep: "Mike T.",
    stage: "Negotiation",
    priority: "High",
    estimatedMonthlyValue: 2700,
    expectedCloseDate: "2025-01-24",
    serviceInterest: ["LSA", "PPC", "GBP"],
    discoveryNotes: "Master electrician. Competitor already running LSA.",
    ghlContactId: "GHL-CON-0023",
    ghlSynced: true,
    createdAt: "2025-01-07T09:00:00Z",
    updatedAt: "2025-01-07T09:00:00Z",
    intakeRecord: null,
    communicationLog: {
      opportunityId: "opp-mock-005",
      entries: [],
    },
    activeWizardId: null,
  },
  {
    id: "opp-mock-006",
    opportunityNumber: "OPP-2025-1006",
    leadId: null,
    clientName: "Stephanie Lane",
    businessName: "GreenWave Lawn Care",
    tradeType: "Landscaping / Lawn Care",
    contactName: "Stephanie Lane",
    contactPhone: "(615) 555-4040",
    contactEmail: "slane@greenwave.com",
    leadSource: "Google Ads",
    assignedRep: "Alex R.",
    stage: "Audit Requested",
    priority: "Low",
    estimatedMonthlyValue: 2400,
    expectedCloseDate: "2025-03-01",
    serviceInterest: ["LSA", "SEO", "GBP"],
    discoveryNotes: "Regional lawn care company expanding into new markets.",
    ghlContactId: "",
    ghlSynced: false,
    createdAt: "2025-01-06T08:00:00Z",
    updatedAt: "2025-01-06T08:00:00Z",
    intakeRecord: null,
    communicationLog: {
      opportunityId: "opp-mock-006",
      entries: [],
    },
    activeWizardId: null,
  },
];

// ── Read existing file ────────────────────────────────────────────────────────

let existing = { records: [] };
try {
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed.records)) existing = parsed;
} catch {
  /* file missing or corrupt — start fresh */
}

// ── Merge (seed wins only for new ids) ────────────────────────────────────────

const existingIds = new Set(existing.records.map((r) => r.id));
let added = 0;

for (const seed of SEED_RECORDS) {
  if (!existingIds.has(seed.id)) {
    existing.records.push(seed);
    existingIds.add(seed.id);
    added++;
  }
}

// ── Write ─────────────────────────────────────────────────────────────────────

const dir = path.dirname(DATA_FILE);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(DATA_FILE, JSON.stringify(existing, null, 2), "utf-8");

console.log(
  `✅  Seeded ${added} new record(s). Total records: ${existing.records.length}.`
);
