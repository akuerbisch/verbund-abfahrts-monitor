"use client";

import { AddCardButton } from "@/components/dashboard/AddCardButton";
import { DepartureCard } from "@/components/dashboard/DepartureCard";
import { GitlabMergeRequestsCard } from "@/components/dashboard/GitlabMergeRequestsCard";
import type { CardConfigPatch } from "@/lib/storage/cards";
import type { CardConfig } from "@/types/domain";

interface DashboardProps {
    cards: CardConfig[];
    onCreateDeparturesCard: () => void;
    onCreateGitlabCard: () => void;
    onUpdateCard: (id: string, patch: CardConfigPatch) => void;
    onRemoveCard: (id: string) => void;
}

export function Dashboard({ cards, onCreateDeparturesCard, onCreateGitlabCard, onUpdateCard, onRemoveCard }: DashboardProps) {
    return (
        <div className="flex flex-col gap-4">
            {cards.length === 0 && <p className="text-sm text-tertiary">No cards yet — add one to start showing departures or merge requests.</p>}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {cards.map((card) =>
                    card.type === "departures" ? (
                        <DepartureCard
                            key={card.id}
                            card={card}
                            onUpdate={(patch) => onUpdateCard(card.id, patch)}
                            onRemove={() => onRemoveCard(card.id)}
                        />
                    ) : (
                        <GitlabMergeRequestsCard
                            key={card.id}
                            card={card}
                            onUpdate={(patch) => onUpdateCard(card.id, patch)}
                            onRemove={() => onRemoveCard(card.id)}
                        />
                    ),
                )}

                <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-secondary p-5">
                    <AddCardButton onCreateDeparturesCard={onCreateDeparturesCard} onCreateGitlabCard={onCreateGitlabCard} />
                </div>
            </div>
        </div>
    );
}
