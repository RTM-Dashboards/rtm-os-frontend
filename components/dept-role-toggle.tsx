"use client";

// DeptRoleToggle — UI-only role view switcher for department Performance Settings.
// Gates the People KPI tab to "Manager" view only.
// Pattern mirrors components/am-role-toggle.tsx (AMRole toggle precedent).
// This is UI convenience only — not real server-side auth.

export type DeptRole = "manager" | "member";

interface DeptRoleToggleProps {
  role: DeptRole;
  onRoleChange: (role: DeptRole) => void;
  managerLabel?: string;
  memberLabel?: string;
}

export function DeptRoleToggle({
  role,
  onRoleChange,
  managerLabel = "Manager View",
  memberLabel = "Team Member View",
}: DeptRoleToggleProps) {
  return (
    <div className="space-y-3">
      {/* Toggle bar */}
      <div
        className="flex items-center gap-1 p-1 rounded-xl border w-fit"
        style={{
          background: "var(--rtm-surface)",
          borderColor: "var(--rtm-border)",
        }}
      >
        <button
          onClick={() => onRoleChange("manager")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={
            role === "manager"
              ? { background: "var(--rtm-blue)", color: "#fff" }
              : { color: "var(--rtm-text-muted)", background: "transparent" }
          }
        >
          👔 {managerLabel}
        </button>
        <button
          onClick={() => onRoleChange("member")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={
            role === "member"
              ? { background: "#059669", color: "#fff" }
              : { color: "var(--rtm-text-muted)", background: "transparent" }
          }
        >
          👤 {memberLabel}
        </button>
      </div>

      {/* Role label banner */}
      {role === "manager" ? (
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl border"
          style={{
            background: "var(--rtm-blue-xlight)",
            borderColor: "var(--rtm-blue-light)",
          }}
        >
          <span className="text-lg">👔</span>
          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--rtm-blue)" }}
            >
              Current View
            </p>
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--rtm-blue)" }}
            >
              Viewing as Manager — Full KPI access
            </p>
          </div>
          <span
            className="ml-auto inline-flex rounded-full px-3 py-0.5 text-xs font-bold border"
            style={{
              background: "var(--rtm-blue-xlight)",
              color: "var(--rtm-blue)",
              borderColor: "var(--rtm-blue-light)",
            }}
          >
            Campaign + People KPIs
          </span>
        </div>
      ) : (
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl border"
          style={{ background: "#ECFDF5", borderColor: "#A7F3D0" }}
        >
          <span className="text-lg">👤</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              Current View
            </p>
            <p className="text-sm font-semibold text-emerald-800">
              Viewing as Team Member — Campaign KPIs only
            </p>
          </div>
          <span className="ml-auto inline-flex rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
            Campaign KPIs Only
          </span>
        </div>
      )}
    </div>
  );
}
