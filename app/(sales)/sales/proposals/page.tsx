"use client";

import React, { useState } from "react";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ProposalStage =
  | "Draft"
  | "Internal Review"
  | "Ready to Send"
  | "Sent"
  | "Viewed"
  | "Negotiation"
  | "Approved"
  | "Rejected"
  | "Pushed to Handoff";

type Priority = "Low" | "Medium" | "High" | "Urgent";

type CommissionStatus =
  | "Not Eligible"
  | "Pending Approval"
  | "Eligible After Invoice Paid"
  | "Approved"
  | "Paid";

interface ServiceLine {
  name: string;
  included: boolean;
  monthlyValue: number;
  setupFee: number;
  department: string;
  launchRequired: boolean;
}

interface PricingSummary {
  setupFee: number;
  monthlyRecurring: number;
  contractTermMonths: number;
  totalContractValue: number;
  discount: number;
  finalApprovedValue: number;
  paymentTerms: string;
}

interface AffiliateInfo {
  name: string;
  referralCode: string;
  commissionModel: string;
  potentialCommission: number;
  status: CommissionStatus;
}

interface ChecklistItem {
  label: string;
  checked: boolean;
}

interface HandoffReadiness {
  proposalApproved: boolean;
  contractSigned: boolean;
  servicesConfirmed: boolean;
  contractValueConfirmed: boolean;
  setupFeeConfirmed: boolean;
  billingNotesAdded: boolean;
  billingContactConfirmed: boolean;
  readyToSendToBilling: boolean;
}

interface TimelineEvent {
  date: string;
  event: string;
  actor: string;
}

interface Proposal {
  id: string;
  name: string;
  client: string;
  leadSource: string;
  salesRep: string;
  stage: ProposalStage;
  dealValue: number;
  monthlyValue: number;
  services: ServiceLine[];
  affiliate: AffiliateInfo | null;
  sentDate: string | null;
  lastActivity: string;
  priority: Priority;
  pricing: PricingSummary;
  approvalChecklist: ChecklistItem[];
  handoffReadiness: HandoffReadiness;
  timeline: TimelineEvent[];
  auditFindings: string;
  negotiationNotes: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data — 25 Proposals
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_PROPOSALS: Proposal[] = [
  {
    id: "prop-001",
    name: "Summit Landscaping – Full SEO Growth",
    client: "Summit Landscaping",
    leadSource: "Affiliate",
    salesRep: "Jordan M.",
    stage: "Negotiation",
    dealValue: 28800,
    monthlyValue: 2400,
    sentDate: "Jun 2, 2025",
    lastActivity: "Jun 8, 2025",
    priority: "High",
    auditFindings: "14 technical SEO issues, 32 keyword gaps, low GBP activity.",
    negotiationNotes: "Client wants to reduce setup fee. Considering $500 reduction.",
    affiliate: { name: "Brandon Ellis", referralCode: "BE-2024", commissionModel: "10% MRR for 12 months", potentialCommission: 2880, status: "Pending Approval" },
    pricing: { setupFee: 1500, monthlyRecurring: 2400, contractTermMonths: 12, totalContractValue: 30300, discount: 500, finalApprovedValue: 29800, paymentTerms: "Net 30" },
    services: [
      { name: "SEO", included: true, monthlyValue: 1200, setupFee: 500, department: "SEO & Local", launchRequired: true },
      { name: "GBP", included: true, monthlyValue: 500, setupFee: 250, department: "SEO & Local", launchRequired: false },
      { name: "PPC", included: false, monthlyValue: 0, setupFee: 0, department: "Paid Ads", launchRequired: false },
      { name: "Meta Ads", included: false, monthlyValue: 0, setupFee: 0, department: "Paid Ads", launchRequired: false },
      { name: "LSA", included: false, monthlyValue: 0, setupFee: 0, department: "LSA", launchRequired: false },
      { name: "Reporting", included: true, monthlyValue: 200, setupFee: 0, department: "Analytics", launchRequired: false },
      { name: "Web", included: false, monthlyValue: 0, setupFee: 0, department: "Web Dev", launchRequired: false },
      { name: "Creative", included: true, monthlyValue: 500, setupFee: 750, department: "Creative", launchRequired: false },
    ],
    approvalChecklist: [
      { label: "Pricing confirmed", checked: true },
      { label: "Services confirmed", checked: true },
      { label: "Contract term confirmed", checked: true },
      { label: "Decision maker confirmed", checked: true },
      { label: "Internal review complete", checked: true },
      { label: "Client approved", checked: false },
      { label: "Billing notes added", checked: false },
      { label: "Ready for handoff", checked: false },
    ],
    handoffReadiness: { proposalApproved: false, contractSigned: false, servicesConfirmed: true, contractValueConfirmed: true, setupFeeConfirmed: true, billingNotesAdded: false, billingContactConfirmed: false, readyToSendToBilling: false },
    timeline: [
      { date: "May 20", event: "Audit completed", actor: "Jamie T." },
      { date: "May 24", event: "Proposal drafted", actor: "Jordan M." },
      { date: "May 28", event: "Internal review passed", actor: "Mike T." },
      { date: "Jun 2", event: "Proposal sent", actor: "Jordan M." },
      { date: "Jun 5", event: "Proposal viewed", actor: "System" },
      { date: "Jun 8", event: "Negotiation started", actor: "Jordan M." },
    ],
  },
  {
    id: "prop-002",
    name: "Metro Dental – Local Domination Package",
    client: "Metro Dental Group",
    leadSource: "Affiliate",
    salesRep: "Jordan M.",
    stage: "Approved",
    dealValue: 54000,
    monthlyValue: 4500,
    sentDate: "May 25, 2025",
    lastActivity: "Jun 6, 2025",
    priority: "Urgent",
    auditFindings: "Poor GBP score, Yelp filtered reviews, low organic rankings.",
    negotiationNotes: "Client signed off on full package with no changes.",
    affiliate: { name: "Maria Santos", referralCode: "MS-AFG", commissionModel: "10% MRR for 12 months", potentialCommission: 5400, status: "Eligible After Invoice Paid" },
    pricing: { setupFee: 2500, monthlyRecurring: 4500, contractTermMonths: 12, totalContractValue: 56500, discount: 0, finalApprovedValue: 56500, paymentTerms: "Net 15" },
    services: [
      { name: "SEO", included: true, monthlyValue: 1800, setupFee: 800, department: "SEO & Local", launchRequired: true },
      { name: "GBP", included: true, monthlyValue: 600, setupFee: 300, department: "SEO & Local", launchRequired: false },
      { name: "PPC", included: false, monthlyValue: 0, setupFee: 0, department: "Paid Ads", launchRequired: false },
      { name: "Meta Ads", included: false, monthlyValue: 0, setupFee: 0, department: "Paid Ads", launchRequired: false },
      { name: "LSA", included: true, monthlyValue: 800, setupFee: 400, department: "LSA", launchRequired: true },
      { name: "Reporting", included: true, monthlyValue: 300, setupFee: 0, department: "Analytics", launchRequired: false },
      { name: "Web", included: false, monthlyValue: 0, setupFee: 0, department: "Web Dev", launchRequired: false },
      { name: "Creative", included: true, monthlyValue: 1000, setupFee: 1000, department: "Creative", launchRequired: false },
    ],
    approvalChecklist: [
      { label: "Pricing confirmed", checked: true },
      { label: "Services confirmed", checked: true },
      { label: "Contract term confirmed", checked: true },
      { label: "Decision maker confirmed", checked: true },
      { label: "Internal review complete", checked: true },
      { label: "Client approved", checked: true },
      { label: "Billing notes added", checked: true },
      { label: "Ready for handoff", checked: false },
    ],
    handoffReadiness: { proposalApproved: true, contractSigned: true, servicesConfirmed: true, contractValueConfirmed: true, setupFeeConfirmed: true, billingNotesAdded: true, billingContactConfirmed: false, readyToSendToBilling: false },
    timeline: [
      { date: "May 15", event: "Audit completed", actor: "Riley D." },
      { date: "May 18", event: "Proposal drafted", actor: "Jordan M." },
      { date: "May 22", event: "Internal review passed", actor: "Director" },
      { date: "May 25", event: "Proposal sent", actor: "Jordan M." },
      { date: "May 28", event: "Proposal viewed by client", actor: "System" },
      { date: "Jun 2", event: "Negotiation started", actor: "Jordan M." },
      { date: "Jun 6", event: "Proposal approved by client", actor: "Jordan M." },
    ],
  },
  {
    id: "prop-003",
    name: "Apex Dental – Full Service Package",
    client: "Apex Dental Partners",
    leadSource: "Affiliate",
    salesRep: "Mike T.",
    stage: "Sent",
    dealValue: 96000,
    monthlyValue: 8000,
    sentDate: "Jun 3, 2025",
    lastActivity: "Jun 3, 2025",
    priority: "High",
    auditFindings: "Complete audit across all digital channels. Major website conversion issues found.",
    negotiationNotes: "",
    affiliate: { name: "Tyler Nguyen", referralCode: "TN-VIP", commissionModel: "8% MRR for 12 months", potentialCommission: 7680, status: "Pending Approval" },
    pricing: { setupFee: 4000, monthlyRecurring: 8000, contractTermMonths: 12, totalContractValue: 100000, discount: 0, finalApprovedValue: 100000, paymentTerms: "Net 30" },
    services: [
      { name: "SEO", included: true, monthlyValue: 2000, setupFee: 800, department: "SEO & Local", launchRequired: true },
      { name: "GBP", included: true, monthlyValue: 600, setupFee: 300, department: "SEO & Local", launchRequired: false },
      { name: "PPC", included: true, monthlyValue: 1800, setupFee: 800, department: "Paid Ads", launchRequired: true },
      { name: "Meta Ads", included: true, monthlyValue: 1500, setupFee: 600, department: "Paid Ads", launchRequired: true },
      { name: "LSA", included: false, monthlyValue: 0, setupFee: 0, department: "LSA", launchRequired: false },
      { name: "Reporting", included: true, monthlyValue: 400, setupFee: 0, department: "Analytics", launchRequired: false },
      { name: "Web", included: true, monthlyValue: 700, setupFee: 1500, department: "Web Dev", launchRequired: true },
      { name: "Creative", included: false, monthlyValue: 0, setupFee: 0, department: "Creative", launchRequired: false },
    ],
    approvalChecklist: [
      { label: "Pricing confirmed", checked: true },
      { label: "Services confirmed", checked: true },
      { label: "Contract term confirmed", checked: true },
      { label: "Decision maker confirmed", checked: true },
      { label: "Internal review complete", checked: true },
      { label: "Client approved", checked: false },
      { label: "Billing notes added", checked: false },
      { label: "Ready for handoff", checked: false },
    ],
    handoffReadiness: { proposalApproved: false, contractSigned: false, servicesConfirmed: true, contractValueConfirmed: true, setupFeeConfirmed: true, billingNotesAdded: false, billingContactConfirmed: false, readyToSendToBilling: false },
    timeline: [
      { date: "May 28", event: "Audit completed", actor: "Chris B." },
      { date: "Jun 1", event: "Proposal drafted", actor: "Mike T." },
      { date: "Jun 2", event: "Internal review passed", actor: "Director" },
      { date: "Jun 3", event: "Proposal sent", actor: "Mike T." },
    ],
  },
  {
    id: "prop-004",
    name: "Coastal Wellness – Growth Bundle",
    client: "Coastal Wellness Spa",
    leadSource: "Affiliate",
    salesRep: "Sarah K.",
    stage: "Pushed to Handoff",
    dealValue: 45600,
    monthlyValue: 3800,
    sentDate: "May 10, 2025",
    lastActivity: "Jun 1, 2025",
    priority: "Urgent",
    auditFindings: "Strong organic foundation, gaps in paid and social channels.",
    negotiationNotes: "Quick close — no major objections.",
    affiliate: { name: "Lisa Park", referralCode: "LP-REF", commissionModel: "10% MRR for 12 months", potentialCommission: 4560, status: "Approved" },
    pricing: { setupFee: 2000, monthlyRecurring: 3800, contractTermMonths: 12, totalContractValue: 47600, discount: 0, finalApprovedValue: 47600, paymentTerms: "Net 30" },
    services: [
      { name: "SEO", included: true, monthlyValue: 1400, setupFee: 600, department: "SEO & Local", launchRequired: true },
      { name: "GBP", included: true, monthlyValue: 400, setupFee: 200, department: "SEO & Local", launchRequired: false },
      { name: "PPC", included: true, monthlyValue: 1200, setupFee: 700, department: "Paid Ads", launchRequired: true },
      { name: "Meta Ads", included: false, monthlyValue: 0, setupFee: 0, department: "Paid Ads", launchRequired: false },
      { name: "LSA", included: false, monthlyValue: 0, setupFee: 0, department: "LSA", launchRequired: false },
      { name: "Reporting", included: true, monthlyValue: 300, setupFee: 0, department: "Analytics", launchRequired: false },
      { name: "Web", included: false, monthlyValue: 0, setupFee: 0, department: "Web Dev", launchRequired: false },
      { name: "Creative", included: true, monthlyValue: 500, setupFee: 500, department: "Creative", launchRequired: false },
    ],
    approvalChecklist: [
      { label: "Pricing confirmed", checked: true },
      { label: "Services confirmed", checked: true },
      { label: "Contract term confirmed", checked: true },
      { label: "Decision maker confirmed", checked: true },
      { label: "Internal review complete", checked: true },
      { label: "Client approved", checked: true },
      { label: "Billing notes added", checked: true },
      { label: "Ready for handoff", checked: true },
    ],
    handoffReadiness: { proposalApproved: true, contractSigned: true, servicesConfirmed: true, contractValueConfirmed: true, setupFeeConfirmed: true, billingNotesAdded: true, billingContactConfirmed: true, readyToSendToBilling: true },
    timeline: [
      { date: "May 5", event: "Audit completed", actor: "Jamie T." },
      { date: "May 7", event: "Proposal drafted", actor: "Sarah K." },
      { date: "May 9", event: "Internal review passed", actor: "Director" },
      { date: "May 10", event: "Proposal sent", actor: "Sarah K." },
      { date: "May 13", event: "Proposal viewed", actor: "System" },
      { date: "May 18", event: "Approved by client", actor: "Sarah K." },
      { date: "Jun 1", event: "Pushed to handoff", actor: "Sarah K." },
    ],
  },
  {
    id: "prop-005",
    name: "Ridgeline Dentistry – SEO Starter",
    client: "Ridgeline Dentistry",
    leadSource: "Affiliate",
    salesRep: "Mike T.",
    stage: "Draft",
    dealValue: 26400,
    monthlyValue: 2200,
    sentDate: null,
    lastActivity: "Jun 9, 2025",
    priority: "Medium",
    auditFindings: "Pending audit completion.",
    negotiationNotes: "",
    affiliate: { name: "Carlos Reyes", referralCode: "CR-DTL", commissionModel: "10% MRR for 12 months", potentialCommission: 2640, status: "Not Eligible" },
    pricing: { setupFee: 1200, monthlyRecurring: 2200, contractTermMonths: 12, totalContractValue: 27600, discount: 0, finalApprovedValue: 27600, paymentTerms: "Net 30" },
    services: [
      { name: "SEO", included: true, monthlyValue: 1400, setupFee: 600, department: "SEO & Local", launchRequired: true },
      { name: "GBP", included: true, monthlyValue: 500, setupFee: 300, department: "SEO & Local", launchRequired: false },
      { name: "PPC", included: false, monthlyValue: 0, setupFee: 0, department: "Paid Ads", launchRequired: false },
      { name: "Meta Ads", included: false, monthlyValue: 0, setupFee: 0, department: "Paid Ads", launchRequired: false },
      { name: "LSA", included: false, monthlyValue: 0, setupFee: 0, department: "LSA", launchRequired: false },
      { name: "Reporting", included: true, monthlyValue: 300, setupFee: 0, department: "Analytics", launchRequired: false },
      { name: "Web", included: false, monthlyValue: 0, setupFee: 0, department: "Web Dev", launchRequired: false },
      { name: "Creative", included: false, monthlyValue: 0, setupFee: 0, department: "Creative", launchRequired: false },
    ],
    approvalChecklist: [
      { label: "Pricing confirmed", checked: false },
      { label: "Services confirmed", checked: false },
      { label: "Contract term confirmed", checked: false },
      { label: "Decision maker confirmed", checked: false },
      { label: "Internal review complete", checked: false },
      { label: "Client approved", checked: false },
      { label: "Billing notes added", checked: false },
      { label: "Ready for handoff", checked: false },
    ],
    handoffReadiness: { proposalApproved: false, contractSigned: false, servicesConfirmed: false, contractValueConfirmed: false, setupFeeConfirmed: false, billingNotesAdded: false, billingContactConfirmed: false, readyToSendToBilling: false },
    timeline: [{ date: "Jun 9", event: "Proposal created (draft)", actor: "Mike T." }],
  },
  {
    id: "prop-006",
    name: "Sunstate Solar – Paid Ads Bundle",
    client: "Sunstate Solar",
    leadSource: "Direct",
    salesRep: "Sarah K.",
    stage: "Viewed",
    dealValue: 42000,
    monthlyValue: 3500,
    sentDate: "Jun 1, 2025",
    lastActivity: "Jun 7, 2025",
    priority: "High",
    auditFindings: "Google Ads broad match overspend, Meta creative fatigue detected.",
    negotiationNotes: "",
    affiliate: null,
    pricing: { setupFee: 2000, monthlyRecurring: 3500, contractTermMonths: 12, totalContractValue: 44000, discount: 0, finalApprovedValue: 44000, paymentTerms: "Net 30" },
    services: [
      { name: "SEO", included: false, monthlyValue: 0, setupFee: 0, department: "SEO & Local", launchRequired: false },
      { name: "GBP", included: false, monthlyValue: 0, setupFee: 0, department: "SEO & Local", launchRequired: false },
      { name: "PPC", included: true, monthlyValue: 2000, setupFee: 1000, department: "Paid Ads", launchRequired: true },
      { name: "Meta Ads", included: true, monthlyValue: 1200, setupFee: 700, department: "Paid Ads", launchRequired: true },
      { name: "LSA", included: false, monthlyValue: 0, setupFee: 0, department: "LSA", launchRequired: false },
      { name: "Reporting", included: true, monthlyValue: 300, setupFee: 0, department: "Analytics", launchRequired: false },
      { name: "Web", included: false, monthlyValue: 0, setupFee: 0, department: "Web Dev", launchRequired: false },
      { name: "Creative", included: false, monthlyValue: 0, setupFee: 0, department: "Creative", launchRequired: false },
    ],
    approvalChecklist: [
      { label: "Pricing confirmed", checked: true },
      { label: "Services confirmed", checked: true },
      { label: "Contract term confirmed", checked: true },
      { label: "Decision maker confirmed", checked: true },
      { label: "Internal review complete", checked: true },
      { label: "Client approved", checked: false },
      { label: "Billing notes added", checked: false },
      { label: "Ready for handoff", checked: false },
    ],
    handoffReadiness: { proposalApproved: false, contractSigned: false, servicesConfirmed: true, contractValueConfirmed: true, setupFeeConfirmed: true, billingNotesAdded: false, billingContactConfirmed: false, readyToSendToBilling: false },
    timeline: [
      { date: "May 28", event: "Audit completed", actor: "Chris B." },
      { date: "May 30", event: "Proposal drafted", actor: "Sarah K." },
      { date: "May 31", event: "Internal review passed", actor: "Director" },
      { date: "Jun 1", event: "Proposal sent", actor: "Sarah K." },
      { date: "Jun 7", event: "Proposal viewed", actor: "System" },
    ],
  },
  {
    id: "prop-007",
    name: "Blue Ridge Plumbing – LSA Launch",
    client: "Blue Ridge Plumbing",
    leadSource: "Referral",
    salesRep: "Sarah K.",
    stage: "Internal Review",
    dealValue: 18000,
    monthlyValue: 1500,
    sentDate: null,
    lastActivity: "Jun 8, 2025",
    priority: "Medium",
    auditFindings: "LSA under-spend, service area gaps identified.",
    negotiationNotes: "",
    affiliate: null,
    pricing: { setupFee: 800, monthlyRecurring: 1500, contractTermMonths: 12, totalContractValue: 18800, discount: 200, finalApprovedValue: 18600, paymentTerms: "Net 30" },
    services: [
      { name: "SEO", included: false, monthlyValue: 0, setupFee: 0, department: "SEO & Local", launchRequired: false },
      { name: "GBP", included: true, monthlyValue: 400, setupFee: 200, department: "SEO & Local", launchRequired: false },
      { name: "PPC", included: false, monthlyValue: 0, setupFee: 0, department: "Paid Ads", launchRequired: false },
      { name: "Meta Ads", included: false, monthlyValue: 0, setupFee: 0, department: "Paid Ads", launchRequired: false },
      { name: "LSA", included: true, monthlyValue: 900, setupFee: 500, department: "LSA", launchRequired: true },
      { name: "Reporting", included: true, monthlyValue: 200, setupFee: 0, department: "Analytics", launchRequired: false },
      { name: "Web", included: false, monthlyValue: 0, setupFee: 0, department: "Web Dev", launchRequired: false },
      { name: "Creative", included: false, monthlyValue: 0, setupFee: 0, department: "Creative", launchRequired: false },
    ],
    approvalChecklist: [
      { label: "Pricing confirmed", checked: true },
      { label: "Services confirmed", checked: true },
      { label: "Contract term confirmed", checked: true },
      { label: "Decision maker confirmed", checked: false },
      { label: "Internal review complete", checked: false },
      { label: "Client approved", checked: false },
      { label: "Billing notes added", checked: false },
      { label: "Ready for handoff", checked: false },
    ],
    handoffReadiness: { proposalApproved: false, contractSigned: false, servicesConfirmed: true, contractValueConfirmed: true, setupFeeConfirmed: false, billingNotesAdded: false, billingContactConfirmed: false, readyToSendToBilling: false },
    timeline: [
      { date: "Jun 5", event: "Audit completed", actor: "Pat M." },
      { date: "Jun 7", event: "Proposal drafted", actor: "Sarah K." },
      { date: "Jun 8", event: "Submitted for internal review", actor: "Sarah K." },
    ],
  },
  {
    id: "prop-008",
    name: "Harbor Auto Group – Digital Dominance",
    client: "Harbor Auto Group",
    leadSource: "Cold Outreach",
    salesRep: "Mike T.",
    stage: "Ready to Send",
    dealValue: 66000,
    monthlyValue: 5500,
    sentDate: null,
    lastActivity: "Jun 9, 2025",
    priority: "High",
    auditFindings: "Multi-channel issues: website performance poor, Google Ads wasteful.",
    negotiationNotes: "",
    affiliate: null,
    pricing: { setupFee: 3500, monthlyRecurring: 5500, contractTermMonths: 12, totalContractValue: 69500, discount: 0, finalApprovedValue: 69500, paymentTerms: "Net 30" },
    services: [
      { name: "SEO", included: true, monthlyValue: 1800, setupFee: 700, department: "SEO & Local", launchRequired: true },
      { name: "GBP", included: true, monthlyValue: 500, setupFee: 200, department: "SEO & Local", launchRequired: false },
      { name: "PPC", included: true, monthlyValue: 1800, setupFee: 800, department: "Paid Ads", launchRequired: true },
      { name: "Meta Ads", included: false, monthlyValue: 0, setupFee: 0, department: "Paid Ads", launchRequired: false },
      { name: "LSA", included: false, monthlyValue: 0, setupFee: 0, department: "LSA", launchRequired: false },
      { name: "Reporting", included: true, monthlyValue: 400, setupFee: 0, department: "Analytics", launchRequired: false },
      { name: "Web", included: true, monthlyValue: 1000, setupFee: 1800, department: "Web Dev", launchRequired: true },
      { name: "Creative", included: false, monthlyValue: 0, setupFee: 0, department: "Creative", launchRequired: false },
    ],
    approvalChecklist: [
      { label: "Pricing confirmed", checked: true },
      { label: "Services confirmed", checked: true },
      { label: "Contract term confirmed", checked: true },
      { label: "Decision maker confirmed", checked: true },
      { label: "Internal review complete", checked: true },
      { label: "Client approved", checked: false },
      { label: "Billing notes added", checked: false },
      { label: "Ready for handoff", checked: false },
    ],
    handoffReadiness: { proposalApproved: false, contractSigned: false, servicesConfirmed: true, contractValueConfirmed: true, setupFeeConfirmed: true, billingNotesAdded: false, billingContactConfirmed: false, readyToSendToBilling: false },
    timeline: [
      { date: "Jun 3", event: "Audit completed", actor: "Jamie T." },
      { date: "Jun 6", event: "Proposal drafted", actor: "Mike T." },
      { date: "Jun 8", event: "Internal review passed", actor: "Director" },
      { date: "Jun 9", event: "Marked ready to send", actor: "Mike T." },
    ],
  },
  {
    id: "prop-009",
    name: "Peak Performance Gym – Social + SEO",
    client: "Peak Performance Gym",
    leadSource: "Inbound",
    salesRep: "Jordan M.",
    stage: "Rejected",
    dealValue: 24000,
    monthlyValue: 2000,
    sentDate: "May 15, 2025",
    lastActivity: "May 30, 2025",
    priority: "Low",
    auditFindings: "Moderate SEO gaps, strong social media presence already.",
    negotiationNotes: "Budget concerns from client. Could not agree on pricing.",
    affiliate: null,
    pricing: { setupFee: 1000, monthlyRecurring: 2000, contractTermMonths: 12, totalContractValue: 25000, discount: 0, finalApprovedValue: 25000, paymentTerms: "Net 30" },
    services: [
      { name: "SEO", included: true, monthlyValue: 1200, setupFee: 500, department: "SEO & Local", launchRequired: true },
      { name: "GBP", included: false, monthlyValue: 0, setupFee: 0, department: "SEO & Local", launchRequired: false },
      { name: "PPC", included: false, monthlyValue: 0, setupFee: 0, department: "Paid Ads", launchRequired: false },
      { name: "Meta Ads", included: true, monthlyValue: 800, setupFee: 500, department: "Paid Ads", launchRequired: true },
      { name: "LSA", included: false, monthlyValue: 0, setupFee: 0, department: "LSA", launchRequired: false },
      { name: "Reporting", included: false, monthlyValue: 0, setupFee: 0, department: "Analytics", launchRequired: false },
      { name: "Web", included: false, monthlyValue: 0, setupFee: 0, department: "Web Dev", launchRequired: false },
      { name: "Creative", included: false, monthlyValue: 0, setupFee: 0, department: "Creative", launchRequired: false },
    ],
    approvalChecklist: [
      { label: "Pricing confirmed", checked: true },
      { label: "Services confirmed", checked: true },
      { label: "Contract term confirmed", checked: true },
      { label: "Decision maker confirmed", checked: true },
      { label: "Internal review complete", checked: true },
      { label: "Client approved", checked: false },
      { label: "Billing notes added", checked: false },
      { label: "Ready for handoff", checked: false },
    ],
    handoffReadiness: { proposalApproved: false, contractSigned: false, servicesConfirmed: false, contractValueConfirmed: false, setupFeeConfirmed: false, billingNotesAdded: false, billingContactConfirmed: false, readyToSendToBilling: false },
    timeline: [
      { date: "May 10", event: "Proposal drafted", actor: "Jordan M." },
      { date: "May 12", event: "Internal review passed", actor: "Director" },
      { date: "May 15", event: "Proposal sent", actor: "Jordan M." },
      { date: "May 20", event: "Proposal viewed", actor: "System" },
      { date: "May 28", event: "Client requested pricing revision", actor: "Jordan M." },
      { date: "May 30", event: "Client rejected proposal", actor: "Jordan M." },
    ],
  },
  {
    id: "prop-010",
    name: "Cornerstone Roofing – Full Digital",
    client: "Cornerstone Roofing",
    leadSource: "Referral",
    salesRep: "Sarah K.",
    stage: "Draft",
    dealValue: 36000,
    monthlyValue: 3000,
    sentDate: null,
    lastActivity: "Jun 10, 2025",
    priority: "Medium",
    auditFindings: "Website outdated, no GBP optimization, no paid strategy.",
    negotiationNotes: "",
    affiliate: null,
    pricing: { setupFee: 2000, monthlyRecurring: 3000, contractTermMonths: 12, totalContractValue: 38000, discount: 0, finalApprovedValue: 38000, paymentTerms: "Net 30" },
    services: [
      { name: "SEO", included: true, monthlyValue: 1200, setupFee: 500, department: "SEO & Local", launchRequired: true },
      { name: "GBP", included: true, monthlyValue: 500, setupFee: 300, department: "SEO & Local", launchRequired: false },
      { name: "PPC", included: false, monthlyValue: 0, setupFee: 0, department: "Paid Ads", launchRequired: false },
      { name: "Meta Ads", included: false, monthlyValue: 0, setupFee: 0, department: "Paid Ads", launchRequired: false },
      { name: "LSA", included: true, monthlyValue: 800, setupFee: 400, department: "LSA", launchRequired: true },
      { name: "Reporting", included: true, monthlyValue: 200, setupFee: 0, department: "Analytics", launchRequired: false },
      { name: "Web", included: true, monthlyValue: 300, setupFee: 800, department: "Web Dev", launchRequired: true },
      { name: "Creative", included: false, monthlyValue: 0, setupFee: 0, department: "Creative", launchRequired: false },
    ],
    approvalChecklist: [
      { label: "Pricing confirmed", checked: false },
      { label: "Services confirmed", checked: false },
      { label: "Contract term confirmed", checked: false },
      { label: "Decision maker confirmed", checked: false },
      { label: "Internal review complete", checked: false },
      { label: "Client approved", checked: false },
      { label: "Billing notes added", checked: false },
      { label: "Ready for handoff", checked: false },
    ],
    handoffReadiness: { proposalApproved: false, contractSigned: false, servicesConfirmed: false, contractValueConfirmed: false, setupFeeConfirmed: false, billingNotesAdded: false, billingContactConfirmed: false, readyToSendToBilling: false },
    timeline: [{ date: "Jun 10", event: "Proposal created (draft)", actor: "Sarah K." }],
  },
  // Additional 15 proposals (compact)
  { id: "prop-011", name: "Nexus Law Group – Local SEO", client: "Nexus Law Group", leadSource: "Inbound", salesRep: "Jordan M.", stage: "Sent", dealValue: 30000, monthlyValue: 2500, sentDate: "Jun 5, 2025", lastActivity: "Jun 5, 2025", priority: "Medium", auditFindings: "Weak local citations.", negotiationNotes: "", affiliate: null, pricing: { setupFee: 1000, monthlyRecurring: 2500, contractTermMonths: 12, totalContractValue: 31000, discount: 0, finalApprovedValue: 31000, paymentTerms: "Net 30" }, services: [{ name: "SEO", included: true, monthlyValue: 2000, setupFee: 700, department: "SEO & Local", launchRequired: true }, { name: "GBP", included: true, monthlyValue: 500, setupFee: 300, department: "SEO & Local", launchRequired: false }, { name: "PPC", included: false, monthlyValue: 0, setupFee: 0, department: "Paid Ads", launchRequired: false }, { name: "Meta Ads", included: false, monthlyValue: 0, setupFee: 0, department: "Paid Ads", launchRequired: false }, { name: "LSA", included: false, monthlyValue: 0, setupFee: 0, department: "LSA", launchRequired: false }, { name: "Reporting", included: false, monthlyValue: 0, setupFee: 0, department: "Analytics", launchRequired: false }, { name: "Web", included: false, monthlyValue: 0, setupFee: 0, department: "Web Dev", launchRequired: false }, { name: "Creative", included: false, monthlyValue: 0, setupFee: 0, department: "Creative", launchRequired: false }], approvalChecklist: [{ label: "Pricing confirmed", checked: true }, { label: "Services confirmed", checked: true }, { label: "Contract term confirmed", checked: true }, { label: "Decision maker confirmed", checked: true }, { label: "Internal review complete", checked: true }, { label: "Client approved", checked: false }, { label: "Billing notes added", checked: false }, { label: "Ready for handoff", checked: false }], handoffReadiness: { proposalApproved: false, contractSigned: false, servicesConfirmed: true, contractValueConfirmed: true, setupFeeConfirmed: true, billingNotesAdded: false, billingContactConfirmed: false, readyToSendToBilling: false }, timeline: [{ date: "Jun 3", event: "Proposal drafted", actor: "Jordan M." }, { date: "Jun 5", event: "Proposal sent", actor: "Jordan M." }] },
  { id: "prop-012", name: "Bright Smiles Dentistry – GBP + LSA", client: "Bright Smiles Dentistry", leadSource: "Affiliate", salesRep: "Mike T.", stage: "Viewed", dealValue: 21600, monthlyValue: 1800, sentDate: "Jun 4, 2025", lastActivity: "Jun 9, 2025", priority: "Medium", auditFindings: "Low GBP score, LSA not set up.", negotiationNotes: "", affiliate: { name: "Dana White", referralCode: "DW-SM", commissionModel: "10% MRR", potentialCommission: 2160, status: "Pending Approval" }, pricing: { setupFee: 900, monthlyRecurring: 1800, contractTermMonths: 12, totalContractValue: 22500, discount: 0, finalApprovedValue: 22500, paymentTerms: "Net 30" }, services: [{ name: "SEO", included: false, monthlyValue: 0, setupFee: 0, department: "SEO & Local", launchRequired: false }, { name: "GBP", included: true, monthlyValue: 800, setupFee: 400, department: "SEO & Local", launchRequired: false }, { name: "PPC", included: false, monthlyValue: 0, setupFee: 0, department: "Paid Ads", launchRequired: false }, { name: "Meta Ads", included: false, monthlyValue: 0, setupFee: 0, department: "Paid Ads", launchRequired: false }, { name: "LSA", included: true, monthlyValue: 1000, setupFee: 500, department: "LSA", launchRequired: true }, { name: "Reporting", included: false, monthlyValue: 0, setupFee: 0, department: "Analytics", launchRequired: false }, { name: "Web", included: false, monthlyValue: 0, setupFee: 0, department: "Web Dev", launchRequired: false }, { name: "Creative", included: false, monthlyValue: 0, setupFee: 0, department: "Creative", launchRequired: false }], approvalChecklist: [{ label: "Pricing confirmed", checked: true }, { label: "Services confirmed", checked: true }, { label: "Contract term confirmed", checked: true }, { label: "Decision maker confirmed", checked: true }, { label: "Internal review complete", checked: true }, { label: "Client approved", checked: false }, { label: "Billing notes added", checked: false }, { label: "Ready for handoff", checked: false }], handoffReadiness: { proposalApproved: false, contractSigned: false, servicesConfirmed: true, contractValueConfirmed: true, setupFeeConfirmed: true, billingNotesAdded: false, billingContactConfirmed: false, readyToSendToBilling: false }, timeline: [{ date: "Jun 2", event: "Proposal drafted", actor: "Mike T." }, { date: "Jun 4", event: "Proposal sent", actor: "Mike T." }, { date: "Jun 9", event: "Viewed by client", actor: "System" }] },
  { id: "prop-013", name: "Lakeside Pools – PPC Campaign", client: "Lakeside Pools", leadSource: "Cold Outreach", salesRep: "Jordan M.", stage: "Draft", dealValue: 19200, monthlyValue: 1600, sentDate: null, lastActivity: "Jun 10, 2025", priority: "Low", auditFindings: "No Google Ads presence.", negotiationNotes: "", affiliate: null, pricing: { setupFee: 800, monthlyRecurring: 1600, contractTermMonths: 12, totalContractValue: 20000, discount: 0, finalApprovedValue: 20000, paymentTerms: "Net 30" }, services: [{ name: "SEO", included: false, monthlyValue: 0, setupFee: 0, department: "SEO & Local", launchRequired: false }, { name: "GBP", included: false, monthlyValue: 0, setupFee: 0, department: "SEO & Local", launchRequired: false }, { name: "PPC", included: true, monthlyValue: 1600, setupFee: 800, department: "Paid Ads", launchRequired: true }, { name: "Meta Ads", included: false, monthlyValue: 0, setupFee: 0, department: "Paid Ads", launchRequired: false }, { name: "LSA", included: false, monthlyValue: 0, setupFee: 0, department: "LSA", launchRequired: false }, { name: "Reporting", included: false, monthlyValue: 0, setupFee: 0, department: "Analytics", launchRequired: false }, { name: "Web", included: false, monthlyValue: 0, setupFee: 0, department: "Web Dev", launchRequired: false }, { name: "Creative", included: false, monthlyValue: 0, setupFee: 0, department: "Creative", launchRequired: false }], approvalChecklist: [{ label: "Pricing confirmed", checked: false }, { label: "Services confirmed", checked: false }, { label: "Contract term confirmed", checked: false }, { label: "Decision maker confirmed", checked: false }, { label: "Internal review complete", checked: false }, { label: "Client approved", checked: false }, { label: "Billing notes added", checked: false }, { label: "Ready for handoff", checked: false }], handoffReadiness: { proposalApproved: false, contractSigned: false, servicesConfirmed: false, contractValueConfirmed: false, setupFeeConfirmed: false, billingNotesAdded: false, billingContactConfirmed: false, readyToSendToBilling: false }, timeline: [{ date: "Jun 10", event: "Proposal created", actor: "Jordan M." }] },
  { id: "prop-014", name: "Vertex HVAC – Local Bundle", client: "Vertex HVAC", leadSource: "Referral", salesRep: "Sarah K.", stage: "Negotiation", dealValue: 33600, monthlyValue: 2800, sentDate: "May 28, 2025", lastActivity: "Jun 8, 2025", priority: "High", auditFindings: "LSA setup issues, low GBP completeness.", negotiationNotes: "Pushing for 6-month term instead of 12.", affiliate: null, pricing: { setupFee: 1500, monthlyRecurring: 2800, contractTermMonths: 12, totalContractValue: 35100, discount: 300, finalApprovedValue: 34800, paymentTerms: "Net 30" }, services: [{ name: "SEO", included: true, monthlyValue: 1000, setupFee: 400, department: "SEO & Local", launchRequired: true }, { name: "GBP", included: true, monthlyValue: 500, setupFee: 300, department: "SEO & Local", launchRequired: false }, { name: "PPC", included: false, monthlyValue: 0, setupFee: 0, department: "Paid Ads", launchRequired: false }, { name: "Meta Ads", included: false, monthlyValue: 0, setupFee: 0, department: "Paid Ads", launchRequired: false }, { name: "LSA", included: true, monthlyValue: 1000, setupFee: 500, department: "LSA", launchRequired: true }, { name: "Reporting", included: true, monthlyValue: 300, setupFee: 0, department: "Analytics", launchRequired: false }, { name: "Web", included: false, monthlyValue: 0, setupFee: 0, department: "Web Dev", launchRequired: false }, { name: "Creative", included: false, monthlyValue: 0, setupFee: 0, department: "Creative", launchRequired: false }], approvalChecklist: [{ label: "Pricing confirmed", checked: true }, { label: "Services confirmed", checked: true }, { label: "Contract term confirmed", checked: false }, { label: "Decision maker confirmed", checked: true }, { label: "Internal review complete", checked: true }, { label: "Client approved", checked: false }, { label: "Billing notes added", checked: false }, { label: "Ready for handoff", checked: false }], handoffReadiness: { proposalApproved: false, contractSigned: false, servicesConfirmed: true, contractValueConfirmed: false, setupFeeConfirmed: true, billingNotesAdded: false, billingContactConfirmed: false, readyToSendToBilling: false }, timeline: [{ date: "May 26", event: "Proposal drafted", actor: "Sarah K." }, { date: "May 27", event: "Internal review passed", actor: "Director" }, { date: "May 28", event: "Proposal sent", actor: "Sarah K." }, { date: "Jun 3", event: "Proposal viewed", actor: "System" }, { date: "Jun 8", event: "Negotiation started", actor: "Sarah K." }] },
  { id: "prop-015", name: "Iron Mark Fitness – Meta Ads", client: "Iron Mark Fitness", leadSource: "Inbound", salesRep: "Mike T.", stage: "Approved", dealValue: 22800, monthlyValue: 1900, sentDate: "May 20, 2025", lastActivity: "Jun 5, 2025", priority: "Medium", auditFindings: "Meta creative fatigue, no retargeting strategy.", negotiationNotes: "Quick approval, no objections.", affiliate: null, pricing: { setupFee: 900, monthlyRecurring: 1900, contractTermMonths: 12, totalContractValue: 23700, discount: 0, finalApprovedValue: 23700, paymentTerms: "Net 30" }, services: [{ name: "SEO", included: false, monthlyValue: 0, setupFee: 0, department: "SEO & Local", launchRequired: false }, { name: "GBP", included: false, monthlyValue: 0, setupFee: 0, department: "SEO & Local", launchRequired: false }, { name: "PPC", included: false, monthlyValue: 0, setupFee: 0, department: "Paid Ads", launchRequired: false }, { name: "Meta Ads", included: true, monthlyValue: 1600, setupFee: 700, department: "Paid Ads", launchRequired: true }, { name: "LSA", included: false, monthlyValue: 0, setupFee: 0, department: "LSA", launchRequired: false }, { name: "Reporting", included: true, monthlyValue: 300, setupFee: 0, department: "Analytics", launchRequired: false }, { name: "Web", included: false, monthlyValue: 0, setupFee: 0, department: "Web Dev", launchRequired: false }, { name: "Creative", included: false, monthlyValue: 0, setupFee: 0, department: "Creative", launchRequired: false }], approvalChecklist: [{ label: "Pricing confirmed", checked: true }, { label: "Services confirmed", checked: true }, { label: "Contract term confirmed", checked: true }, { label: "Decision maker confirmed", checked: true }, { label: "Internal review complete", checked: true }, { label: "Client approved", checked: true }, { label: "Billing notes added", checked: false }, { label: "Ready for handoff", checked: false }], handoffReadiness: { proposalApproved: true, contractSigned: false, servicesConfirmed: true, contractValueConfirmed: true, setupFeeConfirmed: true, billingNotesAdded: false, billingContactConfirmed: false, readyToSendToBilling: false }, timeline: [{ date: "May 18", event: "Proposal drafted", actor: "Mike T." }, { date: "May 19", event: "Internal review passed", actor: "Director" }, { date: "May 20", event: "Proposal sent", actor: "Mike T." }, { date: "May 25", event: "Proposal viewed", actor: "System" }, { date: "Jun 5", event: "Approved by client", actor: "Mike T." }] },
  { id: "prop-016", name: "Cliffside Chiropractic – SEO + LSA", client: "Cliffside Chiropractic", leadSource: "Affiliate", salesRep: "Jordan M.", stage: "Internal Review", dealValue: 24000, monthlyValue: 2000, sentDate: null, lastActivity: "Jun 9, 2025", priority: "Medium", auditFindings: "Citation issues, low LSA bid strategy.", negotiationNotes: "", affiliate: { name: "Sam Torres", referralCode: "ST-CHIRO", commissionModel: "10% MRR", potentialCommission: 2400, status: "Not Eligible" }, pricing: { setupFee: 1000, monthlyRecurring: 2000, contractTermMonths: 12, totalContractValue: 25000, discount: 0, finalApprovedValue: 25000, paymentTerms: "Net 30" }, services: [{ name: "SEO", included: true, monthlyValue: 1200, setupFee: 500, department: "SEO & Local", launchRequired: true }, { name: "GBP", included: false, monthlyValue: 0, setupFee: 0, department: "SEO & Local", launchRequired: false }, { name: "PPC", included: false, monthlyValue: 0, setupFee: 0, department: "Paid Ads", launchRequired: false }, { name: "Meta Ads", included: false, monthlyValue: 0, setupFee: 0, department: "Paid Ads", launchRequired: false }, { name: "LSA", included: true, monthlyValue: 800, setupFee: 500, department: "LSA", launchRequired: true }, { name: "Reporting", included: false, monthlyValue: 0, setupFee: 0, department: "Analytics", launchRequired: false }, { name: "Web", included: false, monthlyValue: 0, setupFee: 0, department: "Web Dev", launchRequired: false }, { name: "Creative", included: false, monthlyValue: 0, setupFee: 0, department: "Creative", launchRequired: false }], approvalChecklist: [{ label: "Pricing confirmed", checked: true }, { label: "Services confirmed", checked: true }, { label: "Contract term confirmed", checked: true }, { label: "Decision maker confirmed", checked: false }, { label: "Internal review complete", checked: false }, { label: "Client approved", checked: false }, { label: "Billing notes added", checked: false }, { label: "Ready for handoff", checked: false }], handoffReadiness: { proposalApproved: false, contractSigned: false, servicesConfirmed: true, contractValueConfirmed: true, setupFeeConfirmed: false, billingNotesAdded: false, billingContactConfirmed: false, readyToSendToBilling: false }, timeline: [{ date: "Jun 7", event: "Proposal drafted", actor: "Jordan M." }, { date: "Jun 9", event: "Submitted for internal review", actor: "Jordan M." }] },
  { id: "prop-017", name: "Radiant Skin Clinic – Full Digital", client: "Radiant Skin Clinic", leadSource: "Inbound", salesRep: "Sarah K.", stage: "Sent", dealValue: 48000, monthlyValue: 4000, sentDate: "Jun 6, 2025", lastActivity: "Jun 6, 2025", priority: "High", auditFindings: "Strong brand, weak paid ads, no SEO strategy.", negotiationNotes: "", affiliate: null, pricing: { setupFee: 2200, monthlyRecurring: 4000, contractTermMonths: 12, totalContractValue: 50200, discount: 0, finalApprovedValue: 50200, paymentTerms: "Net 30" }, services: [{ name: "SEO", included: true, monthlyValue: 1500, setupFee: 600, department: "SEO & Local", launchRequired: true }, { name: "GBP", included: true, monthlyValue: 400, setupFee: 200, department: "SEO & Local", launchRequired: false }, { name: "PPC", included: false, monthlyValue: 0, setupFee: 0, department: "Paid Ads", launchRequired: false }, { name: "Meta Ads", included: true, monthlyValue: 1500, setupFee: 800, department: "Paid Ads", launchRequired: true }, { name: "LSA", included: false, monthlyValue: 0, setupFee: 0, department: "LSA", launchRequired: false }, { name: "Reporting", included: true, monthlyValue: 300, setupFee: 0, department: "Analytics", launchRequired: false }, { name: "Web", included: false, monthlyValue: 0, setupFee: 0, department: "Web Dev", launchRequired: false }, { name: "Creative", included: true, monthlyValue: 300, setupFee: 600, department: "Creative", launchRequired: false }], approvalChecklist: [{ label: "Pricing confirmed", checked: true }, { label: "Services confirmed", checked: true }, { label: "Contract term confirmed", checked: true }, { label: "Decision maker confirmed", checked: true }, { label: "Internal review complete", checked: true }, { label: "Client approved", checked: false }, { label: "Billing notes added", checked: false }, { label: "Ready for handoff", checked: false }], handoffReadiness: { proposalApproved: false, contractSigned: false, servicesConfirmed: true, contractValueConfirmed: true, setupFeeConfirmed: true, billingNotesAdded: false, billingContactConfirmed: false, readyToSendToBilling: false }, timeline: [{ date: "Jun 4", event: "Proposal drafted", actor: "Sarah K." }, { date: "Jun 5", event: "Internal review passed", actor: "Director" }, { date: "Jun 6", event: "Proposal sent", actor: "Sarah K." }] },
  { id: "prop-018", name: "Metro Pest Control – LSA Only", client: "Metro Pest Control", leadSource: "Cold Outreach", salesRep: "Mike T.", stage: "Rejected", dealValue: 15600, monthlyValue: 1300, sentDate: "May 5, 2025", lastActivity: "May 22, 2025", priority: "Low", auditFindings: "No LSA profile, underserved market.", negotiationNotes: "Client decided to do it in-house.", affiliate: null, pricing: { setupFee: 600, monthlyRecurring: 1300, contractTermMonths: 12, totalContractValue: 16200, discount: 0, finalApprovedValue: 16200, paymentTerms: "Net 30" }, services: [{ name: "SEO", included: false, monthlyValue: 0, setupFee: 0, department: "SEO & Local", launchRequired: false }, { name: "GBP", included: false, monthlyValue: 0, setupFee: 0, department: "SEO & Local", launchRequired: false }, { name: "PPC", included: false, monthlyValue: 0, setupFee: 0, department: "Paid Ads", launchRequired: false }, { name: "Meta Ads", included: false, monthlyValue: 0, setupFee: 0, department: "Paid Ads", launchRequired: false }, { name: "LSA", included: true, monthlyValue: 1300, setupFee: 600, department: "LSA", launchRequired: true }, { name: "Reporting", included: false, monthlyValue: 0, setupFee: 0, department: "Analytics", launchRequired: false }, { name: "Web", included: false, monthlyValue: 0, setupFee: 0, department: "Web Dev", launchRequired: false }, { name: "Creative", included: false, monthlyValue: 0, setupFee: 0, department: "Creative", launchRequired: false }], approvalChecklist: [{ label: "Pricing confirmed", checked: true }, { label: "Services confirmed", checked: true }, { label: "Contract term confirmed", checked: true }, { label: "Decision maker confirmed", checked: true }, { label: "Internal review complete", checked: true }, { label: "Client approved", checked: false }, { label: "Billing notes added", checked: false }, { label: "Ready for handoff", checked: false }], handoffReadiness: { proposalApproved: false, contractSigned: false, servicesConfirmed: false, contractValueConfirmed: false, setupFeeConfirmed: false, billingNotesAdded: false, billingContactConfirmed: false, readyToSendToBilling: false }, timeline: [{ date: "May 3", event: "Proposal drafted", actor: "Mike T." }, { date: "May 5", event: "Proposal sent", actor: "Mike T." }, { date: "May 22", event: "Rejected by client", actor: "Mike T." }] },
  { id: "prop-019", name: "Oakwood Realty – Web + SEO", client: "Oakwood Realty Group", leadSource: "Referral", salesRep: "Jordan M.", stage: "Ready to Send", dealValue: 40800, monthlyValue: 3400, sentDate: null, lastActivity: "Jun 10, 2025", priority: "High", auditFindings: "Website is 7 years old, SEO completely neglected.", negotiationNotes: "", affiliate: null, pricing: { setupFee: 2200, monthlyRecurring: 3400, contractTermMonths: 12, totalContractValue: 43000, discount: 200, finalApprovedValue: 42800, paymentTerms: "Net 30" }, services: [{ name: "SEO", included: true, monthlyValue: 1500, setupFee: 600, department: "SEO & Local", launchRequired: true }, { name: "GBP", included: false, monthlyValue: 0, setupFee: 0, department: "SEO & Local", launchRequired: false }, { name: "PPC", included: false, monthlyValue: 0, setupFee: 0, department: "Paid Ads", launchRequired: false }, { name: "Meta Ads", included: false, monthlyValue: 0, setupFee: 0, department: "Paid Ads", launchRequired: false }, { name: "LSA", included: false, monthlyValue: 0, setupFee: 0, department: "LSA", launchRequired: false }, { name: "Reporting", included: true, monthlyValue: 300, setupFee: 0, department: "Analytics", launchRequired: false }, { name: "Web", included: true, monthlyValue: 1200, setupFee: 1600, department: "Web Dev", launchRequired: true }, { name: "Creative", included: true, monthlyValue: 400, setupFee: 0, department: "Creative", launchRequired: false }], approvalChecklist: [{ label: "Pricing confirmed", checked: true }, { label: "Services confirmed", checked: true }, { label: "Contract term confirmed", checked: true }, { label: "Decision maker confirmed", checked: true }, { label: "Internal review complete", checked: true }, { label: "Client approved", checked: false }, { label: "Billing notes added", checked: false }, { label: "Ready for handoff", checked: false }], handoffReadiness: { proposalApproved: false, contractSigned: false, servicesConfirmed: true, contractValueConfirmed: true, setupFeeConfirmed: true, billingNotesAdded: false, billingContactConfirmed: false, readyToSendToBilling: false }, timeline: [{ date: "Jun 7", event: "Proposal drafted", actor: "Jordan M." }, { date: "Jun 9", event: "Internal review passed", actor: "Director" }, { date: "Jun 10", event: "Marked ready to send", actor: "Jordan M." }] },
  { id: "prop-020", name: "Frontier Finance – Lead Gen", client: "Frontier Financial", leadSource: "Inbound", salesRep: "Sarah K.", stage: "Viewed", dealValue: 36000, monthlyValue: 3000, sentDate: "Jun 7, 2025", lastActivity: "Jun 10, 2025", priority: "High", auditFindings: "Google Ads poorly structured, no conversion tracking.", negotiationNotes: "", affiliate: null, pricing: { setupFee: 1500, monthlyRecurring: 3000, contractTermMonths: 12, totalContractValue: 37500, discount: 0, finalApprovedValue: 37500, paymentTerms: "Net 30" }, services: [{ name: "SEO", included: false, monthlyValue: 0, setupFee: 0, department: "SEO & Local", launchRequired: false }, { name: "GBP", included: false, monthlyValue: 0, setupFee: 0, department: "SEO & Local", launchRequired: false }, { name: "PPC", included: true, monthlyValue: 2500, setupFee: 1000, department: "Paid Ads", launchRequired: true }, { name: "Meta Ads", included: false, monthlyValue: 0, setupFee: 0, department: "Paid Ads", launchRequired: false }, { name: "LSA", included: false, monthlyValue: 0, setupFee: 0, department: "LSA", launchRequired: false }, { name: "Reporting", included: true, monthlyValue: 300, setupFee: 0, department: "Analytics", launchRequired: false }, { name: "Web", included: false, monthlyValue: 0, setupFee: 0, department: "Web Dev", launchRequired: false }, { name: "Creative", included: true, monthlyValue: 200, setupFee: 500, department: "Creative", launchRequired: false }], approvalChecklist: [{ label: "Pricing confirmed", checked: true }, { label: "Services confirmed", checked: true }, { label: "Contract term confirmed", checked: true }, { label: "Decision maker confirmed", checked: true }, { label: "Internal review complete", checked: true }, { label: "Client approved", checked: false }, { label: "Billing notes added", checked: false }, { label: "Ready for handoff", checked: false }], handoffReadiness: { proposalApproved: false, contractSigned: false, servicesConfirmed: true, contractValueConfirmed: true, setupFeeConfirmed: true, billingNotesAdded: false, billingContactConfirmed: false, readyToSendToBilling: false }, timeline: [{ date: "Jun 5", event: "Proposal drafted", actor: "Sarah K." }, { date: "Jun 6", event: "Internal review passed", actor: "Director" }, { date: "Jun 7", event: "Proposal sent", actor: "Sarah K." }, { date: "Jun 10", event: "Viewed by client", actor: "System" }] },
  { id: "prop-021", name: "Summit Storage – PPC + GBP", client: "Summit Storage Solutions", leadSource: "Affiliate", salesRep: "Jordan M.", stage: "Approved", dealValue: 28800, monthlyValue: 2400, sentDate: "May 30, 2025", lastActivity: "Jun 8, 2025", priority: "Medium", auditFindings: "No paid search, GBP partially complete.", negotiationNotes: "Client approved with no changes.", affiliate: { name: "Nick Vasquez", referralCode: "NV-STG", commissionModel: "10% MRR", potentialCommission: 2880, status: "Approved" }, pricing: { setupFee: 1200, monthlyRecurring: 2400, contractTermMonths: 12, totalContractValue: 30000, discount: 0, finalApprovedValue: 30000, paymentTerms: "Net 30" }, services: [{ name: "SEO", included: false, monthlyValue: 0, setupFee: 0, department: "SEO & Local", launchRequired: false }, { name: "GBP", included: true, monthlyValue: 600, setupFee: 300, department: "SEO & Local", launchRequired: false }, { name: "PPC", included: true, monthlyValue: 1600, setupFee: 800, department: "Paid Ads", launchRequired: true }, { name: "Meta Ads", included: false, monthlyValue: 0, setupFee: 0, department: "Paid Ads", launchRequired: false }, { name: "LSA", included: false, monthlyValue: 0, setupFee: 0, department: "LSA", launchRequired: false }, { name: "Reporting", included: true, monthlyValue: 200, setupFee: 0, department: "Analytics", launchRequired: false }, { name: "Web", included: false, monthlyValue: 0, setupFee: 0, department: "Web Dev", launchRequired: false }, { name: "Creative", included: false, monthlyValue: 0, setupFee: 0, department: "Creative", launchRequired: false }], approvalChecklist: [{ label: "Pricing confirmed", checked: true }, { label: "Services confirmed", checked: true }, { label: "Contract term confirmed", checked: true }, { label: "Decision maker confirmed", checked: true }, { label: "Internal review complete", checked: true }, { label: "Client approved", checked: true }, { label: "Billing notes added", checked: true }, { label: "Ready for handoff", checked: false }], handoffReadiness: { proposalApproved: true, contractSigned: true, servicesConfirmed: true, contractValueConfirmed: true, setupFeeConfirmed: true, billingNotesAdded: true, billingContactConfirmed: false, readyToSendToBilling: false }, timeline: [{ date: "May 28", event: "Proposal drafted", actor: "Jordan M." }, { date: "May 29", event: "Internal review passed", actor: "Director" }, { date: "May 30", event: "Proposal sent", actor: "Jordan M." }, { date: "Jun 3", event: "Proposal viewed", actor: "System" }, { date: "Jun 8", event: "Approved by client", actor: "Jordan M." }] },
  { id: "prop-022", name: "SteelPath Fabrication – Web Redesign", client: "SteelPath Fabrication", leadSource: "Cold Outreach", salesRep: "Mike T.", stage: "Internal Review", dealValue: 20400, monthlyValue: 1700, sentDate: null, lastActivity: "Jun 8, 2025", priority: "Medium", auditFindings: "Outdated website, no mobile optimization.", negotiationNotes: "", affiliate: null, pricing: { setupFee: 1400, monthlyRecurring: 1700, contractTermMonths: 12, totalContractValue: 21800, discount: 0, finalApprovedValue: 21800, paymentTerms: "Net 30" }, services: [{ name: "SEO", included: false, monthlyValue: 0, setupFee: 0, department: "SEO & Local", launchRequired: false }, { name: "GBP", included: false, monthlyValue: 0, setupFee: 0, department: "SEO & Local", launchRequired: false }, { name: "PPC", included: false, monthlyValue: 0, setupFee: 0, department: "Paid Ads", launchRequired: false }, { name: "Meta Ads", included: false, monthlyValue: 0, setupFee: 0, department: "Paid Ads", launchRequired: false }, { name: "LSA", included: false, monthlyValue: 0, setupFee: 0, department: "LSA", launchRequired: false }, { name: "Reporting", included: true, monthlyValue: 200, setupFee: 0, department: "Analytics", launchRequired: false }, { name: "Web", included: true, monthlyValue: 1500, setupFee: 1400, department: "Web Dev", launchRequired: true }, { name: "Creative", included: false, monthlyValue: 0, setupFee: 0, department: "Creative", launchRequired: false }], approvalChecklist: [{ label: "Pricing confirmed", checked: true }, { label: "Services confirmed", checked: true }, { label: "Contract term confirmed", checked: true }, { label: "Decision maker confirmed", checked: false }, { label: "Internal review complete", checked: false }, { label: "Client approved", checked: false }, { label: "Billing notes added", checked: false }, { label: "Ready for handoff", checked: false }], handoffReadiness: { proposalApproved: false, contractSigned: false, servicesConfirmed: true, contractValueConfirmed: true, setupFeeConfirmed: false, billingNotesAdded: false, billingContactConfirmed: false, readyToSendToBilling: false }, timeline: [{ date: "Jun 6", event: "Proposal drafted", actor: "Mike T." }, { date: "Jun 8", event: "Submitted for internal review", actor: "Mike T." }] },
  { id: "prop-023", name: "Golden Gate Mortgage – Lead Gen", client: "Golden Gate Mortgage", leadSource: "Referral", salesRep: "Jordan M.", stage: "Negotiation", dealValue: 54000, monthlyValue: 4500, sentDate: "May 20, 2025", lastActivity: "Jun 9, 2025", priority: "Urgent", auditFindings: "Outdated conversion tracking, poor Quality Scores.", negotiationNotes: "Client wants to add Meta Ads at reduced rate.", affiliate: null, pricing: { setupFee: 2500, monthlyRecurring: 4500, contractTermMonths: 12, totalContractValue: 56500, discount: 1000, finalApprovedValue: 55500, paymentTerms: "Net 15" }, services: [{ name: "SEO", included: false, monthlyValue: 0, setupFee: 0, department: "SEO & Local", launchRequired: false }, { name: "GBP", included: false, monthlyValue: 0, setupFee: 0, department: "SEO & Local", launchRequired: false }, { name: "PPC", included: true, monthlyValue: 3500, setupFee: 1500, department: "Paid Ads", launchRequired: true }, { name: "Meta Ads", included: true, monthlyValue: 700, setupFee: 700, department: "Paid Ads", launchRequired: true }, { name: "LSA", included: false, monthlyValue: 0, setupFee: 0, department: "LSA", launchRequired: false }, { name: "Reporting", included: true, monthlyValue: 300, setupFee: 0, department: "Analytics", launchRequired: false }, { name: "Web", included: false, monthlyValue: 0, setupFee: 0, department: "Web Dev", launchRequired: false }, { name: "Creative", included: false, monthlyValue: 0, setupFee: 0, department: "Creative", launchRequired: false }], approvalChecklist: [{ label: "Pricing confirmed", checked: false }, { label: "Services confirmed", checked: false }, { label: "Contract term confirmed", checked: true }, { label: "Decision maker confirmed", checked: true }, { label: "Internal review complete", checked: true }, { label: "Client approved", checked: false }, { label: "Billing notes added", checked: false }, { label: "Ready for handoff", checked: false }], handoffReadiness: { proposalApproved: false, contractSigned: false, servicesConfirmed: false, contractValueConfirmed: false, setupFeeConfirmed: false, billingNotesAdded: false, billingContactConfirmed: false, readyToSendToBilling: false }, timeline: [{ date: "May 18", event: "Proposal drafted", actor: "Jordan M." }, { date: "May 19", event: "Internal review passed", actor: "Director" }, { date: "May 20", event: "Proposal sent", actor: "Jordan M." }, { date: "May 26", event: "Proposal viewed", actor: "System" }, { date: "Jun 9", event: "Negotiation started — Meta Ads requested", actor: "Jordan M." }] },
  { id: "prop-024", name: "Evergreen Landscaping – SEO + GBP", client: "Evergreen Landscaping", leadSource: "Inbound", salesRep: "Sarah K.", stage: "Draft", dealValue: 16800, monthlyValue: 1400, sentDate: null, lastActivity: "Jun 10, 2025", priority: "Low", auditFindings: "Basic SEO issues, GBP unclaimed.", negotiationNotes: "", affiliate: null, pricing: { setupFee: 700, monthlyRecurring: 1400, contractTermMonths: 12, totalContractValue: 17500, discount: 0, finalApprovedValue: 17500, paymentTerms: "Net 30" }, services: [{ name: "SEO", included: true, monthlyValue: 1000, setupFee: 400, department: "SEO & Local", launchRequired: true }, { name: "GBP", included: true, monthlyValue: 400, setupFee: 300, department: "SEO & Local", launchRequired: false }, { name: "PPC", included: false, monthlyValue: 0, setupFee: 0, department: "Paid Ads", launchRequired: false }, { name: "Meta Ads", included: false, monthlyValue: 0, setupFee: 0, department: "Paid Ads", launchRequired: false }, { name: "LSA", included: false, monthlyValue: 0, setupFee: 0, department: "LSA", launchRequired: false }, { name: "Reporting", included: false, monthlyValue: 0, setupFee: 0, department: "Analytics", launchRequired: false }, { name: "Web", included: false, monthlyValue: 0, setupFee: 0, department: "Web Dev", launchRequired: false }, { name: "Creative", included: false, monthlyValue: 0, setupFee: 0, department: "Creative", launchRequired: false }], approvalChecklist: [{ label: "Pricing confirmed", checked: false }, { label: "Services confirmed", checked: false }, { label: "Contract term confirmed", checked: false }, { label: "Decision maker confirmed", checked: false }, { label: "Internal review complete", checked: false }, { label: "Client approved", checked: false }, { label: "Billing notes added", checked: false }, { label: "Ready for handoff", checked: false }], handoffReadiness: { proposalApproved: false, contractSigned: false, servicesConfirmed: false, contractValueConfirmed: false, setupFeeConfirmed: false, billingNotesAdded: false, billingContactConfirmed: false, readyToSendToBilling: false }, timeline: [{ date: "Jun 10", event: "Proposal created", actor: "Sarah K." }] },
  { id: "prop-025", name: "Pacific Prime Insurance – SEO + PPC", client: "Pacific Prime Insurance", leadSource: "Affiliate", salesRep: "Mike T.", stage: "Pushed to Handoff", dealValue: 60000, monthlyValue: 5000, sentDate: "May 5, 2025", lastActivity: "Jun 2, 2025", priority: "Urgent", auditFindings: "Comprehensive multi-channel audit complete.", negotiationNotes: "Successfully negotiated full-service package.", affiliate: { name: "Karen Lu", referralCode: "KL-INS", commissionModel: "8% MRR", potentialCommission: 4800, status: "Paid" }, pricing: { setupFee: 3000, monthlyRecurring: 5000, contractTermMonths: 12, totalContractValue: 63000, discount: 500, finalApprovedValue: 62500, paymentTerms: "Net 15" }, services: [{ name: "SEO", included: true, monthlyValue: 2000, setupFee: 800, department: "SEO & Local", launchRequired: true }, { name: "GBP", included: false, monthlyValue: 0, setupFee: 0, department: "SEO & Local", launchRequired: false }, { name: "PPC", included: true, monthlyValue: 2500, setupFee: 1200, department: "Paid Ads", launchRequired: true }, { name: "Meta Ads", included: false, monthlyValue: 0, setupFee: 0, department: "Paid Ads", launchRequired: false }, { name: "LSA", included: false, monthlyValue: 0, setupFee: 0, department: "LSA", launchRequired: false }, { name: "Reporting", included: true, monthlyValue: 500, setupFee: 0, department: "Analytics", launchRequired: false }, { name: "Web", included: false, monthlyValue: 0, setupFee: 0, department: "Web Dev", launchRequired: false }, { name: "Creative", included: false, monthlyValue: 0, setupFee: 0, department: "Creative", launchRequired: false }], approvalChecklist: [{ label: "Pricing confirmed", checked: true }, { label: "Services confirmed", checked: true }, { label: "Contract term confirmed", checked: true }, { label: "Decision maker confirmed", checked: true }, { label: "Internal review complete", checked: true }, { label: "Client approved", checked: true }, { label: "Billing notes added", checked: true }, { label: "Ready for handoff", checked: true }], handoffReadiness: { proposalApproved: true, contractSigned: true, servicesConfirmed: true, contractValueConfirmed: true, setupFeeConfirmed: true, billingNotesAdded: true, billingContactConfirmed: true, readyToSendToBilling: true }, timeline: [{ date: "May 1", event: "Audit completed", actor: "Chris B." }, { date: "May 3", event: "Proposal drafted", actor: "Mike T." }, { date: "May 4", event: "Internal review passed", actor: "Director" }, { date: "May 5", event: "Proposal sent", actor: "Mike T." }, { date: "May 10", event: "Proposal viewed", actor: "System" }, { date: "May 20", event: "Negotiation started", actor: "Mike T." }, { date: "May 28", event: "Approved by client", actor: "Mike T." }, { date: "Jun 2", event: "Pushed to handoff", actor: "Mike T." }] },
];

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const PIPELINE_STAGES: ProposalStage[] = [
  "Draft",
  "Internal Review",
  "Ready to Send",
  "Sent",
  "Viewed",
  "Negotiation",
  "Approved",
  "Rejected",
  "Pushed to Handoff",
];

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

const PRIORITY_COLORS: Record<Priority, { bg: string; text: string }> = {
  "Low":    { bg: "#F3F4F6", text: "#6B7280" },
  "Medium": { bg: "#FFF7ED", text: "#C2410C" },
  "High":   { bg: "#EFF6FF", text: "#1D4ED8" },
  "Urgent": { bg: "#FFF1F2", text: "#BE123C" },
};

const COMMISSION_STATUS_COLORS: Record<CommissionStatus, { bg: string; text: string }> = {
  "Not Eligible":                 { bg: "#F3F4F6", text: "#6B7280" },
  "Pending Approval":             { bg: "#FFF7ED", text: "#C2410C" },
  "Eligible After Invoice Paid":  { bg: "#EFF6FF", text: "#1D4ED8" },
  "Approved":                     { bg: "#F0FDF4", text: "#15803D" },
  "Paid":                         { bg: "#ECFDF5", text: "#047857" },
};

const SERVICE_ICONS: Record<string, string> = {
  SEO: "🔍", GBP: "📍", PPC: "🎯", "Meta Ads": "📱",
  LSA: "⭐", Reporting: "📊", Web: "🖥️", Creative: "🎨",
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `$${n}`;

function StageBadge({ stage }: { stage: ProposalStage }) {
  const c = STAGE_COLORS[stage];
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
      style={{ background: c.bg, color: c.text, borderColor: c.border }}>
      {stage}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const c = PRIORITY_COLORS[priority];
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: c.bg, color: c.text }}>
      {priority}
    </span>
  );
}

function CommissionBadge({ status }: { status: CommissionStatus }) {
  const c = COMMISSION_STATUS_COLORS[status];
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: c.bg, color: c.text }}>
      {status}
    </span>
  );
}

function CheckItem({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className="flex items-center gap-2 py-1.5" style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
      <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
        style={{ background: checked ? "#ECFDF5" : "#F3F4F6", border: `1px solid ${checked ? "#A7F3D0" : "#D1D5DB"}` }}>
        {checked && <span className="text-[10px] text-emerald-600 font-bold">✓</span>}
      </div>
      <span className="text-xs" style={{ color: checked ? "var(--rtm-text-primary)" : "var(--rtm-text-muted)", textDecoration: checked ? "none" : "none" }}>
        {label}
      </span>
    </div>
  );
}

function HandoffItem({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
      <span className="text-xs" style={{ color: "var(--rtm-text-primary)" }}>{label}</span>
      <span className="text-xs font-bold" style={{ color: checked ? "#059669" : "#DC2626" }}>
        {checked ? "✅ Complete" : "⏳ Pending"}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI Cards
// ─────────────────────────────────────────────────────────────────────────────

function KpiCards({ proposals }: { proposals: Proposal[] }) {
  const count = (stage: ProposalStage) => proposals.filter((p) => p.stage === stage).length;
  const totalValue = proposals
    .filter((p) => !["Rejected"].includes(p.stage))
    .reduce((s, p) => s + p.dealValue, 0);

  const cards = [
    { label: "Draft Proposals",    value: count("Draft"),            icon: "📝", color: "#6B7280", bg: "#F9FAFB" },
    { label: "Pending Review",     value: count("Internal Review"),  icon: "🔄", color: "#C2410C", bg: "#FFF7ED" },
    { label: "Proposals Sent",     value: count("Sent"),             icon: "📤", color: "#0369A1", bg: "#F0F9FF" },
    { label: "Proposals Viewed",   value: count("Viewed"),           icon: "👁",  color: "#6D28D9", bg: "#F5F3FF" },
    { label: "In Negotiation",     value: count("Negotiation"),      icon: "💬", color: "#A16207", bg: "#FEFCE8" },
    { label: "Approved Proposals", value: count("Approved"),         icon: "✅", color: "#15803D", bg: "#F0FDF4" },
    { label: "Rejected Proposals", value: count("Rejected"),         icon: "❌", color: "#BE123C", bg: "#FFF1F2" },
    { label: "Proposal Value",     value: `$${(totalValue / 1000).toFixed(0)}k`, icon: "💰", color: "#059669", bg: "#ECFDF5" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border p-4 text-center"
          style={{ background: c.bg, borderColor: `${c.color}25` }}>
          <div className="text-2xl mb-1">{c.icon}</div>
          <div className="text-xl font-black" style={{ color: c.color }}>{c.value}</div>
          <div className="text-[10px] font-semibold mt-0.5 leading-tight" style={{ color: c.color }}>{c.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Proposal Pipeline
// ─────────────────────────────────────────────────────────────────────────────

function ProposalPipeline({ proposals, onSelect }: { proposals: Proposal[]; onSelect: (p: Proposal) => void }) {
  const stages = PIPELINE_STAGES.filter((s) => s !== "Rejected");
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-3 pb-3 min-w-max">
        {stages.map((stage) => {
          const stageProposals = proposals.filter((p) => p.stage === stage);
          const c = STAGE_COLORS[stage];
          const totalVal = stageProposals.reduce((s, p) => s + p.monthlyValue, 0);
          return (
            <div key={stage} className="w-52 flex-shrink-0">
              {/* Column Header */}
              <div className="rounded-lg px-3 py-2 mb-2 flex items-center justify-between"
                style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                <span className="text-[11px] font-bold" style={{ color: c.text }}>{stage}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold rounded-full px-1.5 py-0.5"
                    style={{ background: c.border, color: c.text }}>
                    {stageProposals.length}
                  </span>
                </div>
              </div>
              {totalVal > 0 && (
                <div className="text-[10px] font-semibold text-center mb-2" style={{ color: "#059669" }}>
                  {fmt(totalVal)}/mo
                </div>
              )}
              {/* Cards */}
              <div className="space-y-2">
                {stageProposals.map((p) => (
                  <div key={p.id}
                    onClick={() => onSelect(p)}
                    className="rounded-lg border p-3 cursor-pointer transition-all hover:shadow-sm"
                    style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                    <p className="text-[11px] font-semibold leading-tight mb-1.5"
                      style={{ color: "var(--rtm-text-primary)" }}>
                      {p.client}
                    </p>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold" style={{ color: "#059669" }}>
                        {fmt(p.monthlyValue)}/mo
                      </span>
                      <PriorityBadge priority={p.priority} />
                    </div>
                    <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{p.salesRep}</p>
                    {p.affiliate && (
                      <div className="mt-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full w-fit"
                        style={{ background: "#ECFDF5", color: "#059669" }}>
                        🤝 Affiliate
                      </div>
                    )}
                  </div>
                ))}
                {stageProposals.length === 0 && (
                  <div className="rounded-lg border border-dashed p-4 text-center"
                    style={{ borderColor: "var(--rtm-border-light)" }}>
                    <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>Empty</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Proposal Table
// ─────────────────────────────────────────────────────────────────────────────

function ProposalTable({ proposals, onSelect }: { proposals: Proposal[]; onSelect: (p: Proposal) => void }) {
  const [stageFilter, setStageFilter] = useState<string>("All");
  const [repFilter, setRepFilter] = useState<string>("All");

  const filtered = proposals.filter((p) => {
    const stageOk = stageFilter === "All" || p.stage === stageFilter;
    const repOk = repFilter === "All" || p.salesRep === repFilter;
    return stageOk && repOk;
  });

  const reps = Array.from(new Set(proposals.map((p) => p.salesRep)));

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          className="text-xs rounded-lg border px-3 py-1.5 focus:outline-none"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
          value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
          <option value="All">All Stages</option>
          {PIPELINE_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          className="text-xs rounded-lg border px-3 py-1.5 focus:outline-none"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
          value={repFilter} onChange={(e) => setRepFilter(e.target.value)}>
          <option value="All">All Reps</option>
          {reps.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <span className="text-xs py-1.5" style={{ color: "var(--rtm-text-muted)" }}>
          {filtered.length} proposal{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--rtm-border)" }}>
        <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
              {["Proposal", "Client", "Lead Source", "Sales Rep", "Stage", "Deal Value", "Monthly", "Services", "Affiliate", "Commission", "Sent", "Last Activity", "Priority", "Actions"].map((h) => (
                <th key={h} className="text-left px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
                  style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => {
              const includedServices = p.services.filter((s) => s.included).map((s) => s.name);
              return (
                <tr key={p.id}
                  className="cursor-pointer transition-colors"
                  style={{ borderBottom: "1px solid var(--rtm-border-light)", background: i % 2 === 0 ? "var(--rtm-bg)" : "var(--rtm-surface)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "var(--rtm-blue-xlight)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? "var(--rtm-bg)" : "var(--rtm-surface)"; }}>
                  <td className="px-3 py-2.5 max-w-[180px]">
                    <span className="font-semibold text-xs leading-tight" style={{ color: "var(--rtm-text-primary)" }}>{p.name}</span>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span style={{ color: "var(--rtm-text-secondary)" }}>{p.client}</span>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: p.leadSource === "Affiliate" ? "#ECFDF5" : "#F3F4F6", color: p.leadSource === "Affiliate" ? "#059669" : "#6B7280" }}>
                      {p.leadSource}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{p.salesRep}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap"><StageBadge stage={p.stage} /></td>
                  <td className="px-3 py-2.5 whitespace-nowrap font-bold" style={{ color: "var(--rtm-text-primary)" }}>{fmt(p.dealValue)}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap font-semibold" style={{ color: "#059669" }}>{fmt(p.monthlyValue)}/mo</td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-0.5 max-w-[120px]">
                      {includedServices.map((s) => (
                        <span key={s} className="text-[9px] px-1 py-0.5 rounded"
                          style={{ background: "#EFF6FF", color: "#1D4ED8" }}>{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    {p.affiliate ? (
                      <span className="text-xs font-semibold" style={{ color: "#059669" }}>{p.affiliate.name}</span>
                    ) : (
                      <span style={{ color: "var(--rtm-text-muted)" }}>—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    {p.affiliate ? (
                      <span className="font-bold" style={{ color: "#D97706" }}>{fmt(p.affiliate.potentialCommission)}</span>
                    ) : (
                      <span style={{ color: "var(--rtm-text-muted)" }}>—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{p.sentDate ?? "—"}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{p.lastActivity}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap"><PriorityBadge priority={p.priority} /></td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <button onClick={() => onSelect(p)}
                      className="text-[10px] font-semibold px-2 py-1 rounded border transition-colors"
                      style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>
                      View
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

// ─────────────────────────────────────────────────────────────────────────────
// Proposal Detail Drawer
// ─────────────────────────────────────────────────────────────────────────────

type DrawerTab = "overview" | "pricing" | "services" | "approval" | "handoff" | "affiliate" | "tasks" | "timeline" | "notes";

function ProposalDrawer({ proposal, onClose }: { proposal: Proposal; onClose: () => void }) {
  const [tab, setTab] = useState<DrawerTab>("overview");

  const drawerTabs: { key: DrawerTab; label: string; icon: string }[] = [
    { key: "overview",  label: "Overview",   icon: "📋" },
    { key: "pricing",   label: "Pricing",    icon: "💰" },
    { key: "services",  label: "Services",   icon: "🔧" },
    { key: "approval",  label: "Approval",   icon: "✅" },
    { key: "handoff",   label: "Handoff",    icon: "🚀" },
    { key: "affiliate", label: "Affiliate",  icon: "🤝" },
    { key: "tasks",     label: "Tasks",      icon: "📌" },
    { key: "timeline",  label: "Timeline",   icon: "🕐" },
    { key: "notes",     label: "Notes",      icon: "📝" },
  ];

  const allChecked = proposal.approvalChecklist.every((c) => c.checked);
  const checkedCount = proposal.approvalChecklist.filter((c) => c.checked).length;

  return (
    <div className="fixed inset-0 z-50 flex" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="ml-auto h-full w-full max-w-2xl flex flex-col overflow-hidden shadow-2xl"
        style={{ background: "var(--rtm-bg)", borderLeft: "1px solid var(--rtm-border)" }}
        onClick={(e) => e.stopPropagation()}>

        {/* Drawer Header */}
        <div className="flex items-start justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--rtm-border)", background: "var(--rtm-surface)" }}>
          <div className="flex-1 min-w-0 mr-4">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <StageBadge stage={proposal.stage} />
              <PriorityBadge priority={proposal.priority} />
              {proposal.affiliate && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: "#ECFDF5", color: "#059669" }}>🤝 Affiliate</span>
              )}
            </div>
            <h2 className="text-sm font-bold leading-tight" style={{ color: "var(--rtm-text-primary)" }}>{proposal.name}</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{proposal.client} · {proposal.salesRep}</p>
          </div>
          <button onClick={onClose} className="text-xl leading-none flex-shrink-0 mt-0.5"
            style={{ color: "var(--rtm-text-muted)" }}>✕</button>
        </div>

        {/* Row Actions */}
        <div className="px-5 py-2.5 flex flex-wrap gap-1.5 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--rtm-border-light)", background: "var(--rtm-surface)" }}>
          {[
            ["View Proposal", "👁"],
            ["Edit Proposal", "✏️"],
            ["Send Proposal", "📤"],
            ["Mark Viewed", "👀"],
            ["Move to Negotiation", "💬"],
            ["Mark Approved", "✅"],
            ["Mark Rejected", "❌"],
            ["Push to Handoff", "🚀"],
            ["Create Task", "📌"],
            ["Add Note", "📝"],
          ].map(([label, icon]) => (
            <button key={label}
              onClick={() => alert(`[Mock] ${label}`)}
              className="text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all"
              style={{ background: label === "Push to Handoff" || label === "Mark Approved" ? "#F0FDF4" : "var(--rtm-bg)", borderColor: label === "Push to Handoff" || label === "Mark Approved" ? "#A7F3D0" : "var(--rtm-border)", color: label === "Push to Handoff" || label === "Mark Approved" ? "#15803D" : "var(--rtm-text-secondary)" }}>
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Drawer Tabs */}
        <div className="flex overflow-x-auto flex-shrink-0 px-5"
          style={{ borderBottom: "1px solid var(--rtm-border-light)", background: "var(--rtm-surface)" }}>
          {drawerTabs.map((t) => (
            <button key={t.key}
              onClick={() => setTab(t.key)}
              className="flex items-center gap-1 px-3 py-2.5 text-[11px] font-semibold whitespace-nowrap transition-colors"
              style={{
                color: tab === t.key ? "#1D4ED8" : "var(--rtm-text-muted)",
                borderBottom: tab === t.key ? "2px solid #1D4ED8" : "2px solid transparent",
              }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* OVERVIEW */}
          {tab === "overview" && (
            <div className="space-y-4">
              <div className="rounded-xl border p-4 space-y-3"
                style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                <p className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>Proposal Overview</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Client", proposal.client],
                    ["Sales Rep", proposal.salesRep],
                    ["Lead Source", proposal.leadSource],
                    ["Stage", proposal.stage],
                    ["Deal Value", fmt(proposal.dealValue)],
                    ["Monthly Value", `${fmt(proposal.monthlyValue)}/mo`],
                    ["Sent Date", proposal.sentDate ?? "Not sent"],
                    ["Last Activity", proposal.lastActivity],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: "var(--rtm-text-muted)" }}>{label}</p>
                      <p className="text-xs font-semibold mt-0.5" style={{ color: "var(--rtm-text-primary)" }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {proposal.auditFindings && (
                <div className="rounded-xl border p-4" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
                  <p className="text-xs font-bold mb-1 text-amber-800">🔍 Audit Findings</p>
                  <p className="text-xs text-amber-700">{proposal.auditFindings}</p>
                </div>
              )}

              {proposal.negotiationNotes && (
                <div className="rounded-xl border p-4" style={{ background: "#F5F3FF", borderColor: "#DDD6FE" }}>
                  <p className="text-xs font-bold mb-1 text-purple-800">💬 Negotiation Notes</p>
                  <p className="text-xs text-purple-700">{proposal.negotiationNotes}</p>
                </div>
              )}

              {/* Workflow */}
              <div className="rounded-xl border p-4" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>⚙️ Workflow</p>
                  <Link href="/admin/workflows" className="text-[10px] font-semibold" style={{ color: "#1D4ED8" }}>Manage Workflows →</Link>
                </div>
                <div className="flex flex-wrap items-center gap-1 text-[10px]">
                  {[
                    "Audit Complete", "Proposal Draft", "Proposal Sent", "Proposal Approved", "Sales Handoff", "Billing Requested"
                  ].map((step, i, arr) => {
                    const stageMap: Record<string, ProposalStage[]> = {
                      "Audit Complete": ["Draft"],
                      "Proposal Draft": ["Draft", "Internal Review"],
                      "Proposal Sent": ["Sent", "Viewed"],
                      "Proposal Approved": ["Approved"],
                      "Sales Handoff": ["Pushed to Handoff"],
                      "Billing Requested": ["Pushed to Handoff"],
                    };
                    const active = stageMap[step]?.includes(proposal.stage);
                    const isPast = arr.findIndex((s) => stageMap[s]?.includes(proposal.stage)) > i;
                    return (
                      <React.Fragment key={step}>
                        <span className="px-2 py-1 rounded-full font-semibold"
                          style={{
                            background: active ? "#EFF6FF" : isPast ? "#F0FDF4" : "#F9FAFB",
                            color: active ? "#1D4ED8" : isPast ? "#059669" : "#9CA3AF",
                            border: `1px solid ${active ? "#BFDBFE" : isPast ? "#A7F3D0" : "#E5E7EB"}`,
                          }}>
                          {isPast ? "✓ " : active ? "▶ " : ""}{step}
                        </span>
                        {i < arr.length - 1 && <span style={{ color: "#D1D5DB" }}>→</span>}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Notifications */}
              <div className="rounded-xl border p-4" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>🔔 Notification Triggers</p>
                  <Link href="/notifications" className="text-[10px] font-semibold" style={{ color: "#1D4ED8" }}>View All →</Link>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["Proposal Ready to Send", "Proposal Viewed", "Proposal Approved", "Proposal Rejected", "Proposal Needs Follow-Up"].map((n) => (
                    <span key={n} className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: "#F0F9FF", color: "#0369A1", border: "1px solid #BAE6FD" }}>{n}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PRICING */}
          {tab === "pricing" && (
            <div className="space-y-4">
              <div className="rounded-xl border p-4" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                <p className="text-xs font-bold mb-4" style={{ color: "var(--rtm-text-primary)" }}>💰 Pricing Summary</p>
                <div className="space-y-2">
                  {[
                    ["Setup Fee", `$${proposal.pricing.setupFee.toLocaleString()}`, false],
                    ["Monthly Recurring Value", `$${proposal.pricing.monthlyRecurring.toLocaleString()}/mo`, false],
                    ["Contract Term", `${proposal.pricing.contractTermMonths} months`, false],
                    ["Total Contract Value", `$${proposal.pricing.totalContractValue.toLocaleString()}`, false],
                    ["Discount", proposal.pricing.discount > 0 ? `-$${proposal.pricing.discount.toLocaleString()}` : "—", false],
                    ["Final Approved Value", `$${proposal.pricing.finalApprovedValue.toLocaleString()}`, true],
                    ["Payment Terms", proposal.pricing.paymentTerms, false],
                  ].map(([label, value, highlight]) => (
                    <div key={String(label)} className="flex items-center justify-between py-2"
                      style={{ borderBottom: "1px solid var(--rtm-border-light)", background: highlight ? "#F0FDF420" : "transparent" }}>
                      <span className="text-xs" style={{ color: "var(--rtm-text-secondary)", fontWeight: highlight ? 700 : 400 }}>{String(label)}</span>
                      <span className="text-xs font-bold" style={{ color: highlight ? "#059669" : "var(--rtm-text-primary)" }}>{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SERVICES */}
          {tab === "services" && (
            <div className="space-y-3">
              <p className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>🔧 Services Included</p>
              {proposal.services.map((svc) => (
                <div key={svc.name} className="rounded-lg border p-3"
                  style={{ background: svc.included ? "var(--rtm-surface)" : "#FAFAFA", borderColor: svc.included ? "var(--rtm-border)" : "var(--rtm-border-light)", opacity: svc.included ? 1 : 0.5 }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{SERVICE_ICONS[svc.name] ?? "🔧"}</span>
                      <span className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>{svc.name}</span>
                      {svc.included ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: "#F0FDF4", color: "#15803D", border: "1px solid #BBF7D0" }}>✓ Included</span>
                      ) : (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: "#F3F4F6", color: "#9CA3AF" }}>Not Included</span>
                      )}
                    </div>
                    {svc.included && (
                      <span className="text-xs font-bold" style={{ color: "#059669" }}>
                        {fmt(svc.monthlyValue)}/mo
                      </span>
                    )}
                  </div>
                  {svc.included && (
                    <div className="grid grid-cols-4 gap-2 text-[10px]">
                      <div>
                        <p style={{ color: "var(--rtm-text-muted)" }}>Setup Fee</p>
                        <p className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>${svc.setupFee.toLocaleString()}</p>
                      </div>
                      <div>
                        <p style={{ color: "var(--rtm-text-muted)" }}>Department</p>
                        <p className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{svc.department}</p>
                      </div>
                      <div>
                        <p style={{ color: "var(--rtm-text-muted)" }}>Launch Req.</p>
                        <p className="font-semibold" style={{ color: svc.launchRequired ? "#D97706" : "#6B7280" }}>
                          {svc.launchRequired ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* APPROVAL CHECKLIST */}
          {tab === "approval" && (
            <div className="space-y-4">
              <div className="rounded-xl border p-4" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>✅ Approval Checklist</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: allChecked ? "#F0FDF4" : "#FFF7ED", color: allChecked ? "#15803D" : "#C2410C" }}>
                    {checkedCount}/{proposal.approvalChecklist.length} Complete
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 rounded-full mb-4" style={{ background: "var(--rtm-border-light)" }}>
                  <div className="h-2 rounded-full transition-all"
                    style={{ width: `${(checkedCount / proposal.approvalChecklist.length) * 100}%`, background: allChecked ? "#059669" : "#D97706" }} />
                </div>
                {proposal.approvalChecklist.map((item) => (
                  <CheckItem key={item.label} label={item.label} checked={item.checked} />
                ))}
              </div>

              {proposal.stage === "Approved" && (
                <div className="rounded-xl border p-4 flex items-center gap-3"
                  style={{ background: "#F0FDF4", borderColor: "#A7F3D0" }}>
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="text-xs font-bold text-emerald-800">Proposal Approved</p>
                    <p className="text-xs text-emerald-700">This proposal is approved and ready to move to Sales Handoff.</p>
                    <Link href="/sales/handoffs"
                      className="text-xs font-bold mt-1 inline-block" style={{ color: "#059669" }}>
                      → Open Handoff Center
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* HANDOFF READINESS */}
          {tab === "handoff" && (
            <div className="space-y-4">
              <div className="rounded-xl border p-4" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>🚀 Handoff Readiness</p>
                  {proposal.handoffReadiness.readyToSendToBilling ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#F0FDF4", color: "#15803D", border: "1px solid #A7F3D0" }}>✅ Ready</span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#FFF7ED", color: "#C2410C", border: "1px solid #FED7AA" }}>⏳ Not Ready</span>
                  )}
                </div>
                <HandoffItem label="Proposal Approved" checked={proposal.handoffReadiness.proposalApproved} />
                <HandoffItem label="Contract Signed" checked={proposal.handoffReadiness.contractSigned} />
                <HandoffItem label="Services Confirmed" checked={proposal.handoffReadiness.servicesConfirmed} />
                <HandoffItem label="Contract Value Confirmed" checked={proposal.handoffReadiness.contractValueConfirmed} />
                <HandoffItem label="Setup Fee Confirmed" checked={proposal.handoffReadiness.setupFeeConfirmed} />
                <HandoffItem label="Billing Notes Added" checked={proposal.handoffReadiness.billingNotesAdded} />
                <HandoffItem label="Billing Contact Confirmed" checked={proposal.handoffReadiness.billingContactConfirmed} />
                <HandoffItem label="Ready to Send to Billing" checked={proposal.handoffReadiness.readyToSendToBilling} />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => alert("[Mock] Push to Handoff")}
                  className="px-4 py-2 rounded-lg text-xs font-bold transition-all"
                  style={{ background: "#F0FDF4", color: "#15803D", border: "1px solid #A7F3D0" }}>
                  🚀 Push to Handoff
                </button>
                <Link href="/sales/handoffs"
                  className="px-4 py-2 rounded-lg text-xs font-bold transition-all inline-flex items-center"
                  style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}>
                  Open Handoff Center →
                </Link>
              </div>
              {proposal.stage === "Approved" && !proposal.handoffReadiness.readyToSendToBilling && (
                <div className="rounded-xl border p-4" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
                  <p className="text-xs font-bold text-amber-800 mb-1">⚠️ Proposal Approved — Action Required</p>
                  <p className="text-xs text-amber-700">This proposal has been approved. Complete all handoff readiness items above, then push to Sales Handoff to trigger the billing request workflow.</p>
                </div>
              )}
            </div>
          )}

          {/* AFFILIATE */}
          {tab === "affiliate" && (
            <div className="space-y-4">
              {proposal.affiliate ? (
                <div className="space-y-4">
                  <div className="rounded-xl border p-4" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                    <p className="text-xs font-bold mb-4" style={{ color: "var(--rtm-text-primary)" }}>🤝 Affiliate Attribution</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ["Affiliate Name", proposal.affiliate.name],
                        ["Referral Code", proposal.affiliate.referralCode],
                        ["Commission Model", proposal.affiliate.commissionModel],
                        ["Potential Commission", `$${proposal.affiliate.potentialCommission.toLocaleString()}`],
                      ].map(([label, value]) => (
                        <div key={String(label)}>
                          <p className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: "var(--rtm-text-muted)" }}>{String(label)}</p>
                          <p className="text-xs font-semibold mt-0.5" style={{ color: "var(--rtm-text-primary)" }}>{String(value)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: "var(--rtm-text-muted)" }}>Commission Eligibility</p>
                      <CommissionBadge status={proposal.affiliate.status} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-8 text-center" style={{ borderColor: "var(--rtm-border-light)" }}>
                  <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>No affiliate attribution for this proposal.</p>
                </div>
              )}
            </div>
          )}

          {/* TASKS */}
          {tab === "tasks" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>📌 Tasks</p>
                <Link href="/tasks" className="text-[10px] font-semibold" style={{ color: "#1D4ED8" }}>View All Tasks →</Link>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Review Proposal", status: "Completed", assignee: proposal.salesRep, due: "Jun 2" },
                  { label: "Send Proposal", status: proposal.sentDate ? "Completed" : "Pending", assignee: proposal.salesRep, due: "Jun 5" },
                  { label: "Follow Up", status: ["Negotiation", "Viewed"].includes(proposal.stage) ? "In Progress" : "Pending", assignee: proposal.salesRep, due: "Jun 10" },
                  { label: "Collect Signature", status: proposal.handoffReadiness.contractSigned ? "Completed" : "Pending", assignee: proposal.salesRep, due: "Jun 12" },
                  { label: "Push to Handoff", status: proposal.stage === "Pushed to Handoff" ? "Completed" : "Pending", assignee: proposal.salesRep, due: "Jun 15" },
                ].map((task) => (
                  <div key={task.label} className="rounded-lg border p-3 flex items-center justify-between"
                    style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                        style={{
                          background: task.status === "Completed" ? "#ECFDF5" : task.status === "In Progress" ? "#EFF6FF" : "#F3F4F6",
                          border: `1px solid ${task.status === "Completed" ? "#A7F3D0" : task.status === "In Progress" ? "#BFDBFE" : "#D1D5DB"}`
                        }}>
                        <span className="text-[10px]">
                          {task.status === "Completed" ? "✓" : task.status === "In Progress" ? "▶" : ""}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{task.label}</p>
                        <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{task.assignee} · Due {task.due}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: task.status === "Completed" ? "#F0FDF4" : task.status === "In Progress" ? "#EFF6FF" : "#F3F4F6",
                        color: task.status === "Completed" ? "#15803D" : task.status === "In Progress" ? "#1D4ED8" : "#6B7280"
                      }}>
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
              <button onClick={() => alert("[Mock] Create Task")} className="w-full py-2 rounded-lg border text-xs font-semibold transition-all"
                style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)", borderStyle: "dashed" }}>
                + Create Task
              </button>
            </div>
          )}

          {/* TIMELINE */}
          {tab === "timeline" && (
            <div className="space-y-4">
              <p className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>🕐 Proposal Timeline</p>
              <div className="relative">
                <div className="absolute left-2.5 top-0 bottom-0 w-px" style={{ background: "var(--rtm-border)" }} />
                <div className="space-y-4 pl-8">
                  {proposal.timeline.map((event, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-5 w-3 h-3 rounded-full border-2"
                        style={{ background: i === proposal.timeline.length - 1 ? "#1D4ED8" : "var(--rtm-surface)", borderColor: i === proposal.timeline.length - 1 ? "#1D4ED8" : "var(--rtm-border)", top: "2px" }} />
                      <div className="rounded-lg border p-3" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{event.event}</p>
                          <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{event.date}</span>
                        </div>
                        <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>by {event.actor}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* NOTES */}
          {tab === "notes" && (
            <div className="space-y-4">
              <p className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>📝 Notes</p>
              <textarea
                placeholder="Add a note about this proposal..."
                rows={5}
                className="w-full text-xs rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
              />
              <button onClick={() => alert("[Mock] Save Note")} className="px-4 py-2 rounded-lg text-xs font-bold"
                style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}>
                Save Note
              </button>
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

export default function SalesProposalsPage() {
  const [view, setView] = useState<"pipeline" | "table">("pipeline");
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [stageFilterPage, setStageFilterPage] = useState<string>("All");

  const filteredProposals = stageFilterPage === "All"
    ? MOCK_PROPOSALS
    : MOCK_PROPOSALS.filter((p) => p.stage === stageFilterPage);

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "#1D4ED8" }}>Sales</p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Proposal Management Center</h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          Manage proposal drafts, approvals, services sold, pricing, negotiations, and handoff readiness.
        </p>
      </div>

      {/* ── Top Action Bar ── */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => alert("[Mock] New Proposal")}
          className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
          style={{ background: "#1D4ED8", color: "#fff" }}>
          + New Proposal
        </button>
        <button onClick={() => alert("[Mock] Generate From Audit")}
          className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all"
          style={{ background: "#F5F3FF", color: "#6D28D9", borderColor: "#DDD6FE" }}>
          ✨ Generate From Audit
        </button>
        <button onClick={() => alert("[Mock] Send Proposal")}
          className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all"
          style={{ background: "#F0F9FF", color: "#0369A1", borderColor: "#BAE6FD" }}>
          📤 Send Proposal
        </button>
        <button onClick={() => alert("[Mock] Export Proposals")}
          className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all"
          style={{ background: "#F3F4F6", color: "#374151", borderColor: "#D1D5DB" }}>
          ⬇ Export Proposals
        </button>
        <button onClick={() => alert("[Mock] Proposal Templates")}
          className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all"
          style={{ background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" }}>
          📋 Proposal Templates
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <KpiCards proposals={MOCK_PROPOSALS} />

      {/* ── Workflow Banner ── */}
      <div className="rounded-xl border p-4" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>⚙️ Proposal Lifecycle</p>
          <Link href="/admin/workflows" className="text-[10px] font-semibold" style={{ color: "#1D4ED8" }}>Manage Workflows →</Link>
        </div>
        <div className="flex flex-wrap items-center gap-1 text-[11px]">
          {[
            { label: "Audit Complete", color: "#6B7280", bg: "#F3F4F6" },
            { label: "Proposal Draft", color: "#6B7280", bg: "#F3F4F6" },
            { label: "Internal Review", color: "#C2410C", bg: "#FFF7ED" },
            { label: "Proposal Sent", color: "#0369A1", bg: "#F0F9FF" },
            { label: "Viewed", color: "#6D28D9", bg: "#F5F3FF" },
            { label: "Negotiation", color: "#A16207", bg: "#FEFCE8" },
            { label: "Approved", color: "#15803D", bg: "#F0FDF4" },
            { label: "Sales Handoff", color: "#047857", bg: "#ECFDF5" },
            { label: "Billing Requested", color: "#059669", bg: "#ECFDF5" },
          ].map((step, i, arr) => (
            <React.Fragment key={step.label}>
              <span className="px-2.5 py-1 rounded-full font-semibold text-[10px]"
                style={{ background: step.bg, color: step.color }}>
                {step.label}
              </span>
              {i < arr.length - 1 && <span style={{ color: "#D1D5DB" }}>→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── View Toggle + Stage Filter ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-xl border p-1 w-fit" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
          {(["pipeline", "table"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className="px-4 py-1.5 text-sm font-semibold rounded-lg transition-all capitalize"
              style={view === v ? { background: "#1D4ED8", color: "#fff" } : { color: "var(--rtm-text-secondary)" }}>
              {v === "pipeline" ? "📊 Pipeline" : "📋 Table"}
            </button>
          ))}
        </div>
        <select
          className="text-xs rounded-lg border px-3 py-1.5 focus:outline-none"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
          value={stageFilterPage} onChange={(e) => setStageFilterPage(e.target.value)}>
          <option value="All">All Stages ({MOCK_PROPOSALS.length})</option>
          {PIPELINE_STAGES.map((s) => (
            <option key={s} value={s}>{s} ({MOCK_PROPOSALS.filter((p) => p.stage === s).length})</option>
          ))}
        </select>
      </div>

      {/* ── Pipeline View ── */}
      {view === "pipeline" && (
        <div className="rounded-xl border p-4" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
          <p className="text-xs font-bold mb-4" style={{ color: "var(--rtm-text-primary)" }}>📊 Proposal Pipeline</p>
          <ProposalPipeline proposals={filteredProposals} onSelect={setSelectedProposal} />
        </div>
      )}

      {/* ── Table View ── */}
      {view === "table" && (
        <div className="rounded-xl border p-4" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
          <p className="text-xs font-bold mb-4" style={{ color: "var(--rtm-text-primary)" }}>📋 Proposal Table</p>
          <ProposalTable proposals={filteredProposals} onSelect={setSelectedProposal} />
        </div>
      )}

      {/* ── Rejected Table ── */}
      {(stageFilterPage === "All" || stageFilterPage === "Rejected") && (
        <div className="rounded-xl border p-4" style={{ background: "var(--rtm-surface)", borderColor: "#FECDD3" }}>
          <p className="text-xs font-bold mb-3" style={{ color: "#BE123C" }}>❌ Rejected Proposals</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--rtm-border)" }}>
                  {["Proposal", "Client", "Sales Rep", "Deal Value", "Sent", "Last Activity", "Actions"].map((h) => (
                    <th key={h} className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
                      style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_PROPOSALS.filter((p) => p.stage === "Rejected").map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                    <td className="px-3 py-2">
                      <span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{p.name}</span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{p.client}</td>
                    <td className="px-3 py-2 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{p.salesRep}</td>
                    <td className="px-3 py-2 whitespace-nowrap font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{fmt(p.dealValue)}</td>
                    <td className="px-3 py-2 whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{p.sentDate ?? "—"}</td>
                    <td className="px-3 py-2 whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{p.lastActivity}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <button onClick={() => setSelectedProposal(p)}
                        className="text-[10px] font-semibold px-2 py-1 rounded border"
                        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
        <Link href="/tasks" className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>
          Tasks →
        </Link>
        <Link href="/notifications" className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>
          Notifications →
        </Link>
        <Link href="/admin/workflows" className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>
          Workflows →
        </Link>
        <Link href="/sales/leads" className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>
          Leads →
        </Link>
      </div>

      {/* ── Detail Drawer ── */}
      {selectedProposal && (
        <ProposalDrawer proposal={selectedProposal} onClose={() => setSelectedProposal(null)} />
      )}

    </div>
  );
}
