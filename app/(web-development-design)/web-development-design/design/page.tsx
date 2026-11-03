"use client";

import Link from "next/link";
import { SectionWrapper } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("web-development-design")!;

export default function DesignDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>
          {workspace.name}
        </p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
          Design
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          Logo, branding, social assets, and visual design projects.
        </p>
      </div>

      <SectionWrapper title="Design Projects" description="No data connected yet">
        <div
          className="rounded-xl border px-4 py-10 text-center"
          style={{ borderColor: "var(--rtm-border-light)", borderStyle: "dashed", background: "var(--rtm-bg)" }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--rtm-text-secondary)" }}>
            Design project data not yet connected
          </p>
          <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
            Active design projects, assignees, and due dates will appear here
            once a project source is connected. Controls are ready.
          </p>
        </div>
        <div className="mt-4 flex gap-2">
          <Link href="/web-development-design/design/tasks" className="rtm-btn-primary text-sm inline-flex items-center gap-1">Design Tasks →</Link>
          <Link href="/web-development-design" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">← Dashboard</Link>
        </div>
      </SectionWrapper>
    </div>
  );
}
