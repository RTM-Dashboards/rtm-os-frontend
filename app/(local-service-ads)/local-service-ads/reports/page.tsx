import DeptReportPage from "@/components/reporting/DeptReportPage";
import { lsaDeptReports } from "@/lib/reporting/mock-data";
import { SectionWrapper } from "@/components/ui";

const kpis = [
  { title: "Reports This Month",  value: "4",      iconBg: "#FFFBEB", iconColor: "#B45309" },
  { title: "Sent",                value: "1",      trend: "up" as const, trendValue: "1",  iconBg: "#ECFDF5", iconColor: "#059669" },
  { title: "Needs Revision",      value: "1",      iconBg: "#FEF2F2", iconColor: "#DC2626" },
  { title: "In Progress / Draft", value: "2",      iconBg: "#EFF6FF", iconColor: "#2563EB" },
];

const kpiSections = (
  <SectionWrapper title="LSA Report Data Points" description="Metrics included in each LSA department report">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {[
        { label: "Leads",                desc: "Total LSA leads for the reporting period" },
        { label: "Calls",                desc: "Calls received via LSA profile" },
        { label: "Booked Leads",         desc: "Confirmed bookings from LSA leads" },
        { label: "Disputed Leads",       desc: "Leads submitted for dispute resolution" },
        { label: "Lead Quality",         desc: "Qualified lead percentage and quality score" },
        { label: "Budget Pacing",        desc: "Monthly budget usage rate and projection" },
        { label: "Service Area Coverage",desc: "Geographic coverage and impression share" },
      ].map((item) => (
        <div key={item.label} className="p-3 rounded-lg border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{item.label}</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{item.desc}</p>
        </div>
      ))}
    </div>
  </SectionWrapper>
);

export default function LSAReportsPage() {
  return (
    <DeptReportPage
      title="LSA Reports"
      description="Local Service Ads report management — source data for Reporting Workspace."
      accent="#B45309"
      dept="LSA"
      reports={lsaDeptReports}
      kpis={kpis}
      reportingWorkspaceHref="/reporting/lsa"
      kpiSections={kpiSections}
    />
  );
}
