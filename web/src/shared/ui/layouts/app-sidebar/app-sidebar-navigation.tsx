import { Link } from "@tanstack/react-router";
import { ChartColumn, Gavel, LocateFixed, Truck, Wallet } from "lucide-react";
import { SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu } from "@/shared/ui/components/sidebar";
import { AppSidebarItem } from "./app-sidebar-item";
import { AppSidebarLink } from "./app-sidebar-link";

type AppSidebarNavigationProps = { accountId: string };

export function AppSidebarNavigation({ accountId }: AppSidebarNavigationProps) {
    return (
        <SidebarContent>
            <SidebarGroup className="p-0">
                <SidebarGroupLabel className="h-auto px-3 pb-3 text-label text-faint">Bot</SidebarGroupLabel>
                <SidebarMenu aria-label="Bot" className="gap-px">
                    <AppSidebarItem icon={ChartColumn} label="Dashboard" />
                    <AppSidebarLink
                        icon={LocateFixed}
                        label="Wanted items"
                        isActive
                        render={<Link to="/accounts/$accountId/wanted-items" params={{ accountId }} />}
                    />
                    <AppSidebarItem icon={Gavel} label="Auctions" />
                    <AppSidebarItem icon={Truck} label="Deliveries" />
                    <AppSidebarItem icon={Wallet} label="Balance" />
                </SidebarMenu>
            </SidebarGroup>
        </SidebarContent>
    );
}
