import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

export function WantedItemCardRarity({ className, ...props }: ComponentProps<"p">) {
    return (
        <p
            className={cn(
                "flex min-w-0 items-center gap-1 truncate text-xs font-medium text-muted group-data-[enabled=false]/item:opacity-45",
                className,
            )}
            {...props}
        />
    );
}
