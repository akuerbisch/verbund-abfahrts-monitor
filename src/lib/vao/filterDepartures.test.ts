import { describe, expect, it } from "vitest";
import { filterDeparturesByLine } from "./filterDepartures";
import type { ParsedDeparture } from "./parseDepartures";

function departure(overrides: Partial<ParsedDeparture>): ParsedDeparture {
    return { line: "34", direction: "Thondorf", minutesUntil: 10, delayed: false, scheduledLabel: "20:10", ...overrides };
}

describe("filterDeparturesByLine", () => {
    it("returns departures unchanged when the filter is empty", () => {
        const departures = [departure({ line: "34" }), departure({ line: "58E" })];
        expect(filterDeparturesByLine(departures, [])).toEqual(departures);
    });

    it("keeps only departures whose line is in the filter", () => {
        const departures = [departure({ line: "34" }), departure({ line: "58E" }), departure({ line: "N1" })];
        const result = filterDeparturesByLine(departures, ["34", "N1"]);
        expect(result.map((d) => d.line)).toEqual(["34", "N1"]);
    });

    it("returns an empty array when no departure matches the filter", () => {
        const departures = [departure({ line: "34" })];
        expect(filterDeparturesByLine(departures, ["58E"])).toEqual([]);
    });
});
