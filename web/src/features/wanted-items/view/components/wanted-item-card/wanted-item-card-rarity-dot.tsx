import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import type { RarityTone } from "@/shared/model/rarity/rarity-tone";
import { RARITY_COLORS } from "@/shared/ui/components/rarity-tile";

type WantedItemCardRarityDotProps = ComponentProps<"span"> & { tone: RarityTone };

export function WantedItemCardRarityDot({ tone, className, ...props }: WantedItemCardRarityDotProps) {
    return (
        <span
            aria-hidden
            className={cn("size-2 shrink-0 rounded-full", RARITY_COLORS[tone].dot, className)}
            {...props}
        />
    );
}
