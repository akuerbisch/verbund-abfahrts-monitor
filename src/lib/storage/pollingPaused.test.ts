import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadPollingPaused, savePollingPaused } from "./pollingPaused";
import { POLLING_PAUSED_KEY } from "./storageKeys";

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

describe("pollingPaused", () => {
    it("defaults to not paused when nothing is saved", () => {
        expect(loadPollingPaused()).toBe(false);
    });

    it("persists paused state across loads", () => {
        savePollingPaused(true);
        expect(loadPollingPaused()).toBe(true);
    });

    it("persists resuming after having been paused", () => {
        savePollingPaused(true);
        savePollingPaused(false);
        expect(loadPollingPaused()).toBe(false);
    });

    it("treats anything other than the literal string \"true\" as not paused", () => {
        (globalThis as unknown as { window: { localStorage: MemoryStorage } }).window.localStorage.setItem(POLLING_PAUSED_KEY, "not a boolean");
        expect(loadPollingPaused()).toBe(false);
    });
});
