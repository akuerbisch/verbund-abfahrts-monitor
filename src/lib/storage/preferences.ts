import { safeGetItem, safeSetItem } from "@/lib/storage/safeStorage";
import { PREFERENCES_KEY } from "@/lib/storage/storageKeys";
import { DEFAULT_REFRESH_INTERVAL_SECONDS, REFRESH_INTERVAL_OPTIONS } from "@/types/domain";

export function loadRefreshIntervalSeconds(): number {
    const raw = safeGetItem(PREFERENCES_KEY);
    if (!raw) return DEFAULT_REFRESH_INTERVAL_SECONDS;

    try {
        const parsed = JSON.parse(raw);
        const seconds = parsed?.refreshIntervalSeconds;
        return typeof seconds === "number" && REFRESH_INTERVAL_OPTIONS.includes(seconds as (typeof REFRESH_INTERVAL_OPTIONS)[number])
            ? seconds
            : DEFAULT_REFRESH_INTERVAL_SECONDS;
    } catch {
        return DEFAULT_REFRESH_INTERVAL_SECONDS;
    }
}

export function saveRefreshIntervalSeconds(seconds: number): void {
    safeSetItem(PREFERENCES_KEY, JSON.stringify({ refreshIntervalSeconds: seconds }));
}
