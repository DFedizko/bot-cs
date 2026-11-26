import type { WantedItemsFilter } from "./wanted-items-filter";
import type { WantedItemsQuery } from "./wanted-items-query";
import type { WantedItemsSearch } from "./wanted-items-search";
import { WANTED_ITEMS_SORT_OPTIONS } from "./wanted-items-sort-options";

const ENABLED_BY_FILTER: Readonly<Record<WantedItemsFilter, boolean | undefined>> = {
    all: undefined,
    active: true,
    paused: false,
};

export function toWantedItemsQuery({ filter, sort, page, pageSize }: WantedItemsSearch): WantedItemsQuery {
    const { sort: field, order } = WANTED_ITEMS_SORT_OPTIONS[sort];
    return { page, pageSize, sort: field, order, enabled: ENABLED_BY_FILTER[filter] };
}
