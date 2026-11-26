import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

export function AppTopbarTitle({ className, ...props }: ComponentProps<"h1">) {
    return <h1 className={cn("flex-1 truncate text-heading text-ink", className)} {...props} />;
}
