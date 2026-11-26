import { PanelLeft } from "lucide-react";
import { useSidebar } from "@/shared/ui/components/sidebar";
import { Kbd } from "@/shared/ui/components/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/components/tooltip";
import { APP_SIDEBAR_ID } from "./app-sidebar-id";

const ICON_STROKE = 1.8;

export function AppSidebarToggle() {
    const { open, toggleSidebar } = useSidebar();
    return (
        <Tooltip>
            <TooltipTrigger
                aria-label="Toggle sidebar"
                aria-expanded={open}
                aria-controls={APP_SIDEBAR_ID}
                onClick={toggleSidebar}
                className="grid size-7 shrink-0 place-items-center rounded-sm text-faint hover:bg-surface-2 hover:text-ink focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
                <PanelLeft aria-hidden className="size-4" strokeWidth={ICON_STROKE} />
            </TooltipTrigger>
            <TooltipContent side="right">
                {open ? "Collapse" : "Expand"}
                <Kbd>⌘B</Kbd>
            </TooltipContent>
        </Tooltip>
    );
}
