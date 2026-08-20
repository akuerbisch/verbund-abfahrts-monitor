"use client";

import { PauseCircle, PlayCircle } from "@untitledui/icons";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { usePollingPaused } from "@/hooks/usePollingPaused";

export function PollingPauseToggle() {
    const { isPaused, setPollingPaused } = usePollingPaused();

    return (
        <ButtonUtility
            icon={isPaused ? PlayCircle : PauseCircle}
            tooltip={isPaused ? "Resume live updates" : "Pause live updates"}
            size="sm"
            color="tertiary"
            onClick={() => setPollingPaused(!isPaused)}
        />
    );
}
