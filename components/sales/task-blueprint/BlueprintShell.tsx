"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import type { ProjectRecord } from "@/lib/sales/project-config";
import type { GeneratedTask } from "@/lib/sales/blueprint-config";
import {
  generateAllProjectTasks,
  computeBlueprintSummary,
  activateBlueprint,
  type BlueprintSummary,
} from "@/lib/sales/blueprint-engine";
import { BlueprintActivationBar } from "./BlueprintActivationBar";
import { BlueprintServiceCard } from "./BlueprintServiceCard";

// ─── Props ────────────────────────────────────────────────────────────────────

interface BlueprintShellProps {
  project: ProjectRecord;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BlueprintShell({ project }: BlueprintShellProps) {
  const [tasks, setTasks] = useState<GeneratedTask[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [activated, setActivated] = useState(false);
  const [summary, setSummary] = useState<BlueprintSummary>({
    totalTasks: 0,
    criticalTasks: 0,
    recurringTasks: 0,
    estimatedTotalHours: 0,
    departmentBreakdown: {},
    earliestDueDate: "",
    latestDueDate: "",
  });

  // Generate tasks on mount
  useEffect(() => {
    const startDate = project.startDate || new Date().toISOString().split("T")[0];
    const generated = generateAllProjectTasks(project, startDate);
    setTasks(generated);
    setSummary(computeBlueprintSummary(generated));
  }, [project]);

  // Grouped tasks by serviceId
  const tasksByService = useMemo(() => {
    const groups: Record<string, GeneratedTask[]> = {};
    for (const task of tasks) {
      if (!groups[task.serviceId]) {
        groups[task.serviceId] = [];
      }
      groups[task.serviceId].push(task);
    }
    return groups;
  }, [tasks]);

  // Assignment counts
  const assignedCount = useMemo(() => {
    return tasks.filter((t) => assignments[t.id] || t.assignedTo).length;
  }, [tasks, assignments]);

  // All critical tasks must be assigned before activation
  const allCriticalAssigned = useMemo(() => {
    const criticalTasks = tasks.filter((t) => t.priority === "critical");
    if (criticalTasks.length === 0) return tasks.length > 0;
    return criticalTasks.every((t) => !!(assignments[t.id] || t.assignedTo));
  }, [tasks, assignments]);

  // Handlers
  function handleAssign(taskId: string, assignedTo: string) {
    setAssignments((prev) => ({ ...prev, [taskId]: assignedTo }));
  }

  function handleActivate() {
    const activatedTasks = activateBlueprint(tasks, assignments);
    setTasks(activatedTasks);
    setSummary(computeBlueprintSummary(activatedTasks));
    setActivated(true);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* ── Header ── */}
      <div
        className="rounded-xl px-6 py-5"
        style={{
          background: "var(--rtm-surface)",
          border: "1px solid var(--rtm-border)",
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-widest mb-1"
              style={{ color: "var(--rtm-blue)" }}
            >
              Task Blueprint
            </p>
            <h2
              className="text-xl font-black"
              style={{ color: "var(--rtm-text-primary)" }}
            >
              {project.clientName}
            </h2>
            <p
              className="text-sm mt-0.5"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              {project.projectNumber}
              {project.services.length > 0 && (
                <> &mdash; {project.services.length} service{project.services.length !== 1 ? "s" : ""}</>
              )}
            </p>
          </div>

          {activated && (
            <Link
              href="/tasks/department-activation"
              className="px-4 py-2 rounded-lg text-sm font-bold text-white inline-flex items-center gap-2"
              style={{ background: "#059669" }}
            >
              View Department Activation
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </div>

      {/* ── Activation Bar ── */}
      <BlueprintActivationBar
        summary={summary}
        activated={activated}
        assignedCount={assignedCount}
        totalCount={tasks.length}
      />

      {/* ── No tasks fallback ── */}
      {tasks.length === 0 && (
        <div
          className="rounded-xl py-12 text-center"
          style={{
            background: "var(--rtm-surface)",
            border: "1px solid var(--rtm-border)",
          }}
        >
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            No blueprint tasks found for the services in this project.
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            Ensure service names match a configured service blueprint.
          </p>
        </div>
      )}

      {/* ── Service Cards ── */}
      {project.services.map((service) => {
        const serviceTasks = tasksByService[service.serviceId] ?? [];
        // If no tasks matched by serviceId, try matching by serviceName key
        const serviceTasksFallback =
          serviceTasks.length > 0
            ? serviceTasks
            : Object.values(tasksByService).find((group) =>
                group.some(
                  (t) =>
                    t.serviceName.toLowerCase() ===
                    service.serviceName.toLowerCase()
                )
              ) ?? [];

        if (serviceTasksFallback.length === 0) return null;

        return (
          <BlueprintServiceCard
            key={service.serviceId}
            serviceId={service.serviceId}
            serviceName={service.serviceName}
            department={service.department}
            tasks={serviceTasksFallback}
            assignments={assignments}
            onAssign={handleAssign}
          />
        );
      })}

      {/* ── Activate Button ── */}
      {tasks.length > 0 && (
        <div
          className="rounded-xl px-5 py-4 flex flex-wrap items-center justify-between gap-4"
          style={{
            background: "var(--rtm-surface)",
            border: "1px solid var(--rtm-border)",
          }}
        >
          <div>
            {!allCriticalAssigned && !activated && (
              <p
                className="text-xs font-semibold"
                style={{ color: "#DC2626" }}
              >
                Assign all critical tasks before activating.
              </p>
            )}
            {activated && (
              <p
                className="text-xs font-semibold"
                style={{ color: "#059669" }}
              >
                Blueprint activated. Tasks are now active and visible to departments.
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {activated ? (
              <Link
                href="/tasks/department-activation"
                className="px-5 py-2.5 rounded-lg text-sm font-bold text-white inline-flex items-center gap-2"
                style={{ background: "#059669" }}
              >
                View Department Activation
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <button
                type="button"
                disabled={!allCriticalAssigned}
                onClick={handleActivate}
                className="px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-opacity"
                style={{
                  background: allCriticalAssigned ? "var(--rtm-blue)" : "#94A3B8",
                  cursor: allCriticalAssigned ? "pointer" : "not-allowed",
                  opacity: allCriticalAssigned ? 1 : 0.65,
                }}
              >
                Activate Blueprint
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Post-activation CTA ── */}
      {activated && (
        <div
          className="rounded-xl px-5 py-4"
          style={{
            background: "#ECFDF5",
            border: "1px solid #A7F3D0",
          }}
        >
          <p
            className="text-sm font-bold mb-1"
            style={{ color: "#059669" }}
          >
            Blueprint activated successfully
          </p>
          <p
            className="text-xs mb-3"
            style={{ color: "#065F46" }}
          >
            {summary.totalTasks} tasks have been generated and are now active. Departments
            can view their assigned tasks in the department activation queue.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/tasks/department-activation"
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
              style={{ background: "#059669" }}
            >
              View Department Activation
            </Link>
            <Link
              href="/tasks"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{
                background: "white",
                color: "#059669",
                border: "1px solid #A7F3D0",
              }}
            >
              Global Tasks
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
