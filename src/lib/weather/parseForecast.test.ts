import { describe, expect, it } from "vitest";
import { parseWeatherForecast } from "./parseForecast";

function forecastRaw(overrides: Record<string, unknown> = {}) {
    return {
        current: { temperature_2m: 21.5, apparent_temperature: 20.1, relative_humidity_2m: 55, wind_speed_10m: 12.3, weather_code: 2 },
        daily: {
            time: ["2026-08-01", "2026-08-02"],
            weather_code: [2, 61],
            temperature_2m_max: [24, 19],
            temperature_2m_min: [14, 12],
        },
        ...overrides,
    };
}

describe("parseWeatherForecast", () => {
    it("parses a normal forecast", () => {
        const result = parseWeatherForecast(forecastRaw());

        expect(result).toEqual({
            current: { temperature: 21.5, apparentTemperature: 20.1, humidity: 55, windSpeed: 12.3, weatherCode: 2 },
            daily: [
                { date: "2026-08-01", weatherCode: 2, tempMax: 24, tempMin: 14 },
                { date: "2026-08-02", weatherCode: 61, tempMax: 19, tempMin: 12 },
            ],
        });
    });

    it("returns null when current conditions are missing", () => {
        expect(parseWeatherForecast(forecastRaw({ current: undefined }))).toBeNull();
    });

    it("returns null when a current-conditions field is the wrong type", () => {
        expect(parseWeatherForecast(forecastRaw({ current: { temperature_2m: "warm" } }))).toBeNull();
    });

    it("defaults daily to an empty list when missing", () => {
        expect(parseWeatherForecast(forecastRaw({ daily: undefined }))?.daily).toEqual([]);
    });

    it("skips malformed daily entries without failing the whole forecast", () => {
        const result = parseWeatherForecast(
            forecastRaw({
                daily: {
                    time: ["2026-08-01", "2026-08-02"],
                    weather_code: [2, "not-a-number"],
                    temperature_2m_max: [24, 19],
                    temperature_2m_min: [14, 12],
                },
            }),
        );

        expect(result?.daily).toEqual([{ date: "2026-08-01", weatherCode: 2, tempMax: 24, tempMin: 14 }]);
    });

    it("returns null for a malformed top-level response", () => {
        expect(parseWeatherForecast(null)).toBeNull();
        expect(parseWeatherForecast(undefined)).toBeNull();
    });
});
