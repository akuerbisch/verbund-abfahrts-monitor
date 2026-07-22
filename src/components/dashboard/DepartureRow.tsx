import { Badge } from "@/components/base/badges/badges";
import { formatDepartureTime } from "@/lib/time";
import type { ParsedDeparture } from "@/lib/vao/parseDepartures";

interface DepartureRowProps {
    departure: ParsedDeparture;
    /** Omit the line badge when rendering inside a group already labeled by line. */
    hideLine?: boolean;
    /** Omit the direction text when rendering inside a group already labeled by direction. */
    hideDirection?: boolean;
}

export function DepartureRow({ departure, hideLine, hideDirection }: DepartureRowProps) {
    return (
        <li className="flex items-center gap-3 py-3">
            {!hideLine && (
                <Badge color="brand" size="md">
                    {departure.line}
                </Badge>
            )}
            {!hideDirection && <span className="min-w-0 flex-1 truncate text-sm text-secondary">{departure.direction}</span>}
            {departure.delayed && (
                <Badge color="warning" size="sm">
                    Delayed
                </Badge>
            )}
            <span className="ml-auto shrink-0 text-sm font-semibold text-primary tabular-nums">
                {formatDepartureTime(departure.minutesUntil, departure.scheduledLabel, departure.realLabel)}
            </span>
        </li>
    );
}
