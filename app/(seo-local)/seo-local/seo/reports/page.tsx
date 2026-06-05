import DeptReportPage from "@/components/reporting/DeptReportPage";
import { seoDeptReports } from "@/lib/reporting/mock-data";
import { SectionWrapper } from "@/components/ui";

const kpis = [
  { title: "Reports This Month",  value: "5",     iconBg: "#EFF6FF", iconColor: "#2563EB" },
  { title: "Sent",                value: "1",     trend: "up" as const,   trendValue: "1",   iconBg: "#ECFDF5", iconColor: "#059669" },
  { title: "Ready for QA",        value: "1",     iconBg: "#FFFBEB", iconColor: "#D97706" },
  { title: "Overdue",             value: "0",     iconBg: "#FEF2F2", iconColor: "#DC2626" },
];

const kpiSections = (
  <SectionWrapper title="SEO Report Data Points" description="Metrics included in each SEO department report">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {[
        { label: "Keyword Ranking Summary",    desc: "Top keyword positions and MoM changes" },
        { label: "Organic Traffic Summary",     desc: "Sessions, users, bounce rate from search" },
        { label: "Organic Leads",               desc: "Calls and form fills from organic traffic" },
        { label: "Booked Leads",                desc: "Confirmed bookings from organic" },
        { label: "Technical SEO Health",        desc: "Crawl errors, Core Web Vitals, speed" },
        { label: "Content Performance Summary", desc: "Blog and landing page impact" },
        { label: "Recommendations",            desc: "Next month SEO action plan" },
      ].map((item) => (
        <div key={item.label} className="p-3 rounded-lg border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{item.label}</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{item.desc}</p>
        </div>
      ))}
    </div>
  </SectionWrapper>
);

export default function SEOReportsPage() {
  return (
    <DeptReportPage
      title="SEO Reports"
      description="SEO department report management — source data for Reporting Workspace."
      accent="#2563EB"
      dept="SEO"
      reports={seoDeptReports}
      kpis={kpis}
      reportingWorkspaceHref="/reporting/seo"
      kpiSections={kpiSections}
    />
  );
}
