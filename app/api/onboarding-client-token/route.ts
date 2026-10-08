// app/api/onboarding-client-token/route.ts
//
// POST /api/onboarding-client-token
//
// Generates a signed, 30-day client-portal token for a specific onboarding
// record. Used by the AM form's "Copy Client Link" button so that the link
// the AM copies carries a real credential instead of a bare record id.
//
// ── Auth ─────────────────────────────────────────────────────────────────────
//
//   Requires an authenticated session in the Account Management department at
//   Member level or above. Executives and SystemAdmins pass regardless of
//   department (requireDepartment contract).
//
//   Rationale: only the team that owns onboarding should produce client links.
//   If Billing or Sales need to send one they ask Account Management.
//
// ── Request body ─────────────────────────────────────────────────────────────
//
//   { recordId: string }
//
// ── Response ──────────────────────────────────────────────────────────────────
//
//   200  { token: string, expiresAt: string (ISO-8601), link: string }
//   400  { error: "recordId is required" }
//   401  { error: "..." }   — no session
//   403  { error: "..." }   — wrong department / role
//   500  { error: "..." }   — signing secret missing or other server fault
//
// ── Reissue ───────────────────────────────────────────────────────────────────
//
//   There is no reissue-specific endpoint. Calling POST again with the same
//   recordId produces a fresh 30-day token, making the old one irrelevant.
//   The AM copies it and sends by hand (no email mechanism in this app).

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, requireDepartment } from "@/lib/auth";
import { signToken, TOKEN_TTL_SECONDS } from "@/lib/onboarding-token";

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const { user, error, status } = await getSessionUser(req);
  if (error) {
    return NextResponse.json({ error }, { status: status ?? 401 });
  }

  const gate = requireDepartment(user!, "Account Management", "Member");
  if (gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  // ── Body ──────────────────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { recordId } = body as { recordId?: string };
  if (!recordId || typeof recordId !== "string") {
    return NextResponse.json({ error: "recordId is required" }, { status: 400 });
  }

  // ── Sign ──────────────────────────────────────────────────────────────────
  let token: string;
  try {
    token = signToken(recordId);
  } catch (err) {
    // Secret is missing — fail closed with 500 (misconfiguration, not caller fault)
    console.error("[onboarding-client-token] signing failed:", err);
    return NextResponse.json(
      { error: "Token signing is unavailable. Contact the system administrator." },
      { status: 500 }
    );
  }

  const expiresAt = new Date(
    Date.now() + TOKEN_TTL_SECONDS * 1000
  ).toISOString();

  // Build the full link. Use NEXT_PUBLIC_APP_URL if available (server context);
  // the browser-side button will prefer its own origin via window.location.origin.
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  const link = `${appUrl}/client-onboarding/${recordId}?token=${token}`;

  return NextResponse.json({ token, expiresAt, link });
}
