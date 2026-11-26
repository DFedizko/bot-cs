import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

export function WantedItemCardFooter({ className, ...props }: ComponentProps<"div">) {
    return (
        <div
            className={cn("mt-2 flex items-center justify-between gap-2 border-t border-line pt-2", className)}
            {...props}
        />
    );
}
