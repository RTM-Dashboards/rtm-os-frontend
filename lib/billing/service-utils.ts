/**
 * lib/billing/service-utils.ts
 *
 * Shared utilities for Billing service handling.
 * Used by Client Portfolio (edit path) and Active Services (display path).
 */

// ── Service name → canonical service type ─────────────────────────────────────

const KNOWN_SERVICE_TYPES: Record<string, string> = {
  "SEO / GBP": "SEO",
  "SEO": "SEO",
  "GBP": "SEO",
  "Meta Ads": "Paid Advertising",
  "Google Ads": "Paid Advertising",
  "LinkedIn Ads": "Paid Advertising",
  "Yelp Ads": "Local Ads",
  "Content Writing": "Content",
  "Email Marketing": "Content",
  "Monthly Reporting": "Reporting",
  "Website Maintenance": "Web Development",
  "Website Build": "Web Development",
  "Review Management": "SEO",
};

/**
 * Infer a service type category from a service name string.
 * Falls back to heuristic keyword matching, then "Other".
 */
export function inferServiceType(name: string): string {
  if (KNOWN_SERVICE_TYPES[name]) return KNOWN_SERVICE_TYPES[name];
  const lower = name.toLowerCase();
  if (lower.includes("seo") || lower.includes("gbp") || lower.includes("review")) return "SEO";
  if (lower.includes("ads") || lower.includes("ppc") || lower.includes("paid")) return "Paid Advertising";
  if (lower.includes("content") || lower.includes("email")) return "Content";
  if (lower.includes("web") || lower.includes("site")) return "Web Development";
  if (lower.includes("report")) return "Reporting";
  return "Other";
}

/**
 * Known service names for quick-add UI presets.
 * Ordered by frequency/importance.
 */
export const SERVICE_PRESETS: string[] = [
  "SEO / GBP",
  "Google Ads",
  "Meta Ads",
  "LinkedIn Ads",
  "Yelp Ads",
  "Content Writing",
  "Email Marketing",
  "Website Build",
  "Website Maintenance",
  "Monthly Reporting",
  "Review Management",
];
