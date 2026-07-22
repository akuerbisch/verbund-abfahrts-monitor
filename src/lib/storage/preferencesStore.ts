import { loadRefreshIntervalSeconds, saveRefreshIntervalSeconds } from "@/lib/storage/preferences";
import { DEFAULT_REFRESH_INTERVAL_SECONDS } from "@/types/domain";

const listeners = new Set<() => void>();
let cache: number | null = null;

function notify() {
    listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function getSnapshot(): number {
    if (cache === null) cache = loadRefreshIntervalSeconds();
    return cache;
}

export function getServerSnapshot(): number {
    return DEFAULT_REFRESH_INTERVAL_SECONDS;
}

export function setRefreshIntervalSeconds(seconds: number) {
    saveRefreshIntervalSeconds(seconds);
    cache = seconds;
    notify();
}
