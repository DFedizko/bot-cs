import { WearName } from "@/contexts/shared-kernel/domain/wear-name";
import type { CatalogItemPrimitives } from "@/contexts/catalog/domain/catalog-item/catalog-item";
import { Rarity } from "@/contexts/catalog/domain/catalog-item/rarity";

export const ASIIMOV_IMAGE_URL = "https://community.akamai.steamstatic.com/economy/image/asiimov";

export const catalogItemPrimitives = (overrides: Partial<CatalogItemPrimitives> = {}): CatalogItemPrimitives => ({
    marketHashName: "AWP | Asiimov (Field-Tested)",
    weapon: "AWP",
    skin: "Asiimov",
    wear: WearName.FIELD_TESTED,
    stattrak: false,
    souvenir: false,
    category: "Rifles",
    rarity: Rarity.COVERT,
    imageUrl: ASIIMOV_IMAGE_URL,
    ...overrides,
});
