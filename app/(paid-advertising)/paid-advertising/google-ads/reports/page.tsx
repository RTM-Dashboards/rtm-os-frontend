import DeptReportPage from "@/components/reporting/DeptReportPage";
import { googleAdsDeptReports } from "@/lib/reporting/mock-data";
import { SectionWrapper } from "@/components/ui";

const kpis = [
  { title: "Reports This Month",  value: "3",      iconBg: "#FEF2F2", iconColor: "#DC2626"},
  { title: "Sent",                value: "1",      trend: "up"as const, trendValue: "1",  iconBg: "#ECFDF5", iconColor: "#059669"},
  { title: "In Progress",         value: "1",      iconBg: "#EFF6FF", iconColor: "#2563EB"},
  { title: "Draft",               value: "1",      iconBg: "#FFFBEB", iconColor: "#D97706"},
];

const kpiSections = (
  <SectionWrapper title="Google Ads Report Data Points"description="Metrics included in each Google Ads report">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {[
        { label: "Spend",              desc: "Total Google Ads spend for the period"},
        { label: "Leads",              desc: "Leads generated from Google campaigns"},
        { label: "Calls",              desc: "Calls from call extensions and call ads"},
        { label: "Form Submissions",   desc: "Lead form submissions from Google traffic"},
        { label: "Booked Leads",       desc: "Confirmed bookings from Google Ads"},
        { label: "CPL",               desc: "Cost per lead from Google Ads"},
        { label: "Campaign Health",    desc: "Quality Score, impression share, delivery health"},
      ].map((item) => (
        <div key={item.label} className="p-3 rounded-lg border"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)"}}>
          <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{item.label}</p>
          <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{item.desc}</p>
        </div>
      ))}
    </div>
  </SectionWrapper>
);

export default function GoogleAdsReportsPage() {
  return (
    <DeptReportPage
      title="Google Ads Reports"description="Google Ads report management — source data for Paid Advertising Reporting Workspace."accent="#4285F4"dept="Google Ads"reports={googleAdsDeptReports}
      kpis={kpis}
      reportingWorkspaceHref="/reporting/paid-advertising"kpiSections={kpiSections}
    />
  );
}
