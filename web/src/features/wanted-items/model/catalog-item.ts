import type { Rarity } from "@/shared/model/rarity/rarity";
import type { Wear } from "./wear";

export type CatalogItem = {
    marketHashName: string;
    weapon: string;
    skin: string | null;
    wear: Wear | null;
    stattrak: boolean;
    souvenir: boolean;
    category: string;
    rarity: Rarity;
    imageUrl: string;
};
