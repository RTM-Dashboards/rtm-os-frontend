// RTM OS — Supabase server client
//
// Use this in Server Components, Route Handlers, and Server Actions.
// Must be called inside an async context where Next.js cookies() is available.
// Creates a new client per request (stateless by design).

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll is called from a Server Component where cookies cannot be
            // mutated. The middleware handles session refresh in that case.
          }
        },
      },
    }
  );
}
