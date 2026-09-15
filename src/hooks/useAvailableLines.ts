"use client";

import { useEffect, useState } from "react";

interface Stop {
    name: string;
    lid: string;
}

/**
 * One-shot probe (not a poller) for the full set of lines at a stop, requested with a
 * wider window than the display board so an infrequent line isn't invisible to the
 * line-filter picker just because it has no departure within the display board's much
 * smaller cap (this also matters once a filter narrows the main fetch to already-selected
 * lines, but isn't limited to that case). Fires once when isActive becomes true; re-firing
 * on a later isActive transition is fine (and desirable — the board may have moved on).
 */
export function useAvailableLines(stop: Stop | null, isActive: boolean) {
    const stopName = stop?.name ?? null;
    const stopLid = stop?.lid ?? null;

    const [lines, setLines] = useState<string[]>([]);

    useEffect(() => {
        if (!isActive || !stopName || !stopLid) return;

        const controller = new AbortController();

        fetch("/api/departures", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // wideWindow: this probe exists purely to discover lines, so it asks for a much
            // larger board than the display fetch — an infrequent line might have no
            // departure within the display board's much smaller cap.
            body: JSON.stringify({ name: stopName, lid: stopLid, wideWindow: true }),
            signal: controller.signal,
        })
            .then((response) => response.json())
            .then((data) => {
                const departures: unknown[] = Array.isArray(data.departures) ? data.departures : [];
                const lineValues = departures
                    .map((departure) => (departure as { line?: unknown })?.line)
                    .filter((line): line is string => typeof line === "string");
                setLines(Array.from(new Set(lineValues)));
            })
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === "AbortError") return;
                // A failed probe just means the picker doesn't gain new lines this time — not fatal.
            });

        return () => controller.abort();
    }, [isActive, stopName, stopLid]);

    return lines;
}
