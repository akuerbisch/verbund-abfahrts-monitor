import { describe, expect, it } from "vitest";
import { getMrAgeInDays, getMrAgeIntensity, MR_AGE_INTENSITY_MAX_DAYS } from "./mrAge";

describe("getMrAgeInDays", () => {
    const now = new Date("2026-08-20T12:00:00Z");

    it("returns 0 for an MR created right now", () => {
        expect(getMrAgeInDays("2026-08-20T12:00:00Z", now)).toBe(0);
    });

    it("returns the number of days elapsed", () => {
        expect(getMrAgeInDays("2026-08-18T12:00:00Z", now)).toBe(2);
    });

    it("clamps to 0 for a createdAt in the future", () => {
        expect(getMrAgeInDays("2026-08-25T12:00:00Z", now)).toBe(0);
    });
});

describe("getMrAgeIntensity", () => {
    it("is 0 for a brand-new MR", () => {
        expect(getMrAgeIntensity(0)).toBe(0);
    });

    it("scales linearly up to the max-age threshold", () => {
        expect(getMrAgeIntensity(MR_AGE_INTENSITY_MAX_DAYS / 2)).toBeCloseTo(0.5);
    });

    it("reaches 1 at the max-age threshold", () => {
        expect(getMrAgeIntensity(MR_AGE_INTENSITY_MAX_DAYS)).toBe(1);
    });

    it("clamps to 1 beyond the max-age threshold", () => {
        expect(getMrAgeIntensity(MR_AGE_INTENSITY_MAX_DAYS * 10)).toBe(1);
    });

    it("clamps negative ages to 0", () => {
        expect(getMrAgeIntensity(-5)).toBe(0);
    });
});
