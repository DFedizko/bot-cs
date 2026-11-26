import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

export function MaxBadgeNote({ className, ...props }: ComponentProps<"span">) {
    return <span className={cn("opacity-70", className)} {...props} />;
}
