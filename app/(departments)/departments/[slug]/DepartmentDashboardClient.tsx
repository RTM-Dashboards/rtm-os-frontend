"use client";

// ── Department Dashboard Client Wrapper ───────────────────────────────────────
// Thin client component boundary. All rendering logic lives in
// DepartmentDashboard. This file only exists to satisfy Next.js
// Server / Client boundary requirements.

import { DepartmentDashboard } from "@/components/departments";
import type { DepartmentConfig } from "@/types/department";

interface Props {
  dept: DepartmentConfig;
}

export default function DepartmentDashboardClient({ dept }: Props) {
  return <DepartmentDashboard dept={dept} />;
}
