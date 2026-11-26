import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

type PresetChipProps = ComponentProps<"button"> & { active: boolean };

export function PresetChip({ active, className, ...props }: PresetChipProps) {
    return (
        <button
            type="button"
            aria-pressed={active}
            className={cn(
                "h-8 rounded-sm border border-line px-3 text-key text-muted hover:border-line-strong hover:text-ink focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-pressed:border-accent/55 aria-pressed:bg-surface-3 aria-pressed:text-accent",
                className,
            )}
            {...props}
        />
    );
}
