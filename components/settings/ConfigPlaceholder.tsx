// RTM OS — Settings Configuration Placeholder
// Used for configuration sections that have their information architecture
// defined but do not yet have full editors built.

import Link from "next/link";

interface ConfigField {
  key: string;
  type: "text" | "textarea" | "select" | "multiselect" | "toggle" | "number" | "range";
  label: string;
  description?: string;
}

interface ConfigPlaceholderProps {
  title: string;
  breadcrumb: string[];
  description: string;
  purpose: string;
  fields: ConfigField[];
  consumedBy?: string[];
  relatedSections?: { label: string; href: string }[];
  status?: "planned" | "partial" | "live";
}

const STATUS_STYLES = {
  live:    { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0", label: "Live" },
  partial: { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A", label: "In Progress" },
  planned: { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0", label: "Planned" },
};

const FIELD_TYPE_LABELS: Record<ConfigField["type"], string> = {
  text:        "Text",
  textarea:    "Long Text",
  select:      "Single Select",
  multiselect: "Multi-Select",
  toggle:      "Toggle",
  number:      "Number",
  range:       "Range",
};

export default function ConfigPlaceholder({
  title,
  breadcrumb,
  description,
  purpose,
  fields,
  consumedBy,
  relatedSections,
  status = "planned",
}: ConfigPlaceholderProps) {
  const s = STATUS_STYLES[status];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs" style={{ color: "var(--rtm-text-muted)" }}>
        <Link href="/settings" className="hover:underline" style={{ color: "var(--rtm-text-muted)" }}>
          Settings
        </Link>
        {breadcrumb.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <span>›</span>
            <span style={{ color: i === breadcrumb.length - 1 ? "var(--rtm-text-secondary)" : "var(--rtm-text-muted)" }}>
              {crumb}
            </span>
          </span>
        ))}
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1
            className="text-xl font-bold tracking-tight"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            {title}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--rtm-text-muted)" }}>
            {description}
          </p>
        </div>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 self-start"
          style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
        >
          {s.label}
        </span>
      </div>

      {/* Purpose notice */}
      <div
        className="rounded-xl border p-4"
        style={{
          background: "var(--rtm-blue-xlight)",
          borderColor: "var(--rtm-blue-light)",
        }}
      >
        <p
          className="text-xs font-bold uppercase tracking-widest mb-1"
          style={{ color: "var(--rtm-blue)" }}
        >
          Configuration Purpose
        </p>
        <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
          {purpose}
        </p>
        {consumedBy && consumedBy.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold" style={{ color: "var(--rtm-blue)" }}>
              Consumed by:
            </span>
            {consumedBy.map((c) => (
              <span
                key={c}
                className="text-xs font-medium px-2 py-0.5 rounded-md"
                style={{
                  background: "var(--rtm-surface)",
                  color: "var(--rtm-blue)",
                  border: "1px solid var(--rtm-blue-light)",
                }}
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Field schema */}
      <section
        className="rounded-xl border overflow-hidden"
        style={{
          background: "var(--rtm-surface)",
          borderColor: "var(--rtm-border)",
        }}
      >
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--rtm-border-light)" }}
        >
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
              Configuration Fields
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
              {fields.length} field{fields.length !== 1 ? "s" : ""} defined for this configuration section.
              Editor coming soon.
            </p>
          </div>
          <span
            className="text-xs font-medium px-2.5 py-1 rounded-md"
            style={{
              background: "var(--rtm-bg)",
              color: "var(--rtm-text-muted)",
              border: "1px solid var(--rtm-border)",
            }}
          >
            Schema Only
          </span>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--rtm-border-light)" }}>
          {fields.map((field) => (
            <div
              key={field.key}
              className="px-5 py-4 flex items-start justify-between gap-4"
            >
              <div className="min-w-0">
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--rtm-text-primary)" }}
                >
                  {field.label}
                </p>
                {field.description && (
                  <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                    {field.description}
                  </p>
                )}
                <p
                  className="text-[11px] font-mono mt-1"
                  style={{ color: "var(--rtm-text-muted)" }}
                >
                  key: {field.key}
                </p>
              </div>
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-md flex-shrink-0"
                style={{
                  background: "var(--rtm-bg)",
                  color: "var(--rtm-text-secondary)",
                  border: "1px solid var(--rtm-border)",
                }}
              >
                {FIELD_TYPE_LABELS[field.type]}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Related sections */}
      {relatedSections && relatedSections.length > 0 && (
        <section
          className="rounded-xl border overflow-hidden"
          style={{
            background: "var(--rtm-surface)",
            borderColor: "var(--rtm-border)",
          }}
        >
          <div
            className="px-5 py-4"
            style={{ borderBottom: "1px solid var(--rtm-border-light)" }}
          >
            <h2 className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
              Related Configuration
            </h2>
          </div>
          <div className="p-5 flex flex-wrap gap-2">
            {relatedSections.map((rel) => (
              <Link
                key={rel.href}
                href={rel.href}
                className="text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors hover:shadow-sm"
                style={{
                  background: "var(--rtm-bg)",
                  color: "var(--rtm-text-secondary)",
                  borderColor: "var(--rtm-border)",
                  textDecoration: "none",
                }}
              >
                {rel.label}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
