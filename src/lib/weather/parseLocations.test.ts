import { describe, expect, it } from "vitest";
import { parseWeatherLocationsResponse } from "./parseLocations";

describe("parseWeatherLocationsResponse", () => {
    it("parses a normal locations list, joining name/admin1/country into a display name", () => {
        const result = parseWeatherLocationsResponse({
            results: [{ id: 1, name: "Graz", latitude: 47.07, longitude: 15.44, country: "Austria", admin1: "Styria" }],
        });

        expect(result).toEqual([{ id: 1, name: "Graz", displayName: "Graz, Styria, Austria", latitude: 47.07, longitude: 15.44 }]);
    });

    it("omits missing admin1/country from the display name", () => {
        const result = parseWeatherLocationsResponse({ results: [{ id: 1, name: "Graz", latitude: 47.07, longitude: 15.44 }] });

        expect(result[0].displayName).toBe("Graz");
    });

    it("skips malformed entries without failing the whole search", () => {
        const result = parseWeatherLocationsResponse({
            results: [
                { id: 1, name: "Graz", latitude: 47.07, longitude: 15.44 },
                { id: "not-a-number", name: "Broken", latitude: 1, longitude: 1 },
                { name: "Missing id", latitude: 1, longitude: 1 },
                null,
            ],
        });

        expect(result).toEqual([{ id: 1, name: "Graz", displayName: "Graz", latitude: 47.07, longitude: 15.44 }]);
    });

    it("returns an empty array when results is missing or not an array", () => {
        expect(parseWeatherLocationsResponse({})).toEqual([]);
        expect(parseWeatherLocationsResponse({ results: "not-an-array" })).toEqual([]);
    });

    it("returns an empty array for a malformed top-level response", () => {
        expect(parseWeatherLocationsResponse(null)).toEqual([]);
        expect(parseWeatherLocationsResponse(undefined)).toEqual([]);
    });
});
