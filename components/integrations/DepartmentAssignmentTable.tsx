"use client";

import type { DepartmentIntegrationAssignment, Integration } from "@/lib/integrations/types";
import SectionWrapper from "@/components/ui/SectionWrapper";

interface Props {
  assignments: DepartmentIntegrationAssignment[];
  integrations: Integration[];
}

export default function DepartmentAssignmentTable({ assignments, integrations }: Props) {
  return (
    <SectionWrapper
      title="Department Integration Assignment"description="Connected integrations per department — configurable without code changes"actions={
        <button
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors"style={{ background: "var(--rtm-blue)"}}
        >
          + Assign Department
        </button>
      }
    >
      <div className="space-y-3">
        {assignments.map((dept) => {
          const connectedIntegrations = dept.connectedIntegrationIds
            .map((id) => integrations.find((i) => i.id === id))
            .filter(Boolean) as Integration[];

          return (
            <div
              key={dept.departmentId}
              className="rounded-xl border p-4"style={{ background: "var(--rtm-surface-raised, #F8FAFC)", borderColor: "var(--rtm-border)"}}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>
                    {dept.departmentName}
                  </p>
                  <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>
                    {connectedIntegrations.length} integration{connectedIntegrations.length !== 1 ? "s": ""} connected
                  </p>
                </div>
                <button
                  className="text-xs font-medium px-2.5 py-1 rounded-lg border flex-shrink-0"style={{
                    color: "var(--rtm-blue)",
                    borderColor: "var(--rtm-blue-light)",
                    background: "var(--rtm-blue-xlight)",
                  }}
                >
                  Edit
                </button>
              </div>

              {/* Integration chips */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {connectedIntegrations.map((integration) => (
                  <span
                    key={integration.id}
                    className="text-xs font-medium px-2.5 py-1 rounded-full border"style={{
                      background: integration.status === "connected"? "#ECFDF5": "#F8FAFC",
                      color:      integration.status === "connected"? "#059669": "#94A3B8",
                      borderColor: integration.status === "connected"? "#A7F3D0": "#E2E8F0",
                    }}
                  >
                    {integration.name}
                  </span>
                ))}
              </div>

              {/* Reports and Workflows */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-1.5"style={{ color: "var(--rtm-text-muted)"}}>
                    Reports Consuming
                  </p>
                  <ul className="space-y-0.5">
                    {dept.reportsConsuming.map((r) => (
                      <li key={r} className="text-xs flex items-center gap-1.5"style={{ color: "var(--rtm-text-secondary, #475569)"}}>
                        <span className="w-1 h-1 rounded-full flex-shrink-0 bg-slate-400"/>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-1.5"style={{ color: "var(--rtm-text-muted)"}}>
                    Workflows Consuming
                  </p>
                  <ul className="space-y-0.5">
                    {dept.workflowsConsuming.map((w) => (
                      <li key={w} className="text-xs flex items-center gap-1.5"style={{ color: "var(--rtm-text-secondary, #475569)"}}>
                        <span className="w-1 h-1 rounded-full flex-shrink-0 bg-slate-400"/>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
