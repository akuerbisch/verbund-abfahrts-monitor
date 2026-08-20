import { loadPollingPaused, savePollingPaused } from "@/lib/storage/pollingPaused";

const listeners = new Set<() => void>();
let cache: boolean | null = null;

function notify() {
    listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function getSnapshot(): boolean {
    if (cache === null) cache = loadPollingPaused();
    return cache;
}

export function getServerSnapshot(): boolean {
    return false;
}

export function setPollingPaused(paused: boolean) {
    cache = savePollingPaused(paused);
    notify();
}
