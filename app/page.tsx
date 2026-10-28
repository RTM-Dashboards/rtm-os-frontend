// RTM OS — Root redirect
//
// Sends the user to the correct landing page based on their role and department.
// Unauthenticated users are redirected to /login by the middleware; they never
// reach this component.
//
// Landing rule (mirrors lib/auth/landing-route.ts):
//   Executive / SystemAdmin → /admin
//   Has a department        → department workspace
//   Otherwise               → /projects

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { landingRoute } from "@/lib/auth/landing-route";

export default async function Home() {
  const { user } = await getSessionUser();
  redirect(landingRoute(user?.role ?? null, user?.department ?? null));
}
