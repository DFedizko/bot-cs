import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { WantedItemsScreen } from "@/features/wanted-items";
import type { WantedItemsSearch } from "@/features/wanted-items";
import { Button } from "@/shared/ui/components/button";
import { AppTopbar, AppTopbarSearch, AppTopbarTitle } from "@/shared/ui/layouts/app-topbar";

const WANTED_ITEMS_ROUTE = "/accounts/$accountId/wanted-items";

export function WantedItemsPage() {
    const { accountId } = useParams({ from: WANTED_ITEMS_ROUTE });
    const search = useSearch({ from: WANTED_ITEMS_ROUTE });
    const navigate = useNavigate({ from: WANTED_ITEMS_ROUTE });
    const changeSearch = (next: WantedItemsSearch) => void navigate({ search: next });
    return (
        <>
            <AppTopbar>
                <AppTopbarTitle>Wanted items</AppTopbarTitle>
                <AppTopbarSearch />
                <Button>
                    <Plus data-icon="inline-start" aria-hidden />
                    Add wanted item
                </Button>
            </AppTopbar>
            <WantedItemsScreen accountId={accountId} search={search} onSearchChange={changeSearch} />
        </>
    );
}
