import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createDepartureCard, loadCards, removeCard, updateCard } from "./cards";
import { CARDS_KEY } from "./storageKeys";
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

describe("cards", () => {
    it("returns an empty list when nothing is saved", () => {
        expect(loadCards()).toEqual([]);
    });

    it("creates an unconfigured departures card with defaults", () => {
        const result = createDepartureCard();
        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            type: "departures",
            stopName: null,
            stopLid: null,
            refreshIntervalSeconds: DEFAULT_REFRESH_INTERVAL_SECONDS,
            groupByLine: false,
        });
    });

    it("allows multiple cards, including for the same stop", () => {
        createDepartureCard();
        createDepartureCard();
        expect(loadCards()).toHaveLength(2);
    });

    it("updates a card by id via patch", () => {
        const [card] = createDepartureCard();
        const result = updateCard(card.id, { stopName: "Graz Schönaupark", stopLid: "lid-1", groupByLine: true });

        expect(result[0]).toMatchObject({ stopName: "Graz Schönaupark", stopLid: "lid-1", groupByLine: true });
        expect(loadCards()[0]).toMatchObject({ stopName: "Graz Schönaupark", stopLid: "lid-1" });
    });

    it("leaves other cards untouched when updating one", () => {
        const [first] = createDepartureCard();
        createDepartureCard();
        updateCard(first.id, { refreshIntervalSeconds: 120 });

        const cards = loadCards();
        expect(cards.find((c) => c.id === first.id)?.refreshIntervalSeconds).toBe(120);
        expect(cards.find((c) => c.id !== first.id)?.refreshIntervalSeconds).toBe(DEFAULT_REFRESH_INTERVAL_SECONDS);
    });

    it("removes a card by id", () => {
        const [card] = createDepartureCard();
        const result = removeCard(card.id);
        expect(result).toEqual([]);
        expect(loadCards()).toEqual([]);
    });

    it("returns an empty list for corrupted storage data", () => {
        (globalThis as unknown as { window: { localStorage: MemoryStorage } }).window.localStorage.setItem(CARDS_KEY, "not json");
        expect(loadCards()).toEqual([]);
    });
});
