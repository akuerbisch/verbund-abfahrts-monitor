"use client";

import { NativeSelect } from "@/components/base/select/select-native";
import { MAX_DEPARTURES_PER_LINE_OPTIONS } from "@/types/domain";

interface MaxDeparturesPerLineControlProps {
    maxDeparturesPerLine: number;
    onChange: (count: number) => void;
}

export function MaxDeparturesPerLineControl({ maxDeparturesPerLine, onChange }: MaxDeparturesPerLineControlProps) {
    return (
        <NativeSelect
            label="Departures per line"
            size="sm"
            className="w-max"
            value={String(maxDeparturesPerLine)}
            onChange={(event) => onChange(Number(event.target.value))}
            options={MAX_DEPARTURES_PER_LINE_OPTIONS.map((count) => ({ value: String(count), label: String(count) }))}
        />
    );
}
