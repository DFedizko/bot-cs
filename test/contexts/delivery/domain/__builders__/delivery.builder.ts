import { Delivery, type DeliveryProps } from "@/contexts/delivery/domain/delivery/delivery";
import { CS_APP_ID } from "@/contexts/shared-kernel/domain/cs-app-id";

export const TRADE_ID = 298883412;
export const ACCOUNT_ID = 303119;
export const ASSET_ID = "34511548711";
export const MARKET_NAME = "AK-47 | Redline (Field-Tested)";
export const SELLER_STEAM_ID = "76561198006409530";

export const deliveryProps = (overrides: Partial<DeliveryProps> = {}): DeliveryProps => ({
    tradeId: TRADE_ID,
    accountId: ACCOUNT_ID,
    expectedItem: { assetId: ASSET_ID, marketName: MARKET_NAME, appId: CS_APP_ID },
    sellerSteamId: SELLER_STEAM_ID,
    ...overrides,
});

export const delivery = (overrides: Partial<DeliveryProps> = {}): Delivery => Delivery.start(deliveryProps(overrides));
