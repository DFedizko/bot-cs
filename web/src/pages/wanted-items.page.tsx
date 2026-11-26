import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { WantedItemsScreen } from "@/features/wanted-items";
import type { SearchChangeOptions, WantedItemsSearch } from "@/features/wanted-items";
import { useCommandPaletteStore } from "@/shared/lib/store/command-palette.store";
import { Button } from "@/shared/ui/components/button";
import { AppTopbar, AppTopbarSearch, AppTopbarTitle } from "@/shared/ui/layouts/app-topbar";

const WANTED_ITEMS_ROUTE = "/accounts/$accountId/wanted-items";

export function WantedItemsPage() {
    const { accountId } = useParams({ from: WANTED_ITEMS_ROUTE });
    const search = useSearch({ from: WANTED_ITEMS_ROUTE });
    const navigate = useNavigate({ from: WANTED_ITEMS_ROUTE });
    const setPaletteOpen = useCommandPaletteStore((state) => state.setOpen);
    const changeSearch = (next: WantedItemsSearch, options: SearchChangeOptions = {}) =>
        void navigate({ search: next, replace: options.replace });
    return (
        <>
            <AppTopbar>
                <AppTopbarTitle>Wanted items</AppTopbarTitle>
                <AppTopbarSearch />
                <Button onClick={() => setPaletteOpen(true)}>
                    <Plus data-icon="inline-start" aria-hidden />
                    Add wanted item
                </Button>
            </AppTopbar>
            <WantedItemsScreen accountId={accountId} search={search} onSearchChange={changeSearch} />
        </>
    );
}
