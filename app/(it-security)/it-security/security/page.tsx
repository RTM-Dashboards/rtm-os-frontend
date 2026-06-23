"use client";

import Link from "next/link";
import { SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("it-security")!;

const metrics = [
  { label: "Security Score",     value: "96/100", bg: "#ECFDF5", color: "#059669"},
  { label: "Vulnerabilities",    value: "2 open",  bg: "#FEF2F2", color: "#DC2626"},
  { label: "2FA Coverage",       value: "87%",     bg: "#EFF6FF", color: "#2563EB"},
  { label: "SSL Certificates",   value: "21/24",   bg: "#FFFBEB", color: "#D97706"},
];

const findings = [
  { title: "2 team accounts without 2FA enabled",            severity: "warning"as const, label: "Medium",  date: "Jun 5"},
  { title: "SSL certificate expiring — client site (Apex)",  severity: "warning"as const, label: "Medium",  date: "Jun 6"},
  { title: "Outdated WordPress plugin detected — 3 sites",   severity: "warning"as const, label: "Low",     date: "Jun 4"},
  { title: "Failed login attempts — agency admin account",   severity: "info"as const, label: "Info",    date: "Jun 3"},
];

export default function ItSecuritySecurityPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: workspace.accentColor }}>{workspace.name}</p>
        <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>Security</h1>
        <p className="text-sm mt-1"style={{ color: "var(--rtm-text-secondary)"}}>Security posture, findings and vulnerability management.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl border p-4"style={{ background: m.bg, borderColor: `${m.color}20` }}>
            <p className="text-xl font-bold"style={{ color: m.color }}>{m.value}</p>
            <p className="text-xs font-semibold mt-1"style={{ color: m.color }}>{m.label}</p>
          </div>
        ))}
      </div>

      <SectionWrapper title="Security Findings"description="Current open findings">
        <div className="space-y-2">
          {findings.map((f) => (
            <div key={f.title} className="flex items-center justify-between p-3 rounded-lg border"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)"}}>
              <div>
                <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{f.title}</p>
                <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>Detected: {f.date}</p>
              </div>
              <StatusBadge variant={f.severity} label={f.label} size="sm"/>
            </div>
          ))}
        </div>
      </SectionWrapper>

      <div className="flex gap-2">
        <Link href={workspace.dashboardRoute}         className="rtm-btn-secondary text-sm inline-flex items-center gap-1">← Dashboard</Link>
        <Link href="/it-security/systems"className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Systems →</Link>
        <Link href={workspace.tasksRoute}             className="rtm-btn-primary  text-sm inline-flex items-center gap-1">Tasks →</Link>
      </div>
    </div>
  );
}
