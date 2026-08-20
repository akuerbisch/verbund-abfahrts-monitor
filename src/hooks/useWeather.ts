"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePollingPaused } from "@/hooks/usePollingPaused";
import type { ParsedWeatherForecast } from "@/lib/weather/parseForecast";

export type WeatherStatus = "unconfigured" | "loading" | "success" | "error" | "stale-error";

interface Coordinates {
    latitude: number;
    longitude: number;
}

// Forecast data doesn't change minute-to-minute — refetch infrequently.
const POLL_INTERVAL_MS = 15 * 60 * 1000;

export function useWeather(location: Coordinates | null) {
    const latitude = location?.latitude ?? null;
    const longitude = location?.longitude ?? null;

    const [status, setStatus] = useState<WeatherStatus>("loading");
    const [forecast, setForecast] = useState<ParsedWeatherForecast | null>(null);
    const hasDataRef = useRef(false);
    const { isPaused } = usePollingPaused();

    const fetchForecast = useCallback(
        async (signal?: AbortSignal) => {
            if (latitude === null || longitude === null) return;

            try {
                const response = await fetch("/api/weather/forecast", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ latitude, longitude }),
                    signal,
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const data = await response.json();
                hasDataRef.current = true;
                setForecast(data.forecast ?? null);
                setStatus("success");
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") return;
                setStatus(hasDataRef.current ? "stale-error" : "error");
            }
        },
        [latitude, longitude],
    );

    useEffect(() => {
        if (latitude === null || longitude === null || isPaused) return;

        const controller = new AbortController();
        // Deferred to a microtask so the initial fetch isn't a bare call in the effect body.
        void Promise.resolve().then(() => fetchForecast(controller.signal));

        let interval: ReturnType<typeof setInterval> | null = null;
        const startPolling = () => {
            if (interval) return;
            interval = setInterval(() => fetchForecast(), POLL_INTERVAL_MS);
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
                fetchForecast();
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
    }, [fetchForecast, latitude, longitude, isPaused]);

    if (latitude === null || longitude === null) {
        return { forecast: null as ParsedWeatherForecast | null, status: "unconfigured" as const };
    }

    return { forecast, status };
}
