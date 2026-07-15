/**
 * useEnabledKpis — shared hook for KPI visibility control (Phase 2)
 *
 * Fetches /api/kpi-definitions and returns a stable helper that tells each
 * Performance page which Campaign KPI cards should be rendered.
 *
 * USAGE
 *   const { isEnabled, loading } = useEnabledKpis("content");
 *   // in render: {isEnabled("content-pages-published") && <KpiCard ... />}
 *
 * NOTES
 * - Only "Campaign" category KPIs are gated; "People" category KPIs are not
 *   affected by this hook and are left untouched per Phase 2 scope.
 * - While loading, isEnabled returns true so pages show cards optimistically
 *   (avoids layout shift on first paint; cards disappear after data arrives if
 *   they're disabled).
 * - The hook is client-side only ("use client" pages call it directly).
 */

"use client";

import { useState, useEffect, useCallback } from "react";

// ── Types (mirrors route.ts) ──────────────────────────────────────────────────

interface KpiDefinition {
  id: string;
  name: string;
  category: "Campaign" | "People";
  departments: string[];
  enabled: boolean;
  description?: string;
}

interface UseEnabledKpisResult {
  /** True while the first fetch is in flight */
  loading: boolean;
  /** True if the fetch failed */
  error: boolean;
  /**
   * Returns true when the KPI with this id is enabled in the config.
   * Returns true while loading (optimistic — avoids layout shift).
   * Returns true for any non-Campaign KPI (People KPIs not gated here).
   */
  isEnabled: (kpiId: string) => boolean;
  /** Set of enabled Campaign KPI ids for this department */
  enabledIds: Set<string>;
}

// ── Module-level cache (avoids re-fetching across page nav) ──────────────────
// This is intentionally a simple Map — no stale invalidation needed since
// settings pages always cause a full navigation reload.

const _cache = new Map<string, Set<string>>();
let _allDefs: KpiDefinition[] | null = null;

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useEnabledKpis(department: string): UseEnabledKpisResult {
  const [loading, setLoading] = useState<boolean>(() => _cache.has(department) ? false : true);
  const [error, setError] = useState(false);
  const [enabledIds, setEnabledIds] = useState<Set<string>>(
    () => _cache.get(department) ?? new Set()
  );

  useEffect(() => {
    // Already cached for this department
    if (_cache.has(department)) {
      setEnabledIds(_cache.get(department)!);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchDefs() {
      try {
        // Re-use already-fetched full list if available
        if (!_allDefs) {
          const res = await fetch("/api/kpi-definitions");
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = (await res.json()) as { definitions: KpiDefinition[] };
          _allDefs = data.definitions;
        }

        if (cancelled) return;

        const ids = new Set(
          _allDefs
            .filter(
              (d) =>
                d.category === "Campaign" &&
                d.enabled &&
                (d.departments.includes(department) || d.departments.includes("all"))
            )
            .map((d) => d.id)
        );

        _cache.set(department, ids);
        setEnabledIds(ids);
        setLoading(false);
      } catch {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      }
    }

    fetchDefs();
    return () => { cancelled = true; };
  }, [department]);

  const isEnabled = useCallback(
    (kpiId: string): boolean => {
      // While loading, show cards (optimistic)
      if (loading) return true;
      // If fetch failed, show all cards (fail-open — don't hide data)
      if (error) return true;
      // If the set is empty (all disabled), respect that
      if (enabledIds.size === 0 && !loading && !error) {
        // Check: did we actually get definitions? If yes, empty means all disabled.
        // If no definitions matched the department at all (config gap), show everything.
        return _allDefs
          ? _allDefs.some(
              (d) =>
                d.category === "Campaign" &&
                (d.departments.includes(department) || d.departments.includes("all"))
            )
            ? false  // There ARE definitions for this dept but none enabled
            : true   // No definitions for this dept at all → show everything
          : true;
      }
      return enabledIds.has(kpiId);
    },
    [loading, error, enabledIds, department]
  );

  return { loading, error, isEnabled, enabledIds };
}

/**
 * Invalidate the module-level cache.
 * Call this after a settings page successfully PATCHes a KPI definition,
 * so the next navigation to a Performance page re-fetches fresh state.
 */
export function invalidateKpiCache(): void {
  _cache.clear();
  _allDefs = null;
}
