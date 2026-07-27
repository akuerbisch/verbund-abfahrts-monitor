"use client";

import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, rectSwappingStrategy, SortableContext } from "@dnd-kit/sortable";
import { AddCardButton } from "@/components/dashboard/AddCardButton";
import { DepartureCard } from "@/components/dashboard/DepartureCard";
import { GitlabMergeRequestsCard } from "@/components/dashboard/GitlabMergeRequestsCard";
import { JiraVersionsCard } from "@/components/dashboard/JiraVersionsCard";
import { SortableCard, type DragHandleProps } from "@/components/dashboard/SortableCard";
import type { CardConfigPatch } from "@/lib/storage/cards";
import type { CardConfig } from "@/types/domain";

interface DashboardProps {
    cards: CardConfig[];
    onCreateDeparturesCard: () => void;
    onCreateGitlabCard: () => void;
    onCreateJiraCard: () => void;
    onUpdateCard: (id: string, patch: CardConfigPatch) => void;
    onRemoveCard: (id: string) => void;
    onReorderCards: (orderedIds: string[]) => void;
}

function renderCard(card: CardConfig, dragHandleProps: DragHandleProps, onUpdate: (patch: CardConfigPatch) => void, onRemove: () => void) {
    switch (card.type) {
        case "departures":
            return <DepartureCard card={card} dragHandleProps={dragHandleProps} onUpdate={onUpdate} onRemove={onRemove} />;
        case "gitlab-merge-requests":
            return <GitlabMergeRequestsCard card={card} dragHandleProps={dragHandleProps} onUpdate={onUpdate} onRemove={onRemove} />;
        case "jira-release-versions":
            return <JiraVersionsCard card={card} dragHandleProps={dragHandleProps} onUpdate={onUpdate} onRemove={onRemove} />;
        default: {
            const exhaustiveCheck: never = card;
            return exhaustiveCheck;
        }
    }
}

export function Dashboard({ cards, onCreateDeparturesCard, onCreateGitlabCard, onCreateJiraCard, onUpdateCard, onRemoveCard, onReorderCards }: DashboardProps) {
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        if (!over || active.id === over.id) return;

        const oldIndex = cards.findIndex((card) => card.id === active.id);
        const newIndex = cards.findIndex((card) => card.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        onReorderCards(arrayMove(cards, oldIndex, newIndex).map((card) => card.id));
    };

    return (
        <div className="flex flex-col gap-4">
            {cards.length === 0 && (
                <p className="text-sm text-tertiary">No cards yet — add one to start showing departures, merge requests, or release versions.</p>
            )}

            {/* CSS columns instead of grid — each card keeps its own height and flows
                into the next column, rather than every card in a row being stretched
                to match the tallest one. */}
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5">
                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    <SortableContext items={cards.map((card) => card.id)} strategy={rectSwappingStrategy}>
                        {cards.map((card) => (
                            <SortableCard key={card.id} id={card.id}>
                                {(dragHandleProps) => renderCard(card, dragHandleProps, (patch) => onUpdateCard(card.id, patch), () => onRemoveCard(card.id))}
                            </SortableCard>
                        ))}
                    </SortableContext>
                </DndContext>

                <div className="mb-4 flex min-h-40 items-center justify-center break-inside-avoid rounded-xl border border-dashed border-secondary p-5">
                    <AddCardButton onCreateDeparturesCard={onCreateDeparturesCard} onCreateGitlabCard={onCreateGitlabCard} onCreateJiraCard={onCreateJiraCard} />
                </div>
            </div>
        </div>
    );
}
