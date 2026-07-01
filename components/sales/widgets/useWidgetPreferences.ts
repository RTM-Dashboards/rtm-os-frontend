"use client";

import { useState, useEffect, useCallback } from "react";
import { getWidgetsForPage } from "@/lib/sales/widget-config";
import type { WidgetPageId } from "@/lib/sales/widget-config";

// localStorage key format: rtm-widget-prefs-{pageId}
function storageKey(pageId: WidgetPageId): string {
  return `rtm-widget-prefs-${pageId}`;
}

interface StoredPrefs {
  widgetOrder: string[];
  hiddenIds: string[];
}

function defaultPrefs(pageId: WidgetPageId): StoredPrefs {
  const widgets = getWidgetsForPage(pageId);
  return {
    widgetOrder: widgets
      .slice()
      .sort((a, b) => a.defaultOrder - b.defaultOrder)
      .map((w) => w.id),
    hiddenIds: widgets
      .filter((w) => !w.defaultVisible)
      .map((w) => w.id),
  };
}

function readFromStorage(pageId: WidgetPageId): StoredPrefs {
  // Guard: never access localStorage outside of a client-side context.
  // This function is only called from useEffect and event handlers.
  if (typeof window === "undefined") return defaultPrefs(pageId);
  try {
    const raw = window.localStorage.getItem(storageKey(pageId));
    if (!raw) return defaultPrefs(pageId);
    const parsed = JSON.parse(raw) as Partial<StoredPrefs>;
    // Validate shape — fall back to defaults if malformed
    if (
      !Array.isArray(parsed.widgetOrder) ||
      !Array.isArray(parsed.hiddenIds)
    ) {
      return defaultPrefs(pageId);
    }
    // Merge: any widget added to the config after the user saved prefs is
    // appended to the end in default-visible state so new cards appear.
    const allIds = getWidgetsForPage(pageId).map((w) => w.id);
    const knownIds = new Set(parsed.widgetOrder);
    const newIds = allIds.filter((id) => !knownIds.has(id));
    return {
      widgetOrder: [...parsed.widgetOrder.filter((id) => allIds.includes(id)), ...newIds],
      hiddenIds: parsed.hiddenIds.filter((id) => allIds.includes(id)),
    };
  } catch {
    return defaultPrefs(pageId);
  }
}

function writeToStorage(pageId: WidgetPageId, prefs: StoredPrefs): void {
  // Guard: only write inside event handlers (never at render time).
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(pageId), JSON.stringify(prefs));
  } catch {
    // Silently ignore write failures (private browsing, storage quota, etc.)
  }
}

export interface UseWidgetPreferencesReturn {
  /** Ordered list of ALL widget ids (visible + hidden) in user-preferred order. */
  widgetOrder: string[];
  /** Ordered list of currently-visible widget ids. */
  visibleWidgetIds: string[];
  /** Returns true if the given widgetId is currently visible. */
  isVisible: (widgetId: string) => boolean;
  /** Toggle a widget's visibility on/off and persist. */
  toggleWidget: (widgetId: string) => void;
  /** Move a widget up or down in the order and persist. */
  reorderWidget: (widgetId: string, direction: "up" | "down") => void;
  /** Restore all widgets to their default visibility and order. */
  resetToDefault: () => void;
}

export function useWidgetPreferences(
  pageId: WidgetPageId
): UseWidgetPreferencesReturn {
  // Initialize with the SSR-safe default; actual localStorage read happens in
  // a useEffect so it never runs during server-side rendering.
  const [prefs, setPrefs] = useState<StoredPrefs>(() => defaultPrefs(pageId));

  // Load from localStorage on first client-side mount only.
  useEffect(() => {
    setPrefs(readFromStorage(pageId));
  }, [pageId]);

  const isVisible = useCallback(
    (widgetId: string) => !prefs.hiddenIds.includes(widgetId),
    [prefs.hiddenIds]
  );

  const visibleWidgetIds = prefs.widgetOrder.filter(
    (id) => !prefs.hiddenIds.includes(id)
  );

  const toggleWidget = useCallback(
    (widgetId: string) => {
      setPrefs((prev) => {
        const isHidden = prev.hiddenIds.includes(widgetId);
        const next: StoredPrefs = {
          widgetOrder: prev.widgetOrder,
          hiddenIds: isHidden
            ? prev.hiddenIds.filter((id) => id !== widgetId)
            : [...prev.hiddenIds, widgetId],
        };
        writeToStorage(pageId, next);
        return next;
      });
    },
    [pageId]
  );

  const reorderWidget = useCallback(
    (widgetId: string, direction: "up" | "down") => {
      setPrefs((prev) => {
        const idx = prev.widgetOrder.indexOf(widgetId);
        if (idx === -1) return prev;
        const newOrder = [...prev.widgetOrder];
        if (direction === "up" && idx > 0) {
          [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
        } else if (direction === "down" && idx < newOrder.length - 1) {
          [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
        } else {
          return prev; // no-op at boundaries
        }
        const next: StoredPrefs = { ...prev, widgetOrder: newOrder };
        writeToStorage(pageId, next);
        return next;
      });
    },
    [pageId]
  );

  const resetToDefault = useCallback(() => {
    const next = defaultPrefs(pageId);
    writeToStorage(pageId, next);
    setPrefs(next);
  }, [pageId]);

  return {
    widgetOrder: prefs.widgetOrder,
    visibleWidgetIds,
    isVisible,
    toggleWidget,
    reorderWidget,
    resetToDefault,
  };
}
