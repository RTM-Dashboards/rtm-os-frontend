"use client";

// RTM OS — Standard Notification System
// Provides a toast notification context usable across all modules.

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type NotificationType = "success"| "error"| "warning"| "info";

export interface Toast {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number; // ms, 0 = sticky
}

interface NotificationContextValue {
  toasts: Toast[];
  notify: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}

// ── Toast item styles ─────────────────────────────────────────────────────────

const typeConfig: Record<NotificationType, {
  bg: string; border: string; titleColor: string; msgColor: string; iconColor: string; icon: React.ReactNode;
}> = {
  success: {
    bg: "#ECFDF5", border: "#A7F3D0", titleColor: "#065F46", msgColor: "#059669", iconColor: "#059669",
    icon: (
      <svg className="w-4 h-4"fill="none"stroke="currentColor"viewBox="0 0 24 24">
        <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
  },
  error: {
    bg: "#FEF2F2", border: "#FECACA", titleColor: "#991B1B", msgColor: "#DC2626", iconColor: "#DC2626",
    icon: (
      <svg className="w-4 h-4"fill="none"stroke="currentColor"viewBox="0 0 24 24">
        <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
  },
  warning: {
    bg: "#FFFBEB", border: "#FDE68A", titleColor: "#92400E", msgColor: "#B45309", iconColor: "#B45309",
    icon: (
      <svg className="w-4 h-4"fill="none"stroke="currentColor"viewBox="0 0 24 24">
        <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
      </svg>
    ),
  },
  info: {
    bg: "var(--rtm-blue-xlight)", border: "var(--rtm-blue-light)", titleColor: "var(--rtm-blue-dark)", msgColor: "var(--rtm-blue)", iconColor: "var(--rtm-blue)",
    icon: (
      <svg className="w-4 h-4"fill="none"stroke="currentColor"viewBox="0 0 24 24">
        <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
  },
};

// ── Toast item component ──────────────────────────────────────────────────────

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const cfg = typeConfig[toast.type];

  useEffect(() => {
    const duration = toast.duration ?? 5000;
    if (duration === 0) return;
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  return (
    <div
      className="flex items-start gap-3 p-4 rounded-xl border shadow-lg pointer-events-auto min-w-[280px] max-w-sm"style={{ background: cfg.bg, borderColor: cfg.border }}
      role="alert">
      <span style={{ color: cfg.iconColor }} className="flex-shrink-0 mt-0.5">
        {cfg.icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold"style={{ color: cfg.titleColor }}>
          {toast.title}
        </p>
        {toast.message && (
          <p className="mt-0.5 text-xs leading-relaxed"style={{ color: cfg.msgColor, opacity: 0.85 }}>
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 p-0.5 rounded transition-opacity hover:opacity-70"style={{ color: cfg.titleColor }}
        aria-label="Dismiss">
        <svg className="w-3.5 h-3.5"fill="none"stroke="currentColor"viewBox="0 0 24 24">
          <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  );
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((t: Omit<Toast, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { ...t, id }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string) => notify({ type: "success", title, message }), [notify]);
  const error   = useCallback((title: string, message?: string) => notify({ type: "error",   title, message }), [notify]);
  const warning = useCallback((title: string, message?: string) => notify({ type: "warning", title, message }), [notify]);
  const info    = useCallback((title: string, message?: string) => notify({ type: "info",    title, message }), [notify]);

  return (
    <NotificationContext.Provider value={{ toasts, notify, dismiss, success, error, warning, info }}>
      {children}
      {/* Toast container */}
      <div
        className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 pointer-events-none"aria-live="polite"aria-label="Notifications">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
