import ReportingWorkspaceDeptPage from "@/components/reporting/ReportingWorkspaceDeptPage";
import { allClientReports } from "@/lib/reporting/mock-data";
import { SectionWrapper } from "@/components/ui";

const paidReports = allClientReports.filter((r) => r.dept === "Paid Advertising");

const kpis = [
  { title: "Total Spend (MTD)",    value: "$28,400", trend: "up"as const,   trendValue: "5%",  iconBg: "#FEF2F2", iconColor: "#DC2626"},
  { title: "Total Leads (MTD)",    value: "312",     trend: "up"as const,   trendValue: "9%",  iconBg: "#ECFDF5", iconColor: "#059669"},
  { title: "Avg CPL",              value: "$91",     trend: "down"as const, trendValue: "4%",  iconBg: "#FFFBEB", iconColor: "#D97706"},
  { title: "Booked Leads (MTD)",   value: "84",      trend: "up"as const,   trendValue: "7%",  iconBg: "#F5F3FF", iconColor: "#7C3AED"},
];

const kpiSections = (
  <SectionWrapper title="Paid Advertising Report KPIs"description="Data captured in paid advertising reports">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {[
        { label: "Spend",                     desc: "Total ad spend for the reporting period"},
        { label: "Leads",                     desc: "Total leads generated from paid campaigns"},
        { label: "Calls",                     desc: "Phone calls attributed to paid ads"},
        { label: "Form Submissions",          desc: "Form fills from paid ad traffic"},
        { label: "Booked Leads",              desc: "Confirmed booked appointments"},
        { label: "CPL",                       desc: "Cost per lead across all campaigns"},
        { label: "Cost Per Qualified Lead",   desc: "Cost per lead meeting quality threshold"},
        { label: "Campaign Health",           desc: "Overall campaign performance score"},
        { label: "Meta Ads Summary",          desc: "Meta-specific campaign results"},
        { label: "Google Ads Summary",        desc: "Google Ads campaign results"},
      ].map((item) => (
        <div key={item.label} className="p-3 rounded-lg border"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)"}}>
          <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{item.label}</p>
          <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{item.desc}</p>
        </div>
      ))}
    </div>
  </SectionWrapper>
);

export default function ReportingPaidAdsPage() {
  return (
    <ReportingWorkspaceDeptPage
      title="Paid Advertising Reports — Reporting Workspace"description="Compiled paid advertising reports ready for QA and client delivery."accent="#DC2626"dept="Paid Advertising"reports={paidReports}
      kpis={kpis}
      deptSourceHref="/paid-advertising/reports"kpiSections={kpiSections}
    />
  );
}
