import type { AccountId } from "@/contexts/shared-kernel/domain/account-id";
import type { MarketHashName } from "@/contexts/shared-kernel/domain/market-hash-name";
import type { WantedItem } from "../domain/wanted-item/wanted-item";

export interface WantedItemRepository {
    findByName(accountId: AccountId, name: MarketHashName): Promise<WantedItem | undefined>;
    save(wantedItem: WantedItem): Promise<void>;
    removeByName(accountId: AccountId, name: MarketHashName): Promise<void>;
}
