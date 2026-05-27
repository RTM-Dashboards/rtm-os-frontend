import {
  KpiCard, SectionWrapper, StatusBadge, DataTable,
  ActivityFeed, AlertBanner, QuickActions, TeamWidget, MiniSparkline, ProgressBar
} from "@/components/ui";
import type { Column, ActivityItem, AlertItem, QuickAction, TeamMember } from "@/components/ui";

interface Lead extends Record<string, unknown> {
  name: string;
  source: string;
  value: string;
  stage: string;
  owner: string;
  lastContact: string;
  probability: number;
}

const leads: Lead[] = [
  { name: "Summit Landscaping", source: "Referral", value: "$2,400/mo", stage: "proposal", owner: "Jordan M.", lastContact: "Today", probability: 75 },
  { name: "Blue Ridge Plumbing", source: "Website", value: "$1,800/mo", stage: "discovery", owner: "Sarah K.", lastContact: "Yesterday", probability: 40 },
  { name: "Harbor Auto Group", source: "Cold Outreach", value: "$5,000/mo", stage: "negotiation", owner: "Mike T.", lastContact: "2d ago", probability: 85 },
  { name: "Cascade Flooring", source: "LinkedIn", value: "$3,200/mo", stage: "discovery", owner: "Alex R.", lastContact: "3d ago", probability: 30 },
  { name: "Metro Dental Group", source: "Referral", value: "$4,500/mo", stage: "proposal", owner: "Jordan M.", lastContact: "Today", probability: 65 },
  { name: "Sunstate Solar", source: "Google Ads", value: "$6,000/mo", stage: "closed-won", owner: "Sarah K.", lastContact: "1w ago", probability: 100 },
];

const columns: Column<Lead>[] = [
  { key: "name", header: "Company" },
  { key: "source", header: "Source", width: "120px" },
  { key: "value", header: "MRR", width: "110px" },
  { key: "owner", header: "Owner", width: "120px" },
  { key: "lastContact", header: "Last Contact", width: "120px" },
  {
    key: "probability",
    header: "Win %",
    width: "120px",
    render: (value) => {
      const v = Number(value);
      return (
        <div className="flex items-center gap-2 min-w-0">
          <ProgressBar value={v} color={v >= 70 ? "bg-emerald-500" : v >= 40 ? "bg-amber-500" : "bg-red-400"} height={5} />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 w-8 flex-shrink-0">{v}%</span>
        </div>
      );
    },
  },
  {
    key: "stage",
    header: "Stage",
    width: "130px",
    render: (value) => {
      const v = String(value);
      const map: Record<string, { variant: "info" | "pending" | "warning" | "success"; label: string }> = {
        discovery: { variant: "info", label: "Discovery" },
        proposal: { variant: "pending", label: "Proposal" },
        negotiation: { variant: "warning", label: "Negotiation" },
        "closed-won": { variant: "success", label: "Closed Won" },
      };
      const c = map[v] ?? { variant: "neutral" as const, label: v };
      return <StatusBadge variant={c.variant} label={c.label} size="sm" />;
    },
  },
];

const sparkRevenue = [28, 30, 27, 32, 35, 31, 38, 36, 40, 38, 42, 44];

const activityItems: ActivityItem[] = [
  { id: "1", actor: "Jordan M.", action: "sent proposal to", target: "Summit Landscaping", timestamp: "1h ago", type: "task", avatarColor: "#6366f1" },
  { id: "2", actor: "Mike T.", action: "closed deal with", target: "Sunstate Solar — $6K/mo", timestamp: "3h ago", type: "campaign", avatarColor: "#8b5cf6" },
  { id: "3", actor: "Sarah K.", action: "scheduled discovery call with", target: "Blue Ridge Plumbing", timestamp: "5h ago", type: "client", avatarColor: "#f59e0b" },
  { id: "4", actor: "Alex R.", action: "followed up with", target: "Cascade Flooring", timestamp: "1d ago", type: "task", avatarColor: "#10b981" },
];

const alerts: AlertItem[] = [
  { id: "1", severity: "warning", title: "3 leads have not been contacted in 7+ days", description: "Cascade Flooring, Metro Dental, Summit Landscaping need follow-up.", action: "Review" },
  { id: "2", severity: "info", title: "Pipeline value up 18% this month", description: "On track to hit Q2 new business target of $25K MRR.", action: "View" },
];

const quickActions: QuickAction[] = [
  { label: "Add Lead", description: "New prospect", icon: "➕", color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600" },
  { label: "Log Call", description: "Record touchpoint", icon: "📞", color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" },
  { label: "Send Proposal", description: "Draft & send", icon: "📋", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
  { label: "View Forecast", description: "Q2 projections", icon: "📈", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600" },
];

const salesTeam: TeamMember[] = [
  { name: "Jordan M.", role: "Sales Lead", status: "online", tasks: 8, avatarColor: "#6366f1" },
  { name: "Sarah K.", role: "BDR", status: "online", tasks: 5, avatarColor: "#f59e0b" },
  { name: "Mike T.", role: "Account Executive", status: "away", tasks: 11, avatarColor: "#8b5cf6" },
  { name: "Alex R.", role: "BDR", status: "online", tasks: 6, avatarColor: "#10b981" },
];

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Departments</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Sales</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Pipeline, leads & new business development.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors">Export</button>
          <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm shadow-indigo-500/30">+ Add Lead</button>
        </div>
      </div>

      <AlertBanner alerts={alerts} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Pipeline Value" value="$38,400" trend="up" trendValue="18%" accentColor="bg-emerald-100 dark:bg-emerald-900/30"
          icon={<svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
        />
        <KpiCard title="Open Leads" value="24" trend="up" trendValue="+5 this week" accentColor="bg-indigo-100 dark:bg-indigo-900/30"
          icon={<svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <KpiCard title="Close Rate" value="34%" trend="up" trendValue="+3% MoM" accentColor="bg-purple-100 dark:bg-purple-900/30"
          icon={<svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <KpiCard title="New MRR (MTD)" value="$9,200" trend="up" trendValue="vs $7.8K" accentColor="bg-amber-100 dark:bg-amber-900/30"
          icon={<svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionWrapper title="New MRR Trend" description="Last 12 months" className="lg:col-span-2">
          <MiniSparkline data={sparkRevenue} color="#10b981" height={80} width={600} />
          <div className="mt-3 flex gap-2 text-xs text-slate-400">
            {["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"].map(m => (
              <span key={m} className="flex-1 text-center">{m}</span>
            ))}
          </div>
        </SectionWrapper>
        <SectionWrapper title="Quick Actions">
          <QuickActions actions={quickActions} cols={2} />
        </SectionWrapper>
      </div>

      <SectionWrapper title="Active Pipeline" description={`${leads.length} leads · Sorted by close probability`} noPadding
        actions={<button className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">View CRM</button>}
      >
        <DataTable columns={columns} data={leads} />
      </SectionWrapper>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionWrapper title="Recent Activity" description="Sales team actions">
          <ActivityFeed items={activityItems} />
        </SectionWrapper>
        <SectionWrapper title="Sales Team" description="Current capacity">
          <TeamWidget members={salesTeam} />
        </SectionWrapper>
      </div>
    </div>
  );
}
