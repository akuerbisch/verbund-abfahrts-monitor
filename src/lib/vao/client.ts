import { JOURNEY_FILTER, MAX_DEPARTURES, VAO_ENVELOPE_BASE, VAO_GATE_URL } from "@/lib/vao/constants";

export class VaoUpstreamError extends Error {
    constructor(
        message: string,
        public readonly status?: number,
    ) {
        super(message);
        this.name = "VaoUpstreamError";
    }
}

export class VaoTimeoutError extends Error {
    constructor(message = "VAO upstream request timed out") {
        super(message);
        this.name = "VaoTimeoutError";
    }
}

interface VaoEnvelopeOptions {
    meth: "StationBoard" | "LocMatch";
    req: Record<string, unknown>;
}

function getAid(): string {
    const aid = process.env.VAO_AID;
    if (!aid) {
        throw new VaoUpstreamError("VAO_AID is not configured on the server");
    }
    return aid;
}

function buildEnvelope({ meth, req }: VaoEnvelopeOptions) {
    return {
        id: crypto.randomUUID(),
        ...VAO_ENVELOPE_BASE,
        auth: { type: "AID", aid: getAid() },
        svcReqL: [{ meth, id: "1|7|", req }],
    };
}

export function buildStationBoardRequest(name: string, lid: string) {
    return buildEnvelope({
        meth: "StationBoard",
        req: {
            stbLoc: { name, lid },
            jnyFltrL: JOURNEY_FILTER,
            type: "DEP",
            sort: "PT",
            maxJny: MAX_DEPARTURES,
        },
    });
}

export function buildLocMatchRequest(query: string) {
    return buildEnvelope({
        meth: "LocMatch",
        req: { input: { field: "S", loc: { name: query, type: "ALL" } } },
    });
}

export async function callVaoGate(body: unknown, timeoutMs = 8000): Promise<unknown> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(VAO_GATE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new VaoUpstreamError(`VAO gate responded with HTTP ${response.status}`, response.status);
        }

        return await response.json();
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            throw new VaoTimeoutError();
        }
        if (error instanceof VaoUpstreamError) {
            throw error;
        }
        throw new VaoUpstreamError(error instanceof Error ? error.message : "Unknown VAO upstream error");
    } finally {
        clearTimeout(timeout);
    }
}
