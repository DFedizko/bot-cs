import type { WantedItem } from "../domain/wanted-item/wanted-item";

export interface WantedItemRepository {
    findByName(name: string): Promise<WantedItem | undefined>;
    save(wantedItem: WantedItem): Promise<void>;
}
