import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { countPages } from "../model/count-pages";
import { toWantedItemView } from "../model/to-wanted-item-view";
import { toWantedItemsQuery } from "../model/to-wanted-items-query";
import type { WantedItemView } from "../model/wanted-item-view";
import type { WantedItemsFilter } from "../model/wanted-items-filter";
import { WANTED_ITEMS_FILTERS } from "../model/wanted-items-filters";
import type { WantedItemsCounts, WantedItemsPage } from "../model/wanted-items-page";
import { WANTED_ITEMS_PAGE_SIZES } from "../model/wanted-items-page-sizes";
import type { SearchChangeOptions, WantedItemsSearch } from "../model/wanted-items-search";
import { useWantedItemsService } from "../ports/wanted-items.service";
import { useToggleWantedItem } from "./hooks/useToggleWantedItem";
import { useWantedItemsSearchActions } from "./hooks/useWantedItemsSearchActions";
import { wantedItemsQuery } from "./wanted-items-query";

export type WantedItemsStatus = "loading" | "error" | "empty" | "ready";

export type WantedItemsFilterChoice = { value: WantedItemsFilter; count: number | null };

export type WantedItemsPagination = {
    page: number;
    pageCount: number;
    pageSize: number;
    pageSizes: ReadonlyArray<number>;
    from: number;
    to: number;
    total: number;
};

type WantedItemsViewModelProps = {
    accountId: string;
    search: WantedItemsSearch;
    onSearchChange: (search: WantedItemsSearch, options?: SearchChangeOptions) => void;
};

const REPLACE_ENTRY: SearchChangeOptions = { replace: true };
const COUNT_BY_FILTER: Readonly<Record<WantedItemsFilter, keyof WantedItemsCounts>> = {
    all: "all",
    active: "enabled",
    paused: "disabled",
};

const toStatus = (isPending: boolean, isError: boolean, data?: WantedItemsPage): WantedItemsStatus => {
    if (isError) return "error";
    if (isPending || !data) return "loading";
    return data.counts.all === 0 ? "empty" : "ready";
};

const toPagination = (data: WantedItemsPage | undefined, search: WantedItemsSearch): WantedItemsPagination => {
    const total = data?.total ?? 0;
    const from = total === 0 ? 0 : (search.page - 1) * search.pageSize + 1;
    return {
        page: search.page,
        pageCount: countPages(total, search.pageSize),
        pageSize: search.pageSize,
        pageSizes: WANTED_ITEMS_PAGE_SIZES,
        from,
        to: Math.min(total, search.page * search.pageSize),
        total,
    };
};

export function useWantedItemsViewModel({ accountId, search, onSearchChange }: WantedItemsViewModelProps) {
    const query = useQuery(wantedItemsQuery(useWantedItemsService(), accountId, toWantedItemsQuery(search)));
    const toggle = useToggleWantedItem(accountId);
    const counts: WantedItemsCounts | undefined = query.data?.counts;
    const pagination = toPagination(query.data, search);
    const actions = useWantedItemsSearchActions(search, onSearchChange);
    const isPastEnd = query.data !== undefined && search.page > pagination.pageCount;
    const lastPage = pagination.pageCount;
    useEffect(() => {
        if (isPastEnd) onSearchChange({ ...search, page: lastPage }, REPLACE_ENTRY);
    }, [isPastEnd, lastPage, search, onSearchChange]);
    const items: Array<WantedItemView> = query.data?.items.map(toWantedItemView) ?? [];
    return {
        status: toStatus(query.isPending, query.isError, query.data),
        search,
        items,
        filters: WANTED_ITEMS_FILTERS.map((value): WantedItemsFilterChoice => ({
            value,
            count: counts ? counts[COUNT_BY_FILTER[value]] : null,
        })),
        bidding: counts ? { enabled: counts.enabled, all: counts.all } : null,
        pagination,
        ...actions,
        toggleItem: (name: string, enabled: boolean) => toggle.mutate({ name, enabled }),
        retry: () => void query.refetch(),
    };
}

export type WantedItemsViewModel = ReturnType<typeof useWantedItemsViewModel>;
