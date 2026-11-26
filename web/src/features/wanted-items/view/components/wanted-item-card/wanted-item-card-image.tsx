import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import { RarityTileImage } from "@/shared/ui/components/rarity-tile";

export function WantedItemCardImage({ className, ...props }: ComponentProps<typeof RarityTileImage>) {
    return (
        <RarityTileImage
            className={cn(
                "h-20 w-4/5 group-data-[enabled=false]/item:brightness-60 group-data-[enabled=false]/item:grayscale",
                className,
            )}
            {...props}
        />
    );
}
