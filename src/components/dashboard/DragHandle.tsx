"use client";

import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import { DotsGrid } from "@untitledui/icons";

interface DragHandleProps {
    attributes: DraggableAttributes;
    listeners: DraggableSyntheticListeners;
}

export function DragHandle({ attributes, listeners }: DragHandleProps) {
    return (
        <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label="Drag to reorder"
            className="shrink-0 cursor-grab touch-none text-fg-quaternary hover:text-fg-quaternary_hover active:cursor-grabbing"
        >
            <DotsGrid className="size-4" />
        </button>
    );
}
