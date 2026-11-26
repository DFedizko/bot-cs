import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

export function MaxBadgeValue({ className, ...props }: ComponentProps<"span">) {
    return <span className={cn("truncate font-mono text-xs font-semibold", className)} {...props} />;
}
