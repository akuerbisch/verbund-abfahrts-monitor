import type { ParsedDeparture } from "@/lib/vao/parseDepartures";

export interface DepartureLineGroup {
    line: string;
    departures: ParsedDeparture[];
}

/**
 * Groups departures by line, sorted by minutesUntil within each group, with
 * groups themselves ordered by their earliest departure.
 */
export function groupDeparturesByLine(departures: ParsedDeparture[]): DepartureLineGroup[] {
    const groups = new Map<string, ParsedDeparture[]>();

    for (const departure of departures) {
        const existing = groups.get(departure.line);
        if (existing) {
            existing.push(departure);
        } else {
            groups.set(departure.line, [departure]);
        }
    }

    return Array.from(groups.entries())
        .map(([line, lineDepartures]) => ({ line, departures: [...lineDepartures].sort((a, b) => a.minutesUntil - b.minutesUntil) }))
        .sort((a, b) => a.departures[0].minutesUntil - b.departures[0].minutesUntil);
}
