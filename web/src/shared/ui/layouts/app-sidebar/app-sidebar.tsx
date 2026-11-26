import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import { Sidebar } from "@/shared/ui/components/sidebar";
import { APP_SIDEBAR_ID } from "./app-sidebar-id";

export function AppSidebar({ className, ...props }: ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar
            id={APP_SIDEBAR_ID}
            collapsible="icon"
            role="navigation"
            aria-label="Main"
            className={cn("group-data-[side=left]:border-r-0 *:data-[slot=sidebar-inner]:p-3", className)}
            {...props}
        />
    );
}
