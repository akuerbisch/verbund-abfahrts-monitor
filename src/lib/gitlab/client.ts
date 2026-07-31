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

/**
 * Calls the GitLab REST API server-side. The access token comes from the
 * caller (sourced from the request itself, not a server-held secret — this
 * server never has a standing GitLab credential of its own) and is sent via
 * the PRIVATE-TOKEN header GitLab access tokens use, never Authorization:
 * Bearer.
 */
export async function callGitlabApi(token: string, path: string, searchParams?: Record<string, string>, timeoutMs = 8000): Promise<unknown> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const url = new URL(`${getGitlabBaseUrl()}/api/v4${path}`);
        for (const [key, value] of Object.entries(searchParams ?? {})) {
            url.searchParams.set(key, value);
        }

        const response = await fetch(url, {
            headers: { "PRIVATE-TOKEN": token },
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
