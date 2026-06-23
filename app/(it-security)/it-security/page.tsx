"use client";

import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { WorkspaceHeader, WorkspaceQuickLinks } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("it-security")!;

const systems = [
  { name: "Client CMS Platform",      type: "WordPress",    health: 98, status: "success"as const, label: "Healthy"},
  { name: "Agency Email Server",       type: "Google Workspace",health: 100,status: "success"as const, label: "Healthy"},
  { name: "VPN & Remote Access",       type: "Security",    health: 94, status: "success"as const, label: "Healthy"},
  { name: "Client Hosting — Apex",     type: "Web Hosting", health: 82, status: "warning"as const, label: "Watch"},
  { name: "Backup Systems",            type: "Storage",     health: 96, status: "success"as const, label: "Healthy"},
];

const quickLinks = [
  { label: "IT Dashboard", href: "/it-security",             icon: "", description: "IT overview",         accent: "#374151"},
  { label: "Tasks",        href: "/it-security/tasks",        icon: "", description: "IT task queue",       accent: "#1B4FD8"},
  { label: "Work Queue",   href: "/it-security/queue",        icon: "", description: "Active tickets",      accent: "#059669"},
  { label: "Systems",      href: "/it-security/systems",      icon: "", description: "System monitoring",   accent: "#0891B2"},
  { label: "Security",     href: "/it-security/security",     icon: "", description: "Security posture",    accent: "#DC2626"},
  { label: "Reports",      href: "/it-security/reports",      icon: "", description: "IT reports",          accent: "#7C3AED"},
];

export default function ItSecurityDashboard() {
  return (
    <div className="space-y-6">
      <WorkspaceHeader workspace={workspace} subtitle="Infrastructure, systems integrity, security and tooling."/>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Open Tickets"value="8"trend="down"trendValue="3"iconBg="#FFFBEB"iconColor="#D97706"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>} />
        <KpiCard title="Systems Monitored"value="24"trend="up"trendValue="2"iconBg="var(--rtm-blue-light)"iconColor="var(--rtm-blue)"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>} />
        <KpiCard title="Security Score"value="96"trend="up"trendValue="2"iconBg="#ECFDF5"iconColor="#059669"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>} />
        <KpiCard title="SSL Renewals Due"value="3"trend="up"trendValue="1"iconBg="#FEF2F2"iconColor="#DC2626"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>} />
      </div>

      <WorkspaceQuickLinks links={quickLinks} title="IT & Security Workspace — Navigation"/>

      <SectionWrapper title="System Health"description="Infrastructure status">
        <div className="space-y-2">
          {systems.map((s) => (
            <div key={s.name} className="flex items-center justify-between p-3 rounded-lg border"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)"}}>
              <div>
                <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{s.name}</p>
                <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{s.type} · Health: {s.health}%</p>
              </div>
              <StatusBadge variant={s.status} label={s.label} size="sm"/>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Link href="/it-security/tasks"className="rtm-btn-primary text-sm inline-flex items-center gap-1">Tasks →</Link>
          <Link href="/it-security/systems"className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Systems →</Link>
          <Link href="/it-security/security" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Security →</Link>
        </div>
      </SectionWrapper>
    </div>
  );
}
