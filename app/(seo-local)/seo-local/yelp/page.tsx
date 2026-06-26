"use client";

import Link from "next/link";
import {
  KpiCard, SectionWrapper, StatusBadge, DataTable,
  ActivityFeed, AlertBanner, QuickActions, ProgressBar,
} from "@/components/ui";
import type { Column, ActivityItem, AlertItem, QuickAction } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("seo-local")!;

interface YelpClient extends Record<string, unknown> {
  client: string;
  city: string;
  status: string;
  rating: number;
  reviews: number;
  monthlyLeads: number;
  completeness: number;
}

const clients: YelpClient[] = [
  { client: "Apex Roofing Co.",    city: "Denver, CO",    status: "active",  rating: 4.7, reviews: 42,  monthlyLeads: 18, completeness: 92 },
  { client: "Pacific Dental",      city: "San Diego, CA", status: "claimed", rating: 4.8, reviews: 78,  monthlyLeads: 31, completeness: 100 },
  { client: "Harbor Auto Group",   city: "Phoenix, AZ",   status: "active",  rating: 4.2, reviews: 29,  monthlyLeads: 11, completeness: 78 },
  { client: "Summit Landscaping",  city: "Denver, CO",    status: "active",  rating: 4.5, reviews: 17,  monthlyLeads: 6,  completeness: 70 },
  { client: "Metro Dental",        city: "Denver, CO",    status: "active",  rating: 3.8, reviews: 11,  monthlyLeads: 3,  completeness: 55 },
  { client: "Blue Ridge Plumbing", city: "Asheville, NC", status: "pending", rating: 0,   reviews: 0,   monthlyLeads: 0,  completeness: 20 },
];

const columns: Column<YelpClient>[] = [
  { key: "client", header: "Client"},
  { key: "city",   header: "Location", width: "150px"},
  {
    key: "status", header: "Status", width: "110px",
    render: (value) => {
      const v = String(value);
      const map: Record<string, { variant: "success"| "info"| "pending"| "warning"; label: string }> = {
        active:  { variant: "success", label: "Active"},
        claimed: { variant: "info",    label: "Claimed"},
        pending: { variant: "pending", label: "Pending"},
        warning: { variant: "warning", label: "Needs Work"},
      };
      const c = map[v] ?? { variant: "pending"as const, label: v };
      return <StatusBadge variant={c.variant} label={c.label} size="sm"/>;
    },
  },
  { key: "rating",       header: "Rating",    width: "90px",
    render: (value) => {
      const v = Number(value);
      return v > 0 ? <span className="font-bold text-red-500"> {v}</span> : <span className="text-slate-400 text-sm">—</span>;
    },
  },
  { key: "reviews",      header: "Reviews",   width: "90px"},
  { key: "monthlyLeads", header: "Mo. Leads", width: "100px"},
  { key: "completeness", header: "Profile %", width: "150px",
    render: (value) => <ProgressBar value={Number(value)} max={100} height={5}showLabel />,
  },
];

const activityItems: ActivityItem[] = [
  { id: "1", actor: "Lisa P.",   action: "responded to 3-star review for",  target: "Apex Roofing Co.",    timestamp: "3h ago",  type: "task",  avatarColor: "#ec4899"},
  { id: "2", actor: "Jordan M.", action: "updated service categories for",  target: "Pacific Dental",       timestamp: "6h ago",  type: "task",  avatarColor: "var(--rtm-blue)"},
  { id: "3", actor: "System",    action: "new 5-star review received for",  target: "Pacific Dental",       timestamp: "9h ago",  type: "alert", avatarColor: "#64748b"},
  { id: "4", actor: "Lisa P.",   action: "claimed listing for",             target: "Blue Ridge Plumbing",  timestamp: "2d ago",  type: "task",  avatarColor: "#ec4899"},
];

const alerts: AlertItem[] = [
  { id: "1", severity: "warning", title: "Blue Ridge Plumbing listing pending",         description: "Yelp claim verification still pending. Follow up to complete.", action: "Follow Up"},
  { id: "2", severity: "info",    title: "Pacific Dental fully claimed & growing",      description: "78 reviews this month — highest across all Yelp clients.",     action: "View"},
];

const quickActions: QuickAction[] = [
  { label: "Claim Listing",  description: "Verify Yelp page",    icon: "", color: "bg-red-100 text-red-600"},
  { label: "Reply Reviews",  description: "Respond to feedback", color: "bg-[var(--rtm-blue-xlight)] text-[var(--rtm-blue)]"},
  { label: "Add Photos",     description: "Upload business images",icon: "", color: "bg-blue-100 text-blue-600"},
  { label: "Update Profile", description: "Edit hours & info",   icon: "", color: "bg-emerald-100 text-emerald-600"},
];

export default function YelpPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: workspace.accentColor }}>SEO & Local</p>
          <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>Yelp Dashboard</h1>
          <p className="text-sm mt-1"style={{ color: "var(--rtm-text-secondary)"}}>Manage and optimize client Yelp listings and reviews.</p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <Link href="/seo-local/yelp/tasks" className="rtm-btn-primary text-sm inline-flex items-center gap-1">Yelp Tasks →</Link>
          <Link href="/seo-local" className="rtm-btn-secondary text-sm inline-flex items-center gap-1">← Overview</Link>
        </div>
      </div>

      <AlertBanner alerts={alerts} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Claimed Profiles"value="32"trend="up"trendValue="+2 new"accentColor="bg-red-100"icon={<svg className="w-5 h-5 text-red-500"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>}
        />
        <KpiCard title="Avg. Yelp Rating"value="4.4"trend="up"trendValue="+0.1 pts"accentColor="bg-amber-100"icon={<svg className="w-5 h-5 text-amber-500"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>}
        />
        <KpiCard title="Reviews (MTD)"value="69"trend="up"trendValue="+14 vs last"accentColor="bg-[var(--rtm-blue-xlight)]"icon={<svg className="w-5 h-5 text-[var(--rtm-blue)]"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>}
        />
        <KpiCard title="Unclaimed / Pending"value="6"trend="down"trendValue="-2 resolved"accentColor="bg-purple-100"icon={<svg className="w-5 h-5 text-purple-600"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        />
      </div>

      <SectionWrapper title="Quick Actions">
        <QuickActions actions={quickActions} cols={4} />
      </SectionWrapper>

      <SectionWrapper
        title="Client Yelp Overview"description={`${clients.length} active clients`}
        noPadding
        actions={<button className="text-xs font-medium text-[var(--rtm-blue)] hover:underline">Export data</button>}
      >
        <DataTable columns={columns} data={clients} />
      </SectionWrapper>

      <SectionWrapper title="Recent Activity"description="Yelp team actions">
        <ActivityFeed items={activityItems} />
      </SectionWrapper>
    </div>
  );
}
