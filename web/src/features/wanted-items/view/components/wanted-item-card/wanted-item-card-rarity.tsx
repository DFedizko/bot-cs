import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import type { RarityTone } from "@/shared/model/rarity/rarity-tone";
import { RARITY_COLORS } from "@/shared/ui/components/rarity-tile";

type WantedItemCardRarityProps = ComponentProps<"p"> & { tone: RarityTone | null; rarityName: string | null };

export function WantedItemCardRarity({ tone, rarityName, className, children, ...props }: WantedItemCardRarityProps) {
    return (
        <p
            className={cn(
                "flex min-w-0 items-center gap-1 truncate text-xs font-medium text-muted group-data-[enabled=false]/item:opacity-45",
                className,
            )}
            {...props}
        >
            {tone && <span aria-hidden className={cn("size-2 shrink-0 rounded-full", RARITY_COLORS[tone].dot)} />}
            {rarityName && <span className={tone ? RARITY_COLORS[tone].text : undefined}>{rarityName}</span>}
            {children}
        </p>
    );
}
