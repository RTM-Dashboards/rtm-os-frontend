"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Follow Ups content has merged into Pipeline as a tab.
// This redirect ensures any existing links do not break.
export default function SalesFollowupsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/sales/pipeline?tab=followups");
  }, [router]);
  return null;
}
