import type { SteamAcceptStatus, SteamTradeOffer } from "./steam-trade-offer";

export interface SteamTradeSession {
    getReceivedActiveOffers(): Promise<SteamTradeOffer[]>;
    acceptOffer(offerId: string): Promise<SteamAcceptStatus>;
    cancelOffer(offerId: string): Promise<void>;
    confirmOffer(offerId: string): Promise<void>;
}
