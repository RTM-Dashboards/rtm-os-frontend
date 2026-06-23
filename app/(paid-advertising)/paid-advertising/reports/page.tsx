import DeptReportPage from "@/components/reporting/DeptReportPage";
import { paidAdsDeptReports } from "@/lib/reporting/mock-data";
import { SectionWrapper } from "@/components/ui";

const kpis = [
  { title: "Reports This Month",  value: "4",       iconBg: "#FEF2F2", iconColor: "#DC2626"},
  { title: "Sent",                value: "1",       trend: "up"as const,   trendValue: "1",   iconBg: "#ECFDF5", iconColor: "#059669"},
  { title: "QA In Progress",      value: "1",       iconBg: "#FFFBEB", iconColor: "#D97706"},
  { title: "In Progress / Draft", value: "2",       iconBg: "#EFF6FF", iconColor: "#2563EB"},
];

const kpiSections = (
  <SectionWrapper title="Paid Advertising Report Data Points"description="Metrics included in each Paid Advertising department report">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {[
        { label: "Spend",                   desc: "Total ad spend for the reporting period"},
        { label: "Leads",                   desc: "Total leads generated from paid campaigns"},
        { label: "Calls",                   desc: "Phone calls attributed to paid ads"},
        { label: "Form Submissions",        desc: "Form fills from paid ad traffic"},
        { label: "Booked Leads",            desc: "Confirmed booked appointments"},
        { label: "CPL",                     desc: "Cost per lead across all campaigns"},
        { label: "Cost Per Qualified Lead", desc: "Cost per qualified lead"},
        { label: "Campaign Health",         desc: "Overall campaign performance and health score"},
        { label: "Meta Ads Summary",        desc: "Meta-specific campaign performance results"},
        { label: "Google Ads Summary",      desc: "Google Ads campaign performance results"},
      ].map((item) => (
        <div key={item.label} className="p-3 rounded-lg border"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)"}}>
          <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{item.label}</p>
          <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{item.desc}</p>
        </div>
      ))}
    </div>
  </SectionWrapper>
);

export default function PaidAdsReportsPage() {
  return (
    <DeptReportPage
      title="Paid Advertising Reports"description="Paid advertising department report management — source data for Reporting Workspace."accent="#DC2626"dept="Paid Advertising"reports={paidAdsDeptReports}
      kpis={kpis}
      reportingWorkspaceHref="/reporting/paid-advertising"kpiSections={kpiSections}
    />
  );
}
