import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

type WantedItemRowProps = ComponentProps<"article"> & { name: string; enabled: boolean };

export function WantedItemRow({ name, enabled, className, ...props }: WantedItemRowProps) {
    return (
        <article
            aria-label={name}
            data-enabled={enabled}
            className={cn(
                "group/item flex h-16 items-center gap-3 border-b border-line px-4 hover:bg-surface-2",
                className,
            )}
            {...props}
        />
    );
}
