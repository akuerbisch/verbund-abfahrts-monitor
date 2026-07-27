"use client";

import type { ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DotsGrid } from "@untitledui/icons";

interface SortableCardProps {
    id: string;
    children: ReactNode;
}

export function SortableCard({ id, children }: SortableCardProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : undefined,
    };

    return (
        <div ref={setNodeRef} style={style} className="mb-4 flex items-start gap-1 break-inside-avoid">
            <button
                type="button"
                {...attributes}
                {...listeners}
                aria-label="Drag to reorder"
                className="mt-5 shrink-0 cursor-grab touch-none text-fg-quaternary hover:text-fg-quaternary_hover active:cursor-grabbing"
            >
                <DotsGrid className="size-4" />
            </button>
            <div className="min-w-0 flex-1">{children}</div>
        </div>
    );
}
