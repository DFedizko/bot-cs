import type { CatalogItem } from "../../domain/catalog-item/catalog-item";

export interface CatalogRepository {
    saveAll(items: CatalogItem[]): Promise<void>;
}
