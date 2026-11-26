import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import { RarityTile } from "@/shared/ui/components/rarity-tile";

export function WantedItemRowTile({ className, ...props }: ComponentProps<typeof RarityTile>) {
    return <RarityTile className={cn("size-11 shrink-0 rounded-sm", className)} {...props} />;
}
