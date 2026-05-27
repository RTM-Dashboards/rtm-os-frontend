"use client";

import Link from "next/link";
import { SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("web-development-design")!;

const clients = [
  { name: "Apex Roofing",       projects: 1, work: "Logo redesign",            status: "info" as const, label: "In Progress" },
  { name: "Pacific Dental",     projects: 2, work: "Social templates + landing", status: "open"       as const, label: "Open"        },
  { name: "Harbor Auto",        projects: 1, work: "Print ads",                 status: "success" as const, label: "Done"        },
  { name: "Summit Landscaping", projects: 1, work: "Homepage redesign",         status: "info" as const, label: "In Progress" },
  { name: "Metro Dental",       projects: 1, work: "Service page build",        status: "pending" as const, label: "Open"        },
  { name: "Blue Ridge",         projects: 1, work: "WordPress migration",       status: "warning" as const, label: "Blocked"     },
];

const variantMap: Record<string, "info" | "pending" | "warning" | "success"> = {
  "in-progress": "info", open: "pending", blocked: "warning", done: "success",
};

export default function WDClientsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>
          Web Development &amp; Design
        </p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Clients</h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>WD &amp; Design clients and active projects.</p>
      </div>

      <SectionWrapper title="Client Projects" description="Active web development and design engagements">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((c) => (
            <div
              key={c.name}
              className="p-4 rounded-xl border flex flex-col gap-2"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>{c.name}</p>
                <StatusBadge variant={variantMap[c.status] ?? "pending"} label={c.label} size="sm" />
              </div>
              <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                {c.projects} project{c.projects !== 1 ? "s" : ""} · {c.work}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex gap-2 flex-wrap">
          <Link href="/web-development-design/web-development/tasks" className="rtm-btn-primary text-sm inline-flex items-center gap-1">
            WD Tasks →
          </Link>
          <Link href="/web-development-design/design/tasks" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">
            Design Tasks →
          </Link>
          <Link href="/web-development-design" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">
            Overview →
          </Link>
        </div>
      </SectionWrapper>
    </div>
  );
}
