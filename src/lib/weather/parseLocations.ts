export interface WeatherLocation {
    id: number;
    name: string;
    displayName: string;
    latitude: number;
    longitude: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

/**
 * Parses Open-Meteo's `GET /v1/search` (geocoding) response into location
 * search results. Defensive per-entry parsing — a malformed location is
 * skipped rather than failing the whole search.
 */
export function parseWeatherLocationsResponse(raw: unknown): WeatherLocation[] {
    const results = isRecord(raw) ? raw.results : undefined;
    if (!Array.isArray(results)) return [];

    const locations: WeatherLocation[] = [];
    for (const item of results) {
        if (!isRecord(item)) continue;

        const { id, name, latitude, longitude, country, admin1 } = item;
        if (typeof id !== "number" || typeof name !== "string" || typeof latitude !== "number" || typeof longitude !== "number") continue;

        const displayParts = [name, typeof admin1 === "string" ? admin1 : null, typeof country === "string" ? country : null].filter(
            (part): part is string => Boolean(part),
        );

        locations.push({ id, name, displayName: displayParts.join(", "), latitude, longitude });
    }

    return locations;
}
