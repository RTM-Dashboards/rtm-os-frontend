"use client";

/**
 * Billing Offboarding Triggers — REMOVED
 *
 * This page has been removed. Billing's responsibility ends at processing
 * the cancellation (Cancellations page) and sending a mock "AM Notified"
 * signal. Downstream execution (campaign pausing, CRM archival, win-back
 * sequencing) is Account Management / Operations work — not Billing's.
 *
 * The "Trigger Offboarding" action on the Cancellations page now fires
 * an "AM Notified" status update and toast instead of navigating here.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BillingOffboardingRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/billing/cancellations");
  }, [router]);
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>
        Redirecting to Billing Cancellations…
      </p>
    </div>
  );
}
