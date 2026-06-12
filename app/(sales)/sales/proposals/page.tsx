"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Category =
  | "SEO" | "GBP" | "PPC" | "Meta Ads" | "LSA" | "Reporting"
  | "Web" | "Creative" | "Strategy" | "Consulting" | "Setup" | "Maintenance";

type BillingType = "One-Time" | "Monthly Recurring" | "Quarterly" | "Annual";

type FinanceStatus = "Approved" | "Pending Review" | "Needs Pricing" | "Inactive";

type DependencyStatus = "Required" | "Missing" | "Satisfied" | "Blocked";

type DiscountType = "Percentage" | "Fixed Amount" | "Line Item Discount" | "Package Discount";

type BudgetType = "Monthly Budget" | "One-Time Budget" | "Total Contract Budget";

type ProposalStage =
  | "Draft" | "Internal Review" | "Ready to Send" | "Sent"
  | "Viewed" | "Negotiation" | "Approved" | "Rejected" | "Pushed to Handoff";

type ContractStatus =
  | "Draft" | "Pending Internal Approval" | "Pending Client Approval"
  | "Pending Signature" | "Signed" | "Rejected" | "Expired" | "Cancelled";

type ContractTerm =
  | "Month-to-Month" | "3 Months" | "6 Months" | "12 Months" | "24 Months" | "36 Months" | "Custom";

type SignatureStatus =
  | "Draft" | "Ready For Signature" | "Sent For Signature" | "Viewed" | "Signed" | "Rejected" | "Expired";

type DepartmentActivationStatus = "Pending" | "Ready" | "Activated" | "Blocked";

type TaskActivationStatus = "Pending" | "Ready" | "Activated" | "Blocked";

type RenewalStatus = "Not Started" | "In Progress" | "Renewal Sent" | "Renewed" | "At Risk" | "Lost";

interface Prerequisite {
  name: string;
  status: DependencyStatus;
}

interface LineItemCatalog {
  id: string;
  name: string;
  category: Category;
  department: string;
  description: string;
  unitPrice: number;
  billingType: BillingType;
  workloadHours: number;
  internalCost: number;
  margin: number;
  prerequisites: Prerequisite[];
  dependencies: string[];
  taskTemplate: string;
  taskCount: number;
  activationRequirements: string[];
  financeStatus: FinanceStatus;
  financeApprovedPrice: number;
  financeApprovedWorkload: number;
  financeApprovedCost: number;
  financeMargin: number;
}

interface ProposalLineItem extends LineItemCatalog {
  quantity: number;
  customDiscount: number;
  subtotal: number;
  note: string;
}

interface Proposal {
  id: string;
  name: string;
  client: string;
  salesRep: string;
  stage: ProposalStage;
  clientBudget: number;
  budgetType: BudgetType;
  lineItems: ProposalLineItem[];
  promoCode: string;
  discountType: DiscountType;
  discountAmount: number;
  auditFindings: Partial<AuditInputs>;
  notes: string;
  createdDate: string;
  lastActivity: string;
}

interface AuditInputs {
  seoIssues: string;
  gbpIssues: string;
  ppcOpportunity: string;
  metaOpportunity: string;
  websiteIssues: string;
  reportingNeeds: string;
  competitorGap: string;
  budgetRange: string;
}

interface ContractData {
  id: string;
  name: string;
  client: string;
  contractNumber: string;
  contractVersion: string;
  contractOwner: string;
  status: ContractStatus;
  term: ContractTerm;
  customTermMonths?: number;
  startDate: string;
  endDate: string;
  renewalDate: string;
  autoRenewal: boolean;
  createdDate: string;
  setupLineItems: ProposalLineItem[];
  recurringLineItems: ProposalLineItem[];
  discountType: DiscountType;
  discountAmount: number;
  promoCode: string;
  promoApprovalStatus: "Approved" | "Pending Approval" | "Rejected";
  signatureStatus: SignatureStatus;
  sentDate: string;
  viewedDate: string;
  signedDate: string;
  signer: string;
  expirationDate: string;
  billingFrequency: string;
  firstInvoiceDate: string;
  salesRep: string;
  proposalId: string;
}

interface DepartmentActivation {
  department: string;
  icon: string;
  status: DepartmentActivationStatus;
  lineItems: string[];
  taskCount: number;
  estimatedHours: number;
}

interface TaskActivationRow {
  lineItem: string;
  taskTemplate: string;
  department: string;
  taskCount: number;
  estimatedHours: number;
  status: TaskActivationStatus;
}

interface TimelineEvent {
  label: string;
  date: string;
  icon: string;
  done: boolean;
}

interface RenewalNotice {
  days: number;
  date: string;
  label: string;
  sent: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Line Item Catalog — 30 Items
// ─────────────────────────────────────────────────────────────────────────────

const LINE_ITEM_CATALOG: LineItemCatalog[] = [
  {
    id: "li-001",
    name: "SEO Setup & Onboarding",
    category: "SEO",
    department: "SEO Department",
    description: "Initial SEO audit, keyword research, baseline reporting, GSC/GA4 setup, and technical recommendations.",
    unitPrice: 1500,
    billingType: "One-Time",
    workloadHours: 12,
    internalCost: 600,
    margin: 60,
    prerequisites: [
      { name: "Website Access", status: "Required" },
      { name: "GSC Access", status: "Required" },
      { name: "GA4 Access", status: "Required" },
    ],
    dependencies: ["Tracking Setup"],
    taskTemplate: "SEO Setup Tasklist",
    taskCount: 18,
    activationRequirements: ["Website Access Confirmed", "GA4 Connected", "GSC Verified"],
    financeStatus: "Approved",
    financeApprovedPrice: 1500,
    financeApprovedWorkload: 12,
    financeApprovedCost: 600,
    financeMargin: 60,
  },
  {
    id: "li-002",
    name: "SEO Monthly Management",
    category: "SEO",
    department: "SEO Department",
    description: "Ongoing SEO management: content optimization, link building, technical fixes, and monthly reporting.",
    unitPrice: 1200,
    billingType: "Monthly Recurring",
    workloadHours: 10,
    internalCost: 480,
    margin: 60,
    prerequisites: [
      { name: "SEO Setup Completed", status: "Required" },
      { name: "Website Access", status: "Required" },
    ],
    dependencies: ["SEO Setup & Onboarding"],
    taskTemplate: "SEO Monthly Tasklist",
    taskCount: 22,
    activationRequirements: ["SEO Setup Confirmed", "Keyword Strategy Approved"],
    financeStatus: "Approved",
    financeApprovedPrice: 1200,
    financeApprovedWorkload: 10,
    financeApprovedCost: 480,
    financeMargin: 60,
  },
  {
    id: "li-003",
    name: "GBP Optimization",
    category: "GBP",
    department: "GBP Department",
    description: "Google Business Profile audit, optimization, Q&A management, photo uploads, and weekly posting.",
    unitPrice: 500,
    billingType: "Monthly Recurring",
    workloadHours: 4,
    internalCost: 150,
    margin: 70,
    prerequisites: [
      { name: "GBP Access", status: "Required" },
      { name: "Location Verification", status: "Required" },
    ],
    dependencies: [],
    taskTemplate: "GBP Launch Tasklist",
    taskCount: 12,
    activationRequirements: ["GBP Ownership Verified", "GBP Access Granted"],
    financeStatus: "Approved",
    financeApprovedPrice: 500,
    financeApprovedWorkload: 4,
    financeApprovedCost: 150,
    financeMargin: 70,
  },
  {
    id: "li-004",
    name: "GBP Setup & Claim",
    category: "GBP",
    department: "GBP Department",
    description: "Full GBP profile claim, verification, initial setup, and category/attribute optimization.",
    unitPrice: 350,
    billingType: "One-Time",
    workloadHours: 3,
    internalCost: 105,
    margin: 70,
    prerequisites: [
      { name: "Business Name & Address", status: "Required" },
      { name: "Owner Contact Info", status: "Required" },
    ],
    dependencies: [],
    taskTemplate: "GBP Setup Tasklist",
    taskCount: 8,
    activationRequirements: ["Owner Authorization", "Address Confirmed"],
    financeStatus: "Approved",
    financeApprovedPrice: 350,
    financeApprovedWorkload: 3,
    financeApprovedCost: 105,
    financeMargin: 70,
  },
  {
    id: "li-005",
    name: "PPC Campaign Setup",
    category: "PPC",
    department: "Paid Advertising Department",
    description: "Full Google Ads account setup, campaign structure, ad copy creation, audience setup, and conversion tracking.",
    unitPrice: 1200,
    billingType: "One-Time",
    workloadHours: 14,
    internalCost: 480,
    margin: 60,
    prerequisites: [
      { name: "Google Ads Account Access", status: "Required" },
      { name: "Tracking Setup", status: "Required" },
      { name: "Landing Page Review", status: "Required" },
    ],
    dependencies: ["Tracking Setup", "Landing Page Review"],
    taskTemplate: "PPC Launch Tasklist",
    taskCount: 20,
    activationRequirements: ["Ads Account Access", "Billing Confirmed", "Landing Page Live"],
    financeStatus: "Approved",
    financeApprovedPrice: 1200,
    financeApprovedWorkload: 14,
    financeApprovedCost: 480,
    financeMargin: 60,
  },
  {
    id: "li-006",
    name: "PPC Monthly Management",
    category: "PPC",
    department: "Paid Advertising Department",
    description: "Ongoing Google Ads management: bid optimization, A/B testing, negative keyword pruning, monthly reporting.",
    unitPrice: 1500,
    billingType: "Monthly Recurring",
    workloadHours: 12,
    internalCost: 600,
    margin: 60,
    prerequisites: [
      { name: "PPC Setup Completed", status: "Required" },
      { name: "Google Ads Account Access", status: "Required" },
    ],
    dependencies: ["PPC Campaign Setup"],
    taskTemplate: "PPC Monthly Tasklist",
    taskCount: 18,
    activationRequirements: ["Campaign Active", "Conversion Tracking Verified"],
    financeStatus: "Approved",
    financeApprovedPrice: 1500,
    financeApprovedWorkload: 12,
    financeApprovedCost: 600,
    financeMargin: 60,
  },
  {
    id: "li-007",
    name: "Meta Ads Setup",
    category: "Meta Ads",
    department: "Paid Advertising Department",
    description: "Facebook/Instagram Ads account setup, Pixel installation, audience creation, and initial campaign structure.",
    unitPrice: 900,
    billingType: "One-Time",
    workloadHours: 10,
    internalCost: 360,
    margin: 60,
    prerequisites: [
      { name: "Meta Business Manager Access", status: "Required" },
      { name: "Facebook Pixel Setup", status: "Required" },
    ],
    dependencies: ["Tracking Setup"],
    taskTemplate: "Meta Ads Launch Tasklist",
    taskCount: 16,
    activationRequirements: ["Business Manager Access", "Pixel Verified", "Ad Account Active"],
    financeStatus: "Approved",
    financeApprovedPrice: 900,
    financeApprovedWorkload: 10,
    financeApprovedCost: 360,
    financeMargin: 60,
  },
  {
    id: "li-008",
    name: "Meta Ads Monthly Management",
    category: "Meta Ads",
    department: "Paid Advertising Department",
    description: "Ongoing Meta Ads management: creative rotation, audience testing, retargeting, monthly performance reports.",
    unitPrice: 1200,
    billingType: "Monthly Recurring",
    workloadHours: 10,
    internalCost: 480,
    margin: 60,
    prerequisites: [
      { name: "Meta Ads Setup Completed", status: "Required" },
      { name: "Creative Assets", status: "Required" },
    ],
    dependencies: ["Meta Ads Setup"],
    taskTemplate: "Meta Monthly Tasklist",
    taskCount: 15,
    activationRequirements: ["Ads Live", "Creative Approved", "Retargeting Active"],
    financeStatus: "Approved",
    financeApprovedPrice: 1200,
    financeApprovedWorkload: 10,
    financeApprovedCost: 480,
    financeMargin: 60,
  },
  {
    id: "li-009",
    name: "LSA Account Setup",
    category: "LSA",
    department: "LSA Department",
    description: "Google Local Services Ads account creation, verification, budget setup, and background check coordination.",
    unitPrice: 600,
    billingType: "One-Time",
    workloadHours: 5,
    internalCost: 180,
    margin: 70,
    prerequisites: [
      { name: "Business License", status: "Required" },
      { name: "Insurance Documents", status: "Required" },
      { name: "Google Business Profile", status: "Required" },
    ],
    dependencies: ["GBP Setup & Claim"],
    taskTemplate: "LSA Setup Tasklist",
    taskCount: 10,
    activationRequirements: ["Verification Complete", "Background Check Cleared", "GBP Linked"],
    financeStatus: "Approved",
    financeApprovedPrice: 600,
    financeApprovedWorkload: 5,
    financeApprovedCost: 180,
    financeMargin: 70,
  },
  {
    id: "li-010",
    name: "LSA Monthly Management",
    category: "LSA",
    department: "LSA Department",
    description: "Ongoing LSA management: bid adjustments, lead dispute management, review strategy, and monthly reporting.",
    unitPrice: 800,
    billingType: "Monthly Recurring",
    workloadHours: 6,
    internalCost: 240,
    margin: 70,
    prerequisites: [
      { name: "LSA Account Active", status: "Required" },
      { name: "Verified Business", status: "Required" },
    ],
    dependencies: ["LSA Account Setup"],
    taskTemplate: "LSA Monthly Tasklist",
    taskCount: 12,
    activationRequirements: ["LSA Account Verified", "Budget Set"],
    financeStatus: "Approved",
    financeApprovedPrice: 800,
    financeApprovedWorkload: 6,
    financeApprovedCost: 240,
    financeMargin: 70,
  },
  {
    id: "li-011",
    name: "Reporting Dashboard Setup",
    category: "Reporting",
    department: "Reporting Department",
    description: "Custom reporting dashboard setup in Looker Studio or Data Studio with client-specific KPIs and data sources.",
    unitPrice: 400,
    billingType: "One-Time",
    workloadHours: 6,
    internalCost: 120,
    margin: 70,
    prerequisites: [
      { name: "Data Source Access", status: "Required" },
      { name: "GA4 Access", status: "Required" },
      { name: "Ads Access", status: "Required" },
    ],
    dependencies: ["Tracking Setup"],
    taskTemplate: "Reporting Setup Tasklist",
    taskCount: 8,
    activationRequirements: ["All Data Sources Connected", "Dashboard Template Confirmed"],
    financeStatus: "Approved",
    financeApprovedPrice: 400,
    financeApprovedWorkload: 6,
    financeApprovedCost: 120,
    financeMargin: 70,
  },
  {
    id: "li-012",
    name: "Monthly Reporting Package",
    category: "Reporting",
    department: "Reporting Department",
    description: "Monthly performance reports across all active channels with executive summary and recommendations.",
    unitPrice: 300,
    billingType: "Monthly Recurring",
    workloadHours: 4,
    internalCost: 90,
    margin: 70,
    prerequisites: [
      { name: "Dashboard Setup", status: "Required" },
      { name: "Data Source Access", status: "Required" },
    ],
    dependencies: ["Reporting Dashboard Setup"],
    taskTemplate: "Monthly Reporting Tasklist",
    taskCount: 6,
    activationRequirements: ["Dashboard Active", "Report Template Approved"],
    financeStatus: "Approved",
    financeApprovedPrice: 300,
    financeApprovedWorkload: 4,
    financeApprovedCost: 90,
    financeMargin: 70,
  },
  {
    id: "li-013",
    name: "Landing Page Design & Build",
    category: "Web",
    department: "Web Department",
    description: "Custom landing page design and development optimized for PPC/paid campaign conversion.",
    unitPrice: 1800,
    billingType: "One-Time",
    workloadHours: 20,
    internalCost: 720,
    margin: 60,
    prerequisites: [
      { name: "Brand Guidelines", status: "Required" },
      { name: "Copy & Messaging", status: "Required" },
    ],
    dependencies: [],
    taskTemplate: "Landing Page Build Tasklist",
    taskCount: 24,
    activationRequirements: ["Brand Kit Received", "Content Approved", "Hosting Confirmed"],
    financeStatus: "Approved",
    financeApprovedPrice: 1800,
    financeApprovedWorkload: 20,
    financeApprovedCost: 720,
    financeMargin: 60,
  },
  {
    id: "li-014",
    name: "Website Maintenance (Monthly)",
    category: "Maintenance",
    department: "Web Department",
    description: "Monthly website maintenance: plugin updates, security scans, uptime monitoring, and minor fixes.",
    unitPrice: 250,
    billingType: "Monthly Recurring",
    workloadHours: 2,
    internalCost: 75,
    margin: 70,
    prerequisites: [
      { name: "Website Access", status: "Required" },
      { name: "Hosting Credentials", status: "Required" },
    ],
    dependencies: [],
    taskTemplate: "Web Maintenance Tasklist",
    taskCount: 5,
    activationRequirements: ["CMS Access Confirmed", "Hosting Access Confirmed"],
    financeStatus: "Approved",
    financeApprovedPrice: 250,
    financeApprovedWorkload: 2,
    financeApprovedCost: 75,
    financeMargin: 70,
  },
  {
    id: "li-015",
    name: "Creative Design Package",
    category: "Creative",
    department: "Creative Department",
    description: "Monthly creative assets: social media graphics, ad creatives, banners, and branded content.",
    unitPrice: 800,
    billingType: "Monthly Recurring",
    workloadHours: 8,
    internalCost: 240,
    margin: 70,
    prerequisites: [
      { name: "Brand Guidelines", status: "Required" },
      { name: "Creative Brief", status: "Required" },
    ],
    dependencies: [],
    taskTemplate: "Creative Monthly Tasklist",
    taskCount: 14,
    activationRequirements: ["Brand Kit Approved", "Content Calendar Confirmed"],
    financeStatus: "Approved",
    financeApprovedPrice: 800,
    financeApprovedWorkload: 8,
    financeApprovedCost: 240,
    financeMargin: 70,
  },
  {
    id: "li-016",
    name: "Creative Brand Package (One-Time)",
    category: "Creative",
    department: "Creative Department",
    description: "Logo design, brand color palette, typography guide, and brand asset package delivery.",
    unitPrice: 2000,
    billingType: "One-Time",
    workloadHours: 20,
    internalCost: 800,
    margin: 60,
    prerequisites: [
      { name: "Brand Discovery Session", status: "Required" },
    ],
    dependencies: [],
    taskTemplate: "Brand Package Tasklist",
    taskCount: 16,
    activationRequirements: ["Discovery Call Completed", "Competitor Analysis Done"],
    financeStatus: "Approved",
    financeApprovedPrice: 2000,
    financeApprovedWorkload: 20,
    financeApprovedCost: 800,
    financeMargin: 60,
  },
  {
    id: "li-017",
    name: "Digital Strategy Consulting",
    category: "Strategy",
    department: "Strategy Department",
    description: "Monthly strategic consulting sessions, market analysis, competitive intelligence, and growth planning.",
    unitPrice: 600,
    billingType: "Monthly Recurring",
    workloadHours: 5,
    internalCost: 180,
    margin: 70,
    prerequisites: [
      { name: "Business Goals Defined", status: "Required" },
    ],
    dependencies: [],
    taskTemplate: "Strategy Consulting Tasklist",
    taskCount: 6,
    activationRequirements: ["Kickoff Call Scheduled", "Goals Document Signed Off"],
    financeStatus: "Approved",
    financeApprovedPrice: 600,
    financeApprovedWorkload: 5,
    financeApprovedCost: 180,
    financeMargin: 70,
  },
  {
    id: "li-018",
    name: "Tracking & Analytics Setup",
    category: "Setup",
    department: "Reporting Department",
    description: "Full tracking setup: GA4, Google Tag Manager, conversion events, call tracking, and form submission tracking.",
    unitPrice: 700,
    billingType: "One-Time",
    workloadHours: 8,
    internalCost: 210,
    margin: 70,
    prerequisites: [
      { name: "Website Access", status: "Required" },
      { name: "GA4 Property Access", status: "Required" },
    ],
    dependencies: [],
    taskTemplate: "Tracking Setup Tasklist",
    taskCount: 10,
    activationRequirements: ["Website Access Confirmed", "GTM Container Created"],
    financeStatus: "Approved",
    financeApprovedPrice: 700,
    financeApprovedWorkload: 8,
    financeApprovedCost: 210,
    financeMargin: 70,
  },
  {
    id: "li-019",
    name: "Keyword Strategy & Research",
    category: "SEO",
    department: "SEO Department",
    description: "In-depth keyword research, competitive gap analysis, content opportunity mapping, and keyword grouping.",
    unitPrice: 500,
    billingType: "One-Time",
    workloadHours: 6,
    internalCost: 150,
    margin: 70,
    prerequisites: [
      { name: "Industry/Niche Defined", status: "Required" },
      { name: "Target Location Set", status: "Required" },
    ],
    dependencies: [],
    taskTemplate: "Keyword Research Tasklist",
    taskCount: 8,
    activationRequirements: ["Service Areas Confirmed", "Competitor List Provided"],
    financeStatus: "Approved",
    financeApprovedPrice: 500,
    financeApprovedWorkload: 6,
    financeApprovedCost: 150,
    financeMargin: 70,
  },
  {
    id: "li-020",
    name: "Content Writing (Monthly — 4 Articles)",
    category: "SEO",
    department: "SEO Department",
    description: "Four SEO-optimized blog articles per month targeting priority keywords with internal linking strategy.",
    unitPrice: 700,
    billingType: "Monthly Recurring",
    workloadHours: 8,
    internalCost: 280,
    margin: 60,
    prerequisites: [
      { name: "Keyword Strategy Completed", status: "Required" },
      { name: "Content Calendar", status: "Required" },
    ],
    dependencies: ["Keyword Strategy & Research"],
    taskTemplate: "Content Writing Tasklist",
    taskCount: 10,
    activationRequirements: ["Topic List Approved", "Brand Voice Guide Confirmed"],
    financeStatus: "Approved",
    financeApprovedPrice: 700,
    financeApprovedWorkload: 8,
    financeApprovedCost: 280,
    financeMargin: 60,
  },
  {
    id: "li-021",
    name: "Citation Building Package",
    category: "SEO",
    department: "SEO Department",
    description: "Manual citation submissions to top 50 directories including Yelp, YP, BBB, and niche directories.",
    unitPrice: 400,
    billingType: "One-Time",
    workloadHours: 5,
    internalCost: 120,
    margin: 70,
    prerequisites: [
      { name: "NAP Information Confirmed", status: "Required" },
    ],
    dependencies: [],
    taskTemplate: "Citation Building Tasklist",
    taskCount: 6,
    activationRequirements: ["Business Name/Address/Phone Locked"],
    financeStatus: "Approved",
    financeApprovedPrice: 400,
    financeApprovedWorkload: 5,
    financeApprovedCost: 120,
    financeMargin: 70,
  },
  {
    id: "li-022",
    name: "Review Management (Monthly)",
    category: "GBP",
    department: "GBP Department",
    description: "Monthly review monitoring, response management, and review generation campaign for GBP and Google.",
    unitPrice: 350,
    billingType: "Monthly Recurring",
    workloadHours: 3,
    internalCost: 105,
    margin: 70,
    prerequisites: [
      { name: "GBP Access", status: "Required" },
      { name: "Review Platform Access", status: "Required" },
    ],
    dependencies: ["GBP Optimization"],
    taskTemplate: "Review Management Tasklist",
    taskCount: 8,
    activationRequirements: ["GBP Access Confirmed", "Response Templates Approved"],
    financeStatus: "Approved",
    financeApprovedPrice: 350,
    financeApprovedWorkload: 3,
    financeApprovedCost: 105,
    financeMargin: 70,
  },
  {
    id: "li-023",
    name: "Google Ads Audit",
    category: "PPC",
    department: "Paid Advertising Department",
    description: "Comprehensive Google Ads audit covering waste, Quality Scores, campaign structure, and recommendations.",
    unitPrice: 500,
    billingType: "One-Time",
    workloadHours: 5,
    internalCost: 150,
    margin: 70,
    prerequisites: [
      { name: "Google Ads Account Access", status: "Required" },
    ],
    dependencies: [],
    taskTemplate: "PPC Audit Tasklist",
    taskCount: 6,
    activationRequirements: ["Ads Account Read Access"],
    financeStatus: "Approved",
    financeApprovedPrice: 500,
    financeApprovedWorkload: 5,
    financeApprovedCost: 150,
    financeMargin: 70,
  },
  {
    id: "li-024",
    name: "Social Media Consulting (Monthly)",
    category: "Consulting",
    department: "Creative Department",
    description: "Monthly social media strategy, content calendar planning, platform recommendations, and performance review.",
    unitPrice: 450,
    billingType: "Monthly Recurring",
    workloadHours: 4,
    internalCost: 135,
    margin: 70,
    prerequisites: [
      { name: "Social Platform Access", status: "Required" },
    ],
    dependencies: [],
    taskTemplate: "Social Consulting Tasklist",
    taskCount: 6,
    activationRequirements: ["Social Account Access Granted", "Content Calendar Template Shared"],
    financeStatus: "Approved",
    financeApprovedPrice: 450,
    financeApprovedWorkload: 4,
    financeApprovedCost: 135,
    financeMargin: 70,
  },
  {
    id: "li-025",
    name: "Website Redesign",
    category: "Web",
    department: "Web Department",
    description: "Full website redesign: UX/UI design, development, mobile optimization, and CMS handoff.",
    unitPrice: 5000,
    billingType: "One-Time",
    workloadHours: 60,
    internalCost: 2000,
    margin: 60,
    prerequisites: [
      { name: "Sitemap & Content Plan", status: "Required" },
      { name: "Brand Guidelines", status: "Required" },
      { name: "Hosting Access", status: "Required" },
    ],
    dependencies: ["Creative Brand Package (One-Time)"],
    taskTemplate: "Website Redesign Tasklist",
    taskCount: 40,
    activationRequirements: ["Contract Signed", "Content Delivered", "Hosting Confirmed"],
    financeStatus: "Approved",
    financeApprovedPrice: 5000,
    financeApprovedWorkload: 60,
    financeApprovedCost: 2000,
    financeMargin: 60,
  },
  {
    id: "li-026",
    name: "Competitor Analysis Report",
    category: "Strategy",
    department: "Strategy Department",
    description: "In-depth competitor audit covering SEO, PPC, social, and content strategies with actionable recommendations.",
    unitPrice: 600,
    billingType: "One-Time",
    workloadHours: 7,
    internalCost: 180,
    margin: 70,
    prerequisites: [
      { name: "Competitor List Provided", status: "Required" },
    ],
    dependencies: [],
    taskTemplate: "Competitor Analysis Tasklist",
    taskCount: 8,
    activationRequirements: ["Top 5 Competitors Named"],
    financeStatus: "Approved",
    financeApprovedPrice: 600,
    financeApprovedWorkload: 7,
    financeApprovedCost: 180,
    financeMargin: 70,
  },
  {
    id: "li-027",
    name: "Email Marketing Setup",
    category: "Setup",
    department: "Strategy Department",
    description: "Email marketing platform setup, list segmentation, welcome sequence, and first campaign template.",
    unitPrice: 800,
    billingType: "One-Time",
    workloadHours: 8,
    internalCost: 240,
    margin: 70,
    prerequisites: [
      { name: "Email Platform Access", status: "Required" },
      { name: "Contact List", status: "Required" },
    ],
    dependencies: [],
    taskTemplate: "Email Setup Tasklist",
    taskCount: 10,
    activationRequirements: ["Platform Account Created", "List Uploaded"],
    financeStatus: "Pending Review",
    financeApprovedPrice: 800,
    financeApprovedWorkload: 8,
    financeApprovedCost: 240,
    financeMargin: 70,
  },
  {
    id: "li-028",
    name: "Video Ad Production",
    category: "Creative",
    department: "Creative Department",
    description: "Short-form video ad production for YouTube, Meta, or TikTok with scripting, editing, and delivery.",
    unitPrice: 1500,
    billingType: "One-Time",
    workloadHours: 15,
    internalCost: 600,
    margin: 60,
    prerequisites: [
      { name: "Brand Guidelines", status: "Required" },
      { name: "Script/Concept Approved", status: "Required" },
    ],
    dependencies: [],
    taskTemplate: "Video Production Tasklist",
    taskCount: 12,
    activationRequirements: ["Script Approved", "Raw Footage or Stock Assets Ready"],
    financeStatus: "Approved",
    financeApprovedPrice: 1500,
    financeApprovedWorkload: 15,
    financeApprovedCost: 600,
    financeMargin: 60,
  },
  {
    id: "li-029",
    name: "Local SEO Maintenance (Monthly)",
    category: "Maintenance",
    department: "SEO Department",
    description: "Monthly local SEO maintenance: citation audits, GBP updates, local link building, and local ranking reports.",
    unitPrice: 400,
    billingType: "Monthly Recurring",
    workloadHours: 4,
    internalCost: 120,
    margin: 70,
    prerequisites: [
      { name: "SEO Setup Completed", status: "Required" },
      { name: "GBP Access", status: "Required" },
    ],
    dependencies: ["SEO Setup & Onboarding", "GBP Optimization"],
    taskTemplate: "Local SEO Maintenance Tasklist",
    taskCount: 8,
    activationRequirements: ["SEO Baseline Report Done", "GBP Optimized"],
    financeStatus: "Approved",
    financeApprovedPrice: 400,
    financeApprovedWorkload: 4,
    financeApprovedCost: 120,
    financeMargin: 70,
  },
  {
    id: "li-030",
    name: "Quarterly Business Review",
    category: "Consulting",
    department: "Strategy Department",
    description: "Quarterly strategic review: performance deep-dive, goal reassessment, channel reallocation, and Q-plan.",
    unitPrice: 500,
    billingType: "Quarterly",
    workloadHours: 5,
    internalCost: 150,
    margin: 70,
    prerequisites: [
      { name: "All Service Reports", status: "Required" },
      { name: "KPI Dashboard", status: "Required" },
    ],
    dependencies: ["Monthly Reporting Package"],
    taskTemplate: "QBR Tasklist",
    taskCount: 6,
    activationRequirements: ["Reports Compiled", "QBR Deck Template Filled"],
    financeStatus: "Approved",
    financeApprovedPrice: 500,
    financeApprovedWorkload: 5,
    financeApprovedCost: 150,
    financeMargin: 70,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Contract Term Helpers
// ─────────────────────────────────────────────────────────────────────────────

function termToMonths(term: ContractTerm, custom?: number): number {
  if (term === "Month-to-Month") return 1;
  if (term === "3 Months") return 3;
  if (term === "6 Months") return 6;
  if (term === "12 Months") return 12;
  if (term === "24 Months") return 24;
  if (term === "36 Months") return 36;
  if (term === "Custom") return custom ?? 12;
  return 12;
}

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function subtractDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - days);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Proposals — 8 Proposals
// ─────────────────────────────────────────────────────────────────────────────

function buildProposalLineItem(id: string, qty = 1, discount = 0): ProposalLineItem {
  const item = LINE_ITEM_CATALOG.find((li) => li.id === id)!;
  const subtotal = item.unitPrice * qty * (1 - discount / 100);
  return { ...item, quantity: qty, customDiscount: discount, subtotal, note: "" };
}

const MOCK_PROPOSALS: Proposal[] = [
  {
    id: "prop-001",
    name: "Summit Landscaping — SEO + GBP Package",
    client: "Summit Landscaping",
    salesRep: "Jordan M.",
    stage: "Negotiation",
    clientBudget: 2000,
    budgetType: "Monthly Budget",
    lineItems: [
      buildProposalLineItem("li-001"),
      buildProposalLineItem("li-002"),
      buildProposalLineItem("li-003"),
      buildProposalLineItem("li-012"),
      buildProposalLineItem("li-018"),
    ],
    promoCode: "",
    discountType: "Percentage",
    discountAmount: 0,
    auditFindings: { seoIssues: "14 technical issues", gbpIssues: "Low activity score", competitorGap: "3 major competitors outranking" },
    notes: "Client wants to reduce setup fee. Considering $500 reduction.",
    createdDate: "May 24, 2025",
    lastActivity: "Jun 8, 2025",
  },
  {
    id: "prop-002",
    name: "Metro Dental — Full Service Package",
    client: "Metro Dental Group",
    salesRep: "Jordan M.",
    stage: "Approved",
    clientBudget: 5000,
    budgetType: "Monthly Budget",
    lineItems: [
      buildProposalLineItem("li-001"),
      buildProposalLineItem("li-002"),
      buildProposalLineItem("li-003"),
      buildProposalLineItem("li-009"),
      buildProposalLineItem("li-010"),
      buildProposalLineItem("li-012"),
      buildProposalLineItem("li-015"),
      buildProposalLineItem("li-018"),
    ],
    promoCode: "DENTAL10",
    discountType: "Percentage",
    discountAmount: 10,
    auditFindings: { seoIssues: "Poor GBP score", gbpIssues: "Yelp filtered reviews", reportingNeeds: "No tracking in place" },
    notes: "Client signed off on full package.",
    createdDate: "May 18, 2025",
    lastActivity: "Jun 6, 2025",
  },
  {
    id: "prop-003",
    name: "Sunstate Solar — PPC + Landing Page",
    client: "Sunstate Solar",
    salesRep: "Sarah K.",
    stage: "Sent",
    clientBudget: 4000,
    budgetType: "Monthly Budget",
    lineItems: [
      buildProposalLineItem("li-005"),
      buildProposalLineItem("li-006"),
      buildProposalLineItem("li-013"),
      buildProposalLineItem("li-012"),
      buildProposalLineItem("li-018"),
    ],
    promoCode: "",
    discountType: "Fixed Amount",
    discountAmount: 0,
    auditFindings: { ppcOpportunity: "Broad match overspend detected", websiteIssues: "No dedicated landing page" },
    notes: "",
    createdDate: "May 30, 2025",
    lastActivity: "Jun 7, 2025",
  },
  {
    id: "prop-004",
    name: "Coastal Wellness — SEO + GBP + PPC",
    client: "Coastal Wellness Spa",
    salesRep: "Sarah K.",
    stage: "Pushed to Handoff",
    clientBudget: 4500,
    budgetType: "Monthly Budget",
    lineItems: [
      buildProposalLineItem("li-001"),
      buildProposalLineItem("li-002"),
      buildProposalLineItem("li-003"),
      buildProposalLineItem("li-005"),
      buildProposalLineItem("li-006"),
      buildProposalLineItem("li-012"),
      buildProposalLineItem("li-015"),
    ],
    promoCode: "",
    discountType: "Package Discount",
    discountAmount: 0,
    auditFindings: { seoIssues: "Strong organic foundation", ppcOpportunity: "Gaps in paid channel" },
    notes: "Quick close — no objections.",
    createdDate: "May 7, 2025",
    lastActivity: "Jun 1, 2025",
  },
  {
    id: "prop-005",
    name: "Blue Ridge Plumbing — LSA Starter",
    client: "Blue Ridge Plumbing",
    salesRep: "Sarah K.",
    stage: "Draft",
    clientBudget: 1500,
    budgetType: "Monthly Budget",
    lineItems: [
      buildProposalLineItem("li-004"),
      buildProposalLineItem("li-009"),
      buildProposalLineItem("li-010"),
      buildProposalLineItem("li-012"),
    ],
    promoCode: "",
    discountType: "Fixed Amount",
    discountAmount: 200,
    auditFindings: { gbpIssues: "LSA not set up, service area gaps" },
    notes: "",
    createdDate: "Jun 7, 2025",
    lastActivity: "Jun 8, 2025",
  },
  {
    id: "prop-006",
    name: "Ridgeline Dentistry — Reporting Only",
    client: "Ridgeline Dentistry",
    salesRep: "Mike T.",
    stage: "Internal Review",
    clientBudget: 800,
    budgetType: "Monthly Budget",
    lineItems: [
      buildProposalLineItem("li-011"),
      buildProposalLineItem("li-012"),
    ],
    promoCode: "",
    discountType: "Percentage",
    discountAmount: 0,
    auditFindings: { reportingNeeds: "No unified dashboard, data in silos" },
    notes: "Client just wants centralized reporting to start.",
    createdDate: "Jun 5, 2025",
    lastActivity: "Jun 9, 2025",
  },
  {
    id: "prop-007",
    name: "Iron Mark Fitness — Discounted Package",
    client: "Iron Mark Fitness",
    salesRep: "Mike T.",
    stage: "Approved",
    clientBudget: 2500,
    budgetType: "Monthly Budget",
    lineItems: [
      buildProposalLineItem("li-007", 1, 15),
      buildProposalLineItem("li-008", 1, 15),
      buildProposalLineItem("li-015", 1, 10),
      buildProposalLineItem("li-012"),
    ],
    promoCode: "FITNESSLAUNCH",
    discountType: "Package Discount",
    discountAmount: 15,
    auditFindings: { metaOpportunity: "No retargeting strategy, creative fatigue detected" },
    notes: "Applied launch promo for new client.",
    createdDate: "May 18, 2025",
    lastActivity: "Jun 5, 2025",
  },
  {
    id: "prop-008",
    name: "Harbor Auto Group — Missing Prerequisites",
    client: "Harbor Auto Group",
    salesRep: "Mike T.",
    stage: "Draft",
    clientBudget: 6000,
    budgetType: "Monthly Budget",
    lineItems: [
      buildProposalLineItem("li-001"),
      buildProposalLineItem("li-002"),
      buildProposalLineItem("li-005"),
      buildProposalLineItem("li-006"),
      buildProposalLineItem("li-013"),
      buildProposalLineItem("li-025"),
      buildProposalLineItem("li-012"),
      buildProposalLineItem("li-018"),
    ],
    promoCode: "",
    discountType: "Percentage",
    discountAmount: 0,
    auditFindings: { websiteIssues: "Website 7 years old", ppcOpportunity: "Google Ads wasteful broad match", seoIssues: "No technical SEO done" },
    notes: "Website access and Ads access not yet confirmed — prerequisites missing.",
    createdDate: "Jun 6, 2025",
    lastActivity: "Jun 9, 2025",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Mock Contracts — varied types
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_CONTRACTS: ContractData[] = [
  {
    id: "con-001",
    name: "Metro Dental — 12-Month Full Service",
    client: "Metro Dental Group",
    contractNumber: "RTM-2025-001",
    contractVersion: "v1.0",
    contractOwner: "Jordan M.",
    status: "Signed",
    term: "12 Months",
    startDate: "Jul 1, 2025",
    endDate: "Jun 30, 2026",
    renewalDate: "Jun 1, 2026",
    autoRenewal: true,
    createdDate: "Jun 6, 2025",
    setupLineItems: [
      buildProposalLineItem("li-001"),
      buildProposalLineItem("li-009"),
      buildProposalLineItem("li-018"),
    ],
    recurringLineItems: [
      buildProposalLineItem("li-002"),
      buildProposalLineItem("li-003"),
      buildProposalLineItem("li-010"),
      buildProposalLineItem("li-012"),
      buildProposalLineItem("li-015"),
    ],
    discountType: "Percentage",
    discountAmount: 10,
    promoCode: "DENTAL10",
    promoApprovalStatus: "Approved",
    signatureStatus: "Signed",
    sentDate: "Jun 7, 2025",
    viewedDate: "Jun 8, 2025",
    signedDate: "Jun 9, 2025",
    signer: "Dr. Amanda Torres",
    expirationDate: "Jun 16, 2025",
    billingFrequency: "Monthly",
    firstInvoiceDate: "Jul 1, 2025",
    salesRep: "Jordan M.",
    proposalId: "prop-002",
  },
  {
    id: "con-002",
    name: "Coastal Wellness — 6-Month SEO + PPC",
    client: "Coastal Wellness Spa",
    contractNumber: "RTM-2025-002",
    contractVersion: "v1.0",
    contractOwner: "Sarah K.",
    status: "Pending Signature",
    term: "6 Months",
    startDate: "Jul 1, 2025",
    endDate: "Dec 31, 2025",
    renewalDate: "Dec 1, 2025",
    autoRenewal: false,
    createdDate: "Jun 1, 2025",
    setupLineItems: [
      buildProposalLineItem("li-001"),
      buildProposalLineItem("li-005"),
    ],
    recurringLineItems: [
      buildProposalLineItem("li-002"),
      buildProposalLineItem("li-003"),
      buildProposalLineItem("li-006"),
      buildProposalLineItem("li-012"),
      buildProposalLineItem("li-015"),
    ],
    discountType: "Package Discount",
    discountAmount: 0,
    promoCode: "",
    promoApprovalStatus: "Approved",
    signatureStatus: "Sent For Signature",
    sentDate: "Jun 2, 2025",
    viewedDate: "Jun 3, 2025",
    signedDate: "",
    signer: "Maria Chen",
    expirationDate: "Jun 17, 2025",
    billingFrequency: "Monthly",
    firstInvoiceDate: "Jul 1, 2025",
    salesRep: "Sarah K.",
    proposalId: "prop-004",
  },
  {
    id: "con-003",
    name: "Iron Mark Fitness — Month-to-Month Promo",
    client: "Iron Mark Fitness",
    contractNumber: "RTM-2025-003",
    contractVersion: "v2.1",
    contractOwner: "Mike T.",
    status: "Pending Internal Approval",
    term: "Month-to-Month",
    startDate: "Jul 1, 2025",
    endDate: "Jul 31, 2025",
    renewalDate: "Jul 1, 2025",
    autoRenewal: true,
    createdDate: "Jun 5, 2025",
    setupLineItems: [
      buildProposalLineItem("li-007", 1, 15),
    ],
    recurringLineItems: [
      buildProposalLineItem("li-008", 1, 15),
      buildProposalLineItem("li-015", 1, 10),
      buildProposalLineItem("li-012"),
    ],
    discountType: "Package Discount",
    discountAmount: 15,
    promoCode: "FITNESSLAUNCH",
    promoApprovalStatus: "Pending Approval",
    signatureStatus: "Draft",
    sentDate: "",
    viewedDate: "",
    signedDate: "",
    signer: "Jake Morris",
    expirationDate: "Jun 20, 2025",
    billingFrequency: "Monthly",
    firstInvoiceDate: "Jul 1, 2025",
    salesRep: "Mike T.",
    proposalId: "prop-007",
  },
  {
    id: "con-004",
    name: "Summit Landscaping — 24-Month Local Package",
    client: "Summit Landscaping",
    contractNumber: "RTM-2025-004",
    contractVersion: "v1.0",
    contractOwner: "Jordan M.",
    status: "Draft",
    term: "24 Months",
    startDate: "Aug 1, 2025",
    endDate: "Jul 31, 2027",
    renewalDate: "Jun 1, 2027",
    autoRenewal: false,
    createdDate: "Jun 8, 2025",
    setupLineItems: [
      buildProposalLineItem("li-001"),
      buildProposalLineItem("li-018"),
    ],
    recurringLineItems: [
      buildProposalLineItem("li-002"),
      buildProposalLineItem("li-003"),
      buildProposalLineItem("li-012"),
    ],
    discountType: "Percentage",
    discountAmount: 0,
    promoCode: "",
    promoApprovalStatus: "Approved",
    signatureStatus: "Draft",
    sentDate: "",
    viewedDate: "",
    signedDate: "",
    signer: "Tom Bradley",
    expirationDate: "",
    billingFrequency: "Monthly",
    firstInvoiceDate: "Aug 1, 2025",
    salesRep: "Jordan M.",
    proposalId: "prop-001",
  },
  {
    id: "con-005",
    name: "Blue Ridge Plumbing — Setup-Only Contract",
    client: "Blue Ridge Plumbing",
    contractNumber: "RTM-2025-005",
    contractVersion: "v1.0",
    contractOwner: "Sarah K.",
    status: "Pending Client Approval",
    term: "Month-to-Month",
    startDate: "Jul 1, 2025",
    endDate: "Jul 31, 2025",
    renewalDate: "Jul 1, 2025",
    autoRenewal: false,
    createdDate: "Jun 8, 2025",
    setupLineItems: [
      buildProposalLineItem("li-004"),
      buildProposalLineItem("li-009"),
    ],
    recurringLineItems: [],
    discountType: "Fixed Amount",
    discountAmount: 200,
    promoCode: "",
    promoApprovalStatus: "Approved",
    signatureStatus: "Ready For Signature",
    sentDate: "",
    viewedDate: "",
    signedDate: "",
    signer: "Kevin Park",
    expirationDate: "Jun 22, 2025",
    billingFrequency: "One-Time",
    firstInvoiceDate: "Jul 1, 2025",
    salesRep: "Sarah K.",
    proposalId: "prop-005",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  "SEO", "GBP", "PPC", "Meta Ads", "LSA", "Reporting",
  "Web", "Creative", "Strategy", "Consulting", "Setup", "Maintenance",
];

const BILLING_TYPES: BillingType[] = ["One-Time", "Monthly Recurring", "Quarterly", "Annual"];

const FINANCE_STATUSES: FinanceStatus[] = ["Approved", "Pending Review", "Needs Pricing", "Inactive"];

const CONTRACT_TERMS: ContractTerm[] = [
  "Month-to-Month", "3 Months", "6 Months", "12 Months", "24 Months", "36 Months", "Custom",
];

const CATEGORY_COLORS: Record<Category, { bg: string; text: string; border: string }> = {
  SEO:         { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  GBP:         { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  PPC:         { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  "Meta Ads":  { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE" },
  LSA:         { bg: "#ECFDF5", text: "#047857", border: "#A7F3D0" },
  Reporting:   { bg: "#F0F9FF", text: "#0369A1", border: "#BAE6FD" },
  Web:         { bg: "#FEFCE8", text: "#A16207", border: "#FDE68A" },
  Creative:    { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
  Strategy:    { bg: "#F3F4F6", text: "#374151", border: "#D1D5DB" },
  Consulting:  { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A" },
  Setup:       { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" },
  Maintenance: { bg: "#F8FAFC", text: "#475569", border: "#CBD5E1" },
};

const STAGE_COLORS: Record<ProposalStage, { bg: string; text: string; border: string }> = {
  "Draft":             { bg: "#F3F4F6", text: "#6B7280", border: "#D1D5DB" },
  "Internal Review":   { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  "Ready to Send":     { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  "Sent":              { bg: "#F0F9FF", text: "#0369A1", border: "#BAE6FD" },
  "Viewed":            { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE" },
  "Negotiation":       { bg: "#FEFCE8", text: "#A16207", border: "#FDE68A" },
  "Approved":          { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  "Rejected":          { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
  "Pushed to Handoff": { bg: "#ECFDF5", text: "#047857", border: "#A7F3D0" },
};

const CONTRACT_STATUS_COLORS: Record<ContractStatus, { bg: string; text: string; border: string }> = {
  "Draft":                    { bg: "#F3F4F6", text: "#6B7280", border: "#D1D5DB" },
  "Pending Internal Approval": { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  "Pending Client Approval":  { bg: "#F0F9FF", text: "#0369A1", border: "#BAE6FD" },
  "Pending Signature":        { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE" },
  "Signed":                   { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  "Rejected":                 { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
  "Expired":                  { bg: "#F3F4F6", text: "#9CA3AF", border: "#D1D5DB" },
  "Cancelled":                { bg: "#FEF2F2", text: "#991B1B", border: "#FECACA" },
};

const SIGNATURE_STATUS_COLORS: Record<SignatureStatus, { bg: string; text: string; border: string }> = {
  "Draft":               { bg: "#F3F4F6", text: "#6B7280", border: "#D1D5DB" },
  "Ready For Signature": { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  "Sent For Signature":  { bg: "#F0F9FF", text: "#0369A1", border: "#BAE6FD" },
  "Viewed":              { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE" },
  "Signed":              { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  "Rejected":            { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
  "Expired":             { bg: "#F3F4F6", text: "#9CA3AF", border: "#D1D5DB" },
};

const DEPT_ACTIVATION_COLORS: Record<DepartmentActivationStatus, { bg: string; text: string; border: string }> = {
  Pending:   { bg: "#F3F4F6", text: "#6B7280", border: "#D1D5DB" },
  Ready:     { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  Activated: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  Blocked:   { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
};

const DEP_STATUS_COLORS: Record<DependencyStatus, { bg: string; text: string }> = {
  Required:  { bg: "#FFF7ED", text: "#C2410C" },
  Missing:   { bg: "#FFF1F2", text: "#BE123C" },
  Satisfied: { bg: "#F0FDF4", text: "#15803D" },
  Blocked:   { bg: "#F3F4F6", text: "#6B7280" },
};

const FINANCE_STATUS_COLORS: Record<FinanceStatus, { bg: string; text: string; border: string }> = {
  Approved:       { bg: "#F0FDF4", text: "#15803D", border: "#A7F3D0" },
  "Pending Review": { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  "Needs Pricing":  { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
  Inactive:       { bg: "#F3F4F6", text: "#6B7280", border: "#D1D5DB" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const fmtUSD = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `$${n.toFixed(0)}`;

const fmtFull = (n: number) => `$${Math.round(n).toLocaleString()}`;

function Badge({ label, bg, text, border }: { label: string; bg: string; text: string; border?: string }) {
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap"
      style={{ background: bg, color: text, borderColor: border ?? "transparent" }}>
      {label}
    </span>
  );
}

function StageBadge({ stage }: { stage: ProposalStage }) {
  const c = STAGE_COLORS[stage];
  return <Badge label={stage} bg={c.bg} text={c.text} border={c.border} />;
}

function CategoryBadge({ category }: { category: Category }) {
  const c = CATEGORY_COLORS[category];
  return <Badge label={category} bg={c.bg} text={c.text} border={c.border} />;
}

function ContractStatusBadge({ status }: { status: ContractStatus }) {
  const c = CONTRACT_STATUS_COLORS[status];
  return <Badge label={status} bg={c.bg} text={c.text} border={c.border} />;
}

function SignatureStatusBadge({ status }: { status: SignatureStatus }) {
  const c = SIGNATURE_STATUS_COLORS[status];
  return <Badge label={status} bg={c.bg} text={c.text} border={c.border} />;
}

function FinanceStatusBadge({ status }: { status: FinanceStatus }) {
  const c = FINANCE_STATUS_COLORS[status];
  return <Badge label={`🔒 ${status}`} bg={c.bg} text={c.text} border={c.border} />;
}

function DepStatusBadge({ status }: { status: DependencyStatus }) {
  const c = DEP_STATUS_COLORS[status];
  return <Badge label={status} bg={c.bg} text={c.text} />;
}

function SectionCard({ title, children, accent }: { title: string; children: React.ReactNode; accent?: string }) {
  return (
    <div className="rounded-xl border" style={{ background: "var(--rtm-surface)", borderColor: accent ?? "var(--rtm-border)" }}>
      <div className="px-5 py-3 border-b" style={{ borderColor: accent ?? "var(--rtm-border-light)" }}>
        <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>{title}</p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Proposal Totals Calculator
// ─────────────────────────────────────────────────────────────────────────────

function calcProposalTotals(lineItems: ProposalLineItem[], discountType: DiscountType, discountAmount: number) {
  let setupFees = 0;
  let monthlyRecurring = 0;
  let quarterlyTotal = 0;
  let annualTotal = 0;
  let totalWorkload = 0;
  let totalInternalCost = 0;
  let rawSubtotal = 0;

  for (const li of lineItems) {
    const base = li.unitPrice * li.quantity * (1 - li.customDiscount / 100);
    rawSubtotal += base;
    totalWorkload += li.workloadHours * li.quantity;
    totalInternalCost += li.internalCost * li.quantity;

    if (li.billingType === "One-Time") setupFees += base;
    else if (li.billingType === "Monthly Recurring") monthlyRecurring += base;
    else if (li.billingType === "Quarterly") quarterlyTotal += base;
    else if (li.billingType === "Annual") annualTotal += base;
  }

  let discountValue = 0;
  if (discountType === "Percentage") discountValue = rawSubtotal * (discountAmount / 100);
  else if (discountType === "Fixed Amount") discountValue = discountAmount;
  else if (discountType === "Package Discount") discountValue = rawSubtotal * (discountAmount / 100);
  else discountValue = discountAmount;

  const finalQuote = rawSubtotal - discountValue;
  const estimatedMargin = finalQuote > 0 ? ((finalQuote - totalInternalCost) / finalQuote) * 100 : 0;

  return { setupFees, monthlyRecurring, quarterlyTotal, annualTotal, rawSubtotal, discountValue, finalQuote, totalWorkload, totalInternalCost, estimatedMargin };
}

function calcContractTotals(contract: ContractData) {
  const allSetup = contract.setupLineItems.reduce((s, li) => s + li.unitPrice * li.quantity * (1 - li.customDiscount / 100), 0);
  const allRecurring = contract.recurringLineItems.reduce((s, li) => s + li.unitPrice * li.quantity * (1 - li.customDiscount / 100), 0);
  const months = termToMonths(contract.term, contract.customTermMonths);

  let discountValue = 0;
  const rawTotal = allSetup + allRecurring * months;
  if (contract.discountType === "Percentage") discountValue = rawTotal * (contract.discountAmount / 100);
  else if (contract.discountType === "Fixed Amount") discountValue = contract.discountAmount;
  else if (contract.discountType === "Package Discount") discountValue = rawTotal * (contract.discountAmount / 100);

  const totalContractValue = rawTotal - discountValue;
  const totalInternalCost = [
    ...contract.setupLineItems,
    ...contract.recurringLineItems,
  ].reduce((s, li) => s + li.internalCost * li.quantity, 0);

  return { setupTotal: allSetup, monthlyRecurring: allRecurring, months, rawTotal, discountValue, totalContractValue, totalInternalCost };
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI Cards
// ─────────────────────────────────────────────────────────────────────────────

function KpiCards() {
  const totalLineItems = LINE_ITEM_CATALOG.length;
  const approved = LINE_ITEM_CATALOG.filter((li) => li.financeStatus === "Approved").length;
  const draftCount = MOCK_PROPOSALS.filter((p) => p.stage === "Draft").length;
  const approvedProposals = MOCK_PROPOSALS.filter((p) => p.stage === "Approved" || p.stage === "Pushed to Handoff").length;
  const signedContracts = MOCK_CONTRACTS.filter((c) => c.status === "Signed").length;

  const totalMRR = MOCK_PROPOSALS.filter((p) => p.stage !== "Rejected").reduce((sum, p) => {
    return sum + p.lineItems.filter((li) => li.billingType === "Monthly Recurring").reduce((s, li) => s + li.unitPrice * li.quantity, 0);
  }, 0);

  const cards = [
    { label: "Line Items Available", value: totalLineItems, icon: "📦", color: "#1D4ED8", bg: "#EFF6FF" },
    { label: "Finance Approved", value: approved, icon: "✅", color: "#15803D", bg: "#F0FDF4" },
    { label: "Draft Proposals", value: draftCount, icon: "📝", color: "#6B7280", bg: "#F3F4F6" },
    { label: "Approved & Closed", value: approvedProposals, icon: "🎯", color: "#047857", bg: "#ECFDF5" },
    { label: "Signed Contracts", value: signedContracts, icon: "✍️", color: "#7C3AED", bg: "#F5F3FF" },
    { label: "Pipeline MRR", value: fmtUSD(totalMRR), icon: "💰", color: "#C2410C", bg: "#FFF7ED" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border p-4 text-center"
          style={{ background: c.bg, borderColor: `${c.color}20` }}>
          <div className="text-xl mb-1">{c.icon}</div>
          <div className="text-xl font-black" style={{ color: c.color }}>{c.value}</div>
          <div className="text-[10px] font-semibold mt-0.5 leading-tight" style={{ color: c.color }}>{c.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Workflow Stepper — Proposal → Contract → Billing
// ─────────────────────────────────────────────────────────────────────────────

function WorkflowStepper({ currentStep }: { currentStep?: number }) {
  const steps = [
    { label: "Audit", icon: "🔍" },
    { label: "Proposal Builder", icon: "📋" },
    { label: "Internal Approval", icon: "🔄" },
    { label: "Client Approval", icon: "🤝" },
    { label: "Contract Generation", icon: "📄" },
    { label: "Signature", icon: "✍️" },
    { label: "Billing", icon: "💳" },
    { label: "Activation", icon: "🚀" },
    { label: "Account Management", icon: "👥" },
  ];

  const active = currentStep ?? 4;

  return (
    <div className="rounded-xl border p-4 overflow-x-auto" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--rtm-text-muted)" }}>
        Sales → Contract → Activation Workflow
      </p>
      <div className="flex items-center gap-0 min-w-max">
        {steps.map((s, i) => {
          const done = i < active;
          const current = i === active;
          return (
            <React.Fragment key={s.label}>
              <div className="flex flex-col items-center gap-1">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm border-2 transition-all"
                  style={{
                    background: done ? "#F0FDF4" : current ? "#EFF6FF" : "var(--rtm-bg)",
                    borderColor: done ? "#059669" : current ? "#1D4ED8" : "var(--rtm-border)",
                  }}>
                  <span>{s.icon}</span>
                </div>
                <span className="text-[9px] font-semibold text-center max-w-[60px] leading-tight"
                  style={{ color: done ? "#059669" : current ? "#1D4ED8" : "var(--rtm-text-muted)" }}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="w-8 h-0.5 mb-4 flex-shrink-0"
                  style={{ background: i < active ? "#059669" : "var(--rtm-border)" }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Contract Generator — Header Info Panel
// ─────────────────────────────────────────────────────────────────────────────

function ContractInfoPanel({ contract }: { contract: ContractData }) {
  const infoRows = [
    { label: "Contract Number", value: contract.contractNumber },
    { label: "Contract Version", value: contract.contractVersion },
    { label: "Contract Owner", value: contract.contractOwner },
    { label: "Created Date", value: contract.createdDate },
    { label: "Start Date", value: contract.startDate },
    { label: "End Date", value: contract.endDate },
    { label: "Renewal Date", value: contract.renewalDate },
    { label: "Auto Renewal", value: contract.autoRenewal ? "✅ Enabled" : "❌ Disabled" },
    { label: "Contract Term", value: contract.term },
    { label: "Billing Frequency", value: contract.billingFrequency },
    { label: "First Invoice Date", value: contract.firstInvoiceDate },
    { label: "Signer", value: contract.signer },
    { label: "Sales Rep", value: contract.salesRep },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {infoRows.map((r) => (
        <div key={r.label} className="rounded-lg border p-3"
          style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}>
          <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{r.label}</p>
          <p className="text-xs font-semibold mt-0.5" style={{ color: "var(--rtm-text-primary)" }}>{r.value || "—"}</p>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Contract Term Selector
// ─────────────────────────────────────────────────────────────────────────────

function ContractTermSelector({
  term,
  customMonths,
  startDate,
  onTermChange,
  onCustomMonthsChange,
  onStartDateChange,
}: {
  term: ContractTerm;
  customMonths: number;
  startDate: string;
  onTermChange: (t: ContractTerm) => void;
  onCustomMonthsChange: (n: number) => void;
  onStartDateChange: (d: string) => void;
}) {
  const months = termToMonths(term, customMonths);
  const endDate = addMonths(startDate, months);
  const renewalDate = subtractDays(endDate, 30);

  return (
    <SectionCard title="📅 Contract Term Management">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wide block mb-2" style={{ color: "var(--rtm-text-muted)" }}>Contract Term</label>
            <div className="flex flex-wrap gap-2">
              {CONTRACT_TERMS.map((t) => (
                <button key={t} onClick={() => onTermChange(t)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all"
                  style={{
                    background: term === t ? "#EFF6FF" : "var(--rtm-surface)",
                    color: term === t ? "#1D4ED8" : "var(--rtm-text-secondary)",
                    borderColor: term === t ? "#BFDBFE" : "var(--rtm-border)",
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {term === "Custom" && (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>Custom Term (Months)</label>
              <input type="number" min={1} max={120} value={customMonths}
                onChange={(e) => onCustomMonthsChange(Math.max(1, parseInt(e.target.value) || 1))}
                className="text-xs rounded-lg border px-3 py-1.5 focus:outline-none w-28"
                style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }} />
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>Contract Start Date</label>
            <input type="date" value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="text-xs rounded-lg border px-3 py-1.5 focus:outline-none"
              style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }} />
          </div>
        </div>

        <div className="space-y-3">
          {[
            { label: "Term Length", value: `${months} month${months !== 1 ? "s" : ""}`, icon: "📏", color: "#1D4ED8", bg: "#EFF6FF" },
            { label: "Contract Start", value: new Date(startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), icon: "🗓️", color: "#15803D", bg: "#F0FDF4" },
            { label: "Contract End", value: endDate, icon: "🏁", color: "#C2410C", bg: "#FFF7ED" },
            { label: "Renewal Date", value: renewalDate, icon: "🔄", color: "#7C3AED", bg: "#F5F3FF" },
          ].map((r) => (
            <div key={r.label} className="flex items-center justify-between rounded-lg border px-4 py-2.5"
              style={{ background: r.bg, borderColor: `${r.color}30` }}>
              <div className="flex items-center gap-2">
                <span>{r.icon}</span>
                <span className="text-xs font-semibold" style={{ color: r.color }}>{r.label}</span>
              </div>
              <span className="text-xs font-bold" style={{ color: r.color }}>{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Setup Fees Section
// ─────────────────────────────────────────────────────────────────────────────

function SetupFeesSection({ items }: { items: ProposalLineItem[] }) {
  const setupTotal = items.reduce((s, li) => s + li.unitPrice * li.quantity * (1 - li.customDiscount / 100), 0);

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#FED7AA" }}>
      <div className="px-4 py-3 flex items-center justify-between" style={{ background: "#FFF7ED", borderBottom: "1px solid #FED7AA" }}>
        <p className="text-sm font-bold" style={{ color: "#C2410C" }}>🔧 Setup Fees</p>
        <span className="text-sm font-black" style={{ color: "#C2410C" }}>{fmtFull(setupTotal)}</span>
      </div>
      {items.length === 0 ? (
        <div className="px-4 py-4 text-center">
          <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>No setup fees added.</p>
        </div>
      ) : (
        <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border-light)" }}>
              {["Line Item", "Qty", "Unit Price", "Discount", "Subtotal"].map((h) => (
                <th key={h} className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
                  style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((li, i) => {
              const sub = li.unitPrice * li.quantity * (1 - li.customDiscount / 100);
              return (
                <tr key={li.id} style={{ borderBottom: "1px solid var(--rtm-border-light)", background: i % 2 === 0 ? "var(--rtm-bg)" : "var(--rtm-surface)" }}>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <CategoryBadge category={li.category} />
                      <span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{li.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center" style={{ color: "var(--rtm-text-secondary)" }}>{li.quantity}</td>
                  <td className="px-3 py-2 font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{fmtFull(li.unitPrice)}</td>
                  <td className="px-3 py-2" style={{ color: "#DC2626" }}>{li.customDiscount > 0 ? `${li.customDiscount}%` : "—"}</td>
                  <td className="px-3 py-2 font-bold" style={{ color: "#C2410C" }}>{fmtFull(sub)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: "#FFF7ED", borderTop: "2px solid #FED7AA" }}>
              <td colSpan={4} className="px-3 py-2.5 text-xs font-bold" style={{ color: "#C2410C" }}>Setup Total</td>
              <td className="px-3 py-2.5 text-sm font-black" style={{ color: "#C2410C" }}>{fmtFull(setupTotal)}</td>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Recurring Fees Section
// ─────────────────────────────────────────────────────────────────────────────

function RecurringFeesSection({ items }: { items: ProposalLineItem[] }) {
  const recurringTotal = items.reduce((s, li) => s + li.unitPrice * li.quantity * (1 - li.customDiscount / 100), 0);

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#BFDBFE" }}>
      <div className="px-4 py-3 flex items-center justify-between" style={{ background: "#EFF6FF", borderBottom: "1px solid #BFDBFE" }}>
        <p className="text-sm font-bold" style={{ color: "#1D4ED8" }}>🔁 Recurring Services</p>
        <span className="text-sm font-black" style={{ color: "#1D4ED8" }}>{fmtFull(recurringTotal)}/mo</span>
      </div>
      {items.length === 0 ? (
        <div className="px-4 py-4 text-center">
          <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>No recurring services added.</p>
        </div>
      ) : (
        <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border-light)" }}>
              {["Line Item", "Qty", "Monthly Price", "Discount", "Subtotal"].map((h) => (
                <th key={h} className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
                  style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((li, i) => {
              const sub = li.unitPrice * li.quantity * (1 - li.customDiscount / 100);
              return (
                <tr key={li.id} style={{ borderBottom: "1px solid var(--rtm-border-light)", background: i % 2 === 0 ? "var(--rtm-bg)" : "var(--rtm-surface)" }}>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <CategoryBadge category={li.category} />
                      <span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{li.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center" style={{ color: "var(--rtm-text-secondary)" }}>{li.quantity}</td>
                  <td className="px-3 py-2 font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{fmtFull(li.unitPrice)}/mo</td>
                  <td className="px-3 py-2" style={{ color: "#DC2626" }}>{li.customDiscount > 0 ? `${li.customDiscount}%` : "—"}</td>
                  <td className="px-3 py-2 font-bold" style={{ color: "#1D4ED8" }}>{fmtFull(sub)}/mo</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: "#EFF6FF", borderTop: "2px solid #BFDBFE" }}>
              <td colSpan={4} className="px-3 py-2.5 text-xs font-bold" style={{ color: "#1D4ED8" }}>Monthly Recurring Total</td>
              <td className="px-3 py-2.5 text-sm font-black" style={{ color: "#1D4ED8" }}>{fmtFull(recurringTotal)}/mo</td>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Contract Value Calculator
// ─────────────────────────────────────────────────────────────────────────────

function ContractValueCalculator({ contract }: { contract: ContractData }) {
  const t = calcContractTotals(contract);
  const promoImpact = contract.promoCode ? t.rawTotal * 0.05 : 0;
  const finalMonthly = t.monthlyRecurring;
  const marginPct = t.totalContractValue > 0
    ? ((t.totalContractValue - t.totalInternalCost) / t.totalContractValue) * 100
    : 0;

  const rows = [
    { label: "Setup Fees Total", value: fmtFull(t.setupTotal), color: "#C2410C", bg: "#FFF7ED", border: "#FED7AA" },
    { label: "Monthly Recurring Total", value: `${fmtFull(t.monthlyRecurring)}/mo`, color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
    { label: "Contract Length", value: `${t.months} months`, color: "#6B7280", bg: "#F3F4F6", border: "#D1D5DB" },
    { label: "Discount Total", value: t.discountValue > 0 ? `-${fmtFull(t.discountValue)}` : "—", color: "#DC2626", bg: "#FFF1F2", border: "#FECDD3" },
    { label: "Promo Code Discount", value: promoImpact > 0 ? `-${fmtFull(promoImpact)}` : "—", color: "#92400E", bg: "#FFFBEB", border: "#FDE68A" },
    { label: "Final Monthly Value", value: fmtFull(finalMonthly), color: "#059669", bg: "#F0FDF4", border: "#A7F3D0" },
    { label: "Total Contract Value", value: fmtFull(t.totalContractValue), color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
    { label: "Contract Margin", value: `${marginPct.toFixed(1)}%`, color: marginPct >= 55 ? "#059669" : marginPct >= 45 ? "#D97706" : "#DC2626", bg: "#F0FDF4", border: "#A7F3D0" },
  ];

  return (
    <SectionCard title="💰 Contract Value Calculator">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {rows.map((r) => (
          <div key={r.label} className="rounded-xl border p-3 text-center"
            style={{ background: r.bg, borderColor: r.border }}>
            <p className="text-[10px] font-semibold" style={{ color: r.color }}>{r.label}</p>
            <p className="text-sm font-black mt-0.5" style={{ color: r.color }}>{r.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border p-3" style={{ background: "#F5F3FF", borderColor: "#DDD6FE" }}>
        <p className="text-[10px] font-bold mb-1" style={{ color: "#6D28D9" }}>Formula</p>
        <p className="text-xs" style={{ color: "#7C3AED" }}>
          {fmtFull(t.setupTotal)} (Setup) + ({fmtFull(t.monthlyRecurring)}/mo × {t.months} months) − {fmtFull(t.discountValue)} (Discounts) = <strong>{fmtFull(t.totalContractValue)}</strong>
        </p>
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Promo Code & Discount Impact
// ─────────────────────────────────────────────────────────────────────────────

function DiscountImpactSection({ contract }: { contract: ContractData }) {
  const t = calcContractTotals(contract);
  const marginImpact = t.totalContractValue > 0
    ? ((t.totalContractValue - t.totalInternalCost) / t.totalContractValue) * 100
    : 0;

  const approvalColors = {
    Approved: { bg: "#F0FDF4", text: "#15803D", border: "#A7F3D0" },
    "Pending Approval": { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
    Rejected: { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
  };
  const ac = approvalColors[contract.promoApprovalStatus];

  return (
    <SectionCard title="🏷️ Promo Code & Discount Impact">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          {[
            { label: "Promo Code", value: contract.promoCode || "None" },
            { label: "Discount Type", value: contract.discountType },
            { label: "Discount Value", value: contract.discountType === "Fixed Amount" ? fmtFull(contract.discountAmount) : `${contract.discountAmount}%` },
            { label: "Approval Required", value: contract.discountAmount > 20 ? "Yes — Finance Required" : "No" },
            { label: "Margin Impact", value: `${marginImpact.toFixed(1)}%` },
          ].map((r) => (
            <div key={r.label} className="flex items-center justify-between text-xs rounded-lg px-3 py-2 border"
              style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}>
              <span style={{ color: "var(--rtm-text-muted)" }}>{r.label}</span>
              <span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{r.value}</span>
            </div>
          ))}
          {contract.promoCode && (
            <div className="rounded-lg border px-3 py-2 flex items-center justify-between"
              style={{ background: ac.bg, borderColor: ac.border }}>
              <span className="text-xs font-semibold" style={{ color: ac.text }}>Promo Status</span>
              <Badge label={contract.promoApprovalStatus} bg={ac.bg} text={ac.text} border={ac.border} />
            </div>
          )}
        </div>
        <div className="space-y-3">
          {[
            { label: "Subtotal (Before Discount)", value: fmtFull(t.rawTotal), color: "var(--rtm-text-primary)" },
            { label: "Discount Applied", value: `-${fmtFull(t.discountValue)}`, color: "#DC2626" },
            { label: "Final Quote", value: fmtFull(t.totalContractValue), color: "#059669" },
            { label: "Internal Cost", value: fmtFull(t.totalInternalCost), color: "var(--rtm-text-muted)" },
            { label: "Final Margin", value: `${marginImpact.toFixed(1)}%`, color: marginImpact >= 55 ? "#059669" : marginImpact >= 45 ? "#D97706" : "#DC2626" },
          ].map((r) => (
            <div key={r.label} className="flex items-center justify-between text-xs rounded-lg px-3 py-2 border"
              style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}>
              <span style={{ color: "var(--rtm-text-muted)" }}>{r.label}</span>
              <span className="font-bold" style={{ color: r.color }}>{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Contract Services Summary
// ─────────────────────────────────────────────────────────────────────────────

function ContractServicesSummary({ contract }: { contract: ContractData }) {
  const allItems = [...contract.setupLineItems, ...contract.recurringLineItems];
  const cats = Array.from(new Set(allItems.map((li) => li.category)));
  const depts = Array.from(new Set(allItems.map((li) => li.department)));
  const templates = allItems.map((li) => li.taskTemplate);
  const totalTasks = allItems.reduce((s, li) => s + li.taskCount, 0);
  const totalHours = allItems.reduce((s, li) => s + li.workloadHours * li.quantity, 0);
  const totalRevenue = calcContractTotals(contract).totalContractValue;

  return (
    <SectionCard title="📊 Contract Services Summary">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>Services Included</p>
          <div className="flex flex-wrap gap-1.5">
            {cats.map((c) => <CategoryBadge key={c} category={c as Category} />)}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>Departments Activated</p>
          <div className="space-y-1">
            {depts.map((d) => (
              <div key={d} className="text-[11px] px-2 py-1 rounded" style={{ background: "#F0FDF4", color: "#15803D", border: "1px solid #A7F3D0" }}>
                ✅ {d}
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>Activation Summary</p>
          {[
            { label: "Task Templates", value: templates.length.toString(), color: "#6D28D9" },
            { label: "Total Tasks", value: `${totalTasks} tasks`, color: "#7C3AED" },
            { label: "Est. Workload", value: `${totalHours}h/mo`, color: "#1D4ED8" },
            { label: "Revenue Activated", value: fmtFull(totalRevenue), color: "#059669" },
          ].map((r) => (
            <div key={r.label} className="flex items-center justify-between text-xs rounded px-2 py-1.5 border"
              style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}>
              <span style={{ color: "var(--rtm-text-muted)" }}>{r.label}</span>
              <span className="font-bold" style={{ color: r.color }}>{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Signature Workflow
// ─────────────────────────────────────────────────────────────────────────────

function SignatureWorkflowSection({
  contract,
  onStatusChange,
}: {
  contract: ContractData;
  onStatusChange: (s: SignatureStatus) => void;
}) {
  const sigStatuses: SignatureStatus[] = [
    "Draft", "Ready For Signature", "Sent For Signature", "Viewed", "Signed", "Rejected", "Expired",
  ];

  const actions = [
    { label: "Generate Contract", icon: "📄", action: () => alert("[Mock] Contract PDF generated"), color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
    { label: "Send For Signature", icon: "📨", action: () => { onStatusChange("Sent For Signature"); alert("[Mock] Signature request sent"); }, color: "#0369A1", bg: "#F0F9FF", border: "#BAE6FD" },
    { label: "Mark Signed", icon: "✍️", action: () => { onStatusChange("Signed"); alert("[Mock] Contract marked as signed"); }, color: "#15803D", bg: "#F0FDF4", border: "#A7F3D0" },
    { label: "Mark Rejected", icon: "❌", action: () => { onStatusChange("Rejected"); alert("[Mock] Contract marked as rejected"); }, color: "#BE123C", bg: "#FFF1F2", border: "#FECDD3" },
    { label: "Regenerate Contract", icon: "🔄", action: () => alert("[Mock] Contract regenerated"), color: "#92400E", bg: "#FFFBEB", border: "#FDE68A" },
  ];

  const detailRows = [
    { label: "Sent Date", value: contract.sentDate || "—" },
    { label: "Viewed Date", value: contract.viewedDate || "—" },
    { label: "Signed Date", value: contract.signedDate || "—" },
    { label: "Signer", value: contract.signer },
    { label: "Expiration Date", value: contract.expirationDate || "—" },
  ];

  return (
    <SectionCard title="✍️ Signature Workflow">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>Signature Status</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {sigStatuses.map((s) => {
                const c = SIGNATURE_STATUS_COLORS[s];
                return (
                  <button key={s} onClick={() => onStatusChange(s)}
                    className="text-[10px] font-bold px-2 py-1 rounded-full border transition-all"
                    style={{
                      background: contract.signatureStatus === s ? c.bg : "var(--rtm-surface)",
                      color: contract.signatureStatus === s ? c.text : "var(--rtm-text-muted)",
                      borderColor: contract.signatureStatus === s ? c.border : "var(--rtm-border)",
                    }}>
                    {s}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <SignatureStatusBadge status={contract.signatureStatus} />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>Signature Details</p>
            <div className="space-y-1.5">
              {detailRows.map((r) => (
                <div key={r.label} className="flex items-center justify-between text-xs rounded px-2 py-1.5 border"
                  style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}>
                  <span style={{ color: "var(--rtm-text-muted)" }}>{r.label}</span>
                  <span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>Actions</p>
          <div className="space-y-2">
            {actions.map((a) => (
              <button key={a.label} onClick={a.action}
                className="w-full flex items-center gap-3 rounded-lg border px-4 py-2.5 text-xs font-semibold transition-all text-left"
                style={{ background: a.bg, color: a.color, borderColor: a.border }}>
                <span className="text-base">{a.icon}</span>
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Billing Mapping Section
// ─────────────────────────────────────────────────────────────────────────────

function BillingMappingSection({ contract }: { contract: ContractData }) {
  const t = calcContractTotals(contract);

  const billingRows = [
    ...(contract.setupLineItems.length > 0 ? [{
      invoiceType: "One-Time Setup Invoice",
      amount: t.setupTotal,
      frequency: "One-Time",
      invoiceDate: contract.firstInvoiceDate,
      status: "Pending",
      icon: "🔧",
      color: "#C2410C",
      bg: "#FFF7ED",
      border: "#FED7AA",
    }] : []),
    ...(contract.recurringLineItems.length > 0 ? [{
      invoiceType: "Monthly Recurring Invoice",
      amount: t.monthlyRecurring,
      frequency: "Monthly",
      invoiceDate: contract.firstInvoiceDate,
      status: "Scheduled",
      icon: "🔁",
      color: "#1D4ED8",
      bg: "#EFF6FF",
      border: "#BFDBFE",
    }] : []),
    ...(contract.term === "3 Months" || contract.term === "6 Months" ? [{
      invoiceType: "Quarterly Invoice",
      amount: t.monthlyRecurring * 3,
      frequency: "Quarterly",
      invoiceDate: addMonths(contract.firstInvoiceDate, 3),
      status: "Scheduled",
      icon: "📆",
      color: "#6D28D9",
      bg: "#F5F3FF",
      border: "#DDD6FE",
    }] : []),
    ...(contract.term === "12 Months" || contract.term === "24 Months" || contract.term === "36 Months" ? [{
      invoiceType: "Annual Invoice",
      amount: t.monthlyRecurring * 12,
      frequency: "Annual",
      invoiceDate: addMonths(contract.firstInvoiceDate, 12),
      status: "Scheduled",
      icon: "🗓️",
      color: "#047857",
      bg: "#ECFDF5",
      border: "#A7F3D0",
    }] : []),
  ];

  return (
    <SectionCard title="💳 Billing Mapping">
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Setup Invoice Amount", value: fmtFull(t.setupTotal), color: "#C2410C" },
          { label: "Recurring Invoice Amount", value: `${fmtFull(t.monthlyRecurring)}/mo`, color: "#1D4ED8" },
          { label: "First Invoice Date", value: contract.firstInvoiceDate, color: "#059669" },
        ].map((r) => (
          <div key={r.label} className="rounded-xl border p-3 text-center"
            style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}>
            <p className="text-[10px] font-semibold" style={{ color: "var(--rtm-text-muted)" }}>{r.label}</p>
            <p className="text-sm font-black mt-0.5" style={{ color: r.color }}>{r.value}</p>
          </div>
        ))}
      </div>

      <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>Invoice Schedule</p>
      <div className="space-y-2">
        {billingRows.map((r) => (
          <div key={r.invoiceType} className="flex items-center gap-4 rounded-lg border px-4 py-3"
            style={{ background: r.bg, borderColor: r.border }}>
            <span className="text-xl">{r.icon}</span>
            <div className="flex-1">
              <p className="text-xs font-bold" style={{ color: r.color }}>{r.invoiceType}</p>
              <p className="text-[10px]" style={{ color: r.color }}>Frequency: {r.frequency} · First Invoice: {r.invoiceDate}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-black" style={{ color: r.color }}>{fmtFull(r.amount)}</p>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: r.status === "Scheduled" ? "#F0FDF4" : "#FFF7ED", color: r.status === "Scheduled" ? "#15803D" : "#C2410C" }}>
                {r.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Task Activation Mapping
// ─────────────────────────────────────────────────────────────────────────────

function TaskActivationMapping({ contract }: { contract: ContractData }) {
  const allItems = [...contract.setupLineItems, ...contract.recurringLineItems];

  const rows: TaskActivationRow[] = allItems.map((li) => ({
    lineItem: li.name,
    taskTemplate: li.taskTemplate,
    department: li.department,
    taskCount: li.taskCount,
    estimatedHours: li.workloadHours * li.quantity,
    status: contract.status === "Signed" ? "Activated" : contract.status === "Pending Signature" ? "Ready" : "Pending",
  }));

  return (
    <SectionCard title="📌 Task Activation Mapping">
      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--rtm-border)" }}>
        <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border)" }}>
              {["Selected Line Item", "Mapped Task Template", "Department Owner", "Task Count", "Est. Hours", "Activation Status"].map((h) => (
                <th key={h} className="text-left px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
                  style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const sc = DEPT_ACTIVATION_COLORS[r.status as DepartmentActivationStatus];
              return (
                <tr key={r.lineItem} style={{ borderBottom: "1px solid var(--rtm-border-light)", background: i % 2 === 0 ? "var(--rtm-bg)" : "var(--rtm-surface)" }}>
                  <td className="px-3 py-2.5 font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{r.lineItem}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#F5F3FF", color: "#6D28D9" }}>
                      {r.taskTemplate}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-[11px]" style={{ color: "var(--rtm-text-secondary)" }}>{r.department}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap font-bold" style={{ color: "#6D28D9" }}>{r.taskCount}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{r.estimatedHours}h</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <Badge label={r.status} bg={sc.bg} text={sc.text} border={sc.border} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Department Activation
// ─────────────────────────────────────────────────────────────────────────────

function DepartmentActivationSection({ contract }: { contract: ContractData }) {
  const allItems = [...contract.setupLineItems, ...contract.recurringLineItems];
  const deptMap = new Map<string, { icon: string; lineItems: string[]; taskCount: number; hours: number }>();

  const DEPT_ICONS: Record<string, string> = {
    "SEO Department": "🔍",
    "GBP Department": "📍",
    "Paid Advertising Department": "📢",
    "LSA Department": "⭐",
    "Reporting Department": "📊",
    "Web Department": "🌐",
    "Creative Department": "🎨",
    "Strategy Department": "🧠",
  };

  for (const li of allItems) {
    if (!deptMap.has(li.department)) {
      deptMap.set(li.department, { icon: DEPT_ICONS[li.department] ?? "🏢", lineItems: [], taskCount: 0, hours: 0 });
    }
    const d = deptMap.get(li.department)!;
    d.lineItems.push(li.name);
    d.taskCount += li.taskCount;
    d.hours += li.workloadHours * li.quantity;
  }

  const departments: DepartmentActivation[] = Array.from(deptMap.entries()).map(([dept, data]) => ({
    department: dept,
    icon: data.icon,
    status: contract.status === "Signed" ? "Activated" : contract.status === "Pending Signature" ? "Ready" : "Pending",
    lineItems: data.lineItems,
    taskCount: data.taskCount,
    estimatedHours: data.hours,
  }));

  return (
    <SectionCard title="👥 Department Activation">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {departments.map((d) => {
          const sc = DEPT_ACTIVATION_COLORS[d.status];
          return (
            <div key={d.department} className="rounded-xl border p-4"
              style={{ background: sc.bg, borderColor: sc.border }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{d.icon}</span>
                  <p className="text-xs font-bold" style={{ color: sc.text }}>{d.department}</p>
                </div>
                <Badge label={d.status} bg={sc.bg} text={sc.text} border={sc.border} />
              </div>
              <div className="space-y-1 mb-2">
                {d.lineItems.map((li) => (
                  <div key={li} className="text-[11px] flex items-center gap-1">
                    <span style={{ color: sc.text }}>·</span>
                    <span style={{ color: sc.text }}>{li}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-[10px] pt-2 border-t"
                style={{ borderColor: sc.border }}>
                <span style={{ color: sc.text }}>{d.taskCount} tasks</span>
                <span style={{ color: sc.text }}>{d.estimatedHours}h/mo</span>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Renewal Engine
// ─────────────────────────────────────────────────────────────────────────────

function RenewalEngineSection({ contract }: { contract: ContractData }) {
  const t = calcContractTotals(contract);
  const forecastValue = t.totalContractValue * 1.1; // 10% growth forecast

  const notices: RenewalNotice[] = [
    { days: 120, date: subtractDays(contract.endDate, 120), label: "120 Day Notice", sent: false },
    { days: 90, date: subtractDays(contract.endDate, 90), label: "90 Day Notice", sent: false },
    { days: 60, date: subtractDays(contract.endDate, 60), label: "60 Day Notice", sent: false },
    { days: 30, date: subtractDays(contract.endDate, 30), label: "30 Day Notice", sent: false },
  ];

  const renewalStatuses: RenewalStatus[] = [
    "Not Started", "In Progress", "Renewal Sent", "Renewed", "At Risk", "Lost",
  ];

  const [renewalStatus, setRenewalStatus] = useState<RenewalStatus>("Not Started");

  const renewalStatusColors: Record<RenewalStatus, { bg: string; text: string; border: string }> = {
    "Not Started": { bg: "#F3F4F6", text: "#6B7280", border: "#D1D5DB" },
    "In Progress": { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
    "Renewal Sent": { bg: "#F0F9FF", text: "#0369A1", border: "#BAE6FD" },
    "Renewed":      { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
    "At Risk":      { bg: "#FEFCE8", text: "#A16207", border: "#FDE68A" },
    "Lost":          { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
  };

  const rsc = renewalStatusColors[renewalStatus];

  return (
    <SectionCard title="🔄 Renewal Engine">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>Renewal Status</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {renewalStatuses.map((s) => {
                const c = renewalStatusColors[s];
                return (
                  <button key={s} onClick={() => setRenewalStatus(s)}
                    className="text-[10px] font-bold px-2 py-1 rounded-full border transition-all"
                    style={{
                      background: renewalStatus === s ? c.bg : "var(--rtm-surface)",
                      color: renewalStatus === s ? c.text : "var(--rtm-text-muted)",
                      borderColor: renewalStatus === s ? c.border : "var(--rtm-border)",
                    }}>
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            {[
              { label: "Contract Start", value: contract.startDate, icon: "🗓️" },
              { label: "Contract End", value: contract.endDate, icon: "🏁" },
              { label: "Renewal Date", value: contract.renewalDate, icon: "🔄" },
              { label: "Renewal Owner", value: contract.contractOwner, icon: "👤" },
              { label: "Renewal Forecast Value", value: fmtFull(forecastValue), icon: "📈" },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between text-xs rounded-lg px-3 py-2 border"
                style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}>
                <div className="flex items-center gap-2">
                  <span>{r.icon}</span>
                  <span style={{ color: "var(--rtm-text-muted)" }}>{r.label}</span>
                </div>
                <span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>Renewal Notices (Auto-Calculated)</p>
          <div className="space-y-2">
            {notices.map((n) => (
              <div key={n.label} className="flex items-center justify-between rounded-lg border px-3 py-2.5"
                style={{ background: n.sent ? "#F0FDF4" : "#FFF7ED", borderColor: n.sent ? "#A7F3D0" : "#FED7AA" }}>
                <div>
                  <p className="text-xs font-bold" style={{ color: n.sent ? "#15803D" : "#C2410C" }}>{n.label}</p>
                  <p className="text-[10px]" style={{ color: n.sent ? "#059669" : "#D97706" }}>{n.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: n.sent ? "#ECFDF5" : "#FFF7ED", color: n.sent ? "#059669" : "#C2410C",
                      border: `1px solid ${n.sent ? "#A7F3D0" : "#FED7AA"}` }}>
                    {n.sent ? "✅ Sent" : "⏳ Pending"}
                  </span>
                  <button onClick={() => alert(`[Mock] ${n.label} sent`)}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-lg border"
                    style={{ background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" }}>
                    Send
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Contract Timeline
// ─────────────────────────────────────────────────────────────────────────────

function ContractTimeline({ contract }: { contract: ContractData }) {
  const events: TimelineEvent[] = [
    { label: "Proposal Created", date: "May 18, 2025", icon: "📋", done: true },
    { label: "Proposal Approved", date: contract.createdDate, icon: "✅", done: true },
    { label: "Contract Generated", date: contract.createdDate, icon: "📄", done: contract.status !== "Draft" },
    { label: "Sent For Signature", date: contract.sentDate || "", icon: "📨", done: !!contract.sentDate },
    { label: "Viewed", date: contract.viewedDate || "", icon: "👁️", done: !!contract.viewedDate },
    { label: "Signed", date: contract.signedDate || "", icon: "✍️", done: !!contract.signedDate },
    { label: "Billing Requested", date: contract.signedDate ? addDays(contract.signedDate, 1) : "", icon: "💳", done: !!contract.signedDate },
    { label: "Activation Requested", date: contract.signedDate ? addDays(contract.signedDate, 2) : "", icon: "🚀", done: !!contract.signedDate },
  ];

  return (
    <SectionCard title="📅 Contract Timeline">
      <div className="space-y-0">
        {events.map((e, i) => (
          <div key={e.label} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm border-2"
                style={{
                  background: e.done ? "#F0FDF4" : "var(--rtm-bg)",
                  borderColor: e.done ? "#059669" : "var(--rtm-border)",
                }}>
                <span>{e.icon}</span>
              </div>
              {i < events.length - 1 && (
                <div className="w-0.5 h-8 flex-shrink-0 my-0.5"
                  style={{ background: e.done ? "#059669" : "var(--rtm-border)" }} />
              )}
            </div>
            <div className="pb-6 pt-1 flex-1">
              <p className="text-xs font-bold" style={{ color: e.done ? "var(--rtm-text-primary)" : "var(--rtm-text-muted)" }}>
                {e.label}
              </p>
              {e.date && (
                <p className="text-[10px]" style={{ color: e.done ? "#059669" : "var(--rtm-text-muted)" }}>{e.date}</p>
              )}
              {!e.date && !e.done && (
                <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>Pending...</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Contract Generator — Main View for a contract
// ─────────────────────────────────────────────────────────────────────────────

function ContractGeneratorView({
  contract,
  onBack,
}: {
  contract: ContractData;
  onBack: () => void;
}) {
  const [activeContract, setActiveContract] = useState<ContractData>(contract);
  const [term, setTerm] = useState<ContractTerm>(contract.term);
  const [customMonths, setCustomMonths] = useState(12);
  const [startDate, setStartDate] = useState("2025-07-01");
  const [signatureStatus, setSignatureStatus] = useState<SignatureStatus>(contract.signatureStatus);

  const liveContract: ContractData = {
    ...activeContract,
    term,
    customTermMonths: customMonths,
    signatureStatus,
  };

  const statusColors = CONTRACT_STATUS_COLORS[liveContract.status];

  return (
    <div className="space-y-6">
      {/* Contract Header */}
      <div className="rounded-xl border p-5" style={{ background: statusColors.bg, borderColor: statusColors.border }}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ContractStatusBadge status={liveContract.status} />
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-muted)", border: "1px solid var(--rtm-border)" }}>
                {liveContract.contractNumber}
              </span>
            </div>
            <h2 className="text-lg font-bold" style={{ color: statusColors.text }}>{liveContract.name}</h2>
            <p className="text-xs mt-0.5" style={{ color: statusColors.text }}>
              {liveContract.client} · {liveContract.contractOwner} · {liveContract.term}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onBack}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>
              ← Back to Contracts
            </button>
          </div>
        </div>
      </div>

      {/* Workflow Position */}
      <WorkflowStepper currentStep={4} />

      {/* Contract Info */}
      <SectionCard title="📋 Contract Details">
        <ContractInfoPanel contract={liveContract} />
      </SectionCard>

      {/* Term Management */}
      <ContractTermSelector
        term={term}
        customMonths={customMonths}
        startDate={startDate}
        onTermChange={setTerm}
        onCustomMonthsChange={setCustomMonths}
        onStartDateChange={setStartDate}
      />

      {/* Financial Structure */}
      <SectionCard title="💼 Financial Structure — Setup & Recurring" accent="#A7F3D0">
        <div className="space-y-4">
          <SetupFeesSection items={liveContract.setupLineItems} />
          <RecurringFeesSection items={liveContract.recurringLineItems} />
        </div>
      </SectionCard>

      {/* Contract Value Calculator */}
      <ContractValueCalculator contract={liveContract} />

      {/* Discount Impact */}
      <DiscountImpactSection contract={liveContract} />

      {/* Services Summary */}
      <ContractServicesSummary contract={liveContract} />

      {/* Signature Workflow */}
      <SignatureWorkflowSection
        contract={liveContract}
        onStatusChange={setSignatureStatus}
      />

      {/* Billing Mapping */}
      <BillingMappingSection contract={liveContract} />

      {/* Task Activation */}
      <TaskActivationMapping contract={liveContract} />

      {/* Department Activation */}
      <DepartmentActivationSection contract={liveContract} />

      {/* Renewal Engine */}
      <RenewalEngineSection contract={liveContract} />

      {/* Timeline */}
      <ContractTimeline contract={liveContract} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Contract List
// ─────────────────────────────────────────────────────────────────────────────

function ContractListSection({ onOpen }: { onOpen: (c: ContractData) => void }) {
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const filtered = MOCK_CONTRACTS.filter((c) => statusFilter === "All" || c.status === statusFilter);

  const allStatuses: ContractStatus[] = [
    "Draft", "Pending Internal Approval", "Pending Client Approval",
    "Pending Signature", "Signed", "Rejected", "Expired", "Cancelled",
  ];

  return (
    <SectionCard title="📄 Contracts Overview">
      <div className="flex flex-wrap gap-2 mb-4">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs rounded-lg border px-3 py-1.5 focus:outline-none"
          style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}>
          <option value="All">All Statuses ({MOCK_CONTRACTS.length})</option>
          {allStatuses.map((s) => (
            <option key={s} value={s}>{s} ({MOCK_CONTRACTS.filter((c) => c.status === s).length})</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        {filtered.map((c) => {
          const t = calcContractTotals(c);
          const sc = CONTRACT_STATUS_COLORS[c.status];
          return (
            <div key={c.id}
              onClick={() => onOpen(c)}
              className="flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>{c.name}</p>
                  <ContractStatusBadge status={c.status} />
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>{c.client}</span>
                  <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>·</span>
                  <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>{c.contractNumber}</span>
                  <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>·</span>
                  <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>{c.term}</span>
                  <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>·</span>
                  <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>{c.startDate} → {c.endDate}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-center">
                  <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>MRR</p>
                  <p className="text-sm font-bold" style={{ color: "#059669" }}>{fmtFull(t.monthlyRecurring)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>Setup</p>
                  <p className="text-sm font-bold" style={{ color: "#C2410C" }}>{fmtFull(t.setupTotal)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>Total Value</p>
                  <p className="text-sm font-bold" style={{ color: "#7C3AED" }}>{fmtFull(t.totalContractValue)}</p>
                </div>
                <SignatureStatusBadge status={c.signatureStatus} />
                <button onClick={(e) => { e.stopPropagation(); onOpen(c); }}
                  className="text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all"
                  style={{ background: sc.bg, color: sc.text, borderColor: sc.border }}>
                  Open →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Line Item Catalog Section
// ─────────────────────────────────────────────────────────────────────────────

function LineItemCatalogSection({ onAddToProposal }: { onAddToProposal: (item: LineItemCatalog) => void }) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string>("All");
  const [billingFilter, setBillingFilter] = useState<string>("All");
  const [financeFilter, setFinanceFilter] = useState<string>("All");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const filtered = LINE_ITEM_CATALOG.filter((li) => {
    const matchSearch = !search || li.name.toLowerCase().includes(search.toLowerCase()) ||
      li.description.toLowerCase().includes(search.toLowerCase()) ||
      li.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "All" || li.category === catFilter;
    const matchBilling = billingFilter === "All" || li.billingType === billingFilter;
    const matchFinance = financeFilter === "All" || li.financeStatus === financeFilter;
    return matchSearch && matchCat && matchBilling && matchFinance;
  });

  return (
    <SectionCard title="📦 Line Item Catalog">
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Search line items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-xs rounded-lg border px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[180px]"
          style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
        />
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
          className="text-xs rounded-lg border px-3 py-1.5 focus:outline-none"
          style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}>
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={billingFilter} onChange={(e) => setBillingFilter(e.target.value)}
          className="text-xs rounded-lg border px-3 py-1.5 focus:outline-none"
          style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}>
          <option value="All">All Billing Types</option>
          {BILLING_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={financeFilter} onChange={(e) => setFinanceFilter(e.target.value)}
          className="text-xs rounded-lg border px-3 py-1.5 focus:outline-none"
          style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}>
          <option value="All">All Finance Statuses</option>
          {FINANCE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-xs py-1.5" style={{ color: "var(--rtm-text-muted)" }}>
          {filtered.length} items
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--rtm-border)" }}>
        <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border)" }}>
              {["Line Item", "Category", "Department", "Unit Price", "Billing", "Workload", "Cost", "Margin", "Finance Status", "Task Template", "Prerequisites", "Actions"].map((h) => (
                <th key={h} className="text-left px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
                  style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((li, i) => (
              <React.Fragment key={li.id}>
                <tr
                  className="cursor-pointer transition-colors"
                  style={{ borderBottom: "1px solid var(--rtm-border-light)", background: i % 2 === 0 ? "var(--rtm-bg)" : "var(--rtm-surface)" }}
                  onClick={() => setExpandedItem(expandedItem === li.id ? null : li.id)}>
                  <td className="px-3 py-2.5">
                    <div>
                      <p className="font-semibold text-xs" style={{ color: "var(--rtm-text-primary)" }}>{li.name}</p>
                      <p className="text-[10px] mt-0.5 max-w-[200px] truncate" style={{ color: "var(--rtm-text-muted)" }}>{li.description}</p>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap"><CategoryBadge category={li.category} /></td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-[11px]" style={{ color: "var(--rtm-text-secondary)" }}>{li.department}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap font-bold" style={{ color: "var(--rtm-text-primary)" }}>{fmtFull(li.unitPrice)}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                      style={{ background: li.billingType === "Monthly Recurring" ? "#EFF6FF" : li.billingType === "One-Time" ? "#FFF7ED" : "#F0FDF4", color: li.billingType === "Monthly Recurring" ? "#1D4ED8" : li.billingType === "One-Time" ? "#C2410C" : "#15803D" }}>
                      {li.billingType}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{li.workloadHours}h</td>
                  <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{fmtFull(li.internalCost)}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className="font-bold" style={{ color: li.margin >= 65 ? "#059669" : li.margin >= 55 ? "#D97706" : "#DC2626" }}>
                      {li.margin}%
                    </span>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap"><FinanceStatusBadge status={li.financeStatus} /></td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#F5F3FF", color: "#6D28D9" }}>
                      {li.taskTemplate}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className="text-[10px] font-semibold" style={{ color: li.prerequisites.length > 0 ? "#C2410C" : "#6B7280" }}>
                      {li.prerequisites.length > 0 ? `${li.prerequisites.length} required` : "None"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); onAddToProposal(li); }}
                        className="text-[10px] font-bold px-2 py-1 rounded transition-all"
                        style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}>
                        + Add
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setExpandedItem(expandedItem === li.id ? null : li.id); }}
                        className="text-[10px] font-bold px-2 py-1 rounded transition-all"
                        style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)", border: "1px solid var(--rtm-border)" }}>
                        {expandedItem === li.id ? "▲" : "▼"}
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedItem === li.id && (
                  <tr style={{ background: "#F8FAFC", borderBottom: "1px solid var(--rtm-border)" }}>
                    <td colSpan={12} className="px-5 py-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#1D4ED8" }}>💰 Finance Pricing</p>
                          <div className="rounded-lg border p-3 space-y-1" style={{ background: "#F0F9FF", borderColor: "#BFDBFE" }}>
                            {[
                              ["Approved Price", fmtFull(li.financeApprovedPrice)],
                              ["Approved Workload", `${li.financeApprovedWorkload}h`],
                              ["Approved Cost", fmtFull(li.financeApprovedCost)],
                              ["Finance Margin", `${li.financeMargin}%`],
                            ].map(([label, val]) => (
                              <div key={label} className="flex justify-between text-[11px]">
                                <span style={{ color: "#0369A1" }}>{label}</span>
                                <span className="font-bold" style={{ color: "#1D4ED8" }}>{val}</span>
                              </div>
                            ))}
                            <div className="mt-2 pt-2 border-t" style={{ borderColor: "#BFDBFE" }}>
                              <Link href="/finance/line-items" className="text-[10px] font-bold" style={{ color: "#1D4ED8" }}>
                                🔒 Finance Pricing → /finance/line-items
                              </Link>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#C2410C" }}>⚠️ Prerequisites</p>
                          {li.prerequisites.length > 0 ? (
                            <div className="space-y-1">
                              {li.prerequisites.map((p) => (
                                <div key={p.name} className="flex items-center justify-between text-[11px] rounded px-2 py-1"
                                  style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
                                  <span style={{ color: "var(--rtm-text-secondary)" }}>{p.name}</span>
                                  <DepStatusBadge status={p.status} />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>No prerequisites</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#6D28D9" }}>📌 Task Template</p>
                          <div className="rounded-lg border p-3 space-y-1" style={{ background: "#F5F3FF", borderColor: "#DDD6FE" }}>
                            <p className="text-xs font-bold" style={{ color: "#6D28D9" }}>{li.taskTemplate}</p>
                            <p className="text-[11px]" style={{ color: "#7C3AED" }}>{li.taskCount} tasks</p>
                            <p className="text-[10px]" style={{ color: "#8B5CF6" }}>Department: {li.department}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#15803D" }}>✅ Activation Requirements</p>
                          <div className="space-y-1">
                            {li.activationRequirements.map((req) => (
                              <div key={req} className="flex items-center gap-1 text-[11px]">
                                <span className="text-[10px]" style={{ color: "#15803D" }}>○</span>
                                <span style={{ color: "var(--rtm-text-secondary)" }}>{req}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Proposal Builder Section
// ─────────────────────────────────────────────────────────────────────────────

function ProposalBuilder({
  lineItems,
  discountType,
  discountAmount,
  promoCode,
  onUpdateQuantity,
  onUpdateDiscount,
  onRemove,
  onDiscountTypeChange,
  onDiscountAmountChange,
  onPromoChange,
}: {
  lineItems: ProposalLineItem[];
  discountType: DiscountType;
  discountAmount: number;
  promoCode: string;
  onUpdateQuantity: (id: string, qty: number) => void;
  onUpdateDiscount: (id: string, d: number) => void;
  onRemove: (id: string) => void;
  onDiscountTypeChange: (d: DiscountType) => void;
  onDiscountAmountChange: (n: number) => void;
  onPromoChange: (code: string) => void;
}) {
  const totals = calcProposalTotals(lineItems, discountType, discountAmount);
  const marginWarning = totals.estimatedMargin < 45;

  return (
    <SectionCard title="🛒 Proposal Builder">
      {lineItems.length === 0 ? (
        <div className="text-center py-10 rounded-xl border border-dashed" style={{ borderColor: "var(--rtm-border)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-muted)" }}>No line items selected.</p>
          <p className="text-xs mt-1" style={{ color: "var(--rtm-text-muted)" }}>Use the Line Item Catalog below to add items to this proposal.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border mb-4" style={{ borderColor: "var(--rtm-border)" }}>
            <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border)" }}>
                  {["Line Item", "Category", "Department", "Qty", "Unit Price", "Line Discount", "Subtotal", "Billing", "Workload", "Prereqs", "Task Template", "Actions"].map((h) => (
                    <th key={h} className="text-left px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
                      style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lineItems.map((li, i) => {
                  const sub = li.unitPrice * li.quantity * (1 - li.customDiscount / 100);
                  return (
                    <tr key={li.id} style={{ borderBottom: "1px solid var(--rtm-border-light)", background: i % 2 === 0 ? "var(--rtm-bg)" : "var(--rtm-surface)" }}>
                      <td className="px-3 py-2.5">
                        <p className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{li.name}</p>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap"><CategoryBadge category={li.category} /></td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-[11px]" style={{ color: "var(--rtm-text-secondary)" }}>{li.department}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <input
                          type="number"
                          min={1}
                          max={99}
                          value={li.quantity}
                          onChange={(e) => onUpdateQuantity(li.id, Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-14 text-center text-xs rounded border px-1 py-1 focus:outline-none"
                          style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
                        />
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                        {fmtFull(li.unitPrice)}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={li.customDiscount}
                            onChange={(e) => onUpdateDiscount(li.id, Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                            className="w-12 text-center text-xs rounded border px-1 py-1 focus:outline-none"
                            style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
                          />
                          <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>%</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap font-bold" style={{ color: "#059669" }}>
                        {fmtFull(sub)}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                          style={{ background: li.billingType === "Monthly Recurring" ? "#EFF6FF" : "#FFF7ED", color: li.billingType === "Monthly Recurring" ? "#1D4ED8" : "#C2410C" }}>
                          {li.billingType}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>
                        {li.workloadHours * li.quantity}h
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="text-[10px]" style={{ color: li.prerequisites.length > 0 ? "#C2410C" : "#6B7280" }}>
                          {li.prerequisites.length > 0 ? `${li.prerequisites.length} reqd` : "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#F5F3FF", color: "#6D28D9" }}>
                          {li.taskTemplate}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <button
                          onClick={() => onRemove(li.id)}
                          className="text-[10px] font-bold px-2 py-1 rounded border transition-all"
                          style={{ background: "#FFF1F2", color: "#BE123C", borderColor: "#FECDD3" }}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Discount Section */}
          <div className="rounded-xl border p-4 mb-4" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
            <p className="text-xs font-bold mb-3" style={{ color: "#92400E" }}>🏷️ Promo Code & Discounts</p>
            <div className="flex flex-wrap gap-3">
              <div>
                <label className="text-[10px] font-semibold block mb-1" style={{ color: "#92400E" }}>Promo Code</label>
                <input type="text" value={promoCode} onChange={(e) => onPromoChange(e.target.value)}
                  placeholder="e.g. LAUNCH20"
                  className="text-xs rounded-lg border px-3 py-1.5 focus:outline-none w-36"
                  style={{ background: "#fff", borderColor: "#FDE68A", color: "var(--rtm-text-primary)" }} />
              </div>
              <div>
                <label className="text-[10px] font-semibold block mb-1" style={{ color: "#92400E" }}>Discount Type</label>
                <select value={discountType} onChange={(e) => onDiscountTypeChange(e.target.value as DiscountType)}
                  className="text-xs rounded-lg border px-3 py-1.5 focus:outline-none"
                  style={{ background: "#fff", borderColor: "#FDE68A", color: "var(--rtm-text-primary)" }}>
                  <option value="Percentage">Percentage</option>
                  <option value="Fixed Amount">Fixed Amount</option>
                  <option value="Line Item Discount">Line Item Discount</option>
                  <option value="Package Discount">Package Discount</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold block mb-1" style={{ color: "#92400E" }}>
                  {discountType === "Fixed Amount" ? "Discount ($)" : "Discount (%)"}
                </label>
                <input type="number" min={0} value={discountAmount}
                  onChange={(e) => onDiscountAmountChange(parseFloat(e.target.value) || 0)}
                  className="text-xs rounded-lg border px-3 py-1.5 focus:outline-none w-24"
                  style={{ background: "#fff", borderColor: "#FDE68A", color: "var(--rtm-text-primary)" }} />
              </div>
              {promoCode && (
                <div className="flex items-end">
                  <span className="text-[10px] font-bold px-2 py-1.5 rounded-lg" style={{ background: "#F0FDF4", color: "#15803D", border: "1px solid #A7F3D0" }}>
                    ✅ Code Applied: {promoCode}
                  </span>
                </div>
              )}
            </div>
            {marginWarning && (
              <div className="mt-3 rounded-lg border p-2" style={{ background: "#FFF1F2", borderColor: "#FECDD3" }}>
                <p className="text-[10px] font-bold" style={{ color: "#BE123C" }}>
                  ⚠️ Warning: Discount reduces estimated margin to {totals.estimatedMargin.toFixed(1)}% — below 45% threshold. Finance review may be required.
                </p>
              </div>
            )}
          </div>

          <ProposalTotalsCard totals={totals} />
        </>
      )}
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Proposal Totals Card
// ─────────────────────────────────────────────────────────────────────────────

function ProposalTotalsCard({ totals }: { totals: ReturnType<typeof calcProposalTotals> }) {
  const rows = [
    { label: "Setup Fees", value: fmtFull(totals.setupFees), color: "#C2410C" },
    { label: "Monthly Recurring", value: `${fmtFull(totals.monthlyRecurring)}/mo`, color: "#1D4ED8" },
    { label: "Quarterly", value: totals.quarterlyTotal > 0 ? fmtFull(totals.quarterlyTotal) : "—", color: "#6D28D9" },
    { label: "Annual", value: totals.annualTotal > 0 ? fmtFull(totals.annualTotal) : "—", color: "#047857" },
    { label: "Subtotal", value: fmtFull(totals.rawSubtotal), color: "var(--rtm-text-primary)" },
    { label: "Discount", value: totals.discountValue > 0 ? `-${fmtFull(totals.discountValue)}` : "—", color: "#DC2626" },
    { label: "Final Quote", value: fmtFull(totals.finalQuote), color: "#059669", bold: true },
    { label: "Internal Cost", value: fmtFull(totals.totalInternalCost), color: "var(--rtm-text-muted)" },
    { label: "Est. Margin", value: `${totals.estimatedMargin.toFixed(1)}%`, color: totals.estimatedMargin >= 55 ? "#059669" : totals.estimatedMargin >= 45 ? "#D97706" : "#DC2626" },
    { label: "Workload Hours", value: `${totals.totalWorkload}h`, color: "var(--rtm-text-secondary)" },
  ];

  return (
    <div className="rounded-xl border p-4" style={{ background: "#F0FDF4", borderColor: "#A7F3D0" }}>
      <p className="text-xs font-bold mb-3" style={{ color: "#15803D" }}>💰 Proposal Totals</p>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {rows.map((r) => (
          <div key={r.label} className="text-center">
            <p className="text-[10px] font-semibold" style={{ color: "#15803D" }}>{r.label}</p>
            <p className="text-sm mt-0.5" style={{ color: r.color, fontWeight: r.bold ? 900 : 700 }}>{r.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Budget-Based Recommendation
// ─────────────────────────────────────────────────────────────────────────────

type BudgetRec = {
  items: LineItemCatalog[];
  monthlyTotal: number;
  setupTotal: number;
  workload: number;
  internalCost: number;
  margin: number;
  services: string[];
  missingPrereqs: string[];
};

function getBudgetRecommendation(budget: number, budgetType: BudgetType): BudgetRec {
  const monthlyBudget = budgetType === "Monthly Budget" ? budget :
    budgetType === "Total Contract Budget" ? budget / 12 : budget;

  let items: LineItemCatalog[] = [];

  if (monthlyBudget >= 4000) {
    items = LINE_ITEM_CATALOG.filter((li) =>
      ["li-001", "li-002", "li-003", "li-005", "li-006", "li-012", "li-015", "li-018"].includes(li.id)
    );
  } else if (monthlyBudget >= 2500) {
    items = LINE_ITEM_CATALOG.filter((li) =>
      ["li-001", "li-002", "li-003", "li-012", "li-018"].includes(li.id)
    );
  } else if (monthlyBudget >= 1500) {
    items = LINE_ITEM_CATALOG.filter((li) =>
      ["li-001", "li-002", "li-003", "li-012"].includes(li.id)
    );
  } else if (monthlyBudget >= 800) {
    items = LINE_ITEM_CATALOG.filter((li) =>
      ["li-003", "li-010", "li-012"].includes(li.id)
    );
  } else {
    items = LINE_ITEM_CATALOG.filter((li) =>
      ["li-003", "li-012"].includes(li.id)
    );
  }

  const monthlyTotal = items.filter((li) => li.billingType === "Monthly Recurring").reduce((s, li) => s + li.unitPrice, 0);
  const setupTotal = items.filter((li) => li.billingType === "One-Time").reduce((s, li) => s + li.unitPrice, 0);
  const workload = items.reduce((s, li) => s + li.workloadHours, 0);
  const internalCost = items.reduce((s, li) => s + li.internalCost, 0);
  const totalRevenue = monthlyTotal + setupTotal;
  const margin = totalRevenue > 0 ? ((totalRevenue - internalCost) / totalRevenue) * 100 : 0;
  const servicesSet = new Set(items.map((li) => li.category));
  const services = Array.from(servicesSet);
  const prereqs = items.flatMap((li) => li.prerequisites.map((p) => p.name));
  const prereqSet = new Set(prereqs);
  const missingPrereqs = Array.from(prereqSet).slice(0, 4);

  return { items, monthlyTotal, setupTotal, workload, internalCost, margin, services, missingPrereqs };
}

function BuildFromBudgetSection({ onAcceptRecommendation }: { onAcceptRecommendation: (items: LineItemCatalog[]) => void }) {
  const [budget, setBudget] = useState<number>(2500);
  const [budgetType, setBudgetType] = useState<BudgetType>("Monthly Budget");
  const [recommendation, setRecommendation] = useState<BudgetRec | null>(null);

  const handleRecommend = () => {
    setRecommendation(getBudgetRecommendation(budget, budgetType));
  };

  return (
    <SectionCard title="💡 Build From Budget">
      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>Client Budget</label>
          <div className="flex items-center gap-1">
            <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>$</span>
            <input type="number" value={budget} onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
              className="text-xs rounded-lg border px-3 py-1.5 focus:outline-none w-32"
              style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }} />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>Budget Type</label>
          <select value={budgetType} onChange={(e) => setBudgetType(e.target.value as BudgetType)}
            className="text-xs rounded-lg border px-3 py-1.5 focus:outline-none"
            style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}>
            <option value="Monthly Budget">Monthly Budget</option>
            <option value="One-Time Budget">One-Time Budget</option>
            <option value="Total Contract Budget">Total Contract Budget</option>
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={handleRecommend}
            className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={{ background: "#1D4ED8", color: "#fff" }}>
            ✨ Recommend Line Items
          </button>
        </div>
      </div>

      {recommendation && (
        <div className="rounded-xl border p-4 space-y-4" style={{ background: "#F0F9FF", borderColor: "#BAE6FD" }}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold" style={{ color: "#0369A1" }}>📋 Recommended Package</p>
            <div className="flex gap-2">
              <button onClick={() => onAcceptRecommendation(recommendation.items)}
                className="text-[10px] font-bold px-3 py-1 rounded-lg transition-all"
                style={{ background: "#1D4ED8", color: "#fff" }}>
                ✅ Accept Recommendation
              </button>
              <button onClick={() => setRecommendation(null)}
                className="text-[10px] font-semibold px-3 py-1 rounded-lg border transition-all"
                style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>
                ✏️ Customize
              </button>
              <button onClick={() => alert("[Mock] Package draft saved")}
                className="text-[10px] font-semibold px-3 py-1 rounded-lg border transition-all"
                style={{ background: "#ECFDF5", borderColor: "#A7F3D0", color: "#059669" }}>
                💾 Save Draft
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: "Monthly Total", value: fmtFull(recommendation.monthlyTotal), color: "#0369A1" },
              { label: "Setup Total", value: fmtFull(recommendation.setupTotal), color: "#C2410C" },
              { label: "Workload", value: `${recommendation.workload}h`, color: "#6D28D9" },
              { label: "Internal Cost", value: fmtFull(recommendation.internalCost), color: "#92400E" },
              { label: "Est. Margin", value: `${recommendation.margin.toFixed(1)}%`, color: "#15803D" },
            ].map((c) => (
              <div key={c.label} className="text-center rounded-lg p-3" style={{ background: "#fff", border: "1px solid #BAE6FD" }}>
                <p className="text-[10px] font-semibold" style={{ color: "#0369A1" }}>{c.label}</p>
                <p className="text-sm font-bold mt-0.5" style={{ color: c.color }}>{c.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold mb-2" style={{ color: "#0369A1" }}>Recommended Line Items</p>
              <div className="space-y-1">
                {recommendation.items.map((li) => (
                  <div key={li.id} className="flex items-center justify-between text-[11px] rounded px-2 py-1.5"
                    style={{ background: "#fff", border: "1px solid #BAE6FD" }}>
                    <span style={{ color: "var(--rtm-text-primary)" }}>{li.name}</span>
                    <span className="font-bold" style={{ color: "#0369A1" }}>{fmtFull(li.unitPrice)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-bold mb-2" style={{ color: "#0369A1" }}>Services Included</p>
                <div className="flex flex-wrap gap-1">
                  {recommendation.services.map((s) => (
                    <CategoryBadge key={s} category={s as Category} />
                  ))}
                </div>
              </div>

              {recommendation.missingPrereqs.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold mb-2" style={{ color: "#C2410C" }}>⚠️ Prerequisites to Confirm</p>
                  <div className="space-y-1">
                    {recommendation.missingPrereqs.map((p) => (
                      <div key={p} className="flex items-center gap-1 text-[11px]">
                        <span style={{ color: "#C2410C" }}>○</span>
                        <span style={{ color: "var(--rtm-text-secondary)" }}>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Audit-Based Recommendation
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_AI_RECOMMENDATIONS: { package: string; priority: LineItemCatalog[]; optional: LineItemCatalog[]; prereqs: string[]; budget: number; workload: number; rationale: string }[] = [
  {
    package: "Local Domination Package",
    priority: LINE_ITEM_CATALOG.filter((li) => ["li-001", "li-002", "li-003", "li-009", "li-010"].includes(li.id)),
    optional: LINE_ITEM_CATALOG.filter((li) => ["li-012", "li-021", "li-022"].includes(li.id)),
    prereqs: ["Website Access", "GBP Ownership", "Business License", "GA4 Setup"],
    budget: 3500,
    workload: 38,
    rationale: "Based on audit findings showing local SEO gaps and absent LSA presence, prioritizing GBP optimization and LSA setup will provide fastest ROI. SEO setup establishes long-term organic foundation.",
  },
  {
    package: "Paid Growth Package",
    priority: LINE_ITEM_CATALOG.filter((li) => ["li-005", "li-006", "li-007", "li-008", "li-013"].includes(li.id)),
    optional: LINE_ITEM_CATALOG.filter((li) => ["li-012", "li-018", "li-015"].includes(li.id)),
    prereqs: ["Google Ads Account", "Meta Business Manager", "Landing Page or Website", "Tracking Setup"],
    budget: 5500,
    workload: 66,
    rationale: "PPC and Meta Ads are highest-leverage channels for this business type. A dedicated landing page will improve conversion rates significantly. Tracking setup is critical prerequisite.",
  },
  {
    package: "Full-Service Digital Package",
    priority: LINE_ITEM_CATALOG.filter((li) => ["li-001", "li-002", "li-003", "li-005", "li-006", "li-012"].includes(li.id)),
    optional: LINE_ITEM_CATALOG.filter((li) => ["li-015", "li-018", "li-021", "li-017"].includes(li.id)),
    prereqs: ["Website Access", "All Ads Accounts", "GBP Access", "GA4/GSC Setup"],
    budget: 6000,
    workload: 80,
    rationale: "Comprehensive multi-channel approach addressing all identified gaps. SEO + PPC + GBP creates compound growth effect. Monthly reporting essential for attribution and optimization.",
  },
];

function AIAuditRecommendationSection({ onAcceptPackage }: { onAcceptPackage: (items: LineItemCatalog[]) => void }) {
  const [auditInputs, setAuditInputs] = useState<AuditInputs>({
    seoIssues: "",
    gbpIssues: "",
    ppcOpportunity: "",
    metaOpportunity: "",
    websiteIssues: "",
    reportingNeeds: "",
    competitorGap: "",
    budgetRange: "",
  });
  const [recommendation, setRecommendation] = useState<typeof MOCK_AI_RECOMMENDATIONS[0] | null>(null);
  const [recIndex, setRecIndex] = useState(0);

  const handleGenerate = () => {
    setRecommendation(MOCK_AI_RECOMMENDATIONS[recIndex % MOCK_AI_RECOMMENDATIONS.length]);
  };

  const handleRegenerate = () => {
    const next = (recIndex + 1) % MOCK_AI_RECOMMENDATIONS.length;
    setRecIndex(next);
    setRecommendation(MOCK_AI_RECOMMENDATIONS[next]);
  };

  const fields: { key: keyof AuditInputs; label: string; placeholder: string }[] = [
    { key: "seoIssues", label: "SEO Issues", placeholder: "e.g. 14 broken links, thin content..." },
    { key: "gbpIssues", label: "GBP Issues", placeholder: "e.g. Low rating, unclaimed profile..." },
    { key: "ppcOpportunity", label: "PPC Opportunity", placeholder: "e.g. No ads running, competitor opportunity..." },
    { key: "metaOpportunity", label: "Meta Opportunity", placeholder: "e.g. Strong audience, no retargeting..." },
    { key: "websiteIssues", label: "Website Issues", placeholder: "e.g. Outdated design, slow load..." },
    { key: "reportingNeeds", label: "Reporting Needs", placeholder: "e.g. No tracking, data in silos..." },
    { key: "competitorGap", label: "Competitor Gap", placeholder: "e.g. Competitors outranking on 5 keywords..." },
    { key: "budgetRange", label: "Budget Range", placeholder: "e.g. $2,000–$4,000/month" },
  ];

  return (
    <SectionCard title="🤖 AI Package Recommendations" accent="#DDD6FE">
      <p className="text-xs mb-4" style={{ color: "var(--rtm-text-muted)" }}>
        Enter audit findings to generate an AI-recommended service package. (Mock recommendations — no real AI APIs.)
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>{f.label}</label>
            <input type="text" value={auditInputs[f.key]} onChange={(e) => setAuditInputs((prev) => ({ ...prev, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              className="w-full text-xs rounded-lg border px-3 py-1.5 focus:outline-none focus:ring-1"
              style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }} />
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={handleGenerate}
          className="px-4 py-2 rounded-lg text-xs font-bold transition-all"
          style={{ background: "#6D28D9", color: "#fff" }}>
          🤖 Generate Recommendation
        </button>
        {recommendation && (
          <>
            <button onClick={handleRegenerate}
              className="px-4 py-2 rounded-lg text-xs font-bold border transition-all"
              style={{ background: "#F5F3FF", color: "#6D28D9", borderColor: "#DDD6FE" }}>
              🔄 Regenerate
            </button>
            <button onClick={() => onAcceptPackage([...recommendation.priority, ...recommendation.optional])}
              className="px-4 py-2 rounded-lg text-xs font-bold transition-all"
              style={{ background: "#1D4ED8", color: "#fff" }}>
              ✅ Accept AI Package
            </button>
            <button onClick={() => alert("[Mock] Customize package")}
              className="px-4 py-2 rounded-lg text-xs font-bold border transition-all"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>
              ✏️ Customize Package
            </button>
          </>
        )}
      </div>

      {recommendation && (
        <div className="rounded-xl border p-4 space-y-4" style={{ background: "#F5F3FF", borderColor: "#DDD6FE" }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold" style={{ color: "#6D28D9" }}>📦 {recommendation.package}</p>
            <div className="flex gap-3">
              <div className="text-center">
                <p className="text-[10px]" style={{ color: "#7C3AED" }}>Est. Budget</p>
                <p className="text-xs font-bold" style={{ color: "#6D28D9" }}>{fmtFull(recommendation.budget)}/mo</p>
              </div>
              <div className="text-center">
                <p className="text-[10px]" style={{ color: "#7C3AED" }}>Est. Workload</p>
                <p className="text-xs font-bold" style={{ color: "#6D28D9" }}>{recommendation.workload}h</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg p-3" style={{ background: "#EDE9FE", border: "1px solid #C4B5FD" }}>
            <p className="text-[10px] font-bold mb-1" style={{ color: "#5B21B6" }}>🧠 AI Rationale</p>
            <p className="text-xs" style={{ color: "#6D28D9" }}>{recommendation.rationale}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] font-bold mb-2" style={{ color: "#6D28D9" }}>🎯 Priority Line Items</p>
              <div className="space-y-1">
                {recommendation.priority.map((li) => (
                  <div key={li.id} className="flex items-center justify-between text-[11px] rounded px-2 py-1.5"
                    style={{ background: "#fff", border: "1px solid #DDD6FE" }}>
                    <span style={{ color: "var(--rtm-text-primary)" }}>{li.name}</span>
                    <span className="font-bold" style={{ color: "#6D28D9" }}>{fmtFull(li.unitPrice)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold mb-2" style={{ color: "#7C3AED" }}>➕ Optional Add-ons</p>
              <div className="space-y-1">
                {recommendation.optional.map((li) => (
                  <div key={li.id} className="flex items-center justify-between text-[11px] rounded px-2 py-1.5"
                    style={{ background: "#fff", border: "1px solid #EDE9FE" }}>
                    <span style={{ color: "var(--rtm-text-secondary)" }}>{li.name}</span>
                    <span className="font-bold" style={{ color: "#8B5CF6" }}>{fmtFull(li.unitPrice)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold mb-2" style={{ color: "#C2410C" }}>⚠️ Required Prerequisites</p>
              <div className="space-y-1">
                {recommendation.prereqs.map((p) => (
                  <div key={p} className="flex items-center gap-1 text-[11px]">
                    <span style={{ color: "#C2410C" }}>○</span>
                    <span style={{ color: "var(--rtm-text-secondary)" }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tasklist Mapping
// ─────────────────────────────────────────────────────────────────────────────

function TasklistMappingSection({ lineItems }: { lineItems: ProposalLineItem[] }) {
  if (lineItems.length === 0) {
    return (
      <SectionCard title="📌 Tasklist Mapping">
        <div className="text-center py-6 rounded-xl border border-dashed" style={{ borderColor: "var(--rtm-border)" }}>
          <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>Add line items to see tasklist mapping.</p>
        </div>
      </SectionCard>
    );
  }

  const ACTIVATION_TRIGGERS: Record<string, string> = {
    "One-Time": "On Proposal Approval",
    "Monthly Recurring": "On First Billing Activation",
    "Quarterly": "On Contract Start",
    "Annual": "On Contract Start",
  };

  return (
    <SectionCard title="📌 Tasklist Mapping — When Proposal Approved">
      <p className="text-xs mb-4" style={{ color: "var(--rtm-text-muted)" }}>
        When this proposal is approved, the following tasklists will be activated automatically based on sold line items.
      </p>
      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--rtm-border)" }}>
        <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border)" }}>
              {["Line Item", "Task Template", "Department Owner", "Activation Trigger", "Task Count", "Billing Type"].map((h) => (
                <th key={h} className="text-left px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
                  style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lineItems.map((li, i) => (
              <tr key={li.id} style={{ borderBottom: "1px solid var(--rtm-border-light)", background: i % 2 === 0 ? "var(--rtm-bg)" : "var(--rtm-surface)" }}>
                <td className="px-3 py-2.5 font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{li.name}</td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#F5F3FF", color: "#6D28D9" }}>
                    {li.taskTemplate}
                  </span>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap text-[11px]" style={{ color: "var(--rtm-text-secondary)" }}>{li.department}</td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#F0FDF4", color: "#15803D" }}>
                    {ACTIVATION_TRIGGERS[li.billingType]}
                  </span>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <span className="font-bold" style={{ color: "#6D28D9" }}>{li.taskCount} tasks</span>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                    style={{ background: li.billingType === "Monthly Recurring" ? "#EFF6FF" : "#FFF7ED", color: li.billingType === "Monthly Recurring" ? "#1D4ED8" : "#C2410C" }}>
                    {li.billingType}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Approval & Handoff Panel
// ─────────────────────────────────────────────────────────────────────────────

function ApprovalHandoffPanel({
  lineItems,
  stage,
  onStageChange,
}: {
  lineItems: ProposalLineItem[];
  stage: ProposalStage;
  onStageChange: (s: ProposalStage) => void;
}) {
  const hasLineItems = lineItems.length > 0;
  const hasFinancePricing = lineItems.every((li) => li.financeStatus === "Approved");
  const hasDependenciesReviewed = true;
  const hasTasksMapped = lineItems.every((li) => !!li.taskTemplate);
  const hasClientBudget = true;

  const checks = [
    { label: "Line items selected", ok: hasLineItems },
    { label: "Finance pricing available (all items)", ok: hasFinancePricing },
    { label: "Dependencies reviewed", ok: hasDependenciesReviewed },
    { label: "Task templates mapped", ok: hasTasksMapped },
    { label: "Client budget confirmed", ok: hasClientBudget },
  ];

  const allReady = checks.every((c) => c.ok);

  const handoffOutputs = [
    { label: "Billing Line Items", desc: "Selected line items define billing schedule", icon: "💳", ready: allReady },
    { label: "Activation Tasklists", desc: "Task templates activate per department", icon: "📌", ready: allReady },
    { label: "Department Workload", desc: "Workload distributed to each department", icon: "👥", ready: allReady },
    { label: "Finance Revenue Forecast", desc: "MRR and setup fees logged to finance", icon: "📊", ready: allReady },
    { label: "Client Services Purchased", desc: "Account management receives service scope", icon: "🤝", ready: allReady },
  ];

  const PIPELINE_STAGES: ProposalStage[] = [
    "Draft", "Internal Review", "Ready to Send", "Sent",
    "Viewed", "Negotiation", "Approved", "Rejected", "Pushed to Handoff",
  ];

  return (
    <SectionCard title="🚀 Approval & Handoff" accent="#A7F3D0">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-bold mb-3" style={{ color: "var(--rtm-text-primary)" }}>Proposal Stage</p>
          <div className="flex flex-wrap gap-1 mb-4">
            {PIPELINE_STAGES.map((s) => {
              const c = STAGE_COLORS[s];
              return (
                <button key={s} onClick={() => onStageChange(s)}
                  className="text-[10px] font-bold px-2 py-1 rounded-full border transition-all"
                  style={{
                    background: stage === s ? c.bg : "var(--rtm-surface)",
                    color: stage === s ? c.text : "var(--rtm-text-muted)",
                    borderColor: stage === s ? c.border : "var(--rtm-border)",
                  }}>
                  {s}
                </button>
              );
            })}
          </div>

          <p className="text-xs font-bold mb-2" style={{ color: "var(--rtm-text-primary)" }}>Pre-Approval Checklist</p>
          <div className="space-y-2">
            {checks.map((c) => (
              <div key={c.label} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                  style={{ background: c.ok ? "#ECFDF5" : "#FFF1F2", border: `1px solid ${c.ok ? "#A7F3D0" : "#FECDD3"}` }}>
                  <span className="text-[10px]" style={{ color: c.ok ? "#059669" : "#BE123C" }}>{c.ok ? "✓" : "✗"}</span>
                </div>
                <span className="text-xs" style={{ color: "var(--rtm-text-primary)" }}>{c.label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <button onClick={() => alert("[Mock] Draft saved")}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>
              💾 Save Draft
            </button>
            <button onClick={() => onStageChange("Internal Review")}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
              style={{ background: "#FFF7ED", borderColor: "#FED7AA", color: "#C2410C" }}>
              🔄 Send for Review
            </button>
            <button onClick={() => onStageChange("Ready to Send")}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
              style={{ background: "#EFF6FF", borderColor: "#BFDBFE", color: "#1D4ED8" }}>
              ✅ Mark Ready
            </button>
            <button onClick={() => onStageChange("Approved")}
              disabled={!allReady}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{ background: allReady ? "#F0FDF4" : "#F3F4F6", borderColor: allReady ? "#A7F3D0" : "#D1D5DB", color: allReady ? "#15803D" : "#9CA3AF", border: "1px solid" }}>
              🎯 Mark Approved
            </button>
            <button onClick={() => onStageChange("Pushed to Handoff")}
              disabled={stage !== "Approved"}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{ background: stage === "Approved" ? "#ECFDF5" : "#F3F4F6", border: `1px solid ${stage === "Approved" ? "#A7F3D0" : "#D1D5DB"}`, color: stage === "Approved" ? "#047857" : "#9CA3AF" }}>
              🚀 Push to Handoff
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold mb-3" style={{ color: "var(--rtm-text-primary)" }}>When Approved — Activates:</p>
          <div className="space-y-2">
            {handoffOutputs.map((o) => (
              <div key={o.label} className="flex items-center gap-3 rounded-lg border p-3"
                style={{ background: o.ready ? "#F0FDF4" : "#FFF7ED", borderColor: o.ready ? "#A7F3D0" : "#FED7AA" }}>
                <span className="text-lg">{o.icon}</span>
                <div className="flex-1">
                  <p className="text-xs font-bold" style={{ color: o.ready ? "#15803D" : "#C2410C" }}>{o.label}</p>
                  <p className="text-[10px]" style={{ color: o.ready ? "#059669" : "#D97706" }}>{o.desc}</p>
                </div>
                <span className="text-[10px] font-bold" style={{ color: o.ready ? "#059669" : "#D97706" }}>
                  {o.ready ? "✅ Ready" : "⏳ Pending"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Proposal Template Placeholder
// ─────────────────────────────────────────────────────────────────────────────

function ProposalTemplatePlaceholder() {
  const sections = [
    "Executive Summary",
    "Audit Findings",
    "Recommended Package",
    "Line Items & Pricing",
    "Pricing Summary",
    "Terms & Conditions",
    "Next Steps",
  ];

  return (
    <SectionCard title="📄 Proposal Template" accent="#FDE68A">
      <div className="rounded-xl border border-dashed p-8 text-center" style={{ borderColor: "#FDE68A", background: "#FFFBEB" }}>
        <div className="text-4xl mb-3">📋</div>
        <p className="text-sm font-bold" style={{ color: "#92400E" }}>Sample Proposal Template Pending</p>
        <p className="text-xs mt-2" style={{ color: "#A16207" }}>
          Template to be provided by Justin. The final proposal document will include the following sections:
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {sections.map((s) => (
            <span key={s} className="text-[11px] font-semibold px-3 py-1.5 rounded-lg"
              style={{ background: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A" }}>
              {s}
            </span>
          ))}
        </div>
        <p className="text-[10px] mt-4" style={{ color: "#A16207" }}>
          Once the template is provided, this section will render the full proposal preview with all selected line items, pricing, and client-facing copy.
        </p>
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Proposal List / Overview
// ─────────────────────────────────────────────────────────────────────────────

function ProposalListSection({ onOpen }: { onOpen: (p: Proposal) => void }) {
  const [stageFilter, setStageFilter] = useState<string>("All");
  const filtered = MOCK_PROPOSALS.filter((p) => stageFilter === "All" || p.stage === stageFilter);

  return (
    <SectionCard title="📋 Proposals Overview">
      <div className="flex flex-wrap gap-2 mb-4">
        <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}
          className="text-xs rounded-lg border px-3 py-1.5 focus:outline-none"
          style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}>
          <option value="All">All Stages ({MOCK_PROPOSALS.length})</option>
          {(["Draft", "Internal Review", "Ready to Send", "Sent", "Viewed", "Negotiation", "Approved", "Rejected", "Pushed to Handoff"] as ProposalStage[]).map((s) => (
            <option key={s} value={s}>{s} ({MOCK_PROPOSALS.filter((p) => p.stage === s).length})</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        {filtered.map((p) => {
          const totals = calcProposalTotals(p.lineItems, p.discountType, p.discountAmount);
          const c = STAGE_COLORS[p.stage];
          return (
            <div key={p.id}
              onClick={() => onOpen(p)}
              className="flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>{p.name}</p>
                  <StageBadge stage={p.stage} />
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>{p.client}</span>
                  <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>·</span>
                  <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>{p.salesRep}</span>
                  <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>·</span>
                  <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>{p.lineItems.length} line items</span>
                  <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>·</span>
                  <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>{p.budgetType}: {fmtFull(p.clientBudget)}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-center">
                  <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>MRR</p>
                  <p className="text-sm font-bold" style={{ color: "#059669" }}>{fmtFull(totals.monthlyRecurring)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>Setup</p>
                  <p className="text-sm font-bold" style={{ color: "#C2410C" }}>{fmtFull(totals.setupFees)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>Quote</p>
                  <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>{fmtFull(totals.finalQuote)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>Margin</p>
                  <p className="text-sm font-bold" style={{ color: totals.estimatedMargin >= 55 ? "#059669" : "#D97706" }}>
                    {totals.estimatedMargin.toFixed(1)}%
                  </p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onOpen(p); }}
                  className="text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all"
                  style={{ background: c.bg, color: c.text, borderColor: c.border }}>
                  Open →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Proposal Detail Modal
// ─────────────────────────────────────────────────────────────────────────────

function ProposalDetailModal({ proposal, onClose }: { proposal: Proposal; onClose: () => void }) {
  const totals = calcProposalTotals(proposal.lineItems, proposal.discountType, proposal.discountAmount);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}>
      <div className="w-full max-w-4xl max-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl"
        style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between px-6 py-4 sticky top-0 z-10"
          style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StageBadge stage={proposal.stage} />
            </div>
            <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>{proposal.name}</h2>
            <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{proposal.client} · {proposal.salesRep} · {proposal.lineItems.length} line items</p>
          </div>
          <button onClick={onClose} className="text-xl" style={{ color: "var(--rtm-text-muted)" }}>✕</button>
        </div>

        <div className="p-6 space-y-6">
          <ProposalTotalsCard totals={totals} />

          <div>
            <p className="text-xs font-bold mb-3" style={{ color: "var(--rtm-text-primary)" }}>Line Items</p>
            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--rtm-border)" }}>
              <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
                    {["Name", "Category", "Qty", "Unit Price", "Disc", "Subtotal", "Billing", "Workload", "Task Template"].map((h) => (
                      <th key={h} className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
                        style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {proposal.lineItems.map((li, i) => (
                    <tr key={li.id} style={{ borderBottom: "1px solid var(--rtm-border-light)", background: i % 2 === 0 ? "var(--rtm-bg)" : "var(--rtm-surface)" }}>
                      <td className="px-3 py-2 font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{li.name}</td>
                      <td className="px-3 py-2 whitespace-nowrap"><CategoryBadge category={li.category} /></td>
                      <td className="px-3 py-2 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{li.quantity}</td>
                      <td className="px-3 py-2 whitespace-nowrap font-bold" style={{ color: "var(--rtm-text-primary)" }}>{fmtFull(li.unitPrice)}</td>
                      <td className="px-3 py-2 whitespace-nowrap" style={{ color: "#DC2626" }}>{li.customDiscount > 0 ? `${li.customDiscount}%` : "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap font-bold" style={{ color: "#059669" }}>{fmtFull(li.unitPrice * li.quantity * (1 - li.customDiscount / 100))}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background: li.billingType === "Monthly Recurring" ? "#EFF6FF" : "#FFF7ED", color: li.billingType === "Monthly Recurring" ? "#1D4ED8" : "#C2410C" }}>
                          {li.billingType}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{li.workloadHours}h</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#F5F3FF", color: "#6D28D9" }}>{li.taskTemplate}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {proposal.notes && (
            <div className="rounded-xl border p-4" style={{ background: "#F5F3FF", borderColor: "#DDD6FE" }}>
              <p className="text-xs font-bold mb-1" style={{ color: "#6D28D9" }}>📝 Notes</p>
              <p className="text-xs" style={{ color: "#7C3AED" }}>{proposal.notes}</p>
            </div>
          )}

          {Object.values(proposal.auditFindings).some(Boolean) && (
            <div className="rounded-xl border p-4" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
              <p className="text-xs font-bold mb-2" style={{ color: "#92400E" }}>🔍 Audit Findings</p>
              <div className="space-y-1">
                {Object.entries(proposal.auditFindings).filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="text-[11px]">
                    <span className="font-semibold capitalize" style={{ color: "#92400E" }}>{k.replace(/([A-Z])/g, " $1")}: </span>
                    <span style={{ color: "#A16207" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Default preloaded builder items
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_BUILDER_ITEMS: ProposalLineItem[] = [
  buildProposalLineItem("li-001"),   // SEO Setup & Onboarding (One-Time)
  buildProposalLineItem("li-002"),   // SEO Monthly Management (Recurring)
  buildProposalLineItem("li-003"),   // GBP Optimization (Recurring)
  buildProposalLineItem("li-011"),   // Reporting Dashboard Setup (One-Time)
];

// ─────────────────────────────────────────────────────────────────────────────
// Selected Proposal Line Items Section
// ─────────────────────────────────────────────────────────────────────────────

function SelectedLineItemsSection({
  lineItems,
  onUpdateQuantity,
  onUpdateDiscount,
  onRemove,
}: {
  lineItems: ProposalLineItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onUpdateDiscount: (id: string, d: number) => void;
  onRemove: (id: string) => void;
}) {
  const setupItems = lineItems.filter((li) => li.billingType === "One-Time");
  const recurringItems = lineItems.filter(
    (li) => li.billingType === "Monthly Recurring" || li.billingType === "Quarterly" || li.billingType === "Annual"
  );

  const setupTotal = setupItems.reduce((s, li) => s + li.unitPrice * li.quantity * (1 - li.customDiscount / 100), 0);
  const recurringTotal = recurringItems.reduce((s, li) => s + li.unitPrice * li.quantity * (1 - li.customDiscount / 100), 0);
  const totalWorkload = lineItems.reduce((s, li) => s + li.workloadHours * li.quantity, 0);

  const renderTable = (items: ProposalLineItem[], kind: "setup" | "recurring") => (
    <div className="overflow-x-auto rounded-xl border" style={{ borderColor: kind === "setup" ? "#FED7AA" : "#BFDBFE" }}>
      <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: kind === "setup" ? "#FFF7ED" : "#EFF6FF", borderBottom: `1px solid ${kind === "setup" ? "#FED7AA" : "#BFDBFE"}` }}>
            {["Line Item", "Billing Type", "Quantity", "Unit Price", "Discount", "Subtotal", "Workload Hours", "Task Template", "Actions"].map((h) => (
              <th key={h} className="text-left px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
                style={{ color: kind === "setup" ? "#C2410C" : "#1D4ED8" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((li, i) => {
            const sub = li.unitPrice * li.quantity * (1 - li.customDiscount / 100);
            return (
              <tr key={li.id} style={{ borderBottom: "1px solid var(--rtm-border-light)", background: i % 2 === 0 ? "var(--rtm-bg)" : "var(--rtm-surface)" }}>
                <td className="px-3 py-2.5">
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <CategoryBadge category={li.category} />
                      <span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{li.name}</span>
                    </div>
                    <p className="text-[10px] pl-0.5" style={{ color: "var(--rtm-text-muted)" }}>{li.department}</p>
                  </div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                    style={{ background: li.billingType === "Monthly Recurring" ? "#EFF6FF" : "#FFF7ED", color: li.billingType === "Monthly Recurring" ? "#1D4ED8" : "#C2410C" }}>
                    {li.billingType}
                  </span>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <button onClick={() => onUpdateQuantity(li.id, Math.max(1, li.quantity - 1))}
                      className="w-6 h-6 rounded border text-xs font-bold flex items-center justify-center"
                      style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>−</button>
                    <span className="w-8 text-center font-bold" style={{ color: "var(--rtm-text-primary)" }}>{li.quantity}</span>
                    <button onClick={() => onUpdateQuantity(li.id, li.quantity + 1)}
                      className="w-6 h-6 rounded border text-xs font-bold flex items-center justify-center"
                      style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>+</button>
                  </div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                  {fmtFull(li.unitPrice)}
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <input
                      type="number" min={0} max={100} value={li.customDiscount}
                      onChange={(e) => onUpdateDiscount(li.id, Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                      className="w-12 text-center text-xs rounded border px-1 py-1 focus:outline-none"
                      style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
                    />
                    <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>%</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap font-bold" style={{ color: kind === "setup" ? "#C2410C" : "#1D4ED8" }}>
                  {fmtFull(sub)}{kind === "recurring" ? "/mo" : ""}
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>
                  {li.workloadHours * li.quantity}h
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#F5F3FF", color: "#6D28D9" }}>
                    {li.taskTemplate}
                  </span>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <button onClick={() => onRemove(li.id)}
                    className="text-[10px] font-bold px-2 py-1 rounded border transition-all"
                    style={{ background: "#FFF1F2", color: "#BE123C", borderColor: "#FECDD3" }}>
                    Remove
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ background: kind === "setup" ? "#FFF7ED" : "#EFF6FF", borderTop: `2px solid ${kind === "setup" ? "#FED7AA" : "#BFDBFE"}` }}>
            <td colSpan={5} className="px-3 py-2.5 text-xs font-bold" style={{ color: kind === "setup" ? "#C2410C" : "#1D4ED8" }}>
              {kind === "setup" ? "🔧 Setup Fees Total" : "🔁 Monthly Recurring Total"}
            </td>
            <td className="px-3 py-2.5 text-sm font-black" style={{ color: kind === "setup" ? "#C2410C" : "#1D4ED8" }}>
              {fmtFull(kind === "setup" ? setupTotal : recurringTotal)}{kind === "recurring" ? "/mo" : ""}
            </td>
            <td className="px-3 py-2.5 text-xs font-bold" style={{ color: kind === "setup" ? "#C2410C" : "#1D4ED8" }}>
              {items.reduce((s, li) => s + li.workloadHours * li.quantity, 0)}h
            </td>
            <td colSpan={2} />
          </tr>
        </tfoot>
      </table>
    </div>
  );

  if (lineItems.length === 0) {
    return (
      <div className="text-center py-8 rounded-xl border border-dashed" style={{ borderColor: "var(--rtm-border)" }}>
        <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-muted)" }}>No line items selected yet.</p>
        <p className="text-xs mt-1" style={{ color: "var(--rtm-text-muted)" }}>Use the Line Item Catalog below to add items to this proposal.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {setupItems.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold" style={{ color: "#C2410C" }}>🔧 Setup Fees</p>
            <span className="text-sm font-black" style={{ color: "#C2410C" }}>{fmtFull(setupTotal)}</span>
          </div>
          {renderTable(setupItems, "setup")}
        </div>
      )}

      {recurringItems.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold" style={{ color: "#1D4ED8" }}>🔁 Monthly Recurring</p>
            <span className="text-sm font-black" style={{ color: "#1D4ED8" }}>{fmtFull(recurringTotal)}/mo</span>
          </div>
          {renderTable(recurringItems, "recurring")}
        </div>
      )}

      <div className="rounded-xl border p-3 flex flex-wrap gap-4" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}>
        <div className="text-center">
          <p className="text-[10px] font-semibold" style={{ color: "var(--rtm-text-muted)" }}>Total Line Items</p>
          <p className="text-sm font-black" style={{ color: "var(--rtm-text-primary)" }}>{lineItems.length}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-semibold" style={{ color: "#C2410C" }}>Setup Fees</p>
          <p className="text-sm font-black" style={{ color: "#C2410C" }}>{fmtFull(setupTotal)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-semibold" style={{ color: "#1D4ED8" }}>Monthly Recurring</p>
          <p className="text-sm font-black" style={{ color: "#1D4ED8" }}>{fmtFull(recurringTotal)}/mo</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-semibold" style={{ color: "#6D28D9" }}>Total Workload</p>
          <p className="text-sm font-black" style={{ color: "#6D28D9" }}>{totalWorkload}h/mo</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dependencies Section (per selected item)
// ─────────────────────────────────────────────────────────────────────────────

function DependenciesSection({ lineItems }: { lineItems: ProposalLineItem[] }) {
  if (lineItems.length === 0) return null;

  const DEP_STATUS_ICON: Record<DependencyStatus, string> = {
    Required: "⚠️",
    Missing: "❌",
    Satisfied: "✅",
    Blocked: "🚫",
  };

  return (
    <SectionCard title="🔗 Dependencies & Prerequisites">
      <p className="text-xs mb-4" style={{ color: "var(--rtm-text-muted)" }}>
        Prerequisites required before each selected line item can be activated.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {lineItems.map((li) => (
          <div key={li.id} className="rounded-xl border p-3"
            style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}>
            <div className="flex items-center gap-2 mb-2">
              <CategoryBadge category={li.category} />
              <p className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>{li.name}</p>
            </div>
            {li.prerequisites.length === 0 ? (
              <p className="text-[11px]" style={{ color: "#15803D" }}>✅ No prerequisites required</p>
            ) : (
              <div className="space-y-1">
                {li.prerequisites.map((p) => {
                  const c = DEP_STATUS_COLORS[p.status];
                  return (
                    <div key={p.name}
                      className="flex items-center justify-between rounded px-2 py-1.5 text-[11px]"
                      style={{ background: c.bg, border: `1px solid ${c.bg}` }}>
                      <div className="flex items-center gap-1">
                        <span>{DEP_STATUS_ICON[p.status]}</span>
                        <span style={{ color: c.text }}>{p.name}</span>
                      </div>
                      <DepStatusBadge status={p.status} />
                    </div>
                  );
                })}
              </div>
            )}
            {li.dependencies.length > 0 && (
              <div className="mt-2 pt-2 border-t" style={{ borderColor: "var(--rtm-border-light)" }}>
                <p className="text-[10px] font-bold mb-1" style={{ color: "var(--rtm-text-muted)" }}>Depends on:</p>
                <div className="flex flex-wrap gap-1">
                  {li.dependencies.map((d) => (
                    <span key={d} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#FFF7ED", color: "#C2410C", border: "1px solid #FED7AA" }}>
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pricing Summary with Contract Term
// ─────────────────────────────────────────────────────────────────────────────

function PricingSummarySection({
  lineItems,
  discountType,
  discountAmount,
}: {
  lineItems: ProposalLineItem[];
  discountType: DiscountType;
  discountAmount: number;
}) {
  const [term, setTerm] = useState<ContractTerm>("12 Months");
  const [customMonths, setCustomMonths] = useState(12);

  const totals = calcProposalTotals(lineItems, discountType, discountAmount);
  const months = termToMonths(term, customMonths);
  const totalContractValue = totals.setupFees + totals.monthlyRecurring * months - totals.discountValue;

  const rows = [
    { label: "Setup Fees Total", value: fmtFull(totals.setupFees), color: "#C2410C", bg: "#FFF7ED", border: "#FED7AA", icon: "🔧" },
    { label: "Monthly Recurring Total", value: `${fmtFull(totals.monthlyRecurring)}/mo`, color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE", icon: "🔁" },
    { label: "Discount Total", value: totals.discountValue > 0 ? `-${fmtFull(totals.discountValue)}` : "—", color: "#DC2626", bg: "#FFF1F2", border: "#FECDD3", icon: "🏷️" },
    { label: "Final Monthly Value", value: fmtFull(totals.monthlyRecurring - (discountType === "Percentage" ? totals.monthlyRecurring * discountAmount / 100 : 0)), color: "#059669", bg: "#F0FDF4", border: "#A7F3D0", icon: "💵" },
    { label: "Contract Term", value: term === "Custom" ? `${customMonths} months` : term, color: "#6D28D9", bg: "#F5F3FF", border: "#DDD6FE", icon: "📅" },
    { label: "Total Contract Value", value: fmtFull(Math.max(0, totalContractValue)), color: "#047857", bg: "#ECFDF5", border: "#A7F3D0", icon: "💰" },
    { label: "Internal Cost", value: fmtFull(totals.totalInternalCost), color: "#92400E", bg: "#FFFBEB", border: "#FDE68A", icon: "🏭" },
    { label: "Estimated Margin", value: `${totals.estimatedMargin.toFixed(1)}%`, color: totals.estimatedMargin >= 55 ? "#059669" : totals.estimatedMargin >= 45 ? "#D97706" : "#DC2626", bg: totals.estimatedMargin >= 55 ? "#F0FDF4" : totals.estimatedMargin >= 45 ? "#FFFBEB" : "#FFF1F2", border: totals.estimatedMargin >= 55 ? "#A7F3D0" : totals.estimatedMargin >= 45 ? "#FDE68A" : "#FECDD3", icon: "📊" },
    { label: "Workload Hours", value: `${totals.totalWorkload}h/mo`, color: "#0369A1", bg: "#F0F9FF", border: "#BAE6FD", icon: "⏱️" },
  ];

  return (
    <SectionCard title="💰 Pricing Summary" accent="#A7F3D0">
      <div className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>Contract Term</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {CONTRACT_TERMS.map((t) => (
            <button key={t} onClick={() => setTerm(t)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all"
              style={{
                background: term === t ? "#EFF6FF" : "var(--rtm-surface)",
                color: term === t ? "#1D4ED8" : "var(--rtm-text-secondary)",
                borderColor: term === t ? "#BFDBFE" : "var(--rtm-border)",
              }}>
              {t}
            </button>
          ))}
        </div>
        {term === "Custom" && (
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>Months:</span>
            <input type="number" min={1} max={120} value={customMonths}
              onChange={(e) => setCustomMonths(Math.max(1, parseInt(e.target.value) || 1))}
              className="text-xs rounded-lg border px-3 py-1.5 focus:outline-none w-24"
              style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-4">
        {rows.map((r) => (
          <div key={r.label} className="rounded-xl border p-3 text-center"
            style={{ background: r.bg, borderColor: r.border }}>
            <div className="text-base mb-0.5">{r.icon}</div>
            <p className="text-[10px] font-semibold leading-tight" style={{ color: r.color }}>{r.label}</p>
            <p className="text-sm font-black mt-0.5" style={{ color: r.color }}>{r.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border p-3" style={{ background: "#F5F3FF", borderColor: "#DDD6FE" }}>
        <p className="text-[10px] font-bold mb-1" style={{ color: "#6D28D9" }}>Contract Value Formula</p>
        <p className="text-xs" style={{ color: "#7C3AED" }}>
          {fmtFull(totals.setupFees)} (Setup) + ({fmtFull(totals.monthlyRecurring)}/mo × {months} months) − {fmtFull(totals.discountValue)} (Discounts) = <strong>{fmtFull(Math.max(0, totalContractValue))}</strong>
        </p>
      </div>

      {totals.estimatedMargin < 45 && (
        <div className="mt-3 rounded-lg border p-2" style={{ background: "#FFF1F2", borderColor: "#FECDD3" }}>
          <p className="text-[10px] font-bold" style={{ color: "#BE123C" }}>
            ⚠️ Margin Alert: Estimated margin ({totals.estimatedMargin.toFixed(1)}%) is below the 45% threshold. Finance review required before sending.
          </p>
        </div>
      )}
    </SectionCard>
  );
}

export default function SalesProposalsPage() {
  const [activeTab, setActiveTab] = useState<"builder" | "proposals" | "catalog" | "ai" | "budget" | "contracts">("builder");
  const [builderLineItems, setBuilderLineItems] = useState<ProposalLineItem[]>(DEFAULT_BUILDER_ITEMS);
  const [builderDiscount, setBuilderDiscount] = useState<DiscountType>("Percentage");
  const [builderDiscountAmount, setBuilderDiscountAmount] = useState(0);
  const [builderPromo, setBuilderPromo] = useState("");
  const [builderStage, setBuilderStage] = useState<ProposalStage>("Draft");
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [selectedContract, setSelectedContract] = useState<ContractData | null>(null);

  const addToBuilder = (item: LineItemCatalog) => {
    setBuilderLineItems((prev) => {
      if (prev.find((li) => li.id === item.id)) return prev;
      const pli: ProposalLineItem = { ...item, quantity: 1, customDiscount: 0, subtotal: item.unitPrice, note: "" };
      return [...prev, pli];
    });
    setActiveTab("builder");
  };

  const updateQuantity = (id: string, qty: number) => {
    setBuilderLineItems((prev) => prev.map((li) => li.id === id ? { ...li, quantity: qty, subtotal: li.unitPrice * qty * (1 - li.customDiscount / 100) } : li));
  };

  const updateDiscount = (id: string, d: number) => {
    setBuilderLineItems((prev) => prev.map((li) => li.id === id ? { ...li, customDiscount: d, subtotal: li.unitPrice * li.quantity * (1 - d / 100) } : li));
  };

  const removeItem = (id: string) => {
    setBuilderLineItems((prev) => prev.filter((li) => li.id !== id));
  };

  const acceptItems = (items: LineItemCatalog[]) => {
    const plis: ProposalLineItem[] = items
      .filter((item) => !builderLineItems.find((li) => li.id === item.id))
      .map((item) => ({ ...item, quantity: 1, customDiscount: 0, subtotal: item.unitPrice, note: "" }));
    setBuilderLineItems((prev) => [...prev, ...plis]);
    setActiveTab("builder");
  };

  const tabs = [
    { key: "builder" as const, label: "🛒 Proposal Builder", badge: builderLineItems.length > 0 ? builderLineItems.length : undefined },
    { key: "proposals" as const, label: "📋 Proposals" },
    { key: "contracts" as const, label: "📄 Contract Generator", badge: MOCK_CONTRACTS.length },
    { key: "catalog" as const, label: "📦 Line Item Catalog" },
    { key: "budget" as const, label: "💡 Build From Budget" },
    { key: "ai" as const, label: "🤖 AI Recommendations" },
  ];

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "#1D4ED8" }}>Sales</p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Proposal & Contract Generator</h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          Build proposals, generate contracts, manage signatures, map billing, activate departments, and plan renewals — all in one workflow.
        </p>
      </div>

      {/* ── Workflow Stepper ── */}
      <WorkflowStepper currentStep={activeTab === "contracts" ? 4 : activeTab === "builder" ? 1 : activeTab === "proposals" ? 2 : 1} />

      {/* ── Action Bar ── */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => { setBuilderLineItems([]); setBuilderDiscount("Percentage"); setBuilderDiscountAmount(0); setBuilderPromo(""); setActiveTab("builder"); }}
          className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
          style={{ background: "#1D4ED8", color: "#fff" }}>
          + New Proposal
        </button>
        <button onClick={() => setActiveTab("contracts")}
          className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all"
          style={{ background: "#F5F3FF", color: "#6D28D9", borderColor: "#DDD6FE" }}>
          📄 Contract Generator
        </button>
        <button onClick={() => setActiveTab("catalog")}
          className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all"
          style={{ background: "#F0F9FF", color: "#0369A1", borderColor: "#BAE6FD" }}>
          📦 Line Item Catalog
        </button>
        <button onClick={() => setActiveTab("budget")}
          className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all"
          style={{ background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" }}>
          💡 Build From Budget
        </button>
        <button onClick={() => setActiveTab("ai")}
          className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all"
          style={{ background: "#F5F3FF", color: "#6D28D9", borderColor: "#DDD6FE" }}>
          🤖 AI Recommendations
        </button>
        <Link href="/finance/line-items"
          className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all inline-flex items-center"
          style={{ background: "#ECFDF5", color: "#047857", borderColor: "#A7F3D0" }}>
          🔒 Finance Pricing →
        </Link>
      </div>

      {/* ── KPI Cards ── */}
      <KpiCards />

      {/* ── Finance Notice ── */}
      <div className="rounded-xl border p-4" style={{ background: "#F0F9FF", borderColor: "#BAE6FD" }}>
        <div className="flex items-start gap-3">
          <span className="text-lg">🔒</span>
          <div>
            <p className="text-xs font-bold" style={{ color: "#0369A1" }}>Finance-Controlled Pricing</p>
            <p className="text-xs mt-0.5" style={{ color: "#0369A1" }}>
              Base pricing, workload hours, internal cost, and margin targets are owned by Finance. Sales may select line items, adjust quantity, and apply approved discounts.
              Pricing changes require Finance approval via{" "}
              <Link href="/finance/line-items" className="font-bold underline">/finance/line-items</Link>.
            </p>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex overflow-x-auto rounded-xl border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className="flex items-center gap-1.5 px-5 py-3 text-sm font-semibold whitespace-nowrap transition-colors relative"
            style={{
              color: activeTab === t.key ? "#1D4ED8" : "var(--rtm-text-muted)",
              borderBottom: activeTab === t.key ? "2px solid #1D4ED8" : "2px solid transparent",
            }}>
            {t.label}
            {t.badge !== undefined && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#1D4ED8", color: "#fff" }}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="space-y-6">

        {activeTab === "builder" && (
          <>
            {/* ── Selected Proposal Line Items ── */}
            <SectionCard title="🛒 Selected Proposal Line Items">
              <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
                <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                  {builderLineItems.length} line item{builderLineItems.length !== 1 ? "s" : ""} selected.
                  {builderLineItems.length === 0 && " Add items from the Line Item Catalog below."}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setActiveTab("catalog")}
                    className="text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all"
                    style={{ background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" }}>
                    + Add from Catalog
                  </button>
                  {builderLineItems.length > 0 && (
                    <button onClick={() => setBuilderLineItems([])}
                      className="text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all"
                      style={{ background: "#FFF1F2", color: "#BE123C", borderColor: "#FECDD3" }}>
                      Clear All
                    </button>
                  )}
                </div>
              </div>
              <SelectedLineItemsSection
                lineItems={builderLineItems}
                onUpdateQuantity={updateQuantity}
                onUpdateDiscount={updateDiscount}
                onRemove={removeItem}
              />
            </SectionCard>

            {/* ── Pricing Summary ── */}
            {builderLineItems.length > 0 && (
              <PricingSummarySection
                lineItems={builderLineItems}
                discountType={builderDiscount}
                discountAmount={builderDiscountAmount}
              />
            )}

            {/* ── Discount Section (inline) ── */}
            {builderLineItems.length > 0 && (
              <SectionCard title="🏷️ Promo Code & Discounts">
                <div className="flex flex-wrap gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>Promo Code</label>
                    <input type="text" value={builderPromo} onChange={(e) => setBuilderPromo(e.target.value)}
                      placeholder="e.g. LAUNCH20"
                      className="text-xs rounded-lg border px-3 py-1.5 focus:outline-none w-36"
                      style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>Discount Type</label>
                    <select value={builderDiscount} onChange={(e) => setBuilderDiscount(e.target.value as DiscountType)}
                      className="text-xs rounded-lg border px-3 py-1.5 focus:outline-none"
                      style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}>
                      <option value="Percentage">Percentage</option>
                      <option value="Fixed Amount">Fixed Amount</option>
                      <option value="Line Item Discount">Line Item Discount</option>
                      <option value="Package Discount">Package Discount</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>
                      {builderDiscount === "Fixed Amount" ? "Discount ($)" : "Discount (%)"}
                    </label>
                    <input type="number" min={0} value={builderDiscountAmount}
                      onChange={(e) => setBuilderDiscountAmount(parseFloat(e.target.value) || 0)}
                      className="text-xs rounded-lg border px-3 py-1.5 focus:outline-none w-24"
                      style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }} />
                  </div>
                  {builderPromo && (
                    <div className="flex items-end">
                      <span className="text-[10px] font-bold px-2 py-1.5 rounded-lg" style={{ background: "#F0FDF4", color: "#15803D", border: "1px solid #A7F3D0" }}>
                        ✅ Code Applied: {builderPromo}
                      </span>
                    </div>
                  )}
                </div>
              </SectionCard>
            )}

            {/* ── Dependencies ── */}
            <DependenciesSection lineItems={builderLineItems} />

            {/* ── Line Item Catalog (inline in builder) ── */}
            <SectionCard title="📦 Line Item Catalog — Add to Proposal">
              <div className="rounded-lg border p-3 mb-4" style={{ background: "#F0F9FF", borderColor: "#BAE6FD" }}>
                <p className="text-xs" style={{ color: "#0369A1" }}>
                  🔒 <strong>Finance-Approved Pricing.</strong> Only Approved items can be freely added. Items with ⚠️ Pending Review or ❌ Needs Pricing require Finance sign-off before including in a proposal.
                </p>
              </div>
              <LineItemCatalogSection onAddToProposal={addToBuilder} />
            </SectionCard>

            {/* ── Tasklist Mapping ── */}
            <TasklistMappingSection lineItems={builderLineItems} />

            {/* ── Approval & Handoff ── */}
            <ApprovalHandoffPanel
              lineItems={builderLineItems}
              stage={builderStage}
              onStageChange={setBuilderStage}
            />
            <ProposalTemplatePlaceholder />
          </>
        )}

        {activeTab === "proposals" && (
          <ProposalListSection onOpen={setSelectedProposal} />
        )}

        {activeTab === "contracts" && (
          selectedContract ? (
            <ContractGeneratorView
              contract={selectedContract}
              onBack={() => setSelectedContract(null)}
            />
          ) : (
            <ContractListSection onOpen={setSelectedContract} />
          )
        )}

        {activeTab === "catalog" && (
          <LineItemCatalogSection onAddToProposal={addToBuilder} />
        )}

        {activeTab === "budget" && (
          <BuildFromBudgetSection onAcceptRecommendation={acceptItems} />
        )}

        {activeTab === "ai" && (
          <AIAuditRecommendationSection onAcceptPackage={acceptItems} />
        )}
      </div>

      {/* ── Footer Links ── */}
      <div className="flex gap-2 flex-wrap pt-2">
        <Link href="/sales" className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>
          ← Sales Dashboard
        </Link>
        <Link href="/sales/handoffs" className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all"
          style={{ background: "#ECFDF5", borderColor: "#A7F3D0", color: "#047857" }}>
          🚀 Handoff Center →
        </Link>
        <Link href="/finance/line-items" className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all"
          style={{ background: "#F0F9FF", borderColor: "#BAE6FD", color: "#0369A1" }}>
          🔒 Finance Line Items →
        </Link>
        <Link href="/tasks" className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>
          Tasks →
        </Link>
        <Link href="/admin/workflows" className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>
          Workflows →
        </Link>
      </div>

      {/* ── Proposal Detail Modal ── */}
      {selectedProposal && (
        <ProposalDetailModal proposal={selectedProposal} onClose={() => setSelectedProposal(null)} />
      )}

    </div>
  );
}