"use client";

import { useMemo } from "react";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { RefreshIntervalControl } from "@/components/settings/RefreshIntervalControl";
import { StopSearchBox } from "@/components/stop-search/StopSearchBox";
import { useRefreshInterval } from "@/hooks/useRefreshInterval";
import { useSavedStops } from "@/hooks/useSavedStops";

export function DashboardShell() {
    const { stops, addStop, removeStop } = useSavedStops();
    const { refreshIntervalSeconds, setRefreshIntervalSeconds } = useRefreshInterval();
    const savedLids = useMemo(() => new Set(stops.map((stop) => stop.lid)), [stops]);

    return (
        <div className="mx-auto flex w-full max-w-container flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
            <header className="flex flex-col gap-1">
                <h1 className="text-display-xs font-semibold text-primary">Departure board</h1>
                <p className="text-sm text-tertiary">Live departures for your saved bus and tram stops.</p>
            </header>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <StopSearchBox savedLids={savedLids} onAddStop={addStop} />
                <RefreshIntervalControl refreshIntervalSeconds={refreshIntervalSeconds} onChange={setRefreshIntervalSeconds} />
            </div>

            <Dashboard stops={stops} refreshIntervalSeconds={refreshIntervalSeconds} onRemoveStop={removeStop} />
        </div>
    );
}
