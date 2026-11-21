import type { SteamTradeOffer } from "./steam-trade-offer";

export interface SteamReceivedOffers {
    getReceivedActiveOffers(): Promise<SteamTradeOffer[]>;
}
