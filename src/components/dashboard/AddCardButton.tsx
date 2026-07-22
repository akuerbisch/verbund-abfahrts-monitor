"use client";

import { Bus, Plus } from "@untitledui/icons";
import { Menu, MenuItem, MenuTrigger, Popover } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";

interface AddCardButtonProps {
    onCreateDeparturesCard: () => void;
}

export function AddCardButton({ onCreateDeparturesCard }: AddCardButtonProps) {
    return (
        <MenuTrigger>
            <Button color="secondary" size="md" iconLeading={Plus}>
                Add card
            </Button>

            <Popover
                placement="bottom start"
                className="w-56 origin-(--trigger-anchor-point) overflow-auto rounded-lg bg-primary py-1 shadow-lg ring-1 ring-secondary_alt will-change-transform"
            >
                <Menu className="outline-hidden select-none">
                    <MenuItem
                        id="departures"
                        textValue="Departures"
                        onAction={onCreateDeparturesCard}
                        className={({ isFocused }) =>
                            cx(
                                "mx-1 flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm font-semibold text-secondary outline-hidden",
                                isFocused && "bg-primary_hover",
                            )
                        }
                    >
                        <Bus aria-hidden="true" className="size-4 shrink-0 stroke-[2.25px] text-fg-quaternary" />
                        Departures
                    </MenuItem>
                </Menu>
            </Popover>
        </MenuTrigger>
    );
}
