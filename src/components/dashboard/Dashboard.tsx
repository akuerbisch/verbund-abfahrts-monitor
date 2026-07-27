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

            {/* CSS columns instead of grid — each card keeps its own height and flows
                into the next column, rather than every card in a row being stretched
                to match the tallest one. */}
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5">
                {cards.map((card) => (
                    <div key={card.id} className="mb-4 break-inside-avoid">
                        {card.type === "departures" ? (
                            <DepartureCard card={card} onUpdate={(patch) => onUpdateCard(card.id, patch)} onRemove={() => onRemoveCard(card.id)} />
                        ) : (
                            <GitlabMergeRequestsCard card={card} onUpdate={(patch) => onUpdateCard(card.id, patch)} onRemove={() => onRemoveCard(card.id)} />
                        )}
                    </div>
                ))}

                <div className="mb-4 flex min-h-40 items-center justify-center break-inside-avoid rounded-xl border border-dashed border-secondary p-5">
                    <AddCardButton onCreateDeparturesCard={onCreateDeparturesCard} onCreateGitlabCard={onCreateGitlabCard} />
                </div>
            </div>
        </div>
    );
}
