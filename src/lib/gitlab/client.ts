const DEFAULT_GITLAB_BASE_URL = "https://gitlab.wirecube.at";

export class GitlabUpstreamError extends Error {
    constructor(
        message: string,
        public readonly status?: number,
    ) {
        super(message);
        this.name = "GitlabUpstreamError";
    }
}

export class GitlabTimeoutError extends Error {
    constructor(message = "GitLab upstream request timed out") {
        super(message);
        this.name = "GitlabTimeoutError";
    }
}

function getGitlabBaseUrl(): string {
    return process.env.GITLAB_BASE_URL || DEFAULT_GITLAB_BASE_URL;
}

function getGitlabToken(): string {
    const token = process.env.GITLAB_ACCESS_TOKEN;
    if (!token) {
        throw new GitlabUpstreamError("GITLAB_ACCESS_TOKEN is not configured on the server");
    }
    return token;
}

/**
 * Calls the GitLab REST API server-side. The access token is read fresh on
 * every call (never cached at module load) and sent via the PRIVATE-TOKEN
 * header GitLab access tokens use — never Authorization: Bearer, and never
 * forwarded to the client, which only ever talks to our own /api/gitlab/*
 * routes.
 */
export async function callGitlabApi(path: string, searchParams?: Record<string, string>, timeoutMs = 8000): Promise<unknown> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const url = new URL(`${getGitlabBaseUrl()}/api/v4${path}`);
        for (const [key, value] of Object.entries(searchParams ?? {})) {
            url.searchParams.set(key, value);
        }

        const response = await fetch(url, {
            headers: { "PRIVATE-TOKEN": getGitlabToken() },
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new GitlabUpstreamError(`GitLab API responded with HTTP ${response.status}`, response.status);
        }

        return await response.json();
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            throw new GitlabTimeoutError();
        }
        if (error instanceof GitlabUpstreamError) {
            throw error;
        }
        throw new GitlabUpstreamError(error instanceof Error ? error.message : "Unknown GitLab upstream error");
    } finally {
        clearTimeout(timeout);
    }
}
