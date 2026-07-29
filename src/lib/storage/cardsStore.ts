import {
    createDepartureCard,
    createGitlabCard,
    createJiraCard,
    createWeatherCard as createWeatherCardConfig,
    loadCards,
    removeCard,
    reorderCards,
    updateCard,
} from "@/lib/storage/cards";
import type { CardConfig } from "@/types/domain";

const EMPTY_CARDS: CardConfig[] = [];
const listeners = new Set<() => void>();
let cache: CardConfig[] | null = null;

function notify() {
    listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function getSnapshot(): CardConfig[] {
    if (cache === null) cache = loadCards();
    return cache;
}

export function getServerSnapshot(): CardConfig[] {
    return EMPTY_CARDS;
}

export function createDeparturesCard() {
    cache = createDepartureCard();
    notify();
}

export function createGitlabMergeRequestsCard() {
    cache = createGitlabCard();
    notify();
}

export function createJiraVersionsCard() {
    cache = createJiraCard();
    notify();
}

export function createWeatherCard() {
    cache = createWeatherCardConfig();
    notify();
}

export function patchCard(id: string, patch: Parameters<typeof updateCard>[1]) {
    cache = updateCard(id, patch);
    notify();
}

export function deleteCard(id: string) {
    cache = removeCard(id);
    notify();
}

export function reorder(orderedIds: string[]) {
    cache = reorderCards(orderedIds);
    notify();
}
