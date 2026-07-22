"use client";

import { EmptyDashboardState } from "@/components/dashboard/EmptyDashboardState";
import { StopBoardCard } from "@/components/dashboard/StopBoardCard";
import type { SavedStop } from "@/types/domain";

interface DashboardProps {
    stops: SavedStop[];
    refreshIntervalSeconds: number;
    onRemoveStop: (key: string) => void;
}

export function Dashboard({ stops, refreshIntervalSeconds, onRemoveStop }: DashboardProps) {
    if (stops.length === 0) return <EmptyDashboardState />;

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stops.map((stop) => (
                <StopBoardCard key={stop.key} stop={stop} refreshIntervalSeconds={refreshIntervalSeconds} onRemove={onRemoveStop} />
            ))}
        </div>
    );
}
