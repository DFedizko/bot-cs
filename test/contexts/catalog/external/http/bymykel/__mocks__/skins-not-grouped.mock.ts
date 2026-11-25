import type { ByMykelSkin } from "@/contexts/catalog/infrastructure/http/bymykel/types/bymykel-skin";
import type { GetSkinsNotGrouped } from "@/contexts/catalog/infrastructure/http/bymykel/get-skins-not-grouped";
import { awpAsiimovFieldTested, byMykelSkin, steamImage } from "./bymykel-skin.mock";

const FACTORY_NEW = { id: "SFUI_InvTooltip_Wear_Amount_0", name: "Factory New" };
const RIFLES = { id: "csgo_inventory_weapon_category_rifles", name: "Rifles" };
const AK_47 = { id: "weapon_ak47", weapon_id: 7, name: "AK-47" };
const KNIVES = { id: "sfui_invpanel_filter_melee", name: "Knives" };

const factoryNewAk = (pattern: string, rarity: ByMykelSkin["rarity"]): ByMykelSkin =>
    byMykelSkin({
        name: `AK-47 | ${pattern} (Factory New)`,
        market_hash_name: `AK-47 | ${pattern} (Factory New)`,
        weapon: AK_47,
        pattern: { id: pattern.toLowerCase(), name: pattern },
        wear: FACTORY_NEW,
        rarity,
    });

export const stattrakAwpAsiimov = byMykelSkin({
    id: "skin-bb633c21fc25_0_st",
    name: "StatTrak™ AWP | Asiimov (Field-Tested)",
    market_hash_name: "StatTrak™ AWP | Asiimov (Field-Tested)",
    stattrak: true,
});

export const souvenirAugSurveillance = byMykelSkin({
    name: "Souvenir AUG | Surveillance (Factory New)",
    market_hash_name: "Souvenir AUG | Surveillance (Factory New)",
    weapon: { id: "weapon_aug", weapon_id: 8, name: "AUG" },
    pattern: { id: "am_intelligence_grey", name: "Surveillance" },
    wear: FACTORY_NEW,
    souvenir: true,
    rarity: { id: "rarity_common_weapon", name: "Consumer Grade", color: "#b0c3d9" },
    image: steamImage("aug-surveillance"),
});

export const akOlivePolycam = factoryNewAk("Olive Polycam", {
    id: "rarity_uncommon_weapon",
    name: "Industrial Grade",
    color: "#5e98d9",
});
export const akUncharted = factoryNewAk("Uncharted", {
    id: "rarity_rare_weapon",
    name: "Mil-Spec Grade",
    color: "#4b69ff",
});
export const akFirstClass = factoryNewAk("First Class", {
    id: "rarity_mythical_weapon",
    name: "Restricted",
    color: "#8847ff",
});
export const akCraneFlight = factoryNewAk("Crane Flight", {
    id: "rarity_legendary_weapon",
    name: "Classified",
    color: "#d32ce6",
});

export const handWrapsSpruceDdpat = byMykelSkin({
    name: "★ Hand Wraps | Spruce DDPAT (Factory New)",
    market_hash_name: "★ Hand Wraps | Spruce DDPAT (Factory New)",
    weapon: { id: "leather_handwraps", weapon_id: 5032, name: "Hand Wraps" },
    category: { id: "sfui_invpanel_filter_gloves", name: "Gloves" },
    pattern: { id: "handwrap_camo_grey", name: "Spruce DDPAT" },
    wear: FACTORY_NEW,
    rarity: { id: "rarity_ancient", name: "Extraordinary", color: "#eb4b4b" },
});

export const m4a4Howl = byMykelSkin({
    name: "M4A4 | Howl (Factory New)",
    market_hash_name: "M4A4 | Howl (Factory New)",
    weapon: { id: "weapon_m4a1", weapon_id: 16, name: "M4A4" },
    category: RIFLES,
    pattern: { id: "cu_m4a1_howling", name: "Howl" },
    wear: FACTORY_NEW,
    rarity: { id: "rarity_contraband_weapon", name: "Contraband", color: "#e4ae39" },
    special_notes: [
        {
            source: "https://steamcommunity.com/games/CSGO/announcements/detail/1751086783896069815",
            text: "This skin's appearance and rarity was changed from Covert to Contraband due to art theft.",
        },
    ],
});

export const vanillaKarambit = {
    id: "skin-vanilla-weapon_knife_karambit",
    skin_id: "skin-vanilla-weapon_knife_karambit",
    name: "★ Karambit",
    description: "The karambit is based on traditional Southeast Asian knives shaped to resemble a tiger's claw.",
    weapon: { id: "sfui_wpnhud_knifekaram", weapon_id: 507, name: "Karambit" },
    category: KNIVES,
    rarity: { id: "rarity_ancient_weapon", name: "Covert", color: "#eb4b4b" },
    stattrak: false,
    paint_index: null,
    market_hash_name: "★ Karambit",
    team: { id: "both", name: "Both Teams" },
    style: { id: 0, name: "None", url: null },
    legacy_model: true,
    image: steamImage("karambit"),
    original: { name: "weapon_knife_karambit", image_inventory: "econ/weapons/base_weapons/weapon_knife_karambit" },
} satisfies ByMykelSkin;

export const bayonetBlueSteel = byMykelSkin({
    name: "★ Bayonet | Blue Steel (Factory New)",
    market_hash_name: "★ Bayonet | Blue Steel (Factory New)",
    weapon: { id: "weapon_bayonet", weapon_id: 500, name: "Bayonet" },
    category: KNIVES,
    pattern: { id: "aq_blued_knife", name: "Blue Steel" },
    wear: FACTORY_NEW,
    image: "https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_bayonet_aq_blued_knife_light_png.png",
});

export const karambitDopplerBlackPearl = byMykelSkin({
    name: "★ Karambit | Doppler (Factory New)",
    market_hash_name: "★ Karambit | Doppler (Factory New)",
    weapon: { id: "weapon_knife_karambit", weapon_id: 507, name: "Karambit" },
    category: KNIVES,
    pattern: { id: "am_blackpearl_marbleized", name: "Doppler" },
    wear: FACTORY_NEW,
    phase: "Black Pearl",
});

export const skinsNotGrouped = (): GetSkinsNotGrouped.Response =>
    [
        byMykelSkin(),
        stattrakAwpAsiimov,
        souvenirAugSurveillance,
        akOlivePolycam,
        akUncharted,
        akFirstClass,
        akCraneFlight,
        handWrapsSpruceDdpat,
        m4a4Howl,
        vanillaKarambit,
        bayonetBlueSteel,
        karambitDopplerBlackPearl,
    ].map((skin) => structuredClone(skin));

export const skinsNotFound = "404: Not Found" satisfies GetSkinsNotGrouped.ErrorResponse;

export { awpAsiimovFieldTested };
