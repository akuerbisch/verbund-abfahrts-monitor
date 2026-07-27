import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createDepartureCard, createGitlabCard, createJiraCard, loadCards, removeCard, reorderCards, updateCard } from "./cards";
import { CARDS_KEY } from "./storageKeys";
import {
    DEFAULT_HIDE_DRAFTS,
    DEFAULT_JIRA_VERSION_SORT_ORDER,
    DEFAULT_MAX_DEPARTURES_PER_LINE,
    DEFAULT_MR_SORT_ORDER,
    DEFAULT_REFRESH_INTERVAL_SECONDS,
    type DepartureCardConfig,
} from "@/types/domain";

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
            maxDeparturesPerLine: DEFAULT_MAX_DEPARTURES_PER_LINE,
            lineFilter: [],
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

        const cards = loadCards() as DepartureCardConfig[];
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

    it("updates the line filter via patch", () => {
        const [card] = createDepartureCard();
        const result = updateCard(card.id, { lineFilter: ["34", "58E"] }) as DepartureCardConfig[];
        expect(result[0].lineFilter).toEqual(["34", "58E"]);
    });

    it("rejects a stored card whose lineFilter isn't a string array", () => {
        (globalThis as unknown as { window: { localStorage: MemoryStorage } }).window.localStorage.setItem(
            CARDS_KEY,
            JSON.stringify([
                {
                    id: "1",
                    type: "departures",
                    stopName: null,
                    stopLid: null,
                    refreshIntervalSeconds: DEFAULT_REFRESH_INTERVAL_SECONDS,
                    groupByLine: false,
                    maxDeparturesPerLine: DEFAULT_MAX_DEPARTURES_PER_LINE,
                    lineFilter: "34",
                    createdAt: new Date().toISOString(),
                },
            ]),
        );
        expect(loadCards()).toEqual([]);
    });

    it("creates an unconfigured gitlab card with defaults", () => {
        const result = createGitlabCard();
        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            type: "gitlab-merge-requests",
            projectId: null,
            projectName: null,
            hideDrafts: DEFAULT_HIDE_DRAFTS,
            sortOrder: DEFAULT_MR_SORT_ORDER,
        });
    });

    it("allows all three card types to coexist", () => {
        createDepartureCard();
        createGitlabCard();
        createJiraCard();
        const cards = loadCards();
        expect(cards.map((c) => c.type).sort()).toEqual(["departures", "gitlab-merge-requests", "jira-release-versions"]);
    });

    it("updates a gitlab card by id via patch", () => {
        const [card] = createGitlabCard();
        const result = updateCard(card.id, { projectId: 42, projectName: "shopreme/backend", hideDrafts: false });
        expect(result[0]).toMatchObject({ projectId: 42, projectName: "shopreme/backend", hideDrafts: false });
    });

    it("updates a gitlab card's sort order via patch", () => {
        const [card] = createGitlabCard();
        const result = updateCard(card.id, { sortOrder: "newest" });
        expect(result[0]).toMatchObject({ sortOrder: "newest" });
    });

    it("creates an unconfigured jira card with defaults", () => {
        const result = createJiraCard();
        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            type: "jira-release-versions",
            projectId: null,
            projectKey: null,
            projectName: null,
            sortOrder: DEFAULT_JIRA_VERSION_SORT_ORDER,
        });
    });

    it("updates a jira card by id via patch", () => {
        const [card] = createJiraCard();
        const result = updateCard(card.id, { projectId: "10000", projectKey: "ABC", projectName: "Alphabet Corp" });
        expect(result[0]).toMatchObject({ projectId: "10000", projectKey: "ABC", projectName: "Alphabet Corp" });
    });

    it("updates a jira card's sort order via patch", () => {
        const [card] = createJiraCard();
        const result = updateCard(card.id, { sortOrder: "progress" });
        expect(result[0]).toMatchObject({ sortOrder: "progress" });
    });

    it("rejects a stored jira card missing required fields", () => {
        (globalThis as unknown as { window: { localStorage: MemoryStorage } }).window.localStorage.setItem(
            CARDS_KEY,
            JSON.stringify([{ id: "1", type: "jira-release-versions", projectId: null, projectName: null, createdAt: new Date().toISOString() }]),
        );
        expect(loadCards()).toEqual([]);
    });

    it("reorders cards to match the given id order", () => {
        const [first] = createDepartureCard();
        createDepartureCard();
        createGitlabCard();
        const [, second, third] = loadCards();

        const result = reorderCards([third.id, first.id, second.id]);

        expect(result.map((c) => c.id)).toEqual([third.id, first.id, second.id]);
        expect(loadCards().map((c) => c.id)).toEqual([third.id, first.id, second.id]);
    });

    it("reorders cards including a jira card in the mix", () => {
        const [first] = createDepartureCard();
        createJiraCard();
        const [, second] = loadCards();

        const result = reorderCards([second.id, first.id]);

        expect(result.map((c) => c.id)).toEqual([second.id, first.id]);
    });

    it("appends cards missing from the given order at the end, keeping their relative order", () => {
        const [first] = createDepartureCard();
        createGitlabCard();
        const [, second] = loadCards();

        const result = reorderCards([first.id]);

        expect(result.map((c) => c.id)).toEqual([first.id, second.id]);
    });

    it("ignores unknown ids in the given order", () => {
        const [first] = createDepartureCard();

        const result = reorderCards(["does-not-exist", first.id]);

        expect(result.map((c) => c.id)).toEqual([first.id]);
    });

    it("rejects a stored gitlab card missing required fields", () => {
        (globalThis as unknown as { window: { localStorage: MemoryStorage } }).window.localStorage.setItem(
            CARDS_KEY,
            JSON.stringify([{ id: "1", type: "gitlab-merge-requests", projectId: null, projectName: null, createdAt: new Date().toISOString() }]),
        );
        expect(loadCards()).toEqual([]);
    });
});
