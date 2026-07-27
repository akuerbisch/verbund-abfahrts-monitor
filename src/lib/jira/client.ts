const DEFAULT_JIRA_BASE_URL = "https://wirecube.atlassian.net";
const JIRA_API_GATEWAY = "https://api.atlassian.com";

export class JiraUpstreamError extends Error {
    constructor(
        message: string,
        public readonly status?: number,
    ) {
        super(message);
        this.name = "JiraUpstreamError";
    }
}

export class JiraTimeoutError extends Error {
    constructor(message = "Jira upstream request timed out") {
        super(message);
        this.name = "JiraTimeoutError";
    }
}

function getJiraBaseUrl(): string {
    return process.env.JIRA_BASE_URL || DEFAULT_JIRA_BASE_URL;
}

function getJiraToken(): string {
    const token = process.env.JIRA_TOKEN;
    if (!token) {
        throw new JiraUpstreamError("JIRA_TOKEN is not configured on the server");
    }
    return token;
}

let cachedCloudId: string | null = null;

/**
 * A Jira API token *with scopes* isn't authenticated with Basic auth against
 * the site domain — Atlassian routes those through the API gateway instead,
 * keyed by the site's cloud id rather than its hostname (using Basic auth
 * against the site domain doesn't error, it just silently falls through to
 * an unauthenticated context that can't see any project). The cloud id is
 * public, unauthenticated site metadata, so it's resolved once per server
 * instance and cached rather than re-fetched on every call.
 */
async function getJiraCloudId(signal: AbortSignal): Promise<string> {
    if (cachedCloudId) return cachedCloudId;

    const response = await fetch(`${getJiraBaseUrl()}/_edge/tenant_info`, { signal });
    if (!response.ok) {
        throw new JiraUpstreamError(`Failed to resolve Jira cloud id (HTTP ${response.status})`, response.status);
    }

    const data = (await response.json()) as { cloudId?: unknown };
    if (typeof data.cloudId !== "string") {
        throw new JiraUpstreamError("Jira tenant_info response did not include a cloudId");
    }

    cachedCloudId = data.cloudId;
    return cachedCloudId;
}

/**
 * Calls the Jira Cloud REST API v3 server-side, via the api.atlassian.com
 * gateway (required for scoped API tokens) rather than the site domain
 * directly. The token is read fresh on every call (never cached at module
 * load) and sent as a Bearer token — never forwarded to the client, which
 * only ever talks to our own /api/jira/* routes.
 */
export async function callJiraApi(path: string, searchParams?: Record<string, string>, timeoutMs = 8000): Promise<unknown> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const cloudId = await getJiraCloudId(controller.signal);

        const url = new URL(`${JIRA_API_GATEWAY}/ex/jira/${cloudId}/rest/api/3${path}`);
        for (const [key, value] of Object.entries(searchParams ?? {})) {
            url.searchParams.set(key, value);
        }

        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${getJiraToken()}`, Accept: "application/json" },
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new JiraUpstreamError(`Jira API responded with HTTP ${response.status}`, response.status);
        }

        return await response.json();
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            throw new JiraTimeoutError();
        }
        if (error instanceof JiraUpstreamError) {
            throw error;
        }
        throw new JiraUpstreamError(error instanceof Error ? error.message : "Unknown Jira upstream error");
    } finally {
        clearTimeout(timeout);
    }
}
