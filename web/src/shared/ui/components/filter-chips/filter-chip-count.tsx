import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

export function FilterChipCount({ className, ...props }: ComponentProps<"span">) {
    return (
        <span
            className={cn("inline-flex h-5 items-center rounded-full bg-surface-3 px-2 text-key", className)}
            {...props}
        />
    );
}
