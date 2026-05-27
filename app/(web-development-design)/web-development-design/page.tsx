"use client";

import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { WorkspaceHeader, WorkspaceQuickLinks } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("web-development-design")!;

const projects = [
  { name: "Homepage Redesign — Summit Landscaping", dept: "Web Dev",  status: "info" as const, label: "In Progress", due: "Jun 10" },
  { name: "CRO Audit — Apex Roofing",               dept: "Web Dev",  status: "pending" as const, label: "Open",        due: "Jun 8"  },
  { name: "Logo Refresh — Apex Roofing",            dept: "Design",   status: "info" as const, label: "In Progress", due: "Jun 9"  },
  { name: "Social Templates — Pacific Dental",      dept: "Design",   status: "pending" as const, label: "Open",        due: "Jun 7"  },
  { name: "WordPress Migration — Blue Ridge",       dept: "Web Dev",  status: "warning" as const, label: "Blocked",     due: "Jun 6"  },
  { name: "Banner Ads — Google Ads",                dept: "Design",   status: "pending" as const, label: "Open",        due: "Jun 8"  },
];

const variantMap: Record<string, "info"|"pending"|"warning"|"success"> = {
  "in-progress": "info", open: "pending", blocked: "warning", done: "success",
};

const quickLinks = [
  { label: "Overview",          href: "/web-development-design",                       icon: "📊", description: "WD & Design overview",     accent: "#0891B2" },
  { label: "Web Dev Dashboard", href: "/web-development-design/web-development",       icon: "💻", description: "Web development projects",   accent: "#1B4FD8" },
  { label: "WD Tasks",          href: "/web-development-design/web-development/tasks", icon: "✅", description: "Web dev task queue",         accent: "#1B4FD8" },
  { label: "Design Dashboard",  href: "/web-development-design/design",                icon: "🎨", description: "Design projects",            accent: "#7C3AED" },
  { label: "Design Tasks",      href: "/web-development-design/design/tasks",          icon: "✅", description: "Design task queue",          accent: "#7C3AED" },
  { label: "Clients",           href: "/web-development-design/clients",               icon: "👥", description: "WD & Design clients",        accent: "#059669" },
  { label: "Performance",       href: "/web-development-design/performance",           icon: "📈", description: "Project metrics",            accent: "#D97706" },
];

export default function WebDevDesignDashboard() {
  return (
    <div className="space-y-6">
      <WorkspaceHeader workspace={workspace} subtitle="Website builds, redesigns, and creative design work." />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Active Projects"  value="14" trend="up"   trendValue="2"   iconBg="var(--rtm-blue-light)" iconColor="var(--rtm-blue)"  icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} />
        <KpiCard title="Web Dev Tasks"   value="11" trend="down" trendValue="3"   iconBg="#EFF6FF"              iconColor="#2563EB"          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>} />
        <KpiCard title="Design Tasks"    value="8"  trend="down" trendValue="2"   iconBg="#F5F3FF"              iconColor="#7C3AED"          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>} />
        <KpiCard title="Blocked"         value="2"  trend="up"   trendValue="1"   iconBg="#FEF2F2"              iconColor="#DC2626"          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
      </div>

      <WorkspaceQuickLinks links={quickLinks} title="Web Development & Design — Navigation" />

      <SectionWrapper title="Active Projects" description="Current web dev and design work">
        <div className="space-y-2">
          {projects.map((p) => (
            <div key={p.name} className="flex items-center justify-between p-3 rounded-lg border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{p.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{p.dept} · Due {p.due}</p>
              </div>
              <StatusBadge variant={variantMap[p.status] ?? "pending"} label={p.label} size="sm" />
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Link href="/web-development-design/web-development/tasks" className="rtm-btn-primary text-sm inline-flex items-center gap-1">WD Tasks →</Link>
          <Link href="/web-development-design/design/tasks"           className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Design Tasks →</Link>
        </div>
      </SectionWrapper>
    </div>
  );
}
