"use client";

import { MarkerPin01 } from "@untitledui/icons";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import type { StopSearchStatus } from "@/hooks/useStopSearch";
import type { StopSearchResult } from "@/lib/vao/parseStops";

interface StopSearchResultsProps {
    query: string;
    results: StopSearchResult[];
    status: StopSearchStatus;
    onSelect: (result: StopSearchResult) => void;
    savedLids: Set<string>;
}

export function StopSearchResults({ query, results, status, onSelect, savedLids }: StopSearchResultsProps) {
    if (query.trim().length < 2) return null;

    return (
        <div className="absolute top-full z-10 mt-1.5 w-full rounded-lg bg-primary shadow-lg ring-1 ring-secondary_alt">
            {status === "loading" && (
                <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-tertiary">
                    <LoadingIndicator size="sm" />
                    Searching…
                </div>
            )}

            {status === "error" && <div className="px-4 py-6 text-sm text-error-primary">Couldn&apos;t search for stops. Please try again.</div>}

            {status === "success" && results.length === 0 && <div className="px-4 py-6 text-sm text-tertiary">No stops found for &quot;{query}&quot;.</div>}

            {status === "success" && results.length > 0 && (
                <ul className="max-h-72 overflow-y-auto py-1">
                    {results.map((result) => {
                        const alreadySaved = savedLids.has(result.lid);
                        return (
                            <li key={result.lid}>
                                <button
                                    type="button"
                                    disabled={alreadySaved}
                                    onClick={() => onSelect(result)}
                                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-secondary hover:bg-primary_hover disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <MarkerPin01 className="size-4 shrink-0 text-fg-quaternary" />
                                    <span className="truncate">{result.name}</span>
                                    {alreadySaved && <span className="ml-auto shrink-0 text-xs text-quaternary">Added</span>}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
