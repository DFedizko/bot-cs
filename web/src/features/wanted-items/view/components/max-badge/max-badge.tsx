import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import type { MaxTone } from "../../../model/max-tone";

type MaxBadgeProps = ComponentProps<"span"> & { tone: MaxTone };

const TONE_CLASSES: Readonly<Record<MaxTone, string>> = {
    below: "border-positive/30 bg-positive/10 text-positive",
    above: "border-warning/30 bg-warning/10 text-warning",
    even: "border-line bg-surface-2 text-ink",
};

export function MaxBadge({ tone, className, children, ...props }: MaxBadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex h-6 items-center gap-1 rounded-full border px-2 text-xs font-medium whitespace-nowrap",
                TONE_CLASSES[tone],
                className,
            )}
            {...props}
        >
            <span className="opacity-75">Max</span>
            {children}
        </span>
    );
}
