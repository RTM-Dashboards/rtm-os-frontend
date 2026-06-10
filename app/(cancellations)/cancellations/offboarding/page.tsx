"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import TaskAccessCard from "@/components/tasks/TaskAccessCard";

// ── Types ──────────────────────────────────────────────────────────────────────

type BadgeVariant = "success" | "error" | "warning" | "info" | "neutral" | "pending";

type OffboardingStatus =
  | "Offboarding Triggered"
  | "In Progress"
  | "Waiting on Billing"
  | "Waiting on AM"
  | "Department Shutdown"
  | "Access Removal"
  | "Final Report"
  | "Client Closure"
  | "Completed";

type CancellationStatus =
  | "Approved"
  | "Billing Cleared"
  | "Pending Balance"
  | "Billing Hold"
  | "Escalated"
  | "Closed";

type BillingStatus =
  | "Cleared"
  | "Pending Review"
  | "Outstanding Balance"
  | "Final Invoice Sent"
  | "Written Off"
  | "Closed";

type FinalReportStatus = "Not Started" | "In Progress" | "Prepared" | "Sent" | "N/A";
type AccessRemovalStatus = "Not Started" | "In Progress" | "Partial" | "Completed";
type Priority = "Critical" | "High" | "Medium" | "Low";

type ChecklistItemStatus = "Open" | "In Progress" | "Blocked" | "Completed" | "Not Applicable";

interface ChecklistItem {
  id: string;
  task: string;
  department: string;
  assignedUser: string;
  status: ChecklistItemStatus;
  dueDate: string;
}

interface DeptShutdown {
  department: string;
  serviceStatus: "Active" | "Stopping" | "Stopped" | "N/A";
  departmentOwner: string;
  taskStatus: "Not Started" | "In Progress" | "Completed" | "N/A";
  dependencies: string;
  dueDate: string;
}

interface AccessItem {
  accessType: string;
  platform: string;
  owner: string;
  removalStatus: "Not Started" | "In Progress" | "Removed" | "N/A";
  dueDate: string;
  notes: string;
}

interface RecentEvent {
  date: string;
  eventType: string;
  triggeredBy: string;
  department: string;
  oldStatus: string;
  newStatus: string;
  notes: string;
}

interface OffboardingClient {
  id: string;
  client: string;
  offboardingStatus: OffboardingStatus;
  cancellationStatus: CancellationStatus;
  billingStatus: BillingStatus;
  amOwner: string;
  operationsOwner: string;
  departmentsActive: string[];
  finalReportStatus: FinalReportStatus;
  accessRemovalStatus: AccessRemovalStatus;
  priority: Priority;
  dueDate: string;
  nextRequiredAction: string;
  checklist: {
    billingClosure: ChecklistItem[];
    amClosure: ChecklistItem[];
    departmentShutdown: ChecklistItem[];
    accessRemoval: ChecklistItem[];
    finalDeliverables: ChecklistItem[];
  };
  deptShutdown: DeptShutdown[];
  accessItems: AccessItem[];
  recentEvents: RecentEvent[];
}

type ModalKind =
  | { kind: "assignOwner";        record: OffboardingClient }
  | { kind: "updateStatus";       record: OffboardingClient }
  | { kind: "createShutdownTasks"; record: OffboardingClient }
  | { kind: "requestBillingClearance"; record: OffboardingClient }
  | { kind: "removeAccess";       record: OffboardingClient }
  | { kind: "uploadFinalReport";  record: OffboardingClient }
  | { kind: "markComplete";       record: OffboardingClient }
  | null;

// ── Mock Data ──────────────────────────────────────────────────────────────────

const mockClients: OffboardingClient[] = [
  // 1. Waiting on billing clearance
  {
    id: "ob1",
    client: "Cornerstone Flooring",
    offboardingStatus: "Waiting on Billing",
    cancellationStatus: "Pending Balance",
    billingStatus: "Outstanding Balance",
    amOwner: "Amanda B.",
    operationsOwner: "Marcus L.",
    departmentsActive: ["SEO", "PPC", "Reporting"],
    finalReportStatus: "Not Started",
    accessRemovalStatus: "Not Started",
    priority: "Critical",
    dueDate: "Jul 5, 2025",
    nextRequiredAction: "Resolve $6,400 outstanding balance before offboarding can proceed",
    checklist: {
      billingClosure: [
        { id: "bc1", task: "Final invoice sent", department: "Billing", assignedUser: "Lisa P.", status: "Completed", dueDate: "Jun 10" },
        { id: "bc2", task: "Outstanding balance reviewed", department: "Billing", assignedUser: "Lisa P.", status: "In Progress", dueDate: "Jul 1" },
        { id: "bc3", task: "Refund/write-off confirmed", department: "Billing", assignedUser: "Lisa P.", status: "Blocked", dueDate: "Jul 5" },
        { id: "bc4", task: "Billing closed", department: "Billing", assignedUser: "Lisa P.", status: "Open", dueDate: "Jul 5" },
      ],
      amClosure: [
        { id: "am1", task: "Client notified", department: "AM", assignedUser: "Amanda B.", status: "Completed", dueDate: "Jun 5" },
        { id: "am2", task: "Final check-in completed", department: "AM", assignedUser: "Amanda B.", status: "Completed", dueDate: "Jun 10" },
        { id: "am3", task: "Renewal/cancellation notes saved", department: "AM", assignedUser: "Amanda B.", status: "In Progress", dueDate: "Jul 1" },
        { id: "am4", task: "Relationship status updated", department: "AM", assignedUser: "Amanda B.", status: "Open", dueDate: "Jul 5" },
      ],
      departmentShutdown: [
        { id: "ds1", task: "SEO stopped", department: "SEO", assignedUser: "Mike T.", status: "Open", dueDate: "Jul 5" },
        { id: "ds2", task: "PPC stopped", department: "PPC", assignedUser: "Jenna R.", status: "Open", dueDate: "Jul 5" },
        { id: "ds3", task: "Reporting stopped", department: "Reporting", assignedUser: "Carlos M.", status: "Open", dueDate: "Jul 5" },
      ],
      accessRemoval: [
        { id: "ar1", task: "Ad accounts access removed", department: "Operations", assignedUser: "Marcus L.", status: "Open", dueDate: "Jul 5" },
        { id: "ar2", task: "Reporting dashboard access removed", department: "Operations", assignedUser: "Marcus L.", status: "Open", dueDate: "Jul 5" },
      ],
      finalDeliverables: [
        { id: "fd1", task: "Final report prepared", department: "AM", assignedUser: "Amanda B.", status: "Open", dueDate: "Jul 5" },
        { id: "fd2", task: "Final report sent", department: "AM", assignedUser: "Amanda B.", status: "Open", dueDate: "Jul 5" },
        { id: "fd3", task: "Assets returned", department: "Operations", assignedUser: "Marcus L.", status: "Open", dueDate: "Jul 5" },
        { id: "fd4", task: "Closure confirmation sent", department: "AM", assignedUser: "Amanda B.", status: "Open", dueDate: "Jul 5" },
      ],
    },
    deptShutdown: [
      { department: "SEO", serviceStatus: "Active", departmentOwner: "Mike T.", taskStatus: "Not Started", dependencies: "Billing clearance", dueDate: "Jul 5" },
      { department: "PPC", serviceStatus: "Active", departmentOwner: "Jenna R.", taskStatus: "Not Started", dependencies: "Billing clearance", dueDate: "Jul 5" },
      { department: "Reporting", serviceStatus: "Active", departmentOwner: "Carlos M.", taskStatus: "Not Started", dependencies: "Billing clearance", dueDate: "Jul 5" },
    ],
    accessItems: [
      { accessType: "Google Ads", platform: "Google", owner: "Jenna R.", removalStatus: "Not Started", dueDate: "Jul 5", notes: "" },
      { accessType: "Google Analytics", platform: "Google", owner: "Marcus L.", removalStatus: "Not Started", dueDate: "Jul 5", notes: "" },
      { accessType: "Reporting Dashboard", platform: "Internal", owner: "Carlos M.", removalStatus: "Not Started", dueDate: "Jul 5", notes: "" },
    ],
    recentEvents: [
      { date: "May 28", eventType: "Offboarding Triggered", triggeredBy: "Billing", department: "Billing", oldStatus: "Approved", newStatus: "Waiting on Billing", notes: "$6,400 outstanding" },
      { date: "Jun 01", eventType: "Billing Clearance Requested", triggeredBy: "Lisa P.", department: "Billing", oldStatus: "Waiting on Billing", newStatus: "Waiting on Billing", notes: "Escalated to AM" },
    ],
  },

  // 2. In department shutdown
  {
    id: "ob2",
    client: "Sunbelt HVAC",
    offboardingStatus: "Department Shutdown",
    cancellationStatus: "Billing Cleared",
    billingStatus: "Cleared",
    amOwner: "Rachel T.",
    operationsOwner: "Diana F.",
    departmentsActive: ["SEO", "Reporting"],
    finalReportStatus: "Not Started",
    accessRemovalStatus: "Not Started",
    priority: "High",
    dueDate: "Jul 10, 2025",
    nextRequiredAction: "Complete SEO and Reporting shutdown tasks",
    checklist: {
      billingClosure: [
        { id: "bc1", task: "Final invoice sent", department: "Billing", assignedUser: "Lisa P.", status: "Completed", dueDate: "Jun 1" },
        { id: "bc2", task: "Outstanding balance reviewed", department: "Billing", assignedUser: "Lisa P.", status: "Completed", dueDate: "Jun 5" },
        { id: "bc3", task: "Refund/write-off confirmed", department: "Billing", assignedUser: "Lisa P.", status: "Not Applicable", dueDate: "—" },
        { id: "bc4", task: "Billing closed", department: "Billing", assignedUser: "Lisa P.", status: "Completed", dueDate: "Jun 10" },
      ],
      amClosure: [
        { id: "am1", task: "Client notified", department: "AM", assignedUser: "Rachel T.", status: "Completed", dueDate: "May 28" },
        { id: "am2", task: "Final check-in completed", department: "AM", assignedUser: "Rachel T.", status: "Completed", dueDate: "Jun 5" },
        { id: "am3", task: "Renewal/cancellation notes saved", department: "AM", assignedUser: "Rachel T.", status: "Completed", dueDate: "Jun 10" },
        { id: "am4", task: "Relationship status updated", department: "AM", assignedUser: "Rachel T.", status: "In Progress", dueDate: "Jul 5" },
      ],
      departmentShutdown: [
        { id: "ds1", task: "SEO stopped", department: "SEO", assignedUser: "Mike T.", status: "In Progress", dueDate: "Jul 10" },
        { id: "ds2", task: "Reporting stopped", department: "Reporting", assignedUser: "Carlos M.", status: "In Progress", dueDate: "Jul 10" },
        { id: "ds3", task: "GBP access reviewed", department: "Operations", assignedUser: "Diana F.", status: "Completed", dueDate: "Jun 30" },
      ],
      accessRemoval: [
        { id: "ar1", task: "Ad accounts access removed", department: "Operations", assignedUser: "Diana F.", status: "Open", dueDate: "Jul 10" },
        { id: "ar2", task: "Reporting dashboard access removed", department: "Operations", assignedUser: "Diana F.", status: "Open", dueDate: "Jul 10" },
        { id: "ar3", task: "Shared folders access removed", department: "Operations", assignedUser: "Diana F.", status: "Open", dueDate: "Jul 10" },
      ],
      finalDeliverables: [
        { id: "fd1", task: "Final report prepared", department: "AM", assignedUser: "Rachel T.", status: "Open", dueDate: "Jul 10" },
        { id: "fd2", task: "Final report sent", department: "AM", assignedUser: "Rachel T.", status: "Open", dueDate: "Jul 10" },
        { id: "fd3", task: "Assets returned", department: "Operations", assignedUser: "Diana F.", status: "Open", dueDate: "Jul 10" },
        { id: "fd4", task: "Closure confirmation sent", department: "AM", assignedUser: "Rachel T.", status: "Open", dueDate: "Jul 10" },
      ],
    },
    deptShutdown: [
      { department: "SEO", serviceStatus: "Stopping", departmentOwner: "Mike T.", taskStatus: "In Progress", dependencies: "None", dueDate: "Jul 10" },
      { department: "Reporting", serviceStatus: "Stopping", departmentOwner: "Carlos M.", taskStatus: "In Progress", dependencies: "SEO shutdown", dueDate: "Jul 10" },
    ],
    accessItems: [
      { accessType: "Google Search Console", platform: "Google", owner: "Mike T.", removalStatus: "Not Started", dueDate: "Jul 10", notes: "" },
      { accessType: "Reporting Dashboard", platform: "Internal", owner: "Carlos M.", removalStatus: "Not Started", dueDate: "Jul 10", notes: "" },
      { accessType: "Shared Drive", platform: "Google Drive", owner: "Diana F.", removalStatus: "Not Started", dueDate: "Jul 10", notes: "" },
    ],
    recentEvents: [
      { date: "May 28", eventType: "Offboarding Triggered", triggeredBy: "Lisa P.", department: "Billing", oldStatus: "Billing Cleared", newStatus: "Department Shutdown", notes: "All billing resolved" },
      { date: "Jun 15", eventType: "Department Shutdown Started", triggeredBy: "Diana F.", department: "Operations", oldStatus: "Offboarding Triggered", newStatus: "Department Shutdown", notes: "SEO and Reporting shutdown initiated" },
    ],
  },

  // 3. Pending access removal
  {
    id: "ob3",
    client: "Harbor Auto Group",
    offboardingStatus: "Access Removal",
    cancellationStatus: "Billing Cleared",
    billingStatus: "Cleared",
    amOwner: "Derek S.",
    operationsOwner: "Marcus L.",
    departmentsActive: [],
    finalReportStatus: "In Progress",
    accessRemovalStatus: "In Progress",
    priority: "High",
    dueDate: "Jul 8, 2025",
    nextRequiredAction: "Complete access removal across all platforms",
    checklist: {
      billingClosure: [
        { id: "bc1", task: "Final invoice sent", department: "Billing", assignedUser: "Sarah K.", status: "Completed", dueDate: "Jun 15" },
        { id: "bc2", task: "Outstanding balance reviewed", department: "Billing", assignedUser: "Sarah K.", status: "Completed", dueDate: "Jun 20" },
        { id: "bc3", task: "Refund/write-off confirmed", department: "Billing", assignedUser: "Sarah K.", status: "Completed", dueDate: "Jun 20" },
        { id: "bc4", task: "Billing closed", department: "Billing", assignedUser: "Sarah K.", status: "Completed", dueDate: "Jun 25" },
      ],
      amClosure: [
        { id: "am1", task: "Client notified", department: "AM", assignedUser: "Derek S.", status: "Completed", dueDate: "Jun 5" },
        { id: "am2", task: "Final check-in completed", department: "AM", assignedUser: "Derek S.", status: "Completed", dueDate: "Jun 15" },
        { id: "am3", task: "Renewal/cancellation notes saved", department: "AM", assignedUser: "Derek S.", status: "Completed", dueDate: "Jun 20" },
        { id: "am4", task: "Relationship status updated", department: "AM", assignedUser: "Derek S.", status: "Completed", dueDate: "Jun 25" },
      ],
      departmentShutdown: [
        { id: "ds1", task: "SEO stopped", department: "SEO", assignedUser: "Mike T.", status: "Completed", dueDate: "Jun 25" },
        { id: "ds2", task: "PPC stopped", department: "PPC", assignedUser: "Jenna R.", status: "Completed", dueDate: "Jun 25" },
        { id: "ds3", task: "Reporting stopped", department: "Reporting", assignedUser: "Carlos M.", status: "Completed", dueDate: "Jun 25" },
      ],
      accessRemoval: [
        { id: "ar1", task: "Ad accounts access removed", department: "Operations", assignedUser: "Marcus L.", status: "Completed", dueDate: "Jul 8" },
        { id: "ar2", task: "Website access removed", department: "Operations", assignedUser: "Marcus L.", status: "In Progress", dueDate: "Jul 8" },
        { id: "ar3", task: "Reporting dashboard access removed", department: "Operations", assignedUser: "Marcus L.", status: "In Progress", dueDate: "Jul 8" },
        { id: "ar4", task: "Shared folders access removed", department: "Operations", assignedUser: "Marcus L.", status: "Open", dueDate: "Jul 8" },
        { id: "ar5", task: "Client tools access removed", department: "Operations", assignedUser: "Marcus L.", status: "Open", dueDate: "Jul 8" },
      ],
      finalDeliverables: [
        { id: "fd1", task: "Final report prepared", department: "AM", assignedUser: "Derek S.", status: "In Progress", dueDate: "Jul 8" },
        { id: "fd2", task: "Final report sent", department: "AM", assignedUser: "Derek S.", status: "Open", dueDate: "Jul 8" },
        { id: "fd3", task: "Assets returned", department: "Operations", assignedUser: "Marcus L.", status: "Open", dueDate: "Jul 8" },
        { id: "fd4", task: "Closure confirmation sent", department: "AM", assignedUser: "Derek S.", status: "Open", dueDate: "Jul 8" },
      ],
    },
    deptShutdown: [
      { department: "SEO", serviceStatus: "Stopped", departmentOwner: "Mike T.", taskStatus: "Completed", dependencies: "None", dueDate: "Jun 25" },
      { department: "PPC", serviceStatus: "Stopped", departmentOwner: "Jenna R.", taskStatus: "Completed", dependencies: "None", dueDate: "Jun 25" },
      { department: "Reporting", serviceStatus: "Stopped", departmentOwner: "Carlos M.", taskStatus: "Completed", dependencies: "None", dueDate: "Jun 25" },
    ],
    accessItems: [
      { accessType: "Google Ads", platform: "Google", owner: "Jenna R.", removalStatus: "Removed", dueDate: "Jul 8", notes: "Confirmed Jun 28" },
      { accessType: "Website CMS", platform: "WordPress", owner: "Marcus L.", removalStatus: "In Progress", dueDate: "Jul 8", notes: "Awaiting client approval" },
      { accessType: "Reporting Dashboard", platform: "Internal", owner: "Carlos M.", removalStatus: "In Progress", dueDate: "Jul 8", notes: "" },
      { accessType: "Shared Drive", platform: "Google Drive", owner: "Marcus L.", removalStatus: "Not Started", dueDate: "Jul 8", notes: "" },
      { accessType: "CRM", platform: "HubSpot", owner: "Marcus L.", removalStatus: "Not Started", dueDate: "Jul 8", notes: "" },
    ],
    recentEvents: [
      { date: "Jun 28", eventType: "Department Shutdown Started", triggeredBy: "Diana F.", department: "Operations", oldStatus: "In Progress", newStatus: "Access Removal", notes: "All dept shutdown completed" },
      { date: "Jun 30", eventType: "Access Removed", triggeredBy: "Jenna R.", department: "PPC", oldStatus: "Access Removal", newStatus: "Access Removal", notes: "Google Ads access removed" },
    ],
  },

  // 4. Pending final report
  {
    id: "ob4",
    client: "Metro Dental",
    offboardingStatus: "Final Report",
    cancellationStatus: "Billing Cleared",
    billingStatus: "Cleared",
    amOwner: "Jordan M.",
    operationsOwner: "Diana F.",
    departmentsActive: [],
    finalReportStatus: "Prepared",
    accessRemovalStatus: "Completed",
    priority: "Medium",
    dueDate: "Jul 3, 2025",
    nextRequiredAction: "Send final report to client",
    checklist: {
      billingClosure: [
        { id: "bc1", task: "Final invoice sent", department: "Billing", assignedUser: "Sarah K.", status: "Completed", dueDate: "Jun 12" },
        { id: "bc2", task: "Outstanding balance reviewed", department: "Billing", assignedUser: "Sarah K.", status: "Completed", dueDate: "Jun 15" },
        { id: "bc3", task: "Refund/write-off confirmed", department: "Billing", assignedUser: "Sarah K.", status: "Not Applicable", dueDate: "—" },
        { id: "bc4", task: "Billing closed", department: "Billing", assignedUser: "Sarah K.", status: "Completed", dueDate: "Jun 20" },
      ],
      amClosure: [
        { id: "am1", task: "Client notified", department: "AM", assignedUser: "Jordan M.", status: "Completed", dueDate: "Jun 10" },
        { id: "am2", task: "Final check-in completed", department: "AM", assignedUser: "Jordan M.", status: "Completed", dueDate: "Jun 20" },
        { id: "am3", task: "Renewal/cancellation notes saved", department: "AM", assignedUser: "Jordan M.", status: "Completed", dueDate: "Jun 25" },
        { id: "am4", task: "Relationship status updated", department: "AM", assignedUser: "Jordan M.", status: "Completed", dueDate: "Jun 25" },
      ],
      departmentShutdown: [
        { id: "ds1", task: "SEO stopped", department: "SEO", assignedUser: "Mike T.", status: "Completed", dueDate: "Jun 22" },
        { id: "ds2", task: "Meta Ads stopped", department: "Meta Ads", assignedUser: "Alicia R.", status: "Completed", dueDate: "Jun 22" },
        { id: "ds3", task: "LSA stopped", department: "LSA", assignedUser: "Sam V.", status: "Completed", dueDate: "Jun 22" },
        { id: "ds4", task: "Reporting stopped", department: "Reporting", assignedUser: "Carlos M.", status: "Completed", dueDate: "Jun 22" },
        { id: "ds5", task: "Creative/design work closed", department: "Creative", assignedUser: "Tanya L.", status: "Completed", dueDate: "Jun 22" },
      ],
      accessRemoval: [
        { id: "ar1", task: "Ad accounts access removed", department: "Operations", assignedUser: "Diana F.", status: "Completed", dueDate: "Jun 28" },
        { id: "ar2", task: "Website access removed", department: "Operations", assignedUser: "Diana F.", status: "Completed", dueDate: "Jun 28" },
        { id: "ar3", task: "Reporting dashboard access removed", department: "Operations", assignedUser: "Diana F.", status: "Completed", dueDate: "Jun 28" },
        { id: "ar4", task: "Shared folders access removed", department: "Operations", assignedUser: "Diana F.", status: "Completed", dueDate: "Jun 28" },
        { id: "ar5", task: "Client tools access removed", department: "Operations", assignedUser: "Diana F.", status: "Completed", dueDate: "Jun 28" },
      ],
      finalDeliverables: [
        { id: "fd1", task: "Final report prepared", department: "AM", assignedUser: "Jordan M.", status: "Completed", dueDate: "Jul 1" },
        { id: "fd2", task: "Final report sent", department: "AM", assignedUser: "Jordan M.", status: "Open", dueDate: "Jul 3" },
        { id: "fd3", task: "Assets returned", department: "Operations", assignedUser: "Diana F.", status: "Completed", dueDate: "Jun 30" },
        { id: "fd4", task: "Closure confirmation sent", department: "AM", assignedUser: "Jordan M.", status: "Open", dueDate: "Jul 3" },
      ],
    },
    deptShutdown: [
      { department: "SEO", serviceStatus: "Stopped", departmentOwner: "Mike T.", taskStatus: "Completed", dependencies: "None", dueDate: "Jun 22" },
      { department: "Meta Ads", serviceStatus: "Stopped", departmentOwner: "Alicia R.", taskStatus: "Completed", dependencies: "None", dueDate: "Jun 22" },
      { department: "LSA", serviceStatus: "Stopped", departmentOwner: "Sam V.", taskStatus: "Completed", dependencies: "None", dueDate: "Jun 22" },
      { department: "Reporting", serviceStatus: "Stopped", departmentOwner: "Carlos M.", taskStatus: "Completed", dependencies: "None", dueDate: "Jun 22" },
      { department: "Creative", serviceStatus: "Stopped", departmentOwner: "Tanya L.", taskStatus: "Completed", dependencies: "None", dueDate: "Jun 22" },
    ],
    accessItems: [
      { accessType: "Meta Business Manager", platform: "Meta", owner: "Alicia R.", removalStatus: "Removed", dueDate: "Jun 28", notes: "" },
      { accessType: "Google Ads", platform: "Google", owner: "Jenna R.", removalStatus: "Removed", dueDate: "Jun 28", notes: "" },
      { accessType: "Website CMS", platform: "WordPress", owner: "Diana F.", removalStatus: "Removed", dueDate: "Jun 28", notes: "" },
      { accessType: "Reporting Dashboard", platform: "Internal", owner: "Carlos M.", removalStatus: "Removed", dueDate: "Jun 28", notes: "" },
      { accessType: "Shared Drive", platform: "Google Drive", owner: "Diana F.", removalStatus: "Removed", dueDate: "Jun 28", notes: "" },
    ],
    recentEvents: [
      { date: "Jun 28", eventType: "Access Removed", triggeredBy: "Diana F.", department: "Operations", oldStatus: "Access Removal", newStatus: "Final Report", notes: "All access removed" },
      { date: "Jul 1", eventType: "Final Report Uploaded", triggeredBy: "Jordan M.", department: "AM", oldStatus: "Final Report", newStatus: "Final Report", notes: "Report prepared, pending send" },
    ],
  },

  // 5. Blocked by unpaid balance
  {
    id: "ob5",
    client: "Blue Ridge Plumbing",
    offboardingStatus: "Waiting on Billing",
    cancellationStatus: "Escalated",
    billingStatus: "Outstanding Balance",
    amOwner: "Jordan M.",
    operationsOwner: "Marcus L.",
    departmentsActive: ["SEO"],
    finalReportStatus: "Not Started",
    accessRemovalStatus: "Not Started",
    priority: "Critical",
    dueDate: "Jun 30, 2025",
    nextRequiredAction: "Escalate $800 balance to AM — account on hold",
    checklist: {
      billingClosure: [
        { id: "bc1", task: "Final invoice sent", department: "Billing", assignedUser: "Sarah K.", status: "Completed", dueDate: "Jun 15" },
        { id: "bc2", task: "Outstanding balance reviewed", department: "Billing", assignedUser: "Sarah K.", status: "Blocked", dueDate: "Jun 20" },
        { id: "bc3", task: "Refund/write-off confirmed", department: "Billing", assignedUser: "Sarah K.", status: "Open", dueDate: "Jun 30" },
        { id: "bc4", task: "Billing closed", department: "Billing", assignedUser: "Sarah K.", status: "Open", dueDate: "Jun 30" },
      ],
      amClosure: [
        { id: "am1", task: "Client notified", department: "AM", assignedUser: "Jordan M.", status: "Completed", dueDate: "Jun 12" },
        { id: "am2", task: "Final check-in completed", department: "AM", assignedUser: "Jordan M.", status: "In Progress", dueDate: "Jun 25" },
        { id: "am3", task: "Renewal/cancellation notes saved", department: "AM", assignedUser: "Jordan M.", status: "Open", dueDate: "Jun 30" },
        { id: "am4", task: "Relationship status updated", department: "AM", assignedUser: "Jordan M.", status: "Open", dueDate: "Jun 30" },
      ],
      departmentShutdown: [
        { id: "ds1", task: "SEO stopped", department: "SEO", assignedUser: "Mike T.", status: "Open", dueDate: "Jun 30" },
        { id: "ds2", task: "GBP access reviewed", department: "Operations", assignedUser: "Marcus L.", status: "Open", dueDate: "Jun 30" },
      ],
      accessRemoval: [
        { id: "ar1", task: "Website access removed", department: "Operations", assignedUser: "Marcus L.", status: "Open", dueDate: "Jun 30" },
        { id: "ar2", task: "Shared folders access removed", department: "Operations", assignedUser: "Marcus L.", status: "Open", dueDate: "Jun 30" },
      ],
      finalDeliverables: [
        { id: "fd1", task: "Final report prepared", department: "AM", assignedUser: "Jordan M.", status: "Open", dueDate: "Jun 30" },
        { id: "fd2", task: "Final report sent", department: "AM", assignedUser: "Jordan M.", status: "Open", dueDate: "Jun 30" },
        { id: "fd3", task: "Assets returned", department: "Operations", assignedUser: "Marcus L.", status: "Open", dueDate: "Jun 30" },
        { id: "fd4", task: "Closure confirmation sent", department: "AM", assignedUser: "Jordan M.", status: "Open", dueDate: "Jun 30" },
      ],
    },
    deptShutdown: [
      { department: "SEO", serviceStatus: "Active", departmentOwner: "Mike T.", taskStatus: "Not Started", dependencies: "Billing clearance", dueDate: "Jun 30" },
    ],
    accessItems: [
      { accessType: "Website CMS", platform: "WordPress", owner: "Marcus L.", removalStatus: "Not Started", dueDate: "Jun 30", notes: "Hold until billing resolved" },
      { accessType: "Google Search Console", platform: "Google", owner: "Mike T.", removalStatus: "Not Started", dueDate: "Jun 30", notes: "" },
    ],
    recentEvents: [
      { date: "Jun 12", eventType: "Offboarding Triggered", triggeredBy: "Billing", department: "Billing", oldStatus: "Approved", newStatus: "Waiting on Billing", notes: "$800 outstanding" },
      { date: "Jun 13", eventType: "Billing Clearance Requested", triggeredBy: "Sarah K.", department: "Billing", oldStatus: "Waiting on Billing", newStatus: "Waiting on Billing", notes: "Escalated — payment on hold" },
    ],
  },

  // 6. Waiting on AM closure
  {
    id: "ob6",
    client: "Green Valley Pools",
    offboardingStatus: "Waiting on AM",
    cancellationStatus: "Billing Cleared",
    billingStatus: "Cleared",
    amOwner: "Rachel T.",
    operationsOwner: "Diana F.",
    departmentsActive: ["Meta Ads"],
    finalReportStatus: "Not Started",
    accessRemovalStatus: "Not Started",
    priority: "High",
    dueDate: "Jul 12, 2025",
    nextRequiredAction: "AM to complete final check-in and save closure notes",
    checklist: {
      billingClosure: [
        { id: "bc1", task: "Final invoice sent", department: "Billing", assignedUser: "Lisa P.", status: "Completed", dueDate: "Jun 20" },
        { id: "bc2", task: "Outstanding balance reviewed", department: "Billing", assignedUser: "Lisa P.", status: "Completed", dueDate: "Jun 22" },
        { id: "bc3", task: "Refund/write-off confirmed", department: "Billing", assignedUser: "Lisa P.", status: "Not Applicable", dueDate: "—" },
        { id: "bc4", task: "Billing closed", department: "Billing", assignedUser: "Lisa P.", status: "Completed", dueDate: "Jun 25" },
      ],
      amClosure: [
        { id: "am1", task: "Client notified", department: "AM", assignedUser: "Rachel T.", status: "Completed", dueDate: "Jun 18" },
        { id: "am2", task: "Final check-in completed", department: "AM", assignedUser: "Rachel T.", status: "In Progress", dueDate: "Jul 5" },
        { id: "am3", task: "Renewal/cancellation notes saved", department: "AM", assignedUser: "Rachel T.", status: "Open", dueDate: "Jul 10" },
        { id: "am4", task: "Relationship status updated", department: "AM", assignedUser: "Rachel T.", status: "Open", dueDate: "Jul 12" },
      ],
      departmentShutdown: [
        { id: "ds1", task: "Meta Ads stopped", department: "Meta Ads", assignedUser: "Alicia R.", status: "Open", dueDate: "Jul 12" },
        { id: "ds2", task: "Reporting stopped", department: "Reporting", assignedUser: "Carlos M.", status: "Open", dueDate: "Jul 12" },
      ],
      accessRemoval: [
        { id: "ar1", task: "Ad accounts access removed", department: "Operations", assignedUser: "Diana F.", status: "Open", dueDate: "Jul 12" },
        { id: "ar2", task: "Reporting dashboard access removed", department: "Operations", assignedUser: "Diana F.", status: "Open", dueDate: "Jul 12" },
      ],
      finalDeliverables: [
        { id: "fd1", task: "Final report prepared", department: "AM", assignedUser: "Rachel T.", status: "Open", dueDate: "Jul 12" },
        { id: "fd2", task: "Final report sent", department: "AM", assignedUser: "Rachel T.", status: "Open", dueDate: "Jul 12" },
        { id: "fd3", task: "Assets returned", department: "Operations", assignedUser: "Diana F.", status: "Open", dueDate: "Jul 12" },
        { id: "fd4", task: "Closure confirmation sent", department: "AM", assignedUser: "Rachel T.", status: "Open", dueDate: "Jul 12" },
      ],
    },
    deptShutdown: [
      { department: "Meta Ads", serviceStatus: "Active", departmentOwner: "Alicia R.", taskStatus: "Not Started", dependencies: "AM closure complete", dueDate: "Jul 12" },
      { department: "Reporting", serviceStatus: "Active", departmentOwner: "Carlos M.", taskStatus: "Not Started", dependencies: "AM closure complete", dueDate: "Jul 12" },
    ],
    accessItems: [
      { accessType: "Meta Business Manager", platform: "Meta", owner: "Alicia R.", removalStatus: "Not Started", dueDate: "Jul 12", notes: "" },
      { accessType: "Reporting Dashboard", platform: "Internal", owner: "Carlos M.", removalStatus: "Not Started", dueDate: "Jul 12", notes: "" },
    ],
    recentEvents: [
      { date: "Jun 25", eventType: "Offboarding Triggered", triggeredBy: "Billing", department: "Billing", oldStatus: "Billing Cleared", newStatus: "Waiting on AM", notes: "AM final check-in pending" },
    ],
  },

  // 7. Almost complete
  {
    id: "ob7",
    client: "Pacific Landscape",
    offboardingStatus: "Client Closure",
    cancellationStatus: "Billing Cleared",
    billingStatus: "Closed",
    amOwner: "Derek S.",
    operationsOwner: "Marcus L.",
    departmentsActive: [],
    finalReportStatus: "Sent",
    accessRemovalStatus: "Completed",
    priority: "Low",
    dueDate: "Jul 1, 2025",
    nextRequiredAction: "Send closure confirmation and archive account",
    checklist: {
      billingClosure: [
        { id: "bc1", task: "Final invoice sent", department: "Billing", assignedUser: "Lisa P.", status: "Completed", dueDate: "Jun 5" },
        { id: "bc2", task: "Outstanding balance reviewed", department: "Billing", assignedUser: "Lisa P.", status: "Completed", dueDate: "Jun 8" },
        { id: "bc3", task: "Refund/write-off confirmed", department: "Billing", assignedUser: "Lisa P.", status: "Completed", dueDate: "Jun 10" },
        { id: "bc4", task: "Billing closed", department: "Billing", assignedUser: "Lisa P.", status: "Completed", dueDate: "Jun 15" },
      ],
      amClosure: [
        { id: "am1", task: "Client notified", department: "AM", assignedUser: "Derek S.", status: "Completed", dueDate: "Jun 1" },
        { id: "am2", task: "Final check-in completed", department: "AM", assignedUser: "Derek S.", status: "Completed", dueDate: "Jun 10" },
        { id: "am3", task: "Renewal/cancellation notes saved", department: "AM", assignedUser: "Derek S.", status: "Completed", dueDate: "Jun 15" },
        { id: "am4", task: "Relationship status updated", department: "AM", assignedUser: "Derek S.", status: "Completed", dueDate: "Jun 20" },
      ],
      departmentShutdown: [
        { id: "ds1", task: "SEO stopped", department: "SEO", assignedUser: "Mike T.", status: "Completed", dueDate: "Jun 20" },
        { id: "ds2", task: "GBP access reviewed", department: "Operations", assignedUser: "Marcus L.", status: "Completed", dueDate: "Jun 20" },
        { id: "ds3", task: "Reporting stopped", department: "Reporting", assignedUser: "Carlos M.", status: "Completed", dueDate: "Jun 20" },
      ],
      accessRemoval: [
        { id: "ar1", task: "Ad accounts access removed", department: "Operations", assignedUser: "Marcus L.", status: "Completed", dueDate: "Jun 25" },
        { id: "ar2", task: "Website access removed", department: "Operations", assignedUser: "Marcus L.", status: "Completed", dueDate: "Jun 25" },
        { id: "ar3", task: "Reporting dashboard access removed", department: "Operations", assignedUser: "Marcus L.", status: "Completed", dueDate: "Jun 25" },
        { id: "ar4", task: "Shared folders access removed", department: "Operations", assignedUser: "Marcus L.", status: "Completed", dueDate: "Jun 25" },
        { id: "ar5", task: "Client tools access removed", department: "Operations", assignedUser: "Marcus L.", status: "Completed", dueDate: "Jun 25" },
      ],
      finalDeliverables: [
        { id: "fd1", task: "Final report prepared", department: "AM", assignedUser: "Derek S.", status: "Completed", dueDate: "Jun 28" },
        { id: "fd2", task: "Final report sent", department: "AM", assignedUser: "Derek S.", status: "Completed", dueDate: "Jun 30" },
        { id: "fd3", task: "Assets returned", department: "Operations", assignedUser: "Marcus L.", status: "Completed", dueDate: "Jun 28" },
        { id: "fd4", task: "Closure confirmation sent", department: "AM", assignedUser: "Derek S.", status: "Open", dueDate: "Jul 1" },
      ],
    },
    deptShutdown: [
      { department: "SEO", serviceStatus: "Stopped", departmentOwner: "Mike T.", taskStatus: "Completed", dependencies: "None", dueDate: "Jun 20" },
      { department: "Reporting", serviceStatus: "Stopped", departmentOwner: "Carlos M.", taskStatus: "Completed", dependencies: "None", dueDate: "Jun 20" },
    ],
    accessItems: [
      { accessType: "Google Search Console", platform: "Google", owner: "Mike T.", removalStatus: "Removed", dueDate: "Jun 25", notes: "" },
      { accessType: "Website CMS", platform: "WordPress", owner: "Marcus L.", removalStatus: "Removed", dueDate: "Jun 25", notes: "" },
      { accessType: "Reporting Dashboard", platform: "Internal", owner: "Carlos M.", removalStatus: "Removed", dueDate: "Jun 25", notes: "" },
      { accessType: "GBP", platform: "Google", owner: "Marcus L.", removalStatus: "Removed", dueDate: "Jun 25", notes: "" },
      { accessType: "Shared Drive", platform: "Google Drive", owner: "Marcus L.", removalStatus: "Removed", dueDate: "Jun 25", notes: "" },
    ],
    recentEvents: [
      { date: "Jun 30", eventType: "Final Report Uploaded", triggeredBy: "Derek S.", department: "AM", oldStatus: "Final Report", newStatus: "Client Closure", notes: "Final report sent to client" },
    ],
  },

  // 8. Fully completed
  {
    id: "ob8",
    client: "Pacific Dental",
    offboardingStatus: "Completed",
    cancellationStatus: "Closed",
    billingStatus: "Closed",
    amOwner: "Derek S.",
    operationsOwner: "Diana F.",
    departmentsActive: [],
    finalReportStatus: "Sent",
    accessRemovalStatus: "Completed",
    priority: "Low",
    dueDate: "May 15, 2025",
    nextRequiredAction: "Archived",
    checklist: {
      billingClosure: [
        { id: "bc1", task: "Final invoice sent", department: "Billing", assignedUser: "Lisa P.", status: "Completed", dueDate: "Apr 5" },
        { id: "bc2", task: "Outstanding balance reviewed", department: "Billing", assignedUser: "Lisa P.", status: "Completed", dueDate: "Apr 8" },
        { id: "bc3", task: "Refund/write-off confirmed", department: "Billing", assignedUser: "Lisa P.", status: "Not Applicable", dueDate: "—" },
        { id: "bc4", task: "Billing closed", department: "Billing", assignedUser: "Lisa P.", status: "Completed", dueDate: "Apr 15" },
      ],
      amClosure: [
        { id: "am1", task: "Client notified", department: "AM", assignedUser: "Derek S.", status: "Completed", dueDate: "Apr 1" },
        { id: "am2", task: "Final check-in completed", department: "AM", assignedUser: "Derek S.", status: "Completed", dueDate: "Apr 10" },
        { id: "am3", task: "Renewal/cancellation notes saved", department: "AM", assignedUser: "Derek S.", status: "Completed", dueDate: "Apr 15" },
        { id: "am4", task: "Relationship status updated", department: "AM", assignedUser: "Derek S.", status: "Completed", dueDate: "Apr 20" },
      ],
      departmentShutdown: [
        { id: "ds1", task: "SEO stopped", department: "SEO", assignedUser: "Mike T.", status: "Completed", dueDate: "Apr 20" },
        { id: "ds2", task: "PPC stopped", department: "PPC", assignedUser: "Jenna R.", status: "Completed", dueDate: "Apr 20" },
        { id: "ds3", task: "Meta Ads stopped", department: "Meta Ads", assignedUser: "Alicia R.", status: "Completed", dueDate: "Apr 20" },
        { id: "ds4", task: "GBP access reviewed", department: "Operations", assignedUser: "Diana F.", status: "Completed", dueDate: "Apr 20" },
        { id: "ds5", task: "LSA stopped", department: "LSA", assignedUser: "Sam V.", status: "Completed", dueDate: "Apr 20" },
        { id: "ds6", task: "Reporting stopped", department: "Reporting", assignedUser: "Carlos M.", status: "Completed", dueDate: "Apr 20" },
        { id: "ds7", task: "Creative/design work closed", department: "Creative", assignedUser: "Tanya L.", status: "Completed", dueDate: "Apr 20" },
      ],
      accessRemoval: [
        { id: "ar1", task: "Ad accounts access removed", department: "Operations", assignedUser: "Diana F.", status: "Completed", dueDate: "May 1" },
        { id: "ar2", task: "Website access removed", department: "Operations", assignedUser: "Diana F.", status: "Completed", dueDate: "May 1" },
        { id: "ar3", task: "Reporting dashboard access removed", department: "Operations", assignedUser: "Diana F.", status: "Completed", dueDate: "May 1" },
        { id: "ar4", task: "Shared folders access removed", department: "Operations", assignedUser: "Diana F.", status: "Completed", dueDate: "May 1" },
        { id: "ar5", task: "Client tools access removed", department: "Operations", assignedUser: "Diana F.", status: "Completed", dueDate: "May 1" },
      ],
      finalDeliverables: [
        { id: "fd1", task: "Final report prepared", department: "AM", assignedUser: "Derek S.", status: "Completed", dueDate: "May 8" },
        { id: "fd2", task: "Final report sent", department: "AM", assignedUser: "Derek S.", status: "Completed", dueDate: "May 10" },
        { id: "fd3", task: "Assets returned", department: "Operations", assignedUser: "Diana F.", status: "Completed", dueDate: "May 8" },
        { id: "fd4", task: "Closure confirmation sent", department: "AM", assignedUser: "Derek S.", status: "Completed", dueDate: "May 15" },
      ],
    },
    deptShutdown: [
      { department: "SEO", serviceStatus: "Stopped", departmentOwner: "Mike T.", taskStatus: "Completed", dependencies: "None", dueDate: "Apr 20" },
      { department: "PPC", serviceStatus: "Stopped", departmentOwner: "Jenna R.", taskStatus: "Completed", dependencies: "None", dueDate: "Apr 20" },
      { department: "Meta Ads", serviceStatus: "Stopped", departmentOwner: "Alicia R.", taskStatus: "Completed", dependencies: "None", dueDate: "Apr 20" },
      { department: "Reporting", serviceStatus: "Stopped", departmentOwner: "Carlos M.", taskStatus: "Completed", dependencies: "None", dueDate: "Apr 20" },
    ],
    accessItems: [
      { accessType: "Google Ads", platform: "Google", owner: "Jenna R.", removalStatus: "Removed", dueDate: "May 1", notes: "" },
      { accessType: "Meta Business Manager", platform: "Meta", owner: "Alicia R.", removalStatus: "Removed", dueDate: "May 1", notes: "" },
      { accessType: "Website CMS", platform: "WordPress", owner: "Diana F.", removalStatus: "Removed", dueDate: "May 1", notes: "" },
      { accessType: "Reporting Dashboard", platform: "Internal", owner: "Carlos M.", removalStatus: "Removed", dueDate: "May 1", notes: "" },
      { accessType: "Shared Drive", platform: "Google Drive", owner: "Diana F.", removalStatus: "Removed", dueDate: "May 1", notes: "" },
    ],
    recentEvents: [
      { date: "May 15", eventType: "Client Closure Completed", triggeredBy: "Derek S.", department: "AM", oldStatus: "Client Closure", newStatus: "Completed", notes: "Full offboarding complete. Account archived." },
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function offboardingStatusBadge(s: OffboardingStatus): BadgeVariant {
  switch (s) {
    case "Completed": return "success";
    case "Client Closure": return "success";
    case "Waiting on Billing": return "error";
    case "Waiting on AM": return "warning";
    case "Department Shutdown": return "info";
    case "Access Removal": return "info";
    case "Final Report": return "pending";
    case "In Progress": return "pending";
    case "Offboarding Triggered": return "neutral";
  }
}

function billingStatusBadge(s: BillingStatus): BadgeVariant {
  switch (s) {
    case "Cleared": return "success";
    case "Closed": return "success";
    case "Outstanding Balance": return "error";
    case "Pending Review": return "warning";
    case "Final Invoice Sent": return "pending";
    case "Written Off": return "neutral";
  }
}

function cancellationStatusBadge(s: CancellationStatus): BadgeVariant {
  switch (s) {
    case "Approved": return "success";
    case "Billing Cleared": return "success";
    case "Closed": return "neutral";
    case "Pending Balance": return "error";
    case "Billing Hold": return "warning";
    case "Escalated": return "error";
  }
}

function accessRemovalBadge(s: AccessRemovalStatus): BadgeVariant {
  switch (s) {
    case "Completed": return "success";
    case "In Progress": return "pending";
    case "Partial": return "warning";
    case "Not Started": return "neutral";
  }
}

function finalReportBadge(s: FinalReportStatus): BadgeVariant {
  switch (s) {
    case "Sent": return "success";
    case "Prepared": return "info";
    case "In Progress": return "pending";
    case "Not Started": return "neutral";
    case "N/A": return "neutral";
  }
}

function priorityBadge(p: Priority): BadgeVariant {
  switch (p) {
    case "Critical": return "error";
    case "High": return "warning";
    case "Medium": return "info";
    case "Low": return "neutral";
  }
}

function checklistStatusBadge(s: ChecklistItemStatus): BadgeVariant {
  switch (s) {
    case "Completed": return "success";
    case "In Progress": return "pending";
    case "Blocked": return "error";
    case "Open": return "neutral";
    case "Not Applicable": return "neutral";
  }
}

function deptServiceBadge(s: DeptShutdown["serviceStatus"]): BadgeVariant {
  switch (s) {
    case "Active": return "error";
    case "Stopping": return "warning";
    case "Stopped": return "success";
    case "N/A": return "neutral";
  }
}

function accessRemovalItemBadge(s: AccessItem["removalStatus"]): BadgeVariant {
  switch (s) {
    case "Removed": return "success";
    case "In Progress": return "pending";
    case "Not Started": return "neutral";
    case "N/A": return "neutral";
  }
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Btn({
  children,
  variant = "secondary",
  onClick,
  small,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  onClick?: () => void;
  small?: boolean;
}) {
  const base = `inline-flex items-center gap-1.5 font-semibold rounded-lg border transition-all duration-150 cursor-pointer ${small ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm"}`;
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: "var(--rtm-blue)", color: "#fff", borderColor: "var(--rtm-blue)" },
    secondary: { background: "var(--rtm-surface)", color: "var(--rtm-text-primary)", borderColor: "var(--rtm-border)" },
    danger: { background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" },
    ghost: { background: "transparent", color: "var(--rtm-text-secondary)", borderColor: "transparent" },
  };
  return (
    <button className={base} style={styles[variant]} onClick={onClick}>
      {children}
    </button>
  );
}

function WorkflowLifecycle() {
  const steps = [
    { label: "Cancellation\nApproved", icon: "✅", color: "#059669" },
    { label: "Billing\nReview", icon: "🔍", color: "#3B82F6" },
    { label: "Billing\nCleared", icon: "💳", color: "#059669" },
    { label: "Offboarding\nTriggered", icon: "🚀", color: "#6366F1" },
    { label: "Dept\nShutdown", icon: "🛑", color: "#F59E0B" },
    { label: "Access\nRemoval", icon: "🔐", color: "#EF4444" },
    { label: "Final\nReport", icon: "📄", color: "#8B5CF6" },
    { label: "Client\nClosure", icon: "🤝", color: "#0EA5E9" },
    { label: "Offboarded", icon: "🏁", color: "#10B981" },
  ];

  return (
    <div className="flex items-start gap-0 flex-wrap">
      {steps.map((step, i) => (
        <React.Fragment key={step.label}>
          <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg border-2"
              style={{ borderColor: step.color, background: `${step.color}18` }}
            >
              {step.icon}
            </div>
            <span
              className="text-[10px] font-semibold text-center leading-tight"
              style={{ color: "var(--rtm-text-secondary)", whiteSpace: "pre-line" }}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="flex items-start pt-4 px-1">
              <span style={{ color: "var(--rtm-text-muted)", fontSize: 18 }}>→</span>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function ChecklistSection({ client }: { client: OffboardingClient }) {
  const categories = [
    { title: "1. Billing Closure", icon: "💳", items: client.checklist.billingClosure },
    { title: "2. AM Closure", icon: "🤝", items: client.checklist.amClosure },
    { title: "3. Department Shutdown", icon: "🛑", items: client.checklist.departmentShutdown },
    { title: "4. Access Removal", icon: "🔐", items: client.checklist.accessRemoval },
    { title: "5. Final Deliverables", icon: "📄", items: client.checklist.finalDeliverables },
  ];

  const total = categories.reduce((a, c) => a + c.items.length, 0);
  const done = categories.reduce((a, c) => a + c.items.filter((i) => i.status === "Completed" || i.status === "Not Applicable").length, 0);
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full" style={{ background: "var(--rtm-border)" }}>
          <div
            className="h-2 rounded-full transition-all"
            style={{ width: `${pct}%`, background: pct === 100 ? "#059669" : "var(--rtm-blue)" }}
          />
        </div>
        <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>
          {done}/{total} complete ({pct}%)
        </span>
      </div>

      {categories.map((cat) => (
        <div key={cat.title}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">{cat.icon}</span>
            <span className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{cat.title}</span>
          </div>
          <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--rtm-border)" }}>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: "var(--rtm-surface-alt, #F8FAFC)", borderBottom: "1px solid var(--rtm-border-light)" }}>
                  {["Task", "Owner Dept", "Assigned User", "Status", "Due Date", "Action"].map((h) => (
                    <th key={h} className="text-left px-3 py-2 font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cat.items.map((item, idx) => (
                  <tr
                    key={item.id}
                    style={{
                      background: idx % 2 === 0 ? "var(--rtm-surface)" : "var(--rtm-surface-alt, #F8FAFC)",
                      borderBottom: "1px solid var(--rtm-border-light)",
                    }}
                  >
                    <td className="px-3 py-2 font-medium" style={{ color: "var(--rtm-text-primary)" }}>
                      {item.status === "Completed" || item.status === "Not Applicable" ? (
                        <span className="line-through opacity-60">{item.task}</span>
                      ) : item.task}
                    </td>
                    <td className="px-3 py-2" style={{ color: "var(--rtm-text-secondary)" }}>{item.department}</td>
                    <td className="px-3 py-2" style={{ color: "var(--rtm-text-secondary)" }}>{item.assignedUser}</td>
                    <td className="px-3 py-2"><StatusBadge variant={checklistStatusBadge(item.status)} label={item.status} size="sm" /></td>
                    <td className="px-3 py-2" style={{ color: "var(--rtm-text-secondary)" }}>{item.dueDate}</td>
                    <td className="px-3 py-2">
                      {item.status !== "Completed" && item.status !== "Not Applicable" && (
                        <Btn variant="ghost" small>Mark Done</Btn>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Modals ─────────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,28,56,0.45)" }}>
      <div
        className="w-full max-w-lg rounded-2xl border shadow-2xl flex flex-col max-h-[90vh]"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--rtm-border-light)" }}
        >
          <h3 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg hover:opacity-70 transition-opacity"
            style={{ background: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)" }}
          >
            ×
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ defaultValue, placeholder }: { defaultValue?: string; placeholder?: string }) {
  return (
    <input
      className="w-full px-3 py-2 rounded-lg border text-sm"
      style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-surface)", color: "var(--rtm-text-primary)" }}
      defaultValue={defaultValue}
      placeholder={placeholder}
    />
  );
}

function Select({ options, defaultValue }: { options: string[]; defaultValue?: string }) {
  return (
    <select
      className="w-full px-3 py-2 rounded-lg border text-sm"
      style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-surface)", color: "var(--rtm-text-primary)" }}
      defaultValue={defaultValue}
    >
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}

function Textarea({ placeholder, rows = 3 }: { placeholder?: string; rows?: number }) {
  return (
    <textarea
      className="w-full px-3 py-2 rounded-lg border text-sm resize-none"
      style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-surface)", color: "var(--rtm-text-primary)" }}
      placeholder={placeholder}
      rows={rows}
    />
  );
}

function AssignOwnerModal({ record, onClose }: { record: OffboardingClient; onClose: () => void }) {
  return (
    <Modal title="Assign Owner" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <FieldRow label="Client"><Input defaultValue={record.client} /></FieldRow>
        <FieldRow label="Current AM Owner"><Input defaultValue={record.amOwner} /></FieldRow>
        <FieldRow label="New AM Owner"><Select options={["Rachel T.", "Jordan M.", "Amanda B.", "Derek S."]} defaultValue={record.amOwner} /></FieldRow>
        <FieldRow label="New Operations Owner"><Select options={["Marcus L.", "Diana F."]} defaultValue={record.operationsOwner} /></FieldRow>
        <FieldRow label="Notes"><Textarea placeholder="Reason for reassignment..." /></FieldRow>
        <div className="flex justify-end gap-2 pt-2">
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={onClose}>Assign Owner</Btn>
        </div>
      </div>
    </Modal>
  );
}

function UpdateStatusModal({ record, onClose }: { record: OffboardingClient; onClose: () => void }) {
  const statuses: OffboardingStatus[] = [
    "Offboarding Triggered", "In Progress", "Waiting on Billing", "Waiting on AM",
    "Department Shutdown", "Access Removal", "Final Report", "Client Closure", "Completed",
  ];
  return (
    <Modal title="Update Offboarding Status" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <FieldRow label="Client"><Input defaultValue={record.client} /></FieldRow>
        <FieldRow label="Current Status">
          <div className="py-1"><StatusBadge variant={offboardingStatusBadge(record.offboardingStatus)} label={record.offboardingStatus} /></div>
        </FieldRow>
        <FieldRow label="New Status"><Select options={statuses} defaultValue={record.offboardingStatus} /></FieldRow>
        <FieldRow label="Notes"><Textarea placeholder="Reason for status update, context for handoffs..." /></FieldRow>
        <div className="flex justify-end gap-2 pt-2">
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={onClose}>Update Status</Btn>
        </div>
      </div>
    </Modal>
  );
}

function CreateShutdownTasksModal({ record, onClose }: { record: OffboardingClient; onClose: () => void }) {
  const depts = ["SEO", "PPC", "Meta Ads", "GBP", "LSA", "Reporting", "Web", "Creative"];
  return (
    <Modal title="Create Shutdown Tasks" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <FieldRow label="Client"><Input defaultValue={record.client} /></FieldRow>
        <FieldRow label="Departments to Shut Down">
          <div className="grid grid-cols-2 gap-2">
            {depts.map((d) => (
              <label key={d} className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--rtm-text-primary)" }}>
                <input type="checkbox" defaultChecked={record.departmentsActive.includes(d)} className="w-4 h-4 rounded" />
                {d}
              </label>
            ))}
          </div>
        </FieldRow>
        <FieldRow label="Assigned Owners (comma-separated)"><Input placeholder="Mike T., Jenna R., Carlos M." /></FieldRow>
        <FieldRow label="Due Date"><Input placeholder="Jul 15, 2025" /></FieldRow>
        <FieldRow label="Notes"><Textarea placeholder="Dependencies, sequencing notes..." /></FieldRow>
        <div className="flex justify-end gap-2 pt-2">
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={onClose}>Create Shutdown Tasks</Btn>
        </div>
      </div>
    </Modal>
  );
}

function RequestBillingClearanceModal({ record, onClose }: { record: OffboardingClient; onClose: () => void }) {
  return (
    <Modal title="Request Billing Clearance" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <FieldRow label="Client"><Input defaultValue={record.client} /></FieldRow>
        <FieldRow label="Current Billing Status">
          <div className="py-1"><StatusBadge variant={billingStatusBadge(record.billingStatus)} label={record.billingStatus} /></div>
        </FieldRow>
        <FieldRow label="Request Notes"><Textarea placeholder="Outstanding balance amount, invoice details, escalation context..." /></FieldRow>
        <FieldRow label="Priority"><Select options={["Critical", "High", "Medium", "Low"]} defaultValue={record.priority} /></FieldRow>
        <div
          className="flex items-start gap-3 p-3 rounded-lg border text-xs"
          style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#B45309" }}
        >
          <span className="text-base">⚠️</span>
          <span>This will notify the Billing team and create a clearance request task. Offboarding will remain blocked until clearance is confirmed.</span>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={onClose}>Request Billing Clearance</Btn>
        </div>
      </div>
    </Modal>
  );
}

function RemoveAccessModal({ record, onClose }: { record: OffboardingClient; onClose: () => void }) {
  const platforms = ["Google Ads", "Meta Business Manager", "Google Analytics", "Google Search Console", "GBP", "Website CMS", "Reporting Dashboard", "Shared Drive", "Call Tracking", "CRM"];
  return (
    <Modal title="Mark Access Removed" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <FieldRow label="Client"><Input defaultValue={record.client} /></FieldRow>
        <FieldRow label="Platform"><Select options={platforms} /></FieldRow>
        <FieldRow label="Access Type"><Input placeholder="Admin, Read-only, Editor..." /></FieldRow>
        <FieldRow label="Removal Status"><Select options={["Not Started", "In Progress", "Removed", "N/A"]} defaultValue="Removed" /></FieldRow>
        <FieldRow label="Notes"><Textarea placeholder="Confirmation details, who performed removal..." /></FieldRow>
        <div className="flex justify-end gap-2 pt-2">
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={onClose}>Mark Access Removed</Btn>
        </div>
      </div>
    </Modal>
  );
}

function UploadFinalReportModal({ record, onClose }: { record: OffboardingClient; onClose: () => void }) {
  return (
    <Modal title="Upload Final Report" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <FieldRow label="Client"><Input defaultValue={record.client} /></FieldRow>
        <FieldRow label="Report Name"><Input placeholder="Final Performance Report - Jun 2025" /></FieldRow>
        <FieldRow label="Report Status"><Select options={["Not Started", "In Progress", "Prepared", "Sent"]} defaultValue={record.finalReportStatus} /></FieldRow>
        <FieldRow label="File Upload">
          <div
            className="border-2 border-dashed rounded-lg p-6 text-center"
            style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-muted)" }}
          >
            <div className="text-2xl mb-1">📁</div>
            <div className="text-sm font-medium">Drag & drop or click to upload</div>
            <div className="text-xs mt-0.5">PDF, XLSX, PPTX accepted</div>
          </div>
        </FieldRow>
        <FieldRow label="Notes"><Textarea placeholder="Scope covered, key metrics, handoff notes..." /></FieldRow>
        <div className="flex justify-end gap-2 pt-2">
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={onClose}>Mark Final Report Uploaded</Btn>
        </div>
      </div>
    </Modal>
  );
}

function MarkCompleteModal({ record, onClose }: { record: OffboardingClient; onClose: () => void }) {
  return (
    <Modal title="Complete Offboarding" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <FieldRow label="Client"><Input defaultValue={record.client} /></FieldRow>
        <div className="p-3 rounded-lg border" style={{ background: "#ECFDF5", borderColor: "#A7F3D0" }}>
          <div className="text-sm font-semibold mb-2" style={{ color: "#059669" }}>✅ Pre-completion Checklist</div>
          <div className="flex flex-col gap-1.5 text-xs" style={{ color: "#065F46" }}>
            {[
              "All billing tasks completed and billing closed",
              "AM closure notes saved and relationship status updated",
              "All department shutdown tasks completed",
              "All platform access removed",
              "Final report prepared and sent to client",
              "Assets returned to client",
              "Closure confirmation sent",
            ].map((item) => (
              <label key={item} className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" className="mt-0.5 w-4 h-4 rounded" />
                {item}
              </label>
            ))}
          </div>
        </div>
        <FieldRow label="Completion Notes"><Textarea placeholder="Final notes, exceptions, anything to flag for records..." rows={4} /></FieldRow>
        <div
          className="flex items-start gap-3 p-3 rounded-lg border text-xs"
          style={{ background: "#EFF6FF", borderColor: "#BFDBFE", color: "#1D4ED8" }}
        >
          <span className="text-base">ℹ️</span>
          <span>Completing offboarding will archive this account and update the client status across Account Management, Billing, and the Client Portfolio. This action cannot be undone.</span>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={onClose}>Complete Offboarding</Btn>
        </div>
      </div>
    </Modal>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function OffboardingPage() {
  const [modal, setModal] = useState<ModalKind>(null);
  const [selectedClient, setSelectedClient] = useState<OffboardingClient | null>(mockClients[0]);
  const [activeTab, setActiveTab] = useState<"queue" | "checklist" | "departments" | "access" | "events">("queue");

  // KPI Counts
  const activeCount = mockClients.filter((c) => c.offboardingStatus !== "Completed").length;
  const pendingBilling = mockClients.filter((c) => c.offboardingStatus === "Waiting on Billing").length;
  const pendingDeptShutdown = mockClients.filter((c) => c.offboardingStatus === "Department Shutdown" || (c.offboardingStatus === "In Progress" && c.departmentsActive.length > 0)).length;
  const pendingAccess = mockClients.filter((c) => c.accessRemovalStatus === "Not Started" || c.accessRemovalStatus === "In Progress" || c.accessRemovalStatus === "Partial").length;
  const pendingFinalReport = mockClients.filter((c) => c.finalReportStatus === "Not Started" || c.finalReportStatus === "In Progress").length;
  const pendingHandoff = mockClients.filter((c) => c.offboardingStatus === "Waiting on AM" || c.offboardingStatus === "Client Closure").length;
  const completedThisMonth = mockClients.filter((c) => c.offboardingStatus === "Completed").length;
  const overdue = mockClients.filter((c) => c.priority === "Critical" && c.offboardingStatus !== "Completed").length;

  const closeModal = () => setModal(null);

  const TABS = [
    { id: "queue", label: "Offboarding Queue" },
    { id: "checklist", label: "Checklist" },
    { id: "departments", label: "Dept Shutdown" },
    { id: "access", label: "Access Removal" },
    { id: "events", label: "Recent Events" },
  ] as const;

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-primary)", fontFamily: "var(--rtm-font-sans, system-ui, sans-serif)" }}
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="px-6 pt-6 pb-4" style={{ borderBottom: "1px solid var(--rtm-border)" }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🏁</span>
              <h1 className="text-2xl font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                Offboarding Command Center
              </h1>
            </div>
            <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
              Manage cancelled client handoff, department shutdown, billing closure, access removal, asset return, and final account closure.
            </p>
          </div>
          {/* Top Action Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <Btn variant="primary">＋ New Offboarding Case</Btn>
            <Btn variant="secondary">📤 Export Offboarding Queue</Btn>
            <Btn variant="secondary">🔄 Sync Billing Closure</Btn>
            <Link href="/billing/cancellations">
              <Btn variant="ghost">👁 View Cancelled Clients</Btn>
            </Link>
          </div>
        </div>

        {/* Breadcrumb / route context */}
        <div className="flex items-center gap-1.5 mt-3 text-xs" style={{ color: "var(--rtm-text-muted)" }}>
          <Link href="/billing/cancellations" className="hover:underline">Billing / Cancellations</Link>
          <span>›</span>
          <Link href="/account-management" className="hover:underline">Account Management</Link>
          <span>›</span>
          <Link href="/clients" className="hover:underline">Clients</Link>
          <span>›</span>
          <Link href="/tasks" className="hover:underline">Tasks</Link>
          <span>›</span>
          <span style={{ color: "var(--rtm-text-secondary)" }}>Offboarding</span>
        </div>
      </div>

      <div className="px-6 py-6 flex flex-col gap-6">

        {/* ── Workflow Lifecycle ─────────────────────────────────────────────── */}
        <SectionWrapper title="Offboarding Lifecycle" description="Billing-to-closure workflow — track where each client sits in the pipeline">
          <div className="overflow-x-auto pb-2">
            <WorkflowLifecycle />
          </div>
          <div className="mt-3 flex items-start gap-3 p-3 rounded-lg border text-xs" style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#B45309" }}>
            <span>⚠️</span>
            <span>
              <strong>Blocked path:</strong> Offboarding Triggered → Waiting on Billing → Escalated to AM.{" "}
              <Link href="/billing/cancellations" className="underline font-medium">Resolve in Billing / Cancellations</Link>{" "}
              before department shutdown can proceed.
            </span>
          </div>
        </SectionWrapper>

  
      {/* ── Task Management Engine Banner ── */}
      <div className="px-6 py-3">
        <TaskAccessCard
          context="Offboarding"
          variant="banner"
          counters={{ open: 7, overdue: 2, dueToday: 3, completed: 18 }}
          createLabel="Create Offboarding Task"
          examples={["Create Shutdown Task", "Access Removal Task", "Final Report", "Billing Close"]}
        />
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { title: "Active Offboarding", value: String(activeCount), icon: "📋", iconBg: "#EFF6FF", iconColor: "#3B82F6", subtitle: "in progress" },
            { title: "Pending Billing Clearance", value: String(pendingBilling), icon: "💳", iconBg: "#FEF2F2", iconColor: "#DC2626", subtitle: "waiting" },
            { title: "Dept Shutdown Pending", value: String(pendingDeptShutdown), icon: "🛑", iconBg: "#FFFBEB", iconColor: "#B45309", subtitle: "active depts" },
            { title: "Access Removal Pending", value: String(pendingAccess), icon: "🔐", iconBg: "#FEF2F2", iconColor: "#EF4444", subtitle: "need removal" },
            { title: "Final Report Pending", value: String(pendingFinalReport), icon: "📄", iconBg: "#F5F3FF", iconColor: "#7C3AED", subtitle: "not sent" },
            { title: "Pending Client Handoff", value: String(pendingHandoff), icon: "🤝", iconBg: "#EFF6FF", iconColor: "#0EA5E9", subtitle: "need handoff" },
            { title: "Completed This Month", value: String(completedThisMonth), icon: "✅", iconBg: "#ECFDF5", iconColor: "#059669", subtitle: "closed" },
            { title: "Overdue Tasks", value: String(overdue), icon: "🚨", iconBg: "#FEF2F2", iconColor: "#DC2626", subtitle: "critical" },
          ].map((k) => (
            <KpiCard key={k.title} title={k.title} value={k.value} subtitle={k.subtitle} icon={<span className="text-lg">{k.icon}</span>} iconBg={k.iconBg} iconColor={k.iconColor} />
          ))}
        </div>

        {/* ── Tab Nav ───────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-0 border-b" style={{ borderColor: "var(--rtm-border)" }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors"
              style={{
                borderBottomColor: activeTab === tab.id ? "var(--rtm-blue)" : "transparent",
                color: activeTab === tab.id ? "var(--rtm-blue)" : "var(--rtm-text-muted)",
                background: "transparent",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── OFFBOARDING QUEUE ─────────────────────────────────────────────── */}
        {activeTab === "queue" && (
          <SectionWrapper
            title="Main Offboarding Queue"
            description="All active and recent offboarding cases"
            actions={
              <div className="flex gap-2">
                <Btn variant="secondary" small>Filter</Btn>
                <Btn variant="secondary" small>Sort</Btn>
              </div>
            }
            noPadding
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: "var(--rtm-surface-alt, #F8FAFC)", borderBottom: "1px solid var(--rtm-border-light)" }}>
                    {[
                      "Client", "Offboarding Status", "Cancellation Status", "Billing Status",
                      "AM Owner", "Ops Owner", "Depts Active", "Final Report", "Access Removal",
                      "Priority", "Due Date", "Next Action", "Actions",
                    ].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockClients.map((c, idx) => (
                    <tr
                      key={c.id}
                      className="cursor-pointer hover:bg-blue-50/40 transition-colors"
                      style={{ borderBottom: "1px solid var(--rtm-border-light)", background: idx % 2 === 0 ? "var(--rtm-surface)" : "var(--rtm-surface-alt, #F8FAFC)" }}
                      onClick={() => { setSelectedClient(c); setActiveTab("checklist"); }}
                    >
                      <td className="px-4 py-3">
                        <span className="font-semibold text-sm" style={{ color: "var(--rtm-text-primary)" }}>{c.client}</span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge variant={offboardingStatusBadge(c.offboardingStatus)} label={c.offboardingStatus} size="sm" /></td>
                      <td className="px-4 py-3"><StatusBadge variant={cancellationStatusBadge(c.cancellationStatus)} label={c.cancellationStatus} size="sm" /></td>
                      <td className="px-4 py-3"><StatusBadge variant={billingStatusBadge(c.billingStatus)} label={c.billingStatus} size="sm" /></td>
                      <td className="px-4 py-3" style={{ color: "var(--rtm-text-secondary)" }}>{c.amOwner}</td>
                      <td className="px-4 py-3" style={{ color: "var(--rtm-text-secondary)" }}>{c.operationsOwner}</td>
                      <td className="px-4 py-3">
                        {c.departmentsActive.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {c.departmentsActive.map((d) => (
                              <span key={d} className="px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ background: "#FEF2F2", color: "#DC2626" }}>{d}</span>
                            ))}
                          </div>
                        ) : <span style={{ color: "var(--rtm-text-muted)" }}>None</span>}
                      </td>
                      <td className="px-4 py-3"><StatusBadge variant={finalReportBadge(c.finalReportStatus)} label={c.finalReportStatus} size="sm" /></td>
                      <td className="px-4 py-3"><StatusBadge variant={accessRemovalBadge(c.accessRemovalStatus)} label={c.accessRemovalStatus} size="sm" /></td>
                      <td className="px-4 py-3"><StatusBadge variant={priorityBadge(c.priority)} label={c.priority} size="sm" /></td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{c.dueDate}</td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <span className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{c.nextRequiredAction}</span>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col gap-1 min-w-[140px]">
                          <Btn variant="ghost" small onClick={() => { setSelectedClient(c); setActiveTab("checklist"); }}>View Details</Btn>
                          <Btn variant="ghost" small onClick={() => setModal({ kind: "assignOwner", record: c })}>Assign Owner</Btn>
                          <Btn variant="ghost" small onClick={() => setModal({ kind: "updateStatus", record: c })}>Update Status</Btn>
                          <Btn variant="ghost" small onClick={() => setModal({ kind: "createShutdownTasks", record: c })}>Create Shutdown Tasks</Btn>
                          <Btn variant="ghost" small onClick={() => setModal({ kind: "requestBillingClearance", record: c })}>Request Billing Clearance</Btn>
                          <Btn variant="ghost" small onClick={() => { setSelectedClient(c); setActiveTab("departments"); }}>Notify Departments</Btn>
                          <Btn variant="ghost" small onClick={() => setModal({ kind: "removeAccess", record: c })}>Remove Access</Btn>
                          <Btn variant="ghost" small onClick={() => setModal({ kind: "uploadFinalReport", record: c })}>Upload Final Report</Btn>
                          {c.offboardingStatus !== "Completed" && (
                            <Btn variant="ghost" small onClick={() => setModal({ kind: "markComplete", record: c })}>Mark Complete</Btn>
                          )}
                          <Btn variant="ghost" small>Add Note</Btn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionWrapper>
        )}

        {/* ── CHECKLIST ─────────────────────────────────────────────────────── */}
        {activeTab === "checklist" && (
          <div className="flex flex-col gap-4">
            {/* Client selector */}
            <SectionWrapper
              title="Select Client"
              description="Choose a client to view and manage their offboarding checklist"
              actions={
                <div className="flex gap-2 flex-wrap">
                  {mockClients.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedClient(c)}
                      className="px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all"
                      style={{
                        background: selectedClient?.id === c.id ? "var(--rtm-blue)" : "var(--rtm-surface)",
                        color: selectedClient?.id === c.id ? "#fff" : "var(--rtm-text-secondary)",
                        borderColor: selectedClient?.id === c.id ? "var(--rtm-blue)" : "var(--rtm-border)",
                      }}
                    >
                      {c.client}
                    </button>
                  ))}
                </div>
              }
            >
              {selectedClient && (
                <div className="flex items-center gap-4 flex-wrap">
                  <StatusBadge variant={offboardingStatusBadge(selectedClient.offboardingStatus)} label={selectedClient.offboardingStatus} />
                  <StatusBadge variant={billingStatusBadge(selectedClient.billingStatus)} label={`Billing: ${selectedClient.billingStatus}`} />
                  <StatusBadge variant={priorityBadge(selectedClient.priority)} label={`Priority: ${selectedClient.priority}`} />
                  <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>AM: {selectedClient.amOwner} · Ops: {selectedClient.operationsOwner}</span>
                  <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>Due: {selectedClient.dueDate}</span>
                </div>
              )}
            </SectionWrapper>

            {selectedClient && (
              <SectionWrapper
                title={`Offboarding Checklist — ${selectedClient.client}`}
                description="Full checklist by category: Billing, AM, Departments, Access, and Final Deliverables"
                actions={
                  <div className="flex gap-2">
                    <Btn variant="secondary" small onClick={() => setModal({ kind: "updateStatus", record: selectedClient })}>Update Status</Btn>
                    <Btn variant="primary" small onClick={() => setModal({ kind: "markComplete", record: selectedClient })}>Mark Complete</Btn>
                  </div>
                }
              >
                <ChecklistSection client={selectedClient} />
              </SectionWrapper>
            )}
          </div>
        )}

        {/* ── DEPARTMENT SHUTDOWN ───────────────────────────────────────────── */}
        {activeTab === "departments" && (
          <SectionWrapper
            title="Department Shutdown Table"
            description="Track shutdown status per department for each offboarding client"
            actions={<Btn variant="primary" small>+ Create Task</Btn>}
            noPadding
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: "var(--rtm-surface-alt, #F8FAFC)", borderBottom: "1px solid var(--rtm-border-light)" }}>
                    {["Client", "Department", "Service Status", "Dept Owner", "Task Status", "Dependencies", "Due Date", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockClients.flatMap((c) =>
                    c.deptShutdown.map((d, idx) => (
                      <tr
                        key={`${c.id}-${d.department}`}
                        style={{ borderBottom: "1px solid var(--rtm-border-light)", background: idx % 2 === 0 ? "var(--rtm-surface)" : "var(--rtm-surface-alt, #F8FAFC)" }}
                      >
                        <td className="px-4 py-3 font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{c.client}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold" style={{ background: "#EFF6FF", color: "#3B82F6" }}>{d.department}</span>
                        </td>
                        <td className="px-4 py-3"><StatusBadge variant={deptServiceBadge(d.serviceStatus)} label={d.serviceStatus} size="sm" /></td>
                        <td className="px-4 py-3" style={{ color: "var(--rtm-text-secondary)" }}>{d.departmentOwner}</td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            variant={d.taskStatus === "Completed" ? "success" : d.taskStatus === "In Progress" ? "pending" : d.taskStatus === "N/A" ? "neutral" : "neutral"}
                            label={d.taskStatus}
                            size="sm"
                          />
                        </td>
                        <td className="px-4 py-3 max-w-[160px]" style={{ color: "var(--rtm-text-secondary)" }}>{d.dependencies}</td>
                        <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{d.dueDate}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            <Btn variant="ghost" small>Create Task</Btn>
                            <Btn variant="ghost" small>Mark Shutdown Complete</Btn>
                            <Btn variant="ghost" small>Add Dependency</Btn>
                            <Btn variant="ghost" small>Notify Owner</Btn>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </SectionWrapper>
        )}

        {/* ── ACCESS REMOVAL ────────────────────────────────────────────────── */}
        {activeTab === "access" && (
          <SectionWrapper
            title="Access Removal Table"
            description="Track platform access removal status for all offboarding clients"
            actions={<Btn variant="primary" small onClick={() => selectedClient && setModal({ kind: "removeAccess", record: selectedClient })}>+ Mark Access Removed</Btn>}
            noPadding
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: "var(--rtm-surface-alt, #F8FAFC)", borderBottom: "1px solid var(--rtm-border-light)" }}>
                    {["Client", "Access Type", "Platform", "Owner", "Removal Status", "Due Date", "Notes", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockClients.flatMap((c) =>
                    c.accessItems.map((a, idx) => (
                      <tr
                        key={`${c.id}-${a.accessType}-${a.platform}`}
                        style={{ borderBottom: "1px solid var(--rtm-border-light)", background: idx % 2 === 0 ? "var(--rtm-surface)" : "var(--rtm-surface-alt, #F8FAFC)" }}
                      >
                        <td className="px-4 py-3 font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{c.client}</td>
                        <td className="px-4 py-3" style={{ color: "var(--rtm-text-primary)" }}>{a.accessType}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold" style={{ background: "#F4F7FF", color: "var(--rtm-blue)" }}>{a.platform}</span>
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--rtm-text-secondary)" }}>{a.owner}</td>
                        <td className="px-4 py-3"><StatusBadge variant={accessRemovalItemBadge(a.removalStatus)} label={a.removalStatus} size="sm" /></td>
                        <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{a.dueDate}</td>
                        <td className="px-4 py-3 max-w-[160px]" style={{ color: "var(--rtm-text-secondary)" }}>{a.notes || "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {a.removalStatus !== "Removed" && (
                              <Btn variant="ghost" small onClick={() => setModal({ kind: "removeAccess", record: c })}>Mark Removed</Btn>
                            )}
                            <Btn variant="ghost" small>Escalate</Btn>
                            <Btn variant="ghost" small>Add Note</Btn>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </SectionWrapper>
        )}

        {/* ── RECENT EVENTS ─────────────────────────────────────────────────── */}
        {activeTab === "events" && (
          <SectionWrapper
            title="Recent Offboarding Events"
            description="Full event log across all offboarding cases"
            noPadding
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: "var(--rtm-surface-alt, #F8FAFC)", borderBottom: "1px solid var(--rtm-border-light)" }}>
                    {["Date", "Client", "Event Type", "Triggered By", "Department", "Old Status", "New Status", "Notes"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockClients.flatMap((c) =>
                    c.recentEvents.map((e, idx) => (
                      <tr
                        key={`${c.id}-${e.date}-${idx}`}
                        style={{ borderBottom: "1px solid var(--rtm-border-light)", background: idx % 2 === 0 ? "var(--rtm-surface)" : "var(--rtm-surface-alt, #F8FAFC)" }}
                      >
                        <td className="px-4 py-3 whitespace-nowrap font-medium" style={{ color: "var(--rtm-text-secondary)" }}>{e.date}</td>
                        <td className="px-4 py-3 font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{c.client}</td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-0.5 rounded text-[11px] font-semibold"
                            style={{
                              background:
                                e.eventType === "Client Closure Completed" ? "#ECFDF5" :
                                e.eventType === "Offboarding Triggered" ? "#EFF6FF" :
                                e.eventType === "Access Removed" ? "#F5F3FF" :
                                e.eventType === "Final Report Uploaded" ? "#F5F3FF" :
                                e.eventType === "Department Shutdown Started" ? "#FFFBEB" :
                                "#F8FAFC",
                              color:
                                e.eventType === "Client Closure Completed" ? "#059669" :
                                e.eventType === "Offboarding Triggered" ? "#3B82F6" :
                                e.eventType === "Access Removed" ? "#7C3AED" :
                                e.eventType === "Final Report Uploaded" ? "#7C3AED" :
                                e.eventType === "Department Shutdown Started" ? "#B45309" :
                                "#64748B",
                            }}
                          >
                            {e.eventType}
                          </span>
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--rtm-text-secondary)" }}>{e.triggeredBy}</td>
                        <td className="px-4 py-3" style={{ color: "var(--rtm-text-secondary)" }}>{e.department}</td>
                        <td className="px-4 py-3">
                          <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: "var(--rtm-border-light)", color: "var(--rtm-text-muted)" }}>{e.oldStatus}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ background: "#EFF6FF", color: "var(--rtm-blue)" }}>{e.newStatus}</span>
                        </td>
                        <td className="px-4 py-3 max-w-[200px]" style={{ color: "var(--rtm-text-secondary)" }}>{e.notes || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </SectionWrapper>
        )}

        {/* ── Quick Links ───────────────────────────────────────────────────── */}
        <SectionWrapper title="Related Workflows & Routes">
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Billing / Cancellations", href: "/billing/cancellations", icon: "💳" },
              { label: "Account Management", href: "/account-management", icon: "🏢" },
              { label: "Client Portfolio", href: "/clients", icon: "👥" },
              { label: "Admin Workflows", href: "/admin/workflows", icon: "⚙️" },
              { label: "Tasks", href: "/tasks", icon: "✅" },
              { label: "Notifications", href: "/notifications", icon: "🔔" },
            ].map((link) => (
              <Link key={link.href} href={link.href}>
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium hover:shadow-sm transition-shadow cursor-pointer"
                  style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)", background: "var(--rtm-surface)" }}
                >
                  <span>{link.icon}</span>
                  {link.label}
                </div>
              </Link>
            ))}
          </div>
        </SectionWrapper>

      </div>

      {/* ── Modals ────────────────────────────────────────────────────────────── */}
      {modal?.kind === "assignOwner" && <AssignOwnerModal record={modal.record} onClose={closeModal} />}
      {modal?.kind === "updateStatus" && <UpdateStatusModal record={modal.record} onClose={closeModal} />}
      {modal?.kind === "createShutdownTasks" && <CreateShutdownTasksModal record={modal.record} onClose={closeModal} />}
      {modal?.kind === "requestBillingClearance" && <RequestBillingClearanceModal record={modal.record} onClose={closeModal} />}
      {modal?.kind === "removeAccess" && <RemoveAccessModal record={modal.record} onClose={closeModal} />}
      {modal?.kind === "uploadFinalReport" && <UploadFinalReportModal record={modal.record} onClose={closeModal} />}
      {modal?.kind === "markComplete" && <MarkCompleteModal record={modal.record} onClose={closeModal} />}
    </div>
  );
}
