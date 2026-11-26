import type { AccountId } from "@/contexts/shared-kernel/domain/account-id";
import type { ItemName } from "../domain/wanted-item/item-name";
import type { WantedItem } from "../domain/wanted-item/wanted-item";

export interface WantedItemRepository {
    findByName(accountId: AccountId, name: ItemName): Promise<WantedItem | undefined>;
    save(wantedItem: WantedItem): Promise<void>;
    removeByName(accountId: AccountId, name: ItemName): Promise<void>;
}
