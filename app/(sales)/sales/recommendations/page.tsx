"use client";

import React, { useState, useMemo } from "react";

// 
// Types
// 

type RecommendationType =
  | "Service Recommendation"| "Line Item Recommendation"| "Package Recommendation"| "Renewal Recommendation"| "Upsell Recommendation"| "Retention Recommendation"| "Risk Recommendation";

type Priority = "Critical"| "High"| "Medium"| "Low";
type RecStatus = "New"| "In Review"| "Accepted"| "Rejected"| "Proposal Sent"| "Won";
type InputSource =
  | "Audit Findings"| "Call Summary"| "Client Notes"| "Meeting Notes"| "Renewal Signal"| "Upsell Signal"| "Project Health"| "Client Health";

type ServiceType =
  | "SEO"| "GBP"| "PPC"| "Meta Ads"| "LSA"| "Website"| "Hosting"| "AI Automation"| "Reporting";

type PackageType =
  | "SEO Starter"| "SEO Growth"| "SEO + GBP"| "PPC + Landing Page"| "Full Service"| "Hosting + Maintenance"| "AI Voice Agent"| "Custom Package";

interface CommunicationSignal {
  clientConcerns: string[];
  requestedServices: string[];
  growthOpportunities: string[];
  renewalIndicators: string[];
  cancellationIndicators: string[];
  callInsights: string[];
  actionItems: string[];
}

interface AIScoring {
  confidenceScore: number;
  impactScore: number;
  revenueOpportunity: number;
  complexityScore: number;
  urgencyScore: number;
}

interface RecommendedService {
  id: string;
  service: ServiceType;
  reason: string;
  estimatedMonthlyRevenue: number;
  setupFee: number;
}

interface RecommendedLineItem {
  id: string;
  name: string;
  category: string;
  setupFee: number;
  recurringFee: number;
  deliveryStandard: string;
}

interface Recommendation {
  id: string;
  client: string;
  industry: string;
  recommendationType: RecommendationType;
  source: InputSource;
  priority: Priority;
  department: string;
  estimatedRevenue: number;
  aiScoring: AIScoring;
  status: RecStatus;
  createdDate: string;
  createdBy: string;
  summary: string;
  auditFindings: string[];
  communicationSignals: CommunicationSignal;
  recommendedServices: RecommendedService[];
  recommendedLineItems: RecommendedLineItem[];
  recommendedPackage: PackageType;
  packageServices: string[];
  packageSetupTotal: number;
  packageMonthlyTotal: number;
  notes: string;
}

// 
// Mock Data — 20 Recommendations
// 

const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: "rec-001",
    client: "Metro Dental Group",
    industry: "Dental",
    recommendationType: "Service Recommendation",
    source: "Audit Findings",
    priority: "High",
    department: "SEO",
    estimatedRevenue: 1200,
    aiScoring: { confidenceScore: 94, impactScore: 91, revenueOpportunity: 14400, complexityScore: 42, urgencyScore: 85 },
    status: "New",
    createdDate: "Jun 5, 2025",
    createdBy: "AI Engine",
    summary: "SEO technical audit revealed 9 critical issues including duplicate location pages, orphan content, and missing tracking. SEO Monthly Management recommended to fix and sustain.",
    auditFindings: [
      "Duplicate Location Pages causing keyword cannibalization",
      "5 orphan service pages with zero internal links",
      "9 pages missing meta descriptions",
      "4 broken internal links degrading crawl budget",
      "Missing Meta Pixel — no remarketing capability",
    ],
    communicationSignals: {
      clientConcerns: ["Low organic visibility despite modern website", "Losing patients to competitors"],
      requestedServices: ["SEO optimization", "Multi-location strategy"],
      growthOpportunities: ["3-location expansion planned for Q4", "Pediatric dental content gap identified"],
      renewalIndicators: ["Expressed interest in 12-month agreement"],
      cancellationIndicators: [],
      callInsights: ["Client frustrated with current visibility. Budget approved at $1,000–$1,500/mo. Expansion plans create urgency."],
      actionItems: ["Send proposal with SEO package", "Schedule follow-up call", "Prepare competitor comparison"],
    },
    recommendedServices: [
      { id: "rs-001-1", service: "SEO", reason: "Core service needed to fix 9 audit issues and drive organic growth.", estimatedMonthlyRevenue: 1200, setupFee: 1500 },
      { id: "rs-001-2", service: "Reporting", reason: "Missing tracking infrastructure — cannot measure SEO results without it.", estimatedMonthlyRevenue: 0, setupFee: 700 },
    ],
    recommendedLineItems: [
      { id: "li-001-1", name: "SEO Setup & Onboarding", category: "SEO", setupFee: 1500, recurringFee: 0, deliveryStandard: "12 days"},
      { id: "li-001-2", name: "SEO Monthly Management", category: "SEO", setupFee: 0, recurringFee: 1200, deliveryStandard: "Ongoing"},
      { id: "li-001-3", name: "Tracking & Analytics Setup", category: "Reporting", setupFee: 700, recurringFee: 0, deliveryStandard: "8 days"},
    ],
    recommendedPackage: "SEO Starter",
    packageServices: ["SEO Setup & Onboarding", "SEO Monthly Management", "Tracking & Analytics Setup"],
    packageSetupTotal: 2200,
    packageMonthlyTotal: 1200,
    notes: "Client expressed urgency due to 3-location expansion. High close probability given budget confirmation.",
  },
  {
    id: "rec-002",
    client: "Harbor Auto Group",
    industry: "Automotive",
    recommendationType: "Service Recommendation",
    source: "Audit Findings",
    priority: "Critical",
    department: "GBP",
    estimatedRevenue: 1300,
    aiScoring: { confidenceScore: 97, impactScore: 95, revenueOpportunity: 15600, complexityScore: 30, urgencyScore: 99 },
    status: "Proposal Sent",
    createdDate: "Jun 6, 2025",
    createdBy: "AI Engine",
    summary: "GBP critically underperforming with 31 reviews vs competitor average of 340. 6 months without posts. Immediate GBP overhaul and review generation required.",
    auditFindings: [
      "Only 31 reviews vs competitor average of 340",
      "Zero GBP posts in 6 months",
      "Only 6 photos vs competitor average of 120+",
      "Missing 8 relevant secondary categories",
      "No Q&A section",
    ],
    communicationSignals: {
      clientConcerns: ["Declining showroom walk-ins", "Competitor opened nearby and dominating GBP"],
      requestedServices: ["GBP optimization", "Review generation"],
      growthOpportunities: ["Website redesign needed (7 years old)", "PPC for inventory"],
      renewalIndicators: ["Mentioned 3-year relationship and loyalty"],
      cancellationIndicators: [],
      callInsights: ["Owner frustrated about revenue loss. Competitor GBP dominance directly tied to showroom traffic decline."],
      actionItems: ["Upload 50 photos immediately", "Launch review request automation", "Add secondary categories"],
    },
    recommendedServices: [
      { id: "rs-002-1", service: "GBP", reason: "Profile critically underperforming — 31 vs 340 reviews. Immediate intervention needed.", estimatedMonthlyRevenue: 800, setupFee: 800 },
      { id: "rs-002-2", service: "Reporting", reason: "Need tracking to measure GBP ranking improvements.", estimatedMonthlyRevenue: 0, setupFee: 400 },
    ],
    recommendedLineItems: [
      { id: "li-002-1", name: "GBP Setup & Optimization", category: "GBP", setupFee: 350, recurringFee: 0, deliveryStandard: "3 days"},
      { id: "li-002-2", name: "GBP Monthly Management", category: "GBP", setupFee: 0, recurringFee: 500, deliveryStandard: "Ongoing"},
      { id: "li-002-3", name: "Review Generation Setup", category: "GBP", setupFee: 450, recurringFee: 300, deliveryStandard: "5 days"},
    ],
    recommendedPackage: "SEO + GBP",
    packageServices: ["GBP Setup & Optimization", "GBP Monthly Management", "Review Generation Setup"],
    packageSetupTotal: 800,
    packageMonthlyTotal: 800,
    notes: "Urgent. Owner has approved budget. Proposal sent — awaiting signature.",
  },
  {
    id: "rec-003",
    client: "Sunstate Solar",
    industry: "Solar",
    recommendationType: "Service Recommendation",
    source: "Audit Findings",
    priority: "Critical",
    department: "Paid Advertising",
    estimatedRevenue: 1500,
    aiScoring: { confidenceScore: 98, impactScore: 97, revenueOpportunity: 18000, complexityScore: 55, urgencyScore: 98 },
    status: "Won",
    createdDate: "Jun 1, 2025",
    createdBy: "AI Engine",
    summary: "PPC account has broken conversion tracking and zero negative keywords. $8,000/mo spend with no measurable ROI. Full campaign rebuild required immediately.",
    auditFindings: [
      "Conversion tracking firing zero events despite active campaigns",
      "Zero negative keyword list — wasting 40%+ on irrelevant traffic",
      "Single broad match campaign with no intent segmentation",
      "All paid traffic sent to homepage — no conversion-optimized landing pages",
    ],
    communicationSignals: {
      clientConcerns: ["$8,000/mo spend with zero attributed leads in GA4", "Cannot prove ROI to ownership"],
      requestedServices: ["PPC rebuild", "Conversion tracking fix"],
      growthOpportunities: ["Landing page funnel for residential solar estimates"],
      renewalIndicators: ["Contract renewal discussion scheduled for August"],
      cancellationIndicators: ["Mentioned exploring other agencies if ROI not proven"],
      callInsights: ["High urgency — client was considering switching agencies. Fixing tracking immediately is table stakes."],
      actionItems: ["Rebuild conversion tracking first", "Submit negative keyword list", "Build solar estimate landing page"],
    },
    recommendedServices: [
      { id: "rs-003-1", service: "PPC", reason: "Campaign rebuild will eliminate 40%+ wasted spend and restore measurable ROI.", estimatedMonthlyRevenue: 1500, setupFee: 1200 },
      { id: "rs-003-2", service: "Reporting", reason: "Broken tracking is root cause — must fix attribution first.", estimatedMonthlyRevenue: 0, setupFee: 700 },
    ],
    recommendedLineItems: [
      { id: "li-003-1", name: "PPC Campaign Setup", category: "PPC", setupFee: 1200, recurringFee: 0, deliveryStandard: "14 days"},
      { id: "li-003-2", name: "PPC Monthly Management", category: "PPC", setupFee: 0, recurringFee: 1500, deliveryStandard: "Ongoing"},
      { id: "li-003-3", name: "Tracking & Analytics Setup", category: "Reporting", setupFee: 700, recurringFee: 0, deliveryStandard: "8 days"},
    ],
    recommendedPackage: "PPC + Landing Page",
    packageServices: ["PPC Campaign Setup", "PPC Monthly Management", "Tracking & Analytics Setup"],
    packageSetupTotal: 1900,
    packageMonthlyTotal: 1500,
    notes: "Client accepted proposal. Onboarding in progress.",
  },
  {
    id: "rec-004",
    client: "Coastal Wellness Spa",
    industry: "Health & Wellness",
    recommendationType: "Service Recommendation",
    source: "Audit Findings",
    priority: "High",
    department: "Paid Advertising",
    estimatedRevenue: 1200,
    aiScoring: { confidenceScore: 93, impactScore: 89, revenueOpportunity: 14400, complexityScore: 40, urgencyScore: 80 },
    status: "In Review",
    createdDate: "Jun 2, 2025",
    createdBy: "AI Engine",
    summary: "No Meta Ads presence while 4 competitors run active visual campaigns. Pixel installed but no events configured. First-mover advantage window available now.",
    auditFindings: [
      "Zero Meta Ads campaigns — 4 competitors actively running visual ads",
      "Meta Pixel present but firing zero custom events",
      "No custom audiences built — website visitor data wasted",
      "No retargeting strategy — booking-intent visitors leave and never return",
    ],
    communicationSignals: {
      clientConcerns: ["Losing booking revenue to competitors with stronger social presence"],
      requestedServices: ["Meta Ads launch", "Social media advertising"],
      growthOpportunities: ["Couples packages not being advertised by any competitor", "Video Reels campaigns for spa ambiance"],
      renewalIndicators: [],
      cancellationIndicators: [],
      callInsights: ["Client has Instagram following of 4,200 — great seed audience for Meta Ads. Visual brand is strong."],
      actionItems: ["Build audience strategy", "Launch retargeting campaign", "Configure pixel events"],
    },
    recommendedServices: [
      { id: "rs-004-1", service: "Meta Ads", reason: "Competitors running visual campaigns — immediate gap to fill.", estimatedMonthlyRevenue: 1200, setupFee: 900 },
    ],
    recommendedLineItems: [
      { id: "li-004-1", name: "Meta Ads Account Setup", category: "Meta Ads", setupFee: 900, recurringFee: 0, deliveryStandard: "10 days"},
      { id: "li-004-2", name: "Meta Ads Monthly Management", category: "Meta Ads", setupFee: 0, recurringFee: 1200, deliveryStandard: "Ongoing"},
      { id: "li-004-3", name: "Meta Pixel & Events Setup", category: "Tracking", setupFee: 400, recurringFee: 0, deliveryStandard: "5 days"},
    ],
    recommendedPackage: "Custom Package",
    packageServices: ["Meta Ads Account Setup", "Meta Ads Monthly Management", "Meta Pixel & Events Setup"],
    packageSetupTotal: 1300,
    packageMonthlyTotal: 1200,
    notes: "Presenting proposal this week. Client is excited about couples package campaign idea.",
  },
  {
    id: "rec-005",
    client: "Iron Mark Fitness",
    industry: "Fitness",
    recommendationType: "Service Recommendation",
    source: "Audit Findings",
    priority: "Critical",
    department: "Web",
    estimatedRevenue: 5250,
    aiScoring: { confidenceScore: 99, impactScore: 99, revenueOpportunity: 5000, complexityScore: 75, urgencyScore: 98 },
    status: "Won",
    createdDate: "May 19, 2025",
    createdBy: "AI Engine",
    summary: "Website PageSpeed 21/100. 22 broken links from migration. 14 pages blocked by robots.txt. Not mobile responsive. Complete rebuild required.",
    auditFindings: [
      "PageSpeed 21 desktop / 11 mobile — autoplay video causing 6.4s LCP",
      "22 broken internal links from site migration",
      "14 pages accidentally blocked by robots.txt",
      "Not mobile responsive — 70% of traffic is mobile",
    ],
    communicationSignals: {
      clientConcerns: ["New member signups declining", "Website looks outdated vs competitors"],
      requestedServices: ["Website redesign", "Mobile optimization"],
      growthOpportunities: ["Corporate wellness package — no competitor offers it in market"],
      renewalIndicators: ["Owner committed to 12-month digital marketing investment"],
      cancellationIndicators: [],
      callInsights: ["Client embarrassed by current website. Very motivated to act. Corporate wellness could be major upsell."],
      actionItems: ["Start redesign discovery", "Define corporate wellness landing page", "Plan SEO handoff post-launch"],
    },
    recommendedServices: [
      { id: "rs-005-1", service: "Website", reason: "Site requires complete rebuild — too broken to repair.", estimatedMonthlyRevenue: 250, setupFee: 5000 },
      { id: "rs-005-2", service: "SEO", reason: "Post-redesign SEO foundation required to retain any ranking equity.", estimatedMonthlyRevenue: 1200, setupFee: 1500 },
    ],
    recommendedLineItems: [
      { id: "li-005-1", name: "Website Redesign", category: "Web", setupFee: 5000, recurringFee: 0, deliveryStandard: "60 days"},
      { id: "li-005-2", name: "Website Maintenance (Monthly)", category: "Web", setupFee: 0, recurringFee: 250, deliveryStandard: "Ongoing"},
    ],
    recommendedPackage: "Full Service",
    packageServices: ["Website Redesign", "Website Maintenance", "SEO Setup & Onboarding", "SEO Monthly Management"],
    packageSetupTotal: 6500,
    packageMonthlyTotal: 1450,
    notes: "Accepted. Website redesign project started May 22.",
  },
  {
    id: "rec-006",
    client: "Blue Ridge Plumbing",
    industry: "Plumbing",
    recommendationType: "Service Recommendation",
    source: "Audit Findings",
    priority: "Critical",
    department: "Reporting",
    estimatedRevenue: 850,
    aiScoring: { confidenceScore: 97, impactScore: 96, revenueOpportunity: 10200, complexityScore: 25, urgencyScore: 95 },
    status: "New",
    createdDate: "Jun 7, 2025",
    createdBy: "AI Engine",
    summary: "Zero call tracking, no GTM, no Meta Pixel, and forms not tracked. Running $2,500/mo PPC with no attribution whatsoever. Fix tracking first.",
    auditFindings: [
      "Zero call tracking despite phone being primary lead channel",
      "No Google Tag Manager installed",
      "Contact form not tracked — no conversion data",
      "No Meta Pixel — cannot run any remarketing",
    ],
    communicationSignals: {
      clientConcerns: ["Cannot prove lead source to ownership", "PPC vendor says it's working but no data to confirm"],
      requestedServices: ["Tracking setup", "Call tracking"],
      growthOpportunities: ["If tracking proves PPC ROI, client will double budget"],
      renewalIndicators: [],
      cancellationIndicators: ["May cancel PPC if can't prove ROI within 60 days"],
      callInsights: ["Client at risk of cancelling PPC without proof of ROI. Tracking setup is retention-critical."],
      actionItems: ["Install GTM immediately", "Set up call tracking", "Configure form tracking"],
    },
    recommendedServices: [
      { id: "rs-006-1", service: "Reporting", reason: "Zero attribution on any channel — foundational fix before anything else.", estimatedMonthlyRevenue: 150, setupFee: 700 },
    ],
    recommendedLineItems: [
      { id: "li-006-1", name: "Tracking & Analytics Setup", category: "Reporting", setupFee: 700, recurringFee: 0, deliveryStandard: "8 days"},
      { id: "li-006-2", name: "Call Tracking Setup", category: "Reporting", setupFee: 300, recurringFee: 150, deliveryStandard: "3 days"},
    ],
    recommendedPackage: "Custom Package",
    packageServices: ["Tracking & Analytics Setup", "Call Tracking Setup"],
    packageSetupTotal: 1000,
    packageMonthlyTotal: 150,
    notes: "Retention risk — cancellation indicators present. Tracking setup must happen within 7 days.",
  },
  {
    id: "rec-007",
    client: "NovaCare Physical Therapy",
    industry: "Physical Therapy",
    recommendationType: "Service Recommendation",
    source: "Call Summary",
    priority: "Critical",
    department: "AI Automation",
    estimatedRevenue: 950,
    aiScoring: { confidenceScore: 95, impactScore: 94, revenueOpportunity: 11400, complexityScore: 45, urgencyScore: 92 },
    status: "In Review",
    createdDate: "Jun 3, 2025",
    createdBy: "AI Engine",
    summary: "34% of inbound calls missed during peak hours. No call script, no missed-call automation. Each missed call = $280 estimated lifetime value loss.",
    auditFindings: [
      "34% missed call rate during peak hours (11am–2pm)",
      "No standardized call intake script",
      "Missed calls receive zero automatic follow-up",
      "No call recording or scoring capability",
    ],
    communicationSignals: {
      clientConcerns: ["Front desk overwhelmed during lunch hours", "Patients going to competitor because calls go unanswered"],
      requestedServices: ["Missed call automation", "AI voice agent"],
      growthOpportunities: ["AI chat widget for after-hours booking", "Online booking integration"],
      renewalIndicators: ["Annual budget review in August — timing opportunity"],
      cancellationIndicators: [],
      callInsights: ["GM very excited about automation solution. Calculated 34% miss rate means ~12 missed patients per week at $280 LTV each."],
      actionItems: ["Present missed call SMS automation ROI model", "Demo AI chat widget", "Prepare automation proposal"],
    },
    recommendedServices: [
      { id: "rs-007-1", service: "AI Automation", reason: "34% missed call rate = ~$3,360/week in lost patient LTV.", estimatedMonthlyRevenue: 650, setupFee: 1400 },
      { id: "rs-007-2", service: "GBP", reason: "4 locations, 2 not ranking in local pack — GBP optimization needed.", estimatedMonthlyRevenue: 500, setupFee: 350 },
    ],
    recommendedLineItems: [
      { id: "li-007-1", name: "Call Tracking & Intelligence Setup", category: "Reporting", setupFee: 600, recurringFee: 200, deliveryStandard: "5 days"},
      { id: "li-007-2", name: "Missed Call SMS Automation", category: "Automation", setupFee: 800, recurringFee: 150, deliveryStandard: "7 days"},
    ],
    recommendedPackage: "AI Voice Agent",
    packageServices: ["Call Tracking & Intelligence Setup", "Missed Call SMS Automation", "GBP Optimization"],
    packageSetupTotal: 1750,
    packageMonthlyTotal: 950,
    notes: "Strong ROI story — presenting at August budget review.",
  },
  {
    id: "rec-008",
    client: "Summit Landscaping",
    industry: "Landscaping",
    recommendationType: "Package Recommendation",
    source: "Audit Findings",
    priority: "High",
    department: "SEO",
    estimatedRevenue: 1900,
    aiScoring: { confidenceScore: 91, impactScore: 88, revenueOpportunity: 22800, complexityScore: 50, urgencyScore: 78 },
    status: "New",
    createdDate: "Jun 3, 2025",
    createdBy: "AI Engine",
    summary: "220+ competitor keyword gaps, no blog, thin service pages, and missing seasonal PPC presence. Full SEO + PPC package will capture lost organic and paid traffic.",
    auditFindings: [
      "220+ competitor keywords where client has zero ranking",
      "No blog or content hub — competitors capturing 8,000+ monthly searches",
      "Service pages averaging 150 words — insufficient for ranking",
      "No seasonal PPC — missing peak spring/summer revenue window",
      "47 reviews vs competitor average of 120",
    ],
    communicationSignals: {
      clientConcerns: ["Losing landscaping jobs to competitors who show up first on Google"],
      requestedServices: ["SEO", "PPC", "Content writing"],
      growthOpportunities: ["Irrigation and drainage specialty — competitors ignore it", "Round Rock, Cedar Park expansion markets"],
      renewalIndicators: [],
      cancellationIndicators: [],
      callInsights: ["Owner understands the content gap and wants a content calendar. Seasonal PPC for spring was big interest."],
      actionItems: ["Build seasonal PPC proposal for Q3", "Create SEO content strategy", "Propose location page expansion"],
    },
    recommendedServices: [
      { id: "rs-008-1", service: "SEO", reason: "220+ keyword gaps require structured monthly content and technical strategy.", estimatedMonthlyRevenue: 1200, setupFee: 1500 },
      { id: "rs-008-2", service: "PPC", reason: "Missing peak season paid presence vs 3 active competitors.", estimatedMonthlyRevenue: 1200, setupFee: 1200 },
    ],
    recommendedLineItems: [
      { id: "li-008-1", name: "SEO Setup & Onboarding", category: "SEO", setupFee: 1500, recurringFee: 0, deliveryStandard: "12 days"},
      { id: "li-008-2", name: "SEO Monthly Management", category: "SEO", setupFee: 0, recurringFee: 1200, deliveryStandard: "Ongoing"},
      { id: "li-008-3", name: "PPC Campaign Setup", category: "PPC", setupFee: 1200, recurringFee: 0, deliveryStandard: "14 days"},
      { id: "li-008-4", name: "PPC Monthly Management", category: "PPC", setupFee: 0, recurringFee: 1200, deliveryStandard: "Ongoing"},
    ],
    recommendedPackage: "SEO Growth",
    packageServices: ["SEO Setup & Onboarding", "SEO Monthly Management", "PPC Campaign Setup", "PPC Monthly Management"],
    packageSetupTotal: 2700,
    packageMonthlyTotal: 2400,
    notes: "Seasonal urgency — spring PPC window closes in 6 weeks.",
  },
  {
    id: "rec-009",
    client: "Westbrook Law Group",
    industry: "Legal",
    recommendationType: "Service Recommendation",
    source: "Audit Findings",
    priority: "High",
    department: "AI Automation",
    estimatedRevenue: 3200,
    aiScoring: { confidenceScore: 96, impactScore: 94, revenueOpportunity: 38400, complexityScore: 65, urgencyScore: 87 },
    status: "In Review",
    createdDate: "Jun 5, 2025",
    createdBy: "AI Engine",
    summary: "Fully manual intake process losing 3–4 consultation opportunities per week. No lead nurturing, no chatbot, no online booking. AI automation will recover lost consultations.",
    auditFindings: [
      "No lead nurturing automation — competitors follow up within minutes",
      "No chatbot or AI assistant — urgent legal question visitors bounce",
      "No online booking — manual phone scheduling only",
      "No CRM — leads tracked in spreadsheets",
    ],
    communicationSignals: {
      clientConcerns: ["Losing 3–4 consultations per week due to slow manual follow-up", "Staff can't keep up with inquiry volume"],
      requestedServices: ["CRM", "Lead automation", "AI chatbot"],
      growthOpportunities: ["Online consultation booking", "Automated intake questionnaire"],
      renewalIndicators: ["Managing partner mentioned wanting a long-term digital partner"],
      cancellationIndicators: [],
      callInsights: ["Managing partner calculated lost revenue at 3–4 consults/week × $5,000 avg case value = $15,000–$20,000/mo in missed revenue."],
      actionItems: ["Demo CRM options", "Build automation ROI model", "Show AI chatbot legal intake example"],
    },
    recommendedServices: [
      { id: "rs-009-1", service: "AI Automation", reason: "Manual intake losing 3–4 consultations/week = $15,000–$20,000/mo in missed revenue.", estimatedMonthlyRevenue: 800, setupFee: 3700 },
      { id: "rs-009-2", service: "Hosting", reason: "Law firm on shared hosting with no security monitoring — liability risk.", estimatedMonthlyRevenue: 250, setupFee: 1000 },
    ],
    recommendedLineItems: [
      { id: "li-009-1", name: "AI Automation Setup", category: "Automation", setupFee: 2500, recurringFee: 500, deliveryStandard: "21 days"},
      { id: "li-009-2", name: "CRM Setup & Configuration", category: "CRM", setupFee: 1200, recurringFee: 200, deliveryStandard: "14 days"},
      { id: "li-009-3", name: "AI Chatbot Implementation", category: "Automation", setupFee: 1500, recurringFee: 300, deliveryStandard: "10 days"},
    ],
    recommendedPackage: "AI Voice Agent",
    packageServices: ["AI Automation Setup", "CRM Setup", "AI Chatbot Implementation"],
    packageSetupTotal: 5200,
    packageMonthlyTotal: 1000,
    notes: "High-value account. Managing partner is the decision maker — schedule demo.",
  },
  {
    id: "rec-010",
    client: "Harbor Auto Group",
    industry: "Automotive",
    recommendationType: "Risk Recommendation",
    source: "Audit Findings",
    priority: "Critical",
    department: "Web",
    estimatedRevenue: 1400,
    aiScoring: { confidenceScore: 99, impactScore: 98, revenueOpportunity: 16800, complexityScore: 35, urgencyScore: 100 },
    status: "New",
    createdDate: "Jun 8, 2025",
    createdBy: "AI Engine",
    summary: "CRITICAL: SSL certificate expired 14 days ago. Browsers showing 'Not Secure' warning. 68% of visitors immediately leaving. Hosting migration and security overhaul required immediately.",
    auditFindings: [
      "SSL certificate expired 14 days ago — browsers showing 'Not Secure'",
      "No automated backups — last manual backup 11 months ago",
      "No CDN — 8x slower for users outside 50-mile radius",
      "WordPress 5.2.8 — 14 known security vulnerabilities unpatched",
      "Shared hosting causing 1.8s server response time",
    ],
    communicationSignals: {
      clientConcerns: ["Customers calling to ask why website shows security warning", "Worried about data breach"],
      requestedServices: ["SSL fix", "Security update", "Hosting upgrade"],
      growthOpportunities: [],
      renewalIndicators: [],
      cancellationIndicators: ["Owner threatening to call their web developer — we need to act first"],
      callInsights: ["Emergency situation. Client panicking about 'Not Secure' warning. Immediate action builds trust and retention."],
      actionItems: ["Fix SSL immediately", "Update WordPress core today", "Migrate to managed hosting this week"],
    },
    recommendedServices: [
      { id: "rs-010-1", service: "Hosting", reason: "Expired SSL + shared hosting causing immediate revenue loss and security risk.", estimatedMonthlyRevenue: 400, setupFee: 1200 },
    ],
    recommendedLineItems: [
      { id: "li-010-1", name: "SSL Certificate & Cloudflare Setup", category: "Security", setupFee: 400, recurringFee: 0, deliveryStandard: "2 days"},
      { id: "li-010-2", name: "Hosting Migration", category: "Hosting", setupFee: 800, recurringFee: 0, deliveryStandard: "5 days"},
      { id: "li-010-3", name: "Managed Hosting (Monthly)", category: "Hosting", setupFee: 0, recurringFee: 150, deliveryStandard: "Ongoing"},
      { id: "li-010-4", name: "Website Security & Maintenance", category: "Security", setupFee: 0, recurringFee: 250, deliveryStandard: "Ongoing"},
    ],
    recommendedPackage: "Hosting + Maintenance",
    packageServices: ["SSL Fix", "Hosting Migration", "Managed Hosting", "Security Maintenance"],
    packageSetupTotal: 1200,
    packageMonthlyTotal: 400,
    notes: "EMERGENCY. Act within 24 hours or risk losing client.",
  },
  {
    id: "rec-011",
    client: "Metro Dental Group",
    industry: "Dental",
    recommendationType: "Upsell Recommendation",
    source: "Call Summary",
    priority: "High",
    department: "Paid Advertising",
    estimatedRevenue: 1200,
    aiScoring: { confidenceScore: 88, impactScore: 85, revenueOpportunity: 14400, complexityScore: 50, urgencyScore: 72 },
    status: "New",
    createdDate: "Jun 5, 2025",
    createdBy: "AI Engine",
    summary: "Existing SEO client with confirmed PPC audit revealing no landing pages and no negative keyword list. 40%+ of PPC budget wasted. PPC upsell opportunity.",
    auditFindings: [
      "No dedicated landing pages — all paid traffic to homepage",
      "Zero negative keyword list — 40%+ wasted spend",
      "Form submissions not tracked in Google Ads",
    ],
    communicationSignals: {
      clientConcerns: ["PPC not generating enough cosmetic dental leads"],
      requestedServices: ["PPC optimization", "Dedicated landing pages"],
      growthOpportunities: ["Cosmetic dentistry landing page campaign", "Emergency dental PPC"],
      renewalIndicators: ["Recently renewed SEO contract — strong relationship"],
      cancellationIndicators: [],
      callInsights: ["Client happy with SEO results and open to expanding service scope. PPC restructure is natural next step."],
      actionItems: ["Propose PPC restructure add-on", "Show waste analysis", "Build landing page mockup"],
    },
    recommendedServices: [
      { id: "rs-011-1", service: "PPC", reason: "Current account structure wasting 40%+ of budget. Restructure will dramatically improve ROI.", estimatedMonthlyRevenue: 1200, setupFee: 1200 },
    ],
    recommendedLineItems: [
      { id: "li-011-1", name: "PPC Campaign Setup", category: "PPC", setupFee: 1200, recurringFee: 0, deliveryStandard: "14 days"},
      { id: "li-011-2", name: "PPC Monthly Management", category: "PPC", setupFee: 0, recurringFee: 1200, deliveryStandard: "Ongoing"},
    ],
    recommendedPackage: "PPC + Landing Page",
    packageServices: ["PPC Campaign Setup", "PPC Monthly Management"],
    packageSetupTotal: 1200,
    packageMonthlyTotal: 1200,
    notes: "Existing client — high close probability. Pitch as revenue recovery, not new spend.",
  },
  {
    id: "rec-012",
    client: "NovaCare Physical Therapy",
    industry: "Physical Therapy",
    recommendationType: "Service Recommendation",
    source: "Audit Findings",
    priority: "Critical",
    department: "GBP",
    estimatedRevenue: 1200,
    aiScoring: { confidenceScore: 96, impactScore: 93, revenueOpportunity: 14400, complexityScore: 32, urgencyScore: 91 },
    status: "New",
    createdDate: "Jun 4, 2025",
    createdBy: "AI Engine",
    summary: "4 PT locations averaging 22 reviews each. 2 locations completely absent from local pack. Zero GBP posts from any location. Multi-location GBP management required.",
    auditFindings: [
      "2 of 4 locations not appearing in local pack for PT searches",
      "22 average reviews per location vs 75+ benchmark for local pack",
      "Zero GBP posts from all 4 locations",
    ],
    communicationSignals: {
      clientConcerns: ["Two locations underperforming vs other two", "New competitor PT clinic opened nearby"],
      requestedServices: ["GBP management for all locations", "Review strategy"],
      growthOpportunities: ["Sports medicine specialty — no competitor in area promotes it"],
      renewalIndicators: ["Long-term client — 2 years"],
      cancellationIndicators: [],
      callInsights: ["Strong relationship. Client trusts our recommendations. Present as complete location health package."],
      actionItems: ["Set up review automation for all 4 locations", "Begin weekly GBP posting per location", "Citation audit"],
    },
    recommendedServices: [
      { id: "rs-012-1", service: "GBP", reason: "4 locations, 2 not ranking — urgent per-location intervention.", estimatedMonthlyRevenue: 1200, setupFee: 350 },
    ],
    recommendedLineItems: [
      { id: "li-012-1", name: "GBP Monthly Management (4 Locations)", category: "GBP", setupFee: 0, recurringFee: 1200, deliveryStandard: "Ongoing"},
      { id: "li-012-2", name: "GBP Setup & Optimization", category: "GBP", setupFee: 350, recurringFee: 0, deliveryStandard: "3 days"},
    ],
    recommendedPackage: "SEO + GBP",
    packageServices: ["GBP Setup & Optimization", "GBP Monthly Management (4 Locations)"],
    packageSetupTotal: 350,
    packageMonthlyTotal: 1200,
    notes: "Long-term client relationship. High trust — straightforward close.",
  },
  {
    id: "rec-013",
    client: "Summit Landscaping",
    industry: "Landscaping",
    recommendationType: "Service Recommendation",
    source: "Audit Findings",
    priority: "High",
    department: "SEO",
    estimatedRevenue: 1900,
    aiScoring: { confidenceScore: 92, impactScore: 88, revenueOpportunity: 22800, complexityScore: 48, urgencyScore: 77 },
    status: "In Review",
    createdDate: "Jun 2, 2025",
    createdBy: "AI Engine",
    summary: "No blog content, thin service pages (150 words avg), and no location-specific pages for 3 expansion markets. SEO content strategy critical to capture seasonal search volume.",
    auditFindings: [
      "Zero blog posts — competitors capturing 8,000+ monthly seasonal searches",
      "Service pages averaging 150 words — below ranking threshold",
      "No location pages for Round Rock, Cedar Park, or Georgetown",
    ],
    communicationSignals: {
      clientConcerns: ["Not showing up for seasonal landscaping searches"],
      requestedServices: ["Blog content", "Location pages", "SEO"],
      growthOpportunities: ["3 expansion market location pages", "Seasonal content calendar"],
      renewalIndicators: [],
      cancellationIndicators: [],
      callInsights: ["Client understands content gap. Agreed content is the missing piece after seeing competitor blog volume."],
      actionItems: ["Develop content calendar", "Write first 2 service pages", "Build 3 location pages"],
    },
    recommendedServices: [
      { id: "rs-013-1", service: "SEO", reason: "Content gaps require structured monthly content and on-page strategy.", estimatedMonthlyRevenue: 1200, setupFee: 1500 },
    ],
    recommendedLineItems: [
      { id: "li-013-1", name: "SEO Setup & Onboarding", category: "SEO", setupFee: 1500, recurringFee: 0, deliveryStandard: "12 days"},
      { id: "li-013-2", name: "Content Writing (4 Articles/mo)", category: "Content", setupFee: 0, recurringFee: 700, deliveryStandard: "Ongoing"},
    ],
    recommendedPackage: "SEO Starter",
    packageServices: ["SEO Setup & Onboarding", "SEO Monthly Management", "Content Writing (4 Articles/mo)"],
    packageSetupTotal: 1500,
    packageMonthlyTotal: 1900,
    notes: "Combine with PPC recommendation for full proposal.",
  },
  {
    id: "rec-014",
    client: "Iron Mark Fitness",
    industry: "Fitness",
    recommendationType: "Upsell Recommendation",
    source: "Audit Findings",
    priority: "High",
    department: "Paid Advertising",
    estimatedRevenue: 1200,
    aiScoring: { confidenceScore: 87, impactScore: 84, revenueOpportunity: 14400, complexityScore: 38, urgencyScore: 74 },
    status: "New",
    createdDate: "May 22, 2025",
    createdBy: "AI Engine",
    summary: "Meta Pixel installed with ViewContent only. No active campaigns. Competitor has zero paid social presence — first-mover opportunity to dominate.",
    auditFindings: [
      "Pixel has only ViewContent event — missing Lead and Purchase",
      "Zero Meta campaigns while gym memberships have high visual ad affinity",
      "No customer email list uploaded for lookalike expansion",
    ],
    communicationSignals: {
      clientConcerns: ["Need to grow membership base faster"],
      requestedServices: ["Social media ads", "Meta campaign"],
      growthOpportunities: ["Free trial offer campaign", "Corporate wellness membership campaign"],
      renewalIndicators: ["Website project going well — natural upsell moment"],
      cancellationIndicators: [],
      callInsights: ["Website redesign client. Post-launch, Meta Ads is the natural next service to drive membership leads."],
      actionItems: ["Present Meta Ads as website launch complement", "Build free trial campaign concept"],
    },
    recommendedServices: [
      { id: "rs-014-1", service: "Meta Ads", reason: "Competitor has no paid social presence — first-mover advantage available.", estimatedMonthlyRevenue: 1200, setupFee: 900 },
    ],
    recommendedLineItems: [
      { id: "li-014-1", name: "Meta Ads Setup", category: "Meta Ads", setupFee: 900, recurringFee: 0, deliveryStandard: "10 days"},
      { id: "li-014-2", name: "Meta Ads Monthly Management", category: "Meta Ads", setupFee: 0, recurringFee: 1200, deliveryStandard: "Ongoing"},
    ],
    recommendedPackage: "Custom Package",
    packageServices: ["Meta Ads Setup", "Meta Ads Monthly Management"],
    packageSetupTotal: 900,
    packageMonthlyTotal: 1200,
    notes: "Time upsell pitch to website launch for maximum momentum.",
  },
  {
    id: "rec-015",
    client: "Harbor Auto Group",
    industry: "Automotive",
    recommendationType: "Renewal Recommendation",
    source: "Renewal Signal",
    priority: "High",
    department: "GBP",
    estimatedRevenue: 1300,
    aiScoring: { confidenceScore: 90, impactScore: 87, revenueOpportunity: 15600, complexityScore: 20, urgencyScore: 82 },
    status: "In Review",
    createdDate: "Jun 9, 2025",
    createdBy: "AI Engine",
    summary: "GBP contract renewal in 30 days. Client mentioned 3-year relationship loyalty on discovery call. Strong renewal candidate — expand to full GBP + Review service.",
    auditFindings: [],
    communicationSignals: {
      clientConcerns: ["Wants to ensure continued local dominance"],
      requestedServices: ["GBP renewal", "Expanded review management"],
      growthOpportunities: ["Website redesign upsell", "PPC for inventory"],
      renewalIndicators: ["Mentioned 3-year relationship and loyalty", "GBP contract expires July 15"],
      cancellationIndicators: [],
      callInsights: ["Long-term client with strong loyalty. Renewal is high probability. Expand scope to add review management."],
      actionItems: ["Send renewal proposal 2 weeks early", "Include upsell options", "Schedule renewal call"],
    },
    recommendedServices: [
      { id: "rs-015-1", service: "GBP", reason: "Contract renewal — expand to include review management and reporting.", estimatedMonthlyRevenue: 1300, setupFee: 0 },
    ],
    recommendedLineItems: [
      { id: "li-015-1", name: "GBP Monthly Management", category: "GBP", setupFee: 0, recurringFee: 500, deliveryStandard: "Ongoing"},
      { id: "li-015-2", name: "Review Generation (Monthly)", category: "GBP", setupFee: 0, recurringFee: 300, deliveryStandard: "Ongoing"},
      { id: "li-015-3", name: "GBP Reporting", category: "Reporting", setupFee: 0, recurringFee: 500, deliveryStandard: "Ongoing"},
    ],
    recommendedPackage: "SEO + GBP",
    packageServices: ["GBP Monthly Management", "Review Generation", "GBP Reporting"],
    packageSetupTotal: 0,
    packageMonthlyTotal: 1300,
    notes: "Renewal due July 15. Send proposal by July 1.",
  },
  {
    id: "rec-016",
    client: "Blue Ridge Plumbing",
    industry: "Plumbing",
    recommendationType: "Retention Recommendation",
    source: "Client Health",
    priority: "High",
    department: "Paid Advertising",
    estimatedRevenue: 1500,
    aiScoring: { confidenceScore: 85, impactScore: 83, revenueOpportunity: 18000, complexityScore: 35, urgencyScore: 90 },
    status: "New",
    createdDate: "Jun 8, 2025",
    createdBy: "AI Engine",
    summary: "Client threatening to cancel PPC if ROI cannot be proven within 60 days. Retention requires immediate tracking fix and clear reporting dashboard.",
    auditFindings: [
      "No conversion tracking — cannot prove PPC ROI",
      "Client mentioned exploring other agencies",
    ],
    communicationSignals: {
      clientConcerns: ["Cannot justify $2,500/mo PPC without lead attribution", "Considering switching vendors"],
      requestedServices: ["Better reporting", "Proof of ROI"],
      growthOpportunities: [],
      renewalIndicators: [],
      cancellationIndicators: ["Explicitly mentioned exploring other agencies", "60-day ultimatum on ROI proof"],
      callInsights: ["At-risk client. Fix tracking first, then show dashboard with call attribution. This is a retention emergency."],
      actionItems: ["Fix tracking within 7 days", "Set up reporting dashboard", "Schedule monthly performance call"],
    },
    recommendedServices: [
      { id: "rs-016-1", service: "Reporting", reason: "Prove ROI to save $1,500/mo PPC contract.", estimatedMonthlyRevenue: 150, setupFee: 700 },
      { id: "rs-016-2", service: "PPC", reason: "Rebuild campaign while tracking is fixed to maximize demonstrable results.", estimatedMonthlyRevenue: 1500, setupFee: 0 },
    ],
    recommendedLineItems: [
      { id: "li-016-1", name: "Tracking & Analytics Setup", category: "Reporting", setupFee: 700, recurringFee: 0, deliveryStandard: "8 days"},
      { id: "li-016-2", name: "Monthly Performance Dashboard", category: "Reporting", setupFee: 0, recurringFee: 150, deliveryStandard: "Ongoing"},
    ],
    recommendedPackage: "Custom Package",
    packageServices: ["Tracking & Analytics Setup", "Monthly Performance Dashboard"],
    packageSetupTotal: 700,
    packageMonthlyTotal: 150,
    notes: "RETENTION PRIORITY. Fix tracking within 7 days to prevent cancellation.",
  },
  {
    id: "rec-017",
    client: "Westbrook Law Group",
    industry: "Legal",
    recommendationType: "Service Recommendation",
    source: "Audit Findings",
    priority: "Medium",
    department: "Web",
    estimatedRevenue: 250,
    aiScoring: { confidenceScore: 91, impactScore: 88, revenueOpportunity: 3000, complexityScore: 28, urgencyScore: 68 },
    status: "New",
    createdDate: "Jun 6, 2025",
    createdBy: "AI Engine",
    summary: "Law firm on entry-level shared hosting with no security monitoring, no backup strategy, and performance degrading under traffic spikes — liability for a firm handling sensitive client data.",
    auditFindings: [
      "No security monitoring — no malware scanning or firewall",
      "Last backup 4 months ago — no automated schedule",
      "Server response time spikes to 3.2s during business hours",
    ],
    communicationSignals: {
      clientConcerns: ["Worried about client data security on shared hosting"],
      requestedServices: ["Managed hosting", "Security monitoring"],
      growthOpportunities: [],
      renewalIndicators: [],
      cancellationIndicators: [],
      callInsights: ["Managing partner is security-conscious. Hosting upgrade is easy sell given their liability exposure on shared hosting."],
      actionItems: ["Present managed hosting proposal", "Highlight security compliance benefits", "Offer bundled with AI automation"],
    },
    recommendedServices: [
      { id: "rs-017-1", service: "Hosting", reason: "Law firm on shared hosting with sensitive client data — security liability.", estimatedMonthlyRevenue: 250, setupFee: 1000 },
    ],
    recommendedLineItems: [
      { id: "li-017-1", name: "Hosting Migration", category: "Hosting", setupFee: 800, recurringFee: 0, deliveryStandard: "5 days"},
      { id: "li-017-2", name: "Managed Hosting (Monthly)", category: "Hosting", setupFee: 0, recurringFee: 150, deliveryStandard: "Ongoing"},
      { id: "li-017-3", name: "Security Monitoring (Monthly)", category: "Security", setupFee: 200, recurringFee: 100, deliveryStandard: "3 days"},
    ],
    recommendedPackage: "Hosting + Maintenance",
    packageServices: ["Hosting Migration", "Managed Hosting", "Security Monitoring"],
    packageSetupTotal: 1000,
    packageMonthlyTotal: 250,
    notes: "Bundle with AI automation recommendation for full proposal.",
  },
  {
    id: "rec-018",
    client: "Metro Dental Group",
    industry: "Dental",
    recommendationType: "Upsell Recommendation",
    source: "Upsell Signal",
    priority: "Medium",
    department: "GBP",
    estimatedRevenue: 500,
    aiScoring: { confidenceScore: 83, impactScore: 80, revenueOpportunity: 6000, complexityScore: 22, urgencyScore: 65 },
    status: "New",
    createdDate: "Jun 5, 2025",
    createdBy: "AI Engine",
    summary: "Discovery call revealed client has 3 GBP locations with minimal optimization. SEO client with no GBP management — natural cross-sell for the expansion plan.",
    auditFindings: [
      "3 GBP locations with inconsistent NAP information",
      "Low review volume across all locations",
      "No GBP posting strategy",
    ],
    communicationSignals: {
      clientConcerns: ["Locations not showing up consistently in local search"],
      requestedServices: ["GBP for all 3 locations"],
      growthOpportunities: ["3rd location launch — perfect GBP optimization moment"],
      renewalIndicators: ["Signed 12-month SEO agreement — strong foundation"],
      cancellationIndicators: [],
      callInsights: ["SEO client expanding to 3 locations. GBP cross-sell is natural and high-value for multi-location dental group."],
      actionItems: ["Propose GBP management for all 3 locations", "Bundle with existing SEO for discount"],
    },
    recommendedServices: [
      { id: "rs-018-1", service: "GBP", reason: "3 locations with no GBP management — natural cross-sell for SEO client.", estimatedMonthlyRevenue: 500, setupFee: 1050 },
    ],
    recommendedLineItems: [
      { id: "li-018-1", name: "GBP Setup (3 Locations)", category: "GBP", setupFee: 1050, recurringFee: 0, deliveryStandard: "3 days"},
      { id: "li-018-2", name: "GBP Monthly Management (3 Locations)", category: "GBP", setupFee: 0, recurringFee: 750, deliveryStandard: "Ongoing"},
    ],
    recommendedPackage: "SEO + GBP",
    packageServices: ["GBP Setup (3 Locations)", "GBP Monthly Management (3 Locations)"],
    packageSetupTotal: 1050,
    packageMonthlyTotal: 750,
    notes: "Bundle with SEO for 10% multi-service discount pitch.",
  },
  {
    id: "rec-019",
    client: "Sunstate Solar",
    industry: "Solar",
    recommendationType: "Renewal Recommendation",
    source: "Renewal Signal",
    priority: "High",
    department: "Paid Advertising",
    estimatedRevenue: 1500,
    aiScoring: { confidenceScore: 92, impactScore: 90, revenueOpportunity: 18000, complexityScore: 20, urgencyScore: 85 },
    status: "In Review",
    createdDate: "Jun 9, 2025",
    createdBy: "AI Engine",
    summary: "PPC contract renewal in 45 days. Client recently accepted full rebuild proposal. Renewal is high probability given fixing broken tracking issue that threatened the relationship.",
    auditFindings: [],
    communicationSignals: {
      clientConcerns: ["Want to ensure new tracking setup is working before renewal"],
      requestedServices: ["PPC renewal", "Performance reporting"],
      growthOpportunities: ["Commercial solar campaign — untapped market segment"],
      renewalIndicators: ["Contract accepted after tracking fix", "Owner mentioned wanting long-term partnership"],
      cancellationIndicators: ["Mentioned exploring other agencies before we fixed tracking — risk mitigated"],
      callInsights: ["Relationship saved by fixing tracking. Renewal is natural. Add commercial solar campaign as growth upsell."],
      actionItems: ["Send renewal proposal with performance data", "Propose commercial solar campaign add-on", "Schedule QBR"],
    },
    recommendedServices: [
      { id: "rs-019-1", service: "PPC", reason: "Contract renewal — expand with commercial solar campaign for upsell.", estimatedMonthlyRevenue: 1500, setupFee: 0 },
    ],
    recommendedLineItems: [
      { id: "li-019-1", name: "PPC Monthly Management", category: "PPC", setupFee: 0, recurringFee: 1500, deliveryStandard: "Ongoing"},
    ],
    recommendedPackage: "PPC + Landing Page",
    packageServices: ["PPC Monthly Management", "Commercial Solar Campaign"],
    packageSetupTotal: 0,
    packageMonthlyTotal: 1500,
    notes: "Renewal due in 45 days. Include QBR showing tracking improvement results.",
  },
  {
    id: "rec-020",
    client: "NovaCare Physical Therapy",
    industry: "Physical Therapy",
    recommendationType: "Line Item Recommendation",
    source: "Audit Findings",
    priority: "Medium",
    department: "SEO",
    estimatedRevenue: 700,
    aiScoring: { confidenceScore: 86, impactScore: 83, revenueOpportunity: 8400, complexityScore: 40, urgencyScore: 71 },
    status: "New",
    createdDate: "Jun 4, 2025",
    createdBy: "AI Engine",
    summary: "No SEO strategy for 4-location PT practice. Competitors publishing weekly PT content and ranking for specialty terms. Content writing add-on will capture sports medicine and pediatric PT searches.",
    auditFindings: [
      "No blog content across any of the 4 locations",
      "Service pages averaging 200 words — too thin to rank",
      "Sports medicine and pediatric PT keywords completely unaddressed",
    ],
    communicationSignals: {
      clientConcerns: ["Not showing up when patients search for specific conditions"],
      requestedServices: ["Content writing", "SEO"],
      growthOpportunities: ["Sports medicine specialty — no competitor targets it", "Pediatric PT content gap"],
      renewalIndicators: ["Long-term client relationship — 2+ years"],
      cancellationIndicators: [],
      callInsights: ["Client mentioned multiple times that specialty content is the gap. Easy add-on sale to existing relationship."],
      actionItems: ["Propose content writing add-on", "Build specialty topic cluster plan", "Show competitor content analysis"],
    },
    recommendedServices: [
      { id: "rs-020-1", service: "SEO", reason: "Content writing add-on to capture specialty PT searches competitors are missing.", estimatedMonthlyRevenue: 700, setupFee: 500 },
    ],
    recommendedLineItems: [
      { id: "li-020-1", name: "SEO Content Writing (4 Articles/mo)", category: "Content", setupFee: 500, recurringFee: 700, deliveryStandard: "Ongoing"},
    ],
    recommendedPackage: "Custom Package",
    packageServices: ["SEO Content Writing (4 Articles/mo)"],
    packageSetupTotal: 500,
    packageMonthlyTotal: 700,
    notes: "Existing client — easy cross-sell. Frame as competitive advantage for specialty terms.",
  },
];

// 
// Color + Meta Helpers
// 

const PRIORITY_COLORS: Record<Priority, { bg?: string; text: string; border: string }> = {
  Critical: { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA"},
  High: { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA"},
  Medium: { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A"},
  Low: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0"},
};

const STATUS_COLORS: Record<RecStatus, { bg?: string; text: string; border: string }> = {
  New: { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE"},
  "In Review": { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A"},
  Accepted: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0"},
  Rejected: { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA"},
  "Proposal Sent": { bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE"},
  Won: { bg: "#ECFDF5", text: "#059669", border: "#A7F3D0"},
};

const REC_TYPE_META: Record<RecommendationType, { icon?: string; color?: string; bg?: string; border: string }> = {
  "Service Recommendation": { icon: "", color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE"},
  "Line Item Recommendation": { icon: "", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE"},
  "Package Recommendation": { icon: "", color: "#059669", bg: "#F0FDF4", border: "#BBF7D0"},
  "Renewal Recommendation": { icon: "", color: "#0369A1", bg: "#F0F9FF", border: "#BAE6FD"},
  "Upsell Recommendation": { icon: "", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A"},
  "Retention Recommendation": { icon: "", color: "#BE123C", bg: "#FFF1F2", border: "#FECDD3"},
  "Risk Recommendation": { icon: "", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA"},
};

const SOURCE_META: Record<InputSource, { icon?: string; color?: string }> = {
  "Audit Findings": { icon: "", color: "#1D4ED8"},
  "Call Summary": { icon: "", color: "#0369A1"},
  "Client Notes": { icon: "", color: "#D97706"},
  "Meeting Notes": { icon: "", color: "#7C3AED"},
  "Renewal Signal": { icon: "", color: "#059669"},
  "Upsell Signal": { icon: "", color: "#C2410C"},
  "Project Health": { icon: "", color: "#15803D"},
  "Client Health": { icon: "", color: "#DC2626"},
};

const SERVICE_ICONS: Record<ServiceType, string> = {
  SEO: "",
  GBP: "",
  PPC: "",
  "Meta Ads": "",
  LSA: "",
  Website: "",
  Hosting: "",
  "AI Automation": "",
  Reporting: "",
};

function scoreBarColor(score: number): string {
  if (score >= 90) return "#059669";
  if (score >= 70) return "#D97706";
  if (score >= 50) return "#EA580C";
  return "#DC2626";
}

// 
// Shared UI
// 

function Badge({ label, bg, text, border }: { label: string; bg?: string; text: string; border?: string }) {
  return (
    <span
      className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap"style={{ background: bg, color: text, borderColor: border ?? "transparent"}}
    >
      {label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const c = PRIORITY_COLORS[priority];
  return <Badge label={priority} bg={c.bg} text={c.text} border={c.border} />;
}

function StatusBadge({ status }: { status: RecStatus }) {
  const c = STATUS_COLORS[status];
  return <Badge label={status} bg={c.bg} text={c.text} border={c.border} />;
}

function RecTypeBadge({ type }: { type: RecommendationType }) {
  const m = REC_TYPE_META[type];
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap"style={{ background: m.bg, color: m.color, borderColor: m.border }}
    >
      <span>{m.icon}</span>
      <span>{type}</span>
    </span>
  );
}

function ScoreBar({ label, score, max = 100 }: { label: string; score: number; max?: number }) {
  const pct = Math.min(100, (score / max) * 100);
  return (
    <div>
      <div className="flex justify-between items-center mb-0.5">
        <span className="text-[10px] font-semibold"style={{ color: "var(--rtm-text-muted)"}}>
          {label}
        </span>
        <span className="text-[10px] font-black"style={{ color: scoreBarColor(score) }}>
          {score}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden"style={{ background: "#E5E7EB"}}>
        <div
          className="h-full rounded-full transition-all"style={{ width: `${pct}%`, background: scoreBarColor(score) }}
        />
      </div>
    </div>
  );
}

// 
// KPI Cards
// 

function KPICards({ recs }: { recs: Recommendation[] }) {
  const totalRecs = recs.length;
  const proposalOpps = recs.filter((r) => r.status === "New"|| r.status === "In Review").length;
  const upsellOpps = recs.filter((r) => r.recommendationType === "Upsell Recommendation").length;
  const renewalOpps = recs.filter((r) => r.recommendationType === "Renewal Recommendation").length;
  const estRevenue = recs.reduce((s, r) => s + r.estimatedRevenue, 0);
  const highPriority = recs.filter((r) => r.priority === "Critical"|| r.priority === "High").length;

  const cards = [
    { label: "Recommendations Generated", value: totalRecs, color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE"},
    { label: "Proposal Opportunities", value: proposalOpps, icon: "", color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE"},
    { label: "Upsell Opportunities", value: upsellOpps, icon: "", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A"},
    { label: "Renewal Opportunities", value: renewalOpps, color: "#0369A1", bg: "#F0F9FF", border: "#BAE6FD"},
    { label: "Est. Revenue Opportunity", value: `$${(estRevenue * 12).toLocaleString()}`, icon: "", color: "#059669", bg: "#ECFDF5", border: "#A7F3D0"},
    { label: "High Priority Recommendations", value: highPriority, color: "#DC2626", bg: "#FEF2F2", border: "#FECACA"},
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border p-5 text-center"style={{ background: c.bg, borderColor: c.border }}>
          <div className="text-2xl mb-1">{c.icon}</div>
          <div className="text-2xl font-black"style={{ color: c.color }}>{c.value}</div>
          <div className="text-[10px] font-semibold mt-1 leading-tight"style={{ color: c.color }}>{c.label}</div>
        </div>
      ))}
    </div>
  );
}

// 
// AI Executive Summary
// 

function AIExecutiveSummary({ recs }: { recs: Recommendation[] }) {
  const topOpps = recs.filter((r) => r.priority === "Critical").slice(0, 5);
  const largestRevenue = [...recs].sort((a, b) => b.estimatedRevenue - a.estimatedRevenue).slice(0, 5);
  const highRisk = recs.filter((r) =>
    r.recommendationType === "Retention Recommendation"|| r.recommendationType === "Risk Recommendation").slice(0, 5);
  const highConfidence = [...recs].sort((a, b) => b.aiScoring.confidenceScore - a.aiScoring.confidenceScore).slice(0, 5);

  return (
    <div className="rounded-xl border overflow-hidden"style={{ borderColor: "#DDD6FE"}}>
      <div className="px-5 py-4 border-b"style={{ background: "#F5F3FF", borderColor: "#DDD6FE"}}>
        <div className="flex items-center gap-2">
          
          <div>
            <p className="text-sm font-black"style={{ color: "#6D28D9"}}>AI Executive Summary</p>
            <p className="text-xs"style={{ color: "#7C3AED"}}>
              Engine analysis of {recs.length} recommendations across {new Set(recs.map((r) => r.client)).size} clients
            </p>
          </div>
        </div>
      </div>
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Top Opportunities */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3"style={{ color: "#DC2626"}}>
             Top Opportunities
          </p>
          {topOpps.map((r) => (
            <div key={r.id} className="mb-2 pb-2 border-b last:border-0"style={{ borderColor: "#F3F4F6"}}>
              <p className="text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{r.client}</p>
              <p className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>{r.recommendationType}</p>
            </div>
          ))}
        </div>
        {/* Largest Revenue */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3"style={{ color: "#059669"}}>
             Largest Revenue Opps
          </p>
          {largestRevenue.map((r) => (
            <div key={r.id} className="mb-2 pb-2 border-b last:border-0"style={{ borderColor: "#F3F4F6"}}>
              <p className="text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{r.client}</p>
              <p className="text-[10px] font-bold"style={{ color: "#059669"}}>${r.estimatedRevenue.toLocaleString()}/mo</p>
            </div>
          ))}
        </div>
        {/* High Risk */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3"style={{ color: "#BE123C"}}>
             Highest Risk Accounts
          </p>
          {highRisk.length === 0 ? (
            <p className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>No retention risks detected</p>
          ) : (
            highRisk.map((r) => (
              <div key={r.id} className="mb-2 pb-2 border-b last:border-0"style={{ borderColor: "#F3F4F6"}}>
                <p className="text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{r.client}</p>
                <p className="text-[10px]"style={{ color: "#BE123C"}}>{r.recommendationType}</p>
              </div>
            ))
          )}
        </div>
        {/* High Confidence */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3"style={{ color: "#7C3AED"}}>
             Highest Confidence
          </p>
          {highConfidence.map((r) => (
            <div key={r.id} className="mb-2 pb-2 border-b last:border-0"style={{ borderColor: "#F3F4F6"}}>
              <p className="text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{r.client}</p>
              <p className="text-[10px] font-bold"style={{ color: "#7C3AED"}}>
                {r.aiScoring.confidenceScore}% confidence
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 
// Renewal Intelligence
// 

function RenewalIntelligence({ recs }: { recs: Recommendation[] }) {
  const renewals = recs.filter((r) => r.recommendationType === "Renewal Recommendation");
  const expansion = recs.filter((r) => r.recommendationType === "Upsell Recommendation");
  const retention = recs.filter((r) => r.recommendationType === "Retention Recommendation");
  const atRisk = recs.filter((r) =>
    r.communicationSignals.cancellationIndicators.length > 0
  );

  const panels = [
    { label: "Renewal Opportunities", color: "#0369A1", bg: "#F0F9FF", border: "#BAE6FD", items: renewals },
    { label: "Expansion Opportunities", icon: "", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", items: expansion },
    { label: "Retention Opportunities", color: "#BE123C", bg: "#FFF1F2", border: "#FECDD3", items: retention },
    { label: "At-Risk Accounts", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", items: atRisk },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        
        <div>
          <h2 className="text-base font-black"style={{ color: "var(--rtm-text-primary)"}}>Renewal Intelligence</h2>
          <p className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>
            Renewal, expansion, retention, and at-risk account signals
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {panels.map((p) => (
          <div key={p.label} className="rounded-xl border overflow-hidden"style={{ borderColor: p.border }}>
            <div className="px-4 py-3 border-b"style={{ background: p.bg, borderColor: p.border }}>
              <p className="text-xs font-bold"style={{ color: p.color }}>
                {p.icon} {p.label}
              </p>
              <p className="text-xl font-black mt-0.5"style={{ color: p.color }}>{p.items.length}</p>
            </div>
            <div className="p-3 space-y-2"style={{ background: "var(--rtm-bg)"}}>
              {p.items.length === 0 ? (
                <p className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>None detected</p>
              ) : (
                p.items.slice(0, 4).map((r) => (
                  <div key={r.id} className="rounded-lg p-2 border"style={{ background: p.bg, borderColor: p.border }}>
                    <p className="text-[10px] font-bold"style={{ color: p.color }}>{r.client}</p>
                    <p className="text-[9px]"style={{ color: "var(--rtm-text-muted)"}}>
                      ${r.estimatedRevenue.toLocaleString()}/mo
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 
// Recommendation Table
// 

function RecommendationTable({ recs, onSelect }: { recs: Recommendation[]; onSelect: (r: Recommendation) => void }) {
  return (
    <div className="rounded-xl border overflow-hidden"style={{ borderColor: "var(--rtm-border)"}}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm"style={{ borderCollapse: "collapse", minWidth: 1200 }}>
          <thead>
            <tr style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)"}}>
              {["Client", "Recommendation Type", "Source", "Priority", "Department", "Est. Revenue", "Confidence Score", "Status", "Actions"].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"style={{ color: "var(--rtm-text-muted)"}}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recs.map((r, i) => {
              const sm = SOURCE_META[r.source];
              return (
                <tr
                  key={r.id}
                  className="cursor-pointer transition-colors hover:bg-blue-50"style={{ borderBottom: "1px solid var(--rtm-border-light)", background: i % 2 === 0 ? "var(--rtm-bg)": "var(--rtm-surface)"}}
                  onClick={() => onSelect(r)}
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold text-xs"style={{ color: "var(--rtm-text-primary)"}}>{r.client}</p>
                    <p className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>{r.industry}</p>
                  </td>
                  <td className="px-4 py-3">
                    <RecTypeBadge type={r.recommendationType} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs"style={{ color: sm.color }}>
                      {sm.icon} {r.source}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={r.priority} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold"style={{ color: "var(--rtm-text-secondary)"}}>
                      {r.department}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-black"style={{ color: "#059669"}}>
                      ${r.estimatedRevenue.toLocaleString()}/mo
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full overflow-hidden"style={{ background: "#E5E7EB"}}>
                        <div
                          className="h-full rounded-full"style={{ width: `${r.aiScoring.confidenceScore}%`, background: scoreBarColor(r.aiScoring.confidenceScore) }}
                        />
                      </div>
                      <span className="text-[10px] font-black"style={{ color: scoreBarColor(r.aiScoring.confidenceScore) }}>
                        {r.aiScoring.confidenceScore}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3"onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onSelect(r)}
                      className="text-xs px-3 py-1.5 rounded-lg font-semibold border"style={{ background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE"}}
                    >
                      View Detail
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 
// Drawer
// 

type DrawerTab =
  | "overview"| "source-data"| "audit-findings"| "comm-signals"| "recommended-services"| "recommended-line-items"| "package-builder"| "proposal-preview"| "activity-timeline";

const DRAWER_TABS: { id: DrawerTab; label: string; icon?: string }[] = [
  { id: "overview", label: "Overview"},
  { id: "source-data", label: "Source Data"},
  { id: "audit-findings", label: "Audit Findings"},
  { id: "comm-signals", label: "Communication Signals"},
  { id: "recommended-services", label: "Recommended Services"},
  { id: "recommended-line-items", label: "Recommended Line Items"},
  { id: "package-builder", label: "Package Builder"},
  { id: "proposal-preview", label: "Proposal Preview", icon: ""},
  { id: "activity-timeline", label: "Activity Timeline"},
];

// -- Overview Tab
function DrawerOverview({ rec }: { rec: Recommendation }) {
  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="rounded-xl border p-4"style={{ background: "#F5F3FF", borderColor: "#DDD6FE"}}>
        <div className="flex items-start gap-3">
          
          <div>
            <p className="text-sm font-bold mb-1"style={{ color: "#6D28D9"}}>AI Summary</p>
            <p className="text-xs"style={{ color: "#4C1D95"}}>{rec.summary}</p>
          </div>
        </div>
      </div>
      {/* Meta grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Client", value: rec.client },
          { label: "Industry", value: rec.industry },
          { label: "Department", value: rec.department },
          { label: "Rec Type", value: rec.recommendationType },
          { label: "Source", value: rec.source },
          { label: "Created", value: rec.createdDate },
          { label: "Created By", value: rec.createdBy },
          { label: "Est. Revenue", value: `$${rec.estimatedRevenue.toLocaleString()}/mo` },
          { label: "Annual Value", value: `$${(rec.estimatedRevenue * 12).toLocaleString()}` },
        ].map((row) => (
          <div key={row.label} className="rounded-lg border p-3"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
            <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5"style={{ color: "var(--rtm-text-muted)"}}>{row.label}</p>
            <p className="text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{row.value}</p>
          </div>
        ))}
      </div>
      {/* AI Scoring */}
      <div className="rounded-xl border p-4"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
        <p className="text-xs font-bold mb-3"style={{ color: "var(--rtm-text-primary)"}}> AI Scoring</p>
        <div className="space-y-2">
          <ScoreBar label="Confidence Score"score={rec.aiScoring.confidenceScore} />
          <ScoreBar label="Impact Score"score={rec.aiScoring.impactScore} />
          <ScoreBar label="Urgency Score"score={rec.aiScoring.urgencyScore} />
          <ScoreBar label="Complexity Score"score={rec.aiScoring.complexityScore} />
        </div>
        <div className="mt-3 pt-3 border-t"style={{ borderColor: "var(--rtm-border)"}}>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-1"style={{ color: "var(--rtm-text-muted)"}}>Revenue Opportunity</p>
          <p className="text-xl font-black"style={{ color: "#059669"}}>
            ${rec.aiScoring.revenueOpportunity.toLocaleString()} annually
          </p>
        </div>
      </div>
      {/* Notes */}
      {rec.notes && (
        <div className="rounded-xl border p-4"style={{ background: "#FFFBEB", borderColor: "#FDE68A"}}>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-1"style={{ color: "#D97706"}}> Notes</p>
          <p className="text-xs"style={{ color: "#92400E"}}>{rec.notes}</p>
        </div>
      )}
    </div>
  );
}

// -- Source Data Tab
function DrawerSourceData({ rec }: { rec: Recommendation }) {
  const sm = SOURCE_META[rec.source];
  return (
    <div className="space-y-4">
      <div className="rounded-xl border p-4"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
        <p className="text-xs font-bold mb-2"style={{ color: "var(--rtm-text-primary)"}}>Primary Input Source</p>
        <div className="flex items-center gap-2">
          <span style={{ color: sm.color, fontSize: 20 }}>{sm.icon}</span>
          <div>
            <p className="text-sm font-black"style={{ color: sm.color }}>{rec.source}</p>
            <p className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>
              All recommendations from this record were generated based on {rec.source.toLowerCase()} data.
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Recommendation Type", value: rec.recommendationType, icon: REC_TYPE_META[rec.recommendationType].icon },
          { label: "Priority", value: rec.priority },
          { label: "Confidence Score", value: `${rec.aiScoring.confidenceScore}%` },
          { label: "Created By", value: rec.createdBy },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border p-3"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
            <p className="text-[10px] font-bold uppercase tracking-wide mb-1"style={{ color: "var(--rtm-text-muted)"}}>{item.label}</p>
            <p className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>{item.icon} {item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// -- Audit Findings Tab
function DrawerAuditFindings({ rec }: { rec: Recommendation }) {
  if (rec.auditFindings.length === 0) {
    return (
      <div className="rounded-xl border p-10 text-center"style={{ background: "#F0FDF4", borderColor: "#BBF7D0"}}>
        <p className="text-3xl mb-2"></p>
        <p className="text-sm font-semibold"style={{ color: "#15803D"}}>
          No audit findings linked to this recommendation.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <p className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>
        {rec.auditFindings.length} audit finding(s) drove this recommendation
      </p>
      {rec.auditFindings.map((f, i) => (
        <div
          key={i}
          className="rounded-xl border p-4 flex items-start gap-3"style={{ background: "#FEF2F2", borderColor: "#FECACA"}}
        >
          
          <p className="text-xs"style={{ color: "#991B1B"}}>{f}</p>
        </div>
      ))}
    </div>
  );
}

// -- Communication Signals Tab
function DrawerCommSignals({ rec }: { rec: Recommendation }) {
  const cs = rec.communicationSignals;
  const sections = [
    { label: "Client Concerns", color: "#C2410C", bg: "#FFF7ED", border: "#FED7AA", items: cs.clientConcerns },
    { label: "Requested Services", color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE", items: cs.requestedServices },
    { label: "Growth Opportunities", color: "#059669", bg: "#ECFDF5", border: "#A7F3D0", items: cs.growthOpportunities },
    { label: "Renewal Indicators", color: "#0369A1", bg: "#F0F9FF", border: "#BAE6FD", items: cs.renewalIndicators },
    { label: "Cancellation Indicators", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", items: cs.cancellationIndicators },
    { label: "Action Items", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE", items: cs.actionItems },
  ];

  return (
    <div className="space-y-4">
      {cs.callInsights && (
        <div className="rounded-xl border p-4"style={{ background: "#F0F9FF", borderColor: "#BAE6FD"}}>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-2"style={{ color: "#0369A1"}}> Call Insights</p>
          <p className="text-xs"style={{ color: "#075985"}}>{cs.callInsights}</p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sections.map((s) => (
          <div key={s.label} className="rounded-xl border overflow-hidden"style={{ borderColor: s.border }}>
            <div className="px-3 py-2 border-b"style={{ background: s.bg, borderColor: s.border }}>
              <p className="text-[10px] font-bold"style={{ color: s.color }}>{s.label}</p>
            </div>
            <div className="p-3"style={{ background: "var(--rtm-bg)"}}>
              {s.items.length === 0 ? (
                <p className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>None detected</p>
              ) : (
                s.items.map((item, i) => (
                  <p key={i} className="text-xs mb-1 last:mb-0"style={{ color: "var(--rtm-text-secondary)"}}>• {item}</p>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -- Recommended Services Tab
function DrawerRecommendedServices({ rec }: { rec: Recommendation }) {
  const [added, setAdded] = useState<Set<string>>(new Set());
  return (
    <div className="space-y-4">
      <p className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>
        {rec.recommendedServices.length} service(s) recommended by AI Engine
      </p>
      {rec.recommendedServices.map((s) => {
        const icon = SERVICE_ICONS[s.service];
        const isAdded = added.has(s.id);
        return (
          <div key={s.id} className="rounded-xl border overflow-hidden"style={{ borderColor: "var(--rtm-border)"}}>
            <div className="px-4 py-3 flex items-center justify-between"style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)"}}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{icon}</span>
                <p className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>{s.service}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2 py-0.5 rounded-full"style={{ background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0"}}>
                  ${s.estimatedMonthlyRevenue.toLocaleString()}/mo
                </span>
                {s.setupFee > 0 && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE"}}>
                    ${s.setupFee.toLocaleString()} setup
                  </span>
                )}
                <button
                  onClick={() => setAdded((prev) => { const n = new Set(prev); isAdded ? n.delete(s.id) : n.add(s.id); return n; })}
                  className="text-xs px-3 py-1.5 rounded-lg font-semibold border"style={isAdded
                    ? { background: "#F0FDF4", color: "#15803D", borderColor: "#BBF7D0"}
                    : { background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE"}
                  }
                >
                  {isAdded ? "Added": "+ Add"}
                </button>
              </div>
            </div>
            <div className="p-4"style={{ background: "var(--rtm-bg)"}}>
              <p className="text-[10px] font-bold uppercase tracking-wide mb-1"style={{ color: "var(--rtm-text-muted)"}}>Why Recommended</p>
              <p className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{s.reason}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// -- Recommended Line Items Tab
function DrawerRecommendedLineItems({ rec }: { rec: Recommendation }) {
  const [added, setAdded] = useState<Set<string>>(new Set());
  return (
    <div className="space-y-4">
      <p className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>
        {rec.recommendedLineItems.length} line item(s) recommended
      </p>
      <div className="rounded-xl border overflow-hidden"style={{ borderColor: "var(--rtm-border)"}}>
        <table className="w-full text-xs"style={{ borderCollapse: "collapse"}}>
          <thead>
            <tr style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)"}}>
              {["Line Item", "Category", "Setup Fee", "Monthly Fee", "Delivery", "Action"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wide"style={{ color: "var(--rtm-text-muted)"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rec.recommendedLineItems.map((li, i) => {
              const isAdded = added.has(li.id);
              return (
                <tr key={li.id} style={{ borderBottom: "1px solid var(--rtm-border-light)", background: i % 2 === 0 ? "var(--rtm-bg)": "var(--rtm-surface)"}}>
                  <td className="px-4 py-3 font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{li.name}</td>
                  <td className="px-4 py-3"style={{ color: "var(--rtm-text-secondary)"}}>{li.category}</td>
                  <td className="px-4 py-3 font-bold"style={{ color: li.setupFee > 0 ? "#1D4ED8": "#9CA3AF"}}>
                    {li.setupFee > 0 ? `$${li.setupFee.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-4 py-3 font-bold"style={{ color: li.recurringFee > 0 ? "#059669": "#9CA3AF"}}>
                    {li.recurringFee > 0 ? `$${li.recurringFee.toLocaleString()}/mo` : "—"}
                  </td>
                  <td className="px-4 py-3"style={{ color: "var(--rtm-text-secondary)"}}>{li.deliveryStandard}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setAdded((prev) => { const n = new Set(prev); isAdded ? n.delete(li.id) : n.add(li.id); return n; })}
                      className="text-[10px] px-2 py-1 rounded font-semibold border"style={isAdded
                        ? { background: "#F0FDF4", color: "#15803D", borderColor: "#BBF7D0"}
                        : { background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE"}
                      }
                    >
                      {isAdded ? "Added": "+ Add"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// -- Package Builder Tab
function DrawerPackageBuilder({ rec }: { rec: Recommendation }) {
  const [services, setServices] = useState<string[]>([...rec.packageServices]);
  const [generated, setGenerated] = useState(false);

  const setupTotal = rec.packageSetupTotal;
  const monthlyTotal = rec.packageMonthlyTotal;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border p-4"style={{ background: "#F5F3FF", borderColor: "#DDD6FE"}}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-bold"style={{ color: "#6D28D9"}}> {rec.recommendedPackage}</p>
            <p className="text-[10px]"style={{ color: "#7C3AED"}}>AI-recommended package for {rec.client}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px]"style={{ color: "#7C3AED"}}>Setup Total</p>
            <p className="text-lg font-black"style={{ color: "#6D28D9"}}>${setupTotal.toLocaleString()}</p>
          </div>
        </div>
        <div className="space-y-2">
          {services.map((svc, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border p-2"style={{ background: "white", borderColor: "#DDD6FE"}}>
              <span className="text-xs font-semibold"style={{ color: "#4C1D95"}}>{svc}</span>
              <button
                onClick={() => setServices((prev) => prev.filter((_, j) => j !== i))}
                className="text-[10px] px-2 py-0.5 rounded font-semibold"style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA"}}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            const newService = "Custom Add-On Service";
            setServices((prev) => [...prev, newService]);
          }}
          className="mt-3 w-full text-xs py-2 rounded-lg font-semibold border"style={{ background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE"}}
        >
          + Add Recommended Service
        </button>
      </div>

      {/* Package Totals */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border p-4 text-center"style={{ background: "#EFF6FF", borderColor: "#BFDBFE"}}>
          <p className="text-[10px] font-bold uppercase tracking-wide"style={{ color: "#1D4ED8"}}>Setup Fees</p>
          <p className="text-xl font-black"style={{ color: "#1D4ED8"}}>${setupTotal.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border p-4 text-center"style={{ background: "#ECFDF5", borderColor: "#A7F3D0"}}>
          <p className="text-[10px] font-bold uppercase tracking-wide"style={{ color: "#059669"}}>Monthly Recurring</p>
          <p className="text-xl font-black"style={{ color: "#059669"}}>${monthlyTotal.toLocaleString()}/mo</p>
        </div>
        <div className="rounded-xl border p-4 text-center"style={{ background: "#F5F3FF", borderColor: "#DDD6FE"}}>
          <p className="text-[10px] font-bold uppercase tracking-wide"style={{ color: "#7C3AED"}}>Annual Value</p>
          <p className="text-xl font-black"style={{ color: "#7C3AED"}}>${(monthlyTotal * 12 + setupTotal).toLocaleString()}</p>
        </div>
        <div className="rounded-xl border p-4 text-center"style={{ background: "#FFFBEB", borderColor: "#FDE68A"}}>
          <p className="text-[10px] font-bold uppercase tracking-wide"style={{ color: "#D97706"}}>Services Included</p>
          <p className="text-xl font-black"style={{ color: "#D97706"}}>{services.length}</p>
        </div>
      </div>

      <button
        onClick={() => setGenerated(true)}
        className="w-full py-3 rounded-xl font-black text-sm"style={{ background: generated ? "#F0FDF4": "#6D28D9", color: generated ? "#15803D": "white"}}
      >
        {generated ? "Proposal Generated — View Proposal Preview Tab": "Generate Proposal"}
      </button>
    </div>
  );
}

// -- Proposal Preview Tab
function DrawerProposalPreview({ rec }: { rec: Recommendation }) {
  const annualValue = rec.packageMonthlyTotal * 12 + rec.packageSetupTotal;
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-xl border p-5 text-center"style={{ background: "#F5F3FF", borderColor: "#DDD6FE"}}>
        <p className="text-2xl mb-1"></p>
        <p className="text-lg font-black"style={{ color: "#6D28D9"}}>Proposal Preview</p>
        <p className="text-sm font-semibold"style={{ color: "#7C3AED"}}>{rec.client} — {rec.recommendedPackage}</p>
      </div>

      {/* Services */}
      <div className="rounded-xl border overflow-hidden"style={{ borderColor: "var(--rtm-border)"}}>
        <div className="px-4 py-3 border-b"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
          <p className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>Services Included</p>
        </div>
        <div className="p-4 space-y-2">
          {rec.packageServices.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span style={{ color: "#059669"}}></span>
              <span className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Line Items */}
      <div className="rounded-xl border overflow-hidden"style={{ borderColor: "var(--rtm-border)"}}>
        <div className="px-4 py-3 border-b"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
          <p className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>Line Items</p>
        </div>
        <table className="w-full text-xs"style={{ borderCollapse: "collapse"}}>
          <thead>
            <tr style={{ background: "#F9FAFB", borderBottom: "1px solid var(--rtm-border)"}}>
              {["Item", "Setup Fee", "Monthly Fee", "Delivery"].map((h) => (
                <th key={h} className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wide"style={{ color: "var(--rtm-text-muted)"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rec.recommendedLineItems.map((li) => (
              <tr key={li.id} style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
                <td className="px-4 py-2 font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{li.name}</td>
                <td className="px-4 py-2"style={{ color: "#1D4ED8"}}>
                  {li.setupFee > 0 ? `$${li.setupFee.toLocaleString()}` : "—"}
                </td>
                <td className="px-4 py-2"style={{ color: "#059669"}}>
                  {li.recurringFee > 0 ? `$${li.recurringFee.toLocaleString()}/mo` : "—"}
                </td>
                <td className="px-4 py-2"style={{ color: "var(--rtm-text-muted)"}}>{li.deliveryStandard}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Financials */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Setup Fees", value: `$${rec.packageSetupTotal.toLocaleString()}`, color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE"},
          { label: "Monthly Recurring", value: `$${rec.packageMonthlyTotal.toLocaleString()}/mo`, color: "#059669", bg: "#ECFDF5", border: "#A7F3D0"},
          { label: "Est. Annual Value", value: `$${annualValue.toLocaleString()}`, color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE"},
          { label: "Package", value: rec.recommendedPackage, color: "#D97706", bg: "#FFFBEB", border: "#FDE68A"},
        ].map((c) => (
          <div key={c.label} className="rounded-xl border p-4 text-center"style={{ background: c.bg, borderColor: c.border }}>
            <p className="text-[10px] font-bold uppercase tracking-wide"style={{ color: c.color }}>{c.label}</p>
            <p className="text-base font-black mt-1"style={{ color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      <button
        className="w-full py-3 rounded-xl font-black text-sm text-white"style={{ background: "#059669"}}
      >
         Send Proposal to Client
      </button>
    </div>
  );
}

// -- Activity Timeline Tab
function DrawerActivityTimeline({ rec }: { rec: Recommendation }) {
  const events = [
    { date: rec.createdDate, event: "Recommendation generated by AI Engine", color: "#7C3AED"},
    { date: rec.createdDate, event: `Source: ${rec.source} analyzed`, icon: SOURCE_META[rec.source].icon, color: SOURCE_META[rec.source].color },
    { date: rec.createdDate, event: `Assigned to ${rec.department} department`, color: "#1D4ED8"},
    { date: rec.createdDate, event: `Status set to ${rec.status}`, color: "#059669"},
    { date: "Jun 9, 2025", event: "Recommendation reviewed by sales team", icon: "", color: "#D97706"},
  ];

  return (
    <div className="space-y-3">
      {events.map((e, i) => (
        <div key={i} className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm border"style={{ background: "#F5F3FF", borderColor: "#DDD6FE"}}
          >
            {e.icon}
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{e.event}</p>
            <p className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>{e.date}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// -- Drawer Shell
function RecommendationDrawer({ rec, onClose }: { rec: Recommendation; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<DrawerTab>("overview");

  return (
    <div className="fixed inset-0 z-50 flex"style={{ background: "rgba(0,0,0,0.35)"}} onClick={onClose}>
      <div className="ml-auto h-full w-full max-w-3xl flex flex-col"style={{ background: "var(--rtm-bg)"}} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b flex-shrink-0"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <RecTypeBadge type={rec.recommendationType} />
              <PriorityBadge priority={rec.priority} />
              <StatusBadge status={rec.status} />
            </div>
            <p className="text-base font-black"style={{ color: "var(--rtm-text-primary)"}}>{rec.client}</p>
            <p className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>{rec.summary.slice(0, 100)}…</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"style={{ background: "var(--rtm-border)", color: "var(--rtm-text-muted)"}}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-0 border-b flex-shrink-0"style={{ borderColor: "var(--rtm-border)"}}>
          {DRAWER_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="flex-shrink-0 px-4 py-3 text-[10px] font-bold uppercase tracking-wide border-b-2 whitespace-nowrap"style={{
                borderColor: activeTab === t.id ? "#7C3AED": "transparent",
                color: activeTab === t.id ? "#7C3AED": "var(--rtm-text-muted)",
                background: "transparent",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "overview"&& <DrawerOverview rec={rec} />}
          {activeTab === "source-data"&& <DrawerSourceData rec={rec} />}
          {activeTab === "audit-findings"&& <DrawerAuditFindings rec={rec} />}
          {activeTab === "comm-signals"&& <DrawerCommSignals rec={rec} />}
          {activeTab === "recommended-services"&& <DrawerRecommendedServices rec={rec} />}
          {activeTab === "recommended-line-items"&& <DrawerRecommendedLineItems rec={rec} />}
          {activeTab === "package-builder"&& <DrawerPackageBuilder rec={rec} />}
          {activeTab === "proposal-preview"&& <DrawerProposalPreview rec={rec} />}
          {activeTab === "activity-timeline"&& <DrawerActivityTimeline rec={rec} />}
        </div>
      </div>
    </div>
  );
}

// 
// Filter Bar
// 

function FilterBar({
  search, setSearch,
  typeFilter, setTypeFilter,
  priorityFilter, setPriorityFilter,
  statusFilter, setStatusFilter,
  sourceFilter, setSourceFilter,
  total, filtered,
}: {
  search: string; setSearch: (v: string) => void;
  typeFilter: string; setTypeFilter: (v: string) => void;
  priorityFilter: string; setPriorityFilter: (v: string) => void;
  statusFilter: string; setStatusFilter: (v: string) => void;
  sourceFilter: string; setSourceFilter: (v: string) => void;
  total: number; filtered: number;
}) {
  const selectStyle = {
    background: "var(--rtm-surface)",
    color: "var(--rtm-text-primary)",
    borderColor: "var(--rtm-border)",
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid",
    outline: "none",
  };

  return (
    <div className="rounded-xl border p-4 flex flex-wrap items-center gap-3"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
      <input
        type="text"placeholder="Search recommendations, clients…"value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 min-w-48 rounded-lg border px-3 py-2 text-xs"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", outline: "none"}}
      />
      <select style={selectStyle} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
        <option value="">All Types</option>
        {(["Service Recommendation", "Line Item Recommendation", "Package Recommendation", "Renewal Recommendation", "Upsell Recommendation", "Retention Recommendation", "Risk Recommendation"] as RecommendationType[]).map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      <select style={selectStyle} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
        <option value="">All Priorities</option>
        {(["Critical", "High", "Medium", "Low"] as Priority[]).map((p) => <option key={p} value={p}>{p}</option>)}
      </select>
      <select style={selectStyle} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
        <option value="">All Statuses</option>
        {(["New", "In Review", "Accepted", "Rejected", "Proposal Sent", "Won"] as RecStatus[]).map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <select style={selectStyle} value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
        <option value="">All Sources</option>
        {(["Audit Findings", "Call Summary", "Client Notes", "Meeting Notes", "Renewal Signal", "Upsell Signal", "Project Health", "Client Health"] as InputSource[]).map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <span className="text-[10px] font-semibold"style={{ color: "var(--rtm-text-muted)"}}>
        Showing {filtered} of {total}
      </span>
    </div>
  );
}

// 
// Main Page
// 

export default function RecommendationsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [activeSection, setActiveSection] = useState<"dashboard"| "table"| "renewal"| "executive">("dashboard");

  const filtered = useMemo(() => {
    return MOCK_RECOMMENDATIONS.filter((r) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        r.client.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q) ||
        r.recommendationType.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q);
      const matchType = !typeFilter || r.recommendationType === typeFilter;
      const matchPriority = !priorityFilter || r.priority === priorityFilter;
      const matchStatus = !statusFilter || r.status === statusFilter;
      const matchSource = !sourceFilter || r.source === sourceFilter;
      return matchSearch && matchType && matchPriority && matchStatus && matchSource;
    });
  }, [search, typeFilter, priorityFilter, statusFilter, sourceFilter]);

  const navTabs = [
    { id: "dashboard"as const, label: "Dashboard"},
    { id: "table"as const, label: "All Recommendations"},
    { id: "renewal"as const, label: "Renewal Intelligence"},
    { id: "executive"as const, label: "Executive Summary"},
  ];

  return (
    <div className="min-h-screen"style={{ background: "var(--rtm-bg)"}}>
      <div className="max-w-screen-2xl mx-auto px-6 py-8 space-y-8">
        {/* Page Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            
            <div>
              <h1 className="text-2xl font-black"style={{ color: "var(--rtm-text-primary)"}}>
                AI Recommendation Engine
              </h1>
              <p className="text-sm"style={{ color: "var(--rtm-text-muted)"}}>
                Generate service recommendations, package recommendations, proposal recommendations, renewal opportunities, and growth opportunities using audit and communication intelligence.
              </p>
            </div>
          </div>
        </div>

        {/* Section Nav */}
        <div className="flex gap-1 flex-wrap">
          {navTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveSection(t.id)}
              className="px-4 py-2 rounded-xl text-xs font-bold border"style={{
                background: activeSection === t.id ? "#7C3AED": "var(--rtm-surface)",
                color: activeSection === t.id ? "white": "var(--rtm-text-secondary)",
                borderColor: activeSection === t.id ? "#7C3AED": "var(--rtm-border)",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Dashboard Section */}
        {activeSection === "dashboard"&& (
          <div className="space-y-8">
            <KPICards recs={MOCK_RECOMMENDATIONS} />
            <AIExecutiveSummary recs={MOCK_RECOMMENDATIONS} />
            <RenewalIntelligence recs={MOCK_RECOMMENDATIONS} />
          </div>
        )}

        {/* Table Section */}
        {activeSection === "table"&& (
          <div className="space-y-4">
            <FilterBar
              search={search} setSearch={setSearch}
              typeFilter={typeFilter} setTypeFilter={setTypeFilter}
              priorityFilter={priorityFilter} setPriorityFilter={setPriorityFilter}
              statusFilter={statusFilter} setStatusFilter={setStatusFilter}
              sourceFilter={sourceFilter} setSourceFilter={setSourceFilter}
              total={MOCK_RECOMMENDATIONS.length}
              filtered={filtered.length}
            />
            <RecommendationTable recs={filtered} onSelect={setSelectedRec} />
          </div>
        )}

        {/* Renewal Intelligence Section */}
        {activeSection === "renewal"&& (
          <RenewalIntelligence recs={MOCK_RECOMMENDATIONS} />
        )}

        {/* Executive Summary Section */}
        {activeSection === "executive"&& (
          <AIExecutiveSummary recs={MOCK_RECOMMENDATIONS} />
        )}
      </div>

      {/* Drawer */}
      {selectedRec && (
        <RecommendationDrawer
          rec={selectedRec}
          onClose={() => setSelectedRec(null)}
        />
      )}
    </div>
  );
}
