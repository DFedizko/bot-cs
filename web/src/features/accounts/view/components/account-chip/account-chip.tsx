import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

export function AccountChip({ className, ...props }: ComponentProps<"span">) {
    return <span className={cn("flex min-w-0 flex-1 items-center gap-3", className)} {...props} />;
}
