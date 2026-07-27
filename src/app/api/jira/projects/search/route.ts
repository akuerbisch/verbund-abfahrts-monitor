import { NextResponse } from "next/server";
import { callJiraApi, JiraTimeoutError, JiraUpstreamError } from "@/lib/jira/client";
import { parseJiraProjectsResponse } from "@/lib/jira/parseProjects";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    const body = await request.json().catch(() => null);
    const query = typeof body?.query === "string" ? body.query.trim() : "";

    try {
        const raw = await callJiraApi("/project/search", {
            orderBy: "name",
            maxResults: "50",
            ...(query ? { query } : {}),
        });
        return NextResponse.json({ projects: parseJiraProjectsResponse(raw) });
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
