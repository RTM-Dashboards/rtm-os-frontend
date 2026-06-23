"use client";

// ── Department Escalations Panel ──────────────────────────────────────────────
// Displays open, pending, and resolved escalations for this department.

import { SectionWrapper, StatusBadge } from "@/components/ui";

type EscalationStatus = "open"| "pending"| "resolved";
type EscalationPriority = "critical"| "high"| "medium";

interface Escalation {
  id: string;
  title: string;
  client: string;
  owner: string;
  status: EscalationStatus;
  priority: EscalationPriority;
  createdDate: string;
  resolvedDate?: string;
}

const MOCK_ESCALATIONS: Escalation[] = [
  { id: "esc-1", title: "Client reporting delay — Apex Roofing",   client: "Apex Roofing",   owner: "Alex R.",   status: "open",     priority: "high",     createdDate: "Jun 5"},
  { id: "esc-2", title: "GBP suspension — Harbor Auto",            client: "Harbor Auto",    owner: "Lisa P.",   status: "open",     priority: "critical", createdDate: "Jun 3"},
  { id: "esc-3", title: "Missing deliverable — Summit Landscaping",client: "Summit",         owner: "Jordan M.", status: "pending",  priority: "high",     createdDate: "May 30"},
  { id: "esc-4", title: "Campaign overspend — Metro Dental",       client: "Metro Dental",   owner: "Mike T.",   status: "resolved", priority: "critical", createdDate: "May 25", resolvedDate: "May 28"},
  { id: "esc-5", title: "Integration error — BlueSky HVAC",        client: "BlueSky HVAC",   owner: "Chris D.",  status: "pending",  priority: "medium",   createdDate: "Jun 6"},
];

const STATUS_MAP: Record<EscalationStatus, { variant: "success"| "warning"| "error"| "pending"; label: string }> = {
  open:     { variant: "error",   label: "Open"},
  pending:  { variant: "pending", label: "Pending"},
  resolved: { variant: "success", label: "Resolved"},
};

const PRIORITY_STYLE: Record<EscalationPriority, { color: string; bg: string }> = {
  critical: { color: "#DC2626", bg: "#FEF2F2"},
  high:     { color: "#D97706", bg: "#FFFBEB"},
  medium:   { color: "#2563EB", bg: "#EFF6FF"},
};

interface Props {
  accentColor: string;
  disabled?: boolean;
}

export default function DepartmentEscalationsPanel({ accentColor, disabled }: Props) {
  if (disabled) {
    return (
      <SectionWrapper title="Escalations"description="Open, pending, and resolved escalations">
        <div
          className="rounded-lg border p-6 text-center text-sm"style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-muted)", background: "var(--rtm-bg)"}}
        >
          Escalations module is disabled for this department.
        </div>
      </SectionWrapper>
    );
  }

  const open     = MOCK_ESCALATIONS.filter((e) => e.status === "open");
  const pending  = MOCK_ESCALATIONS.filter((e) => e.status === "pending");
  const resolved = MOCK_ESCALATIONS.filter((e) => e.status === "resolved");

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {(
          [
            { label: "Open",     value: open.length,     color: "#DC2626", bg: "#FEF2F2"},
            { label: "Pending",  value: pending.length,  color: "#D97706", bg: "#FFFBEB"},
            { label: "Resolved", value: resolved.length, color: "#059669", bg: "#ECFDF5"},
          ] as { label: string; value: number; color: string; bg: string }[]
        ).map((s) => (
          <div key={s.label} className="rounded-xl border p-4 text-center"style={{ background: s.bg, borderColor: "var(--rtm-border-light)"}}>
            <p className="text-2xl font-bold"style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-0.5 font-medium"style={{ color: s.color }}>{s.label} Escalations</p>
          </div>
        ))}
      </div>

      {/* Escalation table */}
      <SectionWrapper
        title="Escalation Log"description="All department escalations"noPadding
        actions={
          <a className="text-xs font-medium hover:underline" href="#" style={{ color: accentColor }}>
            View all
          </a>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
                {["Escalation", "Client", "Owner", "Priority", "Status", "Created", "Resolved"].map((h) => (
                  <th
                    key={h}
                    className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap"style={{ color: "var(--rtm-text-muted)"}}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_ESCALATIONS.map((esc) => {
                const st = STATUS_MAP[esc.status];
                const pr = PRIORITY_STYLE[esc.priority];
                return (
                  <tr
                    key={esc.id}
                    className="hover:bg-slate-50/50 transition-colors"style={{ borderBottom: "1px solid var(--rtm-border-light)"}}
                  >
                    <td className="py-2.5 px-3 font-semibold"style={{ color: "var(--rtm-text-primary)", maxWidth: "220px"}}>
                      <span className="line-clamp-1">{esc.title}</span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>
                      {esc.client}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>
                      {esc.owner}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize"style={{ background: pr.bg, color: pr.color }}
                      >
                        {esc.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <StatusBadge variant={st.variant} label={st.label} size="sm"/>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-xs"style={{ color: "var(--rtm-text-muted)"}}>
                      {esc.createdDate}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-xs"style={{ color: "var(--rtm-text-muted)"}}>
                      {esc.resolvedDate ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionWrapper>
    </div>
  );
}
