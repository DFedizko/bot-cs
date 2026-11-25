import type { Rarity } from "./rarity";
import type { RarityTone } from "./rarity-tone";

const TONE_BY_RARITY: Readonly<Record<Rarity, RarityTone>> = {
    "Consumer Grade": "consumer",
    "Industrial Grade": "industrial",
    "Mil-Spec Grade": "milspec",
    Restricted: "restricted",
    Classified: "classified",
    Covert: "covert",
    Extraordinary: "covert",
    Contraband: "contraband",
};

export const toRarityTone = (rarity: Rarity): RarityTone => TONE_BY_RARITY[rarity];
