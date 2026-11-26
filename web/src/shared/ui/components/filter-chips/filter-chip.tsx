import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import { ToggleGroupItem } from "@/shared/ui/components/toggle-group";

export function FilterChip({ className, ...props }: ComponentProps<typeof ToggleGroupItem>) {
    return (
        <ToggleGroupItem
            className={cn(
                "h-8 gap-2 rounded-full border border-line px-3 text-sm font-medium text-muted hover:bg-transparent hover:text-ink aria-pressed:border-line-strong aria-pressed:bg-surface-2 aria-pressed:text-ink aria-pressed:ring-0",
                className,
            )}
            {...props}
        />
    );
}
