// RTM OS — Supabase middleware client
//
// Used exclusively by middleware.ts to refresh the session on every request.
// Returns the updated request and response so the middleware can forward them.

import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export function createMiddlewareClient(request: NextRequest) {
  // Mutable response that the middleware will return.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write cookies to both the outgoing request and the response so the
          // browser and subsequent server reads stay in sync.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  return { supabase, response };
}
