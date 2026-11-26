import type { Rarity } from "@/shared/model/rarity/rarity";
import type { MaxFor } from "./max-for";

export type WantedItemCatalog = {
    imageUrl: string;
    rarity: Rarity;
    weapon: string;
    skin: string;
    wear: string | null;
    stattrak: boolean;
    souvenir: boolean;
};

export type WantedItem = {
    name: string;
    maxFor: MaxFor;
    enabled: boolean;
    addedAt: string;
    catalog: WantedItemCatalog | null;
};
