/**
 * useDeptTaskStats — shared hook for per-department live task stats.
 *
 * Fetches /api/tasks (Postgres) and aggregates open count, overdue count,
 * and SLA % per department.
 *
 * SLA formula: Math.round(((open - overdue) / open) * 100), returns 100 when open = 0.
 *
 * Postgres task statuses: "open" | "in_progress" | "done" | "skipped"
 * "done" and "skipped" are terminal — all others count as open.
 * dueDate is an ISO-8601 date string or null.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import type { TaskListItem } from "@/app/api/tasks/route";

export interface DeptTaskStat {
  dept: string;
  openTasks: number;
  overdueTasks: number;
  /** SLA % = (open − overdue) / open × 100; 100 when open === 0 */
  slaCompliance: number;
}

export interface UseDeptTaskStatsResult {
  stats: Map<string, DeptTaskStat>;
  loading: boolean;
}

function estimateSLA(open: number, overdue: number): number {
  if (open === 0) return 100;
  return Math.round(((open - overdue) / open) * 100);
}

export function useDeptTaskStats(): UseDeptTaskStatsResult {
  const [stats, setStats] = useState<Map<string, DeptTaskStat>>(new Map());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = (await res.json()) as { tasks: TaskListItem[] };
        const today = new Date().toISOString().split("T")[0];

        const deptMap = new Map<string, { open: number; overdue: number }>();
        for (const task of data.tasks) {
          const dept = task.department ?? "Unknown";
          // Terminal statuses: "done" and "skipped"
          if (task.status === "done" || task.status === "skipped") continue;

          if (!deptMap.has(dept)) deptMap.set(dept, { open: 0, overdue: 0 });
          const entry = deptMap.get(dept)!;
          entry.open++;
          if (task.dueDate && task.dueDate < today) entry.overdue++;
        }

        const result = new Map<string, DeptTaskStat>();
        for (const [dept, { open, overdue }] of deptMap.entries()) {
          result.set(dept, {
            dept,
            openTasks: open,
            overdueTasks: overdue,
            slaCompliance: estimateSLA(open, overdue),
          });
        }
        setStats(result);
      }
    } catch {
      // leave empty — callers render nothing rather than invented numbers
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { stats, loading };
}
