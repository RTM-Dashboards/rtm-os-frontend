"use client";

import {
  KpiCard, SectionWrapper, StatusBadge, DataTable,
  ActivityFeed, AlertBanner, QuickActions, ProgressBar
} from "@/components/ui";
import type { Column, ActivityItem, AlertItem, QuickAction } from "@/components/ui";

interface GbpClient extends Record<string, unknown> {
  client: string;
  city: string;
  status: string;
  reviewScore: number;
  totalReviews: number;
  monthlyViews: string;
  completeness: number;
}

const clients: GbpClient[] = [
  { client: "Apex Roofing Co.",    city: "Denver, CO",     status: "optimized",    reviewScore: 4.8, totalReviews: 142, monthlyViews: "6.2K",  completeness: 96 },
  { client: "Sunbelt HVAC",        city: "Phoenix, AZ",    status: "needs-review", reviewScore: 4.2, totalReviews: 87,  monthlyViews: "3.9K",  completeness: 72 },
  { client: "Pacific Dental",      city: "San Diego, CA",  status: "optimized",    reviewScore: 4.9, totalReviews: 214, monthlyViews: "9.1K",  completeness: 100 },
  { client: "Summit Landscaping",  city: "Denver, CO",     status: "optimized",    reviewScore: 4.6, totalReviews: 63,  monthlyViews: "2.8K",  completeness: 88 },
  { client: "Blue Ridge Plumbing", city: "Asheville, NC",  status: "needs-review", reviewScore: 4.0, totalReviews: 41,  monthlyViews: "1.7K",  completeness: 65 },
];

const columns: Column<GbpClient>[] = [
  { key: "client", header: "Client" },
  { key: "city",   header: "Location", width: "150px" },
  {
    key: "status", header: "Status", width: "140px",
    render: (value) => {
      const v = String(value);
      const map: Record<string, { variant: "success" | "warning"; label: string }> = {
        optimized:    { variant: "success", label: "Optimized" },
        "needs-review": { variant: "warning", label: "Needs Review" },
      };
      const c = map[v] ?? { variant: "warning" as const, label: v };
      return <StatusBadge variant={c.variant} label={c.label} size="sm" />;
    },
  },
  { key: "reviewScore",  header: "Rating",   width: "80px",
    render: (value) => <span className="font-bold text-amber-500">★ {String(value)}</span>,
  },
  { key: "totalReviews", header: "Reviews",  width: "90px" },
  { key: "monthlyViews", header: "Mo. Views",width: "100px" },
  { key: "completeness", header: "Profile %", width: "140px",
    render: (value) => <ProgressBar value={Number(value)} max={100} height={5} color="bg-emerald-500" showLabel />,
  },
];

const activityItems: ActivityItem[] = [
  { id: "1", actor: "Lisa P.",   action: "completed GBP audit for",    target: "Apex Roofing Co.",         timestamp: "2h ago",  type: "task",  avatarColor: "#ec4899" },
  { id: "2", actor: "Jordan M.", action: "updated business hours for",  target: "Pacific Dental",           timestamp: "5h ago",  type: "task",  avatarColor: "var(--rtm-blue)" },
  { id: "3", actor: "System",    action: "detected incomplete profile for", target: "Blue Ridge Plumbing",  timestamp: "8h ago",  type: "alert", avatarColor: "#64748b" },
  { id: "4", actor: "Lisa P.",   action: "added 12 new photos to",     target: "Summit Landscaping GBP",   timestamp: "1d ago",  type: "task",  avatarColor: "#ec4899" },
];

const alerts: AlertItem[] = [
  { id: "1", severity: "warning", title: "2 GBP profiles need review",       description: "Sunbelt HVAC and Blue Ridge Plumbing profiles have incomplete or outdated information.", action: "Fix" },
  { id: "2", severity: "info",    title: "Pacific Dental reached 100% completeness", description: "Profile is fully optimized with all fields, photos, and categories set.", action: "View" },
];

const quickActions: QuickAction[] = [
  { label: "Run GBP Audit",   description: "Full profile review",   icon: "📍", color: "bg-emerald-100 text-emerald-600" },
  { label: "Add Photos",      description: "Upload business images",icon: "📷", color: "bg-blue-100 text-blue-600" },
  { label: "Respond Reviews", description: "Reply to feedback",     icon: "💬", color: "bg-[var(--rtm-blue-xlight)] text-[var(--rtm-blue)]" },
  { label: "Update Info",     description: "Edit hours & services", icon: "✏️", color: "bg-amber-100 text-amber-600" },
];

export default function GbpPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Marketing</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Google Business Profile</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage and optimize client GBP listings.</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-[var(--rtm-blue)] hover:bg-[var(--rtm-blue-dark)] text-white text-sm font-semibold transition-colors self-start">+ Run Audit</button>
      </div>

      <AlertBanner alerts={alerts} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Total GBP Profiles"
          value="148"
          trend="up"
          trendValue="+6 new"
          accentColor="bg-emerald-100 dark:bg-emerald-900/30"
          icon={
            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <KpiCard
          title="Avg. Review Score"
          value="4.5 ★"
          trend="up"
          trendValue="+0.2 pts"
          accentColor="bg-amber-100 dark:bg-amber-900/30"
          icon={
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          }
        />
        <KpiCard
          title="Profiles Optimized"
          value="112"
          trend="up"
          trendValue="+8 this month"
          accentColor="bg-[var(--rtm-blue-xlight)]"
          icon={
            <svg className="w-5 h-5 text-[var(--rtm-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KpiCard
          title="Needs Review"
          value="36"
          trend="down"
          trendValue="-4 resolved"
          accentColor="bg-red-100 dark:bg-red-900/30"
          icon={
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
      </div>

      <SectionWrapper title="Quick Actions">
        <QuickActions actions={quickActions} cols={4} />
      </SectionWrapper>

      <SectionWrapper
        title="Client GBP Overview"
        description={`${clients.length} active clients`}
        noPadding
        actions={<button className="text-xs font-medium text-[var(--rtm-blue)] hover:underline">Export data</button>}
      >
        <DataTable columns={columns} data={clients} />
      </SectionWrapper>

      <SectionWrapper title="Recent Activity" description="GBP team actions">
        <ActivityFeed items={activityItems} />
      </SectionWrapper>
    </div>
  );
}
