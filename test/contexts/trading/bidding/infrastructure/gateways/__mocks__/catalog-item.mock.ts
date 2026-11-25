import type { CatalogItemDto } from "@/contexts/catalog";
import { Rarity } from "@/contexts/shared-kernel/domain/rarity";
import { WearName } from "@/contexts/shared-kernel/domain/wear-name";

export const ASIIMOV = "AWP | Asiimov (Field-Tested)";
export const KARAMBIT = "★ Karambit";
export const ASIIMOV_IMAGE = "https://community.akamai.steamstatic.com/economy/image/asiimov";
export const KARAMBIT_IMAGE = "https://community.akamai.steamstatic.com/economy/image/karambit";

export const asiimovItem = (overrides: Partial<CatalogItemDto> = {}): CatalogItemDto => ({
    marketHashName: ASIIMOV,
    weapon: "AWP",
    skin: "Asiimov",
    wear: WearName.FIELD_TESTED,
    stattrak: false,
    souvenir: false,
    category: "Rifles",
    rarity: Rarity.COVERT,
    imageUrl: ASIIMOV_IMAGE,
    ...overrides,
});

export const vanillaKarambitItem = (): CatalogItemDto => ({
    marketHashName: KARAMBIT,
    weapon: "Karambit",
    skin: null,
    wear: null,
    stattrak: false,
    souvenir: false,
    category: "Knives",
    rarity: Rarity.COVERT,
    imageUrl: KARAMBIT_IMAGE,
});
