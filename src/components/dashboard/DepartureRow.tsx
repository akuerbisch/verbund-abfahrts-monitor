import { Badge } from "@/components/base/badges/badges";
import { formatDepartureTime } from "@/lib/time";
import type { ParsedDeparture } from "@/lib/vao/parseDepartures";
import { cx } from "@/utils/cx";

interface DepartureRowProps {
    departure: ParsedDeparture;
    /** Omit the line badge when rendering inside a group already labeled by line. */
    hideLine?: boolean;
    /** Omit the direction text when rendering inside a group already labeled by direction. */
    hideDirection?: boolean;
    /** This is the soonest departure in its list/group — shown bigger, and eligible for the threshold highlight. */
    isNext?: boolean;
    /** 0/undefined = off. Highlights the time when isNext and due within this many minutes. */
    highlightThresholdMinutes?: number;
}

export function DepartureRow({ departure, hideLine, hideDirection, isNext, highlightThresholdMinutes }: DepartureRowProps) {
    const isUrgent = isNext && !!highlightThresholdMinutes && departure.minutesUntil < highlightThresholdMinutes;

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
            <span
                className={cx(
                    "ml-auto shrink-0 tabular-nums",
                    isNext ? "text-lg font-bold" : "text-sm font-semibold",
                    isUrgent ? "text-warning-primary" : "text-primary",
                )}
            >
                {formatDepartureTime(departure.minutesUntil, departure.scheduledLabel, departure.realLabel)}
            </span>
        </li>
    );
}
