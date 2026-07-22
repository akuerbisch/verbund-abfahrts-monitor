import { addSavedStop, loadSavedStops, removeSavedStop } from "@/lib/storage/savedStops";
import type { SavedStop } from "@/types/domain";

const EMPTY_STOPS: SavedStop[] = [];
const listeners = new Set<() => void>();
let cache: SavedStop[] | null = null;

function notify() {
    listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function getSnapshot(): SavedStop[] {
    if (cache === null) cache = loadSavedStops();
    return cache;
}

export function getServerSnapshot(): SavedStop[] {
    return EMPTY_STOPS;
}

export function addStop(input: { name: string; lid: string }) {
    cache = addSavedStop(input);
    notify();
}

export function removeStop(key: string) {
    cache = removeSavedStop(key);
    notify();
}
