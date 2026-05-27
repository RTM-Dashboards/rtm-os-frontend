"use client";

import { useState } from "react";
import WorkspaceSidebar from "./WorkspaceSidebar";
import TopNav from "./TopNav";
import type { WorkspaceConfig } from "@/types/workspace";

interface WorkspaceShellProps {
  workspace: WorkspaceConfig;
  children: React.ReactNode;
}

export default function WorkspaceShell({ workspace, children }: WorkspaceShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--background)" }}>
      <WorkspaceSidebar
        workspace={workspace}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
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
