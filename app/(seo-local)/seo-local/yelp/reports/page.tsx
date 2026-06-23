import DeptReportPage from "@/components/reporting/DeptReportPage";
import { yelpDeptReports } from "@/lib/reporting/mock-data";
import { SectionWrapper } from "@/components/ui";

const kpis = [
  { title: "Reports This Month",  value: "3",     iconBg: "#FFFBEB", iconColor: "#D97706"},
  { title: "Sent",                value: "1",     trend: "up"as const,   trendValue: "1",   iconBg: "#ECFDF5", iconColor: "#059669"},
  { title: "Overdue",             value: "1",     trend: "up"as const,   trendValue: "1",   iconBg: "#FEF2F2", iconColor: "#DC2626"},
  { title: "In Progress",         value: "1",     iconBg: "#EFF6FF", iconColor: "#2563EB"},
];

const kpiSections = (
  <SectionWrapper title="Yelp Report Data Points"description="Metrics included in each Yelp department report">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {[
        { label: "Profile Views",    desc: "Total views on Yelp business listing"},
        { label: "Clicks",           desc: "User actions on the Yelp profile"},
        { label: "Leads",            desc: "Inquiries and contacts generated via Yelp"},
        { label: "Booked Leads",     desc: "Confirmed bookings from Yelp traffic"},
        { label: "Listing Health",   desc: "Profile completeness and business info accuracy"},
        { label: "Review Visibility",desc: "Total reviews, rating, and trend"},
      ].map((item) => (
        <div key={item.label} className="p-3 rounded-lg border"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)"}}>
          <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{item.label}</p>
          <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{item.desc}</p>
        </div>
      ))}
    </div>
  </SectionWrapper>
);

export default function YelpReportsPage() {
  return (
    <DeptReportPage
      title="Yelp Reports"description="Yelp department report management — source data for Reporting Workspace."accent="#D97706"dept="Yelp"reports={yelpDeptReports}
      kpis={kpis}
      reportingWorkspaceHref="/reporting/yelp"kpiSections={kpiSections}
    />
  );
}
