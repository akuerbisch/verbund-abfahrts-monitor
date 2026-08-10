"use client";

import { useRef, useState } from "react";
import { SearchMd } from "@untitledui/icons";
import { Input } from "@/components/base/input/input";
import { JiraProjectSearchResults } from "@/components/jira/JiraProjectSearchResults";
import { useJiraProjectSearch } from "@/hooks/useJiraProjectSearch";
import type { JiraProject } from "@/lib/jira/parseProjects";

interface JiraProjectSearchBoxProps {
    email: string;
    token: string;
    onSelectProject: (project: JiraProject) => void;
}

export function JiraProjectSearchBox({ email, token, onSelectProject }: JiraProjectSearchBoxProps) {
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { projects, status } = useJiraProjectSearch(query, email, token);

    const handleSelect = (project: JiraProject) => {
        onSelectProject(project);
        setQuery("");
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full max-w-md"
            onBlur={(event) => {
                if (!containerRef.current?.contains(event.relatedTarget)) setIsFocused(false);
            }}
        >
            <Input
                aria-label="Search for a Jira project"
                icon={SearchMd}
                placeholder="Search Jira projects…"
                value={query}
                onChange={setQuery}
                onFocus={() => setIsFocused(true)}
            />

            {isFocused && <JiraProjectSearchResults projects={projects} status={status} onSelect={handleSelect} />}
        </div>
    );
}
