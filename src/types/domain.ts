export type CardType = "departures";

export interface DepartureCardConfig {
    id: string;
    type: "departures";
    stopName: string | null;
    stopLid: string | null;
    refreshIntervalSeconds: number;
    groupByLine: boolean;
    maxDeparturesPerLine: number;
    createdAt: string;
}

export const DEFAULT_REFRESH_INTERVAL_SECONDS = 60;
export const REFRESH_INTERVAL_OPTIONS = [15, 30, 60, 120, 300] as const;

export const DEFAULT_MAX_DEPARTURES_PER_LINE = 3;
export const MAX_DEPARTURES_PER_LINE_OPTIONS = [1, 2, 3, 5, 10] as const;
