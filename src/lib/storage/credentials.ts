import { safeGetItem, safeSetItem } from "@/lib/storage/safeStorage";
import { CREDENTIALS_KEY } from "@/lib/storage/storageKeys";

/**
 * Third-party credentials for this browser only — entered by whoever sets up
 * this particular dashboard instance, never sent to our server except as a
 * per-request header attached by the browser itself. The server holds no
 * standing GitLab/Jira secret of its own; a visitor with no credentials of
 * their own gets nothing from those cards.
 */
export interface DashboardCredentials {
    gitlabToken: string | null;
    jiraEmail: string | null;
    jiraToken: string | null;
}

const EMPTY_CREDENTIALS: DashboardCredentials = { gitlabToken: null, jiraEmail: null, jiraToken: null };

function isDashboardCredentials(value: unknown): value is DashboardCredentials {
    if (typeof value !== "object" || value === null) return false;
    const credentials = value as DashboardCredentials;
    return (
        (credentials.gitlabToken === null || typeof credentials.gitlabToken === "string") &&
        (credentials.jiraEmail === null || typeof credentials.jiraEmail === "string") &&
        (credentials.jiraToken === null || typeof credentials.jiraToken === "string")
    );
}

export function loadCredentials(): DashboardCredentials {
    const raw = safeGetItem(CREDENTIALS_KEY);
    if (!raw) return EMPTY_CREDENTIALS;

    try {
        const parsed = JSON.parse(raw);
        return isDashboardCredentials(parsed) ? { ...EMPTY_CREDENTIALS, ...parsed } : EMPTY_CREDENTIALS;
    } catch {
        return EMPTY_CREDENTIALS;
    }
}

function persist(credentials: DashboardCredentials): DashboardCredentials {
    safeSetItem(CREDENTIALS_KEY, JSON.stringify(credentials));
    return credentials;
}

export type CredentialsPatch = Partial<DashboardCredentials>;

export function updateCredentials(patch: CredentialsPatch): DashboardCredentials {
    return persist({ ...loadCredentials(), ...patch });
}
