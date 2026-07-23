import { describe, expect, it } from "vitest";
import { filterDraftMergeRequests, parseMergeRequest, sortMergeRequestsByAge } from "./parseMergeRequests";

function mrRaw(overrides: Record<string, unknown> = {}) {
    return {
        id: 1,
        iid: 10,
        title: "Fix the thing",
        web_url: "https://gitlab.wirecube.at/shopreme/backend/-/merge_requests/10",
        created_at: "2026-07-01T10:00:00.000Z",
        author: { name: "Ada Lovelace", avatar_url: "https://gitlab.wirecube.at/avatar.png" },
        ...overrides,
    };
}

describe("parseMergeRequest", () => {
    it("parses a normal merge request with its approvals", () => {
        const result = parseMergeRequest(mrRaw(), { approved: true, approvals_left: 0 });

        expect(result).toEqual({
            id: 1,
            iid: 10,
            title: "Fix the thing",
            webUrl: "https://gitlab.wirecube.at/shopreme/backend/-/merge_requests/10",
            author: { name: "Ada Lovelace", avatarUrl: "https://gitlab.wirecube.at/avatar.png" },
            createdAt: "2026-07-01T10:00:00.000Z",
            isDraft: false,
            approved: true,
            approvalsLeft: 0,
        });
    });

    it("reads draft from the `draft` field", () => {
        expect(parseMergeRequest(mrRaw({ draft: true }), {})?.isDraft).toBe(true);
    });

    it("falls back to `work_in_progress` for older GitLab versions", () => {
        expect(parseMergeRequest(mrRaw({ work_in_progress: true }), {})?.isDraft).toBe(true);
    });

    it("defaults approved/approvalsLeft when the approvals response is missing fields", () => {
        const result = parseMergeRequest(mrRaw(), {});
        expect(result?.approved).toBe(false);
        expect(result?.approvalsLeft).toBe(0);
    });

    it("defaults a missing author to an Unknown/null placeholder", () => {
        const result = parseMergeRequest(mrRaw({ author: undefined }), {});
        expect(result?.author).toEqual({ name: "Unknown", avatarUrl: null });
    });

    it("returns null for a malformed merge request", () => {
        expect(parseMergeRequest(null, {})).toBeNull();
        expect(parseMergeRequest({ id: 1 }, {})).toBeNull();
    });
});

describe("sortMergeRequestsByAge", () => {
    it("sorts oldest first", () => {
        const older = parseMergeRequest(mrRaw({ id: 1, created_at: "2026-06-01T00:00:00.000Z" }), {})!;
        const newer = parseMergeRequest(mrRaw({ id: 2, created_at: "2026-07-01T00:00:00.000Z" }), {})!;

        expect(sortMergeRequestsByAge([newer, older])).toEqual([older, newer]);
    });
});

describe("filterDraftMergeRequests", () => {
    it("hides drafts when hideDrafts is true", () => {
        const draft = parseMergeRequest(mrRaw({ id: 1, draft: true }), {})!;
        const ready = parseMergeRequest(mrRaw({ id: 2, draft: false }), {})!;

        expect(filterDraftMergeRequests([draft, ready], true)).toEqual([ready]);
    });

    it("keeps drafts when hideDrafts is false", () => {
        const draft = parseMergeRequest(mrRaw({ id: 1, draft: true }), {})!;
        const ready = parseMergeRequest(mrRaw({ id: 2, draft: false }), {})!;

        expect(filterDraftMergeRequests([draft, ready], false)).toEqual([draft, ready]);
    });
});
