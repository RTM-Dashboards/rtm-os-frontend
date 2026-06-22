"use client";

import type { ClientIntegrationAssignment, Integration } from "@/lib/integrations/types";
import SectionWrapper from "@/components/ui/SectionWrapper";
import IntegrationStatusBadge from "./IntegrationStatusBadge";

interface Props {
  assignments: ClientIntegrationAssignment[];
  integrations: Integration[];
}

function IntegrationCell({
  integrationId,
  integrations,
}: {
  integrationId: string | null;
  integrations: Integration[];
}) {
  if (!integrationId) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-200 font-medium">
        Not Assigned
      </span>
    );
  }
  const integration = integrations.find((i) => i.id === integrationId);
  if (!integration) {
    return <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>Unknown</span>;
  }
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
        {integration.name}
      </span>
      <IntegrationStatusBadge status={integration.status} size="sm" />
    </div>
  );
}

export default function ClientAssignmentTable({ assignments, integrations }: Props) {
  return (
    <SectionWrapper
      title="Client Integration Assignment"
      description="Per-client connector assignments — fully configurable, no vendor lock-in"
      actions={
        <button
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors"
          style={{ background: "var(--rtm-blue)" }}
        >
          + Assign Client
        </button>
      }
    >
      <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--rtm-border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr
              style={{
                background: "var(--rtm-surface-raised, #F8FAFC)",
                borderBottom: "1px solid var(--rtm-border)",
              }}
            >
              {["Client", "CRM Provider", "Call Tracking", "Analytics", "Advertising", "AI Provider", "Actions"].map((col) => (
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
            {assignments.map((assignment, idx) => (
              <tr
                key={assignment.clientId}
                style={{
                  borderBottom: idx < assignments.length - 1 ? "1px solid var(--rtm-border-light)" : undefined,
                  background: "var(--rtm-surface)",
                }}
              >
                <td className="px-4 py-3">
                  <p className="font-semibold text-sm" style={{ color: "var(--rtm-text-primary)" }}>
                    {assignment.clientName}
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>
                    {assignment.clientId}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <IntegrationCell integrationId={assignment.crmIntegrationId} integrations={integrations} />
                </td>
                <td className="px-4 py-3">
                  <IntegrationCell integrationId={assignment.callTrackingIntegrationId} integrations={integrations} />
                </td>
                <td className="px-4 py-3">
                  <IntegrationCell integrationId={assignment.analyticsIntegrationId} integrations={integrations} />
                </td>
                <td className="px-4 py-3">
                  <IntegrationCell integrationId={assignment.advertisingIntegrationId} integrations={integrations} />
                </td>
                <td className="px-4 py-3">
                  <IntegrationCell integrationId={assignment.aiIntegrationId} integrations={integrations} />
                </td>
                <td className="px-4 py-3">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionWrapper>
  );
}
