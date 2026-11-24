import type { CatalogRepository } from "../../application/load-catalog/catalog.repository";
import type { CatalogItem } from "../../domain/catalog-item/catalog-item";
import type { CatalogStoreInMemory } from "../stores/catalog.store.in-memory";

export class CatalogRepositoryInMemory implements CatalogRepository {
    constructor(private readonly store: CatalogStoreInMemory) {}

    async saveAll(items: CatalogItem[]): Promise<void> {
        this.store.replaceAll(items.map((item) => item.toPrimitives()));
    }
}
