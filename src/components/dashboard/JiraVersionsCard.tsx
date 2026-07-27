"use client";

import { useEffect, useState } from "react";
import { Flag01, Settings01, Trash01, X } from "@untitledui/icons";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { CARD_MAX_HEIGHT_CLASS } from "@/components/dashboard/cardLayout";
import { DragHandle } from "@/components/dashboard/DragHandle";
import type { DragHandleProps } from "@/components/dashboard/SortableCard";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { JiraProjectSearchBox } from "@/components/jira/JiraProjectSearchBox";
import { VersionRow } from "@/components/dashboard/VersionRow";
import { JiraVersionSortOrderControl } from "@/components/settings/JiraVersionSortOrderControl";
import { useJiraVersions } from "@/hooks/useJiraVersions";
import { sortJiraVersions } from "@/lib/jira/parseVersions";
import { showToast } from "@/lib/toast/toastStore";
import type { JiraVersionsCardConfig } from "@/types/domain";

interface JiraVersionsCardProps {
    card: JiraVersionsCardConfig;
    dragHandleProps: DragHandleProps;
    onUpdate: (patch: Partial<Omit<JiraVersionsCardConfig, "id" | "type" | "createdAt">>) => void;
    onRemove: () => void;
}

export function JiraVersionsCard({ card, dragHandleProps, onUpdate, onRemove }: JiraVersionsCardProps) {
    const [isChangingProject, setIsChangingProject] = useState(!card.projectId);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const { versions, status } = useJiraVersions(card.projectId);
    // The API route already filters to unreleased versions and pre-sorts by
    // the default order — re-sort client-side to honor the card's own setting.
    const visibleVersions = sortJiraVersions(versions, card.sortOrder);

    useEffect(() => {
        if (status === "error") {
            showToast({ variant: "error", title: "Couldn't load release versions", description: card.projectName ?? undefined });
        } else if (status === "stale-error") {
            showToast({
                variant: "warning",
                title: "Live update failed",
                description: card.projectName ? `Showing last known versions for ${card.projectName}` : "Showing last known versions",
            });
        }
    }, [status, card.projectName]);

    const openChangeProject = () => {
        setIsChangingProject(true);
        setIsSettingsOpen(false);
    };

    const toggleSettings = () => {
        setIsSettingsOpen((prev) => !prev);
        setIsChangingProject(false);
    };

    return (
        <div className={`flex flex-col rounded-xl bg-primary p-5 shadow-xs ring-1 ring-secondary_alt ${CARD_MAX_HEIGHT_CLASS}`}>
            <div className="flex shrink-0 items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                    <DragHandle {...dragHandleProps} />
                    <h2 className="truncate text-md font-semibold text-primary" title={card.projectName ?? undefined}>
                        {card.projectName ?? "New Jira card"}
                    </h2>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                    {!isChangingProject && <ButtonUtility icon={Flag01} tooltip="Change project" size="sm" color="tertiary" onClick={openChangeProject} />}
                    {!isChangingProject && card.projectId && (
                        <ButtonUtility icon={Settings01} tooltip="Card settings" size="sm" color="tertiary" onClick={toggleSettings} />
                    )}
                    <ButtonUtility icon={Trash01} tooltip="Remove card" size="sm" color="tertiary" onClick={onRemove} />
                </div>
            </div>

            {isChangingProject ? (
                // Not wrapped in the scrollable region below — the search dropdown is
                // absolutely positioned and would get clipped by overflow-y-auto.
                <div className="mt-4 flex items-start gap-2">
                    <JiraProjectSearchBox
                        onSelectProject={(project) => {
                            onUpdate({ projectId: project.id, projectKey: project.key, projectName: project.name });
                            setIsChangingProject(false);
                        }}
                    />
                    {card.projectId && <ButtonUtility icon={X} tooltip="Cancel" size="sm" color="tertiary" onClick={() => setIsChangingProject(false)} />}
                </div>
            ) : (
                <div className="min-h-0 flex-1 overflow-y-auto">
                    <>
                        {isSettingsOpen && (
                            <div className="mt-4 flex flex-col gap-4 border-b border-secondary pb-4">
                                <div className="flex flex-wrap items-center gap-4">
                                    <JiraVersionSortOrderControl sortOrder={card.sortOrder} onChange={(sortOrder) => onUpdate({ sortOrder })} />
                                </div>
                            </div>
                        )}

                        {status === "unconfigured" && <p className="py-6 text-sm text-tertiary">Select a project to start showing release versions.</p>}

                        {status === "loading" && (
                            <div className="flex items-center justify-center py-8">
                                <LoadingIndicator size="sm" />
                            </div>
                        )}

                        {status === "error" && <p className="py-6 text-sm text-error-primary">Couldn&apos;t load release versions for this project right now.</p>}

                        {(status === "success" || status === "stale-error") && (
                            <>
                                {status === "stale-error" && (
                                    <p className="mt-2 text-xs text-warning-primary">Showing last known versions — live update failed.</p>
                                )}

                                {visibleVersions.length === 0 ? (
                                    <p className="py-6 text-sm text-tertiary">No unreleased versions.</p>
                                ) : (
                                    <ul className="mt-2 divide-y divide-secondary">
                                        {visibleVersions.map((version) => (
                                            <VersionRow key={version.id} version={version} />
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
