import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import { DropdownMenuRadioItem } from "@/shared/ui/components/dropdown-menu";

export function SortMenuOption({ className, ...props }: ComponentProps<typeof DropdownMenuRadioItem>) {
    return (
        <DropdownMenuRadioItem
            className={cn(
                "h-9 gap-3 rounded-sm pr-8 pl-3 text-sm text-ink data-checked:bg-surface-3 [&_svg]:size-4 [&_svg]:text-muted data-checked:[&_svg]:text-accent",
                className,
            )}
            {...props}
        />
    );
}
