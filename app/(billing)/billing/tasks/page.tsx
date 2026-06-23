"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("billing")!;

//  Types 

type TaskStatus =
  | "Not Started"| "In Progress"| "Waiting For Client"| "Waiting For Sales"| "Waiting For AM"| "Waiting For Department"| "Blocked"| "Completed"| "Cancelled";

type TaskPriority = "Low"| "Medium"| "High"| "Urgent";
type BadgeVariant = "success"| "error"| "warning"| "info"| "neutral"| "pending";
type CrossModuleSource =
  | "Sales Handoff"| "Invoice Creation"| "Payment Confirmation"| "Activation Review"| "Cancellation"| "Offboarding"| "Renewal Billing"| "Collections";

interface BillingTask {
  id: string;
  task: string;
  client: string;
  billingArea: string;
  assignedUser: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  relatedModule: string;
  notes: string;
  nextAction: string;
  // Detail fields
  description: string;
  relatedInvoice: string;
  relatedContract: string;
  relatedService: string;
  owner: string;
  blocker: string;
  source: CrossModuleSource;
  // Comments / history
  billingNotes: string[];
  internalComments: string[];
  handoffNotes: string[];
  activityHistory: string[];
  statusChangeHistory: string[];
}

interface DashboardCard {
  label: string;
  count: number;
  color: string;
  bg: string;
  border: string;
}

//  Mock Data 

const billingTaskQueue: BillingTask[] = [
  {
    id: "bt1",
    task: "Generate Invoice — Metro Dental",
    client: "Metro Dental",
    billingArea: "Invoice",
    assignedUser: "Lisa P.",
    dueDate: "Jun 16",
    priority: "High",
    status: "Not Started",
    relatedModule: "Invoices",
    notes: "First invoice for new client. Contract value $1,800/mo.",
    nextAction: "Create and send invoice",
    description: "Generate the first monthly invoice for Metro Dental following successful onboarding. Contract is $1,800/month for SEO + GBP Management.",
    relatedInvoice: "INV-2024-0088 (Pending)",
    relatedContract: "CTR-2024-0041",
    relatedService: "SEO + GBP Management",
    owner: "Lisa P.",
    blocker: "None",
    source: "Invoice Creation",
    billingNotes: ["Contract signed Jun 10. First invoice due Jun 16.", "Payment terms: NET 15."],
    internalComments: ["Sales confirmed services Jun 11 — Lisa P."],
    handoffNotes: ["Handoff from Sales Jun 10. All services confirmed active."],
    activityHistory: ["Jun 10 — Task created from Sales Handoff.", "Jun 11 — Assigned to Lisa P."],
    statusChangeHistory: ["Jun 10 — Created as Not Started."],
  },
  {
    id: "bt2",
    task: "Collect Remaining Balance — Sunbelt HVAC",
    client: "Sunbelt HVAC",
    billingArea: "Collections",
    assignedUser: "Lisa P.",
    dueDate: "Jun 20",
    priority: "High",
    status: "In Progress",
    relatedModule: "Collections",
    notes: "$600 remaining. Client promised payment by Jun 20.",
    nextAction: "Send second payment reminder",
    description: "Collect the $600 outstanding balance from Sunbelt HVAC. Client agreed to pay by Jun 20 after call on Jun 12.",
    relatedInvoice: "INV-2024-0071",
    relatedContract: "CTR-2024-0028",
    relatedService: "PPC + SEO",
    owner: "Lisa P.",
    blocker: "None — client committed to payment date.",
    source: "Collections",
    billingNotes: ["$600 outstanding from INV-2024-0071.", "Client spoke to billing on Jun 12 and committed to Jun 20."],
    internalComments: ["Follow up if no payment by Jun 18 — Lisa P."],
    handoffNotes: [],
    activityHistory: ["Jun 5 — First reminder sent.", "Jun 12 — Client call. Payment committed for Jun 20.", "Jun 13 — Status moved to In Progress."],
    statusChangeHistory: ["Jun 5 — Created as Not Started.", "Jun 13 — Moved to In Progress."],
  },
  {
    id: "bt3",
    task: "Escalate Collections — Green Valley Pools",
    client: "Green Valley Pools",
    billingArea: "Collections",
    assignedUser: "Lisa P.",
    dueDate: "Jun 15",
    priority: "Urgent",
    status: "Blocked",
    relatedModule: "Collections",
    notes: "$4,400 outstanding. 45 days overdue. Legal notice may be needed.",
    nextAction: "Prepare legal notice or send to collections agency",
    description: "Green Valley Pools has $4,400 outstanding for 45+ days. Client is unresponsive. Legal escalation or collections agency referral required.",
    relatedInvoice: "INV-2024-0055, INV-2024-0062",
    relatedContract: "CTR-2024-0019",
    relatedService: "SEO + Social Media",
    owner: "Lisa P.",
    blocker: "Client unresponsive. Legal dept approval needed before escalation.",
    source: "Collections",
    billingNotes: ["45 days overdue on two invoices.", "All standard reminders exhausted."],
    internalComments: ["Escalation to legal dept submitted Jun 13 — Lisa P.", "Waiting for legal dept sign-off."],
    handoffNotes: [],
    activityHistory: ["May 1 — First invoice overdue.", "May 15 — Second invoice overdue.", "Jun 1 — Escalation initiated.", "Jun 13 — Blocked pending legal approval."],
    statusChangeHistory: ["May 1 — Created as Not Started.", "Jun 1 — Moved to In Progress.", "Jun 13 — Moved to Blocked."],
  },
  {
    id: "bt4",
    task: "Approve GBP Billing — Blue Ridge Plumbing",
    client: "Blue Ridge Plumbing",
    billingArea: "Activation",
    assignedUser: "Sarah K.",
    dueDate: "Jun 18",
    priority: "Medium",
    status: "Waiting For Department",
    relatedModule: "Activation",
    notes: "GBP add-on pending billing approval before activation.",
    nextAction: "Approve billing for GBP service",
    description: "GBP Management add-on has been sold but requires billing dept approval before the Activation team can proceed with setup.",
    relatedInvoice: "INV-2024-0089 (Pending)",
    relatedContract: "CTR-2024-0043",
    relatedService: "GBP Management",
    owner: "Sarah K.",
    blocker: "Waiting for billing manager approval.",
    source: "Activation Review",
    billingNotes: ["Add-on billed at $350/mo starting Jun 18."],
    internalComments: ["Submitted to billing manager for approval Jun 14 — Sarah K."],
    handoffNotes: ["Activation team notified to hold until billing confirms."],
    activityHistory: ["Jun 12 — Task created from Activation Review.", "Jun 14 — Submitted for dept approval."],
    statusChangeHistory: ["Jun 12 — Created as Not Started.", "Jun 14 — Moved to Waiting For Department."],
  },
  {
    id: "bt5",
    task: "Update Billing Schedule — Pacific Dental Renewal",
    client: "Pacific Dental",
    billingArea: "Renewal",
    assignedUser: "Sarah K.",
    dueDate: "Jun 22",
    priority: "Medium",
    status: "In Progress",
    relatedModule: "Renewals",
    notes: "LSA and Call Tracking added at renewal. Schedule update pending.",
    nextAction: "Update billing schedule to $4,200/mo",
    description: "Pacific Dental renewed with two add-ons: LSA ($400/mo) and Call Tracking ($200/mo). Billing schedule needs updating from $3,600 to $4,200/mo.",
    relatedInvoice: "INV-2024-0082",
    relatedContract: "CTR-2024-0016 (Renewed)",
    relatedService: "SEO + LSA + Call Tracking",
    owner: "Sarah K.",
    blocker: "None",
    source: "Renewal Billing",
    billingNotes: ["Old rate: $3,600/mo. New rate: $4,200/mo effective Jul 1."],
    internalComments: ["Renewal confirmed by AM on Jun 10 — Sarah K."],
    handoffNotes: ["AM handoff note: client confirmed all add-ons on renewal call."],
    activityHistory: ["Jun 10 — Renewal confirmed.", "Jun 11 — Task created.", "Jun 14 — Billing schedule review started."],
    statusChangeHistory: ["Jun 11 — Created as Not Started.", "Jun 14 — Moved to In Progress."],
  },
  {
    id: "bt6",
    task: "Confirm Payment Plan — Summit Pest Control",
    client: "Summit Pest Control",
    billingArea: "Collections",
    assignedUser: "Sarah K.",
    dueDate: "Jun 25",
    priority: "Medium",
    status: "Waiting For Client",
    relatedModule: "Collections",
    notes: "Payment plan agreed. Next installment due Jun 25.",
    nextAction: "Confirm next installment receipt",
    description: "Summit Pest Control entered a 3-month payment plan for $1,500 outstanding balance. First installment of $500 due Jun 25.",
    relatedInvoice: "INV-2024-0060",
    relatedContract: "CTR-2024-0022",
    relatedService: "PPC",
    owner: "Sarah K.",
    blocker: "Waiting for client to process installment payment.",
    source: "Collections",
    billingNotes: ["Payment plan: 3 x $500 installments. Jun 25, Jul 25, Aug 25."],
    internalComments: ["Plan confirmed in writing Jun 9 — Sarah K."],
    handoffNotes: [],
    activityHistory: ["Jun 9 — Payment plan agreed.", "Jun 9 — Task created as Waiting For Client."],
    statusChangeHistory: ["Jun 9 — Created as Waiting For Client."],
  },
  {
    id: "bt7",
    task: "Send To Account Management — Blue Ridge Plumbing",
    client: "Blue Ridge Plumbing",
    billingArea: "Handoff",
    assignedUser: "Sarah K.",
    dueDate: "Jun 19",
    priority: "High",
    status: "Waiting For AM",
    relatedModule: "Client Portfolio",
    notes: "All billing approved. Waiting for AM team to accept assignment.",
    nextAction: "Follow up with AM head",
    description: "Billing for Blue Ridge Plumbing is fully set up and approved. Account needs to be formally accepted by the Account Management team before billing can close the task.",
    relatedInvoice: "INV-2024-0089",
    relatedContract: "CTR-2024-0043",
    relatedService: "SEO + GBP Management",
    owner: "Sarah K.",
    blocker: "AM team has not confirmed account acceptance.",
    source: "Sales Handoff",
    billingNotes: ["All billing lines confirmed. Contract value $2,150/mo."],
    internalComments: ["AM head notified Jun 13. No reply yet — Sarah K."],
    handoffNotes: ["Billing complete. Handoff packet sent to AM Jun 13."],
    activityHistory: ["Jun 13 — Billing finalized.", "Jun 13 — Handoff packet sent to AM.", "Jun 14 — Status set to Waiting For AM."],
    statusChangeHistory: ["Jun 13 — Created as In Progress.", "Jun 14 — Moved to Waiting For AM."],
  },
  {
    id: "bt8",
    task: "Close Account — Green Valley Pools",
    client: "Green Valley Pools",
    billingArea: "Cancellation",
    assignedUser: "Lisa P.",
    dueDate: "Jun 30",
    priority: "High",
    status: "Not Started",
    relatedModule: "Cancellations",
    notes: "Client declined renewal. All services to be cancelled.",
    nextAction: "Stop billing, close account",
    description: "Green Valley Pools has declined renewal. Billing must stop all recurring charges, issue a final invoice if applicable, and close the account record.",
    relatedInvoice: "INV-2024-0055 (Final)",
    relatedContract: "CTR-2024-0019 (Terminating)",
    relatedService: "SEO + Social Media",
    owner: "Lisa P.",
    blocker: "None — awaiting scheduled closure date.",
    source: "Cancellation",
    billingNotes: ["Final billing period ends Jun 30.", "Confirm no prorated charges owed."],
    internalComments: ["Cancellation confirmed by AM Jun 12 — Lisa P."],
    handoffNotes: ["AM handoff: client confirmed cancellation in writing."],
    activityHistory: ["Jun 12 — Cancellation confirmed.", "Jun 12 — Task created."],
    statusChangeHistory: ["Jun 12 — Created as Not Started."],
  },
  {
    id: "bt9",
    task: "Collect Apex Roofing Contract Signature",
    client: "Apex Roofing",
    billingArea: "Renewal",
    assignedUser: "Lisa P.",
    dueDate: "Jun 20",
    priority: "Medium",
    status: "Waiting For Sales",
    relatedModule: "Renewals",
    notes: "Renewal agreed but contract not yet signed. Billing blocked.",
    nextAction: "Send contract reminder to client via Sales",
    description: "Apex Roofing verbally agreed to renewal but has not signed the updated contract. Billing cannot proceed until Sales provides a signed copy.",
    relatedInvoice: "INV-2024-0090 (On Hold)",
    relatedContract: "CTR-2024-0038 (Renewal Pending)",
    relatedService: "PPC + SEO",
    owner: "Lisa P.",
    blocker: "Unsigned contract. Sales rep must follow up with client.",
    source: "Renewal Billing",
    billingNotes: ["New rate: $3,100/mo. Cannot bill until contract is signed."],
    internalComments: ["Escalated to Sales rep Jun 13 — Lisa P."],
    handoffNotes: [],
    activityHistory: ["Jun 11 — Renewal discussed.", "Jun 13 — Moved to Waiting For Sales."],
    statusChangeHistory: ["Jun 11 — Created as Not Started.", "Jun 13 — Moved to Waiting For Sales."],
  },
  {
    id: "bt10",
    task: "Verify Services — Ironclad Fitness Handoff",
    client: "Ironclad Fitness",
    billingArea: "Intake",
    assignedUser: "Lisa P.",
    dueDate: "Jun 18",
    priority: "Medium",
    status: "In Progress",
    relatedModule: "Active Services",
    notes: "Sales handoff received. Verifying services before invoice generation.",
    nextAction: "Complete billing intake review",
    description: "New client handoff received from Sales. Billing must verify all sold services against the contract before generating the first invoice.",
    relatedInvoice: "INV-2024-0092 (Pending)",
    relatedContract: "CTR-2024-0047",
    relatedService: "PPC + Social Media",
    owner: "Lisa P.",
    blocker: "None",
    source: "Sales Handoff",
    billingNotes: ["Contract value: $2,400/mo. Verify 2 service lines."],
    internalComments: ["Handoff received Jun 13. Review started Jun 14 — Lisa P."],
    handoffNotes: ["Sales handoff note: PPC and Social Media confirmed active."],
    activityHistory: ["Jun 13 — Sales handoff received.", "Jun 14 — Intake review started."],
    statusChangeHistory: ["Jun 13 — Created as Not Started.", "Jun 14 — Moved to In Progress."],
  },
  {
    id: "bt11",
    task: "Send Final Invoice — Metro Dental Termination",
    client: "Metro Dental",
    billingArea: "Offboarding",
    assignedUser: "Sarah K.",
    dueDate: "Jun 25",
    priority: "High",
    status: "Not Started",
    relatedModule: "Offboarding",
    notes: "Contract terminated early. Final billing review needed.",
    nextAction: "Issue final invoice if applicable",
    description: "Metro Dental has terminated a secondary contract early. Billing must review the termination terms and issue a final invoice for any outstanding amounts.",
    relatedInvoice: "INV-2024-0091 (Pending Final)",
    relatedContract: "CTR-2024-0041 (Terminating)",
    relatedService: "Website Management",
    owner: "Sarah K.",
    blocker: "None — awaiting termination review completion.",
    source: "Offboarding",
    billingNotes: ["Early termination fee may apply per contract clause 8.2."],
    internalComments: ["Termination confirmed by AM Jun 14 — Sarah K."],
    handoffNotes: ["AM offboarding note: client requested early exit on website service only."],
    activityHistory: ["Jun 14 — Termination confirmed.", "Jun 14 — Task created."],
    statusChangeHistory: ["Jun 14 — Created as Not Started."],
  },
  {
    id: "bt12",
    task: "Notify Paid Media — Pacific Dental LSA Add",
    client: "Pacific Dental",
    billingArea: "Activation",
    assignedUser: "Sarah K.",
    dueDate: "Jun 17",
    priority: "Low",
    status: "Completed",
    relatedModule: "Activation",
    notes: "LSA billing approved. Paid Media dept notified.",
    nextAction: "None",
    description: "Following Pacific Dental renewal, LSA service was added. Billing approved the LSA line and notified the Paid Media department to begin setup.",
    relatedInvoice: "INV-2024-0082",
    relatedContract: "CTR-2024-0016 (Renewed)",
    relatedService: "LSA",
    owner: "Sarah K.",
    blocker: "None",
    source: "Payment Confirmation",
    billingNotes: ["LSA billing line added at $400/mo effective Jul 1."],
    internalComments: ["Paid Media notified Jun 13. Confirmed receipt Jun 14 — Sarah K."],
    handoffNotes: ["Paid Media handoff: LSA budget confirmed at $1,200/mo."],
    activityHistory: ["Jun 13 — LSA billing approved.", "Jun 13 — Paid Media notified.", "Jun 14 — Task marked complete."],
    statusChangeHistory: ["Jun 13 — Created as In Progress.", "Jun 14 — Moved to Completed."],
  },
];

//  Cross-Module Source Mock Data 

interface CrossModuleEntry {
  source: CrossModuleSource;
  count: number;
  recent: string;
  description: string;
  color: string;
  bg: string;
  border: string;
}

const crossModuleData: CrossModuleEntry[] = [
  {
    source: "Sales Handoff",
    count: 2,
    recent: "Ironclad Fitness — Jun 13",
    description: "Tasks created when Sales completes a new client handoff and billing intake begins.",
    color: "#1B4FD8", bg: "#EFF6FF", border: "#BFDBFE",
  },
  {
    source: "Invoice Creation",
    count: 1,
    recent: "Metro Dental — Jun 10",
    description: "Tasks triggered when a new invoice is due to be generated for a client.",
    color: "#065F46", bg: "#ECFDF5", border: "#A7F3D0",
  },
  {
    source: "Payment Confirmation",
    count: 1,
    recent: "Pacific Dental LSA — Jun 14",
    description: "Tasks created after payment is confirmed and downstream notifications are needed.",
    color: "#065F46", bg: "#ECFDF5", border: "#A7F3D0",
  },
  {
    source: "Activation Review",
    count: 2,
    recent: "Blue Ridge Plumbing GBP — Jun 12",
    description: "Tasks generated when a new service activation requires billing approval before setup.",
    color: "#D97706", bg: "#FFFBEB", border: "#FDE68A",
  },
  {
    source: "Cancellation",
    count: 1,
    recent: "Green Valley Pools — Jun 12",
    description: "Tasks created when a client cancels services and billing must stop charges and close accounts.",
    color: "#DC2626", bg: "#FEF2F2", border: "#FECACA",
  },
  {
    source: "Offboarding",
    count: 1,
    recent: "Metro Dental Website — Jun 14",
    description: "Tasks triggered during the offboarding workflow for service or account termination.",
    color: "#DC2626", bg: "#FEF2F2", border: "#FECACA",
  },
  {
    source: "Renewal Billing",
    count: 2,
    recent: "Apex Roofing — Jun 11",
    description: "Tasks created when a client renews and billing schedules, contracts, or add-ons must be updated.",
    color: "#6D28D9", bg: "#F5F3FF", border: "#DDD6FE",
  },
  {
    source: "Collections",
    count: 3,
    recent: "Green Valley Pools — Jun 13",
    description: "Tasks created when overdue invoices require follow-up, payment plans, or escalation.",
    color: "#DC2626", bg: "#FEF2F2", border: "#FECACA",
  },
];

//  Helpers 

function statusVariant(s: TaskStatus): BadgeVariant {
  switch (s) {
    case "Completed":              return "success";
    case "Cancelled":              return "neutral";
    case "Blocked":                return "error";
    case "In Progress":            return "info";
    case "Not Started":            return "neutral";
    case "Waiting For Client":
    case "Waiting For Sales":
    case "Waiting For AM":
    case "Waiting For Department": return "warning";
    default:                       return "neutral";
  }
}

function priorityColor(p: TaskPriority): { bg: string; color: string; border: string } {
  switch (p) {
    case "Urgent": return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA"};
    case "High":   return { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A"};
    case "Medium": return { bg: "#EFF6FF", color: "#1B4FD8", border: "#BFDBFE"};
    case "Low":    return { bg: "#F9FAFB", color: "#6B7280", border: "#E5E7EB"};
  }
}

const BADGE_COLORS: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
  success: { bg: "#ECFDF5", color: "#065F46", border: "#A7F3D0"},
  error:   { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA"},
  warning: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A"},
  info:    { bg: "#EFF6FF", color: "#1B4FD8", border: "#BFDBFE"},
  neutral: { bg: "#F9FAFB", color: "#6B7280", border: "#E5E7EB"},
  pending: { bg: "#FFF7ED", color: "#D97706", border: "#FDE68A"},
};

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="text-left text-xs font-semibold uppercase tracking-wide px-3 py-2 whitespace-nowrap border-b"style={{ color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg-alt, #F9FAFB)"}}
    >
      {children}
    </th>
  );
}

function Td({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <td
      className="px-3 py-2.5 text-sm border-b"style={{ color: muted ? "var(--rtm-text-muted)": "var(--rtm-text-secondary)", borderColor: "var(--rtm-border-light)"}}
    >
      {children}
    </td>
  );
}

function ActionBtn({
  label,
  onClick,
  variant = "secondary",
}: {
  label: string;
  onClick: () => void;
  variant?: "primary"| "secondary"| "danger";
}) {
  const base =
    "text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer whitespace-nowrap";
  const styles: Record<string, string> = {
    primary:
      "bg-[var(--rtm-blue,#1B4FD8)] text-white border-transparent hover:opacity-90",
    secondary:
      "bg-[var(--rtm-surface,#fff)] text-[var(--rtm-text-primary)] border-[var(--rtm-border)] hover:bg-[var(--rtm-bg)]",
    danger:
      "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] hover:bg-[#FEE2E2]",
  };
  return (
    <button className={`${base} ${styles[variant]}`} onClick={onClick}>
      {label}
    </button>
  );
}

//  Task Statuses 

const STATUSES: TaskStatus[] = [
  "Not Started",
  "In Progress",
  "Waiting For Client",
  "Waiting For Sales",
  "Waiting For AM",
  "Waiting For Department",
  "Blocked",
  "Completed",
  "Cancelled",
];

//  Page 

export default function BillingTasksPage() {
  const [selected, setSelected] = useState<BillingTask | null>(null);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "All">("All");
  const [noteText, setNoteText] = useState("");
  const [activeDetailTab, setActiveDetailTab] = useState<"detail"| "notes"| "history">("detail");

  function log(msg: string) {
    setActionLog((prev) => [
      `[${new Date().toLocaleTimeString()}] ${msg}`,
      ...prev.slice(0, 9),
    ]);
  }

  const filtered =
    filterStatus === "All"? billingTaskQueue
      : billingTaskQueue.filter((t) => t.status === filterStatus);

  //  Billing Task Dashboard counts 

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());

  const openTasks = billingTaskQueue.filter(
    (t) => t.status !== "Completed"&& t.status !== "Cancelled").length;
  // Using "Jun 15"as overdue reference (static mock)
  const overdueTasks = billingTaskQueue.filter(
    (t) =>
      t.status !== "Completed"&&
      t.status !== "Cancelled"&&
      (t.dueDate === "Jun 15"|| t.dueDate === "Jun 16")
  ).length;
  const waitingForSales = billingTaskQueue.filter(
    (t) => t.status === "Waiting For Sales").length;
  const waitingForClient = billingTaskQueue.filter(
    (t) => t.status === "Waiting For Client").length;
  const waitingForAM = billingTaskQueue.filter(
    (t) => t.status === "Waiting For AM").length;
  const blockedTasks = billingTaskQueue.filter(
    (t) => t.status === "Blocked").length;
  const completedThisWeek = billingTaskQueue.filter(
    (t) => t.status === "Completed").length;

  const dashboardCards: DashboardCard[] = [
    { label: "Open Billing Tasks",    count: openTasks,         color: "#1B4FD8", bg: "#EFF6FF", border: "#BFDBFE"},
    { label: "Overdue Tasks",         count: overdueTasks,      color: "#DC2626", bg: "#FEF2F2", border: "#FECACA"},
    { label: "Waiting For Sales",     count: waitingForSales,   color: "#D97706", bg: "#FFFBEB", border: "#FDE68A"},
    { label: "Waiting For Client",    count: waitingForClient,  color: "#D97706", bg: "#FFFBEB", border: "#FDE68A"},
    { label: "Waiting For AM",        count: waitingForAM,      color: "#D97706", bg: "#FFFBEB", border: "#FDE68A"},
    { label: "Blocked Tasks",         count: blockedTasks,      color: "#DC2626", bg: "#FEF2F2", border: "#FECACA"},
    { label: "Completed This Week",   count: completedThisWeek, color: "#065F46", bg: "#ECFDF5", border: "#A7F3D0"},
  ];

  return (
    <div className="space-y-10">

      {/*  Header  */}
      <div>
        <p
          className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: workspace.accentColor }}
        >
          {workspace.name}
        </p>
        <h1
          className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}
        >
          Billing Tasks
        </h1>
        <p className="text-sm mt-1"style={{ color: "var(--rtm-text-secondary)"}}>
          Create, assign, escalate, and manage all billing tasks. Full operational task management for Billing.
        </p>
      </div>

      {/*  */}
      {/*  Billing Task Dashboard  */}
      {/*  */}
      <SectionWrapper
        title="Billing Task Dashboard"description="Real-time snapshot of open, overdue, waiting, and completed billing tasks">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {dashboardCards.map((card) => (
            <div
              key={card.label}
              className="flex flex-col px-4 py-3 rounded-xl border"style={{ background: card.bg, borderColor: card.border }}
            >
              <span
                className="text-[11px] font-semibold uppercase tracking-wide leading-tight"style={{ color: "var(--rtm-text-muted)"}}
              >
                {card.label}
              </span>
              <span
                className="text-3xl font-bold mt-1"style={{ color: card.color }}
              >
                {card.count}
              </span>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/*  */}
      {/*  Task Action Panel (Global)  */}
      {/*  */}
      <SectionWrapper
        title="Task Action Panel"description="Global billing task actions — create, assign, escalate, and follow up">
        <div className="flex flex-wrap gap-2">
          <ActionBtn variant="primary"label="Create Task"onClick={() => log("Create Task triggered")} />
          <ActionBtn variant="secondary"label="Assign Task"onClick={() => log("Assign Task triggered")} />
          <ActionBtn variant="secondary"label="Change Status"onClick={() => log("Change Status triggered")} />
          <ActionBtn variant="secondary"label="Add Note"onClick={() => log("Add Note triggered")} />
          <ActionBtn variant="secondary"label="Add Comment"onClick={() => log("Add Comment triggered")} />
          <ActionBtn variant="secondary"label="Send Internal Note"onClick={() => log("Send Internal Note triggered")} />
          <ActionBtn variant="secondary"label="Escalate"onClick={() => log("Escalate triggered")} />
          <ActionBtn variant="secondary"label="Mark Complete"onClick={() => log("Mark Complete triggered")} />
          <ActionBtn variant="secondary"label="Request Sales Update"onClick={() => log("Request Sales Update triggered")} />
          <ActionBtn variant="secondary"label="Request AM Update"onClick={() => log("Request AM Update triggered")} />
          <ActionBtn variant="secondary"label="Create Follow-up"onClick={() => log("Create Follow-up triggered")} />
        </div>
        {actionLog.length > 0 && (
          <div
            className="mt-4 rounded-lg border p-3"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)"}}
          >
            <p
              className="text-xs font-bold uppercase tracking-wide mb-2"style={{ color: "var(--rtm-text-muted)"}}
            >
              Action Log
            </p>
            <div className="space-y-1">
              {actionLog.map((entry, i) => (
                <p
                  key={i}
                  className="text-xs font-mono"style={{ color: "var(--rtm-text-secondary)"}}
                >
                  {entry}
                </p>
              ))}
            </div>
          </div>
        )}
      </SectionWrapper>

      {/*  */}
      {/*  Billing Task Queue  */}
      {/*  */}
      <SectionWrapper
        title="Billing Task Queue"description="All billing tasks — click a row to open Billing Task Detail, Notes, and task-level actions">
        {/* Status filter */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(["All", ...STATUSES] as (TaskStatus | "All")[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className="text-xs font-semibold px-3 py-1 rounded-full border transition-colors"style={
                filterStatus === s
                  ? { background: "#1B4FD8", color: "#fff", borderColor: "#1B4FD8"}
                  : {
                      background: "var(--rtm-surface)",
                      color: "var(--rtm-text-muted)",
                      borderColor: "var(--rtm-border)",
                    }
              }
            >
              {s}
            </button>
          ))}
        </div>

        {/* Task table */}
        <div
          className="overflow-x-auto rounded-lg border"style={{ borderColor: "var(--rtm-border-light)"}}
        >
          <table className="min-w-full">
            <thead>
              <tr>
                <Th>Task</Th>
                <Th>Client</Th>
                <Th>Billing Area</Th>
                <Th>Assigned User</Th>
                <Th>Due Date</Th>
                <Th>Priority</Th>
                <Th>Status</Th>
                <Th>Related Module</Th>
                <Th>Notes</Th>
                <Th>Next Action</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const isSelected = selected?.id === t.id;
                const pc = priorityColor(t.priority);
                return (
                  <tr
                    key={t.id}
                    onClick={() => {
                      setSelected(isSelected ? null : t);
                      setActiveDetailTab("detail");
                    }}
                    className="cursor-pointer transition-colors"style={{
                      background: isSelected
                        ? "#EFF6FF": "var(--rtm-bg)",
                    }}
                  >
                    <Td>
                      <span
                        className="font-semibold"style={{ color: "var(--rtm-text-primary)"}}
                      >
                        {t.task}
                      </span>
                    </Td>
                    <Td muted>{t.client}</Td>
                    <Td muted>{t.billingArea}</Td>
                    <Td muted>{t.assignedUser}</Td>
                    <Td muted>{t.dueDate}</Td>
                    <Td>
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full border"style={{
                          background: pc.bg,
                          color: pc.color,
                          borderColor: pc.border,
                        }}
                      >
                        {t.priority}
                      </span>
                    </Td>
                    <Td>
                      <StatusBadge
                        variant={statusVariant(t.status)}
                        label={t.status}
                        size="sm"/>
                    </Td>
                    <Td muted>{t.relatedModule}</Td>
                    <Td muted>
                      <span className="block max-w-[200px] whitespace-normal leading-tight text-xs">
                        {t.notes}
                      </span>
                    </Td>
                    <Td muted>{t.nextAction}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

      {/*  */}
      {/*  Billing Task Detail + Notes & Comments (inline panel)  */}
      {/*  */}
      {selected && (
        <div
          className="rounded-xl border p-6 space-y-6"style={{
            background: "var(--rtm-surface)",
            borderColor: "var(--rtm-border)",
          }}
        >
          {/* Panel header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                className="text-base font-bold"style={{ color: "var(--rtm-text-primary)"}}
              >
                {selected.task}
              </h2>
              <p
                className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}
              >
                {selected.client} · {selected.billingArea} · Due{""}
                {selected.dueDate} · Assigned: {selected.assignedUser}
              </p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border shrink-0"style={{
                color: "var(--rtm-text-muted)",
                borderColor: "var(--rtm-border)",
              }}
            >
               Close
            </button>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 border-b"style={{ borderColor: "var(--rtm-border-light)"}}>
            {(["detail", "notes", "history"] as const).map((tab) => {
              const labels: Record<string, string> = {
                detail: "Billing Task Detail",
                notes: "Notes & Comments",
                history: "Activity History",
              };
              return (
                <button
                  key={tab}
                  onClick={() => setActiveDetailTab(tab)}
                  className="text-xs font-semibold px-4 py-2 rounded-t-lg border-b-2 transition-colors"style={
                    activeDetailTab === tab
                      ? {
                          color: "#1B4FD8",
                          borderColor: "#1B4FD8",
                          background: "#EFF6FF",
                        }
                      : {
                          color: "var(--rtm-text-muted)",
                          borderColor: "transparent",
                          background: "transparent",
                        }
                  }
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>

          {/*  Tab: Billing Task Detail  */}
          {activeDetailTab === "detail"&& (
            <div className="space-y-5">
              {/* Detail grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: "Task Description",  value: selected.description },
                  { label: "Related Client",     value: selected.client },
                  { label: "Related Invoice",    value: selected.relatedInvoice },
                  { label: "Related Contract",   value: selected.relatedContract },
                  { label: "Related Service",    value: selected.relatedService },
                  { label: "Owner",              value: selected.owner },
                  { label: "Due Date",           value: selected.dueDate },
                  { label: "Priority",           value: selected.priority },
                  { label: "Status",             value: selected.status },
                  { label: "Blocker",            value: selected.blocker || "None"},
                  { label: "Source Module",      value: selected.source },
                  { label: "Next Action",        value: selected.nextAction },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-lg border p-3"style={{
                      background: "var(--rtm-bg)",
                      borderColor: "var(--rtm-border-light)",
                    }}
                  >
                    <p
                      className="text-[10px] font-bold uppercase tracking-widest mb-1"style={{ color: "var(--rtm-text-muted)"}}
                    >
                      {label}
                    </p>
                    <p
                      className="text-sm font-medium leading-snug"style={{ color: "var(--rtm-text-primary)"}}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Change Status */}
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wide mb-2"style={{ color: "var(--rtm-text-muted)"}}
                >
                  Change Status
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {STATUSES.map((s) => {
                    const v = statusVariant(s);
                    const c = BADGE_COLORS[v];
                    const isActive = selected.status === s;
                    return (
                      <button
                        key={s}
                        onClick={() =>
                          log(
                            `Status changed to "${s}"for task: ${selected.task}`
                          )
                        }
                        className="text-xs font-semibold px-3 py-1 rounded-full border transition-colors"style={
                          isActive
                            ? {
                                background: c.color,
                                color: "#fff",
                                borderColor: c.color,
                              }
                            : {
                                background: c.bg,
                                color: c.color,
                                borderColor: c.border,
                              }
                        }
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Task-level actions */}
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wide mb-2"style={{ color: "var(--rtm-text-muted)"}}
                >
                  Task Actions
                </p>
                <div className="flex flex-wrap gap-2">
                  <ActionBtn
                    variant="primary"label="Assign Task"onClick={() => log(`Assigned task: ${selected.task}`)}
                  />
                  <ActionBtn
                    variant="secondary"label="Add Comment"onClick={() => log(`Comment added to: ${selected.task}`)}
                  />
                  <ActionBtn
                    variant="secondary"label="Send Internal Note"onClick={() =>
                      log(`Internal note sent: ${selected.task}`)
                    }
                  />
                  <ActionBtn
                    variant="secondary"label="Escalate"onClick={() => log(`Escalated task: ${selected.task}`)}
                  />
                  <ActionBtn
                    variant="secondary"label="Mark Complete"onClick={() =>
                      log(`Marked complete: ${selected.task}`)
                    }
                  />
                  <ActionBtn
                    variant="secondary"label="Request Sales Update"onClick={() =>
                      log(`Sales update requested: ${selected.task}`)
                    }
                  />
                  <ActionBtn
                    variant="secondary"label="Request AM Update"onClick={() =>
                      log(`AM update requested: ${selected.task}`)
                    }
                  />
                  <ActionBtn
                    variant="secondary"label="Create Follow-up"onClick={() =>
                      log(`Follow-up created: ${selected.task}`)
                    }
                  />
                  <ActionBtn
                    variant="danger"label="Cancel Task"onClick={() => log(`Cancelled task: ${selected.task}`)}
                  />
                </div>
              </div>

              {/* Add note inline */}
              <div className="space-y-2">
                <p
                  className="text-xs font-bold uppercase tracking-wide"style={{ color: "var(--rtm-text-muted)"}}
                >
                  Add Note
                </p>
                <textarea
                  rows={2}
                  placeholder="Add a note to this task…"value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border resize-none"style={{
                    background: "var(--rtm-bg)",
                    borderColor: "var(--rtm-border)",
                    color: "var(--rtm-text-primary)",
                  }}
                />
                <ActionBtn
                  variant="primary"label="Save Note"onClick={() => {
                    log(`Note saved: "${noteText}"`);
                    setNoteText("");
                  }}
                />
              </div>
            </div>
          )}

          {/*  Tab: Notes & Comments  */}
          {activeDetailTab === "notes"&& (
            <div className="space-y-5">
              {[
                {
                  heading: "Billing Notes",
                  items: selected.billingNotes,
                  color: "#1B4FD8",
                  bg: "#EFF6FF",
                  border: "#BFDBFE",
                },
                {
                  heading: "Internal Comments",
                  items: selected.internalComments,
                  color: "#065F46",
                  bg: "#ECFDF5",
                  border: "#A7F3D0",
                },
                {
                  heading: "Handoff Notes",
                  items: selected.handoffNotes,
                  color: "#D97706",
                  bg: "#FFFBEB",
                  border: "#FDE68A",
                },
              ].map(({ heading, items, color, bg, border }) => (
                <div key={heading}>
                  <p
                    className="text-xs font-bold uppercase tracking-wide mb-2"style={{ color: "var(--rtm-text-muted)"}}
                  >
                    {heading}
                  </p>
                  {items.length === 0 ? (
                    <p
                      className="text-xs italic"style={{ color: "var(--rtm-text-muted)"}}
                    >
                      No {heading.toLowerCase()} recorded.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {items.map((note, i) => (
                        <div
                          key={i}
                          className="rounded-lg border px-4 py-2.5 text-sm"style={{ background: bg, borderColor: border, color }}
                        >
                          {note}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/*  Tab: Activity History  */}
          {activeDetailTab === "history"&& (
            <div className="space-y-5">
              {[
                { heading: "Activity History",       items: selected.activityHistory },
                { heading: "Status Change History",  items: selected.statusChangeHistory },
              ].map(({ heading, items }) => (
                <div key={heading}>
                  <p
                    className="text-xs font-bold uppercase tracking-wide mb-2"style={{ color: "var(--rtm-text-muted)"}}
                  >
                    {heading}
                  </p>
                  {items.length === 0 ? (
                    <p
                      className="text-xs italic"style={{ color: "var(--rtm-text-muted)"}}
                    >
                      No history recorded.
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {items.map((entry, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 text-sm"style={{ color: "var(--rtm-text-secondary)"}}
                        >
                          <span
                            className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0"style={{ background: "var(--rtm-text-muted)"}}
                          />
                          {entry}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Action log for this session */}
              {actionLog.length > 0 && (
                <div>
                  <p
                    className="text-xs font-bold uppercase tracking-wide mb-2"style={{ color: "var(--rtm-text-muted)"}}
                  >
                    Session Action Log
                  </p>
                  <div className="space-y-1">
                    {actionLog.map((entry, i) => (
                      <p
                        key={i}
                        className="text-xs font-mono"style={{ color: "var(--rtm-text-secondary)"}}
                      >
                        {entry}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/*  */}
      {/*  Cross-Module Task Sources  */}
      {/*  */}
      <SectionWrapper
        title="Cross-Module Task Sources"description="Billing tasks created from other modules — Sales Handoff, Invoices, Payments, Activation, Cancellations, Offboarding, Renewals, and Collections">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {crossModuleData.map((entry) => (
            <div
              key={entry.source}
              className="rounded-xl border p-4 space-y-2"style={{ background: entry.bg, borderColor: entry.border }}
            >
              <div className="flex items-center justify-between">
                <p
                  className="text-xs font-bold uppercase tracking-wide"style={{ color: entry.color }}
                >
                  {entry.source}
                </p>
                <span
                  className="text-lg font-bold"style={{ color: entry.color }}
                >
                  {entry.count}
                </span>
              </div>
              <p
                className="text-xs leading-relaxed"style={{ color: "var(--rtm-text-secondary)"}}
              >
                {entry.description}
              </p>
              <p
                className="text-[11px] font-medium"style={{ color: "var(--rtm-text-muted)"}}
              >
                Most recent: {entry.recent}
              </p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/*  Footer nav  */}
      <div className="flex gap-2 flex-wrap">
        <Link
          href={workspace.dashboardRoute}
          className="rtm-btn-secondary text-sm inline-flex items-center gap-1">
          ← Dashboard
        </Link>
        <Link
          href="/billing/invoices"className="rtm-btn-secondary text-sm inline-flex items-center gap-1">
          Invoices →
        </Link>
        <Link
          href="/billing/client-portfolio"className="rtm-btn-primary text-sm inline-flex items-center gap-1">
          Client Portfolio →
        </Link>
      </div>
    </div>
  );
}
