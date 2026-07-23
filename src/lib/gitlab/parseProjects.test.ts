import { describe, expect, it } from "vitest";
import { parseGitlabProjectsResponse } from "./parseProjects";

describe("parseGitlabProjectsResponse", () => {
    it("parses a normal projects list", () => {
        const result = parseGitlabProjectsResponse([{ id: 1, name: "backend", path_with_namespace: "shopreme/backend" }]);

        expect(result).toEqual([{ id: 1, name: "backend", pathWithNamespace: "shopreme/backend" }]);
    });

    it("skips malformed entries without failing the whole search", () => {
        const result = parseGitlabProjectsResponse([
            { id: 1, name: "backend", path_with_namespace: "shopreme/backend" },
            { id: "not-a-number", name: "broken", path_with_namespace: "shopreme/broken" },
            { name: "missing-id", path_with_namespace: "shopreme/missing-id" },
            null,
        ]);

        expect(result).toEqual([{ id: 1, name: "backend", pathWithNamespace: "shopreme/backend" }]);
    });

    it("returns an empty array for a malformed top-level response", () => {
        expect(parseGitlabProjectsResponse(null)).toEqual([]);
        expect(parseGitlabProjectsResponse({})).toEqual([]);
    });
});
