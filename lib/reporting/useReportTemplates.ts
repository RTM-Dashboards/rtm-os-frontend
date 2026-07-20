"use client";

// ── useReportTemplates — hook for Template Library (Tab 6) ────────────────────
//
// Fetches from /api/report-templates on mount.
// Exposes create / update / archive actions that persist via the API route.
// Optimistic updates keep the UI responsive.

import { useState, useEffect, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ReportTemplate {
  templateId: string;
  name: string;
  version: string;
  department: string;
  sections: string[];
  dataConnections: string[];
  frequency: string;
  owner: string;
  status: "Active" | "Draft" | "Archived";
  usageCount: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type TemplateFormData = Pick<
  ReportTemplate,
  | "name"
  | "version"
  | "department"
  | "sections"
  | "dataConnections"
  | "frequency"
  | "owner"
  | "status"
  | "description"
>;

export type TemplateUpdates = Partial<
  Pick<
    ReportTemplate,
    | "name"
    | "version"
    | "department"
    | "sections"
    | "dataConnections"
    | "frequency"
    | "owner"
    | "status"
    | "description"
  >
>;

interface UseReportTemplatesReturn {
  templates: ReportTemplate[];
  loading: boolean;
  error: string | null;
  createTemplate: (data: TemplateFormData) => Promise<ReportTemplate | null>;
  updateTemplate: (templateId: string, updates: TemplateUpdates) => Promise<void>;
  archiveTemplate: (templateId: string) => Promise<void>;
  cloneTemplate: (templateId: string) => Promise<ReportTemplate | null>;
  refresh: () => Promise<void>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useReportTemplates(): UseReportTemplatesReturn {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/report-templates", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { templates: ReportTemplate[] };
      setTemplates(data.templates);
      setError(null);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTemplates();
  }, [fetchTemplates]);

  // ── Create ─────────────────────────────────────────────────────────────────

  const createTemplate = useCallback(
    async (data: TemplateFormData): Promise<ReportTemplate | null> => {
      try {
        const res = await fetch("/api/report-templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`Create failed: HTTP ${res.status}`);
        const result = (await res.json()) as { template: ReportTemplate };
        setTemplates((prev) => [...prev, result.template]);
        return result.template;
      } catch (err) {
        setError(String(err));
        return null;
      }
    },
    []
  );

  // ── Update ─────────────────────────────────────────────────────────────────

  const updateTemplate = useCallback(
    async (templateId: string, updates: TemplateUpdates): Promise<void> => {
      // Optimistic update
      setTemplates((prev) =>
        prev.map((t) =>
          t.templateId === templateId
            ? { ...t, ...updates, updatedAt: new Date().toISOString() }
            : t
        )
      );

      try {
        const res = await fetch("/api/report-templates", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ templateId, updates }),
        });
        if (!res.ok) {
          await fetchTemplates();
          throw new Error(`Update failed: HTTP ${res.status}`);
        }
        const result = (await res.json()) as { template: ReportTemplate };
        setTemplates((prev) =>
          prev.map((t) => (t.templateId === templateId ? result.template : t))
        );
      } catch (err) {
        setError(String(err));
        await fetchTemplates();
      }
    },
    [fetchTemplates]
  );

  // ── Archive ────────────────────────────────────────────────────────────────

  const archiveTemplate = useCallback(
    async (templateId: string): Promise<void> => {
      await updateTemplate(templateId, { status: "Archived" });
    },
    [updateTemplate]
  );

  // ── Clone ──────────────────────────────────────────────────────────────────

  const cloneTemplate = useCallback(
    async (templateId: string): Promise<ReportTemplate | null> => {
      const source = templates.find((t) => t.templateId === templateId);
      if (!source) return null;
      return createTemplate({
        name: `${source.name} (Copy)`,
        version: "v1.0",
        department: source.department,
        sections: [...source.sections],
        dataConnections: [...source.dataConnections],
        frequency: source.frequency,
        owner: source.owner,
        status: "Draft",
        description: source.description,
      });
    },
    [templates, createTemplate]
  );

  return {
    templates,
    loading,
    error,
    createTemplate,
    updateTemplate,
    archiveTemplate,
    cloneTemplate,
    refresh: fetchTemplates,
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

export const templateStatusVariant: Record<string, BadgeVariant> = {
  Active: "success",
  Draft: "warning",
  Archived: "neutral",
};
