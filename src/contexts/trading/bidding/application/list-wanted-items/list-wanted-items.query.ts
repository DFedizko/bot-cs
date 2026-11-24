import { Query } from "@/packages/building-blocks/query";
import type { QueryOptions } from "@/packages/building-blocks/query-options";
import type { ListWantedItemsResponse } from "./list-wanted-items.response";

export const WANTED_ITEMS_SORT_KEYS = ["recent", "name-asc", "name-desc", "max-asc", "max-desc", "rarity"] as const;

export type WantedItemsSortKey = (typeof WANTED_ITEMS_SORT_KEYS)[number];

export const DEFAULT_WANTED_ITEMS_SORT: WantedItemsSortKey = "recent";

export type WantedItemsFilters = {
    enabled?: boolean;
};

export type ListWantedItemsOptions = QueryOptions<WantedItemsSortKey, WantedItemsFilters>;

type QueryProps = ListWantedItemsOptions & {
    accountId: number;
};

export class ListWantedItemsQuery extends Query<ListWantedItemsResponse> {
    static readonly QUERY_NAME = "list_wanted_items";
    readonly accountId: number;
    readonly page?: number;
    readonly pageSize?: number;
    readonly sort?: WantedItemsSortKey;
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
