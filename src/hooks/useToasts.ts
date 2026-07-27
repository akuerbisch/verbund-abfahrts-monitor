"use client";

import { useSyncExternalStore } from "react";
import { dismissToast, getServerSnapshot, getSnapshot, subscribe } from "@/lib/toast/toastStore";

export function useToasts() {
    const toasts = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    return { toasts, dismissToast };
}
