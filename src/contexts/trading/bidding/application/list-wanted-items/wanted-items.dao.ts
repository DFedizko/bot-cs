import type { Pagination } from "@/packages/building-blocks/pagination";
import type { ListWantedItemsResponse } from "./list-wanted-items.response";

export type WantedItemsFilter = {
    accountId: number;
    enabled?: boolean;
};

export interface WantedItemsDao {
    list(filter: WantedItemsFilter, pagination: Pagination): Promise<ListWantedItemsResponse>;
}
