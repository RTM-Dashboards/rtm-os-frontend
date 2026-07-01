"use client";

import React from "react";
import {
  AUDIT_REQUEST_STATUS_LABELS,
  AUDIT_REQUEST_STATUS_COLORS,
} from "@/lib/sales/audit-config";
import type { AuditRequestStatus } from "@/lib/sales/types";

interface AuditRequestStatusBadgeProps {
  status: AuditRequestStatus;
}

export function AuditRequestStatusBadge({ status }: AuditRequestStatusBadgeProps) {
  const label = AUDIT_REQUEST_STATUS_LABELS[status] ?? status;
  const colors = AUDIT_REQUEST_STATUS_COLORS[status] ?? {
    bg: "#F3F4F6",
    color: "#6B7280",
    border: "#D1D5DB",
  };

  return (
    <span
      className="inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap"
      style={{ background: colors.bg, color: colors.color, borderColor: colors.border }}
    >
      {label}
    </span>
  );
}
