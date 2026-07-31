"use client";

import { useEffect, useState } from "react";
import type { JiraProject } from "@/lib/jira/parseProjects";

const DEBOUNCE_MS = 300;

export type JiraProjectSearchStatus = "loading" | "success" | "error";

export interface JiraCredentials {
    email: string;
    token: string;
}

interface FetchState {
    projects: JiraProject[];
    status: JiraProjectSearchStatus;
}

/** No minimum query length — the accessible-project list is small, so an empty query lists everything. */
export function useJiraProjectSearch(query: string, credentials: JiraCredentials | null) {
    const trimmed = query.trim();
    const [fetchState, setFetchState] = useState<FetchState>({ projects: [], status: "loading" });

    useEffect(() => {
        if (!credentials) return;

        const controller = new AbortController();
        const timeout = setTimeout(() => {
            setFetchState((prev) => ({ ...prev, status: "loading" }));

            fetch("/api/jira/projects/search", {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Jira-Email": credentials.email, "X-Jira-Token": credentials.token },
                body: JSON.stringify({ query: trimmed }),
                signal: controller.signal,
            })
                .then((res) => res.json())
                .then((data) => setFetchState({ projects: Array.isArray(data.projects) ? data.projects : [], status: "success" }))
                .catch((error: unknown) => {
                    if (error instanceof DOMException && error.name === "AbortError") return;
                    setFetchState({ projects: [], status: "error" });
                });
        }, DEBOUNCE_MS);

        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [trimmed, credentials]);

    return fetchState;
}
