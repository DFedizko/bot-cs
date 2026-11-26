import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

export function WantedItemCardTags({ className, ...props }: ComponentProps<"div">) {
    return <div className={cn("absolute top-2 left-2 flex gap-1", className)} {...props} />;
}
