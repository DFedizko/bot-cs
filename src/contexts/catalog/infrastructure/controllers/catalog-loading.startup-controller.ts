import type { CatalogItemsDaoMemoryCache } from "../daos/catalog-items.dao.memory-cache";

export class CatalogLoadingStartupController {
    constructor(private readonly cache: CatalogItemsDaoMemoryCache) {}

    start(): Promise<void> {
        return this.cache.warmUp();
    }
}
