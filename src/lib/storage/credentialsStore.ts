import { loadCredentials, updateCredentials, type CredentialsPatch, type DashboardCredentials } from "@/lib/storage/credentials";

const EMPTY_CREDENTIALS: DashboardCredentials = { gitlabToken: null, jiraEmail: null, jiraToken: null };
const listeners = new Set<() => void>();
let cache: DashboardCredentials | null = null;

function notify() {
    listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function getSnapshot(): DashboardCredentials {
    if (cache === null) cache = loadCredentials();
    return cache;
}

export function getServerSnapshot(): DashboardCredentials {
    return EMPTY_CREDENTIALS;
}

export function patchCredentials(patch: CredentialsPatch) {
    cache = updateCredentials(patch);
    notify();
}
