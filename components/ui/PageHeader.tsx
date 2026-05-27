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
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-1"
            style={{ color: "var(--rtm-blue)" }}
          >
            {breadcrumb}
          </p>
        )}
        <h1 className="text-xl font-bold" style={{ color: "var(--rtm-text-primary)" }}>
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm max-w-xl" style={{ color: "var(--rtm-text-secondary)" }}>
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
