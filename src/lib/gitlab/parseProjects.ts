export interface GitlabProject {
    id: number;
    name: string;
    pathWithNamespace: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

/**
 * Parses a GitLab `GET /projects` response into project search results.
 * Defensive per-entry parsing — a malformed project is skipped rather than
 * failing the whole search.
 */
export function parseGitlabProjectsResponse(raw: unknown): GitlabProject[] {
    if (!Array.isArray(raw)) return [];

    const projects: GitlabProject[] = [];
    for (const item of raw) {
        try {
            if (!isRecord(item)) continue;

            const { id, name, path_with_namespace: pathWithNamespace } = item;
            if (typeof id !== "number" || typeof name !== "string" || typeof pathWithNamespace !== "string") continue;

            projects.push({ id, name, pathWithNamespace });
        } catch {
            // Skip malformed entries rather than failing the whole search.
        }
    }

    return projects;
}
