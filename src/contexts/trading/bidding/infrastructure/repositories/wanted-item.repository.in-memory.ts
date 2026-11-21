import type { WantedItemRepository } from "../../application/wanted-item.repository";
import type { AccountId } from "../../domain/account/account-id";
import type { ItemName } from "../../domain/wanted-item/item-name";
import { WantedItem } from "../../domain/wanted-item/wanted-item";

const KEY_SEPARATOR = "/";

export class WantedItemRepositoryInMemory implements WantedItemRepository {
    private readonly store = new Map<string, WantedItem>();

    async findByName(accountId: AccountId, name: ItemName): Promise<WantedItem | undefined> {
        return this.store.get(this.buildKey(accountId.getValue(), name.getValue()));
    }

    async save(wantedItem: WantedItem): Promise<void> {
        this.store.set(this.buildKey(wantedItem.getAccountId(), wantedItem.getName()), wantedItem);
    }

    async removeByName(accountId: AccountId, name: ItemName): Promise<void> {
        this.store.delete(this.buildKey(accountId.getValue(), name.getValue()));
    }

    private buildKey(accountId: number, name: string): string {
        return [accountId, name].join(KEY_SEPARATOR);
    }
}
