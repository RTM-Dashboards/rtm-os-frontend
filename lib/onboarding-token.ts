// lib/onboarding-token.ts
//
// Signed, expiring client-portal tokens for the onboarding form.
//
// ── Design ──────────────────────────────────────────────────────────────────
//
// Token format (URL-safe base64, no padding):
//
//   <payload_b64>.<sig_b64>
//
// Payload (JSON, then base64url):
//   { recordId: string, exp: number }   — exp is Unix seconds
//
// Signature:
//   HMAC-SHA256( payload_b64, ONBOARDING_TOKEN_SECRET )
//   Base64url-encoded (no padding).
//
// The client can decode the payload (it contains only their own record id and
// an expiry timestamp — nothing secret). They cannot forge or swap it because
// they do not hold the secret.
//
// Verification is timing-safe: timingSafeEqual is used for the HMAC comparison.
//
// ── Environment variable ────────────────────────────────────────────────────
//
//   ONBOARDING_TOKEN_SECRET
//
//   Required. 32-byte hex string (64 hex chars). Generate with:
//     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
//
//   The app fails closed (throws) if this variable is missing or short.
//   Never set this to a hard-coded value; keep it in the environment only.
//
// ── Token lifetime ──────────────────────────────────────────────────────────
//
//   TOKEN_TTL_SECONDS = 30 days.
//
//   Rationale: a client gathering logins and brand assets may take up to a
//   fortnight. 30 days gives a comfortable margin. If a token expires the AM
//   can reissue one in seconds (the "Copy Client Link" button calls
//   POST /api/onboarding-client-token which generates a fresh token on demand).
//
// ── Precedent ───────────────────────────────────────────────────────────────
//
//   The GHL webhook verifier uses Node's crypto with an environment-variable
//   key. This module follows the same pattern (lib/ghl/webhook-keys.ts was the
//   existing reference; this is the secret-key analogue for our own tokens).

import { createHmac, timingSafeEqual } from "crypto";

// ── Constants ────────────────────────────────────────────────────────────────

export const TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

// ── Secret ───────────────────────────────────────────────────────────────────

function getSecret(): Buffer {
  const raw = process.env.ONBOARDING_TOKEN_SECRET;
  if (!raw || raw.trim().length < 32) {
    // Fail closed. A missing or short secret must never silently allow access.
    throw new Error(
      "ONBOARDING_TOKEN_SECRET is not set or is too short. " +
        "Set it to a 64-character hex string in your environment variables."
    );
  }
  // Accept hex or raw string; hex is the documented format.
  const trimmed = raw.trim();
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return Buffer.from(trimmed, "hex");
  }
  // Fallback: treat as UTF-8 (still works, just less entropy if short)
  return Buffer.from(trimmed, "utf8");
}

// ── Base64url helpers ─────────────────────────────────────────────────────────

function toB64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function fromB64url(s: string): Buffer {
  // Pad back to standard base64 before decoding
  const padded = s + "=".repeat((4 - (s.length % 4)) % 4);
  return Buffer.from(padded.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

// ── Payload type ──────────────────────────────────────────────────────────────

export interface OnboardingTokenPayload {
  recordId: string;
  exp: number; // Unix seconds
}

// ── sign ─────────────────────────────────────────────────────────────────────

/**
 * Creates a signed token for the given recordId.
 * Throws if ONBOARDING_TOKEN_SECRET is missing.
 */
export function signToken(recordId: string): string {
  const secret = getSecret();
  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const payload: OnboardingTokenPayload = { recordId, exp };
  const payloadB64 = toB64url(Buffer.from(JSON.stringify(payload)));

  const sig = createHmac("sha256", secret).update(payloadB64).digest();
  const sigB64 = toB64url(sig);

  return `${payloadB64}.${sigB64}`;
}

// ── VerifyResult ──────────────────────────────────────────────────────────────

export type VerifyResult =
  | { ok: true; payload: OnboardingTokenPayload }
  | { ok: false; reason: "malformed" | "invalid" | "expired" | "secret-missing" };

/**
 * Verifies a token.
 *
 * - Returns { ok: false, reason: "secret-missing" } if the secret env var is
 *   not set (so the caller can return 500 rather than 401/403).
 * - Returns { ok: false, reason: "invalid" } for a bad signature (timing-safe).
 * - Returns { ok: false, reason: "expired" } if the token is past its exp.
 * - Returns { ok: false, reason: "malformed" } if it cannot be parsed.
 */
export function verifyToken(token: string): VerifyResult {
  let secret: Buffer;
  try {
    secret = getSecret();
  } catch {
    return { ok: false, reason: "secret-missing" };
  }

  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { ok: false, reason: "malformed" };
  }

  const [payloadB64, sigB64] = parts;

  // Recompute expected signature
  const expected = createHmac("sha256", secret).update(payloadB64).digest();

  // Decode provided signature
  let provided: Buffer;
  try {
    provided = fromB64url(sigB64);
  } catch {
    return { ok: false, reason: "malformed" };
  }

  // Timing-safe comparison
  if (
    expected.length !== provided.length ||
    !timingSafeEqual(expected, provided)
  ) {
    return { ok: false, reason: "invalid" };
  }

  // Decode payload
  let payload: OnboardingTokenPayload;
  try {
    const json = fromB64url(payloadB64).toString("utf8");
    payload = JSON.parse(json) as OnboardingTokenPayload;
  } catch {
    return { ok: false, reason: "malformed" };
  }

  if (
    typeof payload.recordId !== "string" ||
    typeof payload.exp !== "number"
  ) {
    return { ok: false, reason: "malformed" };
  }

  // Expiry check
  if (Math.floor(Date.now() / 1000) > payload.exp) {
    return { ok: false, reason: "expired" };
  }

  return { ok: true, payload };
}
