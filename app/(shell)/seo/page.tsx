import { PageHeader, SectionWrapper, KpiCard, StatusBadge, DataTable } from "@/components/ui";
import type { Column } from "@/components/ui";

interface SeoClient extends Record<string, unknown> {
  client: string;
  ranking: string;
  gbpStatus: string;
  yelpStatus: string;
}

const clients: SeoClient[] = [
  { client: "Apex Roofing Co.", ranking: "#3 — 'roof repair denver'", gbpStatus: "optimized", yelpStatus: "active" },
  { client: "Sunbelt HVAC", ranking: "#7 — 'hvac phoenix'", gbpStatus: "needs-review", yelpStatus: "active" },
  { client: "Pacific Dental", ranking: "#2 — 'dentist san diego'", gbpStatus: "optimized", yelpStatus: "claimed" },
];

const columns: Column<SeoClient>[] = [
  { key: "client", header: "Client" },
  { key: "ranking", header: "Top Keyword" },
  {
    key: "gbpStatus",
    header: "GBP",
    width: "130px",
    render: (value) => {
      const v = String(value);
      const map: Record<string, { variant: "success" | "warning"; label: string }> = {
        optimized: { variant: "success", label: "Optimized" },
        "needs-review": { variant: "warning", label: "Needs Review" },
      };
      const c = map[v] ?? { variant: "neutral" as const, label: v };
      return <StatusBadge variant={c.variant} label={c.label} size="sm" />;
    },
  },
  {
    key: "yelpStatus",
    header: "Yelp",
    width: "110px",
    render: (value) => {
      const v = String(value);
      const map: Record<string, { variant: "success" | "info"; label: string }> = {
        active: { variant: "success", label: "Active" },
        claimed: { variant: "info", label: "Claimed" },
      };
      const c = map[v] ?? { variant: "neutral" as const, label: v };
      return <StatusBadge variant={c.variant} label={c.label} size="sm" />;
    },
  },
];

export default function SeoPage() {
  return (
    <>
      <PageHeader
        title="SEO / GBP / Yelp"
        description="Search engine optimization, Google Business Profile, and Yelp management."
        breadcrumb="Marketing"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard title="Avg. Keyword Position" value="#4.2" trend="up" trendValue="1.3 pos" accentColor="bg-blue-100 dark:bg-blue-900/30" />
        <KpiCard title="GBP Profiles Managed" value="148" trend="up" trendValue="6" accentColor="bg-indigo-100 dark:bg-indigo-900/30" />
        <KpiCard title="Yelp Listings Active" value="102" trend="neutral" accentColor="bg-emerald-100 dark:bg-emerald-900/30" />
      </div>

      <SectionWrapper title="Client SEO Overview" noPadding>
        <DataTable columns={columns} data={clients} />
      </SectionWrapper>
    </>
  );
}
