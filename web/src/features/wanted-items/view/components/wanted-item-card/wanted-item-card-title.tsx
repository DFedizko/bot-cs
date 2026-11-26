import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

export function WantedItemCardTitle({ className, ...props }: ComponentProps<"h3">) {
    return (
        <h3
            className={cn(
                "truncate text-base font-semibold text-ink group-data-[enabled=false]/item:opacity-45",
                className,
            )}
            {...props}
        />
    );
}
