"use client";

import { useState } from "react";
import {
  KpiCard,
  SectionWrapper,
  StatusBadge,
  DataTable,
  ActivityFeed,
  ProgressBar,
  DonutChart,
} from "@/components/ui";
import type { Column, ActivityItem } from "@/components/ui";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClientPortfolio extends Record<string, unknown> {
  client: string;
  assignedAm: string;
  activeServices: string;
  healthScore: number;
  campaignStatus: string;
  startDate: string;
  renewalDate: string;
}

interface CampaignRow extends Record<string, unknown> {
  client: string;
  service: string;
  campaignStatus: string;
  ownerDept: string;
  startDate: string;
  nextAction: string;
}

interface TaskRow extends Record<string, unknown> {
  task: string;
  client: string;
  department: string;
  owner: string;
  dueDate: string;
  status: string;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const clientPortfolio: ClientPortfolio[] = [
  {
    client: "Apex Roofing Co.",
    assignedAm: "Jordan M.",
    activeServices: "SEO, PPC, GBP",
    healthScore: 94,
    campaignStatus: "active",
    startDate: "Jan 2024",
    renewalDate: "Jan 2025",
  },
  {
    client: "Harbor Auto Group",
    assignedAm: "Mike T.",
    activeServices: "Meta Ads, SEO",
    healthScore: 78,
    campaignStatus: "needs-attention",
    startDate: "Mar 2023",
    renewalDate: "Mar 2025",
  },
  {
    client: "Pacific Dental",
    assignedAm: "Lisa P.",
    activeServices: "SEO, GBP, Email",
    healthScore: 97,
    campaignStatus: "active",
    startDate: "Sep 2022",
    renewalDate: "Sep 2025",
  },
  {
    client: "Sunbelt HVAC",
    assignedAm: "Sarah K.",
    activeServices: "PPC, Meta Ads",
    healthScore: 62,
    campaignStatus: "paused",
    startDate: "Jun 2023",
    renewalDate: "Jun 2025",
  },
  {
    client: "Summit Landscaping",
    assignedAm: "Jordan M.",
    activeServices: "SEO, GBP",
    healthScore: 88,
    campaignStatus: "active",
    startDate: "Nov 2023",
    renewalDate: "Nov 2025",
  },
  {
    client: "Blue Ridge Plumbing",
    assignedAm: "Alex R.",
    activeServices: "SEO",
    healthScore: 71,
    campaignStatus: "active",
    startDate: "May 2025",
    renewalDate: "May 2026",
  },
  {
    client: "Cascade Flooring",
    assignedAm: "Sarah K.",
    activeServices: "Meta Ads, SEO",
    healthScore: 55,
    campaignStatus: "needs-attention",
    startDate: "Feb 2024",
    renewalDate: "Feb 2025",
  },
  {
    client: "Lakeview Orthodontics",
    assignedAm: "Lisa P.",
    activeServices: "GBP, PPC",
    healthScore: 91,
    campaignStatus: "active",
    startDate: "Apr 2024",
    renewalDate: "Apr 2026",
  },
  {
    client: "Red Rock Construction",
    assignedAm: "Mike T.",
    activeServices: "SEO, Email",
    healthScore: 83,
    campaignStatus: "active",
    startDate: "Jan 2025",
    renewalDate: "Jan 2026",
  },
  {
    client: "Frontier Pest Control",
    assignedAm: "Alex R.",
    activeServices: "PPC, GBP",
    healthScore: 67,
    campaignStatus: "needs-attention",
    startDate: "Oct 2023",
    renewalDate: "Oct 2025",
  },
];

const campaigns: CampaignRow[] = [
  {
    client: "Apex Roofing Co.",
    service: "Google PPC",
    campaignStatus: "active",
    ownerDept: "Paid Media",
    startDate: "Jan 15, 2025",
    nextAction: "Review ad spend Jun 3",
  },
  {
    client: "Harbor Auto Group",
    service: "Meta Ads",
    campaignStatus: "needs-attention",
    ownerDept: "Social Media",
    startDate: "Mar 10, 2025",
    nextAction: "Escalation call Today",
  },
  {
    client: "Sunbelt HVAC",
    service: "Google PPC",
    campaignStatus: "paused",
    ownerDept: "Paid Media",
    startDate: "Jun 5, 2025",
    nextAction: "Resume approval Today",
  },
  {
    client: "Cascade Flooring",
    service: "Meta Ads",
    campaignStatus: "needs-attention",
    ownerDept: "Social Media",
    startDate: "Feb 20, 2025",
    nextAction: "Creative refresh Jun 4",
  },
  {
    client: "Pacific Dental",
    service: "SEO",
    campaignStatus: "active",
    ownerDept: "SEO",
    startDate: "Sep 1, 2024",
    nextAction: "Monthly report Jun 5",
  },
  {
    client: "Frontier Pest Control",
    service: "Google PPC",
    campaignStatus: "needs-attention",
    ownerDept: "Paid Media",
    startDate: "Oct 12, 2024",
    nextAction: "Budget review Jun 6",
  },
  {
    client: "Lakeview Orthodontics",
    service: "GBP Management",
    campaignStatus: "active",
    ownerDept: "Local SEO",
    startDate: "Apr 3, 2025",
    nextAction: "Post schedule Jun 7",
  },
];

const tasks: TaskRow[] = [
  {
    task: "Monthly report — Harbor Auto Group",
    client: "Harbor Auto Group",
    department: "Reporting",
    owner: "Mike T.",
    dueDate: "Jun 2, 2025",
    status: "overdue",
  },
  {
    task: "Campaign creative refresh",
    client: "Cascade Flooring",
    department: "Social Media",
    owner: "Sarah K.",
    dueDate: "Jun 4, 2025",
    status: "in-progress",
  },
  {
    task: "Onboarding kickoff deck",
    client: "Blue Ridge Plumbing",
    department: "Account Mgmt",
    owner: "Alex R.",
    dueDate: "Jun 5, 2025",
    status: "in-progress",
  },
  {
    task: "PPC budget review",
    client: "Sunbelt HVAC",
    department: "Paid Media",
    owner: "Jordan M.",
    dueDate: "Jun 5, 2025",
    status: "pending",
  },
  {
    task: "Q2 strategy doc update",
    client: "Apex Roofing Co.",
    department: "Account Mgmt",
    owner: "Jordan M.",
    dueDate: "Jun 6, 2025",
    status: "pending",
  },
  {
    task: "Monthly report — Pacific Dental",
    client: "Pacific Dental",
    department: "Reporting",
    owner: "Lisa P.",
    dueDate: "Jun 6, 2025",
    status: "in-progress",
  },
  {
    task: "At-risk escalation follow-up",
    client: "Frontier Pest Control",
    department: "Account Mgmt",
    owner: "Alex R.",
    dueDate: "Jun 6, 2025",
    status: "pending",
  },
  {
    task: "Client satisfaction survey",
    client: "Red Rock Construction",
    department: "Account Mgmt",
    owner: "Mike T.",
    dueDate: "Jun 9, 2025",
    status: "pending",
  },
  {
    task: "Renewal proposal deck",
    client: "Cascade Flooring",
    department: "Account Mgmt",
    owner: "Sarah K.",
    dueDate: "Jun 10, 2025",
    status: "blocked",
  },
  {
    task: "LSA review & response",
    client: "Lakeview Orthodontics",
    department: "Local SEO",
    owner: "Lisa P.",
    dueDate: "Jun 10, 2025",
    status: "pending",
  },
];

const activityFeed: ActivityItem[] = [
  {
    id: "1",
    actor: "Jordan M.",
    action: "completed monthly check-in for",
    target: "Apex Roofing Co.",
    timestamp: "45 min ago",
    type: "client",
    avatarColor: "var(--rtm-blue)",
  },
  {
    id: "2",
    actor: "Sarah K.",
    action: "flagged at-risk status for",
    target: "Cascade Flooring (health: 55)",
    timestamp: "1h ago",
    type: "alert",
    avatarColor: "var(--rtm-blue-mid)",
  },
  {
    id: "3",
    actor: "Lisa P.",
    action: "submitted monthly report for",
    target: "Pacific Dental",
    timestamp: "2h ago",
    type: "report",
    avatarColor: "#10b981",
  },
  {
    id: "4",
    actor: "Alex R.",
    action: "completed onboarding session 1 for",
    target: "Blue Ridge Plumbing",
    timestamp: "3h ago",
    type: "task",
    avatarColor: "#0ea5e9",
  },
  {
    id: "5",
    actor: "Mike T.",
    action: "updated campaign notes for",
    target: "Harbor Auto Group",
    timestamp: "5h ago",
    type: "campaign",
    avatarColor: "#8b5cf6",
  },
  {
    id: "6",
    actor: "Jordan M.",
    action: "moved client to renewal pipeline —",
    target: "Summit Landscaping (renews Nov 2025)",
    timestamp: "6h ago",
    type: "client",
    avatarColor: "var(--rtm-blue)",
  },
  {
    id: "7",
    actor: "Alex R.",
    action: "marked deliverable blocked —",
    target: "Renewal proposal for Cascade Flooring",
    timestamp: "Yesterday",
    type: "alert",
    avatarColor: "#0ea5e9",
  },
  {
    id: "8",
    actor: "Sarah K.",
    action: "logged pending response from",
    target: "Sunbelt HVAC (awaiting PPC approval)",
    timestamp: "Yesterday",
    type: "system",
    avatarColor: "var(--rtm-blue-mid)",
  },
];

// ─── Health distribution donut ──────────────────────────────────────────────

const healthSegments = [
  { label: "Healthy (85+)", value: 4, color: "#10b981" },
  { label: "Moderate (70–84)", value: 3, color: "var(--rtm-blue-mid)" },
  { label: "At Risk (<70)", value: 3, color: "#ef4444" },
];

// ─── Column definitions ───────────────────────────────────────────────────────

const portfolioColumns: Column<ClientPortfolio>[] = [
  { key: "client", header: "Client" },
  { key: "assignedAm", header: "Assigned AM", width: "120px" },
  { key: "activeServices", header: "Active Services" },
  {
    key: "healthScore",
    header: "Health Score",
    width: "160px",
    render: (value) => {
      const v = Number(value);
      const color =
        v >= 85 ? "bg-emerald-500" : v >= 70 ? "bg-amber-500" : "bg-red-500";
      return (
        <div className="flex items-center gap-2">
          <ProgressBar value={v} color={color} height={5} />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 w-7 flex-shrink-0">
            {v}
          </span>
        </div>
      );
    },
  },
  {
    key: "campaignStatus",
    header: "Campaign Status",
    width: "150px",
    render: (value) => {
      const v = String(value);
      const map: Record<
        string,
        {
          variant: "success" | "warning" | "error" | "info" | "neutral";
          label: string;
        }
      > = {
        active: { variant: "success", label: "Active" },
        "needs-attention": { variant: "error", label: "Needs Attention" },
        paused: { variant: "warning", label: "Paused" },
        onboarding: { variant: "info", label: "Onboarding" },
      };
      const c = map[v] ?? { variant: "neutral" as const, label: v };
      return <StatusBadge variant={c.variant} label={c.label} size="sm" />;
    },
  },
  { key: "startDate", header: "Start Date", width: "100px" },
  { key: "renewalDate", header: "Renewal Date", width: "110px" },
];

const campaignColumns: Column<CampaignRow>[] = [
  { key: "client", header: "Client" },
  { key: "service", header: "Service", width: "130px" },
  {
    key: "campaignStatus",
    header: "Campaign Status",
    width: "160px",
    render: (value) => {
      const v = String(value);
      const map: Record<
        string,
        {
          variant: "success" | "warning" | "error" | "info" | "neutral";
          label: string;
        }
      > = {
        active: { variant: "success", label: "Active" },
        "needs-attention": { variant: "error", label: "Needs Attention" },
        paused: { variant: "warning", label: "Paused" },
      };
      const c = map[v] ?? { variant: "neutral" as const, label: v };
      return <StatusBadge variant={c.variant} label={c.label} size="sm" />;
    },
  },
  { key: "ownerDept", header: "Owner Dept.", width: "120px" },
  { key: "startDate", header: "Start Date", width: "110px" },
  {
    key: "nextAction",
    header: "Next Action",
    render: (value) => (
      <span className="text-xs text-[var(--rtm-blue)] dark:text-[color:var(--rtm-blue)] font-medium">
        {String(value)}
      </span>
    ),
  },
];

const taskColumns: Column<TaskRow>[] = [
  { key: "task", header: "Task" },
  { key: "client", header: "Client", width: "160px" },
  { key: "department", header: "Department", width: "130px" },
  { key: "owner", header: "Owner", width: "100px" },
  {
    key: "dueDate",
    header: "Due Date",
    width: "110px",
    render: (value, row) => {
      const isOverdue = String(row.status) === "overdue";
      return (
        <span
          className={
            isOverdue
              ? "text-red-600 dark:text-red-400 font-semibold"
              : "text-slate-700 dark:text-slate-300"
          }
        >
          {String(value)}
        </span>
      );
    },
  },
  {
    key: "status",
    header: "Status",
    width: "120px",
    render: (value) => {
      const v = String(value);
      const map: Record<
        string,
        {
          variant:
            | "success"
            | "warning"
            | "error"
            | "info"
            | "neutral"
            | "pending";
          label: string;
        }
      > = {
        "in-progress": { variant: "info", label: "In Progress" },
        pending: { variant: "pending", label: "Pending" },
        overdue: { variant: "error", label: "Overdue" },
        blocked: { variant: "warning", label: "Blocked" },
        done: { variant: "success", label: "Done" },
      };
      const c = map[v] ?? { variant: "neutral" as const, label: v };
      return <StatusBadge variant={c.variant} label={c.label} size="sm" />;
    },
  },
];

// ─── Metric card helper ──────────────────────────────────────────────────────

interface MetricBlockProps {
  label: string;
  value: string | number;
  color?: string;
}
function MetricBlock({ label, value, color = "text-slate-900 dark:text-white" }: MetricBlockProps) {
  return (
    <div className="flex flex-col gap-1 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      <span className={`text-xl font-bold ${color}`}>{value}</span>
    </div>
  );
}

// ─── Tab control ─────────────────────────────────────────────────────────────

const TABS = [
  "Client Portfolio",
  "Campaigns",
  "Tasks / Deliverables",
  "Performance / Health",
  "Activity Feed",
] as const;
type Tab = (typeof TABS)[number];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AccountManagementPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Client Portfolio");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
            Departments
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Account Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Daily working dashboard — client health, campaigns, tasks &amp;
            renewals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors">
            Export
          </button>
          <button className="px-4 py-2 rounded-lg bg-[var(--rtm-blue)] hover:bg-[var(--rtm-blue-dark)] text-white text-sm font-semibold transition-colors">
            + Add Client
          </button>
        </div>
      </div>

      {/* KPI Cards — 4 cols on large, 2 on medium, 1 on mobile */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Row 1 */}
        <KpiCard
          title="Total Active Clients"
          value="148"
          trend="up"
          trendValue="+6 this month"
          accentColor="bg-[var(--rtm-blue-xlight)]"
          icon={
            <svg
              className="w-5 h-5 text-[var(--rtm-blue)] dark:text-[color:var(--rtm-blue)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          }
        />
        <KpiCard
          title="Clients At Risk"
          value="3"
          trend="down"
          trendValue="↓ from 5 last month"
          trendLabel=""
          accentColor="bg-red-100 dark:bg-red-900/30"
          icon={
            <svg
              className="w-5 h-5 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          }
        />
        <KpiCard
          title="Reports Due This Week"
          value="7"
          trend="neutral"
          trendValue="2 overdue"
          trendLabel="need action"
          accentColor="bg-amber-100 dark:bg-amber-900/30"
          icon={
            <svg
              className="w-5 h-5 text-amber-600 dark:text-amber-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
        />
        <KpiCard
          title="Open Tasks / Deliverables"
          value="24"
          trend="neutral"
          trendValue="3 blocked"
          trendLabel="need resolution"
          accentColor="bg-blue-100 dark:bg-blue-900/30"
          icon={
            <svg
              className="w-5 h-5 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          }
        />

        {/* Row 2 */}
        <KpiCard
          title="Campaigns Needing Attention"
          value="3"
          trend="down"
          trendValue="Harbor, Cascade, Frontier"
          trendLabel="action required"
          accentColor="bg-purple-100 dark:bg-purple-900/30"
          icon={
            <svg
              className="w-5 h-5 text-purple-600 dark:text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
              />
            </svg>
          }
        />
        <KpiCard
          title="Renewals This Month"
          value="5"
          trend="neutral"
          trendValue="2 proposals sent"
          trendLabel="3 pending"
          accentColor="bg-emerald-100 dark:bg-emerald-900/30"
          icon={
            <svg
              className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          }
        />
        <KpiCard
          title="New Clients Onboarding"
          value="4"
          trend="up"
          trendValue="+2 this week"
          accentColor="bg-sky-100 dark:bg-sky-900/30"
          icon={
            <svg
              className="w-5 h-5 text-sky-600 dark:text-sky-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          }
        />
        <KpiCard
          title="Pending Client Responses"
          value="6"
          trend="neutral"
          trendValue="2 overdue 3+ days"
          trendLabel="follow up needed"
          accentColor="bg-rose-100 dark:bg-rose-900/30"
          icon={
            <svg
              className="w-5 h-5 text-rose-600 dark:text-rose-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          }
        />
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}

      {activeTab === "Client Portfolio" && (
        <SectionWrapper
          title="Client Portfolio"
          description={`${clientPortfolio.length} clients shown`}
          noPadding
          actions={
            <button className="text-xs font-medium text-[var(--rtm-blue)] dark:text-[color:var(--rtm-blue)] hover:underline">
              View all 148
            </button>
          }
        >
          <DataTable columns={portfolioColumns} data={clientPortfolio} />
        </SectionWrapper>
      )}

      {activeTab === "Campaigns" && (
        <SectionWrapper
          title="Campaigns"
          description={`${campaigns.length} campaigns tracked`}
          noPadding
          actions={
            <button className="text-xs font-medium text-[var(--rtm-blue)] dark:text-[color:var(--rtm-blue)] hover:underline">
              View all campaigns
            </button>
          }
        >
          <DataTable columns={campaignColumns} data={campaigns} />
        </SectionWrapper>
      )}

      {activeTab === "Tasks / Deliverables" && (
        <SectionWrapper
          title="Tasks / Deliverables"
          description={`${tasks.length} open items`}
          noPadding
          actions={
            <button className="text-xs font-medium text-[var(--rtm-blue)] dark:text-[color:var(--rtm-blue)] hover:underline">
              + New Task
            </button>
          }
        >
          <DataTable columns={taskColumns} data={tasks} />
        </SectionWrapper>
      )}

      {activeTab === "Performance / Health" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Health distribution */}
          <SectionWrapper
            title="Client Health Distribution"
            description="Based on current health scores across all active clients"
          >
            <DonutChart
              segments={healthSegments}
              size={150}
              thickness={24}
              centerLabel="148"
              centerSub="clients"
            />
          </SectionWrapper>

          {/* Metrics column */}
          <SectionWrapper
            title="Health Metrics"
            description="Key performance indicators"
          >
            <MetricBlock label="At-Risk Clients" value={3} color="text-red-600 dark:text-red-400" />
            <MetricBlock label="Overdue Reports" value={2} color="text-amber-600 dark:text-amber-400" />
            <MetricBlock label="Blocked Deliverables" value={3} color="text-orange-600 dark:text-orange-400" />
            <MetricBlock label="Avg. Health Score" value="79 / 100" color="text-emerald-600 dark:text-emerald-400" />
          </SectionWrapper>

          {/* At-risk client list */}
          <SectionWrapper
            title="At-Risk Clients"
            description="Clients with health score below 70"
            className="lg:col-span-2"
          >
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {clientPortfolio
                .filter((c) => c.healthScore < 70)
                .map((c) => (
                  <div
                    key={c.client}
                    className="flex items-center justify-between py-3 gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {c.client}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        AM: {c.assignedAm} · Services: {c.activeServices}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="w-32">
                        <ProgressBar value={c.healthScore} color="bg-red-500" height={5} />
                      </div>
                      <span className="text-sm font-bold text-red-600 dark:text-red-400 w-8 text-right">
                        {c.healthScore}
                      </span>
                      <StatusBadge variant="error" label="At Risk" size="sm" />
                    </div>
                  </div>
                ))}
            </div>
          </SectionWrapper>

          {/* Overdue reports */}
          <SectionWrapper
            title="Overdue Reports"
            description="Reports past due date"
            className="lg:col-span-2"
          >
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {tasks
                .filter((t) => t.status === "overdue" || (t.department === "Reporting" && t.status !== "done"))
                .map((t) => (
                  <div
                    key={t.task}
                    className="flex items-center justify-between py-3 gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {t.task}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Owner: {t.owner} · Dept: {t.department}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span
                        className={`text-xs font-semibold ${
                          t.status === "overdue"
                            ? "text-red-600 dark:text-red-400"
                            : "text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        Due: {t.dueDate}
                      </span>
                      <StatusBadge
                        variant={t.status === "overdue" ? "error" : "warning"}
                        label={t.status === "overdue" ? "Overdue" : "Pending"}
                        size="sm"
                      />
                    </div>
                  </div>
                ))}
            </div>
          </SectionWrapper>
        </div>
      )}

      {activeTab === "Activity Feed" && (
        <SectionWrapper
          title="Activity Feed"
          description="Recent notes, completed deliverables, report updates & client status changes"
        >
          <ActivityFeed items={activityFeed} maxItems={activityFeed.length} />
        </SectionWrapper>
      )}
    </div>
  );
}
