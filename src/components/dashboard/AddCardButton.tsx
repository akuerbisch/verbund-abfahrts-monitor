"use client";

import { Bus, Flag01, GitPullRequest, Plus, Sun } from "@untitledui/icons";
import { Menu, MenuItem, MenuTrigger, Popover } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";

interface AddCardButtonProps {
    onCreateDeparturesCard: () => void;
    onCreateGitlabCard: () => void;
    onCreateJiraCard: () => void;
    onCreateWeatherCard: () => void;
}

const menuItemClassName = ({ isFocused }: { isFocused: boolean }) =>
    cx(
        "mx-1 flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm font-semibold text-secondary outline-hidden",
        isFocused && "bg-primary_hover",
    );

export function AddCardButton({ onCreateDeparturesCard, onCreateGitlabCard, onCreateJiraCard, onCreateWeatherCard }: AddCardButtonProps) {
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
                    <MenuItem id="departures" textValue="Departures" onAction={onCreateDeparturesCard} className={menuItemClassName}>
                        <Bus aria-hidden="true" className="size-4 shrink-0 stroke-[2.25px] text-fg-quaternary" />
                        Departures
                    </MenuItem>
                    <MenuItem id="gitlab-merge-requests" textValue="GitLab merge requests" onAction={onCreateGitlabCard} className={menuItemClassName}>
                        <GitPullRequest aria-hidden="true" className="size-4 shrink-0 stroke-[2.25px] text-fg-quaternary" />
                        GitLab merge requests
                    </MenuItem>
                    <MenuItem id="jira-release-versions" textValue="Jira release versions" onAction={onCreateJiraCard} className={menuItemClassName}>
                        <Flag01 aria-hidden="true" className="size-4 shrink-0 stroke-[2.25px] text-fg-quaternary" />
                        Jira release versions
                    </MenuItem>
                    <MenuItem id="weather" textValue="Weather" onAction={onCreateWeatherCard} className={menuItemClassName}>
                        <Sun aria-hidden="true" className="size-4 shrink-0 stroke-[2.25px] text-fg-quaternary" />
                        Weather
                    </MenuItem>
                </Menu>
            </Popover>
        </MenuTrigger>
    );
}
