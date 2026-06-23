"use client";

import { SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import Link from "next/link";

const workspace = getWorkspace("web-development-design")!;

const queue = [
  { title: "Homepage Redesign",      client: "Summit Landscaping",  assignee: "Mike T.",   status: "info"as const, label: "In Progress", due: "Jun 10"},
  { title: "CRO Fixes",              client: "Apex Roofing",        assignee: "Jordan M.", status: "pending"as const, label: "Open",         due: "Jun 8"},
  { title: "Site Speed Audit",       client: "Pacific Dental",      assignee: "Alex R.",   status: "pending"as const, label: "Open",         due: "Jun 9"},
  { title: "New Service Page",       client: "Metro Dental",        assignee: "Sarah K.",  status: "info"as const, label: "In Progress", due: "Jun 8"},
  { title: "WordPress Migration",    client: "Blue Ridge Plumbing", assignee: "Alex R.",   status: "warning"as const, label: "Blocked",      due: "Jun 6"},
];

const variantMap: Record<string, "info"| "pending"| "warning"| "success"> = {
  "in-progress": "info", open: "pending", blocked: "warning", done: "success",
};

export default function WebDevQueuePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: workspace.accentColor }}>
          Web Development
        </p>
        <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>Web Development Queue</h1>
        <p className="text-sm mt-1"style={{ color: "var(--rtm-text-secondary)"}}>Active web development items sorted by due date.</p>
      </div>

      <SectionWrapper title="Queue"description="All web dev items in progress or pending">
        <div className="space-y-2">
          {queue.map((item) => (
            <div
              key={item.title}
              className="flex items-center justify-between p-3 rounded-lg border"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)"}}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{item.title}</p>
                <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>
                  {item.client} · {item.assignee} · Due {item.due}
                </p>
              </div>
              <StatusBadge variant={variantMap[item.status] ?? "pending"} label={item.label} size="sm"/>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Link href="/web-development-design/web-development/tasks" className="rtm-btn-primary text-sm inline-flex items-center gap-1">
            WD Tasks →
          </Link>
          <Link href="/web-development-design" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">
            Overview →
          </Link>
        </div>
      </SectionWrapper>
    </div>
  );
}
