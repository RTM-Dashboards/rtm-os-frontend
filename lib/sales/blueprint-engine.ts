// RTM OS — Task Blueprint Engine
// Pure functions only. No React. No UI imports.
// Consumes blueprint-config.ts and project-config.ts.

import {
  SERVICE_BLUEPRINTS,
  type ServiceBlueprint,
  type GeneratedTask,
} from "./blueprint-config";
import type { ProjectRecord } from "./project-config";

// ─── Add Days to a Date String ────────────────────────────────────────────────

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

// ─── Generate Unique Task ID ──────────────────────────────────────────────────

function generateTaskId(
  projectId: string,
  serviceId: string,
  blueprintTaskId: string
): string {
  return `task-${projectId}-${serviceId}-${blueprintTaskId}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

// ─── Get Blueprint for a Service ─────────────────────────────────────────────

export function getBlueprintForService(
  serviceId: string
): ServiceBlueprint | undefined {
  return SERVICE_BLUEPRINTS.find((bp) => bp.serviceId === serviceId);
}

// ─── Match Blueprint by Service Name (fuzzy) ─────────────────────────────────
// Project service assignments use display names like "SEO", "Meta Ads", etc.
// This tries an exact serviceId match first, then falls back to serviceName.

export function getBlueprintForServiceName(
  serviceName: string
): ServiceBlueprint | undefined {
  const normalized = serviceName.trim().toLowerCase();
  return SERVICE_BLUEPRINTS.find(
    (bp) =>
      bp.serviceId.toLowerCase() === normalized ||
      bp.serviceName.toLowerCase() === normalized
  );
}

// ─── Generate Tasks from Blueprint ───────────────────────────────────────────

export function generateTasksFromBlueprint(
  blueprint: ServiceBlueprint,
  projectId: string,
  clientName: string,
  startDate: string
): GeneratedTask[] {
  const now = new Date().toISOString();

  return blueprint.tasks.map((bt) => ({
    id: generateTaskId(projectId, blueprint.serviceId, bt.id),
    blueprintTaskId: bt.id,
    projectId,
    clientName,
    serviceId: blueprint.serviceId,
    serviceName: blueprint.serviceName,
    department: blueprint.department,
    name: bt.name,
    description: bt.description,
    type: bt.type,
    priority: bt.priority,
    status: "pending" as const,
    assignedTo: null,
    assignedRole: bt.assignedRole,
    estimatedHours: bt.estimatedHours,
    dueDate: addDays(startDate, bt.dueDaysFromStart),
    recurring: bt.recurring,
    recurringInterval: bt.recurringInterval,
    createdAt: now,
  }));
}

// ─── Generate All Project Tasks ───────────────────────────────────────────────

export function generateAllProjectTasks(
  project: ProjectRecord,
  startDate: string
): GeneratedTask[] {
  const allTasks: GeneratedTask[] = [];

  for (const service of project.services) {
    // Try matching by serviceId first, then by serviceName
    const blueprint =
      getBlueprintForService(service.serviceId) ??
      getBlueprintForServiceName(service.serviceName);

    if (blueprint) {
      const tasks = generateTasksFromBlueprint(
        blueprint,
        project.id,
        project.clientName,
        startDate
      );
      allTasks.push(...tasks);
    }
  }

  return allTasks;
}

// ─── Blueprint Summary ────────────────────────────────────────────────────────

export interface BlueprintSummary {
  totalTasks: number;
  criticalTasks: number;
  recurringTasks: number;
  estimatedTotalHours: number;
  departmentBreakdown: Record<string, number>;
  earliestDueDate: string;
  latestDueDate: string;
}

export function computeBlueprintSummary(tasks: GeneratedTask[]): BlueprintSummary {
  if (tasks.length === 0) {
    return {
      totalTasks: 0,
      criticalTasks: 0,
      recurringTasks: 0,
      estimatedTotalHours: 0,
      departmentBreakdown: {},
      earliestDueDate: "",
      latestDueDate: "",
    };
  }

  const departmentBreakdown: Record<string, number> = {};
  let estimatedTotalHours = 0;
  let criticalTasks = 0;
  let recurringTasks = 0;

  for (const task of tasks) {
    estimatedTotalHours += task.estimatedHours;
    if (task.priority === "critical") criticalTasks++;
    if (task.recurring) recurringTasks++;
    departmentBreakdown[task.department] =
      (departmentBreakdown[task.department] ?? 0) + 1;
  }

  const dueDates = tasks.map((t) => t.dueDate).filter(Boolean).sort();

  return {
    totalTasks: tasks.length,
    criticalTasks,
    recurringTasks,
    estimatedTotalHours,
    departmentBreakdown,
    earliestDueDate: dueDates[0] ?? "",
    latestDueDate: dueDates[dueDates.length - 1] ?? "",
  };
}

// ─── Activate Blueprint ───────────────────────────────────────────────────────

export function activateBlueprint(
  tasks: GeneratedTask[],
  assignments: Record<string, string>
): GeneratedTask[] {
  return tasks.map((task) => {
    const assignedTo = assignments[task.id] ?? task.assignedTo;
    return {
      ...task,
      assignedTo,
      status: task.status === "pending" ? "active" : task.status,
    };
  });
}
