"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import TaskAccessCard from "@/components/tasks/TaskAccessCard";
import { NOTIFICATIONS } from "@/lib/notifications";

// 
// TYPES
// 

type ClientStatus =
  | "Lead"| "Proposal Sent"| "Invoice Sent"| "Invoice Paid"| "Ready for Onboarding"| "AM Assignment Needed"| "Onboarding Pending"| "Department Activation Pending"| "Active"| "Renewal Due"| "Cancellation Requested"| "Offboarding";

type WorkflowStatus =
  | "Not Started"| "Pending Review"| "In Progress"| "Awaiting Client"| "Escalated"| "Complete";

type BillingStatus = "Pending"| "Paid"| "Overdue"| "Cleared"| "Closed";

type ActivationStatus =
  | "Not Started"| "Ready for Onboarding"| "AM Assignment Needed"| "Onboarding Pending"| "Department Activation Pending"| "Active";

type HealthStatus = "Excellent"| "Good"| "At Risk"| "Critical";
type Priority = "High"| "Medium"| "Low";

interface ActivationChecklist {
  invoicePaid: boolean;
  billingCleared: boolean;
  contractConfirmed: boolean;
  servicesConfirmed: boolean;
  clientContactVerified: boolean;
  amAssigned: boolean;
  onboardingRecordCreated: boolean;
  activationTasksCreated: boolean;
  kickoffNeeded: boolean;
}

interface RecentEvent {
  date: string;
  actor: string;
  action: string;
}

interface MasterClient {
  id: string;
  slug: string;
  clientName: string;
  industry: string;
  assignedAM: string;
  email: string;
  currentStatus: ClientStatus;
  workflowStatus: WorkflowStatus;
  billingStatus: BillingStatus;
  activationStatus: ActivationStatus;
  activeServices: string[];
  monthlyValue: number;
  renewalDate: string;
  clientHealth: HealthStatus;
  priority: Priority;
  lastActivity: string;
  invoiceStatus: string;
  nextRequiredAction: string;
  activationChecklist: ActivationChecklist;
  recentEvents: RecentEvent[];
  notes: string;
  avatarColor: string;
  // Affiliate Attribution
  referralSource?: string;
  affiliateName?: string;
  referralRevenue?: string;
  commissionStatus?: "Paid"| "Pending"| "Processing"| "Not Applicable";
}

// 
// MOCK DATA — 20 clients
// 

const PORTFOLIO_CLIENTS: MasterClient[] = [
  {
    id: "mc001",
    slug: "apex-roofing",
    clientName: "Apex Roofing Solutions",
    industry: "Home Services – Roofing",
    assignedAM: "Jordan M.",
    email: "david@apexroofing.com",
    currentStatus: "Active",
    workflowStatus: "In Progress",
    billingStatus: "Paid",
    activationStatus: "Active",
    activeServices: ["SEO / GBP", "Meta Ads", "Content Writing", "Monthly Reporting"],
    monthlyValue: 5350,
    renewalDate: "2026-03-01",
    clientHealth: "Excellent",
    priority: "High",
    lastActivity: "2025-05-28",
    invoiceStatus: "Paid",
    nextRequiredAction: "Send June performance report",
    activationChecklist: { invoicePaid: true, billingCleared: true, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: true, onboardingRecordCreated: true, activationTasksCreated: true, kickoffNeeded: false },
    recentEvents: [
      { date: "2025-05-28", actor: "Jordan M.", action: "Sent May performance report"},
      { date: "2025-05-22", actor: "System", action: "Invoice #1042 processed – $5,350"},
    ],
    notes: "High-value client. Storm season drives spike in leads.",
    avatarColor: "#6366f1",
    referralSource: "Direct",
    commissionStatus: "Not Applicable",
  },
  {
    id: "mc002",
    slug: "sunbelt-hvac",
    clientName: "Sunbelt HVAC & Air",
    industry: "Home Services – HVAC",
    assignedAM: "Sarah K.",
    email: "linda@sunbelthvac.com",
    currentStatus: "Active",
    workflowStatus: "Escalated",
    billingStatus: "Overdue",
    activationStatus: "Active",
    activeServices: ["SEO / GBP", "Review Management"],
    monthlyValue: 2000,
    renewalDate: "2025-08-01",
    clientHealth: "At Risk",
    priority: "High",
    lastActivity: "2025-05-27",
    invoiceStatus: "Overdue 30d",
    nextRequiredAction: "Escalate billing — personal outreach required",
    activationChecklist: { invoicePaid: false, billingCleared: false, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: true, onboardingRecordCreated: true, activationTasksCreated: true, kickoffNeeded: false },
    recentEvents: [
      { date: "2025-05-27", actor: "Sarah K.", action: "Flagged as at-risk — invoice 30+ days overdue"},
      { date: "2025-05-10", actor: "Sarah K.", action: "Called Linda — no answer. Left voicemail."},
    ],
    notes: "At-risk. Invoice overdue 30 days. Campaigns paused.",
    avatarColor: "#f59e0b",
    referralSource: "Affiliate",
    affiliateName: "Brandon Ellis",
    referralRevenue: "$2,000/mo",
    commissionStatus: "Paid",
  },
  {
    id: "mc003",
    slug: "pacific-dental",
    clientName: "Pacific Dental Group",
    industry: "Healthcare – Dentistry",
    assignedAM: "Jordan M.",
    email: "karen@pacificdentalgroup.com",
    currentStatus: "Renewal Due",
    workflowStatus: "Awaiting Client",
    billingStatus: "Paid",
    activationStatus: "Active",
    activeServices: ["SEO / GBP", "Website Maintenance", "Content Writing", "Yelp Ads"],
    monthlyValue: 5150,
    renewalDate: "2025-06-15",
    clientHealth: "Good",
    priority: "High",
    lastActivity: "2025-05-29",
    invoiceStatus: "Paid",
    nextRequiredAction: "Send renewal proposal — due in 16 days",
    activationChecklist: { invoicePaid: true, billingCleared: true, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: true, onboardingRecordCreated: true, activationTasksCreated: true, kickoffNeeded: false },
    recentEvents: [
      { date: "2025-05-29", actor: "System", action: "Monthly report sent to Dr. Yee"},
      { date: "2025-05-15", actor: "Jordan M.", action: "Discussed second location expansion — Q4 2025 target"},
    ],
    notes: "Long-term client. Renewal in 16 days.",
    avatarColor: "#10b981",
    referralSource: "Affiliate",
    affiliateName: "Maria Santos",
    referralRevenue: "$5,150/mo",
    commissionStatus: "Pending",
  },
  {
    id: "mc004",
    slug: "blue-ridge-plumbing",
    clientName: "Blue Ridge Plumbing Co.",
    industry: "Home Services – Plumbing",
    assignedAM: "Alex R.",
    email: "tom@blueridgeplumbing.com",
    currentStatus: "Department Activation Pending",
    workflowStatus: "In Progress",
    billingStatus: "Paid",
    activationStatus: "Department Activation Pending",
    activeServices: ["SEO / GBP", "Website Build"],
    monthlyValue: 1500,
    renewalDate: "2026-05-01",
    clientHealth: "Good",
    priority: "Medium",
    lastActivity: "2025-05-28",
    invoiceStatus: "Paid",
    nextRequiredAction: "Complete website wireframes and department activation",
    activationChecklist: { invoicePaid: true, billingCleared: true, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: true, onboardingRecordCreated: true, activationTasksCreated: false, kickoffNeeded: false },
    recentEvents: [
      { date: "2025-05-28", actor: "Casey L.", action: "Started website wireframe design"},
      { date: "2025-05-08", actor: "Alex R.", action: "Onboarding kickoff call — all access received"},
    ],
    notes: "New client — onboarded May 2025. Website build in progress.",
    avatarColor: "#3b82f6",
  },
  {
    id: "mc005",
    slug: "harbor-auto",
    clientName: "Harbor Auto Group",
    industry: "Automotive – Dealership",
    assignedAM: "Sarah K.",
    email: "frank@harborauto.com",
    currentStatus: "Active",
    workflowStatus: "Escalated",
    billingStatus: "Pending",
    activationStatus: "Active",
    activeServices: ["Meta Ads", "SEO / GBP"],
    monthlyValue: 6500,
    renewalDate: "2025-11-01",
    clientHealth: "At Risk",
    priority: "High",
    lastActivity: "2025-05-26",
    invoiceStatus: "Pending",
    nextRequiredAction: "Resolve content quality dispute — escalate to director",
    activationChecklist: { invoicePaid: false, billingCleared: false, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: true, onboardingRecordCreated: true, activationTasksCreated: true, kickoffNeeded: false },
    recentEvents: [
      { date: "2025-05-26", actor: "Sarah K.", action: "Escalation raised — content quality complaint from Frank"},
      { date: "2025-05-15", actor: "Mike T.", action: "Launched Summer Sale Meta campaign — $8k budget"},
    ],
    notes: "At-risk due to content package dispute. Ad performance strong.",
    avatarColor: "#ef4444",
  },
  {
    id: "mc006",
    slug: "greenleaf-landscaping",
    clientName: "Greenleaf Landscaping",
    industry: "Home Services – Landscaping",
    assignedAM: "Jordan M.",
    email: "rob@greenleaflandscaping.com",
    currentStatus: "Lead",
    workflowStatus: "Pending Review",
    billingStatus: "Pending",
    activationStatus: "Not Started",
    activeServices: [],
    monthlyValue: 0,
    renewalDate: "—",
    clientHealth: "Good",
    priority: "Medium",
    lastActivity: "2025-05-30",
    invoiceStatus: "Not Issued",
    nextRequiredAction: "Send initial proposal",
    activationChecklist: { invoicePaid: false, billingCleared: false, contractConfirmed: false, servicesConfirmed: false, clientContactVerified: true, amAssigned: false, onboardingRecordCreated: false, activationTasksCreated: false, kickoffNeeded: true },
    recentEvents: [
      { date: "2025-05-30", actor: "Mike T.", action: "Discovery call completed — strong fit for SEO + Google Ads"},
    ],
    notes: "Inbound lead from referral. Strong fit.",
    avatarColor: "#84cc16",
  },
  {
    id: "mc007",
    slug: "metro-law-group",
    clientName: "Metro Law Group",
    industry: "Legal Services",
    assignedAM: "Sarah K.",
    email: "jsmith@metrolawgroup.com",
    currentStatus: "Proposal Sent",
    workflowStatus: "Awaiting Client",
    billingStatus: "Pending",
    activationStatus: "Not Started",
    activeServices: [],
    monthlyValue: 0,
    renewalDate: "—",
    clientHealth: "Good",
    priority: "High",
    lastActivity: "2025-05-25",
    invoiceStatus: "Not Issued",
    nextRequiredAction: "Follow up on proposal — 5 days no response",
    activationChecklist: { invoicePaid: false, billingCleared: false, contractConfirmed: false, servicesConfirmed: false, clientContactVerified: true, amAssigned: false, onboardingRecordCreated: false, activationTasksCreated: false, kickoffNeeded: true },
    recentEvents: [
      { date: "2025-05-25", actor: "Sarah K.", action: "Sent $4,200/mo proposal — SEO + PPC + Content"},
      { date: "2025-05-20", actor: "Mike T.", action: "Second discovery call completed"},
    ],
    notes: "High-value prospect. Proposal sent. Awaiting partner sign-off.",
    avatarColor: "#8b5cf6",
  },
  {
    id: "mc008",
    slug: "bright-vision-optometry",
    clientName: "Bright Vision Optometry",
    industry: "Healthcare – Optometry",
    assignedAM: "Alex R.",
    email: "dr.patel@brightvision.com",
    currentStatus: "Invoice Sent",
    workflowStatus: "Awaiting Client",
    billingStatus: "Pending",
    activationStatus: "Not Started",
    activeServices: [],
    monthlyValue: 0,
    renewalDate: "—",
    clientHealth: "Good",
    priority: "Medium",
    lastActivity: "2025-05-29",
    invoiceStatus: "Sent — Awaiting Payment",
    nextRequiredAction: "Wait for invoice payment to trigger onboarding",
    activationChecklist: { invoicePaid: false, billingCleared: false, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: false, onboardingRecordCreated: false, activationTasksCreated: false, kickoffNeeded: true },
    recentEvents: [
      { date: "2025-05-29", actor: "System", action: "Invoice #1110 sent — $2,800/mo SEO + GBP + Content"},
      { date: "2025-05-26", actor: "Mike T.", action: "Contract signed — services confirmed"},
    ],
    notes: "Contract signed. Invoice sent. Waiting for payment to start onboarding.",
    avatarColor: "#06b6d4",
  },
  {
    id: "mc009",
    slug: "summit-fitness",
    clientName: "Summit Fitness Studios",
    industry: "Health & Wellness – Fitness",
    assignedAM: "Jordan M.",
    email: "dana@summitfitness.com",
    currentStatus: "Invoice Paid",
    workflowStatus: "In Progress",
    billingStatus: "Cleared",
    activationStatus: "AM Assignment Needed",
    activeServices: [],
    monthlyValue: 3200,
    renewalDate: "2026-06-01",
    clientHealth: "Good",
    priority: "High",
    lastActivity: "2025-05-31",
    invoiceStatus: "Paid",
    nextRequiredAction: "Assign Account Manager immediately",
    activationChecklist: { invoicePaid: true, billingCleared: true, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: false, onboardingRecordCreated: false, activationTasksCreated: false, kickoffNeeded: true },
    recentEvents: [
      { date: "2025-05-31", actor: "System", action: "Invoice #1115 confirmed paid — $3,200"},
      { date: "2025-05-28", actor: "Mike T.", action: "Deal closed — Meta Ads + SEO + Content package"},
    ],
    notes: "Invoice paid. AM assignment needed before onboarding can begin.",
    avatarColor: "#f97316",
  },
  {
    id: "mc010",
    slug: "clearwater-insurance",
    clientName: "Clearwater Insurance Agency",
    industry: "Financial Services – Insurance",
    assignedAM: "Sarah K.",
    email: "bill@clearwaterins.com",
    currentStatus: "Ready for Onboarding",
    workflowStatus: "In Progress",
    billingStatus: "Cleared",
    activationStatus: "Ready for Onboarding",
    activeServices: [],
    monthlyValue: 4100,
    renewalDate: "2026-06-10",
    clientHealth: "Good",
    priority: "High",
    lastActivity: "2025-05-31",
    invoiceStatus: "Paid",
    nextRequiredAction: "Schedule onboarding kickoff call",
    activationChecklist: { invoicePaid: true, billingCleared: true, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: true, onboardingRecordCreated: false, activationTasksCreated: false, kickoffNeeded: true },
    recentEvents: [
      { date: "2025-05-31", actor: "Sarah K.", action: "Onboarding record queued — kickoff call to be scheduled"},
      { date: "2025-05-30", actor: "System", action: "Billing cleared — ready to activate"},
    ],
    notes: "All pre-conditions met. Ready for onboarding kickoff.",
    avatarColor: "#0ea5e9",
  },
  {
    id: "mc011",
    slug: "ridgeline-construction",
    clientName: "Ridgeline Construction LLC",
    industry: "Construction",
    assignedAM: "Alex R.",
    email: "tony@ridgelineconstruction.com",
    currentStatus: "Onboarding Pending",
    workflowStatus: "In Progress",
    billingStatus: "Paid",
    activationStatus: "Onboarding Pending",
    activeServices: ["SEO / GBP"],
    monthlyValue: 2800,
    renewalDate: "2026-05-15",
    clientHealth: "Good",
    priority: "Medium",
    lastActivity: "2025-05-27",
    invoiceStatus: "Paid",
    nextRequiredAction: "Complete onboarding tasks — access credentials pending",
    activationChecklist: { invoicePaid: true, billingCleared: true, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: true, onboardingRecordCreated: true, activationTasksCreated: false, kickoffNeeded: true },
    recentEvents: [
      { date: "2025-05-27", actor: "Alex R.", action: "Waiting on client to share GBP access credentials"},
      { date: "2025-05-20", actor: "Alex R.", action: "Onboarding record created — tasks assigned to SEO team"},
    ],
    notes: "Onboarding in progress. Waiting on GBP access from client.",
    avatarColor: "#78716c",
  },
  {
    id: "mc012",
    slug: "nova-medspa",
    clientName: "Nova MedSpa & Aesthetics",
    industry: "Healthcare – MedSpa",
    assignedAM: "Jordan M.",
    email: "kim@novamedspa.com",
    currentStatus: "Active",
    workflowStatus: "Complete",
    billingStatus: "Paid",
    activationStatus: "Active",
    activeServices: ["SEO / GBP", "Meta Ads", "Content Writing", "Google Ads"],
    monthlyValue: 7200,
    renewalDate: "2026-01-15",
    clientHealth: "Excellent",
    priority: "High",
    lastActivity: "2025-05-30",
    invoiceStatus: "Paid",
    nextRequiredAction: "Quarterly business review — schedule for June",
    activationChecklist: { invoicePaid: true, billingCleared: true, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: true, onboardingRecordCreated: true, activationTasksCreated: true, kickoffNeeded: false },
    recentEvents: [
      { date: "2025-05-30", actor: "Jordan M.", action: "May report delivered — all KPIs green"},
      { date: "2025-05-01", actor: "System", action: "Invoice #2088 processed — $7,200"},
    ],
    notes: "Top-performing account. Upsell opportunity: email marketing.",
    avatarColor: "#ec4899",
  },
  {
    id: "mc013",
    slug: "desert-solar",
    clientName: "Desert Solar Energy",
    industry: "Energy – Solar",
    assignedAM: "Sarah K.",
    email: "craig@desertsolar.com",
    currentStatus: "Cancellation Requested",
    workflowStatus: "Escalated",
    billingStatus: "Pending",
    activationStatus: "Active",
    activeServices: ["SEO / GBP", "Meta Ads"],
    monthlyValue: 3900,
    renewalDate: "2025-07-01",
    clientHealth: "Critical",
    priority: "High",
    lastActivity: "2025-05-29",
    invoiceStatus: "Pending",
    nextRequiredAction: "Retention call — director must be on the line",
    activationChecklist: { invoicePaid: false, billingCleared: false, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: true, onboardingRecordCreated: true, activationTasksCreated: true, kickoffNeeded: false },
    recentEvents: [
      { date: "2025-05-29", actor: "Craig W.", action: "Submitted cancellation request via portal"},
      { date: "2025-05-28", actor: "Sarah K.", action: "Escalated to director — retention required"},
    ],
    notes: "Cancellation requested. Director retention call scheduled for June 3.",
    avatarColor: "#dc2626",
  },
  {
    id: "mc014",
    slug: "lakeside-property",
    clientName: "Lakeside Property Management",
    industry: "Real Estate",
    assignedAM: "Alex R.",
    email: "mgmt@lakesideproperty.com",
    currentStatus: "Offboarding",
    workflowStatus: "In Progress",
    billingStatus: "Closed",
    activationStatus: "Active",
    activeServices: [],
    monthlyValue: 0,
    renewalDate: "—",
    clientHealth: "Critical",
    priority: "Medium",
    lastActivity: "2025-05-26",
    invoiceStatus: "Final invoice issued",
    nextRequiredAction: "Complete data export and access revocation",
    activationChecklist: { invoicePaid: true, billingCleared: true, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: true, onboardingRecordCreated: true, activationTasksCreated: true, kickoffNeeded: false },
    recentEvents: [
      { date: "2025-05-26", actor: "Alex R.", action: "Initiated offboarding — data export in progress"},
      { date: "2025-05-20", actor: "System", action: "Final invoice #988 issued and paid"},
    ],
    notes: "Client moving in-house. Offboarding in progress. Friendly exit.",
    avatarColor: "#94a3b8",
  },
  {
    id: "mc015",
    slug: "pinnacle-chiropractic",
    clientName: "Pinnacle Chiropractic",
    industry: "Healthcare – Chiropractic",
    assignedAM: "Jordan M.",
    email: "dr.lee@pinnaclechiro.com",
    currentStatus: "Active",
    workflowStatus: "In Progress",
    billingStatus: "Paid",
    activationStatus: "Active",
    activeServices: ["SEO / GBP", "Google Ads", "Review Management"],
    monthlyValue: 3600,
    renewalDate: "2025-12-01",
    clientHealth: "Good",
    priority: "Medium",
    lastActivity: "2025-05-28",
    invoiceStatus: "Paid",
    nextRequiredAction: "Deliver June SEO performance report",
    activationChecklist: { invoicePaid: true, billingCleared: true, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: true, onboardingRecordCreated: true, activationTasksCreated: true, kickoffNeeded: false },
    recentEvents: [
      { date: "2025-05-28", actor: "Lisa P.", action: "Google Ads optimized — CPC reduced 18%"},
      { date: "2025-05-01", actor: "System", action: "Invoice #1890 processed — $3,600"},
    ],
    notes: "Stable account. Google Ads performing well.",
    avatarColor: "#14b8a6",
  },
  {
    id: "mc016",
    slug: "capital-contractors",
    clientName: "Capital Contractors Group",
    industry: "Construction – Commercial",
    assignedAM: "Sarah K.",
    email: "ops@capitalcontractors.com",
    currentStatus: "Active",
    workflowStatus: "In Progress",
    billingStatus: "Overdue",
    activationStatus: "Active",
    activeServices: ["SEO / GBP", "Website Maintenance", "Monthly Reporting"],
    monthlyValue: 2400,
    renewalDate: "2025-10-01",
    clientHealth: "At Risk",
    priority: "High",
    lastActivity: "2025-05-24",
    invoiceStatus: "Overdue 15d",
    nextRequiredAction: "Send second billing notice — flag for collections if no response",
    activationChecklist: { invoicePaid: false, billingCleared: false, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: true, onboardingRecordCreated: true, activationTasksCreated: true, kickoffNeeded: false },
    recentEvents: [
      { date: "2025-05-24", actor: "System", action: "Second billing reminder sent — no response"},
      { date: "2025-05-10", actor: "Sarah K.", action: "Left voicemail for billing contact"},
    ],
    notes: "Invoice 15 days overdue. No contact response. Escalating.",
    avatarColor: "#854d0e",
  },
  {
    id: "mc017",
    slug: "eastside-veterinary",
    clientName: "Eastside Veterinary Clinic",
    industry: "Healthcare – Veterinary",
    assignedAM: "Alex R.",
    email: "admin@eastsidevetclinic.com",
    currentStatus: "Active",
    workflowStatus: "Complete",
    billingStatus: "Paid",
    activationStatus: "Active",
    activeServices: ["SEO / GBP", "Content Writing"],
    monthlyValue: 2100,
    renewalDate: "2026-02-01",
    clientHealth: "Excellent",
    priority: "Low",
    lastActivity: "2025-05-27",
    invoiceStatus: "Paid",
    nextRequiredAction: "No immediate action needed",
    activationChecklist: { invoicePaid: true, billingCleared: true, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: true, onboardingRecordCreated: true, activationTasksCreated: true, kickoffNeeded: false },
    recentEvents: [
      { date: "2025-05-27", actor: "Alex R.", action: "May deliverables completed — client confirmed satisfaction"},
      { date: "2025-05-01", actor: "System", action: "Invoice #1777 processed — $2,100"},
    ],
    notes: "Low-maintenance, high-satisfaction account.",
    avatarColor: "#22c55e",
  },
  {
    id: "mc018",
    slug: "ironclad-security",
    clientName: "Ironclad Security Systems",
    industry: "Security Services",
    assignedAM: "Jordan M.",
    email: "sales@ironcladsecurity.com",
    currentStatus: "Renewal Due",
    workflowStatus: "Awaiting Client",
    billingStatus: "Paid",
    activationStatus: "Active",
    activeServices: ["SEO / GBP", "Meta Ads", "Google Ads", "Monthly Reporting"],
    monthlyValue: 5800,
    renewalDate: "2025-06-30",
    clientHealth: "Good",
    priority: "High",
    lastActivity: "2025-05-29",
    invoiceStatus: "Paid",
    nextRequiredAction: "Send renewal agreement — 30 days out",
    activationChecklist: { invoicePaid: true, billingCleared: true, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: true, onboardingRecordCreated: true, activationTasksCreated: true, kickoffNeeded: false },
    recentEvents: [
      { date: "2025-05-29", actor: "Jordan M.", action: "Renewal conversation started — client open to expansion"},
      { date: "2025-05-01", actor: "System", action: "Invoice #2222 processed — $5,800"},
    ],
    notes: "Renewal in 30 days. Client hinted at adding two new locations.",
    avatarColor: "#1d4ed8",
  },
  {
    id: "mc019",
    slug: "coastal-wellness",
    clientName: "Coastal Wellness Center",
    industry: "Health & Wellness – Holistic",
    assignedAM: "Sarah K.",
    email: "info@coastalwellness.com",
    currentStatus: "Active",
    workflowStatus: "In Progress",
    billingStatus: "Paid",
    activationStatus: "Active",
    activeServices: ["SEO / GBP", "Meta Ads", "Email Marketing"],
    monthlyValue: 3300,
    renewalDate: "2025-11-15",
    clientHealth: "Good",
    priority: "Medium",
    lastActivity: "2025-05-26",
    invoiceStatus: "Paid",
    nextRequiredAction: "Deliver June content calendar",
    activationChecklist: { invoicePaid: true, billingCleared: true, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: true, onboardingRecordCreated: true, activationTasksCreated: true, kickoffNeeded: false },
    recentEvents: [
      { date: "2025-05-26", actor: "Sarah K.", action: "Email campaign Q2 wrap-up — 42% open rate"},
      { date: "2025-05-01", actor: "System", action: "Invoice #2011 processed — $3,300"},
    ],
    notes: "Solid retention. Email marketing exceeding benchmarks.",
    avatarColor: "#a855f7",
  },
  {
    id: "mc020",
    slug: "frontier-logistics",
    clientName: "Frontier Logistics Inc.",
    industry: "Transportation & Logistics",
    assignedAM: "Alex R.",
    email: "hr@frontierlogistics.com",
    currentStatus: "Active",
    workflowStatus: "In Progress",
    billingStatus: "Paid",
    activationStatus: "Active",
    activeServices: ["SEO / GBP", "LinkedIn Ads", "Content Writing", "Monthly Reporting"],
    monthlyValue: 4400,
    renewalDate: "2026-03-15",
    clientHealth: "Excellent",
    priority: "Medium",
    lastActivity: "2025-05-28",
    invoiceStatus: "Paid",
    nextRequiredAction: "Present Q2 results deck",
    activationChecklist: { invoicePaid: true, billingCleared: true, contractConfirmed: true, servicesConfirmed: true, clientContactVerified: true, amAssigned: true, onboardingRecordCreated: true, activationTasksCreated: true, kickoffNeeded: false },
    recentEvents: [
      { date: "2025-05-28", actor: "Alex R.", action: "LinkedIn Ads showing 3.2x ROAS — reporting in progress"},
      { date: "2025-05-01", actor: "System", action: "Invoice #1955 processed — $4,400"},
    ],
    notes: "B2B client. LinkedIn driving strong pipeline results.",
    avatarColor: "#0891b2",
  },
];

// 
// BADGE CONFIGS
// 

const CLIENT_STATUS_STYLES: Record<ClientStatus, { bg?: string; text: string; dot: string; border: string }> = {
  "Lead":                          { bg: "#f8fafc", text: "#64748b", dot: "#94a3b8", border: "#e2e8f0"},
  "Proposal Sent":                 { bg: "#eff6ff", text: "#1d4ed8", dot: "#3b82f6", border: "#bfdbfe"},
  "Invoice Sent":                  { bg: "#fefce8", text: "#a16207", dot: "#eab308", border: "#fef08a"},
  "Invoice Paid":                  { bg: "#f0fdf4", text: "#166534", dot: "#22c55e", border: "#bbf7d0"},
  "Ready for Onboarding":          { bg: "#f0fdf4", text: "#15803d", dot: "#16a34a", border: "#86efac"},
  "AM Assignment Needed":          { bg: "#fff7ed", text: "#c2410c", dot: "#f97316", border: "#fed7aa"},
  "Onboarding Pending":            { bg: "#eff6ff", text: "#1e40af", dot: "#6366f1", border: "#c7d2fe"},
  "Department Activation Pending": { bg: "#fdf4ff", text: "#7e22ce", dot: "#a855f7", border: "#e9d5ff"},
  "Active":                        { bg: "#ecfdf5", text: "#059669", dot: "#10b981", border: "#a7f3d0"},
  "Renewal Due":                   { bg: "#fffbeb", text: "#b45309", dot: "#f59e0b", border: "#fde68a"},
  "Cancellation Requested":        { bg: "#fef2f2", text: "#b91c1c", dot: "#ef4444", border: "#fecaca"},
  "Offboarding":                   { bg: "#f8fafc", text: "#475569", dot: "#64748b", border: "#cbd5e1"},
};

const WORKFLOW_STATUS_STYLES: Record<WorkflowStatus, { bg?: string; text: string; dot: string; border: string }> = {
  "Not Started":    { bg: "#f8fafc", text: "#64748b", dot: "#94a3b8", border: "#e2e8f0"},
  "Pending Review": { bg: "#fefce8", text: "#a16207", dot: "#eab308", border: "#fef08a"},
  "In Progress":    { bg: "#eff6ff", text: "#1d4ed8", dot: "#3b82f6", border: "#bfdbfe"},
  "Awaiting Client":{ bg: "#fff7ed", text: "#c2410c", dot: "#f97316", border: "#fed7aa"},
  "Escalated":      { bg: "#fef2f2", text: "#b91c1c", dot: "#ef4444", border: "#fecaca"},
  "Complete":       { bg: "#ecfdf5", text: "#059669", dot: "#10b981", border: "#a7f3d0"},
};

const BILLING_STATUS_STYLES: Record<BillingStatus, { bg?: string; text: string; dot: string; border: string }> = {
  "Pending": { bg: "#fefce8", text: "#a16207", dot: "#eab308", border: "#fef08a"},
  "Paid":    { bg: "#ecfdf5", text: "#059669", dot: "#10b981", border: "#a7f3d0"},
  "Overdue": { bg: "#fef2f2", text: "#b91c1c", dot: "#ef4444", border: "#fecaca"},
  "Cleared": { bg: "#f0fdf4", text: "#166534", dot: "#22c55e", border: "#bbf7d0"},
  "Closed":  { bg: "#f8fafc", text: "#475569", dot: "#64748b", border: "#cbd5e1"},
};

const ACTIVATION_STATUS_STYLES: Record<ActivationStatus, { bg?: string; text: string; dot: string; border: string }> = {
  "Not Started":                   { bg: "#f8fafc", text: "#64748b", dot: "#94a3b8", border: "#e2e8f0"},
  "Ready for Onboarding":          { bg: "#f0fdf4", text: "#15803d", dot: "#16a34a", border: "#86efac"},
  "AM Assignment Needed":          { bg: "#fff7ed", text: "#c2410c", dot: "#f97316", border: "#fed7aa"},
  "Onboarding Pending":            { bg: "#eff6ff", text: "#1e40af", dot: "#6366f1", border: "#c7d2fe"},
  "Department Activation Pending": { bg: "#fdf4ff", text: "#7e22ce", dot: "#a855f7", border: "#e9d5ff"},
  "Active":                        { bg: "#ecfdf5", text: "#059669", dot: "#10b981", border: "#a7f3d0"},
};

const HEALTH_STATUS_STYLES: Record<HealthStatus, { bg?: string; text: string; dot: string; border: string }> = {
  "Excellent": { bg: "#ecfdf5", text: "#059669", dot: "#10b981", border: "#a7f3d0"},
  "Good":      { bg: "#eff6ff", text: "#1d4ed8", dot: "#3b82f6", border: "#bfdbfe"},
  "At Risk":   { bg: "#fffbeb", text: "#b45309", dot: "#f59e0b", border: "#fde68a"},
  "Critical":  { bg: "#fef2f2", text: "#b91c1c", dot: "#ef4444", border: "#fecaca"},
};

const PRIORITY_STYLES: Record<Priority, { bg?: string; text: string; border: string }> = {
  "High":   { bg: "#fef2f2", text: "#b91c1c", border: "#fecaca"},
  "Medium": { bg: "#fffbeb", text: "#b45309", border: "#fde68a"},
  "Low":    { bg: "#f8fafc", text: "#64748b", border: "#e2e8f0"},
};

// 
// BADGE COMPONENT
// 

function StatusPill({
  label,
  styles,
  size = "sm",
}: {
  label: string;
  styles: { bg?: string; text: string; dot?: string; border: string };
  size?: "xs"| "sm";
}) {
  const padding = size === "xs"? "px-2 py-0.5 text-[10px]": "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border whitespace-nowrap ${padding}`}
      style={{ background: styles.bg, color: styles.text, borderColor: styles.border }}
    >
      {styles.dot && (
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"style={{ background: styles.dot }} />
      )}
      {label}
    </span>
  );
}

// 
// KPI CARDS
// 

function KpiCard({
  label,
  value,
  sub,
  color,
  bg,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  bg?: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-1">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-tight">{label}</p>
      <p className="text-2xl font-bold"style={{ color }}>
        {value}
      </p>
      {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
      <div className="mt-1 h-1 rounded-full w-8"style={{ background: bg }} />
    </div>
  );
}

// 
// CHECKLIST ROW
// 

function CheckRow({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span
        className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
          done ? "bg-emerald-100 text-emerald-600": "bg-slate-100 text-slate-400"}`}
      >
        {done ? "": ""}
      </span>
      <span className={done ? "text-slate-700 dark:text-slate-300": "text-slate-400"}>{label}</span>
    </div>
  );
}

// 
// CLIENT PROFILE DRAWER
// 

function ClientDrawer({
  client,
  onClose,
}: {
  client: MasterClient;
  onClose: () => void;
}) {
  const cl = client.activationChecklist;
  const checklistTotal = Object.values(cl).length;
  const checklistDone = Object.values(cl).filter(Boolean).length;
  const checklistPct = Math.round((checklistDone / checklistTotal) * 100);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"onClick={onClose}
      />
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 z-50 overflow-y-auto shadow-2xl flex flex-col">
        {/* Drawer header */}
        <div className="sticky top-0 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-start justify-between gap-4 z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0"style={{ background: client.avatarColor }}
            >
              {client.clientName.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">{client.clientName}</p>
              <p className="text-xs text-slate-500">{client.industry}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors text-xl leading-none mt-0.5">
            
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick actions */}
          <div className="flex flex-wrap gap-2">
            <Link href={`/clients/${client.slug}`} className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium">
              Full Profile →
            </Link>
            <Link href="/admin/workflows" className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium">
              Workflow Queue
            </Link>
            <Link href="/billing/invoices" className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium">
              Billing
            </Link>
            <Link href="/tasks" className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium">
              Tasks
            </Link>
          </div>

          {/* Status grid */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Client Overview</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Status</p>
                <StatusPill label={client.currentStatus} styles={CLIENT_STATUS_STYLES[client.currentStatus]} />
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Health</p>
                <StatusPill label={client.clientHealth} styles={HEALTH_STATUS_STYLES[client.clientHealth]} />
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Assigned AM</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{client.assignedAM}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Monthly Value</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {client.monthlyValue > 0 ? `$${client.monthlyValue.toLocaleString()}` : "—"}
                </p>
              </div>
            </div>
          </section>

          {/* Workflow */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Workflow Status</h3>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 flex items-center justify-between">
              <StatusPill label={client.workflowStatus} styles={WORKFLOW_STATUS_STYLES[client.workflowStatus]} />
              <Link href="/admin/workflows" className="text-xs text-blue-600 hover:underline font-medium">
                Open Queue →
              </Link>
            </div>
          </section>

          {/* Billing summary */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Billing Summary</h3>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Billing Status</span>
                <StatusPill label={client.billingStatus} styles={BILLING_STATUS_STYLES[client.billingStatus]} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Invoice Status</span>
                <span className="text-sm font-medium text-slate-800 dark:text-white">{client.invoiceStatus}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Renewal Date</span>
                <span className="text-sm font-medium text-slate-800 dark:text-white">{client.renewalDate}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Link href="/billing/invoices" className="text-xs text-blue-600 hover:underline font-medium">View Invoices →</Link>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <Link href="/renewals" className="text-xs text-blue-600 hover:underline font-medium">Renewal →</Link>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <Link href="/billing/cancellations" className="text-xs text-blue-600 hover:underline font-medium">Cancellations →</Link>
            </div>
          </section>

          {/* Affiliate Attribution */}
          {(client.referralSource && client.referralSource !== "Direct") && (
            <section>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Affiliate Attribution</h3>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Referral Source</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"style={{ background: "#ECFDF5", color: "#059669"}}>{client.referralSource}</span>
                </div>
                {client.affiliateName && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Affiliate</span>
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{client.affiliateName}</span>
                  </div>
                )}
                {client.referralRevenue && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Referral Revenue</span>
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{client.referralRevenue}</span>
                  </div>
                )}
                {client.commissionStatus && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Commission Status</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"style={{
                      background: client.commissionStatus === "Paid"? "#ECFDF5": client.commissionStatus === "Pending"? "#FFFBEB": "#EFF6FF",
                      color:      client.commissionStatus === "Paid"? "#059669": client.commissionStatus === "Pending"? "#D97706": "#2563EB",
                    }}>
                      {client.commissionStatus}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-2">
                <Link href="/sales/affiliates" className="text-xs text-emerald-600 hover:underline font-medium">Open Affiliate Record →</Link>
              </div>
            </section>
          )}

          {/* Activation readiness */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Activation Readiness</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"style={{ width: `${checklistPct}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                {checklistDone}/{checklistTotal}
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-2">
              <CheckRow label="Invoice paid"done={cl.invoicePaid} />
              <CheckRow label="Billing cleared"done={cl.billingCleared} />
              <CheckRow label="Contract confirmed"done={cl.contractConfirmed} />
              <CheckRow label="Services confirmed"done={cl.servicesConfirmed} />
              <CheckRow label="Client contact verified"done={cl.clientContactVerified} />
              <CheckRow label="AM assigned"done={cl.amAssigned} />
              <CheckRow label="Onboarding record created"done={cl.onboardingRecordCreated} />
              <CheckRow label="Activation tasks created"done={cl.activationTasksCreated} />
              <CheckRow label="Kickoff needed"done={!cl.kickoffNeeded} />
            </div>
            <div className="mt-2 p-3 rounded-lg var(--rtm-bg)/20 border border-amber-200 dark:border-amber-800">
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-0.5">Next Required Action</p>
              <p className="text-sm text-amber-700 dark:text-amber-400">{client.nextRequiredAction}</p>
            </div>
          </section>

          {/* Active services */}
          {client.activeServices.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Active Departments / Services</h3>
              <div className="flex flex-wrap gap-2">
                {client.activeServices.map((s) => (
                  <span
                    key={s}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Cancellation / Offboarding */}
          {(client.currentStatus === "Cancellation Requested"|| client.currentStatus === "Offboarding") && (
            <section>
              <h3 className="text-xs font-semibold text-red-500 uppercase tracking-widest mb-3">Cancellation / Offboarding</h3>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center justify-between">
                <StatusPill label={client.currentStatus} styles={CLIENT_STATUS_STYLES[client.currentStatus]} />
                <div className="flex gap-2">
                  <Link href="/billing/cancellations" className="text-xs text-red-600 hover:underline font-medium">
                    Cancellations →
                  </Link>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <Link href="/cancellations/offboarding" className="text-xs text-red-600 hover:underline font-medium">
                    Offboarding →
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* Client Tasks Summary */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Client Tasks Summary</h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { label: "Open Tasks",   value: 5, color: "#1D4ED8", bg: "#EFF6FF"},
                { label: "Overdue",      value: 2, color: "#DC2626", bg: "#FEF2F2"},
                { label: "Upcoming",     value: 3, color: "#D97706", bg: "#FFFBEB"},
                { label: "Completed",    value: 12, color: "#059669", bg: "#ECFDF5"},
              ].map(({ label, value, color, bg }) => (
                <div key={label} className="rounded-lg p-2.5 text-center"style={{ background: bg }}>
                  <div className="text-xl font-black"style={{ color }}>{value}</div>
                  <div className="text-[10px] font-semibold mt-0.5"style={{ color }}>{label}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Link href="/tasks" className="flex-1 text-center text-xs px-3 py-2 rounded-lg font-bold text-white transition-opacity hover:opacity-90" style={{ background: "#1B4FD8" }}>
                Open Task Queue
              </Link>
              <Link href="/tasks" className="flex-1 text-center text-xs px-3 py-2 rounded-lg font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors">
                Create Task
              </Link>
            </div>
          </section>

          {/* Recent notes */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Recent Notes</h3>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
              <p className="text-sm text-slate-700 dark:text-slate-300">{client.notes}</p>
            </div>
          </section>

          {/* Timeline */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Recent Timeline</h3>
            <div className="space-y-3">
              {client.recentEvents.map((ev, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 mt-1 flex-shrink-0"/>
                    {i < client.recentEvents.length - 1 && (
                      <div className="w-px flex-1 bg-slate-200 dark:bg-slate-800 mt-1"/>
                    )}
                  </div>
                  <div className="pb-3">
                    <p className="text-sm text-slate-700 dark:text-slate-300">{ev.action}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {ev.date} · {ev.actor}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

// 
// ROW ACTION DROPDOWN
// 

function RowActions({
  client,
  onViewClient,
}: {
  client: MasterClient;
  onViewClient: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"title="Actions">
        <svg className="w-4 h-4"fill="currentColor"viewBox="0 0 20 20">
          <circle cx="10"cy="4"r="1.5"/>
          <circle cx="10"cy="10"r="1.5"/>
          <circle cx="10"cy="16"r="1.5"/>
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10"onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
            <button
              onClick={() => { onViewClient(); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
              <span></span> View Client
            </button>
            <Link href="/admin/workflows" className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 block" onClick={() => setOpen(false)}>
              <span></span> Open Workflow
            </Link>
            <Link href="/billing/invoices" className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 block" onClick={() => setOpen(false)}>
              <span></span> View Billing
            </Link>
            <Link href="/billing/activation" className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 block" onClick={() => setOpen(false)}>
              <span></span> View Activation
            </Link>
            <Link href="/tasks" className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 block" onClick={() => setOpen(false)}>
              <span></span> View Tasks
            </Link>
            <Link href="/renewals" className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 block" onClick={() => setOpen(false)}>
              <span></span> View Renewal
            </Link>
            <Link href="/billing/cancellations" className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 block" onClick={() => setOpen(false)}>
              <span></span> View Cancellation
            </Link>
            <Link href="/cancellations/offboarding" className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 block" onClick={() => setOpen(false)}>
              <span></span> Offboarding
            </Link>
            <div className="border-t border-slate-100 dark:border-slate-800"/>
            <button
              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"onClick={() => setOpen(false)}
            >
              <span></span> Add Note
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// 
// MAIN PAGE
// 

export default function ClientPortfolioPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterWorkflow, setFilterWorkflow] = useState<string>("all");
  const [filterBilling, setFilterBilling] = useState<string>("all");
  const [filterActivation, setFilterActivation] = useState<string>("all");
  const [filterAM, setFilterAM] = useState<string>("all");
  const [filterHealth, setFilterHealth] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [activeDrawer, setActiveDrawer] = useState<MasterClient | null>(null);

  //  Computed KPIs 
  const totalClients = PORTFOLIO_CLIENTS.length;
  const activeClients = PORTFOLIO_CLIENTS.filter((c) => c.currentStatus === "Active").length;
  const readyForOnboarding = PORTFOLIO_CLIENTS.filter((c) => c.currentStatus === "Ready for Onboarding").length;
  const inDeptActivation = PORTFOLIO_CLIENTS.filter((c) => c.currentStatus === "Department Activation Pending").length;
  const renewalDue = PORTFOLIO_CLIENTS.filter((c) => c.currentStatus === "Renewal Due").length;
  const cancellationRequested = PORTFOLIO_CLIENTS.filter((c) => c.currentStatus === "Cancellation Requested").length;
  const offboarding = PORTFOLIO_CLIENTS.filter((c) => c.currentStatus === "Offboarding").length;
  const totalMRR = PORTFOLIO_CLIENTS.reduce((s, c) => s + c.monthlyValue, 0);

  //  Unique filter options 
  const allAMs = Array.from(new Set(PORTFOLIO_CLIENTS.map((c) => c.assignedAM))).sort();

  //  Filtered clients 
  const filtered = useMemo(() => {
    return PORTFOLIO_CLIENTS.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        c.clientName.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.assignedAM.toLowerCase().includes(q) ||
        c.activeServices.some((s) => s.toLowerCase().includes(q));

      const matchStatus = filterStatus === "all"|| c.currentStatus === filterStatus;
      const matchWorkflow = filterWorkflow === "all"|| c.workflowStatus === filterWorkflow;
      const matchBilling = filterBilling === "all"|| c.billingStatus === filterBilling;
      const matchActivation = filterActivation === "all"|| c.activationStatus === filterActivation;
      const matchAM = filterAM === "all"|| c.assignedAM === filterAM;
      const matchHealth = filterHealth === "all"|| c.clientHealth === filterHealth;
      const matchPriority = filterPriority === "all"|| c.priority === filterPriority;

      return matchSearch && matchStatus && matchWorkflow && matchBilling && matchActivation && matchAM && matchHealth && matchPriority;
    });
  }, [searchQuery, filterStatus, filterWorkflow, filterBilling, filterActivation, filterAM, filterHealth, filterPriority]);

  const selectClass =
    "text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer";

  return (
    <div className="space-y-6">
      {/*  Task Management Engine Banner  */}
      <TaskAccessCard
        context="Client Portfolio"variant="banner"counters={{ open: 47, overdue: 8, dueToday: 12, completed: 67 }}
        createLabel="Create Client Task"/>

      {/*  Page header  */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[var(--rtm-blue)] uppercase tracking-widest mb-1">
            Master Records
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Client Portfolio
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Master client records connected to workflow, billing, onboarding, departments, renewals,
            cancellations, and offboarding.
          </p>
        </div>

        {/* Top action bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--rtm-blue)] hover:bg-[var(--rtm-blue-dark)] text-white text-xs font-semibold transition-colors shadow-sm">
            <span>+</span> New Client
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors">
            ↑ Import
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors">
            ↓ Export
          </button>
          <Link
            href="/admin/workflows"className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors">
             Workflow Queue
          </Link>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors">
             Create Note
          </button>
        </div>
      </div>

      {/*  KPI cards  */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
        <KpiCard label="Total Clients"value={totalClients}bg="#bfdbfe"/>
        <KpiCard label="Active Clients"value={activeClients}bg="#a7f3d0"/>
        <KpiCard label="Ready for Onboarding"value={readyForOnboarding}bg="#86efac"/>
        <KpiCard label="Dept Activation"value={inDeptActivation}bg="#e9d5ff"/>
        <KpiCard label="Renewal Due"value={renewalDue}bg="#fde68a"/>
        <KpiCard label="Cancellation Requested"value={cancellationRequested}bg="#fecaca"/>
        <KpiCard label="Offboarding"value={offboarding}bg="#cbd5e1"/>
        <KpiCard
          label="Monthly Recurring Revenue"value={`$${(totalMRR / 1000).toFixed(0)}k`}
          sub={`$${totalMRR.toLocaleString()}/mo`}bg="#bfdbfe"/>
      </div>

      {/*  Search + Filters  */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"fill="none"stroke="currentColor"viewBox="0 0 24 24">
            <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"placeholder="Search by client name, email, AM, or service…"value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap gap-2">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={selectClass}>
            <option value="all">All Statuses</option>
            {(["Lead","Proposal Sent","Invoice Sent","Invoice Paid","Ready for Onboarding","AM Assignment Needed","Onboarding Pending","Department Activation Pending","Active","Renewal Due","Cancellation Requested","Offboarding"] as ClientStatus[]).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select value={filterWorkflow} onChange={(e) => setFilterWorkflow(e.target.value)} className={selectClass}>
            <option value="all">All Workflow</option>
            {(["Not Started","Pending Review","In Progress","Awaiting Client","Escalated","Complete"] as WorkflowStatus[]).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select value={filterBilling} onChange={(e) => setFilterBilling(e.target.value)} className={selectClass}>
            <option value="all">All Billing</option>
            {(["Pending","Paid","Overdue","Cleared","Closed"] as BillingStatus[]).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select value={filterActivation} onChange={(e) => setFilterActivation(e.target.value)} className={selectClass}>
            <option value="all">All Activation</option>
            {(["Not Started","Ready for Onboarding","AM Assignment Needed","Onboarding Pending","Department Activation Pending","Active"] as ActivationStatus[]).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select value={filterAM} onChange={(e) => setFilterAM(e.target.value)} className={selectClass}>
            <option value="all">All AMs</option>
            {allAMs.map((am) => <option key={am} value={am}>{am}</option>)}
          </select>

          <select value={filterHealth} onChange={(e) => setFilterHealth(e.target.value)} className={selectClass}>
            <option value="all">All Health</option>
            {(["Excellent","Good","At Risk","Critical"] as HealthStatus[]).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className={selectClass}>
            <option value="all">All Priority</option>
            {(["High","Medium","Low"] as Priority[]).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {(searchQuery || filterStatus !== "all"|| filterWorkflow !== "all"|| filterBilling !== "all"|| filterActivation !== "all"|| filterAM !== "all"|| filterHealth !== "all"|| filterPriority !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("all");
                setFilterWorkflow("all");
                setFilterBilling("all");
                setFilterActivation("all");
                setFilterAM("all");
                setFilterHealth("all");
                setFilterPriority("all");
              }}
              className="text-xs px-3 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors">
               Clear Filters
            </button>
          )}
        </div>

        <div className="text-xs text-slate-400">
          Showing {filtered.length} of {PORTFOLIO_CLIENTS.length} clients
        </div>
      </div>

      {/*  Client table  */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1400px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                {[
                  "Client Name",
                  "Industry",
                  "Assigned AM",
                  "Referral Source",
                  "Affiliate",
                  "Current Status",
                  "Workflow Status",
                  "Billing Status",
                  "Activation Status",
                  "Active Services",
                  "Monthly Value",
                  "Renewal Date",
                  "Client Health",
                  "Priority",
                  "Last Activity",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={16} className="px-6 py-16 text-center text-slate-400 text-sm">
                    No clients match your current filters.
                  </td>
                </tr>
              )}
              {filtered.map((client, idx) => (
                <tr
                  key={client.id}
                  className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors ${
                    idx % 2 === 0 ? "": "bg-slate-50/30 dark:bg-slate-950/30"}`}
                >
                  {/* Client Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"style={{ background: client.avatarColor }}
                      >
                        {client.clientName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setActiveDrawer(client)}
                            className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left leading-tight">
                            {client.clientName}
                          </button>
                          {/* Notification alert badge */}
                          {(() => {
                            const alertCount = NOTIFICATIONS.filter(
                              (n) => n.clientSlug === client.slug &&
                                (n.status === "Unread"|| n.status === "Escalated")
                            ).length;
                            const hasCritical = NOTIFICATIONS.some(
                              (n) => n.clientSlug === client.slug &&
                                (n.status === "Unread"|| n.status === "Escalated") &&
                                (n.priority === "Critical"|| n.priority === "Urgent")
                            );
                            if (alertCount === 0) return null;
                            return (
                              <span
                                className="text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1"style={{
                                  background: hasCritical ? "#DC2626": "#F97316",
                                  color: "#ffffff",
                                }}
                                title={`${alertCount} active alert${alertCount !== 1 ? "s": ""}`}
                              >
                                {alertCount}
                              </span>
                            );
                          })()}
                        </div>
                        <p className="text-[10px] text-slate-400">{client.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Industry */}
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">{client.industry}</span>
                  </td>

                  {/* AM */}
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">{client.assignedAM}</span>
                  </td>

                  {/* Referral Source */}
                  <td className="px-4 py-3">
                    {client.referralSource ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"style={{
                        background: client.referralSource === "Affiliate"? "#ECFDF5": "#EFF6FF",
                        color:      client.referralSource === "Affiliate"? "#059669": "#2563EB",
                      }}>
                        {client.referralSource}
                      </span>
                    ) : <span className="text-xs text-slate-400">—</span>}
                  </td>

                  {/* Affiliate */}
                  <td className="px-4 py-3">
                    {client.affiliateName ? (
                      <a href="/sales/affiliates" className="text-xs font-semibold whitespace-nowrap" style={{ color: "#059669" }}>{client.affiliateName}</a>
                    ) : <span className="text-xs text-slate-400">—</span>}
                  </td>

                  {/* Current Status */}
                  <td className="px-4 py-3">
                    <StatusPill label={client.currentStatus} styles={CLIENT_STATUS_STYLES[client.currentStatus]} size="xs"/>
                  </td>

                  {/* Workflow Status */}
                  <td className="px-4 py-3">
                    <StatusPill label={client.workflowStatus} styles={WORKFLOW_STATUS_STYLES[client.workflowStatus]} size="xs"/>
                  </td>

                  {/* Billing Status */}
                  <td className="px-4 py-3">
                    <StatusPill label={client.billingStatus} styles={BILLING_STATUS_STYLES[client.billingStatus]} size="xs"/>
                  </td>

                  {/* Activation Status */}
                  <td className="px-4 py-3">
                    <StatusPill label={client.activationStatus} styles={ACTIVATION_STATUS_STYLES[client.activationStatus]} size="xs"/>
                  </td>

                  {/* Active Services */}
                  <td className="px-4 py-3">
                    {client.activeServices.length === 0 ? (
                      <span className="text-xs text-slate-400">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {client.activeServices.slice(0, 2).map((s) => (
                          <span
                            key={s}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                            {s}
                          </span>
                        ))}
                        {client.activeServices.length > 2 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 font-medium">
                            +{client.activeServices.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Monthly Value */}
                  <td className="px-4 py-3">
                    <span className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {client.monthlyValue > 0 ? `$${client.monthlyValue.toLocaleString()}` : "—"}
                    </span>
                  </td>

                  {/* Renewal Date */}
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">{client.renewalDate}</span>
                  </td>

                  {/* Client Health */}
                  <td className="px-4 py-3">
                    <StatusPill label={client.clientHealth} styles={HEALTH_STATUS_STYLES[client.clientHealth]} size="xs"/>
                  </td>

                  {/* Priority */}
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap"style={{
                        background: PRIORITY_STYLES[client.priority].bg,
                        color: PRIORITY_STYLES[client.priority].text,
                        borderColor: PRIORITY_STYLES[client.priority].border,
                      }}
                    >
                      {client.priority}
                    </span>
                  </td>

                  {/* Last Activity */}
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-500 whitespace-nowrap">{client.lastActivity}</span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <RowActions client={client} onViewClient={() => setActiveDrawer(client)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {filtered.length} client{filtered.length !== 1 ? "s": ""} shown
          </span>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>
              Total MRR:{""}
              <span className="font-bold text-slate-700 dark:text-slate-300">
                ${filtered.reduce((s, c) => s + c.monthlyValue, 0).toLocaleString()}
              </span>
            </span>
            <span>
              Active:{""}
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {filtered.filter((c) => c.currentStatus === "Active").length}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/*  Client profile drawer  */}
      {activeDrawer && (
        <ClientDrawer client={activeDrawer} onClose={() => setActiveDrawer(null)} />
      )}
    </div>
  );
}
