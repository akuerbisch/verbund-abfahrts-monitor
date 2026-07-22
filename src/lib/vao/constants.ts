export const VAO_GATE_URL = "https://verkehrsauskunft.verbundlinie.at/hamm/gate";

export const VAO_ENVELOPE_BASE = {
    ver: "1.59",
    lang: "deu",
    client: { id: "VAO", type: "WEB", name: "webapp", l: "vs_stv", v: 10014 },
    formatted: false,
    ext: "VAO.22",
} as const;

// Includes only bus/tram journeys (excludes e.g. rail/long-distance products).
export const JOURNEY_FILTER = [{ type: "PROD", mode: "INC", value: 4087 }] as const;

export const MAX_DEPARTURES = 15;
