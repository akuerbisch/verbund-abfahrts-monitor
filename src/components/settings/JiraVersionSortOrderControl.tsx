"use client";

import { NativeSelect } from "@/components/base/select/select-native";
import { JIRA_VERSION_SORT_ORDER_OPTIONS, type JiraVersionSortOrder } from "@/types/domain";

interface JiraVersionSortOrderControlProps {
    sortOrder: JiraVersionSortOrder;
    onChange: (sortOrder: JiraVersionSortOrder) => void;
}

export function JiraVersionSortOrderControl({ sortOrder, onChange }: JiraVersionSortOrderControlProps) {
    return (
        <NativeSelect
            label="Sort by"
            size="sm"
            className="w-max"
            value={sortOrder}
            onChange={(event) => onChange(event.target.value as JiraVersionSortOrder)}
            options={JIRA_VERSION_SORT_ORDER_OPTIONS}
        />
    );
}
