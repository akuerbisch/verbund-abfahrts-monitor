import { Badge } from "@/components/base/badges/badges";
import type { ParsedMergeRequest } from "@/lib/gitlab/parseMergeRequests";

function approvalLabel(mergeRequest: ParsedMergeRequest): string {
    if (mergeRequest.approved) return "Approved";
    if (mergeRequest.approvalsLeft > 0) return `${mergeRequest.approvalsLeft} needed`;
    return "Pending";
}

export function MergeRequestRow({ mergeRequest }: { mergeRequest: ParsedMergeRequest }) {
    return (
        <li className="flex items-center gap-3 py-3">
            <a
                href={mergeRequest.webUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 truncate text-sm font-medium text-primary hover:underline"
            >
                {mergeRequest.title}
            </a>

            <div className="flex shrink-0 items-center gap-1.5">
                {mergeRequest.author.avatarUrl ? (
                    <img src={mergeRequest.author.avatarUrl} alt="" className="size-5 shrink-0 rounded-full" />
                ) : (
                    <div className="size-5 shrink-0 rounded-full bg-tertiary" />
                )}
                <span className="max-w-24 truncate text-xs text-tertiary">{mergeRequest.author.name}</span>
            </div>

            <Badge color={mergeRequest.approved ? "success" : "gray"} size="sm">
                {approvalLabel(mergeRequest)}
            </Badge>
        </li>
    );
}
