import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import { SidebarInset } from "@/shared/ui/components/sidebar";

export function AppContent({ className, ...props }: ComponentProps<typeof SidebarInset>) {
    return (
        <SidebarInset
            className={cn("m-2 min-w-0 overflow-hidden rounded-lg border border-line bg-surface md:ml-0", className)}
            {...props}
        />
    );
}
