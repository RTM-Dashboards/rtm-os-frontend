"use client";

import React, { useState } from "react";
import { ACTIVATION_RECORDS, ACTIVATION_ANALYTICS, LAUNCH_RECORDS } from "@/lib/activation-data";
import ActivationQueue from "@/components/activation/ActivationQueue";
import HandoffCenter from "@/components/activation/HandoffCenter";
import LaunchCenter from "@/components/activation/LaunchCenter";
import ActivationAnalyticsPanel from "@/components/activation/ActivationAnalyticsPanel";
import KpiCard from "@/components/ui/KpiCard";

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconRocket({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
}

function IconQueue({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 10h16M4 14h8M4 18h8" />
    </svg>
  );
}

function IconHandshake({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconBarChart({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

// ── Tab definitions ───────────────────────────────────────────────────────────

type TabId = "queue" | "handoffs" | "launch-center" | "analytics";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: Tab[] = [
  { id: "queue",         label: "Activation Queue", icon: IconQueue     },
  { id: "handoffs",      label: "Handoffs",          icon: IconHandshake },
  { id: "launch-center", label: "Launch Center",     icon: IconRocket    },
  { id: "analytics",     label: "Activation Analytics", icon: IconBarChart },
];

// ── KPI helpers ───────────────────────────────────────────────────────────────

function formatCurrency(n: number) {
  return "$" + n.toLocaleString("en-US");
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ActivationPage() {
  const [activeTab, setActiveTab] = useState<TabId>("queue");

  const pendingPayment   = ACTIVATION_RECORDS.filter((r) => r.activationStatus === "Pending Payment").length;
  const pendingContract  = ACTIVATION_RECORDS.filter((r) => r.activationStatus === "Pending Contract").length;
  const readyForLaunch   = ACTIVATION_RECORDS.filter((r) => r.activationStatus === "Ready For Launch").length;
  const launching        = ACTIVATION_RECORDS.filter((r) => r.activationStatus === "Launching").length;
  const blocked          = LAUNCH_RECORDS.filter((r) => r.launchStatus === "Blocked").length;

  const revenueWaiting = ACTIVATION_ANALYTICS.revenueWaitingForLaunch;

  return (
    <div className="space-y-6">
      {/* ── Page Header ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-1"
            style={{ color: "var(--rtm-blue)" }}
          >
            Operations
          </p>
          <h1 className="text-2xl font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            Activation &amp; Handoff Center
          </h1>
          <p className="mt-1 text-sm max-w-xl" style={{ color: "var(--rtm-text-secondary)" }}>
            Manage the complete client activation pipeline from contract close through department launch.
            Connect Sales, Billing, Account Management, Projects, and Departments in one unified engine.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            className="text-sm font-semibold px-4 py-2 rounded-lg border transition-colors"
            style={{
              background: "var(--rtm-surface)",
              color: "var(--rtm-text-secondary)",
              borderColor: "var(--rtm-border)",
            }}
          >
            Export Report
          </button>
          <button
            className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors text-white"
            style={{ background: "var(--rtm-blue)" }}
          >
            New Activation
          </button>
        </div>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          title="Total Activations"
          value={String(ACTIVATION_RECORDS.length)}
          subtitle="All records"
          iconBg="var(--rtm-blue-xlight)"
          iconColor="var(--rtm-blue)"
          icon={<IconRocket className="w-5 h-5" />}
        />
        <KpiCard
          title="Ready For Launch"
          value={String(readyForLaunch)}
          subtitle="Checklist complete"
          iconBg="#F0FDF4"
          iconColor="#059669"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 13l4 4L19 7" />
            </svg>
          }
        />
        <KpiCard
          title="Currently Launching"
          value={String(launching)}
          subtitle="In active launch"
          iconBg="#EEF2FF"
          iconColor="#4F46E5"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
        <KpiCard
          title="Pending Payment"
          value={String(pendingPayment)}
          subtitle="Awaiting confirmation"
          iconBg="#FEF2F2"
          iconColor="#DC2626"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KpiCard
          title="Pending Contract"
          value={String(pendingContract)}
          subtitle="Contract not signed"
          iconBg="#FFFBEB"
          iconColor="#D97706"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <KpiCard
          title="Revenue Waiting"
          value={formatCurrency(revenueWaiting)}
          subtitle="Not yet launched"
          iconBg="#F5F3FF"
          iconColor="#7C3AED"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
      </div>

      {/* ── Blocked alert strip ────────────────────────────────────── */}
      {blocked > 0 && (
        <div
          className="rounded-xl px-4 py-3 flex items-center gap-3"
          style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "#EF4444" }}
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: "#991B1B" }}>
              {blocked} Launch{blocked !== 1 ? "es" : ""} Blocked
            </p>
            <p className="text-xs" style={{ color: "#B91C1C" }}>
              Payment or contract issues are preventing activation. Review the Launch Center and Activation Queue immediately.
            </p>
          </div>
        </div>
      )}

      {/* ── Tab Navigation ────────────────────────────────────────── */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", boxShadow: "0 1px 3px rgba(15,28,56,0.05)" }}
      >
        {/* Tab bar */}
        <div
          className="flex overflow-x-auto"
          style={{ borderBottom: "1px solid var(--rtm-border)" }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition-all relative flex-shrink-0"
                style={{
                  color: isActive ? "var(--rtm-blue)" : "var(--rtm-text-secondary)",
                  background: isActive ? "var(--rtm-blue-xlight)" : "transparent",
                  borderBottom: isActive ? "2px solid var(--rtm-blue)" : "2px solid transparent",
                }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="p-5">
          {activeTab === "queue"         && <ActivationQueue />}
          {activeTab === "handoffs"      && <HandoffCenter />}
          {activeTab === "launch-center" && <LaunchCenter />}
          {activeTab === "analytics"     && <ActivationAnalyticsPanel />}
        </div>
      </div>
    </div>
  );
}
