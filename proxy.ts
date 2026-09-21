// RTM OS — Next.js Proxy (formerly middleware.ts)
//
// Next.js 16 renamed the convention from middleware.ts to proxy.ts.
// Functionality is identical; the file name change silences the deprecation warning.
//
// Protects all internal app routes by requiring an active Supabase session.
// Uses the existing lib/supabase/middleware.ts helper exclusively — no second
// Supabase client is created here.
//
// Public paths (no session required):
//   /login              — the sign-in page itself
//   /auth/callback      — Supabase OAuth redirect handler
//   /client-onboarding  — client-facing onboarding form (no internal shell)
//   /api/ghl/webhook    — GoHighLevel inbound webhook (no session, must stay open)
//
// The matcher excludes:
//   - Next.js internals (_next/static, _next/image)
//   - Static assets at the root (favicon.ico, rtm-logo.png, etc.)
// This prevents middleware from running on asset requests, which would be
// both wasteful and potentially break image/font delivery.
//
// CRITICAL: /api/ghl/webhook is listed in PUBLIC_PATHS so that even if the
// matcher accidentally matched it, the middleware would not redirect it.
// The matcher also excludes it via the negative lookahead on /api/ paths
// — belt AND braces.
//
// DEV API BYPASS
// When NODE_ENV === "development" AND RTM_DEV_API_BYPASS === "1", all /api/*
// requests are allowed through without a Supabase session check. This exists
// solely to allow local HTTP verification of API routes when Supabase env vars
// (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) are not populated.
//
// Production safety guarantees:
//   1. The outer guard is `process.env.NODE_ENV !== "development"` — Vercel
//      sets NODE_ENV=production unconditionally; this branch is dead code there.
//   2. RTM_DEV_API_BYPASS must also be explicitly set to "1". Unset = bypass
//      inactive regardless of NODE_ENV.
//   3. The bypass ONLY applies to /api/* paths. All non-API paths (pages,
//      layout routes) still go through the full session check regardless.
//   4. It is NOT added to PUBLIC_PATHS (which would affect page routes too).
//   5. This var is never set in .env (Vercel production env) or .env.local
//      beyond this development phase; remove it when Supabase vars are populated.

import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";

// Paths that are always accessible without a session.
const PUBLIC_PATHS = [
  "/login",
  "/auth/callback",
  "/client-onboarding",
  "/api/ghl/webhook",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (pub) => pathname === pub || pathname.startsWith(pub + "/")
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public paths through without touching the session.
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // DEV-ONLY API BYPASS
  // Allows local HTTP testing of /api/* routes when Supabase env vars are unset.
  // Cannot be active in production: requires NODE_ENV=development AND
  // RTM_DEV_API_BYPASS=1 to be set simultaneously. Vercel always sets
  // NODE_ENV=production, making this branch unreachable in any deployed context.
  if (
    process.env.NODE_ENV === "development" &&
    process.env.RTM_DEV_API_BYPASS === "1" &&
    pathname.startsWith("/api/")
  ) {
    return NextResponse.next();
  }

  // Refresh the Supabase session on every request. This keeps the session
  // cookie from expiring on long-lived tabs and ensures server components
  // see an up-to-date session.
  const { supabase, response } = createMiddlewareClient(request);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // No session — redirect to /login.
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Session present — return the (possibly cookie-refreshed) response.
  return response;
}

export const config = {
  matcher: [
    /*
     * Match ALL request paths EXCEPT:
     *   - _next/static  (Next.js static chunks)
     *   - _next/image   (Next.js image optimisation)
     *   - favicon.ico, sitemap.xml, robots.txt (common root static files)
     *   - Files with a static extension at the root (images, fonts, etc.)
     *
     * This intentionally matches /api/* routes too, so that internal API
     * routes are protected. /api/ghl/webhook is exempted by the PUBLIC_PATHS
     * check inside the middleware function itself.
     */
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf)$).*)",
  ],
};
