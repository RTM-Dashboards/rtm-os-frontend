"use client";

import Link from "next/link";
import { SectionWrapper } from "@/components/ui";
import { WorkspaceHeader, WorkspaceQuickLinks } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("web-development-design")!;

const quickLinks = [
  { label: "Dashboard",       href: "/web-development-design",                        icon: "", description: "WD&D overview",          accent: "#0F766E"},
  { label: "Web Development", href: "/web-development-design/web-development",         icon: "", description: "Dev projects",           accent: "#1B4FD8"},
  { label: "Design",          href: "/web-development-design/design",                  icon: "", description: "Design projects",        accent: "#7C3AED"},
  { label: "Clients",         href: "/web-development-design/clients",                 icon: "", description: "WD&D clients",           accent: "#D97706"},
  { label: "Reports",         href: "/web-development-design/reports",                 icon: "", description: "WD&D reports",           accent: "#059669"},
];

export default function WebDevDashboard() {
  return (
    <div className="space-y-6">
      <WorkspaceHeader workspace={workspace} subtitle="Website development, design, and CRO project management."/>

      <WorkspaceQuickLinks links={quickLinks} title="Web Dev & Design Workspace — Navigation"/>

      <SectionWrapper title="Active Projects" description="No data connected yet">
        <div
          className="rounded-xl border px-4 py-10 text-center"
          style={{ borderColor: "var(--rtm-border-light)", borderStyle: "dashed", background: "var(--rtm-bg)" }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--rtm-text-secondary)" }}>
            Project data not yet connected
          </p>
          <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
            Active development and design projects will appear here once a
            project source is connected. Controls are ready.
          </p>
        </div>
        <div className="mt-4 flex gap-2">
          <Link href="/web-development-design/web-development/tasks" className="rtm-btn-primary text-sm inline-flex items-center gap-1">Dev Tasks →</Link>
          <Link href="/web-development-design/design/tasks" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Design Tasks →</Link>
        </div>
      </SectionWrapper>
    </div>
  );
}
