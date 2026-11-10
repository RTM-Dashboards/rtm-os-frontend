// RTM OS — Audit Goal Configuration — Shared Module
// ─────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for the richer Audit Goal records used by:
//   • Settings → Audit Goal Configuration page (display / editing UI)
//   • Sales → Package Builder (multiselect for recommendedFor)
//
// This is the settings-layer schema for goals.  The lighter intake-layer shape
// (AuditGoalConfig in lib/sales/intake-config.ts) is used by the audit engine
// and intake forms.  The two share the same goal IDs so they can be correlated,
// but they carry different fields and must not be merged.
//
// When a real API endpoint exists, this constant will be replaced by a fetch.
// Until then, this file is the only place these goals are defined.
// ─────────────────────────────────────────────────────────────────────────────

export interface AuditGoal {
  id: string;
  name: string;
  description: string;
  auditSections: string[];
  recommendedServices: string[];
  packageMapping: string;
  scoringWeight: number;
  defaultBudgetMin: number;
  defaultBudgetMax: number;
  recommendationRules: string[];
  isActive: boolean;
}

export const AUDIT_GOALS: AuditGoal[] = [
  {
    id: "more-leads",
    name: "Get More Leads & Calls",
    description: "Prospect's primary goal is increasing inbound leads and phone calls through digital channels.",
    auditSections: ["Website Conversion", "GBP Presence", "LSA Eligibility", "Call Tracking", "Landing Pages"],
    recommendedServices: ["Google Business Profile Optimization", "Local SEO", "LSA Management", "Google Ads", "Landing Page CRO"],
    packageMapping: "Lead Generation Bundle",
    scoringWeight: 35,
    defaultBudgetMin: 1500,
    defaultBudgetMax: 5000,
    recommendationRules: [
      "Rule: GBP Score < 70 → Recommend GBP Optimization",
      "Rule: No LSA → Recommend LSA Setup",
      "Rule: CTR < 2% → Recommend Landing Page CRO",
    ],
    isActive: true,
  },
  {
    id: "rank-higher",
    name: "Rank Higher on Google",
    description: "Prospect wants to improve organic search rankings for local and industry keywords.",
    auditSections: ["Keyword Rankings", "Technical SEO", "On-Page SEO", "Backlink Profile", "Local Citations"],
    recommendedServices: ["Local SEO", "Technical SEO Audit", "Content Strategy", "Link Building"],
    packageMapping: "SEO Domination Package",
    scoringWeight: 30,
    defaultBudgetMin: 1000,
    defaultBudgetMax: 4000,
    recommendationRules: [
      "Rule: Domain Authority < 20 → Recommend Link Building",
      "Rule: No GMB Posts → Recommend GBP Content",
      "Rule: Page Speed < 70 → Recommend Technical SEO",
    ],
    isActive: true,
  },
  {
    id: "website-conversion",
    name: "Improve Website Conversion",
    description: "Prospect wants to convert more website visitors into leads or sales.",
    auditSections: ["Conversion Rate Analysis", "Landing Page Quality", "Call-to-Action Audit", "Form Performance", "Page Speed"],
    recommendedServices: ["Website CRO", "Landing Page Design", "A/B Testing", "UX Audit"],
    packageMapping: "Conversion Optimization Bundle",
    scoringWeight: 20,
    defaultBudgetMin: 800,
    defaultBudgetMax: 3000,
    recommendationRules: [
      "Rule: Bounce Rate > 65% → Recommend UX Audit",
      "Rule: No A/B Tests → Recommend CRO Program",
      "Rule: Form Abandonment > 40% → Recommend Form Optimization",
    ],
    isActive: true,
  },
  {
    id: "ai-search",
    name: "Show Up in AI Search",
    description: "Prospect wants to appear in AI-powered search results and assistants (ChatGPT, Google AI Overview, Perplexity).",
    auditSections: ["AI Search Visibility", "Structured Data", "Content Authority", "FAQ Coverage", "Entity Optimization"],
    recommendedServices: ["AI Search Optimization", "Structured Data Implementation", "Content Authority Building", "FAQ Content Strategy"],
    packageMapping: "AI Search Visibility Package",
    scoringWeight: 25,
    defaultBudgetMin: 1200,
    defaultBudgetMax: 4500,
    recommendationRules: [
      "Rule: No Schema Markup → Recommend Structured Data",
      "Rule: Low Content Authority → Recommend Content Program",
      "Rule: No FAQ Pages → Recommend FAQ Strategy",
    ],
    isActive: true,
  },
  {
    id: "gbp-improve",
    name: "Improve Google Business Profile",
    description: "Prospect wants to optimize their Google Business Profile to improve local visibility, reviews, and engagement.",
    auditSections: ["GBP Completeness", "Review Score & Volume", "GBP Posts Activity", "Photo Quality", "Q&A Coverage", "Category Optimization"],
    recommendedServices: ["GBP Optimization", "Review Generation", "GBP Content Management", "Local Citation Building"],
    packageMapping: "Local Presence Package",
    scoringWeight: 20,
    defaultBudgetMin: 500,
    defaultBudgetMax: 2000,
    recommendationRules: [
      "Rule: GBP Completeness < 80% → Recommend Full GBP Optimization",
      "Rule: Review Score < 4.0 → Recommend Review Generation",
      "Rule: No Posts in 30 Days → Recommend GBP Content",
    ],
    isActive: true,
  },
  {
    id: "google-ads",
    name: "Run Google Ads / PPC",
    description: "Prospect wants to launch or improve Google Ads campaigns to drive immediate traffic and leads.",
    auditSections: ["Existing Ad Account Audit", "Keyword Opportunity", "Competitor Ads", "Landing Page Readiness", "Conversion Tracking Setup"],
    recommendedServices: ["Google Ads Management", "PPC Campaign Setup", "Landing Page Creation", "Conversion Tracking"],
    packageMapping: "Google Ads Starter Package",
    scoringWeight: 30,
    defaultBudgetMin: 2000,
    defaultBudgetMax: 10000,
    recommendationRules: [
      "Rule: No Conversion Tracking → Recommend Tracking Setup",
      "Rule: No Ad Account → Recommend Fresh Account Setup",
      "Rule: High CPC Industry → Recommend Landing Page Optimization",
    ],
    isActive: true,
  },
  {
    id: "google-guaranteed",
    name: "Get Google Guaranteed / LSA",
    description: "Prospect wants to get Google Guaranteed badge and appear in Local Services Ads.",
    auditSections: ["LSA Eligibility Check", "License Verification", "Insurance Status", "Background Check Status", "GBP Linkage"],
    recommendedServices: ["LSA Setup & Management", "Google Guaranteed Application", "GBP Optimization"],
    packageMapping: "LSA Fast-Track Package",
    scoringWeight: 25,
    defaultBudgetMin: 1500,
    defaultBudgetMax: 5000,
    recommendationRules: [
      "Rule: Not LSA Eligible → Recommend Eligibility Remediation",
      "Rule: GBP Not Linked → Recommend GBP Linkage",
      "Rule: Low Review Count → Recommend Review Generation Before LSA",
    ],
    isActive: true,
  },
  {
    id: "meta-ads",
    name: "Improve Meta Ads Performance",
    description: "Prospect wants to improve Facebook and Instagram advertising ROI.",
    auditSections: ["Meta Account Audit", "Audience Analysis", "Creative Performance", "Pixel & Tracking", "Campaign Structure"],
    recommendedServices: ["Meta Ads Management", "Creative Strategy", "Audience Building", "Pixel Setup"],
    packageMapping: "Meta Ads Performance Package",
    scoringWeight: 25,
    defaultBudgetMin: 1500,
    defaultBudgetMax: 8000,
    recommendationRules: [
      "Rule: No Meta Pixel → Recommend Pixel Setup",
      "Rule: ROAS < 2x → Recommend Creative Refresh",
      "Rule: High CPM → Recommend Audience Optimization",
    ],
    isActive: true,
  },
];
