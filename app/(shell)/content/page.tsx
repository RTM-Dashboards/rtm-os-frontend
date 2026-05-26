import { PageHeader, SectionWrapper, KpiCard, StatusBadge, DataTable } from "@/components/ui";
import type { Column } from "@/components/ui";

interface ContentItem extends Record<string, unknown> {
  client: string;
  type: string;
  dueDate: string;
  status: string;
}

const items: ContentItem[] = [
  { client: "Apex Roofing", type: "Blog Post", dueDate: "May 22", status: "in-progress" },
  { client: "Harbor Auto", type: "Social Pack", dueDate: "May 24", status: "review" },
  { client: "Blue Ridge", type: "Email Campaign", dueDate: "May 27", status: "pending" },
  { client: "Pacific Dental", type: "Blog Post", dueDate: "May 30", status: "pending" },
];

const columns: Column<ContentItem>[] = [
  { key: "client", header: "Client" },
  { key: "type", header: "Content Type" },
  { key: "dueDate", header: "Due", width: "100px" },
  {
    key: "status",
    header: "Status",
    render: (value) => {
      const v = String(value);
      const map: Record<string, { variant: "info" | "warning" | "pending" | "success"; label: string }> = {
        "in-progress": { variant: "info", label: "In Progress" },
        review: { variant: "warning", label: "In Review" },
        pending: { variant: "pending", label: "Pending" },
        published: { variant: "success", label: "Published" },
      };
      const c = map[v] ?? { variant: "neutral" as const, label: v };
      return <StatusBadge variant={c.variant} label={c.label} size="sm" />;
    },
  },
];

export default function ContentPage() {
  return (
    <>
      <PageHeader
        title="Content"
        description="Blog posts, social content, email campaigns, and copy."
        breadcrumb="Departments"
        actions={
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
            + New Brief
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard title="In Production" value="28" trend="neutral" accentColor="bg-indigo-100 dark:bg-indigo-900/30" />
        <KpiCard title="Published This Month" value="94" trend="up" trendValue="12%" accentColor="bg-emerald-100 dark:bg-emerald-900/30" />
        <KpiCard title="Avg. Turnaround" value="3.2 days" trend="down" trendValue="0.4d" accentColor="bg-amber-100 dark:bg-amber-900/30" />
      </div>

      <SectionWrapper title="Content Queue" noPadding>
        <DataTable columns={columns} data={items} />
      </SectionWrapper>
    </>
  );
}
