import { safeGetItem, safeSetItem } from "@/lib/storage/safeStorage";
import { POLLING_PAUSED_KEY } from "@/lib/storage/storageKeys";

/**
 * Manual pause for all card polling on this dashboard instance — toggled via
 * the pause button in the header, not tied to visibility or a schedule.
 * Persisted so the dashboard stays paused across a reload while someone's
 * deliberately using it, e.g. during a demo.
 */
export function loadPollingPaused(): boolean {
    return safeGetItem(POLLING_PAUSED_KEY) === "true";
}

export function savePollingPaused(paused: boolean): boolean {
    safeSetItem(POLLING_PAUSED_KEY, String(paused));
    return paused;
}
