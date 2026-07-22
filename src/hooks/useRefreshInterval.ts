"use client";

import { useSyncExternalStore } from "react";
import { getServerSnapshot, getSnapshot, setRefreshIntervalSeconds, subscribe } from "@/lib/storage/preferencesStore";

export function useRefreshInterval() {
    const refreshIntervalSeconds = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    return { refreshIntervalSeconds, setRefreshIntervalSeconds };
}
