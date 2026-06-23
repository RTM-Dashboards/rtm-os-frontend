import ReportingWorkspaceDeptPage from "@/components/reporting/ReportingWorkspaceDeptPage";
import { allClientReports } from "@/lib/reporting/mock-data";
import { SectionWrapper } from "@/components/ui";

const yelpReports = allClientReports.filter((r) => r.dept === "Yelp");

const kpis = [
  { title: "Profile Views (Avg)",  value: "1,620", trend: "up"as const,   trendValue: "4%", iconBg: "#FFFBEB", iconColor: "#D97706"},
  { title: "Clicks (MTD)",         value: "340",   trend: "up"as const,   trendValue: "6%", iconBg: "#EFF6FF", iconColor: "#2563EB"},
  { title: "Leads (MTD)",          value: "92",    trend: "up"as const,   trendValue: "3%", iconBg: "#ECFDF5", iconColor: "#059669"},
  { title: "Booked Leads (MTD)",   value: "28",    trend: "up"as const,   trendValue: "2%", iconBg: "#F5F3FF", iconColor: "#7C3AED"},
];

const kpiSections = (
  <SectionWrapper title="Yelp Report KPIs"description="Data captured in Yelp department reports">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {[
        { label: "Profile Views",    desc: "Total views on Yelp business page"},
        { label: "Clicks",           desc: "User actions and profile clicks"},
        { label: "Leads",            desc: "Inquiries and contacts via Yelp"},
        { label: "Booked Leads",     desc: "Confirmed bookings from Yelp traffic"},
        { label: "Listing Health",   desc: "Profile completeness and accuracy"},
        { label: "Review Visibility",desc: "Review count, rating, and trend"},
      ].map((item) => (
        <div key={item.label} className="p-3 rounded-lg border"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)"}}>
          <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{item.label}</p>
          <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{item.desc}</p>
        </div>
      ))}
    </div>
  </SectionWrapper>
);

export default function ReportingYelpPage() {
  return (
    <ReportingWorkspaceDeptPage
      title="Yelp Reports — Reporting Workspace"description="Compiled Yelp department reports ready for QA and client delivery."accent="#D97706"dept="Yelp"reports={yelpReports}
      kpis={kpis}
      deptSourceHref="/seo-local/yelp/reports"kpiSections={kpiSections}
    />
  );
}
