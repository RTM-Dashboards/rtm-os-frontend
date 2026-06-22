"use client";

import type { WorkflowConnection, Integration } from "@/lib/integrations/types";
import SectionWrapper from "@/components/ui/SectionWrapper";
import StatusBadge from "@/components/ui/StatusBadge";
import type { StatusVariant } from "@/components/ui/StatusBadge";

interface Props {
  connections: WorkflowConnection[];
  integrations: Integration[];
}

const STATUS_MAP: Record<WorkflowConnection["status"], { variant: StatusVariant; label: string }> = {
  active: { variant: "success", label: "Active" },
  paused: { variant: "warning", label: "Paused" },
  error:  { variant: "error",   label: "Error" },
};

export default function WorkflowConnectionsTable({ connections, integrations }: Props) {
  return (
    <SectionWrapper
      title="Workflow Connections"
      description="Integrations powering automation triggers and data flows"
      actions={
        <button
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors"
          style={{ background: "var(--rtm-blue)" }}
        >
          + Add Connection
        </button>
      }
    >
      <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--rtm-border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--rtm-surface-raised, #F8FAFC)", borderBottom: "1px solid var(--rtm-border)" }}>
              {["Workflow", "Trigger Source", "Data Source", "Connected Integration", "Status", "Actions"].map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                  style={{ color: "var(--rtm-text-muted)" }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {connections.map((conn, idx) => {
              const integration = integrations.find((i) => i.id === conn.connectedIntegrationId);
              const { variant, label } = STATUS_MAP[conn.status];

              return (
                <tr
                  key={conn.id}
                  style={{
                    borderBottom: idx < connections.length - 1 ? "1px solid var(--rtm-border-light)" : undefined,
                    background: "var(--rtm-surface)",
                  }}
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                      {conn.workflowName}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm" style={{ color: "var(--rtm-text-secondary, #475569)" }}>
                      {conn.triggerSource}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-block text-xs font-medium px-2 py-0.5 rounded-full border"
                      style={{
                        background: "var(--rtm-blue-xlight)",
                        color: "var(--rtm-blue)",
                        borderColor: "var(--rtm-blue-light)",
                      }}
                    >
                      {conn.dataSource}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {integration ? (
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                          {integration.name}
                        </p>
                        <p className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>
                          {integration.category}
                        </p>
                      </div>
                    ) : (
                      <span style={{ color: "var(--rtm-text-muted)" }}>Unknown</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={variant} label={label} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors"
                        style={{
                          color: "var(--rtm-blue)",
                          borderColor: "var(--rtm-blue-light)",
                          background: "var(--rtm-blue-xlight)",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors"
                        style={{
                          color: conn.status === "active" ? "#B45309" : "#059669",
                          borderColor: conn.status === "active" ? "#FDE68A" : "#A7F3D0",
                          background: conn.status === "active" ? "#FFFBEB" : "#ECFDF5",
                        }}
                      >
                        {conn.status === "active" ? "Pause" : "Resume"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SectionWrapper>
  );
}
