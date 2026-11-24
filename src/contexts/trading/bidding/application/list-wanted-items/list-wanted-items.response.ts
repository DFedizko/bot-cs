import type { Paginated } from "@/packages/building-blocks/paginated";
import type { CriteriaPrimitives } from "../../domain/wanted-item/criteria/criteria.factory";
import type { MaxForPrimitives } from "../../domain/wanted-item/max-for/max-for";
import type { CatalogDetailsDto } from "./catalog-details.gateway";

export type WantedItemDto = {
    name: string;
    maxFor: MaxForPrimitives;
    criteria: CriteriaPrimitives;
    enabled: boolean;
    addedAt: string;
    catalog: CatalogDetailsDto | null;
};

export type WantedItemCounts = {
    all: number;
    enabled: number;
    disabled: number;
};

export type ListWantedItemsResponse = Paginated<WantedItemDto> & {
    readonly counts: WantedItemCounts;
};
