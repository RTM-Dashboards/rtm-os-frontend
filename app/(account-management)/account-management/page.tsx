"use client";

import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge, ActivityFeed } from "@/components/ui";
import type { ActivityItem } from "@/components/ui";
import { WorkspaceHeader, WorkspaceQuickLinks } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("account-management")!;

const activity: ActivityItem[] = [
  { id: "1", actor: "Jordan M.", action: "completed check-in call for",   target: "Apex Roofing",      timestamp: "1h ago",  type: "task",   avatarColor: "#1B4FD8" },
  { id: "2", actor: "Sarah K.",  action: "flagged at-risk client",         target: "Sunbelt HVAC",      timestamp: "2h ago",  type: "alert",  avatarColor: "#D97706" },
  { id: "3", actor: "Alex R.",   action: "sent renewal proposal for",      target: "Pacific Dental",    timestamp: "3h ago",  type: "report", avatarColor: "#059669" },
  { id: "4", actor: "Jordan M.", action: "onboarded new client",           target: "Blue Ridge Plumbing",timestamp: "4h ago", type: "client", avatarColor: "#1B4FD8" },
];

const clients = [
  { name: "Apex Roofing",        manager: "Jordan M.", status: "success" as const, label: "Healthy",   score: 92 },
  { name: "Sunbelt HVAC",        manager: "Sarah K.",  status: "error"   as const, label: "At Risk",   score: 54 },
  { name: "Pacific Dental",      manager: "Jordan M.", status: "success" as const, label: "Healthy",   score: 88 },
  { name: "Harbor Auto Group",   manager: "Mike T.",   status: "warning" as const, label: "Watch",     score: 71 },
  { name: "Blue Ridge Plumbing", manager: "Alex R.",   status: "info"    as const, label: "Onboarding",score: 65 },
  { name: "Metro Dental",        manager: "Sarah K.",  status: "success" as const, label: "Healthy",   score: 94 },
];

const quickLinks = [
  { label: "Tasks",        href: "/account-management/tasks",       icon: "✅", description: "Open task queue",       accent: "#1B4FD8" },
  { label: "Clients",      href: "/account-management/clients",     icon: "👥", description: "Client directory",       accent: "#059669" },
  { label: "Check-ins",    href: "/account-management/checkins",    icon: "📞", description: "Scheduled calls",        accent: "#7C3AED" },
  { label: "Performance",  href: "/account-management/performance", icon: "📈", description: "Health metrics",         accent: "#0891B2" },
  { label: "Reports",      href: "/account-management/reports",     icon: "📋", description: "Client reports",         accent: "#D97706" },
];

export default function AccountManagementDashboard() {
  return (
    <div className="space-y-6">
      <WorkspaceHeader workspace={workspace} subtitle="Client health, retention and relationship management." />

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Active Clients"   value="148" trend="up"   trendValue="6%"    iconBg="var(--rtm-blue-light)" iconColor="var(--rtm-blue)"  icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
        <KpiCard title="At-Risk Clients"  value="7"   trend="down" trendValue="2"     iconBg="#FEF2F2"              iconColor="#DC2626"          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
        <KpiCard title="Open Tasks"       value="31"  trend="down" trendValue="4"     iconBg="#FFFBEB"              iconColor="#D97706"          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>} />
        <KpiCard title="Avg. Client Score" value="8.7" trend="up"  trendValue="0.3"   iconBg="#F5F3FF"             iconColor="#7C3AED"          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>} />
      </div>

      {/* ── Quick Links ── */}
      <WorkspaceQuickLinks links={quickLinks} title="Account Management — Navigation" />

      {/* ── Client health + Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionWrapper title="Client Health Overview" description="Current status" className="lg:col-span-2">
          <div className="space-y-2">
            {clients.map((c) => (
              <div key={c.name} className="flex items-center justify-between p-3 rounded-lg border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{c.name}</p>
                  <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{c.manager}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold" style={{ color: "var(--rtm-text-secondary)" }}>{c.score}</span>
                  <StatusBadge variant={c.status} label={c.label} size="sm" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link href="/account-management/tasks" className="rtm-btn-primary inline-flex items-center gap-1.5 text-sm">
              View All Tasks →
            </Link>
          </div>
        </SectionWrapper>

        <SectionWrapper title="Recent Activity" description="Latest updates">
          <ActivityFeed items={activity} />
        </SectionWrapper>
      </div>
    </div>
  );
}
