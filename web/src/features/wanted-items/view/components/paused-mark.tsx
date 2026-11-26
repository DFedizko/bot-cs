import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

export function PausedMark({ className, ...props }: ComponentProps<"span">) {
    return (
        <span
            className={cn("rounded-sm border border-line bg-surface px-2 py-1 text-label text-muted", className)}
            {...props}
        >
            Paused
        </span>
    );
}
