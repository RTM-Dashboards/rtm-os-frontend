"use client";

import { useState, useEffect, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type AutomationRuleStatus = "Active" | "Paused" | "Draft" | "Error";
export type AutomationRuleCategory = "Workflow" | "Scheduled";

export interface AutomationRule {
  ruleId: string;
  name: string;
  category: AutomationRuleCategory;
  reportType: string;
  trigger: string;
  action: string;
  schedule: string;
  recipients: string[];
  clients: string[];
  status: AutomationRuleStatus;
  lastRun: string;
  nextRun: string;
  runsTotal: number;
  runsFailed: number;
  template: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationRuleFormData {
  name: string;
  category: AutomationRuleCategory;
  reportType: string;
  trigger: string;
  action: string;
  schedule: string;
  recipients: string[];
  clients: string[];
  status: AutomationRuleStatus;
  template: string;
  notes: string;
}

// ── Status variant helpers ─────────────────────────────────────────────────────

export const ruleStatusVariant: Record<AutomationRuleStatus, "success" | "warning" | "error" | "info" | "pending" | "neutral"> = {
  Active:  "success",
  Paused:  "warning",
  Draft:   "neutral",
  Error:   "error",
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useReportAutomationRules() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRules = useCallback(async () => {
    try {
      const res = await fetch("/api/report-automation-rules", { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      const data = (await res.json()) as { rules: AutomationRule[] };
      setRules(data.rules);
    } catch {
      // leave previous state on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRules();
  }, [fetchRules]);

  // ── Create ─────────────────────────────────────────────────────────────────
  const createRule = useCallback(async (form: AutomationRuleFormData): Promise<AutomationRule | null> => {
    try {
      const res = await fetch("/api/report-automation-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { rule: AutomationRule };
      setRules((prev) => [...prev, data.rule]);
      return data.rule;
    } catch {
      return null;
    }
  }, []);

  // ── Update ─────────────────────────────────────────────────────────────────
  const updateRule = useCallback(async (ruleId: string, patch: Partial<AutomationRuleFormData>): Promise<AutomationRule | null> => {
    try {
      const res = await fetch(`/api/report-automation-rules/${ruleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { rule: AutomationRule };
      setRules((prev) => prev.map((r) => (r.ruleId === ruleId ? data.rule : r)));
      return data.rule;
    } catch {
      return null;
    }
  }, []);

  // ── Toggle Pause/Resume ─────────────────────────────────────────────────────
  const toggleStatus = useCallback(async (ruleId: string): Promise<void> => {
    const rule = rules.find((r) => r.ruleId === ruleId);
    if (!rule) return;
    const newStatus: AutomationRuleStatus = rule.status === "Active" ? "Paused" : "Active";
    await updateRule(ruleId, { status: newStatus });
  }, [rules, updateRule]);

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteRule = useCallback(async (ruleId: string): Promise<void> => {
    try {
      const res = await fetch(`/api/report-automation-rules/${ruleId}`, { method: "DELETE" });
      if (!res.ok) return;
      setRules((prev) => prev.filter((r) => r.ruleId !== ruleId));
    } catch {
      // leave previous state on error
    }
  }, []);

  // ── Run Now (manual test trigger) ──────────────────────────────────────────
  const runNow = useCallback(async (ruleId: string): Promise<string> => {
    try {
      const res = await fetch(`/api/report-automation-rules/${ruleId}/run`, {
        method: "POST",
      });
      if (!res.ok) return "Error: could not record run";
      const data = (await res.json()) as { rule: AutomationRule; message: string };
      setRules((prev) => prev.map((r) => (r.ruleId === ruleId ? data.rule : r)));
      return data.message;
    } catch {
      return "Error: could not record run";
    }
  }, []);

  return {
    rules,
    loading,
    createRule,
    updateRule,
    toggleStatus,
    deleteRule,
    runNow,
    refresh: fetchRules,
  };
}
