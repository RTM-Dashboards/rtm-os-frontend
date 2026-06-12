"use client";

import React, { useState, useRef, useEffect } from "react";
import { KpiCard } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("sales")!;

// ─── GHL Types ────────────────────────────────────────────────────────────────

type GhlSyncStatus =
  | "Synced"
  | "Pending Sync"
  | "Sync Failed"
  | "Manual Override"
  | "Not Connected";

type GhlOpportunityStatus =
  | "open"
  | "won"
  | "lost"
  | "abandoned";

// ─── GHL Pipeline Stage Mapping ───────────────────────────────────────────────

interface GhlStageMapping {
  ghlStageId: string;
  ghlStageName: string;
  rtmStageName: PipelineStage;
  status: "Active" | "Unmapped" | "Disabled";
  lastSynced: string;
}

const GHL_STAGE_MAPPINGS: GhlStageMapping[] = [
  { ghlStageId: "ghl-stage-001", ghlStageName: "New Lead",           rtmStageName: "Lead",             status: "Active",   lastSynced: "Jan 11, 2025 09:14 AM" },
  { ghlStageId: "ghl-stage-002", ghlStageName: "Appointment Booked", rtmStageName: "Discovery",        status: "Active",   lastSynced: "Jan 11, 2025 09:14 AM" },
  { ghlStageId: "ghl-stage-003", ghlStageName: "Qualified",          rtmStageName: "Qualified",        status: "Active",   lastSynced: "Jan 11, 2025 09:14 AM" },
  { ghlStageId: "ghl-stage-004", ghlStageName: "Audit Requested",    rtmStageName: "Audit Requested",  status: "Active",   lastSynced: "Jan 11, 2025 09:14 AM" },
  { ghlStageId: "ghl-stage-005", ghlStageName: "Proposal Sent",      rtmStageName: "Proposal Sent",    status: "Active",   lastSynced: "Jan 11, 2025 09:14 AM" },
  { ghlStageId: "ghl-stage-006", ghlStageName: "Negotiation",        rtmStageName: "Negotiation",      status: "Active",   lastSynced: "Jan 11, 2025 09:14 AM" },
  { ghlStageId: "ghl-stage-007", ghlStageName: "Won",                rtmStageName: "Proposal Approved",status: "Active",   lastSynced: "Jan 11, 2025 09:14 AM" },
  { ghlStageId: "ghl-stage-008", ghlStageName: "Lost",               rtmStageName: "Closed Lost",      status: "Active",   lastSynced: "Jan 11, 2025 09:14 AM" },
];

// ─── GHL Sync Issues ─────────────────────────────────────────────────────────

type GhlSyncIssueType =
  | "Missing Contact ID"
  | "Stage Mapping Missing"
  | "Assigned User Not Matched"
  | "Duplicate Opportunity"
  | "Sync Failed";

type GhlSyncIssueAction = "Resolve" | "Ignore" | "Manual Override";

interface GhlSyncIssue {
  id: string;
  opportunityId: string;
  businessName: string;
  issueType: GhlSyncIssueType;
  description: string;
  detectedAt: string;
}

const GHL_SYNC_ISSUES: GhlSyncIssue[] = [
  {
    id: "SI-001",
    opportunityId: "O-GHL-038",
    businessName: "Harbor Flooring Co.",
    issueType: "Missing Contact ID",
    description: "GHL opportunity does not have a linked contact ID. Cannot sync back to CRM record.",
    detectedAt: "Jan 10, 2025 03:22 PM",
  },
  {
    id: "SI-002",
    opportunityId: "O-GHL-039",
    businessName: "Sunrise Med Clinic",
    issueType: "Stage Mapping Missing",
    description: 'GHL stage "Pre-Qualified" has no RTM OS mapping. Opportunity stuck at import.',
    detectedAt: "Jan 10, 2025 04:05 PM",
  },
  {
    id: "SI-003",
    opportunityId: "O-GHL-027",
    businessName: "Natalie Ross · Ross Family Chiro",
    issueType: "Assigned User Not Matched",
    description: 'GHL assigned user "A. Rodriguez" does not match any RTM OS sales rep.',
    detectedAt: "Jan 9, 2025 11:45 AM",
  },
  {
    id: "SI-004",
    opportunityId: "O-GHL-040",
    businessName: "Green Valley HVAC",
    issueType: "Duplicate Opportunity",
    description: "Two GHL opportunities map to the same RTM OS record. Manual deduplication required.",
    detectedAt: "Jan 11, 2025 08:30 AM",
  },
  {
    id: "SI-005",
    opportunityId: "O-GHL-036",
    businessName: "Lakeside Painting Studio",
    issueType: "Sync Failed",
    description: "GHL API returned 422 Unprocessable Entity when syncing last activity. Retry required.",
    detectedAt: "Jan 11, 2025 09:01 AM",
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type PipelineStage =
  | "Lead"
  | "Discovery"
  | "Qualified"
  | "Audit Requested"
  | "Audit In Progress"
  | "Proposal Draft"
  | "Proposal Sent"
  | "Negotiation"
  | "Verbal Approval"
  | "Proposal Approved"
  | "Sales Handoff"
  | "Closed Won"
  | "Closed Lost";

type Priority = "Low" | "Medium" | "High" | "Urgent";

type LeadSource =
  | "Direct"
  | "Affiliate"
  | "Partner"
  | "Website"
  | "Google Ads"
  | "Meta Ads"
  | "LSA";

// ─── Part 3 Types ─────────────────────────────────────────────────────────────

type AuditStatus = "Not Started" | "Requested" | "In Progress" | "Completed" | "Reviewed";
type ProposalStatus = "Not Started" | "Drafting" | "Sent" | "Viewed" | "Approved" | "Rejected";
type FollowUpStatus = "Upcoming" | "Overdue" | "Completed";
type HandoffStatus = "Not Started" | "Initiated" | "Billing Sent" | "Invoice Created" | "Activated";
type BillingRequestStatus = "Pending" | "Submitted" | "Approved" | "Rejected";
type InvoiceStatus = "Not Created" | "Drafted" | "Sent" | "Paid";
type ActivationStatus = "Not Started" | "In Progress" | "Live";
type CommissionModel = "Flat Fee" | "Percentage" | "Tiered" | "None";
type TaskStatus = "Open" | "In Progress" | "Completed" | "Overdue";
type WorkflowStep = "Lead" | "Audit" | "Proposal" | "Negotiation" | "Approved" | "Handoff" | "Billing";

interface AuditIntegration {
  status: AuditStatus;
  assignedAuditor: string;
  dueDate: string;
  findingsSummary: string;
}

interface ProposalIntegration {
  status: ProposalStatus;
  proposalValue: number;
  sentDate: string;
  viewedDate: string;
  approvalStatus: string;
}

interface FollowUp {
  id: string;
  subject: string;
  dueDate: string;
  status: FollowUpStatus;
  owner: string;
}

interface HandoffIntegration {
  status: HandoffStatus;
  billingRequestStatus: BillingRequestStatus;
  invoiceStatus: InvoiceStatus;
  activationStatus: ActivationStatus;
}

interface AffiliateAttribution {
  affiliateName: string;
  referralSource: string;
  referralCode: string;
  commissionModel: CommissionModel;
  potentialCommission: number;
  revenueAttribution: number;
}

interface OppTask {
  id: string;
  title: string;
  status: TaskStatus;
  owner: string;
  dueDate: string;
}

interface OppNotification {
  id: string;
  type: string;
  message: string;
  date: string;
  read: boolean;
}

interface WorkflowEvent {
  step: WorkflowStep;
  completedAt: string;
  completedBy: string;
  notes: string;
}

// ─── GHL Fields Interface ─────────────────────────────────────────────────────

interface GhlFields {
  ghlOpportunityId: string;
  ghlContactId: string;
  ghlPipelineId: string;
  ghlPipelineName: string;
  ghlStageId: string;
  ghlStageName: string;
  ghlAssignedUserId: string;
  ghlAssignedUserName: string;
  ghlOpportunityStatus: GhlOpportunityStatus;
  ghlMonetaryValue: number;
  ghlSource: string;
  ghlCreatedAt: string;
  ghlUpdatedAt: string;
  ghlLastActivityAt: string;
  ghlSyncStatus: GhlSyncStatus;
  ghlSyncError: string;
}

// ─── Core Types ───────────────────────────────────────────────────────────────

type ActivityType =
  | "Lead Created"
  | "Discovery Scheduled"
  | "Audit Requested"
  | "Audit Completed"
  | "Proposal Drafted"
  | "Proposal Sent"
  | "Follow Up Completed"
  | "Negotiation Updated"
  | "Note Added"
  | "Stage Changed";

type NoteCategory =
  | "Discovery"
  | "Audit"
  | "Proposal"
  | "Negotiation"
  | "Follow-Up"
  | "General";

interface Activity {
  date: string;
  type: ActivityType;
  user: string;
  notes: string;
}

interface Note {
  date: string;
  author: string;
  note: string;
  category: NoteCategory;
}

interface NextStep {
  action: string;
  owner: string;
  dueDate: string;
  priority: Priority;
}

interface Opportunity {
  id: string;
  clientName: string;
  businessName: string;
  industry: string;
  website: string;
  primaryContact: string;
  email: string;
  phone: string;
  assignedRep: string;
  leadSource: LeadSource;
  affiliateSource: string;
  estimatedValue: number;
  monthlyValue: number;
  contractLength: string;
  probability: number;
  stage: PipelineStage;
  daysInStage: number;
  nextAction: string;
  priority: Priority;
  closingMonth: string;
  expectedCloseDate: string;
  opportunityScore: number;
  forecastMonth: string;
  forecastQuarter: string;
  recentActivities: Activity[];
  notes: Note[];
  nextSteps: NextStep[];
  // Part 3
  audit: AuditIntegration;
  proposal: ProposalIntegration;
  followUps: FollowUp[];
  handoff: HandoffIntegration;
  affiliate: AffiliateAttribution;
  tasks: OppTask[];
  notifications: OppNotification[];
  workflowEvents: WorkflowEvent[];
  // GHL Fields
  ghl: GhlFields;
}

// ─── Mock Data Helpers ────────────────────────────────────────────────────────

function mkAudit(s: AuditStatus, auditor: string, due: string, summary: string): AuditIntegration {
  return { status: s, assignedAuditor: auditor, dueDate: due, findingsSummary: summary };
}
function mkProposal(s: ProposalStatus, val: number, sent: string, viewed: string, approval: string): ProposalIntegration {
  return { status: s, proposalValue: val, sentDate: sent, viewedDate: viewed, approvalStatus: approval };
}
function mkHandoff(s: HandoffStatus, billing: BillingRequestStatus, inv: InvoiceStatus, act: ActivationStatus): HandoffIntegration {
  return { status: s, billingRequestStatus: billing, invoiceStatus: inv, activationStatus: act };
}
function mkAffiliate(name: string, src: string, code: string, model: CommissionModel, comm: number, attr: number): AffiliateAttribution {
  return { affiliateName: name, referralSource: src, referralCode: code, commissionModel: model, potentialCommission: comm, revenueAttribution: attr };
}
function mkGhl(
  oppId: string, contactId: string, pipelineId: string, pipelineName: string,
  stageId: string, stageName: string, userId: string, userName: string,
  oppStatus: GhlOpportunityStatus, monetaryValue: number, source: string,
  createdAt: string, updatedAt: string, lastActivity: string,
  syncStatus: GhlSyncStatus, syncError: string = ""
): GhlFields {
  return {
    ghlOpportunityId: oppId, ghlContactId: contactId, ghlPipelineId: pipelineId,
    ghlPipelineName: pipelineName, ghlStageId: stageId, ghlStageName: stageName,
    ghlAssignedUserId: userId, ghlAssignedUserName: userName, ghlOpportunityStatus: oppStatus,
    ghlMonetaryValue: monetaryValue, ghlSource: source, ghlCreatedAt: createdAt,
    ghlUpdatedAt: updatedAt, ghlLastActivityAt: lastActivity, ghlSyncStatus: syncStatus,
    ghlSyncError: syncError,
  };
}

const NA = mkAudit("Not Started", "—", "—", "—");
const NP = mkProposal("Not Started", 0, "—", "—", "Pending");
const NH = mkHandoff("Not Started", "Pending", "Not Created", "Not Started");
const NAff = mkAffiliate("—", "—", "—", "None", 0, 0);

const GHL_PIPELINE_ID = "ghl-pipeline-rtm-001";
const GHL_PIPELINE_NAME = "RTM OS Sales Pipeline";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const OPPORTUNITIES: Opportunity[] = [
  // ── Lead ──────────────────────────────────────────────────────────────────
  {
    id: "O001", clientName: "James Carter", businessName: "Carter HVAC Services",
    industry: "HVAC", website: "carterhvac.com", primaryContact: "James Carter",
    email: "james@carterhvac.com", phone: "(555) 201-4400",
    assignedRep: "Jordan M.", leadSource: "Google Ads", affiliateSource: "—",
    estimatedValue: 2200, monthlyValue: 2200, contractLength: "12 months",
    probability: 15, stage: "Lead", daysInStage: 1, nextAction: "Send intro email", priority: "Medium",
    closingMonth: "Feb 2025", expectedCloseDate: "Feb 14, 2025",
    opportunityScore: 28, forecastMonth: "February 2025", forecastQuarter: "Q1 2025",
    recentActivities: [{ date: "Jan 10, 2025", type: "Lead Created", user: "Jordan M.", notes: "New lead from Google Ads." }],
    notes: [{ date: "Jan 10, 2025", author: "Jordan M.", note: "Incoming from Google Ads. HVAC seasonal campaign.", category: "General" }],
    nextSteps: [{ action: "Send intro email", owner: "Jordan M.", dueDate: "Jan 11, 2025", priority: "Medium" }],
    audit: NA, proposal: NP, handoff: NH, affiliate: NAff,
    followUps: [{ id: "FU-001-1", subject: "Discovery Call Scheduled", dueDate: "Jan 15, 2025", status: "Upcoming", owner: "Jordan M." }],
    tasks: [
      { id: "T-001-1", title: "Send intro email", status: "Open", owner: "Jordan M.", dueDate: "Jan 11, 2025" },
      { id: "T-001-2", title: "Discovery Call", status: "Open", owner: "Jordan M.", dueDate: "Jan 15, 2025" },
    ],
    notifications: [{ id: "N-001-1", type: "Lead Created", message: "New HVAC lead from Google Ads.", date: "Jan 10, 2025", read: false }],
    workflowEvents: [{ step: "Lead", completedAt: "Jan 10, 2025", completedBy: "Jordan M.", notes: "Lead created." }],
    ghl: mkGhl("ghl-opp-001", "ghl-con-001", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-001", "New Lead", "ghl-user-jordan", "Jordan M.", "open", 2200, "Google Ads", "2025-01-10T08:00:00Z", "2025-01-10T08:30:00Z", "2025-01-10T08:30:00Z", "Synced"),
  },
  {
    id: "O002", clientName: "Nina Patel", businessName: "Patel Dental Group",
    industry: "Dental", website: "pateldentalgroup.com", primaryContact: "Nina Patel",
    email: "nina@pateldentalgroup.com", phone: "(555) 302-5511",
    assignedRep: "Sarah K.", leadSource: "LSA", affiliateSource: "—",
    estimatedValue: 4500, monthlyValue: 4500, contractLength: "12 months",
    probability: 20, stage: "Lead", daysInStage: 3, nextAction: "Call to qualify", priority: "High",
    closingMonth: "Feb 2025", expectedCloseDate: "Feb 21, 2025",
    opportunityScore: 42, forecastMonth: "February 2025", forecastQuarter: "Q1 2025",
    recentActivities: [{ date: "Jan 8, 2025", type: "Lead Created", user: "Sarah K.", notes: "LSA lead from dental vertical." }],
    notes: [{ date: "Jan 8, 2025", author: "Sarah K.", note: "Strong LSA lead. Multi-location dental group.", category: "General" }],
    nextSteps: [{ action: "Qualification call", owner: "Sarah K.", dueDate: "Jan 12, 2025", priority: "High" }],
    audit: NA, proposal: NP, handoff: NH, affiliate: NAff,
    followUps: [{ id: "FU-002-1", subject: "Qualification Call", dueDate: "Jan 12, 2025", status: "Overdue", owner: "Sarah K." }],
    tasks: [{ id: "T-002-1", title: "Discovery Call", status: "Overdue", owner: "Sarah K.", dueDate: "Jan 12, 2025" }],
    notifications: [{ id: "N-002-1", type: "Opportunity Stalled", message: "Patel Dental Group follow-up is overdue.", date: "Jan 13, 2025", read: false }],
    workflowEvents: [{ step: "Lead", completedAt: "Jan 8, 2025", completedBy: "Sarah K.", notes: "Lead created via LSA." }],
    ghl: mkGhl("ghl-opp-002", "ghl-con-002", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-001", "New Lead", "ghl-user-sarah", "Sarah K.", "open", 4500, "LSA", "2025-01-08T09:00:00Z", "2025-01-08T09:30:00Z", "2025-01-08T09:30:00Z", "Pending Sync"),
  },
  {
    id: "O003", clientName: "Ray Morales", businessName: "Morales Roofing LLC",
    industry: "Roofing", website: "moralesroofing.com", primaryContact: "Ray Morales",
    email: "ray@moralesroofing.com", phone: "(555) 403-6622",
    assignedRep: "Alex R.", leadSource: "Meta Ads", affiliateSource: "—",
    estimatedValue: 1800, monthlyValue: 1800, contractLength: "6 months",
    probability: 10, stage: "Lead", daysInStage: 0, nextAction: "Qualify via form data", priority: "Low",
    closingMonth: "Mar 2025", expectedCloseDate: "Mar 7, 2025",
    opportunityScore: 18, forecastMonth: "March 2025", forecastQuarter: "Q1 2025",
    recentActivities: [{ date: "Jan 11, 2025", type: "Lead Created", user: "Alex R.", notes: "Meta Ads lead. Roofing seasonal." }],
    notes: [], nextSteps: [{ action: "Qualify via form data", owner: "Alex R.", dueDate: "Jan 13, 2025", priority: "Low" }],
    audit: NA, proposal: NP, handoff: NH, affiliate: NAff,
    followUps: [{ id: "FU-003-1", subject: "Initial Qualification", dueDate: "Jan 13, 2025", status: "Upcoming", owner: "Alex R." }],
    tasks: [{ id: "T-003-1", title: "Qualify via form data", status: "Open", owner: "Alex R.", dueDate: "Jan 13, 2025" }],
    notifications: [{ id: "N-003-1", type: "Lead Created", message: "New roofing lead from Meta Ads.", date: "Jan 11, 2025", read: true }],
    workflowEvents: [{ step: "Lead", completedAt: "Jan 11, 2025", completedBy: "Alex R.", notes: "Lead created via Meta Ads." }],
    ghl: mkGhl("ghl-opp-003", "", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-001", "New Lead", "ghl-user-alex", "Alex R.", "open", 1800, "Meta Ads", "2025-01-11T10:00:00Z", "2025-01-11T10:15:00Z", "2025-01-11T10:15:00Z", "Sync Failed", "GHL API returned 422: missing contact_id field"),
  },

  // ── Discovery ─────────────────────────────────────────────────────────────
  {
    id: "O004", clientName: "Priya Sharma", businessName: "Blue Ridge Plumbing",
    industry: "Plumbing", website: "blueridgeplumbing.com", primaryContact: "Priya Sharma",
    email: "priya@blueridgeplumbing.com", phone: "(555) 504-7733",
    assignedRep: "Sarah K.", leadSource: "Website", affiliateSource: "—",
    estimatedValue: 1800, monthlyValue: 1800, contractLength: "12 months",
    probability: 30, stage: "Discovery", daysInStage: 4, nextAction: "Discovery call scheduled 12/20", priority: "Medium",
    closingMonth: "Jan 2025", expectedCloseDate: "Jan 28, 2025",
    opportunityScore: 54, forecastMonth: "January 2025", forecastQuarter: "Q1 2025",
    recentActivities: [
      { date: "Jan 5, 2025", type: "Lead Created", user: "Sarah K.", notes: "Website inbound." },
      { date: "Jan 7, 2025", type: "Discovery Scheduled", user: "Sarah K.", notes: "Call booked for Jan 20." },
    ],
    notes: [{ date: "Jan 7, 2025", author: "Sarah K.", note: "Very interested. Local plumbing company wanting more leads.", category: "Discovery" }],
    nextSteps: [{ action: "Conduct discovery call", owner: "Sarah K.", dueDate: "Jan 20, 2025", priority: "Medium" }],
    audit: NA, proposal: NP, handoff: NH, affiliate: NAff,
    followUps: [{ id: "FU-004-1", subject: "Post-Discovery Follow Up", dueDate: "Jan 22, 2025", status: "Upcoming", owner: "Sarah K." }],
    tasks: [
      { id: "T-004-1", title: "Discovery Call", status: "In Progress", owner: "Sarah K.", dueDate: "Jan 20, 2025" },
      { id: "T-004-2", title: "Audit Review", status: "Open", owner: "Sarah K.", dueDate: "Jan 25, 2025" },
    ],
    notifications: [{ id: "N-004-1", type: "Opportunity Stalled", message: "Blue Ridge Plumbing discovery is 4 days in stage.", date: "Jan 11, 2025", read: false }],
    workflowEvents: [{ step: "Lead", completedAt: "Jan 5, 2025", completedBy: "Sarah K.", notes: "Website inbound lead." }],
    ghl: mkGhl("ghl-opp-004", "ghl-con-004", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-002", "Appointment Booked", "ghl-user-sarah", "Sarah K.", "open", 1800, "Website", "2025-01-05T11:00:00Z", "2025-01-07T14:00:00Z", "2025-01-07T14:00:00Z", "Synced"),
  },
  {
    id: "O005", clientName: "Tom Castillo", businessName: "Castillo Electric Co.",
    industry: "Electrical", website: "castilloelectric.com", primaryContact: "Tom Castillo",
    email: "tom@castilloelectric.com", phone: "(555) 605-8844",
    assignedRep: "Mike T.", leadSource: "Affiliate", affiliateSource: "Maria Santos",
    estimatedValue: 2600, monthlyValue: 2600, contractLength: "12 months",
    probability: 35, stage: "Discovery", daysInStage: 2, nextAction: "Send discovery prep doc", priority: "High",
    closingMonth: "Jan 2025", expectedCloseDate: "Jan 24, 2025",
    opportunityScore: 61, forecastMonth: "January 2025", forecastQuarter: "Q1 2025",
    recentActivities: [
      { date: "Jan 6, 2025", type: "Lead Created", user: "Mike T.", notes: "Referred by affiliate Maria Santos." },
      { date: "Jan 9, 2025", type: "Discovery Scheduled", user: "Mike T.", notes: "Discovery call set for Jan 15." },
    ],
    notes: [{ date: "Jan 9, 2025", author: "Mike T.", note: "Strong referral from Maria. Family-owned electrical co. in growth mode.", category: "Discovery" }],
    nextSteps: [{ action: "Send discovery prep doc", owner: "Mike T.", dueDate: "Jan 13, 2025", priority: "High" }],
    audit: NA, proposal: NP, handoff: NH,
    affiliate: mkAffiliate("Maria Santos", "Affiliate Network", "MS-2025-01", "Percentage", 260, 2600),
    followUps: [{ id: "FU-005-1", subject: "Post-Discovery Follow Up", dueDate: "Jan 17, 2025", status: "Upcoming", owner: "Mike T." }],
    tasks: [{ id: "T-005-1", title: "Discovery Call", status: "In Progress", owner: "Mike T.", dueDate: "Jan 15, 2025" }],
    notifications: [{ id: "N-005-1", type: "Lead Created", message: "Castillo Electric referred by Maria Santos.", date: "Jan 6, 2025", read: true }],
    workflowEvents: [{ step: "Lead", completedAt: "Jan 6, 2025", completedBy: "Mike T.", notes: "Affiliate referral." }],
    ghl: mkGhl("ghl-opp-005", "ghl-con-005", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-002", "Appointment Booked", "ghl-user-mike", "Mike T.", "open", 2600, "Affiliate", "2025-01-06T08:00:00Z", "2025-01-09T10:00:00Z", "2025-01-09T10:00:00Z", "Synced"),
  },
  {
    id: "O006", clientName: "Leah Nguyen", businessName: "Nguyen Family Law",
    industry: "Legal", website: "nguyenfamilylaw.com", primaryContact: "Leah Nguyen",
    email: "leah@nguyenfamilylaw.com", phone: "(555) 706-9955",
    assignedRep: "Jordan M.", leadSource: "Partner", affiliateSource: "LegalConnect Partners",
    estimatedValue: 3000, monthlyValue: 3000, contractLength: "12 months",
    probability: 30, stage: "Discovery", daysInStage: 5, nextAction: "Confirm discovery call time", priority: "Medium",
    closingMonth: "Feb 2025", expectedCloseDate: "Feb 7, 2025",
    opportunityScore: 52, forecastMonth: "February 2025", forecastQuarter: "Q1 2025",
    recentActivities: [{ date: "Jan 4, 2025", type: "Lead Created", user: "Jordan M.", notes: "Partner referral from LegalConnect." }],
    notes: [{ date: "Jan 4, 2025", author: "Jordan M.", note: "Law firm with 3 attorneys. Wants SEO + GBP.", category: "Discovery" }],
    nextSteps: [{ action: "Confirm discovery call time", owner: "Jordan M.", dueDate: "Jan 14, 2025", priority: "Medium" }],
    audit: NA, proposal: NP, handoff: NH,
    affiliate: mkAffiliate("LegalConnect Partners", "Partner Network", "LC-2025-01", "Flat Fee", 300, 3000),
    followUps: [{ id: "FU-006-1", subject: "Confirm Discovery Call", dueDate: "Jan 14, 2025", status: "Upcoming", owner: "Jordan M." }],
    tasks: [{ id: "T-006-1", title: "Confirm Discovery Call", status: "Open", owner: "Jordan M.", dueDate: "Jan 14, 2025" }],
    notifications: [{ id: "N-006-1", type: "Lead Created", message: "Nguyen Family Law partner referral received.", date: "Jan 4, 2025", read: true }],
    workflowEvents: [{ step: "Lead", completedAt: "Jan 4, 2025", completedBy: "Jordan M.", notes: "Partner referral." }],
    ghl: mkGhl("ghl-opp-006", "ghl-con-006", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-002", "Appointment Booked", "ghl-user-jordan", "Jordan M.", "open", 3000, "Partner", "2025-01-04T09:00:00Z", "2025-01-04T09:30:00Z", "2025-01-04T09:30:00Z", "Manual Override"),
  },

  // ── Qualified ─────────────────────────────────────────────────────────────
  {
    id: "O007", clientName: "Derek Holt", businessName: "Harbor Auto Group",
    industry: "Automotive", website: "harborautogroup.com", primaryContact: "Derek Holt",
    email: "derek@harborautogroup.com", phone: "(555) 807-1066",
    assignedRep: "Mike T.", leadSource: "Direct", affiliateSource: "—",
    estimatedValue: 5000, monthlyValue: 5000, contractLength: "24 months",
    probability: 50, stage: "Qualified", daysInStage: 6, nextAction: "Present service packages", priority: "Urgent",
    closingMonth: "Jan 2025", expectedCloseDate: "Jan 22, 2025",
    opportunityScore: 78, forecastMonth: "January 2025", forecastQuarter: "Q1 2025",
    recentActivities: [
      { date: "Jan 2, 2025", type: "Lead Created", user: "Mike T.", notes: "Direct inbound." },
      { date: "Jan 5, 2025", type: "Discovery Scheduled", user: "Mike T.", notes: "Completed discovery Jan 5." },
    ],
    notes: [{ date: "Jan 5, 2025", author: "Mike T.", note: "Two dealership locations. Strong budget. Wants full SEO + PPC.", category: "Discovery" }],
    nextSteps: [{ action: "Present service packages", owner: "Mike T.", dueDate: "Jan 15, 2025", priority: "Urgent" }],
    audit: mkAudit("Requested", "—", "Jan 18, 2025", "Awaiting auditor assignment."),
    proposal: NP, handoff: NH, affiliate: NAff,
    followUps: [{ id: "FU-007-1", subject: "Present Packages", dueDate: "Jan 15, 2025", status: "Upcoming", owner: "Mike T." }],
    tasks: [
      { id: "T-007-1", title: "Discovery Call", status: "Completed", owner: "Mike T.", dueDate: "Jan 5, 2025" },
      { id: "T-007-2", title: "Audit Review", status: "Open", owner: "Mike T.", dueDate: "Jan 18, 2025" },
      { id: "T-007-3", title: "Present service packages", status: "Open", owner: "Mike T.", dueDate: "Jan 15, 2025" },
    ],
    notifications: [{ id: "N-007-1", type: "Deal Closing Soon", message: "Harbor Auto Group targeted to close Jan 22.", date: "Jan 11, 2025", read: false }],
    workflowEvents: [{ step: "Lead", completedAt: "Jan 2, 2025", completedBy: "Mike T.", notes: "Direct inbound." }],
    ghl: mkGhl("ghl-opp-007", "ghl-con-007", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-003", "Qualified", "ghl-user-mike", "Mike T.", "open", 5000, "Direct", "2025-01-02T07:00:00Z", "2025-01-05T15:00:00Z", "2025-01-05T15:00:00Z", "Synced"),
  },
  {
    id: "O008", clientName: "Sandra Wu", businessName: "Wu Orthodontics",
    industry: "Orthodontics", website: "wuorthodontics.com", primaryContact: "Sandra Wu",
    email: "sandra@wuorthodontics.com", phone: "(555) 908-2177",
    assignedRep: "Sarah K.", leadSource: "Google Ads", affiliateSource: "—",
    estimatedValue: 3800, monthlyValue: 3800, contractLength: "12 months",
    probability: 45, stage: "Qualified", daysInStage: 3, nextAction: "Schedule audit walkthrough", priority: "High",
    closingMonth: "Jan 2025", expectedCloseDate: "Jan 25, 2025",
    opportunityScore: 70, forecastMonth: "January 2025", forecastQuarter: "Q1 2025",
    recentActivities: [
      { date: "Jan 3, 2025", type: "Lead Created", user: "Sarah K.", notes: "Google Ads lead." },
      { date: "Jan 6, 2025", type: "Discovery Scheduled", user: "Sarah K.", notes: "Discovery completed Jan 8." },
    ],
    notes: [{ date: "Jan 8, 2025", author: "Sarah K.", note: "Solo orthodontist looking to expand. Good fit for SEO.", category: "Discovery" }],
    nextSteps: [{ action: "Schedule audit walkthrough", owner: "Sarah K.", dueDate: "Jan 16, 2025", priority: "High" }],
    audit: mkAudit("Requested", "—", "Jan 20, 2025", "Request submitted."),
    proposal: NP, handoff: NH, affiliate: NAff,
    followUps: [{ id: "FU-008-1", subject: "Schedule Audit Walkthrough", dueDate: "Jan 16, 2025", status: "Upcoming", owner: "Sarah K." }],
    tasks: [
      { id: "T-008-1", title: "Discovery Call", status: "Completed", owner: "Sarah K.", dueDate: "Jan 8, 2025" },
      { id: "T-008-2", title: "Audit Review", status: "Open", owner: "Sarah K.", dueDate: "Jan 20, 2025" },
    ],
    notifications: [{ id: "N-008-1", type: "Negotiation Updated", message: "Wu Orthodontics qualified and ready for audit.", date: "Jan 8, 2025", read: true }],
    workflowEvents: [{ step: "Lead", completedAt: "Jan 3, 2025", completedBy: "Sarah K.", notes: "Google Ads lead." }],
    ghl: mkGhl("ghl-opp-008", "ghl-con-008", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-003", "Qualified", "ghl-user-sarah", "Sarah K.", "open", 3800, "Google Ads", "2025-01-03T09:00:00Z", "2025-01-08T11:00:00Z", "2025-01-08T11:00:00Z", "Pending Sync"),
  },
  {
    id: "O009", clientName: "Luis Reyes", businessName: "Reyes Landscaping",
    industry: "Landscaping", website: "reyeslandscaping.com", primaryContact: "Luis Reyes",
    email: "luis@reyeslandscaping.com", phone: "(555) 109-3288",
    assignedRep: "Alex R.", leadSource: "Affiliate", affiliateSource: "Carlos Reyes",
    estimatedValue: 2100, monthlyValue: 2100, contractLength: "12 months",
    probability: 40, stage: "Qualified", daysInStage: 7, nextAction: "Follow up on service list", priority: "Medium",
    closingMonth: "Feb 2025", expectedCloseDate: "Feb 4, 2025",
    opportunityScore: 63, forecastMonth: "February 2025", forecastQuarter: "Q1 2025",
    recentActivities: [
      { date: "Jan 1, 2025", type: "Lead Created", user: "Alex R.", notes: "Referral from Carlos Reyes." },
      { date: "Jan 4, 2025", type: "Discovery Scheduled", user: "Alex R.", notes: "Discovery call done Jan 4." },
    ],
    notes: [{ date: "Jan 4, 2025", author: "Alex R.", note: "Seasonal business. Wants year-round SEO strategy.", category: "Discovery" }],
    nextSteps: [{ action: "Follow up on service list", owner: "Alex R.", dueDate: "Jan 15, 2025", priority: "Medium" }],
    audit: mkAudit("Requested", "—", "Jan 18, 2025", "Awaiting scope confirmation."),
    proposal: NP, handoff: NH,
    affiliate: mkAffiliate("Carlos Reyes", "Family Referral", "CR-2025-01", "Flat Fee", 200, 2100),
    followUps: [{ id: "FU-009-1", subject: "Service List Follow Up", dueDate: "Jan 15, 2025", status: "Overdue", owner: "Alex R." }],
    tasks: [
      { id: "T-009-1", title: "Discovery Call", status: "Completed", owner: "Alex R.", dueDate: "Jan 4, 2025" },
      { id: "T-009-2", title: "Proposal Follow Up", status: "Overdue", owner: "Alex R.", dueDate: "Jan 15, 2025" },
    ],
    notifications: [{ id: "N-009-1", type: "Opportunity Stalled", message: "Reyes Landscaping has been 7 days in Qualified.", date: "Jan 11, 2025", read: false }],
    workflowEvents: [{ step: "Lead", completedAt: "Jan 1, 2025", completedBy: "Alex R.", notes: "Affiliate referral." }],
    ghl: mkGhl("ghl-opp-009", "ghl-con-009", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-003", "Qualified", "ghl-user-alex", "Alex R.", "open", 2100, "Affiliate", "2025-01-01T08:00:00Z", "2025-01-04T10:00:00Z", "2025-01-04T10:00:00Z", "Synced"),
  },

  // ── Audit Requested ───────────────────────────────────────────────────────
  {
    id: "O010", clientName: "Amy Thornton", businessName: "Thornton Med Spa",
    industry: "Med Spa", website: "thorntonmedspa.com", primaryContact: "Amy Thornton",
    email: "amy@thorntonmedspa.com", phone: "(555) 210-4399",
    assignedRep: "Jordan M.", leadSource: "Meta Ads", affiliateSource: "—",
    estimatedValue: 4200, monthlyValue: 4200, contractLength: "12 months",
    probability: 55, stage: "Audit Requested", daysInStage: 2, nextAction: "Confirm audit scope with SEO team", priority: "High",
    closingMonth: "Jan 2025", expectedCloseDate: "Jan 20, 2025",
    opportunityScore: 74, forecastMonth: "January 2025", forecastQuarter: "Q1 2025",
    recentActivities: [
      { date: "Dec 30, 2024", type: "Lead Created", user: "Jordan M.", notes: "Meta Ads lead." },
      { date: "Jan 3, 2025", type: "Discovery Scheduled", user: "Jordan M.", notes: "Discovery done Jan 3." },
      { date: "Jan 9, 2025", type: "Audit Requested", user: "Jordan M.", notes: "Audit requested after discovery." },
    ],
    notes: [{ date: "Jan 9, 2025", author: "Jordan M.", note: "Very interested. Wants full GBP + local SEO audit.", category: "Audit" }],
    nextSteps: [{ action: "Confirm audit scope with SEO team", owner: "Jordan M.", dueDate: "Jan 13, 2025", priority: "High" }],
    audit: mkAudit("Requested", "Chris A.", "Jan 16, 2025", "GBP + Local SEO scope requested."),
    proposal: NP, handoff: NH, affiliate: NAff,
    followUps: [{ id: "FU-010-1", subject: "Audit Scope Confirmation", dueDate: "Jan 13, 2025", status: "Upcoming", owner: "Jordan M." }],
    tasks: [
      { id: "T-010-1", title: "Audit Review", status: "In Progress", owner: "Chris A.", dueDate: "Jan 16, 2025" },
      { id: "T-010-2", title: "Discovery Call", status: "Completed", owner: "Jordan M.", dueDate: "Jan 3, 2025" },
    ],
    notifications: [{ id: "N-010-1", type: "Negotiation Updated", message: "Thornton Med Spa audit scope confirmed.", date: "Jan 9, 2025", read: false }],
    workflowEvents: [
      { step: "Lead", completedAt: "Dec 30, 2024", completedBy: "Jordan M.", notes: "Meta Ads lead." },
      { step: "Audit", completedAt: "Jan 9, 2025", completedBy: "Jordan M.", notes: "Audit requested." },
    ],
    ghl: mkGhl("ghl-opp-010", "ghl-con-010", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-004", "Audit Requested", "ghl-user-jordan", "Jordan M.", "open", 4200, "Meta Ads", "2024-12-30T10:00:00Z", "2025-01-09T12:00:00Z", "2025-01-09T12:00:00Z", "Synced"),
  },
  {
    id: "O011", clientName: "Paul Ferretti", businessName: "Ferretti Tile & Stone",
    industry: "Home Improvement", website: "ferrettitile.com", primaryContact: "Paul Ferretti",
    email: "paul@ferrettitile.com", phone: "(555) 311-5400",
    assignedRep: "Mike T.", leadSource: "Partner", affiliateSource: "BuilderConnect Pro",
    estimatedValue: 1600, monthlyValue: 1600, contractLength: "6 months",
    probability: 50, stage: "Audit Requested", daysInStage: 4, nextAction: "Collect login credentials", priority: "Medium",
    closingMonth: "Feb 2025", expectedCloseDate: "Feb 10, 2025",
    opportunityScore: 65, forecastMonth: "February 2025", forecastQuarter: "Q1 2025",
    recentActivities: [
      { date: "Jan 2, 2025", type: "Lead Created", user: "Mike T.", notes: "Partner referral from BuilderConnect." },
      { date: "Jan 7, 2025", type: "Audit Requested", user: "Mike T.", notes: "Audit kick-off requested." },
    ],
    notes: [{ date: "Jan 7, 2025", author: "Mike T.", note: "Small business. Needs help with GMB and local citations.", category: "Audit" }],
    nextSteps: [{ action: "Collect login credentials", owner: "Mike T.", dueDate: "Jan 13, 2025", priority: "Medium" }],
    audit: mkAudit("Requested", "Dana L.", "Jan 17, 2025", "GMB + citations scope."),
    proposal: NP, handoff: NH,
    affiliate: mkAffiliate("BuilderConnect Pro", "Partner Network", "BC-2025-02", "Flat Fee", 150, 1600),
    followUps: [{ id: "FU-011-1", subject: "Credentials Collection", dueDate: "Jan 13, 2025", status: "Upcoming", owner: "Mike T." }],
    tasks: [
      { id: "T-011-1", title: "Collect login credentials", status: "Open", owner: "Mike T.", dueDate: "Jan 13, 2025" },
      { id: "T-011-2", title: "Audit Review", status: "Open", owner: "Dana L.", dueDate: "Jan 17, 2025" },
    ],
    notifications: [{ id: "N-011-1", type: "Negotiation Updated", message: "Ferretti audit assigned to Dana L.", date: "Jan 7, 2025", read: true }],
    workflowEvents: [
      { step: "Lead", completedAt: "Jan 2, 2025", completedBy: "Mike T.", notes: "Partner referral." },
      { step: "Audit", completedAt: "Jan 7, 2025", completedBy: "Mike T.", notes: "Audit kicked off." },
    ],
    ghl: mkGhl("ghl-opp-011", "ghl-con-011", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-004", "Audit Requested", "ghl-user-mike", "Mike T.", "open", 1600, "Partner", "2025-01-02T08:00:00Z", "2025-01-07T11:00:00Z", "2025-01-07T11:00:00Z", "Not Connected"),
  },

  // ── Audit In Progress ─────────────────────────────────────────────────────
  {
    id: "O012", clientName: "Marcus Webb", businessName: "Summit Landscaping",
    industry: "Landscaping", website: "summitlandscaping.com", primaryContact: "Marcus Webb",
    email: "marcus@summitlandscaping.com", phone: "(555) 412-6511",
    assignedRep: "Jordan M.", leadSource: "Affiliate", affiliateSource: "Brandon Ellis",
    estimatedValue: 2400, monthlyValue: 2400, contractLength: "12 months",
    probability: 65, stage: "Audit In Progress", daysInStage: 5, nextAction: "Audit delivery by 1/15", priority: "High",
    closingMonth: "Jan 2025", expectedCloseDate: "Jan 18, 2025",
    opportunityScore: 79, forecastMonth: "January 2025", forecastQuarter: "Q1 2025",
    recentActivities: [
      { date: "Dec 28, 2024", type: "Lead Created", user: "Jordan M.", notes: "Affiliate referral from Brandon Ellis." },
      { date: "Jan 2, 2025", type: "Audit Requested", user: "Jordan M.", notes: "Audit initiated." },
      { date: "Jan 6, 2025", type: "Audit Completed", user: "Jordan M.", notes: "SEO audit in final review." },
    ],
    notes: [{ date: "Jan 6, 2025", author: "Jordan M.", note: "Audit nearly complete. Strong local SEO opportunity found.", category: "Audit" }],
    nextSteps: [{ action: "Complete and deliver audit", owner: "Jordan M.", dueDate: "Jan 15, 2025", priority: "High" }],
    audit: mkAudit("In Progress", "Chris A.", "Jan 15, 2025", "Strong local SEO gaps. GBP incomplete."),
    proposal: NP, handoff: NH,
    affiliate: mkAffiliate("Brandon Ellis", "Affiliate Network", "BE-2024-12", "Percentage", 240, 2400),
    followUps: [{ id: "FU-012-1", subject: "Audit Delivery Follow Up", dueDate: "Jan 15, 2025", status: "Upcoming", owner: "Jordan M." }],
    tasks: [
      { id: "T-012-1", title: "Audit Review", status: "In Progress", owner: "Chris A.", dueDate: "Jan 15, 2025" },
      { id: "T-012-2", title: "Proposal Follow Up", status: "Open", owner: "Jordan M.", dueDate: "Jan 19, 2025" },
    ],
    notifications: [{ id: "N-012-1", type: "Negotiation Updated", message: "Summit Landscaping audit is in final review.", date: "Jan 6, 2025", read: false }],
    workflowEvents: [
      { step: "Lead", completedAt: "Dec 28, 2024", completedBy: "Jordan M.", notes: "Affiliate referral." },
      { step: "Audit", completedAt: "Jan 2, 2025", completedBy: "Jordan M.", notes: "Audit in progress." },
    ],
    ghl: mkGhl("ghl-opp-012", "ghl-con-012", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-004", "Audit Requested", "ghl-user-jordan", "Jordan M.", "open", 2400, "Affiliate", "2024-12-28T07:00:00Z", "2025-01-06T13:00:00Z", "2025-01-06T13:00:00Z", "Synced"),
  },
  {
    id: "O013", clientName: "Karen Moss", businessName: "Moss Veterinary Clinic",
    industry: "Veterinary", website: "mossveterinary.com", primaryContact: "Karen Moss",
    email: "karen@mossveterinary.com", phone: "(555) 513-7622",
    assignedRep: "Sarah K.", leadSource: "Website", affiliateSource: "—",
    estimatedValue: 2900, monthlyValue: 2900, contractLength: "12 months",
    probability: 60, stage: "Audit In Progress", daysInStage: 8, nextAction: "Review audit findings with rep", priority: "Medium",
    closingMonth: "Jan 2025", expectedCloseDate: "Jan 17, 2025",
    opportunityScore: 75, forecastMonth: "January 2025", forecastQuarter: "Q1 2025",
    recentActivities: [
      { date: "Dec 27, 2024", type: "Lead Created", user: "Sarah K.", notes: "Website inbound." },
      { date: "Jan 3, 2025", type: "Audit Requested", user: "Sarah K.", notes: "Audit started." },
    ],
    notes: [{ date: "Jan 3, 2025", author: "Sarah K.", note: "Multi-doctor practice. Wants to rank for multiple vet-related keywords.", category: "Audit" }],
    nextSteps: [{ action: "Review audit findings", owner: "Sarah K.", dueDate: "Jan 14, 2025", priority: "Medium" }],
    audit: mkAudit("In Progress", "Dana L.", "Jan 14, 2025", "Multi-keyword vet ranking gaps identified."),
    proposal: NP, handoff: NH, affiliate: NAff,
    followUps: [{ id: "FU-013-1", subject: "Audit Findings Review", dueDate: "Jan 14, 2025", status: "Overdue", owner: "Sarah K." }],
    tasks: [{ id: "T-013-1", title: "Audit Review", status: "In Progress", owner: "Dana L.", dueDate: "Jan 14, 2025" }],
    notifications: [{ id: "N-013-1", type: "Opportunity Stalled", message: "Moss Vet Clinic audit is 8 days in progress.", date: "Jan 11, 2025", read: false }],
    workflowEvents: [
      { step: "Lead", completedAt: "Dec 27, 2024", completedBy: "Sarah K.", notes: "Website inbound." },
      { step: "Audit", completedAt: "Jan 3, 2025", completedBy: "Sarah K.", notes: "Audit started." },
    ],
    ghl: mkGhl("ghl-opp-013", "ghl-con-013", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-004", "Audit Requested", "ghl-user-sarah", "Sarah K.", "open", 2900, "Website", "2024-12-27T09:00:00Z", "2025-01-03T12:00:00Z", "2025-01-03T12:00:00Z", "Pending Sync"),
  },
  {
    id: "O014", clientName: "Darnell Brooks", businessName: "Brooks Insurance Group",
    industry: "Insurance", website: "brooksinsurance.com", primaryContact: "Darnell Brooks",
    email: "darnell@brooksinsurance.com", phone: "(555) 614-8733",
    assignedRep: "Alex R.", leadSource: "LSA", affiliateSource: "—",
    estimatedValue: 3300, monthlyValue: 3300, contractLength: "12 months",
    probability: 55, stage: "Audit In Progress", daysInStage: 3, nextAction: "Deliver SEO + GBP audit", priority: "High",
    closingMonth: "Jan 2025", expectedCloseDate: "Jan 19, 2025",
    opportunityScore: 72, forecastMonth: "January 2025", forecastQuarter: "Q1 2025",
    recentActivities: [
      { date: "Jan 5, 2025", type: "Lead Created", user: "Alex R.", notes: "LSA lead for insurance vertical." },
      { date: "Jan 8, 2025", type: "Audit Requested", user: "Alex R.", notes: "Audit initiated." },
    ],
    notes: [{ date: "Jan 8, 2025", author: "Alex R.", note: "Independent insurance agency. Wants local SEO.", category: "Audit" }],
    nextSteps: [{ action: "Deliver SEO + GBP audit", owner: "Alex R.", dueDate: "Jan 15, 2025", priority: "High" }],
    audit: mkAudit("In Progress", "Chris A.", "Jan 15, 2025", "Local SEO and GBP audit in progress."),
    proposal: NP, handoff: NH, affiliate: NAff,
    followUps: [{ id: "FU-014-1", subject: "Audit Delivery", dueDate: "Jan 15, 2025", status: "Upcoming", owner: "Alex R." }],
    tasks: [{ id: "T-014-1", title: "Audit Review", status: "In Progress", owner: "Chris A.", dueDate: "Jan 15, 2025" }],
    notifications: [{ id: "N-014-1", type: "Negotiation Updated", message: "Brooks Insurance audit assigned to Chris A.", date: "Jan 8, 2025", read: true }],
    workflowEvents: [
      { step: "Lead", completedAt: "Jan 5, 2025", completedBy: "Alex R.", notes: "LSA lead." },
      { step: "Audit", completedAt: "Jan 8, 2025", completedBy: "Alex R.", notes: "Audit initiated." },
    ],
    ghl: mkGhl("ghl-opp-014", "ghl-con-014", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-004", "Audit Requested", "ghl-user-alex", "Alex R.", "open", 3300, "LSA", "2025-01-05T08:00:00Z", "2025-01-08T14:00:00Z", "2025-01-08T14:00:00Z", "Synced"),
  },

  // ── Proposal Draft ────────────────────────────────────────────────────────
  {
    id: "O015", clientName: "Tina Alvarez", businessName: "Alvarez Family Dentistry",
    industry: "Dental", website: "alvarezfamilydental.com", primaryContact: "Tina Alvarez",
    email: "tina@alvarezfamilydental.com", phone: "(555) 715-9844",
    assignedRep: "Mike T.", leadSource: "Affiliate", affiliateSource: "Maria Santos",
    estimatedValue: 3500, monthlyValue: 3500, contractLength: "12 months",
    probability: 65, stage: "Proposal Draft", daysInStage: 3, nextAction: "Finalize pricing tiers", priority: "High",
    closingMonth: "Jan 2025", expectedCloseDate: "Jan 17, 2025",
    opportunityScore: 80, forecastMonth: "January 2025", forecastQuarter: "Q1 2025",
    recentActivities: [
      { date: "Dec 25, 2024", type: "Lead Created", user: "Mike T.", notes: "Affiliate referral." },
      { date: "Jan 3, 2025", type: "Audit Completed", user: "Mike T.", notes: "Audit results reviewed with client." },
      { date: "Jan 8, 2025", type: "Proposal Drafted", user: "Mike T.", notes: "Draft proposal started." },
    ],
    notes: [{ date: "Jan 8, 2025", author: "Mike T.", note: "Client loved audit results. Price sensitivity around setup fee.", category: "Proposal" }],
    nextSteps: [{ action: "Finalize pricing tiers", owner: "Mike T.", dueDate: "Jan 14, 2025", priority: "High" }],
    audit: mkAudit("Completed", "Dana L.", "Jan 3, 2025", "Dental SEO gaps found. GBP needs optimization."),
    proposal: mkProposal("Drafting", 3500, "—", "—", "Pending"),
    handoff: NH,
    affiliate: mkAffiliate("Maria Santos", "Affiliate Network", "MS-2024-12", "Percentage", 350, 3500),
    followUps: [{ id: "FU-015-1", subject: "Proposal Finalization", dueDate: "Jan 14, 2025", status: "Upcoming", owner: "Mike T." }],
    tasks: [
      { id: "T-015-1", title: "Discovery Call", status: "Completed", owner: "Mike T.", dueDate: "Dec 25, 2024" },
      { id: "T-015-2", title: "Audit Review", status: "Completed", owner: "Dana L.", dueDate: "Jan 3, 2025" },
      { id: "T-015-3", title: "Proposal Follow Up", status: "Open", owner: "Mike T.", dueDate: "Jan 17, 2025" },
    ],
    notifications: [{ id: "N-015-1", type: "Negotiation Updated", message: "Alvarez Dentistry proposal draft started.", date: "Jan 8, 2025", read: false }],
    workflowEvents: [
      { step: "Lead", completedAt: "Dec 25, 2024", completedBy: "Mike T.", notes: "Affiliate referral." },
      { step: "Audit", completedAt: "Jan 3, 2025", completedBy: "Dana L.", notes: "Audit completed." },
      { step: "Proposal", completedAt: "Jan 8, 2025", completedBy: "Mike T.", notes: "Proposal drafting." },
    ],
    ghl: mkGhl("ghl-opp-015", "ghl-con-015", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-004", "Audit Requested", "ghl-user-mike", "Mike T.", "open", 3500, "Affiliate", "2024-12-25T08:00:00Z", "2025-01-08T10:00:00Z", "2025-01-08T10:00:00Z", "Manual Override"),
  },
  {
    id: "O016", clientName: "Greg Hsu", businessName: "Hsu Commercial Cleaning",
    industry: "Commercial Cleaning", website: "hsuclean.com", primaryContact: "Greg Hsu",
    email: "greg@hsuclean.com", phone: "(555) 816-0955",
    assignedRep: "Jordan M.", leadSource: "Google Ads", affiliateSource: "—",
    estimatedValue: 1400, monthlyValue: 1400, contractLength: "6 months",
    probability: 60, stage: "Proposal Draft", daysInStage: 5, nextAction: "Add setup fee details", priority: "Medium",
    closingMonth: "Jan 2025", expectedCloseDate: "Jan 21, 2025",
    opportunityScore: 72, forecastMonth: "January 2025", forecastQuarter: "Q1 2025",
    recentActivities: [
      { date: "Dec 22, 2024", type: "Lead Created", user: "Jordan M.", notes: "Google Ads inbound." },
      { date: "Jan 6, 2025", type: "Proposal Drafted", user: "Jordan M.", notes: "Proposal started." },
    ],
    notes: [{ date: "Jan 6, 2025", author: "Jordan M.", note: "B2B cleaning service. Wants to rank locally.", category: "Proposal" }],
    nextSteps: [{ action: "Add setup fee details to proposal", owner: "Jordan M.", dueDate: "Jan 14, 2025", priority: "Medium" }],
    audit: mkAudit("Completed", "Chris A.", "Jan 4, 2025", "Local B2B SEO gaps. Minimal GBP presence."),
    proposal: mkProposal("Drafting", 1400, "—", "—", "Pending"),
    handoff: NH, affiliate: NAff,
    followUps: [{ id: "FU-016-1", subject: "Proposal Send Follow Up", dueDate: "Jan 21, 2025", status: "Upcoming", owner: "Jordan M." }],
    tasks: [{ id: "T-016-1", title: "Proposal Follow Up", status: "Open", owner: "Jordan M.", dueDate: "Jan 21, 2025" }],
    notifications: [{ id: "N-016-1", type: "Negotiation Updated", message: "Hsu Commercial Cleaning proposal being drafted.", date: "Jan 6, 2025", read: true }],
    workflowEvents: [
      { step: "Lead", completedAt: "Dec 22, 2024", completedBy: "Jordan M.", notes: "Google Ads lead." },
      { step: "Audit", completedAt: "Jan 4, 2025", completedBy: "Chris A.", notes: "Audit completed." },
      { step: "Proposal", completedAt: "Jan 6, 2025", completedBy: "Jordan M.", notes: "Proposal draft started." },
    ],
    ghl: mkGhl("ghl-opp-016", "ghl-con-016", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-004", "Audit Requested", "ghl-user-jordan", "Jordan M.", "open", 1400, "Google Ads", "2024-12-22T09:00:00Z", "2025-01-06T15:00:00Z", "2025-01-06T15:00:00Z", "Synced"),
  },
  {
    id: "O017", clientName: "Rachel Banks", businessName: "Banks Physical Therapy",
    industry: "Physical Therapy", website: "bankspt.com", primaryContact: "Rachel Banks",
    email: "rachel@bankspt.com", phone: "(555) 917-1066",
    assignedRep: "Sarah K.", leadSource: "Partner", affiliateSource: "HealthRef Network",
    estimatedValue: 2700, monthlyValue: 2700, contractLength: "12 months",
    probability: 65, stage: "Proposal Draft", daysInStage: 2, nextAction: "Internal review before send", priority: "High",
    closingMonth: "Jan 2025", expectedCloseDate: "Jan 22, 2025",
    opportunityScore: 78, forecastMonth: "January 2025", forecastQuarter: "Q1 2025",
    recentActivities: [
      { date: "Dec 28, 2024", type: "Lead Created", user: "Sarah K.", notes: "Partner referral." },
      { date: "Jan 7, 2025", type: "Proposal Drafted", user: "Sarah K.", notes: "Draft complete, needs review." },
    ],
    notes: [{ date: "Jan 7, 2025", author: "Sarah K.", note: "2-location PT practice. Ready to invest in digital growth.", category: "Proposal" }],
    nextSteps: [{ action: "Internal proposal review", owner: "Sarah K.", dueDate: "Jan 13, 2025", priority: "High" }],
    audit: mkAudit("Completed", "Dana L.", "Jan 5, 2025", "PT SEO weak. GBP outdated."),
    proposal: mkProposal("Drafting", 2700, "—", "—", "Pending"),
    handoff: NH,
    affiliate: mkAffiliate("HealthRef Network", "Partner Network", "HR-2024-12", "Flat Fee", 250, 2700),
    followUps: [{ id: "FU-017-1", subject: "Internal Review", dueDate: "Jan 13, 2025", status: "Upcoming", owner: "Sarah K." }],
    tasks: [
      { id: "T-017-1", title: "Audit Review", status: "Completed", owner: "Dana L.", dueDate: "Jan 5, 2025" },
      { id: "T-017-2", title: "Proposal Follow Up", status: "Open", owner: "Sarah K.", dueDate: "Jan 22, 2025" },
    ],
    notifications: [{ id: "N-017-1", type: "Negotiation Updated", message: "Banks PT proposal draft ready for review.", date: "Jan 7, 2025", read: false }],
    workflowEvents: [
      { step: "Lead", completedAt: "Dec 28, 2024", completedBy: "Sarah K.", notes: "Partner referral." },
      { step: "Audit", completedAt: "Jan 5, 2025", completedBy: "Dana L.", notes: "Audit completed." },
      { step: "Proposal", completedAt: "Jan 7, 2025", completedBy: "Sarah K.", notes: "Draft in review." },
    ],
    ghl: mkGhl("ghl-opp-017", "ghl-con-017", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-004", "Audit Requested", "ghl-user-sarah", "Sarah K.", "open", 2700, "Partner", "2024-12-28T08:00:00Z", "2025-01-07T11:00:00Z", "2025-01-07T11:00:00Z", "Pending Sync"),
  },

  // ── Proposal Sent ─────────────────────────────────────────────────────────
  {
    id: "O018", clientName: "Chris Nakamura", businessName: "Nakamura Pest Control",
    industry: "Pest Control", website: "nakamurapc.com", primaryContact: "Chris Nakamura",
    email: "chris@nakamurapc.com", phone: "(555) 118-2177",
    assignedRep: "Alex R.", leadSource: "Website", affiliateSource: "—",
    estimatedValue: 1900, monthlyValue: 1900, contractLength: "12 months",
    probability: 68, stage: "Proposal Sent", daysInStage: 4, nextAction: "Follow up call", priority: "Medium",
    closingMonth: "Jan 2025", expectedCloseDate: "Jan 23, 2025",
    opportunityScore: 80, forecastMonth: "January 2025", forecastQuarter: "Q1 2025",
    recentActivities: [
      { date: "Dec 20, 2024", type: "Lead Created", user: "Alex R.", notes: "Website inbound." },
      { date: "Jan 5, 2025", type: "Proposal Sent", user: "Alex R.", notes: "Proposal delivered via email." },
    ],
    notes: [{ date: "Jan 5, 2025", author: "Alex R.", note: "Proposal sent. Waiting for decision. Follow up due Jan 8.", category: "Proposal" }],
    nextSteps: [{ action: "Follow up call", owner: "Alex R.", dueDate: "Jan 14, 2025", priority: "Medium" }],
    audit: mkAudit("Completed", "Chris A.", "Jan 2, 2025", "Pest control local SEO audit complete."),
    proposal: mkProposal("Sent", 1900, "Jan 5, 2025", "Jan 6, 2025", "Pending"),
    handoff: NH, affiliate: NAff,
    followUps: [{ id: "FU-018-1", subject: "Proposal Follow Up Call", dueDate: "Jan 14, 2025", status: "Upcoming", owner: "Alex R." }],
    tasks: [
      { id: "T-018-1", title: "Proposal Follow Up", status: "Open", owner: "Alex R.", dueDate: "Jan 14, 2025" },
      { id: "T-018-2", title: "Negotiation Meeting", status: "Open", owner: "Alex R.", dueDate: "Jan 18, 2025" },
    ],
    notifications: [{ id: "N-018-1", type: "Proposal Viewed", message: "Nakamura Pest Control viewed the proposal on Jan 6.", date: "Jan 6, 2025", read: false }],
    workflowEvents: [
      { step: "Lead", completedAt: "Dec 20, 2024", completedBy: "Alex R.", notes: "Website inbound." },
      { step: "Audit", completedAt: "Jan 2, 2025", completedBy: "Chris A.", notes: "Audit complete." },
      { step: "Proposal", completedAt: "Jan 5, 2025", completedBy: "Alex R.", notes: "Proposal sent." },
    ],
    ghl: mkGhl("ghl-opp-018", "ghl-con-018", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-005", "Proposal Sent", "ghl-user-alex", "Alex R.", "open", 1900, "Website", "2024-12-20T09:00:00Z", "2025-01-05T16:00:00Z", "2025-01-06T08:00:00Z", "Synced"),
  },
  {
    id: "O019", clientName: "Vanessa Cruz", businessName: "Cruz Cosmetics Studio",
    industry: "Beauty", website: "cruzcosmetics.com", primaryContact: "Vanessa Cruz",
    email: "vanessa@cruzcosmetics.com", phone: "(555) 219-3288",
    assignedRep: "Jordan M.", leadSource: "Meta Ads", affiliateSource: "—",
    estimatedValue: 2200, monthlyValue: 2200, contractLength: "12 months",
    probability: 70, stage: "Proposal Sent", daysInStage: 6, nextAction: "Send follow-up email", priority: "High",
    closingMonth: "Jan 2025", expectedCloseDate: "Jan 20, 2025",
    opportunityScore: 82, forecastMonth: "January 2025", forecastQuarter: "Q1 2025",
    recentActivities: [
      { date: "Dec 18, 2024", type: "Lead Created", user: "Jordan M.", notes: "Meta Ads lead." },
      { date: "Jan 4, 2025", type: "Proposal Sent", user: "Jordan M.", notes: "Proposal emailed." },
    ],
    notes: [{ date: "Jan 4, 2025", author: "Jordan M.", note: "High-end cosmetics studio. Very interested in brand SEO.", category: "Proposal" }],
    nextSteps: [{ action: "Follow-up email", owner: "Jordan M.", dueDate: "Jan 13, 2025", priority: "High" }],
    audit: mkAudit("Completed", "Dana L.", "Dec 30, 2024", "Cosmetics SEO weak. Social presence strong."),
    proposal: mkProposal("Viewed", 2200, "Jan 4, 2025", "Jan 5, 2025", "Pending"),
    handoff: NH, affiliate: NAff,
    followUps: [{ id: "FU-019-1", subject: "Proposal Follow Up Email", dueDate: "Jan 13, 2025", status: "Overdue", owner: "Jordan M." }],
    tasks: [
      { id: "T-019-1", title: "Proposal Follow Up", status: "Overdue", owner: "Jordan M.", dueDate: "Jan 13, 2025" },
      { id: "T-019-2", title: "Negotiation Meeting", status: "Open", owner: "Jordan M.", dueDate: "Jan 17, 2025" },
    ],
    notifications: [{ id: "N-019-1", type: "Proposal Viewed", message: "Cruz Cosmetics viewed proposal Jan 5. No response yet.", date: "Jan 10, 2025", read: false }],
    workflowEvents: [
      { step: "Lead", completedAt: "Dec 18, 2024", completedBy: "Jordan M.", notes: "Meta Ads lead." },
      { step: "Audit", completedAt: "Dec 30, 2024", completedBy: "Dana L.", notes: "Audit completed." },
      { step: "Proposal", completedAt: "Jan 4, 2025", completedBy: "Jordan M.", notes: "Proposal sent and viewed." },
    ],
    ghl: mkGhl("ghl-opp-019", "ghl-con-019", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-005", "Proposal Sent", "ghl-user-jordan", "Jordan M.", "open", 2200, "Meta Ads", "2024-12-18T08:00:00Z", "2025-01-04T17:00:00Z", "2025-01-05T09:00:00Z", "Synced"),
  },
  {
    id: "O020", clientName: "Frank Deluca", businessName: "DeLuca Gutters & Siding",
    industry: "Home Improvement", website: "delucagutters.com", primaryContact: "Frank Deluca",
    email: "frank@delucagutters.com", phone: "(555) 320-4399",
    assignedRep: "Mike T.", leadSource: "LSA", affiliateSource: "—",
    estimatedValue: 1700, monthlyValue: 1700, contractLength: "12 months",
    probability: 65, stage: "Proposal Sent", daysInStage: 9, nextAction: "Check if viewed + follow up", priority: "Medium",
    closingMonth: "Jan 2025", expectedCloseDate: "Jan 19, 2025",
    opportunityScore: 76, forecastMonth: "January 2025", forecastQuarter: "Q1 2025",
    recentActivities: [
      { date: "Dec 15, 2024", type: "Lead Created", user: "Mike T.", notes: "LSA lead." },
      { date: "Jan 2, 2025", type: "Proposal Sent", user: "Mike T.", notes: "Proposal delivered." },
    ],
    notes: [{ date: "Jan 2, 2025", author: "Mike T.", note: "Proposal sent 9 days ago. No response yet. Need to follow up.", category: "Follow-Up" }],
    nextSteps: [{ action: "Check proposal open + follow up", owner: "Mike T.", dueDate: "Jan 12, 2025", priority: "Medium" }],
    audit: mkAudit("Completed", "Chris A.", "Dec 28, 2024", "Gutters + siding local SEO gaps noted."),
    proposal: mkProposal("Sent", 1700, "Jan 2, 2025", "—", "Pending"),
    handoff: NH, affiliate: NAff,
    followUps: [{ id: "FU-020-1", subject: "Proposal Check-In", dueDate: "Jan 12, 2025", status: "Overdue", owner: "Mike T." }],
    tasks: [{ id: "T-020-1", title: "Proposal Follow Up", status: "Overdue", owner: "Mike T.", dueDate: "Jan 12, 2025" }],
    notifications: [{ id: "N-020-1", type: "Opportunity Stalled", message: "DeLuca Gutters proposal unopened after 9 days.", date: "Jan 11, 2025", read: false }],
    workflowEvents: [
      { step: "Lead", completedAt: "Dec 15, 2024", completedBy: "Mike T.", notes: "LSA lead." },
      { step: "Audit", completedAt: "Dec 28, 2024", completedBy: "Chris A.", notes: "Audit complete." },
      { step: "Proposal", completedAt: "Jan 2, 2025", completedBy: "Mike T.", notes: "Proposal sent." },
    ],
    ghl: mkGhl("ghl-opp-020", "ghl-con-020", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-005", "Proposal Sent", "ghl-user-mike", "Mike T.", "open", 1700, "LSA", "2024-12-15T08:00:00Z", "2025-01-02T11:00:00Z", "2025-01-02T11:00:00Z", "Sync Failed", "GHL API timeout on last sync attempt"),
  },

  // ── Negotiation ───────────────────────────────────────────────────────────
  {
    id: "O021", clientName: "Mia Fontaine", businessName: "Fontaine Chiropractic",
    industry: "Chiropractic", website: "fontainechiro.com", primaryContact: "Mia Fontaine",
    email: "mia@fontainechiro.com", phone: "(555) 421-5400",
    assignedRep: "Sarah K.", leadSource: "Affiliate", affiliateSource: "Lisa Park",
    estimatedValue: 3100, monthlyValue: 3100, contractLength: "12 months",
    probability: 75, stage: "Negotiation", daysInStage: 5, nextAction: "Counter-offer on setup fee", priority: "High",
    closingMonth: "Jan 2025", expectedCloseDate: "Jan 16, 2025",
    opportunityScore: 85, forecastMonth: "January 2025", forecastQuarter: "Q1 2025",
    recentActivities: [
      { date: "Dec 12, 2024", type: "Lead Created", user: "Sarah K.", notes: "Affiliate referral from Lisa Park." },
      { date: "Jan 6, 2025", type: "Negotiation Updated", user: "Sarah K.", notes: "Counter on setup fee discussed." },
    ],
    notes: [{ date: "Jan 6, 2025", author: "Sarah K.", note: "Happy with SEO package. Wants setup fee waived or reduced.", category: "Negotiation" }],
    nextSteps: [{ action: "Counter-offer on setup fee", owner: "Sarah K.", dueDate: "Jan 13, 2025", priority: "High" }],
    audit: mkAudit("Completed", "Dana L.", "Dec 20, 2024", "Chiro SEO opportunities identified."),
    proposal: mkProposal("Viewed", 3100, "Dec 28, 2024", "Dec 29, 2024", "Pending"),
    handoff: NH,
    affiliate: mkAffiliate("Lisa Park", "Affiliate Network", "LP-2024-12", "Percentage", 310, 3100),
    followUps: [{ id: "FU-021-1", subject: "Setup Fee Negotiation", dueDate: "Jan 13, 2025", status: "Upcoming", owner: "Sarah K." }],
    tasks: [
      { id: "T-021-1", title: "Negotiation Meeting", status: "In Progress", owner: "Sarah K.", dueDate: "Jan 13, 2025" },
      { id: "T-021-2", title: "Handoff Preparation", status: "Open", owner: "Sarah K.", dueDate: "Jan 17, 2025" },
    ],
    notifications: [{ id: "N-021-1", type: "Negotiation Updated", message: "Fontaine Chiro negotiating setup fee reduction.", date: "Jan 6, 2025", read: false }],
    workflowEvents: [
      { step: "Lead", completedAt: "Dec 12, 2024", completedBy: "Sarah K.", notes: "Affiliate referral." },
      { step: "Audit", completedAt: "Dec 20, 2024", completedBy: "Dana L.", notes: "Audit done." },
      { step: "Proposal", completedAt: "Dec 28, 2024", completedBy: "Sarah K.", notes: "Proposal sent." },
      { step: "Negotiation", completedAt: "Jan 6, 2025", completedBy: "Sarah K.", notes: "Negotiation on setup fee." },
    ],
    ghl: mkGhl("ghl-opp-021", "ghl-con-021", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-006", "Negotiation", "ghl-user-sarah", "Sarah K.", "open", 3100, "Affiliate", "2024-12-12T09:00:00Z", "2025-01-06T14:00:00Z", "2025-01-06T14:00:00Z", "Synced"),
  },
  {
    id: "O022", clientName: "Elijah Brown", businessName: "Brown & Sons Plumbing",
    industry: "Plumbing", website: "brownsonsplumbing.com", primaryContact: "Elijah Brown",
    email: "elijah@brownsonsplumbing.com", phone: "(555) 522-6511",
    assignedRep: "Alex R.", leadSource: "Direct", affiliateSource: "—",
    estimatedValue: 2800, monthlyValue: 2800, contractLength: "12 months",
    probability: 72, stage: "Negotiation", daysInStage: 7, nextAction: "Finalize contract length", priority: "Urgent",
    closingMonth: "Jan 2025", expectedCloseDate: "Jan 15, 2025",
    opportunityScore: 87, forecastMonth: "January 2025", forecastQuarter: "Q1 2025",
    recentActivities: [
      { date: "Dec 10, 2024", type: "Lead Created", user: "Alex R.", notes: "Direct inbound." },
      { date: "Jan 4, 2025", type: "Negotiation Updated", user: "Alex R.", notes: "Negotiating on contract length." },
    ],
    notes: [{ date: "Jan 4, 2025", author: "Alex R.", note: "Client wants 6-month option instead of 12. Discussing options.", category: "Negotiation" }],
    nextSteps: [{ action: "Finalize contract length decision", owner: "Alex R.", dueDate: "Jan 12, 2025", priority: "Urgent" }],
    audit: mkAudit("Completed", "Chris A.", "Dec 22, 2024", "Plumbing local SEO strong but GBP incomplete."),
    proposal: mkProposal("Viewed", 2800, "Dec 26, 2024", "Dec 27, 2024", "Pending"),
    handoff: NH, affiliate: NAff,
    followUps: [{ id: "FU-022-1", subject: "Contract Length Decision", dueDate: "Jan 12, 2025", status: "Overdue", owner: "Alex R." }],
    tasks: [{ id: "T-022-1", title: "Negotiation Meeting", status: "In Progress", owner: "Alex R.", dueDate: "Jan 12, 2025" }],
    notifications: [{ id: "N-022-1", type: "Negotiation Updated", message: "Brown & Sons contract length under negotiation.", date: "Jan 4, 2025", read: false }],
    workflowEvents: [
      { step: "Lead", completedAt: "Dec 10, 2024", completedBy: "Alex R.", notes: "Direct inbound." },
      { step: "Audit", completedAt: "Dec 22, 2024", completedBy: "Chris A.", notes: "Audit done." },
      { step: "Proposal", completedAt: "Dec 26, 2024", completedBy: "Alex R.", notes: "Proposal sent." },
      { step: "Negotiation", completedAt: "Jan 4, 2025", completedBy: "Alex R.", notes: "Negotiation ongoing." },
    ],
    ghl: mkGhl("ghl-opp-022", "ghl-con-022", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-006", "Negotiation", "ghl-user-alex", "Alex R.", "open", 2800, "Direct", "2024-12-10T08:00:00Z", "2025-01-04T16:00:00Z", "2025-01-04T16:00:00Z", "Pending Sync"),
  },

  // ── Verbal Approval ───────────────────────────────────────────────────────
  {
    id: "O023", clientName: "Olivia Chang", businessName: "Chang Nail & Beauty Bar",
    industry: "Beauty", website: "changnailbar.com", primaryContact: "Olivia Chang",
    email: "olivia@changnailbar.com", phone: "(555) 623-7622",
    assignedRep: "Jordan M.", leadSource: "Affiliate", affiliateSource: "Tyler Nguyen",
    estimatedValue: 1600, monthlyValue: 1600, contractLength: "12 months",
    probability: 85, stage: "Verbal Approval", daysInStage: 2, nextAction: "Send final proposal for signature", priority: "High",
    closingMonth: "Jan 2025", expectedCloseDate: "Jan 14, 2025",
    opportunityScore: 90, forecastMonth: "January 2025", forecastQuarter: "Q1 2025",
    recentActivities: [
      { date: "Dec 8, 2024", type: "Lead Created", user: "Jordan M.", notes: "Affiliate referral Tyler Nguyen." },
      { date: "Jan 9, 2025", type: "Follow Up Completed", user: "Jordan M.", notes: "Client gave verbal yes." },
    ],
    notes: [{ date: "Jan 9, 2025", author: "Jordan M.", note: "Verbal yes received. Sending final contract today.", category: "Negotiation" }],
    nextSteps: [{ action: "Send final proposal for signature", owner: "Jordan M.", dueDate: "Jan 12, 2025", priority: "High" }],
    audit: mkAudit("Completed", "Dana L.", "Dec 18, 2024", "Beauty bar local SEO gap. No GBP photos."),
    proposal: mkProposal("Viewed", 1600, "Dec 22, 2024", "Dec 23, 2024", "Verbal Approved"),
    handoff: NH,
    affiliate: mkAffiliate("Tyler Nguyen", "Affiliate Network", "TN-2024-12", "Flat Fee", 150, 1600),
    followUps: [{ id: "FU-023-1", subject: "Final Contract Send", dueDate: "Jan 12, 2025", status: "Upcoming", owner: "Jordan M." }],
    tasks: [
      { id: "T-023-1", title: "Negotiation Meeting", status: "Completed", owner: "Jordan M.", dueDate: "Jan 9, 2025" },
      { id: "T-023-2", title: "Handoff Preparation", status: "Open", owner: "Jordan M.", dueDate: "Jan 14, 2025" },
    ],
    notifications: [{ id: "N-023-1", type: "Proposal Approved", message: "Chang Nail Bar gave verbal approval Jan 9.", date: "Jan 9, 2025", read: false }],
    workflowEvents: [
      { step: "Lead", completedAt: "Dec 8, 2024", completedBy: "Jordan M.", notes: "Affiliate referral." },
      { step: "Audit", completedAt: "Dec 18, 2024", completedBy: "Dana L.", notes: "Audit done." },
      { step: "Proposal", completedAt: "Dec 22, 2024", completedBy: "Jordan M.", notes: "Proposal sent." },
      { step: "Negotiation", completedAt: "Jan 5, 2025", completedBy: "Jordan M.", notes: "Negotiation resolved." },
      { step: "Approved", completedAt: "Jan 9, 2025", completedBy: "Jordan M.", notes: "Verbal approval received." },
    ],
    ghl: mkGhl("ghl-opp-023", "ghl-con-023", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-007", "Won", "ghl-user-jordan", "Jordan M.", "open", 1600, "Affiliate", "2024-12-08T08:00:00Z", "2025-01-09T10:00:00Z", "2025-01-09T10:00:00Z", "Synced"),
  },
  {
    id: "O024", clientName: "Brett Simmons", businessName: "Simmons Auto Repair",
    industry: "Automotive", website: "simmonsauto.com", primaryContact: "Brett Simmons",
    email: "brett@simmonsauto.com", phone: "(555) 724-8733",
    assignedRep: "Mike T.", leadSource: "Google Ads", affiliateSource: "—",
    estimatedValue: 2400, monthlyValue: 2400, contractLength: "12 months",
    probability: 88, stage: "Verbal Approval", daysInStage: 3, nextAction: "Get signature on contract", priority: "Urgent",
    closingMonth: "Jan 2025", expectedCloseDate: "Jan 13, 2025",
    opportunityScore: 92, forecastMonth: "January 2025", forecastQuarter: "Q1 2025",
    recentActivities: [
      { date: "Dec 5, 2024", type: "Lead Created", user: "Mike T.", notes: "Google Ads inbound." },
      { date: "Jan 8, 2025", type: "Follow Up Completed", user: "Mike T.", notes: "Verbal approval secured." },
    ],
    notes: [{ date: "Jan 8, 2025", author: "Mike T.", note: "Committed verbally. Needs signed contract by end of week.", category: "Negotiation" }],
    nextSteps: [{ action: "Get signature on contract", owner: "Mike T.", dueDate: "Jan 11, 2025", priority: "Urgent" }],
    audit: mkAudit("Completed", "Chris A.", "Dec 15, 2024", "Auto repair SEO highly competitive locally."),
    proposal: mkProposal("Viewed", 2400, "Dec 20, 2024", "Dec 21, 2024", "Verbal Approved"),
    handoff: NH, affiliate: NAff,
    followUps: [{ id: "FU-024-1", subject: "Signature Reminder", dueDate: "Jan 11, 2025", status: "Upcoming", owner: "Mike T." }],
    tasks: [
      { id: "T-024-1", title: "Negotiation Meeting", status: "Completed", owner: "Mike T.", dueDate: "Jan 8, 2025" },
      { id: "T-024-2", title: "Handoff Preparation", status: "Open", owner: "Mike T.", dueDate: "Jan 13, 2025" },
    ],
    notifications: [{ id: "N-024-1", type: "Deal Closing Soon", message: "Simmons Auto verbal approval received. Contract due.", date: "Jan 8, 2025", read: false }],
    workflowEvents: [
      { step: "Lead", completedAt: "Dec 5, 2024", completedBy: "Mike T.", notes: "Google Ads inbound." },
      { step: "Audit", completedAt: "Dec 15, 2024", completedBy: "Chris A.", notes: "Audit completed." },
      { step: "Proposal", completedAt: "Dec 20, 2024", completedBy: "Mike T.", notes: "Proposal sent." },
      { step: "Negotiation", completedAt: "Jan 5, 2025", completedBy: "Mike T.", notes: "Terms agreed." },
      { step: "Approved", completedAt: "Jan 8, 2025", completedBy: "Mike T.", notes: "Verbal yes." },
    ],
    ghl: mkGhl("ghl-opp-024", "ghl-con-024", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-007", "Won", "ghl-user-mike", "Mike T.", "open", 2400, "Google Ads", "2024-12-05T08:00:00Z", "2025-01-08T12:00:00Z", "2025-01-08T12:00:00Z", "Manual Override"),
  },

  // ── Proposal Approved ─────────────────────────────────────────────────────
  {
    id: "O025", clientName: "Diana Flores", businessName: "Flores Urgent Care",
    industry: "Healthcare", website: "floresurgentcare.com", primaryContact: "Diana Flores",
    email: "diana@floresurgentcare.com", phone: "(555) 825-9844",
    assignedRep: "Sarah K.", leadSource: "Partner", affiliateSource: "MedRef Alliance",
    estimatedValue: 5500, monthlyValue: 5500, contractLength: "24 months",
    probability: 92, stage: "Proposal Approved", daysInStage: 1, nextAction: "Initiate handoff checklist", priority: "Urgent",
    closingMonth: "Jan 2025", expectedCloseDate: "Jan 12, 2025",
    opportunityScore: 95, forecastMonth: "January 2025", forecastQuarter: "Q1 2025",
    recentActivities: [
      { date: "Dec 1, 2024", type: "Lead Created", user: "Sarah K.", notes: "MedRef Alliance partner referral." },
      { date: "Jan 10, 2025", type: "Proposal Sent", user: "Sarah K.", notes: "Signed proposal received." },
    ],
    notes: [{ date: "Jan 10, 2025", author: "Sarah K.", note: "Contract signed. Initiating onboarding handoff.", category: "General" }],
    nextSteps: [{ action: "Initiate handoff checklist", owner: "Sarah K.", dueDate: "Jan 11, 2025", priority: "Urgent" }],
    audit: mkAudit("Reviewed", "Dana L.", "Nov 20, 2024", "Healthcare SEO full audit. Strong GBP. Citations needed."),
    proposal: mkProposal("Approved", 5500, "Dec 28, 2024", "Dec 29, 2024", "Signed"),
    handoff: mkHandoff("Initiated", "Submitted", "Drafted", "Not Started"),
    affiliate: mkAffiliate("MedRef Alliance", "Partner Network", "MRA-2024-12", "Tiered", 550, 5500),
    followUps: [{ id: "FU-025-1", subject: "Handoff Kickoff", dueDate: "Jan 11, 2025", status: "Upcoming", owner: "Sarah K." }],
    tasks: [
      { id: "T-025-1", title: "Negotiation Meeting", status: "Completed", owner: "Sarah K.", dueDate: "Dec 26, 2024" },
      { id: "T-025-2", title: "Handoff Preparation", status: "In Progress", owner: "Sarah K.", dueDate: "Jan 11, 2025" },
    ],
    notifications: [{ id: "N-025-1", type: "Proposal Approved", message: "Flores Urgent Care contract signed. Handoff initiated.", date: "Jan 10, 2025", read: false }],
    workflowEvents: [
      { step: "Lead", completedAt: "Dec 1, 2024", completedBy: "Sarah K.", notes: "Partner referral." },
      { step: "Audit", completedAt: "Nov 20, 2024", completedBy: "Dana L.", notes: "Full audit." },
      { step: "Proposal", completedAt: "Dec 28, 2024", completedBy: "Sarah K.", notes: "Proposal sent." },
      { step: "Negotiation", completedAt: "Dec 26, 2024", completedBy: "Sarah K.", notes: "Terms finalized." },
      { step: "Approved", completedAt: "Jan 10, 2025", completedBy: "Sarah K.", notes: "Signed and approved." },
      { step: "Handoff", completedAt: "Jan 10, 2025", completedBy: "Sarah K.", notes: "Handoff initiated." },
    ],
    ghl: mkGhl("ghl-opp-025", "ghl-con-025", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-007", "Won", "ghl-user-sarah", "Sarah K.", "won", 5500, "Partner", "2024-12-01T08:00:00Z", "2025-01-10T13:00:00Z", "2025-01-10T13:00:00Z", "Synced"),
  },
  {
    id: "O026", clientName: "Aaron Kline", businessName: "Kline Law Group",
    industry: "Legal", website: "klinelawgroup.com", primaryContact: "Aaron Kline",
    email: "aaron@klinelawgroup.com", phone: "(555) 926-0955",
    assignedRep: "Jordan M.", leadSource: "Affiliate", affiliateSource: "Brandon Ellis",
    estimatedValue: 4100, monthlyValue: 4100, contractLength: "12 months",
    probability: 90, stage: "Proposal Approved", daysInStage: 2, nextAction: "Confirm billing contact", priority: "High",
    closingMonth: "Jan 2025", expectedCloseDate: "Jan 13, 2025",
    opportunityScore: 93, forecastMonth: "January 2025", forecastQuarter: "Q1 2025",
    recentActivities: [
      { date: "Nov 28, 2024", type: "Lead Created", user: "Jordan M.", notes: "Affiliate Brandon Ellis referral." },
      { date: "Jan 9, 2025", type: "Proposal Sent", user: "Jordan M.", notes: "Proposal approved and signed." },
    ],
    notes: [{ date: "Jan 9, 2025", author: "Jordan M.", note: "Signed. Need billing contact before handoff.", category: "General" }],
    nextSteps: [{ action: "Confirm billing contact", owner: "Jordan M.", dueDate: "Jan 12, 2025", priority: "High" }],
    audit: mkAudit("Reviewed", "Chris A.", "Dec 10, 2024", "Legal SEO full audit. Competitor gap analysis done."),
    proposal: mkProposal("Approved", 4100, "Jan 2, 2025", "Jan 3, 2025", "Signed"),
    handoff: mkHandoff("Initiated", "Pending", "Not Created", "Not Started"),
    affiliate: mkAffiliate("Brandon Ellis", "Affiliate Network", "BE-2024-11", "Percentage", 410, 4100),
    followUps: [{ id: "FU-026-1", subject: "Billing Contact Confirmation", dueDate: "Jan 12, 2025", status: "Upcoming", owner: "Jordan M." }],
    tasks: [
      { id: "T-026-1", title: "Negotiation Meeting", status: "Completed", owner: "Jordan M.", dueDate: "Jan 2, 2025" },
      { id: "T-026-2", title: "Handoff Preparation", status: "Open", owner: "Jordan M.", dueDate: "Jan 13, 2025" },
    ],
    notifications: [{ id: "N-026-1", type: "Proposal Approved", message: "Kline Law Group contract signed Jan 9.", date: "Jan 9, 2025", read: false }],
    workflowEvents: [
      { step: "Lead", completedAt: "Nov 28, 2024", completedBy: "Jordan M.", notes: "Affiliate referral." },
      { step: "Audit", completedAt: "Dec 10, 2024", completedBy: "Chris A.", notes: "Full audit." },
      { step: "Proposal", completedAt: "Jan 2, 2025", completedBy: "Jordan M.", notes: "Proposal sent." },
      { step: "Negotiation", completedAt: "Jan 5, 2025", completedBy: "Jordan M.", notes: "Terms agreed." },
      { step: "Approved", completedAt: "Jan 9, 2025", completedBy: "Jordan M.", notes: "Contract signed." },
    ],
    ghl: mkGhl("ghl-opp-026", "ghl-con-026", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-007", "Won", "ghl-user-jordan", "Jordan M.", "won", 4100, "Affiliate", "2024-11-28T08:00:00Z", "2025-01-09T11:00:00Z", "2025-01-09T11:00:00Z", "Synced"),
  },

  // ── Sales Handoff ─────────────────────────────────────────────────────────
  {
    id: "O027", clientName: "Natalie Ross", businessName: "Ross Family Chiropractic",
    industry: "Chiropractic", website: "rossfamilychiro.com", primaryContact: "Natalie Ross",
    email: "natalie@rossfamilychiro.com", phone: "(555) 127-2177",
    assignedRep: "Alex R.", leadSource: "Website", affiliateSource: "—",
    estimatedValue: 2600, monthlyValue: 2600, contractLength: "12 months",
    probability: 95, stage: "Sales Handoff", daysInStage: 1, nextAction: "Complete handoff form", priority: "High",
    closingMonth: "Jan 2025", expectedCloseDate: "Jan 11, 2025",
    opportunityScore: 97, forecastMonth: "January 2025", forecastQuarter: "Q1 2025",
    recentActivities: [
      { date: "Nov 20, 2024", type: "Lead Created", user: "Alex R.", notes: "Website inbound." },
      { date: "Jan 10, 2025", type: "Stage Changed", user: "Alex R.", notes: "Moved to Sales Handoff." },
    ],
    notes: [{ date: "Jan 10, 2025", author: "Alex R.", note: "Ready for handoff. All paperwork complete.", category: "General" }],
    nextSteps: [{ action: "Complete handoff form", owner: "Alex R.", dueDate: "Jan 11, 2025", priority: "High" }],
    audit: mkAudit("Reviewed", "Dana L.", "Dec 5, 2024", "Chiro full audit complete. Onboarding ready."),
    proposal: mkProposal("Approved", 2600, "Dec 28, 2024", "Dec 29, 2024", "Signed"),
    handoff: mkHandoff("Initiated", "Submitted", "Drafted", "Not Started"),
    affiliate: NAff,
    followUps: [{ id: "FU-027-1", subject: "Handoff Form Completion", dueDate: "Jan 11, 2025", status: "Upcoming", owner: "Alex R." }],
    tasks: [{ id: "T-027-1", title: "Handoff Preparation", status: "In Progress", owner: "Alex R.", dueDate: "Jan 11, 2025" }],
    notifications: [{ id: "N-027-1", type: "Proposal Approved", message: "Ross Family Chiropractic moving to handoff.", date: "Jan 10, 2025", read: false }],
    workflowEvents: [
      { step: "Lead", completedAt: "Nov 20, 2024", completedBy: "Alex R.", notes: "Website inbound." },
      { step: "Audit", completedAt: "Dec 5, 2024", completedBy: "Dana L.", notes: "Audit done." },
      { step: "Proposal", completedAt: "Dec 28, 2024", completedBy: "Alex R.", notes: "Proposal sent." },
      { step: "Approved", completedAt: "Jan 8, 2025", completedBy: "Alex R.", notes: "Contract signed." },
      { step: "Handoff", completedAt: "Jan 10, 2025", completedBy: "Alex R.", notes: "Handoff started." },
    ],
    ghl: mkGhl("ghl-opp-027", "ghl-con-027", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-007", "Won", "ghl-user-alex", "Alex R.", "won", 2600, "Website", "2024-11-20T09:00:00Z", "2025-01-10T15:00:00Z", "2025-01-10T15:00:00Z", "Synced"),
  },
  {
    id: "O028", clientName: "Samuel Torres", businessName: "Torres Landscaping & Design",
    industry: "Landscaping", website: "torreslandscaping.com", primaryContact: "Samuel Torres",
    email: "samuel@torreslandscaping.com", phone: "(555) 228-3288",
    assignedRep: "Mike T.", leadSource: "LSA", affiliateSource: "—",
    estimatedValue: 3000, monthlyValue: 3000, contractLength: "12 months",
    probability: 95, stage: "Sales Handoff", daysInStage: 2, nextAction: "Send to billing + onboarding", priority: "Urgent",
    closingMonth: "Jan 2025", expectedCloseDate: "Jan 12, 2025",
    opportunityScore: 98, forecastMonth: "January 2025", forecastQuarter: "Q1 2025",
    recentActivities: [
      { date: "Nov 18, 2024", type: "Lead Created", user: "Mike T.", notes: "LSA lead." },
      { date: "Jan 9, 2025", type: "Stage Changed", user: "Mike T.", notes: "Handoff initiated." },
    ],
    notes: [{ date: "Jan 9, 2025", author: "Mike T.", note: "Sending to billing and onboarding now.", category: "General" }],
    nextSteps: [{ action: "Send to billing + onboarding", owner: "Mike T.", dueDate: "Jan 11, 2025", priority: "Urgent" }],
    audit: mkAudit("Reviewed", "Chris A.", "Dec 8, 2024", "Landscaping audit done. Strong seasonal SEO plan."),
    proposal: mkProposal("Approved", 3000, "Dec 30, 2024", "Dec 31, 2024", "Signed"),
    handoff: mkHandoff("Billing Sent", "Submitted", "Sent", "Not Started"),
    affiliate: NAff,
    followUps: [{ id: "FU-028-1", subject: "Billing + Onboarding Send", dueDate: "Jan 11, 2025", status: "Upcoming", owner: "Mike T." }],
    tasks: [{ id: "T-028-1", title: "Handoff Preparation", status: "In Progress", owner: "Mike T.", dueDate: "Jan 11, 2025" }],
    notifications: [{ id: "N-028-1", type: "Deal Closing Soon", message: "Torres Landscaping handoff in progress. Billing sent.", date: "Jan 9, 2025", read: false }],
    workflowEvents: [
      { step: "Lead", completedAt: "Nov 18, 2024", completedBy: "Mike T.", notes: "LSA lead." },
      { step: "Audit", completedAt: "Dec 8, 2024", completedBy: "Chris A.", notes: "Audit done." },
      { step: "Proposal", completedAt: "Dec 30, 2024", completedBy: "Mike T.", notes: "Proposal sent." },
      { step: "Approved", completedAt: "Jan 7, 2025", completedBy: "Mike T.", notes: "Contract signed." },
      { step: "Handoff", completedAt: "Jan 9, 2025", completedBy: "Mike T.", notes: "Handoff and billing initiated." },
      { step: "Billing", completedAt: "Jan 9, 2025", completedBy: "Mike T.", notes: "Billing request submitted." },
    ],
    ghl: mkGhl("ghl-opp-028", "ghl-con-028", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-007", "Won", "ghl-user-mike", "Mike T.", "won", 3000, "LSA", "2024-11-18T08:00:00Z", "2025-01-09T14:00:00Z", "2025-01-09T14:00:00Z", "Synced"),
  },

  // ── Closed Won ────────────────────────────────────────────────────────────
  {
    id: "O029", clientName: "Ethan Price", businessName: "Sunstate Solar",
    industry: "Solar", website: "sunstatesolar.com", primaryContact: "Ethan Price",
    email: "ethan@sunstatesolar.com", phone: "(555) 329-4399",
    assignedRep: "Sarah K.", leadSource: "Affiliate", affiliateSource: "Brandon Ellis",
    estimatedValue: 6000, monthlyValue: 6000, contractLength: "24 months",
    probability: 100, stage: "Closed Won", daysInStage: 0, nextAction: "Onboarding in progress", priority: "Low",
    closingMonth: "Dec 2024", expectedCloseDate: "Dec 20, 2024",
    opportunityScore: 100, forecastMonth: "December 2024", forecastQuarter: "Q4 2024",
    recentActivities: [
      { date: "Oct 1, 2024", type: "Lead Created", user: "Sarah K.", notes: "Brandon Ellis referral." },
      { date: "Dec 20, 2024", type: "Stage Changed", user: "Sarah K.", notes: "Closed Won." },
    ],
    notes: [{ date: "Dec 20, 2024", author: "Sarah K.", note: "Closed! Onboarding started Dec 20.", category: "General" }],
    nextSteps: [{ action: "Monitor onboarding progress", owner: "Sarah K.", dueDate: "Jan 20, 2025", priority: "Low" }],
    audit: mkAudit("Reviewed", "Dana L.", "Oct 20, 2024", "Solar SEO audit done. High-value market."),
    proposal: mkProposal("Approved", 6000, "Nov 15, 2024", "Nov 16, 2024", "Signed"),
    handoff: mkHandoff("Activated", "Approved", "Paid", "Live"),
    affiliate: mkAffiliate("Brandon Ellis", "Affiliate Network", "BE-2024-10", "Percentage", 600, 6000),
    followUps: [],
    tasks: [{ id: "T-029-1", title: "Discovery Call", status: "Completed", owner: "Sarah K.", dueDate: "Oct 10, 2024" }],
    notifications: [{ id: "N-029-1", type: "Proposal Approved", message: "Sunstate Solar is live. Onboarding complete.", date: "Dec 20, 2024", read: true }],
    workflowEvents: [
      { step: "Lead", completedAt: "Oct 1, 2024", completedBy: "Sarah K.", notes: "Affiliate referral." },
      { step: "Audit", completedAt: "Oct 20, 2024", completedBy: "Dana L.", notes: "Audit done." },
      { step: "Proposal", completedAt: "Nov 15, 2024", completedBy: "Sarah K.", notes: "Proposal sent." },
      { step: "Approved", completedAt: "Nov 20, 2024", completedBy: "Sarah K.", notes: "Contract signed." },
      { step: "Handoff", completedAt: "Dec 1, 2024", completedBy: "Sarah K.", notes: "Handoff done." },
      { step: "Billing", completedAt: "Dec 5, 2024", completedBy: "Sarah K.", notes: "Invoice paid." },
    ],
    ghl: mkGhl("ghl-opp-029", "ghl-con-029", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-007", "Won", "ghl-user-sarah", "Sarah K.", "won", 6000, "Affiliate", "2024-10-01T08:00:00Z", "2024-12-20T16:00:00Z", "2024-12-20T16:00:00Z", "Synced"),
  },
  {
    id: "O030", clientName: "Chloe Martin", businessName: "Coastal Wellness Spa",
    industry: "Wellness", website: "coastalwellnessspa.com", primaryContact: "Chloe Martin",
    email: "chloe@coastalwellnessspa.com", phone: "(555) 430-5400",
    assignedRep: "Jordan M.", leadSource: "Affiliate", affiliateSource: "Lisa Park",
    estimatedValue: 3800, monthlyValue: 3800, contractLength: "12 months",
    probability: 100, stage: "Closed Won", daysInStage: 0, nextAction: "Onboarding complete", priority: "Low",
    closingMonth: "Dec 2024", expectedCloseDate: "Dec 15, 2024",
    opportunityScore: 100, forecastMonth: "December 2024", forecastQuarter: "Q4 2024",
    recentActivities: [
      { date: "Sep 15, 2024", type: "Lead Created", user: "Jordan M.", notes: "Lisa Park affiliate referral." },
      { date: "Dec 15, 2024", type: "Stage Changed", user: "Jordan M.", notes: "Closed Won." },
    ],
    notes: [{ date: "Dec 15, 2024", author: "Jordan M.", note: "Onboarding completed. Client is live.", category: "General" }],
    nextSteps: [],
    audit: mkAudit("Reviewed", "Chris A.", "Oct 5, 2024", "Wellness spa SEO + GBP audit done."),
    proposal: mkProposal("Approved", 3800, "Nov 1, 2024", "Nov 2, 2024", "Signed"),
    handoff: mkHandoff("Activated", "Approved", "Paid", "Live"),
    affiliate: mkAffiliate("Lisa Park", "Affiliate Network", "LP-2024-09", "Percentage", 380, 3800),
    followUps: [], tasks: [],
    notifications: [{ id: "N-030-1", type: "Proposal Approved", message: "Coastal Wellness Spa is live.", date: "Dec 15, 2024", read: true }],
    workflowEvents: [
      { step: "Lead", completedAt: "Sep 15, 2024", completedBy: "Jordan M.", notes: "Affiliate referral." },
      { step: "Approved", completedAt: "Nov 10, 2024", completedBy: "Jordan M.", notes: "Contract signed." },
      { step: "Billing", completedAt: "Nov 20, 2024", completedBy: "Jordan M.", notes: "Invoice paid." },
    ],
    ghl: mkGhl("ghl-opp-030", "ghl-con-030", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-007", "Won", "ghl-user-jordan", "Jordan M.", "won", 3800, "Affiliate", "2024-09-15T08:00:00Z", "2024-12-15T14:00:00Z", "2024-12-15T14:00:00Z", "Synced"),
  },
  {
    id: "O031", clientName: "Hugo Vance", businessName: "Vance Remodeling Group",
    industry: "Home Improvement", website: "vanceremodeling.com", primaryContact: "Hugo Vance",
    email: "hugo@vanceremodeling.com", phone: "(555) 531-6511",
    assignedRep: "Alex R.", leadSource: "Google Ads", affiliateSource: "—",
    estimatedValue: 2900, monthlyValue: 2900, contractLength: "12 months",
    probability: 100, stage: "Closed Won", daysInStage: 0, nextAction: "Live — reporting active", priority: "Low",
    closingMonth: "Dec 2024", expectedCloseDate: "Dec 10, 2024",
    opportunityScore: 100, forecastMonth: "December 2024", forecastQuarter: "Q4 2024",
    recentActivities: [
      { date: "Sep 1, 2024", type: "Lead Created", user: "Alex R.", notes: "Google Ads inbound." },
      { date: "Dec 10, 2024", type: "Stage Changed", user: "Alex R.", notes: "Closed Won." },
    ],
    notes: [{ date: "Dec 10, 2024", author: "Alex R.", note: "Client live. Reporting active.", category: "General" }],
    nextSteps: [],
    audit: mkAudit("Reviewed", "Dana L.", "Sep 20, 2024", "Remodeling SEO audit. Strong local presence."),
    proposal: mkProposal("Approved", 2900, "Oct 15, 2024", "Oct 16, 2024", "Signed"),
    handoff: mkHandoff("Activated", "Approved", "Paid", "Live"),
    affiliate: NAff, followUps: [], tasks: [],
    notifications: [{ id: "N-031-1", type: "Proposal Approved", message: "Vance Remodeling live and reporting.", date: "Dec 10, 2024", read: true }],
    workflowEvents: [
      { step: "Lead", completedAt: "Sep 1, 2024", completedBy: "Alex R.", notes: "Google Ads inbound." },
      { step: "Approved", completedAt: "Oct 20, 2024", completedBy: "Alex R.", notes: "Contract signed." },
      { step: "Billing", completedAt: "Nov 1, 2024", completedBy: "Alex R.", notes: "Invoice paid." },
    ],
    ghl: mkGhl("ghl-opp-031", "ghl-con-031", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-007", "Won", "ghl-user-alex", "Alex R.", "won", 2900, "Google Ads", "2024-09-01T08:00:00Z", "2024-12-10T14:00:00Z", "2024-12-10T14:00:00Z", "Synced"),
  },

  // ── Closed Lost ───────────────────────────────────────────────────────────
  {
    id: "O032", clientName: "Patricia Quinn", businessName: "Quinn Tax Advisors",
    industry: "Accounting", website: "quinntax.com", primaryContact: "Patricia Quinn",
    email: "patricia@quinntax.com", phone: "(555) 632-7622",
    assignedRep: "Mike T.", leadSource: "Direct", affiliateSource: "—",
    estimatedValue: 1500, monthlyValue: 1500, contractLength: "12 months",
    probability: 0, stage: "Closed Lost", daysInStage: 0, nextAction: "Log loss reason + re-engage Q2", priority: "Low",
    closingMonth: "Dec 2024", expectedCloseDate: "Dec 5, 2024",
    opportunityScore: 0, forecastMonth: "December 2024", forecastQuarter: "Q4 2024",
    recentActivities: [
      { date: "Nov 1, 2024", type: "Lead Created", user: "Mike T.", notes: "Direct inbound." },
      { date: "Dec 5, 2024", type: "Stage Changed", user: "Mike T.", notes: "Closed Lost — went with competitor." },
    ],
    notes: [{ date: "Dec 5, 2024", author: "Mike T.", note: "Lost to cheaper competitor. Consider re-engage Q2.", category: "General" }],
    nextSteps: [{ action: "Re-engage outreach in Q2 2025", owner: "Mike T.", dueDate: "Apr 1, 2025", priority: "Low" }],
    audit: mkAudit("Completed", "Chris A.", "Nov 15, 2024", "Tax advisor SEO audit done."),
    proposal: mkProposal("Rejected", 1500, "Nov 20, 2024", "Nov 21, 2024", "Rejected"),
    handoff: NH, affiliate: NAff,
    followUps: [{ id: "FU-032-1", subject: "Q2 Re-engage", dueDate: "Apr 1, 2025", status: "Upcoming", owner: "Mike T." }],
    tasks: [{ id: "T-032-1", title: "Discovery Call", status: "Completed", owner: "Mike T.", dueDate: "Nov 10, 2024" }],
    notifications: [{ id: "N-032-1", type: "Opportunity Stalled", message: "Quinn Tax Advisors lost to competitor.", date: "Dec 5, 2024", read: true }],
    workflowEvents: [
      { step: "Lead", completedAt: "Nov 1, 2024", completedBy: "Mike T.", notes: "Direct inbound." },
      { step: "Audit", completedAt: "Nov 15, 2024", completedBy: "Chris A.", notes: "Audit done." },
      { step: "Proposal", completedAt: "Nov 20, 2024", completedBy: "Mike T.", notes: "Proposal rejected." },
    ],
    ghl: mkGhl("ghl-opp-032", "ghl-con-032", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-008", "Lost", "ghl-user-mike", "Mike T.", "lost", 1500, "Direct", "2024-11-01T08:00:00Z", "2024-12-05T15:00:00Z", "2024-12-05T15:00:00Z", "Synced"),
  },
  {
    id: "O033", clientName: "Kevin Strand", businessName: "Strand Painting Co.",
    industry: "Painting", website: "strandpainting.com", primaryContact: "Kevin Strand",
    email: "kevin@strandpainting.com", phone: "(555) 733-8733",
    assignedRep: "Jordan M.", leadSource: "Meta Ads", affiliateSource: "—",
    estimatedValue: 1200, monthlyValue: 1200, contractLength: "6 months",
    probability: 0, stage: "Closed Lost", daysInStage: 0, nextAction: "Follow up in 90 days", priority: "Low",
    closingMonth: "Nov 2024", expectedCloseDate: "Nov 20, 2024",
    opportunityScore: 0, forecastMonth: "November 2024", forecastQuarter: "Q4 2024",
    recentActivities: [
      { date: "Oct 15, 2024", type: "Lead Created", user: "Jordan M.", notes: "Meta Ads lead." },
      { date: "Nov 20, 2024", type: "Stage Changed", user: "Jordan M.", notes: "Closed Lost — not ready to invest." },
    ],
    notes: [{ date: "Nov 20, 2024", author: "Jordan M.", note: "Not ready. Budget concerns. Follow up in 90 days.", category: "General" }],
    nextSteps: [{ action: "90-day re-engage outreach", owner: "Jordan M.", dueDate: "Feb 18, 2025", priority: "Low" }],
    audit: mkAudit("Completed", "Dana L.", "Oct 28, 2024", "Painting SEO audit done. Low domain authority."),
    proposal: mkProposal("Rejected", 1200, "Nov 5, 2024", "Nov 6, 2024", "Rejected"),
    handoff: NH, affiliate: NAff,
    followUps: [{ id: "FU-033-1", subject: "90-Day Re-engage", dueDate: "Feb 18, 2025", status: "Upcoming", owner: "Jordan M." }],
    tasks: [{ id: "T-033-1", title: "Discovery Call", status: "Completed", owner: "Jordan M.", dueDate: "Oct 22, 2024" }],
    notifications: [{ id: "N-033-1", type: "Opportunity Stalled", message: "Strand Painting lost. Not ready to invest.", date: "Nov 20, 2024", read: true }],
    workflowEvents: [
      { step: "Lead", completedAt: "Oct 15, 2024", completedBy: "Jordan M.", notes: "Meta Ads lead." },
      { step: "Audit", completedAt: "Oct 28, 2024", completedBy: "Dana L.", notes: "Audit done." },
      { step: "Proposal", completedAt: "Nov 5, 2024", completedBy: "Jordan M.", notes: "Proposal rejected." },
    ],
    ghl: mkGhl("ghl-opp-033", "ghl-con-033", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-008", "Lost", "ghl-user-jordan", "Jordan M.", "lost", 1200, "Meta Ads", "2024-10-15T08:00:00Z", "2024-11-20T15:00:00Z", "2024-11-20T15:00:00Z", "Synced"),
  },

  // ── Additional GHL Opportunities (34–45) ──────────────────────────────────
  {
    id: "O034", clientName: "Brenda Calloway", businessName: "Calloway Med Spa",
    industry: "Med Spa", website: "callowaymmedspa.com", primaryContact: "Brenda Calloway",
    email: "brenda@callowaymmedspa.com", phone: "(555) 834-9900",
    assignedRep: "Sarah K.", leadSource: "Google Ads", affiliateSource: "—",
    estimatedValue: 3600, monthlyValue: 3600, contractLength: "12 months",
    probability: 25, stage: "Lead", daysInStage: 2, nextAction: "Send intro email", priority: "Medium",
    closingMonth: "Mar 2025", expectedCloseDate: "Mar 10, 2025",
    opportunityScore: 32, forecastMonth: "March 2025", forecastQuarter: "Q1 2025",
    recentActivities: [{ date: "Jan 9, 2025", type: "Lead Created", user: "Sarah K.", notes: "Google Ads inbound." }],
    notes: [], nextSteps: [{ action: "Send intro email", owner: "Sarah K.", dueDate: "Jan 11, 2025", priority: "Medium" }],
    audit: NA, proposal: NP, handoff: NH, affiliate: NAff,
    followUps: [], tasks: [{ id: "T-034-1", title: "Intro Email", status: "Open", owner: "Sarah K.", dueDate: "Jan 11, 2025" }],
    notifications: [], workflowEvents: [{ step: "Lead", completedAt: "Jan 9, 2025", completedBy: "Sarah K.", notes: "Google Ads inbound." }],
    ghl: mkGhl("ghl-opp-034", "ghl-con-034", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-001", "New Lead", "ghl-user-sarah", "Sarah K.", "open", 3600, "Google Ads", "2025-01-09T10:00:00Z", "2025-01-09T10:30:00Z", "2025-01-09T10:30:00Z", "Pending Sync"),
  },
  {
    id: "O035", clientName: "Marcus DeLeon", businessName: "DeLeon Roofing & Gutters",
    industry: "Roofing", website: "deleonroofing.com", primaryContact: "Marcus DeLeon",
    email: "marcus@deleonroofing.com", phone: "(555) 935-0011",
    assignedRep: "Alex R.", leadSource: "LSA", affiliateSource: "—",
    estimatedValue: 2200, monthlyValue: 2200, contractLength: "12 months",
    probability: 20, stage: "Lead", daysInStage: 1, nextAction: "Qualify via phone", priority: "Medium",
    closingMonth: "Mar 2025", expectedCloseDate: "Mar 14, 2025",
    opportunityScore: 26, forecastMonth: "March 2025", forecastQuarter: "Q1 2025",
    recentActivities: [{ date: "Jan 10, 2025", type: "Lead Created", user: "Alex R.", notes: "LSA inbound." }],
    notes: [], nextSteps: [{ action: "Qualify via phone", owner: "Alex R.", dueDate: "Jan 13, 2025", priority: "Medium" }],
    audit: NA, proposal: NP, handoff: NH, affiliate: NAff,
    followUps: [], tasks: [{ id: "T-035-1", title: "Qualification Call", status: "Open", owner: "Alex R.", dueDate: "Jan 13, 2025" }],
    notifications: [], workflowEvents: [{ step: "Lead", completedAt: "Jan 10, 2025", completedBy: "Alex R.", notes: "LSA inbound." }],
    ghl: mkGhl("ghl-opp-035", "ghl-con-035", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-001", "New Lead", "ghl-user-alex", "Alex R.", "open", 2200, "LSA", "2025-01-10T09:00:00Z", "2025-01-10T09:30:00Z", "2025-01-10T09:30:00Z", "Synced"),
  },
  {
    id: "O036", clientName: "Isabelle Fontaine", businessName: "Lakeside Painting Studio",
    industry: "Painting", website: "lakesidepaintingstudio.com", primaryContact: "Isabelle Fontaine",
    email: "isabelle@lakesidepaintingstudio.com", phone: "(555) 136-1122",
    assignedRep: "Mike T.", leadSource: "Meta Ads", affiliateSource: "—",
    estimatedValue: 1500, monthlyValue: 1500, contractLength: "6 months",
    probability: 35, stage: "Discovery", daysInStage: 3, nextAction: "Discovery call Jan 14", priority: "Medium",
    closingMonth: "Feb 2025", expectedCloseDate: "Feb 18, 2025",
    opportunityScore: 48, forecastMonth: "February 2025", forecastQuarter: "Q1 2025",
    recentActivities: [{ date: "Jan 7, 2025", type: "Lead Created", user: "Mike T.", notes: "Meta Ads lead." }],
    notes: [], nextSteps: [{ action: "Discovery call Jan 14", owner: "Mike T.", dueDate: "Jan 14, 2025", priority: "Medium" }],
    audit: NA, proposal: NP, handoff: NH, affiliate: NAff,
    followUps: [{ id: "FU-036-1", subject: "Discovery Call", dueDate: "Jan 14, 2025", status: "Upcoming", owner: "Mike T." }],
    tasks: [{ id: "T-036-1", title: "Discovery Call", status: "Open", owner: "Mike T.", dueDate: "Jan 14, 2025" }],
    notifications: [], workflowEvents: [{ step: "Lead", completedAt: "Jan 7, 2025", completedBy: "Mike T.", notes: "Meta Ads lead." }],
    ghl: mkGhl("ghl-opp-036", "ghl-con-036", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-002", "Appointment Booked", "ghl-user-mike", "Mike T.", "open", 1500, "Meta Ads", "2025-01-07T10:00:00Z", "2025-01-07T14:00:00Z", "2025-01-07T14:00:00Z", "Sync Failed", "GHL API returned 422: missing contact_id"),
  },
  {
    id: "O037", clientName: "Wesley Grant", businessName: "Grant Financial Planning",
    industry: "Finance", website: "grantfinancial.com", primaryContact: "Wesley Grant",
    email: "wesley@grantfinancial.com", phone: "(555) 237-2233",
    assignedRep: "Jordan M.", leadSource: "Direct", affiliateSource: "—",
    estimatedValue: 4800, monthlyValue: 4800, contractLength: "24 months",
    probability: 45, stage: "Qualified", daysInStage: 4, nextAction: "Schedule audit walkthrough", priority: "High",
    closingMonth: "Feb 2025", expectedCloseDate: "Feb 5, 2025",
    opportunityScore: 66, forecastMonth: "February 2025", forecastQuarter: "Q1 2025",
    recentActivities: [
      { date: "Jan 3, 2025", type: "Lead Created", user: "Jordan M.", notes: "Direct inbound." },
      { date: "Jan 7, 2025", type: "Discovery Scheduled", user: "Jordan M.", notes: "Discovery complete." },
    ],
    notes: [{ date: "Jan 7, 2025", author: "Jordan M.", note: "Financial planning firm. 2 advisors. Competitive local market.", category: "Discovery" }],
    nextSteps: [{ action: "Schedule audit walkthrough", owner: "Jordan M.", dueDate: "Jan 14, 2025", priority: "High" }],
    audit: mkAudit("Requested", "—", "Jan 18, 2025", "Finance SEO scope requested."),
    proposal: NP, handoff: NH, affiliate: NAff,
    followUps: [{ id: "FU-037-1", subject: "Audit Walkthrough", dueDate: "Jan 14, 2025", status: "Upcoming", owner: "Jordan M." }],
    tasks: [{ id: "T-037-1", title: "Audit Review", status: "Open", owner: "Jordan M.", dueDate: "Jan 18, 2025" }],
    notifications: [], workflowEvents: [{ step: "Lead", completedAt: "Jan 3, 2025", completedBy: "Jordan M.", notes: "Direct inbound." }],
    ghl: mkGhl("ghl-opp-037", "ghl-con-037", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-003", "Qualified", "ghl-user-jordan", "Jordan M.", "open", 4800, "Direct", "2025-01-03T09:00:00Z", "2025-01-07T15:00:00Z", "2025-01-07T15:00:00Z", "Synced"),
  },
  {
    id: "O038", clientName: "Carla Whitfield", businessName: "Harbor Flooring Co.",
    industry: "Home Improvement", website: "harborflooring.com", primaryContact: "Carla Whitfield",
    email: "carla@harborflooring.com", phone: "(555) 338-3344",
    assignedRep: "Sarah K.", leadSource: "Website", affiliateSource: "—",
    estimatedValue: 1900, monthlyValue: 1900, contractLength: "12 months",
    probability: 40, stage: "Qualified", daysInStage: 5, nextAction: "Follow up on service package", priority: "Medium",
    closingMonth: "Feb 2025", expectedCloseDate: "Feb 12, 2025",
    opportunityScore: 60, forecastMonth: "February 2025", forecastQuarter: "Q1 2025",
    recentActivities: [{ date: "Jan 6, 2025", type: "Lead Created", user: "Sarah K.", notes: "Website inbound." }],
    notes: [],
    nextSteps: [{ action: "Follow up on service package", owner: "Sarah K.", dueDate: "Jan 14, 2025", priority: "Medium" }],
    audit: mkAudit("Requested", "—", "Jan 17, 2025", "Flooring SEO scope."),
    proposal: NP, handoff: NH, affiliate: NAff,
    followUps: [], tasks: [], notifications: [],
    workflowEvents: [{ step: "Lead", completedAt: "Jan 6, 2025", completedBy: "Sarah K.", notes: "Website inbound." }],
    ghl: mkGhl("ghl-opp-038", "", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-003", "Qualified", "ghl-user-sarah", "Sarah K.", "open", 1900, "Website", "2025-01-06T10:00:00Z", "2025-01-06T10:30:00Z", "2025-01-06T10:30:00Z", "Sync Failed", "Missing contact_id — cannot sync to GHL CRM record"),
  },
  {
    id: "O039", clientName: "Trevor Nguyen", businessName: "Sunrise Med Clinic",
    industry: "Healthcare", website: "sunrisemedclinic.com", primaryContact: "Trevor Nguyen",
    email: "trevor@sunrisemedclinic.com", phone: "(555) 439-4455",
    assignedRep: "Alex R.", leadSource: "Partner", affiliateSource: "MedRef Alliance",
    estimatedValue: 5200, monthlyValue: 5200, contractLength: "24 months",
    probability: 60, stage: "Audit In Progress", daysInStage: 4, nextAction: "Deliver audit findings", priority: "High",
    closingMonth: "Feb 2025", expectedCloseDate: "Feb 7, 2025",
    opportunityScore: 77, forecastMonth: "February 2025", forecastQuarter: "Q1 2025",
    recentActivities: [
      { date: "Jan 2, 2025", type: "Lead Created", user: "Alex R.", notes: "MedRef Alliance referral." },
      { date: "Jan 7, 2025", type: "Audit Requested", user: "Alex R.", notes: "Audit started." },
    ],
    notes: [{ date: "Jan 7, 2025", author: "Alex R.", note: "Healthcare clinic. Multi-specialty. High-value SEO opportunity.", category: "Audit" }],
    nextSteps: [{ action: "Deliver audit findings", owner: "Alex R.", dueDate: "Jan 15, 2025", priority: "High" }],
    audit: mkAudit("In Progress", "Dana L.", "Jan 15, 2025", "Healthcare multi-specialty SEO audit."),
    proposal: NP, handoff: NH,
    affiliate: mkAffiliate("MedRef Alliance", "Partner Network", "MRA-2025-01", "Tiered", 520, 5200),
    followUps: [{ id: "FU-039-1", subject: "Audit Delivery", dueDate: "Jan 15, 2025", status: "Upcoming", owner: "Alex R." }],
    tasks: [{ id: "T-039-1", title: "Audit Review", status: "In Progress", owner: "Dana L.", dueDate: "Jan 15, 2025" }],
    notifications: [],
    workflowEvents: [
      { step: "Lead", completedAt: "Jan 2, 2025", completedBy: "Alex R.", notes: "Partner referral." },
      { step: "Audit", completedAt: "Jan 7, 2025", completedBy: "Alex R.", notes: "Audit initiated." },
    ],
    ghl: mkGhl("ghl-opp-039", "ghl-con-039", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-004", "Audit Requested", "ghl-user-alex", "Alex R.", "open", 5200, "Partner", "2025-01-02T08:00:00Z", "2025-01-07T12:00:00Z", "2025-01-07T12:00:00Z", "Not Connected"),
  },
  {
    id: "O040", clientName: "Janet Holloway", businessName: "Green Valley HVAC",
    industry: "HVAC", website: "greenvalleyhvac.com", primaryContact: "Janet Holloway",
    email: "janet@greenvalleyhvac.com", phone: "(555) 540-5566",
    assignedRep: "Mike T.", leadSource: "Google Ads", affiliateSource: "—",
    estimatedValue: 2800, monthlyValue: 2800, contractLength: "12 months",
    probability: 55, stage: "Proposal Sent", daysInStage: 3, nextAction: "Follow up call Jan 14", priority: "High",
    closingMonth: "Jan 2025", expectedCloseDate: "Jan 24, 2025",
    opportunityScore: 74, forecastMonth: "January 2025", forecastQuarter: "Q1 2025",
    recentActivities: [
      { date: "Dec 24, 2024", type: "Lead Created", user: "Mike T.", notes: "Google Ads inbound." },
      { date: "Jan 8, 2025", type: "Proposal Sent", user: "Mike T.", notes: "Proposal emailed." },
    ],
    notes: [{ date: "Jan 8, 2025", author: "Mike T.", note: "HVAC company expanding to commercial. Proposal sent.", category: "Proposal" }],
    nextSteps: [{ action: "Follow up call Jan 14", owner: "Mike T.", dueDate: "Jan 14, 2025", priority: "High" }],
    audit: mkAudit("Completed", "Chris A.", "Jan 4, 2025", "HVAC SEO competitive audit complete."),
    proposal: mkProposal("Sent", 2800, "Jan 8, 2025", "—", "Pending"),
    handoff: NH, affiliate: NAff,
    followUps: [{ id: "FU-040-1", subject: "Proposal Follow Up Call", dueDate: "Jan 14, 2025", status: "Upcoming", owner: "Mike T." }],
    tasks: [{ id: "T-040-1", title: "Proposal Follow Up", status: "Open", owner: "Mike T.", dueDate: "Jan 14, 2025" }],
    notifications: [],
    workflowEvents: [
      { step: "Lead", completedAt: "Dec 24, 2024", completedBy: "Mike T.", notes: "Google Ads inbound." },
      { step: "Audit", completedAt: "Jan 4, 2025", completedBy: "Chris A.", notes: "Audit done." },
      { step: "Proposal", completedAt: "Jan 8, 2025", completedBy: "Mike T.", notes: "Proposal sent." },
    ],
    ghl: mkGhl("ghl-opp-040", "ghl-con-040", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-005", "Proposal Sent", "ghl-user-mike", "Mike T.", "open", 2800, "Google Ads", "2024-12-24T08:00:00Z", "2025-01-08T14:00:00Z", "2025-01-08T14:00:00Z", "Pending Sync"),
  },
  {
    id: "O041", clientName: "Damon Parks", businessName: "Parks Electrical Services",
    industry: "Electrical", website: "parkselectrical.com", primaryContact: "Damon Parks",
    email: "damon@parkselectrical.com", phone: "(555) 641-6677",
    assignedRep: "Jordan M.", leadSource: "Affiliate", affiliateSource: "Carlos Reyes",
    estimatedValue: 2500, monthlyValue: 2500, contractLength: "12 months",
    probability: 70, stage: "Negotiation", daysInStage: 3, nextAction: "Counter on monthly rate", priority: "High",
    closingMonth: "Jan 2025", expectedCloseDate: "Jan 17, 2025",
    opportunityScore: 84, forecastMonth: "January 2025", forecastQuarter: "Q1 2025",
    recentActivities: [
      { date: "Dec 14, 2024", type: "Lead Created", user: "Jordan M.", notes: "Carlos Reyes affiliate referral." },
      { date: "Jan 8, 2025", type: "Negotiation Updated", user: "Jordan M.", notes: "Counter on monthly rate." },
    ],
    notes: [{ date: "Jan 8, 2025", author: "Jordan M.", note: "Client wants $2200/mo. We proposed $2500. Negotiating.", category: "Negotiation" }],
    nextSteps: [{ action: "Counter on monthly rate", owner: "Jordan M.", dueDate: "Jan 13, 2025", priority: "High" }],
    audit: mkAudit("Completed", "Dana L.", "Dec 28, 2024", "Electrical SEO audit done."),
    proposal: mkProposal("Viewed", 2500, "Jan 3, 2025", "Jan 4, 2025", "Pending"),
    handoff: NH,
    affiliate: mkAffiliate("Carlos Reyes", "Family Referral", "CR-2024-12", "Flat Fee", 250, 2500),
    followUps: [{ id: "FU-041-1", subject: "Rate Negotiation", dueDate: "Jan 13, 2025", status: "Upcoming", owner: "Jordan M." }],
    tasks: [{ id: "T-041-1", title: "Negotiation Meeting", status: "In Progress", owner: "Jordan M.", dueDate: "Jan 13, 2025" }],
    notifications: [],
    workflowEvents: [
      { step: "Lead", completedAt: "Dec 14, 2024", completedBy: "Jordan M.", notes: "Affiliate referral." },
      { step: "Audit", completedAt: "Dec 28, 2024", completedBy: "Dana L.", notes: "Audit done." },
      { step: "Proposal", completedAt: "Jan 3, 2025", completedBy: "Jordan M.", notes: "Proposal sent." },
      { step: "Negotiation", completedAt: "Jan 8, 2025", completedBy: "Jordan M.", notes: "Negotiation started." },
    ],
    ghl: mkGhl("ghl-opp-041", "ghl-con-041", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-006", "Negotiation", "ghl-user-jordan", "Jordan M.", "open", 2500, "Affiliate", "2024-12-14T08:00:00Z", "2025-01-08T15:00:00Z", "2025-01-08T15:00:00Z", "Synced"),
  },
  {
    id: "O042", clientName: "Holly Marsh", businessName: "Marsh Veterinary Services",
    industry: "Veterinary", website: "marshvet.com", primaryContact: "Holly Marsh",
    email: "holly@marshvet.com", phone: "(555) 742-7788",
    assignedRep: "Sarah K.", leadSource: "Website", affiliateSource: "—",
    estimatedValue: 3100, monthlyValue: 3100, contractLength: "12 months",
    probability: 85, stage: "Verbal Approval", daysInStage: 1, nextAction: "Send final contract", priority: "Urgent",
    closingMonth: "Jan 2025", expectedCloseDate: "Jan 13, 2025",
    opportunityScore: 91, forecastMonth: "January 2025", forecastQuarter: "Q1 2025",
    recentActivities: [
      { date: "Dec 6, 2024", type: "Lead Created", user: "Sarah K.", notes: "Website inbound." },
      { date: "Jan 10, 2025", type: "Follow Up Completed", user: "Sarah K.", notes: "Verbal yes." },
    ],
    notes: [{ date: "Jan 10, 2025", author: "Sarah K.", note: "Verbal approval received. Contract being sent today.", category: "Negotiation" }],
    nextSteps: [{ action: "Send final contract", owner: "Sarah K.", dueDate: "Jan 11, 2025", priority: "Urgent" }],
    audit: mkAudit("Completed", "Dana L.", "Dec 22, 2024", "Vet clinic SEO audit complete."),
    proposal: mkProposal("Viewed", 3100, "Dec 30, 2024", "Dec 31, 2024", "Verbal Approved"),
    handoff: NH, affiliate: NAff,
    followUps: [{ id: "FU-042-1", subject: "Final Contract", dueDate: "Jan 11, 2025", status: "Upcoming", owner: "Sarah K." }],
    tasks: [{ id: "T-042-1", title: "Handoff Preparation", status: "Open", owner: "Sarah K.", dueDate: "Jan 13, 2025" }],
    notifications: [],
    workflowEvents: [
      { step: "Lead", completedAt: "Dec 6, 2024", completedBy: "Sarah K.", notes: "Website inbound." },
      { step: "Audit", completedAt: "Dec 22, 2024", completedBy: "Dana L.", notes: "Audit done." },
      { step: "Proposal", completedAt: "Dec 30, 2024", completedBy: "Sarah K.", notes: "Proposal sent." },
      { step: "Negotiation", completedAt: "Jan 7, 2025", completedBy: "Sarah K.", notes: "Terms agreed." },
      { step: "Approved", completedAt: "Jan 10, 2025", completedBy: "Sarah K.", notes: "Verbal yes." },
    ],
    ghl: mkGhl("ghl-opp-042", "ghl-con-042", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-007", "Won", "ghl-user-sarah", "Sarah K.", "open", 3100, "Website", "2024-12-06T08:00:00Z", "2025-01-10T10:00:00Z", "2025-01-10T10:00:00Z", "Manual Override"),
  },
  {
    id: "O043", clientName: "Randall Kim", businessName: "Kim Dental Associates",
    industry: "Dental", website: "kimdental.com", primaryContact: "Randall Kim",
    email: "randall@kimdental.com", phone: "(555) 843-8899",
    assignedRep: "Alex R.", leadSource: "LSA", affiliateSource: "—",
    estimatedValue: 4200, monthlyValue: 4200, contractLength: "12 months",
    probability: 100, stage: "Closed Won", daysInStage: 0, nextAction: "Onboarding active", priority: "Low",
    closingMonth: "Nov 2024", expectedCloseDate: "Nov 30, 2024",
    opportunityScore: 100, forecastMonth: "November 2024", forecastQuarter: "Q4 2024",
    recentActivities: [
      { date: "Sep 20, 2024", type: "Lead Created", user: "Alex R.", notes: "LSA dental inbound." },
      { date: "Nov 30, 2024", type: "Stage Changed", user: "Alex R.", notes: "Closed Won." },
    ],
    notes: [{ date: "Nov 30, 2024", author: "Alex R.", note: "Client live. Monthly reporting active.", category: "General" }],
    nextSteps: [],
    audit: mkAudit("Reviewed", "Dana L.", "Oct 10, 2024", "Dental SEO full audit done."),
    proposal: mkProposal("Approved", 4200, "Nov 5, 2024", "Nov 6, 2024", "Signed"),
    handoff: mkHandoff("Activated", "Approved", "Paid", "Live"),
    affiliate: NAff, followUps: [], tasks: [],
    notifications: [],
    workflowEvents: [
      { step: "Lead", completedAt: "Sep 20, 2024", completedBy: "Alex R.", notes: "LSA inbound." },
      { step: "Approved", completedAt: "Nov 15, 2024", completedBy: "Alex R.", notes: "Contract signed." },
      { step: "Billing", completedAt: "Nov 20, 2024", completedBy: "Alex R.", notes: "Invoice paid." },
    ],
    ghl: mkGhl("ghl-opp-043", "ghl-con-043", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-007", "Won", "ghl-user-alex", "Alex R.", "won", 4200, "LSA", "2024-09-20T08:00:00Z", "2024-11-30T14:00:00Z", "2024-11-30T14:00:00Z", "Synced"),
  },
  {
    id: "O044", clientName: "Patricia Diaz", businessName: "Diaz Law Firm",
    industry: "Legal", website: "diazlawfirm.com", primaryContact: "Patricia Diaz",
    email: "patricia@diazlawfirm.com", phone: "(555) 944-9900",
    assignedRep: "Mike T.", leadSource: "Direct", affiliateSource: "—",
    estimatedValue: 1800, monthlyValue: 1800, contractLength: "12 months",
    probability: 0, stage: "Closed Lost", daysInStage: 0, nextAction: "Re-engage in Q3 2025", priority: "Low",
    closingMonth: "Oct 2024", expectedCloseDate: "Oct 25, 2024",
    opportunityScore: 0, forecastMonth: "October 2024", forecastQuarter: "Q4 2024",
    recentActivities: [
      { date: "Sep 5, 2024", type: "Lead Created", user: "Mike T.", notes: "Direct inbound." },
      { date: "Oct 25, 2024", type: "Stage Changed", user: "Mike T.", notes: "Closed Lost — budget freeze." },
    ],
    notes: [{ date: "Oct 25, 2024", author: "Mike T.", note: "Budget freeze until Q3 2025. Re-engage then.", category: "General" }],
    nextSteps: [{ action: "Re-engage Q3 2025", owner: "Mike T.", dueDate: "Jul 1, 2025", priority: "Low" }],
    audit: mkAudit("Completed", "Chris A.", "Sep 20, 2024", "Legal SEO audit done."),
    proposal: mkProposal("Rejected", 1800, "Oct 5, 2024", "Oct 6, 2024", "Rejected"),
    handoff: NH, affiliate: NAff, followUps: [], tasks: [], notifications: [],
    workflowEvents: [
      { step: "Lead", completedAt: "Sep 5, 2024", completedBy: "Mike T.", notes: "Direct inbound." },
      { step: "Proposal", completedAt: "Oct 5, 2024", completedBy: "Mike T.", notes: "Proposal rejected." },
    ],
    ghl: mkGhl("ghl-opp-044", "ghl-con-044", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-008", "Lost", "ghl-user-mike", "Mike T.", "lost", 1800, "Direct", "2024-09-05T08:00:00Z", "2024-10-25T15:00:00Z", "2024-10-25T15:00:00Z", "Synced"),
  },
  {
    id: "O045", clientName: "Vincent Nguyen", businessName: "Nguyen Auto Detailing",
    industry: "Automotive", website: "nguyenautodetailing.com", primaryContact: "Vincent Nguyen",
    email: "vincent@nguyenautodetailing.com", phone: "(555) 145-0011",
    assignedRep: "Jordan M.", leadSource: "Meta Ads", affiliateSource: "—",
    estimatedValue: 1400, monthlyValue: 1400, contractLength: "6 months",
    probability: 30, stage: "Lead", daysInStage: 0, nextAction: "Send intro email", priority: "Low",
    closingMonth: "Mar 2025", expectedCloseDate: "Mar 21, 2025",
    opportunityScore: 22, forecastMonth: "March 2025", forecastQuarter: "Q1 2025",
    recentActivities: [{ date: "Jan 11, 2025", type: "Lead Created", user: "Jordan M.", notes: "Meta Ads inbound." }],
    notes: [], nextSteps: [{ action: "Send intro email", owner: "Jordan M.", dueDate: "Jan 13, 2025", priority: "Low" }],
    audit: NA, proposal: NP, handoff: NH, affiliate: NAff,
    followUps: [], tasks: [{ id: "T-045-1", title: "Intro Email", status: "Open", owner: "Jordan M.", dueDate: "Jan 13, 2025" }],
    notifications: [], workflowEvents: [{ step: "Lead", completedAt: "Jan 11, 2025", completedBy: "Jordan M.", notes: "Meta Ads inbound." }],
    ghl: mkGhl("ghl-opp-045", "ghl-con-045", GHL_PIPELINE_ID, GHL_PIPELINE_NAME, "ghl-stage-001", "New Lead", "ghl-user-jordan", "Jordan M.", "open", 1400, "Meta Ads", "2025-01-11T11:00:00Z", "2025-01-11T11:30:00Z", "2025-01-11T11:30:00Z", "Not Connected"),
  },
];

// ─── Stage Config ─────────────────────────────────────────────────────────────

interface StageConfig {
  label: PipelineStage;
  color: string;
  bg: string;
  border: string;
}

const STAGE_CONFIG: StageConfig[] = [
  { label: "Lead",              color: "#64748B", bg: "#F8FAFC", border: "#E2E8F0" },
  { label: "Discovery",         color: "#3B82F6", bg: "#EFF6FF", border: "#BFDBFE" },
  { label: "Qualified",         color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
  { label: "Audit Requested",   color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  { label: "Audit In Progress", color: "#6D28D9", bg: "#EDE9FE", border: "#C4B5FD" },
  { label: "Proposal Draft",    color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  { label: "Proposal Sent",     color: "#B45309", bg: "#FEF3C7", border: "#FCD34D" },
  { label: "Negotiation",       color: "#EA580C", bg: "#FFF7ED", border: "#FED7AA" },
  { label: "Verbal Approval",   color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
  { label: "Proposal Approved", color: "#15803D", bg: "#DCFCE7", border: "#86EFAC" },
  { label: "Sales Handoff",     color: "#0F766E", bg: "#F0FDFA", border: "#99F6E4" },
  { label: "Closed Won",        color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
  { label: "Closed Lost",       color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
];

// ─── GHL Sync Status Config ───────────────────────────────────────────────────

const GHL_SYNC_STATUS_CONFIG: Record<GhlSyncStatus, { color: string; bg: string; border: string }> = {
  "Synced":          { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
  "Pending Sync":    { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  "Sync Failed":     { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
  "Manual Override": { color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  "Not Connected":   { color: "#64748B", bg: "#F8FAFC", border: "#E2E8F0" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LEAD_SOURCE_COLORS: Record<LeadSource, { color: string; bg: string; border: string }> = {
  "Direct":     { color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  "Affiliate":  { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
  "Partner":    { color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  "Website":    { color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
  "Google Ads": { color: "#EA580C", bg: "#FFF7ED", border: "#FED7AA" },
  "Meta Ads":   { color: "#9333EA", bg: "#FAF5FF", border: "#E9D5FF" },
  "LSA":        { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
};

const PRIORITY_CONFIG: Record<Priority, { color: string; bg: string; border: string }> = {
  "Low":    { color: "#64748B", bg: "#F8FAFC", border: "#E2E8F0" },
  "Medium": { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  "High":   { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
  "Urgent": { color: "#BE185D", bg: "#FDF2F8", border: "#F9A8D4" },
};

const NOTE_CATEGORY_CONFIG: Record<NoteCategory, { color: string; bg: string; border: string }> = {
  "Discovery":   { color: "#3B82F6", bg: "#EFF6FF", border: "#BFDBFE" },
  "Audit":       { color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  "Proposal":    { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  "Negotiation": { color: "#EA580C", bg: "#FFF7ED", border: "#FED7AA" },
  "Follow-Up":   { color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
  "General":     { color: "#64748B", bg: "#F8FAFC", border: "#E2E8F0" },
};

const AUDIT_STATUS_CONFIG: Record<AuditStatus, { color: string; bg: string; border: string }> = {
  "Not Started": { color: "#64748B", bg: "#F8FAFC", border: "#E2E8F0" },
  "Requested":   { color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  "In Progress": { color: "#6D28D9", bg: "#EDE9FE", border: "#C4B5FD" },
  "Completed":   { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
  "Reviewed":    { color: "#15803D", bg: "#DCFCE7", border: "#86EFAC" },
};

const PROPOSAL_STATUS_CONFIG: Record<ProposalStatus, { color: string; bg: string; border: string }> = {
  "Not Started": { color: "#64748B", bg: "#F8FAFC", border: "#E2E8F0" },
  "Drafting":    { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  "Sent":        { color: "#B45309", bg: "#FEF3C7", border: "#FCD34D" },
  "Viewed":      { color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
  "Approved":    { color: "#15803D", bg: "#DCFCE7", border: "#86EFAC" },
  "Rejected":    { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
};

const FOLLOW_UP_STATUS_CONFIG: Record<FollowUpStatus, { color: string; bg: string; border: string }> = {
  "Upcoming":  { color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  "Overdue":   { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
  "Completed": { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
};

const HANDOFF_STATUS_CONFIG: Record<HandoffStatus, { color: string; bg: string; border: string }> = {
  "Not Started":     { color: "#64748B", bg: "#F8FAFC", border: "#E2E8F0" },
  "Initiated":       { color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
  "Billing Sent":    { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  "Invoice Created": { color: "#B45309", bg: "#FEF3C7", border: "#FCD34D" },
  "Activated":       { color: "#15803D", bg: "#DCFCE7", border: "#86EFAC" },
};

const TASK_STATUS_CONFIG: Record<TaskStatus, { color: string; bg: string; border: string }> = {
  "Open":        { color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  "In Progress": { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  "Completed":   { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
  "Overdue":     { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
};

const WORKFLOW_STEP_ICONS: Record<WorkflowStep, string> = {
  "Lead":        "🟢",
  "Audit":       "🔍",
  "Proposal":    "📝",
  "Negotiation": "🤝",
  "Approved":    "✅",
  "Handoff":     "📦",
  "Billing":     "💳",
};

const ACTIVITY_ICON: Record<ActivityType, string> = {
  "Lead Created":          "🟢",
  "Discovery Scheduled":   "📅",
  "Audit Requested":       "🔍",
  "Audit Completed":       "✅",
  "Proposal Drafted":      "📝",
  "Proposal Sent":         "📤",
  "Follow Up Completed":   "📞",
  "Negotiation Updated":   "🤝",
  "Note Added":            "💬",
  "Stage Changed":         "➡️",
};

const GHL_SYNC_ISSUE_TYPE_CONFIG: Record<GhlSyncIssueType, { color: string; bg: string; border: string }> = {
  "Missing Contact ID":        { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
  "Stage Mapping Missing":     { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  "Assigned User Not Matched": { color: "#EA580C", bg: "#FFF7ED", border: "#FED7AA" },
  "Duplicate Opportunity":     { color: "#9333EA", bg: "#FAF5FF", border: "#E9D5FF" },
  "Sync Failed":               { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
};

function fmtCurrency(n: number): string {
  return "$" + n.toLocaleString();
}

function getStageCfg(stage: PipelineStage): StageConfig {
  return STAGE_CONFIG.find((s) => s.label === stage) ?? STAGE_CONFIG[0];
}

// ─── KPI Calculations ─────────────────────────────────────────────────────────

function calcKPIs(ops: Opportunity[]) {
  const won = ops.filter((o) => o.stage === "Closed Won");
  const lost = ops.filter((o) => o.stage === "Closed Lost");
  const open = ops.filter((o) => o.stage !== "Closed Won" && o.stage !== "Closed Lost");
  const active = ops.filter((o) => o.stage !== "Closed Lost");
  const pipelineValue = open.reduce((s, o) => s + o.estimatedValue, 0);
  const weightedRevenue = active.reduce((s, o) => s + (o.estimatedValue * o.probability) / 100, 0);
  const avgDealSize = open.length ? Math.round(pipelineValue / open.length) : 0;
  const totalClosed = won.length + lost.length;
  const winRate = totalClosed ? Math.round((won.length / totalClosed) * 100) : 0;
  const closingThisMonth = open.filter((o) => o.closingMonth === "Jan 2025").length;
  const affiliateRev = won.filter((o) => o.leadSource === "Affiliate").reduce((s, o) => s + o.estimatedValue, 0);
  // GHL sync KPIs
  const allOps = ops;
  const ghlSynced = allOps.filter((o) => o.ghl.ghlSyncStatus === "Synced").length;
  const ghlPending = allOps.filter((o) => o.ghl.ghlSyncStatus === "Pending Sync").length;
  const ghlFailed = allOps.filter((o) => o.ghl.ghlSyncStatus === "Sync Failed").length;
  const ghlManual = allOps.filter((o) => o.ghl.ghlSyncStatus === "Manual Override").length;
  return {
    openCount: open.length, pipelineValue,
    weightedRevenue: Math.round(weightedRevenue),
    avgDealSize, winRate, closingThisMonth, affiliateRev,
    wonCount: won.length, lostCount: lost.length,
    ghlSynced, ghlPending, ghlFailed, ghlManual,
  };
}

// ─── Badges ───────────────────────────────────────────────────────────────────

function StatusBadge({ label, cfg }: { label: string; cfg: { color: string; bg: string; border: string } }) {
  return (
    <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
      {label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  return <StatusBadge label={priority} cfg={PRIORITY_CONFIG[priority]} />;
}

function LeadSourceBadge({ source }: { source: LeadSource }) {
  const c = LEAD_SOURCE_COLORS[source];
  return (
    <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded-full border"
      style={{ background: c.bg, color: c.color, borderColor: c.border }}>
      {source}
    </span>
  );
}

function StageBadge({ stage }: { stage: PipelineStage }) {
  const c = getStageCfg(stage);
  return (
    <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap"
      style={{ background: c.bg, color: c.color, borderColor: c.border }}>
      {stage}
    </span>
  );
}

function GhlSyncBadge({ status }: { status: GhlSyncStatus }) {
  const c = GHL_SYNC_STATUS_CONFIG[status];
  const icon = status === "Synced" ? "✓" : status === "Pending Sync" ? "⏳" : status === "Sync Failed" ? "✗" : status === "Manual Override" ? "⚙" : "○";
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap"
      style={{ background: c.bg, color: c.color, borderColor: c.border }}>
      <span>{icon}</span> {status}
    </span>
  );
}

// ─── Row Actions Dropdown ─────────────────────────────────────────────────────

const ROW_ACTIONS = [
  "View Opportunity", "Edit Opportunity", "Move Stage", "Schedule Discovery",
  "Create Audit", "Create Proposal", "Create Follow Up", "Mark Won", "Mark Lost", "Add Note",
  "Open in GHL", "Resync Opportunity", "Manual Override",
] as const;

function RowActionsMenu({ opp, onView }: { opp: Opportunity; onView: (opp: Opportunity) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)}
        className="text-[11px] font-semibold px-2 py-1 rounded-lg border transition-colors"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}
      >
        ···
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 rounded-xl border shadow-lg py-1 min-w-[200px]"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
          {ROW_ACTIONS.map((action) => {
            const isDestructive = action === "Mark Lost";
            const isPositive = action === "Mark Won";
            const isPrimary = action === "View Opportunity";
            const isGhl = action === "Open in GHL" || action === "Resync Opportunity" || action === "Manual Override";
            return (
              <button key={action}
                onClick={() => { if (action === "View Opportunity") onView(opp); setOpen(false); }}
                className="w-full text-left text-xs px-4 py-2 hover:opacity-80 transition-opacity"
                style={{
                  color: isDestructive ? "#DC2626" : isPositive ? "#059669" : isPrimary ? workspace.accentColor : isGhl ? "#0891B2" : "var(--rtm-text-primary)",
                  fontWeight: isPrimary ? 600 : 400,
                }}>
                {isGhl && <span className="mr-1">🔗</span>}{action}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── GHL Pipeline Mapping Section ────────────────────────────────────────────

function GhlPipelineMapping() {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#A5F3FC" }}>
      <div className="px-5 py-3 border-b flex items-center justify-between"
        style={{ background: "#ECFEFF", borderColor: "#A5F3FC" }}>
        <div className="flex items-center gap-2">
          <span className="text-base">🔗</span>
          <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: "#0891B2" }}>GHL Pipeline Mapping</h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border" style={{ background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" }}>Connected</span>
        </div>
        <div className="flex gap-2">
          <button className="text-[10px] font-semibold px-3 py-1.5 rounded-lg border"
            style={{ background: "var(--rtm-bg)", color: "#0891B2", borderColor: "#A5F3FC" }}>Edit Mapping</button>
          <button className="text-[10px] font-semibold px-3 py-1.5 rounded-lg border"
            style={{ background: "#0891B2", color: "#fff", borderColor: "#0891B2" }}>Sync Now</button>
        </div>
      </div>
      <div className="p-3 text-[10px] font-semibold" style={{ background: "#F0FDFA", color: "#0F766E", borderBottom: "1px solid #A5F3FC" }}>
        Pipeline: <strong>{GHL_PIPELINE_NAME}</strong> &nbsp;·&nbsp; ID: <code>{GHL_PIPELINE_ID}</code>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse" style={{ minWidth: 700 }}>
          <thead>
            <tr style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
              {["GHL Stage", "RTM OS Stage", "Status", "Last Synced"].map((col) => (
                <th key={col} className="text-left text-[10px] font-bold uppercase tracking-wide px-4 py-2.5 whitespace-nowrap"
                  style={{ color: "var(--rtm-text-muted)" }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GHL_STAGE_MAPPINGS.map((m, i) => (
              <tr key={m.ghlStageId} style={{ background: i % 2 === 0 ? "var(--rtm-bg)" : "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
                <td className="px-4 py-2.5">
                  <span className="font-semibold text-[11px] px-2 py-0.5 rounded-full border"
                    style={{ background: "#ECFEFF", color: "#0891B2", borderColor: "#A5F3FC" }}>{m.ghlStageName}</span>
                </td>
                <td className="px-4 py-2.5"><StageBadge stage={m.rtmStageName} /></td>
                <td className="px-4 py-2.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                    style={{
                      background: m.status === "Active" ? "#ECFDF5" : "#FEF2F2",
                      color: m.status === "Active" ? "#059669" : "#DC2626",
                      borderColor: m.status === "Active" ? "#A7F3D0" : "#FECACA",
                    }}>{m.status}</span>
                </td>
                <td className="px-4 py-2.5 text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{m.lastSynced}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── GHL Sync Issues Panel ────────────────────────────────────────────────────

function GhlSyncIssuesPanel() {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const visible = GHL_SYNC_ISSUES.filter((i) => !dismissed.includes(i.id));

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#FECACA" }}>
      <div className="px-5 py-3 border-b flex items-center justify-between"
        style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
        <div className="flex items-center gap-2">
          <span className="text-base">⚠️</span>
          <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: "#DC2626" }}>GHL Sync Issues</h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border" style={{ background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" }}>{visible.length} Issues</span>
        </div>
        <button className="text-[10px] font-semibold px-3 py-1.5 rounded-lg border"
          style={{ background: "var(--rtm-bg)", color: "#DC2626", borderColor: "#FECACA" }}>View All Issues</button>
      </div>
      {visible.length === 0 ? (
        <div className="p-6 text-center" style={{ background: "var(--rtm-bg)" }}>
          <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>No active sync issues. All clear.</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y" style={{ divideColor: "var(--rtm-border)" } as React.CSSProperties}>
          {visible.map((issue) => {
            const cfg = GHL_SYNC_ISSUE_TYPE_CONFIG[issue.issueType];
            return (
              <div key={issue.id} className="flex items-start gap-3 p-4" style={{ background: "var(--rtm-surface)" }}>
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: cfg.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                      style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>{issue.issueType}</span>
                    <span className="text-[10px] font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{issue.businessName}</span>
                    <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{issue.opportunityId}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: "var(--rtm-text-secondary)" }}>{issue.description}</p>
                  <p className="text-[10px] mt-1" style={{ color: "var(--rtm-text-muted)" }}>Detected: {issue.detectedAt}</p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  {(["Resolve", "Ignore", "Manual Override"] as GhlSyncIssueAction[]).map((action) => (
                    <button key={action}
                      onClick={() => { if (action === "Ignore") setDismissed((d) => [...d, issue.id]); }}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-opacity hover:opacity-80"
                      style={{
                        background: action === "Resolve" ? "#ECFDF5" : action === "Manual Override" ? "#EDE9FE" : "var(--rtm-bg)",
                        color: action === "Resolve" ? "#059669" : action === "Manual Override" ? "#7C3AED" : "var(--rtm-text-secondary)",
                        borderColor: action === "Resolve" ? "#A7F3D0" : action === "Manual Override" ? "#DDD6FE" : "var(--rtm-border)",
                      }}>
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

type DrawerTab =
  | "Client Overview"
  | "Opportunity Overview"
  | "Revenue Forecast"
  | "Sales Activity"
  | "Next Steps"
  | "Notes"
  | "Audit"
  | "Proposal"
  | "Follow Ups"
  | "Handoff"
  | "Affiliate"
  | "Tasks"
  | "Notifications"
  | "Workflow"
  | "GHL Sync";

const DRAWER_TABS: DrawerTab[] = [
  "Client Overview", "Opportunity Overview", "Revenue Forecast",
  "Sales Activity", "Next Steps", "Notes",
  "Audit", "Proposal", "Follow Ups", "Handoff", "Affiliate", "Tasks", "Notifications", "Workflow",
  "GHL Sync",
];

function DrawerField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>
        {label}
      </p>
      <p className="text-xs font-medium" style={{ color: "var(--rtm-text-primary)" }}>
        {value || <span style={{ color: "var(--rtm-text-muted)" }}>—</span>}
      </p>
    </div>
  );
}

function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-4" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
      <h4 className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: "var(--rtm-text-muted)" }}>
        {title}
      </h4>
      {children}
    </div>
  );
}

function IntegrationCard({
  title, href, hrefLabel, status, statusCfg, actions, children,
}: {
  title: string;
  href: string;
  hrefLabel: string;
  status: string;
  statusCfg: { color: string; bg: string; border: string };
  actions?: { label: string; href: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border p-4" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{title}</h4>
          <StatusBadge label={status} cfg={statusCfg} />
        </div>
        <a href={href}
          className="text-[10px] font-semibold px-2 py-1 rounded-lg border"
          style={{ background: "var(--rtm-bg)", color: workspace.accentColor, borderColor: "var(--rtm-border)" }}>
          {hrefLabel}
        </a>
      </div>
      {children}
      {actions && actions.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {actions.map((a) => (
            <a key={a.label} href={a.href}
              className="text-[10px] font-semibold px-3 py-1.5 rounded-lg border"
              style={{ background: "var(--rtm-bg)", color: workspace.accentColor, borderColor: "var(--rtm-border)" }}>
              {a.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function OpportunityDrawer({ opp, onClose }: { opp: Opportunity; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<DrawerTab>("Client Overview");
  const stageCfg = getStageCfg(opp.stage);
  const weightedRevenue = Math.round((opp.estimatedValue * opp.probability) / 100);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full z-50 flex flex-col shadow-2xl"
        style={{ width: "min(620px, 95vw)", background: "var(--rtm-bg)", borderLeft: "1px solid var(--rtm-border)" }}>

        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-surface)" }}>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: workspace.accentColor }}>{opp.id}</p>
            <h2 className="text-base font-bold leading-tight truncate" style={{ color: "var(--rtm-text-primary)" }}>{opp.businessName}</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-secondary)" }}>{opp.clientName} · {opp.industry}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              <StageBadge stage={opp.stage} />
              <PriorityBadge priority={opp.priority} />
              <LeadSourceBadge source={opp.leadSource} />
              <GhlSyncBadge status={opp.ghl.ghlSyncStatus} />
            </div>
          </div>
          <button onClick={onClose}
            className="ml-3 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-opacity hover:opacity-70"
            style={{ background: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>✕</button>
        </div>

        {/* Tab bar */}
        <div className="flex overflow-x-auto border-b flex-shrink-0"
          style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-surface)" }}>
          {DRAWER_TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="whitespace-nowrap text-[11px] font-semibold px-4 py-2.5 border-b-2 transition-colors"
              style={{
                borderBottomColor: activeTab === tab ? (tab === "GHL Sync" ? "#0891B2" : workspace.accentColor) : "transparent",
                color: activeTab === tab ? (tab === "GHL Sync" ? "#0891B2" : workspace.accentColor) : "var(--rtm-text-muted)",
                background: tab === "GHL Sync" ? (activeTab === tab ? "#ECFEFF" : undefined) : undefined,
              }}>
              {tab === "GHL Sync" ? "🔗 GHL Sync" : tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* CLIENT OVERVIEW */}
          {activeTab === "Client Overview" && (
            <>
              <DrawerSection title="Client Information">
                <div className="grid grid-cols-2 gap-3">
                  <DrawerField label="Client Name" value={opp.clientName} />
                  <DrawerField label="Business Name" value={opp.businessName} />
                  <DrawerField label="Industry" value={opp.industry} />
                  <DrawerField label="Website" value={
                    <a href={`https://${opp.website}`} target="_blank" rel="noopener noreferrer"
                      className="underline" style={{ color: workspace.accentColor }}>{opp.website}</a>
                  } />
                  <DrawerField label="Primary Contact" value={opp.primaryContact} />
                  <DrawerField label="Email" value={opp.email} />
                  <DrawerField label="Phone" value={opp.phone} />
                </div>
              </DrawerSection>
              <DrawerSection title="Lead Information">
                <div className="grid grid-cols-2 gap-3">
                  <DrawerField label="Lead Source" value={<LeadSourceBadge source={opp.leadSource} />} />
                  <DrawerField label="Affiliate Source" value={opp.affiliateSource !== "—" ? (
                    <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full border"
                      style={{ background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" }}>{opp.affiliateSource}</span>
                  ) : "—"} />
                  <DrawerField label="Assigned Sales Rep" value={opp.assignedRep} />
                  <DrawerField label="GHL Source" value={opp.ghl.ghlSource || "—"} />
                </div>
              </DrawerSection>
            </>
          )}

          {/* OPPORTUNITY OVERVIEW */}
          {activeTab === "Opportunity Overview" && (
            <DrawerSection title="Opportunity Details">
              <div className="grid grid-cols-2 gap-3">
                <DrawerField label="Opportunity Name" value={`${opp.businessName} — ${opp.stage}`} />
                <DrawerField label="Current Stage" value={<StageBadge stage={opp.stage} />} />
                <DrawerField label="GHL Stage" value={
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border"
                    style={{ background: "#ECFEFF", color: "#0891B2", borderColor: "#A5F3FC" }}>{opp.ghl.ghlStageName}</span>
                } />
                <DrawerField label="GHL Sync" value={<GhlSyncBadge status={opp.ghl.ghlSyncStatus} />} />
                <DrawerField label="Opportunity Score" value={
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--rtm-border)" }}>
                      <div className="h-full rounded-full" style={{ width: `${opp.opportunityScore}%`, background: opp.opportunityScore >= 80 ? "#059669" : opp.opportunityScore >= 50 ? "#D97706" : "#DC2626" }} />
                    </div>
                    <span className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>{opp.opportunityScore}</span>
                  </div>
                } />
                <DrawerField label="Probability To Close" value={
                  <span className="text-sm font-bold" style={{ color: stageCfg.color }}>{opp.probability}%</span>
                } />
                <DrawerField label="Estimated Revenue" value={
                  <span className="font-bold" style={{ color: stageCfg.color }}>{fmtCurrency(opp.estimatedValue)}/mo</span>
                } />
                <DrawerField label="Contract Length" value={opp.contractLength} />
                <DrawerField label="Expected Close Date" value={opp.expectedCloseDate} />
                <DrawerField label="Priority" value={<PriorityBadge priority={opp.priority} />} />
                <DrawerField label="Days In Stage" value={
                  <span style={{ color: opp.daysInStage > 7 ? "#DC2626" : "var(--rtm-text-primary)" }}>
                    {opp.daysInStage} {opp.daysInStage === 1 ? "day" : "days"}
                  </span>
                } />
              </div>
            </DrawerSection>
          )}

          {/* REVENUE FORECAST */}
          {activeTab === "Revenue Forecast" && (
            <>
              <DrawerSection title="Forecast Details">
                <div className="grid grid-cols-2 gap-3">
                  <DrawerField label="Estimated Revenue" value={
                    <span className="font-bold" style={{ color: stageCfg.color }}>{fmtCurrency(opp.estimatedValue)}/mo</span>
                  } />
                  <DrawerField label="Close Probability" value={
                    <span className="font-bold" style={{ color: stageCfg.color }}>{opp.probability}%</span>
                  } />
                  <DrawerField label="Weighted Revenue" value={
                    <div>
                      <span className="font-bold" style={{ color: "#059669" }}>{fmtCurrency(weightedRevenue)}/mo</span>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                        {fmtCurrency(opp.estimatedValue)} × {opp.probability}%
                      </p>
                    </div>
                  } />
                  <DrawerField label="Forecast Month" value={opp.forecastMonth} />
                  <DrawerField label="Forecast Quarter" value={opp.forecastQuarter} />
                  <DrawerField label="Expected Close Date" value={opp.expectedCloseDate} />
                  <DrawerField label="GHL Monetary Value" value={
                    <span className="font-bold" style={{ color: "#0891B2" }}>{fmtCurrency(opp.ghl.ghlMonetaryValue)}/mo</span>
                  } />
                </div>
              </DrawerSection>
              <DrawerSection title="Contract Value">
                <div className="grid grid-cols-2 gap-3">
                  <DrawerField label="Monthly Value" value={fmtCurrency(opp.monthlyValue) + "/mo"} />
                  <DrawerField label="Contract Length" value={opp.contractLength} />
                  <DrawerField label="Total Contract Value" value={(() => {
                    const months = opp.contractLength.startsWith("24") ? 24 : opp.contractLength.startsWith("12") ? 12 : 6;
                    return <span className="font-bold">{fmtCurrency(opp.monthlyValue * months)}</span>;
                  })()} />
                </div>
              </DrawerSection>
            </>
          )}

          {/* SALES ACTIVITY */}
          {activeTab === "Sales Activity" && (
            <DrawerSection title="Activity Timeline">
              {opp.recentActivities.length === 0 ? (
                <p className="text-xs text-center py-4" style={{ color: "var(--rtm-text-muted)" }}>No activity recorded.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {[...opp.recentActivities].reverse().map((activity, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className="text-base leading-none">{ACTIVITY_ICON[activity.type]}</span>
                        {idx < opp.recentActivities.length - 1 && (
                          <div className="w-px flex-1 mt-1" style={{ background: "var(--rtm-border)" }} />
                        )}
                      </div>
                      <div className="flex-1 pb-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <p className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>{activity.type}</p>
                          <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{activity.date}</span>
                        </div>
                        <p className="text-[11px] mt-0.5" style={{ color: "var(--rtm-text-secondary)" }}>{activity.user}</p>
                        {activity.notes && (
                          <p className="text-[11px] mt-1 leading-relaxed" style={{ color: "var(--rtm-text-secondary)" }}>{activity.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DrawerSection>
          )}

          {/* NEXT STEPS */}
          {activeTab === "Next Steps" && (
            <DrawerSection title="Required Actions">
              {opp.nextSteps.length === 0 ? (
                <p className="text-xs text-center py-4" style={{ color: "var(--rtm-text-muted)" }}>No next steps defined.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {opp.nextSteps.map((step, idx) => {
                    const pc = PRIORITY_CONFIG[step.priority];
                    return (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border"
                        style={{ background: pc.bg, borderColor: pc.border }}>
                        <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: pc.color }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>{step.action}</p>
                          <div className="flex flex-wrap gap-3 mt-1">
                            <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>Owner: <strong>{step.owner}</strong></span>
                            <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>Due: <strong>{step.dueDate}</strong></span>
                          </div>
                        </div>
                        <PriorityBadge priority={step.priority} />
                      </div>
                    );
                  })}
                </div>
              )}
            </DrawerSection>
          )}

          {/* NOTES */}
          {activeTab === "Notes" && (
            <DrawerSection title="Notes">
              {opp.notes.length === 0 ? (
                <p className="text-xs text-center py-4" style={{ color: "var(--rtm-text-muted)" }}>No notes recorded.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {[...opp.notes].reverse().map((note, idx) => {
                    const nc = NOTE_CATEGORY_CONFIG[note.category];
                    return (
                      <div key={idx} className="p-3 rounded-lg border"
                        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                              style={{ background: nc.bg, color: nc.color, borderColor: nc.border }}>{note.category}</span>
                            <span className="text-[10px] font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>{note.author}</span>
                          </div>
                          <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{note.date}</span>
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: "var(--rtm-text-primary)" }}>{note.note}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </DrawerSection>
          )}

          {/* AUDIT INTEGRATION */}
          {activeTab === "Audit" && (
            <IntegrationCard
              title="Audit Integration"
              href="/sales/audits"
              hrefLabel="Open Audits"
              status={opp.audit.status}
              statusCfg={AUDIT_STATUS_CONFIG[opp.audit.status]}
              actions={[
                { label: "Open Audit", href: "/sales/audits" },
                { label: "Create Audit", href: "/sales/audits" },
              ]}
            >
              <div className="grid grid-cols-2 gap-3">
                <DrawerField label="Audit Status" value={<StatusBadge label={opp.audit.status} cfg={AUDIT_STATUS_CONFIG[opp.audit.status]} />} />
                <DrawerField label="Assigned Auditor" value={opp.audit.assignedAuditor} />
                <DrawerField label="Audit Due Date" value={opp.audit.dueDate} />
                <DrawerField label="Findings Summary" value={opp.audit.findingsSummary} />
              </div>
            </IntegrationCard>
          )}

          {/* PROPOSAL INTEGRATION */}
          {activeTab === "Proposal" && (
            <IntegrationCard
              title="Proposal Integration"
              href="/sales/proposals"
              hrefLabel="Open Proposals"
              status={opp.proposal.status}
              statusCfg={PROPOSAL_STATUS_CONFIG[opp.proposal.status]}
              actions={[
                { label: "Open Proposal", href: "/sales/proposals" },
                { label: "Generate Proposal", href: "/sales/proposals" },
              ]}
            >
              <div className="grid grid-cols-2 gap-3">
                <DrawerField label="Proposal Status" value={<StatusBadge label={opp.proposal.status} cfg={PROPOSAL_STATUS_CONFIG[opp.proposal.status]} />} />
                <DrawerField label="Proposal Value" value={opp.proposal.proposalValue > 0 ? fmtCurrency(opp.proposal.proposalValue) + "/mo" : "—"} />
                <DrawerField label="Sent Date" value={opp.proposal.sentDate} />
                <DrawerField label="Viewed Date" value={opp.proposal.viewedDate} />
                <DrawerField label="Approval Status" value={opp.proposal.approvalStatus} />
              </div>
            </IntegrationCard>
          )}

          {/* FOLLOW UPS */}
          {activeTab === "Follow Ups" && (
            <IntegrationCard
              title="Follow Up Integration"
              href="/sales/followups"
              hrefLabel="Open Follow Ups"
              status={opp.followUps.some((f) => f.status === "Overdue") ? "Overdue" : opp.followUps.some((f) => f.status === "Upcoming") ? "Upcoming" : "Completed"}
              statusCfg={opp.followUps.some((f) => f.status === "Overdue") ? FOLLOW_UP_STATUS_CONFIG["Overdue"] : FOLLOW_UP_STATUS_CONFIG["Upcoming"]}
              actions={[
                { label: "Open Follow Ups", href: "/sales/followups" },
                { label: "Create Follow Up", href: "/sales/followups" },
              ]}
            >
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="p-2 rounded-lg border text-center" style={{ background: "#EFF6FF", borderColor: "#BFDBFE" }}>
                  <p className="text-lg font-bold" style={{ color: "#2563EB" }}>{opp.followUps.filter((f) => f.status === "Upcoming").length}</p>
                  <p className="text-[10px] font-semibold" style={{ color: "#2563EB" }}>Upcoming</p>
                </div>
                <div className="p-2 rounded-lg border text-center" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
                  <p className="text-lg font-bold" style={{ color: "#DC2626" }}>{opp.followUps.filter((f) => f.status === "Overdue").length}</p>
                  <p className="text-[10px] font-semibold" style={{ color: "#DC2626" }}>Overdue</p>
                </div>
                <div className="p-2 rounded-lg border text-center" style={{ background: "#ECFDF5", borderColor: "#A7F3D0" }}>
                  <p className="text-lg font-bold" style={{ color: "#059669" }}>{opp.followUps.filter((f) => f.status === "Completed").length}</p>
                  <p className="text-[10px] font-semibold" style={{ color: "#059669" }}>Completed</p>
                </div>
              </div>
              {opp.followUps.length === 0 ? (
                <p className="text-xs text-center py-2" style={{ color: "var(--rtm-text-muted)" }}>No follow-ups scheduled.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {opp.followUps.map((fu) => (
                    <div key={fu.id} className="flex items-center justify-between p-2 rounded-lg border"
                      style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}>
                      <div>
                        <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{fu.subject}</p>
                        <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>Due: {fu.dueDate} · {fu.owner}</p>
                      </div>
                      <StatusBadge label={fu.status} cfg={FOLLOW_UP_STATUS_CONFIG[fu.status]} />
                    </div>
                  ))}
                </div>
              )}
            </IntegrationCard>
          )}

          {/* HANDOFF */}
          {activeTab === "Handoff" && (
            <IntegrationCard
              title="Handoff Integration"
              href="/sales/handoffs"
              hrefLabel="Open Handoffs"
              status={opp.handoff.status}
              statusCfg={HANDOFF_STATUS_CONFIG[opp.handoff.status]}
              actions={[
                { label: "Push To Handoff", href: "/sales/handoffs" },
                { label: "Open Handoff", href: "/sales/handoffs" },
              ]}
            >
              <div className="grid grid-cols-2 gap-3">
                <DrawerField label="Handoff Status" value={<StatusBadge label={opp.handoff.status} cfg={HANDOFF_STATUS_CONFIG[opp.handoff.status]} />} />
                <DrawerField label="Billing Request" value={
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                    style={{
                      background: opp.handoff.billingRequestStatus === "Approved" ? "#DCFCE7" : opp.handoff.billingRequestStatus === "Submitted" ? "#FFFBEB" : "#F8FAFC",
                      color: opp.handoff.billingRequestStatus === "Approved" ? "#15803D" : opp.handoff.billingRequestStatus === "Submitted" ? "#D97706" : "#64748B",
                      borderColor: opp.handoff.billingRequestStatus === "Approved" ? "#86EFAC" : opp.handoff.billingRequestStatus === "Submitted" ? "#FDE68A" : "#E2E8F0",
                    }}>{opp.handoff.billingRequestStatus}</span>
                } />
                <DrawerField label="Invoice Status" value={
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                    style={{
                      background: opp.handoff.invoiceStatus === "Paid" ? "#DCFCE7" : opp.handoff.invoiceStatus === "Sent" ? "#FFFBEB" : "#F8FAFC",
                      color: opp.handoff.invoiceStatus === "Paid" ? "#15803D" : opp.handoff.invoiceStatus === "Sent" ? "#D97706" : "#64748B",
                      borderColor: opp.handoff.invoiceStatus === "Paid" ? "#86EFAC" : opp.handoff.invoiceStatus === "Sent" ? "#FDE68A" : "#E2E8F0",
                    }}>{opp.handoff.invoiceStatus}</span>
                } />
                <DrawerField label="Activation Status" value={
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                    style={{
                      background: opp.handoff.activationStatus === "Live" ? "#DCFCE7" : opp.handoff.activationStatus === "In Progress" ? "#FFFBEB" : "#F8FAFC",
                      color: opp.handoff.activationStatus === "Live" ? "#15803D" : opp.handoff.activationStatus === "In Progress" ? "#D97706" : "#64748B",
                      borderColor: opp.handoff.activationStatus === "Live" ? "#86EFAC" : opp.handoff.activationStatus === "In Progress" ? "#FDE68A" : "#E2E8F0",
                    }}>{opp.handoff.activationStatus}</span>
                } />
              </div>
            </IntegrationCard>
          )}

          {/* AFFILIATE */}
          {activeTab === "Affiliate" && (
            <IntegrationCard
              title="Affiliate Attribution"
              href="/sales/affiliates"
              hrefLabel="Open Affiliates"
              status={opp.affiliate.commissionModel !== "None" ? "Active" : "No Affiliate"}
              statusCfg={opp.affiliate.commissionModel !== "None" ? { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" } : { color: "#64748B", bg: "#F8FAFC", border: "#E2E8F0" }}
              actions={opp.affiliate.affiliateName !== "—" ? [{ label: "Open Affiliate", href: "/sales/affiliates" }] : []}
            >
              {opp.affiliate.affiliateName === "—" ? (
                <p className="text-xs text-center py-2" style={{ color: "var(--rtm-text-muted)" }}>No affiliate attribution for this opportunity.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <DrawerField label="Affiliate Name" value={opp.affiliate.affiliateName} />
                  <DrawerField label="Referral Source" value={opp.affiliate.referralSource} />
                  <DrawerField label="Referral Code" value={opp.affiliate.referralCode} />
                  <DrawerField label="Commission Model" value={opp.affiliate.commissionModel} />
                  <DrawerField label="Potential Commission" value={opp.affiliate.potentialCommission > 0 ? fmtCurrency(opp.affiliate.potentialCommission) : "—"} />
                  <DrawerField label="Revenue Attribution" value={opp.affiliate.revenueAttribution > 0 ? fmtCurrency(opp.affiliate.revenueAttribution) : "—"} />
                </div>
              )}
            </IntegrationCard>
          )}

          {/* TASKS */}
          {activeTab === "Tasks" && (
            <IntegrationCard
              title="Task Integration"
              href="/tasks"
              hrefLabel="Open Tasks"
              status={`${opp.tasks.filter((t) => t.status === "Open" || t.status === "In Progress").length} Open`}
              statusCfg={{ color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" }}
            >
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="p-2 rounded-lg border text-center" style={{ background: "#EFF6FF", borderColor: "#BFDBFE" }}>
                  <p className="text-lg font-bold" style={{ color: "#2563EB" }}>{opp.tasks.filter((t) => t.status === "Open" || t.status === "In Progress").length}</p>
                  <p className="text-[10px] font-semibold" style={{ color: "#2563EB" }}>Open</p>
                </div>
                <div className="p-2 rounded-lg border text-center" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
                  <p className="text-lg font-bold" style={{ color: "#DC2626" }}>{opp.tasks.filter((t) => t.status === "Overdue").length}</p>
                  <p className="text-[10px] font-semibold" style={{ color: "#DC2626" }}>Overdue</p>
                </div>
                <div className="p-2 rounded-lg border text-center" style={{ background: "#ECFDF5", borderColor: "#A7F3D0" }}>
                  <p className="text-lg font-bold" style={{ color: "#059669" }}>{opp.tasks.filter((t) => t.status === "Completed").length}</p>
                  <p className="text-[10px] font-semibold" style={{ color: "#059669" }}>Completed</p>
                </div>
              </div>
              {opp.tasks.length === 0 ? (
                <p className="text-xs text-center py-2" style={{ color: "var(--rtm-text-muted)" }}>No tasks for this opportunity.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {opp.tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-2 rounded-lg border"
                      style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}>
                      <div>
                        <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{task.title}</p>
                        <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>Due: {task.dueDate} · {task.owner}</p>
                      </div>
                      <StatusBadge label={task.status} cfg={TASK_STATUS_CONFIG[task.status]} />
                    </div>
                  ))}
                </div>
              )}
            </IntegrationCard>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === "Notifications" && (
            <IntegrationCard
              title="Notifications"
              href="/notifications"
              hrefLabel="Open Notifications"
              status={`${opp.notifications.filter((n) => !n.read).length} Unread`}
              statusCfg={{ color: opp.notifications.some((n) => !n.read) ? "#DC2626" : "#059669", bg: opp.notifications.some((n) => !n.read) ? "#FEF2F2" : "#ECFDF5", border: opp.notifications.some((n) => !n.read) ? "#FECACA" : "#A7F3D0" }}
            >
              {opp.notifications.length === 0 ? (
                <p className="text-xs text-center py-2" style={{ color: "var(--rtm-text-muted)" }}>No notifications for this opportunity.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {[...opp.notifications].reverse().map((notif) => (
                    <div key={notif.id} className="flex items-start gap-3 p-2 rounded-lg border"
                      style={{ background: notif.read ? "var(--rtm-bg)" : "#EFF6FF", borderColor: notif.read ? "var(--rtm-border)" : "#BFDBFE" }}>
                      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                        style={{ background: notif.read ? "#CBD5E1" : "#2563EB" }} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[10px] font-bold" style={{ color: workspace.accentColor }}>{notif.type}</p>
                          <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{notif.date}</span>
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-primary)" }}>{notif.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </IntegrationCard>
          )}

          {/* WORKFLOW */}
          {activeTab === "Workflow" && (
            <IntegrationCard
              title="Workflow Integration"
              href="/admin/workflows"
              hrefLabel="Open Workflows"
              status={opp.workflowEvents.length > 0 ? `${opp.workflowEvents.length} Steps` : "Not Started"}
              statusCfg={{ color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" }}
              actions={[{ label: "Open Workflow", href: "/admin/workflows" }]}
            >
              {/* Flow diagram */}
              <div className="flex flex-wrap gap-1 mb-4">
                {(["Lead", "Audit", "Proposal", "Negotiation", "Approved", "Handoff", "Billing"] as WorkflowStep[]).map((step, idx, arr) => {
                  const done = opp.workflowEvents.some((e) => e.step === step);
                  return (
                    <React.Fragment key={step}>
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{WORKFLOW_STEP_ICONS[step]}</span>
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full border"
                          style={{
                            background: done ? "#DCFCE7" : "#F8FAFC",
                            color: done ? "#15803D" : "#94A3B8",
                            borderColor: done ? "#86EFAC" : "#E2E8F0",
                          }}>{step}</span>
                      </div>
                      {idx < arr.length - 1 && (
                        <span className="text-[10px] self-center" style={{ color: "var(--rtm-text-muted)" }}>→</span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
              {opp.workflowEvents.length === 0 ? (
                <p className="text-xs text-center py-2" style={{ color: "var(--rtm-text-muted)" }}>No workflow events recorded.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {[...opp.workflowEvents].reverse().map((ev, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-2 rounded-lg border"
                      style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}>
                      <span className="text-base leading-none mt-0.5">{WORKFLOW_STEP_ICONS[ev.step]}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>{ev.step}</p>
                          <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{ev.completedAt}</span>
                        </div>
                        <p className="text-[10px] mt-0.5" style={{ color: "var(--rtm-text-secondary)" }}>{ev.completedBy} — {ev.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </IntegrationCard>
          )}

          {/* GHL SYNC TAB */}
          {activeTab === "GHL Sync" && (
            <div className="space-y-4">
              <div className="rounded-xl border p-4 flex items-center gap-3"
                style={{ background: "#ECFEFF", borderColor: "#A5F3FC" }}>
                <span className="text-2xl">🔗</span>
                <div>
                  <p className="text-xs font-bold" style={{ color: "#0891B2" }}>GHL Source of Truth</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "#0E7490" }}>This opportunity is sourced from GoHighLevel. All sync operations flow through the GHL API.</p>
                </div>
                <GhlSyncBadge status={opp.ghl.ghlSyncStatus} />
              </div>
              <DrawerSection title="GHL Identifiers">
                <div className="grid grid-cols-2 gap-3">
                  <DrawerField label="GHL Opportunity ID" value={<code className="text-[10px]">{opp.ghl.ghlOpportunityId}</code>} />
                  <DrawerField label="GHL Contact ID" value={opp.ghl.ghlContactId ? <code className="text-[10px]">{opp.ghl.ghlContactId}</code> : <span style={{ color: "#DC2626" }}>Missing</span>} />
                  <DrawerField label="GHL Pipeline" value={opp.ghl.ghlPipelineName} />
                  <DrawerField label="GHL Stage" value={
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border"
                      style={{ background: "#ECFEFF", color: "#0891B2", borderColor: "#A5F3FC" }}>{opp.ghl.ghlStageName}</span>
                  } />
                  <DrawerField label="GHL Assigned User" value={opp.ghl.ghlAssignedUserName} />
                  <DrawerField label="GHL Source" value={opp.ghl.ghlSource} />
                </div>
              </DrawerSection>
              <DrawerSection title="Stage Mapping">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg border" style={{ background: "#ECFEFF", borderColor: "#A5F3FC" }}>
                    <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "#0891B2" }}>GHL Stage</p>
                    <span className="text-[11px] font-semibold px-2 py-1 rounded-full border"
                      style={{ background: "#E0F2FE", color: "#0284C7", borderColor: "#BAE6FD" }}>{opp.ghl.ghlStageName}</span>
                  </div>
                  <div className="p-3 rounded-lg border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}>
                    <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>RTM OS Stage</p>
                    <StageBadge stage={opp.stage} />
                  </div>
                </div>
              </DrawerSection>
              <DrawerSection title="GHL Opportunity Details">
                <div className="grid grid-cols-2 gap-3">
                  <DrawerField label="GHL Opportunity Status" value={
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase"
                      style={{
                        background: opp.ghl.ghlOpportunityStatus === "won" ? "#ECFDF5" : opp.ghl.ghlOpportunityStatus === "lost" ? "#FEF2F2" : "#EFF6FF",
                        color: opp.ghl.ghlOpportunityStatus === "won" ? "#059669" : opp.ghl.ghlOpportunityStatus === "lost" ? "#DC2626" : "#2563EB",
                        borderColor: opp.ghl.ghlOpportunityStatus === "won" ? "#A7F3D0" : opp.ghl.ghlOpportunityStatus === "lost" ? "#FECACA" : "#BFDBFE",
                      }}>{opp.ghl.ghlOpportunityStatus}</span>
                  } />
                  <DrawerField label="GHL Monetary Value" value={
                    <span className="font-bold" style={{ color: "#0891B2" }}>{fmtCurrency(opp.ghl.ghlMonetaryValue)}/mo</span>
                  } />
                  <DrawerField label="GHL Created Date" value={opp.ghl.ghlCreatedAt} />
                  <DrawerField label="GHL Updated Date" value={opp.ghl.ghlUpdatedAt} />
                  <DrawerField label="GHL Last Activity" value={opp.ghl.ghlLastActivityAt} />
                  <DrawerField label="Sync Status" value={<GhlSyncBadge status={opp.ghl.ghlSyncStatus} />} />
                </div>
              </DrawerSection>
              {opp.ghl.ghlSyncError && (
                <div className="rounded-xl border p-4" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "#DC2626" }}>Sync Error</p>
                  <p className="text-xs" style={{ color: "#DC2626" }}>{opp.ghl.ghlSyncError}</p>
                </div>
              )}
              <div className="rounded-xl border p-4" style={{ background: "var(--rtm-surface)", borderColor: "#A5F3FC" }}>
                <h4 className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: "#0891B2" }}>GHL Actions</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "🔗 Open in GHL", col: "#0891B2", bg: "#0891B2", white: true },
                    { label: "🔄 Resync Opportunity", col: "#0891B2", bg: "var(--rtm-bg)", white: false },
                    { label: "⚙️ Manual Override", col: "#7C3AED", bg: "#EDE9FE", white: false },
                    { label: "⚠️ Resolve Sync Error", col: "#DC2626", bg: "#FEF2F2", white: false },
                  ].map(({ label, col, bg, white }) => (
                    <button key={label}
                      className="text-xs font-semibold px-4 py-2 rounded-lg border"
                      style={{ background: bg, color: white ? "#fff" : col, borderColor: white ? col : col }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-4 py-3 border-t flex-shrink-0"
          style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-surface)" }}>
          <button className="flex-1 text-xs font-semibold py-2 rounded-lg border"
            style={{ background: workspace.accentColor, color: "#fff", borderColor: workspace.accentColor }}>Edit Opportunity</button>
          <button className="text-xs font-semibold px-4 py-2 rounded-lg border"
            style={{ background: "#ECFEFF", color: "#0891B2", borderColor: "#A5F3FC" }}>🔗 Open in GHL</button>
          <button className="text-xs font-semibold px-4 py-2 rounded-lg border"
            style={{ background: "var(--rtm-bg)", color: "#059669", borderColor: "#A7F3D0" }}>Mark Won</button>
          <button className="text-xs font-semibold px-4 py-2 rounded-lg border"
            style={{ background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" }}>Mark Lost</button>
        </div>
      </div>
    </>
  );
}

// ─── Opportunity Card (Kanban) ────────────────────────────────────────────────────

function OpportunityCard({ opp, stageCfg, onView }: { opp: Opportunity; stageCfg: StageConfig; onView: (opp: Opportunity) => void }) {
  return (
    <div className="p-3 rounded-xl border flex flex-col gap-2 transition-shadow hover:shadow-md cursor-pointer group"
      style={{ background: "var(--rtm-surface)", borderColor: stageCfg.border, boxShadow: "0 1px 3px rgba(15,28,56,0.05)" }}
      onClick={() => onView(opp)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-bold leading-tight truncate" style={{ color: "var(--rtm-text-primary)" }}>{opp.businessName}</p>
          <p className="text-[11px] mt-0.5 truncate" style={{ color: "var(--rtm-text-muted)" }}>{opp.clientName}</p>
        </div>
        <PriorityBadge priority={opp.priority} />
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold" style={{ color: stageCfg.color }}>
          {fmtCurrency(opp.estimatedValue)}<span className="text-[10px] font-normal">/mo</span>
        </p>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
          style={{ background: stageCfg.bg, color: stageCfg.color }}>{opp.probability}%</span>
      </div>
      {/* GHL Sync Row */}
      <div className="flex items-center justify-between gap-1 flex-wrap">
        <GhlSyncBadge status={opp.ghl.ghlSyncStatus} />
        <span className="text-[10px] font-semibold" style={{ color: "#0891B2" }}>{opp.ghl.ghlStageName}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        <LeadSourceBadge source={opp.leadSource} />
        {(opp.leadSource === "Affiliate" || opp.leadSource === "Partner") && opp.affiliateSource !== "—" && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full border"
            style={{ background: opp.leadSource === "Affiliate" ? "#ECFDF5" : "#F5F3FF", color: opp.leadSource === "Affiliate" ? "#059669" : "#7C3AED", borderColor: opp.leadSource === "Affiliate" ? "#A7F3D0" : "#DDD6FE" }}>
            {opp.affiliateSource}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-1">
        <span className="text-[10px] font-semibold" style={{ color: "var(--rtm-text-muted)" }}>{opp.assignedRep}</span>
        <span className="text-[10px]" style={{ color: opp.daysInStage > 7 ? "#DC2626" : "var(--rtm-text-muted)" }}>
          {opp.daysInStage}d in stage
        </span>
      </div>
      <div className="text-[10px] rounded-lg px-2 py-1.5 leading-snug"
        style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)" }}>→ {opp.nextAction}</div>
      <button onClick={(e) => { e.stopPropagation(); onView(opp); }}
        className="w-full text-[10px] font-semibold py-1 rounded-lg border opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: "var(--rtm-bg)", borderColor: stageCfg.border, color: stageCfg.color }}>View Opportunity</button>
    </div>
  );
}

// ─── Pipeline Table View ─────────────────────────────────────────────────────────

function PipelineTable({ opportunities, onView }: { opportunities: Opportunity[]; onView: (opp: Opportunity) => void }) {
  return (
    <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--rtm-border)" }}>
      <table className="w-full text-xs border-collapse" style={{ minWidth: 2200 }}>
        <thead>
          <tr style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
            {[
              "Client", "Business Name", "Industry", "Sales Rep", "Lead Source", "Affiliate",
              "RTM Stage", "GHL Stage", "GHL Opp ID", "GHL Assigned User", "GHL Source",
              "GHL Sync", "Last Synced",
              "Est. Revenue", "Prob.", "Weighted", "Close Date", "Days", "Next Action", "Priority", "Actions"
            ].map((col) => (
              <th key={col} className="text-left text-[10px] font-bold uppercase tracking-wide px-3 py-2.5 whitespace-nowrap"
                style={{ color: "var(--rtm-text-muted)", borderRight: "1px solid var(--rtm-border)" }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {opportunities.map((opp, rowIdx) => {
            const sc = getStageCfg(opp.stage);
            const wr = Math.round((opp.estimatedValue * opp.probability) / 100);
            const la = opp.recentActivities[opp.recentActivities.length - 1];
            return (
              <tr key={opp.id} className="hover:opacity-90 transition-opacity cursor-pointer"
                style={{ background: rowIdx % 2 === 0 ? "var(--rtm-bg)" : "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}
                onClick={() => onView(opp)}>
                <td className="px-3 py-2.5 whitespace-nowrap" style={{ borderRight: "1px solid var(--rtm-border)" }}>
                  <p className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{opp.clientName}</p>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap font-semibold" style={{ color: "var(--rtm-text-primary)", borderRight: "1px solid var(--rtm-border)" }}>{opp.businessName}</td>
                <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)", borderRight: "1px solid var(--rtm-border)" }}>{opp.industry}</td>
                <td className="px-3 py-2.5 whitespace-nowrap font-semibold" style={{ color: "var(--rtm-text-primary)", borderRight: "1px solid var(--rtm-border)" }}>{opp.assignedRep}</td>
                <td className="px-3 py-2.5 whitespace-nowrap" style={{ borderRight: "1px solid var(--rtm-border)" }}><LeadSourceBadge source={opp.leadSource} /></td>
                <td className="px-3 py-2.5 whitespace-nowrap" style={{ borderRight: "1px solid var(--rtm-border)" }}>
                  {opp.affiliateSource !== "—" ? (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full border"
                      style={{ background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" }}>{opp.affiliateSource}</span>
                  ) : <span style={{ color: "var(--rtm-text-muted)" }}>—</span>}
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap" style={{ borderRight: "1px solid var(--rtm-border)" }}><StageBadge stage={opp.stage} /></td>
                <td className="px-3 py-2.5 whitespace-nowrap" style={{ borderRight: "1px solid var(--rtm-border)" }}>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                    style={{ background: "#ECFEFF", color: "#0891B2", borderColor: "#A5F3FC" }}>{opp.ghl.ghlStageName}</span>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap" style={{ borderRight: "1px solid var(--rtm-border)" }}>
                  <code className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{opp.ghl.ghlOpportunityId}</code>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)", borderRight: "1px solid var(--rtm-border)" }}>{opp.ghl.ghlAssignedUserName}</td>
                <td className="px-3 py-2.5 whitespace-nowrap" style={{ borderRight: "1px solid var(--rtm-border)" }}>
                  <span className="text-[10px]" style={{ color: "var(--rtm-text-secondary)" }}>{opp.ghl.ghlSource}</span>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap" style={{ borderRight: "1px solid var(--rtm-border)" }}><GhlSyncBadge status={opp.ghl.ghlSyncStatus} /></td>
                <td className="px-3 py-2.5 whitespace-nowrap text-[10px]" style={{ color: "var(--rtm-text-muted)", borderRight: "1px solid var(--rtm-border)" }}>{opp.ghl.ghlUpdatedAt.split("T")[0]}</td>
                <td className="px-3 py-2.5 whitespace-nowrap font-bold" style={{ color: sc.color, borderRight: "1px solid var(--rtm-border)" }}>{fmtCurrency(opp.estimatedValue)}</td>
                <td className="px-3 py-2.5 whitespace-nowrap" style={{ borderRight: "1px solid var(--rtm-border)" }}>
                  <span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{opp.probability}%</span>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap font-semibold" style={{ color: "#059669", borderRight: "1px solid var(--rtm-border)" }}>{fmtCurrency(wr)}</td>
                <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)", borderRight: "1px solid var(--rtm-border)" }}>{opp.expectedCloseDate}</td>
                <td className="px-3 py-2.5 whitespace-nowrap text-center" style={{ borderRight: "1px solid var(--rtm-border)" }}>
                  <span className="font-bold" style={{ color: opp.daysInStage > 7 ? "#DC2626" : "var(--rtm-text-primary)" }}>{opp.daysInStage}d</span>
                </td>
                <td className="px-3 py-2.5" style={{ borderRight: "1px solid var(--rtm-border)", minWidth: 140 }}>
                  <p className="text-[11px] leading-snug" style={{ color: "var(--rtm-text-secondary)" }}>{opp.nextAction}</p>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap" style={{ borderRight: "1px solid var(--rtm-border)" }}><PriorityBadge priority={opp.priority} /></td>
                <td className="px-3 py-2.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu opp={opp} onView={onView} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {opportunities.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>No opportunities match the current filters.</p>
        </div>
      )}
    </div>
  );
}

// ─── Analytics Section ────────────────────────────────────────────────────────────

function PipelineAnalytics({ opportunities }: { opportunities: Opportunity[] }) {
  const stages = STAGE_CONFIG.map((sc) => ({
    label: sc.label, color: sc.color, bg: sc.bg, border: sc.border,
    count: opportunities.filter((o) => o.stage === sc.label).length,
    revenue: opportunities.filter((o) => o.stage === sc.label).reduce((s, o) => s + o.estimatedValue, 0),
  }));

  const reps = Array.from(new Set(opportunities.map((o) => o.assignedRep)));
  const repPerf = reps.map((rep) => {
    const repOpps = opportunities.filter((o) => o.assignedRep === rep);
    const won = repOpps.filter((o) => o.stage === "Closed Won");
    const lost = repOpps.filter((o) => o.stage === "Closed Lost");
    const open = repOpps.filter((o) => o.stage !== "Closed Won" && o.stage !== "Closed Lost");
    const total = won.length + lost.length;
    return {
      rep, total: repOpps.length, open: open.length, won: won.length, lost: lost.length,
      winRate: total > 0 ? Math.round((won.length / total) * 100) : 0,
      pipeline: open.reduce((s, o) => s + o.estimatedValue, 0),
      wonRevenue: won.reduce((s, o) => s + o.estimatedValue, 0),
    };
  }).sort((a, b) => b.wonRevenue - a.wonRevenue);

  const sources = Array.from(new Set(opportunities.map((o) => o.leadSource)));
  const sourcePerf = sources.map((src) => {
    const srcOpps = opportunities.filter((o) => o.leadSource === src);
    const won = srcOpps.filter((o) => o.stage === "Closed Won");
    return { source: src, count: srcOpps.length, won: won.length, revenue: won.reduce((s, o) => s + o.estimatedValue, 0) };
  }).sort((a, b) => b.revenue - a.revenue);

  const affiliates = opportunities
    .filter((o) => o.affiliate.affiliateName !== "—")
    .reduce<Record<string, { name: string; count: number; commission: number; attribution: number }>>((acc, o) => {
      const n = o.affiliate.affiliateName;
      if (!acc[n]) acc[n] = { name: n, count: 0, commission: 0, attribution: 0 };
      acc[n].count++;
      acc[n].commission += o.affiliate.potentialCommission;
      acc[n].attribution += o.affiliate.revenueAttribution;
      return acc;
    }, {});
  const affiliateRows = Object.values(affiliates).sort((a, b) => b.attribution - a.attribution);

  const syncBreakdown: GhlSyncStatus[] = ["Synced", "Pending Sync", "Sync Failed", "Manual Override", "Not Connected"];
  const syncData = syncBreakdown.map((s) => ({
    status: s, count: opportunities.filter((o) => o.ghl.ghlSyncStatus === s).length, cfg: GHL_SYNC_STATUS_CONFIG[s],
  }));

  const won = opportunities.filter((o) => o.stage === "Closed Won").length;
  const lost = opportunities.filter((o) => o.stage === "Closed Lost").length;
  const totalClosed = won + lost;
  const avgScore = opportunities.length > 0
    ? Math.round(opportunities.reduce((s, o) => s + o.opportunityScore, 0) / opportunities.length) : 0;

  const conversionStages = ["Qualified", "Audit Requested", "Audit In Progress", "Proposal Draft", "Proposal Sent", "Negotiation", "Verbal Approval", "Proposal Approved", "Sales Handoff", "Closed Won"] as PipelineStage[];
  const conversionData = conversionStages.map((stage) => {
    const cnt = opportunities.filter((o) => STAGE_CONFIG.findIndex((s) => s.label === o.stage) >= STAGE_CONFIG.findIndex((s) => s.label === stage)).length;
    return { stage, count: cnt };
  });
  const maxConv = Math.max(...conversionData.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>Pipeline Analytics</h2>
        <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>GHL sync health, revenue by stage, rep performance, lead source trends, affiliate attribution, win/loss, and conversion.</p>
      </div>
      <div className="rounded-xl border p-5" style={{ background: "#ECFEFF", borderColor: "#A5F3FC" }}>
        <h3 className="text-xs font-bold uppercase tracking-wide mb-4" style={{ color: "#0891B2" }}>🔗 GHL Sync Health</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {syncData.map((d) => (
            <div key={d.status} className="p-3 rounded-xl border text-center"
              style={{ background: d.cfg.bg, borderColor: d.cfg.border }}>
              <p className="text-2xl font-bold" style={{ color: d.cfg.color }}>{d.count}</p>
              <p className="text-[10px] font-bold mt-1" style={{ color: d.cfg.color }}>{d.status}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border p-5" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
        <h3 className="text-xs font-bold uppercase tracking-wide mb-4" style={{ color: "var(--rtm-text-muted)" }}>Revenue by Stage</h3>
        <div className="flex flex-col gap-2">
          {stages.filter((s) => s.revenue > 0).sort((a, b) => b.revenue - a.revenue).map((stage) => {
            const maxRev = Math.max(...stages.map((s) => s.revenue), 1);
            return (
              <div key={stage.label} className="flex items-center gap-3">
                <div className="w-28 text-[10px] font-semibold truncate" style={{ color: stage.color }}>{stage.label}</div>
                <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: "var(--rtm-border)" }}>
                  <div className="h-full rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${Math.max((stage.revenue / maxRev) * 100, 2)}%`, background: stage.color }}>
                    <span className="text-[9px] font-bold text-white whitespace-nowrap">{fmtCurrency(stage.revenue)}</span>
                  </div>
                </div>
                <span className="w-6 text-[10px] font-bold text-right" style={{ color: stage.color }}>{stage.count}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Closed Won", value: won, color: "#059669" },
          { label: "Closed Lost", value: lost, color: "#DC2626" },
          { label: "Win Rate", value: `${totalClosed > 0 ? Math.round((won / totalClosed) * 100) : 0}%`, color: workspace.accentColor },
          { label: "Avg Opp Score", value: avgScore, color: "#D97706" },
        ].map((item) => (
          <div key={item.label} className="p-4 rounded-xl border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
            <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>{item.label}</p>
            <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border p-5" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
        <h3 className="text-xs font-bold uppercase tracking-wide mb-4" style={{ color: "var(--rtm-text-muted)" }}>Conversion Funnel</h3>
        <div className="flex flex-col gap-1.5">
          {conversionData.map((d) => {
            const stageC = getStageCfg(d.stage);
            return (
              <div key={d.stage} className="flex items-center gap-3">
                <div className="w-32 text-[10px] font-semibold truncate" style={{ color: stageC.color }}>{d.stage}</div>
                <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: "var(--rtm-border)" }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.max((d.count / maxConv) * 100, 2)}%`, background: stageC.color }} />
                </div>
                <span className="w-6 text-[10px] font-bold text-right" style={{ color: stageC.color }}>{d.count}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--rtm-border)" }}>
        <div className="px-5 py-3 border-b" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
          <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Sales Rep Performance</h3>
        </div>
        <table className="w-full text-xs">
          <thead><tr style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
            {["Rep", "Total", "Open", "Won", "Lost", "Win Rate", "Pipeline", "Won Rev"].map((col) => (
              <th key={col} className="text-left text-[10px] font-bold uppercase tracking-wide px-4 py-2.5" style={{ color: "var(--rtm-text-muted)" }}>{col}</th>
            ))}
          </tr></thead>
          <tbody>
            {repPerf.map((r, i) => (
              <tr key={r.rep} style={{ background: i % 2 === 0 ? "var(--rtm-bg)" : "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
                <td className="px-4 py-2.5 font-bold" style={{ color: "var(--rtm-text-primary)" }}>{r.rep}</td>
                <td className="px-4 py-2.5">{r.total}</td>
                <td className="px-4 py-2.5" style={{ color: "#2563EB" }}>{r.open}</td>
                <td className="px-4 py-2.5 font-semibold" style={{ color: "#059669" }}>{r.won}</td>
                <td className="px-4 py-2.5" style={{ color: "#DC2626" }}>{r.lost}</td>
                <td className="px-4 py-2.5"><span className="font-bold" style={{ color: r.winRate >= 60 ? "#059669" : "#D97706" }}>{r.winRate}%</span></td>
                <td className="px-4 py-2.5 font-semibold" style={{ color: workspace.accentColor }}>{fmtCurrency(r.pipeline)}/mo</td>
                <td className="px-4 py-2.5 font-bold" style={{ color: "#059669" }}>{fmtCurrency(r.wonRevenue)}/mo</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--rtm-border)" }}>
        <div className="px-5 py-3 border-b" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
          <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Lead Source Performance</h3>
        </div>
        <table className="w-full text-xs">
          <thead><tr style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
            {["Source", "Total", "Won", "Revenue"].map((col) => (
              <th key={col} className="text-left text-[10px] font-bold uppercase tracking-wide px-4 py-2.5" style={{ color: "var(--rtm-text-muted)" }}>{col}</th>
            ))}
          </tr></thead>
          <tbody>
            {sourcePerf.map((s, i) => (
              <tr key={s.source} style={{ background: i % 2 === 0 ? "var(--rtm-bg)" : "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
                <td className="px-4 py-2.5"><LeadSourceBadge source={s.source as LeadSource} /></td>
                <td className="px-4 py-2.5">{s.count}</td>
                <td className="px-4 py-2.5 font-semibold" style={{ color: "#059669" }}>{s.won}</td>
                <td className="px-4 py-2.5 font-bold" style={{ color: "#059669" }}>{fmtCurrency(s.revenue)}/mo</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {affiliateRows.length > 0 && (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--rtm-border)" }}>
          <div className="px-5 py-3 border-b" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
            <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Affiliate Performance</h3>
          </div>
          <table className="w-full text-xs">
            <thead><tr style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
              {["Affiliate", "Referrals", "Commission", "Attribution"].map((col) => (
                <th key={col} className="text-left text-[10px] font-bold uppercase tracking-wide px-4 py-2.5" style={{ color: "var(--rtm-text-muted)" }}>{col}</th>
              ))}
            </tr></thead>
            <tbody>
              {affiliateRows.map((af, i) => (
                <tr key={af.name} style={{ background: i % 2 === 0 ? "var(--rtm-bg)" : "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
                  <td className="px-4 py-2.5 font-semibold" style={{ color: "#059669" }}>{af.name}</td>
                  <td className="px-4 py-2.5">{af.count}</td>
                  <td className="px-4 py-2.5 font-semibold" style={{ color: "#D97706" }}>{fmtCurrency(af.commission)}</td>
                  <td className="px-4 py-2.5 font-bold" style={{ color: "#059669" }}>{fmtCurrency(af.attribution)}/mo</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type ViewMode = "kanban" | "table" | "analytics";

export default function SalesPipelinePage() {
  const [filterSource, setFilterSource] = useState<LeadSource | "All">("All");
  const [filterRep, setFilterRep] = useState<string>("All");
  const [filterPriority, setFilterPriority] = useState<Priority | "All">("All");
  const [filterSync, setFilterSync] = useState<GhlSyncStatus | "All">("All");
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [drawerOpp, setDrawerOpp] = useState<Opportunity | null>(null);
  const [showMapping, setShowMapping] = useState(false);
  const [showSyncIssues, setShowSyncIssues] = useState(false);

  const allReps = Array.from(new Set(OPPORTUNITIES.map((o) => o.assignedRep))).sort();
  const allSources: LeadSource[] = ["Direct", "Affiliate", "Partner", "Website", "Google Ads", "Meta Ads", "LSA"];
  const allPriorities: Priority[] = ["Low", "Medium", "High", "Urgent"];
  const allSyncStatuses: GhlSyncStatus[] = ["Synced", "Pending Sync", "Sync Failed", "Manual Override", "Not Connected"];

  const filtered = OPPORTUNITIES.filter((o) => {
    const src = filterSource === "All" || o.leadSource === filterSource;
    const rep = filterRep === "All" || o.assignedRep === filterRep;
    const pri = filterPriority === "All" || o.priority === filterPriority;
    const syn = filterSync === "All" || o.ghl.ghlSyncStatus === filterSync;
    return src && rep && pri && syn;
  });

  const kpis = calcKPIs(filtered);
  const hasFilters = filterSource !== "All" || filterRep !== "All" || filterPriority !== "All" || filterSync !== "All";

  const allNotifications = OPPORTUNITIES.flatMap((o) => o.notifications);
  const unreadCount = allNotifications.filter((n) => !n.read).length;
  const overdueTasks = OPPORTUNITIES.flatMap((o) => o.tasks).filter((t) => t.status === "Overdue").length;
  const overdueFollowUps = OPPORTUNITIES.flatMap((o) => o.followUps).filter((f) => f.status === "Overdue").length;
  const handoffsInProgress = OPPORTUNITIES.filter((o) => o.handoff.status !== "Not Started").length;

  return (
    <div className="space-y-7">
      {drawerOpp && <OpportunityDrawer opp={drawerOpp} onClose={() => setDrawerOpp(null)} />}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>Sales</p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Revenue Pipeline Center</h1>
        <p className="text-sm mt-1 max-w-2xl" style={{ color: "var(--rtm-text-secondary)" }}>
          GHL-connected pipeline. Opportunities sync from GoHighLevel — manage leads through audits, proposals, negotiations, approvals, and billing handoff.
        </p>
        <div className="mt-3 flex items-center gap-2 p-2.5 rounded-xl border w-fit"
          style={{ background: "#ECFEFF", borderColor: "#A5F3FC" }}>
          <span className="text-sm">🔗</span>
          <span className="text-[11px] font-bold" style={{ color: "#0891B2" }}>Connected to GoHighLevel</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border" style={{ background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" }}>Active Sync</span>
          <span className="text-[10px]" style={{ color: "#0E7490" }}>Pipeline: {GHL_PIPELINE_NAME}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {[
          { label: "New Opportunity", primary: true },
          { label: "🔄 Sync GHL Pipeline", ghl: true },
          { label: "🔗 View GHL Mapping", ghl: true, action: () => setShowMapping((v) => !v) },
          { label: "⬇️ Import GHL Opportunities", ghl: true },
          { label: "⚠️ Resolve Sync Issues", warn: true, action: () => setShowSyncIssues((v) => !v) },
          { label: "Export Pipeline", primary: false },
          { label: "Create Audit", primary: false },
          { label: "Create Proposal", primary: false },
          { label: "Create Follow Up", primary: false },
        ].map(({ label, primary, ghl, warn, action }) => (
          <button key={label} onClick={action}
            className="text-xs font-semibold px-4 py-2 rounded-lg border transition-colors duration-150"
            style={
              primary ? { background: workspace.accentColor, color: "#fff", borderColor: workspace.accentColor }
              : ghl ? { background: "#ECFEFF", color: "#0891B2", borderColor: "#A5F3FC" }
              : warn ? { background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" }
              : { background: "var(--rtm-surface)", color: "var(--rtm-text-primary)", borderColor: "var(--rtm-border)" }
            }>
            {label}
          </button>
        ))}
      </div>
      {showMapping && <GhlPipelineMapping />}
      {showSyncIssues && <GhlSyncIssuesPanel />}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Unread Notifications", value: unreadCount, color: unreadCount > 0 ? "#DC2626" : "#059669", href: "/notifications" },
          { label: "Overdue Tasks", value: overdueTasks, color: overdueTasks > 0 ? "#DC2626" : "#059669", href: "/tasks" },
          { label: "Overdue Follow Ups", value: overdueFollowUps, color: overdueFollowUps > 0 ? "#DC2626" : "#059669", href: "/sales/followups" },
          { label: "Active Handoffs", value: handoffsInProgress, color: "#0891B2", href: "/sales/handoffs" },
        ].map((item) => (
          <a key={item.label} href={item.href}
            className="p-3 rounded-xl border flex items-center justify-between hover:opacity-80 transition-opacity"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
            <span className="text-[11px] font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>{item.label}</span>
            <span className="text-base font-bold" style={{ color: item.color }}>{item.value}</span>
          </a>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard title="GHL Opps Synced" value={String(kpis.ghlSynced)} subtitle="Synced from GoHighLevel" trend="up" trendValue={`${kpis.ghlSynced}`} trendLabel="synced records" />
        <KpiCard title="Pending Sync" value={String(kpis.ghlPending)} subtitle="Awaiting next GHL sync" trend="neutral" trendValue={String(kpis.ghlPending)} trendLabel="in queue" />
        <KpiCard title="Sync Failed" value={String(kpis.ghlFailed)} subtitle="Failed GHL sync attempts" trend={kpis.ghlFailed > 0 ? "down" : "neutral"} trendValue={String(kpis.ghlFailed)} trendLabel="need attention" />
        <KpiCard title="Manual Overrides" value={String(kpis.ghlManual)} subtitle="Manually managed records" trend="neutral" trendValue={String(kpis.ghlManual)} trendLabel="overridden" />
        <KpiCard title="Open Opportunities" value={String(kpis.openCount)} subtitle="Active deals in pipeline" trend="up" trendValue="+3" trendLabel="vs last month" />
        <KpiCard title="Pipeline Value" value={fmtCurrency(kpis.pipelineValue)} subtitle="Total open deal value" trend="up" trendValue="+12%" trendLabel="vs last month" />
        <KpiCard title="Weighted Revenue" value={fmtCurrency(kpis.weightedRevenue)} subtitle="All active deals weighted" trend="neutral" trendValue="Stable" trendLabel="vs last month" />
        <KpiCard title="Win Rate" value={`${kpis.winRate}%`} subtitle="Closed won ÷ total closed" trend="up" trendValue="+2pp" trendLabel="vs last month" />
        <KpiCard title="Closing This Month" value={String(kpis.closingThisMonth)} subtitle="Expected close Jan 2025" trend="neutral" trendValue="On track" trendLabel="vs forecast" />
        <KpiCard title="Closed Won" value={String(kpis.wonCount)} subtitle="Total closed won deals" trend="up" trendValue="+1" trendLabel="this month" />
        <KpiCard title="Closed Lost" value={String(kpis.lostCount)} subtitle="Total closed lost deals" trend="neutral" trendValue="Stable" trendLabel="this month" />
        <KpiCard title="Affiliate Revenue" value={fmtCurrency(kpis.affiliateRev)} subtitle="Won deals via affiliates" trend="up" trendValue="+18%" trendLabel="vs last month" />
      </div>
      <div className="flex flex-wrap items-end gap-4 p-4 rounded-xl border"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Lead Source</label>
          <select value={filterSource} onChange={(e) => setFilterSource(e.target.value as LeadSource | "All")}
            className="text-xs rounded-lg border px-3 py-2 focus:outline-none"
            style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}>
            <option value="All">All Sources</option>
            {allSources.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Sales Rep</label>
          <select value={filterRep} onChange={(e) => setFilterRep(e.target.value)}
            className="text-xs rounded-lg border px-3 py-2 focus:outline-none"
            style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}>
            <option value="All">All Reps</option>
            {allReps.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Priority</label>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as Priority | "All")}
            className="text-xs rounded-lg border px-3 py-2 focus:outline-none"
            style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}>
            <option value="All">All Priorities</option>
            {allPriorities.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#0891B2" }}>GHL Sync Status</label>
          <select value={filterSync} onChange={(e) => setFilterSync(e.target.value as GhlSyncStatus | "All")}
            className="text-xs rounded-lg border px-3 py-2 focus:outline-none"
            style={{ background: "#ECFEFF", borderColor: "#A5F3FC", color: "#0891B2" }}>
            <option value="All">All Sync Statuses</option>
            {allSyncStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {hasFilters && (
          <button onClick={() => { setFilterSource("All"); setFilterRep("All"); setFilterPriority("All"); setFilterSync("All"); }}
            className="text-xs font-semibold px-3 py-2 rounded-lg border self-end"
            style={{ background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" }}>Clear Filters</button>
        )}
        <div className="flex-1" />
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>View</label>
          <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: "var(--rtm-border)" }}>
            {(["kanban", "table", "analytics"] as ViewMode[]).map((mode, idx) => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className="text-xs font-semibold px-4 py-2 transition-colors"
                style={{
                  background: viewMode === mode ? workspace.accentColor : "var(--rtm-bg)",
                  color: viewMode === mode ? "#fff" : "var(--rtm-text-secondary)",
                  borderRight: idx < 2 ? "1px solid var(--rtm-border)" : undefined,
                }}>
                {mode === "kanban" ? "⧉ Kanban" : mode === "table" ? "☰ Table" : "📊 Analytics"}
              </button>
            ))}
          </div>
        </div>
      </div>
      {viewMode === "kanban" && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: "var(--rtm-text-muted)" }}>Pipeline Stages · GHL Source</h2>
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4" style={{ minWidth: "max-content" }}>
              {STAGE_CONFIG.map((stageCfg) => {
                const cards = filtered.filter((o) => o.stage === stageCfg.label);
                const stageValue = cards.reduce((s, o) => s + o.estimatedValue, 0);
                return (
                  <div key={stageCfg.label} className="flex flex-col rounded-xl border"
                    style={{ width: 240, minWidth: 240, background: stageCfg.bg, borderColor: stageCfg.border }}>
                    <div className="flex items-center justify-between px-3 py-2.5 rounded-t-xl border-b"
                      style={{ borderColor: stageCfg.border, background: stageCfg.bg }}>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-wide truncate leading-tight" style={{ color: stageCfg.color }}>{stageCfg.label}</p>
                        {stageValue > 0 && <p className="text-[10px] font-semibold mt-0.5" style={{ color: stageCfg.color, opacity: 0.75 }}>{fmtCurrency(stageValue)}/mo</p>}
                      </div>
                      <span className="text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: stageCfg.color, color: "#fff" }}>{cards.length}</span>
                    </div>
                    <div className="flex flex-col gap-2 p-2 flex-1">
                      {cards.length === 0 ? (
                        <div className="flex items-center justify-center py-6 rounded-lg border border-dashed" style={{ borderColor: stageCfg.border }}>
                          <p className="text-[11px]" style={{ color: stageCfg.color, opacity: 0.5 }}>No opportunities</p>
                        </div>
                      ) : cards.map((opp) => <OpportunityCard key={opp.id} opp={opp} stageCfg={stageCfg} onView={setDrawerOpp} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {viewMode === "table" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>All Opportunities — GHL Synced</h2>
            <span className="text-xs font-semibold px-3 py-1 rounded-full border"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>
              {filtered.length} {filtered.length === 1 ? "opportunity" : "opportunities"}
            </span>
          </div>
          <PipelineTable opportunities={filtered} onView={setDrawerOpp} />
        </div>
      )}
      {viewMode === "analytics" && <PipelineAnalytics opportunities={filtered} />}
      <div className="p-4 rounded-xl border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
        <h3 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "var(--rtm-text-muted)" }}>Pipeline Summary</h3>
        <div className="flex flex-wrap gap-3">
          {STAGE_CONFIG.map((cfg) => {
            const count = filtered.filter((o) => o.stage === cfg.label).length;
            return (
              <div key={cfg.label} className="flex items-center gap-2 px-3 py-2 rounded-lg border"
                style={{ background: cfg.bg, borderColor: cfg.border }}>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                <span className="text-[11px] font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
                <span className="text-[11px] font-bold" style={{ color: cfg.color }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>
      <GhlSyncIssuesPanel />
      <GhlPipelineMapping />
      <div className="rounded-xl border p-5" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
        <h3 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>RTM OS Ecosystem — GHL as Source</h3>
        <p className="text-[11px] mb-4" style={{ color: "var(--rtm-text-secondary)" }}>All pipeline data originates from GoHighLevel. RTM OS integrations layer on top of GHL opportunities.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Audits", href: "/sales/audits", icon: "🔍", desc: "View all audits" },
            { label: "Proposals", href: "/sales/proposals", icon: "📝", desc: "Manage proposals" },
            { label: "Follow Ups", href: "/sales/followups", icon: "📞", desc: "Follow up queue" },
            { label: "Handoffs", href: "/sales/handoffs", icon: "📦", desc: "Sales handoffs" },
            { label: "Affiliates", href: "/sales/affiliates", icon: "🤝", desc: "Affiliate attribution" },
            { label: "Tasks", href: "/tasks", icon: "✅", desc: "All tasks" },
            { label: "Notifications", href: "/notifications", icon: "🔔", desc: "All notifications" },
            { label: "Workflows", href: "/admin/workflows", icon: "⚙️", desc: "Workflow builder" },
            { label: "GHL CRM", href: "#", icon: "🔗", desc: "Open GoHighLevel" },
            { label: "GHL Pipeline", href: "#", icon: "📊", desc: "View GHL pipeline" },
            { label: "GHL Contacts", href: "#", icon: "👤", desc: "Browse GHL contacts" },
            { label: "GHL Automations", href: "#", icon: "⚡", desc: "GHL automation rules" },
          ].map((link) => (
            <a key={link.label} href={link.href}
              className="flex items-center gap-3 p-3 rounded-xl border hover:opacity-80 transition-opacity"
              style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}>
              <span className="text-xl">{link.icon}</span>
              <div>
                <p className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>{link.label}</p>
                <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{link.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}