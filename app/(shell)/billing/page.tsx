import { PageHeader, SectionWrapper, KpiCard, EmptyState } from "@/components/ui";

export default function BillingPage() {
  return (
    <>
      <PageHeader
        title="Billing"
        description="Invoicing, subscriptions, and revenue tracking."
        breadcrumb="Departments"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard title="MRR" value="$94,800" trend="up" trendValue="11.2%" accentColor="bg-emerald-100 dark:bg-emerald-900/30" />
        <KpiCard title="Outstanding" value="$6,240" trend="neutral" accentColor="bg-amber-100 dark:bg-amber-900/30" />
        <KpiCard title="Past Due" value="$1,080" trend="down" trendValue="$400" accentColor="bg-red-100 dark:bg-red-900/30" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionWrapper title="Recent Invoices">
          <EmptyState
            title="Invoice data coming soon"
            description="Billing integration will be connected in a future epic."
            variant="table"
          />
        </SectionWrapper>

        <SectionWrapper title="Subscription Overview">
          <ul className="space-y-3">
            {[
              { tier: "Starter", count: 42, price: "$500/mo" },
              { tier: "Growth", count: 71, price: "$1,200/mo" },
              { tier: "Pro", count: 35, price: "$2,500/mo" },
            ].map((tier) => (
              <li key={tier.tier} className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{tier.tier}</p>
                  <p className="text-xs text-slate-500">{tier.count} clients</p>
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{tier.price}</span>
              </li>
            ))}
          </ul>
        </SectionWrapper>
      </div>
    </>
  );
}
