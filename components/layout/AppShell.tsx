"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import { createClient } from "@/lib/supabase/client";

interface AppShellProps {
  children: React.ReactNode;
}

interface AuthUser {
  name: string;
  email: string;
  initial: string;
}

interface MeRecord {
  role:       string;
  department: string | null;
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [meRecord, setMeRecord] = useState<MeRecord | null>(null);

  // Fetch display identity from Supabase session (name/email are stored in
  // user_metadata; they are not sensitive and need no server round-trip).
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user?.email) return;
      const name =
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        user.email;
      const initial = (name as string).trim().charAt(0).toUpperCase();
      setAuthUser({ name: name as string, email: user.email, initial });
    });
  }, []);

  // Fetch role + department so Sidebar can scope the department module list.
  // /api/me returns the caller's own row; any authenticated active user passes.
  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { role: string; department: string | null } | null) => {
        if (data?.role) setMeRecord({ role: data.role, department: data.department ?? null });
      })
      .catch(() => { /* non-critical — sidebar falls back to showing all */ });
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--background)" }}>
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={authUser}
        role={meRecord?.role ?? null}
        department={meRecord?.department ?? null}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav onMenuClick={() => setSidebarOpen(true)} user={authUser} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
