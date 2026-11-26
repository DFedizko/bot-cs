import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

export function WantedItemRowCell({ className, ...props }: ComponentProps<"div">) {
    return <div className={cn("flex shrink-0 items-center gap-1", className)} {...props} />;
}
