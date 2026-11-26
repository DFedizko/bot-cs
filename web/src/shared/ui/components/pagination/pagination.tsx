import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

export function Pagination({ className, ...props }: ComponentProps<"nav">) {
    return (
        <nav
            aria-label="Pagination"
            className={cn("flex items-center gap-3 text-sm text-muted", className)}
            {...props}
        />
    );
}
