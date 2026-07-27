export interface JiraVersionMeta {
    id: string;
    projectId: string;
    name: string;
    released: boolean;
    archived: boolean;
    releaseDate: string | null;
}

export interface ParsedJiraVersion extends JiraVersionMeta {
    totalIssueCount: number;
    resolvedIssueCount: number;
    /** 0-100. 0 when the version has no issues at all. */
    progressPercent: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

/** Returns null for a malformed entry rather than throwing. */
export function parseJiraVersionMeta(raw: unknown): JiraVersionMeta | null {
    if (!isRecord(raw)) return null;

    const { id, name, projectId } = raw;
    if (typeof id !== "string" || typeof name !== "string") return null;
    if (typeof projectId !== "number" && typeof projectId !== "string") return null;

    const released = raw.released === true;
    const archived = raw.archived === true;
    const releaseDate = typeof raw.releaseDate === "string" ? raw.releaseDate : null;

    return { id, projectId: String(projectId), name, released, archived, releaseDate };
}

/**
 * Combines version metadata with its (separately fetched) unresolvedIssueCount
 * object — the versions list endpoint doesn't include issue counts.
 */
export function parseJiraVersion(meta: JiraVersionMeta, issueCountRaw: unknown): ParsedJiraVersion {
    const counts = isRecord(issueCountRaw) ? issueCountRaw : {};
    const totalIssueCount = typeof counts.issuesCount === "number" ? counts.issuesCount : 0;
    const issuesUnresolvedCount = typeof counts.issuesUnresolvedCount === "number" ? counts.issuesUnresolvedCount : 0;
    const resolvedIssueCount = Math.max(0, totalIssueCount - issuesUnresolvedCount);
    const progressPercent = totalIssueCount > 0 ? Math.round((resolvedIssueCount / totalIssueCount) * 100) : 0;

    return { ...meta, totalIssueCount, resolvedIssueCount, progressPercent };
}

/** A version is "unreleased" for card purposes if it isn't released and isn't archived. */
export function filterUnreleasedVersions(versions: JiraVersionMeta[]): JiraVersionMeta[] {
    return versions.filter((v) => !v.released && !v.archived);
}

export type JiraVersionSortOrder = "dueDate" | "progress" | "name";

/** "dueDate": versions with a release date soonest-first; undated versions sort last (default). */
export function sortJiraVersions(versions: ParsedJiraVersion[], order: JiraVersionSortOrder = "dueDate"): ParsedJiraVersion[] {
    const sorted = [...versions];

    if (order === "name") {
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (order === "progress") {
        return sorted.sort((a, b) => a.progressPercent - b.progressPercent || a.name.localeCompare(b.name));
    }

    return sorted.sort((a, b) => {
        if (a.releaseDate === null && b.releaseDate === null) return a.name.localeCompare(b.name);
        if (a.releaseDate === null) return 1;
        if (b.releaseDate === null) return -1;
        return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
    });
}
