import { toFilterChoices } from "../model/to-filter-choices";
import { toWantedItemView } from "../model/to-wanted-item-view";
import { toWantedItemsPagination } from "../model/to-wanted-items-pagination";
import { toWantedItemsQuery } from "../model/to-wanted-items-query";
import { toWantedItemsStatus } from "../model/to-wanted-items-status";
import type { SearchChangeOptions, WantedItemsSearch } from "../model/wanted-items-search";
import { useLastPageRedirect } from "./hooks/useLastPageRedirect";
import { useWantedItemsSearchActions } from "./hooks/useWantedItemsSearchActions";
import { useToggleWantedItemMutation } from "./mutations/useToggleWantedItemMutation";
import { useWantedItemsQuery } from "./queries/useWantedItemsQuery";

type WantedItemsViewModelProps = {
    accountId: string;
    search: WantedItemsSearch;
    onSearchChange: (search: WantedItemsSearch, options?: SearchChangeOptions) => void;
};

const NO_ITEMS = 0;

export function useWantedItemsViewModel({ accountId, search, onSearchChange }: WantedItemsViewModelProps) {
    const { data, isPending, isError, refetch } = useWantedItemsQuery(accountId, toWantedItemsQuery(search));
    const { mutate: toggle } = useToggleWantedItemMutation(accountId);
    const counts = data?.counts;
    const pagination = toWantedItemsPagination(data?.total ?? NO_ITEMS, search);
    useLastPageRedirect(search, data ? pagination.pageCount : null, onSearchChange);
    return {
        status: toWantedItemsStatus({ isPending, isError, counts }),
        search,
        items: data?.items.map(toWantedItemView) ?? [],
        filters: toFilterChoices(counts),
        bidding: counts ? { enabled: counts.enabled, all: counts.all } : null,
        pagination,
        ...useWantedItemsSearchActions(search, onSearchChange),
        toggleItem: (name: string, enabled: boolean) => toggle({ name, enabled }),
        retry: () => void refetch(),
    };
}

export type WantedItemsViewModel = ReturnType<typeof useWantedItemsViewModel>;
