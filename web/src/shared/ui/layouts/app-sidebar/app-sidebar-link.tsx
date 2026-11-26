import type { LucideIcon } from "lucide-react";
import type { ReactElement } from "react";
import { SidebarMenuButton, SidebarMenuItem } from "@/shared/ui/components/sidebar";
import { APP_SIDEBAR_NAV_BUTTON } from "./app-sidebar-nav-button";
import { AppSidebarLabel } from "./app-sidebar-label";
import { NAV_ICON_STROKE } from "./nav-icon-stroke";

type AppSidebarLinkProps = { icon: LucideIcon; label: string; isActive?: boolean; render: ReactElement };

export function AppSidebarLink({ icon: Icon, label, isActive = false, render }: AppSidebarLinkProps) {
    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                render={render}
                isActive={isActive}
                tooltip={label}
                aria-label={label}
                className={APP_SIDEBAR_NAV_BUTTON}
            >
                <Icon aria-hidden strokeWidth={NAV_ICON_STROKE} />
                <AppSidebarLabel>{label}</AppSidebarLabel>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}
