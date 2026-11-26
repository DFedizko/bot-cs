import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import type { RarityTone } from "@/shared/model/rarity/rarity-tone";
import { RARITY_COLORS } from "@/shared/ui/components/rarity-tile";

type WantedItemRowNameProps = ComponentProps<"div"> & { tone: RarityTone | null; caption: string };

export function WantedItemRowName({ tone, caption, className, children, ...props }: WantedItemRowNameProps) {
    return (
        <div className={cn("min-w-0 flex-1 group-data-[enabled=false]/item:opacity-45", className)} {...props}>
            <h3 className="truncate text-base font-medium text-ink">{children}</h3>
            <p className={cn("mt-px text-xs font-medium text-faint", tone && RARITY_COLORS[tone].text)}>{caption}</p>
        </div>
    );
}
