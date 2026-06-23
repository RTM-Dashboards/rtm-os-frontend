"use client";

import { ActivityFeed, SectionWrapper } from "@/components/ui";
import type { ActivityItem } from "@/components/ui";

interface Props {
  items: ActivityItem[];
  maxItems?: number;
}

export default function AMActivityFeed({ items, maxItems = 10 }: Props) {
  return (
    <SectionWrapper
      title="AM Activity Feed"description="Real-time account management activity"actions={
        <button
          className="text-xs font-semibold hover:underline"style={{ color: "var(--rtm-blue)"}}
        >
          View all
        </button>
      }
    >
      <ActivityFeed items={items} maxItems={maxItems} />
    </SectionWrapper>
  );
}
