"use client";

import { Checkbox } from "@/components/base/checkbox/checkbox";

interface LineFilterControlProps {
    availableLines: string[];
    selectedLines: string[];
    onChange: (lines: string[]) => void;
}

export function LineFilterControl({ availableLines, selectedLines, onChange }: LineFilterControlProps) {
    if (availableLines.length === 0) {
        return <p className="text-sm text-tertiary">No lines to filter yet — check back once departures load.</p>;
    }

    const toggleLine = (line: string, isSelected: boolean) => {
        onChange(isSelected ? [...selectedLines, line] : selectedLines.filter((selected) => selected !== line));
    };

    return (
        <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-secondary">Filter lines</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
                {availableLines.map((line) => (
                    <Checkbox key={line} label={line} isSelected={selectedLines.includes(line)} onChange={(isSelected) => toggleLine(line, isSelected)} />
                ))}
            </div>
        </div>
    );
}
