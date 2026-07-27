export type ToastVariant = "error" | "warning" | "success";

export interface ToastMessage {
    id: string;
    title: string;
    description?: string;
    variant: ToastVariant;
}

const AUTO_DISMISS_MS = 6000;

const EMPTY_TOASTS: ToastMessage[] = [];
const listeners = new Set<() => void>();
let toasts: ToastMessage[] = [];

function notify() {
    listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function getSnapshot(): ToastMessage[] {
    return toasts;
}

export function getServerSnapshot(): ToastMessage[] {
    return EMPTY_TOASTS;
}

export function showToast(toast: Omit<ToastMessage, "id">): string {
    const id = crypto.randomUUID();
    toasts = [...toasts, { ...toast, id }];
    notify();

    setTimeout(() => dismissToast(id), AUTO_DISMISS_MS);

    return id;
}

export function dismissToast(id: string) {
    toasts = toasts.filter((toast) => toast.id !== id);
    notify();
}
