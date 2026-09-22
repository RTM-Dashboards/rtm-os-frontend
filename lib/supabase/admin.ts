// RTM OS — Supabase Admin Client
//
// WHAT THIS IS: A Supabase client initialised with the service role key.
// The service role key bypasses Row Level Security entirely. This client has
// full read/write access to every table and auth user in the project.
//
// WHEN TO USE IT: Only in the development session-minting route at
// app/api/dev/session/route.ts. That route is protected by five guards and is
// dead code in any production deployment.
//
// DO NOT import this file anywhere except app/api/dev/session/route.ts.
// Do not use it in any route that is reachable in production.
// Do not log, return, or expose the service role key or the client's JWT.
//
// The service role key MUST NOT appear in any NEXT_PUBLIC_ variable and MUST
// NOT be included in any response body, log line, or error message.

import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error(
      "[supabase/admin] NEXT_PUBLIC_SUPABASE_URL is not set. " +
        "Cannot create admin client."
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "[supabase/admin] SUPABASE_SERVICE_ROLE_KEY is not set. " +
        "Cannot create admin client. " +
        "Add it to .env.local (never to .env or any NEXT_PUBLIC_ variable)."
    );
  }

  // createClient from @supabase/supabase-js (not @supabase/ssr) is used here
  // because we need the admin API (.auth.admin.*), which is not available on
  // the SSR server client. This client does NOT set cookies; it is used
  // server-side only for admin operations.
  return createClient(url, serviceRoleKey, {
    auth: {
      // Disable automatic session persistence. This is a server-side admin
      // client; it should never cache a session to storage.
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
