import type { CatalogItemsCriteria, CatalogItemsDao } from "../../application/search-catalog-items/catalog-items.dao";
import type {
    CatalogItemDto,
    SearchCatalogItemsResponse,
} from "../../application/search-catalog-items/search-catalog-items.response";
import { CatalogUnavailableError } from "../../application/search-catalog-items/catalog-unavailable.error";
import { CatalogSearch } from "../../domain/catalog-search/catalog-search";
import type { CatalogItemRecord, CatalogStoreInMemory } from "../stores/catalog.store.in-memory";

export class CatalogItemsDaoInMemory implements CatalogItemsDao {
    constructor(private readonly store: CatalogStoreInMemory) {}

    async search({ text, limit }: CatalogItemsCriteria): Promise<SearchCatalogItemsResponse> {
        if (!this.store.isLoaded()) throw new CatalogUnavailableError();
        const found = new CatalogSearch(text).find(this.store.list(), limit);
        return { items: found.map((record) => this.mapToDto(record)) };
    }

    private mapToDto(record: CatalogItemRecord): CatalogItemDto {
        const { marketHashName, weapon, skin, wear, stattrak, souvenir, category, rarity, imageUrl } = record;
        return { marketHashName, weapon, skin, wear, stattrak, souvenir, category, rarity, imageUrl };
    }
}
