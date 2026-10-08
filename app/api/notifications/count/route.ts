// RTM OS — GET /api/notifications/count
//
// Returns { unread: number } for the authenticated user.
// Used by the bell to show the badge count.
// Enforced: recipient_id = session user id (you see only your own).

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  const { user, error, status } = await getSessionUser(request);
  if (error) return NextResponse.json({ error }, { status });

  const unread = await prisma.notification.count({
    where: { recipientId: user!.id, readAt: null },
  });

  return NextResponse.json({ unread });
}
