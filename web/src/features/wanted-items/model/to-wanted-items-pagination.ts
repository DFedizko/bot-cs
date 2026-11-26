import { countPages } from "./count-pages";
import { WANTED_ITEMS_PAGE_SIZES } from "./wanted-items-page-sizes";
import type { WantedItemsSearch } from "./wanted-items-search";

export type WantedItemsPagination = {
    page: number;
    pageCount: number;
    pageSize: number;
    pageSizes: ReadonlyArray<number>;
    from: number;
    to: number;
    total: number;
};

const FIRST_ITEM = 1;

export function toWantedItemsPagination(total: number, { page, pageSize }: WantedItemsSearch): WantedItemsPagination {
    return {
        page,
        pageCount: countPages(total, pageSize),
        pageSize,
        pageSizes: WANTED_ITEMS_PAGE_SIZES,
        from: total === 0 ? 0 : (page - FIRST_ITEM) * pageSize + FIRST_ITEM,
        to: Math.min(total, page * pageSize),
        total,
    };
}
