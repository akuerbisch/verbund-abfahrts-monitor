import { describe, expect, it } from "vitest";
import { computeMinutesUntil, formatDepartureTime, formatHHMMSSToLabel, parseTimeRaw } from "./time";

// 2026-07-22T18:00:00Z is 2026-07-22 20:00:00 in Vienna (CEST, UTC+2 in summer).
const NOW = new Date("2026-07-22T18:00:00Z");

describe("parseTimeRaw", () => {
    it("parses a normal same-day time", () => {
        expect(parseTimeRaw("205600")).toEqual({ actualHour: 20, minute: 56, dayOffset: 0 });
    });

    it("normalizes post-midnight overflow (250600 -> 01:06 next day)", () => {
        expect(parseTimeRaw("250600")).toEqual({ actualHour: 1, minute: 6, dayOffset: 1 });
    });

    it("uses only the last 6 digits", () => {
        expect(parseTimeRaw("20260722205600")).toEqual({ actualHour: 20, minute: 56, dayOffset: 0 });
    });
});

describe("computeMinutesUntil", () => {
    it("computes minutes until a same-day future departure", () => {
        // now = 20:00:00, departure = 20:10:00
        expect(computeMinutesUntil(20, 10, 0, NOW)).toBe(10);
    });

    it("computes minutes for a post-midnight (dayOffset=1) departure", () => {
        // now = 22-Jul 20:00:00, departure = 23-Jul 01:06:00 -> 5h06m = 306 min
        expect(computeMinutesUntil(1, 6, 1, NOW)).toBe(306);
    });

    it("keeps a just-departed bus in the past within the -2 minute grace window", () => {
        const now = new Date("2026-07-22T18:00:30Z"); // Vienna 20:00:30
        // departure at 19:59:00 -> 1.5 minutes ago, within the 2-minute grace window
        expect(computeMinutesUntil(19, 59, 0, now)).toBe(-1);
    });

    it("rolls a departure to tomorrow once it's past the grace window", () => {
        const now = new Date("2026-07-22T18:00:00Z"); // Vienna 20:00:00
        // departure at 19:54:00 -> 6 minutes ago, past the 2-minute grace window
        expect(computeMinutesUntil(19, 54, 0, now)).toBe(24 * 60 - 6);
    });
});

describe("formatHHMMSSToLabel", () => {
    it("formats a normal time", () => {
        expect(formatHHMMSSToLabel("205600")).toBe("20:56");
    });

    it("formats a post-midnight overflow time", () => {
        expect(formatHHMMSSToLabel("250600")).toBe("01:06");
    });
});

describe("formatDepartureTime", () => {
    it("shows 'Due' for a departure at or before now", () => {
        expect(formatDepartureTime(0, "20:10")).toBe("Due");
        expect(formatDepartureTime(-1, "20:10")).toBe("Due");
    });

    it("shows singular '1 min'", () => {
        expect(formatDepartureTime(1, "20:10")).toBe("1 min");
    });

    it("shows minutes for anything under an hour", () => {
        expect(formatDepartureTime(45, "20:45")).toBe("45 min");
        expect(formatDepartureTime(59, "20:59")).toBe("59 min");
    });

    it("switches to clock time at 60 minutes and beyond", () => {
        expect(formatDepartureTime(60, "21:00")).toBe("21:00");
        expect(formatDepartureTime(132, "22:12")).toBe("22:12");
    });

    it("prefers the real (delayed) label over the scheduled one when an hour or more away", () => {
        expect(formatDepartureTime(90, "20:30", "20:45")).toBe("20:45");
    });

    it("falls back to the scheduled label when there is no real label", () => {
        expect(formatDepartureTime(90, "20:30")).toBe("20:30");
    });
});
