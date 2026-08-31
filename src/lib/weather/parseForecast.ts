export interface CurrentWeather {
    temperature: number;
    apparentTemperature: number;
    humidity: number;
    windSpeed: number;
    weatherCode: number;
}

export interface DailyForecast {
    date: string;
    weatherCode: number;
    tempMax: number;
    tempMin: number;
}

export interface MinutelyPrecipitation {
    /** Absolute instant (UTC epoch ms) — converted from Open-Meteo's naive local-time string. */
    timestampMs: number;
    rainMm: number;
}

export interface ParsedWeatherForecast {
    current: CurrentWeather;
    daily: DailyForecast[];
    minutely: MinutelyPrecipitation[];
    /** Needed to convert `minutely_15`'s naive local-time strings (from `timezone=auto`) to absolute instants. */
    utcOffsetSeconds: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

/**
 * Parses Open-Meteo's `GET /v1/forecast` response (requested with `current=`,
 * `daily=`, and `minutely_15=` params). Returns null if the current-conditions
 * block is malformed — a forecast without current conditions isn't useful to
 * show. Daily and minutely entries are parsed defensively; a malformed entry
 * is skipped rather than failing the whole forecast.
 */
export function parseWeatherForecast(raw: unknown): ParsedWeatherForecast | null {
    if (!isRecord(raw)) return null;

    const currentRaw = isRecord(raw.current) ? raw.current : null;
    if (!currentRaw) return null;

    const {
        temperature_2m: temperature,
        apparent_temperature: apparentTemperature,
        relative_humidity_2m: humidity,
        wind_speed_10m: windSpeed,
        weather_code: weatherCode,
    } = currentRaw;

    if (
        typeof temperature !== "number" ||
        typeof apparentTemperature !== "number" ||
        typeof humidity !== "number" ||
        typeof windSpeed !== "number" ||
        typeof weatherCode !== "number"
    ) {
        return null;
    }

    const dailyRaw = isRecord(raw.daily) ? raw.daily : {};
    const dates = Array.isArray(dailyRaw.time) ? dailyRaw.time : [];
    const codes = Array.isArray(dailyRaw.weather_code) ? dailyRaw.weather_code : [];
    const maxes = Array.isArray(dailyRaw.temperature_2m_max) ? dailyRaw.temperature_2m_max : [];
    const mins = Array.isArray(dailyRaw.temperature_2m_min) ? dailyRaw.temperature_2m_min : [];

    const daily: DailyForecast[] = [];
    for (let i = 0; i < dates.length; i++) {
        const date = dates[i];
        const dailyCode = codes[i];
        const tempMax = maxes[i];
        const tempMin = mins[i];
        if (typeof date !== "string" || typeof dailyCode !== "number" || typeof tempMax !== "number" || typeof tempMin !== "number") continue;

        daily.push({ date, weatherCode: dailyCode, tempMax, tempMin });
    }

    const utcOffsetSeconds = typeof raw.utc_offset_seconds === "number" ? raw.utc_offset_seconds : 0;

    const minutelyRaw = isRecord(raw.minutely_15) ? raw.minutely_15 : {};
    const minutelyTimes = Array.isArray(minutelyRaw.time) ? minutelyRaw.time : [];
    // `rain` excludes snow water-equivalent, unlike `precipitation` — prefer it when the API provides it.
    const rainValues = Array.isArray(minutelyRaw.rain) ? minutelyRaw.rain : null;
    const precipitationValues = Array.isArray(minutelyRaw.precipitation) ? minutelyRaw.precipitation : null;
    const rainSeries = rainValues && rainValues.length > 0 ? rainValues : (precipitationValues ?? []);

    const minutely: MinutelyPrecipitation[] = [];
    for (let i = 0; i < minutelyTimes.length; i++) {
        const time = minutelyTimes[i];
        const rainMm = rainSeries[i];
        if (typeof time !== "string" || typeof rainMm !== "number") continue;

        // Open-Meteo returns a naive local-time string (no offset suffix) when `timezone=auto` is
        // used — parse it as if it were UTC, then shift back by the location's real UTC offset.
        const naiveMs = Date.parse(`${time}Z`);
        if (Number.isNaN(naiveMs)) continue;

        minutely.push({ timestampMs: naiveMs - utcOffsetSeconds * 1000, rainMm });
    }

    return { current: { temperature, apparentTemperature, humidity, windSpeed, weatherCode }, daily, minutely, utcOffsetSeconds };
}
