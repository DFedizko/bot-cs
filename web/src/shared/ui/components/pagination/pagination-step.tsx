import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

export function PaginationStep({ className, ...props }: ComponentProps<"button">) {
    return (
        <button
            type="button"
            className={cn(
                "inline-flex h-8 items-center gap-2 rounded-md border border-line px-3 text-sm font-medium text-ink outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:text-faint [&_svg]:size-4",
                className,
            )}
            {...props}
        />
    );
}
