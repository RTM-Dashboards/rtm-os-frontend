"use client";

import Link from "next/link";
import { SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("content")!;

const items = [
  { title: "May Blog — Apex Roofing",         type: "Blog Post",       assignee: "Alex R.",   due: "Jun 6",  status: "info" as const, label: "In Progress" },
  { title: "Social Calendar — Pacific Dental", type: "Social Media",    assignee: "Sarah K.",  due: "Jun 7",  status: "pending" as const, label: "Open"        },
  { title: "Email Newsletter — Metro Dental",  type: "Email",           assignee: "Jordan M.", due: "Jun 8",  status: "pending" as const, label: "Open"        },
  { title: "Landing Page Copy — Harbor Auto",  type: "Copywriting",     assignee: "Alex R.",   due: "Jun 9",  status: "pending" as const, label: "Open"        },
  { title: "Infographic — Summit Landscaping", type: "Visual Content",  assignee: "Lisa P.",   due: "Jun 11", status: "pending" as const, label: "Open"        },
  { title: "Case Study — Sunstate Solar",      type: "Long-form Copy",  assignee: "Jordan M.", due: "Jun 12", status: "pending" as const, label: "Open"        },
];

const variantMap: Record<string, "info"|"pending"|"warning"|"success"> = {
  "in-progress": "info", open: "pending",
};

export default function ContentQueuePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>{workspace.name}</p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Work Queue</h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>Content deliverables in the production pipeline.</p>
      </div>
      <SectionWrapper title="Content Queue" description={`${items.length} items`}>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.title} className="flex items-center justify-between p-3 rounded-lg border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{item.title}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{item.type} · {item.assignee} · Due {item.due}</p>
              </div>
              <StatusBadge variant={variantMap[item.status] ?? "pending"} label={item.label} size="sm" />
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
