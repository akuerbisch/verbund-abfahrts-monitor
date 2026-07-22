"use client";

import { Dashboard } from "@/components/dashboard/Dashboard";
import { useCards } from "@/hooks/useCards";

export function DashboardShell() {
    const { cards, createCard, updateCard, removeCard } = useCards();

    return (
        <div className="mx-auto flex w-full max-w-container flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
            <header className="flex flex-col gap-1">
                <h1 className="text-display-xs font-semibold text-primary">Departure board</h1>
                <p className="text-sm text-tertiary">Live departures for your saved bus and tram stops.</p>
            </header>

            <Dashboard cards={cards} onCreateDeparturesCard={createCard} onUpdateCard={updateCard} onRemoveCard={removeCard} />
        </div>
    );
}
