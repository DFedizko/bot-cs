import type { CatalogItemsDaoReadThroughCache } from "../daos/catalog-items.dao.read-through-cache";

export class CatalogLoadingStartupController {
    constructor(private readonly cache: CatalogItemsDaoReadThroughCache) {}

    start(): Promise<void> {
        return this.cache.warmUp();
    }
}
