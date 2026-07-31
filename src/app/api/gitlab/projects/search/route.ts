import { NextResponse } from "next/server";
import { callGitlabApi, GitlabTimeoutError, GitlabUpstreamError } from "@/lib/gitlab/client";
import { parseGitlabProjectsResponse } from "@/lib/gitlab/parseProjects";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    const token = request.headers.get("x-gitlab-token");
    if (!token) {
        return NextResponse.json({ error: "Missing GitLab access token" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const query = typeof body?.query === "string" ? body.query.trim() : "";

    try {
        const raw = await callGitlabApi(token, "/projects", {
            membership: "true",
            simple: "true",
            order_by: "name",
            per_page: "50",
            ...(query ? { search: query } : {}),
        });
        return NextResponse.json({ projects: parseGitlabProjectsResponse(raw) });
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
