"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// Activation Engine
// Route: /tasks/activation-engine
// Turns signed contracts and paid invoices into activated projects, task blueprints,
// department workload, and onboarding handoffs.
// Belongs to: Projects & Tasks → Activation Engine
// ─────────────────────────────────────────────────────────────────────────────

// ── Types ─────────────────────────────────────────────────────────────────────

type ActivationStatus =
  | "Not Ready"
  | "Ready for Activation"
  | "Rules Matched"
  | "Generating Tasks"
  | "Department Activation Pending"
  | "Activated"
  | "Blocked"
  | "Failed";

type ContractStatus = "Signed" | "Pending Signature" | "Expired" | "Draft";
type InvoiceStatus = "Paid" | "Pending Payment" | "Overdue" | "Draft";
type Priority = "High" | "Medium" | "Low";

type Department =
  | "SEO"
  | "GBP"
  | "Paid Advertising"
  | "Meta Ads"
  | "LSA"
  | "Reporting"
  | "Web Development"
  | "Creative"
  | "Account Management";

type BlockedReason =
  | "Missing Contract Signature"
  | "Invoice Not Paid"
  | "Missing Client Access"
  | "Missing Task Template"
  | "Missing Department Owner"
  | "Dependency Not Satisfied"
  | null;

// Line Item SLA — primary source for all SLA dates
interface LineItemSLA {
  firstResponseSLA: string;
  targetCompletionDays: number;
  escalationAfterDays: number;
  slaPriority: "Standard" | "Priority" | "Rush" | "Custom";
  slaStatus: "Active" | "Pending Review" | "Needs Approval" | "Inactive";
}

// SLA dates generated from line item at activation time
interface GeneratedSLADates {
  firstResponseDue: string;    // e.g. "2025-07-26"
  targetCompletionDate: string; // e.g. "2025-07-31"
  escalationDate: string;       // e.g. "2025-08-02"
  slaStatus: string;
}

interface LineItem {
  name: string;
  billingType: "Setup" | "Monthly" | "One-Time" | "Performance";
  quantity: number;
  setupFee: number;
  monthlyFee: number;
  department: Department;
  taskTemplate: string;
  activationRule: string;
  lineItemSLA: LineItemSLA;
  generatedSLADates?: GeneratedSLADates;
}

interface GeneratedTask {
  taskName: string;
  department: Department;
  ownerRole: string;
  priority: Priority;
  dueOffset: string;
  targetCompletionDays: number;
  status: "Pending" | "Active" | "Complete" | "Blocked";
}

interface DepartmentWorkload {
  department: Department;
  activatedLineItems: string[];
  taskCount: number;
  targetCompletionDays: number;
  owner: string;
  status: "Active" | "Pending" | "Not Activated";
}

interface TimelineEvent {
  date: string;
  event: string;
  actor: string;
  detail?: string;
}

interface ActivationCase {
  id: string;
  client: string;
  clientSlug: string;
  contractStatus: ContractStatus;
  invoiceStatus: InvoiceStatus;
  lineItems: LineItem[];
  matchedRules: string[];
  taskTemplates: string[];
  departments: Department[];
  activationStatus: ActivationStatus;
  blockedReason: BlockedReason;
  nextAction: string;
  priority: Priority;
  activatedAt: string | null;
  contractValue: number;
  setupRevenue: number;
  monthlyRevenue: number;
  generatedTasks: GeneratedTask[];
  departmentWorkload: DepartmentWorkload[];
  timeline: TimelineEvent[];
  notes: string;
  contractRef: string;
  invoiceRef: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const ACTIVATION_CASES: ActivationCase[] = [
  // 1 — Ready for Activation
  {
    id: "ae-001",
    client: "Horizon Dental Group",
    clientSlug: "horizon-dental-group",
    contractStatus: "Signed",
    invoiceStatus: "Paid",
    lineItems: [
      { name: "SEO Setup", billingType: "Setup", quantity: 1, setupFee: 750, monthlyFee: 0, department: "SEO", taskTemplate: "SEO Setup Template", activationRule: "SEO Setup — Invoice Paid", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 5, escalationAfterDays: 7, slaPriority: "Standard", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-26", targetCompletionDate: "2025-07-31", escalationDate: "2025-08-02", slaStatus: "Active" } },
      { name: "SEO Monthly", billingType: "Monthly", quantity: 1, setupFee: 0, monthlyFee: 1200, department: "SEO", taskTemplate: "SEO Monthly Template", activationRule: "SEO Monthly — Client Activated", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 10, escalationAfterDays: 14, slaPriority: "Standard", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-26", targetCompletionDate: "2025-08-05", escalationDate: "2025-08-09", slaStatus: "Active" } },
      { name: "GBP Optimization", billingType: "Setup", quantity: 1, setupFee: 500, monthlyFee: 0, department: "GBP", taskTemplate: "GBP Launch Template", activationRule: "GBP Launch — Invoice Paid", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 3, escalationAfterDays: 5, slaPriority: "Standard", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-26", targetCompletionDate: "2025-07-29", escalationDate: "2025-07-31", slaStatus: "Active" } },
    ],
    matchedRules: ["SEO Setup — Invoice Paid", "GBP Launch — Invoice Paid", "Client Onboarding — Invoice Paid"],
    taskTemplates: ["SEO Setup Template", "GBP Launch Template", "AM Onboarding Template"],
    departments: ["SEO", "GBP", "Account Management"],
    activationStatus: "Ready for Activation",
    blockedReason: null,
    nextAction: "Run Activation",
    priority: "High",
    activatedAt: null,
    contractValue: 14400,
    setupRevenue: 1250,
    monthlyRevenue: 1200,
    contractRef: "CTR-2025-0041",
    invoiceRef: "INV-2025-0088",
    generatedTasks: [
      { taskName: "Website Access", department: "SEO", ownerRole: "SEO Specialist", priority: "High", dueOffset: "Day 1", targetCompletionDays: 1, status: "Pending" },
      { taskName: "Technical Audit", department: "SEO", ownerRole: "SEO Lead", priority: "High", dueOffset: "Day 3", targetCompletionDays: 5, status: "Pending" },
      { taskName: "GBP Claim & Verify", department: "GBP", ownerRole: "GBP Specialist", priority: "High", dueOffset: "Day 2", targetCompletionDays: 2, status: "Pending" },
      { taskName: "Onboarding Call", department: "Account Management", ownerRole: "Account Manager", priority: "High", dueOffset: "Day 1", targetCompletionDays: 1, status: "Pending" },
    ],
    departmentWorkload: [
      { department: "SEO", activatedLineItems: ["SEO Setup", "SEO Monthly"], taskCount: 6, targetCompletionDays: 14, owner: "Sarah K.", status: "Pending" },
      { department: "GBP", activatedLineItems: ["GBP Optimization"], taskCount: 6, targetCompletionDays: 10, owner: "Marcus L.", status: "Pending" },
      { department: "Account Management", activatedLineItems: ["Client Onboarding"], taskCount: 4, targetCompletionDays: 5, owner: "Jenna P.", status: "Pending" },
    ],
    timeline: [
      { date: "2025-07-25", event: "Invoice Paid", actor: "Billing System", detail: "INV-2025-0088 — $1,250" },
      { date: "2025-07-24", event: "Contract Signed", actor: "DocuSign", detail: "CTR-2025-0041" },
      { date: "2025-07-23", event: "Proposal Approved", actor: "Sales", detail: "Horizon Dental Group" },
    ],
    notes: "Client prefers onboarding call on Tuesdays. Referred by Dr. Martin.",
  },
  // 2 — Pending Signature
  {
    id: "ae-002",
    client: "Maple Ridge Physical Therapy",
    clientSlug: "maple-ridge-physical-therapy",
    contractStatus: "Pending Signature",
    invoiceStatus: "Draft",
    lineItems: [
      { name: "SEO Setup", billingType: "Setup", quantity: 1, setupFee: 750, monthlyFee: 0, department: "SEO", taskTemplate: "SEO Setup Template", activationRule: "SEO Setup — Invoice Paid", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 5, escalationAfterDays: 7, slaPriority: "Standard", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-26", targetCompletionDate: "2025-07-31", escalationDate: "2025-08-02", slaStatus: "Active" } },
      { name: "Meta Ads Setup", billingType: "Setup", quantity: 1, setupFee: 600, monthlyFee: 0, department: "Meta Ads", taskTemplate: "Meta Ads Launch Template", activationRule: "Meta Ads — Invoice Paid", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 5, escalationAfterDays: 7, slaPriority: "Standard", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-26", targetCompletionDate: "2025-07-31", escalationDate: "2025-08-02", slaStatus: "Active" } },
      { name: "Meta Ads Monthly", billingType: "Monthly", quantity: 1, setupFee: 0, monthlyFee: 900, department: "Meta Ads", taskTemplate: "Meta Ads Monthly Template", activationRule: "Meta Ads Monthly — Client Activated", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 10, escalationAfterDays: 14, slaPriority: "Standard", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-26", targetCompletionDate: "2025-08-05", escalationDate: "2025-08-09", slaStatus: "Active" } },
    ],
    matchedRules: [],
    taskTemplates: [],
    departments: ["SEO", "Meta Ads"],
    activationStatus: "Not Ready",
    blockedReason: "Missing Contract Signature",
    nextAction: "Follow up on contract signature",
    priority: "High",
    activatedAt: null,
    contractValue: 11400,
    setupRevenue: 1350,
    monthlyRevenue: 900,
    contractRef: "CTR-2025-0044",
    invoiceRef: "INV-2025-0092",
    generatedTasks: [],
    departmentWorkload: [],
    timeline: [
      { date: "2025-07-24", event: "Contract Sent", actor: "Sales", detail: "DocuSign link sent to owner" },
      { date: "2025-07-23", event: "Proposal Approved", actor: "Sales" },
    ],
    notes: "Contract sent 7/24 — follow up 7/28 if not signed.",
  },
  // 3 — Pending Payment
  {
    id: "ae-003",
    client: "Sunrise Chiropractic",
    clientSlug: "sunrise-chiropractic",
    contractStatus: "Signed",
    invoiceStatus: "Pending Payment",
    lineItems: [
      { name: "Paid Advertising Setup", billingType: "Setup", quantity: 1, setupFee: 850, monthlyFee: 0, department: "Paid Advertising", taskTemplate: "PPC Setup Template", activationRule: "PPC Setup — Invoice Paid", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 4, escalationAfterDays: 6, slaPriority: "Priority", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-26", targetCompletionDate: "2025-07-30", escalationDate: "2025-08-01", slaStatus: "Active" } },
      { name: "PPC Monthly Management", billingType: "Monthly", quantity: 1, setupFee: 0, monthlyFee: 1500, department: "Paid Advertising", taskTemplate: "PPC Monthly Template", activationRule: "PPC Monthly — Client Activated", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 12, escalationAfterDays: 15, slaPriority: "Standard", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-26", targetCompletionDate: "2025-08-07", escalationDate: "2025-08-10", slaStatus: "Active" } },
      { name: "Reporting Monthly", billingType: "Monthly", quantity: 1, setupFee: 0, monthlyFee: 250, department: "Reporting", taskTemplate: "Reporting Monthly Template", activationRule: "Reporting Monthly — Client Activated", lineItemSLA: { firstResponseSLA: "2 business days", targetCompletionDays: 7, escalationAfterDays: 10, slaPriority: "Standard", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-27", targetCompletionDate: "2025-08-02", escalationDate: "2025-08-05", slaStatus: "Active" } },
    ],
    matchedRules: [],
    taskTemplates: [],
    departments: ["Paid Advertising", "Reporting"],
    activationStatus: "Not Ready",
    blockedReason: "Invoice Not Paid",
    nextAction: "Collect setup invoice payment",
    priority: "High",
    activatedAt: null,
    contractValue: 18850,
    setupRevenue: 850,
    monthlyRevenue: 1750,
    contractRef: "CTR-2025-0039",
    invoiceRef: "INV-2025-0085",
    generatedTasks: [],
    departmentWorkload: [],
    timeline: [
      { date: "2025-07-25", event: "Invoice Sent", actor: "Billing System", detail: "INV-2025-0085 — $850 due" },
      { date: "2025-07-22", event: "Contract Signed", actor: "DocuSign" },
    ],
    notes: "Invoice sent via Stripe. Follow up if not paid by 7/29.",
  },
  // 4 — Rules Matched
  {
    id: "ae-004",
    client: "ClearPath Law Firm",
    clientSlug: "clearpath-law-firm",
    contractStatus: "Signed",
    invoiceStatus: "Paid",
    lineItems: [
      { name: "LSA Setup", billingType: "Setup", quantity: 1, setupFee: 400, monthlyFee: 0, department: "LSA", taskTemplate: "LSA Setup Template", activationRule: "LSA Setup — Invoice Paid", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 5, escalationAfterDays: 8, slaPriority: "Standard", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-26", targetCompletionDate: "2025-07-31", escalationDate: "2025-08-03", slaStatus: "Active" } },
      { name: "LSA Monthly", billingType: "Monthly", quantity: 1, setupFee: 0, monthlyFee: 600, department: "LSA", taskTemplate: "LSA Monthly Template", activationRule: "LSA Monthly — Client Activated", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 6, escalationAfterDays: 10, slaPriority: "Standard", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-26", targetCompletionDate: "2025-08-01", escalationDate: "2025-08-05", slaStatus: "Active" } },
      { name: "GBP Optimization", billingType: "Setup", quantity: 1, setupFee: 500, monthlyFee: 0, department: "GBP", taskTemplate: "GBP Launch Template", activationRule: "GBP Launch — Invoice Paid", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 3, escalationAfterDays: 5, slaPriority: "Standard", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-26", targetCompletionDate: "2025-07-29", escalationDate: "2025-07-31", slaStatus: "Active" } },
    ],
    matchedRules: ["LSA Setup — Invoice Paid", "GBP Launch — Invoice Paid", "Client Onboarding — Invoice Paid"],
    taskTemplates: ["LSA Setup Template", "GBP Launch Template", "AM Onboarding Template"],
    departments: ["LSA", "GBP", "Account Management"],
    activationStatus: "Rules Matched",
    blockedReason: null,
    nextAction: "Generate Task Templates",
    priority: "High",
    activatedAt: null,
    contractValue: 7800,
    setupRevenue: 900,
    monthlyRevenue: 600,
    contractRef: "CTR-2025-0037",
    invoiceRef: "INV-2025-0081",
    generatedTasks: [],
    departmentWorkload: [],
    timeline: [
      { date: "2025-07-25", event: "Rules Matched", actor: "Activation Engine", detail: "3 rules matched" },
      { date: "2025-07-24", event: "Invoice Paid", actor: "Billing System" },
      { date: "2025-07-23", event: "Contract Signed", actor: "DocuSign" },
    ],
    notes: "LSA account already partially set up by client.",
  },
  // 5 — Generating Tasks
  {
    id: "ae-005",
    client: "Peak Wellness Center",
    clientSlug: "peak-wellness-center",
    contractStatus: "Signed",
    invoiceStatus: "Paid",
    lineItems: [
      { name: "SEO Setup", billingType: "Setup", quantity: 1, setupFee: 750, monthlyFee: 0, department: "SEO", taskTemplate: "SEO Setup Template", activationRule: "SEO Setup — Invoice Paid", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 5, escalationAfterDays: 7, slaPriority: "Standard", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-26", targetCompletionDate: "2025-07-31", escalationDate: "2025-08-02", slaStatus: "Active" } },
      { name: "Web Development", billingType: "Setup", quantity: 1, setupFee: 2500, monthlyFee: 0, department: "Web Development", taskTemplate: "Web Dev Project Template", activationRule: "Web Dev — Invoice Paid", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 14, escalationAfterDays: 18, slaPriority: "Standard", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-26", targetCompletionDate: "2025-08-09", escalationDate: "2025-08-13", slaStatus: "Active" } },
    ],
    matchedRules: ["SEO Setup — Invoice Paid", "Web Dev — Invoice Paid", "Client Onboarding — Invoice Paid"],
    taskTemplates: ["SEO Setup Template", "Web Dev Project Template", "AM Onboarding Template"],
    departments: ["SEO", "Web Development", "Account Management"],
    activationStatus: "Generating Tasks",
    blockedReason: null,
    nextAction: "Assign Department Owners",
    priority: "Medium",
    activatedAt: null,
    contractValue: 3250,
    setupRevenue: 3250,
    monthlyRevenue: 0,
    contractRef: "CTR-2025-0042",
    invoiceRef: "INV-2025-0089",
    generatedTasks: [
      { taskName: "Website Access", department: "SEO", ownerRole: "SEO Specialist", priority: "High", dueOffset: "Day 1", targetCompletionDays: 1, status: "Active" },
      { taskName: "Design Kickoff", department: "Web Development", ownerRole: "Web Developer", priority: "High", dueOffset: "Day 1", targetCompletionDays: 2, status: "Active" },
      { taskName: "Onboarding Call", department: "Account Management", ownerRole: "Account Manager", priority: "High", dueOffset: "Day 1", targetCompletionDays: 1, status: "Active" },
    ],
    departmentWorkload: [
      { department: "SEO", activatedLineItems: ["SEO Setup"], taskCount: 6, targetCompletionDays: 14, owner: "Unassigned", status: "Pending" },
      { department: "Web Development", activatedLineItems: ["Web Development"], taskCount: 8, targetCompletionDays: 40, owner: "Unassigned", status: "Pending" },
      { department: "Account Management", activatedLineItems: ["Client Onboarding"], taskCount: 4, targetCompletionDays: 5, owner: "Unassigned", status: "Pending" },
    ],
    timeline: [
      { date: "2025-07-25", event: "Task Generation Started", actor: "Activation Engine" },
      { date: "2025-07-25", event: "Rules Matched", actor: "Activation Engine", detail: "3 rules matched" },
      { date: "2025-07-24", event: "Invoice Paid", actor: "Billing System" },
    ],
    notes: "Web project includes full redesign. Timeline 6 weeks.",
  },
  // 6 — Department Activation Pending
  {
    id: "ae-006",
    client: "Lakewood Family Medicine",
    clientSlug: "lakewood-family-medicine",
    contractStatus: "Signed",
    invoiceStatus: "Paid",
    lineItems: [
      { name: "SEO Setup", billingType: "Setup", quantity: 1, setupFee: 750, monthlyFee: 0, department: "SEO", taskTemplate: "SEO Setup Template", activationRule: "SEO Setup — Invoice Paid", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 5, escalationAfterDays: 7, slaPriority: "Standard", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-26", targetCompletionDate: "2025-07-31", escalationDate: "2025-08-02", slaStatus: "Active" } },
      { name: "Meta Ads Setup", billingType: "Setup", quantity: 1, setupFee: 600, monthlyFee: 0, department: "Meta Ads", taskTemplate: "Meta Ads Launch Template", activationRule: "Meta Ads — Invoice Paid", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 5, escalationAfterDays: 7, slaPriority: "Standard", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-26", targetCompletionDate: "2025-07-31", escalationDate: "2025-08-02", slaStatus: "Active" } },
      { name: "Meta Ads Monthly", billingType: "Monthly", quantity: 1, setupFee: 0, monthlyFee: 900, department: "Meta Ads", taskTemplate: "Meta Ads Monthly Template", activationRule: "Meta Ads Monthly — Client Activated", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 10, escalationAfterDays: 14, slaPriority: "Standard", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-26", targetCompletionDate: "2025-08-05", escalationDate: "2025-08-09", slaStatus: "Active" } },
      { name: "Reporting Monthly", billingType: "Monthly", quantity: 1, setupFee: 0, monthlyFee: 250, department: "Reporting", taskTemplate: "Reporting Monthly Template", activationRule: "Reporting Monthly — Client Activated", lineItemSLA: { firstResponseSLA: "2 business days", targetCompletionDays: 7, escalationAfterDays: 10, slaPriority: "Standard", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-27", targetCompletionDate: "2025-08-02", escalationDate: "2025-08-05", slaStatus: "Active" } },
    ],
    matchedRules: ["SEO Setup — Invoice Paid", "Meta Ads — Invoice Paid", "Reporting Monthly — Client Activated", "Client Onboarding — Invoice Paid"],
    taskTemplates: ["SEO Setup Template", "Meta Ads Launch Template", "Reporting Monthly Template", "AM Onboarding Template"],
    departments: ["SEO", "Meta Ads", "Reporting", "Account Management"],
    activationStatus: "Department Activation Pending",
    blockedReason: null,
    nextAction: "Assign Department Owners",
    priority: "High",
    activatedAt: null,
    contractValue: 13800,
    setupRevenue: 1350,
    monthlyRevenue: 1150,
    contractRef: "CTR-2025-0035",
    invoiceRef: "INV-2025-0079",
    generatedTasks: [
      { taskName: "Website Access", department: "SEO", ownerRole: "SEO Specialist", priority: "High", dueOffset: "Day 1", targetCompletionDays: 1, status: "Pending" },
      { taskName: "Ads Account Access", department: "Meta Ads", ownerRole: "Meta Ads Specialist", priority: "High", dueOffset: "Day 1", targetCompletionDays: 1, status: "Pending" },
      { taskName: "Reporting Setup", department: "Reporting", ownerRole: "Reporting Specialist", priority: "Medium", dueOffset: "Day 5", targetCompletionDays: 2, status: "Pending" },
      { taskName: "Onboarding Call", department: "Account Management", ownerRole: "Account Manager", priority: "High", dueOffset: "Day 1", targetCompletionDays: 1, status: "Pending" },
    ],
    departmentWorkload: [
      { department: "SEO", activatedLineItems: ["SEO Setup"], taskCount: 6, targetCompletionDays: 14, owner: "Unassigned", status: "Pending" },
      { department: "Meta Ads", activatedLineItems: ["Meta Ads Setup", "Meta Ads Monthly"], taskCount: 10, targetCompletionDays: 18, owner: "Unassigned", status: "Pending" },
      { department: "Reporting", activatedLineItems: ["Reporting Monthly"], taskCount: 4, targetCompletionDays: 6, owner: "Unassigned", status: "Pending" },
      { department: "Account Management", activatedLineItems: ["Client Onboarding"], taskCount: 4, targetCompletionDays: 5, owner: "Unassigned", status: "Pending" },
    ],
    timeline: [
      { date: "2025-07-25", event: "Tasks Generated", actor: "Activation Engine", detail: "24 tasks created" },
      { date: "2025-07-25", event: "Rules Matched", actor: "Activation Engine" },
      { date: "2025-07-23", event: "Invoice Paid", actor: "Billing System" },
    ],
    notes: "Awaiting department owner assignments before activation can complete.",
  },
  // 7 — Activated
  {
    id: "ae-007",
    client: "Summit Orthopedics",
    clientSlug: "summit-orthopedics",
    contractStatus: "Signed",
    invoiceStatus: "Paid",
    lineItems: [
      { name: "SEO Setup", billingType: "Setup", quantity: 1, setupFee: 750, monthlyFee: 0, department: "SEO", taskTemplate: "SEO Setup Template", activationRule: "SEO Setup — Invoice Paid", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 5, escalationAfterDays: 7, slaPriority: "Standard", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-26", targetCompletionDate: "2025-07-31", escalationDate: "2025-08-02", slaStatus: "Active" } },
      { name: "SEO Monthly", billingType: "Monthly", quantity: 1, setupFee: 0, monthlyFee: 1200, department: "SEO", taskTemplate: "SEO Monthly Template", activationRule: "SEO Monthly — Client Activated", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 10, escalationAfterDays: 14, slaPriority: "Standard", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-26", targetCompletionDate: "2025-08-05", escalationDate: "2025-08-09", slaStatus: "Active" } },
      { name: "GBP Optimization", billingType: "Setup", quantity: 1, setupFee: 500, monthlyFee: 0, department: "GBP", taskTemplate: "GBP Launch Template", activationRule: "GBP Launch — Invoice Paid", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 3, escalationAfterDays: 5, slaPriority: "Standard", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-26", targetCompletionDate: "2025-07-29", escalationDate: "2025-07-31", slaStatus: "Active" } },
      { name: "Paid Advertising Setup", billingType: "Setup", quantity: 1, setupFee: 850, monthlyFee: 0, department: "Paid Advertising", taskTemplate: "PPC Setup Template", activationRule: "PPC Setup — Invoice Paid", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 4, escalationAfterDays: 6, slaPriority: "Priority", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-26", targetCompletionDate: "2025-07-30", escalationDate: "2025-08-01", slaStatus: "Active" } },
      { name: "PPC Monthly Management", billingType: "Monthly", quantity: 1, setupFee: 0, monthlyFee: 1500, department: "Paid Advertising", taskTemplate: "PPC Monthly Template", activationRule: "PPC Monthly — Client Activated", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 12, escalationAfterDays: 15, slaPriority: "Standard", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-26", targetCompletionDate: "2025-08-07", escalationDate: "2025-08-10", slaStatus: "Active" } },
    ],
    matchedRules: ["SEO Setup — Invoice Paid", "SEO Monthly — Client Activated", "GBP Launch — Invoice Paid", "PPC Setup — Invoice Paid", "Client Onboarding — Invoice Paid"],
    taskTemplates: ["SEO Setup Template", "SEO Monthly Template", "GBP Launch Template", "PPC Setup Template", "AM Onboarding Template"],
    departments: ["SEO", "GBP", "Paid Advertising", "Account Management"],
    activationStatus: "Activated",
    blockedReason: null,
    nextAction: "View Onboarding Progress",
    priority: "Medium",
    activatedAt: "2025-07-20",
    contractValue: 30600,
    setupRevenue: 2100,
    monthlyRevenue: 2700,
    contractRef: "CTR-2025-0031",
    invoiceRef: "INV-2025-0074",
    generatedTasks: [
      { taskName: "Website Access", department: "SEO", ownerRole: "SEO Specialist", priority: "High", dueOffset: "Day 1", targetCompletionDays: 1, status: "Complete" },
      { taskName: "Technical Audit", department: "SEO", ownerRole: "SEO Lead", priority: "High", dueOffset: "Day 3", targetCompletionDays: 5, status: "Complete" },
      { taskName: "GBP Claim & Verify", department: "GBP", ownerRole: "GBP Specialist", priority: "High", dueOffset: "Day 2", targetCompletionDays: 2, status: "Active" },
      { taskName: "Ad Account Setup", department: "Paid Advertising", ownerRole: "PPC Specialist", priority: "High", dueOffset: "Day 2", targetCompletionDays: 3, status: "Active" },
      { taskName: "Onboarding Call", department: "Account Management", ownerRole: "Account Manager", priority: "High", dueOffset: "Day 1", targetCompletionDays: 1, status: "Complete" },
    ],
    departmentWorkload: [
      { department: "SEO", activatedLineItems: ["SEO Setup", "SEO Monthly"], taskCount: 14, targetCompletionDays: 34, owner: "Sarah K.", status: "Active" },
      { department: "GBP", activatedLineItems: ["GBP Optimization"], taskCount: 6, targetCompletionDays: 10, owner: "Marcus L.", status: "Active" },
      { department: "Paid Advertising", activatedLineItems: ["Paid Advertising Setup", "PPC Monthly Management"], taskCount: 12, targetCompletionDays: 28, owner: "Derek M.", status: "Active" },
      { department: "Account Management", activatedLineItems: ["Client Onboarding"], taskCount: 4, targetCompletionDays: 5, owner: "Jenna P.", status: "Active" },
    ],
    timeline: [
      { date: "2025-07-20", event: "Activation Complete", actor: "Activation Engine", detail: "All departments activated" },
      { date: "2025-07-20", event: "Department Owners Assigned", actor: "Ops Manager" },
      { date: "2025-07-19", event: "Tasks Generated", actor: "Activation Engine", detail: "36 tasks created" },
      { date: "2025-07-18", event: "Rules Matched", actor: "Activation Engine", detail: "5 rules matched" },
      { date: "2025-07-17", event: "Invoice Paid", actor: "Billing System", detail: "INV-2025-0074 — $2,100" },
      { date: "2025-07-16", event: "Contract Signed", actor: "DocuSign" },
    ],
    notes: "Full-service client. High priority. Monthly review scheduled.",
  },
  // 8 — Activated (second)
  {
    id: "ae-008",
    client: "BrightSmile Dental Studio",
    clientSlug: "brightsmile-dental-studio",
    contractStatus: "Signed",
    invoiceStatus: "Paid",
    lineItems: [
      { name: "GBP Optimization", billingType: "Setup", quantity: 1, setupFee: 500, monthlyFee: 0, department: "GBP", taskTemplate: "GBP Launch Template", activationRule: "GBP Launch — Invoice Paid", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 3, escalationAfterDays: 5, slaPriority: "Standard", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-26", targetCompletionDate: "2025-07-29", escalationDate: "2025-07-31", slaStatus: "Active" } },
      { name: "LSA Setup", billingType: "Setup", quantity: 1, setupFee: 400, monthlyFee: 0, department: "LSA", taskTemplate: "LSA Setup Template", activationRule: "LSA Setup — Invoice Paid", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 5, escalationAfterDays: 8, slaPriority: "Standard", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-26", targetCompletionDate: "2025-07-31", escalationDate: "2025-08-03", slaStatus: "Active" } },
      { name: "LSA Monthly", billingType: "Monthly", quantity: 1, setupFee: 0, monthlyFee: 600, department: "LSA", taskTemplate: "LSA Monthly Template", activationRule: "LSA Monthly — Client Activated", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 6, escalationAfterDays: 10, slaPriority: "Standard", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-26", targetCompletionDate: "2025-08-01", escalationDate: "2025-08-05", slaStatus: "Active" } },
    ],
    matchedRules: ["GBP Launch — Invoice Paid", "LSA Setup — Invoice Paid", "Client Onboarding — Invoice Paid"],
    taskTemplates: ["GBP Launch Template", "LSA Setup Template", "AM Onboarding Template"],
    departments: ["GBP", "LSA", "Account Management"],
    activationStatus: "Activated",
    blockedReason: null,
    nextAction: "View Onboarding Progress",
    priority: "Low",
    activatedAt: "2025-07-15",
    contractValue: 7800,
    setupRevenue: 900,
    monthlyRevenue: 600,
    contractRef: "CTR-2025-0029",
    invoiceRef: "INV-2025-0069",
    generatedTasks: [
      { taskName: "GBP Claim & Verify", department: "GBP", ownerRole: "GBP Specialist", priority: "High", dueOffset: "Day 2", targetCompletionDays: 2, status: "Complete" },
      { taskName: "LSA Account Verification", department: "LSA", ownerRole: "LSA Specialist", priority: "High", dueOffset: "Day 3", targetCompletionDays: 3, status: "Complete" },
      { taskName: "Onboarding Call", department: "Account Management", ownerRole: "Account Manager", priority: "High", dueOffset: "Day 1", targetCompletionDays: 1, status: "Complete" },
    ],
    departmentWorkload: [
      { department: "GBP", activatedLineItems: ["GBP Optimization"], taskCount: 6, targetCompletionDays: 10, owner: "Marcus L.", status: "Active" },
      { department: "LSA", activatedLineItems: ["LSA Setup", "LSA Monthly"], taskCount: 8, targetCompletionDays: 14, owner: "Tyler R.", status: "Active" },
      { department: "Account Management", activatedLineItems: ["Client Onboarding"], taskCount: 4, targetCompletionDays: 5, owner: "Jenna P.", status: "Active" },
    ],
    timeline: [
      { date: "2025-07-15", event: "Activation Complete", actor: "Activation Engine" },
      { date: "2025-07-15", event: "Tasks Generated", actor: "Activation Engine", detail: "18 tasks created" },
      { date: "2025-07-14", event: "Invoice Paid", actor: "Billing System" },
      { date: "2025-07-13", event: "Contract Signed", actor: "DocuSign" },
    ],
    notes: "Small package — GBP + LSA combo. Smooth activation.",
  },
  // 9 — Blocked: Missing Client Access
  {
    id: "ae-009",
    client: "Riverside Urgent Care",
    clientSlug: "riverside-urgent-care",
    contractStatus: "Signed",
    invoiceStatus: "Paid",
    lineItems: [
      { name: "SEO Setup", billingType: "Setup", quantity: 1, setupFee: 750, monthlyFee: 0, department: "SEO", taskTemplate: "SEO Setup Template", activationRule: "SEO Setup — Invoice Paid", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 5, escalationAfterDays: 7, slaPriority: "Standard", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-26", targetCompletionDate: "2025-07-31", escalationDate: "2025-08-02", slaStatus: "Active" } },
      { name: "SEO Monthly", billingType: "Monthly", quantity: 1, setupFee: 0, monthlyFee: 1200, department: "SEO", taskTemplate: "SEO Monthly Template", activationRule: "SEO Monthly — Client Activated", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 10, escalationAfterDays: 14, slaPriority: "Standard", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-26", targetCompletionDate: "2025-08-05", escalationDate: "2025-08-09", slaStatus: "Active" } },
    ],
    matchedRules: ["SEO Setup — Invoice Paid", "Client Onboarding — Invoice Paid"],
    taskTemplates: ["SEO Setup Template", "AM Onboarding Template"],
    departments: ["SEO", "Account Management"],
    activationStatus: "Blocked",
    blockedReason: "Missing Client Access",
    nextAction: "Request GA4 and Website access from client",
    priority: "High",
    activatedAt: null,
    contractValue: 14400,
    setupRevenue: 750,
    monthlyRevenue: 1200,
    contractRef: "CTR-2025-0040",
    invoiceRef: "INV-2025-0086",
    generatedTasks: [],
    departmentWorkload: [],
    timeline: [
      { date: "2025-07-25", event: "Activation Blocked", actor: "Activation Engine", detail: "Missing GA4 and Website access" },
      { date: "2025-07-24", event: "Rules Matched", actor: "Activation Engine" },
      { date: "2025-07-23", event: "Invoice Paid", actor: "Billing System" },
    ],
    notes: "Access request sent 7/24. Follow up with client directly.",
  },
  // 10 — Blocked: Missing Task Template
  {
    id: "ae-010",
    client: "Northgate Pediatrics",
    clientSlug: "northgate-pediatrics",
    contractStatus: "Signed",
    invoiceStatus: "Paid",
    lineItems: [
      { name: "Creative Monthly", billingType: "Monthly", quantity: 1, setupFee: 0, monthlyFee: 700, department: "Creative", taskTemplate: "Creative Monthly Template", activationRule: "Creative Monthly — Client Activated", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 8, escalationAfterDays: 12, slaPriority: "Standard", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-26", targetCompletionDate: "2025-08-03", escalationDate: "2025-08-07", slaStatus: "Active" } },
      { name: "Reporting Monthly", billingType: "Monthly", quantity: 1, setupFee: 0, monthlyFee: 250, department: "Reporting", taskTemplate: "Reporting Monthly Template", activationRule: "Reporting Monthly — Client Activated", lineItemSLA: { firstResponseSLA: "2 business days", targetCompletionDays: 7, escalationAfterDays: 10, slaPriority: "Standard", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-27", targetCompletionDate: "2025-08-02", escalationDate: "2025-08-05", slaStatus: "Active" } },
    ],
    matchedRules: ["Reporting Monthly — Client Activated"],
    taskTemplates: ["Reporting Monthly Template"],
    departments: ["Creative", "Reporting"],
    activationStatus: "Blocked",
    blockedReason: "Missing Task Template",
    nextAction: "Create Creative Monthly Template",
    priority: "Medium",
    activatedAt: null,
    contractValue: 11400,
    setupRevenue: 0,
    monthlyRevenue: 950,
    contractRef: "CTR-2025-0036",
    invoiceRef: "INV-2025-0080",
    generatedTasks: [],
    departmentWorkload: [],
    timeline: [
      { date: "2025-07-24", event: "Activation Blocked", actor: "Activation Engine", detail: "Creative Monthly Template missing" },
      { date: "2025-07-24", event: "Invoice Paid", actor: "Billing System" },
      { date: "2025-07-22", event: "Contract Signed", actor: "DocuSign" },
    ],
    notes: "Creative Monthly Template needs to be built before activation can complete.",
  },
  // 11 — Pending Payment (overdue)
  {
    id: "ae-011",
    client: "Harbor View Cosmetic Surgery",
    clientSlug: "harbor-view-cosmetic-surgery",
    contractStatus: "Signed",
    invoiceStatus: "Overdue",
    lineItems: [
      { name: "SEO Setup", billingType: "Setup", quantity: 1, setupFee: 750, monthlyFee: 0, department: "SEO", taskTemplate: "SEO Setup Template", activationRule: "SEO Setup — Invoice Paid", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 5, escalationAfterDays: 7, slaPriority: "Standard", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-26", targetCompletionDate: "2025-07-31", escalationDate: "2025-08-02", slaStatus: "Active" } },
      { name: "Meta Ads Setup", billingType: "Setup", quantity: 1, setupFee: 600, monthlyFee: 0, department: "Meta Ads", taskTemplate: "Meta Ads Launch Template", activationRule: "Meta Ads — Invoice Paid", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 5, escalationAfterDays: 7, slaPriority: "Standard", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-26", targetCompletionDate: "2025-07-31", escalationDate: "2025-08-02", slaStatus: "Active" } },
      { name: "Meta Ads Monthly", billingType: "Monthly", quantity: 1, setupFee: 0, monthlyFee: 900, department: "Meta Ads", taskTemplate: "Meta Ads Monthly Template", activationRule: "Meta Ads Monthly — Client Activated", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 10, escalationAfterDays: 14, slaPriority: "Standard", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-26", targetCompletionDate: "2025-08-05", escalationDate: "2025-08-09", slaStatus: "Active" } },
      { name: "Creative Monthly", billingType: "Monthly", quantity: 1, setupFee: 0, monthlyFee: 700, department: "Creative", taskTemplate: "Creative Monthly Template", activationRule: "Creative Monthly — Client Activated", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 8, escalationAfterDays: 12, slaPriority: "Standard", slaStatus: "Active" } },
    ],
    matchedRules: [],
    taskTemplates: [],
    departments: ["SEO", "Meta Ads", "Creative"],
    activationStatus: "Not Ready",
    blockedReason: "Invoice Not Paid",
    nextAction: "Escalate overdue invoice to billing",
    priority: "High",
    activatedAt: null,
    contractValue: 20400,
    setupRevenue: 1350,
    monthlyRevenue: 1600,
    contractRef: "CTR-2025-0033",
    invoiceRef: "INV-2025-0076",
    generatedTasks: [],
    departmentWorkload: [],
    timeline: [
      { date: "2025-07-18", event: "Invoice Overdue", actor: "Billing System", detail: "INV-2025-0076 — $1,350 overdue" },
      { date: "2025-07-15", event: "Invoice Sent", actor: "Billing System" },
      { date: "2025-07-14", event: "Contract Signed", actor: "DocuSign" },
    ],
    notes: "Follow up escalated to account owner. Invoice 10 days overdue.",
  },
  // 12 — Ready for Activation (2nd)
  {
    id: "ae-012",
    client: "Eastside Sports Medicine",
    clientSlug: "eastside-sports-medicine",
    contractStatus: "Signed",
    invoiceStatus: "Paid",
    lineItems: [
      { name: "GBP Optimization", billingType: "Setup", quantity: 1, setupFee: 500, monthlyFee: 0, department: "GBP", taskTemplate: "GBP Launch Template", activationRule: "GBP Launch — Invoice Paid", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 3, escalationAfterDays: 5, slaPriority: "Standard", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-26", targetCompletionDate: "2025-07-29", escalationDate: "2025-07-31", slaStatus: "Active" } },
      { name: "SEO Setup", billingType: "Setup", quantity: 1, setupFee: 750, monthlyFee: 0, department: "SEO", taskTemplate: "SEO Setup Template", activationRule: "SEO Setup — Invoice Paid", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 5, escalationAfterDays: 7, slaPriority: "Standard", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-26", targetCompletionDate: "2025-07-31", escalationDate: "2025-08-02", slaStatus: "Active" } },
      { name: "SEO Monthly", billingType: "Monthly", quantity: 1, setupFee: 0, monthlyFee: 1200, department: "SEO", taskTemplate: "SEO Monthly Template", activationRule: "SEO Monthly — Client Activated", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 10, escalationAfterDays: 14, slaPriority: "Standard", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-26", targetCompletionDate: "2025-08-05", escalationDate: "2025-08-09", slaStatus: "Active" } },
      { name: "LSA Setup", billingType: "Setup", quantity: 1, setupFee: 400, monthlyFee: 0, department: "LSA", taskTemplate: "LSA Setup Template", activationRule: "LSA Setup — Invoice Paid", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 5, escalationAfterDays: 8, slaPriority: "Standard", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-26", targetCompletionDate: "2025-07-31", escalationDate: "2025-08-03", slaStatus: "Active" } },
      { name: "LSA Monthly", billingType: "Monthly", quantity: 1, setupFee: 0, monthlyFee: 600, department: "LSA", taskTemplate: "LSA Monthly Template", activationRule: "LSA Monthly — Client Activated", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 6, escalationAfterDays: 10, slaPriority: "Standard", slaStatus: "Active" }, generatedSLADates: { firstResponseDue: "2025-07-26", targetCompletionDate: "2025-08-01", escalationDate: "2025-08-05", slaStatus: "Active" } },
    ],
    matchedRules: ["GBP Launch — Invoice Paid", "SEO Setup — Invoice Paid", "LSA Setup — Invoice Paid", "Client Onboarding — Invoice Paid"],
    taskTemplates: ["GBP Launch Template", "SEO Setup Template", "LSA Setup Template", "AM Onboarding Template"],
    departments: ["GBP", "SEO", "LSA", "Account Management"],
    activationStatus: "Ready for Activation",
    blockedReason: null,
    nextAction: "Run Activation",
    priority: "High",
    activatedAt: null,
    contractValue: 21600,
    setupRevenue: 1650,
    monthlyRevenue: 1800,
    contractRef: "CTR-2025-0043",
    invoiceRef: "INV-2025-0090",
    generatedTasks: [],
    departmentWorkload: [],
    timeline: [
      { date: "2025-07-25", event: "Invoice Paid", actor: "Billing System", detail: "INV-2025-0090 — $1,650" },
      { date: "2025-07-24", event: "Contract Signed", actor: "DocuSign" },
      { date: "2025-07-23", event: "Proposal Approved", actor: "Sales" },
    ],
    notes: "Multi-service client. High-value. Expedite activation.",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusColor(status: ActivationStatus): string {
  switch (status) {
    case "Activated": return "bg-emerald-100 text-emerald-800";
    case "Ready for Activation": return "bg-blue-100 text-blue-800";
    case "Rules Matched": return "bg-indigo-100 text-indigo-800";
    case "Generating Tasks": return "bg-violet-100 text-violet-800";
    case "Department Activation Pending": return "bg-amber-100 text-amber-800";
    case "Blocked": return "bg-red-100 text-red-800";
    case "Failed": return "bg-rose-100 text-rose-800";
    case "Not Ready": return "bg-gray-100 text-gray-600";
    default: return "bg-gray-100 text-gray-600";
  }
}

function contractStatusColor(s: ContractStatus): string {
  switch (s) {
    case "Signed": return "bg-emerald-100 text-emerald-700";
    case "Pending Signature": return "bg-amber-100 text-amber-700";
    case "Expired": return "bg-red-100 text-red-700";
    case "Draft": return "bg-gray-100 text-gray-600";
  }
}

function invoiceStatusColor(s: InvoiceStatus): string {
  switch (s) {
    case "Paid": return "bg-emerald-100 text-emerald-700";
    case "Pending Payment": return "bg-amber-100 text-amber-700";
    case "Overdue": return "bg-red-100 text-red-700";
    case "Draft": return "bg-gray-100 text-gray-600";
  }
}

function priorityColor(p: Priority): string {
  switch (p) {
    case "High": return "bg-red-100 text-red-700";
    case "Medium": return "bg-amber-100 text-amber-700";
    case "Low": return "bg-gray-100 text-gray-600";
  }
}

function taskStatusColor(s: GeneratedTask["status"]): string {
  switch (s) {
    case "Complete": return "bg-emerald-100 text-emerald-700";
    case "Active": return "bg-blue-100 text-blue-700";
    case "Pending": return "bg-gray-100 text-gray-500";
    case "Blocked": return "bg-red-100 text-red-700";
  }
}

function deptWorkloadStatusColor(s: DepartmentWorkload["status"]): string {
  switch (s) {
    case "Active": return "bg-emerald-100 text-emerald-700";
    case "Pending": return "bg-amber-100 text-amber-700";
    case "Not Activated": return "bg-gray-100 text-gray-500";
  }
}

function fmt$(n: number): string {
  return "$" + n.toLocaleString();
}

const DEPT_COLORS: Record<string, string> = {
  SEO: "bg-emerald-50 text-emerald-700 border-emerald-200",
  GBP: "bg-blue-50 text-blue-700 border-blue-200",
  "Paid Advertising": "bg-violet-50 text-violet-700 border-violet-200",
  "Meta Ads": "bg-indigo-50 text-indigo-700 border-indigo-200",
  LSA: "bg-amber-50 text-amber-700 border-amber-200",
  Reporting: "bg-gray-50 text-gray-700 border-gray-200",
  "Web Development": "bg-cyan-50 text-cyan-700 border-cyan-200",
  Creative: "bg-pink-50 text-pink-700 border-pink-200",
  "Account Management": "bg-teal-50 text-teal-700 border-teal-200",
};

function DeptBadge({ dept }: { dept: string }) {
  const cls = DEPT_COLORS[dept] ?? "bg-gray-50 text-gray-700 border-gray-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cls}`}>
      {dept}
    </span>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color }: { label: string; value: number | string; sub?: string; color?: string }) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-1" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
      <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-secondary)" }}>{label}</span>
      <span className={`text-2xl font-black ${color ?? ""}`} style={!color ? { color: "var(--rtm-text-primary)" } : undefined}>{value}</span>
      {sub && <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{sub}</span>}
    </div>
  );
}

// ── Row Action Button ─────────────────────────────────────────────────────────

function RowAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-[11px] font-semibold hover:underline whitespace-nowrap"
      style={{ color: "var(--rtm-blue)" }}
    >
      {label}
    </button>
  );
}

// ── Detail Drawer ─────────────────────────────────────────────────────────────

function DetailDrawer({ item, onClose }: { item: ActivationCase; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "contract" | "billing" | "lineitems" | "rules" | "tasks" | "departments" | "timeline" | "notes"
  >("overview");

  const tabs: { id: typeof activeTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "contract", label: "Contract" },
    { id: "billing", label: "Billing" },
    { id: "lineitems", label: "Line Items" },
    { id: "rules", label: "Matched Rules" },
    { id: "tasks", label: "Generated Tasks" },
    { id: "departments", label: "Departments" },
    { id: "timeline", label: "Timeline" },
    { id: "notes", label: "Notes" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      {/* Panel */}
      <div className="relative z-10 w-full max-w-2xl bg-white shadow-2xl flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">Activation Detail</span>
            <h2 className="text-xl font-bold text-gray-900">{item.client}</h2>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor(item.activationStatus)}`}>
                {item.activationStatus}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityColor(item.priority)}`}>
                {item.priority} Priority
              </span>
              {item.blockedReason && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                  ⚠ {item.blockedReason}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="ml-4 mt-1 text-gray-400 hover:text-gray-700 text-xl font-bold leading-none">×</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-gray-200 bg-white overflow-x-auto shrink-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === t.id
                  ? "border-blue-600 text-blue-700 bg-blue-50"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* ── Overview ── */}
          {activeTab === "overview" && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Contract</span>
                  <p className="text-sm font-semibold text-gray-800 mt-1">{item.contractRef}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${contractStatusColor(item.contractStatus)}`}>{item.contractStatus}</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Invoice</span>
                  <p className="text-sm font-semibold text-gray-800 mt-1">{item.invoiceRef}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${invoiceStatusColor(item.invoiceStatus)}`}>{item.invoiceStatus}</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Contract Value</span>
                  <p className="text-lg font-bold text-gray-900 mt-1">{fmt$(item.contractValue)}</p>
                  <span className="text-xs text-gray-400">/year</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Monthly Revenue</span>
                  <p className="text-lg font-bold text-gray-900 mt-1">{fmt$(item.monthlyRevenue)}</p>
                  <span className="text-xs text-gray-400">/month</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Departments</p>
                <div className="flex flex-wrap gap-2">
                  {item.departments.map((d) => <DeptBadge key={d} dept={d} />)}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Next Action</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-800">{item.nextAction}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Link href={`/clients/${item.clientSlug}`} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">View Client →</Link>
                <Link href="/billing/invoices" className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">View Billing →</Link>
                <Link href="/account-management/onboarding" className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">View Onboarding →</Link>
              </div>
            </div>
          )}

          {/* ── Contract ── */}
          {activeTab === "contract" && (
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-bold text-gray-800">Contract Summary</h3>
              <div className="bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-200">
                {[
                  ["Reference", item.contractRef],
                  ["Status", item.contractStatus],
                  ["Contract Value", fmt$(item.contractValue)],
                  ["Setup Revenue", fmt$(item.setupRevenue)],
                  ["Monthly Revenue", fmt$(item.monthlyRevenue)],
                  ["Line Items", item.lineItems.length.toString()],
                  ["Activated", item.activatedAt ?? "—"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between px-4 py-3">
                    <span className="text-xs text-gray-500">{k}</span>
                    <span className="text-xs font-semibold text-gray-800">{v}</span>
                  </div>
                ))}
              </div>
              <Link href="/billing/invoices" className="text-xs text-blue-600 hover:underline self-start">View Full Contract in Billing →</Link>
            </div>
          )}

          {/* ── Billing ── */}
          {activeTab === "billing" && (
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-bold text-gray-800">Billing Summary</h3>
              <div className="bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-200">
                {[
                  ["Invoice Reference", item.invoiceRef],
                  ["Invoice Status", item.invoiceStatus],
                  ["Setup Revenue", fmt$(item.setupRevenue)],
                  ["Monthly MRR", fmt$(item.monthlyRevenue)],
                  ["Annual Contract", fmt$(item.contractValue)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between px-4 py-3">
                    <span className="text-xs text-gray-500">{k}</span>
                    <span className="text-xs font-semibold text-gray-800">{v}</span>
                  </div>
                ))}
              </div>
              <Link href="/billing/invoices" className="text-xs text-blue-600 hover:underline self-start">View All Invoices →</Link>
            </div>
          )}

          {/* ── Line Items ── */}
          {activeTab === "lineitems" && (
            <div className="flex flex-col gap-3">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Line Items &amp; SLA Dates — Generated from Line Item SLAs</h3>
                <p className="text-xs text-gray-500 mt-0.5">SLA dates below are generated from each line item’s SLA. Department SLA is fallback only.</p>
              </div>

              {/* SLA table per activated service */}
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full text-xs" style={{ minWidth: "900px" }}>
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {["Line Item", "Task Template", "Department", "First Response Due", "Target Completion Date", "Escalation Date", "SLA Status"].map((h) => (
                        <th key={h} className="px-3 py-2.5 text-left font-bold text-gray-500 whitespace-nowrap text-[11px] uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {item.lineItems.map((li, i) => (
                      <tr key={i} className="hover:bg-blue-50/30">
                        <td className="px-3 py-2.5">
                          <div className="font-semibold text-gray-800">{li.name}</div>
                          <div className="text-[10px] text-gray-400">{li.billingType} · {li.lineItemSLA.slaPriority} priority</div>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#F5F3FF", color: "#6D28D9" }}>{li.taskTemplate}</span>
                        </td>
                        <td className="px-3 py-2.5"><DeptBadge dept={li.department} /></td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          {li.generatedSLADates ? (
                            <span className="text-[11px] font-semibold" style={{ color: "#1D4ED8" }}>⚡ {li.generatedSLADates.firstResponseDue}</span>
                          ) : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          {li.generatedSLADates ? (
                            <span className="text-[11px] font-bold" style={{ color: "#059669" }}>{li.generatedSLADates.targetCompletionDate}</span>
                          ) : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          {li.generatedSLADates ? (
                            <span className="text-[11px]" style={{ color: "#C2410C" }}>{li.generatedSLADates.escalationDate}</span>
                          ) : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: li.lineItemSLA.slaStatus === "Active" ? "#F0FDF4" : "#FFF7ED", color: li.lineItemSLA.slaStatus === "Active" ? "#15803D" : "#C2410C" }}>
                            {li.lineItemSLA.slaStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Rules ── */}
          {activeTab === "rules" && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-gray-800">Matched Activation Rules</h3>
              {item.matchedRules.length === 0 ? (
                <div className="text-sm text-gray-400 bg-gray-50 rounded-lg p-4 border border-gray-200">No rules matched yet. Conditions not satisfied.</div>
              ) : (
                item.matchedRules.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3">
                    <span className="text-indigo-500 text-sm">✓</span>
                    <span className="text-sm font-medium text-indigo-800">{r}</span>
                  </div>
                ))
              )}
              <Link href="/tasks/activation-rules" className="text-xs text-blue-600 hover:underline self-start mt-1">View All Activation Rules →</Link>
            </div>
          )}

          {/* ── Tasks ── */}
          {activeTab === "tasks" && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-gray-800">Generated Tasks</h3>
              {item.generatedTasks.length === 0 ? (
                <div className="text-sm text-gray-400 bg-gray-50 rounded-lg p-4 border border-gray-200">No tasks generated yet.</div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {["Task", "Department", "Owner Role", "Priority", "Due", "Target Days", "Status"].map((h) => (
                          <th key={h} className="px-3 py-2 text-left font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {item.generatedTasks.map((t, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-3 py-2 font-medium text-gray-800 whitespace-nowrap">{t.taskName}</td>
                          <td className="px-3 py-2"><DeptBadge dept={t.department} /></td>
                          <td className="px-3 py-2 text-gray-600">{t.ownerRole}</td>
                          <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full font-medium ${priorityColor(t.priority)}`}>{t.priority}</span></td>
                          <td className="px-3 py-2 text-gray-600">{t.dueOffset}</td>
                          <td className="px-3 py-2 text-gray-600">{t.targetCompletionDays}d</td>
                          <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full font-medium ${taskStatusColor(t.status)}`}>{t.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <Link href="/tasks/templates" className="text-xs text-blue-600 hover:underline self-start mt-1">View Task Templates →</Link>
            </div>
          )}

          {/* ── Departments ── */}
          {activeTab === "departments" && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-gray-800">Department Queue Status</h3>
              {item.departmentWorkload.length === 0 ? (
                <div className="text-sm text-gray-400 bg-gray-50 rounded-lg p-4 border border-gray-200">Department queue not yet activated.</div>
              ) : (
                item.departmentWorkload.map((dw, i) => (
                  <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <DeptBadge dept={dw.department} />
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${deptWorkloadStatusColor(dw.status)}`}>{dw.status}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                      <span>Tasks: <b>{dw.taskCount}</b></span>
                      <span>Target Days: <b>{dw.targetCompletionDays}d</b></span>
                      <span>Owner: <b>{dw.owner}</b></span>
                      <span>Line Items: <b>{dw.activatedLineItems.length}</b></span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {dw.activatedLineItems.map((li) => (
                        <span key={li} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{li}</span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── Timeline ── */}
          {activeTab === "timeline" && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-gray-800">Activation Timeline</h3>
              <div className="relative flex flex-col gap-0">
                {item.timeline.map((ev, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      {i < item.timeline.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1 min-h-[24px]" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-semibold text-gray-800">{ev.event}</p>
                      <p className="text-xs text-gray-500">{ev.date} · {ev.actor}</p>
                      {ev.detail && <p className="text-xs text-gray-400 mt-0.5">{ev.detail}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Notes ── */}
          {activeTab === "notes" && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-gray-800">Notes</h3>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-900">{item.notes || "No notes."}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex gap-2 flex-wrap shrink-0">
          {item.activationStatus === "Ready for Activation" && (
            <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700">Run Activation</button>
          )}
          {(item.activationStatus === "Rules Matched" || item.activationStatus === "Generating Tasks") && (
            <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-violet-600 text-white hover:bg-violet-700">Generate Tasks</button>
          )}
          {item.activationStatus === "Department Activation Pending" && (
            <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700">Assign Department Owners</button>
          )}
          {item.activationStatus === "Activated" && (
            <Link href="/account-management/onboarding" className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">Push to Onboarding →</Link>
          )}
          <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">Test Rules</button>
          <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">Add Note</button>
          {item.activationStatus !== "Blocked" && (
            <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-700 hover:bg-red-100">Mark Blocked</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ActivationEnginePage() {
  const [selectedCase, setSelectedCase] = useState<ActivationCase | null>(null);
  const [filterStatus, setFilterStatus] = useState<ActivationStatus | "All">("All");
  const [filterPriority, setFilterPriority] = useState<Priority | "All">("All");
  const [search, setSearch] = useState("");

  // ── KPIs ──
  const kpis = useMemo(() => {
    const ready = ACTIVATION_CASES.filter((c) => c.activationStatus === "Ready for Activation").length;
    const pendingSig = ACTIVATION_CASES.filter((c) => c.contractStatus === "Pending Signature").length;
    const pendingPay = ACTIVATION_CASES.filter((c) => c.invoiceStatus === "Pending Payment" || c.invoiceStatus === "Overdue").length;
    const rulesMatched = ACTIVATION_CASES.filter((c) => c.activationStatus === "Rules Matched").length;
    const templatesGen = ACTIVATION_CASES.filter((c) => c.generatedTasks.length > 0).length;
    const deptsActivated = ACTIVATION_CASES.filter((c) => c.activationStatus === "Activated").length;
    const blocked = ACTIVATION_CASES.filter((c) => c.activationStatus === "Blocked").length;
    const activatedMonth = ACTIVATION_CASES.filter((c) => c.activatedAt?.startsWith("2025-07")).length;
    return { ready, pendingSig, pendingPay, rulesMatched, templatesGen, deptsActivated, blocked, activatedMonth };
  }, []);

  // ── Filtered queue ──
  const filtered = useMemo(() => {
    return ACTIVATION_CASES.filter((c) => {
      const matchStatus = filterStatus === "All" || c.activationStatus === filterStatus;
      const matchPriority = filterPriority === "All" || c.priority === filterPriority;
      const matchSearch = search === "" || c.client.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchPriority && matchSearch;
    });
  }, [filterStatus, filterPriority, search]);

  const STATUSES: (ActivationStatus | "All")[] = [
    "All", "Not Ready", "Ready for Activation", "Rules Matched",
    "Generating Tasks", "Department Activation Pending", "Activated", "Blocked", "Failed",
  ];

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--rtm-blue)" }}>Projects &amp; Tasks</p>
            <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>›</span>
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>Activation Engine</p>
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Activation Engine</h1>
          <p className="text-sm mt-1 max-w-xl" style={{ color: "var(--rtm-text-secondary)" }}>
            Activate projects, task blueprints, department workload, and onboarding handoffs from signed contracts and paid invoices.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <button className="px-4 py-2 text-sm font-bold rounded-lg text-white" style={{ background: "var(--rtm-blue)" }}>▶ Run Activation</button>
          <button className="px-4 py-2 text-sm font-semibold rounded-lg border" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)" }}>⚙ Test Activation</button>
          <button className="px-4 py-2 text-sm font-semibold rounded-lg border" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)" }}>↻ Sync Contracts</button>
          <button className="px-4 py-2 text-sm font-semibold rounded-lg border" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)" }}>↻ Sync Billing</button>
          <Link href="/tasks/activation-rules" className="px-4 py-2 text-sm font-semibold rounded-lg border" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)" }}>⚡ Rules</Link>
          <Link href="/tasks/templates" className="px-4 py-2 text-sm font-semibold rounded-lg border" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)" }}>📋 Templates</Link>
        </div>
      </div>

      {/* ── Flow indicator ── */}
      <div className="rounded-xl p-4 flex flex-wrap items-center gap-2" style={{ background: "var(--rtm-blue-xlight)", border: "1px solid #BFDBFE" }}>
        {["Contract Signed","Invoice Paid","Rule Matched","Tasks Generated","Dept Activated","AM Onboarding"].map((step, i, arr) => (
          <span key={step} className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white" style={{ color: "#1E40AF", border: "1px solid #BFDBFE" }}>{step}</span>
            {i < arr.length - 1 && <span className="font-black" style={{ color: "#93C5FD" }}>→</span>}
          </span>
        ))}
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
        <KpiCard label="Ready for Activation" value={kpis.ready} color="text-blue-700" sub="contracts + invoices OK" />
        <KpiCard label="Pending Signature" value={kpis.pendingSig} color="text-amber-600" sub="awaiting DocuSign" />
        <KpiCard label="Pending Payment" value={kpis.pendingPay} color="text-amber-600" sub="invoices outstanding" />
        <KpiCard label="Rules Matched" value={kpis.rulesMatched} color="text-indigo-600" sub="awaiting task gen" />
        <KpiCard label="Templates Generated" value={kpis.templatesGen} color="text-violet-600" sub="tasks created" />
        <KpiCard label="Depts Activated" value={kpis.deptsActivated} color="text-emerald-600" sub="fully activated" />
        <KpiCard label="Blocked" value={kpis.blocked} color="text-red-600" sub="needs attention" />
        <KpiCard label="Activated This Month" value={kpis.activatedMonth} color="text-emerald-700" sub="July 2025" />
      </div>

        {/* ── Activation Queue ── */}
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
          {/* Queue header */}
          <div className="flex items-center justify-between px-5 py-4 flex-wrap gap-3" style={{ borderBottom: "1px solid var(--rtm-border)" }}>
            <h2 className="text-sm font-extrabold" style={{ color: "var(--rtm-text-primary)" }}>Activation Queue</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="text"
                placeholder="Search clients…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg outline-none"
                style={{ border: "1px solid var(--rtm-border)", background: "var(--rtm-bg)", color: "var(--rtm-text-primary)", width: "11rem" }}
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as ActivationStatus | "All")}
                className="px-2 py-1.5 text-xs rounded-lg outline-none"
                style={{ border: "1px solid var(--rtm-border)", background: "var(--rtm-bg)", color: "var(--rtm-text-primary)" }}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as Priority | "All")}
                className="px-2 py-1.5 text-xs rounded-lg outline-none"
                style={{ border: "1px solid var(--rtm-border)", background: "var(--rtm-bg)", color: "var(--rtm-text-primary)" }}
              >
                {(["All", "High", "Medium", "Low"] as const).map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-muted)" }}>{filtered.length} records</span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1100px]">
              <thead style={{ background: "var(--rtm-bg)", borderBottom: "2px solid var(--rtm-border)" }}>
                <tr>
                  {[
                    "Client",
                    "Contract Status",
                    "Invoice Status",
                    "Line Items Sold",
                    "Matched Rules",
                    "Task Templates",
                    "Departments",
                    "Activation Status",
                    "Blocked Reason",
                    "Next Action",
                    "Priority",
                    "Actions",
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, rowIdx) => (
                  <tr key={c.id} className="hover:bg-blue-50/20 transition-colors" style={{ borderBottom: rowIdx < filtered.length - 1 ? "1px solid var(--rtm-border-light)" : undefined }}>
                    {/* Client */}
                    <td className="px-4 py-3 font-semibold whitespace-nowrap">
                      <button
                        onClick={() => setSelectedCase(c)}
                        className="font-semibold hover:underline text-left"
                        style={{ color: "var(--rtm-blue)" }}
                      >
                        {c.client}
                      </button>
                    </td>

                    {/* Contract Status */}
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full font-medium ${contractStatusColor(c.contractStatus)}`}>
                        {c.contractStatus}
                      </span>
                    </td>

                    {/* Invoice Status */}
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full font-medium ${invoiceStatusColor(c.invoiceStatus)}`}>
                        {c.invoiceStatus}
                      </span>
                    </td>

                    {/* Line Items */}
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--rtm-text-primary)" }}>{c.lineItems.length}</td>
                    {/* Matched Rules */}
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--rtm-text-primary)" }}>{c.matchedRules.length}</td>
                    {/* Task Templates */}
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--rtm-text-primary)" }}>{c.taskTemplates.length}</td>
                    {/* Departments */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {c.departments.slice(0, 3).map((d) => <DeptBadge key={d} dept={d} />)}
                        {c.departments.length > 3 && (
                          <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>+{c.departments.length - 3}</span>
                        )}
                      </div>
                    </td>
                    {/* Activation Status */}
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusColor(c.activationStatus)}`}>{c.activationStatus}</span>
                    </td>
                    {/* Blocked Reason */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {c.blockedReason ? (
                        <span className="text-xs font-semibold" style={{ color: "#DC2626" }}>{c.blockedReason}</span>
                      ) : (
                        <span style={{ color: "var(--rtm-text-muted)" }}>—</span>
                      )}
                    </td>
                    {/* Next Action */}
                    <td className="px-4 py-3 max-w-[180px]">
                      <span className="text-xs line-clamp-2" style={{ color: "var(--rtm-text-secondary)" }}>{c.nextAction}</span>
                    </td>
                    {/* Priority */}
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${priorityColor(c.priority)}`}>{c.priority}</span>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <RowAction label="View" onClick={() => setSelectedCase(c)} />
                        {c.activationStatus === "Ready for Activation" && <RowAction label="Run Activation" onClick={() => {}} />}
                        {(c.activationStatus === "Rules Matched" || c.activationStatus === "Generating Tasks") && <RowAction label="Generate Tasks" onClick={() => {}} />}
                        {c.activationStatus === "Department Activation Pending" && <RowAction label="Assign Owners" onClick={() => {}} />}
                        {c.activationStatus === "Activated" && <RowAction label="Push Onboarding" onClick={() => {}} />}
                        <RowAction label="Test Rules" onClick={() => {}} />
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={12} className="px-4 py-12 text-center text-sm" style={{ color: "var(--rtm-text-muted)" }}>
                      No activation cases match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Blocked Activations Panel ── */}
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--rtm-border)" }}>
            <h2 className="text-sm font-extrabold" style={{ color: "var(--rtm-text-primary)" }}>🚫 Blocked Activations</h2>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {ACTIVATION_CASES.filter((c) => c.activationStatus === "Blocked" || c.blockedReason).map((c) => (
              <div key={c.id} className="rounded-xl p-4 flex flex-col gap-2" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{c.client}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${priorityColor(c.priority)}`}>{c.priority}</span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full self-start" style={{ background: "#FEE2E2", color: "#DC2626" }}>
                  ⚠ {c.blockedReason}
                </span>
                <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{c.nextAction}</p>
                <button onClick={() => setSelectedCase(c)} className="text-xs font-semibold hover:underline self-start mt-1" style={{ color: "#DC2626" }}>View Details →</button>
              </div>
            ))}
            {ACTIVATION_CASES.filter((c) => c.activationStatus === "Blocked" || c.blockedReason).length === 0 && (
              <p className="text-sm col-span-3" style={{ color: "var(--rtm-text-muted)" }}>No blocked activations.</p>
            )}
          </div>
        </div>

        {/* ── Department Workload Summary ── */}
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--rtm-border)" }}>
            <h2 className="text-sm font-extrabold" style={{ color: "var(--rtm-text-primary)" }}>🏢 Department Queue — Activated Clients</h2>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {(
              [
                "SEO", "GBP", "Paid Advertising", "Meta Ads", "LSA",
                "Reporting", "Web Development", "Creative", "Account Management",
              ] as Department[]
            ).map((dept) => {
              const workloads = ACTIVATION_CASES.flatMap((c) =>
                c.departmentWorkload.filter((dw) => dw.department === dept && dw.status === "Active")
              );
              const totalTasks = workloads.reduce((a, dw) => a + dw.taskCount, 0);
              const activatedClients = new Set(
                ACTIVATION_CASES.filter((c) =>
                  c.departmentWorkload.some((dw) => dw.department === dept && dw.status === "Active")
                ).map((c) => c.id)
              ).size;

              return (
                <div key={dept} className={`rounded-xl border p-4 flex flex-col gap-2 ${DEPT_COLORS[dept] ?? "bg-gray-50 border-gray-200"}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">{dept}</span>
                    <span className="text-xs font-semibold">
                      {activatedClients > 0 ? (
                        <span className="bg-white/70 px-2 py-0.5 rounded-full">{activatedClients} active client{activatedClients !== 1 ? "s" : ""}</span>
                      ) : (
                        <span className="opacity-50">No active clients</span>
                      )}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs font-medium opacity-80">
                    <span>{totalTasks} tasks</span>
                    <span>{workloads.reduce((a, dw) => a + dw.targetCompletionDays, 0) > 0 ? `${workloads.reduce((a, dw) => a + dw.targetCompletionDays, 0)}d target` : ""}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      {/* ── Detail Drawer ── */}
      {selectedCase && (
        <DetailDrawer item={selectedCase} onClose={() => setSelectedCase(null)} />
      )}
    </div>
  );
}
