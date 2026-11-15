import type { ItemName } from "../domain/wanted-item/item-name";
import type { WantedItem } from "../domain/wanted-item/wanted-item";

export interface WantedItemRepository {
    findByName(name: ItemName): Promise<WantedItem | undefined>;
    save(wantedItem: WantedItem): Promise<void>;
}
