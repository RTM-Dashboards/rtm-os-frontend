"use client";

// RTM OS — Standard Action Button System
// All module action buttons use these variants for visual consistency.

import React from "react";

export type ActionVariant =
  | "primary"// solid blue — main CTA
  | "secondary"// ghost/outline — supporting actions
  | "ghost"// no border — inline / icon-only
  | "danger"// red — destructive
  | "success";   // green — approve / confirm

export type ActionSize = "sm"| "md"| "lg";

export interface ActionButtonProps {
  label?: string;
  icon?: React.ReactNode;
  variant?: ActionVariant;
  size?: ActionSize;
  disabled?: boolean;
  loading?: boolean;
  /** Renders as icon-only button (label becomes aria-label) */
  iconOnly?: boolean;
  onClick?: () => void;
  type?: "button"| "submit"| "reset";
  className?: string;
}

const variantStyles: Record<ActionVariant, React.CSSProperties> = {
  primary:   { background: "var(--rtm-blue)",    color: "#fff",                   border: "none"},
  secondary: { background: "var(--rtm-surface)",  color: "var(--rtm-text-primary)", border: "1px solid var(--rtm-border)"},
  ghost:     { background: "transparent",          color: "var(--rtm-text-secondary)", border: "none"},
  danger:    { background: "#FEF2F2",              color: "#DC2626",                border: "1px solid #FECACA"},
  success:   { background: "#ECFDF5",              color: "#059669",                border: "1px solid #A7F3D0"},
};

const hoverStyles: Record<ActionVariant, React.CSSProperties> = {
  primary:   { background: "var(--rtm-blue-dark)"},
  secondary: { background: "var(--rtm-bg)", borderColor: "var(--rtm-blue)"},
  ghost:     { background: "var(--rtm-bg)"},
  danger:    { background: "#FEE2E2"},
  success:   { background: "#D1FAE5"},
};

const sizeStyles: Record<ActionSize, string> = {
  sm: "px-2.5 py-1 text-xs gap-1",
  md: "px-3.5 py-2 text-sm gap-1.5",
  lg: "px-5 py-2.5 text-sm gap-2",
};

const iconSizes: Record<ActionSize, string> = {
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
  lg: "w-4 h-4",
};

const SpinIcon = () => (
  <svg className="w-4 h-4 animate-spin"fill="none"viewBox="0 0 24 24">
    <circle className="opacity-25"cx="12"cy="12"r="10"stroke="currentColor"strokeWidth="4"/>
    <path className="opacity-75"fill="currentColor"d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
  </svg>
);

export default function ActionButton({
  label,
  icon,
  variant = "secondary",
  size = "md",
  disabled = false,
  loading = false,
  iconOnly = false,
  onClick,
  type = "button",
  className = "",
}: ActionButtonProps) {
  const [hovered, setHovered] = React.useState(false);

  const baseStyle: React.CSSProperties = {
    ...variantStyles[variant],
    ...(hovered && !disabled ? hoverStyles[variant] : {}),
    opacity: disabled || loading ? 0.55 : 1,
    cursor: disabled || loading ? "not-allowed": "pointer",
    transition: "all 0.15s ease",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={!disabled && !loading ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={iconOnly ? label : undefined}
      title={iconOnly ? label : undefined}
      className={`inline-flex items-center justify-center font-semibold rounded-lg ${sizeStyles[size]} ${iconOnly ? "aspect-square": ""} ${className}`}
      style={baseStyle}
    >
      {loading ? (
        <SpinIcon />
      ) : icon ? (
        <span className={iconSizes[size]}>{icon}</span>
      ) : null}
      {!iconOnly && label && <span>{label}</span>}
    </button>
  );
}

// ── Preset action buttons for common operations ────────────────────────────────

type PresetProps = Omit<ActionButtonProps, "label"| "variant"> & { label?: string };

const ViewIcon = () => (
  <svg fill="none"stroke="currentColor"viewBox="0 0 24 24">
    <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
    <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
  </svg>
);
const EditIcon = () => (
  <svg fill="none"stroke="currentColor"viewBox="0 0 24 24">
    <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
  </svg>
);
const ArchiveIcon = () => (
  <svg fill="none"stroke="currentColor"viewBox="0 0 24 24">
    <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
  </svg>
);
const DeleteIcon = () => (
  <svg fill="none"stroke="currentColor"viewBox="0 0 24 24">
    <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
  </svg>
);
const AssignIcon = () => (
  <svg fill="none"stroke="currentColor"viewBox="0 0 24 24">
    <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
  </svg>
);
const ApproveIcon = () => (
  <svg fill="none"stroke="currentColor"viewBox="0 0 24 24">
    <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>
);
const RejectIcon = () => (
  <svg fill="none"stroke="currentColor"viewBox="0 0 24 24">
    <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>
);
const GenerateIcon = () => (
  <svg fill="none"stroke="currentColor"viewBox="0 0 24 24">
    <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
  </svg>
);
const ExportIcon = () => (
  <svg fill="none"stroke="currentColor"viewBox="0 0 24 24">
    <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
  </svg>
);

export const ViewButton    = (p: PresetProps) => <ActionButton {...p} label={p.label ?? "View"}     variant="ghost"icon={<ViewIcon    />} />;
export const EditButton    = (p: PresetProps) => <ActionButton {...p} label={p.label ?? "Edit"}     variant="secondary"icon={<EditIcon    />} />;
export const ArchiveButton = (p: PresetProps) => <ActionButton {...p} label={p.label ?? "Archive"}  variant="secondary"icon={<ArchiveIcon />} />;
export const DeleteButton  = (p: PresetProps) => <ActionButton {...p} label={p.label ?? "Delete"}   variant="danger"icon={<DeleteIcon  />} />;
export const AssignButton  = (p: PresetProps) => <ActionButton {...p} label={p.label ?? "Assign"}   variant="secondary"icon={<AssignIcon  />} />;
export const ApproveButton = (p: PresetProps) => <ActionButton {...p} label={p.label ?? "Approve"}  variant="success"icon={<ApproveIcon />} />;
export const RejectButton  = (p: PresetProps) => <ActionButton {...p} label={p.label ?? "Reject"}   variant="danger"icon={<RejectIcon  />} />;
export const GenerateButton= (p: PresetProps) => <ActionButton {...p} label={p.label ?? "Generate"} variant="primary"icon={<GenerateIcon/>} />;
export const ExportButton  = (p: PresetProps) => <ActionButton {...p} label={p.label ?? "Export"}   variant="secondary"icon={<ExportIcon  />} />;
