import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

export function WearPill({ className, ...props }: ComponentProps<"span">) {
    return (
        <span
            className={cn(
                "inline-flex h-6 items-center rounded-full border border-line bg-surface-2 px-2 text-xs font-medium whitespace-nowrap text-muted",
                className,
            )}
            {...props}
        />
    );
}
