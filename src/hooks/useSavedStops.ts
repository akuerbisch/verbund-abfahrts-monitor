"use client";

import { useSyncExternalStore } from "react";
import { addStop, getServerSnapshot, getSnapshot, removeStop, subscribe } from "@/lib/storage/savedStopsStore";

export function useSavedStops() {
    const stops = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    return { stops, addStop, removeStop };
}
