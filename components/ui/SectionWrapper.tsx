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
      className={`rounded-xl border ${className}`}
      style={{
        background: "var(--rtm-surface)",
        borderColor: "var(--rtm-border)",
        boxShadow: "0 1px 3px rgba(15,28,56,0.05)",
      }}
    >
      {(title || actions) && (
        <div
          className="flex items-start justify-between gap-4 px-5 py-4"
          style={{ borderBottom: "1px solid var(--rtm-border-light)" }}
        >
          <div>
            {title && (
              <h2
                className="text-sm font-semibold"
                style={{ color: "var(--rtm-text-primary)" }}
              >
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-0.5 text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
          )}
        </div>
      )}
      <div className={noPadding ? "" : "p-5"}>{children}</div>
    </section>
  );
}
