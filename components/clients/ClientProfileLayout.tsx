"use client";

import { useState } from "react";
import Link from "next/link";
import type { ClientProfile } from "@/lib/mock/clients";
import { HealthBadge, BillingBadge, CampaignBadge } from "@/components/clients/ClientStatusBadge";
import OverviewTab from "@/components/clients/tabs/OverviewTab";
import ServicesTab from "@/components/clients/tabs/ServicesTab";
import BillingTab from "@/components/clients/tabs/BillingTab";
import CampaignsTab from "@/components/clients/tabs/CampaignsTab";
import DeliverablesTab from "@/components/clients/tabs/DeliverablesTab";
import NotesTab from "@/components/clients/tabs/NotesTab";
import HistoryTab from "@/components/clients/tabs/HistoryTab";
import ClientNotificationAlerts from "@/components/clients/ClientNotificationAlerts";

type TabId = "overview"| "services"| "billing"| "campaigns"| "deliverables"| "tasks"| "notes"| "history";

interface Tab {
  id: TabId;
  label: string;
  count?: number;
}

// ── Client Tasks Tab ─────────────────────────────────────────────────────────

type MockTaskStatus = "Open"| "In Progress"| "Blocked"| "Overdue"| "Completed";

const TASK_STATUS_CFG: Record<MockTaskStatus, { bg: string; color: string; border: string }> = {
  "Open":        { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE"},
  "In Progress": { bg: "#FEF9C3", color: "#A16207", border: "#FDE68A"},
  "Blocked":     { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA"},
  "Overdue":     { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA"},
  "Completed":   { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0"},
};

function ClientTasksTab({ client }: { client: ClientProfile }) {
  const mockTasks = [
    { id: "t1", name: "SEO monthly report",         status: "In Progress"as MockTaskStatus, dept: "SEO",              due: "2025-08-01"},
    { id: "t2", name: "Review ad performance",       status: "Open"as MockTaskStatus,        dept: "PPC",              due: "2025-07-30"},
    { id: "t3", name: "Send quarterly review deck",  status: "Open"as MockTaskStatus,        dept: "Account Mgmt",     due: "2025-08-05"},
    { id: "t4", name: "Update GBP listing photos",   status: "Overdue"as MockTaskStatus,     dept: "GBP",              due: "2025-07-22"},
    { id: "t5", name: "Invoice follow-up",           status: "Blocked"as MockTaskStatus,     dept: "Billing",          due: "2025-07-28"},
    { id: "t6", name: "Content calendar — July",     status: "Completed"as MockTaskStatus,   dept: "Content",          due: "2025-07-15"},
  ];

  const counters = {
    open: mockTasks.filter(t => t.status === "Open"|| t.status === "In Progress").length,
    blocked: mockTasks.filter(t => t.status === "Blocked").length,
    overdue: mockTasks.filter(t => t.status === "Overdue").length,
    completed: mockTasks.filter(t => t.status === "Completed").length,
  };

  return (
    <div className="space-y-5">
      {/* Counter strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Open Tasks",  value: counters.open,      color: "#1D4ED8", bg: "#EFF6FF"},
          { label: "Blocked",     value: counters.blocked,   color: "#DC2626", bg: "#FEF2F2"},
          { label: "Overdue",     value: counters.overdue,   color: "#C2410C", bg: "#FFF7ED"},
          { label: "Completed",   value: counters.completed, color: "#059669", bg: "#ECFDF5"},
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="rounded-xl p-3 text-center"style={{ background: bg, border: `1px solid ${bg}` }}>
            <div className="text-2xl font-black"style={{ color }}>{value}</div>
            <div className="text-[11px] font-semibold mt-0.5"style={{ color }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Task list */}
      <div className="rounded-xl overflow-hidden"style={{ border: "1px solid var(--rtm-border)"}}>
        <div className="px-4 py-3 flex items-center justify-between"style={{ background: "var(--rtm-blue-xlight)", borderBottom: "1px solid #BFDBFE"}}>
          <span className="text-sm font-extrabold"style={{ color: "var(--rtm-text-primary)"}}>Client Tasks — {client.companyName}</span>
          <Link href="/tasks" className="text-xs font-semibold" style={{ color: "var(--rtm-blue)" }}>View All in Task Engine →</Link>
        </div>
        <div className="divide-y"style={{ background: "var(--rtm-surface)"}}>
          {mockTasks.map((task) => {
            const cfg = TASK_STATUS_CFG[task.status];
            return (
              <div key={task.id} className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{task.name}</div>
                  <div className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{task.dept} · Due {task.due}</div>
                </div>
                <span
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap"style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
                >
                  {task.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-wrap gap-2">
        <Link href="/tasks" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90" style={{ background: "var(--rtm-blue)" }}>
          Open Task Queue
        </Link>
        <Link href="/tasks" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}>
          Create Task
        </Link>
      </div>
    </div>
  );
}

export default function ClientProfileLayout({ client }: { client: ClientProfile }) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const openDeliverables = client.deliverables.filter((d) => d.status !== "completed").length;

  const tabs: Tab[] = [
    { id: "overview",     label: "Overview"},
    { id: "services",     label: "Services",     count: client.services.filter(s => s.status === "active").length },
    { id: "billing",      label: "Billing"},
    { id: "campaigns",    label: "Campaigns",    count: client.activeCampaigns.length },
    { id: "deliverables", label: "Deliverables", count: openDeliverables },
    { id: "tasks",        label: "Tasks",        count: 5 },
    { id: "notes",        label: "Notes"},
    { id: "history",      label: "History",      count: client.activity.length },
  ];

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs"style={{ color: "var(--rtm-text-muted)"}}>
        <Link
          href="/clients"className="transition-colors hover:underline"style={{ color: "var(--rtm-blue)"}}
        >
          Clients
        </Link>
        <span>/</span>
        <span className="font-medium"style={{ color: "var(--rtm-text-primary)"}}>{client.companyName}</span>
      </nav>

      {/* Profile header */}
      <div
        className="rounded-xl border p-5"style={{
          background: "var(--rtm-surface)",
          borderColor: "var(--rtm-border)",
          boxShadow: "0 1px 3px rgba(15,28,56,0.05)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          {/* Avatar */}
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"style={{ background: client.avatarColor, boxShadow: "0 2px 8px rgba(0,0,0,0.12)"}}
          >
            {client.companyName.charAt(0).toUpperCase()}
          </div>

          {/* Company info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-bold"style={{ color: "var(--rtm-text-primary)"}}>
                {client.companyName}
              </h1>
              <HealthBadge status={client.healthStatus} />
            </div>
            <div
              className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"style={{ color: "var(--rtm-text-muted)"}}
            >
              <a
                href={`https://${client.domain}`}
                target="_blank"rel="noopener noreferrer"className="hover:underline"style={{ color: "var(--rtm-blue)"}}
              >
                {client.domain}
              </a>
              <span>{client.industry}</span>
              <span>{client.location}</span>
            </div>
            <div
              className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs"style={{ color: "var(--rtm-text-muted)"}}
            >
              <span>
                AM:{""}
                <span className="font-medium"style={{ color: "var(--rtm-text-primary)"}}>
                  {client.assignedAM}
                </span>
              </span>
              <span>
                Sales:{""}
                <span className="font-medium"style={{ color: "var(--rtm-text-primary)"}}>
                  {client.salesRep}
                </span>
              </span>
              <span>
                Since:{""}
                <span className="font-medium"style={{ color: "var(--rtm-text-primary)"}}>
                  {new Date(client.clientSince).toLocaleDateString("en-US", { month: "short", year: "numeric"})}
                </span>
              </span>
            </div>
          </div>

          {/* Status badges + task quick actions */}
          <div className="flex flex-wrap sm:flex-col gap-2 sm:items-end flex-shrink-0">
            <BillingBadge status={client.billingStatus} />
            <CampaignBadge status={client.campaignStatus} />
            <div className="flex gap-2 flex-wrap sm:justify-end mt-1">
              <Link
                href="/tasks"className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90"style={{ background: "var(--rtm-blue)"}}
              >
                Open Tasks
              </Link>
              <Link
                href="/tasks"className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)"}}
              >
                + Create Task
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Client Notification Alerts */}
      <ClientNotificationAlerts clientSlug={client.slug} clientName={client.companyName} />

      {/* Tabs */}
      <div
        className="rounded-xl border overflow-hidden"style={{
          background: "var(--rtm-surface)",
          borderColor: "var(--rtm-border)",
          boxShadow: "0 1px 3px rgba(15,28,56,0.05)",
        }}
      >
        {/* Tab bar */}
        <div
          className="flex overflow-x-auto scrollbar-none"style={{ borderBottom: "1px solid var(--rtm-border-light)"}}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0"style={{
                color: activeTab === tab.id ? "var(--rtm-blue)": "var(--rtm-text-muted)",
                borderBottom: activeTab === tab.id
                  ? "2px solid var(--rtm-blue)": "2px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id)
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--rtm-text-secondary)";
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id)
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--rtm-text-muted)";
              }}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"style={
                    activeTab === tab.id
                      ? { background: "var(--rtm-blue-light)", color: "var(--rtm-blue)"}
                      : { background: "var(--rtm-bg)", color: "var(--rtm-text-muted)"}
                  }
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-5">
          {activeTab === "overview"&& <OverviewTab client={client} />}
          {activeTab === "services"&& <ServicesTab client={client} />}
          {activeTab === "billing"&& <BillingTab client={client} />}
          {activeTab === "campaigns"&& <CampaignsTab client={client} />}
          {activeTab === "deliverables"&& <DeliverablesTab client={client} />}
          {activeTab === "notes"&& <NotesTab client={client} />}
          {activeTab === "history"&& <HistoryTab client={client} />}
          {activeTab === "tasks"&& <ClientTasksTab client={client} />}
        </div>
      </div>
    </div>
  );
}
