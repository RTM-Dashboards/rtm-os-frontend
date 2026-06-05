"use client";

import { useState } from "react";
import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import {
  recurringClients,
  accountManagers,
  getManagerKPIs,
  getAMKPIs,
  type RecurringClient,
  type PaymentStatus,
  type DeliverableStatus,
  type PerformanceStatus,
  type RiskStatus,
  type ClientHealth,
  type TaskStatus,
} from "@/lib/am-recurring-data";

// ── Status helpers ─────────────────────────────────────────────────────────────
function paymentVariant(s: PaymentStatus): "success" | "warning" | "pending" | "info" | "error" {
  switch (s) {
    case "Current":                   return "success";
    case "Overdue":
    case "Payment Failed":
    case "Cancelled / Offboarding":   return "error";
    case "Renewal Upcoming":          return "warning";
    default:                          return "pending";
  }
}

function deliverableVariant(s: DeliverableStatus): "success" | "warning" | "pending" | "info" | "error" {
  switch (s) {
    case "Completed":        return "success";
    case "Blocked":
    case "Delayed":          return "error";
    case "Ready for Review": return "info";
    case "Waiting for Client": return "warning";
    case "In Progress":      return "pending";
    default:                 return "pending";
  }
}

function performanceVariant(s: PerformanceStatus): "success" | "warning" | "pending" | "info" | "error" {
  switch (s) {
    case "Healthy":
    case "Improving":  return "success";
    case "Declining":
    case "At Risk":    return "warning";
    case "Critical":   return "error";
    default:           return "info";
  }
}

function riskVariant(s: RiskStatus): "success" | "warning" | "pending" | "info" | "error" {
  switch (s) {
    case "No Risk":   return "success";
    case "Low":       return "info";
    case "Medium":    return "warning";
    case "High":
    case "Critical":  return "error";
    default:          return "pending";
  }
}

function healthVariant(s: ClientHealth): "success" | "warning" | "pending" | "info" | "error" {
  switch (s) {
    case "Excellent":
    case "Good":   return "success";
    case "Fair":   return "warning";
    case "Poor":   return "error";
    case "Critical": return "error";
    default:       return "pending";
  }
}

function taskVariant(s: TaskStatus): "success" | "warning" | "pending" | "info" | "error" {
  switch (s) {
    case "Completed":        return "success";
    case "Blocked":
    case "Delayed":          return "error";
    case "Ready for Review": return "info";
    case "Waiting for Client": return "warning";
    case "In Progress":      return "pending";
    default:                 return "pending";
  }
}

// ── Quick Actions ─────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon: "📞", label: "Schedule Check-in" },
  { icon: "📝", label: "Add Client Note" },
  { icon: "👤", label: "View Client Details" },
  { icon: "✅", label: "Review Department Tasks" },
  { icon: "📤", label: "Send Client Update" },
  { icon: "⚠️", label: "Escalate Risk" },
  { icon: "💳", label: "Review Payment Status" },
  { icon: "🤖", label: "Generate AI Summary" },
];

// ── Seasonal mock data ────────────────────────────────────────────────────────
const SEASONAL_INSIGHTS = [
  {
    context:     "Phoenix, AZ — Summer 2025",
    type:        "Weather Alert",
    insight:     "Summer storm season increases roofing demand significantly in Arizona.",
    clients:     ["Apex Roofing"],
    action:      "Increase LSA budget and add storm damage keywords to paid campaigns.",
  },
  {
    context:     "Los Angeles, CA — Summer 2025",
    type:        "Seasonal Trend",
    insight:     "Summer medspa demand peaks for body contouring, laser treatments, and skin care.",
    clients:     ["Radiance MedSpa"],
    action:      "Launch summer promo Meta campaign. Target laser and body sculpting keywords.",
  },
  {
    context:     "Denver, CO — Summer 2025",
    type:        "Seasonal Trend",
    insight:     "Spring and summer are peak landscaping and outdoor services season in Colorado.",
    clients:     ["Summit Landscaping"],
    action:      "Highlight spring/summer demand in renewal conversation. Propose seasonal LSA increase.",
  },
  {
    context:     "Seattle, WA — Summer 2025",
    type:        "Seasonal Trend",
    insight:     "Summer driving season increases auto repair demand in Seattle.",
    clients:     ["Harbor Auto"],
    action:      "Once account stabilized, propose summer tune-up campaign.",
  },
  {
    context:     "San Diego, CA — Summer 2025",
    type:        "Seasonal Trend",
    insight:     "Back-to-school season drives dental checkup demand peaks in summer.",
    clients:     ["Pacific Dental"],
    action:      "Launch back-to-school dental campaign on Google Ads in July.",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK DATA — New Sections
// ═══════════════════════════════════════════════════════════════════════════════

// ── New Client Onboarding mock data ──────────────────────────────────────────
type OnboardingStage =
  | "Sales Closed Won"
  | "Sent to Billing"
  | "Awaiting Payment"
  | "Payment Confirmed"
  | "Ready for AM Onboarding"
  | "Assigned to AM"
  | "Onboarding In Progress"
  | "Ready for Department Launch";

const ONBOARDING_STAGE_ORDER: OnboardingStage[] = [
  "Sales Closed Won",
  "Sent to Billing",
  "Awaiting Payment",
  "Payment Confirmed",
  "Ready for AM Onboarding",
  "Assigned to AM",
  "Onboarding In Progress",
  "Ready for Department Launch",
];

interface OnboardingClient {
  id: string;
  name: string;
  industry: string;
  assignedAM: string;
  stage: OnboardingStage;
  startDate: string;
  contractedServices: string[];
  notes: string;
}

const ONBOARDING_CLIENTS: OnboardingClient[] = [
  {
    id: "onb-1",
    name: "Bright Dental Studio",
    industry: "Dental",
    assignedAM: "Sarah Kim",
    stage: "Awaiting Payment",
    startDate: "2025-07-01",
    contractedServices: ["SEO", "Google Ads", "GBP"],
    notes: "Invoice sent. Following up Friday.",
  },
  {
    id: "onb-2",
    name: "Verde Lawn & Landscape",
    industry: "Landscaping",
    assignedAM: "Jake Torres",
    stage: "Assigned to AM",
    startDate: "2025-07-03",
    contractedServices: ["Meta Ads", "LSA", "Content"],
    notes: "AM intro call scheduled for July 5th.",
  },
  {
    id: "onb-3",
    name: "PeakFit Gym",
    industry: "Fitness",
    assignedAM: "Maria Chen",
    stage: "Onboarding In Progress",
    startDate: "2025-06-28",
    contractedServices: ["SEO", "Meta Ads", "GBP"],
    notes: "Intake form received. Kickoff meeting done.",
  },
  {
    id: "onb-4",
    name: "Cascade Plumbing Co.",
    industry: "Home Services",
    assignedAM: "David Park",
    stage: "Ready for Department Launch",
    startDate: "2025-06-20",
    contractedServices: ["SEO", "LSA", "Reporting"],
    notes: "All onboarding complete. Departments notified.",
  },
  {
    id: "onb-5",
    name: "Summit Eye Care",
    industry: "Optometry",
    assignedAM: "Lisa Wong",
    stage: "Payment Confirmed",
    startDate: "2025-07-08",
    contractedServices: ["Google Ads", "GBP", "Web Development"],
    notes: "Payment cleared. Ready for AM assignment.",
  },
];

function onboardingStageVariant(stage: OnboardingStage): "success" | "warning" | "pending" | "info" | "error" {
  switch (stage) {
    case "Sales Closed Won":           return "success";
    case "Payment Confirmed":          return "success";
    case "Ready for Department Launch":return "info";
    case "Awaiting Payment":           return "warning";
    case "Sent to Billing":            return "pending";
    case "Ready for AM Onboarding":    return "pending";
    case "Assigned to AM":             return "info";
    case "Onboarding In Progress":     return "pending";
    default:                           return "pending";
  }
}

// ── Service Activation Center mock data ──────────────────────────────────────
type ActivationStatus = "Not Started" | "In Progress" | "Activated" | "Blocked" | "Pending Approval";
type ServicePaymentStatus = "Confirmed" | "Pending" | "Overdue";
type RecommendedService = { service: string; reason: string };

interface ServiceActivationClient {
  id: string;
  client: string;
  assignedAM: string;
  contractedServices: string[];
  paymentStatus: ServicePaymentStatus;
  servicesToActivate: string[];
  activationStatus: Record<string, ActivationStatus>;
  recommendedServices: RecommendedService[];
}

const SERVICE_ACTIVATION_DATA: ServiceActivationClient[] = [
  {
    id: "sac-1",
    client: "Cascade Plumbing Co.",
    assignedAM: "David Park",
    contractedServices: ["SEO", "LSA", "Reporting"],
    paymentStatus: "Confirmed",
    servicesToActivate: ["SEO", "LSA"],
    activationStatus: { SEO: "In Progress", LSA: "Not Started", Reporting: "Activated" },
    recommendedServices: [
      { service: "Google Ads", reason: "High intent plumbing searches in Denver market" },
      { service: "GBP", reason: "Increase local map pack visibility" },
    ],
  },
  {
    id: "sac-2",
    client: "PeakFit Gym",
    assignedAM: "Maria Chen",
    contractedServices: ["SEO", "Meta Ads", "GBP"],
    paymentStatus: "Confirmed",
    servicesToActivate: ["SEO", "Meta Ads", "GBP"],
    activationStatus: { SEO: "In Progress", "Meta Ads": "Pending Approval", GBP: "Activated" },
    recommendedServices: [
      { service: "Content", reason: "Fitness blog drives organic traffic and member retention" },
    ],
  },
  {
    id: "sac-3",
    client: "Summit Eye Care",
    assignedAM: "Lisa Wong",
    contractedServices: ["Google Ads", "GBP", "Web Development"],
    paymentStatus: "Pending",
    servicesToActivate: ["Google Ads", "GBP"],
    activationStatus: { "Google Ads": "Not Started", GBP: "Not Started", "Web Development": "In Progress" },
    recommendedServices: [
      { service: "LSA", reason: "Eye care services qualify for Google LSA in most markets" },
    ],
  },
  {
    id: "sac-4",
    client: "Verde Lawn & Landscape",
    assignedAM: "Jake Torres",
    contractedServices: ["Meta Ads", "LSA", "Content"],
    paymentStatus: "Confirmed",
    servicesToActivate: ["Meta Ads", "LSA"],
    activationStatus: { "Meta Ads": "Not Started", LSA: "Not Started", Content: "Not Started" },
    recommendedServices: [
      { service: "SEO", reason: "Seasonal landscaping searches spike in spring/summer" },
      { service: "GBP", reason: "Local service area visibility" },
    ],
  },
];

function activationStatusVariant(s: ActivationStatus): "success" | "warning" | "pending" | "info" | "error" {
  switch (s) {
    case "Activated":        return "success";
    case "In Progress":      return "pending";
    case "Pending Approval": return "warning";
    case "Blocked":          return "error";
    case "Not Started":      return "info";
    default:                 return "pending";
  }
}

function servicePaymentVariant(s: ServicePaymentStatus): "success" | "warning" | "pending" | "info" | "error" {
  switch (s) {
    case "Confirmed": return "success";
    case "Pending":   return "warning";
    case "Overdue":   return "error";
    default:          return "pending";
  }
}

// ── Department Launch Center mock data ───────────────────────────────────────
type LaunchStatus = "Not Started" | "In Progress" | "Launched" | "Blocked" | "Awaiting Assets";
type DeptTaskStatus2 = "Pending" | "In Progress" | "Completed" | "Blocked";

interface DeptLaunchRow {
  id: string;
  client: string;
  department: string;
  service: string;
  assignedOwner: string;
  dueDate: string;
  launchStatus: LaunchStatus;
  deptTaskStatus: DeptTaskStatus2;
}

const DEPT_LAUNCH_DATA: DeptLaunchRow[] = [
  {
    id: "dlc-1",
    client: "Cascade Plumbing Co.",
    department: "SEO",
    service: "SEO",
    assignedOwner: "Alex Rivera",
    dueDate: "2025-07-10",
    launchStatus: "In Progress",
    deptTaskStatus: "In Progress",
  },
  {
    id: "dlc-2",
    client: "Cascade Plumbing Co.",
    department: "LSA",
    service: "LSA",
    assignedOwner: "Tina Nguyen",
    dueDate: "2025-07-12",
    launchStatus: "Not Started",
    deptTaskStatus: "Pending",
  },
  {
    id: "dlc-3",
    client: "PeakFit Gym",
    department: "SEO",
    service: "SEO",
    assignedOwner: "Alex Rivera",
    dueDate: "2025-07-08",
    launchStatus: "In Progress",
    deptTaskStatus: "In Progress",
  },
  {
    id: "dlc-4",
    client: "PeakFit Gym",
    department: "Meta Ads",
    service: "Meta Ads",
    assignedOwner: "Carlos Mendez",
    dueDate: "2025-07-09",
    launchStatus: "Awaiting Assets",
    deptTaskStatus: "Blocked",
  },
  {
    id: "dlc-5",
    client: "PeakFit Gym",
    department: "GBP",
    service: "GBP",
    assignedOwner: "Emma Liu",
    dueDate: "2025-07-07",
    launchStatus: "Launched",
    deptTaskStatus: "Completed",
  },
  {
    id: "dlc-6",
    client: "Summit Eye Care",
    department: "Web Development",
    service: "Web Development",
    assignedOwner: "Jordan Patel",
    dueDate: "2025-07-20",
    launchStatus: "In Progress",
    deptTaskStatus: "In Progress",
  },
  {
    id: "dlc-7",
    client: "Verde Lawn & Landscape",
    department: "Meta Ads",
    service: "Meta Ads",
    assignedOwner: "Carlos Mendez",
    dueDate: "2025-07-15",
    launchStatus: "Not Started",
    deptTaskStatus: "Pending",
  },
  {
    id: "dlc-8",
    client: "Verde Lawn & Landscape",
    department: "Content",
    service: "Content",
    assignedOwner: "Nina Foster",
    dueDate: "2025-07-18",
    launchStatus: "Not Started",
    deptTaskStatus: "Pending",
  },
];

function launchStatusVariant(s: LaunchStatus): "success" | "warning" | "pending" | "info" | "error" {
  switch (s) {
    case "Launched":        return "success";
    case "In Progress":     return "pending";
    case "Awaiting Assets": return "warning";
    case "Blocked":         return "error";
    case "Not Started":     return "info";
    default:                return "pending";
  }
}

function deptTaskStatusVariant(s: DeptTaskStatus2): "success" | "warning" | "pending" | "info" | "error" {
  switch (s) {
    case "Completed":  return "success";
    case "Blocked":    return "error";
    case "In Progress":return "pending";
    case "Pending":    return "info";
    default:           return "pending";
  }
}

// ── Centralized Task Management mock data ────────────────────────────────────
type CentralTaskStatus = "Not Started" | "In Progress" | "Completed" | "Blocked" | "Waiting for Client" | "Review";

interface CentralTask {
  id: string;
  task: string;
  client: string;
  department: string;
  service: string;
  assignedUser: string;
  dueDate: string;
  status: CentralTaskStatus;
  notes: string;
  comments: string[];
  activityHistory: string[];
}

const CENTRAL_TASKS: CentralTask[] = [
  {
    id: "ct-1",
    task: "Set up Google Search campaigns",
    client: "Cascade Plumbing Co.",
    department: "Google Ads",
    service: "Google Ads",
    assignedUser: "Tina Nguyen",
    dueDate: "2025-07-10",
    status: "In Progress",
    notes: "Waiting on keyword list approval from client.",
    comments: ["Client approved initial keyword set on 7/2", "Budget confirmed at $1,500/mo"],
    activityHistory: ["Task created — 2025-06-25", "Assigned to Tina Nguyen — 2025-06-26", "Status changed to In Progress — 2025-07-01"],
  },
  {
    id: "ct-2",
    task: "Complete intake form review",
    client: "PeakFit Gym",
    department: "SEO",
    service: "SEO",
    assignedUser: "Alex Rivera",
    dueDate: "2025-07-08",
    status: "Completed",
    notes: "All information verified and onboarding doc updated.",
    comments: ["Intake form received 7/1", "Completed review and filed — 7/3"],
    activityHistory: ["Task created — 2025-06-28", "Status changed to In Progress — 2025-07-01", "Status changed to Completed — 2025-07-03"],
  },
  {
    id: "ct-3",
    task: "Request creative assets from client",
    client: "PeakFit Gym",
    department: "Meta Ads",
    service: "Meta Ads",
    assignedUser: "Carlos Mendez",
    dueDate: "2025-07-09",
    status: "Waiting for Client",
    notes: "Sent asset request form on 7/2. No response yet.",
    comments: ["Asset request sent via email 7/2", "Follow-up scheduled for 7/7"],
    activityHistory: ["Task created — 2025-07-01", "Status changed to Waiting for Client — 2025-07-02"],
  },
  {
    id: "ct-4",
    task: "Build and launch website homepage",
    client: "Summit Eye Care",
    department: "Web Development",
    service: "Web Development",
    assignedUser: "Jordan Patel",
    dueDate: "2025-07-20",
    status: "In Progress",
    notes: "Wireframe approved. Development in progress.",
    comments: ["Wireframe reviewed by client 7/3", "Staging build started 7/5"],
    activityHistory: ["Task created — 2025-07-01", "Assigned to Jordan Patel — 2025-07-02", "Status updated to In Progress — 2025-07-05"],
  },
  {
    id: "ct-5",
    task: "Draft first content batch (4 blogs)",
    client: "Verde Lawn & Landscape",
    department: "Content",
    service: "Content",
    assignedUser: "Nina Foster",
    dueDate: "2025-07-18",
    status: "Not Started",
    notes: "Topics to be finalized after kickoff call.",
    comments: [],
    activityHistory: ["Task created — 2025-07-05"],
  },
  {
    id: "ct-6",
    task: "Configure LSA account and submit for verification",
    client: "Cascade Plumbing Co.",
    department: "LSA",
    service: "LSA",
    assignedUser: "Tina Nguyen",
    dueDate: "2025-07-12",
    status: "Not Started",
    notes: "Needs business license and insurance documents from client.",
    comments: ["Document checklist sent to client 7/4"],
    activityHistory: ["Task created — 2025-07-03"],
  },
  {
    id: "ct-7",
    task: "Publish GBP profile and add photos",
    client: "PeakFit Gym",
    department: "GBP",
    service: "GBP",
    assignedUser: "Emma Liu",
    dueDate: "2025-07-07",
    status: "Completed",
    notes: "Profile live. 12 photos added.",
    comments: ["GBP profile claimed and verified 7/1", "Photos uploaded and published 7/6"],
    activityHistory: ["Task created — 2025-06-28", "Status changed to In Progress — 2025-07-01", "Status changed to Completed — 2025-07-06"],
  },
  {
    id: "ct-8",
    task: "Set up Meta Ads account and pixel",
    client: "Verde Lawn & Landscape",
    department: "Meta Ads",
    service: "Meta Ads",
    assignedUser: "Carlos Mendez",
    dueDate: "2025-07-15",
    status: "Not Started",
    notes: "Awaiting client access to Facebook Business Manager.",
    comments: ["Access request sent 7/5"],
    activityHistory: ["Task created — 2025-07-05"],
  },
];

function centralTaskStatusVariant(s: CentralTaskStatus): "success" | "warning" | "pending" | "info" | "error" {
  switch (s) {
    case "Completed":        return "success";
    case "Blocked":          return "error";
    case "In Progress":      return "pending";
    case "Waiting for Client": return "warning";
    case "Review":           return "info";
    case "Not Started":      return "info";
    default:                 return "pending";
  }
}

const ALL_CENTRAL_TASK_STATUSES: CentralTaskStatus[] = [
  "Not Started", "In Progress", "Completed", "Blocked", "Waiting for Client", "Review",
];

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED SECTION COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// ── New Client Onboarding Section ─────────────────────────────────────────────
function NewClientOnboardingSection() {
  const stageCounts = ONBOARDING_STAGE_ORDER.map((stage) => ({
    stage,
    count: ONBOARDING_CLIENTS.filter((c) => c.stage === stage).length,
  }));

  return (
    <SectionWrapper
      title="New Client Onboarding"
      description="Track new clients through the onboarding pipeline from sales close to department launch"
    >
      {/* Pipeline stage summary */}
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--rtm-text-muted)" }}>
          Onboarding Pipeline
        </p>
        <div className="flex flex-wrap gap-2">
          {stageCounts.map(({ stage, count }, idx) => (
            <div key={stage} className="flex items-center gap-1.5">
              <div
                className="px-3 py-1.5 rounded-lg border text-xs font-semibold text-center min-w-[120px]"
                style={{
                  background: count > 0 ? "#EFF6FF" : "#F8FAFC",
                  borderColor: count > 0 ? "#BFDBFE" : "var(--rtm-border-light)",
                  color: count > 0 ? "#1D4ED8" : "var(--rtm-text-muted)",
                }}
              >
                <span className="block">{stage}</span>
                <span className="block text-lg font-bold" style={{ color: count > 0 ? "#1D4ED8" : "#94A3B8" }}>{count}</span>
              </div>
              {idx < ONBOARDING_STAGE_ORDER.length - 1 && (
                <span className="text-slate-300 font-bold text-lg">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Client table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
              {[
                "Client", "Industry", "Assigned AM", "Contracted Services",
                "Stage", "Start Date", "Notes",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                  style={{ color: "var(--rtm-text-muted)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "var(--rtm-border-light)" }}>
            {ONBOARDING_CLIENTS.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-2.5 px-3 font-semibold whitespace-nowrap" style={{ color: "var(--rtm-text-primary)" }}>
                  {c.name}
                </td>
                <td className="py-2.5 px-3 text-xs whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>
                  {c.industry}
                </td>
                <td className="py-2.5 px-3 text-xs whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>
                  {c.assignedAM}
                </td>
                <td className="py-2.5 px-3">
                  <div className="flex flex-wrap gap-1">
                    {c.contractedServices.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                        style={{ background: "#EFF6FF", color: "#2563EB" }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <StatusBadge variant={onboardingStageVariant(c.stage)} label={c.stage} size="sm" />
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                  {c.startDate}
                </td>
                <td className="py-2.5 px-3 text-xs max-w-[200px]" style={{ color: "var(--rtm-text-secondary)" }}>
                  <span className="line-clamp-2">{c.notes}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionWrapper>
  );
}

// ── Service Activation Center Section ─────────────────────────────────────────
function ServiceActivationCenterSection() {
  const [expandedClient, setExpandedClient] = useState<string | null>(null);

  return (
    <SectionWrapper
      title="Service Activation Center"
      description="Track which services are activated for each new client and surface recommended upsells"
    >
      <div className="space-y-4">
        {SERVICE_ACTIVATION_DATA.map((client) => {
          const isExpanded = expandedClient === client.id;
          return (
            <div
              key={client.id}
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: "var(--rtm-border-light)" }}
            >
              {/* Header row */}
              <div
                className="flex items-center justify-between gap-4 px-4 py-3 cursor-pointer"
                style={{ background: "var(--rtm-bg)" }}
                onClick={() => setExpandedClient(isExpanded ? null : client.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm" style={{ color: "var(--rtm-text-primary)" }}>
                    {client.client}
                  </span>
                  <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                    AM: {client.assignedAM}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge variant={servicePaymentVariant(client.paymentStatus)} label={client.paymentStatus} size="sm" />
                  <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                    {isExpanded ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t" style={{ borderColor: "var(--rtm-border-light)", background: "#F8FAFC" }}>
                  {/* Main table */}
                  <div className="overflow-x-auto mt-3">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                          {["Service", "Contracted", "Activate?", "Activation Status"].map((h) => (
                            <th
                              key={h}
                              className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                              style={{ color: "var(--rtm-text-muted)" }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ borderColor: "var(--rtm-border-light)" }}>
                        {client.contractedServices.map((service) => {
                          const status = client.activationStatus[service] ?? "Not Started";
                          const needsActivation = client.servicesToActivate.includes(service);
                          return (
                            <tr key={service} className="hover:bg-white/60 transition-colors">
                              <td className="py-2 px-3 font-medium text-xs" style={{ color: "var(--rtm-text-primary)" }}>{service}</td>
                              <td className="py-2 px-3">
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium" style={{ background: "#EFF6FF", color: "#2563EB" }}>
                                  ✓ Contracted
                                </span>
                              </td>
                              <td className="py-2 px-3">
                                {needsActivation ? (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium" style={{ background: "#FFFBEB", color: "#B45309" }}>
                                    Activate
                                  </span>
                                ) : (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium" style={{ background: "#ECFDF5", color: "#065F46" }}>
                                    Active
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-3">
                                <StatusBadge variant={activationStatusVariant(status)} label={status} size="sm" />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Recommended services */}
                  {client.recommendedServices.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>
                        💡 Recommended Service Activations
                      </p>
                      <div className="space-y-2">
                        {client.recommendedServices.map((rec) => (
                          <div
                            key={rec.service}
                            className="flex items-start justify-between gap-4 p-3 rounded-lg border"
                            style={{ background: "#F0F9FF", borderColor: "#BAE6FD" }}
                          >
                            <div>
                              <span className="text-xs font-semibold" style={{ color: "#075985" }}>{rec.service}</span>
                              <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-secondary)" }}>{rec.reason}</p>
                            </div>
                            {/* Launch Button mock */}
                            <button
                              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                              style={{ background: "var(--rtm-blue)", color: "#fff", borderColor: "var(--rtm-blue)" }}
                              onClick={(e) => { e.stopPropagation(); alert(`Mock: Launching ${rec.service} for ${client.client}`); }}
                            >
                              🚀 Launch
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}

// ── Department Launch Center Section ──────────────────────────────────────────
function DepartmentLaunchCenterSection() {
  const [filterClient, setFilterClient] = useState("All");
  const clients = ["All", ...Array.from(new Set(DEPT_LAUNCH_DATA.map((r) => r.client)))];
  const filtered = filterClient === "All" ? DEPT_LAUNCH_DATA : DEPT_LAUNCH_DATA.filter((r) => r.client === filterClient);

  return (
    <SectionWrapper
      title="Department Launch Center"
      description="Track per-department service launches for all new clients"
    >
      {/* Filter */}
      <div className="mb-4 flex items-center gap-3">
        <label className="text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>Filter by Client:</label>
        <select
          value={filterClient}
          onChange={(e) => setFilterClient(e.target.value)}
          className="text-sm border rounded-lg px-3 py-1.5 focus:outline-none"
          style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-primary)", background: "var(--rtm-bg)" }}
        >
          {clients.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
              {["Client", "Department", "Service", "Assigned Owner", "Due Date", "Launch Status", "Department Task Status"].map((h) => (
                <th
                  key={h}
                  className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                  style={{ color: "var(--rtm-text-muted)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "var(--rtm-border-light)" }}>
            {filtered.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-2.5 px-3 font-semibold whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-primary)" }}>
                  {row.client}
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                  {row.department}
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium" style={{ background: "#EFF6FF", color: "#2563EB" }}>
                    {row.service}
                  </span>
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                  {row.assignedOwner}
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                  {row.dueDate}
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <StatusBadge variant={launchStatusVariant(row.launchStatus)} label={row.launchStatus} size="sm" />
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <StatusBadge variant={deptTaskStatusVariant(row.deptTaskStatus)} label={row.deptTaskStatus} size="sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionWrapper>
  );
}

// ── Centralized Task Management Section ───────────────────────────────────────
function CentralizedTaskManagementSection() {
  const [tasks, setTasks] = useState<CentralTask[]>(CENTRAL_TASKS);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [filterDept, setFilterDept] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const depts = ["All", ...Array.from(new Set(CENTRAL_TASKS.map((t) => t.department)))];
  const statuses = ["All", ...ALL_CENTRAL_TASK_STATUSES];

  const filtered = tasks.filter((t) => {
    if (filterDept !== "All" && t.department !== filterDept) return false;
    if (filterStatus !== "All" && t.status !== filterStatus) return false;
    return true;
  });

  function updateStatus(id: string, newStatus: CentralTaskStatus) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: newStatus,
              activityHistory: [
                ...t.activityHistory,
                `Status changed to ${newStatus} — ${new Date().toLocaleDateString("en-CA")}`,
              ],
            }
          : t
      )
    );
  }

  function updateNotes(id: string, notes: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, notes } : t)));
  }

  return (
    <SectionWrapper
      title="Centralized Task Management"
      description="Shared task board across all workspaces — new client onboarding, recurring client work, and department tasks"
    >
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="text-sm border rounded-lg px-3 py-1.5 focus:outline-none"
          style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-primary)", background: "var(--rtm-bg)" }}
        >
          {depts.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-sm border rounded-lg px-3 py-1.5 focus:outline-none"
          style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-primary)", background: "var(--rtm-bg)" }}
        >
          {statuses.map((s) => <option key={s}>{s}</option>)}
        </select>
        <span className="text-xs self-center" style={{ color: "var(--rtm-text-muted)" }}>
          {filtered.length} task{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {filtered.map((task) => {
          const isExpanded = expandedTask === task.id;
          return (
            <div
              key={task.id}
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: "var(--rtm-border-light)" }}
            >
              {/* Summary row */}
              <div
                className="flex flex-wrap items-center gap-3 px-4 py-3 cursor-pointer"
                style={{ background: "var(--rtm-bg)" }}
                onClick={() => setExpandedTask(isExpanded ? null : task.id)}
              >
                {/* Status dropdown */}
                <select
                  value={task.status}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => { e.stopPropagation(); updateStatus(task.id, e.target.value as CentralTaskStatus); }}
                  className="text-xs border rounded-lg px-2 py-1 font-semibold focus:outline-none"
                  style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-primary)", background: "var(--rtm-bg)" }}
                >
                  {ALL_CENTRAL_TASK_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>

                <span className="font-semibold text-sm flex-1" style={{ color: "var(--rtm-text-primary)", minWidth: "160px" }}>
                  {task.task}
                </span>

                <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                  <span
                    className="px-1.5 py-0.5 rounded-md font-medium"
                    style={{ background: "#EFF6FF", color: "#2563EB" }}
                  >
                    {task.department}
                  </span>
                  <span>{task.client}</span>
                  <span>·</span>
                  <span>{task.assignedUser}</span>
                  <span>·</span>
                  <span>Due: {task.dueDate}</span>
                  <span className="ml-1" style={{ color: "var(--rtm-text-muted)" }}>{isExpanded ? "▲" : "▼"}</span>
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div
                  className="px-4 pb-4 pt-3 border-t space-y-4"
                  style={{ borderColor: "var(--rtm-border-light)", background: "#F8FAFC" }}
                >
                  {/* Task meta */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    {[
                      { label: "Client", value: task.client },
                      { label: "Department", value: task.department },
                      { label: "Service", value: task.service },
                      { label: "Assigned User", value: task.assignedUser },
                      { label: "Due Date", value: task.dueDate },
                    ].map((m) => (
                      <div key={m.label}>
                        <p className="font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--rtm-text-muted)", fontSize: "10px" }}>{m.label}</p>
                        <p style={{ color: "var(--rtm-text-primary)" }}>{m.value}</p>
                      </div>
                    ))}
                    <div>
                      <p className="font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--rtm-text-muted)", fontSize: "10px" }}>Status</p>
                      <StatusBadge variant={centralTaskStatusVariant(task.status)} label={task.status} size="sm" />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>Notes</p>
                    <textarea
                      value={task.notes}
                      onChange={(e) => updateNotes(task.id, e.target.value)}
                      rows={2}
                      className="w-full text-xs border rounded-lg px-3 py-2 resize-none focus:outline-none"
                      style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-primary)", background: "var(--rtm-bg)" }}
                    />
                  </div>

                  {/* Comments */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>Comments</p>
                    {task.comments.length === 0 ? (
                      <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>No comments yet.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {task.comments.map((c, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 text-xs p-2 rounded-lg"
                            style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)" }}
                          >
                            <span>💬</span>
                            <span style={{ color: "var(--rtm-text-secondary)" }}>{c}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Activity History */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-muted)" }}>Activity History</p>
                    <div className="space-y-1">
                      {task.activityHistory.map((entry, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#CBD5E1" }} />
                          {entry}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-center py-6" style={{ color: "var(--rtm-text-muted)" }}>No tasks match the current filters.</p>
        )}
      </div>

      {/* Workspace note */}
      <div className="mt-4 p-3 rounded-xl border" style={{ background: "#F0F9FF", borderColor: "#BAE6FD" }}>
        <p className="text-xs" style={{ color: "#075985" }}>
          <strong>ℹ️ Cross-workspace:</strong> These tasks are shared across all workspaces — Account Management, Department, Sales, and Reporting — ensuring every team has visibility into client onboarding and service delivery progress.
        </p>
      </div>
    </SectionWrapper>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// AM MANAGER VIEW
// ═════════════════════════════════════════════════════════════════════════════
function AMManagerView() {
  const kpis = getManagerKPIs();
  const [filterAM,     setFilterAM]     = useState("All");
  const [filterPayment,setFilterPayment]= useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const paymentOptions = ["All", "Current", "Overdue", "Payment Failed", "Renewal Upcoming"];
  const statusOptions  = ["All", "Healthy", "Needs Attention", "At Risk", "Critical", "Improving", "Declining"];

  const filtered = recurringClients.filter((c) => {
    if (filterAM      !== "All" && c.assignedAM       !== filterAM)      return false;
    if (filterPayment !== "All" && c.paymentStatus    !== filterPayment)  return false;
    if (filterStatus  !== "All" && c.performanceStatus!== filterStatus)   return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Active Recurring Clients"   value={String(kpis.activeRecurringClients)} iconBg="var(--rtm-blue-light)" iconColor="var(--rtm-blue)" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
        <KpiCard title="Clients At Risk"            value={String(kpis.clientsAtRisk)}          iconBg="#FEF2F2" iconColor="#DC2626" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
        <KpiCard title="Clients With Late Payments" value={String(kpis.clientsLatePayments)}    iconBg="#FFFBEB" iconColor="#D97706" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <KpiCard title="Deliverables Delayed"       value={String(kpis.deliverablesDelayed)}    iconBg="#FEF2F2" iconColor="#DC2626" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} />
        <KpiCard title="Reports Due"                value={String(kpis.reportsDue)}              iconBg="#FFFBEB" iconColor="#D97706" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
        <KpiCard title="Check-ins Due"              value={String(kpis.checkinsDue)}             iconBg="#EFF6FF" iconColor="#2563EB" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
        <KpiCard title="Performance Issues"         value={String(kpis.performanceIssues)}       iconBg="#FEF2F2" iconColor="#DC2626" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} />
        <KpiCard title="Renewal Opportunities"      value={String(kpis.renewalOpportunities)}    iconBg="#ECFDF5" iconColor="#059669" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>} />
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 p-4 rounded-xl border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
        <select value={filterAM}      onChange={(e) => setFilterAM(e.target.value)}      className="text-sm border rounded-lg px-3 py-1.5 focus:outline-none" style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-primary)", background: "var(--rtm-bg)" }}>
          <option value="All">All Account Managers</option>
          {accountManagers.map((am) => <option key={am}>{am}</option>)}
        </select>
        <select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)} className="text-sm border rounded-lg px-3 py-1.5 focus:outline-none" style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-primary)", background: "var(--rtm-bg)" }}>
          {paymentOptions.map((p) => <option key={p}>{p}</option>)}
        </select>
        <select value={filterStatus}  onChange={(e) => setFilterStatus(e.target.value)}  className="text-sm border rounded-lg px-3 py-1.5 focus:outline-none" style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-primary)", background: "var(--rtm-bg)" }}>
          {statusOptions.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* ── 1. New Client Onboarding ── */}
      <NewClientOnboardingSection />

      {/* ── 2. Service Activation Center ── */}
      <ServiceActivationCenterSection />

      {/* ── 3. Department Launch Center ── */}
      <DepartmentLaunchCenterSection />

      {/* ── 4. Centralized Task Management ── */}
      <CentralizedTaskManagementSection />

      {/* ── 5. Recurring Client Portfolio Table ── */}
      <SectionWrapper title="Recurring Client Portfolio" description="All active recurring clients with AM assignments, status, and health">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                {["Client", "Assigned AM", "Active Services", "Payment", "Deliverable Status", "Performance", "Client Health", "Last Check-in", "Next Check-in", "Renewal Date", "Risk", "AI Summary"].map((h) => (
                  <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--rtm-border-light)" }}>
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-2.5 px-3 font-semibold whitespace-nowrap" style={{ color: "var(--rtm-text-primary)" }}>{c.name}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{c.assignedAM}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex flex-wrap gap-1">
                      {c.activeServices.map((s) => (
                        <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-md font-medium" style={{ background: "#EFF6FF", color: "#2563EB" }}>{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <StatusBadge variant={paymentVariant(c.paymentStatus)} label={c.paymentStatus} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <StatusBadge variant={deliverableVariant(c.deliverableStatus)} label={c.deliverableStatus} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <StatusBadge variant={performanceVariant(c.performanceStatus)} label={c.performanceStatus} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <StatusBadge variant={healthVariant(c.clientHealth)} label={c.clientHealth} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-muted)" }}>{c.lastCheckin}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-muted)" }}>{c.nextCheckin}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-muted)" }}>{c.renewalDate}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <StatusBadge variant={riskVariant(c.riskStatus)} label={c.riskStatus} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 text-xs max-w-[200px]" style={{ color: "var(--rtm-text-secondary)" }}>
                    <span className="line-clamp-2">{c.aiSummary}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

      {/* ── 6. Per-client status summary ── */}
      <SectionWrapper title="Client Status Summary" description="Full status breakdown per client">
        <div className="space-y-3">
          {filtered.map((c) => (
            <div key={c.id} className="p-4 rounded-xl border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{c.name}</p>
                  <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{c.industry} · {c.location} · AM: {c.assignedAM}</p>
                </div>
                <StatusBadge variant={riskVariant(c.riskStatus)} label={`${c.riskStatus} Risk`} size="sm" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {[
                  { label: "Payment",      value: c.paymentStatus,     variant: paymentVariant(c.paymentStatus) },
                  { label: "Deliverable",  value: c.deliverableStatus, variant: deliverableVariant(c.deliverableStatus) },
                  { label: "Dept Tasks",   value: c.deptTaskStatus.filter((t) => t.status === "Delayed" || t.status === "Blocked").length > 0 ? "Issues" : "On Track", variant: c.deptTaskStatus.filter((t) => t.status === "Delayed" || t.status === "Blocked").length > 0 ? ("error" as const) : ("success" as const) },
                  { label: "Performance", value: c.performanceStatus, variant: performanceVariant(c.performanceStatus) },
                  { label: "Check-in",     value: `Next: ${c.nextCheckin}`, variant: "info" as const },
                  { label: "Client Risk",  value: c.riskStatus,        variant: riskVariant(c.riskStatus) },
                ].map((s) => (
                  <div key={s.label} className="p-2 rounded-lg border text-center" style={{ borderColor: "var(--rtm-border-light)" }}>
                    <p className="text-[10px] mb-1 font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{s.label}</p>
                    <StatusBadge variant={s.variant} label={s.value} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ACCOUNT MANAGER VIEW
// ═════════════════════════════════════════════════════════════════════════════
function AccountManagerView() {
  const [selectedAM, setSelectedAM] = useState(accountManagers[0]);
  const kpis = getAMKPIs(selectedAM);
  const myClients = recurringClients.filter((c) => c.assignedAM === selectedAM);

  const depts = ["SEO", "GBP", "Meta Ads", "Google Ads", "Content", "Web Development", "Reporting", "LSA"];

  return (
    <div className="space-y-6">
      {/* ── AM Selector ── */}
      <div className="flex items-center gap-3 p-4 rounded-xl border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
        <label className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>Viewing as:</label>
        <select value={selectedAM} onChange={(e) => setSelectedAM(e.target.value)} className="text-sm border rounded-lg px-3 py-1.5 focus:outline-none" style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-primary)", background: "var(--rtm-bg)" }}>
          {accountManagers.map((am) => <option key={am}>{am}</option>)}
        </select>
        <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>({myClients.length} clients)</span>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="My Recurring Clients"   value={String(kpis.myRecurringClients)}   iconBg="var(--rtm-blue-light)" iconColor="var(--rtm-blue)" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
        <KpiCard title="Late Payments"          value={String(kpis.latePayments)}          iconBg="#FEF2F2" iconColor="#DC2626" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <KpiCard title="Deliverables This Week" value={String(kpis.deliverablesThisWeek)}  iconBg="#FFFBEB" iconColor="#D97706" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} />
        <KpiCard title="Deliverables Delayed"   value={String(kpis.deliverablesDelayed)}   iconBg="#FEF2F2" iconColor="#DC2626" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <KpiCard title="Reports Due"            value={String(kpis.reportsDue)}             iconBg="#FFFBEB" iconColor="#D97706" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
        <KpiCard title="Check-ins Scheduled"   value={String(kpis.checkinsScheduled)}     iconBg="#EFF6FF" iconColor="#2563EB" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
        <KpiCard title="Clients At Risk"        value={String(kpis.clientsAtRisk)}         iconBg="#FEF2F2" iconColor="#DC2626" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
        <KpiCard title="Renewal Opportunities" value={String(kpis.renewalOpportunities)}  iconBg="#ECFDF5" iconColor="#059669" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>} />
      </div>

      {/* ── New Client Onboarding ── */}
      <NewClientOnboardingSection />

      {/* ── Service Activation Center ── */}
      <ServiceActivationCenterSection />

      {/* ── Department Launch Center ── */}
      <DepartmentLaunchCenterSection />

      {/* ── Centralized Task Management ── */}
      <CentralizedTaskManagementSection />

      {/* ── 1. My Client Portfolio ── */}
      <SectionWrapper title="1. My Client Portfolio" description={`${selectedAM}'s recurring client book`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                {["Client", "Active Services", "Payment", "Deliverable Status", "Dept Tasks", "Performance", "Last Check-in", "Next Check-in", "Health", "Risk"].map((h) => (
                  <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--rtm-border-light)" }}>
              {myClients.length === 0 ? (
                <tr><td colSpan={10} className="py-8 text-center text-sm" style={{ color: "var(--rtm-text-muted)" }}>No clients assigned to this AM.</td></tr>
              ) : myClients.map((c) => {
                const issueCount = c.deptTaskStatus.filter((t) => t.status === "Blocked" || t.status === "Delayed").length;
                return (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 px-3 font-semibold whitespace-nowrap" style={{ color: "var(--rtm-text-primary)" }}>{c.name}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {c.activeServices.map((s) => <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-md font-medium" style={{ background: "#EFF6FF", color: "#2563EB" }}>{s}</span>)}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap"><StatusBadge variant={paymentVariant(c.paymentStatus)}     label={c.paymentStatus}     size="sm" /></td>
                    <td className="py-2.5 px-3 whitespace-nowrap"><StatusBadge variant={deliverableVariant(c.deliverableStatus)} label={c.deliverableStatus} size="sm" /></td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <StatusBadge variant={issueCount > 0 ? "error" : "success"} label={issueCount > 0 ? `${issueCount} issues` : "On Track"} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap"><StatusBadge variant={performanceVariant(c.performanceStatus)} label={c.performanceStatus} size="sm" /></td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-muted)" }}>{c.lastCheckin}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-muted)" }}>{c.nextCheckin}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap"><StatusBadge variant={healthVariant(c.clientHealth)} label={c.clientHealth} size="sm" /></td>
                    <td className="py-2.5 px-3 whitespace-nowrap"><StatusBadge variant={riskVariant(c.riskStatus)} label={c.riskStatus} size="sm" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

      {/* ── 2. Payment Status ── */}
      <SectionWrapper title="2. Payment Status" description="Payment breakdown for your client book">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {(["Current", "Overdue", "Payment Failed", "Cancelled / Offboarding", "Renewal Upcoming"] as PaymentStatus[]).map((status) => {
            const count = myClients.filter((c) => c.paymentStatus === status).length;
            return (
              <div key={status} className="p-3 rounded-xl border text-center" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
                <p className="text-2xl font-bold" style={{ color: paymentVariant(status) === "success" ? "#059669" : paymentVariant(status) === "error" ? "#DC2626" : paymentVariant(status) === "warning" ? "#D97706" : "#2563EB" }}>{count}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{status}</p>
              </div>
            );
          })}
        </div>
      </SectionWrapper>

      {/* ── 3. Output / Deliverable Status ── */}
      <SectionWrapper title="3. Output / Deliverable Status" description="Department task status connected to deliverables">
        <div className="space-y-3">
          {myClients.map((c) => (
            <div key={c.id} className="p-4 rounded-xl border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
              <p className="font-semibold text-sm mb-3" style={{ color: "var(--rtm-text-primary)" }}>{c.name}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {c.deptTaskStatus.map((t) => (
                  <div key={t.dept} className="flex items-center justify-between p-2 rounded-lg border" style={{ borderColor: "var(--rtm-border-light)" }}>
                    <span className="text-xs font-medium" style={{ color: "var(--rtm-text-secondary)" }}>{t.dept}</span>
                    <StatusBadge variant={taskVariant(t.status)} label={t.status} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── 4. Overall Performance Status ── */}
      <SectionWrapper title="4. Overall Performance Status" description="Performance status across your client book">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          {(["Healthy", "Needs Attention", "At Risk", "Critical", "Improving", "Declining"] as PerformanceStatus[]).map((status) => {
            const count = myClients.filter((c) => c.performanceStatus === status).length;
            return (
              <div key={status} className="p-3 rounded-xl border text-center" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
                <p className="text-2xl font-bold" style={{ color: performanceVariant(status) === "success" ? "#059669" : performanceVariant(status) === "error" ? "#DC2626" : performanceVariant(status) === "warning" ? "#D97706" : "#2563EB" }}>{count}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{status}</p>
              </div>
            );
          })}
        </div>
      </SectionWrapper>

      {/* ── 5. AI Summary & Recommendations ── */}
      <SectionWrapper title="5. AI Summary & Recommendations" description="Mock AI-generated client insights and recommended actions">
        <div className="space-y-4">
          {myClients.map((c) => (
            <div key={c.id} className="p-4 rounded-xl border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{c.name}</p>
                  <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{c.industry}</p>
                </div>
                <div className="flex gap-2">
                  <StatusBadge variant={performanceVariant(c.performanceStatus)} label={c.performanceStatus} size="sm" />
                  <StatusBadge variant={riskVariant(c.riskStatus)} label={`${c.riskStatus} Risk`} size="sm" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2 rounded-lg" style={{ background: "#F8FAFC" }}>
                  <p className="font-semibold mb-1" style={{ color: "#374151" }}>🤖 AI Summary</p>
                  <p style={{ color: "var(--rtm-text-secondary)" }}>{c.aiSummary}</p>
                </div>
                <div className="p-2 rounded-lg" style={{ background: "#FEF9F0" }}>
                  <p className="font-semibold mb-1" style={{ color: "#92400E" }}>⚠️ Performance Risk</p>
                  <p style={{ color: "var(--rtm-text-secondary)" }}>{c.aiRisk}</p>
                </div>
                <div className="p-2 rounded-lg" style={{ background: "#F0FFF4" }}>
                  <p className="font-semibold mb-1" style={{ color: "#166534" }}>🔄 Renewal Risk</p>
                  <p style={{ color: "var(--rtm-text-secondary)" }}>{c.aiRenewalRisk}</p>
                </div>
                <div className="p-2 rounded-lg" style={{ background: "#F0F9FF" }}>
                  <p className="font-semibold mb-1" style={{ color: "#075985" }}>💡 Upsell Opportunity</p>
                  <p style={{ color: "var(--rtm-text-secondary)" }}>{c.aiUpsell}</p>
                </div>
                <div className="p-2 rounded-lg" style={{ background: "#EFF6FF" }}>
                  <p className="font-semibold mb-1" style={{ color: "#1D4ED8" }}>✅ Recommended AM Action</p>
                  <p style={{ color: "var(--rtm-text-secondary)" }}>{c.aiAMAction}</p>
                </div>
                <div className="p-2 rounded-lg" style={{ background: "#F5F3FF" }}>
                  <p className="font-semibold mb-1" style={{ color: "#5B21B6" }}>🏢 Dept Follow-up</p>
                  <p style={{ color: "var(--rtm-text-secondary)" }}>{c.aiDeptAction}</p>
                </div>
                <div className="p-2 rounded-lg sm:col-span-2" style={{ background: "#ECFDF5" }}>
                  <p className="font-semibold mb-1" style={{ color: "#065F46" }}>💬 Client Communication Suggestion</p>
                  <p style={{ color: "var(--rtm-text-secondary)" }}>{c.aiClientComm}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── 6. Weather / Seasonal Recommendations ── */}
      <SectionWrapper title="6. Weather / Seasonal Change Recommendations" description="Mock seasonal insights for your clients — no real weather API">
        <div className="space-y-3">
          {SEASONAL_INSIGHTS.filter((s) =>
            s.clients.some((client) => myClients.find((c) => c.name === client))
          ).map((insight, i) => (
            <div key={i} className="p-4 rounded-xl border" style={{ background: "#FFFBEB", borderColor: "#FCD34D50" }}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🌤️</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#B45309" }}>{insight.type}</span>
                    <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{insight.context}</span>
                  </div>
                  <p className="text-sm font-medium mb-1" style={{ color: "var(--rtm-text-primary)" }}>{insight.insight}</p>
                  <p className="text-xs mb-2" style={{ color: "var(--rtm-text-muted)" }}>
                    Clients: {insight.clients.join(", ")}
                  </p>
                  <p className="text-xs font-semibold" style={{ color: "#065F46" }}>
                    Recommended Action: {insight.action}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {SEASONAL_INSIGHTS.filter((s) =>
            s.clients.some((client) => myClients.find((c) => c.name === client))
          ).length === 0 && (
            <p className="text-sm text-center py-4" style={{ color: "var(--rtm-text-muted)" }}>No seasonal recommendations for current client selection.</p>
          )}
        </div>
      </SectionWrapper>

      {/* ── 7. Client Details ── */}
      <SectionWrapper title="7. Client Details" description="Full profile summary for each client">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {myClients.map((c) => (
            <div key={c.id} className="p-4 rounded-xl border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
              <p className="font-semibold mb-3" style={{ color: "var(--rtm-text-primary)" }}>{c.name}</p>
              <div className="space-y-1.5 text-xs">
                {[
                  { label: "Industry",       value: c.industry },
                  { label: "Location",       value: c.location },
                  { label: "Website",        value: c.website },
                  { label: "Active Services",value: c.activeServices.join(", ") },
                  { label: "Assigned AM",    value: c.assignedAM },
                  { label: "Billing Status", value: c.billingStatus },
                  { label: "Renewal Date",   value: c.renewalDate },
                  { label: "Last Contact",   value: c.lastContact },
                  { label: "Next Contact",   value: c.nextContact },
                ].map((row) => (
                  <div key={row.label} className="flex items-start gap-2">
                    <span className="font-semibold w-32 flex-shrink-0" style={{ color: "var(--rtm-text-secondary)" }}>{row.label}</span>
                    <span style={{ color: "var(--rtm-text-primary)" }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── 8. Check-in Schedules ── */}
      <SectionWrapper title="8. Check-in Schedules" description="Upcoming and overdue check-ins for your clients">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                {["Client", "Last Check-in", "Last Notes", "Next Check-in", "Meeting Type", "AM Owner"].map((h) => (
                  <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--rtm-border-light)" }}>
              {myClients.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-2.5 px-3 font-semibold whitespace-nowrap" style={{ color: "var(--rtm-text-primary)" }}>{c.name}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-muted)" }}>{c.lastCheckin}</td>
                  <td className="py-2.5 px-3 text-xs max-w-[200px]" style={{ color: "var(--rtm-text-secondary)" }}>
                    <span className="line-clamp-2">{c.checkinNotes}</span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-xs font-semibold" style={{ color: "var(--rtm-blue)" }}>{c.nextCheckin}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{c.checkinType}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{c.assignedAM}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

      {/* ── Recurring Client Portfolio ── */}
      <SectionWrapper title="Recurring Client Portfolio" description={`${selectedAM}'s full recurring client overview`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                {["Client", "Active Services", "Payment", "Deliverable Status", "Performance", "Client Health", "Last Check-in", "Renewal Date", "Risk"].map((h) => (
                  <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--rtm-border-light)" }}>
              {myClients.length === 0 ? (
                <tr><td colSpan={9} className="py-8 text-center text-sm" style={{ color: "var(--rtm-text-muted)" }}>No clients assigned to this AM.</td></tr>
              ) : myClients.map((c) => (
                <tr key={`portfolio-${c.id}`} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-2.5 px-3 font-semibold whitespace-nowrap" style={{ color: "var(--rtm-text-primary)" }}>{c.name}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex flex-wrap gap-1">
                      {c.activeServices.map((s) => <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-md font-medium" style={{ background: "#EFF6FF", color: "#2563EB" }}>{s}</span>)}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap"><StatusBadge variant={paymentVariant(c.paymentStatus)} label={c.paymentStatus} size="sm" /></td>
                  <td className="py-2.5 px-3 whitespace-nowrap"><StatusBadge variant={deliverableVariant(c.deliverableStatus)} label={c.deliverableStatus} size="sm" /></td>
                  <td className="py-2.5 px-3 whitespace-nowrap"><StatusBadge variant={performanceVariant(c.performanceStatus)} label={c.performanceStatus} size="sm" /></td>
                  <td className="py-2.5 px-3 whitespace-nowrap"><StatusBadge variant={healthVariant(c.clientHealth)} label={c.clientHealth} size="sm" /></td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-muted)" }}>{c.lastCheckin}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-muted)" }}>{c.renewalDate}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap"><StatusBadge variant={riskVariant(c.riskStatus)} label={c.riskStatus} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

      {/* ── Client Status Summary ── */}
      <SectionWrapper title="Client Status Summary" description={`Full status breakdown for ${selectedAM}'s clients`}>
        <div className="space-y-3">
          {myClients.map((c) => (
            <div key={`summary-${c.id}`} className="p-4 rounded-xl border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{c.name}</p>
                  <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{c.industry} · {c.location}</p>
                </div>
                <StatusBadge variant={riskVariant(c.riskStatus)} label={`${c.riskStatus} Risk`} size="sm" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {[
                  { label: "Payment",      value: c.paymentStatus,     variant: paymentVariant(c.paymentStatus) },
                  { label: "Deliverable",  value: c.deliverableStatus, variant: deliverableVariant(c.deliverableStatus) },
                  { label: "Dept Tasks",   value: c.deptTaskStatus.filter((t) => t.status === "Delayed" || t.status === "Blocked").length > 0 ? "Issues" : "On Track", variant: c.deptTaskStatus.filter((t) => t.status === "Delayed" || t.status === "Blocked").length > 0 ? ("error" as const) : ("success" as const) },
                  { label: "Performance", value: c.performanceStatus, variant: performanceVariant(c.performanceStatus) },
                  { label: "Check-in",     value: `Next: ${c.nextCheckin}`, variant: "info" as const },
                  { label: "Client Risk",  value: c.riskStatus,        variant: riskVariant(c.riskStatus) },
                ].map((s) => (
                  <div key={s.label} className="p-2 rounded-lg border text-center" style={{ borderColor: "var(--rtm-border-light)" }}>
                    <p className="text-[10px] mb-1 font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{s.label}</p>
                    <StatusBadge variant={s.variant} label={s.value} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Quick Actions ── */}
      <SectionWrapper title="Quick Actions" description="Common account management operations">
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.label}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all hover:shadow-sm"
              style={{ background: "var(--rtm-blue-light)", borderColor: "var(--rtm-blue-light)", color: "var(--rtm-blue)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#DBEAFE")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--rtm-blue-light)")}
            >
              <span>{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>
      </SectionWrapper>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN PAGE — View Toggle
// ═════════════════════════════════════════════════════════════════════════════
export default function AccountManagementDashboard() {
  const [activeView, setActiveView] = useState<"manager" | "am">("manager");

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--rtm-text-primary)" }}>Account Management</h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-muted)" }}>
          Client health, recurring portfolio management, deliverables, and check-in tracking.
        </p>
      </div>

      {/* ── View Toggle ── */}
      <div className="flex items-center gap-1 p-1 rounded-xl border w-fit" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
        <button
          onClick={() => setActiveView("manager")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={activeView === "manager"
            ? { background: "var(--rtm-blue)", color: "#fff", boxShadow: "0 1px 4px rgba(27,79,216,0.25)" }
            : { color: "var(--rtm-text-secondary)", background: "transparent" }
          }
        >
          👔 AM Manager View
        </button>
        <button
          onClick={() => setActiveView("am")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={activeView === "am"
            ? { background: "var(--rtm-blue)", color: "#fff", boxShadow: "0 1px 4px rgba(27,79,216,0.25)" }
            : { color: "var(--rtm-text-secondary)", background: "transparent" }
          }
        >
          👤 Account Manager View
        </button>
      </div>

      {/* ── View Label ── */}
      <div className="text-xs font-semibold uppercase tracking-widest px-1" style={{ color: "var(--rtm-text-muted)" }}>
        {activeView === "manager" ? "AM Manager View — Full Portfolio Overview" : "Account Manager View — My Client Book"}
      </div>

      {/* ── Active View ── */}
      {activeView === "manager" ? <AMManagerView /> : <AccountManagerView />}

      {/* ── Nav links ── */}
      <div className="flex flex-wrap gap-2 pt-2 border-t" style={{ borderColor: "var(--rtm-border-light)" }}>
        {[
          { label: "Tasks",        href: "/account-management/tasks",       icon: "✅" },
          { label: "Clients",      href: "/account-management/clients",     icon: "👥" },
          { label: "Check-ins",    href: "/account-management/checkins",    icon: "📞" },
          { label: "Performance",  href: "/account-management/performance", icon: "📈" },
          { label: "Reports",      href: "/account-management/reports",     icon: "📋" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-all"
            style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-secondary)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--rtm-blue)";
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--rtm-blue)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--rtm-border-light)";
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--rtm-text-secondary)";
            }}
          >
            <span>{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
