import type { WantedItemsFilter } from "./wanted-items-filter";
import type { WantedItemsSort } from "./wanted-items-sort";
import type { WantedItemsViewMode } from "./wanted-items-view-mode";

export type SearchChangeOptions = { replace?: boolean };

export type WantedItemsSearch = {
    filter: WantedItemsFilter;
    sort: WantedItemsSort;
    page: number;
    pageSize: number;
    view: WantedItemsViewMode;
};
