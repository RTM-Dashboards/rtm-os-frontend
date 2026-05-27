"use client";

import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("seo-local")!;

const clients = [
  { name: "Apex Roofing",        reviews: 184, rating: "4.8", photos: 24, posts: "Weekly",   status: "success" as const, label: "Optimized" },
  { name: "Pacific Dental",      reviews: 221, rating: "4.9", photos: 31, posts: "Weekly",   status: "success" as const, label: "Optimized" },
  { name: "Harbor Auto Group",   reviews: 97,  rating: "4.3", photos: 12, posts: "Monthly",  status: "warning" as const, label: "Needs Posts"},
  { name: "Summit Landscaping",  reviews: 58,  rating: "4.7", photos: 18, posts: "Bi-weekly",status: "success" as const, label: "Good"       },
  { name: "Metro Dental",        reviews: 34,  rating: "4.1", photos: 8,  posts: "—",         status: "error"   as const, label: "Inactive"   },
  { name: "Blue Ridge Plumbing", reviews: 4,   rating: "—",   photos: 2,  posts: "—",         status: "info"    as const, label: "Setting Up" },
];

export default function GbpPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>SEO & Local</p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>GBP Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>Google Business Profile management across all clients.</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Active Profiles"     value="38"   trend="up" trendValue="4"   iconBg="#ECFDF5"              iconColor="#059669" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
        <KpiCard title="Avg. Star Rating"    value="4.6"  trend="up" trendValue="0.1" iconBg="#FFFBEB"              iconColor="#D97706" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>} />
        <KpiCard title="Reviews (MTD)"       value="67"   trend="up" trendValue="11"  iconBg="var(--rtm-blue-light)" iconColor="var(--rtm-blue)" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>} />
        <KpiCard title="Unanswered Reviews"  value="12"   trend="down" trendValue="5" iconBg="#FEF2F2"              iconColor="#DC2626" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
      </div>

      <SectionWrapper title="GBP Client Status" description="Profile health overview">
        <div className="space-y-2">
          {clients.map((c) => (
            <div key={c.name} className="flex items-center justify-between p-3 rounded-lg border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{c.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                  {c.reviews} reviews · {c.rating !== "—" ? `★ ${c.rating}` : "No rating"} · {c.photos} photos · Posts: {c.posts}
                </p>
              </div>
              <StatusBadge variant={c.status} label={c.label} size="sm" />
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Link href="/seo-local/gbp/tasks" className="rtm-btn-primary text-sm inline-flex items-center gap-1">GBP Tasks →</Link>
          <Link href="/seo-local"           className="rtm-btn-secondary text-sm inline-flex items-center gap-1">← Overview</Link>
        </div>
      </SectionWrapper>
    </div>
  );
}
