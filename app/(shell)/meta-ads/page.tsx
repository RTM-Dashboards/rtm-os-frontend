import { PageHeader, SectionWrapper, KpiCard, StatusBadge, DataTable } from "@/components/ui";
import type { Column } from "@/components/ui";

interface Campaign extends Record<string, unknown> {
  client: string;
  campaign: string;
  spend: string;
  roas: string;
  status: string;
}

const campaigns: Campaign[] = [
  { client: "Harbor Auto", campaign: "Summer Sale — Traffic", spend: "$3,200", roas: "4.2x", status: "active" },
  { client: "Apex Roofing", campaign: "Storm Season Lead Gen", spend: "$1,800", roas: "6.1x", status: "active" },
  { client: "Sunbelt HVAC", campaign: "Brand Awareness Q2", spend: "$900", roas: "2.8x", status: "paused" },
];

const columns: Column<Campaign>[] = [
  { key: "client", header: "Client" },
  { key: "campaign", header: "Campaign" },
  { key: "spend", header: "Spend", width: "100px" },
  { key: "roas", header: "ROAS", width: "90px" },
  {
    key: "status",
    header: "Status",
    width: "110px",
    render: (value) => {
      const v = String(value);
      const map: Record<string, { variant: "success" | "warning"; label: string }> = {
        active: { variant: "success", label: "Active" },
        paused: { variant: "warning", label: "Paused" },
      };
      const c = map[v] ?? { variant: "neutral" as const, label: v };
      return <StatusBadge variant={c.variant} label={c.label} size="sm" />;
    },
  },
];

export default function MetaAdsPage() {
  return (
    <>
      <PageHeader
        title="Meta Ads & PPC"
        description="Facebook, Instagram, and paid search campaign management."
        breadcrumb="Marketing"
        actions={
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
            + New Campaign
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Total Ad Spend" value="$38,400" trend="up" trendValue="9%" accentColor="bg-blue-100 dark:bg-blue-900/30" />
        <KpiCard title="Avg. ROAS" value="4.8x" trend="up" trendValue="0.3x" accentColor="bg-emerald-100 dark:bg-emerald-900/30" />
        <KpiCard title="Active Campaigns" value="31" trend="neutral" accentColor="bg-indigo-100 dark:bg-indigo-900/30" />
        <KpiCard title="Leads Generated" value="847" trend="up" trendValue="14%" accentColor="bg-purple-100 dark:bg-purple-900/30" />
      </div>

      <SectionWrapper title="Active Campaigns" noPadding>
        <DataTable columns={columns} data={campaigns} />
      </SectionWrapper>
    </>
  );
}
