import { safeGetItem, safeSetItem } from "@/lib/storage/safeStorage";
import { CARDS_KEY } from "@/lib/storage/storageKeys";
import {
    DEFAULT_HIDE_DRAFTS,
    DEFAULT_JIRA_VERSION_SORT_ORDER,
    DEFAULT_MAX_DEPARTURES_PER_LINE,
    DEFAULT_MR_SORT_ORDER,
    DEFAULT_REFRESH_INTERVAL_SECONDS,
    type CardConfig,
    type DepartureCardConfig,
    type GitlabMergeRequestsCardConfig,
    type JiraVersionsCardConfig,
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

function isCardConfig(value: unknown): value is CardConfig {
    return isDepartureCardConfig(value) || isGitlabCardConfig(value) || isJiraCardConfig(value);
}

export function loadCards(): CardConfig[] {
    const raw = safeGetItem(CARDS_KEY);
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter(isCardConfig) : [];
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

export type DepartureCardPatch = Partial<Omit<DepartureCardConfig, "id" | "type" | "createdAt">>;
export type GitlabCardPatch = Partial<Omit<GitlabMergeRequestsCardConfig, "id" | "type" | "createdAt">>;
export type JiraCardPatch = Partial<Omit<JiraVersionsCardConfig, "id" | "type" | "createdAt">>;
export type CardConfigPatch = DepartureCardPatch | GitlabCardPatch | JiraCardPatch;

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
