"use client";

import StatusBadge from "./StatusBadge";
import type { StatusVariant } from "./StatusBadge";
import ProgressBar from "./ProgressBar";

export interface Campaign {
  name: string;
  client: string;
  type: string;
  status: StatusVariant;
  statusLabel: string;
  budget?: string;
  spent?: string;
  progress?: number;
  metric?: string;
  metricLabel?: string;
  startDate?: string;
  endDate?: string;
}

interface CampaignCardProps {
  campaign: Campaign;
}

export default function CampaignCard({ campaign: c }: CampaignCardProps) {
  return (
    <div
      className="rounded-xl border p-4 transition-all"
      style={{
        background: "var(--rtm-surface)",
        borderColor: "var(--rtm-border)",
        boxShadow: "0 1px 2px rgba(15,28,56,0.04)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--rtm-blue)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(27,79,216,0.1)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--rtm-border)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 2px rgba(15,28,56,0.04)";
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: "var(--rtm-text-primary)" }}>
            {c.name}
          </p>
          <p className="text-xs truncate" style={{ color: "var(--rtm-text-muted)" }}>
            {c.client} · {c.type}
          </p>
        </div>
        <StatusBadge variant={c.status} label={c.statusLabel} size="sm" />
      </div>
      {c.progress !== undefined && (
        <div className="mb-3">
          <ProgressBar
            value={c.progress}
            color={c.status === "success" ? "#10B981" : "var(--rtm-blue)"}
            height={5}
          />
          <p className="text-xs mt-1" style={{ color: "var(--rtm-text-muted)" }}>
            {c.progress}% complete
          </p>
        </div>
      )}
      <div className="flex items-center justify-between text-xs" style={{ color: "var(--rtm-text-muted)" }}>
        {c.budget && (
          <span>
            Budget:{" "}
            <strong style={{ color: "var(--rtm-text-secondary)" }}>{c.budget}</strong>
          </span>
        )}
        {c.metric && (
          <span>
            {c.metricLabel || "Metric"}:{" "}
            <strong style={{ color: "var(--rtm-text-secondary)" }}>{c.metric}</strong>
          </span>
        )}
      </div>
      {(c.startDate || c.endDate) && (
        <p className="text-xs mt-1" style={{ color: "var(--rtm-text-muted)" }}>
          {c.startDate} → {c.endDate}
        </p>
      )}
    </div>
  );
}
