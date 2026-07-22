export interface SavedStop {
    key: string;
    name: string;
    lid: string;
    addedAt: string;
}

export interface Preferences {
    refreshIntervalSeconds: number;
}

export const DEFAULT_REFRESH_INTERVAL_SECONDS = 60;
export const REFRESH_INTERVAL_OPTIONS = [15, 30, 60, 120, 300] as const;
