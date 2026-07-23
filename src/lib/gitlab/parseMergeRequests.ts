export interface ParsedMergeRequest {
    id: number;
    iid: number;
    title: string;
    webUrl: string;
    author: { name: string; avatarUrl: string | null };
    createdAt: string;
    isDraft: boolean;
    approved: boolean;
    approvalsLeft: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

/**
 * Combines a GitLab merge request object with its (separately fetched)
 * approvals object — the list endpoint doesn't include approval state.
 * Returns null for a malformed entry rather than throwing.
 */
export function parseMergeRequest(raw: unknown, approvalsRaw: unknown): ParsedMergeRequest | null {
    if (!isRecord(raw)) return null;

    const { id, iid, title, web_url: webUrl, created_at: createdAt, author } = raw;
    if (typeof id !== "number" || typeof iid !== "number" || typeof title !== "string" || typeof webUrl !== "string" || typeof createdAt !== "string") {
        return null;
    }

    const authorRecord = isRecord(author) ? author : {};
    const authorName = typeof authorRecord.name === "string" ? authorRecord.name : "Unknown";
    const avatarUrl = typeof authorRecord.avatar_url === "string" ? authorRecord.avatar_url : null;

    // `draft` is the modern field; `work_in_progress` is the fallback on older GitLab versions.
    const isDraft = raw.draft === true || raw.work_in_progress === true;

    const approvals = isRecord(approvalsRaw) ? approvalsRaw : {};
    const approved = approvals.approved === true;
    const approvalsLeft = typeof approvals.approvals_left === "number" ? approvals.approvals_left : 0;

    return { id, iid, title, webUrl, author: { name: authorName, avatarUrl }, createdAt, isDraft, approved, approvalsLeft };
}

/** Oldest-first — the merge request open the longest appears first. */
export function sortMergeRequestsByAge(mergeRequests: ParsedMergeRequest[]): ParsedMergeRequest[] {
    return [...mergeRequests].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function filterDraftMergeRequests(mergeRequests: ParsedMergeRequest[], hideDrafts: boolean): ParsedMergeRequest[] {
    return hideDrafts ? mergeRequests.filter((mr) => !mr.isDraft) : mergeRequests;
}
