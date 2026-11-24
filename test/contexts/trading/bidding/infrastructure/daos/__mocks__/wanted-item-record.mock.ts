import { WearName } from "@/contexts/shared-kernel/domain/wear-name";
import { ItemCriterionType } from "@/contexts/trading/bidding/domain/wanted-item/criteria/item-criterion";
import { maxForPercentage } from "@/contexts/trading/bidding/domain/wanted-item/__builders__/max-for.builder";
import { ADDED_AT } from "@/contexts/trading/bidding/domain/wanted-item/__builders__/wanted-item.builder";
import type { WantedItemRecord } from "@/contexts/trading/bidding/infrastructure/stores/wanted-item.store.in-memory";
import type { CatalogDetailsDto } from "@/contexts/trading/bidding/application/list-wanted-items/catalog-details.gateway";

export const ACCOUNT_ID = 1;
export const OTHER_ACCOUNT_ID = 2;
export const ASIIMOV = "AWP | Asiimov (Field-Tested)";
export const REDLINE = "AK-47 | Redline (Field-Tested)";
export const VULCAN = "AK-47 | Vulcan (Field-Tested)";
export const FIELD_TESTED = { type: ItemCriterionType.IS_WEAR, value: WearName.FIELD_TESTED };
export const ADDED_AT_ISO = new Date(ADDED_AT).toISOString();

type RecordOverrides = Partial<WantedItemRecord> & Pick<WantedItemRecord, "name">;

export const wantedItemRecord = (overrides: RecordOverrides): WantedItemRecord => ({
    accountId: ACCOUNT_ID,
    maxFor: maxForPercentage("-3"),
    criteria: [FIELD_TESTED],
    enabled: true,
    addedAt: ADDED_AT,
    ...overrides,
});

export const catalogDetails = (overrides: Partial<CatalogDetailsDto> = {}): CatalogDetailsDto => ({
    imageUrl: "https://community.akamai.steamstatic.com/economy/image/asiimov",
    rarity: "covert",
    weapon: "AWP",
    skin: "Asiimov",
    wear: WearName.FIELD_TESTED,
    stattrak: false,
    souvenir: false,
    ...overrides,
});
