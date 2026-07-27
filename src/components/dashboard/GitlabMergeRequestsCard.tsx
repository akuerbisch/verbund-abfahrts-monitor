"use client";

import { useState } from "react";
import { GitBranch01, Settings01, Trash01, X } from "@untitledui/icons";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Toggle } from "@/components/base/toggle/toggle";
import { CARD_MAX_HEIGHT_CLASS } from "@/components/dashboard/cardLayout";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { GitlabProjectSearchBox } from "@/components/gitlab/GitlabProjectSearchBox";
import { MergeRequestRow } from "@/components/dashboard/MergeRequestRow";
import { useGitlabMergeRequests } from "@/hooks/useGitlabMergeRequests";
import { filterDraftMergeRequests } from "@/lib/gitlab/parseMergeRequests";
import type { GitlabMergeRequestsCardConfig } from "@/types/domain";

interface GitlabMergeRequestsCardProps {
    card: GitlabMergeRequestsCardConfig;
    onUpdate: (patch: Partial<Omit<GitlabMergeRequestsCardConfig, "id" | "type" | "createdAt">>) => void;
    onRemove: () => void;
}

export function GitlabMergeRequestsCard({ card, onUpdate, onRemove }: GitlabMergeRequestsCardProps) {
    const [isChangingProject, setIsChangingProject] = useState(!card.projectId);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const { mergeRequests, status } = useGitlabMergeRequests(card.projectId);
    const visibleMergeRequests = filterDraftMergeRequests(mergeRequests, card.hideDrafts);

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
                <h2 className="truncate text-md font-semibold text-primary">{card.projectName ?? "New GitLab card"}</h2>
                <div className="flex shrink-0 items-center gap-1">
                    {!isChangingProject && <ButtonUtility icon={GitBranch01} tooltip="Change project" size="sm" color="tertiary" onClick={openChangeProject} />}
                    {!isChangingProject && card.projectId && (
                        <ButtonUtility icon={Settings01} tooltip="Card settings" size="sm" color="tertiary" onClick={toggleSettings} />
                    )}
                    <ButtonUtility icon={Trash01} tooltip="Remove card" size="sm" color="tertiary" onClick={onRemove} />
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
                {isChangingProject ? (
                    <div className="mt-4 flex items-start gap-2">
                        <GitlabProjectSearchBox
                            onSelectProject={(project) => {
                                onUpdate({ projectId: project.id, projectName: project.pathWithNamespace });
                                setIsChangingProject(false);
                            }}
                        />
                        {card.projectId && <ButtonUtility icon={X} tooltip="Cancel" size="sm" color="tertiary" onClick={() => setIsChangingProject(false)} />}
                    </div>
                ) : (
                    <>
                        {isSettingsOpen && (
                            <div className="mt-4 flex flex-col gap-4 border-b border-secondary pb-4">
                                <Toggle label="Hide draft MRs" isSelected={card.hideDrafts} onChange={(hideDrafts) => onUpdate({ hideDrafts })} />
                            </div>
                        )}

                        {status === "unconfigured" && <p className="py-6 text-sm text-tertiary">Select a project to start showing merge requests.</p>}

                        {status === "loading" && (
                            <div className="flex items-center justify-center py-8">
                                <LoadingIndicator size="sm" />
                            </div>
                        )}

                        {status === "error" && <p className="py-6 text-sm text-error-primary">Couldn&apos;t load merge requests for this project right now.</p>}

                        {(status === "success" || status === "stale-error") && (
                            <>
                                {status === "stale-error" && (
                                    <p className="mt-2 text-xs text-warning-primary">Showing last known merge requests — live update failed.</p>
                                )}

                                {visibleMergeRequests.length === 0 ? (
                                    <p className="py-6 text-sm text-tertiary">No open merge requests.</p>
                                ) : (
                                    <ul className="mt-2 divide-y divide-secondary">
                                        {visibleMergeRequests.map((mergeRequest) => (
                                            <MergeRequestRow key={mergeRequest.id} mergeRequest={mergeRequest} />
                                        ))}
                                    </ul>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
