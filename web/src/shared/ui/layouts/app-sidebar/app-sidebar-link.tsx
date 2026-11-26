import type { ReactElement, ReactNode } from "react";
import { SidebarMenuButton, SidebarMenuItem } from "@/shared/ui/components/sidebar";
import { APP_SIDEBAR_NAV_BUTTON } from "./app-sidebar-nav-button";
import { AppSidebarLabel } from "./app-sidebar-label";

type AppSidebarLinkProps = { label: string; isActive?: boolean; render: ReactElement; children: ReactNode };

export function AppSidebarLink({ label, isActive = false, render, children }: AppSidebarLinkProps) {
    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                render={render}
                isActive={isActive}
                tooltip={label}
                aria-label={label}
                className={APP_SIDEBAR_NAV_BUTTON}
            >
                {children}
                <AppSidebarLabel>{label}</AppSidebarLabel>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}
