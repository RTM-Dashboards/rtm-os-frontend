// RTM OS — Standard Page Header
// Supports: title, description, breadcrumb, primary actions, secondary actions, quick filters.

import React from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface QuickFilter {
  label: string;
  value: string;
  count?: number;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Single string shorthand OR array for full breadcrumb path */
  breadcrumb?: string | BreadcrumbItem[];
  /** Primary action buttons — rendered right, solid/filled */
  primaryActions?: React.ReactNode;
  /** Secondary action buttons — rendered right of primary, ghost/outline */
  secondaryActions?: React.ReactNode;
  /** Legacy: merged into primaryActions for backwards compat */
  actions?: React.ReactNode;
  /** Tab-style quick filters shown below the title row */
  quickFilters?: QuickFilter[];
  activeFilter?: string;
  onFilterChange?: (value: string) => void;
}

export default function PageHeader({
  title,
  description,
  breadcrumb,
  primaryActions,
  secondaryActions,
  actions,
  quickFilters,
  activeFilter,
  onFilterChange,
}: PageHeaderProps) {
  // Normalise breadcrumb to array
  const crumbs: BreadcrumbItem[] =
    !breadcrumb
      ? []
      : typeof breadcrumb === "string"? [{ label: breadcrumb }]
        : breadcrumb;

  const hasActions = primaryActions || secondaryActions || actions;

  return (
    <div className="mb-6 space-y-3">
      {/* Row 1: breadcrumb */}
      {crumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-[11px] font-medium"aria-label="Breadcrumb">
          {crumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <span style={{ color: "var(--rtm-text-muted)"}}>/</span>
              )}
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="hover:underline transition-colors"style={{ color: idx === crumbs.length - 1 ? "var(--rtm-blue)": "var(--rtm-text-muted)"}}
                >
                  {crumb.label}
                </a>
              ) : (
                <span
                  style={{ color: idx === crumbs.length - 1 ? "var(--rtm-blue)": "var(--rtm-text-muted)"}}
                >
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Row 2: title + actions */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold leading-tight"style={{ color: "var(--rtm-text-primary)"}}>
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm max-w-2xl leading-relaxed"style={{ color: "var(--rtm-text-secondary)"}}>
              {description}
            </p>
          )}
        </div>

        {hasActions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Secondary actions: ghost / outline style */}
            {secondaryActions && (
              <div className="flex items-center gap-2">{secondaryActions}</div>
            )}
            {/* Primary actions: solid style */}
            {(primaryActions || actions) && (
              <div className="flex items-center gap-2">
                {primaryActions ?? actions}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Row 3: quick filters */}
      {quickFilters && quickFilters.length > 0 && (
        <div
          className="flex items-center gap-1 overflow-x-auto pb-0.5"role="tablist"aria-label="Quick filters">
          {quickFilters.map((f) => {
            const isActive = f.value === activeFilter;
            return (
              <button
                key={f.value}
                role="tab"aria-selected={isActive}
                onClick={() => onFilterChange?.(f.value)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all"style={
                  isActive
                    ? {
                        background: "var(--rtm-blue)",
                        color: "#fff",
                        boxShadow: "0 1px 3px rgba(27,79,216,0.25)",
                      }
                    : {
                        background: "var(--rtm-surface)",
                        color: "var(--rtm-text-secondary)",
                        border: "1px solid var(--rtm-border)",
                      }
                }
              >
                {f.label}
                {f.count !== undefined && (
                  <span
                    className="px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none"style={
                      isActive
                        ? { background: "rgba(255,255,255,0.25)", color: "#fff"}
                        : { background: "var(--rtm-bg)", color: "var(--rtm-text-muted)"}
                    }
                  >
                    {f.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
