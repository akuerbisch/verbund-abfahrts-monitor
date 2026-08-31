"use client";

import { useEffect } from "react";

const CHECK_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Reloads the tab shortly after a new version is deployed, so an unattended
 * kiosk display doesn't need someone to walk over and refresh it manually.
 *
 * Deliberately checks the static "/" route's own X-Build-Id header instead of
 * a dedicated API route — Vercel serves a static page from its CDN with no
 * serverless function invocation, so this costs nothing server-side, unlike
 * every other polling hook in this app.
 *
 * Unlike those hooks, this one is NOT gated by usePollingPaused() (that toggle
 * exists to cut cost on the billed third-party-backed /api/* routes — this
 * check isn't one) and does NOT pause on document.visibilitychange (the check
 * is a headers-only static-asset fetch, and a kiosk tab is realistically
 * always foregrounded anyway).
 */
export function useAutoReloadOnDeploy() {
    useEffect(() => {
        const baselineBuildId = document.querySelector('meta[name="build-id"]')?.getAttribute("content");
        if (!baselineBuildId) return;

        const interval = setInterval(() => {
            fetch("/", { method: "HEAD", cache: "no-store" })
                .then((response) => {
                    const currentBuildId = response.headers.get("X-Build-Id");
                    if (currentBuildId && currentBuildId !== baselineBuildId) {
                        window.location.reload();
                    }
                })
                .catch(() => {
                    // Transient network hiccup — just try again next interval.
                });
        }, CHECK_INTERVAL_MS);

        return () => clearInterval(interval);
    }, []);
}
