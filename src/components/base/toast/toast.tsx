import { AlertCircle, AlertTriangle, CheckCircle, X } from "@untitledui/icons";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import type { ToastVariant } from "@/lib/toast/toastStore";

const VARIANT_ICON = {
    error: AlertCircle,
    warning: AlertTriangle,
    success: CheckCircle,
};

interface ToastProps {
    title: string;
    description?: string;
    variant: ToastVariant;
    onDismiss: () => void;
}

export function Toast({ title, description, variant, onDismiss }: ToastProps) {
    return (
        <div className="flex w-full max-w-sm items-start gap-3 rounded-xl bg-primary p-4 shadow-lg ring-1 ring-secondary_alt">
            <FeaturedIcon color={variant} theme="light" size="md" icon={VARIANT_ICON[variant]} />
            <div className="flex-1 pt-0.5">
                <p className="text-sm font-semibold text-primary">{title}</p>
                {description && <p className="mt-1 text-sm text-tertiary">{description}</p>}
            </div>
            <ButtonUtility icon={X} tooltip="Dismiss" size="sm" color="tertiary" onClick={onDismiss} />
        </div>
    );
}
