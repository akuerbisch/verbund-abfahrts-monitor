import type { ParsedDeparture } from "@/lib/vao/parseDepartures";

/**
 * Filters departures to only the given lines. An empty filter means "no
 * filter" — every departure passes through unchanged.
 */
export function filterDeparturesByLine(departures: ParsedDeparture[], lineFilter: string[]): ParsedDeparture[] {
    if (lineFilter.length === 0) return departures;
    return departures.filter((departure) => lineFilter.includes(departure.line));
}
