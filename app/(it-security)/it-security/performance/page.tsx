"use client";

import Link from "next/link";
import { KpiCard, SectionWrapper } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import { useEnabledKpis } from "@/lib/hooks/useEnabledKpis";

const workspace = getWorkspace("it-security")!;

export default function ITSecurityPerformancePage() {
  const { isEnabled } = useEnabledKpis("it-security");

  return (
    <div className="space-y-6">
      <div>
        <p
          className="text-[11px] font-bold uppercase tracking-widest mb-1"
          style={{ color: workspace.accentColor }}
        >
          {workspace.name}
        </p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
          IT &amp; Security Performance
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          Infrastructure health, ticket resolution, and security posture metrics.
        </p>
      </div>

      {/* Row 1 — Tickets & Systems */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {isEnabled("it-open-tickets") && (
          <KpiCard
            title="Open Tickets"
            value="8"
            trend="down"
            trendValue="3"
            iconBg="#FFFBEB"
            iconColor="#D97706"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
        )}
        {isEnabled("it-systems-monitored") && (
          <KpiCard
            title="Systems Monitored"
            value="24"
            trend="up"
            trendValue="2"
            iconBg="var(--rtm-blue-light)"
            iconColor="var(--rtm-blue)"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
              </svg>
            }
          />
        )}
        {isEnabled("it-security-score") && (
          <KpiCard
            title="Security Score"
            value="96"
            trend="up"
            trendValue="2"
            iconBg="#ECFDF5"
            iconColor="#059669"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
          />
        )}
        {isEnabled("it-ssl-renewals-due") && (
          <KpiCard
            title="SSL Renewals Due"
            value="3"
            trend="up"
            trendValue="1"
            iconBg="#FEF2F2"
            iconColor="#DC2626"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
          />
        )}
      </div>

      {/* Row 2 — Uptime, Resolution, Incidents, Patch Compliance */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {isEnabled("it-uptime-rate") && (
          <KpiCard
            title="Uptime Rate"
            value="99.7%"
            trend="up"
            trendValue="0.2%"
            iconBg="#ECFDF5"
            iconColor="#059669"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
        )}
        {isEnabled("it-avg-resolution-time") && (
          <KpiCard
            title="Avg. Resolution Time"
            value="1.8h"
            trend="down"
            trendValue="0.4h"
            iconBg="#FFFBEB"
            iconColor="#D97706"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        )}
        {isEnabled("it-security-incidents") && (
          <KpiCard
            title="Security Incidents"
            value="2"
            trend="down"
            trendValue="1"
            iconBg="#FEF2F2"
            iconColor="#DC2626"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
          />
        )}
        {isEnabled("it-patch-compliance") && (
          <KpiCard
            title="Patch Compliance"
            value="94%"
            trend="up"
            trendValue="3%"
            iconBg="#F5F3FF"
            iconColor="#7C3AED"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            }
          />
        )}
      </div>

      <SectionWrapper title="Infrastructure Trends" description="Chart coming soon">
        <div
          className="rounded-xl border flex items-center justify-center h-48"
          style={{
            background: "var(--rtm-bg)",
            borderColor: "var(--rtm-border-light)",
            borderStyle: "dashed",
          }}
        >
          <div className="text-center">
            <span className="text-4xl">🔒</span>
            <p className="text-sm mt-2 font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>
              IT &amp; Security Performance Chart Placeholder
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--rtm-text-muted)" }}>
              Connect system monitoring data to display uptime and incident trends.
            </p>
          </div>
        </div>
      </SectionWrapper>

      <div className="flex gap-2 flex-wrap">
        <Link href={workspace.dashboardRoute} className="rtm-btn-secondary text-sm inline-flex items-center gap-1">
          ← Dashboard
        </Link>
        <Link href="/it-security/systems" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">
          Systems →
        </Link>
        <Link href="/it-security/security" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">
          Security →
        </Link>
        <Link href={workspace.tasksRoute} className="rtm-btn-primary text-sm inline-flex items-center gap-1">
          Tasks →
        </Link>
      </div>
    </div>
  );
}
