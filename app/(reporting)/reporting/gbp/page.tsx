import ReportingWorkspaceDeptPage from "@/components/reporting/ReportingWorkspaceDeptPage";
import { allClientReports } from "@/lib/reporting/mock-data";
import { SectionWrapper } from "@/components/ui";

const gbpReports = allClientReports.filter((r) => r.dept === "GBP");

const kpis = [
  { title: "Profile Views (Avg)",    value: "2,840", trend: "up"as const,   trendValue: "7%", iconBg: "#ECFDF5", iconColor: "#059669"},
  { title: "Calls (MTD)",            value: "284",   trend: "up"as const,   trendValue: "3%", iconBg: "#EFF6FF", iconColor: "#2563EB"},
  { title: "Direction Requests",     value: "148",   trend: "up"as const,   trendValue: "5%", iconBg: "#FFFBEB", iconColor: "#D97706"},
  { title: "Website Clicks (Avg)",   value: "920",   trend: "up"as const,   trendValue: "4%", iconBg: "#F5F3FF", iconColor: "#7C3AED"},
];

const kpiSections = (
  <SectionWrapper title="GBP Report KPIs"description="Data captured in GBP department reports">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {[
        { label: "Profile Views",      desc: "Total views on Google Business Profile"},
        { label: "Calls",              desc: "Phone calls from GBP profile"},
        { label: "Direction Requests", desc: "Navigation requests from GBP listing"},
        { label: "Website Clicks",     desc: "Clicks to website from GBP profile"},
        { label: "Google Posts",       desc: "Posts published and engagement"},
        { label: "Review Growth",      desc: "New reviews and rating trend"},
        { label: "Local Visibility",   desc: "Local pack rankings and impressions"},
      ].map((item) => (
        <div key={item.label} className="p-3 rounded-lg border"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)"}}>
          <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{item.label}</p>
          <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{item.desc}</p>
        </div>
      ))}
    </div>
  </SectionWrapper>
);

export default function ReportingGBPPage() {
  return (
    <ReportingWorkspaceDeptPage
      title="GBP Reports — Reporting Workspace"description="Compiled Google Business Profile reports ready for QA and client delivery."accent="#059669"dept="GBP"reports={gbpReports}
      kpis={kpis}
      deptSourceHref="/seo-local/gbp/reports"kpiSections={kpiSections}
    />
  );
}
