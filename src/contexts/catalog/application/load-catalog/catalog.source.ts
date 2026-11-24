import type { CatalogItem } from "../../domain/catalog-item/catalog-item";

export interface CatalogSource {
    load(): Promise<CatalogItem[]>;
}
