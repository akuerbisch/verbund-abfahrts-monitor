"use client";

import { NativeSelect } from "@/components/base/select/select-native";
import { HIGHLIGHT_THRESHOLD_MINUTES_OPTIONS } from "@/types/domain";

interface HighlightThresholdControlProps {
    highlightThresholdMinutes: number;
    onChange: (minutes: number) => void;
}

export function HighlightThresholdControl({ highlightThresholdMinutes, onChange }: HighlightThresholdControlProps) {
    return (
        <NativeSelect
            label="Highlight next departure under"
            size="sm"
            className="w-max"
            value={String(highlightThresholdMinutes)}
            onChange={(event) => onChange(Number(event.target.value))}
            options={HIGHLIGHT_THRESHOLD_MINUTES_OPTIONS.map((minutes) => ({ value: String(minutes), label: minutes === 0 ? "Off" : `${minutes} min` }))}
        />
    );
}
