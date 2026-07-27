import { describe, expect, it } from "vitest";
import { filterUnreleasedVersions, parseJiraVersion, parseJiraVersionMeta, sortJiraVersions, type ParsedJiraVersion } from "./parseVersions";

function versionRaw(overrides: Record<string, unknown> = {}) {
    return {
        id: "10001",
        name: "v1.2",
        projectId: 10000,
        released: false,
        archived: false,
        releaseDate: "2026-08-15",
        ...overrides,
    };
}

function withCounts(meta: ReturnType<typeof parseJiraVersionMeta>, issuesCount: number, issuesUnresolvedCount: number): ParsedJiraVersion {
    return parseJiraVersion(meta!, { issuesCount, issuesUnresolvedCount });
}

describe("parseJiraVersionMeta", () => {
    it("parses a normal version", () => {
        expect(parseJiraVersionMeta(versionRaw())).toEqual({
            id: "10001",
            projectId: "10000",
            name: "v1.2",
            released: false,
            archived: false,
            releaseDate: "2026-08-15",
        });
    });

    it("accepts a string projectId", () => {
        expect(parseJiraVersionMeta(versionRaw({ projectId: "10000" }))?.projectId).toBe("10000");
    });

    it("defaults releaseDate to null when absent", () => {
        expect(parseJiraVersionMeta(versionRaw({ releaseDate: undefined }))?.releaseDate).toBeNull();
    });

    it("defaults released/archived to false when absent", () => {
        const result = parseJiraVersionMeta(versionRaw({ released: undefined, archived: undefined }));
        expect(result?.released).toBe(false);
        expect(result?.archived).toBe(false);
    });

    it("returns null for malformed entries", () => {
        expect(parseJiraVersionMeta(null)).toBeNull();
        expect(parseJiraVersionMeta(versionRaw({ id: undefined }))).toBeNull();
        expect(parseJiraVersionMeta(versionRaw({ name: undefined }))).toBeNull();
        expect(parseJiraVersionMeta(versionRaw({ projectId: undefined }))).toBeNull();
        expect(parseJiraVersionMeta(versionRaw({ projectId: true }))).toBeNull();
    });
});

describe("parseJiraVersion", () => {
    it("combines meta with issue counts", () => {
        const meta = parseJiraVersionMeta(versionRaw())!;
        const result = parseJiraVersion(meta, { issuesCount: 30, issuesUnresolvedCount: 23 });

        expect(result).toMatchObject({ totalIssueCount: 30, resolvedIssueCount: 7, progressPercent: 23 });
    });

    it("defaults counts to 0 when the issue-count response is missing or malformed", () => {
        const meta = parseJiraVersionMeta(versionRaw())!;

        expect(parseJiraVersion(meta, {})).toMatchObject({ totalIssueCount: 0, resolvedIssueCount: 0, progressPercent: 0 });
        expect(parseJiraVersion(meta, null)).toMatchObject({ totalIssueCount: 0, resolvedIssueCount: 0, progressPercent: 0 });
    });

    it("gives 0 progress (not NaN) for a version with 0 issues", () => {
        const meta = parseJiraVersionMeta(versionRaw())!;
        expect(parseJiraVersion(meta, { issuesCount: 0, issuesUnresolvedCount: 0 }).progressPercent).toBe(0);
    });

    it("rounds progress percent", () => {
        const meta = parseJiraVersionMeta(versionRaw())!;
        expect(parseJiraVersion(meta, { issuesCount: 3, issuesUnresolvedCount: 2 }).progressPercent).toBe(33);
    });
});

describe("filterUnreleasedVersions", () => {
    it("drops released and archived versions, keeps neither-flag versions", () => {
        const unreleased = parseJiraVersionMeta(versionRaw({ id: "1" }))!;
        const released = parseJiraVersionMeta(versionRaw({ id: "2", released: true }))!;
        const archived = parseJiraVersionMeta(versionRaw({ id: "3", archived: true }))!;

        expect(filterUnreleasedVersions([unreleased, released, archived])).toEqual([unreleased]);
    });

    it("returns an empty array when given an empty list", () => {
        expect(filterUnreleasedVersions([])).toEqual([]);
    });
});

describe("sortJiraVersions", () => {
    it("sorts by due date soonest-first by default, undated versions last", () => {
        const soon = withCounts(parseJiraVersionMeta(versionRaw({ id: "1", name: "soon", releaseDate: "2026-08-01" })), 1, 0);
        const later = withCounts(parseJiraVersionMeta(versionRaw({ id: "2", name: "later", releaseDate: "2026-09-01" })), 1, 0);
        const undated = withCounts(parseJiraVersionMeta(versionRaw({ id: "3", name: "undated", releaseDate: undefined })), 1, 0);

        expect(sortJiraVersions([undated, later, soon])).toEqual([soon, later, undated]);
        expect(sortJiraVersions([undated, later, soon], "dueDate")).toEqual([soon, later, undated]);
    });

    it("sorts by progress least-complete-first", () => {
        const mostlyDone = withCounts(parseJiraVersionMeta(versionRaw({ id: "1", name: "mostly-done" })), 10, 1);
        const barelyStarted = withCounts(parseJiraVersionMeta(versionRaw({ id: "2", name: "barely-started" })), 10, 9);

        expect(sortJiraVersions([mostlyDone, barelyStarted], "progress")).toEqual([barelyStarted, mostlyDone]);
    });

    it("sorts alphabetically by name", () => {
        const b = withCounts(parseJiraVersionMeta(versionRaw({ id: "1", name: "b-version" })), 1, 0);
        const a = withCounts(parseJiraVersionMeta(versionRaw({ id: "2", name: "a-version" })), 1, 0);

        expect(sortJiraVersions([b, a], "name")).toEqual([a, b]);
    });
});
