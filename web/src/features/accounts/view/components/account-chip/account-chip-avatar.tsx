import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

export function AccountChipAvatar({ className, ...props }: ComponentProps<"span">) {
    return (
        <span
            aria-hidden
            className={cn(
                "grid size-8 shrink-0 place-items-center rounded-md bg-surface-3 font-mono text-sm font-semibold text-ink",
                className,
            )}
            {...props}
        />
    );
}
