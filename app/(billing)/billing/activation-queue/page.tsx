"use client";

/**
 * Activation Queue — Consolidated into /billing/activation
 *
 * After rescoping, Activation Queue and Activation contained the same
 * Billing-scoped greenlight workflow. This page redirects to the single
 * consolidated Activation page.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ActivationQueueRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/billing/activation"); }, [router]);
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>Redirecting to Billing Activation…</p>
    </div>
  );
}
