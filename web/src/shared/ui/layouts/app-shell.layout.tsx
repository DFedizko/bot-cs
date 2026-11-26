import type { ReactNode } from "react";
import { useSidebarPreference } from "@/shared/lib/sidebar/sidebar-preference";
import { SidebarProvider } from "@/shared/ui/components/sidebar";
import { TooltipProvider } from "@/shared/ui/components/tooltip";

type AppShellLayoutProps = { children: ReactNode };

export function AppShellLayout({ children }: AppShellLayoutProps) {
    const defaultOpen = useSidebarPreference().readOpen();
    return (
        <TooltipProvider>
            <SidebarProvider defaultOpen={defaultOpen} className="h-svh">
                {children}
            </SidebarProvider>
        </TooltipProvider>
    );
}
