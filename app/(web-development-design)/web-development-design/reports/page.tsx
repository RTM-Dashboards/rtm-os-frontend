import DeptReportPage from "@/components/reporting/DeptReportPage";
import { webDevDeptReports } from "@/lib/reporting/mock-data";
import { SectionWrapper } from "@/components/ui";

const kpis = [
  { title: "Reports This Month",  value: "5",     iconBg: "#ECEFF4", iconColor: "#0891B2"},
  { title: "Sent",                value: "1",     trend: "up"as const,   trendValue: "1",   iconBg: "#ECFDF5", iconColor: "#059669"},
  { title: "Ready for QA",        value: "1",     iconBg: "#FFFBEB", iconColor: "#D97706"},
  { title: "Overdue",             value: "1",     iconBg: "#FEF2F2", iconColor: "#DC2626"},
];

const kpiSections = (
  <SectionWrapper
    title="Web Dev & Design Report Data Points"
    description="Metrics included in each Web Development & Design department report"
  >
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {[
        { label: "Project Milestones",      desc: "Key deliverables completed vs planned"},
        { label: "Pages / Screens Built",   desc: "New pages, templates, and components delivered"},
        { label: "Design Assets Delivered", desc: "Logos, brand assets, graphics, and creative files"},
        { label: "QA & Review Rounds",      desc: "Revision cycles and client approval status"},
        { label: "Performance Scores",      desc: "Core Web Vitals and Lighthouse results post-launch"},
        { label: "Open Action Items",       desc: "Blocked items, outstanding approvals, next steps"},
        { label: "Recommendations",         desc: "Next-sprint priorities and proposed improvements"},
      ].map((item) => (
        <div
          key={item.label}
          className="p-3 rounded-lg border"
          style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)" }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
            {item.label}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
            {item.desc}
          </p>
        </div>
      ))}
    </div>
  </SectionWrapper>
);

export default function WebDevReportsPage() {
  return (
    <DeptReportPage
      title="Web Dev & Design Reports"
      description="Web Development & Design department report management — source data for Reporting Workspace."
      accent="#0891B2"
      dept="Web Dev & Design"
      reports={webDevDeptReports}
      kpis={kpis}
      reportingWorkspaceHref="/reporting"
      kpiSections={kpiSections}
    />
  );
}
