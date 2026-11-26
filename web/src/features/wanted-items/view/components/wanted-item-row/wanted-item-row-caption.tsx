import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import type { RarityTone } from "@/shared/model/rarity/rarity-tone";
import { RARITY_COLORS } from "@/shared/ui/components/rarity-tile";

type WantedItemRowCaptionProps = ComponentProps<"p"> & { tone: RarityTone | null };

export function WantedItemRowCaption({ tone, className, ...props }: WantedItemRowCaptionProps) {
    return (
        <p
            className={cn("mt-px text-xs font-medium text-faint", tone && RARITY_COLORS[tone].text, className)}
            {...props}
        />
    );
}
