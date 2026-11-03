"use client";

import Link from "next/link";
import { SectionWrapper } from "@/components/ui";
import { WorkspaceHeader, WorkspaceQuickLinks } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("local-service-ads")!;

const quickLinks = [
  { label: "LSA Dashboard", href: "/local-service-ads",             icon: "", description: "LSA overview",          accent: "#B45309"},
  { label: "Tasks",         href: "/local-service-ads/tasks",        icon: "", description: "LSA task queue",        accent: "#1B4FD8"},
  { label: "Clients",       href: "/local-service-ads/clients",      icon: "", description: "LSA clients",           accent: "#7C3AED"},
  { label: "Performance",   href: "/local-service-ads/performance",  icon: "", description: "Lead & budget metrics", accent: "#D97706"},
  { label: "Reports",       href: "/local-service-ads/reports",      icon: "", description: "LSA reports",           accent: "#0891B2"},
];

export default function LocalServiceAdsDashboard() {
  return (
    <div className="space-y-6">
      <WorkspaceHeader workspace={workspace} subtitle="Google LSA setup, reviews and budget management."/>

      <WorkspaceQuickLinks links={quickLinks} title="Local Service Ads Workspace — Navigation"/>

      <SectionWrapper title="LSA Accounts" description="No data connected yet">
        <div
          className="rounded-xl border px-4 py-10 text-center"
          style={{ borderColor: "var(--rtm-border-light)", borderStyle: "dashed", background: "var(--rtm-bg)" }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--rtm-text-secondary)" }}>
            LSA account data not yet connected
          </p>
          <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
            Account summaries, KPIs, and ratings will appear here once the
            Google Local Service Ads API is integrated. Controls are ready.
          </p>
        </div>
        <div className="mt-4 flex gap-2">
          <Link href="/local-service-ads/tasks" className="rtm-btn-primary text-sm inline-flex items-center gap-1">Tasks →</Link>
          <Link href="/local-service-ads/performance" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Performance →</Link>
        </div>
      </SectionWrapper>
    </div>
  );
}
