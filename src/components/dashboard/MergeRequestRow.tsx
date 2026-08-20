import { Badge } from "@/components/base/badges/badges";
import { getMrAgeInDays, getMrAgeIntensity } from "@/lib/gitlab/mrAge";
import type { ParsedMergeRequest } from "@/lib/gitlab/parseMergeRequests";

function approvalLabel(mergeRequest: ParsedMergeRequest): string {
    if (mergeRequest.approved) return "Approved";
    if (mergeRequest.approvalsLeft > 0) return `${mergeRequest.approvalsLeft} needed`;
    return "Pending";
}

// Caps how saturated the age tint gets at full intensity, so row text stays legible even for very old MRs.
const MAX_AGE_TINT_PERCENT = 35;

export function MergeRequestRow({ mergeRequest }: { mergeRequest: ParsedMergeRequest }) {
    const ageIntensity = getMrAgeIntensity(getMrAgeInDays(mergeRequest.createdAt));
    const tintPercent = ageIntensity * MAX_AGE_TINT_PERCENT;

    return (
        <li
            className="flex flex-col gap-1.5 py-3"
            style={{
                backgroundImage: `linear-gradient(to bottom, color-mix(in srgb, var(--background-color-error-solid) ${tintPercent}%, transparent), transparent 80%)`,
            }}
        >
            <a href={mergeRequest.webUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline">
                {mergeRequest.title}
            </a>

            <div className="flex items-center gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-1.5">
                    {mergeRequest.author.avatarUrl ? (
                        <img src={mergeRequest.author.avatarUrl} alt="" className="size-5 shrink-0 rounded-full" />
                    ) : (
                        <div className="size-5 shrink-0 rounded-full bg-tertiary" />
                    )}
                    <span className="truncate text-xs text-tertiary">{mergeRequest.author.name}</span>
                </div>

                <Badge color={mergeRequest.approved ? "success" : "gray"} size="sm">
                    {approvalLabel(mergeRequest)}
                </Badge>
            </div>
        </li>
    );
}
