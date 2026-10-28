import type { WantedItemRepository } from "../../application/wanted-item.repository";
import { WantedItem } from "../../domain/wanted-item/wanted-item";

export class WantedItemRepositoryInMemory implements WantedItemRepository {
    private readonly store = new Map<string, WantedItem>();

    async findByName(name: string): Promise<WantedItem | undefined> {
        return this.store.get(name);
    }

    async save(desiredSkin: WantedItem): Promise<void> {
        this.store.set(desiredSkin.getName(), desiredSkin);
    }
}
