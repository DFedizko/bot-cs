import { Settings } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import { SidebarFooter, SidebarMenu } from "@/shared/ui/components/sidebar";
import { AppSidebarItem } from "./app-sidebar-item";

export function AppSidebarFooter({ className, children, ...props }: ComponentProps<typeof SidebarFooter>) {
    return (
        <SidebarFooter className={cn("gap-3 p-0", className)} {...props}>
            <SidebarMenu aria-label="App">
                <AppSidebarItem icon={Settings} label="Settings" />
            </SidebarMenu>
            {children}
        </SidebarFooter>
    );
}
