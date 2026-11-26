import type { RarityTone } from "@/shared/model/rarity/rarity-tone";
import type { MaxDescription } from "./describe-max";

export type WantedItemView = {
    name: string;
    title: string;
    shortName: string;
    weapon: string | null;
    rarityName: string | null;
    tone: RarityTone | null;
    imageUrl: string | null;
    wear: string | null;
    stattrak: boolean;
    souvenir: boolean;
    enabled: boolean;
    max: MaxDescription;
};
