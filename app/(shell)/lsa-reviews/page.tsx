import { PageHeader, SectionWrapper, KpiCard, StatusBadge, DataTable } from "@/components/ui";
import type { Column } from "@/components/ui";

interface ReviewItem extends Record<string, unknown> {
  client: string;
  platform: string;
  rating: string;
  response: string;
}

const reviews: ReviewItem[] = [
  { client: "Apex Roofing", platform: "Google", rating: "⭐ 5.0 (142 reviews)", response: "responded" },
  { client: "Sunbelt HVAC", platform: "LSA", rating: "⭐ 4.8 (89 reviews)", response: "pending" },
  { client: "Blue Ridge Plumbing", platform: "Google", rating: "⭐ 4.6 (55 reviews)", response: "pending" },
  { client: "Pacific Dental", platform: "Yelp", rating: "⭐ 4.9 (203 reviews)", response: "responded" },
];

const columns: Column<ReviewItem>[] = [
  { key: "client", header: "Client" },
  { key: "platform", header: "Platform", width: "100px" },
  { key: "rating", header: "Rating" },
  {
    key: "response",
    header: "Response",
    width: "130px",
    render: (value) => {
      const v = String(value);
      const map: Record<string, { variant: "success" | "warning"; label: string }> = {
        responded: { variant: "success", label: "Responded" },
        pending: { variant: "warning", label: "Needs Reply" },
      };
      const c = map[v] ?? { variant: "neutral" as const, label: v };
      return <StatusBadge variant={c.variant} label={c.label} size="sm" />;
    },
  },
];

export default function LsaReviewsPage() {
  return (
    <>
      <PageHeader
        title="LSA & Reviews"
        description="Local Services Ads and online review management."
        breadcrumb="Marketing"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard title="Avg. Star Rating" value="4.82 ⭐" trend="up" trendValue="0.04" accentColor="bg-amber-100 dark:bg-amber-900/30" />
        <KpiCard title="Reviews This Month" value="214" trend="up" trendValue="22%" accentColor="bg-emerald-100 dark:bg-emerald-900/30" />
        <KpiCard title="Pending Responses" value="18" trend="down" trendValue="5" accentColor="bg-red-100 dark:bg-red-900/30" />
      </div>

      <SectionWrapper title="Review Management" noPadding>
        <DataTable columns={columns} data={reviews} />
      </SectionWrapper>
    </>
  );
}
