"use client";

import { useEffect, useState } from "react";
import type { StopSearchResult } from "@/lib/vao/parseStops";

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

export type StopSearchStatus = "idle" | "loading" | "success" | "error";

interface FetchState {
    results: StopSearchResult[];
    status: StopSearchStatus;
}

const IDLE_STATE: FetchState = { results: [], status: "idle" };

export function useStopSearch(query: string) {
    const trimmed = query.trim();
    const isTooShort = trimmed.length < MIN_QUERY_LENGTH;

    const [fetchState, setFetchState] = useState<FetchState>(IDLE_STATE);

    useEffect(() => {
        if (isTooShort) return;

        const controller = new AbortController();
        const timeout = setTimeout(() => {
            setFetchState({ results: [], status: "loading" });

            fetch("/api/stops/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: trimmed }),
                signal: controller.signal,
            })
                .then((res) => res.json())
                .then((data) => setFetchState({ results: Array.isArray(data.results) ? data.results : [], status: "success" }))
                .catch((error: unknown) => {
                    if (error instanceof DOMException && error.name === "AbortError") return;
                    setFetchState({ results: [], status: "error" });
                });
        }, DEBOUNCE_MS);

        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [isTooShort, trimmed]);

    return isTooShort ? IDLE_STATE : fetchState;
}
