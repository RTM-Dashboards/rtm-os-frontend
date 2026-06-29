// RTM OS — Sales Budget Optimizer Configuration
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

// ─── View Labels ──────────────────────────────────────────────────────────────

export const BUDGET_VIEW_LABELS = {
  byService: "By Service",
  packageTotal: "Package Total",
} as const;

export type BudgetView = keyof typeof BUDGET_VIEW_LABELS;
