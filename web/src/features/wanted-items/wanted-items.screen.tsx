import type { SearchChangeOptions, WantedItemsSearch } from "./model/wanted-items-search";
import { WantedItemsView } from "./view/wanted-items.view";
import { useWantedItemsViewModel } from "./view-model/useWantedItemsViewModel";

type WantedItemsScreenProps = {
    accountId: string;
    search: WantedItemsSearch;
    onSearchChange: (search: WantedItemsSearch, options?: SearchChangeOptions) => void;
};

export function WantedItemsScreen(props: WantedItemsScreenProps) {
    return <WantedItemsView {...useWantedItemsViewModel(props)} />;
}
