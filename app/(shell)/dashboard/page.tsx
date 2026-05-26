import { KpiCard, SectionWrapper, PageHeader, StatusBadge, DataTable } from "@/components/ui";
import type { Column } from "@/components/ui";

interface ActivityRow extends Record<string, unknown> {
  department: string;
  task: string;
  status: string;
  updated: string;
}

const activityData: ActivityRow[] = [
  { department: "Sales", task: "Q2 Pipeline Review", status: "active", updated: "2m ago" },
  { department: "Content", task: "Blog batch — May 2025", status: "pending", updated: "1h ago" },
  { department: "SEO", task: "GMB audit — Client A", status: "completed", updated: "3h ago" },
  { department: "Meta Ads", task: "Summer campaign setup", status: "active", updated: "5h ago" },
  { department: "Design", task: "Brand refresh assets", status: "pending", updated: "1d ago" },
];

const activityColumns: Column<ActivityRow>[] = [
  { key: "department", header: "Department", width: "140px" },
  { key: "task", header: "Task" },
  {
    key: "status",
    header: "Status",
    width: "120px",
    render: (value) => {
      const v = String(value);
      const map: Record<string, { variant: "success" | "pending" | "info"; label: string }> = {
        active: { variant: "info", label: "Active" },
        pending: { variant: "pending", label: "Pending" },
        completed: { variant: "success", label: "Completed" },
      };
      const config = map[v] ?? { variant: "neutral" as const, label: v };
      return <StatusBadge variant={config.variant} label={config.label} />;
    },
  },
  { key: "updated", header: "Updated", width: "100px" },
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your real-time marketing operations at a glance."
        breadcrumb="RTM OS"
      />

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Active Clients"
          value="148"
          trend="up"
          trendValue="6%"
          accentColor="bg-indigo-100 dark:bg-indigo-900/30"
          icon={
            <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <KpiCard
          title="Open Tasks"
          value="312"
          trend="down"
          trendValue="4%"
          accentColor="bg-amber-100 dark:bg-amber-900/30"
          icon={
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
        />
        <KpiCard
          title="Monthly Revenue"
          value="$94,800"
          trend="up"
          trendValue="11.2%"
          accentColor="bg-emerald-100 dark:bg-emerald-900/30"
          icon={
            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KpiCard
          title="Avg. Client Score"
          value="8.7 / 10"
          trend="up"
          trendValue="0.3"
          accentColor="bg-purple-100 dark:bg-purple-900/30"
          icon={
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          }
        />
      </div>

      {/* Department status row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <SectionWrapper
          title="Department Health"
          description="Status across all teams"
          className="lg:col-span-1"
        >
          <ul className="space-y-3">
            {[
              { name: "Sales", status: "success" as const, label: "On Track" },
              { name: "Content", status: "warning" as const, label: "Behind" },
              { name: "SEO / GBP", status: "success" as const, label: "On Track" },
              { name: "Meta Ads", status: "info" as const, label: "Active" },
              { name: "Design", status: "warning" as const, label: "Backlog" },
              { name: "IT & Security", status: "success" as const, label: "Healthy" },
            ].map((dept) => (
              <li key={dept.name} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {dept.name}
                </span>
                <StatusBadge variant={dept.status} label={dept.label} size="sm" />
              </li>
            ))}
          </ul>
        </SectionWrapper>

        {/* Quick stats */}
        <SectionWrapper
          title="This Week"
          description="Activity snapshot"
          className="lg:col-span-2"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Deliverables sent", value: "47" },
              { label: "Client check-ins", value: "22" },
              { label: "Campaigns live", value: "9" },
              { label: "Reports published", value: "14" },
              { label: "Issues resolved", value: "31" },
              { label: "New leads", value: "18" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3"
              >
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </SectionWrapper>
      </div>

      {/* Recent activity table */}
      <SectionWrapper
        title="Recent Activity"
        description="Latest updates across departments"
        actions={
          <button className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View all
          </button>
        }
        noPadding
      >
        <DataTable columns={activityColumns} data={activityData} />
      </SectionWrapper>
    </>
  );
}
