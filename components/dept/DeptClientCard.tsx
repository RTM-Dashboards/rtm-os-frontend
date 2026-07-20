"use client";

// ─────────────────────────────────────────────────────────────────────────────
// DeptClientCard
//
// Shared department-level client card used on all department Clients pages
// that want a card-grid layout (Paid Advertising, Web Dev & Design, LSA, etc.).
//
// Props:
//   client       – DeptClientRecord from master-clients API
//   role         – "manager" | "member"; gates monthly-value visibility
//   accentColor  – workspace accent color for value label and footer link text
//   deptServices – optional list of services relevant to this dept;
//                  when provided, filters the service tag row to matching
//                  services; when undefined/empty the service tag row is omitted
//   onClick      – called when the card is clicked (opens drawer)
// ─────────────────────────────────────────────────────────────────────────────

import { StatusBadge } from "@/components/ui";
import type { DeptRole } from "@/components/dept-role-toggle";
import type { DeptClientRecord } from "@/components/dept/DeptClientDetailDrawer";

interface DeptClientCardProps {
  client: DeptClientRecord;
  role: DeptRole;
  accentColor?: string;
  /** Services relevant to this department. When provided, the service-tag row
   *  shows only matching tags. When undefined/empty the row is omitted entirely
   *  (correct for LSA where no service tag exists in the data yet). */
  deptServices?: string[];
  onClick: (client: DeptClientRecord) => void;
}

function healthToVariant(
  health?: string,
  status?: string,
): "success" | "info" | "warning" | "pending" {
  if (status === "Inactive" || status === "Churned") return "pending";
  switch (health) {
    case "Excellent":
    case "Good":
      return "success";
    case "Fair":
      return "warning";
    case "At Risk":
      return "pending";
    default:
      return "info";
  }
}

export default function DeptClientCard({
  client: c,
  role,
  accentColor,
  deptServices,
  onClick,
}: DeptClientCardProps) {
  // Compute service tags to display. If deptServices is provided and non-empty,
  // filter to matching services. Otherwise produce an empty array so the row
  // is cleanly omitted.
  const serviceTags =
    deptServices && deptServices.length > 0
      ? (c.activeServices ?? []).filter((s) => deptServices.includes(s))
      : [];

  return (
    <button
      onClick={() => onClick(c)}
      className="p-4 rounded-xl border flex flex-col gap-2 text-left w-full transition-shadow hover:shadow-md"
      style={{
        background: "var(--rtm-surface)",
        borderColor: "var(--rtm-border)",
        cursor: "pointer",
      }}
    >
      {/* Name + health badge */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
          {c.clientName}
        </p>
        <StatusBadge
          variant={healthToVariant(c.clientHealth, c.currentStatus)}
          label={c.clientHealth ?? c.currentStatus ?? "Active"}
          size="sm"
        />
      </div>

      {/* Service tags — omitted when deptServices is undefined/empty */}
      {serviceTags.length > 0 && (
        <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
          {serviceTags.join(" · ")}
        </p>
      )}

      {/* Assigned AM */}
      {c.assignedAM && (
        <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
          AM: {c.assignedAM}
        </p>
      )}

      {/* Monthly value — Manager view only */}
      {role === "manager" && c.monthlyValue !== undefined && (
        <p
          className="text-base font-bold mt-1"
          style={{ color: accentColor }}
        >
          ${c.monthlyValue.toLocaleString()}
          <span
            className="text-xs font-normal ml-1"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            /mo
          </span>
        </p>
      )}

      {/* CTA footer */}
      <p
        className="text-[10px] mt-auto pt-1"
        style={{ color: accentColor }}
      >
        Click to view details →
      </p>
    </button>
  );
}
