// RTM OS — Supabase browser client
//
// Use this in Client Components ("use client") only.
// One instance per browser session; safe to call multiple times
// (createBrowserClient memoises by URL+key).

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
