"use client";

import { useState, useEffect } from "react";
import WorkspaceSidebar from "./WorkspaceSidebar";
import TopNav from "./TopNav";
import { createClient } from "@/lib/supabase/client";
import type { WorkspaceConfig } from "@/types/workspace";

interface AuthUser {
  name: string;
  email: string;
  initial: string;
}

interface WorkspaceShellProps {
  workspace: WorkspaceConfig;
  children: React.ReactNode;
}

export default function WorkspaceShell({ workspace, children }: WorkspaceShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user?.email) return;
      const name: string =
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        user.email;
      const initial = name.trim().charAt(0).toUpperCase();
      setAuthUser({ name, email: user.email, initial });
    });
  }, []);

  return (
    <div className="flex h-screen overflow-hidden"style={{ background: "var(--background)"}}>
      <WorkspaceSidebar
        workspace={workspace}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
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
