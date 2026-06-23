"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge, DataTable, PageHeader } from "@/components/ui";
import type { Column, StatusVariant } from "@/components/ui";

// 
// Types
// 

type HandoffStage =
  | "Proposal Approved"| "Billing Requested"| "Invoice Draft Needed"| "Invoice Created"| "Invoice Sent"| "Invoice Paid"| "Ready for Activation"| "Blocked"| "Closed";

type InvoiceStatus =
  | "Not Created"| "Draft"| "Created"| "Sent"| "Paid"| "Overdue"| "Void";

type ActivationStatus =
  | "Not Started"| "Pending Invoice"| "Pending Payment"| "Ready"| "In Progress"| "Activated";

type CommissionStatus =
  | "Not Eligible"| "Pending Invoice Payment"| "Eligible"| "Approved"| "Paid";

type Priority = "Critical"| "High"| "Medium"| "Low";

type ServiceType = "SEO"| "GBP"| "PPC"| "Meta Ads"| "LSA"| "Reporting"| "Web"| "Creative";

interface ServiceSold {
  service: ServiceType;
  monthlyValue: string;
  setupFee: string;
  startDate: string;
  departmentNeeded: string;
  ownerDepartment: string;
}

interface AffiliateAttribution {
  affiliateName: string;
  referralSource: string;
  referralCode: string;
  commissionModel: string;
  potentialCommission: string;
  commissionStatus: CommissionStatus;
}

interface BillingRequirements {
  billingContact: string;
  billingEmail: string;
  billingTerms: string;
  invoiceType: string;
  billingStartDate: string;
  paymentMethodStatus: string;
  taxSetupFeeNotes: string;
  finalApprovalStatus: string;
}

interface ProposalSummary {
  proposalName: string;
  proposalStatus: string;
  approvedDate: string;
  approvedBy: string;
  dealValue: string;
  monthlyValue: string;
  contractTerm: string;
  servicesIncluded: string[];
  specialBillingNotes: string;
}

interface ActivationChecklist {
  proposalApproved: boolean;
  billingRequestCreated: boolean;
  invoiceCreated: boolean;
  invoiceSent: boolean;
  invoicePaid: boolean;
  clientRecordCreated: boolean;
  servicesConfirmed: boolean;
  activationTasksReady: boolean;
}

interface Handoff extends Record<string, unknown> {
  id: string;
  client: string;
  proposal: string;
  salesRep: string;
  billingOwner: string;
  handoffStage: HandoffStage;
  dealValue: string;
  monthlyValue: string;
  servicesSold: ServiceType[];
  invoiceStatus: InvoiceStatus;
  activationStatus: ActivationStatus;
  affiliateSource: string | null;
  commissionEligible: boolean;
  priority: Priority;
  nextRequiredAction: string;
  proposalSummary: ProposalSummary;
  billingRequirements: BillingRequirements;
  servicesSoldDetail: ServiceSold[];
  affiliateAttribution: AffiliateAttribution | null;
  activationChecklist: ActivationChecklist;
  notes: string[];
  tasks: string[];
  notifications: string[];
  workflowStep: string;
}

// 
// Mock Data — 20+ records
// 

const handoffs: Handoff[] = [
  {
    id: "HO-001",
    client: "Summit Landscaping",
    proposal: "Summit Landscaping – SEO Growth Package",
    salesRep: "Jake Monroe",
    billingOwner: "Rachel Kim",
    handoffStage: "Proposal Approved",
    dealValue: "$28,800",
    monthlyValue: "$2,400",
    servicesSold: ["SEO", "GBP", "Reporting"],
    invoiceStatus: "Not Created",
    activationStatus: "Not Started",
    affiliateSource: "Brandon Ellis",
    commissionEligible: true,
    priority: "High",
    nextRequiredAction: "Send to Billing — create invoice request",
    proposalSummary: {
      proposalName: "Summit Landscaping – SEO Growth Package",
      proposalStatus: "Approved",
      approvedDate: "2025-07-10",
      approvedBy: "David Chen",
      dealValue: "$28,800",
      monthlyValue: "$2,400",
      contractTerm: "12 months",
      servicesIncluded: ["SEO", "GBP", "Reporting"],
      specialBillingNotes: "Net 15 terms agreed. Setup fee waived.",
    },
    billingRequirements: {
      billingContact: "Mark Williams",
      billingEmail: "mark@summitlandscaping.com",
      billingTerms: "Net 15",
      invoiceType: "Recurring Monthly",
      billingStartDate: "2025-08-01",
      paymentMethodStatus: "ACH on file",
      taxSetupFeeNotes: "Setup fee waived — see proposal notes",
      finalApprovalStatus: "Approved",
    },
    servicesSoldDetail: [
      { service: "SEO", monthlyValue: "$1,800", setupFee: "$0", startDate: "2025-08-01", departmentNeeded: "SEO Team", ownerDepartment: "SEO"},
      { service: "GBP", monthlyValue: "$400", setupFee: "$0", startDate: "2025-08-01", departmentNeeded: "GBP Team", ownerDepartment: "Local SEO"},
      { service: "Reporting", monthlyValue: "$200", setupFee: "$0", startDate: "2025-08-01", departmentNeeded: "Reporting Team", ownerDepartment: "Analytics"},
    ],
    affiliateAttribution: {
      affiliateName: "Brandon Ellis",
      referralSource: "Affiliate Partner",
      referralCode: "BRELLIS10",
      commissionModel: "10% Monthly Recurring",
      potentialCommission: "$240/mo",
      commissionStatus: "Pending Invoice Payment",
    },
    activationChecklist: {
      proposalApproved: true,
      billingRequestCreated: false,
      invoiceCreated: false,
      invoiceSent: false,
      invoicePaid: false,
      clientRecordCreated: true,
      servicesConfirmed: true,
      activationTasksReady: false,
    },
    notes: ["Proposal approved by David Chen on 7/10. Affiliate attribution confirmed — Brandon Ellis."],
    tasks: ["Create Invoice", "Send to Billing", "Confirm Affiliate Attribution"],
    notifications: ["Proposal Approved", "Billing Request Needed"],
    workflowStep: "Proposal Approved",
  },
  {
    id: "HO-002",
    client: "Metro Dental Group",
    proposal: "Metro Dental – Local Domination Bundle",
    salesRep: "Sophia Lane",
    billingOwner: "Rachel Kim",
    handoffStage: "Billing Requested",
    dealValue: "$54,000",
    monthlyValue: "$4,500",
    servicesSold: ["SEO", "PPC", "GBP", "Reporting"],
    invoiceStatus: "Draft",
    activationStatus: "Pending Invoice",
    affiliateSource: "Maria Santos",
    commissionEligible: true,
    priority: "Critical",
    nextRequiredAction: "Finalize invoice draft — confirm billing details with client",
    proposalSummary: {
      proposalName: "Metro Dental – Local Domination Bundle",
      proposalStatus: "Approved",
      approvedDate: "2025-07-08",
      approvedBy: "Sophia Lane",
      dealValue: "$54,000",
      monthlyValue: "$4,500",
      contractTerm: "12 months",
      servicesIncluded: ["SEO", "PPC", "GBP", "Reporting"],
      specialBillingNotes: "First month pro-rated. PPC ad spend billed separately.",
    },
    billingRequirements: {
      billingContact: "Dr. Angela Park",
      billingEmail: "billing@metrodental.com",
      billingTerms: "Net 30",
      invoiceType: "Recurring Monthly + Ad Spend",
      billingStartDate: "2025-07-15",
      paymentMethodStatus: "Credit Card on file",
      taxSetupFeeNotes: "Pro-rated first month invoice required",
      finalApprovalStatus: "Approved",
    },
    servicesSoldDetail: [
      { service: "SEO", monthlyValue: "$2,000", setupFee: "$500", startDate: "2025-07-15", departmentNeeded: "SEO Team", ownerDepartment: "SEO"},
      { service: "PPC", monthlyValue: "$1,500", setupFee: "$750", startDate: "2025-07-15", departmentNeeded: "PPC Team", ownerDepartment: "Paid Advertising"},
      { service: "GBP", monthlyValue: "$700", setupFee: "$0", startDate: "2025-07-15", departmentNeeded: "GBP Team", ownerDepartment: "Local SEO"},
      { service: "Reporting", monthlyValue: "$300", setupFee: "$0", startDate: "2025-07-15", departmentNeeded: "Reporting Team", ownerDepartment: "Analytics"},
    ],
    affiliateAttribution: {
      affiliateName: "Maria Santos",
      referralSource: "Client Referral",
      referralCode: "MSANTOS10",
      commissionModel: "10% Monthly Recurring",
      potentialCommission: "$450/mo",
      commissionStatus: "Pending Invoice Payment",
    },
    activationChecklist: {
      proposalApproved: true,
      billingRequestCreated: true,
      invoiceCreated: false,
      invoiceSent: false,
      invoicePaid: false,
      clientRecordCreated: true,
      servicesConfirmed: true,
      activationTasksReady: false,
    },
    notes: ["Billing requested 7/9. Invoice draft in progress. Maria Santos affiliate — 10% commission pending."],
    tasks: ["Finalize Invoice Draft", "Confirm Pro-Rated Amount", "Send Invoice"],
    notifications: ["Billing Request Created", "Invoice Draft Needed"],
    workflowStep: "Billing Requested",
  },
  {
    id: "HO-003",
    client: "Apex Dental Partners",
    proposal: "Apex Dental – Full Service Growth",
    salesRep: "Ryan Torres",
    billingOwner: "Sarah Wells",
    handoffStage: "Invoice Draft Needed",
    dealValue: "$96,000",
    monthlyValue: "$8,000",
    servicesSold: ["SEO", "PPC", "Meta Ads", "GBP", "Web", "Reporting"],
    invoiceStatus: "Not Created",
    activationStatus: "Pending Invoice",
    affiliateSource: "Tyler Nguyen",
    commissionEligible: true,
    priority: "Critical",
    nextRequiredAction: "Create invoice draft immediately — billing start date is 7/20",
    proposalSummary: {
      proposalName: "Apex Dental – Full Service Growth",
      proposalStatus: "Approved",
      approvedDate: "2025-07-05",
      approvedBy: "Ryan Torres",
      dealValue: "$96,000",
      monthlyValue: "$8,000",
      contractTerm: "12 months",
      servicesIncluded: ["SEO", "PPC", "Meta Ads", "GBP", "Web", "Reporting"],
      specialBillingNotes: "Web build is one-time $5,000. Monthly recurring starts after launch.",
    },
    billingRequirements: {
      billingContact: "James Apex",
      billingEmail: "james@apexdental.com",
      billingTerms: "Net 15",
      invoiceType: "Monthly + One-Time Web Fee",
      billingStartDate: "2025-07-20",
      paymentMethodStatus: "ACH pending setup",
      taxSetupFeeNotes: "Web one-time: $5,000. Monthly recurring: $8,000.",
      finalApprovalStatus: "Approved",
    },
    servicesSoldDetail: [
      { service: "SEO", monthlyValue: "$2,500", setupFee: "$500", startDate: "2025-07-20", departmentNeeded: "SEO Team", ownerDepartment: "SEO"},
      { service: "PPC", monthlyValue: "$2,000", setupFee: "$750", startDate: "2025-07-20", departmentNeeded: "PPC Team", ownerDepartment: "Paid Advertising"},
      { service: "Meta Ads", monthlyValue: "$1,500", setupFee: "$500", startDate: "2025-07-20", departmentNeeded: "Meta Team", ownerDepartment: "Paid Advertising"},
      { service: "GBP", monthlyValue: "$500", setupFee: "$0", startDate: "2025-07-20", departmentNeeded: "GBP Team", ownerDepartment: "Local SEO"},
      { service: "Web", monthlyValue: "$1,000", setupFee: "$5,000", startDate: "2025-07-20", departmentNeeded: "Web Team", ownerDepartment: "Creative"},
      { service: "Reporting", monthlyValue: "$500", setupFee: "$0", startDate: "2025-07-20", departmentNeeded: "Reporting Team", ownerDepartment: "Analytics"},
    ],
    affiliateAttribution: {
      affiliateName: "Tyler Nguyen",
      referralSource: "Strategic Partner",
      referralCode: "TNGUYEN08",
      commissionModel: "8% Monthly Recurring",
      potentialCommission: "$640/mo",
      commissionStatus: "Pending Invoice Payment",
    },
    activationChecklist: {
      proposalApproved: true,
      billingRequestCreated: true,
      invoiceCreated: false,
      invoiceSent: false,
      invoicePaid: false,
      clientRecordCreated: true,
      servicesConfirmed: true,
      activationTasksReady: false,
    },
    notes: ["URGENT: Billing start date 7/20. ACH not yet on file — need to chase billing contact."],
    tasks: ["Create Invoice Draft", "Chase ACH Setup", "Confirm Web One-Time Fee"],
    notifications: ["Invoice Draft Needed", "ACH Setup Required"],
    workflowStep: "Invoice Draft Needed",
  },
  {
    id: "HO-004",
    client: "Coastal Wellness Spa",
    proposal: "Coastal Wellness – Growth Bundle",
    salesRep: "Sophia Lane",
    billingOwner: "Rachel Kim",
    handoffStage: "Invoice Created",
    dealValue: "$45,600",
    monthlyValue: "$3,800",
    servicesSold: ["SEO", "GBP", "Meta Ads", "Reporting"],
    invoiceStatus: "Created",
    activationStatus: "Pending Invoice",
    affiliateSource: "Lisa Park",
    commissionEligible: true,
    priority: "High",
    nextRequiredAction: "Send invoice to client",
    proposalSummary: {
      proposalName: "Coastal Wellness – Growth Bundle",
      proposalStatus: "Approved",
      approvedDate: "2025-07-07",
      approvedBy: "Sophia Lane",
      dealValue: "$45,600",
      monthlyValue: "$3,800",
      contractTerm: "12 months",
      servicesIncluded: ["SEO", "GBP", "Meta Ads", "Reporting"],
      specialBillingNotes: "Standard terms. No special billing notes.",
    },
    billingRequirements: {
      billingContact: "Claire Nguyen",
      billingEmail: "billing@coastalwellness.com",
      billingTerms: "Net 30",
      invoiceType: "Recurring Monthly",
      billingStartDate: "2025-08-01",
      paymentMethodStatus: "Credit Card on file",
      taxSetupFeeNotes: "No setup fees",
      finalApprovalStatus: "Approved",
    },
    servicesSoldDetail: [
      { service: "SEO", monthlyValue: "$1,800", setupFee: "$0", startDate: "2025-08-01", departmentNeeded: "SEO Team", ownerDepartment: "SEO"},
      { service: "GBP", monthlyValue: "$600", setupFee: "$0", startDate: "2025-08-01", departmentNeeded: "GBP Team", ownerDepartment: "Local SEO"},
      { service: "Meta Ads", monthlyValue: "$1,100", setupFee: "$0", startDate: "2025-08-01", departmentNeeded: "Meta Team", ownerDepartment: "Paid Advertising"},
      { service: "Reporting", monthlyValue: "$300", setupFee: "$0", startDate: "2025-08-01", departmentNeeded: "Reporting Team", ownerDepartment: "Analytics"},
    ],
    affiliateAttribution: {
      affiliateName: "Lisa Park",
      referralSource: "Client Referral",
      referralCode: "LPARK10",
      commissionModel: "10% Monthly Recurring",
      potentialCommission: "$380/mo",
      commissionStatus: "Pending Invoice Payment",
    },
    activationChecklist: {
      proposalApproved: true,
      billingRequestCreated: true,
      invoiceCreated: true,
      invoiceSent: false,
      invoicePaid: false,
      clientRecordCreated: true,
      servicesConfirmed: true,
      activationTasksReady: false,
    },
    notes: ["Invoice #INV-2025-0412 created and ready to send."],
    tasks: ["Send Invoice", "Confirm Delivery"],
    notifications: ["Invoice Created", "Send Invoice Reminder"],
    workflowStep: "Invoice Created",
  },
  {
    id: "HO-005",
    client: "Ridgeline Dentistry",
    proposal: "Ridgeline Dentistry – SEO Starter",
    salesRep: "Jake Monroe",
    billingOwner: "Sarah Wells",
    handoffStage: "Invoice Sent",
    dealValue: "$26,400",
    monthlyValue: "$2,200",
    servicesSold: ["SEO", "GBP"],
    invoiceStatus: "Sent",
    activationStatus: "Pending Payment",
    affiliateSource: "Carlos Reyes",
    commissionEligible: true,
    priority: "Medium",
    nextRequiredAction: "Confirm payment receipt",
    proposalSummary: {
      proposalName: "Ridgeline Dentistry – SEO Starter",
      proposalStatus: "Approved",
      approvedDate: "2025-07-03",
      approvedBy: "Jake Monroe",
      dealValue: "$26,400",
      monthlyValue: "$2,200",
      contractTerm: "12 months",
      servicesIncluded: ["SEO", "GBP"],
      specialBillingNotes: "First month free promotion applied.",
    },
    billingRequirements: {
      billingContact: "Dr. Sam Ridge",
      billingEmail: "sam@ridgelinedentistry.com",
      billingTerms: "Net 15",
      invoiceType: "Recurring Monthly",
      billingStartDate: "2025-08-01",
      paymentMethodStatus: "ACH on file",
      taxSetupFeeNotes: "First month free — invoice reflects $0 for month 1",
      finalApprovalStatus: "Approved",
    },
    servicesSoldDetail: [
      { service: "SEO", monthlyValue: "$1,700", setupFee: "$0", startDate: "2025-08-01", departmentNeeded: "SEO Team", ownerDepartment: "SEO"},
      { service: "GBP", monthlyValue: "$500", setupFee: "$0", startDate: "2025-08-01", departmentNeeded: "GBP Team", ownerDepartment: "Local SEO"},
    ],
    affiliateAttribution: {
      affiliateName: "Carlos Reyes",
      referralSource: "Agency Partner",
      referralCode: "CREYES10",
      commissionModel: "10% Monthly Recurring",
      potentialCommission: "$220/mo",
      commissionStatus: "Pending Invoice Payment",
    },
    activationChecklist: {
      proposalApproved: true,
      billingRequestCreated: true,
      invoiceCreated: true,
      invoiceSent: true,
      invoicePaid: false,
      clientRecordCreated: true,
      servicesConfirmed: true,
      activationTasksReady: false,
    },
    notes: ["Invoice sent 7/12. Awaiting payment. First month free promotion noted."],
    tasks: ["Confirm Payment", "Follow Up If Not Paid by 7/27"],
    notifications: ["Invoice Sent"],
    workflowStep: "Invoice Sent",
  },
  {
    id: "HO-006",
    client: "Green Thumb Gardens",
    proposal: "Green Thumb – Local SEO Dominance",
    salesRep: "Emma Davis",
    billingOwner: "Rachel Kim",
    handoffStage: "Invoice Paid",
    dealValue: "$18,000",
    monthlyValue: "$1,500",
    servicesSold: ["SEO", "GBP"],
    invoiceStatus: "Paid",
    activationStatus: "Ready",
    affiliateSource: null,
    commissionEligible: false,
    priority: "High",
    nextRequiredAction: "Push to Activation immediately",
    proposalSummary: {
      proposalName: "Green Thumb – Local SEO Dominance",
      proposalStatus: "Approved",
      approvedDate: "2025-07-01",
      approvedBy: "Emma Davis",
      dealValue: "$18,000",
      monthlyValue: "$1,500",
      contractTerm: "12 months",
      servicesIncluded: ["SEO", "GBP"],
      specialBillingNotes: "Standard billing. No special terms.",
    },
    billingRequirements: {
      billingContact: "Tom Green",
      billingEmail: "billing@greenthumb.com",
      billingTerms: "Net 15",
      invoiceType: "Recurring Monthly",
      billingStartDate: "2025-07-15",
      paymentMethodStatus: "Paid",
      taxSetupFeeNotes: "No setup fees",
      finalApprovalStatus: "Approved",
    },
    servicesSoldDetail: [
      { service: "SEO", monthlyValue: "$1,100", setupFee: "$0", startDate: "2025-07-15", departmentNeeded: "SEO Team", ownerDepartment: "SEO"},
      { service: "GBP", monthlyValue: "$400", setupFee: "$0", startDate: "2025-07-15", departmentNeeded: "GBP Team", ownerDepartment: "Local SEO"},
    ],
    affiliateAttribution: null,
    activationChecklist: {
      proposalApproved: true,
      billingRequestCreated: true,
      invoiceCreated: true,
      invoiceSent: true,
      invoicePaid: true,
      clientRecordCreated: true,
      servicesConfirmed: true,
      activationTasksReady: true,
    },
    notes: ["Invoice paid 7/14. All activation tasks ready. Push to activation now."],
    tasks: ["Push to Activation", "Notify Account Management"],
    notifications: ["Invoice Paid", "Activation Ready"],
    workflowStep: "Invoice Paid",
  },
  {
    id: "HO-007",
    client: "Prestige Auto Detailing",
    proposal: "Prestige Auto – PPC Launch Package",
    salesRep: "Ryan Torres",
    billingOwner: "Sarah Wells",
    handoffStage: "Ready for Activation",
    dealValue: "$36,000",
    monthlyValue: "$3,000",
    servicesSold: ["PPC", "Meta Ads", "Reporting"],
    invoiceStatus: "Paid",
    activationStatus: "Ready",
    affiliateSource: null,
    commissionEligible: false,
    priority: "High",
    nextRequiredAction: "Activate PPC and Meta Ads departments",
    proposalSummary: {
      proposalName: "Prestige Auto – PPC Launch Package",
      proposalStatus: "Approved",
      approvedDate: "2025-06-28",
      approvedBy: "Ryan Torres",
      dealValue: "$36,000",
      monthlyValue: "$3,000",
      contractTerm: "12 months",
      servicesIncluded: ["PPC", "Meta Ads", "Reporting"],
      specialBillingNotes: "Ad spend billed separately via client Google Ads account.",
    },
    billingRequirements: {
      billingContact: "Marcus Prestige",
      billingEmail: "marcus@prestigeauto.com",
      billingTerms: "Net 15",
      invoiceType: "Recurring Monthly",
      billingStartDate: "2025-07-01",
      paymentMethodStatus: "Paid",
      taxSetupFeeNotes: "Client manages own ad spend accounts",
      finalApprovalStatus: "Approved",
    },
    servicesSoldDetail: [
      { service: "PPC", monthlyValue: "$1,500", setupFee: "$750", startDate: "2025-07-01", departmentNeeded: "PPC Team", ownerDepartment: "Paid Advertising"},
      { service: "Meta Ads", monthlyValue: "$1,200", setupFee: "$500", startDate: "2025-07-01", departmentNeeded: "Meta Team", ownerDepartment: "Paid Advertising"},
      { service: "Reporting", monthlyValue: "$300", setupFee: "$0", startDate: "2025-07-01", departmentNeeded: "Reporting Team", ownerDepartment: "Analytics"},
    ],
    affiliateAttribution: null,
    activationChecklist: {
      proposalApproved: true,
      billingRequestCreated: true,
      invoiceCreated: true,
      invoiceSent: true,
      invoicePaid: true,
      clientRecordCreated: true,
      servicesConfirmed: true,
      activationTasksReady: true,
    },
    notes: ["Ready for activation. PPC and Meta departments notified."],
    tasks: ["Open Billing Activation", "Assign PPC Manager", "Assign Meta Manager"],
    notifications: ["Activation Ready"],
    workflowStep: "Ready for Activation",
  },
  {
    id: "HO-008",
    client: "Clearwater Plumbing",
    proposal: "Clearwater – LSA + SEO Bundle",
    salesRep: "Jake Monroe",
    billingOwner: "Rachel Kim",
    handoffStage: "Blocked",
    dealValue: "$24,000",
    monthlyValue: "$2,000",
    servicesSold: ["LSA", "SEO", "GBP"],
    invoiceStatus: "Not Created",
    activationStatus: "Not Started",
    affiliateSource: null,
    commissionEligible: false,
    priority: "Critical",
    nextRequiredAction: "Resolve missing billing details — ACH not on file, no billing contact response",
    proposalSummary: {
      proposalName: "Clearwater – LSA + SEO Bundle",
      proposalStatus: "Approved",
      approvedDate: "2025-07-06",
      approvedBy: "Jake Monroe",
      dealValue: "$24,000",
      monthlyValue: "$2,000",
      contractTerm: "12 months",
      servicesIncluded: ["LSA", "SEO", "GBP"],
      specialBillingNotes: "LSA budget setup requires client Google account access.",
    },
    billingRequirements: {
      billingContact: "Kevin Clear",
      billingEmail: "kevin@clearwaterplumbing.com",
      billingTerms: "Net 30",
      invoiceType: "Recurring Monthly",
      billingStartDate: "2025-07-15",
      paymentMethodStatus: "Missing — not on file",
      taxSetupFeeNotes: "LSA setup fee: $300",
      finalApprovalStatus: "Blocked — awaiting payment method",
    },
    servicesSoldDetail: [
      { service: "LSA", monthlyValue: "$800", setupFee: "$300", startDate: "2025-07-15", departmentNeeded: "PPC Team", ownerDepartment: "Paid Advertising"},
      { service: "SEO", monthlyValue: "$900", setupFee: "$0", startDate: "2025-07-15", departmentNeeded: "SEO Team", ownerDepartment: "SEO"},
      { service: "GBP", monthlyValue: "$300", setupFee: "$0", startDate: "2025-07-15", departmentNeeded: "GBP Team", ownerDepartment: "Local SEO"},
    ],
    affiliateAttribution: null,
    activationChecklist: {
      proposalApproved: true,
      billingRequestCreated: false,
      invoiceCreated: false,
      invoiceSent: false,
      invoicePaid: false,
      clientRecordCreated: true,
      servicesConfirmed: true,
      activationTasksReady: false,
    },
    notes: ["BLOCKED: Client has not responded to billing setup. ACH missing. Sales rep to follow up urgently."],
    tasks: ["Follow Up Billing Contact", "Escalate to Sales Manager", "Create Billing Task"],
    notifications: ["Billing Details Missing", "Handoff Blocked"],
    workflowStep: "Blocked",
  },
  {
    id: "HO-009",
    client: "BlueSky Orthodontics",
    proposal: "BlueSky – Full Digital Package",
    salesRep: "Sophia Lane",
    billingOwner: "Sarah Wells",
    handoffStage: "Invoice Paid",
    dealValue: "$72,000",
    monthlyValue: "$6,000",
    servicesSold: ["SEO", "PPC", "GBP", "Meta Ads", "Reporting"],
    invoiceStatus: "Paid",
    activationStatus: "Ready",
    affiliateSource: null,
    commissionEligible: false,
    priority: "High",
    nextRequiredAction: "Push to Activation — all departments need assignment",
    proposalSummary: {
      proposalName: "BlueSky – Full Digital Package",
      proposalStatus: "Approved",
      approvedDate: "2025-06-25",
      approvedBy: "Sophia Lane",
      dealValue: "$72,000",
      monthlyValue: "$6,000",
      contractTerm: "12 months",
      servicesIncluded: ["SEO", "PPC", "GBP", "Meta Ads", "Reporting"],
      specialBillingNotes: "Premium client — white glove onboarding required.",
    },
    billingRequirements: {
      billingContact: "Dr. Laura Blue",
      billingEmail: "billing@blueskyortho.com",
      billingTerms: "Net 15",
      invoiceType: "Recurring Monthly",
      billingStartDate: "2025-07-01",
      paymentMethodStatus: "Paid",
      taxSetupFeeNotes: "No setup fees",
      finalApprovalStatus: "Approved",
    },
    servicesSoldDetail: [
      { service: "SEO", monthlyValue: "$2,000", setupFee: "$0", startDate: "2025-07-01", departmentNeeded: "SEO Team", ownerDepartment: "SEO"},
      { service: "PPC", monthlyValue: "$1,500", setupFee: "$0", startDate: "2025-07-01", departmentNeeded: "PPC Team", ownerDepartment: "Paid Advertising"},
      { service: "GBP", monthlyValue: "$500", setupFee: "$0", startDate: "2025-07-01", departmentNeeded: "GBP Team", ownerDepartment: "Local SEO"},
      { service: "Meta Ads", monthlyValue: "$1,500", setupFee: "$0", startDate: "2025-07-01", departmentNeeded: "Meta Team", ownerDepartment: "Paid Advertising"},
      { service: "Reporting", monthlyValue: "$500", setupFee: "$0", startDate: "2025-07-01", departmentNeeded: "Reporting Team", ownerDepartment: "Analytics"},
    ],
    affiliateAttribution: null,
    activationChecklist: {
      proposalApproved: true,
      billingRequestCreated: true,
      invoiceCreated: true,
      invoiceSent: true,
      invoicePaid: true,
      clientRecordCreated: true,
      servicesConfirmed: true,
      activationTasksReady: true,
    },
    notes: ["Premium client. Paid 7/2. White glove onboarding requested."],
    tasks: ["Push to Activation", "Assign Senior SEO Manager", "Assign Senior PPC Manager"],
    notifications: ["Invoice Paid", "Activation Ready"],
    workflowStep: "Invoice Paid",
  },
  {
    id: "HO-010",
    client: "Harbor View Chiropractic",
    proposal: "Harbor View – SEO + GBP Starter",
    salesRep: "Emma Davis",
    billingOwner: "Rachel Kim",
    handoffStage: "Billing Requested",
    dealValue: "$21,600",
    monthlyValue: "$1,800",
    servicesSold: ["SEO", "GBP"],
    invoiceStatus: "Draft",
    activationStatus: "Pending Invoice",
    affiliateSource: null,
    commissionEligible: false,
    priority: "Medium",
    nextRequiredAction: "Finalize invoice and send to client",
    proposalSummary: {
      proposalName: "Harbor View – SEO + GBP Starter",
      proposalStatus: "Approved",
      approvedDate: "2025-07-09",
      approvedBy: "Emma Davis",
      dealValue: "$21,600",
      monthlyValue: "$1,800",
      contractTerm: "12 months",
      servicesIncluded: ["SEO", "GBP"],
      specialBillingNotes: "None",
    },
    billingRequirements: {
      billingContact: "Dr. Paul Harbor",
      billingEmail: "paul@harborview.com",
      billingTerms: "Net 30",
      invoiceType: "Recurring Monthly",
      billingStartDate: "2025-08-01",
      paymentMethodStatus: "Check preferred",
      taxSetupFeeNotes: "No setup fees",
      finalApprovalStatus: "Approved",
    },
    servicesSoldDetail: [
      { service: "SEO", monthlyValue: "$1,400", setupFee: "$0", startDate: "2025-08-01", departmentNeeded: "SEO Team", ownerDepartment: "SEO"},
      { service: "GBP", monthlyValue: "$400", setupFee: "$0", startDate: "2025-08-01", departmentNeeded: "GBP Team", ownerDepartment: "Local SEO"},
    ],
    affiliateAttribution: null,
    activationChecklist: {
      proposalApproved: true,
      billingRequestCreated: true,
      invoiceCreated: false,
      invoiceSent: false,
      invoicePaid: false,
      clientRecordCreated: true,
      servicesConfirmed: true,
      activationTasksReady: false,
    },
    notes: ["Billing requested. Client prefers check — confirm mailing address."],
    tasks: ["Finalize Invoice", "Confirm Mailing Address", "Send Invoice"],
    notifications: ["Billing Request Created"],
    workflowStep: "Billing Requested",
  },
  {
    id: "HO-011",
    client: "Sunstone Physical Therapy",
    proposal: "Sunstone – PPC + Meta Growth",
    salesRep: "Ryan Torres",
    billingOwner: "Sarah Wells",
    handoffStage: "Invoice Sent",
    dealValue: "$30,000",
    monthlyValue: "$2,500",
    servicesSold: ["PPC", "Meta Ads", "Reporting"],
    invoiceStatus: "Sent",
    activationStatus: "Pending Payment",
    affiliateSource: null,
    commissionEligible: false,
    priority: "Medium",
    nextRequiredAction: "Follow up on payment — due 7/25",
    proposalSummary: {
      proposalName: "Sunstone – PPC + Meta Growth",
      proposalStatus: "Approved",
      approvedDate: "2025-07-04",
      approvedBy: "Ryan Torres",
      dealValue: "$30,000",
      monthlyValue: "$2,500",
      contractTerm: "12 months",
      servicesIncluded: ["PPC", "Meta Ads", "Reporting"],
      specialBillingNotes: "No special billing terms.",
    },
    billingRequirements: {
      billingContact: "Amy Sun",
      billingEmail: "amy@sunstonept.com",
      billingTerms: "Net 15",
      invoiceType: "Recurring Monthly",
      billingStartDate: "2025-07-15",
      paymentMethodStatus: "Credit Card on file",
      taxSetupFeeNotes: "Standard setup fees included in first invoice",
      finalApprovalStatus: "Approved",
    },
    servicesSoldDetail: [
      { service: "PPC", monthlyValue: "$1,200", setupFee: "$600", startDate: "2025-07-15", departmentNeeded: "PPC Team", ownerDepartment: "Paid Advertising"},
      { service: "Meta Ads", monthlyValue: "$1,000", setupFee: "$400", startDate: "2025-07-15", departmentNeeded: "Meta Team", ownerDepartment: "Paid Advertising"},
      { service: "Reporting", monthlyValue: "$300", setupFee: "$0", startDate: "2025-07-15", departmentNeeded: "Reporting Team", ownerDepartment: "Analytics"},
    ],
    affiliateAttribution: null,
    activationChecklist: {
      proposalApproved: true,
      billingRequestCreated: true,
      invoiceCreated: true,
      invoiceSent: true,
      invoicePaid: false,
      clientRecordCreated: true,
      servicesConfirmed: true,
      activationTasksReady: false,
    },
    notes: ["Invoice sent 7/10. Payment due 7/25. Follow up if not received."],
    tasks: ["Confirm Payment", "Follow Up 7/25"],
    notifications: ["Invoice Sent"],
    workflowStep: "Invoice Sent",
  },
  {
    id: "HO-012",
    client: "Lakewood Auto Group",
    proposal: "Lakewood Auto – SEO + Web Redesign",
    salesRep: "Jake Monroe",
    billingOwner: "Rachel Kim",
    handoffStage: "Invoice Created",
    dealValue: "$42,000",
    monthlyValue: "$3,500",
    servicesSold: ["SEO", "Web", "Reporting"],
    invoiceStatus: "Created",
    activationStatus: "Pending Invoice",
    affiliateSource: null,
    commissionEligible: false,
    priority: "Medium",
    nextRequiredAction: "Send invoice to billing contact",
    proposalSummary: {
      proposalName: "Lakewood Auto – SEO + Web Redesign",
      proposalStatus: "Approved",
      approvedDate: "2025-07-06",
      approvedBy: "Jake Monroe",
      dealValue: "$42,000",
      monthlyValue: "$3,500",
      contractTerm: "12 months",
      servicesIncluded: ["SEO", "Web", "Reporting"],
      specialBillingNotes: "Web redesign: $4,500 one-time. Monthly: $3,500.",
    },
    billingRequirements: {
      billingContact: "Brian Lake",
      billingEmail: "brian@lakewoodauto.com",
      billingTerms: "Net 15",
      invoiceType: "Monthly + One-Time Web",
      billingStartDate: "2025-08-01",
      paymentMethodStatus: "ACH on file",
      taxSetupFeeNotes: "Web one-time: $4,500",
      finalApprovalStatus: "Approved",
    },
    servicesSoldDetail: [
      { service: "SEO", monthlyValue: "$2,200", setupFee: "$0", startDate: "2025-08-01", departmentNeeded: "SEO Team", ownerDepartment: "SEO"},
      { service: "Web", monthlyValue: "$1,000", setupFee: "$4,500", startDate: "2025-08-01", departmentNeeded: "Web Team", ownerDepartment: "Creative"},
      { service: "Reporting", monthlyValue: "$300", setupFee: "$0", startDate: "2025-08-01", departmentNeeded: "Reporting Team", ownerDepartment: "Analytics"},
    ],
    affiliateAttribution: null,
    activationChecklist: {
      proposalApproved: true,
      billingRequestCreated: true,
      invoiceCreated: true,
      invoiceSent: false,
      invoicePaid: false,
      clientRecordCreated: true,
      servicesConfirmed: true,
      activationTasksReady: false,
    },
    notes: ["Invoice created. Ready to send."],
    tasks: ["Send Invoice", "Confirm Delivery"],
    notifications: ["Invoice Created"],
    workflowStep: "Invoice Created",
  },
  {
    id: "HO-013",
    client: "Peak Performance Gym",
    proposal: "Peak Performance – Meta Ads + SEO",
    salesRep: "Emma Davis",
    billingOwner: "Sarah Wells",
    handoffStage: "Ready for Activation",
    dealValue: "$27,600",
    monthlyValue: "$2,300",
    servicesSold: ["Meta Ads", "SEO"],
    invoiceStatus: "Paid",
    activationStatus: "Ready",
    affiliateSource: null,
    commissionEligible: false,
    priority: "High",
    nextRequiredAction: "Activate Meta Ads and SEO departments",
    proposalSummary: {
      proposalName: "Peak Performance – Meta Ads + SEO",
      proposalStatus: "Approved",
      approvedDate: "2025-06-30",
      approvedBy: "Emma Davis",
      dealValue: "$27,600",
      monthlyValue: "$2,300",
      contractTerm: "12 months",
      servicesIncluded: ["Meta Ads", "SEO"],
      specialBillingNotes: "None.",
    },
    billingRequirements: {
      billingContact: "Chris Peak",
      billingEmail: "billing@peakgym.com",
      billingTerms: "Net 15",
      invoiceType: "Recurring Monthly",
      billingStartDate: "2025-07-10",
      paymentMethodStatus: "Paid",
      taxSetupFeeNotes: "No setup fees",
      finalApprovalStatus: "Approved",
    },
    servicesSoldDetail: [
      { service: "Meta Ads", monthlyValue: "$1,400", setupFee: "$0", startDate: "2025-07-10", departmentNeeded: "Meta Team", ownerDepartment: "Paid Advertising"},
      { service: "SEO", monthlyValue: "$900", setupFee: "$0", startDate: "2025-07-10", departmentNeeded: "SEO Team", ownerDepartment: "SEO"},
    ],
    affiliateAttribution: null,
    activationChecklist: {
      proposalApproved: true,
      billingRequestCreated: true,
      invoiceCreated: true,
      invoiceSent: true,
      invoicePaid: true,
      clientRecordCreated: true,
      servicesConfirmed: true,
      activationTasksReady: true,
    },
    notes: ["Paid 7/11. Activation ready."],
    tasks: ["Push to Activation"],
    notifications: ["Activation Ready"],
    workflowStep: "Ready for Activation",
  },
  {
    id: "HO-014",
    client: "Urban Roots Restaurant",
    proposal: "Urban Roots – Local SEO Campaign",
    salesRep: "Sophia Lane",
    billingOwner: "Rachel Kim",
    handoffStage: "Proposal Approved",
    dealValue: "$16,800",
    monthlyValue: "$1,400",
    servicesSold: ["SEO", "GBP"],
    invoiceStatus: "Not Created",
    activationStatus: "Not Started",
    affiliateSource: null,
    commissionEligible: false,
    priority: "Medium",
    nextRequiredAction: "Send to Billing — initiate invoice request",
    proposalSummary: {
      proposalName: "Urban Roots – Local SEO Campaign",
      proposalStatus: "Approved",
      approvedDate: "2025-07-11",
      approvedBy: "Sophia Lane",
      dealValue: "$16,800",
      monthlyValue: "$1,400",
      contractTerm: "12 months",
      servicesIncluded: ["SEO", "GBP"],
      specialBillingNotes: "None.",
    },
    billingRequirements: {
      billingContact: "Rosa Urban",
      billingEmail: "rosa@urbanroots.com",
      billingTerms: "Net 30",
      invoiceType: "Recurring Monthly",
      billingStartDate: "2025-08-01",
      paymentMethodStatus: "Credit Card preferred",
      taxSetupFeeNotes: "No setup fees",
      finalApprovalStatus: "Approved",
    },
    servicesSoldDetail: [
      { service: "SEO", monthlyValue: "$1,000", setupFee: "$0", startDate: "2025-08-01", departmentNeeded: "SEO Team", ownerDepartment: "SEO"},
      { service: "GBP", monthlyValue: "$400", setupFee: "$0", startDate: "2025-08-01", departmentNeeded: "GBP Team", ownerDepartment: "Local SEO"},
    ],
    affiliateAttribution: null,
    activationChecklist: {
      proposalApproved: true,
      billingRequestCreated: false,
      invoiceCreated: false,
      invoiceSent: false,
      invoicePaid: false,
      clientRecordCreated: false,
      servicesConfirmed: true,
      activationTasksReady: false,
    },
    notes: ["Proposal approved 7/11. Billing not yet initiated."],
    tasks: ["Send to Billing", "Create Client Record"],
    notifications: ["Proposal Approved"],
    workflowStep: "Proposal Approved",
  },
  {
    id: "HO-015",
    client: "Northgate Veterinary",
    proposal: "Northgate Vet – PPC + LSA Launch",
    salesRep: "Ryan Torres",
    billingOwner: "Sarah Wells",
    handoffStage: "Invoice Sent",
    dealValue: "$33,600",
    monthlyValue: "$2,800",
    servicesSold: ["PPC", "LSA", "Reporting"],
    invoiceStatus: "Sent",
    activationStatus: "Pending Payment",
    affiliateSource: null,
    commissionEligible: false,
    priority: "High",
    nextRequiredAction: "Chase payment — 5 days overdue",
    proposalSummary: {
      proposalName: "Northgate Vet – PPC + LSA Launch",
      proposalStatus: "Approved",
      approvedDate: "2025-07-01",
      approvedBy: "Ryan Torres",
      dealValue: "$33,600",
      monthlyValue: "$2,800",
      contractTerm: "12 months",
      servicesIncluded: ["PPC", "LSA", "Reporting"],
      specialBillingNotes: "LSA budget is separate from management fee.",
    },
    billingRequirements: {
      billingContact: "Dr. Megan North",
      billingEmail: "megan@northgatevet.com",
      billingTerms: "Net 10",
      invoiceType: "Recurring Monthly",
      billingStartDate: "2025-07-10",
      paymentMethodStatus: "ACH on file",
      taxSetupFeeNotes: "LSA management fee only — no ad spend included",
      finalApprovalStatus: "Approved",
    },
    servicesSoldDetail: [
      { service: "PPC", monthlyValue: "$1,500", setupFee: "$500", startDate: "2025-07-10", departmentNeeded: "PPC Team", ownerDepartment: "Paid Advertising"},
      { service: "LSA", monthlyValue: "$1,000", setupFee: "$300", startDate: "2025-07-10", departmentNeeded: "PPC Team", ownerDepartment: "Paid Advertising"},
      { service: "Reporting", monthlyValue: "$300", setupFee: "$0", startDate: "2025-07-10", departmentNeeded: "Reporting Team", ownerDepartment: "Analytics"},
    ],
    affiliateAttribution: null,
    activationChecklist: {
      proposalApproved: true,
      billingRequestCreated: true,
      invoiceCreated: true,
      invoiceSent: true,
      invoicePaid: false,
      clientRecordCreated: true,
      servicesConfirmed: true,
      activationTasksReady: false,
    },
    notes: ["Invoice sent 7/10. Net 10 = due 7/20. Overdue — chase payment."],
    tasks: ["Chase Payment", "Escalate if Not Paid by 7/22"],
    notifications: ["Invoice Overdue"],
    workflowStep: "Invoice Sent",
  },
  {
    id: "HO-016",
    client: "Silver Spoon Catering",
    proposal: "Silver Spoon – Creative + Web",
    salesRep: "Emma Davis",
    billingOwner: "Rachel Kim",
    handoffStage: "Billing Requested",
    dealValue: "$19,200",
    monthlyValue: "$1,600",
    servicesSold: ["Web", "Creative", "Reporting"],
    invoiceStatus: "Draft",
    activationStatus: "Pending Invoice",
    affiliateSource: null,
    commissionEligible: false,
    priority: "Low",
    nextRequiredAction: "Complete invoice draft and send",
    proposalSummary: {
      proposalName: "Silver Spoon – Creative + Web",
      proposalStatus: "Approved",
      approvedDate: "2025-07-08",
      approvedBy: "Emma Davis",
      dealValue: "$19,200",
      monthlyValue: "$1,600",
      contractTerm: "12 months",
      servicesIncluded: ["Web", "Creative", "Reporting"],
      specialBillingNotes: "Creative retainer month-to-month after initial 12.",
    },
    billingRequirements: {
      billingContact: "Sandra Silver",
      billingEmail: "sandra@silverspoon.com",
      billingTerms: "Net 30",
      invoiceType: "Monthly Retainer",
      billingStartDate: "2025-08-01",
      paymentMethodStatus: "Credit Card preferred",
      taxSetupFeeNotes: "No setup fees",
      finalApprovalStatus: "Approved",
    },
    servicesSoldDetail: [
      { service: "Web", monthlyValue: "$800", setupFee: "$2,500", startDate: "2025-08-01", departmentNeeded: "Web Team", ownerDepartment: "Creative"},
      { service: "Creative", monthlyValue: "$600", setupFee: "$0", startDate: "2025-08-01", departmentNeeded: "Creative Team", ownerDepartment: "Creative"},
      { service: "Reporting", monthlyValue: "$200", setupFee: "$0", startDate: "2025-08-01", departmentNeeded: "Reporting Team", ownerDepartment: "Analytics"},
    ],
    affiliateAttribution: null,
    activationChecklist: {
      proposalApproved: true,
      billingRequestCreated: true,
      invoiceCreated: false,
      invoiceSent: false,
      invoicePaid: false,
      clientRecordCreated: true,
      servicesConfirmed: true,
      activationTasksReady: false,
    },
    notes: ["Billing requested. Invoice draft in progress."],
    tasks: ["Complete Invoice Draft", "Send Invoice"],
    notifications: ["Billing Request Created"],
    workflowStep: "Billing Requested",
  },
  {
    id: "HO-017",
    client: "Pacific Rim Sushi",
    proposal: "Pacific Rim – GBP + Reporting",
    salesRep: "Jake Monroe",
    billingOwner: "Sarah Wells",
    handoffStage: "Invoice Paid",
    dealValue: "$12,000",
    monthlyValue: "$1,000",
    servicesSold: ["GBP", "Reporting"],
    invoiceStatus: "Paid",
    activationStatus: "Activated",
    affiliateSource: null,
    commissionEligible: false,
    priority: "Low",
    nextRequiredAction: "Closed — account management onboarding complete",
    proposalSummary: {
      proposalName: "Pacific Rim – GBP + Reporting",
      proposalStatus: "Approved",
      approvedDate: "2025-06-20",
      approvedBy: "Jake Monroe",
      dealValue: "$12,000",
      monthlyValue: "$1,000",
      contractTerm: "12 months",
      servicesIncluded: ["GBP", "Reporting"],
      specialBillingNotes: "None.",
    },
    billingRequirements: {
      billingContact: "Ken Pacific",
      billingEmail: "ken@pacificrimsushi.com",
      billingTerms: "Net 15",
      invoiceType: "Recurring Monthly",
      billingStartDate: "2025-07-01",
      paymentMethodStatus: "Paid",
      taxSetupFeeNotes: "No setup fees",
      finalApprovalStatus: "Approved",
    },
    servicesSoldDetail: [
      { service: "GBP", monthlyValue: "$700", setupFee: "$0", startDate: "2025-07-01", departmentNeeded: "GBP Team", ownerDepartment: "Local SEO"},
      { service: "Reporting", monthlyValue: "$300", setupFee: "$0", startDate: "2025-07-01", departmentNeeded: "Reporting Team", ownerDepartment: "Analytics"},
    ],
    affiliateAttribution: null,
    activationChecklist: {
      proposalApproved: true,
      billingRequestCreated: true,
      invoiceCreated: true,
      invoiceSent: true,
      invoicePaid: true,
      clientRecordCreated: true,
      servicesConfirmed: true,
      activationTasksReady: true,
    },
    notes: ["Fully activated. Account management onboarding complete."],
    tasks: [],
    notifications: [],
    workflowStep: "Account Management Onboarding",
  },
  {
    id: "HO-018",
    client: "Ironside Fitness",
    proposal: "Ironside – Meta + Creative Bundle",
    salesRep: "Sophia Lane",
    billingOwner: "Rachel Kim",
    handoffStage: "Proposal Approved",
    dealValue: "$20,400",
    monthlyValue: "$1,700",
    servicesSold: ["Meta Ads", "Creative"],
    invoiceStatus: "Not Created",
    activationStatus: "Not Started",
    affiliateSource: null,
    commissionEligible: false,
    priority: "Medium",
    nextRequiredAction: "Send to Billing",
    proposalSummary: {
      proposalName: "Ironside – Meta + Creative Bundle",
      proposalStatus: "Approved",
      approvedDate: "2025-07-12",
      approvedBy: "Sophia Lane",
      dealValue: "$20,400",
      monthlyValue: "$1,700",
      contractTerm: "12 months",
      servicesIncluded: ["Meta Ads", "Creative"],
      specialBillingNotes: "None.",
    },
    billingRequirements: {
      billingContact: "Tyler Iron",
      billingEmail: "tyler@ironsidefit.com",
      billingTerms: "Net 15",
      invoiceType: "Recurring Monthly",
      billingStartDate: "2025-08-01",
      paymentMethodStatus: "Credit Card preferred",
      taxSetupFeeNotes: "No setup fees",
      finalApprovalStatus: "Approved",
    },
    servicesSoldDetail: [
      { service: "Meta Ads", monthlyValue: "$1,100", setupFee: "$400", startDate: "2025-08-01", departmentNeeded: "Meta Team", ownerDepartment: "Paid Advertising"},
      { service: "Creative", monthlyValue: "$600", setupFee: "$0", startDate: "2025-08-01", departmentNeeded: "Creative Team", ownerDepartment: "Creative"},
    ],
    affiliateAttribution: null,
    activationChecklist: {
      proposalApproved: true,
      billingRequestCreated: false,
      invoiceCreated: false,
      invoiceSent: false,
      invoicePaid: false,
      clientRecordCreated: false,
      servicesConfirmed: true,
      activationTasksReady: false,
    },
    notes: ["Proposal approved 7/12. Billing not initiated."],
    tasks: ["Send to Billing", "Create Client Record"],
    notifications: ["Proposal Approved"],
    workflowStep: "Proposal Approved",
  },
  {
    id: "HO-019",
    client: "Cascade Dental Studio",
    proposal: "Cascade Dental – Full Funnel",
    salesRep: "Ryan Torres",
    billingOwner: "Sarah Wells",
    handoffStage: "Invoice Sent",
    dealValue: "$60,000",
    monthlyValue: "$5,000",
    servicesSold: ["SEO", "PPC", "GBP", "Meta Ads", "Reporting", "Creative"],
    invoiceStatus: "Sent",
    activationStatus: "Pending Payment",
    affiliateSource: null,
    commissionEligible: false,
    priority: "High",
    nextRequiredAction: "Confirm payment — due 7/26",
    proposalSummary: {
      proposalName: "Cascade Dental – Full Funnel",
      proposalStatus: "Approved",
      approvedDate: "2025-07-05",
      approvedBy: "Ryan Torres",
      dealValue: "$60,000",
      monthlyValue: "$5,000",
      contractTerm: "12 months",
      servicesIncluded: ["SEO", "PPC", "GBP", "Meta Ads", "Reporting", "Creative"],
      specialBillingNotes: "Creative retainer is month-to-month after 12.",
    },
    billingRequirements: {
      billingContact: "Dr. Nina Cascade",
      billingEmail: "nina@cascadedental.com",
      billingTerms: "Net 15",
      invoiceType: "Recurring Monthly",
      billingStartDate: "2025-07-15",
      paymentMethodStatus: "ACH on file",
      taxSetupFeeNotes: "No setup fees for month 1",
      finalApprovalStatus: "Approved",
    },
    servicesSoldDetail: [
      { service: "SEO", monthlyValue: "$1,500", setupFee: "$0", startDate: "2025-07-15", departmentNeeded: "SEO Team", ownerDepartment: "SEO"},
      { service: "PPC", monthlyValue: "$1,200", setupFee: "$0", startDate: "2025-07-15", departmentNeeded: "PPC Team", ownerDepartment: "Paid Advertising"},
      { service: "GBP", monthlyValue: "$500", setupFee: "$0", startDate: "2025-07-15", departmentNeeded: "GBP Team", ownerDepartment: "Local SEO"},
      { service: "Meta Ads", monthlyValue: "$1,000", setupFee: "$0", startDate: "2025-07-15", departmentNeeded: "Meta Team", ownerDepartment: "Paid Advertising"},
      { service: "Reporting", monthlyValue: "$500", setupFee: "$0", startDate: "2025-07-15", departmentNeeded: "Reporting Team", ownerDepartment: "Analytics"},
      { service: "Creative", monthlyValue: "$300", setupFee: "$0", startDate: "2025-07-15", departmentNeeded: "Creative Team", ownerDepartment: "Creative"},
    ],
    affiliateAttribution: null,
    activationChecklist: {
      proposalApproved: true,
      billingRequestCreated: true,
      invoiceCreated: true,
      invoiceSent: true,
      invoicePaid: false,
      clientRecordCreated: true,
      servicesConfirmed: true,
      activationTasksReady: false,
    },
    notes: ["Invoice sent 7/11. Payment due 7/26."],
    tasks: ["Confirm Payment 7/26"],
    notifications: ["Invoice Sent"],
    workflowStep: "Invoice Sent",
  },
  {
    id: "HO-020",
    client: "Highline Legal Group",
    proposal: "Highline Legal – SEO Authority Build",
    salesRep: "Emma Davis",
    billingOwner: "Rachel Kim",
    handoffStage: "Ready for Activation",
    dealValue: "$48,000",
    monthlyValue: "$4,000",
    servicesSold: ["SEO", "Reporting", "Web"],
    invoiceStatus: "Paid",
    activationStatus: "Ready",
    affiliateSource: null,
    commissionEligible: false,
    priority: "High",
    nextRequiredAction: "Activate SEO and Web departments",
    proposalSummary: {
      proposalName: "Highline Legal – SEO Authority Build",
      proposalStatus: "Approved",
      approvedDate: "2025-06-27",
      approvedBy: "Emma Davis",
      dealValue: "$48,000",
      monthlyValue: "$4,000",
      contractTerm: "12 months",
      servicesIncluded: ["SEO", "Reporting", "Web"],
      specialBillingNotes: "Web included in monthly. No one-time fees.",
    },
    billingRequirements: {
      billingContact: "Patrick High",
      billingEmail: "billing@highlinelegal.com",
      billingTerms: "Net 15",
      invoiceType: "Recurring Monthly",
      billingStartDate: "2025-07-01",
      paymentMethodStatus: "Paid",
      taxSetupFeeNotes: "No setup fees",
      finalApprovalStatus: "Approved",
    },
    servicesSoldDetail: [
      { service: "SEO", monthlyValue: "$2,500", setupFee: "$0", startDate: "2025-07-01", departmentNeeded: "SEO Team", ownerDepartment: "SEO"},
      { service: "Web", monthlyValue: "$1,000", setupFee: "$0", startDate: "2025-07-01", departmentNeeded: "Web Team", ownerDepartment: "Creative"},
      { service: "Reporting", monthlyValue: "$500", setupFee: "$0", startDate: "2025-07-01", departmentNeeded: "Reporting Team", ownerDepartment: "Analytics"},
    ],
    affiliateAttribution: null,
    activationChecklist: {
      proposalApproved: true,
      billingRequestCreated: true,
      invoiceCreated: true,
      invoiceSent: true,
      invoicePaid: true,
      clientRecordCreated: true,
      servicesConfirmed: true,
      activationTasksReady: true,
    },
    notes: ["Invoice paid 7/2. Ready for activation."],
    tasks: ["Push to Activation", "Assign SEO Lead"],
    notifications: ["Invoice Paid", "Activation Ready"],
    workflowStep: "Ready for Activation",
  },
  {
    id: "HO-021",
    client: "Weston Eyecare Center",
    proposal: "Weston Eyecare – Local Growth Bundle",
    salesRep: "Jake Monroe",
    billingOwner: "Rachel Kim",
    handoffStage: "Blocked",
    dealValue: "$22,800",
    monthlyValue: "$1,900",
    servicesSold: ["SEO", "GBP", "Reporting"],
    invoiceStatus: "Not Created",
    activationStatus: "Not Started",
    affiliateSource: null,
    commissionEligible: false,
    priority: "High",
    nextRequiredAction: "Resolve: client disputing contract terms — escalate to Sales Director",
    proposalSummary: {
      proposalName: "Weston Eyecare – Local Growth Bundle",
      proposalStatus: "Approved",
      approvedDate: "2025-07-09",
      approvedBy: "Jake Monroe",
      dealValue: "$22,800",
      monthlyValue: "$1,900",
      contractTerm: "12 months",
      servicesIncluded: ["SEO", "GBP", "Reporting"],
      specialBillingNotes: "Client disputing cancellation clause.",
    },
    billingRequirements: {
      billingContact: "Dr. Frank Weston",
      billingEmail: "frank@westoneyecare.com",
      billingTerms: "Net 30",
      invoiceType: "Recurring Monthly",
      billingStartDate: "TBD — blocked",
      paymentMethodStatus: "Pending dispute resolution",
      taxSetupFeeNotes: "No setup fees",
      finalApprovalStatus: "Blocked — contract dispute",
    },
    servicesSoldDetail: [
      { service: "SEO", monthlyValue: "$1,200", setupFee: "$0", startDate: "TBD", departmentNeeded: "SEO Team", ownerDepartment: "SEO"},
      { service: "GBP", monthlyValue: "$400", setupFee: "$0", startDate: "TBD", departmentNeeded: "GBP Team", ownerDepartment: "Local SEO"},
      { service: "Reporting", monthlyValue: "$300", setupFee: "$0", startDate: "TBD", departmentNeeded: "Reporting Team", ownerDepartment: "Analytics"},
    ],
    affiliateAttribution: null,
    activationChecklist: {
      proposalApproved: true,
      billingRequestCreated: false,
      invoiceCreated: false,
      invoiceSent: false,
      invoicePaid: false,
      clientRecordCreated: true,
      servicesConfirmed: false,
      activationTasksReady: false,
    },
    notes: ["BLOCKED: Client disputing cancellation clause. Escalated to Sales Director."],
    tasks: ["Escalate to Sales Director", "Resolve Contract Dispute"],
    notifications: ["Handoff Blocked — Dispute"],
    workflowStep: "Blocked",
  },
];

// 
// Helpers
// 

const stageOrder: HandoffStage[] = [
  "Proposal Approved",
  "Billing Requested",
  "Invoice Draft Needed",
  "Invoice Created",
  "Invoice Sent",
  "Invoice Paid",
  "Ready for Activation",
  "Blocked",
  "Closed",
];

function stageVariant(stage: HandoffStage): StatusVariant {
  const map: Record<HandoffStage, StatusVariant> = {
    "Proposal Approved": "info",
    "Billing Requested": "warning",
    "Invoice Draft Needed": "error",
    "Invoice Created": "pending",
    "Invoice Sent": "warning",
    "Invoice Paid": "success",
    "Ready for Activation": "success",
    "Blocked": "error",
    "Closed": "neutral",
  };
  return map[stage] ?? "neutral";
}

function invoiceVariant(status: InvoiceStatus): StatusVariant {
  const map: Record<InvoiceStatus, StatusVariant> = {
    "Not Created": "neutral",
    "Draft": "pending",
    "Created": "info",
    "Sent": "warning",
    "Paid": "success",
    "Overdue": "error",
    "Void": "neutral",
  };
  return map[status] ?? "neutral";
}

function activationVariant(status: ActivationStatus): StatusVariant {
  const map: Record<ActivationStatus, StatusVariant> = {
    "Not Started": "neutral",
    "Pending Invoice": "pending",
    "Pending Payment": "warning",
    "Ready": "success",
    "In Progress": "info",
    "Activated": "success",
  };
  return map[status] ?? "neutral";
}

function commissionVariant(status: CommissionStatus): StatusVariant {
  const map: Record<CommissionStatus, StatusVariant> = {
    "Not Eligible": "neutral",
    "Pending Invoice Payment": "pending",
    "Eligible": "info",
    "Approved": "warning",
    "Paid": "success",
  };
  return map[status] ?? "neutral";
}

function priorityColor(p: Priority): { bg: string; color: string; border: string } {
  const map: Record<Priority, { bg: string; color: string; border: string }> = {
    Critical: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA"},
    High:     { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA"},
    Medium:   { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A"},
    Low:      { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0"},
  };
  return map[p];
}

function serviceColor(s: ServiceType): string {
  const map: Record<ServiceType, string> = {
    SEO: "#1B4FD8",
    GBP: "#059669",
    PPC: "#7C3AED",
    "Meta Ads": "#0EA5E9",
    LSA: "#F59E0B",
    Reporting: "#64748B",
    Web: "#EC4899",
    Creative: "#F97316",
  };
  return map[s] ?? "#64748B";
}

// KPI calculations
const kpis = {
  approvedProposals: handoffs.filter(h => h.handoffStage === "Proposal Approved").length,
  pendingBillingRequests: handoffs.filter(h => h.handoffStage === "Billing Requested").length,
  invoiceDraftNeeded: handoffs.filter(h => h.handoffStage === "Invoice Draft Needed").length,
  invoicesSent: handoffs.filter(h => h.invoiceStatus === "Sent").length,
  invoicesPaid: handoffs.filter(h => h.invoiceStatus === "Paid").length,
  activationReady: handoffs.filter(h => h.activationStatus === "Ready"|| h.handoffStage === "Ready for Activation").length,
  handoffRevenue: handoffs.reduce((sum, h) => {
    const val = parseFloat(h.monthlyValue.replace(/[$,]/g, ""));
    return sum + (isNaN(val) ? 0 : val);
  }, 0),
  commissionEligible: handoffs.filter(h => h.commissionEligible).length,
};

// 
// Checklist Item Component
// 

function ChecklistItem({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <span
        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold border"style={{
          background: done ? "#ECFDF5": "#F8FAFC",
          borderColor: done ? "#A7F3D0": "#E2E8F0",
          color: done ? "#059669": "#94A3B8",
        }}
      >
        {done ? "": ""}
      </span>
      <span
        className="text-xs font-medium"style={{ color: done ? "var(--rtm-text-primary)": "var(--rtm-text-muted)"}}
      >
        {label}
      </span>
    </div>
  );
}

// 
// Handoff Detail Drawer
// 

function HandoffDetailDrawer({
  handoff,
  onClose,
}: {
  handoff: Handoff;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<
    "overview"| "proposal"| "billing"| "services"| "affiliate"| "activation"| "workflow"| "tasks"| "notes">("overview");

  const tabs = [
    { id: "overview", label: "Overview"},
    { id: "proposal", label: "Proposal"},
    { id: "billing", label: "Billing"},
    { id: "services", label: "Services"},
    ...(handoff.affiliateAttribution ? [{ id: "affiliate", label: "Affiliate"}] : []),
    { id: "activation", label: "Activation"},
    { id: "workflow", label: "Workflow"},
    { id: "tasks", label: "Tasks"},
    { id: "notes", label: "Notes"},
  ] as const;

  return (
    <div
      className="fixed inset-0 z-50 flex"style={{ background: "rgba(15,28,56,0.45)"}}
      onClick={onClose}
    >
      <div
        className="ml-auto flex flex-col w-full max-w-2xl h-full overflow-hidden"style={{
          background: "var(--rtm-surface)",
          boxShadow: "-8px 0 40px rgba(15,28,56,0.18)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          className="flex items-start justify-between gap-4 p-6 border-b"style={{ borderColor: "var(--rtm-border)"}}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-widest"style={{ color: "var(--rtm-blue)"}}>
                {handoff.id}
              </span>
              <StatusBadge variant={stageVariant(handoff.handoffStage)} label={handoff.handoffStage} size="sm"/>
            </div>
            <h2 className="text-lg font-bold truncate"style={{ color: "var(--rtm-text-primary)"}}>
              {handoff.client}
            </h2>
            <p className="text-xs mt-0.5 truncate"style={{ color: "var(--rtm-text-secondary)"}}>
              {handoff.proposal}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity text-lg"style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)"}}
          >
            ×
          </button>
        </div>

        {/* Value Strip */}
        <div
          className="grid grid-cols-3 divide-x"style={{ borderBottom: "1px solid var(--rtm-border)"}}
        >
          {[
            { label: "Deal Value", value: handoff.dealValue },
            { label: "Monthly Value", value: handoff.monthlyValue },
            { label: "Priority", value: handoff.priority },
          ].map(({ label, value }) => (
            <div key={label} className="px-4 py-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5"style={{ color: "var(--rtm-text-muted)"}}>
                {label}
              </p>
              {label === "Priority"? (
                <span
                  className="inline-block text-xs font-bold px-2 py-0.5 rounded-full border"style={priorityColor(handoff.priority)}
                >
                  {value}
                </span>
              ) : (
                <p className="text-sm font-bold"style={{ color: "#059669"}}>{value}</p>
              )}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div
          className="flex gap-0 overflow-x-auto border-b"style={{ borderColor: "var(--rtm-border)"}}
        >
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className="flex-shrink-0 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors"style={{
                borderColor: activeTab === tab.id ? "var(--rtm-blue)": "transparent",
                color: activeTab === tab.id ? "var(--rtm-blue)": "var(--rtm-text-secondary)",
                background: "transparent",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/*  Overview  */}
          {activeTab === "overview"&& (
            <>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Sales Rep", value: handoff.salesRep },
                  { label: "Billing Owner", value: handoff.billingOwner },
                  { label: "Invoice Status", value: handoff.invoiceStatus },
                  { label: "Activation Status", value: handoff.activationStatus },
                  { label: "Affiliate Source", value: handoff.affiliateSource ?? "None"},
                  { label: "Commission Eligible", value: handoff.commissionEligible ? "Yes": "No"},
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg p-3 border"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)"}}>
                    <p className="text-[10px] font-semibold uppercase tracking-wide mb-1"style={{ color: "var(--rtm-text-muted)"}}>{label}</p>
                    <p className="text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg p-4 border"style={{ background: "#FFFBEB", borderColor: "#FDE68A"}}>
                <p className="text-[10px] font-bold uppercase tracking-wide mb-1"style={{ color: "#B45309"}}>Next Required Action</p>
                <p className="text-sm font-semibold"style={{ color: "#92400E"}}>{handoff.nextRequiredAction}</p>
              </div>
              {/* Services Sold Quick View */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide mb-2"style={{ color: "var(--rtm-text-muted)"}}>Services Sold</p>
                <div className="flex flex-wrap gap-1.5">
                  {handoff.servicesSold.map(s => (
                    <span
                      key={s}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-full"style={{ background: serviceColor(s) + "18", color: serviceColor(s), border: `1px solid ${serviceColor(s)}40` }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {/*  Proposal Summary  */}
          {activeTab === "proposal"&& (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Proposal Name", value: handoff.proposalSummary.proposalName },
                  { label: "Status", value: handoff.proposalSummary.proposalStatus },
                  { label: "Approved Date", value: handoff.proposalSummary.approvedDate },
                  { label: "Approved By", value: handoff.proposalSummary.approvedBy },
                  { label: "Deal Value", value: handoff.proposalSummary.dealValue },
                  { label: "Monthly Value", value: handoff.proposalSummary.monthlyValue },
                  { label: "Contract Term", value: handoff.proposalSummary.contractTerm },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg p-3 border"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)"}}>
                    <p className="text-[10px] font-semibold uppercase tracking-wide mb-1"style={{ color: "var(--rtm-text-muted)"}}>{label}</p>
                    <p className="text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{value}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide mb-2"style={{ color: "var(--rtm-text-muted)"}}>Services Included</p>
                <div className="flex flex-wrap gap-1.5">
                  {handoff.proposalSummary.servicesIncluded.map(s => (
                    <span key={s} className="text-[11px] font-bold px-2.5 py-1 rounded-full"style={{ background: serviceColor(s as ServiceType) + "18", color: serviceColor(s as ServiceType), border: `1px solid ${serviceColor(s as ServiceType)}40` }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              {handoff.proposalSummary.specialBillingNotes && (
                <div className="rounded-lg p-3 border"style={{ background: "#EFF6FF", borderColor: "#BFDBFE"}}>
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-1"style={{ color: "var(--rtm-blue)"}}>Special Billing Notes</p>
                  <p className="text-xs"style={{ color: "var(--rtm-text-primary)"}}>{handoff.proposalSummary.specialBillingNotes}</p>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-opacity hover:opacity-80"style={{ background: "var(--rtm-blue)", color: "#fff", borderColor: "var(--rtm-blue)"}}>
                  Review Proposal
                </button>
                <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-opacity hover:opacity-80"style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-primary)", borderColor: "var(--rtm-border)"}}>
                  Open Client
                </button>
              </div>
            </div>
          )}

          {/*  Billing Requirements  */}
          {activeTab === "billing"&& (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Billing Contact", value: handoff.billingRequirements.billingContact },
                  { label: "Billing Email", value: handoff.billingRequirements.billingEmail },
                  { label: "Billing Terms", value: handoff.billingRequirements.billingTerms },
                  { label: "Invoice Type", value: handoff.billingRequirements.invoiceType },
                  { label: "Billing Start Date", value: handoff.billingRequirements.billingStartDate },
                  { label: "Payment Method", value: handoff.billingRequirements.paymentMethodStatus },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg p-3 border"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)"}}>
                    <p className="text-[10px] font-semibold uppercase tracking-wide mb-1"style={{ color: "var(--rtm-text-muted)"}}>{label}</p>
                    <p className="text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg p-3 border"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)"}}>
                <p className="text-[10px] font-semibold uppercase tracking-wide mb-1"style={{ color: "var(--rtm-text-muted)"}}>Tax / Setup Fee Notes</p>
                <p className="text-xs"style={{ color: "var(--rtm-text-primary)"}}>{handoff.billingRequirements.taxSetupFeeNotes}</p>
              </div>
              <div className="rounded-lg p-3 border"style={{
                background: handoff.billingRequirements.finalApprovalStatus === "Approved"? "#ECFDF5": "#FEF2F2",
                borderColor: handoff.billingRequirements.finalApprovalStatus === "Approved"? "#A7F3D0": "#FECACA",
              }}>
                <p className="text-[10px] font-bold uppercase tracking-wide mb-1"style={{
                  color: handoff.billingRequirements.finalApprovalStatus === "Approved"? "#059669": "#DC2626"}}>Final Approval Status</p>
                <p className="text-xs font-semibold"style={{
                  color: handoff.billingRequirements.finalApprovalStatus === "Approved"? "#065F46": "#991B1B"}}>{handoff.billingRequirements.finalApprovalStatus}</p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { label: "Request Invoice", color: "var(--rtm-blue)"},
                  { label: "Create Billing Task", color: "#7C3AED"},
                  { label: "Send Billing Notes", color: "#059669"},
                ].map(({ label, color }) => (
                  <button key={label} className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"style={{ background: color, color: "#fff"}}>
                    {label}
                  </button>
                ))}
                <Link href="/billing/invoices" className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80 inline-flex items-center gap-1" style={{ background: "var(--rtm-surface)", color: "var(--rtm-blue)", border: "1px solid var(--rtm-border)" }}>
                  → Billing Invoices
                </Link>
              </div>
            </div>
          )}

          {/*  Services Sold  */}
          {activeTab === "services"&& (
            <div className="space-y-3">
              {handoff.servicesSoldDetail.map(svc => (
                <div key={svc.service} className="rounded-xl border p-4"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)"}}>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"style={{ background: serviceColor(svc.service) + "18", color: serviceColor(svc.service), border: `1px solid ${serviceColor(svc.service)}40` }}
                    >
                      {svc.service}
                    </span>
                    <span className="text-sm font-bold"style={{ color: "#059669"}}>{svc.monthlyValue}/mo</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Setup Fee", value: svc.setupFee },
                      { label: "Start Date", value: svc.startDate },
                      { label: "Dept. Activation", value: svc.departmentNeeded },
                      { label: "Owner Dept.", value: svc.ownerDepartment },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-[10px] font-semibold uppercase tracking-wide"style={{ color: "var(--rtm-text-muted)"}}>{label}</p>
                        <p className="text-[11px] font-semibold mt-0.5"style={{ color: "var(--rtm-text-primary)"}}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/*  Affiliate Attribution  */}
          {activeTab === "affiliate"&& handoff.affiliateAttribution && (
            <div className="space-y-4">
              <div
                className="flex items-center gap-3 rounded-xl p-4 border"style={{ background: "#ECFDF5", borderColor: "#A7F3D0"}}
              >
                
                <div>
                  <p className="text-sm font-bold"style={{ color: "#065F46"}}>{handoff.affiliateAttribution.affiliateName}</p>
                  <p className="text-xs"style={{ color: "#059669"}}>{handoff.affiliateAttribution.referralSource}</p>
                </div>
                <div className="ml-auto">
                  <StatusBadge variant={commissionVariant(handoff.affiliateAttribution.commissionStatus)} label={handoff.affiliateAttribution.commissionStatus} size="sm"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Referral Code", value: handoff.affiliateAttribution.referralCode },
                  { label: "Commission Model", value: handoff.affiliateAttribution.commissionModel },
                  { label: "Potential Commission", value: handoff.affiliateAttribution.potentialCommission },
                  { label: "Commission Status", value: handoff.affiliateAttribution.commissionStatus },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg p-3 border"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)"}}>
                    <p className="text-[10px] font-semibold uppercase tracking-wide mb-1"style={{ color: "var(--rtm-text-muted)"}}>{label}</p>
                    <p className="text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{value}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Link href="/sales/affiliates" className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80 inline-flex items-center gap-1" style={{ background: "#059669", color: "#fff" }}>
                  View Affiliate
                </Link>
                <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-opacity hover:opacity-80"style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-primary)", borderColor: "var(--rtm-border)"}}>
                  Review Commission
                </button>
              </div>
            </div>
          )}

          {/*  Activation Readiness  */}
          {activeTab === "activation"&& (
            <div className="space-y-4">
              <div className="rounded-xl border overflow-hidden"style={{ borderColor: "var(--rtm-border)"}}>
                <div className="px-4 py-3 border-b"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)"}}>
                  <p className="text-xs font-bold uppercase tracking-wide"style={{ color: "var(--rtm-text-muted)"}}>Activation Checklist</p>
                </div>
                <div className="px-4 py-2">
                  {[
                    { key: "proposalApproved", label: "Proposal Approved"},
                    { key: "billingRequestCreated", label: "Billing Request Created"},
                    { key: "invoiceCreated", label: "Invoice Created"},
                    { key: "invoiceSent", label: "Invoice Sent"},
                    { key: "invoicePaid", label: "Invoice Paid"},
                    { key: "clientRecordCreated", label: "Client Record Created"},
                    { key: "servicesConfirmed", label: "Services Confirmed"},
                    { key: "activationTasksReady", label: "Activation Tasks Ready"},
                  ].map(({ key, label }) => (
                    <ChecklistItem key={key} label={label} done={handoff.activationChecklist[key as keyof ActivationChecklist]} />
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"style={{ background: "var(--rtm-blue)", color: "#fff"}}>
                  Push to Billing
                </button>
                <button className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"style={{ background: "#059669", color: "#fff"}}>
                  Push to Activation
                </button>
                <Link href="/billing/activation" className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80 inline-flex items-center gap-1" style={{ background: "var(--rtm-surface)", color: "var(--rtm-blue)", border: "1px solid var(--rtm-border)" }}>
                  Open Billing Activation →
                </Link>
              </div>
            </div>
          )}

          {/*  Workflow  */}
          {activeTab === "workflow"&& (
            <div className="space-y-4">
              <div className="rounded-xl border overflow-hidden"style={{ borderColor: "var(--rtm-border)"}}>
                <div className="px-4 py-3 border-b"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)"}}>
                  <p className="text-xs font-bold uppercase tracking-wide"style={{ color: "var(--rtm-text-muted)"}}>Workflow Timeline</p>
                </div>
                <div className="p-4 space-y-0">
                  {[
                    "Proposal Approved",
                    "Billing Requested",
                    "Invoice Created",
                    "Invoice Sent",
                    "Invoice Paid",
                    "Ready for Activation",
                    "Account Management Onboarding",
                  ].map((step, idx, arr) => {
                    const isActive = handoff.workflowStep === step;
                    const isPast = arr.indexOf(handoff.workflowStep) > idx;
                    return (
                      <div key={step} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <span
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border-2 flex-shrink-0"style={{
                              background: isActive ? "var(--rtm-blue)": isPast ? "#ECFDF5": "var(--rtm-bg)",
                              borderColor: isActive ? "var(--rtm-blue)": isPast ? "#A7F3D0": "var(--rtm-border)",
                              color: isActive ? "#fff": isPast ? "#059669": "var(--rtm-text-muted)",
                            }}
                          >
                            {isPast ? "": idx + 1}
                          </span>
                          {idx < arr.length - 1 && (
                            <div className="w-0.5 h-6 my-0.5"style={{ background: isPast ? "#A7F3D0": "var(--rtm-border)"}} />
                          )}
                        </div>
                        <div className="pt-1 pb-5 last:pb-0 min-w-0">
                          <p
                            className="text-xs font-semibold"style={{
                              color: isActive ? "var(--rtm-blue)": isPast ? "var(--rtm-text-primary)": "var(--rtm-text-muted)",
                              fontWeight: isActive ? 700 : 600,
                            }}
                          >
                            {step}
                          </p>
                          {isActive && (
                            <p className="text-[11px] mt-0.5"style={{ color: "var(--rtm-blue)"}}>Current step</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <Link
                href="/admin/workflows"className="inline-flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-80"style={{ color: "var(--rtm-blue)"}}
              >
                Open Workflow Engine →
              </Link>
            </div>
          )}

          {/*  Tasks  */}
          {activeTab === "tasks"&& (
            <div className="space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wide"style={{ color: "var(--rtm-text-muted)"}}>Active Tasks</p>
              {handoff.tasks.length === 0 ? (
                <p className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>No active tasks.</p>
              ) : (
                handoff.tasks.map((task, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg p-3 border"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)"}}>
                    <span className="w-5 h-5 rounded flex items-center justify-center text-[11px] flex-shrink-0"style={{ background: "#EFF6FF", color: "var(--rtm-blue)"}}></span>
                    <p className="text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{task}</p>
                    <button className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded"style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)"}}>View</button>
                  </div>
                ))
              )}
              <Link href="/tasks" className="inline-flex items-center gap-1 text-xs font-semibold mt-2 transition-opacity hover:opacity-80" style={{ color: "var(--rtm-blue)" }}>
                Open Tasks Center →
              </Link>
            </div>
          )}

          {/*  Notes  */}
          {activeTab === "notes"&& (
            <div className="space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wide"style={{ color: "var(--rtm-text-muted)"}}>Handoff Notes</p>
              {handoff.notes.map((note, i) => (
                <div key={i} className="rounded-lg p-3 border text-xs"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)"}}>
                  {note}
                </div>
              ))}
              <div className="mt-3">
                <textarea
                  rows={3}
                  placeholder="Add a note..."className="w-full text-xs rounded-lg border px-3 py-2 resize-none"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)"}}
                />
                <button className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"style={{ background: "var(--rtm-blue)", color: "#fff"}}>
                  Add Note
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div
          className="flex flex-wrap gap-2 px-6 py-4 border-t"style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)"}}
        >
          <button className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"style={{ background: "var(--rtm-blue)", color: "#fff"}}>
            Send to Billing
          </button>
          <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-opacity hover:opacity-80"style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-primary)", borderColor: "var(--rtm-border)"}}>
            Create Billing Task
          </button>
          <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-opacity hover:opacity-80"style={{ background: "var(--rtm-surface)", color: "#059669", borderColor: "#A7F3D0"}}>
            Push to Activation
          </button>
          <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-opacity hover:opacity-80"style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-primary)", borderColor: "var(--rtm-border)"}}>
            Open Workflow
          </button>
        </div>
      </div>
    </div>
  );
}

// 
// Table Columns
// 

function buildColumns(onView: (h: Handoff) => void): Column<Handoff>[] {
  return [
    {
      key: "client",
      header: "Client",
      width: "160px",
      render: (v, row) => (
        <div>
          <p className="text-xs font-bold"style={{ color: "var(--rtm-text-primary)"}}>{String(v)}</p>
          <p className="text-[10px] mt-0.5 truncate max-w-[140px]"style={{ color: "var(--rtm-text-muted)"}}>{row.id as string}</p>
        </div>
      ),
    },
    {
      key: "salesRep",
      header: "Sales Rep",
      width: "110px",
      render: v => <span className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{String(v)}</span>,
    },
    {
      key: "billingOwner",
      header: "Billing Owner",
      width: "110px",
      render: v => <span className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{String(v)}</span>,
    },
    {
      key: "handoffStage",
      header: "Stage",
      width: "160px",
      render: v => <StatusBadge variant={stageVariant(v as HandoffStage)} label={String(v)} size="sm"/>,
    },
    {
      key: "dealValue",
      header: "Deal Value",
      width: "90px",
      render: v => <span className="text-xs font-bold"style={{ color: "var(--rtm-text-primary)"}}>{String(v)}</span>,
    },
    {
      key: "monthlyValue",
      header: "MRR",
      width: "80px",
      render: v => <span className="text-xs font-semibold"style={{ color: "#059669"}}>{String(v)}</span>,
    },
    {
      key: "servicesSold",
      header: "Services",
      width: "200px",
      render: v => (
        <div className="flex flex-wrap gap-1">
          {(v as ServiceType[]).slice(0, 4).map(s => (
            <span key={s} className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"style={{ background: serviceColor(s) + "18", color: serviceColor(s) }}>{s}</span>
          ))}
          {(v as ServiceType[]).length > 4 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"style={{ background: "#F1F5F9", color: "#64748B"}}>+{(v as ServiceType[]).length - 4}</span>
          )}
        </div>
      ),
    },
    {
      key: "invoiceStatus",
      header: "Invoice",
      width: "100px",
      render: v => <StatusBadge variant={invoiceVariant(v as InvoiceStatus)} label={String(v)} size="sm"/>,
    },
    {
      key: "activationStatus",
      header: "Activation",
      width: "130px",
      render: v => <StatusBadge variant={activationVariant(v as ActivationStatus)} label={String(v)} size="sm"/>,
    },
    {
      key: "affiliateSource",
      header: "Affiliate",
      width: "110px",
      render: v => v ? (
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"style={{ background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0"}}>{String(v)}</span>
      ) : (
        <span className="text-[11px]"style={{ color: "var(--rtm-text-muted)"}}>—</span>
      ),
    },
    {
      key: "commissionEligible",
      header: "Commission",
      width: "100px",
      render: v => v ? (
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"style={{ background: "#FFFBEB", color: "#B45309", border: "1px solid #FDE68A"}}>Eligible</span>
      ) : (
        <span className="text-[11px]"style={{ color: "var(--rtm-text-muted)"}}>—</span>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      width: "80px",
      render: v => {
        const pc = priorityColor(v as Priority);
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border"style={pc}>{String(v)}</span>;
      },
    },
    {
      key: "nextRequiredAction",
      header: "Next Action",
      width: "220px",
      render: v => <span className="text-[11px]"style={{ color: "var(--rtm-text-secondary)"}}>{String(v)}</span>,
    },
    {
      key: "id",
      header: "Actions",
      width: "100px",
      render: (_v, row) => (
        <div className="flex gap-1">
          <button
            onClick={() => onView(row as unknown as Handoff)}
            className="text-[10px] font-bold px-2 py-1 rounded transition-opacity hover:opacity-80"style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)"}}
          >
            View
          </button>
          <button
            className="text-[10px] font-bold px-2 py-1 rounded transition-opacity hover:opacity-80"style={{ background: "#ECFDF5", color: "#059669"}}
          >
            Act
          </button>
        </div>
      ),
    },
  ];
}

// 
// Pipeline View
// 

function PipelineView({ data, onSelect }: { data: Handoff[]; onSelect: (h: Handoff) => void }) {
  const stageCounts = stageOrder.map(stage => ({
    stage,
    count: data.filter(h => h.handoffStage === stage).length,
    revenue: data
      .filter(h => h.handoffStage === stage)
      .reduce((sum, h) => sum + parseFloat(h.monthlyValue.replace(/[$,]/g, "") || "0"), 0),
  }));

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-3 min-w-max">
        {stageCounts.map(({ stage, count, revenue }) => (
          <div
            key={stage}
            className="w-48 rounded-xl border overflow-hidden flex-shrink-0"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}
          >
            <div
              className="px-3 py-2.5 border-b"style={{
                background: stageVariant(stage) === "error"? "#FEF2F2": stageVariant(stage) === "success"? "#ECFDF5": stageVariant(stage) === "warning"? "#FFFBEB": "var(--rtm-bg)",
                borderColor: "var(--rtm-border)",
              }}
            >
              <StatusBadge variant={stageVariant(stage)} label={stage} size="sm"/>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-lg font-bold"style={{ color: "var(--rtm-text-primary)"}}>{count}</span>
                {revenue > 0 && (
                  <span className="text-[10px] font-semibold"style={{ color: "#059669"}}>${revenue.toLocaleString()}/mo</span>
                )}
              </div>
            </div>
            <div className="px-2 py-2 space-y-1.5 max-h-48 overflow-y-auto">
              {data
                .filter(h => h.handoffStage === stage)
                .map(h => (
                  <button
                    key={h.id}
                    onClick={() => onSelect(h)}
                    className="w-full text-left rounded-lg px-2.5 py-2 border transition-shadow hover:shadow-sm"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)"}}
                  >
                    <p className="text-[11px] font-semibold truncate"style={{ color: "var(--rtm-text-primary)"}}>{h.client}</p>
                    <p className="text-[10px] mt-0.5"style={{ color: "#059669"}}>{h.monthlyValue}/mo</p>
                  </button>
                ))}
              {count === 0 && (
                <p className="text-[10px] text-center py-2"style={{ color: "var(--rtm-text-muted)"}}>Empty</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 
// Notification & Workflow Integration Panels
// 

function NotificationsPanel() {
  const notifications = [
    { type: "Proposal Approved", client: "Ironside Fitness", time: "2m ago", variant: "success"as StatusVariant },
    { type: "Billing Request Created", client: "Harbor View Chiropractic", time: "18m ago", variant: "info"as StatusVariant },
    { type: "Invoice Sent", client: "Northgate Veterinary", time: "1h ago", variant: "warning"as StatusVariant },
    { type: "Invoice Paid", client: "Green Thumb Gardens", time: "2h ago", variant: "success"as StatusVariant },
    { type: "Activation Ready", client: "Highline Legal Group", time: "3h ago", variant: "success"as StatusVariant },
    { type: "Affiliate Commission Eligible", client: "Summit Landscaping", time: "4h ago", variant: "pending"as StatusVariant },
    { type: "Handoff Blocked", client: "Clearwater Plumbing", time: "5h ago", variant: "error"as StatusVariant },
  ];

  return (
    <div className="space-y-2">
      {notifications.map((n, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2.5 border"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)"}}>
          <StatusBadge variant={n.variant} label={n.type} size="sm"/>
          <span className="text-xs font-semibold flex-1 truncate"style={{ color: "var(--rtm-text-primary)"}}>{n.client}</span>
          <span className="text-[10px] flex-shrink-0"style={{ color: "var(--rtm-text-muted)"}}>{n.time}</span>
        </div>
      ))}
      <Link href="/notifications" className="inline-flex items-center gap-1 text-xs font-semibold mt-1 transition-opacity hover:opacity-80" style={{ color: "var(--rtm-blue)" }}>
        View All Notifications →
      </Link>
    </div>
  );
}

function WorkflowPanel() {
  const steps = [
    { step: "Proposal Approved", count: handoffs.filter(h => h.handoffStage === "Proposal Approved").length },
    { step: "Billing Requested", count: handoffs.filter(h => h.handoffStage === "Billing Requested").length },
    { step: "Invoice Created", count: handoffs.filter(h => h.handoffStage === "Invoice Created").length },
    { step: "Invoice Sent", count: handoffs.filter(h => h.handoffStage === "Invoice Sent").length },
    { step: "Invoice Paid", count: handoffs.filter(h => h.handoffStage === "Invoice Paid").length },
    { step: "Ready for Activation", count: handoffs.filter(h => h.handoffStage === "Ready for Activation").length },
    { step: "Account Management Onboarding", count: handoffs.filter(h => h.handoffStage === "Closed").length },
  ];

  return (
    <div className="space-y-2">
      {steps.map(({ step, count }, idx) => (
        <div key={step} className="flex items-center gap-3">
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"style={{
              background: count > 0 ? "var(--rtm-blue)": "var(--rtm-bg)",
              color: count > 0 ? "#fff": "var(--rtm-text-muted)",
              border: `1.5px solid ${count > 0 ? "var(--rtm-blue)": "var(--rtm-border)"}`,
            }}
          >
            {idx + 1}
          </span>
          <span className="text-xs font-medium flex-1"style={{ color: "var(--rtm-text-primary)"}}>{step}</span>
          {count > 0 && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)"}}>
              {count}
            </span>
          )}
        </div>
      ))}
      <Link href="/admin/workflows" className="inline-flex items-center gap-1 text-xs font-semibold mt-2 transition-opacity hover:opacity-80" style={{ color: "var(--rtm-blue)" }}>
        Open Workflow Engine →
      </Link>
    </div>
  );
}

// 
// Main Page
// 

export default function HandoffsPage() {
  const [selectedHandoff, setSelectedHandoff] = useState<Handoff | null>(null);
  const [activeView, setActiveView] = useState<"table"| "pipeline">("table");
  const [stageFilter, setStageFilter] = useState<HandoffStage | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = handoffs.filter(h => {
    const matchesStage = stageFilter === "All"|| h.handoffStage === stageFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      h.client.toLowerCase().includes(q) ||
      h.salesRep.toLowerCase().includes(q) ||
      h.proposal.toLowerCase().includes(q);
    return matchesStage && matchesSearch;
  });

  const columns = buildColumns(setSelectedHandoff);

  return (
    <div className="min-h-screen"style={{ background: "var(--rtm-bg)"}}>
      <div className="max-w-screen-2xl mx-auto px-6 py-6 space-y-6">
        {/*  Page Header  */}
        <PageHeader
          breadcrumb="Sales"title="Sales Handoff Center"description="Manage approved proposals, billing requests, invoice readiness, activation readiness, and revenue handoff from Sales to Billing."actions={
            <div className="flex flex-wrap gap-2">
              {[
                { label: "New Handoff", color: "var(--rtm-blue)", bg: "var(--rtm-blue)"},
                { label: "Send to Billing", color: "#059669", bg: "#059669"},
                { label: "Export Handoffs", color: "var(--rtm-text-primary)", bg: "var(--rtm-surface)"},
                { label: "Sync Billing Status", color: "var(--rtm-text-primary)", bg: "var(--rtm-surface)"},
              ].map(({ label, color, bg }) => (
                <button
                  key={label}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-opacity hover:opacity-80"style={{ background: bg, color: bg === "var(--rtm-surface)"? color : "#fff", borderColor: bg === "var(--rtm-surface)"? "var(--rtm-border)": bg }}
                >
                  {label}
                </button>
              ))}
              <Link
                href="/sales/proposals"className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-opacity hover:opacity-80 inline-flex items-center gap-1"style={{ background: "var(--rtm-surface)", color: "var(--rtm-blue)", borderColor: "var(--rtm-border)"}}
              >
                View Approved Proposals
              </Link>
            </div>
          }
        />

        {/*  KPI Cards  */}
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
          {[
            { title: "Approved Proposals", value: String(kpis.approvedProposals), iconBg: "#EFF6FF", accentColor: "var(--rtm-blue)"},
            { title: "Pending Billing Requests", value: String(kpis.pendingBillingRequests), iconBg: "#FFFBEB", accentColor: "#B45309"},
            { title: "Invoice Draft Needed", value: String(kpis.invoiceDraftNeeded), iconBg: "#FEF2F2", accentColor: "#DC2626"},
            { title: "Invoices Sent", value: String(kpis.invoicesSent), icon: "", iconBg: "#EFF6FF", accentColor: "#3B82F6"},
            { title: "Invoices Paid", value: String(kpis.invoicesPaid), iconBg: "#ECFDF5", accentColor: "#059669"},
            { title: "Activation Ready", value: String(kpis.activationReady), iconBg: "#ECFDF5", accentColor: "#059669"},
            { title: "Handoff Revenue", value: `$${kpis.handoffRevenue.toLocaleString()}/mo`, iconBg: "#ECFDF5", accentColor: "#059669"},
            { title: "Affiliate Commission", value: String(kpis.commissionEligible), iconBg: "#FFFBEB", accentColor: "#B45309"},
          ].map(kpi => (
            <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} icon={<span>{kpi.icon}</span>} iconBg={kpi.iconBg} />
          ))}
        </div>

        {/*  View Switcher + Filter Bar  */}
        <SectionWrapper title="Handoff Pipeline &amp; Queue">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            {/* View Toggle */}
            <div className="flex rounded-lg border overflow-hidden"style={{ borderColor: "var(--rtm-border)"}}>
              {(["table", "pipeline"] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setActiveView(v)}
                  className="px-4 py-2 text-xs font-semibold capitalize transition-colors"style={{
                    background: activeView === v ? "var(--rtm-blue)": "var(--rtm-surface)",
                    color: activeView === v ? "#fff": "var(--rtm-text-secondary)",
                  }}
                >
                  {v === "table"? "Queue Table": "Pipeline Board"}
                </button>
              ))}
            </div>

            {/* Stage Filter */}
            <select
              value={stageFilter}
              onChange={e => setStageFilter(e.target.value as HandoffStage | "All")}
              className="text-xs font-semibold px-3 py-2 rounded-lg border"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)"}}
            >
              <option value="All">All Stages</option>
              {stageOrder.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Search */}
            <input
              type="text"placeholder="Search client, rep, proposal…"value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="text-xs px-3 py-2 rounded-lg border flex-1 min-w-[200px] max-w-xs"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)"}}
            />

            <span className="text-xs ml-auto"style={{ color: "var(--rtm-text-muted)"}}>
              {filtered.length} handoff{filtered.length !== 1 ? "s": ""}
            </span>
          </div>

          {/* Pipeline Board */}
          {activeView === "pipeline"&& (
            <PipelineView data={filtered} onSelect={setSelectedHandoff} />
          )}

          {/* Queue Table */}
          {activeView === "table"&& (
            <DataTable<Handoff> columns={columns} data={filtered} />
          )}
        </SectionWrapper>

        {/*  Bottom Grid: Notifications + Workflow  */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SectionWrapper title="Notifications">
            <NotificationsPanel />
          </SectionWrapper>
          <SectionWrapper title="Workflow Engine">
            <WorkflowPanel />
          </SectionWrapper>
        </div>

        {/*  Quick Links  */}
        <SectionWrapper title="Quick Links">
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Billing Invoices", href: "/billing/invoices", color: "var(--rtm-blue)"},
              { label: "Billing Activation", href: "/billing/activation", color: "#059669"},
              { label: "Proposals", href: "/sales/proposals", color: "#7C3AED"},
              { label: "Affiliates", href: "/sales/affiliates", color: "#059669"},
              { label: "Tasks", href: "/tasks", color: "#F59E0B"},
              { label: "Notifications", href: "/notifications", color: "#0EA5E9"},
              { label: "Workflow Engine", href: "/admin/workflows", color: "#64748B"},
              { label: "Client Portfolio", href: "/sales/leads", color: "#EC4899"},
            ].map(({ label, href, color }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-opacity hover:opacity-80"style={{ background: color + "12", color, borderColor: color + "30"}}
              >
                {label} →
              </Link>
            ))}
          </div>
        </SectionWrapper>
      </div>

      {/*  Detail Drawer  */}
      {selectedHandoff && (
        <HandoffDetailDrawer handoff={selectedHandoff} onClose={() => setSelectedHandoff(null)} />
      )}
    </div>
  );
}