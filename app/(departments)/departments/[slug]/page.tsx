// ── Dynamic Department Page ───────────────────────────────────────────────────
// Route: /departments/[slug]
//
// Looks up the department from the configuration registry and renders the
// fully config-driven DepartmentDashboard. No department-specific code here.
// To add a new department: add an entry to lib/departments/config.ts only.

import { notFound } from "next/navigation";
import { getDepartmentConfig } from "@/lib/departments/config";
import DepartmentDashboardClient from "./DepartmentDashboardClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function DepartmentPage({ params }: Props) {
  const { slug } = await params;
  const dept = getDepartmentConfig(slug);

  if (!dept) {
    notFound();
  }

  return <DepartmentDashboardClient dept={dept} />;
}

// Generate static paths for all configured departments
export async function generateStaticParams() {
  const { DEPARTMENT_CONFIGS } = await import("@/lib/departments/config");
  return DEPARTMENT_CONFIGS.map((d) => ({ slug: d.id }));
}
