const DEFAULT_JIRA_BASE_URL = "https://wirecube.atlassian.net";

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

function getJiraEmail(): string {
    const email = process.env.JIRA_EMAIL;
    if (!email) {
        throw new JiraUpstreamError("JIRA_EMAIL is not configured on the server");
    }
    return email;
}

function getJiraToken(): string {
    const token = process.env.JIRA_TOKEN;
    if (!token) {
        throw new JiraUpstreamError("JIRA_TOKEN is not configured on the server");
    }
    return token;
}

/**
 * Calls the Jira Cloud REST API v3 server-side. Email + token are read fresh
 * on every call (never cached at module load) and sent as HTTP Basic auth
 * (base64 "email:token") — Jira Cloud does not accept the token alone.
 * Never forwarded to the client, which only ever talks to our own
 * /api/jira/* routes.
 */
export async function callJiraApi(path: string, searchParams?: Record<string, string>, timeoutMs = 8000): Promise<unknown> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const url = new URL(`${getJiraBaseUrl()}/rest/api/3${path}`);
        for (const [key, value] of Object.entries(searchParams ?? {})) {
            url.searchParams.set(key, value);
        }

        const credentials = Buffer.from(`${getJiraEmail()}:${getJiraToken()}`).toString("base64");
        const response = await fetch(url, {
            headers: { Authorization: `Basic ${credentials}`, Accept: "application/json" },
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
