import React from "react";

interface SectionWrapperProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export default function SectionWrapper({
  title,
  description,
  actions,
  children,
  className = "",
  noPadding = false,
}: SectionWrapperProps) {
  return (
    <section
      className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 ${className}`}
    >
      {(title || actions) && (
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            {title && (
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}
      <div className={noPadding ? "" : "p-5"}>{children}</div>
    </section>
  );
}
