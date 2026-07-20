"use client";

// ── useReportInputs — hook for Department Inputs Center (Tab 2) ───────────────
//
// Fetches from /api/report-inputs on mount, exposes inputs + markReceived().
// markReceived PATCHes the API and optimistically updates local state so the
// UI responds instantly.  Cross-page consistency after hard refresh is
// guaranteed by the file-backed JSON store.

import { useState, useEffect, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ReportInput {
  inputId: string;
  reportId: string;
  clientName: string;
  department: string;
  inputNeeded: string;
  owner: string;
  dueDate: string;
  status: "Pending" | "In Progress" | "Received" | "Overdue";
  blocker: string;
  notes: string;
  receivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ReportInputUpdates = Partial<
  Pick<ReportInput, "status" | "blocker" | "notes">
>;

interface UseReportInputsReturn {
  inputs: ReportInput[];
  loading: boolean;
  error: string | null;
  markReceived: (inputId: string) => Promise<void>;
  updateInput: (inputId: string, updates: ReportInputUpdates) => Promise<void>;
  refresh: () => Promise<void>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useReportInputs(): UseReportInputsReturn {
  const [inputs, setInputs] = useState<ReportInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInputs = useCallback(async () => {
    try {
      const res = await fetch("/api/report-inputs", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { inputs: ReportInput[] };
      setInputs(data.inputs);
      setError(null);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchInputs();
  }, [fetchInputs]);

  const updateInput = useCallback(
    async (inputId: string, updates: ReportInputUpdates): Promise<void> => {
      // Optimistic update
      setInputs((prev) =>
        prev.map((inp) =>
          inp.inputId === inputId
            ? {
                ...inp,
                ...updates,
                updatedAt: new Date().toISOString(),
                receivedAt:
                  updates.status === "Received" && inp.status !== "Received"
                    ? new Date().toISOString()
                    : inp.receivedAt,
              }
            : inp
        )
      );

      try {
        const res = await fetch("/api/report-inputs", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inputId, updates }),
        });
        if (!res.ok) {
          await fetchInputs();
          throw new Error(`Update failed: HTTP ${res.status}`);
        }
        const data = (await res.json()) as { input: ReportInput };
        setInputs((prev) =>
          prev.map((inp) => (inp.inputId === inputId ? data.input : inp))
        );
      } catch (err) {
        setError(String(err));
        await fetchInputs();
      }
    },
    [fetchInputs]
  );

  const markReceived = useCallback(
    (inputId: string): Promise<void> =>
      updateInput(inputId, { status: "Received" }),
    [updateInput]
  );

  return {
    inputs,
    loading,
    error,
    markReceived,
    updateInput,
    refresh: fetchInputs,
  };
}

// ── Status display helpers ────────────────────────────────────────────────────

export type BadgeVariant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "pending"
  | "neutral";

export const inputStatusVariant: Record<string, BadgeVariant> = {
  Received: "success",
  "In Progress": "info",
  Pending: "pending",
  Overdue: "error",
};
