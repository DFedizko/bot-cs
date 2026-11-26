import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

type WantedItemCardProps = ComponentProps<"article"> & { name: string; enabled: boolean };

export function WantedItemCard({ name, enabled, className, ...props }: WantedItemCardProps) {
    return (
        <article
            aria-label={name}
            data-enabled={enabled}
            className={cn(
                "group/item flex min-w-0 flex-col overflow-hidden rounded-lg border border-line bg-surface-2 transition-colors hover:border-line-strong",
                className,
            )}
            {...props}
        />
    );
}
