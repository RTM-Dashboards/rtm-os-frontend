interface LoadingStateProps {
  message?: string;
  variant?: "spinner" | "skeleton" | "dots";
}

function Spinner() {
  return (
    <svg className="w-8 h-8 animate-spin" style={{ color: "var(--rtm-blue)" }} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

function Skeleton() {
  return (
    <div className="w-full space-y-3 animate-pulse">
      {[0.75, 0.5, 0.833, 0.667].map((w, i) => (
        <div
          key={i}
          className="h-4 rounded"
          style={{ width: `${w * 100}%`, background: "var(--rtm-border)" }}
        />
      ))}
    </div>
  );
}

function Dots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full animate-bounce"
          style={{ background: "var(--rtm-blue)", animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

export default function LoadingState({
  message = "Loading…",
  variant = "spinner",
}: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-4">
      {variant === "spinner" && <Spinner />}
      {variant === "skeleton" && <Skeleton />}
      {variant === "dots" && <Dots />}
      {message && variant !== "skeleton" && (
        <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>{message}</p>
      )}
    </div>
  );
}
