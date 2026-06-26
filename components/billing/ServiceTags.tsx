"use client";

// RTM OS — Service Tags
// Neutral pill tags for service names. Color communicates nothing — labels only.

interface ServiceTagsProps {
  services: string[];
  max?: number;
}

export default function ServiceTags({ services, max = 3 }: ServiceTagsProps) {
  const visible = services.slice(0, max);
  const remaining = services.length - max;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((svc) => (
        <span
          key={svc}
          className="inline-block rounded px-1.5 py-0.5 text-xs font-medium"
          style={{
            background: "var(--rtm-bg)",
            color: "var(--rtm-text-secondary)",
            border: "1px solid var(--rtm-border)",
          }}
        >
          {svc}
        </span>
      ))}
      {remaining > 0 && (
        <span
          className="inline-block rounded px-1.5 py-0.5 text-xs font-medium"
          style={{
            background: "var(--rtm-bg)",
            color: "var(--rtm-text-muted)",
            border: "1px solid var(--rtm-border)",
          }}
        >
          +{remaining}
        </span>
      )}
    </div>
  );
}
