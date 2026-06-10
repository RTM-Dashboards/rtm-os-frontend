"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import TaskAccessCard from "@/components/tasks/TaskAccessCard";

const workspace = getWorkspace("billing")!;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type BadgeVariant = "success" | "error" | "warning" | "info" | "neutral" | "pending";

type InvoiceStatus = "Paid";
type BillingStatus = "Cleared";
type ActivationStatus =
  | "Ready for Onboarding"
  | "Pending Activation"
  | "Onboarding Pending"
  | "Activation In Progress"
  | "Blocked"
  | "Pushed to AM";
type DeptActivationStatus =
  | "Department Activation Pending"
  | "Activation In Progress"
  | "Active"
  | "Not Started";
type Priority = "High" | "Medium" | "Low";

interface ChecklistItem {
  item: string;
  status: "Complete" | "Pending" | "Blocked" | "Not Started";
  owner: string;
  dueDate: string;
}

interface BillingEvent {
  date: string;
  event: string;
  actor: string;
}

interface OnboardingClient {
  id: string;
  // Core identity
  clientName: string;
  // Invoice / billing
  invoiceStatus: InvoiceStatus;
  invoiceId: string;
  paymentDate: string;
  billingClearanceStatus: BillingStatus;
  // Services
  servicesPurchased: string[];
  // AM
  assignedAM: string;
  // Activation
  activationStatus: ActivationStatus;
  deptActivationStatus: DeptActivationStatus;
  // Queue meta
  priority: Priority;
  dueDate: string;
  nextRequiredAction: string;
  // Detail
  clientContact: string;
  contractConfirmed: boolean;
  notes: string;
  checklist: ChecklistItem[];
  recentEvents: BillingEvent[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data — 8 clients ready for onboarding
// ─────────────────────────────────────────────────────────────────────────────

const ONBOARDING_CLIENTS: OnboardingClient[] = [
  {
    id: "c1",
    clientName: "Blue Ridge Plumbing",
    invoiceStatus: "Paid",
    invoiceId: "INV-2025-0041",
    paymentDate: "Jul 10, 2025",
    billingClearanceStatus: "Cleared",
    servicesPurchased: ["SEO", "GBP", "Reporting"],
    assignedAM: "Unassigned",
    activationStatus: "Ready for Onboarding",
    deptActivationStatus: "Not Started",
    priority: "High",
    dueDate: "Jul 18, 2025",
    nextRequiredAction: "Assign Account Manager",
    clientContact: "Jane Doe — jane@blueridgeplumbing.com",
    contractConfirmed: true,
    notes: "Client requested kickoff before end of July. SEO-focused package.",
    checklist: [
      { item: "Invoice paid",                    status: "Complete",    owner: "Billing",    dueDate: "Jul 10, 2025" },
      { item: "Billing cleared",                 status: "Complete",    owner: "Billing",    dueDate: "Jul 10, 2025" },
      { item: "Contract/plan confirmed",         status: "Complete",    owner: "Sales",      dueDate: "Jul 8, 2025"  },
      { item: "Services purchased confirmed",    status: "Complete",    owner: "Sales",      dueDate: "Jul 8, 2025"  },
      { item: "Client contact verified",         status: "Complete",    owner: "Sales",      dueDate: "Jul 9, 2025"  },
      { item: "AM assigned",                     status: "Not Started", owner: "AM Head",    dueDate: "Jul 18, 2025" },
      { item: "Onboarding record created",       status: "Not Started", owner: "AM",         dueDate: "Jul 19, 2025" },
      { item: "Department activation tasks created", status: "Not Started", owner: "Ops",   dueDate: "Jul 20, 2025" },
      { item: "Kickoff needed",                  status: "Pending",     owner: "AM",         dueDate: "Jul 22, 2025" },
      { item: "Notes reviewed",                  status: "Complete",    owner: "Billing",    dueDate: "Jul 10, 2025" },
    ],
    recentEvents: [
      { date: "Jul 10", event: "Invoice INV-2025-0041 marked Paid",     actor: "Billing" },
      { date: "Jul 10", event: "Billing cleared — ready for onboarding", actor: "Billing" },
      { date: "Jul 8",  event: "Contract confirmed by Sales",           actor: "Sales"   },
    ],
  },
  {
    id: "c2",
    clientName: "Cascade Wellness",
    invoiceStatus: "Paid",
    invoiceId: "INV-2025-0038",
    paymentDate: "Jul 9, 2025",
    billingClearanceStatus: "Cleared",
    servicesPurchased: ["SEO", "Content", "Web Development"],
    assignedAM: "Sofia R.",
    activationStatus: "Pending Activation",
    deptActivationStatus: "Department Activation Pending",
    priority: "High",
    dueDate: "Jul 17, 2025",
    nextRequiredAction: "Start Onboarding — AM assigned, awaiting kickoff",
    clientContact: "Mark Chen — mark@cascadewellness.com",
    contractConfirmed: true,
    notes: "Web Development is a one-time setup; SEO + Content are monthly retainer.",
    checklist: [
      { item: "Invoice paid",                    status: "Complete",    owner: "Billing",    dueDate: "Jul 9, 2025"  },
      { item: "Billing cleared",                 status: "Complete",    owner: "Billing",    dueDate: "Jul 9, 2025"  },
      { item: "Contract/plan confirmed",         status: "Complete",    owner: "Sales",      dueDate: "Jul 7, 2025"  },
      { item: "Services purchased confirmed",    status: "Complete",    owner: "Sales",      dueDate: "Jul 7, 2025"  },
      { item: "Client contact verified",         status: "Complete",    owner: "Sales",      dueDate: "Jul 8, 2025"  },
      { item: "AM assigned",                     status: "Complete",    owner: "AM Head",    dueDate: "Jul 10, 2025" },
      { item: "Onboarding record created",       status: "Pending",     owner: "Sofia R.",   dueDate: "Jul 17, 2025" },
      { item: "Department activation tasks created", status: "Pending", owner: "Ops",        dueDate: "Jul 18, 2025" },
      { item: "Kickoff needed",                  status: "Pending",     owner: "Sofia R.",   dueDate: "Jul 20, 2025" },
      { item: "Notes reviewed",                  status: "Complete",    owner: "Sofia R.",   dueDate: "Jul 11, 2025" },
    ],
    recentEvents: [
      { date: "Jul 11", event: "AM Sofia R. assigned",                  actor: "AM Head" },
      { date: "Jul 9",  event: "Invoice INV-2025-0038 marked Paid",     actor: "Billing" },
      { date: "Jul 9",  event: "Billing cleared",                       actor: "Billing" },
    ],
  },
  {
    id: "c3",
    clientName: "Summit Legal Group",
    invoiceStatus: "Paid",
    invoiceId: "INV-2025-0035",
    paymentDate: "Jul 7, 2025",
    billingClearanceStatus: "Cleared",
    servicesPurchased: ["Google Ads", "Conversion Tracking"],
    assignedAM: "James R.",
    activationStatus: "Activation In Progress",
    deptActivationStatus: "Activation In Progress",
    priority: "Medium",
    dueDate: "Jul 21, 2025",
    nextRequiredAction: "Complete department activation tasks",
    clientContact: "Linda Park — linda@summitlegal.com",
    contractConfirmed: true,
    notes: "Google Ads budget confirmed at $3,500/mo. Conversion tracking setup pending dev team.",
    checklist: [
      { item: "Invoice paid",                    status: "Complete",    owner: "Billing",    dueDate: "Jul 7, 2025"  },
      { item: "Billing cleared",                 status: "Complete",    owner: "Billing",    dueDate: "Jul 7, 2025"  },
      { item: "Contract/plan confirmed",         status: "Complete",    owner: "Sales",      dueDate: "Jul 5, 2025"  },
      { item: "Services purchased confirmed",    status: "Complete",    owner: "Sales",      dueDate: "Jul 5, 2025"  },
      { item: "Client contact verified",         status: "Complete",    owner: "Sales",      dueDate: "Jul 6, 2025"  },
      { item: "AM assigned",                     status: "Complete",    owner: "AM Head",    dueDate: "Jul 8, 2025"  },
      { item: "Onboarding record created",       status: "Complete",    owner: "James R.",   dueDate: "Jul 9, 2025"  },
      { item: "Department activation tasks created", status: "Complete", owner: "Ops",       dueDate: "Jul 10, 2025" },
      { item: "Kickoff needed",                  status: "Complete",    owner: "James R.",   dueDate: "Jul 12, 2025" },
      { item: "Notes reviewed",                  status: "Complete",    owner: "James R.",   dueDate: "Jul 8, 2025"  },
    ],
    recentEvents: [
      { date: "Jul 12", event: "Kickoff call completed",                actor: "James R." },
      { date: "Jul 10", event: "Dept activation tasks created",         actor: "Ops"      },
      { date: "Jul 8",  event: "AM James R. assigned",                  actor: "AM Head"  },
      { date: "Jul 7",  event: "Invoice INV-2025-0035 marked Paid",     actor: "Billing"  },
    ],
  },
  {
    id: "c4",
    clientName: "Ridgeline Auto",
    invoiceStatus: "Paid",
    invoiceId: "INV-2025-0037",
    paymentDate: "Jul 8, 2025",
    billingClearanceStatus: "Cleared",
    servicesPurchased: ["LSA", "Call Tracking", "Reporting"],
    assignedAM: "Unassigned",
    activationStatus: "Blocked",
    deptActivationStatus: "Not Started",
    priority: "High",
    dueDate: "Jul 16, 2025",
    nextRequiredAction: "Resolve contract mismatch before proceeding",
    clientContact: "Tom Briggs — tom@ridgelineauto.com",
    contractConfirmed: false,
    notes: "Contract lists Google Ads but client purchased LSA. Sales must clarify scope before onboarding.",
    checklist: [
      { item: "Invoice paid",                    status: "Complete",    owner: "Billing",    dueDate: "Jul 8, 2025"  },
      { item: "Billing cleared",                 status: "Complete",    owner: "Billing",    dueDate: "Jul 8, 2025"  },
      { item: "Contract/plan confirmed",         status: "Blocked",     owner: "Sales",      dueDate: "Jul 16, 2025" },
      { item: "Services purchased confirmed",    status: "Blocked",     owner: "Sales",      dueDate: "Jul 16, 2025" },
      { item: "Client contact verified",         status: "Complete",    owner: "Sales",      dueDate: "Jul 8, 2025"  },
      { item: "AM assigned",                     status: "Not Started", owner: "AM Head",    dueDate: "TBD"          },
      { item: "Onboarding record created",       status: "Not Started", owner: "AM",         dueDate: "TBD"          },
      { item: "Department activation tasks created", status: "Not Started", owner: "Ops",   dueDate: "TBD"          },
      { item: "Kickoff needed",                  status: "Not Started", owner: "AM",         dueDate: "TBD"          },
      { item: "Notes reviewed",                  status: "Pending",     owner: "Billing",    dueDate: "Jul 16, 2025" },
    ],
    recentEvents: [
      { date: "Jul 12", event: "Contract mismatch flagged — blocked",   actor: "Billing" },
      { date: "Jul 8",  event: "Invoice INV-2025-0037 marked Paid",     actor: "Billing" },
      { date: "Jul 8",  event: "Billing cleared",                       actor: "Billing" },
    ],
  },
  {
    id: "c5",
    clientName: "Apex Roofing",
    invoiceStatus: "Paid",
    invoiceId: "INV-2025-0033",
    paymentDate: "Jul 6, 2025",
    billingClearanceStatus: "Cleared",
    servicesPurchased: ["SEO", "GBP"],
    assignedAM: "Unassigned",
    activationStatus: "Ready for Onboarding",
    deptActivationStatus: "Not Started",
    priority: "Medium",
    dueDate: "Jul 19, 2025",
    nextRequiredAction: "Assign Account Manager",
    clientContact: "Rachel Stone — rachel@apexroofing.com",
    contractConfirmed: true,
    notes: "GBP profile already claimed. SEO kickoff depends on AM assignment.",
    checklist: [
      { item: "Invoice paid",                    status: "Complete",    owner: "Billing",    dueDate: "Jul 6, 2025"  },
      { item: "Billing cleared",                 status: "Complete",    owner: "Billing",    dueDate: "Jul 6, 2025"  },
      { item: "Contract/plan confirmed",         status: "Complete",    owner: "Sales",      dueDate: "Jul 4, 2025"  },
      { item: "Services purchased confirmed",    status: "Complete",    owner: "Sales",      dueDate: "Jul 4, 2025"  },
      { item: "Client contact verified",         status: "Complete",    owner: "Sales",      dueDate: "Jul 5, 2025"  },
      { item: "AM assigned",                     status: "Not Started", owner: "AM Head",    dueDate: "Jul 19, 2025" },
      { item: "Onboarding record created",       status: "Not Started", owner: "AM",         dueDate: "Jul 20, 2025" },
      { item: "Department activation tasks created", status: "Not Started", owner: "Ops",   dueDate: "Jul 21, 2025" },
      { item: "Kickoff needed",                  status: "Pending",     owner: "AM",         dueDate: "Jul 23, 2025" },
      { item: "Notes reviewed",                  status: "Complete",    owner: "Billing",    dueDate: "Jul 6, 2025"  },
    ],
    recentEvents: [
      { date: "Jul 6", event: "Invoice INV-2025-0033 marked Paid",      actor: "Billing" },
      { date: "Jul 6", event: "Billing cleared — ready for onboarding", actor: "Billing" },
      { date: "Jul 4", event: "Contract confirmed by Sales",            actor: "Sales"   },
    ],
  },
  {
    id: "c6",
    clientName: "Pacific Dental",
    invoiceStatus: "Paid",
    invoiceId: "INV-2025-0029",
    paymentDate: "Jul 2, 2025",
    billingClearanceStatus: "Cleared",
    servicesPurchased: ["PPC", "LSA"],
    assignedAM: "Carlos M.",
    activationStatus: "Pending Activation",
    deptActivationStatus: "Department Activation Pending",
    priority: "Medium",
    dueDate: "Jul 20, 2025",
    nextRequiredAction: "Create department activation tasks for PPC + LSA",
    clientContact: "Dr. Amy Wu — amy@pacificdental.com",
    contractConfirmed: true,
    notes: "PPC budget $2,000/mo. LSA in 3 service areas. Both services need Paid Media dept activation.",
    checklist: [
      { item: "Invoice paid",                    status: "Complete",    owner: "Billing",    dueDate: "Jul 2, 2025"  },
      { item: "Billing cleared",                 status: "Complete",    owner: "Billing",    dueDate: "Jul 2, 2025"  },
      { item: "Contract/plan confirmed",         status: "Complete",    owner: "Sales",      dueDate: "Jun 30, 2025" },
      { item: "Services purchased confirmed",    status: "Complete",    owner: "Sales",      dueDate: "Jun 30, 2025" },
      { item: "Client contact verified",         status: "Complete",    owner: "Sales",      dueDate: "Jul 1, 2025"  },
      { item: "AM assigned",                     status: "Complete",    owner: "AM Head",    dueDate: "Jul 3, 2025"  },
      { item: "Onboarding record created",       status: "Complete",    owner: "Carlos M.",  dueDate: "Jul 5, 2025"  },
      { item: "Department activation tasks created", status: "Pending", owner: "Ops",        dueDate: "Jul 20, 2025" },
      { item: "Kickoff needed",                  status: "Pending",     owner: "Carlos M.",  dueDate: "Jul 22, 2025" },
      { item: "Notes reviewed",                  status: "Complete",    owner: "Carlos M.",  dueDate: "Jul 4, 2025"  },
    ],
    recentEvents: [
      { date: "Jul 5",  event: "Onboarding record created",             actor: "Carlos M." },
      { date: "Jul 3",  event: "AM Carlos M. assigned",                 actor: "AM Head"   },
      { date: "Jul 2",  event: "Invoice INV-2025-0029 marked Paid",     actor: "Billing"   },
      { date: "Jul 2",  event: "Billing cleared",                       actor: "Billing"   },
    ],
  },
  {
    id: "c7",
    clientName: "Harbor Auto Group",
    invoiceStatus: "Paid",
    invoiceId: "INV-2025-0021",
    paymentDate: "Jun 28, 2025",
    billingClearanceStatus: "Cleared",
    servicesPurchased: ["SEO", "GBP", "PPC", "LSA", "Content", "Reporting"],
    assignedAM: "Maria L.",
    activationStatus: "Pushed to AM",
    deptActivationStatus: "Active",
    priority: "Low",
    dueDate: "Ongoing",
    nextRequiredAction: "Monitor — fully pushed to Account Management",
    clientContact: "Derek Hall — derek@harborautogroup.com",
    contractConfirmed: true,
    notes: "Full-service package. All departments activated. AM managing ongoing relationship.",
    checklist: [
      { item: "Invoice paid",                    status: "Complete",    owner: "Billing",    dueDate: "Jun 28, 2025" },
      { item: "Billing cleared",                 status: "Complete",    owner: "Billing",    dueDate: "Jun 28, 2025" },
      { item: "Contract/plan confirmed",         status: "Complete",    owner: "Sales",      dueDate: "Jun 25, 2025" },
      { item: "Services purchased confirmed",    status: "Complete",    owner: "Sales",      dueDate: "Jun 25, 2025" },
      { item: "Client contact verified",         status: "Complete",    owner: "Sales",      dueDate: "Jun 26, 2025" },
      { item: "AM assigned",                     status: "Complete",    owner: "AM Head",    dueDate: "Jun 29, 2025" },
      { item: "Onboarding record created",       status: "Complete",    owner: "Maria L.",   dueDate: "Jul 1, 2025"  },
      { item: "Department activation tasks created", status: "Complete", owner: "Ops",       dueDate: "Jul 2, 2025"  },
      { item: "Kickoff needed",                  status: "Complete",    owner: "Maria L.",   dueDate: "Jul 5, 2025"  },
      { item: "Notes reviewed",                  status: "Complete",    owner: "Maria L.",   dueDate: "Jun 30, 2025" },
    ],
    recentEvents: [
      { date: "Jul 10", event: "Pushed to Account Management",          actor: "Billing"  },
      { date: "Jul 5",  event: "Kickoff call completed",                actor: "Maria L." },
      { date: "Jul 2",  event: "Dept activation tasks completed",       actor: "Ops"      },
      { date: "Jun 29", event: "AM Maria L. assigned",                  actor: "AM Head"  },
      { date: "Jun 28", event: "Invoice INV-2025-0021 marked Paid",     actor: "Billing"  },
    ],
  },
  {
    id: "c8",
    clientName: "Skyline Landscaping",
    invoiceStatus: "Paid",
    invoiceId: "INV-2025-0044",
    paymentDate: "Jul 12, 2025",
    billingClearanceStatus: "Cleared",
    servicesPurchased: ["SEO", "GBP", "Reporting"],
    assignedAM: "Sarah K.",
    activationStatus: "Activation In Progress",
    deptActivationStatus: "Activation In Progress",
    priority: "High",
    dueDate: "Jul 15, 2025",
    nextRequiredAction: "Finalize department activation — SEO dept pending",
    clientContact: "Mike Torres — mike@skylinelandscaping.com",
    contractConfirmed: true,
    notes: "Client wants to go live ASAP. GBP optimization started. SEO dept activation in progress.",
    checklist: [
      { item: "Invoice paid",                    status: "Complete",    owner: "Billing",    dueDate: "Jul 12, 2025" },
      { item: "Billing cleared",                 status: "Complete",    owner: "Billing",    dueDate: "Jul 12, 2025" },
      { item: "Contract/plan confirmed",         status: "Complete",    owner: "Sales",      dueDate: "Jul 10, 2025" },
      { item: "Services purchased confirmed",    status: "Complete",    owner: "Sales",      dueDate: "Jul 10, 2025" },
      { item: "Client contact verified",         status: "Complete",    owner: "Sales",      dueDate: "Jul 11, 2025" },
      { item: "AM assigned",                     status: "Complete",    owner: "AM Head",    dueDate: "Jul 12, 2025" },
      { item: "Onboarding record created",       status: "Complete",    owner: "Sarah K.",   dueDate: "Jul 13, 2025" },
      { item: "Department activation tasks created", status: "Complete", owner: "Ops",       dueDate: "Jul 13, 2025" },
      { item: "Kickoff needed",                  status: "Pending",     owner: "Sarah K.",   dueDate: "Jul 15, 2025" },
      { item: "Notes reviewed",                  status: "Complete",    owner: "Sarah K.",   dueDate: "Jul 13, 2025" },
    ],
    recentEvents: [
      { date: "Jul 13", event: "Dept activation tasks created",         actor: "Ops"      },
      { date: "Jul 13", event: "Onboarding record created",             actor: "Sarah K." },
      { date: "Jul 12", event: "AM Sarah K. assigned",                  actor: "AM Head"  },
      { date: "Jul 12", event: "Invoice INV-2025-0044 marked Paid",     actor: "Billing"  },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function activationBadge(s: ActivationStatus): BadgeVariant {
  switch (s) {
    case "Ready for Onboarding":   return "info";
    case "Pending Activation":     return "warning";
    case "Onboarding Pending":     return "warning";
    case "Activation In Progress": return "info";
    case "Blocked":                return "error";
    case "Pushed to AM":           return "success";
    default:                       return "neutral";
  }
}

function deptBadge(s: DeptActivationStatus): BadgeVariant {
  switch (s) {
    case "Department Activation Pending": return "warning";
    case "Activation In Progress":        return "info";
    case "Active":                        return "success";
    case "Not Started":                   return "neutral";
    default:                              return "neutral";
  }
}

function priorityBadge(p: Priority): BadgeVariant {
  switch (p) {
    case "High":   return "error";
    case "Medium": return "warning";
    case "Low":    return "neutral";
    default:       return "neutral";
  }
}

function checklistStatusBadge(s: ChecklistItem["status"]): BadgeVariant {
  switch (s) {
    case "Complete":    return "success";
    case "Pending":     return "warning";
    case "Blocked":     return "error";
    case "Not Started": return "neutral";
    default:            return "neutral";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Primitive UI helpers
// ─────────────────────────────────────────────────────────────────────────────

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="text-left text-xs font-semibold uppercase tracking-wide px-3 py-2 whitespace-nowrap border-b"
      style={{
        color: "var(--rtm-text-muted)",
        borderColor: "var(--rtm-border-light)",
        background: "var(--rtm-bg-alt, #F9FAFB)",
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  muted,
  wrap,
}: {
  children: React.ReactNode;
  muted?: boolean;
  wrap?: boolean;
}) {
  return (
    <td
      className={`px-3 py-2.5 text-sm border-b ${wrap ? "" : "whitespace-nowrap"}`}
      style={{
        color: muted ? "var(--rtm-text-muted)" : "var(--rtm-text-secondary)",
        borderColor: "var(--rtm-border-light)",
      }}
    >
      {children}
    </td>
  );
}

function ActionBtn({
  label,
  onClick,
  variant = "secondary",
  href,
}: {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  href?: string;
}) {
  const base =
    "inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer whitespace-nowrap";
  const styles: Record<string, string> = {
    primary:
      "bg-[var(--rtm-blue,#1B4FD8)] text-white border-transparent hover:opacity-90",
    secondary:
      "bg-[var(--rtm-surface,#fff)] text-[var(--rtm-text-primary)] border-[var(--rtm-border)] hover:bg-[var(--rtm-bg)]",
    danger:
      "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] hover:bg-[#FEE2E2]",
    ghost:
      "bg-transparent text-[var(--rtm-text-muted)] border-transparent hover:text-[var(--rtm-text-primary)]",
  };

  if (href) {
    return (
      <Link href={href} className={`${base} ${styles[variant]}`}>
        {label}
      </Link>
    );
  }
  return (
    <button className={`${base} ${styles[variant]}`} onClick={onClick}>
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Workflow Banner
// ─────────────────────────────────────────────────────────────────────────────

const FLOW_STEPS = [
  { label: "Invoice Paid",              color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
  { label: "Billing Cleared",           color: "#1B4FD8", bg: "#EFF6FF", border: "#BFDBFE" },
  { label: "Ready for Onboarding",      color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  { label: "Assign AM",                 color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  { label: "Start Onboarding",          color: "#0891B2", bg: "#F0F9FF", border: "#BAE6FD" },
  { label: "Create Activation Tasks",   color: "#0891B2", bg: "#F0F9FF", border: "#BAE6FD" },
  { label: "Push to Account Mgmt",      color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
  { label: "Dept Activation Pending",   color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
];

function WorkflowBanner() {
  return (
    <div
      className="rounded-xl border p-5"
      style={{ background: "#F5F3FF", borderColor: "#DDD6FE" }}
    >
      <p
        className="text-[11px] font-bold uppercase tracking-widest mb-3"
        style={{ color: "#7C3AED" }}
      >
        Activation Workflow
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {FLOW_STEPS.map((s, i) => (
          <React.Fragment key={s.label}>
            <span
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
              style={{ background: s.bg, color: s.color, borderColor: s.border }}
            >
              {s.label}
            </span>
            {i < FLOW_STEPS.length - 1 && (
              <span className="text-sm font-bold" style={{ color: "#A78BFA" }}>
                →
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
      <p className="text-xs mt-3" style={{ color: "#5B21B6" }}>
        Paid invoice triggers billing clearance. Once cleared, the client enters the onboarding queue, an AM is assigned, activation tasks are created, and the client is pushed to Account Management and Department Activation.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Quick-link nav
// ─────────────────────────────────────────────────────────────────────────────

function QuickLinks() {
  const links = [
    { label: "Clients",                  href: "/clients" },
    { label: "Billing Invoices",         href: "/billing/invoices" },
    { label: "AM Onboarding",            href: "/account-management/onboarding" },
    { label: "Department Activation",    href: "/departments/activation" },
    { label: "Tasks",                    href: "/tasks" },
    { label: "Admin Workflows",          href: "/admin/workflows" },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors"
          style={{
            background: "var(--rtm-surface)",
            color: "var(--rtm-text-secondary)",
            borderColor: "var(--rtm-border)",
          }}
        >
          {l.label} →
        </Link>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Status badge legend
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_BADGES: Array<{ label: string; variant: BadgeVariant }> = [
  { label: "Invoice Paid",                    variant: "success" },
  { label: "Billing Cleared",                 variant: "success" },
  { label: "Ready for Onboarding",            variant: "info"    },
  { label: "AM Assignment Needed",            variant: "warning" },
  { label: "Onboarding Pending",              variant: "warning" },
  { label: "Department Activation Pending",   variant: "warning" },
  { label: "Activation In Progress",          variant: "info"    },
  { label: "Blocked",                         variant: "error"   },
];

function BadgeLegend() {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span
        className="text-[11px] font-bold uppercase tracking-widest mr-1"
        style={{ color: "var(--rtm-text-muted)" }}
      >
        Status Key:
      </span>
      {STATUS_BADGES.map((b) => (
        <StatusBadge key={b.label} variant={b.variant} label={b.label} size="sm" />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI Summary Cards
// ─────────────────────────────────────────────────────────────────────────────

function KpiCards({ clients }: { clients: OnboardingClient[] }) {
  const cards = [
    {
      label: "Total Ready",
      value: clients.length,
      color: "#1B4FD8", bg: "#EFF6FF", border: "#BFDBFE",
    },
    {
      label: "Needs AM Assignment",
      value: clients.filter((c) => c.assignedAM === "Unassigned" && c.activationStatus !== "Blocked").length,
      color: "#D97706", bg: "#FFFBEB", border: "#FDE68A",
    },
    {
      label: "Activation In Progress",
      value: clients.filter((c) => c.activationStatus === "Activation In Progress").length,
      color: "#0891B2", bg: "#F0F9FF", border: "#BAE6FD",
    },
    {
      label: "Dept Activation Pending",
      value: clients.filter((c) => c.deptActivationStatus === "Department Activation Pending").length,
      color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE",
    },
    {
      label: "Pushed to AM",
      value: clients.filter((c) => c.activationStatus === "Pushed to AM").length,
      color: "#059669", bg: "#ECFDF5", border: "#A7F3D0",
    },
    {
      label: "Blocked",
      value: clients.filter((c) => c.activationStatus === "Blocked").length,
      color: "#DC2626", bg: "#FEF2F2", border: "#FECACA",
    },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((k) => (
        <div
          key={k.label}
          className="rounded-xl border p-4 flex flex-col gap-1"
          style={{ background: k.bg, borderColor: k.border }}
        >
          <span
            className="text-[10px] font-bold uppercase tracking-wide leading-tight"
            style={{ color: k.color }}
          >
            {k.label}
          </span>
          <span className="text-3xl font-bold mt-1" style={{ color: k.color }}>
            {k.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Readiness Checklist (expanded panel)
// ─────────────────────────────────────────────────────────────────────────────

function ReadinessChecklist({ items }: { items: ChecklistItem[] }) {
  const complete = items.filter((i) => i.status === "Complete").length;
  const pct = Math.round((complete / items.length) * 100);

  return (
    <div>
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="flex-1 h-2 rounded-full overflow-hidden"
          style={{ background: "var(--rtm-border-light)" }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${pct}%`,
              background: pct === 100 ? "#059669" : "#1B4FD8",
            }}
          />
        </div>
        <span className="text-xs font-bold" style={{ color: "var(--rtm-text-muted)" }}>
          {complete}/{items.length} complete
        </span>
      </div>
      <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--rtm-border-light)" }}>
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <Th>Checklist Item</Th>
              <Th>Status</Th>
              <Th>Owner</Th>
              <Th>Due Date</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr
                key={idx}
                style={{
                  background:
                    item.status === "Complete"
                      ? "#F0FDF4"
                      : item.status === "Blocked"
                      ? "#FEF2F2"
                      : "var(--rtm-bg)",
                }}
              >
                <Td>
                  <span
                    className="font-medium"
                    style={{
                      color:
                        item.status === "Complete"
                          ? "#065F46"
                          : item.status === "Blocked"
                          ? "#991B1B"
                          : "var(--rtm-text-primary)",
                    }}
                  >
                    {item.status === "Complete" ? "✓ " : ""}
                    {item.item}
                  </span>
                </Td>
                <Td>
                  <StatusBadge
                    variant={checklistStatusBadge(item.status)}
                    label={item.status}
                    size="sm"
                  />
                </Td>
                <Td muted>{item.owner}</Td>
                <Td muted>{item.dueDate}</Td>
                <Td>
                  {item.status === "Not Started" && (
                    <ActionBtn label="Start" variant="secondary" />
                  )}
                  {item.status === "Pending" && (
                    <ActionBtn label="Mark Complete" variant="primary" />
                  )}
                  {item.status === "Blocked" && (
                    <ActionBtn label="Resolve" variant="danger" />
                  )}
                  {item.status === "Complete" && (
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "#059669" }}
                    >
                      Done
                    </span>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Expanded Client Detail Panel
// ─────────────────────────────────────────────────────────────────────────────

function ClientDetailPanel({
  client,
  onClose,
  onLog,
}: {
  client: OnboardingClient;
  onClose: () => void;
  onLog: (msg: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<
    "summary" | "checklist" | "events"
  >("summary");

  const tabs: Array<{ id: typeof activeTab; label: string }> = [
    { id: "summary",   label: "Client Summary" },
    { id: "checklist", label: "Readiness Checklist" },
    { id: "events",    label: "Recent Events" },
  ];

  return (
    <div
      className="rounded-xl border mt-0 mb-2"
      style={{ background: "#F8FAFF", borderColor: "#BFDBFE" }}
    >
      {/* Panel header */}
      <div
        className="flex items-center justify-between px-5 py-3 border-b rounded-t-xl"
        style={{ background: "#EFF6FF", borderColor: "#BFDBFE" }}
      >
        <div>
          <span
            className="text-[11px] font-bold uppercase tracking-widest"
            style={{ color: "#1B4FD8" }}
          >
            Client Detail
          </span>
          <p className="text-base font-bold" style={{ color: "#1E3A8A" }}>
            {client.clientName}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
          style={{
            color: "var(--rtm-text-muted)",
            borderColor: "var(--rtm-border)",
            background: "var(--rtm-surface)",
          }}
        >
          ✕ Close
        </button>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-0 border-b"
        style={{ borderColor: "#BFDBFE" }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className="text-xs font-semibold px-4 py-2.5 border-b-2 transition-colors"
            style={{
              borderBottomColor: activeTab === t.id ? "#1B4FD8" : "transparent",
              color: activeTab === t.id ? "#1B4FD8" : "var(--rtm-text-muted)",
              background: "transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-5">
        {/* ── Summary Tab ── */}
        {activeTab === "summary" && (
          <>
            {/* Two-column billing + services */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Billing Summary */}
              <div
                className="rounded-lg border p-4 space-y-2"
                style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
              >
                <p
                  className="text-[11px] font-bold uppercase tracking-widest mb-1"
                  style={{ color: "var(--rtm-text-muted)" }}
                >
                  Billing Summary
                </p>
                <Row label="Invoice ID" value={client.invoiceId} />
                <Row
                  label="Invoice Status"
                  value={
                    <StatusBadge variant="success" label={client.invoiceStatus} size="sm" />
                  }
                />
                <Row label="Payment Date" value={client.paymentDate} />
                <Row
                  label="Billing Clearance"
                  value={
                    <StatusBadge variant="success" label={client.billingClearanceStatus} size="sm" />
                  }
                />
                <Row
                  label="Contract Confirmed"
                  value={
                    client.contractConfirmed ? (
                      <span className="text-xs font-semibold text-green-700">✓ Yes</span>
                    ) : (
                      <span className="text-xs font-semibold text-red-600">✗ No — Resolve</span>
                    )
                  }
                />
              </div>

              {/* Client + AM */}
              <div
                className="rounded-lg border p-4 space-y-2"
                style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
              >
                <p
                  className="text-[11px] font-bold uppercase tracking-widest mb-1"
                  style={{ color: "var(--rtm-text-muted)" }}
                >
                  Client &amp; AM
                </p>
                <Row label="Contact" value={client.clientContact} />
                <Row
                  label="Assigned AM"
                  value={
                    client.assignedAM === "Unassigned" ? (
                      <StatusBadge variant="warning" label="AM Assignment Needed" size="sm" />
                    ) : (
                      <span className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                        {client.assignedAM}
                      </span>
                    )
                  }
                />
                <Row
                  label="Activation Status"
                  value={
                    <StatusBadge
                      variant={activationBadge(client.activationStatus)}
                      label={client.activationStatus}
                      size="sm"
                    />
                  }
                />
                <Row
                  label="Dept Activation"
                  value={
                    <StatusBadge
                      variant={deptBadge(client.deptActivationStatus)}
                      label={client.deptActivationStatus}
                      size="sm"
                    />
                  }
                />
              </div>
            </div>

            {/* Services purchased */}
            <div
              className="rounded-lg border p-4"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
            >
              <p
                className="text-[11px] font-bold uppercase tracking-widest mb-2"
                style={{ color: "var(--rtm-text-muted)" }}
              >
                Services Purchased
              </p>
              <div className="flex flex-wrap gap-2">
                {client.servicesPurchased.map((svc) => (
                  <span
                    key={svc}
                    className="text-xs font-semibold px-2.5 py-1 rounded-full border"
                    style={{ background: "#EFF6FF", color: "#1B4FD8", borderColor: "#BFDBFE" }}
                  >
                    {svc}
                  </span>
                ))}
              </div>
            </div>

            {/* Notes */}
            {client.notes && (
              <div
                className="rounded-lg border p-4"
                style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}
              >
                <p
                  className="text-[11px] font-bold uppercase tracking-widest mb-1"
                  style={{ color: "#92400E" }}
                >
                  Notes
                </p>
                <p className="text-sm" style={{ color: "#78350F" }}>
                  {client.notes}
                </p>
              </div>
            )}
          </>
        )}

        {/* ── Checklist Tab ── */}
        {activeTab === "checklist" && (
          <ReadinessChecklist items={client.checklist} />
        )}

        {/* ── Events Tab ── */}
        {activeTab === "events" && (
          <div className="space-y-2">
            {client.recentEvents.map((ev, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border px-4 py-2.5"
                style={{
                  background: "var(--rtm-surface)",
                  borderColor: "var(--rtm-border-light)",
                }}
              >
                <span
                  className="text-[11px] font-bold w-10 flex-shrink-0 pt-0.5"
                  style={{ color: "var(--rtm-text-muted)" }}
                >
                  {ev.date}
                </span>
                <span className="text-sm flex-1" style={{ color: "var(--rtm-text-primary)" }}>
                  {ev.event}
                </span>
                <span
                  className="text-[11px] font-semibold flex-shrink-0"
                  style={{ color: "var(--rtm-text-muted)" }}
                >
                  {ev.actor}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Row action bar */}
      <div
        className="flex flex-wrap gap-2 px-5 py-3 border-t rounded-b-xl"
        style={{ background: "#F0F9FF", borderColor: "#BAE6FD" }}
      >
        <ActionBtn
          label="View Client"
          href="/clients"
          variant="secondary"
        />
        {client.assignedAM === "Unassigned" && (
          <ActionBtn
            label="Assign AM"
            variant="primary"
            onClick={() => onLog(`Assign AM triggered: ${client.clientName}`)}
          />
        )}
        {(client.activationStatus === "Ready for Onboarding" ||
          client.activationStatus === "Pending Activation") && (
          <ActionBtn
            label="Start Onboarding"
            variant="primary"
            onClick={() =>
              onLog(`Start Onboarding → Onboarding Pending: ${client.clientName}`)
            }
          />
        )}
        <ActionBtn
          label="Create Activation Tasks"
          variant="secondary"
          onClick={() =>
            onLog(`Activation tasks created: ${client.clientName}`)
          }
        />
        <ActionBtn
          label="Push to Account Management"
          href="/account-management/onboarding"
          variant="primary"
        />
        <ActionBtn
          label="Push to Dept Activation"
          href="/departments/activation"
          variant="secondary"
        />
        <ActionBtn
          label="Add Note"
          variant="secondary"
          onClick={() => onLog(`Note added: ${client.clientName}`)}
        />
        {client.activationStatus !== "Blocked" && (
          <ActionBtn
            label="Mark Blocked"
            variant="danger"
            onClick={() => onLog(`Marked Blocked: ${client.clientName}`)}
          />
        )}
      </div>
    </div>
  );
}

/** Mini label/value row inside detail panel */
function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="text-xs w-36 flex-shrink-0"
        style={{ color: "var(--rtm-text-muted)" }}
      >
        {label}
      </span>
      <span className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
        {value}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Clients Ready for Onboarding — main section
// ─────────────────────────────────────────────────────────────────────────────

function ClientsReadyForOnboarding() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLog, setActionLog] = useState<string[]>([]);

  function log(msg: string) {
    const ts = new Date().toLocaleTimeString();
    setActionLog((prev) => [`[${ts}] ${msg}`, ...prev.slice(0, 14)]);
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  const activationStatusLabel = (s: ActivationStatus) => {
    if (s === "Pushed to AM") return "AM Assignment Needed";
    return s;
  };

  return (
    <SectionWrapper
      title="Clients Ready for Onboarding"
      description="Paid clients cleared through billing whose invoice is paid, billing is cleared, and activation status qualifies for onboarding. Click any row to view client detail, readiness checklist, and take action."
    >
      {/* Badge legend */}
      <BadgeLegend />

      {/* Table */}
      <div
        className="mt-4 overflow-x-auto rounded-lg border"
        style={{ borderColor: "var(--rtm-border-light)" }}
      >
        <table className="min-w-full">
          <thead>
            <tr>
              <Th>Client Name</Th>
              <Th>Invoice Status</Th>
              <Th>Payment Date</Th>
              <Th>Billing Clearance</Th>
              <Th>Assigned AM</Th>
              <Th>Services Purchased</Th>
              <Th>Activation Status</Th>
              <Th>Dept Activation Status</Th>
              <Th>Next Required Action</Th>
              <Th>Priority</Th>
              <Th>Due Date</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {ONBOARDING_CLIENTS.map((client) => {
              const isExpanded = expandedId === client.id;
              return (
                <React.Fragment key={client.id}>
                  <tr
                    onClick={() => toggleExpand(client.id)}
                    className="cursor-pointer transition-colors"
                    style={{
                      background: isExpanded
                        ? "#EFF6FF"
                        : client.activationStatus === "Blocked"
                        ? "#FEF9F9"
                        : "var(--rtm-bg)",
                    }}
                  >
                    {/* Client Name */}
                    <Td>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-base"
                          style={{ color: "#1B4FD8" }}
                        >
                          {isExpanded ? "▼" : "▶"}
                        </span>
                        <span
                          className="font-semibold"
                          style={{ color: "var(--rtm-text-primary)" }}
                        >
                          {client.clientName}
                        </span>
                      </div>
                    </Td>

                    {/* Invoice Status */}
                    <Td>
                      <StatusBadge variant="success" label="Invoice Paid" size="sm" />
                    </Td>

                    {/* Payment Date */}
                    <Td muted>{client.paymentDate}</Td>

                    {/* Billing Clearance */}
                    <Td>
                      <StatusBadge variant="success" label="Billing Cleared" size="sm" />
                    </Td>

                    {/* Assigned AM */}
                    <Td>
                      {client.assignedAM === "Unassigned" ? (
                        <StatusBadge variant="warning" label="AM Assignment Needed" size="sm" />
                      ) : (
                        <span
                          className="text-sm font-medium"
                          style={{ color: "var(--rtm-text-primary)" }}
                        >
                          {client.assignedAM}
                        </span>
                      )}
                    </Td>

                    {/* Services */}
                    <Td wrap>
                      <span
                        className="text-xs leading-snug block max-w-[160px]"
                        style={{ color: "var(--rtm-text-secondary)", whiteSpace: "normal" }}
                      >
                        {client.servicesPurchased.join(", ")}
                      </span>
                    </Td>

                    {/* Activation Status */}
                    <Td>
                      <StatusBadge
                        variant={activationBadge(client.activationStatus)}
                        label={client.activationStatus}
                        size="sm"
                      />
                    </Td>

                    {/* Dept Activation Status */}
                    <Td>
                      <StatusBadge
                        variant={deptBadge(client.deptActivationStatus)}
                        label={client.deptActivationStatus}
                        size="sm"
                      />
                    </Td>

                    {/* Next Required Action */}
                    <Td wrap>
                      <span
                        className="text-xs leading-snug block max-w-[180px]"
                        style={{
                          color:
                            client.activationStatus === "Blocked"
                              ? "#DC2626"
                              : "var(--rtm-text-secondary)",
                          whiteSpace: "normal",
                        }}
                      >
                        {client.nextRequiredAction}
                      </span>
                    </Td>

                    {/* Priority */}
                    <Td>
                      <StatusBadge
                        variant={priorityBadge(client.priority)}
                        label={client.priority}
                        size="sm"
                      />
                    </Td>

                    {/* Due Date */}
                    <Td muted>{client.dueDate}</Td>

                    {/* Actions — stop propagation so clicks don't toggle row */}
                    <Td>
                      <div
                        className="flex gap-1 flex-wrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ActionBtn
                          label="View"
                          variant="ghost"
                          href="/clients"
                        />
                        {client.assignedAM === "Unassigned" && (
                          <ActionBtn
                            label="Assign AM"
                            variant="primary"
                            onClick={() =>
                              log(`Assign AM: ${client.clientName}`)
                            }
                          />
                        )}
                        {(client.activationStatus === "Ready for Onboarding" ||
                          client.activationStatus === "Pending Activation") && (
                          <ActionBtn
                            label="Start Onboarding"
                            variant="secondary"
                            onClick={() =>
                              log(
                                `Start Onboarding → Onboarding Pending: ${client.clientName}`
                              )
                            }
                          />
                        )}
                        {client.activationStatus === "Blocked" && (
                          <ActionBtn
                            label="Unblock"
                            variant="danger"
                            onClick={() =>
                              log(`Unblock initiated: ${client.clientName}`)
                            }
                          />
                        )}
                        {client.activationStatus !== "Pushed to AM" && (
                          <ActionBtn
                            label="Push to AM"
                            variant="secondary"
                            href="/account-management/onboarding"
                          />
                        )}
                      </div>
                    </Td>
                  </tr>

                  {/* Expanded detail row */}
                  {isExpanded && (
                    <tr key={`${client.id}-detail`}>
                      <td
                        colSpan={12}
                        className="p-0"
                        style={{ borderBottom: "2px solid #BFDBFE" }}
                      >
                        <ClientDetailPanel
                          client={client}
                          onClose={() => setExpandedId(null)}
                          onLog={log}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Action log */}
      {actionLog.length > 0 && (
        <div
          className="mt-4 rounded-lg border p-3"
          style={{
            background: "var(--rtm-bg)",
            borderColor: "var(--rtm-border-light)",
          }}
        >
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-2"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            Action Log
          </p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {actionLog.map((entry, i) => (
              <p
                key={i}
                className="text-xs font-mono"
                style={{ color: "var(--rtm-text-secondary)" }}
              >
                {entry}
              </p>
            ))}
          </div>
        </div>
      )}
    </SectionWrapper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function BillingActivationPage() {
  return (
    <div className="space-y-8">

      {/* ── Task Management Engine Banner ── */}
      <TaskAccessCard
        context="Activation"
        variant="banner"
        counters={{ open: 14, overdue: 2, dueToday: 6, completed: 31 }}
        createLabel="Create Activation Task"
        examples={["Assign AM", "Schedule Kickoff", "Create Dept Tasks", "Activation Review"]}
      />
      {/* ── Header ── */}
      <div>
        <p
          className="text-[11px] font-bold uppercase tracking-widest mb-1"
          style={{ color: workspace.accentColor }}
        >
          {workspace.name}
        </p>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--rtm-text-primary)" }}
        >
          Billing Activation
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          Per-client activation queue for paid clients ready to move from Billing to Account Management onboarding and Department Activation.
        </p>
      </div>

      {/* ── Quick links ── */}
      <QuickLinks />

      {/* ── Workflow banner ── */}
      <WorkflowBanner />

      {/* ── KPI Summary ── */}
      <SectionWrapper
        title="Activation Summary"
        description="Real-time snapshot of the onboarding queue"
      >
        <KpiCards clients={ONBOARDING_CLIENTS} />
      </SectionWrapper>

      {/* ── Clients Ready for Onboarding ── */}
      <ClientsReadyForOnboarding />

      {/* ── Footer nav ── */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={workspace.dashboardRoute}
          className="rtm-btn-secondary text-sm inline-flex items-center gap-1"
        >
          ← Dashboard
        </Link>
        <Link
          href="/billing/invoices"
          className="rtm-btn-secondary text-sm inline-flex items-center gap-1"
        >
          Invoices →
        </Link>
        <Link
          href="/account-management/onboarding"
          className="rtm-btn-primary text-sm inline-flex items-center gap-1"
        >
          AM Onboarding →
        </Link>
        <Link
          href="/departments/activation"
          className="rtm-btn-secondary text-sm inline-flex items-center gap-1"
        >
          Dept Activation →
        </Link>
        <Link
          href={workspace.tasksRoute}
          className="rtm-btn-secondary text-sm inline-flex items-center gap-1"
        >
          Tasks →
        </Link>
      </div>
    </div>
  );
}
