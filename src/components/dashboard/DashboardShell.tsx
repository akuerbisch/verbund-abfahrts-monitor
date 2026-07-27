"use client";

import { AppHeader } from "@/components/dashboard/AppHeader";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { useCards } from "@/hooks/useCards";

export function DashboardShell() {
    const { cards, createDeparturesCard, createGitlabMergeRequestsCard, createJiraVersionsCard, updateCard, removeCard, reorderCards } = useCards();

    return (
        <div className="flex min-h-screen flex-col">
            <AppHeader />

            <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
                <Dashboard
                    cards={cards}
                    onCreateDeparturesCard={createDeparturesCard}
                    onCreateGitlabCard={createGitlabMergeRequestsCard}
                    onCreateJiraCard={createJiraVersionsCard}
                    onUpdateCard={updateCard}
                    onRemoveCard={removeCard}
                    onReorderCards={reorderCards}
                />
            </main>
        </div>
    );
}
