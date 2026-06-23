"use client";

import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("web-development-design")!;

const projects = [
  { name: "Logo Refresh — Apex Roofing",       status: "info"as const, label: "In Progress", due: "Jun 9",  assignee: "Lisa P."},
  { name: "Social Templates — Pacific Dental", status: "pending"as const, label: "Open",        due: "Jun 7",  assignee: "Jordan M."},
  { name: "Print Ad — Harbor Auto Group",      status: "success"as const, label: "Done",        due: "Jun 2",  assignee: "Lisa P."},
  { name: "Banner Ads — Google Ads",           status: "pending"as const, label: "Open",        due: "Jun 8",  assignee: "Sarah K."},
  { name: "Infographic — Summit Landscaping",  status: "pending"as const, label: "Open",        due: "Jun 11", assignee: "Lisa P."},
];

export default function DesignPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: workspace.accentColor }}>Web Dev & Design</p>
        <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>Design</h1>
        <p className="text-sm mt-1"style={{ color: "var(--rtm-text-secondary)"}}>Logos, social templates, ads and visual assets.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard title="Active Projects"value="5"trend="up"trendValue="1"iconBg="#F5F3FF"iconColor="#7C3AED"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>} />
        <KpiCard title="Open Tasks"value="8"trend="down"trendValue="1"iconBg="#FFFBEB"iconColor="#D97706"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>} />
        <KpiCard title="Completed (MTD)"value="3"trend="up"trendValue="1"iconBg="#ECFDF5"iconColor="#059669"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} />
        <KpiCard title="Revision Rounds"value="2.1"trend="down"trendValue="0.3"iconBg="var(--rtm-blue-light)"iconColor="var(--rtm-blue)"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>} />
      </div>

      <SectionWrapper title="Design Projects"description="Active creative work">
        <div className="space-y-2">
          {projects.map((p) => (
            <div key={p.name} className="flex items-center justify-between p-3 rounded-lg border"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)"}}>
              <div>
                <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{p.name}</p>
                <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{p.assignee} · Due {p.due}</p>
              </div>
              <StatusBadge variant={p.status} label={p.label} size="sm"/>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Link href="/web-development-design/design/tasks" className="rtm-btn-primary text-sm inline-flex items-center gap-1">Design Tasks →</Link>
          <Link href="/web-development-design"className="rtm-btn-secondary text-sm inline-flex items-center gap-1">← Overview</Link>
        </div>
      </SectionWrapper>
    </div>
  );
}
