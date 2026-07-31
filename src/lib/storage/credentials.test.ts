import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadCredentials, updateCredentials } from "./credentials";
import { CREDENTIALS_KEY } from "./storageKeys";

class MemoryStorage {
    private store = new Map<string, string>();
    getItem(key: string) {
        return this.store.get(key) ?? null;
    }
    setItem(key: string, value: string) {
        this.store.set(key, value);
    }
}

beforeEach(() => {
    (globalThis as unknown as { window: unknown }).window = { localStorage: new MemoryStorage() };
});

afterEach(() => {
    delete (globalThis as unknown as { window?: unknown }).window;
});

describe("credentials", () => {
    it("returns all-null credentials when nothing is saved", () => {
        expect(loadCredentials()).toEqual({ gitlabToken: null, jiraEmail: null, jiraToken: null });
    });

    it("sets a credential via patch", () => {
        const result = updateCredentials({ gitlabToken: "glpat-abc123" });
        expect(result).toEqual({ gitlabToken: "glpat-abc123", jiraEmail: null, jiraToken: null });
        expect(loadCredentials()).toEqual({ gitlabToken: "glpat-abc123", jiraEmail: null, jiraToken: null });
    });

    it("merges patches instead of overwriting unrelated fields", () => {
        updateCredentials({ gitlabToken: "glpat-abc123" });
        const result = updateCredentials({ jiraEmail: "andreas@wirecube.at", jiraToken: "ATATT-xyz" });

        expect(result).toEqual({ gitlabToken: "glpat-abc123", jiraEmail: "andreas@wirecube.at", jiraToken: "ATATT-xyz" });
    });

    it("clears a credential by patching it to null", () => {
        updateCredentials({ gitlabToken: "glpat-abc123" });
        const result = updateCredentials({ gitlabToken: null });
        expect(result.gitlabToken).toBeNull();
    });

    it("returns all-null credentials for corrupted storage data", () => {
        (globalThis as unknown as { window: { localStorage: MemoryStorage } }).window.localStorage.setItem(CREDENTIALS_KEY, "not json");
        expect(loadCredentials()).toEqual({ gitlabToken: null, jiraEmail: null, jiraToken: null });
    });

    it("rejects stored credentials whose fields have the wrong type", () => {
        (globalThis as unknown as { window: { localStorage: MemoryStorage } }).window.localStorage.setItem(
            CREDENTIALS_KEY,
            JSON.stringify({ gitlabToken: 12345 }),
        );
        expect(loadCredentials()).toEqual({ gitlabToken: null, jiraEmail: null, jiraToken: null });
    });
});
