"use client";

import { MarkerPin01 } from "@untitledui/icons";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import type { WeatherLocationSearchStatus } from "@/hooks/useWeatherLocationSearch";
import type { WeatherLocation } from "@/lib/weather/parseLocations";

interface WeatherLocationSearchResultsProps {
    query: string;
    locations: WeatherLocation[];
    status: WeatherLocationSearchStatus;
    onSelect: (location: WeatherLocation) => void;
}

export function WeatherLocationSearchResults({ query, locations, status, onSelect }: WeatherLocationSearchResultsProps) {
    return (
        <div className="absolute top-full z-10 mt-1.5 w-full rounded-lg bg-primary shadow-lg ring-1 ring-secondary_alt">
            {status === "loading" && (
                <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-tertiary">
                    <LoadingIndicator size="sm" />
                    Searching…
                </div>
            )}

            {status === "error" && <div className="px-4 py-6 text-sm text-error-primary">Couldn&apos;t search for places. Please try again.</div>}

            {status === "success" && locations.length === 0 && (
                <div className="px-4 py-6 text-sm text-tertiary">{query.trim() ? "No places found." : "Type to search for a city or place."}</div>
            )}

            {status === "success" && locations.length > 0 && (
                <ul className="max-h-72 overflow-y-auto py-1">
                    {locations.map((location) => (
                        <li key={location.id}>
                            <button
                                type="button"
                                onClick={() => onSelect(location)}
                                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-secondary hover:bg-primary_hover"
                            >
                                <MarkerPin01 className="size-4 shrink-0 text-fg-quaternary" />
                                <span className="truncate">{location.displayName}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
