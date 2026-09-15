import { NextResponse } from "next/server";
import { buildStationBoardRequest, callVaoGate, VaoTimeoutError, VaoUpstreamError } from "@/lib/vao/client";
import { LINE_DISCOVERY_DURATION_MINUTES, MAX_DEPARTURES, MAX_DEPARTURES_FOR_LINE_DISCOVERY } from "@/lib/vao/constants";
import { parseStationBoardResponse } from "@/lib/vao/parseDepartures";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    const body = await request.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name : "";
    const lid = typeof body?.lid === "string" ? body.lid : "";
    const lineFilter = Array.isArray(body?.lineFilter) ? body.lineFilter.filter((line: unknown) => typeof line === "string" && line.length > 0) : [];
    // Only the line-discovery probe should ever request the wider window — clamp defensively
    // regardless of what the client sends.
    const isDiscoveryProbe = body?.wideWindow === true;
    const maxJny = isDiscoveryProbe ? MAX_DEPARTURES_FOR_LINE_DISCOVERY : MAX_DEPARTURES;
    const durationMinutes = isDiscoveryProbe ? LINE_DISCOVERY_DURATION_MINUTES : undefined;

    if (!name || !lid) {
        return NextResponse.json({ error: "name and lid are required" }, { status: 400 });
    }

    try {
        let raw: unknown;
        try {
            raw = await callVaoGate(buildStationBoardRequest(name, lid, lineFilter, maxJny, durationMinutes));
        } catch (error) {
            // The upstream line filter is unverified (undocumented API) — if it's rejected,
            // fall back to an unfiltered request rather than breaking the card outright.
            if (lineFilter.length > 0 && error instanceof VaoUpstreamError) {
                console.warn("VAO gate rejected a line-filtered StationBoard request, retrying unfiltered", error.message);
                raw = await callVaoGate(buildStationBoardRequest(name, lid, [], maxJny, durationMinutes));
            } else {
                throw error;
            }
        }

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
