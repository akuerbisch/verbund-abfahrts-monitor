import { NextResponse } from "next/server";
import { callJiraApi, JiraTimeoutError, JiraUpstreamError } from "@/lib/jira/client";
import { filterUnreleasedVersions, parseJiraVersion, parseJiraVersionMeta, sortJiraVersions, type JiraVersionMeta } from "@/lib/jira/parseVersions";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    const body = await request.json().catch(() => null);
    const projectId = typeof body?.projectId === "string" ? body.projectId : null;

    if (!projectId) {
        return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    try {
        const rawVersions = await callJiraApi(`/project/${projectId}/versions`);
        const versionList = Array.isArray(rawVersions) ? rawVersions : [];

        const allMeta = versionList.map(parseJiraVersionMeta).filter((v): v is JiraVersionMeta => v !== null);
        const unreleasedMeta = filterUnreleasedVersions(allMeta);

        const versions = await Promise.all(
            unreleasedMeta.map(async (meta) => {
                // Progress isn't in the versions list response — fetch it per version,
                // tolerating a per-version failure rather than failing the whole card.
                const issueCount = await callJiraApi(`/version/${meta.id}/unresolvedIssueCount`).catch(() => ({}));
                return parseJiraVersion(meta, issueCount);
            }),
        );

        return NextResponse.json({ versions: sortJiraVersions(versions) });
    } catch (error) {
        if (error instanceof JiraTimeoutError) {
            return NextResponse.json({ error: error.message }, { status: 504 });
        }
        if (error instanceof JiraUpstreamError) {
            return NextResponse.json({ error: error.message }, { status: 502 });
        }
        throw error;
    }
}
