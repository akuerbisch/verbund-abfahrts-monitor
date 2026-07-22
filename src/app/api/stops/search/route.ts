import { NextResponse } from "next/server";
import { buildLocMatchRequest, callVaoGate, VaoTimeoutError, VaoUpstreamError } from "@/lib/vao/client";
import { parseLocMatchResponse } from "@/lib/vao/parseStops";

export const dynamic = "force-dynamic";

const MIN_QUERY_LENGTH = 2;

export async function POST(request: Request) {
    const body = await request.json().catch(() => null);
    const query = typeof body?.query === "string" ? body.query.trim() : "";

    if (query.length < MIN_QUERY_LENGTH) {
        return NextResponse.json({ error: `query must be at least ${MIN_QUERY_LENGTH} characters` }, { status: 400 });
    }

    try {
        const raw = await callVaoGate(buildLocMatchRequest(query));
        return NextResponse.json({ results: parseLocMatchResponse(raw) });
    } catch (error) {
        if (error instanceof VaoTimeoutError) {
            return NextResponse.json({ error: error.message }, { status: 504 });
        }
        if (error instanceof VaoUpstreamError) {
            return NextResponse.json({ error: error.message }, { status: 502 });
        }
        throw error;
    }
}
