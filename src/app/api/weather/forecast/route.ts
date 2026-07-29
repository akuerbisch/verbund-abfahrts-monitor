import { NextResponse } from "next/server";
import { callWeatherForecastApi, WeatherTimeoutError, WeatherUpstreamError } from "@/lib/weather/client";
import { parseWeatherForecast } from "@/lib/weather/parseForecast";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    const body = await request.json().catch(() => null);
    const latitude = typeof body?.latitude === "number" ? body.latitude : null;
    const longitude = typeof body?.longitude === "number" ? body.longitude : null;

    if (latitude === null || longitude === null) {
        return NextResponse.json({ error: "latitude and longitude are required" }, { status: 400 });
    }

    try {
        const raw = await callWeatherForecastApi({
            latitude: String(latitude),
            longitude: String(longitude),
            current: "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code",
            daily: "weather_code,temperature_2m_max,temperature_2m_min",
            forecast_days: "5",
            timezone: "auto",
        });

        const forecast = parseWeatherForecast(raw);
        if (!forecast) {
            return NextResponse.json({ error: "Weather API returned a malformed forecast" }, { status: 502 });
        }

        return NextResponse.json({ forecast });
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
