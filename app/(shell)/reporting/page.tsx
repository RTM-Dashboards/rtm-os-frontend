import { PageHeader, SectionWrapper, KpiCard, StatusBadge, EmptyState } from "@/components/ui";

export default function ReportingPage() {
  return (
    <>
      <PageHeader
        title="Reporting"
        description="Client reports, performance summaries, and analytics."
        breadcrumb="Marketing"
        actions={
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
            + Generate Report
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard title="Reports This Month" value="67" trend="up" trendValue="8" accentColor="bg-indigo-100 dark:bg-indigo-900/30" />
        <KpiCard title="Pending Delivery" value="12" trend="neutral" accentColor="bg-amber-100 dark:bg-amber-900/30" />
        <KpiCard title="Client Satisfaction" value="9.1 / 10" trend="up" trendValue="0.2" accentColor="bg-emerald-100 dark:bg-emerald-900/30" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionWrapper title="Recent Reports">
          <ul className="space-y-3">
            {[
              { name: "Apex Roofing — May Report", status: "success" as const, label: "Sent" },
              { name: "Harbor Auto — May Report", status: "pending" as const, label: "Pending" },
              { name: "Pacific Dental — Q1 Summary", status: "success" as const, label: "Sent" },
              { name: "Blue Ridge — Monthly Recap", status: "warning" as const, label: "Draft" },
            ].map((r) => (
              <li key={r.name} className="flex items-center justify-between py-1">
                <span className="text-sm text-slate-700 dark:text-slate-300 truncate pr-3">{r.name}</span>
                <StatusBadge variant={r.status} label={r.label} size="sm" />
              </li>
            ))}
          </ul>
        </SectionWrapper>

        <SectionWrapper title="Report Templates">
          <EmptyState
            title="Template library coming soon"
            description="Saved report templates will be available in a future epic."
            variant="table"
          />
        </SectionWrapper>
      </div>
    </>
  );
}
