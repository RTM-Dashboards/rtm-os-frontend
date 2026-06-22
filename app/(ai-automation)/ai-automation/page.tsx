"use client";

// ── AI Automation Workspace Dashboard ─────────────────────────────────────────
// Configuration-driven department dashboard for AI Automation.

import { DepartmentDashboard } from "@/components/departments";
import { getDepartmentConfig } from "@/lib/departments/config";
import { notFound } from "next/navigation";

const dept = getDepartmentConfig("ai-automation");

export default function AiAutomationPage() {
  if (!dept) {
    notFound();
    return null;
  }
  return <DepartmentDashboard dept={dept} />;
}
