import { PageHeader, SectionWrapper, EmptyState, KpiCard, StatusBadge } from "@/components/ui";

export default function AccountManagementPage() {
  return (
    <>
      <PageHeader
        title="Account Management"
        description="Manage client accounts, onboarding, and retention."
        breadcrumb="Departments"
        actions={
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
            + New Account
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard title="Total Accounts" value="148" trend="up" trendValue="6%" accentColor="bg-indigo-100 dark:bg-indigo-900/30" />
        <KpiCard title="At-Risk Accounts" value="7" trend="down" trendValue="2" accentColor="bg-red-100 dark:bg-red-900/30" />
        <KpiCard title="Avg. Retention" value="96.2%" trend="up" trendValue="0.4%" accentColor="bg-emerald-100 dark:bg-emerald-900/30" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionWrapper title="Recent Accounts" description="Newly onboarded clients">
          <ul className="space-y-3">
            {["Apex Roofing Co.", "Sunbelt HVAC", "Pacific Dental Group", "Metro Law Firm"].map((name, i) => (
              <li key={name} className="flex items-center justify-between py-1">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{name}</span>
                <StatusBadge
                  variant={i === 1 ? "warning" : "success"}
                  label={i === 1 ? "Onboarding" : "Active"}
                  size="sm"
                />
              </li>
            ))}
          </ul>
        </SectionWrapper>

        <SectionWrapper title="Action Items">
          <EmptyState
            title="No action items"
            description="All accounts are up to date."
            variant="table"
          />
        </SectionWrapper>
      </div>
    </>
  );
}
