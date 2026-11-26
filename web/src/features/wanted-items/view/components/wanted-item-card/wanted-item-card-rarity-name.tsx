import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import type { RarityTone } from "@/shared/model/rarity/rarity-tone";
import { RARITY_COLORS } from "@/shared/ui/components/rarity-tile";

type WantedItemCardRarityNameProps = ComponentProps<"span"> & { tone: RarityTone };

export function WantedItemCardRarityName({ tone, className, ...props }: WantedItemCardRarityNameProps) {
    return <span className={cn(RARITY_COLORS[tone].text, className)} {...props} />;
}
