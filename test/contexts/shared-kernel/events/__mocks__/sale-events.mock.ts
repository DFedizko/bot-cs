import type { ItemSoldPayload } from "@/contexts/shared-kernel/events/item-sold.event";
import type { SaleOfferIdentity } from "@/contexts/shared-kernel/events/sale-offer-identity";

export const itemSoldPayload = (): ItemSoldPayload => ({
    accountId: 1234567,
    depositId: 987654,
    assetId: "36201592717",
    appId: 730,
    marketHashName: "AK-47 | Redline (Field-Tested)",
    buyerSteamId: "76561198000000001",
    tradeUrl: "https://steamcommunity.com/tradeoffer/new/?partner=39734273&token=abcd1234",
    deadline: "2026-11-26T12:30:00.000Z",
});

export const saleOfferIdentity = (): SaleOfferIdentity => ({
    accountId: 1234567,
    depositId: 987654,
    tradeOfferId: "7012345678",
});
