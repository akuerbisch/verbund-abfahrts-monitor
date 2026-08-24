import { describe, expect, it } from "vitest";
import { getMrAgeInDays, getMrAgeTier, MR_AGE_TIERS } from "./mrAge";

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

describe("getMrAgeTier", () => {
    it("returns the Fresh tier for a brand-new MR", () => {
        expect(getMrAgeTier(0).label).toBe("Fresh");
    });

    it("returns the Fresh tier just under the Ripening threshold", () => {
        expect(getMrAgeTier(2.9).label).toBe("Fresh");
    });

    it("returns the Ripening tier at its threshold", () => {
        expect(getMrAgeTier(3).label).toBe("Ripening");
    });

    it("returns the Vintage tier at its threshold", () => {
        expect(getMrAgeTier(7).label).toBe("Vintage");
    });

    it("returns the Ancient tier at its threshold", () => {
        expect(getMrAgeTier(14).label).toBe("Ancient");
    });

    it("returns the Fossil tier at its threshold and beyond", () => {
        expect(getMrAgeTier(30).label).toBe("Fossil");
        expect(getMrAgeTier(365).label).toBe("Fossil");
    });

    it("has exactly 5 tiers, sorted ascending by threshold", () => {
        expect(MR_AGE_TIERS).toHaveLength(5);
        expect(MR_AGE_TIERS.map((tier) => tier.minDays)).toEqual([...MR_AGE_TIERS.map((tier) => tier.minDays)].sort((a, b) => a - b));
    });
});
