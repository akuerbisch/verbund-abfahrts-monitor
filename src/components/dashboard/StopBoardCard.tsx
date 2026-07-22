"use client";

import { Trash01 } from "@untitledui/icons";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { DepartureRow } from "@/components/dashboard/DepartureRow";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { useStationBoard } from "@/hooks/useStationBoard";
import type { SavedStop } from "@/types/domain";

interface StopBoardCardProps {
    stop: SavedStop;
    refreshIntervalSeconds: number;
    onRemove: (key: string) => void;
}

export function StopBoardCard({ stop, refreshIntervalSeconds, onRemove }: StopBoardCardProps) {
    const { departures, status } = useStationBoard(stop, refreshIntervalSeconds);

    return (
        <div className="flex flex-col rounded-xl bg-primary p-5 shadow-xs ring-1 ring-secondary_alt">
            <div className="flex items-center justify-between gap-2">
                <h2 className="truncate text-md font-semibold text-primary">{stop.name}</h2>
                <ButtonUtility icon={Trash01} tooltip="Remove stop" size="sm" color="tertiary" onClick={() => onRemove(stop.key)} />
            </div>

            {status === "loading" && (
                <div className="flex items-center justify-center py-8">
                    <LoadingIndicator size="sm" />
                </div>
            )}

            {status === "error" && <p className="py-6 text-sm text-error-primary">Couldn&apos;t load departures for this stop right now.</p>}

            {(status === "success" || status === "stale-error") && (
                <>
                    {status === "stale-error" && <p className="mt-2 text-xs text-warning-primary">Showing last known departures — live update failed.</p>}

                    {departures.length === 0 ? (
                        <p className="py-6 text-sm text-tertiary">No upcoming departures.</p>
                    ) : (
                        <ul className="mt-2 divide-y divide-secondary">
                            {departures.map((departure, index) => (
                                <DepartureRow key={`${departure.line}-${departure.direction}-${index}`} departure={departure} />
                            ))}
                        </ul>
                    )}
                </>
            )}
        </div>
    );
}
