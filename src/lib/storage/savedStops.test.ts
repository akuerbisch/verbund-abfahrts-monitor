import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { addSavedStop, loadSavedStops, removeSavedStop } from "./savedStops";
import { SAVED_STOPS_KEY } from "./storageKeys";

class MemoryStorage {
    private store = new Map<string, string>();
    getItem(key: string) {
        return this.store.get(key) ?? null;
    }
    setItem(key: string, value: string) {
        this.store.set(key, value);
    }
}

beforeEach(() => {
    (globalThis as unknown as { window: unknown }).window = { localStorage: new MemoryStorage() };
});

afterEach(() => {
    delete (globalThis as unknown as { window?: unknown }).window;
});

describe("savedStops", () => {
    it("returns an empty list when nothing is saved", () => {
        expect(loadSavedStops()).toEqual([]);
    });

    it("adds a stop and persists it", () => {
        const result = addSavedStop({ name: "Graz Schönaupark", lid: "lid-1" });
        expect(result).toHaveLength(1);
        expect(loadSavedStops()[0]).toMatchObject({ name: "Graz Schönaupark", lid: "lid-1" });
    });

    it("dedupes by lid", () => {
        addSavedStop({ name: "Graz Schönaupark", lid: "lid-1" });
        const result = addSavedStop({ name: "Graz Schönaupark (again)", lid: "lid-1" });
        expect(result).toHaveLength(1);
    });

    it("removes a stop by key", () => {
        const [stop] = addSavedStop({ name: "Graz Schönaupark", lid: "lid-1" });
        const result = removeSavedStop(stop.key);
        expect(result).toEqual([]);
        expect(loadSavedStops()).toEqual([]);
    });

    it("returns an empty list for corrupted storage data", () => {
        (globalThis as unknown as { window: { localStorage: MemoryStorage } }).window.localStorage.setItem(SAVED_STOPS_KEY, "not json");
        expect(loadSavedStops()).toEqual([]);
    });
});
