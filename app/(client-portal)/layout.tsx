/**
 * Client Portal layout — intentionally minimal.
 *
 * This route group hosts standalone, client-facing pages that must NOT
 * include the AM workspace shell, sidebar, or any internal navigation.
 * It inherits the root layout (html/body/fonts) and adds nothing else.
 *
 * All pages under (client-portal)/ are unauthenticated and shell-free
 * by design. This is consistent with the interim mock-data model used
 * throughout this app; real auth/access tokens are a known future concern.
 */
export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
