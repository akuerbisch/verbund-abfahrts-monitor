"use client";

import { useSyncExternalStore } from "react";
import { getServerSnapshot, getSnapshot, setPollingPaused, subscribe } from "@/lib/storage/pollingPausedStore";

export function usePollingPaused() {
    const isPaused = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    return { isPaused, setPollingPaused };
}
