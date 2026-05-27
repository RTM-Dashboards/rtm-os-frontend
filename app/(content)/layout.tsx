import WorkspaceShell from "@/components/layout/WorkspaceShell";
import { getWorkspace } from "@/lib/workspaces";
import { notFound } from "next/navigation";

export default function ucontentLayout({ children }: { children: React.ReactNode }) {
  const workspace = getWorkspace("content");
  if (!workspace) notFound();
  return <WorkspaceShell workspace={workspace}>{children}</WorkspaceShell>;
}
