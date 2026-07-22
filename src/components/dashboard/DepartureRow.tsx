import { Badge } from "@/components/base/badges/badges";
import type { ParsedDeparture } from "@/lib/vao/parseDepartures";

function formatMinutesUntil(minutesUntil: number): string {
    if (minutesUntil <= 0) return "Due";
    if (minutesUntil === 1) return "1 min";
    return `${minutesUntil} min`;
}

export function DepartureRow({ departure }: { departure: ParsedDeparture }) {
    return (
        <li className="flex items-center gap-3 py-3">
            <Badge color="brand" size="md">
                {departure.line}
            </Badge>
            <span className="min-w-0 flex-1 truncate text-sm text-secondary">{departure.direction}</span>
            {departure.delayed && (
                <Badge color="warning" size="sm">
                    Delayed
                </Badge>
            )}
            <span className="shrink-0 text-sm font-semibold text-primary tabular-nums">{formatMinutesUntil(departure.minutesUntil)}</span>
        </li>
    );
}
