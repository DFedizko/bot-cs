import { RARITY_COLORS, RarityTile, RarityTileImage } from "@/shared/ui/components/rarity-tile";
import { CommandItem } from "@/shared/ui/components/command";
import { WearPill } from "@/shared/ui/components/wear-pill";
import type { CatalogItemView } from "../../../model/catalog-item-view";
import { WantedItemTags } from "../wanted-item-tags";
import { HighlightedName } from "./highlighted-name";

const RESULT_IMAGE_SIZE = 96;

type CatalogResultProps = { item: CatalogItemView; query: string; onChoose: (name: string) => void };

export function CatalogResult({ item, query, onChoose }: CatalogResultProps) {
    return (
        <CommandItem value={item.name} aria-label={item.name} onSelect={onChoose} className="gap-3 p-2">
            <RarityTile tone={item.tone} className="size-12 shrink-0 rounded-md">
                <RarityTileImage src={item.imageUrl} size={RESULT_IMAGE_SIZE} className="size-11" />
            </RarityTile>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
                <HighlightedName name={item.name} query={query} />
                <span className="flex items-center gap-2 text-xs">
                    <span className={RARITY_COLORS[item.tone].text}>
                        {item.rarity} · {item.weapon}
                    </span>
                    <WantedItemTags stattrak={item.stattrak} souvenir={item.souvenir} />
                </span>
            </span>
            {item.wear && <WearPill>{item.wear}</WearPill>}
        </CommandItem>
    );
}
