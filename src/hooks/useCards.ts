"use client";

import { useSyncExternalStore } from "react";
import { createCard, deleteCard, getServerSnapshot, getSnapshot, patchCard, subscribe } from "@/lib/storage/cardsStore";

export function useCards() {
    const cards = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    return { cards, createCard, updateCard: patchCard, removeCard: deleteCard };
}
