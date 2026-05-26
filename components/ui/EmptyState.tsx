import React from "react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: "default" | "table" | "page";
}

const DefaultIcon = () => (
  <svg
    className="w-10 h-10 text-slate-300 dark:text-slate-600"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
    />
  </svg>
);

export default function EmptyState({
  title = "Nothing here yet",
  description = "Data will appear here once it's available.",
  action,
  icon,
  variant = "default",
}: EmptyStateProps) {
  const containerClass =
    variant === "table"
      ? "py-10 px-4"
      : variant === "page"
        ? "py-24 px-4"
        : "py-16 px-4";

  return (
    <div className={`flex flex-col items-center justify-center text-center ${containerClass}`}>
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        {icon ?? <DefaultIcon />}
      </div>
      <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
