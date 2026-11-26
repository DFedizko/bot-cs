import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import { RarityTileImage } from "@/shared/ui/components/rarity-tile";

export function WantedItemRowImage({ className, ...props }: ComponentProps<typeof RarityTileImage>) {
    return (
        <RarityTileImage
            className={cn(
                "size-10 group-data-[enabled=false]/item:brightness-60 group-data-[enabled=false]/item:grayscale",
                className,
            )}
            {...props}
        />
    );
}
