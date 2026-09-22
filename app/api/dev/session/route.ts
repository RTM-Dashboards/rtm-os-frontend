// RTM OS — Development Session Minting Route
//
// WHAT THIS DOES: Creates a real Supabase session for a named email address,
// without going through Google OAuth. The resulting session cookies are
// identical to what a real browser login produces. Any route that calls
// getSessionUser() with those cookies behaves exactly as it does in production.
//
// WHY IT EXISTS: /api/invoices, /api/users, and every future gated route call
// getSessionUser(), which reads a real Supabase session cookie. Without this,
// automated verification requires a real browser and a real Google login. This
// route makes the real enforcement path exercisable by curl or any HTTP client.
//
// HOW IT WORKS (mechanism):
//   1. Use the Supabase admin API to generate a magic-link token for the email.
//   2. Exchange that token hash for a real session via supabase.auth.verifyOtp().
//   3. Write the session cookies using createServerClient from @supabase/ssr,
//      the same library used by the real auth callback and server client.
//      This ensures the cookie name, encoding, and chunking are identical to
//      what getSessionUser() expects to read.
//
// FIVE GUARDS — ALL MUST PASS BEFORE ANYTHING HAPPENS:
//   Guard 1: NODE_ENV must be exactly "development".
//            Vercel sets NODE_ENV=production unconditionally. Dead in production.
//   Guard 2: RTM_DEV_SESSION env var must be exactly "1". Explicit opt-in.
//   Guard 3: SUPABASE_SERVICE_ROLE_KEY must be present. Refuses, does not crash.
//   Guard 4: Request must come from localhost (host header check).
//   Guard 5: Email must end in AUTH_ALLOWED_EMAIL_DOMAIN (default: realtimemarketing.com).
//
// All guard failures return 404 — not 403. In a deployed environment this route
// must be indistinguishable from a route that does not exist.
//
// THIS ROUTE MUST NEVER BE REACHABLE IN PRODUCTION.
//   - Guard 1 (NODE_ENV) alone makes it dead code on Vercel.
//   - Guard 4 (localhost) blocks any request that didn't originate locally.
//   - The proxy additionally redirects non-session requests to /login in
//     production, providing a second layer before this code even runs.
//
// WHAT THIS ROUTE DOES NOT DO:
//   - Does not touch lib/auth/index.ts or getSessionUser().
//   - Does not set role, status, or department on any User row.
//   - Does not add any bypass branch inside enforcement logic.
//   - Does not log, return, or echo the service role key.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/admin";

// ── Constants ─────────────────────────────────────────────────────────────────

const ALLOWED_DOMAIN = (
  process.env.AUTH_ALLOWED_EMAIL_DOMAIN ?? "realtimemarketing.com"
).toLowerCase();

// ── Guard helpers ─────────────────────────────────────────────────────────────

/** All guard failures return 404 — do not confirm existence of this route. */
function deny(): NextResponse {
  return NextResponse.json({ error: "Not found." }, { status: 404 });
}

function isLocalhost(request: NextRequest): boolean {
  const host = request.headers.get("host") ?? "";
  const hostname = host.split(":")[0].toLowerCase();
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1"
  );
}

// ── POST /api/dev/session ─────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── Guard 1: NODE_ENV must be "development" ──────────────────────────────
  if (process.env.NODE_ENV !== "development") {
    return deny();
  }

  // ── Guard 2: RTM_DEV_SESSION must be "1" ────────────────────────────────
  if (process.env.RTM_DEV_SESSION !== "1") {
    return deny();
  }

  // ── Guard 3: SUPABASE_SERVICE_ROLE_KEY must be present ──────────────────
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error(
      "[dev/session] SUPABASE_SERVICE_ROLE_KEY is not set. " +
        "Add it to .env.local to use this route."
    );
    return deny();
  }

  // ── Guard 4: Must come from localhost ────────────────────────────────────
  if (!isLocalhost(request)) {
    return deny();
  }

  // ── Parse request body ────────────────────────────────────────────────────

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email =
    body !== null &&
    typeof body === "object" &&
    "email" in body &&
    typeof (body as Record<string, unknown>).email === "string"
      ? ((body as Record<string, unknown>).email as string).toLowerCase().trim()
      : null;

  if (!email) {
    return NextResponse.json(
      { error: 'Body must include { "email": "user@example.com" }.' },
      { status: 400 }
    );
  }

  // ── Guard 5: Email must be in the allowed domain ─────────────────────────
  const emailDomain = email.split("@")[1]?.toLowerCase();
  if (emailDomain !== ALLOWED_DOMAIN) {
    return deny();
  }

  // ── All guards passed — proceed ───────────────────────────────────────────

  // Step 1: Use the admin client to generate a magic-link token.
  // NOTE ON SUPABASE AUTH USER CREATION:
  // generateLink with type "magiclink" will create a Supabase Auth user for
  // the email if one does not already exist. This is Supabase's own behaviour
  // and cannot be suppressed. See the report for details. The created Auth user
  // has no corresponding Prisma User row until the real auth callback runs.
  let adminClient: ReturnType<typeof createAdminClient>;
  try {
    adminClient = createAdminClient();
  } catch (err) {
    console.error("[dev/session] Failed to create admin client:", err);
    return NextResponse.json(
      {
        error:
          "Admin client could not be initialised. Check SUPABASE_SERVICE_ROLE_KEY.",
      },
      { status: 500 }
    );
  }

  const { data: linkData, error: linkError } =
    await adminClient.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

  if (linkError || !linkData?.properties?.hashed_token) {
    console.error(
      "[dev/session] generateLink error:",
      linkError?.message ?? "no token"
    );
    return NextResponse.json(
      {
        error: `Could not generate magic link: ${
          linkError?.message ?? "unknown error"
        }`,
      },
      { status: 500 }
    );
  }

  const tokenHash = linkData.properties.hashed_token;

  // Step 2: Exchange the token hash for a real session.
  // Use a plain supabase-js client (not SSR) for the exchange — we don't need
  // cookie handling at this point, just the token exchange.
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
  );

  const { data: sessionData, error: sessionError } =
    await anonClient.auth.verifyOtp({
      token_hash: tokenHash,
      type: "magiclink",
    });

  if (sessionError || !sessionData?.session) {
    console.error(
      "[dev/session] verifyOtp error:",
      sessionError?.message ?? "no session"
    );
    return NextResponse.json(
      {
        error: `Could not exchange token for session: ${
          sessionError?.message ?? "unknown error"
        }`,
      },
      { status: 500 }
    );
  }

  const session = sessionData.session;

  // Step 3: Build the response and write session cookies using createServerClient.
  //
  // We use createServerClient from @supabase/ssr (the same library used by
  // lib/supabase/server.ts) to write the cookies. This ensures the cookie
  // name, encoding format, and chunking strategy exactly match what
  // getSessionUser() → createClient() → cookieStore.getAll() will read back.
  //
  // The trick: we create the SSR client with cookie setAll targeting our
  // response object, then call setSession() on it. The SSR library's
  // onAuthStateChange handler calls setAll when the session is established,
  // which writes the correctly-formatted cookies to the response.

  const cookiesToSet: Array<{
    name: string;
    value: string;
    options: Record<string, unknown>;
  }> = [];

  // We need a mutable response to accumulate cookies. We'll build it after
  // collecting what the SSR client wants to set.
  const ssrClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // No existing cookies to read — this is a fresh session mint.
          return [];
        },
        setAll(items) {
          // Collect the cookies the SSR library wants to set.
          for (const item of items) {
            cookiesToSet.push(item as typeof cookiesToSet[number]);
          }
        },
      },
    }
  );

  // setSession() triggers the SSR library's internal onAuthStateChange →
  // SIGNED_IN event → calls setAll on the storage → our collector above runs.
  const { error: setSessionError } = await ssrClient.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });

  if (setSessionError) {
    console.error("[dev/session] setSession error:", setSessionError.message);
    return NextResponse.json(
      { error: `Could not establish session: ${setSessionError.message}` },
      { status: 500 }
    );
  }

  // Step 4: Build the response.
  const response = NextResponse.json({
    ok: true,
    email: session.user?.email ?? email,
    userId: session.user?.id ?? null,
    expiresAt: session.expires_at ?? null,
    // Include the access token so curl callers can also use Bearer auth if
    // the route supports it, or inspect token claims for debugging.
    // The access token is a JWT — it contains no server secrets.
    accessToken: session.access_token,
    note: "Set the Set-Cookie headers from this response on subsequent requests. See docs/dev-session-tooling.md for copy-pasteable curl examples.",
  });

  // Step 5: Apply the cookies collected from the SSR client.
  for (const cookie of cookiesToSet) {
    const { name, value, options } = cookie;
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
  }

  return response;
}
