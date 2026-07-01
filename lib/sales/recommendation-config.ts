// RTM OS — Sales Recommendation Engine Configuration
// ─────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for all recommendation business rules.
// Nothing in the Sales workspace should hardcode:
//   • Recommendation rules         • Service catalog
//   • Pricing                      • Department mappings
//   • Priority rules               • Proposal sections
//   • Deliverables                 • Timeline estimates
//   • Package definitions          • Task blueprints
//
// All data below will eventually be served from Settings API endpoints.
// Data shapes match the Settings schema contracts exactly.
//
// Services covered: Website, SEO, SEO AI Search Visibility, Google Business Profile,
//   PPC / Google Ads, Local Service Ads, Meta Ads
// ─────────────────────────────────────────────────────────────────────────────

import type { FindingSeverity } from "./audit-config";
import type { ServiceLineItem } from "./types";

// ─── Allowed Service Domains ──────────────────────────────────────────────────
// EPIC 08.3 constraint: only these services may be recommended.

export type AllowedService =
  | "Website"
  | "SEO"
  | "SEO AI Search Visibility"
  | "Google Business Profile"
  | "PPC / Google Ads"
  | "Local Service Ads"
  | "Meta Ads";

// ─── Proposal Readiness Status ────────────────────────────────────────────────

export type ProposalReadiness =
  | "Ready for Proposal"
  | "Needs Review"
  | "Needs Pricing"
  | "Needs Sales Approval"
  | "Optional Add-On"
  | "Future Phase";

// ─── Recommendation Group ─────────────────────────────────────────────────────

export type RecommendationGroup =
  | "Critical Fixes"
  | "Quick Wins"
  | "Revenue Opportunities"
  | "Required Foundation"
  | "Recommended Growth"
  | "Optional Future Phase";

// ─── Recommendation Priority ──────────────────────────────────────────────────

export type RecommendationPriority = "Critical" | "High" | "Medium" | "Low";

// ─── Severity Config (for engine) ─────────────────────────────────────────────

export interface RecommendationSeverityConfig {
  key: FindingSeverity;
  label: string;
  color: string;
  bg: string;
  border: string;
  priorityOrder: number;
}

export const RECOMMENDATION_SEVERITY_CONFIG: RecommendationSeverityConfig[] = [
  { key: "Critical", label: "Critical", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", priorityOrder: 1 },
  { key: "High",     label: "High",     color: "#C2410C", bg: "#FFF7ED", border: "#FED7AA", priorityOrder: 2 },
  { key: "Medium",   label: "Medium",   color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", priorityOrder: 3 },
  { key: "Low",      label: "Low",      color: "#15803D", bg: "#F0FDF4", border: "#BBF7D0", priorityOrder: 4 },
];

// ─── Group Config ─────────────────────────────────────────────────────────────

export interface GroupConfig {
  key: RecommendationGroup;
  label: string;
  description: string;
  color: string;
  bg: string;
  border: string;
  order: number;
}

export const RECOMMENDATION_GROUP_CONFIG: GroupConfig[] = [
  {
    key: "Critical Fixes",
    label: "Critical Fixes",
    description: "Issues causing immediate revenue loss or business risk — must be addressed first.",
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    order: 1,
  },
  {
    key: "Quick Wins",
    label: "Quick Wins",
    description: "High-impact, low-effort improvements that deliver fast visible results.",
    color: "#C2410C",
    bg: "#FFF7ED",
    border: "#FED7AA",
    order: 2,
  },
  {
    key: "Required Foundation",
    label: "Required Foundation",
    description: "Infrastructure and tracking setup required before other services can succeed.",
    color: "#1D4ED8",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    order: 3,
  },
  {
    key: "Revenue Opportunities",
    label: "Revenue Opportunities",
    description: "Services with direct, measurable revenue impact once activated.",
    color: "#059669",
    bg: "#ECFDF5",
    border: "#A7F3D0",
    order: 4,
  },
  {
    key: "Recommended Growth",
    label: "Recommended Growth",
    description: "Structured services to sustain and accelerate long-term growth.",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    order: 5,
  },
  {
    key: "Optional Future Phase",
    label: "Optional Future Phase",
    description: "Valuable services to consider once core services are performing.",
    color: "#6B7280",
    bg: "#F9FAFB",
    border: "#E5E7EB",
    order: 6,
  },
];

export function getGroupConfig(key: RecommendationGroup): GroupConfig {
  return RECOMMENDATION_GROUP_CONFIG.find((g) => g.key === key) ?? RECOMMENDATION_GROUP_CONFIG[5];
}

// ─── Proposal Readiness Config ────────────────────────────────────────────────

export interface ProposalReadinessConfig {
  key: ProposalReadiness;
  label: string;
  description: string;
  color: string;
  bg: string;
  border: string;
  order: number;
}

export const PROPOSAL_READINESS_CONFIG: ProposalReadinessConfig[] = [
  {
    key: "Ready for Proposal",
    label: "Ready for Proposal",
    description: "Pricing, deliverables, and scope are confirmed — ready to include in a proposal.",
    color: "#059669",
    bg: "#ECFDF5",
    border: "#A7F3D0",
    order: 1,
  },
  {
    key: "Needs Review",
    label: "Needs Review",
    description: "Recommendation requires account team review before proposal inclusion.",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    order: 2,
  },
  {
    key: "Needs Pricing",
    label: "Needs Pricing",
    description: "Scope is confirmed but pricing needs validation or custom quote.",
    color: "#1D4ED8",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    order: 3,
  },
  {
    key: "Needs Sales Approval",
    label: "Needs Sales Approval",
    description: "Deal size or scope requires sales manager approval before proposal.",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    order: 4,
  },
  {
    key: "Optional Add-On",
    label: "Optional Add-On",
    description: "Not a core recommendation — present as optional value-add in proposal.",
    color: "#0891B2",
    bg: "#ECFEFF",
    border: "#A5F3FC",
    order: 5,
  },
  {
    key: "Future Phase",
    label: "Future Phase",
    description: "Recommended for a future engagement phase — not included in current proposal.",
    color: "#6B7280",
    bg: "#F9FAFB",
    border: "#E5E7EB",
    order: 6,
  },
];

export function getProposalReadinessConfig(key: ProposalReadiness): ProposalReadinessConfig {
  return PROPOSAL_READINESS_CONFIG.find((p) => p.key === key) ?? PROPOSAL_READINESS_CONFIG[0];
}

// ─── Priority Config ──────────────────────────────────────────────────────────

export interface PriorityConfig {
  key: RecommendationPriority;
  label: string;
  color: string;
  bg: string;
  border: string;
  order: number;
}

export const PRIORITY_CONFIG: PriorityConfig[] = [
  { key: "Critical", label: "Critical", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", order: 1 },
  { key: "High",     label: "High",     color: "#C2410C", bg: "#FFF7ED", border: "#FED7AA", order: 2 },
  { key: "Medium",   label: "Medium",   color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", order: 3 },
  { key: "Low",      label: "Low",      color: "#15803D", bg: "#F0FDF4", border: "#BBF7D0", order: 4 },
];

export function getPriorityConfig(key: RecommendationPriority): PriorityConfig {
  return PRIORITY_CONFIG.find((p) => p.key === key) ?? PRIORITY_CONFIG[3];
}

// ─── Service Catalog ──────────────────────────────────────────────────────────
// Settings → Service Catalog source of truth for recommendation scoping.
// Only allowed services (Website, SEO, SEO AI, GBP, PPC, LSA, Meta) are included.

export interface ServiceCatalogEntry {
  id: string;
  service: AllowedService;
  name: string;
  department: string;
  departmentColor: string;
  departmentBg: string;
  departmentBorder: string;
  monthlyFee: number;
  setupFee: number;
  estimatedHoursPerMonth: number;
  estimatedTimelineWeeks: string;
  active: boolean;
  deliverables: string[];
  description: string;
  dependencies: string[]; // other service IDs
  lineItems: ServiceLineItem[];
}

export const SERVICE_CATALOG: ServiceCatalogEntry[] = [
  {
    id: "svc-web-redesign",
    service: "Website",
    name: "Website Redesign",
    department: "Web Development",
    departmentColor: "#7C3AED",
    departmentBg: "#F5F3FF",
    departmentBorder: "#DDD6FE",
    monthlyFee: 250,
    setupFee: 4500,
    estimatedHoursPerMonth: 4,
    estimatedTimelineWeeks: "6–10 weeks",
    active: true,
    deliverables: [
      "Discovery & sitemap",
      "Mobile-first design mockups",
      "CMS development",
      "Speed & Core Web Vitals optimization",
      "Launch support",
      "Post-launch 30-day support",
    ],
    description: "Full website redesign with mobile-first, conversion-optimized design and performance.",
    dependencies: [],
    lineItems: [
      {
        id: "li-web-redesign-pages",
        serviceId: "svc-web-redesign",
        name: "Page Build",
        unitLabel: "pages",
        unitPrice: 150,
        defaultQuantity: 10,
        minQuantity: 1,
        maxQuantity: 50,
        isIncludedFlat: false,
        description: "Individual page design and development.",
      },
      {
        id: "li-web-redesign-mobile",
        serviceId: "svc-web-redesign",
        name: "Mobile Responsive Design",
        unitLabel: "flat",
        unitPrice: 300,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "Full mobile-first responsive implementation across all pages.",
      },
      {
        id: "li-web-redesign-content",
        serviceId: "svc-web-redesign",
        name: "Content Writing",
        unitLabel: "pages",
        unitPrice: 100,
        defaultQuantity: 10,
        minQuantity: 1,
        maxQuantity: 50,
        isIncludedFlat: false,
        description: "Copywriting and content for each site page.",
      },
      {
        id: "li-web-redesign-seo",
        serviceId: "svc-web-redesign",
        name: "SEO Foundation Setup",
        unitLabel: "flat",
        unitPrice: 250,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "Meta tags, schema markup, sitemap, and search console submission.",
      },
    ],
  },
  {
    id: "svc-web-maintenance",
    service: "Website",
    name: "Website Maintenance",
    department: "Web Development",
    departmentColor: "#7C3AED",
    departmentBg: "#F5F3FF",
    departmentBorder: "#DDD6FE",
    monthlyFee: 250,
    setupFee: 0,
    estimatedHoursPerMonth: 3,
    estimatedTimelineWeeks: "Ongoing",
    active: true,
    deliverables: [
      "Monthly plugin & core updates",
      "Uptime monitoring",
      "Monthly backup",
      "Security scanning",
      "Minor content edits",
    ],
    description: "Ongoing website maintenance, security updates, and minor content changes.",
    dependencies: [],
    lineItems: [
      {
        id: "li-web-maint-updates",
        serviceId: "svc-web-maintenance",
        name: "Plugin & Core Updates",
        unitLabel: "flat",
        unitPrice: 100,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "Monthly plugin, theme, and CMS core updates.",
      },
      {
        id: "li-web-maint-uptime",
        serviceId: "svc-web-maintenance",
        name: "Uptime Monitoring & Backup",
        unitLabel: "flat",
        unitPrice: 75,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "24/7 uptime monitoring and monthly backup.",
      },
      {
        id: "li-web-maint-edits",
        serviceId: "svc-web-maintenance",
        name: "Minor Content Edits",
        unitLabel: "edits",
        unitPrice: 25,
        defaultQuantity: 3,
        minQuantity: 0,
        maxQuantity: 20,
        isIncludedFlat: false,
        description: "Text, image, or small layout updates per month.",
      },
      {
        id: "li-web-maint-security",
        serviceId: "svc-web-maintenance",
        name: "Security Scanning",
        unitLabel: "flat",
        unitPrice: 50,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "Monthly malware and vulnerability scanning.",
      },
    ],
  },
  {
    id: "svc-seo-onboarding",
    service: "SEO",
    name: "SEO Setup & Onboarding",
    department: "SEO",
    departmentColor: "#1D4ED8",
    departmentBg: "#EFF6FF",
    departmentBorder: "#BFDBFE",
    monthlyFee: 0,
    setupFee: 1500,
    estimatedHoursPerMonth: 0,
    estimatedTimelineWeeks: "2 weeks",
    active: true,
    deliverables: [
      "Baseline keyword audit",
      "Technical SEO baseline report",
      "Competitor gap analysis",
      "12-month keyword strategy",
      "Search Console connection",
      "Initial on-page fixes",
    ],
    description: "Full SEO audit, keyword strategy, and technical baseline before ongoing management begins.",
    dependencies: [],
    lineItems: [
      {
        id: "li-seo-onboard-keyword-audit",
        serviceId: "svc-seo-onboarding",
        name: "Keyword Research & Audit",
        unitLabel: "flat",
        unitPrice: 500,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "Baseline keyword gap analysis and 12-month strategy.",
      },
      {
        id: "li-seo-onboard-technical",
        serviceId: "svc-seo-onboarding",
        name: "Technical SEO Baseline Report",
        unitLabel: "flat",
        unitPrice: 400,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "Full crawl, indexation, and technical audit.",
      },
      {
        id: "li-seo-onboard-competitor",
        serviceId: "svc-seo-onboarding",
        name: "Competitor Gap Analysis",
        unitLabel: "flat",
        unitPrice: 350,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "Competitor content and backlink gap identification.",
      },
      {
        id: "li-seo-onboard-onpage",
        serviceId: "svc-seo-onboarding",
        name: "Initial On-Page Fixes",
        unitLabel: "flat",
        unitPrice: 250,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "Priority on-page corrections from baseline audit.",
      },
    ],
  },
  {
    id: "svc-seo-monthly",
    service: "SEO",
    name: "SEO Monthly Management",
    department: "SEO",
    departmentColor: "#1D4ED8",
    departmentBg: "#EFF6FF",
    departmentBorder: "#BFDBFE",
    monthlyFee: 1200,
    setupFee: 0,
    estimatedHoursPerMonth: 15,
    estimatedTimelineWeeks: "Ongoing",
    active: true,
    deliverables: [
      "Monthly technical SEO fixes",
      "Keyword rank tracking",
      "Link building (2 links/mo)",
      "On-page optimization (4 pages/mo)",
      "Monthly performance report",
      "Search Console monitoring",
    ],
    description: "Ongoing monthly SEO management covering technical, on-page, and off-page optimization.",
    dependencies: ["svc-seo-onboarding"],
    lineItems: [
      {
        id: "li-seo-monthly-keywords",
        serviceId: "svc-seo-monthly",
        name: "Keyword Research",
        unitLabel: "keywords",
        unitPrice: 15,
        defaultQuantity: 18,
        minQuantity: 5,
        maxQuantity: 100,
        isIncludedFlat: false,
        description: "Target keyword identification and tracking setup.",
      },
      {
        id: "li-seo-monthly-landing",
        serviceId: "svc-seo-monthly",
        name: "Landing Page Content",
        unitLabel: "pages",
        unitPrice: 120,
        defaultQuantity: 5,
        minQuantity: 1,
        maxQuantity: 30,
        isIncludedFlat: false,
        description: "SEO-optimized landing page creation.",
      },
      {
        id: "li-seo-monthly-onpage",
        serviceId: "svc-seo-monthly",
        name: "On-Page Optimization",
        unitLabel: "pages",
        unitPrice: 60,
        defaultQuantity: 5,
        minQuantity: 1,
        maxQuantity: 30,
        isIncludedFlat: false,
        description: "Title tags, meta descriptions, headers, and internal linking.",
      },
      {
        id: "li-seo-monthly-technical",
        serviceId: "svc-seo-monthly",
        name: "Technical SEO Audit",
        unitLabel: "flat",
        unitPrice: 300,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "Monthly crawl review and technical issue remediation.",
      },
      {
        id: "li-seo-monthly-citation",
        serviceId: "svc-seo-monthly",
        name: "Local Presence / Citation Cleanup",
        unitLabel: "flat",
        unitPrice: 200,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "NAP consistency and citation building.",
      },
      {
        id: "li-seo-monthly-reporting",
        serviceId: "svc-seo-monthly",
        name: "Monthly Reporting",
        unitLabel: "flat",
        unitPrice: 100,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "Rank tracking, traffic, and conversion report.",
      },
    ],
  },
  {
    id: "svc-technical-seo",
    service: "SEO",
    name: "Technical SEO Fix",
    department: "SEO",
    departmentColor: "#1D4ED8",
    departmentBg: "#EFF6FF",
    departmentBorder: "#BFDBFE",
    monthlyFee: 0,
    setupFee: 1200,
    estimatedHoursPerMonth: 0,
    estimatedTimelineWeeks: "2–4 weeks",
    active: true,
    deliverables: [
      "Crawl error resolution",
      "Robots.txt correction",
      "Sitemap submission",
      "Canonical tag audit",
      "Redirect fix & cleanup",
      "Schema markup implementation",
    ],
    description: "One-time technical SEO remediation for crawl errors, indexation issues, and structural problems.",
    dependencies: [],
    lineItems: [
      {
        id: "li-tech-seo-crawl",
        serviceId: "svc-technical-seo",
        name: "Crawl Error Resolution",
        unitLabel: "flat",
        unitPrice: 350,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "Fix 404s, redirect chains, robots.txt, and sitemap issues.",
      },
      {
        id: "li-tech-seo-canonical",
        serviceId: "svc-technical-seo",
        name: "Canonical & Indexation Audit",
        unitLabel: "flat",
        unitPrice: 300,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "Canonical tags, duplicate content, and index bloat cleanup.",
      },
      {
        id: "li-tech-seo-schema",
        serviceId: "svc-technical-seo",
        name: "Schema Markup Implementation",
        unitLabel: "flat",
        unitPrice: 300,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "LocalBusiness, Service, FAQ, and Review schema.",
      },
      {
        id: "li-tech-seo-speed",
        serviceId: "svc-technical-seo",
        name: "Core Web Vitals Fixes",
        unitLabel: "flat",
        unitPrice: 250,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "LCP, CLS, INP performance remediation.",
      },
    ],
  },
  {
    id: "svc-local-seo",
    service: "SEO",
    name: "Local SEO Management",
    department: "SEO",
    departmentColor: "#1D4ED8",
    departmentBg: "#EFF6FF",
    departmentBorder: "#BFDBFE",
    monthlyFee: 1000,
    setupFee: 0,
    estimatedHoursPerMonth: 12,
    estimatedTimelineWeeks: "Ongoing",
    active: true,
    deliverables: [
      "Citation building & NAP cleanup",
      "Location page creation & optimization",
      "Local keyword targeting",
      "Map pack ranking tracking",
      "Monthly local SEO report",
    ],
    description: "Local SEO strategy targeting map pack visibility and multi-location organic reach.",
    dependencies: ["svc-seo-onboarding"],
    lineItems: [
      {
        id: "li-local-seo-citations",
        serviceId: "svc-local-seo",
        name: "Citation Building",
        unitLabel: "citations",
        unitPrice: 10,
        defaultQuantity: 10,
        minQuantity: 5,
        maxQuantity: 50,
        isIncludedFlat: false,
        description: "NAP-consistent citation submissions to directories.",
      },
      {
        id: "li-local-seo-location-pages",
        serviceId: "svc-local-seo",
        name: "Location Page Creation",
        unitLabel: "pages",
        unitPrice: 120,
        defaultQuantity: 3,
        minQuantity: 1,
        maxQuantity: 20,
        isIncludedFlat: false,
        description: "Locally optimized service area or city pages.",
      },
      {
        id: "li-local-seo-map-tracking",
        serviceId: "svc-local-seo",
        name: "Map Pack Rank Tracking",
        unitLabel: "flat",
        unitPrice: 150,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "Local rank tracking grid across primary service areas.",
      },
      {
        id: "li-local-seo-reporting",
        serviceId: "svc-local-seo",
        name: "Monthly Local SEO Report",
        unitLabel: "flat",
        unitPrice: 100,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "Map pack positions, citation status, and traffic report.",
      },
    ],
  },
  {
    id: "svc-ai-search",
    service: "SEO AI Search Visibility",
    name: "AI Search Visibility",
    department: "SEO",
    departmentColor: "#1D4ED8",
    departmentBg: "#EFF6FF",
    departmentBorder: "#BFDBFE",
    monthlyFee: 800,
    setupFee: 500,
    estimatedHoursPerMonth: 10,
    estimatedTimelineWeeks: "Ongoing",
    active: true,
    deliverables: [
      "Schema markup audit & implementation",
      "E-E-A-T content framework",
      "FAQ page creation",
      "Topical authority mapping",
      "AI citation tracking (SGE, Perplexity, ChatGPT)",
      "Monthly AI visibility report",
    ],
    description: "Optimization for AI-generated search results including Google SGE, ChatGPT, Perplexity, and Gemini.",
    dependencies: ["svc-seo-monthly"],
    lineItems: [
      {
        id: "li-ai-search-schema",
        serviceId: "svc-ai-search",
        name: "Schema Markup Audit & Implementation",
        unitLabel: "flat",
        unitPrice: 200,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "Structured data for AI search eligibility.",
      },
      {
        id: "li-ai-search-eeat",
        serviceId: "svc-ai-search",
        name: "E-E-A-T Content Framework",
        unitLabel: "flat",
        unitPrice: 200,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "Experience, expertise, authority, trust content signals.",
      },
      {
        id: "li-ai-search-faq",
        serviceId: "svc-ai-search",
        name: "FAQ Page Creation",
        unitLabel: "pages",
        unitPrice: 100,
        defaultQuantity: 2,
        minQuantity: 1,
        maxQuantity: 10,
        isIncludedFlat: false,
        description: "Conversational FAQ pages optimized for AI snippet capture.",
      },
      {
        id: "li-ai-search-topical",
        serviceId: "svc-ai-search",
        name: "Topical Authority Mapping",
        unitLabel: "flat",
        unitPrice: 150,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "Content cluster strategy for topical dominance.",
      },
      {
        id: "li-ai-search-tracking",
        serviceId: "svc-ai-search",
        name: "AI Citation Tracking",
        unitLabel: "flat",
        unitPrice: 150,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "Monthly tracking of citations in SGE, Perplexity, ChatGPT, and Gemini.",
      },
    ],
  },
  {
    id: "svc-gbp-optimization",
    service: "Google Business Profile",
    name: "GBP Optimization",
    department: "GBP",
    departmentColor: "#D97706",
    departmentBg: "#FFFBEB",
    departmentBorder: "#FDE68A",
    monthlyFee: 0,
    setupFee: 350,
    estimatedHoursPerMonth: 0,
    estimatedTimelineWeeks: "1–2 weeks",
    active: true,
    deliverables: [
      "Claim & verification (if needed)",
      "Primary/secondary category setup",
      "Business description rewrite",
      "Photo upload (25+ photos)",
      "Q&A seeding",
      "Service menu setup",
    ],
    description: "One-time GBP profile optimization to maximize local pack visibility.",
    dependencies: [],
    lineItems: [
      {
        id: "li-gbp-opt-setup",
        serviceId: "svc-gbp-optimization",
        name: "GBP Optimization Setup",
        unitLabel: "flat",
        unitPrice: 150,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "Category setup, business description, Q&A seeding, and service menu.",
      },
      {
        id: "li-gbp-opt-photos",
        serviceId: "svc-gbp-optimization",
        name: "Photo Upload & Optimization",
        unitLabel: "flat",
        unitPrice: 100,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "25+ branded photos uploaded and geo-tagged.",
      },
      {
        id: "li-gbp-opt-citations",
        serviceId: "svc-gbp-optimization",
        name: "Citation Cleanup",
        unitLabel: "citations",
        unitPrice: 10,
        defaultQuantity: 10,
        minQuantity: 5,
        maxQuantity: 50,
        isIncludedFlat: false,
        description: "NAP consistency corrections across key directories.",
      },
    ],
  },
  {
    id: "svc-gbp-monthly",
    service: "Google Business Profile",
    name: "GBP Monthly Management",
    department: "GBP",
    departmentColor: "#D97706",
    departmentBg: "#FFFBEB",
    departmentBorder: "#FDE68A",
    monthlyFee: 500,
    setupFee: 0,
    estimatedHoursPerMonth: 5,
    estimatedTimelineWeeks: "Ongoing",
    active: true,
    deliverables: [
      "Weekly GBP posts",
      "Review monitoring & response",
      "Q&A management",
      "Photo updates (4/mo)",
      "Monthly GBP performance report",
    ],
    description: "Ongoing GBP management including posts, review responses, and photo updates.",
    dependencies: ["svc-gbp-optimization"],
    lineItems: [
      {
        id: "li-gbp-monthly-posts",
        serviceId: "svc-gbp-monthly",
        name: "Monthly GBP Posts",
        unitLabel: "posts",
        unitPrice: 25,
        defaultQuantity: 4,
        minQuantity: 2,
        maxQuantity: 20,
        isIncludedFlat: false,
        description: "Branded posts for offers, services, and updates.",
      },
      {
        id: "li-gbp-monthly-reviews",
        serviceId: "svc-gbp-monthly",
        name: "Review Response Management",
        unitLabel: "flat",
        unitPrice: 100,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "Monitor and respond to all new reviews monthly.",
      },
      {
        id: "li-gbp-monthly-citations",
        serviceId: "svc-gbp-monthly",
        name: "Citation Building",
        unitLabel: "citations",
        unitPrice: 10,
        defaultQuantity: 10,
        minQuantity: 5,
        maxQuantity: 50,
        isIncludedFlat: false,
        description: "Ongoing citation submissions to improve local authority.",
      },
      {
        id: "li-gbp-monthly-reporting",
        serviceId: "svc-gbp-monthly",
        name: "Monthly GBP Performance Report",
        unitLabel: "flat",
        unitPrice: 75,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "Views, calls, directions, and engagement metrics.",
      },
    ],
  },
  {
    id: "svc-review-gen",
    service: "Google Business Profile",
    name: "Review Generation",
    department: "GBP",
    departmentColor: "#D97706",
    departmentBg: "#FFFBEB",
    departmentBorder: "#FDE68A",
    monthlyFee: 300,
    setupFee: 450,
    estimatedHoursPerMonth: 3,
    estimatedTimelineWeeks: "Ongoing",
    active: true,
    deliverables: [
      "Post-visit SMS review request automation",
      "Email review request sequences",
      "Review monitoring & alerts",
      "Monthly review volume report",
    ],
    description: "Automated review generation sequences via SMS and email to increase GBP review volume.",
    dependencies: ["svc-gbp-optimization"],
    lineItems: [
      {
        id: "li-review-gen-setup",
        serviceId: "svc-review-gen",
        name: "Review Automation Setup",
        unitLabel: "flat",
        unitPrice: 200,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "SMS and email review request automation configuration.",
      },
      {
        id: "li-review-gen-monitoring",
        serviceId: "svc-review-gen",
        name: "Review Monitoring & Alerts",
        unitLabel: "flat",
        unitPrice: 100,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "Real-time alerts and dashboard for all new reviews.",
      },
    ],
  },
  {
    id: "svc-ppc-setup",
    service: "PPC / Google Ads",
    name: "Google Ads Campaign Setup",
    department: "Paid Advertising",
    departmentColor: "#C2410C",
    departmentBg: "#FFF7ED",
    departmentBorder: "#FED7AA",
    monthlyFee: 0,
    setupFee: 1200,
    estimatedHoursPerMonth: 0,
    estimatedTimelineWeeks: "2–3 weeks",
    active: true,
    deliverables: [
      "Account structure build",
      "Keyword research & negative keyword list",
      "Ad copy creation (3 variants/ad group)",
      "Conversion tracking setup",
      "Campaign segmentation by service/intent",
      "Ad extension configuration",
    ],
    description: "Full Google Ads campaign build from scratch with proper structure, tracking, and keywords.",
    dependencies: ["svc-tracking"],
    lineItems: [
      {
        id: "li-ppc-setup-campaigns",
        serviceId: "svc-ppc-setup",
        name: "Campaign Setup",
        unitLabel: "campaigns",
        unitPrice: 200,
        defaultQuantity: 2,
        minQuantity: 1,
        maxQuantity: 10,
        isIncludedFlat: false,
        description: "Full campaign build per service line or intent segment.",
      },
      {
        id: "li-ppc-setup-adgroups",
        serviceId: "svc-ppc-setup",
        name: "Ad Group Setup",
        unitLabel: "ad groups",
        unitPrice: 75,
        defaultQuantity: 4,
        minQuantity: 1,
        maxQuantity: 20,
        isIncludedFlat: false,
        description: "Keyword-themed ad groups with 3 ad variants each.",
      },
      {
        id: "li-ppc-setup-tracking",
        serviceId: "svc-ppc-setup",
        name: "Conversion Tracking Setup",
        unitLabel: "flat",
        unitPrice: 150,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "Call, form, and goal conversion event configuration.",
      },
      {
        id: "li-ppc-setup-landing",
        serviceId: "svc-ppc-setup",
        name: "Landing Page Build",
        unitLabel: "pages",
        unitPrice: 250,
        defaultQuantity: 1,
        minQuantity: 0,
        maxQuantity: 10,
        isIncludedFlat: false,
        description: "Dedicated PPC landing pages optimized for Quality Score and conversion.",
      },
    ],
  },
  {
    id: "svc-ppc-monthly",
    service: "PPC / Google Ads",
    name: "Google Ads Monthly Management",
    department: "Paid Advertising",
    departmentColor: "#C2410C",
    departmentBg: "#FFF7ED",
    departmentBorder: "#FED7AA",
    monthlyFee: 1500,
    setupFee: 0,
    estimatedHoursPerMonth: 15,
    estimatedTimelineWeeks: "Ongoing",
    active: true,
    deliverables: [
      "Weekly bid management",
      "Negative keyword expansion",
      "Ad copy testing",
      "Quality Score improvement",
      "Bi-weekly performance report",
      "Budget pacing management",
    ],
    description: "Ongoing Google Ads campaign management, optimization, and reporting.",
    dependencies: ["svc-ppc-setup"],
    lineItems: [
      {
        id: "li-ppc-monthly-campaigns",
        serviceId: "svc-ppc-monthly",
        name: "Campaign Management",
        unitLabel: "campaigns",
        unitPrice: 200,
        defaultQuantity: 2,
        minQuantity: 1,
        maxQuantity: 10,
        isIncludedFlat: false,
        description: "Weekly bid management and optimization per campaign.",
      },
      {
        id: "li-ppc-monthly-adgroups",
        serviceId: "svc-ppc-monthly",
        name: "Ad Group Optimization",
        unitLabel: "ad groups",
        unitPrice: 75,
        defaultQuantity: 4,
        minQuantity: 1,
        maxQuantity: 20,
        isIncludedFlat: false,
        description: "Negative keywords, Quality Score, and copy testing.",
      },
      {
        id: "li-ppc-monthly-mgmt",
        serviceId: "svc-ppc-monthly",
        name: "Monthly Optimization & Management",
        unitLabel: "flat",
        unitPrice: 300,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "Budget pacing, search term review, and account health.",
      },
      {
        id: "li-ppc-monthly-reporting",
        serviceId: "svc-ppc-monthly",
        name: "Bi-Weekly Performance Reports",
        unitLabel: "flat",
        unitPrice: 100,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "CPC, CPL, Quality Score, and impression share reporting.",
      },
      {
        id: "li-ppc-monthly-landing",
        serviceId: "svc-ppc-monthly",
        name: "Landing Page Build",
        unitLabel: "pages",
        unitPrice: 250,
        defaultQuantity: 0,
        minQuantity: 0,
        maxQuantity: 10,
        isIncludedFlat: false,
        description: "Additional landing pages for new campaigns or A/B tests.",
      },
    ],
  },
  {
    id: "svc-lsa",
    service: "Local Service Ads",
    name: "LSA Management",
    department: "Paid Advertising",
    departmentColor: "#C2410C",
    departmentBg: "#FFF7ED",
    departmentBorder: "#FED7AA",
    monthlyFee: 400,
    setupFee: 200,
    estimatedHoursPerMonth: 4,
    estimatedTimelineWeeks: "Ongoing",
    active: true,
    deliverables: [
      "LSA profile setup & verification",
      "Service area & category configuration",
      "Review strategy for Google Guaranteed",
      "Budget management",
      "Monthly performance report",
    ],
    description: "Local Service Ads profile management for Google Guaranteed placement.",
    dependencies: [],
    lineItems: [
      {
        id: "li-lsa-setup",
        serviceId: "svc-lsa",
        name: "LSA Account Setup & Verification",
        unitLabel: "flat",
        unitPrice: 200,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "Profile creation, Google Guaranteed verification, and category setup.",
      },
      {
        id: "li-lsa-budget-mgmt",
        serviceId: "svc-lsa",
        name: "Budget & Bid Management",
        unitLabel: "flat",
        unitPrice: 150,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "Weekly lead review, dispute resolution, and budget pacing.",
      },
      {
        id: "li-lsa-review-setup",
        serviceId: "svc-lsa",
        name: "Review Generation Setup",
        unitLabel: "flat",
        unitPrice: 100,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "Post-job review request automation for LSA ranking.",
      },
    ],
  },
  {
    id: "svc-meta-setup",
    service: "Meta Ads",
    name: "Meta Ads Campaign Setup",
    department: "Meta Ads",
    departmentColor: "#1877F2",
    departmentBg: "#EFF6FF",
    departmentBorder: "#BFDBFE",
    monthlyFee: 0,
    setupFee: 900,
    estimatedHoursPerMonth: 0,
    estimatedTimelineWeeks: "1–2 weeks",
    active: true,
    deliverables: [
      "Account & pixel audit",
      "Custom audience creation",
      "Lookalike audience build",
      "Campaign structure build",
      "Creative strategy",
      "Retargeting campaign setup",
    ],
    description: "Full Meta Ads account setup including audiences, pixels, and campaign structure.",
    dependencies: ["svc-pixel"],
    lineItems: [
      {
        id: "li-meta-setup-campaigns",
        serviceId: "svc-meta-setup",
        name: "Number of Campaigns",
        unitLabel: "campaigns",
        unitPrice: 150,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 10,
        isIncludedFlat: false,
        description: "Full campaign build per objective (lead gen, awareness, retargeting).",
      },
      {
        id: "li-meta-setup-adsets",
        serviceId: "svc-meta-setup",
        name: "Ad Sets",
        unitLabel: "ad sets",
        unitPrice: 50,
        defaultQuantity: 2,
        minQuantity: 1,
        maxQuantity: 20,
        isIncludedFlat: false,
        description: "Audience-segmented ad sets per campaign.",
      },
      {
        id: "li-meta-setup-ads",
        serviceId: "svc-meta-setup",
        name: "Ads",
        unitLabel: "ads",
        unitPrice: 40,
        defaultQuantity: 3,
        minQuantity: 1,
        maxQuantity: 30,
        isIncludedFlat: false,
        description: "Individual ad creatives per ad set.",
      },
      {
        id: "li-meta-setup-banners",
        serviceId: "svc-meta-setup",
        name: "Banner Creative",
        unitLabel: "banners",
        unitPrice: 75,
        defaultQuantity: 3,
        minQuantity: 0,
        maxQuantity: 20,
        isIncludedFlat: false,
        description: "Static image ad creatives in Meta-optimized formats.",
      },
      {
        id: "li-meta-setup-pixel",
        serviceId: "svc-meta-setup",
        name: "Pixel & CAPI Setup",
        unitLabel: "flat",
        unitPrice: 150,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "Meta Pixel and Conversions API configuration.",
      },
    ],
  },
  {
    id: "svc-meta-monthly",
    service: "Meta Ads",
    name: "Meta Ads Monthly Management",
    department: "Meta Ads",
    departmentColor: "#1877F2",
    departmentBg: "#EFF6FF",
    departmentBorder: "#BFDBFE",
    monthlyFee: 1200,
    setupFee: 0,
    estimatedHoursPerMonth: 14,
    estimatedTimelineWeeks: "Ongoing",
    active: true,
    deliverables: [
      "Creative refresh (2 sets/mo)",
      "Audience optimization",
      "Retargeting management",
      "Monthly performance report",
      "A/B ad copy testing",
    ],
    description: "Ongoing Meta Ads management across Facebook and Instagram.",
    dependencies: ["svc-meta-setup"],
    lineItems: [
      {
        id: "li-meta-monthly-campaigns",
        serviceId: "svc-meta-monthly",
        name: "Number of Campaigns",
        unitLabel: "campaigns",
        unitPrice: 150,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 10,
        isIncludedFlat: false,
        description: "Active campaigns managed and optimized monthly.",
      },
      {
        id: "li-meta-monthly-adsets",
        serviceId: "svc-meta-monthly",
        name: "Ad Sets",
        unitLabel: "ad sets",
        unitPrice: 50,
        defaultQuantity: 2,
        minQuantity: 1,
        maxQuantity: 20,
        isIncludedFlat: false,
        description: "Audience optimization and retargeting per ad set.",
      },
      {
        id: "li-meta-monthly-ads",
        serviceId: "svc-meta-monthly",
        name: "Ads",
        unitLabel: "ads",
        unitPrice: 40,
        defaultQuantity: 3,
        minQuantity: 1,
        maxQuantity: 30,
        isIncludedFlat: false,
        description: "Active ad creatives tracked and A/B tested.",
      },
      {
        id: "li-meta-monthly-banners",
        serviceId: "svc-meta-monthly",
        name: "Banner Creative",
        unitLabel: "banners",
        unitPrice: 75,
        defaultQuantity: 3,
        minQuantity: 0,
        maxQuantity: 20,
        isIncludedFlat: false,
        description: "New or refreshed static image creatives.",
      },
      {
        id: "li-meta-monthly-video",
        serviceId: "svc-meta-monthly",
        name: "Video / Reels Creative",
        unitLabel: "videos",
        unitPrice: 200,
        defaultQuantity: 1,
        minQuantity: 0,
        maxQuantity: 10,
        isIncludedFlat: false,
        description: "Short-form video or Reels ad creative production.",
      },
      {
        id: "li-meta-monthly-copy",
        serviceId: "svc-meta-monthly",
        name: "Ad Copywriting",
        unitLabel: "ad sets",
        unitPrice: 30,
        defaultQuantity: 2,
        minQuantity: 1,
        maxQuantity: 20,
        isIncludedFlat: false,
        description: "Ad headline and body copy per ad set.",
      },
      {
        id: "li-meta-monthly-landing",
        serviceId: "svc-meta-monthly",
        name: "Landing Page Build",
        unitLabel: "pages",
        unitPrice: 250,
        defaultQuantity: 0,
        minQuantity: 0,
        maxQuantity: 10,
        isIncludedFlat: false,
        description: "Dedicated landing pages for campaign traffic.",
      },
      {
        id: "li-meta-monthly-pixel",
        serviceId: "svc-meta-monthly",
        name: "Pixel & CAPI Setup",
        unitLabel: "flat",
        unitPrice: 150,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "Meta Pixel and Conversions API configuration.",
      },
    ],
  },
  {
    id: "svc-tracking",
    service: "Website",
    name: "Tracking & Analytics Setup",
    department: "Analytics",
    departmentColor: "#0369A1",
    departmentBg: "#F0F9FF",
    departmentBorder: "#BAE6FD",
    monthlyFee: 0,
    setupFee: 700,
    estimatedHoursPerMonth: 0,
    estimatedTimelineWeeks: "1 week",
    active: true,
    deliverables: [
      "GTM installation",
      "GA4 configuration",
      "Form tracking setup",
      "Call tracking (DNI)",
      "Conversion event configuration",
      "Goal verification",
    ],
    description: "Full tracking stack: GTM, GA4, call tracking, and conversion events.",
    dependencies: [],
    lineItems: [
      {
        id: "li-tracking-gtm-ga4",
        serviceId: "svc-tracking",
        name: "GTM & GA4 Installation",
        unitLabel: "flat",
        unitPrice: 250,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "Google Tag Manager and GA4 property setup.",
      },
      {
        id: "li-tracking-forms",
        serviceId: "svc-tracking",
        name: "Form & Call Tracking Setup",
        unitLabel: "flat",
        unitPrice: 200,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "Form submit events and DNI call tracking configuration.",
      },
      {
        id: "li-tracking-conversions",
        serviceId: "svc-tracking",
        name: "Conversion Event Configuration",
        unitLabel: "flat",
        unitPrice: 150,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "Goal setup in GA4 and Google Ads with verification.",
      },
      {
        id: "li-tracking-verification",
        serviceId: "svc-tracking",
        name: "Tracking Verification & QA",
        unitLabel: "flat",
        unitPrice: 100,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "End-to-end funnel verification and data layer QA.",
      },
    ],
  },
  {
    id: "svc-pixel",
    service: "Meta Ads",
    name: "Meta Pixel & Events Setup",
    department: "Analytics",
    departmentColor: "#0369A1",
    departmentBg: "#F0F9FF",
    departmentBorder: "#BAE6FD",
    monthlyFee: 0,
    setupFee: 400,
    estimatedHoursPerMonth: 0,
    estimatedTimelineWeeks: "3–5 days",
    active: true,
    deliverables: [
      "Meta Pixel installation via GTM",
      "Standard event configuration (Lead, Contact, ViewContent)",
      "Custom event setup",
      "Audience pixel segments",
      "Pixel verification",
    ],
    description: "Meta Pixel installation with standard and custom events for full conversion tracking.",
    dependencies: [],
    lineItems: [
      {
        id: "li-pixel-install",
        serviceId: "svc-pixel",
        name: "Meta Pixel Installation",
        unitLabel: "flat",
        unitPrice: 150,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "Pixel base code installation via GTM.",
      },
      {
        id: "li-pixel-events",
        serviceId: "svc-pixel",
        name: "Standard & Custom Event Setup",
        unitLabel: "flat",
        unitPrice: 150,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "Lead, Contact, ViewContent, and custom conversion events.",
      },
      {
        id: "li-pixel-audiences",
        serviceId: "svc-pixel",
        name: "Audience Pixel Segments",
        unitLabel: "flat",
        unitPrice: 100,
        defaultQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        isIncludedFlat: true,
        description: "Retargeting and lookalike audience segment configuration.",
      },
    ],
  },
];

export function getServiceById(id: string): ServiceCatalogEntry | undefined {
  return SERVICE_CATALOG.find((s) => s.id === id);
}

export function getServiceLineItems(serviceId: string): ServiceLineItem[] {
  const entry = SERVICE_CATALOG.find((s) => s.id === serviceId);
  return entry?.lineItems ?? [];
}

// ─── Recommendation Rules ─────────────────────────────────────────────────────
// Settings → Recommendation Rules source of truth.
// Each rule maps audit finding patterns → recommended services + metadata.
// Rules are evaluated in order; all matching rules generate recommendations.

export interface RecommendationRule {
  id: string;
  name: string;
  description: string;
  active: boolean;
  order: number;

  // Conditions — all must be satisfied
  conditions: {
    triggerCategories?: string[];       // audit finding category match
    triggerSeverities?: FindingSeverity[]; // finding severity match
    goalIds?: string[];                 // active goals required
    minFindingCount?: number;           // minimum matching findings
  };

  // Output
  serviceId: string;                   // maps to SERVICE_CATALOG entry
  group: RecommendationGroup;
  priority: RecommendationPriority;
  severity: FindingSeverity;           // severity of this recommendation
  businessImpact: string;
  expectedOutcome: string;
  proposalReadiness: ProposalReadiness;
  confidenceBase: number;              // base confidence score 0–100
  revenueMultiplier: number;           // estimated revenue impact factor
  estimatedTimeline: string;
  estimatedHours: number;              // total estimated delivery hours
  dependencies: string[];              // other rule IDs that must also be recommended
}

export const RECOMMENDATION_RULES: RecommendationRule[] = [

  // ─── TRACKING FOUNDATION (Required before everything else) ───────────────

  {
    id: "rule-tracking-setup",
    name: "Tracking & Analytics Setup",
    description: "Missing conversion tracking is the #1 campaign failure — foundational fix required.",
    active: true,
    order: 1,
    conditions: {
      triggerCategories: ["Tracking", "PPC Tracking", "Conversion"],
      triggerSeverities: ["Critical", "High"],
    },
    serviceId: "svc-tracking",
    group: "Required Foundation",
    priority: "Critical",
    severity: "Critical",
    businessImpact: "Without conversion tracking, no campaigns can be optimized or prove ROI. Every dollar of ad spend is unattributable.",
    expectedOutcome: "Full-funnel attribution: form submissions, calls, and campaigns all tracked and attributed.",
    proposalReadiness: "Ready for Proposal",
    confidenceBase: 98,
    revenueMultiplier: 450,
    estimatedTimeline: "1 week",
    estimatedHours: 12,
    dependencies: [],
  },

  {
    id: "rule-pixel-setup",
    name: "Meta Pixel & Events Setup",
    description: "Meta Pixel missing or misconfigured — remarketing and AI optimization unavailable.",
    active: true,
    order: 2,
    conditions: {
      triggerCategories: ["Meta Tracking"],
      triggerSeverities: ["Critical", "High"],
    },
    serviceId: "svc-pixel",
    group: "Required Foundation",
    priority: "Critical",
    severity: "Critical",
    businessImpact: "No Pixel = no remarketing audiences, no lookalikes, and no conversion optimization on Meta campaigns.",
    expectedOutcome: "Full Meta event tracking with audience building from day one.",
    proposalReadiness: "Ready for Proposal",
    confidenceBase: 97,
    revenueMultiplier: 380,
    estimatedTimeline: "3–5 days",
    estimatedHours: 6,
    dependencies: [],
  },

  // ─── WEBSITE ─────────────────────────────────────────────────────────────

  {
    id: "rule-website-redesign",
    name: "Website Redesign",
    description: "Website performance, mobile responsiveness, or UX is critically deficient.",
    active: true,
    order: 3,
    conditions: {
      triggerCategories: ["Website Performance", "Website"],
      triggerSeverities: ["Critical", "High"],
    },
    serviceId: "svc-web-redesign",
    group: "Critical Fixes",
    priority: "Critical",
    severity: "Critical",
    businessImpact: "A slow, non-responsive, or poorly converting website undermines every other marketing investment.",
    expectedOutcome: "Fast, mobile-first, conversion-optimized website that supports all marketing channels.",
    proposalReadiness: "Needs Sales Approval",
    confidenceBase: 96,
    revenueMultiplier: 700,
    estimatedTimeline: "6–10 weeks",
    estimatedHours: 120,
    dependencies: [],
  },

  {
    id: "rule-website-maintenance",
    name: "Website Maintenance",
    description: "Ongoing website security, updates, and maintenance required.",
    active: true,
    order: 4,
    conditions: {
      triggerCategories: ["Website Performance"],
      triggerSeverities: ["High", "Medium"],
    },
    serviceId: "svc-web-maintenance",
    group: "Required Foundation",
    priority: "High",
    severity: "High",
    businessImpact: "Unmaintained sites accumulate security vulnerabilities, plugin conflicts, and performance degradation.",
    expectedOutcome: "Stable, secure, and up-to-date website with monitored uptime and regular backups.",
    proposalReadiness: "Ready for Proposal",
    confidenceBase: 88,
    revenueMultiplier: 280,
    estimatedTimeline: "Ongoing",
    estimatedHours: 3,
    dependencies: [],
  },

  // ─── SEO ─────────────────────────────────────────────────────────────────

  {
    id: "rule-technical-seo",
    name: "Technical SEO Fix",
    description: "Critical technical SEO issues found: crawl errors, robots.txt, sitemap, or canonicals.",
    active: true,
    order: 5,
    conditions: {
      triggerCategories: ["Technical SEO", "SEO"],
      triggerSeverities: ["Critical", "High"],
    },
    serviceId: "svc-technical-seo",
    group: "Critical Fixes",
    priority: "High",
    severity: "High",
    businessImpact: "Technical SEO issues block Google from properly indexing and ranking the site.",
    expectedOutcome: "Clean crawl report, proper indexation, and schema markup in place.",
    proposalReadiness: "Ready for Proposal",
    confidenceBase: 94,
    revenueMultiplier: 380,
    estimatedTimeline: "2–4 weeks",
    estimatedHours: 20,
    dependencies: [],
  },

  {
    id: "rule-seo-monthly",
    name: "SEO Monthly Management",
    description: "On-page SEO gaps, content thin-ness, or keyword strategy missing.",
    active: true,
    order: 6,
    conditions: {
      triggerCategories: ["SEO", "Content"],
      triggerSeverities: ["Critical", "High", "Medium"],
    },
    serviceId: "svc-seo-monthly",
    group: "Recommended Growth",
    priority: "High",
    severity: "High",
    businessImpact: "Consistent monthly SEO is the compound interest of digital marketing — delays reduce compounding gains.",
    expectedOutcome: "Measurable keyword rank improvements, organic traffic growth, and content authority within 90 days.",
    proposalReadiness: "Ready for Proposal",
    confidenceBase: 92,
    revenueMultiplier: 350,
    estimatedTimeline: "Ongoing",
    estimatedHours: 15,
    dependencies: ["rule-technical-seo"],
  },

  {
    id: "rule-local-seo",
    name: "Local SEO Management",
    description: "Local SEO gaps, missing location pages, or NAP inconsistency detected.",
    active: true,
    order: 7,
    conditions: {
      triggerCategories: ["Local SEO"],
      triggerSeverities: ["Critical", "High"],
    },
    serviceId: "svc-local-seo",
    group: "Revenue Opportunities",
    priority: "High",
    severity: "High",
    businessImpact: "Local SEO gaps prevent the business from appearing in map pack results for local intent searches.",
    expectedOutcome: "Local pack visibility for priority service areas, citation consistency, and location page rankings.",
    proposalReadiness: "Ready for Proposal",
    confidenceBase: 90,
    revenueMultiplier: 380,
    estimatedTimeline: "Ongoing",
    estimatedHours: 12,
    dependencies: [],
  },

  // ─── AI SEARCH VISIBILITY ─────────────────────────────────────────────────

  {
    id: "rule-ai-search",
    name: "AI Search Visibility",
    description: "Schema markup missing, E-E-A-T weak, or FAQ content absent — low AI search visibility.",
    active: true,
    order: 8,
    conditions: {
      triggerCategories: ["AI Search", "Emerging"],
      triggerSeverities: ["Critical", "High", "Medium"],
    },
    serviceId: "svc-ai-search",
    group: "Recommended Growth",
    priority: "Medium",
    severity: "Medium",
    businessImpact: "AI-generated search (SGE, ChatGPT, Perplexity) is capturing 15–30% of organic clicks — missing this channel means lost visibility.",
    expectedOutcome: "AI citation presence in Google SGE, Perplexity, and ChatGPT for target service keywords.",
    proposalReadiness: "Needs Review",
    confidenceBase: 85,
    revenueMultiplier: 300,
    estimatedTimeline: "Ongoing",
    estimatedHours: 10,
    dependencies: ["rule-seo-monthly"],
  },

  // ─── GOOGLE BUSINESS PROFILE ──────────────────────────────────────────────

  {
    id: "rule-gbp-optimization",
    name: "GBP Optimization",
    description: "GBP unclaimed, missing categories, or critically underoptimized.",
    active: true,
    order: 9,
    conditions: {
      triggerCategories: ["GBP", "Local"],
      triggerSeverities: ["Critical", "High"],
    },
    serviceId: "svc-gbp-optimization",
    group: "Quick Wins",
    priority: "Critical",
    severity: "Critical",
    businessImpact: "An unclaimed or underoptimized GBP directly reduces local pack visibility and inbound call volume.",
    expectedOutcome: "Fully optimized GBP with correct categories, business description, and 25+ photos.",
    proposalReadiness: "Ready for Proposal",
    confidenceBase: 97,
    revenueMultiplier: 320,
    estimatedTimeline: "1–2 weeks",
    estimatedHours: 8,
    dependencies: [],
  },

  {
    id: "rule-gbp-monthly",
    name: "GBP Monthly Management",
    description: "Inactive GBP: no recent posts, unanswered reviews, or zero photo activity.",
    active: true,
    order: 10,
    conditions: {
      triggerCategories: ["GBP", "Local"],
      triggerSeverities: ["Critical", "High", "Medium"],
    },
    serviceId: "svc-gbp-monthly",
    group: "Revenue Opportunities",
    priority: "High",
    severity: "High",
    businessImpact: "Inactive GBP profiles lose rankings as Google rewards engagement signals including posts, reviews, and photos.",
    expectedOutcome: "Consistent GBP activity driving local pack rank improvements within 60 days.",
    proposalReadiness: "Ready for Proposal",
    confidenceBase: 91,
    revenueMultiplier: 290,
    estimatedTimeline: "Ongoing",
    estimatedHours: 5,
    dependencies: ["rule-gbp-optimization"],
  },

  {
    id: "rule-review-generation",
    name: "Review Generation",
    description: "Low GBP review count detected — primary local pack ranking factor.",
    active: true,
    order: 11,
    conditions: {
      triggerCategories: ["GBP Reviews"],
      triggerSeverities: ["Critical", "High"],
    },
    serviceId: "svc-review-gen",
    group: "Quick Wins",
    priority: "High",
    severity: "High",
    businessImpact: "Review volume is the #1 local pack ranking signal — low reviews directly suppress visibility and click-through rates.",
    expectedOutcome: "Steady monthly review growth moving the GBP profile into local pack contention.",
    proposalReadiness: "Ready for Proposal",
    confidenceBase: 93,
    revenueMultiplier: 260,
    estimatedTimeline: "Ongoing",
    estimatedHours: 3,
    dependencies: ["rule-gbp-optimization"],
  },

  // ─── PPC / GOOGLE ADS ─────────────────────────────────────────────────────

  {
    id: "rule-ppc-setup",
    name: "Google Ads Campaign Setup",
    description: "PPC campaign missing, broken, or critically underperforming.",
    active: true,
    order: 12,
    conditions: {
      triggerCategories: ["PPC", "Paid Media"],
      triggerSeverities: ["Critical", "High"],
    },
    serviceId: "svc-ppc-setup",
    group: "Revenue Opportunities",
    priority: "Critical",
    severity: "Critical",
    businessImpact: "Broken or missing PPC campaigns are the fastest revenue recovery opportunity — correctly structured campaigns often double lead volume.",
    expectedOutcome: "Well-structured campaigns with conversion tracking, negative keywords, and dedicated landing pages.",
    proposalReadiness: "Ready for Proposal",
    confidenceBase: 96,
    revenueMultiplier: 580,
    estimatedTimeline: "2–3 weeks",
    estimatedHours: 25,
    dependencies: ["rule-tracking-setup"],
  },

  {
    id: "rule-ppc-monthly",
    name: "Google Ads Monthly Management",
    description: "PPC campaigns require ongoing management, bid optimization, and performance tuning.",
    active: true,
    order: 13,
    conditions: {
      triggerCategories: ["PPC", "PPC Tracking"],
      triggerSeverities: ["Critical", "High", "Medium"],
    },
    serviceId: "svc-ppc-monthly",
    group: "Revenue Opportunities",
    priority: "High",
    severity: "High",
    businessImpact: "Unmanaged PPC campaigns lose 20–40% efficiency monthly through quality score decay and unchecked waste.",
    expectedOutcome: "Improving cost-per-lead, Quality Scores above 6, and monthly ROI reporting.",
    proposalReadiness: "Ready for Proposal",
    confidenceBase: 93,
    revenueMultiplier: 520,
    estimatedTimeline: "Ongoing",
    estimatedHours: 15,
    dependencies: ["rule-ppc-setup"],
  },

  // ─── LOCAL SERVICE ADS ────────────────────────────────────────────────────

  {
    id: "rule-lsa",
    name: "LSA Management",
    description: "Business qualifies for Local Service Ads (Google Guaranteed) placement.",
    active: true,
    order: 14,
    conditions: {
      triggerCategories: ["PPC", "Local SEO", "GBP"],
      triggerSeverities: ["High", "Medium"],
      goalIds: ["goal-ppc", "goal-leads"],
    },
    serviceId: "svc-lsa",
    group: "Optional Future Phase",
    priority: "Medium",
    severity: "Medium",
    businessImpact: "LSA placements appear above all organic and traditional paid results for local service searches — highest-quality lead source.",
    expectedOutcome: "Google Guaranteed badge driving high-intent phone leads at a pay-per-lead model.",
    proposalReadiness: "Optional Add-On",
    confidenceBase: 80,
    revenueMultiplier: 340,
    estimatedTimeline: "Ongoing",
    estimatedHours: 4,
    dependencies: [],
  },

  // ─── META ADS ─────────────────────────────────────────────────────────────

  {
    id: "rule-meta-setup",
    name: "Meta Ads Campaign Setup",
    description: "No active Meta Ads campaigns while Pixel is installed or competitors are active.",
    active: true,
    order: 15,
    conditions: {
      triggerCategories: ["Meta Ads"],
      triggerSeverities: ["Critical", "High"],
    },
    serviceId: "svc-meta-setup",
    group: "Revenue Opportunities",
    priority: "High",
    severity: "High",
    businessImpact: "Absence from Meta advertising leaves 2B+ daily active users unreachable and competitor retargeting unchallenged.",
    expectedOutcome: "Active campaigns with custom audiences, retargeting, and lookalike targeting generating new lead flow.",
    proposalReadiness: "Ready for Proposal",
    confidenceBase: 91,
    revenueMultiplier: 440,
    estimatedTimeline: "1–2 weeks",
    estimatedHours: 18,
    dependencies: ["rule-pixel-setup"],
  },

  {
    id: "rule-meta-monthly",
    name: "Meta Ads Monthly Management",
    description: "Meta campaigns require ongoing creative refresh, audience optimization, and reporting.",
    active: true,
    order: 16,
    conditions: {
      triggerCategories: ["Meta Ads", "Meta Tracking"],
      triggerSeverities: ["Critical", "High", "Medium"],
    },
    serviceId: "svc-meta-monthly",
    group: "Revenue Opportunities",
    priority: "High",
    severity: "High",
    businessImpact: "Creative fatigue sets in within 3–4 weeks without active management — maintaining performance requires continuous testing.",
    expectedOutcome: "Declining cost-per-lead, improving ROAS, and growing remarketing audience quality.",
    proposalReadiness: "Ready for Proposal",
    confidenceBase: 89,
    revenueMultiplier: 420,
    estimatedTimeline: "Ongoing",
    estimatedHours: 14,
    dependencies: ["rule-meta-setup"],
  },
];

// ─── Priority Ranking Rules ────────────────────────────────────────────────────
// Determines final priority of a recommendation.
// Settings → Recommendation Rules → Priority Rules.
// Rules evaluated in order; first match wins.

export interface PriorityRankingRule {
  id: string;
  name: string;
  conditions: {
    groups?: RecommendationGroup[];
    severity?: FindingSeverity[];
    proposalReadiness?: ProposalReadiness[];
    minConfidence?: number;
    isQuickWin?: boolean;
    hasDependencyMet?: boolean;
  };
  resultPriority: RecommendationPriority;
  order: number;
}

export const PRIORITY_RANKING_RULES: PriorityRankingRule[] = [
  {
    id: "prr-1",
    name: "Critical Fix → Critical priority",
    conditions: { groups: ["Critical Fixes"] },
    resultPriority: "Critical",
    order: 1,
  },
  {
    id: "prr-2",
    name: "Required Foundation → Critical priority",
    conditions: { groups: ["Required Foundation"] },
    resultPriority: "Critical",
    order: 2,
  },
  {
    id: "prr-3",
    name: "Quick Win + Critical severity → Critical priority",
    conditions: { groups: ["Quick Wins"], severity: ["Critical"] },
    resultPriority: "Critical",
    order: 3,
  },
  {
    id: "prr-4",
    name: "Quick Win → High priority",
    conditions: { groups: ["Quick Wins"] },
    resultPriority: "High",
    order: 4,
  },
  {
    id: "prr-5",
    name: "Revenue Opportunity → High priority",
    conditions: { groups: ["Revenue Opportunities"] },
    resultPriority: "High",
    order: 5,
  },
  {
    id: "prr-6",
    name: "Recommended Growth → Medium priority",
    conditions: { groups: ["Recommended Growth"] },
    resultPriority: "Medium",
    order: 6,
  },
  {
    id: "prr-7",
    name: "Future Phase → Low priority",
    conditions: { groups: ["Optional Future Phase"] },
    resultPriority: "Low",
    order: 7,
  },
];

export function applyPriorityRankingRules(
  group: RecommendationGroup,
  severity: FindingSeverity
): RecommendationPriority {
  for (const rule of PRIORITY_RANKING_RULES.sort((a, b) => a.order - b.order)) {
    const matchesGroup = !rule.conditions.groups || rule.conditions.groups.includes(group);
    const matchesSeverity = !rule.conditions.severity || rule.conditions.severity.includes(severity);
    if (matchesGroup && matchesSeverity) return rule.resultPriority;
  }
  return "Low";
}

// ─── Confidence Score Modifiers ───────────────────────────────────────────────
// Settings → Recommendation Rules → Confidence Scoring.
// Modifiers are applied to the rule's base confidence score.

export interface ConfidenceModifier {
  id: string;
  name: string;
  condition: string;
  modifier: number; // +/- points
  active: boolean;
}

export const CONFIDENCE_MODIFIERS: ConfidenceModifier[] = [
  { id: "cm-1", name: "Multiple findings in same category",   condition: "findingCount >= 3", modifier: +5,  active: true },
  { id: "cm-2", name: "All findings are Critical",            condition: "allCritical",       modifier: +4,  active: true },
  { id: "cm-3", name: "Quick win (High severity, Low effort)",condition: "isQuickWin",        modifier: +3,  active: true },
  { id: "cm-4", name: "Only one Low severity finding",        condition: "onlyLow",           modifier: -8,  active: true },
  { id: "cm-5", name: "Mixed severities (range of 3+)",       condition: "wideRange",         modifier: -3,  active: true },
  { id: "cm-6", name: "Goal aligned (goal matches service)",  condition: "goalAligned",       modifier: +4,  active: true },
];

// ─── Budget Estimate Helpers ──────────────────────────────────────────────────

export interface BudgetEstimate {
  monthlyFee: number;
  setupFee: number;
  estimatedHours: number;
  annualValue: number;
  totalContractValue: (months: number) => number;
}

export function calculateBudgetEstimate(
  service: ServiceCatalogEntry,
  contractMonths: number = 12
): BudgetEstimate {
  return {
    monthlyFee: service.monthlyFee,
    setupFee: service.setupFee,
    estimatedHours: service.estimatedHoursPerMonth,
    annualValue: service.monthlyFee * 12 + service.setupFee,
    totalContractValue: (months: number) => service.monthlyFee * months + service.setupFee,
  };
}
