"use client";

import React from "react";
import EmptyState from "./EmptyState";

export interface Column<T> {
  key: keyof T;
  header: string;
  width?: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface DataTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  emptyTitle = "No data",
  emptyDescription = "Nothing to show here yet.",
  className = "",
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        variant="table"
      />
    );
  }

  return (
    <div
      className={`overflow-x-auto rounded-xl border ${className}`}
      style={{ borderColor: "var(--rtm-border)" }}
    >
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border)" }}>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                style={{
                  color: "var(--rtm-text-muted)",
                  ...(col.width ? { width: col.width } : {}),
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className="transition-colors"
              style={{ borderBottom: "1px solid var(--rtm-border-light)", background: "var(--rtm-surface)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLTableRowElement).style.background = "var(--rtm-bg)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLTableRowElement).style.background = "var(--rtm-surface)";
              }}
            >
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className="px-4 py-3 whitespace-nowrap"
                  style={{ color: "var(--rtm-text-secondary)" }}
                >
                  {col.render
                    ? col.render(row[col.key], row)
                    : String(row[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
