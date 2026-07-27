"use client";

import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface DragHandleProps {
    attributes: DraggableAttributes;
    listeners: DraggableSyntheticListeners;
}

interface SortableCardProps {
    id: string;
    children: (dragHandleProps: DragHandleProps) => React.ReactNode;
}

export function SortableCard({ id, children }: SortableCardProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : undefined,
    };

    return (
        <div ref={setNodeRef} style={style} className="mb-4 break-inside-avoid">
            {children({ attributes, listeners })}
        </div>
    );
}
