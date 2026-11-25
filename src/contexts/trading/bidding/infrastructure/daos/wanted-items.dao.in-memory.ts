import { PaginatorInMemory } from "@/packages/infrastructure/in-memory-query/paginator.in-memory";
import type { Pagination } from "@/packages/building-blocks/pagination";
import type { WantedItemsCriteria, WantedItemsDao } from "../../application/list-wanted-items/wanted-items.dao";
import type { WantedItemsSort } from "../../application/list-wanted-items/list-wanted-items.query";
import type {
    CatalogDetailsByName,
    CatalogDetailsDto,
    CatalogDetailsGateway,
} from "../../application/list-wanted-items/catalog-details.gateway";
import type {
    ListWantedItemsResponse,
    WantedItemCounts,
    WantedItemDto,
} from "../../application/list-wanted-items/list-wanted-items.response";
import type { WantedItemRecord, WantedItemStoreInMemory } from "../stores/wanted-item.store.in-memory";
import { compareWantedItemsBy, type WantedItemEntry } from "./wanted-items.comparators";

export class WantedItemsDaoInMemory implements WantedItemsDao {
    constructor(
        private readonly store: WantedItemStoreInMemory,
        private readonly catalog: CatalogDetailsGateway,
    ) {}

    async list(
        { accountId, filters, sort }: WantedItemsCriteria,
        pagination: Pagination,
    ): Promise<ListWantedItemsResponse> {
        const records = this.store.listOf(accountId);
        const matching = records.filter((record) => this.matchesEnabled(record, filters?.enabled));
        const details = await this.catalog.findByNames(matching.map(({ name }) => name));
        const entries = matching.map((record) => this.toEntry(record, details));
        const page = PaginatorInMemory.paginate(this.sortBy(entries, sort), pagination);
        return { ...page, items: page.items.map((entry) => this.mapToDto(entry)), counts: this.countAll(records) };
    }

    private matchesEnabled(record: WantedItemRecord, enabled?: boolean): boolean {
        return enabled === undefined || record.enabled === enabled;
    }

    private toEntry(record: WantedItemRecord, details: CatalogDetailsByName): WantedItemEntry {
        return { record, catalog: details.get(record.name) ?? null };
    }

    private sortBy(entries: WantedItemEntry[], sort: WantedItemsSort): WantedItemEntry[] {
        return this.lastInsertedFirst(entries).toSorted(compareWantedItemsBy(sort));
    }

    private lastInsertedFirst(entries: WantedItemEntry[]): WantedItemEntry[] {
        return entries.toReversed();
    }

    private countAll(records: WantedItemRecord[]): WantedItemCounts {
        const enabled = records.filter((record) => record.enabled).length;
        return { all: records.length, enabled, disabled: records.length - enabled };
    }

    private mapToDto({ record, catalog }: WantedItemEntry): WantedItemDto {
        const { name, maxFor, criteria, enabled, addedAt } = record;
        return {
            name,
            maxFor: { ...maxFor },
            criteria: criteria.map((criterion) => ({ ...criterion })),
            enabled,
            addedAt: new Date(addedAt).toISOString(),
            catalog: catalog && this.copyCatalog(catalog),
        };
    }

    private copyCatalog(catalog: CatalogDetailsDto): CatalogDetailsDto {
        return { ...catalog };
    }
}
