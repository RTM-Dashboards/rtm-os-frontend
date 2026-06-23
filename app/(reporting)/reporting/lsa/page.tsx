import ReportingWorkspaceDeptPage from "@/components/reporting/ReportingWorkspaceDeptPage";
import { allClientReports } from "@/lib/reporting/mock-data";
import { SectionWrapper } from "@/components/ui";

const lsaReports = allClientReports.filter((r) => r.dept === "LSA");

const kpis = [
  { title: "Total Leads (MTD)",   value: "186",    trend: "up"as const,   trendValue: "5%",  iconBg: "#ECFDF5", iconColor: "#059669"},
  { title: "Calls (MTD)",         value: "174",    trend: "up"as const,   trendValue: "3%",  iconBg: "#EFF6FF", iconColor: "#2563EB"},
  { title: "Booked Leads (MTD)",  value: "62",     trend: "up"as const,   trendValue: "8%",  iconBg: "#F5F3FF", iconColor: "#7C3AED"},
  { title: "Disputed Leads",      value: "9",      trend: "down"as const, trendValue: "2",   iconBg: "#FEF2F2", iconColor: "#DC2626"},
];

const kpiSections = (
  <SectionWrapper title="LSA Report KPIs"description="Data captured in LSA department reports">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {[
        { label: "Leads",                desc: "Total LSA leads for the period"},
        { label: "Calls",                desc: "Calls from LSA profile"},
        { label: "Booked Leads",         desc: "Confirmed bookings from LSA"},
        { label: "Disputed Leads",       desc: "Leads submitted for dispute"},
        { label: "Lead Quality",         desc: "Qualified lead percentage"},
        { label: "Budget Pacing",        desc: "Monthly budget usage and projection"},
        { label: "Service Area Coverage",desc: "Geographic reach and impression share"},
      ].map((item) => (
        <div key={item.label} className="p-3 rounded-lg border"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)"}}>
          <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{item.label}</p>
          <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{item.desc}</p>
        </div>
      ))}
    </div>
  </SectionWrapper>
);

export default function ReportingLSAPage() {
  return (
    <ReportingWorkspaceDeptPage
      title="LSA Reports — Reporting Workspace"description="Compiled Local Service Ads reports ready for QA and client delivery."accent="#B45309"dept="LSA"reports={lsaReports}
      kpis={kpis}
      deptSourceHref="/local-service-ads/reports"kpiSections={kpiSections}
    />
  );
}
