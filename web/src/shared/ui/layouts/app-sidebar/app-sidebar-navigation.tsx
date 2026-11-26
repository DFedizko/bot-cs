import { Link } from "@tanstack/react-router";
import { ChartColumn, Gavel, LocateFixed, Truck, Wallet } from "lucide-react";
import { SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu } from "@/shared/ui/components/sidebar";
import { AppSidebarItem } from "./app-sidebar-item";
import { AppSidebarLink } from "./app-sidebar-link";
import { NAV_ICON_STROKE } from "./nav-icon-stroke";

type AppSidebarNavigationProps = { accountId: string };

export function AppSidebarNavigation({ accountId }: AppSidebarNavigationProps) {
    return (
        <SidebarContent>
            <SidebarGroup className="p-0">
                <SidebarGroupLabel className="h-auto px-3 pb-3 text-label text-faint">Bot</SidebarGroupLabel>
                <SidebarMenu aria-label="Bot" className="gap-px">
                    <AppSidebarItem label="Dashboard">
                        <ChartColumn aria-hidden strokeWidth={NAV_ICON_STROKE} />
                    </AppSidebarItem>
                    <AppSidebarLink
                        label="Wanted items"
                        isActive
                        render={<Link to="/accounts/$accountId/wanted-items" params={{ accountId }} />}
                    >
                        <LocateFixed aria-hidden strokeWidth={NAV_ICON_STROKE} />
                    </AppSidebarLink>
                    <AppSidebarItem label="Auctions">
                        <Gavel aria-hidden strokeWidth={NAV_ICON_STROKE} />
                    </AppSidebarItem>
                    <AppSidebarItem label="Deliveries">
                        <Truck aria-hidden strokeWidth={NAV_ICON_STROKE} />
                    </AppSidebarItem>
                    <AppSidebarItem label="Balance">
                        <Wallet aria-hidden strokeWidth={NAV_ICON_STROKE} />
                    </AppSidebarItem>
                </SidebarMenu>
            </SidebarGroup>
        </SidebarContent>
    );
}
