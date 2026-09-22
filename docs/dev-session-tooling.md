# Dev Session Tooling

> **WARNING: This tooling creates real Supabase sessions without Google OAuth.
> It must never be reachable in production. Read the production safety section
> before using or modifying any of these files.**

## What This Is For

`/api/invoices`, `/api/users`, and every future gated route call
`getSessionUser()`, which reads a real Supabase session cookie. Without a way
to obtain that cookie programmatically, automated verification of those routes
is impossible: each call returns 401 and the only recourse is a human with a
browser.

The dev session route solves this by minting a genuine Supabase session for a
named email address — one that `getSessionUser()` accepts without modification,
because it is a real session with real cookies. The enforcement path is
exercised in full. Only the act of signing in via Google is shortcutted.

## Route Location

```
app/api/dev/session/route.ts
```

## Admin Client Location

```
lib/supabase/admin.ts
```

The admin client uses `SUPABASE_SERVICE_ROLE_KEY`. It must not be imported
anywhere except the dev session route. The service role key bypasses Row Level
Security entirely and must never appear in a `NEXT_PUBLIC_` variable, a
response body, or a log line.

## Required Environment Variables

All three must be set in `.env.local`. None belong in `.env` (Vercel reads
`.env` for production deployments).

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key-from-supabase-dashboard>
RTM_DEV_SESSION=1
```

`AUTH_ALLOWED_EMAIL_DOMAIN` defaults to `realtimemarketing.com` and is
already set in `.env.local`. Target emails must match this domain.

## Production Safety

Five guards fire before any functionality runs. All failures return **404** —
the route is indistinguishable from a nonexistent route to any caller who is
not in the allowed environment.

| # | Guard | What it checks | Why it holds in production |
|---|-------|----------------|---------------------------|
| 1 | NODE\_ENV | must be exactly `"development"` | Vercel sets `NODE_ENV=production` unconditionally — this guard alone makes the route dead code in any deployment |
| 2 | RTM\_DEV\_SESSION | must be exactly `"1"` | This var is set in `.env.local` only, never in `.env` (Vercel production env) |
| 3 | SUPABASE\_SERVICE\_ROLE\_KEY | must be present | Refuses with a log message rather than crashing; the key is not set in `.env` |
| 4 | Host header | must be `localhost`, `127.0.0.1`, or `::1` | No remote caller can satisfy this |
| 5 | Email domain | must match `AUTH_ALLOWED_EMAIL_DOMAIN` | Matches the production auth callback's own rule |

Additionally, the proxy (`proxy.ts`) redirects unauthenticated requests to
`/login` in production, providing a second layer before the route code runs at
all. The route is **not** in `PUBLIC_PATHS` — the existing `RTM_DEV_API_BYPASS`
handles proxy bypass for `/api/*` in development only.

## What the Route Creates

- **Supabase Auth user**: `generateLink` with type `magiclink` creates a
  Supabase Auth user for the email if one does not already exist. This is
  Supabase's own behaviour and cannot be suppressed. The created Auth user has
  no corresponding Prisma User row until `getSessionUser()` is called by a
  protected route (which returns 403: "account not set up"), or until a Prisma
  row is inserted manually.
- **Prisma User row**: The route does **not** create or modify Prisma User rows.
  Role, status, and department must be set separately (via `/api/users` with a
  SystemAdmin session, or via a direct Prisma insert for setup/teardown).
- **Session cookies**: Two `Set-Cookie` headers are returned, matching exactly
  what the real auth callback writes. Subsequent requests that include these
  cookies satisfy `getSessionUser()`.

## Copy-Pasteable curl Example

### 1. Mint a session

```bash
# Store cookies in a file for reuse
curl -si -X POST http://localhost:3000/api/dev/session \
  -H "Content-Type: application/json" \
  -d '{"email":"fe@realtimemarketing.com"}' \
  | grep -i "^set-cookie:" \
  | sed 's/^set-cookie: //i' \
  | cut -d';' -f1 \
  | tr '\n' '; ' \
  > /tmp/rtm-session-cookie.txt

cat /tmp/rtm-session-cookie.txt   # inspect
```

### 2. Use the session cookie

```bash
COOKIES=$(cat /tmp/rtm-session-cookie.txt)

# Verify: GET /api/users (SystemAdmin sees all users)
curl -s -H "Cookie: $COOKIES" http://localhost:3000/api/users | python3 -m json.tool

# Verify: GET /api/invoices
curl -s -H "Cookie: $COOKIES" http://localhost:3000/api/invoices | python3 -m json.tool

# Verify: PATCH /api/users (self-modification — expect 403)
curl -s -w "\nHTTP %{http_code}" \
  -X PATCH \
  -H "Cookie: $COOKIES" \
  -H "Content-Type: application/json" \
  -d '{"role":"SystemAdmin"}' \
  "http://localhost:3000/api/users?id=<your-own-user-id>"
```

### 3. Test another role tier

```bash
# 1. Get the Supabase Auth user id from the mint response
MEMBER_RESP=$(curl -s -X POST http://localhost:3000/api/dev/session \
  -H "Content-Type: application/json" \
  -d '{"email":"testmember@realtimemarketing.com"}')
MEMBER_ID=$(echo "$MEMBER_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['userId'])")

# 2. Create the Prisma User row with the desired role
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
const now = new Date().toISOString();
p.user.upsert({
  where: { id: '$MEMBER_ID' },
  create: { id: '$MEMBER_ID', email: 'testmember@realtimemarketing.com',
            name: 'Test Member', role: 'Member', status: 'active',
            department: 'Billing', createdAt: now, updatedAt: now },
  update: { role: 'Member', status: 'active', department: 'Billing', updatedAt: now }
}).then(() => p.\$disconnect());
"

# 3. Mint the session again and use it
MEMBER_COOKIES=$(curl -si -X POST http://localhost:3000/api/dev/session \
  -H "Content-Type: application/json" \
  -d '{"email":"testmember@realtimemarketing.com"}' \
  | grep -i "^set-cookie:" | sed 's/^set-cookie: //i' | cut -d';' -f1 | tr '\n' '; ')

curl -s -w "\nHTTP %{http_code}" -H "Cookie: $MEMBER_COOKIES" \
  http://localhost:3000/api/invoices
# → 200

curl -s -w "\nHTTP %{http_code}" \
  -X POST -H "Cookie: $MEMBER_COOKIES" -H "Content-Type: application/json" \
  -d '{}' http://localhost:3000/api/invoices
# → 403

# 4. Clean up: delete Prisma row and Supabase Auth user
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.delete({ where: { id: '$MEMBER_ID' } }).then(() => p.\$disconnect());
"

node -e "
const { createClient } = require('@supabase/supabase-js');
// Load NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from env
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } });
s.auth.admin.deleteUser('$MEMBER_ID').then(({error}) => {
  if (error) console.error(error.message); else console.log('Deleted');
});
"
```

## Schema Change Verification Protocol

**The last run shipped a route that failed at runtime while passing tsc and the
build.** This section exists because of that failure.

After any Prisma schema field change — before verifying anything else:

```bash
# Stop the dev server first
kill $(pgrep -f "next dev")

# Clear stale Prisma client and Next.js build cache
rm -rf node_modules/.prisma .next

# Regenerate the Prisma client from the current schema
npx prisma generate

# Restart the dev server
npm run dev
```

**Why this matters:**

- A Node script that imports `@prisma/client` directly creates its own Prisma
  client instance. That instance is compiled at `npx prisma generate` time. If
  the dev server and the verification script were generated at different schema
  snapshots, they disagree about the field shape.
- `npx tsc --noEmit` and `npm run build` both pass with a stale client if the
  TypeScript types were regenerated but the runtime client was not.
- Only a real HTTP request against the running dev server catches stale-client
  failures, because the server uses the compiled `.next/` bundle, which bundles
  the Prisma client at build time.

A Node script with its own `new PrismaClient()` will not reproduce a
stale-client failure. Neither will tsc. Neither will the build. **Only a real
request against the running dev server catches it.**

## Files Changed by This Session

- `lib/supabase/admin.ts` — new admin client (service role key, dev-only use)
- `app/api/dev/session/route.ts` — new dev session minting route
- `.env.local` — added `RTM_DEV_SESSION=1` (local only, not committed)
- `docs/dev-session-tooling.md` — this file
