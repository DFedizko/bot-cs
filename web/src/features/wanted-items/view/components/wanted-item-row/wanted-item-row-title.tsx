import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

export function WantedItemRowTitle({ className, ...props }: ComponentProps<"h3">) {
    return <h3 className={cn("truncate text-base font-medium text-ink", className)} {...props} />;
}
