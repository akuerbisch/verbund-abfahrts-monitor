import { describe, expect, it } from "vitest";
import { describeWeatherCode } from "./weatherCode";

describe("describeWeatherCode", () => {
    it("maps known WMO codes to a label and icon", () => {
        expect(describeWeatherCode(0).label).toBe("Clear sky");
        expect(describeWeatherCode(61).label).toBe("Light rain");
        expect(describeWeatherCode(95).label).toBe("Thunderstorm");
    });

    it("falls back to an Unknown label for an unrecognized code", () => {
        expect(describeWeatherCode(-1).label).toBe("Unknown");
        expect(describeWeatherCode(12345).label).toBe("Unknown");
    });

    it("always returns an icon component", () => {
        expect(describeWeatherCode(0).icon).toBeTypeOf("function");
        expect(describeWeatherCode(-1).icon).toBeTypeOf("function");
    });
});
