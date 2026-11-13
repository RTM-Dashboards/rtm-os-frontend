"use client";

// RTM OS — Shared notification unread-count poller
//
// One context, one poller, two consumers: Sidebar nav badge and
// NotificationBell TopNav badge. Both read from this context so they
// always display the same number and the endpoint is hit once per interval
// per tab rather than twice.
//
// Pattern mirrors NotificationToast.tsx: createContext → Provider wraps
// AppShell → useNotificationCount() hook for consumers.
//
// Poll cadence: 2 minutes. Badge counts do not need sub-minute freshness.

import { createContext, useCallback, useContext, useEffect, useState } from "react";

interface NotificationCountContextValue {
  unreadCount: number;
  /** Call after locally marking items read to sync the badge immediately. */
  refreshCount: () => void;
}

const NotificationCountContext =
  createContext<NotificationCountContextValue | null>(null);

export function useNotificationCount(): NotificationCountContextValue {
  const ctx = useContext(NotificationCountContext);
  if (!ctx) {
    throw new Error(
      "useNotificationCount must be used within NotificationCountProvider"
    );
  }
  return ctx;
}

export function NotificationCountProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const refreshCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/count", {
        credentials: "include",
      });
      if (res.ok) {
        const data = (await res.json()) as { unread: number };
        setUnreadCount(data.unread ?? 0);
      }
    } catch {
      // Non-critical — badge stays at last known value
    }
  }, []);

  // Fetch once on mount, then poll every 2 minutes.
  useEffect(() => {
    let mounted = true;

    async function poll() {
      try {
        const res = await fetch("/api/notifications/count", {
          credentials: "include",
        });
        if (res.ok && mounted) {
          const data = (await res.json()) as { unread: number };
          setUnreadCount(data.unread ?? 0);
        }
      } catch {
        // Non-critical
      }
    }

    void poll();
    const t = setInterval(() => { void poll(); }, 120_000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []);

  return (
    <NotificationCountContext.Provider value={{ unreadCount, refreshCount }}>
      {children}
    </NotificationCountContext.Provider>
  );
}
