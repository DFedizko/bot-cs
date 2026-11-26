import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { SidebarMenuButton, SidebarMenuItem } from "@/shared/ui/components/sidebar";
import { APP_SIDEBAR_NAV_BUTTON } from "./app-sidebar-nav-button";
import { AppSidebarLabel } from "./app-sidebar-label";
import { NAV_ICON_STROKE } from "./nav-icon-stroke";

type AppSidebarItemProps = { icon: LucideIcon; label: string };

export function AppSidebarItem({ icon: Icon, label }: AppSidebarItemProps) {
    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                aria-disabled
                tooltip={label}
                aria-label={label}
                className={cn(
                    APP_SIDEBAR_NAV_BUTTON,
                    "hover:bg-transparent hover:text-muted aria-disabled:pointer-events-auto aria-disabled:cursor-not-allowed aria-disabled:opacity-100",
                )}
            >
                <Icon aria-hidden strokeWidth={NAV_ICON_STROKE} />
                <AppSidebarLabel>{label}</AppSidebarLabel>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}
