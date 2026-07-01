// RTM OS — Goal-Based Audit Engine Configuration
// ─────────────────────────────────────────────────────────────────────────────
// This module is the SINGLE SOURCE OF TRUTH for all audit business rules.
// Nothing in the Sales workspace pages should hardcode:
//   • Audit Goals          • Audit Templates       • Audit Categories
//   • Audit Sections       • Audit Questions        • Scoring Rules
//   • Recommendation Mapping • Department Mapping  • Priority Rules
//
// All of the below will eventually be served from Settings API endpoints.
// The data shapes match the Settings schema contracts exactly.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Scoring Architecture ─────────────────────────────────────────────────────

export interface ScoringThreshold {
  key: string;
  label: string;
  minScore: number;    // inclusive lower bound
  maxScore: number;    // inclusive upper bound
  color: string;
  bg: string;
  border: string;
  description: string;
}

/** Read from config — never hardcode these thresholds in UI */
export const SCORING_THRESHOLDS: ScoringThreshold[] = [
  {
    key: "excellent",
    label: "Excellent",
    minScore: 85,
    maxScore: 100,
    color: "#15803D",
    bg: "#F0FDF4",
    border: "#BBF7D0",
    description: "Performing at a high level — minor optimizations available.",
  },
  {
    key: "good",
    label: "Good",
    minScore: 65,
    maxScore: 84,
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    description: "Solid foundation — meaningful improvement opportunities exist.",
  },
  {
    key: "needs-improvement",
    label: "Needs Improvement",
    minScore: 40,
    maxScore: 64,
    color: "#EA580C",
    bg: "#FFF7ED",
    border: "#FED7AA",
    description: "Notable gaps present — structured action plan required.",
  },
  {
    key: "critical",
    label: "Critical",
    minScore: 0,
    maxScore: 39,
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    description: "Significant issues found — immediate intervention recommended.",
  },
];

export function getScoringThreshold(score: number): ScoringThreshold {
  return (
    SCORING_THRESHOLDS.find(
      (t) => score >= t.minScore && score <= t.maxScore
    ) ?? SCORING_THRESHOLDS[SCORING_THRESHOLDS.length - 1]
  );
}

// ─── Severity Configuration ───────────────────────────────────────────────────

export type FindingSeverity = "Critical" | "High" | "Medium" | "Low";

export interface SeverityConfig {
  key: FindingSeverity;
  label: string;
  scoreImpact: number;   // points deducted per finding of this severity
  priorityOrder: number; // 1 = highest
  color: string;
  bg: string;
  border: string;
}

export const SEVERITY_CONFIG: SeverityConfig[] = [
  { key: "Critical", label: "Critical", scoreImpact: 20, priorityOrder: 1, color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
  { key: "High",     label: "High",     scoreImpact: 12, priorityOrder: 2, color: "#C2410C", bg: "#FFF7ED", border: "#FED7AA" },
  { key: "Medium",   label: "Medium",   scoreImpact: 6,  priorityOrder: 3, color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  { key: "Low",      label: "Low",      scoreImpact: 2,  priorityOrder: 4, color: "#15803D", bg: "#F0FDF4", border: "#BBF7D0" },
];

export function getSeverityConfig(key: FindingSeverity): SeverityConfig {
  return SEVERITY_CONFIG.find((s) => s.key === key) ?? SEVERITY_CONFIG[3];
}

// ─── Effort Configuration ─────────────────────────────────────────────────────

export type EffortLevel = "Low" | "Medium" | "High";

export interface EffortConfig {
  key: EffortLevel;
  label: string;
  description: string;
  typicalDays: string;
  color: string;
  bg: string;
}

export const EFFORT_CONFIG: EffortConfig[] = [
  { key: "Low",    label: "Low Effort",    description: "Quick win — typically config or content change",   typicalDays: "1–5 days",   color: "#15803D", bg: "#F0FDF4" },
  { key: "Medium", label: "Medium Effort", description: "Structured project — requires planning",           typicalDays: "1–4 weeks",  color: "#D97706", bg: "#FFFBEB" },
  { key: "High",   label: "High Effort",   description: "Major initiative — cross-team coordination needed", typicalDays: "4–12 weeks", color: "#C2410C", bg: "#FFF7ED" },
];

// ─── Department Mapping ───────────────────────────────────────────────────────
// Maps audit findings to the department that owns the remediation work.
// This drives department-level summary reports and workload routing.

export interface DepartmentConfig {
  id: string;
  key: string;
  label: string;
  color: string;
  bg: string;
  border: string;
  description: string;
}

export const DEPARTMENT_CONFIG: DepartmentConfig[] = [
  { id: "dept-seo",     key: "SEO",                label: "SEO",                color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE", description: "Organic search, technical SEO, content strategy" },
  { id: "dept-ppc",     key: "Paid Advertising",   label: "Paid Advertising",   color: "#C2410C", bg: "#FFF7ED", border: "#FED7AA", description: "Google Ads, PPC campaigns, bid management" },
  { id: "dept-meta",    key: "Meta Ads",            label: "Meta Ads",           color: "#1877F2", bg: "#EFF6FF", border: "#BFDBFE", description: "Facebook, Instagram advertising" },
  { id: "dept-gbp",     key: "GBP",                label: "GBP",                color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", description: "Google Business Profile management" },
  { id: "dept-web",     key: "Web Development",    label: "Web Development",    color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE", description: "Website design, development, hosting" },
  { id: "dept-cro",     key: "CRO",                label: "CRO",                color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC", description: "Conversion rate optimization, UX, landing pages" },
  { id: "dept-content", key: "Content",            label: "Content",            color: "#059669", bg: "#ECFDF5", border: "#A7F3D0", description: "Content creation, blogging, copywriting" },
  { id: "dept-ai",      key: "AI Automation",      label: "AI Automation",      color: "#6D28D9", bg: "#F5F3FF", border: "#DDD6FE", description: "AI tools, automation workflows, chatbots" },
  { id: "dept-report",  key: "Analytics",          label: "Analytics",          color: "#0369A1", bg: "#F0F9FF", border: "#BAE6FD", description: "Tracking, reporting, attribution setup" },
  { id: "dept-lsa",     key: "LSA",                label: "LSA",                color: "#BE123C", bg: "#FFF1F2", border: "#FECDD3", description: "Local Service Ads, Google Guaranteed" },
];

export function getDepartmentConfig(key: string): DepartmentConfig | undefined {
  return DEPARTMENT_CONFIG.find((d) => d.key === key);
}

// ─── Audit Question Types ─────────────────────────────────────────────────────

export type QuestionType =
  | "binary"     // Yes / No
  | "score"      // Numeric 0–100
  | "select"     // Single option from list
  | "multiselect"// Multiple options
  | "text"       // Free text observation
  | "url"        // URL field
  | "count"      // Integer count
  | "rating";    // 1–5 rating

// ─── Audit Question ───────────────────────────────────────────────────────────

export interface AuditQuestion {
  id: string;
  key: string;
  label: string;
  type: QuestionType;
  helpText?: string;
  options?: string[];
  required: boolean;
  severityIfFailed: FindingSeverity;
  businessImpact: string;
  relatedService?: string;
  department: string;
  estimatedEffort: EffortLevel;
  weight: number;     // contribution to section score (0–100, sum within section = 100)
  order: number;
}

// ─── Audit Section ────────────────────────────────────────────────────────────

export interface AuditSectionConfig {
  id: string;
  key: string;
  label: string;
  description: string;
  category: string;
  department: string;
  goalIds: string[];   // which goals activate this section
  questions: AuditQuestion[];
  weight: number;      // section weight in overall score (0–100, sum = 100 across active sections)
  order: number;
  icon: string;
}

// ─── Audit Template ───────────────────────────────────────────────────────────

export interface AuditTemplateConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  isDefault: boolean;
  active: boolean;
  // All available sections; engine filters by selected goalIds
  sections: AuditSectionConfig[];
}

// ─── Recommendation Mapping ───────────────────────────────────────────────────
// Maps findings (by severity + category) to recommended services and departments.

export interface RecommendationMapping {
  id: string;
  name: string;
  triggerCategory: string;
  triggerSeverity: FindingSeverity[];
  recommendedService: string;
  department: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  estimatedTimeline: string;
  estimatedMonthlyFee: number;
  revenueImpactMultiplier: number;  // multiply issue count by this for estimated revenue impact
  active: boolean;
}

export const RECOMMENDATION_MAPPINGS: RecommendationMapping[] = [
  // SEO
  { id: "rm-seo-tech",    name: "Technical SEO Fix",       triggerCategory: "Technical SEO",     triggerSeverity: ["Critical","High"],      recommendedService: "Technical SEO",           department: "SEO",              priority: "High",     estimatedTimeline: "2–4 weeks",  estimatedMonthlyFee: 1200, revenueImpactMultiplier: 400, active: true },
  { id: "rm-seo-content", name: "SEO Content Strategy",    triggerCategory: "Content",           triggerSeverity: ["Critical","High","Medium"], recommendedService: "SEO Monthly Management",  department: "SEO",              priority: "High",     estimatedTimeline: "Ongoing",    estimatedMonthlyFee: 1200, revenueImpactMultiplier: 350, active: true },
  { id: "rm-seo-local",   name: "Local SEO",               triggerCategory: "Local SEO",         triggerSeverity: ["Critical","High"],      recommendedService: "Local SEO Management",    department: "SEO",              priority: "High",     estimatedTimeline: "Ongoing",    estimatedMonthlyFee: 1000, revenueImpactMultiplier: 380, active: true },
  // GBP
  { id: "rm-gbp-opt",     name: "GBP Optimization",        triggerCategory: "GBP",               triggerSeverity: ["Critical","High"],      recommendedService: "GBP Optimization",        department: "GBP",              priority: "Critical", estimatedTimeline: "1–2 weeks",  estimatedMonthlyFee: 500,  revenueImpactMultiplier: 300, active: true },
  { id: "rm-gbp-reviews", name: "Review Generation",       triggerCategory: "GBP Reviews",       triggerSeverity: ["Critical","High"],      recommendedService: "Review Generation",       department: "GBP",              priority: "High",     estimatedTimeline: "Ongoing",    estimatedMonthlyFee: 300,  revenueImpactMultiplier: 250, active: true },
  // PPC
  { id: "rm-ppc-setup",   name: "PPC Campaign Setup",      triggerCategory: "PPC",               triggerSeverity: ["Critical","High"],      recommendedService: "Google Ads Management",   department: "Paid Advertising", priority: "Critical", estimatedTimeline: "2–3 weeks",  estimatedMonthlyFee: 1500, revenueImpactMultiplier: 600, active: true },
  { id: "rm-ppc-track",   name: "PPC Conversion Tracking", triggerCategory: "PPC Tracking",      triggerSeverity: ["Critical","High"],      recommendedService: "Conversion Tracking Setup", department: "Analytics",     priority: "Critical", estimatedTimeline: "1 week",     estimatedMonthlyFee: 700,  revenueImpactMultiplier: 500, active: true },
  // Meta
  { id: "rm-meta-ads",    name: "Meta Ads Management",     triggerCategory: "Meta Ads",          triggerSeverity: ["Critical","High"],      recommendedService: "Meta Ads Management",     department: "Meta Ads",         priority: "High",     estimatedTimeline: "1–2 weeks",  estimatedMonthlyFee: 1200, revenueImpactMultiplier: 450, active: true },
  { id: "rm-meta-pixel",  name: "Meta Pixel Setup",        triggerCategory: "Meta Tracking",     triggerSeverity: ["Critical","High"],      recommendedService: "Meta Pixel & Events Setup", department: "Analytics",     priority: "High",     estimatedTimeline: "3–5 days",   estimatedMonthlyFee: 400,  revenueImpactMultiplier: 350, active: true },
  // Website
  { id: "rm-web-redesign", name: "Website Redesign",       triggerCategory: "Website Performance", triggerSeverity: ["Critical","High"],    recommendedService: "Website Redesign",        department: "Web Development",  priority: "Critical", estimatedTimeline: "4–8 weeks",  estimatedMonthlyFee: 0,    revenueImpactMultiplier: 700, active: true },
  { id: "rm-web-cro",     name: "CRO Program",             triggerCategory: "Conversion",        triggerSeverity: ["Critical","High","Medium"], recommendedService: "CRO Program",           department: "CRO",              priority: "High",     estimatedTimeline: "Ongoing",    estimatedMonthlyFee: 900,  revenueImpactMultiplier: 400, active: true },
  // Tracking
  { id: "rm-tracking",    name: "Analytics & Tracking",    triggerCategory: "Tracking",          triggerSeverity: ["Critical","High"],      recommendedService: "Tracking & Analytics Setup", department: "Analytics",     priority: "Critical", estimatedTimeline: "1 week",     estimatedMonthlyFee: 700,  revenueImpactMultiplier: 450, active: true },
  // AI Search
  { id: "rm-ai-search",   name: "AI Search Optimization",  triggerCategory: "AI Search",         triggerSeverity: ["Critical","High","Medium"], recommendedService: "AI Search Optimization", department: "SEO",            priority: "Medium",   estimatedTimeline: "Ongoing",    estimatedMonthlyFee: 800,  revenueImpactMultiplier: 300, active: true },
];

// ─── Priority Rules ───────────────────────────────────────────────────────────
// Determines how a finding gets its final priority label.
// Rules are evaluated in order; first match wins.

export interface PriorityRule {
  id: string;
  name: string;
  conditions: {
    severity?: FindingSeverity[];
    effortLevel?: EffortLevel[];
    revenueImpactMin?: number;
  };
  resultPriority: "Critical" | "High" | "Medium" | "Low";
  order: number;
}

export const PRIORITY_RULES: PriorityRule[] = [
  { id: "pr-1", name: "Critical severity → Critical priority", conditions: { severity: ["Critical"] }, resultPriority: "Critical", order: 1 },
  { id: "pr-2", name: "High severity + Low effort → Critical priority (quick critical win)", conditions: { severity: ["High"], effortLevel: ["Low"] }, resultPriority: "Critical", order: 2 },
  { id: "pr-3", name: "High severity → High priority", conditions: { severity: ["High"] }, resultPriority: "High", order: 3 },
  { id: "pr-4", name: "Medium severity + Low effort → High priority (quick win)", conditions: { severity: ["Medium"], effortLevel: ["Low"] }, resultPriority: "High", order: 4 },
  { id: "pr-5", name: "Medium severity → Medium priority", conditions: { severity: ["Medium"] }, resultPriority: "Medium", order: 5 },
  { id: "pr-6", name: "Low severity → Low priority", conditions: { severity: ["Low"] }, resultPriority: "Low", order: 6 },
];

export function resolvePriority(
  severity: FindingSeverity,
  effort: EffortLevel
): "Critical" | "High" | "Medium" | "Low" {
  for (const rule of PRIORITY_RULES.sort((a, b) => a.order - b.order)) {
    const matchesSeverity = !rule.conditions.severity || rule.conditions.severity.includes(severity);
    const matchesEffort = !rule.conditions.effortLevel || rule.conditions.effortLevel.includes(effort);
    if (matchesSeverity && matchesEffort) return rule.resultPriority;
  }
  return "Low";
}

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT TEMPLATE — The default template
// All sections below; the engine filters to active sections based on goalIds.
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_AUDIT_TEMPLATE: AuditTemplateConfig = {
  id: "tmpl-default-v1",
  name: "Full Digital Presence Audit",
  description: "Comprehensive audit template covering SEO, GBP, Paid Media, Website, AI Search, and Conversion. Sections activate based on selected goals.",
  version: "1.0.0",
  isDefault: true,
  active: true,
  sections: [

    // ── SECTION: WEBSITE CONVERSION ───────────────────────────────────────────
    {
      id: "sec-website-conversion",
      key: "website-conversion",
      label: "Website Conversion",
      description: "Evaluate the website's ability to convert visitors into leads and calls.",
      category: "Conversion",
      department: "CRO",
      goalIds: ["goal-leads", "goal-conversion", "goal-website-redesign"],
      weight: 15,
      order: 1,
      icon: "🎯",
      questions: [
        { id: "q-wc-1",  key: "has_clear_cta",         label: "Does every page have a clear, visible call-to-action?",                     type: "binary",  required: true,  severityIfFailed: "Critical", businessImpact: "Missing CTAs directly reduce lead capture — visitors leave without contacting.",              relatedService: "CRO Program",               department: "CRO",              estimatedEffort: "Low",    weight: 25, order: 1 },
        { id: "q-wc-2",  key: "has_contact_form",       label: "Is a contact or lead capture form present on key pages?",                  type: "binary",  required: true,  severityIfFailed: "Critical", businessImpact: "No form = no passive lead capture. 60%+ of visitors prefer forms over calling.",             relatedService: "CRO Program",               department: "CRO",              estimatedEffort: "Low",    weight: 20, order: 2 },
        { id: "q-wc-3",  key: "phone_visible",          label: "Is the phone number visible above the fold on all pages?",                 type: "binary",  required: true,  severityIfFailed: "High",     businessImpact: "Hidden phone number reduces inbound calls by up to 40%.",                                   relatedService: "CRO Program",               department: "CRO",              estimatedEffort: "Low",    weight: 15, order: 3 },
        { id: "q-wc-4",  key: "form_tracking_active",   label: "Are form submissions tracked as conversions in Google Analytics?",         type: "binary",  required: false, severityIfFailed: "High",     businessImpact: "Without form tracking, you cannot measure ROI or optimize campaigns.",                      relatedService: "Tracking & Analytics Setup", department: "Analytics",       estimatedEffort: "Low",    weight: 20, order: 4 },
        { id: "q-wc-5",  key: "trust_signals_present",  label: "Are trust signals present (reviews, awards, certifications, social proof)?", type: "binary",  required: false, severityIfFailed: "Medium",   businessImpact: "Trust signals increase conversion rates by 10–30%.",                                       relatedService: "CRO Program",               department: "CRO",              estimatedEffort: "Medium", weight: 10, order: 5 },
        { id: "q-wc-6",  key: "live_chat_present",      label: "Is live chat or an AI chat widget available?",                             type: "binary",  required: false, severityIfFailed: "Low",      businessImpact: "Live chat can increase leads by 20–45% by capturing intent at the moment of interest.",    relatedService: "AI Automation",             department: "AI Automation",    estimatedEffort: "Medium", weight: 10, order: 6 },
      ],
    },

    // ── SECTION: SEO ─────────────────────────────────────────────────────────
    {
      id: "sec-seo",
      key: "seo",
      label: "SEO",
      description: "Technical SEO health, on-page optimization, and keyword presence.",
      category: "SEO",
      department: "SEO",
      goalIds: ["goal-leads", "goal-seo"],
      weight: 15,
      order: 2,
      icon: "🔍",
      questions: [
        { id: "q-seo-1", key: "title_tags_optimized",   label: "Are page title tags unique and keyword-optimized?",                        type: "binary",  required: true,  severityIfFailed: "High",     businessImpact: "Unoptimized title tags suppress rankings for all target keywords.",                          relatedService: "SEO Monthly Management",    department: "SEO",              estimatedEffort: "Low",    weight: 15, order: 1 },
        { id: "q-seo-2", key: "meta_descriptions",      label: "Are meta descriptions present on all key pages?",                         type: "binary",  required: true,  severityIfFailed: "Medium",   businessImpact: "Missing meta descriptions reduce click-through rates from search results.",                relatedService: "SEO Monthly Management",    department: "SEO",              estimatedEffort: "Low",    weight: 10, order: 2 },
        { id: "q-seo-3", key: "xml_sitemap_submitted",  label: "Is an XML sitemap submitted to Google Search Console?",                   type: "binary",  required: true,  severityIfFailed: "High",     businessImpact: "Without a sitemap, Google may miss or delay indexing key pages.",                           relatedService: "Technical SEO",             department: "SEO",              estimatedEffort: "Low",    weight: 15, order: 3 },
        { id: "q-seo-4", key: "no_crawl_errors",        label: "Is the site free from crawl errors (verified in Search Console)?",        type: "binary",  required: true,  severityIfFailed: "Critical", businessImpact: "Crawl errors prevent Google from indexing important pages.",                               relatedService: "Technical SEO",             department: "SEO",              estimatedEffort: "Medium", weight: 20, order: 4 },
        { id: "q-seo-5", key: "h1_tags_present",        label: "Does every key page have a single, keyword-relevant H1 tag?",             type: "binary",  required: true,  severityIfFailed: "Medium",   businessImpact: "Missing or duplicate H1s reduce on-page relevance signals.",                               relatedService: "SEO Monthly Management",    department: "SEO",              estimatedEffort: "Low",    weight: 10, order: 5 },
        { id: "q-seo-6", key: "internal_links_healthy", label: "Is the internal link structure free of broken links?",                    type: "binary",  required: false, severityIfFailed: "High",     businessImpact: "Broken internal links waste crawl budget and harm user experience.",                       relatedService: "Technical SEO",             department: "SEO",              estimatedEffort: "Medium", weight: 15, order: 6 },
        { id: "q-seo-7", key: "schema_markup_present",  label: "Is Schema Markup (LocalBusiness, FAQ, etc.) implemented?",                type: "binary",  required: false, severityIfFailed: "Medium",   businessImpact: "Schema markup enables rich results and improves AI search visibility.",                    relatedService: "Technical SEO",             department: "SEO",              estimatedEffort: "Medium", weight: 15, order: 7 },
      ],
    },

    // ── SECTION: GBP ──────────────────────────────────────────────────────────
    {
      id: "sec-gbp",
      key: "gbp",
      label: "Google Business Profile",
      description: "GBP completeness, review health, posting activity, and local pack ranking.",
      category: "Local",
      department: "GBP",
      goalIds: ["goal-leads", "goal-gbp", "goal-seo"],
      weight: 15,
      order: 3,
      icon: "📍",
      questions: [
        { id: "q-gbp-1", key: "gbp_claimed_verified",   label: "Is the GBP listing claimed and verified?",                                type: "binary",  required: true,  severityIfFailed: "Critical", businessImpact: "An unclaimed GBP cannot be optimized and may display incorrect information.",              relatedService: "GBP Optimization",          department: "GBP",              estimatedEffort: "Low",    weight: 20, order: 1 },
        { id: "q-gbp-2", key: "review_count",           label: "Does the GBP have 50+ reviews?",                                          type: "binary",  required: true,  severityIfFailed: "High",     businessImpact: "Review volume is the #1 local pack ranking factor — low reviews mean low visibility.",    relatedService: "Review Generation",         department: "GBP",              estimatedEffort: "Medium", weight: 20, order: 2 },
        { id: "q-gbp-3", key: "review_rating",          label: "Is the average review rating 4.0 or higher?",                             type: "binary",  required: true,  severityIfFailed: "High",     businessImpact: "Ratings below 4.0 suppress local pack rankings and reduce click-through.",               relatedService: "Review Generation",         department: "GBP",              estimatedEffort: "Medium", weight: 15, order: 3 },
        { id: "q-gbp-4", key: "recent_posts",           label: "Has the GBP had at least 1 post in the last 14 days?",                    type: "binary",  required: false, severityIfFailed: "Medium",   businessImpact: "Regular posting signals activity to Google and improves engagement scores.",              relatedService: "GBP Optimization",          department: "GBP",              estimatedEffort: "Low",    weight: 15, order: 4 },
        { id: "q-gbp-5", key: "photos_uploaded",        label: "Are 20+ high-quality photos uploaded to the GBP?",                        type: "binary",  required: false, severityIfFailed: "Medium",   businessImpact: "Profiles with 100+ photos receive 520% more calls than those with 10 photos.",            relatedService: "GBP Optimization",          department: "GBP",              estimatedEffort: "Low",    weight: 15, order: 5 },
        { id: "q-gbp-6", key: "categories_complete",    label: "Are primary and secondary GBP categories fully configured?",              type: "binary",  required: false, severityIfFailed: "High",     businessImpact: "Correct categories determine which searches the profile appears for.",                   relatedService: "GBP Optimization",          department: "GBP",              estimatedEffort: "Low",    weight: 15, order: 6 },
      ],
    },

    // ── SECTION: PPC ──────────────────────────────────────────────────────────
    {
      id: "sec-ppc",
      key: "ppc",
      label: "PPC / Google Ads",
      description: "Campaign structure, tracking, keyword strategy, and budget efficiency.",
      category: "Paid Media",
      department: "Paid Advertising",
      goalIds: ["goal-ppc"],
      weight: 15,
      order: 4,
      icon: "💰",
      questions: [
        { id: "q-ppc-1", key: "conversion_tracking",    label: "Is Google Ads conversion tracking firing correctly?",                     type: "binary",  required: true,  severityIfFailed: "Critical", businessImpact: "Without conversion tracking, you cannot optimize campaigns or prove ROI.",               relatedService: "Conversion Tracking Setup", department: "Analytics",        estimatedEffort: "Low",    weight: 25, order: 1 },
        { id: "q-ppc-2", key: "negative_keywords",      label: "Is a negative keyword list active with 50+ entries?",                    type: "binary",  required: true,  severityIfFailed: "Critical", businessImpact: "Missing negative keywords waste 30–60% of budget on irrelevant searches.",              relatedService: "Google Ads Management",     department: "Paid Advertising", estimatedEffort: "Low",    weight: 20, order: 2 },
        { id: "q-ppc-3", key: "dedicated_landing_pages", label: "Are dedicated landing pages used for paid traffic?",                    type: "binary",  required: true,  severityIfFailed: "High",     businessImpact: "Sending paid traffic to the homepage reduces Quality Score and conversion rate.",        relatedService: "Google Ads Management",     department: "Paid Advertising", estimatedEffort: "High",   weight: 20, order: 3 },
        { id: "q-ppc-4", key: "campaign_segmentation",  label: "Are campaigns segmented by service type or intent?",                     type: "binary",  required: false, severityIfFailed: "High",     businessImpact: "Single-campaign structures cannot optimize bids at the service level.",                  relatedService: "Google Ads Management",     department: "Paid Advertising", estimatedEffort: "Medium", weight: 15, order: 4 },
        { id: "q-ppc-5", key: "ad_extensions_active",   label: "Are call extensions, sitelinks, and lead forms configured?",             type: "binary",  required: false, severityIfFailed: "Medium",   businessImpact: "Ad extensions improve CTR by 10–15% at no additional cost.",                            relatedService: "Google Ads Management",     department: "Paid Advertising", estimatedEffort: "Low",    weight: 10, order: 5 },
        { id: "q-ppc-6", key: "quality_scores",         label: "Are target keyword Quality Scores 6 or higher?",                         type: "binary",  required: false, severityIfFailed: "Medium",   businessImpact: "Low Quality Scores increase cost-per-click by up to 400%.",                             relatedService: "Google Ads Management",     department: "Paid Advertising", estimatedEffort: "Medium", weight: 10, order: 6 },
      ],
    },

    // ── SECTION: META ADS ─────────────────────────────────────────────────────
    {
      id: "sec-meta",
      key: "meta",
      label: "Meta Ads",
      description: "Meta Pixel health, campaign activity, audience strategy, and creative performance.",
      category: "Paid Media",
      department: "Meta Ads",
      goalIds: ["goal-meta"],
      weight: 12,
      order: 5,
      icon: "📱",
      questions: [
        { id: "q-meta-1", key: "pixel_installed",       label: "Is the Meta Pixel installed on all website pages?",                       type: "binary",  required: true,  severityIfFailed: "Critical", businessImpact: "Without the Pixel, no remarketing, lookalike audiences, or conversion optimization is possible.", relatedService: "Meta Pixel & Events Setup", department: "Analytics",        estimatedEffort: "Low",    weight: 25, order: 1 },
        { id: "q-meta-2", key: "pixel_events_firing",   label: "Are key Pixel events configured (Lead, Contact, ViewContent)?",           type: "binary",  required: true,  severityIfFailed: "High",     businessImpact: "Without event data, Meta cannot optimize ad delivery for your conversion goals.",         relatedService: "Meta Pixel & Events Setup", department: "Analytics",        estimatedEffort: "Low",    weight: 20, order: 2 },
        { id: "q-meta-3", key: "active_campaigns",      label: "Are there active Meta ad campaigns running?",                             type: "binary",  required: false, severityIfFailed: "High",     businessImpact: "No Meta presence means missing a channel reaching 2B+ daily active users.",              relatedService: "Meta Ads Management",       department: "Meta Ads",         estimatedEffort: "Medium", weight: 20, order: 3 },
        { id: "q-meta-4", key: "custom_audiences",      label: "Are custom audiences (website visitors, customer list) built?",           type: "binary",  required: false, severityIfFailed: "High",     businessImpact: "Custom audiences dramatically reduce cost-per-lead vs cold prospecting.",                 relatedService: "Meta Ads Management",       department: "Meta Ads",         estimatedEffort: "Medium", weight: 20, order: 4 },
        { id: "q-meta-5", key: "retargeting_active",    label: "Is a retargeting campaign active for website visitors?",                  type: "binary",  required: false, severityIfFailed: "Medium",   businessImpact: "Retargeting converts website visitors who didn't convert — typical ROAS 5–8x.",          relatedService: "Meta Ads Management",       department: "Meta Ads",         estimatedEffort: "Medium", weight: 15, order: 5 },
      ],
    },

    // ── SECTION: AI SEARCH ────────────────────────────────────────────────────
    {
      id: "sec-ai-search",
      key: "ai-search",
      label: "AI Search Visibility",
      description: "Readiness for AI-powered search results: Google SGE, ChatGPT, Perplexity, and Gemini.",
      category: "Emerging",
      department: "SEO",
      goalIds: ["goal-ai-search"],
      weight: 10,
      order: 6,
      icon: "🤖",
      questions: [
        { id: "q-ai-1",  key: "schema_comprehensive",   label: "Is comprehensive schema markup implemented (LocalBusiness, FAQ, Review)?", type: "binary",  required: true,  severityIfFailed: "Critical", businessImpact: "Schema markup is required for AI systems to understand and cite your business.",            relatedService: "AI Search Optimization",    department: "SEO",              estimatedEffort: "Medium", weight: 25, order: 1 },
        { id: "q-ai-2",  key: "eeat_signals",           label: "Are E-E-A-T signals present (author bios, credentials, experience pages)?", type: "binary",  required: true, severityIfFailed: "High",     businessImpact: "AI systems heavily weight E-E-A-T signals when selecting sources to cite.",              relatedService: "AI Search Optimization",    department: "SEO",              estimatedEffort: "High",   weight: 20, order: 2 },
        { id: "q-ai-3",  key: "faq_content_present",    label: "Are FAQ pages or FAQ schema blocks present for key topics?",               type: "binary",  required: false, severityIfFailed: "High",     businessImpact: "FAQ content is the most common format cited in AI-generated search answers.",             relatedService: "AI Search Optimization",    department: "SEO",              estimatedEffort: "Medium", weight: 20, order: 3 },
        { id: "q-ai-4",  key: "content_authority",      label: "Does the website demonstrate topical authority through deep content?",     type: "binary",  required: false, severityIfFailed: "Medium",   businessImpact: "Topical authority signals are the primary way to earn consistent AI citations.",         relatedService: "AI Search Optimization",    department: "SEO",              estimatedEffort: "High",   weight: 20, order: 4 },
        { id: "q-ai-5",  key: "mentions_and_citations", label: "Is the business mentioned or cited on authoritative third-party sites?",   type: "binary",  required: false, severityIfFailed: "Medium",   businessImpact: "Third-party mentions and citations increase AI visibility and trust scores.",             relatedService: "AI Search Optimization",    department: "SEO",              estimatedEffort: "High",   weight: 15, order: 5 },
      ],
    },

    // ── SECTION: LEAD CAPTURE ─────────────────────────────────────────────────
    {
      id: "sec-lead-capture",
      key: "lead-capture",
      label: "Lead Capture",
      description: "Lead forms, call tracking, and lead qualification infrastructure.",
      category: "Conversion",
      department: "Analytics",
      goalIds: ["goal-leads"],
      weight: 12,
      order: 7,
      icon: "📥",
      questions: [
        { id: "q-lc-1",  key: "call_tracking_active",   label: "Is dynamic call tracking installed (CallRail or equivalent)?",            type: "binary",  required: true,  severityIfFailed: "Critical", businessImpact: "Without call tracking, you cannot attribute phone leads to specific campaigns.",         relatedService: "Tracking & Analytics Setup", department: "Analytics",       estimatedEffort: "Low",    weight: 30, order: 1 },
        { id: "q-lc-2",  key: "ga4_installed",          label: "Is Google Analytics 4 (GA4) installed and configured?",                   type: "binary",  required: true,  severityIfFailed: "High",     businessImpact: "Without GA4, you have no visibility into user behavior or campaign performance.",        relatedService: "Tracking & Analytics Setup", department: "Analytics",       estimatedEffort: "Low",    weight: 25, order: 2 },
        { id: "q-lc-3",  key: "gsc_connected",          label: "Is Google Search Console connected and verified?",                        type: "binary",  required: false, severityIfFailed: "Medium",   businessImpact: "Search Console is required for sitemap submission and crawl error monitoring.",          relatedService: "Technical SEO",             department: "SEO",              estimatedEffort: "Low",    weight: 15, order: 3 },
        { id: "q-lc-4",  key: "leads_in_crm",           label: "Are form leads automatically sent to a CRM or email?",                   type: "binary",  required: false, severityIfFailed: "High",     businessImpact: "Leads not captured in a CRM have a 78% chance of never being followed up.",             relatedService: "AI Automation",             department: "AI Automation",    estimatedEffort: "Medium", weight: 30, order: 4 },
      ],
    },

    // ── SECTION: ANALYTICS ────────────────────────────────────────────────────
    {
      id: "sec-analytics",
      key: "analytics",
      label: "Analytics & Tracking",
      description: "Full-funnel tracking, attribution, and measurement infrastructure.",
      category: "Tracking",
      department: "Analytics",
      goalIds: ["goal-leads", "goal-conversion", "goal-ppc"],
      weight: 10,
      order: 8,
      icon: "📊",
      questions: [
        { id: "q-an-1",  key: "goals_configured",       label: "Are conversion goals configured in GA4?",                                 type: "binary",  required: true,  severityIfFailed: "Critical", businessImpact: "Without GA4 goals, you cannot measure campaign effectiveness or justify spend.",        relatedService: "Tracking & Analytics Setup", department: "Analytics",       estimatedEffort: "Low",    weight: 30, order: 1 },
        { id: "q-an-2",  key: "gtm_installed",          label: "Is Google Tag Manager (GTM) installed and managing tags?",                type: "binary",  required: false, severityIfFailed: "High",     businessImpact: "Without GTM, tag management is fragile and requires developer access for every change.", relatedService: "Tracking & Analytics Setup", department: "Analytics",       estimatedEffort: "Low",    weight: 25, order: 2 },
        { id: "q-an-3",  key: "attribution_model",      label: "Is a consistent attribution model in use across all platforms?",         type: "binary",  required: false, severityIfFailed: "Medium",   businessImpact: "Inconsistent attribution leads to incorrect budget allocation decisions.",              relatedService: "Tracking & Analytics Setup", department: "Analytics",       estimatedEffort: "Medium", weight: 25, order: 3 },
        { id: "q-an-4",  key: "monthly_reporting",      label: "Is a monthly performance reporting cadence in place?",                   type: "binary",  required: false, severityIfFailed: "Low",      businessImpact: "Without reporting, there is no feedback loop for ongoing improvement.",                relatedService: "Tracking & Analytics Setup", department: "Analytics",       estimatedEffort: "Low",    weight: 20, order: 4 },
      ],
    },

    // ── SECTION: UX & ACCESSIBILITY ───────────────────────────────────────────
    {
      id: "sec-ux",
      key: "ux",
      label: "UX & Accessibility",
      description: "User experience, mobile responsiveness, and accessibility standards.",
      category: "Website",
      department: "Web Development",
      goalIds: ["goal-website-redesign", "goal-conversion"],
      weight: 12,
      order: 9,
      icon: "✨",
      questions: [
        { id: "q-ux-1",  key: "mobile_responsive",      label: "Is the website fully mobile-responsive?",                                 type: "binary",  required: true,  severityIfFailed: "Critical", businessImpact: "Over 65% of local search traffic is mobile — non-responsive sites lose the majority.",   relatedService: "Website Redesign",          department: "Web Development",  estimatedEffort: "High",   weight: 25, order: 1 },
        { id: "q-ux-2",  key: "navigation_intuitive",   label: "Is the site navigation intuitive with clear hierarchy?",                 type: "binary",  required: true,  severityIfFailed: "High",     businessImpact: "Confusing navigation is a top-3 reason visitors leave without converting.",             relatedService: "Website Redesign",          department: "Web Development",  estimatedEffort: "Medium", weight: 20, order: 2 },
        { id: "q-ux-3",  key: "accessibility_basics",   label: "Does the site meet basic WCAG 2.1 accessibility standards?",             type: "binary",  required: false, severityIfFailed: "High",     businessImpact: "ADA compliance gaps create legal liability and exclude 15% of users.",                  relatedService: "Website Redesign",          department: "Web Development",  estimatedEffort: "Medium", weight: 20, order: 3 },
        { id: "q-ux-4",  key: "consistent_branding",    label: "Is branding (colors, fonts, imagery) consistent across all pages?",      type: "binary",  required: false, severityIfFailed: "Medium",   businessImpact: "Inconsistent branding reduces trust and perceived professionalism.",                    relatedService: "Website Redesign",          department: "Web Development",  estimatedEffort: "Medium", weight: 15, order: 4 },
        { id: "q-ux-5",  key: "error_pages_handled",    label: "Are 404 error pages properly handled with navigation back?",             type: "binary",  required: false, severityIfFailed: "Low",      businessImpact: "Dead-end 404 pages cause visitors to leave the site.",                                  relatedService: "Technical SEO",             department: "SEO",              estimatedEffort: "Low",    weight: 10, order: 5 },
        { id: "q-ux-6",  key: "readable_typography",    label: "Is typography readable with sufficient contrast and sizing?",            type: "binary",  required: false, severityIfFailed: "Medium",   businessImpact: "Poor typography drives 38% of visitors to stop engaging with content.",                relatedService: "Website Redesign",          department: "Web Development",  estimatedEffort: "Low",    weight: 10, order: 6 },
      ],
    },

    // ── SECTION: WEBSITE PERFORMANCE ──────────────────────────────────────────
    {
      id: "sec-performance",
      key: "performance",
      label: "Website Performance",
      description: "Core Web Vitals, page speed, and technical performance benchmarks.",
      category: "Website",
      department: "Web Development",
      goalIds: ["goal-website-redesign", "goal-seo"],
      weight: 12,
      order: 10,
      icon: "⚡",
      questions: [
        { id: "q-perf-1", key: "pagespeed_desktop",     label: "Is the desktop PageSpeed score 80 or higher?",                            type: "binary",  required: true,  severityIfFailed: "High",     businessImpact: "Google uses page speed as a direct ranking factor — slow sites rank lower.",            relatedService: "Website Redesign",          department: "Web Development",  estimatedEffort: "Medium", weight: 25, order: 1 },
        { id: "q-perf-2", key: "pagespeed_mobile",      label: "Is the mobile PageSpeed score 70 or higher?",                             type: "binary",  required: true,  severityIfFailed: "Critical", businessImpact: "Mobile page speed directly impacts Google mobile rankings and user engagement.",        relatedService: "Website Redesign",          department: "Web Development",  estimatedEffort: "High",   weight: 25, order: 2 },
        { id: "q-perf-3", key: "lcp_under_2s",          label: "Is Largest Contentful Paint (LCP) under 2.5 seconds?",                    type: "binary",  required: true,  severityIfFailed: "High",     businessImpact: "Every 1s delay in LCP reduces conversions by ~7%.",                                     relatedService: "Website Redesign",          department: "Web Development",  estimatedEffort: "High",   weight: 20, order: 3 },
        { id: "q-perf-4", key: "images_optimized",      label: "Are all images compressed and served in modern formats (WebP)?",          type: "binary",  required: false, severityIfFailed: "Medium",   businessImpact: "Unoptimized images are the #1 cause of slow page load times.",                         relatedService: "Website Redesign",          department: "Web Development",  estimatedEffort: "Low",    weight: 15, order: 4 },
        { id: "q-perf-5", key: "ssl_valid",             label: "Is the SSL certificate valid and HTTPS enforced on all pages?",           type: "binary",  required: true,  severityIfFailed: "Critical", businessImpact: "Expired SSL causes browser 'Not Secure' warnings — 68% of users leave immediately.",   relatedService: "Technical SEO",             department: "SEO",              estimatedEffort: "Low",    weight: 15, order: 5 },
      ],
    },

    // ── SECTION: TECHNICAL SEO ────────────────────────────────────────────────
    {
      id: "sec-technical-seo",
      key: "technical-seo",
      label: "Technical SEO",
      description: "Indexability, crawlability, and advanced technical SEO factors.",
      category: "SEO",
      department: "SEO",
      goalIds: ["goal-seo", "goal-website-redesign"],
      weight: 10,
      order: 11,
      icon: "⚙️",
      questions: [
        { id: "q-tseo-1", key: "robots_txt_correct",    label: "Is the robots.txt file correctly configured (no key pages blocked)?",    type: "binary",  required: true,  severityIfFailed: "Critical", businessImpact: "Incorrectly blocking pages in robots.txt prevents Google from indexing revenue pages.",   relatedService: "Technical SEO",             department: "SEO",              estimatedEffort: "Low",    weight: 25, order: 1 },
        { id: "q-tseo-2", key: "canonical_tags",        label: "Are canonical tags present on pages with duplicate or similar content?", type: "binary",  required: false, severityIfFailed: "High",     businessImpact: "Without canonicals, Google may index duplicate pages instead of the primary.",           relatedService: "Technical SEO",             department: "SEO",              estimatedEffort: "Low",    weight: 20, order: 2 },
        { id: "q-tseo-3", key: "redirects_clean",       label: "Are 301 redirects used for all old/moved URLs?",                         type: "binary",  required: false, severityIfFailed: "High",     businessImpact: "Broken redirects lose link equity and harm user experience.",                           relatedService: "Technical SEO",             department: "SEO",              estimatedEffort: "Low",    weight: 20, order: 3 },
        { id: "q-tseo-4", key: "duplicate_content",     label: "Is the site free from significant duplicate content issues?",            type: "binary",  required: false, severityIfFailed: "High",     businessImpact: "Duplicate content causes keyword cannibalization and suppresses all related pages.",     relatedService: "Technical SEO",             department: "SEO",              estimatedEffort: "Medium", weight: 20, order: 4 },
        { id: "q-tseo-5", key: "structured_data",       label: "Is structured data (JSON-LD) properly implemented and error-free?",      type: "binary",  required: false, severityIfFailed: "Medium",   businessImpact: "Valid structured data enables rich results and improves CTR by 15–30%.",                relatedService: "Technical SEO",             department: "SEO",              estimatedEffort: "Medium", weight: 15, order: 5 },
      ],
    },

    // ── SECTION: CONTENT ──────────────────────────────────────────────────────
    {
      id: "sec-content",
      key: "content",
      label: "Content Strategy",
      description: "Content depth, service page quality, blog presence, and content gaps.",
      category: "SEO",
      department: "Content",
      goalIds: ["goal-seo", "goal-website-redesign"],
      weight: 8,
      order: 12,
      icon: "📝",
      questions: [
        { id: "q-con-1", key: "service_page_depth",     label: "Do service pages have at least 600 words of unique, quality content?",   type: "binary",  required: true,  severityIfFailed: "High",     businessImpact: "Thin service pages (under 300 words) rarely rank for competitive keywords.",             relatedService: "SEO Monthly Management",    department: "Content",          estimatedEffort: "Medium", weight: 30, order: 1 },
        { id: "q-con-2", key: "blog_active",            label: "Is there an active blog with at least 1 post per month?",                type: "binary",  required: false, severityIfFailed: "High",     businessImpact: "Sites with blogs receive 55% more traffic and 97% more inbound links.",                relatedService: "SEO Monthly Management",    department: "Content",          estimatedEffort: "Medium", weight: 25, order: 2 },
        { id: "q-con-3", key: "location_pages_present", label: "Are location-specific landing pages created for service areas?",         type: "binary",  required: false, severityIfFailed: "High",     businessImpact: "Location pages are the primary driver for multi-area local search visibility.",         relatedService: "Local SEO Management",      department: "SEO",              estimatedEffort: "Medium", weight: 25, order: 3 },
        { id: "q-con-4", key: "content_freshness",      label: "Has existing content been updated in the last 12 months?",               type: "binary",  required: false, severityIfFailed: "Medium",   businessImpact: "Stale content loses rankings as fresher competitor content takes over.",               relatedService: "SEO Monthly Management",    department: "Content",          estimatedEffort: "Low",    weight: 20, order: 4 },
      ],
    },

  ],
};

// ─── AI Audit Configuration ─────────────────────────────────────────────────────────────────────────────────────

export const AI_AUDIT_SYSTEM_PROMPT = `You are a professional digital marketing auditor specializing in home services businesses. A sales representative is building a proposal for a prospect and needs you to analyze the prospect website for marketing issues.

You will receive website HTML content plus business context including trade type, city, goals, and current marketing spend data.

Analyze the website for marketing signals relevant to home service businesses. Return ONLY valid JSON with no markdown fences, no preamble, and no explanation outside the JSON. Your entire response must be parseable JSON.

The exact JSON schema to follow:
{
  "serviceResults": [
    {
      "serviceId": "<one of: seo, gbp, ppc, lsa, meta-ads, website>",
      "serviceLabel": "<human-readable label>",
      "findings": [
        {
          "id": "<unique string>",
          "category": "<one of the exact category strings listed below>",
          "severity": "<Critical|High|Medium|Low>",
          "title": "<concise finding title>",
          "description": "<specific description of the issue found in the HTML>",
          "recommendation": "<specific actionable recommendation>",
          "source": "ai"
        }
      ],
      "summary": "<one to two sentence summary of this service area>",
      "score": <integer 0-100>,
      "scoreLabel": "<short label>"
    }
  ],
  "overallScore": <integer 0-100>
}

The category field MUST use one of these exact strings only:
Tracking, PPC Tracking, Conversion, Meta Tracking, Website Performance, Website, Technical SEO, SEO, Content, Local SEO, AI Search, Emerging, GBP, Local, GBP Reviews, PPC, Paid Media, Meta Ads

The serviceId field MUST be one of: seo, gbp, ppc, lsa, meta-ads, website

Generate findings only where real issues are visible or inferable from the HTML provided. Do not invent problems that cannot be inferred from the content. Each finding must have a specific actionable recommendation, not generic advice. Only include serviceResults entries where at least one genuine finding exists.`;

export const AI_AUDIT_USER_PROMPT_TEMPLATE = `Analyze the following home services business website for digital marketing issues and opportunities.

Business Context:
- Business Name: {{BUSINESS_NAME}}
- Trade Type: {{TRADE_TYPE}}
- City: {{CITY}}
- State: {{STATE}}
- Primary Goals: {{GOALS}}
- Website URL: {{WEBSITE_URL}}

Current Marketing Context:
{{CURRENT_MARKETING_CONTEXT}}

Website HTML Content:
{{WEBSITE_CONTENT}}

Analyze the following HTML signals:

SEO Signals:
- Page title tag (present, contains relevant keywords, includes location?)
- Meta description (present, compelling, includes service and location?)
- H1 tag (present, only one, relevant to trade type?)
- H2/H3 heading structure (logical hierarchy?)
- Schema markup (LocalBusiness, Service, Review schemas present?)
- NAP consistency (Name, Address, Phone visible in footer or contact section?)
- City/state mentioned in page content?
- Service area pages or location-specific pages present?
- Internal linking structure (navigation links to key service pages?)
- Image alt text coverage (images have descriptive alt attributes?)
- Blog or content section present?

Tracking and Conversion Signals:
- Google Tag Manager or GA4 script present?
- Meta Pixel script present (facebook.net, fbevents.js)?
- Google Ads conversion tag present (googleadservices.com, gtag conversion)?
- Contact form or booking or scheduling widget present?
- Phone number visible above the fold?
- Clear call-to-action buttons on key pages?

Performance Signals:
- Mobile viewport meta tag present?
- Render-blocking scripts (excessive inline scripts, synchronous script tags before content)?
- Large inline styles that may slow rendering?
- Image format signals (non-WebP images visible in HTML)?

Trust and Authority Signals:
- Reviews widget or review count visible?
- Trust badges, certifications, or license numbers shown?
- Years in business mentioned?
- Team photos or about section present?

Content Relevance:
- Content relevance to trade type {{TRADE_TYPE}} and service area {{CITY}}, {{STATE}}
- Emergency or urgent service CTAs (critical for plumbing, HVAC, electrical)?
- Seasonal content relevant to the trade?
- Competitor differentiators or unique value propositions present?

Business Context Factors:
- For the trade type {{TRADE_TYPE}}, consider typical customer expectations and urgency patterns
- For {{CITY}}, {{STATE}}, assess whether local SEO signals adequately target this market
- The prospect primary goals are: {{GOALS}} -- prioritize findings most relevant to these goals
- Current marketing: {{CURRENT_MARKETING_CONTEXT}}
  - If running Google Ads: assess optimization needs rather than setup needs
  - If not running Google Ads: assess the opportunity cost and setup readiness
  - Apply same logic for LSA and Meta Ads

Return only the JSON object described in your instructions. No markdown, no explanation.`;

export const PAGESPEED_API_BASE_URL =
  "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

export const AI_AUDIT_SCORE_THRESHOLDS: Record<string, { min: number; max: number; label: string }> = {
  critical:  { min: 0,  max: 30,  label: "Critical — Immediate Action Required" },
  poor:      { min: 31, max: 50,  label: "Poor — Significant Issues Found" },
  fair:      { min: 51, max: 70,  label: "Fair — Improvements Needed" },
  good:      { min: 71, max: 85,  label: "Good — Minor Optimizations Available" },
  excellent: { min: 86, max: 100, label: "Excellent — Well Optimized" },
};

export function getAuditScoreLabel(score: number): string {
  for (const threshold of Object.values(AI_AUDIT_SCORE_THRESHOLDS)) {
    if (score >= threshold.min && score <= threshold.max) {
      return threshold.label;
    }
  }
  return AI_AUDIT_SCORE_THRESHOLDS.critical.label;
}

// ─── Audit Request System Configuration ─────────────────────────────────────────

import type { AuditRequestMode, AuditRequestStatus } from "./types";

export const AUDIT_REQUEST_MODE_LABELS: Record<AuditRequestMode, string> = {
  ai: "AI Audit",
  manual: "Manual Audit",
  hybrid: "Hybrid Audit",
};

export const AUDIT_REQUEST_STATUS_LABELS: Record<AuditRequestStatus, string> = {
  "pending-assignment":         "Pending Assignment",
  "in-progress":                "In Progress",
  "ai-complete-pending-review": "AI Complete — Pending Review",
  "finalized":                  "Finalized",
  "overdue":                    "Overdue",
  "cancelled":                  "Cancelled",
};

export const AUDIT_REQUEST_STATUS_COLORS: Record<AuditRequestStatus, { bg: string; color: string; border: string }> = {
  "pending-assignment":         { bg: "#F3F4F6", color: "#6B7280", border: "#D1D5DB" },
  "in-progress":                { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
  "ai-complete-pending-review": { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
  "finalized":                  { bg: "#F0FDF4", color: "#15803D", border: "#BBF7D0" },
  "overdue":                    { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  "cancelled":                  { bg: "#F9FAFB", color: "#9CA3AF", border: "#E5E7EB" },
};

export const SERVICE_TO_DEPARTMENT_MAP: Record<string, string> = {
  "svc-seo-onboarding":       "SEO",
  "svc-seo-monthly":          "SEO",
  "svc-technical-seo":        "SEO",
  "svc-local-seo":            "SEO",
  "svc-ai-search":            "SEO",
  "SEO":                      "SEO",
  "SEO AI Search Visibility": "SEO",
  "svc-gbp-optimization":     "GBP",
  "svc-gbp-monthly":          "GBP",
  "svc-review-gen":           "GBP",
  "GBP":                      "GBP",
  "Google Business Profile":  "GBP",
  "svc-ppc-setup":            "Paid Advertising",
  "svc-ppc-monthly":          "Paid Advertising",
  "svc-lsa":                  "Paid Advertising",
  "PPC / Google Ads":         "Paid Advertising",
  "Local Service Ads":        "Paid Advertising",
  "svc-meta-setup":           "Meta Ads",
  "svc-meta-monthly":         "Meta Ads",
  "Meta Ads":                 "Meta Ads",
  "svc-web-redesign":         "Web Development",
  "svc-web-maintenance":      "Web Development",
  "Website":                  "Web Development",
  "svc-tracking":             "Analytics",
  "svc-pixel":                "Analytics",
};

export const AUDIT_REQUEST_SLA_HOURS: number = 24;

export interface ScorecardCategory {
  id: string;
  label: string;
  description: string;
  maxScore: number;
}

export const MANUAL_SCORECARD_CATEGORIES: Record<string, ScorecardCategory[]> = {
  "SEO": [
    { id: "technical-seo",         label: "Technical SEO Health",          description: "Site crawlability, indexation, robots.txt, sitemaps, and technical errors.",      maxScore: 100 },
    { id: "on-page-optimization",  label: "On-Page Optimization",          description: "Title tags, meta descriptions, H1s, schema markup, and internal linking.",        maxScore: 100 },
    { id: "backlink-profile",      label: "Backlink Profile Strength",     description: "Quality and quantity of inbound links; authority and relevance.",                maxScore: 100 },
    { id: "content-quality",       label: "Content Quality",               description: "Depth, uniqueness, and topical relevance of service and location pages.",          maxScore: 100 },
    { id: "local-seo",             label: "Local SEO Presence",            description: "Citation consistency, NAP accuracy, and local keyword targeting.",                maxScore: 100 },
  ],
  "GBP": [
    { id: "gbp-completeness",      label: "Profile Completeness",          description: "Categories, business description, services, hours, and attributes.",              maxScore: 100 },
    { id: "review-health",         label: "Review Health",                 description: "Volume, recency, rating average, and response rate.",                             maxScore: 100 },
    { id: "posting-activity",      label: "Posting Activity",              description: "Frequency and quality of GBP posts in the last 30 days.",                         maxScore: 100 },
    { id: "photo-quality",         label: "Photo Quality and Volume",      description: "Number of high-quality photos across interior, exterior, and team.",              maxScore: 100 },
  ],
  "Paid Advertising": [
    { id: "campaign-structure",    label: "Campaign Structure",            description: "Segmentation by intent, service, and match type quality.",                        maxScore: 100 },
    { id: "conversion-tracking",   label: "Conversion Tracking",           description: "Accuracy and completeness of conversion events and attribution.",                 maxScore: 100 },
    { id: "keyword-strategy",      label: "Keyword Strategy",              description: "Relevance, coverage, and negative keyword management.",                           maxScore: 100 },
    { id: "ad-creative",           label: "Ad Creative Quality",           description: "CTR, Quality Score, and ad copy relevance.",                                      maxScore: 100 },
    { id: "landing-pages",         label: "Landing Page Alignment",        description: "Dedicated pages, CTA clarity, and relevance to ad groups.",                      maxScore: 100 },
  ],
  "Meta Ads": [
    { id: "pixel-setup",           label: "Pixel and Event Setup",         description: "Pixel installation completeness and standard/custom event configuration.",       maxScore: 100 },
    { id: "audience-strategy",     label: "Audience Strategy",             description: "Custom audiences, lookalikes, and retargeting segment quality.",                 maxScore: 100 },
    { id: "creative-performance",  label: "Creative Performance",          description: "Ad creative quality, variety, and estimated engagement.",                        maxScore: 100 },
    { id: "campaign-objectives",   label: "Campaign Objective Alignment",  description: "Campaigns matched to awareness, consideration, or conversion goals.",           maxScore: 100 },
  ],
  "Web Development": [
    { id: "pagespeed",             label: "Page Speed and Core Web Vitals", description: "Desktop and mobile PageSpeed scores and LCP/CLS/FID metrics.",              maxScore: 100 },
    { id: "mobile-responsiveness", label: "Mobile Responsiveness",         description: "Layout, tap targets, and content rendering on mobile devices.",                maxScore: 100 },
    { id: "ux-design",             label: "UX and Navigation",             description: "Navigation hierarchy, CTA placement, and overall conversion usability.",         maxScore: 100 },
    { id: "security",              label: "Security and SSL",              description: "SSL validity, CMS updates, and known vulnerability status.",                     maxScore: 100 },
  ],
  "Analytics": [
    { id: "tracking-completeness", label: "Tracking Completeness",         description: "GTM, GA4, conversion events, and call tracking coverage.",                      maxScore: 100 },
    { id: "attribution",           label: "Attribution Accuracy",          description: "Consistency of attribution model across all advertising platforms.",             maxScore: 100 },
    { id: "reporting",             label: "Reporting and Dashboards",       description: "Availability and accuracy of monthly performance reporting.",                    maxScore: 100 },
  ],
  "CRO": [
    { id: "cta-clarity",           label: "CTA Clarity and Placement",     description: "Visibility and clarity of calls-to-action across key pages.",                  maxScore: 100 },
    { id: "form-optimization",     label: "Form Optimization",             description: "Form presence, field count, and submission tracking.",                           maxScore: 100 },
    { id: "trust-signals",         label: "Trust Signals",                 description: "Reviews, certifications, guarantees, and social proof placement.",              maxScore: 100 },
  ],
  "Content": [
    { id: "content-depth",         label: "Content Depth",                 description: "Word count, topical coverage, and uniqueness of service pages.",                 maxScore: 100 },
    { id: "freshness",             label: "Content Freshness",             description: "Recency of page updates and blog publishing cadence.",                           maxScore: 100 },
    { id: "location-content",      label: "Location Page Quality",         description: "Presence and quality of city/service-area specific landing pages.",             maxScore: 100 },
  ],
};

export const MOCK_DEPARTMENT_REVIEWERS: Record<string, string[]> = {
  "SEO":              ["Alex K.", "Dana W."],
  "GBP":              ["Marcus T.", "Priya S."],
  "Paid Advertising": ["Jordan L.", "Casey R."],
  "Meta Ads":         ["Sam P.", "Taylor M."],
  "Web Development":  ["Riley O.", "Quinn B."],
  "Analytics":        ["Morgan F.", "Blake N."],
  "CRO":              ["Drew C.", "Harper G."],
  "Content":          ["Avery J.", "Skyler K."],
};

// ─── Goal → Section Mapping Helper ───────────────────────────────────────────
// Given a set of selected goal IDs, returns the sections that should be active.

// ─── Citation Platform Category Map ─────────────────────────────────────────────
// Maps listing platform IDs to the rule-matching category strings they should
// produce AuditFindings under. Values must exactly match triggerCategories
// entries in RECOMMENDATION_RULES. Multiple categories per platform mean a
// finding will be generated for each category so all relevant rules can match.

export const CITATION_PLATFORM_CATEGORY_MAP: Record<string, string[]> = {
  "gbp":          ["GBP", "Local SEO"],
  "yelp":         ["Local SEO"],
  "apple-maps":   ["Local SEO"],
  "bing-places":  ["Local SEO"],
  "angi":         ["Local SEO"],
  "thumbtack":    ["Local SEO"],
  "facebook":     ["Meta Ads"],
  "instagram":    ["Meta Ads"],
  "bbb":          ["Local SEO"],
  "nextdoor":     ["Local SEO"],
};

// ─── Citation Scoring Weights ────────────────────────────────────────────────────
// Platform id -> weight in citation score. Sum = 100.

export const CITATION_SCORING_WEIGHTS: Record<string, number> = {
  "gbp":          30,
  "yelp":         15,
  "apple-maps":   10,
  "bing-places":   8,
  "facebook":      8,
  "instagram":     5,
  "bbb":           8,
  "angi":          8,
  "thumbtack":     5,
  "nextdoor":      3,
};

// ─── NAP Comparison Rules ─────────────────────────────────────────────────────────

export const NAP_COMPARISON_RULES = {
  minorVariationPatterns: [
    "street/st",
    "avenue/ave",
    "boulevard/blvd",
    "drive/dr",
    "road/rd",
    "court/ct",
    "suite/ste",
    "llc",
    "inc",
    "phone-formatting",
  ],
  majorMismatchThreshold: 3,
};

// ─── Keyword Templates ───────────────────────────────────────────────────────────────
// Maps trade type -> keyword templates with {city} placeholder.

export const KEYWORD_TEMPLATES: Record<string, string[]> = {
  "Plumbing": [
    "plumber in {city}",
    "plumbing company {city}",
    "emergency plumber {city}",
    "{city} drain cleaning",
    "water heater repair {city}",
    "plumbing repair near me",
    "24 hour plumber {city}",
  ],
  "HVAC": [
    "HVAC company {city}",
    "AC repair {city}",
    "heating and cooling {city}",
    "furnace repair {city}",
    "air conditioning installation {city}",
    "HVAC contractor near me",
    "emergency AC repair {city}",
  ],
  "Electrical": [
    "electrician {city}",
    "electrical contractor {city}",
    "emergency electrician {city}",
    "electrical repair {city}",
    "licensed electrician near me",
    "panel upgrade {city}",
  ],
  "Roofing": [
    "roofing company {city}",
    "roof repair {city}",
    "roof replacement {city}",
    "storm damage roof repair {city}",
    "roofer near me",
    "roofing contractor {city}",
  ],
  "Landscaping / Lawn Care": [
    "landscaping company {city}",
    "lawn care {city}",
    "lawn mowing service {city}",
    "landscape design {city}",
    "yard maintenance {city}",
    "landscaper near me",
  ],
  "Pest Control": [
    "pest control {city}",
    "exterminator {city}",
    "pest removal {city}",
    "rodent control {city}",
    "termite treatment {city}",
    "pest control near me",
  ],
  "Cleaning Services": [
    "house cleaning {city}",
    "cleaning service {city}",
    "maid service {city}",
    "commercial cleaning {city}",
    "deep cleaning near me",
  ],
  "Painting": [
    "painter {city}",
    "interior painting {city}",
    "exterior painting {city}",
    "house painter near me",
    "commercial painter {city}",
  ],
  "Flooring": [
    "flooring company {city}",
    "hardwood flooring {city}",
    "flooring installation {city}",
    "tile installer {city}",
    "flooring contractor near me",
  ],
  "General Contracting": [
    "general contractor {city}",
    "home renovation {city}",
    "construction company {city}",
    "contractor near me",
    "remodeling contractor {city}",
  ],
  "Remodeling / Renovation": [
    "home remodeling {city}",
    "kitchen remodel {city}",
    "bathroom renovation {city}",
    "home renovation contractor {city}",
    "remodeling company near me",
  ],
  "Pool and Spa": [
    "pool company {city}",
    "pool installation {city}",
    "pool repair {city}",
    "spa installation {city}",
    "pool contractor near me",
  ],
  "Garage Door": [
    "garage door repair {city}",
    "garage door installation {city}",
    "garage door company {city}",
    "garage door opener repair near me",
  ],
  "Gutters": [
    "gutter installation {city}",
    "gutter cleaning {city}",
    "gutter repair {city}",
    "gutter company near me",
  ],
  "Windows and Doors": [
    "window replacement {city}",
    "door installation {city}",
    "window company {city}",
    "window contractor near me",
  ],
  "Foundation / Waterproofing": [
    "foundation repair {city}",
    "basement waterproofing {city}",
    "foundation company {city}",
    "waterproofing contractor near me",
  ],
  "Tree Service": [
    "tree service {city}",
    "tree removal {city}",
    "tree trimming {city}",
    "arborist {city}",
    "tree company near me",
  ],
  "Junk Removal": [
    "junk removal {city}",
    "junk hauling {city}",
    "debris removal {city}",
    "junk pickup near me",
  ],
  "Moving Services": [
    "moving company {city}",
    "movers {city}",
    "local movers {city}",
    "moving service near me",
  ],
  "Other Home Services": [
    "home services {city}",
    "handyman {city}",
    "home repair {city}",
    "home contractor near me",
  ],
};

// ─── Seasonal Keyword Modifiers ─────────────────────────────────────────────────────

export const SEASONAL_KEYWORD_MODIFIERS: Record<string, string[]> = {
  "spring-summer": [
    "spring cleanup",
    "summer maintenance",
    "storm damage",
  ],
  "fall-winter": [
    "winter preparation",
    "freeze protection",
    "holiday lighting",
  ],
  "weather-dependent": [
    "emergency service",
    "storm damage repair",
    "24 hour service",
  ],
};

// ─── Marketing Channel Assessments ─────────────────────────────────────────────────

export interface MarketingChannelAssessmentConfig {
  channelLabel: string;
  active: {
    assessment: string;
    recommendation: string;
  };
  inactive: {
    assessment: string;
    recommendation: string;
  };
}

export const MARKETING_CHANNEL_ASSESSMENTS: Record<string, MarketingChannelAssessmentConfig> = {
  "google-ads": {
    channelLabel: "Google Ads",
    active: {
      assessment: "Currently running Google Ads. Recommend account audit and optimization rather than new setup.",
      recommendation: "Audit existing campaigns for wasted spend, improve Quality Scores, add negative keywords, and align landing pages to ad groups.",
    },
    inactive: {
      assessment: "Not running Google Ads. High-intent search traffic opportunity.",
      recommendation: "Recommend Google Search campaigns targeting service and city keywords to capture bottom-of-funnel demand.",
    },
  },
  "lsa": {
    channelLabel: "Local Service Ads",
    active: {
      assessment: "Local Service Ads active. Review budget, lead quality, and verification status.",
      recommendation: "Audit LSA budget, review lead quality scoring, confirm Google Guarantee verification is current, and dispute invalid leads.",
    },
    inactive: {
      assessment: "Not running Local Service Ads. LSA is the highest-intent paid channel for home services.",
      recommendation: "Activate LSA immediately. It is the highest-intent paid channel for home services and offers pay-per-lead pricing with Google Guarantee badge.",
    },
  },
  "meta-ads": {
    channelLabel: "Meta Ads",
    active: {
      assessment: "Running Meta Ads. Recommend creative refresh and audience optimization.",
      recommendation: "Refresh ad creative, build lookalike audiences from customer list, and set up retargeting for website visitors.",
    },
    inactive: {
      assessment: "Not running Meta Ads. Good for brand awareness and retargeting.",
      recommendation: "Consider Meta Ads after LSA and Google Ads are established. Best used for brand awareness, seasonal promotions, and retargeting website visitors.",
    },
  },
};

// ─── Website Assessment Rules ─────────────────────────────────────────────────────────

export interface WebsiteAssessmentRule {
  severity: "critical" | "high" | "medium" | "low";
  recommendation: string;
}

export const WEBSITE_ASSESSMENT_RULES: Record<string, WebsiteAssessmentRule> = {
  noWebsite: {
    severity: "critical",
    recommendation: "Building a professional website is a critical first step. Clients cannot find or trust a business without an online presence.",
  },
  interestedInRedesign: {
    severity: "high",
    recommendation: "Current website redesign requested. A new site will improve conversion rate and SEO performance.",
  },
  oldWebsite: {
    severity: "high",
    recommendation: "Website not updated in 2 or more years. Outdated sites hurt SEO and conversion. Redesign recommended.",
  },
  noHostingAccess: {
    severity: "medium",
    recommendation: "Client does not have hosting access. Obtain access or migrate to managed hosting.",
  },
  noDomainAccess: {
    severity: "medium",
    recommendation: "Client does not have domain access. Critical for long-term control of their online presence.",
  },
};

// ────────────────────────────────────────────────────────────────────────────────
export function getSectionsForGoals(
  template: AuditTemplateConfig,
  goalIds: string[]
): AuditSectionConfig[] {
  if (!goalIds.length) return [];
  return template.sections
    .filter((section) =>
      section.goalIds.some((gId) => goalIds.includes(gId))
    )
    .sort((a, b) => a.order - b.order);
}

// ─── Normalize Section Weights ────────────────────────────────────────────────
// When only a subset of sections is active, redistribute weights proportionally.

export function normalizeSectionWeights(
  sections: AuditSectionConfig[]
): AuditSectionConfig[] {
  const totalWeight = sections.reduce((sum, s) => sum + s.weight, 0);
  if (totalWeight === 0) return sections;
  return sections.map((s) => ({
    ...s,
    weight: Math.round((s.weight / totalWeight) * 100),
  }));
}
