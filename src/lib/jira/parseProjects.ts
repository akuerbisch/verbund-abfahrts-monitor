export interface JiraProject {
    id: string;
    key: string;
    name: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

/**
 * Parses a Jira `GET /project/search` response into project search results.
 * That endpoint is paginated — results live under `.values`. Defensive
 * per-entry parsing — a malformed project is skipped rather than failing the
 * whole search.
 */
export function parseJiraProjectsResponse(raw: unknown): JiraProject[] {
    const values = isRecord(raw) ? raw.values : undefined;
    if (!Array.isArray(values)) return [];

    const projects: JiraProject[] = [];
    for (const item of values) {
        if (!isRecord(item)) continue;

        const { id, key, name } = item;
        if (typeof id !== "string" || typeof key !== "string" || typeof name !== "string") continue;

        projects.push({ id, key, name });
    }

    return projects;
}
