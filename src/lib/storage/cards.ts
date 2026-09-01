import { safeGetItem, safeSetItem } from "@/lib/storage/safeStorage";
import { CARDS_KEY } from "@/lib/storage/storageKeys";
import {
    DEFAULT_HIDE_DRAFTS,
    DEFAULT_HIGHLIGHT_THRESHOLD_MINUTES,
    DEFAULT_JIRA_VERSION_SORT_ORDER,
    DEFAULT_MAX_DEPARTURES_PER_LINE,
    DEFAULT_MR_SORT_ORDER,
    DEFAULT_REFRESH_INTERVAL_SECONDS,
    type CardConfig,
    type DepartureCardConfig,
    type GitlabMergeRequestsCardConfig,
    type JiraVersionsCardConfig,
    type WeatherCardConfig,
} from "@/types/domain";

function isDepartureCardConfig(value: unknown): value is DepartureCardConfig {
    if (typeof value !== "object" || value === null) return false;
    const card = value as DepartureCardConfig;
    return (
        typeof card.id === "string" &&
        card.type === "departures" &&
        (card.stopName === null || typeof card.stopName === "string") &&
        (card.stopLid === null || typeof card.stopLid === "string") &&
        typeof card.refreshIntervalSeconds === "number" &&
        typeof card.groupByLine === "boolean" &&
        typeof card.maxDeparturesPerLine === "number" &&
        Array.isArray(card.lineFilter) &&
        card.lineFilter.every((line) => typeof line === "string") &&
        // Optional: older stored cards predate this field — loadCards() backfills a default for them.
        (card.highlightThresholdMinutes === undefined || typeof card.highlightThresholdMinutes === "number") &&
        typeof card.createdAt === "string"
    );
}

function isGitlabCardConfig(value: unknown): value is GitlabMergeRequestsCardConfig {
    if (typeof value !== "object" || value === null) return false;
    const card = value as GitlabMergeRequestsCardConfig;
    return (
        typeof card.id === "string" &&
        card.type === "gitlab-merge-requests" &&
        (card.projectId === null || typeof card.projectId === "number") &&
        (card.projectName === null || typeof card.projectName === "string") &&
        typeof card.hideDrafts === "boolean" &&
        (card.sortOrder === "oldest" || card.sortOrder === "newest") &&
        typeof card.createdAt === "string"
    );
}

function isJiraCardConfig(value: unknown): value is JiraVersionsCardConfig {
    if (typeof value !== "object" || value === null) return false;
    const card = value as JiraVersionsCardConfig;
    return (
        typeof card.id === "string" &&
        card.type === "jira-release-versions" &&
        (card.projectId === null || typeof card.projectId === "string") &&
        (card.projectKey === null || typeof card.projectKey === "string") &&
        (card.projectName === null || typeof card.projectName === "string") &&
        (card.sortOrder === "dueDate" || card.sortOrder === "progress" || card.sortOrder === "name") &&
        typeof card.createdAt === "string"
    );
}

function isWeatherCardConfig(value: unknown): value is WeatherCardConfig {
    if (typeof value !== "object" || value === null) return false;
    const card = value as WeatherCardConfig;
    return (
        typeof card.id === "string" &&
        card.type === "weather" &&
        (card.locationId === null || typeof card.locationId === "number") &&
        (card.locationName === null || typeof card.locationName === "string") &&
        (card.latitude === null || typeof card.latitude === "number") &&
        (card.longitude === null || typeof card.longitude === "number") &&
        typeof card.createdAt === "string"
    );
}

function isCardConfig(value: unknown): value is CardConfig {
    return isDepartureCardConfig(value) || isGitlabCardConfig(value) || isJiraCardConfig(value) || isWeatherCardConfig(value);
}

export function loadCards(): CardConfig[] {
    const raw = safeGetItem(CARDS_KEY);
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        return parsed
            .filter(isCardConfig)
            .map((card) =>
                card.type === "departures"
                    ? { ...card, highlightThresholdMinutes: card.highlightThresholdMinutes ?? DEFAULT_HIGHLIGHT_THRESHOLD_MINUTES }
                    : card,
            );
    } catch {
        return [];
    }
}

function persist(cards: CardConfig[]): CardConfig[] {
    safeSetItem(CARDS_KEY, JSON.stringify(cards));
    return cards;
}

export function createDepartureCard(): CardConfig[] {
    const newCard: DepartureCardConfig = {
        id: crypto.randomUUID(),
        type: "departures",
        stopName: null,
        stopLid: null,
        refreshIntervalSeconds: DEFAULT_REFRESH_INTERVAL_SECONDS,
        groupByLine: false,
        maxDeparturesPerLine: DEFAULT_MAX_DEPARTURES_PER_LINE,
        lineFilter: [],
        highlightThresholdMinutes: DEFAULT_HIGHLIGHT_THRESHOLD_MINUTES,
        createdAt: new Date().toISOString(),
    };

    return persist([...loadCards(), newCard]);
}

export function createGitlabCard(): CardConfig[] {
    const newCard: GitlabMergeRequestsCardConfig = {
        id: crypto.randomUUID(),
        type: "gitlab-merge-requests",
        projectId: null,
        projectName: null,
        hideDrafts: DEFAULT_HIDE_DRAFTS,
        sortOrder: DEFAULT_MR_SORT_ORDER,
        createdAt: new Date().toISOString(),
    };

    return persist([...loadCards(), newCard]);
}

export function createJiraCard(): CardConfig[] {
    const newCard: JiraVersionsCardConfig = {
        id: crypto.randomUUID(),
        type: "jira-release-versions",
        projectId: null,
        projectKey: null,
        projectName: null,
        sortOrder: DEFAULT_JIRA_VERSION_SORT_ORDER,
        createdAt: new Date().toISOString(),
    };

    return persist([...loadCards(), newCard]);
}

export function createWeatherCard(): CardConfig[] {
    const newCard: WeatherCardConfig = {
        id: crypto.randomUUID(),
        type: "weather",
        locationId: null,
        locationName: null,
        latitude: null,
        longitude: null,
        createdAt: new Date().toISOString(),
    };

    return persist([...loadCards(), newCard]);
}

export type DepartureCardPatch = Partial<Omit<DepartureCardConfig, "id" | "type" | "createdAt">>;
export type GitlabCardPatch = Partial<Omit<GitlabMergeRequestsCardConfig, "id" | "type" | "createdAt">>;
export type JiraCardPatch = Partial<Omit<JiraVersionsCardConfig, "id" | "type" | "createdAt">>;
export type WeatherCardPatch = Partial<Omit<WeatherCardConfig, "id" | "type" | "createdAt">>;
export type CardConfigPatch = DepartureCardPatch | GitlabCardPatch | JiraCardPatch | WeatherCardPatch;

export function updateCard(id: string, patch: CardConfigPatch): CardConfig[] {
    // Callers pass a patch shaped for the card's actual type; the merge itself is type-agnostic.
    return persist(loadCards().map((card) => (card.id === id ? ({ ...card, ...patch } as CardConfig) : card)));
}

export function removeCard(id: string): CardConfig[] {
    return persist(loadCards().filter((card) => card.id !== id));
}

/** Re-sorts cards to match orderedIds; any card whose id is missing from orderedIds keeps its prior relative order at the end. */
export function reorderCards(orderedIds: string[]): CardConfig[] {
    const cards = loadCards();
    const cardsById = new Map(cards.map((card) => [card.id, card]));
    const ordered = orderedIds.map((id) => cardsById.get(id)).filter((card) => card !== undefined);

    const orderedIdSet = new Set(orderedIds);
    const remaining = cards.filter((card) => !orderedIdSet.has(card.id));

    return persist([...ordered, ...remaining]);
}
