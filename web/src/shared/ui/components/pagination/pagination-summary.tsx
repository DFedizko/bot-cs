import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

export function PaginationSummary({ className, ...props }: ComponentProps<"p">) {
    return <p className={cn("text-muted", className)} {...props} />;
}
