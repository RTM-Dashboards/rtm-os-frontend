export type StatusVariant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"
  | "pending";

interface StatusBadgeProps {
  variant: StatusVariant;
  label: string;
  size?: "sm" | "md";
}

const variantStyles: Record<StatusVariant, string> = {
  success:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  warning:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  neutral:
    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  pending:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
};

const dotStyles: Record<StatusVariant, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
  info: "bg-blue-500",
  neutral: "bg-slate-400",
  pending: "bg-indigo-500",
};

export default function StatusBadge({
  variant,
  label,
  size = "md",
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
      } ${variantStyles[variant]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotStyles[variant]}`} />
      {label}
    </span>
  );
}
