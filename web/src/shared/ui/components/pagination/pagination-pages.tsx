import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

export function PaginationPages({ className, ...props }: ComponentProps<"ul">) {
    return <ul className={cn("flex items-center gap-px", className)} {...props} />;
}
