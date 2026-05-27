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

type TabId = "overview" | "services" | "billing" | "campaigns" | "deliverables" | "notes" | "history";

interface Tab {
  id: TabId;
  label: string;
  count?: number;
}

export default function ClientProfileLayout({ client }: { client: ClientProfile }) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const openDeliverables = client.deliverables.filter((d) => d.status !== "completed").length;

  const tabs: Tab[] = [
    { id: "overview",     label: "Overview" },
    { id: "services",     label: "Services",     count: client.services.filter(s => s.status === "active").length },
    { id: "billing",      label: "Billing" },
    { id: "campaigns",    label: "Campaigns",    count: client.activeCampaigns.length },
    { id: "deliverables", label: "Deliverables", count: openDeliverables },
    { id: "notes",        label: "Notes" },
    { id: "history",      label: "History",      count: client.activity.length },
  ];

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs" style={{ color: "var(--rtm-text-muted)" }}>
        <Link
          href="/clients"
          className="transition-colors hover:underline"
          style={{ color: "var(--rtm-blue)" }}
        >
          Clients
        </Link>
        <span>/</span>
        <span className="font-medium" style={{ color: "var(--rtm-text-primary)" }}>{client.companyName}</span>
      </nav>

      {/* Profile header */}
      <div
        className="rounded-xl border p-5"
        style={{
          background: "var(--rtm-surface)",
          borderColor: "var(--rtm-border)",
          boxShadow: "0 1px 3px rgba(15,28,56,0.05)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          {/* Avatar */}
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
            style={{ background: client.avatarColor, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
          >
            {client.companyName.charAt(0).toUpperCase()}
          </div>

          {/* Company info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                {client.companyName}
              </h1>
              <HealthBadge status={client.healthStatus} />
            </div>
            <div
              className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              <a
                href={`https://${client.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: "var(--rtm-blue)" }}
              >
                {client.domain}
              </a>
              <span>{client.industry}</span>
              <span>{client.location}</span>
            </div>
            <div
              className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              <span>
                AM:{" "}
                <span className="font-medium" style={{ color: "var(--rtm-text-primary)" }}>
                  {client.assignedAM}
                </span>
              </span>
              <span>
                Sales:{" "}
                <span className="font-medium" style={{ color: "var(--rtm-text-primary)" }}>
                  {client.salesRep}
                </span>
              </span>
              <span>
                Since:{" "}
                <span className="font-medium" style={{ color: "var(--rtm-text-primary)" }}>
                  {new Date(client.clientSince).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
              </span>
            </div>
          </div>

          {/* Status badges */}
          <div className="flex flex-wrap sm:flex-col gap-2 sm:items-end flex-shrink-0">
            <BillingBadge status={client.billingStatus} />
            <CampaignBadge status={client.campaignStatus} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{
          background: "var(--rtm-surface)",
          borderColor: "var(--rtm-border)",
          boxShadow: "0 1px 3px rgba(15,28,56,0.05)",
        }}
      >
        {/* Tab bar */}
        <div
          className="flex overflow-x-auto scrollbar-none"
          style={{ borderBottom: "1px solid var(--rtm-border-light)" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0"
              style={{
                color: activeTab === tab.id ? "var(--rtm-blue)" : "var(--rtm-text-muted)",
                borderBottom: activeTab === tab.id
                  ? "2px solid var(--rtm-blue)"
                  : "2px solid transparent",
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
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={
                    activeTab === tab.id
                      ? { background: "var(--rtm-blue-light)", color: "var(--rtm-blue)" }
                      : { background: "var(--rtm-bg)", color: "var(--rtm-text-muted)" }
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
          {activeTab === "overview"     && <OverviewTab client={client} />}
          {activeTab === "services"     && <ServicesTab client={client} />}
          {activeTab === "billing"      && <BillingTab client={client} />}
          {activeTab === "campaigns"    && <CampaignsTab client={client} />}
          {activeTab === "deliverables" && <DeliverablesTab client={client} />}
          {activeTab === "notes"        && <NotesTab client={client} />}
          {activeTab === "history"      && <HistoryTab client={client} />}
        </div>
      </div>
    </div>
  );
}
