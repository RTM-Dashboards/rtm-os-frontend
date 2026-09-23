"use client";

import { useState, useEffect } from "react";
import WorkspaceSidebar from "./WorkspaceSidebar";
import TopNav from "./TopNav";
import { createClient } from "@/lib/supabase/client";
import { fetchCurrentUser } from "@/lib/users/users-api";
import type { WorkspaceConfig } from "@/types/workspace";

// Extended AuthUser: includes DB-backed role and department so the sidebar
// footer shows real user context rather than hardcoded mock values.
export interface AuthUser {
  name:       string;
  email:      string;
  initial:    string;
  role:       string | null;
  department: string | null;
}

interface WorkspaceShellProps {
  workspace: WorkspaceConfig;
  children: React.ReactNode;
}

export default function WorkspaceShell({ workspace, children }: WorkspaceShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // Resolve name/email/initial from Supabase (fast, no network round-trip
    // beyond the local session), then enrich with role+department from the DB.
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user?.email) return;
      const name: string =
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        user.email;
      const initial = name.trim().charAt(0).toUpperCase();

      // Set a quick initial value so the sidebar isn't blank.
      setAuthUser({ name, email: user.email, initial, role: null, department: null });

      // Enrich with DB role + department via the existing users-api helper.
      try {
        const dbUser = await fetchCurrentUser();
        if (dbUser) {
          setAuthUser({
            name,
            email: user.email,
            initial,
            role:       dbUser.role,
            department: dbUser.department,
          });
        }
      } catch {
        // Non-fatal: sidebar shows name/email without role/department.
      }
    });
  }, []);

  return (
    <div className="flex h-screen overflow-hidden"style={{ background: "var(--background)"}}>
      <WorkspaceSidebar
        workspace={workspace}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        authUser={authUser}
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
