import { describe, expect, it } from "vitest";
import { parseJiraProjectsResponse } from "./parseProjects";

describe("parseJiraProjectsResponse", () => {
    it("parses a normal projects list", () => {
        const result = parseJiraProjectsResponse({ values: [{ id: "10000", key: "ABC", name: "Alphabet Corp" }] });

        expect(result).toEqual([{ id: "10000", key: "ABC", name: "Alphabet Corp" }]);
    });

    it("skips malformed entries without failing the whole search", () => {
        const result = parseJiraProjectsResponse({
            values: [
                { id: "10000", key: "ABC", name: "Alphabet Corp" },
                { id: 10001, key: "BAD", name: "Bad Numeric Id" },
                { key: "MISSING", name: "Missing Id" },
                null,
            ],
        });

        expect(result).toEqual([{ id: "10000", key: "ABC", name: "Alphabet Corp" }]);
    });

    it("returns an empty array when values is missing or not an array", () => {
        expect(parseJiraProjectsResponse({})).toEqual([]);
        expect(parseJiraProjectsResponse({ values: "not-an-array" })).toEqual([]);
    });

    it("returns an empty array for a malformed top-level response", () => {
        expect(parseJiraProjectsResponse(null)).toEqual([]);
        expect(parseJiraProjectsResponse(undefined)).toEqual([]);
    });
});
