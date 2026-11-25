import type { CatalogItemDto } from "../search-catalog-items/search-catalog-items.response";

export type CatalogLookupResponse = {
    items: CatalogItemDto[];
};

export interface CatalogLookup {
    findByNames(names: readonly string[]): Promise<CatalogLookupResponse>;
}
