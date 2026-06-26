"use client";

import React, { useState, useMemo } from "react";

// 
// Finance — Line Item Catalog
// Route: /finance/line-items
// Primary source of SLA configuration per line item.
// Department SLAs are fallback defaults only.
// 

//  Types 

type Category =
  | "SEO"| "GBP"| "PPC"| "Meta Ads"| "LSA"| "Reporting"| "Web"| "Creative"| "Strategy"| "Consulting"| "Setup"| "Maintenance";

type BillingType = "One-Time"| "Monthly Recurring"| "Quarterly"| "Annual";

type FinanceStatus = "Approved"| "Pending Review"| "Needs Pricing"| "Inactive";

type SLAPriority = "Standard"| "Priority"| "Rush"| "Custom";

type SLAStatus = "Active"| "Pending Review"| "Needs Approval"| "Inactive";

interface LineItemSLA {
  firstResponseSLA: string;
  targetCompletionDays: number;
  dueDateOffset: number;
  escalationAfterDays: number;
  clientUpdateFrequency: string;
  slaPriority: SLAPriority;
  slaStatus: SLAStatus;
  notes: string;
}

interface LineItemCatalog {
  id: string;
  name: string;
  category: Category;
  department: string;
  description: string;
  unitPrice: number;
  billingType: BillingType;
  internalCost: number;
  margin: number;
  taskTemplate: string;
  financeStatus: FinanceStatus;
  sla: LineItemSLA;
}

//  Mock Data — 30 Line Items with SLA 

const LINE_ITEMS: LineItemCatalog[] = [
  {
    id: "li-001",
    name: "SEO Setup & Onboarding",
    category: "SEO",
    department: "SEO Department",
    description: "Initial SEO audit, keyword research, baseline reporting, GSC/GA4 setup, and technical recommendations.",
    unitPrice: 1500,
    billingType: "One-Time",
    internalCost: 600,
    margin: 60,
    taskTemplate: "SEO Setup Tasklist",
    financeStatus: "Approved",
    sla: {
      firstResponseSLA: "1 business day",
      targetCompletionDays: 5,
      dueDateOffset: 0,
      escalationAfterDays: 7,
      clientUpdateFrequency: "Every 2 business days",
      slaPriority: "Standard",
      slaStatus: "Active",
      notes: "Requires website & GA4 access before clock starts.",
    },
  },
  {
    id: "li-002",
    name: "SEO Monthly Management",
    category: "SEO",
    department: "SEO Department",
    description: "Ongoing SEO management: content optimization, link building, technical fixes, and monthly reporting.",
    unitPrice: 1200,
    billingType: "Monthly Recurring",
    internalCost: 480,
    margin: 60,
    taskTemplate: "SEO Monthly Tasklist",
    financeStatus: "Approved",
    sla: {
      firstResponseSLA: "1 business day",
      targetCompletionDays: 10,
      dueDateOffset: 5,
      escalationAfterDays: 14,
      clientUpdateFrequency: "Weekly",
      slaPriority: "Standard",
      slaStatus: "Active",
      notes: "Reporting delivered by end of month.",
    },
  },
  {
    id: "li-003",
    name: "GBP Optimization",
    category: "GBP",
    department: "GBP Department",
    description: "Google Business Profile audit, optimization, Q&A management, photo uploads, and weekly posting.",
    unitPrice: 500,
    billingType: "Monthly Recurring",
    internalCost: 150,
    margin: 70,
    taskTemplate: "GBP Launch Tasklist",
    financeStatus: "Approved",
    sla: {
      firstResponseSLA: "1 business day",
      targetCompletionDays: 3,
      dueDateOffset: 0,
      escalationAfterDays: 5,
      clientUpdateFrequency: "Weekly",
      slaPriority: "Standard",
      slaStatus: "Active",
      notes: "GBP access must be granted before activation.",
    },
  },
  {
    id: "li-004",
    name: "GBP Setup & Claim",
    category: "GBP",
    department: "GBP Department",
    description: "Full GBP profile claim, verification, initial setup, and category/attribute optimization.",
    unitPrice: 350,
    billingType: "One-Time",
    internalCost: 105,
    margin: 70,
    taskTemplate: "GBP Setup Tasklist",
    financeStatus: "Approved",
    sla: {
      firstResponseSLA: "1 business day",
      targetCompletionDays: 3,
      dueDateOffset: 0,
      escalationAfterDays: 5,
      clientUpdateFrequency: "As needed",
      slaPriority: "Standard",
      slaStatus: "Active",
      notes: "Verification postcard may extend timeline.",
    },
  },
  {
    id: "li-005",
    name: "PPC Campaign Setup",
    category: "PPC",
    department: "Paid Advertising Department",
    description: "Full Google Ads account setup, campaign structure, ad copy creation, audience setup, and conversion tracking.",
    unitPrice: 1200,
    billingType: "One-Time",
    internalCost: 480,
    margin: 60,
    taskTemplate: "PPC Launch Tasklist",
    financeStatus: "Approved",
    sla: {
      firstResponseSLA: "1 business day",
      targetCompletionDays: 4,
      dueDateOffset: 0,
      escalationAfterDays: 6,
      clientUpdateFrequency: "Every 2 business days",
      slaPriority: "Priority",
      slaStatus: "Active",
      notes: "Landing page must be live before launch.",
    },
  },
  {
    id: "li-006",
    name: "PPC Monthly Management",
    category: "PPC",
    department: "Paid Advertising Department",
    description: "Ongoing Google Ads management: bid optimization, A/B testing, negative keyword pruning, monthly reporting.",
    unitPrice: 1500,
    billingType: "Monthly Recurring",
    internalCost: 600,
    margin: 60,
    taskTemplate: "PPC Monthly Tasklist",
    financeStatus: "Approved",
    sla: {
      firstResponseSLA: "1 business day",
      targetCompletionDays: 12,
      dueDateOffset: 5,
      escalationAfterDays: 15,
      clientUpdateFrequency: "Weekly",
      slaPriority: "Standard",
      slaStatus: "Active",
      notes: "Budget pacing reviewed mid-month.",
    },
  },
  {
    id: "li-007",
    name: "Meta Ads Setup",
    category: "Meta Ads",
    department: "Paid Advertising Department",
    description: "Facebook/Instagram Ads account setup, Pixel installation, audience creation, and initial campaign structure.",
    unitPrice: 900,
    billingType: "One-Time",
    internalCost: 360,
    margin: 60,
    taskTemplate: "Meta Ads Launch Tasklist",
    financeStatus: "Approved",
    sla: {
      firstResponseSLA: "1 business day",
      targetCompletionDays: 5,
      dueDateOffset: 0,
      escalationAfterDays: 7,
      clientUpdateFrequency: "Every 2 business days",
      slaPriority: "Standard",
      slaStatus: "Active",
      notes: "Business Manager access required before start.",
    },
  },
  {
    id: "li-008",
    name: "Meta Ads Monthly Management",
    category: "Meta Ads",
    department: "Paid Advertising Department",
    description: "Ongoing Meta Ads management: creative rotation, audience testing, retargeting, monthly performance reports.",
    unitPrice: 1200,
    billingType: "Monthly Recurring",
    internalCost: 480,
    margin: 60,
    taskTemplate: "Meta Monthly Tasklist",
    financeStatus: "Approved",
    sla: {
      firstResponseSLA: "1 business day",
      targetCompletionDays: 10,
      dueDateOffset: 5,
      escalationAfterDays: 14,
      clientUpdateFrequency: "Weekly",
      slaPriority: "Standard",
      slaStatus: "Active",
      notes: "Creative refresh every 2 weeks.",
    },
  },
  {
    id: "li-009",
    name: "LSA Account Setup",
    category: "LSA",
    department: "LSA Department",
    description: "Google Local Services Ads account creation, verification, budget setup, and background check coordination.",
    unitPrice: 600,
    billingType: "One-Time",
    internalCost: 180,
    margin: 70,
    taskTemplate: "LSA Setup Tasklist",
    financeStatus: "Approved",
    sla: {
      firstResponseSLA: "1 business day",
      targetCompletionDays: 5,
      dueDateOffset: 0,
      escalationAfterDays: 8,
      clientUpdateFrequency: "Every 2 business days",
      slaPriority: "Standard",
      slaStatus: "Active",
      notes: "Background check adds 3–5 business days.",
    },
  },
  {
    id: "li-010",
    name: "LSA Monthly Management",
    category: "LSA",
    department: "LSA Department",
    description: "Ongoing LSA management: bid adjustments, lead dispute management, review strategy, and monthly reporting.",
    unitPrice: 800,
    billingType: "Monthly Recurring",
    internalCost: 240,
    margin: 70,
    taskTemplate: "LSA Monthly Tasklist",
    financeStatus: "Approved",
    sla: {
      firstResponseSLA: "1 business day",
      targetCompletionDays: 6,
      dueDateOffset: 3,
      escalationAfterDays: 10,
      clientUpdateFrequency: "Weekly",
      slaPriority: "Standard",
      slaStatus: "Active",
      notes: "Lead disputes responded to within 48 hours.",
    },
  },
  {
    id: "li-011",
    name: "Reporting Dashboard Setup",
    category: "Reporting",
    department: "Reporting Department",
    description: "Custom reporting dashboard setup in Looker Studio with client-specific KPIs and data sources.",
    unitPrice: 400,
    billingType: "One-Time",
    internalCost: 120,
    margin: 70,
    taskTemplate: "Reporting Setup Tasklist",
    financeStatus: "Approved",
    sla: {
      firstResponseSLA: "2 business days",
      targetCompletionDays: 7,
      dueDateOffset: 0,
      escalationAfterDays: 10,
      clientUpdateFrequency: "As needed",
      slaPriority: "Standard",
      slaStatus: "Active",
      notes: "All data sources must be connected before delivery.",
    },
  },
  {
    id: "li-012",
    name: "Monthly Reporting Package",
    category: "Reporting",
    department: "Reporting Department",
    description: "Monthly performance reports across all active channels with executive summary and recommendations.",
    unitPrice: 300,
    billingType: "Monthly Recurring",
    internalCost: 90,
    margin: 70,
    taskTemplate: "Monthly Reporting Tasklist",
    financeStatus: "Approved",
    sla: {
      firstResponseSLA: "2 business days",
      targetCompletionDays: 7,
      dueDateOffset: 28,
      escalationAfterDays: 32,
      clientUpdateFrequency: "Monthly",
      slaPriority: "Standard",
      slaStatus: "Active",
      notes: "Report delivered by the last business day of each month.",
    },
  },
  {
    id: "li-013",
    name: "Landing Page Design & Build",
    category: "Web",
    department: "Web Department",
    description: "Custom landing page design and development optimized for PPC/paid campaign conversion.",
    unitPrice: 1800,
    billingType: "One-Time",
    internalCost: 720,
    margin: 60,
    taskTemplate: "Landing Page Build Tasklist",
    financeStatus: "Approved",
    sla: {
      firstResponseSLA: "1 business day",
      targetCompletionDays: 14,
      dueDateOffset: 0,
      escalationAfterDays: 18,
      clientUpdateFrequency: "Every 3 business days",
      slaPriority: "Standard",
      slaStatus: "Active",
      notes: "Client content and brand assets required upfront.",
    },
  },
  {
    id: "li-014",
    name: "Website Maintenance (Monthly)",
    category: "Maintenance",
    department: "Web Department",
    description: "Monthly website maintenance: plugin updates, security scans, uptime monitoring, and minor fixes.",
    unitPrice: 250,
    billingType: "Monthly Recurring",
    internalCost: 75,
    margin: 70,
    taskTemplate: "Web Maintenance Tasklist",
    financeStatus: "Approved",
    sla: {
      firstResponseSLA: "1 business day",
      targetCompletionDays: 2,
      dueDateOffset: 5,
      escalationAfterDays: 4,
      clientUpdateFrequency: "Monthly summary",
      slaPriority: "Standard",
      slaStatus: "Active",
      notes: "Emergency fixes handled within 4 hours.",
    },
  },
  {
    id: "li-015",
    name: "Creative Design Package",
    category: "Creative",
    department: "Creative Department",
    description: "Monthly creative assets: social media graphics, ad creatives, banners, and branded content.",
    unitPrice: 800,
    billingType: "Monthly Recurring",
    internalCost: 240,
    margin: 70,
    taskTemplate: "Creative Monthly Tasklist",
    financeStatus: "Approved",
    sla: {
      firstResponseSLA: "1 business day",
      targetCompletionDays: 8,
      dueDateOffset: 5,
      escalationAfterDays: 12,
      clientUpdateFrequency: "Every 3 business days",
      slaPriority: "Standard",
      slaStatus: "Active",
      notes: "2 revision rounds included.",
    },
  },
  {
    id: "li-016",
    name: "Creative Brand Package (One-Time)",
    category: "Creative",
    department: "Creative Department",
    description: "Logo design, brand color palette, typography guide, and brand asset package delivery.",
    unitPrice: 2000,
    billingType: "One-Time",
    internalCost: 800,
    margin: 60,
    taskTemplate: "Brand Package Tasklist",
    financeStatus: "Approved",
    sla: {
      firstResponseSLA: "1 business day",
      targetCompletionDays: 14,
      dueDateOffset: 0,
      escalationAfterDays: 18,
      clientUpdateFrequency: "Every 3 business days",
      slaPriority: "Standard",
      slaStatus: "Active",
      notes: "Discovery call must precede start.",
    },
  },
  {
    id: "li-017",
    name: "Digital Strategy Consulting",
    category: "Strategy",
    department: "Strategy Department",
    description: "Monthly strategic consulting sessions, market analysis, competitive intelligence, and growth planning.",
    unitPrice: 600,
    billingType: "Monthly Recurring",
    internalCost: 180,
    margin: 70,
    taskTemplate: "Strategy Consulting Tasklist",
    financeStatus: "Approved",
    sla: {
      firstResponseSLA: "1 business day",
      targetCompletionDays: 5,
      dueDateOffset: 3,
      escalationAfterDays: 8,
      clientUpdateFrequency: "Bi-weekly",
      slaPriority: "Priority",
      slaStatus: "Active",
      notes: "Monthly strategy call scheduled in advance.",
    },
  },
  {
    id: "li-018",
    name: "Tracking & Analytics Setup",
    category: "Setup",
    department: "Reporting Department",
    description: "Full tracking setup: GA4, Google Tag Manager, conversion events, call tracking, and form submission tracking.",
    unitPrice: 700,
    billingType: "One-Time",
    internalCost: 210,
    margin: 70,
    taskTemplate: "Tracking Setup Tasklist",
    financeStatus: "Approved",
    sla: {
      firstResponseSLA: "1 business day",
      targetCompletionDays: 4,
      dueDateOffset: 0,
      escalationAfterDays: 6,
      clientUpdateFrequency: "As needed",
      slaPriority: "Standard",
      slaStatus: "Active",
      notes: "Website access required before start.",
    },
  },
  {
    id: "li-019",
    name: "Keyword Strategy & Research",
    category: "SEO",
    department: "SEO Department",
    description: "In-depth keyword research, competitive gap analysis, content opportunity mapping, and keyword grouping.",
    unitPrice: 500,
    billingType: "One-Time",
    internalCost: 150,
    margin: 70,
    taskTemplate: "Keyword Research Tasklist",
    financeStatus: "Approved",
    sla: {
      firstResponseSLA: "1 business day",
      targetCompletionDays: 4,
      dueDateOffset: 0,
      escalationAfterDays: 6,
      clientUpdateFrequency: "As needed",
      slaPriority: "Standard",
      slaStatus: "Active",
      notes: "Service area and competitor list required.",
    },
  },
  {
    id: "li-020",
    name: "Content Writing (Monthly — 4 Articles)",
    category: "SEO",
    department: "SEO Department",
    description: "Four SEO-optimized blog articles per month targeting priority keywords with internal linking strategy.",
    unitPrice: 700,
    billingType: "Monthly Recurring",
    internalCost: 280,
    margin: 60,
    taskTemplate: "Content Writing Tasklist",
    financeStatus: "Approved",
    sla: {
      firstResponseSLA: "1 business day",
      targetCompletionDays: 8,
      dueDateOffset: 5,
      escalationAfterDays: 12,
      clientUpdateFrequency: "Weekly",
      slaPriority: "Standard",
      slaStatus: "Active",
      notes: "Topic list must be approved before writing begins.",
    },
  },
  {
    id: "li-021",
    name: "Citation Building Package",
    category: "SEO",
    department: "SEO Department",
    description: "Manual citation submissions to top 50 directories including Yelp, YP, BBB, and niche directories.",
    unitPrice: 400,
    billingType: "One-Time",
    internalCost: 120,
    margin: 70,
    taskTemplate: "Citation Building Tasklist",
    financeStatus: "Approved",
    sla: {
      firstResponseSLA: "1 business day",
      targetCompletionDays: 5,
      dueDateOffset: 0,
      escalationAfterDays: 8,
      clientUpdateFrequency: "As needed",
      slaPriority: "Standard",
      slaStatus: "Active",
      notes: "NAP information must be locked before start.",
    },
  },
  {
    id: "li-022",
    name: "Review Management (Monthly)",
    category: "GBP",
    department: "GBP Department",
    description: "Monthly review monitoring, response management, and review generation campaign for GBP and Google.",
    unitPrice: 350,
    billingType: "Monthly Recurring",
    internalCost: 105,
    margin: 70,
    taskTemplate: "Review Management Tasklist",
    financeStatus: "Approved",
    sla: {
      firstResponseSLA: "1 business day",
      targetCompletionDays: 3,
      dueDateOffset: 3,
      escalationAfterDays: 5,
      clientUpdateFrequency: "Weekly",
      slaPriority: "Standard",
      slaStatus: "Active",
      notes: "Reviews responded to within 48 hours.",
    },
  },
  {
    id: "li-023",
    name: "Google Ads Audit",
    category: "PPC",
    department: "Paid Advertising Department",
    description: "Comprehensive Google Ads audit covering waste, Quality Scores, campaign structure, and recommendations.",
    unitPrice: 500,
    billingType: "One-Time",
    internalCost: 150,
    margin: 70,
    taskTemplate: "PPC Audit Tasklist",
    financeStatus: "Approved",
    sla: {
      firstResponseSLA: "1 business day",
      targetCompletionDays: 3,
      dueDateOffset: 0,
      escalationAfterDays: 5,
      clientUpdateFrequency: "As needed",
      slaPriority: "Standard",
      slaStatus: "Active",
      notes: "Read-only Ads access required.",
    },
  },
  {
    id: "li-024",
    name: "Social Media Consulting (Monthly)",
    category: "Consulting",
    department: "Creative Department",
    description: "Monthly social media strategy, content calendar planning, platform recommendations, and performance review.",
    unitPrice: 450,
    billingType: "Monthly Recurring",
    internalCost: 135,
    margin: 70,
    taskTemplate: "Social Consulting Tasklist",
    financeStatus: "Approved",
    sla: {
      firstResponseSLA: "1 business day",
      targetCompletionDays: 4,
      dueDateOffset: 3,
      escalationAfterDays: 7,
      clientUpdateFrequency: "Bi-weekly",
      slaPriority: "Standard",
      slaStatus: "Active",
      notes: "Content calendar shared by day 5.",
    },
  },
  {
    id: "li-025",
    name: "Website Redesign",
    category: "Web",
    department: "Web Department",
    description: "Full website redesign: UX/UI design, development, mobile optimization, and CMS handoff.",
    unitPrice: 5000,
    billingType: "One-Time",
    internalCost: 2000,
    margin: 60,
    taskTemplate: "Website Redesign Tasklist",
    financeStatus: "Approved",
    sla: {
      firstResponseSLA: "1 business day",
      targetCompletionDays: 45,
      dueDateOffset: 0,
      escalationAfterDays: 50,
      clientUpdateFrequency: "Every 3 business days",
      slaPriority: "Standard",
      slaStatus: "Active",
      notes: "Full content delivery required before development phase.",
    },
  },
  {
    id: "li-026",
    name: "Competitor Analysis Report",
    category: "Strategy",
    department: "Strategy Department",
    description: "In-depth competitor audit covering SEO, PPC, social, and content strategies with actionable recommendations.",
    unitPrice: 600,
    billingType: "One-Time",
    internalCost: 180,
    margin: 70,
    taskTemplate: "Competitor Analysis Tasklist",
    financeStatus: "Approved",
    sla: {
      firstResponseSLA: "1 business day",
      targetCompletionDays: 5,
      dueDateOffset: 0,
      escalationAfterDays: 8,
      clientUpdateFrequency: "As needed",
      slaPriority: "Standard",
      slaStatus: "Active",
      notes: "Top 5 competitors required upfront.",
    },
  },
  {
    id: "li-027",
    name: "Email Marketing Setup",
    category: "Setup",
    department: "Strategy Department",
    description: "Email marketing platform setup, list segmentation, welcome sequence, and first campaign template.",
    unitPrice: 800,
    billingType: "One-Time",
    internalCost: 240,
    margin: 70,
    taskTemplate: "Email Setup Tasklist",
    financeStatus: "Pending Review",
    sla: {
      firstResponseSLA: "1 business day",
      targetCompletionDays: 6,
      dueDateOffset: 0,
      escalationAfterDays: 9,
      clientUpdateFrequency: "As needed",
      slaPriority: "Standard",
      slaStatus: "Pending Review",
      notes: "SLA pending finance review — not yet approved.",
    },
  },
  {
    id: "li-028",
    name: "Video Ad Production",
    category: "Creative",
    department: "Creative Department",
    description: "Short-form video ad production for YouTube, Meta, or TikTok with scripting, editing, and delivery.",
    unitPrice: 1500,
    billingType: "One-Time",
    internalCost: 600,
    margin: 60,
    taskTemplate: "Video Production Tasklist",
    financeStatus: "Approved",
    sla: {
      firstResponseSLA: "1 business day",
      targetCompletionDays: 10,
      dueDateOffset: 0,
      escalationAfterDays: 14,
      clientUpdateFrequency: "Every 3 business days",
      slaPriority: "Standard",
      slaStatus: "Active",
      notes: "Script must be approved before production begins.",
    },
  },
  {
    id: "li-029",
    name: "Local SEO Maintenance (Monthly)",
    category: "Maintenance",
    department: "SEO Department",
    description: "Monthly local SEO maintenance: citation audits, GBP updates, local link building, and local ranking reports.",
    unitPrice: 400,
    billingType: "Monthly Recurring",
    internalCost: 120,
    margin: 70,
    taskTemplate: "Local SEO Maintenance Tasklist",
    financeStatus: "Approved",
    sla: {
      firstResponseSLA: "1 business day",
      targetCompletionDays: 4,
      dueDateOffset: 5,
      escalationAfterDays: 8,
      clientUpdateFrequency: "Weekly",
      slaPriority: "Standard",
      slaStatus: "Active",
      notes: "SEO setup must be complete first.",
    },
  },
  {
    id: "li-030",
    name: "Quarterly Business Review",
    category: "Consulting",
    department: "Strategy Department",
    description: "Quarterly strategic review: performance deep-dive, goal reassessment, channel reallocation, and Q-plan.",
    unitPrice: 500,
    billingType: "Quarterly",
    internalCost: 150,
    margin: 70,
    taskTemplate: "QBR Tasklist",
    financeStatus: "Approved",
    sla: {
      firstResponseSLA: "2 business days",
      targetCompletionDays: 5,
      dueDateOffset: 85,
      escalationAfterDays: 90,
      clientUpdateFrequency: "Quarterly",
      slaPriority: "Standard",
      slaStatus: "Active",
      notes: "Requires all monthly reports compiled before QBR session.",
    },
  },
];

//  Design Helpers 

const CATEGORY_COLORS: Record<Category, { bg?: string; text: string; border: string }> = {
  SEO:         { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE"},
  GBP:         { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0"},
  PPC:         { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA"},
  "Meta Ads":  { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE"},
  LSA:         { bg: "#ECFDF5", text: "#047857", border: "#A7F3D0"},
  Reporting:   { bg: "#F0F9FF", text: "#0369A1", border: "#BAE6FD"},
  Web:         { bg: "#FEFCE8", text: "#A16207", border: "#FDE68A"},
  Creative:    { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3"},
  Strategy:    { bg: "#F3F4F6", text: "#374151", border: "#D1D5DB"},
  Consulting:  { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A"},
  Setup:       { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0"},
  Maintenance: { bg: "#F8FAFC", text: "#475569", border: "#CBD5E1"},
};

const SLA_PRIORITY_COLORS: Record<SLAPriority, { bg?: string; text: string; border: string }> = {
  Standard: { bg: "#F3F4F6", text: "#374151", border: "#D1D5DB"},
  Priority: { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE"},
  Rush:     { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3"},
  Custom:   { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE"},
};

const SLA_STATUS_COLORS: Record<SLAStatus, { bg?: string; text: string; border: string }> = {
  Active:           { bg: "#F0FDF4", text: "#15803D", border: "#A7F3D0"},
  "Pending Review": { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA"},
  "Needs Approval": { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3"},
  Inactive:         { bg: "#F3F4F6", text: "#6B7280", border: "#D1D5DB"},
};

const FINANCE_STATUS_COLORS: Record<FinanceStatus, { bg?: string; text: string; border: string }> = {
  Approved:         { bg: "#F0FDF4", text: "#15803D", border: "#A7F3D0"},
  "Pending Review": { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA"},
  "Needs Pricing":  { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3"},
  Inactive:         { bg: "#F3F4F6", text: "#6B7280", border: "#D1D5DB"},
};

const SLA_PRIORITIES: SLAPriority[] = ["Standard", "Priority", "Rush", "Custom"];
const SLA_STATUSES: SLAStatus[] = ["Active", "Pending Review", "Needs Approval", "Inactive"];
const CATEGORIES: Category[] = [
  "SEO", "GBP", "PPC", "Meta Ads", "LSA", "Reporting",
  "Web", "Creative", "Strategy", "Consulting", "Setup", "Maintenance",
];

function Badge({ label, bg, text, border }: { label: string; bg?: string; text: string; border?: string }) {
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap"style={{ background: bg, color: text, borderColor: border ?? "transparent"}}
    >
      {label}
    </span>
  );
}

//  Edit SLA Modal 

function EditSLAModal({
  item,
  onClose,
}: {
  item: LineItemCatalog;
  onClose: () => void;
}) {
  const [form, setForm] = useState<LineItemSLA>({ ...item.sla });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"style={{ background: "rgba(0,0,0,0.45)"}}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden"style={{ background: "var(--rtm-surface)"}}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-start justify-between"style={{ borderBottom: "1px solid var(--rtm-border)", background: "#EFF6FF"}}
        >
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest mb-1"style={{ color: "#1D4ED8"}}>
              Edit Line Item SLA
            </div>
            <h2 className="text-base font-extrabold"style={{ color: "var(--rtm-text-primary)"}}>
              {item.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg hover:opacity-70"style={{ background: "rgba(0,0,0,0.08)", color: "var(--rtm-text-primary)"}}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wide block mb-1"style={{ color: "var(--rtm-text-muted)"}}>
                First Response SLA
              </label>
              <input
                type="text"value={form.firstResponseSLA}
                onChange={(e) => setForm({ ...form, firstResponseSLA: e.target.value })}
                className="w-full text-sm px-3 py-2 rounded-lg border outline-none"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)"}}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wide block mb-1"style={{ color: "var(--rtm-text-muted)"}}>
                Target Completion Days
              </label>
              <input
                type="number"value={form.targetCompletionDays}
                onChange={(e) => setForm({ ...form, targetCompletionDays: parseInt(e.target.value) || 0 })}
                className="w-full text-sm px-3 py-2 rounded-lg border outline-none"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)"}}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wide block mb-1"style={{ color: "var(--rtm-text-muted)"}}>
                Due Date Offset (Days)
              </label>
              <input
                type="number"value={form.dueDateOffset}
                onChange={(e) => setForm({ ...form, dueDateOffset: parseInt(e.target.value) || 0 })}
                className="w-full text-sm px-3 py-2 rounded-lg border outline-none"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)"}}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wide block mb-1"style={{ color: "var(--rtm-text-muted)"}}>
                Escalation After Days
              </label>
              <input
                type="number"value={form.escalationAfterDays}
                onChange={(e) => setForm({ ...form, escalationAfterDays: parseInt(e.target.value) || 0 })}
                className="w-full text-sm px-3 py-2 rounded-lg border outline-none"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)"}}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wide block mb-1"style={{ color: "var(--rtm-text-muted)"}}>
                Client Update Frequency
              </label>
              <input
                type="text"value={form.clientUpdateFrequency}
                onChange={(e) => setForm({ ...form, clientUpdateFrequency: e.target.value })}
                className="w-full text-sm px-3 py-2 rounded-lg border outline-none"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)"}}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wide block mb-1"style={{ color: "var(--rtm-text-muted)"}}>
                SLA Priority
              </label>
              <select
                value={form.slaPriority}
                onChange={(e) => setForm({ ...form, slaPriority: e.target.value as SLAPriority })}
                className="w-full text-sm px-3 py-2 rounded-lg border outline-none"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)"}}
              >
                {SLA_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wide block mb-1"style={{ color: "var(--rtm-text-muted)"}}>
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full text-sm px-3 py-2 rounded-lg border outline-none resize-none"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)"}}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex items-center gap-2"style={{ borderTop: "1px solid var(--rtm-border)"}}
        >
          <button
            className="px-4 py-2 rounded-lg text-sm font-bold text-white"style={{ background: "#1D4ED8"}}
            onClick={() => { alert("[Mock] SLA saved."); onClose(); }}
          >
            Save SLA
          </button>
          <button
            className="px-4 py-2 rounded-lg text-sm font-semibold border"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)"}}
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

//  Main Page 

export default function FinanceLineItemsPage() {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<Category | "All">("All");
  const [filterSLAStatus, setFilterSLAStatus] = useState<SLAStatus | "All">("All");
  const [filterFinanceStatus, setFilterFinanceStatus] = useState<FinanceStatus | "All">("All");
  const [editingItem, setEditingItem] = useState<LineItemCatalog | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return LINE_ITEMS.filter((li) => {
      const q = search.toLowerCase();
      const matchSearch = !q || li.name.toLowerCase().includes(q) || li.category.toLowerCase().includes(q) || li.department.toLowerCase().includes(q);
      const matchCat = filterCategory === "All"|| li.category === filterCategory;
      const matchSLAStatus = filterSLAStatus === "All"|| li.sla.slaStatus === filterSLAStatus;
      const matchFinanceStatus = filterFinanceStatus === "All"|| li.financeStatus === filterFinanceStatus;
      return matchSearch && matchCat && matchSLAStatus && matchFinanceStatus;
    });
  }, [search, filterCategory, filterSLAStatus, filterFinanceStatus]);

  // KPIs
  const totalItems = LINE_ITEMS.length;
  const approvedItems = LINE_ITEMS.filter((li) => li.financeStatus === "Approved").length;
  const activeSLAs = LINE_ITEMS.filter((li) => li.sla.slaStatus === "Active").length;
  const pendingReviewSLAs = LINE_ITEMS.filter((li) => li.sla.slaStatus === "Pending Review"|| li.sla.slaStatus === "Needs Approval").length;
  const rushItems = LINE_ITEMS.filter((li) => li.sla.slaPriority === "Rush").length;

  return (
    <div className="space-y-6">

      {/*  Page Header  */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[11px] font-bold uppercase tracking-widest"style={{ color: "#1D4ED8"}}>
              Finance
            </p>
            <span className="text-[11px]"style={{ color: "var(--rtm-text-muted)"}}>›</span>
            <p className="text-[11px] font-semibold uppercase tracking-widest"style={{ color: "var(--rtm-text-muted)"}}>
              Line Item Catalog
            </p>
          </div>
          <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>
            Line Item Catalog & SLA Management
          </h1>
          <p className="text-sm mt-1 max-w-2xl"style={{ color: "var(--rtm-text-secondary)"}}>
            SLAs are configured per line item and serve as the primary delivery commitment. Department SLAs are fallback defaults only. Each line item defines its own First Response SLA, Target Completion Days, Escalation Rules, and SLA Priority.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="px-4 py-2 rounded-lg text-sm font-bold text-white"style={{ background: "#1D4ED8"}}>
            + Add Line Item
          </button>
          <button className="px-4 py-2 rounded-lg text-sm font-semibold border"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)"}}>
            ↑ Import
          </button>
          <button className="px-4 py-2 rounded-lg text-sm font-semibold border"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)"}}>
            ↓ Export
          </button>
        </div>
      </div>

      {/*  SLA Architecture Banner  */}
      <div className="rounded-xl p-4 flex flex-wrap items-start gap-4"style={{ background: "#EFF6FF", border: "1px solid #BFDBFE"}}>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-black uppercase tracking-widest mb-1"style={{ color: "#1D4ED8"}}>
            SLA Architecture — Primary Source
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-full font-black"style={{ background: "#1D4ED8", color: "#fff"}}>
               Line Item SLA
            </span>
            <span className="font-bold"style={{ color: "#93C5FD"}}>→ Primary Delivery Commitment</span>
            <span className="px-2 py-1 rounded-full border font-semibold"style={{ background: "rgba(255,255,255,0.8)", color: "#1D4ED8", borderColor: "#BFDBFE"}}>
              Overrides Department Fallback
            </span>
          </div>
          <p className="text-xs mt-2"style={{ color: "#1E40AF"}}>
            When a proposal or contract includes line items, the SLAs attached to those line items govern delivery. Department SLAs apply only when no line item SLA exists.
          </p>
        </div>
        <div className="flex flex-col gap-1 text-xs font-semibold"style={{ color: "#1E40AF"}}>
          <span> Line Item SLA = Primary</span>
          <span> Department SLA = Fallback Default</span>
        </div>
      </div>

      {/*  KPI Cards  */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total Line Items", value: totalItems, color: "#1D4ED8", bg: "#EFF6FF"},
          { label: "Finance Approved", value: approvedItems, color: "#15803D", bg: "#F0FDF4"},
          { label: "Active SLAs", value: activeSLAs, color: "#047857", bg: "#ECFDF5"},
          { label: "Pending SLA Review", value: pendingReviewSLAs, color: "#C2410C", bg: "#FFF7ED"},
          { label: "Rush Priority Items", value: rushItems, color: "#BE123C", bg: "#FFF1F2"},
        ].map((c) => (
          <div key={c.label} className="rounded-xl border p-4 text-center"style={{ background: c.bg, borderColor: `${c.color}30` }}>
            <div
              className="text-[10px] font-bold px-1.5 py-0.5 rounded inline-block mb-1"style={{ background: `${c.color}20`, color: c.color }}
            >
              {String(c.label).slice(0, 2).toUpperCase()}
            </div>
            <div className="text-xl font-black"style={{ color: c.color }}>{c.value}</div>
            <div className="text-[10px] font-semibold mt-0.5 leading-tight"style={{ color: c.color }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/*  Filters  */}
      <div
        className="rounded-xl px-4 py-3 flex flex-wrap items-center gap-3"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
      >
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"style={{ color: "var(--rtm-text-muted)"}} fill="none"stroke="currentColor"viewBox="0 0 24 24">
            <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"placeholder="Search line items..."value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-primary)"}}
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as Category | "All")}
          className="text-sm px-3 py-2 rounded-lg outline-none"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-primary)"}}
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={filterSLAStatus}
          onChange={(e) => setFilterSLAStatus(e.target.value as SLAStatus | "All")}
          className="text-sm px-3 py-2 rounded-lg outline-none"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-primary)"}}
        >
          <option value="All">All SLA Statuses</option>
          {SLA_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={filterFinanceStatus}
          onChange={(e) => setFilterFinanceStatus(e.target.value as FinanceStatus | "All")}
          className="text-sm px-3 py-2 rounded-lg outline-none"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-primary)"}}
        >
          <option value="All">All Finance Statuses</option>
          {(["Approved", "Pending Review", "Needs Pricing", "Inactive"] as FinanceStatus[]).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-xs font-semibold ml-auto"style={{ color: "var(--rtm-text-muted)"}}>
          {filtered.length} of {totalItems} items
        </span>
      </div>

      {/*  Line Item SLA Table  */}
      <div className="rounded-xl overflow-hidden"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}>
        <div className="px-5 py-4 flex items-center gap-3"style={{ borderBottom: "1px solid var(--rtm-border)", background: "#F8FAFC"}}>
          
          <div>
            <h2 className="text-sm font-extrabold"style={{ color: "var(--rtm-text-primary)"}}>Line Item SLA Catalog</h2>
            <p className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>
              Each line item carries its own SLA. These are the primary delivery commitments used in proposals, contracts, task templates, and activation.
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs"style={{ borderCollapse: "collapse", minWidth: "1200px"}}>
            <thead>
              <tr style={{ background: "var(--rtm-bg)", borderBottom: "2px solid var(--rtm-border)"}}>
                {[
                  "Line Item",
                  "Category",
                  "Billing Type",
                  "Unit Price",
                  "First Response SLA",
                  "Target Completion",
                  "Due Date Offset",
                  "Escalation After",
                  "Client Updates",
                  "SLA Priority",
                  "SLA Status",
                  "Finance Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-3 py-2.5 text-[10px] font-black uppercase tracking-wide whitespace-nowrap"style={{ color: "var(--rtm-text-muted)"}}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((li, i) => {
                const catC = CATEGORY_COLORS[li.category];
                const slaPC = SLA_PRIORITY_COLORS[li.sla.slaPriority];
                const slaSC = SLA_STATUS_COLORS[li.sla.slaStatus];
                const finC = FINANCE_STATUS_COLORS[li.financeStatus];
                const isExpanded = expandedItem === li.id;

                return (
                  <React.Fragment key={li.id}>
                    <tr
                      style={{
                        borderBottom: isExpanded ? "none": "1px solid var(--rtm-border-light)",
                        background: i % 2 === 0 ? "var(--rtm-bg)": "var(--rtm-surface)",
                      }}
                    >
                      {/* Line Item */}
                      <td className="px-3 py-2.5">
                        <div className="font-bold"style={{ color: "var(--rtm-text-primary)"}}>{li.name}</div>
                        <div className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>{li.id} · {li.department}</div>
                      </td>
                      {/* Category */}
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <Badge label={li.category} bg={catC.bg} text={catC.text} border={catC.border} />
                      </td>
                      {/* Billing Type */}
                      <td className="px-3 py-2.5 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>
                        {li.billingType}
                      </td>
                      {/* Unit Price */}
                      <td className="px-3 py-2.5 font-bold whitespace-nowrap"style={{ color: "var(--rtm-text-primary)"}}>
                        ${li.unitPrice.toLocaleString()}
                      </td>
                      {/* First Response SLA */}
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="font-semibold text-[11px]"style={{ color: "#1D4ED8"}}>
                           {li.sla.firstResponseSLA}
                        </span>
                      </td>
                      {/* Target Completion */}
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="font-bold text-[11px]"style={{ color: "#059669"}}>
                          {li.sla.targetCompletionDays} business days
                        </span>
                      </td>
                      {/* Due Date Offset */}
                      <td className="px-3 py-2.5 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>
                        {li.sla.dueDateOffset > 0 ? `Day ${li.sla.dueDateOffset}` : "Start"}
                      </td>
                      {/* Escalation After */}
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="text-[11px]"style={{ color: "#C2410C"}}>
                          {li.sla.escalationAfterDays}d
                        </span>
                      </td>
                      {/* Client Updates */}
                      <td className="px-3 py-2.5 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>
                        {li.sla.clientUpdateFrequency}
                      </td>
                      {/* SLA Priority */}
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <Badge label={li.sla.slaPriority} bg={slaPC.bg} text={slaPC.text} border={slaPC.border} />
                      </td>
                      {/* SLA Status */}
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <Badge label={li.sla.slaStatus} bg={slaSC.bg} text={slaSC.text} border={slaSC.border} />
                      </td>
                      {/* Finance Status */}
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <Badge label={` ${li.financeStatus}`} bg={finC.bg} text={finC.text} border={finC.border} />
                      </td>
                      {/* Actions */}
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1 flex-wrap">
                          <button
                            onClick={() => setEditingItem(li)}
                            className="text-[10px] font-semibold px-2 py-1 rounded hover:opacity-80"style={{ background: "#EFF6FF", color: "#1D4ED8"}}
                          >
                            Edit SLA
                          </button>
                          <button
                            onClick={() => alert("[Mock] SLA Approved.")}
                            className="text-[10px] font-semibold px-2 py-1 rounded hover:opacity-80"style={{ background: "#F0FDF4", color: "#15803D"}}
                          >
                            Approve SLA
                          </button>
                          <button
                            onClick={() => setExpandedItem(isExpanded ? null : li.id)}
                            className="text-[10px] font-semibold px-2 py-1 rounded border hover:opacity-80"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)"}}
                          >
                            {isExpanded ? "Collapse": "Details"}
                          </button>
                          <button
                            onClick={() => alert("[Mock] Custom SLA dialog.")}
                            className="text-[10px] font-semibold px-2 py-1 rounded hover:opacity-80"style={{ background: "#F5F3FF", color: "#6D28D9"}}
                          >
                            Custom SLA
                          </button>
                          <button
                            onClick={() => alert("[Mock] SLA duplicated.")}
                            className="text-[10px] font-semibold px-2 py-1 rounded hover:opacity-80"style={{ background: "#FEFCE8", color: "#A16207"}}
                          >
                            Duplicate
                          </button>
                          <button
                            onClick={() => alert("[Mock] SLA deactivated.")}
                            className="text-[10px] font-semibold px-2 py-1 rounded hover:opacity-80"style={{ background: "#FFF1F2", color: "#BE123C"}}
                          >
                            Deactivate
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/*  Expanded SLA Detail  */}
                    {isExpanded && (
                      <tr style={{ background: "#F0F9FF", borderBottom: "2px solid #BFDBFE"}}>
                        <td colSpan={13} className="px-5 py-4">
                          <div className="rounded-xl border p-4"style={{ background: "#fff", borderColor: "#BFDBFE"}}>
                            <div className="text-[10px] font-black uppercase tracking-widest mb-3"style={{ color: "#1D4ED8"}}>
                               Line Item SLA Detail — {li.name}
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-3">
                              {[
                                { label: "First Response", value: li.sla.firstResponseSLA, color: "#1D4ED8", bg: "#EFF6FF"},
                                { label: "Target Completion", value: `${li.sla.targetCompletionDays} biz days`, color: "#15803D", bg: "#F0FDF4"},
                                { label: "Due Date Offset", value: li.sla.dueDateOffset > 0 ? `Day ${li.sla.dueDateOffset}` : "Immediate", color: "#374151", bg: "#F3F4F6"},
                                { label: "Escalation After", value: `${li.sla.escalationAfterDays} days`, color: "#C2410C", bg: "#FFF7ED"},
                                { label: "Client Updates", value: li.sla.clientUpdateFrequency, color: "#047857", bg: "#ECFDF5"},
                                { label: "SLA Priority", value: li.sla.slaPriority, color: SLA_PRIORITY_COLORS[li.sla.slaPriority].text, bg: SLA_PRIORITY_COLORS[li.sla.slaPriority].bg },
                                { label: "Task Template", value: li.taskTemplate, color: "#6D28D9", bg: "#F5F3FF"},
                              ].map((r) => (
                                <div key={r.label} className="rounded-lg p-3 text-center"style={{ background: r.bg, border: `1px solid ${r.color}20` }}>
                                  <div className="text-[9px] font-bold uppercase tracking-wide mb-1"style={{ color: r.color }}>{r.label}</div>
                                  <div className="text-xs font-black leading-tight"style={{ color: r.color }}>{r.value}</div>
                                </div>
                              ))}
                            </div>
                            {li.sla.notes && (
                              <div className="text-xs rounded-lg px-3 py-2"style={{ background: "#FFFBEB", color: "#92400E", border: "1px solid #FDE68A"}}>
                                 {li.sla.notes}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center"style={{ color: "var(--rtm-text-muted)"}}>
            
            <div className="text-sm font-semibold">No line items match your filters.</div>
          </div>
        )}

        <div
          className="px-5 py-3 flex items-center justify-between"style={{ borderTop: "1px solid var(--rtm-border-light)"}}
        >
          <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>
            Showing {filtered.length} of {totalItems} line items
          </span>
          <span className="text-xs font-semibold"style={{ color: "var(--rtm-text-muted)"}}>
            {activeSLAs} active SLAs · {pendingReviewSLAs} pending review
          </span>
        </div>
      </div>

      {/*  SLA Priority Breakdown  */}
      <div className="rounded-xl overflow-hidden"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}>
        <div className="px-5 py-4"style={{ borderBottom: "1px solid var(--rtm-border)"}}>
          <h2 className="text-sm font-extrabold"style={{ color: "var(--rtm-text-primary)"}}> SLA Priority Breakdown</h2>
          <p className="text-[10px] mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>
            Line items grouped by SLA Priority. Rush items require same-day or next-day response.
          </p>
        </div>
        <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {SLA_PRIORITIES.map((priority) => {
            const items = LINE_ITEMS.filter((li) => li.sla.slaPriority === priority);
            const c = SLA_PRIORITY_COLORS[priority];
            return (
              <div key={priority} className="rounded-xl overflow-hidden"style={{ border: `1px solid ${c.border}` }}>
                <div className="px-4 py-3 flex items-center justify-between"style={{ background: c.bg }}>
                  <span className="text-xs font-black"style={{ color: c.text }}>{priority}</span>
                  <span className="text-xl font-black"style={{ color: c.text }}>{items.length}</span>
                </div>
                <div className="px-4 py-3 space-y-1 bg-white">
                  {items.slice(0, 4).map((li) => (
                    <div key={li.id} className="text-[11px]"style={{ color: "var(--rtm-text-secondary)"}}>
                      · {li.name}
                    </div>
                  ))}
                  {items.length > 4 && (
                    <div className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>+{items.length - 4} more</div>
                  )}
                  {items.length === 0 && (
                    <div className="text-[11px]"style={{ color: "var(--rtm-text-muted)"}}>None configured</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/*  Edit SLA Modal  */}
      {editingItem && (
        <EditSLAModal item={editingItem} onClose={() => setEditingItem(null)} />
      )}
    </div>
  );
}
