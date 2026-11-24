import { PaginatorInMemory } from "@/packages/infrastructure/pagination/paginator.in-memory";
import type { Pagination } from "@/packages/building-blocks/pagination";
import type { WantedItemsDao, WantedItemsFilter } from "../../application/list-wanted-items/wanted-items.dao";
import type {
    ListWantedItemsResponse,
    WantedItemDto,
} from "../../application/list-wanted-items/list-wanted-items.response";
import type { WantedItemRecord, WantedItemStoreInMemory } from "../stores/wanted-item.store.in-memory";

export class WantedItemsDaoInMemory implements WantedItemsDao {
    constructor(private readonly store: WantedItemStoreInMemory) {}

    async list({ accountId, enabled }: WantedItemsFilter, pagination: Pagination): Promise<ListWantedItemsResponse> {
        const records = this.store.listOf(accountId).filter((record) => this.matchesEnabled(record, enabled));
        const page = PaginatorInMemory.paginate(records, pagination);
        return { ...page, items: page.items.map((record) => this.mapToDto(record)) };
    }

    private matchesEnabled(record: WantedItemRecord, enabled?: boolean): boolean {
        return enabled === undefined || record.enabled === enabled;
    }

    private mapToDto({ name, maxFor, criteria, enabled }: WantedItemRecord): WantedItemDto {
        return { name, maxFor: { ...maxFor }, criteria: criteria.map((criterion) => ({ ...criterion })), enabled };
    }
}
