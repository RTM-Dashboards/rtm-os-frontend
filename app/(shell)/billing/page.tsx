import {
  KpiCard, SectionWrapper, StatusBadge, DataTable,
  AlertBanner, QuickActions, MiniSparkline, ProgressBar
} from "@/components/ui";
import type { Column, AlertItem, QuickAction } from "@/components/ui";

interface Invoice extends Record<string, unknown> {
  client: string;
  amount: string;
  due: string;
  status: string;
  tier: string;
}

const invoices: Invoice[] = [
  { client: "Apex Roofing Co.", amount: "$2,500", due: "May 25", status: "paid", tier: "Pro" },
  { client: "Harbor Auto Group", amount: "$5,000", due: "May 25", status: "paid", tier: "Pro" },
  { client: "Sunbelt HVAC", amount: "$1,200", due: "May 28", status: "pending", tier: "Growth" },
  { client: "Pacific Dental", amount: "$2,500", due: "May 30", status: "overdue", tier: "Pro" },
  { client: "Blue Ridge Plumbing", amount: "$500", due: "Jun 1", status: "pending", tier: "Starter" },
  { client: "Summit Landscaping", amount: "$1,200", due: "Jun 1", status: "draft", tier: "Growth" },
];

const columns: Column<Invoice>[] = [
  { key: "client", header: "Client" },
  { key: "tier", header: "Tier", width: "100px" },
  { key: "amount", header: "Amount", width: "110px" },
  { key: "due", header: "Due Date", width: "110px" },
  {
    key: "status", header: "Status", width: "120px",
    render: (value) => {
      const v = String(value);
      const map: Record<string, { variant: "success" | "pending" | "error" | "neutral"; label: string }> = {
        paid: { variant: "success", label: "Paid" },
        pending: { variant: "pending", label: "Pending" },
        overdue: { variant: "error", label: "Overdue" },
        draft: { variant: "neutral", label: "Draft" },
      };
      const c = map[v] ?? { variant: "neutral" as const, label: v };
      return <StatusBadge variant={c.variant} label={c.label} size="sm" />;
    },
  },
];

const sparkMRR = [78, 80, 82, 79, 83, 85, 86, 88, 87, 91, 93, 94.8];

const alerts: AlertItem[] = [
  { id: "1", severity: "critical", title: "2 invoices are overdue (>30 days)", description: "Pacific Dental ($2,500) and Green Valley Pools ($1,200) need escalation.", action: "Collect" },
  { id: "2", severity: "warning", title: "5 clients up for renewal in 30 days", description: "Total renewal value at risk: $8,700 MRR.", action: "Review" },
];

const quickActions: QuickAction[] = [
  { label: "Send Invoice", description: "Bill a client", icon: "💳", color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600" },
  { label: "Apply Credit", description: "Issue credit/refund", icon: "↩️", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600" },
  { label: "New Subscription", description: "Add tier upgrade", icon: "⬆️", color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" },
  { label: "Revenue Report", description: "Export MRR data", icon: "📊", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
];

const tiers = [
  { tier: "Starter", count: 42, price: "$500/mo", revenue: "$21,000", pct: 22 },
  { tier: "Growth", count: 71, price: "$1,200/mo", revenue: "$85,200", pct: 65 },
  { tier: "Pro", count: 35, price: "$2,500/mo", revenue: "$87,500", pct: 92 },
];

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Departments</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Billing</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Revenue, invoices, subscriptions & financial health.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors">Export CSV</button>
          <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors">+ Send Invoice</button>
        </div>
      </div>

      <AlertBanner alerts={alerts} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="MRR" value="$94,800" trend="up" trendValue="11.2%" accentColor="bg-emerald-100 dark:bg-emerald-900/30"
          icon={<svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <KpiCard title="ARR" value="$1.14M" trend="up" trendValue="11.2%" accentColor="bg-blue-100 dark:bg-blue-900/30"
          icon={<svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
        />
        <KpiCard title="Outstanding" value="$6,240" trend="neutral" accentColor="bg-amber-100 dark:bg-amber-900/30"
          icon={<svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <KpiCard title="Past Due" value="$3,700" trend="down" trendValue="-$400 MoM" accentColor="bg-red-100 dark:bg-red-900/30"
          icon={<svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionWrapper title="MRR Growth" description="Last 12 months" className="lg:col-span-2">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">$94,800</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">↑ +11.2% from last month</p>
            </div>
          </div>
          <MiniSparkline data={sparkMRR} color="#10b981" height={80} width={600} />
          <div className="mt-3 flex gap-2 text-xs text-slate-400">
            {["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"].map(m => (
              <span key={m} className="flex-1 text-center">{m}</span>
            ))}
          </div>
        </SectionWrapper>

        <SectionWrapper title="Subscription Tiers" description="Revenue by plan">
          <ul className="space-y-4">
            {tiers.map((tier) => (
              <li key={tier.tier}>
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{tier.tier}</span>
                    <span className="text-xs text-slate-400 ml-2">{tier.count} clients · {tier.price}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{tier.revenue}</span>
                </div>
                <ProgressBar value={tier.pct} color={tier.tier === "Pro" ? "bg-indigo-500" : tier.tier === "Growth" ? "bg-blue-500" : "bg-slate-400"} height={6} />
              </li>
            ))}
          </ul>
        </SectionWrapper>
      </div>

      <SectionWrapper title="Recent Invoices" description="Last 30 days" noPadding
        actions={<button className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">View all invoices</button>}
      >
        <DataTable columns={columns} data={invoices} />
      </SectionWrapper>

      <SectionWrapper title="Quick Actions">
        <QuickActions actions={quickActions} cols={4} />
      </SectionWrapper>
    </div>
  );
}
