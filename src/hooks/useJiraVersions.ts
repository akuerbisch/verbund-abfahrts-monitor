"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { JiraCredentials } from "@/hooks/useJiraProjectSearch";
import type { ParsedJiraVersion } from "@/lib/jira/parseVersions";

export type JiraVersionsStatus = "unconfigured" | "loading" | "success" | "error" | "stale-error";

// Release versions don't need departure-board-speed polling.
const POLL_INTERVAL_MS = 3 * 60 * 1000;

export function useJiraVersions(projectId: string | null, credentials: JiraCredentials | null) {
    const [status, setStatus] = useState<JiraVersionsStatus>("loading");
    const [versions, setVersions] = useState<ParsedJiraVersion[]>([]);
    const hasDataRef = useRef(false);

    const fetchVersions = useCallback(
        async (signal?: AbortSignal) => {
            if (projectId === null || !credentials) return;

            try {
                const response = await fetch("/api/jira/versions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "X-Jira-Email": credentials.email, "X-Jira-Token": credentials.token },
                    body: JSON.stringify({ projectId }),
                    signal,
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const data = await response.json();
                hasDataRef.current = true;
                setVersions(Array.isArray(data.versions) ? data.versions : []);
                setStatus("success");
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") return;
                setStatus(hasDataRef.current ? "stale-error" : "error");
            }
        },
        [projectId, credentials],
    );

    useEffect(() => {
        if (projectId === null || !credentials) return;

        const controller = new AbortController();
        // Deferred to a microtask so the initial fetch isn't a bare call in the effect body.
        void Promise.resolve().then(() => fetchVersions(controller.signal));

        let interval: ReturnType<typeof setInterval> | null = null;
        const startPolling = () => {
            if (interval) return;
            interval = setInterval(() => fetchVersions(), POLL_INTERVAL_MS);
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
                fetchVersions();
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
    }, [fetchVersions, projectId, credentials]);

    if (projectId === null || !credentials) {
        return { versions: [] as ParsedJiraVersion[], status: "unconfigured" as const };
    }

    return { versions, status };
}
