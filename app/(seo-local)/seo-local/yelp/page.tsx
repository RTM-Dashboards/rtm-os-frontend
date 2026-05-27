"use client";

import Link from "next/link";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("seo-local")!;

const clients = [
  { name: "Apex Roofing",        reviews: 42,  rating: "4.7", claimed: true,  status: "success" as const, label: "Active"    },
  { name: "Pacific Dental",      reviews: 78,  rating: "4.8", claimed: true,  status: "success" as const, label: "Active"    },
  { name: "Harbor Auto Group",   reviews: 29,  rating: "4.2", claimed: true,  status: "warning" as const, label: "Watch"     },
  { name: "Summit Landscaping",  reviews: 17,  rating: "4.5", claimed: true,  status: "info"    as const, label: "Growing"   },
  { name: "Metro Dental",        reviews: 11,  rating: "3.8", claimed: true,  status: "error"   as const, label: "Needs Work"},
  { name: "Blue Ridge Plumbing", reviews: 0,   rating: "—",   claimed: false, status: "info"    as const, label: "Unclaimed" },
];

export default function YelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>SEO & Local</p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Yelp Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>Yelp profile management, reviews and reputation.</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Claimed Profiles"  value="32"  trend="up" trendValue="2"   iconBg="#ECFDF5"              iconColor="#059669" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <KpiCard title="Avg. Star Rating"  value="4.4" trend="up" trendValue="0.2" iconBg="#FFFBEB"              iconColor="#D97706" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>} />
        <KpiCard title="Reviews (MTD)"     value="24"  trend="up" trendValue="7"   iconBg="var(--rtm-blue-light)" iconColor="var(--rtm-blue)" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>} />
        <KpiCard title="Unclaimed"         value="6"   trend="down" trendValue="2" iconBg="#FEF2F2"              iconColor="#DC2626" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
      </div>

      <SectionWrapper title="Yelp Client Status" description="Profile overview">
        <div className="space-y-2">
          {clients.map((c) => (
            <div key={c.name} className="flex items-center justify-between p-3 rounded-lg border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{c.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                  {c.reviews} reviews · {c.rating !== "—" ? `★ ${c.rating}` : "No rating"} · {c.claimed ? "Claimed" : "Unclaimed"}
                </p>
              </div>
              <StatusBadge variant={c.status} label={c.label} size="sm" />
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Link href="/seo-local/yelp/tasks" className="rtm-btn-primary text-sm inline-flex items-center gap-1">Yelp Tasks →</Link>
          <Link href="/seo-local"             className="rtm-btn-secondary text-sm inline-flex items-center gap-1">← Overview</Link>
        </div>
      </SectionWrapper>
    </div>
  );
}
