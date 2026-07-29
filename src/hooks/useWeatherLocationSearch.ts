"use client";

import { useEffect, useState } from "react";
import type { WeatherLocation } from "@/lib/weather/parseLocations";

const DEBOUNCE_MS = 300;

export type WeatherLocationSearchStatus = "loading" | "success" | "error";

interface FetchState {
    locations: WeatherLocation[];
    status: WeatherLocationSearchStatus;
}

export function useWeatherLocationSearch(query: string) {
    const trimmed = query.trim();
    const [fetchState, setFetchState] = useState<FetchState>({ locations: [], status: "loading" });

    useEffect(() => {
        // Unlike the GitLab/Jira project search, an empty query can't "list everything" —
        // the geocoding API requires a search term — so skip the network round trip entirely.
        if (!trimmed) return;

        const controller = new AbortController();
        const timeout = setTimeout(() => {
            setFetchState((prev) => ({ ...prev, status: "loading" }));

            fetch("/api/weather/locations/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: trimmed }),
                signal: controller.signal,
            })
                .then((res) => res.json())
                .then((data) => setFetchState({ locations: Array.isArray(data.locations) ? data.locations : [], status: "success" }))
                .catch((error: unknown) => {
                    if (error instanceof DOMException && error.name === "AbortError") return;
                    setFetchState({ locations: [], status: "error" });
                });
        }, DEBOUNCE_MS);

        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [trimmed]);

    if (!trimmed) {
        return { locations: [] as WeatherLocation[], status: "success" as const };
    }

    return fetchState;
}
