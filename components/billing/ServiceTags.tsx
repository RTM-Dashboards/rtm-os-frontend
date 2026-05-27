"use client";

const serviceColors: Record<string, string> = {
  SEO: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "Meta Ads": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  Content: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  LSA: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  Design: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  Reporting: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const defaultColor = "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";

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
          className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${serviceColors[svc] ?? defaultColor}`}
        >
          {svc}
        </span>
      ))}
      {remaining > 0 && (
        <span className="inline-block rounded px-1.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          +{remaining}
        </span>
      )}
    </div>
  );
}
