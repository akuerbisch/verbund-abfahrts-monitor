"use client";

import { useSyncExternalStore } from "react";
import {
    createDeparturesCard,
    createGitlabMergeRequestsCard,
    deleteCard,
    getServerSnapshot,
    getSnapshot,
    patchCard,
    reorder,
    subscribe,
} from "@/lib/storage/cardsStore";

export function useCards() {
    const cards = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    return { cards, createDeparturesCard, createGitlabMergeRequestsCard, updateCard: patchCard, removeCard: deleteCard, reorderCards: reorder };
}
