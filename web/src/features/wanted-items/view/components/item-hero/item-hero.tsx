import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import type { RarityTone } from "@/shared/model/rarity/rarity-tone";
import { RARITY_COLORS, RarityTile, RarityTileImage } from "@/shared/ui/components/rarity-tile";

const HERO_IMAGE_SIZE = { lg: 360, sm: 180 } as const;

type ItemHeroSize = keyof typeof HERO_IMAGE_SIZE;

type ItemHeroProps = {
    tone: RarityTone | null;
    imageUrl: string | null;
    rarity: string | null;
    title: string;
    detail: string | null;
    size?: ItemHeroSize;
    children?: ReactNode;
};

export function ItemHero({ tone, imageUrl, rarity, title, detail, size = "lg", children }: ItemHeroProps) {
    const large = size === "lg";
    return (
        <section aria-label={title} className={cn("flex items-center", large ? "gap-4" : "gap-3")}>
            <RarityTile
                tone={tone}
                className={cn("shrink-0 rounded-lg border border-line", large ? "h-32 w-40" : "h-16 w-22 rounded-md")}
            >
                <RarityTileImage
                    src={imageUrl}
                    size={HERO_IMAGE_SIZE[size]}
                    className={large ? "h-28 w-36" : "h-14 w-20"}
                />
            </RarityTile>
            <span className="flex min-w-0 flex-col gap-1">
                {tone && rarity && (
                    <span className={cn("flex items-center gap-2 text-xs font-medium", RARITY_COLORS[tone].text)}>
                        <i aria-hidden className={cn("size-2 rounded-sm", RARITY_COLORS[tone].dot)} />
                        {rarity}
                    </span>
                )}
                <h3 className={cn("truncate text-ink", large ? "text-item-title" : "text-body font-semibold")}>
                    {title}
                </h3>
                {detail && <span className="text-helper text-muted">{detail}</span>}
                {children}
            </span>
        </section>
    );
}
