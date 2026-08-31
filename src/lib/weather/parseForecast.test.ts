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
            minutely: [],
            utcOffsetSeconds: 0,
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

    it("defaults minutely and utcOffsetSeconds when minutely_15 is missing", () => {
        const result = parseWeatherForecast(forecastRaw());
        expect(result?.minutely).toEqual([]);
        expect(result?.utcOffsetSeconds).toBe(0);
    });

    it("converts naive local-time minutely entries to absolute timestamps using utc_offset_seconds", () => {
        const result = parseWeatherForecast(
            forecastRaw({
                utc_offset_seconds: 7200, // UTC+2
                minutely_15: { time: ["2026-08-01T10:00", "2026-08-01T10:15"], precipitation: [0, 0.4] },
            }),
        );

        expect(result?.utcOffsetSeconds).toBe(7200);
        expect(result?.minutely).toEqual([
            { timestampMs: Date.parse("2026-08-01T10:00Z") - 7200 * 1000, rainMm: 0 },
            { timestampMs: Date.parse("2026-08-01T10:15Z") - 7200 * 1000, rainMm: 0.4 },
        ]);
    });

    it("prefers the rain series over precipitation when both are present", () => {
        const result = parseWeatherForecast(
            forecastRaw({
                minutely_15: { time: ["2026-08-01T10:00"], precipitation: [1.2], rain: [0.3] },
            }),
        );

        expect(result?.minutely).toEqual([{ timestampMs: Date.parse("2026-08-01T10:00Z"), rainMm: 0.3 }]);
    });

    it("falls back to precipitation when rain is absent", () => {
        const result = parseWeatherForecast(
            forecastRaw({
                minutely_15: { time: ["2026-08-01T10:00"], precipitation: [1.2] },
            }),
        );

        expect(result?.minutely).toEqual([{ timestampMs: Date.parse("2026-08-01T10:00Z"), rainMm: 1.2 }]);
    });

    it("skips malformed minutely entries without failing the whole forecast", () => {
        const result = parseWeatherForecast(
            forecastRaw({
                minutely_15: { time: ["2026-08-01T10:00", "not-a-time"], precipitation: [0.1, "oops"] },
            }),
        );

        expect(result?.minutely).toEqual([{ timestampMs: Date.parse("2026-08-01T10:00Z"), rainMm: 0.1 }]);
    });
});
