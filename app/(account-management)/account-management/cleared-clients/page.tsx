/**
 * Cleared Clients — removed as a standalone page.
 *
 * "Cleared" is a Billing-owned read-only flag. It is now a visible
 * attribute on each client within the Client Portfolio page.
 *
 * The onboarding entry queue has moved to /account-management/onboarding
 * (nav label: "Onboarding Queue").
 */

import { redirect } from "next/navigation";

export default function ClearedClientsRedirect() {
  redirect("/account-management/onboarding");
}
