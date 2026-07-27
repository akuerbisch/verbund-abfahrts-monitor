export type CardType = "departures" | "gitlab-merge-requests";

export interface DepartureCardConfig {
    id: string;
    type: "departures";
    stopName: string | null;
    stopLid: string | null;
    refreshIntervalSeconds: number;
    groupByLine: boolean;
    maxDeparturesPerLine: number;
    /** Empty = no filter (show all lines). */
    lineFilter: string[];
    createdAt: string;
}

export type MergeRequestSortOrder = "oldest" | "newest";

export interface GitlabMergeRequestsCardConfig {
    id: string;
    type: "gitlab-merge-requests";
    projectId: number | null;
    projectName: string | null;
    hideDrafts: boolean;
    sortOrder: MergeRequestSortOrder;
    createdAt: string;
}

export type CardConfig = DepartureCardConfig | GitlabMergeRequestsCardConfig;

export const DEFAULT_REFRESH_INTERVAL_SECONDS = 60;
export const REFRESH_INTERVAL_OPTIONS = [15, 30, 60, 120, 300] as const;

export const DEFAULT_MAX_DEPARTURES_PER_LINE = 3;
export const MAX_DEPARTURES_PER_LINE_OPTIONS = [1, 2, 3, 5, 10] as const;

export const DEFAULT_HIDE_DRAFTS = true;

export const DEFAULT_MR_SORT_ORDER: MergeRequestSortOrder = "oldest";
export const MR_SORT_ORDER_OPTIONS: { value: MergeRequestSortOrder; label: string }[] = [
    { value: "oldest", label: "Oldest first" },
    { value: "newest", label: "Newest first" },
];
