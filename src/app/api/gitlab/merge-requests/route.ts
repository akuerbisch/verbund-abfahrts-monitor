import { NextResponse } from "next/server";
import { callGitlabApi, GitlabTimeoutError, GitlabUpstreamError } from "@/lib/gitlab/client";
import { parseMergeRequest, sortMergeRequestsByAge, type ParsedMergeRequest } from "@/lib/gitlab/parseMergeRequests";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    const body = await request.json().catch(() => null);
    const projectId = typeof body?.projectId === "number" ? body.projectId : null;

    if (projectId === null) {
        return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    try {
        const rawMergeRequests = await callGitlabApi(`/projects/${projectId}/merge_requests`, {
            state: "opened",
            order_by: "created_at",
            sort: "asc",
        });

        const mrList = Array.isArray(rawMergeRequests) ? rawMergeRequests : [];

        const mergeRequests = await Promise.all(
            mrList.map(async (mr) => {
                const iid = (mr as { iid?: unknown } | null)?.iid;
                if (typeof iid !== "number") return parseMergeRequest(mr, {});

                // Approval state isn't in the list response — fetch it per MR, tolerating a
                // per-MR failure rather than failing the whole card.
                const approvals = await callGitlabApi(`/projects/${projectId}/merge_requests/${iid}/approvals`).catch(() => ({}));
                return parseMergeRequest(mr, approvals);
            }),
        );

        const parsed = mergeRequests.filter((mr): mr is ParsedMergeRequest => mr !== null);
        return NextResponse.json({ mergeRequests: sortMergeRequestsByAge(parsed) });
    } catch (error) {
        if (error instanceof GitlabTimeoutError) {
            return NextResponse.json({ error: error.message }, { status: 504 });
        }
        if (error instanceof GitlabUpstreamError) {
            return NextResponse.json({ error: error.message }, { status: 502 });
        }
        throw error;
    }
}
