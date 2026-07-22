import { describe, expect, it } from "vitest";
import { parseStationBoardResponse } from "./parseDepartures";

// 2026-07-22T18:00:00Z is 2026-07-22 20:00:00 in Vienna (CEST, UTC+2 in summer).
const NOW = new Date("2026-07-22T18:00:00Z");

function stationBoardResponse(jnyL: unknown[], prodL: unknown[] = [{ nameS: "34" }]) {
    return {
        svcResL: [
            {
                id: "1|7|",
                err: "OK",
                res: {
                    common: { prodL },
                    jnyL,
                },
            },
        ],
    };
}

describe("parseStationBoardResponse", () => {
    it("parses a normal on-time departure", () => {
        const result = parseStationBoardResponse(
            stationBoardResponse([{ prodX: 0, dirTxt: "Thondorf", date: "20260722", stbStop: { dTimeS: "203000" } }]),
            NOW,
        );

        expect(result).toEqual([
            {
                line: "34",
                direction: "Thondorf",
                minutesUntil: 30,
                delayed: false,
                scheduledLabel: "20:30",
                realLabel: undefined,
            },
        ]);
    });

    it("prefers dTimeR over dTimeS and flags delayed when they differ", () => {
        const result = parseStationBoardResponse(
            stationBoardResponse([
                { prodX: 0, dirTxt: "Thondorf", date: "20260722", stbStop: { dTimeS: "203000", dTimeR: "203500", dProgType: "PROGNOSED" } },
            ]),
            NOW,
        );

        expect(result[0].delayed).toBe(true);
        expect(result[0].minutesUntil).toBe(35);
        expect(result[0].realLabel).toBe("20:35");
    });

    it("is not delayed when dTimeR equals dTimeS", () => {
        const result = parseStationBoardResponse(
            stationBoardResponse([{ prodX: 0, dirTxt: "Thondorf", stbStop: { dTimeS: "203000", dTimeR: "203000", dProgType: "PROGNOSED" } }]),
            NOW,
        );

        expect(result[0].delayed).toBe(false);
    });

    it("handles post-midnight overflow times", () => {
        const result = parseStationBoardResponse(stationBoardResponse([{ prodX: 0, dirTxt: "Thondorf", stbStop: { dTimeS: "250600" } }]), NOW);

        expect(result[0].scheduledLabel).toBe("01:06");
        expect(result[0].minutesUntil).toBe(5 * 60 + 6);
    });

    it("resolves the line via prodL[prodX].nameS", () => {
        const result = parseStationBoardResponse(
            stationBoardResponse([{ prodX: 1, dirTxt: "Jakominiplatz", stbStop: { dTimeS: "203000" } }], [{ nameS: "34" }, { nameS: "58E" }]),
            NOW,
        );

        expect(result[0].line).toBe("58E");
    });

    it("sorts departures by minutesUntil", () => {
        const result = parseStationBoardResponse(
            stationBoardResponse([
                { prodX: 0, dirTxt: "A", stbStop: { dTimeS: "204500" } },
                { prodX: 0, dirTxt: "B", stbStop: { dTimeS: "200500" } },
            ]),
            NOW,
        );

        expect(result.map((d) => d.direction)).toEqual(["B", "A"]);
    });

    it("skips a malformed journey without crashing the whole board", () => {
        const result = parseStationBoardResponse(
            stationBoardResponse([{ prodX: 0, dirTxt: "Thondorf" /* missing stbStop */ }, { prodX: 0, dirTxt: "B", stbStop: { dTimeS: "203000" } }]),
            NOW,
        );

        expect(result).toHaveLength(1);
        expect(result[0].direction).toBe("B");
    });

    it("returns an empty array for a malformed top-level response", () => {
        expect(parseStationBoardResponse(null)).toEqual([]);
        expect(parseStationBoardResponse({})).toEqual([]);
        expect(parseStationBoardResponse({ svcResL: [] })).toEqual([]);
    });
});
