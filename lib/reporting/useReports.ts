"use client";

// ── useReports — shared hook for all 6 in-scope reporting surfaces ────────────
//
// Fetches from /api/reports on mount, exposes records + updateReportStatus().
// updateReportStatus PATCHes the API and optimistically updates local state so
// all mounted surfaces (tabs + sub-pages) see the change immediately within the
// same React tree.  Cross-page consistency after a hard refresh is guaranteed by
// the file-backed JSON store.

import { useState, useEffect, useCallback } from "react";

// ── Types (mirrored from the API route — client-safe) ─────────────────────────

export interface ReportRecord {
  reportId: string;
  clientId: string;
  clientName: string;
  reportName: string;
  reportType: string;
  period: string;
  ownerId: string;
  amId: string;
  dueDate: string;
  deliveryMethod: string;
  priority: "High" | "Normal" | "Low";
  status: string;
  qaStatus: string;
  deptReviewStatus: string;
  amStatus: string;
  deliveryStatus: string;
  progressPct: number;
  draftReady: boolean;
  aiStatus: string;
  createdAt: string;
  updatedAt: string;
}

export type ReportUpdates = Partial<
  Pick<
    ReportRecord,
    | "status"
    | "qaStatus"
    | "deptReviewStatus"
    | "amStatus"
    | "deliveryStatus"
    | "progressPct"
    | "draftReady"
    | "aiStatus"
  >
>;

interface UseReportsReturn {
  records: ReportRecord[];
  loading: boolean;
  error: string | null;
  updateReportStatus: (reportId: string, updates: ReportUpdates) => Promise<void>;
  refresh: () => Promise<void>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useReports(): UseReportsReturn {
  const [records, setRecords] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    try {
      const res = await fetch("/api/reports", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { records: ReportRecord[] };
      setRecords(data.records);
      setError(null);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRecords();
  }, [fetchRecords]);

  const updateReportStatus = useCallback(
    async (reportId: string, updates: ReportUpdates): Promise<void> => {
      // Optimistic update — apply immediately so the UI responds instantly
      setRecords((prev) =>
        prev.map((r) =>
          r.reportId === reportId
            ? { ...r, ...updates, updatedAt: new Date().toISOString() }
            : r
        )
      );

      try {
        const res = await fetch("/api/reports", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportId, updates }),
        });
        if (!res.ok) {
          // Roll back on failure by re-fetching
          await fetchRecords();
          throw new Error(`Update failed: HTTP ${res.status}`);
        }
        const data = (await res.json()) as { record: ReportRecord };
        // Reconcile with server response
        setRecords((prev) =>
          prev.map((r) => (r.reportId === reportId ? data.record : r))
        );
      } catch (err) {
        setError(String(err));
        await fetchRecords();
      }
    },
    [fetchRecords]
  );

  return {
    records,
    loading,
    error,
    updateReportStatus,
    refresh: fetchRecords,
  };
}

// ── Status display helpers (shared across all surfaces) ───────────────────────

export type BadgeVariant = "success" | "warning" | "error" | "info" | "pending" | "neutral";

export const reportStatusVariant: Record<string, BadgeVariant> = {
  "Not Started":                    "neutral",
  "Data Gathering":                 "info",
  "Waiting For Department Input":   "warning",
  "Drafting":                       "info",
  "QA Review":                      "info",
  "AM Review":                      "info",
  "Ready To Send":                  "success",
  "Sent":                           "success",
  "Needs Revision":                 "error",
  "Overdue":                        "error",
};

export const qaStatusVariant: Record<string, BadgeVariant> = {
  "Pending QA":           "neutral",
  "QA In Progress":       "info",
  "Issues Found":         "error",
  "Revision Requested":   "warning",
  "Approved":             "success",
};

export const amStatusVariant: Record<string, BadgeVariant> = {
  "Pending AM Review":    "neutral",
  "In Review":            "info",
  "Approved By AM":       "success",
  "Revision Requested":   "warning",
  "Escalated":            "error",
};

export const deliveryStatusVariant: Record<string, BadgeVariant> = {
  "Not Ready":            "neutral",
  "Ready To Send":        "pending",
  "Scheduled":            "info",
  "Sent":                 "info",
  "Viewed":               "success",
  "Feedback Received":    "success",
  "Follow-up Needed":     "warning",
};

export const deptReviewStatusVariant: Record<string, BadgeVariant> = {
  "Pending Assignment":   "neutral",
  "Assigned":             "info",
  "In Review":            "info",
  "Approved":             "success",
  "Revision Requested":   "warning",
  "Overdue":              "error",
};
