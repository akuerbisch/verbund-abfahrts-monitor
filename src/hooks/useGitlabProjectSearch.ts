"use client";

import { useEffect, useState } from "react";
import type { GitlabProject } from "@/lib/gitlab/parseProjects";

const DEBOUNCE_MS = 300;

export type GitlabProjectSearchStatus = "loading" | "success" | "error";

interface FetchState {
    projects: GitlabProject[];
    status: GitlabProjectSearchStatus;
}

/** No minimum query length — the accessible-project list is small, so an empty query lists everything. */
export function useGitlabProjectSearch(query: string, token: string | null) {
    const trimmed = query.trim();
    const [fetchState, setFetchState] = useState<FetchState>({ projects: [], status: "loading" });

    useEffect(() => {
        if (!token) return;

        const controller = new AbortController();
        const timeout = setTimeout(() => {
            setFetchState((prev) => ({ ...prev, status: "loading" }));

            fetch("/api/gitlab/projects/search", {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Gitlab-Token": token },
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
    }, [trimmed, token]);

    return fetchState;
}
