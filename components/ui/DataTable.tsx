"use client";

// RTM OS — Standard Data Table
// Supports: search, filters, sorting, column actions, bulk actions, pagination, status badges.

import React, { useState, useMemo, useCallback } from "react";
import EmptyState from "./EmptyState";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface BulkAction<T> {
  label: string;
  icon?: React.ReactNode;
  variant?: "default"| "danger";
  onClick: (selected: T[]) => void;
}

export interface TableFilter {
  label: string;
  value: string;
  count?: number;
}

type SortDir = "asc"| "desc";

interface DataTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  /** Key used for row identity (defaults to row index) */
  rowKey?: keyof T;
  /** Enable search bar */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Which column keys to search through (defaults to all string columns) */
  searchKeys?: (keyof T | string)[];
  /** Quick-filter tabs shown above the table */
  filters?: TableFilter[];
  activeFilter?: string;
  onFilterChange?: (value: string) => void;
  /** Bulk selection + actions */
  bulkActions?: BulkAction<T>[];
  /** Pagination */
  pageSize?: number;
  /** Empty state */
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
  /** Extra toolbar slot (right of search) */
  toolbar?: React.ReactNode;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function SortIcon({ dir }: { dir?: SortDir }) {
  return (
    <svg className="w-3.5 h-3.5 inline-block ml-1 opacity-60"fill="none"stroke="currentColor"viewBox="0 0 24 24">
      {dir === "asc"? (
        <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M5 15l7-7 7 7"/>
      ) : dir === "desc"? (
        <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M19 9l-7 7-7-7"/>
      ) : (
        <>
          <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M8 9l4-4 4 4M8 15l4 4 4-4"/>
        </>
      )}
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg className="w-4 h-4"fill="none"stroke="currentColor"viewBox="0 0 24 24">
      <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M15 19l-7-7 7-7"/>
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg className="w-4 h-4"fill="none"stroke="currentColor"viewBox="0 0 24 24">
      <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M9 5l7 7-7 7"/>
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  rowKey,
  searchable = false,
  searchPlaceholder = "Search...",
  searchKeys,
  filters,
  activeFilter,
  onFilterChange,
  bulkActions,
  pageSize = 25,
  emptyTitle = "No data",
  emptyDescription = "Nothing to show here yet.",
  className = "",
  toolbar,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);

  // ── Search ─────────────────────────────────────────────────────
  const keys = searchKeys ?? columns.map((c) => c.key);
  const searched = useMemo(() => {
    if (!query.trim()) return data;
    const q = query.toLowerCase();
    return data.filter((row) =>
      keys.some((k) => {
        const val = row[k as keyof T];
        return typeof val === "string"&& val.toLowerCase().includes(q);
      }),
    );
  }, [data, query, keys]);

  // ── Sort ───────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    if (!sortKey) return searched;
    return [...searched].sort((a, b) => {
      const av = a[sortKey as keyof T];
      const bv = b[sortKey as keyof T];
      if (typeof av === "string"&& typeof bv === "string") {
        return sortDir === "asc"? av.localeCompare(bv) : bv.localeCompare(av);
      }
      if (typeof av === "number"&& typeof bv === "number") {
        return sortDir === "asc"? av - bv : bv - av;
      }
      return 0;
    });
  }, [searched, sortKey, sortDir]);

  // ── Pagination ─────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = useCallback(
    (key: string) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc"? "desc": "asc"));
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
      setPage(1);
    },
    [sortKey],
  );

  // ── Selection ──────────────────────────────────────────────────
  const allSelected = paginated.length > 0 && paginated.every((_, i) => selected.has((page - 1) * pageSize + i));
  const toggleAll = () => {
    if (allSelected) {
      const next = new Set(selected);
      paginated.forEach((_, i) => next.delete((page - 1) * pageSize + i));
      setSelected(next);
    } else {
      const next = new Set(selected);
      paginated.forEach((_, i) => next.add((page - 1) * pageSize + i));
      setSelected(next);
    }
  };
  const toggleRow = (absIdx: number) => {
    const next = new Set(selected);
    if (next.has(absIdx)) next.delete(absIdx);
    else next.add(absIdx);
    setSelected(next);
  };

  const selectedRows = sorted.filter((_, i) => selected.has(i));

  const showBulkBar = bulkActions && selected.size > 0;

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Toolbar row */}
      {(searchable || filters || toolbar) && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Filter tabs */}
          {filters && filters.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto flex-1">
              {filters.map((f) => {
                const isActive = f.value === activeFilter;
                return (
                  <button
                    key={f.value}
                    onClick={() => {
                      onFilterChange?.(f.value);
                      setPage(1);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all"style={
                      isActive
                        ? { background: "var(--rtm-blue)", color: "#fff"}
                        : { background: "var(--rtm-surface)", color: "var(--rtm-text-secondary)", border: "1px solid var(--rtm-border)"}
                    }
                  >
                    {f.label}
                    {f.count !== undefined && (
                      <span
                        className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"style={
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

          <div className="flex items-center gap-2 sm:ml-auto">
            {/* Search */}
            {searchable && (
              <div className="relative">
                <svg
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"style={{ color: "var(--rtm-text-muted)"}}
                  fill="none"stroke="currentColor"viewBox="0 0 24 24">
                  <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
                </svg>
                <input
                  type="text"value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                  placeholder={searchPlaceholder}
                  className="pl-8 pr-3 py-1.5 text-sm rounded-lg border outline-none transition-colors w-48"style={{
                    background: "var(--rtm-surface)",
                    borderColor: "var(--rtm-border)",
                    color: "var(--rtm-text-primary)",
                  }}
                />
              </div>
            )}
            {toolbar}
          </div>
        </div>
      )}

      {/* Bulk action bar */}
      {showBulkBar && (
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg border"style={{ background: "var(--rtm-blue-xlight)", borderColor: "var(--rtm-blue-light)"}}
        >
          <span className="text-xs font-semibold"style={{ color: "var(--rtm-blue)"}}>
            {selected.size} selected
          </span>
          <div className="flex items-center gap-2 ml-auto">
            {bulkActions!.map((action) => (
              <button
                key={action.label}
                onClick={() => { action.onClick(selectedRows); setSelected(new Set()); }}
                className="px-3 py-1 rounded-lg text-xs font-semibold border transition-all"style={
                  action.variant === "danger"? { background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA"}
                    : { background: "var(--rtm-blue)", color: "#fff", border: "none"}
                }
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      {sorted.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} variant="table"/>
      ) : (
        <div
          className="overflow-x-auto rounded-xl border"style={{ borderColor: "var(--rtm-border)"}}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border)"}}>
                {bulkActions && (
                  <th className="w-10 px-3 py-3">
                    <input
                      type="checkbox"checked={allSelected}
                      onChange={toggleAll}
                      className="rounded"aria-label="Select all"/>
                  </th>
                )}
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap select-none ${col.sortable ? "cursor-pointer hover:opacity-80": ""}`}
                    style={{
                      color: "var(--rtm-text-muted)",
                      ...(col.width ? { width: col.width } : {}),
                    }}
                    onClick={() => col.sortable && handleSort(String(col.key))}
                  >
                    {col.header}
                    {col.sortable && (
                      <SortIcon dir={sortKey === String(col.key) ? sortDir : undefined} />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((row, rowIdx) => {
                const absIdx = (page - 1) * pageSize + rowIdx;
                const isSelected = selected.has(absIdx);
                const key = rowKey ? String(row[rowKey]) : absIdx;
                return (
                  <tr
                    key={key}
                    className="transition-colors"style={{
                      borderBottom: "1px solid var(--rtm-border-light)",
                      background: isSelected ? "var(--rtm-blue-xlight)": "var(--rtm-surface)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected)
                        (e.currentTarget as HTMLTableRowElement).style.background = "var(--rtm-bg)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected)
                        (e.currentTarget as HTMLTableRowElement).style.background = "var(--rtm-surface)";
                    }}
                  >
                    {bulkActions && (
                      <td className="w-10 px-3 py-3">
                        <input
                          type="checkbox"checked={isSelected}
                          onChange={() => toggleRow(absIdx)}
                          className="rounded"aria-label="Select row"/>
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={String(col.key)}
                        className="px-4 py-3 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}
                      >
                        {col.render
                          ? col.render(row[col.key as keyof T], row)
                          : String(row[col.key as keyof T] ?? "")}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs"style={{ color: "var(--rtm-text-muted)"}}>
          <span>
            {Math.min((page - 1) * pageSize + 1, sorted.length)}–{Math.min(page * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-1.5 rounded-lg border disabled:opacity-40 transition-opacity"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)"}}
              aria-label="Previous page">
              <ChevronLeft />
            </button>
            <span className="px-2 font-medium"style={{ color: "var(--rtm-text-primary)"}}>
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg border disabled:opacity-40 transition-opacity"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)"}}
              aria-label="Next page">
              <ChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
