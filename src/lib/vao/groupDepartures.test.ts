import { describe, expect, it } from "vitest";
import { groupDeparturesByLine } from "./groupDepartures";
import type { ParsedDeparture } from "./parseDepartures";

function departure(overrides: Partial<ParsedDeparture>): ParsedDeparture {
    return { line: "34", direction: "Thondorf", minutesUntil: 10, delayed: false, scheduledLabel: "20:10", ...overrides };
}

describe("groupDeparturesByLine", () => {
    it("groups departures by line", () => {
        const result = groupDeparturesByLine([
            departure({ line: "34", minutesUntil: 5 }),
            departure({ line: "58E", minutesUntil: 8 }),
            departure({ line: "34", minutesUntil: 20 }),
        ]);

        expect(result.map((g) => g.line)).toEqual(["34", "58E"]);
        expect(result[0].departures).toHaveLength(2);
        expect(result[1].departures).toHaveLength(1);
    });

    it("splits the same line into separate groups per direction", () => {
        const result = groupDeparturesByLine([
            departure({ line: "34", direction: "Thondorf", minutesUntil: 5 }),
            departure({ line: "34", direction: "Andritz", minutesUntil: 8 }),
        ]);

        expect(result).toHaveLength(2);
        expect(result.map((g) => g.direction).sort()).toEqual(["Andritz", "Thondorf"]);
        expect(result.every((g) => g.line === "34")).toBe(true);
    });

    it("sorts departures within a group by minutesUntil", () => {
        const result = groupDeparturesByLine([departure({ line: "34", minutesUntil: 25 }), departure({ line: "34", minutesUntil: 5 })]);

        expect(result[0].departures.map((d) => d.minutesUntil)).toEqual([5, 25]);
    });

    it("orders groups by their earliest departure", () => {
        const result = groupDeparturesByLine([departure({ line: "34", minutesUntil: 30 }), departure({ line: "58E", minutesUntil: 2 })]);

        expect(result.map((g) => g.line)).toEqual(["58E", "34"]);
    });

    it("caps each group to the soonest maxPerGroup departures", () => {
        const result = groupDeparturesByLine(
            [
                departure({ line: "34", minutesUntil: 5 }),
                departure({ line: "34", minutesUntil: 15 }),
                departure({ line: "34", minutesUntil: 25 }),
                departure({ line: "34", minutesUntil: 35 }),
            ],
            2,
        );

        expect(result[0].departures.map((d) => d.minutesUntil)).toEqual([5, 15]);
    });

    it("does not cap when no maxPerGroup is given", () => {
        const result = groupDeparturesByLine([departure({ line: "34", minutesUntil: 5 }), departure({ line: "34", minutesUntil: 15 }), departure({ line: "34", minutesUntil: 25 })]);

        expect(result[0].departures).toHaveLength(3);
    });

    it("returns an empty array for no departures", () => {
        expect(groupDeparturesByLine([])).toEqual([]);
    });
});
