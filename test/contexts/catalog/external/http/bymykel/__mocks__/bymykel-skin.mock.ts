import type { ByMykelSkin } from "@/contexts/catalog/infrastructure/http/bymykel/types/bymykel-skin";

const STEAM_IMAGE = "https://community.akamai.steamstatic.com/economy/image/";
const ASIIMOV_IMAGE =
    "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_jdk7uW-V6V-Kf2cGFidxOp_pewnF3nhxEt0sGnSzN76dH3GOg9xC8FyEORftRe-x9PuYurq71bW3d8UnjK-0H0YSTpMGQ";

export const steamImage = (hash: string): string => `${STEAM_IMAGE}${hash}`;

export const awpAsiimovFieldTested = {
    id: "skin-bb633c21fc25_0",
    skin_id: "skin-bb633c21fc25",
    name: "AWP | Asiimov (Field-Tested)",
    description:
        "High risk and high reward, the infamous AWP is recognizable by its signature report and one-shot, one-kill policy. It has been custom painted with a sci-fi design.\\n\\n<i>Anyone can predict the future... a visionary shapes it</i>",
    weapon: { id: "weapon_awp", weapon_id: 9, name: "AWP" },
    category: { id: "csgo_inventory_weapon_category_rifles", name: "Rifles" },
    pattern: { id: "cu_awp_asimov", name: "Asiimov" },
    min_float: 0.18,
    max_float: 1,
    wear: { id: "SFUI_InvTooltip_Wear_Amount_2", name: "Field-Tested" },
    stattrak: false,
    souvenir: false,
    paint_index: "279",
    rarity: { id: "rarity_ancient_weapon", name: "Covert", color: "#eb4b4b" },
    market_hash_name: "AWP | Asiimov (Field-Tested)",
    team: { id: "both", name: "Both Teams" },
    style: {
        id: 7,
        name: "Custom Paint Job",
        url: "https://www.counter-strike.net/workshop/workshopfinishes#custompaint",
    },
    legacy_model: true,
    image: steamImage(ASIIMOV_IMAGE),
    original: { name: "weapon_awp", image_inventory: "econ/default_generated/weapon_awp_cu_awp_asimov_medium" },
} satisfies ByMykelSkin;

export const byMykelSkin = (overrides: Partial<ByMykelSkin> = {}): ByMykelSkin => ({
    ...structuredClone(awpAsiimovFieldTested),
    ...overrides,
});
