/**
 * useDeptTaskStats — shared hook for per-department live task stats.
 *
 * Fetches /api/engine?resource=tasks and aggregates open count, overdue count,
 * and SLA % per department. Matches the exact logic used by Workload Planning
 * (/tasks/workload-planning/page.tsx).
 *
 * SLA formula: Math.round(((open - overdue) / open) * 100), returns 100 when open = 0.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import type { Task } from "@/lib/engine/types";

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
      const res = await fetch("/api/engine?resource=tasks");
      if (res.ok) {
        const data = (await res.json()) as { tasks: Task[] };
        const today = new Date().toISOString().split("T")[0];

        const deptMap = new Map<string, { open: number; overdue: number }>();
        for (const task of data.tasks) {
          const dept = task.department as string;
          if (!deptMap.has(dept)) deptMap.set(dept, { open: 0, overdue: 0 });
          const entry = deptMap.get(dept)!;
          if (task.status !== "Completed" && task.status !== "Cancelled") {
            entry.open++;
            if (task.dueDate < today) entry.overdue++;
          }
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
      // leave empty — callers will fall back to mock values
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { stats, loading };
}
