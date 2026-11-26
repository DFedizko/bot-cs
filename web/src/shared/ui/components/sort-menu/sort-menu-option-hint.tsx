import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

export function SortMenuOptionHint({ className, ...props }: ComponentProps<"span">) {
    return <span className={cn("ml-auto font-mono text-xs text-faint", className)} {...props} />;
}
