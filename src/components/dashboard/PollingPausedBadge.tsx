"use client";

import { BadgeWithDot } from "@/components/base/badges/badges";
import { usePollingPaused } from "@/hooks/usePollingPaused";

export function PollingPausedBadge() {
    const { isPaused } = usePollingPaused();

    if (!isPaused) return null;

    return (
        <BadgeWithDot color="warning" size="sm">
            Live updates paused
        </BadgeWithDot>
    );
}
