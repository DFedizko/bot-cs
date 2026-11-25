import type { SearchCatalogItemsResponse } from "./search-catalog-items.response";

export type CatalogItemsCriteria = {
    text: string;
    limit: number;
};

export interface CatalogItemsDao {
    search(criteria: CatalogItemsCriteria): Promise<SearchCatalogItemsResponse>;
}
