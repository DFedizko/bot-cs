import type { Rarity } from "@/contexts/shared-kernel/domain/rarity";
import type { WearName } from "@/contexts/shared-kernel/domain/wear-name";

export type CatalogItemDto = {
    marketHashName: string;
    weapon: string;
    skin: string | null;
    wear: WearName | null;
    stattrak: boolean;
    souvenir: boolean;
    category: string;
    rarity: Rarity;
    imageUrl: string;
};

export type SearchCatalogItemsResponse = {
    items: CatalogItemDto[];
};
