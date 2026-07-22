import { createDepartureCard, loadCards, removeCard, updateCard } from "@/lib/storage/cards";
import type { DepartureCardConfig } from "@/types/domain";

const EMPTY_CARDS: DepartureCardConfig[] = [];
const listeners = new Set<() => void>();
let cache: DepartureCardConfig[] | null = null;

function notify() {
    listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function getSnapshot(): DepartureCardConfig[] {
    if (cache === null) cache = loadCards();
    return cache;
}

export function getServerSnapshot(): DepartureCardConfig[] {
    return EMPTY_CARDS;
}

export function createCard() {
    cache = createDepartureCard();
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
