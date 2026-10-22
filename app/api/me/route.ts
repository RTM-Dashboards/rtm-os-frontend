// RTM OS — Current-user identity endpoint
//
// GET /api/me
//   Returns the authenticated user's own row: id, name, email, role,
//   department, and status.  Used by client-side shells to make nav/module
//   visibility decisions without fetching the full user list.
//
// Auth: any authenticated active user.
// Error shape: { error: string } — matches all other routes.

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status ?? 401 });

  const u = user!;
  return NextResponse.json({
    id:         u.id,
    name:       u.name,
    email:      u.email,
    role:       u.role,
    department: u.department,
    status:     u.status,
  });
}
