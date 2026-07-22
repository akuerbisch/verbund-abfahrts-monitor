"use client";

import { useState } from "react";
import { Settings01, Trash01 } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Toggle } from "@/components/base/toggle/toggle";
import { DepartureRow } from "@/components/dashboard/DepartureRow";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { MaxDeparturesPerLineControl } from "@/components/settings/MaxDeparturesPerLineControl";
import { RefreshIntervalControl } from "@/components/settings/RefreshIntervalControl";
import { StopSearchBox } from "@/components/stop-search/StopSearchBox";
import { useStationBoard } from "@/hooks/useStationBoard";
import { groupDeparturesByLine } from "@/lib/vao/groupDepartures";
import type { DepartureCardConfig } from "@/types/domain";

interface DepartureCardProps {
    card: DepartureCardConfig;
    onUpdate: (patch: Partial<Omit<DepartureCardConfig, "id" | "type" | "createdAt">>) => void;
    onRemove: () => void;
}

export function DepartureCard({ card, onUpdate, onRemove }: DepartureCardProps) {
    const [isEditing, setIsEditing] = useState(!card.stopLid);
    const stop = card.stopName && card.stopLid ? { name: card.stopName, lid: card.stopLid } : null;
    const { departures, status } = useStationBoard(stop, card.refreshIntervalSeconds);

    const groups = card.groupByLine ? groupDeparturesByLine(departures, card.maxDeparturesPerLine) : null;

    return (
        <div className="flex flex-col rounded-xl bg-primary p-5 shadow-xs ring-1 ring-secondary_alt">
            <div className="flex items-center justify-between gap-2">
                <h2 className="truncate text-md font-semibold text-primary">{card.stopName ?? "New departures card"}</h2>
                <div className="flex shrink-0 items-center gap-1">
                    <ButtonUtility icon={Settings01} tooltip="Card settings" size="sm" color="tertiary" onClick={() => setIsEditing((prev) => !prev)} />
                    <ButtonUtility icon={Trash01} tooltip="Remove card" size="sm" color="tertiary" onClick={onRemove} />
                </div>
            </div>

            {isEditing && (
                <div className="mt-4 flex flex-col gap-4 border-b border-secondary pb-4">
                    <StopSearchBox onSelectStop={(result) => onUpdate({ stopName: result.name, stopLid: result.lid })} />
                    <div className="flex flex-wrap items-center gap-4">
                        <RefreshIntervalControl
                            refreshIntervalSeconds={card.refreshIntervalSeconds}
                            onChange={(seconds) => onUpdate({ refreshIntervalSeconds: seconds })}
                        />
                        <Toggle label="Group by line" isSelected={card.groupByLine} onChange={(groupByLine) => onUpdate({ groupByLine })} />
                        {card.groupByLine && (
                            <MaxDeparturesPerLineControl
                                maxDeparturesPerLine={card.maxDeparturesPerLine}
                                onChange={(count) => onUpdate({ maxDeparturesPerLine: count })}
                            />
                        )}
                    </div>
                </div>
            )}

            {status === "unconfigured" && !isEditing && <p className="py-6 text-sm text-tertiary">Select a stop to start showing departures.</p>}

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
                    ) : groups ? (
                        <div className="mt-2 flex flex-col divide-y divide-secondary">
                            {groups.map((group) => (
                                <div key={`${group.line}-${group.direction}`} className="py-3">
                                    <div className="flex items-center gap-2">
                                        <Badge color="brand" size="md">
                                            {group.line}
                                        </Badge>
                                        <span className="truncate text-sm text-tertiary">{group.direction}</span>
                                    </div>
                                    <ul className="mt-1 divide-y divide-secondary">
                                        {group.departures.map((departure, index) => (
                                            <DepartureRow key={index} departure={departure} hideLine hideDirection />
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
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
