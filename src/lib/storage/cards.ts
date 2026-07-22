import { safeGetItem, safeSetItem } from "@/lib/storage/safeStorage";
import { CARDS_KEY } from "@/lib/storage/storageKeys";
import { DEFAULT_REFRESH_INTERVAL_SECONDS, type DepartureCardConfig } from "@/types/domain";

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
        typeof card.createdAt === "string"
    );
}

export function loadCards(): DepartureCardConfig[] {
    const raw = safeGetItem(CARDS_KEY);
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter(isDepartureCardConfig) : [];
    } catch {
        return [];
    }
}

function persist(cards: DepartureCardConfig[]): DepartureCardConfig[] {
    safeSetItem(CARDS_KEY, JSON.stringify(cards));
    return cards;
}

export function createDepartureCard(): DepartureCardConfig[] {
    const newCard: DepartureCardConfig = {
        id: crypto.randomUUID(),
        type: "departures",
        stopName: null,
        stopLid: null,
        refreshIntervalSeconds: DEFAULT_REFRESH_INTERVAL_SECONDS,
        groupByLine: false,
        createdAt: new Date().toISOString(),
    };

    return persist([...loadCards(), newCard]);
}

export function updateCard(id: string, patch: Partial<Omit<DepartureCardConfig, "id" | "type" | "createdAt">>): DepartureCardConfig[] {
    return persist(loadCards().map((card) => (card.id === id ? { ...card, ...patch } : card)));
}

export function removeCard(id: string): DepartureCardConfig[] {
    return persist(loadCards().filter((card) => card.id !== id));
}
