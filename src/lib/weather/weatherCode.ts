import type { FC } from "react";
import { Cloud01, CloudLightning, CloudRaining01, CloudRaining03, CloudRaining05, CloudSnowing01, CloudSun01, Sun } from "@untitledui/icons";

export interface WeatherCodeInfo {
    label: string;
    icon: FC<{ className?: string }>;
}

// WMO weather interpretation codes, as used by Open-Meteo's `weather_code` field.
const WEATHER_CODE_MAP: Record<number, WeatherCodeInfo> = {
    0: { label: "Clear sky", icon: Sun },
    1: { label: "Mostly clear", icon: Sun },
    2: { label: "Partly cloudy", icon: CloudSun01 },
    3: { label: "Overcast", icon: Cloud01 },
    45: { label: "Fog", icon: Cloud01 },
    48: { label: "Fog", icon: Cloud01 },
    51: { label: "Light drizzle", icon: CloudRaining01 },
    53: { label: "Drizzle", icon: CloudRaining01 },
    55: { label: "Dense drizzle", icon: CloudRaining01 },
    56: { label: "Freezing drizzle", icon: CloudRaining01 },
    57: { label: "Freezing drizzle", icon: CloudRaining01 },
    61: { label: "Light rain", icon: CloudRaining03 },
    63: { label: "Rain", icon: CloudRaining03 },
    65: { label: "Heavy rain", icon: CloudRaining03 },
    66: { label: "Freezing rain", icon: CloudRaining03 },
    67: { label: "Freezing rain", icon: CloudRaining03 },
    71: { label: "Light snow", icon: CloudSnowing01 },
    73: { label: "Snow", icon: CloudSnowing01 },
    75: { label: "Heavy snow", icon: CloudSnowing01 },
    77: { label: "Snow grains", icon: CloudSnowing01 },
    80: { label: "Rain showers", icon: CloudRaining05 },
    81: { label: "Rain showers", icon: CloudRaining05 },
    82: { label: "Violent rain showers", icon: CloudRaining05 },
    85: { label: "Snow showers", icon: CloudSnowing01 },
    86: { label: "Snow showers", icon: CloudSnowing01 },
    95: { label: "Thunderstorm", icon: CloudLightning },
    96: { label: "Thunderstorm with hail", icon: CloudLightning },
    99: { label: "Thunderstorm with hail", icon: CloudLightning },
};

const DEFAULT_WEATHER_CODE_INFO: WeatherCodeInfo = { label: "Unknown", icon: Cloud01 };

export function describeWeatherCode(code: number): WeatherCodeInfo {
    return WEATHER_CODE_MAP[code] ?? DEFAULT_WEATHER_CODE_INFO;
}
