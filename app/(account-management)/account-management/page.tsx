"use client";

import Link from "next/link";
import { KpiCard, SectionWrapper, QuickActions, AlertBanner } from "@/components/ui";
import type { QuickAction, AlertItem } from "@/components/ui";
import { WorkspaceHeader } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";

import OnboardingQueue         from "@/components/account-management/OnboardingQueue";
import DepartmentLaunchStatus  from "@/components/account-management/DepartmentLaunchStatus";
import CrossDeptTaskTable      from "@/components/account-management/CrossDeptTaskTable";
import ServiceStatusTable      from "@/components/account-management/ServiceStatusTable";
import ClientHealthTable       from "@/components/account-management/ClientHealthTable";
import RenewalReportPanel      from "@/components/account-management/RenewalReportPanel";
import HealthDistributionPanel from "@/components/account-management/HealthDistributionPanel";
import AMActivityFeed          from "@/components/account-management/AMActivityFeed";

import {
  onboardingQueue,
  deptLaunchStatus,
  crossDeptTasks,
  serviceStatusRows,
  clientHealthRows,
  upcomingRenewals,
  healthDistribution,
  amActivityFeed,
} from "@/lib/am-data";

const workspace = getWorkspace("account-management")!;

// ─── Derived KPIs ─────────────────────────────────────────────────────────────
const totalClients    = clientHealthRows.length;
const atRiskCount     = clientHealthRows.filter((c) => c.healthStatus === "At-Risk" || c.healthStatus === "Critical").length;
const openDelivs      = clientHealthRows.reduce((s, c) => s + c.openDeliverables, 0);
const totalMrr        = clientHealthRows.reduce((s, c) => s + c.monthlyRevenue, 0);
const blockedLaunches = onboardingQueue.filter((i) => i.launchReadiness === "Blocked").length;
const readyToLaunch   = onboardingQueue.filter((i) => i.launchReadiness === "Ready to Launch").length;

// ─── Alerts ───────────────────────────────────────────────────────────────────
const alerts: AlertItem[] = [
  ...(atRiskCount > 0
    ? [{
        id: "a1",
        severity: "critical" as const,
        title: `${atRiskCount} clients at churn risk`,
        description: clientHealthRows
          .filter((c) => c.healthStatus === "Critical" || c.healthStatus === "At-Risk")
          .map((c) => c.name)
          .join(", ") + " — immediate outreach required.",
        action: "Review",
      }]
    : []),
  ...(blockedLaunches > 0
    ? [{
        id: "a2",
        severity: "warning" as const,
        title: `${blockedLaunches} onboarding launch${blockedLaunches > 1 ? "es" : ""} blocked`,
        description: onboardingQueue
          .filter((i) => i.launchReadiness === "Blocked")
          .map((i) => `${i.clientName} — ${i.blockedReason ?? "unresolved blocker"}`)
          .join("; "),
        action: "Resolve",
      }]
    : []),
  ...(readyToLaunch > 0
    ? [{
        id: "a3",
        severity: "info" as const,
        title: `${readyToLaunch} client${readyToLaunch > 1 ? "s" : ""} ready to launch`,
        description: onboardingQueue
          .filter((i) => i.launchReadiness === "Ready to Launch")
          .map((i) => i.clientName)
          .join(", ") + " — all steps complete, awaiting launch confirmation.",
        action: "Launch",
      }]
    : []),
];

// ─── Quick Actions ─────────────────────────────────────────────────────────────
const quickActions: QuickAction[] = [
  { label: "New Check-in",      description: "Log a client call",        icon: "📞", color: "bg-blue-50 text-blue-700"    },
  { label: "Onboard Client",    description: "Start onboarding flow",    icon: "➕", color: "bg-emerald-50 text-emerald-700" },
  { label: "Send Report",       description: "Generate & send report",   icon: "📊", color: "bg-violet-50 text-violet-700" },
  { label: "Log Escalation",    description: "Raise issue to director",  icon: "⚠️",  color: "bg-red-50 text-red-700"       },
  { label: "Renewal Proposal",  description: "Draft renewal offer",      icon: "📝", color: "bg-amber-50 text-amber-700"  },
  { label: "View All Tasks",    description: "Open task queue",          icon: "✅", color: "bg-slate-50 text-slate-700"  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AccountManagementDashboard() {
  return (
    <div className="space-y-6">

      {/* ── Workspace header ── */}
      <WorkspaceHeader
        workspace={workspace}
        subtitle="Client health, onboarding, retention and relationship management."
      />

      {/* ── Alerts ── */}
      {alerts.length > 0 && <AlertBanner alerts={alerts} />}

      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Active Clients"
          value={String(totalClients)}
          trend="up"
          trendValue="6%"
          iconBg="var(--rtm-blue-light)"
          iconColor="var(--rtm-blue)"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <KpiCard
          title="At-Risk / Critical"
          value={String(atRiskCount)}
          trend="down"
          trendValue="2"
          iconBg="#FEF2F2"
          iconColor="#DC2626"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
        <KpiCard
          title="Monthly Revenue"
          value={`$${(totalMrr / 1000).toFixed(1)}k`}
          trend="up"
          trendValue="8.4%"
          iconBg="#ECFDF5"
          iconColor="#059669"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KpiCard
          title="Open Deliverables"
          value={String(openDelivs)}
          trend="down"
          trendValue="4"
          iconBg="#FFFBEB"
          iconColor="#D97706"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
        />
      </div>

      {/* ── Onboarding & Launch Queue (includes Payment Confirmed / Awaiting / Ready / Blocked stats) ── */}
      <OnboardingQueue items={onboardingQueue} />

      {/* ── Department Launch Assignment Status ── */}
      <DepartmentLaunchStatus rows={deptLaunchStatus} />

      {/* ── Cross-Department Task Oversight ── */}
      <CrossDeptTaskTable tasks={crossDeptTasks} />

      {/* ── Service Status ── */}
      <ServiceStatusTable rows={serviceStatusRows} />

      {/* ── Client Portfolio + Health Distribution ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <ClientHealthTable rows={clientHealthRows} />
        </div>
        <div className="space-y-4">
          <HealthDistributionPanel segments={healthDistribution} />
        </div>
      </div>

      {/* ── Renewal Pipeline ── */}
      <RenewalReportPanel renewals={upcomingRenewals} />

      {/* ── Activity Feed + Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <AMActivityFeed items={amActivityFeed} maxItems={10} />
        </div>

        <div className="space-y-4">
          <SectionWrapper title="Quick Actions" description="Common AM operations">
            <QuickActions actions={quickActions} cols={2} />
          </SectionWrapper>

          {/* Nav links */}
          <SectionWrapper title="Workspace" description="Section shortcuts">
            <div className="space-y-1.5">
              {[
                { label: "Tasks",       href: "/account-management/tasks",       icon: "✅", desc: "Open task queue"   },
                { label: "Clients",     href: "/account-management/clients",     icon: "👥", desc: "Client directory"  },
                { label: "Check-ins",   href: "/account-management/checkins",    icon: "📞", desc: "Scheduled calls"   },
                { label: "Performance", href: "/account-management/performance", icon: "📈", desc: "Health metrics"    },
                { label: "Reports",     href: "/account-management/reports",     icon: "📋", desc: "Client reports"    },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-sm"
                  style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--rtm-blue)";
                    (e.currentTarget as HTMLAnchorElement).style.background = "var(--rtm-blue-xlight)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--rtm-border-light)";
                    (e.currentTarget as HTMLAnchorElement).style.background = "var(--rtm-bg)";
                  }}
                >
                  <span className="text-base">{link.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-xs" style={{ color: "var(--rtm-text-primary)" }}>{link.label}</p>
                    <p className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>{link.desc}</p>
                  </div>
                  <span className="text-xs" style={{ color: "var(--rtm-blue)" }}>→</span>
                </Link>
              ))}
            </div>
          </SectionWrapper>
        </div>
      </div>

    </div>
  );
}
