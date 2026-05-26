import { PageHeader, SectionWrapper, KpiCard, StatusBadge, DataTable } from "@/components/ui";
import type { Column } from "@/components/ui";

interface Lead extends Record<string, unknown> {
  name: string;
  source: string;
  value: string;
  stage: string;
}

const leads: Lead[] = [
  { name: "Summit Landscaping", source: "Referral", value: "$2,400/mo", stage: "proposal" },
  { name: "Blue Ridge Plumbing", source: "Website", value: "$1,800/mo", stage: "discovery" },
  { name: "Harbor Auto Group", source: "Cold outreach", value: "$5,000/mo", stage: "negotiation" },
];

const columns: Column<Lead>[] = [
  { key: "name", header: "Lead" },
  { key: "source", header: "Source" },
  { key: "value", header: "MRR" },
  {
    key: "stage",
    header: "Stage",
    render: (value) => {
      const v = String(value);
      const map: Record<string, { variant: "info" | "pending" | "warning"; label: string }> = {
        discovery: { variant: "info", label: "Discovery" },
        proposal: { variant: "pending", label: "Proposal" },
        negotiation: { variant: "warning", label: "Negotiation" },
      };
      const c = map[v] ?? { variant: "neutral" as const, label: v };
      return <StatusBadge variant={c.variant} label={c.label} size="sm" />;
    },
  },
];

export default function SalesPage() {
  return (
    <>
      <PageHeader
        title="Sales"
        description="Pipeline, leads, and new business tracking."
        breadcrumb="Departments"
        actions={
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
            + Add Lead
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard title="Pipeline Value" value="$38,400" trend="up" trendValue="18%" accentColor="bg-emerald-100 dark:bg-emerald-900/30" />
        <KpiCard title="Open Leads" value="24" trend="up" trendValue="5" accentColor="bg-indigo-100 dark:bg-indigo-900/30" />
        <KpiCard title="Close Rate" value="34%" trend="up" trendValue="3%" accentColor="bg-purple-100 dark:bg-purple-900/30" />
      </div>

      <SectionWrapper title="Active Pipeline" noPadding>
        <DataTable columns={columns} data={leads} />
      </SectionWrapper>
    </>
  );
}
