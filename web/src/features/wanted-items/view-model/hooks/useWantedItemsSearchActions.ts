import type { WantedItemsFilter } from "../../model/wanted-items-filter";
import type { WantedItemsSearch } from "../../model/wanted-items-search";
import type { WantedItemsSort } from "../../model/wanted-items-sort";
import type { WantedItemsViewMode } from "../../model/wanted-items-view-mode";

const FIRST_PAGE = 1;

export function useWantedItemsSearchActions(
    search: WantedItemsSearch,
    onSearchChange: (search: WantedItemsSearch) => void,
) {
    const restart = (change: Partial<WantedItemsSearch>) => onSearchChange({ ...search, ...change, page: FIRST_PAGE });
    return {
        selectFilter: (filter: WantedItemsFilter) => restart({ filter }),
        selectSort: (sort: WantedItemsSort) => restart({ sort }),
        selectPageSize: (pageSize: number) => restart({ pageSize }),
        selectPage: (page: number) => onSearchChange({ ...search, page }),
        selectView: (view: WantedItemsViewMode) => onSearchChange({ ...search, view }),
    };
}
