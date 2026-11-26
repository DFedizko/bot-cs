import type { WantedItemRepository } from "../../application/wanted-item.repository";
import type { AccountId } from "@/contexts/shared-kernel/domain/account-id";
import type { ItemName } from "../../domain/wanted-item/item-name";
import { WantedItem } from "../../domain/wanted-item/wanted-item";
import type { WantedItemStoreInMemory } from "../stores/wanted-item.store.in-memory";

export class WantedItemRepositoryInMemory implements WantedItemRepository {
    constructor(private readonly store: WantedItemStoreInMemory) {}

    async findByName(accountId: AccountId, name: ItemName): Promise<WantedItem | undefined> {
        const record = this.store.find(accountId.getValue(), name.getValue());
        return record && WantedItem.fromPrimitives(record);
    }

    async save(wantedItem: WantedItem): Promise<void> {
        this.store.put(wantedItem.toPrimitives());
    }

    async removeByName(accountId: AccountId, name: ItemName): Promise<void> {
        this.store.remove(accountId.getValue(), name.getValue());
    }
}
