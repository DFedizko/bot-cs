import { RARITY_ORDER } from "@/contexts/shared-kernel/domain/rarity-order";
import type { Pagination } from "@/packages/building-blocks/pagination";
import { DESCENDING, type SortOrder } from "@/packages/building-blocks/sort";
import { PaginatorInMemory } from "@/packages/infrastructure/in-memory-query/paginator.in-memory";
import { EqualsFilter } from "@/packages/infrastructure/in-memory-query/filters/equals.filter";
import type { Comparator } from "@/packages/infrastructure/in-memory-query/comparators/comparator";
import { KeyComparator } from "@/packages/infrastructure/in-memory-query/comparators/key.comparator";
import { RankComparator } from "@/packages/infrastructure/in-memory-query/comparators/rank.comparator";
import { ReversedComparator } from "@/packages/infrastructure/in-memory-query/comparators/reversed.comparator";
import { ChainedComparator } from "@/packages/infrastructure/in-memory-query/comparators/chained.comparator";
import type { WantedItemsCriteria, WantedItemsDao } from "../../application/list-wanted-items/wanted-items.dao";
import type {
    WantedItemsSort,
    WantedItemsSortField,
} from "../../application/list-wanted-items/list-wanted-items.query";
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
import { MaxForType } from "../../domain/wanted-item/max-for/max-for";
import type { WantedItemRecord, WantedItemStoreInMemory } from "../stores/wanted-item.store.in-memory";

type WantedItemEntry = {
    record: WantedItemRecord;
    catalog: CatalogDetailsDto | null;
};

type EntryComparator = Comparator<WantedItemEntry>;

export class WantedItemsDaoInMemory implements WantedItemsDao {
    private static readonly MAX_FOR_TYPE_ORDER = [MaxForType.PERCENTAGE, MaxForType.VALUE];
    private static readonly UNKNOWN_TYPE_RANK = WantedItemsDaoInMemory.MAX_FOR_TYPE_ORDER.length;
    private static readonly NO_RARITY_RANK = -1;
    private static readonly BY_ADDED_AT: EntryComparator = new KeyComparator(({ record }) => record.addedAt);
    private static readonly NEWEST_FIRST = new ReversedComparator(WantedItemsDaoInMemory.BY_ADDED_AT);
    private static readonly FIELD_COMPARATORS: Record<WantedItemsSortField, EntryComparator> = {
        addedAt: WantedItemsDaoInMemory.BY_ADDED_AT,
        name: new KeyComparator(({ record }) => record.name),
        max: new ChainedComparator(
            new RankComparator(
                ({ record }) => record.maxFor.type,
                WantedItemsDaoInMemory.MAX_FOR_TYPE_ORDER,
                WantedItemsDaoInMemory.UNKNOWN_TYPE_RANK,
            ),
            new KeyComparator(({ record }) => Number(record.maxFor.value)),
        ),
        rarity: new RankComparator(
            ({ catalog }) => catalog?.rarity,
            RARITY_ORDER,
            WantedItemsDaoInMemory.NO_RARITY_RANK,
        ),
    };

    constructor(
        private readonly store: WantedItemStoreInMemory,
        private readonly catalog: CatalogDetailsGateway,
    ) {}

    async list(
        { accountId, filters, sort }: WantedItemsCriteria,
        pagination: Pagination,
    ): Promise<ListWantedItemsResponse> {
        const records = this.store.listOf(accountId);
        const enabledFilter = new EqualsFilter<WantedItemRecord, boolean>(({ enabled }) => enabled, filters?.enabled);
        const matching = records.filter((record) => enabledFilter.matches(record));
        const details = await this.catalog.findByNames(matching.map(({ name }) => name));
        const entries = matching.map((record) => this.toEntry(record, details));
        const page = PaginatorInMemory.paginate(this.sortBy(entries, sort), pagination);
        return { ...page, items: page.items.map((entry) => this.mapToDto(entry)), counts: this.countAll(records) };
    }

    private toEntry(record: WantedItemRecord, details: CatalogDetailsByName): WantedItemEntry {
        return { record, catalog: details.get(record.name) ?? null };
    }

    private sortBy(entries: WantedItemEntry[], sort: WantedItemsSort): WantedItemEntry[] {
        const comparator = this.comparatorFor(sort);
        return this.lastInsertedFirst(entries).toSorted((first, second) => comparator.compare(first, second));
    }

    private comparatorFor({ field, order }: WantedItemsSort): EntryComparator {
        const byField = this.inOrder(WantedItemsDaoInMemory.FIELD_COMPARATORS[field], order);
        return new ChainedComparator(byField, WantedItemsDaoInMemory.NEWEST_FIRST);
    }

    private inOrder(comparator: EntryComparator, order: SortOrder): EntryComparator {
        return order === DESCENDING ? new ReversedComparator(comparator) : comparator;
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
