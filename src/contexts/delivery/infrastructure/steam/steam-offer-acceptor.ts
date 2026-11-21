import type { SteamAcceptStatus } from "./steam-trade-offer";

export interface SteamOfferAcceptor {
    acceptOffer(offerId: string): Promise<SteamAcceptStatus>;
}
