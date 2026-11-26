import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import type { RarityTone } from "@/shared/model/rarity/rarity-tone";
import { RARITY_COLORS } from "./rarity-colors";

type RarityTileProps = ComponentProps<"div"> & { tone: RarityTone | null };

export function RarityTile({ tone, className, ...props }: RarityTileProps) {
    return (
        <div
            className={cn("relative grid place-items-center bg-surface-3", tone && RARITY_COLORS[tone].tile, className)}
            {...props}
        />
    );
}
