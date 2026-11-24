export type ByMykelRarityId =
    | "rarity_common_weapon"
    | "rarity_uncommon_weapon"
    | "rarity_rare_weapon"
    | "rarity_mythical_weapon"
    | "rarity_legendary_weapon"
    | "rarity_ancient_weapon"
    | "rarity_ancient"
    | "rarity_contraband_weapon";

export type ByMykelTeamId = "both" | "terrorists" | "counter-terrorists";

export interface ByMykelSkinWeapon {
    id: string;
    weapon_id: number;
    name: string;
}

export interface ByMykelSkinNamed {
    id: string;
    name: string;
}

export interface ByMykelSkinRarity {
    id: ByMykelRarityId;
    name: string;
    color: string;
}

export interface ByMykelSkinSpecialNote {
    source: string;
    text: string;
}

export interface ByMykelSkinTeam {
    id: ByMykelTeamId;
    name: string;
}

export interface ByMykelSkinStyle {
    id: number;
    name: string;
    url: string | null;
}

export interface ByMykelSkinOriginal {
    name: string;
    image_inventory: string;
}

export interface ByMykelSkin {
    id: string;
    skin_id: string;
    name: string;
    description: string;
    weapon: ByMykelSkinWeapon;
    category: ByMykelSkinNamed;
    pattern?: ByMykelSkinNamed;
    min_float?: number;
    max_float?: number;
    wear?: ByMykelSkinNamed;
    stattrak: boolean;
    souvenir?: boolean;
    paint_index: string | null;
    rarity: ByMykelSkinRarity;
    phase?: string;
    market_hash_name: string;
    special_notes?: ByMykelSkinSpecialNote[];
    team: ByMykelSkinTeam;
    style: ByMykelSkinStyle;
    legacy_model: boolean;
    image: string;
    original: ByMykelSkinOriginal;
}
