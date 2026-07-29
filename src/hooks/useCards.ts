"use client";

import { useSyncExternalStore } from "react";
import {
    createDeparturesCard,
    createGitlabMergeRequestsCard,
    createJiraVersionsCard,
    createWeatherCard,
    deleteCard,
    getServerSnapshot,
    getSnapshot,
    patchCard,
    reorder,
    subscribe,
} from "@/lib/storage/cardsStore";

export function useCards() {
    const cards = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    return {
        cards,
        createDeparturesCard,
        createGitlabMergeRequestsCard,
        createJiraVersionsCard,
        createWeatherCard,
        updateCard: patchCard,
        removeCard: deleteCard,
        reorderCards: reorder,
    };
}
