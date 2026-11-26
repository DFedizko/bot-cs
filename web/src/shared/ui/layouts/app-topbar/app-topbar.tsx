import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

export function AppTopbar({ className, ...props }: ComponentProps<"header">) {
    return (
        <header
            className={cn("flex h-14 shrink-0 items-center gap-3 border-b border-line pr-4 pl-6", className)}
            {...props}
        />
    );
}
