import type { Paginated } from "@/packages/building-blocks/paginated";
import type { CriteriaPrimitives } from "../../domain/wanted-item/criteria/criteria.factory";
import type { MaxForPrimitives } from "../../domain/wanted-item/max-for/max-for";

export type WantedItemDto = {
    name: string;
    maxFor: MaxForPrimitives;
    criteria: CriteriaPrimitives;
    enabled: boolean;
};

export type ListWantedItemsResponse = Paginated<WantedItemDto>;
