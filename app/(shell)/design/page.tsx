import { PageHeader, SectionWrapper, KpiCard, StatusBadge, EmptyState } from "@/components/ui";

export default function DesignPage() {
  return (
    <>
      <PageHeader
        title="Design"
        description="Brand assets, creative deliverables, and design requests."
        breadcrumb="Departments"
        actions={
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
            + Design Request
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard title="Open Requests" value="17" trend="neutral" accentColor="bg-purple-100 dark:bg-purple-900/30" />
        <KpiCard title="Delivered This Week" value="11" trend="up" trendValue="3" accentColor="bg-emerald-100 dark:bg-emerald-900/30" />
        <KpiCard title="Avg. Turnaround" value="2.1 days" trend="up" trendValue="0.2d" accentColor="bg-amber-100 dark:bg-amber-900/30" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionWrapper title="Active Requests">
          <ul className="space-y-3">
            {[
              { name: "Brand refresh — Apex Roofing", status: "info" as const, label: "In Progress" },
              { name: "Social templates — Harbor Auto", status: "warning" as const, label: "In Review" },
              { name: "Ad creatives — Blue Ridge", status: "pending" as const, label: "Queued" },
            ].map((req) => (
              <li key={req.name} className="flex items-center justify-between py-1">
                <span className="text-sm text-slate-700 dark:text-slate-300 truncate pr-3">{req.name}</span>
                <StatusBadge variant={req.status} label={req.label} size="sm" />
              </li>
            ))}
          </ul>
        </SectionWrapper>

        <SectionWrapper title="Asset Library">
          <EmptyState
            title="Asset library coming soon"
            description="Centralized design asset storage will be available in a future epic."
            variant="table"
          />
        </SectionWrapper>
      </div>
    </>
  );
}
