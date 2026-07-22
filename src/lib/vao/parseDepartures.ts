import { computeMinutesUntil, parseTimeRaw } from "@/lib/time";

export interface ParsedDeparture {
    line: string;
    direction: string;
    minutesUntil: number;
    delayed: boolean;
    scheduledLabel: string;
    realLabel?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function parseJourney(jny: unknown, prodL: unknown[], now: Date): ParsedDeparture | null {
    if (!isRecord(jny)) return null;

    const stbStop = jny.stbStop;
    if (!isRecord(stbStop)) return null;

    const dTimeS = stbStop.dTimeS;
    const dTimeR = stbStop.dTimeR;
    if (typeof dTimeS !== "string") return null;

    const timeRaw = typeof dTimeR === "string" ? dTimeR : dTimeS;
    const delayed = typeof dTimeR === "string" && dTimeR !== dTimeS;

    const { actualHour, minute, dayOffset } = parseTimeRaw(timeRaw);
    const minutesUntil = computeMinutesUntil(actualHour, minute, dayOffset, now);

    const prodX = jny.prodX;
    const prod = typeof prodX === "number" ? prodL[prodX] : undefined;
    const line = isRecord(prod) && typeof prod.nameS === "string" ? prod.nameS : "?";

    const direction = typeof jny.dirTxt === "string" ? jny.dirTxt : "";

    return {
        line,
        direction,
        minutesUntil,
        delayed,
        scheduledLabel: `${String(actualHour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
        realLabel: delayed ? formatRaw(dTimeR as string) : undefined,
    };
}

function formatRaw(raw: string): string {
    const { actualHour, minute } = parseTimeRaw(raw);
    return `${String(actualHour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/**
 * Parses a StationBoard response into departures, sorted by minutesUntil.
 * The upstream API is unofficial/reverse-engineered and can change without
 * notice, so every field access is defensive and a malformed journey entry
 * is skipped rather than failing the whole board.
 */
export function parseStationBoardResponse(raw: unknown, now: Date = new Date()): ParsedDeparture[] {
    if (!isRecord(raw)) return [];

    const svcResL = raw.svcResL;
    if (!Array.isArray(svcResL) || !isRecord(svcResL[0])) return [];

    const res = svcResL[0].res;
    if (!isRecord(res)) return [];

    const common = isRecord(res.common) ? res.common : {};
    const prodL = Array.isArray(common.prodL) ? common.prodL : [];
    const jnyL = Array.isArray(res.jnyL) ? res.jnyL : [];

    const departures: ParsedDeparture[] = [];
    for (const jny of jnyL) {
        try {
            const parsed = parseJourney(jny, prodL, now);
            if (parsed) departures.push(parsed);
        } catch {
            // Skip malformed journey entries rather than failing the whole board.
        }
    }

    return departures.sort((a, b) => a.minutesUntil - b.minutesUntil);
}
