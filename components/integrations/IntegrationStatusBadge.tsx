import type { IntegrationStatus } from "@/lib/integrations/types";
import StatusBadge from "@/components/ui/StatusBadge";
import type { StatusVariant } from "@/components/ui/StatusBadge";

const STATUS_MAP: Record<IntegrationStatus, { variant: StatusVariant; label: string }> = {
  connected:    { variant: "success",  label: "Connected"},
  disconnected: { variant: "neutral",  label: "Disconnected"},
  pending:      { variant: "pending",  label: "Pending Setup"},
  error:        { variant: "error",    label: "Error"},
  disabled:     { variant: "neutral",  label: "Disabled"},
};

interface Props {
  status: IntegrationStatus;
  size?: "sm"| "md";
}

export default function IntegrationStatusBadge({ status, size = "sm"}: Props) {
  const { variant, label } = STATUS_MAP[status];
  return <StatusBadge variant={variant} label={label} size={size} />;
}
