export type CardType = "departures" | "gitlab-merge-requests" | "jira-release-versions" | "weather";

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

export type JiraVersionSortOrder = "dueDate" | "progress" | "name";

export interface JiraVersionsCardConfig {
    id: string;
    type: "jira-release-versions";
    projectId: string | null;
    projectKey: string | null;
    projectName: string | null;
    sortOrder: JiraVersionSortOrder;
    createdAt: string;
}

export interface WeatherCardConfig {
    id: string;
    type: "weather";
    locationId: number | null;
    locationName: string | null;
    latitude: number | null;
    longitude: number | null;
    createdAt: string;
}

export type CardConfig = DepartureCardConfig | GitlabMergeRequestsCardConfig | JiraVersionsCardConfig | WeatherCardConfig;

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

export const DEFAULT_JIRA_VERSION_SORT_ORDER: JiraVersionSortOrder = "dueDate";
export const JIRA_VERSION_SORT_ORDER_OPTIONS: { value: JiraVersionSortOrder; label: string }[] = [
    { value: "dueDate", label: "Due date (soonest first)" },
    { value: "progress", label: "Progress (least complete first)" },
    { value: "name", label: "Name (A–Z)" },
];
