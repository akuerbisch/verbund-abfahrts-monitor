"use client";

import { useRef, useState } from "react";
import { SearchMd } from "@untitledui/icons";
import { Input } from "@/components/base/input/input";
import { WeatherLocationSearchResults } from "@/components/weather/WeatherLocationSearchResults";
import { useWeatherLocationSearch } from "@/hooks/useWeatherLocationSearch";
import type { WeatherLocation } from "@/lib/weather/parseLocations";

interface WeatherLocationSearchBoxProps {
    onSelectLocation: (location: WeatherLocation) => void;
}

export function WeatherLocationSearchBox({ onSelectLocation }: WeatherLocationSearchBoxProps) {
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { locations, status } = useWeatherLocationSearch(query);

    const handleSelect = (location: WeatherLocation) => {
        onSelectLocation(location);
        setQuery("");
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full max-w-md"
            onBlur={(event) => {
                if (!containerRef.current?.contains(event.relatedTarget)) setIsFocused(false);
            }}
        >
            <Input
                aria-label="Search for a place"
                icon={SearchMd}
                placeholder="Search for a city or place…"
                value={query}
                onChange={setQuery}
                onFocus={() => setIsFocused(true)}
            />

            {isFocused && <WeatherLocationSearchResults query={query} locations={locations} status={status} onSelect={handleSelect} />}
        </div>
    );
}
