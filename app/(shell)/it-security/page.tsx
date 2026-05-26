import { PageHeader, SectionWrapper, KpiCard, StatusBadge, EmptyState } from "@/components/ui";

export default function ItSecurityPage() {
  return (
    <>
      <PageHeader
        title="IT & Security"
        description="Infrastructure, access control, and security monitoring."
        breadcrumb="Admin"
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Systems Online" value="100%" trend="neutral" accentColor="bg-emerald-100 dark:bg-emerald-900/30" />
        <KpiCard title="Open Tickets" value="4" trend="down" trendValue="2" accentColor="bg-amber-100 dark:bg-amber-900/30" />
        <KpiCard title="Security Score" value="94 / 100" trend="up" trendValue="2pts" accentColor="bg-indigo-100 dark:bg-indigo-900/30" />
        <KpiCard title="Active Users" value="38" trend="neutral" accentColor="bg-slate-100 dark:bg-slate-800" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionWrapper title="System Status">
          <ul className="space-y-3">
            {[
              { name: "RTM OS Frontend", status: "success" as const, label: "Online" },
              { name: "API Gateway", status: "success" as const, label: "Online" },
              { name: "Database Cluster", status: "success" as const, label: "Online" },
              { name: "Email Service", status: "warning" as const, label: "Degraded" },
              { name: "File Storage", status: "success" as const, label: "Online" },
            ].map((sys) => (
              <li key={sys.name} className="flex items-center justify-between py-1">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{sys.name}</span>
                <StatusBadge variant={sys.status} label={sys.label} size="sm" />
              </li>
            ))}
          </ul>
        </SectionWrapper>

        <SectionWrapper title="Recent Incidents">
          <EmptyState
            title="No active incidents"
            description="All systems are operating normally."
            variant="table"
          />
        </SectionWrapper>
      </div>
    </>
  );
}
