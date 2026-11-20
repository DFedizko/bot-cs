import type { SteamEconItem, SteamTradeOffer } from "@/contexts/delivery/infrastructure/steam/steam-trade-offer";
import { STEAM_OFFER_STATE } from "@/contexts/delivery/infrastructure/steam/steam-trade-offer";
import { ASSET_ID, MARKET_NAME, SELLER_STEAM_ID } from "@/contexts/delivery/domain/__builders__/delivery.builder";
import { OFFER_ID } from "@/contexts/delivery/domain/__builders__/received-offer.builder";

export const OUR_ASSET_ID = "29384756102";
export const OTHER_OFFER_ID = "6745123999";

export const steamEconItem = (overrides: Partial<SteamEconItem> = {}): SteamEconItem => ({
    assetid: ASSET_ID,
    appid: 730,
    contextid: "2",
    classid: "310776560",
    instanceid: "302028390",
    amount: 1,
    name: "AK-47 | Redline",
    market_hash_name: MARKET_NAME,
    ...overrides,
});

export const steamTradeOffer = (overrides: Partial<SteamTradeOffer> = {}): SteamTradeOffer => ({
    id: OFFER_ID,
    partner: SELLER_STEAM_ID,
    state: STEAM_OFFER_STATE.ACTIVE,
    message: "",
    itemsToGive: [],
    itemsToReceive: [steamEconItem()],
    isOurOffer: false,
    isGlitched: false,
    escrowDays: 0,
    ...overrides,
});

export const scamOfferAskingOurItems = (): SteamTradeOffer =>
    steamTradeOffer({ id: OTHER_OFFER_ID, itemsToGive: [steamEconItem({ assetid: OUR_ASSET_ID })] });
