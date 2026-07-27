"use client";

import { useEffect, useState } from "react";
import { MarkerPin01, Settings01, Trash01, X } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Toggle } from "@/components/base/toggle/toggle";
import { CARD_MAX_HEIGHT_CLASS } from "@/components/dashboard/cardLayout";
import { DepartureRow } from "@/components/dashboard/DepartureRow";
import { DragHandle } from "@/components/dashboard/DragHandle";
import type { DragHandleProps } from "@/components/dashboard/SortableCard";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { LineFilterControl } from "@/components/settings/LineFilterControl";
import { MaxDeparturesPerLineControl } from "@/components/settings/MaxDeparturesPerLineControl";
import { RefreshIntervalControl } from "@/components/settings/RefreshIntervalControl";
import { StopSearchBox } from "@/components/stop-search/StopSearchBox";
import { useStationBoard } from "@/hooks/useStationBoard";
import { showToast } from "@/lib/toast/toastStore";
import { filterDeparturesByLine } from "@/lib/vao/filterDepartures";
import { groupDeparturesByLine } from "@/lib/vao/groupDepartures";
import type { DepartureCardConfig } from "@/types/domain";

interface DepartureCardProps {
    card: DepartureCardConfig;
    dragHandleProps: DragHandleProps;
    onUpdate: (patch: Partial<Omit<DepartureCardConfig, "id" | "type" | "createdAt">>) => void;
    onRemove: () => void;
}

export function DepartureCard({ card, dragHandleProps, onUpdate, onRemove }: DepartureCardProps) {
    const [isChangingStop, setIsChangingStop] = useState(!card.stopLid);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const stop = card.stopName && card.stopLid ? { name: card.stopName, lid: card.stopLid } : null;
    const { departures, status } = useStationBoard(stop, card.refreshIntervalSeconds);

    useEffect(() => {
        if (status === "error") {
            showToast({ variant: "error", title: "Couldn't load departures", description: card.stopName ?? undefined });
        } else if (status === "stale-error") {
            showToast({
                variant: "warning",
                title: "Live update failed",
                description: card.stopName ? `Showing last known departures for ${card.stopName}` : "Showing last known departures",
            });
        }
    }, [status, card.stopName]);

    const availableLines = Array.from(new Set(departures.map((departure) => departure.line))).sort();
    const filteredDepartures = filterDeparturesByLine(departures, card.lineFilter);
    const groups = card.groupByLine ? groupDeparturesByLine(filteredDepartures, card.maxDeparturesPerLine) : null;

    const openChangeStop = () => {
        setIsChangingStop(true);
        setIsSettingsOpen(false);
    };

    const toggleSettings = () => {
        setIsSettingsOpen((prev) => !prev);
        setIsChangingStop(false);
    };

    return (
        <div className={`flex flex-col rounded-xl bg-primary p-5 shadow-xs ring-1 ring-secondary_alt ${CARD_MAX_HEIGHT_CLASS}`}>
            <div className="flex shrink-0 items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                    <DragHandle {...dragHandleProps} />
                    <h2 className="truncate text-md font-semibold text-primary">{card.stopName ?? "New departures card"}</h2>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                    {!isChangingStop && <ButtonUtility icon={MarkerPin01} tooltip="Change stop" size="sm" color="tertiary" onClick={openChangeStop} />}
                    {!isChangingStop && card.stopLid && (
                        <ButtonUtility icon={Settings01} tooltip="Card settings" size="sm" color="tertiary" onClick={toggleSettings} />
                    )}
                    <ButtonUtility icon={Trash01} tooltip="Remove card" size="sm" color="tertiary" onClick={onRemove} />
                </div>
            </div>

            {isChangingStop ? (
                // Not wrapped in the scrollable region below — the search dropdown is
                // absolutely positioned and would get clipped by overflow-y-auto.
                <div className="mt-4 flex items-start gap-2">
                    <StopSearchBox
                        onSelectStop={(result) => {
                            onUpdate({ stopName: result.name, stopLid: result.lid, lineFilter: [] });
                            setIsChangingStop(false);
                        }}
                    />
                    {card.stopLid && <ButtonUtility icon={X} tooltip="Cancel" size="sm" color="tertiary" onClick={() => setIsChangingStop(false)} />}
                </div>
            ) : (
                <div className="min-h-0 flex-1 overflow-y-auto">
                    <>
                        {isSettingsOpen && (
                            <div className="mt-4 flex flex-col gap-4 border-b border-secondary pb-4">
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
                                <LineFilterControl
                                    availableLines={availableLines}
                                    selectedLines={card.lineFilter}
                                    onChange={(lineFilter) => onUpdate({ lineFilter })}
                                />
                            </div>
                        )}

                        {status === "unconfigured" && <p className="py-6 text-sm text-tertiary">Select a stop to start showing departures.</p>}

                        {status === "loading" && (
                            <div className="flex items-center justify-center py-8">
                                <LoadingIndicator size="sm" />
                            </div>
                        )}

                        {status === "error" && <p className="py-6 text-sm text-error-primary">Couldn&apos;t load departures for this stop right now.</p>}

                        {(status === "success" || status === "stale-error") && (
                            <>
                                {status === "stale-error" && (
                                    <p className="mt-2 text-xs text-warning-primary">Showing last known departures — live update failed.</p>
                                )}

                                {filteredDepartures.length === 0 ? (
                                    <p className="py-6 text-sm text-tertiary">No upcoming departures.</p>
                                ) : groups ? (
                                    <div className="mt-2 flex flex-col divide-y divide-secondary">
                                        {groups.map((group) => (
                                            <div key={group.line} className="py-3">
                                                <Badge color="brand" size="md">
                                                    {group.line}
                                                </Badge>
                                                <div className="mt-1 grid grid-cols-2 gap-x-4">
                                                    {group.directionGroups.map((directionGroup) => (
                                                        <div
                                                            key={directionGroup.direction}
                                                            className={group.directionGroups.length === 1 ? "col-span-2" : "min-w-0"}
                                                        >
                                                            <p className="truncate text-xs font-medium text-tertiary">{directionGroup.direction}</p>
                                                            <ul className="divide-y divide-secondary">
                                                                {directionGroup.departures.map((departure, index) => (
                                                                    <DepartureRow key={index} departure={departure} hideLine hideDirection />
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <ul className="mt-2 divide-y divide-secondary">
                                        {filteredDepartures.map((departure, index) => (
                                            <DepartureRow key={`${departure.line}-${departure.direction}-${index}`} departure={departure} />
                                        ))}
                                    </ul>
                                )}
                            </>
                        )}
                    </>
                </div>
            )}
        </div>
    );
}
