"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

// 
// TYPES
// 

type NotificationPriority = "Low"| "Medium"| "High"| "Urgent"| "Critical";
type NotificationStatus   = "Unread"| "Read"| "Acknowledged"| "Resolved"| "Escalated";

type NotificationType =
  | "Workflow"| "Task"| "Billing"| "Activation"| "Account Management"| "Department"| "Renewal"| "Cancellation"| "Offboarding"| "System";

type SourceModule =
  | "Workflow Engine"| "Task Engine"| "Client Portfolio"| "Billing"| "Activation"| "Account Management"| "Sales"| "Renewals"| "Cancellations"| "Offboarding"| "Admin";

type Department =
  | "Sales"| "Billing"| "Account Management"| "Operations"| "SEO"| "Paid Advertising"| "Content"| "Reporting"| "Admin"| "IT & Security";

interface Notification {
  id:           string;
  priority:     NotificationPriority;
  type:         NotificationType;
  title:        string;
  description:  string;
  client:       string;
  clientSlug:   string;
  department:   Department;
  assignedUser: string;
  sourceModule: SourceModule;
  createdDate:  string;
  status:       NotificationStatus;
  relatedRoute: string;
  /** If this notification is also an escalation */
  escalation?:  { level: number; daysOpen: number; trigger: string };
}

// 
// MOCK DATA — 100+ realistic notifications
// 

const MOCK_NOTIFICATIONS: Notification[] = [
  //  WORKFLOW 
  { id: "n-001", priority: "High",     type: "Workflow",          title: "Proposal Approved — Notify Billing",                    description: "Proposal for Horizon Dental approved. Billing must generate invoice.",            client: "Horizon Dental",        clientSlug: "horizon-dental",        department: "Billing",           assignedUser: "Sarah Chen",      sourceModule: "Workflow Engine",      createdDate: "2025-07-14", status: "Unread",       relatedRoute: "/admin/workflows"},
  { id: "n-002", priority: "High",     type: "Workflow",          title: "Invoice Paid — Notify Account Management",              description: "Invoice #INV-2241 paid by Blue Sky Dental. AM notified for onboarding.",          client: "Blue Sky Dental",       clientSlug: "blue-sky-dental",       department: "Account Management",assignedUser: "Marcus Webb",     sourceModule: "Workflow Engine",      createdDate: "2025-07-14", status: "Unread",       relatedRoute: "/admin/workflows"},
  { id: "n-003", priority: "Urgent",   type: "Workflow",          title: "Department Activation Pending — Notify Operations",     description: "SEO + GBP activation pending for Summit Law Group. No AM assigned yet.",          client: "Summit Law Group",      clientSlug: "summit-law-group",      department: "Operations",        assignedUser: "Jessica Reyes",   sourceModule: "Workflow Engine",      createdDate: "2025-07-13", status: "Unread",       relatedRoute: "/admin/workflows"},
  { id: "n-004", priority: "Critical", type: "Workflow",          title: "Renewal Due — Notify AM",                               description: "Apex Roofing renewal due in 28 days. AM action required immediately.",              client: "Apex Roofing",          clientSlug: "apex-roofing",          department: "Account Management",assignedUser: "Daniel Torres",   sourceModule: "Workflow Engine",      createdDate: "2025-07-13", status: "Escalated",    relatedRoute: "/renewals",       escalation: { level: 2, daysOpen: 5, trigger: "Renewal < 30 Days"} },
  { id: "n-005", priority: "High",     type: "Workflow",          title: "Cancellation Approved — Notify Billing + Operations",   description: "Cancellation approved for Metro Glass Co. Final invoice + offboarding initiated.", client: "Metro Glass Co",        clientSlug: "metro-glass-co",        department: "Billing",           assignedUser: "Sarah Chen",      sourceModule: "Workflow Engine",      createdDate: "2025-07-12", status: "Unread",       relatedRoute: "/billing/cancellations"},
  { id: "n-006", priority: "High",     type: "Workflow",          title: "Onboarding Started — Kickoff Pending",                  description: "Onboarding workflow triggered for Lakeview Chiropractic. Kickoff not scheduled.",  client: "Lakeview Chiropractic", clientSlug: "lakeview-chiropractic", department: "Account Management",assignedUser: "Priya Patel",     sourceModule: "Workflow Engine",      createdDate: "2025-07-12", status: "Read",         relatedRoute: "/account-management/onboarding"},
  { id: "n-007", priority: "Medium",   type: "Workflow",          title: "Proposal Rejected — Notify Sales",                      description: "Proposal for Valley HVAC rejected. Sales team follow-up required.",               client: "Valley HVAC",           clientSlug: "valley-hvac",           department: "Sales",             assignedUser: "James Kim",       sourceModule: "Workflow Engine",      createdDate: "2025-07-11", status: "Read",         relatedRoute: "/sales"},
  { id: "n-008", priority: "Medium",   type: "Workflow",          title: "Lead Assigned — New Prospect",                          description: "New lead Pacific Dental Group assigned to sales rep Ryan Adams.",                 client: "Pacific Dental Group",  clientSlug: "pacific-dental-group",  department: "Sales",             assignedUser: "Ryan Adams",      sourceModule: "Workflow Engine",      createdDate: "2025-07-11", status: "Unread",       relatedRoute: "/sales"},
  { id: "n-009", priority: "High",     type: "Workflow",          title: "Client Activated — AM Handoff Complete",                description: "Bright Path Financial activation complete. All departments live.",                 client: "Bright Path Financial", clientSlug: "bright-path-financial", department: "Account Management",assignedUser: "Marcus Webb",     sourceModule: "Workflow Engine",      createdDate: "2025-07-10", status: "Acknowledged", relatedRoute: "/billing/activation"},
  { id: "n-010", priority: "Urgent",   type: "Workflow",          title: "Offboarding Triggered — Action Required",               description: "Offboarding workflow started for Coastal Insurance. Access removal pending.",     client: "Coastal Insurance",     clientSlug: "coastal-insurance",     department: "Operations",        assignedUser: "Jessica Reyes",   sourceModule: "Workflow Engine",      createdDate: "2025-07-10", status: "Unread",       relatedRoute: "/cancellations/offboarding"},

  //  TASK 
  { id: "n-011", priority: "Urgent",   type: "Task",              title: "Task Overdue — SEO Audit for Ridgeline Roofing",        description: "Task 'Conduct SEO Technical Audit' is 9 days overdue. Assignee + Manager notified.", client: "Ridgeline Roofing",     clientSlug: "ridgeline-roofing",     department: "SEO",               assignedUser: "Tom Walsh",       sourceModule: "Task Engine",          createdDate: "2025-07-14", status: "Escalated",    relatedRoute: "/tasks",          escalation: { level: 1, daysOpen: 9, trigger: "Task Overdue > 7 Days"} },
  { id: "n-012", priority: "High",     type: "Task",              title: "Task Assigned — Meta Ads Campaign Setup",               description: "Meta Ads campaign setup task assigned to Lisa Park for Urban Fresh Market.",      client: "Urban Fresh Market",    clientSlug: "urban-fresh-market",    department: "Paid Advertising",  assignedUser: "Lisa Park",       sourceModule: "Task Engine",          createdDate: "2025-07-14", status: "Unread",       relatedRoute: "/tasks"},
  { id: "n-013", priority: "High",     type: "Task",              title: "Task Blocked — GBP Optimization Blocked",               description: "GBP profile optimization blocked pending client photo submission.",               client: "Gourmet Bistro",        clientSlug: "gourmet-bistro",        department: "SEO",               assignedUser: "Anika Ross",      sourceModule: "Task Engine",          createdDate: "2025-07-13", status: "Unread",       relatedRoute: "/tasks"},
  { id: "n-014", priority: "Medium",   type: "Task",              title: "Task Due Tomorrow — Monthly Reporting",                 description: "Monthly performance report for Horizon Dental due tomorrow.",                    client: "Horizon Dental",        clientSlug: "horizon-dental",        department: "Reporting",         assignedUser: "Chris Navarro",   sourceModule: "Task Engine",          createdDate: "2025-07-13", status: "Unread",       relatedRoute: "/tasks"},
  { id: "n-015", priority: "Critical", type: "Task",              title: "Dependency Blocked — Activation Chain Stalled",        description: "Activation task chain stalled. Department setup task depends on billing confirmation.", client: "Summit Law Group",   clientSlug: "summit-law-group",      department: "Operations",        assignedUser: "Jessica Reyes",   sourceModule: "Task Engine",          createdDate: "2025-07-13", status: "Escalated",    relatedRoute: "/tasks",          escalation: { level: 3, daysOpen: 3, trigger: "Activation Blocked"} },
  { id: "n-016", priority: "Medium",   type: "Task",              title: "Task Completed — Keyword Research Delivered",          description: "Keyword research for Lakeview Chiropractic completed. Requestor notified.",       client: "Lakeview Chiropractic", clientSlug: "lakeview-chiropractic", department: "SEO",               assignedUser: "Tom Walsh",       sourceModule: "Task Engine",          createdDate: "2025-07-12", status: "Read",         relatedRoute: "/tasks"},
  { id: "n-017", priority: "High",     type: "Task",              title: "Task Reassigned — Content Calendar",                   description: "Content calendar task reassigned from Kelly Brown to Maria Santos.",             client: "Pacific Dental Group",  clientSlug: "pacific-dental-group",  department: "Content",           assignedUser: "Maria Santos",    sourceModule: "Task Engine",          createdDate: "2025-07-12", status: "Read",         relatedRoute: "/tasks"},
  { id: "n-018", priority: "Urgent",   type: "Task",              title: "Task Overdue — Invoice Follow-up",                     description: "Invoice follow-up task 12 days overdue. Escalated to billing manager.",          client: "Metro Glass Co",        clientSlug: "metro-glass-co",        department: "Billing",           assignedUser: "Sarah Chen",      sourceModule: "Task Engine",          createdDate: "2025-07-11", status: "Escalated",    relatedRoute: "/tasks",          escalation: { level: 2, daysOpen: 12, trigger: "Task Overdue > 7 Days"} },
  { id: "n-019", priority: "Medium",   type: "Task",              title: "Task Due Today — LSA Campaign Review",                 description: "LSA campaign weekly review task due today for Blue Sky Dental.",                  client: "Blue Sky Dental",       clientSlug: "blue-sky-dental",       department: "Paid Advertising",  assignedUser: "Ryan Adams",      sourceModule: "Task Engine",          createdDate: "2025-07-14", status: "Unread",       relatedRoute: "/tasks"},
  { id: "n-020", priority: "Low",      type: "Task",              title: "Task Waiting — Design Assets Pending Client Feedback", description: "Web design mockups waiting on client feedback from Apex Roofing.",               client: "Apex Roofing",          clientSlug: "apex-roofing",          department: "Content",           assignedUser: "Kelly Brown",     sourceModule: "Task Engine",          createdDate: "2025-07-10", status: "Acknowledged", relatedRoute: "/tasks"},

  //  BILLING 
  { id: "n-021", priority: "Urgent",   type: "Billing",           title: "Invoice Overdue — 30 Days Outstanding",                description: "Invoice #INV-2198 for Valley HVAC is 30 days overdue. Collection follow-up needed.", client: "Valley HVAC",         clientSlug: "valley-hvac",           department: "Billing",           assignedUser: "Sarah Chen",      sourceModule: "Billing",              createdDate: "2025-07-14", status: "Escalated",    relatedRoute: "/billing/invoices",   escalation: { level: 2, daysOpen: 30, trigger: "Outstanding Balance > Threshold"} },
  { id: "n-022", priority: "High",     type: "Billing",           title: "Invoice Sent — Follow Up In 7 Days",                  description: "Invoice #INV-2245 sent to Pacific Dental Group for $3,200/month services.",       client: "Pacific Dental Group",  clientSlug: "pacific-dental-group",  department: "Billing",           assignedUser: "Sarah Chen",      sourceModule: "Billing",              createdDate: "2025-07-13", status: "Unread",       relatedRoute: "/billing/invoices"},
  { id: "n-023", priority: "Critical", type: "Billing",           title: "Billing Hold Placed — Activate Services Blocked",     description: "Billing hold on Summit Law Group blocks activation. Payment issue.",               client: "Summit Law Group",      clientSlug: "summit-law-group",      department: "Billing",           assignedUser: "Sarah Chen",      sourceModule: "Billing",              createdDate: "2025-07-13", status: "Unread",       relatedRoute: "/billing/invoices"},
  { id: "n-024", priority: "High",     type: "Billing",           title: "Refund Approval Needed",                              description: "Refund request from Coastal Insurance requires billing manager approval.",       client: "Coastal Insurance",     clientSlug: "coastal-insurance",     department: "Billing",           assignedUser: "Sarah Chen",      sourceModule: "Billing",              createdDate: "2025-07-12", status: "Unread",       relatedRoute: "/billing/invoices"},
  { id: "n-025", priority: "High",     type: "Billing",           title: "Final Invoice Needed — Offboarding Client",           description: "Metro Glass Co offboarding requires final invoice before account closure.",       client: "Metro Glass Co",        clientSlug: "metro-glass-co",        department: "Billing",           assignedUser: "Sarah Chen",      sourceModule: "Billing",              createdDate: "2025-07-12", status: "Unread",       relatedRoute: "/billing/invoices"},
  { id: "n-026", priority: "Medium",   type: "Billing",           title: "Payment Received — Account Updated",                  description: "Payment of $4,800 received from Bright Path Financial. Account current.",        client: "Bright Path Financial", clientSlug: "bright-path-financial", department: "Billing",           assignedUser: "Sarah Chen",      sourceModule: "Billing",              createdDate: "2025-07-11", status: "Read",         relatedRoute: "/billing/invoices"},
  { id: "n-027", priority: "Medium",   type: "Billing",           title: "Invoice Draft Created — Awaiting Approval",           description: "Monthly invoice draft for Ridgeline Roofing created. Pending approval.",          client: "Ridgeline Roofing",     clientSlug: "ridgeline-roofing",     department: "Billing",           assignedUser: "Sarah Chen",      sourceModule: "Billing",              createdDate: "2025-07-11", status: "Unread",       relatedRoute: "/billing/invoices"},
  { id: "n-028", priority: "Urgent",   type: "Billing",           title: "Collection Follow-Up Needed — 45 Days Overdue",       description: "Invoice #INV-2176 for Coastal Insurance is 45 days overdue. Escalated.",          client: "Coastal Insurance",     clientSlug: "coastal-insurance",     department: "Billing",           assignedUser: "Sarah Chen",      sourceModule: "Billing",              createdDate: "2025-07-10", status: "Escalated",    relatedRoute: "/billing/invoices",   escalation: { level: 3, daysOpen: 45, trigger: "Outstanding Balance > Threshold"} },
  { id: "n-029", priority: "Low",      type: "Billing",           title: "Cancellation Billing Review Needed",                  description: "Billing owner must review cancellation package for Valley HVAC.",                 client: "Valley HVAC",           clientSlug: "valley-hvac",           department: "Billing",           assignedUser: "Sarah Chen",      sourceModule: "Billing",              createdDate: "2025-07-09", status: "Acknowledged", relatedRoute: "/billing/cancellations"},
  { id: "n-030", priority: "Medium",   type: "Billing",           title: "Invoice Sent — Gourmet Bistro Monthly Services",      description: "Invoice #INV-2247 sent for Gourmet Bistro $2,400/month retainer.",                 client: "Gourmet Bistro",        clientSlug: "gourmet-bistro",        department: "Billing",           assignedUser: "Sarah Chen",      sourceModule: "Billing",              createdDate: "2025-07-09", status: "Read",         relatedRoute: "/billing/invoices"},

  //  ACTIVATION 
  { id: "n-031", priority: "High",     type: "Activation",        title: "AM Assignment Needed — New Client Onboarding",         description: "Lakeview Chiropractic onboarding started. No AM assigned.",                     client: "Lakeview Chiropractic", clientSlug: "lakeview-chiropractic", department: "Account Management",assignedUser: "Priya Patel",     sourceModule: "Activation",           createdDate: "2025-07-14", status: "Unread",       relatedRoute: "/billing/activation"},
  { id: "n-032", priority: "High",     type: "Activation",        title: "Kickoff Needed — Pacific Dental Group",                description: "Pacific Dental Group activation pending kickoff call scheduling.",              client: "Pacific Dental Group",  clientSlug: "pacific-dental-group",  department: "Account Management",assignedUser: "Marcus Webb",     sourceModule: "Activation",           createdDate: "2025-07-13", status: "Unread",       relatedRoute: "/account-management/onboarding"},
  { id: "n-033", priority: "Urgent",   type: "Activation",        title: "Activation Blocked — Pending Billing Confirmation",    description: "Summit Law Group activation blocked. Billing confirmation outstanding.",         client: "Summit Law Group",      clientSlug: "summit-law-group",      department: "Billing",           assignedUser: "Jessica Reyes",   sourceModule: "Activation",           createdDate: "2025-07-13", status: "Escalated",    relatedRoute: "/billing/activation", escalation: { level: 2, daysOpen: 4, trigger: "Activation Blocked"} },
  { id: "n-034", priority: "Medium",   type: "Activation",        title: "Department Activation Pending — SEO Team",             description: "SEO department activation task created for Blue Sky Dental.",                   client: "Blue Sky Dental",       clientSlug: "blue-sky-dental",       department: "SEO",               assignedUser: "Tom Walsh",       sourceModule: "Activation",           createdDate: "2025-07-12", status: "Unread",       relatedRoute: "/billing/activation"},
  { id: "n-035", priority: "High",     type: "Activation",        title: "Activation Task Created — Meta Ads Setup",             description: "Meta Ads activation task created for Urban Fresh Market. Assignee notified.",    client: "Urban Fresh Market",    clientSlug: "urban-fresh-market",    department: "Paid Advertising",  assignedUser: "Lisa Park",       sourceModule: "Activation",           createdDate: "2025-07-12", status: "Read",         relatedRoute: "/billing/activation"},
  { id: "n-036", priority: "Medium",   type: "Activation",        title: "Activation Completed — Bright Path Financial",         description: "All department activations confirmed for Bright Path Financial.",               client: "Bright Path Financial", clientSlug: "bright-path-financial", department: "Operations",        assignedUser: "Jessica Reyes",   sourceModule: "Activation",           createdDate: "2025-07-10", status: "Resolved",     relatedRoute: "/billing/activation"},

  //  ACCOUNT MANAGEMENT 
  { id: "n-037", priority: "High",     type: "Account Management",title: "Check-In Due — Apex Roofing",                          description: "Monthly check-in due with Apex Roofing. Last contact: 45 days ago.",             client: "Apex Roofing",          clientSlug: "apex-roofing",          department: "Account Management",assignedUser: "Daniel Torres",   sourceModule: "Account Management",   createdDate: "2025-07-14", status: "Unread",       relatedRoute: "/account-management/onboarding"},
  { id: "n-038", priority: "Urgent",   type: "Account Management",title: "Client Health At Risk — Immediate Retention Action",   description: "Ridgeline Roofing health score dropped to 32/100. Retention action required.",   client: "Ridgeline Roofing",     clientSlug: "ridgeline-roofing",     department: "Account Management",assignedUser: "Daniel Torres",   sourceModule: "Account Management",   createdDate: "2025-07-13", status: "Escalated",    relatedRoute: "/clients/ridgeline-roofing", escalation: { level: 2, daysOpen: 7, trigger: "Client Health Critical"} },
  { id: "n-039", priority: "High",     type: "Account Management",title: "QBR Due — Horizon Dental",                             description: "Quarterly Business Review scheduled for Horizon Dental. Prepare agenda.",         client: "Horizon Dental",        clientSlug: "horizon-dental",        department: "Account Management",assignedUser: "Priya Patel",     sourceModule: "Account Management",   createdDate: "2025-07-13", status: "Unread",       relatedRoute: "/account-management/onboarding"},
  { id: "n-040", priority: "Critical", type: "Account Management",title: "Client Escalation — Metro Glass Co",                   description: "Client escalation received from Metro Glass Co. Immediate leadership review.",    client: "Metro Glass Co",        clientSlug: "metro-glass-co",        department: "Account Management",assignedUser: "Marcus Webb",     sourceModule: "Account Management",   createdDate: "2025-07-12", status: "Escalated",    relatedRoute: "/clients/metro-glass-co", escalation: { level: 3, daysOpen: 2, trigger: "Client Escalation"} },
  { id: "n-041", priority: "High",     type: "Account Management",title: "Renewal Action Required — Summit Law Group",           description: "Summit Law Group renewal 60 days out. Renewal proposal required.",               client: "Summit Law Group",      clientSlug: "summit-law-group",      department: "Account Management",assignedUser: "Daniel Torres",   sourceModule: "Account Management",   createdDate: "2025-07-11", status: "Unread",       relatedRoute: "/renewals"},
  { id: "n-042", priority: "Medium",   type: "Account Management",title: "Check-In Completed — Gourmet Bistro",                  description: "Monthly check-in with Gourmet Bistro completed. Notes logged.",                  client: "Gourmet Bistro",        clientSlug: "gourmet-bistro",        department: "Account Management",assignedUser: "Priya Patel",     sourceModule: "Account Management",   createdDate: "2025-07-10", status: "Resolved",     relatedRoute: "/account-management/onboarding"},

  //  RENEWAL 
  { id: "n-043", priority: "Critical", type: "Renewal",           title: "Renewal Due In 28 Days — Apex Roofing",                description: "Apex Roofing contract expires July 12. Proposal overdue. Escalate to leadership.", client: "Apex Roofing",         clientSlug: "apex-roofing",          department: "Account Management",assignedUser: "Daniel Torres",   sourceModule: "Renewals",             createdDate: "2025-07-14", status: "Escalated",    relatedRoute: "/renewals",           escalation: { level: 3, daysOpen: 5, trigger: "Renewal < 30 Days"} },
  { id: "n-044", priority: "High",     type: "Renewal",           title: "Renewal Proposal Sent — Horizon Dental",               description: "90-day renewal proposal sent to Horizon Dental. Follow-up scheduled.",           client: "Horizon Dental",        clientSlug: "horizon-dental",        department: "Account Management",assignedUser: "Priya Patel",     sourceModule: "Renewals",             createdDate: "2025-07-13", status: "Acknowledged", relatedRoute: "/renewals"},
  { id: "n-045", priority: "High",     type: "Renewal",           title: "60-Day Renewal Alert — Summit Law Group",              description: "Summit Law Group renewal 60 days out. AM must initiate renewal conversation.",    client: "Summit Law Group",      clientSlug: "summit-law-group",      department: "Account Management",assignedUser: "Daniel Torres",   sourceModule: "Renewals",             createdDate: "2025-07-12", status: "Unread",       relatedRoute: "/renewals"},
  { id: "n-046", priority: "Medium",   type: "Renewal",           title: "90-Day Renewal Alert — Bright Path Financial",         description: "90-day renewal alert for Bright Path Financial. Begin retention strategy.",       client: "Bright Path Financial", clientSlug: "bright-path-financial", department: "Account Management",assignedUser: "Marcus Webb",     sourceModule: "Renewals",             createdDate: "2025-07-11", status: "Unread",       relatedRoute: "/renewals"},
  { id: "n-047", priority: "Low",      type: "Renewal",           title: "120-Day Renewal Alert — Blue Sky Dental",              description: "120-day early renewal alert for Blue Sky Dental. No immediate action needed.",   client: "Blue Sky Dental",       clientSlug: "blue-sky-dental",       department: "Account Management",assignedUser: "Daniel Torres",   sourceModule: "Renewals",             createdDate: "2025-07-10", status: "Read",         relatedRoute: "/renewals"},
  { id: "n-048", priority: "High",     type: "Renewal",           title: "Renewal Won — Gourmet Bistro",                         description: "Gourmet Bistro renewed for 12-month contract. AM notified. Billing updated.",    client: "Gourmet Bistro",        clientSlug: "gourmet-bistro",        department: "Account Management",assignedUser: "Priya Patel",     sourceModule: "Renewals",             createdDate: "2025-07-09", status: "Resolved",     relatedRoute: "/renewals"},
  { id: "n-049", priority: "Critical", type: "Renewal",           title: "Renewal Lost — Coastal Insurance",                     description: "Coastal Insurance did not renew. Offboarding workflow triggered.",               client: "Coastal Insurance",     clientSlug: "coastal-insurance",     department: "Account Management",assignedUser: "Marcus Webb",     sourceModule: "Renewals",             createdDate: "2025-07-08", status: "Escalated",    relatedRoute: "/renewals",           escalation: { level: 3, daysOpen: 6, trigger: "Renewal < 30 Days"} },
  { id: "n-050", priority: "High",     type: "Renewal",           title: "Renewal Proposal Needed — Valley HVAC",                description: "Valley HVAC renewal 45 days out. Proposal must be drafted by Friday.",          client: "Valley HVAC",           clientSlug: "valley-hvac",           department: "Account Management",assignedUser: "Daniel Torres",   sourceModule: "Renewals",             createdDate: "2025-07-07", status: "Unread",       relatedRoute: "/renewals"},

  //  CANCELLATION 
  { id: "n-051", priority: "High",     type: "Cancellation",      title: "Cancellation Requested — Coastal Insurance",           description: "Cancellation request submitted by Coastal Insurance. Review required.",         client: "Coastal Insurance",     clientSlug: "coastal-insurance",     department: "Account Management",assignedUser: "Marcus Webb",     sourceModule: "Cancellations",        createdDate: "2025-07-14", status: "Unread",       relatedRoute: "/billing/cancellations"},
  { id: "n-052", priority: "High",     type: "Cancellation",      title: "Billing Review Required — Metro Glass Co",             description: "Final billing review required for Metro Glass Co cancellation process.",         client: "Metro Glass Co",        clientSlug: "metro-glass-co",        department: "Billing",           assignedUser: "Sarah Chen",      sourceModule: "Cancellations",        createdDate: "2025-07-13", status: "Unread",       relatedRoute: "/billing/cancellations"},
  { id: "n-053", priority: "Medium",   type: "Cancellation",      title: "Cancellation Approved — Valley HVAC",                  description: "Cancellation approved for Valley HVAC effective Aug 1. Offboarding initiated.",  client: "Valley HVAC",           clientSlug: "valley-hvac",           department: "Operations",        assignedUser: "Jessica Reyes",   sourceModule: "Cancellations",        createdDate: "2025-07-12", status: "Acknowledged", relatedRoute: "/billing/cancellations"},
  { id: "n-054", priority: "Critical", type: "Cancellation",      title: "Cancellation Request — Urgent Retention Review",       description: "Ridgeline Roofing submitted cancellation. Leadership retention call required.",  client: "Ridgeline Roofing",     clientSlug: "ridgeline-roofing",     department: "Account Management",assignedUser: "Daniel Torres",   sourceModule: "Cancellations",        createdDate: "2025-07-11", status: "Escalated",    relatedRoute: "/billing/cancellations", escalation: { level: 3, daysOpen: 3, trigger: "Client Health Critical"} },

  //  OFFBOARDING 
  { id: "n-055", priority: "High",     type: "Offboarding",       title: "Offboarding Triggered — Metro Glass Co",               description: "Offboarding workflow started. All departments must complete shutdown tasks.",     client: "Metro Glass Co",        clientSlug: "metro-glass-co",        department: "Operations",        assignedUser: "Jessica Reyes",   sourceModule: "Offboarding",          createdDate: "2025-07-14", status: "Unread",       relatedRoute: "/cancellations/offboarding"},
  { id: "n-056", priority: "High",     type: "Offboarding",       title: "Access Removal Pending — Coastal Insurance",           description: "Access removal tasks pending for Coastal Insurance offboarding.",              client: "Coastal Insurance",     clientSlug: "coastal-insurance",     department: "IT & Security",     assignedUser: "Ben Cho",         sourceModule: "Offboarding",          createdDate: "2025-07-13", status: "Unread",       relatedRoute: "/cancellations/offboarding"},
  { id: "n-057", priority: "Medium",   type: "Offboarding",       title: "Department Shutdown Pending — Valley HVAC",            description: "SEO, GBP, and Paid Ads departments must close out Valley HVAC accounts.",       client: "Valley HVAC",           clientSlug: "valley-hvac",           department: "Operations",        assignedUser: "Jessica Reyes",   sourceModule: "Offboarding",          createdDate: "2025-07-13", status: "Unread",       relatedRoute: "/cancellations/offboarding"},
  { id: "n-058", priority: "High",     type: "Offboarding",       title: "Final Report Pending — Metro Glass Co",                description: "Final performance report must be delivered before Metro Glass Co account closes.", client: "Metro Glass Co",       clientSlug: "metro-glass-co",        department: "Reporting",         assignedUser: "Chris Navarro",   sourceModule: "Offboarding",          createdDate: "2025-07-12", status: "Unread",       relatedRoute: "/cancellations/offboarding"},
  { id: "n-059", priority: "Medium",   type: "Offboarding",       title: "Offboarding Completed — Sunrise Bakery",               description: "All offboarding tasks completed for Sunrise Bakery. Account archived.",         client: "Sunrise Bakery",        clientSlug: "sunrise-bakery",        department: "Operations",        assignedUser: "Jessica Reyes",   sourceModule: "Offboarding",          createdDate: "2025-07-10", status: "Resolved",     relatedRoute: "/cancellations/offboarding"},
  { id: "n-060", priority: "Urgent",   type: "Offboarding",       title: "Offboarding Overdue — Coastal Insurance",              description: "Offboarding 9 days past deadline. IT access still active. Escalated.",          client: "Coastal Insurance",     clientSlug: "coastal-insurance",     department: "IT & Security",     assignedUser: "Ben Cho",         sourceModule: "Offboarding",          createdDate: "2025-07-10", status: "Escalated",    relatedRoute: "/cancellations/offboarding", escalation: { level: 2, daysOpen: 9, trigger: "Offboarding Overdue"} },

  //  CLIENT PORTFOLIO 
  { id: "n-061", priority: "High",     type: "Account Management",title: "New Client Added — Pacific Dental Group",              description: "Pacific Dental Group added as new client. Ready for onboarding assignment.",    client: "Pacific Dental Group",  clientSlug: "pacific-dental-group",  department: "Account Management",assignedUser: "Priya Patel",     sourceModule: "Client Portfolio",     createdDate: "2025-07-14", status: "Unread",       relatedRoute: "/clients"},
  { id: "n-062", priority: "Urgent",   type: "Account Management",title: "Client Health Critical — Urban Fresh Market",          description: "Urban Fresh Market client health score at 18/100. Immediate intervention needed.", client: "Urban Fresh Market",  clientSlug: "urban-fresh-market",    department: "Account Management",assignedUser: "Marcus Webb",     sourceModule: "Client Portfolio",     createdDate: "2025-07-13", status: "Escalated",    relatedRoute: "/clients/urban-fresh-market", escalation: { level: 3, daysOpen: 5, trigger: "Client Health Critical"} },
  { id: "n-063", priority: "High",     type: "Account Management",title: "Client Ready For Onboarding — Lakeview Chiropractic", description: "Lakeview Chiropractic contract signed. Ready for onboarding workflow.",          client: "Lakeview Chiropractic", clientSlug: "lakeview-chiropractic", department: "Operations",        assignedUser: "Jessica Reyes",   sourceModule: "Client Portfolio",     createdDate: "2025-07-12", status: "Read",         relatedRoute: "/clients"},
  { id: "n-064", priority: "Medium",   type: "Account Management",title: "Client Offboarding Started — Valley HVAC",             description: "Valley HVAC offboarding process initiated. Client notified.",                  client: "Valley HVAC",           clientSlug: "valley-hvac",           department: "Account Management",assignedUser: "Daniel Torres",   sourceModule: "Client Portfolio",     createdDate: "2025-07-11", status: "Acknowledged", relatedRoute: "/clients/valley-hvac"},

  //  DEPARTMENT 
  { id: "n-065", priority: "High",     type: "Department",        title: "SEO Department — 3 Tasks Overdue",                     description: "SEO department has 3 overdue tasks across 2 clients. Review required.",        client: "Multiple",              clientSlug: "",                      department: "SEO",               assignedUser: "Tom Walsh",       sourceModule: "Task Engine",          createdDate: "2025-07-14", status: "Unread",       relatedRoute: "/tasks"},
  { id: "n-066", priority: "Medium",   type: "Department",        title: "Paid Advertising — Campaign Budget Review",            description: "Monthly budget review pending for Paid Advertising department.",               client: "Multiple",              clientSlug: "",                      department: "Paid Advertising",  assignedUser: "Lisa Park",       sourceModule: "Admin",                createdDate: "2025-07-13", status: "Unread",       relatedRoute: "/tasks"},
  { id: "n-067", priority: "High",     type: "Department",        title: "Content Department — Deliverables Behind Schedule",    description: "Content team is behind on deliverables for 4 clients this month.",            client: "Multiple",              clientSlug: "",                      department: "Content",           assignedUser: "Maria Santos",    sourceModule: "Task Engine",          createdDate: "2025-07-12", status: "Unread",       relatedRoute: "/tasks"},
  { id: "n-068", priority: "Medium",   type: "Department",        title: "Reporting — Monthly Reports Due Friday",               description: "10 monthly performance reports due end of week. 3 not yet started.",           client: "Multiple",              clientSlug: "",                      department: "Reporting",         assignedUser: "Chris Navarro",   sourceModule: "Task Engine",          createdDate: "2025-07-11", status: "Unread",       relatedRoute: "/tasks"},
  { id: "n-069", priority: "Low",      type: "Department",        title: "IT & Security — Access Audit Complete",                description: "Monthly access audit completed. No anomalies detected.",                      client: "N/A",                   clientSlug: "",                      department: "IT & Security",     assignedUser: "Ben Cho",         sourceModule: "Admin",                createdDate: "2025-07-10", status: "Read",         relatedRoute: "/admin"},
  { id: "n-070", priority: "Medium",   type: "Department",        title: "Account Management — 5 Check-Ins Overdue",             description: "AM team has 5 overdue client check-ins. Department owner review needed.",      client: "Multiple",              clientSlug: "",                      department: "Account Management",assignedUser: "Priya Patel",     sourceModule: "Account Management",   createdDate: "2025-07-09", status: "Acknowledged", relatedRoute: "/account-management/onboarding"},

  //  SYSTEM 
  { id: "n-071", priority: "Medium",   type: "System",            title: "Workflow Engine — Rule Updated",                       description: "Billing notification rule for invoice overdue events updated by admin.",        client: "N/A",                   clientSlug: "",                      department: "Admin",             assignedUser: "Admin",           sourceModule: "Admin",                createdDate: "2025-07-13", status: "Read",         relatedRoute: "/admin/workflows"},
  { id: "n-072", priority: "Low",      type: "System",            title: "System Notification — Weekly Digest Sent",             description: "Weekly operational digest sent to all department leads.",                      client: "N/A",                   clientSlug: "",                      department: "Admin",             assignedUser: "Admin",           sourceModule: "Admin",                createdDate: "2025-07-07", status: "Read",         relatedRoute: "/admin"},
  { id: "n-073", priority: "High",     type: "System",            title: "Escalation Rule Triggered — Renewal Threshold",        description: "Automatic escalation rule fired: 3 clients renewal under 30 days.",          client: "Multiple",              clientSlug: "",                      department: "Admin",             assignedUser: "Admin",           sourceModule: "Admin",                createdDate: "2025-07-14", status: "Unread",       relatedRoute: "/admin/workflows"},
  { id: "n-074", priority: "Medium",   type: "System",            title: "New Notification Rule Created",                        description: "Task overdue escalation rule added for all departments by admin.",             client: "N/A",                   clientSlug: "",                      department: "Admin",             assignedUser: "Admin",           sourceModule: "Admin",                createdDate: "2025-07-06", status: "Read",         relatedRoute: "/admin/workflows"},

  //  ADDITIONAL NOTIFICATIONS (to reach 100+) 
  { id: "n-075", priority: "High",     type: "Billing",           title: "Invoice Overdue — Sunrise Bakery",                     description: "Invoice #INV-2155 for Sunrise Bakery is 22 days overdue.",                     client: "Sunrise Bakery",        clientSlug: "sunrise-bakery",        department: "Billing",           assignedUser: "Sarah Chen",      sourceModule: "Billing",              createdDate: "2025-07-08", status: "Read",         relatedRoute: "/billing/invoices"},
  { id: "n-076", priority: "Medium",   type: "Task",              title: "Task Assigned — GBP Photo Optimization",               description: "New GBP task assigned to Anika Ross for Horizon Dental.",                      client: "Horizon Dental",        clientSlug: "horizon-dental",        department: "SEO",               assignedUser: "Anika Ross",      sourceModule: "Task Engine",          createdDate: "2025-07-14", status: "Unread",       relatedRoute: "/tasks"},
  { id: "n-077", priority: "High",     type: "Renewal",           title: "30-Day Renewal Escalation — Ridgeline Roofing",        description: "Ridgeline Roofing renewal 30 days out. Escalated to Sales + Leadership.",       client: "Ridgeline Roofing",     clientSlug: "ridgeline-roofing",     department: "Sales",             assignedUser: "Ryan Adams",      sourceModule: "Renewals",             createdDate: "2025-07-14", status: "Escalated",    relatedRoute: "/renewals",           escalation: { level: 2, daysOpen: 2, trigger: "Renewal < 30 Days"} },
  { id: "n-078", priority: "Medium",   type: "Task",              title: "Task Overdue — Reporting Dashboard Update",            description: "Reporting dashboard task for Pacific Dental Group is 4 days overdue.",          client: "Pacific Dental Group",  clientSlug: "pacific-dental-group",  department: "Reporting",         assignedUser: "Chris Navarro",   sourceModule: "Task Engine",          createdDate: "2025-07-10", status: "Unread",       relatedRoute: "/tasks"},
  { id: "n-079", priority: "Low",      type: "Task",              title: "Task Completed — Meta Ads Weekly Report",              description: "Weekly Meta Ads report completed for Urban Fresh Market.",                     client: "Urban Fresh Market",    clientSlug: "urban-fresh-market",    department: "Paid Advertising",  assignedUser: "Lisa Park",       sourceModule: "Task Engine",          createdDate: "2025-07-13", status: "Read",         relatedRoute: "/tasks"},
  { id: "n-080", priority: "High",     type: "Activation",        title: "Kickoff Completed — Lakeview Chiropractic",            description: "Kickoff call completed for Lakeview Chiropractic. Departments notified.",       client: "Lakeview Chiropractic", clientSlug: "lakeview-chiropractic", department: "Account Management",assignedUser: "Priya Patel",     sourceModule: "Activation",           createdDate: "2025-07-12", status: "Resolved",     relatedRoute: "/account-management/onboarding"},
  { id: "n-081", priority: "Medium",   type: "Workflow",          title: "Invoice Requested — Content Services",                 description: "Invoice requested for Gourmet Bistro content services this month.",             client: "Gourmet Bistro",        clientSlug: "gourmet-bistro",        department: "Billing",           assignedUser: "Sarah Chen",      sourceModule: "Workflow Engine",      createdDate: "2025-07-11", status: "Read",         relatedRoute: "/billing/invoices"},
  { id: "n-082", priority: "High",     type: "Account Management",title: "Retention Action Required — Ridgeline Roofing",        description: "Retention plan must be executed for Ridgeline Roofing within 48 hours.",        client: "Ridgeline Roofing",     clientSlug: "ridgeline-roofing",     department: "Account Management",assignedUser: "Daniel Torres",   sourceModule: "Account Management",   createdDate: "2025-07-13", status: "Unread",       relatedRoute: "/account-management/onboarding"},
  { id: "n-083", priority: "Low",      type: "System",            title: "User Login — New Device Detected",                     description: "Admin user logged in from new device. Verify if expected.",                     client: "N/A",                   clientSlug: "",                      department: "IT & Security",     assignedUser: "Ben Cho",         sourceModule: "Admin",                createdDate: "2025-07-13", status: "Read",         relatedRoute: "/admin"},
  { id: "n-084", priority: "Medium",   type: "Task",              title: "Task Due Tomorrow — LSA Optimization",                 description: "LSA optimization task due tomorrow for Summit Law Group.",                     client: "Summit Law Group",      clientSlug: "summit-law-group",      department: "Paid Advertising",  assignedUser: "Ryan Adams",      sourceModule: "Task Engine",          createdDate: "2025-07-13", status: "Unread",       relatedRoute: "/tasks"},
  { id: "n-085", priority: "High",     type: "Billing",           title: "Outstanding Balance — Blue Sky Dental",                description: "Blue Sky Dental has an outstanding balance of $1,200 from last month.",        client: "Blue Sky Dental",       clientSlug: "blue-sky-dental",       department: "Billing",           assignedUser: "Sarah Chen",      sourceModule: "Billing",              createdDate: "2025-07-12", status: "Unread",       relatedRoute: "/billing/invoices"},
  { id: "n-086", priority: "Medium",   type: "Department",        title: "Sales — Pipeline Review Required",                     description: "Weekly sales pipeline review pending. 12 leads need status updates.",           client: "Multiple",              clientSlug: "",                      department: "Sales",             assignedUser: "James Kim",       sourceModule: "Sales",                createdDate: "2025-07-11", status: "Unread",       relatedRoute: "/sales"},
  { id: "n-087", priority: "Low",      type: "Renewal",           title: "120-Day Alert — Summit Law Group",                     description: "Early renewal alert for Summit Law Group. No immediate action needed.",        client: "Summit Law Group",      clientSlug: "summit-law-group",      department: "Account Management",assignedUser: "Daniel Torres",   sourceModule: "Renewals",             createdDate: "2025-07-05", status: "Read",         relatedRoute: "/renewals"},
  { id: "n-088", priority: "High",     type: "Task",              title: "Task Blocked — Web Design Revision",                   description: "Web design revision task blocked. Missing brand assets from client.",          client: "Bright Path Financial", clientSlug: "bright-path-financial", department: "Content",           assignedUser: "Kelly Brown",     sourceModule: "Task Engine",          createdDate: "2025-07-11", status: "Unread",       relatedRoute: "/tasks"},
  { id: "n-089", priority: "Medium",   type: "Offboarding",       title: "Department Shutdown Pending — Metro Glass Co",         description: "PPC and SEO departments must shut down Metro Glass Co campaigns.",             client: "Metro Glass Co",        clientSlug: "metro-glass-co",        department: "Operations",        assignedUser: "Jessica Reyes",   sourceModule: "Offboarding",          createdDate: "2025-07-11", status: "Unread",       relatedRoute: "/cancellations/offboarding"},
  { id: "n-090", priority: "Medium",   type: "Workflow",          title: "Client Activated — Urban Fresh Market",                description: "Urban Fresh Market fully activated. All departments live and operational.",     client: "Urban Fresh Market",    clientSlug: "urban-fresh-market",    department: "Account Management",assignedUser: "Marcus Webb",     sourceModule: "Workflow Engine",      createdDate: "2025-07-09", status: "Resolved",     relatedRoute: "/billing/activation"},
  { id: "n-091", priority: "High",     type: "Task",              title: "Task Assigned — Quarterly SEO Strategy",               description: "Quarterly SEO strategy task assigned to Tom Walsh for Blue Sky Dental.",      client: "Blue Sky Dental",       clientSlug: "blue-sky-dental",       department: "SEO",               assignedUser: "Tom Walsh",       sourceModule: "Task Engine",          createdDate: "2025-07-14", status: "Unread",       relatedRoute: "/tasks"},
  { id: "n-092", priority: "Critical", type: "Billing",           title: "Final Invoice Overdue — Offboarding Client",           description: "Final invoice for Sunrise Bakery offboarding is 5 days overdue.",             client: "Sunrise Bakery",        clientSlug: "sunrise-bakery",        department: "Billing",           assignedUser: "Sarah Chen",      sourceModule: "Billing",              createdDate: "2025-07-09", status: "Escalated",    relatedRoute: "/billing/invoices",   escalation: { level: 2, daysOpen: 5, trigger: "Outstanding Balance > Threshold"} },
  { id: "n-093", priority: "Medium",   type: "Activation",        title: "Department Activation Pending — Content Team",         description: "Content activation tasks pending for Lakeview Chiropractic.",                 client: "Lakeview Chiropractic", clientSlug: "lakeview-chiropractic", department: "Content",           assignedUser: "Maria Santos",    sourceModule: "Activation",           createdDate: "2025-07-13", status: "Unread",       relatedRoute: "/billing/activation"},
  { id: "n-094", priority: "Low",      type: "Task",              title: "Task Completed — LSA Campaign Audit",                  description: "LSA campaign audit completed for Horizon Dental. No issues found.",           client: "Horizon Dental",        clientSlug: "horizon-dental",        department: "Paid Advertising",  assignedUser: "Ryan Adams",      sourceModule: "Task Engine",          createdDate: "2025-07-08", status: "Read",         relatedRoute: "/tasks"},
  { id: "n-095", priority: "High",     type: "Account Management",title: "QBR Completed — Blue Sky Dental",                      description: "Q2 Business Review completed with Blue Sky Dental. Results logged.",           client: "Blue Sky Dental",       clientSlug: "blue-sky-dental",       department: "Account Management",assignedUser: "Priya Patel",     sourceModule: "Account Management",   createdDate: "2025-07-07", status: "Resolved",     relatedRoute: "/account-management/onboarding"},
  { id: "n-096", priority: "Medium",   type: "Cancellation",      title: "Cancellation Request Under Review — Sunrise Bakery",   description: "Sunrise Bakery cancellation request under AM review. Retention call scheduled.", client: "Sunrise Bakery",       clientSlug: "sunrise-bakery",        department: "Account Management",assignedUser: "Daniel Torres",   sourceModule: "Cancellations",        createdDate: "2025-07-06", status: "Acknowledged", relatedRoute: "/billing/cancellations"},
  { id: "n-097", priority: "High",     type: "Workflow",          title: "Onboarding Milestone — Week 1 Complete",               description: "Week 1 onboarding milestone complete for Pacific Dental Group.",               client: "Pacific Dental Group",  clientSlug: "pacific-dental-group",  department: "Account Management",assignedUser: "Priya Patel",     sourceModule: "Workflow Engine",      createdDate: "2025-07-10", status: "Read",         relatedRoute: "/account-management/onboarding"},
  { id: "n-098", priority: "Medium",   type: "Task",              title: "Task Reassigned — LSA Optimization",                   description: "LSA optimization task for Valley HVAC reassigned due to team capacity.",       client: "Valley HVAC",           clientSlug: "valley-hvac",           department: "Paid Advertising",  assignedUser: "Ryan Adams",      sourceModule: "Task Engine",          createdDate: "2025-07-10", status: "Read",         relatedRoute: "/tasks"},
  { id: "n-099", priority: "Low",      type: "System",            title: "Export Completed — Notification Archive",              description: "Notification archive exported to CSV by admin user.",                         client: "N/A",                   clientSlug: "",                      department: "Admin",             assignedUser: "Admin",           sourceModule: "Admin",                createdDate: "2025-07-03", status: "Read",         relatedRoute: "/admin"},
  { id: "n-100", priority: "High",     type: "Department",        title: "Operations — Activation Queue Backlog",                description: "Operations queue has 7 pending activations. Immediate resource review needed.", client: "Multiple",              clientSlug: "",                      department: "Operations",        assignedUser: "Jessica Reyes",   sourceModule: "Activation",           createdDate: "2025-07-14", status: "Unread",       relatedRoute: "/billing/activation"},
  { id: "n-101", priority: "High",     type: "Billing",           title: "Payment Plan Requested — Pacific Dental Group",        description: "Pacific Dental Group requested a payment plan. Approval needed from billing lead.", client: "Pacific Dental Group", clientSlug: "pacific-dental-group", department: "Billing",            assignedUser: "Sarah Chen",      sourceModule: "Billing",              createdDate: "2025-07-14", status: "Unread",       relatedRoute: "/billing/invoices"},
  { id: "n-102", priority: "Medium",   type: "Workflow",          title: "Renewal Escalated — System Generated",                 description: "Workflow rule escalated renewal for Apex Roofing to leadership.",              client: "Apex Roofing",          clientSlug: "apex-roofing",          department: "Account Management",assignedUser: "Daniel Torres",   sourceModule: "Workflow Engine",      createdDate: "2025-07-14", status: "Escalated",    relatedRoute: "/renewals",           escalation: { level: 3, daysOpen: 5, trigger: "Renewal < 30 Days"} },
  { id: "n-103", priority: "Low",      type: "Task",              title: "Task Due Today — Content Calendar Review",             description: "Content calendar review due today for Gourmet Bistro.",                       client: "Gourmet Bistro",        clientSlug: "gourmet-bistro",        department: "Content",           assignedUser: "Maria Santos",    sourceModule: "Task Engine",          createdDate: "2025-07-14", status: "Unread",       relatedRoute: "/tasks"},
  { id: "n-104", priority: "High",     type: "Account Management",title: "Client Escalation Resolved — Gourmet Bistro",          description: "Prior escalation for Gourmet Bistro resolved. Client satisfied with outcome.",  client: "Gourmet Bistro",        clientSlug: "gourmet-bistro",        department: "Account Management",assignedUser: "Priya Patel",     sourceModule: "Account Management",   createdDate: "2025-07-11", status: "Resolved",     relatedRoute: "/clients/gourmet-bistro"},
  { id: "n-105", priority: "Medium",   type: "Renewal",           title: "Renewal Proposal Accepted — Bright Path Financial",    description: "Renewal proposal accepted by Bright Path Financial. Contract being prepared.",  client: "Bright Path Financial", clientSlug: "bright-path-financial", department: "Account Management",assignedUser: "Marcus Webb",     sourceModule: "Renewals",             createdDate: "2025-07-13", status: "Acknowledged", relatedRoute: "/renewals"},

  //  AFFILIATE (Sales Module) 
  { id: "n-af1", priority: "High",     type: "Workflow",          title: "New Referral Submitted — Brandon Ellis",                 description: "Brandon Ellis submitted a new referral: Blue Ridge Plumbing. Lead created in CRM.",      client: "Blue Ridge Plumbing",   clientSlug: "blue-ridge-plumbing",   department: "Sales",             assignedUser: "Jordan M.",      sourceModule: "Sales",                createdDate: "2025-07-14", status: "Unread",       relatedRoute: "/sales/affiliates"},
  { id: "n-af2", priority: "High",     type: "Workflow",          title: "Commission Approval Needed — Lisa Park",                  description: "Coastal Wellness Spa invoice paid. Lisa Park commission of $380/mo requires approval.",   client: "Coastal Wellness Spa",  clientSlug: "coastal-wellness-spa",  department: "Sales",             assignedUser: "Sarah K.",       sourceModule: "Sales",                createdDate: "2025-07-14", status: "Unread",       relatedRoute: "/sales/affiliates"},
  { id: "n-af3", priority: "Medium",   type: "Workflow",          title: "Affiliate Portal Activated — Carlos Reyes",              description: "Carlos Reyes (Reyes Digital) affiliate portal activated. Referral link generated.",       client: "—",                      clientSlug: "",                       department: "Sales",             assignedUser: "Mike T.",        sourceModule: "Sales",                createdDate: "2025-07-13", status: "Unread",       relatedRoute: "/sales/affiliates"},
  { id: "n-af4", priority: "Urgent",   type: "Billing",           title: "Payout Due — Brandon Ellis (June Commissions)",          description: "June commission payout of $1,440 due for Brandon Ellis. Finance approval pending.",         client: "—",                      clientSlug: "",                       department: "Billing",           assignedUser: "Sarah Chen",     sourceModule: "Sales",                createdDate: "2025-07-13", status: "Unread",       relatedRoute: "/sales/affiliates"},
  { id: "n-af5", priority: "Medium",   type: "Workflow",          title: "New Referral Submitted — Maria Santos",                  description: "Maria Santos referred Ridgeline Dentistry. Lead assigned to Sarah K. for follow-up.",     client: "Ridgeline Dentistry",   clientSlug: "ridgeline-dentistry",   department: "Sales",             assignedUser: "Sarah K.",       sourceModule: "Sales",                createdDate: "2025-07-12", status: "Unread",       relatedRoute: "/sales/affiliates"},
  { id: "n-af6", priority: "High",     type: "Workflow",          title: "Commission Approval Needed — Brandon Ellis",             description: "Summit Landscaping invoice paid. Brandon Ellis commission $240/mo requires approval.",     client: "Summit Landscaping",    clientSlug: "summit-landscaping",    department: "Sales",             assignedUser: "Jordan M.",      sourceModule: "Sales",                createdDate: "2025-07-11", status: "Unread",       relatedRoute: "/sales/affiliates"},
  { id: "n-af7", priority: "Medium",   type: "Workflow",          title: "Affiliate Portal Activated — Tyler Nguyen",              description: "Tyler Nguyen (Nguyen Agency) portal activated. Referral tracking enabled.",                client: "—",                      clientSlug: "",                       department: "Sales",             assignedUser: "Mike T.",        sourceModule: "Sales",                createdDate: "2025-07-10", status: "Read",         relatedRoute: "/sales/affiliates"},
  { id: "n-af8", priority: "High",     type: "Billing",           title: "Payout Due — Maria Santos (May Commissions)",            description: "May commission payout of $960 due for Maria Santos (Santos Partners). Pending review.",    client: "—",                      clientSlug: "",                       department: "Billing",           assignedUser: "Sarah Chen",     sourceModule: "Sales",                createdDate: "2025-07-09", status: "Acknowledged", relatedRoute: "/sales/affiliates"},
];

// 
// HELPERS
// 

const priorityOrder: NotificationPriority[] = ["Critical", "Urgent", "High", "Medium", "Low"];

const priorityCfg: Record<NotificationPriority, { bg: string; color: string; border: string; dot: string }> = {
  Critical: { bg: "#FFF0F0", color: "#B91C1C", border: "#FECACA", dot: "#B91C1C"},
  Urgent:   { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA", dot: "#C2410C"},
  High:     { bg: "#FEFCE8", color: "#A16207", border: "#FDE68A", dot: "#D97706"},
  Medium:   { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE", dot: "#3B82F6"},
  Low:      { bg: "#F0FDF4", color: "#166534", border: "#BBF7D0", dot: "#22C55E"},
};

const statusCfg: Record<NotificationStatus, { bg: string; color: string; border: string }> = {
  Unread:       { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE"},
  Read:         { bg: "#F9FAFB", color: "#6B7280", border: "#E5E7EB"},
  Acknowledged: { bg: "#F0FDF4", color: "#166534", border: "#BBF7D0"},
  Resolved:     { bg: "#F0FDF4", color: "#15803D", border: "#86EFAC"},
  Escalated:    { bg: "#FFF0F0", color: "#B91C1C", border: "#FECACA"},
};

const typeCfg: Record<NotificationType, { bg: string; color: string }> = {
  "Workflow":          { bg: "#EDE9FE", color: "#6D28D9"},
  "Task":              { bg: "#E0F2FE", color: "#0369A1"},
  "Billing":           { bg: "#ECFDF5", color: "#065F46"},
  "Activation":        { bg: "#FFF7ED", color: "#92400E"},
  "Account Management":{ bg: "#F5F3FF", color: "#5B21B6"},
  "Department":        { bg: "#F0F9FF", color: "#075985"},
  "Renewal":           { bg: "#FEFCE8", color: "#713F12"},
  "Cancellation":      { bg: "#FFF1F2", color: "#9F1239"},
  "Offboarding":       { bg: "#FDF2F8", color: "#831843"},
  "System":            { bg: "#F4F7FF", color: "#374151"},
};

function PriorityBadge({ p }: { p: NotificationPriority }) {
  const c = priorityCfg[p];
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border"style={{ background: c.bg, color: c.color, borderColor: c.border }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"style={{ background: c.dot }} />
      {p}
    </span>
  );
}

function StatusBadge({ s }: { s: NotificationStatus }) {
  const c = statusCfg[s];
  return (
    <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border"style={{ background: c.bg, color: c.color, borderColor: c.border }}>
      {s}
    </span>
  );
}

function TypeBadge({ t }: { t: NotificationType }) {
  const c = typeCfg[t];
  return (
    <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full"style={{ background: c.bg, color: c.color }}>
      {t}
    </span>
  );
}

// 
// NOTIFICATION DRAWER
// 

function NotificationDrawer({ n, onClose, onAction }: { n: Notification; onClose: () => void; onAction: (id: string, action: "Read"| "Acknowledged"| "Resolved"| "Escalated") => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end"style={{ background: "rgba(14,28,56,0.4)"}} onClick={onClose}>
      <div
        className="relative w-full max-w-lg h-full overflow-y-auto shadow-2xl flex flex-col"style={{ background: "var(--rtm-surface)", borderLeft: "1px solid var(--rtm-border)"}}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5"style={{ borderBottom: "1px solid var(--rtm-border)"}}>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-2 mb-2">
              <PriorityBadge p={n.priority} />
              <TypeBadge t={n.type} />
              <StatusBadge s={n.status} />
            </div>
            <h2 className="text-base font-bold leading-snug"style={{ color: "var(--rtm-text-primary)"}}>{n.title}</h2>
          </div>
          <button onClick={onClose} className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-xl font-bold transition-colors"style={{ color: "var(--rtm-text-muted)"}}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--rtm-blue-light)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>×</button>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-5 space-y-5">
          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Type",          value: n.type },
              { label: "Priority",      value: n.priority },
              { label: "Status",        value: n.status },
              { label: "Department",    value: n.department },
              { label: "Assigned User", value: n.assignedUser },
              { label: "Source Module", value: n.sourceModule },
              { label: "Client",        value: n.client },
              { label: "Created Date",  value: n.createdDate },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 rounded-lg"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5"style={{ color: "var(--rtm-text-muted)"}}>{label}</p>
                <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{value}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="p-4 rounded-xl"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
            <p className="text-xs font-bold uppercase tracking-wide mb-2"style={{ color: "var(--rtm-text-muted)"}}>Description</p>
            <p className="text-sm leading-relaxed"style={{ color: "var(--rtm-text-primary)"}}>{n.description}</p>
          </div>

          {/* Escalation details */}
          {n.escalation && (
            <div className="p-4 rounded-xl border"style={{ background: "#FFF5F5", borderColor: "#FECACA"}}>
              <p className="text-xs font-bold uppercase tracking-wide mb-3"style={{ color: "#B91C1C"}}> Escalation Details</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div><p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Level</p><p className="text-lg font-bold text-red-700">{n.escalation.level}</p></div>
                <div><p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Days Open</p><p className="text-lg font-bold text-red-700">{n.escalation.daysOpen}</p></div>
                <div><p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Trigger</p><p className="text-xs font-semibold text-red-800 leading-tight">{n.escalation.trigger}</p></div>
              </div>
            </div>
          )}

          {/* Route links */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide"style={{ color: "var(--rtm-text-muted)"}}>Related Routes</p>
            <Link href={n.relatedRoute} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors" style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)", border: "1px solid var(--rtm-border)" }}>
              <svg className="w-4 h-4"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              Open Related Record → {n.relatedRoute}
            </Link>
            {n.clientSlug && (
              <Link href={`/clients/${n.clientSlug}`} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors" style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", border: "1px solid var(--rtm-border)" }}>
                <svg className="w-4 h-4"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                View Client Profile → /clients/{n.clientSlug}
              </Link>
            )}
          </div>
        </div>

        {/* Action footer */}
        <div className="px-6 py-4 space-y-2"style={{ borderTop: "1px solid var(--rtm-border)"}}>
          <p className="text-xs font-bold uppercase tracking-wide mb-3"style={{ color: "var(--rtm-text-muted)"}}>Actions</p>
          <div className="grid grid-cols-2 gap-2">
            {(["Read", "Acknowledged", "Resolved", "Escalated"] as const).map((a) => (
              <button key={a} onClick={() => { onAction(n.id, a); onClose(); }}
                className="px-3 py-2 rounded-lg text-sm font-semibold transition-all"style={{
                  background: a === "Escalated"? "#FFF0F0": a === "Resolved"? "#F0FDF4": "var(--rtm-blue-light)",
                  color: a === "Escalated"? "#B91C1C": a === "Resolved"? "#15803D": "var(--rtm-blue)",
                  border: `1px solid ${a === "Escalated"? "#FECACA": a === "Resolved"? "#86EFAC": "var(--rtm-border)"}`,
                }}>
                {a === "Read"? "Mark Read": a === "Acknowledged"? "Acknowledge": a === "Resolved"? "Resolve": "Escalate"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 
// MAIN PAGE
// 

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [selectedId, setSelectedId]       = useState<string | null>(null);
  const [activeTab, setActiveTab]         = useState<"all"| "my"| "escalations">("all");

  // Filter state
  const [filterType,   setFilterType]   = useState<NotificationType | "">("");
  const [filterDept,   setFilterDept]   = useState<Department | "">("");
  const [filterUser,   setFilterUser]   = useState<string>("");
  const [filterPrio,   setFilterPrio]   = useState<NotificationPriority | "">("");
  const [filterStatus, setFilterStatus] = useState<NotificationStatus | "">("");
  const [filterModule, setFilterModule] = useState<SourceModule | "">("");
  const [search,       setSearch]       = useState("");

  //  Derived helpers 
  const selectedNotification = notifications.find((n) => n.id === selectedId) ?? null;

  const kpi = useMemo(() => ({
    unread:      notifications.filter((n) => n.status === "Unread").length,
    highPrio:    notifications.filter((n) => n.priority === "Critical"|| n.priority === "Urgent").length,
    overdue:     notifications.filter((n) => n.type === "Task"&& n.title.toLowerCase().includes("overdue")).length,
    workflow:    notifications.filter((n) => n.type === "Workflow").length,
    renewal:     notifications.filter((n) => n.type === "Renewal").length,
    billing:     notifications.filter((n) => n.type === "Billing").length,
    offboarding: notifications.filter((n) => n.type === "Offboarding"|| n.type === "Cancellation").length,
    escalations: notifications.filter((n) => n.status === "Escalated").length,
  }), [notifications]);

  const escalations = useMemo(() =>
    notifications.filter((n) => n.escalation),
  [notifications]);

  // "My Notifications" — simulating current user = "Marcus Webb" + "Account Management"
  const myNotifications = useMemo(() =>
    notifications.filter((n) =>
      n.assignedUser === "Marcus Webb"||
      n.department === "Account Management"||
      n.status === "Unread"||
      n.priority === "Critical"||
      n.priority === "Urgent"),
  [notifications]);

  const displayedRaw = activeTab === "escalations"? escalations : activeTab === "my"? myNotifications : notifications;

  const filtered = useMemo(() => {
    let list = displayedRaw;
    if (filterType)   list = list.filter((n) => n.type === filterType);
    if (filterDept)   list = list.filter((n) => n.department === filterDept);
    if (filterUser)   list = list.filter((n) => n.assignedUser.toLowerCase().includes(filterUser.toLowerCase()));
    if (filterPrio)   list = list.filter((n) => n.priority === filterPrio);
    if (filterStatus) list = list.filter((n) => n.status === filterStatus);
    if (filterModule) list = list.filter((n) => n.sourceModule === filterModule);
    if (search)       list = list.filter((n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.client.toLowerCase().includes(search.toLowerCase()) ||
      n.assignedUser.toLowerCase().includes(search.toLowerCase()) ||
      n.department.toLowerCase().includes(search.toLowerCase())
    );
    return [...list].sort((a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority));
  }, [displayedRaw, filterType, filterDept, filterUser, filterPrio, filterStatus, filterModule, search]);

  //  Actions 
  function handleAction(id: string, action: "Read"| "Acknowledged"| "Resolved"| "Escalated") {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, status: action } : n));
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => n.status === "Unread"? { ...n, status: "Read"} : n));
  }

  function clearRead() {
    setNotifications((prev) => prev.filter((n) => n.status !== "Read"));
  }

  //  Shared styles 
  const selectStyle: React.CSSProperties = {
    background: "var(--rtm-surface)",
    border: "1px solid var(--rtm-border)",
    color: "var(--rtm-text-primary)",
    borderRadius: "8px",
    padding: "6px 10px",
    fontSize: "13px",
    minWidth: "160px",
  };

  const tabBase = "px-4 py-2 text-sm font-semibold rounded-lg transition-all";
  const tabActive = { background: "var(--rtm-blue)", color: "#fff", boxShadow: "0 2px 6px rgba(59,110,245,0.25)"};
  const tabInactive = { background: "var(--rtm-surface)", color: "var(--rtm-text-secondary)", border: "1px solid var(--rtm-border)"};

  return (
    <div className="space-y-6">

      {/*  PAGE HEADER  */}
      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold"style={{ color: "var(--rtm-text-primary)"}}>
              Notifications &amp; Alerts Center
            </h1>
            <p className="mt-1 text-sm"style={{ color: "var(--rtm-text-muted)"}}>
              Centralized operational alerts, workflow notifications, task alerts, renewals, onboarding, cancellations, and escalation management.
            </p>
          </div>
          {/* Unread badge */}
          {kpi.unread > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold"style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE"}}>
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"/>
              {kpi.unread} Unread
            </div>
          )}
        </div>
      </div>

      {/*  ACTION BAR  */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "Mark All Read",              fn: markAllRead,   style: { background: "var(--rtm-blue)", color: "#fff"} },
          { label: "Clear Read",                 fn: clearRead,     style: { background: "var(--rtm-surface)", color: "var(--rtm-text-secondary)", border: "1px solid var(--rtm-border)"} },
          { label: "Notification Rules",         fn: () => {},      style: { background: "var(--rtm-surface)", color: "var(--rtm-text-secondary)", border: "1px solid var(--rtm-border)"} },
          { label: "Escalation Rules",           fn: () => {},      style: { background: "var(--rtm-surface)", color: "var(--rtm-text-secondary)", border: "1px solid var(--rtm-border)"} },
          { label: "↓ Export Notifications",       fn: () => {},      style: { background: "var(--rtm-surface)", color: "var(--rtm-text-secondary)", border: "1px solid var(--rtm-border)"} },
        ].map(({ label, fn, style }) => (
          <button key={label} onClick={fn} className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"style={{ ...style, flexShrink: 0 }}>
            {label}
          </button>
        ))}
      </div>

      {/*  KPI CARDS  */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
        {[
          { title: "Unread",            value: kpi.unread,      icon: "", iconBg: "#EFF6FF", iconColor: "#1D4ED8", alert: kpi.unread > 0 },
          { title: "High Priority",     value: kpi.highPrio,    icon: "", iconBg: "#FFF0F0", iconColor: "#B91C1C", alert: kpi.highPrio > 0 },
          { title: "Overdue Tasks",     value: kpi.overdue,     icon: "⏰", iconBg: "#FFF7ED", iconColor: "#C2410C", alert: kpi.overdue > 0 },
          { title: "Workflow Alerts",   value: kpi.workflow,    icon: "", iconBg: "#EDE9FE", iconColor: "#6D28D9", alert: false },
          { title: "Renewal Alerts",    value: kpi.renewal,     icon: "", iconBg: "#FEFCE8", iconColor: "#A16207", alert: kpi.renewal > 3 },
          { title: "Billing Alerts",    value: kpi.billing,     icon: "", iconBg: "#ECFDF5", iconColor: "#065F46", alert: false },
          { title: "Offboarding",       value: kpi.offboarding, icon: "", iconBg: "#FDF2F8", iconColor: "#831843", alert: false },
          { title: "Escalations",       value: kpi.escalations, icon: "", iconBg: "#FFF0F0", iconColor: "#B91C1C", alert: kpi.escalations > 0 },
        ].map(({ title, value, icon, iconBg, iconColor, alert }) => (
          <div key={title}
            className="flex flex-col gap-2 p-4 rounded-xl border transition-shadow hover:shadow-md"style={{
              background: alert ? "#FFFBFB": "var(--rtm-surface)",
              borderColor: alert ? "#FECACA": "var(--rtm-border)",
              boxShadow: "0 1px 3px rgba(15,28,56,0.05)",
            }}>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wide leading-tight"style={{ color: "var(--rtm-text-muted)"}}>{title}</p>
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"style={{ background: iconBg, color: iconColor }}>{icon}</span>
            </div>
            <p className="text-2xl font-bold"style={{ color: alert ? "#B91C1C": "var(--rtm-text-primary)"}}>{value}</p>
          </div>
        ))}
      </div>

      {/*  TABS  */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "my", "escalations"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={tabBase} style={activeTab === tab ? tabActive : tabInactive}>
            {tab === "all"? `All Notifications (${notifications.length})` : tab === "my"? `My Notifications (${myNotifications.length})` : `Escalation Center (${escalations.length})`}
          </button>
        ))}
      </div>

      {/*  ESCALATION CENTER (special view)  */}
      {activeTab === "escalations"&& (
        <div className="rounded-xl border overflow-hidden"style={{ background: "var(--rtm-surface)", borderColor: "#FECACA"}}>
          <div className="px-5 py-4 flex items-center gap-3"style={{ background: "#FFF5F5", borderBottom: "1px solid #FECACA"}}>
            
            <div>
              <h2 className="text-base font-bold text-red-800">Escalation Center</h2>
              <p className="text-xs text-red-600 mt-0.5">Active escalations requiring immediate attention</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#FFF0F0", borderBottom: "1px solid #FECACA"}}>
                  {["Alert", "Department", "Owner", "Priority", "Days Open", "Escalation Level", "Trigger", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-red-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {escalations.sort((a, b) => (b.escalation?.level ?? 0) - (a.escalation?.level ?? 0)).map((n, i) => (
                  <tr key={n.id} style={{ background: i % 2 === 0 ? "var(--rtm-surface)": "#FFFAFA", borderBottom: "1px solid #FEE2E2"}}
                    className="hover:bg-red-50 transition-colors cursor-pointer"onClick={() => setSelectedId(n.id)}>
                    <td className="px-4 py-3 font-semibold max-w-[220px]"style={{ color: "var(--rtm-text-primary)"}}>
                      <span className="line-clamp-2 leading-snug">{n.title}</span>
                      <span className="block text-[10px] text-gray-400 mt-0.5">{n.client}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{n.department}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{n.assignedUser}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><PriorityBadge p={n.priority} /></td>
                    <td className="px-4 py-3">
                      <span className="inline-block text-sm font-bold px-2 py-0.5 rounded-full"style={{ background: n.escalation!.daysOpen > 10 ? "#FFF0F0": "#FFF7ED", color: n.escalation!.daysOpen > 10 ? "#B91C1C": "#C2410C"}}>
                        {n.escalation!.daysOpen}d
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-sm font-bold text-red-700">
                        {"".repeat(n.escalation!.level)} L{n.escalation!.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-red-700 max-w-[160px]">
                      <span className="line-clamp-2">{n.escalation!.trigger}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={(e) => { e.stopPropagation(); setSelectedId(n.id); }}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold"style={{ background: "#FFF0F0", color: "#B91C1C", border: "1px solid #FECACA"}}>
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

      {/*  FILTERS (all & my views)  */}
      {activeTab !== "escalations"&& (
        <div className="p-4 rounded-xl border space-y-3"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide"style={{ color: "var(--rtm-text-muted)"}}>Filters &amp; Search</p>
            <button onClick={() => { setFilterType(""); setFilterDept(""); setFilterUser(""); setFilterPrio(""); setFilterStatus(""); setFilterModule(""); setSearch(""); }}
              className="text-xs font-semibold"style={{ color: "var(--rtm-blue)"}}>Clear All</button>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {/* Search */}
            <input
              type="text"placeholder="Search client, title, user, dept…"value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[200px]"style={{ ...selectStyle, maxWidth: "280px"}}
            />

            <select value={filterType} onChange={(e) => setFilterType(e.target.value as NotificationType | "")} style={selectStyle}>
              <option value="">All Types</option>
              {(["Workflow","Task","Billing","Activation","Account Management","Department","Renewal","Cancellation","Offboarding","System"] as NotificationType[]).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <select value={filterPrio} onChange={(e) => setFilterPrio(e.target.value as NotificationPriority | "")} style={selectStyle}>
              <option value="">All Priorities</option>
              {priorityOrder.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>

            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as NotificationStatus | "")} style={selectStyle}>
              <option value="">All Statuses</option>
              {(["Unread","Read","Acknowledged","Resolved","Escalated"] as NotificationStatus[]).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select value={filterDept} onChange={(e) => setFilterDept(e.target.value as Department | "")} style={selectStyle}>
              <option value="">All Departments</option>
              {(["Sales","Billing","Account Management","Operations","SEO","Paid Advertising","Content","Reporting","Admin","IT & Security"] as Department[]).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select value={filterModule} onChange={(e) => setFilterModule(e.target.value as SourceModule | "")} style={selectStyle}>
              <option value="">All Modules</option>
              {(["Workflow Engine","Task Engine","Client Portfolio","Billing","Activation","Account Management","Sales","Renewals","Cancellations","Offboarding","Admin"] as SourceModule[]).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <p className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>
            Showing <strong>{filtered.length}</strong> of <strong>{displayedRaw.length}</strong> notifications
          </p>
        </div>
      )}

      {/*  NOTIFICATION FEED  */}
      {activeTab !== "escalations"&& (
        <div className="rounded-xl border overflow-hidden"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
          <div className="px-5 py-4 flex items-center justify-between"style={{ borderBottom: "1px solid var(--rtm-border)", background: "var(--rtm-bg)"}}>
            <h2 className="text-base font-bold"style={{ color: "var(--rtm-text-primary)"}}>
              {activeTab === "my"? "My Notifications": "Notification Feed"}
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)"}}>
              {filtered.length} notifications
            </span>
          </div>

          {/*  My Notifications quick-filter pills  */}
          {activeTab === "my"&& (
            <div className="px-5 py-3 flex flex-wrap gap-2"style={{ borderBottom: "1px solid var(--rtm-border)", background: "var(--rtm-bg)"}}>
              {["Assigned To Me","My Department","Unread","Urgent","Overdue","Requires Action"].map((pill) => (
                <button key={pill} className="px-3 py-1 rounded-full text-xs font-semibold border transition-all"style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)"}}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--rtm-blue-light)"; e.currentTarget.style.color = "var(--rtm-blue)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "var(--rtm-surface)"; e.currentTarget.style.color = "var(--rtm-text-secondary)"; }}>
                  {pill}
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-4xl mb-3"></p>
              <p className="font-semibold"style={{ color: "var(--rtm-text-primary)"}}>No notifications match your filters</p>
              <p className="text-sm mt-1"style={{ color: "var(--rtm-text-muted)"}}>Try clearing filters or selecting a different tab.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border)"}}>
                    {["Priority","Type","Title","Client","Department","Assigned","Source","Date","Status","Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide whitespace-nowrap"style={{ color: "var(--rtm-text-muted)"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((n, i) => (
                    <tr key={n.id}
                      className="transition-colors cursor-pointer group"style={{
                        background: n.status === "Unread"? (i % 2 === 0 ? "#F8FBFF": "#F0F7FF")
                          : (i % 2 === 0 ? "var(--rtm-surface)": "var(--rtm-bg)"),
                        borderBottom: "1px solid var(--rtm-border)",
                        borderLeft: n.status === "Unread"? `3px solid ${priorityCfg[n.priority].dot}` : "3px solid transparent",
                      }}
                      onClick={() => setSelectedId(n.id)}>
                      <td className="px-4 py-3 whitespace-nowrap"><PriorityBadge p={n.priority} /></td>
                      <td className="px-4 py-3 whitespace-nowrap"><TypeBadge t={n.type} /></td>
                      <td className="px-4 py-3 max-w-[240px]">
                        <div className="flex items-start gap-1.5">
                          {n.status === "Unread"&& <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"style={{ background: priorityCfg[n.priority].dot }} />}
                          <span className="font-semibold leading-snug line-clamp-2"style={{ color: "var(--rtm-text-primary)"}}>{n.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {n.clientSlug ? (
                          <Link href={`/clients/${n.clientSlug}`} className="text-xs font-semibold hover:underline" style={{ color: "var(--rtm-blue)" }} onClick={(e) => e.stopPropagation()}>
                            {n.client}
                          </Link>
                        ) : (
                          <span className="text-xs text-gray-400">{n.client}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">{n.department}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">{n.assignedUser}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)", border: "1px solid var(--rtm-border)"}}>
                          {n.sourceModule}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-400">{n.createdDate}</td>
                      <td className="px-4 py-3 whitespace-nowrap"><StatusBadge s={n.status} /></td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); setSelectedId(n.id); }}
                            className="px-2 py-1 rounded text-xs font-semibold"style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)"}}>
                            View
                          </button>
                          {n.status === "Unread"&& (
                            <button onClick={(e) => { e.stopPropagation(); handleAction(n.id, "Read"); }}
                              className="px-2 py-1 rounded text-xs font-semibold"style={{ background: "#F0FDF4", color: "#166534"}}>
                              
                            </button>
                          )}
                          {n.status !== "Escalated"&& (
                            <button onClick={(e) => { e.stopPropagation(); handleAction(n.id, "Escalated"); }}
                              className="px-2 py-1 rounded text-xs font-semibold"style={{ background: "#FFF0F0", color: "#B91C1C"}}>
                              
                            </button>
                          )}
                          <Link href={n.relatedRoute} onClick={(e) => e.stopPropagation()}
                            className="px-2 py-1 rounded text-xs font-semibold"style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", border: "1px solid var(--rtm-border)"}}>
                            →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/*  ROUTE INTEGRATIONS REFERENCE  */}
      <div className="rounded-xl border p-5"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
        <h2 className="text-sm font-bold mb-4"style={{ color: "var(--rtm-text-primary)"}}>Route Integrations</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {[
            { label: "Clients",           href: "/clients"},
            { label: "Tasks",             href: "/tasks"},
            { label: "Workflow Engine",   href: "/admin/workflows"},
            { label: "Invoices",          href: "/billing/invoices"},
            { label: "Activation",        href: "/billing/activation"},
            { label: "Onboarding",        href: "/account-management/onboarding"},
            { label: "Renewals",          href: "/renewals"},
            { label: "Cancellations",     href: "/billing/cancellations"},
            { label: "Offboarding",       href: "/cancellations/offboarding"},
            { label: "Admin",             href: "/admin"},
          ].map(({ label, href }) => (
            <Link key={href} href={href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all"style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", border: "1px solid var(--rtm-border)"}}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--rtm-blue-light)"; e.currentTarget.style.color = "var(--rtm-blue)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--rtm-bg)"; e.currentTarget.style.color = "var(--rtm-text-secondary)"; }}>
              <span>→</span>{label}
            </Link>
          ))}
        </div>
      </div>

      {/*  NOTIFICATION DRAWER  */}
      {selectedNotification && (
        <NotificationDrawer
          n={selectedNotification}
          onClose={() => setSelectedId(null)}
          onAction={handleAction}
        />
      )}
    </div>
  );
}
