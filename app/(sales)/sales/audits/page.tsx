"use client";

import type {
  AuditRequestStatus,
} from "@/lib/sales/types";
import {
  AUDIT_REQUEST_STATUS_LABELS,
  AUDIT_REQUEST_STATUS_COLORS,
} from "@/lib/sales/audit-config";

import React, { useState } from "react";

//
// Types
//

type FindingSeverity = "Critical" | "High" | "Medium" | "Low";
type AuditPriority = "Critical" | "High" | "Medium" | "Low";
type AuditStatus = "Not Started" | "In Progress" | "Completed" | "Needs Review" | "Pending";
type ProposalStatus = "Not Started" | "Draft" | "Sent" | "Accepted" | "In Proposal";

type AuditType =
  | "SEO Technical"
  | "GBP"
  | "PPC / Google Ads"
  | "Meta Ads"
  | "LSA"
  | "Website"
  | "Competitor";

// Finding
interface AuditFinding {
  id: string;
  title: string;
  severity: FindingSeverity;
  category: string;
  description: string;
  recommendation: string;
  revenueImpact: number;
  priority: AuditPriority;
}

// Recommended Service
interface RecommendedService {
  id: string;
  service: string;
  reason: string;
  impactScore: number;
  priority: AuditPriority;
  department: string;
  estimatedRevenue: number;
  proposalStatus: "Not Added" | "Added";
}

// Recommended Line Item
interface RecommendedLineItem {
  id: string;
  lineItem: string;
  category: string;
  department: string;
  setupFee: number;
  recurringFee: number;
  deliveryStandard: string;
  proposalStatus: "Not Added" | "Added";
}

// Competitor
interface CompetitorEntry {
  name: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  recommendedActions: string[];
}

// Timeline Event
interface TimelineEvent {
  id: string;
  date: string;
  event: string;
  type:
    | "audit_created"
    | "audit_updated"
    | "finding_added"
    | "recommendation_added"
    | "proposal_generated"
    | "status_changed";
  user: string;
  detail?: string;
}

// Main Audit Record
interface Audit {
  id: string;
  auditName: string;
  client: string;
  auditType: AuditType;
  createdBy: string;
  createdDate: string;
  priority: AuditPriority;
  status: AuditStatus;
  issuesFound: number;
  revenueOpportunity: number;
  proposalStatus: ProposalStatus;
  industry: string;
  website: string;
  summary: string;
  overallScore: number;
  findings: AuditFinding[];
  recommendedServices: RecommendedService[];
  recommendedLineItems: RecommendedLineItem[];
  competitors: CompetitorEntry[];
  timeline: TimelineEvent[];
}

//
// Mock Data — 10 Home Services Audits
//

const MOCK_AUDITS: Audit[] = [
  // 1 — SEO Technical — Summit Landscaping
  {
    id: "aud-001",
    auditName: "SEO Technical Audit — Summit Landscaping",
    client: "Summit Landscaping",
    auditType: "SEO Technical",
    createdBy: "Jordan M.",
    createdDate: "Jun 5, 2025",
    priority: "High",
    status: "Completed",
    issuesFound: 7,
    revenueOpportunity: 3200,
    proposalStatus: "Draft",
    industry: "Landscaping",
    website: "summitlandscaping.com",
    summary: "Strong site structure with critical indexing issues suppressing local rankings. Thin service pages and missing location schema identified.",
    overallScore: 74,
    findings: [
      { id: "f001-1", title: "Missing Location Schema", severity: "Critical", category: "Technical SEO", description: "No LocalBusiness schema on any service area pages — losing rich result eligibility.", recommendation: "Implement LocalBusiness schema with service area markup.", revenueImpact: 900, priority: "High" },
      { id: "f001-2", title: "Thin Service Pages", severity: "High", category: "Content", description: "Service pages average 140 words — insufficient for ranking in competitive landscaping searches.", recommendation: "Expand service pages to 700+ words with FAQ schema.", revenueImpact: 800, priority: "High" },
      { id: "f001-3", title: "Missing Canonical Tags", severity: "High", category: "Technical SEO", description: "3 pages with duplicate content have no canonical tags — keyword cannibalization risk.", recommendation: "Add canonical tags to all duplicate or near-duplicate pages.", revenueImpact: 600, priority: "High" },
      { id: "f001-4", title: "No XML Sitemap Submitted", severity: "Medium", category: "Crawlability", description: "Sitemap exists but not submitted to Google Search Console.", recommendation: "Submit sitemap in GSC and verify indexing.", revenueImpact: 400, priority: "Medium" },
      { id: "f001-5", title: "Slow Mobile Page Speed", severity: "Medium", category: "Performance", description: "Mobile PageSpeed score 48 — large uncompressed images causing LCP delay.", recommendation: "Compress images, implement lazy loading, and defer non-critical JS.", revenueImpact: 300, priority: "Medium" },
      { id: "f001-6", title: "Broken Internal Links (3)", severity: "Medium", category: "Technical SEO", description: "3 broken internal links found on services hub page.", recommendation: "Fix or redirect all broken links.", revenueImpact: 100, priority: "Low" },
      { id: "f001-7", title: "Missing Meta Descriptions", severity: "Low", category: "On-Page SEO", description: "6 pages missing unique meta descriptions reducing click-through rate.", recommendation: "Write compelling meta descriptions for all key pages.", revenueImpact: 100, priority: "Low" },
    ],
    recommendedServices: [
      { id: "rs001-1", service: "SEO Monthly Management", reason: "Ongoing content and technical optimization required to capture landscaping search demand.", impactScore: 92, priority: "High", department: "SEO", estimatedRevenue: 1200, proposalStatus: "Not Added" },
      { id: "rs001-2", service: "GBP Monthly Management", reason: "GBP optimization needed to support local ranking improvements from SEO work.", impactScore: 84, priority: "High", department: "GBP", estimatedRevenue: 500, proposalStatus: "Not Added" },
    ],
    recommendedLineItems: [
      { id: "li001-1", lineItem: "SEO Setup & Onboarding", category: "SEO", department: "SEO", setupFee: 1500, recurringFee: 0, deliveryStandard: "12 days", proposalStatus: "Not Added" },
      { id: "li001-2", lineItem: "SEO Monthly Management", category: "SEO", department: "SEO", setupFee: 0, recurringFee: 1200, deliveryStandard: "Ongoing", proposalStatus: "Not Added" },
    ],
    competitors: [],
    timeline: [
      { id: "tl-001-1", date: "Jun 5, 2025", event: "Audit Created", type: "audit_created", user: "Jordan M.", detail: "SEO Technical Audit created." },
      { id: "tl-001-2", date: "Jun 5, 2025", event: "Finding Added", type: "finding_added", user: "Jordan M.", detail: "Critical: Missing Location Schema" },
      { id: "tl-001-3", date: "Jun 5, 2025", event: "Status Changed", type: "status_changed", user: "Jordan M.", detail: "Status updated to Completed." },
    ],
  },

  // 2 — GBP — Blue Ridge Plumbing
  {
    id: "aud-002",
    auditName: "GBP Audit — Blue Ridge Plumbing",
    client: "Blue Ridge Plumbing",
    auditType: "GBP",
    createdBy: "Sarah K.",
    createdDate: "Jun 7, 2025",
    priority: "Critical",
    status: "Completed",
    issuesFound: 11,
    revenueOpportunity: 2800,
    proposalStatus: "Sent",
    industry: "Plumbing",
    website: "blueridgeplumbing.com",
    summary: "GBP profile critically underperforming. Only 18 reviews vs competitor average of 120. No posts in 4 months. Missing secondary service categories.",
    overallScore: 31,
    findings: [
      { id: "f002-1", title: "Critically Low Review Volume", severity: "Critical", category: "GBP Reviews", description: "Only 18 reviews vs competitor average of 120. Missing local pack for primary plumbing terms.", recommendation: "Launch review generation campaign targeting 80+ reviews in 90 days.", revenueImpact: 1200, priority: "Critical" },
      { id: "f002-2", title: "No GBP Posts in 4 Months", severity: "High", category: "GBP Posts", description: "GBP profile shows zero recent posts — losing engagement ranking signal.", recommendation: "Post weekly service highlights and emergency plumbing offers.", revenueImpact: 700, priority: "High" },
      { id: "f002-3", title: "Only 4 Photos Uploaded", severity: "Critical", category: "GBP Photos", description: "Competitors average 60+ photos. Low photo count reduces profile trust.", recommendation: "Upload 30+ photos of team, vehicles, and completed jobs.", revenueImpact: 500, priority: "Critical" },
      { id: "f002-4", title: "Missing Secondary Categories", severity: "High", category: "GBP Categories", description: "Only primary category set. Missing drain cleaning, water heaters, emergency plumbing.", recommendation: "Add all relevant secondary service categories.", revenueImpact: 300, priority: "High" },
      { id: "f002-5", title: "No Q&A Section", severity: "Medium", category: "GBP Q&A", description: "Zero Q&A answers. Competitors have 10–20 answered questions.", recommendation: "Seed and answer 10 high-value plumbing questions.", revenueImpact: 100, priority: "Medium" },
    ],
    recommendedServices: [
      { id: "rs002-1", service: "GBP Optimization", reason: "Profile critically underperforming — immediate intervention required.", impactScore: 97, priority: "Critical", department: "GBP", estimatedRevenue: 500, proposalStatus: "Added" },
      { id: "rs002-2", service: "Review Generation Campaign", reason: "18 reviews vs 120 competitor average — urgent gap to close.", impactScore: 95, priority: "Critical", department: "GBP", estimatedRevenue: 300, proposalStatus: "Added" },
    ],
    recommendedLineItems: [
      { id: "li002-1", lineItem: "GBP Setup & Optimization", category: "GBP", department: "GBP", setupFee: 350, recurringFee: 0, deliveryStandard: "3 days", proposalStatus: "Added" },
      { id: "li002-2", lineItem: "GBP Monthly Management", category: "GBP", department: "GBP", setupFee: 0, recurringFee: 500, deliveryStandard: "Ongoing", proposalStatus: "Added" },
    ],
    competitors: [],
    timeline: [
      { id: "tl-002-1", date: "Jun 7, 2025", event: "Audit Created", type: "audit_created", user: "Sarah K." },
      { id: "tl-002-2", date: "Jun 7, 2025", event: "Finding Added", type: "finding_added", user: "Sarah K.", detail: "Critical: Low Review Volume" },
      { id: "tl-002-3", date: "Jun 7, 2025", event: "Status Changed", type: "status_changed", user: "Sarah K.", detail: "Completed." },
      { id: "tl-002-4", date: "Jun 8, 2025", event: "Proposal Generated", type: "proposal_generated", user: "Sarah K.", detail: "Proposal sent to client." },
    ],
  },

  // 3 — PPC — Apex Roofing
  {
    id: "aud-003",
    auditName: "PPC Audit — Apex Roofing",
    client: "Apex Roofing",
    auditType: "PPC / Google Ads",
    createdBy: "Mike T.",
    createdDate: "May 30, 2025",
    priority: "Critical",
    status: "Completed",
    issuesFound: 9,
    revenueOpportunity: 4500,
    proposalStatus: "Accepted",
    industry: "Roofing",
    website: "apexroofing.com",
    summary: "PPC account running single broad match campaign with zero negative keywords. Conversion tracking firing on page view only — no true lead attribution.",
    overallScore: 28,
    findings: [
      { id: "f003-1", title: "No Negative Keyword List", severity: "Critical", category: "PPC Structure", description: "Zero negative keywords. Budget wasting on irrelevant queries like 'roof repair DIY' and 'roofing jobs'.", recommendation: "Build 250+ roofing-specific negative keyword list immediately.", revenueImpact: 1800, priority: "Critical" },
      { id: "f003-2", title: "Conversion Tracking on Page View Only", severity: "Critical", category: "PPC Tracking", description: "Only page view fires as conversion. Cannot attribute actual form submissions or calls.", recommendation: "Rebuild conversion tracking for form submissions and phone calls via GTM.", revenueImpact: 1400, priority: "Critical" },
      { id: "f003-3", title: "Homepage as Landing Page", severity: "High", category: "Landing Pages", description: "All paid traffic sent to homepage. No dedicated roofing estimate landing page.", recommendation: "Build dedicated landing pages for roof repair, replacement, and storm damage.", revenueImpact: 900, priority: "High" },
      { id: "f003-4", title: "Single Broad Match Campaign", severity: "High", category: "PPC Structure", description: "All keywords in one campaign with no intent segmentation.", recommendation: "Restructure into repair, replacement, storm, and brand campaigns.", revenueImpact: 400, priority: "High" },
    ],
    recommendedServices: [
      { id: "rs003-1", service: "PPC Campaign Rebuild", reason: "Current account structure is wasting 60%+ of ad spend.", impactScore: 98, priority: "Critical", department: "Paid Advertising", estimatedRevenue: 1500, proposalStatus: "Added" },
    ],
    recommendedLineItems: [
      { id: "li003-1", lineItem: "PPC Campaign Setup", category: "PPC", department: "Paid Advertising", setupFee: 1200, recurringFee: 0, deliveryStandard: "14 days", proposalStatus: "Added" },
      { id: "li003-2", lineItem: "PPC Monthly Management", category: "PPC", department: "Paid Advertising", setupFee: 0, recurringFee: 1500, deliveryStandard: "Ongoing", proposalStatus: "Added" },
    ],
    competitors: [],
    timeline: [
      { id: "tl-003-1", date: "May 30, 2025", event: "Audit Created", type: "audit_created", user: "Mike T." },
      { id: "tl-003-2", date: "May 31, 2025", event: "Finding Added", type: "finding_added", user: "Mike T.", detail: "Critical: No Negative Keywords" },
      { id: "tl-003-3", date: "Jun 1, 2025", event: "Status Changed", type: "status_changed", user: "Mike T.", detail: "Completed." },
      { id: "tl-003-4", date: "Jun 2, 2025", event: "Proposal Generated", type: "proposal_generated", user: "Mike T.", detail: "Proposal accepted." },
    ],
  },

  // 4 — Meta Ads — Pinnacle HVAC
  {
    id: "aud-004",
    auditName: "Meta Ads Audit — Pinnacle HVAC",
    client: "Pinnacle HVAC",
    auditType: "Meta Ads",
    createdBy: "Sarah K.",
    createdDate: "Jun 1, 2025",
    priority: "High",
    status: "In Progress",
    issuesFound: 6,
    revenueOpportunity: 3100,
    proposalStatus: "Not Started",
    industry: "HVAC",
    website: "pinnaclehvac.com",
    summary: "No Meta Ads presence while 3 local HVAC competitors run active seasonal campaigns. Pixel installed but no events configured. Untapped retargeting audience.",
    overallScore: 42,
    findings: [
      { id: "f004-1", title: "No Active Meta Campaigns", severity: "Critical", category: "Meta Ads", description: "Zero Meta campaigns while 3 competitors run active seasonal HVAC campaigns.", recommendation: "Launch retargeting and seasonal offer campaigns for cooling season.", revenueImpact: 1400, priority: "Critical" },
      { id: "f004-2", title: "Pixel Installed — No Events", severity: "High", category: "Meta Tracking", description: "Meta Pixel present but zero custom events firing.", recommendation: "Configure Lead, Contact, and Quote Request events.", revenueImpact: 800, priority: "High" },
      { id: "f004-3", title: "No Custom Audiences Built", severity: "High", category: "Meta Audiences", description: "No website visitor or customer lookalike audiences created.", recommendation: "Build website visitor, quote-requester, and 1% lookalike audiences.", revenueImpact: 600, priority: "High" },
      { id: "f004-4", title: "No Seasonal Campaign Calendar", severity: "Medium", category: "Meta Strategy", description: "No seasonal strategy for cooling vs heating demand shifts.", recommendation: "Build seasonal campaign calendar aligned with HVAC demand peaks.", revenueImpact: 300, priority: "Medium" },
    ],
    recommendedServices: [
      { id: "rs004-1", service: "Meta Ads Setup & Launch", reason: "3 competitors running visual campaigns — immediate opportunity gap.", impactScore: 94, priority: "High", department: "Paid Advertising", estimatedRevenue: 900, proposalStatus: "Not Added" },
      { id: "rs004-2", service: "Meta Ads Monthly Management", reason: "Ongoing seasonal creative rotation required for HVAC demand cycles.", impactScore: 88, priority: "High", department: "Paid Advertising", estimatedRevenue: 1200, proposalStatus: "Not Added" },
    ],
    recommendedLineItems: [
      { id: "li004-1", lineItem: "Meta Ads Account Setup", category: "Meta Ads", department: "Paid Advertising", setupFee: 900, recurringFee: 0, deliveryStandard: "10 days", proposalStatus: "Not Added" },
      { id: "li004-2", lineItem: "Meta Ads Monthly Management", category: "Meta Ads", department: "Paid Advertising", setupFee: 0, recurringFee: 1200, deliveryStandard: "Ongoing", proposalStatus: "Not Added" },
    ],
    competitors: [],
    timeline: [
      { id: "tl-004-1", date: "Jun 1, 2025", event: "Audit Created", type: "audit_created", user: "Sarah K." },
      { id: "tl-004-2", date: "Jun 1, 2025", event: "Finding Added", type: "finding_added", user: "Sarah K.", detail: "Critical: No Active Meta Campaigns" },
    ],
  },

  // 5 — Website — Morrison HVAC
  {
    id: "aud-005",
    auditName: "Website Audit — Morrison HVAC and Cooling",
    client: "Morrison HVAC and Cooling",
    auditType: "Website",
    createdBy: "Alex R.",
    createdDate: "May 18, 2025",
    priority: "Critical",
    status: "Completed",
    issuesFound: 14,
    revenueOpportunity: 6800,
    proposalStatus: "Accepted",
    industry: "HVAC",
    website: "morrisonhvac.com",
    summary: "Severe website performance failures. PageSpeed 18 mobile. Autoplay video causing 7.2s LCP. 14 broken links from previous site migration. Site rebuild required.",
    overallScore: 19,
    findings: [
      { id: "f005-1", title: "PageSpeed 18/100 Mobile", severity: "Critical", category: "Performance", description: "Autoplay background video causing LCP of 7.2s. Uncompressed images loading above fold.", recommendation: "Remove autoplay video, compress images, defer non-critical JS, implement lazy loading.", revenueImpact: 2800, priority: "Critical" },
      { id: "f005-2", title: "14 Broken Internal Links", severity: "Critical", category: "Technical", description: "14 broken links across service and contact pages from site migration.", recommendation: "Implement 301 redirects for all broken URLs immediately.", revenueImpact: 1400, priority: "Critical" },
      { id: "f005-3", title: "Not Mobile Responsive", severity: "Critical", category: "Mobile UX", description: "Tap targets too small, content overflows on mobile. 72% of traffic is mobile.", recommendation: "Full mobile responsive redesign required.", revenueImpact: 1800, priority: "Critical" },
      { id: "f005-4", title: "No HTTPS on Subpages", severity: "Critical", category: "Security", description: "Mixed content warnings on 8 service pages — SSL not applied uniformly.", recommendation: "Force HTTPS sitewide and resolve all mixed content warnings.", revenueImpact: 800, priority: "Critical" },
    ],
    recommendedServices: [
      { id: "rs005-1", service: "Website Redesign", reason: "Site requires complete rebuild — performance issues are beyond incremental repair.", impactScore: 99, priority: "Critical", department: "Web", estimatedRevenue: 5000, proposalStatus: "Added" },
    ],
    recommendedLineItems: [
      { id: "li005-1", lineItem: "Website Redesign", category: "Web", department: "Web", setupFee: 5000, recurringFee: 0, deliveryStandard: "60 days", proposalStatus: "Added" },
      { id: "li005-2", lineItem: "Website Maintenance (Monthly)", category: "Web", department: "Web", setupFee: 0, recurringFee: 250, deliveryStandard: "Ongoing", proposalStatus: "Added" },
    ],
    competitors: [],
    timeline: [
      { id: "tl-005-1", date: "May 18, 2025", event: "Audit Created", type: "audit_created", user: "Alex R." },
      { id: "tl-005-2", date: "May 19, 2025", event: "Finding Added", type: "finding_added", user: "Alex R.", detail: "Critical: PageSpeed 18 Mobile" },
      { id: "tl-005-3", date: "May 20, 2025", event: "Status Changed", type: "status_changed", user: "Alex R.", detail: "Completed." },
      { id: "tl-005-4", date: "May 22, 2025", event: "Proposal Generated", type: "proposal_generated", user: "Alex R.", detail: "Proposal accepted." },
    ],
  },

  // 6 — LSA — Coastal Plumbing
  {
    id: "aud-006",
    auditName: "LSA Audit — Coastal Plumbing Co.",
    client: "Coastal Plumbing Co.",
    auditType: "LSA",
    createdBy: "Jordan M.",
    createdDate: "Jun 3, 2025",
    priority: "High",
    status: "Completed",
    issuesFound: 5,
    revenueOpportunity: 2400,
    proposalStatus: "Draft",
    industry: "Plumbing",
    website: "coastalplumbingco.com",
    summary: "LSA account not verified. License and insurance credentials missing from profile. Missing out on guaranteed top-of-page placement for emergency plumbing searches.",
    overallScore: 38,
    findings: [
      { id: "f006-1", title: "LSA Account Not Verified", severity: "Critical", category: "LSA Verification", description: "Account created but verification not completed. No ads running.", recommendation: "Complete LSA verification: license upload, insurance proof, background check.", revenueImpact: 1200, priority: "Critical" },
      { id: "f006-2", title: "Missing License Credentials", severity: "High", category: "LSA Compliance", description: "Plumbing license number not uploaded to LSA profile.", recommendation: "Upload current state plumbing license to LSA profile.", revenueImpact: 600, priority: "High" },
      { id: "f006-3", title: "No Review Strategy for LSA", severity: "High", category: "LSA Reviews", description: "LSA ranking heavily influenced by Google review score. Currently 3.9 avg.", recommendation: "Launch post-service review campaign to improve average rating.", revenueImpact: 400, priority: "High" },
      { id: "f006-4", title: "Service Area Too Broad", severity: "Medium", category: "LSA Targeting", description: "Service area set to entire county — wasting budget on areas outside service radius.", recommendation: "Restrict service area to 15-mile radius around primary location.", revenueImpact: 200, priority: "Medium" },
    ],
    recommendedServices: [
      { id: "rs006-1", service: "LSA Account Setup & Management", reason: "Verified LSA account will capture top-of-page emergency plumbing searches immediately.", impactScore: 96, priority: "Critical", department: "LSA", estimatedRevenue: 800, proposalStatus: "Not Added" },
    ],
    recommendedLineItems: [
      { id: "li006-1", lineItem: "LSA Account Setup", category: "LSA", department: "LSA", setupFee: 600, recurringFee: 0, deliveryStandard: "5 days", proposalStatus: "Not Added" },
      { id: "li006-2", lineItem: "LSA Monthly Management", category: "LSA", department: "LSA", setupFee: 0, recurringFee: 800, deliveryStandard: "Ongoing", proposalStatus: "Not Added" },
    ],
    competitors: [],
    timeline: [
      { id: "tl-006-1", date: "Jun 3, 2025", event: "Audit Created", type: "audit_created", user: "Jordan M." },
      { id: "tl-006-2", date: "Jun 3, 2025", event: "Finding Added", type: "finding_added", user: "Jordan M.", detail: "Critical: LSA Account Not Verified" },
      { id: "tl-006-3", date: "Jun 4, 2025", event: "Status Changed", type: "status_changed", user: "Jordan M.", detail: "Completed." },
    ],
  },

  // 7 — GBP — GreenWave Lawn Care
  {
    id: "aud-007",
    auditName: "GBP Audit — GreenWave Lawn Care",
    client: "GreenWave Lawn Care",
    auditType: "GBP",
    createdBy: "Mike T.",
    createdDate: "Jun 8, 2025",
    priority: "High",
    status: "Pending",
    issuesFound: 8,
    revenueOpportunity: 2100,
    proposalStatus: "Not Started",
    industry: "Landscaping",
    website: "greenwavelawn.com",
    summary: "GBP profile exists but lacks photos, posts, and secondary categories. 22 reviews at 4.1 average — below threshold for local pack visibility in competitive lawn care market.",
    overallScore: 41,
    findings: [
      { id: "f007-1", title: "Low Review Volume for Market", severity: "High", category: "GBP Reviews", description: "22 reviews vs competitor average of 85. Losing local pack to review-rich competitors.", recommendation: "Launch post-service review automation targeting 60+ reviews in 60 days.", revenueImpact: 900, priority: "High" },
      { id: "f007-2", title: "Zero GBP Posts", severity: "High", category: "GBP Posts", description: "No posts in the past 3 months — missing seasonal engagement signal for spring/summer.", recommendation: "Post weekly lawn care tips and seasonal offers starting immediately.", revenueImpact: 500, priority: "High" },
      { id: "f007-3", title: "Only 8 Photos", severity: "High", category: "GBP Photos", description: "Competitors average 45+ photos. Low photo count reduces trust and click rate.", recommendation: "Upload 30+ before/after lawn care photos.", revenueImpact: 400, priority: "High" },
      { id: "f007-4", title: "Missing Service Categories", severity: "Medium", category: "GBP Categories", description: "Only primary Lawn Care category set. Missing mulching, aeration, irrigation.", recommendation: "Add all secondary service categories relevant to offerings.", revenueImpact: 300, priority: "Medium" },
    ],
    recommendedServices: [
      { id: "rs007-1", service: "GBP Monthly Management", reason: "Ongoing posting, review management, and optimization required to compete.", impactScore: 90, priority: "High", department: "GBP", estimatedRevenue: 500, proposalStatus: "Not Added" },
    ],
    recommendedLineItems: [
      { id: "li007-1", lineItem: "GBP Setup & Optimization", category: "GBP", department: "GBP", setupFee: 350, recurringFee: 0, deliveryStandard: "3 days", proposalStatus: "Not Added" },
      { id: "li007-2", lineItem: "GBP Monthly Management", category: "GBP", department: "GBP", setupFee: 0, recurringFee: 500, deliveryStandard: "Ongoing", proposalStatus: "Not Added" },
    ],
    competitors: [],
    timeline: [
      { id: "tl-007-1", date: "Jun 8, 2025", event: "Audit Created", type: "audit_created", user: "Mike T." },
    ],
  },

  // 8 — Competitor — Summit Landscaping
  {
    id: "aud-008",
    auditName: "Competitor Audit — Summit Landscaping",
    client: "Summit Landscaping",
    auditType: "Competitor",
    createdBy: "Jordan M.",
    createdDate: "May 24, 2025",
    priority: "Medium",
    status: "Completed",
    issuesFound: 4,
    revenueOpportunity: 1800,
    proposalStatus: "Draft",
    industry: "Landscaping",
    website: "summitlandscaping.com",
    summary: "3 local competitors outranking client for 180+ keywords. Top competitor running seasonal PPC during spring/summer. Client has strong review count advantage not being leveraged.",
    overallScore: 58,
    findings: [
      { id: "f008-1", title: "180+ Competitor Keyword Gaps", severity: "High", category: "Keyword Strategy", description: "Competitors rank for 180 keywords where client has zero presence.", recommendation: "Build targeted content strategy to capture top 40 gap opportunities.", revenueImpact: 900, priority: "High" },
      { id: "f008-2", title: "Competitor PPC Dominance in Spring", severity: "High", category: "Competitive PPC", description: "Top 2 competitors run aggressive spring/summer PPC. Client missing peak season revenue.", recommendation: "Launch seasonal PPC for spring landscape installation and lawn care.", revenueImpact: 600, priority: "High" },
      { id: "f008-3", title: "Untapped Review Advantage", severity: "Medium", category: "GBP", description: "Client has 78 reviews — higher than competitors — but not highlighted in marketing.", recommendation: "Feature review count and rating prominently in ad copy and website.", revenueImpact: 200, priority: "Medium" },
      { id: "f008-4", title: "Competitor Blog Outpacing Content", severity: "Medium", category: "Content", description: "Top competitor publishes 4 seasonal articles/month. Client has no blog.", recommendation: "Launch monthly content calendar targeting seasonal landscaping searches.", revenueImpact: 100, priority: "Low" },
    ],
    recommendedServices: [
      { id: "rs008-1", service: "SEO Monthly Management", reason: "180+ keyword gaps require structured content strategy to compete.", impactScore: 91, priority: "High", department: "SEO", estimatedRevenue: 1200, proposalStatus: "Not Added" },
      { id: "rs008-2", service: "PPC Campaign Setup", reason: "Missing peak-season paid presence vs 2 active competitors.", impactScore: 86, priority: "High", department: "Paid Advertising", estimatedRevenue: 1200, proposalStatus: "Not Added" },
    ],
    recommendedLineItems: [
      { id: "li008-1", lineItem: "SEO Monthly Management", category: "SEO", department: "SEO", setupFee: 0, recurringFee: 1200, deliveryStandard: "Ongoing", proposalStatus: "Not Added" },
    ],
    competitors: [
      {
        name: "Austin Pro Landscapes",
        strengths: ["Top 3 for all major landscaping terms", "Active PPC", "148 Google reviews", "4.7 avg rating"],
        weaknesses: ["No blog content", "Weak GBP posting cadence"],
        opportunities: ["Irrigation and drainage specialty — competitor ignores it"],
        threats: ["Established local brand — 12 years in market"],
        recommendedActions: ["Target irrigation and drainage specialty keywords", "Build seasonal content calendar competitor lacks"],
      },
      {
        name: "Green Thumb Austin",
        strengths: ["Strong seasonal PPC", "Great before/after Instagram presence"],
        weaknesses: ["Low review volume (32 reviews)", "Poor website design"],
        opportunities: ["Review generation will outpace them quickly"],
        threats: ["Active in peak-season paid advertising"],
        recommendedActions: ["Leverage review advantage in ad copy", "Match and beat their PPC spend during spring season"],
      },
    ],
    timeline: [
      { id: "tl-008-1", date: "May 24, 2025", event: "Audit Created", type: "audit_created", user: "Jordan M." },
      { id: "tl-008-2", date: "May 26, 2025", event: "Status Changed", type: "status_changed", user: "Jordan M.", detail: "Completed." },
    ],
  },

  // 9 — SEO Technical — Morrison HVAC
  {
    id: "aud-009",
    auditName: "SEO Technical Audit — Morrison HVAC and Cooling",
    client: "Morrison HVAC and Cooling",
    auditType: "SEO Technical",
    createdBy: "Sarah K.",
    createdDate: "Jun 2, 2025",
    priority: "High",
    status: "Completed",
    issuesFound: 6,
    revenueOpportunity: 2900,
    proposalStatus: "Draft",
    industry: "HVAC",
    website: "morrisonhvac.com",
    summary: "Site crawl reveals orphaned service pages, missing GSC submission, and zero structured data. Internal linking strategy is absent causing ranking dilution.",
    overallScore: 44,
    findings: [
      { id: "f009-1", title: "Orphaned Service Pages", severity: "Critical", category: "Internal Linking", description: "4 service pages have zero internal links — invisible to both users and crawlers.", recommendation: "Add contextual internal links from hub pages and sitemap to all orphaned pages.", revenueImpact: 1100, priority: "Critical" },
      { id: "f009-2", title: "GSC Not Connected", severity: "High", category: "Crawlability", description: "Google Search Console not connected — zero crawl data or error reporting.", recommendation: "Connect GSC immediately and submit sitemap.", revenueImpact: 700, priority: "High" },
      { id: "f009-3", title: "No Structured Data", severity: "High", category: "Technical SEO", description: "Zero schema markup on any page. Missing HVAC service, LocalBusiness, and FAQ schema.", recommendation: "Implement LocalBusiness, Service, and FAQ schema on priority pages.", revenueImpact: 600, priority: "High" },
      { id: "f009-4", title: "Duplicate Title Tags", severity: "Medium", category: "On-Page SEO", description: "5 pages share identical title tags — causing keyword cannibalization.", recommendation: "Write unique, keyword-targeted title tags for every page.", revenueImpact: 300, priority: "Medium" },
      { id: "f009-5", title: "No Mobile-First Indexing Prep", severity: "Medium", category: "Performance", description: "Page lacks viewport meta tag on 2 pages — mobile rendering issues.", recommendation: "Ensure all pages have proper viewport meta tag and mobile styles.", revenueImpact: 200, priority: "Medium" },
    ],
    recommendedServices: [
      { id: "rs009-1", service: "SEO Monthly Management", reason: "Multiple technical gaps need structured ongoing remediation.", impactScore: 93, priority: "High", department: "SEO", estimatedRevenue: 1200, proposalStatus: "Not Added" },
    ],
    recommendedLineItems: [
      { id: "li009-1", lineItem: "SEO Setup & Onboarding", category: "SEO", department: "SEO", setupFee: 1500, recurringFee: 0, deliveryStandard: "12 days", proposalStatus: "Not Added" },
      { id: "li009-2", lineItem: "SEO Monthly Management", category: "SEO", department: "SEO", setupFee: 0, recurringFee: 1200, deliveryStandard: "Ongoing", proposalStatus: "Not Added" },
    ],
    competitors: [],
    timeline: [
      { id: "tl-009-1", date: "Jun 2, 2025", event: "Audit Created", type: "audit_created", user: "Sarah K." },
      { id: "tl-009-2", date: "Jun 3, 2025", event: "Finding Added", type: "finding_added", user: "Sarah K.", detail: "Critical: Orphaned Service Pages" },
      { id: "tl-009-3", date: "Jun 3, 2025", event: "Status Changed", type: "status_changed", user: "Sarah K.", detail: "Completed." },
    ],
  },

  // 10 — PPC — Apex Roofing (second)
  {
    id: "aud-010",
    auditName: "PPC Audit — Apex Roofing (Storm Campaign)",
    client: "Apex Roofing",
    auditType: "PPC / Google Ads",
    createdBy: "Mike T.",
    createdDate: "Jun 5, 2025",
    priority: "High",
    status: "Needs Review",
    issuesFound: 5,
    revenueOpportunity: 3000,
    proposalStatus: "Not Started",
    industry: "Roofing",
    website: "apexroofing.com",
    summary: "Storm damage campaign launched post-hail event with poor targeting and no dedicated landing page. Cost per click 2.4x industry average for roofing. Campaign structure review needed.",
    overallScore: 47,
    findings: [
      { id: "f010-1", title: "Storm Campaign CPC 2.4x Average", severity: "Critical", category: "PPC Performance", description: "Storm damage campaign paying $34 CPC vs $14 industry average for roofing — structural issue.", recommendation: "Restructure ad groups with tighter keyword grouping and match type control.", revenueImpact: 1400, priority: "Critical" },
      { id: "f010-2", title: "No Storm Damage Landing Page", severity: "High", category: "Landing Pages", description: "All storm campaign traffic directed to general roofing page — Quality Score penalty.", recommendation: "Build dedicated storm damage estimate landing page matching ad copy.", revenueImpact: 900, priority: "High" },
      { id: "f010-3", title: "Geographic Targeting Too Broad", severity: "High", category: "PPC Targeting", description: "Campaign targeting 50-mile radius — including areas outside company service zone.", recommendation: "Restrict targeting to zip codes within confirmed service area.", revenueImpact: 500, priority: "High" },
      { id: "f010-4", title: "Ad Schedule Not Set", severity: "Medium", category: "PPC Optimization", description: "Ads running 24/7 including overnight hours when roofing office is closed.", recommendation: "Set ad schedule to business hours + 2 hours on either side.", revenueImpact: 200, priority: "Medium" },
    ],
    recommendedServices: [
      { id: "rs010-1", service: "PPC Campaign Optimization", reason: "CPC 2.4x average is causing significant wasted spend on storm campaign.", impactScore: 94, priority: "Critical", department: "Paid Advertising", estimatedRevenue: 1500, proposalStatus: "Not Added" },
    ],
    recommendedLineItems: [
      { id: "li010-1", lineItem: "PPC Monthly Management", category: "PPC", department: "Paid Advertising", setupFee: 0, recurringFee: 1500, deliveryStandard: "Ongoing", proposalStatus: "Not Added" },
    ],
    competitors: [],
    timeline: [
      { id: "tl-010-1", date: "Jun 5, 2025", event: "Audit Created", type: "audit_created", user: "Mike T." },
      { id: "tl-010-2", date: "Jun 7, 2025", event: "Status Changed", type: "status_changed", user: "Mike T.", detail: "Needs Review — awaiting campaign performance data." },
    ],
  },
];

//
// Color Helpers
//

const SEVERITY_COLORS: Record<FindingSeverity, { bg?: string; text: string; border: string }> = {
  Critical: { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
  High:     { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  Medium:   { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" },
  Low:      { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
};

const PRIORITY_COLORS: Record<AuditPriority, { bg?: string; text: string; border: string }> = {
  Critical: { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
  High:     { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  Medium:   { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" },
  Low:      { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
};

const AUDIT_STATUS_COLORS: Record<AuditStatus, { bg?: string; text: string; border: string }> = {
  "Not Started":  { bg: "#F3F4F6", text: "#6B7280", border: "#D1D5DB" },
  "Pending":      { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  "In Progress":  { bg: "#F0F9FF", text: "#0369A1", border: "#BAE6FD" },
  "Completed":    { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  "Needs Review": { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
};

const PROPOSAL_STATUS_COLORS: Record<ProposalStatus, { bg?: string; text: string; border: string }> = {
  "Not Started": { bg: "#F3F4F6", text: "#6B7280", border: "#D1D5DB" },
  "Draft":       { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" },
  "Sent":        { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  "Accepted":    { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  "In Proposal": { bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE" },
};

const AUDIT_TYPE_META: Record<AuditType, { color?: string; bg?: string; border: string }> = {
  "SEO Technical":  { color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
  "GBP":            { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  "PPC / Google Ads": { color: "#C2410C", bg: "#FFF7ED", border: "#FED7AA" },
  "Meta Ads":       { color: "#1877F2", bg: "#EFF6FF", border: "#BFDBFE" },
  "LSA":            { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
  "Website":        { color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  "Competitor":     { color: "#6D28D9", bg: "#F5F3FF", border: "#DDD6FE" },
};

const TIMELINE_META: Record<TimelineEvent["type"], { color?: string }> = {
  audit_created:        { color: "#1D4ED8" },
  audit_updated:        { color: "#D97706" },
  finding_added:        { color: "#DC2626" },
  recommendation_added: { color: "#7C3AED" },
  proposal_generated:   { color: "#059669" },
  status_changed:       { color: "#6B7280" },
};

function scoreColor(score: number): string {
  if (score >= 80) return "#15803D";
  if (score >= 60) return "#D97706";
  if (score >= 40) return "#EA580C";
  return "#DC2626";
}
function scoreBg(score: number): string {
  if (score >= 80) return "#F0FDF4";
  if (score >= 60) return "#FFFBEB";
  if (score >= 40) return "#FFF7ED";
  return "#FEF2F2";
}

//
// Shared UI Components
//

function Badge({
  label,
  bg,
  text,
  border,
}: {
  label: string;
  bg?: string;
  text: string;
  border?: string;
}) {
  return (
    <span
      className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap"
      style={{ background: bg, color: text, borderColor: border ?? "transparent" }}
    >
      {label}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: FindingSeverity }) {
  const c = SEVERITY_COLORS[severity];
  return <Badge label={severity} bg={c.bg} text={c.text} border={c.border} />;
}

function PriorityBadge({ priority }: { priority: AuditPriority }) {
  const c = PRIORITY_COLORS[priority];
  return <Badge label={priority} bg={c.bg} text={c.text} border={c.border} />;
}

function AuditStatusBadge({ status }: { status: AuditStatus }) {
  const c = AUDIT_STATUS_COLORS[status];
  return <Badge label={status} bg={c.bg} text={c.text} border={c.border} />;
}

function ProposalStatusBadge({ status }: { status: ProposalStatus }) {
  const c = PROPOSAL_STATUS_COLORS[status];
  return <Badge label={status} bg={c.bg} text={c.text} border={c.border} />;
}

function AuditTypeBadge({ type }: { type: AuditType }) {
  const m = AUDIT_TYPE_META[type];
  return (
    <span
      className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap"
      style={{ background: m.bg, color: m.color, borderColor: m.border }}
    >
      {type}
    </span>
  );
}

function ScoreRing({ score, size = 48 }: { score: number; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-black border-4 flex-shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size < 44 ? 11 : 14,
        background: scoreBg(score),
        borderColor: scoreColor(score),
        color: scoreColor(score),
        boxShadow: `0 0 0 2px ${scoreBg(score)}`,
      }}
    >
      {score}
    </div>
  );
}

//
// KPI Cards
//

function KPICards({ audits }: { audits: Audit[] }) {
  const total = audits.length;
  const pending = audits.filter((a) => a.status === "Pending" || a.status === "Not Started").length;
  const completed = audits.filter((a) => a.status === "Completed").length;
  const highPriorityFindings = audits.reduce(
    (sum, a) => sum + a.findings.filter((f) => f.severity === "Critical" || f.severity === "High").length,
    0
  );
  const estimatedRevenue = audits.reduce((sum, a) => sum + a.revenueOpportunity, 0);

  const cards = [
    { label: "Total Audits",          value: total,                            color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
    { label: "Pending Audits",         value: pending,                          color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
    { label: "Completed Audits",       value: completed,                        color: "#15803D", bg: "#F0FDF4", border: "#BBF7D0" },
    { label: "High Priority Findings", value: highPriorityFindings,             color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
    { label: "Revenue Opportunity",    value: `$${estimatedRevenue.toLocaleString()}`, color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-xl border p-5 text-center"
          style={{ background: c.bg, borderColor: c.border }}
        >
          <div className="text-2xl font-black" style={{ color: c.color }}>
            {c.value}
          </div>
          <div
            className="text-[10px] font-semibold mt-1 leading-tight"
            style={{ color: c.color }}
          >
            {c.label}
          </div>
        </div>
      ))}
    </div>
  );
}

//
// Audit Table
//

function AuditTable({
  audits,
  onSelect,
}: {
  audits: Audit[];
  onSelect: (a: Audit) => void;
}) {
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: "var(--rtm-border)" }}
    >
      <div className="overflow-x-auto">
        <table
          className="w-full text-sm"
          style={{ borderCollapse: "collapse", minWidth: 1200 }}
        >
          <thead>
            <tr
              style={{
                background: "var(--rtm-surface)",
                borderBottom: "1px solid var(--rtm-border)",
              }}
            >
              {[
                "Audit Name",
                "Client",
                "Audit Type",
                "Created By",
                "Created Date",
                "Priority",
                "Status",
                "Issues Found",
                "Revenue Opportunity",
                "Proposal Status",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
                  style={{ color: "var(--rtm-text-muted)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {audits.map((a, i) => (
              <tr
                key={a.id}
                className="cursor-pointer transition-colors"
                style={{
                  borderBottom: "1px solid var(--rtm-border-light)",
                  background: i % 2 === 0 ? "var(--rtm-bg)" : "var(--rtm-surface)",
                }}
                onClick={() => onSelect(a)}
              >
                <td className="px-4 py-3">
                  <p className="font-semibold text-xs" style={{ color: "var(--rtm-text-primary)" }}>
                    {a.auditName}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-xs" style={{ color: "var(--rtm-text-primary)" }}>
                    {a.client}
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>
                    {a.industry}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <AuditTypeBadge type={a.auditType} />
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                  {a.createdBy}
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                  {a.createdDate}
                </td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={a.priority} />
                </td>
                <td className="px-4 py-3">
                  <AuditStatusBadge status={a.status} />
                </td>
                <td className="px-4 py-3">
                  {a.issuesFound > 0 ? (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "#FEF2F2", color: "#DC2626" }}
                    >
                      {a.issuesFound}
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: "#15803D" }}>
                      None
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-bold" style={{ color: "#059669" }}>
                    ${a.revenueOpportunity.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ProposalStatusBadge status={a.proposalStatus} />
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onSelect(a)}
                    className="text-xs px-3 py-1.5 rounded-lg font-semibold border"
                    style={{
                      background: "#EFF6FF",
                      color: "#1D4ED8",
                      borderColor: "#BFDBFE",
                    }}
                  >
                    View Audit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

//
// Drawer Tabs
//

type DrawerTab =
  | "overview"
  | "findings"
  | "ai-recommendations"
  | "recommended-services"
  | "recommended-line-items"
  | "competitor-analysis"
  | "activity-timeline";

// Overview Tab
function OverviewTab({ audit }: { audit: Audit }) {
  const criticalFindings = audit.findings.filter((f) => f.severity === "Critical").length;
  const highFindings = audit.findings.filter((f) => f.severity === "High").length;

  return (
    <div className="space-y-5">
      {/* Audit type + score */}
      <div className="flex items-start gap-4">
        <ScoreRing score={audit.overallScore} size={72} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <AuditTypeBadge type={audit.auditType} />
            <AuditStatusBadge status={audit.status} />
            <ProposalStatusBadge status={audit.proposalStatus} />
          </div>
          <p className="text-sm font-bold mb-1" style={{ color: "var(--rtm-text-primary)" }}>
            {audit.auditName}
          </p>
          <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
            {audit.summary}
          </p>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Issues Found",        value: audit.issuesFound,                           color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
          { label: "Critical Findings",   value: criticalFindings,                            color: "#BE123C", bg: "#FFF1F2", border: "#FECDD3" },
          { label: "High Findings",       value: highFindings,                                color: "#C2410C", bg: "#FFF7ED", border: "#FED7AA" },
          { label: "Revenue Opportunity", value: `$${audit.revenueOpportunity.toLocaleString()}`, color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-xl border p-4 text-center"
            style={{ background: c.bg, borderColor: c.border }}
          >
            <div className="text-xl font-black" style={{ color: c.color }}>
              {c.value}
            </div>
            <div className="text-[10px] font-semibold mt-0.5" style={{ color: c.color }}>
              {c.label}
            </div>
          </div>
        ))}
      </div>

      {/* Audit details */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Client",          value: audit.client },
          { label: "Industry",        value: audit.industry },
          { label: "Website",         value: audit.website },
          { label: "Audit Type",      value: audit.auditType },
          { label: "Created By",      value: audit.createdBy },
          { label: "Created Date",    value: audit.createdDate },
          { label: "Priority",        value: audit.priority },
          { label: "Proposal Status", value: audit.proposalStatus },
        ].map((row) => (
          <div
            key={row.label}
            className="rounded-lg border p-3"
            style={{
              background: "var(--rtm-surface)",
              borderColor: "var(--rtm-border)",
            }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-wide mb-0.5"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              {row.label}
            </p>
            <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
              {row.value}
            </p>
          </div>
        ))}
      </div>

      {/* AI Executive Summary */}
      <div
        className="rounded-xl border p-5"
        style={{ background: "#F5F3FF", borderColor: "#DDD6FE" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <p className="text-sm font-bold" style={{ color: "#6D28D9" }}>
            AI Executive Summary
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs" style={{ color: "#4C1D95" }}>
          <div>
            <p className="font-bold mb-1 text-[10px] uppercase tracking-wide">Top Findings</p>
            {audit.findings.slice(0, 3).map((f) => (
              <p key={f.id} className="mb-0.5">• {f.title}</p>
            ))}
          </div>
          <div>
            <p className="font-bold mb-1 text-[10px] uppercase tracking-wide">Business Risks</p>
            {audit.findings
              .filter((f) => f.severity === "Critical")
              .slice(0, 3)
              .map((f) => (
                <p key={f.id} className="mb-0.5">• {f.description.slice(0, 65)}…</p>
              ))}
          </div>
          <div>
            <p className="font-bold mb-1 text-[10px] uppercase tracking-wide">Recommended Package</p>
            {audit.recommendedServices.slice(0, 3).map((s) => (
              <p key={s.id} className="mb-0.5">• {s.service}</p>
            ))}
          </div>
          <div>
            <p className="font-bold mb-1 text-[10px] uppercase tracking-wide">Estimated Revenue Opportunity</p>
            <p className="text-lg font-black" style={{ color: "#6D28D9" }}>
              ${audit.revenueOpportunity.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Findings Tab
function FindingsTab({ audit }: { audit: Audit }) {
  const critical = audit.findings.filter((f) => f.severity === "Critical");
  const high = audit.findings.filter((f) => f.severity === "High");
  const medium = audit.findings.filter((f) => f.severity === "Medium");
  const low = audit.findings.filter((f) => f.severity === "Low");

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Critical", value: critical.length, c: SEVERITY_COLORS.Critical },
          { label: "High",     value: high.length,     c: SEVERITY_COLORS.High },
          { label: "Medium",   value: medium.length,   c: SEVERITY_COLORS.Medium },
          { label: "Low",      value: low.length,      c: SEVERITY_COLORS.Low },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border p-4 text-center"
            style={{ background: card.c.bg, borderColor: card.c.border }}
          >
            <div className="text-2xl font-black" style={{ color: card.c.text }}>
              {card.value}
            </div>
            <div className="text-[10px] font-semibold mt-0.5" style={{ color: card.c.text }}>
              {card.label} Findings
            </div>
          </div>
        ))}
      </div>

      {audit.findings.length === 0 ? (
        <div
          className="rounded-xl border p-10 text-center"
          style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}
        >
          <p className="text-sm font-semibold" style={{ color: "#15803D" }}>
            No findings recorded for this audit.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {audit.findings.map((f) => {
            const c = SEVERITY_COLORS[f.severity];
            return (
              <div
                key={f.id}
                className="rounded-xl border overflow-hidden"
                style={{ borderColor: c.border }}
              >
                <div
                  className="px-4 py-3 flex items-center gap-3"
                  style={{
                    background: c.bg,
                    borderBottom: `1px solid ${c.border}`,
                  }}
                >
                  <SeverityBadge severity={f.severity} />
                  <PriorityBadge priority={f.priority} />
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: "#EFF6FF",
                      color: "#1D4ED8",
                      border: "1px solid #BFDBFE",
                    }}
                  >
                    {f.category}
                  </span>
                  <p className="font-bold text-sm flex-1" style={{ color: "var(--rtm-text-primary)" }}>
                    {f.title}
                  </p>
                  {f.revenueImpact > 0 && (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: "#ECFDF5",
                        color: "#059669",
                        border: "1px solid #A7F3D0",
                      }}
                    >
                      ${f.revenueImpact.toLocaleString()} opportunity
                    </span>
                  )}
                </div>
                <div
                  className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
                  style={{ background: "var(--rtm-bg)" }}
                >
                  <div>
                    <p
                      className="text-[10px] font-bold uppercase tracking-wide mb-1"
                      style={{ color: "var(--rtm-text-muted)" }}
                    >
                      Issue
                    </p>
                    <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                      {f.description}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-[10px] font-bold uppercase tracking-wide mb-1"
                      style={{ color: "var(--rtm-text-muted)" }}
                    >
                      Recommendation
                    </p>
                    <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                      {f.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// AI Recommendations Tab
function AIRecommendationsTab({ audit }: { audit: Audit }) {
  return (
    <div className="space-y-5">
      <div
        className="rounded-xl border p-5"
        style={{ background: "#F5F3FF", borderColor: "#DDD6FE" }}
      >
        <div className="flex items-start gap-3">
          <div>
            <p className="text-base font-bold" style={{ color: "#6D28D9" }}>
              AI Recommendation Engine
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#7C3AED" }}>
              Based on {audit.findings.length} audit findings across {audit.auditType} — generating service recommendations with priority ranking, estimated impact, and revenue opportunity.
            </p>
          </div>
        </div>
      </div>

      {audit.recommendedServices.length === 0 ? (
        <div
          className="rounded-xl border p-10 text-center"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-muted)" }}>
            AI recommendations not yet generated for this audit.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {audit.recommendedServices.map((s) => {
            const pc = PRIORITY_COLORS[s.priority];
            return (
              <div
                key={s.id}
                className="rounded-xl border overflow-hidden"
                style={{ borderColor: "var(--rtm-border)" }}
              >
                <div
                  className="px-4 py-3 flex items-center justify-between flex-wrap gap-2"
                  style={{ background: pc.bg, borderBottom: `1px solid ${pc.border}` }}
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <PriorityBadge priority={s.priority} />
                    <p className="font-bold text-sm" style={{ color: "var(--rtm-text-primary)" }}>
                      {s.service}
                    </p>
                    <Badge label={s.department} text="#1D4ED8" border="#BFDBFE" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-black px-2 py-0.5 rounded-full"
                      style={{ background: "#F5F3FF", color: "#6D28D9", border: "1px solid #DDD6FE" }}
                    >
                      Impact: {s.impactScore}/100
                    </span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0" }}
                    >
                      ${s.estimatedRevenue.toLocaleString()}/mo
                    </span>
                  </div>
                </div>
                <div className="p-4" style={{ background: "var(--rtm-bg)" }}>
                  <p
                    className="text-[10px] font-bold uppercase tracking-wide mb-1"
                    style={{ color: "var(--rtm-text-muted)" }}
                  >
                    Why Recommended
                  </p>
                  <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                    {s.reason}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Recommended Services Tab
function RecommendedServicesTab({ audit }: { audit: Audit }) {
  const [added, setAdded] = useState<Set<string>>(new Set());
  return (
    <div className="space-y-4">
      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "var(--rtm-border)" }}
      >
        <div
          className="px-4 py-3 border-b"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            Service Recommendation Panel
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
            {audit.recommendedServices.length} services recommended based on audit findings
          </p>
        </div>
        <div className="overflow-x-auto">
          <table
            className="w-full text-xs"
            style={{ borderCollapse: "collapse", minWidth: 800 }}
          >
            <thead>
              <tr
                style={{
                  background: "var(--rtm-bg)",
                  borderBottom: "1px solid var(--rtm-border-light)",
                }}
              >
                {["Recommended Service", "Reason", "Impact Score", "Priority", "Department", "Est. Revenue", "Add To Proposal"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
                    style={{ color: "var(--rtm-text-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {audit.recommendedServices.map((s, i) => (
                <tr
                  key={s.id}
                  style={{
                    borderBottom: "1px solid var(--rtm-border-light)",
                    background: i % 2 === 0 ? "var(--rtm-bg)" : "var(--rtm-surface)",
                  }}
                >
                  <td className="px-3 py-2 font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                    {s.service}
                  </td>
                  <td
                    className="px-3 py-2"
                    style={{ color: "var(--rtm-text-secondary)", maxWidth: 220 }}
                  >
                    {s.reason}
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-black text-xs" style={{ color: "#6D28D9" }}>
                      {s.impactScore}/100
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <PriorityBadge priority={s.priority} />
                  </td>
                  <td className="px-3 py-2">
                    <Badge label={s.department} text="#1D4ED8" border="#BFDBFE" />
                  </td>
                  <td className="px-3 py-2 font-bold" style={{ color: "#059669" }}>
                    ${s.estimatedRevenue.toLocaleString()}/mo
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() =>
                        setAdded((prev) => {
                          const n = new Set(prev);
                          if (n.has(s.id)) n.delete(s.id);
                          else n.add(s.id);
                          return n;
                        })
                      }
                      className="text-[10px] font-bold px-2 py-1 rounded border"
                      style={{
                        background: added.has(s.id) ? "#ECFDF5" : "#EFF6FF",
                        color: added.has(s.id) ? "#059669" : "#1D4ED8",
                        borderColor: added.has(s.id) ? "#A7F3D0" : "#BFDBFE",
                      }}
                    >
                      {added.has(s.id) ? "Added" : "Add"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Recommended Line Items Tab
function RecommendedLineItemsTab({ audit }: { audit: Audit }) {
  const [added, setAdded] = useState<Set<string>>(new Set());
  const setupTotal = audit.recommendedLineItems
    .filter((li) => added.has(li.id))
    .reduce((s, li) => s + li.setupFee, 0);
  const recurringTotal = audit.recommendedLineItems
    .filter((li) => added.has(li.id))
    .reduce((s, li) => s + li.recurringFee, 0);

  return (
    <div className="space-y-4">
      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "var(--rtm-border)" }}
      >
        <div
          className="px-4 py-3 border-b"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            Line Item Recommendation Panel
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
            {audit.recommendedLineItems.length} line items recommended · {added.size} selected
          </p>
        </div>
        <div className="overflow-x-auto">
          <table
            className="w-full text-xs"
            style={{ borderCollapse: "collapse", minWidth: 900 }}
          >
            <thead>
              <tr
                style={{
                  background: "var(--rtm-bg)",
                  borderBottom: "1px solid var(--rtm-border-light)",
                }}
              >
                {["Line Item", "Category", "Department", "Setup Fee", "Recurring Fee", "Delivery Standard", "Add To Proposal"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
                    style={{ color: "var(--rtm-text-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {audit.recommendedLineItems.map((li, i) => (
                <tr
                  key={li.id}
                  style={{
                    borderBottom: "1px solid var(--rtm-border-light)",
                    background: i % 2 === 0 ? "var(--rtm-bg)" : "var(--rtm-surface)",
                  }}
                >
                  <td className="px-3 py-2 font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                    {li.lineItem}
                  </td>
                  <td className="px-3 py-2">
                    <Badge label={li.category} text="#1D4ED8" border="#BFDBFE" />
                  </td>
                  <td className="px-3 py-2" style={{ color: "var(--rtm-text-secondary)" }}>
                    {li.department}
                  </td>
                  <td className="px-3 py-2 font-bold" style={{ color: li.setupFee > 0 ? "#C2410C" : "#9CA3AF" }}>
                    {li.setupFee > 0 ? `$${li.setupFee.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-3 py-2 font-bold" style={{ color: li.recurringFee > 0 ? "#1D4ED8" : "#9CA3AF" }}>
                    {li.recurringFee > 0 ? `$${li.recurringFee.toLocaleString()}/mo` : "—"}
                  </td>
                  <td className="px-3 py-2" style={{ color: "#1D4ED8" }}>{li.deliveryStandard}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() =>
                        setAdded((prev) => {
                          const n = new Set(prev);
                          if (n.has(li.id)) n.delete(li.id);
                          else n.add(li.id);
                          return n;
                        })
                      }
                      className="text-[10px] font-bold px-2 py-1 rounded border"
                      style={{
                        background: added.has(li.id) ? "#ECFDF5" : "#EFF6FF",
                        color: added.has(li.id) ? "#059669" : "#1D4ED8",
                        borderColor: added.has(li.id) ? "#A7F3D0" : "#BFDBFE",
                      }}
                    >
                      {added.has(li.id) ? "Added" : "Add"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            {added.size > 0 && (
              <tfoot>
                <tr style={{ background: "#ECFDF5", borderTop: "2px solid #A7F3D0" }}>
                  <td colSpan={3} className="px-3 py-2.5 text-xs font-bold" style={{ color: "#059669" }}>Selected Totals</td>
                  <td className="px-3 py-2.5 text-sm font-black" style={{ color: "#C2410C" }}>
                    {setupTotal > 0 ? `$${setupTotal.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-sm font-black" style={{ color: "#1D4ED8" }}>
                    {recurringTotal > 0 ? `$${recurringTotal.toLocaleString()}/mo` : "—"}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

// Competitor Analysis Tab
function CompetitorAnalysisTab({ audit }: { audit: Audit }) {
  if (audit.competitors.length === 0) {
    return (
      <div
        className="rounded-xl border p-10 text-center"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-muted)" }}>
          No competitor data for this audit.
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--rtm-text-muted)" }}>
          Run a Competitor Audit to populate this section.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-5">
      {audit.competitors.map((comp) => (
        <div
          key={comp.name}
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: "var(--rtm-border)" }}
        >
          <div
            className="px-4 py-3 border-b flex items-center gap-3"
            style={{ background: "#F5F3FF", borderColor: "#DDD6FE" }}
          >
            <p className="text-sm font-bold" style={{ color: "#6D28D9" }}>{comp.name}</p>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "Strengths",           items: comp.strengths,           color: "#15803D", bg: "#F0FDF4" },
              { label: "Weaknesses",          items: comp.weaknesses,          color: "#DC2626", bg: "#FEF2F2" },
              { label: "Opportunities",       items: comp.opportunities,       color: "#D97706", bg: "#FFFBEB" },
              { label: "Threats",             items: comp.threats,             color: "#7C3AED", bg: "#F5F3FF" },
              { label: "Recommended Actions", items: comp.recommendedActions,  color: "#0369A1", bg: "#F0F9FF" },
            ].map((section) => (
              <div
                key={section.label}
                className="rounded-lg border p-3"
                style={{ background: section.bg, borderColor: `${section.color}30` }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-wide mb-2"
                  style={{ color: section.color }}
                >
                  {section.label}
                </p>
                {section.items.map((item) => (
                  <p key={item} className="text-xs mb-0.5" style={{ color: section.color }}>
                    • {item}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Activity Timeline Tab
function ActivityTimelineTab({ audit }: { audit: Audit }) {
  return (
    <div className="space-y-3">
      {audit.timeline.length === 0 ? (
        <div
          className="rounded-xl border p-10 text-center"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-muted)" }}>
            No timeline events yet.
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5" style={{ background: "var(--rtm-border)" }} />
          <div className="space-y-3">
            {audit.timeline.map((event) => {
              const meta = TIMELINE_META[event.type];
              return (
                <div key={event.id} className="flex items-start gap-4 relative pl-12">
                  <div
                    className="absolute left-3 w-5 h-5 rounded-full border-2 border-white"
                    style={{ background: meta.color, top: 2 }}
                  />
                  <div
                    className="flex-1 rounded-xl border p-3"
                    style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <p className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                        {event.event}
                      </p>
                      <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>
                        {event.date} · {event.user}
                      </span>
                    </div>
                    {event.detail && (
                      <p className="text-xs mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
                        {event.detail}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

//
// Toast
//

function useToast() {
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string, duration = 2500) {
    setToast(msg);
    setTimeout(() => setToast(null), duration);
  }

  return { toast, showToast };
}

function ToastBanner({ message }: { message: string }) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold"
      style={{ background: "#1D4ED8", color: "#fff", minWidth: 260, textAlign: "center" }}
    >
      {message}
    </div>
  );
}

//
// Audit Detail Drawer
//

function AuditDetailDrawer({
  audit,
  onClose,
}: {
  audit: Audit;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<DrawerTab>("overview");
  const { toast, showToast } = useToast();

  const tabs: { key: DrawerTab; label: string }[] = [
    { key: "overview",              label: "Overview" },
    { key: "findings",              label: "Findings" },
    { key: "ai-recommendations",    label: "AI Recommendations" },
    { key: "recommended-services",  label: "Recommended Services" },
    { key: "recommended-line-items",label: "Recommended Line Items" },
    ...(audit.auditType === "Competitor"
      ? [{ key: "competitor-analysis" as DrawerTab, label: "Competitor Analysis" }]
      : []),
    { key: "activity-timeline",    label: "Activity Timeline" },
  ];

  function handleDownloadReport() {
    showToast("Preparing audit report PDF...");
    setTimeout(() => {
      showToast("Audit report downloaded");
    }, 1500);
  }

  return (
    <>
      {toast && <ToastBanner message={toast} />}
      <div className="fixed inset-0 z-50 flex">
        <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div
          className="w-full max-w-5xl h-full flex flex-col shadow-2xl overflow-hidden"
          style={{ background: "var(--rtm-bg)", borderLeft: "1px solid var(--rtm-border)" }}
        >
          {/* Header */}
          <div
            className="flex items-start justify-between px-6 py-5 border-b flex-shrink-0"
            style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-surface)" }}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <AuditTypeBadge type={audit.auditType} />
                <AuditStatusBadge status={audit.status} />
                <PriorityBadge priority={audit.priority} />
                <ProposalStatusBadge status={audit.proposalStatus} />
              </div>
              <h2 className="text-xl font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                {audit.auditName}
              </h2>
              <p className="text-sm mt-0.5" style={{ color: "var(--rtm-text-secondary)" }}>
                {audit.client} · {audit.industry} · {audit.website} · {audit.createdBy} · {audit.createdDate}
              </p>
              <p className="text-xs mt-1 italic" style={{ color: "var(--rtm-text-muted)" }}>
                {audit.summary}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
              <ScoreRing score={audit.overallScore} size={56} />
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-lg"
                style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)" }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Quick stats bar */}
          <div
            className="flex gap-0 border-b flex-shrink-0 overflow-x-auto"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
          >
            {[
              { label: "Issues",        value: audit.issuesFound,                             color: "#DC2626" },
              { label: "Revenue Opp.", value: `$${audit.revenueOpportunity.toLocaleString()}`, color: "#059669" },
              { label: "Services Rec.", value: audit.recommendedServices.length,              color: "#7C3AED" },
              { label: "Line Items",    value: audit.recommendedLineItems.length,              color: "#1D4ED8" },
            ].map((s) => (
              <div
                key={s.label}
                className="flex-shrink-0 px-4 py-2 text-center border-r"
                style={{ borderColor: "var(--rtm-border)" }}
              >
                <div className="text-xs font-black" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[9px] font-semibold" style={{ color: "var(--rtm-text-muted)" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tab bar */}
          <div
            className="flex gap-0 border-b flex-shrink-0 overflow-x-auto"
            style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-surface)" }}
          >
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className="px-3 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2"
                style={{
                  borderBottomColor: activeTab === t.key ? "#1D4ED8" : "transparent",
                  color: activeTab === t.key ? "#1D4ED8" : "var(--rtm-text-muted)",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "overview"              && <OverviewTab audit={audit} />}
            {activeTab === "findings"              && <FindingsTab audit={audit} />}
            {activeTab === "ai-recommendations"   && <AIRecommendationsTab audit={audit} />}
            {activeTab === "recommended-services"  && <RecommendedServicesTab audit={audit} />}
            {activeTab === "recommended-line-items"&& <RecommendedLineItemsTab audit={audit} />}
            {activeTab === "competitor-analysis"   && <CompetitorAnalysisTab audit={audit} />}
            {activeTab === "activity-timeline"     && <ActivityTimelineTab audit={audit} />}
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between px-6 py-4 border-t flex-shrink-0"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
          >
            <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
              {audit.auditName} · Score: {audit.overallScore}/100 · {audit.issuesFound} issues · ${audit.revenueOpportunity.toLocaleString()} revenue opportunity
            </p>
            <div className="flex gap-2">
              <button
                className="text-sm px-3 py-1.5 rounded-lg font-semibold border"
                style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}
                onClick={onClose}
              >
                Close
              </button>
              <button
                className="text-sm px-3 py-1.5 rounded-lg font-semibold border"
                style={{ background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" }}
                onClick={handleDownloadReport}
              >
                Download Audit Report
              </button>
              <button
                className="text-sm px-4 py-1.5 rounded-lg font-bold"
                style={{ background: "#059669", color: "#fff" }}
                onClick={() => {
                  const auditId = encodeURIComponent(audit.id);
                  const auditType = encodeURIComponent(audit.auditType);
                  window.location.href = `/sales/proposals?new=true&auditId=${auditId}&auditType=${auditType}`;
                }}
              >
                Generate Proposal
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

//
// Audit Request Queue
//

interface AuditRequestQueueItem {
  id: string;
  clientName: string;
  requestType: "Manual" | "Hybrid";
  departments: string[];
  status: AuditRequestStatus;
  assignedReviewers: string[];
  requestedBy: string;
  slaDeadline: string;
}

const MOCK_AUDIT_REQUESTS: AuditRequestQueueItem[] = [
  {
    id: "AUD-2025-1842",
    clientName: "Summit Landscaping",
    requestType: "Manual",
    departments: ["SEO"],
    status: "in-progress",
    assignedReviewers: ["Alex K."],
    requestedBy: "Jordan M.",
    slaDeadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "HYB-2025-3301",
    clientName: "Blue Ridge Plumbing",
    requestType: "Hybrid",
    departments: ["GBP", "PPC"],
    status: "ai-complete-pending-review",
    assignedReviewers: ["Dana W.", "James R."],
    requestedBy: "Sarah K.",
    slaDeadline: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
  },
  {
    id: "AUD-2025-2817",
    clientName: "Apex Roofing",
    requestType: "Manual",
    departments: ["PPC / Google Ads"],
    status: "finalized",
    assignedReviewers: ["James R."],
    requestedBy: "Mike T.",
    slaDeadline: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: "HYB-2025-4182",
    clientName: "Pinnacle HVAC",
    requestType: "Hybrid",
    departments: ["SEO", "Meta Ads"],
    status: "overdue",
    assignedReviewers: ["Dana W.", "Lena P."],
    requestedBy: "Sarah K.",
    slaDeadline: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
  },
  {
    id: "AUD-2025-8966",
    clientName: "GreenWave Lawn Care",
    requestType: "Manual",
    departments: ["GBP"],
    status: "pending-assignment",
    assignedReviewers: [],
    requestedBy: "Jordan M.",
    slaDeadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
  },
];

function AuditRequestStatusBadgeLocal({ status }: { status: AuditRequestStatus }) {
  const label = AUDIT_REQUEST_STATUS_LABELS[status] ?? status;
  const colors = AUDIT_REQUEST_STATUS_COLORS[status] ?? { bg: "#F3F4F6", color: "#6B7280", border: "#D1D5DB" };
  return (
    <span
      className="inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap"
      style={{ background: colors.bg, color: colors.color, borderColor: colors.border }}
    >
      {label}
    </span>
  );
}

function AuditRequestQueueSection() {
  const [search, setSearch] = React.useState("");
  const [selectedReq, setSelectedReq] = React.useState<AuditRequestQueueItem | null>(null);
  const filtered = MOCK_AUDIT_REQUESTS.filter((r) => {
    const q = search.toLowerCase();
    return (
      !q ||
      r.clientName.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      r.departments.some((d) => d.toLowerCase().includes(q))
    );
  });

  return (
    <>
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            Audit Request Queue
          </p>
          <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
            Manual and Hybrid audit requests across all opportunities.
          </p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search requests..."
          className="text-sm px-3 py-2 rounded-lg border outline-none"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", minWidth: 200 }}
        />
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--rtm-border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
                {["ID", "Client", "Request Type", "Department(s)", "Status", "Assigned Reviewer(s)", "Requested By", "SLA Due", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
                    style={{ color: "var(--rtm-text-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((req, i) => {
                const due = new Date(req.slaDeadline);
                const isOverdue = due < new Date();
                const dueStr = isOverdue
                  ? `Overdue — ${due.toLocaleDateString()}`
                  : due.toLocaleString();
                return (
                  <tr
                    key={req.id}
                    style={{
                      borderBottom: "1px solid var(--rtm-border)",
                      background: i % 2 === 0 ? "var(--rtm-bg)" : "var(--rtm-surface)",
                    }}
                  >
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono" style={{ color: "var(--rtm-text-muted)" }}>{req.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{req.clientName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                        style={{
                          background: req.requestType === "Hybrid" ? "#F5F3FF" : "#EFF6FF",
                          color: req.requestType === "Hybrid" ? "#7C3AED" : "#1D4ED8",
                          borderColor: req.requestType === "Hybrid" ? "#DDD6FE" : "#BFDBFE",
                        }}
                      >
                        {req.requestType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {req.departments.map((d) => (
                          <span
                            key={d}
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded border"
                            style={{ background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" }}
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <AuditRequestStatusBadgeLocal status={req.status} />
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                      {req.assignedReviewers.length > 0 ? req.assignedReviewers.join(", ") : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                      {req.requestedBy}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs font-semibold"
                        style={{ color: isOverdue ? "#DC2626" : "var(--rtm-text-muted)" }}
                      >
                        {dueStr}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedReq(req)}
                        className="text-xs px-3 py-1 rounded-lg font-semibold border transition-all hover:opacity-80"
                        style={{ background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm" style={{ color: "var(--rtm-text-muted)" }}>
                    No audit requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      {/* Audit Request Detail Drawer */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedReq(null)} />
          <div className="w-[480px] h-full flex flex-col shadow-2xl overflow-hidden"
            style={{ background: "var(--rtm-bg)", borderLeft: "1px solid var(--rtm-border)" }}>
            <div className="flex items-start justify-between px-6 py-5 border-b flex-shrink-0"
              style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-surface)" }}>
              <div>
                <p className="text-xs font-mono" style={{ color: "var(--rtm-text-muted)" }}>{selectedReq.id}</p>
                <h2 className="text-lg font-bold mt-0.5" style={{ color: "var(--rtm-text-primary)" }}>{selectedReq.clientName}</h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <AuditRequestStatusBadgeLocal status={selectedReq.status} />
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                    style={{ background: selectedReq.requestType === "Hybrid" ? "#F5F3FF" : "#EFF6FF", color: selectedReq.requestType === "Hybrid" ? "#7C3AED" : "#1D4ED8", borderColor: selectedReq.requestType === "Hybrid" ? "#DDD6FE" : "#BFDBFE" }}>
                    {selectedReq.requestType}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedReq(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-lg flex-shrink-0 ml-4"
                style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)" }}>x</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {[  
                ["Request ID",         selectedReq.id],
                ["Client",             selectedReq.clientName],
                ["Request Type",       selectedReq.requestType],
                ["Departments",        selectedReq.departments.join(", ")],
                ["Assigned Reviewers", selectedReq.assignedReviewers.length > 0 ? selectedReq.assignedReviewers.join(", ") : "—"],
                ["Requested By",       selectedReq.requestedBy],
                ["SLA Deadline",       new Date(selectedReq.slaDeadline) < new Date() ? `Overdue — ${new Date(selectedReq.slaDeadline).toLocaleDateString()}` : new Date(selectedReq.slaDeadline).toLocaleString()],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <span className="text-xs font-semibold w-36 flex-shrink-0" style={{ color: "var(--rtm-text-muted)" }}>{label}</span>
                  <span className="text-xs" style={{ color: "var(--rtm-text-primary)" }}>{value}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 px-6 py-4 border-t flex-shrink-0"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
              <a href={`/sales/audits?requestId=${selectedReq.id}`}
                className="flex-1 text-xs font-semibold py-2 rounded-lg border text-center"
                style={{ background: "#1D4ED8", color: "#fff", borderColor: "#1D4ED8" }}>
                Open Full Audit
              </a>
              <button onClick={() => setSelectedReq(null)}
                className="text-xs font-semibold px-4 py-2 rounded-lg border"
                style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border)" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

//
// Main Page
//

const AUDIT_TYPE_FILTER_OPTIONS: Array<AuditType | "All"> = [
  "All",
  "SEO Technical",
  "GBP",
  "PPC / Google Ads",
  "Meta Ads",
  "LSA",
  "Website",
  "Competitor",
];

export default function AuditIntelligenceCenterPage() {
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AuditStatus | "All">("All");
  const [typeFilter, setTypeFilter] = useState<AuditType | "All">("All");

  const filtered = MOCK_AUDITS.filter((a) => {
    if (statusFilter !== "All" && a.status !== statusFilter) return false;
    if (typeFilter !== "All" && a.auditType !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        a.auditName.toLowerCase().includes(q) ||
        a.client.toLowerCase().includes(q) ||
        a.industry.toLowerCase().includes(q) ||
        a.createdBy.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {selectedAudit && (
        <AuditDetailDrawer
          audit={selectedAudit}
          onClose={() => setSelectedAudit(null)}
        />
      )}

      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "#1D4ED8" }}>
            Sales
          </p>
          <h1 className="text-2xl font-medium tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
            Audits
          </h1>
          <p className="text-sm mt-1 max-w-2xl" style={{ color: "var(--rtm-text-muted)" }}>
            Internal sales tool. Review client audits, identify issues, generate recommendations, and build justified proposals.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="text-sm px-3 py-2 rounded-lg font-bold border"
            style={{ background: "#1D4ED8", color: "#fff", borderColor: "#1D4ED8" }}
            onClick={() => { window.location.href = "/sales/proposals?new=true"; }}
          >
            New Audit
          </button>
          <div className="relative group inline-block">
            <button
              disabled
              className="text-sm px-3 py-2 rounded-lg font-semibold border opacity-50 cursor-not-allowed"
              style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-primary)", borderColor: "var(--rtm-border)" }}
            >
              Export
            </button>
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ whiteSpace: "nowrap" }}
            >
              <div
                className="rounded-lg px-3 py-1.5 text-xs font-medium shadow-lg"
                style={{ background: "#1E293B", color: "#F8FAFC", border: "1px solid #334155" }}
              >
                Not yet available — coming at launch
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent"
                  style={{ borderTopColor: "#1E293B" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards audits={MOCK_AUDITS} />

      {/* Audit Types Filter */}
      <div className="rounded-xl border p-4" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--rtm-text-muted)" }}>
          Audit Types
        </p>
        <div className="flex flex-wrap gap-2">
          {AUDIT_TYPE_FILTER_OPTIONS.map((type) => {
            const isAll = type === "All";
            const isActive = typeFilter === type;
            const m = isAll ? null : AUDIT_TYPE_META[type as AuditType];
            return (
              <button
                key={type}
                onClick={() => setTypeFilter(isActive && !isAll ? "All" : type)}
                className="inline-flex items-center px-3 py-1.5 rounded-lg border text-xs font-semibold"
                style={{
                  background: isActive ? (isAll ? "#EFF6FF" : m?.bg) : "var(--rtm-bg)",
                  color: isActive ? (isAll ? "#1D4ED8" : m?.color) : "var(--rtm-text-muted)",
                  borderColor: isActive ? (isAll ? "#BFDBFE" : m?.border) : "var(--rtm-border)",
                }}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Status Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 relative" style={{ minWidth: 240 }}>
          <input
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            placeholder="Search audits by name, client, industry, or sales rep..."
            className="w-full px-4 py-2 rounded-lg border text-sm outline-none"
            style={{
              background: "var(--rtm-surface)",
              borderColor: "var(--rtm-border)",
              color: "var(--rtm-text-primary)",
            }}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(["All", "Not Started", "Pending", "In Progress", "Completed", "Needs Review"] as (AuditStatus | "All")[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold border whitespace-nowrap"
              style={{
                background:
                  statusFilter === s
                    ? s === "All" ? "#EFF6FF" : AUDIT_STATUS_COLORS[s as AuditStatus].bg
                    : "var(--rtm-surface)",
                color:
                  statusFilter === s
                    ? s === "All" ? "#1D4ED8" : AUDIT_STATUS_COLORS[s as AuditStatus].text
                    : "var(--rtm-text-muted)",
                borderColor:
                  statusFilter === s
                    ? s === "All" ? "#BFDBFE" : AUDIT_STATUS_COLORS[s as AuditStatus].border
                    : "var(--rtm-border)",
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="text-xs flex-shrink-0" style={{ color: "var(--rtm-text-muted)" }}>
          {filtered.length} audit{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Audit Table */}
      <AuditTable audits={filtered} onSelect={setSelectedAudit} />

      {/* Score Legend */}
      <div
        className="rounded-xl border p-4 flex items-center gap-6 flex-wrap"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>
          Score Legend
        </p>
        {[
          { range: "80–100", label: "Strong",     color: "#15803D", bg: "#F0FDF4" },
          { range: "60–79",  label: "Good",       color: "#D97706", bg: "#FFFBEB" },
          { range: "40–59",  label: "Needs Work", color: "#EA580C", bg: "#FFF7ED" },
          { range: "0–39",   label: "Critical",   color: "#DC2626", bg: "#FEF2F2" },
        ].map((item) => (
          <div key={item.range} className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black"
              style={{ background: item.bg, color: item.color }}
            >
              {item.range.split("–")[0]}
            </div>
            <span className="text-xs font-semibold" style={{ color: item.color }}>
              {item.range} — {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Audit Request Queue */}
      <AuditRequestQueueSection />
    </div>
  );
}
