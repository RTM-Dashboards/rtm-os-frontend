import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumb?: string;
}

export default function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
      <div>
        {breadcrumb && (
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
            {breadcrumb}
          </p>
        )}
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-xl">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
      )}
    </div>
  );
}
