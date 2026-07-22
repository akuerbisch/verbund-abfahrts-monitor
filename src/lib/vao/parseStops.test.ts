import { describe, expect, it } from "vitest";
import { parseLocMatchResponse } from "./parseStops";

const SCHOENAUPARK_LID = "A=1@O=Graz Schönaupark@X=15445392@Y=47050592@U=81@L=460326900@i=A×at:46:3269@";

function locMatchResponse(locL: unknown[]) {
    return {
        svcResL: [{ id: "1|7|", err: "OK", res: { match: { locL } } }],
    };
}

describe("parseLocMatchResponse", () => {
    it("parses stop matches with the lid field", () => {
        const result = parseLocMatchResponse(locMatchResponse([{ type: "S", name: "Graz Schönaupark", lid: SCHOENAUPARK_LID }]));

        expect(result).toEqual([{ id: SCHOENAUPARK_LID, name: "Graz Schönaupark", lid: SCHOENAUPARK_LID }]);
    });

    it("preserves the U+00D7 multiplication sign in the lid untouched", () => {
        const result = parseLocMatchResponse(locMatchResponse([{ type: "S", name: "Graz Schönaupark", lid: SCHOENAUPARK_LID }]));

        expect(result[0].lid).toContain("×at:46:3269");
    });

    it("filters out non-stop results (addresses/POIs)", () => {
        const result = parseLocMatchResponse(
            locMatchResponse([
                { type: "A", name: "Some Address 1", lid: "address-lid" },
                { type: "S", name: "Graz Jakominiplatz", lid: "jkp-lid" },
            ]),
        );

        expect(result).toEqual([{ id: "jkp-lid", name: "Graz Jakominiplatz", lid: "jkp-lid" }]);
    });

    it("dedupes matches by lid", () => {
        const result = parseLocMatchResponse(
            locMatchResponse([
                { type: "S", name: "Graz Jakominiplatz", lid: "jkp-lid" },
                { type: "S", name: "Graz Jakominiplatz", lid: "jkp-lid" },
            ]),
        );

        expect(result).toHaveLength(1);
    });

    it("skips malformed entries without crashing the whole search", () => {
        const result = parseLocMatchResponse(
            locMatchResponse([{ type: "S", name: "Missing lid" }, { type: "S", lid: "no-name-lid" }, { type: "S", name: "Graz Jakominiplatz", lid: "jkp-lid" }]),
        );

        expect(result).toEqual([{ id: "jkp-lid", name: "Graz Jakominiplatz", lid: "jkp-lid" }]);
    });

    it("returns an empty array for a malformed top-level response", () => {
        expect(parseLocMatchResponse(null)).toEqual([]);
        expect(parseLocMatchResponse({})).toEqual([]);
        expect(parseLocMatchResponse({ svcResL: [] })).toEqual([]);
    });
});
