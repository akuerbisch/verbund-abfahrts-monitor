"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * True only after the client has hydrated. Avoids the classic
 * useEffect+setState "mounted" flag (which this project's stricter
 * react-hooks lint rules flag) by leaning on useSyncExternalStore's built-in
 * server/client snapshot split instead.
 */
export function useHasMounted(): boolean {
    return useSyncExternalStore(
        subscribe,
        () => true,
        () => false,
    );
}
