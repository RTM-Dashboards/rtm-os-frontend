import DeptReportPage from "@/components/reporting/DeptReportPage";
import { gbpDeptReports } from "@/lib/reporting/mock-data";
import { SectionWrapper } from "@/components/ui";

const kpis = [
  { title: "Reports This Month",  value: "4",     iconBg: "#ECFDF5", iconColor: "#059669"},
  { title: "Sent",                value: "1",     trend: "up"as const,   trendValue: "1",   iconBg: "#ECFDF5", iconColor: "#059669"},
  { title: "Overdue",             value: "1",     trend: "up"as const,   trendValue: "1",   iconBg: "#FEF2F2", iconColor: "#DC2626"},
  { title: "Ready to Send",       value: "1",     iconBg: "#FFFBEB", iconColor: "#D97706"},
];

const kpiSections = (
  <SectionWrapper title="GBP Report Data Points"description="Metrics included in each GBP department report">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {[
        { label: "Profile Views",      desc: "Total views on Google Business Profile listing"},
        { label: "Calls",              desc: "Calls tracked from GBP profile"},
        { label: "Direction Requests", desc: "Map directions requested from listing"},
        { label: "Website Clicks",     desc: "Website visits from GBP listing"},
        { label: "Google Posts",       desc: "Posts published and engagement metrics"},
        { label: "Review Growth",      desc: "New reviews received and star rating trend"},
        { label: "Local Visibility",   desc: "Local pack appearance and impressions"},
      ].map((item) => (
        <div key={item.label} className="p-3 rounded-lg border"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)"}}>
          <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{item.label}</p>
          <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{item.desc}</p>
        </div>
      ))}
    </div>
  </SectionWrapper>
);

export default function GBPReportsPage() {
  return (
    <DeptReportPage
      title="GBP Reports"description="Google Business Profile department report management — source data for Reporting Workspace."accent="#059669"dept="GBP"reports={gbpDeptReports}
      kpis={kpis}
      reportingWorkspaceHref="/reporting/gbp"kpiSections={kpiSections}
    />
  );
}
