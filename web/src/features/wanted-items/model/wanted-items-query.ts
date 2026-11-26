import type { SortField, SortOrder } from "./wanted-items-sort-options";

export type WantedItemsQuery = {
    page: number;
    pageSize: number;
    sort: SortField;
    order: SortOrder;
    enabled?: boolean;
};
