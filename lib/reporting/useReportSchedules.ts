"use client";

// ── useReportSchedules — hook for Scheduled Reporting (Tab 9) ─────────────────
//
// Fetches real schedule records from /api/report-schedules on mount.
// Exposes create, update, toggleStatus (pause/resume), and remove actions
// that all persist via the API route.
//
// NOTE: schedules are configuration only — auto-triggering/generation on
// schedule is not implemented (deferred to Phase 5, when Report Generation
// has its own real pipeline).

import { useState, useEffect, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ScheduleFrequency = "Weekly" | "Bi-weekly" | "Monthly" | "Quarterly";
export type ScheduleDeliveryMethod =
  | "Email"
  | "Client Portal"
  | "Email + Portal"
  | "Manual Send";
export type ScheduleStatus = "Active" | "Paused";

export interface ReportSchedule {
  scheduleId: string;
  clientId: string;
  clientName: string;
  templateId: string;
  templateName: string;
  frequency: ScheduleFrequency;
  sendDay: string;
  deliveryMethod: ScheduleDeliveryMethod;
  assignedAM: string;
  status: ScheduleStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type ScheduleFormData = Omit<
  ReportSchedule,
  "scheduleId" | "createdAt" | "updatedAt"
>;

interface UseReportSchedulesReturn {
  schedules: ReportSchedule[];
  loading: boolean;
  error: string | null;
  createSchedule: (data: ScheduleFormData) => Promise<ReportSchedule | null>;
  updateSchedule: (
    scheduleId: string,
    updates: Partial<ScheduleFormData>
  ) => Promise<void>;
  toggleStatus: (scheduleId: string) => Promise<void>;
  removeSchedule: (scheduleId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useReportSchedules(): UseReportSchedulesReturn {
  const [schedules, setSchedules] = useState<ReportSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async () => {
    try {
      const res = await fetch("/api/report-schedules", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { schedules: ReportSchedule[] };
      setSchedules(data.schedules);
      setError(null);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSchedules();
  }, [fetchSchedules]);

  // ── Create ─────────────────────────────────────────────────────────────────

  const createSchedule = useCallback(
    async (data: ScheduleFormData): Promise<ReportSchedule | null> => {
      try {
        const res = await fetch("/api/report-schedules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`Create failed: HTTP ${res.status}`);
        const result = (await res.json()) as { schedule: ReportSchedule };
        setSchedules((prev) => [...prev, result.schedule]);
        return result.schedule;
      } catch (err) {
        setError(String(err));
        return null;
      }
    },
    []
  );

  // ── Update ─────────────────────────────────────────────────────────────────

  const updateSchedule = useCallback(
    async (
      scheduleId: string,
      updates: Partial<ScheduleFormData>
    ): Promise<void> => {
      // Optimistic update
      setSchedules((prev) =>
        prev.map((s) =>
          s.scheduleId === scheduleId
            ? { ...s, ...updates, updatedAt: new Date().toISOString() }
            : s
        )
      );

      try {
        const res = await fetch(`/api/report-schedules?id=${scheduleId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        if (!res.ok) {
          await fetchSchedules();
          throw new Error(`Update failed: HTTP ${res.status}`);
        }
        const result = (await res.json()) as { schedule: ReportSchedule };
        setSchedules((prev) =>
          prev.map((s) =>
            s.scheduleId === scheduleId ? result.schedule : s
          )
        );
      } catch (err) {
        setError(String(err));
        await fetchSchedules();
      }
    },
    [fetchSchedules]
  );

  // ── Toggle Active / Paused ─────────────────────────────────────────────────

  const toggleStatus = useCallback(
    async (scheduleId: string): Promise<void> => {
      const sched = schedules.find((s) => s.scheduleId === scheduleId);
      if (!sched) return;
      const next: ScheduleStatus =
        sched.status === "Active" ? "Paused" : "Active";
      await updateSchedule(scheduleId, { status: next });
    },
    [schedules, updateSchedule]
  );

  // ── Remove (hard delete) ───────────────────────────────────────────────────

  const removeSchedule = useCallback(
    async (scheduleId: string): Promise<void> => {
      // Optimistic remove
      setSchedules((prev) =>
        prev.filter((s) => s.scheduleId !== scheduleId)
      );

      try {
        const res = await fetch(
          `/api/report-schedules?id=${scheduleId}`,
          { method: "DELETE" }
        );
        if (!res.ok) {
          await fetchSchedules();
          throw new Error(`Delete failed: HTTP ${res.status}`);
        }
      } catch (err) {
        setError(String(err));
        await fetchSchedules();
      }
    },
    [fetchSchedules]
  );

  return {
    schedules,
    loading,
    error,
    createSchedule,
    updateSchedule,
    toggleStatus,
    removeSchedule,
    refresh: fetchSchedules,
  };
}

// ── Status display helper ─────────────────────────────────────────────────────

export type BadgeVariant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "pending"
  | "neutral";

export const scheduleStatusVariant: Record<string, BadgeVariant> = {
  Active: "success",
  Paused: "warning",
};

// ── Next-due-date computation ──────────────────────────────────────────────────
//
// Given a schedule's frequency + sendDay, compute the next date after `from`
// when the report is due to be sent. Used by Tab 8 (Reporting Calendar).
//
// sendDay semantics:
//   Monthly/Quarterly — numeric string "1"–"31" or "last"
//   Weekly            — weekday name ("Monday"–"Sunday") or "1"–"7"
//   Bi-weekly         — same as Weekly (every 2 weeks)

const WEEKDAYS: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

export function computeNextDueDate(
  schedule: Pick<ReportSchedule, "frequency" | "sendDay">,
  from: Date = new Date()
): Date {
  const { frequency, sendDay } = schedule;
  const base = new Date(from);
  base.setHours(0, 0, 0, 0);

  if (frequency === "Monthly" || frequency === "Quarterly") {
    const intervalMonths = frequency === "Monthly" ? 1 : 3;
    let year = base.getFullYear();
    let month = base.getMonth();

    // Try current month first, then walk forward
    for (let attempt = 0; attempt < intervalMonths * 4 + 1; attempt++) {
      const lastDay = new Date(year, month + 1, 0).getDate();
      const day =
        sendDay === "last"
          ? lastDay
          : Math.min(parseInt(sendDay, 10) || 1, lastDay);
      const candidate = new Date(year, month, day);
      if (candidate >= base) return candidate;

      month += intervalMonths;
      if (month >= 12) {
        year += Math.floor(month / 12);
        month = month % 12;
      }
    }
    // Fallback
    return new Date(year, month, 1);
  }

  if (frequency === "Weekly" || frequency === "Bi-weekly") {
    const weekInterval = frequency === "Bi-weekly" ? 14 : 7;
    const targetDow =
      WEEKDAYS[sendDay] ?? (parseInt(sendDay, 10) % 7 || 1);
    const currentDow = base.getDay();
    let daysAhead = (targetDow - currentDow + 7) % 7;
    if (daysAhead === 0) daysAhead = weekInterval;
    const next = new Date(base);
    next.setDate(next.getDate() + daysAhead);
    return next;
  }

  // Fallback: 30 days
  const fallback = new Date(base);
  fallback.setDate(fallback.getDate() + 30);
  return fallback;
}

export function formatNextDueDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function sendDayLabel(
  frequency: ScheduleFrequency,
  sendDay: string
): string {
  if (frequency === "Monthly" || frequency === "Quarterly") {
    if (sendDay === "last") return "Last day of period";
    const n = parseInt(sendDay, 10);
    if (!n) return sendDay;
    const suffix =
      n === 1 || n === 21 || n === 31
        ? "st"
        : n === 2 || n === 22
        ? "nd"
        : n === 3 || n === 23
        ? "rd"
        : "th";
    return `${n}${suffix} of month`;
  }
  if (frequency === "Weekly") return `Every ${sendDay}`;
  if (frequency === "Bi-weekly") return `Every other ${sendDay}`;
  return sendDay;
}
