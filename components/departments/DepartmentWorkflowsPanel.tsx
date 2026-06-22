"use client";

// ── Department Workflows Panel ────────────────────────────────────────────────
// Pulls from Workflow Engine. No hardcoded workflow logic — all refs come from
// DepartmentConfig.workflows.

import { SectionWrapper, StatusBadge } from "@/components/ui";
import type { DepartmentWorkflowRef } from "@/types/department";

interface WorkflowHealth {
  workflowId: string;
  status: "active" | "paused" | "error" | "idle";
  automationStatus: "running" | "paused" | "stopped";
  lastExecuted: string;
  executions: number;
  successRate: string;
}

// Mock workflow health from Workflow Engine
const WORKFLOW_HEALTH_MAP: Record<string, WorkflowHealth> = {
  "seo-monthly-delivery":    { workflowId: "seo-monthly-delivery",    status: "active",  automationStatus: "running", lastExecuted: "Jun 7, 2025",  executions: 142, successRate: "98.6%" },
  "seo-qa-review":           { workflowId: "seo-qa-review",           status: "active",  automationStatus: "running", lastExecuted: "Jun 6, 2025",  executions: 89,  successRate: "97.8%" },
  "gbp-monthly-delivery":    { workflowId: "gbp-monthly-delivery",    status: "active",  automationStatus: "running", lastExecuted: "Jun 7, 2025",  executions: 98,  successRate: "99.0%" },
  "gbp-suspension-recovery": { workflowId: "gbp-suspension-recovery", status: "idle",    automationStatus: "paused",  lastExecuted: "May 15, 2025", executions: 4,   successRate: "100%"  },
  "ppc-launch":              { workflowId: "ppc-launch",              status: "active",  automationStatus: "running", lastExecuted: "Jun 5, 2025",  executions: 67,  successRate: "97.0%" },
  "ppc-optimization":        { workflowId: "ppc-optimization",        status: "active",  automationStatus: "running", lastExecuted: "Jun 1, 2025",  executions: 118, successRate: "99.2%" },
  "meta-launch":             { workflowId: "meta-launch",             status: "active",  automationStatus: "running", lastExecuted: "Jun 4, 2025",  executions: 53,  successRate: "96.2%" },
  "meta-optimization":       { workflowId: "meta-optimization",       status: "active",  automationStatus: "running", lastExecuted: "Jun 1, 2025",  executions: 84,  successRate: "98.8%" },
  "report-production":       { workflowId: "report-production",       status: "active",  automationStatus: "running", lastExecuted: "Jun 7, 2025",  executions: 201, successRate: "99.5%" },
  "ai-setup":                { workflowId: "ai-setup",                status: "active",  automationStatus: "running", lastExecuted: "Jun 6, 2025",  executions: 34,  successRate: "100%"  },
  "ai-chatbot":              { workflowId: "ai-chatbot",              status: "active",  automationStatus: "running", lastExecuted: "May 28, 2025", executions: 12,  successRate: "91.7%" },
  "design-request":          { workflowId: "design-request",          status: "active",  automationStatus: "running", lastExecuted: "Jun 7, 2025",  executions: 156, successRate: "98.1%" },
  "content-delivery":        { workflowId: "content-delivery",        status: "active",  automationStatus: "running", lastExecuted: "Jun 6, 2025",  executions: 180, successRate: "97.8%" },
  "it-user-onboarding":      { workflowId: "it-user-onboarding",      status: "active",  automationStatus: "running", lastExecuted: "Jun 3, 2025",  executions: 24,  successRate: "100%"  },
};

function getHealth(workflowId: string): WorkflowHealth {
  return WORKFLOW_HEALTH_MAP[workflowId] ?? {
    workflowId,
    status: "idle",
    automationStatus: "paused",
    lastExecuted: "—",
    executions: 0,
    successRate: "—",
  };
}

const STATUS_MAP = {
  active: { variant: "success" as const,  label: "Active"  },
  paused: { variant: "warning" as const,  label: "Paused"  },
  error:  { variant: "error"   as const,  label: "Error"   },
  idle:   { variant: "neutral" as const,  label: "Idle"    },
};

interface Props {
  workflows: DepartmentWorkflowRef[];
  accentColor: string;
  disabled?: boolean;
}

export default function DepartmentWorkflowsPanel({ workflows, accentColor, disabled }: Props) {
  if (disabled) {
    return (
      <SectionWrapper title="Workflows" description="Connected workflows from Workflow Engine">
        <div
          className="rounded-lg border p-6 text-center text-sm"
          style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-muted)", background: "var(--rtm-bg)" }}
        >
          Workflows module is disabled for this department.
        </div>
      </SectionWrapper>
    );
  }

  if (workflows.length === 0) {
    return (
      <SectionWrapper title="Workflows" description="Connected workflows from Workflow Engine">
        <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
          No workflows configured. Configure workflows in the Workflow Engine.
        </p>
      </SectionWrapper>
    );
  }

  const enriched = workflows.map((wf) => ({ ...wf, health: getHealth(wf.workflowId) }));

  const totalExecutions = enriched.reduce((sum, wf) => sum + wf.health.executions, 0);
  const activeCount     = enriched.filter((wf) => wf.health.status === "active").length;

  return (
    <div className="space-y-4">
      {/* Metric summary */}
      <div className="grid grid-cols-3 gap-3">
        {(
          [
            { label: "Connected Workflows",  value: workflows.length, color: accentColor,  bg: `${accentColor}12` },
            { label: "Active",               value: activeCount,      color: "#059669",    bg: "#ECFDF5"          },
            { label: "Total Executions",     value: totalExecutions,  color: "#2563EB",    bg: "#EFF6FF"          },
          ] as { label: string; value: number; color: string; bg: string }[]
        ).map((s) => (
          <div key={s.label} className="rounded-xl border p-4 text-center" style={{ background: s.bg, borderColor: "var(--rtm-border-light)" }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-0.5 font-medium" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Workflows table */}
      <SectionWrapper
        title="Connected Workflows"
        description="Pulled from Workflow Engine — no hardcoded workflow logic"
        noPadding
        actions={
          <a className="text-xs font-medium hover:underline" href="/operations/workflows" style={{ color: accentColor }}>
            View in Workflow Engine
          </a>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                {["Workflow", "Description", "Status", "Automation", "Last Run", "Executions", "Success Rate"].map((h) => (
                  <th
                    key={h}
                    className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                    style={{ color: "var(--rtm-text-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enriched.map((wf) => {
                const st = STATUS_MAP[wf.health.status];
                return (
                  <tr
                    key={wf.workflowId}
                    className="hover:bg-slate-50/50 transition-colors"
                    style={{ borderBottom: "1px solid var(--rtm-border-light)" }}
                  >
                    <td className="py-2.5 px-3 font-semibold whitespace-nowrap" style={{ color: "var(--rtm-text-primary)" }}>
                      {wf.displayName}
                    </td>
                    <td className="py-2.5 px-3 text-xs max-w-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                      {wf.description}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <StatusBadge variant={st.variant} label={st.label} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-xs font-medium" style={{ color: wf.health.automationStatus === "running" ? "#059669" : "#64748B" }}>
                      {wf.health.automationStatus}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                      {wf.health.lastExecuted}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-center font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>
                      {wf.health.executions}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-semibold" style={{ color: "#059669" }}>
                      {wf.health.successRate}
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
