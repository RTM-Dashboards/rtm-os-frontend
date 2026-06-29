// RTM OS — Sales Project Creation Engine
// Pure functions only. No React. No UI imports.
// Consumes project-config.ts and lib/sales/types.ts.

import {
  DEPARTMENT_MAP,
  DEFAULT_LAUNCH_DURATION_DAYS,
  type ProjectRecord,
  type ProjectStatus,
  type ProjectPhase,
  type ProjectServiceAssignment,
} from "./project-config";
import type { HandoffRecord } from "./handoff-engine";

// ─── Generate Project Number ──────────────────────────────────────────────────

export function generateProjectNumber(): string {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(1000 + Math.random() * 9000));
  return `PRJ-${year}-${seq}`;
}

// ─── Parse Currency String ────────────────────────────────────────────────────

function parseCurrency(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/[^0-9.]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

// ─── Add Days to Date ─────────────────────────────────────────────────────────

function addDays(date: Date, days: number): string {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split("T")[0];
}

// ─── Build Project From Handoff ───────────────────────────────────────────────

export function buildProjectFromHandoff(
  handoffRecord: HandoffRecord,
  summaryFields: Record<string, string>
): ProjectRecord {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // Extract services from summary field
  const servicesSold = summaryFields["services-sold"] ?? "";
  const serviceNames = servicesSold
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Parse financials
  const monthlyValue = parseCurrency(summaryFields["monthly-recurring-revenue"] ?? "0");
  const setupFees = parseCurrency(summaryFields["setup-fees"] ?? "0");
  const perServiceValue =
    serviceNames.length > 0 ? Math.round(monthlyValue / serviceNames.length) : 0;

  // Build service assignments
  const services: ProjectServiceAssignment[] = serviceNames.map((name, i) => ({
    serviceId: `svc-${i + 1}`,
    serviceName: name,
    department: DEPARTMENT_MAP[name] ?? "Operations",
    assignedTo: null,
    status: "pending",
    startDate: todayStr,
    estimatedCompletionDate: addDays(today, DEFAULT_LAUNCH_DURATION_DAYS),
    monthlyValue: perServiceValue,
  }));

  // Extract assigned AM from summary fields
  const assignedAM = summaryFields["assigned-am"] ?? null;

  return {
    id: crypto.randomUUID(),
    projectNumber: generateProjectNumber(),
    clientName: summaryFields["client-name"] ?? handoffRecord.clientName,
    contractNumber:
      summaryFields["contract-number"] ?? handoffRecord.contractNumber,
    handoffId: handoffRecord.id,
    proposalId: "",
    status: "not-started",
    priority: "high",
    phase: "onboarding",
    services,
    totalMonthlyValue: monthlyValue,
    totalSetupFees: setupFees,
    assignedAM,
    createdAt: new Date().toISOString(),
    startDate: todayStr,
    estimatedLaunchDate: addDays(today, DEFAULT_LAUNCH_DURATION_DAYS),
    notes: summaryFields["special-instructions"] ?? "",
  };
}

// ─── Assign Department Member ─────────────────────────────────────────────────

export function assignDepartment(
  project: ProjectRecord,
  serviceId: string,
  assignedTo: string
): ProjectRecord {
  const updatedServices = project.services.map((svc) => {
    if (svc.serviceId !== serviceId) return svc;
    return {
      ...svc,
      assignedTo,
      status: "assigned" as const,
    };
  });

  return {
    ...project,
    services: updatedServices,
  };
}

// ─── Update Project Status ────────────────────────────────────────────────────

export function updateProjectStatus(
  project: ProjectRecord,
  status: ProjectStatus
): ProjectRecord {
  return {
    ...project,
    status,
  };
}

// ─── Update Project Phase ─────────────────────────────────────────────────────

export function updateProjectPhase(
  project: ProjectRecord,
  phase: ProjectPhase
): ProjectRecord {
  return {
    ...project,
    phase,
  };
}

// ─── Compute Project Readiness ────────────────────────────────────────────────

export function computeProjectReadiness(project: ProjectRecord): number {
  if (project.services.length === 0) return 0;
  const assigned = project.services.filter(
    (svc) => svc.assignedTo !== null && svc.status !== "pending"
  ).length;
  return Math.round((assigned / project.services.length) * 100);
}
