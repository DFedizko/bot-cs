import { Plus } from "lucide-react";
import { Button } from "@/shared/ui/components/button";
import { AppTopbar, AppTopbarSearch, AppTopbarTitle } from "@/shared/ui/layouts/app-topbar";

export function WantedItemsPage() {
    return (
        <AppTopbar>
            <AppTopbarTitle>Wanted items</AppTopbarTitle>
            <AppTopbarSearch />
            <Button>
                <Plus data-icon="inline-start" aria-hidden />
                Add wanted item
            </Button>
        </AppTopbar>
    );
}
