"use client";

import { useRef, useState } from "react";
import { SearchMd } from "@untitledui/icons";
import { StopSearchResults } from "@/components/stop-search/StopSearchResults";
import { useStopSearch } from "@/hooks/useStopSearch";
import { Input } from "@/components/base/input/input";
import type { StopSearchResult } from "@/lib/vao/parseStops";

interface StopSearchBoxProps {
    onSelectStop: (result: StopSearchResult) => void;
}

export function StopSearchBox({ onSelectStop }: StopSearchBoxProps) {
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { results, status } = useStopSearch(query);

    const handleSelect = (result: StopSearchResult) => {
        onSelectStop(result);
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
                aria-label="Search for a bus or tram stop"
                icon={SearchMd}
                placeholder="Search for a stop, e.g. Graz Jakominiplatz"
                value={query}
                onChange={setQuery}
                onFocus={() => setIsFocused(true)}
            />

            {isFocused && <StopSearchResults query={query} results={results} status={status} onSelect={handleSelect} />}
        </div>
    );
}
