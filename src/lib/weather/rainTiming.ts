import type { MinutelyPrecipitation } from "@/lib/weather/parseForecast";

export type RainTimingStatus = "raining" | "expected" | "none" | "unknown";

export interface RainTiming {
    status: RainTimingStatus;
    startsInMinutes: number | null;
}

// Roughly 0.4mm/h — enough to count as real rain rather than a stray drop, per 15-min bucket.
export const RAIN_THRESHOLD_MM = 0.1;

// How far ahead to look for incoming rain before giving up and reporting "none".
export const RAIN_LOOKAHEAD_MS = 2 * 60 * 60 * 1000;

/**
 * Derives a glanceable rain status from Open-Meteo's 15-minute precipitation
 * series. "unknown" (rather than "none") when there's no usable forward-looking
 * data — e.g. an empty series, or every entry already in the past (a stale
 * forecast shouldn't be read as a promise of no rain).
 */
export function getRainTiming(minutely: MinutelyPrecipitation[], now: Date = new Date()): RainTiming {
    const nowMs = now.getTime();
    const horizon = minutely.filter((entry) => entry.timestampMs - nowMs <= RAIN_LOOKAHEAD_MS);

    const upcoming = horizon.filter((entry) => entry.timestampMs > nowMs - 15 * 60 * 1000);
    if (upcoming.length === 0) return { status: "unknown", startsInMinutes: null };

    const rainingNow = upcoming.find((entry) => entry.timestampMs <= nowMs && entry.rainMm >= RAIN_THRESHOLD_MM);
    if (rainingNow) return { status: "raining", startsInMinutes: 0 };

    const nextRain = upcoming.find((entry) => entry.timestampMs > nowMs && entry.rainMm >= RAIN_THRESHOLD_MM);
    if (nextRain) return { status: "expected", startsInMinutes: Math.round((nextRain.timestampMs - nowMs) / 60000) };

    return { status: "none", startsInMinutes: null };
}
