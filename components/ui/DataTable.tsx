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
    <div className={`overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                style={col.width ? { width: col.width } : undefined}
                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {data.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap"
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
