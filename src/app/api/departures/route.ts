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
        let departures: unknown[];
        try {
            const raw = await callVaoGate(buildStationBoardRequest(name, lid, lineFilter, maxJny, durationMinutes));
            departures = parseStationBoardResponse(raw);

            // The upstream line filter is unverified (undocumented API) — a rejected request
            // throws and is handled below, but the gate might instead silently ignore a filter
            // shape it doesn't support and return a "successful" empty board. Treat that the
            // same way: fall back to unfiltered rather than showing an empty card when the
            // stop genuinely has upcoming service on the selected lines.
            if (lineFilter.length > 0 && departures.length === 0) {
                console.warn("VAO gate returned zero departures for a line-filtered StationBoard request, retrying unfiltered");
                const rawUnfiltered = await callVaoGate(buildStationBoardRequest(name, lid, [], maxJny, durationMinutes));
                departures = parseStationBoardResponse(rawUnfiltered);
            }
        } catch (error) {
            // Same fallback, for the case where the filtered request is rejected outright.
            if (lineFilter.length > 0 && error instanceof VaoUpstreamError) {
                console.warn("VAO gate rejected a line-filtered StationBoard request, retrying unfiltered", error.message);
                const rawUnfiltered = await callVaoGate(buildStationBoardRequest(name, lid, [], maxJny, durationMinutes));
                departures = parseStationBoardResponse(rawUnfiltered);
            } else {
                throw error;
            }
        }

        return NextResponse.json({ departures, fetchedAt: new Date().toISOString() });
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
