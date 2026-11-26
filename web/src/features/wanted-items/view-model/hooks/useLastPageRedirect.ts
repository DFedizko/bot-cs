import { useEffect } from "react";
import type { SearchChangeOptions, WantedItemsSearch } from "../../model/wanted-items-search";

const REPLACE_ENTRY: SearchChangeOptions = { replace: true };

export function useLastPageRedirect(
    search: WantedItemsSearch,
    pageCount: number | null,
    onSearchChange: (search: WantedItemsSearch, options?: SearchChangeOptions) => void,
) {
    const isPastEnd = pageCount !== null && search.page > pageCount;
    useEffect(() => {
        if (isPastEnd) onSearchChange({ ...search, page: pageCount }, REPLACE_ENTRY);
    }, [isPastEnd, pageCount, search, onSearchChange]);
}
