// RTM OS — OAuth Callback Route
//
// Handles the redirect from Supabase after Google OAuth completes.
// This is the ONLY place where authentication state is established.
//
// Domain restriction is enforced HERE, server-side.
// A client-side check alone would be insufficient because:
//   - JavaScript can be bypassed or disabled.
//   - The Supabase session is created server-side on this callback; client-side
//     checks run after the session already exists, meaning a non-allowed-domain
//     user could have an active session before any client check fires.
//   - The callback runs in a Route Handler (server context) with access to the
//     full Supabase response including the user's email. Enforcement here means
//     no session is ever written for a rejected domain.
//
// The allowed domain is read from AUTH_ALLOWED_EMAIL_DOMAIN (env var).
// When that variable is unset the default is "realtimemarketing.com".
// A missing env var MUST NOT open the door to all domains — it falls back to
// the known-correct domain, never to an allow-all state.
//
// Flow:
//   1. Exchange the ?code param for a session.
//   2. Read the authenticated user's email.
//   3. If the domain is not the allowed domain: sign out and redirect to /login?error=domain_not_allowed.
//   4. If the domain is valid: upsert the Prisma User row, then redirect to /admin.
//
// The upsert (step 4) is non-blocking: if it fails, the user still reaches /admin.
// The failure is logged loudly so it surfaces in Vercel logs.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Read the allowed domain from an environment variable so it can differ
// between environments and be corrected without a code change or redeploy.
// IMPORTANT: when the variable is unset we fall back to the real production
// domain — never to allowing all domains.
const ALLOWED_DOMAIN = (
  process.env.AUTH_ALLOWED_EMAIL_DOMAIN ?? "realtimemarketing.com"
).toLowerCase();
const DEFAULT_REDIRECT = "/admin";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // If no code is present, the OAuth flow was cancelled or is malformed.
  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=auth_failed&message=${encodeURIComponent("Sign-in was cancelled or failed. Please try again.")}`
    );
  }

  const supabase = await createClient();

  // Exchange the authorisation code for a session.
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    console.error("[auth/callback] exchangeCodeForSession error:", exchangeError.message);
    return NextResponse.redirect(
      `${origin}/login?error=auth_failed&message=${encodeURIComponent("Authentication failed. Please try again.")}`
    );
  }

  // Retrieve the authenticated user.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user || !user.email) {
    console.error("[auth/callback] getUser error:", userError?.message ?? "no user");
    return NextResponse.redirect(
      `${origin}/login?error=auth_failed&message=${encodeURIComponent("Could not retrieve user details. Please try again.")}`
    );
  }

  // ── Domain restriction (server-side, authoritative) ──────────────────────
  // Only addresses whose domain matches ALLOWED_DOMAIN are permitted.
  // Reject everything else cleanly: sign the user out first so no partial
  // session lingers, then redirect. Both sides are lowercased before comparing.
  const emailDomain = user.email.split("@")[1]?.toLowerCase();
  if (emailDomain !== ALLOWED_DOMAIN) {
    console.warn(
      `[auth/callback] Rejected sign-in from non-allowed domain: ${emailDomain ?? "(none)"}`
    );
    await supabase.auth.signOut();
    return NextResponse.redirect(
      `${origin}/login?error=domain_not_allowed&message=${encodeURIComponent(
        `Only @${ALLOWED_DOMAIN} Google accounts may sign in to RTM OS.`
      )}`
    );
  }

  // ── Upsert the Prisma User row ───────────────────────────────────────────
  // Deliberately non-blocking. A database failure must not prevent login.
  try {
    const { prisma } = await import("@/lib/db/prisma");
    const displayName =
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email;

    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        name: displayName,
        updatedAt: new Date().toISOString(),
      },
      create: {
        id: user.id,
        email: user.email,
        name: displayName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (upsertError) {
    // Log loudly — visible in Vercel Function logs and local terminal.
    // The user still proceeds; this must not block login.
    console.error(
      "[auth/callback] WARN: Prisma User upsert failed. User can still sign in. Error:",
      upsertError
    );
  }

  return NextResponse.redirect(`${origin}${DEFAULT_REDIRECT}`);
}
