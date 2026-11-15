import type { WantedItemRepository } from "../../application/wanted-item.repository";
import type { ItemName } from "../../domain/wanted-item/item-name";
import { WantedItem } from "../../domain/wanted-item/wanted-item";

export class WantedItemRepositoryInMemory implements WantedItemRepository {
    private readonly store = new Map<string, WantedItem>();

    async findByName(itemName: ItemName): Promise<WantedItem | undefined> {
        return this.store.get(itemName.getValue());
    }

    async save(wantedItem: WantedItem): Promise<void> {
        this.store.set(wantedItem.getName(), wantedItem);
    }
}
