import { describe, expect, it } from "vitest";
import { getRainTiming, RAIN_THRESHOLD_MM } from "./rainTiming";

const NOW = new Date("2026-08-20T12:00:00Z");
const minutesFromNow = (minutes: number) => NOW.getTime() + minutes * 60 * 1000;

describe("getRainTiming", () => {
    it("returns unknown for an empty series", () => {
        expect(getRainTiming([], NOW)).toEqual({ status: "unknown", startsInMinutes: null });
    });

    it("returns unknown when every entry is in the past", () => {
        const minutely = [
            { timestampMs: minutesFromNow(-60), rainMm: 0 },
            { timestampMs: minutesFromNow(-30), rainMm: 2 },
        ];
        expect(getRainTiming(minutely, NOW)).toEqual({ status: "unknown", startsInMinutes: null });
    });

    it("reports raining now when the current bucket is at or above the threshold", () => {
        const minutely = [{ timestampMs: minutesFromNow(-5), rainMm: RAIN_THRESHOLD_MM }];
        expect(getRainTiming(minutely, NOW)).toEqual({ status: "raining", startsInMinutes: 0 });
    });

    it("reports the time until the next rain bucket", () => {
        const minutely = [
            { timestampMs: minutesFromNow(-5), rainMm: 0 },
            { timestampMs: minutesFromNow(25), rainMm: 0.5 },
        ];
        expect(getRainTiming(minutely, NOW)).toEqual({ status: "expected", startsInMinutes: 25 });
    });

    it("returns none when nothing within the lookahead window meets the threshold", () => {
        const minutely = [
            { timestampMs: minutesFromNow(-5), rainMm: 0 },
            { timestampMs: minutesFromNow(30), rainMm: 0.02 },
            { timestampMs: minutesFromNow(90), rainMm: 0 },
        ];
        expect(getRainTiming(minutely, NOW)).toEqual({ status: "none", startsInMinutes: null });
    });

    it("ignores rain beyond the lookahead window", () => {
        const minutely = [
            { timestampMs: minutesFromNow(-5), rainMm: 0 },
            { timestampMs: minutesFromNow(180), rainMm: 5 },
        ];
        expect(getRainTiming(minutely, NOW)).toEqual({ status: "none", startsInMinutes: null });
    });

    it("treats an exact threshold match as rain", () => {
        const minutely = [{ timestampMs: minutesFromNow(10), rainMm: RAIN_THRESHOLD_MM }];
        expect(getRainTiming(minutely, NOW)).toEqual({ status: "expected", startsInMinutes: 10 });
    });
});
