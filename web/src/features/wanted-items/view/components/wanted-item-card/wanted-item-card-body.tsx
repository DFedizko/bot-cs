import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

export function WantedItemCardBody({ className, ...props }: ComponentProps<"div">) {
    return <div className={cn("flex min-w-0 flex-col gap-px px-3 pt-2 pb-3", className)} {...props} />;
}
