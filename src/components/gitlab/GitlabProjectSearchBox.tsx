"use client";

import { useRef, useState } from "react";
import { SearchMd } from "@untitledui/icons";
import { Input } from "@/components/base/input/input";
import { GitlabProjectSearchResults } from "@/components/gitlab/GitlabProjectSearchResults";
import { useGitlabProjectSearch } from "@/hooks/useGitlabProjectSearch";
import type { GitlabProject } from "@/lib/gitlab/parseProjects";

interface GitlabProjectSearchBoxProps {
    onSelectProject: (project: GitlabProject) => void;
}

export function GitlabProjectSearchBox({ onSelectProject }: GitlabProjectSearchBoxProps) {
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { projects, status } = useGitlabProjectSearch(query);

    const handleSelect = (project: GitlabProject) => {
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
                aria-label="Search for a GitLab project"
                icon={SearchMd}
                placeholder="Search accessible projects…"
                value={query}
                onChange={setQuery}
                onFocus={() => setIsFocused(true)}
            />

            {isFocused && <GitlabProjectSearchResults projects={projects} status={status} onSelect={handleSelect} />}
        </div>
    );
}
