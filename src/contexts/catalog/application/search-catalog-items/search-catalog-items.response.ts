import type { CatalogRow } from "../catalog-row";

export type CatalogItemDto = CatalogRow;

export type SearchCatalogItemsResponse = {
    items: CatalogItemDto[];
};
