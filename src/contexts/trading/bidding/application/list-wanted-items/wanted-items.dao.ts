import type { Pagination } from "@/packages/building-blocks/pagination";
import type { ListWantedItemsResponse } from "./list-wanted-items.response";
import type { WantedItemsFilters, WantedItemsSort } from "./list-wanted-items.query";

export type WantedItemsCriteria = {
    accountId: number;
    filters?: WantedItemsFilters;
    sort: WantedItemsSort;
};

export interface WantedItemsDao {
    list(criteria: WantedItemsCriteria, pagination: Pagination): Promise<ListWantedItemsResponse>;
}
