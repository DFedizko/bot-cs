import { EllipsisVertical } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/shared/ui/components/dropdown-menu";

type ItemActionsMenuProps = { itemName: string; className?: string };

export function ItemActionsMenu({ itemName, className }: ItemActionsMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Actions for ${itemName}`}
                        className={cn("text-muted data-popup-open:bg-surface-2", className)}
                    />
                }
            >
                <EllipsisVertical aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-auto min-w-40">
                <DropdownMenuGroup>
                    <DropdownMenuItem disabled>Edit</DropdownMenuItem>
                    <DropdownMenuItem disabled>Remove</DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
