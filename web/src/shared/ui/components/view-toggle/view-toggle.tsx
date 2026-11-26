import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import { FilterChips } from "@/shared/ui/components/filter-chips";

export function ViewToggle<TValue extends string>({ className, ...props }: ComponentProps<typeof FilterChips<TValue>>) {
    return <FilterChips className={cn("gap-px rounded-md border border-line p-px", className)} {...props} />;
}
