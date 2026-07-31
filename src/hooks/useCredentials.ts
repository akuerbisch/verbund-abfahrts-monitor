"use client";

import { useSyncExternalStore } from "react";
import { getServerSnapshot, getSnapshot, patchCredentials, subscribe } from "@/lib/storage/credentialsStore";

export function useCredentials() {
    const credentials = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    return { credentials, updateCredentials: patchCredentials };
}
