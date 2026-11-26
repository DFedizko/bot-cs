import { Settings } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import { SidebarFooter, SidebarMenu } from "@/shared/ui/components/sidebar";
import { AppSidebarItem } from "./app-sidebar-item";
import { NAV_ICON_STROKE } from "./nav-icon-stroke";

export function AppSidebarFooter({ className, children, ...props }: ComponentProps<typeof SidebarFooter>) {
    return (
        <SidebarFooter className={cn("gap-3 p-0", className)} {...props}>
            <SidebarMenu aria-label="App">
                <AppSidebarItem label="Settings">
                    <Settings aria-hidden strokeWidth={NAV_ICON_STROKE} />
                </AppSidebarItem>
            </SidebarMenu>
            {children}
        </SidebarFooter>
    );
}
