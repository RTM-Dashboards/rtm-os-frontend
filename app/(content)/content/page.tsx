"use client";

import Link from "next/link";
import { SectionWrapper } from "@/components/ui";
import { WorkspaceHeader, WorkspaceQuickLinks } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("content")!;

const quickLinks = [
  { label: "Dashboard",    href: "/content",             icon: "", description: "Content overview",     accent: "#7C3AED"},
  { label: "Tasks",        href: "/content/tasks",        icon: "", description: "Open deliverables",    accent: "#1B4FD8"},
  { label: "Clients",      href: "/content/clients",      icon: "", description: "Content clients",      accent: "#0891B2"},
  { label: "Performance",  href: "/content/performance",  icon: "", description: "Output metrics",       accent: "#D97706"},
  { label: "Reports",      href: "/content/reports",      icon: "", description: "Client reports",       accent: "#059669"},
];

export default function ContentDashboard() {
  return (
    <div className="space-y-6">
      <WorkspaceHeader workspace={workspace} subtitle="Blog, social, copy, media and content delivery."/>

      <WorkspaceQuickLinks links={quickLinks} title="Content Workspace — Navigation"/>

      <SectionWrapper title="Content Overview" description="No data connected yet">
        <div
          className="rounded-xl border px-4 py-10 text-center"
          style={{ borderColor: "var(--rtm-border-light)", borderStyle: "dashed", background: "var(--rtm-bg)" }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--rtm-text-secondary)" }}>
            Content analytics not yet connected
          </p>
          <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
            KPIs, activity, and client stats will appear here once a content
            analytics integration is configured. Controls and navigation are ready.
          </p>
        </div>
        <div className="mt-4 flex gap-2">
          <Link href="/content/tasks" className="rtm-btn-primary text-sm inline-flex items-center gap-1">View Tasks →</Link>
          <Link href="/content/clients" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">View Clients →</Link>
        </div>
      </SectionWrapper>
    </div>
  );
}
