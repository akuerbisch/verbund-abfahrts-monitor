export type CardType = "departures";

export interface DepartureCardConfig {
    id: string;
    type: "departures";
    stopName: string | null;
    stopLid: string | null;
    refreshIntervalSeconds: number;
    groupByLine: boolean;
    createdAt: string;
}

export const DEFAULT_REFRESH_INTERVAL_SECONDS = 60;
export const REFRESH_INTERVAL_OPTIONS = [15, 30, 60, 120, 300] as const;
