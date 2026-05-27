import WorkspaceShell from "@/components/layout/WorkspaceShell";
import { getWorkspace } from "@/lib/workspaces";
import { notFound } from "next/navigation";

export default function ulocaluserviceuadsLayout({ children }: { children: React.ReactNode }) {
  const workspace = getWorkspace("local-service-ads");
  if (!workspace) notFound();
  return <WorkspaceShell workspace={workspace}>{children}</WorkspaceShell>;
}
