import type { ParsedDeparture } from "@/lib/vao/parseDepartures";

export interface DirectionGroup {
    direction: string;
    departures: ParsedDeparture[];
}

export interface DepartureLineGroup {
    line: string;
    directionGroups: DirectionGroup[];
}

/**
 * Groups departures by line, then by direction within that line (a line can
 * run in more than one direction from the same stop — these render as
 * columns side by side rather than separate line sections). Each direction
 * is capped to its soonest `maxPerGroup` departures; lines are ordered by
 * their single earliest departure across all directions.
 */
export function groupDeparturesByLine(departures: ParsedDeparture[], maxPerGroup = Infinity): DepartureLineGroup[] {
    const lineGroups = new Map<string, Map<string, ParsedDeparture[]>>();

    for (const departure of departures) {
        let directions = lineGroups.get(departure.line);
        if (!directions) {
            directions = new Map();
            lineGroups.set(departure.line, directions);
        }

        const existing = directions.get(departure.direction);
        if (existing) {
            existing.push(departure);
        } else {
            directions.set(departure.direction, [departure]);
        }
    }

    return Array.from(lineGroups.entries())
        .map(([line, directions]) => {
            const directionGroups = Array.from(directions.entries())
                .map(([direction, directionDepartures]) => ({
                    direction,
                    departures: [...directionDepartures].sort((a, b) => a.minutesUntil - b.minutesUntil).slice(0, maxPerGroup),
                }))
                .sort((a, b) => a.departures[0].minutesUntil - b.departures[0].minutesUntil);

            return { line, directionGroups };
        })
        .sort((a, b) => {
            const earliestA = Math.min(...a.directionGroups.map((group) => group.departures[0].minutesUntil));
            const earliestB = Math.min(...b.directionGroups.map((group) => group.departures[0].minutesUntil));
            return earliestA - earliestB;
        });
}
