import { DEFAULT_WANTED_ITEMS_SEARCH } from "./default-wanted-items-search";
import { WANTED_ITEMS_FILTERS } from "./wanted-items-filters";
import { WANTED_ITEMS_PAGE_SIZES } from "./wanted-items-page-sizes";
import type { WantedItemsSearch } from "./wanted-items-search";
import { WANTED_ITEMS_SORT_OPTIONS } from "./wanted-items-sort-options";
import type { WantedItemsSort } from "./wanted-items-sort";
import type { WantedItemsViewMode } from "./wanted-items-view-mode";

const VIEW_MODES: ReadonlyArray<WantedItemsViewMode> = ["grid", "list"];
const SORTS = Object.keys(WANTED_ITEMS_SORT_OPTIONS) as Array<WantedItemsSort>;
const FIRST_PAGE = 1;

const pickOne = <TValue>(allowed: ReadonlyArray<TValue>, value: unknown, fallback: TValue): TValue =>
    allowed.find((candidate) => candidate === value) ?? fallback;

const readPage = (value: unknown) => {
    const page = Number(value);
    return Number.isInteger(page) && page >= FIRST_PAGE ? page : FIRST_PAGE;
};

export function validateWantedItemsSearch(search: Record<string, unknown>): WantedItemsSearch {
    return {
        filter: pickOne(WANTED_ITEMS_FILTERS, search.filter, DEFAULT_WANTED_ITEMS_SEARCH.filter),
        sort: pickOne(SORTS, search.sort, DEFAULT_WANTED_ITEMS_SEARCH.sort),
        page: readPage(search.page),
        pageSize: pickOne(WANTED_ITEMS_PAGE_SIZES, Number(search.pageSize), DEFAULT_WANTED_ITEMS_SEARCH.pageSize),
        view: pickOne(VIEW_MODES, search.view, DEFAULT_WANTED_ITEMS_SEARCH.view),
    };
}
