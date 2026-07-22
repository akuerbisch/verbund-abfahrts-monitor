import { NextResponse } from "next/server";
import { buildStationBoardRequest, callVaoGate, VaoTimeoutError, VaoUpstreamError } from "@/lib/vao/client";
import { parseStationBoardResponse } from "@/lib/vao/parseDepartures";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    const body = await request.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name : "";
    const lid = typeof body?.lid === "string" ? body.lid : "";

    if (!name || !lid) {
        return NextResponse.json({ error: "name and lid are required" }, { status: 400 });
    }

    try {
        const raw = await callVaoGate(buildStationBoardRequest(name, lid));
        return NextResponse.json({ departures: parseStationBoardResponse(raw), fetchedAt: new Date().toISOString() });
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
