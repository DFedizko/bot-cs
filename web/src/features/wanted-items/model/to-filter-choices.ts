import type { WantedItemsFilter } from "./wanted-items-filter";
import { WANTED_ITEMS_FILTERS } from "./wanted-items-filters";
import type { WantedItemsCounts } from "./wanted-items-page";

export type WantedItemsFilterChoice = { value: WantedItemsFilter; count: number | null };

const COUNT_BY_FILTER: Readonly<Record<WantedItemsFilter, keyof WantedItemsCounts>> = {
    all: "all",
    active: "enabled",
    paused: "disabled",
};

export const toFilterChoices = (counts: WantedItemsCounts | undefined): Array<WantedItemsFilterChoice> =>
    WANTED_ITEMS_FILTERS.map((value) => ({ value, count: counts ? counts[COUNT_BY_FILTER[value]] : null }));
