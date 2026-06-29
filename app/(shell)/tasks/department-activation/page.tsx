"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { GeneratedTask, BlueprintTaskPriority, BlueprintTaskStatus } from "@/lib/sales/blueprint-config";
import {
  BLUEPRINT_TASK_STATUS_LABELS,
  BLUEPRINT_TASK_STATUS_COLORS,
  BLUEPRINT_PRIORITY_COLORS,
} from "@/lib/sales/blueprint-config";

// 
// Department Activation Engine
// Route: /tasks/department-activation
// Bridge between signed contracts → paid invoices → activated projects → department
// workloads. Routes sold line items to the correct service departments,
// generates task lists, assigns owners, and starts delivery queues.
// Belongs to: Projects & Tasks → Department Activation
// 

//  Types 

type DeptActivationStatus =
  | "Pending"| "Ready"| "Owner Assignment Needed"| "Tasks Generated"| "Department Queue Created"| "Activated"| "Blocked"| "Failed";

type Department =
  | "SEO"| "GBP"| "Paid Advertising"| "Meta Ads"| "LSA"| "Reporting"| "Web Development"| "Creative"| "Account Management"| "Strategy";

type Priority = "High"| "Medium"| "Low";

type OwnerAssignmentStatus =
  | "Unassigned"| "Assigned"| "Needs Review"| "Unavailable"| "Confirmed";

type DependencyStatus = "Satisfied"| "Missing"| "Blocked"| "Not Required";

type QueueStatus =
  | "Not Created"| "Created"| "Active"| "On Hold"| "Completed";

// Line Item SLA — primary delivery SLA source (not department)
interface LineItemSLARef {
  firstResponseSLA: string;
  targetCompletionDays: number;
  escalationAfterDays: number;
  slaPriority: "Standard"| "Priority"| "Rush"| "Custom";
  slaStatus: "Active"| "Pending Review"| "Needs Approval"| "Inactive";
}

interface LineItemSold {
  name: string;
  billingType: "Setup"| "Monthly"| "One-Time";
  setupFee: number;
  monthlyFee: number;
  department: Department;
  lineItemSLA?: LineItemSLARef;
  firstResponseDue?: string;
  targetCompletionDate?: string;
  escalationDate?: string;
}

interface TaskTemplate {
  templateName: string;
  department: Department;
  taskCount: number;
  targetCompletionDays: number;
  status: "Available"| "Missing"| "Draft";
}

interface DeptRequirement {
  department: Department;
  soldLineItems: string[];
  taskTemplates: TaskTemplate[];
  targetCompletionDays: number;
  defaultOwnerRole: string;
  assignedOwner: string | null;
  activationStatus: DeptActivationStatus;
  dependencies: string[];
}

interface OwnerAssignment {
  department: Department;
  ownerRole: string;
  assignedUser: string | null;
  backupOwner: string | null;
  assignmentStatus: OwnerAssignmentStatus;
}

interface DeptDependency {
  name: string;
  status: DependencyStatus;
  department: Department;
  detail?: string;
}

interface DeptQueue {
  department: Department;
  queueName: string;
  client: string;
  taskCount: number;
  targetCompletionDays: number;
  owner: string | null;
  queueStatus: QueueStatus;
  startDate: string | null;
}

interface TimelineEvent {
  date: string;
  event: string;
  actor: string;
  detail?: string;
}

interface DeptActivationCase {
  id: string;
  client: string;
  clientSlug: string;
  contractRef: string;
  invoiceRef: string;
  activationStatus: DeptActivationStatus;
  priority: Priority;
  blockedReason: string | null;
  nextAction: string;
  departmentsRequired: Department[];
  lineItemsSold: LineItemSold[];
  taskTemplates: TaskTemplate[];
  targetCompletionDays: number;
  ownerAssignment: OwnerAssignmentStatus;
  departmentRequirements: DeptRequirement[];
  ownerAssignments: OwnerAssignment[];
  dependencies: DeptDependency[];
  departmentQueues: DeptQueue[];
  timeline: TimelineEvent[];
  activatedAt: string | null;
  notes: string;
}

//  Mock Data 

const DEPT_ACTIVATION_CASES: DeptActivationCase[] = [
  {
    id: "da-001",
    client: "Apex Dental Studio",
    clientSlug: "apex-dental-studio",
    contractRef: "CTR-2025-0041",
    invoiceRef: "INV-2025-0088",
    activationStatus: "Tasks Generated",
    priority: "High",
    blockedReason: null,
    nextAction: "Assign department owners and create queues",
    departmentsRequired: ["SEO", "Account Management"],
    lineItemsSold: [
      { name: "SEO Setup", billingType: "Setup", setupFee: 750, monthlyFee: 0, department: "SEO", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 5, escalationAfterDays: 7, slaPriority: "Standard", slaStatus: "Active"}, firstResponseDue: "2025-07-26", targetCompletionDate: "2025-07-31", escalationDate: "2025-08-02"},
      { name: "SEO Monthly", billingType: "Monthly", setupFee: 0, monthlyFee: 1200, department: "SEO", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 10, escalationAfterDays: 14, slaPriority: "Standard", slaStatus: "Active"}, firstResponseDue: "2025-07-26", targetCompletionDate: "2025-08-05", escalationDate: "2025-08-09"},
      { name: "Client Onboarding", billingType: "Setup", setupFee: 0, monthlyFee: 0, department: "Account Management", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 4, escalationAfterDays: 6, slaPriority: "Standard", slaStatus: "Active"}, firstResponseDue: "2025-07-26", targetCompletionDate: "2025-07-30", escalationDate: "2025-08-01"},
    ],
    taskTemplates: [
      { templateName: "SEO Setup Template", department: "SEO", taskCount: 8, targetCompletionDays: 16, status: "Available"},
      { templateName: "AM Onboarding Template", department: "Account Management", taskCount: 4, targetCompletionDays: 5, status: "Available"},
    ],
    targetCompletionDays: 21,
    ownerAssignment: "Unassigned",
    departmentRequirements: [
      {
        department: "SEO",
        soldLineItems: ["SEO Setup", "SEO Monthly"],
        taskTemplates: [{ templateName: "SEO Setup Template", department: "SEO", taskCount: 8, targetCompletionDays: 16, status: "Available"}],
        targetCompletionDays: 16,
        defaultOwnerRole: "SEO Specialist",
        assignedOwner: null,
        activationStatus: "Owner Assignment Needed",
        dependencies: ["Website Access", "Analytics Access"],
      },
      {
        department: "Account Management",
        soldLineItems: ["Client Onboarding"],
        taskTemplates: [{ templateName: "AM Onboarding Template", department: "Account Management", taskCount: 4, targetCompletionDays: 5, status: "Available"}],
        targetCompletionDays: 5,
        defaultOwnerRole: "Account Manager",
        assignedOwner: null,
        activationStatus: "Owner Assignment Needed",
        dependencies: [],
      },
    ],
    ownerAssignments: [
      { department: "SEO", ownerRole: "SEO Specialist", assignedUser: null, backupOwner: null, assignmentStatus: "Unassigned"},
      { department: "Account Management", ownerRole: "Account Manager", assignedUser: null, backupOwner: null, assignmentStatus: "Unassigned"},
    ],
    dependencies: [
      { name: "Website Access", status: "Missing", department: "SEO", detail: "Client needs to grant WP admin access"},
      { name: "Analytics Access", status: "Missing", department: "SEO", detail: "GA4 + GSC access required"},
    ],
    departmentQueues: [],
    timeline: [
      { date: "2025-07-25", event: "Tasks Generated", actor: "Activation Engine", detail: "12 tasks created across 2 departments"},
      { date: "2025-07-25", event: "Rules Matched", actor: "Activation Engine"},
      { date: "2025-07-24", event: "Invoice Paid", actor: "Billing System"},
      { date: "2025-07-23", event: "Contract Signed", actor: "DocuSign"},
    ],
    activatedAt: null,
    notes: "Client prefers Tuesday kickoff calls.",
  },
  {
    id: "da-002",
    client: "Green Valley Orthodontics",
    clientSlug: "green-valley-orthodontics",
    contractRef: "CTR-2025-0038",
    invoiceRef: "INV-2025-0083",
    activationStatus: "Department Queue Created",
    priority: "High",
    blockedReason: null,
    nextAction: "Activate queues and begin delivery",
    departmentsRequired: ["SEO", "GBP", "Account Management"],
    lineItemsSold: [
      { name: "SEO Setup", billingType: "Setup", setupFee: 750, monthlyFee: 0, department: "SEO", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 5, escalationAfterDays: 7, slaPriority: "Standard", slaStatus: "Active"}, firstResponseDue: "2025-07-26", targetCompletionDate: "2025-07-31", escalationDate: "2025-08-02"},
      { name: "GBP Optimization", billingType: "Setup", setupFee: 500, monthlyFee: 0, department: "GBP", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 3, escalationAfterDays: 5, slaPriority: "Standard", slaStatus: "Active"}, firstResponseDue: "2025-07-26", targetCompletionDate: "2025-07-29", escalationDate: "2025-07-31"},
      { name: "SEO Monthly", billingType: "Monthly", setupFee: 0, monthlyFee: 1200, department: "SEO", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 10, escalationAfterDays: 14, slaPriority: "Standard", slaStatus: "Active"}, firstResponseDue: "2025-07-26", targetCompletionDate: "2025-08-05", escalationDate: "2025-08-09"},
    ],
    taskTemplates: [
      { templateName: "SEO Setup Template", department: "SEO", taskCount: 8, targetCompletionDays: 16, status: "Available"},
      { templateName: "GBP Launch Template", department: "GBP", taskCount: 6, targetCompletionDays: 10, status: "Available"},
      { templateName: "AM Onboarding Template", department: "Account Management", taskCount: 4, targetCompletionDays: 5, status: "Available"},
    ],
    targetCompletionDays: 31,
    ownerAssignment: "Confirmed",
    departmentRequirements: [
      {
        department: "SEO",
        soldLineItems: ["SEO Setup", "SEO Monthly"],
        taskTemplates: [{ templateName: "SEO Setup Template", department: "SEO", taskCount: 8, targetCompletionDays: 16, status: "Available"}],
        targetCompletionDays: 16,
        defaultOwnerRole: "SEO Specialist",
        assignedOwner: "Sarah K.",
        activationStatus: "Department Queue Created",
        dependencies: ["Website Access"],
      },
      {
        department: "GBP",
        soldLineItems: ["GBP Optimization"],
        taskTemplates: [{ templateName: "GBP Launch Template", department: "GBP", taskCount: 6, targetCompletionDays: 10, status: "Available"}],
        targetCompletionDays: 10,
        defaultOwnerRole: "GBP Specialist",
        assignedOwner: "Marcus L.",
        activationStatus: "Department Queue Created",
        dependencies: ["GBP Access"],
      },
      {
        department: "Account Management",
        soldLineItems: ["Client Onboarding"],
        taskTemplates: [{ templateName: "AM Onboarding Template", department: "Account Management", taskCount: 4, targetCompletionDays: 5, status: "Available"}],
        targetCompletionDays: 5,
        defaultOwnerRole: "Account Manager",
        assignedOwner: "Jenna P.",
        activationStatus: "Department Queue Created",
        dependencies: [],
      },
    ],
    ownerAssignments: [
      { department: "SEO", ownerRole: "SEO Specialist", assignedUser: "Sarah K.", backupOwner: "Aaron P.", assignmentStatus: "Confirmed"},
      { department: "GBP", ownerRole: "GBP Specialist", assignedUser: "Marcus L.", backupOwner: null, assignmentStatus: "Confirmed"},
      { department: "Account Management", ownerRole: "Account Manager", assignedUser: "Jenna P.", backupOwner: null, assignmentStatus: "Confirmed"},
    ],
    dependencies: [
      { name: "Website Access", status: "Satisfied", department: "SEO"},
      { name: "GBP Access", status: "Satisfied", department: "GBP"},
    ],
    departmentQueues: [
      { department: "SEO", queueName: "SEO Queue — Green Valley", client: "Green Valley Orthodontics", taskCount: 8, targetCompletionDays: 16, owner: "Sarah K.", queueStatus: "Created", startDate: "2025-08-01"},
      { department: "GBP", queueName: "GBP Queue — Green Valley", client: "Green Valley Orthodontics", taskCount: 6, targetCompletionDays: 10, owner: "Marcus L.", queueStatus: "Created", startDate: "2025-08-01"},
      { department: "Account Management", queueName: "AM Queue — Green Valley", client: "Green Valley Orthodontics", taskCount: 4, targetCompletionDays: 5, owner: "Jenna P.", queueStatus: "Active", startDate: "2025-07-28"},
    ],
    timeline: [
      { date: "2025-07-24", event: "Department Queues Created", actor: "Ops Manager", detail: "All 3 department queues created"},
      { date: "2025-07-23", event: "Owners Assigned", actor: "Ops Manager"},
      { date: "2025-07-22", event: "Tasks Generated", actor: "Activation Engine"},
      { date: "2025-07-21", event: "Invoice Paid", actor: "Billing System"},
    ],
    activatedAt: null,
    notes: "Ready to activate. Client confirmed Monday start.",
  },
  {
    id: "da-003",
    client: "Summit Sports Medicine",
    clientSlug: "summit-sports-medicine",
    contractRef: "CTR-2025-0042",
    invoiceRef: "INV-2025-0091",
    activationStatus: "Activated",
    priority: "Medium",
    blockedReason: null,
    nextAction: "Monitor onboarding progress",
    departmentsRequired: ["SEO", "Paid Advertising", "Account Management"],
    lineItemsSold: [
      { name: "SEO Setup", billingType: "Setup", setupFee: 750, monthlyFee: 0, department: "SEO", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 5, escalationAfterDays: 7, slaPriority: "Standard", slaStatus: "Active"}, firstResponseDue: "2025-07-26", targetCompletionDate: "2025-07-31", escalationDate: "2025-08-02"},
      { name: "PPC Launch", billingType: "Setup", setupFee: 850, monthlyFee: 0, department: "Paid Advertising"},
      { name: "PPC Monthly", billingType: "Monthly", setupFee: 0, monthlyFee: 1500, department: "Paid Advertising"},
    ],
    taskTemplates: [
      { templateName: "SEO Setup Template", department: "SEO", taskCount: 8, targetCompletionDays: 16, status: "Available"},
      { templateName: "PPC Launch Template", department: "Paid Advertising", taskCount: 6, targetCompletionDays: 18, status: "Available"},
      { templateName: "AM Onboarding Template", department: "Account Management", taskCount: 4, targetCompletionDays: 5, status: "Available"},
    ],
    targetCompletionDays: 39,
    ownerAssignment: "Confirmed",
    departmentRequirements: [
      {
        department: "SEO",
        soldLineItems: ["SEO Setup"],
        taskTemplates: [{ templateName: "SEO Setup Template", department: "SEO", taskCount: 8, targetCompletionDays: 16, status: "Available"}],
        targetCompletionDays: 16,
        defaultOwnerRole: "SEO Specialist",
        assignedOwner: "Aaron P.",
        activationStatus: "Activated",
        dependencies: [],
      },
      {
        department: "Paid Advertising",
        soldLineItems: ["PPC Launch", "PPC Monthly"],
        taskTemplates: [{ templateName: "PPC Launch Template", department: "Paid Advertising", taskCount: 6, targetCompletionDays: 18, status: "Available"}],
        targetCompletionDays: 18,
        defaultOwnerRole: "PPC Manager",
        assignedOwner: "Derek M.",
        activationStatus: "Activated",
        dependencies: [],
      },
      {
        department: "Account Management",
        soldLineItems: ["Client Onboarding"],
        taskTemplates: [{ templateName: "AM Onboarding Template", department: "Account Management", taskCount: 4, targetCompletionDays: 5, status: "Available"}],
        targetCompletionDays: 5,
        defaultOwnerRole: "Account Manager",
        assignedOwner: "Jenna P.",
        activationStatus: "Activated",
        dependencies: [],
      },
    ],
    ownerAssignments: [
      { department: "SEO", ownerRole: "SEO Specialist", assignedUser: "Aaron P.", backupOwner: null, assignmentStatus: "Confirmed"},
      { department: "Paid Advertising", ownerRole: "PPC Manager", assignedUser: "Derek M.", backupOwner: null, assignmentStatus: "Confirmed"},
      { department: "Account Management", ownerRole: "Account Manager", assignedUser: "Jenna P.", backupOwner: null, assignmentStatus: "Confirmed"},
    ],
    dependencies: [],
    departmentQueues: [
      { department: "SEO", queueName: "SEO Queue — Summit", client: "Summit Sports Medicine", taskCount: 8, targetCompletionDays: 16, owner: "Aaron P.", queueStatus: "Active", startDate: "2025-07-20"},
      { department: "Paid Advertising", queueName: "PPC Queue — Summit", client: "Summit Sports Medicine", taskCount: 6, targetCompletionDays: 18, owner: "Derek M.", queueStatus: "Active", startDate: "2025-07-20"},
      { department: "Account Management", queueName: "AM Queue — Summit", client: "Summit Sports Medicine", taskCount: 4, targetCompletionDays: 5, owner: "Jenna P.", queueStatus: "Completed", startDate: "2025-07-18"},
    ],
    timeline: [
      { date: "2025-07-20", event: "Fully Activated", actor: "Ops Manager"},
      { date: "2025-07-19", event: "Queues Created", actor: "Ops Manager"},
      { date: "2025-07-18", event: "Owners Assigned", actor: "Ops Manager"},
      { date: "2025-07-17", event: "Tasks Generated", actor: "Activation Engine"},
    ],
    activatedAt: "2025-07-20",
    notes: "Smooth activation. Client very responsive.",
  },
  {
    id: "da-004",
    client: "Coastal Dermatology Group",
    clientSlug: "coastal-dermatology-group",
    contractRef: "CTR-2025-0044",
    invoiceRef: "INV-2025-0093",
    activationStatus: "Blocked",
    priority: "High",
    blockedReason: "Missing Task Template",
    nextAction: "Create Meta Ads Monthly Template",
    departmentsRequired: ["Meta Ads", "Reporting", "Account Management"],
    lineItemsSold: [
      { name: "Meta Ads Monthly", billingType: "Monthly", setupFee: 0, monthlyFee: 900, department: "Meta Ads"},
      { name: "Reporting Monthly", billingType: "Monthly", setupFee: 0, monthlyFee: 250, department: "Reporting"},
    ],
    taskTemplates: [
      { templateName: "Meta Ads Monthly Template", department: "Meta Ads", taskCount: 0, targetCompletionDays: 0, status: "Missing"},
      { templateName: "Reporting Monthly Template", department: "Reporting", taskCount: 4, targetCompletionDays: 6, status: "Available"},
    ],
    targetCompletionDays: 6,
    ownerAssignment: "Unassigned",
    departmentRequirements: [
      {
        department: "Meta Ads",
        soldLineItems: ["Meta Ads Monthly"],
        taskTemplates: [{ templateName: "Meta Ads Monthly Template", department: "Meta Ads", taskCount: 0, targetCompletionDays: 0, status: "Missing"}],
        targetCompletionDays: 0,
        defaultOwnerRole: "Meta Ads Specialist",
        assignedOwner: null,
        activationStatus: "Blocked",
        dependencies: ["Meta Ads Monthly Template"],
      },
      {
        department: "Reporting",
        soldLineItems: ["Reporting Monthly"],
        taskTemplates: [{ templateName: "Reporting Monthly Template", department: "Reporting", taskCount: 4, targetCompletionDays: 6, status: "Available"}],
        targetCompletionDays: 6,
        defaultOwnerRole: "Reporting Specialist",
        assignedOwner: null,
        activationStatus: "Owner Assignment Needed",
        dependencies: [],
      },
    ],
    ownerAssignments: [
      { department: "Meta Ads", ownerRole: "Meta Ads Specialist", assignedUser: null, backupOwner: null, assignmentStatus: "Unassigned"},
      { department: "Reporting", ownerRole: "Reporting Specialist", assignedUser: null, backupOwner: null, assignmentStatus: "Unassigned"},
    ],
    dependencies: [
      { name: "Meta Ads Monthly Template", status: "Missing", department: "Meta Ads", detail: "Template not yet created in template library"},
    ],
    departmentQueues: [],
    timeline: [
      { date: "2025-07-25", event: "Activation Blocked", actor: "Activation Engine", detail: "Meta Ads Monthly Template not found"},
      { date: "2025-07-24", event: "Invoice Paid", actor: "Billing System"},
      { date: "2025-07-23", event: "Contract Signed", actor: "DocuSign"},
    ],
    activatedAt: null,
    notes: "Must create template before proceeding.",
  },
  {
    id: "da-005",
    client: "Parkway Family Clinic",
    clientSlug: "parkway-family-clinic",
    contractRef: "CTR-2025-0040",
    invoiceRef: "INV-2025-0087",
    activationStatus: "Owner Assignment Needed",
    priority: "High",
    blockedReason: null,
    nextAction: "Assign LSA specialist owner",
    departmentsRequired: ["LSA", "GBP", "Account Management"],
    lineItemsSold: [
      { name: "LSA Setup", billingType: "Setup", setupFee: 400, monthlyFee: 0, department: "LSA", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 5, escalationAfterDays: 8, slaPriority: "Standard", slaStatus: "Active"}, firstResponseDue: "2025-07-26", targetCompletionDate: "2025-07-31", escalationDate: "2025-08-03"},
      { name: "GBP Optimization", billingType: "Setup", setupFee: 500, monthlyFee: 0, department: "GBP", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 3, escalationAfterDays: 5, slaPriority: "Standard", slaStatus: "Active"}, firstResponseDue: "2025-07-26", targetCompletionDate: "2025-07-29", escalationDate: "2025-07-31"},
    ],
    taskTemplates: [
      { templateName: "LSA Setup Template", department: "LSA", taskCount: 5, targetCompletionDays: 10, status: "Available"},
      { templateName: "GBP Launch Template", department: "GBP", taskCount: 6, targetCompletionDays: 10, status: "Available"},
      { templateName: "AM Onboarding Template", department: "Account Management", taskCount: 4, targetCompletionDays: 5, status: "Available"},
    ],
    targetCompletionDays: 25,
    ownerAssignment: "Needs Review",
    departmentRequirements: [
      {
        department: "LSA",
        soldLineItems: ["LSA Setup"],
        taskTemplates: [{ templateName: "LSA Setup Template", department: "LSA", taskCount: 5, targetCompletionDays: 10, status: "Available"}],
        targetCompletionDays: 10,
        defaultOwnerRole: "LSA Specialist",
        assignedOwner: null,
        activationStatus: "Owner Assignment Needed",
        dependencies: ["LSA Account Access"],
      },
      {
        department: "GBP",
        soldLineItems: ["GBP Optimization"],
        taskTemplates: [{ templateName: "GBP Launch Template", department: "GBP", taskCount: 6, targetCompletionDays: 10, status: "Available"}],
        targetCompletionDays: 10,
        defaultOwnerRole: "GBP Specialist",
        assignedOwner: "Marcus L.",
        activationStatus: "Tasks Generated",
        dependencies: [],
      },
      {
        department: "Account Management",
        soldLineItems: ["Client Onboarding"],
        taskTemplates: [{ templateName: "AM Onboarding Template", department: "Account Management", taskCount: 4, targetCompletionDays: 5, status: "Available"}],
        targetCompletionDays: 5,
        defaultOwnerRole: "Account Manager",
        assignedOwner: "Jenna P.",
        activationStatus: "Tasks Generated",
        dependencies: [],
      },
    ],
    ownerAssignments: [
      { department: "LSA", ownerRole: "LSA Specialist", assignedUser: null, backupOwner: null, assignmentStatus: "Unassigned"},
      { department: "GBP", ownerRole: "GBP Specialist", assignedUser: "Marcus L.", backupOwner: null, assignmentStatus: "Confirmed"},
      { department: "Account Management", ownerRole: "Account Manager", assignedUser: "Jenna P.", backupOwner: null, assignmentStatus: "Confirmed"},
    ],
    dependencies: [
      { name: "LSA Account Access", status: "Missing", department: "LSA", detail: "Client needs to provide LSA account credentials"},
    ],
    departmentQueues: [],
    timeline: [
      { date: "2025-07-24", event: "Tasks Generated", actor: "Activation Engine", detail: "15 tasks created"},
      { date: "2025-07-23", event: "Invoice Paid", actor: "Billing System"},
      { date: "2025-07-22", event: "Contract Signed", actor: "DocuSign"},
    ],
    activatedAt: null,
    notes: "LSA specialist capacity is tight this week.",
  },
  {
    id: "da-006",
    client: "Riverside Urgent Care",
    clientSlug: "riverside-urgent-care",
    contractRef: "CTR-2025-0039",
    invoiceRef: "INV-2025-0085",
    activationStatus: "Pending",
    priority: "Medium",
    blockedReason: null,
    nextAction: "Waiting for activation rules to trigger",
    departmentsRequired: ["SEO", "Reporting"],
    lineItemsSold: [
      { name: "SEO Monthly", billingType: "Monthly", setupFee: 0, monthlyFee: 1200, department: "SEO", lineItemSLA: { firstResponseSLA: "1 business day", targetCompletionDays: 10, escalationAfterDays: 14, slaPriority: "Standard", slaStatus: "Active"}, firstResponseDue: "2025-07-26", targetCompletionDate: "2025-08-05", escalationDate: "2025-08-09"},
      { name: "Reporting Monthly", billingType: "Monthly", setupFee: 0, monthlyFee: 250, department: "Reporting"},
    ],
    taskTemplates: [
      { templateName: "SEO Monthly Template", department: "SEO", taskCount: 8, targetCompletionDays: 20, status: "Available"},
      { templateName: "Reporting Monthly Template", department: "Reporting", taskCount: 4, targetCompletionDays: 6, status: "Available"},
    ],
    targetCompletionDays: 26,
    ownerAssignment: "Unassigned",
    departmentRequirements: [
      {
        department: "SEO",
        soldLineItems: ["SEO Monthly"],
        taskTemplates: [{ templateName: "SEO Monthly Template", department: "SEO", taskCount: 8, targetCompletionDays: 20, status: "Available"}],
        targetCompletionDays: 20,
        defaultOwnerRole: "SEO Specialist",
        assignedOwner: null,
        activationStatus: "Pending",
        dependencies: [],
      },
      {
        department: "Reporting",
        soldLineItems: ["Reporting Monthly"],
        taskTemplates: [{ templateName: "Reporting Monthly Template", department: "Reporting", taskCount: 4, targetCompletionDays: 6, status: "Available"}],
        targetCompletionDays: 6,
        defaultOwnerRole: "Reporting Specialist",
        assignedOwner: null,
        activationStatus: "Pending",
        dependencies: [],
      },
    ],
    ownerAssignments: [
      { department: "SEO", ownerRole: "SEO Specialist", assignedUser: null, backupOwner: null, assignmentStatus: "Unassigned"},
      { department: "Reporting", ownerRole: "Reporting Specialist", assignedUser: null, backupOwner: null, assignmentStatus: "Unassigned"},
    ],
    dependencies: [],
    departmentQueues: [],
    timeline: [
      { date: "2025-07-25", event: "Invoice Paid", actor: "Billing System"},
      { date: "2025-07-24", event: "Contract Signed", actor: "DocuSign"},
    ],
    activatedAt: null,
    notes: "Monthly service — activate at start of next billing cycle.",
  },
];

//  Status color helpers 

function statusColor(status: DeptActivationStatus): React.CSSProperties {
  switch (status) {
    case "Activated":              return { background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" };
    case "Department Queue Created": return { background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" };
    case "Tasks Generated":        return { background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" };
    case "Owner Assignment Needed": return { background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" };
    case "Ready":                  return { background: "#F0F9FF", color: "#0369A1", borderColor: "#BAE6FD" };
    case "Blocked":                return { background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" };
    case "Failed":                 return { background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" };
    case "Pending":                return { background: "#F8FAFC", color: "#64748B", borderColor: "#E2E8F0" };
    default:                       return { background: "#F8FAFC", color: "#64748B", borderColor: "#E2E8F0" };
  }
}

function priorityColor(p: Priority): React.CSSProperties {
  switch (p) {
    case "High":   return { background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" };
    case "Medium": return { background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" };
    case "Low":    return { background: "#F8FAFC", color: "#64748B", borderColor: "#E2E8F0" };
  }
}

function ownerStatusColor(s: OwnerAssignmentStatus): React.CSSProperties {
  switch (s) {
    case "Confirmed":    return { background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" };
    case "Assigned":     return { background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" };
    case "Needs Review": return { background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" };
    case "Unavailable":  return { background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" };
    case "Unassigned":   return { background: "#F8FAFC", color: "#64748B", borderColor: "#E2E8F0" };
  }
}

function depStatusColor(s: DependencyStatus): React.CSSProperties {
  switch (s) {
    case "Satisfied":    return { background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" };
    case "Missing":      return { background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" };
    case "Blocked":      return { background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" };
    case "Not Required": return { background: "#F8FAFC", color: "#64748B", borderColor: "#E2E8F0" };
  }
}

function queueStatusColor(s: QueueStatus): React.CSSProperties {
  switch (s) {
    case "Active":     return { background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" };
    case "Created":    return { background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" };
    case "Completed":  return { background: "#F8FAFC", color: "#64748B", borderColor: "#E2E8F0" };
    case "On Hold":    return { background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" };
    case "Not Created": return { background: "#F8FAFC", color: "#94A3B8", borderColor: "#E2E8F0" };
  }
}

const DEPT_COLORS: Record<string, { bg?: string; color?: string; border: string }> = {
  "SEO":                { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE"},
  "GBP":                { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0"},
  "Paid Advertising":   { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA"},
  "Meta Ads":           { bg: "#FAF5FF", color: "#7C3AED", border: "#DDD6FE"},
  "LSA":                { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A"},
  "Reporting":          { bg: "#ECFEFF", color: "#0891B2", border: "#A5F3FC"},
  "Web Development":    { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0"},
  "Creative":           { bg: "#FFF1F2", color: "#BE123C", border: "#FECDD3"},
  "Account Management": { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A"},
  "Strategy":           { bg: "#F8FAFC", color: "#475569", border: "#CBD5E1"},
};

function DeptBadge({ dept }: { dept: string }) {
  const c = DEPT_COLORS[dept] ?? { bg: "#F8FAFC", color: "#475569", border: "#CBD5E1"};
  return (
    <span
      className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full"style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
    >
      {dept}
    </span>
  );
}

const KPI_LABEL: Record<string, string> = {
  pending:              "Pending Activation",
  activated:            "Fully Activated",
  clientsNeedingOwner:  "Need Owner",
  tasksGenerated:       "Total Tasks",
  targetCompletionDays:       "Target Days",
  blocked:              "Blocked",
  activeQueues:         "Active Queues",
  activatedThisMonth:   "Activated (July)",
};

//  Drawer 

type DrawerTab = "overview"| "lineItems"| "deptRequirements"| "workload"| "owners"| "dependencies"| "queues"| "timeline"| "notes";

function DetailDrawer({ selected, onClose }: { selected: DeptActivationCase; onClose: () => void }) {
  const [drawerTab, setDrawerTab] = useState<DrawerTab>("overview");

  const DRAWER_TABS: { id: DrawerTab; label: string }[] = [
    { id: "overview", label: "Overview"},
    { id: "lineItems", label: "Line Items"},
    { id: "deptRequirements", label: "Dept. Requirements"},
    { id: "workload", label: "SLA & Throughput"},
    { id: "owners", label: "Owners"},
    { id: "dependencies", label: "Dependencies"},
    { id: "queues", label: "Queues"},
    { id: "timeline", label: "Timeline"},
    { id: "notes", label: "Notes"},
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm"onClick={onClose} />
      <div className="w-full max-w-3xl flex flex-col overflow-hidden shadow-2xl"style={{ background: "var(--rtm-surface)", borderLeft: "1px solid var(--rtm-border)"}}>

        {/* Drawer Header */}
        <div className="flex-none px-6 py-5"style={{ borderBottom: "1px solid var(--rtm-border)", background: "var(--rtm-blue-xlight)"}}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold"style={{ color: "var(--rtm-text-primary)"}}>{selected.client}</h2>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs"style={{ color: "var(--rtm-text-muted)"}}>{selected.contractRef}</span>
                <span style={{ color: "var(--rtm-text-muted)"}}>·</span>
                <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold px-2 py-0.5 rounded-full text-[11px] font-semibold" style={statusColor(selected.activationStatus)}>{selected.activationStatus}</span>
                <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold px-2 py-0.5 rounded-full text-[11px] font-semibold" style={priorityColor(selected.priority)}>{selected.priority}</span>
                {selected.blockedReason && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-700"><span style={{ fontWeight: "bold" }}>!</span> {selected.blockedReason}</span>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg transition-colors flex-none"style={{ color: "var(--rtm-text-muted)"}}>
              <svg className="w-4 h-4"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth={2}>
                <path d="M6 18L18 6M6 6l12 12"strokeLinecap="round"strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Quick actions */}
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="px-2.5 py-1 rounded-lg text-xs font-bold text-white"style={{ background: "var(--rtm-blue)"}}>View Activation</button>
            <button className="px-2.5 py-1 rounded-lg text-xs font-semibold border"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)"}}>Assign Owner</button>
            <button className="px-2.5 py-1 rounded-lg text-xs font-semibold border"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)"}}>Create Queue</button>
            <button className="px-2.5 py-1 rounded-lg text-xs font-semibold border"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)"}}>Generate Tasks</button>
            <button className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white"style={{ background: "#059669"}}>Mark Activated</button>
            <Link href={`/clients/${selected.clientSlug}`} className="px-2.5 py-1 rounded-lg text-xs font-semibold border" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)" }}>Open Client</Link>
            <Link href="/billing/invoices" className="px-2.5 py-1 rounded-lg text-xs font-semibold border" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)" }}>Open Billing</Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-none px-6 flex gap-0 overflow-x-auto"style={{ borderBottom: "1px solid var(--rtm-border)", background: "var(--rtm-surface)"}}>
          {DRAWER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDrawerTab(tab.id)}
              className="px-3 py-3 text-xs font-semibold whitespace-nowrap transition-colors"style={{
                borderBottom: drawerTab === tab.id ? "2px solid var(--rtm-blue)": "2px solid transparent",
                color: drawerTab === tab.id ? "var(--rtm-blue)": "var(--rtm-text-secondary)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Overview */}
          {drawerTab === "overview"&& (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Contract", value: selected.contractRef },
                  { label: "Invoice", value: selected.invoiceRef },
                  { label: "Target Completion", value: `${selected.targetCompletionDays}d` },
                  { label: "Departments", value: selected.departmentsRequired.length },
                  { label: "Line Items", value: selected.lineItemsSold.length },
                  { label: "Task Templates", value: selected.taskTemplates.length },
                  { label: "Activated", value: selected.activatedAt ?? "Not yet"},
                  { label: "Next Action", value: selected.nextAction },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg px-3 py-2.5"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                    <div className="text-[10px] font-bold mb-0.5"style={{ color: "var(--rtm-text-muted)"}}>{label}</div>
                    <div className="text-sm font-semibold truncate"style={{ color: "var(--rtm-text-primary)"}}>{String(value)}</div>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-xs font-bold mb-2"style={{ color: "var(--rtm-text-secondary)"}}>Departments Required</div>
                <div className="flex flex-wrap gap-2">{selected.departmentsRequired.map((d) => <DeptBadge key={d} dept={d} />)}</div>
              </div>
              {selected.blockedReason && (
                <div className="rounded-xl p-4"style={{ background: "#FEF2F2", border: "1px solid #FECACA"}}>
                  <div className="text-xs font-bold mb-1"style={{ color: "#DC2626"}}>Blocked Reason</div>
                  <p className="text-sm font-semibold"style={{ color: "#DC2626"}}><span style={{ fontWeight: "bold" }}>!</span> {selected.blockedReason}</p>
                  <p className="text-xs mt-1"style={{ color: "var(--rtm-text-secondary)"}}>{selected.nextAction}</p>
                </div>
              )}
            </div>
          )}

          {/* Line Items */}
          {drawerTab === "lineItems"&& (
            <div className="space-y-3">
              <h3 className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>Line Items Sold</h3>
              {selected.lineItemsSold.map((li, i) => (
                <div key={i} className="rounded-lg p-4"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{li.name}</span>
                    <DeptBadge dept={li.department} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs"style={{ color: "var(--rtm-text-secondary)"}}>
                    <span>Type: <b>{li.billingType}</b></span>
                    <span>Setup: <b>${li.setupFee.toLocaleString()}</b></span>
                    <span>Monthly: <b>${li.monthlyFee > 0 ? `${li.monthlyFee.toLocaleString()}/mo` : "—"}</b></span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Dept Requirements */}
          {drawerTab === "deptRequirements"&& (
            <div className="space-y-4">
              <h3 className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>Department Requirements</h3>
              {selected.departmentRequirements.map((dr) => (
                <div key={dr.department} className="rounded-xl p-4"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                  <div className="flex items-center justify-between mb-3">
                    <DeptBadge dept={dr.department} />
                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold px-2 py-0.5 rounded-full text-[11px] font-semibold" style={statusColor(dr.activationStatus)}>{dr.activationStatus}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-3 mb-3">
                    {[
                      { label: "Line Items", value: dr.soldLineItems.length },
                      { label: "Templates", value: dr.taskTemplates.length },
                      { label: "Target Days", value: `${dr.targetCompletionDays}d` },
                      { label: "Assigned Owner", value: dr.assignedOwner ?? "Unassigned"},
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-lg px-3 py-2"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border-light)"}}>
                        <div className="text-[10px] font-bold"style={{ color: "var(--rtm-text-muted)"}}>{label}</div>
                        <div className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{String(value)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1">
                    {dr.taskTemplates.map((t) => (
                      <div key={t.templateName} className="flex items-center justify-between rounded px-3 py-1.5"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border-light)"}}>
                        <span className="text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{t.templateName}</span>
                        <div className="flex items-center gap-2 text-xs"style={{ color: "var(--rtm-text-muted)"}}>
                          <span>{t.taskCount} tasks · {t.targetCompletionDays}d target</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${t.status === "Available"? "bg-emerald-100 text-emerald-700": t.status === "Missing"? "bg-red-100 text-red-700": "bg-amber-100 text-amber-700"}`}>{t.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {dr.dependencies.length > 0 && (
                    <div className="mt-2 text-xs"style={{ color: "var(--rtm-text-muted)"}}>
                      Dependencies: {dr.dependencies.join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Workload */}
          {drawerTab === "workload"&& (
            <div className="space-y-4">
              <h3 className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>SLA & Throughput Summary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Total Tasks", value: selected.taskTemplates.reduce((s, t) => s + t.taskCount, 0) },
                  { label: "Target Completion", value: `${selected.targetCompletionDays}d` },
                  { label: "Departments", value: selected.departmentsRequired.length },
                  { label: "Templates", value: selected.taskTemplates.length },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl px-4 py-3 text-center"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                    <div className="text-2xl font-black"style={{ color: "var(--rtm-blue)"}}>{value}</div>
                    <div className="text-[10px] font-semibold mt-0.5"style={{ color: "var(--rtm-text-secondary)"}}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Owners */}
          {drawerTab === "owners"&& (
            <div className="space-y-3">
              <h3 className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>Owner Assignments</h3>
              {selected.ownerAssignments.map((oa) => (
                <div key={oa.department} className="rounded-xl p-4"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                  <div className="flex items-center justify-between mb-3">
                    <DeptBadge dept={oa.department} />
                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold px-2 py-0.5 rounded-full text-[11px] font-semibold" style={ownerStatusColor(oa.assignmentStatus)}>{oa.assignmentStatus}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg px-3 py-2"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border-light)"}}>
                      <div className="text-[10px] font-bold mb-0.5"style={{ color: "var(--rtm-text-muted)"}}>Role</div>
                      <div className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{oa.ownerRole}</div>
                    </div>
                    <div className="rounded-lg px-3 py-2"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border-light)"}}>
                      <div className="text-[10px] font-bold mb-0.5"style={{ color: "var(--rtm-text-muted)"}}>Assigned User</div>
                      <div className="text-sm font-semibold"style={{ color: oa.assignedUser ? "var(--rtm-text-primary)": "var(--rtm-text-muted)"}}>
                        {oa.assignedUser ?? "Unassigned"}
                      </div>
                    </div>
                    {oa.backupOwner && (
                      <div className="rounded-lg px-3 py-2 col-span-2"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border-light)"}}>
                        <div className="text-[10px] font-bold mb-0.5"style={{ color: "var(--rtm-text-muted)"}}>Backup Owner</div>
                        <div className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{oa.backupOwner}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Dependencies */}
          {drawerTab === "dependencies"&& (
            <div className="space-y-3">
              <h3 className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>Dependencies</h3>
              {selected.dependencies.length === 0 ? (
                <div className="rounded-xl p-6 text-center"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                  
                  <p className="text-sm"style={{ color: "var(--rtm-text-muted)"}}>No outstanding dependencies.</p>
                </div>
              ) : selected.dependencies.map((dep) => (
                <div key={dep.name} className="flex items-start gap-3 rounded-lg px-4 py-3"style={{ background: dep.status === "Missing"? "#FEF2F2": dep.status === "Satisfied"? "#ECFDF5": "var(--rtm-bg)", border: `1px solid ${dep.status === "Missing"? "#FECACA": dep.status === "Satisfied"? "#A7F3D0": "var(--rtm-border)"}` }}>
                  <div className="flex-1">
                    <div className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{dep.name}</div>
                    {dep.detail && <div className="mt-0.5 text-xs"style={{ color: "var(--rtm-text-muted)"}}>{dep.detail}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <DeptBadge dept={dep.department} />
                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold px-2 py-0.5 rounded-full text-[11px] font-semibold" style={depStatusColor(dep.status)}>{dep.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Queues */}
          {drawerTab === "queues"&& (
            <div className="space-y-3">
              <h3 className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>Department Queues</h3>
              {selected.departmentQueues.length === 0 ? (
                <div className="rounded-xl p-6 text-center"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                  
                  <p className="text-sm"style={{ color: "var(--rtm-text-muted)"}}>No queues created yet.</p>
                </div>
              ) : selected.departmentQueues.map((q) => (
                <div key={q.department} className="rounded-xl p-4"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                  <div className="flex items-center justify-between mb-3">
                    <DeptBadge dept={q.department} />
                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold px-2 py-0.5 rounded-full text-[11px] font-semibold" style={queueStatusColor(q.queueStatus)}>{q.queueStatus}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "Task Count", value: q.taskCount },
                      { label: "Target Days", value: `${q.targetCompletionDays}d` },
                      { label: "Owner", value: q.owner ?? "Unassigned"},
                      { label: "Start Date", value: q.startDate ?? "TBD"},
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-lg px-3 py-2"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border-light)"}}>
                        <div className="text-[10px] font-bold"style={{ color: "var(--rtm-text-muted)"}}>{label}</div>
                        <div className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{String(value)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Timeline */}
          {drawerTab === "timeline"&& (
            <div className="space-y-3">
              <h3 className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>Activation Timeline</h3>
              {selected.timeline.map((ev, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"style={{ background: "var(--rtm-blue)"}} />
                    {i < selected.timeline.length - 1 && <div className="w-px flex-1 mt-1 min-h-[24px]"style={{ background: "var(--rtm-border)"}} />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{ev.event}</p>
                    <p className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{ev.date} · {ev.actor}</p>
                    {ev.detail && <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{ev.detail}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          {drawerTab === "notes"&& (
            <div className="space-y-3">
              <h3 className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>Notes</h3>
              {selected.notes ? (
                <div className="rounded-lg p-4"style={{ background: "#FFFBEB", border: "1px solid #FDE68A"}}>
                  <p className="text-sm leading-relaxed"style={{ color: "var(--rtm-text-primary)"}}>{selected.notes}</p>
                </div>
              ) : (
                <p className="text-sm"style={{ color: "var(--rtm-text-muted)"}}>No notes added.</p>
              )}
              <button className="mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold border"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)"}}>
                Add Note
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

//  Main Page 

export default function DepartmentActivationPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DeptActivationStatus | "All">("All");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "All">("All");
  const [selected, setSelected] = useState<DeptActivationCase | null>(null);

  const filtered = useMemo(() => {
    return DEPT_ACTIVATION_CASES.filter((c) => {
      const matchSearch = !search || c.client.toLowerCase().includes(search.toLowerCase()) || c.contractRef.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All"|| c.activationStatus === statusFilter;
      const matchPriority = priorityFilter === "All"|| c.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [search, statusFilter, priorityFilter]);

  const kpis = useMemo(() => {
    const all = DEPT_ACTIVATION_CASES;
    return {
      pending: all.filter((c) => c.activationStatus === "Pending").length,
      activated: all.filter((c) => c.activationStatus === "Activated").length,
      clientsNeedingOwner: all.filter((c) => c.activationStatus === "Owner Assignment Needed").length,
      tasksGenerated: all.reduce((sum, c) => sum + c.taskTemplates.reduce((s2, t) => s2 + t.taskCount, 0), 0),
      targetCompletionDays: all.reduce((sum, c) => sum + c.targetCompletionDays, 0),
      blocked: all.filter((c) => c.activationStatus === "Blocked"|| c.activationStatus === "Failed").length,
      activeQueues: all.reduce((sum, c) => sum + c.departmentQueues.filter((q) => q.queueStatus === "Active").length, 0),
      activatedThisMonth: all.filter((c) => c.activatedAt && c.activatedAt.startsWith("2025-07")).length,
    };
  }, []);

  return (
    <div className="space-y-6">
      {/*  Header  */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[11px] font-bold uppercase tracking-widest"style={{ color: "var(--rtm-blue)"}}>Projects &amp; Tasks</p>
            <span className="text-[11px]"style={{ color: "var(--rtm-text-muted)"}}>›</span>
            <p className="text-[11px] font-semibold uppercase tracking-widest"style={{ color: "var(--rtm-text-muted)"}}>Department Activation</p>
          </div>
          <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>Department Activation Engine</h1>
          <p className="mt-1 text-sm max-w-xl"style={{ color: "var(--rtm-text-secondary)"}}>
            Activate department queues, assign owners, generate task lists, and route project work to service departments based on sold line items. Delivery standards are sourced from line items — not department defaults.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 text-sm font-bold rounded-lg text-white"style={{ background: "var(--rtm-blue)"}}>Activate Departments</button>
          <button className="px-4 py-2 text-sm font-semibold rounded-lg border"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)"}}>Assign Owners</button>
          <button className="px-4 py-2 text-sm font-semibold rounded-lg border"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)"}}>Sync Queue</button>
          <button className="px-4 py-2 text-sm font-semibold rounded-lg border"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)"}}>Export Queue Report</button>
          <Link href="/tasks/activation-engine" className="px-4 py-2 text-sm font-semibold rounded-lg border" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)" }}>Activation Engine</Link>
          <Link href="/tasks/templates" className="px-4 py-2 text-sm font-semibold rounded-lg border" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)" }}>Task Templates</Link>
        </div>
      </div>

      {/* Flow breadcrumb */}
      <div className="rounded-xl p-4 flex flex-wrap items-center gap-2"style={{ background: "var(--rtm-blue-xlight)", border: "1px solid #BFDBFE"}}>
        {["Line Items Sold", "Rules Matched", "Tasks Generated", "SLA Status", "Owner Assigned", "Queue Started"].map((step, i, arr) => (
          <span key={step} className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white"style={{ color: "#1E40AF", border: "1px solid #BFDBFE"}}>{step}</span>
            {i < arr.length - 1 && <span className="font-black"style={{ color: "#93C5FD"}}>→</span>}
          </span>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {(
          [
            { key: "pending", val: kpis.pending, color: "text-blue-700"},
            { key: "activated", val: kpis.activated, color: "text-emerald-600"},
            { key: "clientsNeedingOwner", val: kpis.clientsNeedingOwner, color: "text-amber-600"},
            { key: "tasksGenerated", val: kpis.tasksGenerated, color: "text-cyan-700"},
            { key: "targetCompletionDays", val: `${kpis.targetCompletionDays}d`, color: "text-blue-700"},
            { key: "blocked", val: kpis.blocked, color: "text-red-600"},
            { key: "activeQueues", val: kpis.activeQueues, color: "text-teal-700"},
            { key: "activatedThisMonth", val: kpis.activatedThisMonth, color: "text-violet-600"},
          ] as const
        ).map(({ key, val, color }) => (
          <div key={key} className="rounded-xl px-4 py-3"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}>
            <div className={`text-2xl font-black ${color}`}>{val}</div>
            <div className="mt-1 text-[11px] font-semibold leading-tight"style={{ color: "var(--rtm-text-secondary)"}}>{KPI_LABEL[key]}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-xl px-4 py-3 flex flex-wrap gap-3 items-center"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}>
        <input
          type="text"placeholder="Search client or contract…"value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56 px-3 py-1.5 rounded-lg text-sm outline-none"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-primary)"}}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as DeptActivationStatus | "All")}
          className="px-3 py-1.5 rounded-lg text-sm outline-none"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-primary)"}}
        >
          <option value="All">All Statuses</option>
          {(["Pending","Ready","Owner Assignment Needed","Tasks Generated","Department Queue Created","Activated","Blocked","Failed"] as DeptActivationStatus[]).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as Priority | "All")}
          className="px-3 py-1.5 rounded-lg text-sm outline-none"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)", color: "var(--rtm-text-primary)"}}
        >
          <option value="All">All Priorities</option>
          {(["High","Medium","Low"] as Priority[]).map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <span className="ml-auto text-xs font-semibold"style={{ color: "var(--rtm-text-muted)"}}>{filtered.length} of {DEPT_ACTIVATION_CASES.length} cases</span>
      </div>

      {/* Activation Queue Table */}
      <div className="rounded-xl overflow-hidden"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}>
        <div className="px-5 py-4"style={{ borderBottom: "1px solid var(--rtm-border)"}}>
          <h2 className="text-sm font-extrabold"style={{ color: "var(--rtm-text-primary)"}}>Department Activation Queue</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1100px]">
            <thead style={{ background: "var(--rtm-bg)", borderBottom: "2px solid var(--rtm-border)"}}>
              <tr>
                {[
                  "Client", "Line Item", "Department", "Task Template",
                  "First Response Due", "Target Completion Date", "Escalation Date",
                  "SLA Status", "Owner", "Activation Status", "Actions",
                ].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.flatMap((c) =>
                c.lineItemsSold.map((li, liIdx) => (
                  <tr
                    key={`${c.id}-${liIdx}`}
                    className="hover:bg-blue-50/20 cursor-pointer transition-colors"style={{ borderBottom: "1px solid var(--rtm-border-light)"}}
                    onClick={() => setSelected(c)}
                  >
                    {/* Client */}
                    <td className="px-4 py-3 font-semibold whitespace-nowrap"style={{ color: "var(--rtm-blue)"}}>
                      {liIdx === 0 ? c.client : ""}
                    </td>
                    {/* Line Item */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-xs"style={{ color: "var(--rtm-text-primary)"}}>{li.name}</div>
                      <div className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>{li.billingType}</div>
                    </td>
                    {/* Department */}
                    <td className="px-4 py-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold"style={{ background: DEPT_COLORS[li.department]?.bg ?? "#F8FAFC", color: DEPT_COLORS[li.department]?.color ?? "#475569", border: `1px solid ${DEPT_COLORS[li.department]?.border ?? "#CBD5E1"}` }}>
                        {li.department}
                      </span>
                    </td>
                    {/* Task Template */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-[10px] px-1.5 py-0.5 rounded"style={{ background: "#F5F3FF", color: "#6D28D9"}}>
                        {c.taskTemplates.find((t) => t.department === li.department)?.templateName ?? "—"}
                      </span>
                    </td>
                    {/* First Response Due — from line item SLA */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {li.firstResponseDue ? (
                        <span className="text-[11px] font-semibold"style={{ color: "#1D4ED8"}}> {li.firstResponseDue}</span>
                      ) : <span style={{ color: "var(--rtm-text-muted)"}}>—</span>}
                    </td>
                    {/* Target Completion Date — from line item SLA */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {li.targetCompletionDate ? (
                        <span className="text-[11px] font-bold"style={{ color: "#059669"}}>{li.targetCompletionDate}</span>
                      ) : <span style={{ color: "var(--rtm-text-muted)"}}>—</span>}
                    </td>
                    {/* Escalation Date — from line item SLA */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {li.escalationDate ? (
                        <span className="text-[11px]"style={{ color: "#C2410C"}}>{li.escalationDate}</span>
                      ) : <span style={{ color: "var(--rtm-text-muted)"}}>—</span>}
                    </td>
                    {/* SLA Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"style={{ background: li.lineItemSLA?.slaStatus === "Active"? "#F0FDF4": "#FFF7ED", color: li.lineItemSLA?.slaStatus === "Active"? "#15803D": "#C2410C"}}>
                        {li.lineItemSLA?.slaStatus ?? "Unknown"}
                      </span>
                    </td>
                    {/* Owner */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {c.ownerAssignments.find((o) => o.department === li.department)?.assignedUser ?? (
                        <span className="text-[10px] text-amber-600 font-semibold">Unassigned</span>
                      )}
                    </td>
                    {/* Activation Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold px-2 py-0.5 rounded-full text-[11px] font-semibold" style={statusColor(c.activationStatus)}>{c.activationStatus}</span>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3"onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1.5 flex-wrap">
                        <button className="px-2 py-1 rounded text-[11px] font-semibold border"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)"}} onClick={() => setSelected(c)}>View</button>
                        <Link href={`/clients/${c.clientSlug}`} className="px-2 py-1 rounded text-[11px] font-semibold border" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)" }}>Client</Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-sm"style={{ color: "var(--rtm-text-muted)"}}>
            No department activation cases match your filters.
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {selected && (
        <DetailDrawer selected={selected} onClose={() => setSelected(null)} />
      )}

      {/* ── Blueprint-Originated Tasks ── */}
      <BlueprintTasksSection />

      {/* ── Footer Note ── */}
      <div
        className="rounded-xl px-5 py-4 text-xs"
        style={{
          background: "var(--rtm-bg)",
          border: "1px solid var(--rtm-border)",
          color: "var(--rtm-text-muted)",
        }}
      >
        Tasks shown here originated from project task blueprints. All task
        ownership and lifecycle management is handled through{" "}
        <Link
          href="/tasks"
          className="font-semibold hover:underline"
          style={{ color: "var(--rtm-blue)" }}
        >
          Global Tasks
        </Link>
        .
      </div>
    </div>
  );
}

// =============================================================================
// Blueprint Task Section — activated tasks from project blueprints
// =============================================================================

// ─── Mock GeneratedTask Data ──────────────────────────────────────────────────

const BLUEPRINT_ACTIVATED_TASKS: GeneratedTask[] = [
  {
    id: "btask-001",
    blueprintTaskId: "seo-001",
    projectId: "proj-001",
    clientName: "Apex Dental Studio",
    serviceId: "seo",
    serviceName: "SEO",
    department: "SEO",
    name: "Technical SEO Audit",
    description: "Comprehensive audit of site structure, crawlability, and technical health.",
    type: "setup",
    priority: "high" as BlueprintTaskPriority,
    status: "active" as BlueprintTaskStatus,
    assignedTo: "Sarah K.",
    assignedRole: "SEO Specialist",
    estimatedHours: 4,
    dueDate: "2025-08-04",
    recurring: false,
    createdAt: "2025-07-28",
  },
  {
    id: "btask-002",
    blueprintTaskId: "seo-002",
    projectId: "proj-001",
    clientName: "Apex Dental Studio",
    serviceId: "seo",
    serviceName: "SEO",
    department: "SEO",
    name: "Keyword Research and Mapping",
    description: "Identify target keywords and map to site pages.",
    type: "setup",
    priority: "high" as BlueprintTaskPriority,
    status: "pending" as BlueprintTaskStatus,
    assignedTo: "Sarah K.",
    assignedRole: "SEO Specialist",
    estimatedHours: 6,
    dueDate: "2025-08-08",
    recurring: false,
    createdAt: "2025-07-28",
  },
  {
    id: "btask-003",
    blueprintTaskId: "gbp-001",
    projectId: "proj-001",
    clientName: "Apex Dental Studio",
    serviceId: "gbp",
    serviceName: "Google Business Profile",
    department: "GBP",
    name: "GBP Profile Verification",
    description: "Verify ownership of the GBP listing.",
    type: "setup",
    priority: "critical" as BlueprintTaskPriority,
    status: "active" as BlueprintTaskStatus,
    assignedTo: "Marcus L.",
    assignedRole: "GBP Specialist",
    estimatedHours: 2,
    dueDate: "2025-08-03",
    recurring: false,
    createdAt: "2025-07-28",
  },
  {
    id: "btask-004",
    blueprintTaskId: "ppc-001",
    projectId: "proj-002",
    clientName: "Summit Sports Medicine",
    serviceId: "ppc",
    serviceName: "Google Ads / PPC",
    department: "PPC",
    name: "Campaign Structure Setup",
    description: "Build campaign and ad group structure aligned to client services.",
    type: "setup",
    priority: "critical" as BlueprintTaskPriority,
    status: "active" as BlueprintTaskStatus,
    assignedTo: "Derek M.",
    assignedRole: "PPC Specialist",
    estimatedHours: 6,
    dueDate: "2025-08-08",
    recurring: false,
    createdAt: "2025-07-28",
  },
  {
    id: "btask-005",
    blueprintTaskId: "ppc-003",
    projectId: "proj-002",
    clientName: "Summit Sports Medicine",
    serviceId: "ppc",
    serviceName: "Google Ads / PPC",
    department: "PPC",
    name: "Conversion Tracking Setup",
    description: "Implement and verify conversion tracking via GTM and Google Ads.",
    type: "setup",
    priority: "critical" as BlueprintTaskPriority,
    status: "pending" as BlueprintTaskStatus,
    assignedTo: "Derek M.",
    assignedRole: "PPC Specialist",
    estimatedHours: 2,
    dueDate: "2025-08-08",
    recurring: false,
    createdAt: "2025-07-28",
  },
  {
    id: "btask-006",
    blueprintTaskId: "meta-001",
    projectId: "proj-002",
    clientName: "Summit Sports Medicine",
    serviceId: "meta-ads",
    serviceName: "Meta Ads",
    department: "Meta Ads",
    name: "Ad Account Setup",
    description: "Create and configure the Meta Business Manager and ad account.",
    type: "setup",
    priority: "critical" as BlueprintTaskPriority,
    status: "active" as BlueprintTaskStatus,
    assignedTo: "Priya N.",
    assignedRole: "Meta Ads Specialist",
    estimatedHours: 2,
    dueDate: "2025-08-07",
    recurring: false,
    createdAt: "2025-07-28",
  },
  {
    id: "btask-007",
    blueprintTaskId: "web-001",
    projectId: "proj-003",
    clientName: "Coastal Dermatology Group",
    serviceId: "website",
    serviceName: "Website",
    department: "Web Development",
    name: "Discovery and Requirements",
    description: "Conduct discovery call and document site structure and requirements.",
    type: "setup",
    priority: "critical" as BlueprintTaskPriority,
    status: "active" as BlueprintTaskStatus,
    assignedTo: "Aaron P.",
    assignedRole: "Lead Developer",
    estimatedHours: 4,
    dueDate: "2025-08-13",
    recurring: false,
    createdAt: "2025-07-28",
  },
  {
    id: "btask-008",
    blueprintTaskId: "seo-004",
    projectId: "proj-001",
    clientName: "Apex Dental Studio",
    serviceId: "seo",
    serviceName: "SEO",
    department: "SEO",
    name: "Monthly SEO Report",
    description: "Monthly report covering rankings, traffic, and key SEO metrics.",
    type: "reporting",
    priority: "medium" as BlueprintTaskPriority,
    status: "pending" as BlueprintTaskStatus,
    assignedTo: "Sarah K.",
    assignedRole: "SEO Specialist",
    estimatedHours: 2,
    dueDate: "2025-09-01",
    recurring: true,
    recurringInterval: "month",
    createdAt: "2025-07-28",
  },
];

// ─── Blueprint Tasks Section Component ───────────────────────────────────────

function BlueprintTasksSection() {
  // Group tasks by department
  const byDepartment = useMemo(() => {
    const groups: Record<string, GeneratedTask[]> = {};
    for (const task of BLUEPRINT_ACTIVATED_TASKS) {
      if (!groups[task.department]) groups[task.department] = [];
      groups[task.department].push(task);
    }
    return groups;
  }, []);

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div>
        <h2
          className="text-base font-extrabold"
          style={{ color: "var(--rtm-text-primary)" }}
        >
          Blueprint-Activated Tasks
        </h2>
        <p
          className="text-xs mt-0.5"
          style={{ color: "var(--rtm-text-secondary)" }}
        >
          Activated tasks ready for department execution, generated from project
          task blueprints.
        </p>
      </div>

      {/* Department sections */}
      {Object.entries(byDepartment).map(([department, tasks]) => (
        <div
          key={department}
          className="rounded-xl overflow-hidden"
          style={{
            background: "var(--rtm-surface)",
            border: "1px solid var(--rtm-border)",
          }}
        >
          {/* Dept header */}
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ borderBottom: "1px solid var(--rtm-border)" }}
          >
            <div className="flex items-center gap-2">
              <span
                className="font-bold text-sm"
                style={{ color: "var(--rtm-text-primary)" }}
              >
                {department}
              </span>
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
                style={{
                  background: "var(--rtm-blue-xlight)",
                  color: "var(--rtm-blue)",
                  border: "1px solid #BFDBFE",
                }}
              >
                {tasks.length} task{tasks.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Task table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead
                style={{
                  background: "var(--rtm-bg)",
                  borderBottom: "2px solid var(--rtm-border)",
                }}
              >
                <tr>
                  {["Task", "Client", "Service", "Priority", "Due Date", "Assigned To", "Status"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-left text-[11px] font-black uppercase tracking-wide whitespace-nowrap"
                        style={{ color: "var(--rtm-text-secondary)" }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, idx) => {
                  const priorityColors = BLUEPRINT_PRIORITY_COLORS[task.priority];
                  const statusColors = BLUEPRINT_TASK_STATUS_COLORS[task.status];
                  return (
                    <tr
                      key={task.id}
                      style={{
                        borderBottom:
                          idx < tasks.length - 1
                            ? "1px solid var(--rtm-border-light)"
                            : undefined,
                      }}
                    >
                      {/* Task name */}
                      <td className="px-4 py-2.5">
                        <div
                          className="font-semibold text-sm"
                          style={{ color: "var(--rtm-text-primary)" }}
                        >
                          {task.name}
                        </div>
                      </td>
                      {/* Client */}
                      <td
                        className="px-4 py-2.5 text-sm whitespace-nowrap"
                        style={{ color: "var(--rtm-text-secondary)" }}
                      >
                        {task.clientName}
                      </td>
                      {/* Service */}
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold"
                          style={{
                            background: "var(--rtm-bg)",
                            color: "var(--rtm-text-secondary)",
                            border: "1px solid var(--rtm-border)",
                          }}
                        >
                          {task.serviceName}
                        </span>
                      </td>
                      {/* Priority */}
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold"
                          style={{
                            background: priorityColors.bg,
                            color: priorityColors.color,
                            border: `1px solid ${priorityColors.border}`,
                          }}
                        >
                          {task.priority.charAt(0).toUpperCase() +
                            task.priority.slice(1)}
                        </span>
                      </td>
                      {/* Due Date */}
                      <td
                        className="px-4 py-2.5 text-sm whitespace-nowrap"
                        style={{ color: "var(--rtm-text-secondary)" }}
                      >
                        {task.dueDate}
                      </td>
                      {/* Assigned To */}
                      <td
                        className="px-4 py-2.5 text-sm whitespace-nowrap"
                        style={{
                          color: task.assignedTo
                            ? "var(--rtm-text-primary)"
                            : "var(--rtm-text-muted)",
                        }}
                      >
                        {task.assignedTo ?? "Unassigned"}
                      </td>
                      {/* Status */}
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold"
                          style={{
                            background: statusColors.bg,
                            color: statusColors.color,
                            border: `1px solid ${statusColors.border}`,
                          }}
                        >
                          {BLUEPRINT_TASK_STATUS_LABELS[task.status]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
