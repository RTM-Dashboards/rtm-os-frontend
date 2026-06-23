"use client";

import React, { useState } from "react";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import Link from "next/link";

const workspace = getWorkspace("sales")!;

//  Types 

type FollowUpStatus =
  | "Open"| "Due Today"| "Overdue"| "Completed"| "Rescheduled"| "Cancelled";

type FollowUpType =
  | "Call"| "Email"| "SMS"| "Meeting"| "Proposal Follow-Up"| "Discovery Reminder"| "Audit Reminder"| "Negotiation Follow-Up"| "Affiliate Follow-Up";

type RelatedType =
  | "Lead"| "Opportunity"| "Audit"| "Proposal"| "Handoff"| "Affiliate Referral";

type Priority = "High"| "Medium"| "Low";

type GhlSyncStatus =
  | "Synced"| "Pending Sync"| "Sync Failed"| "Manual Override"| "Not Connected";

type CommChannel = "Call"| "Email"| "SMS"| "Meeting"| "Voicemail"| "No Answer";
type CommOutcome =
  | "Connected"| "No Answer"| "Left Voicemail"| "Replied"| "Booked Meeting"| "Requested Proposal"| "Not Interested";

interface CommEntry {
  date: string;
  channel: CommChannel;
  user: string;
  outcome: CommOutcome;
  notes: string;
}

interface FollowUp {
  id: string;
  contact: string;
  businessName: string;
  relatedRecord: string;
  relatedType: RelatedType;
  followUpType: FollowUpType;
  assignedRep: string;
  priority: Priority;
  dueDate: string;
  lastContact: string;
  ghlActivityStatus: string;
  currentStage: string;
  nextAction: string;
  status: FollowUpStatus;
  // GHL fields
  ghlContactId: string;
  ghlOpportunityId: string;
  ghlTaskId: string;
  ghlConversationId: string;
  ghlActivityType: string;
  ghlAssignedUser: string;
  ghlDueDate: string;
  ghlLastContactDate: string;
  ghlSyncStatus: GhlSyncStatus;
  commHistory: CommEntry[];
  notes: string;
}

interface StalledOpportunity {
  id: string;
  opportunity: string;
  stage: string;
  daysSinceActivity: number;
  salesRep: string;
  dealValue: string;
  nextAction: string;
}

interface ProposalFollowUp {
  id: string;
  proposal: string;
  client: string;
  sentDate: string;
  viewed: boolean;
  daysSinceSent: number;
  salesRep: string;
  nextAction: string;
}

interface AffiliateReferral {
  id: string;
  referral: string;
  affiliate: string;
  leadStage: string;
  assignedRep: string;
  followUpDue: string;
  commissionPotential: string;
  nextAction: string;
}

//  Mock Data 

const FOLLOW_UPS: FollowUp[] = [
  {
    id: "FU-001", contact: "James Thornton", businessName: "Summit Landscaping",
    relatedRecord: "Proposal #PR-2412", relatedType: "Proposal", followUpType: "Proposal Follow-Up",
    assignedRep: "Jordan M.", priority: "High", dueDate: "Today", lastContact: "Jan 9, 2025",
    ghlActivityStatus: "Pending", currentStage: "Proposal Sent", nextAction: "Call to confirm receipt",
    status: "Due Today", ghlContactId: "ghl-c-001", ghlOpportunityId: "ghl-o-001", ghlTaskId: "ghl-t-001",
    ghlConversationId: "ghl-cv-001", ghlActivityType: "Follow-Up Call", ghlAssignedUser: "Jordan M.",
    ghlDueDate: "Jan 11, 2025", ghlLastContactDate: "Jan 9, 2025", ghlSyncStatus: "Synced",
    commHistory: [
      { date: "Jan 9, 2025", channel: "Call", user: "Jordan M.", outcome: "Connected", notes: "Discussed proposal details, will review over the weekend."},
      { date: "Jan 7, 2025", channel: "Email", user: "Jordan M.", outcome: "Replied", notes: "Client requested revised pricing breakdown."},
      { date: "Jan 5, 2025", channel: "Call", user: "Jordan M.", outcome: "Connected", notes: "Initial discovery call, strong interest in SEO package."},
    ],
    notes: "Client is comparing with one competitor. Strong buying signals. Push for decision this week.",
  },
  {
    id: "FU-002", contact: "Sandra Yee", businessName: "Harbor Auto Group",
    relatedRecord: "Opportunity #OP-0891", relatedType: "Opportunity", followUpType: "Negotiation Follow-Up",
    assignedRep: "Mike T.", priority: "High", dueDate: "Today", lastContact: "Jan 8, 2025",
    ghlActivityStatus: "In Progress", currentStage: "Negotiation", nextAction: "Send revised contract",
    status: "Due Today", ghlContactId: "ghl-c-002", ghlOpportunityId: "ghl-o-002", ghlTaskId: "ghl-t-002",
    ghlConversationId: "ghl-cv-002", ghlActivityType: "Task", ghlAssignedUser: "Mike T.",
    ghlDueDate: "Jan 11, 2025", ghlLastContactDate: "Jan 8, 2025", ghlSyncStatus: "Synced",
    commHistory: [
      { date: "Jan 8, 2025", channel: "Meeting", user: "Mike T.", outcome: "Connected", notes: "Reviewed contract, client wants 3-month onboarding window."},
      { date: "Jan 6, 2025", channel: "Email", user: "Mike T.", outcome: "Replied", notes: "Sent initial contract draft."},
    ],
    notes: "Deal at $4,800/mo. Client wants extended onboarding. Check with AM on capacity.",
  },
  {
    id: "FU-003", contact: "Tom Hargreaves", businessName: "Metro Dental Group",
    relatedRecord: "Lead #LD-0334", relatedType: "Lead", followUpType: "Discovery Reminder",
    assignedRep: "Jordan M.", priority: "High", dueDate: "Jan 8, 2025", lastContact: "Dec 29, 2024",
    ghlActivityStatus: "Overdue", currentStage: "Discovery", nextAction: "Schedule discovery call",
    status: "Overdue", ghlContactId: "ghl-c-003", ghlOpportunityId: "", ghlTaskId: "ghl-t-003",
    ghlConversationId: "ghl-cv-003", ghlActivityType: "Appointment", ghlAssignedUser: "Jordan M.",
    ghlDueDate: "Jan 8, 2025", ghlLastContactDate: "Dec 29, 2024", ghlSyncStatus: "Sync Failed",
    commHistory: [
      { date: "Dec 29, 2024", channel: "Call", user: "Jordan M.", outcome: "Connected", notes: "Interested in digital marketing, asked for discovery call in January."},
    ],
    notes: "GHL sync failed — task not pushing to CRM. Needs manual resolution.",
  },
  {
    id: "FU-004", contact: "Lisa Branford", businessName: "Blue Ridge Plumbing",
    relatedRecord: "Lead #LD-0289", relatedType: "Lead", followUpType: "Call",
    assignedRep: "Sarah K.", priority: "Medium", dueDate: "Jan 7, 2025", lastContact: "Jan 4, 2025",
    ghlActivityStatus: "Overdue", currentStage: "New Lead", nextAction: "Initial outreach call",
    status: "Overdue", ghlContactId: "ghl-c-004", ghlOpportunityId: "", ghlTaskId: "ghl-t-004",
    ghlConversationId: "", ghlActivityType: "Call", ghlAssignedUser: "Sarah K.",
    ghlDueDate: "Jan 7, 2025", ghlLastContactDate: "Jan 4, 2025", ghlSyncStatus: "Pending Sync",
    commHistory: [
      { date: "Jan 4, 2025", channel: "Email", user: "Sarah K.", outcome: "Replied", notes: "Responded to inbound form, asked to schedule call."},
    ],
    notes: "Inbound lead from Google Ads. High intent plumbing niche.",
  },
  {
    id: "FU-005", contact: "Derek Sutton", businessName: "Cascade Flooring",
    relatedRecord: "Audit #AU-0112", relatedType: "Audit", followUpType: "Audit Reminder",
    assignedRep: "Alex R.", priority: "Medium", dueDate: "Jan 6, 2025", lastContact: "Jan 2, 2025",
    ghlActivityStatus: "Overdue", currentStage: "Audit Requested", nextAction: "Schedule audit presentation",
    status: "Overdue", ghlContactId: "ghl-c-005", ghlOpportunityId: "ghl-o-005", ghlTaskId: "ghl-t-005",
    ghlConversationId: "ghl-cv-005", ghlActivityType: "Task", ghlAssignedUser: "Alex R.",
    ghlDueDate: "Jan 6, 2025", ghlLastContactDate: "Jan 2, 2025", ghlSyncStatus: "Manual Override",
    commHistory: [
      { date: "Jan 2, 2025", channel: "Email", user: "Alex R.", outcome: "Replied", notes: "Audit report delivered. Awaiting meeting to present findings."},
    ],
    notes: "Audit complete, waiting on client to confirm presentation slot.",
  },
  {
    id: "FU-006", contact: "Renee Alvarez", businessName: "Green Valley Pools",
    relatedRecord: "Lead #LD-0401", relatedType: "Lead", followUpType: "Email",
    assignedRep: "Alex R.", priority: "Low", dueDate: "Today", lastContact: "Never",
    ghlActivityStatus: "Not Started", currentStage: "New Lead", nextAction: "Send intro email",
    status: "Due Today", ghlContactId: "ghl-c-006", ghlOpportunityId: "", ghlTaskId: "ghl-t-006",
    ghlConversationId: "", ghlActivityType: "Email", ghlAssignedUser: "Alex R.",
    ghlDueDate: "Jan 11, 2025", ghlLastContactDate: "", ghlSyncStatus: "Not Connected",
    commHistory: [],
    notes: "Brand new lead, not yet contacted.",
  },
  {
    id: "FU-007", contact: "Paul Mignone", businessName: "Skyline Roofing",
    relatedRecord: "Proposal #PR-2398", relatedType: "Proposal", followUpType: "Proposal Follow-Up",
    assignedRep: "Mike T.", priority: "High", dueDate: "Jan 9, 2025", lastContact: "Jan 6, 2025",
    ghlActivityStatus: "Overdue", currentStage: "Proposal Sent", nextAction: "Call for decision",
    status: "Overdue", ghlContactId: "ghl-c-007", ghlOpportunityId: "ghl-o-007", ghlTaskId: "ghl-t-007",
    ghlConversationId: "ghl-cv-007", ghlActivityType: "Follow-Up Call", ghlAssignedUser: "Mike T.",
    ghlDueDate: "Jan 9, 2025", ghlLastContactDate: "Jan 6, 2025", ghlSyncStatus: "Synced",
    commHistory: [
      { date: "Jan 6, 2025", channel: "Call", user: "Mike T.", outcome: "Connected", notes: "Proposal under review internally, will have answer by Jan 9."},
      { date: "Jan 3, 2025", channel: "Email", user: "Mike T.", outcome: "Replied", notes: "Sent proposal PDF."},
    ],
    notes: "3-location roofing business. Proposal value $6,200/mo.",
  },
  {
    id: "FU-008", contact: "Angela West", businessName: "Pacific Realty Group",
    relatedRecord: "Affiliate Ref #AF-0055", relatedType: "Affiliate Referral", followUpType: "Affiliate Follow-Up",
    assignedRep: "Jordan M.", priority: "High", dueDate: "Today", lastContact: "Jan 7, 2025",
    ghlActivityStatus: "Active", currentStage: "Discovery", nextAction: "Book discovery call",
    status: "Due Today", ghlContactId: "ghl-c-008", ghlOpportunityId: "", ghlTaskId: "ghl-t-008",
    ghlConversationId: "ghl-cv-008", ghlActivityType: "Appointment", ghlAssignedUser: "Jordan M.",
    ghlDueDate: "Jan 11, 2025", ghlLastContactDate: "Jan 7, 2025", ghlSyncStatus: "Synced",
    commHistory: [
      { date: "Jan 7, 2025", channel: "Email", user: "Jordan M.", outcome: "Replied", notes: "Affiliate referred warm lead from networking event."},
    ],
    notes: "High-value real estate referral from Top Producer affiliate. Commission: $1,200.",
  },
  {
    id: "FU-009", contact: "Marcus Cole", businessName: "Iron Gate Security",
    relatedRecord: "Opportunity #OP-0842", relatedType: "Opportunity", followUpType: "Call",
    assignedRep: "Sarah K.", priority: "Medium", dueDate: "Jan 10, 2025", lastContact: "Jan 5, 2025",
    ghlActivityStatus: "Overdue", currentStage: "Qualified", nextAction: "Push to audit request",
    status: "Overdue", ghlContactId: "ghl-c-009", ghlOpportunityId: "ghl-o-009", ghlTaskId: "ghl-t-009",
    ghlConversationId: "ghl-cv-009", ghlActivityType: "Call", ghlAssignedUser: "Sarah K.",
    ghlDueDate: "Jan 10, 2025", ghlLastContactDate: "Jan 5, 2025", ghlSyncStatus: "Synced",
    commHistory: [
      { date: "Jan 5, 2025", channel: "Call", user: "Sarah K.", outcome: "Connected", notes: "Qualified call went well. Client wants to review audit options."},
    ],
    notes: "Security company — 4 locations, 22 employees. Good target for Local SEO bundle.",
  },
  {
    id: "FU-010", contact: "Tina Rocha", businessName: "Bloom Floral Studio",
    relatedRecord: "Lead #LD-0452", relatedType: "Lead", followUpType: "SMS",
    assignedRep: "Alex R.", priority: "Low", dueDate: "Today", lastContact: "Never",
    ghlActivityStatus: "Not Started", currentStage: "New Lead", nextAction: "Send intro SMS",
    status: "Due Today", ghlContactId: "ghl-c-010", ghlOpportunityId: "", ghlTaskId: "ghl-t-010",
    ghlConversationId: "", ghlActivityType: "SMS", ghlAssignedUser: "Alex R.",
    ghlDueDate: "Jan 11, 2025", ghlLastContactDate: "", ghlSyncStatus: "Not Connected",
    commHistory: [],
    notes: "Uncontacted inbound lead from Facebook form.",
  },
  {
    id: "FU-011", contact: "Frank DiNapoli", businessName: "Coastal Kitchen & Bath",
    relatedRecord: "Proposal #PR-2421", relatedType: "Proposal", followUpType: "Proposal Follow-Up",
    assignedRep: "Mike T.", priority: "High", dueDate: "Jan 11, 2025", lastContact: "Jan 8, 2025",
    ghlActivityStatus: "Active", currentStage: "Proposal Sent", nextAction: "Follow up on proposal review",
    status: "Open", ghlContactId: "ghl-c-011", ghlOpportunityId: "ghl-o-011", ghlTaskId: "ghl-t-011",
    ghlConversationId: "ghl-cv-011", ghlActivityType: "Follow-Up", ghlAssignedUser: "Mike T.",
    ghlDueDate: "Jan 11, 2025", ghlLastContactDate: "Jan 8, 2025", ghlSyncStatus: "Synced",
    commHistory: [
      { date: "Jan 8, 2025", channel: "Email", user: "Mike T.", outcome: "Replied", notes: "Proposal emailed, confirmed receipt."},
    ],
    notes: "Kitchen renovation company. Proposal: $3,400/mo full digital.",
  },
  {
    id: "FU-012", contact: "Carmen Liu", businessName: "Vantage Wealth Advisors",
    relatedRecord: "Lead #LD-0377", relatedType: "Lead", followUpType: "Discovery Reminder",
    assignedRep: "Jordan M.", priority: "Medium", dueDate: "Jan 12, 2025", lastContact: "Jan 4, 2025",
    ghlActivityStatus: "Scheduled", currentStage: "Discovery", nextAction: "Confirm discovery call",
    status: "Open", ghlContactId: "ghl-c-012", ghlOpportunityId: "", ghlTaskId: "ghl-t-012",
    ghlConversationId: "ghl-cv-012", ghlActivityType: "Appointment", ghlAssignedUser: "Jordan M.",
    ghlDueDate: "Jan 12, 2025", ghlLastContactDate: "Jan 4, 2025", ghlSyncStatus: "Synced",
    commHistory: [
      { date: "Jan 4, 2025", channel: "Call", user: "Jordan M.", outcome: "Booked Meeting", notes: "Booked discovery for Jan 12."},
    ],
    notes: "Financial advisory firm. High compliance considerations for ads.",
  },
  {
    id: "FU-013", contact: "Ray Vasquez", businessName: "Precision Auto Repair",
    relatedRecord: "Opportunity #OP-0779", relatedType: "Opportunity", followUpType: "Negotiation Follow-Up",
    assignedRep: "Sarah K.", priority: "High", dueDate: "Jan 5, 2025", lastContact: "Jan 2, 2025",
    ghlActivityStatus: "Overdue", currentStage: "Negotiation", nextAction: "Final offer call",
    status: "Overdue", ghlContactId: "ghl-c-013", ghlOpportunityId: "ghl-o-013", ghlTaskId: "ghl-t-013",
    ghlConversationId: "ghl-cv-013", ghlActivityType: "Call", ghlAssignedUser: "Sarah K.",
    ghlDueDate: "Jan 5, 2025", ghlLastContactDate: "Jan 2, 2025", ghlSyncStatus: "Sync Failed",
    commHistory: [
      { date: "Jan 2, 2025", channel: "Call", user: "Sarah K.", outcome: "Connected", notes: "Client pushed back on price. Offering 2-month lock-in as incentive."},
    ],
    notes: "6-location auto chain. Deal at risk — competitor offering lower price.",
  },
  {
    id: "FU-014", contact: "Beth Harlow", businessName: "Harlow Orthodontics",
    relatedRecord: "Affiliate Ref #AF-0061", relatedType: "Affiliate Referral", followUpType: "Affiliate Follow-Up",
    assignedRep: "Alex R.", priority: "Medium", dueDate: "Jan 12, 2025", lastContact: "Jan 6, 2025",
    ghlActivityStatus: "Pending", currentStage: "New Lead", nextAction: "Intro call",
    status: "Open", ghlContactId: "ghl-c-014", ghlOpportunityId: "", ghlTaskId: "ghl-t-014",
    ghlConversationId: "ghl-cv-014", ghlActivityType: "Call", ghlAssignedUser: "Alex R.",
    ghlDueDate: "Jan 12, 2025", ghlLastContactDate: "Jan 6, 2025", ghlSyncStatus: "Pending Sync",
    commHistory: [
      { date: "Jan 6, 2025", channel: "Email", user: "Alex R.", outcome: "Replied", notes: "Affiliate intro email sent."},
    ],
    notes: "Dental referral from MarketPro affiliate. Commission: $850.",
  },
  {
    id: "FU-015", contact: "Owen Blackwell", businessName: "Blackwell Electric",
    relatedRecord: "Audit #AU-0098", relatedType: "Audit", followUpType: "Audit Reminder",
    assignedRep: "Mike T.", priority: "Medium", dueDate: "Today", lastContact: "Jan 3, 2025",
    ghlActivityStatus: "Overdue", currentStage: "Audit Requested", nextAction: "Deliver audit report",
    status: "Due Today", ghlContactId: "ghl-c-015", ghlOpportunityId: "ghl-o-015", ghlTaskId: "ghl-t-015",
    ghlConversationId: "ghl-cv-015", ghlActivityType: "Task", ghlAssignedUser: "Mike T.",
    ghlDueDate: "Jan 11, 2025", ghlLastContactDate: "Jan 3, 2025", ghlSyncStatus: "Synced",
    commHistory: [
      { date: "Jan 3, 2025", channel: "Call", user: "Mike T.", outcome: "Connected", notes: "Audit scope confirmed. Report due Jan 11."},
    ],
    notes: "Electrical contractor, large footprint. Audit covers 3 markets.",
  },
  {
    id: "FU-016", contact: "Nadia Torres", businessName: "Torres Tax Solutions",
    relatedRecord: "Lead #LD-0461", relatedType: "Lead", followUpType: "Call",
    assignedRep: "Jordan M.", priority: "Low", dueDate: "Jan 13, 2025", lastContact: "Never",
    ghlActivityStatus: "Not Started", currentStage: "New Lead", nextAction: "Initial outreach",
    status: "Open", ghlContactId: "ghl-c-016", ghlOpportunityId: "", ghlTaskId: "ghl-t-016",
    ghlConversationId: "", ghlActivityType: "Call", ghlAssignedUser: "Jordan M.",
    ghlDueDate: "Jan 13, 2025", ghlLastContactDate: "", ghlSyncStatus: "Not Connected",
    commHistory: [],
    notes: "Cold outreach — sourced from local business directory.",
  },
  {
    id: "FU-017", contact: "Ivan Cruz", businessName: "Cruz Pest Control",
    relatedRecord: "Proposal #PR-2401", relatedType: "Proposal", followUpType: "Proposal Follow-Up",
    assignedRep: "Sarah K.", priority: "High", dueDate: "Jan 10, 2025", lastContact: "Jan 7, 2025",
    ghlActivityStatus: "Overdue", currentStage: "Proposal Sent", nextAction: "Push for signature",
    status: "Overdue", ghlContactId: "ghl-c-017", ghlOpportunityId: "ghl-o-017", ghlTaskId: "ghl-t-017",
    ghlConversationId: "ghl-cv-017", ghlActivityType: "Follow-Up Call", ghlAssignedUser: "Sarah K.",
    ghlDueDate: "Jan 10, 2025", ghlLastContactDate: "Jan 7, 2025", ghlSyncStatus: "Synced",
    commHistory: [
      { date: "Jan 7, 2025", channel: "Call", user: "Sarah K.", outcome: "No Answer", notes: "Called twice, no answer. Left voicemail."},
      { date: "Jan 5, 2025", channel: "Email", user: "Sarah K.", outcome: "Replied", notes: "Sent proposal, confirmed opening Jan 7."},
    ],
    notes: "Owner traveling — try Tuesday after 3 PM.",
  },
  {
    id: "FU-018", contact: "Gina Ferraro", businessName: "Ferraro Realty",
    relatedRecord: "Handoff #HO-0031", relatedType: "Handoff", followUpType: "Call",
    assignedRep: "Alex R.", priority: "High", dueDate: "Today", lastContact: "Jan 10, 2025",
    ghlActivityStatus: "Active", currentStage: "Proposal Approved", nextAction: "Complete AM handoff",
    status: "Due Today", ghlContactId: "ghl-c-018", ghlOpportunityId: "ghl-o-018", ghlTaskId: "ghl-t-018",
    ghlConversationId: "ghl-cv-018", ghlActivityType: "Task", ghlAssignedUser: "Alex R.",
    ghlDueDate: "Jan 11, 2025", ghlLastContactDate: "Jan 10, 2025", ghlSyncStatus: "Synced",
    commHistory: [
      { date: "Jan 10, 2025", channel: "Meeting", user: "Alex R.", outcome: "Connected", notes: "Won deal. Scheduling AM kickoff for Jan 14."},
    ],
    notes: "Deal closed. Handoff to AM team in progress.",
  },
  {
    id: "FU-019", contact: "Carl Stanton", businessName: "Stanton Law Group",
    relatedRecord: "Opportunity #OP-0811", relatedType: "Opportunity", followUpType: "Meeting",
    assignedRep: "Mike T.", priority: "Medium", dueDate: "Jan 14, 2025", lastContact: "Jan 6, 2025",
    ghlActivityStatus: "Scheduled", currentStage: "Qualified", nextAction: "Present audit proposal",
    status: "Open", ghlContactId: "ghl-c-019", ghlOpportunityId: "ghl-o-019", ghlTaskId: "ghl-t-019",
    ghlConversationId: "ghl-cv-019", ghlActivityType: "Appointment", ghlAssignedUser: "Mike T.",
    ghlDueDate: "Jan 14, 2025", ghlLastContactDate: "Jan 6, 2025", ghlSyncStatus: "Synced",
    commHistory: [
      { date: "Jan 6, 2025", channel: "Call", user: "Mike T.", outcome: "Booked Meeting", notes: "Scheduled audit presentation for Jan 14."},
    ],
    notes: "Law firm with 8 attorneys. Budget conversation pending.",
  },
  {
    id: "FU-020", contact: "Holly Simmons", businessName: "Simmons Catering Co.",
    relatedRecord: "Lead #LD-0392", relatedType: "Lead", followUpType: "Email",
    assignedRep: "Jordan M.", priority: "Low", dueDate: "Jan 9, 2025", lastContact: "Never",
    ghlActivityStatus: "Not Started", currentStage: "New Lead", nextAction: "Send intro email",
    status: "Overdue", ghlContactId: "ghl-c-020", ghlOpportunityId: "", ghlTaskId: "ghl-t-020",
    ghlConversationId: "", ghlActivityType: "Email", ghlAssignedUser: "Jordan M.",
    ghlDueDate: "Jan 9, 2025", ghlLastContactDate: "", ghlSyncStatus: "Not Connected",
    commHistory: [],
    notes: "Uncontacted — pulled from event marketing list.",
  },
  {
    id: "FU-021", contact: "Dave Nguyen", businessName: "Nguyen HVAC",
    relatedRecord: "Proposal #PR-2388", relatedType: "Proposal", followUpType: "Proposal Follow-Up",
    assignedRep: "Sarah K.", priority: "High", dueDate: "Jan 8, 2025", lastContact: "Jan 5, 2025",
    ghlActivityStatus: "Overdue", currentStage: "Negotiation", nextAction: "Price revision call",
    status: "Overdue", ghlContactId: "ghl-c-021", ghlOpportunityId: "ghl-o-021", ghlTaskId: "ghl-t-021",
    ghlConversationId: "ghl-cv-021", ghlActivityType: "Call", ghlAssignedUser: "Sarah K.",
    ghlDueDate: "Jan 8, 2025", ghlLastContactDate: "Jan 5, 2025", ghlSyncStatus: "Sync Failed",
    commHistory: [
      { date: "Jan 5, 2025", channel: "Call", user: "Sarah K.", outcome: "Connected", notes: "Client wants package adjusted. Budget sensitivity at $2,500."},
    ],
    notes: "Proposal revised twice. Final negotiation — do not drop below $2,200.",
  },
  {
    id: "FU-022", contact: "Chloe Marks", businessName: "Marks Spa & Wellness",
    relatedRecord: "Lead #LD-0443", relatedType: "Lead", followUpType: "Call",
    assignedRep: "Alex R.", priority: "Medium", dueDate: "Today", lastContact: "Jan 8, 2025",
    ghlActivityStatus: "Active", currentStage: "Discovery", nextAction: "Second discovery call",
    status: "Due Today", ghlContactId: "ghl-c-022", ghlOpportunityId: "", ghlTaskId: "ghl-t-022",
    ghlConversationId: "ghl-cv-022", ghlActivityType: "Call", ghlAssignedUser: "Alex R.",
    ghlDueDate: "Jan 11, 2025", ghlLastContactDate: "Jan 8, 2025", ghlSyncStatus: "Synced",
    commHistory: [
      { date: "Jan 8, 2025", channel: "Call", user: "Alex R.", outcome: "Connected", notes: "First discovery done. Budget approved. Needs local SEO + GBP."},
    ],
    notes: "Spa chain — 2 locations. Ready to move to audit stage.",
  },
  {
    id: "FU-023", contact: "Nathan Blake", businessName: "Blake Financial",
    relatedRecord: "Affiliate Ref #AF-0044", relatedType: "Affiliate Referral", followUpType: "Affiliate Follow-Up",
    assignedRep: "Jordan M.", priority: "High", dueDate: "Jan 9, 2025", lastContact: "Jan 4, 2025",
    ghlActivityStatus: "Overdue", currentStage: "Discovery", nextAction: "Discovery call",
    status: "Overdue", ghlContactId: "ghl-c-023", ghlOpportunityId: "", ghlTaskId: "ghl-t-023",
    ghlConversationId: "ghl-cv-023", ghlActivityType: "Appointment", ghlAssignedUser: "Jordan M.",
    ghlDueDate: "Jan 9, 2025", ghlLastContactDate: "Jan 4, 2025", ghlSyncStatus: "Pending Sync",
    commHistory: [
      { date: "Jan 4, 2025", channel: "Email", user: "Jordan M.", outcome: "Replied", notes: "Received affiliate intro, confirmed interest."},
    ],
    notes: "High-value financial advisory referral. Commission: $1,500.",
  },
  {
    id: "FU-024", contact: "Rick Alderman", businessName: "Alderman Remodeling",
    relatedRecord: "Opportunity #OP-0798", relatedType: "Opportunity", followUpType: "Call",
    assignedRep: "Mike T.", priority: "Medium", dueDate: "Jan 11, 2025", lastContact: "Jan 9, 2025",
    ghlActivityStatus: "Active", currentStage: "Proposal Sent", nextAction: "Decision call",
    status: "Open", ghlContactId: "ghl-c-024", ghlOpportunityId: "ghl-o-024", ghlTaskId: "ghl-t-024",
    ghlConversationId: "ghl-cv-024", ghlActivityType: "Follow-Up Call", ghlAssignedUser: "Mike T.",
    ghlDueDate: "Jan 11, 2025", ghlLastContactDate: "Jan 9, 2025", ghlSyncStatus: "Synced",
    commHistory: [
      { date: "Jan 9, 2025", channel: "Call", user: "Mike T.", outcome: "Connected", notes: "Reviewing proposal with business partner, decision by Jan 11."},
    ],
    notes: "Remodeling business, $4,100/mo proposal pending co-owner approval.",
  },
  {
    id: "FU-025", contact: "Priya Kapoor", businessName: "Kapoor Medical Spa",
    relatedRecord: "Lead #LD-0471", relatedType: "Lead", followUpType: "SMS",
    assignedRep: "Sarah K.", priority: "High", dueDate: "Today", lastContact: "Never",
    ghlActivityStatus: "Not Started", currentStage: "New Lead", nextAction: "Intro SMS",
    status: "Due Today", ghlContactId: "ghl-c-025", ghlOpportunityId: "", ghlTaskId: "ghl-t-025",
    ghlConversationId: "", ghlActivityType: "SMS", ghlAssignedUser: "Sarah K.",
    ghlDueDate: "Jan 11, 2025", ghlLastContactDate: "", ghlSyncStatus: "Not Connected",
    commHistory: [],
    notes: "High-value med spa lead from referral program.",
  },
  // Completed records
  {
    id: "FU-026", contact: "Karl Jensen", businessName: "Jensen Auto Body",
    relatedRecord: "Proposal #PR-2371", relatedType: "Proposal", followUpType: "Proposal Follow-Up",
    assignedRep: "Mike T.", priority: "High", dueDate: "Jan 4, 2025", lastContact: "Jan 4, 2025",
    ghlActivityStatus: "Completed", currentStage: "Proposal Approved", nextAction: "Initiate handoff",
    status: "Completed", ghlContactId: "ghl-c-026", ghlOpportunityId: "ghl-o-026", ghlTaskId: "ghl-t-026",
    ghlConversationId: "ghl-cv-026", ghlActivityType: "Follow-Up", ghlAssignedUser: "Mike T.",
    ghlDueDate: "Jan 4, 2025", ghlLastContactDate: "Jan 4, 2025", ghlSyncStatus: "Synced",
    commHistory: [
      { date: "Jan 4, 2025", channel: "Call", user: "Mike T.", outcome: "Connected", notes: "Deal signed. Moving to onboarding."},
    ],
    notes: "Closed deal — $3,600/mo. Handed to AM team.",
  },
  {
    id: "FU-027", contact: "Brittany Owens", businessName: "Owens Insurance",
    relatedRecord: "Lead #LD-0312", relatedType: "Lead", followUpType: "Discovery Reminder",
    assignedRep: "Jordan M.", priority: "Medium", dueDate: "Jan 3, 2025", lastContact: "Jan 3, 2025",
    ghlActivityStatus: "Completed", currentStage: "Discovery", nextAction: "Move to qualified",
    status: "Completed", ghlContactId: "ghl-c-027", ghlOpportunityId: "ghl-o-027", ghlTaskId: "ghl-t-027",
    ghlConversationId: "ghl-cv-027", ghlActivityType: "Appointment", ghlAssignedUser: "Jordan M.",
    ghlDueDate: "Jan 3, 2025", ghlLastContactDate: "Jan 3, 2025", ghlSyncStatus: "Synced",
    commHistory: [
      { date: "Jan 3, 2025", channel: "Meeting", user: "Jordan M.", outcome: "Connected", notes: "Discovery complete. Strong fit, moving to proposal stage."},
    ],
    notes: "Insurance agency, 3 agents. Discovery successful — proceeding to audit.",
  },
  {
    id: "FU-028", contact: "Leon Carver", businessName: "Carver Construction",
    relatedRecord: "Opportunity #OP-0766", relatedType: "Opportunity", followUpType: "Negotiation Follow-Up",
    assignedRep: "Sarah K.", priority: "High", dueDate: "Jan 2, 2025", lastContact: "Jan 2, 2025",
    ghlActivityStatus: "Completed", currentStage: "Proposal Approved", nextAction: "Schedule kickoff",
    status: "Completed", ghlContactId: "ghl-c-028", ghlOpportunityId: "ghl-o-028", ghlTaskId: "ghl-t-028",
    ghlConversationId: "ghl-cv-028", ghlActivityType: "Call", ghlAssignedUser: "Sarah K.",
    ghlDueDate: "Jan 2, 2025", ghlLastContactDate: "Jan 2, 2025", ghlSyncStatus: "Synced",
    commHistory: [
      { date: "Jan 2, 2025", channel: "Call", user: "Sarah K.", outcome: "Connected", notes: "Negotiation resolved. Signed at $5,100/mo."},
    ],
    notes: "Construction company — deal closed successfully.",
  },
  // Rescheduled
  {
    id: "FU-029", contact: "Gwen Price", businessName: "Price Hair Salon",
    relatedRecord: "Lead #LD-0388", relatedType: "Lead", followUpType: "Call",
    assignedRep: "Alex R.", priority: "Low", dueDate: "Jan 15, 2025", lastContact: "Jan 6, 2025",
    ghlActivityStatus: "Rescheduled", currentStage: "New Lead", nextAction: "Reschedule intro call",
    status: "Rescheduled", ghlContactId: "ghl-c-029", ghlOpportunityId: "", ghlTaskId: "ghl-t-029",
    ghlConversationId: "ghl-cv-029", ghlActivityType: "Call", ghlAssignedUser: "Alex R.",
    ghlDueDate: "Jan 15, 2025", ghlLastContactDate: "Jan 6, 2025", ghlSyncStatus: "Pending Sync",
    commHistory: [
      { date: "Jan 6, 2025", channel: "Call", user: "Alex R.", outcome: "Connected", notes: "Interested but traveling until Jan 15. Rescheduled."},
    ],
    notes: "Rescheduled per client request — traveling.",
  },
  {
    id: "FU-030", contact: "Shaun Hoffman", businessName: "Hoffman Logistics",
    relatedRecord: "Proposal #PR-2409", relatedType: "Proposal", followUpType: "Proposal Follow-Up",
    assignedRep: "Mike T.", priority: "Medium", dueDate: "Jan 16, 2025", lastContact: "Jan 7, 2025",
    ghlActivityStatus: "Rescheduled", currentStage: "Proposal Sent", nextAction: "Rescheduled follow-up call",
    status: "Rescheduled", ghlContactId: "ghl-c-030", ghlOpportunityId: "ghl-o-030", ghlTaskId: "ghl-t-030",
    ghlConversationId: "ghl-cv-030", ghlActivityType: "Follow-Up", ghlAssignedUser: "Mike T.",
    ghlDueDate: "Jan 16, 2025", ghlLastContactDate: "Jan 7, 2025", ghlSyncStatus: "Synced",
    commHistory: [
      { date: "Jan 7, 2025", channel: "Email", user: "Mike T.", outcome: "Replied", notes: "Client on vacation — asked to follow up Jan 16."},
    ],
    notes: "Rescheduled — client on vacation.",
  },
  // More open/upcoming
  {
    id: "FU-031", contact: "Nina Patel", businessName: "Patel Chiropractic",
    relatedRecord: "Lead #LD-0482", relatedType: "Lead", followUpType: "Call",
    assignedRep: "Jordan M.", priority: "Medium", dueDate: "Jan 12, 2025", lastContact: "Jan 6, 2025",
    ghlActivityStatus: "Pending", currentStage: "New Lead", nextAction: "Schedule discovery",
    status: "Open", ghlContactId: "ghl-c-031", ghlOpportunityId: "", ghlTaskId: "ghl-t-031",
    ghlConversationId: "ghl-cv-031", ghlActivityType: "Call", ghlAssignedUser: "Jordan M.",
    ghlDueDate: "Jan 12, 2025", ghlLastContactDate: "Jan 6, 2025", ghlSyncStatus: "Synced",
    commHistory: [
      { date: "Jan 6, 2025", channel: "Email", user: "Jordan M.", outcome: "Replied", notes: "Responded to cold email. Wants a call next week."},
    ],
    notes: "Chiropractic group, 3 locations.",
  },
  {
    id: "FU-032", contact: "Miles Donovan", businessName: "Donovan Printing",
    relatedRecord: "Audit #AU-0121", relatedType: "Audit", followUpType: "Audit Reminder",
    assignedRep: "Sarah K.", priority: "Low", dueDate: "Jan 13, 2025", lastContact: "Jan 4, 2025",
    ghlActivityStatus: "Pending", currentStage: "Audit Requested", nextAction: "Deliver audit",
    status: "Open", ghlContactId: "ghl-c-032", ghlOpportunityId: "ghl-o-032", ghlTaskId: "ghl-t-032",
    ghlConversationId: "ghl-cv-032", ghlActivityType: "Task", ghlAssignedUser: "Sarah K.",
    ghlDueDate: "Jan 13, 2025", ghlLastContactDate: "Jan 4, 2025", ghlSyncStatus: "Pending Sync",
    commHistory: [],
    notes: "Audit scope confirmed. Working on deliverables.",
  },
  {
    id: "FU-033", contact: "Lena Shaw", businessName: "Shaw Dermatology",
    relatedRecord: "Lead #LD-0499", relatedType: "Lead", followUpType: "Email",
    assignedRep: "Alex R.", priority: "Medium", dueDate: "Jan 14, 2025", lastContact: "Never",
    ghlActivityStatus: "Not Started", currentStage: "New Lead", nextAction: "Send intro email",
    status: "Open", ghlContactId: "ghl-c-033", ghlOpportunityId: "", ghlTaskId: "ghl-t-033",
    ghlConversationId: "", ghlActivityType: "Email", ghlAssignedUser: "Alex R.",
    ghlDueDate: "Jan 14, 2025", ghlLastContactDate: "", ghlSyncStatus: "Not Connected",
    commHistory: [],
    notes: "Dermatology practice — high-value healthcare niche.",
  },
  {
    id: "FU-034", contact: "Clint Warner", businessName: "Warner Gym & Fitness",
    relatedRecord: "Opportunity #OP-0855", relatedType: "Opportunity", followUpType: "Meeting",
    assignedRep: "Mike T.", priority: "Medium", dueDate: "Jan 15, 2025", lastContact: "Jan 8, 2025",
    ghlActivityStatus: "Scheduled", currentStage: "Qualified", nextAction: "Present proposal",
    status: "Open", ghlContactId: "ghl-c-034", ghlOpportunityId: "ghl-o-034", ghlTaskId: "ghl-t-034",
    ghlConversationId: "ghl-cv-034", ghlActivityType: "Appointment", ghlAssignedUser: "Mike T.",
    ghlDueDate: "Jan 15, 2025", ghlLastContactDate: "Jan 8, 2025", ghlSyncStatus: "Synced",
    commHistory: [
      { date: "Jan 8, 2025", channel: "Call", user: "Mike T.", outcome: "Booked Meeting", notes: "Booked proposal presentation for Jan 15."},
    ],
    notes: "Gym chain, 4 locations. Strong digital presence needs.",
  },
  {
    id: "FU-035", contact: "Rachel Stone", businessName: "Stone Photography",
    relatedRecord: "Lead #LD-0506", relatedType: "Lead", followUpType: "Call",
    assignedRep: "Jordan M.", priority: "Low", dueDate: "Jan 16, 2025", lastContact: "Never",
    ghlActivityStatus: "Not Started", currentStage: "New Lead", nextAction: "Initial outreach",
    status: "Open", ghlContactId: "ghl-c-035", ghlOpportunityId: "", ghlTaskId: "ghl-t-035",
    ghlConversationId: "", ghlActivityType: "Call", ghlAssignedUser: "Jordan M.",
    ghlDueDate: "Jan 16, 2025", ghlLastContactDate: "", ghlSyncStatus: "Not Connected",
    commHistory: [],
    notes: "Wedding photography studio — local SEO potential.",
  },
  {
    id: "FU-036", contact: "Arturo Reyes", businessName: "Reyes Landscaping",
    relatedRecord: "Affiliate Ref #AF-0072", relatedType: "Affiliate Referral", followUpType: "Affiliate Follow-Up",
    assignedRep: "Sarah K.", priority: "Medium", dueDate: "Jan 13, 2025", lastContact: "Jan 7, 2025",
    ghlActivityStatus: "Pending", currentStage: "New Lead", nextAction: "Discovery call",
    status: "Open", ghlContactId: "ghl-c-036", ghlOpportunityId: "", ghlTaskId: "ghl-t-036",
    ghlConversationId: "ghl-cv-036", ghlActivityType: "Call", ghlAssignedUser: "Sarah K.",
    ghlDueDate: "Jan 13, 2025", ghlLastContactDate: "Jan 7, 2025", ghlSyncStatus: "Pending Sync",
    commHistory: [
      { date: "Jan 7, 2025", channel: "Email", user: "Sarah K.", outcome: "Replied", notes: "Affiliate intro completed."},
    ],
    notes: "Landscaping referral. Commission: $700.",
  },
  {
    id: "FU-037", contact: "Tara Simms", businessName: "Simms Urgent Care",
    relatedRecord: "Proposal #PR-2428", relatedType: "Proposal", followUpType: "Proposal Follow-Up",
    assignedRep: "Alex R.", priority: "High", dueDate: "Jan 13, 2025", lastContact: "Jan 9, 2025",
    ghlActivityStatus: "Active", currentStage: "Proposal Sent", nextAction: "Decision call",
    status: "Open", ghlContactId: "ghl-c-037", ghlOpportunityId: "ghl-o-037", ghlTaskId: "ghl-t-037",
    ghlConversationId: "ghl-cv-037", ghlActivityType: "Follow-Up", ghlAssignedUser: "Alex R.",
    ghlDueDate: "Jan 13, 2025", ghlLastContactDate: "Jan 9, 2025", ghlSyncStatus: "Synced",
    commHistory: [
      { date: "Jan 9, 2025", channel: "Call", user: "Alex R.", outcome: "Connected", notes: "Reviewing proposal with partners, decision next week."},
    ],
    notes: "Urgent care chain, 2 locations. Proposal: $4,800/mo.",
  },
  {
    id: "FU-038", contact: "Dion Winters", businessName: "Winters Mortgage",
    relatedRecord: "Lead #LD-0516", relatedType: "Lead", followUpType: "Discovery Reminder",
    assignedRep: "Mike T.", priority: "Medium", dueDate: "Jan 14, 2025", lastContact: "Jan 5, 2025",
    ghlActivityStatus: "Scheduled", currentStage: "Discovery", nextAction: "Complete discovery call",
    status: "Open", ghlContactId: "ghl-c-038", ghlOpportunityId: "", ghlTaskId: "ghl-t-038",
    ghlConversationId: "ghl-cv-038", ghlActivityType: "Appointment", ghlAssignedUser: "Mike T.",
    ghlDueDate: "Jan 14, 2025", ghlLastContactDate: "Jan 5, 2025", ghlSyncStatus: "Synced",
    commHistory: [
      { date: "Jan 5, 2025", channel: "Call", user: "Mike T.", outcome: "Booked Meeting", notes: "Booked discovery for Jan 14."},
    ],
    notes: "Mortgage broker — strong PPC interest.",
  },
  {
    id: "FU-039", contact: "Sophie Grant", businessName: "Grant Pediatrics",
    relatedRecord: "Lead #LD-0524", relatedType: "Lead", followUpType: "Email",
    assignedRep: "Jordan M.", priority: "Low", dueDate: "Jan 15, 2025", lastContact: "Never",
    ghlActivityStatus: "Not Started", currentStage: "New Lead", nextAction: "Intro email",
    status: "Open", ghlContactId: "ghl-c-039", ghlOpportunityId: "", ghlTaskId: "ghl-t-039",
    ghlConversationId: "", ghlActivityType: "Email", ghlAssignedUser: "Jordan M.",
    ghlDueDate: "Jan 15, 2025", ghlLastContactDate: "", ghlSyncStatus: "Not Connected",
    commHistory: [],
    notes: "Pediatric practice — healthcare niche prospect.",
  },
  {
    id: "FU-040", contact: "Will Bauer", businessName: "Bauer Electrical",
    relatedRecord: "Opportunity #OP-0867", relatedType: "Opportunity", followUpType: "Call",
    assignedRep: "Sarah K.", priority: "High", dueDate: "Today", lastContact: "Jan 9, 2025",
    ghlActivityStatus: "Active", currentStage: "Negotiation", nextAction: "Price agreement call",
    status: "Due Today", ghlContactId: "ghl-c-040", ghlOpportunityId: "ghl-o-040", ghlTaskId: "ghl-t-040",
    ghlConversationId: "ghl-cv-040", ghlActivityType: "Call", ghlAssignedUser: "Sarah K.",
    ghlDueDate: "Jan 11, 2025", ghlLastContactDate: "Jan 9, 2025", ghlSyncStatus: "Synced",
    commHistory: [
      { date: "Jan 9, 2025", channel: "Call", user: "Sarah K.", outcome: "Connected", notes: "Final negotiation round. Client at $2,800, we're at $3,200."},
    ],
    notes: "Key negotiation call today — close gap with bundling.",
  },
  // Additional records to hit 60
  {
    id: "FU-041", contact: "Ana Trevino", businessName: "Trevino Wellness", relatedRecord: "Lead #LD-0531", relatedType: "Lead", followUpType: "Call", assignedRep: "Alex R.", priority: "Low", dueDate: "Jan 16, 2025", lastContact: "Never", ghlActivityStatus: "Not Started", currentStage: "New Lead", nextAction: "Outreach call", status: "Open", ghlContactId: "ghl-c-041", ghlOpportunityId: "", ghlTaskId: "ghl-t-041", ghlConversationId: "", ghlActivityType: "Call", ghlAssignedUser: "Alex R.", ghlDueDate: "Jan 16, 2025", ghlLastContactDate: "", ghlSyncStatus: "Not Connected", commHistory: [], notes: "Wellness studio — new lead from web form.",
  },
  {
    id: "FU-042", contact: "Greg Novak", businessName: "Novak Pool Service", relatedRecord: "Audit #AU-0129", relatedType: "Audit", followUpType: "Audit Reminder", assignedRep: "Mike T.", priority: "Medium", dueDate: "Jan 12, 2025", lastContact: "Jan 5, 2025", ghlActivityStatus: "Pending", currentStage: "Audit Requested", nextAction: "Deliver audit report", status: "Open", ghlContactId: "ghl-c-042", ghlOpportunityId: "ghl-o-042", ghlTaskId: "ghl-t-042", ghlConversationId: "ghl-cv-042", ghlActivityType: "Task", ghlAssignedUser: "Mike T.", ghlDueDate: "Jan 12, 2025", ghlLastContactDate: "Jan 5, 2025", ghlSyncStatus: "Pending Sync", commHistory: [], notes: "Audit in progress.",
  },
  {
    id: "FU-043", contact: "Kylie Fenton", businessName: "Fenton Travel", relatedRecord: "Lead #LD-0539", relatedType: "Lead", followUpType: "Email", assignedRep: "Jordan M.", priority: "Low", dueDate: "Jan 17, 2025", lastContact: "Never", ghlActivityStatus: "Not Started", currentStage: "New Lead", nextAction: "Intro email", status: "Open", ghlContactId: "ghl-c-043", ghlOpportunityId: "", ghlTaskId: "ghl-t-043", ghlConversationId: "", ghlActivityType: "Email", ghlAssignedUser: "Jordan M.", ghlDueDate: "Jan 17, 2025", ghlLastContactDate: "", ghlSyncStatus: "Not Connected", commHistory: [], notes: "Travel agency — tourism vertical.",
  },
  {
    id: "FU-044", contact: "Hector Ruiz", businessName: "Ruiz Tire & Auto", relatedRecord: "Opportunity #OP-0878", relatedType: "Opportunity", followUpType: "Call", assignedRep: "Sarah K.", priority: "Medium", dueDate: "Jan 11, 2025", lastContact: "Jan 7, 2025", ghlActivityStatus: "Active", currentStage: "Qualified", nextAction: "Send proposal", status: "Open", ghlContactId: "ghl-c-044", ghlOpportunityId: "ghl-o-044", ghlTaskId: "ghl-t-044", ghlConversationId: "ghl-cv-044", ghlActivityType: "Follow-Up", ghlAssignedUser: "Sarah K.", ghlDueDate: "Jan 11, 2025", ghlLastContactDate: "Jan 7, 2025", ghlSyncStatus: "Synced", commHistory: [{ date: "Jan 7, 2025", channel: "Call", user: "Sarah K.", outcome: "Connected", notes: "Qualification done, proposal ready to send."}], notes: "Auto shop, qualified. Proposal pending.",
  },
  {
    id: "FU-045", contact: "Mel Castro", businessName: "Castro Architecture", relatedRecord: "Affiliate Ref #AF-0081", relatedType: "Affiliate Referral", followUpType: "Affiliate Follow-Up", assignedRep: "Alex R.", priority: "High", dueDate: "Today", lastContact: "Jan 8, 2025", ghlActivityStatus: "Active", currentStage: "Discovery", nextAction: "Book discovery", status: "Due Today", ghlContactId: "ghl-c-045", ghlOpportunityId: "", ghlTaskId: "ghl-t-045", ghlConversationId: "ghl-cv-045", ghlActivityType: "Appointment", ghlAssignedUser: "Alex R.", ghlDueDate: "Jan 11, 2025", ghlLastContactDate: "Jan 8, 2025", ghlSyncStatus: "Synced", commHistory: [{ date: "Jan 8, 2025", channel: "Email", user: "Alex R.", outcome: "Replied", notes: "Warm affiliate referral confirmed."}], notes: "Architecture firm referral. Commission: $1,100.",
  },
  {
    id: "FU-046", contact: "Perry Hunt", businessName: "Hunt Orthodontics", relatedRecord: "Proposal #PR-2435", relatedType: "Proposal", followUpType: "Proposal Follow-Up", assignedRep: "Mike T.", priority: "High", dueDate: "Jan 10, 2025", lastContact: "Jan 6, 2025", ghlActivityStatus: "Overdue", currentStage: "Proposal Sent", nextAction: "Follow-up call", status: "Overdue", ghlContactId: "ghl-c-046", ghlOpportunityId: "ghl-o-046", ghlTaskId: "ghl-t-046", ghlConversationId: "ghl-cv-046", ghlActivityType: "Follow-Up", ghlAssignedUser: "Mike T.", ghlDueDate: "Jan 10, 2025", ghlLastContactDate: "Jan 6, 2025", ghlSyncStatus: "Synced", commHistory: [{ date: "Jan 6, 2025", channel: "Email", user: "Mike T.", outcome: "Replied", notes: "Proposal sent, acknowledged."}], notes: "Orthodontics practice, 3 locations.",
  },
  {
    id: "FU-047", contact: "Denise Fox", businessName: "Fox Cleaning Services", relatedRecord: "Lead #LD-0547", relatedType: "Lead", followUpType: "SMS", assignedRep: "Jordan M.", priority: "Low", dueDate: "Jan 14, 2025", lastContact: "Never", ghlActivityStatus: "Not Started", currentStage: "New Lead", nextAction: "Intro SMS", status: "Open", ghlContactId: "ghl-c-047", ghlOpportunityId: "", ghlTaskId: "ghl-t-047", ghlConversationId: "", ghlActivityType: "SMS", ghlAssignedUser: "Jordan M.", ghlDueDate: "Jan 14, 2025", ghlLastContactDate: "", ghlSyncStatus: "Not Connected", commHistory: [], notes: "Cleaning company — inbound lead.",
  },
  {
    id: "FU-048", contact: "Oscar Dunn", businessName: "Dunn Security Systems", relatedRecord: "Opportunity #OP-0889", relatedType: "Opportunity", followUpType: "Negotiation Follow-Up", assignedRep: "Sarah K.", priority: "High", dueDate: "Jan 9, 2025", lastContact: "Jan 6, 2025", ghlActivityStatus: "Overdue", currentStage: "Negotiation", nextAction: "Final negotiation", status: "Overdue", ghlContactId: "ghl-c-048", ghlOpportunityId: "ghl-o-048", ghlTaskId: "ghl-t-048", ghlConversationId: "ghl-cv-048", ghlActivityType: "Call", ghlAssignedUser: "Sarah K.", ghlDueDate: "Jan 9, 2025", ghlLastContactDate: "Jan 6, 2025", ghlSyncStatus: "Sync Failed", commHistory: [{ date: "Jan 6, 2025", channel: "Call", user: "Sarah K.", outcome: "Connected", notes: "Down to final terms."}], notes: "Security company negotiation stalled.",
  },
  {
    id: "FU-049", contact: "Faye Lin", businessName: "Lin Dermatology", relatedRecord: "Lead #LD-0558", relatedType: "Lead", followUpType: "Call", assignedRep: "Alex R.", priority: "Medium", dueDate: "Jan 13, 2025", lastContact: "Jan 3, 2025", ghlActivityStatus: "Pending", currentStage: "New Lead", nextAction: "Schedule discovery", status: "Open", ghlContactId: "ghl-c-049", ghlOpportunityId: "", ghlTaskId: "ghl-t-049", ghlConversationId: "ghl-cv-049", ghlActivityType: "Call", ghlAssignedUser: "Alex R.", ghlDueDate: "Jan 13, 2025", ghlLastContactDate: "Jan 3, 2025", ghlSyncStatus: "Pending Sync", commHistory: [{ date: "Jan 3, 2025", channel: "Email", user: "Alex R.", outcome: "Replied", notes: "Expressed interest, wants to schedule call."}], notes: "Dermatology clinic — healthcare target.",
  },
  {
    id: "FU-050", contact: "Todd Harvey", businessName: "Harvey Landscaping", relatedRecord: "Affiliate Ref #AF-0088", relatedType: "Affiliate Referral", followUpType: "Affiliate Follow-Up", assignedRep: "Mike T.", priority: "Medium", dueDate: "Jan 14, 2025", lastContact: "Jan 8, 2025", ghlActivityStatus: "Pending", currentStage: "New Lead", nextAction: "Intro call", status: "Open", ghlContactId: "ghl-c-050", ghlOpportunityId: "", ghlTaskId: "ghl-t-050", ghlConversationId: "ghl-cv-050", ghlActivityType: "Call", ghlAssignedUser: "Mike T.", ghlDueDate: "Jan 14, 2025", ghlLastContactDate: "Jan 8, 2025", ghlSyncStatus: "Pending Sync", commHistory: [{ date: "Jan 8, 2025", channel: "Email", user: "Mike T.", outcome: "Replied", notes: "Affiliate referral confirmed."}], notes: "Landscaping referral. Commission: $600.",
  },
  {
    id: "FU-051", contact: "Yolanda Chen", businessName: "Chen Wellness Studio", relatedRecord: "Lead #LD-0562", relatedType: "Lead", followUpType: "Discovery Reminder", assignedRep: "Jordan M.", priority: "Medium", dueDate: "Jan 11, 2025", lastContact: "Jan 4, 2025", ghlActivityStatus: "Pending", currentStage: "Discovery", nextAction: "Confirm discovery", status: "Open", ghlContactId: "ghl-c-051", ghlOpportunityId: "", ghlTaskId: "ghl-t-051", ghlConversationId: "ghl-cv-051", ghlActivityType: "Appointment", ghlAssignedUser: "Jordan M.", ghlDueDate: "Jan 11, 2025", ghlLastContactDate: "Jan 4, 2025", ghlSyncStatus: "Synced", commHistory: [{ date: "Jan 4, 2025", channel: "Call", user: "Jordan M.", outcome: "Booked Meeting", notes: "Booked discovery."}], notes: "Wellness studio discovery scheduled.",
  },
  {
    id: "FU-052", contact: "Bert Walsh", businessName: "Walsh Painting", relatedRecord: "Lead #LD-0571", relatedType: "Lead", followUpType: "Email", assignedRep: "Sarah K.", priority: "Low", dueDate: "Jan 15, 2025", lastContact: "Never", ghlActivityStatus: "Not Started", currentStage: "New Lead", nextAction: "Intro email", status: "Open", ghlContactId: "ghl-c-052", ghlOpportunityId: "", ghlTaskId: "ghl-t-052", ghlConversationId: "", ghlActivityType: "Email", ghlAssignedUser: "Sarah K.", ghlDueDate: "Jan 15, 2025", ghlLastContactDate: "", ghlSyncStatus: "Not Connected", commHistory: [], notes: "Painting contractor — inbound.",
  },
  {
    id: "FU-053", contact: "Rosa Estes", businessName: "Estes Family Dental", relatedRecord: "Proposal #PR-2441", relatedType: "Proposal", followUpType: "Proposal Follow-Up", assignedRep: "Alex R.", priority: "High", dueDate: "Jan 12, 2025", lastContact: "Jan 8, 2025", ghlActivityStatus: "Active", currentStage: "Proposal Sent", nextAction: "Decision call", status: "Open", ghlContactId: "ghl-c-053", ghlOpportunityId: "ghl-o-053", ghlTaskId: "ghl-t-053", ghlConversationId: "ghl-cv-053", ghlActivityType: "Follow-Up", ghlAssignedUser: "Alex R.", ghlDueDate: "Jan 12, 2025", ghlLastContactDate: "Jan 8, 2025", ghlSyncStatus: "Synced", commHistory: [{ date: "Jan 8, 2025", channel: "Call", user: "Alex R.", outcome: "Connected", notes: "Proposal sent and acknowledged."}], notes: "Dental group, proposal $2,900/mo.",
  },
  {
    id: "FU-054", contact: "Evan Kirk", businessName: "Kirk Bakeries", relatedRecord: "Lead #LD-0579", relatedType: "Lead", followUpType: "Call", assignedRep: "Mike T.", priority: "Low", dueDate: "Jan 16, 2025", lastContact: "Never", ghlActivityStatus: "Not Started", currentStage: "New Lead", nextAction: "Cold outreach", status: "Open", ghlContactId: "ghl-c-054", ghlOpportunityId: "", ghlTaskId: "ghl-t-054", ghlConversationId: "", ghlActivityType: "Call", ghlAssignedUser: "Mike T.", ghlDueDate: "Jan 16, 2025", ghlLastContactDate: "", ghlSyncStatus: "Not Connected", commHistory: [], notes: "Bakery chain — local SEO opportunity.",
  },
  {
    id: "FU-055", contact: "Fiona Bell", businessName: "Bell Interior Design", relatedRecord: "Audit #AU-0134", relatedType: "Audit", followUpType: "Audit Reminder", assignedRep: "Jordan M.", priority: "Medium", dueDate: "Jan 13, 2025", lastContact: "Jan 6, 2025", ghlActivityStatus: "Pending", currentStage: "Audit Requested", nextAction: "Present audit", status: "Open", ghlContactId: "ghl-c-055", ghlOpportunityId: "ghl-o-055", ghlTaskId: "ghl-t-055", ghlConversationId: "ghl-cv-055", ghlActivityType: "Task", ghlAssignedUser: "Jordan M.", ghlDueDate: "Jan 13, 2025", ghlLastContactDate: "Jan 6, 2025", ghlSyncStatus: "Pending Sync", commHistory: [], notes: "Interior design audit scope confirmed.",
  },
  {
    id: "FU-056", contact: "Kirk Bowman", businessName: "Bowman Accounting", relatedRecord: "Lead #LD-0588", relatedType: "Lead", followUpType: "SMS", assignedRep: "Sarah K.", priority: "Low", dueDate: "Jan 14, 2025", lastContact: "Never", ghlActivityStatus: "Not Started", currentStage: "New Lead", nextAction: "Intro SMS", status: "Open", ghlContactId: "ghl-c-056", ghlOpportunityId: "", ghlTaskId: "ghl-t-056", ghlConversationId: "", ghlActivityType: "SMS", ghlAssignedUser: "Sarah K.", ghlDueDate: "Jan 14, 2025", ghlLastContactDate: "", ghlSyncStatus: "Not Connected", commHistory: [], notes: "Accounting firm — uncontacted.",
  },
  {
    id: "FU-057", contact: "Vera Nguyen", businessName: "Nguyen Events", relatedRecord: "Affiliate Ref #AF-0094", relatedType: "Affiliate Referral", followUpType: "Affiliate Follow-Up", assignedRep: "Alex R.", priority: "Medium", dueDate: "Jan 15, 2025", lastContact: "Jan 9, 2025", ghlActivityStatus: "Active", currentStage: "New Lead", nextAction: "Discovery call", status: "Open", ghlContactId: "ghl-c-057", ghlOpportunityId: "", ghlTaskId: "ghl-t-057", ghlConversationId: "ghl-cv-057", ghlActivityType: "Appointment", ghlAssignedUser: "Alex R.", ghlDueDate: "Jan 15, 2025", ghlLastContactDate: "Jan 9, 2025", ghlSyncStatus: "Synced", commHistory: [{ date: "Jan 9, 2025", channel: "Email", user: "Alex R.", outcome: "Replied", notes: "Referral confirmed by affiliate."}], notes: "Events company referral. Commission: $500.",
  },
  {
    id: "FU-058", contact: "Cal Marsh", businessName: "Marsh Veterinary", relatedRecord: "Opportunity #OP-0901", relatedType: "Opportunity", followUpType: "Meeting", assignedRep: "Mike T.", priority: "Medium", dueDate: "Jan 16, 2025", lastContact: "Jan 8, 2025", ghlActivityStatus: "Scheduled", currentStage: "Discovery", nextAction: "Discovery meeting", status: "Open", ghlContactId: "ghl-c-058", ghlOpportunityId: "ghl-o-058", ghlTaskId: "ghl-t-058", ghlConversationId: "ghl-cv-058", ghlActivityType: "Appointment", ghlAssignedUser: "Mike T.", ghlDueDate: "Jan 16, 2025", ghlLastContactDate: "Jan 8, 2025", ghlSyncStatus: "Synced", commHistory: [{ date: "Jan 8, 2025", channel: "Call", user: "Mike T.", outcome: "Booked Meeting", notes: "Discovery meeting booked."}], notes: "Vet clinic, 2 locations.",
  },
  {
    id: "FU-059", contact: "Dana Ross", businessName: "Ross Tutoring Center", relatedRecord: "Lead #LD-0596", relatedType: "Lead", followUpType: "Email", assignedRep: "Jordan M.", priority: "Low", dueDate: "Jan 17, 2025", lastContact: "Never", ghlActivityStatus: "Not Started", currentStage: "New Lead", nextAction: "Intro email", status: "Open", ghlContactId: "ghl-c-059", ghlOpportunityId: "", ghlTaskId: "ghl-t-059", ghlConversationId: "", ghlActivityType: "Email", ghlAssignedUser: "Jordan M.", ghlDueDate: "Jan 17, 2025", ghlLastContactDate: "", ghlSyncStatus: "Not Connected", commHistory: [], notes: "Tutoring chain — education vertical.",
  },
  {
    id: "FU-060", contact: "Mark Eden", businessName: "Eden Pest Management", relatedRecord: "Proposal #PR-2448", relatedType: "Proposal", followUpType: "Proposal Follow-Up", assignedRep: "Sarah K.", priority: "High", dueDate: "Jan 13, 2025", lastContact: "Jan 9, 2025", ghlActivityStatus: "Active", currentStage: "Negotiation", nextAction: "Close call", status: "Open", ghlContactId: "ghl-c-060", ghlOpportunityId: "ghl-o-060", ghlTaskId: "ghl-t-060", ghlConversationId: "ghl-cv-060", ghlActivityType: "Follow-Up", ghlAssignedUser: "Sarah K.", ghlDueDate: "Jan 13, 2025", ghlLastContactDate: "Jan 9, 2025", ghlSyncStatus: "Synced", commHistory: [{ date: "Jan 9, 2025", channel: "Call", user: "Sarah K.", outcome: "Connected", notes: "In final negotiation."}], notes: "Pest control chain — close this week.",
  },
];

const STALLED_OPPORTUNITIES: StalledOpportunity[] = [
  { id: "SO-001", opportunity: "Harbor Auto Group — Multi-Location SEO",  stage: "Negotiation",    daysSinceActivity: 12, salesRep: "Mike T.",   dealValue: "$4,800/mo", nextAction: "Price compromise call"},
  { id: "SO-002", opportunity: "Precision Auto Repair — Google Ads",      stage: "Negotiation",    daysSinceActivity: 9,  salesRep: "Sarah K.",  dealValue: "$3,200/mo", nextAction: "Final offer presentation"},
  { id: "SO-003", opportunity: "Cascade Flooring — Digital Package",       stage: "Audit Requested",daysSinceActivity: 8,  salesRep: "Alex R.",   dealValue: "$2,600/mo", nextAction: "Deliver audit results"},
  { id: "SO-004", opportunity: "Dunn Security Systems — Local SEO",        stage: "Negotiation",    daysSinceActivity: 5,  salesRep: "Sarah K.",  dealValue: "$2,100/mo", nextAction: "Negotiation close call"},
  { id: "SO-005", opportunity: "Metro Dental Group — Full Service",        stage: "Discovery",      daysSinceActivity: 13, salesRep: "Jordan M.", dealValue: "$3,900/mo", nextAction: "Reschedule discovery call"},
  { id: "SO-006", opportunity: "Cruz Pest Control — Google Ads + SEO",     stage: "Proposal Sent",  daysSinceActivity: 4,  salesRep: "Sarah K.",  dealValue: "$2,900/mo", nextAction: "Follow-up call after voicemail"},
];

const PROPOSAL_FOLLOW_UPS: ProposalFollowUp[] = [
  { id: "PF-001", proposal: "Summit Landscaping — SEO Bundle",         client: "James Thornton",  sentDate: "Jan 5, 2025",  viewed: true,  daysSinceSent: 6,  salesRep: "Jordan M.", nextAction: "Call for decision"},
  { id: "PF-002", proposal: "Skyline Roofing — Full Digital Package",  client: "Paul Mignone",    sentDate: "Jan 3, 2025",  viewed: true,  daysSinceSent: 8,  salesRep: "Mike T.",   nextAction: "Push for decision"},
  { id: "PF-003", proposal: "Coastal Kitchen & Bath — SEO + PPC",      client: "Frank DiNapoli",  sentDate: "Jan 8, 2025",  viewed: false, daysSinceSent: 3,  salesRep: "Mike T.",   nextAction: "Confirm receipt and review timeline"},
  { id: "PF-004", proposal: "Cruz Pest Control — Google Ads",          client: "Ivan Cruz",       sentDate: "Jan 5, 2025",  viewed: true,  daysSinceSent: 6,  salesRep: "Sarah K.",  nextAction: "Push for signature"},
  { id: "PF-005", proposal: "Alderman Remodeling — Local SEO",         client: "Rick Alderman",   sentDate: "Jan 7, 2025",  viewed: true,  daysSinceSent: 4,  salesRep: "Mike T.",   nextAction: "Decision call — co-owner review complete"},
  { id: "PF-006", proposal: "Nguyen HVAC — Digital Marketing Bundle",  client: "Dave Nguyen",     sentDate: "Jan 3, 2025",  viewed: true,  daysSinceSent: 8,  salesRep: "Sarah K.",  nextAction: "Revised proposal call"},
  { id: "PF-007", proposal: "Simms Urgent Care — Full Service",        client: "Tara Simms",      sentDate: "Jan 7, 2025",  viewed: true,  daysSinceSent: 4,  salesRep: "Alex R.",   nextAction: "Partner review follow-up"},
  { id: "PF-008", proposal: "Hunt Orthodontics — SEO Bundle",          client: "Perry Hunt",      sentDate: "Jan 4, 2025",  viewed: false, daysSinceSent: 7,  salesRep: "Mike T.",   nextAction: "Confirm viewed status"},
];

const AFFILIATE_REFERRALS: AffiliateReferral[] = [
  { id: "AR-001", referral: "Pacific Realty Group",    affiliate: "TopProducer Network", leadStage: "Discovery",  assignedRep: "Jordan M.", followUpDue: "Today",          commissionPotential: "$1,200", nextAction: "Book discovery call"},
  { id: "AR-002", referral: "Blake Financial",         affiliate: "BizGrowth Partners",  leadStage: "Discovery",  assignedRep: "Jordan M.", followUpDue: "Jan 9, 2025",    commissionPotential: "$1,500", nextAction: "Overdue — call now"},
  { id: "AR-003", referral: "Harlow Orthodontics",     affiliate: "MarketPro Affiliates",leadStage: "New Lead",   assignedRep: "Alex R.",   followUpDue: "Jan 12, 2025",   commissionPotential: "$850",   nextAction: "Intro call this week"},
  { id: "AR-004", referral: "Castro Architecture",     affiliate: "DesignNet Referrals", leadStage: "Discovery",  assignedRep: "Alex R.",   followUpDue: "Today",          commissionPotential: "$1,100", nextAction: "Discovery booking today"},
  { id: "AR-005", referral: "Reyes Landscaping",       affiliate: "LocalBiz Connect",    leadStage: "New Lead",   assignedRep: "Sarah K.",  followUpDue: "Jan 13, 2025",   commissionPotential: "$700",   nextAction: "Schedule discovery"},
  { id: "AR-006", referral: "Nathan Blake Financial",  affiliate: "WealthNet Partners",  leadStage: "Discovery",  assignedRep: "Jordan M.", followUpDue: "Jan 15, 2025",   commissionPotential: "$900",   nextAction: "Discovery call"},
  { id: "AR-007", referral: "Harvey Landscaping",      affiliate: "GreenThumb Network",  leadStage: "New Lead",   assignedRep: "Mike T.",   followUpDue: "Jan 14, 2025",   commissionPotential: "$600",   nextAction: "Intro call"},
  { id: "AR-008", referral: "Nguyen Events",           affiliate: "EventsHub Affiliates",leadStage: "New Lead",   assignedRep: "Alex R.",   followUpDue: "Jan 15, 2025",   commissionPotential: "$500",   nextAction: "Discovery booking"},
];

//  Badge Helpers 

function statusVariant(status: FollowUpStatus) {
  switch (status) {
    case "Completed": return "success";
    case "Due Today": return "warning";
    case "Overdue":   return "error";
    case "Rescheduled": return "pending";
    case "Cancelled": return "neutral";
    default:          return "info";
  }
}

function priorityBadge(priority: Priority) {
  const styles: Record<Priority, { bg: string; color: string; border: string }> = {
    High:   { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA"},
    Medium: { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A"},
    Low:    { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0"},
  };
  const s = styles[priority];
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border"style={{ background: s.bg, color: s.color, borderColor: s.border }}>
      {priority}
    </span>
  );
}

function ghlSyncBadge(syncStatus: GhlSyncStatus) {
  const styles: Record<GhlSyncStatus, { bg: string; color: string; border: string; dot: string }> = {
    "Synced":           { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0", dot: "#10B981"},
    "Pending Sync":     { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A", dot: "#F59E0B"},
    "Sync Failed":      { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", dot: "#EF4444"},
    "Manual Override":  { bg: "#F5F3FF", color: "#7C3AED", border: "#DDD6FE", dot: "#8B5CF6"},
    "Not Connected":    { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0", dot: "#94A3B8"},
  };
  const s = styles[syncStatus];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border"style={{ background: s.bg, color: s.color, borderColor: s.border }}>
      <span className="w-1.5 h-1.5 rounded-full"style={{ background: s.dot }} />
      {syncStatus}
    </span>
  );
}

function relatedTypeBadge(type: RelatedType) {
  const styles: Record<RelatedType, { bg: string; color: string }> = {
    "Lead":              { bg: "#EFF6FF", color: "#1D4ED8"},
    "Opportunity":       { bg: "#F0FDF4", color: "#15803D"},
    "Audit":             { bg: "#FFF7ED", color: "#C2410C"},
    "Proposal":          { bg: "#FDF4FF", color: "#7E22CE"},
    "Handoff":           { bg: "#ECFDF5", color: "#065F46"},
    "Affiliate Referral":{ bg: "#FFF1F2", color: "#BE123C"},
  };
  const s = styles[type];
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"style={{ background: s.bg, color: s.color }}>
      {type}
    </span>
  );
}

function commOutcomeBadge(outcome: CommOutcome) {
  const map: Record<CommOutcome, "success"|"error"|"warning"|"info"|"neutral"|"pending"> = {
    "Connected": "success", "No Answer": "neutral", "Left Voicemail": "pending",
    "Replied": "info", "Booked Meeting": "success", "Requested Proposal": "info", "Not Interested": "error",
  };
  return <StatusBadge variant={map[outcome]} label={outcome} size="sm"/>;
}

function channelIcon(ch: CommChannel) {
  const icons: Record<CommChannel, string> = {
    Call: "", Email: "", SMS: "", Meeting: "", Voicemail: "", "No Answer": "",
  };
  return icons[ch];
}

//  Drawer 

function FollowUpDrawer({ fu, onClose }: { fu: FollowUp; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end"style={{ background: "rgba(15,28,56,0.35)"}} onClick={onClose}>
      <div
        className="relative flex flex-col w-full max-w-2xl h-full overflow-y-auto"style={{ background: "var(--rtm-surface)", boxShadow: "-4px 0 24px rgba(15,28,56,0.12)"}}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-0.5"style={{ color: workspace.accentColor }}>Follow-Up Detail</p>
            <h2 className="text-lg font-bold"style={{ color: "var(--rtm-text-primary)"}}>{fu.contact}</h2>
            <p className="text-sm"style={{ color: "var(--rtm-text-secondary)"}}>{fu.businessName}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-colors hover:bg-gray-100"style={{ color: "var(--rtm-text-muted)"}} aria-label="Close"></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Overview */}
          <div className="rounded-xl border p-4 space-y-3"style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)"}}>
            <h3 className="text-xs font-bold uppercase tracking-widest"style={{ color: "var(--rtm-text-muted)"}}>Follow-Up Overview</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Follow-Up ID", fu.id],
                ["Type", fu.followUpType],
                ["Status", null],
                ["Priority", null],
                ["Assigned Rep", fu.assignedRep],
                ["Due Date", fu.dueDate],
                ["Last Contact", fu.lastContact],
                ["Current Stage", fu.currentStage],
                ["Next Action", fu.nextAction],
              ].map(([label, val]) => (
                <div key={label as string}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide"style={{ color: "var(--rtm-text-muted)"}}>{label}</p>
                  {label === "Status"? <div className="mt-1"><StatusBadge variant={statusVariant(fu.status)} label={fu.status} size="sm"/></div>
                  : label === "Priority"? <div className="mt-1">{priorityBadge(fu.priority)}</div>
                  : <p className="mt-0.5 font-medium"style={{ color: "var(--rtm-text-primary)"}}>{val}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Contact & Related */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border p-4 space-y-2"style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)"}}>
              <h3 className="text-xs font-bold uppercase tracking-widest"style={{ color: "var(--rtm-text-muted)"}}>Contact Information</h3>
              <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{fu.contact}</p>
              <p className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{fu.businessName}</p>
              <p className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>GHL Contact ID: {fu.ghlContactId || "—"}</p>
            </div>
            <div className="rounded-xl border p-4 space-y-2"style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)"}}>
              <h3 className="text-xs font-bold uppercase tracking-widest"style={{ color: "var(--rtm-text-muted)"}}>Related Record</h3>
              <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{fu.relatedRecord}</p>
              <div>{relatedTypeBadge(fu.relatedType)}</div>
              {fu.relatedType === "Lead" && <Link href="/sales/leads" className="text-xs font-semibold" style={{ color: workspace.accentColor }}>View Lead →</Link>}
              {fu.relatedType === "Opportunity" && <Link href="/sales/pipeline" className="text-xs font-semibold" style={{ color: workspace.accentColor }}>View Pipeline →</Link>}
              {fu.relatedType === "Proposal" && <Link href="/sales/proposals" className="text-xs font-semibold" style={{ color: workspace.accentColor }}>View Proposal →</Link>}
            </div>
          </div>

          {/* GHL Activity */}
          <div className="rounded-xl border p-4 space-y-3"style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)"}}>
            <h3 className="text-xs font-bold uppercase tracking-widest"style={{ color: "var(--rtm-text-muted)"}}>GHL Activity</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["GHL Opportunity ID", fu.ghlOpportunityId || "—"],
                ["GHL Task ID", fu.ghlTaskId || "—"],
                ["GHL Conversation ID", fu.ghlConversationId || "—"],
                ["GHL Activity Type", fu.ghlActivityType],
                ["GHL Activity Status", fu.ghlActivityStatus],
                ["GHL Assigned User", fu.ghlAssignedUser],
                ["GHL Due Date", fu.ghlDueDate || "—"],
                ["GHL Last Contact", fu.ghlLastContactDate || "—"],
              ].map(([label, val]) => (
                <div key={label as string}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide"style={{ color: "var(--rtm-text-muted)"}}>{label}</p>
                  <p className="mt-0.5 font-medium text-sm"style={{ color: "var(--rtm-text-primary)"}}>{val}</p>
                </div>
              ))}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide"style={{ color: "var(--rtm-text-muted)"}}>GHL Sync Status</p>
                <div className="mt-1">{ghlSyncBadge(fu.ghlSyncStatus)}</div>
              </div>
            </div>
          </div>

          {/* Communication History */}
          <div className="rounded-xl border p-4 space-y-3"style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)"}}>
            <h3 className="text-xs font-bold uppercase tracking-widest"style={{ color: "var(--rtm-text-muted)"}}>Communication History</h3>
            {fu.commHistory.length === 0 ? (
              <p className="text-sm"style={{ color: "var(--rtm-text-muted)"}}>No communication history yet.</p>
            ) : (
              <div className="space-y-3">
                {fu.commHistory.map((c, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-base"style={{ background: "var(--rtm-blue-xlight)"}}>
                      {channelIcon(c.channel)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{c.date}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded font-medium"style={{ background: "var(--rtm-blue-xlight)", color: "var(--rtm-blue)"}}>{c.channel}</span>
                        <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>{c.user}</span>
                        {commOutcomeBadge(c.outcome)}
                      </div>
                      <p className="mt-1 text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{c.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Next Steps & Notes */}
          <div className="rounded-xl border p-4 space-y-2"style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)"}}>
            <h3 className="text-xs font-bold uppercase tracking-widest"style={{ color: "var(--rtm-text-muted)"}}>Next Steps & Notes</h3>
            <div className="flex items-start gap-2">
              
              <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{fu.nextAction}</p>
            </div>
            {fu.notes && (
              <p className="text-sm pl-7"style={{ color: "var(--rtm-text-secondary)"}}>{fu.notes}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {["Mark Complete", "Reschedule", "Log Call", "Send Email", "Send SMS", "Create Task", "Add Note"].map((action) => (
              <button key={action} className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors hover:bg-gray-50"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)"}}>
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

//  Main Page 

const CATEGORY_TABS = ["All", "Today", "Overdue", "Uncontacted Leads", "Proposal Follow-Ups", "Discovery", "Negotiation", "Affiliate Referrals", "Completed"] as const;
type CategoryTab = typeof CATEGORY_TABS[number];

const TABLE_SECTION_TABS = ["Queue", "Stalled Opportunities", "Proposal Follow-Ups", "Affiliate Referrals"] as const;
type TableSectionTab = typeof TABLE_SECTION_TABS[number];

export default function SalesFollowupsPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryTab>("All");
  const [activeSection, setActiveSection] = useState<TableSectionTab>("Queue");
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUp | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // KPI computations
  const dueToday      = FOLLOW_UPS.filter((f) => f.status === "Due Today").length;
  const overdue       = FOLLOW_UPS.filter((f) => f.status === "Overdue").length;
  const uncontacted   = FOLLOW_UPS.filter((f) => f.lastContact === "Never"&& f.status !== "Completed").length;
  const proposalFups  = FOLLOW_UPS.filter((f) => f.followUpType === "Proposal Follow-Up"&& f.status !== "Completed").length;
  const stalled       = STALLED_OPPORTUNITIES.length;
  const meetingsSchd  = FOLLOW_UPS.filter((f) => f.followUpType === "Meeting"&& f.status === "Open").length;
  const completedWk   = FOLLOW_UPS.filter((f) => f.status === "Completed").length;
  const ghlSynced     = FOLLOW_UPS.filter((f) => f.ghlSyncStatus === "Synced").length;

  // Filter logic
  const filteredFollowUps = FOLLOW_UPS.filter((f) => {
    const matchesSearch =
      searchQuery === ""||
      f.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.relatedRecord.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    switch (activeCategory) {
      case "Today":            return f.status === "Due Today";
      case "Overdue":          return f.status === "Overdue";
      case "Uncontacted Leads":return f.lastContact === "Never"&& f.status !== "Completed";
      case "Proposal Follow-Ups": return f.followUpType === "Proposal Follow-Up";
      case "Discovery":        return f.followUpType === "Discovery Reminder";
      case "Negotiation":      return f.followUpType === "Negotiation Follow-Up";
      case "Affiliate Referrals": return f.relatedType === "Affiliate Referral";
      case "Completed":        return f.status === "Completed";
      default:                 return true;
    }
  });

  const kpiCards = [
    { title: "Due Today",           value: String(dueToday),    subtitle: "Need action now",           icon: "", iconBg: "#FFFBEB", iconColor: "#B45309", trend: "up"as const,   trendValue: "+3"},
    { title: "Overdue Follow-Ups",  value: String(overdue),     subtitle: "Past due date",             icon: "", iconBg: "#FEF2F2", iconColor: "#DC2626", trend: "up"as const,   trendValue: "+5"},
    { title: "Uncontacted Leads",   value: String(uncontacted), subtitle: "Never reached",             icon: "", iconBg: "#EFF6FF", iconColor: "#1D4ED8", trend: "down"as const, trendValue: "-2"},
    { title: "Proposal Follow-Ups", value: String(proposalFups),subtitle: "Awaiting decision",        icon: "", iconBg: "#FDF4FF", iconColor: "#7E22CE", trend: "neutral"as const,trendValue: "→ 0"},
    { title: "Stalled Opportunities",value: String(stalled),   subtitle: "No recent activity",        icon: "", iconBg: "#FFF7ED", iconColor: "#C2410C", trend: "down"as const, trendValue: "-1"},
    { title: "Meetings Scheduled",  value: String(meetingsSchd),subtitle: "Upcoming this week",       icon: "", iconBg: "#ECFDF5", iconColor: "#065F46", trend: "up"as const,   trendValue: "+2"},
    { title: "Completed This Week", value: String(completedWk), subtitle: "Closed follow-ups",        icon: "", iconBg: "#F0FDF4", iconColor: "#16A34A", trend: "up"as const,   trendValue: "+4"},
    { title: "GHL Activities Synced",value: String(ghlSynced), subtitle: "Last sync: 2h ago",        icon: "", iconBg: "#EFF6FF", iconColor: "#1D4ED8", trend: "neutral"as const,trendValue: "→ 0"},
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: workspace.accentColor }}>Sales</p>
          <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>Follow-Up Command Center</h1>
          <p className="text-sm mt-1"style={{ color: "var(--rtm-text-secondary)"}}>
            Manage calls, emails, SMS, meetings, reminders, proposal follow-ups, and stalled opportunities.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="rtm-btn-primary text-sm px-3 py-1.5 inline-flex items-center gap-1.5"> New Follow-Up</button>
          <button className="rtm-btn-secondary text-sm px-3 py-1.5 inline-flex items-center gap-1.5"> Log Call</button>
          <button className="rtm-btn-secondary text-sm px-3 py-1.5 inline-flex items-center gap-1.5"> Schedule Meeting</button>
          <button className="rtm-btn-secondary text-sm px-3 py-1.5 inline-flex items-center gap-1.5"> Create Task</button>
          <button className="rtm-btn-secondary text-sm px-3 py-1.5 inline-flex items-center gap-1.5"> Sync GHL</button>
          <button className="rtm-btn-secondary text-sm px-3 py-1.5 inline-flex items-center gap-1.5"> Export</button>
        </div>
      </div>

      {/* Route-ready integration links */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "Pipeline", href: "/sales/pipeline"},
          { label: "Leads",    href: "/sales/leads"},
          { label: "Proposals",href: "/sales/proposals"},
          { label: "Tasks",    href: "/tasks"},
          { label: "Notifications", href: "/notifications"},
        ].map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors hover:bg-gray-50"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)", background: "var(--rtm-surface)"}}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {kpiCards.map((k) => (
          <KpiCard
            key={k.title}
            title={k.title}
            value={k.value}
            subtitle={k.subtitle}
            trend={k.trend}
            trendValue={k.trendValue}
            trendLabel="vs last week"icon={<span className="text-xl">{k.icon}</span>}
            iconBg={k.iconBg}
            iconColor={k.iconColor}
          />
        ))}
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1 p-1 rounded-xl border"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)"}}>
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveCategory(tab)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"style={{
              background: activeCategory === tab ? "var(--rtm-surface)": "transparent",
              color: activeCategory === tab ? workspace.accentColor : "var(--rtm-text-muted)",
              boxShadow: activeCategory === tab ? "0 1px 3px rgba(15,28,56,0.08)": "none",
            }}
          >
            {tab}
            {tab === "Overdue"&& overdue > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold"style={{ background: "#FEF2F2", color: "#DC2626"}}>{overdue}</span>
            )}
            {tab === "Today"&& dueToday > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold"style={{ background: "#FFFBEB", color: "#B45309"}}>{dueToday}</span>
            )}
          </button>
        ))}
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1 p-1 rounded-xl border w-fit"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)"}}>
        {TABLE_SECTION_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSection(tab)}
            className="px-4 py-2 rounded-lg text-xs font-semibold transition-colors"style={{
              background: activeSection === tab ? workspace.accentColor : "transparent",
              color: activeSection === tab ? "#fff": "var(--rtm-text-muted)",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/*  Follow-Up Queue  */}
      {activeSection === "Queue"&& (
        <SectionWrapper
          title={`Follow-Up Queue (${filteredFollowUps.length})`}
          description={`${activeCategory} · showing ${filteredFollowUps.length} of ${FOLLOW_UPS.length} records`}
          actions={
            <input
              type="text"placeholder="Search contacts, businesses…"value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 rounded-lg border text-xs w-56"style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)", color: "var(--rtm-text-primary)"}}
            />
          }
          noPadding
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1400px]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--rtm-border-light)", background: "var(--rtm-bg)"}}>
                  {["Contact / Client","Business","Related Record","Type","Follow-Up Type","Rep","Priority","Due Date","Last Contact","GHL Sync","Stage","Status","Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide whitespace-nowrap"style={{ color: "var(--rtm-text-muted)"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredFollowUps.map((fu, i) => (
                  <tr
                    key={fu.id}
                    style={{
                      borderBottom: "1px solid var(--rtm-border-light)",
                      background: i % 2 === 0 ? "var(--rtm-surface)": "var(--rtm-bg)",
                    }}
                    className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-semibold text-sm"style={{ color: "var(--rtm-text-primary)"}}>{fu.contact}</p>
                      <p className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>{fu.id}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-sm"style={{ color: "var(--rtm-text-secondary)"}}>{fu.businessName}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-xs font-medium"style={{ color: "var(--rtm-text-secondary)"}}>{fu.relatedRecord}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{relatedTypeBadge(fu.relatedType)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs font-medium"style={{ color: "var(--rtm-text-secondary)"}}>{fu.followUpType}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs font-medium"style={{ color: "var(--rtm-text-secondary)"}}>{fu.assignedRep}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{priorityBadge(fu.priority)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs font-semibold"style={{ color: fu.dueDate === "Today"? "#B45309": fu.status === "Overdue"? "#DC2626": "var(--rtm-text-secondary)"}}>{fu.dueDate}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs"style={{ color: fu.lastContact === "Never"? "#DC2626": "var(--rtm-text-muted)"}}>{fu.lastContact}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{ghlSyncBadge(fu.ghlSyncStatus)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs font-medium"style={{ color: "var(--rtm-text-secondary)"}}>{fu.currentStage}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge variant={statusVariant(fu.status)} label={fu.status} size="sm"/>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedFollowUp(fu)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors hover:bg-gray-100"style={{ borderColor: workspace.accentColor, color: workspace.accentColor }}
                        >
                          View
                        </button>
                        <button className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors hover:bg-gray-100"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-muted)"}}>
                          
                        </button>
                        <button className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors hover:bg-gray-100"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-muted)"}}>
                          
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredFollowUps.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16"style={{ color: "var(--rtm-text-muted)"}}>
                
                <p className="text-sm font-semibold">No follow-ups found</p>
                <p className="text-xs mt-1">Try adjusting your category filter or search query.</p>
              </div>
            )}
          </div>
        </SectionWrapper>
      )}

      {/*  Stalled Opportunities  */}
      {activeSection === "Stalled Opportunities"&& (
        <SectionWrapper
          title={`Stalled Opportunities (${STALLED_OPPORTUNITIES.length})`}
          description="Opportunities with no recent activity — need immediate follow-up"noPadding
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--rtm-border-light)", background: "var(--rtm-bg)"}}>
                  {["Opportunity","Stage","Days Stalled","Sales Rep","Deal Value","Next Action","Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide"style={{ color: "var(--rtm-text-muted)"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STALLED_OPPORTUNITIES.map((so, i) => (
                  <tr key={so.id} style={{ borderBottom: "1px solid var(--rtm-border-light)", background: i % 2 === 0 ? "var(--rtm-surface)": "var(--rtm-bg)"}} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-sm"style={{ color: "var(--rtm-text-primary)"}}>{so.opportunity}</p>
                      <p className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>{so.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"style={{ background: "#FFF7ED", color: "#C2410C"}}>{so.stage}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-sm"style={{ color: so.daysSinceActivity > 10 ? "#DC2626": "#B45309"}}>{so.daysSinceActivity}d</span>
                    </td>
                    <td className="px-4 py-3 text-sm"style={{ color: "var(--rtm-text-secondary)"}}>{so.salesRep}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-sm"style={{ color: workspace.accentColor }}>{so.dealValue}</span>
                    </td>
                    <td className="px-4 py-3 text-sm"style={{ color: "var(--rtm-text-secondary)"}}>{so.nextAction}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors hover:bg-gray-100"style={{ borderColor: workspace.accentColor, color: workspace.accentColor }}>Create Follow-Up</button>
                        <Link href="/sales/pipeline" className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors hover:bg-gray-100 inline-flex items-center" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-muted)" }}>Pipeline</Link>
                        <button className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors hover:bg-gray-100"style={{ borderColor: "#FEF2F2", color: "#DC2626"}}>Escalate</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionWrapper>
      )}

      {/*  Proposal Follow-Ups  */}
      {activeSection === "Proposal Follow-Ups"&& (
        <SectionWrapper
          title={`Proposal Follow-Ups (${PROPOSAL_FOLLOW_UPS.length})`}
          description="Track sent proposals and push for decisions"noPadding
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--rtm-border-light)", background: "var(--rtm-bg)"}}>
                  {["Proposal","Client","Sent Date","Viewed","Days Since Sent","Sales Rep","Next Action","Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide"style={{ color: "var(--rtm-text-muted)"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PROPOSAL_FOLLOW_UPS.map((pf, i) => (
                  <tr key={pf.id} style={{ borderBottom: "1px solid var(--rtm-border-light)", background: i % 2 === 0 ? "var(--rtm-surface)": "var(--rtm-bg)"}} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-sm"style={{ color: "var(--rtm-text-primary)"}}>{pf.proposal}</p>
                      <p className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>{pf.id}</p>
                    </td>
                    <td className="px-4 py-3 text-sm"style={{ color: "var(--rtm-text-secondary)"}}>{pf.client}</td>
                    <td className="px-4 py-3 text-xs"style={{ color: "var(--rtm-text-muted)"}}>{pf.sentDate}</td>
                    <td className="px-4 py-3">
                      {pf.viewed
                        ? <StatusBadge variant="success"label="Viewed"size="sm"/>
                        : <StatusBadge variant="neutral"label="Not Viewed"size="sm"/>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-sm"style={{ color: pf.daysSinceSent > 7 ? "#DC2626": pf.daysSinceSent > 4 ? "#B45309": "var(--rtm-text-primary)"}}>{pf.daysSinceSent}d</span>
                    </td>
                    <td className="px-4 py-3 text-sm"style={{ color: "var(--rtm-text-secondary)"}}>{pf.salesRep}</td>
                    <td className="px-4 py-3 text-sm"style={{ color: "var(--rtm-text-secondary)"}}>{pf.nextAction}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors hover:bg-gray-100"style={{ borderColor: workspace.accentColor, color: workspace.accentColor }}>Log Follow-Up</button>
                        <Link href="/sales/proposals" className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors hover:bg-gray-100 inline-flex items-center" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-muted)" }}>Proposal</Link>
                        <button className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors hover:bg-gray-100"style={{ borderColor: "var(--rtm-border)", color: "#7E22CE"}}>→ Negotiation</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionWrapper>
      )}

      {/*  Affiliate Referral Follow-Ups  */}
      {activeSection === "Affiliate Referrals"&& (
        <SectionWrapper
          title={`Affiliate Referral Follow-Ups (${AFFILIATE_REFERRALS.length})`}
          description="Follow up on affiliate-sourced referrals and track commission potential"noPadding
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--rtm-border-light)", background: "var(--rtm-bg)"}}>
                  {["Referral","Affiliate","Lead Stage","Assigned Rep","Follow-Up Due","Commission","Next Action","Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide"style={{ color: "var(--rtm-text-muted)"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {AFFILIATE_REFERRALS.map((ar, i) => (
                  <tr key={ar.id} style={{ borderBottom: "1px solid var(--rtm-border-light)", background: i % 2 === 0 ? "var(--rtm-surface)": "var(--rtm-bg)"}} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-sm"style={{ color: "var(--rtm-text-primary)"}}>{ar.referral}</p>
                      <p className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>{ar.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"style={{ background: "#FFF1F2", color: "#BE123C"}}>{ar.affiliate}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"style={{ background: "#EFF6FF", color: "#1D4ED8"}}>{ar.leadStage}</span>
                    </td>
                    <td className="px-4 py-3 text-sm"style={{ color: "var(--rtm-text-secondary)"}}>{ar.assignedRep}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold"style={{ color: ar.followUpDue === "Today"? "#B45309": "var(--rtm-text-secondary)"}}>{ar.followUpDue}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-sm"style={{ color: workspace.accentColor }}>{ar.commissionPotential}</span>
                    </td>
                    <td className="px-4 py-3 text-sm"style={{ color: "var(--rtm-text-secondary)"}}>{ar.nextAction}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Link href="/sales/affiliates" className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors hover:bg-gray-100 inline-flex items-center" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-muted)" }}>Affiliate</Link>
                        <Link href="/sales/leads" className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors hover:bg-gray-100 inline-flex items-center" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-muted)" }}>Lead</Link>
                        <button className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors hover:bg-gray-100"style={{ borderColor: workspace.accentColor, color: workspace.accentColor }}>Follow-Up</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionWrapper>
      )}

      {/*  Integration Callouts  */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Pipeline */}
        <SectionWrapper
          title="Pipeline Integration"description="View stalled and active opportunities"actions={<Link href="/sales/pipeline" className="text-xs font-semibold" style={{ color: workspace.accentColor }}>Open Pipeline →</Link>}
        >
          <div className="space-y-2">
            {[
              { label: "Negotiation",     value: "$4,800/mo", prob: "75%", close: "Jan 20"},
              { label: "Proposal Sent",   value: "$3,400/mo", prob: "55%", close: "Jan 15"},
              { label: "Discovery",       value: "$2,900/mo", prob: "30%", close: "Feb 1"},
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between p-2.5 rounded-lg border"style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)"}}>
                <div>
                  <p className="text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{row.label}</p>
                  <p className="text-[11px]"style={{ color: "var(--rtm-text-muted)"}}>Close: {row.close} · {row.prob}</p>
                </div>
                <span className="text-xs font-bold"style={{ color: workspace.accentColor }}>{row.value}</span>
              </div>
            ))}
          </div>
        </SectionWrapper>

        {/* Leads */}
        <SectionWrapper
          title="Leads Integration"description="Uncontacted and active leads"actions={<Link href="/sales/leads" className="text-xs font-semibold" style={{ color: workspace.accentColor }}>View Leads →</Link>}
        >
          <div className="space-y-2">
            {[
              { label: "Green Valley Pools",   stage: "New Lead",  source: "Google Ads",    qual: "Unqualified"},
              { label: "Bloom Floral Studio",  stage: "New Lead",  source: "Facebook",      qual: "Unqualified"},
              { label: "Marks Spa & Wellness", stage: "Discovery", source: "Referral",      qual: "Qualified"},
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between p-2.5 rounded-lg border"style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)"}}>
                <div>
                  <p className="text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{row.label}</p>
                  <p className="text-[11px]"style={{ color: "var(--rtm-text-muted)"}}>{row.stage} · {row.source}</p>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"style={{ background: row.qual === "Qualified"? "#ECFDF5": "#FEF2F2", color: row.qual === "Qualified"? "#059669": "#DC2626"}}>{row.qual}</span>
              </div>
            ))}
          </div>
        </SectionWrapper>

        {/* Proposals */}
        <SectionWrapper
          title="Proposals Integration"description="Proposal status and follow-up needs"actions={<Link href="/sales/proposals" className="text-xs font-semibold" style={{ color: workspace.accentColor }}>View Proposals →</Link>}
        >
          <div className="space-y-2">
            {[
              { label: "Summit Landscaping SEO",     stage: "Proposal Sent", value: "$2,400/mo", viewed: true  },
              { label: "Skyline Roofing — Full",     stage: "Proposal Sent", value: "$6,200/mo", viewed: true  },
              { label: "Coastal Kitchen & Bath",     stage: "Proposal Sent", value: "$3,400/mo", viewed: false },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between p-2.5 rounded-lg border"style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)"}}>
                <div>
                  <p className="text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{row.label}</p>
                  <p className="text-[11px]"style={{ color: "var(--rtm-text-muted)"}}>{row.stage} · {row.viewed ? "Viewed": "Not viewed"}</p>
                </div>
                <span className="text-xs font-bold"style={{ color: workspace.accentColor }}>{row.value}</span>
              </div>
            ))}
          </div>
        </SectionWrapper>
      </div>

      {/*  Task & Notification Callouts  */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SectionWrapper
          title="Task Integration"description="Follow-up tasks linked to this queue"actions={<Link href="/tasks" className="text-xs font-semibold" style={{ color: workspace.accentColor }}>View All Tasks →</Link>}
        >
          <div className="space-y-2">
            {[
              "Call lead — Summit Landscaping (Due Today)",
              "Send proposal follow-up — Skyline Roofing (Overdue)",
              "Schedule discovery — Metro Dental Group (Overdue)",
              "Follow up on negotiation — Harbor Auto Group (Due Today)",
              "Verify affiliate referral — Pacific Realty (Due Today)",
            ].map((task) => (
              <div key={task} className="flex items-center gap-2.5 p-2.5 rounded-lg border"style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)"}}>
                
                <p className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{task}</p>
              </div>
            ))}
          </div>
        </SectionWrapper>

        <SectionWrapper
          title="Notification Center"description="Recent follow-up alerts and reminders"actions={<Link href="/notifications" className="text-xs font-semibold" style={{ color: workspace.accentColor }}>View All →</Link>}
        >
          <div className="space-y-2">
            {[
              { icon: "", text: "Follow-up overdue — Metro Dental Group (13d)",       variant: "error"as const },
              { icon: "", text: "Proposal follow-up needed — Skyline Roofing",        variant: "warning"as const },
              { icon: "", text: "Follow-up due today — Harbor Auto Group",             variant: "warning"as const },
              { icon: "", text: "Lead uncontacted 7+ days — Simmons Catering",        variant: "error"as const },
              { icon: "", text: "Opportunity stalled — Precision Auto Repair (9d)",   variant: "warning"as const },
            ].map((n, i) => (
              <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-lg border"style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)"}}>
                <span className="text-base flex-shrink-0">{n.icon}</span>
                <p className="text-xs flex-1"style={{ color: "var(--rtm-text-secondary)"}}>{n.text}</p>
                <StatusBadge variant={n.variant} label={n.variant === "error"? "Urgent": "Alert"} size="sm"/>
              </div>
            ))}
          </div>
        </SectionWrapper>
      </div>

      {/* Drawer */}
      {selectedFollowUp && (
        <FollowUpDrawer fu={selectedFollowUp} onClose={() => setSelectedFollowUp(null)} />
      )}
    </div>
  );
}