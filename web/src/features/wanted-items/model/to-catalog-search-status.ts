import type { CatalogItem } from "./catalog-item";
import type { CatalogSearchStatus } from "./catalog-search-status";

type CatalogSearchState = {
    query: string | null;
    searched: string | null;
    items: ReadonlyArray<CatalogItem> | undefined;
    failed: boolean;
};

export function toCatalogSearchStatus({ query, searched, items, failed }: CatalogSearchState): CatalogSearchStatus {
    if (query === null) return "idle";
    if (failed) return "error";
    if (query !== searched || !items) return "loading";
    return items.length === 0 ? "empty" : "results";
}
