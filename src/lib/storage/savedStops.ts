import { safeGetItem, safeSetItem } from "@/lib/storage/safeStorage";
import { SAVED_STOPS_KEY } from "@/lib/storage/storageKeys";
import type { SavedStop } from "@/types/domain";

function isSavedStop(value: unknown): value is SavedStop {
    return (
        typeof value === "object" &&
        value !== null &&
        typeof (value as SavedStop).key === "string" &&
        typeof (value as SavedStop).name === "string" &&
        typeof (value as SavedStop).lid === "string" &&
        typeof (value as SavedStop).addedAt === "string"
    );
}

export function loadSavedStops(): SavedStop[] {
    const raw = safeGetItem(SAVED_STOPS_KEY);
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter(isSavedStop) : [];
    } catch {
        return [];
    }
}

function persist(stops: SavedStop[]): SavedStop[] {
    safeSetItem(SAVED_STOPS_KEY, JSON.stringify(stops));
    return stops;
}

export function addSavedStop(input: { name: string; lid: string }): SavedStop[] {
    const existing = loadSavedStops();
    if (existing.some((stop) => stop.lid === input.lid)) {
        return existing;
    }

    const newStop: SavedStop = {
        key: crypto.randomUUID(),
        name: input.name,
        lid: input.lid,
        addedAt: new Date().toISOString(),
    };

    return persist([...existing, newStop]);
}

export function removeSavedStop(key: string): SavedStop[] {
    return persist(loadSavedStops().filter((stop) => stop.key !== key));
}
