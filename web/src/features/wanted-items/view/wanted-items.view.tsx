import type { WantedItemsViewModel } from "../view-model/useWantedItemsViewModel";
import { WantedItemsEmpty } from "./components/wanted-items-empty";
import { WantedItemsError } from "./components/wanted-items-error";
import { WantedItemsGrid } from "./components/wanted-items-grid";
import { WantedItemsList } from "./components/wanted-items-list";
import { WantedItemsLoading } from "./components/wanted-items-loading";
import { WantedItemsNoMatch } from "./components/wanted-items-no-match";
import { WantedItemsPager } from "./components/wanted-items-pager";
import { WantedItemsToolbar } from "./components/wanted-items-toolbar";

function WantedItemsContent(viewModel: WantedItemsViewModel) {
    const { items, search, toggleItem } = viewModel;
    if (items.length === 0) return <WantedItemsNoMatch />;
    if (search.view === "list") return <WantedItemsList items={items} onToggle={toggleItem} />;
    return <WantedItemsGrid items={items} onToggle={toggleItem} />;
}

export function WantedItemsView(viewModel: WantedItemsViewModel) {
    const { status, pagination, retry, selectPage, selectPageSize } = viewModel;
    if (status === "empty") return <WantedItemsEmpty />;
    if (status === "error") return <WantedItemsError onRetry={retry} />;
    return (
        <section aria-label="Wanted items" className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
            <WantedItemsToolbar {...viewModel} />
            {status === "loading" ? (
                <WantedItemsLoading count={pagination.pageSize} />
            ) : (
                <WantedItemsContent {...viewModel} />
            )}
            <WantedItemsPager pagination={pagination} onPageChange={selectPage} onPageSizeChange={selectPageSize} />
        </section>
    );
}
