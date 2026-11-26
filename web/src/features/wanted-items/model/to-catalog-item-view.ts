import { toRarityTone } from "@/shared/model/rarity/to-rarity-tone";
import type { CatalogItem } from "./catalog-item";
import type { CatalogItemView } from "./catalog-item-view";
import { toWeaponLabel } from "./to-weapon-label";

const WEAR_SUFFIX = /\s\([^()]*\)$/;

export const toCatalogItemView = (item: CatalogItem): CatalogItemView => ({
    name: item.marketHashName,
    title: item.wear ? item.marketHashName.replace(WEAR_SUFFIX, "") : item.marketHashName,
    weapon: toWeaponLabel(item.marketHashName, item.weapon),
    rarity: item.rarity,
    tone: toRarityTone(item.rarity),
    imageUrl: item.imageUrl,
    wear: item.wear,
    stattrak: item.stattrak,
    souvenir: item.souvenir,
});
