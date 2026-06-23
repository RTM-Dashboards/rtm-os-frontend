"use client";

import type { Integration, IntegrationCategory } from "@/lib/integrations/types";

interface Props {
  integrations: Integration[];
  onCategoryClick?: (category: IntegrationCategory) => void;
}

const CATEGORIES: IntegrationCategory[] = [
  "CRM", "Call Tracking", "Analytics", "Advertising",
  "Communication", "AI", "Storage", "Reporting", "Custom API",
];

const CATEGORY_COLOR: Record<IntegrationCategory, { dot: string; bg: string; border: string }> = {
  "CRM":           { dot: "#1B4FD8", bg: "#EFF6FF", border: "#BFDBFE"},
  "Call Tracking": { dot: "#059669", bg: "#ECFDF5", border: "#A7F3D0"},
  "Analytics":     { dot: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE"},
  "Advertising":   { dot: "#EA580C", bg: "#FFF7ED", border: "#FED7AA"},
  "Communication": { dot: "#0369A1", bg: "#EFF6FF", border: "#BAE6FD"},
  "AI":            { dot: "#DC2626", bg: "#FEF2F2", border: "#FECACA"},
  "Storage":       { dot: "#0D9488", bg: "#F0FDFA", border: "#99F6E4"},
  "Reporting":     { dot: "#B45309", bg: "#FFFBEB", border: "#FDE68A"},
  "Custom API":    { dot: "#64748B", bg: "#F8FAFC", border: "#E2E8F0"},
};

export default function CategoryOverviewCards({ integrations, onCategoryClick }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {CATEGORIES.map((category) => {
        const categoryIntegrations = integrations.filter((i) => i.category === category);
        const connected = categoryIntegrations.filter((i) => i.status === "connected").length;
        const total     = categoryIntegrations.length;
        const hasErrors = categoryIntegrations.some((i) => i.status === "error");
        const config    = CATEGORY_COLOR[category];

        return (
          <button
            key={category}
            onClick={() => onCategoryClick?.(category)}
            className="rounded-xl border p-4 text-left transition-all hover:shadow-sm hover:scale-[1.01]"style={{ background: config.bg, borderColor: config.border }}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"style={{ background: config.dot }}
              />
              {hasErrors && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-200">
                  Error
                </span>
              )}
            </div>
            <p
              className="text-sm font-bold leading-tight mb-1"style={{ color: "var(--rtm-text-primary)"}}
            >
              {category}
            </p>
            <p className="text-xs"style={{ color: config.dot }}>
              {connected}/{total} connected
            </p>
            {total === 0 && (
              <p className="text-[11px] mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>
                No connectors configured
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
