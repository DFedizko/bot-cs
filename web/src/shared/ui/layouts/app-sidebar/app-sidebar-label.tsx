import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import { useSidebar } from "@/shared/ui/components/sidebar";

export function AppSidebarLabel({ className, ...props }: ComponentProps<"span">) {
    const { state, isMobile } = useSidebar();
    return (
        <span
            aria-hidden={state === "collapsed" && !isMobile}
            className={cn(
                "min-w-0 truncate transition-opacity duration-200 ease-out group-data-[collapsible=icon]:opacity-0 motion-reduce:transition-none",
                className,
            )}
            {...props}
        />
    );
}
