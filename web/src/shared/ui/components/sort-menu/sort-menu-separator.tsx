import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import { DropdownMenuSeparator } from "@/shared/ui/components/dropdown-menu";

export function SortMenuSeparator({ className, ...props }: ComponentProps<typeof DropdownMenuSeparator>) {
    return <DropdownMenuSeparator className={cn("mx-2 bg-line", className)} {...props} />;
}
