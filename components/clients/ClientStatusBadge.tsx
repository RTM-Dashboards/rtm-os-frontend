import type { BillingStatus, CampaignStatus, ServiceStatus, ClientHealthStatus, DeliverableStatus } from "@/lib/mock/clients";

// Shared badge component
function Badge({ label, dot, bg, color, border }: { label: string; dot: string; bg: string; color: string; border: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border whitespace-nowrap"style={{ background: bg, color, borderColor: border }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"style={{ background: dot }} />
      {label}
    </span>
  );
}

function SmallBadge({ label, dot, bg, color, border }: { label: string; dot: string; bg: string; color: string; border: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold border whitespace-nowrap"style={{ background: bg, color, borderColor: border }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"style={{ background: dot }} />
      {label}
    </span>
  );
}

// ── Health badge ──────────────────────────────────────────────────────────────
const healthMap: Record<ClientHealthStatus, { label: string; dot: string; bg: string; color: string; border: string }> = {
  healthy: { label: "Healthy",  dot: "#10B981", bg: "#ECFDF5", color: "#059669", border: "#A7F3D0"},
  at_risk: { label: "At Risk",  dot: "#F59E0B", bg: "#FFFBEB", color: "#B45309", border: "#FDE68A"},
  churned: { label: "Churned",  dot: "#EF4444", bg: "#FEF2F2", color: "#DC2626", border: "#FECACA"},
  new:     { label: "New",      dot: "var(--rtm-blue-mid)", bg: "var(--rtm-blue-xlight)", color: "var(--rtm-blue)", border: "var(--rtm-blue-light)"},
};
export function HealthBadge({ status }: { status: ClientHealthStatus }) {
  return <Badge {...healthMap[status]} />;
}

// ── Billing badge ─────────────────────────────────────────────────────────────
const billingMap: Record<BillingStatus, { label: string; dot: string; bg: string; color: string; border: string }> = {
  current:   { label: "Current",   dot: "#10B981", bg: "#ECFDF5", color: "#059669", border: "#A7F3D0"},
  overdue:   { label: "Overdue",   dot: "#EF4444", bg: "#FEF2F2", color: "#DC2626", border: "#FECACA"},
  pending:   { label: "Pending",   dot: "#F59E0B", bg: "#FFFBEB", color: "#B45309", border: "#FDE68A"},
  paused:    { label: "Paused",    dot: "#94A3B8", bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0"},
  cancelled: { label: "Cancelled", dot: "#F87171", bg: "#FFF1F2", color: "#BE123C", border: "#FECDD3"},
};
export function BillingBadge({ status }: { status: BillingStatus }) {
  return <Badge {...billingMap[status]} />;
}

// ── Campaign badge ────────────────────────────────────────────────────────────
const campaignMap: Record<CampaignStatus, { label: string; dot: string; bg: string; color: string; border: string }> = {
  active: { label: "Active", dot: "#10B981", bg: "#ECFDF5", color: "#059669", border: "#A7F3D0"},
  paused: { label: "Paused", dot: "#F59E0B", bg: "#FFFBEB", color: "#B45309", border: "#FDE68A"},
  ended:  { label: "Ended",  dot: "#94A3B8", bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0"},
  draft:  { label: "Draft",  dot: "var(--rtm-blue-mid)", bg: "var(--rtm-blue-xlight)", color: "var(--rtm-blue)", border: "var(--rtm-blue-light)"},
};
export function CampaignBadge({ status }: { status: CampaignStatus }) {
  return <Badge {...campaignMap[status]} />;
}

// ── Service badge ─────────────────────────────────────────────────────────────
const serviceMap: Record<ServiceStatus, { label: string; dot: string; bg: string; color: string; border: string }> = {
  active:    { label: "Active",    dot: "#10B981", bg: "#ECFDF5", color: "#059669", border: "#A7F3D0"},
  paused:    { label: "Paused",    dot: "#F59E0B", bg: "#FFFBEB", color: "#B45309", border: "#FDE68A"},
  cancelled: { label: "Cancelled", dot: "#94A3B8", bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0"},
};
export function ServiceBadge({ status }: { status: ServiceStatus }) {
  return <SmallBadge {...serviceMap[status]} />;
}

// ── Deliverable badge ─────────────────────────────────────────────────────────
const deliverableMap: Record<DeliverableStatus, { label: string; dot: string; bg: string; color: string; border: string }> = {
  completed:   { label: "Completed",   dot: "#10B981", bg: "#ECFDF5", color: "#059669", border: "#A7F3D0"},
  in_progress: { label: "In Progress", dot: "var(--rtm-blue-mid)", bg: "var(--rtm-blue-xlight)", color: "var(--rtm-blue)", border: "var(--rtm-blue-light)"},
  blocked:     { label: "Blocked",     dot: "#EF4444", bg: "#FEF2F2", color: "#DC2626", border: "#FECACA"},
  overdue:     { label: "Overdue",     dot: "#EF4444", bg: "#FEF2F2", color: "#DC2626", border: "#FECACA"},
  not_started: { label: "Not Started", dot: "#94A3B8", bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0"},
};
export function DeliverableBadge({ status }: { status: DeliverableStatus }) {
  return <SmallBadge {...deliverableMap[status]} />;
}
