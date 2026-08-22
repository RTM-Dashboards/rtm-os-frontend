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

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

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

  return (
    <div className="flex h-screen overflow-hidden"style={{ background: "var(--background)"}}>
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={authUser}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
