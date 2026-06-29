// RTM OS — Sales Intake Configuration
// Mock configuration that mirrors Settings → Sales Intake Forms → Intake Questions
// and Settings → Audit Goal Configuration.
//
// IMPORTANT: No business logic or field definitions should be hardcoded in UI pages.
// All intake fields and goals are consumed from this module (and eventually from
// real API calls to the configuration surfaces).

// ─── Intake Source Options ─────────────────────────────────────────────────────
// Prepares the affiliate/referral tracking required for the Affiliate Dashboard.

export interface IntakeSourceOption {
  value: string;
  label: string;
}

export const INTAKE_SOURCE_OPTIONS: IntakeSourceOption[] = [
  { value: "direct-sales",  label: "Direct Sales" },
  { value: "affiliate",     label: "Affiliate" },
  { value: "referral",      label: "Referral" },
  { value: "partner",       label: "Partner" },
  { value: "website",       label: "Website" },
  { value: "google-ads",    label: "Google Ads" },
  { value: "meta-ads",      label: "Meta Ads" },
  { value: "event",         label: "Event / Trade Show" },
  { value: "organic",       label: "Organic Search" },
  { value: "cold-outreach", label: "Cold Outreach" },
  { value: "lsa",           label: "Local Service Ads" },
  { value: "gbp",           label: "Google Business Profile" },
  { value: "other",         label: "Other" },
];

// ─── Business Size Options ─────────────────────────────────────────────────────

export const BUSINESS_SIZE_OPTIONS = [
  "Solo / 1 person",
  "2–5 employees",
  "6–15 employees",
  "16–50 employees",
  "51–150 employees",
  "150+ employees",
];

// ─── Industry Options ─────────────────────────────────────────────────────────

export const INDUSTRY_OPTIONS = [
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
];

// ─── Step 1 — Business Information ────────────────────────────────────────────
// Mirrors: Settings → Sales Intake Forms → Intake Questions → Business Section

export interface IntakeField {
  key: string;
  label: string;
  type: "text" | "email" | "phone" | "url" | "select" | "textarea" | "toggle" | "multiselect";
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  colSpan?: "full" | "half";
}

export const STEP1_BUSINESS_INFO_FIELDS: IntakeField[] = [
  {
    key: "businessName",
    label: "Business Name",
    type: "text",
    required: true,
    placeholder: "e.g. Metro Dental Group",
  },
  {
    key: "website",
    label: "Website URL",
    type: "url",
    required: true,
    placeholder: "https://www.example.com",
  },
  {
    key: "primaryContact",
    label: "Primary Contact Name",
    type: "text",
    required: true,
    placeholder: "e.g. Dr. Sarah Chen",
  },
  {
    key: "phone",
    label: "Phone Number",
    type: "phone",
    required: true,
    placeholder: "(555) 555-5555",
  },
  {
    key: "email",
    label: "Email Address",
    type: "email",
    required: true,
    placeholder: "contact@business.com",
  },
  {
    key: "industry",
    label: "Industry",
    type: "select",
    required: true,
    options: INDUSTRY_OPTIONS,
  },
  {
    key: "location",
    label: "Business Location (City, State)",
    type: "text",
    required: false,
    placeholder: "e.g. Chicago, IL",
  },
  {
    key: "businessSize",
    label: "Business Size",
    type: "select",
    required: false,
    options: BUSINESS_SIZE_OPTIONS,
  },
  {
    key: "businessType",
    label: "Business Type",
    type: "select",
    required: false,
    options: [
      "Single Location",
      "Multi-Location",
      "Franchise",
      "National Brand",
      "E-Commerce Only",
      "Service Area Business",
    ],
  },
  {
    key: "intakeSource",
    label: "Intake Source",
    type: "select",
    required: true,
    options: INTAKE_SOURCE_OPTIONS.map((o) => o.label),
    helpText: "How did this lead come in? Required for affiliate and referral tracking.",
  },
  {
    key: "affiliateName",
    label: "Affiliate / Referral Name",
    type: "text",
    required: false,
    placeholder: "Affiliate or referral partner name (if applicable)",
    helpText: "Leave blank for direct leads.",
  },
  {
    key: "assignedRep",
    label: "Assigned Sales Rep",
    type: "select",
    required: true,
    options: ["Jordan M.", "Sarah K.", "Mike T.", "Ryan B.", "Tina G.", "Carlos V.", "Megan S."],
  },
];

// ─── Step 2 — Goal Selection ───────────────────────────────────────────────────
// Mirrors: Settings → Audit Goal Configuration
// Goals should load from configuration — no hardcoding in UI pages.

export interface AuditGoalConfig {
  id: string;
  key: string;
  label: string;
  description: string;
  category: string;
  color: string;
  bg: string;
  border: string;
  auditSections: string[];
  recommendedServices: string[];
  active: boolean;
}

export const AUDIT_GOAL_CONFIG: AuditGoalConfig[] = [
  {
    id: "goal-leads",
    key: "generate-leads",
    label: "Generate More Leads",
    description: "Attract and convert new customers through digital channels",
    category: "Growth",
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    auditSections: ["Website Conversion", "Lead Form Analysis", "Call Tracking", "CRO Assessment"],
    recommendedServices: ["SEO", "GBP", "Google Ads", "Landing Pages", "Call Tracking"],
    active: true,
  },
  {
    id: "goal-calls",
    key: "phone-calls",
    label: "Increase Phone Calls",
    description: "Drive inbound phone calls from qualified local prospects",
    category: "Conversion",
    color: "#059669",
    bg: "#ECFDF5",
    border: "#A7F3D0",
    auditSections: ["Call Tracking", "GBP Calls", "LSA Setup", "Click-to-Call Analysis"],
    recommendedServices: ["GBP", "LSA", "Call Tracking", "Google Ads – Call Campaigns"],
    active: true,
  },
  {
    id: "goal-conversion",
    key: "website-conversion",
    label: "Improve Website Conversion",
    description: "Turn website visitors into leads, calls, and customers",
    category: "Conversion",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    auditSections: ["CRO Assessment", "UX Analysis", "Landing Page Quality", "Form Optimization"],
    recommendedServices: ["CRO", "Website Redesign", "Landing Pages", "Conversion Tracking"],
    active: true,
  },
  {
    id: "goal-seo",
    key: "seo",
    label: "Improve SEO",
    description: "Rank higher in organic search results for target keywords",
    category: "Visibility",
    color: "#0891B2",
    bg: "#ECFEFF",
    border: "#A5F3FC",
    auditSections: ["Technical SEO", "On-Page SEO", "Content Audit", "Link Profile", "Core Web Vitals"],
    recommendedServices: ["SEO Management", "Content Writing", "Technical SEO Fix", "Link Building"],
    active: true,
  },
  {
    id: "goal-gbp",
    key: "google-business-profile",
    label: "Improve Google Business Profile",
    description: "Optimize GBP to dominate the local map pack",
    category: "Local",
    color: "#EA4335",
    bg: "#FEF2F2",
    border: "#FECACA",
    auditSections: ["GBP Completeness", "Review Analysis", "GBP Posts", "Photo Audit", "GBP Ranking"],
    recommendedServices: ["GBP Optimization", "Review Generation", "GBP Management"],
    active: true,
  },
  {
    id: "goal-ppc",
    key: "ppc",
    label: "Improve PPC",
    description: "Run profitable Google Ads campaigns for immediate leads",
    category: "Paid Media",
    color: "#C2410C",
    bg: "#FFF7ED",
    border: "#FED7AA",
    auditSections: [
      "Campaign Structure",
      "Keyword Analysis",
      "Negative Keywords",
      "Landing Page QS",
      "Conversion Tracking",
      "Budget Efficiency",
    ],
    recommendedServices: [
      "Google Ads Management",
      "Campaign Rebuild",
      "Landing Pages",
      "Conversion Tracking",
    ],
    active: true,
  },
  {
    id: "goal-meta",
    key: "meta",
    label: "Improve Meta Ads",
    description: "Facebook and Instagram ads for brand awareness and lead generation",
    category: "Paid Media",
    color: "#1877F2",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    auditSections: [
      "Meta Pixel",
      "Audience Analysis",
      "Creative Audit",
      "Campaign Structure",
      "Retargeting",
    ],
    recommendedServices: [
      "Meta Ads Management",
      "Creative Production",
      "Audience Strategy",
      "Pixel Setup",
    ],
    active: true,
  },
  {
    id: "goal-ai-search",
    key: "ai-search",
    label: "Improve AI Search Visibility",
    description: "Optimize for AI-generated search results (SGE, Gemini, Perplexity)",
    category: "Emerging",
    color: "#6D28D9",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    auditSections: [
      "AI Visibility Audit",
      "Structured Data",
      "E-E-A-T Assessment",
      "Content Authority",
    ],
    recommendedServices: [
      "AI Search Optimization",
      "Schema Markup",
      "Content Authority Building",
    ],
    active: true,
  },
  {
    id: "goal-website-redesign",
    key: "website-redesign",
    label: "Website Redesign",
    description: "Rebuild or redesign website for performance, conversion, and brand",
    category: "Website",
    color: "#0F766E",
    bg: "#F0FDFA",
    border: "#99F6E4",
    auditSections: [
      "Design Audit",
      "Mobile Responsiveness",
      "Page Speed",
      "UX Audit",
      "Brand Consistency",
    ],
    recommendedServices: [
      "Website Redesign",
      "CMS Training",
      "Mobile Optimization",
      "Hosting Setup",
    ],
    active: true,
  },
];

export const AUDIT_GOAL_CATEGORIES = [
  "All",
  "Growth",
  "Conversion",
  "Visibility",
  "Local",
  "Paid Media",
  "Website",
  "Emerging",
];

// ─── Step 3 — Marketing Overview ──────────────────────────────────────────────
// Mirrors: Settings → Sales Intake Forms → Intake Questions → Marketing Section

export const STEP3_MARKETING_OVERVIEW_FIELDS: IntakeField[] = [
  // Current SEO
  {
    key: "currentSeo",
    label: "Currently Doing SEO?",
    type: "toggle",
    required: false,
    helpText: "Does the business have an active SEO program?",
  },
  {
    key: "seoPreviousAgency",
    label: "Previous SEO Agency",
    type: "text",
    required: false,
    placeholder: "Agency name (if any)",
  },
  // Current PPC
  {
    key: "currentPpc",
    label: "Running Google Ads (PPC)?",
    type: "toggle",
    required: false,
  },
  {
    key: "ppcMonthlyBudget",
    label: "PPC Monthly Ad Spend",
    type: "select",
    required: false,
    options: [
      "Not running",
      "$500–$1,000",
      "$1,001–$2,500",
      "$2,501–$5,000",
      "$5,001–$10,000",
      "$10,000+",
    ],
  },
  // Current Meta
  {
    key: "currentMeta",
    label: "Running Meta Ads?",
    type: "toggle",
    required: false,
  },
  {
    key: "metaMonthlyBudget",
    label: "Meta Monthly Ad Spend",
    type: "select",
    required: false,
    options: [
      "Not running",
      "$500–$1,000",
      "$1,001–$2,500",
      "$2,501–$5,000",
      "$5,000+",
    ],
  },
  // Current Website
  {
    key: "websitePlatform",
    label: "Website Platform",
    type: "select",
    required: false,
    options: [
      "WordPress",
      "Squarespace",
      "Wix",
      "Shopify",
      "Webflow",
      "Custom / Proprietary",
      "Unknown",
      "Other",
    ],
  },
  {
    key: "websiteAge",
    label: "Website Age",
    type: "select",
    required: false,
    options: ["Less than 1 year", "1–3 years", "4–6 years", "7+ years", "Unknown"],
  },
  // Tracking
  {
    key: "hasGoogleAnalytics",
    label: "Google Analytics Installed?",
    type: "toggle",
    required: false,
  },
  {
    key: "hasSearchConsole",
    label: "Google Search Console Connected?",
    type: "toggle",
    required: false,
  },
  {
    key: "hasConversionTracking",
    label: "Conversion Tracking Active?",
    type: "toggle",
    required: false,
  },
  // Competitors
  {
    key: "competitor1",
    label: "Top Competitor #1",
    type: "text",
    required: false,
    placeholder: "Business name or website",
  },
  {
    key: "competitor2",
    label: "Top Competitor #2",
    type: "text",
    required: false,
    placeholder: "Business name or website",
  },
  {
    key: "competitor3",
    label: "Top Competitor #3",
    type: "text",
    required: false,
    placeholder: "Business name or website",
  },
  // Pain Points
  {
    key: "biggestPainPoint",
    label: "Biggest Marketing Pain Point",
    type: "textarea",
    required: false,
    placeholder: "Describe the #1 problem you're trying to solve...",
    colSpan: "full",
  },
  {
    key: "painPoints",
    label: "Current Challenges",
    type: "multiselect",
    required: false,
    options: [
      "Not enough leads",
      "Too many bad-quality leads",
      "Low website traffic",
      "Low online visibility",
      "Competitors outranking us",
      "Bad reviews online",
      "Low conversion rate",
      "Not knowing what's working",
      "High cost per acquisition",
      "No clear ROI from marketing",
    ],
    colSpan: "full",
  },
  // Budget
  {
    key: "monthlyBudget",
    label: "Monthly Service Budget",
    type: "select",
    required: true,
    options: [
      "Less than $1,000",
      "$1,000–$2,000",
      "$2,001–$3,500",
      "$3,501–$5,000",
      "$5,001–$8,000",
      "$8,001–$12,000",
      "$12,000+",
      "Not Sure Yet",
    ],
  },
  {
    key: "contractPreference",
    label: "Contract Length Preference",
    type: "select",
    required: false,
    options: [
      "Month-to-Month",
      "6 Months",
      "12 Months",
      "24 Months",
      "No Preference",
    ],
  },
  // Notes
  {
    key: "discoveryNotes",
    label: "Discovery Call Notes",
    type: "textarea",
    required: false,
    placeholder: "Key points from discovery call...",
    colSpan: "full",
  },
  {
    key: "internalNotes",
    label: "Internal Sales Notes",
    type: "textarea",
    required: false,
    placeholder: "Internal notes, observations, flags...",
    colSpan: "full",
  },
];

// ─── Intake Record Types ───────────────────────────────────────────────────────

export type IntakeStatus =
  | "Draft"
  | "In Progress"
  | "Pending Review"
  | "Ready For Audit"
  | "Audit In Progress"
  | "Complete";

export interface IntakeRecord {
  id: string;
  businessName: string;
  primaryContact: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  location: string;
  businessSize: string;
  intakeSource: string;
  affiliateName?: string;
  assignedRep: string;
  selectedGoals: string[];
  status: IntakeStatus;
  createdAt: string;
  updatedAt: string;
  answers: Record<string, string | string[] | boolean>;
}

// ─── Mock Intake Records ───────────────────────────────────────────────────────
// Mirrors what would come from the database after intakes are submitted.

export const MOCK_INTAKE_RECORDS: IntakeRecord[] = [
  {
    id: "intake-001",
    businessName: "Summit Landscaping",
    primaryContact: "Tim Reeves",
    email: "tim@summitlandscaping.com",
    phone: "(312) 555-0101",
    website: "https://www.summitlandscaping.com",
    industry: "Landscaping",
    location: "Chicago, IL",
    businessSize: "6–15 employees",
    intakeSource: "Referral",
    affiliateName: "Brandon Ellis",
    assignedRep: "Jordan M.",
    selectedGoals: ["goal-leads", "goal-seo", "goal-gbp"],
    status: "Ready For Audit",
    createdAt: "2025-06-01T09:15:00Z",
    updatedAt: "2025-06-01T10:30:00Z",
    answers: {},
  },
  {
    id: "intake-002",
    businessName: "Blue Ridge Plumbing",
    primaryContact: "Carl Hughes",
    email: "carl@blueridgeplumbing.com",
    phone: "(415) 555-0202",
    website: "https://www.blueridgeplumbing.com",
    industry: "HVAC / Plumbing / Electrical",
    location: "San Francisco, CA",
    businessSize: "2–5 employees",
    intakeSource: "Direct Sales",
    assignedRep: "Sarah K.",
    selectedGoals: ["goal-calls", "goal-ppc"],
    status: "In Progress",
    createdAt: "2025-06-02T11:00:00Z",
    updatedAt: "2025-06-02T11:45:00Z",
    answers: {},
  },
  {
    id: "intake-003",
    businessName: "Metro Dental Group",
    primaryContact: "Dr. Sarah Chen",
    email: "sarah@metrodental.com",
    phone: "(773) 555-0303",
    website: "https://www.metrodental.com",
    industry: "Dental",
    location: "Chicago, IL",
    businessSize: "16–50 employees",
    intakeSource: "Affiliate",
    affiliateName: "Maria Santos",
    assignedRep: "Jordan M.",
    selectedGoals: ["goal-seo", "goal-gbp", "goal-leads", "goal-conversion"],
    status: "Ready For Audit",
    createdAt: "2025-05-30T14:00:00Z",
    updatedAt: "2025-05-31T09:00:00Z",
    answers: {},
  },
  {
    id: "intake-004",
    businessName: "Harbor Auto Group",
    primaryContact: "James Keller",
    email: "jkeller@harborauto.com",
    phone: "(206) 555-0404",
    website: "https://www.harborauto.com",
    industry: "Automotive",
    location: "Seattle, WA",
    businessSize: "51–150 employees",
    intakeSource: "Website",
    assignedRep: "Mike T.",
    selectedGoals: ["goal-seo", "goal-ppc", "goal-website-redesign"],
    status: "Draft",
    createdAt: "2025-06-03T08:30:00Z",
    updatedAt: "2025-06-03T08:30:00Z",
    answers: {},
  },
  {
    id: "intake-005",
    businessName: "Coastal Wellness Spa",
    primaryContact: "Lisa Park",
    email: "lisa@coastalwellness.com",
    phone: "(619) 555-0505",
    website: "https://www.coastalwellness.com",
    industry: "Fitness / Wellness",
    location: "San Diego, CA",
    businessSize: "6–15 employees",
    intakeSource: "Affiliate",
    affiliateName: "Lisa Park",
    assignedRep: "Sarah K.",
    selectedGoals: ["goal-meta", "goal-gbp", "goal-seo"],
    status: "Ready For Audit",
    createdAt: "2025-05-28T10:00:00Z",
    updatedAt: "2025-05-29T14:00:00Z",
    answers: {},
  },
];

// ─── Helper: derive status metadata ───────────────────────────────────────────

export function getIntakeStatusMeta(status: IntakeStatus): {
  color: string;
  bg: string;
  border: string;
} {
  const map: Record<IntakeStatus, { color: string; bg: string; border: string }> = {
    Draft:              { color: "#64748B", bg: "#F8FAFC", border: "#E2E8F0" },
    "In Progress":      { color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
    "Pending Review":   { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
    "Ready For Audit":  { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
    "Audit In Progress":{ color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
    Complete:           { color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
  };
  return map[status];
}
