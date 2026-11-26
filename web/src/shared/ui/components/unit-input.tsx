import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

type UnitInputProps = ComponentProps<"input"> & { unit: string };

export function UnitInput({ unit, className, ...props }: UnitInputProps) {
    return (
        <span
            className={cn(
                "flex h-11 items-center gap-2 rounded-md border border-line bg-surface-2 px-4 focus-within:border-accent focus-within:ring-3 focus-within:ring-accent/25 has-aria-invalid:border-danger has-aria-invalid:ring-3 has-aria-invalid:ring-danger/20",
                className,
            )}
        >
            <input
                type="text"
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent font-mono text-lg font-medium text-ink outline-none"
                {...props}
            />
            <span aria-hidden className="font-mono text-base text-muted">
                {unit}
            </span>
        </span>
    );
}
