import ReportingWorkspaceDeptPage from "@/components/reporting/ReportingWorkspaceDeptPage";
import { allClientReports } from "@/lib/reporting/mock-data";
import { SectionWrapper } from "@/components/ui";

const seoReports = allClientReports.filter((r) => r.dept === "SEO");

const kpis = [
  { title: "Keyword Rankings Tracked", value: "1,240", trend: "up"as const,   trendValue: "8%",  iconBg: "#EFF6FF", iconColor: "#2563EB"},
  { title: "Organic Traffic (Avg)",    value: "3,820", trend: "up"as const,   trendValue: "12%", iconBg: "#ECFDF5", iconColor: "#059669"},
  { title: "Organic Leads (MTD)",      value: "142",   trend: "up"as const,   trendValue: "6%",  iconBg: "#F5F3FF", iconColor: "#7C3AED"},
  { title: "Booked Leads (MTD)",       value: "38",    trend: "up"as const,   trendValue: "4%",  iconBg: "#FFFBEB", iconColor: "#D97706"},
];

const kpiSections = (
  <SectionWrapper title="SEO Report KPIs"description="Data captured in SEO department reports">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {[
        { label: "Keyword Ranking Summary",      desc: "Top keyword movements and position changes"},
        { label: "Organic Traffic Summary",       desc: "Sessions, users, and engagement from search"},
        { label: "Organic Leads",                 desc: "Form submissions and calls from organic"},
        { label: "Booked Leads",                  desc: "Confirmed booked appointments via organic"},
        { label: "Technical SEO Health",          desc: "Site errors, speed, crawl issues"},
        { label: "Content Performance Summary",   desc: "Blog, page, and content impact"},
        { label: "Recommendations",              desc: "Month-over-month action items"},
      ].map((item) => (
        <div key={item.label} className="p-3 rounded-lg border"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)"}}>
          <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{item.label}</p>
          <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{item.desc}</p>
        </div>
      ))}
    </div>
  </SectionWrapper>
);

export default function ReportingSEOPage() {
  return (
    <ReportingWorkspaceDeptPage
      title="SEO Reports — Reporting Workspace"description="Compiled SEO department reports ready for QA and client delivery."accent="#2563EB"dept="SEO"reports={seoReports}
      kpis={kpis}
      deptSourceHref="/seo-local/seo/reports"kpiSections={kpiSections}
    />
  );
}
