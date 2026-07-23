"use client";

import { Dashboard } from "@/components/dashboard/Dashboard";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { useCards } from "@/hooks/useCards";

export function DashboardShell() {
    const { cards, createDeparturesCard, createGitlabMergeRequestsCard, updateCard, removeCard } = useCards();

    return (
        <div className="mx-auto flex w-full max-w-container flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
            <header className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                    <h1 className="text-display-xs font-semibold text-primary">Dashboard</h1>
                    <p className="text-sm text-tertiary">Live departures and GitLab merge requests, all in one place.</p>
                </div>
                <ThemeToggle />
            </header>

            <Dashboard
                cards={cards}
                onCreateDeparturesCard={createDeparturesCard}
                onCreateGitlabCard={createGitlabMergeRequestsCard}
                onUpdateCard={updateCard}
                onRemoveCard={removeCard}
            />
        </div>
    );
}
