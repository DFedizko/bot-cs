import type { RarityTone } from "@/shared/model/rarity/rarity-tone";
import type { Rarity } from "@/shared/model/rarity/rarity";
import type { Wear } from "./wear";

export type CatalogItemView = {
    name: string;
    title: string;
    weapon: string;
    rarity: Rarity;
    tone: RarityTone;
    imageUrl: string;
    wear: Wear | null;
    stattrak: boolean;
    souvenir: boolean;
};
