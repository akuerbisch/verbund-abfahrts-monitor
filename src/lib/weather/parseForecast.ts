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

export interface ParsedWeatherForecast {
    current: CurrentWeather;
    daily: DailyForecast[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

/**
 * Parses Open-Meteo's `GET /v1/forecast` response (requested with `current=`
 * and `daily=` params). Returns null if the current-conditions block is
 * malformed — a forecast without current conditions isn't useful to show.
 * Daily entries are parsed defensively; a malformed day is skipped rather
 * than failing the whole forecast.
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

    return { current: { temperature, apparentTemperature, humidity, windSpeed, weatherCode }, daily };
}
