"use client";

import { NativeSelect } from "@/components/base/select/select-native";
import { MR_SORT_ORDER_OPTIONS, type MergeRequestSortOrder } from "@/types/domain";

interface MrSortOrderControlProps {
    sortOrder: MergeRequestSortOrder;
    onChange: (sortOrder: MergeRequestSortOrder) => void;
}

export function MrSortOrderControl({ sortOrder, onChange }: MrSortOrderControlProps) {
    return (
        <NativeSelect
            label="Sort by"
            size="sm"
            className="w-max"
            value={sortOrder}
            onChange={(event) => onChange(event.target.value as MergeRequestSortOrder)}
            options={MR_SORT_ORDER_OPTIONS}
        />
    );
}
