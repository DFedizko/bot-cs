import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import { RarityTile } from "@/shared/ui/components/rarity-tile";

export function WantedItemCardMedia({ className, ...props }: ComponentProps<typeof RarityTile>) {
    return <RarityTile className={cn("m-1 mb-0 h-25 rounded-sm", className)} {...props} />;
}
