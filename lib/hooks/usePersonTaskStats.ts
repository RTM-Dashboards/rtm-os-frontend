/**
 * usePersonTaskStats — per-person task metric aggregation.
 *
 * Fetches /api/engine?resource=tasks and computes real task metrics for each
 * unique assignedUserName within the supplied department filter list.
 *
 * Output per person:
 *   completed    — count of tasks with status "Completed"
 *   total        — count of all tasks (any status)
 *   open         — non-Completed, non-Cancelled tasks
 *   overdue      — open tasks whose dueDate < today
 *   slaCompliance — (open − overdue) / open × 100; 100 when open === 0
 *   utilization  — completed / total × 100; 0 when total === 0
 *
 * This is the canonical per-person task data source for the SEO & Local
 * department. The team-level rollup (SeoTeamPerformanceRollup) aggregates
 * these same numbers across each team's members — no second computation.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import type { Task } from "@/lib/engine/types";

// ── Output types ──────────────────────────────────────────────────────────────

export interface PersonTaskStat {
  name: string;
  /** Tasks with status === "Completed" */
  completed: number;
  /** All tasks assigned to this person */
  total: number;
  /** Non-Completed, non-Cancelled tasks */
  open: number;
  /** Open tasks whose dueDate < today (ISO YYYY-MM-DD) */
  overdue: number;
  /** (open − overdue) / open × 100; 100 when open === 0 */
  slaCompliance: number;
  /** completed / total × 100; 0 when total === 0 */
  utilization: number;
}

export interface UsePersonTaskStatsResult {
  /** Map from assignedUserName → PersonTaskStat */
  stats: Map<string, PersonTaskStat>;
  loading: boolean;
  error: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function calcSla(open: number, overdue: number): number {
  if (open === 0) return 100;
  return Math.round(((open - overdue) / open) * 100);
}

function calcUtilization(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * @param departments  Array of engine DepartmentName strings to include.
 *                     For SEO & Local use ["SEO", "GBP"].
 *                     Pass an empty array to include all departments.
 */
export function usePersonTaskStats(departments: string[]): UsePersonTaskStatsResult {
  const [stats, setStats] = useState<Map<string, PersonTaskStat>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const deptKey = departments.slice().sort().join(",");

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/engine?resource=tasks");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { tasks: Task[] };
      const today = new Date().toISOString().split("T")[0];

      // Filter to the requested departments (empty → all)
      const filtered =
        departments.length === 0
          ? data.tasks
          : data.tasks.filter((t) => departments.includes(t.department as string));

      // Aggregate per assignedUserName
      const personMap = new Map<
        string,
        { completed: number; total: number; open: number; overdue: number }
      >();

      for (const task of filtered) {
        const name = task.assignedUserName?.trim();
        if (!name || name === "Unassigned") continue;

        if (!personMap.has(name)) {
          personMap.set(name, { completed: 0, total: 0, open: 0, overdue: 0 });
        }
        const entry = personMap.get(name)!;
        entry.total++;

        if (task.status === "Completed") {
          entry.completed++;
        } else if (task.status !== "Cancelled") {
          entry.open++;
          if (task.dueDate < today) {
            entry.overdue++;
          }
        }
      }

      const result = new Map<string, PersonTaskStat>();
      for (const [name, counts] of personMap.entries()) {
        result.set(name, {
          name,
          completed: counts.completed,
          total: counts.total,
          open: counts.open,
          overdue: counts.overdue,
          slaCompliance: calcSla(counts.open, counts.overdue),
          utilization: calcUtilization(counts.completed, counts.total),
        });
      }

      setStats(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deptKey]);

  useEffect(() => {
    void load();
  }, [load]);

  return { stats, loading, error };
}
