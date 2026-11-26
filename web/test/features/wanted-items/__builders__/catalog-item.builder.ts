import type { CatalogItem } from "@/features/wanted-items/model/catalog-item";

const BASE_ITEM: CatalogItem = {
    marketHashName: "AWP | Asiimov (Field-Tested)",
    weapon: "AWP",
    skin: "Asiimov",
    wear: "Field-Tested",
    stattrak: false,
    souvenir: false,
    category: "Sniper Rifles",
    rarity: "Covert",
    imageUrl: "https://x.test/awp.png",
};

export const catalogItemBuilder = (overrides: Partial<CatalogItem> = {}): CatalogItem => ({
    ...BASE_ITEM,
    ...overrides,
});
