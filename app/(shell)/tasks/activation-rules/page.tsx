"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

function PreviewBadge() {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border"
      style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#92400E" }}
    >
      Preview — Target State
    </span>
  );
}

// 
// Task Activation Rules
// Route: /tasks/activation-rules
// Controls when task templates are automatically activated based on sold line
// items, contracts, billing status, and client lifecycle events.
// 

//  Types 

type TriggerEvent =
  | "Proposal Approved"| "Contract Signed"| "Invoice Paid"| "Client Activated"| "Upsell Approved"| "Renewal Signed"| "Cancellation Requested"| "Offboarding Approved";

type RuleCondition =
  | "Line Item Selected"| "Contract Signed"| "Setup Invoice Paid"| "Recurring Invoice Active"| "Client Onboarding Started"| "Department Access Complete"| "Prerequisites Satisfied";

type RuleStatus = "Active"| "Inactive"| "Pending Review";

type Department =
  | "SEO"| "GBP"| "Paid Advertising"| "Meta Ads"| "LSA"| "Reporting"| "Web Development"| "Creative"| "Account Management"| "Billing";

type ContractRequirement = "Required"| "Optional"| "Not Required";
type BillingRequirement = "Setup Invoice"| "Recurring Invoice"| "Any Invoice"| "Contract Only"| "None";

interface RuleDependency {
  ruleId: string;
  ruleName: string;
  type: "blocks"| "triggers"| "requires";
}

interface ActivityLogEntry {
  date: string;
  action: string;
  by: string;
  detail?: string;
}

interface TestResult {
  passed: boolean;
  testedAt: string;
  conditions: { name: string; met: boolean }[];
  notes?: string;
}

// Line Item SLA — primary source; shown on every rule
interface LineItemSLARef {
  firstResponseSLA: string;
  targetCompletionDays: number;
  dueDateOffset: number;
  escalationAfterDays: number;
  slaPriority: "Standard"| "Priority"| "Rush"| "Custom";
}

interface ActivationRule {
  id: string;
  name: string;
  triggerEvent: TriggerEvent;
  lineItem: string;
  contractRequirement: ContractRequirement;
  billingRequirement: BillingRequirement;
  conditions: RuleCondition[];
  taskTemplate: string;
  department: Department;
  status: RuleStatus;
  lastTriggered: string | null;
  triggerCount: number;
  description: string;
  dependencies: RuleDependency[];
  testResults: TestResult | null;
  activityLog: ActivityLogEntry[];
  priority: number;
  autoActivate: boolean;
  // Line Item SLA — primary delivery SLA source
  lineItemSLA: LineItemSLARef;
}

//  Mock Data 

const ACTIVATION_RULES: ActivationRule[] = [
  //  SEO 
  {
    id: "ar-001",
    name: "SEO Setup — Invoice Paid",
    triggerEvent: "Invoice Paid",
    lineItem: "SEO Setup",
    contractRequirement: "Required",
    billingRequirement: "Setup Invoice",
    conditions: ["Line Item Selected", "Contract Signed", "Setup Invoice Paid"],
    taskTemplate: "SEO Setup Template",
    department: "SEO",
    status: "Active",
    lastTriggered: "2025-07-22",
    triggerCount: 34,
    description:
      "Fires when the SEO Setup line item is present and the setup invoice has been paid. Activates the SEO Setup Template which generates 6 tasks including keyword research, technical audit, and baseline reporting.",
    dependencies: [
      { ruleId: "ar-013", ruleName: "Client Onboarding — Invoice Paid", type: "requires"},
    ],
    testResults: {
      passed: true,
      testedAt: "2025-07-20",
      conditions: [
        { name: "Line Item Selected", met: true },
        { name: "Contract Signed", met: true },
        { name: "Setup Invoice Paid", met: true },
      ],
    },
    activityLog: [
      { date: "2025-07-22", action: "Rule triggered", by: "System", detail: "Client: Horizon Dental"},
      { date: "2025-07-20", action: "Test passed", by: "Admin"},
      { date: "2025-07-15", action: "Rule updated", by: "Admin", detail: "Added prerequisite: Client Onboarding"},
    ],
    priority: 2,
    autoActivate: true,
    lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 5, dueDateOffset: 0, escalationAfterDays: 7, slaPriority: "Standard"},
  },
  {
    id: "ar-002",
    name: "SEO Monthly — Client Activated",
    triggerEvent: "Client Activated",
    lineItem: "SEO Monthly",
    contractRequirement: "Required",
    billingRequirement: "Recurring Invoice",
    conditions: ["Line Item Selected", "Contract Signed", "Recurring Invoice Active", "Prerequisites Satisfied"],
    taskTemplate: "SEO Monthly Template",
    department: "SEO",
    status: "Active",
    lastTriggered: "2025-07-01",
    triggerCount: 28,
    description:
      "Activates recurring SEO management tasks every month once the client is fully activated. Requires SEO Setup to be completed first.",
    dependencies: [
      { ruleId: "ar-001", ruleName: "SEO Setup — Invoice Paid", type: "requires"},
    ],
    testResults: {
      passed: true,
      testedAt: "2025-07-18",
      conditions: [
        { name: "Line Item Selected", met: true },
        { name: "Contract Signed", met: true },
        { name: "Recurring Invoice Active", met: true },
        { name: "Prerequisites Satisfied", met: true },
      ],
    },
    activityLog: [
      { date: "2025-07-01", action: "Rule triggered", by: "System", detail: "Monthly cycle — 12 clients"},
      { date: "2025-07-18", action: "Test passed", by: "Admin"},
    ],
    priority: 5,
    autoActivate: true,
    lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 10, dueDateOffset: 5, escalationAfterDays: 14, slaPriority: "Standard"},
  },

  //  GBP 
  {
    id: "ar-003",
    name: "GBP Launch — Invoice Paid",
    triggerEvent: "Invoice Paid",
    lineItem: "GBP Optimization",
    contractRequirement: "Required",
    billingRequirement: "Setup Invoice",
    conditions: ["Line Item Selected", "Contract Signed", "Setup Invoice Paid"],
    taskTemplate: "GBP Launch Template",
    department: "GBP",
    status: "Active",
    lastTriggered: "2025-07-23",
    triggerCount: 41,
    description:
      "Triggers the GBP Launch Template when GBP Optimization is sold and the setup invoice is collected. Generates 6 tasks covering claim, verification, category optimization, and baseline reporting.",
    dependencies: [
      { ruleId: "ar-013", ruleName: "Client Onboarding — Invoice Paid", type: "requires"},
    ],
    testResults: {
      passed: true,
      testedAt: "2025-07-21",
      conditions: [
        { name: "Line Item Selected", met: true },
        { name: "Contract Signed", met: true },
        { name: "Setup Invoice Paid", met: true },
      ],
    },
    activityLog: [
      { date: "2025-07-23", action: "Rule triggered", by: "System", detail: "Client: Maple Ridge Clinic"},
      { date: "2025-07-21", action: "Test passed", by: "Admin"},
    ],
    priority: 3,
    autoActivate: true,
    lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 3, dueDateOffset: 0, escalationAfterDays: 5, slaPriority: "Standard"},
  },
  {
    id: "ar-004",
    name: "GBP Monthly — Client Activated",
    triggerEvent: "Client Activated",
    lineItem: "GBP Monthly Management",
    contractRequirement: "Required",
    billingRequirement: "Recurring Invoice",
    conditions: ["Line Item Selected", "Contract Signed", "Recurring Invoice Active", "Prerequisites Satisfied"],
    taskTemplate: "GBP Monthly Template",
    department: "GBP",
    status: "Active",
    lastTriggered: "2025-07-01",
    triggerCount: 36,
    description:
      "Activates monthly GBP management tasks including posts, review responses, Q&A monitoring, and monthly reporting.",
    dependencies: [
      { ruleId: "ar-003", ruleName: "GBP Launch — Invoice Paid", type: "requires"},
    ],
    testResults: {
      passed: true,
      testedAt: "2025-07-15",
      conditions: [
        { name: "Line Item Selected", met: true },
        { name: "Contract Signed", met: true },
        { name: "Recurring Invoice Active", met: true },
      ],
    },
    activityLog: [
      { date: "2025-07-01", action: "Rule triggered", by: "System", detail: "Monthly cycle"},
    ],
    priority: 6,
    autoActivate: true,
    lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 3, dueDateOffset: 3, escalationAfterDays: 5, slaPriority: "Standard"},
  },

  //  PPC 
  {
    id: "ar-005",
    name: "PPC Launch — Invoice Paid",
    triggerEvent: "Invoice Paid",
    lineItem: "PPC Management",
    contractRequirement: "Required",
    billingRequirement: "Setup Invoice",
    conditions: ["Line Item Selected", "Contract Signed", "Setup Invoice Paid", "Department Access Complete"],
    taskTemplate: "PPC Launch Template",
    department: "Paid Advertising",
    status: "Active",
    lastTriggered: "2025-07-20",
    triggerCount: 29,
    description:
      "Fires on PPC Management line item + paid setup invoice. Generates the PPC Launch Template with 6 tasks: account access, conversion tracking, campaign setup, audience setup, landing page review, and launch approval.",
    dependencies: [
      { ruleId: "ar-013", ruleName: "Client Onboarding — Invoice Paid", type: "requires"},
    ],
    testResults: {
      passed: true,
      testedAt: "2025-07-19",
      conditions: [
        { name: "Line Item Selected", met: true },
        { name: "Contract Signed", met: true },
        { name: "Setup Invoice Paid", met: true },
        { name: "Department Access Complete", met: true },
      ],
    },
    activityLog: [
      { date: "2025-07-20", action: "Rule triggered", by: "System", detail: "Client: Summit Auto Group"},
      { date: "2025-07-19", action: "Test passed", by: "Admin"},
    ],
    priority: 4,
    autoActivate: true,
    lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 4, dueDateOffset: 0, escalationAfterDays: 6, slaPriority: "Priority"},
  },
  {
    id: "ar-006",
    name: "PPC Monthly — Client Activated",
    triggerEvent: "Client Activated",
    lineItem: "PPC Monthly Management",
    contractRequirement: "Required",
    billingRequirement: "Recurring Invoice",
    conditions: ["Line Item Selected", "Contract Signed", "Recurring Invoice Active", "Prerequisites Satisfied"],
    taskTemplate: "PPC Monthly Template",
    department: "Paid Advertising",
    status: "Active",
    lastTriggered: "2025-07-01",
    triggerCount: 24,
    description:
      "Activates recurring PPC management tasks monthly: bid management, ad copy refresh, negative keyword review, budget pacing review, and performance reporting.",
    dependencies: [
      { ruleId: "ar-005", ruleName: "PPC Launch — Invoice Paid", type: "requires"},
    ],
    testResults: {
      passed: true,
      testedAt: "2025-07-10",
      conditions: [
        { name: "Line Item Selected", met: true },
        { name: "Contract Signed", met: true },
        { name: "Recurring Invoice Active", met: true },
      ],
    },
    activityLog: [
      { date: "2025-07-01", action: "Rule triggered", by: "System", detail: "Monthly cycle"},
    ],
    priority: 7,
    autoActivate: true,
    lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 12, dueDateOffset: 5, escalationAfterDays: 15, slaPriority: "Standard"},
  },

  //  META ADS 
  {
    id: "ar-007",
    name: "Meta Ads Launch — Invoice Paid",
    triggerEvent: "Invoice Paid",
    lineItem: "Meta Ads Management",
    contractRequirement: "Required",
    billingRequirement: "Setup Invoice",
    conditions: ["Line Item Selected", "Contract Signed", "Setup Invoice Paid", "Department Access Complete"],
    taskTemplate: "Meta Ads Launch Template",
    department: "Meta Ads",
    status: "Active",
    lastTriggered: "2025-07-19",
    triggerCount: 22,
    description:
      "Activates Meta Ads launch tasks including Business Manager access, pixel setup, audience research, creative brief, and campaign launch.",
    dependencies: [
      { ruleId: "ar-013", ruleName: "Client Onboarding — Invoice Paid", type: "requires"},
    ],
    testResults: {
      passed: true,
      testedAt: "2025-07-17",
      conditions: [
        { name: "Line Item Selected", met: true },
        { name: "Contract Signed", met: true },
        { name: "Setup Invoice Paid", met: true },
      ],
    },
    activityLog: [
      { date: "2025-07-19", action: "Rule triggered", by: "System", detail: "Client: Horizon Dental"},
    ],
    priority: 4,
    autoActivate: true,
    lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 5, dueDateOffset: 0, escalationAfterDays: 7, slaPriority: "Standard"},
  },
  {
    id: "ar-008",
    name: "Meta Ads Monthly — Client Activated",
    triggerEvent: "Client Activated",
    lineItem: "Meta Ads Monthly",
    contractRequirement: "Required",
    billingRequirement: "Recurring Invoice",
    conditions: ["Line Item Selected", "Contract Signed", "Recurring Invoice Active", "Prerequisites Satisfied"],
    taskTemplate: "Meta Ads Monthly Template",
    department: "Meta Ads",
    status: "Active",
    lastTriggered: "2025-07-01",
    triggerCount: 18,
    description:
      "Monthly Meta Ads management tasks: campaign optimization, creative refresh, audience updates, budget review, and performance reporting.",
    dependencies: [
      { ruleId: "ar-007", ruleName: "Meta Ads Launch — Invoice Paid", type: "requires"},
    ],
    testResults: null,
    activityLog: [
      { date: "2025-07-01", action: "Rule triggered", by: "System", detail: "Monthly cycle"},
    ],
    priority: 7,
    autoActivate: true,
    lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 10, dueDateOffset: 5, escalationAfterDays: 14, slaPriority: "Standard"},
  },

  //  LSA 
  {
    id: "ar-009",
    name: "LSA Setup — Invoice Paid",
    triggerEvent: "Invoice Paid",
    lineItem: "LSA Management",
    contractRequirement: "Required",
    billingRequirement: "Setup Invoice",
    conditions: ["Line Item Selected", "Contract Signed", "Setup Invoice Paid"],
    taskTemplate: "LSA Setup Template",
    department: "LSA",
    status: "Active",
    lastTriggered: "2025-07-15",
    triggerCount: 16,
    description:
      "Activates LSA verification and setup tasks when the LSA Management line item is sold and the invoice is paid.",
    dependencies: [
      { ruleId: "ar-013", ruleName: "Client Onboarding — Invoice Paid", type: "requires"},
    ],
    testResults: {
      passed: true,
      testedAt: "2025-07-14",
      conditions: [
        { name: "Line Item Selected", met: true },
        { name: "Contract Signed", met: true },
        { name: "Setup Invoice Paid", met: true },
      ],
    },
    activityLog: [
      { date: "2025-07-15", action: "Rule triggered", by: "System", detail: "Client: Maple Ridge Clinic"},
    ],
    priority: 4,
    autoActivate: true,
    lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 5, dueDateOffset: 0, escalationAfterDays: 8, slaPriority: "Standard"},
  },

  //  REPORTING 
  {
    id: "ar-010",
    name: "Reporting Setup — Invoice Paid",
    triggerEvent: "Invoice Paid",
    lineItem: "Reporting Dashboard",
    contractRequirement: "Required",
    billingRequirement: "Setup Invoice",
    conditions: ["Line Item Selected", "Contract Signed", "Setup Invoice Paid", "Client Onboarding Started"],
    taskTemplate: "Reporting Setup Template",
    department: "Reporting",
    status: "Active",
    lastTriggered: "2025-07-22",
    triggerCount: 38,
    description:
      "Configures the client reporting dashboard, connects all data sources, and delivers initial walkthrough upon invoice payment.",
    dependencies: [
      { ruleId: "ar-013", ruleName: "Client Onboarding — Invoice Paid", type: "requires"},
    ],
    testResults: {
      passed: true,
      testedAt: "2025-07-20",
      conditions: [
        { name: "Line Item Selected", met: true },
        { name: "Contract Signed", met: true },
        { name: "Setup Invoice Paid", met: true },
        { name: "Client Onboarding Started", met: true },
      ],
    },
    activityLog: [
      { date: "2025-07-22", action: "Rule triggered", by: "System", detail: "Client: Horizon Dental"},
    ],
    priority: 3,
    autoActivate: true,
    lineItemSLA: { firstResponseSLA: "2 business days", targetCompletionDays: 7, dueDateOffset: 0, escalationAfterDays: 10, slaPriority: "Standard"},
  },
  {
    id: "ar-011",
    name: "Reporting Monthly — Client Activated",
    triggerEvent: "Client Activated",
    lineItem: "Monthly Reporting",
    contractRequirement: "Required",
    billingRequirement: "Recurring Invoice",
    conditions: ["Line Item Selected", "Contract Signed", "Recurring Invoice Active"],
    taskTemplate: "Reporting Monthly Template",
    department: "Reporting",
    status: "Active",
    lastTriggered: "2025-07-01",
    triggerCount: 45,
    description:
      "Generates monthly reporting tasks for active clients: data collection, report drafting, AM review, and delivery.",
    dependencies: [
      { ruleId: "ar-010", ruleName: "Reporting Setup — Invoice Paid", type: "requires"},
    ],
    testResults: {
      passed: true,
      testedAt: "2025-07-08",
      conditions: [
        { name: "Line Item Selected", met: true },
        { name: "Recurring Invoice Active", met: true },
      ],
    },
    activityLog: [
      { date: "2025-07-01", action: "Rule triggered", by: "System", detail: "Monthly cycle — 19 clients"},
    ],
    priority: 8,
    autoActivate: true,
    lineItemSLA: { firstResponseSLA: "2 business days", targetCompletionDays: 7, dueDateOffset: 28, escalationAfterDays: 32, slaPriority: "Standard"},
  },

  //  WEB / CREATIVE 
  {
    id: "ar-012",
    name: "Website Build — Contract Signed",
    triggerEvent: "Contract Signed",
    lineItem: "Landing Page Build",
    contractRequirement: "Required",
    billingRequirement: "Contract Only",
    conditions: ["Line Item Selected", "Contract Signed"],
    taskTemplate: "Website Build Template",
    department: "Web Development",
    status: "Active",
    lastTriggered: "2025-07-14",
    triggerCount: 11,
    description:
      "Triggers the full website/landing page build workflow immediately on contract execution, without waiting for invoice payment. 9 tasks from discovery brief through to launch.",
    dependencies: [],
    testResults: {
      passed: true,
      testedAt: "2025-07-13",
      conditions: [
        { name: "Line Item Selected", met: true },
        { name: "Contract Signed", met: true },
      ],
    },
    activityLog: [
      { date: "2025-07-14", action: "Rule triggered", by: "System", detail: "Client: BlueSky Roofing"},
    ],
    priority: 1,
    autoActivate: true,
    lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 14, dueDateOffset: 0, escalationAfterDays: 18, slaPriority: "Standard"},
  },

  //  ONBOARDING 
  {
    id: "ar-013",
    name: "Client Onboarding — Invoice Paid",
    triggerEvent: "Invoice Paid",
    lineItem: "Client Onboarding",
    contractRequirement: "Required",
    billingRequirement: "Any Invoice",
    conditions: ["Line Item Selected", "Contract Signed", "Setup Invoice Paid"],
    taskTemplate: "Client Onboarding Template",
    department: "Account Management",
    status: "Active",
    lastTriggered: "2025-07-24",
    triggerCount: 52,
    description:
      "Master onboarding rule — fires first on any new client invoice. Generates AM assignment, welcome email, kickoff scheduling, and department activation tasks. All department setup rules depend on this.",
    dependencies: [],
    testResults: {
      passed: true,
      testedAt: "2025-07-23",
      conditions: [
        { name: "Line Item Selected", met: true },
        { name: "Contract Signed", met: true },
        { name: "Setup Invoice Paid", met: true },
      ],
    },
    activityLog: [
      { date: "2025-07-24", action: "Rule triggered", by: "System", detail: "Client: Maple Ridge Clinic"},
      { date: "2025-07-22", action: "Rule triggered", by: "System", detail: "Client: Horizon Dental"},
      { date: "2025-07-23", action: "Test passed", by: "Admin"},
    ],
    priority: 1,
    autoActivate: true,
    lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 4, dueDateOffset: 0, escalationAfterDays: 6, slaPriority: "Standard"},
  },

  //  RENEWALS 
  {
    id: "ar-014",
    name: "Renewal Process — Renewal Signed",
    triggerEvent: "Renewal Signed",
    lineItem: "Contract Renewal",
    contractRequirement: "Required",
    billingRequirement: "Contract Only",
    conditions: ["Contract Signed"],
    taskTemplate: "Renewal Process Template",
    department: "Account Management",
    status: "Active",
    lastTriggered: "2025-07-16",
    triggerCount: 19,
    description:
      "Activates the renewal task sequence when a renewal contract is signed. Includes 60-day notice, performance review, proposal, renewal call, and contract execution.",
    dependencies: [],
    testResults: {
      passed: true,
      testedAt: "2025-07-15",
      conditions: [
        { name: "Contract Signed", met: true },
      ],
    },
    activityLog: [
      { date: "2025-07-16", action: "Rule triggered", by: "System", detail: "Client: Prestige Law Group"},
    ],
    priority: 1,
    autoActivate: true,
    lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 4, dueDateOffset: 0, escalationAfterDays: 6, slaPriority: "Standard"},
  },

  //  CANCELLATIONS 
  {
    id: "ar-015",
    name: "Cancellation Process — Cancellation Requested",
    triggerEvent: "Cancellation Requested",
    lineItem: "Cancellation Request",
    contractRequirement: "Not Required",
    billingRequirement: "None",
    conditions: ["Prerequisites Satisfied"],
    taskTemplate: "Cancellation Process Template",
    department: "Account Management",
    status: "Active",
    lastTriggered: "2025-07-21",
    triggerCount: 7,
    description:
      "Fires immediately when a cancellation request is submitted. Generates acknowledgement, retention call, exit survey, billing stop, and offboarding trigger tasks.",
    dependencies: [],
    testResults: {
      passed: true,
      testedAt: "2025-07-20",
      conditions: [
        { name: "Prerequisites Satisfied", met: true },
      ],
    },
    activityLog: [
      { date: "2025-07-21", action: "Rule triggered", by: "System", detail: "Client: Clearwater Spa"},
    ],
    priority: 1,
    autoActivate: true,
    lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 3, dueDateOffset: 0, escalationAfterDays: 5, slaPriority: "Standard"},
  },

  //  OFFBOARDING 
  {
    id: "ar-016",
    name: "Offboarding Process — Offboarding Approved",
    triggerEvent: "Offboarding Approved",
    lineItem: "Offboarding Process",
    contractRequirement: "Not Required",
    billingRequirement: "None",
    conditions: ["Prerequisites Satisfied"],
    taskTemplate: "Offboarding Process Template",
    department: "Account Management",
    status: "Active",
    lastTriggered: "2025-07-22",
    triggerCount: 5,
    description:
      "Full client offboarding: final report, access transfer, campaign shutdown, domain release, account closure, and NPS survey.",
    dependencies: [
      { ruleId: "ar-015", ruleName: "Cancellation Process — Cancellation Requested", type: "requires"},
    ],
    testResults: {
      passed: true,
      testedAt: "2025-07-21",
      conditions: [
        { name: "Prerequisites Satisfied", met: true },
      ],
    },
    activityLog: [
      { date: "2025-07-22", action: "Rule triggered", by: "System", detail: "Client: Clearwater Spa"},
    ],
    priority: 2,
    autoActivate: true,
    lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 5, dueDateOffset: 0, escalationAfterDays: 7, slaPriority: "Standard"},
  },

  //  UPSELL 
  {
    id: "ar-017",
    name: "Upsell Activation — Upsell Approved",
    triggerEvent: "Upsell Approved",
    lineItem: "Upsell Service",
    contractRequirement: "Required",
    billingRequirement: "Any Invoice",
    conditions: ["Line Item Selected", "Contract Signed", "Setup Invoice Paid"],
    taskTemplate: "Upsell Activation Template",
    department: "Account Management",
    status: "Active",
    lastTriggered: "2025-07-18",
    triggerCount: 12,
    description:
      "Activates when an upsell proposal is approved and signed. Generates confirmation, new invoice, scope alignment, and service setup tasks.",
    dependencies: [],
    testResults: {
      passed: true,
      testedAt: "2025-07-17",
      conditions: [
        { name: "Line Item Selected", met: true },
        { name: "Contract Signed", met: true },
      ],
    },
    activityLog: [
      { date: "2025-07-18", action: "Rule triggered", by: "System", detail: "Client: Prestige Law Group — Meta Ads upsell"},
    ],
    priority: 1,
    autoActivate: true,
    lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 5, dueDateOffset: 0, escalationAfterDays: 7, slaPriority: "Priority"},
  },
  {
    id: "ar-018",
    name: "Budget Reallocation — Upsell Approved",
    triggerEvent: "Upsell Approved",
    lineItem: "Budget Change Request",
    contractRequirement: "Optional",
    billingRequirement: "None",
    conditions: ["Line Item Selected", "Prerequisites Satisfied"],
    taskTemplate: "Budget Reallocation Template",
    department: "Paid Advertising",
    status: "Active",
    lastTriggered: "2025-07-12",
    triggerCount: 9,
    description:
      "Fires when a budget reallocation request is approved. Coordinates campaign budget changes across PPC and Meta Ads with internal notification and client confirmation.",
    dependencies: [],
    testResults: {
      passed: true,
      testedAt: "2025-07-11",
      conditions: [
        { name: "Line Item Selected", met: true },
        { name: "Prerequisites Satisfied", met: true },
      ],
    },
    activityLog: [
      { date: "2025-07-12", action: "Rule triggered", by: "System", detail: "Client: Summit Auto Group — PPC to Meta shift"},
    ],
    priority: 2,
    autoActivate: false,
    lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 4, dueDateOffset: 0, escalationAfterDays: 6, slaPriority: "Standard"},
  },

  //  CREATIVE 
  {
    id: "ar-019",
    name: "Creative Production — Contract Signed",
    triggerEvent: "Contract Signed",
    lineItem: "Creative Package",
    contractRequirement: "Required",
    billingRequirement: "Contract Only",
    conditions: ["Line Item Selected", "Contract Signed"],
    taskTemplate: "Creative Production Template",
    department: "Creative",
    status: "Active",
    lastTriggered: "2025-07-11",
    triggerCount: 8,
    description:
      "Activates the creative production workflow on contract signing. Includes brief review, concept development, client approval, production, QA, and delivery. 6 tasks, 5 business day target.",
    dependencies: [],
    testResults: null,
    activityLog: [
      { date: "2025-07-11", action: "Rule triggered", by: "System", detail: "Client: BlueSky Roofing — Brand Package"},
    ],
    priority: 1,
    autoActivate: true,
    lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 8, dueDateOffset: 5, escalationAfterDays: 12, slaPriority: "Standard"},
  },

  //  STRATEGY / QBR 
  {
    id: "ar-020",
    name: "Strategy Consulting — Invoice Paid",
    triggerEvent: "Invoice Paid",
    lineItem: "Strategy Consulting",
    contractRequirement: "Required",
    billingRequirement: "Any Invoice",
    conditions: ["Line Item Selected", "Contract Signed", "Setup Invoice Paid"],
    taskTemplate: "Strategy Consulting Template",
    department: "Account Management",
    status: "Pending Review",
    lastTriggered: null,
    triggerCount: 0,
    description:
      "Activates quarterly strategy session tasks when the Strategy Consulting add-on is purchased. Includes Q data aggregation, strategy deck, internal review, session call, and action plan delivery. Currently pending final configuration review.",
    dependencies: [],
    testResults: null,
    activityLog: [
      { date: "2025-07-04", action: "Rule created", by: "Admin"},
      { date: "2025-07-05", action: "Sent for review", by: "Admin"},
    ],
    priority: 3,
    autoActivate: false,
    lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 5, dueDateOffset: 3, escalationAfterDays: 8, slaPriority: "Priority"},
  },
  {
    id: "ar-021",
    name: "Quarterly Business Review — Client Activated",
    triggerEvent: "Client Activated",
    lineItem: "QBR Session",
    contractRequirement: "Required",
    billingRequirement: "Recurring Invoice",
    conditions: ["Line Item Selected", "Contract Signed", "Recurring Invoice Active", "Prerequisites Satisfied"],
    taskTemplate: "Quarterly Business Review Template",
    department: "Account Management",
    status: "Pending Review",
    lastTriggered: null,
    triggerCount: 0,
    description:
      "Activates the full quarterly business review workflow every 90 days for premium clients. Includes QBR data pull, deck prep, director review, meeting, follow-up, and roadmap update. Template in draft state — pending activation.",
    dependencies: [
      { ruleId: "ar-011", ruleName: "Reporting Monthly — Client Activated", type: "requires"},
    ],
    testResults: null,
    activityLog: [
      { date: "2025-07-02", action: "Rule created", by: "Admin"},
    ],
    priority: 9,
    autoActivate: false,
    lineItemSLA: { firstResponseSLA: "2 business days", targetCompletionDays: 5, dueDateOffset: 85, escalationAfterDays: 90, slaPriority: "Standard"},
  },

  //  ADDITIONAL RULES 
  {
    id: "ar-022",
    name: "Proposal Approval — Activate Sales Workflow",
    triggerEvent: "Proposal Approved",
    lineItem: "Any Proposal",
    contractRequirement: "Not Required",
    billingRequirement: "None",
    conditions: ["Line Item Selected"],
    taskTemplate: "Sales Close Template",
    department: "Account Management",
    status: "Active",
    lastTriggered: "2025-07-24",
    triggerCount: 63,
    description:
      "Fires immediately when a proposal is approved by the client. Generates contract preparation and billing setup tasks to fast-track the close process.",
    dependencies: [],
    testResults: {
      passed: true,
      testedAt: "2025-07-22",
      conditions: [
        { name: "Line Item Selected", met: true },
      ],
    },
    activityLog: [
      { date: "2025-07-24", action: "Rule triggered", by: "System", detail: "Client: Horizon Dental"},
    ],
    priority: 1,
    autoActivate: true,
    lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 2, dueDateOffset: 0, escalationAfterDays: 3, slaPriority: "Standard"},
  },
  {
    id: "ar-023",
    name: "LSA Monthly — Client Activated",
    triggerEvent: "Client Activated",
    lineItem: "LSA Monthly Management",
    contractRequirement: "Required",
    billingRequirement: "Recurring Invoice",
    conditions: ["Line Item Selected", "Contract Signed", "Recurring Invoice Active"],
    taskTemplate: "LSA Monthly Template",
    department: "LSA",
    status: "Active",
    lastTriggered: "2025-07-01",
    triggerCount: 14,
    description:
      "Monthly LSA management tasks including lead review, budget optimization, review response, and monthly reporting.",
    dependencies: [
      { ruleId: "ar-009", ruleName: "LSA Setup — Invoice Paid", type: "requires"},
    ],
    testResults: {
      passed: true,
      testedAt: "2025-07-08",
      conditions: [
        { name: "Line Item Selected", met: true },
        { name: "Recurring Invoice Active", met: true },
      ],
    },
    activityLog: [
      { date: "2025-07-01", action: "Rule triggered", by: "System", detail: "Monthly cycle"},
    ],
    priority: 7,
    autoActivate: true,
    lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 6, dueDateOffset: 3, escalationAfterDays: 10, slaPriority: "Standard"},
  },
];

//  Design helpers 

const TRIGGER_CFG: Record<TriggerEvent, { bg?: string; color?: string; border: string; icon?: string }> = {
  "Proposal Approved":      { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE"},
  "Contract Signed":        { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0", icon: ""},
  "Invoice Paid":           { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA"},
  "Client Activated":       { bg: "#FAF5FF", color: "#7C3AED", border: "#DDD6FE"},
  "Upsell Approved":        { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A"},
  "Renewal Signed":         { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0"},
  "Cancellation Requested": { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA"},
  "Offboarding Approved":   { bg: "#FFF1F2", color: "#BE123C", border: "#FECDD3"},
};

const STATUS_CFG: Record<RuleStatus, { bg?: string; color?: string; border: string; dot: string }> = {
  "Active":         { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0", dot: "#10B981"},
  "Inactive":       { bg: "#F8FAFC", color: "#94A3B8", border: "#CBD5E1", dot: "#CBD5E1"},
  "Pending Review": { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A", dot: "#F59E0B"},
};

const CONTRACT_CFG: Record<ContractRequirement, { bg?: string; color?: string }> = {
  "Required":     { bg: "#EFF6FF", color: "#1D4ED8"},
  "Optional":     { bg: "#FFFBEB", color: "#D97706"},
  "Not Required": { bg: "#F8FAFC", color: "#94A3B8"},
};

const BILLING_CFG: Record<BillingRequirement, { bg?: string; color?: string }> = {
  "Setup Invoice":     { bg: "#FFF7ED", color: "#C2410C"},
  "Recurring Invoice": { bg: "#FAF5FF", color: "#7C3AED"},
  "Any Invoice":       { bg: "#ECFDF5", color: "#059669"},
  "Contract Only":     { bg: "#EFF6FF", color: "#1D4ED8"},
  "None":              { bg: "#F8FAFC", color: "#94A3B8"},
};

const DEPT_CFG: Record<Department, { bg?: string; color?: string; border: string }> = {
  "SEO":                { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE"},
  "GBP":                { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0"},
  "Paid Advertising":   { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA"},
  "Meta Ads":           { bg: "#FAF5FF", color: "#7C3AED", border: "#DDD6FE"},
  "LSA":                { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0"},
  "Reporting":          { bg: "#ECFEFF", color: "#0891B2", border: "#A5F3FC"},
  "Web Development":    { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0"},
  "Creative":           { bg: "#FFF1F2", color: "#BE123C", border: "#FECDD3"},
  "Account Management": { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A"},
  "Billing":            { bg: "#F8FAFC", color: "#475569", border: "#CBD5E1"},
};

const DEP_TYPE_CFG: Record<string, { bg?: string; color?: string }> = {
  "blocks":   { bg: "#FEF2F2", color: "#DC2626"},
  "triggers": { bg: "#ECFDF5", color: "#059669"},
  "requires": { bg: "#EFF6FF", color: "#1D4ED8"},
};

//  Small badges 

function TriggerBadge({ trigger }: { trigger: TriggerEvent }) {
  const c = TRIGGER_CFG[trigger];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap"style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
    >
      <span>{c.icon}</span>
      {trigger}
    </span>
  );
}

function StatusBadge({ status }: { status: RuleStatus }) {
  const c = STATUS_CFG[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap"style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"style={{ background: c.dot }} />
      {status}
    </span>
  );
}

function ContractBadge({ req }: { req: ContractRequirement }) {
  const c = CONTRACT_CFG[req];
  return (
    <span
      className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full"style={{ background: c.bg, color: c.color }}
    >
      {req}
    </span>
  );
}

function BillingBadge({ req }: { req: BillingRequirement }) {
  const c = BILLING_CFG[req];
  return (
    <span
      className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full"style={{ background: c.bg, color: c.color }}
    >
      {req}
    </span>
  );
}

function DeptBadge({ dept }: { dept: Department }) {
  const c = DEPT_CFG[dept];
  return (
    <span
      className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full"style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
    >
      {dept}
    </span>
  );
}

//  Rule Detail Drawer 

type DrawerTab = "overview"| "conditions"| "line-items"| "templates"| "dependencies"| "test"| "activity";

function RuleDrawer({
  rule,
  onClose,
}: {
  rule: ActivationRule;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<DrawerTab>("overview");

  const tabs: { id: DrawerTab; label: string }[] = [
    { id: "overview",     label: "Overview"},
    { id: "conditions",   label: "Conditions"},
    { id: "line-items",   label: "Line Items"},
    { id: "templates",    label: "Task Templates"},
    { id: "dependencies", label: `Dependencies (${rule.dependencies.length})` },
    { id: "test",         label: "Test Results"},
    { id: "activity",     label: "Activity Log"},
  ];

  const trigCfg = TRIGGER_CFG[rule.triggerEvent];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"style={{ background: "rgba(0,0,0,0.35)"}}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="h-full w-full max-w-2xl flex flex-col overflow-hidden shadow-2xl"style={{ background: "var(--rtm-surface)"}}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between px-6 py-5"style={{ borderBottom: "1px solid var(--rtm-border)", background: trigCfg.bg }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[11px] font-bold uppercase tracking-widest"style={{ color: trigCfg.color }}>
                {rule.id}
              </span>
              <StatusBadge status={rule.status} />
              {rule.autoActivate && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"style={{ background: "rgba(255,255,255,0.8)", color: trigCfg.color }}
                >
                   Auto-Activate
                </span>
              )}
            </div>
            <h2 className="text-lg font-extrabold mt-1"style={{ color: "var(--rtm-text-primary)"}}>
              {rule.name}
            </h2>
            <p className="text-xs mt-1 max-w-lg"style={{ color: "var(--rtm-text-secondary)"}}>
              {rule.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg hover:opacity-70 transition-opacity"style={{ background: "rgba(0,0,0,0.08)", color: "var(--rtm-text-primary)"}}
          >
            ×
          </button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-0"style={{ borderBottom: "1px solid var(--rtm-border)"}}>
          {[
            { label: "Trigger Count", value: rule.triggerCount },
            { label: "Priority", value: `#${rule.priority}` },
            { label: "Conditions", value: rule.conditions.length },
            { label: "Last Fired", value: rule.lastTriggered ?? "Never"},
          ].map((s, i) => (
            <div
              key={s.label}
              className="px-4 py-3 text-center"style={{
                borderRight: i < 3 ? "1px solid var(--rtm-border)": undefined,
                background: "var(--rtm-bg)",
              }}
            >
              <div className="text-lg font-black"style={{ color: "var(--rtm-text-primary)"}}>{s.value}</div>
              <div className="text-[10px] font-semibold mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto"style={{ borderBottom: "1px solid var(--rtm-border)"}}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-3 text-xs font-bold whitespace-nowrap transition-colors flex-shrink-0"style={{
                color: activeTab === tab.id ? "var(--rtm-blue)": "var(--rtm-text-secondary)",
                borderBottom: activeTab === tab.id ? "2px solid var(--rtm-blue)": "2px solid transparent",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/*  OVERVIEW  */}
          {activeTab === "overview"&& (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Trigger Event",
                    content: <TriggerBadge trigger={rule.triggerEvent} />,
                  },
                  {
                    label: "Department",
                    content: <DeptBadge dept={rule.department} />,
                  },
                  {
                    label: "Contract Requirement",
                    content: <ContractBadge req={rule.contractRequirement} />,
                  },
                  {
                    label: "Billing Requirement",
                    content: <BillingBadge req={rule.billingRequirement} />,
                  },
                  {
                    label: "Line Item",
                    content: <span className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>{rule.lineItem}</span>,
                  },
                  {
                    label: "Task Template",
                    content: <span className="text-sm font-semibold"style={{ color: "var(--rtm-blue)"}}>{rule.taskTemplate}</span>,
                  },
                  {
                    label: "Auto Activate",
                    content: (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"style={{ background: rule.autoActivate ? "#ECFDF5": "#F8FAFC", color: rule.autoActivate ? "#059669": "#94A3B8"}}
                      >
                        {rule.autoActivate ? "Enabled": "Manual"}
                      </span>
                    ),
                  },
                  {
                    label: "Evaluation Priority",
                    content: <span className="text-sm font-black"style={{ color: "var(--rtm-text-primary)"}}>#{rule.priority}</span>,
                  },
                ].map(({ label, content }) => (
                  <div
                    key={label}
                    className="rounded-xl p-3"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5"style={{ color: "var(--rtm-text-muted)"}}>
                      {label}
                    </div>
                    {content}
                  </div>
                ))}
              </div>

              {/* Flow preview */}
              <div
                className="rounded-xl p-4"style={{ background: "#EFF6FF", border: "1px solid #BFDBFE"}}
              >
                <div className="text-xs font-bold mb-3"style={{ color: "#1D4ED8"}}>Activation Flow</div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {[
                    { label: rule.lineItem },
                    "→",
                    { label: rule.triggerEvent, icon: trigCfg.icon },
                    "→",
                    { label: rule.taskTemplate },
                    "→",
                    { label: rule.department },
                  ].map((step, i) =>
                    step === "→"? (
                      <span key={i} className="font-black"style={{ color: "#60A5FA"}}>→</span>
                    ) : (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-semibold"style={{ background: "rgba(255,255,255,0.8)", color: "#1D4ED8", border: "1px solid #BFDBFE"}}
                      >
                        <span>{(step as { label: string; icon?: string }).icon}</span>
                        {(step as { label: string; icon?: string }).label}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Pseudo-code */}
              <div
                className="rounded-xl p-4"style={{ background: "#0F172A", border: "1px solid #1E293B"}}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider mb-2"style={{ color: "#64748B"}}>
                  Rule Logic
                </div>
                <pre className="text-xs leading-relaxed font-mono"style={{ color: "#7DD3FC"}}>
{`RULE ${rule.id}: "${rule.name}"WHEN   trigger_event = "${rule.triggerEvent}"
AND    line_item IN ["${rule.lineItem}"]
AND    contract_status ${rule.contractRequirement === "Required"? "= SIGNED": rule.contractRequirement === "Not Required"? "= ANY": "= SIGNED | PENDING"}
AND    billing_status ${rule.billingRequirement === "None"? "= ANY": `= "${rule.billingRequirement.toUpperCase().replace("", "_")}"`}
${rule.conditions.map(c => `AND    condition.${c.replace(/ /g, "_").toLowerCase()} = TRUE`).join("\n")}

THEN   activate("${rule.taskTemplate}")
       → department: "${rule.department}"→ mode: ${rule.autoActivate ? '"auto"' : '"manual"'}
       → priority: ${rule.priority}`}
                </pre>
              </div>
            </div>
          )}

          {/*  CONDITIONS  */}
          {activeTab === "conditions"&& (
            <div className="space-y-4">
              <div className="text-xs font-bold"style={{ color: "var(--rtm-text-primary)"}}>
                Required Conditions ({rule.conditions.length})
              </div>
              <div className="space-y-2">
                {rule.conditions.map((cond, i) => (
                  <div
                    key={cond}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}
                  >
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-white flex-shrink-0"style={{ background: "var(--rtm-blue)"}}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm font-semibold flex-1"style={{ color: "var(--rtm-text-primary)"}}>
                      {cond}
                    </span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"style={{ background: "#ECFDF5", color: "#059669"}}
                    >
                       Required
                    </span>
                  </div>
                ))}
              </div>

              <div className="rounded-xl p-4"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                <div className="text-xs font-bold mb-3"style={{ color: "var(--rtm-text-primary)"}}>
                  Contract &amp; Billing Gates
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm"style={{ color: "var(--rtm-text-secondary)"}}>Contract Requirement</span>
                    <ContractBadge req={rule.contractRequirement} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm"style={{ color: "var(--rtm-text-secondary)"}}>Billing Requirement</span>
                    <BillingBadge req={rule.billingRequirement} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/*  LINE ITEMS  */}
          {activeTab === "line-items"&& (
            <div className="space-y-4">
              <div className="text-xs font-bold"style={{ color: "var(--rtm-text-primary)"}}>
                Mapped Line Item &amp; SLA
              </div>
              <div
                className="rounded-xl p-5 flex items-center gap-4"style={{ background: "var(--rtm-bg)", border: "2px solid var(--rtm-border)"}}
              >
                
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1"style={{ color: "var(--rtm-text-muted)"}}>
                    Primary Line Item
                  </div>
                  <div className="text-lg font-black"style={{ color: "var(--rtm-text-primary)"}}>
                    {rule.lineItem}
                  </div>
                </div>
              </div>

              {/* Line Item SLA — Primary Delivery Source */}
              <div className="rounded-xl p-4"style={{ background: "#EFF6FF", border: "2px solid #BFDBFE"}}>
                <div className="text-[10px] font-black uppercase tracking-wider mb-3"style={{ color: "#1D4ED8"}}>Line Item SLA — Primary Delivery Source</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "First Response SLA", value: rule.lineItemSLA.firstResponseSLA, color: "#1D4ED8"},
                    { label: "Target Completion", value: `${rule.lineItemSLA.targetCompletionDays} business days`, color: "#059669"},
                    { label: "Due Date Offset", value: rule.lineItemSLA.dueDateOffset > 0 ? `Day ${rule.lineItemSLA.dueDateOffset}` : "Immediate", color: "#374151"},
                    { label: "Escalation After", value: `${rule.lineItemSLA.escalationAfterDays} days`, color: "#C2410C"},
                    { label: "SLA Priority", value: rule.lineItemSLA.slaPriority, color: rule.lineItemSLA.slaPriority === "Priority"? "#1D4ED8": rule.lineItemSLA.slaPriority === "Rush"? "#BE123C": "#374151"},
                  ].map((r) => (
                    <div key={r.label} className="rounded-lg p-2.5"style={{ background: "rgba(255,255,255,0.8)", border: "1px solid #BFDBFE"}}>
                      <div className="text-[9px] font-bold uppercase tracking-wide mb-1"style={{ color: "#6B7280"}}>{r.label}</div>
                      <div className="text-xs font-black"style={{ color: r.color }}>{r.value}</div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] mt-2"style={{ color: "#1E40AF"}}>Department SLA is a fallback default only. This line item SLA is the primary delivery commitment.</p>
              </div>

              <div className="rounded-xl p-4"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                <div className="text-xs font-bold mb-3"style={{ color: "var(--rtm-text-primary)"}}>
                  Billing Gate
                </div>
                <div className="flex items-center gap-3">
                  
                  <div>
                    <BillingBadge req={rule.billingRequirement} />
                    <div className="text-xs mt-1"style={{ color: "var(--rtm-text-muted)"}}>
                      {rule.billingRequirement === "Setup Invoice"? "Rule fires when the one-time setup invoice is collected.": rule.billingRequirement === "Recurring Invoice"? "Rule fires when a recurring monthly invoice is active.": rule.billingRequirement === "Any Invoice"? "Rule fires on any paid invoice for this line item.": rule.billingRequirement === "Contract Only"? "Rule fires on contract execution — no invoice required.": "No billing gate required."}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl p-4"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                <div className="text-xs font-bold mb-3"style={{ color: "var(--rtm-text-primary)"}}>
                  Contract Gate
                </div>
                <div className="flex items-center gap-3">
                  
                  <div>
                    <ContractBadge req={rule.contractRequirement} />
                    <div className="text-xs mt-1"style={{ color: "var(--rtm-text-muted)"}}>
                      {rule.contractRequirement === "Required"? "A signed contract must be on file before this rule can fire.": rule.contractRequirement === "Optional"? "Contract is preferred but not enforced for this rule.": "No contract is required for this activation."}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/*  TASK TEMPLATES  */}
          {activeTab === "templates"&& (
            <div className="space-y-4">
              <div className="text-xs font-bold"style={{ color: "var(--rtm-text-primary)"}}>
                Mapped Task Template
              </div>
              <div
                className="rounded-xl p-5"style={{ background: "var(--rtm-bg)", border: "2px solid var(--rtm-border)"}}
              >
                <div className="flex items-start gap-4">
                  
                  <div className="flex-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1"style={{ color: "var(--rtm-text-muted)"}}>
                      Task Template
                    </div>
                    <div className="text-lg font-black mb-2"style={{ color: "var(--rtm-blue)"}}>
                      {rule.taskTemplate}
                    </div>
                    <DeptBadge dept={rule.department} />
                  </div>
                </div>
              </div>

              <div
                className="rounded-xl p-4"style={{ background: "#EFF6FF", border: "1px solid #BFDBFE"}}
              >
                <div className="text-xs font-bold mb-2"style={{ color: "#1D4ED8"}}>
                  Department Activation
                </div>
                <p className="text-xs"style={{ color: "#1E40AF"}}>
                  When this rule fires, the <strong>{rule.taskTemplate}</strong> will be instantiated and all tasks assigned to the{""}
                  <strong>{rule.department}</strong> department. SLA tracking will update automatically.
                </p>
                <Link
                  href="/tasks/templates"className="inline-flex items-center gap-1 mt-3 text-xs font-bold"style={{ color: "#1D4ED8"}}
                >
                  View full template →
                </Link>
              </div>
            </div>
          )}

          {/*  DEPENDENCIES  */}
          {activeTab === "dependencies"&& (
            <div className="space-y-4">
              {rule.dependencies.length === 0 ? (
                <div className="text-center py-10"style={{ color: "var(--rtm-text-muted)"}}>
                  
                  <div className="text-sm font-semibold">No rule dependencies configured.</div>
                  <div className="text-xs mt-1">This rule evaluates independently.</div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs font-bold"style={{ color: "var(--rtm-text-primary)"}}>
                    Rule Dependencies ({rule.dependencies.length})
                  </div>
                  {rule.dependencies.map((dep) => {
                    const cfg = DEP_TYPE_CFG[dep.type] ?? { bg: "#F8FAFC", color: "#64748B"};
                    return (
                      <div
                        key={dep.ruleId}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl"style={{ background: cfg.bg, border: `1px solid ${cfg.color}33` }}
                      >
                        
                        <div className="flex-1">
                          <div className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>
                            {dep.ruleName}
                          </div>
                          <div className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>{dep.ruleId}</div>
                        </div>
                        <span
                          className="text-[11px] font-bold px-2.5 py-1 rounded-full capitalize"style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}55` }}
                        >
                          {dep.type}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="rounded-xl p-4"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                <div className="text-xs font-bold mb-3"style={{ color: "var(--rtm-text-primary)"}}>Dependency Types</div>
                <div className="space-y-2">
                  {(["blocks", "triggers", "requires"] as const).map((t) => {
                    const c = DEP_TYPE_CFG[t];
                    const desc = t === "blocks"? "This rule cannot fire until the dependency is resolved.": t === "triggers"? "This rule fires after the dependency rule completes.": "The dependency rule must have fired at least once.";
                    return (
                      <div key={t} className="flex items-start gap-2">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded capitalize flex-shrink-0"style={{ background: c.bg, color: c.color }}
                        >
                          {t}
                        </span>
                        <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>{desc}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/*  TEST RESULTS  */}
          {activeTab === "test"&& (
            <div className="space-y-4">
              {rule.testResults === null ? (
                <div className="text-center py-10"style={{ color: "var(--rtm-text-muted)"}}>
                  
                  <div className="text-sm font-semibold">No test results available.</div>
                  <div className="text-xs mt-1">Run a test to validate rule conditions.</div>
                  <button
                    className="mt-4 px-4 py-2 rounded-lg text-sm font-bold text-white"style={{ background: "var(--rtm-blue)"}}
                  >
                    Run Test
                  </button>
                </div>
              ) : (
                <>
                  <div
                    className="rounded-xl p-4 flex items-center gap-4"style={{
                      background: rule.testResults.passed ? "#ECFDF5": "#FEF2F2",
                      border: `1px solid ${rule.testResults.passed ? "#A7F3D0": "#FECACA"}`,
                    }}
                  >
                    <span className="text-3xl">{rule.testResults.passed ? "": ""}</span>
                    <div>
                      <div
                        className="font-extrabold text-sm"style={{ color: rule.testResults.passed ? "#059669": "#DC2626"}}
                      >
                        Test {rule.testResults.passed ? "Passed": "Failed"}
                      </div>
                      <div className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>
                        Last run: {rule.testResults.testedAt}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold"style={{ color: "var(--rtm-text-primary)"}}>
                      Condition Results
                    </div>
                    {rule.testResults.conditions.map((cond) => (
                      <div
                        key={cond.name}
                        className="flex items-center justify-between px-4 py-3 rounded-xl"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}
                      >
                        <span className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>
                          {cond.name}
                        </span>
                        <span
                          className="text-[11px] font-bold px-2 py-0.5 rounded-full"style={{
                            background: cond.met ? "#ECFDF5": "#FEF2F2",
                            color: cond.met ? "#059669": "#DC2626",
                          }}
                        >
                          {cond.met ? "Met": "Not Met"}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    className="w-full px-4 py-2 rounded-lg text-sm font-bold text-white"style={{ background: "var(--rtm-blue)"}}
                  >
                    Re-run Test
                  </button>
                </>
              )}
            </div>
          )}

          {/*  ACTIVITY LOG  */}
          {activeTab === "activity"&& (
            <div className="space-y-3">
              <div className="text-xs font-bold"style={{ color: "var(--rtm-text-primary)"}}>
                Activity Log ({rule.activityLog.length} entries)
              </div>
              {rule.activityLog.map((entry, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 px-4 py-3 rounded-xl"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"style={{ background: "var(--rtm-blue)"}} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>
                        {entry.action}
                      </span>
                      <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>by {entry.by}</span>
                    </div>
                    {entry.detail && (
                      <div className="text-xs mt-0.5"style={{ color: "var(--rtm-text-secondary)"}}>
                        {entry.detail}
                      </div>
                    )}
                  </div>
                  <span className="text-xs flex-shrink-0"style={{ color: "var(--rtm-text-muted)"}}>
                    {entry.date}
                  </span>
                </div>
              ))}

              <div className="rounded-xl p-4"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                <div className="text-xs font-bold mb-2"style={{ color: "var(--rtm-text-primary)"}}>Add Note</div>
                <textarea
                  rows={3}
                  placeholder="Add a note to the activity log..."className="w-full text-sm p-2 rounded-lg resize-none outline-none"style={{
                    background: "var(--rtm-surface)",
                    border: "1px solid var(--rtm-border)",
                    color: "var(--rtm-text-primary)",
                  }}
                />
                <button
                  className="mt-2 px-4 py-1.5 rounded-lg text-xs font-bold text-white"style={{ background: "var(--rtm-blue)"}}
                >
                  Add Note
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex items-center gap-2 flex-wrap"style={{ borderTop: "1px solid var(--rtm-border)"}}
        >
          <button
            className="px-4 py-2 rounded-lg text-sm font-bold text-white"style={{ background: "var(--rtm-blue)"}}
          >
            Edit Rule
          </button>
          <button
            className="px-4 py-2 rounded-lg text-sm font-semibold border"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)"}}
          >
            Test Rule
          </button>
          <button
            className="px-4 py-2 rounded-lg text-sm font-semibold border"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)"}}
          >
            View Dependencies
          </button>
          <button
            className="px-4 py-2 rounded-lg text-sm font-semibold"style={{
              background: rule.status === "Active"? "#FEF2F2": "#ECFDF5",
              color: rule.status === "Active"? "#DC2626": "#059669",
            }}
          >
            {rule.status === "Active"? "Deactivate": "Activate"}
          </button>
          <button
            className="ml-auto px-4 py-2 rounded-lg text-sm font-semibold"style={{ color: "var(--rtm-text-muted)"}}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

//  Main Page 

const ALL_TRIGGERS: (TriggerEvent | "All")[] = [
  "All",
  "Proposal Approved",
  "Contract Signed",
  "Invoice Paid",
  "Client Activated",
  "Upsell Approved",
  "Renewal Signed",
  "Cancellation Requested",
  "Offboarding Approved",
];

const ALL_DEPARTMENTS: (Department | "All")[] = [
  "All", "SEO", "GBP", "Paid Advertising", "Meta Ads", "LSA",
  "Reporting", "Web Development", "Creative", "Account Management", "Billing",
];

const ALL_STATUSES: (RuleStatus | "All")[] = ["All", "Active", "Inactive", "Pending Review"];

export default function ActivationRulesPage() {
  const [selectedRule, setSelectedRule] = useState<ActivationRule | null>(null);
  const [search, setSearch] = useState("");
  const [filterTrigger, setFilterTrigger] = useState<TriggerEvent | "All">("All");
  const [filterDept, setFilterDept] = useState<Department | "All">("All");
  const [filterStatus, setFilterStatus] = useState<RuleStatus | "All">("All");

  //  Derived 
  const filtered = useMemo(() => {
    return ACTIVATION_RULES.filter((r) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.lineItem.toLowerCase().includes(q) ||
        r.taskTemplate.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q);
      const matchTrigger = filterTrigger === "All"|| r.triggerEvent === filterTrigger;
      const matchDept = filterDept === "All"|| r.department === filterDept;
      const matchStatus = filterStatus === "All"|| r.status === filterStatus;
      return matchSearch && matchTrigger && matchDept && matchStatus;
    }).sort((a, b) => a.priority - b.priority);
  }, [search, filterTrigger, filterDept, filterStatus]);

  //  KPIs 
  const kpis = useMemo(() => {
    const total = ACTIVATION_RULES.length;
    const active = ACTIVATION_RULES.filter((r) => r.status === "Active").length;
    const inactive = ACTIVATION_RULES.filter((r) => r.status === "Inactive").length;
    const pending = ACTIVATION_RULES.filter((r) => r.status === "Pending Review").length;
    const totalTriggers = ACTIVATION_RULES.reduce((s, r) => s + r.triggerCount, 0);
    const depts = new Set(ACTIVATION_RULES.map((r) => r.department)).size;
    const blocked = ACTIVATION_RULES.filter(
      (r) => r.status === "Active"&& r.dependencies.some((d) => d.type === "blocks")
    ).length;
    const recent = ACTIVATION_RULES.filter((r) => r.lastTriggered === "2025-07-24"|| r.lastTriggered === "2025-07-23"|| r.lastTriggered === "2025-07-22").length;
    return { total, active, inactive, pending, totalTriggers, depts, blocked, recent };
  }, []);

  return (
    <div className="space-y-6">

      {/*  Page Header  */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[11px] font-bold uppercase tracking-widest"style={{ color: "var(--rtm-blue)"}}>
              Task Operations
            </p>
            <span className="text-[11px]"style={{ color: "var(--rtm-text-muted)"}}>›</span>
            <p className="text-[11px] font-semibold uppercase tracking-widest"style={{ color: "var(--rtm-text-muted)"}}>
              Activation Rules
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>
              Task Activation Rules
            </h1>
            <PreviewBadge />
          </div>
          <p className="text-sm mt-1 max-w-xl"style={{ color: "var(--rtm-text-secondary)"}}>
            Configure when line items, contracts, invoices, and lifecycle events activate task templates and department work.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)"}}
          >
            ↑ Import Rules
          </button>
          <button
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)"}}
          >
            ↓ Export Rules
          </button>
          <button
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)"}}
          >
             Test Rule
          </button>
          <Link
            href="/tasks/templates"className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)"}}
          >
             View Task Templates
          </Link>
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white"style={{ background: "var(--rtm-blue)"}}
          >
            + New Activation Rule
          </button>
        </div>
      </div>

      {/*  Primary Flow Banner  */}
      <div
        className="rounded-xl p-4"style={{ background: "#EFF6FF", border: "1px solid #BFDBFE"}}
      >
        <div className="text-[10px] font-bold uppercase tracking-wider mb-2"style={{ color: "#1D4ED8"}}>
          Primary Activation Flow
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          {[
            { label: "Line Item Sold"},
            "→",
            { label: "Contract Signed", icon: ""},
            "→",
            { label: "Invoice Paid"},
            "→",
            { label: "Activation Rule Fires"},
            "→",
            { label: "Task Template Generates Tasks"},
            "→",
            { label: "Department Queue Activated"},
          ].map((step, i) =>
            step === "→"? (
              <span key={i} className="font-black"style={{ color: "#93C5FD"}}>→</span>
            ) : (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"style={{ background: "rgba(255,255,255,0.8)", color: "#1D4ED8", border: "1px solid #BFDBFE"}}
              >
                <span>{(step as { label: string; icon?: string }).icon}</span>
                {(step as { label: string; icon?: string }).label}
              </span>
            )
          )}
        </div>
      </div>

      {/*  KPI Cards  */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
        {[
          { label: "Total Rules",          value: kpis.total,        color: "var(--rtm-blue)"},
          { label: "Active Rules",          value: kpis.active,       color: "#059669"},
          { label: "Inactive Rules",        value: kpis.inactive,     color: "#94A3B8"},
          { label: "Pending Review",        value: kpis.pending,      color: "#D97706"},
          { label: "Templates Triggered",   value: kpis.totalTriggers,color: "#7C3AED"},
          { label: "Departments Covered",   value: kpis.depts,        color: "#0891B2"},
          { label: "Blocked Activations",   value: kpis.blocked,      color: "#DC2626"},
          { label: "Recent Activations",    value: kpis.recent,       color: "#16A34A"},
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-xl p-3 text-center"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
          >
            <div className="text-2xl font-black"style={{ color }}>{value}</div>
            <div className="text-[10px] font-semibold mt-1 leading-tight"style={{ color: "var(--rtm-text-secondary)"}}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/*  Filters  */}
      <div
        className="rounded-xl px-4 py-3 flex flex-wrap items-center gap-3"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"style={{ color: "var(--rtm-text-muted)"}}
            fill="none"stroke="currentColor"viewBox="0 0 24 24">
            <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"placeholder="Search rules, line items, templates..."value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-primary)"}}
          />
        </div>

        {/* Trigger filter */}
        <select
          value={filterTrigger}
          onChange={(e) => setFilterTrigger(e.target.value as TriggerEvent | "All")}
          className="text-sm px-3 py-2 rounded-lg outline-none"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-primary)"}}
        >
          {ALL_TRIGGERS.map((t) => (
            <option key={t} value={t}>{t === "All"? "All Triggers": t}</option>
          ))}
        </select>

        {/* Department filter */}
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value as Department | "All")}
          className="text-sm px-3 py-2 rounded-lg outline-none"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-primary)"}}
        >
          {ALL_DEPARTMENTS.map((d) => (
            <option key={d} value={d}>{d === "All"? "All Departments": d}</option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as RuleStatus | "All")}
          className="text-sm px-3 py-2 rounded-lg outline-none"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-primary)"}}
        >
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{s === "All"? "All Statuses": s}</option>
          ))}
        </select>

        <span className="text-xs font-semibold ml-auto"style={{ color: "var(--rtm-text-muted)"}}>
          {filtered.length} of {ACTIVATION_RULES.length} rules
        </span>
      </div>

      {/*  Rules Table  */}
      <div
        className="rounded-xl overflow-hidden"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
      >
        <div className="overflow-x-scroll">
          <table className="w-full text-sm min-w-[1100px]">
            <thead className="sticky top-0 z-10">
              <tr style={{ background: "var(--rtm-bg)", borderBottom: "2px solid var(--rtm-border)"}}>
                {[
                  "#",
                  "Rule Name",
                  "Trigger Event",
                  "Line Item",
                  "First Response SLA",
                  "Target Completion",
                  "Due Date Offset",
                  "Escalation Rule",
                  "Task Template",
                  "Department",
                  "Status",
                  "Last Triggered",
                  "Actions",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider"style={{ color: "var(--rtm-text-secondary)"}}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((rule, i) => (
                <tr
                  key={rule.id}
                  className="hover:bg-blue-50/20 transition-colors"style={{
                    borderBottom: i < filtered.length - 1 ? "1px solid var(--rtm-border-light)": "none",
                  }}
                >
                  {/* Priority */}
                  <td className="px-4 py-3">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-white"style={{ background: "var(--rtm-blue)"}}
                    >
                      {rule.priority}
                    </span>
                  </td>

                  {/* Rule Name */}
                  <td className="px-4 py-3 max-w-[200px]">
                    <button
                      onClick={() => setSelectedRule(rule)}
                      className="font-bold text-left hover:underline"style={{ color: "var(--rtm-blue)"}}
                    >
                      {rule.name}
                    </button>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>{rule.id}</span>
                      {rule.autoActivate && (
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded"style={{ background: "#EFF6FF", color: "#1D4ED8"}}
                        >
                          AUTO
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Trigger Event */}
                  <td className="px-4 py-3">
                    <TriggerBadge trigger={rule.triggerEvent} />
                  </td>

                  {/* Line Item */}
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>
                      {rule.lineItem}
                    </span>
                  </td>

                  {/* Line Item SLA — primary source */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-[11px] font-semibold"style={{ color: "#1D4ED8"}}> {rule.lineItemSLA.firstResponseSLA}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-[11px] font-bold"style={{ color: "#059669"}}>{rule.lineItemSLA.targetCompletionDays} biz days</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>
                    {rule.lineItemSLA.dueDateOffset > 0 ? `Day ${rule.lineItemSLA.dueDateOffset}` : "Immediate"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap"style={{ color: "#C2410C"}}>
                    After {rule.lineItemSLA.escalationAfterDays}d
                  </td>

                  {/* Contract */}
                  <td className="px-4 py-3">
                    <ContractBadge req={rule.contractRequirement} />
                  </td>

                  {/* Billing */}
                  <td className="px-4 py-3">
                    <BillingBadge req={rule.billingRequirement} />
                  </td>

                  {/* Task Template */}
                  <td className="px-4 py-3 max-w-[180px]">
                    <span className="text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>
                      {rule.taskTemplate}
                    </span>
                  </td>

                  {/* Department */}
                  <td className="px-4 py-3">
                    <DeptBadge dept={rule.department} />
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge status={rule.status} />
                  </td>

                  {/* Last Triggered */}
                  <td className="px-4 py-3">
                    <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>
                      {rule.lastTriggered ?? "Never"}
                    </span>
                    {rule.triggerCount > 0 && (
                      <div className="text-[10px] mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>
                        {rule.triggerCount}× total
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 flex-wrap">
                      <button
                        onClick={() => setSelectedRule(rule)}
                        className="text-[11px] font-semibold px-2 py-1 rounded-lg hover:opacity-80 transition-opacity"style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)"}}
                      >
                        View
                      </button>
                      <button
                        className="text-[11px] font-semibold px-2 py-1 rounded-lg hover:opacity-80 transition-opacity border"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)"}}
                      >
                        Edit
                      </button>
                      <button
                        className="text-[11px] font-semibold px-2 py-1 rounded-lg hover:opacity-80 transition-opacity border"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)"}}
                      >
                        Test
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center"style={{ color: "var(--rtm-text-muted)"}}>
            
            <div className="text-sm font-semibold">No rules match your filters.</div>
          </div>
        )}

        <div
          className="px-5 py-3 flex items-center justify-between"style={{ borderTop: "1px solid var(--rtm-border-light)"}}
        >
          <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>
            Showing {filtered.length} of {ACTIVATION_RULES.length} activation rules
          </span>
          <span className="text-xs font-semibold"style={{ color: "var(--rtm-text-muted)"}}>
            {kpis.totalTriggers} total activations fired
          </span>
        </div>
      </div>

      {/*  Trigger Event Summary  */}
      <div
        className="rounded-xl overflow-hidden"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
      >
        <div
          className="px-5 py-4"style={{ borderBottom: "1px solid var(--rtm-border)", background: "#FFFBEB"}}
        >
          <div className="flex items-center gap-2">
            
            <h2 className="text-sm font-extrabold"style={{ color: "var(--rtm-text-primary)"}}>
              Rules by Trigger Event
            </h2>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"style={{ background: "#FDE68A", color: "#D97706"}}
            >
              {ACTIVATION_RULES.length} total rules
            </span>
          </div>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(
            [
              "Invoice Paid",
              "Client Activated",
              "Contract Signed",
              "Upsell Approved",
              "Cancellation Requested",
              "Offboarding Approved",
              "Renewal Signed",
              "Proposal Approved",
            ] as TriggerEvent[]
          ).map((trigger) => {
            const rules = ACTIVATION_RULES.filter((r) => r.triggerEvent === trigger);
            const cfg = TRIGGER_CFG[trigger];
            return (
              <div
                key={trigger}
                className="rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"style={{ border: `1px solid ${cfg.border}` }}
                onClick={() => setFilterTrigger(trigger)}
              >
                <div className="px-4 py-3 flex items-center gap-2"style={{ background: cfg.bg }}>
                  <span className="text-base">{cfg.icon}</span>
                  <span className="text-xs font-black"style={{ color: cfg.color }}>
                    {trigger}
                  </span>
                  <span
                    className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"style={{ background: "rgba(255,255,255,0.7)", color: cfg.color }}
                  >
                    {rules.length} rules
                  </span>
                </div>
                <div className="px-4 py-2 space-y-1 bg-white">
                  {rules.slice(0, 3).map((r) => (
                    <div key={r.id} className="flex items-center gap-1 text-[11px]"style={{ color: "var(--rtm-text-secondary)"}}>
                      <span style={{ color: cfg.color }}>→</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedRule(r); }}
                        className="hover:underline text-left truncate"style={{ color: "var(--rtm-text-primary)"}}
                      >
                        {r.name}
                      </button>
                    </div>
                  ))}
                  {rules.length > 3 && (
                    <div className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>
                      +{rules.length - 3} more
                    </div>
                  )}
                  {rules.length === 0 && (
                    <div className="text-[11px] py-1"style={{ color: "var(--rtm-text-muted)"}}>
                      No rules configured
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/*  Department Coverage  */}
      <div
        className="rounded-xl overflow-hidden"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
      >
        <div className="px-5 py-4"style={{ borderBottom: "1px solid var(--rtm-border)"}}>
          <h2 className="text-sm font-extrabold"style={{ color: "var(--rtm-text-primary)"}}>
             Department Coverage
          </h2>
          <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>
            Activation rules mapped per department.
          </p>
        </div>
        <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {(
            [
              "SEO",
              "GBP",
              "Paid Advertising",
              "Meta Ads",
              "LSA",
              "Reporting",
              "Web Development",
              "Creative",
              "Account Management",
              "Billing",
            ] as Department[]
          ).map((dept) => {
            const deptRules = ACTIVATION_RULES.filter((r) => r.department === dept);
            const activeCount = deptRules.filter((r) => r.status === "Active").length;
            const c = DEPT_CFG[dept];
            return (
              <div
                key={dept}
                className="rounded-xl p-3 text-center cursor-pointer hover:opacity-90 transition-opacity"style={{ background: c.bg, border: `1px solid ${c.border}` }}
                onClick={() => setFilterDept(dept)}
              >
                <div className="text-xl font-black"style={{ color: c.color }}>{deptRules.length}</div>
                <div className="text-[10px] font-bold mt-0.5"style={{ color: c.color }}>
                  {activeCount} active
                </div>
                <div className="text-[10px] mt-1 font-semibold leading-tight"style={{ color: "var(--rtm-text-secondary)"}}>
                  {dept}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/*  Connected Systems  */}
      <div
        className="rounded-xl p-4"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
      >
        <div className="text-xs font-bold mb-3"style={{ color: "var(--rtm-text-primary)"}}>
           Connected Systems
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Finance / Line Items",    href: "/billing"},
            { label: "Proposal Generator",      href: "/sales/proposals"},
            { label: "Contract Generator",      href: "/billing/invoices"},
            { label: "Billing",                 href: "/billing/client-portfolio"},
            { label: "Task Templates",          href: "/tasks/templates"},
            { label: "Task Engine",             href: "/tasks"},
            { label: "Dept. Throughput",       href: "/tasks/workload-planning"},
            { label: "Onboarding",              href: "/account-management/onboarding"},
            { label: "Renewals",                href: "/renewals"},
            { label: "Cancellations",           href: "/billing/cancellations"},
            { label: "Offboarding",             href: "/cancellations/offboarding"},
            { label: "Clients",                 href: "/clients"},
          ].map((r) => (
            <Link
              key={r.label}
              href={r.href}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border hover:opacity-80 transition-opacity"style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)", borderColor: "#BFDBFE"}}
            >
              {r.label}
              <svg width="10"height="10"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10"y1="14"x2="21"y2="3"/>
              </svg>
            </Link>
          ))}
        </div>
      </div>

      {/*  Rule Detail Drawer  */}
      {selectedRule && (
        <RuleDrawer rule={selectedRule} onClose={() => setSelectedRule(null)} />
      )}
    </div>
  );
}
