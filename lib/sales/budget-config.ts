// RTM OS — Sales Budget Optimizer Configuration
import type { DiscountType } from "./types";
// ─────────────────────────────────────────────────────────────────────────────
// All pricing, service definitions, quantity options, discount tiers, and
// constraints live here. Zero business literals belong in any .tsx file.
//
// Source of truth: Settings → Service Catalog → Pricing Rules → Packages → Discount Rules
// ─────────────────────────────────────────────────────────────────────────────

// ─── Service Identity ─────────────────────────────────────────────────────────

export type BudgetServiceId =
  | "seo"
  | "seo-setup"
  | "seo-technical"
  | "seo-local"
  | "seo-ai-search"
  | "gbp"
  | "gbp-optimization"
  | "ppc"
  | "ppc-setup"
  | "lsa"
  | "meta-ads"
  | "meta-ads-setup"
  | "website"
  | "website-maintenance";

export type QuantityUnit = "location" | "campaign" | "flat" | "page";

// ─── Service Definition ───────────────────────────────────────────────────────

export interface BudgetServiceDefinition {
  id: BudgetServiceId;
  /** Primary ServiceCatalogEntry.id in recommendation-config to use for line items. */
  catalogId: string;
  label: string;
  description: string;
  quantityUnit: QuantityUnit;
  quantityOptions: number[];
  defaultQuantity: number;
  defaultMonthlyPrice: number;
  defaultSetupFee: number;
  minMonthlyPrice: number;
  maxMonthlyPrice: number;
  setupFeeEditable: boolean;
  department: string;
  isRecurring: boolean;
}

// ─── Service Catalog ──────────────────────────────────────────────────────────

export const BUDGET_SERVICE_CATALOG: BudgetServiceDefinition[] = [
  // ── SEO ──────────────────────────────────────────────────────────────────
  {
    id: "seo",
    catalogId: "svc-seo-monthly",
    label: "SEO Monthly Management",
    description:
      "Full monthly SEO including technical audits, content optimization, and link building.",
    quantityUnit: "location",
    quantityOptions: [1, 2, 3, 4, 5],
    defaultQuantity: 1,
    defaultMonthlyPrice: 1200,
    defaultSetupFee: 500,
    minMonthlyPrice: 800,
    maxMonthlyPrice: 3500,
    setupFeeEditable: true,
    department: "SEO",
    isRecurring: true,
  },
  {
    id: "seo-setup",
    catalogId: "svc-seo-onboarding",
    label: "SEO Setup & Onboarding",
    description:
      "Full SEO audit, keyword strategy, and technical baseline before ongoing management begins.",
    quantityUnit: "flat",
    quantityOptions: [1],
    defaultQuantity: 1,
    defaultMonthlyPrice: 0,
    defaultSetupFee: 1500,
    minMonthlyPrice: 0,
    maxMonthlyPrice: 0,
    setupFeeEditable: true,
    department: "SEO",
    isRecurring: false,
  },
  {
    id: "seo-technical",
    catalogId: "svc-technical-seo",
    label: "Technical SEO Fix",
    description:
      "One-time technical SEO remediation for crawl errors, indexation issues, and structural problems.",
    quantityUnit: "flat",
    quantityOptions: [1],
    defaultQuantity: 1,
    defaultMonthlyPrice: 0,
    defaultSetupFee: 1200,
    minMonthlyPrice: 0,
    maxMonthlyPrice: 0,
    setupFeeEditable: true,
    department: "SEO",
    isRecurring: false,
  },
  {
    id: "seo-local",
    catalogId: "svc-local-seo",
    label: "Local SEO Management",
    description:
      "Local SEO strategy targeting map pack visibility and multi-location organic reach.",
    quantityUnit: "location",
    quantityOptions: [1, 2, 3, 4, 5],
    defaultQuantity: 1,
    defaultMonthlyPrice: 1000,
    defaultSetupFee: 0,
    minMonthlyPrice: 600,
    maxMonthlyPrice: 2500,
    setupFeeEditable: false,
    department: "SEO",
    isRecurring: true,
  },
  {
    id: "seo-ai-search",
    catalogId: "svc-ai-search",
    label: "SEO AI Search Visibility",
    description:
      "AI-powered search visibility optimization for modern search engines and LLM-integrated results.",
    quantityUnit: "flat",
    quantityOptions: [1],
    defaultQuantity: 1,
    defaultMonthlyPrice: 600,
    defaultSetupFee: 250,
    minMonthlyPrice: 400,
    maxMonthlyPrice: 1200,
    setupFeeEditable: false,
    department: "SEO",
    isRecurring: true,
  },
  // ── GBP ──────────────────────────────────────────────────────────────────
  {
    id: "gbp",
    catalogId: "svc-gbp-monthly",
    label: "GBP Monthly Management",
    description:
      "Ongoing GBP management including posts, review responses, and photo updates.",
    quantityUnit: "location",
    quantityOptions: [1, 2, 3, 4, 5],
    defaultQuantity: 1,
    defaultMonthlyPrice: 500,
    defaultSetupFee: 0,
    minMonthlyPrice: 300,
    maxMonthlyPrice: 800,
    setupFeeEditable: false,
    department: "GBP",
    isRecurring: true,
  },
  {
    id: "gbp-optimization",
    catalogId: "svc-gbp-optimization",
    label: "GBP Optimization",
    description:
      "One-time GBP profile optimization to maximize local pack visibility.",
    quantityUnit: "location",
    quantityOptions: [1, 2, 3, 4, 5],
    defaultQuantity: 1,
    defaultMonthlyPrice: 0,
    defaultSetupFee: 350,
    minMonthlyPrice: 0,
    maxMonthlyPrice: 0,
    setupFeeEditable: true,
    department: "GBP",
    isRecurring: false,
  },
  // ── PPC ──────────────────────────────────────────────────────────────────
  {
    id: "ppc",
    catalogId: "svc-ppc-monthly",
    label: "Google Ads Monthly Management",
    description:
      "Ongoing Google Ads campaign management, optimization, and reporting.",
    quantityUnit: "campaign",
    quantityOptions: [1, 2, 3],
    defaultQuantity: 1,
    defaultMonthlyPrice: 800,
    defaultSetupFee: 0,
    minMonthlyPrice: 600,
    maxMonthlyPrice: 3000,
    setupFeeEditable: false,
    department: "PPC",
    isRecurring: true,
  },
  {
    id: "ppc-setup",
    catalogId: "svc-ppc-setup",
    label: "Google Ads Campaign Setup",
    description:
      "Full Google Ads campaign build from scratch with proper structure, tracking, and keywords.",
    quantityUnit: "campaign",
    quantityOptions: [1, 2, 3],
    defaultQuantity: 1,
    defaultMonthlyPrice: 0,
    defaultSetupFee: 1200,
    minMonthlyPrice: 0,
    maxMonthlyPrice: 0,
    setupFeeEditable: true,
    department: "PPC",
    isRecurring: false,
  },
  // ── LSA ───────────────────────────────────────────────────────────────────
  {
    id: "lsa",
    catalogId: "svc-lsa",
    label: "Local Service Ads",
    description:
      "Local Service Ads profile management, lead verification, and budget optimization.",
    quantityUnit: "campaign",
    quantityOptions: [1, 2, 3],
    defaultQuantity: 1,
    defaultMonthlyPrice: 350,
    defaultSetupFee: 300,
    minMonthlyPrice: 250,
    maxMonthlyPrice: 700,
    setupFeeEditable: true,
    department: "LSA",
    isRecurring: true,
  },
  // ── Meta Ads ──────────────────────────────────────────────────────────────
  {
    id: "meta-ads",
    catalogId: "svc-meta-monthly",
    label: "Meta Ads Monthly Management",
    description:
      "Ongoing Meta Ads management across Facebook and Instagram.",
    quantityUnit: "campaign",
    quantityOptions: [1, 2, 3],
    defaultQuantity: 1,
    defaultMonthlyPrice: 800,
    defaultSetupFee: 0,
    minMonthlyPrice: 600,
    maxMonthlyPrice: 2500,
    setupFeeEditable: false,
    department: "Meta Ads",
    isRecurring: true,
  },
  {
    id: "meta-ads-setup",
    catalogId: "svc-meta-setup",
    label: "Meta Ads Campaign Setup",
    description:
      "Full Meta Ads account setup including audiences, pixels, and campaign structure.",
    quantityUnit: "campaign",
    quantityOptions: [1, 2, 3],
    defaultQuantity: 1,
    defaultMonthlyPrice: 0,
    defaultSetupFee: 900,
    minMonthlyPrice: 0,
    maxMonthlyPrice: 0,
    setupFeeEditable: true,
    department: "Meta Ads",
    isRecurring: false,
  },
  // ── Website ───────────────────────────────────────────────────────────────
  {
    id: "website",
    catalogId: "svc-web-redesign",
    label: "Website Redesign",
    description:
      "Full website build or redesign with mobile-first, conversion-optimized design and CMS setup.",
    quantityUnit: "page",
    quantityOptions: [5, 10, 15, 20, 30],
    defaultQuantity: 10,
    defaultMonthlyPrice: 0,
    defaultSetupFee: 4500,
    minMonthlyPrice: 0,
    maxMonthlyPrice: 0,
    setupFeeEditable: true,
    department: "Web Development",
    isRecurring: false,
  },
  {
    id: "website-maintenance",
    catalogId: "svc-web-maintenance",
    label: "Website Maintenance",
    description:
      "Ongoing website maintenance, security updates, and minor content changes.",
    quantityUnit: "flat",
    quantityOptions: [1],
    defaultQuantity: 1,
    defaultMonthlyPrice: 250,
    defaultSetupFee: 0,
    minMonthlyPrice: 150,
    maxMonthlyPrice: 500,
    setupFeeEditable: false,
    department: "Web Development",
    isRecurring: true,
  },
];

// ─── Lookup Helper ────────────────────────────────────────────────────────────

export function getBudgetServiceById(
  id: BudgetServiceId
): BudgetServiceDefinition | undefined {
  return BUDGET_SERVICE_CATALOG.find((s) => s.id === id);
}

// ─── Recommendation Engine → Budget Optimizer Mapping ─────────────────────────
// Maps Recommendation Engine service label strings to BudgetServiceId.

export const RECOMMENDATION_TO_BUDGET_MAP: Record<string, BudgetServiceId> = {
  // ── Exact service names from SERVICE_CATALOG in recommendation-config.ts ──
  // Each recommendation service name maps to its own distinct BudgetServiceId
  // so that multiple approved recommendations never collapse to the same entry.
  // SEO
  "SEO Monthly Management": "seo",
  "SEO Setup & Onboarding": "seo-setup",
  "Technical SEO Fix": "seo-technical",
  "Local SEO Management": "seo-local",
  // AI Search
  "AI Search Visibility": "seo-ai-search",
  // GBP — distinct: one-time optimization vs ongoing monthly management
  "GBP Optimization": "gbp-optimization",
  "GBP Monthly Management": "gbp",
  // PPC / Google Ads — distinct: one-time setup vs ongoing management
  "Google Ads Campaign Setup": "ppc-setup",
  "Google Ads Monthly Management": "ppc",
  // LSA
  "LSA Management": "lsa",
  // Meta Ads — distinct: one-time setup vs ongoing management
  "Meta Ads Campaign Setup": "meta-ads-setup",
  "Meta Ads Monthly Management": "meta-ads",
  // Website — distinct: redesign (one-time) vs maintenance (recurring)
  "Website Redesign": "website",
  "Website Maintenance": "website-maintenance",
  // Tracking/pixel → no matching budget service; intentionally unmapped
  // ── Legacy keys kept for old drafts that stored these names ───────────────
  "SEO": "seo",
  "SEO AI Search Visibility": "seo-ai-search",
  "Google Business Profile": "gbp",
  "Google Ads / PPC": "ppc",
  "Local Service Ads": "lsa",
  "Meta Ads": "meta-ads",
  "Website": "website",
};

// ─── Discount Tiers ───────────────────────────────────────────────────────────
// From Settings → Discount Rules

export interface DiscountTier {
  label: string;
  percentage: number;
}

export const DISCOUNT_TIERS: DiscountTier[] = [
  { label: "No discount", percentage: 0 },
  { label: "5% — Promotional", percentage: 5 },
  { label: "10% — Preferred Partner", percentage: 10 },
  { label: "15% — Annual Commitment", percentage: 15 },
  { label: "20% — Strategic Account", percentage: 20 },
];

// ─── Discount Configuration ────────────────────────────────────────────────────────

export interface DiscountTypeOption {
  value: DiscountType;
  label: string;
  description: string;
}

export const DISCOUNT_TYPE_OPTIONS: DiscountTypeOption[] = [
  {
    value: "none",
    label: "No Discount",
    description: "Full price — no discount applied",
  },
  {
    value: "percentage-monthly",
    label: "Percentage Off Monthly",
    description: "Reduces monthly recurring fee by a percentage (e.g. 10% off/mo)",
  },
  {
    value: "flat-monthly",
    label: "Flat Amount Off Monthly",
    description: "Reduces monthly recurring fee by a fixed dollar amount (e.g. $200/mo off)",
  },
  {
    value: "percentage-setup",
    label: "Percentage Off Setup Fees",
    description: "Reduces total setup fees by a percentage (e.g. 15% off setup)",
  },
  {
    value: "flat-setup",
    label: "Flat Amount Off Setup",
    description: "Reduces total setup fees by a fixed dollar amount (e.g. $500 off)",
  },
  {
    value: "custom",
    label: "Custom Discount",
    description: "Enter a custom label and amount applied to the monthly recurring total",
  },
];

/** Common discount label suggestions for the label input autocomplete/placeholder. */
export const DISCOUNT_SUGGESTIONS: string[] = [
  "New Client Discount",
  "Partner Referral Discount",
  "Seasonal Promotion",
  "Annual Commitment Discount",
  "Multi-Service Bundle Discount",
  "Early Adopter Discount",
];

/** Maximum allowed discount percentage. Prevents accidental oversized discounts. */
export const MAX_DISCOUNT_PERCENTAGE: number = 40;

/** Maximum allowed flat monthly discount in USD. */
export const MAX_FLAT_DISCOUNT_MONTHLY: number = 2000;

/** Maximum allowed flat setup discount in USD. */
export const MAX_FLAT_DISCOUNT_SETUP: number = 5000;

// ─── View Labels ──────────────────────────────────────────────────────────────────────

export const BUDGET_VIEW_LABELS = {
  byService: "By Service",
  packageTotal: "Package Total",
} as const;

export type BudgetView = keyof typeof BUDGET_VIEW_LABELS;
