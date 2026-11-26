import { toRarityTone } from "@/shared/model/rarity/to-rarity-tone";
import { describeMax } from "./describe-max";
import { toWeaponLabel } from "./to-weapon-label";
import type { WantedItem } from "./wanted-item";
import type { WantedItemView } from "./wanted-item-view";

const UNKNOWN_ITEM = {
    weapon: null,
    rarityName: null,
    tone: null,
    imageUrl: null,
    wear: null,
    stattrak: false,
    souvenir: false,
};

export function toWantedItemView({ name, maxFor, enabled, catalog }: WantedItem): WantedItemView {
    const shared = { name, enabled, max: describeMax(maxFor) };
    if (!catalog) return { ...shared, ...UNKNOWN_ITEM, title: name, shortName: name };
    const weapon = toWeaponLabel(name, catalog.weapon);
    return {
        ...shared,
        title: catalog.skin,
        shortName: `${weapon} | ${catalog.skin}`,
        weapon,
        rarityName: catalog.rarity,
        tone: toRarityTone(catalog.rarity),
        imageUrl: catalog.imageUrl,
        wear: catalog.wear,
        stattrak: catalog.stattrak,
        souvenir: catalog.souvenir,
    };
}
