/** localStorage access is wrapped defensively — it throws under SSR, and in
 * browsers with storage disabled (e.g. Safari private mode). */
export function safeGetItem(key: string): string | null {
    if (typeof window === "undefined") return null;
    try {
        return window.localStorage.getItem(key);
    } catch {
        return null;
    }
}

export function safeSetItem(key: string, value: string): void {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(key, value);
    } catch {
        // Storage unavailable or full — silently no-op, state stays in-memory for this session.
    }
}
