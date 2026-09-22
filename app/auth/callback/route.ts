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
//   3. If the domain is not the allowed domain: sign out and redirect to
//      /login?error=domain_not_allowed.
//   4. Upsert the Prisma User row. On failure: sign out and redirect to
//      /login?error=account_error — the upsert is now BLOCKING (A2).
//   5. Set lastLoginAt on every successful login.
//   6. Redirect to /admin.
//
// ── A2: Upsert fields written on UPDATE ──────────────────────────────────────
//   The update branch writes ONLY:
//     - email    (corrects email changes in Google account, non-sensitive)
//     - name     (corrects display name changes in Google account)
//     - lastLoginAt  (timestamp of this login — used by Team Members page)
//     - updatedAt    (audit trail)
//
//   The update branch NEVER writes:
//     - role        (set at invite time only, login must never change it)
//     - department  (set at invite time only, login must never change it)
//     - status      (set at invite time only, login must never change it)
//     - invitedBy / invitedAt  (invite provenance, written once at invite time)
//     - createdAt   (immutable after row creation)
//     - id          (primary key, never patched)
//
// ── A2: Failure is now blocking ───────────────────────────────────────────────
//   Previously a failed upsert was swallowed and the user still reached /admin.
//   Once access depends on the User row, a missing row is a silent security hole.
//   A upsert failure now: signs the user out, redirects to /login with an error.

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

  // ── Upsert the Prisma User row (A2: now BLOCKING) ────────────────────────
  //
  // A failed upsert previously allowed the user through to /admin even with
  // no User row. Now that access depends on the User row being present and
  // having a role set, a missing row is a security hole. Failure now blocks:
  // sign out, redirect to /login with an honest error.
  //
  // The update branch writes ONLY: email, name, lastLoginAt, updatedAt.
  // It NEVER writes role, department, status, invitedBy, invitedAt, or createdAt.
  // New rows get role null and status "pending" — never defaulted to any role.
  try {
    const { prisma } = await import("@/lib/db/prisma");
    const displayName =
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email;

    const now = new Date().toISOString();

    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        // Fields that reflect the current Google account state — safe to refresh.
        email:       user.email,
        name:        displayName,
        // A2: set lastLoginAt on every successful login.
        lastLoginAt: now,
        updatedAt:   now,
        // NEVER written by update: role, department, status, invitedBy, invitedAt, createdAt.
      },
      create: {
        id:        user.id,
        email:     user.email,
        name:      displayName,
        // New rows: no role, no department, status "pending" (column default).
        // The invite flow will set role and status when it lands; until then
        // the user is in "pending" state and access is denied.
        role:      null,
        department: null,
        // status defaults to "pending" from the column default — not set here
        // explicitly so that if the default changes, the schema is the authority.
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      },
    });
  } catch (upsertError) {
    // A2: upsert failure is now BLOCKING. A missing User row means the access
    // check in lib/auth/ will deny entry. Rather than let the user through to
    // an immediate 403 on every page, block here at login with a clear message.
    console.error(
      "[auth/callback] FATAL: Prisma User upsert failed. Blocking login. Error:",
      upsertError
    );
    await supabase.auth.signOut();
    return NextResponse.redirect(
      `${origin}/login?error=account_error&message=${encodeURIComponent(
        "Your account could not be verified. Please contact your manager."
      )}`
    );
  }

  return NextResponse.redirect(`${origin}${DEFAULT_REDIRECT}`);
}
