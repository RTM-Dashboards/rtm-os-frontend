import DeptReportPage from "@/components/reporting/DeptReportPage";
import { metaAdsDeptReports } from "@/lib/reporting/mock-data";
import { SectionWrapper } from "@/components/ui";

const kpis = [
  { title: "Reports This Month",  value: "3",      iconBg: "#FEF2F2", iconColor: "#DC2626" },
  { title: "Sent",                value: "1",      trend: "up" as const, trendValue: "1",  iconBg: "#ECFDF5", iconColor: "#059669" },
  { title: "QA In Progress",      value: "1",      iconBg: "#FFFBEB", iconColor: "#D97706" },
  { title: "In Progress",         value: "1",      iconBg: "#EFF6FF", iconColor: "#2563EB" },
];

const kpiSections = (
  <SectionWrapper title="Meta Ads Report Data Points" description="Metrics included in each Meta Ads report">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {[
        { label: "Spend",              desc: "Total Meta Ads spend for the period" },
        { label: "Leads",              desc: "Leads generated from Meta campaigns" },
        { label: "Calls",              desc: "Calls attributed to Meta Ads" },
        { label: "Form Submissions",   desc: "Lead form and instant form submissions" },
        { label: "Booked Leads",       desc: "Confirmed bookings from Meta traffic" },
        { label: "CPL",               desc: "Cost per lead from Meta Ads" },
        { label: "Campaign Health",    desc: "Ad set performance and delivery health" },
      ].map((item) => (
        <div key={item.label} className="p-3 rounded-lg border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{item.label}</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{item.desc}</p>
        </div>
      ))}
    </div>
  </SectionWrapper>
);

export default function MetaAdsReportsPage() {
  return (
    <DeptReportPage
      title="Meta Ads Reports"
      description="Meta Ads report management — source data for Paid Advertising Reporting Workspace."
      accent="#1877F2"
      dept="Meta Ads"
      reports={metaAdsDeptReports}
      kpis={kpis}
      reportingWorkspaceHref="/reporting/paid-advertising"
      kpiSections={kpiSections}
    />
  );
}
