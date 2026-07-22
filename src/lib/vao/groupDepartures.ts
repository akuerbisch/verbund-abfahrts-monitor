import type { ParsedDeparture } from "@/lib/vao/parseDepartures";

export interface DepartureLineGroup {
    line: string;
    direction: string;
    departures: ParsedDeparture[];
}

/**
 * Groups departures by (line, direction) — a line can run in more than one
 * direction from the same stop. Each group is capped to its soonest
 * `maxPerGroup` departures, sorted by minutesUntil; groups themselves are
 * ordered by their earliest departure.
 */
export function groupDeparturesByLine(departures: ParsedDeparture[], maxPerGroup = Infinity): DepartureLineGroup[] {
    const groups = new Map<string, DepartureLineGroup>();

    for (const departure of departures) {
        const key = `${departure.line}|${departure.direction}`;
        const existing = groups.get(key);
        if (existing) {
            existing.departures.push(departure);
        } else {
            groups.set(key, { line: departure.line, direction: departure.direction, departures: [departure] });
        }
    }

    return Array.from(groups.values())
        .map((group) => ({
            ...group,
            departures: [...group.departures].sort((a, b) => a.minutesUntil - b.minutesUntil).slice(0, maxPerGroup),
        }))
        .sort((a, b) => a.departures[0].minutesUntil - b.departures[0].minutesUntil);
}
