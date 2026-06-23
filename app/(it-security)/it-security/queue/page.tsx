"use client";

import Link from "next/link";
import { SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("it-security")!;

const items = [
  { title: "SSL renewal — Client sites",       assignee: "Mike T.",   due: "Jun 6",  status: "warning"as const, label: "Urgent"},
  { title: "Malware scan — Apex Roofing",      assignee: "Jordan M.", due: "Jun 5",  status: "info"as const, label: "In Progress"},
  { title: "Firewall audit",                   assignee: "Mike T.",   due: "Jun 8",  status: "pending"as const, label: "Queued"},
  { title: "2FA rollout — Team accounts",      assignee: "Mike T.",   due: "Jun 9",  status: "pending"as const, label: "Queued"},
  { title: "Backup verification",              assignee: "Sarah K.",  due: "Jun 10", status: "pending"as const, label: "Queued"},
];

export default function ItQueuePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: workspace.accentColor }}>{workspace.name}</p>
        <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>IT Work Queue</h1>
        <p className="text-sm mt-1"style={{ color: "var(--rtm-text-secondary)"}}>Active IT and security work items.</p>
      </div>
      <SectionWrapper title="IT Queue"description={`${items.length} items`}>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.title} className="flex items-center justify-between p-3 rounded-lg border"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)"}}>
              <div>
                <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{item.title}</p>
                <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{item.assignee} · Due {item.due}</p>
              </div>
              <StatusBadge variant={item.status} label={item.label} size="sm"/>
            </div>
          ))}
        </div>
      </SectionWrapper>
      <div className="flex gap-2">
        <Link href={workspace.dashboardRoute} className="rtm-btn-secondary text-sm inline-flex items-center gap-1">← Dashboard</Link>
        <Link href={workspace.tasksRoute}     className="rtm-btn-primary  text-sm inline-flex items-center gap-1">Tasks →</Link>
      </div>
    </div>
  );
}
