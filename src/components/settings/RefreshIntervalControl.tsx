"use client";

import { NativeSelect } from "@/components/base/select/select-native";
import { REFRESH_INTERVAL_OPTIONS } from "@/types/domain";

function formatIntervalLabel(seconds: number): string {
    return seconds < 60 ? `${seconds}s` : `${seconds / 60} min`;
}

interface RefreshIntervalControlProps {
    refreshIntervalSeconds: number;
    onChange: (seconds: number) => void;
}

export function RefreshIntervalControl({ refreshIntervalSeconds, onChange }: RefreshIntervalControlProps) {
    return (
        <NativeSelect
            label="Refresh every"
            size="sm"
            className="w-max"
            value={String(refreshIntervalSeconds)}
            onChange={(event) => onChange(Number(event.target.value))}
            options={REFRESH_INTERVAL_OPTIONS.map((seconds) => ({ value: String(seconds), label: formatIntervalLabel(seconds) }))}
        />
    );
}
