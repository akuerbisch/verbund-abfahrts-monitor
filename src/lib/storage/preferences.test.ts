import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadRefreshIntervalSeconds, saveRefreshIntervalSeconds } from "./preferences";
import { DEFAULT_REFRESH_INTERVAL_SECONDS } from "@/types/domain";

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

describe("preferences", () => {
    it("defaults to DEFAULT_REFRESH_INTERVAL_SECONDS when nothing is saved", () => {
        expect(loadRefreshIntervalSeconds()).toBe(DEFAULT_REFRESH_INTERVAL_SECONDS);
    });

    it("persists and reloads a valid interval", () => {
        saveRefreshIntervalSeconds(120);
        expect(loadRefreshIntervalSeconds()).toBe(120);
    });

    it("falls back to the default for an out-of-range value", () => {
        saveRefreshIntervalSeconds(9999);
        expect(loadRefreshIntervalSeconds()).toBe(DEFAULT_REFRESH_INTERVAL_SECONDS);
    });

    it("falls back to the default for corrupted storage data", () => {
        (globalThis as unknown as { window: { localStorage: MemoryStorage } }).window.localStorage.setItem("verbund-departures:preferences:v1", "not json");
        expect(loadRefreshIntervalSeconds()).toBe(DEFAULT_REFRESH_INTERVAL_SECONDS);
    });
});
