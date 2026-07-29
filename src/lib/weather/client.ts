const GEOCODING_BASE_URL = "https://geocoding-api.open-meteo.com/v1";
const FORECAST_BASE_URL = "https://api.open-meteo.com/v1";

export class WeatherUpstreamError extends Error {
    constructor(
        message: string,
        public readonly status?: number,
    ) {
        super(message);
        this.name = "WeatherUpstreamError";
    }
}

export class WeatherTimeoutError extends Error {
    constructor(message = "Weather upstream request timed out") {
        super(message);
        this.name = "WeatherTimeoutError";
    }
}

/**
 * Calls the Open-Meteo APIs server-side. Unlike every other card's provider,
 * Open-Meteo needs no API key/token at all — nothing to configure, nothing
 * that can leak.
 */
async function callWeatherApi(baseUrl: string, path: string, searchParams: Record<string, string>, timeoutMs = 8000): Promise<unknown> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const url = new URL(`${baseUrl}${path}`);
        for (const [key, value] of Object.entries(searchParams)) {
            url.searchParams.set(key, value);
        }

        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
            throw new WeatherUpstreamError(`Weather API responded with HTTP ${response.status}`, response.status);
        }

        return await response.json();
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            throw new WeatherTimeoutError();
        }
        if (error instanceof WeatherUpstreamError) {
            throw error;
        }
        throw new WeatherUpstreamError(error instanceof Error ? error.message : "Unknown weather upstream error");
    } finally {
        clearTimeout(timeout);
    }
}

export function callWeatherGeocodingApi(searchParams: Record<string, string>, timeoutMs?: number): Promise<unknown> {
    return callWeatherApi(GEOCODING_BASE_URL, "/search", searchParams, timeoutMs);
}

export function callWeatherForecastApi(searchParams: Record<string, string>, timeoutMs?: number): Promise<unknown> {
    return callWeatherApi(FORECAST_BASE_URL, "/forecast", searchParams, timeoutMs);
}
