import type { SteamAcceptStatus, SteamOfferState, SteamTradeOffer } from "./steam-trade-offer";

export interface SteamTradeSession {
    getReceivedActiveOffers(): Promise<SteamTradeOffer[]>;
    getOfferState(offerId: string): Promise<SteamOfferState>;
    acceptOffer(offerId: string): Promise<SteamAcceptStatus>;
    cancelOffer(offerId: string): Promise<void>;
    confirmOffer(offerId: string): Promise<void>;
}
