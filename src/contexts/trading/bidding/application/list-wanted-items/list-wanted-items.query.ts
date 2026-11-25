import { Query } from "@/packages/building-blocks/query";
import type { QueryOptions } from "@/packages/building-blocks/query-options";
import { DESCENDING, type Sort } from "@/packages/building-blocks/sort";
import type { ListWantedItemsResponse } from "./list-wanted-items.response";

export const WANTED_ITEMS_SORT_FIELDS = ["addedAt", "name", "max", "rarity"] as const;

export type WantedItemsSortField = (typeof WANTED_ITEMS_SORT_FIELDS)[number];

export type WantedItemsSort = Sort<WantedItemsSortField>;

export const DEFAULT_WANTED_ITEMS_SORT: WantedItemsSort = { field: "addedAt", order: DESCENDING };

export type WantedItemsFilters = {
    enabled?: boolean;
};

export type ListWantedItemsOptions = QueryOptions<WantedItemsSortField, WantedItemsFilters>;

type QueryProps = ListWantedItemsOptions & {
    accountId: number;
};

export class ListWantedItemsQuery extends Query<ListWantedItemsResponse> {
    static readonly QUERY_NAME = "list_wanted_items";
    readonly accountId: number;
    readonly page?: number;
    readonly pageSize?: number;
    readonly sort?: WantedItemsSort;
    readonly filters?: WantedItemsFilters;

    constructor(props: QueryProps) {
        super();
        this.accountId = props.accountId;
        this.page = props.page;
        this.pageSize = props.pageSize;
        this.sort = props.sort;
        this.filters = props.filters;
    }
}
