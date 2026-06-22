"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ServiceCategory =
  | "SEO" | "GBP" | "PPC" | "Meta" | "Website" | "Hosting"
  | "AI Automation" | "Reporting" | "Creative" | "Strategy" | "LSA" | "Consulting";

type BillingCycle = "One-Time" | "Monthly" | "Quarterly" | "Annual";

type Department =
  | "SEO" | "GBP" | "Paid Advertising" | "Web" | "Creative"
  | "Strategy" | "Reporting" | "LSA" | "AI & Automation";

type DeliveryStandard = "Standard" | "Priority" | "Rush" | "Custom";

type LineItemStatus = "Active" | "Pending Finance" | "Needs Approval" | "Inactive";

type DiscountType = "None" | "Fixed" | "Percentage" | "Promo Code" | "Package";

type ContractTerm = "Month-to-Month" | "6 Month" | "12 Month" | "24 Month" | "Custom";

type ProposalStatus =
  | "Draft"
  | "Internal Review"
  | "Pending Approval"
  | "Sent"
  | "Negotiation"
  | "Accepted"
  | "Rejected"
  | "Expired"
  | "Converted To Contract";

type AIModeOption = "Budget Match" | "Growth Package" | "Full Service" | "Starter";

interface LineItem {
  id: string;
  name: string;
  department: Department;
  category: ServiceCategory;
  setupFee: number;
  recurringFee: number;
  quantity: number;
  deliveryStandard: DeliveryStandard;
  taskBlueprint: string;
  dependencies: string[];
  status: LineItemStatus;
  firstResponse: string;
  targetDays: number;
  clientUpdateFreq: string;
  escalationDays: number;
  recurringTasks: string[];
  generatedTasks: number;
  generatedMilestones: number;
  generatedDeliverables: number;
}

interface Discount {
  type: DiscountType;
  value: number;
  promoCode: string;
  managerApproval: boolean;
  approved: boolean;
}

interface ContractConfig {
  term: ContractTerm;
  customMonths: number;
  startDate: string;
  endDate: string;
  noticePeriod: string;
  autoRenew: boolean;
  cancellationTerms: string;
}

interface ProposalInfo {
  client: string;
  opportunity: string;
  owner: string;
  proposalDate: string;
  expirationDate: string;
}

interface AIRecommendation {
  packageName: string;
  services: string[];
  lineItems: string[];
  expectedImpact: string;
  estimatedRevenue: number;
  confidenceScore: number;
  reasoning: string;
}

interface Proposal {
  id: string;
  name: string;
  client: string;
  owner: string;
  services: ServiceCategory[];
  lineItems: LineItem[];
  setupTotal: number;
  recurringTotal: number;
  totalValue: number;
  status: ProposalStatus;
  createdDate: string;
  discount: Discount;
  contract: ContractConfig;
  info: ProposalInfo;
  aiSummary: {
    recommendedPackage: string;
    revenueOpportunity: string;
    riskFactors: string[];
    complexity: "Low" | "Medium" | "High";
    resourceRequirements: string;
    expectedImpact: string;
  };
  activityTimeline: { date: string; event: string; user: string }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Line Item Catalog
// ─────────────────────────────────────────────────────────────────────────────

const LINE_ITEM_CATALOG: LineItem[] = [
  {
    id: "li-seo-001", name: "SEO Setup & Onboarding", department: "SEO", category: "SEO",
    setupFee: 1500, recurringFee: 0, quantity: 1, deliveryStandard: "Standard",
    taskBlueprint: "SEO Setup Blueprint", dependencies: ["GSC Access", "GA4 Access"],
    status: "Active", firstResponse: "1 business day", targetDays: 12,
    clientUpdateFreq: "Every 2 days", escalationDays: 14,
    recurringTasks: [], generatedTasks: 18, generatedMilestones: 4, generatedDeliverables: 6,
  },
  {
    id: "li-seo-002", name: "SEO Monthly Management", department: "SEO", category: "SEO",
    setupFee: 0, recurringFee: 1200, quantity: 1, deliveryStandard: "Standard",
    taskBlueprint: "SEO Monthly Blueprint", dependencies: ["SEO Setup Complete"],
    status: "Active", firstResponse: "1 business day", targetDays: 10,
    clientUpdateFreq: "Weekly", escalationDays: 14,
    recurringTasks: ["Keyword tracking", "Content optimization", "Link building", "Technical audit"],
    generatedTasks: 22, generatedMilestones: 2, generatedDeliverables: 4,
  },
  {
    id: "li-gbp-001", name: "GBP Optimization", department: "GBP", category: "GBP",
    setupFee: 350, recurringFee: 500, quantity: 1, deliveryStandard: "Standard",
    taskBlueprint: "GBP Optimization Blueprint", dependencies: ["GBP Access"],
    status: "Active", firstResponse: "1 business day", targetDays: 4,
    clientUpdateFreq: "Weekly", escalationDays: 7,
    recurringTasks: ["Weekly posting", "Q&A management", "Photo uploads", "Review responses"],
    generatedTasks: 12, generatedMilestones: 2, generatedDeliverables: 3,
  },
  {
    id: "li-ppc-001", name: "PPC Campaign Setup", department: "Paid Advertising", category: "PPC",
    setupFee: 1200, recurringFee: 0, quantity: 1, deliveryStandard: "Priority",
    taskBlueprint: "PPC Launch Blueprint", dependencies: ["Google Ads Access", "Landing Page"],
    status: "Active", firstResponse: "Same day", targetDays: 10,
    clientUpdateFreq: "Every 2 days", escalationDays: 7,
    recurringTasks: [], generatedTasks: 20, generatedMilestones: 5, generatedDeliverables: 7,
  },
  {
    id: "li-ppc-002", name: "PPC Monthly Management", department: "Paid Advertising", category: "PPC",
    setupFee: 0, recurringFee: 1500, quantity: 1, deliveryStandard: "Standard",
    taskBlueprint: "PPC Monthly Blueprint", dependencies: ["PPC Setup Complete"],
    status: "Active", firstResponse: "1 business day", targetDays: 12,
    clientUpdateFreq: "Weekly", escalationDays: 14,
    recurringTasks: ["Bid optimization", "A/B testing", "Negative keyword pruning", "Reporting"],
    generatedTasks: 18, generatedMilestones: 2, generatedDeliverables: 3,
  },
  {
    id: "li-meta-001", name: "Meta Ads Setup", department: "Paid Advertising", category: "Meta",
    setupFee: 900, recurringFee: 0, quantity: 1, deliveryStandard: "Standard",
    taskBlueprint: "Meta Ads Launch Blueprint", dependencies: ["Meta Business Manager", "Pixel"],
    status: "Active", firstResponse: "1 business day", targetDays: 10,
    clientUpdateFreq: "Every 2 days", escalationDays: 10,
    recurringTasks: [], generatedTasks: 16, generatedMilestones: 4, generatedDeliverables: 5,
  },
  {
    id: "li-meta-002", name: "Meta Ads Management", department: "Paid Advertising", category: "Meta",
    setupFee: 0, recurringFee: 1200, quantity: 1, deliveryStandard: "Standard",
    taskBlueprint: "Meta Monthly Blueprint", dependencies: ["Meta Ads Setup"],
    status: "Active", firstResponse: "1 business day", targetDays: 10,
    clientUpdateFreq: "Weekly", escalationDays: 14,
    recurringTasks: ["Creative rotation", "Audience testing", "Retargeting", "Monthly report"],
    generatedTasks: 15, generatedMilestones: 2, generatedDeliverables: 3,
  },
  {
    id: "li-web-001", name: "Website Redesign", department: "Web", category: "Website",
    setupFee: 5000, recurringFee: 0, quantity: 1, deliveryStandard: "Standard",
    taskBlueprint: "Website Redesign Blueprint", dependencies: ["Brand Kit", "Content", "Hosting"],
    status: "Active", firstResponse: "1 business day", targetDays: 45,
    clientUpdateFreq: "Every 3 days", escalationDays: 50,
    recurringTasks: [], generatedTasks: 40, generatedMilestones: 8, generatedDeliverables: 12,
  },
  {
    id: "li-web-002", name: "Website Maintenance", department: "Web", category: "Website",
    setupFee: 0, recurringFee: 250, quantity: 1, deliveryStandard: "Standard",
    taskBlueprint: "Web Maintenance Blueprint", dependencies: ["CMS Access"],
    status: "Active", firstResponse: "1 business day", targetDays: 2,
    clientUpdateFreq: "Monthly summary", escalationDays: 4,
    recurringTasks: ["Plugin updates", "Security scans", "Uptime monitoring", "Minor fixes"],
    generatedTasks: 5, generatedMilestones: 1, generatedDeliverables: 1,
  },
  {
    id: "li-host-001", name: "Managed Hosting", department: "Web", category: "Hosting",
    setupFee: 0, recurringFee: 150, quantity: 1, deliveryStandard: "Standard",
    taskBlueprint: "Hosting Onboarding Blueprint", dependencies: ["Domain Access"],
    status: "Active", firstResponse: "4 hours", targetDays: 1,
    clientUpdateFreq: "Monthly", escalationDays: 2,
    recurringTasks: ["Server monitoring", "Backup verification", "SSL renewal", "Performance checks"],
    generatedTasks: 4, generatedMilestones: 1, generatedDeliverables: 1,
  },
  {
    id: "li-ai-001", name: "AI Automation Setup", department: "AI & Automation", category: "AI Automation",
    setupFee: 2500, recurringFee: 800, quantity: 1, deliveryStandard: "Priority",
    taskBlueprint: "AI Automation Blueprint", dependencies: ["CRM Access", "API Keys"],
    status: "Active", firstResponse: "Same day", targetDays: 14,
    clientUpdateFreq: "Every 3 days", escalationDays: 10,
    recurringTasks: ["Workflow monitoring", "AI model tuning", "Integration checks"],
    generatedTasks: 30, generatedMilestones: 6, generatedDeliverables: 8,
  },
  {
    id: "li-report-001", name: "Reporting Dashboard Setup", department: "Reporting", category: "Reporting",
    setupFee: 400, recurringFee: 300, quantity: 1, deliveryStandard: "Standard",
    taskBlueprint: "Reporting Blueprint", dependencies: ["GA4 Access", "Ads Access"],
    status: "Active", firstResponse: "2 business days", targetDays: 6,
    clientUpdateFreq: "Monthly", escalationDays: 10,
    recurringTasks: ["Monthly report", "Data reconciliation", "KPI updates"],
    generatedTasks: 8, generatedMilestones: 2, generatedDeliverables: 2,
  },
  {
    id: "li-lsa-001", name: "LSA Account Setup", department: "LSA", category: "LSA",
    setupFee: 600, recurringFee: 800, quantity: 1, deliveryStandard: "Standard",
    taskBlueprint: "LSA Setup Blueprint", dependencies: ["GBP", "License", "Insurance"],
    status: "Active", firstResponse: "1 business day", targetDays: 5,
    clientUpdateFreq: "Weekly", escalationDays: 8,
    recurringTasks: ["Lead dispute management", "Bid adjustments", "Review strategy", "Monthly report"],
    generatedTasks: 10, generatedMilestones: 3, generatedDeliverables: 3,
  },
  {
    id: "li-strategy-001", name: "Digital Strategy Consulting", department: "Strategy", category: "Strategy",
    setupFee: 0, recurringFee: 600, quantity: 1, deliveryStandard: "Priority",
    taskBlueprint: "Strategy Blueprint", dependencies: ["Business Goals Defined"],
    status: "Active", firstResponse: "1 business day", targetDays: 5,
    clientUpdateFreq: "Bi-weekly", escalationDays: 8,
    recurringTasks: ["Monthly strategy call", "Market analysis", "Competitor monitoring"],
    generatedTasks: 6, generatedMilestones: 1, generatedDeliverables: 2,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// AI Package Recommendations
// ─────────────────────────────────────────────────────────────────────────────

const AI_PACKAGES: AIRecommendation[] = [
  {
    packageName: "Local Domination Package",
    services: ["SEO", "GBP", "LSA"],
    lineItems: ["SEO Setup & Onboarding", "SEO Monthly Management", "GBP Optimization", "LSA Account Setup"],
    expectedImpact: "40–60% increase in local search visibility within 90 days",
    estimatedRevenue: 3350,
    confidenceScore: 94,
    reasoning: "Client has strong local presence signals but weak GBP and missing LSA. High-intent local traffic opportunity.",
  },
  {
    packageName: "Full Digital Growth Stack",
    services: ["SEO", "GBP", "PPC", "Meta", "Reporting"],
    lineItems: ["SEO Setup", "SEO Monthly", "GBP Optimization", "PPC Setup", "PPC Monthly", "Meta Ads Setup", "Meta Monthly", "Reporting Dashboard"],
    expectedImpact: "3–5x increase in qualified leads within 6 months",
    estimatedRevenue: 6250,
    confidenceScore: 87,
    reasoning: "Multi-channel approach recommended given competitive market and client budget flexibility.",
  },
  {
    packageName: "AI-Powered Marketing Suite",
    services: ["AI Automation", "SEO", "Reporting"],
    lineItems: ["AI Automation Setup", "SEO Monthly Management", "Reporting Dashboard Setup"],
    expectedImpact: "60% reduction in manual marketing tasks, 25% improvement in conversion rates",
    estimatedRevenue: 2300,
    confidenceScore: 91,
    reasoning: "Client expressed interest in automation. AI workflows can amplify existing team capacity.",
  },
  {
    packageName: "Paid Media Accelerator",
    services: ["PPC", "Meta"],
    lineItems: ["PPC Campaign Setup", "PPC Monthly Management", "Meta Ads Setup", "Meta Ads Management"],
    expectedImpact: "2–4x ROAS improvement within 60 days",
    estimatedRevenue: 4800,
    confidenceScore: 88,
    reasoning: "Audit reveals significant PPC waste. Restructured campaigns with Meta retargeting will maximize ad spend.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Mock Proposals — 20 proposals
// ─────────────────────────────────────────────────────────────────────────────

function makeLI(id: string, qty = 1): LineItem {
  const base = LINE_ITEM_CATALOG.find((l) => l.id === id)!;
  return { ...base, quantity: qty };
}

const MOCK_PROPOSALS: Proposal[] = [
  // 1 — SEO + GBP
  {
    id: "prop-001", name: "Summit Landscaping — SEO + GBP", client: "Summit Landscaping", owner: "Jordan M.",
    services: ["SEO", "GBP"], status: "Negotiation", createdDate: "May 24, 2025",
    lineItems: [makeLI("li-seo-001"), makeLI("li-seo-002"), makeLI("li-gbp-001")],
    setupTotal: 1850, recurringTotal: 1700, totalValue: 22250,
    discount: { type: "None", value: 0, promoCode: "", managerApproval: false, approved: false },
    contract: { term: "12 Month", customMonths: 12, startDate: "2025-08-01", endDate: "2026-07-31", noticePeriod: "30 days", autoRenew: true, cancellationTerms: "30-day written notice required" },
    info: { client: "Summit Landscaping", opportunity: "OPP-001", owner: "Jordan M.", proposalDate: "May 24, 2025", expirationDate: "Jun 24, 2025" },
    aiSummary: { recommendedPackage: "Local Domination Package", revenueOpportunity: "$22,250 ARR", riskFactors: ["GBP access pending", "Seasonal business"], complexity: "Medium", resourceRequirements: "SEO team + GBP specialist", expectedImpact: "40–60% local visibility lift" },
    activityTimeline: [
      { date: "May 24, 2025", event: "Proposal created", user: "Jordan M." },
      { date: "May 30, 2025", event: "Sent to client", user: "Jordan M." },
      { date: "Jun 8, 2025", event: "Client requested discount", user: "Marcus Webb" },
    ],
  },
  // 2 — Full Service
  {
    id: "prop-002", name: "Metro Dental — Full Service Package", client: "Metro Dental Group", owner: "Jordan M.",
    services: ["SEO", "GBP", "LSA", "Reporting"], status: "Accepted", createdDate: "May 18, 2025",
    lineItems: [makeLI("li-seo-001"), makeLI("li-seo-002"), makeLI("li-gbp-001"), makeLI("li-lsa-001"), makeLI("li-report-001")],
    setupTotal: 2850, recurringTotal: 3300, totalValue: 42450,
    discount: { type: "Percentage", value: 10, promoCode: "DENTAL10", managerApproval: true, approved: true },
    contract: { term: "12 Month", customMonths: 12, startDate: "2025-07-01", endDate: "2026-06-30", noticePeriod: "30 days", autoRenew: true, cancellationTerms: "60-day written notice required" },
    info: { client: "Metro Dental Group", opportunity: "OPP-002", owner: "Jordan M.", proposalDate: "May 18, 2025", expirationDate: "Jun 18, 2025" },
    aiSummary: { recommendedPackage: "Full Digital Growth Stack", revenueOpportunity: "$42,450 ARR", riskFactors: ["HIPAA compliance considerations"], complexity: "High", resourceRequirements: "SEO + GBP + LSA + Reporting teams", expectedImpact: "3–5x qualified leads in 6 months" },
    activityTimeline: [
      { date: "May 18, 2025", event: "Proposal created", user: "Jordan M." },
      { date: "May 25, 2025", event: "Internal review approved", user: "Sarah K." },
      { date: "Jun 1, 2025", event: "Sent to client", user: "Jordan M." },
      { date: "Jun 9, 2025", event: "Client accepted", user: "Dr. Amanda Torres" },
    ],
  },
  // 3 — PPC + Landing Page
  {
    id: "prop-003", name: "Sunstate Solar — PPC Package", client: "Sunstate Solar", owner: "Sarah K.",
    services: ["PPC", "Website", "Reporting"], status: "Sent", createdDate: "May 30, 2025",
    lineItems: [makeLI("li-ppc-001"), makeLI("li-ppc-002"), makeLI("li-web-001"), makeLI("li-report-001")],
    setupTotal: 6600, recurringTotal: 1800, totalValue: 28200,
    discount: { type: "None", value: 0, promoCode: "", managerApproval: false, approved: false },
    contract: { term: "6 Month", customMonths: 6, startDate: "2025-07-15", endDate: "2026-01-14", noticePeriod: "30 days", autoRenew: false, cancellationTerms: "30-day written notice required" },
    info: { client: "Sunstate Solar", opportunity: "OPP-003", owner: "Sarah K.", proposalDate: "May 30, 2025", expirationDate: "Jun 30, 2025" },
    aiSummary: { recommendedPackage: "Paid Media Accelerator", revenueOpportunity: "$28,200 contract value", riskFactors: ["Competitive solar market", "Landing page dependency"], complexity: "Medium", resourceRequirements: "PPC specialist + Web team", expectedImpact: "2–4x ROAS improvement" },
    activityTimeline: [
      { date: "May 30, 2025", event: "Proposal created", user: "Sarah K." },
      { date: "Jun 7, 2025", event: "Sent to client", user: "Sarah K." },
    ],
  },
  // 4 — SEO + GBP + PPC (Converted)
  {
    id: "prop-004", name: "Coastal Wellness — SEO + GBP + PPC", client: "Coastal Wellness Spa", owner: "Sarah K.",
    services: ["SEO", "GBP", "PPC"], status: "Converted To Contract", createdDate: "May 7, 2025",
    lineItems: [makeLI("li-seo-001"), makeLI("li-seo-002"), makeLI("li-gbp-001"), makeLI("li-ppc-001"), makeLI("li-ppc-002")],
    setupTotal: 2700, recurringTotal: 3200, totalValue: 41100,
    discount: { type: "Package", value: 5, promoCode: "", managerApproval: false, approved: true },
    contract: { term: "12 Month", customMonths: 12, startDate: "2025-06-01", endDate: "2026-05-31", noticePeriod: "30 days", autoRenew: true, cancellationTerms: "30-day written notice" },
    info: { client: "Coastal Wellness Spa", opportunity: "OPP-004", owner: "Sarah K.", proposalDate: "May 7, 2025", expirationDate: "Jun 7, 2025" },
    aiSummary: { recommendedPackage: "Full Digital Growth Stack", revenueOpportunity: "$41,100 ARR", riskFactors: ["Seasonal spa traffic patterns"], complexity: "High", resourceRequirements: "SEO + GBP + PPC teams", expectedImpact: "3–5x qualified leads" },
    activityTimeline: [
      { date: "May 7, 2025", event: "Proposal created", user: "Sarah K." },
      { date: "May 15, 2025", event: "Client approved", user: "Maria Chen" },
      { date: "May 20, 2025", event: "Contract generated", user: "Sarah K." },
      { date: "Jun 1, 2025", event: "Contract signed", user: "Maria Chen" },
    ],
  },
  // 5 — LSA Starter
  {
    id: "prop-005", name: "Blue Ridge Plumbing — LSA Starter", client: "Blue Ridge Plumbing", owner: "Sarah K.",
    services: ["GBP", "LSA"], status: "Draft", createdDate: "Jun 7, 2025",
    lineItems: [makeLI("li-gbp-001"), makeLI("li-lsa-001")],
    setupTotal: 950, recurringTotal: 1300, totalValue: 16550,
    discount: { type: "Fixed", value: 200, promoCode: "", managerApproval: false, approved: false },
    contract: { term: "Month-to-Month", customMonths: 1, startDate: "2025-07-01", endDate: "", noticePeriod: "30 days", autoRenew: true, cancellationTerms: "30-day written notice" },
    info: { client: "Blue Ridge Plumbing", opportunity: "OPP-005", owner: "Sarah K.", proposalDate: "Jun 7, 2025", expirationDate: "Jul 7, 2025" },
    aiSummary: { recommendedPackage: "Local Domination Package", revenueOpportunity: "$16,550 annual", riskFactors: ["LSA verification delays", "Seasonal plumbing demand"], complexity: "Low", resourceRequirements: "GBP + LSA specialists", expectedImpact: "50% increase in local call volume" },
    activityTimeline: [
      { date: "Jun 7, 2025", event: "Proposal created", user: "Sarah K." },
    ],
  },
  // 6 — Reporting Only
  {
    id: "prop-006", name: "Ridgeline Dentistry — Reporting Package", client: "Ridgeline Dentistry", owner: "Mike T.",
    services: ["Reporting"], status: "Internal Review", createdDate: "Jun 5, 2025",
    lineItems: [makeLI("li-report-001")],
    setupTotal: 400, recurringTotal: 300, totalValue: 4000,
    discount: { type: "None", value: 0, promoCode: "", managerApproval: false, approved: false },
    contract: { term: "6 Month", customMonths: 6, startDate: "2025-07-01", endDate: "2025-12-31", noticePeriod: "30 days", autoRenew: false, cancellationTerms: "30-day written notice" },
    info: { client: "Ridgeline Dentistry", opportunity: "OPP-006", owner: "Mike T.", proposalDate: "Jun 5, 2025", expirationDate: "Jul 5, 2025" },
    aiSummary: { recommendedPackage: "Reporting Starter", revenueOpportunity: "$4,000 contract", riskFactors: ["Limited data sources"], complexity: "Low", resourceRequirements: "Reporting team", expectedImpact: "Unified dashboard visibility" },
    activityTimeline: [
      { date: "Jun 5, 2025", event: "Proposal created", user: "Mike T." },
      { date: "Jun 9, 2025", event: "In internal review", user: "Jordan M." },
    ],
  },
  // 7 — Meta + Creative (Discount)
  {
    id: "prop-007", name: "Iron Mark Fitness — Meta + Creative", client: "Iron Mark Fitness", owner: "Mike T.",
    services: ["Meta", "Reporting"], status: "Accepted", createdDate: "May 18, 2025",
    lineItems: [makeLI("li-meta-001"), makeLI("li-meta-002"), makeLI("li-report-001")],
    setupTotal: 1300, recurringTotal: 1500, totalValue: 19300,
    discount: { type: "Promo Code", value: 15, promoCode: "FITNESSLAUNCH", managerApproval: true, approved: true },
    contract: { term: "12 Month", customMonths: 12, startDate: "2025-07-01", endDate: "2026-06-30", noticePeriod: "30 days", autoRenew: false, cancellationTerms: "60-day written notice" },
    info: { client: "Iron Mark Fitness", opportunity: "OPP-007", owner: "Mike T.", proposalDate: "May 18, 2025", expirationDate: "Jun 18, 2025" },
    aiSummary: { recommendedPackage: "Paid Media Accelerator", revenueOpportunity: "$19,300 ARR", riskFactors: ["Creative fatigue risk", "Audience saturation"], complexity: "Medium", resourceRequirements: "Meta Ads + Reporting", expectedImpact: "2–4x ROAS improvement" },
    activityTimeline: [
      { date: "May 18, 2025", event: "Proposal created", user: "Mike T." },
      { date: "Jun 5, 2025", event: "Client accepted with promo", user: "Jake Morris" },
    ],
  },
  // 8 — Large Multi-Service (Draft)
  {
    id: "prop-008", name: "Harbor Auto Group — Full Digital", client: "Harbor Auto Group", owner: "Mike T.",
    services: ["SEO", "PPC", "Website", "Reporting"], status: "Draft", createdDate: "Jun 6, 2025",
    lineItems: [makeLI("li-seo-001"), makeLI("li-seo-002"), makeLI("li-ppc-001"), makeLI("li-ppc-002"), makeLI("li-web-001"), makeLI("li-report-001")],
    setupTotal: 8500, recurringTotal: 3300, totalValue: 48100,
    discount: { type: "None", value: 0, promoCode: "", managerApproval: false, approved: false },
    contract: { term: "24 Month", customMonths: 24, startDate: "2025-08-01", endDate: "2027-07-31", noticePeriod: "60 days", autoRenew: false, cancellationTerms: "60-day written notice required" },
    info: { client: "Harbor Auto Group", opportunity: "OPP-008", owner: "Mike T.", proposalDate: "Jun 6, 2025", expirationDate: "Jul 6, 2025" },
    aiSummary: { recommendedPackage: "Full Digital Growth Stack", revenueOpportunity: "$48,100 ARR", riskFactors: ["Website dependency", "PPC access not confirmed"], complexity: "High", resourceRequirements: "SEO + PPC + Web + Reporting", expectedImpact: "3–5x qualified leads" },
    activityTimeline: [
      { date: "Jun 6, 2025", event: "Proposal created", user: "Mike T." },
    ],
  },
  // 9 — AI Automation
  {
    id: "prop-009", name: "TechNova SaaS — AI Automation Suite", client: "TechNova SaaS", owner: "Jordan M.",
    services: ["AI Automation", "SEO", "Reporting"], status: "Pending Approval", createdDate: "Jun 2, 2025",
    lineItems: [makeLI("li-ai-001"), makeLI("li-seo-002"), makeLI("li-report-001")],
    setupTotal: 2900, recurringTotal: 2300, totalValue: 30500,
    discount: { type: "None", value: 0, promoCode: "", managerApproval: false, approved: false },
    contract: { term: "12 Month", customMonths: 12, startDate: "2025-07-01", endDate: "2026-06-30", noticePeriod: "30 days", autoRenew: true, cancellationTerms: "30-day written notice" },
    info: { client: "TechNova SaaS", opportunity: "OPP-009", owner: "Jordan M.", proposalDate: "Jun 2, 2025", expirationDate: "Jul 2, 2025" },
    aiSummary: { recommendedPackage: "AI-Powered Marketing Suite", revenueOpportunity: "$30,500 ARR", riskFactors: ["API integration complexity", "Data privacy requirements"], complexity: "High", resourceRequirements: "AI & Automation + SEO + Reporting", expectedImpact: "60% reduction in manual tasks" },
    activityTimeline: [
      { date: "Jun 2, 2025", event: "Proposal created", user: "Jordan M." },
      { date: "Jun 8, 2025", event: "Submitted for manager approval", user: "Jordan M." },
    ],
  },
  // 10 — Hosting + Maintenance
  {
    id: "prop-010", name: "Valley Creek Bakery — Web + Hosting", client: "Valley Creek Bakery", owner: "Sarah K.",
    services: ["Website", "Hosting"], status: "Sent", createdDate: "Jun 1, 2025",
    lineItems: [makeLI("li-web-002"), makeLI("li-host-001")],
    setupTotal: 0, recurringTotal: 400, totalValue: 4800,
    discount: { type: "None", value: 0, promoCode: "", managerApproval: false, approved: false },
    contract: { term: "Month-to-Month", customMonths: 1, startDate: "2025-07-01", endDate: "", noticePeriod: "30 days", autoRenew: true, cancellationTerms: "30-day written notice" },
    info: { client: "Valley Creek Bakery", opportunity: "OPP-010", owner: "Sarah K.", proposalDate: "Jun 1, 2025", expirationDate: "Jul 1, 2025" },
    aiSummary: { recommendedPackage: "Website Care Package", revenueOpportunity: "$4,800 annual", riskFactors: ["Small ticket — low priority risk"], complexity: "Low", resourceRequirements: "Web team", expectedImpact: "100% uptime SLA, monthly health reports" },
    activityTimeline: [
      { date: "Jun 1, 2025", event: "Proposal created", user: "Sarah K." },
      { date: "Jun 5, 2025", event: "Sent to client", user: "Sarah K." },
    ],
  },
  // 11 — Renewal Proposal
  {
    id: "prop-011", name: "Summit Landscaping — 2026 Renewal", client: "Summit Landscaping", owner: "Jordan M.",
    services: ["SEO", "GBP"], status: "Draft", createdDate: "Jun 10, 2025",
    lineItems: [makeLI("li-seo-002"), makeLI("li-gbp-001")],
    setupTotal: 0, recurringTotal: 1700, totalValue: 20400,
    discount: { type: "Percentage", value: 5, promoCode: "", managerApproval: false, approved: true },
    contract: { term: "12 Month", customMonths: 12, startDate: "2026-08-01", endDate: "2027-07-31", noticePeriod: "30 days", autoRenew: true, cancellationTerms: "30-day written notice" },
    info: { client: "Summit Landscaping", opportunity: "OPP-011", owner: "Jordan M.", proposalDate: "Jun 10, 2025", expirationDate: "Jul 10, 2025" },
    aiSummary: { recommendedPackage: "Renewal — Local Domination", revenueOpportunity: "$20,400 ARR renewal", riskFactors: ["Competitor entering market"], complexity: "Low", resourceRequirements: "SEO + GBP teams", expectedImpact: "Retain 40–60% local visibility gains" },
    activityTimeline: [
      { date: "Jun 10, 2025", event: "Renewal proposal created", user: "Jordan M." },
    ],
  },
  // 12 — Upsell Proposal
  {
    id: "prop-012", name: "Metro Dental — Upsell: AI Automation", client: "Metro Dental Group", owner: "Jordan M.",
    services: ["AI Automation"], status: "Negotiation", createdDate: "Jun 8, 2025",
    lineItems: [makeLI("li-ai-001")],
    setupTotal: 2500, recurringTotal: 800, totalValue: 12100,
    discount: { type: "Percentage", value: 10, promoCode: "UPSELL10", managerApproval: true, approved: true },
    contract: { term: "12 Month", customMonths: 12, startDate: "2025-08-01", endDate: "2026-07-31", noticePeriod: "30 days", autoRenew: true, cancellationTerms: "30-day written notice" },
    info: { client: "Metro Dental Group", opportunity: "OPP-012", owner: "Jordan M.", proposalDate: "Jun 8, 2025", expirationDate: "Jul 8, 2025" },
    aiSummary: { recommendedPackage: "AI-Powered Marketing Suite", revenueOpportunity: "$12,100 ARR upsell", riskFactors: ["HIPAA AI compliance", "Integration complexity"], complexity: "High", resourceRequirements: "AI & Automation team", expectedImpact: "60% reduction in manual intake tasks" },
    activityTimeline: [
      { date: "Jun 8, 2025", event: "Upsell proposal created", user: "Jordan M." },
    ],
  },
  // 13 — GBP Only
  {
    id: "prop-013", name: "Rosewood Florist — GBP Management", client: "Rosewood Florist", owner: "Mike T.",
    services: ["GBP"], status: "Accepted", createdDate: "May 28, 2025",
    lineItems: [makeLI("li-gbp-001")],
    setupTotal: 350, recurringTotal: 500, totalValue: 6350,
    discount: { type: "None", value: 0, promoCode: "", managerApproval: false, approved: false },
    contract: { term: "12 Month", customMonths: 12, startDate: "2025-07-01", endDate: "2026-06-30", noticePeriod: "30 days", autoRenew: true, cancellationTerms: "30-day written notice" },
    info: { client: "Rosewood Florist", opportunity: "OPP-013", owner: "Mike T.", proposalDate: "May 28, 2025", expirationDate: "Jun 28, 2025" },
    aiSummary: { recommendedPackage: "GBP Starter", revenueOpportunity: "$6,350 ARR", riskFactors: ["Single-service risk"], complexity: "Low", resourceRequirements: "GBP specialist", expectedImpact: "30% increase in GBP profile views" },
    activityTimeline: [
      { date: "May 28, 2025", event: "Proposal created", user: "Mike T." },
      { date: "Jun 5, 2025", event: "Client accepted", user: "Rose Parker" },
    ],
  },
  // 14 — Full Service (Rejected)
  {
    id: "prop-014", name: "Apex Roofing — Full Service", client: "Apex Roofing", owner: "Sarah K.",
    services: ["SEO", "GBP", "PPC", "LSA", "Reporting"], status: "Rejected", createdDate: "May 10, 2025",
    lineItems: [makeLI("li-seo-001"), makeLI("li-seo-002"), makeLI("li-gbp-001"), makeLI("li-ppc-001"), makeLI("li-ppc-002"), makeLI("li-lsa-001"), makeLI("li-report-001")],
    setupTotal: 4100, recurringTotal: 4900, totalValue: 62900,
    discount: { type: "None", value: 0, promoCode: "", managerApproval: false, approved: false },
    contract: { term: "24 Month", customMonths: 24, startDate: "2025-07-01", endDate: "2027-06-30", noticePeriod: "60 days", autoRenew: false, cancellationTerms: "60-day written notice" },
    info: { client: "Apex Roofing", opportunity: "OPP-014", owner: "Sarah K.", proposalDate: "May 10, 2025", expirationDate: "Jun 10, 2025" },
    aiSummary: { recommendedPackage: "Full Digital Growth Stack", revenueOpportunity: "$62,900 ARR", riskFactors: ["Budget too large for client stage", "Seasonal roofing market"], complexity: "High", resourceRequirements: "All departments", expectedImpact: "Rejected — budget mismatch" },
    activityTimeline: [
      { date: "May 10, 2025", event: "Proposal created", user: "Sarah K." },
      { date: "May 25, 2025", event: "Sent to client", user: "Sarah K." },
      { date: "Jun 3, 2025", event: "Client rejected — budget concern", user: "Tom Apex" },
    ],
  },
  // 15 — SEO + AI Automation
  {
    id: "prop-015", name: "GreenLeaf HVAC — SEO + AI", client: "GreenLeaf HVAC", owner: "Jordan M.",
    services: ["SEO", "AI Automation", "Reporting"], status: "Sent", createdDate: "Jun 3, 2025",
    lineItems: [makeLI("li-seo-001"), makeLI("li-seo-002"), makeLI("li-ai-001"), makeLI("li-report-001")],
    setupTotal: 4400, recurringTotal: 2300, totalValue: 31600,
    discount: { type: "None", value: 0, promoCode: "", managerApproval: false, approved: false },
    contract: { term: "12 Month", customMonths: 12, startDate: "2025-07-15", endDate: "2026-07-14", noticePeriod: "30 days", autoRenew: true, cancellationTerms: "30-day written notice" },
    info: { client: "GreenLeaf HVAC", opportunity: "OPP-015", owner: "Jordan M.", proposalDate: "Jun 3, 2025", expirationDate: "Jul 3, 2025" },
    aiSummary: { recommendedPackage: "AI-Powered Marketing Suite", revenueOpportunity: "$31,600 ARR", riskFactors: ["AI integration complexity"], complexity: "High", resourceRequirements: "SEO + AI & Automation + Reporting", expectedImpact: "25% conversion rate improvement" },
    activityTimeline: [
      { date: "Jun 3, 2025", event: "Proposal created", user: "Jordan M." },
      { date: "Jun 9, 2025", event: "Sent to client", user: "Jordan M." },
    ],
  },
  // 16 — Expired
  {
    id: "prop-016", name: "Clearwater Legal — SEO", client: "Clearwater Legal", owner: "Mike T.",
    services: ["SEO"], status: "Expired", createdDate: "Apr 15, 2025",
    lineItems: [makeLI("li-seo-001"), makeLI("li-seo-002")],
    setupTotal: 1500, recurringTotal: 1200, totalValue: 15900,
    discount: { type: "None", value: 0, promoCode: "", managerApproval: false, approved: false },
    contract: { term: "12 Month", customMonths: 12, startDate: "2025-06-01", endDate: "2026-05-31", noticePeriod: "30 days", autoRenew: false, cancellationTerms: "30-day written notice" },
    info: { client: "Clearwater Legal", opportunity: "OPP-016", owner: "Mike T.", proposalDate: "Apr 15, 2025", expirationDate: "May 15, 2025" },
    aiSummary: { recommendedPackage: "SEO Starter", revenueOpportunity: "$15,900 ARR (expired)", riskFactors: ["No response from client"], complexity: "Low", resourceRequirements: "SEO team", expectedImpact: "Proposal expired — follow-up needed" },
    activityTimeline: [
      { date: "Apr 15, 2025", event: "Proposal created", user: "Mike T." },
      { date: "Apr 20, 2025", event: "Sent to client", user: "Mike T." },
      { date: "May 16, 2025", event: "Proposal expired", user: "System" },
    ],
  },
  // 17 — Meta Ads Only
  {
    id: "prop-017", name: "Bella Boutique — Meta Ads", client: "Bella Boutique", owner: "Sarah K.",
    services: ["Meta", "Reporting"], status: "Accepted", createdDate: "May 20, 2025",
    lineItems: [makeLI("li-meta-001"), makeLI("li-meta-002"), makeLI("li-report-001")],
    setupTotal: 1300, recurringTotal: 1500, totalValue: 19300,
    discount: { type: "Percentage", value: 5, promoCode: "", managerApproval: false, approved: true },
    contract: { term: "6 Month", customMonths: 6, startDate: "2025-07-01", endDate: "2025-12-31", noticePeriod: "30 days", autoRenew: true, cancellationTerms: "30-day written notice" },
    info: { client: "Bella Boutique", opportunity: "OPP-017", owner: "Sarah K.", proposalDate: "May 20, 2025", expirationDate: "Jun 20, 2025" },
    aiSummary: { recommendedPackage: "Paid Media Accelerator", revenueOpportunity: "$19,300 ARR", riskFactors: ["Creative fatigue", "Seasonal product demand"], complexity: "Medium", resourceRequirements: "Meta Ads + Reporting", expectedImpact: "2–4x ROAS improvement" },
    activityTimeline: [
      { date: "May 20, 2025", event: "Proposal created", user: "Sarah K." },
      { date: "May 28, 2025", event: "Client accepted", user: "Isabella Kwan" },
    ],
  },
  // 18 — Strategy Consulting
  {
    id: "prop-018", name: "PeakPath Consulting — Digital Strategy", client: "PeakPath Consulting", owner: "Jordan M.",
    services: ["Strategy", "Reporting"], status: "Internal Review", createdDate: "Jun 7, 2025",
    lineItems: [makeLI("li-strategy-001"), makeLI("li-report-001")],
    setupTotal: 400, recurringTotal: 900, totalValue: 11200,
    discount: { type: "None", value: 0, promoCode: "", managerApproval: false, approved: false },
    contract: { term: "6 Month", customMonths: 6, startDate: "2025-07-01", endDate: "2025-12-31", noticePeriod: "30 days", autoRenew: false, cancellationTerms: "30-day written notice" },
    info: { client: "PeakPath Consulting", opportunity: "OPP-018", owner: "Jordan M.", proposalDate: "Jun 7, 2025", expirationDate: "Jul 7, 2025" },
    aiSummary: { recommendedPackage: "Strategy + Analytics", revenueOpportunity: "$11,200 contract", riskFactors: ["Low recurring commitment"], complexity: "Medium", resourceRequirements: "Strategy + Reporting teams", expectedImpact: "Clear digital roadmap + monthly insights" },
    activityTimeline: [
      { date: "Jun 7, 2025", event: "Proposal created", user: "Jordan M." },
      { date: "Jun 9, 2025", event: "In internal review", user: "Sarah K." },
    ],
  },
  // 19 — Renewal Proposal (Large)
  {
    id: "prop-019", name: "Coastal Wellness — 2026 Renewal + Upsell", client: "Coastal Wellness Spa", owner: "Sarah K.",
    services: ["SEO", "GBP", "PPC", "AI Automation"], status: "Draft", createdDate: "Jun 10, 2025",
    lineItems: [makeLI("li-seo-002"), makeLI("li-gbp-001"), makeLI("li-ppc-002"), makeLI("li-ai-001")],
    setupTotal: 2500, recurringTotal: 4000, totalValue: 50500,
    discount: { type: "Percentage", value: 8, promoCode: "RENEWAL8", managerApproval: true, approved: false },
    contract: { term: "12 Month", customMonths: 12, startDate: "2026-06-01", endDate: "2027-05-31", noticePeriod: "30 days", autoRenew: true, cancellationTerms: "30-day written notice" },
    info: { client: "Coastal Wellness Spa", opportunity: "OPP-019", owner: "Sarah K.", proposalDate: "Jun 10, 2025", expirationDate: "Jul 10, 2025" },
    aiSummary: { recommendedPackage: "Full Digital Growth Stack + AI", revenueOpportunity: "$50,500 ARR", riskFactors: ["Promo approval pending", "AI integration complexity"], complexity: "High", resourceRequirements: "SEO + GBP + PPC + AI teams", expectedImpact: "Maintain 3–5x leads + AI efficiency gains" },
    activityTimeline: [
      { date: "Jun 10, 2025", event: "Renewal + upsell proposal created", user: "Sarah K." },
    ],
  },
  // 20 — Upsell Hosting + AI
  {
    id: "prop-020", name: "Valley Creek Bakery — Upsell: SEO + AI", client: "Valley Creek Bakery", owner: "Sarah K.",
    services: ["SEO", "AI Automation"], status: "Sent", createdDate: "Jun 9, 2025",
    lineItems: [makeLI("li-seo-001"), makeLI("li-seo-002"), makeLI("li-ai-001")],
    setupTotal: 4000, recurringTotal: 2000, totalValue: 28000,
    discount: { type: "Fixed", value: 500, promoCode: "", managerApproval: false, approved: true },
    contract: { term: "12 Month", customMonths: 12, startDate: "2025-08-01", endDate: "2026-07-31", noticePeriod: "30 days", autoRenew: true, cancellationTerms: "30-day written notice" },
    info: { client: "Valley Creek Bakery", opportunity: "OPP-020", owner: "Sarah K.", proposalDate: "Jun 9, 2025", expirationDate: "Jul 9, 2025" },
    aiSummary: { recommendedPackage: "AI-Powered Marketing Suite", revenueOpportunity: "$28,000 ARR upsell", riskFactors: ["Small business capacity constraints"], complexity: "High", resourceRequirements: "SEO + AI & Automation", expectedImpact: "25% conversion improvement + automated customer journeys" },
    activityTimeline: [
      { date: "Jun 9, 2025", event: "Upsell proposal created", user: "Sarah K." },
      { date: "Jun 10, 2025", event: "Sent to client", user: "Sarah K." },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Style Maps
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<ProposalStatus, { bg: string; text: string; border: string }> = {
  "Draft":                 { bg: "#F3F4F6", text: "#6B7280", border: "#D1D5DB" },
  "Internal Review":       { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  "Pending Approval":      { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A" },
  "Sent":                  { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  "Negotiation":           { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE" },
  "Accepted":              { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  "Rejected":              { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
  "Expired":               { bg: "#F3F4F6", text: "#9CA3AF", border: "#D1D5DB" },
  "Converted To Contract": { bg: "#ECFDF5", text: "#047857", border: "#A7F3D0" },
};

const CATEGORY_STYLES: Record<ServiceCategory, { bg: string; text: string; border: string }> = {
  "SEO":          { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  "GBP":          { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  "PPC":          { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  "Meta":         { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE" },
  "Website":      { bg: "#FEFCE8", text: "#A16207", border: "#FDE68A" },
  "Hosting":      { bg: "#F0F9FF", text: "#0369A1", border: "#BAE6FD" },
  "AI Automation":{ bg: "#FDF4FF", text: "#7E22CE", border: "#E9D5FF" },
  "Reporting":    { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
  "Creative":     { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
  "Strategy":     { bg: "#F8FAFC", text: "#334155", border: "#CBD5E1" },
  "LSA":          { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A" },
  "Consulting":   { bg: "#F5F3FF", text: "#4C1D95", border: "#C4B5FD" },
};

const DELIVERY_STYLES: Record<DeliveryStandard, { bg: string; text: string }> = {
  "Standard": { bg: "#F3F4F6", text: "#374151" },
  "Priority": { bg: "#EFF6FF", text: "#1D4ED8" },
  "Rush":     { bg: "#FFF1F2", text: "#BE123C" },
  "Custom":   { bg: "#F5F3FF", text: "#6D28D9" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;
const fmtK = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `$${n}`;

function calcDiscount(base: number, d: Discount): number {
  if (d.type === "None") return 0;
  if (d.type === "Fixed") return d.value;
  if (d.type === "Percentage" || d.type === "Promo Code" || d.type === "Package") return base * (d.value / 100);
  return 0;
}

function termMonths(c: ContractConfig): number {
  if (c.term === "Month-to-Month") return 12; // annualize for display
  if (c.term === "6 Month") return 6;
  if (c.term === "12 Month") return 12;
  if (c.term === "24 Month") return 24;
  if (c.term === "Custom") return c.customMonths;
  return 12;
}

// ─────────────────────────────────────────────────────────────────────────────
// Primitive Components
// ─────────────────────────────────────────────────────────────────────────────

function Badge({ label, bg, text, border }: { label: string; bg: string; text: string; border?: string }) {
  return (
    <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap"
      style={{ background: bg, color: text, borderColor: border ?? "transparent" }}>
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: ProposalStatus }) {
  const s = STATUS_STYLES[status];
  return <Badge label={status} bg={s.bg} text={s.text} border={s.border} />;
}

function CategoryBadge({ cat }: { cat: ServiceCategory }) {
  const s = CATEGORY_STYLES[cat];
  return <Badge label={cat} bg={s.bg} text={s.text} border={s.border} />;
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border ${className ?? ""}`}
      style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
      {children}
    </div>
  );
}

function CardHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="px-5 py-4 border-b flex items-center justify-between gap-3 flex-wrap"
      style={{ borderColor: "var(--rtm-border)" }}>
      <div>
        <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>{title}</p>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

function Btn({
  children, onClick, variant = "default", size = "sm"
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "primary" | "success" | "danger" | "warning";
  size?: "xs" | "sm";
}) {
  const styles = {
    default:  { bg: "var(--rtm-surface)", text: "var(--rtm-text-secondary)", border: "var(--rtm-border)" },
    primary:  { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
    success:  { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
    danger:   { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
    warning:  { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  };
  const s = styles[variant];
  const pad = size === "xs" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1.5 text-xs";
  return (
    <button onClick={onClick} className={`${pad} font-semibold rounded-lg border transition-all hover:opacity-90`}
      style={{ background: s.bg, color: s.text, borderColor: s.border }}>
      {children}
    </button>
  );
}

function Input({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>
        {label}
      </label>
      <input type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-xs rounded-lg border px-3 py-2 focus:outline-none"
        style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }} />
    </div>
  );
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>
        {label}
      </label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full text-xs rounded-lg border px-3 py-2 focus:outline-none"
        style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI Cards
// ─────────────────────────────────────────────────────────────────────────────

function DashboardKPIs({ proposals }: { proposals: Proposal[] }) {
  const draft     = proposals.filter(p => p.status === "Draft").length;
  const pending   = proposals.filter(p => p.status === "Pending Approval" || p.status === "Internal Review").length;
  const sent      = proposals.filter(p => p.status === "Sent" || p.status === "Negotiation").length;
  const accepted  = proposals.filter(p => p.status === "Accepted" || p.status === "Converted To Contract").length;
  const rejected  = proposals.filter(p => p.status === "Rejected" || p.status === "Expired").length;
  const estRev    = proposals.filter(p => ["Accepted","Converted To Contract","Negotiation","Sent"].includes(p.status))
                    .reduce((s, p) => s + p.recurringTotal, 0);
  const pipeline  = proposals.filter(p => !["Rejected","Expired"].includes(p.status))
                    .reduce((s, p) => s + p.totalValue, 0);

  const cards = [
    { label: "Draft Proposals",   value: String(draft),      icon: "📝", bg: "#F3F4F6", text: "#6B7280", border: "#D1D5DB" },
    { label: "Pending Approval",  value: String(pending),    icon: "🔄", bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
    { label: "Sent Proposals",    value: String(sent),       icon: "📤", bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
    { label: "Accepted",          value: String(accepted),   icon: "✅", bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
    { label: "Rejected/Expired",  value: String(rejected),   icon: "❌", bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
    { label: "Est. Monthly Rev.", value: fmtK(estRev),       icon: "💰", bg: "#F0FDF4", text: "#047857", border: "#A7F3D0" },
    { label: "Pipeline Value",    value: fmtK(pipeline),     icon: "📊", bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border p-4 text-center"
          style={{ background: c.bg, borderColor: c.border }}>
          <div className="text-xl mb-1">{c.icon}</div>
          <div className="text-xl font-black" style={{ color: c.text }}>{c.value}</div>
          <div className="text-[10px] font-semibold mt-0.5 leading-tight" style={{ color: c.text }}>{c.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Proposal Table
// ─────────────────────────────────────────────────────────────────────────────

function ProposalTable({ proposals, onSelect, onBuild }: {
  proposals: Proposal[];
  onSelect: (p: Proposal) => void;
  onBuild: (p: Proposal) => void;
}) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<ProposalStatus | "All">("All");

  const filtered = useMemo(() => proposals.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q) || p.client.toLowerCase().includes(q) || p.owner.toLowerCase().includes(q);
    const matchStatus = filterStatus === "All" || p.status === filterStatus;
    return matchSearch && matchStatus;
  }), [proposals, search, filterStatus]);

  const statusOptions: Array<ProposalStatus | "All"> = ["All","Draft","Internal Review","Pending Approval","Sent","Negotiation","Accepted","Rejected","Expired","Converted To Contract"];

  return (
    <Card>
      <CardHeader title="📋 All Proposals"
        subtitle={`${filtered.length} of ${proposals.length} proposals`}
        actions={
          <>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search proposals…"
              className="text-xs rounded-lg border px-3 py-1.5 focus:outline-none w-44"
              style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }} />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as ProposalStatus | "All")}
              className="text-xs rounded-lg border px-3 py-1.5 focus:outline-none"
              style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}>
              {statusOptions.map(s => <option key={s}>{s}</option>)}
            </select>
          </>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full text-xs" style={{ borderCollapse: "collapse", minWidth: "1100px" }}>
          <thead>
            <tr style={{ background: "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border)" }}>
              {["Proposal Name","Client","Owner","Services","Setup Fees","Recurring Fees","Total Value","Status","Created","Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
                  style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} className="hover:bg-blue-50 transition-colors cursor-pointer"
                style={{ borderBottom: "1px solid var(--rtm-border-light)", background: i % 2 === 0 ? "transparent" : "var(--rtm-surface)" }}
                onClick={() => onSelect(p)}>
                <td className="px-4 py-3 font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                  {p.name}
                </td>
                <td className="px-4 py-3" style={{ color: "var(--rtm-text-secondary)" }}>{p.client}</td>
                <td className="px-4 py-3" style={{ color: "var(--rtm-text-secondary)" }}>{p.owner}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {p.services.slice(0, 3).map(s => <CategoryBadge key={s} cat={s} />)}
                    {p.services.length > 3 && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                        style={{ background: "#F3F4F6", color: "#6B7280" }}>+{p.services.length - 3}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold" style={{ color: "#C2410C" }}>{fmt(p.setupTotal)}</td>
                <td className="px-4 py-3 font-semibold" style={{ color: "#1D4ED8" }}>{fmt(p.recurringTotal)}/mo</td>
                <td className="px-4 py-3 font-bold" style={{ color: "#047857" }}>{fmt(p.totalValue)}</td>
                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{p.createdDate}</td>
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <div className="flex gap-1.5">
                    <Btn size="xs" variant="primary" onClick={() => onSelect(p)}>View</Btn>
                    <Btn size="xs" variant="default" onClick={() => onBuild(p)}>Edit</Btn>
                    {p.status === "Accepted" && (
                      <Btn size="xs" variant="success" onClick={() => alert(`[Mock] Generating contract for ${p.name}`)}>Contract</Btn>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="px-4 py-12 text-center">
            <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>No proposals match your filters.</p>
          </div>
        )}
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Proposal Builder — Info Panel
// ─────────────────────────────────────────────────────────────────────────────

function ProposalInfoForm({ info, onChange }: {
  info: ProposalInfo;
  onChange: (k: keyof ProposalInfo, v: string) => void;
}) {
  return (
    <Card>
      <CardHeader title="📄 Proposal Information" />
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Input label="Client" value={info.client} onChange={v => onChange("client", v)} placeholder="Client name" />
        <Input label="Opportunity" value={info.opportunity} onChange={v => onChange("opportunity", v)} placeholder="OPP-XXX" />
        <Input label="Proposal Owner" value={info.owner} onChange={v => onChange("owner", v)} placeholder="Sales rep name" />
        <Input label="Proposal Date" value={info.proposalDate} onChange={v => onChange("proposalDate", v)} type="date" />
        <Input label="Expiration Date" value={info.expirationDate} onChange={v => onChange("expirationDate", v)} type="date" />
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Service Selection
// ─────────────────────────────────────────────────────────────────────────────

function ServiceSelection({ selectedLineItems, onAdd, onRemove }: {
  selectedLineItems: LineItem[];
  onAdd: (li: LineItem) => void;
  onRemove: (id: string) => void;
}) {
  const [showCatalog, setShowCatalog] = useState(false);

  const selectedIds = new Set(selectedLineItems.map(l => l.id));

  return (
    <Card>
      <CardHeader title="🛒 Service Selection"
        subtitle="Add services, AI recommendations, or audit findings"
        actions={
          <>
            <Btn variant="primary" onClick={() => setShowCatalog(!showCatalog)}>+ Add Service</Btn>
            <Btn variant="warning" onClick={() => alert("[Mock] AI Recommendation mode — analyzing audit findings…")}>+ AI Recommendation</Btn>
            <Btn variant="default" onClick={() => alert("[Mock] Add from audit findings…")}>+ Audit Finding</Btn>
          </>
        }
      />
      <div className="p-5 space-y-3">
        {selectedLineItems.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center" style={{ borderColor: "var(--rtm-border)" }}>
            <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>No services selected. Add from the catalog below.</p>
          </div>
        )}
        {selectedLineItems.map(li => (
          <div key={li.id} className="flex items-center justify-between px-4 py-3 rounded-lg border"
            style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}>
            <div className="flex items-center gap-3">
              <CategoryBadge cat={li.category} />
              <div>
                <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{li.name}</p>
                <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{li.department} · {li.taskBlueprint}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold" style={{ color: "#C2410C" }}>{li.setupFee > 0 ? fmt(li.setupFee) + " setup" : ""}</span>
              <span className="text-xs font-bold" style={{ color: "#1D4ED8" }}>{li.recurringFee > 0 ? fmt(li.recurringFee) + "/mo" : ""}</span>
              <Btn size="xs" variant="danger" onClick={() => onRemove(li.id)}>Remove</Btn>
            </div>
          </div>
        ))}

        {showCatalog && (
          <div className="mt-4 space-y-2 pt-4 border-t" style={{ borderColor: "var(--rtm-border)" }}>
            <p className="text-xs font-bold" style={{ color: "var(--rtm-text-muted)" }}>SERVICE CATALOG</p>
            {LINE_ITEM_CATALOG.map(li => (
              <div key={li.id} className="flex items-center justify-between px-4 py-3 rounded-lg border"
                style={{ background: selectedIds.has(li.id) ? "#F0FDF4" : "var(--rtm-bg)", borderColor: selectedIds.has(li.id) ? "#A7F3D0" : "var(--rtm-border)" }}>
                <div className="flex items-center gap-3">
                  <CategoryBadge cat={li.category} />
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{li.name}</p>
                    <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{li.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {li.setupFee > 0 && <span className="text-xs" style={{ color: "#C2410C" }}>{fmt(li.setupFee)} setup</span>}
                  {li.recurringFee > 0 && <span className="text-xs" style={{ color: "#1D4ED8" }}>{fmt(li.recurringFee)}/mo</span>}
                  {selectedIds.has(li.id)
                    ? <Badge label="✓ Added" bg="#F0FDF4" text="#15803D" border="#BBF7D0" />
                    : <Btn size="xs" variant="primary" onClick={() => onAdd(li)}>Add</Btn>
                  }
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Line Item Builder
// ─────────────────────────────────────────────────────────────────────────────

function LineItemBuilder({ lineItems, onUpdate, onRemove, onClone }: {
  lineItems: LineItem[];
  onUpdate: (id: string, key: keyof LineItem, value: unknown) => void;
  onRemove: (id: string) => void;
  onClone: (id: string) => void;
}) {
  if (lineItems.length === 0) {
    return (
      <Card>
        <CardHeader title="📦 Line Item Builder" />
        <div className="p-8 text-center">
          <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>No line items added yet. Add services above.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="📦 Line Item Builder"
        subtitle={`${lineItems.length} line item${lineItems.length !== 1 ? "s" : ""}`} />
      <div className="overflow-x-auto">
        <table className="w-full text-xs" style={{ borderCollapse: "collapse", minWidth: "1200px" }}>
          <thead>
            <tr style={{ background: "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border)" }}>
              {["Line Item","Department","Category","Setup Fee","Recurring Fee","Qty","Delivery Std.","Task Blueprint","Dependencies","Status","Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
                  style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lineItems.map((li, i) => (
              <tr key={li.id} style={{ borderBottom: "1px solid var(--rtm-border-light)", background: i % 2 === 0 ? "transparent" : "var(--rtm-surface)" }}>
                <td className="px-4 py-3 font-semibold min-w-[200px]" style={{ color: "var(--rtm-text-primary)" }}>
                  {li.name}
                </td>
                <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{li.department}</td>
                <td className="px-4 py-3"><CategoryBadge cat={li.category} /></td>
                <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: "#C2410C" }}>
                  {li.setupFee > 0 ? fmt(li.setupFee) : "—"}
                </td>
                <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: "#1D4ED8" }}>
                  {li.recurringFee > 0 ? `${fmt(li.recurringFee)}/mo` : "—"}
                </td>
                <td className="px-4 py-3">
                  <input type="number" min={1} max={10} value={li.quantity}
                    onChange={e => onUpdate(li.id, "quantity", parseInt(e.target.value) || 1)}
                    className="w-14 text-xs rounded border px-2 py-1 text-center focus:outline-none"
                    style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }} />
                </td>
                <td className="px-4 py-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: DELIVERY_STYLES[li.deliveryStandard].bg, color: DELIVERY_STYLES[li.deliveryStandard].text }}>
                    {li.deliveryStandard}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: "#F5F3FF", color: "#6D28D9" }}>{li.taskBlueprint}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {li.dependencies.map(d => (
                      <span key={d} className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                        style={{ background: "#FFF7ED", color: "#C2410C" }}>{d}</span>
                    ))}
                    {li.dependencies.length === 0 && <span style={{ color: "var(--rtm-text-muted)" }}>—</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: li.status === "Active" ? "#F0FDF4" : "#FFF7ED",
                      color: li.status === "Active" ? "#15803D" : "#C2410C",
                    }}>
                    {li.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Btn size="xs" variant="primary" onClick={() => alert(`[Mock] Edit: ${li.name}`)}>Edit</Btn>
                    <Btn size="xs" variant="default" onClick={() => onClone(li.id)}>Clone</Btn>
                    <Btn size="xs" variant="danger" onClick={() => onRemove(li.id)}>Remove</Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Budget Builder
// ─────────────────────────────────────────────────────────────────────────────

function BudgetBuilder({ onRecommend }: { onRecommend: (pkg: AIRecommendation) => void }) {
  const [budget, setBudget] = useState("3500");
  const [mode, setMode] = useState<AIModeOption>("Budget Match");
  const [showResults, setShowResults] = useState(false);
  const [targetMonthly, setTargetMonthly] = useState("2000");
  const [targetProject, setTargetProject] = useState("10000");

  const bv = parseInt(budget.replace(/\D/g, "")) || 0;

  const matches = AI_PACKAGES.filter(p => {
    if (mode === "Budget Match") return p.estimatedRevenue <= bv * 1.1;
    if (mode === "Growth Package") return p.estimatedRevenue >= bv * 0.8 && p.estimatedRevenue <= bv * 1.5;
    if (mode === "Full Service") return p.services.length >= 3;
    return p.estimatedRevenue <= 2500;
  });

  return (
    <Card>
      <CardHeader title="💰 Budget Builder" subtitle="Enter client budget to get AI-powered package recommendations" />
      <div className="p-5 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>
              Client Budget
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold" style={{ color: "var(--rtm-text-muted)" }}>$</span>
              <input value={budget} onChange={e => setBudget(e.target.value)}
                className="w-full text-sm font-bold rounded-lg border pl-7 pr-3 py-2.5 focus:outline-none"
                style={{ background: "var(--rtm-bg)", borderColor: "#1D4ED8", color: "#1D4ED8" }} />
            </div>
          </div>
          <Input label="Target Monthly Budget" value={targetMonthly} onChange={setTargetMonthly} placeholder="2000" />
          <Input label="Target Project Budget" value={targetProject} onChange={setTargetProject} placeholder="10000" />
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wide block mb-2" style={{ color: "var(--rtm-text-muted)" }}>AI Recommendation Mode</label>
          <div className="flex flex-wrap gap-2">
            {(["Budget Match","Growth Package","Full Service","Starter"] as AIModeOption[]).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all"
                style={{
                  background: mode === m ? "#1D4ED8" : "var(--rtm-surface)",
                  color: mode === m ? "#fff" : "var(--rtm-text-secondary)",
                  borderColor: mode === m ? "#1D4ED8" : "var(--rtm-border)",
                }}>
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Btn variant="primary" onClick={() => setShowResults(true)}>🤖 Recommend Services</Btn>
          <Btn variant="warning" onClick={() => setShowResults(true)}>📦 Recommend Packages</Btn>
          <Btn variant="default" onClick={() => setShowResults(true)}>📋 Recommend Line Items</Btn>
        </div>

        {showResults && (
          <div className="space-y-3 pt-2 border-t" style={{ borderColor: "var(--rtm-border)" }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                AI Recommendations for {fmt(bv)} budget ({mode})
              </span>
              <Badge label={`${matches.length} packages`} bg="#EFF6FF" text="#1D4ED8" border="#BFDBFE" />
            </div>

            {matches.length === 0 && (
              <div className="rounded-lg border p-4 text-center" style={{ background: "#FFF7ED", borderColor: "#FED7AA" }}>
                <p className="text-xs" style={{ color: "#C2410C" }}>No packages match this budget range. Try increasing your budget or switching to Starter mode.</p>
              </div>
            )}

            {matches.map(pkg => (
              <AIPackageCard key={pkg.packageName} pkg={pkg} onAdd={() => onRecommend(pkg)} />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Package Recommendation Card
// ─────────────────────────────────────────────────────────────────────────────

function AIPackageCard({ pkg, onAdd }: { pkg: AIRecommendation; onAdd: () => void }) {
  const conf = pkg.confidenceScore;
  const confColor = conf >= 90 ? "#059669" : conf >= 80 ? "#D97706" : "#DC2626";
  const confBg = conf >= 90 ? "#F0FDF4" : conf >= 80 ? "#FFFBEB" : "#FFF1F2";

  return (
    <div className="rounded-xl border p-5" style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>📦 {pkg.packageName}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: confBg, color: confColor }}>
              {conf}% confidence
            </span>
          </div>
          <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{pkg.reasoning}</p>
        </div>
        <Btn variant="success" onClick={onAdd}>+ Add To Proposal</Btn>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg p-3" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
          <p className="text-[10px] font-bold mb-1" style={{ color: "#1D4ED8" }}>Recommended Services</p>
          <div className="flex flex-wrap gap-1">
            {pkg.services.map(s => <CategoryBadge key={s} cat={s as ServiceCategory} />)}
          </div>
        </div>
        <div className="rounded-lg p-3" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
          <p className="text-[10px] font-bold mb-1" style={{ color: "#15803D" }}>Expected Impact</p>
          <p className="text-xs font-semibold" style={{ color: "#047857" }}>{pkg.expectedImpact}</p>
        </div>
        <div className="rounded-lg p-3" style={{ background: "#FFF7ED", border: "1px solid #FED7AA" }}>
          <p className="text-[10px] font-bold mb-1" style={{ color: "#C2410C" }}>Estimated Revenue</p>
          <p className="text-sm font-black" style={{ color: "#C2410C" }}>{fmt(pkg.estimatedRevenue)}/mo</p>
        </div>
        <div className="rounded-lg p-3" style={{ background: "#F5F3FF", border: "1px solid #DDD6FE" }}>
          <p className="text-[10px] font-bold mb-1" style={{ color: "#6D28D9" }}>Confidence Score</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-full h-2" style={{ background: "#E5E7EB" }}>
              <div className="h-2 rounded-full" style={{ width: `${conf}%`, background: confColor }} />
            </div>
            <span className="text-xs font-bold" style={{ color: confColor }}>{conf}%</span>
          </div>
        </div>
      </div>
      <div className="mt-3">
        <p className="text-[10px] font-bold mb-1" style={{ color: "var(--rtm-text-muted)" }}>RECOMMENDED LINE ITEMS</p>
        <div className="flex flex-wrap gap-1">
          {pkg.lineItems.map(l => (
            <span key={l} className="text-[10px] px-2 py-0.5 rounded-full border"
              style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}>
              {l}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Discount Panel
// ─────────────────────────────────────────────────────────────────────────────

function DiscountPanel({ discount, onUpdate, setupTotal, recurringTotal }: {
  discount: Discount;
  onUpdate: (d: Discount) => void;
  setupTotal: number;
  recurringTotal: number;
}) {
  const base = setupTotal + recurringTotal * 12;
  const discountAmt = calcDiscount(base, discount);
  const finalPrice = base - discountAmt;

  return (
    <Card>
      <CardHeader title="🏷️ Discounts & Promo Codes" />
      <div className="p-5 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select label="Discount Type"
            value={discount.type}
            onChange={v => onUpdate({ ...discount, type: v as DiscountType })}
            options={["None","Fixed","Percentage","Promo Code","Package"]} />
          {discount.type !== "None" && (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>
                {discount.type === "Fixed" ? "Discount Amount ($)" : "Discount (%)"}
              </label>
              <input type="number" min={0} value={discount.value}
                onChange={e => onUpdate({ ...discount, value: parseFloat(e.target.value) || 0 })}
                className="w-full text-xs rounded-lg border px-3 py-2 focus:outline-none"
                style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }} />
            </div>
          )}
          <Input label="Promo Code" value={discount.promoCode}
            onChange={v => onUpdate({ ...discount, promoCode: v })} placeholder="e.g. LAUNCH20" />
          <div className="flex flex-col gap-2 justify-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={discount.managerApproval}
                onChange={e => onUpdate({ ...discount, managerApproval: e.target.checked })}
                className="rounded" />
              <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>Manager Approval Required</span>
            </label>
            {discount.managerApproval && (
              <Badge label={discount.approved ? "✓ Approved" : "⏳ Pending Approval"}
                bg={discount.approved ? "#F0FDF4" : "#FFF7ED"}
                text={discount.approved ? "#15803D" : "#C2410C"}
                border={discount.approved ? "#BBF7D0" : "#FED7AA"} />
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-2">
          {[
            { label: "Original Price", value: fmt(base), bg: "#F3F4F6", text: "#6B7280", border: "#D1D5DB" },
            { label: "Discount", value: discountAmt > 0 ? `-${fmt(discountAmt)}` : "—", bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
            { label: "Final Price", value: fmt(finalPrice), bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
          ].map(r => (
            <div key={r.label} className="rounded-xl border p-4 text-center" style={{ background: r.bg, borderColor: r.border }}>
              <p className="text-[10px] font-bold" style={{ color: r.text }}>{r.label}</p>
              <p className="text-lg font-black mt-1" style={{ color: r.text }}>{r.value}</p>
            </div>
          ))}
        </div>

        {discount.promoCode && (
          <div className="rounded-lg border px-4 py-3 flex items-center gap-2"
            style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}>
            <span className="text-sm">🎟️</span>
            <p className="text-xs font-semibold" style={{ color: "#047857" }}>
              Promo code <strong>{discount.promoCode}</strong> applied.
              {!discount.approved && " Pending manager approval."}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pricing Summary
// ─────────────────────────────────────────────────────────────────────────────

function PricingSummary({ lineItems, discount }: { lineItems: LineItem[]; discount: Discount }) {
  const setupFees = lineItems.reduce((s, l) => s + l.setupFee * l.quantity, 0);
  const monthlyFees = lineItems.reduce((s, l) => s + l.recurringFee * l.quantity, 0);
  const annualFees = monthlyFees * 12;
  const base = setupFees + annualFees;
  const discountAmt = calcDiscount(base, discount);
  const grandTotal = base - discountAmt;

  return (
    <Card>
      <CardHeader title="💵 Pricing Summary" />
      <div className="p-5 space-y-3">
        <div className="space-y-2">
          {[
            { label: "One-Time Setup Fees", value: fmt(setupFees), color: "#C2410C", bold: false },
            { label: "Monthly Recurring Fees", value: `${fmt(monthlyFees)}/mo`, color: "#1D4ED8", bold: false },
            { label: "Discounts", value: discountAmt > 0 ? `-${fmt(discountAmt)}` : "—", color: "#DC2626", bold: false },
            { label: "Promo Codes", value: discount.promoCode || "—", color: "#92400E", bold: false },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between text-xs px-3 py-2 rounded-lg"
              style={{ background: "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border-light)" }}>
              <span style={{ color: "var(--rtm-text-muted)" }}>{r.label}</span>
              <span className="font-semibold" style={{ color: r.color }}>{r.value}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="rounded-xl border p-4 text-center" style={{ background: "#EFF6FF", borderColor: "#BFDBFE" }}>
            <p className="text-[10px] font-bold" style={{ color: "#1D4ED8" }}>Est. Monthly Revenue</p>
            <p className="text-xl font-black mt-1" style={{ color: "#1D4ED8" }}>{fmt(monthlyFees)}</p>
          </div>
          <div className="rounded-xl border p-4 text-center" style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}>
            <p className="text-[10px] font-bold" style={{ color: "#15803D" }}>Est. Annual Revenue</p>
            <p className="text-xl font-black mt-1" style={{ color: "#15803D" }}>{fmt(annualFees)}</p>
          </div>
          <div className="rounded-xl border p-4 text-center" style={{ background: "#F5F3FF", borderColor: "#DDD6FE" }}>
            <p className="text-[10px] font-bold" style={{ color: "#6D28D9" }}>Grand Total</p>
            <p className="text-xl font-black mt-1" style={{ color: "#6D28D9" }}>{fmt(grandTotal)}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Delivery Standards
// ─────────────────────────────────────────────────────────────────────────────

function DeliveryStandards({ lineItems }: { lineItems: LineItem[] }) {
  if (lineItems.length === 0) return null;
  return (
    <Card>
      <CardHeader title="⏱ Delivery Standards" subtitle="Per-line-item SLA commitments" />
      <div className="overflow-x-auto">
        <table className="w-full text-xs" style={{ borderCollapse: "collapse", minWidth: "900px" }}>
          <thead>
            <tr style={{ background: "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border)" }}>
              {["Service","First Response","Target Completion","Client Updates","Escalation","Delivery Standard"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
                  style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lineItems.map((li, i) => (
              <tr key={li.id} style={{ borderBottom: "1px solid var(--rtm-border-light)", background: i % 2 === 0 ? "transparent" : "var(--rtm-surface)" }}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <CategoryBadge cat={li.category} />
                    <span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{li.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold" style={{ color: "#1D4ED8" }}>⚡ {li.firstResponse}</td>
                <td className="px-4 py-3 font-bold" style={{ color: "#059669" }}>{li.targetDays} biz days</td>
                <td className="px-4 py-3" style={{ color: "var(--rtm-text-secondary)" }}>{li.clientUpdateFreq}</td>
                <td className="px-4 py-3" style={{ color: "#C2410C" }}>After {li.escalationDays} days</td>
                <td className="px-4 py-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: DELIVERY_STYLES[li.deliveryStandard].bg, color: DELIVERY_STYLES[li.deliveryStandard].text }}>
                    {li.deliveryStandard}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Task Blueprint Mapping
// ─────────────────────────────────────────────────────────────────────────────

function TaskBlueprintMapping({ lineItems }: { lineItems: LineItem[] }) {
  if (lineItems.length === 0) return null;

  const totalTasks = lineItems.reduce((s, l) => s + l.generatedTasks * l.quantity, 0);
  const totalMilestones = lineItems.reduce((s, l) => s + l.generatedMilestones * l.quantity, 0);
  const totalDeliverables = lineItems.reduce((s, l) => s + l.generatedDeliverables * l.quantity, 0);

  return (
    <Card>
      <CardHeader title="🗺 Task Blueprint Mapping" subtitle="Generated tasks, milestones, and deliverables per service" />
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Generated Tasks", value: totalTasks, bg: "#EFF6FF", text: "#1D4ED8" },
            { label: "Generated Milestones", value: totalMilestones, icon: "🏁", bg: "#F0FDF4", text: "#15803D" },
            { label: "Generated Deliverables", value: totalDeliverables, bg: "#FFF7ED", text: "#C2410C" },
          ].map(r => (
            <div key={r.label} className="rounded-xl border p-4 text-center" style={{ background: r.bg, borderColor: `${r.text}20` }}>
              <div className="text-xl mb-1">{r.icon}</div>
              <div className="text-2xl font-black" style={{ color: r.text }}>{r.value}</div>
              <div className="text-[10px] font-semibold mt-0.5" style={{ color: r.text }}>{r.label}</div>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--rtm-border)" }}>
          <table className="w-full text-xs" style={{ borderCollapse: "collapse", minWidth: "900px" }}>
            <thead>
              <tr style={{ background: "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border)" }}>
                {["Task Blueprint","Department","Recurring Tasks","Tasks","Milestones","Deliverables","Dependencies"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
                    style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lineItems.map((li, i) => (
                <tr key={li.id} style={{ borderBottom: "1px solid var(--rtm-border-light)", background: i % 2 === 0 ? "transparent" : "var(--rtm-surface)" }}>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-bold px-2 py-1 rounded" style={{ background: "#F5F3FF", color: "#6D28D9" }}>{li.taskBlueprint}</span>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--rtm-text-secondary)" }}>{li.department}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {li.recurringTasks.length > 0
                        ? li.recurringTasks.slice(0, 3).map(t => (
                          <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full"
                            style={{ background: "#F0F9FF", color: "#0369A1" }}>{t}</span>
                        ))
                        : <span style={{ color: "var(--rtm-text-muted)" }}>Setup only</span>
                      }
                      {li.recurringTasks.length > 3 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full"
                          style={{ background: "#F3F4F6", color: "#6B7280" }}>+{li.recurringTasks.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-center" style={{ color: "#1D4ED8" }}>{li.generatedTasks}</td>
                  <td className="px-4 py-3 font-bold text-center" style={{ color: "#15803D" }}>{li.generatedMilestones}</td>
                  <td className="px-4 py-3 font-bold text-center" style={{ color: "#C2410C" }}>{li.generatedDeliverables}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {li.dependencies.map(d => (
                        <span key={d} className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                          style={{ background: "#FFF7ED", color: "#C2410C" }}>{d}</span>
                      ))}
                      {li.dependencies.length === 0 && <span style={{ color: "var(--rtm-text-muted)" }}>—</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Contract Builder
// ─────────────────────────────────────────────────────────────────────────────

function ContractBuilder({ config, onChange }: {
  config: ContractConfig;
  onChange: (c: ContractConfig) => void;
}) {
  const TERMS: ContractTerm[] = ["Month-to-Month","6 Month","12 Month","24 Month","Custom"];

  const termMonthCount = termMonths(config);

  return (
    <Card>
      <CardHeader title="📃 Contract Builder" subtitle="Define contract terms, dates, and renewal settings" />
      <div className="p-5 space-y-5">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wide block mb-2" style={{ color: "var(--rtm-text-muted)" }}>Contract Term</label>
          <div className="flex flex-wrap gap-2">
            {TERMS.map(t => (
              <button key={t} onClick={() => onChange({ ...config, term: t })}
                className="px-4 py-2 text-xs font-semibold rounded-lg border transition-all"
                style={{
                  background: config.term === t ? "#1D4ED8" : "var(--rtm-surface)",
                  color: config.term === t ? "#fff" : "var(--rtm-text-secondary)",
                  borderColor: config.term === t ? "#1D4ED8" : "var(--rtm-border)",
                }}>
                {t}
              </button>
            ))}
          </div>
          {config.term === "Custom" && (
            <div className="mt-2">
              <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>Custom Months</label>
              <input type="number" min={1} max={120} value={config.customMonths}
                onChange={e => onChange({ ...config, customMonths: parseInt(e.target.value) || 1 })}
                className="text-xs rounded-lg border px-3 py-2 focus:outline-none w-28"
                style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input label="Start Date" value={config.startDate} onChange={v => onChange({ ...config, startDate: v })} type="date" />
          <Input label="End Date" value={config.endDate} onChange={v => onChange({ ...config, endDate: v })} type="date" />
          <Select label="Notice Period" value={config.noticePeriod} onChange={v => onChange({ ...config, noticePeriod: v })}
            options={["15 days","30 days","60 days","90 days"]} />
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wide block mb-2" style={{ color: "var(--rtm-text-muted)" }}>Auto Renew</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={config.autoRenew}
                onChange={e => onChange({ ...config, autoRenew: e.target.checked })}
                className="rounded" />
              <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>
                Auto-renew enabled
              </span>
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>Cancellation Terms</label>
            <textarea value={config.cancellationTerms} rows={2}
              onChange={e => onChange({ ...config, cancellationTerms: e.target.value })}
              className="w-full text-xs rounded-lg border px-3 py-2 focus:outline-none resize-none"
              style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Term Length", value: `${termMonthCount} month${termMonthCount !== 1 ? "s" : ""}`, bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
            { label: "Start Date", value: config.startDate || "—", bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
            { label: "End Date", value: config.endDate || "—", bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
            { label: "Auto Renew", value: config.autoRenew ? "✅ Yes" : "❌ No", bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE" },
          ].map(r => (
            <div key={r.label} className="rounded-lg border p-3 text-center" style={{ background: r.bg, borderColor: r.border }}>
              <p className="text-[10px] font-bold" style={{ color: r.text }}>{r.label}</p>
              <p className="text-xs font-black mt-0.5" style={{ color: r.text }}>{r.value}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Proposal → Contract Flow
// ─────────────────────────────────────────────────────────────────────────────

function ProposalContractFlow({ status }: { status: ProposalStatus }) {
  const steps = [
    { key: "proposal", label: "Proposal Approved", done: ["Accepted","Converted To Contract"].includes(status) },
    { key: "contract", label: "Generate Contract", icon: "📄", done: ["Converted To Contract"].includes(status) },
    { key: "signed", label: "Contract Signed", done: ["Converted To Contract"].includes(status) },
    { key: "billing", label: "Send To Billing", done: false },
  ];

  return (
    <Card>
      <CardHeader title="🔄 Proposal → Contract Flow" />
      <div className="p-5">
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
          {steps.map((s, i) => (
            <React.Fragment key={s.key}>
              <div className="flex flex-col items-center gap-2 min-w-[100px]">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl border-2"
                  style={{
                    background: s.done ? "#F0FDF4" : "var(--rtm-bg)",
                    borderColor: s.done ? "#059669" : "var(--rtm-border)",
                  }}>
                  {s.icon}
                </div>
                <span className="text-[10px] font-semibold text-center max-w-[80px] leading-tight"
                  style={{ color: s.done ? "#059669" : "var(--rtm-text-muted)" }}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-0.5 min-w-[24px] mb-5"
                  style={{ background: s.done ? "#059669" : "var(--rtm-border)" }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {status === "Accepted" && (
          <div className="mt-4 flex gap-2">
            <Btn variant="success" onClick={() => alert("[Mock] Contract generated! Routed to DocuSign.")}>
              🚀 Generate Contract
            </Btn>
            <Btn variant="primary" onClick={() => alert("[Mock] Sent for internal approval.")}>
              Send for Review
            </Btn>
          </div>
        )}
        {status === "Converted To Contract" && (
          <div className="mt-4 rounded-lg border p-3" style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}>
            <p className="text-xs font-semibold" style={{ color: "#047857" }}>✅ Contract generated and sent for signature. Track in Contracts tab.</p>
          </div>
        )}
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Executive Summary
// ─────────────────────────────────────────────────────────────────────────────

function AIExecutiveSummary({ proposal }: { proposal: Proposal }) {
  const s = proposal.aiSummary;
  const complexityColor = s.complexity === "Low" ? "#059669" : s.complexity === "Medium" ? "#D97706" : "#DC2626";
  const complexityBg = s.complexity === "Low" ? "#F0FDF4" : s.complexity === "Medium" ? "#FFFBEB" : "#FFF1F2";

  return (
    <Card>
      <CardHeader title="🤖 AI Executive Summary" subtitle="AI-generated analysis of this proposal" />
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="rounded-xl border p-4" style={{ background: "#EFF6FF", borderColor: "#BFDBFE" }}>
            <p className="text-[10px] font-bold mb-1" style={{ color: "#1D4ED8" }}>Recommended Package</p>
            <p className="text-sm font-bold" style={{ color: "#1E40AF" }}>{s.recommendedPackage}</p>
          </div>
          <div className="rounded-xl border p-4" style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}>
            <p className="text-[10px] font-bold mb-1" style={{ color: "#15803D" }}>Revenue Opportunity</p>
            <p className="text-sm font-bold" style={{ color: "#166534" }}>{s.revenueOpportunity}</p>
          </div>
          <div className="rounded-xl border p-4" style={{ background: complexityBg, borderColor: `${complexityColor}30` }}>
            <p className="text-[10px] font-bold mb-1" style={{ color: complexityColor }}>Complexity</p>
            <p className="text-sm font-bold" style={{ color: complexityColor }}>{s.complexity}</p>
          </div>
          <div className="rounded-xl border p-4" style={{ background: "#FFF7ED", borderColor: "#FED7AA" }}>
            <p className="text-[10px] font-bold mb-1" style={{ color: "#C2410C" }}>Resource Requirements</p>
            <p className="text-xs font-semibold" style={{ color: "#92400E" }}>{s.resourceRequirements}</p>
          </div>
          <div className="rounded-xl border p-4 sm:col-span-2" style={{ background: "#F5F3FF", borderColor: "#DDD6FE" }}>
            <p className="text-[10px] font-bold mb-1" style={{ color: "#6D28D9" }}>Expected Impact</p>
            <p className="text-xs font-semibold" style={{ color: "#4C1D95" }}>{s.expectedImpact}</p>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>Risk Factors</p>
          <div className="flex flex-wrap gap-2">
            {s.riskFactors.map((r) => (
              <span key={r} className="text-xs px-3 py-1.5 rounded-lg border"
                style={{ background: "#FFF7ED", color: "#C2410C", borderColor: "#FED7AA" }}>
                ⚠️ {r}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Proposal Detail Drawer
// ─────────────────────────────────────────────────────────────────────────────

type DrawerTab = "overview" | "services" | "lineitems" | "pricing" | "delivery" | "blueprints" | "contract" | "activity";

function ProposalDetailDrawer({ proposal, onClose, onEdit }: {
  proposal: Proposal;
  onClose: () => void;
  onEdit: () => void;
}) {
  const [tab, setTab] = useState<DrawerTab>("overview");

  const TABS: { key: DrawerTab; label: string }[] = [
    { key: "overview",   label: "Overview" },
    { key: "services",   label: "Services" },
    { key: "lineitems",  label: "Line Items" },
    { key: "pricing",    label: "Pricing" },
    { key: "delivery",   label: "Delivery Standards" },
    { key: "blueprints", label: "Task Blueprints" },
    { key: "contract",   label: "Contract" },
    { key: "activity",   label: "Activity" },
  ];

  const setupTotal = proposal.lineItems.reduce((s, l) => s + l.setupFee * l.quantity, 0);
  const recurringTotal = proposal.lineItems.reduce((s, l) => s + l.recurringFee * l.quantity, 0);
  const discountAmt = calcDiscount(setupTotal + recurringTotal * 12, proposal.discount);

  return (
    <div className="fixed inset-0 z-50 flex" style={{ backdropFilter: "blur(2px)", background: "rgba(0,0,0,0.4)" }}>
      <div className="ml-auto w-full max-w-3xl h-full overflow-y-auto shadow-2xl flex flex-col"
        style={{ background: "var(--rtm-surface)" }}>
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-start justify-between gap-4 sticky top-0 z-10"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={proposal.status} />
              <span className="text-[10px] font-semibold" style={{ color: "var(--rtm-text-muted)" }}>{proposal.id}</span>
            </div>
            <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>{proposal.name}</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
              {proposal.client} · {proposal.owner} · Created {proposal.createdDate}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Btn variant="primary" onClick={onEdit}>Edit Proposal</Btn>
            <button onClick={onClose} className="text-sm font-bold px-3 py-1.5 rounded-lg border transition-all"
              style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>
              ✕ Close
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b" style={{ borderColor: "var(--rtm-border)" }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors"
              style={{
                color: tab === t.key ? "#1D4ED8" : "var(--rtm-text-muted)",
                borderBottom: tab === t.key ? "2px solid #1D4ED8" : "2px solid transparent",
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-4">
          {tab === "overview" && (
            <>
              <AIExecutiveSummary proposal={proposal} />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Setup Fees", value: fmt(setupTotal), bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
                  { label: "Monthly Recurring", value: `${fmt(recurringTotal)}/mo`, bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
                  { label: "Discount", value: discountAmt > 0 ? `-${fmt(discountAmt)}` : "—", bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
                  { label: "Total Value", value: fmt(proposal.totalValue), bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
                ].map(r => (
                  <div key={r.label} className="rounded-xl border p-4 text-center" style={{ background: r.bg, borderColor: r.border }}>
                    <p className="text-[10px] font-bold" style={{ color: r.text }}>{r.label}</p>
                    <p className="text-lg font-black mt-1" style={{ color: r.text }}>{r.value}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "services" && (
            <Card>
              <CardHeader title="Services" />
              <div className="p-4 space-y-2">
                {proposal.services.map(s => (
                  <div key={s} className="flex items-center gap-3 px-3 py-2 rounded-lg border"
                    style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}>
                    <CategoryBadge cat={s} />
                    <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{s}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {tab === "lineitems" && (
            <Card>
              <CardHeader title="Line Items" />
              <div className="overflow-x-auto">
                <table className="w-full text-xs" style={{ borderCollapse: "collapse", minWidth: "700px" }}>
                  <thead>
                    <tr style={{ background: "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border)" }}>
                      {["Service","Dept","Setup Fee","Recurring Fee","Qty","Blueprint","Status"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wide"
                          style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {proposal.lineItems.map((li, i) => (
                      <tr key={li.id} style={{ borderBottom: "1px solid var(--rtm-border-light)", background: i % 2 === 0 ? "transparent" : "var(--rtm-surface)" }}>
                        <td className="px-4 py-3 font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                          <div className="flex items-center gap-2">
                            <CategoryBadge cat={li.category} />
                            <span>{li.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--rtm-text-secondary)" }}>{li.department}</td>
                        <td className="px-4 py-3 font-semibold" style={{ color: "#C2410C" }}>{li.setupFee > 0 ? fmt(li.setupFee) : "—"}</td>
                        <td className="px-4 py-3 font-semibold" style={{ color: "#1D4ED8" }}>{li.recurringFee > 0 ? `${fmt(li.recurringFee)}/mo` : "—"}</td>
                        <td className="px-4 py-3 text-center" style={{ color: "var(--rtm-text-secondary)" }}>{li.quantity}</td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: "#F5F3FF", color: "#6D28D9" }}>{li.taskBlueprint}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge label={li.status}
                            bg={li.status === "Active" ? "#F0FDF4" : "#FFF7ED"}
                            text={li.status === "Active" ? "#15803D" : "#C2410C"}
                            border={li.status === "Active" ? "#BBF7D0" : "#FED7AA"} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {tab === "pricing" && <PricingSummary lineItems={proposal.lineItems} discount={proposal.discount} />}

          {tab === "delivery" && <DeliveryStandards lineItems={proposal.lineItems} />}

          {tab === "blueprints" && <TaskBlueprintMapping lineItems={proposal.lineItems} />}

          {tab === "contract" && (
            <>
              <Card>
                <CardHeader title="Contract Details" />
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Term", value: proposal.contract.term },
                    { label: "Start Date", value: proposal.contract.startDate || "—" },
                    { label: "End Date", value: proposal.contract.endDate || "—" },
                    { label: "Notice Period", value: proposal.contract.noticePeriod },
                    { label: "Auto Renew", value: proposal.contract.autoRenew ? "Yes" : "No" },
                    { label: "Cancellation Terms", value: proposal.contract.cancellationTerms },
                  ].map(r => (
                    <div key={r.label} className="rounded-lg border p-3"
                      style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}>
                      <p className="text-[10px] font-bold" style={{ color: "var(--rtm-text-muted)" }}>{r.label}</p>
                      <p className="text-xs font-semibold mt-0.5" style={{ color: "var(--rtm-text-primary)" }}>{r.value}</p>
                    </div>
                  ))}
                </div>
              </Card>
              <ProposalContractFlow status={proposal.status} />
            </>
          )}

          {tab === "activity" && (
            <Card>
              <CardHeader title="Activity Timeline" />
              <div className="p-5 space-y-3">
                {proposal.activityTimeline.map((e, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#1D4ED8" }} />
                    <div>
                      <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{e.event}</p>
                      <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{e.user} · {e.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Full Proposal Builder (Create / Edit Mode)
// ─────────────────────────────────────────────────────────────────────────────

function ProposalBuilderView({ initial, onBack }: {
  initial: Proposal | null;
  onBack: () => void;
}) {
  const baseProposal = initial ?? MOCK_PROPOSALS[0];

  const [info, setInfo] = useState<ProposalInfo>({ ...baseProposal.info });
  const [lineItems, setLineItems] = useState<LineItem[]>([...baseProposal.lineItems]);
  const [discount, setDiscount] = useState<Discount>({ ...baseProposal.discount });
  const [contract, setContract] = useState<ContractConfig>({ ...baseProposal.contract });
  const [status, setStatus] = useState<ProposalStatus>(baseProposal.status);
  const [builderTab, setBuilderTab] = useState<"info" | "services" | "lineitems" | "budget" | "ai" | "pricing" | "delivery" | "blueprints" | "contract">("info");

  const setupTotal = lineItems.reduce((s, l) => s + l.setupFee * l.quantity, 0);
  const recurringTotal = lineItems.reduce((s, l) => s + l.recurringFee * l.quantity, 0);

  function addLineItem(li: LineItem) {
    if (!lineItems.find(e => e.id === li.id)) {
      setLineItems(prev => [...prev, { ...li }]);
    }
  }

  function removeLineItem(id: string) {
    setLineItems(prev => prev.filter(l => l.id !== id));
  }

  function updateLineItem(id: string, key: keyof LineItem, value: unknown) {
    setLineItems(prev => prev.map(l => l.id === id ? { ...l, [key]: value } : l));
  }

  function cloneLineItem(id: string) {
    const orig = lineItems.find(l => l.id === id);
    if (orig) {
      setLineItems(prev => [...prev, { ...orig, id: `${orig.id}-clone-${Date.now()}` }]);
    }
  }

  function acceptAIPackage(pkg: AIRecommendation) {
    const toAdd = LINE_ITEM_CATALOG.filter(li =>
      pkg.lineItems.some(name => li.name.toLowerCase().includes(name.toLowerCase().split(" ")[0]))
    );
    const existingIds = new Set(lineItems.map(l => l.id));
    const newItems = toAdd.filter(li => !existingIds.has(li.id));
    if (newItems.length > 0) {
      setLineItems(prev => [...prev, ...newItems]);
      alert(`Added ${newItems.length} line item(s) from "${pkg.packageName}" package.`);
    } else {
      alert("All items from this package are already in your proposal.");
    }
  }

  const BUILDER_TABS = [
    { key: "info",       label: "📄 Proposal Info" },
    { key: "services",   label: "🛒 Services" },
    { key: "lineitems",  label: "📦 Line Items" },
    { key: "budget",     label: "💰 Budget Builder" },
    { key: "ai",         label: "🤖 AI Packages" },
    { key: "pricing",    label: "💵 Pricing" },
    { key: "delivery",   label: "⏱ Delivery" },
    { key: "blueprints", label: "🗺 Blueprints" },
    { key: "contract",   label: "📃 Contract" },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button onClick={onBack} className="text-xs font-semibold" style={{ color: "var(--rtm-text-muted)" }}>
              ← Back to Proposals
            </button>
            <span style={{ color: "var(--rtm-text-muted)" }}>·</span>
            <StatusBadge status={status} />
          </div>
          <h2 className="text-lg font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            {initial ? `Editing: ${initial.name}` : "New Proposal"}
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
            {lineItems.length} service{lineItems.length !== 1 ? "s" : ""} · {fmt(setupTotal)} setup · {fmt(recurringTotal)}/mo recurring
          </p>
        </div>
        <div className="flex gap-2">
          <Select label="" value={status} onChange={v => setStatus(v as ProposalStatus)}
            options={["Draft","Internal Review","Pending Approval","Sent","Negotiation","Accepted","Rejected","Expired","Converted To Contract"]} />
          <div className="flex flex-col justify-end">
            <Btn variant="success" onClick={() => alert("[Mock] Proposal saved successfully!")}>💾 Save</Btn>
          </div>
          <div className="flex flex-col justify-end">
            <Btn variant="primary" onClick={() => alert("[Mock] Proposal sent to client!")}>📤 Send</Btn>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto rounded-xl border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
        {BUILDER_TABS.map(t => (
          <button key={t.key} onClick={() => setBuilderTab(t.key as typeof builderTab)}
            className="flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors"
            style={{
              color: builderTab === t.key ? "#1D4ED8" : "var(--rtm-text-muted)",
              borderBottom: builderTab === t.key ? "2px solid #1D4ED8" : "2px solid transparent",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {builderTab === "info" && (
          <ProposalInfoForm info={info} onChange={(k, v) => setInfo(prev => ({ ...prev, [k]: v }))} />
        )}
        {builderTab === "services" && (
          <ServiceSelection
            selectedLineItems={lineItems}
            onAdd={addLineItem}
            onRemove={removeLineItem}
          />
        )}
        {builderTab === "lineitems" && (
          <LineItemBuilder
            lineItems={lineItems}
            onUpdate={updateLineItem}
            onRemove={removeLineItem}
            onClone={cloneLineItem}
          />
        )}
        {builderTab === "budget" && (
          <BudgetBuilder onRecommend={acceptAIPackage} />
        )}
        {builderTab === "ai" && (
          <div className="space-y-4">
            <Card>
              <CardHeader title="🤖 AI Package Recommendations" subtitle="All available packages — add to your proposal" />
              <div className="p-5 space-y-3">
                {AI_PACKAGES.map(pkg => (
                  <AIPackageCard key={pkg.packageName} pkg={pkg} onAdd={() => acceptAIPackage(pkg)} />
                ))}
              </div>
            </Card>
          </div>
        )}
        {builderTab === "pricing" && (
          <>
            <PricingSummary lineItems={lineItems} discount={discount} />
            <DiscountPanel
              discount={discount}
              onUpdate={setDiscount}
              setupTotal={setupTotal}
              recurringTotal={recurringTotal}
            />
          </>
        )}
        {builderTab === "delivery" && (
          <DeliveryStandards lineItems={lineItems} />
        )}
        {builderTab === "blueprints" && (
          <TaskBlueprintMapping lineItems={lineItems} />
        )}
        {builderTab === "contract" && (
          <>
            <ContractBuilder config={contract} onChange={setContract} />
            <ProposalContractFlow status={status} />
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

type PageView = "dashboard" | "builder" | "detail";

export default function ProposalsPage() {
  const [view, setView] = useState<PageView>("dashboard");
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function openDetail(p: Proposal) {
    setSelectedProposal(p);
    setDrawerOpen(true);
  }

  function openBuilder(p: Proposal | null) {
    setEditingProposal(p);
    setDrawerOpen(false);
    setView("builder");
  }

  function backToDashboard() {
    setView("dashboard");
    setEditingProposal(null);
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "#059669" }}>
            Sales · Proposal Builder v2
          </p>
          <h1 className="text-xl font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            {view === "builder" ? (editingProposal ? `Edit: ${editingProposal.name}` : "New Proposal") : "Proposals"}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
            Build proposals, generate contracts, and activate billing — all in one flow.
          </p>
        </div>
        {view === "dashboard" && (
          <div className="flex gap-2">
            <Btn variant="primary" onClick={() => openBuilder(null)}>+ New Proposal</Btn>
            <Link href="/sales">
              <Btn variant="default">← Sales Dashboard</Btn>
            </Link>
          </div>
        )}
      </div>

      {/* Navigation reminder — proposals always visible */}
      {view === "dashboard" && (
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Dashboard", href: "/sales" },
            { label: "Leads", href: "/sales/leads" },
            { label: "Audits", href: "/sales/audits" },
            { label: "Recommendations", href: "/sales/recommendations" },
            { label: "Pipeline", href: "/sales/pipeline" },
            { label: "Proposals", href: "/sales/proposals", active: true },
            { label: "Contracts", href: "/sales/proposals", icon: "📃" },
          ].map(n => (
            <Link key={n.label} href={n.href}>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all"
                style={{
                  background: n.active ? "#059669" : "var(--rtm-surface)",
                  color: n.active ? "#fff" : "var(--rtm-text-secondary)",
                  borderColor: n.active ? "#059669" : "var(--rtm-border)",
                }}>
                {n.icon} {n.label}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* ── Builder View ── */}
      {view === "builder" && (
        <ProposalBuilderView initial={editingProposal} onBack={backToDashboard} />
      )}

      {/* ── Dashboard View ── */}
      {view === "dashboard" && (
        <>
          {/* KPI Cards */}
          <DashboardKPIs proposals={MOCK_PROPOSALS} />

          {/* Proposal Table */}
          <ProposalTable
            proposals={MOCK_PROPOSALS}
            onSelect={openDetail}
            onBuild={openBuilder}
          />

          {/* AI Package showcase */}
          <Card>
            <CardHeader title="🤖 AI Package Recommendations"
              subtitle="Quick-add recommended packages to new proposals"
              actions={<Btn variant="primary" onClick={() => openBuilder(null)}>+ New Proposal with AI</Btn>}
            />
            <div className="p-5 space-y-3">
              {AI_PACKAGES.map(pkg => (
                <AIPackageCard key={pkg.packageName} pkg={pkg}
                  onAdd={() => {
                    openBuilder(null);
                    alert(`[Mock] "${pkg.packageName}" package pre-loaded into new proposal.`);
                  }} />
              ))}
            </div>
          </Card>

          {/* Budget Builder Preview */}
          <BudgetBuilder onRecommend={(pkg) => {
            openBuilder(null);
            alert(`[Mock] "${pkg.packageName}" loaded from budget recommendation.`);
          }} />
        </>
      )}

      {/* ── Proposal Detail Drawer ── */}
      {drawerOpen && selectedProposal && (
        <ProposalDetailDrawer
          proposal={selectedProposal}
          onClose={() => setDrawerOpen(false)}
          onEdit={() => {
            setDrawerOpen(false);
            openBuilder(selectedProposal);
          }}
        />
      )}
    </div>
  );
}
