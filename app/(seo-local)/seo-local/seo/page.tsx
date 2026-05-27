"use client";

import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("seo-local")!;

const clients = [
  { name: "Apex Roofing",        rank: "#3",  keywords: 48, score: 92, status: "success" as const, label: "Strong"    },
  { name: "Pacific Dental",      rank: "#5",  keywords: 62, score: 88, status: "success" as const, label: "Good"      },
  { name: "Harbor Auto Group",   rank: "#11", keywords: 35, score: 71, status: "warning" as const, label: "Watch"     },
  { name: "Summit Landscaping",  rank: "#7",  keywords: 41, score: 84, status: "success" as const, label: "Good"      },
  { name: "Metro Dental",        rank: "#18", keywords: 22, score: 63, status: "error"   as const, label: "Needs Work" },
  { name: "Blue Ridge Plumbing", rank: "—",   keywords: 12, score: 45, status: "info"    as const, label: "New"       },
];

export default function SeoPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>SEO & Local</p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>SEO Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>Search rankings, audits and on-page optimization.</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Avg. Domain Authority" value="41"  trend="up"   trendValue="2"   iconBg="var(--rtm-blue-light)" iconColor="var(--rtm-blue)"  icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>} />
        <KpiCard title="Top-3 Rankings"        value="127" trend="up"   trendValue="14"  iconBg="#ECFDF5"              iconColor="#059669"          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
        <KpiCard title="Keywords Tracked"      value="312" trend="up"   trendValue="28"  iconBg="#FFFBEB"              iconColor="#D97706"          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} />
        <KpiCard title="Audits This Month"     value="9"   trend="up"   trendValue="2"   iconBg="#F5F3FF"              iconColor="#7C3AED"          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7l2 2 4-4" /></svg>} />
      </div>

      <SectionWrapper title="SEO Client Rankings" description="Current performance by client">
        <div className="space-y-2">
          {clients.map((c) => (
            <div key={c.name} className="flex items-center justify-between p-3 rounded-lg border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{c.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                  Best rank: {c.rank} · {c.keywords} keywords · Score: {c.score}
                </p>
              </div>
              <StatusBadge variant={c.status} label={c.label} size="sm" />
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Link href="/seo-local/seo/tasks" className="rtm-btn-primary text-sm inline-flex items-center gap-1">SEO Tasks →</Link>
          <Link href="/seo-local"           className="rtm-btn-secondary text-sm inline-flex items-center gap-1">← Overview</Link>
        </div>
      </SectionWrapper>
    </div>
  );
}
