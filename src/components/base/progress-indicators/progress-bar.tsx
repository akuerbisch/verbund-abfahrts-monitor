import { cx } from "@/utils/cx";

interface ProgressBarProps {
    percent: number;
    className?: string;
}

export function ProgressBar({ percent, className }: ProgressBarProps) {
    const clamped = Math.min(100, Math.max(0, percent));

    return (
        <div
            role="progressbar"
            aria-valuenow={clamped}
            aria-valuemin={0}
            aria-valuemax={100}
            className={cx("h-1.5 w-full overflow-hidden rounded-full bg-tertiary", className)}
        >
            <div className="h-full rounded-full bg-brand-solid transition-[width]" style={{ width: `${clamped}%` }} />
        </div>
    );
}
