import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import { ToggleGroupItem } from "@/shared/ui/components/toggle-group";

export function ViewToggleItem({ className, ...props }: ComponentProps<typeof ToggleGroupItem>) {
    return <ToggleGroupItem className={cn("size-8 min-w-8 rounded-sm px-0", className)} {...props} />;
}
