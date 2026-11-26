import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { SidebarMenuButton, SidebarMenuItem } from "@/shared/ui/components/sidebar";
import { APP_SIDEBAR_NAV_BUTTON } from "./app-sidebar-nav-button";
import { AppSidebarLabel } from "./app-sidebar-label";

type AppSidebarItemProps = { label: string; children: ReactNode };

const NOT_IN_TAB_ORDER = -1;

export function AppSidebarItem({ label, children }: AppSidebarItemProps) {
    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                aria-disabled
                tabIndex={NOT_IN_TAB_ORDER}
                tooltip={label}
                aria-label={label}
                className={cn(
                    APP_SIDEBAR_NAV_BUTTON,
                    "hover:bg-transparent hover:text-muted aria-disabled:pointer-events-auto aria-disabled:cursor-not-allowed aria-disabled:opacity-100",
                )}
            >
                {children}
                <AppSidebarLabel>{label}</AppSidebarLabel>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}
