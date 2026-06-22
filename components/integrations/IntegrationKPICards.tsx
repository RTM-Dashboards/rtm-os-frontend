"use client";

import type { Integration } from "@/lib/integrations/types";

interface Props {
  integrations: Integration[];
}

export default function IntegrationKPICards({ integrations }: Props) {
  const active       = integrations.filter((i) => i.status === "connected" && i.enabled).length;
  const disconnected = integrations.filter((i) => i.status === "disconnected").length;
  const pending      = integrations.filter((i) => i.status === "pending").length;
  const errored      = integrations.filter((i) => i.status === "error").length;
  const clientSet    = new Set(integrations.flatMap((i) => i.clientsUsing));
  const dataSources  = integrations.filter((i) => i.status === "connected").flatMap((i) => i.dataObjects);
  const uniqueDataSources = new Set(dataSources).size;
  const automationConnections = integrations.filter(
    (i) => i.status === "connected" && i.dataObjects.some((d) => ["Leads", "Calls", "Opportunities"].includes(d))
  ).length;

  const cards = [
    {
      label: "Active Integrations",
      value: active,
      sub: "Connected and enabled",
      color: "#059669",
      bg: "#ECFDF5",
      border: "#A7F3D0",
    },
    {
      label: "Disconnected",
      value: disconnected + errored,
      sub: `${disconnected} disconnected · ${errored} error`,
      color: "#DC2626",
      bg: "#FEF2F2",
      border: "#FECACA",
    },
    {
      label: "Pending Setup",
      value: pending,
      sub: "Awaiting configuration",
      color: "#B45309",
      bg: "#FFFBEB",
      border: "#FDE68A",
    },
    {
      label: "Connected Clients",
      value: clientSet.size,
      sub: "Clients with integrations",
      color: "var(--rtm-blue)",
      bg: "var(--rtm-blue-xlight)",
      border: "var(--rtm-blue-light)",
    },
    {
      label: "Data Sources",
      value: uniqueDataSources,
      sub: "Unique object types mapped",
      color: "#7C3AED",
      bg: "#F5F3FF",
      border: "#DDD6FE",
    },
    {
      label: "Automation Connections",
      value: automationConnections,
      sub: "Integrations feeding workflows",
      color: "#0369A1",
      bg: "#EFF6FF",
      border: "#BFDBFE",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border p-4 flex flex-col gap-1"
          style={{
            background: card.bg,
            borderColor: card.border,
          }}
        >
          <span
            className="text-2xl font-bold leading-none"
            style={{ color: card.color }}
          >
            {card.value}
          </span>
          <span
            className="text-xs font-semibold"
            style={{ color: card.color }}
          >
            {card.label}
          </span>
          <span className="text-[11px] text-slate-500">{card.sub}</span>
        </div>
      ))}
    </div>
  );
}
