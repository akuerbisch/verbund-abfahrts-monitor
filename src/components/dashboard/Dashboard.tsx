"use client";

import { AddCardButton } from "@/components/dashboard/AddCardButton";
import { DepartureCard } from "@/components/dashboard/DepartureCard";
import type { DepartureCardConfig } from "@/types/domain";

interface DashboardProps {
    cards: DepartureCardConfig[];
    onCreateDeparturesCard: () => void;
    onUpdateCard: (id: string, patch: Partial<Omit<DepartureCardConfig, "id" | "type" | "createdAt">>) => void;
    onRemoveCard: (id: string) => void;
}

export function Dashboard({ cards, onCreateDeparturesCard, onUpdateCard, onRemoveCard }: DashboardProps) {
    return (
        <div className="flex flex-col gap-4">
            {cards.length === 0 && <p className="text-sm text-tertiary">No cards yet — add one to start showing departures.</p>}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map((card) => (
                    <DepartureCard
                        key={card.id}
                        card={card}
                        onUpdate={(patch) => onUpdateCard(card.id, patch)}
                        onRemove={() => onRemoveCard(card.id)}
                    />
                ))}

                <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-secondary p-5">
                    <AddCardButton onCreateDeparturesCard={onCreateDeparturesCard} />
                </div>
            </div>
        </div>
    );
}
