"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ParsedDeparture } from "@/lib/vao/parseDepartures";
import type { SavedStop } from "@/types/domain";

export type StationBoardStatus = "loading" | "success" | "error" | "stale-error";

interface RawBoard {
    departures: ParsedDeparture[];
    fetchedAt: Date;
}

// How often we recompute displayed "minutes until" labels between network
// refetches, without hitting the network.
const RECOMPUTE_TICK_MS = 20_000;

function adjustDepartures(raw: RawBoard, now: number): ParsedDeparture[] {
    const elapsedMinutes = Math.round((now - raw.fetchedAt.getTime()) / 60000);
    return raw.departures.map((departure) => ({ ...departure, minutesUntil: departure.minutesUntil - elapsedMinutes }));
}

export function useStationBoard(stop: SavedStop, refreshIntervalSeconds: number) {
    const [status, setStatus] = useState<StationBoardStatus>("loading");
    const [departures, setDepartures] = useState<ParsedDeparture[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const rawRef = useRef<RawBoard | null>(null);

    const fetchDepartures = useCallback(
        async (signal?: AbortSignal) => {
            try {
                const response = await fetch("/api/departures", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: stop.name, lid: stop.lid }),
                    signal,
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const data = await response.json();
                const fetchedAt = new Date(typeof data.fetchedAt === "string" ? data.fetchedAt : Date.now());
                const raw: RawBoard = { departures: Array.isArray(data.departures) ? data.departures : [], fetchedAt };

                rawRef.current = raw;
                setDepartures(adjustDepartures(raw, Date.now()));
                setLastUpdated(fetchedAt);
                setStatus("success");
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") return;
                setStatus(rawRef.current ? "stale-error" : "error");
            }
        },
        [stop.name, stop.lid],
    );

    useEffect(() => {
        const controller = new AbortController();
        // Deferred to a microtask so the initial fetch isn't a bare call in the effect body.
        void Promise.resolve().then(() => fetchDepartures(controller.signal));

        let interval: ReturnType<typeof setInterval> | null = null;
        const startPolling = () => {
            if (interval) return;
            interval = setInterval(() => fetchDepartures(), refreshIntervalSeconds * 1000);
        };
        const stopPolling = () => {
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                stopPolling();
            } else {
                fetchDepartures();
                startPolling();
            }
        };

        startPolling();
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            controller.abort();
            stopPolling();
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [fetchDepartures, refreshIntervalSeconds]);

    useEffect(() => {
        const id = setInterval(() => {
            if (rawRef.current) setDepartures(adjustDepartures(rawRef.current, Date.now()));
        }, RECOMPUTE_TICK_MS);
        return () => clearInterval(id);
    }, []);

    return { departures, status, lastUpdated };
}
