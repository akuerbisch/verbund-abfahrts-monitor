import { NextResponse } from "next/server";
import { callWeatherGeocodingApi, WeatherTimeoutError, WeatherUpstreamError } from "@/lib/weather/client";
import { parseWeatherLocationsResponse } from "@/lib/weather/parseLocations";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    const body = await request.json().catch(() => null);
    const query = typeof body?.query === "string" ? body.query.trim() : "";

    if (!query) {
        return NextResponse.json({ locations: [] });
    }

    try {
        const raw = await callWeatherGeocodingApi({ name: query, count: "10", language: "en", format: "json" });
        return NextResponse.json({ locations: parseWeatherLocationsResponse(raw) });
    } catch (error) {
        if (error instanceof WeatherTimeoutError) {
            return NextResponse.json({ error: error.message }, { status: 504 });
        }
        if (error instanceof WeatherUpstreamError) {
            return NextResponse.json({ error: error.message }, { status: 502 });
        }
        throw error;
    }
}
