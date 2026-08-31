"use client";

import { AppHeader } from "@/components/dashboard/AppHeader";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { ToastViewport } from "@/components/base/toast/ToastViewport";
import { useAutoReloadOnDeploy } from "@/hooks/useAutoReloadOnDeploy";
import { useCards } from "@/hooks/useCards";

export function DashboardShell() {
    const { cards, createDeparturesCard, createGitlabMergeRequestsCard, createJiraVersionsCard, createWeatherCard, updateCard, removeCard, reorderCards } =
        useCards();
    useAutoReloadOnDeploy();

    return (
        <div className="flex min-h-screen flex-col">
            <AppHeader />

            <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
                <Dashboard
                    cards={cards}
                    onCreateDeparturesCard={createDeparturesCard}
                    onCreateGitlabCard={createGitlabMergeRequestsCard}
                    onCreateJiraCard={createJiraVersionsCard}
                    onCreateWeatherCard={createWeatherCard}
                    onUpdateCard={updateCard}
                    onRemoveCard={removeCard}
                    onReorderCards={reorderCards}
                />
            </main>

            <ToastViewport />
        </div>
    );
}
