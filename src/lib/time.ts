const VIENNA_TIME_ZONE = "Europe/Vienna";
const GRACE_WINDOW_MS = 2 * 60 * 1000;

interface WallClockParts {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
}

function getWallClockParts(date: Date, timeZone: string): WallClockParts {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    }).formatToParts(date);

    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);

    return {
        year: get("year"),
        month: get("month"),
        day: get("day"),
        // "24" from hour12:false formatting must wrap to 0
        hour: get("hour") % 24,
        minute: get("minute"),
        second: get("second"),
    };
}

/**
 * Turns wall-clock components into a timestamp in a timezone-neutral frame
 * (treats the Vienna wall-clock numbers as if they were UTC). Only valid for
 * diffing two timestamps produced the same way — never a real UTC instant.
 */
function toNeutralTimestamp(parts: WallClockParts, dayOffset = 0): number {
    return Date.UTC(parts.year, parts.month - 1, parts.day + dayOffset, parts.hour, parts.minute, parts.second);
}

export interface ParsedTimeRaw {
    actualHour: number;
    minute: number;
    dayOffset: number;
}

/**
 * Parses a VAO HHMMSS time string. Hours can exceed 24 for post-midnight
 * trips (e.g. "250600" = 01:06 the next day) — normalize into actualHour +
 * dayOffset. Only the last 6 digits are used; seconds are ignored.
 */
export function parseTimeRaw(raw: string): ParsedTimeRaw {
    const hhmmss = raw.slice(-6).padStart(6, "0");
    const hh = Number(hhmmss.slice(0, 2));
    const minute = Number(hhmmss.slice(2, 4));

    return {
        actualHour: hh % 24,
        minute,
        dayOffset: Math.floor(hh / 24),
    };
}

/**
 * Minutes until a departure, computed relative to "now" in Vienna wall-clock
 * time (the API's `date` field is unreliable near midnight, so we never use
 * it). A -2 minute grace window avoids false "already passed, must be
 * tomorrow" rollovers for buses that just departed.
 */
export function computeMinutesUntil(actualHour: number, minute: number, dayOffset: number, now: Date): number {
    const nowParts = getWallClockParts(now, VIENNA_TIME_ZONE);
    const nowTimestamp = toNeutralTimestamp(nowParts);

    let depTimestamp = toNeutralTimestamp({ ...nowParts, hour: actualHour, minute, second: 0 }, dayOffset);

    if (depTimestamp < nowTimestamp - GRACE_WINDOW_MS) {
        depTimestamp = toNeutralTimestamp({ ...nowParts, hour: actualHour, minute, second: 0 }, dayOffset + 1);
    }

    return Math.round((depTimestamp - nowTimestamp) / 60000);
}

/** Formats a raw HHMMSS string as "HH:MM" (normalized for post-midnight overflow). */
export function formatHHMMSSToLabel(raw: string): string {
    const { actualHour, minute } = parseTimeRaw(raw);
    return `${String(actualHour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/**
 * Formats a departure for display: minutes-until under an hour away (more
 * useful at a glance), clock time ("HH:MM") from an hour away onward (a
 * minute count stops being readable once it's in the hundreds).
 */
export function formatDepartureTime(minutesUntil: number, scheduledLabel: string, realLabel?: string): string {
    if (minutesUntil < 60) {
        if (minutesUntil <= 0) return "Due";
        if (minutesUntil === 1) return "1 min";
        return `${minutesUntil} min`;
    }
    return realLabel ?? scheduledLabel;
}
