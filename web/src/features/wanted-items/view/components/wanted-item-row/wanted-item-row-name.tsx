import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

export function WantedItemRowName({ className, ...props }: ComponentProps<"div">) {
    return <div className={cn("min-w-0 flex-1 group-data-[enabled=false]/item:opacity-45", className)} {...props} />;
}
