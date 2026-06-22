"use client";

import { useState, useMemo } from "react";
import {
  CLIENT_HEALTH_RECORDS,
  INTERVENTION_QUEUE,
  computePortfolioSummary,
  type ClientHealthRecord,
  type HealthStatus,
  type RiskLevel,
} from "@/lib/account-management/client-health-data";

// ══════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ══════════════════════════════════════════════════════════════════════════════

function scoreColor(score: number) {
  if (score >= 80) return "#059669";
  if (score >= 60) return "#D97706";
  if (score >= 40) return "#EA580C";
  return "#DC2626";
}

function scoreBg(score: number) {
  if (score >= 80) return { bg: "#ECFDF5", border: "#A7F3D0", text: "#059669" };
  if (score >= 60) return { bg: "#FFFBEB", border: "#FDE68A", text: "#B45309" };
  if (score >= 40) return { bg: "#FFF7ED", border: "#FED7AA", text: "#C2410C" };
  return { bg: "#FEF2F2", border: "#FECACA", text: "#DC2626" };
}

function healthStatusStyle(status: HealthStatus) {
  switch (status) {
    case "Healthy":  return { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0", dot: "#10B981" };
    case "Monitor":  return { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A", dot: "#F59E0B" };
    case "At Risk":  return { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA", dot: "#F97316" };
    case "Critical": return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", dot: "#EF4444" };
  }
}

function riskStyle(risk: RiskLevel) {
  switch (risk) {
    case "Low":      return { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" };
    case "Medium":   return { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" };
    case "High":     return { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" };
    case "Critical": return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
  }
}

function fmt$(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

// ══════════════════════════════════════════════════════════════════════════════
// SHARED ATOMS
// ══════════════════════════════════════════════════════════════════════════════

function Badge({ label, bg, color, border, dot }: { label: string; bg: string; color: string; border: string; dot?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border whitespace-nowrap"
      style={{ background: bg, color, borderColor: border }}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dot }} />}
      {label}
    </span>
  );
}

function HealthBadge({ status }: { status: HealthStatus }) {
  const s = healthStatusStyle(status);
  return <Badge label={status} bg={s.bg} color={s.color} border={s.border} dot={s.dot} />;
}

function RiskBadge({ risk }: { risk: RiskLevel }) {
  const s = riskStyle(risk);
  return <Badge label={risk} bg={s.bg} color={s.color} border={s.border} />;
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  const c = scoreColor(score);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{label}</span>
        <span className="text-xs font-bold" style={{ color: c }}>{score}</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: "var(--rtm-border)" }}>
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${score}%`, background: c }}
        />
      </div>
    </div>
  );
}

function SectionCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div
      className="rounded-xl border"
      style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", boxShadow: "0 1px 3px rgba(15,28,56,0.05)" }}
    >
      <div
        className="flex items-center justify-between px-5 py-3.5 border-b"
        style={{ borderColor: "var(--rtm-border)" }}
      >
        <h3 className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{title}</h3>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Stat({ label, value, sub, valueColor }: { label: string; value: string | number; sub?: string; valueColor?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{label}</span>
      <span className="text-xl font-bold" style={{ color: valueColor ?? "var(--rtm-text-primary)" }}>{value}</span>
      {sub && <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{sub}</span>}
    </div>
  );
}

function DataRow({ label, value, valueEl }: { label: string; value?: string | number; valueEl?: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-between gap-2 py-2 border-b last:border-0"
      style={{ borderColor: "var(--rtm-border-light)" }}
    >
      <span className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{label}</span>
      {valueEl ?? <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{value}</span>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// KPI CARD
// ══════════════════════════════════════════════════════════════════════════════

function KpiCard({
  label, value, sub, accent, icon,
}: {
  label: string; value: string | number; sub?: string; accent?: string; icon?: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-3"
      style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", boxShadow: "0 1px 3px rgba(15,28,56,0.05)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{label}</p>
          <p className="mt-1.5 text-2xl font-bold" style={{ color: accent ?? "var(--rtm-text-primary)" }}>{value}</p>
          {sub && <p className="mt-0.5 text-xs" style={{ color: "var(--rtm-text-muted)" }}>{sub}</p>}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
            style={{ background: "var(--rtm-blue-xlight)", color: "var(--rtm-blue)" }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// HEALTH SCORE GAUGE
// ══════════════════════════════════════════════════════════════════════════════

function HealthScoreGauge({ score }: { score: number }) {
  const c = scoreColor(score);
  const palette = scoreBg(score);
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border p-6 gap-2"
      style={{ background: palette.bg, borderColor: palette.border }}
    >
      <span className="text-5xl font-extrabold leading-none" style={{ color: palette.text }}>{score}</span>
      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: palette.text }}>Overall Health Score</span>
      <div className="w-full h-2 rounded-full mt-1" style={{ background: "rgba(0,0,0,0.08)" }}>
        <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${score}%`, background: c }} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// HEALTH SCORE BREAKDOWN PANEL
// ══════════════════════════════════════════════════════════════════════════════

const SCORE_WEIGHTS = [
  { key: "projectHealth",       label: "Project Health",       weight: "25%" },
  { key: "communicationHealth", label: "Communication Health", weight: "20%" },
  { key: "billingHealth",       label: "Billing Health",       weight: "20%" },
  { key: "reportingHealth",     label: "Reporting Health",     weight: "10%" },
  { key: "callIntelligence",    label: "Call Intelligence",    weight: "10%" },
  { key: "escalationHealth",    label: "Escalation Health",    weight: "10%" },
  { key: "clientEngagement",    label: "Client Engagement",    weight: "5%"  },
] as const;

type ScoreKey = typeof SCORE_WEIGHTS[number]["key"];

function HealthScoreBreakdownPanel({ record }: { record: ClientHealthRecord }) {
  return (
    <SectionCard title="Health Score Model">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <HealthScoreGauge score={record.healthScore.overall} />
        <div className="flex flex-col gap-3">
          {SCORE_WEIGHTS.map(({ key, label, weight }) => (
            <div key={key} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                  {label}
                  <span className="ml-1 text-xs" style={{ color: "var(--rtm-text-muted)" }}>({weight})</span>
                </span>
                <span className="text-xs font-bold" style={{ color: scoreColor(record.healthScore[key as ScoreKey]) }}>
                  {record.healthScore[key as ScoreKey]}
                </span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: "var(--rtm-border)" }}>
                <div
                  className="h-1.5 rounded-full"
                  style={{
                    width: `${record.healthScore[key as ScoreKey]}%`,
                    background: scoreColor(record.healthScore[key as ScoreKey]),
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PROJECT HEALTH SIGNALS
// ══════════════════════════════════════════════════════════════════════════════

function projectStatusStyle(s: string) {
  switch (s) {
    case "On Track": return { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" };
    case "Monitor":  return { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" };
    case "Delayed":  return { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" };
    case "Blocked":  return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
    default:         return { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" };
  }
}

function ProjectHealthPanel({ record }: { record: ClientHealthRecord }) {
  const s = record.projectSignals;
  const pStyle = projectStatusStyle(s.projectStatus);
  return (
    <SectionCard title="Project Health Signals">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
        <Stat label="Milestone Completion" value={`${s.milestoneCompletion}%`} valueColor={scoreColor(s.milestoneCompletion)} />
        <Stat label="Task Completion" value={`${s.taskCompletion}%`} valueColor={scoreColor(s.taskCompletion)} />
        <Stat label="Project Risk Score" value={s.projectRiskScore} valueColor={s.projectRiskScore >= 60 ? "#DC2626" : s.projectRiskScore >= 30 ? "#D97706" : "#059669"} sub="0 = no risk" />
        <Stat label="Blocked Tasks" value={s.blockedTasks} valueColor={s.blockedTasks > 0 ? "#DC2626" : "#059669"} />
        <Stat label="Delayed Deliverables" value={s.delayedDeliverables} valueColor={s.delayedDeliverables > 0 ? "#D97706" : "#059669"} />
        <Stat label="Open Dependencies" value={s.openDependencies} valueColor={s.openDependencies > 0 ? "#D97706" : "#059669"} />
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <Badge label={s.projectStatus} bg={pStyle.bg} color={pStyle.color} border={pStyle.border} />
        {s.departmentDelays.length > 0 && s.departmentDelays.map(d => (
          <Badge key={d} label={`${d} delay`} bg="#FEF2F2" color="#DC2626" border="#FECACA" />
        ))}
        {s.departmentDelays.length === 0 && (
          <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>No department delays</span>
        )}
      </div>
    </SectionCard>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// COMMUNICATION HEALTH
// ══════════════════════════════════════════════════════════════════════════════

function commStatusStyle(s: string) {
  switch (s) {
    case "Strong": return { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" };
    case "Good":   return { bg: "#F0FDF9", color: "#0D9488", border: "#99F6E4" };
    case "Weak":   return { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" };
    case "Poor":   return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
    default:       return { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" };
  }
}

function CommunicationHealthPanel({ record }: { record: ClientHealthRecord }) {
  const s = record.communicationSignals;
  const cs = commStatusStyle(s.communicationStatus);
  return (
    <SectionCard title="Communication Health">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
        <Stat label="Last Contact" value={s.lastContact} sub={`${s.daysSinceContact} days ago`} />
        <Stat label="Avg Response Time" value={`${s.avgResponseTimeHours}h`} valueColor={s.avgResponseTimeHours <= 8 ? "#059669" : s.avgResponseTimeHours <= 24 ? "#D97706" : "#DC2626"} />
        <Stat label="Pending Follow-Ups" value={s.pendingFollowUps} valueColor={s.pendingFollowUps > 0 ? "#D97706" : "#059669"} />
        <Stat label="Open Concerns" value={s.openConcerns} valueColor={s.openConcerns > 0 ? "#DC2626" : "#059669"} />
        <Stat label="Meeting Frequency" value={s.meetingFrequency} />
        <Stat label="Communication Score" value={s.communicationScore} valueColor={scoreColor(s.communicationScore)} />
      </div>
      <Badge label={s.communicationStatus} bg={cs.bg} color={cs.color} border={cs.border} />
    </SectionCard>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CALL INTELLIGENCE
// ══════════════════════════════════════════════════════════════════════════════

function sentimentStyle(s: string) {
  switch (s) {
    case "Positive": return { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" };
    case "Neutral":  return { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" };
    case "Negative": return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
    case "Mixed":    return { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" };
    default:         return { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" };
  }
}

function CallIntelPanel({ record }: { record: ClientHealthRecord }) {
  const s = record.callIntelSignals;
  const ss = sentimentStyle(s.callSentiment);
  const trendStyle = s.leadQualityTrend === "Improving" ? "#059669" : s.leadQualityTrend === "Stable" ? "#64748B" : "#DC2626";
  return (
    <SectionCard title="Call Intelligence Signals">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
        <Stat label="Total Calls" value={s.totalCalls} />
        <Stat label="Qualified Leads" value={s.qualifiedLeads} />
        <Stat label="Booked Leads" value={s.bookedLeads} />
        <Stat label="Missed Opportunities" value={s.missedOpportunities} valueColor={s.missedOpportunities > 5 ? "#DC2626" : s.missedOpportunities > 2 ? "#D97706" : "#059669"} />
        <Stat label="Complaint Trends" value={s.complaintTrends} valueColor={s.complaintTrends > 0 ? "#DC2626" : "#059669"} />
        <Stat label="Service Requests" value={s.serviceRequests} />
        <Stat label="Renewal Signals" value={s.renewalSignals} valueColor={s.renewalSignals > 0 ? "#059669" : "#64748B"} />
        <Stat label="Upsell Signals" value={s.upsellSignals} valueColor={s.upsellSignals > 0 ? "#2563EB" : "#64748B"} />
        <Stat label="Call Quality Score" value={s.callQualityScore} valueColor={scoreColor(s.callQualityScore)} />
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <Badge label={`Sentiment: ${s.callSentiment}`} bg={ss.bg} color={ss.color} border={ss.border} />
        <Badge
          label={`Lead Quality: ${s.leadQualityTrend}`}
          bg={s.leadQualityTrend === "Improving" ? "#ECFDF5" : s.leadQualityTrend === "Stable" ? "#F8FAFC" : "#FEF2F2"}
          color={trendStyle}
          border={s.leadQualityTrend === "Improving" ? "#A7F3D0" : s.leadQualityTrend === "Stable" ? "#E2E8F0" : "#FECACA"}
        />
      </div>
    </SectionCard>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// REPORTING HEALTH
// ══════════════════════════════════════════════════════════════════════════════

function ReviewStatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    "Reviewed":        { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" },
    "Pending Review":  { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" },
    "Not Reviewed":    { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" },
    "Overdue":         { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  };
  const s = map[status] ?? { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" };
  return <Badge label={status} bg={s.bg} color={s.color} border={s.border} />;
}

function ReportingHealthPanel({ record }: { record: ClientHealthRecord }) {
  const s = record.reportingSignals;
  const fbStyle = sentimentStyle(s.clientFeedback);
  return (
    <SectionCard title="Reporting Health">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
        <Stat label="Reports Delivered" value={s.reportsDelivered} />
        <Stat label="Reports Missed" value={s.reportsMissed} valueColor={s.reportsMissed > 0 ? "#DC2626" : "#059669"} />
        <Stat label="Last Report" value={s.lastReportDate} />
        <Stat label="Reporting Score" value={s.reportingScore} valueColor={scoreColor(s.reportingScore)} />
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <ReviewStatusBadge status={s.reviewStatus} />
        <Badge label={`Client Feedback: ${s.clientFeedback}`} bg={fbStyle.bg} color={fbStyle.color} border={fbStyle.border} />
      </div>
    </SectionCard>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// BILLING HEALTH
// ══════════════════════════════════════════════════════════════════════════════

function billingStatusStyle(s: string) {
  switch (s) {
    case "Current": return { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" };
    case "Overdue": return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
    case "At Risk": return { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" };
    case "Failed":  return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
    case "Hold":    return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
    default:        return { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" };
  }
}

function BillingHealthPanel({ record }: { record: ClientHealthRecord }) {
  const s = record.billingSignals;
  const bs = billingStatusStyle(s.billingStatus);
  return (
    <SectionCard title="Billing Health">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
        <Stat label="MRR" value={fmt$(s.mrr)} />
        <Stat label="ARR" value={fmt$(s.arr)} />
        <Stat label="Outstanding Invoices" value={s.outstandingInvoices} valueColor={s.outstandingInvoices > 0 ? "#DC2626" : "#059669"} />
        <Stat label="Days Overdue" value={s.daysOverdue} valueColor={s.daysOverdue > 0 ? "#DC2626" : "#059669"} />
        <Stat label="Billing Score" value={s.billingScore} valueColor={scoreColor(s.billingScore)} />
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <Badge label={s.billingStatus} bg={bs.bg} color={bs.color} border={bs.border} />
        {s.billingHolds && <Badge label="Billing Hold Active" bg="#FEF2F2" color="#DC2626" border="#FECACA" />}
        {s.collectionActivity && <Badge label="Collection Activity" bg="#FFF7ED" color="#C2410C" border="#FED7AA" />}
      </div>
    </SectionCard>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ESCALATION HEALTH
// ══════════════════════════════════════════════════════════════════════════════

function escalationSeverityStyle(s: string) {
  switch (s) {
    case "None":     return { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" };
    case "Low":      return { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" };
    case "Medium":   return { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" };
    case "High":     return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
    case "Critical": return { bg: "#FEF2F2", color: "#7F1D1D", border: "#FECACA" };
    default:         return { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" };
  }
}

function EscalationHealthPanel({ record }: { record: ClientHealthRecord }) {
  const s = record.escalationSignals;
  const es = escalationSeverityStyle(s.escalationSeverity);
  return (
    <SectionCard title="Escalation Health">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
        <Stat label="Open Escalations" value={s.openEscalations} valueColor={s.openEscalations > 0 ? "#DC2626" : "#059669"} />
        <Stat label="Avg Resolution" value={s.avgResolutionDays > 0 ? `${s.avgResolutionDays}d` : "N/A"} />
        <Stat label="Escalation Score" value={s.escalationScore} valueColor={scoreColor(s.escalationScore)} />
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <Badge label={`Severity: ${s.escalationSeverity}`} bg={es.bg} color={es.color} border={es.border} />
        {s.departmentsInvolved.length > 0 ? s.departmentsInvolved.map(d => (
          <Badge key={d} label={d} bg="var(--rtm-blue-xlight)" color="var(--rtm-blue)" border="var(--rtm-blue-light)" />
        )) : (
          <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>No departments involved</span>
        )}
      </div>
    </SectionCard>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CLIENT ENGAGEMENT
// ══════════════════════════════════════════════════════════════════════════════

function engagementStatusStyle(s: string) {
  switch (s) {
    case "High":         return { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" };
    case "Medium":       return { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" };
    case "Low":          return { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" };
    case "Unresponsive": return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
    default:             return { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" };
  }
}

function ClientEngagementPanel({ record }: { record: ClientHealthRecord }) {
  const s = record.engagementSignals;
  const es = engagementStatusStyle(s.engagementStatus);
  return (
    <SectionCard title="Client Engagement">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
        <Stat label="Meeting Attendance" value={`${s.meetingAttendance}%`} valueColor={scoreColor(s.meetingAttendance)} />
        <Stat label="Response Rate" value={`${s.responseRate}%`} valueColor={scoreColor(s.responseRate)} />
        <Stat label="Engagement Score" value={s.engagementScore} valueColor={scoreColor(s.engagementScore)} />
        <Stat label="Project Participation" value={s.projectParticipation} />
        <Stat label="Review Participation" value={s.reviewParticipation} />
        <Stat label="Comm Frequency" value={s.communicationFrequency} />
      </div>
      <Badge label={s.engagementStatus} bg={es.bg} color={es.color} border={es.border} />
    </SectionCard>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// RENEWAL RISK PANEL
// ══════════════════════════════════════════════════════════════════════════════

function RenewalRiskPanel({ record }: { record: ClientHealthRecord }) {
  const r = record.renewalRisk;
  const rs = riskStyle(r.riskLevel);
  const ss = sentimentStyle(r.clientSentiment);
  return (
    <SectionCard title="Renewal Risk Model">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
        <Stat label="Risk Score" value={r.riskScore} valueColor={r.riskScore >= 70 ? "#DC2626" : r.riskScore >= 40 ? "#D97706" : "#059669"} sub="0 = no risk" />
        <Stat label="Contract End" value={r.contractEndDate} />
        <Stat label="Days to Renewal" value={r.daysToRenewal} valueColor={r.daysToRenewal <= 30 ? "#DC2626" : r.daysToRenewal <= 60 ? "#D97706" : "#059669"} />
      </div>
      <div className="flex items-center gap-3 flex-wrap mb-4">
        <Badge label={`Risk: ${r.riskLevel}`} bg={rs.bg} color={rs.color} border={rs.border} />
        <Badge label={`Sentiment: ${r.clientSentiment}`} bg={ss.bg} color={ss.color} border={ss.border} />
      </div>
      <div>
        <p className="text-xs font-semibold mb-2" style={{ color: "var(--rtm-text-secondary)" }}>Recommended Actions</p>
        <ul className="flex flex-col gap-1">
          {r.recommendedActions.map((a, i) => (
            <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
              <span className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--rtm-blue)" }} />
              {a}
            </li>
          ))}
        </ul>
      </div>
    </SectionCard>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// EXPANSION OPPORTUNITY PANEL
// ══════════════════════════════════════════════════════════════════════════════

function ExpansionOpportunityPanel({ record }: { record: ClientHealthRecord }) {
  const e = record.expansionOpportunity;
  return (
    <SectionCard title="Expansion Opportunity Model">
      {e.hasOpportunity ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            <Stat label="Opportunity Score" value={e.opportunityScore} valueColor={scoreColor(e.opportunityScore)} />
            <Stat label="Revenue Potential" value={`+${fmt$(e.revenuePotential)}/mo`} valueColor="#059669" />
            <Stat label="Confidence Score" value={`${e.confidenceScore}%`} valueColor={scoreColor(e.confidenceScore)} />
          </div>
          <div className="mb-3">
            <p className="text-xs font-semibold mb-1.5" style={{ color: "var(--rtm-text-secondary)" }}>Recommended Services</p>
            <div className="flex flex-wrap gap-2">
              {e.recommendedServices.map(s => (
                <Badge key={s} label={s} bg="var(--rtm-blue-xlight)" color="var(--rtm-blue)" border="var(--rtm-blue-light)" />
              ))}
            </div>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--rtm-text-secondary)" }}>{e.reason}</p>
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--rtm-text-secondary)" }}>Recommended Actions</p>
            <ul className="flex flex-col gap-1">
              {e.recommendedActions.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#059669" }} />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 gap-2">
          <span className="text-sm font-medium" style={{ color: "var(--rtm-text-muted)" }}>No Expansion Opportunity</span>
          <p className="text-xs text-center max-w-xs" style={{ color: "var(--rtm-text-muted)" }}>{e.reason}</p>
        </div>
      )}
    </SectionCard>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// AI SUMMARY PANEL
// ══════════════════════════════════════════════════════════════════════════════

function AISummaryPanel({ record }: { record: ClientHealthRecord }) {
  const ai = record.aiSummary;
  return (
    <SectionCard title="AI Client Summary">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-blue)" }}>Client Overview</p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--rtm-text-secondary)" }}>{ai.overview}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-secondary)" }}>Health Assessment</p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--rtm-text-secondary)" }}>{ai.healthAssessment}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-secondary)" }}>Communication Summary</p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--rtm-text-secondary)" }}>{ai.communicationSummary}</p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#DC2626" }}>Risks</p>
            <ul className="flex flex-col gap-1.5">
              {ai.risks.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-red-400" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
          {ai.growthOpportunities.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#059669" }}>Growth Opportunities</p>
              <ul className="flex flex-col gap-1.5">
                {ai.growthOpportunities.map((g, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-green-400" />
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-blue)" }}>Recommended Actions</p>
            <ul className="flex flex-col gap-1.5">
              {ai.recommendedActions.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--rtm-blue)" }} />
                  {a}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>Renewal Signals</p>
              <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{ai.renewalSignals}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--rtm-text-muted)" }}>Expansion Signals</p>
              <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{ai.expansionSignals}</p>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// COMMUNICATION HISTORY
// ══════════════════════════════════════════════════════════════════════════════

function CommHistoryPanel({ record }: { record: ClientHealthRecord }) {
  return (
    <SectionCard title="Communication History">
      {record.commHistory.length === 0 ? (
        <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>No communication history available.</p>
      ) : (
        <div className="flex flex-col divide-y" style={{ borderColor: "var(--rtm-border-light)" }}>
          {record.commHistory.map((c, i) => {
            const ss = sentimentStyle(c.sentiment);
            const typeColor: Record<string, string> = {
              Call: "#2563EB", Email: "#7C3AED", Meeting: "#059669", Note: "#64748B", "Follow-Up": "#D97706",
            };
            return (
              <div key={i} className="py-3 flex flex-col gap-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded"
                    style={{ background: "#F4F7FF", color: typeColor[c.type] ?? "#64748B" }}
                  >
                    {c.type}
                  </span>
                  <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{c.date}</span>
                  <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>by {c.by}</span>
                  <Badge label={c.sentiment} bg={ss.bg} color={ss.color} border={ss.border} />
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--rtm-text-secondary)" }}>{c.summary}</p>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CLIENT DETAIL DRAWER
// ══════════════════════════════════════════════════════════════════════════════

type DrawerTab =
  | "Overview"
  | "Health History"
  | "Projects"
  | "Communications"
  | "Call Intelligence"
  | "Billing"
  | "Reports"
  | "Escalations"
  | "Renewals"
  | "Expansion"
  | "AI Summary";

const DRAWER_TABS: DrawerTab[] = [
  "Overview",
  "Health History",
  "Projects",
  "Communications",
  "Call Intelligence",
  "Billing",
  "Reports",
  "Escalations",
  "Renewals",
  "Expansion",
  "AI Summary",
];

function ClientDetailDrawer({
  record,
  onClose,
}: {
  record: ClientHealthRecord;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<DrawerTab>("Overview");

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="flex-1 bg-black/40 cursor-pointer"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className="w-full max-w-4xl flex flex-col h-full overflow-hidden"
        style={{ background: "var(--rtm-bg)", boxShadow: "-4px 0 40px rgba(15,28,56,0.18)" }}
      >
        {/* Drawer Header */}
        <div
          className="flex items-start justify-between p-6 border-b flex-shrink-0"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold" style={{ color: "var(--rtm-text-primary)" }}>{record.client}</h2>
              <HealthBadge status={record.healthStatus} />
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>AM: {record.accountManager}</span>
              <span className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>{record.industry}</span>
              <span className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>{record.location}</span>
              <span className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>Since {record.startDate}</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {record.services.map(s => (
                <Badge key={s} label={s} bg="var(--rtm-blue-xlight)" color="var(--rtm-blue)" border="var(--rtm-blue-light)" />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span
                className="text-3xl font-extrabold"
                style={{ color: scoreColor(record.healthScore.overall) }}
              >
                {record.healthScore.overall}
              </span>
              <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>Health Score</span>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors text-lg font-bold"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-0 border-b overflow-x-auto flex-shrink-0"
          style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-surface)" }}
        >
          {DRAWER_TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors"
              style={{
                borderBottomColor: tab === t ? "var(--rtm-blue)" : "transparent",
                color: tab === t ? "var(--rtm-blue)" : "var(--rtm-text-muted)",
                background: "transparent",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col gap-6">
            {tab === "Overview" && (
              <>
                <HealthScoreBreakdownPanel record={record} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <RenewalRiskPanel record={record} />
                  <ExpansionOpportunityPanel record={record} />
                </div>
              </>
            )}
            {tab === "Health History" && (
              <SectionCard title="Health Score History">
                <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                  Last reviewed: <strong>{record.lastHealthReview}</strong>
                </p>
                <div className="mt-4">
                  <HealthScoreGauge score={record.healthScore.overall} />
                </div>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {SCORE_WEIGHTS.map(({ key, label }) => (
                    <ScoreBar key={key} score={record.healthScore[key as ScoreKey]} label={label} />
                  ))}
                </div>
              </SectionCard>
            )}
            {tab === "Projects" && <ProjectHealthPanel record={record} />}
            {tab === "Communications" && (
              <>
                <CommunicationHealthPanel record={record} />
                <CommHistoryPanel record={record} />
              </>
            )}
            {tab === "Call Intelligence" && <CallIntelPanel record={record} />}
            {tab === "Billing" && <BillingHealthPanel record={record} />}
            {tab === "Reports" && <ReportingHealthPanel record={record} />}
            {tab === "Escalations" && <EscalationHealthPanel record={record} />}
            {tab === "Renewals" && <RenewalRiskPanel record={record} />}
            {tab === "Expansion" && <ExpansionOpportunityPanel record={record} />}
            {tab === "AI Summary" && <AISummaryPanel record={record} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CLIENT HEALTH TABLE
// ══════════════════════════════════════════════════════════════════════════════

function ClientHealthTable({
  records,
  onSelect,
}: {
  records: ClientHealthRecord[];
  onSelect: (r: ClientHealthRecord) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--rtm-border)", boxShadow: "0 1px 3px rgba(15,28,56,0.05)" }}>
      <table className="min-w-full text-sm">
        <thead>
          <tr style={{ background: "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border)" }}>
            {["Client", "Account Manager", "Health Score", "Status", "Renewal Risk", "Expansion", "MRR", "ARR", "Projects", "Open Escalations", "Last Comm", "Actions"].map(h => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                style={{ color: "var(--rtm-text-muted)" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => {
            const ps = scoreBg(r.healthScore.overall);
            return (
              <tr
                key={r.clientId}
                className="hover:bg-blue-50 cursor-pointer transition-colors"
                style={{ background: i % 2 === 0 ? "var(--rtm-surface)" : "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border-light)" }}
                onClick={() => onSelect(r)}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{r.client}</span>
                    <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{r.industry}</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{r.accountManager}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className="text-lg font-extrabold"
                    style={{ color: ps.text }}
                  >
                    {r.healthScore.overall}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <HealthBadge status={r.healthStatus} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <RiskBadge risk={r.renewalRisk.riskLevel} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {r.expansionOpportunity.hasOpportunity ? (
                    <Badge label={`+${fmt$(r.expansionOpportunity.revenuePotential)}`} bg="#ECFDF5" color="#059669" border="#A7F3D0" />
                  ) : (
                    <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>None</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{fmt$(r.billingSignals.mrr)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{fmt$(r.billingSignals.arr)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{r.projectSignals.blockedTasks > 0 ? (
                  <Badge label={`${r.projectSignals.blockedTasks} blocked`} bg="#FEF2F2" color="#DC2626" border="#FECACA" />
                ) : (
                  <Badge label="Clear" bg="#ECFDF5" color="#059669" border="#A7F3D0" />
                )}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {r.escalationSignals.openEscalations > 0 ? (
                    <Badge label={`${r.escalationSignals.openEscalations} open`} bg="#FEF2F2" color="#DC2626" border="#FECACA" />
                  ) : (
                    <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>None</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                  {r.communicationSignals.lastContact}
                  <br />
                  <span style={{ color: "var(--rtm-text-muted)" }}>{r.communicationSignals.daysSinceContact}d ago</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
                    style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)" }}
                    onClick={e => { e.stopPropagation(); onSelect(r); }}
                  >
                    View
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// INTERVENTION CENTER
// ══════════════════════════════════════════════════════════════════════════════

function InterventionCenter({ onSelectClient }: { onSelectClient: (id: string) => void }) {
  const items = INTERVENTION_QUEUE.filter(i => i.status !== "Resolved");

  const statusStyle = (s: string) => {
    switch (s) {
      case "Open":       return { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" };
      case "In Progress":return { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" };
      case "Escalated":  return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
      case "Resolved":   return { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" };
      default:           return { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" };
    }
  };

  return (
    <SectionCard title={`Client Intervention Center — ${items.length} Active`}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--rtm-border)" }}>
              {["Client", "Reason", "Risk Level", "Assigned Owner", "Recommended Action", "Due Date", "Status", "Action"].map(h => (
                <th key={h} className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const ss = statusStyle(item.status);
              const rs = riskStyle(item.riskLevel);
              return (
                <tr
                  key={item.clientId}
                  className="hover:bg-blue-50 cursor-pointer"
                  style={{ borderBottom: "1px solid var(--rtm-border-light)" }}
                  onClick={() => onSelectClient(item.clientId)}
                >
                  <td className="py-3 pr-4 whitespace-nowrap font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{item.client}</td>
                  <td className="py-3 pr-4 text-xs max-w-xs" style={{ color: "var(--rtm-text-secondary)" }}>{item.reason}</td>
                  <td className="py-3 pr-4 whitespace-nowrap">
                    <Badge label={item.riskLevel} bg={rs.bg} color={rs.color} border={rs.border} />
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{item.assignedOwner}</td>
                  <td className="py-3 pr-4 text-xs max-w-xs" style={{ color: "var(--rtm-text-secondary)" }}>{item.recommendedAction}</td>
                  <td className="py-3 pr-4 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{item.dueDate}</td>
                  <td className="py-3 pr-4 whitespace-nowrap">
                    <Badge label={item.status} bg={ss.bg} color={ss.color} border={ss.border} />
                  </td>
                  <td className="py-3 whitespace-nowrap">
                    <button
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                      style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)" }}
                      onClick={e => { e.stopPropagation(); onSelectClient(item.clientId); }}
                    >
                      Open
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// EXECUTIVE HEALTH DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════

function ExecutiveDashboard({ records }: { records: ClientHealthRecord[] }) {
  const s = computePortfolioSummary(records);

  const topRisks = records
    .filter(r => r.healthStatus === "At Risk" || r.healthStatus === "Critical")
    .sort((a, b) => b.billingSignals.mrr - a.billingSignals.mrr)
    .slice(0, 5);

  const deptBottlenecks: Record<string, number> = {};
  records.forEach(r => {
    r.projectSignals.departmentDelays.forEach(d => {
      deptBottlenecks[d] = (deptBottlenecks[d] ?? 0) + 1;
    });
  });

  const renewalsAtRisk = records.filter(r =>
    (r.renewalRisk.riskLevel === "High" || r.renewalRisk.riskLevel === "Critical") &&
    r.renewalRisk.daysToRenewal <= 90
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Portfolio KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <KpiCard label="Portfolio Health Score" value={s.avgScore} sub="Average across 30 clients" accent={scoreColor(s.avgScore)} />
        <KpiCard label="Total MRR" value={fmt$(s.totalMRR)} sub="Active portfolio" />
        <KpiCard label="Revenue At Risk" value={fmt$(s.revenueAtRisk)} sub="High + Critical risk MRR" accent="#DC2626" />
        <KpiCard label="Expansion Forecast" value={`+${fmt$(s.expansionRevenue)}`} sub={`${s.expansionCount} opportunities`} accent="#059669" />
        <KpiCard label="Critical Clients" value={s.critical} sub="Immediate intervention required" accent="#DC2626" />
        <KpiCard label="At Risk Clients" value={s.atRisk} sub="Monitoring required" accent="#EA580C" />
        <KpiCard label="Open Escalations" value={s.openEscalations} sub="Across all accounts" accent={s.openEscalations > 0 ? "#DC2626" : "#059669"} />
        <KpiCard label="Active Interventions" value={s.interventionCount} sub="Open intervention items" accent={s.interventionCount > 0 ? "#D97706" : "#059669"} />
      </div>

      {/* Status Distribution */}
      <SectionCard title="Portfolio Health Distribution">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          {([
            { label: "Healthy", count: s.healthy, color: "#059669" },
            { label: "Monitor", count: s.monitor, color: "#D97706" },
            { label: "At Risk", count: s.atRisk, color: "#EA580C" },
            { label: "Critical", count: s.critical, color: "#DC2626" },
          ] as const).map(({ label, count, color }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border"
              style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}
            >
              <span className="text-3xl font-extrabold" style={{ color }}>{count}</span>
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>{label}</span>
              <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                {Math.round((count / s.total) * 100)}% of portfolio
              </span>
            </div>
          ))}
        </div>
        <div className="h-3 rounded-full overflow-hidden flex gap-0.5">
          {[
            { pct: s.healthy, color: "#10B981" },
            { pct: s.monitor, color: "#F59E0B" },
            { pct: s.atRisk, color: "#F97316" },
            { pct: s.critical, color: "#EF4444" },
          ].map(({ pct, color }, i) => (
            <div
              key={i}
              className="h-3 first:rounded-l-full last:rounded-r-full"
              style={{ width: `${(pct / s.total) * 100}%`, background: color }}
            />
          ))}
        </div>
      </SectionCard>

      {/* Top Risks + Renewals At Risk */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <SectionCard title="Top Risks by MRR">
          {topRisks.length === 0 ? (
            <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>No at-risk or critical clients.</p>
          ) : (
            <div className="flex flex-col divide-y" style={{ borderColor: "var(--rtm-border-light)" }}>
              {topRisks.map(r => (
                <div key={r.clientId} className="py-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{r.client}</p>
                    <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{r.accountManager}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <HealthBadge status={r.healthStatus} />
                    <span className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>{fmt$(r.billingSignals.mrr)}/mo</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Renewals At Risk (Next 90 Days)">
          {renewalsAtRisk.length === 0 ? (
            <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>No high-risk renewals in the next 90 days.</p>
          ) : (
            <div className="flex flex-col divide-y" style={{ borderColor: "var(--rtm-border-light)" }}>
              {renewalsAtRisk.map(r => (
                <div key={r.clientId} className="py-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{r.client}</p>
                    <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>Renewal: {r.renewalRisk.contractEndDate}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <RiskBadge risk={r.renewalRisk.riskLevel} />
                    <span className="text-xs" style={{ color: r.renewalRisk.daysToRenewal <= 30 ? "#DC2626" : "#D97706" }}>
                      {r.renewalRisk.daysToRenewal}d
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Department Bottlenecks */}
      <SectionCard title="Department Bottlenecks">
        {Object.keys(deptBottlenecks).length === 0 ? (
          <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>No department bottlenecks detected.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {Object.entries(deptBottlenecks)
              .sort(([, a], [, b]) => b - a)
              .map(([dept, count]) => (
                <div
                  key={dept}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border"
                  style={{ border: "1px solid var(--rtm-border)", background: "var(--rtm-bg)" }}
                >
                  <span className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{dept}</span>
                  <Badge label={`${count} client${count > 1 ? "s" : ""}`} bg="#FEF2F2" color="#DC2626" border="#FECACA" />
                </div>
              ))}
          </div>
        )}
      </SectionCard>

      {/* Recommended Actions */}
      <SectionCard title="Portfolio Recommended Actions">
        <ul className="flex flex-col gap-2">
          {[
            s.critical > 0 && `Immediate director-level intervention required for ${s.critical} critical client${s.critical > 1 ? "s" : ""}.`,
            s.openEscalations > 0 && `Resolve ${s.openEscalations} open escalation${s.openEscalations > 1 ? "s" : ""} across the portfolio.`,
            renewalsAtRisk.length > 0 && `${renewalsAtRisk.length} renewal${renewalsAtRisk.length > 1 ? "s" : ""} at high/critical risk expire within 90 days — immediate action required.`,
            s.expansionCount > 0 && `${s.expansionCount} expansion opportunities identified — total potential revenue: +${fmt$(s.expansionRevenue)}/mo.`,
            `Review all ${s.monitor} monitor accounts to prevent escalation to At Risk.`,
            "Conduct monthly QBRs for all healthy accounts to maintain trajectory.",
          ].filter(Boolean).map((action, i) => (
            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
              <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--rtm-blue)" }} />
              {action}
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════

const HEALTH_FILTERS: Array<"All" | HealthStatus> = ["All", "Healthy", "Monitor", "At Risk", "Critical"];
type PageView = "dashboard" | "table" | "intervention" | "executive";

export default function ClientHealthPage() {
  const [activeFilter, setActiveFilter] = useState<"All" | HealthStatus>("All");
  const [selectedRecord, setSelectedRecord] = useState<ClientHealthRecord | null>(null);
  const [view, setView] = useState<PageView>("dashboard");
  const [search, setSearch] = useState("");

  const summary = useMemo(() => computePortfolioSummary(CLIENT_HEALTH_RECORDS), []);

  const filtered = useMemo(() => {
    let result = CLIENT_HEALTH_RECORDS;
    if (activeFilter !== "All") result = result.filter(r => r.healthStatus === activeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.client.toLowerCase().includes(q) ||
        r.accountManager.toLowerCase().includes(q) ||
        r.industry.toLowerCase().includes(q)
      );
    }
    return result;
  }, [activeFilter, search]);

  const openDrawer = (r: ClientHealthRecord) => setSelectedRecord(r);
  const closeDrawer = () => setSelectedRecord(null);

  const openDrawerById = (id: string) => {
    const r = CLIENT_HEALTH_RECORDS.find(c => c.clientId === id);
    if (r) setSelectedRecord(r);
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--rtm-bg)" }}>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Page Header ───────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--rtm-text-primary)" }}>
              Client Health Engine
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
              Central client success monitoring — aggregating signals from projects, tasks, billing, communications, call intelligence, reporting, escalations, renewals, and expansion.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {([
              { key: "dashboard",    label: "Dashboard" },
              { key: "table",        label: "All Clients" },
              { key: "intervention", label: `Interventions (${INTERVENTION_QUEUE.filter(i => i.status !== "Resolved").length})` },
              { key: "executive",    label: "Executive View" },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className="px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
                style={{
                  background: view === key ? "var(--rtm-blue)" : "var(--rtm-surface)",
                  color: view === key ? "#fff" : "var(--rtm-text-secondary)",
                  border: "1px solid",
                  borderColor: view === key ? "var(--rtm-blue)" : "var(--rtm-border)",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── KPI Row ────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <KpiCard label="Healthy" value={summary.healthy} sub={`${Math.round((summary.healthy / summary.total) * 100)}%`} accent="#059669" />
          <KpiCard label="Monitor" value={summary.monitor} sub={`${Math.round((summary.monitor / summary.total) * 100)}%`} accent="#D97706" />
          <KpiCard label="At Risk" value={summary.atRisk} sub={`${Math.round((summary.atRisk / summary.total) * 100)}%`} accent="#EA580C" />
          <KpiCard label="Critical" value={summary.critical} sub={`${Math.round((summary.critical / summary.total) * 100)}%`} accent="#DC2626" />
          <KpiCard label="Renewal Opportunities" value={CLIENT_HEALTH_RECORDS.filter(r => r.renewalRisk.daysToRenewal <= 90).length} sub="Next 90 days" accent="var(--rtm-blue)" />
          <KpiCard label="Expansion Opportunities" value={summary.expansionCount} sub={`+${fmt$(summary.expansionRevenue)}/mo potential`} accent="#059669" />
          <KpiCard label="Requiring Intervention" value={summary.interventionCount} sub="Active items" accent={summary.interventionCount > 0 ? "#DC2626" : "#059669"} />
          <KpiCard label="Portfolio Health Score" value={summary.avgScore} sub="Weighted average" accent={scoreColor(summary.avgScore)} />
        </div>

        {/* ── Dashboard View ──────────────────────────────────────────────── */}
        {view === "dashboard" && (
          <>
            {/* Filters + Search */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex gap-2 flex-wrap">
                {HEALTH_FILTERS.map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
                    style={{
                      background: activeFilter === f ? "var(--rtm-text-primary)" : "var(--rtm-surface)",
                      color: activeFilter === f ? "#fff" : "var(--rtm-text-secondary)",
                      border: "1px solid",
                      borderColor: activeFilter === f ? "var(--rtm-text-primary)" : "var(--rtm-border)",
                    }}
                  >
                    {f} {f !== "All" && `(${CLIENT_HEALTH_RECORDS.filter(r => r.healthStatus === f).length})`}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Search clients, managers, industries..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 min-w-48 px-4 py-2 rounded-lg text-sm border outline-none"
                style={{
                  background: "var(--rtm-surface)",
                  borderColor: "var(--rtm-border)",
                  color: "var(--rtm-text-primary)",
                }}
              />
            </div>

            {/* Cards Grid */}
            {filtered.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>No clients match the selected filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map(record => {
                  const ps = scoreBg(record.healthScore.overall);
                  return (
                    <div
                      key={record.clientId}
                      className="rounded-xl border flex flex-col gap-0 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                      style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
                      onClick={() => openDrawer(record)}
                    >
                      {/* Card Header */}
                      <div className="p-4 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold truncate text-sm" style={{ color: "var(--rtm-text-primary)" }}>{record.client}</p>
                          <p className="text-xs truncate" style={{ color: "var(--rtm-text-muted)" }}>{record.accountManager} · {record.industry}</p>
                        </div>
                        <HealthBadge status={record.healthStatus} />
                      </div>

                      {/* Score */}
                      <div
                        className="mx-4 mb-3 rounded-lg border py-3 flex flex-col items-center"
                        style={{ background: ps.bg, borderColor: ps.border }}
                      >
                        <span className="text-4xl font-extrabold leading-none" style={{ color: ps.text }}>
                          {record.healthScore.overall}
                        </span>
                        <span className="text-xs mt-0.5" style={{ color: ps.text, opacity: 0.8 }}>Overall Health Score</span>
                      </div>

                      {/* Score bars */}
                      <div className="px-4 pb-3 flex flex-col gap-2">
                        {SCORE_WEIGHTS.slice(0, 4).map(({ key, label }) => (
                          <ScoreBar
                            key={key}
                            score={record.healthScore[key as ScoreKey]}
                            label={label}
                          />
                        ))}
                      </div>

                      {/* Footer stats */}
                      <div
                        className="border-t grid grid-cols-3 divide-x"
                        style={{ borderColor: "var(--rtm-border-light)" }}
                      >
                        <div className="px-3 py-2 flex flex-col items-center">
                          <span className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>{fmt$(record.billingSignals.mrr)}</span>
                          <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>MRR</span>
                        </div>
                        <div className="px-3 py-2 flex flex-col items-center">
                          {record.escalationSignals.openEscalations > 0 ? (
                            <>
                              <span className="text-xs font-bold text-red-600">{record.escalationSignals.openEscalations}</span>
                              <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>Escalation{record.escalationSignals.openEscalations > 1 ? "s" : ""}</span>
                            </>
                          ) : (
                            <>
                              <span className="text-xs font-bold" style={{ color: "#059669" }}>Clear</span>
                              <span className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>Escalations</span>
                            </>
                          )}
                        </div>
                        <div className="px-3 py-2 flex flex-col items-center">
                          <RiskBadge risk={record.renewalRisk.riskLevel} />
                          <span className="text-[10px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>Renewal</span>
                        </div>
                      </div>

                      {/* AI Insight */}
                      <div className="px-4 py-3 border-t" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg)" }}>
                        <p className="text-xs italic leading-snug line-clamp-2" style={{ color: "var(--rtm-text-muted)" }}>
                          {record.aiSummary.overview.substring(0, 100)}...
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── Table View ─────────────────────────────────────────────────────── */}
        {view === "table" && (
          <>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex gap-2 flex-wrap">
                {HEALTH_FILTERS.map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
                    style={{
                      background: activeFilter === f ? "var(--rtm-text-primary)" : "var(--rtm-surface)",
                      color: activeFilter === f ? "#fff" : "var(--rtm-text-secondary)",
                      border: "1px solid",
                      borderColor: activeFilter === f ? "var(--rtm-text-primary)" : "var(--rtm-border)",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 min-w-48 px-4 py-2 rounded-lg text-sm border outline-none"
                style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
              />
            </div>
            <ClientHealthTable records={filtered} onSelect={openDrawer} />
          </>
        )}

        {/* ── Intervention View ─────────────────────────────────────────────── */}
        {view === "intervention" && (
          <InterventionCenter onSelectClient={openDrawerById} />
        )}

        {/* ── Executive View ────────────────────────────────────────────────── */}
        {view === "executive" && (
          <ExecutiveDashboard records={CLIENT_HEALTH_RECORDS} />
        )}

      </div>

      {/* ── Client Detail Drawer ──────────────────────────────────────────── */}
      {selectedRecord && (
        <ClientDetailDrawer record={selectedRecord} onClose={closeDrawer} />
      )}
    </div>
  );
}
