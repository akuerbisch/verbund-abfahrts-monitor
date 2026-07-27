"use client";

import { Toast } from "@/components/base/toast/toast";
import { useToasts } from "@/hooks/useToasts";

export function ToastViewport() {
    const { toasts, dismissToast } = useToasts();

    if (toasts.length === 0) return null;

    return (
        <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-3 sm:inset-x-auto sm:right-4">
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto w-full sm:w-auto">
                    <Toast title={toast.title} description={toast.description} variant={toast.variant} onDismiss={() => dismissToast(toast.id)} />
                </div>
            ))}
        </div>
    );
}
