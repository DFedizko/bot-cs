import { PaginatorInMemory } from "@/packages/infrastructure/pagination/paginator.in-memory";
import type { Pagination } from "@/packages/building-blocks/pagination";
import type { WantedItemsCriteria, WantedItemsDao } from "../../application/list-wanted-items/wanted-items.dao";
import type { WantedItemsSortKey } from "../../application/list-wanted-items/list-wanted-items.query";
import type {
    ListWantedItemsResponse,
    WantedItemDto,
} from "../../application/list-wanted-items/list-wanted-items.response";
import type { WantedItemRecord, WantedItemStoreInMemory } from "../stores/wanted-item.store.in-memory";

type Comparator = (first: WantedItemRecord, second: WantedItemRecord) => number;

const COMPARATORS = {
    name: (first, second) => first.name.localeCompare(second.name),
} satisfies Record<WantedItemsSortKey, Comparator>;

export class WantedItemsDaoInMemory implements WantedItemsDao {
    constructor(private readonly store: WantedItemStoreInMemory) {}

    async list(
        { accountId, filters, sort }: WantedItemsCriteria,
        pagination: Pagination,
    ): Promise<ListWantedItemsResponse> {
        const records = this.store.listOf(accountId).filter((record) => this.matchesEnabled(record, filters?.enabled));
        const page = PaginatorInMemory.paginate(this.sortBy(records, sort), pagination);
        return { ...page, items: page.items.map((record) => this.mapToDto(record)) };
    }

    private matchesEnabled(record: WantedItemRecord, enabled?: boolean): boolean {
        return enabled === undefined || record.enabled === enabled;
    }

    private sortBy(records: WantedItemRecord[], sort?: WantedItemsSortKey): WantedItemRecord[] {
        return sort ? records.toSorted(COMPARATORS[sort]) : records;
    }

    private mapToDto({ name, maxFor, criteria, enabled }: WantedItemRecord): WantedItemDto {
        return { name, maxFor: { ...maxFor }, criteria: criteria.map((criterion) => ({ ...criterion })), enabled };
    }
}
