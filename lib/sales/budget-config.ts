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
  | "seo-ai-search"
  | "gbp"
  | "ppc"
  | "lsa"
  | "meta-ads"
  | "website";

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
  {
    id: "seo",
    catalogId: "svc-seo-monthly",
    label: "SEO Management",
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
  {
    id: "gbp",
    catalogId: "svc-gbp-monthly",
    label: "Google Business Profile",
    description:
      "Google Business Profile optimization, weekly posting, and review management.",
    quantityUnit: "location",
    quantityOptions: [1, 2, 3, 4, 5],
    defaultQuantity: 1,
    defaultMonthlyPrice: 400,
    defaultSetupFee: 200,
    minMonthlyPrice: 300,
    maxMonthlyPrice: 800,
    setupFeeEditable: true,
    department: "GBP",
    isRecurring: true,
  },
  {
    id: "ppc",
    catalogId: "svc-ppc-monthly",
    label: "Google Ads / PPC",
    description:
      "Paid search campaign management including restructure, ongoing optimization, and bi-weekly reporting.",
    quantityUnit: "campaign",
    quantityOptions: [1, 2, 3],
    defaultQuantity: 1,
    defaultMonthlyPrice: 800,
    defaultSetupFee: 500,
    minMonthlyPrice: 600,
    maxMonthlyPrice: 3000,
    setupFeeEditable: true,
    department: "PPC",
    isRecurring: true,
  },
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
  {
    id: "meta-ads",
    catalogId: "svc-meta-monthly",
    label: "Meta Ads",
    description:
      "Facebook and Instagram ad campaign management for lead generation and brand awareness.",
    quantityUnit: "campaign",
    quantityOptions: [1, 2, 3],
    defaultQuantity: 1,
    defaultMonthlyPrice: 800,
    defaultSetupFee: 400,
    minMonthlyPrice: 600,
    maxMonthlyPrice: 2500,
    setupFeeEditable: true,
    department: "Meta Ads",
    isRecurring: true,
  },
  {
    id: "website",
    catalogId: "svc-web-redesign",
    label: "Website",
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
