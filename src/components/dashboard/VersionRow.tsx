import { Badge } from "@/components/base/badges/badges";
import { ProgressBar } from "@/components/base/progress-indicators/progress-bar";
import type { ParsedJiraVersion } from "@/lib/jira/parseVersions";

function isOverdue(version: ParsedJiraVersion): boolean {
    if (!version.releaseDate) return false;
    return new Date(version.releaseDate).getTime() < Date.now();
}

function formatDueDate(releaseDate: string | null): string {
    if (!releaseDate) return "No due date";
    return new Date(releaseDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function VersionRow({ version }: { version: ParsedJiraVersion }) {
    const overdue = isOverdue(version);

    return (
        <li className="flex flex-col gap-1.5 py-3">
            <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-primary">{version.name}</span>
                {overdue && (
                    <Badge color="error" size="sm">
                        Overdue
                    </Badge>
                )}
            </div>

            <ProgressBar percent={version.progressPercent} />

            <div className="flex items-center justify-between text-xs text-tertiary">
                <span>
                    {version.resolvedIssueCount}/{version.totalIssueCount} issues resolved
                </span>
                <span>{formatDueDate(version.releaseDate)}</span>
            </div>
        </li>
    );
}
