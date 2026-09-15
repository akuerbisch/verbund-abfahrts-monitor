"use client";

import { useRef, useState } from "react";
import { SearchMd } from "@untitledui/icons";
import { BadgeWithButton } from "@/components/base/badges/badges";
import { Input } from "@/components/base/input/input";

interface LineFilterControlProps {
    availableLines: string[];
    selectedLines: string[];
    onChange: (lines: string[]) => void;
}

export function LineFilterControl({ availableLines, selectedLines, onChange }: LineFilterControlProps) {
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const trimmedQuery = query.trim();
    const candidates = availableLines
        .filter((line) => !selectedLines.includes(line))
        .filter((line) => line.toLowerCase().includes(trimmedQuery.toLowerCase()));
    // A typed line that hasn't (yet) shown up in discovered departures can still be added
    // directly — the upstream filter just won't match anything if it turns out not to exist.
    const canAddCustomValue = trimmedQuery.length > 0 && !candidates.includes(trimmedQuery) && !selectedLines.includes(trimmedQuery);

    const addLine = (line: string) => {
        if (!line || selectedLines.includes(line)) return;
        onChange([...selectedLines, line]);
        setQuery("");
    };

    const removeLine = (line: string) => {
        onChange(selectedLines.filter((selected) => selected !== line));
    };

    return (
        <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-secondary">Filter lines</p>

            {selectedLines.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {selectedLines.map((line) => (
                        <BadgeWithButton key={line} color="brand" size="sm" buttonLabel={`Remove ${line}`} onButtonClick={() => removeLine(line)}>
                            {line}
                        </BadgeWithButton>
                    ))}
                </div>
            )}

            <div
                ref={containerRef}
                className="relative w-full max-w-xs"
                onBlur={(event) => {
                    if (!containerRef.current?.contains(event.relatedTarget)) setIsFocused(false);
                }}
            >
                <Input
                    aria-label="Search or add a line"
                    icon={SearchMd}
                    placeholder="Search or type a line…"
                    size="sm"
                    value={query}
                    onChange={setQuery}
                    onFocus={() => setIsFocused(true)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            addLine(trimmedQuery);
                        } else if (event.key === "Escape") {
                            setIsFocused(false);
                        }
                    }}
                />

                {isFocused && (
                    <div className="absolute top-full z-10 mt-1.5 w-full rounded-lg bg-primary shadow-lg ring-1 ring-secondary_alt">
                        <ul className="max-h-56 overflow-y-auto py-1">
                            {candidates.map((line) => (
                                <li key={line}>
                                    <button
                                        type="button"
                                        onClick={() => addLine(line)}
                                        className="flex w-full items-center px-4 py-2 text-left text-sm text-secondary hover:bg-primary_hover"
                                    >
                                        {line}
                                    </button>
                                </li>
                            ))}
                            {canAddCustomValue && (
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => addLine(trimmedQuery)}
                                        className="flex w-full items-center gap-1 px-4 py-2 text-left text-sm text-secondary hover:bg-primary_hover"
                                    >
                                        Add <span className="font-medium text-primary">“{trimmedQuery}”</span>
                                    </button>
                                </li>
                            )}
                        </ul>

                        {candidates.length === 0 && !canAddCustomValue && (
                            <p className="px-4 py-2.5 text-sm text-tertiary">
                                {trimmedQuery ? "No matching lines." : "No lines discovered yet — type a line number to add it."}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
