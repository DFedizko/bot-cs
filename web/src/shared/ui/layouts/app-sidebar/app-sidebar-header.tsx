import { Crosshair } from "lucide-react";
import { APP_NAME } from "@/shared/lib/app-name";
import { SidebarHeader } from "@/shared/ui/components/sidebar";
import { AppSidebarLabel } from "./app-sidebar-label";
import { AppSidebarToggle } from "./app-sidebar-toggle";

const LOGO_STROKE = 2.4;

export function AppSidebarHeader() {
    return (
        <SidebarHeader className="flex-row items-center justify-between gap-2 px-1 pt-1 pb-6 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-3 group-data-[collapsible=icon]:px-0">
            <span className="flex min-w-0 items-center gap-2">
                <span className="grid size-7 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
                    <Crosshair aria-hidden className="size-5" strokeWidth={LOGO_STROKE} />
                </span>
                <AppSidebarLabel className="font-mono text-lg font-semibold group-data-[collapsible=icon]:absolute">
                    {APP_NAME}
                </AppSidebarLabel>
            </span>
            <AppSidebarToggle />
        </SidebarHeader>
    );
}
