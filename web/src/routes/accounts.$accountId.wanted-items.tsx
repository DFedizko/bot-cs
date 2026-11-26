import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import type { SearchSchemaInput } from "@tanstack/react-router";
import { DEFAULT_WANTED_ITEMS_SEARCH, validateWantedItemsSearch } from "@/features/wanted-items";
import type { RawWantedItemsSearch } from "@/features/wanted-items";
import { WantedItemsPage } from "@/pages/wanted-items.page";

export const Route = createFileRoute("/accounts/$accountId/wanted-items")({
    validateSearch: (search: RawWantedItemsSearch & SearchSchemaInput) => validateWantedItemsSearch(search),
    search: { middlewares: [stripSearchParams(DEFAULT_WANTED_ITEMS_SEARCH)] },
    component: WantedItemsPage,
});
