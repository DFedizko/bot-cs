import { Rarity } from "@/contexts/shared-kernel/domain/rarity";
import { WearName } from "@/contexts/shared-kernel/domain/wear-name";
import type { CatalogRow } from "@/contexts/catalog/application/catalog-row";

export const ASIIMOV_IMAGE_URL = "https://community.akamai.steamstatic.com/economy/image/asiimov";

export const catalogRow = (overrides: Partial<CatalogRow> = {}): CatalogRow => ({
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

export const namedRows = (...names: string[]): CatalogRow[] =>
    names.map((marketHashName) => catalogRow({ marketHashName }));
