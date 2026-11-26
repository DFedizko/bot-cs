import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

export function WantedItemCardMeta({ className, ...props }: ComponentProps<"div">) {
    return (
        <div className={cn("mt-1 flex h-6 gap-1 group-data-[enabled=false]/item:opacity-45", className)} {...props} />
    );
}
