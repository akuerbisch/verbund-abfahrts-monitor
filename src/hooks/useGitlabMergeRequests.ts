"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ParsedMergeRequest } from "@/lib/gitlab/parseMergeRequests";

export type GitlabMergeRequestsStatus = "unconfigured" | "loading" | "success" | "error" | "stale-error";

// MRs don't need departure-board-speed polling.
const POLL_INTERVAL_MS = 3 * 60 * 1000;

export function useGitlabMergeRequests(projectId: number | null) {
    const [status, setStatus] = useState<GitlabMergeRequestsStatus>("loading");
    const [mergeRequests, setMergeRequests] = useState<ParsedMergeRequest[]>([]);
    const hasDataRef = useRef(false);

    const fetchMergeRequests = useCallback(
        async (signal?: AbortSignal) => {
            if (projectId === null) return;

            try {
                const response = await fetch("/api/gitlab/merge-requests", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ projectId }),
                    signal,
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const data = await response.json();
                hasDataRef.current = true;
                setMergeRequests(Array.isArray(data.mergeRequests) ? data.mergeRequests : []);
                setStatus("success");
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") return;
                setStatus(hasDataRef.current ? "stale-error" : "error");
            }
        },
        [projectId],
    );

    useEffect(() => {
        if (projectId === null) return;

        const controller = new AbortController();
        // Deferred to a microtask so the initial fetch isn't a bare call in the effect body.
        void Promise.resolve().then(() => fetchMergeRequests(controller.signal));

        let interval: ReturnType<typeof setInterval> | null = null;
        const startPolling = () => {
            if (interval) return;
            interval = setInterval(() => fetchMergeRequests(), POLL_INTERVAL_MS);
        };
        const stopPolling = () => {
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                stopPolling();
            } else {
                fetchMergeRequests();
                startPolling();
            }
        };

        startPolling();
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            controller.abort();
            stopPolling();
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [fetchMergeRequests, projectId]);

    if (projectId === null) {
        return { mergeRequests: [] as ParsedMergeRequest[], status: "unconfigured" as const };
    }

    return { mergeRequests, status };
}
