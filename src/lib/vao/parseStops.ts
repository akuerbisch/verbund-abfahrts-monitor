export interface StopSearchResult {
    id: string;
    name: string;
    lid: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function extractLocL(res: Record<string, unknown>): unknown[] {
    // HAFAS gate implementations nest LocMatch results at slightly different
    // paths (`res.match.locL` is the common one) — try both defensively since
    // this is an unofficial, reverse-engineered API.
    const match = res.match;
    if (isRecord(match) && Array.isArray(match.locL)) return match.locL;
    if (Array.isArray(res.locL)) return res.locL;
    return [];
}

function parseLoc(loc: unknown): StopSearchResult | null {
    if (!isRecord(loc)) return null;

    // Only include actual stops/stations, not addresses or POIs (when the
    // field is present at all — omit the filter rather than drop everything
    // if this API version doesn't set it).
    if (typeof loc.type === "string" && loc.type !== "S") return null;

    const name = loc.name;
    const lid = loc.lid ?? loc.id;
    if (typeof name !== "string" || typeof lid !== "string" || !lid) return null;

    return { id: lid, name, lid };
}

/**
 * Parses a LocMatch response into stop search results, deduped by lid. The
 * upstream API is unofficial and can change without notice, so every field
 * access is defensive and a malformed entry is skipped rather than failing
 * the whole search.
 */
export function parseLocMatchResponse(raw: unknown): StopSearchResult[] {
    if (!isRecord(raw)) return [];

    const svcResL = raw.svcResL;
    if (!Array.isArray(svcResL) || !isRecord(svcResL[0])) return [];

    const res = svcResL[0].res;
    if (!isRecord(res)) return [];

    const seen = new Set<string>();
    const results: StopSearchResult[] = [];

    for (const loc of extractLocL(res)) {
        try {
            const parsed = parseLoc(loc);
            if (parsed && !seen.has(parsed.lid)) {
                seen.add(parsed.lid);
                results.push(parsed);
            }
        } catch {
            // Skip malformed entries rather than failing the whole search.
        }
    }

    return results;
}
