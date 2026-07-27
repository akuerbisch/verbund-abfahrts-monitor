"use client";

import { Flag01 } from "@untitledui/icons";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import type { JiraProjectSearchStatus } from "@/hooks/useJiraProjectSearch";
import type { JiraProject } from "@/lib/jira/parseProjects";

interface JiraProjectSearchResultsProps {
    projects: JiraProject[];
    status: JiraProjectSearchStatus;
    onSelect: (project: JiraProject) => void;
}

export function JiraProjectSearchResults({ projects, status, onSelect }: JiraProjectSearchResultsProps) {
    return (
        <div className="absolute top-full z-10 mt-1.5 w-full rounded-lg bg-primary shadow-lg ring-1 ring-secondary_alt">
            {status === "loading" && (
                <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-tertiary">
                    <LoadingIndicator size="sm" />
                    Searching…
                </div>
            )}

            {status === "error" && <div className="px-4 py-6 text-sm text-error-primary">Couldn&apos;t search for projects. Please try again.</div>}

            {status === "success" && projects.length === 0 && <div className="px-4 py-6 text-sm text-tertiary">No Jira projects found.</div>}

            {status === "success" && projects.length > 0 && (
                <ul className="max-h-72 overflow-y-auto py-1">
                    {projects.map((project) => (
                        <li key={project.id}>
                            <button
                                type="button"
                                onClick={() => onSelect(project)}
                                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-secondary hover:bg-primary_hover"
                            >
                                <Flag01 className="size-4 shrink-0 text-fg-quaternary" />
                                <span className="truncate">
                                    {project.key} · {project.name}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
